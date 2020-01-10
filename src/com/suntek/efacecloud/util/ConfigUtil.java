package com.suntek.efacecloud.util;

import com.suntek.eap.blob.BlobType;
import com.suntek.eap.core.app.AppHandle;

/**
 * 应用基础配置类
 *
 * @author lx
 * @version 2017-06-27
 * @since 1.0
 */
public class ConfigUtil {
    /**
     * 获取alluxio配置
     */
    public static String getAlluxioConf() {
        return AppHandle.getHandle(Constants.CONSOLE).getProperty("DRIVE_ALLUXIO", "alluxio://10.4.100.143:19998/dc");
    }

    /**
     * 获取人脸算法
     */
    public static String getAlgoType() {
        return AppHandle.getHandle(Constants.APP_NAME).getProperty("VRS_ALGO_TYPE", "10003");
    }

    /**
     * 获取人脸算法
     */
    public static String getAlgoTypes() {
        return AppHandle.getHandle(Constants.APP_NAME).getProperty("VRS_ALGO_TYPES", "10003");
    }

    /**
     * 获取zookeeper配置
     */
    public static String getZookeeperConf() {
        return AppHandle.getHandle(Constants.CONSOLE).getProperty("ZK_LIST", "");
    }

    /**
     * 获取FDFS端口
     */
    public static String getFDFSPort() {
        return AppHandle.getHandle(Constants.CONSOLE).getProperty("FASTDFS_HTTP_PORT", "8088");
    }

    /**
     * 获取FDFS URL
     */
    public static String getFDFSUrl() {
        return AppHandle.getHandle(Constants.CONSOLE).getProperty("FDFS_URL", "http://localhost:8088/");
    }

    /**
     * 获取OSS URL
     */
    public static String getOSSUrl() {
        return AppHandle.getHandle(Constants.OSS).getProperty("OSS_URL", "http://172.16.56.222:9080/oss/v1/db/dir/");
    }

    /**
     * 获取BLOB_TYPE
     */
    public static String getBlobType() {
        return AppHandle.getHandle(Constants.CONSOLE).getProperty("BLOB_TYPE");
    }

    /**
     * 获取人脸M:N相似度阈值
     */
    public static String getMNSimilarity() {
        return AppHandle.getHandle(Constants.APP_NAME).getProperty("FACE_SIMILARITY", "70");
    }

    /**
     * 获取依图对接URL
     */
    public static String getYiTuInterface() {
        return AppHandle.getHandle(Constants.APP_NAME).getProperty("FACE_SIMILARITY", "70");
    }

    /**
     * 获取图片url前缀
     *
     * @return
     */
    public static String getUrlPreffix() {
        String prefix = getFDFSUrl();
        if (!prefix.endsWith("/")) {
            prefix += "/";
        }

        return prefix;
    }

    /**
     * 获取图片utl前缀,根据console配置的存储类型获取
     *
     * @return
     */
    public static String getImgUrlPreffix() {
        String blobType = getBlobType();
        if (blobType.equals(BlobType.fdfs.getType())) {
            return getFDFSUrl();
        }

        return getOSSUrl();
    }

    public static String getNginxPrefix() {
        return getNginxIpWithHttp() + "/fs/";
    }

    public static String getNginxIpWithHttp() {
        String ip = AppHandle.getHandle(Constants.CONSOLE).getProperty("NGINX_IP", "16.58.3.45");
        if (ip.indexOf("http://") < 0) {
            ip = "http://" + ip;
        }

        return ip;
    }

    public static String getGwfIP() {
        return AppHandle.getHandle(Constants.CONSOLE).getProperty("GWF_SERVER_IP", "16.58.3.130");
    }

    public static String getGwfPort() {
        return AppHandle.getHandle(Constants.CONSOLE).getProperty("GWF_SERVER_PORT", "9082");
    }

    /**
     * 获取索引开始时间
     *
     * @return yyMM
     */
    public static String getIndexBeginTime() {
        String indexBeginTime = AppHandle.getHandle(Constants.APP_NAME).getProperty("FACE_INDICE_BEGIN_MONTH", "");
        return indexBeginTime;
    }

    /**
     * 是否开启短信功能 0禁用 1启用
     *
     * @return
     */
    public static String getEnableSendSms() {
        String enableSendSms = AppHandle.getHandle(Constants.APP_NAME).getProperty("ENABLE_SEND_SMS", "0");
        return enableSendSms;
    }

    /**
     * 获取红名单审批短信推送号码
     *
     * @return
     */
    public static String getRedApprovalSendPhone() {
        String redApprovalSendPhone
                = AppHandle.getHandle(Constants.APP_NAME).getProperty("RED_APPROVAL_SEND_PHONE", "");
        return redApprovalSendPhone;
    }

    /**
     * 1:N
     *
     * @return
     */
    public static String getOne2NConfig() {
        String one2nAddr = AppHandle.getHandle(Constants.CONSOLE).getProperty("ONE2N_ADDR", "");
        return one2nAddr;
    }

    /**
     * N:N
     *
     * @return
     */
    public static String getN2NConfig() {
        String n2nAddr = AppHandle.getHandle(Constants.CONSOLE).getProperty("N2N_ADDR", "");
        return n2nAddr;
    }

    /**
     * NVN技战法查询是否为异步
     *
     * @return
     */
    public static boolean getIsNvnAsync() {
        String isNvnAsync = AppHandle.getHandle(Constants.APP_NAME).getProperty("IS_NVN_ASYNC", "0");
        return "1".equals(isNvnAsync);
    }

    /**
     * 是否外籍人项目
     */
    public static boolean isBlack() {
        return Constants.IS_BLACK.equals(AppHandle.getHandle(Constants.DATA_DEFENCE).getProperty("IS_BLACK", "0"));
    }

    /**
     * 获取红名单库
     *
     * @return
     */
    public static String getRedListDbId() {
        String redListDbId = "RED_LIST_DB";
        String vendor = getVendor();
        if (Constants.HIK_VENDOR.equals(vendor)) {
            redListDbId = AppHandle.getHandle(Constants.APP_NAME).getProperty("HIK_RED_LIST_DB", "");
        }
        return redListDbId;
    }

    /**
     * 得到厂商代码
     * @return
     */
    public static String getVendor() {
        return AppHandle.getHandle(Constants.OPENGW).getProperty("EAPLET_VENDOR", "Suntek");
    }
}
