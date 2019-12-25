package com.suntek.efacecloud.util;

import com.suntek.eap.EAP;
import com.suntek.eap.blob.BlobStore;
import com.suntek.eap.log.ServiceLog;
import com.suntek.eap.util.DateUtil;
import com.suntek.eap.util.IdentityUtil;
import com.suntek.eap.util.StringUtil;
import com.suntek.eap.util.ZipUtil;
import com.suntek.efacecloud.dao.FaceArchivesDao;
import com.suntek.efacecloud.log.Log;
import org.apache.commons.io.FileUtils;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 人员导入工具类
 * @version 2017-07-27
 * @since 1.0
 * @author swq
 *
 */
public class PersonImportUtil {
	
	/**
	 * 获取导入人员信息
	 * @param zipPath zip包路径
	 * @param unZipPath 解压缩路径
	 * @param successList 符合格式的数据
	 * @param failList 不符合格式的数据
	 * @return
	 * @throws Exception
	 */
	public static void getPersonImportList(String zipPath, String unZipPath, List<Map<String,Object>> successList, List<String> failList) throws Exception{
		
		//判断是否是远程文件地址
		if(zipPath.toLowerCase().indexOf("http://") == 0){
			String timeStamp = DateUtil.toString(new Date());
			FileDowloader.downloadFile(zipPath, unZipPath+"/zip-"+timeStamp+".zip");
			zipPath =  unZipPath+"/zip-"+timeStamp+".zip";
		}

		// 解压文件
		ZipUtil.deCompress(zipPath, unZipPath);
		File unZipFileDir = new File(unZipPath);

		// 遍历解压后的文件夹里的所有文件
		for (File file : unZipFileDir.listFiles()) {
			String fileName = file.getName();
			
			if ((fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".png")) && fileName.indexOf(".") >= 0) {
				
				String fileNamePrex = fileName.substring(0,fileName.indexOf("."));
				
				String personName = "";
				String identityId = "";
				
				if (fileNamePrex.matches("^\\d{15}$|^\\d{17}[0-9Xx]$")) {
					identityId = fileNamePrex;
				}else if (fileName.indexOf("-") < 0) {
					failList.add(fileName + "文件格式有误，格式:姓名-身份证.(jpg,png)");
					ServiceLog.error("getPersonImportList -- error: fileName:" + fileName + " 文件格式有误，格式:姓名-身份证.(jpg,png)");
					continue;
				}else {
					personName = fileNamePrex.substring(0, fileNamePrex.indexOf("-"));
					identityId = fileNamePrex.substring(fileNamePrex.indexOf("-") + 1);
				}
				

				String picId = "";
				try {
					picId =  readImg(file, fileName);
				} catch (Exception e) {
					
					failList.add(fileName + "图片上传到服务器失败");
					ServiceLog.error("getPersonImportList -- error:读取图片文件" + fileName + "失败", e);
					continue;
				}
				
				Map<String,Object> person = new HashMap<String,Object>();
				person.put("FILE_NAME", fileName);  //图片名称
				person.put("IDENTITY_TYPE", Constants.IDENTITY_TYPE_ID);     //身份证类别
				person.put("IDENTITY_ID", identityId); //身份证号
				person.put("PRESENT_ADDRESS", "");   //现住地址
				person.put("PIC", ModuleUtil.renderImage(picId));  //人员照片
				person.put("QQ", "");   //QQ
				person.put("TELEPHONE", "");   //电话
				person.put("WECHAT", "");   //微信
				person.put("WORK_ADDRESS", "");   //工作单位
				person.put("NAME", personName);      //姓名
				
				if(IdentityUtil.isIDCard(identityId)){
					
					person.put("BIRTHDAY", IdentityUtil.getBirthdayFromId(identityId,"1970-01-01"));  //出生日期
					person.put("PERMANENT_ADDRESS", identityId.substring(0, 6));  //户籍地址
					person.put("SEX", IdentityUtil.getSexFromId(identityId, "1", "2", "0"));  //姓名
					
				}else{
					
					person.put("BIRTHDAY", "");  //出生日期
					person.put("PERMANENT_ADDRESS", "");  //户籍地址
					person.put("SEX", "0");  //姓名
				}
				
				successList.add(person);
			}else{
				
				failList.add(fileName + "文件格式有误,后缀为jpg或png");
				ServiceLog.error("getPersonImportList -- error: fileName:" + fileName + " ,文件格式有误,后缀为jpg或png");
			}
			
		}

