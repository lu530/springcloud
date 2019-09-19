package com.suntek.efacecloud.util;

import java.util.HashMap;
import java.util.Map;

/**
 * 车辆字典工具类
 * 
 * @author guoyl
 * @since
 * @version 2017年12月3日
 * @Copyright (C)2016 , Suntektech
 */
public class VehicleUtil {

	

	public Map<String, Object> csysInteger;

	public VehicleUtil() {

		initCsysInteger();

	}

	private void initCsysInteger() {

		csysInteger = new HashMap<String, Object>();

		csysInteger.put("1", "A");
		csysInteger.put("2", "B");
		csysInteger.put("3", "C");
		csysInteger.put("4", "D");
		csysInteger.put("5", "E");
		csysInteger.put("6", "F");
		csysInteger.put("7", "G");
		csysInteger.put("8", "H");
		csysInteger.put("9", "I");
		csysInteger.put("10", "J");
		csysInteger.put("-1", "Z");
	}

}
