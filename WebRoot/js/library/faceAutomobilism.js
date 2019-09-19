/**
 *  汽车驾驶人员
 *  @author: wenyujian
 *  @date: 2017.10.09
 * */
var $beginTime = $("#beginTime");
var $endTime = $("#endTime");
var $beginDay = $("#beginDay");
var $endDay = $("#endDay");
var $beginDayTime = $("#beginDayTime");
var $endDayTime = $("#endDayTime");


var timeOption = {
		'elem':$('#timeTagList'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'callback':getSearchTime
};

var SEARCH_MONTH = 3 //搜索页面限制范围（月：默认前3个月）

// 请求参数
var queryParams = {
	'beginTime': dateFormat(new Date(), 'yyyy-MM-dd 00:00:00'),
	'endTime': dateFormat(new Date(), 'yyyy-MM-dd 23:59:59'),
	'age': '',
	'cllx': '',
	'csys': '',
	'fileUrl': '',
	'hphm': '',
	'hpys': '',
	'kkbh': '',
	'pageNo': 1,
	'pageSize': 20,
	'ppdm': '',
	'sex': '',
	'zppdm': '',
	'threshold': '',
	'searchText': ''
}

$(function(){
	UI.control.init();
	initDateTimeControl(timeOption);
	initTime();
//	initAreaTree(addressOption);
	initFilterEvent();
	initEvent();
    topSpecialUploadPic();
	initFilterAgeGroup();
	initWaterMark();
    window.getAlgoList = slideFn('face/common/getFaceAlgoList');
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

	$("#exportBtn").click(function() {
		var exportParams = {};
		var url = UI.control.getRemoteCallUrl('exportData');
		var exportData = UI.control.getControlById('personCheckList').getListviewCheckData();
		if(exportData.length === 0) {
			UI.util.alert('请先选择导出数据', 'warn');
			return;
		}
		exportParams.EXPORT_DATA = JSON.stringify(exportData);
		bigDataToDownload(url, "exportFrame", exportParams);
	})

	//图片定位
    $("body").on("click", ".locationBtn", function () {
        var ref = $(this).attr("ref"),
            time = $(this).attr('attr-time'),
            addr = $(this).attr('attr-addr'),
            imgUrl = $(this).attr('fileUrl'),
            longitude = parseFloat($(this).attr('LONGITUDE')),
            latitude = parseFloat($(this).attr('LATITUDE'));
        if (longitude && longitude && longitude != 0 && longitude != 0) {
            var url = ref + '?time=' + time + '&addr=' + addr + '&imgUrl=' + imgUrl + '&longitude=' + longitude + '&latitude=' + latitude;
            UI.util.showCommonWindow(url, "定位",
                $(top.window).width() * .95, $(top.window).height() * .9, function (obj) {
                });
        } else {
            UI.util.alert("经纬度不合法！", "warn");
        }
	});
	
	//频次分析
    $("#freqAnalysisBtn").click(function () {
        var listData = UI.control.getDataById('dispatchedDreiverList');
        beginTime = $('#beginTime').val();
        endTime = $('#endTime').val();
        if (listData.count <= 0) {
            UI.util.alert("暂无数据，请重新查询！", "warn");
            return;
        }
        if (!beginTime || !endTime) {
            UI.util.alert("请先选择一个时间或时间段", "warn");
            return;
        }
        UI.util.showCommonWindow("/efacecloud/page/perception/freqAnalysis.html", "频次分析", 451, 300, function (data) {
            var params = {};
            params.DEVICE_IDS = $("#orgCode").val();
            params.BEGIN_TIME = beginTime;
            params.END_TIME = endTime;
            /*params.similarity=77;*/
            var freqNum = data.freqNum;
            var treeNodeId = $("#orgCode").val();
            var THRESHOLD = data.THRESHOLD;
            var FACESCORE = data.FACESCORE;
            params.FREQ_NUM = freqNum;
            var pageSize = $("[listview-counts]").text() || 10000;//resp.pageSize ||
            var orgName = $('#deviceNames').html();
            searchTime = searchTime || "today";

            UI.util.showLoadingPanel('', 'currentPage');
            var url = "face/capture/optimization/freqAnalysis";
            var queryParams = {/*similarity: 77,*/
                NUMS: freqNum,
                DEVICE_IDS: treeNodeId,
                DEVICE_GROUP: '',
                BEGIN_TIME: beginTime,
                END_TIME: endTime/*, sort: "JGSK"*/,
                THRESHOLD: THRESHOLD,
                FACE_SCORE: FACESCORE
            };

            UI.control.remoteCall(url, queryParams, function (resp) {
                var taskId = resp.TASK_ID;
                UI.util.showCommonIframe('.frame-form-full', '/efacecloud/page/perception/faceCaptureN2N_1.html?taskId=' + taskId + '&freqNum=' + freqNum +
                    '&searchTime=' + searchTime + '&beginTime=' + beginTime + '&endTime=' + endTime + '&treeNodeId=' + $("#orgCode").val() +
                    '&orgName=' + orgName + '&threshold=' + THRESHOLD + '&facescore=' + FACESCORE);
                UI.util.hideLoadingPanel('currentPage');
            }, function (data, status, e) {
                UI.util.hideLoadingPanel('currentPage');
            }, {
                    async: true
                });
        });
    });
	
	$(".time-sort .tag-item").click(function() {
		$(this).addClass("active").siblings().removeClass("active");
		//doSearch();
	})

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
		UI.util.showCommonWindow('/connectplus/page/device/deviceList.html?deviceType=193', '地点选择', 1000, 600,function(resp){
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
		UI.util.showCommonWindow('/connectplus/page/device/deviceMap.html?deviceType=193', '地点选择', 1000, 600,function(resp){
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
	
	//收藏
	$("body").on("click",".collectionBtn",function(){
		var ref = $(this).attr("ref");
		UI.util.showCommonWindow(ref, "收藏文件夹", 
				600, 450, function(obj){
		});
	});
	
	// 点击"确认检索" 按钮
	$('#confirmSearch').on('click', function(){
		doSearch();
	})
	
	//列表中的搜索链接
	$("body").on("click",".search-btn",function(){
		fileUrl = $(this).attr("fileUrl");
		$("#filterImg").attr("src",fileUrl);
        global.fileid = getFileid(fileUrl,true);
		//$(".library-info").addClass("result");
        if($(".arithmetic-tools.on").length==0){ //如果没有选中的算法，默认选择第一种；
            $(".arithmetic-tools:eq(0) i").trigger('click');
        }
		$("#filterImg").attr("hasImg","1"); //1:存在图片 0：不存在 
		$('.bottom-pic-bar').removeClass('hide');//阈值框出现
		//$('#exportPersonalBtn').addClass("hide");
		doSearch();
	});
	
	//阈值回车事件
	$('#threshold').keypress(function(e){
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});
	
	//点击数据上的车辆品牌
	$("body").on("click",".zppdm",function(){
		var zppdm = $(this).attr('zppdm');
		var ppdm = $(this).attr('ppdm');
		
		initCarDataByValue(ppdm, zppdm);
	    doSearch();
		
	});
	
	
	$(".carPlateInputBtn").click(function(){
		queryParams.ppdm = '';
		queryParams.zppdm = '';
	});
	
	$("body").on("click",".carType",function(){
		var carTypeValue = $(this).attr("cllx");
		$("#cllx").val(carTypeValue);
//		$(this).attr("selected",true);
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
	
	
	// 关键字搜索
	$("#searchText").keyup(function(event){
		if(event.keyCode == 13){
			queryParams.hphm=$("#searchText").val();
			doSearch();
		}
	});
	
	//点击数据上的车牌号码
	$("body").on("click",".vehicleNumber",function(){
		
		var vehicleNumber = $(this).attr("hphm");
		$("#searchText").val(vehicleNumber); 
		queryParams.hphm = vehicleNumber;
	    doSearch();
	});
	
	//搜索
	$("#searchBtn").click(function(){
		queryParams.hphm=$("#searchText").val();
	 	doSearch();
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
	    queryParams.beginTime = beginTime;  //开始时间
	    queryParams.endTime = endTime;   // 结束时间
	    queryParams.kkbh = $("#orgCode").val();      // 卡口编号
	    queryParams.csys = $("#csys li.active").attr("val")||"";  // 车身颜色
	    queryParams.hpys = $("#colorTags li.active").attr("val")||"";  // 车牌颜色
	    queryParams.cllx = $("#cllx").val();  //车辆类型
	    queryParams.sex = $("#SEX .tag-item.active").attr("val");  // 性别
		queryParams.ppdm = $('.ppdm').val()||'';  // 车辆品牌
		queryParams.zppdm = $('.zppdm').val()||'';  // 车辆子品牌
		queryParams.age = $('#age .active').attr('data');  // 年龄段
		queryParams.driver_role = $('#driver_role .active').attr('type');  // 乘坐位置
		queryParams.hphm = $('#searchText').val()||'';  // 车辆品牌
        queryParams.ALGO_LIST =  JSON.stringify( getAlgoList() );

		if($('#timeTagList .active').attr('time-control') == 'tp'){
			queryParams.beginTime = '';
			queryParams.endTime = '';
			queryParams.beginDay = $('#beginDay').attr('realvalue') || $('#beginDay').val();
			queryParams.endDay = $('#endDay').attr('realvalue') || $('#endDay').val();
			queryParams.beginDayTime = $('#beginDayTime').attr('realvalue') ? $('#beginDayTime').attr('realvalue').substring(0,5) : $('#beginDayTime').val();
			queryParams.endDayTime = $('#endDayTime').attr('realvalue')? $('#endDayTime').attr('realvalue').substring(0,5) :  $('#endDayTime').val();
		}else if($('#timeTagList .active').attr('time-control') == 'zdy'){
			queryParams.beginTime = $('#beginTime').attr('realvalue') || $('#beginTime').val();
			queryParams.endTime =$('#endTime').attr('realvalue') || $('#endTime').val();
			queryParams.beginDay = '';
			queryParams.endDay = '';
			queryParams.beginDayTime = '';
			queryParams.endDayTime = '';
		}
		
	    if($('#filterImg')[0].src.slice(-12)!="noPhoto2.png"){
	      // queryParams.fileUrl = $('#filterImg')[0].src;
	      queryParams.threshold= $('#threshold').val();
	      queryParams.FILE_ID = global.fileid;
	      if(datedifference(beginTime,endTime) >30){
          	UI.util.alert("时间查询不能超过30天", "warn");
          	return ;
          }
	      UI.control.getControlById("dispatchedDreiverList").reloadData(null,queryParams);
	    }
	    else{
	      // queryParams.fileUrl="";
	      queryParams.threshold="";
		  queryParams.FILE_ID = "";
		  UI.control.getControlById("dispatchedDreiverList").reloadData(null,queryParams);
	    }
	    
	}
}

//初始化时间段时间
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

//两个时间相差天数 兼容firefox chrome
function datedifference(sDate1, sDate2) {    //sDate1和sDate2是2006-12-18格式  
    var dateSpan,
        tempDate,
        iDays;
    sDate1 = Date.parse(sDate1);
    sDate2 = Date.parse(sDate2);
    dateSpan = sDate2 - sDate1;
    dateSpan = Math.abs(dateSpan);
    iDays = Math.ceil(dateSpan / (24 * 3600 * 1000));
    return iDays
};
