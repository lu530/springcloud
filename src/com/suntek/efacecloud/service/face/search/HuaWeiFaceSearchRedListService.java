package com.suntek.efacecloud.service.face.search;

import com.suntek.eap.common.CommandContext;
import com.suntek.eap.core.app.AppHandle;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.eaplet.registry.Registry;
import com.suntek.efacecloud.util.Constants;
import com.suntek.face.compare.sdk.model.CollisionResult;
import com.suntek.sp.common.common.BaseCommandEnum;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@LocalComponent(id = "face/redlist/huawei")
public class HuaWeiFaceSearchRedListService extends FaceSearchRedListService {

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
            String vendor = AppHandle.getHandle(Constants.OPENGW).getProperty("EAPLET_VENDOR", "Suntek");
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

