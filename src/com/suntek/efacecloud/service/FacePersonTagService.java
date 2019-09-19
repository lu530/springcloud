package com.suntek.efacecloud.service;

import com.suntek.eap.pico.annotation.BeanService;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.web.RequestContext;
import com.suntek.efacecloud.dao.FacePersonTagDao;

/**
 * 人员标签查询
 * efacecloud/rest/v6/face/personTag
 * @author lx
 * @since 1.0.0
 * @version 2017-06-29
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/personTag")
public class FacePersonTagService 
{
	private FacePersonTagDao tagDao = new FacePersonTagDao();
	
	@BeanService(id="list", description="获取标签列表", since="1.0")
	public void list(RequestContext context) throws Exception
	{
		String id = (String) context.getParameter("elementId");
		context.getResponse().putData(id, tagDao.getPersonTagList());
	}
}
