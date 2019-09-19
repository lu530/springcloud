package com.suntek.efacecloud.service;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.index.query.QueryBuilders;

import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.index.Query;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.AlarmHandleRecordDao;
import com.suntek.efacecloud.dao.DeviceInfoDao;
import com.suntek.efacecloud.dao.SysStructureInfoDao;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ESUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

/**
 * 人脸统计服务
 * 
 * @author zhouyanqiang
 * @since 1.0.0
 * @version 2017-07-27
 */
@LocalComponent(id = "face/statistic")
public class FaceStatisticService {

    SysStructureInfoDao dao = new SysStructureInfoDao();

    DeviceInfoDao deviceInfoDao = new DeviceInfoDao();

    private static final int pageSize = 200;

    @BeanService(id = "captureDataByDay", description = "按天统计人脸抓拍数据")
    public void getCaptureDataByDay(RequestContext context) throws Exception {

        Map<String, Object> params = context.getParameters();
        String id = (String)context.getParameter("elementId");
        String beginTime = StringUtil.toString(params.get("BEGIN_TIME")); // 开始时间
        String endTime = StringUtil.toString(params.get("END_TIME")); // 结束时间

        if (StringUtil.isEmpty(endTime)) {
            endTime = DateUtil.getDateTime();
        }
        if (StringUtil.isEmpty(beginTime)) {// 默认最近七天
            beginTime = DateUtil.dateToString(
                DateUtil.weeHours(DateUtil.toDate(DateUtil.getDayOffset(endTime, -6, "yyyy-MM-dd HH:mm:ss")), 0));
        }
        String indexBeginTime = ConfigUtil.getIndexBeginTime();
        // 若索引开始时间大于开始时间
        if (indexBeginTime
            .compareTo(DateUtil.convertByStyle(beginTime, DateUtil.standard_style, DateUtil.yyMM_style)) > 0) {
            Map<Object, Long> map = new HashMap<Object, Long>();
            context.getResponse().putData(id, map);
            context.getResponse().putData("message", "开始时间小于索引起始时间["
                + DateUtil.convertByStyle(beginTime, DateUtil.yyMM_style, DateUtil.standard_style) + "]，请检查！");
            return;
        }

        List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
        long diff = DateUtil.diff(Calendar.DATE, DateUtil.toDate(endTime, DateUtil.standard_style),
            DateUtil.toDate(beginTime, DateUtil.standard_style));
        for (int i = 0; i < diff; i++) {
            Map<String, Object> returnMap = new HashMap<>();
            String date = DateUtil.getDayOffset(beginTime, i, DateUtil.yyMMdd_style);
            returnMap.put("DATE", date);
            // 从redis读取人脸抓拍每天人脸总数 源格式：VPLUS_PV_FACE_20170701
            String yyyyMMddDate = DateUtil.getDayOffset(beginTime, i, DateUtil.yyyyMMdd_style);
            String redisKey = "VPLUS_PV_FACE_COMPARE" + yyyyMMddDate;
            if (EAP.redis.exists(redisKey)) {
                returnMap.put("NUM", Integer.valueOf(EAP.redis.get(redisKey)));
            } else {
                returnMap.put("NUM", 0);
            }
            returnList.add(returnMap);
        }
        context.getResponse().putData(id, returnList);
        context.getResponse().putData("message", "获取数据成功");
    }

