package com.suntek.efacecloud.provider;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.jdbc.IFieldRender;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.jdbc.dialect.Dialect;
import com.suntek.eap.jdbc.dialect.DialectFactory;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.tag.grid.GridDataProvider;
import com.suntek.eap.util.SqlUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceDispatchedAlarmDao;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.util.CommonUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;

/**
 * 成效统计墙
 * 
 * efacecloud/rest/v6/face/dispatchedAlarmPermanent
 * 
 * @author yangkang
 * @version 2018-08-07
 * @Copyright (C)2018, Suntektech
 */
@LocalComponent(id = "face/dispatchedAlarmPermanent")
public class FaceDispatchedAlarmPermanentProvider extends GridDataProvider {

	private Dialect dialect = DialectFactory.getDialect(Constants.APP_NAME, "");

	private FaceDispatchedAlarmDao alarmDao = new FaceDispatchedAlarmDao();

	@Override
	protected String buildQuerySQL() {
		String querySql = "select DISTINCT alarm.ALARM_ID, alarm.DEVICE_ID, alarm.OBJECT_ID, "
            + dialect.datetochar("alarm.ALARM_TIME", 4) + "as ALARM_TIME, alarm.OBJECT_EXTEND_INFO, "
            + "alarm.TASK_LEVEL ALARM_LEVEL, alarm.ALARM_IMG, alarm.FRAME_IMG, alarm.OBJECT_PICTURE TEMPLET_IMG, "
            + " alarm.DB_NAME, alarm.SCORE ,EF.REMARK, EF.DISPATCH_ID,EF.UPDATE_TIME,EF.USER_CODE,us.USER_NAME"
            + " from VPLUS_SURVEILLANCE_ALARM alarm " + this.getOptionalStatement();

		return querySql;
	}

	@Override
	protected String buildCountSQL() {
		String countSql = "select count(DISTINCT alarm.ALARM_ID) from  VPLUS_SURVEILLANCE_ALARM  alarm "
				+ this.getOptionalStatement();

		return countSql;
	}

