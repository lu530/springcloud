package com.suntek.efacecloud.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.collections.MapUtils;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.suntek.eap.common.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceAlgorithmTypeDao;
import com.suntek.efacecloud.model.ExcelColumn;
import com.suntek.efacecloud.provider.es.FaceCaptureEsProvider;
import com.suntek.efacecloud.util.ExcelUtil;

/**
 * 路人库统计
 */
@LocalComponent(id = "face/capture", isLog = "true")
public class FaceCaptureEsStatisticService {

	FaceAlgorithmTypeDao faceAlgorithmTypeDao = new FaceAlgorithmTypeDao();

	/**
	 * @Title: 抓拍量统计
	 **/
	@BeanService(id = "statistics", description = "路人库统计", type = "remote")
	public void statistics(RequestContext context) {
		try {
			List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();

			Map<String, Object> statistics = getData(context);

			result.add(statistics);
			context.getResponse().putData("DATA", result);
			context.getResponse().putData("CODE", 0);
			context.getResponse().putData("MESSAGE", "成功");
		} catch (Exception e) {
			context.getResponse().putData("CODE", 1);
			context.getResponse().putData("MESSAGE", "失败");
			ServiceLog.error("统计异常", e);
		}
	}

	private Map<String, Object> getData(RequestContext context) throws Exception {
		Map<String, Object> statistics = new HashMap<String, Object>();
		
		context.putParameter("pageNo", "1");
		context.putParameter("pageSize", "0");

		String algos = StringUtil.toString(context.getParameter("ALGO_LIST"));
		String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"), "1970-01-01 00:00:00");
		String endTime = StringUtil.toString(context.getParameter("END_TIME"));
		statistics.put("beginTime", beginTime.substring(0, 10));
		statistics.put("endTime", endTime.substring(0, 10));

		List<Map<String, Object>> algoTypeList = faceAlgorithmTypeDao.getAlgorithTypeList();
		Map<String, String> algoIDNameMap = algoTypeList.stream().collect(Collectors.toMap(
				o -> StringUtil.toString(o.get("ALGORITHM_ID")), o -> StringUtil.toString(o.get("ALGORITHM_NAME"))));

		// 统计总量
		context.putParameter("ALGO_LIST", "");
		context.putParameter("RACE_CONFIRM", "1");
		Map<String, Object> all = new FaceCaptureEsProvider().query(context);
		int correctCount = StringUtil.toInteger(all.get("count"), 0);
		statistics.put("correctCount", correctCount);

		// 统计各算法
		if (StringUtil.isEmpty(algos)) {
			statistics.put("algo", Collections.emptyList());
		} else {
			List<Map<String, Object>> agloStatisticsResultList = new ArrayList<Map<String, Object>>();
			JSONArray algosTostatis = JSON.parseArray(algos);
			for (int i = 0; i < algosTostatis.size(); i++) {
				JSONArray algoCondition = new JSONArray();
				algoCondition.add(algosTostatis.getJSONObject(i));
				context.putParameter("ALGO_LIST", algoCondition.toJSONString());
				context.putParameter("RACE_CONFIRM", "1");
				Map<String, Object> correctAlgoCountEsResult = new FaceCaptureEsProvider().query(context);
				int correctAlgoCount = StringUtil.toInteger(correctAlgoCountEsResult.get("count"), 0);

				context.putParameter("ALGO_LIST", algoCondition.toJSONString());
				context.putParameter("RACE_CONFIRM", "");
				Map<String, Object> algoCountEsResult = new FaceCaptureEsProvider().query(context);
				int wrongAlgoCount = StringUtil.toInteger(algoCountEsResult.get("count"), 0) - correctAlgoCount;

				Map<String, Object> algoResult = new HashMap<String, Object>();
				String algoID = algosTostatis.getJSONObject(i).getString("ALGO_TYPE");
				algoResult.put("algoName", MapUtils.getString(algoIDNameMap, algoID, algoID));
				algoResult.put("correctCount", correctAlgoCount);
				algoResult.put("wrongCount", wrongAlgoCount);
				agloStatisticsResultList.add(algoResult);
			}
			statistics.put("algo", agloStatisticsResultList);
		}

		return statistics;
	}

	@SuppressWarnings("unchecked")
	@BeanService(id = "statistics/download", description = "路人库统计下载", type = "remote")
	public void export(RequestContext context) {
		try {
			List<ExcelColumn> columns = new ArrayList<ExcelColumn>();
			List<Map<String, Object>> excelDataList = new ArrayList<Map<String, Object>>();
			Map<String, Object> singleExcelData = new HashMap<String, Object>();

			Map<String, Object> statistics = getData(context);
			String time = StringUtil.toString(statistics.get("beginTime"), "") + " ~ "
					+ StringUtil.toString(statistics.get("endTime"), "");
			columns.add(new ExcelColumn("time", "时间段", time.length() + 4, false));
			singleExcelData.put("time", time);
			columns.add(new ExcelColumn("allCorrectCount", "分类准确数", getHeadWidth(7), false));
			singleExcelData.put("allCorrectCount", statistics.get("correctCount"));

			List<Map<String, Object>> algos = (List<Map<String, Object>>) statistics.get("algo");
			for (int i = 0; i < algos.size(); i++) {
				Map<String, Object> algo = algos.get(i);
				String correctCountHeader = StringUtil.toString(algo.get("algoName")) + "-准确数";
				columns.add(new ExcelColumn(i + "_correctCount", correctCountHeader, getHeadWidth(correctCountHeader.length()),
						false));
				singleExcelData.put(i + "_correctCount", algo.get("correctCount"));
				String wrongCountHeader =  StringUtil.toString(algo.get("algoName")) + "-错误数";
				columns.add(
						new ExcelColumn(i + "_wrongCount", wrongCountHeader, getHeadWidth(wrongCountHeader.length()), false));
				singleExcelData.put(i + "_wrongCount", algo.get("wrongCount"));
			}
			excelDataList.add(singleExcelData);

			boolean ret = ExcelUtil.export("算法统计", columns, excelDataList, context.getHttpResponse());
			if (ret) {
				context.getResponse().setMessage("导出成功！");
			} else {
				context.getResponse().setError("导出失败！");
			}
		} catch (Exception e) {
			context.getResponse().setError("导出失败！");
			ServiceLog.error("导出异常", e);
		}
	}
	
	private int getHeadWidth(int charSize) {
		return (int) (charSize * 2.5) + 4;
	}

}
