package com.suntek.efacecloud.service.face;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.HandshakeData;
import com.corundumstudio.socketio.SocketConfig;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.LogFactory;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.util.Constants;
import org.apache.log4j.Logger;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 在线nvn任务统计
 * @author wangsh
 * @since 6.0
 * @version 2018-7-23
 *  (C)2014 , Suntektech
 */
public class OnlineTaskCounter {
    public static FaceNVNTaskDao taskDao = new FaceNVNTaskDao();
    
    public static final Logger log = LogFactory.getServiceLog("task_online");
    
	private static SocketIOServer socketServer = null;
	
	private static JSONObject result = new JSONObject();
	/**
	 * 任务进行中数量
	 */
	public static int taskCount = 0;
	
	private static SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	
	public static void startSocketIOServer() {
		try {
			Configuration config = new Configuration();
			InetAddress localHost;
			String localIp = "127.0.0.1";
			try {
				localHost = Inet4Address.getLocalHost();
				localIp = localHost.getHostAddress();
			} catch (Exception e) {
				ServiceLog.error(e);
			}
			String ip = AppHandle.getHandle(Constants.APP_NAME).getProperty("ONLINE_SERVER_IP", localIp);
	        config.setHostname(ip);
	        log.debug("ip:" + ip);
	        int port = Integer.parseInt(AppHandle.getHandle(Constants.APP_NAME)
	        		.getProperty("ONLINE_SERVER_PORT", "9092"));
	        config.setPort(port);
	        log.debug("port:" + port);
	        SocketConfig sockConfig = new SocketConfig();
			sockConfig.setReuseAddress(true);//解决SOCKET服务端重启"Address already in use"异常
			sockConfig.setTcpKeepAlive(false);
			config.setSocketConfig(sockConfig);

	        socketServer = new SocketIOServer(config);
	        socketServer.addConnectListener(new ConnectListener() {
				@Override
				public void onConnect(SocketIOClient client) {
					HandshakeData handshakeData = client.getHandshakeData();
					String userCode = handshakeData.getSingleUrlParam("userCode");
					log.debug(userCode + " connect, total count:" + taskCount);
				    sendOnlineMessage();
				}
			});
	        socketServer.addDisconnectListener(new DisconnectListener() {
				@Override
				public void onDisconnect(SocketIOClient client) {
					HandshakeData handshakeData = client.getHandshakeData();
					String userCode = handshakeData.getSingleUrlParam("userCode");
					log.debug(userCode + " disconnect, total count:" + taskCount);
				    sendOnlineMessage();
				}
			});
	        socketServer.addEventListener("TASK_EVENT", String.class, new DataListener<String>(){
				@Override
				public void onData(SocketIOClient client, String data, AckRequest ackSender) throws Exception {
					JSONObject dataJson = JSON.parseObject(data);
					String userCode = dataJson.getString("userCode");
					log.debug(userCode + " subscribe, total count:" + taskCount);
				    sendOnlineMessage();
				}
	        });

	        socketServer.start();
		}catch(Exception e) {
		    log.error("启动在线统计用户服务失败: " + e.getMessage(), e);
		}
	}
	
	public static void addTask() {
	    taskCount = taskDao.getTotalDoingTask();
        sendOnlineMessage();
	}
	
	public static void removeTask() {
	    taskCount = taskDao.getTotalDoingTask();
        sendOnlineMessage();
	}
	
	public static void sendOnlineMessage() {
		taskCount = taskDao.getTotalDoingTask();
		Collection<SocketIOClient> clients =  socketServer.getAllClients();
		//result.put("CLIENT_NUM", clientCount.get());
		result.put("TASK_COUNT", taskCount);
        for (SocketIOClient c : clients) {
            c.sendEvent("TASK_EVENT", result);
            log.debug("send online task:" + taskCount + " ,receive info" + c.getRemoteAddress() + ":"
                + c.getHandshakeData().getSingleUrlParam("userCode"));
        }
	}
	
	public static void stopSocketIOServer(){
		if(socketServer != null){
			socketServer.stop();
			socketServer = null;
		}
	}
	
	public static Map<String, Object> getClientList() {
		Map<String, Object> result = new HashMap<>(4);
		List<Map<String, Object>> list = new ArrayList<>();
		Collection<SocketIOClient> clients =  socketServer.getAllClients();
		for (SocketIOClient client : clients) {
			Map<String, Object> map = new HashMap<>(4);
			map.put("CLIENT_ADDRESS", client.getRemoteAddress());
			//map.put("SESSION_ID", client.getSessionId());
			HandshakeData handshakeData = client.getHandshakeData();
			String userCode = handshakeData.getSingleUrlParam("userCode");
			String t = handshakeData.getSingleUrlParam("t");
			map.put("USER_CODE", userCode);
			try {
				String stime = t.split("-")[0];
				long time = Long.parseLong(stime);
				String dateStr = dateFormat.format(time);
				map.put("TIME", dateStr);
			}catch(Exception e) {
				ServiceLog.error(e);
			}
			list.add(map);
		}
		//根据时间倒叙
		Collections.sort(list, (o1, o2) -> {
			String time1 = StringUtil.toString(o1.get("TIME"));
			String time2 = StringUtil.toString(o2.get("TIME"));
			return time2.compareTo(time1);
		});
		result.put("task_count", taskCount);
		result.put("client_count", list.size());
		result.put("client_list", list);
		return result;
	}

}
