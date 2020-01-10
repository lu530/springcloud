/**
 *  非汽车驾驶人员库
 *  @author: wenyujian
 *  @date: 2017.10.09
 * */

var $beginTime = $("#beginTime");
var $endTime = $("#endTime");
var $beginDay = $("#beginDay");
var $endDay = $("#endDay");
var $beginDayTime = $("#beginDayTime");
var $endDayTime = $("#endDayTime");

var SEARCH_MONTH = 3 //搜索页面限制范围（月：默认前3个月）

var timeOption = {
		'elem':$('#timeTagList'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'callback':getSearchTime
};
var queryParams  = {
	'pageNo': 1,
	'pageSize': 20,
	'beginTime': dateFormat(new Date(), 'yyyy-MM-dd 00:00:00'),
	'endTime': dateFormat(new Date(), 'yyyy-MM-dd 23:59:59'),
	'age': '',
	'beginTime': dateFormat(new Date(), 'yyyy-MM-dd 00:00:00'),
	'endTime': dateFormat(new Date(), 'yyyy-MM-dd 23:59:59'),
	'cllx': '',
	'csys': '',
	'fileUrl': '',
	'hasHelmet': '',
	'kkbh': '',
	'lampType': '',
	'sex': '',
	'threshold': ''
}

$(function(){
	UI.control.init();
	initDateTimeControl(timeOption);  //初始化自定义时间
	initTime();   // 初始化时间段
//	initAreaTree(addressOption);
	initFilterEvent();
	getDeviceModule();  //定义在common中
	initEvent();
	topUploadPic();
	initFilterAgeGroup();
})

function initEvent() {

    //轨迹分析
    $("body").on("click",".trajectory-search",function(){
    	var url = $(this).attr("url");
    	var time = {
            	bT: queryParams.beginTime,
            	eT: queryParams.endTime
            }
    		openWindowPopup('track',url, time);
    });
    //身份核查
    $("body").on("click",".verification-search",function(){
        openWindowPopup('identity',$(this).attr("url"));
    });

	$(".tagslist .tag-item").click(function(){
		$(this).addClass("active").siblings().removeClass("active");
	});
	$(".tagslist .tags-list-item").click(function(){
		$(this).addClass("active").siblings().removeClass("active");
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
		
		UI.util.showCommonWindow(deviceModule + '/page/device/deviceList.html?deviceType=193', '地点选择', 1000, 600,function(resp){
			$('#deviceNames').html(resp.deviceName);
			$('#deviceNames').attr('title',resp.deviceName);
			$('#deviceNames').attr('orgcode',resp.orgCode);
			$('#orgCode').val(resp.deviceId);
			$('#orgCodeInt').val(resp.deviceIdInt);
			
			addDrowdownDeviceList({
				deviceId:resp.deviceId,
				deviceName:resp.deviceName,
				deviceNameList:$("#deviceNameList"),
				dropdownListText:$(".dropdown-list-text")
			});
		});
		e.stopPropagation();
	});
	
	//点击进入卡口选择地图
	$('#locate').click(function(){
		UI.util.showCommonWindow(deviceModule + '/page/device/deviceMap.html?deviceType=193', '地点选择', 1000, 600,function(resp){
			$('#deviceNames').html(resp.deviceName);
			$('#deviceNames').attr('title',resp.deviceName);
			$('#deviceNames').attr('orgcode',resp.orgCode);
			$('#orgCode').val(resp.deviceId);
			$('#orgCodeInt').val(resp.deviceIdInt);
			
			addDrowdownDeviceList({
				deviceId:resp.deviceId,
				deviceName:resp.deviceName,
				deviceNameList:$("#deviceNameList"),
				dropdownListText:$(".dropdown-list-text")
			});
		});
	})
	
	

	//收藏
	$("body").on("click",".collectionBtn",function(){
		var ref = $(this).attr("ref");
		UI.util.showCommonWindow(ref, "收藏文件夹", 
				600, 450, function(obj){
		});
	});
	
	//列表中的搜索链接
	$("body").on("click",".search-btn",function(){
		fileUrl = $(this).attr("fileUrl");
		isUpload = UPLOAD_RETRIEW_FALSE;
		$("#filterImg").attr("src",fileUrl);
		//$(".library-info").addClass("result");
        if($(".arithmetic-tools.on").length==0){ //如果没有选中的算法，默认选择第一种；
            $(".arithmetic-tools:eq(0) i").trigger('click');
        }
		$("#filterImg").attr("hasImg","1"); //1:存在图片 0：不存在 
		$('.bottom-pic-bar').removeClass('hide');//阈值框出现
		//$('#exportPersonalBtn').addClass("hide");
		doSearch();
	});
	
	// 点击"确认检索" 按钮
	$('#confirmSearch').on('click', function(){
		doSearch();
	});
	
	//阈值回车事件
	$('#threshold').keypress(function(e){
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});
	
	// 控制 "时间段" 和 "自定义" 时间选择的切换
	$('#tp').on('click',function(){
		$('#zdyControl').addClass('hide');
		$('#tpControl').removeClass('hide');
		var date = new Date();
		date.add("day",-7);
		$('#beginDay').val(dateFormat(date, 'yyyy-MM-dd'));
	});
	$('#zdy').on('click',function(){
		$('#zdyControl').removeClass('hide');
		$('#tpControl').addClass('hide')
	})
	
	$("body").on("click",".carType",function(){
		var carTypeValue = $(this).attr("cllx");
		/*$("#cllx").val(carTypeValue);*/
//		$(this).attr("selected",true);
		// 将车辆类型的筛选条件高亮显示
		var tagsList = $('#vehicleTagsList .tags-list-item');
		for(var i=0;i <tagsList.length; i++){
			if(tagsList.eq(i).attr('val') == carTypeValue){
				tagsList.eq(i).siblings().removeClass("active");
				tagsList.eq(i).addClass('active')
			}
		}
		doSearch();
	});
	
	//删除已选设备
	$("body").on("click",".removeDeviceBtn",function(e){
		var $this = $(this);
		var deviceId = $this.attr("deviceid");
		var deviceIdArr = $('#orgCode').val().split(",");
		var deviceIdIntArr = $('#orgCodeInt').val().split(",");
		var deviceNameArr = $('#deviceNames').html().split(",");
		var index = deviceIdArr.indexOf(deviceId),
			orgCode = $("#deviceNames").attr("orgcode"),
			orgCodeArr = orgCode.split(",");
		
		$this.parents("li").remove();
		deviceIdArr.splice(index,1);
		deviceIdIntArr.splice(index,1);
		deviceNameArr.splice(index,1);
		orgCodeArr.splice(index,1);
		$('#orgCode').val(deviceIdArr.join(","));
		$('#orgCodeInt').val(deviceIdIntArr.join(","));
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
}

function getSearchTime(dateTime){
	if($('#timeTagList .active').attr('time-control') != 'tp'){
		beginTime = dateTime.bT;
		endTime = dateTime.eT;
		queryParams.beginTime = beginTime;
		queryParams.endTime = endTime;
		queryParams.beginDay = '';
		queryParams.endDay = '';
		queryParams.beginDayTime = '';
		queryParams.endDayTime = '';
		
		$('#tpControl').addClass('hide');
	}else{
		queryParams.beginTime = '';
		queryParams.endTime = '';
		queryParams.beginDay = $('#beginDay').attr('realvalue') || $('#beginDay').val();
		queryParams.endDay = $('#endDay').attr('realvalue') || $('#endDay').val();
		queryParams.beginDayTime = $('#beginDayTime').attr('realvalue') ? $('#beginDayTime').attr('realvalue').substring(0,5) : $('#beginDayTime').val();
		queryParams.endDayTime = $('#endDayTime').attr('realvalue') ? $('#endDayTime').attr('realvalue').substring(0,5) : $('#endDayTime').val();
	}
}

function doSearch(){
	if (UI.util.validateForm($('#thresholdValidate'))) {
		queryParams.isAsync = true;
		queryParams.pageNo = 1;
		beginTime = $('#beginTime').val();
		endTime	= $('#endTime').val();
		queryParams.kkbh = $("#orgCode").val();      // 卡口编号
		queryParams.sex = $("#SEX .tag-item.active").attr("val");  // 性别
		queryParams.age = $('#age .active').attr('data');  // 年龄段
		queryParams.hasHelmet = $('#helmet .active').attr("val");  //是否戴头盔
		queryParams.cllx = $("#vehicleTagsList li.active").attr('val');  //车辆类型
		queryParams.lampType = $("#lightTagsList li.active").attr('val');  // 车灯类型

		if($('#timeTagList .active').attr('time-control') == 'tp'){
			queryParams.beginTime = '';
			queryParams.endTime = '';
			queryParams.beginDay = $('#beginDay').attr('realvalue') || $('#beginDay').val();
			queryParams.endDay = $('#endDay').attr('realvalue') || $('#endDay').val();
			queryParams.beginDayTime = $('#beginDayTime').attr('realvalue') ? $('#beginDayTime').attr('realvalue').substring(0,5) : $('#beginDayTime').val();
			queryParams.endDayTime = $('#endDayTime').attr('realvalue') ? $('#endDayTime').attr('realvalue').substring(0,5) : $('#endDayTime').val();
		}else if($('#timeTagList .active').attr('time-control') == 'zdy'){
			queryParams.beginTime = $('#beginTime').attr('realvalue') || $('#beginTime').val();
			queryParams.endTime =$('#endTime').attr('realvalue') || $('#endTime').val();
			queryParams.beginDay = '';
			queryParams.endDay = '';
			queryParams.beginDayTime = '';
			queryParams.endDayTime = '';
		}
		
	    if($('#filterImg')[0].src.slice(-12)!="noPhoto2.png"){
	      queryParams.fileUrl = $('#filterImg')[0].src;
	      queryParams.threshold= $('#threshold').val();
	    }
	    else{
	      queryParams.fileUrl="";
	      queryParams.threshold= '';
	    }
	    UI.control.getControlById("dispatchedNonmotorList").reloadData(null,queryParams);
	}
}

// 初始化时间段时间
function initTime(){
	var date = new Date();

	var begin = dateFormat(date, 'yyyy-MM-dd 00:00:00');
	var end = dateFormat(date, 'yyyy-MM-dd 23:59:59');
	
	$beginDay.val(dateFormat(date, 'yyyy-MM-dd'));
	$endDay.val(dateFormat(date, 'yyyy-MM-dd'));
	$beginDayTime.val('00:00');
	$endDayTime.val('23:59');
	
 	date.add("month",-SEARCH_MONTH);
	var minBegin = dateFormat(date, 'yyyy-MM-dd 00:00:00');  
	var minBeginDay = dateFormat(date, 'yyyy-MM-dd');

	$beginDay.focus(function(){
		WdatePicker({
			startDate:'%y-#{%M}-%d',
			dateFmt:'yyyy-MM-dd',
			minDate: minBeginDay,
			maxDate:'#F{$dp.$D(\'endDay\')}'
		});
	});
	$endDay.focus(function(){
		WdatePicker({
			startDate:'%y-#{%M}-%d',
			dateFmt:'yyyy-MM-dd',
			minDate:'#F{$dp.$D(\'beginDay\')}',
			maxDate: '%y-%M-%d'
		});
	});
	
	$beginDayTime.focus(function(){
		WdatePicker({
			startDate:'%H:%m',
			dateFmt:'HH:mm',
			maxDate:'#F{$dp.$D(\'endDayTime\')}'	
		});
	});
	$endDayTime.focus(function(){
		WdatePicker({
			startDate:'%H:%m',
			dateFmt:'HH:mm',
			minDate:'#F{$dp.$D(\'beginDayTime\')}'
		});
	});
}
