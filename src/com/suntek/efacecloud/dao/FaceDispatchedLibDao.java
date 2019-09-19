package com.suntek.efacecloud.dao;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.metadata.Dao;
import com.suntek.eap.metadata.DaoProxy;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.util.Constants;

/**
 * 人脸布控库Dao
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
public class FaceDispatchedLibDao 
{
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	
	/**
	 * 添加布控库
	 * @param libId
	 * @param libName
	 * @param userCode
	 * @param createTime
	 * @param alarmLevel
	 * @param alarmThreshold
	 * @param orgCode
	 * @throws SQLException
	 */
	public boolean addRepo(String libId, String libName,String userCode, String createTime, String alarmLevel, String alarmThreshold, String orgCode) throws SQLException{
		
		String sql = "insert into EFACE_DISPATCHED_DB (DB_ID, DB_NAME, ALARM_THRESHOLD, ALARM_LEVEL, CREATOR, CREATE_TIME, ORG_CODE)"
				+ " values(?, ?, ?, ?, ?, ?, ?);";
		return jdbc.update(sql, libId, libName, alarmThreshold, alarmLevel, userCode, createTime, orgCode)>0;
	}
	
	/**
	 * 删除布控库
	 * @param libId
	 * @throws SQLException 
	 */
	public void deleteRepo(String libId) throws SQLException
	{
		Dao dao = new DaoProxy(Constants.APP_NAME);
		
		String sql = "delete from EFACE_DISPATCHED_PERSON where DB_ID = ?";
		dao.addSQL(sql, libId);
		
		sql = "delete from EFACE_DISPATCHED_DB where DB_ID = ?";
		dao.addSQL(sql, libId);
		
		dao.commit();
	}
   
	/**
	 * 判断布控库是否有布控任务存在
	 * @param dbId
	 * @return
	 */
	public boolean getTaskFormDBID(String dbId)
	{
		String sql = "select count(1) from EFACE_DISPATCHED_TASK where DB_ID=?";
		return jdbc.queryForObject(sql, Integer.class, dbId) > 0;
	}
	
	/**
	 * 更新布控库的名称
	 * @param dbId
	 * @param dbName
	 */
	public void editRepo(String dbId, String dbName, String alarmLevel) {
		String sql="update EFACE_DISPATCHED_DB set DB_NAME = ?, ALARM_LEVEL = ? where DB_ID = ? ";
		jdbc.update(sql, dbName, alarmLevel, dbId);
	}
	
	/**
	 * 更新布控库名称和阈值
	 * @param dbId
	 * @param dbName
	 */
	public void editRepo(String dbId, String dbName, String threshold, String alarmLevel) {
		if (StringUtil.isEmpty(threshold)) {
			editRepo(dbId, dbName, alarmLevel);
		} else {
			String sql="update EFACE_DISPATCHED_DB set DB_NAME = ?, ALARM_THRESHOLD = ?, ALARM_LEVEL = ? where DB_ID = ? ";
			jdbc.update(sql, dbName, threshold, alarmLevel, dbId);
		}
	}
	
	public List<Map<String, Object>> getAllLibId(){
		
		String sql = "select DB_ID from EFACE_DISPATCHED_DB"; 
		List<Map<String, Object>> resultList =  jdbc.queryForList(sql);
		return resultList;
	}
	
    public List<Map<String, Object>> getViidDispatchedDB(String dbId){
		
		String sql = "select * from VIID_DISPATCHED_DB where DB_ID = ?";
		return jdbc.queryForList(sql, dbId);
	}
}
