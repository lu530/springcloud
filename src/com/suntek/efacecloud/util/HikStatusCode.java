package com.suntek.efacecloud.util;

/**
 * 海康状态码定义枚举
 * 200	--	调用成功
 * 450	--	记录请求信息时发生错误,具体见返回信息
 * 460	AppKey is null!	请求中appKey为空
 * 461	Signature is null!	请求中签名为空
 * 462	Consumer inexistence!	AppKey对应的合作方不存在
 * 463	Unauthorized Consumer!	未授权的合作方
 * 464	Invalid Signature!	签名不正确
 * 465	Authentication Exception!	权限验证异常，具体见异常信息
 * 466	Parameters Convert Exception!	参数转换异常，具体错误见异常信息
 * @author lx
 * @since 1.0
 * @version 2018年09月26日
 * @Copyright (C)2018 , Suntektech
 */
public enum HikStatusCode {
	
	/**
	 * 海康状态码定义枚举
	 */
    成功(0L), 失败(-1L), 调用成功(200L), 记录请求信息时发生错误(450L), 请求中appKey为空(460L), 请求中签名为空(461L), AppKey对应的合作方不存在(462L), 未授权的合作方(
        463L), 签名不正确(464L), 权限验证异常(465L), 参数转换异常(466L);

	/**
	 * code值
	 */
    private long nCode;

    /**
     * 构造函数，枚举类型只能为私有
     * @param nCode
     */
    private HikStatusCode(long nCode)
    {
        this.nCode = nCode;
    }

    /**
     * 获取编码
     * @return
     */
    public long getCode()
    {
        return this.nCode;
    }

    /**
     * 通过值获取名称
     * @param nCode
     * @return
     */
    public static HikStatusCode getName(long nCode){
        for (HikStatusCode type : values()) {
            if (type.nCode == nCode) {
                return type;
            }
        }
        return null;
    }

    /**
     * 通过名称判断是否包含
     * @param name
     * @return
     */
    public static boolean contains(String name) {
        boolean exists = false;

        HikStatusCode[] instances = values();
        for (HikStatusCode instance : instances) {
            if(instance.name().equals(name)){
                exists = true;
            }
        }
        return exists;
    }
}
