package com.suntek.efacecloud.listener;

import com.suntek.eap.EAP;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.LogFactory;
import com.suntek.efacecloud.util.Constants;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.cache.TreeCache;
import org.apache.curator.framework.recipes.cache.TreeCacheEvent;
import org.apache.curator.retry.ExponentialBackoffRetry;
import org.apache.log4j.Logger;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

/**
 * @author huangyubin
 * @version 2019-12-25
 * @since
 */
public class DeviceHistoryStatusListener implements ServletContextListener {
	private static Logger log = LogFactory.getServiceLog(Constants.APP_NAME);
	private static Logger deviceHistoryStatusLog = LogFactory.getServiceLog("deviceHistoryStatus");

	private String zkPath = AppHandle.getHandle(Constants.APP_NAME).getProperty("ZK_DEVICE_NODE", "/bigdata/config/gateway/capture");
	private String zkServer = AppHandle.getHandle(Constants.CONSOLE).getProperty("ZK_LIST");
	CuratorFramework curator = CuratorFrameworkFactory.builder()
			.connectString(zkServer)
			.sessionTimeoutMs(5000)
			.connectionTimeoutMs(3000)
			.retryPolicy(new ExponentialBackoffRetry(1000, 10))
			.build();
	TreeCache treeCache = new TreeCache(curator, zkPath);

	@Override
		public void contextInitialized(ServletContextEvent servletContextEvent) {
		log.debug("创建设备历史状态记录监听器");
		curator.start();
		treeCache.getListenable().addListener((CuratorFramework c, TreeCacheEvent event) -> {
			switch (event.getType()) {
				case NODE_ADDED:
					EAP.kafkaProxy.sendMessage("QUEUE_VPLUS_DEVICE_HISTORY_STATUS", null, event.getData().getData());
					deviceHistoryStatusLog.debug("ZK监听获取：NODE_ADDED：路径：" + event.getData().getPath() + "，数据：" + new String(event.getData().getData()));
					deviceHistoryStatusLog.debug("成功发送Kafka，topic：QUEUE_VPLUS_DEVICE_HISTORY_STATUS");
					break;
				case NODE_UPDATED:
					EAP.kafkaProxy.sendMessage("QUEUE_VPLUS_DEVICE_HISTORY_STATUS", null, event.getData().getData());
					deviceHistoryStatusLog.debug("ZK监听获取：NODE_UPDATED：路径：" + event.getData().getPath() + "，数据：" + new String(event.getData().getData()));
					deviceHistoryStatusLog.debug("成功发送Kafka，topic：QUEUE_VPLUS_DEVICE_HISTORY_STATUS");
					break;
				default:
					break;
			}
		});
		try {
			treeCache.start();
		} catch (Exception e) {
			log.error("创建Zookeeper->TreeCache监听失败, path：" + zkPath + "error：" + e.getMessage(), e);
		}
	}

	@Override
	public void contextDestroyed(ServletContextEvent servletContextEvent) {
		treeCache.close();
		curator.close();
		log.debug("关闭设备历史状态记录监听器");
	}
}
