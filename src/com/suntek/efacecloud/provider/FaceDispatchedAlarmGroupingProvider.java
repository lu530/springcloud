package com.suntek.efacecloud.provider;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.index.Query;
import com.suntek.eap.jdbc.IFieldRender;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.jdbc.dialect.Dialect;
import com.suntek.eap.jdbc.dialect.DialectFactory;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.org.UserModel;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.smp.Permission;
import com.suntek.eap.tag.grid.ExportGridDataProvider;
import com.suntek.eap.util.SqlUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.util.calendar.DateUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.AlarmHandleRecordDao;
import com.suntek.efacecloud.dao.FaceDispatchedAlarmDao;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.util.*;
import net.sf.json.JSONArray;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 人脸布控库告警查询（去重）
 * 
 * @author wdp
 * @since 3.0
 * @version 2018年4月10日
 */
@LocalComponent(id = "face/dispatchedAlarm/grouping")
public class FaceDispatchedAlarmGroupingProvider extends ExportGridDataProvider {
	private Dialect dialect = DialectFactory.getDialect(Constants.APP_NAME, "");
	// 人员布控精细化配置配置 0不开启 1开启
	private String IS_PERSONEL_CONTROL_ELABORATION = AppHandle.getHandle(Constants.APP_NAME)
			.getProperty("IS_PERSONEL_CONTROL_ELABORATION", "0");
	private FaceDispatchedAlarmDao dao = new FaceDispatchedAlarmDao();

	private AlarmHandleRecordDao alarmHandleRecordDao = new AlarmHandleRecordDao();
	
	/**
	 * 
	 */
	@Override
	protected String buildCountSQL() {
		String sql = "select count(1) from " + this.getOptionalStatement();
		return sql;
	}

	/**
	 * 
	 */
	@Override
	protected String buildQuerySQL() {
		String sql = "select vfa.ALARM_ID, vfa.OBJECT_ID, " + dialect.datetochar("vfa.ALARM_TIME", 4)
				+ " as ALARM_TIME, vfa.OBJECT_EXTEND_INFO, "
				+ "vfa.TASK_LEVEL ALARM_LEVEL, vfa.ALARM_IMG, vfa.DEVICE_ID ORIGINAL_DEVICE_ID, vfa.DB_ID, vfa.DB_NAME, vfa.FRAME_IMG, "
				+ "vfa.OBJECT_PICTURE TEMPLET_IMG, vfa.SCORE, " + dialect.datetochar("vfa.CAPTURE_TIME", 4)
				+ "as CAPTURE_TIME, vfa.CONFIRM_STATUS, b.REPEATS from " + this.getOptionalStatement();
		return sql;
	}

	@Override
	protected void prepare(RequestContext context) {
		if ("1".equals(IS_PERSONEL_CONTROL_ELABORATION)) {
			this.prepareElaboration(context);
		} else {
			this.prepareBaseLine(context);
		}
	}

	private void prepareBaseLine(RequestContext context) {
		String isHistory = StringUtil.toString(context.getParameter("isHistory"));
		String fromTable = "VPLUS_SURVEILLANCE_ALARM";
		if ("1".equals(isHistory)) {
			fromTable = "VPLUS_SURVEILLANCE_ALARM_HIS";
		}
		this.addOptionalStatement(fromTable + " vfa ");
		
		// 通过双层group by，根据OBJECT_ID实现按照布控人员将告警分组的目的
		// 第一层group by
		// 将告警根据OBJECT_ID计算出每个布控人员的出现次数及最近出现时间（因为告警时间可能重复，故需要做第二次group by）
		// 第一层group by 将告警根据OBJECT_ID与告警时间计算出每个布控人员的出现次数及告警id
		this.addOptionalStatement(" INNER join (" + "select vfa.OBJECT_ID, MAX( ALARM_ID) AS ALARM_ID, t.REPEATS  from "
				+ fromTable + " vfa " + "INNER JOIN (SELECT OBJECT_ID, count(1) REPEATS,max(ALARM_TIME) ALARM_TIME_NEW from " + fromTable + " vfa ");
		
		this.addOptionalStatement("where 1 = 1 ");
		addSql(context);
		this.addOptionalStatement(" group by OBJECT_ID " + ")  "
				+ "AS t ON t.OBJECT_ID = vfa.OBJECT_ID AND t.ALARM_TIME_NEW = vfa.ALARM_TIME " + "where 1 = 1 ");
		addSql(context);
		this.addOptionalStatement(" GROUP BY vfa.OBJECT_ID" + ") b ON vfa.ALARM_ID = b.ALARM_ID "
				+ " left join VIID_DISPATCHED_DB d on d.DB_ID = vfa.DB_ID ");
		this.addOptionalStatement(" LEFT JOIN VIID_DISPATCHED_PERSON vdp ON vfa.OBJECT_ID = vdp.FACE_ID ");
		this.addOptionalStatement(" where 1=1 ");
		
		// 排序
		String repeats = StringUtil.toString(context.getParameter("REPEATS"));
		if (!StringUtil.isNull(repeats)) {
			this.addOptionalStatement(" and b.REPEATS = ? ");
			this.addParameter(repeats);
		}
		this.addFieldRender(new AlarmFiledRender(),
				new String[] { "ALARM_IMG", "TEMPLET_IMG", "SCORE", "SEX", "FRAME_IMG", "CONFIRM_STATUS" });
	}

