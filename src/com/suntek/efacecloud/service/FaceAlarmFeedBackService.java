package com.suntek.efacecloud.service;

import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.common.util.StringUtil;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.AlarmHandleRecordDao;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.web.RequestBody;

@LocalComponent(id = "alarm/alarmRecordBack")
public class FaceAlarmFeedBackService {

	private RequestBody req = new RequestBody();
	private AlarmHandleRecordDao alarmHandleRecordDao = new AlarmHandleRecordDao();
	
	@BeanService(id = "accessFeedBackInfo", description = "接收品高APP告警反馈信息", isLog = "true", type = "remote")
	public void add(RequestContext context) throws Exception {
		String result = StringUtil.toString(req.getRequestBodyParam(context),"");
		if(StringUtils.isNotBlank(result)){
			JSONObject resultJson = JSONObject.parseObject(result);
			String ret = jsonDataValidate(resultJson);
			if(StringUtils.isBlank(ret)){
				JSONObject handleResult = new JSONObject();
				String alarmId = resultJson.getString("ALARM_ID");
				
				handleResult.put("IS_ERRORINFO", resultJson.getString("IS_ERRORINFO"));
				handleResult.put("IS_FOUND", resultJson.getString("IS_FOUND"));
				handleResult.put("IS_CONSISTENT", resultJson.getString("IS_CONSISTENT"));
				handleResult.put("NOTE", resultJson.getString("NOTE"));
				
				List<Map<String, Object>> mapList = alarmHandleRecordDao.queryAlarmInfoByAlarmId(alarmId);
				if(mapList.size() > 0){
					Map<String, Object> map = mapList.get(0);
					
					//检查是否需要补签
					if (alarmHandleRecordDao.isAlarmSignIn(resultJson.getString("ALARM_ID")) == false) {
						Map<String, Object> signMap = new HashMap<String, Object>();
						JSONObject signJson = new JSONObject();
						signJson.put("SIGN", "1");
						signMap.put("PERSON_ID", StringUtil.toString(map.get("PERSON_ID")));
						signMap.put("ALARM_ID", resultJson.getString("ALARM_ID"));
						signMap.put("HANDLE_USER", resultJson.getString("HANDLE_USER"));
						signMap.put("IS_TIMEOUT", alarmSignTimeOut(Integer.parseInt(StringUtil.toString(map.get("TASK_LEVEL"))), 
								resultJson.getString("HANDLE_TIME"), StringUtil.toString(map.get("ALARM_TIME"))));
						signMap.put("HANDLE_RESULT", signJson);
						signMap.put("HANDLE_TIME", resultJson.getString("HANDLE_TIME"));
						signMap.put("OP_TYPE", 1);//签收
						alarmHandleRecordDao.insertAlarmHandleRecord(signMap);
					}
					
					Map<String, Object> record = new HashMap<String, Object>();
					int optype = handleType(resultJson);//判断是否确认抓捕
					record.put("PERSON_ID", resultJson.getString("PERSON_ID"));
					record.put("ALARM_ID", resultJson.getString("ALARM_ID"));
					record.put("HANDLE_USER", resultJson.getString("HANDLE_USER"));
					record.put("IS_TIMEOUT", alarmFeedBackTimeOut(resultJson.getString("HANDLE_TIME"), 
							StringUtil.toString(map.get("ALARM_TIME"))));
					record.put("HANDLE_RESULT", handleResult);
					record.put("HANDLE_TIME", resultJson.getString("HANDLE_TIME"));
					record.put("OP_TYPE", optype);	
					
					alarmHandleRecordDao.insertAlarmHandleRecord(record);
					
					context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
					context.getResponse().putData("MESSAGE", "请求成功");
				}else{
					context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
					context.getResponse().putData("MESSAGE", "ALARM_ID查询失败，请检查ALARM_ID是否正确！");
				}
			}else{
				context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
				context.getResponse().putData("MESSAGE", ret);
			}
		}else{
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "请求参数为空！");
		}
	}
	
	private String jsonDataValidate(JSONObject json){
		if(StringUtils.isBlank(json.getString("ALARM_ID"))){
			return "请求失败，ALARM_ID为空！";
		}
		
		if(StringUtils.isBlank(json.getString("HANDLE_USER"))){
			return "请求失败，HANDLE_USER为空！";
		}
		
		if(StringUtils.isBlank(json.getString("HANDLE_TIME"))){
			return "请求失败，HANDLE_TIME为空！";
		}
		
		if(StringUtils.isBlank(json.getString("IS_ERRORINFO"))){
			return "请求失败，IS_ERRORINFO为空！";
		}
		
		if(StringUtils.isBlank(json.getString("IS_FOUND"))){
			return "请求失败，IS_FOUND为空！";
		}
		
		if(StringUtils.isBlank(json.getString("IS_CONSISTENT"))){
			return "请求失败，IS_CONSISTENT为空！";
		}
		return "";
	}
	
	private int handleType(JSONObject json){
		String isErrorInfo = json.getString("IS_ERRORINFO");
		String isFound = json.getString("IS_FOUND");
		String isConsistent = json.getString("IS_CONSISTENT");
		if("1".equals(isErrorInfo) && "1".equals(isFound) && "1".equals(isConsistent)){
			return 9;
		}else {
			return 2;
		}
	} 
	
	public int alarmSignTimeOut(int taskLevel, String handleTime, String alarmTime){
		//告警签收超时时间配置
		String OP_TYPE_SIGN_TIMEOUT = AppHandle.getHandle(Constants.APP_NAME).getProperty("OP_TYPE_SIGN_TIMEOUT", "3,3,60");
		long diff = DateUtil.diff(Calendar.SECOND, DateUtil.toDate(handleTime), DateUtil.toDate(alarmTime));
		switch (taskLevel) {
			// 0-不超时 1-超时
			case Constants.ALARM_LEVEL_RED:
				return diff > Integer.parseInt(OP_TYPE_SIGN_TIMEOUT.split(",")[0]) * 60 ? 1 : 0;
			case Constants.ALARM_LEVEL_ORANGE:
				return diff > Integer.parseInt(OP_TYPE_SIGN_TIMEOUT.split(",")[1]) * 60 ? 1 : 0;
			case Constants.ALARM_LEVEL_YELLOW:
				return diff > Integer.parseInt(OP_TYPE_SIGN_TIMEOUT.split(",")[2]) * 60 ? 1 : 0;
			default:
				return 0;
		}
	}
	
	public int alarmFeedBackTimeOut(String handleTime, String alarmTime){
		//告警反馈超时时间配置
		String OP_TYPE_FEEDBACK_TIMEOUT = AppHandle.getHandle(Constants.APP_NAME).getProperty("OP_TYPE_FEEDBACK_TIMEOUT", "60,60,1440");
		long diff = DateUtil.diff(Calendar.SECOND, DateUtil.toDate(handleTime), DateUtil.toDate(alarmTime));
		return diff > Integer.parseInt(OP_TYPE_FEEDBACK_TIMEOUT.split(",")[0]) * 60 ? 1 : 0;
	}
}
