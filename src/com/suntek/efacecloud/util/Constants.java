package com.suntek.efacecloud.util;

import org.apache.commons.collections.map.HashedMap;

import java.util.Map;

/**
 * 应用基础常量类
 * @version 2017-06-27
 * @since 1.0
 * @author gaosong
 */
public class Constants {
	public final static String APP_NAME = "efacecloud";
	
	public final static String APP_EFACESURVEILLANCE = "efacesurveillance";
	
	public final static String CONSOLE = "console";
	
	public final static String OSS = "oss";
	
	public final static String OPENGW = "opengw";
	
	public final static String PORTAL = "portal";
	
	public final static String DATA_DEFENCE = "datadefence";
	
	public final static String MPPDB_NAME = "MPPDB_RES";


	public static String BASE_FACE_CAPTURE_ZKPATH = "/bigdata/config/gateway/capture";

	/**
	 * 厂商-海康
	 */
	public final static String HIK_VENDOR = "Hikvision";
	/**
	 * 厂商-华为
	 */
	public final static String HW_VENDOR = "huawei";

	//红名单比对阈值
	public final static String RED_SIMILARITY = "RED_SIMILARITY";
	
	//是否开启红名单标志
	public final static String RED_LIST_OPEN = "RED_LIST_OPEN";
	
	//是否开启红名单标志
	public final static String SEARCH_CAUSE_OPEN = "SEARCH_CAUSE_OPEN";
	
	/** 红名单库菜单权限ID **/
	public final static String RED_LIST_MENUID = "EFACE_redListLibrary";
	
	/** 查看本级及下级所有任务菜单权限ID **/
    public final static String DISPATCHED_PERSON_PERMISSION_MENUID = "EFACE_faceDispatchedViewAllTask";
    
	/** 告警查询-人脸告警权限ID **/
    public final static String DEFENCE_FACEALARM = "DEFENCE_faceAlarm";
	
	/** 人脸红名单库ID **/
	//public final static String STATIC_LIB_ID_RED_LIST = "RED_LIST_DB";
	public final static String STATIC_LIB_ID_RED_LIST = ConfigUtil.getRedListDbId();
	
			
	public static final int SEND_MESSAGE_IMMEDIATELY = 0; /**立即发送**/
	public static final int SEND_MESSAGE_TIMER= 1; /**定时发送**/
	
	 /**案件**/
	public static final int CASE_ID_TYPE_A = 0;
	/**警情**/
	public static final int CASE_ID_TYPE_J= 1; 
	/**其它**/
	public static final int CASE_ID_TYPE_OTHER= 2; 
	
	/**红名单任务 已读**/
	public static final int RED_TASK_READ= 0; 
	/**红名单任务 未读**/
	public static final int RED_TASK_UNREAD= 1; 

	/** 布控库类型-人脸*/
	public final static int LIB_TYPE_PERSON =1;
	
	/**布控任务类型-人脸*/
	public final static int  DISPATCHED_TASK_TYPE_FACE = 1;
	
	/**布控库类型-静态小库*/
	public final static int  DISPATCHED_LIB_TYPE_STATICS = 1;
	
	/**人脸抓拍设备类型*/
	public final static int DEVICE_TYPE_FACE = 194;
	/**车辆抓拍设备类型*/
	public final static int DEVICE_TYPE_CAR = 193;
	
	/**pcidfs永久存储标识**/
	public final static int PCIDFS_PERMANENT_FLAG = 0x31001;
	
	/**pcidfs临时存储标识**/
	public final static int PCIDFS_TEMPORARY_FLAG = 0x41001;
	
	/**
	 * 人脸抓拍相机在VPLUS_VIDEO_CAMERA表中的SPECIAL_PURPOSE字段值为1
	 */
	public static final int CAMERA_FACE = 1;
	public static final int TASK_FACE_ALARM = 1;
	
	
	public static final int CAMERA_CAR = 2;
	
	/** 状态确认 **/
	public final static int DEAL_STATUS_CONFIRM = 0;
	
	/**档案库人脸来源自建**/
	public final static byte DATA_SOURCE_OWN = 0;
	
