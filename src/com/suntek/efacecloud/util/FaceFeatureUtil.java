package com.suntek.efacecloud.util;

import java.util.HashMap;
import java.util.Map;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.util.StringUtil;

/**
 * 获取图片特征提取值及人脸质量检测接口
 * @author zhangliping
 * @since 1.0.0
 * @version 2018年05月03日
 * @Copyright (C)2018 , Suntektech
 */
public class FaceFeatureUtil 
{
	/** 提取特征成功标志 **/
	public static final int SUCC = 0;

	private static FeatureExtract featureExtract = new FeatureExtract();
	
	/**
	 * 人脸质量检测
	 * @param fileUrl base64编码图片
	 * @return 检测结果
	 */
	public static FeatureResp faceQualityCheck(String fileUrl)
	{
		
        Map<String,Object> map = new HashMap<String,Object>();
//        int algoType = Constants.DEFAULT_ALGO_TYPE;
        int algoType = Integer.parseInt(AppHandle.getHandle(Constants.APP_NAME).getProperty("VRS_ALGO_TYPES", "10003"));
        map.put("fileUrl",fileUrl);
        map.put("algoType", algoType);
        
        Map<String, Object> retMap  = featureExtract.getFeatureExtract(map);
        
        long code = (long) retMap.get("code");
        String message = StringUtil.toString(retMap.get("message"));
        if (code != SUCC) {
			return new FeatureResp(false, message, algoType);
		}else {
			JSONObject structInfo = JSONObject.parseObject(StringUtil.toString(retMap.get("struct_info")));
			float scores = Float.parseFloat(StringUtil.toString(structInfo.get("target_score")));
			String feature = StringUtil.toString(structInfo.get("feature_info"));
			int score = Integer.valueOf(StringUtil.toString(scores*100).split("\\.")[0]);
			
			return new FeatureResp(message,feature,score, algoType, true);
		}
	}
	
	public static class FeatureResp{
		private String rltz;
		private int score;
		private boolean isValid;
		private String errorMsg;
		int algoType;
		
		public FeatureResp(boolean isValid, String errorMsg, int algoType){
			this.isValid = isValid;
			this.errorMsg = errorMsg;
			this.algoType = algoType;
		}
		
		public FeatureResp(String rltz, int score, boolean isValid) {
			super();
			this.rltz = rltz;
			this.score = score;
			this.isValid = isValid;
		}
		
		public FeatureResp( String errorMsg, String rltz, int score, int algoType, boolean isValid) {
			super();
			this.errorMsg = errorMsg;
			this.rltz = rltz;
			this.score = score;
			this.algoType = algoType;
			this.isValid = isValid;
		}
		
		public String getRltz() {
			return rltz;
		}
		public void setRltz(String rltz) {
			this.rltz = rltz;
		}
		public int getScore() {
			return score;
		}
		public void setScore(int score) {
			this.score = score;
		}

		public boolean isValid() {
			return isValid;
		}

		public void setValid(boolean isValid) {
			this.isValid = isValid;
		}

		public String getErrorMsg() {
			return errorMsg;
		}

		public void setErrorMsg(String errorMsg) {
			this.errorMsg = errorMsg;
		}

		public int getAlgoType() {
			return algoType;
		}

		public void setAlgoType(int algoType) {
			this.algoType = algoType;
		}
		
	}
}
