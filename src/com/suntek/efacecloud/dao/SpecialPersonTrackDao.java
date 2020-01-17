package com.suntek.efacecloud.dao;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.util.SqlUtil;
import com.suntek.eap.common.util.StringUtil;
import com.suntek.eap.index.Query;
import com.suntek.eap.index.SearchEngineException;
import com.suntek.eap.jdbc.NamedParameterJdbcTemplate;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.Constants;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author: LiLing
 * @create: 2019-10-30 19:55:26
 */
public class SpecialPersonTrackDao {
    private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
    private NamedParameterJdbcTemplate nameJdbc = EAP.jdbc.getNamedParameterTemplate(Constants.APP_NAME);

    public void addTask(Map<String, Object> params) {

        String sql = "INSERT INTO SPECIAL_PERSON_TRACK_TASK (TASK_ID, TASK_NAME, TASK_TYPE, BEGIN_TIME, END_TIME,  "
                + " TOP_N, THRESHOLD, FACE_SCORE, DEVICE_IDS, DEVICE_NAMES, TASK_STATUS, IS_TOP, CREATE_TIME, CREATOR, LIB_TYPE, "
                + " LIB_TYPE_DESC, LIB_ID, LIB_NAME) VALUES (:TASK_ID, :TASK_NAME, :TASK_TYPE, :BEGIN_TIME, "
                + " :END_TIME, :TOP_N, :THRESHOLD, :FACE_SCORE, :DEVICE_IDS, :DEVICE_NAMES, :TASK_STATUS, "
                + " :IS_TOP, :CREATE_TIME, :CREATOR, :LIB_TYPE, :LIB_TYPE_DESC, :LIB_ID, :LIB_NAME)";

        nameJdbc.update(sql, params);
    }

    public List<Map<String, Object>> queryTask(String userCode, String keyword, String beginTime, String endTime, String taskStatus) {

        List<Object> paramList = new ArrayList<Object>();
        StringBuilder sb = new StringBuilder("SELECT t.TASK_NAME, t.TASK_TYPE, t.CREATOR, t.TASK_STATUS, "
                + " t.IS_TOP, t.CREATE_TIME FROM SPECIAL_PERSON_TRACK_TASK t WHERE 1=1 ");
        if (!StringUtil.isNull(keyword)) {
            sb.append(" AND (t.TASK_ID OR t.TASK_NAME LIKE ?) ");
            paramList.add(keyword);
        }
        if (!StringUtil.isNull(beginTime)) {
            sb.append(" AND t.CREATE_TIME >= ? ");
            paramList.add(beginTime);
        }
        if (!StringUtil.isNull(endTime)) {
            sb.append(" AND t.CREATE_TIME <= ? ");
            paramList.add(endTime);
        }
        if (!StringUtil.isNull(taskStatus)) {
            int i = Integer.parseInt(taskStatus);
            sb.append(" AND t.TASK_STATUS = ? ");
            paramList.add(i);
        }
        if (!"admin".equals(userCode)) {
            sb.append(" AND t.CREATOR = ? ");
            paramList.add(userCode);
        }
        //if (!StringUtil.isNull(creator)) {
        //    sb.append(" AND t.CREATOR = ? ");
        //    paramList.add(creator);
        //}
        sb.append(" order by t.IS_TOP desc, t.CREATE_TIME desc ");
        return jdbc.queryForList(sb.toString(), paramList.toArray());
    }

    public boolean updateByIstop(String taskId, String isTop) {
        String sql = "UPDATE SPECIAL_PERSON_TRACK_TASK SET IS_TOP = ? where TASK_ID = ?";
        List<Object> paramList = new ArrayList<Object>();
        paramList.add(isTop);
        paramList.add(taskId);
        return jdbc.update(sql, paramList.toArray()) > 0;
    }

    public void updateByFinishTime(String taskId, String finishTime) {
        String sql = "UPDATE SPECIAL_PERSON_TRACK_TASK SET FINISH_TIME = ? where TASK_ID = ?";
        List<Object> paramList = new ArrayList<Object>();
        paramList.add(finishTime);
        paramList.add(taskId);
        jdbc.update(sql, paramList.toArray());
    }

    public void updateTaskStatus(List<String> taskIds, int taskStatus) {
        String sql = "UPDATE SPECIAL_PERSON_TRACK_TASK SET TASK_STATUS = ? where TASK_ID IN "
                + SqlUtil.getSqlInParams(taskIds.toArray());
        List<Object> paramList = new ArrayList<Object>();
        paramList.add(taskStatus);
        paramList.addAll(taskIds);
        jdbc.update(sql, paramList.toArray());
    }

    public void updateTaskStatus(String taskId, int taskStatus) {
        String sql = "UPDATE SPECIAL_PERSON_TRACK_TASK SET TASK_STATUS = ? where TASK_ID = ? ";
        List<Object> paramList = new ArrayList<Object>();
        paramList.add(taskStatus);
        paramList.add(taskId);
        jdbc.update(sql, paramList.toArray());
    }

    // 异常原因
    public void updateStatusDesc(String taskId, int taskStatus, String desc, String finishTime) {
        String sql = "UPDATE SPECIAL_PERSON_TRACK_TASK SET TASK_STATUS = ?, STATUS_DESC = ?, FINISH_TIME " +
                "= ? where TASK_ID = ? ";
        List<Object> paramList = new ArrayList<Object>();
        paramList.add(taskStatus);
        paramList.add(desc);
        paramList.add(finishTime);
        paramList.add(taskId);
        jdbc.update(sql, paramList.toArray());
    }

