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

public class FaceFavoriteServiceTest extends JUnitBase {


	@Test
	public void testPrepareRequestContext() {
		try {
			//收藏夹新增测试
			String serviceName = "face/favorite/add";
			Map<Object, Object> params = new HashMap<>();
			params.put("FAVORITE_NAME", "4");
			params.put("LEVEL", "1");
			params.put("PARENT_ID", "");
			params.put("pageSize", "10");
			params.put("pageNo", "1");
			
			//收藏夹删除测试
			/*String serviceName = "face/favorite/delete";
			Map<Object, Object> params = new HashMap<>();
			params.put("FAVORITE_ID", "fbec4bed35c446a38b8115b23a096cda");*/
			
			
			//收藏夹修改测试
			/*String serviceName = "face/favorite/update";
			Map<Object, Object> params = new HashMap<>();
			params.put("FAVORITE_ID", "11206f8a77bf4ff4af2fd54789cb1849");
			params.put("FAVORITE_NAME", "第二");*/
			
			
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