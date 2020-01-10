package com.suntek.efacecloud.dao;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.suntek.eap.common.util.SqlUtil;
import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.common.util.StringUtil;
import com.suntek.eap.jdbc.NamedParameterJdbcTemplate;
import com.suntek.efacecloud.util.Constants;

/**
 * 红名单库Dao层
 * @author lx
 * @since 1.0.0
 * @version 2018-03-05
 * @Copyright (C)2018 , Suntektech
 */
public class FaceRedListDao 
{
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	
	private NamedParameterJdbcTemplate namedJdbc = EAP.jdbc.getNamedParameterTemplate(Constants.APP_NAME);
	
	public boolean add(Map<String, Object> param) 
	{
		String sql = "insert into EFACE_RED_LIST(INFO_ID, NAME, SEX, PIC, IDENTITY_TYPE, IDENTITY_ID, BIRTHDAY, "
				+ "PERMANENT_ADDRESS, PRESENT_ADDRESS, PIC_QUALITY, CREATOR, CREATE_TIME) values (:INFO_ID, :NAME, :SEX, "
				+ ":PIC, :IDENTITY_TYPE, :IDENTITY_ID, :BIRTHDAY, :PERMANENT_ADDRESS, :PRESENT_ADDRESS, :PIC_QUALITY, "
				+ ":CREATOR, :CREATE_TIME)";
		
		return namedJdbc.update(sql, param) > 0;
	}
	
	
	/**
	 * 增加红名单
	 * @param params
	 * @return
	 * @throws SQLException 
	 */
	public boolean addRedTask(Map<String,Object> taskParams, List<Map<String,Object>> relatedPersons) throws SQLException {
		
		List<String> sqlList = new ArrayList<String>();
		List<Map<String, Object>> paramList = new ArrayList<Map<String ,Object>>();
		
		String taskSql = "insert into EFACE_SEARCH_TASK (TASK_ID, CREATOR, CREATE_TIME, SAERCH_PARAM, CASE_ID, CASE_ID_TYPE, CASE_NAME, SEARCH_CAUSE, CAUSE_TYPE, SEARCH_PIC,SEARCH_TYPE,"
				+ " IS_INVOLVE_RED_LIST, IS_APPROVE, APPROVER, CREATOR_IP, PIC_MD5) values"
				+ " (:TASK_ID, :CREATOR, :CREATE_TIME, :SAERCH_PARAM, :CASE_ID, :CASE_ID_TYPE, :CASE_NAME, :SEARCH_CAUSE, :CAUSE_TYPE, :SEARCH_PIC,:SEARCH_TYPE," 
				+ " :IS_INVOLVE_RED_LIST, :IS_APPROVE, :APPROVER, :CREATOR_IP, :PIC_MD5)";
		sqlList.add(taskSql);
		paramList.add(taskParams);
		
		for (Map<String, Object> person : relatedPersons) {
			sqlList.add("insert into EFACE_SEARCH_TASK_RED_LIST (TASK_ID,INFO_ID,SIMILARITY) values (:TASK_ID, :INFO_ID,:SIMILARITY)");
			paramList.add(person);
		}
		
		int[] num = EAP.jdbc.getNameParameterTransactionTemplate(Constants.APP_NAME).batchUpdate(sqlList.toArray(new String[]{}), paramList);
		return num[0]> 0;
	}

	public List<Map<String, Object>> getDetailById(String ids)
	{
		String sql = "select INFO_ID, NAME, SEX, PIC, IDENTITY_TYPE, IDENTITY_ID, BIRTHDAY, PERMANENT_ADDRESS, PRESENT_ADDRESS, "
				+ "PIC_QUALITY, CREATOR, CREATE_TIME from EFACE_RED_LIST where INFO_ID in " + SqlUtil.getSqlInParams(ids);

		return jdbc.queryForList(sql, ids.split(","));
	}
	
	public List<String> getRedDbIdList(){
		String sql = "select DB_ID from VIID_DISPATCHED_DB db where db.DB_KIND = 1 ";
		return jdbc.queryForList(sql, String.class);
	}

	public List<String> getTaskRedListStatusByMd5(Map<String, Object> map) {
		String picMd5 = StringUtil.toString(map.get("PIC_MD5"));
		String userCode = StringUtil.toString(map.get("USER_CODE"));
		String curDate = DateUtil.getDate();
		String sql = "select b.APPROVAL_STATUS from EFACE_SEARCH_TASK_RED_LIST a " 
				+ " left join EFACE_SEARCH_TASK b on a.TASK_ID = b.TASK_ID "
				+ " left join EFACE_RED_LIST c on a.INFO_ID = c.INFO_ID "
				+ " where b.PIC_MD5 = ? and b.CREATOR = ? "
				+ "and b.EXPIRY_DATE >= ? and b.IS_APPROVE = 0";//IS_APPROVE=0,需要审核的。
		return jdbc.queryForList(sql, String.class, picMd5, userCode, curDate);
	}

	public boolean updateApproveStatus(int approveStatus, String expiryDate, String taskId) {
		String sql = "update EFACE_SEARCH_TASK set IS_APPROVE = ?, APPROVAL_STATUS = 0, EXPIRY_DATE=? where TASK_ID = ?";
		return jdbc.update(sql, approveStatus, expiryDate, taskId) > 0;
	}
	
	public int getRedPriv(String userCode){
		String sql = "select count(1) from SYS_USERFUNC uf, SYS_FUNLIST f where uf.USER_CODE = ? and uf.ORG_CODE = f.FUNID and f.MENUID = ?";
		return jdbc.queryForObject(sql, Integer.class, userCode, Constants.RED_LIST_MENUID);
	}
}
