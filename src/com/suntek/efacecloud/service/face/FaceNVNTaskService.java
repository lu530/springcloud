package com.suntek.efacecloud.service.face;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.job.FaceNvNTaskExecuteJob;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.service.face.tactics.PersonFlowAnalysisService;
import com.suntek.efacecloud.service.face.tactics.SpecialPersonService;
import com.suntek.efacecloud.service.face.tactics.common.FollowPersonCommonService;
import com.suntek.efacecloud.service.face.tactics.common.RegionCollisionCommonService;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.sp.common.common.BaseCommandEnum;
import com.suntek.sp.huawei.HWStatusCode;
import com.suntek.sp.huawei.command.facematch.FacenvnCommand;
import com.suntek.sp.huawei.dto.FaceGroup;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * nvn任务调度
 *
 * @author wjy
 * @version 2019年06月19日
 */
@LocalComponent(id = "face/nvnTask", isLog = "true")
public class FaceNVNTaskService {

    private FaceNVNTaskDao dao = new FaceNVNTaskDao();

    private RegionCollisionCommonService regionCollisionCommonService = new RegionCollisionCommonService();

    private FollowPersonCommonService followPersonService = new FollowPersonCommonService();

    private SpecialPersonService specialPersonService = new SpecialPersonService();

    private PersonFlowAnalysisService personFlowAnalysisService = new PersonFlowAnalysisService();

