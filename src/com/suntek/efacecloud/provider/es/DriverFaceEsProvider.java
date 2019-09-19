package com.suntek.efacecloud.provider.es;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.suntek.eap.EAP;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.index.IndexSearchProvider;
import com.suntek.eap.index.Query;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.EsUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.DeviceInfoDao;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;

/**
 * 人脸抓拍库查询 efacecloud/rest/v6/face/capture
 * 
 * @author wsh
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
public class DriverFaceEsProvider extends IndexSearchProvider {

	public DriverFaceEsProvider() {
		super(EAP.bigdata);
	}

	public Map<String, Object> query(RequestContext context) throws Exception {

		PageQueryResult result = this.getData(context);
		return new PageQueryResult(result.getTotalSize(),
				render(result.getResultSet())).toMap();

	}

	private List<Map<String, Object>> render(List<Map<String, Object>> resultSet)
			throws Exception {

		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();

		for (Map<String, Object> map : resultSet) {

			String jgsk = StringUtil.toString(map.get("JGSK"));
			jgsk = DateUtil.convertByStyle(jgsk, DateUtil.yyMMddHHmmss_style,
					DateUtil.standard_style);

			String objPic = ModuleUtil.renderImage(StringUtil.toString(map
					.get("OBJ_PIC")));
			String pic = ModuleUtil.renderImage(StringUtil.toString(map
					.get("PIC")));
			String startTime = StringUtil.toString(map.get("STARTTIME"));
			String deviceId = StringUtil.toString(map.get("DEVICE_ID"));
			String personId = StringUtil.toString(map.get("PERSON_ID"));
			String infoId = StringUtil.toString(map.get("INFO_ID"));
			map.put("DEVICE_ID", deviceId);
			map.put("JGSK", jgsk);
			map.put("OBJ_PIC", objPic);
			map.put("PIC", pic);
			map.put("STARTTIME", startTime);
			map.put("PERSON_ID", personId);
			map.put("INFO_ID", infoId);

			DeviceEntity faceDevice = (DeviceEntity) EAP.metadata.getDictModel(
					DictType.D_FACE, deviceId, DeviceEntity.class);
			map.put("DEVICE_NAME",
					StringUtil.toString(faceDevice.getDeviceName()));
			map.put("DEVICE_ADDR",
					StringUtil.toString(faceDevice.getDeviceAddr()));
			map.put("ORG_NAME", StringUtil.toString(faceDevice.getOrgName()));
			map.put("AGE", StringUtil.toString(map.get("AGE")));
			map.put("SEX", StringUtil.toString(map.get("SEX")));
			map.put("LATITUDE", StringUtil.toString(faceDevice.getDeviceY()));
			map.put("LONGITUDE", StringUtil.toString(faceDevice.getDeviceX()));

			String algoTyoeStr = StringUtil.toString(map.get("ALGORITHM_ID"));
			if (!StringUtil.isNull(algoTyoeStr)) {
				map.put("ALGORITHM_NAME",
						ModuleUtil.getAlgorithmById(
								Integer.valueOf(algoTyoeStr)).get(
								"ALGORITHM_NAME"));
			}
			list.add(map);
		}
		return list;
	}

	@Override
	public void prepare(RequestContext context, Query query) throws Exception {

		Map<String, Object> params = context.getParameters();

		String beginTime = StringUtil.toString(params.get("BEGIN_TIME"));
		String endTime = StringUtil.toString(params.get("END_TIME"));
		String timeSortType = StringUtil.toString(params.get("TIME_SORT_TYPE"),
				"desc");
		String keyword = StringUtil.toString(params.get("KEYWORDS"));
		String treeNodeId = (String) params.get("DEVICE_IDS");
		// 增加参数做判断,避免没有传设备查所有设备
		String needDevice = StringUtil.toString(params.get("NEED_DEVICE"));

		this.setIndexNames(EsUtil.getIndexNameByTime(
				Constants.FACE_INDEX + "_", beginTime, endTime));
		this.setTableName(Constants.FACE_TABLE);

		// 避免 某个分片检索时间超出了超时时间，导致会出现每次结果不一样的情况
		query.setTimeout(10000l);

		if (!StringUtil.isEmpty(treeNodeId)) {

			Object[] treeNodeIdArr = treeNodeId.split(",");
			query.addEqualCriteria("DEVICE_ID", treeNodeIdArr);
		}
		// 添加一个判断条件,目的是没传设备id,并且NEED_DEVICE=1,就查询结果为0
		if (StringUtil.isEmpty(treeNodeId) && needDevice.equals("1")) {
			query.addEqualCriteria("DEVICE_ID", "1111111");
		}

		if (!StringUtil.isEmpty(keyword)) {
			DeviceInfoDao resDao = new DeviceInfoDao();
			List<Map<String, Object>> deviceList = resDao
					.getDeviceIdByTypeAndKeyword(
							StringUtil.toString(Constants.DEVICE_TYPE_FACE),
							keyword);
			List<String> deviceIdList = new ArrayList<String>();
			for (Map<String, Object> map : deviceList) {
				deviceIdList.add(StringUtil.toString(map.get("DEVICE_ID")));
			}
			query.addEqualCriteria("DEVICE_ID", deviceIdList.toArray());
		}

		long sjgsk = Long.MIN_VALUE, ejgsk = Long.MAX_VALUE;
		if (!StringUtil.isEmpty(beginTime)) {
			sjgsk = Long
					.valueOf(DateUtil.convertByStyle(beginTime,
							DateUtil.standard_style,
							DateUtil.yyMMddHHmmss_style, "-1"));
		}
		if (!StringUtil.isEmpty(endTime)) {
			ejgsk = Long
					.valueOf(DateUtil.convertByStyle(endTime,
							DateUtil.standard_style,
							DateUtil.yyMMddHHmmss_style, "-1"));
		}

		query.addBetweenCriteria("JGSK", sjgsk, ejgsk);
		query.addSort("JGSK", timeSortType);
	}

}
