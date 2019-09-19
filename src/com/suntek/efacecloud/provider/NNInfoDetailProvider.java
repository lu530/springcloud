package com.suntek.efacecloud.provider;

import java.util.List;
import java.util.Map;

import com.suntek.eap.EAP;
import com.suntek.eap.common.util.StringUtil;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.tag.grid.GridDataProvider;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.CommonUtil;

/**
 * 路人库检索频次分析信息详情provider
 * 
 * @author wujunying
 * @since 1.0.0
 * @version 2018-07-09
 * @Copyright (C)2018 , Suntektech
 */
@LocalComponent(id = "NNInfo/detail")
public class NNInfoDetailProvider extends GridDataProvider{

	@Override
	protected String buildQuerySQL() {
		String sql = "SELECT PERSON_ID, INFO_ID, CREATE_TIME "
				+ "from VIID_NN_INFO_DETAIL WHERE 1=1 " + getOptionalStatement();
		return sql;
	}

	@Override
	protected String buildCountSQL() {
		String sql = "select count(1) from VIID_NN_INFO_DETAIL where 1=1 " + getOptionalStatement();
		return sql;
	}

	@Override
	protected void prepare(RequestContext context) {
		
		context.putParameter("sort", "INFO_ID desc");
		
		String personId = StringUtil.toString(context.getParameter("PERSON_ID"));
		
		addOptionalStatement("and PERSON_ID = ? ");
		addParameter(personId);
		
	}
	
	@QueryService(id = "query", type = "remote")
	public PageQueryResult query(RequestContext context) {
		PageQueryResult pgr = getData(context);
		
		long count = pgr.getTotalSize();
		List<Map<String, Object>> rs = pgr.getResultSet();
		
		if (rs.size() == 0) {
			context.getResponse().setMessage("查询结果集为空");
			return null;
		}
		
		PageQueryResult pageResult = CommonUtil.getPageResultByInfoId(rs);
		
		for (int i = 0; i < rs.size(); i++) {
			
			Map<String, Object> infoMap = pageResult.getResultSet().get(i);
			Map<Object,Object> device = EAP.metadata.getDictMap(DictType.D_FACE, StringUtil.toString(infoMap.get("DEVICE_ID")));
			
			if(null != device) {
				pageResult.getResultSet().get(i).put("ADDR", device.get("DEVICE_ADDR"));
			}else {
				pageResult.getResultSet().get(i).put("ADDR", "未知");
			}
			
			String jgsk = StringUtil.toString(pageResult.getResultSet().get(i).get("JGSK"));
			pageResult.getResultSet().get(i).put("JGSK", DateUtil.convertByStyle(jgsk, DateUtil.yyMMddHHmmss_style, DateUtil.standard_style));
			
			pageResult.getResultSet().get(i).put("PIC", CommonUtil.renderImage(StringUtil.toString(infoMap.get("PIC"))));
			pageResult.getResultSet().get(i).put("OBJ_PIC", CommonUtil.renderImage(StringUtil.toString(infoMap.get("OBJ_PIC"))));
		}
		
		return new PageQueryResult(count, pageResult.getResultSet());
	}
	
}
