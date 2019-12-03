package com.suntek.efacecloud.service;

import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.core.app.AppHandle;
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
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.DeviceInfoUtil;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 人员技战法-团伙分析
 *
 * @author swq
 * @version 2017年07月15日
 */

@LocalComponent(id = "technicalTactics/personFollow")
public class FollowPersonService {

    @BeanService(id = "togetherAnalysis", description = "同行人员分析", since = "1.0.0", type = "remote",
            paasService = "true")
    public void together(RequestContext context) throws Exception {
        String recordId = StringUtil.toString(context.getParameter("RECORD_IDS"));
        String togetherMinute = StringUtil.toString(context.getParameter("TOGETHER_MINUTE"));
        int similarity = Integer.parseInt(StringUtil.toString(context.getParameter("THRESHOLD"), "80"));
        String faceScore = StringUtil.toString(context.getParameter("FACE_SCORE"), "65");

        CommandContext commandContext = new CommandContext(context.getHttpRequest());

        commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());

        Map<String, Object> params = new HashMap<String, Object>();
        params.put("RECORD_IDS", recordId);
        params.put("TOGETHER_MINUTE", togetherMinute);
        params.put("THRESHOLD", similarity);
        params.put("FACE_SCORE", faceScore);
        params.put("ALGO_TYPE", ConfigUtil.getAlgoType());
        commandContext.setBody(params);

        ServiceLog.debug("团伙分析  调用sdk参数:" + params);

        String vendor = AppHandle.getHandle(Constants.OPENGW).getProperty(
                "EAPLET_VENDOR", "Suntek");

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
        List<List<Object>> personIds = (List<List<Object>>) commandContext.getResponse().getData("DATA");

        List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();// 返回到前端的结果集

