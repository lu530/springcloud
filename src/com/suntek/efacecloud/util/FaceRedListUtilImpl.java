package com.suntek.efacecloud.util;

import com.suntek.eap.EAP;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.metadata.Dao;
import com.suntek.eap.metadata.DaoProxy;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceAlgorithmNameDao;
import com.suntek.efacecloud.dao.FaceRedListDao;
import com.suntek.face.compare.sdk.model.CollisionResult;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class FaceRedListUtilImpl implements FaceRedListUtil {
    
    private FaceRedListDao dao = new FaceRedListDao();
    
    private FaceAlgorithmNameDao algoDao = new FaceAlgorithmNameDao();
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
    
        Dao dao = new DaoProxy(Constants.APP_NAME);
        if (!StringUtil.isEmpty(infoId)) {
        
            CollisionResult deleteFaceResult = SdkStaticLibUtil.deleteFace(
                    Constants.STATIC_LIB_ID_RED_LIST, infoId, Constants.DEFAULT_ALGO_TYPE);
            if (deleteFaceResult == null || deleteFaceResult.getCode() != 0) {
                context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                context.getResponse().putData("MESSAGE", "从静态小库注销人脸失败！");
                return;
            }
        
            dao.addSQL("delete from EFACE_RED_LIST where INFO_ID = ?", infoId);
            dao.addSQL("update EFACE_SEARCH_TASK set IS_APPROVE = 1 where TASK_ID in ("
                    + "select TASK_ID from EFACE_SEARCH_TASK_RED_LIST where INFO_ID = ? )", infoId);
            dao.addSQL("delete from EFACE_SEARCH_TASK_RED_LIST where INFO_ID = ?", infoId);
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
            if (saveFaceResult == null || saveFaceResult.getCode() !=0) {
                context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                context.getResponse().putData("MESSAGE", "注册人脸到静态小库失败！");
                return;
            }
        
            String sql = "insert into EFACE_RED_LIST(INFO_ID, NAME, SEX, PIC, IDENTITY_TYPE, IDENTITY_ID, BIRTHDAY, "
                    + "PERMANENT_ADDRESS, PRESENT_ADDRESS, PIC_QUALITY, CREATOR, CREATE_TIME, RLTZ ) values (:INFO_ID, :NAME, :SEX, "
                    + ":PIC, :IDENTITY_TYPE, :IDENTITY_ID, :BIRTHDAY, :PERMANENT_ADDRESS, :PRESENT_ADDRESS, :PIC_QUALITY, "
                    + ":CREATOR, :CREATE_TIME, :RLTZ)";
        
            dao.addNamedSQL(sql, params);
        
            dao.commit();
        
            context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
            context.getResponse().putData("MESSAGE", "保存成功");
        } catch (Exception e) {
            context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
            context.getResponse().putData("MESSAGE", "保存失败" + e);
            ServiceLog.error("保存人脸到红名单库失败", e);
        }
    }
    
    @Override
    public int importRedList(RequestContext context, List<Map<String,Object>> successList,List<String> failList, Map<String,String> importErrorMsgCache) throws Exception {
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
                for(int algoType : algoTypeList) {
                    CollisionResult result = SdkStaticLibUtil.saveFaceToLib(Constants.STATIC_LIB_ID_RED_LIST, personId, featureResp.getRltz(), algoType);
                    if(result.getCode() != Constants.COLLISISON_RESULT_SUCCESS){
                        failList.add(successMap.get("FILE_NAME") + "注册到库失败," + result.getMessage());
                        continue;
                    }
                }
                dao.add(successMap);
                successCount ++;
            } catch (Exception e) {
                ServiceLog.error(e);
                failList.add(successMap.get("FILE_NAME") + "入库或注册到库失败," + e.getMessage());
            }
        }
        return successCount;
    }
}
