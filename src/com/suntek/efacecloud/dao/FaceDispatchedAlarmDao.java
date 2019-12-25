package com.suntek.efacecloud.dao;

import com.suntek.eap.EAP;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.jdbc.dialect.Dialect;
import com.suntek.eap.jdbc.dialect.DialectFactory;
import com.suntek.eap.org.UserModel;
import com.suntek.eap.smp.Permission;
import com.suntek.eap.util.SqlUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.Constants;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCallback;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 历史告警基础数据库操作类
 *
 * @author swq
 * @version 2016-11-14
 */
public class FaceDispatchedAlarmDao {
    private JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);

    Dialect dialect = DialectFactory.getDialect(Constants.APP_NAME, "");

    private final static String IS_PERSONEL_CONTROL_ELABORATION = AppHandle.getHandle(Constants.APP_NAME)
            .getProperty("IS_PERSONEL_CONTROL_ELABORATION", "0");

    public boolean updateDealStatus(int status, String alarmId) {
        String[] alarmIds = alarmId.split(",");
        List<Object[]> paramList = new ArrayList<Object[]>();
        String updateAuditSql = "update VPLUS_SURVEILLANCE_ALARM set DEAL_STATUS = ? where ALARM_ID  = ?";
        for (int i = 0; i < alarmIds.length; i++) {
            paramList.add(new Object[]{status, alarmIds[i]});
        }

        int[] num = jdbc.batchUpdate(updateAuditSql, paramList);
        return num[0] > 0;
    }

    public List<Map<String, Object>> getAlarmDetail(String alarmId) {
        String detailSql = "select p.PERSON_ID,vfa.OBJECT_ID, vfa.ALARM_TIME, vfa.SCORE, vfa.DB_ID,vfa.DB_NAME, vfa.OBJECT_EXTEND_INFO, d.ORG_CODE, d.NAME ORG_NAME,"
                + "vfa.ALARM_IMG, vfa.TASK_LEVEL ALARM_LEVEL, vfa.FRAME_IMG, vfa.OBJECT_PICTURE TEMPLET_IMG,vfa.DEVICE_ID,vfa.ALGO_TYPE, "
                + " u.USER_NAME, dp.DEPT_NAME, edp.CASE_ID, edp.APPROVE_STATUS from VPLUS_SURVEILLANCE_ALARM vfa "
                + " left join SYS_STRUCTURE_INFO d on d.ORG_CODE = vfa.ORG_CODE "
                + " left join VIID_DISPATCHED_OBJECT obj on vfa.OBJECT_ID = obj.OBJECT_ID "
                + " left join VIID_DISPATCHED_PERSON p on obj.PERSON_ID = p.PERSON_ID "
                + " left join EFACE_DISPATCHED_PERSON edp on edp.PERSON_ID = p.PERSON_ID "
                + " left join SYS_USER u on u.USER_CODE = p.CREATOR "
                + " left join SYS_DEPT dp on u.DEPT_CODE =dp.DEPT_CODE " + "where vfa.ALARM_ID = ? ";
        return jdbc.queryForList(detailSql, alarmId);
    }

    public List<Map<String, Object>> queryAlarmHandleRecord(String alarmId) {
        String sql = "select ALARM_ID, OP_TYPE, HANDLE_RESULT from MD_ALARM_HANDLE_RECORD where ALARM_ID = ?";
        return jdbc.queryForList(sql, alarmId);
    }

    public List<Map<String, Object>> getAlarmDbList(UserModel user) {
        String sql = "select d.DB_ID, d.DB_NAME, d.TAG_CODE DB_KIND from VIID_DISPATCHED_DB d "
                + " where (d.IS_TEMP = 0 and d.TAG_CODE = '' or d.TAG_CODE != '')";

        Object[] param = new Object[]{};
        if (!user.isAdministrator()) {
            sql = "select d.DB_ID, d.DB_NAME, d.TAG_CODE DB_KIND from VIID_DISPATCHED_DB d "
                    + " left join EFACE_DISPATCHED_PERSON_PERMISSION_REL rel on d.DB_ID = rel.DB_ID and rel.USER_CODE = ?"
                    + " where (d.IS_TEMP = 0 and d.TAG_CODE = '' or d.TAG_CODE != '')"
                    + " and d.IS_PUBLIC = 1 or d.CREATOR = ? or  rel.USER_CODE = ?";
            param = new Object[]{user.getCode(), user.getCode(), user.getCode()};
        }

        return jdbc.queryForList(sql, param);
    }

    public List<Map<String, Object>> getAlarmList(UserModel userModel, String alarmStartTime, String alarmEndTime,
                                                  String deviceIds, String dbIds, String alarmType, int type) {

        alarmStartTime += " 00:00:00";
        alarmEndTime += " 23:59:59";
        List<String> paramsList = new ArrayList<String>();

        String sql = "select " + dialect.datetochar("vfa.ALARM_TIME", Dialect.DATETIME_FORMAT_STANDARD)
                + " as ALARM_TIME  " + "from VPLUS_SURVEILLANCE_ALARM vfa where vfa.TASK_TYPE = ?";

        if (1 == type) {
            sql = "select max(" + dialect.datetochar("vfa.ALARM_TIME", Dialect.DATETIME_FORMAT_STANDARD)
                    + ") as ALARM_TIME  " + "from VPLUS_SURVEILLANCE_ALARM vfa where vfa.TASK_TYPE = ? ";
        }

        paramsList.add(StringUtil.toString(Constants.TASK_FACE_ALARM));

        if (!StringUtil.isNull(alarmStartTime) && !StringUtil.isNull(alarmEndTime)) {
            sql += " and vfa.ALARM_TIME between ? and ?";
            paramsList.add(alarmStartTime);
            paramsList.add(alarmEndTime);
        }

        if (!StringUtil.isNull(deviceIds)) {
            sql += " and vfa.DEVICE_ID in " + SqlUtil.getSqlInParams(deviceIds);
            if (deviceIds.indexOf(",") > 0) {
                for (String deviceId : deviceIds.split(",")) {
                    paramsList.add(deviceId);
                }
            } else {
                paramsList.add(deviceIds);
            }
        }

        if (!userModel.isAdministrator()) {
            sql += " and ((" + Permission.getCurNodeAlarmPrivSql(userModel.getCode(), null, "vfa.ORG_CODE");
            sql += " and vfa.TASK_LEVEL in (select ALARM_LEVEL from SYS_USERALARMLEVEL where USER_CODE = ?) ";
            sql += " and vfa.DB_ID in (select d.DB_ID from VIID_DISPATCHED_DB d left join EFACE_DISPATCHED_PERSON_PERMISSION_REL rel on d.DB_ID = rel.DB_ID where d.IS_PUBLIC = 1  or  rel.USER_CODE = ?))";
            sql += " or vfa.DB_ID in (select d.DB_ID from VIID_DISPATCHED_DB d where  d.CREATOR = ?))";
            paramsList.add(userModel.getCode());
            paramsList.add(userModel.getCode());
            paramsList.add(userModel.getCode());
        }

        if (!StringUtil.isNull(dbIds)) {
            sql += " and vfa.DB_ID in " + SqlUtil.getSqlInParams(dbIds);
            if (dbIds.indexOf(",") > 0) {
                for (String dbId : dbIds.split(",")) {
                    paramsList.add(dbId);
                }
            } else {
                paramsList.add(dbIds);
            }
        }

        if (!StringUtil.isNull(alarmType)) {
            if ("1".equals(alarmType)) {
                sql += " and OBJECT_EXTEND_INFO like ? ";
                paramsList.add("%飞识比中%");
            } else if ("0".equals(alarmType)) {
                sql += " and OBJECT_EXTEND_INFO not like ? ";
                paramsList.add("%飞识比中%");
            } else if ("2".equals(alarmType)) {
                sql += " and OBJECT_EXTEND_INFO like ? ";
                paramsList.add("%三方接口比中%");
            }
        }

        if (1 == type) {
            sql += " group by OBJECT_ID ";
        }

        return jdbc.queryForList(sql, paramsList.toArray());
    }

    /**
     * 以人为目标获取其一段时间内（日计）每天的抓拍告警次数
     */
    public List<Map<String, Object>> getAlarmNumByPerson(String identityId, String beginDate, String endDate,
                                                         String orgCode) {
        List<String> paramsList = new ArrayList<String>();

        String sql = "select SUBSTRING(CONVERT(CHAR(19), vfa.ALARM_TIME, 120),1,10) as DAY ,count(1) as COUNT  "
                + "from VPLUS_SURVEILLANCE_ALARM vfa "
                + "left join EFACE_DISPATCHED_PERSON p on p.FEATURE_ID = vfa.OBJECT_ID "
                + "where  vfa.TASK_TYPE = ? and  p.IDENTITY_ID = ? ";

        paramsList.add(StringUtil.toString(Constants.TASK_FACE_ALARM));
        paramsList.add(identityId);

        if (!StringUtil.isNull(orgCode)) {
            sql += " and vfa.DEVICE_ID LIKE ?";
            paramsList.add("%" + orgCode + "%");
        }

        if (!StringUtil.isObjectNull(beginDate) && !StringUtil.isObjectNull(endDate)) {
            sql += " and SUBSTRING(CONVERT(CHAR(19), vfa.ALARM_TIME, 120),1,10) between ? and ?";
            paramsList.add(beginDate);
            paramsList.add(endDate);
        }

        sql += " group by SUBSTRING(CONVERT(CHAR(19), vfa.ALARM_TIME, 120),1,10) order by DAY ";

        return jdbc.queryForList(sql, paramsList.toArray());
    }

    /**
     * 获取最近（如7天）某个人的告警次数
     *
     * @param params
     * @return
     */
    public int getRecentAlarmCount(Map<String, Object> params) {
        StringBuilder sql = new StringBuilder("select COUNT(1) STAT_NUM from VPLUS_SURVEILLANCE_ALARM ");

        sql.append("where 1=1 ");
        List<String> sqlParams = new ArrayList<String>();
        String beginTime = StringUtil.toString(params.get("BEGIN_TIME"));
        String endTime = StringUtil.toString(params.get("END_TIME"));
        String objectId = StringUtil.toString(params.get("OBJECT_ID"));
        if (!StringUtil.isEmpty(beginTime)) {
            sql.append(" and ALARM_TIME >= ? ");
            sqlParams.add(beginTime);
        }
        if (!StringUtil.isEmpty(endTime)) {
            sql.append(" and ALARM_TIME <= ? ");
            sqlParams.add(endTime);
        }
        if (!StringUtil.isEmpty(objectId)) {
            sql.append(" and OBJECT_ID = ? ");
            sqlParams.add(objectId);
        }
        return jdbc.queryForObject(sql.toString(), Integer.class, sqlParams.toArray());
    }

    public Integer countAlarm(Map<String, Object> parameters) {
        List<Object> list = new ArrayList<>();

        String isHistory = StringUtil.toString(parameters.get("isHistory"));
        String fromTable = "VPLUS_SURVEILLANCE_ALARM";
        if ("1".equals(isHistory)) {
            fromTable = "VPLUS_SURVEILLANCE_ALARM_HIS";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("select count(*) from " + fromTable + " vfa ");

        String userCode = StringUtil.toString(parameters.get("USER_CODE"));
        if (!"admin".equals(userCode)) {
            // 精细化控制，通过权限管理配置可见信息（前提：用户具有告警查询-人脸告警权限，并且具有告警选择）
            if ("1".equals(IS_PERSONEL_CONTROL_ELABORATION)) {
                sb.append("left join VIID_DISPATCHED_DB d on d.DB_ID = vfa.DB_ID ")
                        .append("join VIID_DISPATCHED_PERSON vdp on vfa.OBJECT_ID = vdp.FACE_ID ")
                        .append("join SYS_USER u on vdp.CREATOR = u.USER_CODE ").append("where 1=1 ");

                String deptCode = StringUtil.toString(parameters.get("DEPT_CODE"));
                sb.append("AND ("
                        // 用户具有告警查询-人脸告警权限，并且具有告警选择
                        + "("
                        + "    EXISTS (SELECT 1 FROM SYS_USERFUNC uf,SYS_FUNLIST f WHERE uf.USER_CODE=? AND uf.ORG_CODE=f.FUNID AND f.MENUID=?) "
                        + "    AND vfa.ORG_CODE IN ( SELECT ORG_CODE FROM SYS_USERALARM su WHERE su.IS_HALF = 0 AND su.USER_CODE =? ) "
                        + ")"
                        + "AND ("
                        + "((d.TAG_CODE='01' OR d.TAG_CODE='02') AND ("
                        // 查看本级及下级所有任务
                        + "    EXISTS (SELECT 1 FROM SYS_USERFUNC uf,SYS_FUNLIST f WHERE uf.USER_CODE=? AND uf.ORG_CODE=f.FUNID AND f.MENUID=? AND vfa.ORG_CODE LIKE ?) "
                        // 设备所属辖区内民警帐号
                        + "    OR (EXISTS (SELECT 1 FROM V_VPLUS_DEVICE_INFO vdi WHERE vdi.DEVICE_ID=vfa.DEVICE_ID AND vdi.ORG_CODE=?)) "
                        // 布控创建人
                        + "    OR vdp.CREATOR=? "
                        // 查看告警权限设置
                        + "    OR EXISTS (SELECT 1 FROM EFACE_DISPATCHED_PERSON_AUTHORITY au WHERE au.PERSON_ID=vdp.PERSON_ID AND au.USER_CODE=?)"
                        + "))"
                        + "OR (d.TAG_CODE='03' AND ("
                        // 查看本级及下级所有任务
                        + "    EXISTS (SELECT 1 FROM SYS_USERFUNC uf,SYS_FUNLIST f WHERE uf.USER_CODE=? AND uf.ORG_CODE=f.FUNID AND f.MENUID=? AND vfa.ORG_CODE LIKE ?)"
                        // 布控创建人
                        + "    OR vdp.CREATOR=? "
                        // 查看告警权限设置
                        + "    OR (EXISTS (SELECT 1 FROM EFACE_DISPATCHED_PERSON_AUTHORITY au WHERE au.PERSON_ID=vdp.PERSON_ID AND au.USER_CODE=?))"
                        + "))"
                        + ")"
                        + ")");

                String civilCode = StringUtil.toString(parameters.get("CIVIL_CODE"));
                list.add(userCode);
                list.add(Constants.DEFENCE_FACEALARM);
                list.add(userCode);
                list.add(userCode);
                list.add(Constants.DISPATCHED_PERSON_PERMISSION_MENUID);
                list.add(civilCode + "%");
                list.add(civilCode);
                list.add(userCode);
                list.add(userCode);

                list.add(userCode);
                list.add(Constants.DISPATCHED_PERSON_PERMISSION_MENUID);
                list.add(civilCode + "%");
                list.add(userCode);
                list.add(userCode);

                // 布控人
                String creators = StringUtil.toString(parameters.get("CREATOR"));
                if (!StringUtil.isNull(creators)) {
                    String[] creatorstr = StringUtil.toString(creators).split(",");
                    sb.append(" and vdp.CREATOR in " + SqlUtil.getSqlInParams(creators));
                    for (String each : creatorstr) {
                        list.add(each);
                    }
                }

                // 布控分局
                String orgCode = StringUtil.toString(parameters.get("ORG_CODE"));
                if (!StringUtil.isNull(orgCode)) {
                    sb.append(" and u.DEPT_CODE like ?");
                    list.add(orgCode + "%");
                }

                // 布控时间
                String surveillance_begin_time = StringUtil.toString(parameters.get("SURVEILLANCE_BEGIN_TIME"));
                if (!StringUtil.isNull(surveillance_begin_time)) {
                    sb.append(" and vdp.CREATE_TIME >= ?");
                    list.add(surveillance_begin_time);
                }

                String surveillance_end_time = StringUtil.toString(parameters.get("SURVEILLANCE_END_TIME"));
                if (!StringUtil.isNull(surveillance_end_time)) {
                    sb.append(" and vdp.CREATE_TIME <= ?");
                    list.add(surveillance_end_time);
                }
            } else {
                sb.append("where 1=1 ");
                sb.append(" and ((" + Permission.getCurNodeAlarmPrivSql(
                        StringUtil.toString(parameters.get("USER_CODE")), null, "vfa.ORG_CODE"));
                sb.append(" and vfa.TASK_LEVEL in (select ALARM_LEVEL from SYS_USERALARMLEVEL where USER_CODE = ?)");
                sb.append(" and vfa.DB_ID in (select d.DB_ID from VIID_DISPATCHED_DB"
                        + " d left join EFACE_DISPATCHED_PERSON_PERMISSION_REL rel on d.DB_ID ="
                        + " rel.DB_ID where d.IS_PUBLIC = 1 or rel.USER_CODE = ?))");
                sb.append(" or vfa.DB_ID in (select d.DB_ID from VIID_DISPATCHED_DB d where d.CREATOR = ?))");
                list.add(parameters.get("USER_CODE"));
                list.add(parameters.get("USER_CODE"));
                list.add(parameters.get("USER_CODE"));
            }
        } else {
            sb.append("where 1=1 ");
        }

        String isEscapeHit = StringUtil.toString(parameters.get("IS_ESCAPE_HIT"), "");
        if ("1".equals(isEscapeHit)) {// 全国在逃人员库比中
            sb.append(" and vfa.OBJECT_EXTEND_INFO like  '%\"ESCAPEE_FLAG\":1%' ");
        } else if ("0".equals(isEscapeHit)) {
            sb.append("and vfa.OBJECT_EXTEND_INFO not like  '%\"ESCAPEE_FLAG\":1%'");
        }
        sb.append(" and vfa.TASK_TYPE = ? ");
        int taskType = StringUtil.toInteger(parameters.get("TASK_TYPE"), Constants.TASK_FACE_ALARM);
        list.add(taskType);

        String beginTime = StringUtil.toString(parameters.get("BEGIN_TIME"));
        String endTime = StringUtil.toString(parameters.get("END_TIME"));

        String searchType = StringUtil.toString(parameters.get("SEARCH_TYPE"));
        if (!StringUtil.isNull(searchType)) {
            sb.append(" and (vfa.DEAL_STATUS is null or (vfa.DEAL_STATUS <> ? and vfa.DEAL_STATUS <> ?)) ");
            list.add(Constants.DEAL_STATUS_DELETE);
            list.add(Constants.DEAL_STATUS_DELETE);
        }

        String dbIds = StringUtil.toString(parameters.get("DB_ID"));
        if (!StringUtil.isNull(dbIds)) {
            String sqlSta = SqlUtil.getSqlInParams(dbIds);
            sb.append(" and vfa.DB_ID in " + sqlSta);
            if (dbIds.indexOf(",") > 0) {
                for (String dbId : dbIds.split(",")) {
                    list.add(dbId);
                }
            } else {
                list.add(dbIds);
            }
        }


        if (!StringUtil.isNull(beginTime) && !StringUtil.isNull(endTime)) {
            sb.append(" and vfa.ALARM_TIME between ? and ?");
            list.add(beginTime);
            list.add(endTime);
        } else if (!StringUtil.isNull(beginTime)) {
            sb.append(" and vfa.ALARM_TIME > ?");
            list.add(beginTime);
        } else if (!StringUtil.isNull(endTime)) {
            sb.append(" and vfa.ALARM_TIME < ?");
            list.add(endTime);
        }


        String keywords = StringUtil.toString(parameters.get("KEYWORDS"));
        if (!StringUtil.isNull(keywords)) {
            sb.append(" and vfa.OBJECT_EXTEND_INFO like ? ");
            list.add("%" + keywords + "%");
        }

        // 设备ID
        String deviceIds = StringUtil.toString(parameters.get("DEVICE_IDS"));
        if (!StringUtil.isNull(deviceIds)) {
            String sqlSta = SqlUtil.getSqlInParams(deviceIds);
            sb.append(" and vfa.DEVICE_ID in " + sqlSta);
            if (deviceIds.indexOf(",") > 0) {
                for (String deviceId : deviceIds.split(",")) {
                    list.add(deviceId);
                }
            } else {
                list.add(deviceIds);
            }
        }

        // 场景ID
        String sceneId = StringUtil.toString(parameters.get("SCENE_ID"));
        if (!StringUtil.isEmpty(sceneId)) {
            sb.append(" and vfa.SCENE_ID = ? ");
            list.add(sceneId);
        }

        // OBJECT_ID,用于做一个人的告警频次分析
        String objectId = StringUtil.toString(parameters.get("OBJECT_ID"));
        if (!StringUtil.isEmpty(objectId)) {
            sb.append(" and vfa.OBJECT_ID = ? ");
            list.add(objectId);
        }

        // 相似度
        String threshold = StringUtil.toString(parameters.get("THRESHOLD"));
        if (!StringUtil.isNull(threshold)) {
            double score = Integer.parseInt(threshold);// / 100.0;
            sb.append(" and vfa.SCORE >= ?");
            list.add(score);
        }

        // 算法id
        String algorithm_id = StringUtil.toString(parameters.get("AlGORITHM_ID"));
        if (!StringUtil.isNull(algorithm_id)) {
            if ("90002".equals(algorithm_id)) {
                sb.append(" and OBJECT_EXTEND_INFO like ? ");
                list.add("%飞识比中%");
            }
        }

        String alarmType = StringUtil.toString(parameters.get("ALARM_TYPE"), "");
        if ("1".equals(alarmType)) {
            sb.append(" and OBJECT_EXTEND_INFO like ? ");
            list.add("%飞识比中%");
        } else if ("0".equals(alarmType)) {
            sb.append(" and OBJECT_EXTEND_INFO not like ? ");
            list.add("%飞识比中%");
        } else if ("2".equals(alarmType)) {
            sb.append(" and OBJECT_EXTEND_INFO like ? ");
            list.add("%三方接口比中%");
        }

        // 告警反馈 前端值： 0:未签收 1：已签收 2：未反馈 3：已反馈
        // 数据库:0:未签收 1：已签收 2：已反馈 9：已抓获
        String alarmHandle = StringUtil.toString(parameters.get("ALARM_HANDLE"));
        if (!StringUtil.isNull(alarmHandle)) {
            int iAlarmHandle = Integer.parseInt(alarmHandle);
            if (iAlarmHandle == Constants.ALARM_UNSIGN_FRONT_END) {// 0
                sb.append(" and (vfa.ALARM_HANDLE = ? or vfa.ALARM_HANDLE is null) and vfa.TASK_LEVEL <> ?");
                list.add(alarmHandle);
            } else if (iAlarmHandle == Constants.ALARM_SIGNED_FRONT_END) {// 1
                sb.append(" and vfa.ALARM_HANDLE >= ? and vfa.TASK_LEVEL <> ?");
                list.add(alarmHandle);
            } else if (iAlarmHandle == Constants.ALARM_UNHANDLE_FRONT_END) {// 2
                sb.append(" and vfa.ALARM_HANDLE = ? and vfa.TASK_LEVEL <> ?");
                list.add(Constants.ALARM_SIGNED);

            } else if (iAlarmHandle == Constants.ALARM_HANDLED_FRONT_END) {// 3
                sb.append(" and vfa.ALARM_HANDLE >= ? and vfa.TASK_LEVEL <> ?");
                list.add(Constants.ALARM_HANDLED);
            }
            list.add(Constants.ALARM_LEVEL_BLUE);// 蓝色告警不需签收反馈，过滤。
        }

        // 是否已抓获 0:否 1：是
        String isCatch = StringUtil.toString(parameters.get("IS_CATCH"));
        if (!StringUtil.isNull(isCatch)) {
            if (isCatch.equals("0")) {
                sb.append(" and vfa.ALARM_HANDLE <> ? ");
                list.add(Constants.ALARM_CATCHED);
            } else {
                sb.append(" and vfa.ALARM_HANDLE = ? ");
                list.add(Constants.ALARM_CATCHED);
            }
        }

        // 告警等级
        String alarmLevel = StringUtil.toString(parameters.get("ALARM_LEVEL"));
        if (!StringUtil.isNull(alarmLevel)) {
            sb.append(" and vfa.TASK_LEVEL in " + SqlUtil.getSqlInParams(alarmLevel));
            for (int i = 0; i < alarmLevel.split(",").length; i++) {
                list.add(alarmLevel.split(",")[i]);
            }
        }
        // 是否告警确认 0:否， 1：是，2：未确认，3：已确认
        String confirmStatus = StringUtil.toString(parameters.get("CONFIRM_STATUS"));
        if (!StringUtil.isNull(confirmStatus)) {
            if (Constants.CONFIRM_STATUS_TREATED.equals(confirmStatus)) {
                //已确认3
                sb.append(" and vfa.CONFIRM_STATUS is not null ");
            } else if (Constants.CONFIRM_STATUS_UNTREATED.equals(confirmStatus)) {
                //未确认2
                sb.append(" and vfa.CONFIRM_STATUS is null ");
            } else if (Constants.CONFIRM_STATUS_NOCONFIRM.equals(confirmStatus) || Constants.CONFIRM_STATUS_CORRECT.equals(confirmStatus)) {
                //准确1、不准确0
                sb.append(" and vfa.CONFIRM_STATUS = ? ");
                list.add(confirmStatus);
            }
        }

        Log.faceSearchLog.info("告警查询sql :" + sb.toString());
        return jdbc.queryForObject(sb.toString(), Integer.class, list.toArray());
    }

    /**
     * 获取最近（如7天）某个人的告警列表
     *
     * @param params
     * @return
     */
    public List<Map<String, Object>> getRecentAlarmList(Map<String, Object> params) {
        StringBuilder sql = new StringBuilder("select vfa.ALARM_ID, vfa.ALARM_TIME, vfa.OBJECT_EXTEND_INFO PERSON_NAME,"
                + " vfa.OBJECT_EXTEND_INFO PERSON_SEX, vfa.TASK_LEVEL ALARM_LEVEL, vfa.OBJECT_EXTEND_INFO IDENTITY_ID, vfa.ALARM_IMG, "
                + " vfa.DEVICE_ID ORIGINAL_DEVICE_ID, vfa.DB_NAME, vfa.FRAME_IMG, "
                + " vfa.OBJECT_PICTURE TEMPLET_IMG, vfa.SCORE, d.NAME ORG_NAME, s.DEPT_NAME"
                + " from VPLUS_SURVEILLANCE_ALARM vfa "
                + " left join V_VPLUS_DEVICE_INFO a on vfa.DEVICE_ID = a.DEVICE_ID "
                + " left join SYS_STRUCTURE_INFO d on d.ORG_CODE = a.ORG_CODE "
                + " left join VPLUS_VIDEO_CAMERA b on vfa.DEVICE_ID = b.DEVICE_ID "
                + " left join SYS_DEPT s on b.ORG_CODE = s.CIVIL_CODE " + " where 1=1 ");
        List<String> sqlParams = new ArrayList<String>();
        String beginTime = StringUtil.toString(params.get("BEGIN_TIME"));
        String endTime = StringUtil.toString(params.get("END_TIME"));
        String objectId = StringUtil.toString(params.get("OBJECT_ID"));
        if (!StringUtil.isEmpty(beginTime)) {
            sql.append(" and vfa.ALARM_TIME >= ? ");
            sqlParams.add(beginTime);
        }
        if (!StringUtil.isEmpty(endTime)) {
            sql.append(" and vfa.ALARM_TIME <= ? ");
            sqlParams.add(endTime);
        }
        if (!StringUtil.isEmpty(objectId)) {
            sql.append(" and vfa.OBJECT_ID = ? ");
            sqlParams.add(objectId);
        }
        sql.append(" and vfa.TASK_TYPE = ? ");
        sqlParams.add("1");
        sql.append(" order by vfa.ALARM_TIME desc");
        return jdbc.queryForList(sql.toString(), sqlParams.toArray());
    }

    /**
     * 获取告警设备关联所属的派出所信息（关联方式1）
     */
    public List<Map<String, Object>> getRelativePoliceStaion1Info(String deviceId) {

        // 设备表VPLUS_VIDEO_CAMERA关联SYS_DEPT表
        String sql = "SELECT a.DEPT_NAME "
                + "FROM SYS_DEPT a INNER JOIN VPLUS_VIDEO_CAMERA b ON a.CIVIL_CODE=b.ORG_CODE "
                + "WHERE b.DEVICE_ID = ?";

        return jdbc.queryForList(sql, new Object[]{deviceId});
    }

    /**
     * 获取告警设备关联所属的派出所信息（关联方式1）
     */
    public List<Map<String, Object>> getRelativePoliceStaion2Info(String deviceId) {

        // 设备表V_VPLUS_DEVICE_INFO关联SYS_STRUCTURE_INFO表
        String sql = "SELECT s.NAME DEPT_NAME "
                + "FROM SYS_STRUCTURE_INFO s INNER JOIN V_VPLUS_DEVICE_INFO i ON s.ORG_CODE=i.ORG_CODE "
                + "WHERE i.DEVICE_ID = ? ";

        return jdbc.queryForList(sql, new Object[]{deviceId});
    }

    /**
     * @param alarmId
     * @param status
     * @return
     */
    public boolean updateConfirmStatus(String status, String alarmId) {
        String updateAuditSql = "update VPLUS_SURVEILLANCE_ALARM set CONFIRM_STATUS = ? where ALARM_ID  = ?";
        int num = jdbc.update(updateAuditSql, status, alarmId);
        return num > 0;
    }

    /**
     * @param alarmId
     * @param extendInfo
     * @return
     */
    public boolean updateExtendInfo(String extendInfo, String alarmId) {
        String updateAuditSql = "update VPLUS_SURVEILLANCE_ALARM set OBJECT_EXTEND_INFO = ? where ALARM_ID  = ?";
        int num = jdbc.update(updateAuditSql, extendInfo, alarmId);
        return num > 0;
    }

    public List<Map<String, Object>> queryActivityInfo(String infoId) {
        String sql = "select ACTIVITY_NAME, ACTIVITY_TIME, ACTIVITY_PLACE, PURCHASER_SEAT_NO, PURCHASER_NAME,"
                + " PURCHASER_IDENTITY, FACE_PIC, ENTRANCE_NAME from activity_info WHERE INFO_ID = ?";
        return jdbc.queryForList(sql, new Object[]{infoId});
    }

    public List<Map<String, Object>> queryActivityInfo(Set infoIds) {
        if (infoIds.isEmpty()) {
            return Collections.emptyList();
        }
        String sql = "select INFO_ID, ACTIVITY_NAME, ACTIVITY_TIME, ACTIVITY_PLACE, PURCHASER_SEAT_NO, PURCHASER_NAME,"
                + " PURCHASER_IDENTITY, FACE_PIC, ENTRANCE_NAME from activity_info WHERE INFO_ID in " + SqlUtil.getSqlInParams(infoIds.toArray());
        return jdbc.queryForList(sql, infoIds.toArray());
    }

    /**
     * 判断表是否存在
     *
     * @param table
     * @return
     */
    public boolean isTableExist(String table) {
        String sql = "show tables like '" + table + "'";
        Boolean restult = jdbc.execute(sql, new PreparedStatementCallback<Boolean>() {

            @Override
            public Boolean doInPreparedStatement(PreparedStatement ps) throws SQLException, DataAccessException {
                ps.execute();
                ResultSet resultSet = ps.getResultSet();
                if (resultSet.next()) {
                    return true;
                }
                return false;
            }
        });
        return restult;
    }

    public Map<String, Integer> countAlgoConfirm(String algo, String beginTime, String endTime) {
        StringBuffer countSql = new StringBuffer("select CONFIRM_STATUS, count(1) `COUNT` from VPLUS_SURVEILLANCE_ALARM where 1=1 ");
        List<String> sqlParams = new ArrayList<String>();
        if (!StringUtil.isEmpty(algo)) {
            countSql.append(" and  OBJECT_EXTEND_INFO like ?  ");
            sqlParams.add("%" + algo + "%");
        }
        if (!StringUtil.isEmpty(beginTime)) {
            countSql.append(" and ALARM_TIME >= ? ");
            sqlParams.add(beginTime);
        }
        if (!StringUtil.isEmpty(endTime)) {
            countSql.append(" and ALARM_TIME <= ? ");
            sqlParams.add(endTime);
        }
        countSql.append(" GROUP BY CONFIRM_STATUS");
        List<Map<String, Object>> result = jdbc.queryForList(countSql.toString(), sqlParams.toArray());
        if (!result.isEmpty()) {
            return result.stream().collect(Collectors.toMap(o -> StringUtil.toString(o.get("CONFIRM_STATUS"), ""), o -> StringUtil.toInteger(o.get("COUNT"), 0)));
        }
        return Collections.emptyMap();
    }

    /**
     * 得到人脸告警总数
     *
     * @param beginTime 开始时间
     * @param endTime   结束时间
     * @return
     */
    public int getFaceAlarmCount(String beginTime, String endTime) {
        return getAlarmCount(beginTime, endTime, true, null);
    }

    /**
     * 得到车辆告警总数
     *
     * @param beginTime 开始时间
     * @param endTime   结束时间
     * @return
     */
    public int getCarAlarmCount(String beginTime, String endTime) {
        return getAlarmCount(beginTime, endTime, false, null);
    }

    /**
     * 得到车辆已处理告警总数
     *
     * @param beginTime 开始时间
     * @param endTime   结束时间
     * @return
     */
    public int getCarDealAlarmCount(String beginTime, String endTime) {
        return getAlarmCount(beginTime, endTime, false, true);
    }

    private int getAlarmCount(String beginTime, String endTime, Boolean isFace, Boolean isAlready) {
        StringBuffer countSql = new StringBuffer("select count(1) `COUNT` "
                + "from VPLUS_SURVEILLANCE_ALARM a INNER JOIN VPLUS_VIDEO_CAMERA b on a.DEVICE_ID = b.DEVICE_ID  where 1=1 ");
        List<String> sqlParams = new ArrayList<>();
        if (isFace != null) {
            if (isFace) {
                countSql.append(" and b.SPECIAL_PURPOSE = 1 ");
            } else {
                countSql.append(" and b.SPECIAL_PURPOSE = 2 ");
            }
        }
        if (!StringUtil.isEmpty(beginTime)) {
            countSql.append(" and a.ALARM_TIME >= ? ");
            sqlParams.add(beginTime);
        }
        if (!StringUtil.isEmpty(endTime)) {
            countSql.append(" and a.ALARM_TIME <= ? ");
            sqlParams.add(endTime);
        }
        if (isAlready != null && isAlready) {
            countSql.append(" and a.DEAL_STATUS IS NOT NULL");
        }
        return jdbc.queryForObject(countSql.toString(), sqlParams.toArray(), Integer.class);
    }

    /**
     * 得到已处理人脸告警总数
     *
     * @param beginTime 开始时间
     * @param endTime   结束时间
     * @return
     */
    public int getDealtFaceAlarmCount(String beginTime, String endTime) {
        return getAlarmCount(beginTime, endTime, true, true);
    }

    /**
     * 得到按照月分组的人脸告警数量
     *
     * @param year 年份
     * @return
     */
    public List<Map<String, Object>> getMonthGroupFaceAlarmCount(Integer year) {
        return this.getGroupMonthAlarmCount(year, true);
    }

    /**
     * 得到按照月分组的人脸告警数量
     *
     * @param year 年份
     * @return
     */
    public List<Map<String, Object>> getMonthGroupCarAlarmCount(Integer year) {
        return this.getGroupMonthAlarmCount(year, false);
    }


    /**
     * 得到按照月分组的告警数量
     *
     * @param year   年份
     * @param isFace 是否人脸告警
     * @return
     */
    private List<Map<String, Object>> getGroupMonthAlarmCount(Integer year, Boolean isFace) {
        final String alarmTime = "a.ALARM_TIME";
        String monthExpression = dialect.datepart(alarmTime, 1);
        String yearExpression = dialect.datepart(alarmTime, 0);
        StringBuilder sql = new StringBuilder("SELECT " + monthExpression + "AS MONTH, "
                + "COUNT( 1 ) AS NUM  "
                + "FROM VPLUS_SURVEILLANCE_ALARM a INNER JOIN VPLUS_VIDEO_CAMERA b on a.DEVICE_ID = b.DEVICE_ID  "
                + "WHERE 1 = 1");
        List<Object> sqlParams = new ArrayList<>();
        if (year != null) {
            sql.append(" and ").append(yearExpression).append(" = ? ");
            sqlParams.add(year);
        }
        if (isFace != null) {
            if (isFace) {
                sql.append(" and b.SPECIAL_PURPOSE = 1 ");
            } else {
                sql.append(" and b.SPECIAL_PURPOSE = 2 ");
            }
        }
        sql.append(" group by ").append(monthExpression);
        return jdbc.queryForList(sql.toString(), sqlParams.toArray());
    }


    public Integer countHanderAlarm(Map<String, Object> parameters) {
        List<Object> list = new ArrayList<>();

        String isHistory = StringUtil.toString(parameters.get("isHistory"));
        String fromTable = "VPLUS_SURVEILLANCE_ALARM";
        if ("1".equals(isHistory)) {
            fromTable = "VPLUS_SURVEILLANCE_ALARM_HIS";
        }
        /****/
        String confirmStatus = StringUtil.toString(parameters.get("CONFIRM_STATUS"));
        /****/

        StringBuilder sb = new StringBuilder();
        sb.append("select count(*) from " + fromTable + " vfa ");

        String beginTime = StringUtil.toString(parameters.get("BEGIN_TIME"));
        String endTime = StringUtil.toString(parameters.get("END_TIME"));
        if (!StringUtil.isNull(confirmStatus)) {

            if (confirmStatus.equals(Constants.CONFIRM_STATUS_UNTREATED)) {
                // confirmStatus=2，未处理
                // sb.append(" where vfa.ALARM_ID not in (select d.REL_ID
                // relId from EFACE_POLICE_TASK_DISPATCH d "
                // + " LEFT JOIN EFACE_POLICE_TASK_RECORD r on d.DISPATCH_ID = r.DISPATCH_ID "
                // + " LEFT JOIN EFACE_POLICE_TASK_REMARK rem on r.REMARK_ID = rem.REMARK_ID "
                // + " where rem.REMARK_KEY is not null GROUP BY d.REL_ID)" );
            } else {
                // 已处理
                sb.append("INNER JOIN ("
                        + "SELECT d.REL_ID relId,d.DISPATCH_ID dispatchId, rem.REMARK_KEY remarkKey,  rem.REMARK_VALUE remarkValue FROM EFACE_POLICE_TASK_DISPATCH d  "
                        + " LEFT JOIN EFACE_POLICE_TASK_RECORD r ON d.DISPATCH_ID = r.DISPATCH_ID  "
                        + "LEFT JOIN EFACE_POLICE_TASK_REMARK rem ON r.DISPATCH_ID = rem.DISPATCH_ID   "
                        + " WHERE rem.REMARK_KEY = '" + Constants.ALARM_CONFIRM_KEY + "'");
                if (confirmStatus.equals(Constants.CONFIRM_STATUS_NOCONFIRM)) {
                    // confirmStatus=0 ，不准确
                    sb.append(" and rem.REMARK_VALUE = '" + Constants.ALARM_CONFIRM_VALUE_NO + "'");
                } else if (confirmStatus.equals(Constants.CONFIRM_STATUS_CORRECT)) {
                    // confirmStatus=1，准确
                    sb.append(" and rem.REMARK_VALUE = '" + Constants.ALARM_CONFIRM_VALUE_YES + "'");
                } else if (confirmStatus.equals(Constants.CONFIRM_STATUS_TREATED)) {
                    // confirmStatus=3，已处理
                    sb.append(" and rem.REMARK_VALUE is not null");
                }
                if (!StringUtil.isNull(beginTime) && !StringUtil.isNull(endTime)) {
                    sb.append(" and rem.CREATE_TIME between ? and ?");
                    list.add(beginTime);
                    list.add(endTime);
                } else if (!StringUtil.isNull(beginTime)) {
                    sb.append(" and rem.CREATE_TIME > ?");
                    list.add(beginTime);
                } else if (!StringUtil.isNull(endTime)) {
                    sb.append(" and rem.CREATE_TIME < ?");
                    list.add(endTime);
                }
                sb.append(" GROUP BY d.REL_ID) ala on ala.relId = vfa.ALARM_ID ");
            }

        }

        String userCode = StringUtil.toString(parameters.get("USER_CODE"));
        if (!"admin".equals(userCode)) {
            // 精细化控制，通过权限管理配置可见信息（前提：用户具有告警查询-人脸告警权限，并且具有告警选择）
            if ("1".equals(IS_PERSONEL_CONTROL_ELABORATION)) {
                sb.append("left join VIID_DISPATCHED_DB d on d.DB_ID = vfa.DB_ID ")
                        .append("join VIID_DISPATCHED_PERSON vdp on vfa.OBJECT_ID = vdp.FACE_ID ")
                        .append("join SYS_USER u on vdp.CREATOR = u.USER_CODE ").append("where 1=1 ");

                String deptCode = StringUtil.toString(parameters.get("DEPT_CODE"));
                sb.append("AND ("
                        // 用户具有告警查询-人脸告警权限，并且具有告警选择
                        + "("
                        + "    EXISTS (SELECT 1 FROM SYS_USERFUNC uf,SYS_FUNLIST f WHERE uf.USER_CODE=? AND uf.ORG_CODE=f.FUNID AND f.MENUID=?) "
                        + "    AND vfa.ORG_CODE IN ( SELECT ORG_CODE FROM SYS_USERALARM su WHERE su.IS_HALF = 0 AND su.USER_CODE =? ) "
                        + ")"
                        + "AND ("
                        + "((d.TAG_CODE='01' OR d.TAG_CODE='02') AND ("
                        // 查看本级及下级所有任务
                        + "    EXISTS (SELECT 1 FROM SYS_USERFUNC uf,SYS_FUNLIST f WHERE uf.USER_CODE=? AND uf.ORG_CODE=f.FUNID AND f.MENUID=? AND vfa.ORG_CODE LIKE ?) "
                        // 设备所属辖区内民警帐号
                        + "    OR (EXISTS (SELECT 1 FROM V_VPLUS_DEVICE_INFO vdi WHERE vdi.DEVICE_ID=vfa.DEVICE_ID AND vdi.ORG_CODE=?)) "
                        // 布控创建人
                        + "    OR vdp.CREATOR=? "
                        // 查看告警权限设置
                        + "    OR EXISTS (SELECT 1 FROM EFACE_DISPATCHED_PERSON_AUTHORITY au WHERE au.PERSON_ID=vdp.PERSON_ID AND au.USER_CODE=?)"
                        + "))"
                        + "OR (d.TAG_CODE='03' AND ("
                        // 查看本级及下级所有任务
                        + "    EXISTS (SELECT 1 FROM SYS_USERFUNC uf,SYS_FUNLIST f WHERE uf.USER_CODE=? AND uf.ORG_CODE=f.FUNID AND f.MENUID=? AND vfa.ORG_CODE LIKE ?)"
                        // 布控创建人
                        + "    OR vdp.CREATOR=? "
                        // 查看告警权限设置
                        + "    OR (EXISTS (SELECT 1 FROM EFACE_DISPATCHED_PERSON_AUTHORITY au WHERE au.PERSON_ID=vdp.PERSON_ID AND au.USER_CODE=?))"
                        + "))"
                        + ")"
                        + ")");

                String civilCode = StringUtil.toString(parameters.get("CIVIL_CODE"));
                list.add(userCode);
                list.add(Constants.DEFENCE_FACEALARM);
                list.add(userCode);
                list.add(userCode);
                list.add(Constants.DISPATCHED_PERSON_PERMISSION_MENUID);
                list.add(civilCode + "%");
                list.add(civilCode);
                list.add(userCode);
                list.add(userCode);

                list.add(userCode);
                list.add(Constants.DISPATCHED_PERSON_PERMISSION_MENUID);
                list.add(civilCode + "%");
                list.add(userCode);
                list.add(userCode);

                // 布控人
                String creators = StringUtil.toString(parameters.get("CREATOR"));
                if (!StringUtil.isNull(creators)) {
                    String[] creatorstr = StringUtil.toString(creators).split(",");
                    sb.append(" and vdp.CREATOR in " + SqlUtil.getSqlInParams(creators));
                    for (String each : creatorstr) {
                        list.add(each);
                    }
                }

                // 布控分局
                if (!StringUtil.isNull(deptCode)) {
                    sb.append(" and u.DEPT_CODE like ?");
                    list.add(deptCode + "%");
                }

                // 布控时间
                String surveillance_begin_time = StringUtil.toString(parameters.get("SURVEILLANCE_BEGIN_TIME"));
                if (!StringUtil.isNull(surveillance_begin_time)) {
                    sb.append(" and vdp.CREATE_TIME >= ?");
                    list.add(surveillance_begin_time);
                }

                String surveillance_end_time = StringUtil.toString(parameters.get("SURVEILLANCE_END_TIME"));
                if (!StringUtil.isNull(surveillance_end_time)) {
                    sb.append(" and vdp.CREATE_TIME <= ?");
                    list.add(surveillance_end_time);
                }
            } else {
                sb.append("where 1=1 ");
                sb.append(" and ((" + Permission.getCurNodeAlarmPrivSql(
                        StringUtil.toString(parameters.get("USER_CODE")), null, "vfa.ORG_CODE"));
                sb.append(" and vfa.TASK_LEVEL in (select ALARM_LEVEL from SYS_USERALARMLEVEL where USER_CODE = ?)");
                sb.append(" and vfa.DB_ID in (select d.DB_ID from VIID_DISPATCHED_DB"
                        + " d left join EFACE_DISPATCHED_PERSON_PERMISSION_REL rel on d.DB_ID ="
                        + " rel.DB_ID where d.IS_PUBLIC = 1 or rel.USER_CODE = ?))");
                sb.append(" or vfa.DB_ID in (select d.DB_ID from VIID_DISPATCHED_DB d where d.CREATOR = ?))");
                list.add(parameters.get("USER_CODE"));
                list.add(parameters.get("USER_CODE"));
                list.add(parameters.get("USER_CODE"));
            }
        } else {
            sb.append("where 1=1 ");
        }

        String isEscapeHit = StringUtil.toString(parameters.get("IS_ESCAPE_HIT"), "");
        if ("1".equals(isEscapeHit)) {// 全国在逃人员库比中
            sb.append(" and vfa.OBJECT_EXTEND_INFO like  '%\"ESCAPEE_FLAG\":1%' ");
        } else if ("0".equals(isEscapeHit)) {
            sb.append("and vfa.OBJECT_EXTEND_INFO not like  '%\"ESCAPEE_FLAG\":1%'");
        }
        sb.append(" and vfa.TASK_TYPE = ? ");
        int taskType = StringUtil.toInteger(parameters.get("TASK_TYPE"), Constants.TASK_FACE_ALARM);
        list.add(taskType);

        String searchType = StringUtil.toString(parameters.get("SEARCH_TYPE"));
        if (!StringUtil.isNull(searchType)) {
            sb.append(" and (vfa.DEAL_STATUS is null or (vfa.DEAL_STATUS <> ? and vfa.DEAL_STATUS <> ?)) ");
            list.add(Constants.DEAL_STATUS_DELETE);
            list.add(Constants.DEAL_STATUS_DELETE);
        }

        String dbIds = StringUtil.toString(parameters.get("DB_ID"));
        if (!StringUtil.isNull(dbIds)) {
            String sqlSta = SqlUtil.getSqlInParams(dbIds);
            sb.append(" and vfa.DB_ID in " + sqlSta);
            if (dbIds.indexOf(",") > 0) {
                for (String dbId : dbIds.split(",")) {
                    list.add(dbId);
                }
            } else {
                list.add(dbIds);
            }
        }

        if (StringUtil.isNull(confirmStatus)) {
            if (!StringUtil.isNull(beginTime) && !StringUtil.isNull(endTime)) {
                sb.append(" and vfa.ALARM_TIME between ? and ?");
                list.add(beginTime);
                list.add(endTime);
            } else if (!StringUtil.isNull(beginTime)) {
                sb.append(" and vfa.ALARM_TIME > ?");
                list.add(beginTime);
            } else if (!StringUtil.isNull(endTime)) {
                sb.append(" and vfa.ALARM_TIME < ?");
                list.add(endTime);
            }
        }

        String keywords = StringUtil.toString(parameters.get("KEYWORDS"));
        if (!StringUtil.isNull(keywords)) {
            sb.append(" and vfa.OBJECT_EXTEND_INFO like ? ");
            list.add("%" + keywords + "%");
        }

        // 设备ID
        String deviceIds = StringUtil.toString(parameters.get("DEVICE_IDS"));
        if (!StringUtil.isNull(deviceIds)) {
            String sqlSta = SqlUtil.getSqlInParams(deviceIds);
            sb.append(" and vfa.DEVICE_ID in " + sqlSta);
            if (deviceIds.indexOf(",") > 0) {
                for (String deviceId : deviceIds.split(",")) {
                    list.add(deviceId);
                }
            } else {
                list.add(deviceIds);
            }
        }

        // 场景ID
        String sceneId = StringUtil.toString(parameters.get("SCENE_ID"));
        if (!StringUtil.isEmpty(sceneId)) {
            sb.append(" and vfa.SCENE_ID = ? ");
            list.add(sceneId);
        }

        // OBJECT_ID,用于做一个人的告警频次分析
        String objectId = StringUtil.toString(parameters.get("OBJECT_ID"));
        if (!StringUtil.isEmpty(objectId)) {
            sb.append(" and vfa.OBJECT_ID = ? ");
            list.add(objectId);
        }

        // 相似度
        String threshold = StringUtil.toString(parameters.get("THRESHOLD"));
        if (!StringUtil.isNull(threshold)) {
            double score = Integer.parseInt(threshold);// / 100.0;
            sb.append(" and vfa.SCORE >= ?");
            list.add(score);
        }

        // 算法id
        String algorithm_id = StringUtil.toString(parameters.get("AlGORITHM_ID"));
        if (!StringUtil.isNull(algorithm_id)) {
            if ("90002".equals(algorithm_id)) {
                sb.append(" and OBJECT_EXTEND_INFO like ? ");
                list.add("%飞识比中%");
            }
        }

        String alarmType = StringUtil.toString(parameters.get("ALARM_TYPE"), "");
        if ("1".equals(alarmType)) {
            sb.append(" and OBJECT_EXTEND_INFO like ? ");
            list.add("%飞识比中%");
        } else if ("0".equals(alarmType)) {
            sb.append(" and OBJECT_EXTEND_INFO not like ? ");
            list.add("%飞识比中%");
        } else if ("2".equals(alarmType)) {
            sb.append(" and OBJECT_EXTEND_INFO like ? ");
            list.add("%三方接口比中%");
        }

        // 告警反馈 前端值： 0:未签收 1：已签收 2：未反馈 3：已反馈
        // 数据库:0:未签收 1：已签收 2：已反馈 9：已抓获
        String alarmHandle = StringUtil.toString(parameters.get("ALARM_HANDLE"));
        if (!StringUtil.isNull(alarmHandle)) {
            int iAlarmHandle = Integer.parseInt(alarmHandle);
            if (iAlarmHandle == Constants.ALARM_UNSIGN_FRONT_END) {// 0
                sb.append(" and (vfa.ALARM_HANDLE = ? or vfa.ALARM_HANDLE is null) and vfa.TASK_LEVEL <> ?");
                list.add(alarmHandle);
            } else if (iAlarmHandle == Constants.ALARM_SIGNED_FRONT_END) {// 1
                sb.append(" and vfa.ALARM_HANDLE >= ? and vfa.TASK_LEVEL <> ?");
                list.add(alarmHandle);
            } else if (iAlarmHandle == Constants.ALARM_UNHANDLE_FRONT_END) {// 2
                sb.append(" and vfa.ALARM_HANDLE = ? and vfa.TASK_LEVEL <> ?");
                list.add(Constants.ALARM_SIGNED);

            } else if (iAlarmHandle == Constants.ALARM_HANDLED_FRONT_END) {// 3
                sb.append(" and vfa.ALARM_HANDLE >= ? and vfa.TASK_LEVEL <> ?");
                list.add(Constants.ALARM_HANDLED);
            }
            list.add(Constants.ALARM_LEVEL_BLUE);// 蓝色告警不需签收反馈，过滤。
        }

        // 是否已抓获 0:否 1：是
        String isCatch = StringUtil.toString(parameters.get("IS_CATCH"));
        if (!StringUtil.isNull(isCatch)) {
            if (isCatch.equals("0")) {
                sb.append(" and vfa.ALARM_HANDLE <> ? ");
                list.add(Constants.ALARM_CATCHED);
            } else {
                sb.append(" and vfa.ALARM_HANDLE = ? ");
                list.add(Constants.ALARM_CATCHED);
            }
        }

        // 告警等级
        String alarmLevel = StringUtil.toString(parameters.get("ALARM_LEVEL"));
        if (!StringUtil.isNull(alarmLevel)) {
            sb.append(" and vfa.TASK_LEVEL in " + SqlUtil.getSqlInParams(alarmLevel));
            for (int i = 0; i < alarmLevel.split(",").length; i++) {
                list.add(alarmLevel.split(",")[i]);
            }
        }
        return jdbc.queryForObject(sb.toString(), Integer.class, list.toArray());
    }

    /**
     * 分区域统计告警
     *
     * @param orgCode
     * @param userCode
     * @return
     */
    public List<Map<String, Object>> getTotalAlarm(String orgCode, String userCode) {
        List<Object> params = new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT CASE WHEN tt.TASK_LEVEL=0 THEN 'RED' WHEN "
                + "tt.TASK_LEVEL=1 THEN 'ORANGE' WHEN tt.TASK_LEVEL=2 THEN 'YELLOW' WHEN tt.TASK_LEVEL=3 "
                + "THEN 'BLUE' ELSE 'OTHER' END AS ALARM_LEVEL, COUNT(tt.TASK_LEVEL) COUNT FROM ( SELECT * "
                + "FROM VPLUS_SURVEILLANCE_ALARM vfa WHERE vfa.DEVICE_ID LIKE ? and vfa.TASK_TYPE = ? ");
        params.add(orgCode + "%");
        params.add(Constants.TASK_FACE_ALARM);

        if (!"admin".equals(userCode)) {
            sql.append("AND (((vfa.ORG_CODE IN (SELECT ORG_CODE FROM SYS_USERALARM su WHERE su.IS_HALF = 0 AND su.USER_CODE = ?) "
                    + " OR vfa.DEVICE_ID IN (SELECT rel.DEVICE_ID FROM VPLUS_DEVICE_VIRTUAL_CATALOG_REL rel INNER JOIN SYS_USERALARM su  ON su.ORG_CODE = rel.ORG_CODE "
                    + " WHERE su.IS_HALF = 0  AND su.USER_CODE = ?) )  AND vfa.TASK_LEVEL IN  (SELECT ALARM_LEVEL FROM SYS_USERALARMLEVEL WHERE USER_CODE = ?) "
                    + " AND vfa.DB_ID IN  (SELECT d.DB_ID  FROM VIID_DISPATCHED_DB d  LEFT JOIN EFACE_DISPATCHED_PERSON_PERMISSION_REL rel "
                    + " ON d.DB_ID = rel.DB_ID WHERE d.IS_PUBLIC = 1  OR rel.USER_CODE = ?)) OR vfa.DB_ID IN (SELECT d.DB_ID  FROM VIID_DISPATCHED_DB d "
                    + " WHERE d.CREATOR = ?)) ");
            params.add(userCode);
            params.add(userCode);
            params.add(userCode);
            params.add(userCode);
            params.add(userCode);
        }
        sql.append(" ) tt GROUP BY tt.TASK_LEVEL");
        return jdbc.queryForList(sql.toString(), params.toArray());
    }
}
