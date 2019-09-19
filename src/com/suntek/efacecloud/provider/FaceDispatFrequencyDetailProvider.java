package com.suntek.efacecloud.provider;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import com.suntek.eap.jdbc.IFieldRender;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.tag.grid.GridDataProvider;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceDispatchedAlarmDao;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;

/**
 * 重点人员频次分析详情服务
 * @author gaos
 * @since 6.0
 * @version 2016-07-18
 * @Copyright (C)2016 , Suntektech
 */
@LocalComponent(id = "face/dispatchedFrequencyDetail", description = "重点人员频次分析详情")
public class FaceDispatFrequencyDetailProvider extends GridDataProvider
{
	@Override
	protected String buildQuerySQL() 
	{
		String sql = "select vfa.ALARM_IMG,p.PIC TEMPLET_IMG,vfa.ALARM_TIME,p.IDENTITY_ID,p.NAME PERSON_NAME, "
				+ "vvc.INSTALL_ADDR DEVICE_ADDR,vvc.NAME DEVICE_NAME "
				+ "from VPLUS_SURVEILLANCE_ALARM vfa "
				+ "left join EFACE_DISPATCHED_PERSON p on p.PERSON_ID = vfa.OBJECT_ID "
				+ "left join VPLUS_VIDEO_CAMERA vvc on vfa.DEVICE_ID = vvc.DEVICE_ID and vvc.SPECIAL_PURPOSE=? "
				+ "where 1=1" + this.getOptionalStatement();
		return sql;
	}

	@Override
	protected String buildCountSQL() 
	{
		String sql = "select count(1) from VPLUS_SURVEILLANCE_ALARM  vfa "
				+ "left join EFACE_DISPATCHED_PERSON p on p.PERSON_ID = vfa.OBJECT_ID "
				+ "left join VPLUS_VIDEO_CAMERA vvc on vfa.DEVICE_ID = vvc.DEVICE_ID and vvc.SPECIAL_PURPOSE=? "
				+ "where 1=1" + this.getOptionalStatement();
		return sql;
	}

	@Override
	protected void prepare(RequestContext context) 
	{
		Map<String,Object> map = context.getParameters();
		context.putParameter("sort", "ALARM_TIME desc ");
		
		this.addParameter(Constants.CAMERA_FACE);
		this.addOptionalStatement(" and vfa.TASK_TYPE = ? ");
		this.addParameter(Constants.TASK_FACE_ALARM);
		
		if (!StringUtil.isObjectNull(map.get("BEGIN_TIME")) && !StringUtil.isObjectNull(map.get("END_TIME"))) {
			this.addOptionalStatement(" and SUBSTRING(CONVERT(CHAR(19), vfa.ALARM_TIME, 120),1,10) between ? and ?");
			this.addParameter(map.get("BEGIN_TIME"));
			this.addParameter(map.get("END_TIME"));
		}
		
		String orgCode = (String) context.getParameter("ORG_CODE");
		if (!StringUtil.isNull(orgCode)) {
			this.addOptionalStatement(" and vfa.DEVICE_ID like ?");
			this.addParameter("%" + orgCode + "%");
		}
		
		String identityId = (String) context.getParameter("IDENTITY_ID");
		if (!StringUtil.isObjectNull(identityId)) {
			this.addOptionalStatement(" and p.IDENTITY_ID = ?");
			this.addParameter(identityId);
		}
		
		this.addFieldRender(new RenderImg(), "ALARM_IMG", "TEMPLET_IMG");
	}
	
	class RenderImg implements IFieldRender 
	{
		@Override
		public Object render(String field, ResultSet resultSet) throws SQLException 
		{
			if ("ALARM_IMG".equals(field) || "TEMPLET_IMG".equals(field)) {
				return ModuleUtil.renderImage(resultSet.getString(field));
			}
			
			return "";
		}
	}

	@QueryService(id = "statistics",description = "以人为单位获取选定时间内，选定地点的告警统计情况")
	public void getAlarmByPerson(RequestContext context)
	{
		FaceDispatchedAlarmDao alarmDao = new FaceDispatchedAlarmDao();
		String identityId = StringUtil.toString(context.getParameter("IDENTITY_ID")) ;
		String beginDate =StringUtil.toString(context.getParameter("BEGIN_TIME")) ;
		String endDate = StringUtil.toString(context.getParameter("END_TIME"));
		String orgCode =StringUtil.toString(context.getParameter("ORG_CODE"));
		
		List<Map<String,Object>> personList = alarmDao.getAlarmNumByPerson(identityId, beginDate, endDate, orgCode);
		context.getResponse().putData("personList", personList);		
	}
}
