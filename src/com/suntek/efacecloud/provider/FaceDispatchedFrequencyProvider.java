package com.suntek.efacecloud.provider;

import java.sql.ResultSet;
import java.sql.SQLException;

import com.suntek.eap.jdbc.IFieldRender;
import com.suntek.eap.jdbc.dialect.Dialect;
import com.suntek.eap.jdbc.dialect.DialectFactory;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.tag.grid.GridDataProvider;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;

/**
 * 重点人员频次分析服务
 * @author gaos
 * @since 6.0
 * @version 2016-07-18
 * @Copyright (C)2016 , Suntektech
 */
@LocalComponent(id = "face/dispatchedFrequency", since = "2.0", description = "重点人员频次分析")
public class FaceDispatchedFrequencyProvider extends GridDataProvider 
{
	Dialect dialect = DialectFactory.getDialect(Constants.APP_NAME,"");
	
	@Override
	protected String buildQuerySQL() 
	{
		String sql = "select MAX(p.NAME) as PERSON_NAME, MAX(p.PIC) as TEMPLET_IMG, p.IDENTITY_ID, COUNT(1) as COUNT "
				+ "from VPLUS_SURVEILLANCE_ALARM vfa "
				+ "left join EFACE_DISPATCHED_PERSON p on p.PERSON_ID = vfa.OBJECT_ID "
				+ "left join EFACE_DISPATCHED_DB d on d.DB_ID = vfa.DB_ID where 1=1 and p.IDENTITY_ID is not null "
				+ getOptionalStatement() + " group by p.IDENTITY_ID";
		return sql;
	}

	@Override
	protected String buildCountSQL() 
	{
		String sql = "select count(1) from (select count(1) COUNT from VPLUS_SURVEILLANCE_ALARM vfa "
				+ "left join EFACE_DISPATCHED_PERSON p on p.PERSON_ID = vfa.OBJECT_ID "
				+ "left join EFACE_DISPATCHED_DB d on d.DB_ID = vfa.DB_ID where 1=1 and p.IDENTITY_ID is not null "
				+ getOptionalStatement() + " group by p.IDENTITY_ID) as A";
		return sql;
	}

	@Override
	protected void prepare(RequestContext context) 
	{
		context.putParameter("sort", "COUNT desc ");
		
		this.addOptionalStatement(" and vfa.TASK_TYPE = ? ");
		this.addParameter(Constants.TASK_FACE_ALARM);
		
		
		if (!StringUtil.isObjectNull(context.getParameter("BEGIN_TIME")) && !StringUtil.isObjectNull(context.getParameter("END_TIME"))) {
			this.addOptionalStatement(" and " + dialect.substring("ALARM_TIME", 0, 10) + " between ? and ?");
			this.addParameter(context.getParameter("BEGIN_TIME"));
			this.addParameter(context.getParameter("END_TIME"));
		}
		
		String keywords = (String) context.getParameter("KEYWORDS");
		if (!StringUtil.isObjectNull(keywords)) {
			this.addOptionalStatement(" and (p.IDENTITY_ID like ? or p.NAME like ? )");
			this.addParameter("%" + keywords + "%");
			this.addParameter("%" + keywords + "%");
		}
		
		String orgCode = (String) context.getParameter("ORG_CODE");
		if (!StringUtil.isNull(orgCode)) {
			this.addOptionalStatement(" and vfa.DEVICE_ID like ?");
			this.addParameter("%" + orgCode + "%");
		}	
		
		//布控库查询
		String dbIds = StringUtil.toString(context.getParameter("DB_IDS"));
		if (!StringUtil.isNull((String) context.getParameter("DB_IDS"))) {
			String[] sdbIdArr = dbIds.split(",");
			String sql = " and vfa.DB_ID in (";
			for (int i = 0; i < sdbIdArr.length; i++) {
				if (i == 0) {
					sql = sql + "?";
				} else {
					sql = sql + ",?";
				}
				this.addParameter(sdbIdArr[i]);
			}
			this.addOptionalStatement(sql + ") ");
		}
		
		this.addFieldRender(new renderImg(), "TEMPLET_IMG");
	}
	
	class renderImg implements IFieldRender 
	{
		@Override
		public Object render(String field, ResultSet resultSet)
				throws SQLException {
			if ("TEMPLET_IMG".equals(field)) {
				return ModuleUtil.renderImage(resultSet.getString(field));
			}
			
			return "";
		}
	}
}

