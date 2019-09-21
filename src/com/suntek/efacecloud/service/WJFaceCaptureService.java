package com.suntek.efacecloud.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;

import com.alibaba.fastjson.JSONArray;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.FaceDispatchedAlarmDao;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.DeviceInfoUtil;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;


/**
 * 从基线FaceCaptureProvider代码拉出来兼容外籍人项目(外籍人路人检索以图搜图流程)
 * 
 * @author zhangyongtao
 * @since
 * @version 2019年8月23日
 */

public class WJFaceCaptureService {

    private FaceDispatchedAlarmDao dao = new FaceDispatchedAlarmDao();

    @SuppressWarnings("unchecked")
    public Map<String, Object> searchByPic(RequestContext context) throws Exception {

        Map<String, Object> params = context.getParameters();

        String vendor = AppHandle.getHandle(Constants.OPENGW).getProperty("EAPLET_VENDOR", "Suntek");

        String deviceIds = StringUtil.toString(params.get("DEVICE_IDS"));

        Map<String, Object> image = new HashMap<>();
        if (!StringUtil.isNull(deviceIds)) {
            params.put("DEVICE_ID_LIST", Arrays.asList(deviceIds.split(",")));
        }
        image.put("URL", context.getParameter("PIC"));
        params.put("IMAGE", image);
        params.put("SCORE", context.getParameter("THRESHOLD"));
        String algoListStr = StringUtil.toString(context.getParameter("ALGO_LIST"));
        JSONArray algoJsonArr = JSONArray.parseArray(algoListStr);
        params.put("ALGO_LIST", algoJsonArr);

        Registry registry = Registry.getInstance();

        // 添加来源字段
        String sourceType = StringUtil.toString(params.get("SOURCE_TYPE"));
        Map<String, Object> map = new HashMap<>();

        // 外籍人项目多算法1比n调用直接返回(无华云)
        if (!algoListStr.contains(Constants.HUAYUN_ALGO)) {
            CommandContext cc = new CommandContext("admin", "localhost");
            cc.setBody(context.getParameters());
            registry.selectCommand(BaseCommandEnum.mulitAlgoFaceCaptureOneToN.getUri(), "4401", vendor).exec(cc);
            if (cc.getResponse().getCode() != 0L) {
                ServiceLog.error("调用开放平台多算法以图搜图异常：" + cc.getResponse().getMessage());
                context.getResponse().setError("调用开放平台多算法以图搜图异常:" + cc.getResponse().getMessage());
                map.put("LIST", Collections.emptyList());
            } else {
                List<Map<String, Object>> tempResultList
                    = (List<Map<String, Object>>)cc.getResponse().getData("ALGO_LIST");
                renderResult(sourceType, tempResultList, map);
            }
            return map;
        }

        List<Map<String, Object>> tempResultList = new ArrayList<>();
        // 外籍人项目多算法1比n调用并且合并华云1比n结果(包含华云和多算法)
        if (algoJsonArr.size() > 1) {
            CommandContext cc = new CommandContext("admin", "localhost");
            cc.setBody(context.getParameters());
            registry.selectCommand(BaseCommandEnum.mulitAlgoFaceCaptureOneToN.getUri(), "4401", vendor).exec(cc);
            if (cc.getResponse().getCode() != 0L) {
                ServiceLog.error("调用开放平台多算法以图搜图异常：" + cc.getResponse().getMessage());
                context.getResponse().setError("调用开放平台多算法以图搜图异常:" + cc.getResponse().getMessage());
            } else {
                tempResultList = (List<Map<String, Object>>)cc.getResponse().getData("ALGO_LIST");
            }
        }

        // 外籍人项目自己算法只有华云，调华云以图搜图合并tempResultList结果 TODO 待优化
        JSONArray ownAlgoList = new JSONArray();
        for (int i = 0; i < algoJsonArr.size(); i++) {
            if (Constants.HUAYUN_ALGO.equals(algoJsonArr.getJSONObject(i).getString("ALGO_TYPE"))) {
                ownAlgoList.add(algoJsonArr.getJSONObject(i));
                break;
            }
        }
        params.put("ALGO_LIST", ownAlgoList);

        // 通过上传图片调用开放平台人脸属性提取服务开始 2018年9月4日 陈文杰添加
        /* String faceTypeAlgoTypes = AppHandle.getHandle(Constants.APP_NAME).getProperty("FACE_TYPE_ALGO_TYPES", "");
        String isSearchFace = StringUtil.toString(params.get("PIC"));
        ServiceLog.info("ALGO_LIST:" + params.get("ALGO_LIST"));
        ServiceLog.info("FACE_TYPE_ALGO_TYPES:" + faceTypeAlgoTypes);
        if (!faceTypeAlgoTypes.equals("")) {
        
            Map<String, String> searchAlgoMap = new HashMap<String, String>();
            for (int i = 0; i < ownAlgoList.size(); i++) {
                JSONObject searchAlgoJsonObject = ownAlgoList.getJSONObject(i);
                searchAlgoMap.put(searchAlgoJsonObject.get("ALGO_TYPE").toString(),
                    searchAlgoJsonObject.get("THRESHOLD").toString());
            }
            ServiceLog.info("前端需要查询的算法列表:" + searchAlgoMap);
            CommandContext commandContext = new CommandContext(context.getHttpRequest());
            params.put("fileUrl", isSearchFace);
            params.put("algoType", faceTypeAlgoTypes);// 分类算法
            commandContext.setBody(params);
            registry.selectCommand(BaseCommandEnum.faceAttributesExtract.getUri(), "4401", vendor).exec(commandContext);
            if (commandContext.getResponse().getCode() != 0L) {
                ServiceLog.error("调用开放平台人脸属性提取服务出错" + commandContext.getResponse().getMessage());
            } else {
                JSONObject structInfo
                    = JSONObject.parseObject(StringUtil.toString(commandContext.getResponse().getData("struct_info")));
                String race = StringUtil.toString(structInfo.get("race"));// 照片的种族
                ServiceLog.info("照片的种族:" + race);
                List<Map<String, Object>> algorithmList = commonDao.getAlgorithmByRace(race);
                JSONArray algoArray = new JSONArray();
                for (Map<String, Object> algoMap : algorithmList) {
                    JSONObject algoObject = new JSONObject();
                    algoObject.put("ALGO_TYPE", algoMap.get("ALGORITHM_ID"));
                    algoObject.put("THRESHOLD", searchAlgoMap.get(algoMap.get("ALGORITHM_ID")));
                    algoArray.add(algoObject);
                }
                if (algoArray.size() > 0) {
                    ServiceLog.info("种族[" + race + "]路由查询到的特征提取算法：" + algoArray);
                    context.putParameter("ALGO_LIST", algoArray);
                } else {
                    ServiceLog.info("未配置种族特征提取算法路由");
                }
                ServiceLog.info("请求参数:" + context.getParameters());
            }
        
        }*/

        CommandContext commandContext = new CommandContext(context.getHttpRequest());
        commandContext.setBody(context.getParameters());
        registry.selectCommand(BaseCommandEnum.faceCapture.getUri(), "4401", vendor).exec(commandContext);

        if (commandContext.getResponse().getCode() != 0L) {
            ServiceLog.error("调用开放平台服务出错" + commandContext.getResponse().getMessage());
            context.getResponse().setError(commandContext.getResponse().getMessage());
            map.put("LIST", Collections.emptyList());
        } else {
            tempResultList.addAll((List<Map<String, Object>>)commandContext.getResponse().getData("ALGO_LIST"));
            renderResult(sourceType, tempResultList, map);
        }
        return map;
    }