    @BeanService(id = "executeTask", type = "remote", description = "执行nvn任务")
    public void executeTask(RequestContext context) {
        try {
            Map<String, Object> taskMap = dao.getNeedExcuteTask();
            Log.nvnTaskLog.debug("查询到的数据：" + JSONObject.toJSONString(taskMap));
            if (StringUtil.isObjectNull(taskMap)) {
                Log.nvnTaskLog.debug("没有查询到需要执行的数据");
            } else {
                String taskType = StringUtil.toString(taskMap.get("TASK_TYPE"));
                String id = StringUtil.toString(taskMap.get("ID"));
                String taskId = StringUtil.toString(taskMap.get("TASK_ID"));
                String paramJson = StringUtil.toString(taskMap.get("PARAM"));
                Log.nvnTaskLog.debug("------------------>此次操作nvn的类型是：" + taskType);

                dao.updateTaskStatus(id, Constants.NVN_TASK_DEALING);

                Log.nvnTaskLog.debug("------------------>调用开放平台，更新状态处理中");
                try {

                    CommandContext commandContext = new CommandContext(context.getHttpRequest());
                    Registry registry = Registry.getInstance();
                    commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());
                    Map<String, Object> param = JSONObject.parseObject(paramJson, Map.class);
                    // 所有后台任务，需要使用异步接口
                    param.put("IS_ASYNC", "true");
                    commandContext.setBody(param);

                    switch (taskType) {
                        // 频繁出现
                        case Constants.FREQUENT_ACCESS:
                            try {
                                registry.selectCommand(BaseCommandEnum.frequentAccess.getUri(),
                                        "4401",
                                        ConfigUtil.getVendor()).exec(commandContext);
                            } catch (Exception e) {
                                Log.nvnTaskLog.error("调用开放平台频繁出现出错，原因：" + e.getMessage(), e);
                            }

                            break;
                        // 人脸区域碰撞
                        case Constants.REGION_COLLISION:
                        case Constants.NIGHT_ACTIVE:
                            try {
                                registry.selectCommand(BaseCommandEnum.regionCollsion.getUri(),
                                        "4401",
                                        ConfigUtil.getVendor()).exec(commandContext);
                            } catch (Exception e) {
                                Log.nvnTaskLog.error("调用开放平台人脸区域碰撞出错，原因：" + e.getMessage(), e);
                            }
                            break;
                        // 同伙分析
                        case Constants.FOLLOW_PERSON:
                            try {
                                registry.selectCommand(BaseCommandEnum.followPerson.getUri(),
                                        "4401",
                                        ConfigUtil.getVendor()).exec(commandContext);
                            } catch (Exception e) {
                                Log.nvnTaskLog.error("调用开放平台同伙分析出错，原因：" + e.getMessage(), e);
                            }
                            break;
                        // 昼伏夜出
                        case Constants.DAY_HIDE_NIGHT_ACTIVE:
                            try {
                                registry.selectCommand(BaseCommandEnum.faceNvn.getUri(),
                                        "4401",
                                        ConfigUtil.getVendor()).exec(commandContext);
                            } catch (Exception e) {
                                Log.nvnTaskLog.error("调用开放平台昼伏夜出出错，原因：" + e.getMessage(), e);
                            }
                            break;
                        // 路人检索频次分析
                        case Constants.FACE_CAPTURE_FREQ_ANALYSIS:
                            try {
                                registry.selectCommand(BaseCommandEnum.faceCaptureFreqAnalysis.getUri(),
                                        "4401",
                                        ConfigUtil.getVendor()).exec(commandContext);
                            } catch (Exception e) {
                                Log.nvnTaskLog.error("调用开放平台路人检索频次分析出错，原因：" + e.getMessage(), e);
                            }
                            break;
                        //特殊人群分析
                        case Constants.SPECIAL_PERSON:
                            this.specialPersonService.execute(taskMap);
                            dao.updateTaskStatus(id, Constants.NVN_TASK_DEALT);
                            return;
                        case Constants.PERSON_FLOW_ANALYSIS:
                            commandContext = this.personFlowAnalysisService.execute(taskMap);
                            break;
                        default:
                            break;
                    }

                    // 异步接口获取到taskId
                    long code = commandContext.getResponse().getCode();
                    if (0L == code) {
                        Log.nvnTaskLog.debug("------------------>调用开放平台，获取taskId" + commandContext.getResponse().getResult());
                        Log.nvnTaskLog.debug("任务返回信息：" + commandContext.getResponse().getMessage());
                        List<Map<String, Object>> resultList = (List<Map<String, Object>>) commandContext.getResponse().getData("DATA");
                        Map<String, Object> map = resultList.get(0);
                        String asyncTaskId = StringUtil.toString(map.get("TASK_ID"));
                        List<FaceGroup> requestFaceGroups = (List<FaceGroup>) map.get("REQUEST_FACE_GROUPS");
                        //华为返回任务id替换原来的任务id
                        dao.updateTaskIdAndRequestFaceGroups(id, asyncTaskId, JSONObject.toJSONString(requestFaceGroups));
                        dao.updateTaskStatus(id, Constants.NVN_TASK_WAIT_GET_RESULT);
                        return;
                    } else {
                        Log.nvnTaskLog.debug("------------------>调用开放平台出错，原因：" + commandContext.getResponse().getResult());
                        Object[] result = getErrMessage(taskId, commandContext.getResponse().getMessage());
                        dao.insertTaskResult(result);
                        dao.updateTaskStatus(id, Constants.NVN_TASK_DEALT_ERROR);
                    }

                } catch (Exception e) {
                    Log.nvnTaskLog.error("执行nvn任务失败，原因：" + e.getMessage(), e);
                    Object[] result = getErrMessage(taskId, e.getMessage());
                    dao.insertTaskResult(result);
                    dao.updateTaskStatus(id, Constants.NVN_TASK_DEALT_ERROR);
                }
            }
        } finally {
            FaceNvNTaskExecuteJob.isFinish = true;
        }
    }

    /**
     * 通过nvn任务结果查询接口获取结果
     *
     * @param context
     */
    @BeanService(id = "obtainResultByInterface", type = "remote", description = "获取nvn任务的结果")
    public void obtainResultByInterface(RequestContext context) {
        try {
            Map<String, Object> doingTask = dao.getWaitGetResultTask();
            if (doingTask.size() == 0) {
                Log.nvnTaskLog.debug("当前无进行中的任务");
                return;
            }
            Log.nvnTaskLog.debug("doingTask:" + JSONObject.toJSONString(doingTask));
            String id = StringUtil.toString(doingTask.get("ID"));
            String taskId = StringUtil.toString(doingTask.get("TASK_ID"));
            String taskType = StringUtil.toString(doingTask.get("TASK_TYPE"));
            String updateTime = StringUtil.toString(doingTask.get("UPDATE_TIME"));
            String paramJson = StringUtil.toString(doingTask.get("PARAM"));

            Map<String, Object> param = JSONObject.parseObject(paramJson, Map.class);
            List<FaceGroup> requestFaceGroups = JSONArray.parseArray(doingTask.get("REQUEST_FACE_GROUPS").toString(), FaceGroup.class);

            DateTimeFormatter df = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime start = LocalDateTime.parse(updateTime, df);
            Duration between = Duration.between(LocalDateTime.now(), start);

            // 任务最大执行时间半个小时
            if (between.toMinutes() >= 30L) {
                Object[] result = getErrMessage(taskId, "任务超时");
                dao.insertTaskResult(result);
                dao.updateTaskStatus(id, Constants.NVN_TASK_DEALT_ERROR);
                Log.nvnTaskLog.debug(taskId + " nvn任务查询时间大于半个小时");
                return;
            }

            CommandContext commandContext = new CommandContext(context.getHttpRequest());
            Registry registry = Registry.getInstance();
            commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());
            Map<String, Object> map = new HashMap<>();
            map.put("TASK_ID", taskId);
            commandContext.setBody(map);
            Log.nvnTaskLog.debug("------------------>调用开放平台，获取nvn任务查询接口");
            registry.selectCommand(BaseCommandEnum.faceNvnQueryResult.getUri()).exec(commandContext);
            long code = commandContext.getResponse().getCode();
            Log.nvnTaskLog.debug("------------------>调用开放平台，nvn任务接口返回结果：" + commandContext.getResponse().getResult());
            // 状态码30870119121023，表示任务正在执行中，需要重复去调用查询接口获取结果
            if (Constants.NVN_EXCUTING_CODE == code) {
                Log.nvnTaskLog.debug("nvn任务结果正在执行中");
                return;
            }

            // 通过异步接口获取结果
            code = commandContext.getResponse().getCode();
            if (0L != code) {
                Log.nvnTaskLog.debug("任务返回信息：" + commandContext.getResponse().getMessage());
                Object[] result = getErrMessage(taskId, commandContext.getResponse().getMessage());
                dao.insertTaskResult(result);
                dao.updateTaskStatus(id, Constants.NVN_TASK_DEALT_ERROR);
                return;
            }

            // 将结果写入结果表
            String xmlData = StringUtil.toString(commandContext.getResponse().getData("DATA"));
            Log.nvnTaskLog.debug("------------------>nvn任务结果查询接口xml" + xmlData);
            List<Map<String, Object>> resultList = new ArrayList<>();
            try {
                resultList = handleXmlData(xmlData, taskType, requestFaceGroups);
            } catch (Exception e) {
                Log.nvnTaskLog.error("------------------>解析nvn任务结果查询接口xml失败，原因：" + e.getMessage());
            }

            Object handleResult = handleResult(taskType, resultList, context);
            Object[] result = renderResult(taskId, handleResult);
            dao.insertTaskResult(result);
            Log.nvnTaskLog.debug("------------------>接口返回结果已入库");

            // 任务结束更新状态
            dao.updateTaskStatus(id, Constants.NVN_TASK_DEALT);
            Log.nvnTaskLog.debug("------------------>任务结束，更新状态已处理");
        } catch (Exception e) {
            Log.nvnTaskLog.error("获取nvn任务结果出错，原因：" + e.getMessage(), e);
        }

    }

    @BeanService(id = "updateTaskLevel", type = "remote", description = "更新nvn任务的优先级")
    public void updateTaskLevel(RequestContext context) {
        String id = StringUtil.toString(context.getParameter("ID"));
        try {
            dao.updateTaskUpdateTime(id);
            context.getResponse().putData("CODE", 0);
            context.getResponse().putData("RESULT", "优先级设置成功");
        } catch (Exception e) {
            context.getResponse().putData("CODE", 1);
            context.getResponse().putData("RESULT", "优先级设置失败，原因：" + e.getMessage());
            context.getResponse().putData("MESSAGE", "优先级设置失败，原因：" + e.getMessage());
            Log.nvnTaskLog.error("优先级设置失败，原因：" + e.getMessage(), e);
        }
    }

    @BeanService(id = "getTaskResult", type = "remote", description = "获取nvn任务结果")
    public void getTaskResult(RequestContext context) {
        String taskId = StringUtil.toString(context.getParameter("TASK_ID"));
        // 任务如没交给华为做处理，taskId为空，需要用id进行参数获取
        String id = StringUtil.toString(context.getParameter("ID"));
        try {
            List<Map<String, Object>> taskParamList = dao.getTaskParam(taskId, id);
            Map<String, Object> taskParam = new HashMap<>();
            if (taskParamList != null && taskParamList.size() > 0) {
                taskParam = taskParamList.get(0);
            }
            ServiceLog.debug("数据库查询到的参数：" + JSONObject.toJSONString(taskParam));
            List<Map<String, Object>> taskResult = dao.getTaskResult(taskId);
            if (taskResult != null && taskResult.size() > 0) {
                String taskResultString = StringUtil.toString(taskResult.get(0).get("TASK_RESULT"), "");
                context.getResponse().putData("DATA", taskResultString);
            }
            ServiceLog.debug("数据库查询到的结果：" + JSONObject.toJSONString(taskResult));
            Map<String, Object> taskParamMap = new HashMap<>();

            String param = StringUtil.toString(taskParam.get("PARAM"), "");
            ServiceLog.debug("缓存的参数：" + param);
            String taskType = StringUtil.toString(taskParam.get("TASK_TYPE"), "");
            ServiceLog.debug("缓存的TASK_TYPE：" + taskType);
            if (!StringUtil.isNull(param)) {
                taskParamMap = JSONObject.parseObject(param, Map.class);
                renderDeviceInfo(taskParamMap, taskType);
            }

            context.getResponse().putData("PARAM", taskParamMap);
            context.getResponse().putData("CODE", 0);

        } catch (Exception e) {
            context.getResponse().putData("CODE", 1);
            context.getResponse().putData("DATA", "");
            context.getResponse().putData("PARAM", "");
            context.getResponse().putData("MESSAGE", "获取nvn任务结果失败，请联系管理员");
            Log.nvnTaskLog.error("获取nvn任务结果失败，原因：" + e.getMessage(), e);

        }
    }

    @BeanService(id = "deleteTask", type = "remote", description = "删除nvn任务")
    public void deleteTask(RequestContext context) {
        String id = StringUtil.toString(context.getParameter("TASK_ID"));
        try {
            String[] taskIds = id.split(",");
            dao.deleteTask(taskIds);
            context.getResponse().putData("CODE", 0);
            context.getResponse().putData("RESULT", "nvn任务删除成功");
        } catch (Exception e) {
            context.getResponse().putData("CODE", 1);
            context.getResponse().putData("RESULT", "nvn任务删除失败，原因：" + e.getMessage());
            context.getResponse().putData("MESSAGE", "nvn任务删除失败，原因：" + e.getMessage());
            Log.nvnTaskLog.error("nvn任务删除失败，原因：" + e.getMessage(), e);
        }
    }

    public void insertNvnTask(String taskId, Map<String, Object> params, int count, String creator,
                              String method) {
        Object[] tranData = tranData(taskId, params, count, creator, method);
        try {
            dao.insertNvNTaskInfo(tranData);
        } catch (Exception e) {
            Log.nvnTaskLog.error("nvn任务参数入库失败，原因：" + e.getMessage(), e);
        }
    }

    public Object[] tranData(String taskId, Map<String, Object> params, int count, String creator,
                             String method) {
        Object[] param = new Object[9];
        param[0] = taskId;
        param[1] = method;
        param[2] = count;
        // 任务状态："0"未处理，"1"处理中，"2"已处理
        param[3] = Constants.NVN_TASK_UN_DEAL;
        // if (count < 10000) {
        // param[3] = "2";
        // }

        String handleTime = "1";
        if (count > 10000 && count <= 30000) {
            handleTime = "3";
        } else if (count > 30000 && count <= 50000) {
            handleTime = "7";
        } else if (count > 50000 && count <= 70000) {
            handleTime = "12";
        } else if (count > 70000 && count <= 100000) {
            handleTime = "20";
        } else if (count > 100000) {
            handleTime = "30";
        }

        param[4] = handleTime;
        param[5] = creator;
        param[6] = JSONObject.toJSONString(params);
        param[7] = new Date();
        param[8] = new Date();
        return param;

    }

    public Object[] renderResult(String taskId, Object result) {
        Object[] param = new Object[3];
        param[0] = taskId;
        param[1] = JSONObject.toJSONString(result);
        param[2] = new Date();

        return param;
    }

    // 需要对同伙分析和昼伏夜出的结果进行处理
    public Object handleResult(String taskType, List<Map<String, Object>> resultList,
                               RequestContext context) throws Exception {

        if (resultList.size() == 0) {
            return "";
        }
        switch (taskType) {
            case Constants.FOLLOW_PERSON:
                return followPersonService.buildResult(context, resultList);
            case Constants.REGION_COLLISION:
            case Constants.DAY_HIDE_NIGHT_ACTIVE:
            case Constants.NIGHT_ACTIVE:
                return regionCollisionCommonService.buildResult(context, resultList);
            default:
                return resultList;
        }
    }

    private List<Map<String, Object>> buildDeviceList(Object deviceIds) throws Exception {
        String[] deviceIdArray = StringUtil.toString(deviceIds).split(",");
        List<Map<String, Object>> deviceList = new ArrayList<>();
        for (String deviceId : deviceIdArray) {
            deviceList.add(getDeviceInfo(deviceId));
        }
        return deviceList;
    }

    public void renderDeviceInfo(Map<String, Object> paramMap, String taskType) throws Exception {
        switch (taskType) {
            case Constants.FACE_CAPTURE_FREQ_ANALYSIS:
            case Constants.FREQUENT_ACCESS:
                paramMap.put("DEVICE_IDS", this.buildDeviceList(paramMap.get("DEVICE_IDS")));
                break;
            case Constants.NIGHT_ACTIVE:
            case Constants.REGION_COLLISION:
                List<Map<String, Object>> paramList = (List<Map<String, Object>>) paramMap.get("timeRegionList");
                for (Map<String, Object> map : paramList) {
                    map.put("DEVICE_IDS", this.buildDeviceList(map.get("DEVICE_IDS")));
                }
                break;
            case Constants.FOLLOW_PERSON:
                Map<String, Object> oneCompareParam
                        = JSONObject.parseObject(StringUtil.toString(paramMap.get("ONECOMPARE_PARAM")), Map.class);
                List<Map<String, Object>> deviceList = this.buildDeviceList(oneCompareParam.get("DEVICE_IDS"));
                oneCompareParam.put("DEVICE_IDS", deviceList);
                paramMap.put("PIC", StringUtil.toString(oneCompareParam.get("PIC"), ""));
                paramMap.put("beginTime", StringUtil.toString(oneCompareParam.get("beginTime"), ""));
                paramMap.put("endTime", StringUtil.toString(oneCompareParam.get("endTime"), ""));
                paramMap.put("topN", StringUtil.toString(oneCompareParam.get("topN"), ""));
                paramMap.put("threshold", StringUtil.toString(oneCompareParam.get("threshold"), ""));
                paramMap.put("togetherMinute", StringUtil.toString(oneCompareParam.get("togetherMinute"), ""));
                paramMap.put("DEVICE_IDS", deviceList);
                break;
            case Constants.DAY_HIDE_NIGHT_ACTIVE:
                List<Map<String, Object>> groupList = (List<Map<String, Object>>) paramMap.get("GROUP_LIST");
                for (Map<String, Object> map : groupList) {
                    paramMap.put("DEVICE_IDS", this.buildDeviceList(map.get("CROSS")));
                }
                break;
            default:
                break;
        }
    }

    public Map<String, Object> getDeviceInfo(String deviceId) throws Exception {
        Map<String, Object> deviceMap = new HashMap<>();
        DeviceEntity faceDevice
                = (DeviceEntity) EAP.metadata.getDictModel(DictType.D_FACE, deviceId, DeviceEntity.class);
        deviceMap.put("DEVICE_ID", deviceId);
        deviceMap.put("DEVICE_NAME", StringUtil.toString(faceDevice.getDeviceName(), ""));
        deviceMap.put("ORG_CODE", StringUtil.toString(faceDevice.getOrgCode(), ""));
        return deviceMap;
    }

    /**
     * 处理xml数据，把xml改成转成list
     *
     * @param xmlData
     * @param taskType
     * @param requestFaceGroups
     * @return
     * @throws Exception
     */
    public List<Map<String, Object>> handleXmlData(String xmlData, String taskType, List<FaceGroup> requestFaceGroups) throws Exception {
        FacenvnCommand command = new FacenvnCommand();
        command.setRequestFaceGroups(requestFaceGroups);
        Document doc = DocumentHelper.parseText(xmlData);
        Element root = doc.getRootElement();
        String code = StringUtil.toString(root.element("result").element("code").getText());
        String errMsg = StringUtil.toString(root.element("result").element("errmsg").getText());
        if (HWStatusCode.成功.getCode() == Long.valueOf(code)) {
            List<Element> faceInfosElements = root.element("faceInfos").elements();
            boolean isMultiRegion;
            if (Constants.FREQUENT_ACCESS.equals(taskType) || Constants.PERSON_FLOW_ANALYSIS.equals(taskType)) {
                isMultiRegion = false;
            } else {
                isMultiRegion = true;
            }
            return command.buildResultList(faceInfosElements, isMultiRegion);
        } else {
            Log.nvnTaskLog.error("华为接口处理出错，状态码：" + code + "， 错误信息：" + errMsg);
            return Collections.EMPTY_LIST;
        }
    }

    public Object[] getErrMessage(String taskId, String errMessage) {
        Object[] param = new Object[3];
        param[0] = taskId;
        param[1] = errMessage;
        param[2] = new Date();

        return param;
    }
}
