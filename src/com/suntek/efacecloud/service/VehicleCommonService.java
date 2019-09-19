package com.suntek.efacecloud.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.suntek.eap.EAP;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.DeviceInfoDao;
import com.suntek.efacecloud.util.ModuleUtil;

/**
 * 车辆公共服务
 * efacecloud/rest/v6/vehicle/common
 * @author swq
 * @since 1.0.0
 * @version 2017-10-10
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "vehicle/common")
public class VehicleCommonService {
	
	private DeviceInfoDao deviceInfoDao = new DeviceInfoDao();
	
	@QueryService(id="getPlateType", description="检索号牌种类服务",type="remote")
	public void getPlateType(RequestContext context){
		String elementId = (String) context.getParameter("elementId");
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		Map<Object, Object> hpzl = EAP.metadata.getDictMap(DictType.V_VEHICLE_TYPE);
		Set<Object> set = hpzl.keySet();
		for(Object key:set){
			if (ModuleUtil.isChinese(StringUtil.toString(key))) {
				continue;
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("text", hpzl.get(key));
			map.put("value", key);
			result.add(map);
		}
		context.getResponse().putData(elementId, result);
	}
	
	@QueryService(id="getVehicleBrand", description="检索车辆品牌服务",type="remote")
	public void getVehicleBrand(RequestContext context){
		String elementId = (String) context.getParameter("elementId");
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		Map<Object,Object> zppInfo = EAP.metadata.getDictMap(DictType.V_SUB_BRAND);
		Set<Object> set = zppInfo.keySet();
		for(Object key:set){
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("text", zppInfo.get(key));
			map.put("value", key);
			result.add(map);
		}
		context.getResponse().putData(elementId, result);
	}
	
	@QueryService(id="getVehicleType", description="检索车辆类型服务",type="remote")
	public void getVehicleType(RequestContext context){
		String elementId = (String) context.getParameter("elementId");
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		Map<Object, Object> cllx = EAP.metadata.getDictMap(DictType.V_VEHICLE_TYPE);
		ServiceLog.debug("检索车辆类型服务 cllx:" + cllx);
		Set<Object> set = cllx.keySet();
		for(Object key:set){
			String cllxKey = StringUtil.toString(key);
			if (!ModuleUtil.isChinese(cllxKey)){
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("text", cllx.get(key));
				map.put("value", key);
				result.add(map);
			}
		}
		
		Collections.sort(result, (a,  b) ->  ((String) b.get("value")).compareTo((String) a.get("value")));
		
		context.getResponse().putData(elementId, result);
	}
	
	@QueryService(id="getNotVehicleType", description="检索非机动车类型",type="remote")
	public void getNotVehicleType(RequestContext context){
		String elementId = (String) context.getParameter("elementId");
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		Map<Object, Object> cllx= EAP.metadata.getDictMap(DictType.NV_VEHICLE_TYPE);
		Set<Object> set = cllx.keySet();
		for(Object key:set){
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("text", cllx.get(key));
			map.put("value", key);
			result.add(map);
		}
		context.getResponse().putData(elementId, result);
	}
	
	@QueryService(id="getNotVehicleColor", description="检索非机动车颜色",type="remote")
	public void getNotVehicleColor(RequestContext context){
		String elementId = (String) context.getParameter("elementId");
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		Map<Object, Object> csys= EAP.metadata.getDictMap(DictType.V_VEHICLE_COLOR);
		Set<Object> set = csys.keySet();
		for(Object key:set){
			String csysKey = StringUtil.toString(key);
			if (ModuleUtil.isChinese(csysKey)){
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("text", csysKey);
				map.put("value", csys.get(key));
				result.add(map);
			}
		}
		context.getResponse().putData(elementId, result);
	}
	
	@QueryService(id="getVehicleColor", description="检索机动车颜色",type="remote")
	public void getVehicleColor(RequestContext context){
		getNotVehicleColor(context);
	}
	
	@QueryService(id="getlampType", description="检索非机动车灯类型",type="remote")
	public void getLampType(RequestContext context){
		String elementId = (String) context.getParameter("elementId");
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		Map<Object, Object> lampType= EAP.metadata.getDictMap(DictType.NV_LAMP_TYPE);
		Set<Object> set = lampType.keySet();
		for(Object key:set){

			Map<String, Object> map = new HashMap<String, Object>();
			map.put("text", lampType.get(key));
			map.put("value", key);
			result.add(map);
		}
		context.getResponse().putData(elementId, result);
	}
	
	@QueryService(id="getColor", description="检索车身颜色服务",type="remote")
	public void getColor(RequestContext context){
		String elementId = (String) context.getParameter("elementId");
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		Map<Object, Object> csys = EAP.metadata.getDictMap(DictType.V_VEHICLE_COLOR);
		Set<Object> set = csys.keySet();
		for(Object key:set){
			if(ModuleUtil.isChinese(StringUtil.toString(key))) continue;
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("text", csys.get(key));
			map.put("value", key);
			result.add(map);
		}
		context.getResponse().putData(elementId, result);
	}
	
	@QueryService(id="getPlateColor", description="检索车牌颜色服务",type="remote")
	public void getPlateColor(RequestContext context){
		String elementId = (String) context.getParameter("elementId");
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		Map<Object, Object> hpys = EAP.metadata.getDictMap(DictType.V_PLATE_COLOR);
		Set<Object> set = hpys.keySet();
		for(Object key:set){
			String hpysKey = StringUtil.toString(key);
			if (ModuleUtil.isChinese(hpysKey))  continue;
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("text", hpys.get(key));
			map.put("value", key);
			result.add(map);
		}
		context.getResponse().putData(elementId, result);
	}
	
	@BeanService(id="getZppByName" ,description="子品牌列表",type="remote")
	public void getZppInfoListByName(RequestContext context)
	{
		String name = (String) context.getParameter("name");

		List<Map<String, Object>> ret = deviceInfoDao.getZppInfoListByName(name);
		
		if(ret.isEmpty()) {
			context.getResponse().setMessage("搜索结果为空！");
		}

		ServiceLog.debug(ret);
		context.getResponse().putData("ret", ret);
	}

}
