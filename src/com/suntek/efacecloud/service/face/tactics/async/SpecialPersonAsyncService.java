package com.suntek.efacecloud.service.face.tactics.async;

import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceCaptureStatisticDao;
import com.suntek.efacecloud.util.Constants;

import java.util.Arrays;

/**
 * 重点人员异步任务
 */
@LocalComponent(id = "special/person")
public class SpecialPersonAsyncService {

    private FaceCaptureStatisticDao faceCaptureDao = new FaceCaptureStatisticDao();

    private AsyncService asyncService = new AsyncService();

    /**
     * 添加任务
     *
     * @param context
     * @throws Exception
     */
    @QueryService(id="addTask", description = "增加特殊人群分析任务")
    public void addTask(RequestContext context) {
        String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
        String endTime = StringUtil.toString(context.getParameter("END_TIME"));
        String cross = StringUtil.toString(context.getParameter("DEVICE_IDS"));// 卡口编号
        int count = faceCaptureDao.findCaptureNum(Arrays.asList(cross.split(",")), beginTime, endTime);
        this.asyncService.addAsyncTask(context, count, context.getParameters(), Constants.SPECIAL_PERSON);
    }
}
