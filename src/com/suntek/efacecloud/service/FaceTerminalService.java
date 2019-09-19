package com.suntek.efacecloud.service;

import java.util.Map;

import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.common.util.StringUtil;
import com.suntek.eap.metadata.EAPMetadata;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.FaceTerminalDao;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * 移动终端库服务
 * efacecloud/rest/v6/face/terminal
 * @author gaos
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/terminal")
public class FaceTerminalService 
{
	private FaceTerminalDao dao = new FaceTerminalDao();
	
	@BeanService(id="add", description="新增或编辑移动终端库人脸")
	public void edit(RequestContext context) throws Exception
	{
		String dbId = StringUtil.toString(EAP.metadata.getDictValue(Constants.DICT_KIND_STATIC_LIB, Constants.DICT_CODE_STATIC_LIB_TERMINAL));
		Map<String, Object> params = context.getParameters();
		params.put("ALGO_TYPE", ModuleUtil.getAlgoTypeList());
		params.put("DB_ID", dbId);
		params.put("CREATOR", context.getUserCode());
		params.put("CREATE_TIME",DateUtil.getDateTime());
		
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		ctx.setUserCode(context.getUserCode());
		ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());		
		String infoId = StringUtil.toString(params.get("INFO_ID"));
	
		if (StringUtil.isEmpty(infoId)) { //新增
			//前端字段有NAME, SEX, IDENTITY_TYPE, IDENTITY_ID, BIRTHDAY, PERMANENT_ADDRESS, PRESENT_ADDRESS, PIC, PERSON_TAG
			
			//传递给Command的参数有DB_ID，ALGO_TYPE，CREATOR，CREATE_TIME，NAME, SEX, IDENTITY_TYPE, 
			//IDENTITY_ID, BIRTHDAY, PERMANENT_ADDRESS, PRESENT_ADDRESS, PIC, PERSON_TAG
			ctx.setBody(params);
			Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceAdd.getUri()).exec(ctx);
			if (ctx.getResponse().getCode() == 0) {
				String personId = StringUtil.toString(ctx.getResponse().getData("PERSON_ID"));
				params.put("INFO_ID", personId);
				dao.add(params);
		    	context.getResponse().putData("CODE", ctx.getResponse().getCode());
				context.getResponse().putData("MESSAGE", "保存成功");
			}else {
		    	context.getResponse().putData("CODE", ctx.getResponse().getCode());
				context.getResponse().putData("MESSAGE", "保存失败");
			}				
		}else { //编辑
			params.put("PERSON_ID", infoId);
			ctx.setBody(params);
			Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceDel.getUri()).exec(ctx);
			if (ctx.getResponse().getCode() == 0) {
				dao.delete(infoId);
				Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceAdd.getUri()).exec(ctx);
				if (ctx.getResponse().getCode() == 0) {
					String newInfoId = StringUtil.toString(ctx.getResponse().getData("PERSON_ID"));
					params.put("INFO_ID", newInfoId);
					dao.add(params);
			    	context.getResponse().putData("CODE", ctx.getResponse().getCode());
					context.getResponse().putData("MESSAGE", "修改成功");
				}else {
			    	context.getResponse().putData("CODE", ctx.getResponse().getCode());
					context.getResponse().putData("MESSAGE", "修改失败");
				}
			}else {
		    	context.getResponse().putData("CODE", ctx.getResponse().getCode());
				context.getResponse().putData("MESSAGE", "修改失败");
			}
		}		


	}
	
	@BeanService(id="delete", description="删除移动终端库人脸")
	public void delete(RequestContext context) throws Exception
	{
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		ctx.setUserCode(context.getUserCode());
		ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
		
		Map<String, Object> params = context.getParameters();
		String personId = StringUtil.toString(params.get("INFO_ID"));
		params.put("PERSON_ID", personId);
		params.put("DB_ID", EAP.metadata.getDictValue(Constants.DICT_KIND_STATIC_LIB, Constants.DICT_CODE_STATIC_LIB_TERMINAL));
		params.put("ALGO_TYPE", ModuleUtil.getAlgoTypeList());
		ctx.setBody(params);

		Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceDel.getUri()).exec(ctx);
		
		if (ctx.getResponse().getCode() == 0) {
	    	context.getResponse().putData("CODE", ctx.getResponse().getCode());
			context.getResponse().putData("MESSAGE", "删除人脸成功");
		}else {
	    	context.getResponse().putData("CODE", ctx.getResponse().getCode());
			context.getResponse().putData("MESSAGE", "删除人脸失败");
		}

	}
	
	@BeanService(id="detail", description="移动终端库人脸详情")
	public void detail(RequestContext context) throws Exception
	{
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		Map<String, Object> params = context.getParameters();
		//params包括字段DB_ID,PERSON_ID
		params.put("DB_ID", EAPMetadata.dict.getDictValue(Constants.DICT_KIND_STATIC_LIB, Constants.DICT_CODE_STATIC_LIB_TERMINAL));
		params.put("PERSON_ID", params.get("INFO_ID"));
		params.remove("INFO_ID");
		
		ctx.setBody(params);
		ctx.setUserCode(context.getUserCode());
		ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
		
		Registry.getInstance().selectCommands(BaseCommandEnum.staticLibFaceDetail.getUri()).exec(ctx);
		long code = ctx.getResponse().getCode();
		
		if (code == 0) {
		   	context.getResponse().putData("CODE", ctx.getResponse().getCode());
		   	Map<String, Object> body = ctx.getResponse().getBody();
		   	body.put("INFO_ID", body.get("PERSON_ID"));
		   	body.remove("PERSON_ID");
			context.getResponse().putData("DATA", body);
		}else {
		   	context.getResponse().putData("CODE", ctx.getResponse().getCode());
			context.getResponse().putData("DATA", ctx.getResponse().getMessage());
		}
 
	}
}