    @BeanService(id = "areaFace", description = "区域人脸统计数据")
    public void getAreaFaceData(RequestContext context) throws Exception {

        Map<String, Object> params = context.getParameters();
        String id = (String)context.getParameter("elementId");
        String beginTime = StringUtil.toString(params.get("BEGIN_TIME")); // 开始时间
        String endTime = StringUtil.toString(params.get("END_TIME")); // 结束时间
        String orgCode = StringUtil.toString(params.get("ORG_CODE")); // 地域代码
        List<Map<String, Object>> returnList = new ArrayList<>();
        String userCode = context.getUserCode();

        int orgCodeInt;
        if (StringUtil.isEmpty(orgCode)) {
            orgCodeInt = Integer.valueOf(context.getUser().getDept().getCivilCode());
        } else {
            orgCodeInt = Integer.valueOf(orgCode);
        }

        if (StringUtil.isEmpty(beginTime) && StringUtil.isEmpty(endTime)) {

            returnList = dao.getSubSysStructureList(userCode, orgCodeInt);
            // 从redis去人脸抓拍各个区域总数
            if (EAP.redis.exists("VPLUS_PV_TOTAL_R")) {
                Map<?, ?> faceTotals = EAP.redis.hgetall("VPLUS_PV_TOTAL_R");// 人脸抓拍区域总数
                for (Object key : faceTotals.keySet()) {
                    String code = StringUtil.toString(key).split("_")[3];// 源格式：VPLUS_PV_R_44_FACE、VPLUS_PV_R_4401_FACE
                    for (Map<String, Object> returnMap : returnList) {
                        if (StringUtil.toString(returnMap.get("ORG_CODE")).equals(code)) {
                            returnMap.put("NUM", faceTotals.get(key));
                        }
                    }
                }
            }
        } else {
            returnList = dao.getSubSysStructureSimpleList(userCode, orgCodeInt);

            String startDate = DateUtil.convertByStyle(beginTime, DateUtil.standard_style, DateUtil.yyyyMMdd_style);
            String endDate = DateUtil.convertByStyle(endTime, DateUtil.standard_style, DateUtil.yyyyMMdd_style);
            String tempDate = ConfigUtil.getIndexBeginTime();
            int startKey = Integer.parseInt(startDate);
            int endKey = Integer.parseInt(endDate);
            if (!StringUtil.isEmpty(tempDate)) {
                String runTime = DateUtil.convertByStyle(tempDate, DateUtil.yyMM_style, DateUtil.yyyyMMdd_style);
                int tempKey = Integer.parseInt(runTime);
                if (endKey < tempKey) {
                    context.getResponse().putData(id, returnList);
                    context.getResponse().putData("message", "获取数据成功");
                    return;
                }

                startKey = startKey < tempKey ? tempKey : startKey;
            }

            for (int i = startKey; i <= endKey; i++) {
                if (EAP.redis.exists("VPLUS_PV_" + i)) {
                    Map<String, String> map = EAP.redis.hgetall("VPLUS_PV_" + i);
                    for (Map<String, Object> returnMap : returnList) {
                        String staticsCode = StringUtil.toString(returnMap.get("ORG_CODE"));
                        String key = "VPLUS_PV_R_" + staticsCode + "_FACE";
                        if (map.containsKey(key)) {
                            returnMap.put("NUM", MapUtils.getLong(returnMap, "NUM") + MapUtils.getLong(map, key));
                        }
                    }
                }
            }
        }
        context.getResponse().putData(id, returnList);
        context.getResponse().putData("message", "获取数据成功");
    }

