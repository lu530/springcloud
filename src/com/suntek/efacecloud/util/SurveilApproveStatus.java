package com.suntek.efacecloud.util;

import java.util.HashMap;
import java.util.Map;


/**
 * 布控审批状态枚举
 * @version 2018-03-26
 * @since 1.0
 * @author lx
 * @Copyright (C)2018 , Suntektech
 */
public enum SurveilApproveStatus 
{
	//0 待审核  1待审批  2审核不通过  3审批不通过  4布控中  5撤控待审核  6撤控待审批  7撤控审核不通过  8撤控审批不通过 9已撤控 10 已删除 11 撤销申请

	NEED_AUDIT(0, "待审核"), NEED_APPROVE(1, "待审批"), AUDIT_NOPASS(2, "审核不通过"), APPROVE_NOPASS(3, "审批不通过"), 
	SURVEILED(4, "布控中"), WITHDROW_NEED_AUDIT(5, "撤控待审核"), WITHDROW_NEED_APPROVE(6, "撤控待审批"), 
	WITHDROW_AUDIT_NOPASS(7, "撤控审核不通过"), WITHDROW_APPROVE_NOPASS(8, "撤控审批不通过"), WITHDROWED(9, "已撤控"), 
	DELETED(10, "已删除"), CANCEL_APPLY(11, "撤销申请");

	private int type;
	private String name;

	SurveilApproveStatus(int type, String name) 
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
		for (SurveilApproveStatus v : SurveilApproveStatus.values()) {
			if (v.type == type) {
				return v.name;
			}
		}

		return "未知";
	}
	
	public static Map<String, Object> getApproveStatusCheck()
	{
		Map<String, Object> statusMap = new HashMap<String, Object>();
		for (SurveilApproveStatus v : SurveilApproveStatus.values()) {
			statusMap.put("value", v.type);
			statusMap.put("text", v.name);
		}
		
		return statusMap;
	}
}
