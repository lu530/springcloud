package com.suntek.efacecloud.provider;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.suntek.eap.common.CommandContext;
import com.suntek.eap.common.util.StringUtil;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.util.Constants;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * 人员专题库查询
 * efacecloud/rest/v6/face/special
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/special")
public class FaceSpecialProvider
{
	
	@QueryService(id = "getData", description="人员专题库查询", type="remote")
	public PageQueryResult getData(RequestContext context) throws Exception 
	{
		CommandContext ctx = new CommandContext(context.getHttpRequest());
		Map<String, Object> params = context.getParameters();
		ctx.setBody(params);
		ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
		ctx.setUserCode(context.getUserCode());
		Registry.getInstance().selectCommands(BaseCommandEnum.faceSpecialQuery.getUri()).exec(ctx);
		if (ctx.getResponse().getCode() == Constants.RETURN_CODE_SUCCESS) {			
			int count = Integer.valueOf(StringUtil.toString(ctx.getResponse().getData("COUNT")));
			List<Map<String,Object>> records = (List<Map<String, Object>>) ctx.getResponse().getData("RECORDS");
			
			PageQueryResult result = new PageQueryResult(count, records);
			return result;
		}else {
			context.getResponse().setError(ctx.getResponse().getMessage());
			return new PageQueryResult(0, Collections.emptyList());
		}
	}
}