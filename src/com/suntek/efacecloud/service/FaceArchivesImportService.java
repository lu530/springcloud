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

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.FaceArchivesDao;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.FileUploadUtil;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.efacecloud.util.PersonImportUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * 人员档案库导入导出服务
 * efacecloud/rest/v6/face/archives
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/archives")
public class FaceArchivesImportService 
{
	
	private FaceArchivesDao faceArchivesDao = new FaceArchivesDao();
	
	private static Map<String,String> importErrorMsgCache = new HashMap<String,String>();
	
//	@BeanService(id="import",description="档案库导入")
//	public void importArchives(RequestContext context){
//		
//		try{
//			String webAppPath = context.getHttpRequest().getServletContext().getRealPath("/");
//			String unZipPath = webAppPath + "unZip";  //解压缩路径
//			String saveFileName = EAP.keyTool.getUUID() + ".zip";   //上传文件存储名称
//			Map<String,String> fileMap = FileUploadUtil.saveFile(context, webAppPath, saveFileName);
//			ServiceLog.debug("params: " + fileMap.toString());
//			List<Map<String,Object>> successList = new ArrayList<Map<String,Object>>();
//			List<String> failList = new ArrayList<String>();
//			String[] personTags = StringUtil.isNull(fileMap.get("PERSON_TAG"))? new String[]{} : fileMap.get("PERSON_TAG").split(",");
//			String personTagsDB = fileMap.get("PERSON_TAG_DB");
//			String zipPath = webAppPath + File.separator + saveFileName;
//			if(!new File(zipPath).isFile()){
//				context.getResponse().setWarn("上传文件为空");
//				return;
//			}
//			PersonImportUtil.getPersonImportList(webAppPath + File.separator + saveFileName, unZipPath, successList, failList);
//			int successCount = 0;
//			for(Map<String,Object> map : successList){
//				FaceArchivesService service = new FaceArchivesService();
//				context.getParameters().putAll(map);
//				context.getParameters().put("PIC", ModuleUtil.renderImage(StringUtil.toString(map.get("PIC"))));
//				context.getParameters().put("PERSON_TAG", StringUtils.join(personTags, ","));
//				context.getParameters().put("PERSON_TAG_DB", personTagsDB);
//
//				Map<String,Object> personMap = faceArhivesDao.queryPersonByIdentytyId(StringUtil.toString(map.get("IDENTITY_ID")));
//				if(personMap != null) {
//					context.getParameters().put("PERSON_ID", personMap.get("PERSON_ID"));
//				}else {
//					context.getParameters().put("PERSON_ID", "");
//				}
//				service.addPerson(context);
//				Map<String, Object> result = (Map<String, Object>)context.getResponse().getResult();
//				if(StringUtil.toString(result.get("CODE")).equals("0")) {
//					successCount++;
//				}else {
//					failList.add(map.get("FILE_NAME") + "注册到库失败," + result.get("MESSAGE"));
//				}
//			}
//			
//			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
//			context.getResponse().putData("MESSAGE", "导入完成");
//			context.getResponse().putData("SUCCESS_COUNT", successCount);
//			context.getResponse().putData("FAIL_COUNT", failList.size());
//			if(failList.size() > 0){
//				String timeStamp = StringUtil.toString(Calendar.getInstance().getTimeInMillis());
//				importErrorMsgCache.put(timeStamp, StringUtils.join(failList.toArray(new String[failList.size()]),"\n"));
//				context.getResponse().putData("ERROR_FILE_ID", timeStamp);
//			}
//		}catch(Exception e){
//			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
//			context.getResponse().putData("MESSAGE", "内部错误，请联系运维人员处理");
//			ServiceLog.error(e);
//		}
//		
//	}
	
