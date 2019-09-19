package com.suntek.efacecloud.util;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.suntek.eap.common.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.DESCrypt;
import com.suntek.eap.util.StringUtil;

/**
 * 身份证和姓名脱敏工具类
 * 
 * @author liaoweixiong
 * @since
 * @version 2018年12月11日 Copyright (C)2018 , pcitech
 */
public class MaskIdentityAndNameUtil {

	public static final String IS_MASK_IDENTITY_AND_NAME = AppHandle.getHandle(
			Constants.APP_NAME).getProperty("MASK_IDENTITYID_AND_NAME", "0");
	// 身份证号脱敏开始的位置
	private static final Integer IDENTITY_MASK_START_INDEX = 10;
	// 姓名脱敏开始的位置
	private static final Integer NAME_MASK_START_INDEX = 1;

	/**
	 * 对身份证和姓名进行脱敏处理
	 * 
	 * @param personArchiveFaceList
	 */
	public static void maskIdentityIdAndName(
			List<Map<String, Object>> personArchiveList) {
		for (Map<String, Object> map : personArchiveList) {
			String identity = StringUtil.toString(map.get("IDENTITY_ID"));
			String name = StringUtil.toString(map.get("NAME"));
			if (identity.length() > IDENTITY_MASK_START_INDEX) {
				String prefix = identity
						.substring(0, IDENTITY_MASK_START_INDEX);
				String suffix = identity.substring(IDENTITY_MASK_START_INDEX);
				suffix = DESCrypt.md5(suffix);
				map.put("IDENTITY_ID", prefix + suffix);
			}
			if (name.length() > NAME_MASK_START_INDEX) {
				String prefix = name.substring(0, NAME_MASK_START_INDEX);
				String suffix = name.substring(NAME_MASK_START_INDEX);
				suffix = DESCrypt.md5(suffix);
				map.put("NAME", prefix + suffix);
			}
		}
	}

	/**
	 * 返回给前端对加密信息用*代替
	 * 
	 * @param person
	 */
	public static void renderIdentityIdAndName(Map<String, Object> person) {
		String identityId = StringUtil.toString(person.get("IDENTITY_ID"));
		if (identityId.length() > IDENTITY_MASK_START_INDEX) {
			person.put("IDENTITY_ID",
					identityId.substring(0, IDENTITY_MASK_START_INDEX)
							+ "********");
		}
		String name = StringUtil.toString(person.get("NAME"));
		if (name.length() > NAME_MASK_START_INDEX) {
			person.put("NAME", name.substring(0, NAME_MASK_START_INDEX) + "**");
		}
	}

	/**
	 * 
	 * @param keywords
	 * @return
	 */
	public static Map<String, String> renderQueryParam(String keywords) {
		Map<String, String> query = new HashMap<String, String>();
		String identityIdQuery = "";
		String nameQuery = "";
		if (keywords.length() > NAME_MASK_START_INDEX) {
			String prefix = keywords.substring(0, NAME_MASK_START_INDEX);
			String suffix = DESCrypt.md5(keywords
					.substring(NAME_MASK_START_INDEX));
			nameQuery = prefix + suffix;
		} else {
			nameQuery = keywords;
		}
		if (keywords.length() > IDENTITY_MASK_START_INDEX) {
			String prefix = keywords.substring(0, IDENTITY_MASK_START_INDEX);
			String suffix = DESCrypt.md5(keywords
					.substring(IDENTITY_MASK_START_INDEX));
			identityIdQuery = prefix + suffix;
		} else {
			identityIdQuery = keywords;
		}
		query.put("NAME", nameQuery);
		query.put("IDENTITY_ID", identityIdQuery);
		return query;
	}
}
