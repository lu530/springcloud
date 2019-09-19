package com.suntek.efacecloud.test.service;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

public class FaceArchivesServiceTest extends JUnitBase {

	//@Test
	public void testAdd() {
		
		try {
			String serviceName = "face/archives/addPerson";
			Map<Object, Object> params = new HashMap<>();
			params.put("BIRTHDAY", "1993-06-22");
			params.put("DATA_SOURCE", "2");
			params.put("IDENTITY_ID", "440421199306228013");
			params.put("IDENTITY_TYPE", "1");
			params.put("NAME", "刘德华");
			params.put("PERMANENT_ADDRESS", "440403");
			params.put("PERSON_ID", "");
			params.put("PERSON_TAG", "01");
			params.put("PERSON_TAG_DB", "NON_INVOLVED_DB");
			params.put("PIC", "http://172.16.56.204:8088/g1/M00/00031001/20170607/rBA4zFk3d-2IZb00AAATuNkSM9QAABDVQAA_PgAABPQ052.jpg");
			params.put("PRESENT_ADDRESS", "440403");
			params.put("SEX", "1");
			ServiceLog.debug("参数：" + params.toString());
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果：" + result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	//@Test
	public void testDelete() {
		
		try {
			String serviceName = "face/archives/deletePerson";
			Map<Object, Object> params = new HashMap<>();
			params.put("PERSON_ID", "203172907806969856");
			ServiceLog.debug("参数：" + params.toString());
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果：" + result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	//@Test
	public void testPersonDetail() {
		
		try {
			String serviceName = "face/archives/personDetail";
			Map<Object, Object> params = new HashMap<>();
			params.put("PERSON_ID", "204295711610424960");
			ServiceLog.debug("参数：" + params.toString());
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果：" + result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Test
	public void testPersonImport() {
		
		try {
			String serviceName = "face/archives/import";
			Map<Object, Object> params = new HashMap<>();
			params.put("ZIP_PATH", "d:/Desktop.zip");
			params.put("PERSON_TAG", "01");
			params.put("PERSON_TAG_DB", "NON_INVOLVED_DB");
			ServiceLog.debug("参数：" + params.toString());
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果：" + result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	//@Test
	public void testPersonPicDelete() {
			
			try {
				String serviceName = "face/archives/picDelete";
				Map<Object, Object> params = new HashMap<>();
				params.put("INFO_ID", "204295711610424960");
				ServiceLog.debug("参数：" + params.toString());
				String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
				ServiceLog.debug("结果：" + result);
			} catch (Exception e) {
				ServiceLog.error(e);
			}
		}

	@Override
	public void initParam() {
		setEapHome("D:/swq/tomcat_efacecloud");
		setAppName(Constants.APP_NAME);
		setHost("172.16.64.88:9080");
		setUserName("admin");
	}

}
