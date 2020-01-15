package com.suntek.efacecloud.service.redlist;

import com.alibaba.fastjson.JSONObject;
import com.suntek.eap.EAP;
import com.suntek.eap.common.CommandContext;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.util.ConfigUtil;
import com.suntek.efacecloud.util.Constants;
import com.suntek.efacecloud.util.DateUtil;
import com.suntek.efacecloud.util.FileMd5Util;
import com.suntek.efacecloud.util.ModuleUtil;
import com.suntek.face.compare.sdk.model.CollisionResult;
import com.suntek.sp.common.common.BaseCommandEnum;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@LocalComponent(id = "face/redlist/huawei")
public class HuaWeiFaceRedListService extends FaceRedListService {

    private List<Map<String, Object>> buildHuaWeiAlgoList(RequestContext context) {
        Map<String, Object> thresholdMap = new HashMap<>();
        thresholdMap.put("THRESHOLD", context.getParameter("THRESHOLD"));
        thresholdMap.put("ALGO_TYPE", AppHandle.getHandle(Constants.OPENGW).getProperty("ALGORITHM_CODE_NVN"));
        return Arrays.asList(thresholdMap);
    }

    @Override
    public CollisionResult faceOne2NSearch(RequestContext context, String pic) {
        context.putParameter("TOP_N", context.getParameter("pageSize"));
        context.putParameter("ALGO_LIST", this.buildHuaWeiAlgoList(context));
        context.putParameter("LIBRARY_ID", Constants.STATIC_LIB_ID_RED_LIST);
        context.putParameter("PIC", StringUtil.toString(context.getParameter("PIC")));
        context.putParameter("REQ_TYPE", 2);
        CommandContext commandContext = new CommandContext(context.getHttpRequest());

        Registry registry = Registry.getInstance();

        commandContext.setBody(context.getParameters());
        try {
            String vendor = ConfigUtil.getVendor();
            registry.selectCommand("hw" + BaseCommandEnum.staticLibFaceQuery.getUri(), "4401", vendor).exec(commandContext);
        } catch (Exception e) {
            ServiceLog.error("在红名单库中以图搜图失败", e);
            return null;
        }
        ServiceLog.debug("检索个人库人脸返回数据 " + commandContext.getResponse().getResult());
        CollisionResult collisionResult = new CollisionResult();
        collisionResult.setList(new ArrayList());
        if (commandContext.getResponse().getCode() != 0L) {
            context.getResponse().setError("华为接口返回异常");
            ServiceLog.error(commandContext.getResponse().getMessage());
            return null;
        } else {
            List<Map<String, Object>> resultList = (List<Map<String, Object>>) commandContext.getResponse().getData("DATA");

            if (null != resultList && resultList.size() > 0) {

                for (Map<String, Object> map : resultList) {

                    long code = Long.parseLong(StringUtil.toString(map.get("CODE"), "0"));
                    String algoType = StringUtil.toString(map.get("ALGO_TYPE"));

                    if (code != 0L) {
                        ServiceLog.error("调用算法[" + algoType + "]检索人脸失败 " + map.get("MESSAGE"));
                        context.getResponse().setError("调用算法[" + algoType + "]检索人脸失败 " + map.get("MESSAGE"));
                        return null;
                    } else {
                        List<Map<String, Object>> personList = (List<Map<String, Object>>) map.get("LIST");
                        personList.forEach(person -> {
                            person.put("ID", person.get("PERSON_ID"));
                            person.put("SIMILARITY", person.get("SCORE"));
                        });
                        collisionResult.getList().addAll(personList);
                    }
                }
            }
        }
        return collisionResult;
    }

    @Override
    public void initRedListLib() {
        try {
            if (!this.isExistRedListDB()) {
                Map<String, Object> param = new HashMap<>();
                CommandContext ctx = new CommandContext("admin", "localhost");
                param.put("DB_TYPE", Constants.LIB_TYPE_PERSON);
                param.put("DB_ID", Constants.STATIC_LIB_ID_RED_LIST);
                param.put("DB_NAME", Constants.STATIC_LIB_ID_RED_LIST);

                ctx.setBody(param);
                Registry.getInstance().selectCommands("hw" + BaseCommandEnum.staticLibAdd.getUri()).exec(ctx);
            }
        } catch (Exception e) {
            ServiceLog.error(e);
        }

    }

