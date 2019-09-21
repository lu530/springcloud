package com.suntek.efacecloud.service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.suntek.eap.EAP;
import com.suntek.eap.common.log.ServiceLog;
import com.suntek.eap.index.Query;
import com.suntek.eap.index.SearchEngineException;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.EsUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceAlgorithmTypeDao;
import com.suntek.efacecloud.dao.FaceCaptureStatisticDao;
import com.suntek.efacecloud.model.ExcelColumn;
import com.suntek.efacecloud.provider.es.FaceCaptureEsProvider;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ExcelUtil;
import com.suntek.efacecloud.util.ResponseUtil;
import org.apache.commons.collections.MapUtils;
import org.elasticsearch.action.search.SearchType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 路人库统计
 */
@LocalComponent(id = "face/capture", isLog = "true")
public class FaceCaptureEsStatisticService {

    FaceAlgorithmTypeDao faceAlgorithmTypeDao = new FaceAlgorithmTypeDao();

    FaceCaptureStatisticDao faceCaptureStatisticDao = new FaceCaptureStatisticDao();

    FaceCaptureStatisticService faceCaptureStatisticService = new FaceCaptureStatisticService();

    /**
     * @Title: 抓拍量统计
     **/
    @BeanService(id = "statistics", description = "路人库统计", type = "remote")
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
     * 获得人脸的抓拍量
     *
     * @param context 请求上下文，应该包括BEGIN_TIME和END_TIME两个参数
     * @throws Exception
     */
    @BeanService(id = "getFaceCaptureCount", description = "获得人脸的抓拍量")
    public void getFaceCaptureCount(RequestContext context) {
        try {
            context.putParameter("pageNo", "1");
            context.putParameter("pageSize", "0");
            String deviceIdLink = this.faceCaptureStatisticDao.getFaceDeviceIds().stream().map(row -> StringUtil.toString(row.get("DEVICE_ID"))).collect(Collectors.joining(","));
            context.putParameter("DEVICE_IDS", deviceIdLink);
            Map<String, Object> all = new FaceCaptureEsProvider().query(context);
            ResponseUtil.addSuccessInfo(context, all.get("count"), null);
        } catch (Exception e) {
            ResponseUtil.addFailInfo(context, null, e);
        }
    }


    /**
     * 获得本月每天的抓拍量
     *
     * @param context 请求上下文，应该包括BEGIN_TIME和END_TIME两个参数
     * @throws Exception
     */
    @BeanService(id = "getThisMonthFaceCaptureCountGroupByDay", description = "获得人脸的抓拍量")
    public void getThisMonthFaceCaptureCountGroupByDay(RequestContext context) {
        try {
            List<String> deviceIds = this.faceCaptureStatisticDao.getFaceDeviceIds().stream().map(row -> StringUtil.toString(row.get("DEVICE_ID"))).collect(Collectors.toList());
            String[] timeArray = this.buildThisMonthBeginTimeAndEndTime();
            Map<Object, Long> map = this.queryStatisticsByJGRQ(deviceIds, timeArray[0], timeArray[1]);
            Map<Integer, Long> result = new LinkedHashMap<>();
            map.entrySet().forEach(entry -> {
                Integer key = Integer.valueOf(entry.getKey().toString().substring(4));
                result.put(key, entry.getValue());
            });
            ResponseUtil.addSuccessInfo(context, result, null);
        } catch (Exception e) {
            ResponseUtil.addFailInfo(context, null, e);
        }
    }

    /**
     * 根据场景得到本月的人脸抓拍的量及百分比值
     * @param context
     */
    @BeanService(id = "getThisMonthFaceCaptureCountAndPercentValueGroupByScene", description = "获得人脸的抓拍量")
    public void getThisMonthFaceCaptureCountAndPercentValueGroupByScene(RequestContext context) {
        try {
            String[] timeArray = this.buildThisMonthBeginTimeAndEndTime();
            List<Map<String, Object>> faceSceneDeviceIds = this.faceCaptureStatisticDao.findFaceSceneDeviceIds();
            Map<String, NumAndPercent> result = new LinkedHashMap<>();
            faceSceneDeviceIds.forEach(row -> {
                String sceneName = StringUtil.toString(row.get("NAME"));
                String deviceIds = StringUtil.toString(row.get("DEVICE_IDS"));
                List<String> deviceList = Arrays.asList(deviceIds.split(","));
                Map<Object, Long> map;
                try {
                    map = this.faceCaptureStatisticService.queryStatisticsByDeviceId(deviceList, timeArray[0], timeArray[1]);
                    long sum = map.values().stream().mapToLong(Long::longValue).sum();
                    result.put(sceneName, new NumAndPercent(sum, null));
                } catch (SearchEngineException e) {
                    e.printStackTrace();
                    throw new RuntimeException(e);
                }
            });
            long zooSum = result.values().stream().mapToLong(NumAndPercent::getNum).sum();
            result.entrySet().forEach(entry -> {
                NumAndPercent value = entry.getValue();
                value.setPercentValue(this.buildPercentValue(value.getNum(), zooSum));
            });
            ResponseUtil.addSuccessInfo(context, result, null);
        } catch (Exception e) {
            ResponseUtil.addFailInfo(context, null, e);
        }
    }

