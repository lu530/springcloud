package com.suntek.efacecloud.provider.mppdb;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.log.ServiceLog;
import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.common.util.SqlUtil;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.metadata.DictType;
import com.suntek.eap.tag.grid.ExportGridDataProvider;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.DeviceInfoDao;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;

/**
 * @author guoyl
 * @since 1.0.0
 * @version 2018-06-25
 * @Copyright (C)2017 , Suntektech
 */
public class InternetCafesFaceMpProvider extends ExportGridDataProvider {

	public Map<String, Object> query(RequestContext context) throws Exception {
		
		PageQueryResult result = this.getData(context);
		return new PageQueryResult(result.getTotalSize(), render(result.getResultSet())).toMap();
		
	}

	@Override
	protected String buildCountSQL() {
		String sql = " select count(1) from internet_cafe_person  where 1=1" + this.getOptionalStatement();
		return sql;
	}

	@Override
	protected String buildQuerySQL() {
		String sql = "  select infoid , srcid , sfzh, pubcode,  zp , rltpurl , begindate, gzdb_addtime from internet_cafe_person  where 1=1"
				+ this.getOptionalStatement();
		return sql;
	}

	@Override
	protected void prepare(RequestContext context) {

		this.setDatasource(Constants.MPPDB_NAME);
		Map<String, Object> body = context.getParameters();
		context.putParameter("sort", " gzdb_addtime desc, begindate desc");

		String beginTime = StringUtil.toString(body.get("BEGIN_TIME"));
		String endTime = StringUtil.toString(body.get("END_TIME"));
		String keywords = StringUtil.toString(body.get("KEYWORDS"));

		if (!StringUtil.isEmpty(keywords)) {
			this.addOptionalStatement(" and sfzh like ? ");
			this.addParameter(keywords + "%");
		}

		this.addOptionalStatement(" and ( begindate  BETWEEN  ? and ? )");
		this.addParameter(DateUtil.toDate(beginTime));
		this.addParameter(DateUtil.toDate(endTime));

	}

	private List<Map<String, Object>> render(List<Map<String, Object>> resultSet) throws Exception {

		List<Map<String, Object>> tempList = new ArrayList<Map<String, Object>>();
		for (Map<String, Object> map : resultSet) {
			Map<String, Object> tempMap = new HashMap<String, Object>();
			Date begindate = (Date) map.get("begindate");
			tempMap.put("JGSK", begindate == null ? "" : DateUtil.dateToString(begindate, DateUtil.yyyy_MM_dd_style));
			Date gzdb_addtime = (Date) map.get("gzdb_addtime");
			tempMap.put("ADD_TIME", gzdb_addtime == null ? "" : DateUtil.dateToString(gzdb_addtime));
			tempMap.put("OBJ_PIC", ModuleUtil.renderImage(StringUtil.toString(map.get("rltpurl"))));
			tempMap.put("PIC", ModuleUtil.renderImage(StringUtil.toString(map.get("zp"))));
			tempMap.put("INFO_ID", StringUtil.toString(map.get("infoid")));
			tempMap.put("IDENTITY_ID", StringUtil.toString(map.get("sfzh")));
			tempMap.put("PUB_CODE", StringUtil.toString(map.get("pubcode")));

			tempList.add(tempMap);
		}
		return tempList;
	}
}
