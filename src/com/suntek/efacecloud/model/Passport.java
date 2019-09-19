package com.suntek.efacecloud.model;

/**
 * 卡口信息模型
 * @author wsh
 * @since 6.0
 * @version 2016-01-16
 * @Copyright (C)2016 , Suntektech
 */
public class Passport 
{
	private int id; //主键
	private String kkbh; //卡口编号
	private String kkmc; //卡口名称
	private String dwbh; //单位编号
	private float xCoordinate; //经度
	private float yCoordinate; //纬度
	private String addr; //地址
	private String orgName; //行政区域
	
	public Passport() {}
	
	public Passport(String kkbh, String kkmc) 
	{
		this.kkbh = kkbh;
		this.kkmc = kkmc;
	}
	
	public Passport(String kkbh, String kkmc, float x, float y) 
	{
		this.kkmc = kkmc;
		this.kkbh = kkbh;
		this.xCoordinate = x;
		this.yCoordinate = y;
	}
	
	public Passport(String kkbh, String kkmc, float x, float y, String addr) 
	{
		this.kkmc = kkmc;
		this.kkbh = kkbh;
		this.xCoordinate = x;
		this.yCoordinate = y;
		this.addr = addr;
	}
	
	public Passport(String kkbh, String kkmc, float x, float y, String addr, String orgName) 
	{
		this.kkmc = kkmc;
		this.kkbh = kkbh;
		this.xCoordinate = x;
		this.yCoordinate = y;
		this.addr = addr;
		this.orgName = orgName;
	}

	public String getKkbh() 
	{
		return kkbh;
	}
	
	public void setKkbh(String kkbh) 
	{
		this.kkbh = kkbh;
	}
	
	public String getKkmc() 
	{
		return kkmc;
	}
	
	public void setKkmc(String kkmc) 
	{
		this.kkmc = kkmc;
	}
	
	public float getxCoordinate() 
	{
		return xCoordinate;
	}
	
	public void setxCoordinate(float xCoordinate) 
	{
		this.xCoordinate = xCoordinate;
	}
	
	public float getyCoordinate() 
	{
		return yCoordinate;
	}
	
	public void setyCoordinate(float yCoordinate) 
	{
		this.yCoordinate = yCoordinate;
	}

	public int getId()
	{
		return id;
	}

	public void setId(int id) 
	{
		this.id = id;
	}

	public String getDwbh() 
	{
		return dwbh;
	}

	public void setDwbh(String dwbh) 
	{
		this.dwbh = dwbh;
	}

	public String getAddr() 
	{
		return addr;
	}

	public void setAddr(String addr) 
	{
		this.addr = addr;
	}

	/**
	 * @return the orgName
	 */
	public String getOrgName() 
	{
		return orgName;
	}

	/**
	 * @param orgName the orgName to set
	 */
	public void setOrgName(String orgName) 
	{
		this.orgName = orgName;
	}
}