	@Override
	protected void prepare(RequestContext context) {
		// this.addOptionalStatement(" left join VIID_DISPATCHED_OBJECT object on alarm.OBJECT_ID = object.OBJECT_ID left join EFACE_DISPATCHED_PERSON person on person.PERSON_ID = object.PERSON_ID ");
		// this.addOptionalStatement(" left join SYS_DEPT dept on dept.CIVIL_CODE = alarm.ORG_CODE ");

        this.addOptionalStatement(
            " INNER JOIN ( SELECT DISTINCT b.USER_CODE,a.REL_ID, a.DISPATCH_ID,a.IDENTITY_ID,b.REMARK,c.UPDATE_TIME FROM EFACE_POLICE_TASK_DISPATCH a,EFACE_POLICE_TASK_RECORD b ,"
				+ "( select  max(UPDATE_TIME) as UPDATE_TIME, DISPATCH_ID from EFACE_POLICE_TASK_RECORD group by DISPATCH_ID) c "
                + "where a.DISPATCH_ID = b.DISPATCH_ID and b.DISPATCH_ID = c.DISPATCH_ID and b.UPDATE_TIME = c.UPDATE_TIME and TASK_STATUS = 9 and TASK_TYPE = 1) EF"
                + " on alarm.ALARM_ID = EF.REL_ID INNER JOIN SYS_USER us ON EF.USER_CODE = us.USER_CODE");

		// 查询当前任务
		// this.addOptionalStatement(" left join  EFACE_POLICE_TASK_DISPATCH ep on ep.TASK_ID = alarm.TASK_ID ");
		this.addOptionalStatement(" where 1=1 ");

        String orgCode = StringUtil.toString(context.getParameter("ORG_CODE"), "");
		if (!StringUtil.isEmpty(orgCode) && !orgCode.equals("00")) {
			this.addOptionalStatement(" and dept.DEPT_CODE = ? ");
			this.addParameter(orgCode);
		}

        String regionName = StringUtil.toString(context.getParameter("REGION_NAME"), "");

		if (!"广东省".equals(regionName)) {
			if (!StringUtil.isEmpty(regionName) && !regionName.equals("全国")) {
				this.addOptionalStatement(" and person.FILING_UNIT_NAME like ? ");
				this.addParameter(regionName + "%");
			}

			String alarmLevel = StringUtil.toString(
					context.getParameter("ALARM_LEVEL"), "-1");
			if (!"-1".equals(alarmLevel)) {
				String[] levels = alarmLevel.split(",");
				this.addOptionalStatement(" and alarm.TASK_LEVEL in "
						+ SqlUtil.getSqlInParams(levels));
				for (String level : levels) {
					this.addParameter(level);
				}
			}
		} else {// 橙色(TASK_LEVEL = 1)抓捕类默认是属于广东的;临时方案
			this.addOptionalStatement(" and ((person.FILING_UNIT_NAME like ? ");
			this.addParameter(regionName + "%");

			String alarmLevel = StringUtil.toString(
					context.getParameter("ALARM_LEVEL"), "-1");
			if (!"-1".equals(alarmLevel)) {
				String[] levels = alarmLevel.split(",");
				this.addOptionalStatement(" and alarm.TASK_LEVEL in "
						+ SqlUtil.getSqlInParams(levels));
				for (String level : levels) {
					this.addParameter(level);
				}
			}

			this.addOptionalStatement(")");
			if (!alarmLevel.equals("0")) {
				this.addOptionalStatement(" or alarm.TASK_LEVEL = 1 ");
			}
			this.addOptionalStatement(")");
		}

        String caseName = StringUtil.toString(context.getParameter("CASE_TYPE"), "");
		if (!StringUtil.isEmpty(caseName)) {
			this.addOptionalStatement(" and person.CASE_NAME like ? ");
			this.addParameter("%" + caseName + "%");
		}

        String userCode = StringUtil.toString(context.getParameter("USER_CODE"), "");
        if (!StringUtil.isEmpty(userCode)) {
            this.addOptionalStatement(" and EF.USER_CODE = ? ");
            this.addParameter(userCode);
        }

        String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
		String endTime = StringUtil.toString(context.getParameter("END_TIME"));
		if (!StringUtil.isNull(beginTime) && !StringUtil.isNull(endTime)) {
			this.addOptionalStatement(" and EF.UPDATE_TIME between ? and ?");
			this.addParameter(beginTime);
			this.addParameter(endTime);
		} else if (!StringUtil.isNull(beginTime)) {
			this.addOptionalStatement(" and EF.UPDATE_TIME > ?");
			this.addParameter(beginTime);
		} else if (!StringUtil.isNull(endTime)) {
			this.addOptionalStatement(" and EF.UPDATE_TIME < ?");
			this.addParameter(endTime);
		}

		// 排序
		context.putParameter("sort", "UPDATE_TIME desc");

		this.addFieldRender(new AlarmFieldRender(), new String[] { "ALARM_IMG",
				"FRAME_IMG", "TEMPLET_IMG" });
	}

	class AlarmFieldRender implements IFieldRender {

		@Override
		public Object render(String fieldName, ResultSet resultSet)
				throws SQLException {
			try {
				if (fieldName.equals("ALARM_IMG")
						|| fieldName.equals("FRAME_IMG")
						|| fieldName.equals("TEMPLET_IMG")) {
					String img = resultSet.getString(fieldName);
					return ModuleUtil.renderImage(img);
				}
			} catch (Exception e) {
				ServiceLog.error("转换操作类型异常", e);
			}

			return "";
		}

	}

