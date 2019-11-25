package com.suntek.efacecloud.service;

import com.suntek.eap.common.CommandContext;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.util.Constants;
import com.suntek.sp.common.common.BaseCommandEnum;
import org.apache.commons.lang.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 人脸技战法-昼伏夜出
 *
 * @author suweiquan
 * @version 2018年6月12日
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
        int similarity = Integer.valueOf(StringUtil.toString(context.getParameter("THRESHOLD"), "80"));
        String algoCode = StringUtil.toString(context.getParameter("ALGORITHM_CODE"));
        int dayFrequence = Integer.valueOf(StringUtil.toString(context.getParameter("DAY_FREQUENCE")));
        int nightFrequence = Integer.valueOf(StringUtil.toString(context.getParameter("NIGHT_FREQUENCE")));
        String deviceIds = StringUtil.toString(context.getParameter("DEVICE_IDS"));

        if (dayFrequence > nightFrequence) {
            context.getResponse().setWarn("昼出频次必须小于夜出频次");
            return;
        }

        List<Map<String, Object>> groupList = new ArrayList<Map<String, Object>>();
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

        Map<String, Object> params = new HashMap<String, Object>();
        params.put("DAY_FREQUENCE", dayFrequence);
        params.put("NIGHT_FREQUENCE", nightFrequence);
        params.put("GROUP_LIST", groupList);
        params.put("SIMILARITY", similarity);
        params.put("MIN_FREQUENCE", nightFrequence);
        params.put("ALGORITHM_CODE", algoCode);


        CommandContext commandContext = new CommandContext(context.getHttpRequest());
        commandContext.setServiceUri(BaseCommandEnum.faceNvn.getUri());
        commandContext.setBody(params);

        ServiceLog.debug("调用人脸nvn接口参数:" + params);
        Registry registry = Registry.getInstance();
        registry.selectCommands(commandContext.getServiceUri()).exec(commandContext);
        ServiceLog.debug("调用人脸nvn接口返回结果code:" + commandContext.getResponse().getCode() + " message:"
                + commandContext.getResponse().getMessage() + " result:" + commandContext.getResponse().getResult());

        long code = commandContext.getResponse().getCode();
        if (0L != code) {
            context.getResponse().setWarn(commandContext.getResponse().getMessage());
            return;
        }
        List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
        List<Map<String, Object>> dataList = (List<Map<String, Object>>) commandContext.getResponse().getData("DATA");
        for (Map<String, Object> data : dataList) {
            int dayFreq = 0;
            int nightFreq = 0;
            List<String> recordIds = new ArrayList<String>();
            List<Map<String, Object>> records = (List<Map<String, Object>>) data.get("RECORDS");
            String firstRecordId = StringUtil.toString(data.get("INFO_ID"));
            for (Map<String, Object> record : records) {
                String faceGroupNo = StringUtil.toString(record.get("FACE_GROUP_NO"));
                String recordId = StringUtil.toString(record.get("RECORD_ID"));
                String faceTime = StringUtil.toString(record.get("FACE_TIME"));
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
                resultList.add(data);
            } else {
                ServiceLog.debug("first recordId：" + firstRecordId + " 昼频次：" + dayFreq + " 夜频次：" + nightFreq + " 不满足条件，排除");
            }
        }

        context.getResponse().putData("DATA", resultList);
        context.getResponse().putData("MESSAGE", "分析成功");
        context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
    }


}
