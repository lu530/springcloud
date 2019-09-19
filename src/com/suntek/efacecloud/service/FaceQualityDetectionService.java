package com.suntek.efacecloud.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.suntek.eap.common.CommandContext;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.util.Constants;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * 人脸图片质量判断
 * efacecloud/rest/v6/face/quality/detection
 * @author zhangliping
 * @since 3.1.0
 * @version 2018-06-28
 * @Copyright (C)2018 , Suntektech
 */
@LocalComponent(id = "face/quality")
public class FaceQualityDetectionService {
	
	@SuppressWarnings("unchecked")
	@BeanService(id = "detection", description="人脸图片质量判断", since="3.1",type= "remote", paasService= "true")
	public void qualityInspection(RequestContext context) throws Exception {
		
		String pic = StringUtil.toString(context.getParameter("PIC"));
		if (StringUtil.isNull(pic)) {
			ServiceLog.error("参数缺少");
			context.getResponse().setError("参数缺少");
			return;
		}

		String algoTypeStr = AppHandle.getHandle(Constants.APP_NAME).getProperty("VRS_ALGO_TYPE", "");
		if (StringUtil.isNull(algoTypeStr)) {
			ServiceLog.error("人脸质量检测算法未配置");
			context.getResponse().setError("人脸质量检测算法未配置");
			return;
		}
		
		List<Map<String,Object>> algolist =  new ArrayList<>();
		for(String algo : algoTypeStr.split(",")) {
			Map<String,Object> temp = new HashMap<>();
			temp.put("ALGO_TYPE", algo);
			algolist.add(temp);
		}
		
		CommandContext ctx = new CommandContext("admin", "suntek");
		Map<String, Object> body = new HashMap<String, Object>();
		body.put("PIC", pic);
		body.put("ALGO_LIST", algolist);
		ctx.setBody(body);
		Registry registry = Registry.getInstance();
		registry.selectCommands(BaseCommandEnum.faceQualityDetection.getUri()).exec(ctx);
		
		context.getResponse().putData("CODE", ctx.getResponse().getCode());
		context.getResponse().putData("MESSAGE", ctx.getResponse().getMessage());
		if (Constants.RETURN_CODE_SUCCESS  == ctx.getResponse().getCode() ) {
			List<Map<String,Object>>  list  = (List<Map<String, Object>>) ctx.getResponse().getData("LIST");
			context.getResponse().putData("LIST", list);
		} 
	}
}
