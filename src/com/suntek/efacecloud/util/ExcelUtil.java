package com.suntek.efacecloud.util;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
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
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.suntek.eap.EAP;
import com.suntek.eap.blob.BlobStore;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.util.ZipUtil;
import com.suntek.efacecloud.model.ExcelColumn;

/**
 * excel导出工具
 * 
 * @since 3.0.0
 * @author wangsh
 * @version 2017-07-24
 * Copyright (C)2017 , Suntektech
 */
public class ExcelUtil {
    
	/**
	 * 导出excel
	 * 
	 * @param sheetName
	 *            表格名称
	 * @param data
	 *            待写入excel的数据
	 * @param columns
	 *            表格各列信息
	 * @return true 导出成功; false or throw Exception 导出失败
	 * @throws Exception
	 */
	@SuppressWarnings({ "unchecked", "serial" })
	public static boolean export(String sheetName, List<ExcelColumn> columns, List<Map<String, Object>> data,
			HttpServletResponse response) throws Exception {

		String[] dataKey = new String[columns.size()];
		List<String> imgArray = new ArrayList<String>();
		for (int i = 0; i < columns.size(); i++) {
			dataKey[i] = columns.get(i).getKey();
			if (columns.get(i).isImg()) {
				imgArray.add(dataKey[i]);
			}
		}

		List<Map<String, byte[]>> imgList = new ArrayList<>();
		List<Map<String, Object>> excelDataList = new ArrayList<>();

		try {
			for (Object dataline : data) {
				Map<String, Object> currentData = (Map<String, Object>) dataline;
				for (Object imgKeyObj : imgArray) {
					String imgKey = StringUtil.toString(imgKeyObj);

					byte[] capFaceImg = FileDowloader.getImageFromUrl(StringUtil.toString(currentData.get(imgKey)));
					imgList.add(new HashMap<String, byte[]>() {
						{
							put(imgKey, capFaceImg);
						}
					});
				}
				excelDataList.add(currentData);
			}
		} catch (Exception e) {
			ServiceLog.error("ExcelUtil imgs download error", e);
			throw e;
		}

		try {
			response.setCharacterEncoding("utf-8");
			response.setContentType("application/vnd.ms-excel");
			response.setHeader("Content-Disposition", "attachment;fileName=" + sheetName);
			HSSFWorkbook workbook = exportExcel2Stream(sheetName, columns, dataKey, excelDataList, imgList);
			outputExcelToReqContext(sheetName + ".xls", workbook, response);
		} catch (Exception e) {
			return false;
		}

		return true;
	}

	/**
	 * 从excel文件导入用户数据，转为List
	 * @param zipPath-用户上传的zip文件的路径
	 * @param unZipPath 解压后输出文件的路径，可使用context.getHttpRequest().getServletContext
     *            ().getRealPath("/")，工程根目录下的文件夹
	 * @param columns -表结构的定义
	 * @return
	 * @throws Exception
	 */
	public static List<Map<String, Object>> importFromLocal(String zipPath, String unZipPath, List<ExcelColumn> columns)
			throws Exception {
		
		//判断是否是远程文件地址
		if(zipPath.toLowerCase().indexOf("http://") == 0){
			String timeStamp = DateUtil.toString(new Date());
			FileDowloader.downloadFile(zipPath, unZipPath+"/zip-"+timeStamp+".zip");
			zipPath =  unZipPath+"/zip-"+timeStamp+".zip";
		}

		// 解压文件
		ZipUtil.deCompress(zipPath, unZipPath);
		File unZipFileDir = new File(unZipPath);

		// 定义用于存储图片的map和最终输出数据的list
		Map<String, Object> imgMap = new HashMap<String, Object>();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();

		// 遍历解压后的文件夹里的所有文件
		for (File file : unZipFileDir.listFiles()) {
			String fileName = file.getName();
			if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
				// 如果是Excel表格文件，从中读取全部数据
				try {
					list = readXlsx(file, columns);
				} catch (IOException e) {
					ServiceLog.error("读取xlsx文件失败", e);
					deleteFiles(unZipFileDir,zipPath);
					throw e;
				}
			} else if (file.isFile()) {
				// 如果是图片文件，将图片读入缓存
				try {
					// FileInputStream input = new FileInputStream(file);
					readImg(file, imgMap, fileName);
				} catch (Exception e) {
					ServiceLog.error("读取图片文件" + fileName + "失败", e);
					deleteFiles(unZipFileDir,zipPath);
					throw e;
				}
			}
		}

		// 删除压缩文件和解压后的本地文件
		deleteFiles(unZipFileDir,zipPath);

