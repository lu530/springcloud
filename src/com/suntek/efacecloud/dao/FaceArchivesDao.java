package com.suntek.efacecloud.dao;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.jdbc.DaoFactory;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.metadata.Dao;
import com.suntek.eap.util.SqlUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.util.Constants;

/**
 * 人员档案库dao操作类
 * @author swq
 * @since 1.0.0
 * @version 2017-07-08
 * @Copyright (C)2017 , Suntektech
 *
 */
public class FaceArchivesDao {
	
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	
	
	private DaoFactory factory = new DaoFactory();
	/**
	 * 新增人员和标签关联信息
	 * @param params
	 * @throws Exception
	 */
	public boolean add(Map<String,Object> params, List<Map<String,Object>> tags) throws Exception{
		
		
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		
		String	insertSql = "INSERT INTO EFACE_PERSON_ARCHIVE(PERSON_ID,NAME,SEX,IDENTITY_TYPE,IDENTITY_ID,BIRTHDAY,"
				+ "PERMANENT_ADDRESS,PRESENT_ADDRESS,QQ,TELEPHONE,WECHAT,WORK_ADDRESS,PIC,CREATOR,CREATE_TIME) VALUES(:PERSON_ID,:NAME,:SEX,:IDENTITY_TYPE,:IDENTITY_ID,"
				+ ":BIRTHDAY,:PERMANENT_ADDRESS,:PRESENT_ADDRESS,:QQ,:TELEPHONE,:WECHAT,:WORK_ADDRESS,:PIC,:CREATOR,:CREATE_TIME)";
	 
		dao.addNamedSQL(insertSql, params);
		
		for(Map<String,Object> tag : tags){
			
			 String insertTagsSql = "INSERT INTO EFACE_TAG_REL(ID, REL_ID, REL_TYPE,TAG_CODE) VALUES(:ID, :REL_ID, :REL_TYPE, :TAG_CODE)";
			 
			 dao.addNamedSQL(insertTagsSql, tag);
		}
		
	    int[] result = dao.commit();
	    
	    return result[0] > 0;
	}
	
	/**
	 * 新增人员和标签关联信息
	 * @param params
	 * @throws Exception
	 */
	public boolean add(Map<String,Object> params, Map<String,Object> tag) throws Exception{
		
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		
		String	insertSql = "INSERT INTO EFACE_PERSON_ARCHIVE(PERSON_ID,NAME,SEX,IDENTITY_TYPE,IDENTITY_ID,BIRTHDAY,"
				+ "PERMANENT_ADDRESS,PRESENT_ADDRESS,QQ,TELEPHONE,WECHAT,WORK_ADDRESS,PIC,CREATOR,CREATE_TIME) VALUES(:PERSON_ID,:NAME,:SEX,:IDENTITY_TYPE,:IDENTITY_ID,"
				+ ":BIRTHDAY,:PERMANENT_ADDRESS,:PRESENT_ADDRESS,:QQ,:TELEPHONE,:WECHAT,:WORK_ADDRESS,:PIC,:CREATOR,:CREATE_TIME)";
	 
		dao.addNamedSQL(insertSql, params);
		
		if (tag.size() > 0) {
			String insertTagsSql = "INSERT INTO EFACE_TAG_REL(ID, REL_ID, REL_TYPE,TAG_CODE) VALUES(:ID, :REL_ID, :REL_TYPE, :TAG_CODE)";
		    dao.addNamedSQL(insertTagsSql, tag);
		}
		
	    int[] result = dao.commit();
	    
	    return result[0] > 0;
	}
	
	/**
	 * 新增人员
	 * @param params
	 * @throws Exception
	 */
	public boolean add(Map<String,Object> params) throws Exception{
		
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		
		String	insertSql = "INSERT INTO EFACE_PERSON_ARCHIVE(PERSON_ID,NAME,SEX,IDENTITY_TYPE,IDENTITY_ID,BIRTHDAY,"
				+ "PERMANENT_ADDRESS,PRESENT_ADDRESS,QQ,TELEPHONE,WECHAT,WORK_ADDRESS,PIC,CREATOR,CREATE_TIME) VALUES(:PERSON_ID,:NAME,:SEX,:IDENTITY_TYPE,:IDENTITY_ID,"
				+ ":BIRTHDAY,:PERMANENT_ADDRESS,:PRESENT_ADDRESS,:QQ,:TELEPHONE,:WECHAT,:WORK_ADDRESS,:PIC,:CREATOR,:CREATE_TIME)";
	 
		dao.addNamedSQL(insertSql, params);
		
		
	    int[] result = dao.commit();
	    
	    return result[0] > 0;
	}
	
	/**
	 * 增加档案标识与档案人员标识的关系
	 * @param archivePrimaryKey
	 * @param archivePersonObj
	 */
	public void addRel(Object archivePrimaryKey, Object archivePersonObj) {
		String sql = "insert into ARCHIVE_ID_PERSON_ID_REL (ARCHIVE_ID,PERSON_ID) values (?,?)";
	    jdbc.update(sql, archivePrimaryKey, archivePersonObj);
	}
	
