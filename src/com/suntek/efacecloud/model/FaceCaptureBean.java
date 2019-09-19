package com.suntek.efacecloud.model;

import java.util.List;
import java.util.Map;

/**
 * 人脸抓拍实体类
 * @author wsh
 * @since 6.0
 * @version 2016-01-16
 * @Copyright (C)2016 , Suntektech
 */
public class FaceCaptureBean 
{
    private String personId;
    private List<Map<String,Object>> list;
 
    public FaceCaptureBean() 
    {
    }
 
    public FaceCaptureBean(String personId, List<Map<String,Object>> list) 
    {
        this.personId = personId;
        this.list = list;
    }
    
    public FaceCaptureBean(String personId) 
    {
        this.personId = personId;
    }
 
    public String getPersonId() 
    {
        return personId;
    }
 
    public void setPersonId(String personId) 
    {
        this.personId = personId;
    }
 
    public List<Map<String,Object>> getList() 
    {
        return list;
    }
 
    public void setList(List<Map<String,Object>> list) 
    {
        this.list = list;
    }
    
    @Override
    public int hashCode() 
    {
    	return this.getPersonId().hashCode();
    }
    
    @Override
    public boolean equals(Object o) 
    {
		if (!(o instanceof FaceCaptureBean)) {
			return false;
		}
    	
		FaceCaptureBean face = (FaceCaptureBean) o;
		if (face.getPersonId().equals(this.getPersonId())) {
			return true;
		}

		return false;
	}
}