    @BeanService(id = "dataByDb", description = "按索引统计人脸总资源数据")
    public void getDataByIndice(RequestContext context) throws Exception {

        // Map<String, Object> params = context.getParameters();
        String id = (String)context.getParameter("elementId");
        // String beginTime = StringUtil.toString(params.get("BEGIN_TIME")); // 开始时间
        // String endTime = StringUtil.toString(params.get("END_TIME")); //结束时间

        List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
        CommandContext ctx = new CommandContext(context.getHttpRequest());
        Map<String, Object> body = new HashMap<String, Object>();
        body.put("pageNo", 1);
        body.put("pageSize", 100);
        ctx.setBody(body);
        long specialTotalNum = 0;
        long archiveTotalNum = 0;
        long terminalTotalNum = 0;
        try {
            Registry.getInstance().selectCommands(BaseCommandEnum.staticLibQuery.getUri()).exec(ctx);
            if (ctx.getResponse().getCode() == 0) {
                List<Map<String, Object>> records = (List<Map<String, Object>>)ctx.getResponse().getData("RECORDS");
                for (Map<String, Object> record : records) {
                    if (StringUtil.toString(record.get("TAG")).equals(Constants.DICT_CODE_STATIC_LIB_ARCHIVE)) {
                        archiveTotalNum += Long.parseLong(StringUtil.toString(record.get("PERSON_NUM"), "0"));
                    } else if (StringUtil.toString(record.get("TAG")).equals(Constants.DICT_CODE_STATIC_LIB_TERMINAL)) {
                        terminalTotalNum += Long.parseLong(StringUtil.toString(record.get("PERSON_NUM"), "0"));
                    } else if (StringUtil.toString(record.get("TAG")).equals(Constants.DICT_CODE_STATIC_LIB_SPECIAL)) {
                        specialTotalNum += Long.parseLong(StringUtil.toString(record.get("PERSON_NUM"), "0"));
                    }
                }
            }
        } catch (Exception e) {
            ServiceLog.error("获取小库列表失败", e);
        }

        // 路人库
        Map<String, Object> returnMap = new HashMap<String, Object>();
        returnMap.put("TYPE", Constants.FACE_TABLE);
        if (EAP.redis.exists("VPLUS_PV_FACE_COMPARE_TOTAL")) {
            returnMap.put("NUM", Integer.valueOf(EAP.redis.get("VPLUS_PV_FACE_COMPARE_TOTAL")));
        } else {
            returnMap.put("NUM", 0);
        }
        returnMap.put("NAME", renderTypeName(StringUtil.toString(Constants.FACE_TABLE)));
        returnList.add(returnMap);
        // 档案库
        returnMap = new HashMap<String, Object>();
        returnMap.put("TYPE", Constants.PERSON_ARCHIVE_PIC_INFO);
        returnMap.put("NUM", StringUtil.toString(archiveTotalNum));
        returnMap.put("NAME", renderTypeName(StringUtil.toString(Constants.PERSON_ARCHIVE_PIC_INFO)));
        returnList.add(returnMap);
        // 专题库
        returnMap = new HashMap<String, Object>();
        returnMap.put("TYPE", Constants.PERSON_SPECIAL_LIB_PIC_INFO);
        returnMap.put("NUM", StringUtil.toString(specialTotalNum));
        returnMap.put("NAME", renderTypeName(StringUtil.toString(Constants.PERSON_SPECIAL_LIB_PIC_INFO)));
        returnList.add(returnMap);
        // 移动终端库
        returnMap = new HashMap<String, Object>();
        returnMap.put("TYPE", Constants.MOBILE_TERMINAL_INFO);
        returnMap.put("NUM", StringUtil.toString(terminalTotalNum));
        returnMap.put("NAME", renderTypeName(StringUtil.toString(Constants.MOBILE_TERMINAL_INFO)));
        returnList.add(returnMap);

        context.getResponse().putData(id, returnList);
        context.getResponse().putData("message", "获取数据成功");
        /*if (StringUtil.isEmpty(endTime)) {
        	//结束时间为系统当前时间
        	endTime = DateUtil.getDateTime();
        }
        if(StringUtil.isEmpty(beginTime)){
        	//开始时间为系统开始运行的时间
        	String tempDate =  ConfigUtil.getIndexBeginTime();
        	beginTime = DateUtil.toString(new SimpleDateFormat(DateUtil.yyMM_style).parse(tempDate),DateUtil.standard_style);
        }
        String indexBeginTime = ConfigUtil.getIndexBeginTime();
        //若索引开始时间大于开始时间
        if(indexBeginTime.compareTo(DateUtil.convertByStyle(beginTime, DateUtil.standard_style, DateUtil.yyMM_style)) > 0){
        	Map<Object,Long> map = new HashMap<Object,Long>();
        	context.getResponse().putData(id, map);
        	context.getResponse().putData("message", "开始时间小于索引起始时间[" + DateUtil.convertByStyle(beginTime, DateUtil.yyMM_style, DateUtil.standard_style) + "]，请检查！");
           return ;
        }
        		
        String indexStr = Constants.MOBILE_TERMINAL_INDICE + "," + Constants.PERSON_ARCHIVE_PIC_INDICE + ","
        		+ Constants.PERSON_SPECIAL_LIB_PIC_INDICE;
        String[] indexStrArray = indexStr.split(",");
        // 每个月的数据放在不同的索引中,生成不同的索引
        String[] indexArrayFace = EsUtil.getIndexNameByTime(Constants.FACE_INDEX + "_", beginTime, endTime);
        
        long sjgsk, ejgsk;
        sjgsk = Long.valueOf(
        		DateUtil.convertByStyle(beginTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style, "-1"));
        ejgsk = Long.valueOf(
        		DateUtil.convertByStyle(endTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style, "-1"));
        
        Query query = new Query(1, pageSize);
        query.setAggregation("_type");
        query.addRangeCriteria("JGSK", sjgsk, ejgsk);
        try {
        	Map<Object, Long> statisticsFaceResult = EAP.bigdata.queryStatistics(indexArrayFace, query,Constants.FACE_TABLE);
        	Query queryOther = new Query(1, pageSize);
        	queryOther.setAggregation("_type");
        	queryOther.addRangeCriteria("CREATE_TIME", sjgsk, ejgsk);
        	Map<Object, Long> statisticsOtherResult = EAP.bigdata.queryStatistics(indexStrArray, queryOther,
        		    Constants.MOBILE_TERMINAL_INFO, Constants.PERSON_ARCHIVE_PIC_INFO, Constants.PERSON_SPECIAL_LIB_PIC_INFO);
        	statisticsFaceResult.putAll(statisticsOtherResult);
        	
        	for (Map.Entry<Object, Long> tempEntry : statisticsFaceResult.entrySet()) {
        		for (Map<String, Object> tempMap: returnList) {
        			if(StringUtil.toString(tempMap.get("TYPE")).equals(StringUtil.toString(tempEntry.getKey()))){
        				tempMap.put("NUM", tempEntry.getValue());
        			}	
        		}
        	}
        	context.getResponse().putData(id, returnList);
        	context.getResponse().putData("message", "获取数据成功");
        } catch (SearchEngineException e) {
        	e.printStackTrace();
        }*/
    }

