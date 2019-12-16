package com.suntek.efacecloud.service.face.search;

import com.suntek.eap.web.RequestContext;
import com.suntek.face.compare.sdk.model.CollisionResult;

public abstract class FaceSearchRedListService {

    public abstract CollisionResult faceOne2NSearch(RequestContext context, String pic);
}
