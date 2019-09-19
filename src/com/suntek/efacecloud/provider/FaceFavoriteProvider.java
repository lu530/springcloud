package com.suntek.efacecloud.provider;

import com.suntek.eap.jdbc.PageQueryResult;
import com.suntek.eap.pico.annotation.LocalComponent;
import com.suntek.eap.pico.annotation.QueryService;
import com.suntek.eap.tag.grid.ExportGridDataProvider;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.web.RequestContext;

/**
 * 人脸收藏文件夹查询
 * efacecloud/rest/v6/face/favorite
 * @author hzh
 * @since 1.0.0
 * @version 2017-07-11
 * @Copyright (C)2017 , Suntektech
 */
@LocalComponent(id = "face/favorite")
public class FaceFavoriteProvider extends ExportGridDataProvider
{
	@Override
	protected String buildCountSQL() 
	{
		String sql = "select count(1) from EFACE_FAVORITE where 1=1" + getOptionalStatement();
		return sql;
	}

	@Override
	protected String buildQuerySQL() 
	{
		String sql = "select EFACE_FAVORITE.FAVORITE_ID, EFACE_FAVORITE.FAVORITE_NAME, "
				+ "EFACE_FAVORITE.FAVORITE_TYPE, EFACE_FAVORITE.CREATE_TIME, "
				+ "(select count(f.FILE_ID) from EFACE_FAVORITE_FILE f where f.FAVORITE_ID = EFACE_FAVORITE.FAVORITE_ID) FILE_NUM, u.USER_NAME "
				+ "from EFACE_FAVORITE left join SYS_USER u on u.USER_CODE = EFACE_FAVORITE.CREATOR "
				+ "where 1=1" + getOptionalStatement();
		return sql;
	}

	@Override
	protected void prepare(RequestContext context) 
	{
		context.putParameter("sort", "CREATE_TIME desc");
		
		String userCode = context.getUserCode();
		String parentId = StringUtil.toString(context.getParameter("PARENT_ID"));
		String favoriteType = StringUtil.toString(context.getParameter("FAVORITE_TYPE"));
		String sortType = StringUtil.toString(context.getParameter("sortType"));

		if (!StringUtil.isNull(sortType)) {
			context.putParameter("sort", sortType);
		}
		
		if (!StringUtil.isNull(userCode)) {
			addOptionalStatement(" and EFACE_FAVORITE.CREATOR = ?");
			addParameter(userCode);
		}

		if (!StringUtil.isNull(parentId)) {
			addOptionalStatement(" and EFACE_FAVORITE.PARENT_ID = ?");
			addParameter(parentId);
		}
		if (!StringUtil.isNull(favoriteType)) {
			addOptionalStatement(" and EFACE_FAVORITE.FAVORITE_TYPE = ?");
			addParameter(favoriteType);
		}
	}
	
	
	@QueryService(id = "getData", type = "remote")
	public PageQueryResult query(RequestContext context) throws Exception {
		PageQueryResult pgr = getData(context);
		return pgr;
	}
}
