package com.suntek.efacecloud.provider;

import java.util.List;
import java.util.Map;

import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.tag.grid.ExportGridDataProvider;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;

/**
 * 红名单任务查询
 * efacecloud/rest/v6/face/redTask
 * @author lx
 * @since 1.0.0
 * @version 2018-03-05
 * @Copyright (C)2018 , Suntektech
 */
@LocalComponent(id = "face/redTask")
public class FaceRedTaskProvider extends ExportGridDataProvider
{	
	@Override
	protected String buildCountSQL() 
	{
		String sql = "select count(1) from EFACE_SEARCH_TASK t "
				+ " left join SYS_USER u on u.USER_CODE = t.CREATOR "
				+ " left join SYS_DEPT dept on u.DEPT_CODE=dept.DEPT_CODE where 1=1 " + this.getOptionalStatement();
		return sql;
	}

	@Override
	protected String buildQuerySQL() 
	{
		String sql = "select t.TASK_ID, t.CREATOR_IP, u.USER_NAME CREATOR, dept.DEPT_NAME, t.CREATE_TIME, t.SEARCH_TYPE, t.SEARCH_PIC, t.SAERCH_PARAM, "
				+ "t.CASE_ID, t.CASE_NAME, t.CAUSE_TYPE, t.SEARCH_CAUSE, t.IS_INVOLVE_RED_LIST, t.IS_APPROVE, t.APPROVAL_STATUS, t.APPROVER, t.APPROVAL_TIME, "
				+ " t.EXPIRY_DATE "
				+ "from EFACE_SEARCH_TASK t "
				+ "left join SYS_USER u on u.USER_CODE = t.CREATOR "
				+ " left join SYS_DEPT dept on u.DEPT_CODE=dept.DEPT_CODE where 1=1 " + this.getOptionalStatement();
		return sql;
	}

	@Override
	protected void prepare(RequestContext context) 
	{
		context.putParameter("sort", "CREATE_TIME desc");
		
		String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
		String endTime = StringUtil.toString(context.getParameter("END_TIME"));
		if (!StringUtil.isEmpty(beginTime) && !StringUtil.isEmpty(endTime)) {
			addOptionalStatement(" and t.CREATE_TIME between ? and ?");
			addParameter(beginTime);
			addParameter(endTime);
		}
		
		String approvalStatus = StringUtil.toString(context.getParameter("APPROVAL_STATUS"));
		if (!StringUtil.isEmpty(approvalStatus)) {
			addOptionalStatement(" and t.APPROVAL_STATUS = ?");
			addParameter(approvalStatus);
		}
		
		String keyWords = StringUtil.toString(context.getParameter("KEYWORDS"));
		if (!StringUtil.isEmpty(keyWords)) {
			addOptionalStatement(" and (u.USER_NAME like ? or dept.DEPT_NAME like ? or t.CREATOR_IP like ?)");
			addParameter("%" + keyWords + "%");
			addParameter("%" + keyWords + "%");
			addParameter("%" + keyWords + "%");
		}
		
		String userCode = context.getUserCode();
		String searchType = StringUtil.toString(context.getParameter("SEARCH_TYPE"));
		if (context.getUser().isAdministrator() && StringUtil.isEmpty(searchType)) {
			addOptionalStatement(" and t.IS_APPROVE = 0");
		} else {
			
			if(StringUtil.isEmpty(searchType)){
				addOptionalStatement(" and t.IS_APPROVE = 0");
				addOptionalStatement(" and exists (select 1 from SYS_USERFUNC uf, SYS_FUNLIST f where ? = uf.USER_CODE and uf.ORG_CODE = f.FUNID and f.MENUID = ?)");
				addParameter(context.getUserCode());
				addParameter(Constants.RED_LIST_MENUID);
			}else if(searchType.equals("all")) {
				addOptionalStatement(" and t.IS_APPROVE = 0 and t.CREATOR = ?");
				addParameter(userCode);
			}else{
				//addOptionalStatement(" and t.SEARCH_TYPE = ?");
				//addParameter(searchType);
				
				addOptionalStatement(" and t.IS_APPROVE = 0 and t.CREATOR = ?");
				addParameter(userCode);
			}
		}
	}
	
	@Override
	@BeanService(id="getData", description="红名单任务查询")
	public PageQueryResult getData(RequestContext context) 
	{
		PageQueryResult result = super.getData(context);
		List<Map<String, Object>> list = result.getResultSet();
		for(Map<String, Object> map : list){
			map.put("SEARCH_TYPE_TEXT", ModuleUtil.renderSearchType(Integer.parseInt(StringUtil.toString(map.get("SEARCH_TYPE"), "-1"))));
		}
		return result;
	}
}
