package com.suntek.efacecloud.service;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.efacecloud.util.PersonImportUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * @author gaosong
 * @version 2017年12月7日
 * @since 1.0
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "archives/huawei")
public class FaceArchiveForHw {
	private FaceArchivesDao faceArchivesDao = new FaceArchivesDao();
	private static Map<String,String> importErrorMsgCache = new HashMap<String,String>();
	
	@BeanService(id="import",description="档案库数据导入")
	public void importArchivesOnTomcat(RequestContext context){	
	 try{		
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		context.getParameters().put("CREATOR", "system");
		context.getParameters().put("CREATE_TIME", DateUtil.getDateTime()); // 人员档案信息
		
		String[] personTags = StringUtil.isNull(
				StringUtil.toString(context.getParameter("PERSON_TAG")))? new String[]{} : 
					StringUtil.toString(context.getParameter("PERSON_TAG")).split(",");
		String[] personTagDbArr = StringUtil.isNull(
				StringUtil.toString(context.getParameter("PERSON_TAG_DB")))? new String[]{} : 
			StringUtil.toString(context.getParameter("PERSON_TAG_DB")).split(",");
		

		//设置批量大小，成功上传fastdfd的图片列表，失败上传fastdfs的图片列表
		int batchSize = Integer.valueOf(AppHandle.getHandle(Constants.APP_NAME).getProperty("BATCH_IMPORT_SIZE", "100"));
		List<Map<String,Object>> successList = new ArrayList<Map<String,Object>>();
		List<String> failList = new ArrayList<String>();
		
		PersonImportUtil.getPersonImportListForHw("a", successList, failList, batchSize);
		
		int successCount = 0;
		while (successList.size() >0 ) {
			for(Map<String,Object> map : successList){			
				map.put("PIC", ModuleUtil.renderImage(StringUtil.toString(map.get("PIC"))));
				map.put("PERSON_TAG", StringUtils.join(personTags, ","));
				map.put("DB_ID", EAP.metadata.getDictValue(Constants.DICT_KIND_STATIC_LIB, Constants.DICT_CODE_STATIC_LIB_ARCHIVE));
				map.put("CREATOR", "system");
				map.put("CREATE_TIME", DateUtil.getDateTime()); // 人员档案信息	
				
				JSONObject jo = new JSONObject();
				jo.put("ARCHIVE_PRIMARY_KEY", EAP.keyTool.getIDGenerator());//数据库档案主键
				map.put("EXTRA_INFO", jo);										
		    }
			
			Map<String,Object> batchPersonsMap = new HashMap<>();
			batchPersonsMap.put("persons", successList);
			ctx.setBody(batchPersonsMap);
			
			Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceBatchAdd.getUri()).exec(ctx);
			
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
			       }												
				}
				successCount = successCount + persons.size();
			}else {				
				for (int i = 0; i < successList.size(); i++) {
					failList.add(StringUtil.toString(successList.get(i).get("FILE_NAME")) + "调用华为接口失败");
				}
				
				ServiceLog.error("批量增加人员失败，失败图片含" + successList.stream().map(o->o.get("FILE_NAME")).collect(Collectors.toList()));
				Log.archiveimportLog.error("批量增加人员失败，失败图片含" + successList.stream().map(o->o.get("FILE_NAME")).collect(Collectors.toList()));
			}			
			successList.clear();//清除
			PersonImportUtil.getPersonImportListForHw("a", successList, failList, batchSize);
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
}
