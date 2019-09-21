package com.suntek.efacecloud.util;

import java.math.BigDecimal;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.apache.commons.lang.StringUtils;
import org.elasticsearch.search.sort.SortOrder;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.blob.BlobType;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.index.Query;
import com.suntek.eap.index.SearchEngineException;
import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.metadata.EAPMetadata;
import com.suntek.eap.metadata.log.EapMetadataLog;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.IDGenerator;
import com.suntek.eap.util.StringUtil;
import com.suntek.efacecloud.dao.FaceAlgorithmNameDao;
/**
 * 公共工具类(包括公共渲染方法)
 * @author guoyl
 * @since 1.0
 * @version 2017年06月16日
 */
public class CommonUtil {
	private final static DateFormat dfm = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	
	/**
	 * 获取图片路径
	 * @param txmc1
	 * @return
	 */
	public static String renderImage(String imgUrl) {
		if (imgUrl.toLowerCase().indexOf("http://") < 0 && imgUrl.toLowerCase().indexOf("ftp://") < 0 && !StringUtil.isEmpty(imgUrl)) {
			
			try {
				String BLOB_TYPE = AppHandle.getHandle(Constants.CONSOLE).getProperty("BLOB_TYPE","fdfs");
				if(Constants.FDFS.equals(BLOB_TYPE)){
					return AppHandle.getHandle(Constants.CONSOLE).getProperty("FDFS_URL","") + imgUrl;
				}else if(Constants.S3FS.equals(BLOB_TYPE)){
					return AppHandle.getHandle(Constants.CONSOLE).getProperty("S3_END_POINT","") +"/"+ imgUrl;
				}
			} catch (Exception e) {
				ServiceLog.error("fdfs获取图片异常"+e.getMessage(), e);
				return imgUrl;
			}
			
			//oss
			String pre = AppHandle.getHandle(Constants.OSS).getProperty("OSS_URL","http://127.0.0.1:6070/oss/v1/db/dir/");
			imgUrl= pre + imgUrl;
		}
		return imgUrl;
	}
	
	
	/**
	 * 获取图片全路径
	 * @param pic
	 * @return
	 */
	public static String renderAlarmImage(String pic) {
		String IP_FILTER_REG = "^http(s)?://(\\w+\\.)*\\w+(:\\d{0,5})?/";
		if (pic.toLowerCase().indexOf("ftp://") < 0 && !StringUtil.isEmpty(pic)) {
			try {
				String BLOB_TYPE = AppHandle.getHandle(Constants.CONSOLE).getProperty("BLOB_TYPE","fdfs");
				if (BlobType.fdfs.getType().equals(BLOB_TYPE)) {
					
					if (pic.startsWith("http")) {
						pic = pic.replaceFirst(IP_FILTER_REG, "");
					}
					String renderImage = AppHandle.getHandle(Constants.CONSOLE).getProperty("FDFS_URL","") + pic;
					return renderImage;
				}else if(BlobType.s3fs.getType().equals(BLOB_TYPE)){
					return AppHandle.getHandle(Constants.CONSOLE).getProperty("S3_END_POINT","") +"/"+ pic;
				}
				
			} catch (Exception e) {
				ServiceLog.error("fdfs获取图片异常"+e.getMessage(), e);
				return pic;
			}
		}
		
		return pic;
	}
	
	
	/**
	 * 获取车辆布控类型
	 * @param type
	 * @return
	 */
	public static String getCarSurveilType(String type) {
		String ret = "未知";	
		switch (type) {
			case "0":
				ret = "涉案";
				break;
			case "1":
				ret = "盗抢";
				break;
			case "2":
				ret = "涉稳";
				break;
			case "3":
				ret = "其他";
				break;
			default:
				break;
		}
		return ret;
	}

	/**
	 * 获取tomcat地址
	 * @return
	 */
	public static String gettTomcatUrl(){
		return "http://"+getTomcatIP()+":"+getTomcatPort()+"/";
	}
	/**
	 * 获取tomcat IP
	 * @return
	 */
	public static String getTomcatIP(){
		return AppHandle.getHandle(Constants.CONSOLE).getProperty("TOMCAT_SERVER_IP", "127.0.0.1");
	}
	
	/**
	 * 获取tomcat 端口
	 * @return
	 */
	public static String getTomcatPort(){
		return AppHandle.getHandle(Constants.CONSOLE).getProperty("TOMCAT_SERVER_PORT", "9080");
	}
	
	

