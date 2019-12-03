package com.suntek.efacecloud.service;

import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.index.SearchEngineException;
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
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 人员区域碰撞
 *
 * @author yana
 * @version 2017年07月18日
 */
@LocalComponent(id = "technicalTactics/regionCollsion")
public class RegionCollsionService {

    @SuppressWarnings("unchecked")
    @BeanService(id = "query", description = "人员技战法区域碰撞查询", since = "2.0.0", type = "remote")
    public void query(RequestContext context) throws Exception {

        String[] bT_arr = StringUtil.toString(context.getParameter("BEGIN_TIMES")).split("_");
        String[] eT_arr = StringUtil.toString(context.getParameter("END_TIMES")).split("_");
        String[] kkbh_arr = StringUtil.toString(context.getParameter("DEVICE_IDS")).split("_");

        int similarity = Integer.valueOf(StringUtil.toString(context.getParameter("THRESHOLD"), "80"));

        String faceScore = StringUtil.toString(context.getParameter("FACE_SCORE"), "65");

        List<Map<String, Object>> timeRegionList = new ArrayList<Map<String, Object>>();

        for (int i = 0; i < bT_arr.length && i < eT_arr.length && i < kkbh_arr.length; i++) {

            Map<String, Object> esSearchTime = ModuleUtil.searchEsTime(bT_arr[i], eT_arr[i]);
            if (Integer.valueOf(StringUtil.toString(esSearchTime.get("code"))) == Constants.SEARCH_ES_TIME_LACK) {
                context.getResponse().setError("应用模块配置项：人脸抓拍索引起始月份  未配置");
                return;

            } else if (Integer
                    .valueOf(StringUtil.toString(esSearchTime.get("code"))) == Constants.SEARCH_ES_TIME_OVERSTEP) {
                context.getResponse().putData("DATA", Collections.EMPTY_LIST);
                return;

            } else if (Integer
                    .valueOf(StringUtil.toString(esSearchTime.get("code"))) == Constants.SEARCH_ES_TIME_SUCCESS) {
                bT_arr[i] = StringUtil.toString(esSearchTime.get("beginTime"));
                eT_arr[i] = StringUtil.toString(esSearchTime.get("endTime"));
            }

            Map<String, Object> temp = new HashMap<String, Object>();
            temp.put("beginTime", bT_arr[i]);
            temp.put("endTime", eT_arr[i]);
            temp.put("cross", kkbh_arr[i]);
            timeRegionList.add(temp);
        }

        CommandContext commandContext = new CommandContext(context.getHttpRequest());

        commandContext.setServiceUri(BaseCommandEnum.regionCollsion.getUri());

        try {
            commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());
        } catch (Exception e) {
            ServiceLog.debug("外部调用。");
        }

        Map<String, Object> params = new HashMap<String, Object>();
        params.put("timeRegionList", timeRegionList);
        params.put("similarity", similarity);
        params.put("algoType", ConfigUtil.getAlgoType());
        params.put("faceScore", faceScore);
        commandContext.setBody(params);

        ServiceLog.debug("区域碰撞 调用sdk参数:" + params);
        String vendor = AppHandle.getHandle(Constants.OPENGW).getProperty(
                "EAPLET_VENDOR", "Suntek");

        Registry registry = Registry.getInstance();

        registry.selectCommand(BaseCommandEnum.regionCollsion.getUri(), "4401",
                vendor).exec(commandContext);

        ServiceLog.debug("区域碰撞 调用sdk返回结果code:" + commandContext.getResponse().getCode() + " message:"
                + commandContext.getResponse().getMessage() + " result:" + commandContext.getResponse().getResult());

        long code = commandContext.getResponse().getCode();

        if (0L != code) {
            context.getResponse().setWarn(commandContext.getResponse().getMessage());
            return;
        }

        List<List<Object>> personIds = (List<List<Object>>) commandContext.getResponse().getData("DATA");
        // 返回结果的集合
        List<List<Map<String, Object>>> resultList = new ArrayList<List<Map<String, Object>>>();

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
                registry.selectCommands(commandContext.getServiceUri()).exec(commandContext);
                ServiceLog.debug("调用sdk反查返回结果code:" + commandContext.getResponse().getCode() + " message:"
                        + commandContext.getResponse().getMessage() + " result:"
                        + commandContext.getResponse().getResult());

