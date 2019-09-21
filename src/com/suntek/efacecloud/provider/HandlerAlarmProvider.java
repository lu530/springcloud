package com.suntek.efacecloud.provider;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import com.suntek.efacecloud.dao.FaceDispatchedAlarmDao;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.util.CommonUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ESUtil;
import com.suntek.efacecloud.util.ExcelFileUtil;
import com.suntek.efacecloud.util.FileDowloader;
import com.suntek.efacecloud.util.MaskIdentityAndNameUtil;
import com.suntek.efacecloud.util.ModuleUtil;

import net.sf.json.JSONArray;

/**
 * 已处理告警查询 efacecloud/rest/v6/face/handlerAlarm
 *
 * @author lx
 * @version 2017-06-29 Copyright (C)2017 , Suntektech
 * @since 1.0.0
 */
@LocalComponent(id = "face/handlerAlarm")
public class HandlerAlarmProvider extends ExportGridDataProvider {
    private Dialect dialect = DialectFactory.getDialect(Constants.APP_NAME, "");
    private String IS_PERSONEL_CONTROL_ELABORATION = AppHandle.getHandle(Constants.APP_NAME).getProperty("IS_PERSONEL_CONTROL_ELABORATION", "0");
    private FaceDispatchedAlarmDao dao = new FaceDispatchedAlarmDao();
    
    /**
     * 是否查询告警反馈状态1:是；0或空：否
     */
    private String serchAlarmRel = "1";
    
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
        
        this.addOptionalStatement(fromTable + " vfa "
                + "left join VIID_DISPATCHED_DB d on d.DB_ID = vfa.DB_ID ");
        
        String confirmStatus = StringUtil.toString(context.getParameter("CONFIRM_STATUS"));
        String beginTime = StringUtil.toString(context.getParameter("BEGIN_TIME"));
        String endTime = StringUtil.toString(context.getParameter("END_TIME"));
        
        /******告警确认 查询   lijunbo ******/
        // 是否告警确认 0:否 1：是 2:未处理 3：已处理
        if (!StringUtil.isNull(confirmStatus)) {
           
            if (confirmStatus.equals(Constants.CONFIRM_STATUS_UNTREATED)) {
                //confirmStatus=2，未处理
//    			this.addOptionalStatement(" where vfa.ALARM_ID not in (select d.REL_ID relId  from EFACE_POLICE_TASK_DISPATCH d "
//        				+ " LEFT JOIN EFACE_POLICE_TASK_RECORD r on d.DISPATCH_ID = r.DISPATCH_ID "
//        				+ " LEFT JOIN EFACE_POLICE_TASK_REMARK rem on r.REMARK_ID = rem.REMARK_ID "
//        				+ " where rem.REMARK_KEY is not null GROUP BY d.REL_ID )" );
            } else {
                Log.faceSearchLog.info("告警查询-生效-confirmStatus：" + confirmStatus);
                //已处理
                this.addOptionalStatement(" inner join (select d.REL_ID relId,d.DISPATCH_ID dispatchId, "
                        + " r.REMARK remark, rem.REMARK_KEY remarkKey, rem.REMARK_VALUE remarkValue "
                        + " from EFACE_POLICE_TASK_DISPATCH d "
                        + " LEFT JOIN EFACE_POLICE_TASK_RECORD r on d.DISPATCH_ID = r.DISPATCH_ID "
                        + " LEFT JOIN EFACE_POLICE_TASK_REMARK rem on r.DISPATCH_ID = rem.DISPATCH_ID "
                        + " where rem.REMARK_KEY = '" + Constants.ALARM_CONFIRM_KEY + "'");
                if (confirmStatus.equals(Constants.CONFIRM_STATUS_NOCONFIRM)) {
                    //confirmStatus=0 ，不准确
                    this.addOptionalStatement(" and rem.REMARK_VALUE = '" + Constants.ALARM_CONFIRM_VALUE_NO + "'");
                } else if (confirmStatus.equals(Constants.CONFIRM_STATUS_CORRECT)) {
                    //confirmStatus=1，准确
                    this.addOptionalStatement(" and rem.REMARK_VALUE = '" + Constants.ALARM_CONFIRM_VALUE_YES + "'");
                } else if (confirmStatus.equals(Constants.CONFIRM_STATUS_TREATED)) {
                    //confirmStatus=3，已处理
                    this.addOptionalStatement(" and rem.REMARK_VALUE is not null");
                }
                if (!StringUtil.isNull(beginTime) && !StringUtil.isNull(endTime)) {
                    this.addOptionalStatement(" and rem.CREATE_TIME between ? and ?");
                    this.addParameter(beginTime);
                    this.addParameter(endTime);
                } else if (!StringUtil.isNull(beginTime)) {
                    this.addOptionalStatement(" and rem.CREATE_TIME > ?");
                    this.addParameter(beginTime);
                } else if (!StringUtil.isNull(endTime)) {
                    this.addOptionalStatement(" and rem.CREATE_TIME < ?");
                    this.addParameter(endTime);
                }
                this.addOptionalStatement(" GROUP BY d.REL_ID) ala on ala.relId = vfa.ALARM_ID ");
            }
        }
        
