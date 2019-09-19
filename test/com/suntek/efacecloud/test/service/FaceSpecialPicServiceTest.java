package com.suntek.efacecloud.test.service;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

public class FaceSpecialPicServiceTest  extends JUnitBase  {
	
	private String SOURCE_DB = "7fdeff39a5754e519af625926de520e4";
//	private String SOURCE_DB = "GAMBLING_DB";

	@Test
	public void testAddPerson() {
		try {
//			//新增人脸无证件号
//			String serviceName = "face/specialPic/add";
//			Map<Object, Object> params = new HashMap<>();
//			params.put("NAME", "不知是关羽");
//			params.put("PIC", "http://172.16.56.204:8088/g1/M00/00031001/20170712/rBA4zFlmC5aIHSXqAABChhMyPHsAABNJgC3KH8AAEKe375.jpg");
//			params.put("SOURCE_DB", SOURCE_DB);
//			params.put("BIRTHDAY", "1993-07-09");
//			params.put("SEX", "0");
//			params.put("PERMANENT_ADDRESS", "");
//			params.put("PRESENT_ADDRESS", "");
//			params.put("IDENTITY_ID", "");
//			params.put("IDENTITY_TYPE", "1");

			
			
			//新增人脸有证件号,人员不存在
			String serviceName = "face/specialPic/add";
			Map<Object, Object> params = new HashMap<>();
			params.put("BIRTHDAY", "1992-06-02");
			params.put("IDENTITY_ID", "478224199307023620");
			params.put("IDENTITY_TYPE", "1");
			params.put("NAME", "刘备");
			params.put("PIC", "http://172.16.56.204:8088/g1/M00/00031001/20170712/rBA4zFlmC5aIHSXqAABChhMyPHsAABNJgC3KH8AAEKe375.jpg");
			params.put("SOURCE_DB", SOURCE_DB);	
			params.put("PERMANENT_ADDRESS", "");
			params.put("PRESENT_ADDRESS", "");
			params.put("SEX", "0");
			
			//新增人脸有证件号,人员已存在
//			String serviceName = "face/specialPic/add";
//			Map<Object, Object> params = new HashMap<>();
//			params.put("BIRTHDAY", "1993-06-02");
//			params.put("IDENTITY_ID", "478224199307023620");
//			params.put("IDENTITY_TYPE", "1");
//			params.put("NAME", "刘备2");
//			params.put("PIC", "http://172.16.56.204:8088/g1/M00/00031001/20170712/rBA4zFlmC5aIHSXqAABChhMyPHsAABNJgC3KH8AAEKe375.jpg");
//			params.put("SOURCE_DB", SOURCE_DB);	
//			params.put("PERMANENT_ADDRESS", "");
//			params.put("PRESENT_ADDRESS", "");
//			params.put("SEX", "0");
				
			
			ServiceLog.debug("参数：" + params.toString());
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果：" + result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}
	@Test
	public void testEditPerson() {
		try {
			//编辑人脸，不加身份证
//			String serviceName = "face/specialPic/edit";
//			Map<Object, Object> params = new HashMap<>();
//			params.put("INFO_ID", "204195958576161344"); 
//			params.put("BIRTHDAY", "1992-06-02");
//			params.put("IDENTITY_TYPE", "1");
//			params.put("NAME", "关羽");
//			params.put("PERMANENT_ADDRESS", "110101");
//			params.put("PRESENT_ADDRESS", "120119");
//			params.put("SEX", "1");
//			params.put("PIC", "http://172.16.56.204:8088/g1/M00/00031001/20170712/rBA4zFlmC5aIHSXqAABChhMyPHsAABNJgC3KH8AAEKe375.jpg");
//			params.put("SOURCE_DB", SOURCE_DB);			
			
			//编辑人脸，不加身份证->加身份证(人员在档案库中不存在)
//			String serviceName = "face/specialPic/edit";
//			Map<Object, Object> params = new HashMap<>();
//			params.put("INFO_ID", "204195958576161344"); //关羽，
//			params.put("BIRTHDAY", "1992-06-02");
//			params.put("IDENTITY_TYPE", "1");
//			params.put("IDENTITY_ID", "455224199307023622");
//			params.put("NAME", "关羽");
//			params.put("PERMANENT_ADDRESS", "110101");
//			params.put("PRESENT_ADDRESS", "120119");
//			params.put("SEX", "1");
//			params.put("PIC", "http://172.16.56.204:8088/g1/M00/00031001/20170712/rBA4zFlmC5aIHSXqAABChhMyPHsAABNJgC3KH8AAEKe375.jpg");
//			params.put("SOURCE_DB", SOURCE_DB);	
			
			//编辑人脸，不加身份证->加身份证(人员在档案库中存在)
			String serviceName = "face/specialPic/edit";
			Map<Object, Object> params = new HashMap<>();
			params.put("INFO_ID", "204195958576161344"); //不知是关羽
			params.put("BIRTHDAY", "1992-06-02");
			params.put("IDENTITY_TYPE", "1");
			params.put("IDENTITY_ID", "455224199307023622");
			params.put("NAME", "呵呵关羽");
			params.put("PERMANENT_ADDRESS", "110101");
			params.put("PRESENT_ADDRESS", "120119");
			params.put("SEX", "1");
			params.put("PIC", "http://172.16.56.204:8088/g1/M00/00031001/20170712/rBA4zFlmC5aIHSXqAABChhMyPHsAABNJgC3KH8AAEKe375.jpg");
			params.put("SOURCE_DB", SOURCE_DB);	
//			
			ServiceLog.debug("参数：" + params.toString());
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果：" + result);
			
			
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}

	@Test
	public void testDeletePerson() {
		try {
			String serviceName = "face/specialPic/delete";
			Map<Object, Object> params = new HashMap<>();
			params.put("INFO_ID", "203176721078329920");
			params.put("ARCHIVE_PIC_INFO_ID", "203174293050270273");
			params.put("SOURCE_DB", "FRAUD_DB");
		
			ServiceLog.debug("参数：" + params.toString());
			String result = this.httpClient.post(getRestV6Prefix() + serviceName, params);
			ServiceLog.debug("结果：" + result);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
	}

	@Override
	public void initParam() {
		setEapHome("C:/work/pci/tomcat_eface");
		setAppName(Constants.APP_NAME);
		setHost("172.16.64.82:9080");
		setUserName("admin");
	}

}
