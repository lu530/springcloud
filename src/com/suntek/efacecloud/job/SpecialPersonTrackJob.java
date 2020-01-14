package com.suntek.efacecloud.job;

import com.alibaba.fastjson.JSON;
import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.index.Query;
import com.suntek.eap.index.SearchEngineException;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.util.StringUtil;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.SpecialPersonTrackDao;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.efacecloud.util.SpecialTarckLibType;
import com.suntek.sp.common.common.BaseCommandEnum;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author: LiLing
 * @create: 2019-10-30 21:48:52
 */
public class SpecialPersonTrackJob implements Job {
    private static SpecialPersonTrackDao dao = new SpecialPersonTrackDao();
    private static SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private static int TASK_TYPE = 2;   //特定人群轨迹

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        try {
            List<Map<String, Object>> undoLIST = dao.queryUndoTask(TASK_TYPE);
            Log.technicalLog.debug("TASK_TYPE =" + TASK_TYPE + ", undoList 大小" + undoLIST.size());
            String algoType = ConfigUtil.getAlgoType();

            for (Map<String, Object> map : undoLIST) {
                String taskId = "";
                try {
                    taskId = StringUtil.toString(map.get("TASK_ID"));
                    String libId = StringUtil.toString(map.get("LIB_ID"));
                    dao.updateTaskStatus(taskId, 1);  // 更新状态为进行中
                    int libType = Integer.parseInt(StringUtil.toString(map.get("LIB_TYPE")));
                    if (libType == SpecialTarckLibType.TOPIC_ARCHIVE.getType()) {// 搜索专题库
                        List<Map<String, Object>> archiveList = queryTopic(libId);
                        boolean isSuccess = true;
                        List<Map<String, Object>> resList = new ArrayList<>();
                        for (Map<String, Object> archive : archiveList) {
                            Log.technicalLog.debug("archive: " + JSON.toJSONString(archive));
                            Map<String, Object> param = new HashMap<>();
                            CommandContext commandContext = new CommandContext("admin", "localhost");
                            param.put("ALGO_TYPE", algoType);
                            param.put("BEGIN_TIME", StringUtil.toString(map.get("BEGIN_TIME")));
                            param.put("END_TIME", StringUtil.toString(map.get("END_TIME")));
                            param.put("TOP_N", StringUtil.toString(map.get("TOP_N")));
                            param.put("THRESHOLD", StringUtil.toString(map.get("THRESHOLD")));
                            param.put("DEVICE_IDS", StringUtil.toString(map.get("DEVICE_IDS")));
                            String picUrl = ModuleUtil.renderPic(ModuleUtil.renderImage(
                                    StringUtil.toString(archive.get("PIC"))));
                            Log.technicalLog.debug("picUrl: " + picUrl);
                            param.put("PIC", picUrl);
                            commandContext.setBody(param);
                            commandContext.setServiceUri(BaseCommandEnum.faceCollisionQuery.getUri());
                            Log.technicalLog.debug("调用SDK参数 : " + JSON.toJSONString(param));
                            Registry registry = Registry.getInstance();
                            registry.selectCommands(commandContext.getServiceUri()).exec(commandContext);
                            long code = commandContext.getResponse().getCode();
                            if (0L != code) {
                                Log.technicalLog.debug("TASK_ID=" + taskId + ", PERSON_ID=" + archive.get("PERSON_ID") + ", 任务执行异常"
                                        + commandContext.getResponse().getMessage());
                                dao.updateStatusDesc(taskId, 3, "[PERSON_ID=" + archive.get("PERSON_ID") + "]"
                                        + commandContext.getResponse().getMessage(), sdf.format(new Date()));
                                isSuccess = false;
                                continue;
                            }
                            List<Map<String, Object>> resultList = (List<Map<String, Object>>) commandContext.getResponse().getData("DATA");
                            Log.technicalLog.debug("[PERSON_ID] " + archive.get("PERSON_ID") + "调用SDK返回结果: " + JSON.toJSONString(resultList));
                            if (resultList.size() > 0) {
                                // 数据返回, 记录此档案
                                archive.put("COUNT", resultList.size());
                                resList.add(archive);
                                isSuccess = true;
                            }
                        }
                        if (isSuccess) {
                            Log.technicalLog.debug("TASK_ID: " + taskId + ", isSuccess: " + isSuccess);
                            // 已完成
                            dao.updateTaskStatusAndFinish(taskId, 2, sdf.format(new Date()));
                            // dao.updateByFinishTime(taskId, sdf.format(new Date()));
                        }

                        if (resList.size() > 0) {
                            Log.technicalLog.debug("TASK_ID: " + taskId + ", 分析结果档案数 " + resList.size());
                            dao.insertRelArchive(taskId, resList);
                        }

                    }
                } catch (Exception e) {
                    Log.technicalLog.debug("TASK_ID=" + taskId + ", 执行异常: " + e.getMessage() + e);
                    dao.updateStatusDesc(taskId, 3, "[TASK_ID=" + taskId + "]" + e.getMessage(), sdf.format(new Date()));
                }
            }
        } catch (Exception e) {
            Log.technicalLog.error("定时分析特定人群轨迹任务异常 : " + e.getMessage(), e);
        }
    }

    /**
     * 查询专题库档案信息
     *
     * @param libId
     * @return
     */
    private List<Map<String, Object>> queryTopic(String libId) {
        Query query = new Query(1, 1000000);
        query.addEqualCriteria("LIB_ID", libId);
        try {
            PageQueryResult pageQueryResult = EAP.es.query(Constants.PERSON_TOPIC_INDICE, Constants.PERSON_TOPIC_INFO, query);
            return pageQueryResult.getResultSet();
        } catch (SearchEngineException e) {
            Log.technicalLog.error("查询专题库: " + libId + "异常 : " + e.getMessage(), e);
            return null;
        }
    }
}