	@BeanService(id="import",description="档案库导入")
	public void importArchives(RequestContext context){	
		try{
			String webAppPath = context.getHttpRequest().getServletContext().getRealPath("/");
			String unZipPath = webAppPath + "unZip";  //解压缩路径
			String saveFileName = EAP.keyTool.getUUID() + ".zip";   //上传文件存储名称
			Map<String,String> fileMap = FileUploadUtil.saveFile(context, webAppPath, saveFileName);
			ServiceLog.debug("params: " + fileMap.toString());
			
			CommandContext ctx = new CommandContext(context.getHttpRequest());
			context.getParameters().put("CREATOR", context.getUserCode());
			context.getParameters().put("CREATE_TIME", DateUtil.getDateTime()); // 人员档案信息
			
			List<Map<String,Object>> successList = new ArrayList<Map<String,Object>>();
			List<String> failList = new ArrayList<String>();
			String[] personTags = StringUtil.isNull(fileMap.get("PERSON_TAG"))? new String[]{} : fileMap.get("PERSON_TAG").split(",");
			String[] personTagDbArr = StringUtil.toString(fileMap.get("PERSON_TAG_DB")).split(",");; //关联的专题库
			
			String zipPath = webAppPath + File.separator + saveFileName;
			if(!new File(zipPath).isFile()){
				context.getResponse().setWarn("上传文件为空");
				return;
			}
			PersonImportUtil.getPersonImportList(webAppPath + File.separator + saveFileName, unZipPath, successList, failList);
			int successCount = 0;
			
			int batchSize = Integer.valueOf(AppHandle.getHandle(Constants.APP_NAME).getProperty("BATCH_IMPORT_SIZE", "100"));
//			int sleepSeconds = Integer.valueOf(AppHandle.getHandle(Constants.APP_NAME).getProperty("BATCH_IMPORT_SIZE", "60"));
			List<Map<String,Object>> batchPersons = new ArrayList<Map<String,Object>>();
			
			int traverseTimes = 0;
			for(Map<String,Object> map : successList){
				traverseTimes ++;
				
				map.put("PIC", ModuleUtil.renderImage(StringUtil.toString(map.get("PIC"))));
				map.put("PERSON_TAG", StringUtils.join(personTags, ","));
				map.put("DB_ID", EAP.metadata.getDictValue(Constants.DICT_KIND_STATIC_LIB, Constants.DICT_CODE_STATIC_LIB_ARCHIVE));
				map.put("CREATOR", context.getUserCode());
				map.put("CREATE_TIME", DateUtil.getDateTime()); // 人员档案信息	
				
				JSONObject jo = new JSONObject();
				jo.put("ARCHIVE_PRIMARY_KEY", EAP.keyTool.getIDGenerator());//数据库档案主键
				map.put("EXTRA_INFO", jo);
				
				ctx.setBody(map);
				Registry.getInstance().selectCommands(BaseCommandEnum.fileUpload.getUri()).exec(ctx);
				
				if (ctx.getResponse().getCode() != 0) {
					ServiceLog.error("图片" + map.get("FILE_NAME") + "上传失败");
					continue;
				}
				
				map.put("FILE_ID", ctx.getResponse().getData("CASEFILE_ID"));				
				
				batchPersons.add(map);
				if (batchPersons.size() >= batchSize || traverseTimes == successList.size()) {
					Map<String,Object> batchPersonsMap = new HashMap<>();
					batchPersonsMap.put("persons", batchPersons);
					ctx.setBody(batchPersonsMap);
					
					Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceBatchAdd.getUri()).exec(ctx);
//					Thread.sleep(sleepSeconds * 1000);
					
					if (ctx.getResponse().getCode() == 0) {
						List<Map<String,Object>> persons =  (List<Map<String, Object>>) ctx.getResponse().getData("persons");
						for (Map<String, Object> person : persons) {
							List<Map<String, Object>> tags = new ArrayList<Map<String, Object>>();
							for (int i = 0; i < personTags.length; i++) {
								Map<String, Object> tag = new HashMap<String, Object>();
								tag.put("ID", EAP.keyTool.getUUID());
								tag.put("TAG_CODE", personTags[i]);
								tag.put("REL_TYPE", Constants.REL_TYPE_PERSON);
								tag.put("REL_ID", ((Map<String,Object>)person.get("EXTRA_INFO")).get("ARCHIVE_PRIMARY_KEY")); // 关联标签库信息
								tags.add(tag);
							}
							Object personIdObj = person.get("PERSON_ID"); //人员标识
							person.put("PERSON_ID", ((Map<String,Object>)person.get("EXTRA_INFO")).get("ARCHIVE_PRIMARY_KEY"));//档案标识
							person.put("PERSON_ID_OBJ", personIdObj);//人员标识
							faceArchivesDao.add(person,tags);   //数据库新增档案	
							faceArchivesDao.addRel(((Map<String,Object>)person.get("EXTRA_INFO")).get("ARCHIVE_PRIMARY_KEY"),personIdObj);
						}
						
						for (String personTagDb : personTagDbArr) {
							if (!StringUtil.isEmpty(personTagDb)) {
								for (Map<String, Object> person : persons) {
									person.put("DB_ID", personTagDb);
									Map<String,Object> extraInfo = new HashMap<>();
									extraInfo.put("ARCHIVE_PIC_INFO_ID", person.get("PERSON_ID_OBJ"));				
									person.put("EXTRA_INFO", extraInfo);
								}								
								Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceBatchAdd.getUri()).exec(ctx);	
//								Thread.sleep(sleepSeconds * 1000);
							}												
						}
						successCount = successCount + persons.size();
					}else {
						ServiceLog.error("批量增加人员失败，失败图片含" + batchPersons.stream().map(o->o.get("FILE_NAME")).collect(Collectors.toList()));
					}
					batchPersons.clear();
				}
			}
			
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "导入完成");
			context.getResponse().putData("SUCCESS_COUNT", successCount);
			context.getResponse().putData("FAIL_COUNT", failList.size());
			if(failList.size() > 0){
				String timeStamp = StringUtil.toString(Calendar.getInstance().getTimeInMillis());
				importErrorMsgCache.put(timeStamp, StringUtils.join(failList.toArray(new String[failList.size()]),"\n"));
				context.getResponse().putData("ERROR_FILE_ID", timeStamp);
			}
		}catch(Exception e){
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "内部错误，请联系运维人员处理");
			ServiceLog.error(e);
		}		
	}
	
	@BeanService(id="importOnTomcat",description="档案库导入")
	public void importArchivesOnTomcat(RequestContext context){	
		try{			
			CommandContext ctx = new CommandContext(context.getHttpRequest());
			context.getParameters().put("CREATOR", "system");
			context.getParameters().put("CREATE_TIME", DateUtil.getDateTime()); // 人员档案信息
			
			List<Map<String,Object>> successList = new ArrayList<Map<String,Object>>();
			List<String> failList = new ArrayList<String>();
			String[] personTags = StringUtil.isNull(
					StringUtil.toString(context.getParameter("PERSON_TAG")))? new String[]{} : 
						StringUtil.toString(context.getParameter("PERSON_TAG")).split(",");
			String[] personTagDbArr = StringUtil.isNull(
					StringUtil.toString(context.getParameter("PERSON_TAG_DB")))? new String[]{} : 
				StringUtil.toString(context.getParameter("PERSON_TAG_DB")).split(",");
			

			int batchSize = Integer.valueOf(AppHandle.getHandle(Constants.APP_NAME).getProperty("BATCH_IMPORT_SIZE", "100"));
			int sleepSeconds = Integer.valueOf(AppHandle.getHandle(Constants.APP_NAME).getProperty("BATCH_IMPORT_SLEEP", "60"));
			PersonImportUtil.getPersonImportListOnTomcat("a", successList, failList, batchSize);
			
			int successCount = 0;
			while (successList.size() >0 ) {
				List<Map<String,Object>> batchPersons = new ArrayList<Map<String,Object>>();				
				int traverseTimes = 0;
				for(Map<String,Object> map : successList){
					traverseTimes ++;
					
					map.put("PIC", ModuleUtil.renderImage(StringUtil.toString(map.get("PIC"))));
					map.put("PERSON_TAG", StringUtils.join(personTags, ","));
					map.put("DB_ID", EAP.metadata.getDictValue(Constants.DICT_KIND_STATIC_LIB, Constants.DICT_CODE_STATIC_LIB_ARCHIVE));
					map.put("CREATOR", "system");
					map.put("CREATE_TIME", DateUtil.getDateTime()); // 人员档案信息	
					
					JSONObject jo = new JSONObject();
					jo.put("ARCHIVE_PRIMARY_KEY", EAP.keyTool.getIDGenerator());//数据库档案主键
					map.put("EXTRA_INFO", jo);
					
					ctx.setBody(map);
					Registry.getInstance().selectCommands(BaseCommandEnum.fileUpload.getUri()).exec(ctx);
					
					if (ctx.getResponse().getCode() != 0) {
						ServiceLog.error("图片" + map.get("FILE_NAME") + "上传失败");
						Log.archiveimportLog.error("图片" + map.get("FILE_NAME") + "上传失败");
						continue;
					}
					
					map.put("FILE_ID", ctx.getResponse().getData("CASEFILE_ID"));				
					
					batchPersons.add(map);
					if (batchPersons.size() >= batchSize || traverseTimes == successList.size()) {
						Map<String,Object> batchPersonsMap = new HashMap<>();
						batchPersonsMap.put("persons", batchPersons);
						ctx.setBody(batchPersonsMap);
						
						Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceBatchAdd.getUri()).exec(ctx);
						Thread.sleep(sleepSeconds * 1000);
						
						if (ctx.getResponse().getCode() == 0) {
							List<Map<String,Object>> persons =  (List<Map<String, Object>>) ctx.getResponse().getData("persons");
							for (Map<String, Object> person : persons) {
								List<Map<String, Object>> tags = new ArrayList<Map<String, Object>>();
								for (int i = 0; i < personTags.length; i++) {
									Map<String, Object> tag = new HashMap<String, Object>();
									tag.put("ID", EAP.keyTool.getUUID());
									tag.put("TAG_CODE", personTags[i]);
									tag.put("REL_TYPE", Constants.REL_TYPE_PERSON);
									tag.put("REL_ID", ((Map<String,Object>)person.get("EXTRA_INFO")).get("ARCHIVE_PRIMARY_KEY")); // 关联标签库信息
									tags.add(tag);
								}
								Object personIdObj = person.get("PERSON_ID"); //人员标识
								person.put("PERSON_ID", ((Map<String,Object>)person.get("EXTRA_INFO")).get("ARCHIVE_PRIMARY_KEY"));//档案标识
								person.put("PERSON_ID_OBJ", personIdObj);//人员标识
								faceArchivesDao.add(person,tags);   //数据库新增档案	
								faceArchivesDao.addRel(((Map<String,Object>)person.get("EXTRA_INFO")).get("ARCHIVE_PRIMARY_KEY"),personIdObj);
							}
							
							for (String personTagDb : personTagDbArr) {
								if (!StringUtil.isEmpty(personTagDb)) {
									for (Map<String, Object> person : persons) {
										person.put("DB_ID", personTagDb);
										Map<String,Object> extraInfo = new HashMap<>();
										extraInfo.put("ARCHIVE_PIC_INFO_ID", person.get("PERSON_ID_OBJ"));				
										person.put("EXTRA_INFO", extraInfo);
									}								
									Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceBatchAdd.getUri()).exec(ctx);	
									Thread.sleep(sleepSeconds * 1000);
								}												
							}
							successCount = successCount + persons.size();
						}else {
							ServiceLog.error("批量增加人员失败，失败图片含" + batchPersons.stream().map(o->o.get("FILE_NAME")).collect(Collectors.toList()));
							Log.archiveimportLog.error("批量增加人员失败，失败图片含" + batchPersons.stream().map(o->o.get("FILE_NAME")).collect(Collectors.toList()));
						}
						batchPersons.clear();
					}
			    }
				
				successList.clear();//清除
				PersonImportUtil.getPersonImportListOnTomcat("a", successList, failList, batchSize);
			}
			
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "导入完成");
			context.getResponse().putData("SUCCESS_COUNT", successCount);
			context.getResponse().putData("FAIL_COUNT", failList.size());
			if(failList.size() > 0){
				String timeStamp = StringUtil.toString(Calendar.getInstance().getTimeInMillis());
				importErrorMsgCache.put(timeStamp, StringUtils.join(failList.toArray(new String[failList.size()]),"\n"));
				context.getResponse().putData("ERROR_FILE_ID", timeStamp);
			}
		}catch(Exception e){
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "内部错误，请联系运维人员处理");
			ServiceLog.error(e);
		}		
	}
	
	@BeanService(id="testImport",description="档案库导入")
	public void testImport(RequestContext context){	
		try{			
			context.getParameters().put("CREATOR", "system");
			context.getParameters().put("CREATE_TIME", DateUtil.getDateTime()); // 人员档案信息
			
			List<Map<String,Object>> successList = new ArrayList<Map<String,Object>>();
			List<String> failList = new ArrayList<String>();
			String[] personTags = StringUtil.isNull(
					StringUtil.toString(context.getParameter("PERSON_TAG")))? new String[]{} : 
						StringUtil.toString(context.getParameter("PERSON_TAG")).split(",");
			String[] personTagDbArr = StringUtil.isNull(
					StringUtil.toString(context.getParameter("PERSON_TAG_DB")))? new String[]{} : 
				StringUtil.toString(context.getParameter("PERSON_TAG_DB")).split(",");
			

			int batchSize = Integer.valueOf(AppHandle.getHandle(Constants.APP_NAME).getProperty("BATCH_IMPORT_SIZE", "100"));
			int sleepSeconds = Integer.valueOf(AppHandle.getHandle(Constants.APP_NAME).getProperty("BATCH_IMPORT_SIZE", "60"));
			PersonImportUtil.getPersonImportListOnTomcat("a", successList, failList, batchSize);
			
			int successCount = 0;
			while (successList.size() >0 ) {
				List<Map<String,Object>> batchPersons = new ArrayList<Map<String,Object>>();				
				int traverseTimes = 0;
				for(Map<String,Object> map : successList){
					traverseTimes ++;
					
					map.put("PIC", ModuleUtil.renderImage(StringUtil.toString(map.get("PIC"))));
					map.put("PERSON_TAG", StringUtils.join(personTags, ","));
					map.put("DB_ID", EAP.metadata.getDictValue(Constants.DICT_KIND_STATIC_LIB, Constants.DICT_CODE_STATIC_LIB_ARCHIVE));
					map.put("CREATOR", "system");
					map.put("CREATE_TIME", DateUtil.getDateTime()); // 人员档案信息	
					
					JSONObject jo = new JSONObject();
					jo.put("ARCHIVE_PRIMARY_KEY", EAP.keyTool.getIDGenerator());//数据库档案主键
					map.put("EXTRA_INFO", jo);
					

			
					
					map.put("FILE_ID", EAP.keyTool.getUUID());				
					
					batchPersons.add(map);
					if (batchPersons.size() >= batchSize || traverseTimes == successList.size()) {

							List<Map<String,Object>> persons =  batchPersons;
							for (Map<String, Object> person : persons) {
								person.put("PERSON_ID", EAP.keyTool.getUUID());
								List<Map<String, Object>> tags = new ArrayList<Map<String, Object>>();
								for (int i = 0; i < personTags.length; i++) {
									Map<String, Object> tag = new HashMap<String, Object>();
									tag.put("ID", EAP.keyTool.getUUID());
									tag.put("TAG_CODE", personTags[i]);
									tag.put("REL_TYPE", Constants.REL_TYPE_PERSON);
									tag.put("REL_ID", ((Map<String,Object>)person.get("EXTRA_INFO")).get("ARCHIVE_PRIMARY_KEY")); // 关联标签库信息
									tags.add(tag);
								}
								Object personIdObj = person.get("PERSON_ID"); //人员标识
								person.put("PERSON_ID", ((Map<String,Object>)person.get("EXTRA_INFO")).get("ARCHIVE_PRIMARY_KEY"));//档案标识
								person.put("PERSON_ID_OBJ", personIdObj);//人员标识
								faceArchivesDao.add(person,tags);   //数据库新增档案	
								faceArchivesDao.addRel(((Map<String,Object>)person.get("EXTRA_INFO")).get("ARCHIVE_PRIMARY_KEY"),personIdObj);
							}
							
							successCount = successCount + persons.size();

						batchPersons.clear();
				     }
			    }
				
				successList.clear();//清除
				PersonImportUtil.getPersonImportListOnTomcat("a", successList, failList, batchSize);
			}
			
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "导入完成");
			context.getResponse().putData("SUCCESS_COUNT", successCount);
			context.getResponse().putData("FAIL_COUNT", failList.size());
			if(failList.size() > 0){
				String timeStamp = StringUtil.toString(Calendar.getInstance().getTimeInMillis());
				importErrorMsgCache.put(timeStamp, StringUtils.join(failList.toArray(new String[failList.size()]),"\n"));
				context.getResponse().putData("ERROR_FILE_ID", timeStamp);
			}
		}catch(Exception e){
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "内部错误，请联系运维人员处理");
			ServiceLog.error(e);
		}		
	}
	
