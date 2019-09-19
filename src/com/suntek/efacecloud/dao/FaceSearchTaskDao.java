package com.suntek.efacecloud.dao;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.jdbc.dialect.Dialect;
import com.suntek.eap.jdbc.dialect.DialectFactory;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.util.Constants;

/**
 * 查询任务表Dao层
 * @author wangsh
 * @since 1.0.0
 * @version 2018-03-08
 * @Copyright (C)2018 , Suntektech
 */
public class FaceSearchTaskDao 
{
	private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	private Dialect dialect = DialectFactory.getDialect(Constants.APP_NAME, "");
	
	public int getCaseCount(Map<String, Object> params){
		StringBuilder sql = new StringBuilder("select COUNT(distinct(t.CASE_ID)) from EFACE_SEARCH_TASK t "
				+ " left join SYS_USER u on t.CREATOR=u.USER_CODE where 1=1 ");
		String beginTime = StringUtil.toString(params.get("BEGIN_TIME"));
		String endTime = StringUtil.toString(params.get("END_TIME"));
		String deptCode = StringUtil.toString(params.get("DEPT_CODE"));
		String caseIdType = StringUtil.toString(params.get("CASE_ID_TYPE"));
		List<String> sqlParams = new ArrayList<String>();
		if(!StringUtil.isEmpty(beginTime)){
			sql.append(" and t.CREATE_TIME >= ? ");
			sqlParams.add(beginTime);
		}
		if(!StringUtil.isEmpty(endTime)){
			sql.append(" and t.CREATE_TIME <= ? ");
			sqlParams.add(endTime);
		}
		if(!StringUtil.isEmpty(deptCode)){
			sql.append(" and u.DEPT_CODE like ? ");
			sqlParams.add(deptCode + "%");
		}
		if(!StringUtil.isEmpty(caseIdType)){
			sql.append(" and t.CASE_ID_TYPE = ? ");
			sqlParams.add(caseIdType);
		}
		return jdbc.queryForObject(sql.toString(), Integer.class, sqlParams.toArray());
	}
	
	public List<Map<String, Object>> getTaskUseData(Map<String, Object> params){
		StringBuilder sql = new StringBuilder("select COUNT(DISTINCT(t.CREATOR)) USER_COUNT, COUNT(1) OP_COUNT from EFACE_SEARCH_TASK t "
				+ " left join SYS_USER u on t.CREATOR=u.USER_CODE where 1=1 ");
		String beginTime = StringUtil.toString(params.get("BEGIN_TIME"));
		String endTime = StringUtil.toString(params.get("END_TIME"));
		String deptCode = StringUtil.toString(params.get("DEPT_CODE"));
		List<String> sqlParams = new ArrayList<String>();
		if(!StringUtil.isEmpty(beginTime)){
			sql.append(" and t.CREATE_TIME >= ? ");
			sqlParams.add(beginTime);
		}
		if(!StringUtil.isEmpty(endTime)){
			sql.append(" and t.CREATE_TIME <= ? ");
			sqlParams.add(endTime);
		}
		if(!StringUtil.isEmpty(deptCode)){
			sql.append(" and u.DEPT_CODE like ? ");
			sqlParams.add(deptCode + "%");
		}
		return jdbc.queryForList(sql.toString(), sqlParams.toArray());
	}
	
	public List<Map<String, Object>> getStationData(Map<String, Object> params){
		List<String> sqlParams = new ArrayList<String>();
		StringBuilder sql = new StringBuilder("select d.DEPT_CODE, d.DEPT_NAME,SUM(case when t.CASE_ID_TYPE = " + Constants.CASE_ID_TYPE_A + " then 1 else 0 end) CASE_COUNT, "
				+ "SUM(case when t.CASE_ID_TYPE = " + Constants.CASE_ID_TYPE_J + " then 1 else 0 end) CLUE_COUNT, SUM(case when t.CASE_ID_TYPE = " + Constants.CASE_ID_TYPE_OTHER+" then 1 else 0 end) OTHER_COUNT, "
				+ "SUM(CASE_ID_NUM) OP_NUM from ( select t.CREATOR, t.CASE_ID_TYPE, COUNT(1) CASE_ID_NUM from EFACE_SEARCH_TASK t "
				+ "LEFT JOIN SYS_USER u ON t.CREATOR = u.USER_CODE where 1=1 ");
		appendSql(sql, params, sqlParams);
		sql.append(" GROUP BY t.CASE_ID_TYPE, t.CASE_ID, t.CREATOR ) t ");
		sql.append(" left join SYS_USER su on su.USER_CODE = t.CREATOR ");
		sql.append(" left join SYS_DEPT d on su.DEPT_CODE = d.DEPT_CODE ");
		sql.append(" group by d.DEPT_CODE, d.DEPT_NAME ");
		return jdbc.queryForList(sql.toString(), sqlParams.toArray());
	}
	
