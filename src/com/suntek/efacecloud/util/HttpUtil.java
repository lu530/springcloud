package com.suntek.efacecloud.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.httpclient.NameValuePair;
import org.apache.http.HttpEntity;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicHeader;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.StringUtil;

public class HttpUtil 
{
	private final static int DEFAULT_TIME_OUT = 15 * 1000;
    public final static String ENCODING = "utf-8";

	private static CloseableHttpClient httpClient = HttpClients.createDefault();
	
	public static String getImgRltz(String imgUrl) 
	{
		String content = "";
		CloseableHttpResponse response = null;
		try {
			HttpGet get = new HttpGet(imgUrl);
			RequestConfig config = RequestConfig.custom().setConnectionRequestTimeout(DEFAULT_TIME_OUT).setConnectTimeout(DEFAULT_TIME_OUT).setSocketTimeout(DEFAULT_TIME_OUT).build();
			get.setConfig(config);
			
			response = HttpClients.createDefault().execute(get);
			HttpEntity entity = response.getEntity();
			content = EntityUtils.toString(entity, "utf-8");
			EntityUtils.consume(entity);
		} catch (Exception e) {
			ServiceLog.error(e);
		}
		
		return content;
	}
	
	public static String HttpGet(String urlStr){
	    URL url;
        try {
            url = new URL(urlStr);
            //打开和url之间的连接
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            
            conn.setRequestProperty("accept", "*/*");
            conn.setRequestProperty("connection", "Keep-Alive");
            conn.setRequestProperty("user-agent", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)"); 
            conn.setDoOutput(true);
            conn.setDoInput(true);
            
            conn.setRequestMethod("GET");
            conn.connect(); 
            
            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
            String result = "";
            String line;
            while ((line = in.readLine()) != null) {
                result += line;
            }
            return result;
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
	}
	

	public static String post(String url, Map<String, Object> params, Map<String, String> headers) throws Exception {

        String content = "";
        CloseableHttpResponse response = null;
        HttpPost post = null;
        try {
            httpClient = HttpClients.createDefault(); 
            // 设置关闭 
            //httpClient.getParams().setBooleanParameter( "http.protocol.expect-continue" , false );  

            post = new HttpPost(url);  
            RequestConfig config = RequestConfig.custom().setConnectionRequestTimeout(DEFAULT_TIME_OUT)
                .setConnectTimeout(DEFAULT_TIME_OUT).setSocketTimeout(DEFAULT_TIME_OUT).build();

            post.setConfig(config); 
            for (String header : headers.keySet()) {
                post.setHeader(header, headers.get(header));
            }
            // 设置关闭
            post.addHeader("Connection", "close"); 
            if(params.size() > 0){
                List<BasicNameValuePair> pairList = new ArrayList<BasicNameValuePair>();
                for (String key : params.keySet()) {
                    pairList.add(new BasicNameValuePair(key, StringUtil.toString(params.get(key))));
                }
                post.setEntity(new UrlEncodedFormEntity(pairList, "utf-8"));
            }
            
            
            response = httpClient.execute(post);
            HttpEntity entity = response.getEntity();
            content = EntityUtils.toString(entity);
            EntityUtils.consume(entity);
           // httpClient.getParams().setBooleanParameter("http.protocol.expect-continue", false);
        } catch (Exception e) {
            ServiceLog.error("post error >>>>>>>"+ e.getMessage());
            throw e;
        } finally {
            try { 
                httpClient.close();
            } catch (Exception e) {
                ServiceLog.error("httpClient close response >>>>>>>", e);
            }
            try {
                if (null != post) {
                    post.releaseConnection();
                    Thread.sleep(500);
                    
                }
                if (null != response) {
                    response.close();
                    Thread.sleep(500);
                }
            } catch (Exception e) {
                ServiceLog.error("post close response >>>>>>>", e);
            }
        }

        return content;
    }
    
	public static String post(String url, String params, Map<String, String> headers) throws Exception {

		String content = "";
		CloseableHttpResponse response = null;
		HttpPost post = null;
		try {

			post = new HttpPost(url);
			RequestConfig config = RequestConfig.custom().setConnectionRequestTimeout(DEFAULT_TIME_OUT)
					.setConnectTimeout(DEFAULT_TIME_OUT).setSocketTimeout(DEFAULT_TIME_OUT).build();

			if (null != params && !"".equals(params)) {
				post.setEntity(new StringEntity(params, "utf-8"));
			}

			post.setConfig(config);
			// 请求头信息中添加关闭连接
			// headers.put("Connection", "close");
			for (String header : headers.keySet()) {
				post.setHeader(header, headers.get(header));
			}
			response = httpClient.execute(post);
			HttpEntity entity = response.getEntity();
			content = EntityUtils.toString(entity);
			EntityUtils.consume(entity);
		} catch (Exception e) {
			ServiceLog.error("post error >>>>>>>", e);
			throw e;
		} finally {
			try {
				if (null != post) {
					post.releaseConnection();
				}
				if (null != response) {
					response.close();
				}
			} catch (Exception e) {
				ServiceLog.error("post close response >>>>>>>", e);
			}
		}

		return content;
	}
	
	public void httpPost(String url,List<? extends org.apache.http.NameValuePair> params) throws IOException{
   	 
        CloseableHttpClient client = null;
        CloseableHttpResponse response = null;
        try{
            /**
             *  创建一个httpclient对象
             */
            client = HttpClients.createDefault();
            /**
             * 创建一个post对象
             */
            HttpPost post = new HttpPost(url);
            // 包装成一个Entity对象
            StringEntity entity = new UrlEncodedFormEntity(params, "UTF-8");
            //设置请求的内容
            post.setEntity(entity);
            // 设置请求的报文头部的编码
            post.setHeader(new BasicHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8"));
            /**
             * 设置请求的报文头部的编码
             */
            post.setHeader(new BasicHeader("Accept", "text/plain;charset=utf-8"));
            /**
             * 执行post请求
             */
            response = client.execute(post);
            /**
             * 获取响应码
             */
            int statusCode = response.getStatusLine().getStatusCode();
            if ("0".equals(statusCode) ){
                /**
                 * 通过EntityUitls获取返回内容
                 */
                String result = EntityUtils.toString(response.getEntity(),"UTF-8");
                /**
                 * 转换成json,根据合法性返回json或者字符串
                 */
            
//                    jsonObject = JSONObject.parseObject(result);
                   
            }else{
                
            }
        }catch (Exception e){
       	 
        }finally {
            response.close();
            client.close();
        }
   }
	
	
	public static String post(String url, JSONObject params, Map<String, String> headers) throws Exception {

	        String content = "";
	        CloseableHttpResponse response = null;
	        HttpPost post = null;
	        CloseableHttpClient closeableHttpClient = null;
	        try {  
	            closeableHttpClient = HttpClients.createDefault();   
	            post = new HttpPost(url);
	            RequestConfig config = RequestConfig.custom().setConnectionRequestTimeout(DEFAULT_TIME_OUT)
	                .setConnectTimeout(DEFAULT_TIME_OUT).setSocketTimeout(DEFAULT_TIME_OUT).build();

	            if (null != params) {
	                post.setEntity(new StringEntity(params.toJSONString(), ENCODING));
	            }

	            post.setConfig(config);
	            for (String header : headers.keySet()) {
	                post.setHeader(header, headers.get(header));
	            }
	            post.addHeader("Connection", "close"); 
	            response = closeableHttpClient.execute(post);
	            HttpEntity entity = response.getEntity();
	            content = EntityUtils.toString(entity);
	            EntityUtils.consume(entity);
	        } catch (Exception e) {
	            throw e;
	        } finally {
	            try { 
	                closeableHttpClient.close();
	            } catch (Exception e) {
	            }
	            try {
	                if (null != post) {
	                    post.releaseConnection();
	                } 
	            } catch (Exception e) {
	            }
	            try { 
	                if (null != response) {
	                    response.close();
	                }
	            } catch (Exception e) {
	            }
	        }

	        return content;
	    }
}
