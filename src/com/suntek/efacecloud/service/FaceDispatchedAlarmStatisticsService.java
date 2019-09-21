package com.suntek.efacecloud.service;

import java.util.*;
import java.util.stream.Collectors;

import com.suntek.efacecloud.util.ResponseUtil;

import org.apache.commons.collections.MapUtils;
import com.suntek.eap.common.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceAlgorithmTypeDao;
import com.suntek.efacecloud.dao.FaceDispatchedAlarmDao;
import com.suntek.efacecloud.model.ExcelColumn;
import com.suntek.efacecloud.util.ExcelUtil;

/**
 * 人脸抓拍告警服务 下载统计
 * 
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29 Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/dispatchedAlarm")
public class FaceDispatchedAlarmStatisticsService {
	
	private FaceAlgorithmTypeDao faceAlgorithmTypeDao = new FaceAlgorithmTypeDao();
	
    private FaceDispatchedAlarmDao alarmDao = new FaceDispatchedAlarmDao();

    /* 确认：准确 */
    private static final String CONFIRM_STATUS_ACCURATE = "1";
    /* 确认：不准确 */
    private static final String CONFIRM_STATUS_INACCURATE = "0";
    /* 确认：未设置 */
   // private static final String CONFIRM_STATUS_EMPTY = "";
    
    /**
	 * 告警准确性统计
	 **/
	@BeanService(id = "statistics", description = "告警准确性统计", type = "remote")
	public void statistics(RequestContext context) {
		try {
			List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
			Map<String, Object> statistics = getData(context);
			result.add(statistics);
			ResponseUtil.addSuccessInfo(context, result, null);
		} catch (Exception e) {
			ResponseUtil.addFailInfo(context, null, e);
		}
	}


	/**
	 * 得到人脸告警总数
	 * @param context 请求上下文，应该包括BEGIN_TIME和END_TIME两个参数
	 */
	@BeanService(id = "getFaceAlarmCount", description = "得到人脸告警总数")
	public void getFaceAlarmCount(RequestContext context) {
		try {
			String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
			String endTime = StringUtil.toString(context.getParameter("END_TIME"));
			int faceAlarmCount = this.alarmDao.getFaceAlarmCount(beginTime, endTime);
			ResponseUtil.addSuccessInfo(context, faceAlarmCount, null);
		} catch (Exception e) {
			ResponseUtil.addFailInfo(context, null, e);
		}
	}
	/**
	 * 获取车辆告警总数 
	 * @param context 请求上下文，应该包括BEGIN_TIME和END_TIME两个参数
	 */
	@BeanService(id = "getCarAlarmCount", description = "得到车辆告警总数")
	public void getCarAlarmCount(RequestContext context) {
		try {
			String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
			String endTime = StringUtil.toString(context.getParameter("END_TIME"));
			int carAlarmCount = this.alarmDao.getCarAlarmCount(beginTime, endTime);
			ResponseUtil.addSuccessInfo(context, carAlarmCount, null);
		} catch (Exception e) {
			ResponseUtil.addFailInfo(context, null, e);
		}
	}
	/**
	 * 获取车辆已处理告警总数 
	 * @param context 请求上下文，应该包括BEGIN_TIME和END_TIME两个参数
	 */
	@BeanService(id = "getCarDealAlarmCount", description = "得到车辆已处理告警总数")
	public void getCarDealAlarmCount(RequestContext context) {
		try {
			String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
			String endTime = StringUtil.toString(context.getParameter("END_TIME"));
			int cardealAlarmCount = this.alarmDao.getCarDealAlarmCount(beginTime, endTime);
			ResponseUtil.addSuccessInfo(context, cardealAlarmCount, null);
		} catch (Exception e) {
			ResponseUtil.addFailInfo(context, null, e);
		}
	}

	/**
	 * 得到已处理人脸告警总数
	 * @param context 请求上下文，应该包括BEGIN_TIME和END_TIME两个参数
	 */
	@BeanService(id = "getDealtFaceAlarmCount", description = "得到已处理人脸告警总数")
	public void getDealtFaceAlarmCount(RequestContext context) {
		try {
			String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
			String endTime = StringUtil.toString(context.getParameter("END_TIME"));
			int faceAlarmCount = this.alarmDao.getDealtFaceAlarmCount(beginTime, endTime);
			ResponseUtil.addSuccessInfo(context, faceAlarmCount, null);
		} catch (Exception e) {
			ResponseUtil.addFailInfo(context, null, e);
		}
	}


	/**
	 * 得到今年和同比的每个月的告警数量
	 * @param context 请求上下文
	 */
	@BeanService(id = "getThisYearAndLastYearMonthGroupFaceAlarmCount", description = "得到今年和同比的每个月的人脸告警数量")
	public void getThisYearAndLastYearMonthGroupFaceAlarmCount(RequestContext context) {
		try {
			Map<Integer, List<Long>> map = new LinkedHashMap<>();
			for (int i = 1; i <= 12; i++) {
				map.put(i, new LinkedList<>(Arrays.asList(0L, 0L)));
			}
			Calendar calendar = Calendar.getInstance();
			int year = calendar.get(Calendar.YEAR);
			this.buildMonthMap(this.alarmDao.getMonthGroupFaceAlarmCount(year), map, 0);
			this.buildMonthMap(this.alarmDao.getMonthGroupFaceAlarmCount(year - 1), map, 1);
			ResponseUtil.addSuccessInfo(context, map, null);
		} catch (Exception e) {
			ResponseUtil.addFailInfo(context, null, e);
		}
	}
	/**
	 * 得到今年和同比的每个月的车辆告警数量
	 * @param context 请求上下文
	 */
	@BeanService(id = "getContrastYearCarAlarmDetail", description = "得到今年和同比的每个月的车辆告警数量")
	public void getContrastYearCarAlarmDetail(RequestContext context) {
		try {
			Map<Integer, List<Long>> map = new LinkedHashMap<>();
			for (int i = 1; i <= 12; i++) {
				map.put(i, new LinkedList<>(Arrays.asList(0L, 0L)));
			}
			int year = Integer.valueOf(DateUtil.getThisYear());
			this.buildMonthMap(this.alarmDao.getMonthGroupCarAlarmCount(year), map, 0);
			this.buildMonthMap(this.alarmDao.getMonthGroupCarAlarmCount(year - 1), map, 1);
			ResponseUtil.addSuccessInfo(context, map, null);
		} catch (Exception e) {
			ResponseUtil.addFailInfo(context, null, e);
		}
	}

	private void buildMonthMap(List<Map<String, Object>> rows, Map<Integer, List<Long>> map, int index) {
		rows.stream().forEach(row -> {
			Integer month = Integer.valueOf(row.get("MONTH").toString());
			map.get(month).set(index, Long.valueOf(row.get("NUM").toString()));
		});
	}

	private Map<String, Object> getData(RequestContext context) throws Exception {
		Map<String, Object> statistics = new HashMap<String, Object>();
		
		String algos = StringUtil.toString(context.getParameter("MULIT_ALGO_TYPE"));
		String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"), "1970-01-01 00:00:00");
		String endTime = StringUtil.toString(context.getParameter("END_TIME"), "");
		statistics.put("beginTime", beginTime.substring(0, 10));
		statistics.put("endTime", endTime.length() > 10 ? endTime.substring(0, 10) : "");

		List<Map<String, Object>> algoTypeList = faceAlgorithmTypeDao.getAlgorithTypeList();
		Map<String, String> algoIDNameMap = algoTypeList.stream().collect(Collectors.toMap(
				o -> StringUtil.toString(o.get("ALGORITHM_ID")), o -> StringUtil.toString(o.get("ALGORITHM_NAME"))));

		// 统计总量
		context.putParameter("ALGO_LIST", "");
		context.putParameter("RACE_CONFIRM", "1");
		Map<String, Integer> all = alarmDao.countAlgoConfirm(null, beginTime, endTime);
		int correctCount = StringUtil.toInteger(all.get(CONFIRM_STATUS_ACCURATE), 0);
		statistics.put("correctCount", correctCount);

		// 统计各算法
		if (StringUtil.isEmpty(algos)) {
			statistics.put("algo", Collections.emptyList());
		} else {
			List<Map<String, Object>> agloStatisticsResultList = new ArrayList<Map<String, Object>>();
			String[] algosTostatis = algos.split(",");
			for (int i = 0; i < algosTostatis.length; i++) {
				String algoID = algosTostatis[i].toString();
				if (StringUtil.isEmpty(algoID)) {
					continue;
				}
				Map<String, Integer> algoCountResult = alarmDao.countAlgoConfirm(algoID, beginTime, endTime);
				int correctAlgoCount = StringUtil.toInteger(algoCountResult.get(CONFIRM_STATUS_ACCURATE), 0);
				int wrongAlgoCount  = StringUtil.toInteger(algoCountResult.get(CONFIRM_STATUS_INACCURATE), 0)
						+ (correctCount - correctAlgoCount);

				Map<String, Object> algoResult = new HashMap<String, Object>();
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
	@BeanService(id = "statistics/download", description = "告警准确性统计下载", type = "remote")
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
			columns.add(new ExcelColumn("allCorrectCount", "告警准确数", getHeadWidth(7), false));
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
