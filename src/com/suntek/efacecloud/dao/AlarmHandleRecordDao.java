package com.suntek.efacecloud.dao;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.jdbc.NamedParameterJdbcTemplate;
import com.suntek.eap.jdbc.dialect.Dialect;
import com.suntek.eap.jdbc.dialect.DialectFactory;
import com.suntek.eap.metadata.Dao;
import com.suntek.eap.util.DateUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.SurveilProcessType;
import com.suntek.elastic.rdd.util.StringUtil;
import org.springframework.util.StringUtils;

/**
 * 处置信息记录dao层
 * 
 * @author suweiquan
 * @since
 * @version 2018年5月12日
 */
public class AlarmHandleRecordDao {

    private NamedParameterJdbcTemplate nameParameterJdbc = EAP.jdbc.getNamedParameterTemplate(Constants.APP_NAME);

    private Dialect dialect = DialectFactory.getDialect(Constants.APP_NAME, "");

    private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);

    public void insertAlarmHandleRecord(Map<String, Object> record) throws SQLException {
        String alarmId = StringUtil.toString(record.get("ALARM_ID"));
        if (StringUtils.isEmpty(record.get("PERSON_ID")) && !StringUtils.isEmpty(alarmId)){
            record.put("PERSON_ID", getPersonIdByAlarmId(alarmId));
        }
        Dao dao = EAP.schema.getDao(Constants.APP_NAME);
        String sql
            = "insert into MD_ALARM_HANDLE_RECORD(PERSON_ID, ALARM_ID, HANDLE_USER, IS_TIMEOUT, HANDLE_RESULT, HANDLE_TIME, OP_TYPE)"
                + " values(:PERSON_ID, :ALARM_ID, :HANDLE_USER, :IS_TIMEOUT, :HANDLE_RESULT, :HANDLE_TIME, :OP_TYPE)";
        dao.addNamedSQL(sql, record);
        String alarmHandle = StringUtil.toString(record.get("OP_TYPE"));
        dao.addSQL("update VPLUS_SURVEILLANCE_ALARM set ALARM_HANDLE = ? where ALARM_ID = ?", alarmHandle,
            StringUtil.toString(record.get("ALARM_ID")));
        dao.commit();
    }

    public String getPersonIdByAlarmId(String alarmId) {
        String sql = "select p.PERSON_ID from  VPLUS_SURVEILLANCE_ALARM vsa "
            + " left join VIID_DISPATCHED_OBJECT obj on vsa.OBJECT_ID=obj.OBJECT_ID "
            + " left join VIID_DISPATCHED_PERSON p on p.PERSON_ID=obj.PERSON_ID" + " where vsa.ALARM_ID = ?";
        List<String> list = jdbc.queryForList(sql, String.class, alarmId);
        if (list.size() > 0) {
            return list.get(0);
        }
        return "";
    }

    public Map<String, Object> getPersonAndAlarmInfoByAlarmId(String alarmId) {
        String sql
            = "select vsa.DB_NAME,vsa.OBJECT_EXTEND_INFO,vsa.ALARM_TIME, u.TELEPHONE from VPLUS_SURVEILLANCE_ALARM vsa "
                + " left join VIID_DISPATCHED_OBJECT obj on vsa.OBJECT_ID=obj.OBJECT_ID "
                + " left join VIID_DISPATCHED_PERSON p on p.PERSON_ID=obj.PERSON_ID"
                + " left join SYS_USER u on u.USER_CODE=p.CREATOR" + " where vsa.ALARM_ID = ?";
        List<Map<String, Object>> list = jdbc.queryForList(sql, alarmId);
        if (list.size() > 0) {
            return list.get(0);
        }
        return new HashMap<>();
    }

    public boolean autoWithdraw(String personId, String remark) throws SQLException {
        Dao dao = EAP.schema.getDao(Constants.APP_NAME);
        String sql
            = "insert into EFACE_DISPATCHED_APPROVE_PROCESS (PROCESS_ID, TASK_ID, PROCESS_TYPE, PROCESS_MANAGER, PROCESS_RESULT, PROCESS_TIME, PROCESS_REMARK)"
                + " values(?, ?, ?, ?, ?, ?, ?)";
        dao.addSQL(sql, EAP.keyTool.getUUID(), personId, SurveilProcessType.WITHDRAW.getType(), "admin", 0,
            DateUtil.getDateTime(), remark);
        dao.addSQL(sql, EAP.keyTool.getUUID(), personId, SurveilProcessType.WITHDRAW_AUDIT.getType(), "admin", 0,
            DateUtil.getDateTime(), remark);
        dao.addSQL(sql, EAP.keyTool.getUUID(), personId, SurveilProcessType.WITHDRAW_APPROVE.getType(), "admin", 0,
            DateUtil.getDateTime(), remark);
        int[] result = dao.commit();
        return result[0] > 0;
    }

    public boolean isAlarmSignIn(String alarmId) {
        String sql = "select ALARM_ID,OP_TYPE from MD_ALARM_HANDLE_RECORD where ALARM_ID = ? and OP_TYPE = 1";
        return jdbc.queryForList(sql, alarmId).size() > 0;
    }

    public boolean isFeedbackFinish(String alarmId) {
        String sql = "select ALARM_ID,OP_TYPE from MD_ALARM_HANDLE_RECORD where ALARM_ID = ? and OP_TYPE = 9";
        return jdbc.queryForList(sql, alarmId).size() > 0;
    }

    public List<Map<String, Object>> getAlarmHandleInfo(String alarmId) {
        String sql
            = "select record.ID, record.ALARM_ID, record.OP_TYPE, record.HANDLE_USER USER_CODE, sysUser.USER_NAME, sysUser.POLICE_ID,record.IS_TIMEOUT, record.HANDLE_RESULT, "
                + " record.HANDLE_TIME, dept.DEPT_NAME " + " from MD_ALARM_HANDLE_RECORD record"
                + " left join SYS_USER sysUser on sysUser.USER_CODE =  record.HANDLE_USER"
                + " left join SYS_DEPT dept on sysUser.DEPT_CODE =  dept.DEPT_CODE " + " where record.ALARM_ID = ?"
                + " order by HANDLE_TIME asc";
        return jdbc.queryForList(sql, alarmId);
    }

    public List<Map<String, Object>> getAlarmStatisticInfo(String beginTime,String endTime) {
        String sql
            = "select b.db_name,count(*) as count from VPLUS_SURVEILLANCE_ALARM a inner join VIID_DISPATCHED_DB b on a.db_id = b.db_id"
                + " where a.ALARM_TIME > '"+beginTime+"' and a.ALARM_TIME <= '"+endTime+"'"
                + " group by b.db_name";
        return jdbc.queryForList(sql);
    }
    

    public List<Map<String, Object>> queryAlarmHandlRecord(String alarmId) {
        String sql= "select * from MD_ALARM_HANDLE_RECORD where ALARM_ID = ? and OP_TYPE in (2,9) order by HANDLE_TIME Desc";
        return jdbc.queryForList(sql,alarmId);
    }
    
    public List<Map<String, Object>> querySysUserInfo(String personId) {
		String sql = "select user.USER_CODE,user.USER_NAME,user.DEPT_CODE,user.DEPT_NAME from VIID_DISPATCHED_PERSON person "
				+"inner join SYS_USER user on user.USER_CODE = person.CREATOR "
				+"where person.PERSON_ID = ?";
		return jdbc.queryForList(sql,personId);
	}
    
    public List<Map<String, Object>> querySysUserList(String deptCode) {
		String sql = "select user.USER_CODE,user.USER_NAME,user.DEPT_CODE,user.DEPT_NAME "
				+ "from SYS_USER user where user.DEPT_CODE = ?";
		return jdbc.queryForList(sql,deptCode);
	} 
}
