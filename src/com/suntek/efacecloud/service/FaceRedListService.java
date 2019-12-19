package com.suntek.efacecloud.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.suntek.efacecloud.util.*;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;

import com.suntek.eap.EAP;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.metadata.Dao;
import com.suntek.eap.metadata.DaoProxy;
import com.suntek.eap.org.UserModel;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceRedListDao;
import com.suntek.efacecloud.dao.FaceRedTaskDao;
import com.suntek.efacecloud.util.FaceFeatureUtil.FeatureResp;
import com.suntek.face.compare.sdk.model.CollisionResult;
import com.suntek.sp.sms.util.SmsUtil;

/**
 * 红名单库服务
 * efacecloud/rest/v6/face/redlist
 * @author lx
 * @since 1.0.0
 * @version 2018-03-05
 * @Copyright (C)2018 , Suntektech
 */
@LocalComponent(id = "face/redlist")
public class FaceRedListService 
{
	private FaceRedListDao dao = new FaceRedListDao();
	private FaceRedTaskDao taskDao = new FaceRedTaskDao();
	
	@BeanService(id="add", description="新增或编辑红名单库人脸")
	public void edit(RequestContext context) throws Exception {
		FaceDetectUtil.getFaceRedListUtilInstance().addOrEdit(context);
	}
	
	@BeanService(id="open", description="是否开启红名单", type="remote")
	public void open(RequestContext context) throws Exception
	{
		String status = AppHandle.getHandle(Constants.APP_NAME).getProperty(Constants.RED_LIST_OPEN, "0");//默认不开启红名单
		if(context.getUser().isAdministrator()) { //admin不需要此操作
			status = "0";
		}
		String wartermarkOpen = AppHandle.getHandle(Constants.PORTAL).getProperty("WARTERMARK_OPEN", "0");//默认不开启水印
		
		context.getResponse().putData("STATUS", status);
		context.getResponse().putData("WARTERMARK_OPEN", wartermarkOpen);
	}
	
	@BeanService(id="openSearchCause", description="是否开启查询操作事由", type="remote")
	public void openSearchCause(RequestContext context) throws Exception
	{
		String status = AppHandle.getHandle(Constants.APP_NAME).getProperty(Constants.SEARCH_CAUSE_OPEN, "0");//默认不开启红名单
		if(context.getUser().isAdministrator()) { //admin不需要此操作
			status = "0";
		}
		context.getResponse().putData("STATUS", status);
	}
	
	@BeanService(id="confirmApply", description="确认涉红后是否继续发起申请", type="remote")
	public void confirmApply(RequestContext context) throws Exception
	{
		Map<String, Object> params = context.getParameters();
		String taskId = StringUtil.toString(params.get("TASK_ID"));
		int applyFlag = MapUtils.getIntValue(params, "APPLY_FLAG", 1);
		String expiryDate = StringUtil.toString(params.get("EXPIRY_DATE"),
				DateUtil.getDate());
		if (dao.updateApproveStatus(applyFlag, expiryDate, taskId)) {
			UserModel user = context.getUser();
			sendSmsToAdmin(user.getDept().getName(), user.getName());
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
		} else {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
		}
	}
	
	private void sendSmsToAdmin(String deptName, String userName)
	{
		String enableSendSms = ConfigUtil.getEnableSendSms();
		if (Constants.SEND_MESSAGE_TIMER == Integer.parseInt(enableSendSms)) {
			/*String msmAddress = ConfigUtil.getSendSmsAddress();
			String msmAccount = ConfigUtil.getSendSmsAccount();
			String msmPassword = ConfigUtil.getSendSmsPassword();*/
			String phone = ConfigUtil.getRedApprovalSendPhone();
			if (StringUtil.isEmpty(phone)) {
				ServiceLog.debug("未配置红名单审批管理员发送短信手机号码，本次不发送通知--");
				return;
			}
			
			ServiceLog.debug("确认审批后通知红名单审批管理员--" + phone);

            String content = "您有新的由(" + deptName + "-" + userName + ")发起的红名单审批任务，请及时登录平台进行处理。";
            try {
                SmsUtil.sendSms(phone, "", content);
                //SendSmsUtil.sendSms(msmAddress, phone, content, Constants.SEND_MESSAGE_IMMEDIATELY, Calendar.getInstance(), msmAccount, msmPassword);
            } catch (Exception e) {
                ServiceLog.error("调用短信推送接口异常>>" + e);
            }
        }
    }

