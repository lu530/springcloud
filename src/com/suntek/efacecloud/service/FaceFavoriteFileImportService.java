package com.suntek.efacecloud.service;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;

import com.suntek.eap.EAP;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceFavoriteFileDao;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.FileUploadUtil;
import com.suntek.efacecloud.util.PersonImportUtil;

/**
 * 我的收藏文件导入服务
 * efacecloud/rest/v6/face/favoriteFile
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/favoriteFile")
public class FaceFavoriteFileImportService 
{
	private FaceFavoriteFileDao dao = new FaceFavoriteFileDao();
	
	private static Map<String,String> importErrorMsgCache = new HashMap<String,String>();
	
	@BeanService(id="import",description="我的收藏文件导入")
	public void importArchives(RequestContext context)
	{
		try {
			String webAppPath = context.getHttpRequest().getServletContext().getRealPath("/");
			
			String unZipPath = webAppPath + "unZip";  //解压缩路径
			
			String saveFileName = EAP.keyTool.getUUID() + ".zip";   //上传文件存储名称
			
			Map<String,String> fileMap = FileUploadUtil.saveFile(context, webAppPath, saveFileName);
			
			List<Map<String,Object>> successList = new ArrayList<Map<String,Object>>();
			
			List<String> failList = new ArrayList<String>();
			
			String personTags = StringUtil.toString(fileMap.get("PERSON_TAG"));
			String favoriteId = StringUtil.toString(fileMap.get("FAVORITE_ID"));
			
			String zipPath = webAppPath + File.separator + saveFileName;
			if (!new File(zipPath).isFile()) {
				context.getResponse().setWarn("上传文件为空");
				return;
			}
			
			PersonImportUtil.getPersonImportList(webAppPath + File.separator + saveFileName, unZipPath, successList, failList);
			
			int successCount = 0;
			
			for (Map<String, Object> successMap : successList) {
				/*FeatureResp featureResp = FaceFeatureUtil.faceQualityCheck(ModuleUtil.renderImage(StringUtil.toString(successMap.get("PIC"))));
				if (!featureResp.isValid()) {
					failList.add(successMap.get("FILE_NAME") + "人脸质量检测失败\n");
					ServiceLog.error("人脸质量检测不通过，原因：" + featureResp.getErrorMsg());
					continue;
				}*/
				
				successMap.put("PERSON_TAG", personTags);
				successMap.put("FILE_ID", EAP.keyTool.getUUID());
				successMap.put("CREATOR", context.getUserCode());
				successMap.put("CREATE_TIME", DateUtil.getDateTime());
				successMap.put("FILE_SOURCE", 2);
				successMap.put("FAVORITE_ID", favoriteId);
				successMap.put("SOURCE_DB_ID", "");
				successMap.put("SOURCE_DB_NAME", "");
				successMap.put("DISPATCHED_DB_ID", "");
				successMap.put("DISPATCHED_DB_NAME", "");
				successMap.put("DEVICE_ID", "");
				successMap.put("INFO_ID", "");
				successMap.put("DEVICE_NAME", "");
				successMap.put("CAPTURE_TIME", "");
				successMap.put("CAPTURE_PIC", "");
				try {
					dao.insertFavoriteFile(successMap);
					successCount++;
				} catch (Exception e) {
					failList.add(successMap.get("FILE_NAME") + "写入数据库失败\n");
				}
			}
			
			context.getResponse().putData("SUCCESS_COUNT", successCount);
			context.getResponse().putData("FAIL_COUNT", failList.size());
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			if (failList.size() > 0) {
				String timeStamp = StringUtil.toString(Calendar.getInstance().getTimeInMillis());
				importErrorMsgCache.put(timeStamp, StringUtils.join(failList.toArray(new String[failList.size()]),"\n"));
				context.getResponse().putData("ERROR_FILE_ID", timeStamp);
			}
		} catch (Exception e) {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "内部错误，请联系运维人员处理");
			ServiceLog.error(e);
		}
		
	}
	
	@BeanService(id="exportErrorMsg",description="导出导入时的错误信息")
	public void exportImportErrorMsg(RequestContext context) throws Exception
	{
		String errorFileId = StringUtil.toString(context.getParameter("ERROR_FILE_ID"));
		OutputStream os = null;
		
		try {
			HttpServletResponse response = context.getHttpResponse();
			response.setHeader(
					"Content-disposition",
					"attachment;success=true;filename =" + URLEncoder.encode("errorMsg.txt", "utf-8"));
        	os = response.getOutputStream();
        	os.write(importErrorMsgCache.get(errorFileId).getBytes());
		} catch (IOException e) {
			ServiceLog.error("导出错误信息异常->" + e.getMessage());
		} finally {
			if (null != os) {
				os.close();
			}
		}
	}
}
