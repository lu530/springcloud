package com.suntek.efacecloud.service;

import com.suntek.eap.EAP;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.service.redlist.FaceRedListDelegate;
import com.suntek.efacecloud.util.*;
import org.apache.commons.lang.StringUtils;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 红名单库导入服务
 * efacecloud/rest/v6/face/redlist
 *
 * @author lx
 * @version 2018-03-05
 * @since 1.0.0
 */
@LocalComponent(id = "face/redlist")
public class FaceRedListImportService {
    private static Map<String, String> importErrorMsgCache = new HashMap<String, String>();

    private FaceRedListDelegate faceRedListDelegate = new FaceRedListDelegate();

    @BeanService(id = "import", description = "红名单库导入")
    public void importRedList(RequestContext context) {
        try {

            String webAppPath = context.getHttpRequest().getServletContext().getRealPath("/");
            String unZipPath = webAppPath + EAP.keyTool.getUUID();  //解压缩路径
            String saveFileName = EAP.keyTool.getUUID() + ".zip";   //上传文件存储名称
            FileUploadUtil.saveFile(context, webAppPath, saveFileName);
            List<Map<String, Object>> successList = new ArrayList<Map<String, Object>>();
            List<String> failList = new ArrayList<String>();
            String zipPath = webAppPath + File.separator + saveFileName;
            if (!new File(zipPath).isFile()) {
                context.getResponse().setWarn("上传文件为空");
                return;
            }

            if (ConfigUtil.isFileSave()) {
                context.putParameter("SAVE_FILE", FileSaveUtil.save(new File(zipPath), saveFileName));
            }
            PersonImportUtil.getPersonImportList(webAppPath + File.separator + saveFileName, unZipPath, successList, failList);

            //调用不同厂商的实现类循环入库
            int successCount = faceRedListDelegate.importRedList(context, successList, failList, importErrorMsgCache);

            context.getResponse().putData("SUCCESS_COUNT", successCount);
            context.getResponse().putData("FAIL_COUNT", failList.size());
            context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
            if (failList.size() > 0) {
                String timeStamp = StringUtil.toString(Calendar.getInstance().getTimeInMillis());
                importErrorMsgCache.put(timeStamp, StringUtils.join(failList.toArray(new String[failList.size()]), "\n"));
                context.getResponse().putData("ERROR_FILE_ID", timeStamp);
            }
        } catch (Exception e) {
            ServiceLog.error("红名单导入失败：" + e.getMessage(), e);
        }

    }

    @BeanService(id = "exportErrorMsg", description = "导出导入时的错误信息")
    public void exportImportErrorMsg(RequestContext context) throws Exception {
        String errorFileId = StringUtil.toString(context.getParameter("ERROR_FILE_ID"));
        OutputStream os = null;

        try {
            HttpServletResponse response = context.getHttpResponse();
            response.setHeader(
                    "Content-disposition",
                    "attachment;success=true;filename =" + URLEncoder.encode("errorMsg.txt", "utf-8"));
            os = response.getOutputStream();
            os.write(importErrorMsgCache.get(errorFileId).getBytes());
        } catch (IOException e) {
            ServiceLog.error("导出错误信息异常->" + e.getMessage());
        } finally {
            if (null != os) {
                os.close();
            }
        }
    }
}