	/**
	 * 获取前后间隔 timeInterval 格式化时间
	 * @param timeInterval
	 * @param time
	 * @return
	 */
	public static Long[] minuteBeforeAndAfterLong(int timeInterval, String time) {
		Calendar rTime = Calendar.getInstance();
		rTime.setTime(DateUtil.toDate(time));
		rTime.add(Calendar.MINUTE, -timeInterval);
		long beforeTimeLong = Long.parseLong(new SimpleDateFormat("yyMMddHHmmss").format(rTime.getTime()));

		rTime.add(Calendar.MINUTE, 2 * timeInterval);
		long afterTimeLong = Long.parseLong(new SimpleDateFormat("yyMMddHHmmss").format(rTime.getTime()));

		return new Long[] { beforeTimeLong, afterTimeLong };
	}
	
	
	
	public static String getPersonTypeName(String pTypeCode){
		switch(pTypeCode){
			case "1":
				return "户籍人员";
			case "2":
				return "流动人员";
			case "3":
				return "外籍人员";
			default:
				return "未知";
		}
	}
	
	public static String getRoomUseName(String roomUse){
		switch(roomUse){
			case "1":
				return "自住";
			case "2":
				return "出租";
			case "3":
				return "商铺";
			case "4":
				return "办公";
			case "5":
				return "空置";
			case "-1":
				return "其他";
			default:
				return "";
		}
	}
	
	/**
	 * 获取人员现住地址或常住地址
	 * @return
	 */
	public static String renderPersonAddress(String addressCode) {
		if (StringUtil.isEmpty(addressCode)) {
			return "";
		}
		
		String address = "";
		while (addressCode.length() >= 2) {
			address = StringUtil.toString(EAP.metadata.getDictValue(Constants.DICT_KIND_PERSON_ADDRESS, addressCode)) + address;
			addressCode = addressCode.substring(0, addressCode.length() - 2);
		}
		
		return address;
	}
	
	
	public static String getNginxPrefix() {
		return getNginxIpWithHttp() + "/fs/";
	}
	
	public static String getNginxIpWithHttp() {
		String ip = AppHandle.getHandle(Constants.CONSOLE).getProperty("NGINX_IP", "16.58.3.45");
		if (ip.indexOf("http://") <0) {
			ip = "http://" + ip;
		}
		
		return ip;
	}
	
	public static String getGwfIP() {
		return AppHandle.getHandle(Constants.CONSOLE).getProperty("GWF_SERVER_IP","16.58.3.130");
	}
	
	public static String getGwfPort() {
		return AppHandle.getHandle(Constants.CONSOLE).getProperty("GWF_SERVER_PORT","9082");
	}
	
	/**
	 * 根据key从redis中获取值
	 * 
	 * @author whp
	 * @param redisKey
	 * @param defaultValue
	 *            为空时返回值
	 * @return
	 */
	public static String getRedisByKey(String redisKey, String defaultValue) {
		String val = defaultValue;
		try {
			val = EAP.redis.get(redisKey);
			if (StringUtil.isEmpty(val)) {
				val = defaultValue;
			}
		} catch (Exception e) {
			ServiceLog.error("[redis]getkey=\"" + redisKey + "\" cause error :"
					+ e.toString());
		}
		return val;
	}	
	
	
	
	/**
	 * 获取某种设备类型某段时间内的落地数据量
	 * @return
	 */
	public static Long getDataCountByDeviceType(String deviceType, String beginDay, String endDay) {		
		Long totalNum = 0L;
		Calendar cal = Calendar.getInstance();
		cal.setTime(DateUtil.toDate(beginDay, DateUtil.yyyyMMdd_style));	
		while(true) {
			Date date =  cal.getTime();
			String dayTime = DateUtil.dateToString(date , DateUtil.yyyyMMdd_style);
			if(dayTime.compareTo(endDay) > 0) {
				break;
			}			
			String num = CommonUtil.getRedisByKey(Constants.STAT_PREFIX + deviceType + Constants.STORE_FIELD + dayTime, "0");
			totalNum+=Long.parseLong(num);
			cal.add(Calendar.DATE, +1);
		}
		return totalNum;
	}

	/**
	 * 从字典缓存获取
	 * @return
	 */
	public static String getAlgoTypeStr() {
		Map<Object, Object> dictMap = EAPMetadata.dict.getDictMap(Constants.DICT_KIND_ALGORITHM_TYPE);
		String algoType = StringUtils.join(dictMap.keySet().toArray(),",");
		return algoType;
	}
	
