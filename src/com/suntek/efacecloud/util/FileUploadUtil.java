package com.suntek.efacecloud.util;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContext;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import com.suntek.eap.web.RequestContext;

/**
 * 文件上传
 * @version 2017-07-27
 * @since 1.0
 * @author swq
 * @Copyright (C)2017 , Suntektech
 *
 */
public class FileUploadUtil {
	
	private static List<FileItem> getFileItems(RequestContext context) throws FileUploadException{
		DiskFileItemFactory factory = new DiskFileItemFactory(); 
		ServletContext servletContext = context.getHttpRequest().getServletContext();  
        File repository = (File) servletContext.getAttribute("javax.servlet.context.tempdir");  
        factory.setRepository(repository);  
        
        ServletFileUpload upload = new ServletFileUpload(factory); 
		List<FileItem> items = upload.parseRequest(context.getHttpRequest());  
		return items;
	}
	
	/**
	 * 保存下载文件并返回表单键值对
	 * @param context
	 * @param saveDir
	 * @param saveFileName
	 * @return
	 * @throws Exception
	 */
	public static Map<String,String> saveFile(RequestContext context, String saveDir, String saveFileName) throws Exception {

		Map<String,String> fieldValMap = new HashMap<String,String>();
		
		List<FileItem> items = getFileItems(context);
		for(FileItem item : items) {  
			if (item.isFormField()) { //表单
				fieldValMap.put(item.getFieldName(),item.getString());
			}else {                   //文件
	            File dir = new File(saveDir);  
	            File f = new File(dir, saveFileName);  
	              
	            if(f.exists()) {  
	                f.delete();  
	            }  
	            f.createNewFile();  
	              
	            //保存  
	            item.write(f);   
			}
		}
		
		return fieldValMap;
	}

}
