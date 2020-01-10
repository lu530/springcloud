package com.suntek.efacecloud.service;

import cn.hutool.core.date.DateField;
import cn.hutool.core.date.DateTime;
import cn.hutool.core.date.DateUnit;
import cn.hutool.core.date.DateUtil;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.index.SearchEngineException;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.IDGenerator;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.mppdb.MppQueryDao;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 人脸技战法-昼伏夜出
 *
 * @author guoyl
 * @version 2019年11月12日
 * @since
 */
@LocalComponent(id = "technicalTactics/dayHideNightActive", isLog = "true")
public class DayHideNightActiveService {

    @BeanService(id = "query", type = "remote")
    public void query(RequestContext context) throws Exception {

        String beginDate = StringUtil.toString(context.getParameter("BEGIN_DATE"));
        String endDate = StringUtil.toString(context.getParameter("END_DATE"));
        String dayBeginTime = StringUtil.toString(context.getParameter("DAY_BEGIN_TIME"));
        String dayEndTime = StringUtil.toString(context.getParameter("DAY_END_TIME"));
        String nightBeginTime = StringUtil.toString(context.getParameter("NIGHT_BEGIN_TIME"));
        String nightEndTime = StringUtil.toString(context.getParameter("NIGHT_END_TIME"));
        int dayFrequence = Integer.valueOf(StringUtil.toString(context.getParameter("DAY_FREQUENCE")));
        int nightFrequence = Integer.valueOf(StringUtil.toString(context.getParameter("NIGHT_FREQUENCE")));
        String deviceIds = StringUtil.toString(context.getParameter("DEVICE_IDS"));
        int similarity = Integer.valueOf(StringUtil.toString(context.getParameter("THRESHOLD"), "80"));
        String faceScore = StringUtil.toString(context.getParameter("FACE_SCORE"), "65");

        if (dayFrequence > nightFrequence) {
            context.getResponse().setWarn("昼出频次必须小于夜出频次");
            return;
        }

        List<Map<String, Object>> groupList = new ArrayList<Map<String, Object>>();
        List<Map<String, Object>> timeRegionList = new ArrayList<Map<String, Object>>();
        Map<String, Object> dayGroup = new HashMap<String, Object>();
        dayGroup.put("BEGIN_DATE", beginDate);
        dayGroup.put("END_DATE", endDate);
        dayGroup.put("BEGIN_TIME", dayBeginTime);
        dayGroup.put("END_TIME", dayEndTime);
        dayGroup.put("CROSS", deviceIds);
        groupList.add(dayGroup);

        if (nightBeginTime.compareTo(nightEndTime) > 0) {

            Map<String, Object> nightGroupFirst = new HashMap<String, Object>();
            nightGroupFirst.put("BEGIN_DATE", beginDate);
            nightGroupFirst.put("END_DATE", endDate);
            nightGroupFirst.put("BEGIN_TIME", nightBeginTime);
            nightGroupFirst.put("END_TIME", "23:59:59");
            nightGroupFirst.put("CROSS", deviceIds);
            groupList.add(nightGroupFirst);

            Map<String, Object> nightGroupSecond = new HashMap<String, Object>();
            nightGroupSecond.put("BEGIN_DATE", beginDate);
            nightGroupSecond.put("END_DATE", endDate);
            nightGroupSecond.put("BEGIN_TIME", "00:00:00");
            nightGroupSecond.put("END_TIME", nightEndTime);
            nightGroupSecond.put("CROSS", deviceIds);
            groupList.add(nightGroupSecond);

        } else {
            Map<String, Object> nightGroup = new HashMap<String, Object>();
            nightGroup.put("BEGIN_DATE", beginDate);
            nightGroup.put("END_DATE", endDate);
            nightGroup.put("BEGIN_TIME", nightBeginTime);
            nightGroup.put("END_TIME", nightEndTime);
            nightGroup.put("CROSS", deviceIds);
            groupList.add(nightGroup);
        }

        groupList.stream().forEach(o -> {
            DateTime date1 = DateUtil.parse(StringUtil.toString(o.get("BEGIN_DATE")));
            DateTime date2 = DateUtil.parse(StringUtil.toString(o.get("END_DATE")));
            String time1 = StringUtil.toString(o.get("BEGIN_TIME"));
            String time2 = StringUtil.toString(o.get("END_TIME"));
            long betweenDay = DateUtil.between(date1, date2, DateUnit.DAY);
            for (int i = 0; i < betweenDay + 1; i++) {
                DateTime newDate = DateUtil.offset(date1, DateField.DAY_OF_MONTH, i);
                Map<String, Object> temp = new HashMap<String, Object>();
                temp.put("beginTime", DateUtil.formatDate(newDate) + " " + time1);
                temp.put("endTime", DateUtil.formatDate(newDate) + " " + time2);
                temp.put("cross", o.get("CROSS"));
                timeRegionList.add(temp);
            }
        });

        CommandContext commandContext = new CommandContext(context.getHttpRequest());

        commandContext.setServiceUri(BaseCommandEnum.regionCollsion.getUri());
        commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());

