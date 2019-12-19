package com.suntek.efacecloud.listener;

import com.suntek.eap.EAP;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.LogFactory;
import com.suntek.eap.metadata.Table;
import com.suntek.eap.util.StringUtil;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.dao.FaceCommonDao;
import com.suntek.efacecloud.job.FaceCompareJob;
import com.suntek.efacecloud.util.AlluxioClientUtil;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.HttpUtil;
import com.suntek.efacecloud.util.SdkStaticLibUtil;
import com.suntek.face.compare.sdk.model.CollisionResult;
import com.suntek.feature.client.AlgorithmType;
import com.suntek.feature.client.DSSClient;
import com.suntek.tactics.api.dss.service.DssService;
import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;
import org.quartz.SchedulerException;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 模块初始化监听类
 * 
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
public class SystemInitListener implements ServletContextListener {
	public static Logger log = LogFactory.getServiceLog(Constants.APP_NAME);

	@Override
	public void contextDestroyed(ServletContextEvent arg0) {
		try {
			EAP.schedule.delJob("faceCompareJob", "faceTriggerGroup");
		} catch (SchedulerException e) {
			log.error("调用人脸识别提取特征APP删除任务异常", e);
		}
	}

	@Override
	public void contextInitialized(ServletContextEvent context) {
	    
	    //预加载新飞识人脸库集合和算法集合
	    //initAlgorithmList();
	    //initRepositoryList();
	    
		initAddressData();

		initPersonTag();

		loadSchema(context);

		AlluxioClientUtil.init();

		try {
			String faceCompareJop = AppHandle.getHandle(Constants.APP_NAME).getProperty("FACE_COMPARE_JOB", "1");
			if (faceCompareJop.equals("1")) {
				String cron = AppHandle.getHandle(Constants.APP_NAME).getProperty("COMPARE_CRON", "15 */1 * * * ?");
				EAP.schedule.addCronTrigger(FaceCompareJob.class, cron, "faceCompareJob", "faceTriggerGroup", new HashMap<String, Object>());
			}
		} catch (SchedulerException e) {
			log.error("调用人脸识别提取特征APP异常", e);
		}
		
		String zkList = AppHandle.getHandle(Constants.CONSOLE).getProperty("ZK_LIST", "localhost:2181");
		Registry registry = Registry.getInstance();
		try {
			registry.connect(zkList);
		} catch (Exception e) {
			log.debug("链接zoo异常", e);
		}

		initStaticLib();
		
		try {
			/** 初始化   1:N/N:N DSS集群 **/
			String zkAddr = ConfigUtil.getOne2NConfig();
	    	String n2nAddr = ConfigUtil.getN2NConfig();

	    	log.debug("初始化   1:N/N:N DSS集群 begin...>>>" +
					" zkAddr = " + zkAddr + "，n2nAddr = " + n2nAddr);

	    	if(!StringUtil.isNull(zkAddr)){
				DSSClient.addClient(zkAddr, AlgorithmType.FACE_ALGORITHM, ConfigUtil.getAlgoTypes());
				log.debug("人脸 DSS客户端 初始化成功！！！");
			}

	    	if(!StringUtil.isNull(n2nAddr)){

				DssService.init(n2nAddr);
				log.debug("人脸 N:N服务 初始化成功！！！");
			}

	    	log.debug("初始化   1:N/N:N DSS集群success!");

			
		} catch (Exception e) {
			log.error("人脸索引集群客户端初始化异常", e);
		}
	}
	
	private void initStaticLib()
	{
		try {
			int algoType = Integer.parseInt(AppHandle.getHandle(Constants.APP_NAME).getProperty("VRS_ALGO_TYPES", "10003"));
			long time = System.currentTimeMillis();
			CollisionResult result = SdkStaticLibUtil.isLibExist(Constants.STATIC_LIB_ID_RED_LIST, algoType);
			if (result.getCode() == Constants.COLLISISON_RESULT_SUCCESS) {
				boolean isExist = (boolean) result.getList().get(0);
				if (!isExist) {
					CollisionResult createReult = SdkStaticLibUtil.createLib(Constants.STATIC_LIB_ID_RED_LIST, algoType);
					if (createReult.getCode() != Constants.COLLISISON_RESULT_SUCCESS) {
						log.error("初始化红名单库[" + Constants.STATIC_LIB_ID_RED_LIST + "]异常");
					}
				}
			}
			log.debug("初始化红名单--耗时:" + (System.currentTimeMillis() - time) + "ms");
		} catch (Exception e) {
			log.error("初始化静态库，发生异常", e);
		}

	}

