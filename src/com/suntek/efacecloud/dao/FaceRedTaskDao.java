package com.suntek.efacecloud.dao;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.efacecloud.util.Constants;

/**
 * 红名单任务Dao层
 * @author lx
 * @since 1.0.0
 * @version 2018-03-05
 * @Copyright (C)2018 , Suntektech
 */
public class FaceRedTaskDao 
{
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	
	public boolean update(String taskId, String approveStatus, String approver) {
		String sql = "update EFACE_SEARCH_TASK set APPROVAL_STATUS = ?, APPROVER = ?, IS_READ = ? where TASK_ID = ? ";
		
		return jdbc.update(sql, approveStatus, approver, Constants.RED_TASK_UNREAD, taskId) > 0;
	}
	
	public List<Map<String,Object>> queryRelatedRedList(String taskId) {
		String sql = "select a.TASK_ID, b.SEARCH_PIC, a.INFO_ID, a.SIMILARITY, c.PIC as SIMILARITY_PIC, c.NAME, c.IDENTITY_ID "
				+ "from EFACE_SEARCH_TASK_RED_LIST a "
				+ "left join EFACE_SEARCH_TASK b on a.TASK_ID = b.TASK_ID "
				+ "left join EFACE_RED_LIST c on a.INFO_ID = c.INFO_ID where b.TASK_ID = ?";
		/*String sql = "select a.TASK_ID, b.SEARCH_PIC, a.INFO_ID, a.SIMILARITY, c.PIC as SIMILARITY_PIC, c.NAME, c.IDENTITY_ID "
				+ "from EFACE_SEARCH_TASK_RED_LIST a "
				+ "left join EFACE_SEARCH_TASK b on a.TASK_ID = b.TASK_ID "
				+ "left join VIID_DISPATCHED_PERSON c on a.INFO_ID = c.PERSON_ID where b.TASK_ID = ?";*/
		return jdbc.queryForList(sql, taskId);
	}
	
	public boolean updateReadStatus(String userCode, int readStatus, int unReadStatus) {
		String sql = "update EFACE_SEARCH_TASK set IS_READ = ? where CREATOR = ? and IS_READ = ?";
		
		return jdbc.update(sql, readStatus, userCode, unReadStatus) > 0;
	}
	
	public int getUnReadCount(String userCode){
		
		String sql = "select count(1) from EFACE_SEARCH_TASK where CREATOR = ? and IS_READ = ?";
		return jdbc.queryForObject(sql, Integer.class, userCode, Constants.RED_TASK_UNREAD);
	}
	
	public int notMatchCaseIdOrName(String caseId, String caseName, String caseIdType, String userCode){
		
		String sql = "select count(1) from EFACE_SEARCH_TASK where "
				+ "((CASE_ID = ? and CASE_NAME <> ?) or (CASE_ID <> ? and CASE_NAME = ?))"
				+ "and CASE_ID_TYPE = ? and CREATOR = ?";
		return jdbc.queryForObject(sql, Integer.class, caseId, caseName, caseId, caseName, caseIdType, userCode);
	}
}
