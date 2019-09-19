package com.suntek.efacecloud.callable;

import java.util.concurrent.Callable;

import com.suntek.eap.common.CommandContext;
import com.suntek.eaplet.registry.Registry;

/**
 * 飞识人脸比对线程
 * 
 * @author zwl
 * @since
 * @version 2018年2月1日
 */
public class FaceCompareCallable implements Callable<CommandContext> {

    private CommandContext context;

    public FaceCompareCallable(CommandContext context) {
        this.context = context;
    }

    @Override
    public CommandContext call() throws Exception {

        Registry registry = Registry.getInstance();
        registry.selectCommands(context.getServiceUri()).exec(context);
        return context;
    }

}
