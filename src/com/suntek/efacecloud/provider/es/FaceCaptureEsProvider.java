package com.suntek.efacecloud.provider.es;

import java.util.*;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;

import com.suntek.eap.EAP;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.index.IndexSearchProvider;
import com.suntek.eap.index.Query;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.EsUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.DeviceInfoDao;
import com.suntek.efacecloud.dao.FaceDispatchedAlarmDao;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.provider.FaceCaptureProvider;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;
import net.sf.json.JSONArray;
import org.apache.commons.lang3.StringUtils;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 人脸抓拍库查询 efacecloud/rest/v6/face/capture
 * 
 * @author wsh
 * @since 1.0.0
 * @version 2017-06-29
 */
public class FaceCaptureEsProvider extends IndexSearchProvider {

    private FaceDispatchedAlarmDao dao = new FaceDispatchedAlarmDao();

    // 是否特定外籍人项目
    private boolean isBlack = ConfigUtil.isBlack();

    public FaceCaptureEsProvider() {
        super(EAP.bigdata);
        try {
        	isBlack = "1".equals(StringUtil.toString(AppHandle.getHandle(Constants.DATA_DEFENCE).getProperty("IS_BLACK", "0")));
        } catch (Exception e) {
        	// do no thing
        }
    }

    public Map<String, Object> query(RequestContext context) throws Exception {
    	String sourceType = StringUtil.toString(context.getParameter("SOURCE_TYPE"));
    	
        PageQueryResult result = this.getData(context);
        return new PageQueryResult(result.getTotalSize(), render(result.getResultSet(), sourceType)).toMap();

    }

    private List<Map<String, Object>> render(List<Map<String, Object>> resultSet, String sourceType) throws Exception {

        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();

        ////中台暂不支持通过设备id查找分组信息 20190911
//        boolean isAdd = !StringUtil.isEmpty(sourceType);
//        Map<String, Map<String, Object>> idGriupMap = new HashMap<String, Map<String, Object>>();
//        if(isAdd) {
//			Set<String> set = resultSet.stream().map(o -> StringUtil.toString(o.get("DEVICE_ID"))).collect(Collectors.toSet());
//			idGriupMap = DeviceInfoUtil.queryDeviceGroupByIds(String.join(",", set));
//		}

        // 一次查询activity_info表
        Map<String, Map<String, Object>> actMap = new FaceCaptureProvider().getActivityMap(resultSet);

        for (Map<String, Object> map : resultSet) {

            String jgsk = StringUtil.toString(map.get("JGSK"));
            jgsk = DateUtil.convertByStyle(jgsk, DateUtil.yyMMddHHmmss_style, DateUtil.standard_style);
            String createTime = StringUtil.toString(map.get("CREATETIME"));
            if(!StringUtil.isEmpty(createTime)) {
                createTime = DateUtil.convertByStyle(createTime, DateUtil.yyMMddHHmmss_style, DateUtil.standard_style);
            }
            String objPic = ModuleUtil.renderImage(StringUtil.toString(map.get("OBJ_PIC")));
            String pic = ModuleUtil.renderImage(StringUtil.toString(map.get("PIC")));
            String startTime = StringUtil.toString(map.get("STARTTIME"));
            String deviceId = StringUtil.toString(map.get("DEVICE_ID"));
            String viidObjectId = StringUtil.toString(map.get("VIID_OBJECT_ID"));
            String personId = StringUtil.toString(map.get("PERSON_ID"));
            String infoId = StringUtil.toString(map.get("INFO_ID"));

            try{
            	if(!StringUtils.isBlank(infoId)){
            		List<Map<String, Object>> actList = dao.queryActivityInfo(infoId);
                    for (Map<String, Object> actMap1 : actList) {
                        map.putAll(actMap1);
                    }
            	}
            }catch(Exception e){
            	ServiceLog.error("不存在activity_info表: " + e);
            }
            map.put("DEVICE_ID", deviceId);
            map.put("VIID_OBJECT_ID", viidObjectId);
            map.put("JGSK", jgsk);
            map.put("OBJ_PIC", objPic);
            map.put("PIC", pic);
            map.put("STARTTIME", startTime);
            map.put("PERSON_ID", personId);
            map.put("INFO_ID", infoId);
            map.put("CREATETIME", createTime);
            DeviceEntity faceDevice
                = (DeviceEntity)EAP.metadata.getDictModel(DictType.D_FACE, deviceId, DeviceEntity.class);
            map.put("DEVICE_NAME", StringUtil.toString(faceDevice.getDeviceName()));
            map.put("DEVICE_ADDR", StringUtil.toString(faceDevice.getDeviceAddr()));
            map.put("ORG_NAME", StringUtil.toString(faceDevice.getOrgName()));
            map.put("AGE", StringUtil.toString(map.get("AGE")));
            map.put("SEX", StringUtil.toString(map.get("SEX")));
            map.put("LATITUDE", StringUtil.toString(faceDevice.getDeviceY()));
            map.put("LONGITUDE", StringUtil.toString(faceDevice.getDeviceX()));

            String algoTyoeStr = StringUtil.toString(map.get("ALGORITHM_ID"));
            if (!StringUtil.isNull(algoTyoeStr)) {
                map.put("ALGORITHM_NAME",
                    ModuleUtil.getAlgorithmById(Integer.valueOf(algoTyoeStr)).get("ALGORITHM_NAME"));
            }
            
            if (isBlack) {
                String raceConfirm = StringUtil.toString(map.get("RACE_CONFIRM"),"0");
                String foreignAlgoIDs = StringUtil.toString(map.get("FOREIGN_ALGO_IDS"),"");
                map.put("RACE_CONFIRM", raceConfirm);
                map.put("FOREIGN_ALGO_IDS", foreignAlgoIDs);
            }
            
            //是否添加来源类型
            //中台暂不支持通过设备id查找分组信息 20190911 
//			if(isAdd) {
//				Map<String, Object> devideGroup = idGriupMap.get(deviceId);
//				map.put("SOURCE_TYPE", devideGroup == null ? "未知" : devideGroup.get("groupId"));
//				map.put("SOURCE_NAME", devideGroup == null ? "未知" : devideGroup.get("name"));
//			}
            
            list.add(map);
        }
        return list;
    }