	/** 状态删除 **/
	public final static int DEAL_STATUS_DELETE = 1;
	/***人员档案库图片索引*/
	public final static String PERSON_ARCHIVE_PIC_INDICE = "person_archive_pic_indice";
	public final static String PERSON_ARCHIVE_PIC_INFO = "PERSON_ARCHIVE_PIC_INFO";
	
	/***人员专题库图片索引*/
	public final static String PERSON_SPECIAL_LIB_PIC_INDICE = "person_special_lib_pic_indice";
	public final static String PERSON_SPECIAL_LIB_PIC_INFO = "PERSON_SPECIAL_LIB_PIC_INFO";
	
	/**人员专题库种类(0专题,1个人)**/
	public final static int SPECIAL_LIB_INDIVIDUAL = 1;
	public final static int SPECIAL_LIB_COMMON = 0;
	
	/***移动终端库索引*/
	public final static String MOBILE_TERMINAL_INDICE = "mobile_terminal_indice";
	public final static String MOBILE_TERMINAL_INFO = "MOBILE_TERMINAL_INFO";
	public final static String STATIC_LIB_ID_MOBILE_TERMINAL = "MOBILE_TERMINAL_INFO";
	
	/** 人脸抓拍索引 */
	public final static String FACE_INDEX = "face_indice";
	public final static String FACE_TABLE = "FACE_INFO";
	
	/** 驾驶员人脸索引 */
	public final static String DRIVER_FACE_INDICE = "driver_face_indice";
	public final static String DRIVER_FACE_INFO = "DRIVER_FACE_INFO";
	
	/** 非汽车驾驶员人脸索引 */
	public final static String NOT_DRIVER_DETECT_INDICE = "non_motor_face_indice";
	public final static String NOT_DRIVER_DETECT_INFO = "NON_MOTOR_FACE_INFO";
	
	public static String SYS_USERRESOURCE = "SYS_USERRESOURCE"; //用户资源权限管理表
	public static final String SYS_USERALARM = "SYS_USERALARM"; //用户告警资源权限管理表
	
	public static final String RespCode = "CODE";
	public static final String RespMessage = "MESSAGE";
	
	public final static int RETURN_CODE_ERROR = 1;
	public final static int RETURN_CODE_SUCCESS = 0;
	public final static int COLLISISON_RESULT_SUCCESS = 0;

	/** 标签关联类型 **/
	public final static int REL_TYPE_PERSON = 1;
	public final static int REL_TYPE_FACE = 2;

	public final static String DICT_KIND_PERSON_ADDRESS = "PERSON_ADDRESS";
	
	public final static String DICT_KIND_PERSON_TAG = "PERSON_TAG";
	
	/** 新飞识查询标签 **/
	public final static String NEW_FEISHI_ALGORITHM = "NEW_FEISHI_ALGORITHM";
	public final static String NEW_FEISHI_REPOSITORY = "NEW_FEISHI_REPOSITORY";
	
	
	
	/** 字典类型- 档案库 **/
	public final static String DICT_KIND_STATIC_LIB = "STATIC_LIB";
	
	/** 字典key- 档案库(对应华为库的tag字段） **/
	public final static String DICT_CODE_STATIC_LIB_ARCHIVE = "STATIC_LIB_ARCHIVE";
	/** 字典key- 移动终端库(对应华为库的tag字段） **/
	public final static String DICT_CODE_STATIC_LIB_TERMINAL = "STATIC_LIB_TERMINAL";
	/** 字典key- 专题库库(对应华为库的tag字段） **/
	public final static String DICT_CODE_STATIC_LIB_SPECIAL = "STATIC_LIB_SPECIAL";
	
	/** 算法类型字典类型 **/
	public final static String DICT_KIND_ALGORITHM_TYPE = "FACE_ALGORITHM_TYPE";
	
	public final static String SEX_MAN = "1";
	public final static String SEX_WOMAN = "2";
	public final static String SEX_UNKNOWN = "0";
	
	/** 证件类型 1 身份证 **/
	public final static int IDENTITY_TYPE_ID = 1;
	
	/**导出支持最大条数**/
	public final static String EXPORT_MAX_COUNT = "1000";
	
