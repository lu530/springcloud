package com.suntek.efacecloud.dao;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;

/**
 * 频次检索封面dao
 * @author wujunying
 * @since 1.0.0
 * @version 2018-07-09
 * @Copyright (C)2018 , Suntektech
 */
public class NNInfoDao {

	private JdbcTemplate jdbc = EAP.jdbc.getTemplate();
	
	public void addInfo (List<Object[]> list) {
		
		String sql = "INSERT INTO VIID_NN_INFO (TASK_ID, PERSON_ID, INFO_ID, NUMS, CREATE_TIME) VALUES (?, ?, ?, ?, ?)";
		
		jdbc.batchUpdate(sql, list);
	}
}
