package com.suntek.efacecloud.service.face.search;

import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.FaceFeatureUtil;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.efacecloud.util.SdkStaticLibUtil;
import com.suntek.face.compare.sdk.model.CollisionResult;

import java.util.HashMap;
import java.util.Map;

public class PciFaceSearchRedListService extends FaceSearchRedListService {
    @Override
    public CollisionResult faceOne2NSearch(RequestContext context, String pic) {
        String threshold = StringUtil.toString(context.getParameter("THRESHOLD")); //阈值
        FaceFeatureUtil.FeatureResp featureResp = FaceFeatureUtil.faceQualityCheck(ModuleUtil.renderImage(pic));
        if (!featureResp.isValid()) {
            ServiceLog.error("人脸质量检测不通过，原因：" + featureResp.getErrorMsg());
            context.getResponse().setError("人脸质量检测不通过，原因：" + featureResp.getErrorMsg());
            return null;
        }
        Map<String, Object> picSearchParam = new HashMap<String, Object>();
        picSearchParam.put("libraryId", Constants.STATIC_LIB_ID_RED_LIST);
        picSearchParam.put("similarity", Integer.parseInt(threshold));
        picSearchParam.put("feature", featureResp.getRltz());
        picSearchParam.put("topN", 10000000);
        picSearchParam.put("algoType", Constants.DEFAULT_ALGO_TYPE);
        CollisionResult collisionResult = SdkStaticLibUtil.faceOne2NSearch(picSearchParam);
        return collisionResult;
    }
}