	@Override
	@BeanService(id = "getData", type = "remote", description = "告警抓捕记录查询")
	public PageQueryResult getData(RequestContext context) {

		PageQueryResult result = super.getData(context);

		try {
			List<Map<String, Object>> resultSet = result.getResultSet();

			CommonUtil.reanderScore(resultSet, Constants.ALGO_TYPE_YUNCONG_35,
					"SCORE");
			for (Map<String, Object> map : resultSet) {

				String deviceId = StringUtil.toString(map.get("DEVICE_ID"));
				DeviceEntity faceDevice = (DeviceEntity) EAP.metadata
						.getDictModel(DictType.D_FACE, deviceId,
								DeviceEntity.class);
				map.put("DEVICE_NAME", faceDevice.getDeviceName());
				map.put("DEVICE_ADDR", faceDevice.getDeviceAddr());
				map.put("LONGITUDE", faceDevice.getDeviceX());
				map.put("LATITUDE", faceDevice.getDeviceY());

				String extendInfo = StringUtil.toString(map
						.get("OBJECT_EXTEND_INFO"));

				// 解析eface_police_task_record表中的remark的json数据，里面含有抓捕图片数据
				String remarkInfo = StringUtil.toString(map.get("REMARK"));
				if (!StringUtil.isEmpty(extendInfo)) {

					String sexCode = "", personName = "", identityId = "";
					String fsName = "", fsPic = "", fsIdentityId = "", fsHitTime = "", remarkPicList = "";
					try {
						JSONObject json = JSONObject.parseObject(extendInfo);

						sexCode = json.getString("SEX");
						personName = json.getString("NAME");
						identityId = json.getString("IDENTITY_ID");
						// 解析json格式，因为里面有两层
						List<Object> remarkJsonList = JSONObject
								.parseArray(remarkInfo);
						for (Object list : remarkJsonList) {
							JSONObject obj = JSONObject.parseObject(list
									.toString());
							if (obj.get("key").toString()
									.contains("IS_CONSISTENT")
									&& obj.get("value").toString().equals("是")) {
								remarkPicList = obj.get("file").toString();
							}
						}

						// 获取比对结果
						if (json.containsKey("MUTIL_ALGO_CHECK")) {
							JSONObject algoCheck = json
									.getJSONObject("MUTIL_ALGO_CHECK");
							JSONObject object = algoCheck
									.getJSONObject(Constants.ALGO_TYPE_FEISHI);
							if (null != object) {
								fsName = StringUtil.toString(object
										.getString("FS_NAME"));
								fsPic = ModuleUtil.renderImage(StringUtil
										.toString(object.getString("FS_PIC")));
								fsIdentityId = StringUtil.toString(object
										.getString("FS_IDENTITY_ID"));
								fsHitTime = StringUtil.toString(object
										.getString("FS_HIT_TIME"));
							}
						}
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

					map.put("PERSON_NAME", personName);
					map.put("IDENTITY_ID", identityId);
					map.put("SEX", sexCode);
					map.put("FS_PIC", fsPic);
					map.put("FS_NAME", fsName);
					map.put("FS_IDENTITY_ID", fsIdentityId);
					map.put("FS_HIT_TIME", fsHitTime);
					map.put("REMARK_PIC",
							"http://172.25.20.28:8088/g28/M00/00031003/20180905/rBkUHFuPw76IUvhjAAFpwVuZhJUAAAykwAIyTgAAWnZ667.jpg");
					map.put("REMARK_PIC_LIST", remarkPicList);

					// 将当前信息的object_id 放到context中
					context.getParameters().put("OBJECT_ID",
							map.get("OBJECT_ID"));
					map.put("RECENT_COUNT", alarmDao
							.getRecentAlarmCount(context.getParameters()));

					if (!StringUtil.isEmpty(fsPic)) { // 是否飞识比中
						map.put("FS_HIT", "1");
					} else {
						map.put("FS_HIT", "0");
					}
				}
			}
		} catch (Exception e) {
			ServiceLog.error("查询异常：" + e.getMessage(), e);
		}

		return result;
	}

}
