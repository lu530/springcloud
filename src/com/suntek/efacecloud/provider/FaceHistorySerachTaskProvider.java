package com.suntek.efacecloud.provider;

import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.tag.grid.ExportGridDataProvider;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;

/**
 * 人脸检索任务个人历史查询
 * efacecloud/rest/v6/face/searchTaskHistory
 * @author lx
 * @since 1.0.0
 * @version 2018-03-05
 * @Copyright (C)2018 , Suntektech
 */
@LocalComponent(id = "face/searchTaskHistory")
public class FaceHistorySerachTaskProvider extends ExportGridDataProvider
{
	@Override
	protected String buildCountSQL() {
		String sql="select count(1) from ( select count(1) c from EFACE_SEARCH_TASK  where 1=1 " + this.getOptionalStatement();
		return sql;
	}
	
	@Override
	protected String buildQuerySQL() {
		
		String sql="select * from ( select CASE_ID, CASE_NAME, MAX(CREATE_TIME) CREATE_TIME from EFACE_SEARCH_TASK where 1=1 " + this.getOptionalStatement();
		return sql;
	}
	
	@Override
	protected void prepare(RequestContext context) 
	{
		context.putParameter("sort", " CREATE_TIME desc");
		this.addOptionalStatement(" and CREATOR = ? ");
		this.addParameter(context.getUserCode());
		
		String keywords = StringUtil.toString(context.getParameter("KEYWORDS"));
		if(!StringUtil.isEmpty(keywords)) {
			this.addOptionalStatement(" and (CASE_ID like ? or CASE_NAME like ? ) ");
			this.addParameter("%" + keywords + "%");
			this.addParameter("%" + keywords + "%");
		}
		String caseName = StringUtil.toString(context.getParameter("CASE_NAME"));
		if(!StringUtil.isEmpty(caseName)) {
			this.addOptionalStatement(" and CASE_NAME like ? ");
			this.addParameter("%" + caseName + "%");
		}
		String caseId = StringUtil.toString(context.getParameter("CASE_ID"));
		if(!StringUtil.isEmpty(caseId)) {
			this.addOptionalStatement(" and CASE_ID like ? ");
			this.addParameter("%" + caseId + "%");
		}
		
		String caseIdType = StringUtil.toString(context.getParameter("CASE_ID_TYPE"));
		if(!StringUtil.isObjectNull(caseIdType)){
			this.addOptionalStatement(" and CASE_ID_TYPE = ?  ");
			this.addParameter(caseIdType);
		}
		this.addOptionalStatement(" group by CASE_ID, CASE_NAME) t ");
	}
}
