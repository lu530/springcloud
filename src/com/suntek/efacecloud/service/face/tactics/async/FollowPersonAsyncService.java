package com.suntek.efacecloud.service.face.tactics.async;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceCaptureStatisticDao;
import com.suntek.efacecloud.util.Constants;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FollowPersonAsyncService {

    private FaceCaptureStatisticDao faceCaptureDao = new FaceCaptureStatisticDao();

    private AsyncService asyncService = new AsyncService();

    public void together(RequestContext context, Map<String, Object> params) throws Exception {
        int captureCount = this.findCaptureCount(params);
        this.asyncService.addAsyncTask(context, captureCount, params, Constants.FOLLOW_PERSON);

    }

    private int findCaptureCount(Map<String, Object> parameters) {
        String recordId = StringUtil.toString(parameters.get("RECORD_IDS"));
        String togetherMinute = StringUtil.toString(parameters.get("TOGETHER_MINUTE"));
        JSONArray recordsArr = JSONObject.parseArray(StringUtil.toString(JSONObject.parseObject(recordId).get("LIST")));

        List<Map<String, Object>> list = new ArrayList<>();
        int timeInteval = Integer.parseInt(togetherMinute);
        for (int i = 0; i < recordsArr.size(); i++) {
            Map<String, Object> map = new HashMap<String, Object>();
            Map<String, Object> selectRecord = (Map<String, Object>)recordsArr.get(i);
            String time = StringUtil.toString(selectRecord.get("CAPTURE_TIME"));
            String beginTime = DateUtil.getDayAfter(time, Calendar.MINUTE, -timeInteval);
            String endTime = DateUtil.getDayAfter(time, Calendar.MINUTE, timeInteval);
            String cross = StringUtil.toString(selectRecord.get("ORIGINAL_DEVICE_ID"));
            map.put("beginTime", beginTime);
            map.put("endTime", endTime);
            map.put("cross", cross);
            list.add(map);
        }
        Integer count = faceCaptureDao.findCaptureNumByTimeRegionList(list);
        ServiceLog.info("统计参数: " + JSONObject.toJSONString(list) + " 总抓拍量:" + count);
        return count;
    }
}