	private void appendSql(StringBuilder sql, Map<String, Object> params, List<String> sqlParams){
		String beginTime = StringUtil.toString(params.get("BEGIN_TIME"));
		String endTime = StringUtil.toString(params.get("END_TIME"));
		String deptCode = StringUtil.toString(params.get("DEPT_CODE"));
		String caseIdType = StringUtil.toString(params.get("CASE_ID_TYPE"));
		if (!StringUtil.isEmpty(caseIdType)) {
			sql.append(" and t.CASE_ID_TYPE = ? ");
			sqlParams.add(caseIdType);
		}
		if(!StringUtil.isEmpty(beginTime)){
			sql.append(" and t.CREATE_TIME >= ? ");
			sqlParams.add(beginTime);
		}
		if(!StringUtil.isEmpty(endTime)){
			sql.append(" and t.CREATE_TIME <= ? ");
			sqlParams.add(endTime);
		}
		if(!StringUtil.isEmpty(deptCode)){
			sql.append(" and u.DEPT_CODE like ? ");
			sqlParams.add(deptCode + "%");
		}
	}
	
	public int getTotalUserNum()
	{
		String sql = "select COUNT(1) USER_NUM from SYS_USER u where u.USER_CODE <> 'admin' ";
		
		return jdbc.queryForObject(sql, Integer.class);
	}
	
	public List<Map<String, Object>> getLoginStatisticsData(Map<String, Object> params)
	{
		StringBuilder sql = new StringBuilder("select max(d.DEPT_NAME) DEPT_NAME, COUNT(1) LOGIN_TIMES, COUNT(DISTINCT(i.OPERATOR)) USER_NUM "
				+ "from SYS_LOG_INFO i left join SYS_DEPT d on d.DEPT_CODE = i.DEPT_CODE "
				+ "where i.SERVICE = 'user/login/validatePnL' and i.OPERATOR <> '系统管理员' ");
		
		String beginTime = StringUtil.toString(params.get("BEGIN_TIME"));
		String endTime = StringUtil.toString(params.get("END_TIME"));
		String deptCode = StringUtil.toString(params.get("DEPT_CODE"));
		List<String> sqlParams = new ArrayList<String>();
		
		if(!StringUtil.isEmpty(beginTime)){
			sql.append(" and i.OPT_TIME >= ? ");
			sqlParams.add(beginTime);
		}
		if(!StringUtil.isEmpty(endTime)){
			sql.append(" and i.OPT_TIME <= ? ");
			sqlParams.add(endTime);
		}
		if(!StringUtil.isEmpty(deptCode)){
			sql.append(" and d.DEPT_CODE like ? ");
			sqlParams.add(deptCode + "%");
		}
		
		sql.append(" group by d.DEPT_CODE order by LOGIN_TIMES desc ");
		
		return jdbc.queryForList(sql.toString(), sqlParams.toArray());
	}
	
	public List<Map<String, Object>> getDispatchedDbStatisticsData(Map<String, Object> params)
	{
		StringBuilder sql = new StringBuilder("select max(sd.DEPT_NAME) DEPT_NAME, count(1) DB_NUM from VIID_DISPATCHED_DB d "
				+ "left join SYS_USER u on u.USER_CODE = d.CREATOR "
				+ "left join SYS_DEPT sd on sd.DEPT_CODE = u.DEPT_CODE "
				+ "where d.CREATOR <> 'admin' ");
		
		String beginTime = StringUtil.toString(params.get("BEGIN_TIME"));
		String endTime = StringUtil.toString(params.get("END_TIME"));
		String deptCode = StringUtil.toString(params.get("DEPT_CODE"));
		List<String> sqlParams = new ArrayList<String>();
		
		if(!StringUtil.isEmpty(beginTime)){
			sql.append(" and d.CREATE_TIME >= ? ");
			sqlParams.add(beginTime);
		}
		if(!StringUtil.isEmpty(endTime)){
			sql.append(" and d.CREATE_TIME <= ? ");
			sqlParams.add(endTime);
		}
		if(!StringUtil.isEmpty(deptCode)){
			sql.append(" and sd.DEPT_CODE like ? ");
			sqlParams.add(deptCode + "%");
		}
		
		sql.append(" group by sd.DEPT_CODE order by DB_NUM desc ");
		
		return jdbc.queryForList(sql.toString(), sqlParams.toArray());
	}
	
