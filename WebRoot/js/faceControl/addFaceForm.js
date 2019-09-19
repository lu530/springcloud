//权限控制
var powerOpts = {
		$names:$('#powerNames'),
		$codes:$('#powerCode'),
		$list:$("#powerNameList"),
		$wrap:$(".powerWrap")
};

//告警提醒
var warnOpts = {
		$names:$('#warnNames'),
		$codes:$('#warnCode'),
		$list:$("#warnNameList"),
		$wrap:$(".warnWrap")
}

//人员标签
var breakOpts = {
	'elem':'#filterBread',
	'service':'facestore/personTag/list',
	'callback':setPersonTag
}

//地址树
var addressOption = {
		'elem':['domicile','nowAddress'],//地址HTML容器
		'addressId':['registerAreaList','addressArea'],//初始化省级内容
		'service':'face/address/getTree',//请求服务
		'tmpl':'childNodeListTemplate',//初始化模板
		'selectArr':['PERMANENT_ADDRESS','PRESENT_ADDRESS']
		/*'data':['150623','440111'],//回填值*/
		/*'callback':doSearch//回调函数*/
}

//布控有效期初始化参数
var timeOption = {
		'elem':$('#timeWrap'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'format':'yyyy-MM-dd'
};

var beginTime = $('#BIRTHDAY');

$(function(){
	UI.control.init();
	initEvent();
	//初始化人员标签
	initBreak(breakOpts);
	//初始化地址树
    initAreaTree(addressOption);
    //上传头部
    topUploadPic();
    //证件验证
    passport();
    //底部按钮定位
    fixation();
    //出生日期
    initTime();
	//初始化时间控件
    initDateTime(timeOption);
	//权限控制
    initUserList(powerOpts);
    //告警提醒
	initUserList(warnOpts);
	//视频源操作
	initDevice();
});

function initEvent(){
	//布控时间
	$('[name="timeType"]').change(function(){
		var $this = $(this);
		var val = $this.val();
		if(val == 0){
			$("#controlTime").addClass("hide");
		}else{
			$("#controlTime").removeClass("hide");
		}
	});
	
	//告警核查方式
	$('[name="examineWay"]').change(function(){
		var val = $(this).val();
		if(val == 1){
			$("#examineWayWrap").removeClass("hide");
		}else{
			$("#examineWayWrap").addClass("hide")
		}
	});
	
	//告警阈值设置
	$('[name="thresholdSetting"]').click(function(){
		var $this = $(this);
		var val = $this.val();
		var checked = $this.prop("checked");
		if(val == 1){
			if(checked){
				$("#cameraList").removeClass("hide");
			}else{
				$("#cameraList").addClass("hide");
			}
		}else{
			if(checked){
				$this.parent().siblings().removeClass("hide");
			}else{
				$this.parent().siblings().addClass("hide");
			}
		}
	});
}

function setPersonTag(code){
	$("#personTabVal").val(code.join(","));
}

//用户列表树
/*$names:$('#powerNames'),
$codes:$('#powerCode'),
$list:$("#powerNameList"),
$wrap:$(".powerWrap")*/
function initUserList(opts){
	var $names = opts.$names,
		$codes = opts.$codes,
		$list = opts.$list,
		$wrap = opts.$wrap;
	//通过卡口树加载设备
	$names.click(function(e){
		$wrap.removeClass("open");
		//回填数据
		var userCode = $codes.val();
		var userName = $names.attr("title");
		var deptCode = $wrap.find('.deptCode').val();
		if(userCode!=''){
			var obj = {
					userCodeArr:userCode.split(","),
					userNameArr:userName.split(","),
					deptCodeArr:deptCode.split(",")
			}
		}else{
			var obj = '';
		}
		
		UI.util.showCommonWindow('/efacecloud/page/executeControl/userInfoList.html?dataObj='+JSON.stringify(obj), '设备选择', 1000, 600,function(resp){
			$names.html(resp.userName);
			$names.attr('title',resp.userName);
			$names.attr('usercode',resp.userCode);
			$codes.val(resp.userCode);
			$wrap.find('.deptCode').val(resp.deptCode);
			
			addDrowdownDeviceList({
				deviceId:resp.userCode,
				deviceName:resp.userName,
				deviceNameList:$list,
				dropdownListText:$wrap.find(".dropdown-list-text")
			});
		});
		e.stopPropagation();
	});
	
	//删除已选设备
	$wrap.on("click",".removeDeviceBtn",function(e){
		var $this = $(this);
		var userCode = $this.attr("deviceid");
		var userCodeArr = $codes.val().split(",");
		var deptCodeArr = $wrap.find('.deptCode').val().split(",");
		var deviceNameArr = $names.html().split(",");
		var index = userCodeArr.indexOf(userCode),
			orgCode = $names.attr("usercode"),
			orgCodeArr = orgCode.split(",");
		
		$this.parents("li").remove();
		userCodeArr.splice(index,1);
		deptCodeArr.splice(index,1);
		deviceNameArr.splice(index,1);
		orgCodeArr.splice(index,1);
		$codes.val(userCodeArr.join(","));
		$wrap.find('.deptCode').val(deptCodeArr.join(","));
		$names.html(deviceNameArr.join(","));
		$names.attr("title",deviceNameArr.join(","));
		$names.attr("usercode",orgCodeArr.join(","));
		if($list.find("li").length == 0){
			$wrap.find(".dropdown-list-text").attr("data-toggle","");
			$wrap.find(".dropdown-list-text .dropdown").addClass("hide");
			$wrap.removeClass("open");
		}
		
		e.stopPropagation();
	});
}

//设备树
function initDevice(){
	//通过卡口树加载设备
	$('#deviceName').click(function(e){
		//回填数据
		checkDrowDownDeviceList({
			deviceNames:$('#deviceName').html(),
			deviceId:$('#orgCode').val(),
			deviceIdInt:$('#orgCodeInt').val(),
			orgCode:$("#deviceName").attr("orgcode")
		});
		
		UI.util.showCommonWindow('/connectplus/page/device/deviceList.html?deviceType=194', '设备选择', 1000, 600,function(resp){
			$('#deviceName').html(resp.deviceName);
			$('#deviceName').attr('title',resp.deviceName);
			$('#deviceName').attr('orgcode',resp.orgCode);
			$('#orgCode').val(resp.deviceId);
			$('#orgCodeInt').val(resp.deviceIdInt);
			
			addDrowdownDeviceList({
				deviceId:resp.deviceId,
				deviceName:resp.deviceName,
				deviceNameList:$("#deviceNameList"),
				dropdownListText:$(".dropdown-list-text")
			});
			
			var curObj = {
					deviceId:resp.deviceId.split(","),
					deviceName:resp.deviceName.split(",")
			}
			$("#cameraList .list-con").html(tmpl("cameraListTemplate",curObj))
		});
		e.stopPropagation();
	});
	
	//删除已选设备
	$(".videoChose").on("click",".removeDeviceBtn",function(e){
		var $this = $(this);
		var deviceId = $this.attr("deviceid");
		var deviceIdArr = $('#orgCode').val().split(",");
		var deviceIdIntArr = $('#orgCodeInt').val().split(",");
		var deviceNameArr = $('#deviceName').html().split(",");
		var index = deviceIdArr.indexOf(deviceId),
			orgCode = $("#deviceName").attr("orgcode"),
			orgCodeArr = orgCode.split(",");
		
		$this.parents("li").remove();
		deviceIdArr.splice(index,1);
		deviceIdIntArr.splice(index,1);
		deviceNameArr.splice(index,1);
		orgCodeArr.splice(index,1);
		$('#orgCode').val(deviceIdArr.join(","));
		$('#orgCodeInt').val(deviceIdIntArr.join(","));
		$('#deviceName').html(deviceNameArr.join(","));
		$('#deviceName').attr("title",deviceNameArr.join(","));
		$('#deviceName').attr("orgcode",orgCodeArr.join(","));
		if($("#deviceNameList li").length == 0){
			$(".dropdown-list-text").attr("data-toggle","");
			$(".dropdown-list-text .dropdown").addClass("hide");
			$(".dropdown-list").removeClass("open");
		}
		
		e.stopPropagation();
	});
}

//回填附件，支持点击下载
function showAttachInfo(data,editType){
	if(!data){
		return false;
	}
	 //展示附件
	 var html = '';
	 if(data.length != 0){
		 $.each(data,function(i,n){
			 var fileName = n.FILE_NAME;
			 
			 var pointArr = [];
			$.each(fileName,function(i,n){
				if(n == '.'){
					pointArr.push(i);
				}
			});
			var pointIndex = pointArr[pointArr.length-1];
			 
			 var type = fileName.substring(pointIndex+1,fileName.length);
			 
			 
			 var fileUrl = n.FILE_URL;
			 var imgUrl = n.FILE_URL;
			 var size = n.FILE_SIZE;
			 switch(type.toLocaleUpperCase()){
			 case 'DOC':
			 case 'DOCX':
				 imgUrl = '/efacecloud/images/word.png'
					 break;
			 case 'RAR':
			 case 'ZIP':
				 imgUrl = '/efacecloud/images/zip.png'
					 break;
			 case 'XLSX':
				 imgUrl = '/efacecloud/images/excel.png'
					 break;
			 case 'PDF':
				 imgUrl = '/efacecloud/images/pdf.png'
					 break;
			 }
			 html += '<div class="image-item downloadFile" url="'+fileUrl+'" filename="'+fileName+'"> '+
			 '<div class="upload-img">'+
			 '<img src="'+imgUrl+'" foruploadimg="uploadFile">';
			 if(editType){
				 html +='<input type="hidden" foruploadform name="FILE_URL" value="'+fileUrl+'" filename="'+fileName+'" size="'+size+'">'+ 
				 '<span class="icon-btn-wrap">'+
				 '<i class="delete-img-btn icon-trash" title="点击删除文件"></i>'+
				 '</span>'; 
			 }
			 html += '<div class="file-name" title="'+fileName+'">'+fileName+'<div class="file-name-bg"></div></div>'+
			 '</div>'+
			 '</div>';
		 });
	 }else{
		 if(!editType){
			 html +='<label class="radio-inline p0 ml5">无</label>';
		 }
	 }
	 
	 if(editType){
		 $("#attachInfo").after(html);
	 }else{
		 $("#attachInfo").after(html).remove();
	 }
}

//出生日期
function initTime(){
    var now = new Date();
    if(beginTime.val() == ''){
    	beginTime.val(now.format("yyyy-MM-dd"));
    }
    beginTime.focus(function(){
        WdatePicker({
        	isShowClear:false,
        	readOnly:true,
            startDate:'%y-#{%M}-%d',
            dateFmt:'yyyy-MM-dd',
            maxDate:now.format("yyyy-MM-dd")
        });
    });
}

//时间筛选
function initDateTime(option){
	var $ele=option.elem,
	$beginTime=option.beginTime,
	$endTime=option.endTime,
	callback=option.callback,
	format=option.format||'yyyy-MM-dd HH:mm:ss';
	var formatStartB = format=='yyyy-MM-dd HH:mm:ss'?'%y-#{%M}-%d 00:00:00':'%y-#{%M}-%d';
	var formatStartE = format=='yyyy-MM-dd HH:mm:ss'?'%y-#{%M}-%d %H:%m:%s':'%y-#{%M}-%d';
	var targetTime = option.targetTime || 'today';
	var todayTime= UI.util.getDateTime(targetTime, format);
	$beginTime.val(todayTime.bT);
	$endTime.val(todayTime.eT);
	
	var dateTime = {};
	var $zdybtn=$ele.find('.zdyTimeBtn');
	$beginTime.focus(function(){
		WdatePicker({
			startDate:formatStartB,
			dateFmt:format,
			maxDate:'#F{$dp.$D(\''+$endTime.attr('id')+'\')||\''+todayTime.eT+'\'}',
			isShowClear:false
		});
	});
	$endTime.focus(function(){
		WdatePicker({
			startDate:formatStartE,
			dateFmt:format,
			minDate:'#F{$dp.$D(\''+$beginTime.attr('id')+'\')}',
			isShowClear:false
		});
	});
	
	//时间控件确定检索按钮
	$zdybtn.click(function(){
		
		dateTime.bT = $beginTime.val();
		dateTime.eT	= $endTime.val();
		
		if( typeof callback == 'function'){
			callback(dateTime);		
		}
	});	

	
	//时间
	$ele.on('click','.tag-item',function(){
		var timeId = $(this).attr("time-control");
		
		$timeControl = $(this).parents('.filter-tag').find(".opera-group");
		$timeControl.removeClass("active");
		
		switch (timeId) {		
			case 'qb':
				dateTime.bT="";
				dateTime.eT=""
				break;
				
			case 'jt':
				dateTime= UI.util.getDateTime("today",format);
				break;
				
			case 'zt':
				dateTime= UI.util.getDateTime("yesterday",format);
				break;
				
			case 'bz':
				dateTime = UI.util.getDateTime("thisWeek",format);
				break;
			
			case 'by':			
				dateTime = UI.util.getDateTime("thisMonth",format);
				break;
			
			case 'zdy':			
				dateTime = UI.util.getDateTime("today",format);
				$timeControl.addClass("active");
				break;
			
		}

		$beginTime.val(dateTime.bT);
		$endTime.val(dateTime.eT);
		
		$(this).addClass('active').siblings('span').removeClass('active');
		
		if(typeof callback == 'function'&&timeId!='zdy'){
			callback(dateTime);
		}
		
	});
	
}