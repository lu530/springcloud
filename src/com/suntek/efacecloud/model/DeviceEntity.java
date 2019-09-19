package com.suntek.efacecloud.model;

import com.suntek.eap.dict.model.DictField;
import com.suntek.eap.dict.model.ModelObj;

/**设备实体(摄像机，门禁，wifi等)
 * @version 2017-06-16
 * @since 2.0
 * @author gaosong
 *
 */
public class DeviceEntity implements ModelObj {
	
	/**设备名称**/
    @DictField (name="DEVICE_NAME")
    private String deviceName;
    
    /**设备安装地址**/
    @DictField (name="DEVICE_ADDR")
    private String deviceAddr;
    
    /**设备所在经度**/
    @DictField (name="LONGITUDE")
    private double deviceX;
    
    /**设备所在纬度**/
    @DictField(name="LATITUDE")
    private double deviceY;
    
    /**设备所在行政区域**/
    @DictField(name="ORG_NAME")
    private String orgName;
    
    public String getDeviceName(){
		return deviceName;
    }
    
    public String getDeviceAddr() {
		return deviceAddr;
	}
    
    public double getDeviceX() {
		return deviceX;
	}
    
    public double getDeviceY() {
		return deviceY;
	}
    
    public String getOrgName() {
		return orgName;
	}

	public void setDeviceName(String deviceName) {
		this.deviceName = deviceName;
	}

	public void setDeviceAddr(String deviceAddr) {
		this.deviceAddr = deviceAddr;
	}

	public void setDeviceX(double deviceX) {
		this.deviceX = deviceX;
	}

	public void setDeviceY(double deviceY) {
		this.deviceY = deviceY;
	}

	public void setOrgName(String orgName) {
		this.orgName = orgName;
	}
}
