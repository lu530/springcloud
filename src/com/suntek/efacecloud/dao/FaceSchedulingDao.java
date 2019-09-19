package com.suntek.efacecloud.dao;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.log.ServiceLog;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.metadata.Dao;
import com.suntek.eap.util.SqlUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;

/**
 * 警情调度层
 * 
 * @author wangshaotao,wangsh
 * @since
 * @version 2018年9月11日
 */
public class FaceSchedulingDao {
    
    private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
    
    public void addTask(List<Map<String, Object>> taskList, List<Map<String, Object>> recordList) throws SQLException {
        Dao dao = EAP.schema.getDao(Constants.APP_NAME);
        String sql = "insert into EFACE_POLICE_TASK_DISPATCH(DISPATCH_ID, TASK_TYPE, TASK_ID, REL_ID, IDENTITY_ID, SENDER, ACCEPTER, CREATE_TIME,"
                + "TASK_LEVEL,IS_SEND, TASK_STATUS, REMARK) values (:DISPATCH_ID, :TASK_TYPE, :TASK_ID, :REL_ID, :IDENTITY_ID,"
                + ":SENDER, :ACCEPTER, :CREATE_TIME, :TASK_LEVEL, :IS_SEND,:TASK_STATUS, :REMARK)";
        for(Map<String, Object> taskParams : taskList) {
            dao.addNamedSQL(sql, taskParams);
        }
        String recordSql = "insert into EFACE_POLICE_TASK_RECORD(DISPATCH_ID, STATUS, CREATE_TIME, UPDATE_TIME, REMARK, USER_CODE) "
                + "values (:DISPATCH_ID, :STATUS, :CREATE_TIME, "
                + ":UPDATE_TIME, :REMARK, :USER_CODE)";
//        String recordSql = "insert into EFACE_POLICE_TASK_RECORD(DISPATCH_ID, STATUS, CREATE_TIME, UPDATE_TIME, USER_CODE) "
//        		+ "values (:DISPATCH_ID, :STATUS, :CREATE_TIME, "
//        		+ ":UPDATE_TIME, :USER_CODE)";
        for(Map<String, Object> recordParams : recordList) {
            dao.addNamedSQL(recordSql, recordParams);
        }
        dao.commit();
    }
    
    public void delTask(String dispatchIds) throws SQLException {
        Dao dao = EAP.schema.getDao(Constants.APP_NAME);
        String[] dispatchIdArr = dispatchIds.split(",");
        for(String dispatchId : dispatchIdArr) {
            String sql = "delete from EFACE_POLICE_TASK_DISPATCH where DISPATCH_ID = ?";
            dao.addSQL(sql, dispatchId);
            String deleteSql = "delete from EFACE_POLICE_TASK_RECORD where DISPATCH_ID = ?";
            dao.addSQL(deleteSql, dispatchId);
        }
        dao.commit();
    }
    
    public void addRecord(Map<String, Object> taskParams, Map<String, Object> recordParams) throws SQLException {
        Dao dao = EAP.schema.getDao(Constants.APP_NAME);
        String sql = "update EFACE_POLICE_TASK_DISPATCH set TASK_STATUS = :TASK_STATUS where DISPATCH_ID = :DISPATCH_ID";
        dao.addNamedSQL(sql, taskParams);
        String recordSql
            = "insert into EFACE_POLICE_TASK_RECORD(DISPATCH_ID, STATUS, CREATE_TIME, UPDATE_TIME,REMARK, USER_CODE,IS_TIMEOUT) "
                + "values (:DISPATCH_ID, :STATUS, :CREATE_TIME, "
                + ":UPDATE_TIME, :REMARK, :USER_CODE, :IS_TIMEOUT)";

        String updateRecordSql = "update EFACE_POLICE_TASK_RECORD set STATUS=:STATUS, "
        		+ "UPDATE_TIME=:UPDATE_TIME, REMARK=:REMARK where ID=:ID ";
        if(StringUtil.isEmpty(StringUtil.toString(recordParams.get("ID")))) {
            dao.addNamedSQL(recordSql, recordParams);
        } else {
            dao.addNamedSQL(updateRecordSql, recordParams);
        }
        dao.commit();
    }
    
