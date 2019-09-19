package com.suntek.efacecloud.test.service;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

public class FollowPersonServiceTest extends JUnitBase {

	//@Test
	public void testQuery() {
		try {
			String serviceName = "technicalTactics/personFollow/query";
			Map<Object, Object> params = new HashMap<>();
			params.put("BEGIN_TIME", "2017-07-17 00:00:00");
			params.put("END_TIME", "2017-07-17 23:59:59");
			params.put("PIC", "http://172.16.56.203/fs/g1/M00/00041001/20170715/rBA4zFlptKeIdEqgAABJyN9OW6kAABN7gAAAAAAAEng302.jpg");
			params.put("DEVICE_ID", "44000000001310000002");
			params.put("THRESHOLD", "20");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Test
	public void testAnalysis() {
		try {
			String serviceName = "technicalTactics/personFollow/togetherAnalysis";
			Map<Object, Object> params = new HashMap<>();
			params.put("RECORD_ID", "{'LIST':[{'CAPTURE_TIME':'2017-07-15 13:59:14','ORIGINAL_DEVICE_ID':'44010000001310000002'},{'CAPTURE_TIME':'2017-07-15 14:04:46','ORIGINAL_DEVICE_ID':'44010000001310000002'},{'CAPTURE_TIME':'2017-07-15 14:04:49','ORIGINAL_DEVICE_ID':'44010000001310000002'}]}");
			params.put("TOGETHER_MINUTE", "10");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Override
	public void initParam() {
		setEapHome("D:/swq/tomcat_efacecloud");
		setAppName(Constants.APP_NAME);
		setHost("172.16.64.69:9080");
		setUserName("admin");
	}

}
