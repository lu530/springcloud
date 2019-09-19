package com.suntek.efacecloud.dao;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.efacecloud.util.Constants;

public class FaceAlgorithmNameDao {
	
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	
	public List<Map<String, Object>> getAlgorithNameList(String menuId)
	{
		String sql = "SELECT fatype.ALGORITHM_ID,fatype.ALGORITHM_DESC,fatype.ALGORITHM_NAME,eface.DEFAULT_SCORE FROM VPLUS_FACE_ALGORITHM_TYPE fatype, "
				+ "EFACE_FUNLIST_ALGO_REL eface WHERE eface.ALGORITHM_ID = fatype.ALGORITHM_ID AND MENUID = ?";
		//return jdbc.queryForList(sql);new Object[] {MASS_ALARM_LIB_TYPE}
		return jdbc.queryForList(sql, new Object[]{menuId});
		
	}
	
	public List<Map<String, Object>> getAlgorithmScoreRate(String algoType) {
		String sql = "SELECT SCORE_RATE FROM VPLUS_FACE_ALGORITHM_TYPE type  where ALGORITHM_ID = ? ";
		return jdbc.queryForList(sql,  algoType);
	}

	public List<Map<String, Object>> getFeiShiAlgorithmScoreRate(String DB_ID) {
		String sql = "SELECT ALGO_TYPE, THRESHOLD, DB_ID FROM VIID_DISPATCHED_FEISHI_ALGO_REL where DB_ID = ? ";
		return jdbc.queryForList(sql,  DB_ID);
	}
}
