package com.suntek.efacecloud.util;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.hikvision.artemis.sdk.ArtemisHttpUtil;
import com.hikvision.artemis.sdk.config.ArtemisConfig;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.index.SearchEngineException;
import com.suntek.eap.util.StringUtil;
import com.suntek.face.compare.sdk.model.CollisionResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 海康红名单静态库管理工具类
 * EFACE_RED_LIST表及EFACE_SEARCH_TASK_RED_LIST的
 * INFO_ID 原varchar(32)改为varchar(100)
 * alter table EFACE_RED_LIST modify column INFO_ID varchar(100) null;
 * alter table EFACE_SEARCH_TASK_RED_LIST modify column INFO_ID varchar(100) null;
 *
 * @author lx
 * @version 2019年1月7日 Copyright (C)2019, pcitech
 * @since 1.0
 */
public class HikSdkRedLibUtil {

    private static final Logger logger = LoggerFactory.getLogger(HikSdkRedLibUtil.class);

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

    static {
        ArtemisConfig.host = artemisHost;
        ArtemisConfig.appKey = artemisAppKey;
        ArtemisConfig.appSecret = artemisAppSecret;
    }

    /**
     * 判断静态小库是否存在
     *
     * @param libraryId
     * @return
     * @throws Exception
     * @throws
     * @throws SearchEngineException
     */
    public static CollisionResult isLibExist(String libraryId) {
        Map<String, String> map = new HashMap<String, String>();
        map.put("listLibId", libraryId);
        map.put("typeId", StringUtil.toString(HIK_DB_TYPE_STATIC_LIB));
        logger.debug("判断静态小库是否存在参数：" + map);

        String getCamsApi = ARTEMIS_PATH + "/api/fms/v2/listLib/findListLib";
        Map<String, String> path = new HashMap<String, String>(2) {
            {
                put("https://", getCamsApi);
            }
        };

        String result = ArtemisHttpUtil.doPostStringArtemis(path, null, map, null, APPLICATION_JSON_UTF_8);
        logger.debug("调用海康查询名单库接口返回结果：" + result);

        CollisionResult collisionResult = new CollisionResult();
        JSONObject returnData = JSONObject.parseObject(result);
        if (returnData.containsKey("code")) {
            String code = StringUtil.toString(returnData.get("code"));
            collisionResult.setCode(Integer.parseInt(code));
            List<Object> paramList = new ArrayList<Object>();
            boolean exist = false;
            if (HikStatusCode.成功.getCode() == Long.valueOf(code)) {
                JSONObject resultData = returnData.getJSONObject("data");
                String total = StringUtil.toString(resultData.get("total"));
                int totalInt = Integer.parseInt(total);
                if (totalInt >= 1) {
                    exist = true;
                }
            }

            paramList.add(exist);
            collisionResult.setList(paramList);
        } else {
            String status = StringUtil.toString(returnData.get("status"));
            collisionResult.setCode(Integer.parseInt(status));
            collisionResult.setMessage("调用海康接口异常：" + HikStatusCode.getName(Long.valueOf(status)).name());
        }

        //logger.debug("判断静态小库是否存在返回结果："+ JSONObject.toJSONString(collisionResult));

        return collisionResult;
    }

    /**
     * 删除静态小库
     *
     * @param libraryId
     * @return
     * @throws SearchEngineException
     */
    public static CollisionResult deleteLib(String libraryId) {
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("listLibId", libraryId);
        logger.debug("删除静态小库检索参数：" + map);

        String getCamsApi = ARTEMIS_PATH + "/api/fms/v2/listLib/deleteListLib";
        Map<String, String> path = new HashMap<String, String>(2) {
            {
                put("https://", getCamsApi);
            }
        };

        String result = ArtemisHttpUtil.doPostStringArtemis(path, JSON.toJSONString(map), null, null, APPLICATION_JSON_UTF_8);
        logger.debug("调用海康删除名单库接口返回结果：" + result);

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

        //logger.debug("删除静态小库返回结果："+ JSONObject.toJSONString(collisionResult));

        return collisionResult;
    }

