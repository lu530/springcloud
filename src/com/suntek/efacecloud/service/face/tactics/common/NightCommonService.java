package com.suntek.efacecloud.service.face.tactics.common;

import cn.hutool.core.date.DateField;
import cn.hutool.core.date.DateTime;
import cn.hutool.core.date.DateUnit;
import cn.hutool.core.date.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.ConfigUtil;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 昼伏夜出公共类
 */
public class NightCommonService extends RegionCollisionCommonService {

    protected Map<String, Object> buildNightParams(RequestContext context) {
        return this.buildParams(context, false);
    }

    protected Map<String, Object> buildDayNightParams(RequestContext context) {
        return this.buildParams(context, true);
    }

    private Map<String, Object> buildParams(RequestContext context, boolean isDayNight) {
        String beginDate = StringUtil.toString(context.getParameter("BEGIN_DATE"));
        String endDate = StringUtil.toString(context.getParameter("END_DATE"));

        String nightBeginTime = StringUtil.toString(context.getParameter("NIGHT_BEGIN_TIME"));
        String nightEndTime = StringUtil.toString(context.getParameter("NIGHT_END_TIME"));

        String deviceIds = StringUtil.toString(context.getParameter("DEVICE_IDS"));
        int similarity = Integer.valueOf(StringUtil.toString(context.getParameter("THRESHOLD"), "80"));
        String faceScore = StringUtil.toString(context.getParameter("FACE_SCORE"), "65");

        List<Map<String, Object>> groupList = new ArrayList<Map<String, Object>>();
        List<Map<String, Object>> timeRegionList = new ArrayList<Map<String, Object>>();
        if (isDayNight) {
            groupList.addAll(this.buildDayNightGroupList(context));
        }
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
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("timeRegionList", timeRegionList);
        params.put("similarity", similarity);
        params.put("algoType", ConfigUtil.getAlgoType());
        params.put("faceScore", faceScore);
        return params;
    }

    private List<Map<String, Object>> buildDayNightGroupList(RequestContext context) {
        String beginDate = StringUtil.toString(context.getParameter("BEGIN_DATE"));
        String endDate = StringUtil.toString(context.getParameter("END_DATE"));
        String dayBeginTime = StringUtil.toString(context.getParameter("DAY_BEGIN_TIME"));
        String dayEndTime = StringUtil.toString(context.getParameter("DAY_END_TIME"));
        String deviceIds = StringUtil.toString(context.getParameter("DEVICE_IDS"));

        List<Map<String, Object>> groupList = new ArrayList<>();
        Map<String, Object> dayGroup = new HashMap<>();
        dayGroup.put("BEGIN_DATE", beginDate);
        dayGroup.put("END_DATE", endDate);
        dayGroup.put("BEGIN_TIME", dayBeginTime);
        dayGroup.put("END_TIME", dayEndTime);
        dayGroup.put("CROSS", deviceIds);
        groupList.add(dayGroup);
        return groupList;
    }

}
