package com.suntek.efacecloud.dao;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.efacecloud.util.Constants;

/**
 * 查询设备
 * 
 * @author liuwb
 * @since 
 * @version 2019年1月23日
 */
public class FaceEquipmentDao {
	
	 private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	 
	 public List<Map<String, Object>> queryVideo() {
		 String detailSql = "select e.IP_ADDR, i.NAME, i.DEVICE_ID from VPLUS_VIDEO_CAMERA i left join VPLUS_VIDEO_ENCODER e on i.PARENT_ID = e.DEVICE_ID where i.SPECIAL_PURPOSE = 1";	 
		 return jdbc.queryForList(detailSql.toString());
	 }
}
