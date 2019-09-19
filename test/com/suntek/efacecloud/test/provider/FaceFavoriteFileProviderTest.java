package com.suntek.efacecloud.test.provider;

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

public class FaceFavoriteFileProviderTest extends JUnitBase {


	@Test
	public void testPrepareRequestContext() {
		try {
			//收藏夹人脸查询测试
			String serviceName = "face/favoriteFile/getData";
			Map<Object, Object> params = new HashMap<>();
			params.put("FAVORITE_ID", "33a6ca100b40414babc4754ea9e80a78");
			params.put("SEX", "1");
			params.put("PERSON_TAG", "01");
			params.put("BEGIN_TIME", "");
			params.put("END_TIME", "");
			params.put("AGE", "1");
			params.put("PERMANENT_ADDRESS", "");
			params.put("PRESENT_ADDRESS", "110101");
			params.put("pageSize", "10");
			params.put("pageNo", "1");
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