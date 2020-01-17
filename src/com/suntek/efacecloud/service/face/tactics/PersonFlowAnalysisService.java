package com.suntek.efacecloud.service.face.tactics;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.index.Query;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.util.StringUtil;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.SpecialPersonTrackDao;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.service.face.FaceNVNTaskDao;
import com.suntek.efacecloud.service.face.tactics.common.FrequentAccessCommonService;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ESUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PersonFlowAnalysisService extends FrequentAccessCommonService {

    private SpecialPersonTrackDao dao = new SpecialPersonTrackDao();

    private FaceNVNTaskDao nvnTaskDao = new FaceNVNTaskDao();

    private SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    private static final int MIN_FREQUENT_ACCESS = 2;

    public CommandContext execute(Map<String, Object> row) {
        CommandContext commandContext = null;
        try {
            Map<String, Object> map = JSONObject.parseObject(StringUtil.toString(row.get("param")), Map.class);
            //更新任务状态为进行中
            String beginTime = StringUtil.toString(map.get("BEGIN_TIME"));
            String endTime = StringUtil.toString(map.get("END_TIME"));
            String deviceIds = StringUtil.toString(map.get("DEVICE_IDS"));
            String faceScore = StringUtil.toString(map.get("FACE_SCORE"));
            Map<String, Object> param = new HashMap<>();
            param.put("BEGIN_TIME", beginTime);
            param.put("END_TIME", endTime);
            param.put("DEVICE_IDS", deviceIds);
            param.put("THRESHOLD", StringUtil.toString(map.get("THRESHOLD")));
            param.put("FACE_SCORE", faceScore);
            param.put("NUMS", MIN_FREQUENT_ACCESS);
            param.put("ALGO_TYPE", ConfigUtil.getAlgoType());
            param.put("IS_ASYNC", "true");
            commandContext = new CommandContext("admin", "localhost");
            commandContext.setServiceUri(BaseCommandEnum.frequentAccess.getUri());
            commandContext.setBody(param);

            Log.tasklog.debug("调用sdk参数:" + param);

            Registry registry = Registry.getInstance();

            registry.selectCommand(commandContext.getServiceUri(),
                    "4401",
                    ConfigUtil.getVendor()).exec(commandContext);

            Log.tasklog.debug("调用sdk返回结果code:" + commandContext.getResponse().getCode()
                    + " message:" + commandContext.getResponse().getMessage());
        } catch (Exception e) {
            Log.nvnTaskLog.error("启动人流量分析失败", e);

        }
        return commandContext;
    }

    /**
     * 处理结果
     * @param taskId
     * @param resultList
     */
    public void handleResult(String taskId,  List<Map<String, Object>> resultList) {
        Log.tasklog.debug("sdk返回数据resultList: " + resultList.size() + "条");
        // 处理返回的结果数
        Map<String, Object> row = nvnTaskDao.getTaskParamByTaskId(taskId);
        Map<String, Object> param = JSONObject.parseObject(StringUtil.toString(row.get("PARAM")), Map.class);
        String beginTime = StringUtil.toString(param.get("BEGIN_TIME"));
        String endTime = StringUtil.toString(param.get("END_TIME"));
        String deviceIds = StringUtil.toString(param.get("DEVICE_IDS"));
        String faceScore = StringUtil.toString(param.get("FACE_SCORE"));
        long totalNum = handleData(beginTime, endTime, deviceIds, faceScore, resultList);
        Log.tasklog.debug("TASK_ID: " + taskId + ", 返回总人数: " + totalNum);
        dao.insertTotalPerson(taskId, totalNum);
        dao.updateTaskStatusAndFinish(taskId, 2, sdf.format(new Date()));
    }

    /**
     * 处理数据，最后的人流量数=抓拍量-总频繁出入数+频繁出入的人员数
     * @param beginTime
     * @param endTime
     * @param deviceIds
     * @param faceScore
     * @param resultList
     * @return
     */
    private long handleData(String beginTime, String endTime, String deviceIds, String faceScore, List<Map<String, Object>> resultList) {
        long repeatNum = 0L;
        long capNum = getCapNum(beginTime, endTime, deviceIds, faceScore);
        Log.tasklog.debug("capNum: " + capNum);
        for (Map<String, Object> map : resultList) {
            repeatNum += Integer.parseInt(StringUtil.toString(map.get("REPEATS")));
        }
        return capNum - repeatNum + resultList.size();
    }

    /**
     * 查询抓拍量
     * @param beginTime
     * @param endTime
     * @param deviceIds
     * @param faceScore
     * @return
     */
    private long getCapNum(String beginTime, String endTime, String deviceIds, String faceScore) {
        long captureNum = 0;
        String[] indices = ESUtil.getIndicesNameByBeginAndEndTime(Constants.FACE_INDEX, beginTime, endTime);
        Log.tasklog.debug("indices : " + Arrays.toString(indices));
        try {
            Query query = new Query(1, 1);
            String[] deviceIdArr = deviceIds.split(",");
            List<String> deviceIdList = new ArrayList<String>();
            for (String deviceId : deviceIdArr) {
                deviceIdList.add(deviceId);
            }
            query.addEqualCriteria("DEVICE_ID", deviceIdList.toArray());
            Long sjgsk = Long.valueOf(
                    DateUtil.convertByStyle(beginTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style, "-1"));
            Long ejgsk = Long.valueOf(
                    DateUtil.convertByStyle(endTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style, "-1"));
            Long faceScoreL = Long.valueOf(faceScore);
            query.addBetweenCriteria("JGSK", sjgsk, ejgsk);
            query.addGteCriteria("FACE_SCORE", faceScoreL);
            PageQueryResult pageResult = EAP.bigdata.query(indices, Constants.FACE_TABLE, query);
            if (!pageResult.getResultSet().isEmpty()) {
                captureNum = StringUtil.toLong(pageResult.getTotalSize(), 0);
                Log.tasklog.debug("查询es的总人数captureNum: " + captureNum);
            }
        } catch (Exception e) {
            Log.tasklog.debug("反查es异常: " + e.getMessage());
        }
        return captureNum;
    }

}
