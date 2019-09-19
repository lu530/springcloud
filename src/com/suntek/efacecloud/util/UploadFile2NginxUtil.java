package com.suntek.efacecloud.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URL;
import java.util.Collections;
import java.util.Map;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.json.simple.JSONValue;

import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.Decoder.BASE64Decoder;

/**
 * 上传图片到nginx工具类
 * @author linsj
 * @since 2.0
 * @version 2016年9月26日
 * @Copyright (C)2016 , Suntektech
 */
public class UploadFile2NginxUtil 
{
	public static Map<String, Object> local2Nginx(String localPath) throws IOException
	{
		FileInputStream fis = null;
		
		File file;
		byte[] bytes;
		try {
			file = new File(localPath);
			fis = new FileInputStream(file);
			bytes = IOUtils.toByteArray(fis);
			return httpPost2Nginx(bytes, file.getName());
		} catch (Exception e) {
			ServiceLog.error(e);
		} finally {
			if (fis != null) {
				fis.close();
			}
		}
		
		return Collections.emptyMap();
	}
	
	public static Map<String, Object> http2Nginx(String imgPath, String imgName) throws IOException
	{
		URL imgUrl = new URL(imgPath);
		byte[]  bytes = IOUtils.toByteArray(imgUrl.openConnection().getInputStream());
		return httpPost2Nginx(bytes, imgName);
	}
	
	public static Map<String, Object> base642Nginx(String imgBase64, String imgName) throws IOException
	{
		BASE64Decoder dec = new BASE64Decoder();
		byte[] bytes = dec.decodeBuffer(imgBase64);
		return httpPost2Nginx(bytes, imgName);
	}
	
	public static Map<String, Object> httpPost2Nginx(byte[] bytes, String imgName) throws ClientProtocolException, IOException
	{
		HttpPost post = new HttpPost(ConfigUtil.getNginxPrefix() + imgName);
		post.setHeader("Content-Type", "application/octet-stream");
		post.setHeader("X-AppToken-Id", ""+Constants.PCIDFS_PERMANENT_FLAG);
		post.setEntity(new ByteArrayEntity(bytes));
		return bytes2Nginx(bytes, post);
	}
	
	public static Map<String, Object> httpGet2Nginx(byte[] bytes, String imgName) throws ClientProtocolException, IOException
	{
		HttpGet get = new HttpGet(ConfigUtil.getNginxPrefix() + imgName);
		return bytes2Nginx(bytes, get);
	}
	
	@SuppressWarnings("unchecked")
	public static Map<String, Object> bytes2Nginx(byte[] bytes, HttpUriRequest hur) throws ClientProtocolException, IOException
	{
		HttpClient client = HttpClientBuilder.create().build();
		HttpResponse resp = client.execute(hur);
		
		String responseText = IOUtils.toString(resp.getEntity().getContent());
		Map<String, Object> returnMap = (Map<String, Object>)JSONValue.parse(responseText);
		return returnMap;
	}
}
