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
 * @author wangsh
 * @Description: 
 * @since 
 * @version 2017年6月27日
 * @Copyright (C)2017 , Suntektech
 */

public class FaceTerminalServiceTest extends JUnitBase {

	@Test
	@Ignore
	public void testDelete(){
		try {
			String serviceName = "face/terminal/delete";
			Map<Object, Object> params = new HashMap<>();
			params.put("INFO_ID", "202004581276732928");
			
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Test
	@Ignore
	public void testUpdate(){
		try {
			String serviceName = "face/terminal/add";
			Map<Object, Object> params = new HashMap<>();
			params.put("INFO_ID", "202004581276732928");
			params.put("PIC", "http://172.16.56.204:8088/g1/M00/00031001/20170510/rBA4zFkSjK2IMD_dAABtYczxmgEAABB1wAAvigAAG15782.jpg");
			params.put("NAME", "测试2");
			params.put("SEX", "1");
			params.put("IDENTITY_TYPE", "1");
			params.put("IDENTITY_ID", "440921199107052415");
			params.put("BIRTHDAY", "1991-07-05");
			params.put("PERMANENT_ADDRESS", "440108");
			params.put("PRESENT_ADDRESS", "440923");
			params.put("PERSON_TAG", "01,02,06");
			
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Test
	public void testDetail(){
		try {
			String serviceName = "face/terminal/detail";
			Map<Object, Object> params = new HashMap<>();
			params.put("INFO_ID", "202015449238490624");
			params.put("PERSON_TAG", "01 07");
			
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}

	@Test
	@Ignore
	public void testAdd() {
		try {
			String serviceName = "face/terminal/add";
			Map<Object, Object> params = new HashMap<>();
			params.put("INFO_ID", "");
			params.put("PIC", "http://172.16.56.203/fs/g1/M00/00002000/20170711/rBA4zFlkPnmINNqiAAAV-88j1nwAABM6wABTaEAABYT298.jpg");
			params.put("NAME", "测试33333");
			params.put("SEX", "2");
			params.put("IDENTITY_TYPE", "1");
			params.put("IDENTITY_ID", "440983198706081327");
			params.put("BIRTHDAY", "1987-06-08");
			params.put("PERMANENT_ADDRESS", "440983");
			params.put("PRESENT_ADDRESS", "440106");
			params.put("PERSON_TAG", "01,07");
			
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