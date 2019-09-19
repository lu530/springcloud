package com.suntek.efacecloud.test.provider;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

public class FaceDispatchedTaskProviderTest extends JUnitBase{
	
	@Test
	public void test(){
		try {
			String serviceName = "face/dispatchedTask/getData";
			Map<Object, Object> params=new HashMap<Object, Object>();
			
			//params.put("DB_ID", "afe97e33ca3d49f7a333ca23eaa");
			//params.put("DEVICE_ID", "seviceIdTest15,seviceIdTest13");
			params.put("KEYWORDS", "07181111");
			params.put("DEVICE_ID", "44000000001310000002");
			params.put("pageNo", "1");
			params.put("pageSize", "10");
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
