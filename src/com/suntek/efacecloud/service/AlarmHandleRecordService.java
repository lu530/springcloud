package com.suntek.efacecloud.service;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.log.ServiceLog;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.pico.ILocalComponent;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.AlarmHandleRecordDao;
import com.suntek.efacecloud.dao.FaceDispatchedPersonDao;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.efacecloud.util.PersonStatus;

/**
 * 处置信息记录服务
 * 
 * @author suweiquan
 * @since
 * @version 2018年5月12日
 */

@LocalComponent(id = "defence/alarmHandleRecord")
public class AlarmHandleRecordService {

	private AlarmHandleRecordDao alarmHandleRecordDao = new AlarmHandleRecordDao();
	private FaceDispatchedPersonDao faceDispatchedPersonDao=new FaceDispatchedPersonDao();

	@BeanService(id = "add", description = "增加处置信息", isLog = "true", type = "remote")
	public void add(RequestContext context) throws Exception {
		Map<String, Object> map = context.getParameters();
		String personId = StringUtil.toString(context.getParameter("PERSON_ID"));
		String alarmId = StringUtil.toString(context.getParameter("ALARM_ID"));
		String alarmTime = StringUtil.toString(context.getParameter("ALARM_TIME"));
		String handleResult = StringUtil.toString(context.getParameter("HANDLE_RESULT"));
		String opType = StringUtil.toString(context.getParameter("OP_TYPE")); // 1：签收 2：反馈
		Integer taskLevel = Integer.parseInt(StringUtil.toString(context.getParameter("TASK_LEVEL"))); // 告警等级

		JSONObject handleResultJ = JSONObject.parseObject(handleResult);
		
		// 是否误报，湛江用到
		String isErrorInfo = StringUtil.toString(handleResultJ.get("IS_ERRORINFO"));
		
		String isFound = StringUtil.toString(handleResultJ.get("IS_FOUND"));
		String isControl = StringUtil.toString(handleResultJ.get("IS_CONTROL"));
		String isConsistent = StringUtil.toString(handleResultJ.get("IS_CONSISTENT"));
		
		// 出警
		String isPoliceOut = StringUtil.toString(handleResultJ.get("IS_POLICE_OUT"));
		// 撤控
		String isCancelDispatched = StringUtil.toString(handleResultJ.get("IS_CANCEL_DISPATCHED"));
		// 特征
		String isSexMatching = StringUtil.toString(handleResultJ.get("IS_SEX_MATCHING"));
		String isIdentityIdMatching = StringUtil.toString(handleResultJ.get("IS_IDENTITY_ID_MATCHING"));
		String isAppearanceMatching = StringUtil.toString(handleResultJ.get("IS_APPEARANCE_MATCHING"));

		String resultMsg = "反馈处置成功";
		
		if ("1".equals(opType) && alarmHandleRecordDao.isAlarmSignIn(alarmId)) {
			context.getResponse().putData("CODE", "1");
			context.getResponse().putData("MESSAGE", "告警已签收，请勿重复签收");
			return;
		}
		if ("2".equals(opType) && alarmHandleRecordDao.isFeedbackFinish(alarmId)) {
			context.getResponse().putData("CODE", "1");
			context.getResponse().putData("MESSAGE", "告警已完成反馈，请勿重复反馈");
			return;
		}
		map.put("HANDLE_USER", context.getUserCode());

		String handleTime = DateUtil.getDateTime();
		
		//湛江配置
		String NEED_DISPATCHED_PERSON_STATUS = AppHandle.getHandle(Constants.APP_NAME).getProperty("NEED_DISPATCHED_PERSON_STATUS", "0");
		
		if ("1".equals(opType)) { // 签收
			//告警签收超时时间配置
			String OP_TYPE_SIGN_TIMEOUT = AppHandle.getHandle(Constants.APP_NAME).getProperty("OP_TYPE_SIGN_TIMEOUT", "3,3,60");
			long diff = DateUtil.diff(Calendar.SECOND, DateUtil.toDate(handleTime), DateUtil.toDate(alarmTime));
			switch (taskLevel) {
				// 0-不超时 1-超时
				case Constants.ALARM_LEVEL_RED:
					map.put("IS_TIMEOUT", diff > Integer.parseInt(OP_TYPE_SIGN_TIMEOUT.split(",")[0]) * 60 ? 1 : 0);
					break;
				case Constants.ALARM_LEVEL_ORANGE:
					map.put("IS_TIMEOUT", diff > Integer.parseInt(OP_TYPE_SIGN_TIMEOUT.split(",")[1]) * 60 ? 1 : 0);
					break;
				case Constants.ALARM_LEVEL_YELLOW:
					map.put("IS_TIMEOUT", diff > Integer.parseInt(OP_TYPE_SIGN_TIMEOUT.split(",")[2]) * 60 ? 1 : 0);
					break;
				default:
					map.put("IS_TIMEOUT", 0);
			}
		} else {
			String OP_TYPE_FEEDBACK_TIMEOUT = AppHandle.getHandle(Constants.APP_NAME).getProperty("OP_TYPE_FEEDBACK_TIMEOUT", "60,60,1440");
			long diff = DateUtil.diff(Calendar.SECOND, DateUtil.toDate(handleTime), DateUtil.toDate(alarmTime));
			switch (taskLevel) {
				// 0-不超时 1-超时
				case Constants.ALARM_LEVEL_RED:
					map.put("IS_TIMEOUT", diff > Integer.parseInt(OP_TYPE_FEEDBACK_TIMEOUT.split(",")[0]) * 60 ? 1 : 0);
					break;
				case Constants.ALARM_LEVEL_ORANGE:
					map.put("IS_TIMEOUT", diff > Integer.parseInt(OP_TYPE_FEEDBACK_TIMEOUT.split(",")[1]) * 60 ? 1 : 0);
					break;
				case Constants.ALARM_LEVEL_YELLOW:
					map.put("IS_TIMEOUT", diff > Integer.parseInt(OP_TYPE_FEEDBACK_TIMEOUT.split(",")[2]) * 60 ? 1 : 0);
					break;
				default:
					map.put("IS_TIMEOUT", 0);
			}
			
			//湛江需求
			if(NEED_DISPATCHED_PERSON_STATUS.equals("1")){
				int status = PersonStatus.FEDBACK.getType();
				//是否确认本人
				if ("0".equals(isErrorInfo) || ("1".equals(isErrorInfo) && "0".equals(isFound))) {
					status = PersonStatus.ALARM_NOT_CAPTURE.getType();
				//确认非嫌疑人
				}else if("1".equals(isErrorInfo) && "1".equals(isFound) && "0".equals(isConsistent)){
					status = PersonStatus.CONFIRM_NONSUSPECT.getType();
				//抓捕成功
				}else if("1".equals(isErrorInfo) && "1".equals(isFound) && "1".equals(isConsistent)){
					status = PersonStatus.ALARM_SUCC_CAPTURE.getType();
				}
				
				faceDispatchedPersonDao.updatePersonStatus(status, DateUtil.getDateTime(), personId);
				
				//确认抓捕后的直接撤控
				if(status == PersonStatus.ALARM_SUCC_CAPTURE.getType()){
					
					List<Map<String, Object>> personInfoMapList = faceDispatchedPersonDao.queryByPersonId(personId);
					if(personInfoMapList.size() > 0){
						Map<String, Object> personInfoMap = personInfoMapList.get(0);
						String resultPostString = autoRemoveDispatched(StringUtil.toString(personInfoMap.get("DB_ID")), personId, context);
						if(StringUtils.isBlank(resultPostString)){
							String NEED_APPROVE = AppHandle.getHandle(Constants.APP_EFACESURVEILLANCE).getProperty("NEED_APPROVE", "0");
							if("1".equals(NEED_APPROVE)){
								resultMsg += ",且已成功撤控,人员撤控已开启撤控审批,请到人员布控——撤控管理中审核";
							}else{
								resultMsg += ",且已成功撤控";
							}
						}else{
							resultMsg += ",但人员撤控失败,失败原因:" + resultPostString;
						}
					}else{
						resultMsg += ",但人员撤控失败,失败原因:布控库查无该人员信息";
					}
				}
			}
		} 
		
		//湛江新增
		if(NEED_DISPATCHED_PERSON_STATUS.equals("1")){
			if ("1".equals(isErrorInfo) && "1".equals(isFound) && "1".equals(isConsistent)) {
				map.put("OP_TYPE", 9); // 已抓获
			}
		}else{
			if ("1".equals(isFound) && "1".equals(isControl) && "1".equals(isConsistent)) {
				map.put("OP_TYPE", 9); // 已抓获
			}
		}
		
		map.put("HANDLE_TIME", handleTime);
		//插入数据要处理记录表
		alarmHandleRecordDao.insertAlarmHandleRecord(map);
		// 顺德需求：如果已抓拍，发短信给布控人员，短信通知不包含全国在逃库
		// "姓名（布控库）在xxxx年xx月xx日xx时xx分xx秒被xxxx反馈已控制，请及时撤控”，短信通知不包含全国在逃库";
		if ("1".equals(isFound) && "1".equals(isControl) && "1".equals(isConsistent)) {
			Log.synclog.info("反馈已抓捕");
			ServiceLog.info("反馈已抓捕");
			Map<String, Object> info = alarmHandleRecordDao.getPersonAndAlarmInfoByAlarmId(alarmId);
			String dbName = StringUtil.toString(info.get("DB_NAME"));
			String time = StringUtil.toString(info.get("ALARM_TIME"));
			String phones = StringUtil.toString(info.get("TELEPHONE"));
			time = DateUtil.convertByStyle(time, DateUtil.standard_style, DateUtil.standard_style);
			JSONObject objectExtendInfo = JSONObject.parseObject(StringUtil.toString(info.get("OBJECT_EXTEND_INFO")));
			String identityId = objectExtendInfo.getString("IDENTITY_ID");
			String name = objectExtendInfo.getString("NAME");
			String noMsgDbName = AppHandle.getHandle(Constants.APP_EFACESURVEILLANCE).getProperty("NO_MSG_DB_NAME", "全国在逃库");
			if (!noMsgDbName.contains(dbName)) {
				ServiceLog.debug("反馈已抓捕,且不属于全国在逃库");
				if (!StringUtil.isEmpty(phones)) {
					String content = name + "-" + identityId + "(" + dbName + ")" + "在" + time + "被" + context.getUser().getName() + "反馈已控制，请及时撤控";
					ServiceLog.debug("反馈已抓捕,且不属于全国在逃库，布控人手机非空，开始发送短信：" + content);
					ModuleUtil.sendDispatchedSms(phones, content);
				}
			}
		} else {
			Log.synclog.info("反馈未抓捕");
			ServiceLog.info("反馈未抓捕");
		}
		// 5.8顺德需求：告警反馈信息告警正确且人员已被控制，系统自动撤控
		// if("2".equals(opType) && "1".equals(isControl)) {
		// String personId = alarmHandleRecordDao.getPersonIdByAlarmId(alarmId);
		// alarmHandleRecordDao.autoWithdraw(personId, "人员已被控制，系统自动撤控");
		// CommandContext ctx = new CommandContext(context.getHttpRequest());
		// Map<String, Object> body = new HashMap<>();
		// body.put("PERSON_ID", personId);
		// body.put("OBJECT_STATUS", "2");
		// ctx.setBody(body);
		// ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
		// ctx.setUserCode(context.getUserCode());
		// Registry.getInstance().selectCommands(
		// BaseCommandEnum.faceDispatchedPersonActive.getUri()).exec(ctx);
		// }

		context.getResponse().putData("CODE", "0");
		context.getResponse().putData("MESSAGE", resultMsg);
	}

