package com.suntek.efacecloud.service.face.tactics.common;

import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.index.SearchEngineException;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 区域碰撞公共类
 */
public class RegionCollisionCommonService {

    protected Map<String, Object> buildQueryParams(RequestContext context) {
        String[] bT_arr = StringUtil.toString(context.getParameter("BEGIN_TIMES")).split("_");
        String[] eT_arr = StringUtil.toString(context.getParameter("END_TIMES")).split("_");
        String[] kkbh_arr = StringUtil.toString(context.getParameter("DEVICE_IDS")).split("_");
        int similarity = Integer.valueOf(StringUtil.toString(context.getParameter("THRESHOLD"), "80"));
        List<Map<String, Object>> timeRegionList = new ArrayList<>();

        for (int i = 0; i < bT_arr.length && i < eT_arr.length && i < kkbh_arr.length; i++) {
            Map<String, Object> temp = new HashMap<String, Object>();
            temp.put("beginTime", bT_arr[i]);
            temp.put("endTime", eT_arr[i]);
            temp.put("cross", kkbh_arr[i]);
            temp.put("DEVICE_IDS", kkbh_arr[i]);
            timeRegionList.add(temp);
        }
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("timeRegionList", timeRegionList);
        params.put("similarity", similarity);
        params.put("algoType", ConfigUtil.getAlgoType());
        return params;
    }

    public List<List<Map<String, Object>>> handle(RequestContext context,
                                                  Map<String, Object> params) throws Exception {
        CommandContext commandContext = new CommandContext(context.getHttpRequest());
        commandContext.setServiceUri(BaseCommandEnum.regionCollsion.getUri());
        commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());
        commandContext.setBody(params);

        ServiceLog.debug("区域碰撞 调用sdk参数:" + params);
        String vendor = ConfigUtil.getVendor();

        Registry registry = Registry.getInstance();

        registry.selectCommand(commandContext.getServiceUri(), "4401",
                vendor).exec(commandContext);
        ServiceLog.debug("区域碰撞 调用sdk返回结果code:" + commandContext.getResponse().getCode() + " message:"
                + commandContext.getResponse().getMessage() + " result:" + commandContext.getResponse().getResult());

        long code = commandContext.getResponse().getCode();

        if (0L != code) {
            context.getResponse().setWarn(commandContext.getResponse().getMessage());
            return null;
        }
        List<List<Object>> persons = (List<List<Object>>) commandContext.getResponse().getData("DATA");
        return buildResult(context, persons);
    }

    /**
     * 把内容构建成前端所需
     *
     * @param context
     * @param persons
     * @return
     * @throws Exception
     */
    public List<List<Map<String, Object>>> buildResult(RequestContext context, List<?> persons) throws Exception {
        // 返回结果的集合
        List<List<Map<String, Object>>> resultList = new ArrayList<>();
        CommandContext commandContext = new CommandContext(context.getHttpRequest());
        Registry registry = Registry.getInstance();
        String vendor = ConfigUtil.getVendor();
        for (int i = 0; i < persons.size(); i++) {
            if (persons.get(i) instanceof HashMap) {
                HashMap map = (HashMap) persons.get(i);

                String idStr = (String) map.get("IDS");

                commandContext.setServiceUri(BaseCommandEnum.faceQueryByIds.getUri());
                commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());

                Map<String, Object> queryParams = new HashMap<String, Object>();
                queryParams.put("IDS", idStr);
                commandContext.setBody(queryParams);
                ServiceLog.debug("调用sdk反查记录参数:" + queryParams);
                registry.selectCommand(commandContext.getServiceUri(), "4401",
                        vendor).exec(commandContext);
                ServiceLog.debug("调用sdk反查返回结果code:" + commandContext.getResponse().getCode() + " message:"
                        + commandContext.getResponse().getMessage() + " result:"
                        + commandContext.getResponse().getResult());

                long code = commandContext.getResponse().getCode();
                if (0L != code) {
                    context.getResponse().setWarn(commandContext.getResponse().getMessage());
                    return null;
                }
                List<Map<String, Object>> list = (List<Map<String, Object>>) commandContext.getResponse().getData("DATA");
                list.stream().forEach(o -> {
                    o.put("REPEATS", map.get("REPEATS"));
                    o.put("ORIGINAL_DEVICE_ID", map.get("DEVICE_ID"));
                    o.put("FACE_SCORE", "0");
                });
                resultList.add(list);
            } else {
                List<Object> ids = (List<Object>) persons.get(i); // 一个人员出现列表的主键id集合
                List<Map<String, Object>> result = handlePersonId(ids);

                if (result.size() > 0) { // 过滤反查不到的结果列表
                    resultList.add(result);
                }
            }
        }
        return resultList;
    }


    /**
     * 根据id反查得到返回需要的数据信息,一个人的所有数据 抓拍时间、卡口、次数、图片
     *
     * @param aPersonIds
     * @return
     * @throws Exception
     */
    protected List<Map<String, Object>> handlePersonId(List<Object> aPersonIds) {

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
            Collections.sort(aPersonList, (o1, o2) -> {
                String a1 = StringUtil.toString(o1.get("TIME"));
                String a2 = StringUtil.toString(o2.get("TIME"));
                return a2.compareTo(a1);
            });
        } catch (SearchEngineException e) {
            Log.fanchaLog.error("区域碰撞 渲染人脸数据异常:", e);
        }
        return aPersonList;
    }


}
