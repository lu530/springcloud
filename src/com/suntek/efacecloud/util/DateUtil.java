package com.suntek.efacecloud.util;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Locale;

import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.StringUtil;



/**
 * 日期类型常用工具类
 * @author zt
 * @since 
 * @version 2012-11-3
 * @Copyright (C)2012 , Suntektech
 */
public class DateUtil 
{
	/**
	 * 年月日缺省分隔符
	 */
	private static char DAY_DELIMITER = '-';

	
	/**
	 * 时间格式：yyyy-MM-dd
	 */
	public static final String yyyy_MM_dd_style = "yyyy-MM-dd";
	
	/**
	 * 时间格式：yyyy-MM
	 */
	public static final String yyyy_MM_style = "yyyy-MM";
	

	/**
	 * 时间格式：HH:mm:ss
	 */
	public static final String HH_mm_ss_style = "HH:mm:ss";
	

	
	/**
	 * 时间格式：yyMMdd
	 */
	public static final String yyMMdd_style = "yyMMdd";
	
	

	
	/**
	 * 时间格式：yyMM
	 */
	public static final String yyMM_style = "yyMM";
	

	
	/**
	 * 时间格式：yyyyMMdd
	 */
	public static final String yyyyMMdd_style = "yyyyMMdd";
	
	

	
	
	/**
	 * 时间格式：HHmmss
	 */
	public static final String HHmmss_style = "HHmmss";
	

	
	/**
	 * 时间格式：yyyy-MM-dd HH:mm:ss
	 */
	public static final String standard_style = "yyyy-MM-dd HH:mm:ss";
	

	
	/**
	 * 时间格式：yyMMddHHmmss
	 */
	public static final String yyMMddHHmmss_style = "yyMMddHHmmss";
	
	
	/**
	 * 时间格式：yyyyMMddHHmmss
	 */
	public static final String yyyyMMddHHmmss_style = "yyyyMMddHHmmss";
	

	

	
	/**
	 * 时间字符串由原风格转换为目标风格,如果格式异常，返回 <code>null</code>
	 * @param time 时间
	 * @param fromFormat 原时间风格
	 * @param toFormat   目标风格
	 * @return  目标风格时间
	 */

	public static String convertByStyle (String time, String fromStyle, String toStyle){
		Date dateTime;
		try {
			SimpleDateFormat fromSdf = new SimpleDateFormat(fromStyle);
			dateTime = fromSdf.parse(time);
		} catch (ParseException e) {
			ServiceLog.error("convertByStyle method invoked unexpected", e);
			return null;
		}
		
		SimpleDateFormat toSdf = new SimpleDateFormat(toStyle);
		
		String toDateTime = toSdf.format(dateTime);
		return toDateTime;		
	}
	

	
	/**
	 * 时间字符串由原风格转换为目标风格,如果格式异常，返回默认值 <code>defaultVal</code>
	 * @param time 时间
	 * @param fromFormat 原时间风格
	 * @param toFormat   目标风格
	 * @param defaultVal 默认值
	 * @return  目标风格时间
	 */
	public static String convertByStyle(String time, String fromStyle, String toStyle,String defaultVal){
		
		String result = convertByStyle(time, fromStyle, toStyle);
		
		return (result == null? defaultVal :result);
	}
	
	/**
	 * 获取当前日历的时间
	 * @return  返回当前日历的时间，格式为yyyy-MM-dd
	 */
	public static String getDate()
	{
		Calendar calendar = Calendar.getInstance(Locale.CHINA);		
		
		return new SimpleDateFormat(yyyy_MM_dd_style).format(calendar.getTime());
	}
	
	/**
	 * 得到当前月份的第一天 。如这个月是7月,返回的是2017-7-1
	 * @return  返回Calendar对象
	 */
	public static Calendar getFirstDayOfMonth() 
	{
		Calendar calendar = Calendar.getInstance(Locale.CHINA);
		calendar.set(Calendar.DAY_OF_MONTH, 1);		
		return calendar;
	}

	/**
	 * 得到下个月的第一天。如这个月是7月,返回的是2017-8-1
	 * @return 返回Calendar对象
	 */
	public static Calendar getFirstDayOfNextMonth() 
	{
		Calendar calendar = Calendar.getInstance(Locale.CHINA);
		calendar.add(Calendar.MONTH, 1);
		calendar.set(Calendar.DAY_OF_MONTH, 1);		
		return calendar;
	}
	
	/**
	 * 得到下一个月的15号日期。如这个月是7月，返回的是2017-8-15
	 * @return 返回Calendar对象
	 */
	public static Calendar getMiddleDayOfNextMonth() 
	{
		Calendar calendar = Calendar.getInstance(Locale.CHINA);
		calendar.add(Calendar.MONTH, 1);	
		calendar.set(Calendar.DAY_OF_MONTH, 15);
		return calendar;
	}
	