	@BeanService(id = "list", description = "获取处置信息", since = "3.0.0", type = "remote")
	public void getAlarmHandleInfo(RequestContext context) {
		String ALARM_ID = StringUtil.toString(context.getParameter("ALARM_ID"));
		String ALARM_TIME = StringUtil.toString(context.getParameter("ALARM_TIME"));

		List<Map<String, Object>> list = alarmHandleRecordDao.getAlarmHandleInfo(ALARM_ID);

		List<Map<String, Object>> result = new ArrayList<>();
		getFirstHandleInfo(result, ALARM_TIME);
		for (Map<String, Object> info : list) {
			String isTimeout = StringUtil.toString(info.get("IS_TIMEOUT"));
			long handleTime = DateUtil.toDate(StringUtil.toString(info.get("HANDLE_TIME"))).getTime();
			long alarmTime = DateUtil.toDate(ALARM_TIME).getTime();
			String handleResult = StringUtil.toString(info.get("HANDLE_RESULT"));

			int isTimeoutInt;
			if (StringUtil.isNull(isTimeout)) {
				isTimeoutInt = (handleTime - alarmTime) > 1000 * 60 * 3 ? 1 : 0;
			} else {
				isTimeoutInt = Integer.parseInt(isTimeout);
			}

			Map<String, Object> map = new HashMap<>();
			map.put("IS_TIMEOUT", isTimeoutInt);
			map.put("TIME", info.get("HANDLE_TIME"));
			map.put("CONTENT", handleResult);
			map.put("USER_CODE", StringUtil.toString(info.get("USER_CODE")));
			map.put("USER_NAME", StringUtil.toString(info.get("USER_NAME")));
			map.put("DEPT_NAME", StringUtil.toString(info.get("DEPT_NAME")));
			map.put("OP_TYPE", StringUtil.toString(info.get("OP_TYPE")));
			map.put("POLICE_ID", StringUtil.toString(info.get(""),"无警号"));
			map.put("ID", info.get("ID"));
			result.add(map);
		}
		context.getResponse().putData("data", result);
	}

