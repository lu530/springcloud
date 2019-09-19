package com.suntek.efacecloud.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.util.calendar.DateUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.ExcelFileUtil;
import com.suntek.efacecloud.util.FileDowloader;

import net.sf.json.JSONArray;

/**
 * @author ChenCaihua
 * @version 2017-06-28
 * @Copyright (C)2017, pcitech
 * @since jdk1.8
 */
@LocalComponent(id="face/excel")
public class ExcelFileExportService 
{
    @SuppressWarnings({ "unchecked", "serial" })
	@QueryService(id = "exportCapRecord", description="抓拍记录导出")
    public void exportCapRecord(RequestContext context) throws Exception 
    {
        Object excelData = context.getParameter("excelData");
        JSONArray excelDataJsonArray = JSONArray.fromObject(excelData);
        List<Map<String,Object>> excelDataList = new ArrayList<>();

        String[] headers = {"抓拍图片","全景图片","摄像机/录像文件名","抓拍时间"};
        String[] dataKey = {"capFaceImg","capFullImg","SRC_NAME","CAPTURE_TIME"};
        List<Map<String,byte[]>> imgList = new ArrayList<>();

        try {
			for (Object obj : excelDataJsonArray) {
				Map<String, Object> data = (Map<String, Object>) obj;
				byte[] capFaceImg = FileDowloader.getImageFromUrl(StringUtil.toString(data.get("CAP_FACE_IMAGE_URL")));
				byte[] capFullImg = FileDowloader.getImageFromUrl(StringUtil.toString(data.get("CAP_FULL_IMAGE_URL")));
				imgList.add(new HashMap<String, byte[]>() {
					{
						put("capFaceImg", capFaceImg);
						put("capFullImg", capFullImg);
					}
				});

				excelDataList.add(data);
			}
		} catch (Exception exception) {
			ServiceLog.error("exportCapRecord异常", exception);
			throw exception;
		}
 
        boolean returnCodeEnum = ExcelFileUtil.exportExcelFile2Req(
                "抓拍记录" + DateUtil.formatDate(DateUtil.getDateTime(), "yyyyMMddHHmmss"),
                headers, dataKey, excelDataList, imgList, context);

        if (!returnCodeEnum){
            context.getResponse().setError("导出失败！");
        }

        context.getResponse().setMessage("导出成功！");
    }

    @SuppressWarnings({ "unchecked", "serial" })
	@QueryService(id = "exportAlarmRecord", description="告警记录导出")
    public void exportAlarmRecord(RequestContext context) throws Exception 
    {
        Object excelData = context.getParameter("excelData");
        JSONArray excelDataJsonArray = JSONArray.fromObject(excelData);
        List<Map<String,Object>> excelDataList = new ArrayList<>();

        String[] headers = {"抓拍图片","注册图片","全景图片","摄像机/录像文件名","告警时间","相似度","用户姓名","库名称"};
        String[] dataKey = {"capFaceImg","registImg","capFullImg","SRC_NAME","SEARCH_TIME","SCORE","PERSON_NAME","GROUP_NAME"};
        List<Map<String,byte[]>> imgList = new ArrayList<>();

        for (Object obj:excelDataJsonArray){
            Map<String,Object> data =(Map<String,Object>)obj;

            try {
                byte[] capFaceImg = FileDowloader.getImageFromUrl(StringUtil.toString(data.get("CAP_FACE_IMAGE_URL")));
                byte[] registImg = FileDowloader.getImageFromUrl(StringUtil.toString(data.get("REG_IMAGE_URL")));
                byte[] capFullImg = FileDowloader.getImageFromUrl(StringUtil.toString(data.get("CAP_FULL_IMAGE_URL")));

                imgList.add(new HashMap<String,byte[]>(){{
                    put("capFaceImg", capFaceImg);
                    put("registImg", registImg);
                    put("capFullImg", capFullImg);
                }});
                
                String score = (Float.parseFloat(StringUtil.toString(data.get("SCORE")))*100) +"";
                score = score.substring(0,2) + "%";
                data.put("SCORE",score);
                
                excelDataList.add(data);
            }
            catch (Exception exception) {
                ServiceLog.error("exportCapRecord异常",exception);
                throw exception;
            }
        }

        boolean returnCodeEnum = ExcelFileUtil.exportExcelFile2Req(
                "告警记录" + DateUtil.formatDate(DateUtil.getDateTime(), "yyyyMMddHHmmss"),
                headers,  dataKey, excelDataList, imgList, context);

        if (!returnCodeEnum){
            context.getResponse().setError("导出失败！");
        }

        context.getResponse().setMessage("导出成功！");
    }

    @SuppressWarnings({ "unchecked", "serial" })
	@QueryService(id = "exportFaceSearch", description="检索记录导出")
    public void exportFaceSearch(RequestContext context) throws Exception 
    {
        Object excelData = context.getParameter("excelData");
        JSONArray excelDataJsonArray = JSONArray.fromObject(excelData);
        List<Map<String,Object>> excelDataList = new ArrayList<>();

        String[] headers = {"检索图片","匹配图片","相似度","摄像机/录像文件名","抓拍时间","用户姓名","用户性别","出生时间"};
        String[] dataKey = {"searchImgUrl","imageUrl","SCORE","CAMERA_NAME","TIME","PERSON_NAME","GENDER","BIRTHDAY"};
        List<Map<String,byte[]>> imgList = new ArrayList<>();

        try {
        	for (Object obj:excelDataJsonArray){
	            Map<String,Object> data =(Map<String,Object>)obj;
                byte[] searchImgUrl = FileDowloader.getImageFromUrl(StringUtil.toString(data.get("SEARCH_IMG_URL")));
                byte[] imageUrl = FileDowloader.getImageFromUrl(StringUtil.toString(data.get("IMAGE_URL")));
                imgList.add(new HashMap<String,byte[]>(){{
                    put("searchImgUrl", searchImgUrl);
                    put("imageUrl", imageUrl);
                }});
                
                String score = (Float.parseFloat(StringUtil.toString(data.get("SCORE")))*100) +"";
                score = score.substring(0,2) + "%";
                data.put("SCORE",score);
               
                excelDataList.add(data);
        	}
        }  catch (Exception exception) {
            ServiceLog.error("exportCapRecord异常",exception);
            throw exception;
        }

        boolean returnCodeEnum = ExcelFileUtil.exportExcelFile2Req(
                "检索结果" + DateUtil.formatDate(DateUtil.getDateTime(), "yyyyMMddHHmmss"),
                headers, dataKey,  excelDataList, imgList,  context);

        if (!returnCodeEnum){
            context.getResponse().setError("导出失败！");
        }

        context.getResponse().setMessage("导出成功！");
    }
}
