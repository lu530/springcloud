package com.suntek.efacecloud.util;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * excel模板InputStream缓存类
 * @author Zhangliping
 * @version 2018-04-12
 */
public class SaveStreamUtil {
    private static Map<String, byte[]> streamCache = new HashMap<>();
    
    public static void save(InputStream input, String key) throws IOException {
    	
    	if (streamCache.containsKey(key)) {
    		return;
    	}
    	
    	ByteArrayOutputStream output = new ByteArrayOutputStream();  
        byte[] buffer = new byte[1024];  
        int len = -1;  
        while ((len = input.read(buffer)) != -1) {  
            output.write(buffer, 0, len);  
        }  
        byte[] value = output.toByteArray();
        
        streamCache.put(key, value);
    }  
      
    public static InputStream getInputStream(String key) {
    	if (streamCache.containsKey(key)) {
    		return new ByteArrayInputStream(streamCache.get(key));
    	}
    	
    	return null;
    }
    
    public static void destory() {
    	streamCache.clear();
    }
}
