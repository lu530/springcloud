package com.suntek.efacecloud.test.service;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

public class FaceSpecialServiceTest extends JUnitBase {

	@Test
	public void testAddLib() {
		try {
			//新增
			String serviceName = "face/special/add";
			Map<Object, Object> params = new HashMap<>();
			params.put("DB_NAME", "swq");
			ServiceLog.debug("参数：" + params.toString());
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果：" + result);
		
			//修改
//			String serviceName = "face/special/add";
//			Map<Object, Object> params = new HashMap<>();
//			params.put("DB_NAME", "swq修改");
//			params.put("DB_ID", "ae8612a20c7441029b5205cf92c182d7");
//			
//			ServiceLog.debug("参数：" + params.toString());
//			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
//			ServiceLog.debug("结果：" + result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}

	@Test
	public void testDeleteLib() {
		try {
//			String serviceName = "face/special/delete";
//			Map<Object, Object> params = new HashMap<>();
//			params.put("DB_ID", "65ed7154c5ed4d579d6748debae9b6d7");
//			ServiceLog.debug("参数：" + params.toString());
//			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
//			ServiceLog.debug("结果：" + result);
			
			String serviceName = "face/special/delete";
			Map<Object, Object> params = new HashMap<>();
			params.put("DB_ID", "b47b8d2e33bd4661a3fc7a3793aeb93e");
			ServiceLog.debug("参数：" + params.toString());
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果：" + result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}

	@Test
	public void testGetAllInit() {
		try {
			String serviceName = "face/special/getAllInit";
			Map<Object, Object> params = new HashMap<>();
			params.put("elementId", "alllib");
			ServiceLog.debug("参数：" + params.toString());
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果：" + result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Override
	public void initParam() {
		setEapHome("C:/work/pci/tomcat_eface");
		setAppName(Constants.APP_NAME);
		setHost("172.16.64.61:9080");
		setUserName("admin");
	}

}
