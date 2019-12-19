package com.suntek.efacecloud.service.face.search;

import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.HikSdkRedLibUtil;
import com.suntek.face.compare.sdk.model.CollisionResult;

import java.util.HashMap;
import java.util.Map;

public class HikFaceSearchRedListService extends FaceSearchRedListService {

    @Override
    public CollisionResult faceOne2NSearch(RequestContext context, String pic) {
        String threshold = StringUtil.toString(context.getParameter("THRESHOLD")); //阈值
        Map<String, Object> params = new HashMap<>();
        params.put("TOP_N", 30);
        params.put("PIC", pic);
        params.put("THRESHOLD", "0." + threshold);
        CollisionResult collisionResult = HikSdkRedLibUtil.faceOne2NSearch(Constants.STATIC_LIB_ID_RED_LIST, params);
        return collisionResult;
    }

    @Override
    public void initRedListLib() {

    }
}
