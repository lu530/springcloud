package com.suntek.efacecloud.util;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;
import com.suntek.efacecloud.util.Constants;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.StringUtil;

/**
 * 配置文件读取类
 * @author guoyl
 * @since 1.0
 * @version 2017-06-19
 * @Copyright (C)2017 , Suntektech
 */
public class MapConfig {

	public static final String name = Constants.APP_NAME;
	
	public static String ip = "";
	
	private static AppHandle appHandler;
	
	static{
		ServiceLog.info("reread "+name+" config");
		AppHandle.removeHandle(name);
		AppHandle.setDeployed(name);
		appHandler = AppHandle.getHandle(name);		
		ip = getIp();
	}
	
	private static String getIp(){
		String ip = "";
		try {
			for (Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces(); interfaces.hasMoreElements();) {
                NetworkInterface networkInterface = interfaces.nextElement();
                if (networkInterface.isLoopback() || networkInterface.isVirtual() || !networkInterface.isUp() || networkInterface.getDisplayName().indexOf("vir")>=0) {
                    continue;
                }
                Enumeration<InetAddress> addresses = networkInterface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                	InetAddress ia = addresses.nextElement();
                	if(ia instanceof Inet4Address){
                		ip = ia.getHostAddress();
                	}
                }
            }
		} catch (SocketException e) {
			ServiceLog.error("getIp SocketException", e);
		}
		return ip;
	}
	
		
	public static String getIdCardIndex(){
		return getByKey("idCardindex", "id_card_detect_indice");
	}
	
	public static String getIdCardType(){
		return getByKey("idCardtype", "ID_CARD_DETECT_INFO");
	}	
		
	public static String getEfenceIndex(){
		return getByKey("efenceindex", "efence_detect_indice");
	}
	
	public static String getEfenceType(){
		return getByKey("efencetype", "EFENCE_DETECT_INFO");
	}
	
	public static String getFaceDetectIndice(){
		return getByKey("faceDetectIndex", "face_indice");
	}
	
	public static String getFaceDetectType(){
		return getByKey("faceDetectType", "FACE_INFO");
	}
	
	public static String getDoorAccessIndex(){
		return getByKey("dooraccessindex", "door_access_indice");
	}

	public static String getDoorAccessType(){
		return getByKey("dooraccesstype", "DOOR_ACCESS_INFO");
	}
	
	public static String getCarDetectIndex(){
		return getByKey("cardetectindex", "car_detect_indice");
	}

	public static String getCarDetectType(){
		return getByKey("cardetecttype", "CAR_DETECT_INFO");
	}
	
	public static String getVideoPersonIndex(){
		return getByKey("videoPersonIndex", "video_person_indice");
	}
	
	public static String getVideoPersonType(){
		return getByKey("videoPersonType", "VIDEO_PERSON_INFO");
	}
	
	public static String getWifiDetectInfoIndex(){
		return getByKey("wifiDetectInfoIndex", "wifi_detect_indice");
	}	
	
	public static String getViidVehicleIndex(){
		return getByKey("viidVehicleIndex", "viid_vehicle_indice");
	}
	
	public static String getWifiDetectInfoType(){
		return getByKey("wifiDetectInfoType", "WIFI_DETECT_INFO");
	}
	
	public static String getViidVehicleType(){
		return getByKey("viidVehicleType", "VIID_VEHICLE_INFO");
	}
	
	public static String getSbssPersonIndex(){
		return getByKey("sbssPersonIndex", "person_room_indice");
	}
	
	public static String getSbssPersonType(){
		return getByKey("sbssPersonType", "SBSS_PERSON_ROOM");
	}
	
	public static String getPersonArchiveIndex(){
		return getByKey("personArchiveIndex", "person_archive_indice");
	}
	
	public static String getPersonArchiveType(){
		return getByKey("personArchiveType", "PERSON_ARCHIVE_INFO");
	}	
	
	/**
	 * wifi区域碰撞时选择公共区域
	 * 
	 * @return true 禁止选择公共区域
	 */
	public static boolean wifiForbidSelCommonArea() {

		return appHandler.getProperty("WIFI_FORBID_SEL_COMMON_AREA", "1").equals("1");
	}
	
	/**
	 *  电围imsi区域碰撞时选择公共区域
	 * @return true 禁止选择公共区域
	 */
	public static boolean ImsiForbidSelCommonArea() {

		return appHandler.getProperty("EFENCE_IMSI_FORBID_SEL_COMMON_AREA", "1").equals("1");
	}	
	
	/**
	 * 电围imei区域碰撞时选择公共区域
	 * 
	 * @return true 禁止选择公共区域
	 */
	public static boolean ImeiForbidSelCommonArea() {

		return appHandler.getProperty("EFENCE_IMEI_FORBID_SEL_COMMON_AREA", "1").equals("1");
	}	
	
	
	
	public static String getByKey(String key,String defaultVal){
		String value = appHandler.getProperty(key);
		
		if(StringUtil.isEmpty(value)){
			return defaultVal;
		}
		return value;
		
	}
}
