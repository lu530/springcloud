package com.suntek.efacecloud.service.face.search;

import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.Constants;
import com.suntek.face.compare.sdk.model.CollisionResult;

public class FaceSearchRedListDelegate extends FaceSearchRedListService {

    private FaceSearchRedListService hik = new HikFaceSearchRedListService();

    private FaceSearchRedListService huawei = new HuaWeiFaceSearchRedListService();

    private FaceSearchRedListService pci = new PciFaceSearchRedListService();

    private FaceSearchRedListService instance() {
        String vendor = AppHandle.getHandle(Constants.OPENGW).getProperty("EAPLET_VENDOR", "Suntek");
        if (Constants.HIK_VENDOR.equals(vendor)) {
           return hik;
        } else if ("huawei".equals(vendor)) {
            return huawei;
        } else {
            return pci;
        }

    }

    @Override
    public CollisionResult faceOne2NSearch(RequestContext context, String pic) {
        return this.instance().faceOne2NSearch(context, pic);
    }
}