    /**
     * 传参方式注册人脸到静态小库
     *
     * @param libraryId
     * @return
     * @throws SearchEngineException
     */
    public static CollisionResult saveFaceToLib(String libraryId, Map<String, Object> personMap) {
        Map<Object, Object> params = new HashMap<>();

        String humanName = StringUtil.toString(personMap.get("NAME"));
        params.put("humanName", humanName);

        String sex = StringUtil.toString(personMap.get("SEX"), "0");
        params.put("sex", sex);

        String birthday = StringUtil.toString(personMap.get("BIRTHDAY"));
        if (!StringUtil.isEmpty(birthday)) {
            params.put("birthday", birthday);
        }

        String humanAddress = StringUtil.toString(personMap.get("PRESENT_ADDRESS"));
        if (!StringUtil.isEmpty(humanAddress)) {
            params.put("humanAddress", humanAddress);
        }

        String credentialsNum = StringUtil.toString(personMap.get("IDENTITY_ID"));
        if (!StringUtil.isEmpty(credentialsNum)) {
            params.put("credentialsNum", credentialsNum);
        }

        String credentialsType = StringUtil.toString(personMap.get("IDENTITY_TYPE"), "0");
        params.put("credentialsType", credentialsType);

        String picUrl = StringUtil.toString(personMap.get("PIC"));
        params.put("picUrl", picUrl);

        String listLibId = StringUtil.toString(libraryId);
        params.put("listLibId", listLibId);

        logger.debug("传参方式注册人脸到静态小库参数：" + params);

        String getCamsApi = ARTEMIS_PATH + "/api/fms/v2/staticlist/addRecord";
        Map<String, String> path = new HashMap<String, String>(2) {
            {
                put("https://", getCamsApi);
            }
        };

        String result = ArtemisHttpUtil.doPostStringArtemis(path, JSON.toJSONString(params), null, null, APPLICATION_JSON_UTF_8);
        logger.debug("调用海康新增静态库人员接口返回结果：" + result);

        CollisionResult collisionResult = new CollisionResult();
        collisionResult.setList(new ArrayList<Object>());
        JSONObject returnData = JSONObject.parseObject(result);
        if (returnData.containsKey("code")) {
            String code = StringUtil.toString(returnData.get("code"));
            String msg = StringUtil.toString(returnData.get("msg"));
            if (HikStatusCode.成功.getCode() == Long.valueOf(code)) {
                JSONObject resultData = returnData.getJSONObject("data");
                String humanId = StringUtil.toString(resultData.get("humanId"));
                personMap.put("INFO_ID", humanId);
            }
            collisionResult.setCode(Integer.parseInt(code));
            collisionResult.setMessage(msg);
        } else {
            String status = StringUtil.toString(returnData.get("status"));
            collisionResult.setCode(Integer.parseInt(status));
            collisionResult.setMessage("调用海康接口异常：" + HikStatusCode.getName(Long.valueOf(status)).name());
        }

        //logger.debug("传参方式注册人脸到静态小库返回结果："+ JSONObject.toJSONString(collisionResult));

        return collisionResult;
    }

    /**
     * 修改红名单人脸
     *
     * @param libraryId
     * @return
     * @throws SearchEngineException
     */
    public static CollisionResult updateFaceToLib(String libraryId, Map<String, Object> personMap) {
        Map<Object, Object> params = new HashMap<>();

        String humanName = StringUtil.toString(personMap.get("NAME"));
        params.put("humanName", humanName);

        String sex = StringUtil.toString(personMap.get("SEX"), "0");
        params.put("sex", sex);

        String birthday = StringUtil.toString(personMap.get("BIRTHDAY"));
        if (!StringUtil.isEmpty(birthday)) {
            params.put("birthday", birthday);
        }

        String humanAddress = StringUtil.toString(personMap.get("PRESENT_ADDRESS"));
        if (!StringUtil.isEmpty(humanAddress)) {
            params.put("humanAddress", humanAddress);
        }

        String credentialsNum = StringUtil.toString(personMap.get("IDENTITY_ID"));
        if (!StringUtil.isEmpty(credentialsNum)) {
            params.put("credentialsNum", credentialsNum);
        }

        String credentialsType = StringUtil.toString(personMap.get("IDENTITY_TYPE"), "0");
        params.put("credentialsType", credentialsType);

        String picUrl = StringUtil.toString(personMap.get("PIC"));
        params.put("picUrl", picUrl);

        String listLibId = StringUtil.toString(libraryId);
        params.put("listLibId", listLibId);

        String humanId = StringUtil.toString(personMap.get("INFO_ID"));
        params.put("humanId", humanId);

        logger.debug("修改红名单人脸参数：" + params);

        String getCamsApi = ARTEMIS_PATH + "/api/fms/v2/staticlist/modifyRecord";
        Map<String, String> path = new HashMap<String, String>(2) {
            {
                put("https://", getCamsApi);
            }
        };

        String result = ArtemisHttpUtil.doPostStringArtemis(path, JSON.toJSONString(params), null, null, APPLICATION_JSON_UTF_8);
        logger.debug("调用海康修改静态库人员接口返回结果：" + result);

        CollisionResult collisionResult = new CollisionResult();
        collisionResult.setList(new ArrayList<Object>());
        JSONObject returnData = JSONObject.parseObject(result);
        if (returnData.containsKey("code")) {
            String code = StringUtil.toString(returnData.get("code"));
            String msg = StringUtil.toString(returnData.get("msg"));
            if (HikStatusCode.成功.getCode() == Long.valueOf(code)) {
                JSONObject resultData = returnData.getJSONObject("data");
                humanId = StringUtil.toString(resultData.get("humanId"));
                personMap.put("INFO_ID", humanId);
            }
            collisionResult.setCode(Integer.parseInt(code));
            collisionResult.setMessage(msg);
        } else {
            String status = StringUtil.toString(returnData.get("status"));
            collisionResult.setCode(Integer.parseInt(status));
            collisionResult.setMessage("调用海康接口异常：" + HikStatusCode.getName(Long.valueOf(status)).name());
        }

        //logger.debug("修改红名单人脸返回结果："+ JSONObject.toJSONString(collisionResult));

        return collisionResult;
    }

