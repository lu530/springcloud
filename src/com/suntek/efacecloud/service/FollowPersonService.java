package com.suntek.efacecloud.service;

import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.IDGenerator;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.service.face.tactics.async.FollowPersonAsyncService;
import com.suntek.efacecloud.service.face.tactics.common.FollowPersonCommonService;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.DeviceInfoUtil;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 人员技战法-团伙分析
 *
 * @author swq
 * @version 2017年07月15日
 */

@LocalComponent(id = "technicalTactics/personFollow")
public class FollowPersonService extends FollowPersonCommonService {

    private FollowPersonAsyncService aysncService = new FollowPersonAsyncService();

    @BeanService(id = "togetherAnalysis", description = "同行人员分析", since = "1.0.0", type = "remote",
            paasService = "true")
    public void together(RequestContext context) throws Exception {
        String recordId = StringUtil.toString(context.getParameter("RECORD_IDS"));
        String togetherMinute = StringUtil.toString(context.getParameter("TOGETHER_MINUTE"));
        int similarity = Integer.parseInt(StringUtil.toString(context.getParameter("THRESHOLD"), "80"));
        String faceScore = StringUtil.toString(context.getParameter("FACE_SCORE"), "65");
        String oneCompareParam = StringUtil.toString(context.getParameter("ONECOMPARE_PARAM"));
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("RECORD_IDS", recordId);
        params.put("TOGETHER_MINUTE", togetherMinute);
        params.put("THRESHOLD", similarity);
        params.put("FACE_SCORE", faceScore);
        params.put("ALGO_TYPE", ConfigUtil.getAlgoType());
        params.put("ONECOMPARE_PARAM", oneCompareParam);

        if (ConfigUtil.getIsNvnAsync()) {
            this.aysncService.together(context, params);
            return;
        }

        CommandContext commandContext = new CommandContext(context.getHttpRequest());

        commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());


        commandContext.setBody(params);

        ServiceLog.debug("团伙分析  调用sdk参数:" + params);

        String vendor = ConfigUtil.getVendor();

        Registry registry = Registry.getInstance();

        registry.selectCommand(BaseCommandEnum.followPerson.getUri(), "4401",
                vendor).exec(commandContext);

        ServiceLog.debug("团伙分析  调用sdk返回结果code:" + commandContext.getResponse().getCode() + " message:"
                + commandContext.getResponse().getMessage() + " result:" + commandContext.getResponse().getResult());

        long code = commandContext.getResponse().getCode();

        if (0L != code) {
            context.getResponse().setWarn(commandContext.getResponse().getMessage());
            return;
        }

