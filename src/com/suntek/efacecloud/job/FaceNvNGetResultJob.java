package com.suntek.efacecloud.job;

import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.log.Log;
import com.suntek.efacecloud.service.face.FaceNVNTaskService;
import com.suntek.efacecloud.util.Constants;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

/**
 * nvn结果获取定时任务
 * 
 * @author wjy
 * @since 1.0
 * @version 2019年7月1日
 */
public class FaceNvNGetResultJob implements Job {

    public FaceNVNTaskService service = new FaceNVNTaskService();
    
    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        Log.nvnTaskLog.debug("------------------>执行nvn结果获取开始");
        RequestContext ctx = new RequestContext(null);
        ctx.setModule(Constants.APP_NAME);
        ctx.setUserCode("admin");
        service.obtainResultByInterface(ctx);
    }
}
