package com.suntek.efacecloud.util;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLDecoder;

import org.apache.commons.io.IOUtils;

import com.suntek.eap.log.ServiceLog;

/**
 * 文件下载工具类
 * @author lx
 * @since jdk1.8
 * @version 2017年7月21日
 * @Copyright (C)2015 , pcitech
 */
public class FileDowloader 
{
	private final static int GET_PIC_TIME_OUT = 20*1000;

	/**
	 * 根据URL地址获取图片
	 * @param url
	 * @return byte[]图片流
	 * @throws IOException
	 */
	@SuppressWarnings("deprecation")
	public static byte[] getImageFromUrl(String url) throws Exception 
	{
		URL imageUrl = null;
		try {
			imageUrl = new URL(URLDecoder.decode(url));
		} catch (MalformedURLException e1) {
			return null;
		}

		byte[] imageData = null;
		InputStream input = null;
		ByteArrayOutputStream dataStream = null;
		try {
			URLConnection conn = imageUrl.openConnection();
			conn.setReadTimeout(GET_PIC_TIME_OUT);
			conn.setConnectTimeout(GET_PIC_TIME_OUT);
			input = conn.getInputStream();
			dataStream = new ByteArrayOutputStream();
			byte[] ioBuffer = new byte[1024];
			int readLen = input.read(ioBuffer);
			while (-1 != readLen) {
				dataStream.write(ioBuffer, 0, readLen);
				readLen = input.read(ioBuffer);
			}
			imageData = dataStream.toByteArray();
		} catch (Exception e) {
			throw e;
		} finally {
			IOUtils.closeQuietly(input);
			IOUtils.closeQuietly(dataStream);
		}
		
		return imageData;
	}

	public static byte[] readInputStream(InputStream inStream) throws Exception 
	{
		ByteArrayOutputStream outStream = new ByteArrayOutputStream();
		byte[] buffer = new byte[1024];
		int len = 0;
		while ((len = inStream.read(buffer)) != -1) {
			outStream.write(buffer, 0, len);
		}
		inStream.close();
		return outStream.toByteArray();
	}
	
	public static void downloadFile(String remoteFilePath, String localFilePath) throws IOException
    {
        BufferedInputStream input = null;
        BufferedOutputStream output = null;
        try
        {
        	URL url = new URL(remoteFilePath);
        	HttpURLConnection connnection = (HttpURLConnection)url.openConnection();
            connnection.connect();
            File file = new File(localFilePath);
            input = new BufferedInputStream(connnection.getInputStream());
            output = new BufferedOutputStream(new FileOutputStream(file));
            int size = 1024;
            byte[] b = new byte[size];
            while ((size = input.read(b)) != -1)
            {
                output.write(b, 0, size);
            }
            output.flush();
            input.close();
            connnection.disconnect();
        }
        catch (Exception e)
        {
        	ServiceLog.error("下载远程文件失败", e);
        	throw e;
        }
        finally
        {
        	if(input != null){
        		input.close();
        	}
        	if(output != null){
        		output.close();
        	}
        }
    }
}
