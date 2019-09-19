package com.suntek.efacecloud.model;

/**
 * 用于定义excel表结构的类，辅助Excel表单的导入和导出
 * 一个ExcelColumn代表Excel表中的一个列
 * @author zwq
 * 
 */
public class ExcelColumn {
	
	//该列实际对应的表单中的key值
	private String key;
	
	//该列在Excel中的表头名称
	private String header;
	
	//该列宽度（字节）
	private int width;
	
	//该列的内容是否为图片
	private boolean isImg;
	
	public ExcelColumn() {
		this(null, null, 0, false);
	}

	public ExcelColumn(String key, String header, boolean isImg) {
		this(key, header, 0, isImg);
	}
	
	public ExcelColumn(String key, String header, int width, boolean isImg) {
		this.key = key;
		this.header = header;
		this.setWidth(width);
		this.setImg(isImg);
	}
	
	public String getKey() {
		return key;
	}
	public void setKey(String key) {
		this.key = key;
	}
	public String getHeader() {
		return header;
	}
	public void setHeader(String header) {
		this.header = header;
	}
	
	public int getWidth() {
		return width;
	}

	public void setWidth(int width) {
		this.width = width;
	}

	public boolean isImg() {
		return isImg;
	}

	public void setImg(boolean isImg) {
		this.isImg = isImg;
	}
}
