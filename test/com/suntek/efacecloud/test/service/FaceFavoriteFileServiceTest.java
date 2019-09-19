package com.suntek.efacecloud.test.service;

import java.util.HashMap;
import java.util.Map;

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

public class FaceFavoriteFileServiceTest extends JUnitBase {


	@Test
	public void testPrepareRequestContext() {
		try {
			//收藏夹人脸新增测试
			/*String serviceName = "face/favoriteFile/add";
			Map<Object, Object> params = new HashMap<>();
			params.put("PIC", "http://172.16.56.222:9080/staticRes/image/person/photo/12.jpg");
			params.put("FAVORITE_ID", "33a6ca100b40414babc4754ea9e80a78");
			params.put("INFO_ID", "");
			params.put("SOURCE_DB_ID", "1");
			params.put("SOURCE_DB_NAME", "收藏夹1");
			params.put("DISPATCHED_DB_ID", "1");
			params.put("DISPATCHED_DB_NAME", "收藏夹1");
			params.put("DEVICE_ID", "1");
			params.put("DEVICE_NAME", "收藏夹1");
			params.put("NAME", "说得对");
			params.put("SEX", "1");
			params.put("IDENTITY_TYPE", "1");
			params.put("IDENTITY_ID", "123456789098765");
			params.put("PERMANENT_ADDRESS", "浙江");
			params.put("PRESENT_ADDRESS", "江西");
			params.put("CAPTURE_PIC", "1");
			params.put("PERSON_TAG", "01,02");
			params.put("BIRTHDAY", "2006-06-25");
			params.put("FILE_SOURCE", "");*/
			
			//收藏夹人脸删除测试
			/*String serviceName = "face/favoriteFile/delete";
			Map<Object, Object> params = new HashMap<>();
			params.put("FAVORITE_ID", "1");
			params.put("FILE_ID", "eab9c486b76e476a8665e1b24a819bfe");*/
			
			//收藏夹人脸详情测试
			/*String serviceName = "face/favoriteFile/detail";
			Map<Object, Object> params = new HashMap<>();
			params.put("FILE_ID", "5a2abd153f0e4e9997f01f4ac054936e");
			params.put("pageSize", "10");
			params.put("pageNo", "1");*/
			
			//收藏夹人脸编辑测试
			String serviceName = "face/favoriteFile/update";
			Map<Object, Object> params = new HashMap<>();
			params.put("FILE_ID", "06da8683c6bf41dfb556467548445312");
			params.put("PIC", "http://172.16.56.222:9080/staticRes/image/person/photo/12.jpg");
			params.put("NAME", "介乎结");
			params.put("SEX", "2");
			params.put("IDENTITY_TYPE", "1");
			params.put("IDENTITY_ID", "123456789098765");
			params.put("PERMANENT_ADDRESS", "重庆");
			params.put("PRESENT_ADDRESS", "四川");
			params.put("PERSON_TAG", "03,05,07");
			params.put("BIRTHDAY", "2009-08-25");
			
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	
	@Override
	public void initParam() {
		setEapHome("A:/tomcat_efaceclound");
		setHost("127.0.0.1:9080");
		setUserName("admin");
		setAppName(Constants.APP_NAME);
	}

}