    /**
     * 从静态小库注销人脸
     *
     * @param libraryId
     * @return
     * @throws SearchEngineException
     */
    public static CollisionResult deleteFace(String libraryId, String humanId) {
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

    /**
     * 静态库1：N
     *
     * @param libraryId
     * @return
     * @throws Exception
     * @throws
     * @throws SearchEngineException
     */
    public static CollisionResult faceOne2NSearch(String libraryId, Map<String, Object> map) {

        Map<String, String> params = new HashMap<>();
        params.put("pageNo", "1");

        String pageSize = StringUtil.toString(map.get("TOP_N"));
        params.put("pageSize", pageSize);

        String picUrl = StringUtil.toString(map.get("PIC"));
        params.put("picUrl", picUrl);

        String threshold = StringUtil.toString(map.get("THRESHOLD"));
        params.put("similarityMin", threshold);
        params.put("similarityMax", StringUtil.toString(Constants.HIK_SIMILARITY_MAX));
        params.put("picUrl", picUrl);
        params.put("listLibIds", libraryId);

        logger.debug("静态库1：N参数：" + map);

        String getCamsApi = ARTEMIS_PATH + "/api/fms/v3/human/findStaticHuman";
        Map<String, String> path = new HashMap<String, String>(2) {
            {
                put("https://", getCamsApi);
            }
        };

        String result = ArtemisHttpUtil.doPostStringArtemis(path, JSON.toJSONString(params), null, null, APPLICATION_JSON_UTF_8);
        logger.debug("调用海康静态库1：N接口返回结果：" + result);

        CollisionResult collisionResult = new CollisionResult();
        JSONObject returnData = JSONObject.parseObject(result);

        if (returnData.containsKey("code")) {
            String code = StringUtil.toString(returnData.get("code"));
            String msg = StringUtil.toString(returnData.get("msg"));
            collisionResult.setCode(Integer.parseInt(code));
            collisionResult.setMessage(msg);
            if (HikStatusCode.成功.getCode() == Long.valueOf(code)) {
                JSONObject resultData = returnData.getJSONObject("data");
                JSONArray list = resultData.getJSONArray("list");
                List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
                for (int i = 0; i < list.size(); i++) {
                    Map<String, Object> returnMap = new HashMap<String, Object>();
                    JSONObject listData = list.getJSONObject(i);
                    String humanId = listData.getString("humanId");
                    String similarity = listData.getString("similarity");
                    returnMap.put("ID", humanId);
                    returnMap.put("SIMILARITY", (int) (Float.parseFloat(similarity) * 100));
                    returnList.add(returnMap);
                }
                collisionResult.setList(returnList);
            }
        } else {
            String status = StringUtil.toString(returnData.get("status"));
            collisionResult.setCode(Integer.parseInt(status));
            collisionResult.setMessage("调用海康接口异常：" + HikStatusCode.getName(Long.valueOf(status)).name());
        }

        //logger.debug("静态库1：N返回结果："+ JSONObject.toJSONString(collisionResult));

        return collisionResult;
    }
}