    private Double buildPercentValue(long value, long zoo) {
        BigDecimal divisor = new BigDecimal(value);
        BigDecimal zooBigDecimal = new BigDecimal(zoo);
        BigDecimal result = divisor.divide(zooBigDecimal, 2, RoundingMode.HALF_UP).multiply(new BigDecimal(100));
        return result.doubleValue();
    }


    /**
     * 构建当前月的开始日期和结束日期
     * @return 数组，第一个是开始日期，第二个为结束日期
     */
    private String[] buildThisMonthBeginTimeAndEndTime() {
        Calendar beginCalendar = DateUtil.getFirstDayOfMonth();
        beginCalendar.set(Calendar.HOUR_OF_DAY, 0);
        beginCalendar.set(Calendar.MINUTE, 0);
        beginCalendar.set(Calendar.SECOND, 0);
        String beginTime = DateUtil.dateToString(beginCalendar.getTime());
        Calendar endCalendar = DateUtil.getLastDayOfMonth();
        endCalendar.set(Calendar.HOUR_OF_DAY, 23);
        endCalendar.set(Calendar.MINUTE, 59);
        endCalendar.set(Calendar.SECOND, 59);
        String endTime = DateUtil.dateToString(endCalendar.getTime());
        String[] array = {beginTime, endTime};
        return array;
    }

    /**
     *
     * @param deviceIdList
     * @param beginTime
     * @param endTime
     * @return
     * @throws SearchEngineException
     */
    private Map<Object, Long> queryStatisticsByJGRQ(List<String> deviceIdList, String beginTime,
                                                    String endTime) throws SearchEngineException {
        Long sjgsk = Long.valueOf(DateUtil.convertByStyle(beginTime, DateUtil.standard_style,
                DateUtil.yyMMddHHmmss_style, "-1"));
        Long ejgsk = Long.valueOf(DateUtil.convertByStyle(endTime, DateUtil.standard_style,
                DateUtil.yyMMddHHmmss_style, "-1"));
        String[] indices = EsUtil.getIndexNameByTime(Constants.FACE_INDEX + "_", beginTime, endTime);

        Query query = new Query(1, 100);
        //query.addEqualCriteria("DEVICE_ID", Arrays.stream(deviceIdList.toArray()).collect());
        query.addBetweenCriteria("JGSK", sjgsk, ejgsk);
        query.setAggregation("JGRQ");
        query.setSearchType(SearchType.DEFAULT);
        return EAP.bigdata.queryStatistics(indices, query, Constants.FACE_TABLE);
    }


    /**
     * 获得人脸的设备数量
     *
     * @param context 请求上下文，应该包括BEGIN_TIME和END_TIME两个参数
     * @throws Exception
     */
    @BeanService(id = "getFaceDeviceCount", description = "获得人脸的设备数量")
    public void getFaceDeviceCount(RequestContext context) {
        try {
            int faceDeviceCount = this.faceCaptureStatisticDao.getFaceDeviceCount();
            ResponseUtil.addSuccessInfo(context, faceDeviceCount, null);
        } catch (Exception e) {
            ResponseUtil.addFailInfo(context, null, e);
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
        //context.putParameter("RACE_CONFIRM", "1");
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
                String wrongCountHeader = StringUtil.toString(algo.get("algoName")) + "-错误数";
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

    public static class NumAndPercent {
        /**
         * 数量
         */
        public long num;

        /**
         * 百分值
         */
        public Double percentValue;

        public NumAndPercent(long num, Double percentValue) {
            this.num = num;
            this.percentValue = percentValue;
        }

        public long getNum() {
            return num;
        }

        public void setNum(long num) {
            this.num = num;
        }

        public Double getPercentValue() {
            return percentValue;
        }

        public void setPercentValue(Double percentValue) {
            this.percentValue = percentValue;
        }
    }

}
