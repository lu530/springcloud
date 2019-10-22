package com.suntek.efacecloud.service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.apache.commons.lang.StringUtils;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.log.ServiceLog;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.pico.ILocalComponent;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.AlarmHandleRecordDao;
import com.suntek.efacecloud.dao.FaceDispatchedPersonDao;
import com.suntek.efacecloud.dao.FaceSchedulingDao;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.CommonUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.HttpUtil;
import com.suntek.efacecloud.util.PersonStatus;
import com.suntek.elastic.rdd.util.StringUtil;
import com.suntek.sp.sms.util.SmsUtil;

/**
 * 警情调度服务
 * 
 * @author wangshaotao,wangsh
 * @since
 * @version 2018年9月11日
 */
@LocalComponent(id = "face/faceScheduling")
public class FaceSchedulingService {
	
	private AlarmHandleRecordDao alarmHandleRecordDao = new AlarmHandleRecordDao();
	FaceSchedulingDao faceSchedulingDao = new FaceSchedulingDao();
	private FaceDispatchedPersonDao faceDispatchedPersonDao = new FaceDispatchedPersonDao();

	private String serverIp = AppHandle.getHandle(Constants.CONSOLE).getProperty("TOMCAT_SERVER_IP", "127.0.0.1");
	private String serverPort = AppHandle.getHandle(Constants.CONSOLE).getProperty("TOMCAT_SERVER_PORT", "9080");
	private final String REMOVE_DISPATCHED_PERSON_URL = "http://"+serverIp+":"+serverPort+"/"+Constants.APP_EFACESURVEILLANCE+"/mx/v6/face/dispatchedApprove/add";
	