        if (!context.getUser().isAdministrator()) {
            // 精细化控制，通过权限管理配置可见信息
            if ("1".equals(IS_PERSONEL_CONTROL_ELABORATION)) {
                this.addOptionalStatement("left join VIID_DISPATCHED_PERSON vdp on vfa.OBJECT_ID = vdp.FACE_ID "
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
            } else {
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
        
        this.addOptionalStatement(" and vfa.TASK_TYPE = ? ");
        int taskType = StringUtil.toInteger(context.getParameter("TASK_TYPE"), Constants.TASK_FACE_ALARM);
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
        if (StringUtil.isEmpty(confirmStatus)) {
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
        
        // 是否告警确认 0:否 1：是
//        String confirmStatus = StringUtil.toString(context.getParameter("CONFIRM_STATUS"));
//        if (!StringUtil.isNull(confirmStatus)) {
//            this.addOptionalStatement(" and vfa.CONFIRM_STATUS = ? ");
//            this.addParameter(confirmStatus);
//        }
      
        
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
     *关联警情下发反馈记录表
     */
    @Override
    @BeanService(id = "getHandlerAlarmData", type = "remote", description = "已处理告警记录查询", paasService = "true")
    public PageQueryResult getData(RequestContext context) {
        PageQueryResult result = super.getData(context);
        
        try {
            List<Map<String, Object>> resultSet = result.getResultSet();
            // 告警反馈
            Map<Object, List<Map<String, Object>>> relMap = new HashMap<>();
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
                DeviceEntity faceDevice = (DeviceEntity) EAP.metadata
                        .getDictModel(DictType.D_FACE, deviceId,
                                DeviceEntity.class);
                map.put("DEVICE_NAME", faceDevice.getDeviceName());
                map.put("DEVICE_ADDR", faceDevice.getDeviceAddr());
                map.put("LONGITUDE", faceDevice.getDeviceX());
                map.put("LATITUDE", faceDevice.getDeviceY());
                
                String extendInfo = StringUtil.toString(map
                        .get("OBJECT_EXTEND_INFO"));
                
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
                                fsWjr = StringUtil.toString(object
                                        .getString("FS_WJR"));
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
                    
                    String isFacemore = AppHandle.getHandle(Constants.APP_EFACESURVEILLANCE).getProperty("IS_FACEMORE", "0");
                    if (!"0".equalsIgnoreCase(isFacemore)) {
                        map.put("IS_COVER", CommonUtil.getMutilFaceAlarmType(isCover));
                    } else {
                        map.remove("IS_COVER");
                        map.remove("CONFIRM_STATUS");
                    }
                    
                    map.put("PERSON_NAME", personName);
                    map.put("IDENTITY_ID", identityId);
                    map.put("SEX", sexCode);
                    map.put("FS_PIC", fsPic);
                    map.put("FS_NAME", fsName);
                    map.put("FS_IDENTITY_ID", fsIdentityId);
                    map.put("FS_HIT_TIME", fsHitTime);
                    map.put("FACE_SCORE", getFaceScore(infoId, context));
                    
                    map.put("FS_WJR", fsWjr);//外籍人比中
                    if (!StringUtil.isEmpty(fsPic)) { // 是否飞识比中
                        map.put("FS_HIT", "1");
                    } else {
                        map.put("FS_HIT", "0");
                    }
                    if ("1".equals(MaskIdentityAndNameUtil.IS_MASK_IDENTITY_AND_NAME)) {
                        if (identityId.length() > 10) {
                            map.put("IDENTITY_ID", identityId.substring(0, 10) + "********");
                        }
                        if (personName.length() > 1) {
                            map.put("PERSON_NAME", personName.substring(0, 1) + "**");
                        }
                    }
                    
                    long startTime = System.currentTimeMillis();
                    
                    //获取人脸告警详情查询最近某个人告警列表的派出所信息的时间间隔，单位（天）0禁用
                    String timeInterval = AppHandle.getHandle(Constants.APP_NAME).getProperty("RELATIVE_POLICESTATION_INFO_INTERVAL", "0");
                    
                    //扩展字段json加入police_station_info的json信息
                    JSONObject policeStationJson = new JSONObject();
                    json.put("POLICE_STATION_INFO", policeStationJson);
                    
                    //时间间隔为0，就不显示（IS_SHOW为0）；相反则为1
                    if (timeInterval.equals("0")) {
                        policeStationJson.put("IS_SHOW", "0");
                    } else {
                        policeStationJson.put("IS_SHOW", "1");
                        
                        //获取告警设备关联派出所信息
                        List<Map<String, Object>> policeStationList = dao.getRelativePoliceStaion1Info(deviceId);
                        if (policeStationList == null || policeStationList.isEmpty()) {
                            policeStationList = dao.getRelativePoliceStaion2Info(deviceId);
                        }
                        
                        if (policeStationList != null && !policeStationList.isEmpty()) {
                            Map<String, Object> tempMap = policeStationList.get(0);
                            //组装派出所信息json
                            policeStationJson.put("DEPT_NAME", StringUtil.toString(tempMap.get("DEPT_NAME")));
                        }
                    }
                    
                    //更新OBJECT_EXTEND_INFO字段信息，加入相关派出所信息
                    map.put("OBJECT_EXTEND_INFO", JSON.toJSONString(json));
                    
                    long endTime = System.currentTimeMillis();
                    float excTime = (float) (endTime - startTime) / 1000;
                    ServiceLog.debug("获取当前派出所方法的执行时间:" + excTime);
                }
                
                // 告警反馈
                if ("1".equals(serchAlarmRel)) {
                    List<Map<String, Object>> list = relMap.get(map.get("ALARM_ID"));
                    if (null != list) {
                        long count = list.stream().filter(o -> !StringUtil.isNull(StringUtil.toString(o.get("RESULT")))).count();
                        if (count > 0) {
                            map.put("STATUS", Constants.ALARM_STATUS_HANDLED);
                            map.put("STATUS_TXT", "已反馈");
                            return result;
                        }
                        count = list.stream().filter(o -> "1".equals(StringUtil.toString(o.get("IS_ACCEPT")))).count();
                        if (count > 0) {
                            map.put("STATUS", Constants.ALARM_STATUS_ACCEPT);
                            map.put("STATUS_TXT", "已签收");
                            return result;
                        }
                        count = list.stream().filter(o -> "1".equals(StringUtil.toString(o.get("IS_SEND")))).count();
                        if (count > 0) {
                            map.put("STATUS", Constants.ALARM_STATUS_SENT);
                            map.put("STATUS_TXT", "已下发");
                        } else {
                            map.put("STATUS", Constants.ALARM_STATUS_UNSEND);
                            map.put("STATUS_TXT", "");
                        }
                    }
                }
                
            }
        } catch (Exception e) {
            ServiceLog.error("获取告警设备信息异常", e);
        }
        
        return result;
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
     * @param context
     * @throws Exception
     */
    @SuppressWarnings({"unchecked", "serial"})
    @BeanService(id = "exportAlarm", description = "导出人脸告警记录")
    public void exportAlarm(RequestContext context) throws Exception {
        List<Map<String, Object>> excelDataList = new ArrayList<Map<String, Object>>();
        List<Map<String, byte[]>> imgList = new ArrayList<>();
        String[] headers = {"抓拍图片", "布控图片", "全景图片", "相似度", "告警地点", "告警时间", "姓名", "性别", "证件号码", "布控库"};
        String[] dataKey = {"alarmImgUrl", "templetImgUrl", "frameImgUrl", "SCORE", "DEVICE_ADDR", "ALARM_TIME", "PERSON_NAME", "SEX", "IDENTITY_ID", "DB_NAME"};
        
        String exportData = StringUtil.toString(context
                .getParameter("EXPORT_DATA"));
        if (!StringUtil.isNull(exportData)) {
            // 导出勾选的数据
            excelDataList = JSONArray.fromObject(exportData);
        } else {
            context.putParameter("pageNo", "1");
            context.putParameter("pageSize", Constants.EXPORT_MAX_COUNT);
            PageQueryResult result = this.getData(context);
            excelDataList = result.getResultSet();
        }
        
        try {
            for (Map<String, Object> map : excelDataList) {
                byte[] alarmImgUrl = FileDowloader.getImageFromUrl(StringUtil.toString(map.get("ALARM_IMG")));
                byte[] templetImgUrl = FileDowloader.getImageFromUrl(StringUtil.toString(map.get("TEMPLET_IMG")));
                byte[] frameImgUrl = FileDowloader.getImageFromUrl(StringUtil.toString(map.get("FRAME_IMG")));
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
                "告警记录导出"
                        + DateUtil.formatDate(DateUtil.getDateTime(), "yyyyMMddHHmmss"), headers, dataKey,
                excelDataList, imgList, context);
        if (isExport) {
            context.getResponse()
                    .putData("CODE", Constants.RETURN_CODE_SUCCESS);
            context.getResponse().putData("MESSAGE", "导出成功！");
        } else {
            context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
            context.getResponse().putData("MESSAGE", "导出失败！");
        }
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
