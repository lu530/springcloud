package com.suntek.efacecloud.service;

import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSONArray;
import com.suntek.eap.EAP;
import com.suntek.eap.common.log.ServiceLog;
import com.suntek.eap.pico.ILocalComponent;
import com.suntek.efacecloud.dao.FaceDispatchedPersonDao;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.PersonStatus;
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
	private FaceDispatchedPersonDao faceDispatchedPersonDao=new FaceDispatchedPersonDao();

	@BeanService(id = "accessFeedBackInfo", description = "接收品高APP告警反馈信息", isLog = "true", type = "remote")
	public void add(RequestContext context) throws Exception {
		String result = StringUtil.toString(req.getRequestBodyParam(context),"");
		if(StringUtils.isNotBlank(result)){
			JSONObject resultJson = JSONObject.parseObject(result);
			String ret = jsonDataValidate(resultJson);
			if(StringUtils.isBlank(ret)){
				JSONObject handleResult = new JSONObject();
				String alarmId = resultJson.getString("ALARM_ID");
				JSONArray imgList = JSONArray.parseArray(resultJson.getString("IMGLIST"));

				String is_errorinfo = resultJson.getString("IS_ERRORINFO");
				String is_found = resultJson.getString("IS_FOUND");
				String is_consistent = resultJson.getString("IS_CONSISTENT");

				Log.requestPingGaoLog.info(">>>>>>>>>>>>>["+alarmId+"]接收品高告警反馈ALARM_ID：" + alarmId);

				handleResult.put("IS_ERRORINFO", is_errorinfo);
				handleResult.put("IS_ARREST_SUSPICIOUS", is_found);
				handleResult.put("IS_SUSPICIOUS_PERSONS", is_consistent);
				handleResult.put("NOTE", resultJson.getString("NOTE"));
				handleResult.put("IMGLIST", imgList);

				List<Map<String, Object>> mapList = alarmHandleRecordDao.queryAlarmInfoByAlarmId(alarmId);
				if(mapList.size() > 0){
					Map<String, Object> map = mapList.get(0);
					String personId = com.suntek.eap.util.StringUtil.toString(map.get("PERSON_ID"));

					Log.requestPingGaoLog.info(">>>>>>>>>>>>>["+alarmId+"]PERSON_ID：" + alarmId);

					//检查是否需要补签
					if (alarmHandleRecordDao.isAlarmSignIn(resultJson.getString("ALARM_ID")) == false) {
						Map<String, Object> signMap = new HashMap<String, Object>();
						JSONObject signJson = new JSONObject();
						signJson.put("SIGN", 1);
						signMap.put("PERSON_ID", StringUtil.toString(map.get("PERSON_ID")));
						signMap.put("ALARM_ID", resultJson.getString("ALARM_ID"));
						signMap.put("HANDLE_USER", resultJson.getString("HANDLE_USER"));
						signMap.put("IS_TIMEOUT", alarmSignTimeOut(Integer.parseInt(StringUtil.toString(map.get("TASK_LEVEL"))), 
								resultJson.getString("HANDLE_TIME"), StringUtil.toString(map.get("ALARM_TIME"))));
						signMap.put("HANDLE_RESULT", signJson.toString());
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
					record.put("HANDLE_RESULT", handleResult.toString());
					record.put("HANDLE_TIME", resultJson.getString("HANDLE_TIME"));
					record.put("OP_TYPE", optype);	
					
					alarmHandleRecordDao.insertAlarmHandleRecord(record);

                    Log.requestPingGaoLog.info(">>>>>>>>>>>>>["+alarmId+"]接收品高告警反馈信息插入成功!");

                    String resultMsg = "提交成功";

					//确认抓捕
					if(optype == 9){
						List<Map<String, Object>> personInfoMapList = faceDispatchedPersonDao.queryByPersonId(personId);
						if(personInfoMapList.size() > 0){
							Map<String, Object> personInfoMap = personInfoMapList.get(0);
							String resultPostString = autoRemoveDispatched(com.suntek.eap.util.StringUtil.toString(personInfoMap.get("DB_ID")), personId, context);
							if(StringUtils.isBlank(resultPostString)){
								String NEED_APPROVE = AppHandle.getHandle(Constants.APP_EFACESURVEILLANCE).getProperty("NEED_APPROVE", "0");
								Log.requestPingGaoLog.info(">>>>>>>>>>>>>["+alarmId+"]撤控成功");
								if("1".equals(NEED_APPROVE)){
									resultMsg += ",且已成功撤控,人员撤控已开启撤控审批,请到人员布控——撤控管理中审核";
								}else{
									resultMsg += ",且已成功撤控";
								}
							}else{
								Log.requestPingGaoLog.info(">>>>>>>>>>>>>["+alarmId+"]人员撤控失败,失败原因:" + resultPostString);
								resultMsg += ",但人员撤控失败,失败原因:" + resultPostString;
							}
						}else{
							Log.requestPingGaoLog.info(">>>>>>>>>>>>>["+alarmId+"]人员撤控失败,失败原因:布控库查无该人员信息");
							resultMsg += ",但人员撤控失败,失败原因:布控库查无该人员信息";
						}
					}

					context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
					context.getResponse().putData("MESSAGE", "提交成功");
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
			return "提交失败，ALARM_ID为空！";
		}
		
		if(StringUtils.isBlank(json.getString("HANDLE_USER"))){
			return "提交失败，HANDLE_USER为空！";
		}
		
		if(StringUtils.isBlank(json.getString("HANDLE_TIME"))){
			return "提交失败，HANDLE_TIME为空！";
		}
		
		if(StringUtils.isBlank(json.getString("IS_ERRORINFO"))){
			return "提交失败，IS_ERRORINFO为空！";
		}
		
		if(StringUtils.isBlank(json.getString("IS_FOUND"))){
			return "提交失败，IS_FOUND为空！";
		}
		
		if(StringUtils.isBlank(json.getString("IS_CONSISTENT"))){
			return "提交失败，IS_CONSISTENT为空！";
		}
		if(StringUtils.isBlank(json.getString("IMGLIST"))){
			return "提交失败，IMGLIST为空！";
		}else{
            JSONArray array = JSONArray.parseArray(json.getString("IMGLIST"));
            if(array.size() == 0 || array.size() > 3){
                return "提交失败，IMGLIST为0或超出上传上限，上限为3张图片！";
            }
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

	/**
	 * 撤控接口
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
			String deptCode = com.suntek.eap.util.StringUtil.toString(map.get("DEPT_CODE"),"");
			if(StringUtils.isNotBlank(deptCode)){
				if(deptCode.length() > 4){
					deptCode = deptCode.substring(0, deptCode.length()-2);
				}
				List<Map<String, Object>> sysUserListMap = alarmHandleRecordDao.querySysUserList(deptCode);
				if(sysUserListMap.size() >0){
					for (Map<String, Object> map2 : sysUserListMap) {
						userList += com.suntek.eap.util.StringUtil.toString(map2.get("USER_CODE")) + ",";
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
								return com.suntek.eap.util.StringUtil.toString(context.getResponse().getResult());
							}else{
								return "";
							}
						}
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
}
