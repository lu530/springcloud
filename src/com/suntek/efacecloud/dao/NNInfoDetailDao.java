package com.suntek.efacecloud.dao;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;

/**
 * 路人库检索信息详情(个人详情)
 * @author wujunying
 * @since 1.0.0
 * @version 2018-07-09
 * @Copyright (C)2018 , Suntektech
 */
public class NNInfoDetailDao {
	
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate();
	
	public void addInfoDetail (List<Object[]> list) {
		
		String sql = "INSERT INTO VIID_NN_INFO_DETAIL (PERSON_ID, INFO_ID, CREATE_TIME) VALUES (?, ?, ?)";
		
		jdbc.batchUpdate(sql, list);
	}
	
}
