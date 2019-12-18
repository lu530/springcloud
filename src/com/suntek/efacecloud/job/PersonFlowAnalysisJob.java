package com.suntek.efacecloud.job;

import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.common.util.IDGenerator;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.index.Query;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.util.StringUtil;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.SpecialPersonTrackDao;
import com.suntek.efacecloud.dao.mppdb.MppQueryDao;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ESUtil;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;
import org.apache.commons.lang.StringUtils;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author: LiLing
 * @create: 2019-11-04 16:55:54
 */
public class PersonFlowAnalysisJob implements Job {
    private static SpecialPersonTrackDao dao = new SpecialPersonTrackDao();
    private static SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private static int TASK_TYPE = 1;   //人流量分析
    private static int NUMS = 2;   //人流量分析

    @SuppressWarnings("unchecked")
    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        try {
            List<Map<String, Object>> undoLIST = dao.queryUndoTask(TASK_TYPE);
            String algoType = ConfigUtil.getAlgoType();
            Log.tasklog.debug("待启动任务总数 : " + undoLIST.size());
            for (Map<String, Object> map : undoLIST) {
                String taskId = "";
                try {
                    //更新任务状态为进行中
                    taskId = StringUtil.toString(map.get("TASK_ID"));
                    dao.updateTaskStatus(taskId, 1);
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
                    param.put("NUMS", NUMS);
                    param.put("ALGO_TYPE", algoType);
                    CommandContext commandContext = new CommandContext("admin", "localhost");
                    commandContext.setServiceUri(BaseCommandEnum.frequentAccess.getUri());
                    commandContext.setBody(param);

                    Log.tasklog.debug("调用sdk参数:" + param);

                    Registry registry = Registry.getInstance();

                    registry.selectCommands(commandContext.getServiceUri()).exec(commandContext);

                    Log.tasklog.debug("调用sdk返回结果code:" + commandContext.getResponse().getCode()
                            + " message:" + commandContext.getResponse().getMessage());

                    long code = commandContext.getResponse().getCode();

                    if (0L != code) {
                        Log.tasklog.error("调用频繁出入SDK失败: " + commandContext.getResponse().getMessage());
                        dao.updateStatusDesc(taskId, 3, "[TASK_ID=" + taskId + "]" +
                                commandContext.getResponse().getMessage(), sdf.format(new Date()));
                        continue;
                    }

                    List<List<Object>> personIds = (List<List<Object>>) commandContext.getResponse().getData("DATA");

                    List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();// 返回到前端的结果集
                    for (int i = 0; i < personIds.size(); i++) {
                        List<Object> ids = personIds.get(i); // 一个人员出现列表的主键id集合
                        resultList.add(handlePersonId(ids));
                    }
                    Log.tasklog.debug("sdk返回数据resultList: " + resultList.size() + "条");
                    // 处理返回的结果数
                    long totalNum = handleData(beginTime, endTime, deviceIds, faceScore, resultList);
                    Log.tasklog.debug("TASK_ID: " + taskId + ", 返回总人数: " + totalNum);
                    dao.insertTotalPerson(taskId, totalNum);
                    dao.updateTaskStatusAndFinish(taskId, 2, sdf.format(new Date()));
                } catch (Exception e) {
                    dao.updateStatusDesc(taskId, 3, "[TASK_ID=" + taskId + "]" +
                            e.getMessage(), sdf.format(new Date()));
                }

            }
        } catch (Exception e) {
            Log.tasklog.error("定时分析人流量任务异常 : " + e.getMessage(), e);
        }
    }

    private long handleData(String beginTime, String endTime, String deviceIds, String faceScore, List<Map<String, Object>> resultList) {
        long total = 0L;
        long repeatNum = 0L;
        long capNum = getCapNum(beginTime, endTime, deviceIds, faceScore);
        Log.tasklog.debug("capNum: " + capNum);
        for (Map<String, Object> map : resultList) {
            Log.tasklog.debug("REPEATS: " + StringUtil.toString(map.get("REPEATS")));
            repeatNum += Integer.parseInt(StringUtil.toString(map.get("REPEATS")));
        }
        total = capNum - repeatNum + resultList.size();
        return total;
    }

    private long getCapNum(String beginTime, String endTime, String deviceIds, String faceScore) {
        long captureNum = 0;
        String[] indices = ESUtil.getIndicesNameByBeginAndEndTime(Constants.FACE_INDEX, beginTime, endTime);
        Log.tasklog.debug("indices : " + Arrays.toString(indices));
        try {
            Query query = new Query(1, 1500000);
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
            query.addBetweenCriteria("JGSK", sjgsk, ejgsk);
            PageQueryResult pageResult = EAP.bigdata.query(indices, Constants.FACE_TABLE, query);
            //Log.tasklog.debug("result: " + pageResult.getResultSet().size());
            if (!pageResult.getResultSet().isEmpty()) {
                captureNum = StringUtil.toLong(pageResult.getTotalSize(), 0);
                Log.tasklog.debug("查询es的总人数captureNum: " + captureNum);
            }
            List<Map<String, Object>> list = pageResult.getResultSet();
            if (!StringUtil.isEmpty(faceScore)) {
                int face = Integer.parseInt(faceScore);
                list = list.stream().filter(o -> {
                    Integer faceS = Integer.parseInt(StringUtil.toString(o.get("FACE_SCORE"), "0"));
                    if (faceS > face) {
                        return true;
                    }
                    return false;
                }).collect(Collectors.toList());
                Log.tasklog.debug("过滤分数之后的人数 : " + list.size());
                return list.size();
            } else {
                return captureNum;
            }
        } catch (Exception e) {
            Log.tasklog.debug("反查es异常: " + e.getMessage());
        }
        return captureNum;
    }

    // 处理同一个的人员列表,一个数据
    private Map<String, Object> handlePersonId(List<Object> ids) {

        Map<String, Object> personData = new HashMap<String, Object>();

        String[] idsArr = ModuleUtil.listArrToStrArr(ids);
        String[] indexName = new IDGenerator().getIndexNameFromIds(Constants.FACE_INDEX + "_", idsArr);

        try {
            List<Map<String, Object>> resultSet = new ArrayList<Map<String, Object>>();

            //获取大数据检索方式，0：ES，1：MPPDB
            String serachFun = AppHandle.getHandle(Constants.CONSOLE).getProperty("BIGDATA_SEARCH_FUN", "0");
            if (Constants.BIGDATA_SEARCH_ES.equals(serachFun)) {

                PageQueryResult pageResult = EAP.bigdata.queryByIds(indexName, Constants.FACE_TABLE, idsArr);
                resultSet = pageResult.getResultSet();
            } else {

                MppQueryDao dao = new MppQueryDao();
                resultSet = dao.queryByIds(idsArr);
            }

            Log.tasklog.debug("1 频繁出入 反查 条件主键id->" + ids);
            Log.tasklog.debug("2 频繁出入 反查 查询结果-> " + resultSet + "\n");


            String infoId = "";
            String objPic = "";
            String jgsk = "";
            String faceScore = "";

            if (resultSet.size() > 0) {

                Collections.sort(resultSet, new Comparator<Map<String, Object>>() {

                    @Override
                    public int compare(Map<String, Object> o1, Map<String, Object> o2) {
                        String sk1 = StringUtil.toString(o1.get("JGSK"));
                        String sk2 = StringUtil.toString(o2.get("JGSK"));
                        return sk2.compareTo(sk1);
                    }
                });

                objPic = ModuleUtil.renderImage(StringUtil.toString(resultSet.get(0).get("OBJ_PIC")));
                jgsk = StringUtil.toString(resultSet.get(0).get("JGSK"), "");
                infoId = StringUtil.toString(resultSet.get(0).get("INFO_ID"));
                faceScore = StringUtil.toString(resultSet.get(0).get("FACE_SCORE"));
            }
            personData.put("INFO_ID", infoId);
            personData.put("REPEATS", ids.size());
            personData.put("PIC", objPic);
            personData.put("FACE_SCORE", faceScore);
            personData.put("IDS", StringUtils.join(ids, ","));
//			personData.put("JGSK", DateUtil.convertByStyle(jgsk, DateUtil.yyMMddHHmmss_style, DateUtil.standard_style));

            if (!StringUtil.isNull(jgsk)) {
                if (Constants.BIGDATA_SEARCH_ES.equals(serachFun)) {

                    personData.put("JGSK", DateUtil.convertByStyle(jgsk, DateUtil.yyMMddHHmmss_style, DateUtil.standard_style));
                } else {
                    personData.put("JGSK", DateUtil.dateToString(DateUtil.toDate(jgsk, "yyyy-MM-dd HH:mm:ss")));
                }
            } else {
                personData.put("JGSK", "");
            }


        } catch (Exception e) {
            Log.tasklog.error("频繁出入  反查有误:handlePersonId()" + e.getMessage(), e);
        }
        return personData;
    }
}
