package com.suntek.efacecloud.test.provider;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

/**
 * 
 * @author lx
 * @Description: 
 * @since 
 * @version 2017年7月11日
 * @Copyright (C)2017 , Suntektech
 */

public class FaceMobileTerminalEsProviderTest extends JUnitBase {

	@Test
	public void testPrepareRequestContext() {
		try {
			String serviceName = "face/terminal/query";
			Map<Object, Object> params = new HashMap<>();
			params.put("PERSON_TAG", "02 07");
			//params.put("AGE", "2");
			//params.put("THRESHOLD", 60);
			//params.put("PIC", "http://172.16.56.203/fs/g1/M00/00002000/20170711/rBA4zFlkPnmINNqiAAAV-88j1nwAABM6wABTaEAABYT298.jpg");
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
		setEapHome("F:/uspp_faceBigData/tomcat_efaceclound");
		setHost("127.0.0.1:9080");
		setUserName("admin");
		setAppName(Constants.APP_NAME);
	}

}