    public void addRemark(Map<String, Object> remarkParams) throws SQLException {
        Dao dao = EAP.schema.getDao(Constants.APP_NAME);
        String remarkSql = "insert into EFACE_POLICE_TASK_REMARK"
                + " (DISPATCH_ID, REMARK_ID, SERIAL_NUMBER, CREATE_TIME, REMARK_KEY, REMARK_NAME,REMARK_VALUE,REMARK_NOTE,REMARK_FILE) "
                + " values (:DISPATCH_ID, :REMARK_ID, :SERIAL_NUMBER, :CREATE_TIME, :REMARK_KEY, :REMARK_NAME, :REMARK_VALUE, :REMARK_NOTE, :REMARK_FILE)";
        dao.addNamedSQL(remarkSql, remarkParams);
        dao.commit();
    }

    public List<Map<String, Object>> getRealTaskList(String userCode){
        String sql = "select a.ID, a.DISPATCH_ID, a.TASK_TYPE, a.TASK_ID, a.REL_ID, a.SENDER, a.ACCEPTER, a.CREATE_TIME,"
                + " a.TASK_STATUS,a.TASK_LEVEL, a.REMARK, "
                + " b.ALARM_TIME, b.ALARM_IMG, b.OBJECT_PICTURE, b.SCORE, b.OBJECT_ID, b.DEVICE_ID, b.OBJECT_EXTEND_INFO "
                + " from EFACE_POLICE_TASK_DISPATCH a,VPLUS_SURVEILLANCE_ALARM b "
                + "where a.REL_ID = b.ALARM_ID and a.ACCEPTER = ? and a.IS_SEND <> 1";
        List<Map<String, Object>> list = jdbc.queryForList(sql, userCode);
        try {
            for(Map<String, Object> result : list) {
                JSONObject  objectExtendInfo = JSONObject.parseObject(StringUtil.toString(result.get("OBJECT_EXTEND_INFO")));
                result.put("IDENTITY_ID", objectExtendInfo.getString("IDENTITY_ID"));
                result.put("NAME", objectExtendInfo.getString("NAME"));
                result.put("SEX", objectExtendInfo.getString("SEX"));
                String deviceId = StringUtil.toString(result.get("DEVICE_ID"));
                DeviceEntity device = (DeviceEntity) EAP.metadata.getDictModel(DictType.D_FACE, deviceId, DeviceEntity.class);
                result.put("DEVICE_ADDR", device.getDeviceAddr());
                result.put("ALARM_IMG", ModuleUtil.renderImage(StringUtil.toString(result.get("ALARM_IMG"))));
                result.put("OBJECT_PICTURE", ModuleUtil.renderImage(StringUtil.toString(result.get("OBJECT_PICTURE"))));
            }
        } catch (Exception e) {
            ServiceLog.error(e);
        }
        return list;
    }
    
    public boolean updateSendStatus(List<String> ids) {
        String sql = "update EFACE_POLICE_TASK_DISPATCH set IS_SEND = 1 where ID in " + SqlUtil.getSqlInParams(ids.toArray());
        return jdbc.update(sql, ids.toArray()) > 0;
    }
    
