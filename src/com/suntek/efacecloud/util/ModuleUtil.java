package com.suntek.efacecloud.util;

import com.suntek.eap.EAP;
import com.suntek.eap.blob.BlobType;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.metadata.EAPMetadata;
import com.suntek.eap.metadata.log.EapMetadataLog;
import com.suntek.eap.util.Base64;
import com.suntek.eap.util.FastDFSUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.util.calendar.DateUtil;
import com.suntek.efacecloud.log.Log;
import com.suntek.sp.sms.util.SmsUtil;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 应用基础模块方法类
 * 
 * @version 2017-06-27
 * @since 1.0
 * @author gaosong
 */
public class ModuleUtil {
    /**
     * 获取出生日期字符串
     * 
     * @param birthday
     * @return
     */
    public static String renderBirthday(String birthday) {
        if (StringUtil.isNull(birthday)) {
            return "";
        }

        return birthday.substring(0, 4) + "-" + birthday.substring(4, 6) + "-" + birthday.substring(6);
    }

    /**
     * 获取图片全路径
     * 
     * @param pic
     * @return
     */
    public static String renderImage(String pic) {
        
        if (StringUtil.isEmpty(pic)) {
            return pic;
        }
        
        String picLower = pic.toLowerCase();
        if (picLower.indexOf("http://") < 0 && picLower.indexOf("ftp://") < 0 && picLower.indexOf("https://") < 0) {
            try {
                String blobType = ConfigUtil.getBlobType();
                if (BlobType.fdfs.getType().equals(blobType)) {
                    String port = ConfigUtil.getFDFSPort();
                    return FastDFSUtil.identityToFullUrl(pic, port);
                    //return AppHandle.getHandle(Constants.CONSOLE).getProperty("FDFS_URL") + pic;
                }else if(BlobType.s3fs.getType().equals(blobType)){
					return AppHandle.getHandle(Constants.CONSOLE).getProperty("S3_END_POINT","") +"/"+ pic;
				}

            } catch (Exception e) {
                ServiceLog.error("fdfs获取图片异常" + e.getMessage(), e);
                return pic;
            }

            pic = ConfigUtil.getOSSUrl() + pic;
        }

        return pic;
    }
    

    /**
     * 获取图片全路径
     * 
     * @param pic
     * @return
     */
    public static String renderAlarmImage(String pic) {
        if (pic.toLowerCase().indexOf("http://") < 0 && pic.toLowerCase().indexOf("ftp://") < 0 && !StringUtil.isEmpty(pic)) {
            try {
                String blobType = ConfigUtil.getBlobType();
                if (BlobType.fdfs.getType().equals(blobType)) {
                    String renderImage = AppHandle.getHandle(Constants.CONSOLE).getProperty("FDFS_URL") + pic;
                    return renderImage;
                }else if(BlobType.s3fs.getType().equals(blobType)){
					return AppHandle.getHandle(Constants.CONSOLE).getProperty("S3_END_POINT","") +"/"+ pic;
				}

            } catch (Exception e) {
                ServiceLog.error("fdfs获取图片异常" + e.getMessage(), e);
                return pic;
            }
        }

        return pic;
    }

    /**
     * 获取人员现住地址或常住地址
     * 
     * @return
     */
    public static String renderPersonAddress(String addressCode) {
        if (StringUtil.isEmpty(addressCode)) {
            return "";
        }

        String address = "";
        while (addressCode.length() >= 2) {
            address 
                = StringUtil.toString(EAP.metadata.getDictValue(Constants.DICT_KIND_PERSON_ADDRESS, addressCode))
                    + address;
            addressCode = addressCode.substring(0, addressCode.length() - 2);
        }

        return address;
    }

    /**
     * 字符串里含有中文
     * 
     * @param c
     * @return
     */
    public static boolean isChinese(String c) {
        return Pattern.compile("[\u4e00-\u9fa5]").matcher(c).find();
    }

    /**
     * 字符串里含有英文或数字
     * 
     * @param c
     * @return
     */
    public static boolean hasCharacterOrNumber(String c) {
        return Pattern.compile("[0-9a-zA-Z]").matcher(c).find();
    }

    /**
     * 字符串里含有英文
     * 
     * @param c
     * @return
     */
    public static boolean hasCharacter(String c) {
        return Pattern.compile("[a-zA-Z]").matcher(c).find();
    }

