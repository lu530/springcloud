package com.suntek.efacecloud.rest;

import java.util.HashMap;
import java.util.Map;

import com.suntek.efacecloud.rest.handle.AppSyncHandler;

/**
 * APP调用接口定义
 * @author lx
 * @since
 * @version 2017年7月25日
 * @Copyright (C)2017 , Suntektech
 */
public class ServiceRepository 
{
	private static boolean isInit = false;
	
	private static Map<String, BaseHandler> proxy = new HashMap<String, BaseHandler>();

	public static void init() 
	{
		if (!isInit) {
			proxy.put("appSync", new AppSyncHandler());
			isInit = true;
		}
	}

	public static boolean isRegist(String serviceId) 
	{
		return proxy.containsKey(serviceId);
	}

	public static BaseHandler get(String serviceId) 
	{
		return proxy.get(serviceId);
	}
}
