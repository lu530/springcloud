package com.suntek.efacecloud.test.service;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

/**
 * 
 * @author lx
 * @Description: 
 * @since 
 * @version 2017年7月12日
 * @Copyright (C)2017 , Suntektech
 */
public class FacePersonTagServiceTest extends JUnitBase 
{
	@Test
	public void testOne2One(){
		try {
			String serviceName = "face/personTag/list";
			Map<Object, Object> params = new HashMap<>();
			params.put("elementId", "222222223333");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}

	@Override
	public void initParam() {
		setEapHome("D:/eclipse/tomcat/tomcat_efaceclound");
		setHost("127.0.0.1:9080");
		setUserName("admin");
		setAppName(Constants.APP_NAME);
	}

}