	/**
	 * 得到本月的15号。如这个月是7月，返回的是2017-7-15
	 * @return 返回Calendar对象
	 */
	public static Calendar getMiddleDayOfMonth() 
	{
		Calendar calendar = Calendar.getInstance(Locale.CHINA);
		calendar.set(Calendar.DAY_OF_MONTH, 15);		
		return calendar;
	}
	
	/**
	 * 得到当前月的最后一天。如这个月是7月，返回2017-7-31
	 * @return 返回Calendar对象
	 */
	public static Calendar getLastDayOfMonth() 
	{
		Calendar calendar = Calendar.getInstance(Locale.CHINA);
		int i = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
		calendar.set(Calendar.DAY_OF_MONTH, i);
		return calendar;
	}
	
	/**
	 * 通过指定格式获取日期对象
	 * @param dateStr 日期字符串
	 * @param pattern 格式
	 * @return
	 */
	public static Calendar getCalendarByPattern(String dateStr, String pattern) 
	{
		if(StringUtil.isNull(pattern)) pattern = "yyyy-MM-dd HH:mm:ss";
		
		Calendar c = Calendar.getInstance();
		SimpleDateFormat df = new SimpleDateFormat(pattern);
		
		try {
			c.setTime(df.parse(dateStr));
		} catch (ParseException e) { 
			ServiceLog.error(e);
			c = null;
		};
		
		return c;
	}
	

	
	/**
	 * 根据指定的时间格式得到以天为单位的偏移量之后的时间字符串
	 * @param offset 偏移量（以天为单位）
	 * @param format 时间格式
	 * @return 时间字符串
	 */
	public static String getDayOffset(int offset, String format) 
	{
		Calendar calendar = Calendar.getInstance(Locale.CHINA);
		calendar.set(Calendar.DATE, calendar.get(Calendar.DATE) + offset);		
		SimpleDateFormat sdf = new SimpleDateFormat(format);
		return sdf.format(calendar.getTime());
	}
	
	/**
	 * 根据指定的时间格式得到以月为单位的偏移量之后的时间字符串
	 * @param offset 偏移量（以月为单位）
	 * @param format 时间格式
	 * @return
	 */
	public static String getMonthOffset(int offset, String format) 
	{
		Calendar calendar = Calendar.getInstance(Locale.CHINA);
		calendar.set(Calendar.MONTH, calendar.get(Calendar.MONTH) + offset);		
		SimpleDateFormat sdf = new SimpleDateFormat(format);
		return sdf.format(calendar.getTime());
	}

	/**
	 * 根据指定的时间和指定的时间格式得到以天为单位的偏移量之后的时间字符串
	 * @param date  指定的时间（String类型时间）
	 * @param offset 偏移量（以天为单位）
	 * @param format  时间格式
	 * @return
	 */
	public static String getDayOffset(String date, int offset, String format) 
	{
		Calendar calendar = Calendar.getInstance(Locale.CHINA);
		calendar.setTime(toDate(date));		
		calendar.set(Calendar.DATE, calendar.get(Calendar.DATE) + offset);		
		SimpleDateFormat sdf = new SimpleDateFormat(format);
		return sdf.format(calendar.getTime());
	}
	
	/**
	 * 根据指定的时间和指定的时间格式得到以月为单位的偏移量之后的时间字符串
	 * @param date  指定Date类型时间
	 * @param offset  偏移量（以月为单位）
	 * @param format  指定的时间格式
	 * @return
	 */
	public static String getMonthOffset(Date date, int offset, String format) 
	{
		Calendar calendar = Calendar.getInstance(Locale.CHINA);
		calendar.setTime(date);
		calendar.set(Calendar.MONTH, calendar.get(Calendar.MONTH) + offset);		
		SimpleDateFormat sdf = new SimpleDateFormat(format);
		return sdf.format(calendar.getTime());
	}

	


	/**
	 * 根据给定的时间格式把Date类型的时间转换成String类型的时间
	 * @param date  Date类型的时间
	 * @param format  给定的时间格式
	 * @return 返回字符串类型的时间
	 */
	public static String toString(Date date, String format) 
	{
		SimpleDateFormat sdf = new SimpleDateFormat(format);
		return sdf.format(date);
	}
	

	
	/**
	 * 将String类型时间转换成Date类型时间
	 * @param date String类型时间
	 * @return  返回Date类型的时间
	 */
	public static Date toDate(String date)
	{
		try {
			if (date.length() == 10)
				return new SimpleDateFormat(yyyy_MM_dd_style).parse(date);
			return new SimpleDateFormat(standard_style).parse(date);
			
		} catch (ParseException pe) {
			throw new RuntimeException(pe);
		}
	}

