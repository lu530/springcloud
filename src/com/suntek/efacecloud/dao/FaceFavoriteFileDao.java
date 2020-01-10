package com.suntek.efacecloud.dao;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.metadata.Dao;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.util.Constants;

/**
 * 人脸收藏图片管理Dao
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
public class FaceFavoriteFileDao 
{
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);

	public boolean isFavoriteFileExsist(String favoriteId, String infoId) 
	{
		String sql = "select count(1) from EFACE_FAVORITE_FILE where FAVORITE_ID = ? and INFO_ID = ?";
		return jdbc.queryForObject(sql, Integer.class, favoriteId, infoId) > 0;
	}


	public Map<String, Object> getFavoriteFile(String favoriteId, String fileId) throws Exception
	{
		String sql = "select * from EFACE_FAVORITE_FILE where FAVORITE_ID = ? and FILE_ID = ?";
		List<Map<String, Object>> list = jdbc.queryForList(sql, favoriteId, fileId);
		if (list.isEmpty()){
			return new HashMap<String, Object>();
		}
		return list.get(0);
	}
	
	/**
	 * 支持批量删除，文件ID以逗号分隔传进来
	 * @param favoriteId
	 * @param fileId
	 * @return
	 * @throws Exception
	 */
	public boolean deleteFavoriteFile(String favoriteId, String fileId) throws Exception 
	{
		String sql = "delete from EFACE_FAVORITE_FILE where FAVORITE_ID = ? and FILE_ID = ?";
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		String[] fileIdArr = fileId.split(",");
		for (int i = 0; i < fileIdArr.length; i++) {
			dao.addSQL(sql, favoriteId, fileIdArr[i]);
		}
		
		int[] num = dao.commit();
		
		return num[0] > 0;
	}
	public boolean updateFavoriteFile(Map<String, Object> params) throws SQLException 
	{
		String fileId = StringUtil.toString(params.get("FILE_ID")); //--文件ID
		String name = StringUtil.toString(params.get("NAME"));
		String sex = StringUtil.toString(params.get("SEX"));
		String identity_type = StringUtil.toString(params.get("IDENTITY_TYPE"));
		String identity_id = StringUtil.toString(params.get("IDENTITY_ID"));
		String permanent_address = StringUtil.toString(params.get("PERMANENT_ADDRESS")); //户籍地址
		String present_addrss = StringUtil.toString(params.get("PRESENT_ADDRESS"));//现住址
		String pic = StringUtil.toString(params.get("PIC"));//图片地址
		String birthday = StringUtil.toString(params.get("BIRTHDAY"));
			
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		
		String updateFavoriteFileSql = "UPDATE EFACE_FAVORITE_FILE SET NAME = ?, SEX = ?, IDENTITY_TYPE = ?, IDENTITY_ID = ?, "
				+ " PERMANENT_ADDRESS = ?, PRESENT_ADDRESS = ?, PIC = ?, BIRTHDAY = ? "
				+ " WHERE FILE_ID = ?";
		
		dao.addSQL(updateFavoriteFileSql, name, sex, identity_type, identity_id, permanent_address, present_addrss, pic, birthday, fileId);
		
		String deleteSql = "delete  from EFACE_TAG_REL where REL_TYPE = ? AND REL_ID = ?";
		dao.addSQL(deleteSql, Constants.REL_TYPE_FACE, fileId);
		
		String relId = fileId;
		String insertTagSql = "insert into EFACE_TAG_REL(ID, REL_ID, REL_TYPE, TAG_CODE) values (?, ?, ?, ?)";
		String personTag = StringUtil.toString(params.get("PERSON_TAG")); //人员标签
		String[] tags = personTag.split(",");
		for (int i = 0; i < tags.length; i++) {
			dao.addSQL(insertTagSql, EAP.keyTool.getUUID(),  relId, Constants.REL_TYPE_FACE, tags[i]);
		}
		
		int[] num = dao.commit();
		
		return num[0] > 0;
	}
	
	public List<Map<String, Object>> detailFavoriteFile(String fileId) 
	{
		String detailSql = " select NAME, SEX, IDENTITY_TYPE,IDENTITY_ID,PERMANENT_ADDRESS, PRESENT_ADDRESS, PIC, BIRTHDAY	 "
				+ "from EFACE_FAVORITE_FILE where FILE_ID = ?";
		
		return jdbc.queryForList(detailSql, fileId);
	}
	
	public List<Map<String, Object>> detailFavoriteFileTag(String fileId) 
	{
		String detailSql = "select  TAG_CODE from EFACE_TAG_REL where 1=1 AND REL_TYPE = ? AND REL_ID = ?";
		return jdbc.queryForList(detailSql,  Constants.REL_TYPE_FACE, fileId);
	}
	
	public boolean insertFavoriteFile(Map<String, Object> params) throws SQLException
	{
		List<String> sqlList = new ArrayList<String>();
		List<Map<String, Object>> paramList = new ArrayList<Map<String ,Object>>();
		
		String insertFavoriteFileSql = "INSERT INTO EFACE_FAVORITE_FILE(FILE_ID, FAVORITE_ID, INFO_ID, SOURCE_DB_ID,"
				+ "SOURCE_DB_NAME, DISPATCHED_DB_ID, DISPATCHED_DB_NAME, DEVICE_ID, DEVICE_NAME, NAME,"
				+ "SEX, IDENTITY_TYPE, IDENTITY_ID, PERMANENT_ADDRESS, PRESENT_ADDRESS, PIC, CAPTURE_PIC, "
				+ "CREATOR, CREATE_TIME, BIRTHDAY, FILE_SOURCE, CAPTURE_TIME) VALUES (:FILE_ID, :FAVORITE_ID, :INFO_ID, :SOURCE_DB_ID, :SOURCE_DB_NAME,"
				+ ":DISPATCHED_DB_ID, :DISPATCHED_DB_NAME, :DEVICE_ID, :DEVICE_NAME, :NAME, :SEX, :IDENTITY_TYPE,"
				+ ":IDENTITY_ID, :PERMANENT_ADDRESS, :PRESENT_ADDRESS, :PIC, :CAPTURE_PIC, :CREATOR, :CREATE_TIME, :BIRTHDAY, :FILE_SOURCE, :CAPTURE_TIME)";
		
		sqlList.add(insertFavoriteFileSql);
		paramList.add(params);
		
		String relId = StringUtil.toString(params.get("FILE_ID"));
		String insertTagSql = "insert into EFACE_TAG_REL(ID, REL_ID, REL_TYPE, TAG_CODE) values (:ID, :REL_ID, :REL_TYPE, :TAG_CODE)";
		String personTag = StringUtil.toString(params.get("PERSON_TAG")); //人员标签
		String[] tags = personTag.split(",");
		for (int i = 0; i < tags.length; i++) {
			Map<String, Object> mapParam = new HashMap<String, Object>();
			mapParam.put("ID", EAP.keyTool.getUUID());
			mapParam.put("REL_ID", relId);
			mapParam.put("REL_TYPE", Constants.REL_TYPE_FACE);
			mapParam.put("TAG_CODE", tags[i]);
			
			sqlList.add(insertTagSql);
			paramList.add(mapParam);
		}
		
		int[] num = EAP.jdbc.getNameParameterTransactionTemplate(Constants.APP_NAME).batchUpdate(sqlList.toArray(new String[]{}), paramList);
		return num[0]> 0;
	}
}
