package com.suntek.efacecloud.util;

import java.util.HashSet;
import java.util.Set;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.util.StringUtil;

public class DevicesRedisUtil {

	private static final String DEVICE_REDIS_PREFIX = "SYS_USER_DEVICE_";

	public static Set<String> getDeviceList(String userCode, Object deviceType) {
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

}
