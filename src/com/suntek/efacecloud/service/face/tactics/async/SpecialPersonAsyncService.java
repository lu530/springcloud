package com.suntek.efacecloud.service.face.tactics.async;

import com.alibaba.fastjson.JSON;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.FaceCaptureStatisticDao;
import com.suntek.efacecloud.dao.SpecialPersonTrackDao;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.SpecialTarckLibType;
import com.suntek.sp.common.common.BaseCommandEnum;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * 重点人员异步任务
 */
public class SpecialPersonAsyncService {

    private FaceCaptureStatisticDao faceCaptureDao = new FaceCaptureStatisticDao();

    private AsyncService asyncService = new AsyncService();

    private static SpecialPersonTrackDao dao = new SpecialPersonTrackDao();

    /**
     * 添加任务
     *
     * @param context
     * @throws Exception
     */
    public void add(RequestContext context) throws Exception {
        String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
        String endTime = StringUtil.toString(context.getParameter("END_TIME"));
        String cross = StringUtil.toString(context.getParameter("DEVICE_IDS"));// 卡口编号
        int count = faceCaptureDao.findCaptureNum(Arrays.asList(cross.split(",")), beginTime, endTime);
        this.asyncService.addAsyncTask(context, count, context.getParameters(), Constants.SPECIAL_PERSON);
    }

    /**
     * 执行任务
     *
     * @param param
     */
    public void execute(Map<String, Object> param) {
        String algoType = ConfigUtil.getAlgoType();
        String taskId = "";
        try {
            taskId = StringUtil.toString(param.get("TASK_ID"));
            String libId = StringUtil.toString(param.get("LIB_ID"));
            int libType = Integer.parseInt(StringUtil.toString(param.get("LIB_TYPE")));
            if (libType == SpecialTarckLibType.TOPIC_ARCHIVE.getType()) {// 搜索专题库
                List<Map<String, Object>> archiveList = dao.queryTopic(libId);
                List<Map<String, Object>> resList = new ArrayList<>();
                for (Map<String, Object> archive : archiveList) {
                    Log.technicalLog.debug("archive: " + JSON.toJSONString(archive));
                    CommandContext commandContext = new CommandContext("admin", "localhost");
                    param.put("ALGO_TYPE", algoType);
                    commandContext.setBody(param);
                    commandContext.setServiceUri(BaseCommandEnum.faceCollisionQuery.getUri());
                    Log.technicalLog.debug("调用SDK参数 : " + JSON.toJSONString(param));
                    Registry registry = Registry.getInstance();
                    registry.selectCommands(commandContext.getServiceUri()).exec(commandContext);
                    long code = commandContext.getResponse().getCode();
                    if (0L != code) {
                        Log.technicalLog.debug("TASK_ID=" + taskId + ", PERSON_ID=" + archive.get("PERSON_ID") + ", 任务执行异常"
                                + commandContext.getResponse().getMessage());
                        continue;
                    }
                    List<Map<String, Object>> resultList = (List<Map<String, Object>>) commandContext.getResponse().getData("DATA");
                    Log.technicalLog.debug("[PERSON_ID] " + archive.get("PERSON_ID") + "调用SDK返回结果: " + JSON.toJSONString(resultList));
                    if (resultList.size() > 0) {
                        // 数据返回, 记录此档案
                        archive.put("COUNT", resultList.size());
                        resList.add(archive);
                    }
                }
                if (resList.size() > 0) {
                    Log.technicalLog.debug("TASK_ID: " + taskId + ", 分析结果档案数 " + resList.size());
                    dao.insertRelArchive(taskId, resList);
                }
            }
        } catch (Exception e) {
            Log.technicalLog.debug("TASK_ID=" + taskId + ", 执行异常: " + e.getMessage() + e);
        }
    }

}
