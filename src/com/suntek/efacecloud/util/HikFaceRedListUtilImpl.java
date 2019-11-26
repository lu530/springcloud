package com.suntek.efacecloud.util;

import com.suntek.eap.EAP;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.metadata.Dao;
import com.suntek.eap.metadata.DaoProxy;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceRedListDao;
import com.suntek.face.compare.sdk.model.CollisionResult;

import java.util.List;
import java.util.Map;

public class HikFaceRedListUtilImpl implements FaceRedListUtil {
    private FaceRedListDao dao = new FaceRedListDao();
    @Override
    public void addOrEdit(RequestContext context) throws Exception {
        Map<String, Object> params = context.getParameters();
        String infoId = StringUtil.toString(params.get("INFO_ID"));
    
        Dao dao = new DaoProxy(Constants.APP_NAME);
        if (!StringUtil.isEmpty(infoId)) {
            CollisionResult deleteFaceResult = HikSdkRedLibUtil.deleteFace(Constants.STATIC_LIB_ID_RED_LIST, infoId);
            if (deleteFaceResult == null || deleteFaceResult.getCode() != 0) {
                context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                context.getResponse().putData("MESSAGE", "从静态库注销人脸失败！" + deleteFaceResult.getMessage());
                return;
            }
        
            dao.addSQL("delete from EFACE_RED_LIST where INFO_ID = ?", infoId);
            dao.addSQL("update EFACE_SEARCH_TASK set IS_APPROVE = 1 where TASK_ID in ("
                    + "select TASK_ID from EFACE_SEARCH_TASK_RED_LIST where INFO_ID = ? )", infoId);
            dao.addSQL("delete from EFACE_SEARCH_TASK_RED_LIST where INFO_ID = ?", infoId);
        }
    
        try {
            String createTime = DateUtil.getDateTime();
        
            String newPersonId = EAP.keyTool.getUUID();
            params.put("INFO_ID", newPersonId);
            params.put("CREATE_TIME", createTime);
            params.put("CREATOR", context.getUserCode()); //创建人
        
            CollisionResult saveFaceResult = HikSdkRedLibUtil.saveFaceToLib(Constants.STATIC_LIB_ID_RED_LIST, params);
            if (saveFaceResult == null || saveFaceResult.getCode() != 0) {
                context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                context.getResponse().putData("MESSAGE", "注册人脸到静态库失败！" + saveFaceResult.getMessage());
                return;
            }
        
            params.put("RLTZ", "");
            params.put("PIC_QUALITY", 0);
        
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
    public int importRedList(RequestContext context, List<Map<String,Object>> successList,List<String> failList,  Map<String, String> importErrorMsgCache) throws Exception {
        int successCount = 0;
        for (Map<String, Object> successMap : successList) {
            long personId = EAP.keyTool.getIDGenerator();
            successMap.put("INFO_ID", StringUtil.toString(personId));
            successMap.put("CREATOR", context.getUserCode());
            successMap.put("CREATE_TIME", DateUtil.getDateTime());
            successMap.put("RLTZ", "");
            successMap.put("PIC_QUALITY", 0);
            try {
                CollisionResult saveFaceResult = HikSdkRedLibUtil.saveFaceToLib(Constants.STATIC_LIB_ID_RED_LIST, successMap);
                if (saveFaceResult == null || saveFaceResult.getCode() != 0) {
                    context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                    context.getResponse().putData("MESSAGE", "注册人脸到静态小库失败！" + saveFaceResult.getMessage());
                    return successCount;
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
