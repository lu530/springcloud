package com.suntek.efacecloud.dao;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.efacecloud.util.Constants;

/**
 * 人员专题库Dao
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
public class FaceSpecialDao 
{
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);

	/**库类型(0人1车)**/
	private static int DB_TYPE_PERSON = 0;
	
	private final static String ADD_LIB_SQL = "insert into SPECIAL_LIB (DB_ID, DB_KIND, DB_TYPE, DB_NAME, CREATOR, CREATE_TIME) values( ?,?,?,?,?,?)";
	
	private final static String ADD_LIB_ALGO_REL_SQL = "insert into SPECIAL_LIB_ALGO_REL(DB_ID, ALGO_TYPE) values( ?, ?)";
	
	private final static String UPDATE_LIB_SQL = "update SPECIAL_LIB set DB_NAME = ? where DB_ID = ?";
	
	private final static String DELETE_LIB_SQL = "delete from SPECIAL_LIB where DB_ID = ?";
	
	public void addSpecialLib(String dbId, int dbKind,  String dbName, String creator,String createTime , List<Integer> algos) throws SQLException{
		List<String> sqls = new ArrayList<String>();
		List<Object[]> params = new ArrayList<>();
		sqls.add(ADD_LIB_SQL);
		params.add(new Object[] {dbId, dbKind, DB_TYPE_PERSON, dbName,creator,createTime});
		for(Integer algo : algos) {
			sqls.add(ADD_LIB_ALGO_REL_SQL);
			params.add(new Object[] {dbId, algo});
		}
		EAP.jdbc.getTransactionTemplate(Constants.APP_NAME).batchUpdate(sqls.toArray(new String[]{}), params);
	}
	
	public void updateSpecialLib(String dbId,String dbName){
		jdbc.update(UPDATE_LIB_SQL, dbName, dbId);
	}
	
	public void deleteSpecialLib(String dbId){
		jdbc.update(DELETE_LIB_SQL, dbId);
	}
	
	public List<Map<String, Object>> getAllInitDbList()
	{
		String sql = "select DB_ID, DB_NAME from SPECIAL_LIB where DB_KIND = 0 and DB_TYPE = 0"; //库种类（0专题1个人） 库类型(0人1车)
		return jdbc.queryForList(sql);
	}
	
	public int getTotalSpecialLibNum()
	{
		String sql = "select count(1) from SPECIAL_LIB where 1=1  and DB_TYPE = 0";
		return jdbc.queryForObject(sql, Integer.class);
	}
}
