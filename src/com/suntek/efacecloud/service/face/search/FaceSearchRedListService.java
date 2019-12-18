package com.suntek.efacecloud.service.face.search;

import com.suntek.eap.log.LogFactory;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.Constants;
import com.suntek.face.compare.sdk.model.CollisionResult;
import org.apache.log4j.Logger;

public abstract class FaceSearchRedListService {

    protected static Logger log = LogFactory.getServiceLog(Constants.APP_NAME);

    /**
     * 1:N红名单检索
     * @param context
     * @param pic
     * @return
     */
    public abstract CollisionResult faceOne2NSearch(RequestContext context, String pic);

    public abstract void initRedListLib();


}
