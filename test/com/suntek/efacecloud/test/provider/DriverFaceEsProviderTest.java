package com.suntek.efacecloud.test.provider;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

public class DriverFaceEsProviderTest extends JUnitBase {

	@Test
	public void testPrepareRequestContext() {
		try {
			String serviceName = "face/driver/query";
			Map<Object, Object> params = new HashMap<>();
			params.put("pageNo", "1");
			params.put("pageSize", "1");
			params.put("beginTime", "2017-09-01 00:00:00");
			params.put("endTime", "2017-09-30 23:59:59");
			params.put("topN", "1");
			params.put("fileUrl", "http://172.16.58.61:8088/g1/M00/00012001/20171009/rBA6PVnbIKmIUnAoAABMUGMiMesAAApzAK6omYAAExo338.jpg");
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
