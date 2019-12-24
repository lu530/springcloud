package com.suntek.efacecloud.util;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.common.util.StringUtil;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eaplet.registry.Registry;
import com.suntek.sp.common.common.BaseCommandEnum;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;

/**
 * 获取图片特征提取值及人脸质量检测接口
 *
 * @author gaosong
 * @version 2017年11月09日
 * @Copyright (C)2017 , Suntektech
 * @since 1.0.0
 */
public class FaceDetectUtil {

    /**
     * 提取特征成功标志
     **/
    public static final int SUCC = 0;

    /**
     * 提取人脸特性
     *
     * @param faceImgUrl 图片url
     * @param algoType   算法类别
     *                   10001	云从2.6人脸算法
     *                   10002	云从3.1人脸算法
     *                   10003	云从3.5人脸算法，默认算法类型
     *                   20000	依图人脸算法
     *                   30000	像素人脸算法
     * @return
     */
    public static FaceDetectResp getFaceDetectResp(String faceImgUrl, int algoType) {

        CommandContext context = new CommandContext("admin", "suntek");
        Map<String, Object> body = new HashMap<String, Object>();
        body.put("fileUrl", faceImgUrl);
        body.put("algoType", algoType);
        context.setBody(body);

        Registry registry = Registry.getInstance();
        try {
            registry.selectCommands(BaseCommandEnum.faceFeatureExtract.getUri()).exec(context);
        } catch (Exception e) {
            ServiceLog.error(e);
            return new FaceDetectResp(1, "人脸特征提取服务调用异常");
        }

        long code = context.getResponse().getCode();
        String message = context.getResponse().getMessage();
        if (code != SUCC) {
            return new FaceDetectResp((int) code, message, algoType);
        } else {
            JSONObject structInfo = JSONObject.parseObject(StringUtil.toString(context.getResponse().getData("struct_info")));
            float scores = Float.parseFloat(StringUtil.toString(structInfo.get("target_score")));
            String feature = StringUtil.toString(structInfo.get("feature_info"));
            int score = Integer.valueOf(StringUtil.toString(scores * 100).split("\\.")[0]);

            return new FaceDetectResp(0, message, feature, score, algoType);
        }
    }

    public static Map<String, FaceDetectResp> getFaceDetectResps(String faceImgUrl, String[] algoTypes) {
        Map<String, FaceDetectResp> resps = new HashMap<String, FaceDetectResp>();
        for (String algoType : algoTypes) {
            FaceDetectResp resp = getFaceDetectResp(faceImgUrl, Integer.valueOf(algoType));
            resps.put(algoType, resp);
        }

        return resps;
    }


    public final static class FaceDetectResp {
        int code;
        String errmsg;
        /**
         * 算法类型
         **/
        int algoType;
        String faceFeature;
        int score;

        public FaceDetectResp(int code, String errmsg) {
            super();
            this.code = code;
            this.errmsg = errmsg;
        }

        public FaceDetectResp(int code, String errmsg, int algoType) {
            super();
            this.code = code;
            this.errmsg = errmsg;
            this.algoType = algoType;
        }

        public FaceDetectResp(int code, String errmsg, String faceFeature, int score, int algoType) {
            super();
            this.code = code;
            this.errmsg = errmsg;
            this.faceFeature = faceFeature;
            this.score = score;
            this.algoType = algoType;
        }

        public int getCode() {
            return code;
        }

        public String getErrmsg() {
            return errmsg;
        }

        public String getFaceFeature() {
            return faceFeature;
        }

        public int getScore() {
            return score;
        }

        public int getAlgoType() {
            return algoType;
        }

        public boolean isValid() {
            return code == SUCC;
        }

    }

    /**
     * 提取人脸特性
     *
     * @param faceImgUrl 图片url
     * @param algoType   算法类别
     * @return
     */
    public static List<FaceDetectResp> batchGetFaceDetectResp(String faceImgUrl, List<Integer> algoType) {

        List<FaceDetectResp> result = new ArrayList<>();
        FaceDetectUtil util = new FaceDetectUtil();
        // 创建任务集合
        List<FutureTask<FaceDetectResp>> taskList = new ArrayList<>();
        for (Integer algo : algoType) {
            FutureTask<FaceDetectResp> task =
                    new FutureTask<FaceDetectResp>(util.new GetFaceDetectTask(faceImgUrl, algo));
            taskList.add(task);
            ExecutorProcessPool.getInstance().submit(task);
        }
        //合并结果
        for (FutureTask<FaceDetectResp> ft : taskList) {
            try {
                FaceDetectResp resp = ft.get();
                result.add(resp);
            } catch (InterruptedException | ExecutionException e) {
                ServiceLog.error("提取人脸特性 失败：" + e.getMessage(), e);
            }
        }
        return result;
    }

    class GetFaceDetectTask implements Callable<FaceDetectResp> {

        private int algo;
        private String faceImgUrl;

        public GetFaceDetectTask(String faceImgUrl, Integer algo) {
            this.faceImgUrl = faceImgUrl;
            this.algo = algo;
        }

        @Override
        public FaceDetectResp call() throws Exception {
            return FaceDetectUtil.getFaceDetectResp(faceImgUrl, algo);
        }
    }

    /**
     * 获取红名单工具类实例--兼容不同厂商
     *
     * @return
     */
    public static FaceRedListUtil getFaceRedListUtilInstance() {
        String vendor = AppHandle.getHandle(Constants.OPENGW).getProperty("EAPLET_VENDOR", "Suntek");
        if (vendor.equals(Constants.HIK_VENDOR)) {
            return new HikFaceRedListUtilImpl();
        }
        return new FaceRedListUtilImpl();
    }

}