    public void updateTaskStatusAndFinish(String taskId, int taskStatus, String finishTime) {
        String sql = "UPDATE SPECIAL_PERSON_TRACK_TASK SET TASK_STATUS = ?, FINISH_TIME " +
                "= ? where TASK_ID = ? ";
        List<Object> paramList = new ArrayList<Object>();
        paramList.add(taskStatus);
        paramList.add(finishTime);
        paramList.add(taskId);
        jdbc.update(sql, paramList.toArray());
    }

    public List<Map<String, Object>> queryTaskDetail(String taskId) {
        // 设备名称暂时不返回
        String sql = " SELECT PARAM FROM  EFACE_NVN_TASK_INFO WHERE TASK_ID = ?";
        List<Map<String, Object>> rows = jdbc.queryForList(sql, taskId);
        rows.forEach(row -> {
            String param = StringUtil.toString(row.get("PARAM"));
            Map<String, Object> map = JSONObject.parseObject(param, Map.class);
            row.putAll(map);
        });
        return rows;
    }

    public Map<String, Object> queryTaskException(String taskId) {
        // 设备名称暂时不返回
        String sql = " SELECT IFNULL(STATUS_DESC, '未知') as EXP_REASON FROM SPECIAL_PERSON_TRACK_TASK WHERE TASK_ID = ?";
        return jdbc.queryForList(sql, taskId).get(0);
    }

    public void deleteTask(String taskIds) {
        // 关联删除任务结果表
        String sql = " DELETE FROM SPECIAL_PERSON_TRACK_TASK WHERE TASK_ID IN " + SqlUtil.getSqlInParams(taskIds);
        jdbc.update(sql, taskIds.split(","));
        String delSql = "DELETE FROM SPECIAL_PERSON_TRACK_RESULT WHERE TASK_ID IN " + SqlUtil.getSqlInParams(taskIds);
        jdbc.update(delSql, taskIds.split(","));
    }

    // 定时查询待办任务列表,
    public List<Map<String, Object>> queryUndoTask(int taskType) {
        String sql = "SELECT TASK_ID, BEGIN_TIME, END_TIME, TOP_N, DEVICE_IDS, THRESHOLD, FACE_SCORE, LIB_TYPE, LIB_ID FROM " +
                " SPECIAL_PERSON_TRACK_TASK where TASK_STATUS = 0 AND TASK_TYPE = ? order by IS_TOP DESC";
        return jdbc.queryForList(sql, taskType);
    }

    // 记录任务关联结果档案
    public void insertRelArchive(String taskId, List<Map<String, Object>> inList) {
        List<Object[]> param = new ArrayList<>();
        for (Map<String, Object> map : inList) {
            param.add(new Object[]{taskId, map.get("PERSON_ID"), map.get("IDENTITY_ID"), map.get("NAME"),
                    map.get("PERMANENT_ADDRESS"), map.get("SEX"), map.get("PERSON_TAGS"), map.get("PIC"),
                    map.get("COUNT")});
        }
        String sql = "INSERT INTO SPECIAL_PERSON_TRACK_RESULT(TASK_ID, PERSON_ID,IDENTITY_ID,NAME," +
                "PERMANENT_ADDRESS,SEX,PERSON_TAG,PIC,COUNT) VALUES(?,?,?,?,?,?,?,?,?)";
        jdbc.batchUpdate(sql, param);
    }

    // 查询任务关联档案 + 任务信息
    public List<Map<String, Object>> queryResult(String taskId) {
        //t.BEGIN_TIME, t.END_TIME, t.TOP_N, t.THRESHOLD, t.DEVICE_IDS,
        String sql = "SELECT t.PARAM , r.PERSON_ID, r.IDENTITY_ID, " +
                " r.NAME, r.PERMANENT_ADDRESS, r.SEX, r.PERSON_TAG, r.PIC,r.COUNT FROM EFACE_NVN_TASK_INFO t " +
                " INNER JOIN SPECIAL_PERSON_TRACK_RESULT r ON t.TASK_ID = r.tASK_ID WHERE t.TASK_ID = ?";
        List<Map<String, Object>> rows = jdbc.queryForList(sql, taskId);
        rows.forEach(row -> {
            String param = StringUtil.toString(row.get("PARAM"));
            Map<String, Object> map = JSONObject.parseObject(param, Map.class);
            row.putAll(map);
        });
        return rows;
    }

    // 人流量总数
    public void insertTotalPerson(String taskId, long total) {
        String sql = "INSERT INTO SPECIAL_PERSON_TRACK_RESULT(TASK_ID, PERSON_FLOW) VALUES (?, ?)";
        jdbc.update(sql, new Object[]{taskId, total});
    }

    public List<Map<String, Object>> queryPersonFlow(String taskId) {
        String sql = "SELECT PERSON_FLOW FROM SPECIAL_PERSON_TRACK_RESULT WHERE TASK_ID = ?";
        return jdbc.queryForList(sql, taskId);
    }

    /**
     * 查询专题库档案信息
     *
     * @param libId
     * @return
     */
    public List<Map<String, Object>> queryTopic(String libId) {
        Query query = new Query(1, 1000000);
        query.addEqualCriteria("LIB_ID", libId);
        try {
            PageQueryResult pageQueryResult = EAP.es.query(Constants.PERSON_TOPIC_INDICE, Constants.PERSON_TOPIC_INFO, query);
            return pageQueryResult.getResultSet();
        } catch (SearchEngineException e) {
            Log.technicalLog.error("查询专题库: " + libId + "异常 : " + e.getMessage(), e);
            return null;
        }
    }
}

