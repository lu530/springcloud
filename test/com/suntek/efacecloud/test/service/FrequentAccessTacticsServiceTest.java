package com.suntek.efacecloud.test.service;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

public class FrequentAccessTacticsServiceTest extends JUnitBase {

	@Test
	public void testQuery() {
		try {
			String serviceName = "technicalTactics/frequencyAccess/query";
			Map<Object, Object> params = new HashMap<>();
			params.put("BEGIN_TIME", "2017-07-15 00:00:00");
			params.put("END_TIME", "2017-07-19 23:59:59");
			params.put("DEVICE_IDS", "44000000001310000002");
			params.put("NUMS", "2");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}	
	
	@Test
	public void testGetMsgByIds(){
		try {
			String serviceName = "technicalTactics/frequencyAccess/getMsgByIds";
			String ids = "204252004039315072,204252007998738048,204253962124971648,204262830062227072,204262848190008960";
			Map<Object, Object> params = new HashMap<>();
			params.put("IDS", ids);
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