//	//测试版本
//	@BeanService(id="import",description="档案库导入")
//	public void importArchives(RequestContext context){	
//		try{
//			String webAppPath = context.getHttpRequest().getServletContext().getRealPath("/");
//			String unZipPath = webAppPath + "unZip";  //解压缩路径
//			String saveFileName = EAP.keyTool.getUUID() + ".zip";   //上传文件存储名称
//			Map<String,String> fileMap = FileUploadUtil.saveFile(context, webAppPath, saveFileName);
//			ServiceLog.debug("params: " + fileMap.toString());
//			
//			CommandContext ctx = new CommandContext(context.getHttpRequest());
//			context.getParameters().put("CREATOR", context.getUserCode());
//			context.getParameters().put("CREATE_TIME", DateUtil.getDateTime()); // 人员档案信息
//			
//			List<Map<String,Object>> successList = new ArrayList<Map<String,Object>>();
//			List<String> failList = new ArrayList<String>();
//			String[] personTags = StringUtil.isNull(fileMap.get("PERSON_TAG"))? new String[]{} : fileMap.get("PERSON_TAG").split(",");
//			String[] personTagDbArr = StringUtil.toString(fileMap.get("PERSON_TAG_DB")).split(",");; //关联的专题库
//			
//			String zipPath = webAppPath + File.separator + saveFileName;
//			if(!new File(zipPath).isFile()){
//				context.getResponse().setWarn("上传文件为空");
//				return;
//			}
//			PersonImportUtil.getPersonImportList(webAppPath + File.separator + saveFileName, unZipPath, successList, failList);
//			int successCount = 0;
//			
//			int batchSize = Integer.valueOf(AppHandle.getHandle(Constants.APP_NAME).getProperty("BATCH_IMPORT_SIZE", "100"));
//			List<Map<String,Object>> batchPersons = new ArrayList<Map<String,Object>>();
//			
//			int traverseTimes = 0;
//			for(Map<String,Object> map : successList){
//				traverseTimes ++;
//				
//				map.put("PIC", ModuleUtil.renderImage(StringUtil.toString(map.get("PIC"))));
//				map.put("PERSON_TAG", StringUtils.join(personTags, ","));
//				map.put("DB_ID", EAP.metadata.getDictValue(Constants.DICT_KIND_STATIC_LIB, Constants.DICT_CODE_STATIC_LIB_ARCHIVE));
//				map.put("CREATOR", context.getUserCode());
//				map.put("CREATE_TIME", DateUtil.getDateTime()); // 人员档案信息	
//				
//				JSONObject jo = new JSONObject();
//				jo.put("ARCHIVE_PRIMARY_KEY", EAP.keyTool.getIDGenerator());//数据库档案主键
//				map.put("EXTRA_INFO", jo);
//				
////				ctx.setBody(map);
////				Registry.getInstance().selectCommands(BaseCommandEnum.fileUpload.getUri()).exec(ctx);
////				
////				if (ctx.getResponse().getCode() != 0) {
////					continue;
////				}
//				
////				map.put("FILE_ID", ctx.getResponse().getData("CASEFILE_ID"));	
//				map.put("FILE_ID", EAP.keyTool.getUUID());
//				
//				batchPersons.add(map);
//				if (batchPersons.size() >= batchSize || traverseTimes == successList.size()) {
//					ServiceLog.debug("达到批量提交条件" + batchPersons.size());
////					Map<String,Object> batchPersonsMap = new HashMap<>();
////					batchPersonsMap.put("persons", batchPersons);
////					ctx.setBody(batchPersonsMap);
//					
////					Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceBatchAdd.getUri()).exec(ctx);
//					
////					if (ctx.getResponse().getCode() == 0) {
//					if(true) {
//						List<Map<String,Object>> persons =  batchPersons;
//						for (Map<String, Object> person : persons) {
//							person.put("PERSON_ID", EAP.keyTool.getUUID());
//							
//							List<Map<String, Object>> tags = new ArrayList<Map<String, Object>>();
//							for (int i = 0; i < personTags.length; i++) {
//								Map<String, Object> tag = new HashMap<String, Object>();
//								tag.put("ID", EAP.keyTool.getUUID());
//								tag.put("TAG_CODE", personTags[i]);
//								tag.put("REL_TYPE", Constants.REL_TYPE_PERSON);
//								tag.put("REL_ID", ((Map<String,Object>)person.get("EXTRA_INFO")).get("ARCHIVE_PRIMARY_KEY")); // 关联标签库信息
//								tags.add(tag);
//							}
//							Object personIdObj = person.get("PERSON_ID"); //人员标识
//							person.put("PERSON_ID", ((Map<String,Object>)person.get("EXTRA_INFO")).get("ARCHIVE_PRIMARY_KEY"));//档案标识
//							person.put("PERSON_ID_OBJ", personIdObj);//人员标识
//							faceArchivesDao.add(person,tags);   //数据库新增档案	
//							faceArchivesDao.addRel(((Map<String,Object>)person.get("EXTRA_INFO")).get("ARCHIVE_PRIMARY_KEY"),personIdObj);
//						}
//						
//						for (String personTagDb : personTagDbArr) {
//							if (!StringUtil.isEmpty(personTagDb)) {
//								for (Map<String, Object> person : persons) {
//									person.put("DB_ID", personTagDb);
//									Map<String,Object> extraInfo = new HashMap<>();
//									extraInfo.put("ARCHIVE_PIC_INFO_ID", person.get("PERSON_ID_OBJ"));				
//									person.put("EXTRA_INFO", extraInfo);
//								}								
////								Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceBatchAdd.getUri()).exec(ctx);	
//							}												
//						}
//						successCount = successCount + persons.size();
//					}
//					batchPersons.clear();
//				}
//			}
//			
//			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
//			context.getResponse().putData("MESSAGE", "导入完成");
//			context.getResponse().putData("SUCCESS_COUNT", successCount);
//			context.getResponse().putData("FAIL_COUNT", failList.size());
//			if(failList.size() > 0){
//				String timeStamp = StringUtil.toString(Calendar.getInstance().getTimeInMillis());
//				importErrorMsgCache.put(timeStamp, StringUtils.join(failList.toArray(new String[failList.size()]),"\n"));
//				context.getResponse().putData("ERROR_FILE_ID", timeStamp);
//			}
//		}catch(Exception e){
//			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
//			context.getResponse().putData("MESSAGE", "内部错误，请联系运维人员处理");
//			ServiceLog.error(e);
//		}		
//	}
	
	@BeanService(id="exportErrorMsg",description="导出导入时的错误信息")
	public void exportImportErrorMsg(RequestContext context) throws Exception{
		
		String errorFileId = StringUtil.toString(context.getParameter("ERROR_FILE_ID"));
		OutputStream os = null;
		
		try {
			HttpServletResponse response = context.getHttpResponse();
        	
			response.setHeader(
					"Content-disposition",
					"attachment;success=true;filename ="
							+ URLEncoder.encode("errorMsg.txt", "utf-8"));
			
        	os = response.getOutputStream();
        	os.write(importErrorMsgCache.get(errorFileId).getBytes());
        	importErrorMsgCache.remove(errorFileId);
			
		} catch (IOException e) {
			ServiceLog.error("导出错误信息异常->" + e.getMessage());
		}finally{
			if(null != os){
				os.close();
			}
		}
	}
}