	/**
	 * 根据档案标识获取相关的档案人员标识
	 * @param archivePrimaryKey
	 * @return
	 */
	public List<Map<String,Object>> getPersonIdsByArchivePrimaryKey(Object archivePrimaryKey){
		String sql = "select PERSON_ID from ARCHIVE_ID_PERSON_ID_REL where ARCHIVE_ID = ? ";
		return jdbc.queryForList(sql, archivePrimaryKey);
	}
	
	/**
	 * 根据档案标识获取相关的档案人员标识
	 * @param archivePrimaryKey
	 * @return
	 */
	public List<Map<String,Object>> getPersonIdsByArchivePrimaryKey(Object[] archivePrimaryKeys){
		String sql = "select PERSON_ID from ARCHIVE_ID_PERSON_ID_REL where ARCHIVE_ID in  " + SqlUtil.getSqlInParams(archivePrimaryKeys);		
		return jdbc.queryForList(sql, archivePrimaryKeys);
	}
	
	/**
	 * 根据人员标识删除关系
	 * @param personId 
	 */
	public void delRelByPersonId(Object personId) {
		String sql = "delete from ARCHIVE_ID_PERSON_ID_REL where PERSON_ID = ?";
	    jdbc.update(sql,personId);
	}
	
	
	/**
	 * 更新人员和标签关联信息
	 * @param params
	 * @throws Exception
	 */
	public boolean update(Map<String,Object> params, List<Map<String,Object>> tags) throws Exception{
		
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		
		String	updateSql = "UPDATE EFACE_PERSON_ARCHIVE SET NAME = :NAME, SEX = :SEX, IDENTITY_TYPE = :IDENTITY_TYPE,"
				   + " BIRTHDAY = :BIRTHDAY, PERMANENT_ADDRESS = :PERMANENT_ADDRESS, PRESENT_ADDRESS = :PRESENT_ADDRESS,"
				   + " QQ = :QQ, TELEPHONE = :TELEPHONE, WECHAT = :WECHAT, WORK_ADDRESS = :WORK_ADDRESS WHERE PERSON_ID = :PERSON_ID";
	 
		dao.addNamedSQL(updateSql, params);
		 
		for(Map<String,Object> tag : tags){
			
			 String insertTagsSql = "INSERT INTO EFACE_TAG_REL(ID, REL_ID, REL_TYPE,TAG_CODE) VALUES(:ID, :REL_ID, :REL_TYPE, :TAG_CODE)";
			 
			 dao.addNamedSQL(insertTagsSql, tag);
		}
		
	    int[] result = dao.commit();
	    
	    ServiceLog.debug(result);
	    
	    return result[0] > 0;
	}
	
	/**
	 * 更新人员信息
	 * @param params
	 * @throws Exception
	 */
	public boolean update(Map<String,Object> params) throws Exception{
		
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		
		String	updateSql = "UPDATE EFACE_PERSON_ARCHIVE SET NAME = :NAME, SEX = :SEX, IDENTITY_TYPE = :IDENTITY_TYPE,"
				   + " BIRTHDAY = :BIRTHDAY, PERMANENT_ADDRESS = :PERMANENT_ADDRESS, PRESENT_ADDRESS = :PRESENT_ADDRESS, PIC = :PIC,"
				   + " QQ = :QQ, TELEPHONE = :TELEPHONE, WECHAT = :WECHAT, WORK_ADDRESS = :WORK_ADDRESS WHERE PERSON_ID = :PERSON_ID";
		
		dao.addNamedSQL(updateSql, params);
		
		int[] result = dao.commit();
		
		return result[0] > 0;
	}
	
	/**
	 * 更新人员封面信息
	 * @param personId
	 * @param pic
	 * @return
	 * @throws Exception
	 */
	public boolean updateCover(String personId, String pic) throws Exception{
		
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		
		String	updateSql = "UPDATE EFACE_PERSON_ARCHIVE SET PIC = ? WHERE PERSON_ID = ?";
		
		dao.addSQL(updateSql, pic, personId);
		
		int[] result = dao.commit();
		
		return result[0] > 0;
	}
	
	/**
	 * 证件号码是否存在
	 * @param identityId
	 * @return
	 * @throws Exception
	 */
	public boolean isIdentityIdExsist(String identityId) throws Exception{
		
		String sql = "SELECT COUNT(1) FROM EFACE_PERSON_ARCHIVE WHERE IDENTITY_ID = ?";
		
		return jdbc.queryForObject(sql, Integer.class, identityId) > 0;
	}
	
	/**
	 * 查找标签关联对应的人员标签
	 * @param personId
	 * @param tagCode
	 * @return
	 * @throws Exception
	 */
	public List<Map<String,Object>> queryTagCodeByPersonId(String personId) throws Exception{
		
		String sql = "SELECT DISTINCT a.TAG_CODE,b.TAG_NAME FROM EFACE_TAG_REL a LEFT JOIN EFACE_PERSON_TAG b on a.TAG_CODE = b.TAG_CODE WHERE a.REL_ID = ?";
		
		return jdbc.queryForList(sql,personId);
	}
	
