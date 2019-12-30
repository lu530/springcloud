package com.suntek.efacecloud.service.redlist;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.hikvision.artemis.sdk.ArtemisHttpUtil;
import com.hikvision.artemis.sdk.config.ArtemisConfig;
import com.suntek.eap.EAP;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.DateUtil;
import com.suntek.efacecloud.util.HikSdkRedLibUtil;
import com.suntek.efacecloud.util.HikStatusCode;
import com.suntek.face.compare.sdk.model.CollisionResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class HikFaceRedListService extends FaceRedListService {

    private static final Logger logger = LoggerFactory.getLogger(HikFaceRedListService.class);


    /**
     * artemis网关服务器ip端口
     */
    private static String artemisHost = AppHandle.getHandle(Constants.OPENGW).getProperty("HIK_VCM_HOST",
            "open8200.hikvision.com");

    /**
     * 秘钥appkey
     */
    private static String artemisAppKey = AppHandle.getHandle(Constants.OPENGW).getProperty("HIK_APP_KEY",
            "25053170");

    /**
     * 秘钥appSecret
     */
    private static String artemisAppSecret = AppHandle.getHandle(Constants.OPENGW).getProperty("HIK_APP_SECRET",
            "P5orxWCOURaR6mj7Xe6Q");

    /**
     * 能力开放平台的网站路径
     */
    private static final String ARTEMIS_PATH = "/artemis";

    private static final String APPLICATION_JSON_UTF_8 = "application/json;charset=UTF-8";

    /**
     * 海康名单库类型：3（静态库）
     **/
    private static final int HIK_DB_TYPE_STATIC_LIB = 3;

    private static volatile boolean isInit = false;

    public HikFaceRedListService() {
        if (!isInit) {
            ArtemisConfig.host = artemisHost;
            ArtemisConfig.appKey = artemisAppKey;
            ArtemisConfig.appSecret = artemisAppSecret;
            isInit = true;
        }
    }

    @Override
    public CollisionResult faceOne2NSearch(RequestContext context, String pic) {
        String threshold = StringUtil.toString(context.getParameter("THRESHOLD")); //阈值
        Map<String, Object> params = new HashMap<>();
        params.put("TOP_N", 30);
        params.put("PIC", pic);
        params.put("THRESHOLD", "0." + threshold);
        CollisionResult collisionResult = HikSdkRedLibUtil.faceOne2NSearch(Constants.STATIC_LIB_ID_RED_LIST, params);
        return collisionResult;
    }

    @Override
    public void initRedListLib() {

    }

    @Override
    public CollisionResult deleteFace(RequestContext context) {
        String humanId = StringUtil.toString(context.getParameters().get("INFO_ID"));
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("humanId", humanId);

        logger.debug("删除人脸参数：" + map);

        String getCamsApi = ARTEMIS_PATH + "/api/fms/v2/staticlist/deleteRecord";
        Map<String, String> path = new HashMap<String, String>(2) {
            {
                put("https://", getCamsApi);
            }
        };

        String result = ArtemisHttpUtil.doPostStringArtemis(path, JSON.toJSONString(map), null, null, APPLICATION_JSON_UTF_8);

        logger.debug("调用海康删除静态库人员接口返回结果：" + result);

        CollisionResult collisionResult = new CollisionResult();
        collisionResult.setList(new ArrayList<Object>());
        JSONObject returnData = JSONObject.parseObject(result);
        if (returnData.containsKey("code")) {
            String code = StringUtil.toString(returnData.get("code"));
            String msg = StringUtil.toString(returnData.get("msg"));
            collisionResult.setCode(Integer.parseInt(code));
            collisionResult.setMessage(msg);
        } else {
            String status = StringUtil.toString(returnData.get("status"));
            collisionResult.setCode(Integer.parseInt(status));
            collisionResult.setMessage("调用海康接口异常：" + HikStatusCode.getName(Long.valueOf(status)).name());
        }

        return collisionResult;
    }

    @Override
    public void addOrEdit(RequestContext context) throws Exception {
        Map<String, Object> params = context.getParameters();
        String infoId = StringUtil.toString(params.get("INFO_ID"));

        if (!StringUtil.isEmpty(infoId)) {
            CollisionResult deleteFaceResult = this.deleteFace(context);
            if (deleteFaceResult == null || deleteFaceResult.getCode() != 0) {
                context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                context.getResponse().putData("MESSAGE", "从静态库注销人脸失败！" + deleteFaceResult.getMessage());
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

            CollisionResult saveFaceResult = HikSdkRedLibUtil.saveFaceToLib(Constants.STATIC_LIB_ID_RED_LIST, params);
            if (saveFaceResult == null || saveFaceResult.getCode() != 0) {
                context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
                context.getResponse().putData("MESSAGE", "注册人脸到静态库失败！" + saveFaceResult.getMessage());
                return;
            }

            params.put("RLTZ", "");
            params.put("PIC_QUALITY", 0);

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
                successCount++;
            } catch (Exception e) {
                ServiceLog.error(e);
                failList.add(successMap.get("FILE_NAME") + "入库或注册到库失败," + e.getMessage());
            }
        }
        return successCount;
    }
}
