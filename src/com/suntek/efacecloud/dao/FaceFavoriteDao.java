package com.suntek.efacecloud.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.jdbc.NamedParameterJdbcTemplate;
import com.suntek.eap.metadata.Dao;
import com.suntek.efacecloud.util.Constants;

/**
 * 人脸收藏文件夹管理Dao
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
public class FaceFavoriteDao 
{
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	private NamedParameterJdbcTemplate nameJdbc = EAP.jdbc.getNamedParameterTemplate(Constants.APP_NAME);

	public boolean insertFavorite(Map<String, Object> map)
	{
		String insertFavoriteSql = "INSERT INTO EFACE_FAVORITE(FAVORITE_ID, LEVEL, PARENT_ID, CREATOR,"
                + "CREATE_TIME, STATUS, FAVORITE_NAME, FAVORITE_TYPE) VALUES(:FAVORITE_ID, :LEVEL, :PARENT_ID, :CREATOR,"
                + ":CREATE_TIME, :STATUS, :FAVORITE_NAME, :FAVORITE_TYPE)";
		
		return nameJdbc.update(insertFavoriteSql, map) > 0;
	}


	public Map<String, Object> getFavoirteById(String favoriteId) throws Exception {
		String sql = "select * from EFACE_FAVORITE where FAVORITE_ID = ?";
		List<Map<String, Object>> list = jdbc.queryForList(sql, favoriteId);
		if (list.isEmpty()) {
			return new HashMap<String, Object>();
		}
		return list.get(0);
	}

		public boolean isFavoriteNameExsist(String favoriteName, String favoriteId, String userCode)
	{
		String sql = "select count(1) from EFACE_FAVORITE where FAVORITE_NAME = ? and FAVORITE_ID <> ? and CREATOR = ?";
		return jdbc.queryForObject(sql, Integer.class, favoriteName, favoriteId, userCode) > 0;
	}
	
	public boolean updateFavoirteById(String favoriteId,String favoriteName) throws Exception
	{
		String sql = "update EFACE_FAVORITE set FAVORITE_NAME = ? where FAVORITE_ID = ?";
		return jdbc.update(sql,favoriteName,favoriteId) > 0;
	}
	
	public boolean deleteFavoirteById(String favoriteId) throws Exception
	{
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		
		String deleteFavoriteSql = "delete from EFACE_FAVORITE where FAVORITE_ID = ?";
		String deleteFavoriteFileSql = "delete from EFACE_FAVORITE_FILE where FAVORITE_ID = ?";
		
		String[] idsArray = favoriteId.split(",");
		for (int i = 0; i < idsArray.length; i++) {
			dao.addSQL(deleteFavoriteSql, idsArray[i]);
			dao.addSQL(deleteFavoriteFileSql, idsArray[i]);
		}
		
		int[] num=dao.commit();
		
		return num[0] > 0;
	}
}
