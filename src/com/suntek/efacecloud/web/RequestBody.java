package com.suntek.efacecloud.web;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import com.suntek.eap.web.RequestContext;


public class RequestBody {

	public String getRequestBodyParam(RequestContext context){
		
		try {
			BufferedReader streamReader = new BufferedReader(new InputStreamReader(context.getHttpRequest().getInputStream(), "UTF-8"));
			StringBuilder responseStrBuilder = new StringBuilder();
			
			String inputStr;  
			
			while ((inputStr = streamReader.readLine()) != null)  

			           responseStrBuilder.append(inputStr);  
		
			return responseStrBuilder.toString();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return "";
		
	}
}
