package com.suntek.efacecloud.test.provider;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

public class FaceArchivesPicEsProviderTest extends JUnitBase {

	@Test
	public void testPrepareRequestContext() {
		try {
			String serviceName = "face/archivesPic/query";
			Map<Object, Object> params = new HashMap<>();
			params.put("pageNo", "1");
			params.put("pageSize", "10");
			params.put("THRESHOLD", "20");
			params.put("IMG", "http://172.16.58.179:8088/g1/M00/00000000/00000009/rBA6s1lwHQSAShQJAABJyN9OW6k023.JPG");
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
		setHost("172.16.58.179:9080");
		setUserName("admin");
	}

}