    /**
     * 
     * @param sourceType
     * @param tempResultList
     * @param map
     */
    @SuppressWarnings("unchecked")
    private void renderResult(String sourceType, List<Map<String, Object>> tempResultList, Map<String, Object> map) {
        List<Map<String, Object>> resultList = new ArrayList<>();

        boolean isAdd = !StringUtil.isEmpty(sourceType);
        for (Map<String, Object> algoDataMap : tempResultList) {
            Map<String, Object> tempMap = new HashMap<String, Object>();

            ServiceLog.info("路人库检索返回的行数据：" + algoDataMap);
            ArrayList<Map<String, Object>> algoList = (ArrayList<Map<String, Object>>)algoDataMap.get("LIST");
            String algorithmCode = StringUtil.toString(algoDataMap.get("ALGO_CODE"));
            Map<Object, Object> algoMap = ModuleUtil.getAlgorithmById(Integer.valueOf(algorithmCode));
            String algorithmName = StringUtil.toString(algoMap.get("ALGORITHM_NAME"));
            List<Map<String, Object>> infoList = algoList;

            if (infoList.size() == 0) {
                ServiceLog.debug("算法代码为" + algorithmCode + "的算法" + algorithmName + "数据为空,过滤掉该算法返回");
                continue;
            }
            Map<String, Map<String, Object>> idGriupMap = new HashMap<String, Map<String, Object>>();
            if (isAdd) {
                Set<String> set
                    = infoList.stream().map(o -> StringUtil.toString(o.get("DEVICE_ID"))).collect(Collectors.toSet());
                idGriupMap = DeviceInfoUtil.queryDeviceGroupByIds(String.join(",", set));
            }
            for (Map<String, Object> info : infoList) {
                String createTime = StringUtil.toString(info.get("CREATETIME"));
                if (!StringUtil.isEmpty(createTime)) {
                    createTime
                        = DateUtil.convertByStyle(createTime, DateUtil.yyMMddHHmmss_style, DateUtil.standard_style);
                }
                info.put("CREATETIME", createTime);
                String infoId = StringUtil.toString(info.get("INFO_ID"));
                try {
                    if (!StringUtils.isBlank(infoId)) {
                        List<Map<String, Object>> actList = dao.queryActivityInfo(infoId);
                        for (Map<String, Object> actMap : actList) {
                            info.putAll(actMap);
                        }
                    }
                } catch (Exception e) {
                    ServiceLog.error("不存在activity_info表: " + e);
                }
                // 是否添加来源类型
                if (isAdd) {
                    Map<String, Object> devideGroup = idGriupMap.get(info.get("DEVICE_ID"));
                    info.put("SOURCE_TYPE", devideGroup == null ? "未知" : devideGroup.get("groupId"));
                    info.put("SOURCE_NAME", devideGroup == null ? "未知" : devideGroup.get("name"));
                }
            }
            tempMap.put("ALGORITHM_CODE", algorithmCode);
            tempMap.put("ALGORITHM_ANME", algorithmName);
            tempMap.put("ALGORITHM_LIST", infoList);
            resultList.add(tempMap);
        }
        map.put("LIST", resultList);
    }
}