    @BeanService(id = "delete", description = "删除红名单库人脸")
    public void delete(RequestContext context) throws Exception {
        try {
            Map<String, Object> params = context.getParameters();
            String personId = StringUtil.toString(params.get("INFO_ID"));
            CollisionResult deleteFaceResult = null;
            String vendor = AppHandle.getHandle(Constants.OPENGW).getProperty("EAPLET_VENDOR", "Suntek");
            if (vendor.equals(Constants.HIK_VENDOR)) {
                deleteFaceResult = HikSdkRedLibUtil.deleteFace(Constants.STATIC_LIB_ID_RED_LIST, personId);
            } else if (vendor.equals("huawei")) {
                deleteFaceResult = HuaWeiSdkRedLibUtil.deleteFace(context);
            } else {
                deleteFaceResult = SdkStaticLibUtil.deleteFace(Constants.STATIC_LIB_ID_RED_LIST, personId, Constants.DEFAULT_ALGO_TYPE);
            }
            if (deleteFaceResult == null || deleteFaceResult.getCode() != 0) {
                context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                context.getResponse().putData("MESSAGE", "从静态小库注销人脸失败！");
                return;
            }

            Dao dao = new DaoProxy(Constants.APP_NAME);
            String[] personIdArr = personId.split(",");
            for (int i = 0; i < personIdArr.length; i++) {
                dao.addSQL("update EFACE_SEARCH_TASK set IS_APPROVE = 1 where TASK_ID in ("
                        + "select TASK_ID from EFACE_SEARCH_TASK_RED_LIST where INFO_ID = ? )", personIdArr[i]);
                dao.addSQL("delete from EFACE_RED_LIST where INFO_ID = ?", personIdArr[i]);
                dao.addSQL("delete from EFACE_SEARCH_TASK_RED_LIST where INFO_ID = ?", personIdArr[i]);
            }

            dao.commit();

            context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
            context.getResponse().putData("MESSAGE", "删除成功");

        } catch (Exception e) {
            context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
            context.getResponse().putData("MESSAGE", "删除失败" + e);
        }
    }

    @BeanService(id = "isChecked", description = "检查案情是否与历史数据符合")
    public void isChecked(RequestContext context) throws Exception {
        Map<String, Object> params = context.getParameters();
        String caseId = StringUtil.toString(params.get("CASE_ID"));
        String caseIdType = StringUtil.toString(params.get("CASE_ID_TYPE"));
        String caseName = StringUtil.toString(params.get("CASE_NAME"));
        int countCase = taskDao.notMatchCaseIdOrName(caseId, caseName, caseIdType, context.getUserCode());
        if (countCase > 0) {
            context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
            context.getResponse().putData("MESSAGE", "案情编号、案情名称与历史数据不符，请检查！");
        } else {
            context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
        }
    }

