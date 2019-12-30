package com.suntek.efacecloud.service.redlist;

import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.Constants;
import com.suntek.face.compare.sdk.model.CollisionResult;

import java.util.List;
import java.util.Map;

public class FaceRedListDelegate extends FaceRedListService {

    private FaceRedListService instance() {
        String vendor = AppHandle.getHandle(Constants.OPENGW).getProperty("EAPLET_VENDOR", "Suntek");
        if (Constants.HIK_VENDOR.equals(vendor)) {
            return new HikFaceRedListService();
        } else if ("huawei".equals(vendor)) {
            return new HuaWeiFaceRedListService();
        } else {
            return new PciFaceRedListService();
        }
    }

    @Override
    public CollisionResult faceOne2NSearch(RequestContext context, String pic) {
        return this.instance().faceOne2NSearch(context, pic);
    }

    @Override
    public void initRedListLib() {
        this.instance().initRedListLib();
    }

    @Override
    public CollisionResult deleteFace(RequestContext context) {
        return this.instance().deleteFace(context);
    }

    @Override
    public void addOrEdit(RequestContext context) throws Exception {
        this.instance().addOrEdit(context);
    }

    @Override
    public int importRedList(RequestContext context,
                             List<Map<String, Object>> successList,
                             List<String> failList,
                             Map<String, String> importErrorMsgCache) throws Exception {
        return this.instance().importRedList(context,
                successList,
                failList,
                importErrorMsgCache);
    }
}
