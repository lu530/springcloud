package com.suntek.efacecloud.test.provider;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.suntek.eap.junit.JUnitBase;
import com.suntek.eap.log.ServiceLog;
import com.suntek.efacecloud.util.Constants;

public class FaceSpecialPicEsProviderTest extends JUnitBase {

	@Test
	public void testQuery() {
		try {
			String serviceName = "face/specialPic/query";
			Map<Object, Object> params=new HashMap<Object, Object>();
			params.put("DB_ID", "f599c542748342b49d2f84514f255d9f");
			params.put("TOPN",  "100");
			params.put("THRESHOLD",  "1");
			
			//params.put("THRESHOLD",  "60");
			params.put("PIC",  "http://172.16.58.179:8088/g1/M00/00000000/0000000A/rBA6s1lwVsWAPULLAAAZ2pjNAXE814.jpg");
			params.put("pageNo",  "1");
			params.put("pageSize",  "20");
			//params.put("SEX",  "1");
			//params.put("PRESENT_ADDRESS",  "120119");
			//params.put("PERMANENT_ADDRESS",  "110101");
			//params.put("AGE",  "2");
			//params.put("BEGIN_TIME",  "1990-10-23");
			//params.put("END_TIME",  "2010-10-23");
				
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

		setEapHome("C:/work/pci/tomcat_eface");
		setAppName(Constants.APP_NAME);
		setHost("172.16.64.61:9080");
		setUserName("admin");

	}

}
