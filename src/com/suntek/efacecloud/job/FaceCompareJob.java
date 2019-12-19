package com.suntek.efacecloud.job;

import com.alibaba.fastjson.JSON;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.dao.FaceTerminalDao;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.HttpUtil;
import org.apache.commons.collections.MapUtils;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import java.util.List;
import java.util.Map;

/**
 * APP人脸特征提取任务
 *
 * @author lx
 * @version 2017年7月25日
 * @since 1.0
 */
public class FaceCompareJob implements Job {
    private FaceTerminalDao dao = new FaceTerminalDao();

    @SuppressWarnings("unchecked")
    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        String url = AppHandle.getHandle(Constants.APP_NAME).getProperty("APP_FACE_ADDRESS", "http://172.16.64.156:8080");    //请求地址
        if (StringUtil.isEmpty(url)) {
            Log.joblog.debug("未配置人脸特征提取APP地址");
            return;
        }

        Log.joblog.debug("开始调用APP提取人脸特征，地址--" + url + "，获取待提取特征图片数据---");
        List<Map<String, Object>> dataList = dao.getSyncImgList();
        Log.joblog.debug("共获取待提取特征图片数据-" + dataList.size() + "-条");
        if (dataList.size() > 0) {
            for (int i = 0; i < dataList.size(); i++) {
                Map<String, Object> dataMap = dataList.get(i);
                String imgUrl = StringUtil.toString(dataMap.get("IMG"));
                String infoId = StringUtil.toString(dataMap.get("ID"));
                Log.joblog.debug("待提取人脸特征图片---" + imgUrl);
                String result = HttpUtil.getImgRltz(url + "?imgurl=" + imgUrl);
                Log.joblog.debug("提取人脸特征结果---" + result);
                if (!StringUtil.isEmpty(result)) {
                    Map<String, Object> resultMap = (Map<String, Object>) JSON.parse(result);
                    if (MapUtils.getInteger(resultMap, "statusCode", 0) == 0) {
                        String rltz = StringUtil.toString(resultMap.get("alignedData"));
                        boolean flag = dao.updateRltz(infoId, rltz);
                        Log.joblog.debug("更新数据库，结果---" + flag);
                    }
                }
            }
        }
    }
}