	public List<Map<String, Object>> getDispatchedPersonStatisticsData(Map<String, Object> params)
	{
		StringBuilder sql = new StringBuilder("select max(sd.DEPT_NAME) DEPT_NAME, count(1) PERSON_NUM from EFACE_DISPATCHED_PERSON p "
				+ "left join SYS_USER u on u.USER_CODE = p.CREATOR "
				+ "left join SYS_DEPT sd on sd.DEPT_CODE = u.DEPT_CODE "
				+ "where p.CREATOR <> 'admin' ");
		
		String beginTime = StringUtil.toString(params.get("BEGIN_TIME"));
		String endTime = StringUtil.toString(params.get("END_TIME"));
		String deptCode = StringUtil.toString(params.get("DEPT_CODE"));
		List<String> sqlParams = new ArrayList<String>();
		
		if(!StringUtil.isEmpty(beginTime)){
			sql.append(" and p.CREATE_TIME >= ? ");
			sqlParams.add(beginTime);
		}
		if(!StringUtil.isEmpty(endTime)){
			sql.append(" and p.CREATE_TIME <= ? ");
			sqlParams.add(endTime);
		}
		if(!StringUtil.isEmpty(deptCode)){
			sql.append(" and sd.DEPT_CODE like ? ");
			sqlParams.add(deptCode + "%");
		}
		
		sql.append(" group by sd.DEPT_CODE order by PERSON_NUM desc ");
		
		return jdbc.queryForList(sql.toString(), sqlParams.toArray());
	}
	
	public List<Map<String, Object>> getExportSysUseData(Map<String, Object> params)
	{
		StringBuilder loginSql = new StringBuilder("select DEPT_CODE, COUNT(1) LOGIN_TIMES, COUNT(DISTINCT(i.OPERATOR)) USER_USE_NUM "
				+ "from SYS_LOG_INFO i where i.SERVICE = 'user/login/validatePnL' and i.OPT_TIME between ? and ? group by i.DEPT_CODE ");
		
		StringBuilder dbSql = new StringBuilder("select u.DEPT_CODE, count(1) DB_NUM from VIID_DISPATCHED_DB d "
				+ "left join SYS_USER u on u.USER_CODE = d.CREATOR where 1=1 and d.CREATE_TIME between ? and ? group by u.DEPT_CODE ");
		
		StringBuilder personSql = new StringBuilder("select u.DEPT_CODE, count(1) PERSON_NUM from EFACE_DISPATCHED_PERSON p "
				+ "left join SYS_USER u on u.USER_CODE = p.CREATOR where 1=1 and p.CREATE_TIME between ? and ? group by u.DEPT_CODE ");
		
		String beginTime = StringUtil.toString(params.get("BEGIN_TIME"));
		String endTime = StringUtil.toString(params.get("END_TIME"));
		String deptCode = StringUtil.toString(params.get("DEPT_CODE"));
		List<String> sqlParams = new ArrayList<String>();
		sqlParams.add(beginTime);
		sqlParams.add(endTime);
		
		sqlParams.add(beginTime);
		sqlParams.add(endTime);
		
		sqlParams.add(beginTime);
		sqlParams.add(endTime);
		
		StringBuilder sql = new StringBuilder("select d.DEPT_NAME, ");
		sql.append(dialect.isnull("u.USER_NUM", "0")).append(" USER_NUM, ")
				.append(dialect.isnull("l.USER_USE_NUM", "0")).append(" USER_USE_NUM, ")
				.append(dialect.isnull("l.LOGIN_TIMES", "0")).append(" LOGIN_TIMES, ")
				.append(dialect.isnull("db.DB_NUM", "0")).append(" DB_NUM, ")
				.append(dialect.isnull("ps.PERSON_NUM", "0")).append(" PERSON_NUM ")
				.append("from SYS_DEPT d left join(").append(dbSql)
				.append(") db on db.DEPT_CODE = d.DEPT_CODE left join (").append(loginSql)
				.append(") l on l.DEPT_CODE = d.DEPT_CODE left join (").append(personSql)
				.append(") ps on ps.DEPT_CODE = d.DEPT_CODE ")
				.append("left join (select u.DEPT_CODE, COUNT(1) USER_NUM from SYS_USER u ")
				.append("group by u.DEPT_CODE) u on u.DEPT_CODE = d.DEPT_CODE ")
				.append("where d.DEPT_CODE <> '01'");

		if (!StringUtil.isEmpty(deptCode)) {
			sql.append(" and d.DEPT_CODE like ? ");
			sqlParams.add(deptCode + "%");
		}
		
		sql.append(" order by USER_NUM desc ");
		
		return jdbc.queryForList(sql.toString(), sqlParams.toArray());
	}
}
