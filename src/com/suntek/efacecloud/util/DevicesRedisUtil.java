package com.suntek.efacecloud.util;

import java.util.*;
import java.util.stream.Collectors;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.LogFactory;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.log.Log;
import org.apache.log4j.Logger;

public class DevicesRedisUtil {

	private static final String DEVICE_REDIS_PREFIX = "SYS_USER_DEVICE_";

	/**
	 * 是否使用中台系统管理权限接口获取用户菜单
	 */
	private final static String isUseNewFunc = "1";

	public static Set<String> getDeviceList(String userCode, Object deviceType) {

		//是否采用新接口获取菜单权限，1:是，0：否
		String isOpenConf = AppHandle.getHandle(Constants.CONSOLE).getProperty("IS_USE_NEW_PERMISION", "0");
		ServiceLog.info("config ---> isOpenConf = " + isOpenConf);

		if(isUseNewFunc.equals(isOpenConf)) {
			return getDeviceListByUserCode(userCode, StringUtil.toString(deviceType));
		}

		Set<String> set = new HashSet<String>();
		String str = EAP.redis.get(DEVICE_REDIS_PREFIX + StringUtil.toString(userCode));
		if(StringUtil.isNull(str)) {
			return set;
		}
		JSONObject object = JSONObject.parseObject(str);
		JSONArray arry = object.getJSONArray(StringUtil.toString(deviceType));
		for (Object temp : arry) {
			set.add(StringUtil.toString(temp));
		}
		return set;
	}

	public static Set<String> getDeviceListByUserCode(String userCode, String deviceType){
		StringBuffer url = new StringBuffer(1024);
		String addr = AppHandle.getHandle(Constants.CONSOLE).getProperty("THE_UNIT_PERMISION_URL", "");
		String apiStr = "/sysmanager/inner/sysStructureInfo/getUserDeviceByOrgCode?IsPage=false";

		url.append(addr).append(apiStr).append("&userCode=" + userCode);

		if(!StringUtil.isEmpty(deviceType)){
			String deviceSpeicaltypeDict = Constants.deviceTypeMap.get(deviceType);
			url.append("&deviceSpeicaltypeDict=" + deviceSpeicaltypeDict);
		}

		try {
			long requestBeginTime = System.currentTimeMillis();
			String structTreeStr = HttpUtil.HttpGet(url.toString());
			long requestEndTime = System.currentTimeMillis();

			Log.deviceLog.info("接口：" + url.toString() + "，耗时：" + (requestEndTime - requestBeginTime) + "ms");

			List<Map<String, Object>> ret = CommonUtil.getData(structTreeStr);
			if(null != ret && ret.size() > 0) {
				return ret.stream().map(o -> StringUtil.toString(o.get("VideodevGbId"))).collect(Collectors.toSet());
			}
		}catch(Exception e) {
			Log.deviceLog.error("获取用户权限设备列表失败！", e);
		}

		return Collections.emptySet();
	}

}