    private String renderTypeName(String type) {
        switch (type) {
            case Constants.FACE_TABLE:
                return "路人库人脸";
            case Constants.PERSON_ARCHIVE_PIC_INFO:
                return "档案库人脸";
            case Constants.PERSON_SPECIAL_LIB_PIC_INFO:
                return "专题库人脸";
            case Constants.MOBILE_TERMINAL_INFO:
                return "移动终端库人脸";
            default:
                return "";
        }
    }

    @BeanService(id = "captureDataByMonth", description = "按月统计人脸抓拍数据")
    public void getCaptureDataByMonth(RequestContext context) throws Exception {

        Map<String, Object> params = context.getParameters();
        String id = (String)context.getParameter("elementId");
        String beginTime = StringUtil.toString(params.get("BEGIN_TIME")); // 开始时间
        String endTime = StringUtil.toString(params.get("END_TIME")); // 结束时间

        if (StringUtil.isEmpty(endTime)) {
            // 结束时间为系统当前时间
            endTime = DateUtil.getDateTime();
        }
        /*Date beforeMonthDate = DateUtil.weeHours(DateUtil.toDate(DateUtil.getMonthOffset(DateUtil.toDate(endTime), -2, "yyyy-MM-dd HH:mm:ss")), 0);
        beginTime = DateUtil.dateToString(beforeMonthDate);*/
        // 系统运行的时间
        String tempDate = AppHandle.getHandle(Constants.APP_NAME).getProperty("FACE_INDICE_BEGIN_MONTH", "");
        String runTime
            = DateUtil.toString(new SimpleDateFormat(DateUtil.yyMM_style).parse(tempDate), DateUtil.standard_style);

        if (StringUtil.isEmpty(beginTime)
            || DateUtil.diff(Calendar.SECOND, DateUtil.toDate(beginTime, DateUtil.standard_style),
                DateUtil.toDate(runTime, DateUtil.standard_style)) < 0) {
            beginTime = runTime;
        }

        List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
        long diff = DateUtil.diff(Calendar.MONTH, DateUtil.toDate(endTime, DateUtil.standard_style),
            DateUtil.toDate(beginTime, DateUtil.standard_style));

        for (int i = 0; i <= diff; i++) {
            Map<String, Object> returnMap = new HashMap<>();
            String date = DateUtil.getMonthOffset(DateUtil.toDate(beginTime, DateUtil.standard_style), i,
                DateUtil.standard_style);
            returnMap.put("DATE", DateUtil.convertByStyle(date, DateUtil.standard_style, DateUtil.yyMM_style));
            // 从redis读取人脸抓拍各个月份人脸总数 源格式：VPLUS_PV_FACE_201707
            String redisKey = "VPLUS_PV_FACE_" + DateUtil.convertByStyle(date, DateUtil.standard_style, "yyyyMM");
            if (EAP.redis.exists(redisKey)) {
                returnMap.put("NUM", Integer.valueOf(EAP.redis.get(redisKey)));
            } else {
                returnMap.put("NUM", 0);
            }
            returnList.add(returnMap);
        }

        context.getResponse().putData(id, returnList);
        context.getResponse().putData("message", "获取数据成功");

    }

