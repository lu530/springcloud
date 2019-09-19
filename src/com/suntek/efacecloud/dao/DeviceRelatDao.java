package com.suntek.efacecloud.dao;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.efacecloud.util.Constants;
import com.suntek.eap.EAP;
import com.suntek.eap.util.SqlUtil;

/**
 * 
 * @author guoyl
 * @Description: TODO
 * @since 
 * @version 2017年7月27日
 * @Copyright (C)2017 , Suntektech
 */
public class DeviceRelatDao {

	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	
	
	
	/** 
	 * @Title: getWifiDevicesByCameraIds 
	 * @Description: 获取摄像机关联wifi设备
	 * @param  cameraIds 摄像机设备列表
	 * @return List<Map<String,Object>>
	 * @throws 
	 */
	public List<Map<String, Object>> getWifiDevicesByCameraIds(List<Object> cameraIds) {
		
		String sql = "select a.DEVICE_ID CAMERA_DEVICE_ID, b.DEVICE_ID DEVICE_ID"
				+ " from VCLOUD_PASSAGEWAY_DEVICE_RELAT a "
				+ " left join VCLOUD_PASSAGEWAY_DEVICE_RELAT b on a.PASSAGEWAY_ID = b.PASSAGEWAY_ID"
				+ " where a.DEVICE_ID in " +SqlUtil.getSqlInParams(cameraIds.toArray())
				+ " and b.DEVICE_TYPE =  " + Constants.DEVICE_TYPE_WIFI;
		List<Map<String, Object>>  result = jdbc.queryForList(sql,cameraIds.toArray());
		return  result;
	}



	public List<Map<String, Object>> getEFenceDevicesByCameraIds(List<Object> cameraIds) {
		
		String sql = "select a.DEVICE_ID CAMERA_DEVICE_ID, b.DEVICE_ID DEVICE_ID"
				+ " from VCLOUD_PASSAGEWAY_DEVICE_RELAT a "
				+ " left join VCLOUD_PASSAGEWAY_DEVICE_RELAT b on a.PASSAGEWAY_ID = b.PASSAGEWAY_ID"
				+ " where a.DEVICE_ID in " +SqlUtil.getSqlInParams(cameraIds.toArray())
				+ " and b.DEVICE_TYPE =  " + Constants.DEVICE_TYPE_EFENCE;
		List<Map<String, Object>>  result = jdbc.queryForList(sql,cameraIds.toArray());
		return  result;
	}

	
	
	public List<Map<String, Object>> getRelatDevicesByCameraIds(String cameraIds , int deviceType) {
		
		String sql = "select a.DEVICE_ID CAMERA_DEVICE_ID, b.DEVICE_ID DEVICE_ID"
				+ " from VCLOUD_PASSAGEWAY_DEVICE_RELAT a "
				+ " left join VCLOUD_PASSAGEWAY_DEVICE_RELAT b on a.PASSAGEWAY_ID = b.PASSAGEWAY_ID"
				+ " where a.DEVICE_ID in " +SqlUtil.getSqlInParams(cameraIds)
				+ " and b.DEVICE_TYPE =  " + deviceType;
		List<Map<String, Object>>  result = jdbc.queryForList(sql,cameraIds.split(","));
		return  result;
	}
	
	
}

