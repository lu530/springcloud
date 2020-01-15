package com.suntek.efacecloud.util;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFClientAnchor;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFPatriarch;
import org.apache.poi.hssf.usermodel.HSSFRichTextString;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.Workbook;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

/**
 * @author ChenCaihua
 * @version 2017-06-28
 * @since jdk1.8
 */
public class ExcelFileUtil {
    /**
     * 导出excel文件到http请求中
     *
     * @param title     excel文件名称
     * @param headers   excel各列名称
     * @param dataKey   excel各列数据在map中的key
     * @param excelData 待写入excel的数据
     * @param imgList   导出图片的数据key
     * @param context   请求上下文
     * @return
     */
    public static boolean exportExcelFile2Req(String title, String[] headers, String[] dataKey,
                                              List<Map<String, Object>> excelData, List<Map<String, byte[]>> imgList, RequestContext context) {
        HttpServletResponse response = context.getHttpResponse();
        response.setCharacterEncoding("utf-8");
        response.setContentType("application/vnd.ms-excel");
        response.setHeader("Content-Disposition", "attachment;fileName=" + title);
        try {
            HSSFWorkbook workbook = exportExcel2Stream(title, headers, dataKey, excelData, imgList);
            outputExcelToReqContext(title + ".xls", workbook, context);
        } catch (Exception e) {
            ServiceLog.error("ExcelFileUtil.exportExcelFile2Req导出excel文件异常", e);
            return false;
        }
        return true;
    }

    /**
     * 导出excel到指定的流
     *
     * @param title     excel文件名称
     * @param headers   excel各列名称
     * @param dataKey   excel各列数据在map中的key
     * @param excelData 待写入excel的数据
     */
    private static HSSFWorkbook exportExcel2Stream(String title, String[] headers, String[] dataKey,
                                                   List<Map<String, Object>> excelData, List<Map<String, byte[]>> imgList) {
        HSSFWorkbook workbook = new HSSFWorkbook();
        HSSFSheet sheet = workbook.createSheet(title);

        // 设置表格默认列宽度为30个字节
        sheet.setDefaultColumnWidth(30);

        // 生成一个样式
        HSSFCellStyle style = workbook.createCellStyle();

        // 设置这些样式
        style.setFillForegroundColor(HSSFColor.SKY_BLUE.index);
        style.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
        style.setBorderBottom(HSSFCellStyle.BORDER_THIN);
        style.setBorderLeft(HSSFCellStyle.BORDER_THIN);
        style.setBorderRight(HSSFCellStyle.BORDER_THIN);
        style.setBorderTop(HSSFCellStyle.BORDER_THIN);
        style.setAlignment(HSSFCellStyle.ALIGN_CENTER);

        // 生成一个字体
        HSSFFont font = workbook.createFont();
        font.setColor(HSSFColor.VIOLET.index);
        font.setFontHeightInPoints((short) 12);
        font.setBoldweight(HSSFFont.BOLDWEIGHT_BOLD);

        // 把字体应用到当前的样式
        style.setFont(font);

        // 生成并设置另一个样式
        HSSFCellStyle style2 = workbook.createCellStyle();
        style2.setFillForegroundColor(HSSFColor.LIGHT_YELLOW.index);
        style2.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
        style2.setBorderBottom(HSSFCellStyle.BORDER_THIN);
        style2.setBorderLeft(HSSFCellStyle.BORDER_THIN);
        style2.setBorderRight(HSSFCellStyle.BORDER_THIN);
        style2.setBorderTop(HSSFCellStyle.BORDER_THIN);
        style2.setAlignment(HSSFCellStyle.ALIGN_CENTER);
        style2.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);

        // 生成另一个字体
        HSSFFont font2 = workbook.createFont();
        font2.setBoldweight(HSSFFont.BOLDWEIGHT_NORMAL);

        // 把字体应用到当前的样式
        style2.setFont(font2);

        // 声明一个画图的顶级管理器
        HSSFPatriarch patriarch = sheet.createDrawingPatriarch();