	/**
	 * 从字典缓存获取
	 * @return
	 */
	public static List<Integer> getAlgoTypeList() {
		Map<Object, Object> dictMap = EAPMetadata.dict.getDictMap(Constants.DICT_KIND_ALGORITHM_TYPE);
		List<Integer> result = Arrays.asList(dictMap.keySet().toArray())
				.stream().map(f->Integer.parseInt(StringUtil.toString(f))).collect(Collectors.toList());
		return result;
	}
	/**
	 * 根据算法id从字典缓存获取算法
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static Map<Object, Object> getAlgorithmById(Object id) {
		Map<Object, Object> map = new HashMap<Object, Object>();
		try {
			Map<Object, Object> result = EAPMetadata.dict.getDictMap(Constants.DICT_KIND_ALGORITHM_TYPE, id);
			if (result != null && result.get(id) != null) {
				map = (Map<Object, Object>) result.get(id);
			}
		} catch (Exception e) {
			EapMetadataLog.log.error("获取算法资源失败：", e);
		}
		return map;
	}

	public static String getToday() {
		return dfm.format(new Date());
	}
	
	/**
	 * 判断是否包含中文
	 * @param str
	 * @return
	 */
	public static boolean isContainChinese(String str) {

        Pattern p = Pattern.compile("[\u4e00-\u9fa5]");
        Matcher m = p.matcher(str);
        if (m.find()) {
            return true;
        }
        return false;
    }
	
	public static String getNameByAlgoType(int algoType){
    	
		String filedName = "";
		switch (algoType) {
			case 10001:
				filedName = "云从2.6人脸算法";
				break;
			case 10002:
				filedName = "云从3.1人脸算法";
				break;
			case 10003:
				filedName = "云从3.5人脸算法";
				break;
			case 20000:
				filedName = "依图人脸算法";
				break;
			case 30000:
				filedName = "华为人脸特征提取算法";
				break;
			default:
				filedName = ""; 
		}
		return filedName;
    }
	
	/**
	 * 获取核验算法
	 * 
	 * @param checkAlgoArray
	 * @return
	 */
	public static List<Map<Object, Object>> getCheckAlgoList(com.alibaba.fastjson.JSONObject checkAlgoObject) {
		List<Map<Object, Object>> checkAlgoList = new ArrayList<>();
		if (null != checkAlgoObject) {
			for (String algoType : checkAlgoObject.keySet()) {
				String algoName = getNameByAlgoType(Integer.parseInt(algoType));
				if (!StringUtil.isEmpty(algoName)) {
					String score = StringUtil.toString(checkAlgoObject.getJSONObject(algoType).get("SCORE"));
					Map map = new HashMap<String, Object>();
					if (StringUtil.isEmpty(score) || score.equals("-1") || score.equals("0")) {
						map.put("SCORE", "失败");
					} else {
						map.put("SCORE", score + "%");
					}
					map.put("ALGORITHM_NAME", algoName);
					checkAlgoList.add(map);
				}
			}
		}
		return checkAlgoList;
	}
	
	/**
	*将Object转换为String
	*/
	public static String objectToString(Object o){
        if(o == null){
            return "";
        }else if(o instanceof String){
            return (String)o;
        }else if(o instanceof Integer){
            return String.valueOf((Integer)o);
        }else if(o instanceof Long){
            return String.valueOf((Long)o);
        }else if(o instanceof Double){
            return String.valueOf((Double)o);
        }else if(o instanceof Float){
            return String.valueOf((Float)o);
        }
        else{
            return "";
        }
    }


	/**
	*将Object转换为Double
	*/
	public static Double objectToDouble(Object o){
        if(o instanceof BigDecimal){
            return ((BigDecimal) o).doubleValue();
        }else if(o instanceof String){
            return Double.valueOf((String)o);
        }else if(o instanceof Integer){
            return Double.valueOf((Integer)o);
        }else if(o instanceof Double){
            return (Double)o;
        }else if(o instanceof Long){
            return ((Long) o).doubleValue();
        }else{
            return 0.0;
        }
    }
	
	public static String renderDriverRole(Object driverRole){
    	int driverCode  = Integer.valueOf(StringUtil.toString(driverRole, "-1"));
    	if (driverCode == 0) {
			return "副驾";
		}else if (driverCode == 1) {
			return "主驾";
		}else if (driverCode == 2) {
			return "驾驶员";
		}else{
			return "未知";
		}
    }
	
	/**
	 * es通过infoId查找数据
	 */
	public static PageQueryResult getPageResultByInfoId(List<Map<String, Object>> resultSet) {
		List<String> idList = new ArrayList<>();

		try {
			for (Map<String, Object> map : resultSet) {
				idList.add(StringUtil.toString(map.get("INFO_ID")));
			}
			
			String[] idsArr = ModuleUtil.strListToStrArr(idList);
			String[] indexName = new IDGenerator().getIndexNameFromIds(Constants.FACE_INDEX + "_", idsArr);
	
			Query query = new Query(1, 1000);
			query.addSort("INFO_ID", SortOrder.DESC);
			query.addEqualCriteria("INFO_ID", idsArr);
			
			PageQueryResult pageResult = EAP.bigdata.query(indexName, Constants.FACE_TABLE, query);
			return pageResult;
		} catch (SearchEngineException e) {
			ServiceLog.error("es通过infoId查找数据失败，原因：" + e.getMessage(), e);
		}
		return null;
	}
	
