package com.suntek.efacecloud.service.face.tactics.async;

import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceCaptureStatisticDao;
import com.suntek.efacecloud.service.face.tactics.common.NightCommonService;
import com.suntek.efacecloud.util.Constants;

import java.util.List;
import java.util.Map;

/**
 * 深夜出入异步
 */
public class NightActiveAsyncService extends NightCommonService {

    private FaceCaptureStatisticDao faceCaptureDao = new FaceCaptureStatisticDao();
    private AsyncService asyncService = new AsyncService();

    public void query(RequestContext context) throws Exception {
        Map<String, Object> params = this.buildNightParams(context);
        int count = this.faceCaptureDao.findCaptureNumByTimeRegionList((List<Map<String, Object>>) params.get("timeRegionList"));
        this.asyncService.addAsyncTask(context, count, params, Constants.NIGHT_ACTIVE);
    }

}
