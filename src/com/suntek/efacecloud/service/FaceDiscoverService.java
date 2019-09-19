package com.suntek.efacecloud.service;

import java.util.Map;

import com.suntek.eap.common.CommandContext;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * 上传大图自动框选人脸
 * @author wdp
 * @since  3.0
 * @version 2018年3月31日
 */
@LocalComponent(id="face/discover")
public class FaceDiscoverService {

	@BeanService(id="getResult", description="获取人员图片结构化，自动框选人脸", type="remote")
	public void getResult(RequestContext context){
		
		context.getParameters().put("ALGO_TYPE", ConfigUtil.getAlgoType());
//		context.getParameters().put("PIC", "http://172.16.58.182:8088/g1/M00/00000006/0000000D/rBA6tlq-BS2AGEf9AAolFT6gvrM792.png");
		
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		ctx.setBody(context.getParameters());
		ctx.setServiceUri(BaseCommandEnum.personPicStructure.getUri());
		
		try {
			ServiceLog.debug("获取人员图片结构化，自动框选人脸，参数：" + context.getParameters());
			
			Registry.getInstance().selectCommands(BaseCommandEnum.personPicStructure.getUri()).exec(ctx);
			
			Map<String, Object>  respBody = ctx.getResponse().getBody();
			ServiceLog.debug("人员图片结构化返回结果：" + respBody);
			
			String code = StringUtil.toString(ctx.getResponse().getCode());
			Object structInfo = respBody.get("struct_info");
			String msg = StringUtil.toString(ctx.getResponse().getMessage());
			
			if ("0".equals(code)) {
				
				if (null == structInfo) {
					msg = "处理成功，但没有检测出人脸";
				}
			}
			
			context.getResponse().putData("RESULT", structInfo);
			context.getResponse().putData("CODE", code);
			context.getResponse().putData("MESSAGE", msg);
			
		} catch (Exception e) {
 			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "处理异常，自动框选人脸信息失败    >>>  " + e);
		}
		
	} 
}