        Map<String, Object> params = new HashMap<String, Object>();
        params.put("timeRegionList", timeRegionList);
        params.put("similarity", similarity);
        params.put("algoType", ConfigUtil.getAlgoType());
        params.put("faceScore", faceScore);
        commandContext.setBody(params);

        ServiceLog.debug("昼伏夜出 调用sdk参数:" + params);

        Registry registry = Registry.getInstance();

        registry.selectCommands(commandContext.getServiceUri()).exec(commandContext);

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
                list.stream().forEach(o -> {
                    o.put("REPEATS", map.get("REPEATS"));
                    o.put("ORIGINAL_DEVICE_ID", map.get("DEVICE_ID"));
                    o.put("FACE_SCORE", "0");
                });
                resultList.add(list);
            } else {
                // 一个人所有id集合
                ids = personIds.get(i);
                List<Map<String, Object>> result = handlePersonId(ids);

                if (result.size() > 0) { // 过滤反查不到的结果列表
                    resultList.add(result);
                }
            }
        }

        DateTime dayBeginDate = DateUtil.parse(StringUtil.toString(context.getParameter("DAY_BEGIN_TIME")));
        DateTime dayEndDate = DateUtil.parse(StringUtil.toString(context.getParameter("DAY_END_TIME")));

        // 昼伏夜出分析 -- 将每人个的出现记录按照时间划分出昼时间与夜时间 再进行过滤
        resultList = resultList.stream().filter(o -> {
            int dayNum = 0;
            int nightNum = 0;
            for (Map<String, Object> x : o) {
                DateTime time = DateUtil.parse(DateUtil.formatTime(DateUtil.parse(StringUtil.toString(x.get("TIME")))));
                if (time.compareTo(dayBeginDate) > 0 && dayEndDate.compareTo(time) > 0) {
                    dayNum++;
                } else {
                    nightNum++;
                }
            }

            if (dayNum <= dayFrequence && nightNum >= nightFrequence) {
                return true;
            }
            ServiceLog.debug("数据不符合昼伏夜出规则，过滤 " + JSONObject.toJSONString(o));
            return false;
        }).collect(Collectors.toList());

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

            List<Map<String, Object>> resultSet = new ArrayList<Map<String, Object>>();

            // 获取大数据检索方式，0：ES，1：MPPDB
            String serachFun = AppHandle.getHandle(Constants.CONSOLE).getProperty("BIGDATA_SEARCH_FUN", "0");
            if (Constants.BIGDATA_SEARCH_ES.equals(serachFun)) {

                PageQueryResult pageResult = EAP.bigdata.queryByIds(indexName, Constants.FACE_TABLE, idsArr);
                resultSet = pageResult.getResultSet();
            } else {

                MppQueryDao dao = new MppQueryDao();
                resultSet = dao.queryByIds(idsArr);
            }

            Log.fanchaLog.debug("1 区域碰撞 反查  查询条件主键id->" + aPersonIds);
            Log.fanchaLog.debug("2 区域碰撞 反查  查询结果-> " + resultSet + "\n");

            for (int i = 0; i < resultSet.size(); i++) {
                Map<String, Object> personData = new HashMap<String, Object>();

                Map<String, Object> map = resultSet.get(i);
                // 图片
                personData.put("OBJ_PIC", ModuleUtil.renderImage(StringUtil.toString(map.get("OBJ_PIC"))));
                // 时间
                personData.put("TIME", com.suntek.eap.util.DateUtil.convertByStyle(StringUtil.toString(map.get("JGSK")),
                        com.suntek.eap.util.DateUtil.yyMMddHHmmss_style, com.suntek.eap.util.DateUtil.standard_style));
                /*
                MPPDB存的JGSK也是yyMMddHHmmss格式
                if (Constants.BIGDATA_SEARCH_ES.equals(serachFun)) {

                    personData.put("TIME", com.suntek.eap.util.DateUtil.convertByStyle(StringUtil.toString(map.get("JGSK")),
                            com.suntek.eap.util.DateUtil.yyMMddHHmmss_style, com.suntek.eap.util.DateUtil.standard_style));
                } else {
                    personData.put("TIME", com.suntek.eap.util.DateUtil
                            .dateToString(com.suntek.eap.util.DateUtil.toDate(StringUtil.toString(map.get("JGSK")), "yyyy-MM-dd HH:mm:ss")));
                }*/

                // 区域
                personData.put("ORIGINAL_DEVICE_ID", StringUtil.toString(map.get("DEVICE_ID")));

                // 特征分数
                personData.put("FACE_SCORE", StringUtil.toString(map.get("FACE_SCORE")));

                Map<Object, Object> device = EAP.metadata.getDictMap(DictType.D_FACE, StringUtil.toString(map.get("DEVICE_ID")));

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
            Log.fanchaLog.error("区域碰撞 渲染人脸数据异常:" + e.getMessage(), e);
        }
        return aPersonList;
    }

}
