package com.suntek.efacecloud.provider;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;

import com.suntek.eap.dict.Constants;
import com.suntek.eap.jdbc.dialect.Dialect;
import com.suntek.eap.jdbc.dialect.DialectFactory;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.tag.tree.TreeDataExProvider;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;

/**
 * 自定义组织架构树服务
 * @author yangkang
 * @since 
 * @version 2018年8月14日
 * @Copyright (C)2018 , Suntektech
 */
@LocalComponent(id="face/dept")
public class FaceDeptTreeProvider extends TreeDataExProvider{
	// 是否可以查看所有部门
	boolean viewAll = false;
	
	// 是否不查看本级以下部门
	boolean noChildren = false;

	@Override
	protected String setNodeIdFieldName()
	{
		return "DEPT_CODE";
	}

	@Override
	protected String setNodeTextFieldName()
	{
		return "DEPT_NAME";
	}
	
	private Dialect dialect = DialectFactory.getDialect(Constants.module.USERCONF,"");

	@Override
	protected String buildQuerySQL()
	{
		String sql = "select distinct d.* from SYS_DEPT d " +getOptionalStatement();
		if (!viewAll) {
			sql = "select distinct d.* from SYS_DEPT d, SYS_USER u "
					+ "where (d.DEPT_CODE like "
					+ dialect.concat("u.DEPT_CODE", "'%'")
					+ " or u.DEPT_CODE like "
					+ dialect.concat("d.DEPT_CODE", "'%'")
					+ " ) and u.USER_CODE = ? " 
					+ getOptionalStatement();
		}
		
		return sql;
	}

	@Override
	protected void prepare(RequestContext context)
	{
		Map<String, Object> params = context.getParameters();
		
		viewAll = MapUtils.getBooleanValue(params, "viewAll");
		noChildren = MapUtils.getBooleanValue(params, "noChildren");

		if (!viewAll) {
			addParameter(context.getUserCode());
		}
		
		String rootDeptCode = StringUtil.toString(context.getParameter("rootDeptCode"));
		
		if(!StringUtil.isNull(rootDeptCode)){
			ServiceLog.debug("rootDeptCode="+rootDeptCode);
			addOptionalStatement(" and d.DEPT_CODE like ?");
			
			addParameter(rootDeptCode+"%");
		}
		if(!context.getUser().isAdministrator()) {
			if(noChildren) {
				addOptionalStatement(" and " + dialect.length("d.DEPT_CODE") + "<=" + dialect.length("u.DEPT_CODE"));
			}
		}
		
		
		addOptionalStatement(" order by d.DEPT_CODE");
	}
	
	@QueryService(id="getTree", type="remote")
	public void getTree(RequestContext context){
		String id = (String) context.getParameter("elementId");
		List<Map<String, Object>> list = this.getData(context, false);
		
		Map<String, Object> element = new HashMap<String, Object>();
		element.put("id", "00");
		element.put("text", "全部");
		element.put("hasChildren", false);
		element.put("isParent", false);
		element.put("ChildNodes", new ArrayList<Map<String, Object>>());
		element.put("value", new HashMap<String, Object>());
		list.add(0, element);
		
		context.getResponse().putData(id, list);
	}
}
