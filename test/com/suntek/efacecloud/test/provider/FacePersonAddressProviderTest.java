package com.suntek.efacecloud.test.provider;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

public class FacePersonAddressProviderTest  extends JUnitBase{
	
	@Test
	public void testGetTree(){
		try {
			String serviceName = "face/address/getTree";
			Map<Object, Object> params=new HashMap<Object, Object>();
			params.put("elementId", "afe97e33ca3d49f7a333ca23eaa");
			
			String result = this.httpClient.post(getRestV6Prefix()+serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	@Override
	public void initParam() {
		setEapHome("D:/eclipse/tomcat/tomcat_efaceclound");
		setHost("127.0.0.1:9080");
		setUserName("admin");
		setAppName(Constants.APP_NAME);
	}
}
