package com.suntek.efacecloud.test.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;
/**
 * 布控任务关联测试
 * @author suntek
 *
 */
public class FaceDispatchedTaskServiceTest extends JUnitBase{

	@Test
	public void seltest(){
		try {
			String serviceName = "face/distaptchedTask/add";
			Map<Object, Object> params=new HashMap<Object, Object>();
			params.put("DB_IDS", "shd19");
			params.put("DEVICE_IDS", "44020000001310000000");
			params.put("PAGE_TYPE", 1);
			String result = this.httpClient.post(getRestV6Prefix()+serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	@Test
	public void getTaskDbIdtest(){
		try {
			String serviceName = "face/distaptchedTask/getTaskDbId";
			Map<Object, Object> params=new HashMap<Object, Object>();
			params.put("DEVICE_ID", "44000000001310000002");
			//params.put("DEVICE_IDS", "44020000001310000007");
			//params.put("pageType", 1);
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
