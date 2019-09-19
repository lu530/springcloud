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
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.FaceTerminalDao;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.FileUploadUtil;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.efacecloud.util.PersonImportUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * 移动终端库导入导出服务
 * efacecloud/rest/v6/face/terminal
 * @author gaos
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/terminal")
public class FaceTerminalImportService 
{
	private FaceTerminalDao dao = new FaceTerminalDao();
	
	private static Map<String,String> importErrorMsgCache = new HashMap<String,String>();
	
	@BeanService(id="import",description="移动终端库导入")
	public void importArchives(RequestContext context)
	{
		try {
			String webAppPath = context.getHttpRequest().getServletContext().getRealPath("/");
			String dbId = StringUtil.toString(EAP.metadata.getDictValue(Constants.DICT_KIND_STATIC_LIB, Constants.DICT_CODE_STATIC_LIB_TERMINAL));
			String unZipPath = webAppPath + "unZip";  //解压缩路径
			
			String saveFileName = EAP.keyTool.getUUID() + ".zip";   //上传文件存储名称
			
			Map<String,String> fileMap = FileUploadUtil.saveFile(context, webAppPath, saveFileName);
			
			List<Map<String,Object>> successList = new ArrayList<Map<String,Object>>();
			
			List<String> failList = new ArrayList<String>();
			
			String personTags = StringUtil.toString(fileMap.get("PERSON_TAG"));
			
			String zipPath = webAppPath + File.separator + saveFileName;
			if (!new File(zipPath).isFile()) {
				context.getResponse().setWarn("上传文件为空");
				return;
			}
			
			PersonImportUtil.getPersonImportList(webAppPath + File.separator + saveFileName, unZipPath, successList, failList);
			
			int successCount = 0;
			
			//包含字段IDENTITY_TYPE，IDENTITY_ID，PRESENT_ADDRESS，PIC，QQ，TELEPHONE，WECHAT，WORK_ADDRESS，NAME，BIRTHDAY，PERMANENT_ADDRESS，SEX
			//应该含PERSON_TAG
			
			CommandContext ctx = new CommandContext(context.getHttpRequest());
			ctx.setUserCode(context.getUserCode());
			ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());	
			
			for (Map<String, Object> successMap : successList) {
				successMap.put("PERSON_TAG", personTags);
				successMap.put("ALGO_TYPE", ModuleUtil.getAlgoTypeList());
				successMap.put("DB_ID", dbId);
				successMap.put("CREATOR", context.getUserCode());
				successMap.put("CREATE_TIME",DateUtil.getDateTime());
				
				ctx.setBody(successMap);
				Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceAdd.getUri()).exec(ctx);
				if (ctx.getResponse().getCode() == 0) {
					String personId = StringUtil.toString(ctx.getResponse().getData("PERSON_ID"));
					successMap.put("INFO_ID", personId);
					dao.add(successMap);
					successCount++;
				}else {
					failList.add(successMap.get("FILE_NAME") + "异常，原因：" + ctx.getResponse().getMessage());
				}
			}
			
//			for (Map<String, Object> successMap : successList) {
//				FeatureResp featureResp = FaceFeatureUtil.faceQualityCheck(ModuleUtil.renderImage(StringUtil.toString(successMap.get("PIC"))));
//				if (!featureResp.isValid()) {
//					failList.add(successMap.get("FILE_NAME") + "人脸质量检测失败，原因：" + featureResp.getErrorMsg());
//					ServiceLog.error("人脸质量检测不通过，原因：" + featureResp.getErrorMsg());
//					continue;
//				}
//				
//				Map<Long, String> features = new HashMap<Long, String>();
//				long personId = EAP.keyTool.getIDGenerator();
//				String rltz = featureResp.getRltz();
//				features.put(personId, rltz);
//				
//				successMap.put("INFO_ID", StringUtil.toString(personId));
//				successMap.put("CREATOR", context.getUserCode());
//				successMap.put("RLTZ", rltz);
//				successMap.put("PIC_QUALITY", featureResp.getScore());
//				try {
//					CollisionResult saveFaceResult = SdkStaticLibUtil.saveFaceToLib(Constants.STATIC_LIB_ID_MOBILE_TERMINAL, features);
//					if (saveFaceResult == null || saveFaceResult.getCode() !=0) {
//						failList.add(successMap.get("FILE_NAME") + "注册到库失败");
//						continue;
//					}
//					
//					successMap.put("PERSON_TAG", personTags);
//					if (!StringUtil.isNull(StringUtil.toString(successMap.get("BIRTHDAY")))) {
//						successMap.put("BIRTHDAY", Integer.valueOf(StringUtil.toString(successMap.get("BIRTHDAY")).replaceAll("-", "")));
//					}
//					
//					successMap.put("CREATE_TIME", Long.valueOf(DateUtil.convertByStyle(DateUtil.getDateTime(), DateUtil.standard_style, DateUtil.yyMMddHHmmss_style, "-1")));
//					
//					dao.add(successMap);
//		
//					successMap.put("PERSON_TAG", personTags.replaceAll(",", " "));
//					
//					EAP.bigdata.index(Constants.MOBILE_TERMINAL_INDICE, Constants.MOBILE_TERMINAL_INFO, successMap);
//					
//					successCount++;
//				} catch (Exception e) {
//					failList.add(successMap.get("FILE_NAME") + "注册到库失败");
//				}
//			}
			
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
