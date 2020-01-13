package com.suntek.efacecloud.service.face;

import com.suntek.eap.EAP;
import com.suntek.eap.jdbc.dialect.Dialect;
import com.suntek.eap.jdbc.dialect.DialectFactory;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.SqlUtil;
import com.suntek.efacecloud.util.Constants;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * nvn任务调度
 *
 * @author wjy
 * @version 2019年06月19日
 */
public class FaceNVNTaskDao {

    private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
    Dialect dialect = DialectFactory.getDialect(Constants.APP_NAME, "");

    public int insertNvNTaskInfo(Object[] data) {
        String sql = "insert into EFACE_NVN_TASK_INFO (TASK_ID, TASK_TYPE, TASK_COUNT, TASK_STATUS,"
                + " HANDLE_TIME, CREATOR, PARAM, CREATE_TIME, UPDATE_TIME) values (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        return jdbc.update(sql, data);
    }

    public Map<String, Object> getNeedExcuteTask() {
        String sql = "select * from EFACE_NVN_TASK_INFO where TASK_STATUS = 0 order by UPDATE_TIME desc, CREATE_TIME asc limit 1";
        List<Map<String, Object>> list = jdbc.queryForList(sql);
        if (list.size() > 0) {
            return list.get(0);
        }

        return null;
    }


    public int updateTaskStatus(String id, String status) {
        String dateTime = DateUtil.getDateTime();
        String sql = "update EFACE_NVN_TASK_INFO set TASK_STATUS = ?, UPDATE_TIME = ? where ID = ?";
        return jdbc.update(sql, status, dateTime, id);
    }

    public int updateTaskUpdateTime(String id) {
        String dateTime = DateUtil.getDateTime();
        String sql = "update EFACE_NVN_TASK_INFO set UPDATE_TIME = ? where ID = ?";

        return jdbc.update(sql, dateTime, id);
    }

    public int updateTaskId(String id, String taskId) {
        String sql = "update EFACE_NVN_TASK_INFO set TASK_ID = ? where ID = ?";

        return jdbc.update(sql, taskId, id);
    }

    public int updateTaskIdAndRequestFaceGroups(String id, String taskId, String requestFaceGroups) {
        String sql = "update EFACE_NVN_TASK_INFO set TASK_ID = ?, REQUEST_FACE_GROUPS = ? where ID = ?";

        return jdbc.update(sql, taskId, requestFaceGroups, id);
    }

    public int insertTaskResult(Object[] result) {
        String sql = "insert into EFACE_NVN_TASK_RESULT (TASK_ID, TASK_RESULT, CREATE_TIME) values (?, ?, ?)";
        return jdbc.update(sql, result);
    }

    public List<Map<String, Object>> getTaskParam(String taskId, String id) {
        String sql = "select TASK_TYPE, PARAM from EFACE_NVN_TASK_INFO where TASK_ID = ? or ID = ?";
        return jdbc.queryForList(sql, taskId, id);
    }

    public List<Map<String, Object>> getTaskResult(String taskId) {
        String sql = "select TASK_RESULT from EFACE_NVN_TASK_RESULT where TASK_ID = ?";

        return jdbc.queryForList(sql, taskId);
    }

    public String getHandleTime() {
        String sql = "select sum(HANDLE_TIME) HANDLE_TIME from EFACE_NVN_TASK_INFO where TASK_STATUS <> 2";
        return jdbc.queryForObject(sql, String.class);
    }

    public void deleteTask(String[] taskIds) {

        String sql = "delete from EFACE_NVN_TASK_INFO where TASK_ID in" + SqlUtil.getSqlInParams(taskIds);
        jdbc.update(sql, taskIds);

        sql = "delete from EFACE_NVN_TASK_RESULT where TASK_ID in" + SqlUtil.getSqlInParams(taskIds);
        jdbc.update(sql, taskIds);
    }

    public int getTotalDoingTask() {
        String sql = "select count(1) from EFACE_NVN_TASK_INFO where TASK_STATUS = 0";
        return jdbc.queryForObject(sql, Integer.class);
    }

    public Map<String, Object> getWaitGetResultTask() {
        String sql = "select ID, TASK_ID, TASK_TYPE, PARAM, " + dialect.datetochar("UPDATE_TIME", Dialect.DATETIME_FORMAT_STANDARD) +
                " as UPDATE_TIME, REQUEST_FACE_GROUPS from EFACE_NVN_TASK_INFO where TASK_STATUS = 4 limit 1";
        List<Map<String, Object>> list = jdbc.queryForList(sql);
        if (list != null & list.size() > 0) {
            return list.get(0);
        } else {
            return new HashMap<>();
        }
    }

    public List<Map<String, Object>> getTaskOrderNum(List<String> taskIds) {
        String sql = "SELECT * from (SELECT a.TASK_ID, format(@rank :=@rank + 1, 0) AS RANK_NO FROM"
                + " (SELECT * FROM EFACE_NVN_TASK_INFO t where t.TASK_STATUS = 0 ORDER BY t.UPDATE_TIME desc, t.CREATE_TIME) a,"
                + " (SELECT @rank := 0) b ) c WHERE c.TASK_ID in " + SqlUtil.getSqlInParams(taskIds.toArray());
        return jdbc.queryForList(sql, taskIds.toArray());
    }
}
