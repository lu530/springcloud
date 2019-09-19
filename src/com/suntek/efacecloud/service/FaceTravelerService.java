package com.suntek.efacecloud.service;

import java.util.Map;

import com.suntek.eap.common.CommandContext;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * 旅客人脸库服务 efacecloud/rest/v6/face/traveler
 * @author swq
 * @since 1.0.0
 * @version 2018-01-03
 * @Copyright (C)2018 , Suntektech
 */
@LocalComponent(id = "face/traveler")
public class FaceTravelerService {
	
	@BeanService(id = "detail", description = "旅客人脸详细信息")
	public void picDelete(RequestContext context) throws Exception {
		Map<String, Object> params = context.getParameters();
		
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		ctx.setBody(params);
		Registry.getInstance().selectCommands(BaseCommandEnum.travelerCaptureDetail.getUri()).exec(ctx);
		
    	context.getResponse().putData("CODE", ctx.getResponse().getCode());
		context.getResponse().putData("MESSAGE", ctx.getResponse().getMessage());
		context.getResponse().putData("TRAVELER_INFO", ctx.getResponse().getData("TRAVELER_INFO"));
		
	}
	
}
