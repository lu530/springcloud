/**
 * @Author lyy
 * @version 2017-08-11
 * @description 待确定身份人脸库;
 */


var params = {};//批量删除传递的参数
var beginTime  = UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").bT,  //页面默认选中今天
	endTime = UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").eT;
$('#beginTime').val(beginTime);
$('#endTime').val(endTime);

var queryParams = {//初始化请求参数
		KEYWORDS:'',
		BEGIN_TIME:UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").bT,
		END_TIME:UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").eT,
		THRESHOLD:'',
		DEVICE_IDS:$("#orgTreeCode").val(),
		DB_ID :'',
		SEARCH_TYPE:'1'
};

var timeOptionDraw = {//初始化时间
		'elem':$('#timeTagList'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'format':"yyyy-MM-dd HH:mm:ss"
};

var addressOption = {//初始化布控库
		'elem':['domicile'],//地址HTML容器
		'addressId':['registerDbList'],//初始化布控库内容
		'service':'face/dispatchedAlarm/dbList',//请求服务
		'tmpl':'childNodeListTemplate',//初始化模板
		'callback':doSearchByDb//回调函数
};


$(function(){
	UI.control.init();
	compatibleIndexOf();
	initEvent();
	getDeviceModule();  //定义在common中
	initDateTimeControl(timeOptionDraw);
	initDbTree(addressOption);
	initWaterMark();
	//initFilterEvent();	
});

function initEvent(){
	//布控库取消
	$("body").on("click",".attrCancelBtn",function(){
		doSearchByDb([]);
	});
    //轨迹分析
    $("body").on("click",".trajectory-search",function(){
    	var time = {
	        	bT: queryParams.BEGIN_TIME,
	        	eT: queryParams.END_TIME
	        };
        openWindowPopup('track',$(this).attr("url"),time);
    });
    //身份核查
    $("body").on("click",".verification-search",function(){
        openWindowPopup('identity',$(this).attr("url"));
    });


	//通过卡口树加载设备
	$('#deviceNames').click(function(e){
		//回填数据
		checkDrowDownDeviceList({
			deviceNames:$('#deviceNames').html(),
			deviceId:$('#orgCode').val(),
			deviceIdInt:$('#orgCodeInt').val(),
			orgCode:$("#deviceNames").attr("orgcode")
		});
		
		UI.util.showCommonWindow(deviceModule + '/page/device/deviceList.html?deviceType=194', '感知设备', 1000, 600,function(resp){
			$('#deviceNames').html(resp.deviceName);
			$('#deviceNames').attr('title',resp.deviceName);
			$('#deviceNames').attr('orgcode',resp.orgCode);
			$('#orgCode').val(resp.deviceId);
			
			addDrowdownDeviceList({
				deviceId:resp.deviceId,
				deviceName:resp.deviceName,
				deviceNameList:$("#deviceNameList"),
				dropdownListText:$(".dropdown-list-text")
			});
		});
		e.stopPropagation();
	});
	
	//删除已选设备
	$("body").on("click",".removeDeviceBtn",function(e){
		var $this = $(this);
		var deviceId = $this.attr("deviceid");
		var deviceIdArr = $('#orgCode').val().split(",");
		var deviceNameArr = $('#deviceNames').html().split(",");
		var index = deviceIdArr.indexOf(deviceId),
			orgCode = $("#deviceNames").attr("orgcode"),
			orgCodeArr = orgCode.split(",");
		
		$this.parents("li").remove();
		deviceIdArr.splice(index,1);
		deviceNameArr.splice(index,1);
		orgCodeArr.splice(index,1);
		$('#orgCode').val(deviceIdArr.join(","));
		$('#deviceNames').html(deviceNameArr.join(","));
		$('#deviceNames').attr("title",deviceNameArr.join(","));
		$('#deviceNames').attr("orgcode",orgCodeArr.join(","));
		if($("#deviceNameList li").length == 0){
			$(".dropdown-list-text").attr("data-toggle","");
			$(".dropdown-list-text .dropdown").addClass("hide");
			$(".dropdown-list").removeClass("open");
		}
		e.stopPropagation();
	});
	
	//点击进入卡口选择地图
	$('#locate').click(function(){
		UI.util.showCommonWindow(deviceModule + '/page/device/deviceMap.html?deviceType=194', '感知设备', 1000, 600,function(resp){
			$('#deviceNames').html(resp.deviceName);
			$('#deviceNames').attr('title',resp.deviceName);
			$('#deviceNames').attr('orgcode',resp.orgCode);
			$('#orgCode').val(resp.deviceId);
			
			addDrowdownDeviceList({
				deviceId:resp.deviceId,
				deviceName:resp.deviceName,
				deviceNameList:$("#deviceNameList"),
				dropdownListText:$(".dropdown-list-text")
			});
		});
	})
	
	$('.searchBarBtn').click(doSearch);
	
	//搜索姓名，身份证查询条回车事件
	$('.searchCon').keypress(function(e){
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});
		
	//搜索相似度回车事件
	$('.searchSimilarCon').keypress(function(e){
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});
	
	//刷新按钮
	$("body").on("click","#freshBtn",function(){
		doSearch();
	});
	
	//收藏
	$("body").on("click",".collectionBtn",function(){
		var ref = $(this).attr("ref");
		UI.util.showCommonWindow(ref, "收藏文件夹", 
				600, 450, function(obj){
		});
	});
	
	//卡片删除
	$("body").on("click",".deleteBtn",function(){
		params.ALARM_ID = $(this).attr("ALARM_ID");
		UI.util.confirm("是否确定删除？",function(){
			batchOperation('face/dispatchedAlarm/delete',params);
		});				
	});	
	//卡片删除(多个)
	$('.delAllBtn').click(function(){
		var nodeId = getCheckList();
		if(nodeId){
			params.ALARM_ID = nodeId;
			UI.util.confirm("是否确定删除？",function(){
				batchOperation('face/dispatchedAlarm/delete',params);
			});
		}else{
			UI.util.alert("请至少选择一条记录", 'warn');
		}
	});
	
	//卡片确认
	$("body").on("click",".checkBtn",function(){
		var index = $(this).attr('index');
		var list = UI.control.getDataById('faceIdentityList');
		var data = list.records[index];
		params.ALARM_ID = data.ALARM_ID;
		params.ALARM_IMG = data.ALARM_IMG;
		params.IDENTITY_ID = data.IDENTITY_ID;
		params.PERSON_NAME = data.PERSON_NAME;
		params.PERMANENT_ADDRESS = data.PERMANENT_ADDRESS;
		params.PRESENT_ADDRESS = data.PRESENT_ADDRESS;
		params.BIRTHDAY = data.BIRTHDAY;
		params.PERSON_SEX = data.PERSON_SEX;
		UI.util.confirm("是否确认？",function(){
			batchOperation('face/dispatchedAlarm/confirm',params);
		});				
	});
	/*
	//卡片确认(多个)
	$('.checkAllBtn').click(function(){
		var nodeId = getCheckList();
		if(nodeId){
			params.ALARM_ID = nodeId;
			UI.util.confirm("是否确定？",function(){
				batchOperation('face/dispatchedAlarm/confirm',params);
			});
		}else{
			UI.util.alert("请至少选择一条记录", 'warn');
		}
	});	
	*/
	//详情btn跳转告警详情页面
	$("body").on("click",".moreBtn",function(){
		var $this = $(this),
			ALARM_ID = $this.attr('ALARM_ID'),
			level = $this.attr('alarm-level'),
			objectId = $this.attr("objectid"),
			curTime = $this.attr("curtime");
		queryParams.ALARM_ID = ALARM_ID;
		UI.control.remoteCall('face/dispatchedAlarm/detail',queryParams, function(resp){
			if(resp.MESSAGE == "查询成功"){
				UI.util.showCommonWindow('/efacecloud/page/library/alarmDetails.html?OBJECT_ID='+objectId+'&curTime='+curTime+'&ALARM_ID='+ALARM_ID+'&level='+level, "报警详情信息",
						880, 553, function(obj){
				});
			}else{
				UI.util.alert("查询失败", 'error');
			}			
		});		
	});	
	

//	$('.zdyTimeBtn').click(doSearch);
//确认检索按钮统一
	$('#confirmSearch').click(doSearch);
};

function doSearch(){
	if (UI.util.validateForm($('#thresholdValidate'))) {
		UI.util.showLoadingPanel();
		queryParams.pageNo = 1;
		queryParams.KEYWORDS = $('.searchCon').val();
		queryParams.THRESHOLD = $('.searchSimilarCon').val();
		queryParams.DEVICE_IDS=$("#orgCode").val();
	    queryParams.BEGIN_TIME = $('#beginTime').val();
	    queryParams.END_TIME = $('#endTime').val();
		if(queryParams){
			UI.control.getControlById("faceIdentityList").reloadData(null,queryParams);
			UI.util.hideLoadingPanel();
		}
	}
}

//function doSearchByTime(dateTime){
//	//queryParams.BEGIN_TIME = dateTime.bT;
//	//queryParams.END_TIME = dateTime.eT;
//	doSearch();
//}

function doSearchByDb(dbIdList){
	queryParams.DB_ID = dbIdList.join(",");
}

function batchOperation(service,params){
	UI.control.remoteCall(service,params, function(resp){
		if(resp.CODE == 0){
			UI.util.alert(resp.MESSAGE, 'success');
			UI.control.getControlById("faceIdentityList").reloadData(null,queryParams);
		}else{
			UI.util.alert(resp.MESSAGE, 'error');
		}
	});
}

function getCheckList(){
	var checkList;
	$('.active.list-node-wrap').each(function(index){
		if(index == 0)checkList=$(this).attr('ALARM_ID');
		else{
			checkList += ',' + $(this).attr('ALARM_ID');
		}
	});
	return checkList;
}