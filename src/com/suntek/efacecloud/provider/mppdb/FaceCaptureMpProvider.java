package com.suntek.efacecloud.provider.mppdb;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.log.ServiceLog;
import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.common.util.SqlUtil;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.metadata.DictType;
import com.suntek.eap.tag.grid.ExportGridDataProvider;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.DeviceInfoDao;
import com.suntek.efacecloud.dao.FaceDispatchedAlarmDao;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.DeviceInfoUtil;
import com.suntek.efacecloud.util.ModuleUtil;

/**
 * @author wsh
 * @since 1.0.0
 * @version 2017-06-29
 */
public class FaceCaptureMpProvider extends ExportGridDataProvider {
	private FaceDispatchedAlarmDao dao = new FaceDispatchedAlarmDao();

	public Map<String, Object> query(RequestContext context) throws Exception {
		String sourceType = StringUtil.toString(context.getParameter("SOURCE_TYPE"));
		
		PageQueryResult result = this.getData(context);
		return new PageQueryResult(result.getTotalSize(), render(result.getResultSet(), sourceType)).toMap();
	}

	@Override
	protected String buildCountSQL() {
		String sql = "select count(1)  from FACE_CAPTURE  where 1=1 " + this.getOptionalStatement();
		return sql;
	}

	@Override
	protected String buildQuerySQL() {
		String sql = "select info_id , device_id , algorithm_id, jgsk,"
				+ " obj_pic, pic, age, sex, with_glasses, with_hat"
				+ " from face_capture where 1=1 "
				+ this.getOptionalStatement();
		return sql;
	}

	@Override
	protected void prepare(RequestContext context) {

		this.setDatasource(Constants.MPPDB_NAME);
		Map<String, Object> body = context.getParameters();
		context.putParameter("sort", " jgsk desc ");

		String beginTime = StringUtil.toString(body.get("BEGIN_TIME"));
		String endTime = StringUtil.toString(body.get("END_TIME"));
		String devides = StringUtil.toString(body.get("DEVICE_IDS"));
		String keywords = StringUtil.toString(body.get("KEYWORDS"));
		
		ServiceLog.info("人脸抓拍 MPPDB 检索， 参数：" + JSONObject.toJSONString(body));

		if (!StringUtil.isEmpty(devides)) {
			this.addOptionalStatement(" and device_id in " + SqlUtil.getSqlInParams(devides));
			for (String deviceId : devides.split(",")) {
				this.addParameter(deviceId);
			}
		}

		if (!StringUtil.isEmpty(keywords)) {
			
			DeviceInfoDao resDao = new DeviceInfoDao();
			List<Map<String, Object>> deviceList = resDao.getDeviceIdByTypeAndKeyword(StringUtil.toString(Constants.DEVICE_TYPE_FACE), keywords);
			
			List<String> deviceIdList = new ArrayList<String>();
			for (Map<String, Object> map : deviceList) {
				deviceIdList.add(StringUtil.toString(map.get("DEVICE_ID")));
			}
			
			this.addOptionalStatement(" and device_id in " + SqlUtil.getSqlInParams(devides));
			for (String deviceId : deviceIdList) {
				this.addParameter(deviceId);
			}
		}

		this.addOptionalStatement(" and (jgsk between ? and ? )");
		this.addParameter(beginTime);
		this.addParameter(endTime);

	}

	private List<Map<String, Object>> render(List<Map<String, Object>> resultSet, String sourceType) throws Exception {

		List<Map<String, Object>> tempList = new ArrayList<Map<String, Object>>();

//		boolean isAdd = !StringUtil.isEmpty(sourceType);
//        Map<String, Map<String, Object>> idGriupMap = new HashMap<String, Map<String, Object>>();
//        if(isAdd) {
//			Set<String> set = resultSet.stream().map(o -> StringUtil.toString(o.get("DEVICE_ID"))).collect(Collectors.toSet());
//			idGriupMap = DeviceInfoUtil.queryDeviceGroupByIds(String.join(",", set));
//		}
		
		for (Map<String, Object> map : resultSet) {
			Map<String, Object> tempMap = new HashMap<String, Object>();

			Date date = (Date) map.get("jgsk");
			tempMap.put("JGSK", date == null ? "" : DateUtil.dateToString(date));
			
			String deviceId = StringUtil.toString(map.get("device_id"));
			
			DeviceEntity device = (DeviceEntity) EAP.metadata.getDictModel(DictType.D_FACE, deviceId, DeviceEntity.class);
			tempMap.put("DEVICE_ID", deviceId);
			tempMap.put("DEVICE_NAME", StringUtil.toString(device.getDeviceName()));
			tempMap.put("DEVICE_ADDR", StringUtil.toString(device.getDeviceAddr()));
			tempMap.put("ORG_NAME", device.getOrgName());
			tempMap.put("OBJ_PIC", ModuleUtil.renderAlarmImage(StringUtil.toString(map.get("obj_pic"))));
			tempMap.put("PIC", ModuleUtil.renderAlarmImage(StringUtil.toString(map.get("pic"))));
			tempMap.put("INFO_ID", map.get("info_id"));
			tempMap.put("LATITUDE", StringUtil.toString(device.getDeviceY()));
			tempMap.put("LONGITUDE", StringUtil.toString(device.getDeviceX()));
			tempMap.put("AGE", StringUtil.toString(map.get("age")));
			tempMap.put("SEX", StringUtil.toString(map.get("sex")));
			tempMap.put("RLTZ", "MPPDB");//华为MPPDB默认提取特征，只有注册库

			String infoId = StringUtil.toString(map.get("info_id"));
			try{
            	if(!StringUtils.isBlank(infoId)){
            		List<Map<String, Object>> actList = dao.queryActivityInfo(infoId);
                    for (Map<String, Object> actMap : actList) {
                        map.putAll(actMap);
                    }
            	}
            }catch(Exception e){
            	ServiceLog.error("不存在activity_info表: " + e);
            }
			String algoTyoeStr = StringUtil.toString(map.get("algorithm_id"));
			if (!StringUtil.isNull(algoTyoeStr)) {
				tempMap.put("ALGORITHM_NAME", ModuleUtil.getAlgorithmById(Integer.valueOf(algoTyoeStr)).get("ALGORITHM_NAME"));
			}
			
			//是否添加来源类型
//			if(isAdd) {
//				Map<String, Object> devideGroup = idGriupMap.get(deviceId);
//				map.put("SOURCE_TYPE", devideGroup == null ? "未知" : devideGroup.get("groupId"));
//				map.put("SOURCE_NAME", devideGroup == null ? "未知" : devideGroup.get("name"));
//			}
			
			tempList.add(tempMap);
		}
		return tempList;

	}

}
