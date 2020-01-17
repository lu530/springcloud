package com.suntek.efacecloud.service.face.tactics.common;

import com.suntek.eap.EAP;
import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.common.util.IDGenerator;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;
import org.apache.commons.lang.StringUtils;

import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FrequentAccessCommonService {

    // 处理同一个的人员列表,一个数据
    protected Map<String, Object> handlePersonId(List<Object> ids) {

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