    /**
     * 通过年龄段获取查询日期
     */
    public static String[] getAgeGroupTime(int ageGroup) {
        String[] timeArr = new String[2];
        switch (ageGroup) {
            case 1: // 少年 7-17岁
                timeArr[0] = DateUtil.getPreDate(DateUtil.getDate(), Calendar.YEAR, -17);
                timeArr[1] = DateUtil.getPreDate(DateUtil.getDate(), Calendar.YEAR, -7);
                break;
            case 2: // 青年：18岁—40岁
                timeArr[0] = DateUtil.getPreDate(DateUtil.getDate(), Calendar.YEAR, -40);
                timeArr[1] = DateUtil.getPreDate(DateUtil.getDate(), Calendar.YEAR, -18);
                break;
            case 3: // 中年：41—65岁
                timeArr[0] = DateUtil.getPreDate(DateUtil.getDate(), Calendar.YEAR, -65);
                timeArr[1] = DateUtil.getPreDate(DateUtil.getDate(), Calendar.YEAR, -41);
                break;
            case 4: // 老年：66岁以后
                timeArr[0] = DateUtil.getPreDate(DateUtil.getDate(), Calendar.YEAR, -120);
                timeArr[1] = DateUtil.getPreDate(DateUtil.getDate(), Calendar.YEAR, -66);
                break;
            default:
                timeArr[0] = DateUtil.getDate();
                timeArr[1] = DateUtil.getDate();
                break;
        }

        return timeArr;
    }

    /** update索引 **/
    public static void updateEsMap(Map<String, Object> sourceMap, Map<String, Object> map) {
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            sourceMap.put(entry.getKey(), entry.getValue());
        }

