package com.suntek.efacecloud.provider.mppdb;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.log.ServiceLog;
import com.suntek.eap.common.util.DateUtil;
import com.suntek.eap.common.util.SqlUtil;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.metadata.DictType;
import com.suntek.eap.tag.grid.ExportGridDataProvider;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.DeviceInfoDao;
import com.suntek.efacecloud.model.DeviceEntity;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.efacecloud.util.VehicleUtil;

/**
 * @author wsh
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
public class DriverFaceMpProvider extends ExportGridDataProvider {

	public Map<String, Object> query(RequestContext context) throws Exception {
		
		PageQueryResult result = this.getData(context);
		return new PageQueryResult(result.getTotalSize(), render(result.getResultSet())).toMap();
		
	}

	@Override
	protected String buildCountSQL() {
		String sql = "select count(1) " + " from driver_capture where 1=1 " + this.getOptionalStatement();
		return sql;
	}

	@Override
	protected String buildQuerySQL() {
		String sql = "select xxzjbh, sbbh , jgrqsj, hphm as HPHM, hpys, cllx, csys, clpp," 
				+ " clzpp, zjwz, xbdm, nlddm, qjtpurl, cltpurl, rltpurl "
				+ " from driver_capture where 1=1 " + this.getOptionalStatement();
		return sql;
	}

	@Override
	protected void prepare(RequestContext context) {

		this.setDatasource(Constants.MPPDB_NAME);
		Map<String, Object> body = context.getParameters();
		context.putParameter("sort", " jgrqsj desc ");

		String beginTime = StringUtil.toString(body.get("beginTime"));
		String endTime = StringUtil.toString(body.get("endTime"));
		String devides = StringUtil.toString(body.get("kkbh"));
		String keywords = StringUtil.toString(body.get("searchText"));

		// 针对传入时间段进行处理
		String beginDay = StringUtil.toString(body.get("beginDay"));
		String endDay = StringUtil.toString(body.get("endDay"));
		String beginDayTime = StringUtil.toString(body.get("beginDayTime"));
		String endDayTime = StringUtil.toString(body.get("endDayTime"));
		if (!StringUtil.isNull(beginDay) && !StringUtil.isNull(endDay) && !StringUtil.isNull(beginDayTime) && !StringUtil.isNull(endDayTime)) {
			beginTime = beginDay + " " + beginDayTime + ":00";
			endTime = endDay + " " + endDayTime + ":00";
		}

		if (!StringUtil.isEmpty(devides)) {
			this.addOptionalStatement(" and sbbh in " + SqlUtil.getSqlInParams(devides));
			for (String deviceId : devides.split(",")) {
				this.addParameter(deviceId);
			}
		}

		if (!StringUtil.isEmpty(keywords)) {
			DeviceInfoDao resDao = new DeviceInfoDao();
			List<Map<String, Object>> deviceList = resDao.getDeviceIdByTypeAndKeyword(StringUtil.toString(Constants.DEVICE_TYPE_CAR), keywords);
			List<String> deviceIdList = new ArrayList<String>();
			for (Map<String, Object> map : deviceList) {
				deviceIdList.add(StringUtil.toString(map.get("DEVICE_ID")));
			}
			this.addOptionalStatement(" and sbbh in " + SqlUtil.getSqlInParams(devides));
			for (String deviceId : deviceIdList) {
				this.addParameter(deviceId);
			}
		}

		// 抓拍时间
		this.addOptionalStatement(" and (jgrqsj BETWEEN ? and ? )");
		this.addParameter(DateUtil.toDate(beginTime));
		this.addParameter(DateUtil.toDate(endTime));

		// 号牌号码
		String hphm = StringUtil.toString(body.get("hphm"));
		if (!StringUtil.isEmpty(hphm)) {
			String hphms = hphm.toUpperCase();
			this.addOptionalStatement(" and hphm LIKE ? ");
			this.addParameter(hphms + '%');
		}

		// 号牌颜色
		String hpys = StringUtil.toString(body.get("hpys"));
		if (!StringUtil.isEmpty(hpys)) {
			this.addOptionalStatement(" and hpys = ? ");
			this.addParameter(Integer.parseInt(hpys));
		}

		// 车辆类型
		String cllx = StringUtil.toString(body.get("cllx"));
		if (!StringUtil.isEmpty(cllx)) {
			this.addOptionalStatement(" and cllx = ? ");
			this.addParameter(cllx);
		}

		// 乘坐位置
		String driverRole = StringUtil.toString(body.get("driver_role"));
		if (!StringUtil.isEmpty(driverRole)) {
			this.addOptionalStatement(" and zjwz = ? ");
			this.addParameter(Integer.parseInt(driverRole));
		}

		// 性别
		String sex = StringUtil.toString(body.get("sex"));
		if (!StringUtil.isEmpty(sex)) {
			this.addOptionalStatement(" and xbdm = ? ");
			this.addParameter(Integer.parseInt(sex));
		}

		// 年龄
		String age = StringUtil.toString(body.get("age"));
		if (!StringUtil.isEmpty(age)) {
			this.addOptionalStatement(" and nlddm = ? ");
			this.addParameter(Integer.parseInt(age));
		}

		// 车身颜色
		String csys = StringUtil.toString(body.get("csys"));
		if (!StringUtil.isEmpty(csys)) {
			this.addOptionalStatement(" and csys = ? ");
			this.addParameter(new VehicleUtil().csysInteger.get(csys));
		}

	}

	private List<Map<String, Object>> render(List<Map<String, Object>> resultSet) throws Exception {

		List<Map<String, Object>> tempList = new ArrayList<Map<String, Object>>();

		for (Map<String, Object> map : resultSet) {
			Map<String, Object> tempMap = new HashMap<String, Object>();

			Date date = (Date) map.get("jgrqsj");
			tempMap.put("JGSK", date == null ? "" : DateUtil.dateToString(date));
			DeviceEntity device = (DeviceEntity) EAP.metadata.getDictModel(DictType.D_CAR, map.get("sbbh"), DeviceEntity.class);
			tempMap.put("DEVICE_ID", map.get("sbbh"));
			tempMap.put("DEVICE_NAME", StringUtil.toString(device.getDeviceName()));
			tempMap.put("KKMC", StringUtil.toString(device.getDeviceAddr()));
			tempMap.put("ORG_NAME", device.getOrgName());
			tempMap.put("INFO_ID", map.get("xxzjbh"));

			tempMap.put("HPHM", map.get("hphm"));
			tempMap.put("PIC_ABBREVIATE", ModuleUtil.renderImage(StringUtil.toString(map.get("qjtpurl"))));
			tempMap.put("PIC_DRIVER", ModuleUtil.renderImage(StringUtil.toString(map.get("rltpurl"))));
			tempMap.put("PIC_VEHICLE", ModuleUtil.renderImage(StringUtil.toString(map.get("cltpurl"))));
			tempMap.put("DRIVER_ROLE", ModuleUtil.renderDriverRole(map.get("zjwz")));
			tempMap.put("HPYS", EAP.metadata.getDictValue(DictType.V_PLATE_COLOR, StringUtil.toString(map.get("hpys"))));
			tempMap.put("CLLX_NAME", EAP.metadata.getDictValue(DictType.V_VEHICLE_TYPE, StringUtil.toString(map.get("cllx"))));
			tempMap.put("CLLX", StringUtil.toString(map.get("cllx")));
			tempMap.put("CAR_BRAND", map.get("clpp") + " " + map.get("clzpp"));
			tempMap.put("ZPPDM", map.get("clzpp"));
			tempMap.put("PPDM", map.get("clpp"));

			tempList.add(tempMap);
		}
		return tempList;

	}

}
