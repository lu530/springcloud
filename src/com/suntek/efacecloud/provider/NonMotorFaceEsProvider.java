package com.suntek.efacecloud.provider;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.elasticsearch.action.search.SearchType;
import org.elasticsearch.client.transport.TransportClient;

import com.suntek.eap.EAP;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.index.IndexSearchProvider;
import com.suntek.eap.index.Query;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.EsUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.DeviceInfoUtil;
import com.suntek.efacecloud.util.FaceFeatureUtil;
import com.suntek.efacecloud.util.FaceFeatureUtil.FeatureResp;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.tactics.api.TacticsEnum;
import com.suntek.tactics.common.CollisionResult;
import com.suntek.tactics.manager.FaceOperationManager;

/**
 * 非机动车人脸查询
 * @author swq
 * @since 1.0.0
 * @version 2017-10-09
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/non_motor")
public class NonMotorFaceEsProvider extends IndexSearchProvider {

	private static int IS_SUCCESS = 0;

	private static int OVERSIZE = 10013;

	private static int SERVERBUSY = 10015;

	public NonMotorFaceEsProvider() {
		super(EAP.bigdata);
	}

	@Override
	public void prepare(RequestContext context, Query query) throws Exception {
		
		String beginTime = StringUtil.toString(context.getParameter("beginTime"));
		String endTime = StringUtil.toString(context.getParameter("endTime"));
		
		query.setSearchType(SearchType.DEFAULT);
		
		String searchText = StringUtil.toString(context.getParameter("searchText"));

		if (!StringUtil.isEmpty(searchText)) {
			query.addSort("_score", "desc");
		} else {
			query.addSort("JGSK", "desc");
		}

		if (!StringUtil.isEmpty(beginTime) && !StringUtil.isEmpty(endTime)) {
			long sjgsk, ejgsk;
			sjgsk = Long.valueOf(DateUtil.convertByStyle(beginTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style,"-1"));
			ejgsk = Long.valueOf(DateUtil.convertByStyle(endTime, DateUtil.standard_style, DateUtil.yyMMddHHmmss_style,"-1"));
			this.setIndexNames(EsUtil.getIndexNameByTime(Constants.NOT_DRIVER_DETECT_INDICE + "_", beginTime, endTime));
			this.setTableName(Constants.NOT_DRIVER_DETECT_INFO);
			query.addBetweenCriteria("JGSK", sjgsk, ejgsk);
			query.addRoute(Arrays.asList(EsUtil.getRoutesByBeignAndEndTime(beginTime, endTime)));
		}

		
		String beginDay = StringUtil.toString(context.getParameter("beginDay"));
		String endDay = StringUtil.toString(context.getParameter("endDay"));
		String beginDayTime = StringUtil.toString(context.getParameter("beginDayTime"));
		String endDayTime = StringUtil.toString(context.getParameter("endDayTime"));
		
		if (!StringUtil.isEmpty(beginDay) && !StringUtil.isEmpty(endDay) &&  !StringUtil.isEmpty(beginDayTime) && !StringUtil.isEmpty(endDayTime) ) {
			
			long sjgsj = Long.valueOf(beginDayTime.replaceAll(":", "")+"00");
			long ejgsj = Long.valueOf(endDayTime.replaceAll(":", "")+"59");
			long sjgrq = Long.valueOf(DateUtil.convertByStyle(beginDay, DateUtil.yyyy_MM_dd_style, DateUtil.yyMMdd_style,"-1"));
			long ejgrq = Long.valueOf(DateUtil.convertByStyle(endDay, DateUtil.yyyy_MM_dd_style, DateUtil.yyMMdd_style,"-1"));
			
			query.addBetweenCriteria("JGSJ", sjgsj, ejgsj);
			query.addBetweenCriteria("JGRQ", sjgrq, ejgrq);
			
			this.setIndexNames(EsUtil.getIndexNameByTime(Constants.NOT_DRIVER_DETECT_INDICE + "_", beginDay, endDay));
			this.setTableName(Constants.NOT_DRIVER_DETECT_INFO);
			query.addRoute(Arrays.asList(EsUtil.getRoutesByBeignAndEndTime(beginDay, endDay)));
		}
		
		
		
		String kkbh = StringUtil.toString(context.getParameter("kkbh"));
		if (!StringUtil.isEmpty(kkbh)) {
			String[] KKBHArr = kkbh.split(",");
			query.addEqualCriteria("DEVICE_ID", KKBHArr);
		} else if (!context.getUser().isAdministrator()) {
			String orgCode = StringUtil.toString(DeviceInfoUtil.getUserResorceByUserCode(context.getUserCode()),"0");
			query.addEqualCriteria("ORG_CODE", orgCode.split(","));
		}

		String cllx = StringUtil.toString(context.getParameter("cllx"));// 车辆类型
		if (!StringUtil.isEmpty(cllx)) {
			query.addEqualCriteria("CLLX", cllx);
		}

		String lampType = StringUtil
				.toString(context.getParameter("lampType"));// 车灯类型
		if (!StringUtil.isEmpty(lampType)) {
			query.addEqualCriteria("LAMP_TYPE", lampType);
		}

		String csys = StringUtil.toString(context.getParameter("csys"));// 车身颜色LAMP_TYPE
		if (!StringUtil.isEmpty(csys)) {
			query.addEqualCriteria("CSYS", csys);
		}

		String hasHelmet = StringUtil.toString(context
				.getParameter("hasHelmet"));// 是否戴头盔
		if (!StringUtil.isEmpty(hasHelmet)) {
			query.addEqualCriteria("HAS_HELMET", hasHelmet);
		}

		String sex =  StringUtil.toString(context.getParameter("sex"));
		if (!StringUtil.isEmpty(sex)) {
			query.addEqualCriteria("SEX", sex);
		}
		
		String age = StringUtil.toString(context.getParameter("age"));
		if (!StringUtil.isEmpty(age)) {
			query.addEqualCriteria("AGE", age);
		}
		
		if (!StringUtil.isEmpty(searchText)) {
			query.addLikeCriteria("KEYWORDS", searchText.replaceAll("-1", "")
					.replaceAll(":", "").replaceAll("：", "")
					.replaceAll(",", ""));
		}
	}
	
	@SuppressWarnings("unchecked")
	@QueryService(id = "query")
	public PageQueryResult query(RequestContext context) throws Exception {
		long size = 0; 
		long useTime = 0;
		List<Map<String, Object>> list = new ArrayList<>();

		String fileUrl = StringUtil.toString(context.getParameter("fileUrl"));
		int threshold = Integer.valueOf(StringUtil.toString((context.getParameter("threshold")),"1"));//阈值
		
		if (!StringUtil.isEmpty(fileUrl)) { 

			long startTime = System.currentTimeMillis();
			//人脸质量检测
			FeatureResp featureResp = FaceFeatureUtil.faceQualityCheck(ModuleUtil.renderImage(fileUrl));
			
			if(featureResp.isValid()){
				int topN = Integer.valueOf(StringUtil.toString((context.getParameter("pageSize")), "100")); //人脸检索条数

				String beginTime = StringUtil.toString(context.getParameter("beginTime"), "2016-09-01 00:00:00");
				String endTime = StringUtil.toString(context.getParameter("endTime"), DateUtil.getDateTime());

				Map<String, Object> map = new HashMap<>();
				map.put("beginTime", beginTime);
				map.put("endTime", endTime);
				map.put("similarity", threshold);
				map.put("features", featureResp.getRltz());
				map.put("topN", topN);

				String kkbh = StringUtil.toString(context.getParameter("kkbh"));
				if (!StringUtil.isEmpty(kkbh)) {
					map.put("cross", kkbh);
				}
				
				String lampType = StringUtil.toString(context.getParameter("lampType"));
				if (!StringUtil.isEmpty(lampType)) {
					map.put("lampType", lampType);
				}
				
				String hasHelmet = StringUtil.toString(context.getParameter("hasHelmet"));
				if(!StringUtil.isEmpty(hasHelmet)){
					map.put("hasHelmet", hasHelmet);
				}
				
				String sex = StringUtil.toString(context.getParameter("sex"));
				if(!StringUtil.isEmpty(sex)){
					map.put("sex", sex);
				}
				
				String age = StringUtil.toString(context.getParameter("age"));
				if(!StringUtil.isEmpty(age)){
					map.put("age", age);
				}
				
				String cllx = StringUtil.toString(context.getParameter("cllx"));
				if(!StringUtil.isEmpty(cllx)){
					map.put("vehicleType", cllx);
				}
				
				TransportClient client = (TransportClient) EAP.bigdata.getClient();

				CollisionResult result = FaceOperationManager.runOperation(map,
						client, TacticsEnum.JNI_NON_MOTOR_FACE_SEARCH);

				if (result != null) {
					
					ServiceLog.debug("调用datacollsion返回结果:" + result.toJson());
					
					if (result.getCode() == IS_SUCCESS) {
						
						list = result.getList();
						renderData(list);
					} else if (result.getCode() == OVERSIZE) {
						
						context.getResponse().setWarn("查询范围过大，请调整[时间][地点][车辆品牌]等缩小范围");
					}else if (result.getCode() == SERVERBUSY) {
						
						context.getResponse().setWarn("请求较多，服务器正在拼命处理，请稍后再试");
					}
				}else{
					ServiceLog.debug("调用datacollsion返回null");
				}
			}else{
				ServiceLog.error("人脸质量检测不通过，原因：" + featureResp.getErrorMsg());
				context.getResponse().setError("人脸质量检测不通过，原因：" + featureResp.getErrorMsg());
			}
			
			useTime = System.currentTimeMillis() - startTime;

			PageQueryResult Presult = new PageQueryResult(list.size(), useTime, list);

			return Presult;

		} else {

			PageQueryResult pgr = getData(context);

			useTime = pgr.getUsetime();
			size = pgr.getTotalSize();
			list = pgr.getResultSet();
			renderData(list);
			PageQueryResult result = new PageQueryResult(size, useTime, list);
			return result;
		}
	}
	
	private void renderData(List<Map<String,Object>> list){
		
		for (Map<String, Object> map : list) {
			String jgsk = StringUtil.toString(map.get("JGSK"));
			String abbreviate = StringUtil.toString(map.get("PIC_ABBREVIATE"));
			
			map.put("FACE_SCORE",ModuleUtil.renderFaceScore(map.get("FACE_SCORE")));
			map.put("JGSK",  DateUtil.convertByStyle(jgsk, DateUtil.yyMMddHHmmss_style, DateUtil.standard_style));
			map.put("PIC_VEHICLE",ModuleUtil.renderImage(StringUtil.toString(map.get("PIC_VEHICLE"), abbreviate)));
			map.put("PIC_ABBREVIATE",ModuleUtil.renderImage(abbreviate));
			map.put("PIC_DRIVER", ModuleUtil.renderImage(StringUtil.toString(map.get("PIC_DRIVER"))));
			map.put("CLLX_NAME", EAP.metadata.getDictValue(DictType.NV_VEHICLE_TYPE, StringUtil.toString(map.get("CLLX"))));
			map.put("INFO_ID", StringUtil.toString(map.get("INFO_ID")));
			try {
				map.put("KKMC",((DeviceEntity)EAP.metadata.getDictModel(DictType.D_CAR,StringUtil.toString(map.get("DEVICE_ID")), DeviceEntity.class)).getDeviceName());
			} catch (Exception e) {
				map.put("KKMC", "未知");
				ServiceLog.debug("渲染卡口编号失败，原因:" + e);
			}
		}
		//按分数排序
		Collections.sort(list,new Comparator<Map<String,Object>>(){

			@Override
			public int compare(Map<String, Object> m1,
					Map<String, Object> m2) {
				return String.valueOf(m2.get("SIMILARITY")).compareTo(String.valueOf(m1.get("SIMILARITY")));
			}
			
		});		
	}
}
