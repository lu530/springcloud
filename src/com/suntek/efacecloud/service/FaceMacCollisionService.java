package com.suntek.efacecloud.service;

import java.text.Collator;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.elasticsearch.client.transport.TransportClient;

import com.suntek.eap.EAP;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.dict.DictType;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.DeviceRelatDao;
import com.suntek.efacecloud.util.CommonUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.EsDateUtil;
import com.suntek.tactics.api.TacticsEnum;
import com.suntek.tactics.common.CollisionResult;
import com.suntek.tactics.manager.VWOperationManager;

import net.sf.json.JSONArray;

/**
 * 人脸与wifi碰撞服务
 * 
 * @author wudapei
 * @since 1.0
 * @version 2018
 * @Copyright (C)2018 , Suntektech
 */

@LocalComponent(id = "collision/face", since = "6.0")
public class FaceMacCollisionService {

	DeviceRelatDao dao =new DeviceRelatDao();
	
	@SuppressWarnings("unchecked")
	@QueryService(id = "wifi", description = "获取人脸与MAC碰撞详情", since = "1.0", type="remote")
	public void collision(RequestContext context) throws Exception {
		ServiceLog.debug("获取MAC碰撞详情服务开始");
		String params = StringUtil.toString(context.getParameter("PARAMS"));
		String sortType = StringUtil.toString(context.getParameter("sortType"));
		int interval = Integer.parseInt(StringUtil.toString(context.getParameter("COLLISION_INTERVAL"), "5"));
		List<Map<String, Object>> queryList = JSONArray.fromObject(params);
		List<Map<String,Object>>  timeDeviceIdList = new ArrayList<Map<String,Object>>();
		List<Map<String, Object>> wifiDeviceList = dao.getWifiDevicesByCameraIds(queryList.stream().map(x->x.get("DEVICE_ID")).collect(Collectors.toList()));
		Map<String, List<Map<String, Object>>> wifiDeviceMap = wifiDeviceList.stream().collect(Collectors.groupingBy(o -> StringUtil.toString(o.get("CAMERA_DEVICE_ID"))));
		for (Map<String, Object> map : queryList) {
			String time = StringUtil.toString(map.get("TIME"));
			String deviceId = StringUtil.toString(map.get("DEVICE_ID"));
			List<Map<String, Object>> wifiDevIds = wifiDeviceMap.get(deviceId);
			if (null != wifiDevIds && !wifiDevIds.isEmpty()) {
				handleParameters(timeDeviceIdList, time, wifiDevIds, interval);
			}
		}
		if (timeDeviceIdList.size() < 2) {
			ServiceLog.debug("获取MAC碰撞详情  MAC碰撞信息过少 需要增加传入参数大小或增加关联设备");
			context.getResponse().setWarn("MAC碰撞信息过少  需要增加碰撞条件或添加关联设备");
			return;
		}
		int limit = Integer.parseInt(StringUtil.toString(AppHandle.getHandle(Constants.APP_NAME).getProperty("MAC_COLLISION", Constants.COLLISION_NUM))); 
		if (timeDeviceIdList.size() > limit) {
			ServiceLog.debug("获取MAC碰撞详情  MAC碰撞信息过多 需要减少传入参数大小或减少关联设备");
			context.getResponse().setWarn("MAC碰撞信息过多 需要减少碰撞条件或减少关联设备");
			return;
		}
		Map<String,Object> parameters = new HashMap<String,Object>();
		parameters.put("collisionTimes", 2);
		parameters.put("timeDeviceIdList", timeDeviceIdList);
		parameters.put("topN", 		  	100);
		
		TransportClient client = (TransportClient) EAP.bigdata.getClient();
		
		ServiceLog.debug("调用datacollision的参数:" + parameters.toString());
		
		CollisionResult result = VWOperationManager.runOperation(
				parameters, client, TacticsEnum.WIFI_COLLISION);
		
		if (result == null) {
			ServiceLog.error("MAC碰撞服务返回空对象:" + result);
			context.getResponse().setError("大数据碰撞服务异常");
			return;
		}

		if (result.getCode() != com.suntek.tactics.common.Constants.SUCCESS) {
			ServiceLog.error("MAC碰撞服务返回状态码显示失败， 原因->" + result.getMessage());
			context.getResponse().setError(result.getMessage());
			return;
		}
		
		//反查索引并渲染结果以便于页面展示
		Map<String, Object> ret = new HashMap<String,Object>();
		try {
			if ("date".equals(sortType)) {
				ret = renderDateGroup(result.getList()); 
			}else{
				ret = renderAddrGroup(result.getList()); 
			}
		} catch (Exception e) {
			ret = renderError();
			ServiceLog.error("获取MAC碰撞详情服务出错");
		}
		
		ServiceLog.debug("调用datacollision的返回结果size:" + result.getList().size());
		ServiceLog.debug("获取MAC碰撞详情服务结束");
		context.getResponse().putData("data", ret);
	}