    @BeanService(id = "cameraDevice", description = "摄像机设备资源")
    public void cameraDevice(RequestContext context) {

        Map<String, Object> params = context.getParameters();
        String id = (String)context.getParameter("elementId");
        String orgCode = StringUtil.toString(params.get("ORG_CODE")); // 地域代码

        int orgCodeInt;
        if (StringUtil.isEmpty(orgCode)) {
            orgCodeInt = Integer.valueOf(context.getUser().getDept().getCivilCode());
        } else {
            orgCodeInt = Integer.valueOf(orgCode);
        }

        context.getResponse().putData(id, deviceInfoDao.getCameraNum(orgCodeInt));
        context.getResponse().putData("message", "获取数据成功");

    }

    // end class

    // 2018年12月5日17:47:50
    // ywq

    @BeanService(id = "getStatisticData", description = "长隆项目获取人脸统计数据")
    public void getStatisticData(RequestContext context) throws Exception {

        AlarmHandleRecordDao dao = new AlarmHandleRecordDao();

        TransportClient client = (TransportClient)EAP.bigdata.getClient();

        Map<String, Object> params = context.getParameters();
        String id = (String)context.getParameter("elementId");
        String beginTime = StringUtil.toString(params.get("BEGIN_TIME")); // 开始时间
        String endTime = StringUtil.toString(params.get("END_TIME")); // 结束时间
        
        List<Map<String, Object>> db_info = dao.getAlarmStatisticInfo(beginTime,endTime);

        String[] index = ESUtil.getIndicesByTime(client, beginTime, endTime, Constants.FACE_INDEX);
        beginTime = DateUtil.convertByStyle(beginTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style);
        endTime = DateUtil.convertByStyle(endTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style);

        Query query = new Query(1, 1);
        query.addBetweenCriteria("JGSK", beginTime, endTime);

        PageQueryResult queryResult = EAP.bigdata.query(index, Constants.FACE_TABLE, query);
        // 监控总数
        long sum = queryResult.getTotalSize();
        
        query.addBetweenCriteria("FACE_SCORE", "0", null); // 判断特征提取非空
        
        queryResult = EAP.bigdata.query(index, Constants.FACE_TABLE, query);
        // 人脸识别成功数
        long successSum = queryResult.getTotalSize();

        Map<String, Object> resultMap = new HashMap<String, Object>();
        resultMap.put("MONITOR_COUNT", sum);
        resultMap.put("FACE_SUCCESS_COUNT", successSum);
        // vip数
        int vipCount = 0;
        // 工作人员数
        int workCount = 0;

        for (Map<String, Object> map : db_info) {
            String dbName = (String)map.get("db_name");
            int count = Integer.parseInt(String.valueOf(map.get("count")));
            if (dbName.toLowerCase().contains("vip")) {
                vipCount = count;
            } else if (dbName.contains("工作人员")) {
                workCount = count;
            }
        }
        // 陌生人数
        int stangerCount = Integer.parseInt(String.valueOf(sum)) - vipCount - workCount;
        resultMap.put("VIP_COUNT", vipCount);
        resultMap.put("WORK_COUNT", workCount);
        resultMap.put("STANGER_COUNT", stangerCount);

        context.getResponse().putData(id, resultMap);

    }
}
