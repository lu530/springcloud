package com.suntek.efacecloud.service;

import com.suntek.eap.EAP;
import com.suntek.eap.common.log.ServiceLog;
import com.suntek.eap.index.Query;
import com.suntek.eap.index.SearchEngineException;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.EsUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.DeviceInfoDao;
import com.suntek.efacecloud.util.Constants;
import org.elasticsearch.action.search.SearchType;

import java.util.*;

/**
 * 人员身份管理
 *
 * @author wangshaotao
 * @version 2019-02-26
 * @since 1.0.0
 */
@LocalComponent(id = "face/faceCapSum", isLog = "true")
public class FaceCapSumService {

    DeviceInfoDao deviceInfoDao = new DeviceInfoDao();

    /**
     * @Title: 抓拍量统计
     * @Description:
     * @author 王少涛
     * @date 2019年2月26日
     * @version V1.0
     **/
    @BeanService(id = "getData", description = "抓拍量统计", type = "remote", paasService = "true")
    public void getData(RequestContext context) {
        try {
            Map<String, Object> parameters = context.getParameters();

            // 关键字
            String keyWords = StringUtil.toString(parameters.get("KEYWORDS"));
            // 设备ID
            String orgCodes = StringUtil.toString(parameters.get("ORG_CODES"));
            // 开始时间
            String beginTime = StringUtil.toString(parameters.get("BEGIN_TIME"));
            // 结束时间
            String endTime = StringUtil.toString(parameters.get("END_TIME"));

            String sortType = StringUtil.toString(parameters.get("SORT_TYPE"), "DESC");
            String sortName = StringUtil.toString(parameters.get("SORT_NAME"), "capTotal");

            if (StringUtil.isEmpty(beginTime) || StringUtil.isEmpty(endTime)) {
                context.getResponse().putData("CODE", 1);
                context.getResponse().putData("MESSAGE", "请选取时间段");
                context.getResponse().putData("listTab", new ArrayList<>());
                return;
            }

            List<Map<String, Object>> faceDeviceList = deviceInfoDao.getFaceCapInfo(keyWords, orgCodes.replaceAll(",", "','"));
            PageQueryResult result = null;
            for (Map<String, Object> faceDeviceMap : faceDeviceList) {
                String deviceId = StringUtil.toString(faceDeviceMap.get("DEVICE_ID"));

                result = searchByDeviceId(deviceId, "JGSK", beginTime, endTime, "asc");
                long capTotal = result.getTotalSize();
                faceDeviceMap.put("capTotal", capTotal);

                result = searchByDeviceId(deviceId, "CJSJ", beginTime, endTime, "asc");
                long total = result.getTotalSize();
                faceDeviceMap.put("total", total);

                if (total == 0) {
                    faceDeviceMap.put("diffNum", 0);
                    continue;
                }

                //440000000213120000080220190508033636000370600037
                String minViidObjectId = StringUtil.toString(result.getResultSet().get(0).get("VIID_OBJECT_ID"));
                if (StringUtil.isEmpty(minViidObjectId)) {
                    faceDeviceMap.put("diffNum", "-");
                    continue;
                }
                //最小序列号
                long minSeq = Long.valueOf(minViidObjectId.substring(minViidObjectId.length() - 5));


                result = searchByDeviceId(deviceId, "CJSJ", beginTime, endTime, "desc");
                String maxViidObjectId = StringUtil.toString(result.getResultSet().get(0).get("VIID_OBJECT_ID"));
                //最大序列号
                long maxSeq = Long.valueOf(maxViidObjectId.substring(maxViidObjectId.length() - 5));

                long diff = (maxSeq + 1 - minSeq - total) % 99999L;
                if (diff < 0L) {
                    diff += 99999; //补为正数
                }
                if(diff > 50000) {
                    faceDeviceMap.put("diffNum", " 0 ?"); // 疑似重复
                }else {
                    faceDeviceMap.put("diffNum", diff);
                }
                faceDeviceMap.put("diff", diff);

                faceDeviceMap.put("EXTEND_INFO", new HashMap<String, Object>() {{
                    put("VIID_OBJECT_ID_MIN", minViidObjectId);
                    put("VIID_OBJECT_ID_MAX", maxViidObjectId);
                    put("ROUND", 99999);
                    put("TOTAL", total);
                }});
            }

            Collections.sort(faceDeviceList, new Comparator<Map<String, Object>>() {
                @Override
                public int compare(Map<String, Object> o1, Map<String, Object> o2) {
                    try {
                        Integer name1 = Integer.valueOf(StringUtil.toString(o1.get(sortName), "0"));// name1是从你list里面拿出来的一个
                        Integer name2 = Integer.valueOf(StringUtil.toString(o2.get(sortName), "0")); // name1是从你list里面拿出来的第二个name
                        if (sortType.equals("DESC")) {
                            return name2.compareTo(name1);
                        } else {
                            return name1.compareTo(name2);
                        }
                    }catch (Exception e){
                        return 0;
                    }
                }
            });

            Map<String, Object> listTab = new HashMap<String, Object>();
            listTab.put("records", faceDeviceList);
            listTab.put("count", faceDeviceList.size());
            context.getResponse().putData("listTab", listTab);
            context.getResponse().putData("CODE", 0);
            context.getResponse().putData("MESSAGE", "成功");
        } catch (Exception e) {
            context.getResponse().putData("CODE", 1);
            context.getResponse().putData("MESSAGE", "失败");
            context.getResponse().putData("listTab", new ArrayList<>());
            ServiceLog.error("查询抓拍量统计列表异常", e);
        }
    }

