package com.suntek.efacecloud.util;

import java.util.HashMap;
import java.util.Map;


/**
 * 流程类型枚举
 * @version 2018-03-26
 * @since 1.0
 * @author lx
 * @Copyright (C)2018 , Suntektech
 */
public enum SurveilProcessType 
{
	//1布控审核 2布控审批 3撤控 4撤控审核 5撤控审批

	APPLY(0, "布控申请"),
	AUDIT(1, "布控审核"), 
	APPROVE(2, "布控审批"),
	WITHDRAW(3, "撤控"),
	WITHDRAW_AUDIT(4, "撤控审核"), 
	WITHDRAW_APPROVE(5, "撤控审批");

	private int type;
	private String name;

	SurveilProcessType(int type, String name) 
	{
		this.type = type;
		this.name = name;
	}

	public int getType() 
	{
		return type;
	}

	public String getName() 
	{
		return name;
	}

	public void setName(String name) 
	{
		this.name = name;
	}

	public void setType(int type) 
	{
		this.type = type;
	}
	
	public static String getName(int type) 
	{
		for (SurveilProcessType v : SurveilProcessType.values()) {
			if (v.type == type) {
				return v.name;
			}
		}

		return "未知";
	}
	
	public static Map<String, Object> getProcessTypes()
	{
		Map<String, Object> statusMap = new HashMap<String, Object>();
		for (SurveilProcessType v : SurveilProcessType.values()) {
			statusMap.put("value", v.type);
			statusMap.put("text", v.name);
		}
		
		return statusMap;
	}
}
