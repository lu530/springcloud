package com.suntek.efacecloud.test.provider;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

public class NonMotorFaceEsProviderTest extends JUnitBase {

	@Test
	public void testPrepareRequestContext() {
		try {
			String serviceName = "face/non_motor/query";
			Map<Object, Object> params = new HashMap<>();
			params.put("pageNo", "1");
			params.put("pageSize", "10");
			params.put("beginTime", "2017-09-01 00:00:00");
			params.put("endTime", "2017-09-30 23:59:59");
			params.put("topN", "1");
			params.put("fileUrl", "http://172.16.56.180:8088/g1/M00/00012001/20171010/rBA4tFncgpCIWei-AAAWps7fkLMAABEmQNXWI0AABa-908.jpg");
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
		setHost("172.16.64.101:9080");
		setUserName("admin");
		setPassword("suntek12");
	}

}
