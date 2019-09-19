package com.suntek.efacecloud.util;
/**
 * 布控人员状态枚举类
 * @author liaoweixiong
 * @since 
 * @version 2019年1月5日 Copyright (C)2019 , pcitech
 */
public enum PersonStatus {

	NO_ALARM(0,"未告警"),
	ALARM_SIGNED(1,"已签收"),
	ALARM_NOT_CAPTURE(2,"未抓获"),
	CONFIRM_NONSUSPECT(3,"确认非嫌疑人"),
	ALARM_SUCC_CAPTURE(4,"抓捕成功"),
	FEDBACK(7,"已反馈");
	
	private int type;
	private String name;

	PersonStatus(int type, String name) {
		this.type = type;
		this.name = name;
	}

	public int getType() {
		return type;
	}

	public void setType(int type) {
		this.type = type;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	
}