	/**
	 * 根据给定的时间格式把字符串时间转换成Date类型时间
	 * @param date  字符串类型时间
	 * @param format 时间格式
	 * @return  返回Date类型时间
	 */
	public static Date toDate(String date, String format)
	{
		try {
			SimpleDateFormat sdf = new SimpleDateFormat(format);
			return sdf.parse(date);
		} catch (ParseException pe) {
			throw new RuntimeException(pe);
		}
	}
	
	/**
	 * 根据给定的时间单位计算出两个时间的差值
	 * @param type   时间单位(年、日、或者小时、分钟)
	 * @param date1  Date类型时间
	 * @param date2  Date类型时间
	 * @return  返回两个时间的差值
	 */
	public static long diff(int type, Date date1, Date date2) 
	{
		switch(type) {
			case Calendar.YEAR:
				Calendar calendar = Calendar.getInstance();
				calendar.setTime(date1);
				long time = calendar.get(Calendar.YEAR);
				calendar.setTime(date2);
				return time - calendar.get(Calendar.YEAR);
				
			case Calendar.MONTH:
			    Calendar bef = Calendar.getInstance();  
		        Calendar aft = Calendar.getInstance();  
		        bef.setTime(date2);  
		        aft.setTime(date1);  
		        int result = aft.get(Calendar.MONTH) - bef.get(Calendar.MONTH);  
		        int month = (aft.get(Calendar.YEAR) - bef.get(Calendar.YEAR)) * 12;  
		        return (month + result);
	
			case Calendar.DATE:
				time = date1.getTime() / 1000 / 60 / 60 / 24;
				return time - date2.getTime() / 1000 / 60 / 60 / 24;
	
			case Calendar.HOUR:
				time = date1.getTime() / 1000 / 60 / 60;
				return time - date2.getTime() / 1000 / 60 / 60;
	
			case Calendar.SECOND:
				time = date1.getTime() / 1000;
				return time - date2.getTime() / 1000;
		}
		return date1.getTime() - date2.getTime();
	}
	
	/**
	 * 取得系统默认时区的日期时间
	 * 
	 * @return String YYYY-MM-DD HH:MM:DD
	 */
	public static String getDateTime() {
		return getDateTime(new GregorianCalendar());
	}
	
	/**
	 * 根据日历返回日期时间
	 * 
	 * @param Calendar
	 *            日历
	 * @return String YYYY-MM-DD HH:MM:DD
	 */
	private static String getDateTime(Calendar calendar) {
		StringBuffer buf = new StringBuffer("");

		buf.append(calendar.get(Calendar.YEAR));
		buf.append(DAY_DELIMITER);
		buf.append(calendar.get(Calendar.MONTH) + 1 > 9 ? calendar
				.get(Calendar.MONTH)
				+ 1 + "" : "0" + (calendar.get(Calendar.MONTH) + 1));
		buf.append(DAY_DELIMITER);
		buf.append(calendar.get(Calendar.DAY_OF_MONTH) > 9 ? calendar
				.get(Calendar.DAY_OF_MONTH)
				+ "" : "0" + calendar.get(Calendar.DAY_OF_MONTH));
		buf.append(" ");
		buf.append(calendar.get(Calendar.HOUR_OF_DAY) > 9 ? calendar
				.get(Calendar.HOUR_OF_DAY)
				+ "" : "0" + calendar.get(Calendar.HOUR_OF_DAY));
		buf.append(":");
		buf.append(calendar.get(Calendar.MINUTE) > 9 ? calendar
				.get(Calendar.MINUTE)
				+ "" : "0" + calendar.get(Calendar.MINUTE));
		buf.append(":");
		buf.append(calendar.get(Calendar.SECOND) > 9 ? calendar
				.get(Calendar.SECOND)
				+ "" : "0" + calendar.get(Calendar.SECOND));
		return buf.toString();
	}
	
	/**
	 * 将时间转为formate格式
	 * @param date
	 * @param formate
	 * @return
	 */
	public static String dateToString(long date, String formate){
		return dateToString(new Date(date), formate);
	}
	
	
	/**
	 * 将一Date类型的对象，转换为一个字符串
	 * @param format 默认"yyyy-MM-dd HH:mm:ss.SSS"
	 */
	public static String dateToString(Date date, String formate){
		if( date==null ){
			return "";
		}
		formate = (formate==null) ? "yyyy-MM-dd HH:mm:ss.SSS" : formate;
		return new SimpleDateFormat(formate).format(date);
	}
	

	
	/**
	 * 将一Date类型的对象，转换为一个 "1998-01-01 01:01:01" 这样的字符串
	 */
	public static String dateToString(Date date){
		return dateToString(date, "yyyy-MM-dd HH:mm:ss");
	}
	
