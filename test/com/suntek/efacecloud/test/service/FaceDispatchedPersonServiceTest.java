package com.suntek.efacecloud.test.service;

import java.util.HashMap;
import java.util.Map;

import org.junit.Ignore;
import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;
/**
 * 人员布控增删测试
 * @author suntek
 *
 */
public class FaceDispatchedPersonServiceTest extends JUnitBase {
	
	@Test
	public void addDispatchedPerson() {
		try {
			
			String serviceName = "face/dispatchedPerson/add";
			Map<Object, Object> params = new HashMap<>();
			params.put("DB_ID", "41f7500e6c99430c8abcd1d86379ec3d");
			params.put("NAME", "黄尚诚");
			params.put("SEX", "1");
			params.put("IDENTITY_TYPE", "1");
			params.put("IDENTITY_ID", "431103199308260332");
			params.put("BIRTHDAY", "1993-08-26");
			params.put("PERMANENT_ADDRESS", "431103");
			params.put("PRESENT_ADDRESS", "440106");
			params.put("PIC", "http://172.16.58.121:9090/image/Employee_info/register_750948580.jpg");
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果\n");
			ServiceLog.debug(result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	
	@Test
	@Ignore
	public void deleteDispatchedPerson() {
		try {
			
			String serviceName = "face/dispatchedPerson/delete";
			Map<Object, Object> params = new HashMap<>();
			params.put("PERSON_ID", "841073127");
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
