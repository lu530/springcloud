package com.suntek.efacecloud.service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.imageio.ImageIO;
import javax.imageio.stream.ImageOutputStream;

import com.suntek.eap.EAP;
import com.suntek.eap.blob.Blob;
import com.suntek.eap.blob.BlobStore;
import com.suntek.eap.common.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;

/**
 * 人脸手动抠图
 * @author wdp
 * @since 
 * @version 2018年5月3日
 * @Copyright (C)2018 , Suntektech
 */
@LocalComponent(id="image/cut")
public class FaceManualCutImageService {

	@BeanService(id="getface", type="remote", description="剪切图片")
	public void getface(RequestContext context){
		
		String origianlPic = StringUtil.toString(context.getParameter("PIC"), "");
		String xStr = StringUtil.toString(context.getParameter("X"), "0");
		String yStr = StringUtil.toString(context.getParameter("Y"), "0");
		String widthStr = StringUtil.toString(context.getParameter("WIDTH"), "0");
		String heightStr = StringUtil.toString(context.getParameter("HEIGHT"), "0");
		
		String fdfs_url_pre = AppHandle.getHandle("console").getProperty("FDFS_URL", "http://localhost:8088/");
		
		int x = (int)Math.rint(Double.parseDouble(xStr));
		int y = (int)Math.rint(Double.parseDouble(yStr));
		int width = (int)Math.rint(Double.parseDouble(widthStr));
		int height = (int)Math.rint(Double.parseDouble(heightStr));
		
		BlobStore store = EAP.blob.getStore();
		Blob blob = store.findById(origianlPic);
		
		ByteArrayOutputStream bos = null;
		try {
			InputStream in = blob.getInputStream();
			BufferedImage image = ImageIO.read(in);  
	        image = image.getSubimage(x, y, width, height);  
	        
	        String format = origianlPic.substring(origianlPic.lastIndexOf(".") + 1, origianlPic.length());  
	        
	        bos = new ByteArrayOutputStream();
	        ImageOutputStream imOut = ImageIO.createImageOutputStream(bos);
	        ImageIO.write(image, format, imOut);
	        byte[] byteArray = bos.toByteArray();
	        String newUrl = store.put(new ByteArrayInputStream(byteArray), format);
			
	        if(null != in){
	        	in.close();
	        }
	        
	        context.getResponse().putData("code", "0");
	        context.getResponse().putData("message", "请求成功！");
	        context.getResponse().putData("newUrl", fdfs_url_pre + newUrl);
	        
		}catch (Exception e) {
			
			context.getResponse().putData("code", "1");
	        context.getResponse().putData("message", "请求失败！");
	        context.getResponse().putData("newUrl", "");
	        
			ServiceLog.error("人脸手动抠图服务异常:" + e.getMessage(), e);
		}finally {
			try {
				
				if(null != bos){
					bos.close();
				}
				
			} catch (IOException e1) {
				ServiceLog.error("人脸手动抠图服务关闭ByteArrayOutputStream异常:" + e1.getMessage(), e1);
			}
		}
	}
	
}
