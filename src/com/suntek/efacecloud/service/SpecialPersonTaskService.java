package com.suntek.efacecloud.service;

import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceCommonDao;
import com.suntek.efacecloud.dao.SpecialPersonTrackDao;
import com.suntek.efacecloud.util.ModuleUtil;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author: LiLing
 * @create: 2019-10-30 19:46:01
 */
@LocalComponent(id = "technicalTactics/task")
public class SpecialPersonTaskService {
    private static SpecialPersonTrackDao dao = new SpecialPersonTrackDao();
    private static FaceCommonDao commonDao = new FaceCommonDao();

    @BeanService(id = "update", description = "更新特定人群轨迹分析任务", since = "1.0.0", type = "remote")
    public void update(RequestContext context) throws Exception {
        try {
            // 前端加非空判断
            String isTop = StringUtil.toString(context.getParameter("IS_TOP")); //1-置顶
            String finishTime = StringUtil.toString(context.getParameter("FINISH_TIME"));
            String taskId = StringUtil.toString(context.getParameter("TASK_ID"));
            if (StringUtil.isEmpty(taskId)) {
                context.getResponse().putData("CODE", 1);
                context.getResponse().putData("MESSAGE", "请传入必须参数值!");
                return;
            }
            if (!StringUtil.isEmpty(isTop)) {
                dao.updateByIstop(taskId, isTop);
            }
            if (!StringUtil.isEmpty(isTop)) {
                dao.updateByFinishTime(taskId, finishTime);
            }

            context.getResponse().putData("CODE", 0);
            context.getResponse().putData("MESSAGE", "更新成功");

        } catch (Exception e) {
            ServiceLog.error("更新特定人群轨迹分析任务异常 : " + e.getMessage());
            context.getResponse().putData("CODE", 1);
            context.getResponse().putData("MESSAGE", "更新失败");
        }
    }

    @BeanService(id = "detail", description = "查询特定人群轨迹分析任务详情", since = "1.0.0", type = "remote")
    public void queryDetail(RequestContext context) throws Exception {
        try {
            String taskId = StringUtil.toString(context.getParameter("TASK_ID"));
            List<Map<String, Object>> list = dao.queryTaskDetail(taskId);
            for (Map<String, Object> map : list) {
                String taskType = com.suntek.eap.common.util.StringUtil.toString(map.get("TASK_TYPE"));
                if ("1".equals(taskType)) {
                    map.put("TASK_TYPE", "人脸聚档(人流量估计分析)");
                } else if ("2".equals(taskType)) {
                    map.put("TASK_TYPE", "特定人群轨迹分析");
                }
            }
            context.getResponse().putData("CODE", 0);
            context.getResponse().putData("MESSAGE", "查询成功");
            context.getResponse().putData("DATA", list);
        } catch (Exception e) {
            ServiceLog.error("查询特定人群轨迹分析任务详情异常 : " + e.getMessage());
            context.getResponse().putData("CODE", 1);
            context.getResponse().putData("MESSAGE", "查询失败");
        }
    }

    @BeanService(id = "delete", description = "删除特定人群轨迹分析任务", since = "1.0.0", type = "remote")
    public void delete(RequestContext context) throws Exception {
        try {
            // 暂时不做逻辑删除
            String taskIds = StringUtil.toString(context.getParameter("TASK_IDS"));
            dao.deleteTask(taskIds);
            context.getResponse().putData("CODE", 0);
            context.getResponse().putData("MESSAGE", "删除成功");
        } catch (Exception e) {
            ServiceLog.error("查询特定人群轨迹分析任务异常 : " + e.getMessage());
            context.getResponse().putData("CODE", 1);
            context.getResponse().putData("MESSAGE", "删除失败");
        }
    }

    /**
     * 查询任务关联有轨迹结果的档案
     *
     * @param context
     * @throws Exception
     */
    @BeanService(id = "queryTrackResult", description = "查询特定人群轨迹分析任务结果", since = "1.0.0", type = "remote")
    public void queryTrackResult(RequestContext context) throws Exception {
        try {
            String taskId = StringUtil.toString(context.getParameter("TASK_ID"));
            List<Map<String, Object>> list = dao.queryResult(taskId);
            for (Map<String, Object> map : list) {
                String personTags = StringUtil.toString(map.get("PERSON_TAG"));
                String[] tags = personTags.replaceAll("  ", " ").split(" ");
                Map<Object, Object> personTagMap = commonDao.getPersonTagInfo().stream().collect(Collectors.toMap(o -> o.get("CODE"), o -> o.get("NAME")));
                Set<String> tempSet = new LinkedHashSet<String>();
                List<Map<String, Object>> tagList = new ArrayList<>();
                for (int i = 0; i < tags.length; i++) {
                    Map<String, Object> tagMap = new HashMap<>();
                    String personTagName = StringUtil.toString(personTagMap.get(tags[i]));
                    if (!StringUtil.isNull(personTagName) && tags[i].length() > 2) {
                        tempSet.add(personTagName);
                        tagMap.put("TAG_CODE", tags[i]);
                        tagMap.put("TAG_NAME", personTagName);
                        tagList.add(tagMap);
                    }
                }
                map.put("PERSON_TAG_NAME", tempSet.toString().replaceAll(" ", ""));
                map.put("PERSON_TAG_LIST", tagList);
                String pic = StringUtil.toString(map.get("PIC"));
                if (!StringUtil.isEmpty(pic)) {
                    map.put("PIC", ModuleUtil.renderPic(ModuleUtil.renderImage(pic)));
                }
            }
            context.getResponse().putData("CODE", 0);
            context.getResponse().putData("MESSAGE", "查询成功");
            context.getResponse().putData("DATA", list);
        } catch (Exception e) {
            ServiceLog.error("查询特定人群轨迹分析任务详情异常 : " + e.getMessage());
            context.getResponse().putData("CODE", 1);
            context.getResponse().putData("MESSAGE", "查询失败");
        }
    }

    @BeanService(id = "queryPersonFlow", description = "查询人流量分析任务结果", since = "1.0.0", type = "remote")
    public void queryPersonFlow(RequestContext context) throws Exception {
        try {
            String taskId = StringUtil.toString(context.getParameter("TASK_ID"));
            List<Map<String, Object>> list = dao.queryPersonFlow(taskId);
            context.getResponse().putData("CODE", 0);
            context.getResponse().putData("MESSAGE", "查询成功");
            if (list.size() > 0) {
                context.getResponse().putData("COUNT", list.get(0).get("PERSON_FLOW"));
            } else {
                context.getResponse().putData("COUNT", 0);
            }

        } catch (Exception e) {
            ServiceLog.error("查询特定人群轨迹分析任务详情异常 : " + e.getMessage());
            context.getResponse().putData("CODE", 1);
            context.getResponse().putData("MESSAGE", "查询失败");
        }
    }

    @BeanService(id = "queryException", description = "查询特定人群轨迹分析任务异常原因", since = "1.0.0", type = "remote")
    public void queryException(RequestContext context) throws Exception {
        try {
            String taskId = StringUtil.toString(context.getParameter("TASK_ID"));
            Map<String, Object> map = dao.queryTaskException(taskId);
            context.getResponse().putData("CODE", 0);
            context.getResponse().putData("MESSAGE", "查询成功");
            context.getResponse().putData("DATA", StringUtil.toString(map.get("EXP_REASON")));
        } catch (Exception e) {
            ServiceLog.error("查询特定人群轨迹分析任务异常原因异常 : " + e.getMessage());
            context.getResponse().putData("CODE", 1);
            context.getResponse().putData("MESSAGE", "查询失败");
        }
    }
}