	/** 查询ES起止时间-未配置 **/
	public final static int SEARCH_ES_TIME_LACK = -2;
	/** 查询ES起止时间-超过时间范围 **/
	public final static int SEARCH_ES_TIME_OVERSTEP = -1;
	/** 查询ES起止时间-正常 **/
	public final static int SEARCH_ES_TIME_SUCCESS = 0;
	
	/**汽车车辆类型编码**/
	public final static String[] VEHICLE_CLLX_NO_ARR = {"0","1","2","3","4","5","6","7","8","20","21","22","23","24","25","26","27","28"};

	/**布控任务状态-成功**/
	public final static int TASK_STATUS_SUCCESS = 0;
	
	/**布控任务状态-初始化**/
	public final static int TASK_STATUS_INIT = 1;
	
	/**布控任务状态-失败**/
	public final static int TASK_STATUS_FAIL = -1;
	
	/**布控任务状态-撤销**/
	public final static int TASK_STATUS_CANCEL = 9;
	
	/**设备接入类型：公安专网**/
	public final static String DEVICE_ACCESS_NETWORK_P = "1";
	
	/**设备接入类型：视频专网**/
	public final static String DEVICE_ACCESS_NETWORK_V = "2";
	
	/*** 告警未下发 */
	public final static int ALARM_STATUS_UNSEND = 0;
	/***  告警已下发 */
	public final static int ALARM_STATUS_SENT = 1;
	/***  告警已接收 */
	public final static int ALARM_STATUS_ACCEPT = 2;
	/***  告警已反馈 */
	public final static int ALARM_STATUS_HANDLED = 3;
	
	
	/** 布控状态：布控 **/
	public final static int IS_DELETED_1 = 1;
	/** 布控状态：撤控/删除 **/
	public final static int IS_DELETED_0 = 0;
	
	
	// 图片存储方式
	public final static String FDFS = "fdfs";
	public final static String LOCALFS = "localfs";
	public final static String S3FS = "s3fs";
	
	/** 数据流量统计常量 */
	/** 统计前缀 */
	public final static String STAT_PREFIX = "VPLUS_PV_";
	
	/** 存储落地统计关键字*/
	public final static String STORE_FIELD = "_COMPARE_";
	
	/** 多维技战法碰撞条数阀值*/
	public static final String COLLISION_NUM = "200";

	public final static int DEVICE_TYPE_WIFI = 199;//wifi
	
	public final static int DEVICE_TYPE_EFENCE = 197;//电围
	
	/*** 人员专题库图片索引 */
	public final static String PERSON_TOPIC_INDICE = "person_topic_indice";
	public final static String PERSON_TOPIC_INFO = "PERSON_TOPIC_INFO";
	
	/*** 布控库添加类型  自定义 */
	public final static String USER_CUSTOM = "1";
	
	/*** 布控库添加类型  专题库 */
	public final static String USER_TOPIC = "2";
	
	/** 算法-云从3.5 **/
	public final static String ALGO_TYPE_YUNCONG_35 = "10003";
	
	/**  大数据检索方式 -- mppdb **/
	public final static String  BIGDATA_SEARCH_MPPDB = "1";
	
	/**  大数据检索方式 -- es  **/
	public final static String  BIGDATA_SEARCH_ES = "0";
	
	/**  布控库类型 -- 临控库  **/
	public final static int  DB_TYPE_TEMP = 1;
	
	/**  布控库种类 -- 黑名单  **/
	public final static int  DB_KIND_BLACK = 3;
	
	public final static int  DEFAULT_ALGO_TYPE = 10003; //* 10003	云从3.5人脸算法，默认算法类型
	
	/**单周应用成效统计表**/
	public final static String SINGLE_WEEK_DATA_EXPORT = "single_week_data_export.xls";
	/**累计应用成效统计详表**/
	public final static String CUMULATIVE_DATA_EXPORT = "cumulative_data_export.xls";
	