    public Map<String, Object> getTaskDetail(String dispatchId) throws Exception {
        String sql = "select a.ID, a.DISPATCH_ID, a.TASK_TYPE, a.TASK_ID, a.SENDER, a.ACCEPTER, a.CREATE_TIME,"
                + " a.TASK_STATUS,a.TASK_LEVEL, a.REMARK, "
                + " b.ALARM_TIME, b.ALARM_IMG, b.OBJECT_PICTURE, b.SCORE, b.OBJECT_ID, b.DEVICE_ID, b.OBJECT_EXTEND_INFO "
                + " from EFACE_POLICE_TASK_DISPATCH a,VPLUS_SURVEILLANCE_ALARM b "
                + "where a.REL_ID = b.ALARM_ID and a.DISPATCH_ID = ?";
        List<Map<String, Object>> list = jdbc.queryForList(sql, dispatchId);
        if(list.size() > 0) {
            Map<String, Object> result = list.get(0);
            JSONObject  objectExtendInfo = JSONObject.parseObject(StringUtil.toString(result.get("OBJECT_EXTEND_INFO")));
            result.put("IDENTITY_ID", objectExtendInfo.getString("IDENTITY_ID"));
            result.put("NAME", objectExtendInfo.getString("NAME"));
            result.put("SEX", objectExtendInfo.getString("SEX"));
            String deviceId = StringUtil.toString(result.get("DEVICE_ID"));
            DeviceEntity device = (DeviceEntity) EAP.metadata.getDictModel(DictType.D_FACE, deviceId, DeviceEntity.class);
            result.put("DEVICE_ADDR", device.getDeviceAddr());
            result.put("ALARM_IMG", ModuleUtil.renderImage(StringUtil.toString(result.get("ALARM_IMG"))));
            result.put("OBJECT_PICTURE", ModuleUtil.renderImage(StringUtil.toString(result.get("OBJECT_PICTURE"))));
            return result;
        }
        return new HashMap<>();
    }
    
    
    public String getFeedback(String dispatchId) throws Exception {
        String sql = "select * from EFACE_POLICE_TASK_RECORD where DISPATCH_ID = ? and STATUS = ?";
        List<Map<String, Object>> list = jdbc.queryForList(sql, dispatchId, Constants.TASK_STATUS_HANDLED);
        if(list.size() > 0) {
            return (String) list.get(0).get("REMARK");
        }
        return "";
    }
    
    public List<Map<String, Object>> getRecordList(String dispatchId) {
        String sql = "select * from EFACE_POLICE_TASK_RECORD where DISPATCH_ID = ? order by CREATE_TIME asc";
        return jdbc.queryForList(sql, dispatchId);
    }
    
    
//    public List<Map<String, Object>> getRecordDataList(String taskId, String userId) {
//        String sql = "select * from ( select b.ID,a.TASK_ID,b.DISPATCH_ID,a.ACCEPTER,case when b.STATUS = 0 "
//            + "then concat(c.USER_NAME,'(',IFNULL(c.POLICE_ID, '无警号'),')',' 下发给 ',d.USER_NAME,'(',IFNULL(d.POLICE_ID,'无警号'),')',' 任务')"
//            + " when b.STATUS = 1 then concat(d.USER_NAME,'(',IFNULL(d.POLICE_ID,'无警号'),')',' 签收了 ',c.USER_NAME,'(',IFNULL(c.POLICE_ID, '无警号'),')',' 的任务') when b.STATUS = 3 then concat(d.USER_NAME,'(',IFNULL(d.POLICE_ID,'无警号'),')',' 反馈了 ',"
//            + "c.USER_NAME,'(',IFNULL(c.POLICE_ID, '无警号'),')',' 的任务') end as TITLE,b.STATUS,b.CREATE_TIME,b.UPDATE_TIME,b.REMARK,b.IS_TIMEOUT,'0' as IS_JUMP from EFACE_POLICE_TASK_DISPATCH a,EFACE_POLICE_TASK_RECORD b,SYS_USER c,SYS_USER d "
//            + " where a.DISPATCH_ID = b.DISPATCH_ID and a.SENDER = c.USER_CODE and a.ACCEPTER = d.USER_CODE and TASK_ID = ? "
//            + " and ACCEPTER = ? and STATUS in (0,1,3) "
//            + " union select b.ID,a.TASK_ID,b.DISPATCH_ID,a.ACCEPTER,case "
//            + " when b.STATUS = 0 then concat(c.USER_NAME,'(',IFNULL(c.POLICE_ID, '无警号'),')',' 下发给 ',d.USER_NAME,'(',IFNULL(d.POLICE_ID,'无警号'),')',' 任务') end as TITLE,b.STATUS,b.CREATE_TIME,b.UPDATE_TIME,b.REMARK,b.IS_TIMEOUT,'1' as IS_JUMP "
//            + " from EFACE_POLICE_TASK_DISPATCH a,EFACE_POLICE_TASK_RECORD b,SYS_USER c,SYS_USER d where a.DISPATCH_ID = b.DISPATCH_ID and a.SENDER = c.USER_CODE and a.ACCEPTER = d.USER_CODE and TASK_ID = ? and SENDER = ? and STATUS = 0 ) a order by UPDATE_TIME,STATUS";
//        return jdbc.queryForList(sql, taskId , userId, taskId , userId);
//    }
    
