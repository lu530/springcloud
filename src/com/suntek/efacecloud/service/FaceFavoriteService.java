package com.suntek.efacecloud.service;

import java.util.Map;

import com.suntek.eap.EAP;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.util.calendar.DateUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceFavoriteDao;
import com.suntek.efacecloud.util.Constants;

/**
 * 人脸收藏文件夹管理服务
 * efacecloud/rest/v6/face/favorite
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/favorite")
public class FaceFavoriteService 
{
	private FaceFavoriteDao favoriteDao = new FaceFavoriteDao(); 

	@BeanService(id="add", description="新建收藏夹", since="1.0",type = "remote")
	public void add(RequestContext context) throws Exception
	{
		Map<String, Object> params = context.getParameters();
		String favoriteName = StringUtil.toString(context.getParameter("FAVORITE_NAME"));
		String favoriteId = EAP.keyTool.getUUID();
		String userCode = context.getUserCode();
		
		boolean isExsist = favoriteDao.isFavoriteNameExsist(favoriteName, favoriteId, userCode);
		if (isExsist) {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "收藏夹名称已存在！");
			return;
		}
		
		String creator = context.getUserCode();
		String createTime = DateUtil.getDateTime();
		params.put("FAVORITE_ID", favoriteId);
		params.put("CREATOR", creator);
		params.put("CREATE_TIME", createTime);
		params.put("STATUS", 0);      //0状态为新建
		
		boolean status = favoriteDao.insertFavorite(params);
		if (status) {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "新增成功");
		} else {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "写入数据库失败！");
		}
	}
	
	@BeanService(id="update", description="修改收藏夹", since="1.0")
	public void update(RequestContext context) throws Exception
	{
		String favoriteId = (String)context.getParameter("FAVORITE_ID");
		String favoriteName = (String)context.getParameter("FAVORITE_NAME");
		String userCode = context.getUserCode();
		
        boolean isExsist = favoriteDao.isFavoriteNameExsist(favoriteName, favoriteId, userCode);
		if (isExsist) {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "收藏夹名称已存在！");
			return;
		}
		
		boolean status = favoriteDao.updateFavoirteById(favoriteId,favoriteName);
		if (!status) {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "编辑失败");
		} else {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "编辑成功");
		}
	}
	
	@BeanService(id="delete", description="删除收藏夹", since="1.0")
	public void delete(RequestContext context) throws Exception
	{
		String favoriteId = (String)context.getParameter("FAVORITE_ID");
		context.getParameters().putAll(favoriteDao.getFavoirteById(favoriteId));
		boolean status = favoriteDao.deleteFavoirteById(favoriteId);
	
		if (!status) {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "删除失败");
		} else {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "删除成功");
		}
	}
}
