package com.suntek.efacecloud.util;

import cn.hutool.core.io.file.FileReader;
import com.suntek.eap.EAP;
import com.suntek.eap.blob.BlobStore;
import com.suntek.eap.log.LogFactory;
import com.suntek.eap.log.ServiceLog;
import org.apache.log4j.Logger;
import org.apache.poi.ss.usermodel.Workbook;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;

/**
 * 文件上传dfs保存类 -- 目前用于保存导入导出文件上传dfs统一处理类
 *
 * @author lx
 * @version 2019年12月4日
 * @since 1.0
 */
public class FileSaveUtil {

    private static final int COMMON_TEMP_FILE = 0x41001;
    public static Logger log = LogFactory.getServiceLog("file_save");

    private static String save(byte[] bytes, String name, int dfsId) {
        try {
            BlobStore blobStore = EAP.blob.getStore();
            String fileType = name.substring(name.lastIndexOf(".") + 1);
            String fileId = blobStore.put(bytes, fileType, "", dfsId);
            ServiceLog.info("文件[" + name + "]上传成功,对应路径为:" + fileId);
            log.info("文件[" + name + "]上传成功,对应路径为:" + fileId);
            return CommonUtil.renderImage(fileId);
        } catch (Exception e) {
            log.error("文件[" + name + "]保存失败", e);
            return "";
        }
    }

    public static String save(byte[] bytes, String name) {
        return save(bytes, name, COMMON_TEMP_FILE);
    }

    public static String save(File file, String name) {
        FileReader fileReader = new FileReader(file);
        return save(fileReader.readBytes(), name, COMMON_TEMP_FILE);
    }

    public static String save(Workbook workbook, String name) {
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        try {
            workbook.write(os);
            byte[] bytes = os.toByteArray();
            os.close();
            BlobStore blobStore = EAP.blob.getStore();
            String fileType = name.substring(name.lastIndexOf(".") + 1);
            String fileId = blobStore.put(bytes, fileType, "", COMMON_TEMP_FILE);
            ServiceLog.info("文件[" + name + "]上传成功,对应路径为:" + fileId);
            log.info("文件[" + name + "]上传成功,对应路径为:" + fileId);
            return CommonUtil.renderImage(fileId);
        } catch (Exception e) {
            log.error("文件[" + name + "]保存失败", e);
            return "";
        } finally {
            try {
                os.close();
            } catch (IOException e) {
                log.error("文件[" + name + "]保存失败", e);
            }
        }
    }

}
