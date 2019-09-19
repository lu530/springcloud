package com.suntek.efacecloud.test.service;

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
public class FaceTechnicalTacticsServiceTest extends JUnitBase {

	@Test
	public void testOne2One(){
		try {
			String serviceName = "face/technicalTactics/one2one";
			Map<Object, Object> params = new HashMap<>();
			params.put("URL_FROM", "http://172.16.56.204:8088/g1/M00/00031001/20170510/rBA4zFkSjK2IMD_dAABtYczxmgEAABB1wAAvigAAG15782.jpg");
			params.put("URL_TO", "http://172.16.56.204:8088/g1/M00/00031001/20170510/rBA4zFkSjK2IMD_dAABtYczxmgEAABB1wAAvigAAG15782.jpg");
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
