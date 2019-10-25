package com.suntek.efacecloud.service;

import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.common.util.IDGenerator;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.sp.common.common.BaseCommandEnum;
import org.apache.commons.lang.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 人员技战法-频繁出入
 *
 * @author swq
 * @version 2017年07月17日
 */
@LocalComponent(id = "technicalTactics/frequencyAccess")
public class FrequentAccessTacticsService {

    @SuppressWarnings("unchecked")
    @BeanService(id = "query", description = "频繁出入查询", since = "1.0.0")
    public void query(RequestContext context) throws Exception {

        Map<String, Object> params = context.getParameters();

        CommandContext commandContext = new CommandContext(context.getHttpRequest());

        commandContext.setServiceUri(BaseCommandEnum.frequentAccess.getUri());
        try {
            commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());
        } catch (Exception e) {
            ServiceLog.debug("外部调用");
        }

        params.put("ALGO_TYPE", ConfigUtil.getAlgoType());

        commandContext.setBody(params);

        ServiceLog.debug("调用sdk参数:" + params);

        Registry registry = Registry.getInstance();

        registry.selectCommands(commandContext.getServiceUri()).exec(commandContext);

        ServiceLog.debug("调用sdk返回结果code:" + commandContext.getResponse().getCode() + " message:"
                + commandContext.getResponse().getMessage() + " result:" + commandContext.getResponse().getResult());

        long code = commandContext.getResponse().getCode();

        if (0L != code) {
            context.getResponse().setWarn(commandContext.getResponse().getMessage());
            return;
        }

        List<List<Object>> personIds = (List<List<Object>>) commandContext.getResponse().getData("DATA");

        List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();// 返回到前端的结果集
        for (int i = 0; i < personIds.size(); i++) {
            List<Object> ids = personIds.get(i); // 一个人员出现列表的主键id集合
            resultList.add(handlePersonId(ids));
        }

        context.getResponse().putData("DATA", resultList);

    }

    @BeanService(id = "getMsgByIds", description = "获取一个人员的所有信息", since = "1.0.0")
    public void getMsgByIds(RequestContext context) throws Exception {

        String ids = StringUtil.toString(context.getParameter("IDS"));
        CommandContext commandContext = new CommandContext(context.getHttpRequest());

        commandContext.setServiceUri(BaseCommandEnum.faceQueryByIds.getUri());
        commandContext.setOrgCode(context.getUser().getDepartment().getCivilCode());

        Map<String, Object> params = new HashMap<String, Object>();
        params.put("IDS", ids);
        commandContext.setBody(params);

        ServiceLog.debug("调用sdk参数:" + params);

        Registry registry = Registry.getInstance();

        registry.selectCommands(commandContext.getServiceUri()).exec(commandContext);

        ServiceLog.debug("调用sdk返回结果code:" + commandContext.getResponse().getCode() + " message:"
                + commandContext.getResponse().getMessage() + " result:" + commandContext.getResponse().getResult());

        long code = commandContext.getResponse().getCode();

        if (0L != code) {
            context.getResponse().setWarn(commandContext.getResponse().getMessage());
            return;
        }

        context.getResponse().putData("DATA", commandContext.getResponse().getData("DATA"));

    }

    // 处理同一个的人员列表,一个数据
    private Map<String, Object> handlePersonId(List<Object> ids) {

        Map<String, Object> personData = new HashMap<String, Object>();

        String[] idsArr = ModuleUtil.listArrToStrArr(ids);
        String[] indexName = new IDGenerator().getIndexNameFromIds(Constants.FACE_INDEX + "_", idsArr);

        try {

            PageQueryResult pageResult = EAP.bigdata.queryByIds(indexName, Constants.FACE_TABLE, idsArr);
            List<Map<String, Object>> resultSet = pageResult.getResultSet();

            Log.fanchaLog.debug("1 频繁出入 反查 条件主键id->" + ids);
            Log.fanchaLog.debug("2 频繁出入 反查 查询结果-> " + resultSet + "\n");

            String infoId = "";
            String objPic = "";
            String jgsk = "";
            String faceScore = "";

            if (resultSet.size() > 0) {

                Collections.sort(resultSet, new Comparator<Map<String, Object>>() {

                    @Override
                    public int compare(Map<String, Object> o1, Map<String, Object> o2) {
                        String sk1 = StringUtil.toString(o1.get("JGSK"));
                        String sk2 = StringUtil.toString(o2.get("JGSK"));
                        return sk2.compareTo(sk1);
                    }
                });

                objPic = ModuleUtil.renderImage(StringUtil.toString(resultSet.get(0).get("OBJ_PIC")));
                jgsk = StringUtil.toString(resultSet.get(0).get("JGSK"), "");
                infoId = StringUtil.toString(resultSet.get(0).get("INFO_ID"));
                faceScore = StringUtil.toString(resultSet.get(0).get("FACE_SCORE"));
            }
            personData.put("INFO_ID", infoId);
            personData.put("REPEATS", ids.size());
            personData.put("PIC", objPic);
            personData.put("FACE_SCORE", faceScore);
            personData.put("IDS", StringUtils.join(ids, ","));
            // personData.put("JGSK", DateUtil.convertByStyle(jgsk, DateUtil.yyMMddHHmmss_style,
            // DateUtil.standard_style));

            if (!StringUtil.isNull(jgsk)) {
                personData.put("JGSK",
                        DateUtil.convertByStyle(jgsk, DateUtil.yyMMddHHmmss_style, DateUtil.standard_style));
            } else {
                personData.put("JGSK", "");
            }

        } catch (Exception e) {
            Log.fanchaLog.error("频繁出入  反查有误:handlePersonId()", e);
        }
        return personData;
    }
}
