package com.suntek.efacecloud.service;


import java.util.Date;
import java.util.Map;

import org.apache.commons.lang3.time.DateFormatUtils;

import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.provider.FaceDispatchedAlarmGroupingProvider;
import com.suntek.efacecloud.provider.FaceDispatchedAlarmProvider;

/**
 * 外籍人三非告警
 * @author baojunfeng
 * @since
 * @version 2019年8月27日
 */
@LocalComponent(id = "face/dispatchedAlarm")
public class FaceAlarmOfIllegalForeignerService {

    @QueryService(id = "illegalForeignerAlarmGrouping", description = "三非人员告警（分组）", type = "remote")
    public Map<String, Object> illegalForeignerAlarmGrouping(RequestContext context) {
        String today = DateFormatUtils.format(new Date(), "yyyy-MM-dd");
        // 默认查询当天
        String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"), today + " 00:00:00");
        String endTime = StringUtil.toString(context.getParameter("END_TIME"), today + " 23:59:59");
        String pageNo = StringUtil.toString(context.getParameter("pageNo"), "1");
        String pageSize = StringUtil.toString(context.getParameter("pageSize"), "10");
        
        context.putParameter("TASK_TYPE", "-1");
        context.putParameter("BEGIN_TIME", beginTime);
        context.putParameter("END_TIME", endTime);
        context.putParameter("pageNo", pageNo);
        context.putParameter("pageSize", pageSize);
        
        return new FaceDispatchedAlarmGroupingProvider().query(context);
    }
    
    @QueryService(id = "illegalForeignerAlarm", description = "三非人员告警", type = "remote")
    public PageQueryResult illegalForeignerAlarm(RequestContext context) {
        String today = DateFormatUtils.format(new Date(), "yyyy-MM-dd");
        // 默认查询当天
        String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"), today + " 00:00:00");
        String endTime = StringUtil.toString(context.getParameter("END_TIME"), today + " 23:59:59");
        String pageNo = StringUtil.toString(context.getParameter("pageNo"), "1");
        String pageSize = StringUtil.toString(context.getParameter("pageSize"), "10");
        
        context.putParameter("TASK_TYPE", "-1");
        context.putParameter("BEGIN_TIME", beginTime);
        context.putParameter("END_TIME", endTime);
        context.putParameter("pageNo", pageNo);
        context.putParameter("pageSize", pageSize);
        
        return new FaceDispatchedAlarmProvider().getData(context);
    }

}
