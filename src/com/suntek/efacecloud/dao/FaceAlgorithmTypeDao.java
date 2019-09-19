package com.suntek.efacecloud.dao;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.metadata.Dao;
import com.suntek.eap.metadata.DaoProxy;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.util.Constants;

/**
 * 人脸算法类型Dao
 * @author wangsh
 * @since 1.0.0
 * @version 2017-11-16
 * @Copyright (C)2017 , Suntektech
 */
public class FaceAlgorithmTypeDao 
{
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	

	public List<Map<String, Object>> getAlgorithTypeList()
	{
		String sql = "select ALGORITHM_ID, ALGORITHM_NAME, ALGORITHM_DESC from "
				+ "VPLUS_FACE_ALGORITHM_TYPE where ENABLED = 1 order by CREATE_TIME desc";
		return jdbc.queryForList(sql);
	}
	
	public List<String> getAlgorithTypeIdList()
	{
		String sql = "select ALGORITHM_ID from "
				+ "VPLUS_FACE_ALGORITHM_TYPE where ENABLED = 1 order by CREATE_TIME desc";
		return jdbc.queryForList(sql, String.class);
	}
	
	public List<String> getAlgoByDbId(String dbId)
	{
		String sql = "select ALGO_TYPE from EFACE_DISPATCHED_DB_ALGO_REL where DB_ID = ? ";
		return jdbc.queryForList(sql, String.class, dbId);
	}
	
	/**
	 * 获取短信推送设置
	 * @param dbId
	 * @return
	 * @throws Exception 
	 */
	public List<Map<String, Object>> getMessagePush(String dbId) throws Exception
	{
		String sql = "select PUSH_THRESHOLD, PUSH_PHONE from DISPATCHED_MESSAGE_PUSH where RELATION_ID = ? and DISPATCHED_TYPE = ?";
		List<Map<String, Object>> resultList =  jdbc.queryForList(sql, dbId, Constants.DISPATCHED_TASK_TYPE_FACE);
		return resultList;
	}
	
	
	/**
	 * 短信推送设置
	 * @param dbId
	 * @return
	 * @throws Exception 
	 */
	public void messagePush(String dbId, String pushThreshold, String pushPhone) throws Exception
	{
		Dao dao = new DaoProxy(Constants.APP_NAME);
		
		String deleteSql = "delete from DISPATCHED_MESSAGE_PUSH where RELATION_ID = ?";
		dao.addSQL(deleteSql, dbId);
		
		if (!StringUtil.isEmpty(pushPhone)) {
			String insertSql = "insert into DISPATCHED_MESSAGE_PUSH(ID, RELATION_ID, DISPATCHED_TYPE, PUSH_PHONE, PUSH_THRESHOLD) values (?,?,?,?,?)";
			String[] pushPhoneArr = pushPhone.split(",");
			for (int i = 0; i < pushPhoneArr.length; i++) {
				dao.addSQL(insertSql, EAP.keyTool.getUUID(), dbId, Constants.DISPATCHED_TASK_TYPE_FACE, pushPhoneArr[i], pushThreshold);
			}
		}
		
		dao.commit();
	}
}
