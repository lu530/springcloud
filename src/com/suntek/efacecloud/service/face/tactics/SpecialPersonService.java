package com.suntek.efacecloud.service.face.tactics;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.util.StringUtil;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.SpecialPersonTrackDao;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.efacecloud.util.SpecialTarckLibType;
import com.suntek.sp.common.common.BaseCommandEnum;
import scala.annotation.meta.param;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class SpecialPersonService {


    private static SpecialPersonTrackDao dao = new SpecialPersonTrackDao();

    /**
     * 执行任务
     *
     * @param row
     */
    public void execute(Map<String, Object> row) {
        String algoType = ConfigUtil.getAlgoType();
        Map<String, Object> param = JSONObject.parseObject(StringUtil.toString(row.get("param")), Map.class);
        try {
            String taskId = StringUtil.toString(row.get("TASK_ID"));;
            String libId = StringUtil.toString(param.get("LIB_ID"));
            int libType = Integer.parseInt(StringUtil.toString(param.get("LIB_TYPE")));
            if (libType == SpecialTarckLibType.TOPIC_ARCHIVE.getType()) {// 搜索专题库
                List<Map<String, Object>> archiveList = dao.queryTopic(libId);
                if (null == archiveList || archiveList.size() == 0) {
                    Log.technicalLog.debug("查询专题库档案信息为空！libId = " + libId);
                    return;
                }
                List<Map<String, Object>> resList = new ArrayList<>();
                for (Map<String, Object> archive : archiveList) {
                    Log.technicalLog.debug("archive: " + JSON.toJSONString(archive));
                    CommandContext commandContext = new CommandContext("admin", "localhost");

                    param.put("ALGO_TYPE", algoType);
                    String picUrl = ModuleUtil.renderPic(ModuleUtil.renderImage(
                            StringUtil.toString(archive.get("PIC"))));
                    Log.technicalLog.debug("档案图片--picUrl: " + picUrl);
                    param.put("PIC", picUrl);

                    commandContext.setBody(param);
                    commandContext.setServiceUri(BaseCommandEnum.faceCollisionQuery.getUri());
                    Log.technicalLog.debug("调用SDK参数 : " + JSON.toJSONString(param));
                    Registry registry = Registry.getInstance();
                    registry.selectCommand(commandContext.getServiceUri(),
                            "4401",
                            ConfigUtil.getVendor()).exec(commandContext);
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
            Log.technicalLog.error("执行异常: " + e.getMessage(), e);
        }
    }

}