    public List<Map<String, Object>> getRecordDataList(String taskId, String userId) {
        String sql = "select * from ( select b.ID,a.TASK_ID,b.DISPATCH_ID,a.ACCEPTER,case when b.STATUS = 0 "
                + "then concat(c.USER_NAME,'(',IFNULL(c.POLICE_ID, '无警号'),')',' 下发给 ',d.USER_NAME,'(',IFNULL(d.POLICE_ID,'无警号'),')',' 任务')"
                + " when b.STATUS = 1 then concat(d.USER_NAME,'(',IFNULL(d.POLICE_ID,'无警号'),')',' 签收了 ',c.USER_NAME,'(',IFNULL(c.POLICE_ID, '无警号'),')',' 的任务') when b.STATUS = 3 then concat(d.USER_NAME,'(',IFNULL(d.POLICE_ID,'无警号'),')',' 反馈了 ',"
            + "c.USER_NAME,'(',IFNULL(c.POLICE_ID, '无警号'),')',' 的任务') end as TITLE,b.STATUS,b.CREATE_TIME,b.UPDATE_TIME,b.REMARK,b.IS_TIMEOUT,'0' as IS_JUMP from EFACE_POLICE_TASK_DISPATCH a,EFACE_POLICE_TASK_RECORD b,SYS_USER c,SYS_USER d "
                + "where a.DISPATCH_ID = b.DISPATCH_ID and a.SENDER = c.USER_CODE and a.ACCEPTER = d.USER_CODE and TASK_ID = ? ";
        if (userId != null) {
            sql = sql + "and ACCEPTER = ? ";
        }
        sql = sql + "and STATUS in (0,1,3) ";
        if (userId != null) {
            sql = sql + "union select b.ID,a.TASK_ID,b.DISPATCH_ID,a.ACCEPTER,case "
            		+ "when b.STATUS = 0 then concat(c.USER_NAME,'(',IFNULL(c.POLICE_ID, '无警号'),')',' 下发给 ',d.USER_NAME,'(',IFNULL(d.POLICE_ID,'无警号'),')',' 任务') end as TITLE,b.STATUS,b.CREATE_TIME,b.UPDATE_TIME,b.REMARK,b.IS_TIMEOUT,'1' as IS_JUMP "
                    + "from EFACE_POLICE_TASK_DISPATCH a,EFACE_POLICE_TASK_RECORD b,SYS_USER c,SYS_USER d where a.DISPATCH_ID = b.DISPATCH_ID and a.SENDER = c.USER_CODE and a.ACCEPTER = d.USER_CODE and TASK_ID = ? and SENDER = ? and STATUS = 0 ";
        }
        sql = sql + ") a order by UPDATE_TIME,STATUS";
        if (userId != null) {
            return jdbc.queryForList(sql, taskId, userId, taskId, userId);
        }
        return jdbc.queryForList(sql, taskId);
    }
    
    public List<Map<String, Object>> getRemarkList(String dispatchId, String remarkId) {
        String sql = "select REMARK_KEY as `key`,REMARK_NAME as `name`,REMARK_VALUE as `value`,"
            + " REMARK_NOTE as note,REMARK_FILE as file from EFACE_POLICE_TASK_REMARK "
            + " where DISPATCH_ID = ? and REMARK_ID = ? order by SERIAL_NUMBER";
        return jdbc.queryForList(sql, dispatchId, remarkId);
    }

    public List<Map<String, Object>> getTaskDispatchList(String taskId) {
        String sql = "select * from EFACE_POLICE_TASK_DISPATCH where TASK_ID = ?";
        return jdbc.queryForList(sql, taskId);
    }
    
    public List<Map<String, Object>> getTaskRecordList(String taskId) {
        String sql = "select * from EFACE_POLICE_TASK_DISPATCH where TASK_ID = ?";
        return jdbc.queryForList(sql, taskId);
    }
    
    public Map<String, Object> getRecord(String dispatchId, int status) {
        String sql = "select * from EFACE_POLICE_TASK_RECORD where DISPATCH_ID = ? and STATUS = ? order by CREATE_TIME asc";
        List<Map<String, Object>> list = jdbc.queryForList(sql, dispatchId, status);
        if(list.size() > 0) {
            return list.get(0);
        }
        return new HashMap<>();
    }
    
