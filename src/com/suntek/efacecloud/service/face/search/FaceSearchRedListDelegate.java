package com.suntek.efacecloud.service.face.search;

import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.Constants;
import com.suntek.face.compare.sdk.model.CollisionResult;

public class FaceSearchRedListDelegate extends FaceSearchRedListService {

    private FaceSearchRedListService instance() {
        String vendor = AppHandle.getHandle(Constants.OPENGW).getProperty("EAPLET_VENDOR", "Suntek");
        FaceSearchRedListService service = null;
        if (Constants.HIK_VENDOR.equals(vendor)) {
            service = new HikFaceSearchRedListService();
        } else if ("huawei".equals(vendor)) {
            service = new HuaWeiFaceSearchRedListService();
        } else {
            service = new PciFaceSearchRedListService();
        }
        return service;
    }

    @Override
    public CollisionResult faceOne2NSearch(RequestContext context, String pic) {
        return this.instance().faceOne2NSearch(context, pic);
    }
}