    @BeanService(id = "belongRedList", description = "查询人员是否涉红名单", type = "remote")
    public void belongRedList(RequestContext context) throws Exception {
        Map<String, Object> params = context.getParameters();

        String userCode = context.getUserCode();
        int belongRedFlag = 1; //1表示 不属于红名单 0 表示属于红名单

        String taskId = EAP.keyTool.getUUID();
        String remoteAddr = context.getRemoteAddr();
        params.put("CREATOR_IP", remoteAddr);
        params.put("TASK_ID", taskId);
        params.put("CREATOR", userCode);
        params.put("CREATE_TIME", DateUtil.getDateTime());
        params.put("IS_APPROVE", 2); //是否审批，未知，等待用户下一步操作才可知
        params.put("APPROVER", ""); //审批人
        params.put("CASE_ID_TYPE", StringUtil.toString(params.get("CASE_ID_TYPE"), "2"));
        params.put("CASE_ID", StringUtil.toString(params.get("CASE_ID")));
        params.put("CASE_NAME", StringUtil.toString(params.get("CASE_NAME")));

        params.put("SAERCH_PARAM", StringUtil.toString(params.get("SAERCH_PARAM")));

        params.put("SEARCH_CAUSE", StringUtil.toString(params.get("SEARCH_CAUSE")));
        params.put("SEARCH_PIC", StringUtil.toString(params.get("SEARCH_PIC")));
        params.put("SEARCH_TYPE", StringUtil.toString(params.get("SEARCH_TYPE")));
        params.put("CAUSE_TYPE", StringUtil.toString(params.get("CAUSE_TYPE"), "3"));

        List<Map<String, Object>> relatedPersons = new ArrayList<Map<String, Object>>();

        //是否开启操作事由 1是0否
        String searchCauseOpen = AppHandle.getHandle(Constants.APP_NAME)
                .getProperty(Constants.SEARCH_CAUSE_OPEN, "0");
        //是否开启红名单 1是0否
        String redListOpen = AppHandle.getHandle(Constants.APP_NAME)
                .getProperty(Constants.RED_LIST_OPEN, "0");
        if (context.getUser().isAdministrator()) { //admin不需要此操作
            searchCauseOpen = "0";
            redListOpen = "0";
        }
        context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
        String picMd5 = "";
        if ("1".equals(searchCauseOpen)) {
            String caseId = StringUtil.toString(params.get("CASE_ID"));
            String caseIdType = StringUtil.toString(params.get("CASE_ID_TYPE"));
            String caseName = StringUtil.toString(params.get("CASE_NAME"));
            int countCase = taskDao.notMatchCaseIdOrName(caseId, caseName, caseIdType, context.getUserCode());
            if (countCase > 0) {
                context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                context.getResponse().putData("MESSAGE", "案情编号、案情名称与历史数据不符，请检查！");
                return;
            }
        }

        if ("1".equals(redListOpen)) {
            String pic = StringUtil.toString(params.get("SEARCH_PIC")); //图片
            boolean needSearchRedList = true;
            if (StringUtil.isEmpty(pic)) {
                needSearchRedList = false;
            } else {
                int redPriv = dao.getRedPriv(context.getUserCode());
                if (redPriv > 0) {
                    needSearchRedList = false;
                }
            }
            if (needSearchRedList) {
                picMd5 = FileMd5Util.getUrlMD5String(ModuleUtil.renderImage(pic));
                Map<String, Object> statusParams = new HashMap<>();
                statusParams.put("PIC_MD5", picMd5);
                statusParams.put("USER_CODE", context.getUserCode());
                List<String> statusList = dao.getTaskRedListStatusByMd5(statusParams);
                if (statusList.size() > 0) {
                    //1通过 2不通过 0待审核
                    if (statusList.contains("1")) {
                        context.getResponse().putData("BELONG_FLAG", belongRedFlag);
                        return;
                    } else if (statusList.contains("2")) {
                        context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                        context.getResponse().putData("MESSAGE", "该人脸为红名单疑似人员[审核不通过]，请检查！");
                        return;
                    } else if (statusList.contains("0")) {
                        context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                        context.getResponse().putData("MESSAGE", "该人脸为红名单疑似人员[未审核]，请等待审核后再操作！");
                        return;
                    }
                }

				String threshold = AppHandle.getHandle(Constants.APP_NAME).getProperty(Constants.RED_SIMILARITY, "87");
				//int actureScore =  Integer.parseInt(String.valueOf(ModuleUtil.renderActualScore(THRESHOLD))); ;
				String vendor = AppHandle.getHandle(Constants.OPENGW).getProperty("EAPLET_VENDOR", "Suntek");
				CollisionResult result = null;
				if (vendor.equals(Constants.HIK_VENDOR)){
					Map<String, Object> searchParam = new HashMap<>();
					searchParam.put("TOP_N", 20);
					searchParam.put("PIC", pic);
					searchParam.put("THRESHOLD", threshold);
					result = HikSdkRedLibUtil.faceOne2NSearch(Constants.STATIC_LIB_ID_RED_LIST, searchParam);
				}else{
					FeatureResp featureResp = FaceFeatureUtil.faceQualityCheck(ModuleUtil.renderImage(pic));
					if (!featureResp.isValid()) {
						ServiceLog.error("人脸质量检测不通过，原因：" + featureResp.getErrorMsg());
						context.getResponse().setError("人脸质量检测不通过，原因：" + featureResp.getErrorMsg());
						return;
					}
					result = SdkStaticLibUtil.faceOne2NSearch(
							Constants.STATIC_LIB_ID_RED_LIST, Integer.valueOf(threshold),
							featureResp.getRltz(), 20, Constants.DEFAULT_ALGO_TYPE);
				}
				//红名单中比中
				if (result != null && result.getCode() == 0) {			
					List<Map<String, Object>> collisionList = result.getList();
					if (CollectionUtils.isNotEmpty(collisionList)) {
						belongRedFlag = 0;	
						for (Map<String, Object> map : collisionList) {
							String id = MapUtils.getString(map, "ID");
							int score = MapUtils.getIntValue(map, "SIMILARITY");
							Map<String,Object> person = new HashMap<>();
							person.put("TASK_ID", taskId);
							person.put("INFO_ID", id);
							person.put("SIMILARITY", score);
							relatedPersons.add(person);
						}
					}
				}
	    	}
	    	
		}
    	params.put("PIC_MD5", picMd5);
    	params.put("IS_INVOLVE_RED_LIST", belongRedFlag); //是否涉 红名单
		dao.addRedTask(params, relatedPersons);
		
		context.getResponse().putData("TASK_ID", taskId);
		context.getResponse().putData("BELONG_FLAG", belongRedFlag);
	    
	}
	
	@BeanService(id="detail", description="红名单库人脸详情")
	public void detail(RequestContext context) throws Exception
	{
		Map<String, Object> params = context.getParameters();	
		String personId = StringUtil.toString(params.get("INFO_ID"));
		List<Map<String, Object>> list = dao.getDetailById(personId);
		if (CollectionUtils.isNotEmpty(list)) {
			Map<String, Object> map = list.get(0);
			map.put("PIC", ModuleUtil.renderImage(StringUtil.toString(map.get("PIC"))));
			map.put("INFO_ID", StringUtil.toString(map.get("INFO_ID")));
			map.put("IDENTITY_TYPE", StringUtil.toString(map.get("IDENTITY_TYPE")));
			map.put("IDENTITY_ID", StringUtil.toString(map.get("IDENTITY_ID")));
			map.put("PERMANENT_ADDRESS", StringUtil.toString(map.get("PERMANENT_ADDRESS")));
			map.put("PRESENT_ADDRESS", StringUtil.toString(map.get("PRESENT_ADDRESS")));
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("DATA", map);
		} else {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "未查询到相关信息");
		}
	}
}
