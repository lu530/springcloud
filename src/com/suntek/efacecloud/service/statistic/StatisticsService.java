package com.suntek.efacecloud.service.statistic;

import cn.hutool.core.date.DatePattern;
import cn.hutool.core.date.DateUtil;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceCaptureStatisticDao;
import com.suntek.efacecloud.dao.FaceCommonDao;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.model.ExcelColumn;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.DevicesRedisUtil;
import com.suntek.efacecloud.util.ExcelUtil;
import net.sf.json.JSONArray;
import org.apache.zookeeper.KeeperException;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 统计服务
 *
 * @author guoyl
 * @version 2019年11月12日
 * @since
 */
@LocalComponent(id = "face/capture", isLog = "true") public class StatisticsService {

    private FaceCommonDao faceCommonDao = new FaceCommonDao();
    private FaceCaptureStatisticDao faceCaptureDao = new FaceCaptureStatisticDao();

    //  统计类型 1:按摄像机
    private static String STATISTICS_TYPE_CAMERA = "1";
    //  统计类型 1:按派出所划
    private static String STATISTICS_TYPE_POLICE = "2";
    //  统计类型 1:按行政区划
    private static String STATISTICS_TYPE_ORG = "3";

    /**
     * @Title: 运维统计
     **/
    @BeanService(id = "statistics", description = "统计", type = "remote")

    public void statistics(RequestContext context) throws Exception {

        //  Integer cameraType = Integer.parseInt(StringUtil.toString(context.getParameter("CAMERA_TYPE"), "194"));
        //  String statisticsType = StringUtil.toString(context.getParameter("STATISTICS_TYPE"));
        List<String> deviceIdList = getDeviceIdList(context);
        String connectType = StringUtil.toString(context.getParameter("CONNECT_TYPE"));
        String elementId = StringUtil.toString(context.getParameter("elementId"));
        Date date = new Date();
        List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>() {{
            deviceIdList.stream().forEach(deviceId -> {
                add(new HashMap<String, Object>() {{
                    try {
                        DeviceEntity faceDevice = (DeviceEntity)EAP.metadata.getDictModel(DictType.D_FACE, deviceId, DeviceEntity.class);
                        put("DEVICE_NAME", StringUtil.toString(faceDevice.getDeviceName()));
                        put("DEVICE_ADDR", StringUtil.toString(faceDevice.getDeviceAddr()));
                        put("ORG_NAME", StringUtil.toString(faceDevice.getOrgName()));
                        put("LATITUDE", StringUtil.toString(faceDevice.getDeviceY()));
                        put("LONGITUDE", StringUtil.toString(faceDevice.getDeviceX()));
                        put("DEVICE_ID", deviceId);
                    } catch (Exception e) {
                        ServiceLog.debug(String.format("设备[%s]缓存不存在", deviceId));
                    }
                }});
            });
        }};

        // -- 获取设备状态数据
        renderDeviceConnectData(resultList);
        if (!StringUtil.isNull(connectType)) {
            resultList = resultList.stream().filter(o -> o.get("CONNECT_TYPE").equals(connectType)).collect(Collectors.toList());
        }

        //今昨前天，公三天的设备统计数据
        HashMap<String, Integer> todayCountData =
            getCountData(deviceIdList, DateUtil.offsetDay(date, 0).toString(DatePattern.PURE_DATE_PATTERN));
        HashMap<String, Integer> lastDayCountData =
            getCountData(deviceIdList, DateUtil.offsetDay(date, -1).toString(DatePattern.PURE_DATE_PATTERN));
        HashMap<String, Integer> dayBeforeCountData =
            getCountData(deviceIdList, DateUtil.offsetDay(date, -2).toString(DatePattern.PURE_DATE_PATTERN));


//                //获取设备的今天最后抓拍时间
//                List<Map<String, Object>> deviceIdStatisList
//                        = faceCaptureDao.getLastTimeByDeivceId(DateUtil.offsetDay(date, 0).toString(DatePattern.NORM_DATETIME_PATTERN),
//                        DateUtil.offsetDay(date, -1).toString(DatePattern.NORM_DATETIME_PATTERN), deviceIdList);
        resultList.stream().forEach(o -> {
            String deviceId = StringUtil.toString(o.get("DEVICE_ID"));
            long num = Long.valueOf(StringUtil.toString(todayCountData.get(deviceId), "0"));
            o.put("NUM", num);
            // 昨天抓拍量
            long averageNum = Long.valueOf(StringUtil.toString(lastDayCountData.get(deviceId), "0"));
            o.put("LAST_NUM", averageNum);
            // 前天抓拍量
            long beforYesNum = Long.valueOf(StringUtil.toString(dayBeforeCountData.get(deviceId), "0"));
            o.put("BEFOREYES_NUM", beforYesNum);
        });

        //  -- 按照今日抓拍数倒排
        Collections.sort(resultList, new Comparator<Map<String, Object>>() {
            @Override public int compare(Map<String, Object> o1, Map<String, Object> o2) {
                return Integer.valueOf(StringUtil.toString(o2.get("NUM"), "0")) - Integer.valueOf(StringUtil.toString(o1.get("NUM"), "0"));
            }
        });

        List<Map<String, Object>> finalResultList = resultList;
        context.getResponse().putData(elementId, new HashMap<String, Object>() {{
            put("records", finalResultList);
            put("count", finalResultList.size());
        }});
        return;
    }

