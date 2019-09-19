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

public class FaceCaptureEsProviderTest extends JUnitBase {


	@Test
	public void testPrepareRequestContext() {
		try {
			String serviceName = "face/capture/query";
			Map<Object, Object> params = new HashMap<>();
			params.put("BEGIN_TIME", "2017-07-01 16:38:24");
			params.put("END_TIME", "2017-07-12 16:38:24");
			params.put("pageNo", "1");
			params.put("pageSize", "10");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	
	@Override
	public void initParam() {
		setEapHome("E:/vplus/tomcat-7.0.40");
		setHost("127.0.0.1:9080");
		setUserName("admin");
		setAppName(Constants.APP_NAME);
	}

}

