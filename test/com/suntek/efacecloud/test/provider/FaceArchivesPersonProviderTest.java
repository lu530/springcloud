package com.suntek.efacecloud.test.provider;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

public class FaceArchivesPersonProviderTest extends JUnitBase {

	@Test
	public void testPrepareRequestContext() {
		try {
			String serviceName = "face/archivesPerson/getData";
			Map<Object, Object> params = new HashMap<>();
			params.put("pageNo", "1");
			params.put("pageSize", "10");
			params.put("SEX", "1");
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
