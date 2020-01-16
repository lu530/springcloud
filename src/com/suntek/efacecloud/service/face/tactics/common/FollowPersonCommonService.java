package com.suntek.efacecloud.service.face.tactics.common;

import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.IDGenerator;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FollowPersonCommonService {

    /**
     * 把内容构建成前端所需
     *
     * @param context
     * @param persons
     * @return
     * @throws Exception
     */
    public List<Map<String, Object>> buildResult(RequestContext context, List<?> persons) throws Exception {
        List<Map<String, Object>> resultList = new ArrayList<>();// 返回到前端的结果集
        Registry registry = Registry.getInstance();
        String vendor = ConfigUtil.getVendor();
        CommandContext commandContext = new CommandContext(context.getHttpRequest());

        for (int i = 0; i < persons.size(); i++) {
            if (persons.get(i) instanceof HashMap) {
                HashMap map = (HashMap) persons.get(i);
                String idStr = (String) map.get("IDS");

                commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());

                Map<String, Object> queryParams = new HashMap<String, Object>();
                queryParams.put("IDS", idStr);
                commandContext.setBody(queryParams);
                ServiceLog.debug("调用sdk反查记录参数:" + queryParams);
                registry.selectCommand(BaseCommandEnum.faceQueryByIds.getUri(), "4401",
                        vendor).exec(commandContext);
                ServiceLog.debug("调用sdk反查返回结果code:" + commandContext.getResponse().getCode() + " message:"
                        + commandContext.getResponse().getMessage() + " result:"
                        + commandContext.getResponse().getResult());

                long code = commandContext.getResponse().getCode();
                if (0L != code) {
                    context.getResponse().setWarn(commandContext.getResponse().getMessage());
                    return null;
                }

                List<Map<String, Object>> list = (List<Map<String, Object>>) commandContext.getResponse().getData("DATA");
                Map<String, Object> personData = new HashMap<String, Object>();
                List infoIds = new ArrayList<>();
                List pics = new ArrayList();
                List originalPics = new ArrayList();
                List faceScores = new ArrayList();
                List devids = new ArrayList();
                List times = new ArrayList();
                List addrs = new ArrayList();
                List xf = new ArrayList();
                List yf = new ArrayList();
                list.stream().forEach(o -> {
                    infoIds.add(o.get("INFO_ID"));
                    pics.add(o.get("OBJ_PIC"));
                    originalPics.add(o.get("PIC"));
                    faceScores.add("0");
                    devids.add(o.get("DEVICE_ID"));
                    times.add(o.get("JGSK"));
                    addrs.add(o.get("ADDR"));
                    xf.add(StringUtil.toString(o.get("X")));
                    yf.add(StringUtil.toString(o.get("Y")));
                });
                personData.put("INFO_IDS", String.join(",", infoIds));
                personData.put("PICS", String.join(",", pics));
                personData.put("BIG_PIC", String.join(",", originalPics));
                personData.put("DEVIDS", String.join(",", devids));
                personData.put("TIMES", String.join(",", times));
                personData.put("ADDRS", String.join(",", addrs));
                personData.put("REPEATS", map.get("REPEATS"));
                personData.put("XS", String.join(",", xf));
                personData.put("YS", String.join(",", yf));
                personData.put("NAMES", String.join(",", addrs));
                personData.put("FACE_SCORES", String.join(",", faceScores));
                resultList.add(personData);
            } else {
                List<Object> ids = (List<Object>) persons.get(i); // 一个人员出现列表的主键id集合
                resultList.add(handlePersonId(ids));
            }
        }
        return resultList;
    }

    /**
     * 反查人员信息
     *
     * @param ids
     * @return
     */
    private Map<String, Object> handlePersonId(List<Object> ids) {

        Map<String, Object> personData = new HashMap<String, Object>();
        StringBuffer infoIds = new StringBuffer();
        StringBuffer pics = new StringBuffer();
        StringBuffer originalPics = new StringBuffer();
        StringBuffer faceScores = new StringBuffer();
        StringBuffer devids = new StringBuffer();
        StringBuffer times = new StringBuffer();
        StringBuffer addrs = new StringBuffer();
        StringBuffer xf = new StringBuffer();
        StringBuffer yf = new StringBuffer();

        String[] idsArr = ModuleUtil.listArrToStrArr(ids);

        String[] indexName = new IDGenerator().getIndexNameFromIds(Constants.FACE_INDEX + "_", idsArr);

        try {

            PageQueryResult pageResult = EAP.bigdata.queryByIds(indexName, Constants.FACE_TABLE, idsArr);
            List<Map<String, Object>> resultSet = pageResult.getResultSet();

            Log.fanchaLog.debug("1 同伙分析 反查 条件主键id->" + ids);
            Log.fanchaLog.debug("2 同伙分析 反查 查询结果-> " + resultSet + "\n");

            Collections.sort(resultSet, new Comparator<Map<String, Object>>() {
                @Override
                public int compare(Map<String, Object> o1, Map<String, Object> o2) {
                    return StringUtil.toString(o2.get("JGSK")).compareTo(StringUtil.toString(o1.get("JGSK")));
                }
            });

            for (int i = 0; i < resultSet.size(); i++) {
                Map<String, Object> map = resultSet.get(i);

                infoIds.append(map.get("INFO_ID") + ",");
                faceScores.append(StringUtil.toString(map.get("FACE_SCORE")) + ",");
                pics.append(ModuleUtil.renderImage(StringUtil.toString(map.get("OBJ_PIC"))) + ",");
                originalPics.append(ModuleUtil.renderImage(StringUtil.toString(map.get("PIC"))) + ",");
                devids.append(StringUtil.toString(map.get("DEVICE_ID")) + ",");


                times.append(DateUtil.convertByStyle(StringUtil.toString(map.get("JGSK")),
                        DateUtil.yyMMddHHmmss_style, DateUtil.standard_style) + ",");

                Map<Object, Object> device
                        = EAP.metadata.getDictMap(DictType.D_FACE, StringUtil.toString(map.get("DEVICE_ID")));

                addrs.append(device.get("DEVICE_ADDR") + ",");
                xf.append(device.get("LONGITUDE") + ",");
                yf.append(device.get("LATITUDE") + ",");

                if (i == resultSet.size() - 1) {
                    infoIds.deleteCharAt(infoIds.length() - 1);
                    pics.deleteCharAt(pics.length() - 1);
                    originalPics.deleteCharAt(originalPics.length() - 1);
                    devids.deleteCharAt(devids.length() - 1);
                    times.deleteCharAt(times.length() - 1);
                    addrs.deleteCharAt(addrs.length() - 1);
                    xf.deleteCharAt(xf.length() - 1);
                    yf.deleteCharAt(yf.length() - 1);
                    faceScores.deleteCharAt(faceScores.length() - 1);
                }
            }

            personData.put("INFO_IDS", infoIds);
            personData.put("PICS", pics);
            personData.put("BIG_PIC", originalPics);
            personData.put("DEVIDS", devids);
            personData.put("TIMES", times);
            personData.put("ADDRS", addrs);
            personData.put("REPEATS", resultSet.size());
            personData.put("XS", xf);
            personData.put("YS", yf);
            personData.put("NAMES", addrs);
            personData.put("FACE_SCORES", faceScores);
        } catch (Exception e) {
            ServiceLog.error("同伙分析 反查询有误:handlePersonId()", e);
        }
        return personData;
    }
}
