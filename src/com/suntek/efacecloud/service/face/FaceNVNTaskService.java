package com.suntek.efacecloud.service.face;

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
import com.suntek.efacecloud.service.face.tactics.SpecialPersonService;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.sp.common.common.BaseCommandEnum;
import com.suntek.sp.huawei.HWStatusCode;
import com.suntek.sp.huawei.command.facematch.FacenvnCommand;
import org.apache.commons.lang.StringUtils;
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

    private SpecialPersonService specialPersonService = new SpecialPersonService();

    @BeanService(id = "executeTask", type = "remote", description = "执行nvn任务")
    public void executeTask(RequestContext context) {
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

            OnlineTaskCounter.removeTask();

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
                    String asyncTaskId = StringUtil.toString(resultList.get(0).get("TASK_ID"));
                    //华为返回任务id替换原来的任务id
                    dao.updateTaskId(id, asyncTaskId);
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
                FaceNvNTaskExecuteJob.isFinish = true;
            }

        }
        FaceNvNTaskExecuteJob.isFinish = true;
    }

    /**
     * 通过nvn任务结果查询接口获取结果
     *
     * @param context
     */
    @BeanService(id = "obtainResultByInterface", type = "remote", description = "获取nvn任务的结果")
    public void obtainResultByInterface(RequestContext context) {
        try {
            Map<String, Object> doingTask = dao.getDoingTask();
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

            DateTimeFormatter df = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime start = LocalDateTime.parse(updateTime, df);
            Duration between = Duration.between(LocalDateTime.now(), start);

            // 任务最大执行时间半个小时
            if (between.toMinutes() >= 30L) {
                Object[] result = getErrMessage(taskId, "任务超时");
                dao.insertTaskResult(result);
                dao.updateTaskStatus(id, Constants.NVN_TASK_DEALT_ERROR);
                Log.nvnTaskLog.debug(taskId + " nvn任务查询时间大于半个小时");
                FaceNvNTaskExecuteJob.isFinish = true;
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
                FaceNvNTaskExecuteJob.isFinish = true;
                return;
            }

            // 将结果写入结果表
            String xmlData = StringUtil.toString(commandContext.getResponse().getData("DATA"));
            Log.nvnTaskLog.debug("------------------>nvn任务结果查询接口xml" + xmlData);
            List<Map<String, Object>> resultList = new ArrayList<>();
            try {
                resultList = handleXmlData(xmlData, taskType);
            } catch (Exception e) {
                Log.nvnTaskLog.error("------------------>解析nvn任务结果查询接口xml失败，原因：" + e.getMessage());
            }

            handleResult(taskType, resultList, param, context);
            Object[] result = renderResult(taskId, resultList);
            dao.insertTaskResult(result);
            Log.nvnTaskLog.debug("------------------>接口返回结果已入库");

            // 任务结束更新状态
            dao.updateTaskStatus(id, Constants.NVN_TASK_DEALT);
            Log.nvnTaskLog.debug("------------------>任务结束，更新状态已处理");
            FaceNvNTaskExecuteJob.isFinish = true;

        } catch (Exception e) {
            Log.nvnTaskLog.error("获取nvn任务结果出错，原因：" + e.getMessage(), e);
            FaceNvNTaskExecuteJob.isFinish = true;
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
                context.getResponse().putData("DATA", StringUtil.toString(taskResult.get(0).get("TASK_RESULT"), ""));
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

    public Object[] renderResult(String taskId, List<Map<String, Object>> resultList) {
        Object[] param = new Object[3];
        param[0] = taskId;
        param[1] = JSONObject.toJSONString(resultList);
        param[2] = new Date();

        return param;
    }

    // 需要对同伙分析和昼伏夜出的结果进行处理
    public void handleResult(String taskType, List<Map<String, Object>> resultList, Map<String, Object> requestParam,
                             RequestContext context) {

        if (resultList.size() == 0) {
            return;
        }

        CommandContext commandContext = new CommandContext(context.getHttpRequest());
        Registry registry = Registry.getInstance();
        switch (taskType) {
            case Constants.FOLLOW_PERSON:
                try {
                    for (Map<String, Object> result : resultList) {
                        String ids = StringUtil.toString(result.get("IDS"));
                        commandContext.setServiceUri(BaseCommandEnum.faceQueryByIds.getUri());
                        commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());

                        Map<String, Object> queryParams = new HashMap<String, Object>();
                        queryParams.put("IDS", ids);
                        commandContext.setBody(queryParams);
                        ServiceLog.debug("调用sdk反查记录参数:" + queryParams);
                        registry.selectCommands(commandContext.getServiceUri()).exec(commandContext);
                        ServiceLog.debug("调用sdk反查返回结果code:" + commandContext.getResponse().getCode() + " message:"
                                + commandContext.getResponse().getMessage() + " result:"
                                + commandContext.getResponse().getResult());

                        long code = commandContext.getResponse().getCode();
                        if (0L != code) {
                            context.getResponse().setWarn(commandContext.getResponse().getMessage());
                            return;
                        }
                        result.put("RECORDS", commandContext.getResponse().getData("DATA"));
                    }
                } catch (Exception e) {
                    Log.nvnTaskLog.error("调用开放平台同伙分析出错，原因：" + e.getMessage(), e);
                }
                break;
            // 昼伏夜出
            case Constants.DAY_HIDE_NIGHT_ACTIVE:
                try {
                    int dayFrequence = Integer.valueOf(StringUtil.toString(requestParam.get("DAY_FREQUENCE")));
                    int nightFrequence = Integer.valueOf(StringUtil.toString(requestParam.get("NIGHT_FREQUENCE")));
                    Log.nvnTaskLog.debug("DAY_FREQUENCE：" + dayFrequence + ",NIGHT_FREQUENCE：" + nightFrequence);
                    Log.nvnTaskLog.debug("RESULT_LIST：" + resultList);
                    List<Map<String, Object>> tempList = new ArrayList<>();
                    for (Map<String, Object> data : resultList) {
                        int dayFreq = 0;
                        int nightFreq = 0;
                        List<String> recordIds = new ArrayList<String>();
                        List<Map<String, Object>> records = (List<Map<String, Object>>) data.get("RECORDS");
                        String firstRecordId = StringUtil.toString(data.get("INFO_ID"));
                        for (Map<String, Object> record : records) {
                            String faceGroupNo = StringUtil.toString(record.get("FACE_GROUP_NO"));
                            String recordId = StringUtil.toString(record.get("RECORD_ID"));
                            recordIds.add(recordId);
                            if ("0".equals(faceGroupNo)) {
                                dayFreq++;
                            } else {
                                nightFreq++;
                            }
                        }
                        if (dayFreq <= dayFrequence && nightFreq >= nightFrequence) {
                            data.put("DAY_FREQUENCE", dayFreq);
                            data.put("NIGHT_FREQUENCE", nightFreq);
                            data.put("RECORD_IDS", StringUtils.join(recordIds.toArray(), ","));
                            data.remove("RECORDS");
                            tempList.add(data);
                        } else {
                            ServiceLog.debug("first recordId：" + firstRecordId + " 昼频次：" + dayFreq + " 夜频次：" + nightFreq
                                    + " 不满足条件，排除");
                        }
                    }

                    resultList.clear();
                    resultList.addAll(tempList);
                } catch (Exception e) {
                    Log.nvnTaskLog.error("调用开放平台昼伏夜出出错，原因：" + e.getMessage(), e);
                }
                break;
            default:
                break;
        }
    }

    public void renderDeviceInfo(Map<String, Object> paramMap, String taskType) throws Exception {
        String[] deviceIds = {};
        List<Map<String, Object>> deviceList = new ArrayList<>();
        switch (taskType) {
            case Constants.FACE_CAPTURE_FREQ_ANALYSIS:
            case Constants.FREQUENT_ACCESS:
                deviceIds = StringUtil.toString(paramMap.get("DEVICE_IDS")).split(",");
                for (String deviceId : deviceIds) {
                    deviceList.add(getDeviceInfo(deviceId));
                }

                paramMap.put("DEVICE_IDS", deviceList);
                break;
            case Constants.REGION_COLLISION:
                List<Map<String, Object>> paramList = (List<Map<String, Object>>) paramMap.get("TIME_REGION_LIST");
                for (Map<String, Object> map : paramList) {
                    deviceIds = StringUtil.toString(map.get("DEVICE_IDS")).split(",");
                    for (String deviceId : deviceIds) {
                        deviceList.add(getDeviceInfo(deviceId));
                    }

                    map.put("DEVICE_IDS", deviceList);
                }
                break;
            case Constants.FOLLOW_PERSON:
                Map<String, Object> oneCompareParam
                        = JSONObject.parseObject(StringUtil.toString(paramMap.get("ONECOMPARE_PARAM")), Map.class);
                String[] deviceIdList = StringUtil.toString(oneCompareParam.get("DEVICE_IDS")).split(",");
                ServiceLog.debug("同伙分析设备参数：" + JSONObject.toJSONString(deviceIdList));
                for (String deviceId : deviceIdList) {
                    deviceList.add(getDeviceInfo(deviceId));
                }

                oneCompareParam.put("DEVICE_IDS", deviceList);
                paramMap.put("PIC", StringUtil.toString(oneCompareParam.get("PIC"), ""));
                paramMap.put("BEGIN_TIME", StringUtil.toString(oneCompareParam.get("BEGIN_TIME"), ""));
                paramMap.put("END_TIME", StringUtil.toString(oneCompareParam.get("END_TIME"), ""));
                paramMap.put("TOPN", StringUtil.toString(oneCompareParam.get("TOPN"), ""));
                paramMap.put("THRESHOLD", StringUtil.toString(oneCompareParam.get("THRESHOLD"), ""));
                paramMap.put("DEVICE_IDS", deviceList);
                break;
            case Constants.DAY_HIDE_NIGHT_ACTIVE:
                List<Map<String, Object>> groupList = (List<Map<String, Object>>) paramMap.get("GROUP_LIST");
                for (Map<String, Object> map : groupList) {
                    deviceIds = StringUtil.toString(map.get("CROSS")).split(",");
                    List<Map<String, Object>> cross = new ArrayList<>();
                    for (String deviceId : deviceIds) {
                        cross.add(getDeviceInfo(deviceId));
                    }

                    map.put("DEVICE_IDS", cross);
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

    private FacenvnCommand command = new FacenvnCommand();

    public List<Map<String, Object>> handleXmlData(String xmlData, String taskType) throws Exception {
        Document doc = DocumentHelper.parseText(xmlData);
        Element root = doc.getRootElement();
        String code = StringUtil.toString(root.element("result").element("code").getText());
        String errMsg = StringUtil.toString(root.element("result").element("errmsg").getText());
        List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
        if (HWStatusCode.成功.getCode() == Long.valueOf(code)) {
            List<Element> faceInfosElements = root.element("faceInfos").elements();
            return this.command.buildResultList(faceInfosElements);
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
