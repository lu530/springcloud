package com.suntek.efacecloud.service.face.tactics.async;

import com.suntek.eap.EAP;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.service.face.FaceNVNTaskDao;
import com.suntek.efacecloud.service.face.FaceNVNTaskService;
import com.suntek.efacecloud.service.face.OnlineTaskCounter;

import java.util.Map;

public class AsyncService {


    private FaceNVNTaskDao taskDao = new FaceNVNTaskDao();

    private FaceNVNTaskService faceNVNTaskService = new FaceNVNTaskService();

    /**
     * 增加异步任务
     * @param context
     * @param totalNum
     * @param params
     * @param taskType
     */
    public void addAsyncTask(RequestContext context, Integer totalNum, Map<String, Object> params, String taskType) {
        if (totalNum > 100000) {
            context.getResponse().putData("CODE", -1);
            context.getResponse().putData("MESSAGE", String.format("所选范围内有%s张人脸照片，超出比对上限100000张", totalNum));
            return;
        }
        String taskId = EAP.keyTool.getIDGenerator() + "";
        this.faceNVNTaskService.insertNvnTask(taskId,
                params,
                totalNum,
                context.getUserCode(),
                taskType);
        String handleTime = StringUtil.toString(taskDao.getHandleTime(), "0");
        context.getResponse().putData("IS_ASYNC", "1");
        context.getResponse().putData("MESSAGE", "预估处理时间为" + handleTime + "分钟");
    }
}
