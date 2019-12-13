package com.suntek.efacecloud.util;

import com.suntek.eap.web.RequestContext;
import com.suntek.face.compare.sdk.model.CollisionResult;

public class HuaWeiSdkRedLibUtil {

    private static HuaWeikFaceRedListUtilImpl util = new HuaWeikFaceRedListUtilImpl();

    public static CollisionResult deleteFace(RequestContext context) {
        CollisionResult collisionResult = new CollisionResult();
        try {
            collisionResult.setCode(Constants.RETURN_CODE_SUCCESS);
            util.deletePerson(context);
        } catch (Exception e) {
            collisionResult.setCode(Constants.RETURN_CODE_ERROR);
        }
        return collisionResult;
    }
}