	/**
	 * 精细化控制
	 * 
	 * @param context
	 */
	private void prepareElaboration(RequestContext context) {
		String isHistory = StringUtil.toString(context.getParameter("isHistory"));
		String fromTable = "VPLUS_SURVEILLANCE_ALARM";
		if ("1".equals(isHistory)) {
			fromTable = "VPLUS_SURVEILLANCE_ALARM_HIS";
		}

		// 通过双层group by，根据OBJECT_ID实现按照布控人员将告警分组的目的
		// 第一层group by
		// 将告警根据OBJECT_ID计算出每个布控人员的出现次数及最近出现时间（因为告警时间可能重复，故需要做第二次group by）
		// 第一层group by 将告警根据OBJECT_ID与告警时间计算出每个布控人员的出现次数及告警id
		this.addOptionalStatement(fromTable + " vfa INNER join ("
				+ " select vfa.OBJECT_ID, MAX( ALARM_ID) AS ALARM_ID, t.REPEATS  from " + fromTable + " vfa "
				+ " INNER JOIN (SELECT OBJECT_ID, count( 1) REPEATS,max( ALARM_TIME) ALARM_TIME_NEW from " + fromTable
				+ " vfa where 1 = 1 ");
		addSql(context);
		this.addOptionalStatement(" group by OBJECT_ID " + ") "
				+ "AS t ON t.OBJECT_ID = vfa.OBJECT_ID AND t.ALARM_TIME_NEW = vfa.ALARM_TIME " + "where 1 = 1 ");
		addSql(context);
		this.addOptionalStatement(" GROUP BY vfa.OBJECT_ID" + ") b ON vfa.ALARM_ID = b.ALARM_ID " + "left join "
				+ "VIID_DISPATCHED_DB d on d.DB_ID = vfa.DB_ID "
				+ " join  VIID_DISPATCHED_PERSON  vdp on vfa.OBJECT_ID = vdp.FACE_ID "
				+ " join SYS_USER u on vdp.CREATOR = u.USER_CODE "
				+ " left join EFACE_DISPATCHED_PERSON edp on edp.PERSON_ID = vdp.PERSON_ID");
		this.addOptionalStatement(" where 1=1 ");
		if (!context.getUser().isAdministrator()) {
			/*
			 * 精细化控制，通过权限管理配置可见信息（前提：用户具有告警查询-人脸告警权限）
			 * 全国在逃类（公共库）/需抓捕类：创建布控人+查看和告警权限设置 +（设备所属辖区）对应上级分局管理员市局管理员也可以接收 + 设备所属辖区内民警帐号
			 * 管控/关注类，				  创建布控人+查看和告警权限设置 +（设备所属辖区）对应上级分局管理员市局管理员也可以接收
			 */
            this.addOptionalStatement("AND ("
					// 用户具有告警查询-人脸告警权限
					+ "(EXISTS (SELECT 1 FROM SYS_USERFUNC uf,SYS_FUNLIST f WHERE uf.USER_CODE=? AND uf.ORG_CODE=f.FUNID AND f.MENUID=?))"
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
            this.addParameter(context.getUserCode());
            this.addParameter(Constants.DEFENCE_FACEALARM);
			this.addParameter(context.getUserCode());
			this.addParameter(Constants.DISPATCHED_PERSON_PERMISSION_MENUID);
			this.addParameter(context.getUser().getDept().getCivilCode() + "%");
			this.addParameter(context.getUser().getDept().getCivilCode());
			this.addParameter(context.getUserCode());
			this.addParameter(context.getUserCode());
			
			this.addParameter(context.getUserCode());
			this.addParameter(Constants.DISPATCHED_PERSON_PERMISSION_MENUID);
            this.addParameter(context.getUser().getDept().getCivilCode() + "%");
            this.addParameter(context.getUserCode());
            this.addParameter(context.getUserCode());
        } else {
			UserModel userModel = context.getUser();
			this.addOptionalStatement(" and ((" + Permission.getCurNodeAlarmPrivSql(userModel.getCode(), null, "vfa.ORG_CODE"));
			this.addOptionalStatement(" and vfa.TASK_LEVEL in " + "(select ALARM_LEVEL from SYS_USERALARMLEVEL where USER_CODE = ?)");
			this.addOptionalStatement(" and vfa.DB_ID in " + "(select d.DB_ID from VIID_DISPATCHED_DB d left join "
					+ "EFACE_DISPATCHED_PERSON_PERMISSION_REL rel on d.DB_ID = rel.DB_ID "
					+ " where d.IS_PUBLIC = 1 or  rel.USER_CODE = ?))");
			this.addOptionalStatement(" or vfa.DB_ID in (select d.DB_ID from " + "VIID_DISPATCHED_DB d where d.CREATOR = ?))");
			this.addParameter(context.getUserCode());
			this.addParameter(context.getUserCode());
			this.addParameter(context.getUserCode());
		}
		
		// 排序
		String repeats = StringUtil.toString(context.getParameter("REPEATS"));
		if (!StringUtil.isNull(repeats)) {
			this.addOptionalStatement(" and b.REPEATS = ?");
			this.addParameter(repeats);
		}
		this.addFieldRender(new AlarmFiledRender(),
				new String[] { "ALARM_IMG", "TEMPLET_IMG", "SCORE", "SEX", "FRAME_IMG", "CONFIRM_STATUS" });
		// 布控人
		String creators = (String) context.getParameter("CREATOR");
		if (!StringUtil.isNull(creators)) {
			String[] creatorstr = StringUtil.toString(creators).split(",");
			this.addOptionalStatement(" and vdp.CREATOR in " + SqlUtil.getSqlInParams(creators));
			for (String each : creatorstr) {
				this.addParameter(each);
			}
		}
		// 布控分局
		String deptCode = (String) context.getParameter("ORG_CODE");
		if (!StringUtil.isNull(deptCode)) {
			this.addOptionalStatement(" and u.DEPT_CODE like ?");
			this.addParameter(deptCode + "%");
		}
		// 布控时间
		String surveillance_begin_time = (String) context.getParameter("SURVEILLANCE_BEGIN_TIME");
		if (!StringUtil.isNull(surveillance_begin_time)) {
			this.addOptionalStatement(" and vdp.CREATE_TIME >= ?");
			this.addParameter(surveillance_begin_time);
		}
		String surveillance_end_time = (String) context.getParameter("SURVEILLANCE_END_TIME");
		if (!StringUtil.isNull(surveillance_end_time)) {
			this.addOptionalStatement(" and vdp.CREATE_TIME <= ?");
			this.addParameter(surveillance_end_time);
		}
	}

	/**
	 * 
	 * @param context
	 */
	private void addSql(RequestContext context) {
		String isEscapeHit = StringUtil.toString(context.getParameter("IS_ESCAPE_HIT"), "");
		String isEscapeHitCondition = "";
		if ("1".equals(isEscapeHit)) {// 全国在逃人员库比中
			isEscapeHitCondition = " and vfa.OBJECT_EXTEND_INFO like  '%\"ESCAPEE_FLAG\":1%' ";
		} else if ("0".equals(isEscapeHit)) {
			isEscapeHitCondition = "and vfa.OBJECT_EXTEND_INFO not like  '%\"ESCAPEE_FLAG\":1%'";
		}
		this.addOptionalStatement(isEscapeHitCondition);
		// 默认人脸告警
		int taskType = StringUtil.toInteger(context.getParameter("TASK_TYPE"), Constants.TASK_FACE_ALARM);
		this.addOptionalStatement(" and vfa.TASK_TYPE = ? ");
		this.addParameter(taskType);
		String searchType = StringUtil.toString(context.getParameter("SEARCH_TYPE"));
		if (!StringUtil.isNull(searchType)) {
			this.addOptionalStatement(
					" and (vfa.DEAL_STATUS is null or (vfa.DEAL_STATUS <> ? and vfa.DEAL_STATUS <> ?)) ");
			this.addParameter(Constants.DEAL_STATUS_CONFIRM);
			this.addParameter(Constants.DEAL_STATUS_DELETE);
		}
		String dbIds = StringUtil.toString(context.getParameter("DB_ID"));
		if (!StringUtil.isNull(dbIds)) {
			String sqlSta = SqlUtil.getSqlInParams(dbIds);
			this.addOptionalStatement(" and vfa.DB_ID in " + sqlSta);
			if (dbIds.indexOf(",") > 0) {
				for (String dbId : dbIds.split(",")) {
					this.addParameter(dbId);
				}
			} else {
				this.addParameter(dbIds);
			}
		}
		/***/
		// 是否告警确认 0:否， 1：是，2：未确认，3：已确认
        String confirmStatus = StringUtil.toString(context.getParameter("CONFIRM_STATUS"));
        if (!StringUtil.isNull(confirmStatus)) {
        	if(Constants.CONFIRM_STATUS_TREATED.equals(confirmStatus)){
        		//已确认3
        		this.addOptionalStatement(" and vfa.CONFIRM_STATUS is not null ");
        	}else if(Constants.CONFIRM_STATUS_UNTREATED.equals(confirmStatus)){
				//未确认2
        		this.addOptionalStatement(" and vfa.CONFIRM_STATUS is null ");
			}else if(Constants.CONFIRM_STATUS_NOCONFIRM.equals(confirmStatus) || Constants.CONFIRM_STATUS_CORRECT.equals(confirmStatus)){
				//准确1、不准确0
				 this.addOptionalStatement(" and vfa.CONFIRM_STATUS = ? ");
		            this.addParameter(confirmStatus);
			}
        }
		
		String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
		String endTime = StringUtil.toString(context.getParameter("END_TIME"));
		if (!StringUtil.isNull(beginTime) && !StringUtil.isNull(endTime)) {
			this.addOptionalStatement(" and vfa.ALARM_TIME between ? and ?");
			this.addParameter(beginTime);
			this.addParameter(endTime);
		} else if (!StringUtil.isNull(beginTime)) {
			this.addOptionalStatement(" and vfa.ALARM_TIME > ?");
			this.addParameter(beginTime);
		} else if (!StringUtil.isNull(endTime)) {
			this.addOptionalStatement(" and vfa.ALARM_TIME < ?");
			this.addParameter(endTime);
		}
		String keywords = StringUtil.toString(context.getParameter("KEYWORDS"));
		if (!StringUtil.isNull(keywords)) {
			if ("1".equals(MaskIdentityAndNameUtil.IS_MASK_IDENTITY_AND_NAME)) {
				Map<String, String> query = MaskIdentityAndNameUtil.renderQueryParam(keywords);
				this.addOptionalStatement(" and ( vfa.OBJECT_EXTEND_INFO like ? OR vfa.OBJECT_EXTEND_INFO like ?) ");
				this.addParameter("%" + query.get("IDENTITY_ID") + "%");
				this.addParameter("%" + query.get("NAME") + "%");
			} else {
				this.addOptionalStatement(" and vfa.OBJECT_EXTEND_INFO like ? ");
				this.addParameter("%" + keywords + "%");
			}
		}
		// 设备ID
		String deviceIds = StringUtil.toString(context.getParameter("DEVICE_IDS"));
		if (!StringUtil.isNull(deviceIds)) {
			String sqlSta = SqlUtil.getSqlInParams(deviceIds);
			this.addOptionalStatement(" and vfa.DEVICE_ID in " + sqlSta);
			if (deviceIds.indexOf(",") > 0) {
				for (String deviceId : deviceIds.split(",")) {
					this.addParameter(deviceId);
				}
			} else {
				this.addParameter(deviceIds);
			}
		}
		if (!"admin".equals(context.getUserCode()) && !"1".equals(IS_PERSONEL_CONTROL_ELABORATION)) {
			UserModel userModel = context.getUser();
			this.addOptionalStatement(" and ((" + Permission.getCurNodeAlarmPrivSql(userModel.getCode(), null, "vfa.ORG_CODE"));
			this.addOptionalStatement(" and vfa.TASK_LEVEL in " + "(select ALARM_LEVEL from SYS_USERALARMLEVEL where USER_CODE = ?)");
			this.addOptionalStatement(" and vfa.DB_ID in " + "(select d.DB_ID from VIID_DISPATCHED_DB d left join "
					+ "EFACE_DISPATCHED_PERSON_PERMISSION_REL rel on d.DB_ID = rel.DB_ID "
					+ "where d.IS_PUBLIC = 1 or rel.USER_CODE = ?))");
			this.addOptionalStatement(" or vfa.DB_ID in (select d.DB_ID from " + "VIID_DISPATCHED_DB d where d.CREATOR = ?))");
			this.addParameter(context.getUserCode());
			this.addParameter(context.getUserCode());
			this.addParameter(context.getUserCode());
		}
		// 场景ID
		String sceneId = StringUtil.toString(context.getParameter("SCENE_ID"));
		if (!StringUtil.isEmpty(sceneId)) {
			this.addOptionalStatement(" and vfa.SCENE_ID = ? ");
			this.addParameter(sceneId);
		}
		// OBJECT_ID,用于做一个人的告警频次分析
		String objectId = StringUtil.toString(context.getParameter("OBJECT_ID"));
		if (!StringUtil.isEmpty(objectId)) {
			this.addOptionalStatement(" and vfa.OBJECT_ID = ? ");
			this.addParameter(objectId);
		}
		// 相似度
		String threshold = StringUtil.toString(context.getParameter("THRESHOLD"));
		if (!StringUtil.isNull(threshold)) {
			double score = Integer.parseInt(threshold);
			this.addOptionalStatement(" and vfa.SCORE >= ?");
			this.addParameter(score);
		}
		// 算法id
		String algorithmId = StringUtil.toString(context.getParameter("AlGORITHM_ID"));
		if (!StringUtil.isNull(algorithmId)) {
			if ("90002".equals(algorithmId)) {
				this.addOptionalStatement(" and vfa.OBJECT_EXTEND_INFO like ? ");
				this.addParameter("%飞识比中%");
			}
		}
		String alarmType = StringUtil.toString(context.getParameter("ALARM_TYPE"), "");
		if ("1".equals(alarmType)) {
			this.addOptionalStatement(" and vfa.OBJECT_EXTEND_INFO like ? ");
			this.addParameter("%飞识比中%");
		} else if ("0".equals(alarmType)) {
			this.addOptionalStatement(" and vfa.OBJECT_EXTEND_INFO not like ? ");
			this.addParameter("%飞识比中%");
		} else if ("2".equals(alarmType)) {
			this.addOptionalStatement(" and vfa.OBJECT_EXTEND_INFO like ? ");
			this.addParameter("%三方接口比中%");
		}
		// 证件比中
		String checkIdentityMsg = StringUtil.toString(context.getParameter("CHECK_IDENTITY_MSG"), "");
		if ("1".equals(checkIdentityMsg)) {
			this.addOptionalStatement(" and vfa.OBJECT_EXTEND_INFO like ? ");
			this.addParameter("%证件比中%"); // 证件
		} else if ("0".equals(checkIdentityMsg)) {
			this.addOptionalStatement(" and vfa.OBJECT_EXTEND_INFO not like ? ");
			this.addParameter("%证件比中%"); // 人脸
		}
		// 排序
		String sort = StringUtil.toString(context.getParameter("SORT"));
		if ("1".equals(sort)) {
			context.putParameter("sort", "SCORE desc");
		} else {
			context.putParameter("sort", "ALARM_TIME desc");
		}
		// 告警反馈 前端值： 0:未签收 1：已签收 2：未反馈 3：已反馈
		// 数据库:0:未签收 1：已签收 2：已反馈 9：已抓获
		String alarmHandle = StringUtil.toString(context.getParameter("ALARM_HANDLE"));
		if (!StringUtil.isNull(alarmHandle)) {
			int iAlarmHandle = Integer.parseInt(alarmHandle);
			if (iAlarmHandle == Constants.ALARM_UNSIGN_FRONT_END) {// 0
				this.addOptionalStatement(" and (vfa.ALARM_HANDLE = ? or vfa.ALARM_HANDLE is null) and vfa.TASK_LEVEL <> ? ");
				this.addParameter(alarmHandle);
			} else if (iAlarmHandle == Constants.ALARM_SIGNED_FRONT_END) {// 1
				this.addOptionalStatement(" and vfa.ALARM_HANDLE >= ? and vfa.TASK_LEVEL <> ?");
				this.addParameter(alarmHandle);
			} else if (iAlarmHandle == Constants.ALARM_UNHANDLE_FRONT_END) {// 2
				this.addOptionalStatement(" and vfa.ALARM_HANDLE = ? and vfa.TASK_LEVEL <> ?");
				this.addParameter(Constants.ALARM_SIGNED);
			} else if (iAlarmHandle == Constants.ALARM_HANDLED_FRONT_END) {// 3
				this.addOptionalStatement(" and vfa.ALARM_HANDLE >= ? and vfa.TASK_LEVEL <> ?");
				this.addParameter(Constants.ALARM_HANDLED);
			}
			// 蓝色告警不需签收反馈，过滤。
			this.addParameter(Constants.ALARM_LEVEL_BLUE);
		}
		// 是否已抓获 0:否 1：是
		String isCatch = StringUtil.toString(context.getParameter("IS_CATCH"));
		if (!StringUtil.isNull(isCatch)) {
			if (isCatch.equals("0")) {
				this.addOptionalStatement(" and vfa.ALARM_HANDLE <> ? ");
				this.addParameter(Constants.ALARM_CATCHED);
			} else {
				this.addOptionalStatement(" and vfa.ALARM_HANDLE = ? ");
				this.addParameter(Constants.ALARM_CATCHED);
			}
		}
		
		// 告警等级
		String alarmLevel = StringUtil.toString(context.getParameter("ALARM_LEVEL"));
		if (!StringUtil.isNull(alarmLevel)) {
			this.addOptionalStatement(" and vfa.TASK_LEVEL in " + SqlUtil.getSqlInParams(alarmLevel));
			for (int i = 0; i < alarmLevel.split(",").length; i++) {
				addParameter(alarmLevel.split(",")[i]);
			}
		}
        // 外籍人多算法告警
        String mulitAlgoType = StringUtil.toString(context.getParameter("MULIT_ALGO_TYPE"));
        if (!StringUtil.isNull(mulitAlgoType)) {
            String[] mulitAlgoTypes = mulitAlgoType.split(",");
            this.addOptionalStatement(" and vfa.OBJECT_EXTEND_INFO  REGEXP '");
            for (int i = 0; i < mulitAlgoTypes.length; i++) {
                if (i == mulitAlgoTypes.length - 1) {
                    this.addOptionalStatement(mulitAlgoTypes[i] + "'");
                } else {
                    this.addOptionalStatement(mulitAlgoTypes[i] + "|");
                }
            }
        }
    }

	/**
	 * 
	 * @author Andrew
	 *
	 */
	class AlarmFiledRender implements IFieldRender {
		@Override
		public Object render(String fieldName, ResultSet resultSet) throws SQLException {
			try {
				if ("ALARM_IMG".equals(fieldName) || "TEMPLET_IMG".equals(fieldName) || "FRAME_IMG".equals(fieldName)) {
					String alarmImg = resultSet.getString(fieldName);
					//return ModuleUtil.renderImage(alarmImg);
					return ModuleUtil.renderImage(alarmImg);
				}
				if ("SCORE".equals(fieldName)) {
					double score = resultSet.getDouble(fieldName);
					ServiceLog.info("SCORE : " + score);
					BigDecimal b = new BigDecimal(score);
					return b.setScale(2, BigDecimal.ROUND_HALF_UP).intValue();
				}
				if ("CONFIRM_STATUS".equals(fieldName)) {
					return CommonUtil.getAlarmConfirmStatus(resultSet.getString(fieldName));
				}
			} catch (Exception e) {
				ServiceLog.error("转换操作类型异常", e);
			}
			return "";
		}
	}

	/**
	 * 
	 * @param context
	 * @return
	 */
	@BeanService(id = "getData", type = "remote", description = "告警记录查询", paasService = "true")
	public Map<String, Object> query(RequestContext context) {
		Map<String, Object> resultMap = new HashMap<>();
		PageQueryResult result = super.getData(context);
		context.putParameter("USER_CODE", context.getUserCode());
		context.putParameter("DEPT_CODE", context.getDeptCode());
		try {
			List<Map<String, Object>> resultSet = result.getResultSet();
			for (Map<String, Object> map : resultSet) {
				String deviceId = StringUtil.toString(map.get("ORIGINAL_DEVICE_ID"));
				DeviceEntity faceDevice = (DeviceEntity) EAP.metadata.getDictModel(DictType.D_FACE, deviceId,
						DeviceEntity.class);
				map.put("DEVICE_NAME", faceDevice.getDeviceName());
				map.put("DEVICE_ADDR", faceDevice.getDeviceAddr());
				map.put("LONGITUDE", faceDevice.getDeviceX());
				map.put("LATITUDE", faceDevice.getDeviceY());
				String extendInfo = StringUtil.toString(map.get("OBJECT_EXTEND_INFO"));
				if (!StringUtil.isEmpty(extendInfo)) {
					JSONObject json = JSONObject.parseObject(extendInfo);
					String sexCode = "";
					String personName = "";
					String identityId = "";
					String fsName = "";
					String fsPic = "";
					String fsWjr = "";
					String fsIdentityId = "";
					String fsHitTime = "";
					String isCover = "";
					String infoId = "";
					//第三方接口比中算法
					String thirdImplName = "";
					String thirdImplHit = "";
					try {
						sexCode = json.getString("SEX");
						personName = json.getString("NAME");
						identityId = json.getString("IDENTITY_ID");
						if (json.containsKey("IS_COVER")) {
							isCover = json.getString("IS_COVER");
						}
						if (json.containsKey("INFO_ID")) {
							infoId = json.getString("INFO_ID");
						}
						// 获取比对结果
						if (json.containsKey("MUTIL_ALGO_CHECK")) {
							JSONObject algoCheck = json.getJSONObject("MUTIL_ALGO_CHECK");
							JSONObject object = algoCheck.getJSONObject(Constants.ALGO_TYPE_FEISHI);
							if (null != object) {
								fsName = StringUtil.toString(object.getString("FS_NAME"));
								fsPic = ModuleUtil.renderImage(StringUtil.toString(object.getString("FS_PIC")));
								fsIdentityId = StringUtil.toString(object.getString("FS_IDENTITY_ID"));
								fsHitTime = StringUtil.toString(object.getString("FS_HIT_TIME"));
								fsWjr = StringUtil.toString(object.getString("FS_WJR"));
							}
						}
						thirdImplName = json.getString("THIRDIMPL_NAME");
						thirdImplHit = json.getString("THIRDIMPL_HIT");
					} catch (Exception e) {
						ServiceLog.error("转换extendInfo异常", e);
					}

					if ("1".equals(sexCode)) {
						sexCode = "男";
					} else if ("2".equals(sexCode)) {
						sexCode = "女";
					} else {
						sexCode = "未知";
					}
					try {
						List<Map<String, Object>> list = dao.queryActivityInfo(infoId);
						for (Map<String, Object> actMap : list) {
							map.putAll(actMap);
						}
					} catch (Exception e) {
						ServiceLog.error("不存在表activity_info", e);
					}
					String isFacemore = AppHandle.getHandle(Constants.APP_EFACESURVEILLANCE).getProperty("IS_FACEMORE",
							"0");
					if (!"0".equalsIgnoreCase(isFacemore)) {
						map.put("IS_COVER", CommonUtil.getMutilFaceAlarmType(isCover));
					} else {
						map.remove("IS_COVER");
						//map.remove("CONFIRM_STATUS");
					}
					map.put("PERSON_NAME", personName);
					map.put("IDENTITY_ID", identityId);
					map.put("SEX", sexCode);
					map.put("FS_PIC", fsPic);
					map.put("FS_NAME", fsName);
					map.put("FS_IDENTITY_ID", fsIdentityId);
					map.put("FS_HIT_TIME", fsHitTime);
					map.put("FACE_SCORE", getFaceScore(infoId, context));
					// 外籍人比中
					map.put("FS_WJR", fsWjr);
					// 第三方算法比中
					map.put("THIRDIMPL_NAME", thirdImplName);
					map.put("THIRDIMPL_HIT", thirdImplHit);
					if (!StringUtil.isEmpty(fsPic)) {
					    // 是否飞识比中
						map.put("FS_HIT", "1");
					} else {
						map.put("FS_HIT", "0");
					}
					// 返回给前端对加密信息用* 代替
					if ("1".equals(MaskIdentityAndNameUtil.IS_MASK_IDENTITY_AND_NAME)) {
						if (identityId.length() > 10) {
							map.put("IDENTITY_ID", identityId.substring(0, 10) + "********");
						}
						if (personName.length() > 1) {
							map.put("PERSON_NAME", personName.substring(0, 1) + "**");
						}
					}
					long startTime = System.currentTimeMillis();
					// 获取人脸告警详情查询最近某个人告警列表的派出所信息的时间间隔，单位（天）0禁用
					String timeInterval = AppHandle.getHandle(Constants.APP_NAME)
							.getProperty("RELATIVE_POLICESTATION_INFO_INTERVAL", "0");
					// 扩展字段json加入police_station_info的json信息
					JSONObject policeStationJson = new JSONObject();
					json.put("POLICE_STATION_INFO", policeStationJson);
					// 时间间隔为0，就不显示（IS_SHOW为0）；相反则为1
					if (timeInterval.equals("0")) {
						policeStationJson.put("IS_SHOW", "0");
					} else {
						policeStationJson.put("IS_SHOW", "1");
						// 获取告警设备关联派出所信息
						List<Map<String, Object>> policeStationList = dao.getRelativePoliceStaion1Info(deviceId);
						if (policeStationList == null || policeStationList.isEmpty()) {
							policeStationList = dao.getRelativePoliceStaion2Info(deviceId);
						}
						if (policeStationList != null && !policeStationList.isEmpty()) {
							Map<String, Object> tempMap = policeStationList.get(0);
							// 组装派出所信息json
							policeStationJson.put("DEPT_NAME", StringUtil.toString(tempMap.get("DEPT_NAME")));
						}
					}
					// 更新OBJECT_EXTEND_INFO字段信息，加入相关派出所信息
					map.put("OBJECT_EXTEND_INFO", JSON.toJSONString(json));
					
					map.put("IS_SIGN", alarmHandleRecordDao.isAlarmSignIn(StringUtil.toString(map.get("ALARM_ID")))==true?"1":"0");
					
					long endTime = System.currentTimeMillis();
					float excTime = (float) (endTime - startTime) / 1000;
					ServiceLog.debug("获取当前派出所方法的执行时间:" + excTime);
				}
			}
		} catch (Exception e) {
			ServiceLog.error("获取告警设备信息异常" + e.getMessage());
		}
		context.putParameter("CIVIL_CODE", context.getUser().getDept().getCivilCode());
		int total = dao.countAlarm(context.getParameters());
		resultMap.put("TOTAL", total);
		resultMap.putAll(result.toMap());
		return resultMap;
	}

	private String getFaceScore(String infoId, RequestContext context) {
		if (StringUtil.isEmpty(infoId)) {
			return "";
		}
		String faceScore = "";
		String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
		String endTime = StringUtil.toString(context.getParameter("END_TIME"));
		String[] indices = ESUtil.getIndicesNameByBeginAndEndTime(Constants.FACE_INDEX, beginTime, endTime);
		try {
			Query query = new Query(1, 1);
			query.addEqualCriteria("INFO_ID", infoId);
			PageQueryResult pageResult = EAP.bigdata.query(indices, Constants.FACE_TABLE, query);
			if (!pageResult.getResultSet().isEmpty()) {
				faceScore = StringUtil.toString(pageResult.getResultSet().get(0).get("FACE_SCORE"));
			}
		} catch (Exception e) {
		}
		return faceScore;
	}

	/**
	 * 
	 * @param context
	 * @throws Exception
	 */
	@SuppressWarnings({ "unchecked", "serial" })
	@BeanService(id = "exportAlarm", description = "导出告警记录")
	public void exportAlarm(RequestContext context) throws Exception {
		List<Map<String, Object>> excelDataList = new ArrayList<Map<String, Object>>();
		List<Map<String, byte[]>> imgList = new ArrayList<>();
		String[] headers = null;
		String[] dataKey = null;
		String algorithmId = StringUtil.toString(context.getParameter("AlGORITHM_ID"));
		String alarmType = StringUtil.toString(context.getParameter("ALARM_TYPE"), "");
		String imgFieldName = "FRAME_IMG";
		if ("90002".equals(algorithmId) || "1".equals(alarmType)) {
			imgFieldName = "FS_PIC";
			headers = new String[] { "抓拍图片", "布控图片", "飞识比中人脸", "相似度", "告警地点", "告警时间", "姓名", "性别", "证件号码", "布控库", "比中姓名",
				"比中证件", "比中时间" };
			dataKey = new String[] { "alarmImgUrl", "templetImgUrl", "frameImgUrl", "SCORE", "DEVICE_ADDR",
				"ALARM_TIME", "PERSON_NAME", "SEX", "IDENTITY_ID", "DB_NAME", "FS_NAME", "FS_IDENTITY_ID",
				"FS_HIT_TIME" };
		} else {
			headers = new String[] { "抓拍图片", "布控图片", "全景图片", "相似度", "告警地点", "告警时间", "姓名", "性别", "证件号码", "布控库" };
			dataKey = new String[] { "alarmImgUrl", "templetImgUrl", "frameImgUrl", "SCORE", "DEVICE_ADDR",
				"ALARM_TIME", "PERSON_NAME", "SEX", "IDENTITY_ID", "DB_NAME" };
		}
		String exportData = StringUtil.toString(context.getParameter("EXPORT_DATA"));
		if (!StringUtil.isNull(exportData)) {
			// 导出勾选的数据
			excelDataList = JSONArray.fromObject(exportData);
		} else {
			context.putParameter("pageNo", "1");
			context.putParameter("pageSize", Constants.EXPORT_MAX_COUNT);
			excelDataList = (List<Map<String, Object>>) this.query(context).get("records");
		}
		try {
			for (Map<String, Object> map : excelDataList) {
				byte[] alarmImgUrl = FileDowloader.getImageFromUrl(StringUtil.toString(map.get("ALARM_IMG")));
				byte[] templetImgUrl = FileDowloader.getImageFromUrl(StringUtil.toString(map.get("TEMPLET_IMG")));
				byte[] frameImgUrl = FileDowloader.getImageFromUrl(StringUtil.toString(map.get(imgFieldName)));
				// 图片
				imgList.add(new HashMap<String, byte[]>() {
					{
						put("alarmImgUrl", alarmImgUrl);
						put("templetImgUrl", templetImgUrl);
						put("frameImgUrl", frameImgUrl);
					}
				});
				String score = StringUtil.toString(Float.parseFloat(StringUtil.toString(map.get("SCORE")))).substring(0, 2) + "%";
				map.put("SCORE", score);
			}
		} catch (Exception e) {
			ServiceLog.error("导出异常：", e);
			throw e;
		}
		boolean isExport = ExcelFileUtil.exportExcelFile2Req(
				"告警记录导出" + DateUtil.formatDate(DateUtil.getDateTime(), "yyyyMMddHHmmss"), headers, dataKey,
				excelDataList, imgList, context);
		if (isExport) {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "导出成功！");
		} else {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "导出失败！");
		}
	}

	private boolean isBlackProject() {
		String isblack = AppHandle.getHandle(Constants.DATA_DEFENCE).getProperty("IS_BLACK");
		return Constants.IS_BLACK.equals(isblack);
	}
}

