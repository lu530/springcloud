package com.suntek.efacecloud.test.service;

import java.util.HashMap;
import java.util.Map;

import org.junit.Ignore;
import org.junit.Test;

import com.suntek.eap.EAP;
import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

public class FaceStatisticServiceTest extends JUnitBase {
	
	@Test
	public void testGetFaceCapture() {
		try {
			String serviceName = "face/statistic/captureData";
			Map<Object, Object> params = new HashMap<>();
//			params.put("BEGIN_TIME", "2017-07-04 19:53:50");
			params.put("END_TIME", "2017-08-10 19:53:50");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Test
	@Ignore
	public void testGetAreaFaceData() {
		try {
			String serviceName = "face/statistic/areaFace";
			Map<Object, Object> params = new HashMap<>();
//			params.put("BEGIN_TIME", "2017-04-07 00:00:00");
//			params.put("END_TIME", "2017-04-07 23:59:59");
//			params.put("ORG_CODE", "4401");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Test
	@Ignore
	public void testGetStatisticByIndice() {
		try {
			String serviceName = "face/statistic/getStatisticByIndice";
			Map<Object, Object> params = new HashMap<>();
			params.put("BEGIN_TIME", "2017-07-25 19:53:50");
			params.put("END_TIME", "2017-08-01 19:53:50");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Test
	@Ignore
	public void testStatisticLatestFaceData() {
		try {
			String serviceName = "face/statistic/statisticLatestFaceData";
			Map<Object, Object> params = new HashMap<>();
			params.put("BEGIN_TIME", "2017-06-02 19:53:50");
			params.put("END_TIME", "2017-08-02 19:53:50");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	
	@Test
	@Ignore
	public void testCameraDevice() {
		try {
			String serviceName = "face/statistic/cameraDevice";
			Map<Object, Object> params = new HashMap<>();
//			params.put("END_TIME", "2017-8-2 19:53:50");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}


	@Override
	public void initParam() {
		setEapHome("D:/Eclipse/tomcat-7.0.40");
		setHost("127.0.0.1:9080");
		setUserName("admin");
		setAppName(Constants.APP_NAME);
	}

}
