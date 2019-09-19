package com.suntek.efacecloud.test.service;

import java.util.HashMap;
import java.util.Map;

import org.junit.Ignore;
import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

/**
 * 
 * @author lx
 * @Description: 
 * @since 
 * @version 2017年6月27日
 * @Copyright (C)2017 , Suntektech
 */
public class FaceDispatchedAlarmServiceTest extends JUnitBase {
	
	@Test
	@Ignore
	public void getAlarmStatistics(){
		try {
			String serviceName = "face/dispatchedAlarm/alarmStatistic";
			Map<Object, Object> params = new HashMap<>();
			params.put("STATISTIC_TYPE", 3);
			params.put("DEVICE_IDS", "44000000001310000002,44000000001310000001");
			params.put("DB_IDS", "41f7500e6c99430c8abcd1d86379ec3d,1111");
			params.put("BEGIN_TIME", "2017-07-10");
			params.put("END_TIME", "2017-07-14");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Test
	@Ignore
	public void getStatistics(){
		try {
			String serviceName = "face/dispatchedFrequencyDetail/statistics";
			Map<Object, Object> params = new HashMap<>();
			params.put("IDENTITY_ID", "445121198009114936");
			params.put("BEGIN_TIME", "2017-07-13");
			params.put("END_TIME", "2017-07-13");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Test
	@Ignore
	public void getDbList(){
		try {
			String serviceName = "face/dispatchedAlarm/dbList";
			Map<Object, Object> params = new HashMap<>();
			params.put("elementId", "ces");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Test
	@Ignore
	public void alarmDetail(){
		try {
			String serviceName = "face/dispatchedAlarm/detail";
			Map<Object, Object> params = new HashMap<>();
			params.put("ALARM_ID", "1e7f10460bcf4a0dbb20fe6f615225e5");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}

	@Test
	public void testConfirm(){
		try {
			String serviceName = "face/dispatchedAlarm/confirm";
			Map<Object, Object> params = new HashMap<>();
			params.put("ALARM_ID", "6717145f9b22425e92d9d1d5a3b04d2e");
			params.put("IDENTITY_ID", "411526199008077117");
			params.put("PERSON_NAME", "测试");
			params.put("PERMANENT_ADDRESS", "411526");
			params.put("PRESENT_ADDRESS", "440106");
			params.put("ALARM_IMG", "http://172.16.58.179:8088/g1/M00/000003E8/20170715/rBA6s1lprwmIETI8AABRsd1BM2MAAAHGQCOTSoAAFHJ640.jpg");
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