	/**
	 * 警情下发服务
	 * 
	 * @author wangshaotao,wangsh
	 * @since
	 * @version 2018年9月11日
	 */
	@BeanService(id = "addTask", type = "remote", description = "警情下发服务", since = "3.1.2")
	public void alarmSend(RequestContext context) throws Exception {
		Map<String, Object> params = context.getParameters();
		String taskId = StringUtil.toString(params.get("TASK_ID")).equals("") ? EAP.keyTool.getUUID()
				: StringUtil.toString(params.get("TASK_ID"));
		String userCodes = StringUtil.toString(params.get("USER_CODES"));
		String identityID = StringUtil.toString(params.get("IDENTITY_ID"));
		String relId = StringUtil.toString(params.get("REL_ID"));
		String remark = StringUtil.toString(params.get("REMARK"));
		String taskType = StringUtil.toString(params.get("TASK_TYPE"), "1");
		String taskLevel = StringUtil.toString(params.get("TASK_LEVEL"), "0");
		// String sender = context.getUserCode();
		String sender = StringUtil.toString(params.get("SENDER"), context.getUserCode());
		String[] userCodeArr = userCodes.split(",");
		List<Map<String, Object>> taskList = new ArrayList<>();
		List<Map<String, Object>> recordList = new ArrayList<>();
		for (String userCode : userCodeArr) {
			Map<String, Object> taskParams = new HashMap<>();
			String dispatchId = EAP.keyTool.getUUID();
			taskParams.put("DISPATCH_ID", dispatchId);
			taskParams.put("TASK_TYPE", taskType);
			taskParams.put("TASK_ID", taskId);
			taskParams.put("REL_ID", relId);
			taskParams.put("IDENTITY_ID", identityID);
			taskParams.put("SENDER", sender);
			taskParams.put("ACCEPTER", userCode);
			taskParams.put("CREATE_TIME", DateUtil.getDateTime());
			taskParams.put("TASK_LEVEL", taskLevel);
			taskParams.put("IS_SEND", "0");// 初始化未推送给手机客户端
			taskParams.put("TASK_STATUS", Constants.TASK_STATUS_UNACCEPT);
			taskParams.put("REMARK", remark);
			taskList.add(taskParams);
			Map<String, Object> recordParams = new HashMap<>();
			recordParams.put("DISPATCH_ID", dispatchId);
			recordParams.put("STATUS", Constants.TASK_STATUS_UNACCEPT);
			recordParams.put("CREATE_TIME", DateUtil.getDateTime());
			recordParams.put("UPDATE_TIME", DateUtil.getDateTime());
			recordParams.put("REMARK", remark);
			recordParams.put("USER_CODE", sender);
			recordList.add(recordParams);

			List<Map<String, Object>> userList = faceSchedulingDao.getUserData(userCode);
			if (userList.size() > 0) {
				// 获取用户绑定的手机号码
				String telephone = (String) userList.get(0).get("TELEPHONE");
				if (telephone != null && isMobile(telephone)) {
					// 发送短信
					String dataTime = DateUtil.toString(new Date(), "yyyy-MM-dd HH:mm");
					SmsUtil.sendSms(telephone, "", dataTime + " 你有新的警情任务，请及时处理！");
				}
			}
		}
		String oldDispatchId = StringUtil.toString(params.get("DISPATCH_ID"));
		try {
			if (!StringUtil.isEmpty(oldDispatchId)) {
				taskSend(context);
			}
			faceSchedulingDao.addTask(taskList, recordList);
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "下发成功");
		} catch (Exception e) {
			ServiceLog.error(e);
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "下发失败" + e.getMessage());
		}

	}

	/**
	 * 校验手机号
	 * 
	 * @param mobile
	 * @return 校验通过返回true，否则返回false
	 */
	public static boolean isMobile(String mobile) {
		return Pattern.matches("^((17[0-9])|(14[0-9])|(13[0-9])|(15[^4,\\D])|(18[0,5-9]))\\d{8}$", mobile);
	}

	/**
	 * 警情继续下发服务
	 * 
	 * @author wangshaotao,wangsh
	 * @since
	 * @version 2018年9月11日
	 */
	private void taskSend(RequestContext context) throws Exception {
		Map<String, Object> params = context.getParameters();
		String remark = StringUtil.toString(params.get("REMARK"));
		String dispatchId = StringUtil.toString(params.get("DISPATCH_ID"));
		Map<String, Object> taskParams = new HashMap<>();
		taskParams.put("DISPATCH_ID", dispatchId);
		taskParams.put("TASK_STATUS", Constants.TASK_STATUS_SENT);

		Map<String, Object> recordParams = new HashMap<>();
		recordParams.put("DISPATCH_ID", dispatchId);
		recordParams.put("STATUS", Constants.TASK_STATUS_SENT);
		recordParams.put("CREATE_TIME", DateUtil.getDateTime());
		recordParams.put("UPDATE_TIME", DateUtil.getDateTime());
		recordParams.put("REMARK", remark);
		recordParams.put("USER_CODE", context.getUserCode());
		recordParams.put("IS_TIMEOUT", 0);
		faceSchedulingDao.addRecord(taskParams, recordParams);
	}

	/**
	 * 删除警情服务
	 * 
	 * @author wangshaotao,wangsh
	 * @since
	 * @version 2018年9月11日
	 */
	@BeanService(id = "removeTask", type = "remote", description = "删除警情服务", since = "3.1.2")
	public void removeTask(RequestContext context) throws Exception {
		Map<String, Object> params = context.getParameters();
		String dispatchIds = StringUtil.toString(params.get("DISPATCH_ID"));

		try {
			faceSchedulingDao.delTask(dispatchIds);
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "删除成功");
		} catch (Exception e) {
			ServiceLog.error(e);
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "删除失败" + e.getMessage());
		}
	}

	/**
	 * 手机端获取实时下发警情数据
	 * 
	 * @author wangshaotao,wangsh
	 * @since
	 * @version 2018年9月11日
	 */
	@QueryService(id = "real/taskList", type = "remote", description = "手机端获取实时下发警情数据", since = "3.0.0")
	public void queryRealTaskList(RequestContext context) {
		List<Map<String, Object>> list = faceSchedulingDao.getRealTaskList(context.getUserCode());
		if (list.size() > 0) {
			List<String> ids = list.stream().map(x -> StringUtil.toString(x.get("ID"))).collect(Collectors.toList());
			faceSchedulingDao.updateSendStatus(ids);
		}
		context.getResponse().putData("DATA", list);
		context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
		context.getResponse().putData("MESSAGE", "查询成功");
	}

	/**
	 * 警情签收服务
	 * 
	 * @author wangshaotao,wangsh
	 * @since
	 * @version 2018年9月11日
	 */
	@BeanService(id = "taskSign", type = "remote", description = "警情签收服务", since = "3.1.2")
	public void alarmSign(RequestContext context) throws Exception {
		Map<String, Object> params = context.getParameters();
		// String remark = StringUtil.toString(params.get("REMARK"));
		String dispatchId = StringUtil.toString(params.get("DISPATCH_ID"));
		String createTime = StringUtil.toString(params.get("CREATE_TIME"));
		Map<String, Object> taskParams = new HashMap<>();
		taskParams.put("DISPATCH_ID", dispatchId);
		taskParams.put("TASK_STATUS", Constants.TASK_STATUS_ACCEPT);

		Map<String, Object> recordParams = new HashMap<>();
		String handleTime = DateUtil.getDateTime();
		String policeTaskTimeout = AppHandle.getHandle(Constants.APP_NAME).getProperty("POLICE_TASK_TIMEOUT", "3");
		long diff = DateUtil.diff(Calendar.SECOND, DateUtil.toDate(handleTime), DateUtil.toDate(createTime));
		recordParams.put("DISPATCH_ID", dispatchId);
		recordParams.put("STATUS", Constants.TASK_STATUS_ACCEPT);
		recordParams.put("CREATE_TIME", handleTime);
		recordParams.put("UPDATE_TIME", handleTime);
		// recordParams.put("REMARK", remark);
		recordParams.put("REMARK", null);
		recordParams.put("USER_CODE", context.getUserCode());
		recordParams.put("IS_TIMEOUT", diff > Integer.parseInt(policeTaskTimeout) * 60 ? 1 : 0);
		try {
			faceSchedulingDao.addRecord(taskParams, recordParams);
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "签收成功");
		} catch (Exception e) {
			ServiceLog.error(e);
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "签收失败" + e.getMessage());
		}
	}

	/**
	 * 警情反馈服务
	 * 
	 * @author wangshaotao,wangsh
	 * @since
	 * @version 2018年9月11日
	 */
	@BeanService(id = "taskFeedback", type = "remote", description = "警情反馈服务", since = "3.1.2")
	public void alarmFeedback(RequestContext context) throws Exception {
		Map<String, Object> params = context.getParameters();
		boolean isArrest = false;
		String remark = StringUtil.toString(params.get("REMARK"));

		String NEED_DISPATCHED_PERSON_STATUS = AppHandle.getHandle(Constants.APP_NAME)
				.getProperty("NEED_DISPATCHED_PERSON_STATUS", "0");

		JSONArray remarkJsonList = JSONArray.parseArray(remark);

		String dispatchId = StringUtil.toString(params.get("DISPATCH_ID"));
		String id = StringUtil.toString(params.get("ID"));
		if (StringUtil.isEmpty(dispatchId)) {
			beforeTaskFeedBack(context);
			String relId = StringUtil.toString(context.getParameter("ALARM_ID"));
			// 通过签收人和告警Id,获取dispatchId
			List<Map<String, Object>> accepterList = faceSchedulingDao.getTaskInfoByAlarmIdAndAccepter(relId,
					context.getUserCode());
			dispatchId = StringUtil.toString(accepterList.get(0).get("DISPATCH_ID"));
			List<Map<String, Object>> idList = faceSchedulingDao.getRecordInfoByDispatchId(dispatchId);
			if (idList.size() > 0) {
				id = StringUtil.toString(idList.get(0).get("ID"));
			}
		}

        String resultMsg = "反馈成功";
		
		if (NEED_DISPATCHED_PERSON_STATUS.equals("1")) {
			// 出警
			String isPoliceOut = "0";
			// 特征
			String isSexMatching = "0";
			String isIdentityIdMatching = "0";
			String isAppearanceMatching = "0";

			String isFound = "0";
			String isControl = "0";
			String isConsistent = "0";

			// 确认是否本人，仅湛江使用
			String isErrorInfo = "0";
			// 确认抓捕可疑人员，仅湛江使用
			String isArrestSuspicious = "0";
			// 确认可疑人员身份是否与告警一致，仅湛江使用
			String isSuspiciousPersons = "0";

			// 取出反馈信息
			for (int i = 0; i < remarkJsonList.size(); i++) {
				JSONObject remarkObj = remarkJsonList.getJSONObject(i);
				String key = remarkObj.getString("key");

				if ("IS_CONSISTENT".equals(key)) {
					String value = remarkObj.getString("value");
					if (value.equals("是")) {
						isConsistent = "1";
					}
				}
				if ("IS_POLICE_OUT".equals(key)) {
					String value = remarkObj.getString("value");
					if (value.equals("是")) {
						isPoliceOut = "1";
					}
				}
				if ("IS_SEX_MATCHING".equals(key)) {
					String value = remarkObj.getString("value");
					if (value.equals("是")) {
						isSexMatching = "1";
					}
				}
				if ("IS_IDENTITY_ID_MATCHING".equals(key)) {
					String value = remarkObj.getString("value");
					if (value.equals("是")) {
						isIdentityIdMatching = "1";
					}
				}
				if ("IS_APPEARANCE_MATCHING".equals(key)) {
					String value = remarkObj.getString("value");
					if (value.equals("是")) {
						isAppearanceMatching = "1";
					}
				}
				if ("IS_FOUND".equals(key)) {
					String value = remarkObj.getString("value");
					if (value.equals("是")) {
						isFound = "1";
					}
				}
				if ("IS_CONTROL".equals(key)) {
					String value = remarkObj.getString("value");
					if (value.equals("是")) {
						isControl = "1";
					}
				}
				if ("IS_CONSISTENT".equals(key)) {
					String value = remarkObj.getString("value");
					if (value.equals("是")) {
						isConsistent = "1";
					}
				}
				
				if ("IS_ERRORINFO".equals(key)) {
					String value = remarkObj.getString("value");
					if (value.equals("是")) {
						isErrorInfo = "1";
					}
				}

				if ("isArrestSuspicious".equals(key)) {
					String value = remarkObj.getString("value");
					if (value.equals("是")) {
						isArrestSuspicious = "1";
					}
				}

				if ("isSuspiciousPersons".equals(key)) {
					String value = remarkObj.getString("value");
					if (value.equals("是")) {
						isSuspiciousPersons = "1";
					}
				}



			}
            int status = PersonStatus.FEDBACK.getType();
			//是否确认本人
			if ("0".equals(isErrorInfo) || ("1".equals(isErrorInfo) && "0".equals(isArrestSuspicious))) {
				status = PersonStatus.ALARM_NOT_CAPTURE.getType();
				//确认非嫌疑人
			}else if("1".equals(isErrorInfo) && "1".equals(isArrestSuspicious) && "0".equals(isSuspiciousPersons)){
				status = PersonStatus.CONFIRM_NONSUSPECT.getType();
				//抓捕成功
			}else if("1".equals(isErrorInfo) && "1".equals(isArrestSuspicious) && "1".equals(isSuspiciousPersons)){
				status = PersonStatus.ALARM_SUCC_CAPTURE.getType();
			}

			// 更新人员状态
			String personId = StringUtil.toString(params.get("PERSON_ID"));
			ServiceLog.debug("状态：" + status + "人员ID:" + personId);
			faceDispatchedPersonDao.updatePersonStatus(status, DateUtil.getDateTime(), personId);

			//确认抓捕后的直接撤控
			if(status == PersonStatus.ALARM_SUCC_CAPTURE.getType()){
				
				List<Map<String, Object>> personInfoMapList = faceDispatchedPersonDao.queryByPersonId(personId);
				if(personInfoMapList.size() > 0){
					Map<String, Object> personInfoMap = personInfoMapList.get(0);
					String resultPostString = autoRemoveDispatched(StringUtil.toString(personInfoMap.get("DB_ID")), personId);
					if(StringUtils.isBlank(resultPostString)){
						resultMsg += ",且已成功撤控";
						ServiceLog.info(">>>>>>>>>反馈直接撤控失败");
					}else{
						resultMsg += ",但人员撤控失败,失败原因:" + resultPostString;
					}
				}else{
					resultMsg += ",但人员撤控失败,失败原因:布控库查无该人员信息";
				}
			}
			
		}
		// String dispatchId = StringUtil.toString(params.get("DISPATCH_ID"));
		// String id = StringUtil.toString(params.get("ID"));
		String remarkId = EAP.keyTool.getUUID();
		Map<String, Object> taskParams = new HashMap<>();
		taskParams.put("DISPATCH_ID", dispatchId);
		taskParams.put("TASK_STATUS", isArrest ? Constants.TASK_STATUS_ARREST : Constants.TASK_STATUS_HANDLED);

		Map<String, Object> recordParams = new HashMap<>();
		recordParams.put("ID", id);
		recordParams.put("DISPATCH_ID", dispatchId);
		recordParams.put("STATUS", Constants.TASK_STATUS_HANDLED);
		recordParams.put("CREATE_TIME", DateUtil.getDateTime());
		recordParams.put("UPDATE_TIME", DateUtil.getDateTime());
		recordParams.put("REMARK", remarkId);
		recordParams.put("USER_CODE", context.getUserCode());
		recordParams.put("IS_TIMEOUT", 0);
		try {
			faceSchedulingDao.addRecord(taskParams, recordParams);
			for (int i = 0; i < remarkJsonList.size(); i++) {
				JSONObject remarkObj = remarkJsonList.getJSONObject(i);
				Map<String, Object> remarkParams = new HashMap<>();
				remarkParams.put("DISPATCH_ID", dispatchId);
				remarkParams.put("REMARK_ID", remarkId);
				remarkParams.put("SERIAL_NUMBER", i);
				remarkParams.put("CREATE_TIME", StringUtil.toString(remarkObj.get("time")));
				remarkParams.put("REMARK_KEY", StringUtil.toString(remarkObj.get("key")));
				remarkParams.put("REMARK_NAME", StringUtil.toString(remarkObj.get("name")));
				remarkParams.put("REMARK_VALUE", StringUtil.toString(remarkObj.get("value")));
				remarkParams.put("REMARK_NOTE", StringUtil.toString(remarkObj.get("note")));
				remarkParams.put("REMARK_FILE", StringUtil.toString(remarkObj.get("file")));
				faceSchedulingDao.addRemark(remarkParams);
			}
			/*****/
			sendExtralPost(context, remark);
			/*****/
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", resultMsg);
		} catch (Exception e) {
			ServiceLog.error(e);
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "反馈失败" + e.getMessage());
		}
	}

	/**
	 * 获取警情详情服务
	 * 
	 * @author wangshaotao,wangsh
	 * @since
	 * @version 2018年9月11日
	 */
	@BeanService(id = "getTaskDetail", type = "remote", description = "获取警情详情服务", since = "3.1.2")
	public void getTaskDetail(RequestContext context) throws Exception {
		Map<String, Object> params = context.getParameters();
		String dispatchId = StringUtil.toString(params.get("DISPATCH_ID"));
		Map<String, Object> data = faceSchedulingDao.getTaskDetail(dispatchId);
		context.getResponse().putData("DATA", data);
		context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
		context.getResponse().putData("MESSAGE", "查询成功");
	}

	/**
	 * 获取反馈记录服务
	 * 
	 * @author wangshaotao,wangsh
	 * @since
	 * @version 2018年9月11日
	 */
	@BeanService(id = "getRecord", type = "remote", description = "获取反馈记录服务", since = "3.1.2")
	public void getRecord(RequestContext context) throws Exception {
		Map<String, Object> params = context.getParameters();
		String dispatchId = StringUtil.toString(params.get("DISPATCH_ID"));
		Map<String, Object> data = faceSchedulingDao.getRecord(dispatchId, Constants.TASK_STATUS_HANDLED);
		context.getResponse().putData("DATA", data);
		context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
		context.getResponse().putData("MESSAGE", "查询成功");
	}

	/**
	 * 获取警情处置记录服务
	 * 
	 * @author wangshaotao,wangsh
	 * @since
	 * @version 2018年9月11日
	 */
	@BeanService(id = "getRecordList", type = "remote", description = "获取警情处置记录服务", since = "3.1.2")
	public void getRecordList(RequestContext context) throws Exception {
		Map<String, Object> params = context.getParameters();
		String taskId = StringUtil.toString(params.get("TASK_ID"));
		String userId = StringUtil.toString(params.get("USER_ID"));
		List<Map<String, Object>> list = faceSchedulingDao.getRecordDataList(taskId, userId);
		context.getResponse().putData("DATA", list);
		context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
		context.getResponse().putData("MESSAGE", "查询成功");
	}

	/**
	 * 获取警情详情及处置记录服务
	 * 
	 * @author wangshaotao,wangsh
	 * @since
	 * @version 2018年9月11日
	 */
	@BeanService(id = "getDetailAndRecordList", type = "remote", description = "获取警情详情及处置记录服务", since = "3.1.2")
	public void getTaskDetailAndRecord(RequestContext context) throws Exception {
		Map<String, Object> params = context.getParameters();
		String taskId = StringUtil.toString(params.get("TASK_ID"));
		String dispatchId = StringUtil.toString(params.get("DISPATCH_ID"));
		String userId = StringUtil.toString(params.get("USER_ID"));
		Map<String, Object> result = new HashMap<>();
		Map<String, Object> task = faceSchedulingDao.getTaskDetail(dispatchId);
		result.put("TASK", task);
		List<Map<String, Object>> list = faceSchedulingDao.getRecordDataList(taskId, userId);
		for (Map<String, Object> map : list) {
			String remarkId = StringUtil.toString(map.get("REMARK_ID"));
			if (remarkId.length() == 32) {
				List<Map<String, Object>> remarkList = faceSchedulingDao.getRemarkList(dispatchId, remarkId);
				map.put("REMARK", remarkList);
			} else {
				map.put("REMARK", remarkId);// 兼容旧版本
			}
		}
		result.put("RECORD", list);
		context.getResponse().putData("DATA", result);
		context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
		context.getResponse().putData("MESSAGE", "查询成功");
	}

	/**
	 * 获取反馈
	 * 
	 * @author wangshaotao,wangsh
	 * @since
	 * @version 2018年9月11日
	 */
	@BeanService(id = "getFeedback", type = "remote", description = "获取反馈", since = "3.1.2")
	public void getFeedback(RequestContext context) throws Exception {
		Map<String, Object> params = context.getParameters();
		String dispatchId = StringUtil.toString(params.get("DISPATCH_ID"));
		String feedback = faceSchedulingDao.getFeedback(dispatchId);
		context.getResponse().putData("DATA", feedback);
		context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
		context.getResponse().putData("MESSAGE", "查询成功");
	}

	@BeanService(id = "getDetailsAndRecordLists", type = "remote", description = "获取警情详情及处置记录服务", since = "3.1.2")
	public void getDetailsAndRecordLists(RequestContext context) throws Exception {
		Map<String, Object> params = context.getParameters();
		String taskid = StringUtil.toString(params.get("TASK_ID"));
		String[] taskids = taskid.split(",");
		String userId = null;
		List<List<Map<String, Object>>> listss = new ArrayList<>();
		for (String each : taskids) {
			List<Map<String, Object>> list = faceSchedulingDao.getRecordDataList(each, userId);
			listss.add(list);
		}
		Map<String, Object> result = new HashMap<>();
		result.put("RECORD", listss);
		context.getResponse().putData("DATA", result);
		context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
		context.getResponse().putData("MESSAGE", "查询成功");
	}

	/*
	 * 整合人脸告警-告警确认 和 警情下发-反馈 的功能
	 */
	private void beforeTaskFeedBack(RequestContext context) throws Exception {
		Map<String, Object> params = context.getParameters();
		// 判断当前有无警情下发动作，是否下发给当前用户
		String relId = StringUtil.toString(params.get("ALARM_ID"));
		String userCode = context.getUserCode();
		// String identityId = StringUtil.toString(params.get("IDENTITY_ID"));
		String remarkStr = "主动请求下发给，" + userCode;
		String dispatchId = "";
		List<Map<String, Object>> taskList = faceSchedulingDao.getTaskInfoByAlarmIdAndAccepter(relId, userCode);

		String taskStatus = "0";
		if (taskList.size() > 0) {
			// 该告警已下发
			dispatchId = StringUtil.toString(taskList.get(0).get("DISPATCH_ID"));
			taskStatus = StringUtil.toString(taskList.get(0).get("TASK_STATUS"));

			if (taskStatus.equals("0")) {
				// 已下发，未接受
				// 触发接收
				context.putParameter("DISPATCH_ID", dispatchId);
				sentAlarmSign(context, remarkStr, relId);
			}
		} else {
			// 告警未下发
			sentAddTask(context, remarkStr, userCode, relId);
			sentAlarmSign(context, remarkStr, relId);
		}
	}

	/*
	 * 下发
	 */
	private void sentAddTask(RequestContext context, String remarkStr, String userCode, String relId) throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();
		context.putParameter("TASK_LEVEL", 0);
		context.putParameter("REMARK", remarkStr);
		context.putParameter("USER_CODES", userCode);
		context.putParameter("TASK_TYPE", 1);
		context.putParameter("REL_ID", relId);
		String identityId = "";
		String sender = "";
		List<Map<String, Object>> alarmIdentityId = faceSchedulingDao.getAlarmIdentityId(relId);
		for (Map<String, Object> alarmIdentityIdMap : alarmIdentityId) {
			String alarmStr = StringUtil.toString(alarmIdentityIdMap.get("OBJECT_EXTEND_INFO"));
			sender = StringUtil.toString(alarmIdentityIdMap.get("CREATOR"));
			JSONObject parseObject = JSONObject.parseObject(alarmStr);
			identityId = StringUtil.toString(parseObject.get("IDENTITY_ID"));
		}
		if (!StringUtil.isEmpty(identityId)) {
			context.putParameter("IDENTITY_ID", identityId);
		}
		if (!StringUtil.isEmpty(sender)) {
			context.putParameter("SENDER", sender);
		}
		alarmSend(context);// 下发

	}

	/*
	 * 签收
	 */
	private void sentAlarmSign(RequestContext context, String remarkStr, String relId) throws Exception {
		String dispatchId = StringUtil.toString(context.getParameter("DISPATCH_ID"));
		if (StringUtil.isEmpty(dispatchId)) {
			List<Map<String, Object>> disPatchIdList = faceSchedulingDao.getTaskInfoByAlarmIdAndRemark(relId,
					remarkStr);
			if (disPatchIdList.size() > 0) {
				for (Map<String, Object> disPatchIdMap : disPatchIdList) {
					if (disPatchIdMap.get("DISPATCH_ID") != null) {
						String dispatchIdNew = StringUtil.toString(disPatchIdMap.get("DISPATCH_ID"));
						context.putParameter("DISPATCH_ID", dispatchIdNew);
						context.putParameter("CREATE_TIME", DateUtil.getDateTime());
						alarmSign(context);// 签收
					}
				}
			}
		} else {
			context.putParameter("DISPATCH_ID", dispatchId);
			context.putParameter("CREATE_TIME", DateUtil.getDateTime());
			alarmSign(context);// 签收
		}

	}

	public void sendExtralPost(RequestContext context, String remark) {

		JSONArray remarkJsonList = JSONArray.parseArray(remark);
		String isConsistent = "0";
		String isCover = "0";
		// 取出反馈信息
		for (int i = 0; i < remarkJsonList.size(); i++) {
			JSONObject remarkObj = remarkJsonList.getJSONObject(i);
			String key = remarkObj.getString("key");
			String response = "";
			if ("IS_CONSISTENT".equals(key)) {
				String value = remarkObj.getString("value");
				if (value.equals("是")) {
					isConsistent = "1";
				} else if (value.equals("否")) {
					isConsistent = "0";
				}
				if (remarkObj.containsKey("url")) {
					String urlStr = CommonUtil.gettTomcatUrl() + StringUtil.toString(remarkObj.get("url"));
					String paramsStr = StringUtil.toString(remarkObj.get("params"));
					JSONObject paramsJson = JSONObject.parseObject(paramsStr);
					String alarmId = StringUtil.toString(paramsJson.get("ALARM_ID"));
					paramsJson.put("CONFIRM_STATUS", isConsistent);
					Map<String, String> headers = new HashMap<String, String>();
					headers.put("Content-Type", "application/json;charset=utf-8");
					headers.put("Accept", "*/*");
					headers.put("Content-Encoding", "UTF-8");
					urlStr += "?CONFIRM_STATUS=" + isConsistent + "&ALARM_ID=" + alarmId;
					ServiceLog.debug("反馈多脸维护：" + urlStr + "，response:" + response);
					try {
						response = HttpUtil.post(urlStr, paramsJson, headers);
					} catch (Exception e) {
						ServiceLog.debug("http请求失败：url:" + urlStr + "," + e.getMessage());
					}
					ServiceLog.debug("反馈多脸维护：" + urlStr + "，response:" + response);

				}
			}

			if ("IS_ADDMORE".equals(key)) {
				String value = remarkObj.getString("value");
				if (value.equals("添加正面")) {
					isCover = "1";
				} else if (value.equals("添加副面")) {
					isCover = "0";
				}
				if (remarkObj.containsKey("url")) {
					// String urlStr = CommonUtil.gettTomcatUrl() +
					// StringUtil.toString(remarkObj.get("url"));
					// String paramsStr =
					// StringUtil.toString(remarkObj.get("params"));
					// JSONObject paramsJson =
					// JSONObject.parseObject(paramsStr);
					// paramsJson.put("IS_COVER", isCover);
					// String alarmId =
					// StringUtil.toString(paramsJson.get("ALARM_ID"));
					// List<Map<String, Object>> alarmInfoByAlarmId =
					// faceSchedulingDao.getAlarmInfoByAlarmId(alarmId);
					// Map<String, Object> alarmInfoMap =
					// alarmInfoByAlarmId.get(0);
					// paramsJson.put("PERSON_ID",
					// alarmInfoMap.get("OBJECT_ID"));
					// paramsJson.put("PIC", alarmInfoMap.get("ALARM_IMG"));
					// paramsJson.put("DB_ID", alarmInfoMap.get("DB_ID"));
					//
					// Map<String, String> headers = new HashMap<String,
					// String>();
					// headers.put("Content-Type",
					// "application/json;charset=utf-8");
					// headers.put("Accept", "*/*");
					// headers.put("Content-Encoding", "UTF-8");
					// urlStr +=
					// "?ALARM_ID="+alarmId+"&IS_COVER="+isCover+"&PERSON_ID="
					// +alarmInfoMap.get("OBJECT_ID")+"&PIC="+alarmInfoMap.get("ALARM_IMG")+"&DB_ID="+alarmInfoMap.get("DB_ID");
					// ServiceLog.debug("反馈多脸维护2：" + urlStr + "，response:" +
					// response);
					// try {
					// response = HttpUtil.post(urlStr, paramsJson, headers);
					// } catch (Exception e) {
					// ServiceLog.debug("http请求失败：url:"+ urlStr + "," +
					// e.getMessage());
					// }
					// ServiceLog.debug("反馈多脸维护2：" + urlStr + "，response:" +
					// response);

					String url = StringUtil.toString(remarkObj.get("url"));
					String urlStr = url.substring(url.indexOf("v6/") + 3);
					String paramsStr = StringUtil.toString(remarkObj.get("params"));
					JSONObject paramsJson = JSONObject.parseObject(paramsStr);
					String alarmId = StringUtil.toString(paramsJson.get("ALARM_ID"));
					List<Map<String, Object>> alarmInfoByAlarmId = faceSchedulingDao.getAlarmInfoByAlarmId(alarmId);
					Map<String, Object> alarmInfoMap = alarmInfoByAlarmId.get(0);
					context.putParameter("PERSON_ID", alarmInfoMap.get("OBJECT_ID"));
					context.putParameter("PIC", alarmInfoMap.get("ALARM_IMG"));
					context.putParameter("DB_ID", alarmInfoMap.get("DB_ID"));
					context.putParameter("IS_COVER", isCover);
					context.putParameter("SOURCE_TYPE", "2");
					try {
						if (EAP.bean.contains(urlStr)) {
							((ILocalComponent) EAP.bean.get(urlStr)).invoke(new Object[] { context });
							ServiceLog.info("result : " + JSONObject.toJSONString(context.getResponse().getResult()));
							Map<String, Object> result = (Map<String, Object>) context.getResponse().getResult();
							if (Constants.RETURN_CODE_SUCCESS != (int) result.get("CODE")) {
								// context.getResponse().putData("MESSAGE",
								// "添加至多脸维护失败");
								// context.getResponse().putData("CODE",
								// Constants.RETURN_CODE_ERROR);
								return;
							}
						} else {
							context.getResponse().putData("MESSAGE", "找不到对应远程服务");
							context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
							return;
						}
					} catch (Exception e) {
						ServiceLog.error(e);
						context.getResponse().putData("MESSAGE", "添加至多脸维护异常");
						context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
						return;
					}
				}
			}

		}
	}

	/**
	 * 将eface_police_task_record表中的remark字段转移到eface_police_task_remark表中
	 * 
	 * @param context
	 * @param remark
	 */
	@BeanService(id = "exportRemarkToRemarkTable", type = "remote", description = "反馈表字段迁移", since = "3.1.2")
	public void exportRemarkToRemarkTable(RequestContext context) {
		List<Map<String, Object>> remarkList = faceSchedulingDao.getRemark("3");
		if (remarkList.size() > 0) {
			for (Map<String, Object> remarkMap : remarkList) {
				String remark = StringUtil.toString(remarkMap.get("REMARK"));
				String dispatchId = StringUtil.toString(remarkMap.get("DISPATCH_ID"));
				if (!StringUtil.isEmpty(remark)) {
					JSONArray remarkArray;
					try {
						remarkArray = JSONArray.parseArray(remark);
					} catch (Exception e) {
						continue;
					}
					List<Map<String, Object>> remarkExists = faceSchedulingDao
							.isRemarkExists(StringUtil.toString(remarkArray.getJSONObject(0).get("time")));
					if (remarkExists.size() > 0) {
						continue;
					}
					String remarkId = EAP.keyTool.getUUID();
					for (int i = 0; i < remarkArray.size(); i++) {
						JSONObject remarkJson = remarkArray.getJSONObject(i);
						Map<String, Object> remarkParams = new HashMap<>();
						remarkParams.put("DISPATCH_ID", dispatchId);
						remarkParams.put("REMARK_ID", remarkId);
						remarkParams.put("SERIAL_NUMBER", i);
						remarkParams.put("CREATE_TIME", StringUtil.toString(remarkJson.get("time")));
						remarkParams.put("REMARK_KEY", StringUtil.toString(remarkJson.get("key")));
						remarkParams.put("REMARK_NAME", StringUtil.toString(remarkJson.get("name")));
						remarkParams.put("REMARK_VALUE", StringUtil.toString(remarkJson.get("value")));
						remarkParams.put("REMARK_NOTE", StringUtil.toString(remarkJson.get("note")));
						remarkParams.put("REMARK_FILE", StringUtil.toString(remarkJson.get("file")));
						try {
							faceSchedulingDao.addRemark(remarkParams);
						} catch (SQLException e) {
							ServiceLog.error("错误:" + e);
						}
					}
				}
			}
		}
	}

	
	/**
	 * 撤控接口
	 * @param personJson
	 * @throws Exception
	 */
	private String autoRemoveDispatched(String dbId ,String personId) throws Exception{
		
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
						params.put("AUDIT_USER", userList);//审核人
						params.put("APPROVE_USER", userList);//审批人
						params.put("APPROVE_STATUS", 5);
						params.put("PROCESS_RESULT", 0);
						params.put("PROCESS_TYPE", 3);
						params.put("remoteUser", "admin");
						params.put("TASK_ID", personId);
						params.put("DB_ID", dbId);
						params.put("PROCESS_REMARK", "确认抓捕后自动撤控");
						params.put("elementId", "data");
						String result = HttpUtil.post(REMOVE_DISPATCHED_PERSON_URL, params, headers);
						ServiceLog.info(">>>>>>>>>>>>反馈已抓捕直接撤控接口返回数据:" + result);
						return translateResult(result);
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