        for (int i = 0; i < personIds.size(); i++) {
            List<Object> ids;
            if (personIds.get(i) instanceof HashMap) {
                HashMap map = (HashMap) personIds.get(i);
                String idStr = (String) map.get("IDS");

                commandContext.setServiceUri(BaseCommandEnum.faceQueryByIds.getUri());
                commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());

                Map<String, Object> queryParams = new HashMap<String, Object>();
                queryParams.put("IDS", idStr);
                commandContext.setBody(queryParams);
                ServiceLog.debug("调用sdk反查记录参数:" + queryParams);
                registry.selectCommand(BaseCommandEnum.faceQueryByIds.getUri(), "4401",
                        vendor).exec(commandContext);
                ServiceLog.debug("调用sdk反查返回结果code:" + commandContext.getResponse().getCode() + " message:"
                        + commandContext.getResponse().getMessage() + " result:"
                        + commandContext.getResponse().getResult());

                code = commandContext.getResponse().getCode();
                if (0L != code) {
                    context.getResponse().setWarn(commandContext.getResponse().getMessage());
                    return;
                }

                List<Map<String, Object>> list = (List<Map<String, Object>>) commandContext.getResponse().getData("DATA");
                Map<String, Object> personData = new HashMap<String, Object>();
                List infoIds = new ArrayList<>();
                List pics = new ArrayList();
                List originalPics = new ArrayList();
                List faceScores = new ArrayList();
                List devids = new ArrayList();
                List times = new ArrayList();
                List addrs = new ArrayList();
                List xf = new ArrayList();
                List yf = new ArrayList();
                list.stream().forEach(o -> {
                    infoIds.add(o.get("INFO_ID"));
                    pics.add(o.get("OBJ_PIC"));
                    originalPics.add(o.get("PIC"));
                    faceScores.add("0");
                    devids.add(o.get("DEVICE_ID"));
                    times.add(o.get("JGSK"));
                    addrs.add(o.get("ADDR"));
                    xf.add(StringUtil.toString(o.get("X")));
                    yf.add(StringUtil.toString(o.get("Y")));
                });
                personData.put("INFO_IDS", String.join(",", infoIds));
                personData.put("PICS", String.join(",", pics));
                personData.put("BIG_PIC", String.join(",", originalPics));
                personData.put("DEVIDS", String.join(",", devids));
                personData.put("TIMES", String.join(",", times));
                personData.put("ADDRS", String.join(",", addrs));
                personData.put("REPEATS", map.get("REPEATS"));
                personData.put("XS", String.join(",", xf));
                personData.put("YS", String.join(",", yf));
                personData.put("NAMES", String.join(",", addrs));
                personData.put("FACE_SCORES", String.join(",", faceScores));
                resultList.add(personData);
            } else {
                ids = personIds.get(i); // 一个人员出现列表的主键id集合
                resultList.add(handlePersonId(ids));
            }


        }

        context.getResponse().putData("DATA", resultList);

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

        String vendor = AppHandle.getHandle(Constants.OPENGW).getProperty("EAPLET_VENDOR", "Suntek");
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
     * 反查人员信息
     *
     * @param ids
     * @return
     */
    private Map<String, Object> handlePersonId(List<Object> ids) {

        Map<String, Object> personData = new HashMap<String, Object>();
        StringBuffer infoIds = new StringBuffer();
        StringBuffer pics = new StringBuffer();
        StringBuffer originalPics = new StringBuffer();
        StringBuffer faceScores = new StringBuffer();
        StringBuffer devids = new StringBuffer();
        StringBuffer times = new StringBuffer();
        StringBuffer addrs = new StringBuffer();
        StringBuffer xf = new StringBuffer();
        StringBuffer yf = new StringBuffer();

        String[] idsArr = ModuleUtil.listArrToStrArr(ids);

        String[] indexName = new IDGenerator().getIndexNameFromIds(Constants.FACE_INDEX + "_", idsArr);

        try {

            PageQueryResult pageResult = EAP.bigdata.queryByIds(indexName, Constants.FACE_TABLE, idsArr);
            List<Map<String, Object>> resultSet = pageResult.getResultSet();

            Log.fanchaLog.debug("1 同伙分析 反查 条件主键id->" + ids);
            Log.fanchaLog.debug("2 同伙分析 反查 查询结果-> " + resultSet + "\n");

            Collections.sort(resultSet, new Comparator<Map<String, Object>>() {
                @Override
                public int compare(Map<String, Object> o1, Map<String, Object> o2) {
                    return StringUtil.toString(o2.get("JGSK")).compareTo(StringUtil.toString(o1.get("JGSK")));
                }
            });

            for (int i = 0; i < resultSet.size(); i++) {
                Map<String, Object> map = resultSet.get(i);

                infoIds.append(map.get("INFO_ID") + ",");
                faceScores.append(StringUtil.toString(map.get("FACE_SCORE")) + ",");
                pics.append(ModuleUtil.renderImage(StringUtil.toString(map.get("OBJ_PIC"))) + ",");
                originalPics.append(ModuleUtil.renderImage(StringUtil.toString(map.get("PIC"))) + ",");
                devids.append(StringUtil.toString(map.get("DEVICE_ID")) + ",");


                times.append(DateUtil.convertByStyle(StringUtil.toString(map.get("JGSK")),
                        DateUtil.yyMMddHHmmss_style, DateUtil.standard_style) + ",");

                Map<Object, Object> device
                        = EAP.metadata.getDictMap(DictType.D_FACE, StringUtil.toString(map.get("DEVICE_ID")));

                addrs.append(device.get("DEVICE_ADDR") + ",");
                xf.append(device.get("LONGITUDE") + ",");
                yf.append(device.get("LATITUDE") + ",");

                if (i == resultSet.size() - 1) {
                    infoIds.deleteCharAt(infoIds.length() - 1);
                    pics.deleteCharAt(pics.length() - 1);
                    originalPics.deleteCharAt(originalPics.length() - 1);
                    devids.deleteCharAt(devids.length() - 1);
                    times.deleteCharAt(times.length() - 1);
                    addrs.deleteCharAt(addrs.length() - 1);
                    xf.deleteCharAt(xf.length() - 1);
                    yf.deleteCharAt(yf.length() - 1);
                    faceScores.deleteCharAt(faceScores.length() - 1);
                }
            }

            personData.put("INFO_IDS", infoIds);
            personData.put("PICS", pics);
            personData.put("BIG_PIC", originalPics);
            personData.put("DEVIDS", devids);
            personData.put("TIMES", times);
            personData.put("ADDRS", addrs);
            personData.put("REPEATS", resultSet.size());
            personData.put("XS", xf);
            personData.put("YS", yf);
            personData.put("NAMES", addrs);
            personData.put("FACE_SCORES", faceScores);
        } catch (Exception e) {
            ServiceLog.error("同伙分析 反查询有误:handlePersonId()", e);
        }
        return personData;
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
