package com.suntek.efacecloud.service;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import com.suntek.eap.EAP;
import com.suntek.eap.common.util.StringUtil;
import com.suntek.eap.index.Query;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.EsUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.Constants;

/**
 * 确认外籍人服务
 */
@LocalComponent(id = "race/confirm")
public class RaceConfirmService {

	@BeanService(id = "add", description = "确认外籍人")
	public void add(RequestContext context) throws Exception {
		confirm(context, true);
	}

	@BeanService(id = "cancel", description = "取消确认外籍人")
	public void cancel(RequestContext context) throws Exception {
		confirm(context, false);
	}

	private void confirm(RequestContext context, boolean confirm) {
		try {
			String infoIDsParam = StringUtil.toString(context.getParameter("INFO_IDS"), "");
			String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
			String endTime = StringUtil.toString(context.getParameter("END_TIME"));
			if (StringUtil.isEmpty(infoIDsParam)) {
				context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
				context.getResponse().putData("MESSAGE", "需要传入INFO_IDS参数");
				return;
			}
			String[] infoIDSArray = infoIDsParam.split(",");

			Query query = new Query(1, 1000);
			query.addEqualCriteria("INFO_ID", (Object[]) infoIDSArray);
			PageQueryResult response = EAP.bigdata.query(
					EsUtil.getIndexNameByTime(Constants.FACE_INDEX + "_", beginTime, endTime), Constants.FACE_TABLE,
					query);
			List<Map<String, Object>> resultSet = response.getResultSet();
			Map<String, List<Map<String, Object>>> indexData = resultSet.stream().map(o -> {
				o.put("RACE_CONFIRM", confirm ? "1" : "0");
				return o;
			}).collect(Collectors.groupingBy(row -> getMouthIndexName(row)));
			for (Entry<String, List<Map<String, Object>>> entry : indexData.entrySet()) {
				EAP.bigdata.indexAll(entry.getKey(), Constants.FACE_TABLE, entry.getValue(), "INFO_ID");
			}
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "成功");
		} catch (Exception e) {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "失败：" + e.getMessage());
		}
	}

	private String getMouthIndexName(Map<String, Object> row) {
		String month = String.valueOf(row.get("JGSK")).substring(0, 4);
		return Constants.FACE_INDEX + "_" + month;
	}

}
