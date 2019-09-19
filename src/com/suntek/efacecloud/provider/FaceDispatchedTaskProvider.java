package com.suntek.efacecloud.provider;

import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.tag.grid.ExportGridDataProvider;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
/**
 * 人脸布控/撤控
 * @author suntek
 * @version 2017-07-11
 * efacecloud/rest/v6/face/dispatchedTask/getData
 *
 */
@LocalComponent(id="face/dispatchedTask")
public class FaceDispatchedTaskProvider extends ExportGridDataProvider{

	@Override
	protected String buildCountSQL() {
		String sql = " select count(1) from EFACE_DISPATCHED_DB a "
				+ "left join (select DB_ID, count(1) CNT from EFACE_DISPATCHED_PERSON group by DB_ID) d on a.DB_ID = d.DB_ID "
				+ "left join (select DB_ID from EFACE_DISPATCHED_TASK b where DEVICE_ID = ?) b on a.DB_ID = b.DB_ID where 1 = 1 " 
				+ this.getOptionalStatement();
		return sql;
	}

	@Override
	protected String buildQuerySQL() {
		String sql = "select a.CREATE_TIME,a.DB_ID,a.DB_NAME,a.ALARM_THRESHOLD,a.ALARM_LEVEL, "
				+ "case when a.DB_ID = b.DB_ID then 'true' else 'flase' end as CHECKED, "
				+ "case when d.CNT is null then 0 else d.CNT end as STORE_CNT "
				+ "from EFACE_DISPATCHED_DB a "
				+ "left join (select DB_ID, count(1) CNT from EFACE_DISPATCHED_PERSON group by DB_ID) d on a.DB_ID = d.DB_ID "
				+ "left join (select DB_ID from EFACE_DISPATCHED_TASK where DEVICE_ID = ?) b on a.DB_ID = b.DB_ID where 1 = 1 "
				+ this.getOptionalStatement();
		return sql;
	}

	@Override
	protected void prepare(RequestContext context) {
		context.putParameter("sort", " CREATE_TIME desc ");
		
		String deviceId = StringUtil.toString(context.getParameter("DEVICE_ID"));
		this.addParameter(deviceId);	
		
		if (!StringUtil.isObjectNull(context.getParameter("KEYWORDS"))) {
			this.addOptionalStatement(" and a.DB_NAME like ? ");
			this.addParameter("%" + context.getParameter("KEYWORDS") + "%");
		}
	}

}
