package com.suntek.efacecloud.util;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.lang.StringUtils;

import com.suntek.eap.EAP;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.dao.DeviceInfoDao;
import com.suntek.efacecloud.model.DeviceEntity;

/**
 * 设备资源信息工具类
 * @author wangsh
 * @since 1.0
 * @version 2017年01月24日
 */
public class DeviceInfoUtil {

	private static DeviceInfoDao dao = new DeviceInfoDao();
	
	/**
	 * 根据用户名获取相应设备类型的设备
	 * @param userCode
	 * @param deviceType
	 * @return
	 */
	public static String getDeviceIdsByUserCode(String userCode, int deviceType, String queryTables) {
		List<String> list = dao.getDeviceIdsByUserCode(userCode, deviceType, queryTables);
		
		return list.size() > 0 ? StringUtils.join(list, ",") : "";
	}
	
	/**
	 * 根据用户名获取区域权限
	 * @param userCode
	 * @return
	 */
	public static String getUserResorceByUserCode(String userCode) {
		List<String> list = dao.getUserResorceByUserCode(userCode);
		
		return list.size() > 0 ? StringUtils.join(list, ",") : "";
	}
	
    public static String getDeviceName(String type, String id) throws Exception {
		
		DeviceEntity device = (DeviceEntity)EAP.metadata.getDictModel(type, id, DeviceEntity.class);
		
		if(device != null) {
			return device.getDeviceName();
		}else {
			return "";
		}
	}
    
    public static String getDeviceAddr(String type, String id) throws Exception {
		
		DeviceEntity passport = (DeviceEntity)EAP.metadata.getDictModel(type, id, DeviceEntity.class);
		
		if(passport != null) {
			return passport.getDeviceAddr();
		}else {
			return "";
		}
	}
   
    public static double getDeviceCoordinate(String type, String id, int i) throws Exception {
		
		DeviceEntity passport = (DeviceEntity)EAP.metadata.getDictModel(type, id, DeviceEntity.class);
		double result = 0;
		if(id!=null && !id.equals("") && passport!=null) {
			switch (i) {
				case 1:
					result = passport.getDeviceX();
					break;
				case 2:
					result = passport.getDeviceY();
					break;
				default:
					break;
			}
		}
		return result;
	}
   
   /**
    * 根据人脸来源和用户映射选择设备
    * sourceType 多个来源用逗号分隔
    */
    public static Set<String> getDeviceListBySourceType(String sourceType, String userCode) {
    	StringBuffer url = new StringBuffer(1024);
	    String addr = AppHandle.getHandle(Constants.CONSOLE).getProperty("THE_UNIT_PERMISION_URL", "");
	    String apiStr = "/sysmanager/inner/groupStructureInfo/getUserDeviceByGroups?isPage=false";
	   
	    url.append(addr).append(apiStr).append("&userCode=" + userCode).append("&videodevGbId=" + sourceType);
	   
	    try {
		    String structTreeStr = HttpUtil.HttpGet(url.toString());
            ServiceLog.info("接口 : " + url.toString() + "--->返回结果--->" + structTreeStr);
           
            Object result = CommonUtil.jsonStr2List(structTreeStr);
            if(result != null) {
        	    List<Map<String, Object>> recordsList = (List<Map<String, Object>>)result;

        	    return recordsList.stream().map(o -> StringUtil.toString(o.get("DEVICE_ID"))).collect(Collectors.toSet());
            }
	    }catch(Exception e) {
		    ServiceLog.error("根据人脸来源和用户映射选择设备失败！", e);
	    }
	   
	    return Collections.EMPTY_SET;
    }
   
   /**
    * 根据设备ID查询设备分组,多个设备ID用逗号分隔
    */
    public static Map<String, Map<String, Object>> queryDeviceGroupByIds(String deviceIds) {
	    StringBuffer url = new StringBuffer(1024);
	    String addr = AppHandle.getHandle(Constants.CONSOLE).getProperty("THE_UNIT_PERMISION_URL", "");
	    String apiStr = "/sysmanager/inner/groupStructureInfo/getGroupsInfoByDeviceIds?isPage=false";
	   
	    url.append(addr).append(apiStr).append("&deviceIds=" + deviceIds);
	   
	    Map<String, Map<String, Object>> idGroupMap = new HashMap<String, Map<String, Object>>();
	    try {
		    String deviceGroupString = HttpUtil.HttpGet(url.toString());
            ServiceLog.info("接口 : " + url.toString() + "--->返回结果--->" + deviceGroupString);
           
            Object result = CommonUtil.jsonStr2List(deviceGroupString);
            if(result != null) {
	            Map<String, Object> recordsMap = (Map<String, Object>)result;
	            for(String key : recordsMap.keySet()) {
	        	    if(recordsMap.get(key) != null) {
	        		    idGroupMap.put(key, ((List<Map<String, Object>>)recordsMap.get(key)).get(0));
	        	    }
	            }
            }
	    }catch(Exception e) {
		    ServiceLog.error("根据ID查询设备分组失败！", e);
	    }
	   
	    return idGroupMap;
    }
   
}