	/**
	 * 参数处理
	 * @param timeDeviceIdList
	 * @param time
	 * @param deviceIds
	 * @throws Exception
	 */
	private void handleParameters(List<Map<String,Object>> timeDeviceIdList, String time, List<Map<String, Object>> deviceIds, int interval) throws Exception{
//		int interval = Integer.valueOf(MapConfig.getByKey("FACE_N_WIFI_INTERVAL", "1"));
		
		Long[] times = CommonUtil.minuteBeforeAndAfterLong(interval, time);
		
		String beginTime = DateUtil.dateToString(new SimpleDateFormat("yyMMddHHmmss").parse(StringUtil.toString(times[0])), DateUtil.standard_style);
		String endTime = DateUtil.dateToString(new SimpleDateFormat("yyMMddHHmmss").parse(StringUtil.toString(times[1])), DateUtil.standard_style);
		for (Object deviceId : deviceIds.stream().map(x -> x.get("DEVICE_ID")).collect(Collectors.toSet())) {
			Map<String, Object> paramsMap = new HashMap<String, Object>();
			paramsMap.put("beginTime", beginTime);
			paramsMap.put("endTime", endTime);
			paramsMap.put("deviceId", deviceId);
			timeDeviceIdList.add(paramsMap);
		}
	}


	@SuppressWarnings("unchecked")
	private Map<String, Object> renderDateGroup(List<Map<String, Object>> list) throws Exception{
		
		Map<String,Object> ret = getAllInfoList(list);
		List<Map<String,Object>> allCollisionList = (List<Map<String, Object>>) ret.get("allCollisionList");
		
		List<Map<String, Object>> groupRetList = new ArrayList<Map<String,Object>>();
		//按时间分组
		Map<String,List<Map<String,Object>>> dateGroup = allCollisionList.stream().collect(
				Collectors.groupingBy (InfoMap -> StringUtil.toString(InfoMap.get("JGRQ"))));
		
		for(Entry<String, List<Map<String, Object>>> dateGroupEntry : dateGroup.entrySet()){
			
			String date = dateGroupEntry.getKey();
			List<Map<String, Object>> eachDaterRetList = dateGroupEntry.getValue();
			
			//按地点分组
			List<Map<String, Object>> addrRetList = renderResult(eachDaterRetList);
			
			Map<String, Object> dateGroupRet = new HashMap<>();
			dateGroupRet.put("date", date);
			dateGroupRet.put("dateDetail", addrRetList);
			groupRetList.add(dateGroupRet);
		}
		
		ret.put("record", groupRetList);
		ret.put("code", "0");
		ret.remove("allCollisionList");
		return sortMapByKey(ret);
	}
	
	@SuppressWarnings("unchecked")
	private Map<String, Object> renderAddrGroup(List<Map<String, Object>> list) throws Exception{
		
		Map<String,Object> ret = getAllInfoList(list);
		List<Map<String,Object>> allCollisionList = (List<Map<String, Object>>) ret.get("allCollisionList");
		
		List<Map<String, Object>> addrRetList = renderResult(allCollisionList);
		
		ret.put("record", addrRetList);
		ret.put("code", "0");
		ret.remove("allCollisionList");
		
		return sortMapByKey(ret);
	}

