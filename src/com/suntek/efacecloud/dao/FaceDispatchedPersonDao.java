package com.suntek.efacecloud.dao;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.springframework.jdbc.core.JdbcTemplate;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.jdbc.dialect.Dialect;
import com.suntek.eap.jdbc.dialect.DialectFactory;
import com.suntek.eap.metadata.Dao;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.SqlUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.elastic.rdd.util.StringUtil;
/**
 * 布控人员
 * @author suntek
 * @since 1.0.0
 * @version 2017-08-03
 */
public class FaceDispatchedPersonDao {
	
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	
	private Dialect dialect = DialectFactory.getDialect(Constants.APP_NAME, "");
	
	/**
	 * 添加布人员到布控库
	 * @param portraitID
	 * @param libId
	 * @param personName
	 * @param personSex
	 * @param identityType
	 * @param identityId
	 * @param birthday
	 * @param permanentAddress
	 * @param presentAddress
	 * @param userCode
	 * @param createTime
	 * @param personId
	 * @param pic
	 */
	public boolean addPerson(String libId, String personName,
			String personSex, String identityType, String identityId,String birthday,
			String permanentAddress, String presentAddress, String userCode,
			String createTime, String personId,String pic) {
		String sql = "insert into EFACE_DISPATCHED_PERSON (PERSON_ID, DB_ID, NAME, SEX, IDENTITY_TYPE, IDENTITY_ID, BIRTHDAY,PERMANENT_ADDRESS,PRESENT_ADDRESS,CREATOR, CREATE_TIME, PIC) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";
		return jdbc.update(sql, personId, libId, personName, personSex, identityType, identityId,birthday,permanentAddress, presentAddress,userCode, createTime, pic)>0;
	}
	
	/**
	 * 修改布控库-人
	 * @param personId
	 * @param libId
	 * @param personName
	 * @param personSex
	 * @param identityType
	 * @param identityId
	 * @param birthday
	 * @param permanentAddress
	 * @param presentAddress
	 * @param userCode
	 * @param createTime
	 * @param pic
	 */
	public boolean updatePerson(String newObjId, String personName, String personSex, String identityId,String birthday,
			String permanentAddress, String presentAddress, String userCode,
			String createTime, String personId, String pic) {
		String sql = "update EFACE_DISPATCHED_PERSON set PERSON_ID = ?, NAME = ?, SEX = ?, IDENTITY_ID = ?, BIRTHDAY = ?,"
				+ "PERMANENT_ADDRESS = ?, PRESENT_ADDRESS = ?, CREATOR = ?, CREATE_TIME = ?, PIC = ? where PERSON_ID = ?";
		return jdbc.update(sql, newObjId, personName, personSex, identityId, birthday, permanentAddress, presentAddress,userCode, createTime, pic, personId)>0;
	}
	
	/**
	 * 修改布控库-人
	 * 修改业务表
	 * @param personId
	 * @param personName
	 * @param personSex
	 * @param identityType
	 * @param identityId
	 * @param birthday
	 * @param permanentAddress
	 * @param presentAddress
	 */
	public boolean updatePersonLocalPort(String dbId, String personId, String name, String sex, String identityType,
			String identityId, String birthday, String premanentAddress, String presentAddress, String filingUnit,
			String filingUnitTel, String caseId, String caseName, String briefCase) {
		String sql = "update EFACE_DISPATCHED_PERSON set NAME = ?, SEX = ?, IDENTITY_ID = ?, BIRTHDAY = ?, IDENTITY_TYPE = ?, "
				+ "PERMANENT_ADDRESS = ?, PRESENT_ADDRESS = ?, FILING_UNIT = ?, FILING_UNIT_TELPHONE = ?, "
				+ "CASE_ID = ?, CASE_NAME = ?, BRIEF_CASE = ? where PERSON_ID = ?";
		return jdbc.update(sql, name, sex, identityId,birthday,identityType,premanentAddress,presentAddress,filingUnit,
				filingUnitTel,caseId,caseName,briefCase,personId) > 0;
	}
	
