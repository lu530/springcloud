package com.suntek.efacecloud.rest;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.web.RequestContext;
import com.suntek.eap.web.SessionContext;
import com.suntek.efacecloud.util.HttpRequestJsonTransformer;

import net.sf.json.JSONObject;

/**
 * APP调用接口
 * @author lx
 * @since 
 * @version 2016年2月12日
 * @Copyright (C)2016 , Suntektech
 */
@WebServlet(urlPatterns="/api/rest/*", name="SurAlarmAPI")
public class SurAlarmServlet extends HttpServlet
{
	private static final long serialVersionUID = 1L;
	
	@Override
	public void init() throws ServletException
	{
		ServiceRepository.init();
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		service(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		service(req, resp);
	}

	@SuppressWarnings("unchecked")
	@Override
	protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
	{	
		req.setCharacterEncoding("utf-8");
		
		resp.setCharacterEncoding("UTF-8");
		
		resp.setContentType("text/html; charset=UTF-8");
		
		String serviceId = getServiceId(req);

        ServiceLog.debug("invoking api service -> " + serviceId);
		
        Object ret = "";

        JSONObject json = HttpRequestJsonTransformer.streamToJsonObj(req);
        
		SessionContext.setContext(new RequestContext(req));
		
		if(ServiceRepository.isRegist(serviceId)) {
			json.put("uriSuffixPre", getBaseUrI(req));
	        ServiceLog.debug(serviceId + " invoke param ->" + json);
			
			try {
				//业务处理
				ret = ServiceRepository.get(serviceId).handle(json);
			} catch (Exception e) {
				ServiceLog.error("invoke service fail -> " + serviceId, e);
				ret = new HashMap<>();
				((Map<String, Object>)ret).put("StatusCode", StatusCode.SERVER_ERROR);
			}
		}else {
			ret = new HashMap<>();
			
			((Map<String, Object>)ret).put("StatusCode", StatusCode.SERVICE_UNREGIST);
			
			ServiceLog.info("service unregist -> " + serviceId);
		}
		
		if(!(ret instanceof String)){
			ret = JSONObject.fromObject(ret).toString();
		}		
		
		ServiceLog.debug(serviceId + " invoke result -> " + ret);

		resp.getWriter().write(ret.toString());
		SessionContext.remove();
	}
	
	protected String getServiceId(HttpServletRequest request)
	{
		String query = request.getRequestURI();
		
        String context = request.getContextPath();
        
        String serviceId = query.replace(context + "/api/rest/", "");
        
        return serviceId;
	}
	protected String getBaseUrI(HttpServletRequest request)
	{
		String uriSuffixPre = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort();
        
        return uriSuffixPre;
	}
}
