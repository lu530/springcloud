package com.suntek.efacecloud.util;

/**
 * MediaType常量
 * @author zwl
 * @since 
 * @version 2017年10月17日
 * @Copyright (C)2017 , Suntektech
 */
public class MediaType {

	public static final String APPLICATION_JSON = "application/json";
	
	public static final String APPLICATION_XML = "application/xml";
	
	public static final String TEXT_XML = "text/xml";
	
	public static final String TEXT_PLAIN = "text/plain";
	
	public static final String APPLICATION_FORM_URLENCODED = "application/x-www-form-urlencoded";
	
	public static final String MULTIPART_FORM_DATA = "multipart/form-data";
	
	private static final String CHARSET_PARAMETER ="charset";
	
    public static final String APPLICATION_JSON_UTF_8 = APPLICATION_JSON + "; " + CHARSET_PARAMETER + "=UTF-8";
    
    public static final String TEXT_XML_UTF_8 = TEXT_XML + "; " + CHARSET_PARAMETER + "=UTF-8";
    
    public static final String TEXT_PLAIN_UTF_8 = TEXT_PLAIN + "; " + CHARSET_PARAMETER + "=UTF-8";
    
    public static final String APPLICATION_XML_UTF_8 = APPLICATION_XML + "; " + CHARSET_PARAMETER + "=UTF-8";
    
    public static final String APPLICATION_FORM_URLENCODED_UTF_8 = APPLICATION_FORM_URLENCODED + "; " + CHARSET_PARAMETER + "=UTF-8";
    
}
