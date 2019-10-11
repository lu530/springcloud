package com.suntek.efacecloud.provider;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import com.suntek.eap.tag.grid.GridDataProvider;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.jdbc.dialect.Dialect;
import com.suntek.eap.jdbc.dialect.DialectFactory;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.org.UserModel;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.smp.Permission;
import com.suntek.eap.util.SqlUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.util.CommonUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.eap.jdbc.IFieldRender;
/**
 * 根据告警类型返回告警数据
 * */
@LocalComponent(id = "alarm/dispatchedAlarm")
public class AlarmDispartchProvider  extends GridDataProvider {
	  private Dialect dialect = DialectFactory.getDialect(Constants.APP_NAME, "");
	  private String IS_PERSONEL_CONTROL_ELABORATION = AppHandle.getHandle(Constants.APP_NAME).getProperty("IS_PERSONEL_CONTROL_ELABORATION", "0");



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
	        String sql = "select vfa.ALARM_ID, vfa.OBJECT_ID, "
	                + dialect.datetochar("vfa.ALARM_TIME", 4)
	                + " as ALARM_TIME, vfa.OBJECT_EXTEND_INFO, "
	                + "vfa.TASK_LEVEL ALARM_LEVEL, vfa.ALARM_IMG, vfa.DEVICE_ID ORIGINAL_DEVICE_ID, vfa.DB_ID, vfa.DB_NAME, vfa.FRAME_IMG, "
	                + "vfa.OBJECT_PICTURE TEMPLET_IMG, vfa.SCORE, vfa.CONFIRM_STATUS from "
	                + this.getOptionalStatement();
	        return sql;
	    }

	    /**
	     *
	     */
	    @Override
	    protected void prepare(RequestContext context) {
	        String isHistory = StringUtil.toString(context
	                .getParameter("isHistory"));
	        String fromTable = "VPLUS_SURVEILLANCE_ALARM";
	        if ("1".equals(isHistory)) {
	            fromTable = "VPLUS_SURVEILLANCE_ALARM_HIS";
	        }
			int taskType = StringUtil.toInteger(context.getParameter("TASK_TYPE"), Constants.TASK_FACE_ALARM);
	        this.addOptionalStatement(fromTable + " vfa "
	                + " join VIID_DISPATCHED_DB d on d.DB_ID = vfa.DB_ID ");
	        if(taskType==1) {
				if (!context.getUser().isAdministrator()) {
					// 精细化控制，通过权限管理配置可见信息
					if ("1".equals(IS_PERSONEL_CONTROL_ELABORATION)) {
						this.addOptionalStatement(" join VIID_DISPATCHED_PERSON vdp on vfa.OBJECT_ID = vdp.FACE_ID "
								+ "join SYS_USER u on vdp.CREATOR = u.USER_CODE ");
						this.addOptionalStatement(" where  1=1 ");
						this.addOptionalStatement("AND ("
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
								+ ")");
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
					}else{
						this.addOptionalStatement(" where  1=1 ");
						UserModel userModel = context.getUser();
						this.addOptionalStatement(" and (("
								+ Permission.getCurNodeAlarmPrivSql(userModel.getCode(),
								null, "vfa.ORG_CODE"));
						this.addOptionalStatement(" and vfa.TASK_LEVEL in "
								+ "(select ALARM_LEVEL from SYS_USERALARMLEVEL where USER_CODE = ? )");
						this.addOptionalStatement(" and vfa.DB_ID in "
								+ "(select d.DB_ID from VIID_DISPATCHED_DB d left join "
								+ "EFACE_DISPATCHED_PERSON_PERMISSION_REL rel on d.DB_ID = rel.DB_ID "
								+ "where d.IS_PUBLIC = 1 or  rel.USER_CODE = ? ))");
						this.addOptionalStatement(" or vfa.DB_ID in "
								+ "(select d.DB_ID from VIID_DISPATCHED_DB d where d.CREATOR = ? ))");
						this.addParameter(context.getUserCode());
						this.addParameter(context.getUserCode());
						this.addParameter(context.getUserCode());
					}
				} else {
					this.addOptionalStatement(" where 1=1 ");
				}
			}else {
				this.addOptionalStatement(" where  1=1 ");
				UserModel userModel = context.getUser();
				this.addOptionalStatement(" and (("
						+ Permission.getCurNodeAlarmPrivSql("admin",
						null, "vfa.ORG_CODE"));
				this.addOptionalStatement(" and vfa.TASK_LEVEL in "
						+ "(select ALARM_LEVEL from SYS_USERALARMLEVEL  )");
				this.addOptionalStatement(" and vfa.DB_ID in "
						+ "(select d.DB_ID from VIID_DISPATCHED_DB d left join "
						+ "EFACE_DISPATCHED_PERSON_PERMISSION_REL rel on d.DB_ID = rel.DB_ID "
						+ "where d.IS_PUBLIC = 1  ))");
				this.addOptionalStatement(" or vfa.DB_ID in "
						+ "(select d.DB_ID from VIID_DISPATCHED_DB d  ))");
			}

	        this.addOptionalStatement(" and vfa.TASK_TYPE = ? ");

	        this.addParameter(taskType);

	        String searchType = StringUtil.toString(context
	                .getParameter("SEARCH_TYPE"));
	        if (!StringUtil.isNull(searchType)) {
	            this.addOptionalStatement(" and (vfa.DEAL_STATUS is null or (vfa.DEAL_STATUS <> ? and vfa.DEAL_STATUS <> ?)) ");
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
	            this.addOptionalStatement(" and vfa.OBJECT_EXTEND_INFO like ? ");
	            this.addParameter("%" + keywords + "%");
	        }

	        // 设备ID
	        String deviceIds = StringUtil.toString(context
	                .getParameter("DEVICE_IDS"));
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

	        // 场景ID
	        String sceneId = StringUtil.toString(context.getParameter("SCENE_ID"));
	        if (!StringUtil.isEmpty(sceneId)) {
	            this.addOptionalStatement(" and vfa.SCENE_ID = ? ");
	            this.addParameter(sceneId);
	        }

	        // OBJECT_ID,用于做一个人的告警频次分析
	        String objectId = StringUtil
	                .toString(context.getParameter("OBJECT_ID"));
	        if (!StringUtil.isEmpty(objectId)) {
	            this.addOptionalStatement(" and vfa.OBJECT_ID = ? ");
	            this.addParameter(objectId);
	        }

	        // 告警等级
	        String alarmLevel = StringUtil.toString(context
	                .getParameter("ALARM_LEVEL"));
	        if (!StringUtil.isNull(alarmLevel)) {
	            this.addOptionalStatement(" and vfa.TASK_LEVEL in "
	                    + SqlUtil.getSqlInParams(alarmLevel));
	            for (int i = 0; i < alarmLevel.split(",").length; i++) {
	                addParameter(alarmLevel.split(",")[i]);
	            }
	        }

	        // 告警反馈 前端值： 0:未签收 1：已签收 2：未反馈 3：已反馈
	        // 数据库:0:未签收 1：已签收 2：已反馈 9：已抓获
	        String alarmHandle = StringUtil.toString(context
	                .getParameter("ALARM_HANDLE"));
	        if (!StringUtil.isNull(alarmHandle)) {
	            int iAlarmHandle = Integer.parseInt(alarmHandle);
	            if (iAlarmHandle == Constants.ALARM_UNSIGN_FRONT_END) {// 0
	                this.addOptionalStatement(" and (vfa.ALARM_HANDLE = ? or vfa.ALARM_HANDLE is null) and vfa.TASK_LEVEL <> ?");
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

	        // 是否告警确认 0:否， 1：是，2：未确认，3：已确认
	        String confirmStatus = StringUtil.toString(context.getParameter("CONFIRM_STATUS"));
	        if (!StringUtil.isNull(confirmStatus)) {
	            if (Constants.CONFIRM_STATUS_TREATED.equals(confirmStatus)) {
	                //已确认3
	                this.addOptionalStatement(" and vfa.CONFIRM_STATUS is not null ");
	            } else if (Constants.CONFIRM_STATUS_UNTREATED.equals(confirmStatus)) {
	                //未确认2
	                this.addOptionalStatement(" and vfa.CONFIRM_STATUS is null ");
	            } else if (Constants.CONFIRM_STATUS_NOCONFIRM.equals(confirmStatus) || Constants.CONFIRM_STATUS_CORRECT.equals(confirmStatus)) {
	                //准确1、不准确0
	                this.addOptionalStatement(" and vfa.CONFIRM_STATUS = ? ");
	                this.addParameter(confirmStatus);
	            }
	        }

	        // 相似度
	        String threshold = (String) context.getParameter("THRESHOLD");
	        if (!StringUtil.isNull(threshold)) {
	            double score = Integer.parseInt(threshold);
	            this.addOptionalStatement(" and vfa.SCORE >= ?");
	            this.addParameter(score);
	        }

	        // 算法id
	        String algorithmId = (String) context.getParameter("AlGORITHM_ID");
	        if (!StringUtil.isNull(algorithmId)) {
	            if ("90002".equals(algorithmId)) {
	                this.addOptionalStatement(" and OBJECT_EXTEND_INFO like ? ");
	                this.addParameter("%飞识比中%");
	            }
	        }

	        String alarmType = StringUtil.toString(
	                context.getParameter("ALARM_TYPE"), "");
	        if ("1".equals(alarmType)) {
	            this.addOptionalStatement(" and OBJECT_EXTEND_INFO like ? ");
	            this.addParameter("%飞识比中%");
	        } else if ("0".equals(alarmType)) {
	            this.addOptionalStatement(" and OBJECT_EXTEND_INFO not like ? ");
	            this.addParameter("%飞识比中%");
	        } else if ("2".equals(alarmType)) {
	            this.addOptionalStatement(" and OBJECT_EXTEND_INFO like ? ");
	            this.addParameter("%三方接口比中%");
	        }

	        String isEscapeHit = StringUtil.toString(context.getParameter("IS_ESCAPE_HIT"), "");
	        if ("1".equals(isEscapeHit)) {
	            this.addOptionalStatement(" and vfa.OBJECT_EXTEND_INFO like  '%\"ESCAPEE_FLAG\":1%' ");
	        } else if ("0".equals(isEscapeHit)) {
	            this.addOptionalStatement(" and vfa.OBJECT_EXTEND_INFO not like  '%\"ESCAPEE_FLAG\":1%' ");
	        }

	        // 排序
	        String sort = (String) context.getParameter("SORT");
	        if ("1".equals(sort)) {
	            context.putParameter("sort", "SCORE desc");
	        } else {
	            context.putParameter("sort", "ALARM_TIME desc");
	        }

	        // 外籍人多算法
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

	        this.addFieldRender(new AlarmFiledRender(), new String[]{"ALARM_IMG", "TEMPLET_IMG", "SCORE", "SEX", "FRAME_IMG", "CONFIRM_STATUS"});
	    }

	    /**
	     *
	     */
	    @Override
	    @BeanService(id = "getData", type = "remote", description = "人脸告警记录查询", paasService = "true")
	    public PageQueryResult getData(RequestContext context) {
	        PageQueryResult result = super.getData(context);

	        try {
	        	String taskType=StringUtil.toString(context.getParameter("TASK_TYPE"));
	            List<Map<String, Object>> resultSet = result.getResultSet();
	            /*
	             * if("1".equals(serchAlarmRel)) { List<String> alarmIdList =
	             * resultSet.stream().map(f->
	             * StringUtil.toString(f.get("ALARM_ID"))).
	             * collect(Collectors.toList()); List<Map<String, Object>> relList =
	             * new ArrayList<>(); if(alarmIdList.size() > 0) { relList =
	             * relDao.getAlarmRelByAlarmIds(alarmIdList); } relMap =
	             * relList.stream
	             * ().collect(Collectors.groupingBy(o->o.get("ALARM_ID"))); }
	             */

	            for (Map<String, Object> map : resultSet) {
	                String deviceId = StringUtil.toString(map
	                        .get("ORIGINAL_DEVICE_ID"));
	                DeviceEntity device=new DeviceEntity();
	                String extendInfo = StringUtil.toString(map
	                        .get("OBJECT_EXTEND_INFO"));
	                if (!StringUtil.isEmpty(extendInfo)) {
	                	 JSONObject json = JSONObject.parseObject(extendInfo);
	                	 try{
	                		 switch (taskType){
	     	                case("1"):	     	                
	     	                map.put("PERSON_NAME", json.getString("NAME"));
	     	                map.put("CAPTURE_TIME", json.getString("CAPTURE_TIME"));
	     	                break;
	     	                case("3"):
	     	                map.put("REASON",json.getString("REASON"));
	     	                map.put("PLATE_NUMBER", json.getString("HPHM"));
	     	                //map.put("ALARM_TIME", json.getString("PASS_TIME"));
	     	                break;
	     	                case("5"):     	                
	     	                map.put("OBJECT_FEATURE", json.getString("MAC"));
	     	                //map.put("ALARM_TIME", json.getString("LAST_COLLECTTIME"));
	     	                break;
	     	                case("10"):
	     	                map.put("IMSI", json.getString("IMSI"));
	     	                break;
	     	                default:
	     	                	break;
	     	                }
	                	 }catch(Exception e){
	                		 ServiceLog.error("转换extendInfo异常", e);
	                	 }
	                }
	                switch (taskType){
	                case("1"):
	                	device=(DeviceEntity) EAP.metadata
                        .getDictModel(DictType.D_FACE, deviceId,
                                DeviceEntity.class);
	                break;
	                case("3"):
	                	device=(DeviceEntity) EAP.metadata
                        .getDictModel(DictType.D_CAR, deviceId,
                                DeviceEntity.class);
	                break;
	                case("5"):
	                	device=(DeviceEntity) EAP.metadata
                        .getDictModel(DictType.D_WIFI, deviceId,
                                DeviceEntity.class);
	                break;
	                case("10"):
	                	device=(DeviceEntity) EAP.metadata
                        .getDictModel(DictType.D_FENCE, deviceId,
                                DeviceEntity.class);
	                break;
	                default:
	                	break;
	                }
	                
	                map.put("DEVICE_NAME", device.getDeviceName());
	                map.put("DEVICE_ADDR", device.getDeviceAddr());
	                map.put("LONGITUDE", device.getDeviceX());
	                map.put("LATITUDE", device.getDeviceY());
	            }
	        } catch (Exception e) {
	            ServiceLog.error("获取告警设备信息异常", e);
	        }

	        return result;
	    }
   
	   
	    /**
	     * @author
	     * @version 2018年12月12日 Copyright (C)2018 , pcitech
	     * @since
	     */
	    class AlarmFiledRender implements IFieldRender {
	        @Override
	        public Object render(String fieldName, ResultSet resultSet)
	                throws SQLException {
	            try {

	                if ("ALARM_IMG".equals(fieldName) || "TEMPLET_IMG".equals(fieldName) || "FRAME_IMG".equals(fieldName)) {
	                    String alarmImg = resultSet.getString(fieldName);
	                    return ModuleUtil.renderImage(alarmImg);
	                }
	                if ("SCORE".equals(fieldName)) {
	                    double score = resultSet.getDouble(fieldName);
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

}
