package com.suntek.efacecloud.job;

import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.service.face.FaceNVNTaskDao;
import com.suntek.efacecloud.service.face.FaceNVNTaskService;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

/**
 * nvn服务定时任务
 * 
 * @author wjy
 * @since 1.0
 * @version 2019年6月11日
 */
public class FaceNvNTaskExecuteJob implements Job {

    private FaceNVNTaskDao faceNVNTaskDao = new FaceNVNTaskDao();

    public FaceNVNTaskService service = new FaceNVNTaskService();

    public static volatile boolean isFinish = true;
    
    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        if (!ConfigUtil.getIsNvnAsync()) {
            return;
        }
        if (isFinish && !faceNVNTaskDao.isExistsGetingResultTask()) {
            Log.nvnTaskLog.debug("------------------>执行nvn定时器开始");
            isFinish = false;
            RequestContext ctx = new RequestContext(null);
            ctx.setModule(Constants.APP_NAME);
            ctx.setUserCode("admin");
            service.executeTask(ctx);
        }
        else {
            Log.nvnTaskLog.debug("------------------>当前有nvn任务正在执行中");
        }
    }
}