    @BeanService(id = "statisticsExport", description = "人脸抓拍统计导出", since = "2.0") public void statisticsExport(RequestContext context)
        throws Exception {
        String excelType = StringUtil.toString(context.getParameter("EXCCEL_TYPE"));
        String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
        String endTime = StringUtil.toString(context.getParameter("END_TIME"));
        statistics(context);

        Map<String, Object> result = (Map<String, Object>)context.getResponse().getResult();
        JSONArray excelDataJsonArray = JSONArray.fromObject(result.get("STATISTICS_RESULT"));
        List<Map<String, Object>> excelDataList = new ArrayList<>();

        String fileName = null;
        List<ExcelColumn> columns = null;
        if ("1".equals(excelType)) {
            ExcelColumn column1 = new ExcelColumn("DEVICE_NAME", "设备名称", false);
            ExcelColumn column2 = new ExcelColumn("DEVICE_ID", "设备ID", false);
            ExcelColumn column3 = new ExcelColumn("DEVICE_ADDR", "设备地址", false);
            ExcelColumn column4 = new ExcelColumn("NUM", "抓拍量", false);
            ExcelColumn column5 = new ExcelColumn("IP_ADDR", "IP地址", false);
            ExcelColumn column6 = new ExcelColumn("PORT", "端口", false);
            ExcelColumn column7 = new ExcelColumn("USER_NAME", "用户名", false);
            ExcelColumn column8 = new ExcelColumn("PASSWORD", "密码", false);

            columns = Arrays.asList(column1, column2, column3, column4, column5, column6, column7, column8);
            fileName = "人脸抓拍设备统计表";
        }
        try {
            for (Object obj : excelDataJsonArray) {
                Map<String, Object> data = (Map<String, Object>)obj;
                excelDataList.add(data);
            }
        } catch (Exception exception) {
            ServiceLog.error("exportCapRecord异常" + exception.getMessage(), exception);
            throw exception;
        }
        fileName = fileName + "-" + beginTime.substring(2, 10).replaceAll("-", "") + "-" + endTime.substring(2, 10).replaceAll("-", "");
        boolean returnCodeEnum = ExcelUtil.export(fileName, columns, excelDataList, context.getHttpResponse());

        if (!returnCodeEnum) {
            context.getResponse().setError("导出失败！");
        }
        context.getResponse().setMessage("导出成功！");
    }

    /**
     * 根据设备信息获取设备前端直连信息  从zk上获取
     *
     * @return
     * @params deviceIdList 设备清单
     * @dayTime dayTime 日期,格式yyyyMMdd
     */
    private void renderDeviceConnectData(Collection list) {
        Map<String, Object> map = new HashMap<String, Object>();
        for (String engineId : faceCommonDao.getEngineIds()) {
            try {
                List<String> children = EAP.zkClient.getChildren(Constants.BASE_FACE_CAPTURE_ZKPATH + "/" + engineId);
                for (String child : children) {
                    String info = EAP.zkClient.get(Constants.BASE_FACE_CAPTURE_ZKPATH + "/" + engineId + "/" + child);
                    map.put(child, JSONObject.parseObject(info).get("status"));
                }
            } catch (KeeperException | InterruptedException | IOException e) {
                ServiceLog.error("获取直连设备信息失败", e);
            }
        }
        list.stream().forEach(o -> {
            String deviceId = StringUtil.toString(((Map<String, Object>)o).get("DEVICE_ID"));
            if (null != map.get(deviceId)) {
                ((Map<String, Object>)o).put("STATUS_INFO", map.get(deviceId));
                ((Map<String, Object>)o).put("IS_TASK_DEV", "是");
                ((Map<String, Object>)o).put("CONNECT_TYPE", "1");
                ((Map<String, Object>)o).put("CONNECT_TYPE_NAME", "直连");
            } else {
                ((Map<String, Object>)o).put("STATUS_INFO", "");
                ((Map<String, Object>)o).put("IS_TASK_DEV", "否");
                ((Map<String, Object>)o).put("CONNECT_TYPE", "2");
                ((Map<String, Object>)o).put("CONNECT_TYPE_NAME", "对接");
            }
        });
    }

    /**
     * 根据设备信息获取统计数据
     *
     * @return
     * @params deviceIdList 设备清单
     * @dayTime dayTime 日期,格式yyyyMMdd
     */
    private HashMap<String, Integer> getCountData(List<String> deviceIdList, String dayTime) {
        return new HashMap<String, Integer>() {
            {
                deviceIdList.parallelStream().forEach(deviceId -> {
                    String redisKey = "VPLUS_PV_" + dayTime;
                    String key = EAP.redis.hget(redisKey, "VPLUS_PV_D_" + deviceId + "FACE");
                    if (EAP.redis.hexists(redisKey, key)) {
                        put(deviceId, Integer.valueOf(EAP.redis.hget(redisKey, key)));
                    } else {
                        put(deviceId, 0);
                    }
                });
            }
        };
    }

    //获取需要统计的设备数据
    private List<String> getDeviceIdList(RequestContext context) {
        String deviceIds = StringUtil.toString(context.getParameter("DEVICE_IDS"));
        if (StringUtil.isNull(deviceIds)) {
            deviceIds = String.join(",", DevicesRedisUtil.getDeviceList(context.getUserCode(), Constants.DEVICE_TYPE_FACE));
        }
        List<String> deviceIdList = Arrays.asList(deviceIds.split(","));
        String pageNo = StringUtil.toString(context.getParameter("pageNo"));
        String pageSize = StringUtil.toString(context.getParameter("pageSize"));
        if (!StringUtil.isEmpty(pageNo) && !StringUtil.isEmpty(pageSize)) {
            int curPage = Integer.parseInt(pageNo);
            int size = Integer.parseInt(pageSize);
            int total = deviceIdList.size();
            deviceIdList = deviceIdList.subList((curPage - 1) * size, (curPage * size) > total ? total : curPage * size);
        }
        ServiceLog.info("获取设备清单 size = " + deviceIdList.size());
        return deviceIdList;
    }

}
