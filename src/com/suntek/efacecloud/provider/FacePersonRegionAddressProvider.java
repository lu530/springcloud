package com.suntek.efacecloud.provider;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.tag.tree.TreeDataProvider;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;

/**
 * 人员地址服务
 *  efacecloud/rest/v6/face/region_address
 * @author yangkang
 * @since 
 * @version 2018年8月8日
 * @Copyright (C)2018 , Suntektech
 */
@LocalComponent(id="face/region_address")
public class FacePersonRegionAddressProvider extends TreeDataProvider {
	@Override
	protected String buildQuerySQL() 
	{
		String sql = "select CODE, NAME from EFACE_PERSON_ADDRESS where PARENT_CODE = '' " + getOptionalStatement();
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
		List<Map<String, Object>> list = this.getData(context, false);
		
		Map<String, Object> element = new HashMap<String, Object>();
		element.put("id", "00");
		element.put("text", "全国");
		element.put("value", new HashMap<String, Object>());
		list.add(0, element);
		
		context.getResponse().putData(id, list);
	}
	
}
