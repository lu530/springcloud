package com.suntek.efacecloud.provider.mppdb;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.tag.grid.ExportGridDataProvider;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.CommonUtil;
import com.suntek.efacecloud.util.Constants;

/**
 * @author guoyl
 * @since 1.0.0
 * @version 2018-06-25
 * @Copyright (C)2017 , Suntektech
 */
public class TravelerCaptureMpProvider extends ExportGridDataProvider {

	public Map<String, Object> query(RequestContext context) throws Exception {
		
		PageQueryResult result = this.getData(context);
		return new PageQueryResult(result.getTotalSize(), render(result.getResultSet())).toMap();
		
	}

	@Override
	protected String buildCountSQL() {
		String sql = "select count(1) "
				+ " from passenger_public_information where 1=1 " +  this.getOptionalStatement();
		return sql;
	}

	@Override
	protected String buildQuerySQL() {
		String sql =  " select CCODE, SOURCE, GCODE, SURNAME, "
				+ " FIRSTNAME, CNAME, SEX, NATION, IDTYPE, IDCODE, "
				+ " URL, NOHOTEL, HNAME, LTIME, ETIME "
				+ " from passenger_public_information where 1=1 " +  this.getOptionalStatement();
		return sql;
	}

	@Override
	protected void prepare(RequestContext context) {

		this.setDatasource(Constants.MPPDB_NAME);
		Map<String, Object> body = context.getParameters();
		context.putParameter("sort", "LTIME desc");

		String beginTime = StringUtil.toString(body.get("BEGIN_TIME"));
		String endTime = StringUtil.toString(body.get("END_TIME"));
		String keywords = StringUtil.toString(body.get("KEYWORDS"));
		String source = StringUtil.toString(body.get("SOURCE")); 
		String sex = StringUtil.toString(body.get("SEX"));
		
		if(!StringUtil.isEmpty(keywords)) {
			
			this.addOptionalStatement(" and (SURNAME like ? or FIRSTNAME like ? or CNAME like ? or IDCODE like ?)");
			this.addParameter(keywords + "%");
			this.addParameter(keywords + "%");
			this.addParameter(keywords + "%");
			this.addParameter(keywords + "%");
		}
		
		if(!StringUtil.isEmpty(source)) {
			
			this.addOptionalStatement(" and SOURCE = ?");
			this.addParameter(source);
		}
		
        if(!StringUtil.isEmpty(sex)) {
			
			this.addOptionalStatement(" and SEX = ?");
			this.addParameter(sex);
		}
		
        if(!StringUtil.isEmpty(beginTime) && !StringUtil.isEmpty(endTime)) {
        	
        	this.addOptionalStatement(" and LTIME >= ? and LTIME <= ? ");
    		this.addParameter(DateUtil.convertByStyle(beginTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style));
    		this.addParameter(DateUtil.convertByStyle(endTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style));
        }

	}

	private List<Map<String, Object>> render(List<Map<String, Object>> resultSet) throws Exception {

		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		for(Map<String, Object> map : resultSet) {
			Map<String,Object> data = new HashMap<String,Object>();
			data.put("CCODE", StringUtil.toString(map.get("ccode")));
			data.put("IDCODE", StringUtil.toString(map.get("idcode")));
			data.put("SOURCE", StringUtil.toString(map.get("source")));
			data.put("GCODE", StringUtil.toString(map.get("gcode")));
			data.put("SURNAME", StringUtil.toString(map.get("surname")));
			data.put("FIRSTNAME", StringUtil.toString(map.get("firstname")));
			data.put("CNAME", StringUtil.toString(map.get("cname")));
			data.put("SEX", StringUtil.toString(map.get("sex")));
			data.put("NATION", StringUtil.toString(map.get("nation")));
			data.put("IDTYPE", StringUtil.toString(map.get("idtype")));
			data.put("URL", CommonUtil.renderImage(StringUtil.toString(map.get("url")).equals("-")?"":StringUtil.toString(map.get("url"))));
			data.put("NOHOTEL", StringUtil.toString(map.get("nohotel")));
			data.put("HNAME", StringUtil.toString(map.get("hname")));
			data.put("LTIME", DateUtil.convertByStyle(StringUtil.toString(map.get("ltime")),DateUtil.yyMMddHHmmss_style, DateUtil.standard_style));
			
			result.add(data);
		}
		
		return result;
	}
}
