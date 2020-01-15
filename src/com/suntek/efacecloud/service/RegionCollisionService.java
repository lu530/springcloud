package com.suntek.efacecloud.service;

import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.service.face.tactics.async.RegionCollisionAsyncService;
import com.suntek.efacecloud.service.face.tactics.common.RegionCollisionCommonService;
import com.suntek.efacecloud.util.ConfigUtil;

import java.util.List;
import java.util.Map;

/**
 * 人员区域碰撞
 *
 * @author yana
 * @version 2017年07月18日
 */
@LocalComponent(id = "technicalTactics/regionCollision")
public class RegionCollisionService extends RegionCollisionCommonService {

    private RegionCollisionAsyncService asyncService = new RegionCollisionAsyncService();

    @SuppressWarnings("unchecked")
    @BeanService(id = "query", description = "人员技战法区域碰撞查询", since = "2.0.0", type = "remote")
    public void query(RequestContext context) throws Exception {
        if (ConfigUtil.getIsNvnAsync()) {
            this.asyncService.query(context);
            return;
        }
        Map<String, Object> params = this.buildQueryParams(context);
        if (params == null) {
            return;
        }

        List<List<Map<String, Object>>> resultList = this.handle(context, params);
        if (resultList == null) {
            return;
        }
        context.getResponse().putData("DATA", resultList);
    }

}