    public List<Map<String, Object>> getUserData(String userCode){
        return jdbc.queryForList("select * from SYS_USER where user_code = ?", userCode);
    }
    
    //20190115
    public List<Map<String, Object>> getPolicetaskdisatchIds(String alarmId) {
        return jdbc.queryForList("select * from EFACE_POLICE_TASK_DISPATCH where REL_ID = ?", alarmId);
    }
    
    public List<Map<String, Object>> getTaskids(String[] dispatchIds) {
        return null;
    }
    
    
    public void addRecordByAlarmConfirm(Map<String, Object> taskParams, Map<String, Object> recordParams) throws SQLException {
        Dao dao = EAP.schema.getDao(Constants.APP_NAME);
        String sql = "insert into EFACE_POLICE_TASK_DISPATCH(DISPATCH_ID, TASK_TYPE, TASK_ID, REL_ID, IDENTITY_ID, SENDER, ACCEPTER, CREATE_TIME,"
                + "TASK_LEVEL,IS_SEND, TASK_STATUS, REMARK) values (:DISPATCH_ID, :TASK_TYPE, :TASK_ID, :REL_ID, :IDENTITY_ID,"
                + ":SENDER, :ACCEPTER, :CREATE_TIME, :TASK_LEVEL, :IS_SEND,:TASK_STATUS, :REMARK)";
        dao.addNamedSQL(sql, taskParams);
        String recordSql
            = "insert into EFACE_POLICE_TASK_RECORD(DISPATCH_ID, STATUS, CREATE_TIME, UPDATE_TIME, REMARK, USER_CODE,IS_TIMEOUT) "
                + "values (:DISPATCH_ID, :STATUS, :CREATE_TIME, "
                + ":UPDATE_TIME, :REMARK, :USER_CODE, :IS_TIMEOUT)";
        dao.addNamedSQL(recordSql, recordParams);
        
        dao.commit();
    }
   
    /*
     * 根据告警ID和签收人 查询任务
     */
    public List<Map<String, Object>> getTaskInfoByAlarmIdAndAccepter(String relId, String accepter){
		String sql = "select * from eface_police_task_dispatch where REL_ID = ? and ACCEPTER = ?";
		return jdbc.queryForList(sql, relId, accepter);
	}
    /*
     * 根据dispatchId查询任务记录
     */
    public List<Map<String, Object>> getRecordInfoByDispatchId(String dispatchId){
		String sql = "select * from eface_police_task_record where DISPATCH_ID = ?";
		return jdbc.queryForList(sql, dispatchId);
	}
    /*
     * 根据告警ID和反馈 查询任务
     */
    public List<Map<String, Object>> getTaskInfoByAlarmIdAndRemark(String relId, String remark){
		String sql = "select * from eface_police_task_dispatch where REL_ID = ? and REMARK = ?";
		return jdbc.queryForList(sql, relId, remark);
	}
    /*
     * 查询告警表
     */
    public List<Map<String, Object>> getAlarmIdentityId(String relId){
		String sql = "select OBJECT_EXTEND_INFO,CREATOR from vplus_surveillance_alarm where AlARM_ID = ?";
		return jdbc.queryForList(sql, relId);
	}
    /*
     * 
     */
    public List<Map<String, Object>> getAlarmInfoByAlarmId(String relId){
		String sql = "select OBJECT_ID,DB_ID,ALARM_IMG from vplus_surveillance_alarm where ALARM_ID = ?";
		return jdbc.queryForList(sql, relId);
	}
    /**
     * 获取remark
     * @param relId
     * @param remark
     * @return
     */
    public List<Map<String, Object>> getRemark(String status){
		String sql = "select DISPATCH_ID,REMARK from eface_police_task_record where STATUS = ?";
		return jdbc.queryForList(sql, status);
	}
    /**
     * 判断该remark是否已存在
     * @param time
     * @return
     */
    public List<Map<String, Object>> isRemarkExists(String time){
		String sql = "select * from eface_police_task_record where CREATE_TIME = ?";
		return jdbc.queryForList(sql, time);
	}
}