    @Override
    public void prepare(RequestContext context, Query query) throws Exception {

        Map<String, Object> params = context.getParameters();

        String beginTime = StringUtil.toString(params.get("BEGIN_TIME"));
        String endTime = StringUtil.toString(params.get("END_TIME"));
        String timeSortType = StringUtil.toString(params.get("TIME_SORT_TYPE"), "desc");
        String keyword = StringUtil.toString(params.get("KEYWORDS"));
        String treeNodeId = (String)params.get("DEVICE_IDS");
        String isEffective = StringUtil.toString(params.get("IS_EFFECTIVE"));
        String viidObjectIds = StringUtil.toString(params.get("VIID_OBJECT_IDS"));

        //如果传入时间为空,默认只查当月的
        if(!StringUtil.isNull(beginTime)&&!StringUtil.isNull(endTime)) {
            this.setIndexNames(EsUtil.getIndexNameByTime(Constants.FACE_INDEX + "_", beginTime, endTime));
        }else{
            String []indexNames=new String[]{Constants.FACE_INDEX + "_"+DateUtil.toString(new Date(),DateUtil.yyMM_style)};
            this.setIndexNames(indexNames);
        }
        this.setTableName(Constants.FACE_TABLE);

        // 避免 某个分片检索时间超出了超时时间，导致会出现每次结果不一样的情况
        query.setTimeout(30000L);
        //如果VIID_OBJECT_ID不为空。根据VIID_OBJECT_ID字段查。提供给视图库使用
        if (!StringUtil.isEmpty(viidObjectIds)) {

            String[] viidArray = viidObjectIds.split(",");
            query.addEqualCriteria("VIID_OBJECT_ID", viidArray);

        }
        if (!StringUtil.isEmpty(treeNodeId)) {

            Object[] treeNodeIdArr = treeNodeId.split(",");
            query.addEqualCriteria("DEVICE_ID", treeNodeIdArr);
        }

        if (!StringUtil.isEmpty(keyword)) {
            DeviceInfoDao resDao = new DeviceInfoDao();
            List<Map<String, Object>> deviceList
                = resDao.getDeviceIdByTypeAndKeyword(StringUtil.toString(Constants.DEVICE_TYPE_FACE), keyword);
            List<String> deviceIdList = new ArrayList<String>();
            for (Map<String, Object> map : deviceList) {
                deviceIdList.add(StringUtil.toString(map.get("DEVICE_ID")));
            }
            query.addEqualCriteria("DEVICE_ID", deviceIdList.toArray());
        }

        long sjgsk = Long.MIN_VALUE;
        long ejgsk = Long.MAX_VALUE;
        if (!StringUtil.isEmpty(beginTime)) {
            sjgsk = Long.valueOf(
                DateUtil.convertByStyle(beginTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style, "-1"));
        }
        if (!StringUtil.isEmpty(endTime)) {
            ejgsk = Long
                .valueOf(DateUtil.convertByStyle(endTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style, "-1"));
        }

        query.addBetweenCriteria("JGSK", sjgsk, ejgsk);

        if (!StringUtil.isEmpty(StringUtil.toString(params.get("ALGO_LIST")))) {
            // 算法ID过滤
            try {
                JSONArray searchAlgoArray = JSONArray.fromObject(StringUtil.toString(params.get("ALGO_LIST")));
                List<String> algoList = new ArrayList<>();
                for (int i = 0; i < searchAlgoArray.size(); i++) {
                    net.sf.json.JSONObject searchAlgo = searchAlgoArray.getJSONObject(i);
                    String algo = StringUtil.toString(searchAlgo.get("ALGO_TYPE"));
                    if (!algo.equals("-1")) {
                        algoList.add(algo);
                    }
                }
                if (!algoList.isEmpty()) {
                	if (isBlack) {
                		BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
                		boolQuery.should(QueryBuilders.matchQuery("FOREIGN_ALGO_IDS", String.join(" ", algoList)));
                		boolQuery.should(QueryBuilders.termsQuery("ALGORITHM_ID", algoList));
                		query.addQueryBuilder(boolQuery);
                	} else {
                	    //wudapei 19-11-01 普通检索不做算法过滤
//                		query.addEqualCriteria("ALGORITHM_ID", algoList.toArray());
                	}
                }
            } catch (Exception e) {
                ServiceLog.error("路人库ES根据算法查询报错,", e);
            }
        }
        
        String raceConfirm = StringUtil.toString(params.get("RACE_CONFIRM"));
        if (!StringUtil.isEmpty(raceConfirm)) {
        	query.addEqualCriteria("RACE_CONFIRM", raceConfirm);
        }

        query.addSort("JGSK", timeSortType);
        BoolQueryBuilder queryBuilder = QueryBuilders.boolQuery();
        if ("有效库".equals(isEffective)) {
            queryBuilder.must(QueryBuilders.existsQuery("RLTZ"));
        } else if ("残缺库".equals(isEffective)) {
            queryBuilder.mustNot(QueryBuilders.existsQuery("RLTZ"));
        }
        query.addQueryBuilder(queryBuilder);
    }

}