	/**
	 * 将一个long类型的时间，转换成一个 "1998-01-01 01:01:01" 这样的字符串
	 * @param date
	 * @return
	 */
	public static String dateToString(long date){
		return dateToString(new Date(date));
	}
	
	/**
	 * 根据给定的日期单位，得到给定日期格式之后的delta日期
	 * @param day 字符串类型时间
	 * @param format 时间单位（Calendar.Day）
	 * @param delta  日期的增减量
	 * @return 返回得到增减后的时间
	 */
	public static String getDayAfter(String day, int format, int delta) 
	{  
        Calendar c = Calendar.getInstance();  
        
        Date date = null;  
        
        try {  
            date = new SimpleDateFormat(standard_style).parse(day);  
        } catch (ParseException e) {  
        }  
        
        c.setTime(date);  
        
        int iday = c.get(format);  
        
        c.set(format, iday + delta);  
  
        String dayAfter =new SimpleDateFormat(standard_style).format(c.getTime());  
        return dayAfter;  
    }  
	
	/**
	 *  根据给定的日期单位，得到给定日期之后的delta日期
	 * @param day   Date类型日期
	 * @param format 时间单位（Calendar.Day）
	 * @param delta  日期的增减量
	 * @return 返回得到增减后的时间
	 */
	public static Object getDayAfter(Date day, int format, int delta)
	{
		return getDayAfter(dateToString(day), format, delta);
	}
	
	/**
	 * 根据给定的时间返回对应的星期
	 * @param dt Date类型日期
	 * @return 返回对应的星期
	 */
	public static String getWeekOfDate(Date dt) {
        String[] weekDays = {"7", "1", "2", "3", "4", "5", "6"};
        Calendar cal = Calendar.getInstance();
        cal.setTime(dt);
        int w = cal.get(Calendar.DAY_OF_WEEK) - 1;
        if (w < 0)
            w = 0;
        return weekDays[w];
    }
	
	/** 
     * 获取某天的开始时间或结束时间
     * @param date 当前时间 
     * @flag 0 返回yyyy-MM-dd 00:00:00日期<br> 
     *       1 返回yyyy-MM-dd 23:59:59日期 
     * @return  返回Date类型时间
     */  
    public static Date weeHours(Date date, int flag) {  
        Calendar cal = Calendar.getInstance();  
        cal.setTime(date);  
        int hour = cal.get(Calendar.HOUR_OF_DAY);  
        int minute = cal.get(Calendar.MINUTE);  
        int second = cal.get(Calendar.SECOND);  
        //时分秒（毫秒数）  
        long millisecond = hour*60*60*1000 + minute*60*1000 + second*1000;  
        //凌晨00:00:00  
        cal.setTimeInMillis(cal.getTimeInMillis()-millisecond);  
           
        if (flag == 0) {  
            return cal.getTime();  
        } else if (flag == 1) {  
            //凌晨23:59:59  
            cal.setTimeInMillis(cal.getTimeInMillis()+23*60*60*1000 + 59*60*1000 + 59*1000);  
        }  
        return cal.getTime();  
    } 
    
    /**
     * 获取明天凌晨1点钟时间
     * @return 返回Date类型时间
     */
    public static Date getNextDay1Hour() {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.set(Calendar.HOUR_OF_DAY, 1);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        cal.add(Calendar.DAY_OF_MONTH, 1);
        return cal.getTime();
    }
    
    /**
	 * 获取今年年份
	 * @return 返回字符串类型的时间
	 */
	public static String getThisYear(){
		Calendar rightNow = Calendar.getInstance(Locale.CHINA);
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy");
		return sdf.format(rightNow.getTime());
	}
	
	/**
	 * 获取以往日期
	 * @param date 原日期格式  yyyy-MM-dd
	 * @param type Calendar.YEAR等 
	 * @param step 日期偏移步长，基于type
	 * @return
	 */
	public static String getPreDate(String date, int type, int step)
	  {
	    Calendar calendar = new GregorianCalendar(Integer.parseInt(
	      date.substring(0, 4)), Integer.parseInt(date.substring(5, 7)) - 1, 
	      Integer.parseInt(date.substring(8, 10)), 0, 0, 0);
	    calendar.add(type, step);
	    return getDateTime(calendar).substring(0, 10);
	  }
	


	
}
