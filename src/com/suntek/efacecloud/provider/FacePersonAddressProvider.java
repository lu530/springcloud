package com.suntek.efacecloud.provider;

import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.tag.tree.TreeDataProvider;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;

/**
 * 人员地址服务
 *  efacecloud/rest/v6/face/address
 * @author lx
 * @since 
 * @version 2017年7月12日
 * @Copyright (C)2015 , Suntektech
 */
@LocalComponent(id="face/address")
public class FacePersonAddressProvider extends TreeDataProvider 
{
	@Override
	protected String buildQuerySQL() 
	{
		String sql = "select CODE, NAME, PARENT_CODE from EFACE_PERSON_ADDRESS where 1=1 " + getOptionalStatement();
		return sql;
	}

	@Override
	protected String setNodeIdFieldName() 
	{
		return "CODE";
	}

	@Override
	protected String setNodeTextFieldName() 
	{
		return "NAME";
	}

	@Override
	protected void prepare(RequestContext context)
	{
		String rootDeptCode = StringUtil.toString(context.getParameter("rootDeptCode"));
		if (!StringUtil.isNull(rootDeptCode)) {
			addOptionalStatement(" and CODE like ?");
			addParameter(rootDeptCode+"%");
		}
		
		addOptionalStatement(" order by CODE ");
	}
	
	@QueryService(id="getTree", type="remote")
	public void getTree(RequestContext context)
	{
		String id = (String) context.getParameter("elementId");
		context.getResponse().putData(id, this.getData(context, false));
	}
}