	/**
	 * 删除布控库人像
	 * @param portraitID
	 * @param b
	 */
	public void deleteLocalStorePort(String personId, String dbId){
		String sql = "delete from EFACE_DISPATCHED_PERSON where PERSON_ID = ? and DB_ID = ? ";
		jdbc.update(sql, personId, dbId);
	}
	
	/**
	 * 查询布控人员详情
	 * @param personId
	 */
	public Map<String, Object> personDetail(String personId) {
//		String sql = " select NAME, PIC, SEX, IDENTITY_ID, IDENTITY_TYPE, BIRTHDAY,FILE_ID,  " + dialect.isnull("PERMANENT_ADDRESS", "''")
//				+ " PERMANENT_ADDRESS, " + dialect.isnull("PRESENT_ADDRESS", "''")
//				+ " PRESENT_ADDRESS, FEATURE_ID, FEATURE_VALUE " + "from EFACE_DISPATCHED_PERSON where PERSON_ID = ?";
//
//		List<Map<String, Object>> resultList = jdbc.queryForList(sql, personId);
//		if (CollectionUtils.isNotEmpty(resultList)) {
//			return resultList.get(0);
//		}
//		return Collections.emptyMap();
		String sql = "select vp.*,ep.FILING_UNIT,ep.FILING_UNIT_TELPHONE,ep.CASE_ID,ep.CASE_NAME,ep.BRIEF_CASE from VIID_DISPATCHED_PERSON vp join EFACE_DISPATCHED_PERSON ep on ep.PERSON_ID = vp.PERSON_ID " 
				+ "where vp.PERSON_ID = ? ";
		List<Map<String, Object>> resultList = jdbc.queryForList(sql, personId);
		if (CollectionUtils.isNotEmpty(resultList)) {
			Map<String, Object> person = resultList.get(0);
			String sqlTag = "select TAG_CODE from VIID_DISPATCHED_PERSON_TAG_REL where PERSON_ID = ? ";
			List<String> tagList = listMapToList(jdbc.queryForList(sqlTag, personId));
			person.put("tagList", tagList);
			
			String sqlAttach = "select * from EFACE_DISPATCHED_PERSON_ATTACH where PERSON_ID = ? ";
			List<Map<String,Object>> attachList = jdbc.queryForList(sqlAttach, personId);
			person.put("attachList", attachList);
			
			return person;
		}
		
		return Collections.emptyMap();
	}

	/**
	 * tranfer List<Map> to List<String>, Map has only one key
	 * @param queryForList
	 */
	private List<String> listMapToList(List<Map<String, Object>> queryForList) {
		List<String> tagList = new ArrayList<>();
		if(queryForList != null) {
			for(Map<String, Object> map : queryForList) {
				tagList.add((String)map.get("TAG_CODE"));
			}
		}
		
		return tagList;
	}

	/**
	 * 根据证件号码查询人员信息
	 * @param personId
	 */
	public Map<String, Object> queryPersonByIdentityId(String identityId,String dbId) {
		String sql=" select PERSON_ID,NAME, PIC, SEX, IDENTITY_ID, BIRTHDAY, PERMANENT_ADDRESS, PRESENT_ADDRESS "
				+ "from EFACE_DISPATCHED_PERSON where IDENTITY_ID = ? and DB_ID = ?";
		
		List<Map<String, Object>> resultList =  jdbc.queryForList(sql, identityId,dbId);
		if (CollectionUtils.isNotEmpty(resultList)) {
			return resultList.get(0);	
		}
		
		return Collections.emptyMap();
	}
	
	/**
	 * 根据多个personId获取信息
	 * @param personIds
	 * @return
	 */
	public List<Map<String,Object>> queryPersonByPersonId(String personIds){
		
		String[] personIdArr = personIds.split(",");
		
		String sql = "select * from EFACE_DISPATCHED_PERSON where PERSON_ID in " + SqlUtil.getSqlInParams(personIdArr);
		
		List<Map<String,Object>> result = jdbc.queryForList(sql,personIdArr);
		
		return result;
	}
	