        // 产生表格标题行
        HSSFRow row = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            HSSFCell cell = row.createCell(i);
            cell.setCellStyle(style);
            HSSFRichTextString text = new HSSFRichTextString(headers[i]);
            cell.setCellValue(text);
        }

        // 遍历集合数据，产生数据行
        Iterator<Map<String, Object>> excelDataIte = excelData.iterator();
        boolean isNotEmptyImg = null != imgList && imgList.size() > 0;
        int excelDataIteIndex = 0;
        try {
            while (excelDataIte.hasNext()) {
                excelDataIteIndex++;
                row = sheet.createRow(excelDataIteIndex);
                Map<String, Object> excelDataMap = (Map<String, Object>) excelDataIte.next();
                for (int dataKeyIndex = 0; dataKeyIndex < dataKey.length; dataKeyIndex++) {
                    HSSFCell cell = row.createCell(dataKeyIndex);
                    cell.setCellStyle(style2);
                    String excelDataMapKey = dataKey[dataKeyIndex];
                    Object value = excelDataMap.get(excelDataMapKey);
                    if (isNotEmptyImg && imgList.get(0).containsKey(excelDataMapKey)) {
                        // 设置行高为60px;
                        row.setHeightInPoints(60);
                        // 设置图片所在列宽度为80px
                        sheet.setColumnWidth(dataKeyIndex, (short) (35.7 * 80));
                        byte[] bsValue = imgList.get(excelDataIteIndex - 1).get(excelDataMapKey);
                        HSSFClientAnchor anchor = new HSSFClientAnchor(0, 0,
                                1023, 255, (short) dataKeyIndex,
                                excelDataIteIndex, (short) dataKeyIndex,
                                excelDataIteIndex);
                        anchor.setAnchorType(2);
                        patriarch.createPicture(anchor, workbook.addPicture(bsValue, HSSFWorkbook.PICTURE_TYPE_JPEG));
                    } else {
                        cell.setCellValue(StringUtil.toString(value));
                    }
                }
            }
        } catch (Exception e) {
            ServiceLog.error("ExcelFileUtil.exportExcel2Stream异常 ", e);
            throw e;
        }
        return workbook;
    }

    /**
     * @param fileName 输入的文件名，比如"日志.xls"
     * @param workbook excel的workbook
     * @param context  请求上下文
     * @throws IOException
     * @Title: outputExcelToReqContext
     * @Description: 把execl文件输出到RequestContext
     * @return: void
     */
    public static void outputExcelToReqContext(String fileName,
                                               Workbook workbook, RequestContext context) throws IOException {

        ServiceLog.debug("LogReportService.download --> 输出excel");
        HttpServletResponse response = context.getHttpResponse();
        response.setContentType("application/vnd.ms-excel");
        response.setHeader(
                "Content-disposition",
                "attachment;success=true;filename ="
                        + URLEncoder.encode(fileName, "utf-8"));

        try (OutputStream output = response.getOutputStream()) {
            workbook.write(output);
            output.flush();
        } catch (Exception e) {
            ServiceLog.error(
                    "LogReportService.download --> error:" + e.getMessage(), e);
        }
    }

    /**
     * 导出excel文件到http请求中
     *
     * @param title     excel文件名称
     * @param headers   excel各列名称
     * @param dataKey   excel各列数据在map中的key
     * @param excelData 待写入excel的数据
     * @param imgList   导出图片的数据key
     * @param context   请求上下文
     * @return
     */
    public static boolean exportExcelFileWithMultiImg2Req(String title, String[] headers, String[] dataKey,
                                                          List<Map<String, Object>> excelData, List<Map<String, byte[]>> imgList, RequestContext context) {
        HttpServletResponse response = context.getHttpResponse();
        response.setCharacterEncoding("utf-8");
        response.setContentType("application/vnd.ms-excel");
        response.setHeader("Content-Disposition", "attachment;fileName=" + title);
        try {
            HSSFWorkbook workbook = exportExcelWithImg2Stream(title, headers, dataKey, excelData, imgList);
            outputExcelToReqContext(title + ".xls", workbook, context);
        } catch (Exception e) {
            ServiceLog.error("ExcelFileUtil.exportExcelFile2Req导出excel文件异常", e);
            return false;
        }

        return true;
    }

    /**
     * 导出excel到指定的流
     *
     * @param title     excel文件名称
     * @param headers   excel各列名称
     * @param dataKey   excel各列数据在map中的key
     * @param excelData 待写入excel的数据
     */
    private static HSSFWorkbook exportExcelWithImg2Stream(String title, String[] headers, String[] dataKey,
                                                          List<Map<String, Object>> excelData, List<Map<String, byte[]>> imgList) {
        HSSFWorkbook workbook = new HSSFWorkbook();
        HSSFSheet sheet = workbook.createSheet(title);

        // 设置表格默认列宽度为30个字节
        sheet.setDefaultColumnWidth(30);

        // 生成一个样式
        HSSFCellStyle style = workbook.createCellStyle();

        // 设置这些样式
        style.setFillForegroundColor(HSSFColor.SKY_BLUE.index);
        style.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
        style.setBorderBottom(HSSFCellStyle.BORDER_THIN);
        style.setBorderLeft(HSSFCellStyle.BORDER_THIN);
        style.setBorderRight(HSSFCellStyle.BORDER_THIN);
        style.setBorderTop(HSSFCellStyle.BORDER_THIN);
        style.setAlignment(HSSFCellStyle.ALIGN_CENTER);

        // 生成一个字体
        HSSFFont font = workbook.createFont();
        font.setColor(HSSFColor.VIOLET.index);
        font.setFontHeightInPoints((short) 12);
        font.setBoldweight(HSSFFont.BOLDWEIGHT_BOLD);

        // 把字体应用到当前的样式
        style.setFont(font);

        // 生成并设置另一个样式
        HSSFCellStyle style2 = workbook.createCellStyle();
        style2.setFillForegroundColor(HSSFColor.LIGHT_YELLOW.index);
        style2.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
        style2.setBorderBottom(HSSFCellStyle.BORDER_THIN);
        style2.setBorderLeft(HSSFCellStyle.BORDER_THIN);
        style2.setBorderRight(HSSFCellStyle.BORDER_THIN);
        style2.setBorderTop(HSSFCellStyle.BORDER_THIN);
        style2.setAlignment(HSSFCellStyle.ALIGN_CENTER);
        style2.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);

        // 生成另一个字体
        HSSFFont font2 = workbook.createFont();
        font2.setBoldweight(HSSFFont.BOLDWEIGHT_NORMAL);

        // 把字体应用到当前的样式
        style2.setFont(font2);

        // 声明一个画图的顶级管理器
        HSSFPatriarch patriarch = sheet.createDrawingPatriarch();

        // 产生表格标题行
        HSSFRow row = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            HSSFCell cell = row.createCell(i);
            cell.setCellStyle(style);
            HSSFRichTextString text = new HSSFRichTextString(headers[i]);
            cell.setCellValue(text);
        }

        // 遍历集合数据，产生数据行
        Iterator<Map<String, Object>> excelDataIte = excelData.iterator();
        boolean isNotEmptyImg = null != imgList && imgList.size() > 0;
        int excelDataIteIndex = 0;
        try {
            while (excelDataIte.hasNext()) {
                excelDataIteIndex++;
                row = sheet.createRow(excelDataIteIndex);
                Map<String, Object> excelDataMap = (Map<String, Object>) excelDataIte.next();
                for (int dataKeyIndex = 0; dataKeyIndex < dataKey.length; dataKeyIndex++) {
                    HSSFCell cell = row.createCell(dataKeyIndex);
                    cell.setCellStyle(style2);
                    String excelDataMapKey = dataKey[dataKeyIndex];
                    Object value = excelDataMap.get(excelDataMapKey);
                    if (isNotEmptyImg && imgList.get(0).containsKey(excelDataMapKey)) {
                        Set<Entry<String, byte[]>> entrySet = imgList.get(excelDataIteIndex - 1).entrySet();
                        int cellIndex = dataKeyIndex;
                        for (Map.Entry<String, byte[]> entry : entrySet) {
                            // 设置行高为60px;
                            row.setHeightInPoints(60);
                            // 设置图片所在列宽度为80px
                            sheet.setColumnWidth(cellIndex, (short) (35.7 * 80));
                            byte[] bsValue = entry.getValue();
                            if (bsValue.length > 0) {
                                HSSFClientAnchor anchor = new HSSFClientAnchor(0, 0,
                                        1023, 255, (short) cellIndex,
                                        excelDataIteIndex, (short) cellIndex,
                                        excelDataIteIndex);
                                anchor.setAnchorType(2);
                                patriarch.createPicture(anchor, workbook.addPicture(bsValue, HSSFWorkbook.PICTURE_TYPE_JPEG));
                                cellIndex++;
                            } else {
                                cell.setCellValue("暂无图片");
                            }
                        }
                    } else {
                        cell.setCellValue(StringUtil.toString(value));
                    }
                }
            }
        } catch (Exception e) {
            ServiceLog.error("ExcelFileUtil.exportExcel2Stream异常 ", e);
            throw e;
        }
        return workbook;
    }
}