        @SuppressWarnings("unchecked")
        List<List<Object>> persons = (List<List<Object>>) commandContext.getResponse().getData("DATA");
        context.getResponse().putData("DATA", this.buildResult(context, persons));
    }

    @BeanService(id = "query", description = "1:N检索查找此人的出现记录", since = "1.0.0", type = "remote")
    public void query(RequestContext context) throws Exception {

        Map<String, Object> params = context.getParameters();

        CommandContext commandContext = new CommandContext(context.getHttpRequest());

        params.put("ALGO_TYPE", ConfigUtil.getAlgoType());
        commandContext.setBody(params);

        commandContext.setServiceUri(BaseCommandEnum.faceCollisionQuery.getUri());

        try {
            commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());
        } catch (Exception e) {
            ServiceLog.debug("外部调用。");
        }

        ServiceLog.debug("调用1:N接口参数:" + params);

        Registry registry = Registry.getInstance();

        // registry.selectCommands(commandContext.getServiceUri()).exec(commandContext);

        String vendor = ConfigUtil.getVendor();
        registry.selectCommand(BaseCommandEnum.faceCollisionQuery.getUri(), "4401", vendor).exec(commandContext);

        ServiceLog.debug("调用1:N接口返回结果code:" + commandContext.getResponse().getCode() + " message:"
                + commandContext.getResponse().getMessage() + " result:" + commandContext.getResponse().getResult());

        long code = commandContext.getResponse().getCode();

        if (0L != code) {
            context.getResponse().setWarn(commandContext.getResponse().getMessage());
            return;
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> resultList = (List<Map<String, Object>>) commandContext.getResponse().getData("DATA");

        context.getResponse().putData("DATA", dateGrouping(resultList));
        context.getResponse().putData("PALCE", placeGrouping(resultList));
    }


    /**
     * 对结果集分类
     *
     * @param resultList
     * @return
     * @throws Exception
     */
    public List<Map<String, Object>> dateGrouping(List<Map<String, Object>> resultList) throws Exception {

        if (null == resultList || resultList.size() == 0) {
            return Collections.emptyList();
        }

        // 对结果进行分类
        List<Map<String, Object>> dateList = new ArrayList<Map<String, Object>>();

        Map<String, List<Map<String, Object>>> dataSortByDate
                = resultList.stream().collect(Collectors.groupingBy(o -> StringUtil.toString(o.get("JGSK")).split(" ")[0])); // 按日期分类

        for (String keyDate : dataSortByDate.keySet()) {

            List<Map<String, Object>> listInDate = dataSortByDate.get(keyDate); // 在keyDate日期下出现的人脸记录

            Map<String, List<Map<String, Object>>> dataSortByPlace
                    = listInDate.stream().collect(Collectors.groupingBy(o -> StringUtil.toString(o.get("DEVICE_ID")))); // 按地点分类

            Map<String, Object> map = new HashMap<String, Object>();

            map.put("DATE_TIME", keyDate);

            List<Map<String, Object>> placeListMap = new ArrayList<Map<String, Object>>();// 元素为X日期下X地点下的所有人员记录

            for (String place : dataSortByPlace.keySet()) {

                List<Map<String, Object>> needRenderData = dataSortByPlace.get(place);

                Map<String, Object> placeMaps = new HashMap<String, Object>();
                placeMaps.put("PLACE", DeviceInfoUtil.getDeviceName(DictType.D_FACE, place));
                placeMaps.put("LIST", renderData(needRenderData));
                placeListMap.add(placeMaps);

            }
            map.put("LIST", placeListMap);

            dateList.add(map);
        }

        return dateList;
    }

    private List<Map<String, Object>> placeGrouping(List<Map<String, Object>> resultList) throws Exception {

        if (null == resultList || resultList.size() == 0) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> placeList = new ArrayList<Map<String, Object>>();

        Map<String, List<Map<String, Object>>> dataSortByPlace
                = resultList.stream().collect(Collectors.groupingBy(o -> StringUtil.toString(o.get("DEVICE_ID")))); // 按日期分类

        for (String place : dataSortByPlace.keySet()) {

            List<Map<String, Object>> listInDate = dataSortByPlace.get(place); // 在place日期下出现的人脸记录

            Map<String, Object> map = new HashMap<String, Object>();

            map.put("PLACE", DeviceInfoUtil.getDeviceName(DictType.D_FACE, place));

            map.put("LIST", renderData(listInDate));
            map.put("SIZE", listInDate.size());

            placeList.add(map);
        }

        Collections.sort(placeList, new Comparator<Map<String, Object>>() {

            @Override
            public int compare(Map<String, Object> o1, Map<String, Object> o2) {
                return Integer.valueOf(StringUtil.toString(o2.get("SIZE")))
                        - Integer.valueOf(StringUtil.toString(o1.get("SIZE")));
            }

        });

        return placeList;
    }

    /***
     * 渲染后台数据
     */
    private List<Map<String, Object>> renderData(List<Map<String, Object>> dataList) throws Exception {

        List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();

        for (int i = 0; i < dataList.size(); i++) {

            Map<String, Object> returnParams = new HashMap<String, Object>();

            Map<String, Object> map = dataList.get(i);

            returnParams.put("INFO_ID", map.get("INFO_ID"));
            returnParams.put("TIME", map.get("JGSK"));

            returnParams.put("X",
                    DeviceInfoUtil.getDeviceCoordinate(DictType.D_FACE, StringUtil.toString(map.get("DEVICE_ID")), 1));
            returnParams.put("Y",
                    DeviceInfoUtil.getDeviceCoordinate(DictType.D_FACE, StringUtil.toString(map.get("DEVICE_ID")), 2));
            returnParams.put("ORIGINAL_DEVICE_ID", StringUtil.toString(map.get("DEVICE_ID")));
            returnParams.put("DEVICE_NAME",
                    DeviceInfoUtil.getDeviceName(DictType.D_FACE, StringUtil.toString(map.get("DEVICE_ID"))));
            returnParams.put("OBJ_PIC", ModuleUtil.renderImage(StringUtil.toString(map.get("OBJ_PIC"))));
            returnParams.put("BIG_PIC", ModuleUtil.renderImage(StringUtil.toString(map.get("PIC"))));

            returnParams.put("SCORE", map.get("SIMILARITY"));

            returnList.add(returnParams);
        }

        Collections.sort(returnList, new Comparator<Map<String, Object>>() {

            @Override
            public int compare(Map<String, Object> o1, Map<String, Object> o2) {
                return StringUtil.toString(o2.get("TIME")).compareTo(StringUtil.toString(o1.get("TIME")));
            }
        }); // 对时间进行排序

        return returnList;
    }
}