	@BeanService(id = "getRecord", description = "获取最新的处置信息", since = "3.0.0", type = "remote")
	public void getAlarmHandleRercord(RequestContext context) {
		String alarmId = StringUtil.toString(context.getParameter("ALARM_ID"),"");

		if(StringUtils.isNotBlank(alarmId)){
			List<Map<String, Object>> mapList = alarmHandleRecordDao.queryAlarmHandlRecord(alarmId);
			if(mapList.size() >0){
				Map<String, Object> map = mapList.get(0);
				context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
				context.getResponse().putData("ERRORMSG", "请求成功");
				context.getResponse().putData("DATA", map);
			}else{
				context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
				context.getResponse().putData("ERRORMSG", "无反馈数据");
				context.getResponse().putData("DATA", "");
			}
		}else{
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("ERRORMSG", "ALARM_ID为空！");
			context.getResponse().putData("DATA", "");
		}
	}
	
	private void getFirstHandleInfo(List<Map<String, Object>> result, String alarmTime) {
		Map<String, Object> map = new HashMap<>();
		map.put("TIME", alarmTime);
		map.put("CONTENT", "触发告警");
		map.put("ID", "");
		result.add(map);
	}

	
	@BeanService(id = "addArrest", description = "添加确定抓捕信息", isLog = "true", type = "remote")
	public void addArrest(RequestContext context) throws Exception{
		Map<String, Object> map = context.getParameters();
		String opType = StringUtil.toString(context.getParameter("OP_TYPE")); // 1：签收 2：反馈
		opType="9";//已抓
		map.put("OP_TYPE",opType);
		map.put("HANDLE_TIME",DateUtil.getDateTime());
		map.put("IS_TIMEOUT",0);
		map.put("HANDLE_USER", context.getUserCode());
		String personId = StringUtil.toString(context.getParameter("PERSON_ID"));
		alarmHandleRecordDao.insertAlarmHandleRecord(map);
		faceDispatchedPersonDao.updatePersonStatus(PersonStatus.ALARM_SUCC_CAPTURE.getType(),DateUtil.getDateTime(),personId);
		
		String resultMsg = "确定抓捕信息成功";
		//确认抓捕后的直接撤控
		String NEED_DISPATCHED_PERSON_STATUS = AppHandle.getHandle(Constants.APP_NAME).getProperty("CATCH_CONFIRM", "0");
		if(StringUtils.equals(NEED_DISPATCHED_PERSON_STATUS, "1")){
			
			List<Map<String, Object>> personInfoMapList = faceDispatchedPersonDao.queryByPersonId(personId);
			if(personInfoMapList.size() > 0){
				Map<String, Object> personInfoMap = personInfoMapList.get(0);
				String resultPostString = autoRemoveDispatched(StringUtil.toString(personInfoMap.get("DB_ID")), personId,context);
				if(StringUtils.isBlank(resultPostString)){
					resultMsg += ",且人员撤控成功";
				}else{
					resultMsg += ",但人员撤控失败,失败原因:" + resultPostString;
					ServiceLog.info(">>>>>>>>>【确认抓捕】撤控失败，失败原因：" + resultPostString);
				}
			}else{
				resultMsg += ",但人员撤控失败,失败原因:布控库查无该人员信息";
			}
		}
		context.getResponse().putData("CODE", "0");
		context.getResponse().putData("MESSAGE", resultMsg);
	}
	