	public static void reanderScore(List<Map<String, Object>> list, String algoType, String key) {
		Float scoreRate = getAlgoScoreRate(algoType);
		for (Map<String, Object> map : list) {
			map.put("ORIGINAL_" + key, map.get(key));
			int score = Math.round(Integer.parseInt(StringUtil.toString(map.get(key),"0")) * scoreRate);
			if (score > 99) {
				score = 99;
			}
			map.put(key, score);
		}
	}
	
	/*
	 * 获取算法类型的score_rate属性
	 */
	public static Float getAlgoScoreRate(String algoType) {
		List<Map<String, Object>> list = new FaceAlgorithmNameDao().getAlgorithmScoreRate(algoType);
		Float score;
		if (null == list || list.size() == 0) {
			score = 1F;
		}else {
			score = StringUtil.toFloat(list.get(0).get("SCORE_RATE"), 1);
		}
		return score;
	}

	/**
	 * 获取多脸布控类型
	 * @param coverType
	 * @return
	 */
	public static String getMutilFaceAlarmType(String coverType) {
		String result = "";
		switch (coverType) {
			case "0":
				result = "非本人";
				break;
			case "1":
				result = "本人";
				break;
			case "2":
				result = "封面";
				break;
			default:
				result = "--";
		}
		return result;
	}

	/**
	 * 获取告警确认状态
	 * @param confirmStatus
	 * @return
	 */
	public static String getAlarmConfirmStatus(String confirmStatus) {
		String result = "--";
		if (confirmStatus == null) {
			return result;
		}
		switch (confirmStatus) {
			case "0":
				result = "不准确";
				break;
			case "1":
				result = "准确";
				break;
			default:
				result = "--";
		}
		return result;
	}

	public static List<Map<String,Object>> getFeishiAlgoList(){
		List<Map<String,Object>> list = new ArrayList<>();
		list.add(new HashMap<String,Object>(){{
				put("id","110");
				put("name","依图算法");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","111");
				put("name","商汤算法");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","112");
				put("name","云从算法");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","113");
				put("name","Face++算法 ");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","114");
				put("name","云天励飞算法");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","115");
				put("name","像素算法");
			}});
		return list;
	}

	public static List<Map<String,Object>> getAllRepositorieId() {
		List<Map<String,Object>> list = new ArrayList<>();
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880007");
				put("name","全国在逃人员");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880016");
				put("name","常住人口");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880017");
				put("name","流动人口");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880006");
				put("name","警综犯罪嫌疑人库");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","2599570e4ddd49fdaaa102fd7329e415");
				put("name","新疆人员库");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880015");
				put("name","新疆籍网上在逃");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880025");
				put("name","在粤维族人员");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880036");
				put("name","重点人员-全国涉毒");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880037");
				put("name","重点人员-全国刑事犯罪前科");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880038");
				put("name","重点人员-全国重点上访人员");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880010");
				put("name","广东监狱");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880038");
				put("name","重点人员-全国肇事精神病人");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880002");
				put("name","重点人员-省违法犯罪库-拘留所");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880003");
				put("name","重点人员-省违法犯罪库-戒毒所-拘留所");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880032");
				put("name","重点人员-省违法犯罪库-陆丰籍涉毒在逃人员");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880009");
				put("name","重点人员-布控库-拘留所");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880021");
				put("name","境外人员");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880020");
				put("name","从业人员");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880023");
				put("name","人口注销库");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880048");
				put("name","预备人员");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880002");
				put("name","重点人员-省违法犯罪库-拘留所");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880008");
				put("name","省违法犯罪库-收教所");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880011");
				put("name","省违法犯罪库-看守所");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880012");
				put("name","省违法犯罪库-劳教所");
			}});

		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880049");
				put("name","溯源专案");
			}});

		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880050");
				put("name","广铁-违法犯罪人员");
			}});
		list.add(new HashMap<String,Object>(){{
				put("id","88888888888888888888888888880051");
				put("name","广铁-抓获在逃人员");
			}});
		return list;
	}
	
	/**
	 * 
	 * @param jsonStr
	 * @return
	 */
    public static Object jsonStr2List(String jsonStr){
	
		if(StringUtil.isEmpty(jsonStr)) {
			return null;
		}
		
		JSONObject jsobObj = JSONObject.parseObject(jsonStr);
		
		JSONObject responseStatusObject = jsobObj.getJSONObject("responseStatusObject");
		
		String statusCode = responseStatusObject.getString("statusCode");
		if(!"0".equals(statusCode)) {
			return null;
		}
		
		JSONObject responseResultObj = jsobObj.getJSONObject("responseResult");
		
		Object  recordObj = responseResultObj.get("records");
		if(null == recordObj || !(recordObj instanceof List<?>)) {
			return null;
		}
		
		return recordObj;
	}

}