        if (sourceMap.containsKey("BIRTHDAY")) {
            sourceMap.put("BIRTHDAY", StringUtil.toString(sourceMap.get("BIRTHDAY")).replaceAll("-", ""));
        }
    }

    /**
     * list转数组
     * @param list
     * @return
     */
    public static String[] listArrToStrArr(List<Object> list) {
        String[] strArr = new String[list.size()];
        for (int i = 0; i < list.size(); i++) {
            strArr[i] = list.get(i) + "";
        }
        return strArr;
    }

    /**
     * list转数组
     * @param list
     * @return
     */
    public static String[] strListToStrArr(List<String> list) {
        String[] strArr = new String[list.size()];
        for (int i = 0; i < list.size(); i++) {
            strArr[i] = list.get(i) + "";
        }
        return strArr;
    }

    /**
     * json对象转map
     * @param jsonObject
     * @return
     * @throws JSONException
     */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> jsonToMap(JSONObject jsonObject) throws JSONException {
        Map<String, Object> result = new HashMap<String, Object>();
        Iterator<String> iterator = jsonObject.keys();
        String key = null;
        Object value = null;
        while (iterator.hasNext()) {
            key = iterator.next();
            value = jsonObject.get(key);
            result.put(key, value);
        }

        return result;
    }

    /**
     * json字符串转map
     * @param str
     * @return
     * @throws JSONException
     */
    public static Map<String, Object> jsonStrToMap(String str) throws JSONException {
        JSONObject json = new JSONObject(str);
        return jsonToMap(json);
    }

    /**
     * @Title: GetImageStrFromUrl
     * @Description: TODO(将一张网络图片转化成Base64字符串)
     * @param imgURL 网络资源位置
     * @return Base64字符串
     */
    public static String getImageStrFromUrl(String imgURL) {
        InputStream inStream = null;
        try {
            // 创建URL
            URL url = new URL(imgURL);
            // 创建链接
            HttpURLConnection conn = (HttpURLConnection)url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);
            inStream = conn.getInputStream();
            byte[] data = IOUtils.toByteArray(inStream);
            return Base64.encode(data);
        } catch (IOException e) {
            ServiceLog.error("imgUrlToBase64 >> 读取图像异常：" + e.getMessage(), e);
        } finally {
            if (inStream != null) {
                IOUtils.closeQuietly(inStream);
            }
        }
        return "";
    }

    /**
     * 图片url转base64
     * @param imgUrl
     * @return
     */
    public static String imgUrlToBase64(String imgUrl) {
        String imageBase64 = "";
        InputStream input = null;
        try {
            input = new URL(imgUrl).openStream();
            byte[] imageBuffer = IOUtils.toByteArray(input);
            imageBase64 = Base64.encode(imageBuffer);
        } catch (Exception e) {
            ServiceLog.error("imgUrlToBase64 >> 读取图像异常：" + e.getMessage(), e);
        } finally {
            if (input != null) {
                IOUtils.closeQuietly(input);
            }
        }

        return imageBase64;
    }

    /**
     * map转json
     * @param map
     * @return
     */
    public static String mapToJson(Map<String, Object> map) {
        return JSONObject.wrap(map).toString();
    }

    /**
     * 获取ES查询的起止日期
     * 
     * @param beginTime 开始日期
     * @param endTime 结束日期
     * @return
     */
    public static Map<String, Object> searchEsTime(String beginTime, String endTime) {
        Map<String, Object> returnMap = new HashMap<String, Object>();

        String esStartTime = ConfigUtil.getIndexBeginTime();
        if (StringUtil.isEmpty(esStartTime)) {
            returnMap.put("code", Constants.SEARCH_ES_TIME_LACK);
            return returnMap;
        }

        String begin 
            = com.suntek.eap.util.DateUtil.convertByStyle(beginTime, com.suntek.eap.util.DateUtil.standard_style,
                com.suntek.eap.util.DateUtil.yyMM_style);

        String end 
            = com.suntek.eap.util.DateUtil.convertByStyle(endTime, com.suntek.eap.util.DateUtil.standard_style,
                com.suntek.eap.util.DateUtil.yyMM_style);

        int esStartTimeInt = Integer.parseInt(esStartTime);
        int beginTimeInt = Integer.parseInt(begin);
        int endTimeInt = Integer.parseInt(end);

        if (endTimeInt < esStartTimeInt) {
            returnMap.put("code", Constants.SEARCH_ES_TIME_OVERSTEP);
            return returnMap;
        }

        if (beginTimeInt < esStartTimeInt) {
            beginTime = esStartTimeInt + "01000000";
            beginTime 
                = com.suntek.eap.util.DateUtil.convertByStyle(beginTime, com.suntek.eap.util.DateUtil.yyMMddHHmmss_style,
                    com.suntek.eap.util.DateUtil.standard_style);
        }

        returnMap.put("code", Constants.SEARCH_ES_TIME_SUCCESS);
        returnMap.put("beginTime", beginTime);
        returnMap.put("endTime", endTime);

        return returnMap;
    }

    /**
     * 判断time是否在from，to之内
     *
     * @param time 指定日期
     * @param from 开始日期
     * @param to 结束日期
     * @return
     */
    public static boolean belongCalendar(String time, String from, String to) {
        Calendar date = Calendar.getInstance();
        date.setTime(com.suntek.eap.util.DateUtil.toDate(time));

        Calendar after = Calendar.getInstance();
        after.setTime(com.suntek.eap.util.DateUtil.toDate(from));

        Calendar before = Calendar.getInstance();
        before.setTime(com.suntek.eap.util.DateUtil.toDate(to));

        if (date.after(after) && date.before(before)) {
            return true;
        }

        return false;
    }

    /**
     * 判断开始时间和结束时间是否在当前时间的三个月之内
     * 
     * @param args
     */
    public static boolean isSearchHotData(String beginTime, String endTime) {
        String now = DateUtil.getPreDate(com.suntek.eap.util.DateUtil.getDate(), Calendar.DAY_OF_MONTH, 1);
        String preThreeMonth = DateUtil.getPreDate(now, Calendar.MONDAY, -3);
        now = now + " 00:00:00";
        preThreeMonth = preThreeMonth + " 00:00:00";

        if (!belongCalendar(beginTime, preThreeMonth, now)) {
            return false;
        }

        if (!belongCalendar(endTime, preThreeMonth, now)) {
            return false;
        }

        return true;
    }

    /**
     * 渲染证件类型
     * 
     * @param type
     * @return
     */
    public static String renderIdentityType(String type) {

        String typeName = "未知";
        switch (type) {
            case "1":
                typeName = "身份证";
                break;
            case "2":
                typeName = "护照";
                break;
            case "3":
                typeName = "驾驶证";
                break;
            case "4":
                typeName = "港澳通行证";
                break;
            default:
                break;
        }
        return typeName;
    }

    /**
     * 渲染人员标签
     * @param personTags
     * @return
     */
    public static String renderPersonTag(String personTags) {

        String personTagNames = "";
        String[] tags = personTags.replaceAll(" ", ",").split(",");
        for (int i = 0; i < tags.length; i++) {
            String tagName = StringUtil.toString(EAP.metadata.getDictValue(Constants.DICT_KIND_PERSON_TAG, tags[i]));
            if (!StringUtil.isNull(tagName)) {
                personTagNames += "," + tagName;
            }
        }
        personTagNames 
            = StringUtil.isNull(personTagNames) ? "" : "[" + personTagNames.substring(1, personTagNames.length()) + "]";

        return personTagNames;
    }

    /**
     * 渲染人脸分数
     * @param faceScore
     * @return
     */
    public static String renderFaceScore(Object faceScore) {
        float score = Float.valueOf(StringUtil.toString(faceScore, "-2"));
        if (score == -1) {
            return "失败";
        } else if (score >= 0) {
            return "成功";
        } else {
            return "未注册";
        }
    }

    /**
     * 渲染驾驶员类型
     * @param driverRole
     * @return
     */
    public static String renderDriverRole(Object driverRole) {
        int driverCode = Integer.valueOf(StringUtil.toString(driverRole, "-1"));
        if (driverCode == 0) {
            return "副驾";
        } else if (driverCode == 1) {
            return "主驾";
        } else if (driverCode == 2) {
            return "驾驶员";
        } else {
            return "未知";
        }
    }

    /**
     * 从字典缓存获取
     * 
     * @return
     */
    /*public static String[] getAlgoType() {
        Map<Object, Object> dictMap = EAPMetadata.dict.getDictMap(Constants.DICT_KIND_ALGORITHM_TYPE);
        return dictMap.keySet().stream().map((o)->StringUtil.toString(o)).collect(Collectors.toList()).toArray(new String[] {});
    }*/

    /**
     * 根据算法id从字典缓存获取算法
     * 
     * @return
     */
    @SuppressWarnings("unchecked")
    public static Map<Object, Object> getAlgorithmById(Object id) {
        Map<Object, Object> map = new HashMap<Object, Object>();
        try {
            Map<Object, Object> result = EAPMetadata.dict.getDictMap(Constants.DICT_KIND_ALGORITHM_TYPE, id);
            if (result != null && result.get(id) != null) {
                map = (Map<Object, Object>)result.get(id);
            }
        } catch (Exception e) {
            EapMetadataLog.log.error("获取算法资源失败：", e);
        }
        return map;
    }

    /**
     * 从字典缓存获取
     * 
     * @return
     */
    public static String getAlgoTypeStr() {
        Map<Object, Object> dictMap = EAPMetadata.dict.getDictMap(Constants.DICT_KIND_ALGORITHM_TYPE);
        String algoType = StringUtils.join(dictMap.keySet().toArray(), ",");
        return algoType;
    }

    /**
     * 从字典缓存获取
     * 
     * @return
     */
    public static List<Integer> getAlgoTypeList() {
        Map<Object, Object> dictMapOrigin = EAPMetadata.dict.getDictMap(Constants.DICT_KIND_ALGORITHM_TYPE);
        Map<Object, Object> dictMap = new HashMap<Object, Object>();
        for(Object key : dictMapOrigin.keySet()) {
        	Map<Object, Object> map = (Map<Object, Object>)dictMapOrigin.get(key);
        	if("0".equals(StringUtil.toString(map.get("ALGORITHM_KIND")))) {
        		dictMap.put(key, map);
        	}
        }
        List<Integer> result 
            = Arrays.asList(dictMap.keySet().toArray()).stream().map(f -> Integer.parseInt(StringUtil.toString(f)))
                .collect(Collectors.toList());
        return result;
    }

    /**
     * 通过算法id获取es存储字段
     * @param algoType
     * @return
     */
    public static String getEsFieldByAlgoType(int algoType) {

        String filedName = "";
        switch (algoType) {
            case 10001:
                filedName = "RLTZ_YC26";
                break;
            case 10002:
                filedName = "RLTZ_YC31";
                break;
            case 10003:
                filedName = "RLTZ_YC35";
                break;
            case 20000:
                filedName = "RLTZ_YU";
                break;
            case 30000:
                filedName = "RLTZ_XS";
                break;
            case 80001:
                filedName = "RLTZ_HY";
                break;
            default:
                break;
        }
        return filedName;
    }

    /**
     * 通过算法id获取算法名称
     * @param algoType
     * @return
     */
    public static String getNameByAlgoType(int algoType) {

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
            case 00001:
                filedName = "飞识综合比对算法";
                break;
            case 40001:
                filedName = "海康算法";
                break;
            case 80001:
                filedName = "华云算法";
                break;
            case 100001:
                filedName = "旷视算法";
                break;
            default:
                break;
        }
        return filedName;
    }

    /**
     * 获取核验算法
     * 
     * @param checkAlgoMap
     * @return
     */
    public static List<Map<String, Object>> getCheckAlgoList(Map checkAlgoMap) {

        List<Map<String, Object>> checkAlgoList = new ArrayList<>();

        if (null != checkAlgoMap) {

            for (Object algoType : checkAlgoMap.keySet()) {
    
                Map algoTypeMap = (Map) checkAlgoMap.get(algoType);
    
                String algoName = ModuleUtil.getNameByAlgoType(Integer.parseInt(algoType.toString()));
                if (!StringUtil.isEmpty(algoName)) {

                    Map<String, Object> map = new HashMap<>();

                    String score = StringUtil.toString(algoTypeMap.get("SCORE"));
                    String errorNo = StringUtil.toString(algoTypeMap.get("ERROR_NO"), "");
                    String errorMsg = StringUtil.toString(algoTypeMap.get("ERROR_MSG"), "");
                    String status = StringUtil.toString(algoTypeMap.get("STATUS"), "0");
                    if (StringUtil.isEmpty(score) || score.equals("-1") || score.equals("0")) {
                        if (!StringUtil.isEmpty(errorMsg)) {
                            map.put("SCORE", errorMsg);
                        } else {
                            map.put("SCORE", "失败");
                        }
                    } else {
                        map.put("SCORE", score + "%");
                    }
                    map.put("ALGORITHM_NAME", algoName);
                    map.put("ERROR_NO", errorNo);
                    map.put("ERROR_MSG", errorMsg);
                    map.put("STATUS", status);
                    checkAlgoList.add(map);
                }
            }
        }

        return checkAlgoList;
    }

    /**
     * 获取飞识人脸比对算法
     * 
     * @return
     */
    public static List<String> getAllAlgorithmId() {
        List<String> list = new ArrayList<String>();
        list.add("110");
        /** 依图算法 **/
        list.add("111");
        /** 商汤算法 **/
        list.add("112");
        /** 云从算法 **/
        list.add("113");
        /** Face++算法 **/
        list.add("114");
        /** 云天励飞算法 **/
        list.add("115");
        /** 像素算法 **/
        return list;
    }

    /**
     * 获取飞识接口所有库信息
     * @return
     */
    public static List<String> getAllRepositorieId() {
        List<String> list = new ArrayList<String>();
        list.add("88888888888888888888888888880007");
        /** 全国在逃人员 **/
        list.add("88888888888888888888888888880016");
        /** 常住人口 **/
        list.add("88888888888888888888888888880017");
        /** 流动人口 **/
        list.add("88888888888888888888888888880006");
        /** 警综犯罪嫌疑人库 **/
        list.add("2599570e4ddd49fdaaa102fd7329e415");
        /** 新疆人员库 **/
        list.add("88888888888888888888888888880015");
        /** 新疆籍网上在逃 **/
        list.add("88888888888888888888888888880025");
        /** 在粤维族人员 **/
        list.add("88888888888888888888888888880036");
        /** 重点人员-全国涉毒 **/
        list.add("88888888888888888888888888880037");
        /** 重点人员-全国刑事犯罪前科 **/
        list.add("88888888888888888888888888880038");
        /** 重点人员-全国肇事精神病人 **/
        list.add("88888888888888888888888888880039");
        /** 重点人员-全国重点上访人员 **/
        list.add("88888888888888888888888888880010");
        /** 广东监狱 **/
        list.add("88888888888888888888888888880002");
        /** 省违法犯罪库-拘留所 **/
        list.add("88888888888888888888888888880003");
        /** 省违法犯罪库-戒毒所 **/
        list.add("88888888888888888888888888880032");
        /** 陆丰籍涉毒在逃人员 **/
        list.add("88888888888888888888888888880009");
        /** 布控库 **/
        list.add("88888888888888888888888888880021");
        /** 境外人员 **/
        list.add("88888888888888888888888888880020");
        /** 从业人员 **/
        list.add("88888888888888888888888888880023");
        /** 人口注销库 **/
        list.add("88888888888888888888888888880048");
        /** 预备人员 **/
        list.add("88888888888888888888888888880008");
        /** 省违法犯罪库-收教所 **/
        list.add("88888888888888888888888888880011");
        /** 省违法犯罪库-看守所 **/
        list.add("88888888888888888888888888880012");
        /** 省违法犯罪库-劳教所 **/
        list.add("88888888888888888888888888880049");
        /** 溯源专案 **/
        list.add("88888888888888888888888888880050");
        /** 广铁-违法犯罪人员 **/
        list.add("88888888888888888888888888880051");
        /** 广铁-抓获在逃人员 **/
        return list;
    }

    /**
     * 获取检索页面类型
     * @param type
     * @return
     */
    public static String renderSearchType(int type) {
        if (1 == type) {
            return "路人库检索";
        } else if (2 == type) {
            return "技战法轨迹分析";
        } else if (3 == type) {
            return "技战法团伙分析";
        } else if (4 == type) {
            return "技战法频繁出现";
        } else if (5 == type) {
            return "技战法区域碰撞";
        } else if (6 == type) {
            return "技战法人脸比对";
        } else if (7 == type) {
            return "技战法身份核查";
        } else if (8 == type) {
            return "技战法人脸集合";
        }
        return "-";
    }

    /**
     * 根据算法id获取对应的es字段名称
     * 
     * @param algoType
     * @return
     */
    public static String getEsFieldByAlgoType(String algoType) {

        switch (algoType) {
            case "10003":
                return "RLTZ_YC35";
            case "80001":
                return "RLTZ_HY";
            default:
                break;
        }
        return "RLTZ";
    }

    /**
     * 获取布控类型
     * @param type
     * @param def
     * @return
     */
    public static String renderCauseType(int type, String def) {
        if (0 == type) {
            return "管控";
        } else if (1 == type) {
            return "侦查";
        } else if (2 == type) {
            return "便民服务";
        } else if (3 == type) {
            return "其它：" + def;
        }
        return "-";
    }

    /**
     * 获取案件类型
     * @param type
     * @return
     */
    public static String renderCaseIdType(int type) {
        if (Constants.CASE_ID_TYPE_A == type) {
            return "案件";
        } else if (Constants.CASE_ID_TYPE_J == type) {
            return "警情";
        } else if (Constants.CASE_ID_TYPE_OTHER == type) {
            return "其它";
        }
        return "-";
    }

    /**
     * 获取云从实际显示分数
     * 
     * @param score
     */
    public static long renderActualScore(int score) {
        return Math.round(score / 1.09);
    }

    /**
     * 是否开启布控审核短信功能 0禁用 1启用
     * 
     * @return
     */
    public static String getApproveEnableSendSms() {
        String enableSendSms = AppHandle.getHandle(Constants.APP_EFACESURVEILLANCE).getProperty("ENABLE_SEND_SMS", "0");
        return enableSendSms;
    }

    /**
     * 发送布控短信
     * @param phones
     * @param content
     */
    public static void sendDispatchedSms(String phones, String content) {
        String enableSendSms = ModuleUtil.getApproveEnableSendSms();

        String log = "发送布控通知短信日志：短信功能启用状态- " + enableSendSms + " 内容-" + content + " 手机号-" + phones;
        ServiceLog.debug(log);
        Log.smsLog.debug(log);
        if (!StringUtil.isEmpty(phones)) {
            SmsUtil.sendSms(phones, "", content);
        } else {
            Log.smsLog.debug("手机为空，取消发送");
        }
    }
    // 将包含旧dfs地址的而图片替换成新地址
    public static String renderPic(String picUrl){
        if(!StringUtil.isEmpty(picUrl)){
            String oldDfsUrl = AppHandle.getHandle(Constants.CONSOLE).getProperty("OLD_FDFS_URL",
                    "http://68.125.72.208:8088/,http://68.125.72.196:8088/");
            String dfsUrl = AppHandle.getHandle(Constants.CONSOLE).getProperty("FDFS_URL",
                    "http://68.125.54.161:8088/");
            String[] urlStr = oldDfsUrl.split(",");
            if(urlStr.length == 0){
                return picUrl;
            }
            if(isContains(urlStr, picUrl)){
                return dfsUrl + picUrl.substring(getCharacterPosition(picUrl)+1, picUrl.length());
            }
        }
        return picUrl;
    }

    // 字符串中是否包含字符数组中任意一个元素
    public static Boolean isContains(String[] arrStr, String target){
        List<Integer> list = new ArrayList<>();
        for (String s : arrStr) {
            if(target.contains(s)){
                list.add(1);
                break;
            }
        }
        if(list.size() > 0){
            return true;
        }
        return false;
    }

    // 获取字符串中"/"第三次出现索引
    public static int getCharacterPosition(String string){
        Matcher slashMatcher = Pattern.compile("/").matcher(string);
        int mIdx = 0;
        while(slashMatcher.find()) {
            mIdx++;
            if(mIdx == 3){
                break;
            }
        }
        return slashMatcher.start();
    }
}