	/*** 告警-未签收 */
	public final static int ALARM_UNSIGN = 0;
	/***  告警-已签收 */
	public final static int ALARM_SIGNED = 1;
	/***  告警-已反馈*/
	public final static int ALARM_HANDLED = 2;
	/***  告警-已抓获 */
	public final static int ALARM_CATCHED = 9;
	

	/*** 告警-未签收(前端值） */
	public final static int ALARM_UNSIGN_FRONT_END = 0;
	/***  告警-已签收(前端值） */
	public final static int ALARM_SIGNED_FRONT_END = 1;
	/***  告警-未反馈(前端值）*/
	public final static int ALARM_UNHANDLE_FRONT_END = 2;
	/***  告警-已反馈 (前端值）*/
	public final static int ALARM_HANDLED_FRONT_END = 3;

	/***  蓝色告警-关注类 */
	public final static int ALARM_LEVEL_BLUE = 3;
	/***  红色告警-在逃类 */
	public final static int ALARM_LEVEL_RED = 0;
	/***  黄色告警-管控类 */
	public final static int ALARM_LEVEL_YELLOW = 2;
	/***  橙色告警-抓捕类 */
	public final static int ALARM_LEVEL_ORANGE = 1;
	
	public final static String ALGO_TYPE_FEISHI = "00001";
	
	public static final int HIK_SIMILARITY_MAX = 1;
	/*** 警情未签收 */
	public final static int TASK_STATUS_UNACCEPT = 0;
	/***  警情已签收 */
	public final static int TASK_STATUS_ACCEPT = 1;
	/***  警情已下发 */
	public final static int TASK_STATUS_SENT = 2;
	/***  警情已反馈 */
	public final static int TASK_STATUS_HANDLED = 3;
	/***  警情已反馈已抓捕 */
	public final static int TASK_STATUS_ARREST = 9;

	/** 多脸布控--非本人*/
	public final static String MUTILFACE_ALARM_NOCORRECT = "0";
	/** 多脸布控--本人*/
	public final static String MUTILFACE_ALARM_CORRECT = "1";
	/** 多脸布控--封面*/
	public final static String MUTILFACE_ALARM_COVER = "2";

	/** 告警确认--不准确*/
	public final static String CONFIRM_STATUS_NOCONFIRM = "0";
	/** 告警确认--准确*/
	public final static String CONFIRM_STATUS_CORRECT = "1";
	/** 告警确认--未处理*/
	public final static String CONFIRM_STATUS_UNTREATED = "2";
	/** 告警确认--已处理*/
	public final static String CONFIRM_STATUS_TREATED = "3";
	
	public final static String ALARM_CONFIRM_VALUE_NO = "否";
	public final static String ALARM_CONFIRM_VALUE_YES = "是";
	public final static String ALARM_CONFIRM_KEY = "IS_CONSISTENT";
	
	/** 字典目录树URI **/
	public final static String URI_OF_DICTIONARY_TREE = "/sys-dict-management/dictionary/treeByKind";

    /** 证件类型字典值 **/
	// 证件类型
    public static final String FORIEGN_CARD = "903";
    // 签证种类
    public static final String FOREIGNER_VISA_TYPE = "206";

    /** 外籍人项目标识 */
    public static final String IS_BLACK = "1";
    /** 华云算法 */
    public static final String HUAYUN_ALGO = "80003";

	/** 有效库-有特征值*/
	public static final String IS_CORRECT = "1";
	/** 残缺库-特征值*/
	public static final String IS_INCORRECT = "0";

	/**
	 * 视频云设备类型--中台设备类型对应关系
	 * 中台暂时只支持：
	 * 	'1：车辆卡口，2：人员卡口，3：微卡口，
	 * 	4：特征摄像机，5：普通监控，6：人员结构化，
	 * 	7：车辆结构化， 99：其他'
	 */
	public static Map<String, String> deviceTypeMap = null;

    static{
		deviceTypeMap = new HashedMap(4);
		deviceTypeMap.put("193", "1");
		deviceTypeMap.put("194", "2");
		deviceTypeMap.put("131", "5");
		deviceTypeMap.put("190", "6");
		deviceTypeMap.put("189", "7");
	}


	/** 是否导入导出文件上传dfs */
	public static final String IS_FILE_SAVE = "1";
}
