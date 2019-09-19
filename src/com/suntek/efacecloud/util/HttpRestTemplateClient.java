package com.suntek.efacecloud.util;

import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.util.Iterator;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.common.rpc.rest.MediaType;
import com.suntek.eap.util.StringUtil;
import com.suntek.eaplet.registry.log.ServiceProxyLog;

/**
 * Spring RestTemplate 工具类
 * 
 * @author zhout
 * @since 1.0
 * @version 2017年10月14日
 * @Copyright (C)2017 , Suntektech
 */
public class HttpRestTemplateClient {

	private static final int readTimeout = 60000;

	private static final int connectTimeout = 3000;

	public static RestTemplate getTemplate(int readTimeout, int connectTimeout) {
		SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();

		factory.setReadTimeout(readTimeout);
		factory.setConnectTimeout(connectTimeout);
		
		return new RestTemplate(factory);
	}

	public static RestTemplate getTemplate() {
		return getTemplate(readTimeout, connectTimeout);
	}

	public static String post(String url, String data, String token) throws Exception {
		HttpHeaders headers = new HttpHeaders();

		headers.add("Accept", "application/json");
		headers.add("Accpet-Encoding", "gzip");
		headers.add("Content-Encoding", "UTF-8");
		headers.add("Content-Type", "application/json; charset=UTF-8");
		headers.add("Token", token);

		HttpEntity<String> formEntity = new HttpEntity<String>(data, headers);

		return HttpRestTemplateClient.getTemplate().postForObject(url, formEntity, String.class);
	}

	@SuppressWarnings("rawtypes")
	public static ResponseEntity<?> get(String url, HttpHeaders headers, Class<?> returnType) throws KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		long startTime = System.currentTimeMillis();
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + "http request["+ url + "]started");
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + headers);
		
		HttpEntity formEntity = getHttpEntity("{}", headers);
		ResponseEntity<?> resp = HttpRestTemplateClient.getTemplate().exchange(url
                ,HttpMethod.GET, formEntity, returnType);
		
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + resp.getBody());
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + "http request["+ url + "]end, user times["+ (System.currentTimeMillis()-startTime) +"]");
		return resp;
	}
	
	
	public static String get(String url) {
		long startTime = System.currentTimeMillis();
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + "http request[" + url + "]started");
		String res = HttpRestTemplateClient.getTemplate().getForObject(url, String.class, new Object[] {});
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + res);
		ServiceProxyLog.log
				.debug(Thread.currentThread().getName() + "	" + "http request[" + url + "]end, user times[" + (System.currentTimeMillis() - startTime) + "]");
		return res;
	}

	public static String post(String url, String data) {
		long startTime = System.currentTimeMillis();
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + "http request[" + url + "]started");
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + data);
		String res = HttpRestTemplateClient.getTemplate().postForObject(url, null, String.class, data);
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + res);
		ServiceProxyLog.log
				.debug(Thread.currentThread().getName() + "	" + "http request[" + url + "]end, user times[" + (System.currentTimeMillis() - startTime) + "]");
		return res;
	}

	@SuppressWarnings("rawtypes")
	public static ResponseEntity<?> post(String url, String data, HttpHeaders headers, Class<?> returnType) {
		long startTime = System.currentTimeMillis();
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + "http request[" + url + "]started");
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + headers);
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + data);
		HttpEntity formEntity = getHttpEntity(data, headers);
		ResponseEntity<?> resp = HttpRestTemplateClient.getTemplate().exchange(url,HttpMethod.POST, formEntity, returnType);
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + resp.getBody());
		ServiceProxyLog.log
				.debug(Thread.currentThread().getName() + "	" + "http request[" + url + "]end, user times[" + (System.currentTimeMillis() - startTime) + "]");
		return resp;
	}

	public static void put(String url, String data) {
		long startTime = System.currentTimeMillis();
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + "http request[" + url + "]started");
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + data);
		HttpRestTemplateClient.getTemplate().put(url, null, data);
		ServiceProxyLog.log
				.debug(Thread.currentThread().getName() + "	" + "http request[" + url + "]end, user times[" + (System.currentTimeMillis() - startTime) + "]");
	}

	public static void delete(String url, String id) {
		long startTime = System.currentTimeMillis();
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + "http request[" + url + "]started");
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + id);
		HttpRestTemplateClient.getTemplate().delete(url, id);
		ServiceProxyLog.log
				.debug(Thread.currentThread().getName() + "	" + "http request[" + url + "]end, user times[" + (System.currentTimeMillis() - startTime) + "]");
	}

	public static ResponseEntity<?> delete(String url, String data, HttpHeaders headers, Class<?> returnType)
			throws KeyManagementException, NoSuchAlgorithmException, KeyStoreException {
		
		long startTime = System.currentTimeMillis();
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + "https request["+ url + "]started");
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + data);
		
		HttpEntity formEntity = getHttpEntity(data, headers);
		
		ResponseEntity<?> resp = HttpRestTemplateClient.getTemplate().exchange(url
                ,HttpMethod.DELETE, formEntity, returnType, data);
		
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + resp.getBody());
		
		ServiceProxyLog.log.debug(Thread.currentThread().getName() + "	" + "https request["+ url + "]end, user times["+ (System.currentTimeMillis()-startTime) +"]");
		return resp;
	}
	@SuppressWarnings("rawtypes")
	private static HttpEntity getHttpEntity(String data, HttpHeaders headers) {
		String contentType = headers.getFirst("Content-Type");
		HttpEntity formEntity = null;
		switch (contentType) {
		// 对用请求内容Content-Type为application/x-www-form-urlencoded  需要键值对全为字符串类型
		case MediaType.APPLICATION_FORM_URLENCODED:
		case MediaType.APPLICATION_FORM_URLENCODED_UTF_8:
			JSONObject obj = JSONObject.parseObject(data);
			MultiValueMap<String, String> params = new LinkedMultiValueMap<String, String>();
			Iterator it = obj.keySet().iterator();
			while(it.hasNext()){
				Object key = it.next();
				params.add(StringUtil.toString(key), StringUtil.toString(obj.get(key)));
			}
			formEntity = new HttpEntity<MultiValueMap<String, String>>(params, headers);
			break;
		case MediaType.APPLICATION_JSON:
		case MediaType.APPLICATION_JSON_UTF_8:

		case MediaType.TEXT_XML:
		case MediaType.TEXT_XML_UTF_8:
			formEntity = new HttpEntity<String>(data, headers);
			break;
		default:
			formEntity = new HttpEntity<String>(data, headers);
			break;
		}
		
		return formEntity;
	}
	
	
	public static void main(String[] args) {
		String url = "http://localhost:9200/_nodes"; // ElasticSearch 节点查询服务
		String result = (String) HttpRestTemplateClient.getTemplate(5000, 3000).getForObject(url, String.class);
		Map<String, Object> obj = JSON.parseObject(result);
		System.out.println(obj);
	}
}
