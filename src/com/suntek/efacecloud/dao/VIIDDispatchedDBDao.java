package com.suntek.efacecloud.dao;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.util.Constants;

/**
 * 布控库Dao
 * @author yangkang
 * @since 
 * @version 2018-05-08
 * @Copyright (C)2018, Suntektech
 */
public class VIIDDispatchedDBDao {
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	
	/**
	 * 添加布控库
	 * @param dbId
	 * @param dbName
	 * @param creator
	 * @param createTime
	 * @param orgCode
	 * @param dbType
	 * @param dbKind
	 * @param ENGINE_DB_ID
	 * @param db_total
	 */
	public boolean addVIIDDB(String dbId, String dbName, String creator, String createTime, String orgCode, int dbType, int dbKind, int thirdId, String db_total) throws SQLException {
		String sql = "insert into VIID_DISPATCHED_DB (DB_ID,DB_NAME,CREATOR,CREATE_TIME,ORG_CODE,DB_TYPE,DB_KIND,ENGINE_DB_ID,DB_TOTAL) values (?,?,?,?,?,?,?,?)";
		return jdbc.update(sql, dbId, dbName, creator, createTime, orgCode, dbType, dbKind, thirdId, db_total) > 0;
	}
	
	/**
	 * 根据库类型查询布控库
	 * @param db_type
	 * @return
	 */
	public List<Map<String, Object>> getDispatchedLibByDBType(int db_type, String db_name, int db_kind){
//		String sql = "select DB_ID,DB_NAME,DB_KIND from VIID_DISPATCHED_DB where 1=1 ";
		StringBuilder sql = new StringBuilder("select DB_ID,DB_NAME,DB_KIND,DB_TOTAL from VIID_DISPATCHED_DB where IS_TEMP = 0 ");
		
		if(db_type != 0) {
			sql.append(" and DB_TYPE = ").append(db_type).append(" ");
		}
		if(db_kind != 0) {
			sql.append(" and DB_KIND = ").append(db_kind).append(" ");
		}
		if(!StringUtil.isNull(db_name)){
			sql.append(" and DB_NAME like ").append("'%").append(db_name).append("%'");
		}
		
		return jdbc.queryForList(sql.toString());
	}
	
	public int countTempDBPersonNumber() {
		String sql = "select COUNT(distinct(p.PERSON_ID)) from VIID_DISPATCHED_PERSON p join VIID_DISPATCHED_DB db on db.DB_ID = p.DB_ID where db.IS_TEMP = 1 ";
		
		return jdbc.queryForObject(sql, Integer.class);
	}
	
	public List<Map<String, Object>> getTempDBIdCollection(){
		String sql = "select distinct(ENGINE_DB_ID) from VIID_DISPATCHED_DB where IS_TEMP = 1 ";
	
		return jdbc.queryForList(sql);
	}
}