    /**
     * 根据条件获取人员信息
     * @param dbId
     * @param sex
     * @param keywords
     * @return
     */
	public List<Map<String, Object>> getPersonsMsg(String dbId, String sex,String keywords) {
		
		String sql = "select * from EFACE_DISPATCHED_PERSON where 1=1 ";
		List<Object> params = new ArrayList<Object>();
		
		if(!StringUtil.isEmpty(dbId)){
			sql += " and DB_ID = ? ";
			params.add(dbId);
		}
		
		if(!StringUtil.isEmpty(sex)){
			sql += " and SEX = ? ";
			params.add(sex);
		}
		
		if(!StringUtil.isEmpty(keywords)){
			sql += " and NAME like ? and IDENTITY_ID like ? ";
			params.add(keywords);
			params.add(keywords);
		}
		
		List<Map<String, Object>> list = jdbc.queryForList(sql, params.toArray(new Object[]{}));
		
		return list;
	}
	
	public boolean addPerson(Map<String, Object> params) throws SQLException {
		Dao dao = EAP.schema.getDao(Constants.APP_NAME);
		String infoSql = "insert into EFACE_DISPATCHED_PERSON( PERSON_ID, DB_ID,  FILING_UNIT, FILING_UNIT_TELPHONE, CASE_ID, CASE_NAME, BRIEF_CASE) "
				+ "values ( :PERSON_ID, :DB_ID, :FILING_UNIT, :FILING_UNIT_TELPHONE, :CASE_ID, :CASE_NAME, :BRIEF_CASE ) ";
		dao.addNamedSQL(infoSql, params);

		// 附件信息处理
		String attachInfo = StringUtil.toString(params.get("ATTACH_INFO"));
		addAttachInfo(params.get("PERSON_ID"), attachInfo, dao, params.get("CREATOR"));

//		// 审核、审批用户处理
//		params.put("AUDIT_TYPE", SurveilProcessType.AUDIT.getType());
//		params.put("APPROVE_TYPE", SurveilProcessType.APPROVE.getType());
//		setApproveUser(params, dao);

		int[] result = dao.commit();
		return result[0] > 0;
	}
	
	//新增附件
	private void addAttachInfo(Object personId, String attachInfo, Dao dao, Object creator) {
		if(!StringUtil.isEmpty(attachInfo)) {
			JSONArray attachList = JSONArray.parseArray(attachInfo);
			String attachSql = "insert into EFACE_DISPATCHED_PERSON_ATTACH(FILE_ID, PERSON_ID, "
					+ " FILE_NAME, FILE_EXT, FILE_SIZE, FILE_URL, CREATOR, CREATE_TIME) values(:FILE_ID, :PERSON_ID, "
					+ ":FILE_NAME, :FILE_EXT, :FILE_SIZE, :FILE_URL, :CREATOR, :CREATE_TIME)";
			for(int i = 0; i < attachList.size(); i++) {
				JSONObject attachObj = attachList.getJSONObject(i);
				Map<String, Object> attachMap = new HashMap<>();
				attachMap.put("FILE_ID", EAP.keyTool.getUUID());
				attachMap.put("PERSON_ID", personId);
				attachMap.put("FILE_NAME", attachObj.getString("FILE_NAME"));
				attachMap.put("FILE_EXT", attachObj.getString("FILE_EXT"));
				attachMap.put("FILE_SIZE", attachObj.getString("FILE_SIZE"));
				attachMap.put("FILE_URL", attachObj.getString("FILE_URL"));
				attachMap.put("CREATOR", creator);
				attachMap.put("CREATE_TIME", DateUtil.getDateTime());
				dao.addNamedSQL(attachSql, attachMap);
			}
		}
	}

		
	/**
	 * 更新人员状态（湛江——确认抓捕新增）
	 * @param status
	 * @param updateTime
	 * @param personId
	 * @return
	 */
	public boolean updatePersonStatus(int status,String updateTime,String personId){
		String sql = "update EFACE_DISPATCHED_PERSON set STATUS = ?, UPDATE_TIME = ? where PERSON_ID = ?";
		return jdbc.update(sql, status,updateTime,personId)>0;
	}
	
	public List<Map<String,Object>> queryByPersonId(String personId){
		String sql = "SELECT * FROM VIID_DISPATCHED_PERSON WHERE PERSON_ID = ?";
		return jdbc.queryForList(sql,personId);
	}
	
}