	private List<Map<String, Object>> renderResult(List<Map<String,Object>> list){
		
		List<Map<String, Object>> addrRetList = new ArrayList<Map<String,Object>>();
	
		//按地点分组
		Map<String, List<Map<String, Object>>> addrGroup = list.stream().collect(
				Collectors.groupingBy(dateMap -> StringUtil.toString(dateMap.get("DEVICE_ID"))));
		
		for(Entry<String, List<Map<String, Object>>> addrGroupEntry : addrGroup.entrySet()){
			String deviceId = addrGroupEntry.getKey();
			List<Map<String, Object>> eachAddrrRetList = addrGroupEntry.getValue();
			//按MAC分组
			Map<String,List<Map<String,Object>>> macGroup = eachAddrrRetList.stream().collect(
					Collectors.groupingBy(dateMap -> StringUtil.toString(dateMap.get("MAC"))));
			
			List<Map<String, Object>> macRetList = new ArrayList<Map<String,Object>>();
			for(Entry<String, List<Map<String, Object>>> mEntry : macGroup.entrySet()){
				Map<String, Object> macRet = new HashMap<String, Object>();
				macRet.put("macTimes", mEntry.getValue().size());
				macRet.put("macDetail", mEntry.getValue());
				macRet.put("mac", mEntry.getKey());
				macRetList.add(macRet);
			}
		
			Collections.sort(macRetList, new Comparator<Map<String, Object>>() {
				@Override
				public int compare(Map<String, Object> o1, Map<String, Object> o2) {
					String time1 = StringUtil.toString(o1.get("macTimes"));
					String time2 = StringUtil.toString(o2.get("macTimes"));
					return time2.compareTo(time1);
				}
			});
			
			Map<String, Object> addrGroupRet = new HashMap<>();
			addrGroupRet.put("addr", EAP.metadata.getDictMap(DictType.D_WIFI, deviceId).get("DEVICE_ADDR"));
			addrGroupRet.put("addrDetail", macRetList);
			addrRetList.add(addrGroupRet);
		}
		
		return addrRetList;
	}

	private Map<String, Object> sortMapByKey(Map<String,Object> map){
		
		if(null == map || map.isEmpty()){
			return null; 
		}
		
		Map<String, Object> sortMap = new TreeMap<String, Object>(
                new MapKeyComparator());
		
		sortMap.putAll(map);

        return sortMap;
		
	}
	
	static class MapKeyComparator implements Comparator<String>{

	    @Override
	    public int compare(String str1, String str2) {
	        
	    	if(CommonUtil.isContainChinese(str1) && CommonUtil.isContainChinese(str1)){
	    		Collator instance = Collator.getInstance(Locale.CHINA);  
		        return instance.compare(str1, str2);
	    	}
	        return str2.compareTo(str1);
	    }
	}


	/**
	 * 获取所有碰撞结果记录
	 * @param list  碰撞结果
	 * @param ret   返回结果集
	 * @throws ParseException
	 */
	@SuppressWarnings("unchecked")
	private Map<String,Object> getAllInfoList(List<Map<String, Object>> list) throws ParseException{
		
		Map<String,Object> ret = new HashMap<String,Object>();
		
		if(null == list || list.size() == 0){
			throw new NullPointerException("碰撞结果为空！");
		}
		
		List<Map<String,Object>> collisionRet = new ArrayList<Map<String,Object>>();
		List<Map<String,Object>> allCollisionList = new ArrayList<Map<String,Object>>();
		for(Map<String,Object> map:list){
			
			Map<String,Object> collisionMap = new HashMap<String,Object>();
			String mac = StringUtil.toString(map.get("mac"));
			String times = StringUtil.toString(map.get("times"));
			
			collisionMap.put("mac", mac);
			collisionMap.put("times", times);
			collisionRet.add(collisionMap);
			
			if(Integer.valueOf(times) >= 2){
				List<Map<String,Object>> infoList = (List<Map<String,Object>>) map.get("infoList");
				
				for(Map<String,Object> info:infoList){
					String deviceId = StringUtil.toString(info.get("DEVICE_ID"));
					String jgsj = StringUtil.toString(info.get("JGSJ"));
					String jgrq = StringUtil.toString(info.get("JGRQ"));
					String jgsk = EsDateUtil.getTime(jgrq, jgsj);
					
					Map<Object, Object> device =  EAP.metadata.getDictMap(DictType.D_WIFI, deviceId);
					info.put("DEVICE_NAME", StringUtil.toString(device.get("DEVICE_NAME")));
					info.put("DEVICE_ADDR", StringUtil.toString(device.get("DEVICE_ADDR")));
					info.put("LATITUDE", StringUtil.toString(device.get("LATITUDE")));
					info.put("LONGITUDE", StringUtil.toString(device.get("LONGITUDE")));
					info.put("CAP_TIME", jgsk);
//					info.put("JGRQ", jgsk.substring(0, 10));
				}
				allCollisionList.addAll(infoList);
			}
		}
		
		ret.put("collisionRet", collisionRet);
		ret.put("allCollisionList", allCollisionList);
		return ret;
	}
	
	public Map<String,Object> renderError(){
		Map<String,Object> ret = new HashMap<String,Object>();
		ret.put("code", "1");
		ret.put("collisionRet", Collections.emptyMap());
		ret.put("record", Collections.emptyMap());
		return ret;
	}
	
}
