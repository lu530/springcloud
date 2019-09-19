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
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;

import com.suntek.eap.EAP;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceAlgorithmNameDao;
import com.suntek.efacecloud.dao.FaceRedListDao;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.FaceFeatureUtil;
import com.suntek.efacecloud.util.FaceFeatureUtil.FeatureResp;
import com.suntek.efacecloud.util.FileUploadUtil;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.efacecloud.util.PersonImportUtil;
import com.suntek.efacecloud.util.SdkStaticLibUtil;
import com.suntek.face.compare.sdk.model.CollisionResult;

/**
 * 红名单库导入服务
 * efacecloud/rest/v6/face/redlist
 * @author lx
 * @since 1.0.0
 * @version 2018-03-05
 * @Copyright (C)2018 , Suntektech
 */
@LocalComponent(id = "face/redlist")
public class FaceRedListImportService 
{
	private FaceRedListDao dao = new FaceRedListDao();
	
	private FaceAlgorithmNameDao algoDao = new FaceAlgorithmNameDao();
	
	private static Map<String,String> importErrorMsgCache = new HashMap<String,String>();

	@BeanService(id="import",description="红名单库导入")
	public void importRedList(RequestContext context)
	{
		try {
			String webAppPath = context.getHttpRequest().getServletContext().getRealPath("/");
			
			String unZipPath = webAppPath + EAP.keyTool.getUUID();  //解压缩路径
			
			String saveFileName = EAP.keyTool.getUUID() + ".zip";   //上传文件存储名称
			
			FileUploadUtil.saveFile(context, webAppPath, saveFileName);
			
			List<Map<String,Object>> successList = new ArrayList<Map<String,Object>>();
			
			List<String> failList = new ArrayList<String>();
			
			String zipPath = webAppPath + File.separator + saveFileName;
			if (!new File(zipPath).isFile()) {
				context.getResponse().setWarn("上传文件为空");
				return;
			}
			
			PersonImportUtil.getPersonImportList(webAppPath + File.separator + saveFileName, unZipPath, successList, failList);
			int successCount = 0;
			
			//修改整体获取逻辑,改由配置获取，而不是从缓存内获取全部算法
			List<Integer> algoTypeList = algoDao.getAlgorithNameList(Constants.RED_LIST_MENUID).stream().map(f -> Integer.parseInt(StringUtil.toString(f.get("ALGORITHM_ID"))))
	                .collect(Collectors.toList());
			for (Map<String, Object> successMap : successList) {
				FeatureResp featureResp = FaceFeatureUtil.faceQualityCheck(ModuleUtil.renderImage(StringUtil.toString(successMap.get("PIC"))));
				if (!featureResp.isValid()) {
					failList.add(successMap.get("FILE_NAME") + "人脸质量检测失败，原因：" + featureResp.getErrorMsg());
					ServiceLog.error("人脸质量检测不通过，原因：" + featureResp.getErrorMsg());
					continue;
				}
				
				Map<Long, String> features = new HashMap<Long, String>();
				long personId = EAP.keyTool.getIDGenerator();
				String rltz = featureResp.getRltz();
				features.put(personId, rltz);
				
				successMap.put("INFO_ID", StringUtil.toString(personId));
				successMap.put("CREATOR", context.getUserCode());
				successMap.put("CREATE_TIME", DateUtil.getDateTime());
				successMap.put("RLTZ", rltz);
				successMap.put("PIC_QUALITY", featureResp.getScore());
				try {
					/*CollisionResult saveFaceResult = SdkStaticLibUtil.saveFaceToLib(Constants.STATIC_LIB_ID_RED_LIST, features);
					if (saveFaceResult == null || saveFaceResult.getCode() != 0) {
						failList.add(successMap.get("FILE_NAME") + "注册到库失败");
						continue;
					}*/
					for(int algoType : algoTypeList) {
						CollisionResult result = SdkStaticLibUtil.saveFaceToLib(Constants.STATIC_LIB_ID_RED_LIST, personId, featureResp.getRltz(), algoType);
						if(result.getCode() != Constants.COLLISISON_RESULT_SUCCESS){
							failList.add(successMap.get("FILE_NAME") + "注册到库失败," + result.getMessage());
							continue;
						}
					}
					
					dao.add(successMap);
		
					successCount ++;
				} catch (Exception e) {
					ServiceLog.error(e);
					failList.add(successMap.get("FILE_NAME") + "入库或注册到库失败," + e.getMessage());
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
