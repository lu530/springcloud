package com.suntek.efacecloud.service.face.tactics.async;

import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceCaptureStatisticDao;
import com.suntek.efacecloud.util.Constants;

import java.util.Arrays;

/**
 * 频繁出入异步服务
 */
public class FrequentAccessAsyncService {

    private FaceCaptureStatisticDao faceCaptureDao = new FaceCaptureStatisticDao();

    private AsyncService asyncService = new AsyncService();

    public void query(RequestContext context) throws Exception {
        String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
        String endTime = StringUtil.toString(context.getParameter("END_TIME"));
        String cross = StringUtil.toString(context.getParameter("DEVICE_IDS"));// 卡口编号

        int count = faceCaptureDao.findCaptureNum(Arrays.asList(cross.split(",")), beginTime, endTime);
        this.asyncService.addAsyncTask(context, count, context.getParameters(), Constants.FREQUENT_ACCESS);
    }

}