	/**
	 * 撤控接口
	 * @param personJson
	 * @throws Exception
	 */
	private String autoRemoveDispatched(String dbId ,String personId,RequestContext context) throws Exception{
		
		Map<String, Object> params = new HashMap<>();
		Map<String, String> headers = new HashMap<>();
		
		String userList= "";
		String resultMsg = "自动撤控异常！";
		List<Map<String, Object>> sysUserList = alarmHandleRecordDao.querySysUserInfo(personId);
		if(sysUserList.size() > 0){
			Map<String, Object> map = sysUserList.get(0);
			String deptCode = StringUtil.toString(map.get("DEPT_CODE"),"");
			if(StringUtils.isNotBlank(deptCode)){
				if(deptCode.length() > 4){
					deptCode = deptCode.substring(0, deptCode.length()-2);
				}
				List<Map<String, Object>> sysUserListMap = alarmHandleRecordDao.querySysUserList(deptCode);
				if(sysUserListMap.size() >0){
					for (Map<String, Object> map2 : sysUserListMap) {
						userList += StringUtil.toString(map2.get("USER_CODE")) + ",";
					}
					if(StringUtils.isNotBlank(userList)){
						context.putParameter("AUDIT_USER", userList);//审核人
						context.putParameter("APPROVE_USER", userList);//审批人
						context.putParameter("APPROVE_STATUS", 5);
						context.putParameter("PROCESS_RESULT", 0);
						context.putParameter("PROCESS_TYPE", 3);
						context.putParameter("remoteUser", "admin");
						context.putParameter("TASK_ID", personId);
						context.putParameter("DB_ID", dbId);
						context.putParameter("PROCESS_REMARK", "确认抓捕后自动撤控");
						context.putParameter("elementId", "data");
				        if (EAP.bean.contains("face/dispatchedApprove/add")) {
					        ((ILocalComponent)EAP.bean.get("face/dispatchedApprove/add")).invoke(new Object[] {context});
					        ServiceLog.info("result : " + JSONObject.toJSONString(context.getResponse().getResult()));
					        Map<String, Object> result = (Map<String, Object>)context.getResponse().getResult();
					        if (Constants.RETURN_CODE_SUCCESS != (int)result.get("CODE")) {
					        	return StringUtil.toString(context.getResponse().getResult());
					        }else{
					        	return "";
					        }
				        }
//						String result = HttpUtil.post(REMOVE_DISPATCHED_PERSON_URL, params, headers);
//						ServiceLog.info(">>>>>>>>>>>>反馈已抓捕直接撤控接口返回数据:" + result);
						//return translateResult(result);
					}else{
						resultMsg = "审核人添加失败！";
					}
				}else{
					resultMsg = "布控单位上级单位查询失败！";
				}
			}else{
				resultMsg = "部门编码获取失败！";
			}
		}else{
			resultMsg = "查询部门信息失败！";
		}
		return resultMsg;
	}
	
	/**
	 * 解析返回结果
	 * @param result
	 * @return
	 */
	private String translateResult(String result){
		JSONObject resultJson = JSONObject.parseObject(result);
		String code = resultJson.getString("CODE");
		if("0".equals(code)){
			return "";
		}
		return result;
	}
}
