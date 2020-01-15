package com.suntek.efacecloud.service;

import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.service.face.tactics.async.NightActiveAsyncService;
import com.suntek.efacecloud.service.face.tactics.common.NightCommonService;
import com.suntek.efacecloud.util.ConfigUtil;

import java.util.List;
import java.util.Map;

/**
 * 人脸技战法-深夜出入
 *
 * @author guoyl
 * @version 2019年11月12日
 * @since
 */
@LocalComponent(id = "technicalTactics/NightActive", isLog = "true")
public class NightActiveService extends NightCommonService {

    private NightActiveAsyncService asyncService = new NightActiveAsyncService();

    @BeanService(id = "query", type = "remote")
    public void query(RequestContext context) throws Exception {
        if (ConfigUtil.getIsNvnAsync()) {
            this.asyncService.query(context);
            return;
        }
        Map<String, Object> nightParams = this.buildNightParams(context);
        List<List<Map<String, Object>>> resultList = this.handle(context, nightParams);
        if (resultList == null) {
            return;
        }
        context.getResponse().putData("DATA", resultList);
    }

}