    @Override
    public CollisionResult deleteFace(RequestContext context) {
        CollisionResult collisionResult = new CollisionResult();
        try {
            collisionResult.setCode(Constants.RETURN_CODE_SUCCESS);
            this.deletePerson(context);
        } catch (Exception e) {
            collisionResult.setCode(Constants.RETURN_CODE_ERROR);
        }
        return collisionResult;
    }

    private static final int BATCH_IMPORT_NUM = 10;

    @Override
    public void addOrEdit(RequestContext context) throws Exception {
        Map<String, Object> params = context.getParameters();
        String infoId = StringUtil.toString(params.get("INFO_ID"));
        if (!StringUtil.isEmpty(infoId)) {
            this.deletePerson(context);
        } else {
            params.put("INFO_ID", EAP.keyTool.getIDGenerator());
        }
        this.insertPerson(context);
    }

    /**
     * 新增红名单人
     *
     * @param context
     */
    public void insertPerson(RequestContext context) throws Exception {
        Map<String, Object> param = context.getParameters();
        this.addPerson(context, param);
    }

    // 添加布控人员
    private Map<String, Object> addPerson(RequestContext context, Map<String, Object> param)
            throws Exception {

        ServiceLog.info("开始添加静态库人员");
        long startTime = System.currentTimeMillis();
        param.put("PERSON_ID", param.get("INFO_ID"));
        param.put("DB_ID", Constants.STATIC_LIB_ID_RED_LIST);
        param.put("PIC_MD5", FileMd5Util.getUrlMD5String(StringUtil.toString(param.get("PIC"))));
        String pic = StringUtil.toString(param.get("PIC"));

        param.put("PIC", pic);

        // 判断是否需要审核
        // judgeIsNeedApprove(param);

        CommandContext ctx = new CommandContext(context.getHttpRequest());

        ctx.setBody(param);
        ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
        ctx.setUserCode(context.getUserCode());
        Registry.getInstance().selectCommands("hw" + BaseCommandEnum.staticLibFaceAdd.getUri()).exec(ctx);

        long code = ctx.getResponse().getCode();
        String message = ctx.getResponse().getMessage();
        context.getResponse().putData("CODE", code);
        context.getResponse().putData("MESSAGE", message);

        if (0L == code) {
            this.addExtraInfo(context, param);
            this.insertRedPerson(param);
            ServiceLog.info("添加静态库人员完成 耗时" + (System.currentTimeMillis() - startTime) + "ms");
            return ctx.getResponse().getBody();
        } else {
            ServiceLog.error("添加静态库人员失败" + ctx.getResponse().getMessage());
            throw new Exception("添加静态库人员失败" + ctx.getResponse().getMessage());
        }
    }

    /**
     * 增加额外的信息
     */
    private void addExtraInfo(RequestContext context, Map<String, Object> param) {
        param.put("PIC_QUALITY", null);
        param.put("CREATOR", context.getUser().getCode());
        param.put("CREATE_TIME", DateUtil.dateToString(new Date()));
        param.put("RLTZ", null);
    }

    /**
     * 删除红名单中的人
     *
     * @param context
     * @throws Exception
     */
    public void deletePerson(RequestContext context) throws Exception {
        CommandContext ctx = new CommandContext(context.getHttpRequest());
        Map<String, Object> params = context.getParameters();
        context.getParameters().put("ALGO_TYPE", ModuleUtil.getAlgoTypeStr());
        String infoId = StringUtil.toString(params.get("INFO_ID"));
        params.put("PERSON_ID", infoId);
        params.put("DB_ID", Constants.STATIC_LIB_ID_RED_LIST);
        ctx.setBody(context.getParameters());
        ctx.setOrgCode(context.getUser().getDepartment().getCivilCode());
        ctx.setUserCode(context.getUserCode());
        Registry.getInstance().selectCommands("hw" + BaseCommandEnum.staticLibFaceDel.getUri()).exec(ctx);
        context.getResponse().putData("CODE", ctx.getResponse().getCode());
        context.getResponse().putData("MESSAGE", ctx.getResponse().getMessage());
        long code = ctx.getResponse().getCode();
        if (0L == code) {
            this.deleteRedPerson(infoId);
        } else {
            ServiceLog.error("删除静态人员失败" + ctx.getResponse().getMessage());
            context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
            context.getResponse().putData("MESSAGE", "从静态小库注销人脸失败！");
        }
    }


