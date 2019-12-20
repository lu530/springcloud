package com.suntek.efacecloud.service.face.search;

import com.suntek.eap.core.app.AppHandle;
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

    private int algoType = Integer.parseInt(AppHandle.getHandle(Constants.APP_NAME).getProperty("VRS_ALGO_TYPES", "10003"));
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
        picSearchParam.put("algoType", algoType);
        CollisionResult collisionResult = SdkStaticLibUtil.faceOne2NSearch(picSearchParam);
        return collisionResult;
    }

    @Override
    public void initRedListLib() {
        try {
            long time = System.currentTimeMillis();
            CollisionResult result = SdkStaticLibUtil.isLibExist(Constants.STATIC_LIB_ID_RED_LIST, algoType);
            if (result.getCode() == Constants.COLLISISON_RESULT_SUCCESS) {
                boolean isExist = (boolean) result.getList().get(0);
                if (!isExist) {
                    CollisionResult createReult = SdkStaticLibUtil.createLib(Constants.STATIC_LIB_ID_RED_LIST, algoType);
                    if (createReult.getCode() != Constants.COLLISISON_RESULT_SUCCESS) {
                        log.error("初始化红名单库[" + Constants.STATIC_LIB_ID_RED_LIST + "]异常");
                    }
                }
            }
            log.debug("初始化红名单--耗时:" + (System.currentTimeMillis() - time) + "ms");
        } catch (Exception e) {
            log.error("初始化静态库，发生异常", e);
        }
    }
}
