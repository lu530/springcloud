package com.suntek.efacecloud.service;

import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceRedTaskDao;
import com.suntek.efacecloud.util.Constants;

/**
 * 红名单库列表服务
 * efacecloud/rest/v6/face/redTask
 * @author lx
 * @since 1.0.0
 * @version 2018-03-05
 * @Copyright (C)2018 , Suntektech
 */
@LocalComponent(id = "face/redTask")
public class FaceRedTaskService 
{
	private FaceRedTaskDao dao = new FaceRedTaskDao();
	
	@BeanService(id="approve", type="remote", description="涉红任务审批")
	public void approve(RequestContext context) throws Exception
	{
		Map<String, Object> params = context.getParameters();
		
		String approveStatus = StringUtil.toString(params.get("APPROVAL_STATUS"));
		String taskId = StringUtil.toString(params.get("TASK_ID"));
		List<Map<String, Object>> relatedRedList = dao.queryRelatedRedList(taskId);
		context.putParameter("DATA", JSONObject.toJSONString(relatedRedList));
		String userCode = context.getUserCode();
		if (dao.update(taskId, approveStatus, userCode)) {
			context.getResponse().putData("CODE", 0);
		}else {
			context.getResponse().putData("CODE", 1);
		}
	}
	
	@BeanService(id="getUnReadCount", type="remote", description="红名单检索任务未读数")
	public void getUnReadCount(RequestContext context) throws Exception
	{
		context.getResponse().putData("COUNT", dao.getUnReadCount(context.getUserCode()));
	}
	
	@BeanService(id="updateReadStatus", type="remote", description="更新红名单检索任务已读/未读状态")
	public void updateReadStatus(RequestContext context) throws Exception
	{
		if(dao.updateReadStatus(context.getUserCode(), Constants.RED_TASK_READ, Constants.RED_TASK_UNREAD)){
			context.getResponse().putData("CODE", 0);
		}else {
			context.getResponse().putData("CODE", 1);
		}
	}
	
	@BeanService(id="detail", type="remote", description="涉红任务详情")
	public void detail(RequestContext context) throws Exception
	{
		Map<String, Object> params = context.getParameters();
		
		String taskId = StringUtil.toString(params.get("TASK_ID"));		
		List<Map<String, Object>> relatedRedList = dao.queryRelatedRedList(taskId);
		
		context.getResponse().putData("list", relatedRedList);
	}
	
}
