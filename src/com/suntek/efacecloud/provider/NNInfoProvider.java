package com.suntek.efacecloud.provider;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.tag.grid.GridDataProvider;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.CommonUtil;
import com.suntek.efacecloud.util.Constants;

/**
 * 路人库检索频次分析信息provider
 * 
 * @author wujunying
 * @since 1.0.0
 * @version 2018-07-09
 */
@LocalComponent(id = "NNInfo")
public class NNInfoProvider extends GridDataProvider{

	@Override
	protected String buildQuerySQL() {
		String sql = "SELECT TASK_ID, PERSON_ID, INFO_ID, NUMS, CREATE_TIME "
				+ "from VIID_NN_INFO WHERE 1=1 " + getOptionalStatement();
		return sql;
	}

	@Override
	protected String buildCountSQL() {
		
		String sql = "select count(1) from VIID_NN_INFO f where 1=1 " + getOptionalStatement();
		return sql;
	}

	@Override
	protected void prepare(RequestContext context) {
		
		context.putParameter("sort", "NUMS desc ");
		
		addOptionalStatement("and TASK_ID = ?");
		addParameter(context.getParameter("TASK_ID"));
	}
	
	@QueryService(id = "query", type = "remote")
	public PageQueryResult query(RequestContext context) throws Exception {
		
		PageQueryResult pgr = getData(context);
		
		long count = pgr.getTotalSize();
		List<Map<String, Object>> rs = pgr.getResultSet();
		
		if (rs.size() == 0) {
			context.getResponse().setError(Constants.RETURN_CODE_ERROR, "查询结果集为空");
			return new PageQueryResult(0, new ArrayList<>());
		}

		PageQueryResult pageResult = CommonUtil.getPageResultByInfoId(rs);
		
		//INFO_ID数据映射
		Map<String, Map<String, Object>> keyMap = pageResult.getResultSet().stream().collect(Collectors.toMap(o -> StringUtil.toString(o.get("INFO_ID")), o -> o));
		
		for (int i = 0; i < rs.size(); i++) {
			Map<String, Object> map = rs.get(i);
			Map<String, Object> captureInfo = keyMap.get(StringUtil.toString(map.get("INFO_ID")));
			
			if(captureInfo != null) {
				captureInfo.put("PERSON_ID", map.get("PERSON_ID"));
				captureInfo.put("NUMS", map.get("NUMS"));
				
				String jgsk = StringUtil.toString(captureInfo.get("JGSK"));
				captureInfo.put("JGSK", DateUtil.convertByStyle(jgsk, DateUtil.yyMMddHHmmss_style, DateUtil.standard_style));
				captureInfo.put("PIC", CommonUtil.renderImage(StringUtil.toString(captureInfo.get("PIC"))));
				captureInfo.put("OBJ_PIC", CommonUtil.renderImage(StringUtil.toString(captureInfo.get("OBJ_PIC"))));
			}
		} 
		
		return new PageQueryResult(count, pageResult.getResultSet());
	}
	
}