	/**
	 * 根据人员标签查找人员ID
	 * @param personId
	 * @param tagCode
	 * @return
	 * @throws Exception
	 */
	public List<Map<String,Object>> queryPersonIdByTagCode(String[] personTag){
		
		String sql = "SELECT DISTINCT REL_ID FROM EFACE_TAG_REL WHERE TAG_CODE in" + SqlUtil.getSqlInParams(personTag);
		
		return jdbc.queryForList(sql,personTag);
	}
	
	/**
	 * 根据证件号码获取人员信息
	 * @param identityId
	 * @return
	 * @throws Exception
	 */
	public Map<String,Object> queryPersonByIdentytyId(String identityId) throws Exception{
		
		String sql = "SELECT * FROM EFACE_PERSON_ARCHIVE WHERE IDENTITY_ID = ?";
		List<Map<String,Object>> list = jdbc.queryForList(sql,identityId);		
		if(list.size() > 0){
			return list.get(0);
		}		
		return null;
	}
	
	/**
	 * 根据证件号码获取人员ID
	 * @param identityId
	 * @return
	 * @throws Exception
	 */
	public Map<String,Object> getPersonIdByIdentytyId(String identityId) throws Exception{
		
		String sql = "SELECT PERSON_ID FROM EFACE_PERSON_ARCHIVE WHERE IDENTITY_ID = ?";
		List<Map<String,Object>> list = jdbc.queryForList(sql,identityId);		
		if(list.size() > 0){
			return list.get(0);
		}		
		return null;
	}
	
	
	public String getFileIdByPicName(String picName) {
		String sql = "select * from PIC_FILE_ID where PIC_NAME = ?";
		List<Map<String, Object>> list = jdbc.queryForList(sql, picName);
		if (list.isEmpty()) {
			return null;
		}
		return StringUtil.toString(list.get(0).get("FILE_ID"));
	}
	
	public List<Map<String,Object>> getTopN(int topN){
		if(factory.ifUseMySql(Constants.APP_NAME)) {
			String sql = "select * from PIC_FILE_ID order by PIC_NAME limit 0, " + topN;
			List<Map<String, Object>> list = jdbc.queryForList(sql);
			sql = "delete from PIC_FILE_ID where PIC_NAME in(select PIC_NAME from PIC_FILE_ID order by PIC_NAME limit 0," + topN + ")";
			jdbc.update(sql);
			return list;
		}else {
			String sql = "select top(" + topN + ") * from PIC_FILE_ID order by PIC_NAME";
			List<Map<String, Object>> list = jdbc.queryForList(sql);
			sql= "delete from PIC_FILE_ID where PIC_NAME in(select top " + topN + " PIC_NAME  from PIC_FILE_ID order by PIC_NAME)";
			jdbc.update(sql);
			return list;
		}
	}
	
	
	
	/**
	 * 根据人员id获取人员信息
	 * @param identityId
	 * @return
	 * @throws Exception
	 */
	public Map<String,Object> queryPersonByPersonId(String personId) throws Exception{
		
		String sql = "SELECT * FROM EFACE_PERSON_ARCHIVE WHERE PERSON_ID = ?";
		
		List<Map<String,Object>> list = jdbc.queryForList(sql,personId);
		
		if(list.size() > 0){
			return list.get(0);
		}
		
		return null;
	}
	
	/**
	 * 根据人员id获取人员信息
	 * @param identityId
	 * @return
	 * @throws Exception
	 */
	public List<Map<String,Object>> queryPersonByPersonId(String[] personIds) throws Exception{
		
		String sql = "SELECT * FROM EFACE_PERSON_ARCHIVE WHERE PERSON_ID in" + SqlUtil.getSqlInParams(personIds);
		
		List<Map<String,Object>> list = jdbc.queryForList(sql,personIds);
		
		return list;
	}
	
	/**
	 * 根据传入的sql语句获取人员信息
	 * @param identityId
	 * @return
	 * @throws Exception
	 */
	public List<Map<String,Object>> queryPersonBySql(String sql, Object[] params) throws Exception{
		
		List<Map<String,Object>> list = jdbc.queryForList(sql,params);
		
		return list;
	}
	
	/**
	 * 根据人员id删除人员信息
	 * @param id
	 * @return
	 * @throws Exception
	 */
	public boolean deleteById(String[] personId) throws Exception{
		
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		
		String deleteArchiveSql = "DELETE FROM EFACE_PERSON_ARCHIVE WHERE PERSON_ID in" + SqlUtil.getSqlInParams(personId);
		dao.addSQL(deleteArchiveSql, personId);
		
		String deleteTagRelSql = "DELETE FROM EFACE_TAG_REL WHERE REL_ID in" + SqlUtil.getSqlInParams(personId);
		dao.addSQL(deleteTagRelSql, personId);
		
		String sql = "delete from ARCHIVE_ID_PERSON_ID_REL where ARCHIVE_ID in " + SqlUtil.getSqlInParams(personId);
		dao.addSQL(sql, personId);
		
        int[] result = dao.commit();
	    
	    return result[0] > 0;
	}
	
}
