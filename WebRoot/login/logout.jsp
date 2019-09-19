
<%@ page language="java" pageEncoding="GBK"%>

<%@page import="com.suntek.eap.EAP"%>
<%@page import="com.suntek.eap.pico.ILocalComponent"%>

<%	
	
	String sessionId = request.getSession().getId();

	try { 
		Cookie[] cookies = request.getCookies();
		for (Cookie cookie: cookies) {
			if (cookie.getName().equals("JSESSIONIDSSO")) {
				if (EAP.bean.contains("portal/logout")) {
					((ILocalComponent)EAP.bean.get("portal/logout")).invoke(new Object[]{ cookie.getValue() });
				}
			}
		}
	} catch (Exception e) {
		e.printStackTrace();
	}

	request.getSession().invalidate();
	
	Cookie cookie = new Cookie("JSESSIONIDSSO", null);
	cookie.setPath("/");
	cookie.setMaxAge(0);
	response.addCookie(cookie); 
	
	cookie = new Cookie("JSESSIONID", null);
	cookie.setPath("/");
	cookie.setMaxAge(0);
	response.addCookie(cookie);
	
	cookie = new Cookie("userCode", null);
	cookie.setPath("/");
	cookie.setMaxAge(0);
	response.addCookie(cookie);
	
	cookie = new Cookie("password", null);
	cookie.setPath("/");
	cookie.setMaxAge(0);
	response.addCookie(cookie);
	
	response.sendRedirect(request.getContextPath() + "/index.jsp");
	
%>