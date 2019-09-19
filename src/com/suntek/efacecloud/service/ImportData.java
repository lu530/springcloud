package com.suntek.efacecloud.service;

import com.alibaba.fastjson.JSON;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.ImportDataDao;
import com.suntek.efacecloud.log.Log;

/**
 * 导入电梯数据
 * @author admin
 *
 */
@LocalComponent(id="importData")
public class ImportData {
	
	private ImportDataDao dao = new ImportDataDao();
	
	@BeanService(id = "importElevatorData", description = "导入电梯数据", type = "remote")
	public void importElevatorData(RequestContext context){
		
		try {
			long num = dao.importElevatorData();
			context.getResponse().putData("message", "调用成功,num : "+num);
		} catch (Exception e) {
			Log.importDataLog.error(e.getMessage());
			context.getResponse().putData("message", "调用异常 : "+e.getMessage());
		}
		
	}
	
}
