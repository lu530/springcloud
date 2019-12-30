package com.suntek.efacecloud.service;

import cn.hutool.core.date.DateTime;
import cn.hutool.core.date.DateUtil;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.service.face.tactics.async.DayHideNightActiveAsyncService;
import com.suntek.efacecloud.service.face.tactics.common.NightCommonService;
import com.suntek.efacecloud.util.ConfigUtil;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 人脸技战法-昼伏夜出
 *
 * @author guoyl
 * @version 2019年11月12日
 * @since
 */
@LocalComponent(id = "technicalTactics/dayHideNightActive", isLog = "true")
public class DayHideNightActiveService extends NightCommonService {

    private DayHideNightActiveAsyncService asyncService = new DayHideNightActiveAsyncService();

    @BeanService(id = "query", type = "remote")
    public void query(RequestContext context) throws Exception {
        int dayFrequence = Integer.valueOf(StringUtil.toString(context.getParameter("DAY_FREQUENCE")));
        int nightFrenquence = Integer.valueOf(StringUtil.toString(context.getParameter("NIGHT_FREQUENCE")));
        if (dayFrequence > nightFrenquence) {
            context.getResponse().setWarn("昼出频次必须小于夜出频次");
            return;
        }
        if (ConfigUtil.getIsNvnAsync()) {
            this.asyncService.query(context);
            return;
        }
        Map<String, Object> params = this.buildDayNightParams(context);
        List<List<Map<String, Object>>> resultList = this.handle(context, params);
        if (resultList == null) {
            return;
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

            if (dayNum <= dayFrequence && nightNum >= nightFrenquence) {
                return true;
            }
            ServiceLog.debug("数据不符合昼伏夜出规则，过滤 " + JSONObject.toJSONString(o));
            return false;
        }).collect(Collectors.toList());

        context.getResponse().putData("DATA", resultList);
    }


}
