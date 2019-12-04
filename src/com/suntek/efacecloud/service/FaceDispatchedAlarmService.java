package com.suntek.efacecloud.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.collections.CollectionUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ConnectTimeoutException;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.org.UserModel;
import com.suntek.eap.pico.ILocalComponent;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceDispatchedAlarmDao;
import com.suntek.efacecloud.dao.FaceSchedulingDao;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.util.CommonUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.MaskIdentityAndNameUtil;
import com.suntek.efacecloud.util.ModuleUtil;

/**
 * 人脸抓拍告警服务 确认身份 efacecloud/rest/v6/face/dispatchedAlarm
 * 
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29 Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/dispatchedAlarm")
public class FaceDispatchedAlarmService {
    private FaceDispatchedAlarmDao alarmDao = new FaceDispatchedAlarmDao();

    /**
     * 
     * @param context
     * @throws Exception
     */
    @BeanService(id = "detail", description = "告警详情", type = "remote")
    public void alarmDetail(RequestContext context) throws Exception {
        Map<String, Object> params = context.getParameters();
        String alarmId = StringUtil.toString(params.get("ALARM_ID"));
        List<Map<String, Object>> detailList = alarmDao.getAlarmDetail(alarmId);
        boolean isSignIn = false;
        boolean isCallback = false;

        Map<String, Object> result = Collections.emptyMap();
        if (CollectionUtils.isNotEmpty(detailList)) {
            result = detailList.get(0);
            JSONObject objectExtendInfo = JSONObject.parseObject(StringUtil.toString(result.get("OBJECT_EXTEND_INFO")));
            result.put("CONFIRM_STATUS", StringUtil.toString(result.get("CONFIRM_STATUS")));
            result.put("IDENTITY_ID", objectExtendInfo.getString("IDENTITY_ID"));
            result.put("NAME", objectExtendInfo.getString("NAME"));
            result.put("SEX", objectExtendInfo.getString("SEX"));
            // result.put("ALARM_IMG", ModuleUtil.renderAlarmImage(StringUtil.toString(result.get("ALARM_IMG"))));
            result.put("ALARM_IMG", ModuleUtil.renderImage(StringUtil.toString(result.get("ALARM_IMG"))));
            if (objectExtendInfo.containsKey("OBJECT_PICTURE")) {
                // result.put("TEMPLET_IMG",
                // ModuleUtil.renderAlarmImage(StringUtil.toString(objectExtendInfo.get("OBJECT_PICTURE"))));
                result.put("TEMPLET_IMG",
                    ModuleUtil.renderImage(StringUtil.toString(objectExtendInfo.get("OBJECT_PICTURE"))));
            } else {
                // result.put("TEMPLET_IMG",
                // ModuleUtil.renderAlarmImage(StringUtil.toString(result.get("TEMPLET_IMG"))));
                result.put("TEMPLET_IMG", ModuleUtil.renderImage(StringUtil.toString(result.get("TEMPLET_IMG"))));
            }
            result.put("FRAME_IMG", ModuleUtil.renderAlarmImage(StringUtil.toString(result.get("FRAME_IMG"))));
            double score = Double.valueOf(StringUtil.toString(result.get("SCORE")));
            BigDecimal b = new BigDecimal(score);
            result.put("SCORE", b.setScale(2, BigDecimal.ROUND_HALF_UP).intValue());
            String deviceId = StringUtil.toString(result.get("DEVICE_ID"));
            DeviceEntity device
                = (DeviceEntity)EAP.metadata.getDictModel(DictType.D_FACE, deviceId, DeviceEntity.class);
            result.put("DEVICE_ADDR", device.getDeviceAddr());

            List<Map<Object, Object>> algoList = new ArrayList<>();
            Map<Object, Object> algo
                = ModuleUtil.getAlgorithmById(Integer.parseInt(StringUtil.toString(result.get("ALGO_TYPE"))));
            algo.put("SCORE", result.get("SCORE") + "%");
            algoList.add(algo);

            List<Map<String, Object>> checkAlgoList = new ArrayList<>();
            // 获取比对结果
            if (objectExtendInfo.containsKey("MUTIL_ALGO_CHECK")) {
                JSONObject algoCheck = objectExtendInfo.getJSONObject("MUTIL_ALGO_CHECK");
                checkAlgoList = ModuleUtil.getCheckAlgoList(algoCheck);
            }

            result.put("DB_ID", result.get("DB_ID"));
            result.put("DB_NAME", result.get("DB_NAME"));
            result.put("ALGO_LIST", algoList);
            result.put("CHECK_ALGO_LIST", checkAlgoList);
            result.put("RECENT_COUNT", alarmDao.getRecentAlarmCount(context.getParameters()));

            List<Map<String, Object>> handleRecords = alarmDao.queryAlarmHandleRecord(alarmId);

            for (Map<String, Object> record : handleRecords) {
                String opType = StringUtil.toString(record.get("OP_TYPE"));
                if ("1".equals(opType)) {
                    isSignIn = true;
                } else if ("9".equals(opType)) {
                    isCallback = true;
                }
            }
            result.put("IS_SIGN_IN", isSignIn);
            result.put("IS_CALLBACK", isCallback);

            long startTime = System.currentTimeMillis();

            // 获取最近（如7天）某个人的告警列表的派出所信息
            try {
                // 人脸告警详情查询最近某个人告警列表的派出所信息的时间间隔，单位（天）0禁用
                String timeInterval
                    = AppHandle.getHandle(Constants.APP_NAME).getProperty("RELATIVE_POLICESTATION_INFO_INTERVAL", "0");

                // 扩展字段json加入police_station_info的json信息
                JSONObject policeStationJson = new JSONObject();
                objectExtendInfo.put("POLICE_STATION_INFO", policeStationJson);

                // 时间间隔为0，就不显示（IS_SHOW为0）；相反则为1
                if (timeInterval.equals("0")) {
                    policeStationJson.put("IS_SHOW", "0");
                } else {
                    policeStationJson.put("IS_SHOW", "1");
                    // 获取当前告警设备关联派出所信息
                    List<Map<String, Object>> policeStationList = alarmDao.getRelativePoliceStaion1Info(deviceId);
                    if (policeStationList == null || policeStationList.isEmpty()) {
                        policeStationList = alarmDao.getRelativePoliceStaion2Info(deviceId);
                    }

                    String deptName = "";
                    if (policeStationList != null && !policeStationList.isEmpty()) {
                        Map<String, Object> policeStationMap = policeStationList.get(0);
                        // 组装派出所信息json
                        deptName = StringUtil.toString(policeStationMap.get("DEPT_NAME"));
                        policeStationJson.put("DEPT_NAME", deptName);
                    }

                    // 查询最近（如7天）某个人的告警列表的关联派出所信息
                    String endTime = StringUtil.toString(result.get("ALARM_TIME"));
                    String beginTime
                        = DateUtil.getDayOffset(endTime, -1 * Integer.parseInt(timeInterval), "yyyy-MM-dd");
                    String objectId = StringUtil.toString(result.get("OBJECT_ID"));
                    Map<String, Object> recentAlarmParams = new HashMap<String, Object>();
                    recentAlarmParams.put("BEGIN_TIME", beginTime);
                    recentAlarmParams.put("END_TIME", endTime);
                    recentAlarmParams.put("OBJECT_ID", objectId);

                    List<Map<String, Object>> recentAlarmList = Collections.emptyList();
                    // objectId不为空才查询相关派出所信息
                    if (!StringUtil.isEmpty(objectId)) {
                        recentAlarmList = alarmDao.getRecentAlarmList(recentAlarmParams);
                    }

                    // 存储相关派出所信息
                    Set<String> policeStationSet = new HashSet<String>();

                    if (recentAlarmList != null && !recentAlarmList.isEmpty()) {

                        for (Map<String, Object> recentAlarmMap : recentAlarmList) {

                            String reDeptName = StringUtil.toString(recentAlarmMap.get("DEPT_NAME"));
                            if (StringUtil.isEmpty(reDeptName)) {
                                reDeptName = StringUtil.toString(recentAlarmMap.get("ORG_NAME"));
                            }
                            if (!StringUtil.isEmpty(reDeptName) && !reDeptName.equals(deptName)) {
                                policeStationSet.add(reDeptName);
                            }

                        }

                        // 相关派出所信息的List集合
                        List<String> relativePoliceStationList = new ArrayList<String>(policeStationSet);
                        objectExtendInfo.put("RELATIVE_POLICE_STATION_INFO",
                            JSONArray.toJSON(relativePoliceStationList));
                    }
                }

                result.put("OBJECT_EXTEND_INFO", objectExtendInfo.toJSONString());

                long endTime = System.currentTimeMillis();
                float excTime = (float)(endTime - startTime) / 1000;
                ServiceLog.debug("获取相关派出所方法的执行时间:" + excTime);
            } catch (Exception e) {
                ServiceLog.error("获取最近（如7天）某个人的告警列表的派出所信息出错：" + e.getStackTrace()[0]);
                ServiceLog.error("获取最近（如7天）某个人的告警列表的派出所信息出错：" + e.getStackTrace()[1]);
                ServiceLog.error("获取最近（如7天）某个人的告警列表的派出所信息出错：" + e.getStackTrace()[2]);
                e.printStackTrace();
            }

        }
        if ("1".equals(MaskIdentityAndNameUtil.IS_MASK_IDENTITY_AND_NAME)) {
            MaskIdentityAndNameUtil.renderIdentityIdAndName(result);
        }

        // 20190115,zsj,通过alarmid获取dispatchids
        List<Map<String, Object>> policetaskobj = new FaceSchedulingDao().getPolicetaskdisatchIds(alarmId);
        List<Object> policetaskdispatchIds = new ArrayList<>();
        for (Map<String, Object> each : policetaskobj) {
            policetaskdispatchIds.add(each.get("TASK_ID"));
        }
        result.put("POLICE_TASK_ID", policetaskdispatchIds);

        context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
        context.getResponse().putData("MESSAGE", "查询成功");
        context.getResponse().putData("DATA", result);
    }

    /**
     * 
     * @param context
     * @throws Exception
     */
    @BeanService(id = "dbList", description = "告警库列表", type = "remote")
    public void getDbList(RequestContext context) throws Exception {
        String elementId = (String)context.getParameter("elementId");
        context.getResponse().putData(elementId, alarmDao.getAlarmDbList(context.getUser()));
    }

    /**
     * 
     * @param context
     * @throws Exception
     */
    @BeanService(id = "delete", description = "删除")
    public void faceDispatchedAlarmDelete(RequestContext context) throws Exception {

        String alarmId = StringUtil.toString(context.getParameter("ALARM_ID"));
        boolean flag = alarmDao.updateDealStatus(Constants.DEAL_STATUS_DELETE, alarmId);
        if (flag) {
            context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
            context.getResponse().putData("MESSAGE", "删除成功");
        } else {
            context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
            context.getResponse().putData("MESSAGE", "删除失败, 数据库异常！");
        }

    }

    /**
     * 
     * @param context
     * @throws Exception
     */
    @BeanService(id = "confirm", description = "确认")
    public void faceDispatchedAlarmCheck(RequestContext context) throws Exception {
        String alarmId = StringUtil.toString(context.getParameter("ALARM_ID"));
        String alarmImg = StringUtil.toString(context.getParameter("ALARM_IMG"));
        String identityId = StringUtil.toString(context.getParameter("IDENTITY_ID"));
        String personName = StringUtil.toString(context.getParameter("PERSON_NAME"));
        String permanentAddress = StringUtil.toString(context.getParameter("PERMANENT_ADDRESS"));
        String presentAddress = StringUtil.toString(context.getParameter("PRESENT_ADDRESS"));
        String birthDay = StringUtil.toString(context.getParameter("BIRTHDAY"));
        String sex = StringUtil.toString(context.getParameter("PERSON_SEX"), "0");

        alarmDao.updateDealStatus(Constants.DEAL_STATUS_CONFIRM, alarmId);

        ServiceLog.debug("验证身份证是否合法！");
        if (!StringUtil.isNull(identityId)) {
            Map<String, Object> addPersonParam = new HashMap<String, Object>();

            addPersonParam.put("NAME", personName);
            addPersonParam.put("SEX", sex);
            addPersonParam.put("IDENTITY_TYPE", Constants.IDENTITY_TYPE_ID);
            addPersonParam.put("IDENTITY_ID", identityId);
            addPersonParam.put("BIRTHDAY", birthDay);
            addPersonParam.put("PERMANENT_ADDRESS", permanentAddress);
            addPersonParam.put("PRESENT_ADDRESS", presentAddress);
            addPersonParam.put("QQ", "");
            addPersonParam.put("TELEPHONE", "");
            addPersonParam.put("WECHAT", "");
            addPersonParam.put("WORK_ADDRESS", "");
            addPersonParam.put("PIC", alarmImg);
            addPersonParam.put("CREATOR", context.getUserCode());
            addPersonParam.put("CREATE_TIME", DateUtil.getDateTime());

            context.getParameters().putAll(addPersonParam);
            new FaceArchivesService().addPerson(context);
        }
    }

    /**
     * 2018/12/10 告警统计新需求 去掉本月、本周和30天条件 只查询七天数据，以一天为一条折线，展示当天每小时的告警数据
     * 
     * @param context
     * @throws Exception
     */
    @BeanService(id = "alarmStatisticWeek", description = "告警统计")
    public void faceDispatchedAlarmStatisticWeek(RequestContext context) throws Exception {

        String alarmStartTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
        String alarmEndTime = StringUtil.toString(context.getParameter("END_TIME"));
        String deviceIds = StringUtil.toString(context.getParameter("DEVICE_IDS"));
        String dbIds = StringUtil.toString(context.getParameter("DB_IDS"));
        String alarmType = StringUtil.toString(context.getParameter("ALARM_TYPE"));

        List<Map<String, List<String>>> result = new ArrayList<Map<String, List<String>>>();

        for (int i = 0; i > -7; i--) {
            Map<String, List<String>> map = new HashMap<String, List<String>>();
            int timeType = 1;
            String beginTime = "";
            String endTime = "";
            beginTime = DateUtil.getDayOffset(alarmEndTime, i, "yyyyMMdd") + "00";
            endTime = DateUtil.getDayOffset(alarmEndTime, i, "yyyyMMdd") + "23";

            UserModel userModel = context.getUser();
            List<Map<String, Object>> dataList
                = alarmDao.getAlarmList(userModel, alarmStartTime, alarmEndTime, deviceIds, dbIds, alarmType, 0);

            List<String> resultByTime = getDataByTimeKey(timeType, beginTime, endTime, dataList);
            map.put(DateUtil.convertByStyle(DateUtil.getDayOffset(alarmEndTime, i, "yyyyMMdd"), DateUtil.yyyyMMdd_style,
                DateUtil.yyyy_MM_dd_style), resultByTime);
            result.add(map);

        }
        context.getResponse().putData("DATA", result);

    }

    /**
     * 
     * @param context
     * @throws Exception
     */
    @BeanService(id = "alarmStatistic", description = "告警统计")
    public void faceDispatchedAlarmStatistic(RequestContext context) throws Exception {

        String alarmStartTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
        String alarmEndTime = StringUtil.toString(context.getParameter("END_TIME"));
        String statisticType = StringUtil.toString(context.getParameter("STATISTIC_TYPE"));
        String deviceIds = StringUtil.toString(context.getParameter("DEVICE_IDS"));
        String dbIds = StringUtil.toString(context.getParameter("DB_IDS"));
        String alarmType = StringUtil.toString(context.getParameter("ALARM_TYPE"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        LocalDate todayDate = LocalDate.now();

        int timeType = 0;
        String beginTime = "";
        String endTime = "";
        Date today = new Date();
        switch (statisticType) {
            case "1":
                beginTime = DateUtil.dateToString(today, "yyyyMMdd") + "00";
                endTime = DateUtil.dateToString(today, "yyyyMMdd") + "23";
                timeType = 1;
                break;
            case "2":
                beginTime = DateUtil.getDayOffset(-1, "yyyyMMdd") + "00";
                endTime = DateUtil.getDayOffset(-1, "yyyyMMdd") + "23";
                timeType = 1;
                break;
            case "3":
                Calendar cal = Calendar.getInstance();
                cal.set(cal.get(Calendar.YEAR), cal.get(Calendar.MONDAY), cal.get(Calendar.DAY_OF_MONTH), 0, 0, 0);
                cal.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY);
                beginTime = DateUtil.dateToString(cal.getTime(), "yyyyMMdd");
                cal.add(Calendar.DAY_OF_WEEK, 6);
                endTime = DateUtil.dateToString(cal.getTime(), "yyyyMMdd");
                timeType = 2;
                break;
            case "4":
                beginTime = DateUtil.dateToString(DateUtil.getFirstDayOfMonth().getTime(), "yyyyMMdd");
                endTime = DateUtil.dateToString(DateUtil.getLastDayOfMonth().getTime(), "yyyyMMdd");
                timeType = 2;
                break;
            case "5":
                endTime = todayDate.format(formatter);
                beginTime = todayDate.minusDays(6).format(formatter);
                timeType = 2;
                break;
            case "6":
                endTime = todayDate.format(formatter);
                beginTime = todayDate.minusDays(29).format(formatter);
                timeType = 2;
                break;
            case "7":
                beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
                endTime = StringUtil.toString(context.getParameter("END_TIME"));
                if (beginTime.equals(endTime)) {
                    beginTime = DateUtil.dateToString(DateUtil.toDate(beginTime), "yyyyMMdd") + "00";
                    endTime = DateUtil.dateToString(DateUtil.toDate(endTime), "yyyyMMdd") + "23";
                    timeType = 1;
                    break;
                } else {
                    beginTime = DateUtil.dateToString(DateUtil.toDate(beginTime), "yyyyMMdd");
                    endTime = DateUtil.dateToString(DateUtil.toDate(endTime), "yyyyMMdd");
                    timeType = 2;
                    break;
                }
            default:
                break;
        }

        UserModel userModel = context.getUser();

        List<Map<String, Object>> dataList
            = alarmDao.getAlarmList(userModel, alarmStartTime, alarmEndTime, deviceIds, dbIds, alarmType, 0);

        List<Map<String, Object>> groupDataList
            = alarmDao.getAlarmList(userModel, alarmStartTime, alarmEndTime, deviceIds, dbIds, alarmType, 1);

        List<String> resultByTime = getDataByTimeKey(timeType, beginTime, endTime, dataList);
        List<String> groupResultByTime = getDataByTimeKey(timeType, beginTime, endTime, groupDataList);

        context.getResponse().putData("DATA", resultByTime);
        context.getResponse().putData("GROUP_DATA", groupResultByTime);
    }

    /**
     * @param countType 1： 按小时，2： 按天
     * @param startTime
     * @param endTime
     * @return
     */
    private List<String> getDataByTimeKey(int countType, String startTime, String endTime,
        List<Map<String, Object>> dataList) {
        List<Date> time = new ArrayList<Date>();
        List<String> result = new ArrayList<String>();

        SimpleDateFormat hourDf = new SimpleDateFormat("yyyyMMddHH");
        SimpleDateFormat daydf = new SimpleDateFormat("yyyyMMdd");

        try {
            switch (countType) {
                case 1:
                    time = getDatesBetweenTwoDate(hourDf.parse(startTime), hourDf.parse(endTime), countType);

                    Map<Object, List<Map<String, Object>>> resultData = dataList.stream()
                        .collect(Collectors.groupingBy(o -> StringUtil.toString(o.get("ALARM_TIME")).substring(0, 13)));

                    for (Date ti : time) {
                        String tiSdf = DateUtil.dateToString(ti, "yyyy-MM-dd HH");
                        List<Map<String, Object>> timeResult = resultData.get(tiSdf);
                        if (CollectionUtils.isNotEmpty(timeResult)) {
                            result.add(StringUtil.toString(resultData.get(tiSdf).size(), "0"));
                        } else {
                            result.add("0");
                        }
                    }

                    break;
                case 2:
                    time = getDatesBetweenTwoDate(daydf.parse(startTime), daydf.parse(endTime), countType);
                    Map<Object, List<Map<String, Object>>> resultData2 = dataList.stream()
                        .collect(Collectors.groupingBy(o -> StringUtil.toString(o.get("ALARM_TIME")).substring(0, 10)));

                    for (Date ti : time) {
                        String tiSdf = DateUtil.dateToString(ti, "yyyy-MM-dd");
                        List<Map<String, Object>> timeResult = resultData2.get(tiSdf);
                        if (CollectionUtils.isNotEmpty(timeResult)) {
                            result.add(StringUtil.toString(resultData2.get(tiSdf).size(), "0"));
                        } else {
                            result.add("0");
                        }
                    }
                    break;
                default:
                    break;
            }
        } catch (ParseException e) {
            ServiceLog.error(e);
        }

        return result;
    }

    /**
     * 根据开始时间和结束时间返回时间段内的时间集合
     * 
     * @param beginDate
     * @param endDate
     * @return List
     */
    private List<Date> getDatesBetweenTwoDate(Date beginDate, Date endDate, int countType) {
        List<Date> dateList = new ArrayList<Date>();
        if (countType != 1 && countType != 2) {
            return dateList;
        }
        // 把开始时间加入集合
        dateList.add(beginDate);

        Calendar cal = Calendar.getInstance();
        cal.setTime(beginDate);
        boolean bContinue = true;
        while (bContinue) {
            switch (countType) {
                case 1:
                    cal.add(Calendar.HOUR_OF_DAY, 1);
                    break;
                case 2:
                    cal.add(Calendar.DAY_OF_MONTH, 1);
                    break;
                default:
                    break;
            }

            // 测试此日期是否在指定日期之后
            if (endDate.after(cal.getTime())) {
                dateList.add(cal.getTime());
            } else {
                break;
            }
        }
        // 把结束时间加入集合
        dateList.add(endDate);

        return dateList;
    }

    /**
     * 
     * @param context
     */
    @QueryService(id = "recent/list", type = "remote", description = "获取一个人最近的告警列表", since = "3.0.0")
    public void queryRecentAlarmList(RequestContext context) {

        Map<String, Object> params = context.getParameters();
        List<Map<String, Object>> recentAlarmList = alarmDao.getRecentAlarmList(params);
        for (Map<String, Object> map : recentAlarmList) {
            map.put("SEX", EAP.metadata.getDictValue(DictType.P_RECOGNIZE_SEX, StringUtil.toString(map.get("SEX"))));
            map.put("ALARM_IMG", CommonUtil.renderImage(StringUtil.toString(map.get("ALARM_IMG"))));
            map.put("TEMPLET_IMG", CommonUtil.renderImage(StringUtil.toString(map.get("TEMPLET_IMG"))));
            map.put("FRAME_IMG", CommonUtil.renderImage(StringUtil.toString(map.get("FRAME_IMG"))));

            String extendInfo = StringUtil.toString(map.get("PERSON_NAME"));
            try {
                JSONObject json = JSONObject.parseObject(extendInfo);
                map.put("PERSON_NAME", json.getString("NAME"));
                map.put("IDENTITY_ID", json.getString("IDENTITY_ID"));
            } catch (Exception e) {
                ServiceLog.error("转换PERSON_NAME或IDENTITY_ID异常", e);
            }
            double score = Double.parseDouble(StringUtil.toString(map.get("SCORE")));
            BigDecimal b = new BigDecimal(score);
            map.put("SCORE", b.setScale(2, BigDecimal.ROUND_HALF_UP).intValue());

            String deviceId = StringUtil.toString(map.get("ORIGINAL_DEVICE_ID"));
            try {
                DeviceEntity faceDevice
                    = (DeviceEntity)EAP.metadata.getDictModel(DictType.D_FACE, deviceId, DeviceEntity.class);
                map.put("DEVICE_NAME", faceDevice.getDeviceName());
                map.put("DEVICE_ADDR", faceDevice.getDeviceAddr());
                map.put("LONGITUDE", faceDevice.getDeviceX());
                map.put("LATITUDE", faceDevice.getDeviceY());
            } catch (Exception e) {
                ServiceLog.error("获取告警设备信息异常", e);
            }
        }
        context.getResponse().putData("result", recentAlarmList);
    }

    @BeanService(id = "alarmConfirm", description = "告警准确确认", type = "remote")
    public void alarmConfirm(RequestContext context) {
        Map<String, Object> param = context.getParameters();
        String alarmId = StringUtil.toString(param.get("ALARM_ID"));
        String confirmStatus = StringUtil.toString(param.get("CONFIRM_STATUS"));
        String typeAdd = StringUtil.toString(param.get("TYPE_ADD"));
        if (!StringUtil.isEmpty(typeAdd)) {
            try {
                if (EAP.bean.contains("face/moreDispatched/addMore")) {
                    ((ILocalComponent)EAP.bean.get("face/moreDispatched/addMore")).invoke(new Object[] {context});
                    ServiceLog.info("result : " + JSONObject.toJSONString(context.getResponse().getResult()));
                    Map<String, Object> result = (Map<String, Object>)context.getResponse().getResult();
                    if (Constants.RETURN_CODE_SUCCESS != (int)result.get("CODE")) {
                        // context.getResponse().putData("MESSAGE", "添加至多脸维护失败");
                        // context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                        return;
                    }
                } else {
                    context.getResponse().putData("MESSAGE", "找不到对应远程服务");
                    context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                    return;
                }
            } catch (Exception e) {
                ServiceLog.error(e);
                context.getResponse().putData("MESSAGE", "添加至多脸维护异常");
                context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                return;
            }
        }

        List<Map<String, Object>> detailList = alarmDao.getAlarmDetail(alarmId);
        if (CollectionUtils.isNotEmpty(detailList)) {
            /*Map<String, Object> result = detailList.get(0);
            JSONObject objectExtendInfo = JSONObject.parseObject(StringUtil.toString(result.get("OBJECT_EXTEND_INFO")));
            objectExtendInfo.put("CONFIRM_STATUS", confirmStatus);*/
            boolean is = alarmDao.updateConfirmStatus(confirmStatus, alarmId);
            if (is) {
                context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
                context.getResponse().putData("MESSAGE", "操作成功");
                return;
            }
        }
        context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
        context.getResponse().putData("MESSAGE", "操作失败");
    }

    @BeanService(id = "checkEscapeeStatus", description = "追逃状态确认", type = "remote")
    public void checkEscapeeStatus(RequestContext context) throws Exception {
        Map<String, Object> param = context.getParameters();
        String idenId = StringUtil.toString(param.get("IDEN_ID"));
        String url = "http://ztry.xz.ga/zyk_zt//xzztry/xzztryQueryResult.do?rnd=" + System.currentTimeMillis();

        /*  if (TaskLibInfoCacheManager.checkInGeneralCache(idenId)) { // 对全国在逃库状态做缓存，以减少http请求
            int escStatus = Integer.parseInt(StringUtil.toString(TaskLibInfoCacheManager.getGeneralCache(idenId)));
            SurveilTaskLogger.mutilalgo.debug("FaceAlarmGetFeiShiCompareHandler.checkEscapeeStatus, 在逃状态缓存比中，IDENID："
                + idenId + ",ESCSTATUS:" + escStatus);
            return escStatus;
        }*/

        Map<String, Object> reqMap = new HashMap<>();
        Map<String, Object> searchTerm = new HashMap<>();
        searchTerm.put("V_ZJHM", idenId);

        reqMap.put("appId", "xzztry");
        reqMap.put("async", true);
        reqMap.put("resourceId", "RESOURCE201509240000682");
        reqMap.put("YWBZ", "zt");
        reqMap.put("searchTerm", searchTerm);
        int escapeeStatus = 0;
        ServiceLog.debug("FaceAlarmGetFeiShiCompareHandler.checkEscapeeStatus, req URL:" + url + ", reqMap:" + reqMap);
        try {
            Map<String, Object> ret = httpPostForm(url, reqMap);
            int total = Integer.parseInt(StringUtil.toString(ret.get("total")));
            String rows = StringUtil.toString(ret.get("rows"));
            ServiceLog.debug(
                "FaceAlarmGetFeiShiCompareHandler.checkEscapeeStatus, resp result: total-" + total + ",rows-" + rows);

            if (total > 0) {
                escapeeStatus = 1;
            } else {
                escapeeStatus = 0;
            }
        } catch (Exception e) {
            ServiceLog.debug("FaceAlarmGetFeiShiCompareHandler.checkEscapeeStatus,api fail");
            escapeeStatus = 2;
            context.getResponse().putData("ESCAPEE_FLAG", escapeeStatus);
            String alarmId = StringUtil.toString(param.get("ALARM_ID"));
            List<Map<String, Object>> detailList = alarmDao.getAlarmDetail(alarmId);
            if (detailList != null) {
                JSONObject objectExtendInfo
                    = JSONObject.parseObject(StringUtil.toString(detailList.get(0).get("OBJECT_EXTEND_INFO")));
                objectExtendInfo.put("ESCAPEE_FLAG", String.valueOf(escapeeStatus));
                // alarmDao.updateExtendInfo(objectExtendInfo.toJSONString(), alarmId);
            }
            return;
        }
        String alarmId = StringUtil.toString(param.get("ALARM_ID"));
        List<Map<String, Object>> detailList = alarmDao.getAlarmDetail(alarmId);
        if (detailList != null) {
            JSONObject objectExtendInfo
                = JSONObject.parseObject(StringUtil.toString(detailList.get(0).get("OBJECT_EXTEND_INFO")));
            objectExtendInfo.put("ESCAPEE_FLAG", escapeeStatus);
            // alarmDao.updateExtendInfo(objectExtendInfo.toJSONString(), alarmId);
        }
        context.getResponse().putData("ESCAPEE_FLAG", escapeeStatus);

    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> httpPostForm(String url, Map<String, Object> reqMap) throws Exception {

        List<BasicNameValuePair> formParams = new ArrayList<BasicNameValuePair>();
        formParams.add(new BasicNameValuePair("json", JSON.toJSONString(reqMap)));
        formParams.add(new BasicNameValuePair("page", "1"));
        formParams.add(new BasicNameValuePair("rows", "15"));
        HttpEntity entity = new UrlEncodedFormEntity(formParams, "UTF-8");

        HttpPost request = new HttpPost(url);
        request.setHeader("Content-Type", "application/x-www-form-urlencoded");
        request.setHeader("Accept", "application/json, text/javascript, */*; q=0.01");
        request.setConfig(RequestConfig.custom().setConnectTimeout(10000).setConnectionRequestTimeout(10000)
            .setSocketTimeout(10000).build());
        request.setEntity(entity);

        /*PostMethod postMethod = new PostMethod(apiUrl);
        postMethod.add*/

        try (CloseableHttpClient httpclient = HttpClients.createDefault();
            CloseableHttpResponse response = httpclient.execute(request)) {

            HttpEntity respEntity = response.getEntity();
            String respEntityStr = EntityUtils.toString(respEntity, "UTF-8");
            return JSON.parseObject(respEntityStr, Map.class);

        } catch (ConnectTimeoutException | SocketTimeoutException | ClientProtocolException | SocketException e) {

            ServiceLog.error("HttpUtil.httpPostForm" + "连接服务端超时，与引擎通信异常", e);
            throw e;
        } catch (IOException e) {
            ServiceLog.error("HttpUtil.httpPostForm" + "发送http请求异常", e);
            throw e;
        }
    }

    @BeanService(id = "alarmConfirmToDB", description = "告警准确确认,更新告警表的确认状态", type = "remote", paasService = "true")
    public void alarmConfirmToDB(RequestContext context) {
        Map<String, Object> param = context.getParameters();
        ServiceLog.info("alarmConfirmToDB开始， 参数" + param);
        String alarmId = StringUtil.toString(param.get("ALARM_ID"));
        String confirmStatus = StringUtil.toString(param.get("CONFIRM_STATUS"));
        List<Map<String, Object>> detailList = alarmDao.getAlarmDetail(alarmId);
        if (CollectionUtils.isNotEmpty(detailList)) {
            /*Map<String, Object> result = detailList.get(0);
            JSONObject objectExtendInfo = JSONObject.parseObject(StringUtil.toString(result.get("OBJECT_EXTEND_INFO")));
            objectExtendInfo.put("CONFIRM_STATUS", confirmStatus);*/
            boolean is = alarmDao.updateConfirmStatus(confirmStatus, alarmId);
            if (is) {
                context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
                context.getResponse().putData("MESSAGE", "操作成功");
                return;
            }
        }
        context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
        context.getResponse().putData("MESSAGE", "操作失败");
    }

    @BeanService(id = "getTotalAlarm", type = "remote")
    public void getTotalAlarm(RequestContext context) throws Exception{
        Map<String, Object> resultMap = new HashMap<>();
        try {
            String orgCode = StringUtil.toString(context.getParameter("ORG_CODE"));
            if(StringUtil.isEmpty(orgCode)){
                context.getResponse().setWarn("行政区划不能为空");
                return;
            }
            List<Map<String, Object>> totalAlarm = alarmDao.getTotalAlarm(orgCode, context.getUserCode());
            if(totalAlarm.size() == 0){
                resultMap.put("RED",0);
                resultMap.put("YELLOW",0);
                resultMap.put("ORANGE",0);
                resultMap.put("BLUE",0);
                context.getResponse().putData("CODE",0);
                context.getResponse().putData("MESSAGE","查询成功");
                context.getResponse().putData("DATA",resultMap);
                return;
            }
            Map<Object, Object> temp = totalAlarm.stream().collect(Collectors.toMap(o -> o.get("ALARM_LEVEL"), o -> o.get("COUNT")));
            ServiceLog.debug("temp >>> " + JSON.toJSONString(temp));

            if(!temp.containsKey("RED")){
                temp.put("RED", 0);
            }
            if(!temp.containsKey("ORANGE")){
                temp.put("ORANGE", 0);
            }
            if(!temp.containsKey("YELLOW")){
                temp.put("YELLOW", 0);
            }
            if(!temp.containsKey("BLUE")){
                temp.put("BLUE", 0);
            }
            context.getResponse().putData("CODE",0);
            context.getResponse().putData("MESSAGE","查询成功");
            context.getResponse().putData("DATA",temp);
        } catch (Exception e) {
            ServiceLog.error("异常 >>> " + e.getMessage());
            context.getResponse().putData("CODE",1);
            context.getResponse().putData("MESSAGE","查询失败");
        }
    }

}
