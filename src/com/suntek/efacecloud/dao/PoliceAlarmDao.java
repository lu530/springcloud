package com.suntek.efacecloud.dao;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.util.SqlUtil;
import com.suntek.efacecloud.util.Constants;


/**
 * 告警反馈信息数据库层
 * @author wangsh
 * @since 
 * @version 2017年6月15日
 * @Copyright (C)2017 , Suntektech
 */
public class PoliceAlarmDao {

	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);

	/**
	 * 删除告警所有反馈记录
	 * @param alarmId
	 * @return
	 * @throws Exception
	 */
	public boolean delAlarmRelByAlarmId(String alarmId) throws Exception
	{
		
		String sql = "delete from MD_POLICE_ALARM_REL where ALARM_ID = ? ";
		
		return jdbc.update(sql, alarmId) > 0;
	}
	
	public List<Map<String, Object>> getAlarmRelByAlarmIds(List<String> alarmList){
		String sql = "select ALARM_ID, IS_ALARM, IS_SEND, IS_ACCEPT,RESULT from MD_POLICE_ALARM_REL where ALARM_ID in  " + SqlUtil.getSqlInParams(alarmList.toArray());	
		return jdbc.queryForList(sql, alarmList.toArray());
	}
}
