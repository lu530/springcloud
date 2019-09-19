package com.suntek.efacecloud.test.service;

import java.util.HashMap;
import java.util.Map;

import org.junit.Ignore;
import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;
/**
 * 布控库的增删修改测试
 * @author suntek
 *
 */
public class FaceDispatchedLibServiceTest extends JUnitBase{
	
	@Test
	@Ignore
	public void testAddLib() {
		try {
			String serviceName = "face/dispatchedLib/add";
			Map<Object, Object> params = new HashMap<>();
			params.put("DB_NAME", "员工布控库");
			params.put("ALARM_LEVEL", "2");
			params.put("ALARM_THRESHOLD", "35");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Test
	@Ignore
	public void deleteDispathedLib() {
		try {
			String serviceName = "face/dispatchedLib/delete";
			Map<Object, Object> params = new HashMap<>();
			params.put("DB_ID", "a1f1520179c04aaead3985c45b73446e");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Test
	public void editDispatchedLib() {
		try {
			String serviceName = "face/dispatchedLib/edit";
			Map<Object, Object> params = new HashMap<>();
			params.put("DB_ID", "41f7500e6c99430c8abcd1d86379ec3d");
			params.put("DB_NAME", "员工布控");
			params.put("THRESHOLD", "50");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
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
