package com.suntek.efacecloud.test.service;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

public class RegionCollsionServiceTest extends JUnitBase{
	
	@Test
	public void testQuery() {
		try {
			String serviceName = "technicalTactics/regionCollsion/query";
			Map<Object, Object> params = new HashMap<>();
			params.put("BEGIN_TIMES", "2017-07-15 00:00:00_2017-07-15 00:00:00");
			params.put("END_TIMES", "2017-07-18 23:59:59_2017-07-18 23:59:59");
			params.put("DEVICE_IDS", "44000000001310000002_44000000001310000002");
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
		setHost("172.16.64.90:9080");
		setUserName("admin");
		setAppName(Constants.APP_NAME);
	}
}
