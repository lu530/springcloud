package com.suntek.efacecloud.dao;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.jdbc.NamedParameterJdbcTemplate;
import com.suntek.efacecloud.util.Constants;

/**
 * 移动终端库Dao层
 * @author lx
 * @since 1.0.0
 * @version 2017-07-24
 * @Copyright (C)2017 , Suntektech
 */
public class FaceTerminalDao 
{
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);

	private NamedParameterJdbcTemplate nameJdbc = EAP.jdbc.getNamedParameterTemplate(Constants.APP_NAME);

	public boolean add(Map<String, Object> params) 
	{
		String sql = "insert into EFACE_MOBILE_TERMINAL_INFO(INFO_ID, NAME, SEX, PIC, IDENTITY_TYPE, IDENTITY_ID, BIRTHDAY, "
				+ "PERMANENT_ADDRESS, PRESENT_ADDRESS,  CREATOR, CREATE_TIME) values (:INFO_ID, :NAME, :SEX, "
				+ ":PIC, :IDENTITY_TYPE, :IDENTITY_ID, :BIRTHDAY, :PERMANENT_ADDRESS, :PRESENT_ADDRESS,"
				+ ":CREATOR, :CREATE_TIME)";
		
		return nameJdbc.update(sql, params) > 0;
	}
	
	public boolean updateRltz(String infoId, String rltz) 
	{
		String sql = "update EFACE_MOBILE_TERMINAL_INFO set RLTZ = ? where INFO_ID = ?";
		
		return jdbc.update(sql, rltz, infoId) > 0;
	}
	
	public boolean delete(String infoId) 
	{
		String sql = "delete from EFACE_MOBILE_TERMINAL_INFO where INFO_ID = ?";
		
		return jdbc.update(sql, infoId) > 0;
	}
	
	public List<Map<String, Object>> getSyncImgList()
	{
		String sql = "select INFO_ID ID, PIC IMG from EFACE_MOBILE_TERMINAL_INFO where RLTZ is null or RLTZ = ''";
		return jdbc.queryForList(sql);
	}
	
	public List<Map<String, Object>> getAllSyncDataList()
	{
		String sql = "select INFO_ID, RLTZ, NAME, SEX, PIC, IDENTITY_TYPE, IDENTITY_ID, BIRTHDAY, PERMANENT_ADDRESS, "
				+ "PRESENT_ADDRESS, PIC_QUALITY, CREATOR, CREATE_TIME "
				+ "from EFACE_MOBILE_TERMINAL_INFO where RLTZ is not null and RLTZ <> ''";
		return jdbc.queryForList(sql);
	}
}
