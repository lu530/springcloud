package com.suntek.efacecloud.dao;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.suntek.eap.EAP;
import com.suntek.eap.jdbc.dialect.Dialect;
import com.suntek.eap.jdbc.dialect.DialectFactory;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.util.Constants;

/**
 * 设备资源信息DAO
 * @author linsj
 * @since 6.0
 * @version JAN 24, 2015
 * @Copyright (C)2015 , Suntektech
 */
@SuppressWarnings("rawtypes")
public class DeviceInfoDao
{
	private final JdbcTemplate jdbc = EAP.jdbc.getTemplate(Constants.APP_NAME);
	
	private Dialect dialect = DialectFactory.getDialect(Constants.APP_NAME, "");
	
	public List getDeviceInfoList()
	{
		String sql = "select DEVICE_NAME KKMC,DEVICE_ID KKBH,LONGITUDE KKJD,LATITUDE KKWD,DEVICE_TYPE,DEVICE_ADDR,ORG_NAME from V_VPLUS_DEVICE_INFO";
		return jdbc.queryForList(sql);
	}
	
	public List<String> getDeviceIdsByUserCode(String userCode, int deviceType, String table) 
	{
		String sql = "select c.DEVICE_ID from "
				+ table + " a"
				+ " left join VPLUS_SCENE_INFO b"
				+ " on a.ORG_CODE = (b.ORG_CODE+b.NODE_FLAG)"
				+ " left join V_VPLUS_DEVICE_INFO c"
				+ " on b.SCENE_ID = c.SCENE_ID"
				+ " where c.DEVICE_TYPE=?"
				+ " and a.IS_HALF='0' and a.USER_CODE=?";
		
		return jdbc.queryForList(sql, new Object[] { deviceType, userCode }, String.class);
	}

	public List<String> getUserResorceByUserCode(String userCode) 
	{
		String sql = "select ORG_CODE from  SYS_USERRESOURCE su where su.IS_HALF = '0' and su.USER_CODE = ? and "
				+ dialect.length("ORG_CODE") + " < 10";

		return jdbc.queryForList(sql, new Object[] { userCode }, String.class);
	}
	
	/** 
	 * 根据所属组织和设备类型获取设备编号
	 * @param treeNodeId
	 * @param deviceType
	 * @return
	 */
	public List<Map<String,Object>> getDeviceIdByType(String treeNodeId,String deviceType)
	{	
		String sql = "select v.DEVICE_ID from V_VPLUS_DEVICE_INFO v where v.DEVICE_TYPE = ? and v.ORG_CODE like ?";		
		
		return jdbc.queryForList(sql, deviceType, treeNodeId+"%");
	}
	
	/** 
	 * 根据设备类型和关键字获取设备编号
	 * @param treeNodeId
	 * @param deviceType
	 * @return
	 */
	public List<Map<String,Object>> getDeviceIdByTypeAndKeyword(String deviceType,String keyword)
	{	
		String sql = "select v.DEVICE_ID, v.DEVICE_ID_INT from V_VPLUS_DEVICE_INFO v where v.DEVICE_TYPE = ? and (v.DEVICE_NAME like ? or DEVICE_ADDR like ?)";		
		
		return jdbc.queryForList(sql, deviceType, "%"+keyword+"%", "%"+keyword+"%");
	}
	
	 
	public Map<String, Object> getCameraNum(int orgCode) {
		
		String sql = "select count(*) NUM from V_VPLUS_DEVICE_INFO where DEVICE_TYPE = ? and '' + ORG_CODE like ? ";
		return jdbc.queryForMap(sql, Constants.DEVICE_TYPE_FACE, orgCode + "%");
	}
	
	public List<Map<String, Object>> getZppInfoListByName(String name){
		
		String sql = "select ZPPDM,CLPP from CARBRAND_INFO where CLPP like '%" + name + "%'";
		return jdbc.queryForList(sql);
	}

    /**
     * 获取人脸抓拍机设备详情
     * 
     * @param deviceId
     * @return
     */
    public List<Map<String, Object>> getFaceCapInfo(String keyWords, String orgCodes) {
        String sql = "select i.DEVICE_ID,i.NAME,i.MANUFACTURER_NAME,i.INSTALL_ADDR,e.IP_ADDR IP_ADDR,"
            + " i.LONGITUDE,i.LATITUDE,case when i.STATUS_FLAG = 1 then '在线' else '离线' end as STATUS_FLAG"
            + " from VPLUS_VIDEO_CAMERA i left join VPLUS_VIDEO_ENCODER e on i.PARENT_ID=e.DEVICE_ID "
            + " where i.SPECIAL_PURPOSE in (1) and (i.DEVICE_ID like ? or i.NAME like ?) ";
        if (!StringUtil.isEmpty(orgCodes)) {
            sql += "and i.DEVICE_ID in ('" + orgCodes + "')";
        }
        return jdbc.queryForList(sql, "%" + keyWords + "%", "%" + keyWords + "%");
    }
}
