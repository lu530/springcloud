package com.suntek.efacecloud.util;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang3.time.DateFormatUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.elasticsearch.action.admin.indices.exists.indices.IndicesExistsRequest;
import org.elasticsearch.client.Client;

import com.suntek.eap.util.DateUtil;

/**
 * es工具类
 * @author yangwq
 * 
 */
public class ESUtil {
    
    public static final String DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
    public static final String DATE_FORMAT = "yyyyMMdd";
    public static final String SIMPLE_TIME_FORMAT = "yyMMddHHmmss";
    
    /**
     * 根据开始时间和结束时间获得覆盖到的过车记录索引名数组，该索引必需是真实存在的，
     * @param client
     * @param beginTime
     * @param endTime
     * @param indice
     * @return
     */
    public static String[] getIndicesByTime(Client client, Date beginTime, Date endTime, String indice) {
        String beginTimeStr = DateFormatUtils.format(beginTime, DEFAULT_DATETIME_FORMAT);
        String endTimeStr = DateFormatUtils.format(endTime, DEFAULT_DATETIME_FORMAT);
        return getIndicesByTime(client, beginTimeStr, endTimeStr, indice);
    }
    
    /**
     * 根据开始时间和结束时间获得覆盖到的过车记录索引名数组，该索引必需是真实存在的，
     * @param beginTime    yy-MM-dd HH:mm:ss
     * @param endTime     yy-MM-dd HH:mm:ss
     * @return 索引名数组，如：["car_detect_indice_1601", "car_detect_indice_1602"]
     */
    public static String[] getIndicesByTime(Client client, String beginTime, String endTime, String indice) {
        
        String[] indices = getIndicesNameByBeginAndEndTime(indice, beginTime, endTime);
        if (indices.length == 0) {
            return indices;
        }
        
        Set<String> rets = new HashSet<>();
        for (String idc : indices) {
            if (client.admin().indices().exists(new IndicesExistsRequest(idc)).actionGet().isExists()) {
                rets.add(idc);
            }
        }
        return rets.toArray(new String[rets.size()]);
    }
    
    
    /**
     * 根据开始和结束时间获取时间范围内的索引名，按月建的索引，如 car_detect_indice_1601
     * @param prefix    索引前缀，如 car_detect_indice_1601 的前缀为 car_detect_indice
     * @param beginTime 格式：yyyy-MM-dd HH-mm-ss
     * @param endTime    格式：yyyy-MM-dd HH-mm-ss
     * @return
     */
    public static String[] getIndicesNameByBeginAndEndTime(String prefix, String beginTime, String endTime) {
        try {
            Set<String> indices = new HashSet<>();
            
            Date bt = DateUtil.toDate(beginTime.substring(0, 10));
            Date et = DateUtil.toDate(endTime);
            
            long oneDay = 60 * 60 * 24 * 1000;
            for(; bt.getTime() <= et.getTime(); ) {
                String indice = prefix + "_" + DateUtil.toString(bt, "yyMM");
                indices.add(indice);
                bt.setTime(bt.getTime() + oneDay);
            }
            return indices.toArray(new String[indices.size()]);
        } catch(Exception e) {
            return new String[0];
        }
    }
    
    /**
     * 根据日期获取索引的路由
     * @param beginTime 要求格式yyyy-MM-dd 或 yyyy-MM-dd HH:mm:ss
     * @param endTime 要求格式yyyy-MM-dd 或 yyyy-MM-dd HH:mm:ss
     * @return
     */
    public static String[] getRoutesByBeginAndEndTime(String beginTime, String endTime) {
        Date begin = new Date();
        Date end = new Date();
        try {
            begin = DateUtils.parseDate(beginTime, DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT);
            end = DateUtils.parseDate(endTime, DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT);
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
        List<String> routes = new ArrayList<String>();
        while(!begin.after(end) || DateUtils.isSameDay(begin, end)) {
            routes.add(DateFormatUtils.format(begin, DATE_FORMAT));
            begin = DateUtils.addDays(begin, 1);
        }
        
        return routes.toArray(new String[routes.size()]);
    }
    
    
    /**
     * 根据日期获取索引的路由
     * @param beginTime
     * @param endTime
     * @return
     */
    public static String[] getRoutesByBeginAndEndTime(Date beginTime, Date endTime) {
        String beginTimeStr = DateFormatUtils.format(beginTime, DEFAULT_DATETIME_FORMAT);
        String endTimeStr = DateFormatUtils.format(endTime, DEFAULT_DATETIME_FORMAT);
        return getRoutesByBeginAndEndTime(beginTimeStr, endTimeStr);
    }
    
}