    /**
     * 把红名单的人员批量添加到数据库
     *
     * @param list
     */
    private void batchInsertRedList(RequestContext context, List<Map<String, Object>> list) {
        list.forEach(row -> {
            try {
                row.put("INFO_ID", row.get("PERSON_ID"));
                this.addExtraInfo(context, row);
                this.insertRedPerson(row);
            } catch (Exception e) {
                ServiceLog.error("红名单批量添加到数据库失败", e);
            }
        });
    }

    @Override
    public int importRedList(RequestContext context, List<Map<String, Object>> successList, List<String> failList, Map<String, String> importErrorMsgCache) throws Exception {
        successList.forEach(row -> row.put("PERSON_ID", EAP.keyTool.getIDGenerator()));
        List<Map<String, Object>> subList = new ArrayList<>(BATCH_IMPORT_NUM);
        for (int i = 0; i < successList.size(); i++) {
            subList.add(successList.get(i));
            if (1 != 0 && i % BATCH_IMPORT_NUM == 0) {
                this.realImportRedList(context, subList, failList);
            }
        }
        this.realImportRedList(context, subList, failList);
        return successList.size();
    }

    private void realImportRedList(RequestContext context, List<Map<String, Object>> subList, List<String> failList) {
        Map<String, Object> tempMap = new LinkedHashMap<>();
        CommandContext commandContext = new CommandContext(context.getHttpRequest());
        tempMap.put("PERSON_LIST", subList);
        tempMap.put("DB_ID", Constants.STATIC_LIB_ID_RED_LIST);
        ServiceLog.debug("此次批量导入数据 ： " + JSONObject.toJSONString(tempMap));
        Registry registry = Registry.getInstance();
        commandContext.setBody(tempMap);
        commandContext.setOrgCode(StringUtil.toString(tempMap.get("ORG_CODE")));
        commandContext.setUserCode(StringUtil.toString(tempMap.get("USER_CODE")));
        try {
            registry.selectCommands("hw" + BaseCommandEnum.staticLibFaceBatchAdd.getUri()).exec(commandContext);
        } catch (Exception e) {
            ServiceLog.error(e);
        }
        long code = commandContext.getResponse().getCode();
        String message = commandContext.getResponse().getMessage();
        if (0L != code) {
            for (int j = 0; j < BATCH_IMPORT_NUM; j++) {
                failList.add(message);
            }
        } else {
            this.batchInsertRedList(context, subList);
        }
        subList.clear();
    }

    /**
     * 看华为静态库中是否有名称为Constants.STATIC_LIB_ID_RED_LIST的库
     * @return 如果有返回true，如果没有返回false
     * @throws Exception
     */
    private boolean isExistRedListDB() throws Exception {
        CommandContext ctx = new CommandContext("admin", "localhost");
        Map<String, Object> param = new HashMap<>();
        param.put("pageNo", "1");
        param.put("pageSize", "100");
        ctx.setBody(param);
        Registry.getInstance().selectCommands("hw" + BaseCommandEnum.staticLibQuery.getUri()).exec(ctx);
        List<Map<String, Object>> records = (List<Map<String, Object>>) ctx.getResponse().getData("RECORDS");
        String start = Constants.STATIC_LIB_ID_RED_LIST.replaceAll("_", "-");
        return records.stream()
                .filter(record -> record.get("DB_NAME") != null && record.get("DB_NAME").toString().startsWith(start))
                .collect(Collectors.toList())
                .size() > 0;

    }

    /**
     * 创建红名单库
     * @param context
     * @throws Exception
     */
    @BeanService(id = "createRedListDB", description = "创建红名单库", type = "remote")
    public void createRedListDB(RequestContext context) throws Exception {
        this.initRedListLib();
    }
}