		if (list.size() > 0) {
			// 遍历数据列表，将数据中的图片文件路径替换为图片在blobstore中的ID
			Map<String, Boolean> isImgMap = extractIsImg(columns);
			for (Map<String, Object> mapData : list) {
				for (Map.Entry<String, Object> data : mapData.entrySet()) {
					if (isImgMap.get(data.getKey())) {
						mapData.put(data.getKey(), imgMap.get(data.getValue()));
					}
				}
			}
		}
		return list;
	}
	
	private static void deleteFiles(File unZipFileDir, String zipPath){
		try {
			FileUtils.deleteDirectory(unZipFileDir);
		} catch (IOException e) {
			ServiceLog.error("删除解压目录" + unZipFileDir + "出错", e);
		}
		try {
			FileUtils.forceDelete(new File(zipPath));
		} catch (IOException e) {
			ServiceLog.error("删除zip文件" + zipPath + "出错", e);
		}
	}

	private static HSSFWorkbook exportExcel2Stream(String title, List<ExcelColumn> columns , String[] dataKey,
			List<Map<String, Object>> excelData, List<Map<String, byte[]>> imgList) {
		String[] headers = columns.stream().map(o->o.getHeader()).collect(Collectors.toList()).toArray(new String[columns.size()]);
		
		HSSFWorkbook workbook = new HSSFWorkbook();
		HSSFSheet sheet = workbook.createSheet(title);

		// 设置表格默认列宽度为15个字节
		sheet.setDefaultColumnWidth(15);
		for(int i = 0; i < columns.size(); i++) {
			ExcelColumn col = columns.get(i);
			if (col.getWidth() > 0) {
				sheet.setColumnWidth(i, col.getWidth() * 256);
			}
		}

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
					if (null != imgList && imgList.size() > 0 && imgList.get(0).containsKey(excelDataMapKey)) {
						// 设置行高为60px;
						row.setHeightInPoints(60);
						// 设置图片所在列宽度为80px
						sheet.setColumnWidth(dataKeyIndex, (short) (35.7 * 80));
						byte[] bsValue = imgList.get(excelDataIteIndex - 1).get(excelDataMapKey);
						HSSFClientAnchor anchor = new HSSFClientAnchor(0, 0, 1023, 255, (short) dataKeyIndex,
								excelDataIteIndex, (short) dataKeyIndex, excelDataIteIndex);
						anchor.setAnchorType(2);
						patriarch.createPicture(anchor, workbook.addPicture(bsValue, HSSFWorkbook.PICTURE_TYPE_JPEG));
					} else {
						cell.setCellValue(StringUtil.toString(value));
					}
				}
			}
		} catch (Exception e) {
			ServiceLog.error("ExcelUtil exportExcel2Stream error ", e);
			throw e;
		}

		return workbook;
	}

	public static void outputExcelToReqContext(String fileName, HSSFWorkbook workbook, HttpServletResponse response)
			throws Exception {

		ServiceLog.debug("ExcelUtil write workbook...");
		response.setContentType("application/vnd.ms-excel");
		response.setHeader("Content-disposition",
				"attachment;success=true;filename =" + URLEncoder.encode(fileName, "utf-8"));

		try (OutputStream output = response.getOutputStream()) {
			workbook.write(output);
			output.flush();
		} catch (Exception e) {
			ServiceLog.error("ExcelUtil write workbook error:" + e.getMessage(), e);
		}
	}

	// 解析xlsx文件，获得数据列表
	private static List<Map<String, Object>> readXlsx(File file, List<ExcelColumn> columns) throws IOException {
		Workbook workbook = null;
		try {
			workbook = new XSSFWorkbook(new FileInputStream(file));
		} catch (Exception ex) {
			workbook = new HSSFWorkbook(new FileInputStream(file));
		}
		Sheet sheet = workbook.getSheetAt(0);
		Row headerRow = sheet.getRow(0);
		int columnNumber = headerRow.getPhysicalNumberOfCells();
		Map<String, String> scheme = extractScheme(columns);
		String[] keys = new String[columnNumber];
		for (int i = 0; i < columnNumber; i++) {
			String header = headerRow.getCell(i).getStringCellValue();
			keys[i] = scheme.get(header);
		}
		int rowNumber = sheet.getLastRowNum();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		for (int i = 1; i <= rowNumber; i++) {
			Map<String, Object> rowMap = new HashMap<String, Object>();
			Row row = sheet.getRow(i);
			for (int j = 0; j < columnNumber; j++) {
				rowMap.put(keys[j], row.getCell(j).getStringCellValue());
			}
			list.add(rowMap);
		}
		return list;
	}

	// 解析表结构，获得header与key的对应关系
	private static Map<String, String> extractScheme(List<ExcelColumn> columns) {
		Map<String, String> map = new HashMap<String, String>();
		for (int i = 0; i < columns.size(); i++) {
			map.put(columns.get(i).getHeader(), columns.get(i).getKey());
		}
		return map;
	}

	// 解析表结构，获得key的属性（是否为图片）
	private static Map<String, Boolean> extractIsImg(List<ExcelColumn> columns) {
		Map<String, Boolean> map = new HashMap<String, Boolean>();
		for (int i = 0; i < columns.size(); i++) {
			if (columns.get(i) != null) {
				map.put(columns.get(i).getKey(), columns.get(i).isImg());
			}
		}
		return map;
	}


	// 从输入流中读取图片，存入blobstore，将图片在blobstore中的id存入map
	private static void readImg(File file, Map<String, Object> imgMap, String fileName) throws Exception {
		FileInputStream input = new FileInputStream(file);
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		try {
			byte[] buffer = new byte[1024];
			int bytesRead = 0;
			while ((bytesRead = input.read(buffer)) != -1) {
				output.write(buffer, 0, bytesRead);
			}
			byte[] data = output.toByteArray();
			BlobStore blobStore = EAP.blob.getStore();
			InputStream in = new ByteArrayInputStream(data);
			String fileType = fileName.substring(fileName.lastIndexOf(".") + 1);
			String picId = blobStore.put(in, fileType);
			imgMap.put(fileName, picId);
		} finally {
			input.close();
			output.close();
		}
	}
}
