package com.suntek.efacecloud.dao;

import java.util.Date;
import java.util.Map;

import com.suntek.eap.EAP;
import com.suntek.eap.common.util.StringUtil;
import com.suntek.eap.jdbc.NamedParameterJdbcTemplate;
import com.suntek.efacecloud.util.Constants;

/**
 * 路人库检索频次任务dao
 * @author wujunying
 * @since 1.0.0
 * @version 2018-07-09
 * @Copyright (C)2018 , Suntektech
 */
public class NNTaskDao {

	private NamedParameterJdbcTemplate nameJdbc = EAP.jdbc.getNamedParameterTemplate(Constants.APP_NAME);
	
	public void addTask (Map<String, Object> params) {
		
		params.put("CREATE_TIME", new Date());
		
		if(StringUtil.isNull(StringUtil.toString(params.get("DEVICE_GROUP")))){
			params.put("DEVICE_GROUP", "");
		}
		
		String sql = "INSERT INTO VIID_NN_TASK (DEVICE_IDS, NUMS, THRESHOLD, FACE_SCORE, BEGIN_TIME,"
				+ " END_TIME, ALGO_TYPE, DEVICE_GROUP, CREATE_TIME, TASK_ID, CREATOR) VALUES (:DEVICE_IDS,"
				+ " :NUMS, :THRESHOLD, :FACE_SCORE, :BEGIN_TIME, :END_TIME, :ALGO_TYPE, :DEVICE_GROUP,"
				+ " :CREATE_TIME, :TASK_ID, :CREATOR)";
		
		nameJdbc.update(sql, params);
	}
}