    private PageQueryResult searchByDeviceId(String deviceId, String filed, String beginTime, String endTime, String sortOrder) throws SearchEngineException {
        Long sjgsk = Long.valueOf(DateUtil.convertByStyle(beginTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style, "-1"));
        Long ejgsk = Long.valueOf(DateUtil.convertByStyle(endTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style, "-1"));
        String[] indices = EsUtil.getIndexNameByTime(Constants.FACE_INDEX + "_", beginTime, endTime);

        Query query = new Query(1, 1);
        query.addEqualCriteria("DEVICE_ID", deviceId);
        query.addBetweenCriteria(filed, sjgsk, ejgsk);
        query.setSearchType(SearchType.DEFAULT);
        query.addSort("VIID_OBJECT_ID", sortOrder);
        //query.addSort("JGSK", sortOrder);
        return EAP.bigdata.query(indices, Constants.FACE_TABLE, query);
    }

    @BeanService(id = "detail", description = "人脸设备采集量详情", type = "remote", paasService = "true")
    public void detail(RequestContext context) {
        Map<String, Object> parameters = context.getParameters();
        String beginTime = StringUtil.toString(parameters.get("BEGIN_TIME"));
        String endTime = StringUtil.toString(parameters.get("END_TIME"));
        String deviceId = StringUtil.toString(parameters.get("DEVICE_ID"));
        int pageSize = Integer.valueOf(StringUtil.toString(parameters.get("pageSize"), "10000"));
        int pageNo = 1;

        if (StringUtil.isEmpty(beginTime) || StringUtil.isEmpty(endTime) || StringUtil.isEmpty(deviceId)) {
            context.getResponse().putData("CODE", 1);
            context.getResponse().putData("MESSAGE", "参数异常");
            return;
        }

        try {

            Long sjgsk = Long.valueOf(DateUtil.convertByStyle(beginTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style, "-1"));
            Long ejgsk = Long.valueOf(DateUtil.convertByStyle(endTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style, "-1"));
            String[] indices = EsUtil.getIndexNameByTime(Constants.FACE_INDEX + "_", beginTime, endTime);

            Query query = new Query(1, pageSize);
            query.addEqualCriteria("DEVICE_ID", deviceId);
            query.addBetweenCriteria("CJSJ", sjgsk, ejgsk);
            query.setSearchType(SearchType.DEFAULT);
            query.addSort("VIID_OBJECT_ID", "asc");


            long total = 0L, seq = 0L, minSeq = 0L;

            boolean first = true;

            Map<String, Object> resultMap = new HashMap<>();
            List<Long> failrures = new ArrayList<>();
            List<String> mutils = new ArrayList<>();

            PageQueryResult result = null;
            while (true) {
                result = EAP.bigdata.query(indices, Constants.FACE_TABLE, query);
                if (result.getResultSet().isEmpty()) {
                    break;
                }

                if (first) {
                    first = false;
                    total = result.getTotalSize();
                    resultMap.put("TOTAL", total);
                    resultMap.put("DEVICE_ID", deviceId);
                    resultMap.put("BEGIN_TIME", beginTime);
                    resultMap.put("END_TIME", endTime);
                    String minViidObjectId = StringUtil.toString(result.getResultSet().get(0).get("VIID_OBJECT_ID"));
                    if (StringUtil.isEmpty(minViidObjectId)) {
                        resultMap.put("VIID_OBJECT_ID_MAX", "-");
                        resultMap.put("VIID_OBJECT_ID_MIN", "-");
                        resultMap.put("diffNum", "-");
                        break;
                    } else {
                        resultMap.put("VIID_OBJECT_ID_MIN", minViidObjectId);
                        minSeq = Long.valueOf(minViidObjectId.substring(minViidObjectId.length() - 5));
                        seq = Long.valueOf(minViidObjectId.substring(minViidObjectId.length() - 5));
                    }

                }


                for (Map<String, Object> map : result.getResultSet()) {
                    String viidObjectId = StringUtil.toString(map.get("VIID_OBJECT_ID"));
                    resultMap.put("VIID_OBJECT_ID_MAX", viidObjectId);

                    long maxSeq = Long.valueOf(viidObjectId.substring(viidObjectId.length() - 5));
                    if (maxSeq == minSeq) {
                        continue; //踢掉最小
                    }
                    if (maxSeq == seq) {
                        mutils.add(viidObjectId);
                        continue;
                    }

                    if (maxSeq == seq + 1) {
                        seq = maxSeq;
                        continue;
                    }

                    for (int i = 1; i < maxSeq - seq; i++) {
                        failrures.add(seq + i);
                    }

                    seq = maxSeq;
                }

                pageNo += 1;
                query.setPager(pageNo, pageSize);
                result = null;
            }

            if (seq > 0) {
                long diff = (seq + 1 - minSeq - total) % 99999L;
                if (diff < 0L) {
                    diff += 99999; //补为正数
                }
                resultMap.put("diffNum", diff);
            }

            resultMap.put("FAILRURES", failrures);
            resultMap.put("FAILRURES_SIZE", failrures.size());
            resultMap.put("MUTILS", mutils);
            resultMap.put("MUTIL_SIZE", mutils.size());


            context.getResponse().putData("CODE", 0);
            context.getResponse().putData("MESSAGE", "成功");
            context.getResponse().putData("DATA", resultMap);
        } catch (Exception e) {
            context.getResponse().putData("CODE", 1);
            context.getResponse().putData("MESSAGE", "失败");
            ServiceLog.error("查询抓拍量统计列表异常", e);
        }
    }

}
