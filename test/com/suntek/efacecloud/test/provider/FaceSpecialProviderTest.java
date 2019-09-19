package com.suntek.efacecloud.test.provider;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

public class FaceSpecialProviderTest extends JUnitBase{

	@Test
	public void test() {
		try {
			String serviceName = "face/special/getData";
			Map<Object, Object> params = new HashMap<>();
			params.put("pageNo", "1");
			params.put("pageSize", "10");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Override
	public void initParam() {
		setEapHome("F:/uspp_faceBigData/tomcat_efaceclound");
		setHost("127.0.0.1:9080");
		setUserName("admin");
		setAppName(Constants.APP_NAME);
	}

}