		// 删除压缩文件和解压后的本地文件
		deleteFiles(unZipFileDir,zipPath);		
	}
	
	/**
	 * 获取tomcat根目录下的指定文件夹下的图片
	 * @param picDirName 图片所在文件夹的名字
	 * @param unZipPath
	 * @param successList
	 * @param failList
	 * @throws Exception
	 */
	public static void getPersonImportListOnTomcat(String picDirName, List<Map<String,Object>> successList, List<String> failList, int counts) throws Exception{
		
		String eapHome = System.getProperty("EAP_HOME");
		String picDirPath = eapHome + File.separator + picDirName;

		File fileDir = new File(picDirPath);
		// 遍历解压后的文件夹里的所有文件
		for (File file : fileDir.listFiles()) {
			String fileName = file.getName();
			
			if ((fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".png")) && fileName.indexOf(".") >= 0) {
				
				String fileNamePrex = fileName.substring(0,fileName.indexOf("."));
				
				String personName = "";
				String identityId = "";
				
				if (fileNamePrex.matches("^\\d{15}$|^\\d{17}[0-9Xx]$")) {
					identityId = fileNamePrex;
				}else if (fileName.indexOf("-") < 0) {
					failList.add(fileName + "文件格式有误，格式:姓名-身份证.(jpg,png)");
					ServiceLog.error("getPersonImportList -- error: fileName:" + fileName + " 文件格式有误，格式:姓名-身份证.(jpg,png)");
					continue;
				}else {
					personName = fileNamePrex.substring(0, fileNamePrex.indexOf("-"));
					identityId = fileNamePrex.substring(fileNamePrex.indexOf("-") + 1);
				}
				

				String picId = "";
				try {
					picId =  readImg(file, fileName);
				} catch (Exception e) {
					
					failList.add(fileName + "图片上传到服务器失败");
					ServiceLog.error("getPersonImportList -- error:读取图片文件" + fileName + "失败", e);
					continue;
				}
				
				Map<String,Object> person = new HashMap<String,Object>();
				person.put("FILE_NAME", fileName);  //图片名称
				person.put("IDENTITY_TYPE", Constants.IDENTITY_TYPE_ID);     //身份证类别
				person.put("IDENTITY_ID", identityId); //身份证号
				person.put("PRESENT_ADDRESS", "");   //现住地址
				person.put("PIC", ModuleUtil.renderImage(picId));  //人员照片
				person.put("QQ", "");   //QQ
				person.put("TELEPHONE", "");   //电话
				person.put("WECHAT", "");   //微信
				person.put("WORK_ADDRESS", "");   //工作单位
				person.put("NAME", personName);      //姓名
				
				if(IdentityUtil.isIDCard(identityId)){
					
					person.put("BIRTHDAY", IdentityUtil.getBirthdayFromId(identityId,"1970-01-01"));  //出生日期
					person.put("PERMANENT_ADDRESS", identityId.substring(0, 6));  //户籍地址
					person.put("SEX", IdentityUtil.getSexFromId(identityId, "1", "2", "0"));  //姓名
					
				}else{
					
					person.put("BIRTHDAY", "");  //出生日期
					person.put("PERMANENT_ADDRESS", "");  //户籍地址
					person.put("SEX", "0");  //姓名
				}
				
				successList.add(person);
			}else{
				
				failList.add(fileName + "文件格式有误,后缀为jpg或png");
				ServiceLog.error("getPersonImportList -- error: fileName:" + fileName + " ,文件格式有误,后缀为jpg或png");
			}
			
			FileUtils.forceDelete(file);
			
			if (--counts<=0) {
				return;
			}
		}
	
	}
	
	
	/**
	 * 获取tomcat根目录下的指定文件夹下的图片
	 * @param picDirName 图片所在文件夹的名字
	 * @param unZipPath
	 * @param successList
	 * @param failList
	 * @beginRow 获取起始行(包括)
	 * @endRow 获取结束行(包括)
	 * @throws Exception
	 */
	private static FaceArchivesDao faceArchivesDao = new FaceArchivesDao();
	public static void getPersonImportListForHw(String picDirName, List<Map<String,Object>> successList, List<String> failList, int topN) throws Exception{
		
		String eapHome = System.getProperty("EAP_HOME");
		String picDirPath = eapHome + File.separator + picDirName;
		
		List<Map<String, Object>> pics = faceArchivesDao.getTopN(topN);
		// 遍历解压后的文件夹里的所有文件
		for (Map<String,Object> picInfo : pics) {
			String fileName = StringUtil.toString(picInfo.get("PIC_NAME"));
			String fileId = StringUtil.toString(picInfo.get("FILE_ID"));
			
			String filePath = picDirPath + File.separator + fileName;
			
			File file = new File(filePath);
			
			if (!file.exists()) {
				ServiceLog.error("图片" + fileName + "在目录" + picDirName +"下不存在");
				failList.add(fileName + "图片不存在");
				Log.archiveimportLog.error("批量增加人员失败，失败图片含" + successList.stream().map(o->o.get("FILE_NAME")).collect(Collectors.toList()));
				continue;
			}
			
			if ((fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".png")) && fileName.indexOf(".") >= 0) {
				
				String fileNamePrex = fileName.substring(0,fileName.indexOf("."));
				
				String personName = "";
				String identityId = "";
				
				if (fileNamePrex.matches("^\\d{15}$|^\\d{17}[0-9Xx]$")) {
					identityId = fileNamePrex;
				}else if (fileName.indexOf("-") < 0) {
					failList.add(fileName + "文件格式有误，格式:姓名-身份证.(jpg,png)");
					ServiceLog.error( fileName + " 文件格式有误，格式:姓名-身份证.(jpg,png)");
					continue;
				}else {
					personName = fileNamePrex.substring(0, fileNamePrex.indexOf("-"));
					identityId = fileNamePrex.substring(fileNamePrex.indexOf("-") + 1);
				}
				

				String picId = "";
				try {
					picId =  readImg(file, fileName);
				} catch (Exception e) {
					
					failList.add(fileName + "图片上传到服务器失败");
					ServiceLog.error("getPersonImportList -- error:读取图片文件" + fileName + "失败", e);
					continue;
				}
				
				Map<String,Object> person = new HashMap<String,Object>();
				person.put("FILE_NAME", fileName);  //图片名称
				person.put("IDENTITY_TYPE", Constants.IDENTITY_TYPE_ID);     //身份证类别
				person.put("IDENTITY_ID", identityId); //身份证号
				person.put("PRESENT_ADDRESS", "");   //现住地址
				person.put("PIC", ModuleUtil.renderImage(picId));  //人员照片
				person.put("QQ", "");   //QQ
				person.put("TELEPHONE", "");   //电话
				person.put("WECHAT", "");   //微信
				person.put("WORK_ADDRESS", "");   //工作单位
				person.put("NAME", personName);      //姓名
				person.put("FILE_ID", fileId);
				
				if(IdentityUtil.isIDCard(identityId)){
					
					person.put("BIRTHDAY", IdentityUtil.getBirthdayFromId(identityId,"1970-01-01"));  //出生日期
					person.put("PERMANENT_ADDRESS", identityId.substring(0, 6));  //户籍地址
					person.put("SEX", IdentityUtil.getSexFromId(identityId, "1", "2", "0"));  //姓名
					
				}else{
					
					person.put("BIRTHDAY", "");  //出生日期
					person.put("PERMANENT_ADDRESS", "");  //户籍地址
					person.put("SEX", "0");  //姓名
				}
				
				successList.add(person);
			}else{
				
				failList.add(fileName + "文件格式有误,后缀为jpg或png");
				ServiceLog.error("getPersonImportList -- error: fileName:" + fileName + " ,文件格式有误,后缀为jpg或png");
			}
		}
	
	}
	
	
	
	public static void deleteFiles(File unZipFileDir, String zipPath){
		try {
			FileUtils.deleteDirectory(unZipFileDir);
		} catch (IOException e) {
			ServiceLog.error("删除解压目录" + unZipFileDir + "出错", e);
		}
		try {
			FileUtils.forceDelete(new File(zipPath));
		} catch (IOException e) {
			ServiceLog.error("删除zip文件" + zipPath + "出错", e);
		}
	}
	
	public static String readImg(File file, String fileName) throws Exception {
		FileInputStream input = new FileInputStream(file);
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		InputStream in = null;
		try {
			byte[] buffer = new byte[1024];
			int bytesRead = 0;
			while ((bytesRead = input.read(buffer)) != -1) {
				output.write(buffer, 0, bytesRead);
			}
			byte[] data = output.toByteArray();
			BlobStore blobStore = EAP.blob.getStore();
			in = new ByteArrayInputStream(data);
			String fileType = fileName.substring(fileName.lastIndexOf(".") + 1);
			String picId = blobStore.put(in, fileType);
			return picId;
		} finally {
			if(in != null) {
				in.close();
			}
			input.close();
			output.close();
		}
	}
	
	public static void writeTxt(String path,String s) throws Exception{
		
		try {
            FileWriter writer = new FileWriter(path, true);
            writer.write(s);
            writer.close();
        } catch (IOException e) {
            ServiceLog.error("写入txt文件异常-->" + e);
        }
	}
	
   public static void writeTxt(String saveDir, String fileName, String s) throws Exception{
	   
	    File dir = new File(saveDir);
	   
	    if(!dir.exists()) {
		   dir.mkdir();
	    }
		
		try {
            FileWriter writer = new FileWriter(saveDir + File.separator + fileName, true);
            writer.write(s);
            writer.close();
        } catch (IOException e) {
            ServiceLog.error("写入txt文件异常-->" + e);
        }
	}
	
	public static String readTxt(String path) {
		
		BufferedReader bufferedReader = null;
		String line = "";
		String content = "";
		
		try {
			FileReader reader = new FileReader(new File(path));
			
			bufferedReader = new BufferedReader(reader);
			
			while((line = bufferedReader.readLine()) != null) {
				content = content + line + "\n";
			}
			
		}catch(Exception e) {
			
			ServiceLog.error("读取txt文件异常-->" + e);
			
		}finally {
			
			if(null != bufferedReader) {
				try {
					bufferedReader.close();
				} catch (IOException e) {
					ServiceLog.error("关闭bufferedReader失败-->" + e);
				}
			}
		}
		
		return content;
	}
	
}