                code = commandContext.getResponse().getCode();
                if (0L != code) {
                    context.getResponse().setWarn(commandContext.getResponse().getMessage());
                    return;
                }
                List<Map<String, Object>> list = (List<Map<String, Object>>) commandContext.getResponse().getData("DATA");
                list.stream().forEach(o->{
                    o.put("REPEATS",map.get("REPEATS"));
                    o.put("ORIGINAL_DEVICE_ID",map.get("DEVICE_ID"));
                    o.put("FACE_SCORE","0");
                });
                resultList.add(list);
            } else {
                ids = personIds.get(i); // 一个人员出现列表的主键id集合
                List<Map<String, Object>> result = handlePersonId(ids);

                if (result.size() > 0) { // 过滤反查不到的结果列表
                    resultList.add(result);
                }
            }

        }

        context.getResponse().putData("DATA", resultList);
    }

    /**
     * 根据id反查得到返回需要的数据信息,一个人的所有数据 抓拍时间、卡口、次数、图片
     *
     * @param aPersonIds
     * @return
     * @throws Exception
     */
    private List<Map<String, Object>> handlePersonId(List<Object> aPersonIds) throws Exception {

        List<Map<String, Object>> aPersonList = new ArrayList<Map<String, Object>>();

        String[] idsArr = ModuleUtil.listArrToStrArr(aPersonIds);

        String[] indexName = new IDGenerator().getIndexNameFromIds(Constants.FACE_INDEX + "_", idsArr);

        try {

            PageQueryResult pageResult = EAP.bigdata.queryByIds(indexName, Constants.FACE_TABLE, idsArr);
            List<Map<String, Object>> resultSet = pageResult.getResultSet();


            Log.fanchaLog.debug("1 区域碰撞 反查  查询条件主键id->" + aPersonIds);
            Log.fanchaLog.debug("2 区域碰撞 反查  查询结果-> " + resultSet + "\n");

            for (int i = 0; i < resultSet.size(); i++) {
                Map<String, Object> personData = new HashMap<String, Object>();

                Map<String, Object> map = resultSet.get(i);
                // 图片
                personData.put("OBJ_PIC", ModuleUtil.renderImage(StringUtil.toString(map.get("OBJ_PIC"))));
                // 时间
                personData.put("TIME", DateUtil.convertByStyle(StringUtil.toString(map.get("JGSK")),
                        DateUtil.yyMMddHHmmss_style, DateUtil.standard_style));

                // 区域
                personData.put("ORIGINAL_DEVICE_ID", StringUtil.toString(map.get("DEVICE_ID")));

                // 特征分数
                personData.put("FACE_SCORE", StringUtil.toString(map.get("FACE_SCORE")));

                Map<Object, Object> device
                        = EAP.metadata.getDictMap(DictType.D_FACE, StringUtil.toString(map.get("DEVICE_ID")));

                if (null != device) {
                    personData.put("DEVICE_NAME", device.get("DEVICE_NAME"));
                } else {
                    personData.put("DEVICE_NAME", "未知");
                }

                // 次数
                personData.put("REPEATS", resultSet.size());

                // 坐标
                personData.put("X", device.get("LONGITUDE"));
                personData.put("Y", device.get("LATITUDE"));

                aPersonList.add(personData);
            }
            // 详情以时间倒序排序
            Collections.sort(aPersonList, new Comparator<Map<String, Object>>() {
                @Override
                public int compare(Map<String, Object> o1, Map<String, Object> o2) {
                    String a1 = StringUtil.toString(o1.get("TIME"));
                    String a2 = StringUtil.toString(o2.get("TIME"));
                    return a2.compareTo(a1);
                }
            });
        } catch (SearchEngineException e) {
            Log.fanchaLog.error("区域碰撞 渲染人脸数据异常:", e);
        }
        return aPersonList;
    }
}
