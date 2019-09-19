package com.suntek.efacecloud.util;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLDecoder;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.apache.commons.io.IOUtils;

public class FileMd5Util {

	/**
	 * 默认的密码字符串组合，用来将字节转换成 16 进制表示的字符,apache校验下载的文件的正确性用的就是默认的这个组合
	 */
	protected static char hexDigits[] = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' };

	/**
	 * 生成文件的md5校验值
	 * 
	 * @param file
	 * @return
	 * @throws IOException
	 * @throws NoSuchAlgorithmException
	 */
	public synchronized static String getFileMD5String(File file) throws IOException, NoSuchAlgorithmException {
		MessageDigest messagedigest = MessageDigest.getInstance("MD5");
		InputStream fis;
		fis = new FileInputStream(file);
		byte[] buffer = new byte[1024];
		int numRead = 0;
		while ((numRead = fis.read(buffer)) > 0) {
			messagedigest.update(buffer, 0, numRead);
		}
		fis.close();
		return bufferToHex(messagedigest.digest());
	}
	
	
	/**
	 * 生成图片url的md5校验值
	 * 
	 * @param file
	 * @return
	 * @throws IOException
	 * @throws NoSuchAlgorithmException
	 */
	public synchronized static String getUrlMD5String(String url) throws IOException, NoSuchAlgorithmException {
		URL imageUrl = null;
		try {
			imageUrl = new URL(URLDecoder.decode(url));
		} catch (MalformedURLException e1) {
			return null;
		}

		InputStream input = null;
		ByteArrayOutputStream dataStream = null;
		try {
			MessageDigest messagedigest = MessageDigest.getInstance("MD5");
			URLConnection conn = imageUrl.openConnection();
			conn.setReadTimeout(1500);
			conn.setConnectTimeout(1500);
			input = conn.getInputStream();
			dataStream = new ByteArrayOutputStream();
			byte[] ioBuffer = new byte[1024];
			int readLen = input.read(ioBuffer);
			while ((readLen = input.read(ioBuffer)) > 0) {
				messagedigest.update(ioBuffer, 0, readLen);
			}
			return bufferToHex(messagedigest.digest());
		} catch (Exception e) {
			throw e;
		} finally {
			IOUtils.closeQuietly(input);
			IOUtils.closeQuietly(dataStream);
		}
	}
	
	
	
	

	private static String bufferToHex(byte bytes[]) {
		return bufferToHex(bytes, 0, bytes.length);
	}

	private static String bufferToHex(byte bytes[], int m, int n) {
		StringBuffer stringbuffer = new StringBuffer(2 * n);
		int k = m + n;
		for (int l = m; l < k; l++) {
			appendHexPair(bytes[l], stringbuffer);
		}
		return stringbuffer.toString();
	}

	private static void appendHexPair(byte bt, StringBuffer stringbuffer) {
		char c0 = hexDigits[(bt & 0xf0) >> 4];// 取字节中高 4 位的数字转换, >>> 为逻辑右移，将符号位一起右移,此处未发现两种符号有何不同
		char c1 = hexDigits[bt & 0xf];// 取字节中低 4 位的数字转换
		stringbuffer.append(c0);
		stringbuffer.append(c1);
	}

}