	private void initAddressData() {
		List<Map<Object, Object>> addressInfo = EAP.metadata.getDictList(Constants.DICT_KIND_PERSON_ADDRESS);
		if (addressInfo.size() == 0) {
			long time = System.currentTimeMillis();
			FaceCommonDao commonDao = new FaceCommonDao();
			List<Map<String, Object>> addressList = commonDao.getAddressInfo();
			addressList.stream().forEach(map -> {
				EAP.metadata.setDict(Constants.DICT_KIND_PERSON_ADDRESS, map.get("CODE"), map.get("NAME"));
			});
			log.debug("加载地址缓存--耗时:" + (System.currentTimeMillis() - time) + "ms");
		}
	}
	
	private void initAlgorithmList(){
	    List<Map<Object,Object>> algorithms = EAP.metadata.getDictList(Constants.NEW_FEISHI_ALGORITHM);
	    if(algorithms!=null){
//      if(1==1){
	        long time = System.currentTimeMillis();
	        String appKey = AppHandle.getHandle(Constants.OPENGW).getProperty("APP_KEY","");
	        String appSecret = AppHandle.getHandle(Constants.OPENGW).getProperty("APP_SECRET","");
	        String userId = AppHandle.getHandle(Constants.OPENGW).getProperty("USER_ID","");
	        String algorithmUrl = AppHandle.getHandle(Constants.OPENGW).getProperty("ALGORITHM_URL","");
	        
	        String data = "?App-Key="+appKey+"&App-Secret="+appSecret+"&User-Id"+userId;
//          String url = "http://localhost:8080/wg_maven_project/echo/getRepositoryList"+data;
            String url = algorithmUrl+data;
            
            String result = HttpUtil.HttpGet(url);
            EAP.metadata.setDict(Constants.NEW_FEISHI_ALGORITHM,Constants.NEW_FEISHI_ALGORITHM, result);
            log.debug("预加载算法列表："+result);
            log.debug("加载新飞识算法列表--耗时:" + (System.currentTimeMillis() - time) + "ms");	        
	    }
	}
	private void initRepositoryList(){
	    List<Map<Object,Object>> repository = EAP.metadata.getDictList(Constants.NEW_FEISHI_REPOSITORY);
	    if(repository!=null){
//	    if(1==1){
	        long time = System.currentTimeMillis();
	        String appKey = AppHandle.getHandle(Constants.OPENGW).getProperty("APP_KEY","");
	        String appSecret = AppHandle.getHandle(Constants.OPENGW).getProperty("APP_SECRET","");
	        String userId = AppHandle.getHandle(Constants.OPENGW).getProperty("USER_ID","");
	        String repositoryList = AppHandle.getHandle(Constants.OPENGW).getProperty("REPOSITORY_URL","");
	        
	        String data = "?App-Key="+appKey+"&App-Secret="+appSecret+"&User-Id"+userId;
//	        String url = "http://localhost:8080/wg_maven_project/echo/getRepositoryList"+data;
	        String url = repositoryList+data;
	        
	        String result = HttpUtil.HttpGet(url);
	        EAP.metadata.setDict(Constants.NEW_FEISHI_REPOSITORY,Constants.NEW_FEISHI_REPOSITORY, result);
	        log.debug("预加载人脸库列表："+result);
	        log.debug("加载新飞识人脸库列表--耗时:" + (System.currentTimeMillis() - time) + "ms");
	    }
	}

	private void initPersonTag() {
		List<Map<Object, Object>> personTagInfo = EAP.metadata.getDictList(Constants.DICT_KIND_PERSON_TAG);
		if (personTagInfo.size() == 0) {
			long time = System.currentTimeMillis();
			FaceCommonDao commonDao = new FaceCommonDao();
			List<Map<String, Object>> tagList = commonDao.getPersonTagInfo();
			tagList.stream().forEach(map -> {
				EAP.metadata.setDict(Constants.DICT_KIND_PERSON_TAG, map.get("CODE"), map.get("NAME"));
			});
			log.debug("加载人员标签缓存--耗时:" + (System.currentTimeMillis() - time) + "ms");
		}
	}

	/**
	 * 加载大数据schema
	 * 
	 * @param context
	 */
	@SuppressWarnings("unchecked")
	private void loadSchema(ServletContextEvent context) {
		InputStream in = context.getServletContext().getResourceAsStream("/META-INF/schema.xml");
		if (in == null) {
			log.debug("Schema.xml not exits in Module efacecloud");
			return;
		}

		try {
			SAXReader reader = new SAXReader();
			Document doc = reader.read(in);
			List<Element> tables = doc.getRootElement().elements();
			for (Element element : tables) {
				Table table = new Table(element);
				if (!(table.getIndice().equals(""))) {
					EAP.bigdata.loadSchema(table.getIndice(), table.getName(), table);
				}
			}
		} catch (Exception e) {
			log.debug("Fail to read schema.xml in Module efacecloud " + e);
		} finally {
			if (in != null) {
				try {
					in.close();
				} catch (IOException e) {
				}
			}
		}
	}
}
