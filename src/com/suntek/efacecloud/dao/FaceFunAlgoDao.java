package com.suntek.efacecloud.dao;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.metadata.Dao;
import com.suntek.efacecloud.util.Constants;

/**
 * 人脸算法与菜单关联表
 * @author liuxiang
 * @since 
 * @version 2018年7月18日
 * @Copyright (C)2018 , Suntektech
 */
public class FaceFunAlgoDao {
	
	/*public boolean add(String menuId, String[] algoListStr,String de_score) throws SQLException {

		String sql = "insert into EFACE_FUNLIST_ALGO_REL (MENUID, ALGORITHM_ID, DEFAULT_SCORE) values (?, ?, ?)";
		for(String algo : algoListStr){
			dao.addSQL(sql, new Object[]{menuId, algo, de_score});
		}
		int[] result = dao.commit();
		return result[0] > 0;
	}*/
	public boolean add(String menuId, String ALGO_LIST) throws SQLException {
		
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		JSONArray algoArr = JSON.parseArray(ALGO_LIST);
		
		String sql = "insert into EFACE_FUNLIST_ALGO_REL (MENUID, ALGORITHM_ID, DEFAULT_SCORE) values (?, ?, ?)";
		for(int i = 0; i < algoArr.size(); i++){
			JSONObject algo = (JSONObject)algoArr.get(i);
			dao.addSQL(sql, new Object[]{menuId, algo.get("ALGO_CODE"), algo.get("SCORE")});
		}
		int[] result = dao.commit();
		return result[0] > 0;
	}
	
	public boolean update(String menuId, String ALGO_LIST) throws SQLException {
		
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		String sql_delete = "delete from EFACE_FUNLIST_ALGO_REL where MENUID = ?";
		dao.addSQL(sql_delete, menuId);
		
		JSONArray algoArr = JSON.parseArray(ALGO_LIST);
		
		String sql_add = "insert into EFACE_FUNLIST_ALGO_REL (MENUID, ALGORITHM_ID, DEFAULT_SCORE) values (?, ?, ?)";
		for(int i = 0; i < algoArr.size(); i++){
			JSONObject algo = (JSONObject)algoArr.get(i);
			dao.addSQL(sql_add, new Object[]{menuId, algo.get("ALGO_CODE"), algo.get("SCORE")});
		}
		
		int[] result = dao.commit();
		return result[0] > 0;
	}
	
	public boolean delete(String menuId) throws SQLException {
		
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		String sql = "delete from EFACE_FUNLIST_ALGO_REL where MENUID = ?";
		dao.addSQL(sql, menuId);
		int[] result = dao.commit();
		return result[0] > 0;
		
	}

	public List<Map<String, Object>> query() {
		
		JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
		String sql = "select * from EFACE_FUNLIST_ALGO_REL";
		
		return jdbc.queryForList(sql);
	}
	
}
