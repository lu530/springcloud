package com.suntek.efacecloud.service.redlist;

import com.suntek.eap.EAP;
import com.suntek.eap.index.SearchEngineException;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceAlgorithmNameDao;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.FaceFeatureUtil;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.efacecloud.util.SdkStaticLibUtil;
import com.suntek.face.compare.sdk.common.constant.operation.FaceOperationEnum;
import com.suntek.face.compare.sdk.model.CollisionResult;
import com.suntek.face.compare.sdk.service.manage.FaceOperationManager;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class PciFaceRedListService extends FaceRedListService {

    private FaceAlgorithmNameDao algoDao = new FaceAlgorithmNameDao();

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

    @Override
    public void initRedListLib() {
        try {
            long time = System.currentTimeMillis();
            CollisionResult result = SdkStaticLibUtil.isLibExist(Constants.STATIC_LIB_ID_RED_LIST, Constants.DEFAULT_ALGO_TYPE);
            if (result.getCode() == Constants.COLLISISON_RESULT_SUCCESS) {
                boolean isExist = (boolean) result.getList().get(0);
                if (!isExist) {
                    CollisionResult createReult = SdkStaticLibUtil.createLib(Constants.STATIC_LIB_ID_RED_LIST, Constants.DEFAULT_ALGO_TYPE);
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

    /**
     * 从静态小库注销人脸
     *
     * @param libraryId
     * @param ids
     * @return
     * @throws SearchEngineException
     */
    public CollisionResult deleteFace(RequestContext context) {
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("libraryId", Constants.STATIC_LIB_ID_RED_LIST);
        map.put("ids", StringUtil.toString(context.getParameters().get("INFO_ID")));
        map.put("algoType", Constants.DEFAULT_ALGO_TYPE);

        ServiceLog.debug("从静态小库注销人脸参数：" + map);
        CollisionResult result = FaceOperationManager.runOperation(map, FaceOperationEnum.FACEDB_LOGOUT);
        if (result != null) {
            ServiceLog.info("从静态小库注销人脸结果：" + result.toJson());
        } else {
            ServiceLog.debug("从静态小库注销人脸结果：null");
        }

        return result;
    }

    @Override
    public void addOrEdit(RequestContext context) throws Exception {
        Map<String, Object> params = context.getParameters();
        String infoId = StringUtil.toString(params.get("INFO_ID"));
        String pic = StringUtil.toString(params.get("PIC"));

        FaceFeatureUtil.FeatureResp featureResp = FaceFeatureUtil.faceQualityCheck(pic);
        if (!featureResp.isValid()) {
            context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
            context.getResponse().putData("MESSAGE", "人脸质量检测不通过，原因：" + featureResp.getErrorMsg());
            return;
        }

        if (!StringUtil.isEmpty(infoId)) {

            CollisionResult deleteFaceResult = this.deleteFace(context);
            if (deleteFaceResult == null || deleteFaceResult.getCode() != 0) {
                context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                context.getResponse().putData("MESSAGE", "从静态小库注销人脸失败！");
                return;
            }

            this.deleteRedPerson(infoId);
        }

        try {
            String createTime = DateUtil.getDateTime();
            long newPersonId = EAP.keyTool.getIDGenerator();
            params.put("INFO_ID", newPersonId);
            params.put("CREATE_TIME", createTime);
            params.put("CREATOR", context.getUserCode()); //创建人
            params.put("PIC_QUALITY", featureResp.getScore()); //图片质量

            String rltz = featureResp.getRltz();
            params.put("RLTZ", rltz); //人脸特征

            Map<Long, String> features = new HashMap<Long, String>();
            features.put(newPersonId, rltz);

            CollisionResult saveFaceResult = SdkStaticLibUtil.saveFaceToLib(Constants.STATIC_LIB_ID_RED_LIST,
                    newPersonId, rltz,
                    Constants.DEFAULT_ALGO_TYPE);
            if (saveFaceResult == null || saveFaceResult.getCode() != 0) {
                context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                context.getResponse().putData("MESSAGE", "注册人脸到静态小库失败！");
                return;
            }

            this.insertRedPerson(params);
            context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
            context.getResponse().putData("MESSAGE", "保存成功");
        } catch (Exception e) {
            context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
            context.getResponse().putData("MESSAGE", "保存失败" + e);
            ServiceLog.error("保存人脸到红名单库失败", e);
        }
    }

    @Override
    public int importRedList(RequestContext context, List<Map<String, Object>> successList, List<String> failList, Map<String, String> importErrorMsgCache) throws Exception {
        int successCount = 0;
        //修改整体获取逻辑,改由配置获取，而不是从缓存内获取全部算法
        List<Integer> algoTypeList = algoDao.getAlgorithNameList(Constants.RED_LIST_MENUID).stream().map(f -> Integer.parseInt(StringUtil.toString(f.get("ALGORITHM_ID"))))
                .collect(Collectors.toList());
        for (Map<String, Object> successMap : successList) {
            FaceFeatureUtil.FeatureResp featureResp = FaceFeatureUtil.faceQualityCheck(ModuleUtil.renderImage(StringUtil.toString(successMap.get("PIC"))));
            if (!featureResp.isValid()) {
                failList.add(successMap.get("FILE_NAME") + "人脸质量检测失败，原因：" + featureResp.getErrorMsg());
                ServiceLog.error("人脸质量检测不通过，原因：" + featureResp.getErrorMsg());
                continue;
            }
            Map<Long, String> features = new HashMap<Long, String>();
            long personId = EAP.keyTool.getIDGenerator();
            String rltz = featureResp.getRltz();
            features.put(personId, rltz);

            successMap.put("INFO_ID", StringUtil.toString(personId));
            successMap.put("CREATOR", context.getUserCode());
            successMap.put("CREATE_TIME", DateUtil.getDateTime());
            successMap.put("RLTZ", rltz);
            successMap.put("PIC_QUALITY", featureResp.getScore());

            try {
                /*CollisionResult saveFaceResult = SdkStaticLibUtil.saveFaceToLib(Constants.STATIC_LIB_ID_RED_LIST, features);
                if (saveFaceResult == null || saveFaceResult.getCode() != 0) {
                    failList.add(successMap.get("FILE_NAME") + "注册到库失败");
                    continue;
                }*/
                for (int algoType : algoTypeList) {
                    CollisionResult result = SdkStaticLibUtil.saveFaceToLib(Constants.STATIC_LIB_ID_RED_LIST, personId, featureResp.getRltz(), algoType);
                    if (result.getCode() != Constants.COLLISISON_RESULT_SUCCESS) {
                        failList.add(successMap.get("FILE_NAME") + "注册到库失败," + result.getMessage());
                        continue;
                    }
                }
                dao.add(successMap);
                successCount++;
            } catch (Exception e) {
                ServiceLog.error(e);
                failList.add(successMap.get("FILE_NAME") + "入库或注册到库失败," + e.getMessage());
            }
        }
        return successCount;
    }
}
