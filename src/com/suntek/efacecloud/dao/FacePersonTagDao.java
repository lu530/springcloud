package com.suntek.efacecloud.dao;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.util.Constants;

/**
 * 人员标签Dao
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
public class FacePersonTagDao 
{
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);

	public List<Map<String, Object>> getPersonTagList()
	{
		String sql = "select TAG_CODE, TAG_NAME, DB_ID from EFACE_PERSON_TAG";
		return jdbc.queryForList(sql);
	}
	
	public String  getTagInfoByDb(String dbId){
		String sql = "select TAG_CODE from EFACE_PERSON_TAG where DB_ID = ?";
		List<Map<String, Object>> list = jdbc.queryForList(sql, dbId);
		
		if (list.isEmpty()) {
			return "";
		}
		
		return StringUtil.toString(list.get(0).get("TAG_CODE"));
	}

}
