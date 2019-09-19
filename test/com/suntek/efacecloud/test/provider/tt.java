package com.suntek.efacecloud.test.provider;

import com.suntek.eap.util.StringUtil;

public class tt {

	public static void main(String[] args) {
		String threshold = "70";
		if (!StringUtil.isNull(threshold)) {
			float score = Integer.parseInt(threshold) / 100;
			System.out.println(score);
		}
	}
}
