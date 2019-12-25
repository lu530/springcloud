package com.suntek.efacecloud.service;

import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;

import com.suntek.eap.EAP;
import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.util.calendar.DateUtil;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FaceFavoriteFileDao;
import com.suntek.efacecloud.util.Constants;

/**
 * 人脸收藏文件夹图片管理服务
 * efacecloud/rest/v6/face/favoriteFile
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/favoriteFile")
public class FaceFavoriteFileService 
{
	private FaceFavoriteFileDao fileDao = new FaceFavoriteFileDao(); 
	
	@BeanService(id="add", description="收藏人脸图片", since="1.0", type = "remote")
	public void addFile(RequestContext context) throws Exception
	{
		Map<String, Object> params = context.getParameters();
		
		String favoriteId = StringUtil.toString(params.get("FAVORITE_ID")); //--收藏夹ID
		String infoId = StringUtil.toString(params.get("INFO_ID")); //--来源图片ID
		
		if (!StringUtil.isEmpty(infoId)) {
			boolean isFavoriteFileExsist = fileDao.isFavoriteFileExsist(favoriteId, infoId);
			if (isFavoriteFileExsist) {
				context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
				context.getResponse().putData("MESSAGE", "该文件已在该收藏夹中存在，请勿重复收藏");
				return;
			}
		}
		
		String id = EAP.keyTool.getUUID();
		params.put("FILE_ID", id);
		params.put("CREATOR", context.getUserCode());
		params.put("CREATE_TIME", DateUtil.getDateTime());   //收藏时间
		
		boolean status = fileDao.insertFavoriteFile(params);
		if (status) {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "收藏成功");
		} else {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "收藏失败");
		}
	}
	
	@BeanService(id="delete", description="删除人脸图片", since="1.0")
	public void deleteFile(RequestContext context) throws Exception
	{
		Map<String, Object> params = context.getParameters();
		
		String favoriteId = StringUtil.toString(params.get("FAVORITE_ID")); //--收藏夹ID
		String fileId = StringUtil.toString(params.get("FILE_ID")); //--文件ID
		params.putAll(fileDao.getFavoriteFile(favoriteId, fileId));

		boolean status = fileDao.deleteFavoriteFile(favoriteId, fileId);
		if (status) {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "删除成功");
		} else {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "删除失败");
		}
	}
	
	@BeanService(id="detail", description="人脸图片详情", since="1.0")
	public void detailFile(RequestContext context) throws Exception
	{
		Map<String, Object> params = context.getParameters();
		String fileId = StringUtil.toString(params.get("FILE_ID")); //--文件ID
		
		List<Map<String, Object>> detailList = fileDao.detailFavoriteFile(fileId);
		List<Map<String, Object>> detailListTag = fileDao.detailFavoriteFileTag(fileId);
		if (CollectionUtils.isNotEmpty(detailList)) {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "查询成功");
			context.getResponse().putData("FACE_DETAIL_DATA", detailList);
			context.getResponse().putData("PERSON_TAG_DATA", detailListTag);
		} else {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "查询失败");
		}
	}
	
	@BeanService(id="update", description="人脸图片修改", since="1.0")
	public void updateFile(RequestContext context) throws Exception
	{
		Map<String, Object> params = context.getParameters();
		boolean status = fileDao.updateFavoriteFile(params);
		if (status) {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_SUCCESS);
			context.getResponse().putData("MESSAGE", "修改成功");
		} else {
			context.getResponse().putData("CODE", Constants.RETURN_CODE_ERROR);
			context.getResponse().putData("MESSAGE", "修改失败");
		}
	}
}
