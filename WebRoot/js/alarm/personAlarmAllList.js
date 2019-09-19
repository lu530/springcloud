/**
 * @Author fenghuixia
 * @version 2018-02-11
 * @description 告警记录查询;
 */

var titleType = UI.util.getUrlParam("titleType") || 'false';
var queryParams = {};
var today = UI.util.getDateTime("today", "yyyy-MM-dd");
var todayTime = UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss");
var dateDesc = today;
$('#beginTime').val(todayTime.bT);
$('#endTime').val(todayTime.eT);
var isHistory = UI.util.getUrlParam("isHistory") || '0';
/*************************人员告警列表start*************************************/

var timeOption = {
	'elem': $('#timeTagList'),
	'beginTime': $('#beginTime'),
	'endTime': $('#endTime'),
	'callback':doSearchList
};
//告警列表
var queryParamsList = { //初始化告警列表请求参数
	KEYWORDS: '',
	BEGIN_TIME: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").bT,
	END_TIME: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").eT,
	DEVICE_IDS: $("#orgCode_1").val(),
	THRESHOLD: '',
	SORT:0,
	isHistory: isHistory,
	IS_ESCAPE_HIT: '',
	ALARM_TYPE: '',
	DB_ID: '',
	isAsync: true,
	unload:true
};

var addressOption = { //初始化布控库
		'elem': ['domicile'], //地址HTML容器
		'addressId': ['registerDbList'], //初始化布控库内容
		'service': 'face/dispatchedAlarm/dbList', //请求服务
		'tmpl': 'childNodeListTemplate', //初始化模板
		'callback': doSearchByDb //回调函数
	};
/*************************人员告警列表end*************************************/

$(function() {
	UI.control.init();
	compatibleIndexOf();
	initEvent();
	initData();
	initDateTimeControl(timeOption);
	//initDbTree(addressOption);
	doSearchList();
});

//布控库查询
function doSearchByDb(dbIdList) {
	queryParamsList.DB_ID = dbIdList.join(",");
	doSearchList();
}
function initData() {
	if(titleType == 'hide') {
		$('.page-title').addClass('hide');
		$('.freq-view').removeClass('title-sib');
	}
	queryParams = queryParamsList;
}

function initEvent() {
	// 是否飞识比中
	$('#zfFilter .tagItem').on('click', function(){
		var val = $(this).attr('value');
		$(this).addClass('active').siblings().removeClass('active');
		if(val == ''){
			queryParamsList.ALARM_TYPE = val;
		}else{
			queryParamsList.ALARM_TYPE = parseInt(val);
		}
		doSearchList();
	});
	// 与全国在逃人员库比中
	$('#ztFilter .tagItem').on('click', function(){
		var val = $(this).attr('value');
		$(this).addClass('active').siblings().removeClass('active');
		if(val == ''){
			queryParamsList.IS_ESCAPE_HIT = val;
		}else{
			queryParamsList.IS_ESCAPE_HIT = parseInt(val);
		}
		doSearchList();
	});
	
	
	// 打开卡片重复的页面
	$('body').on('click', '.openRepeat', function(){
		// 当前检索时间
		var timeControl = 'jt';
		$('#timeTagList .tagsTime').each(function(index,item){
			if($(this).hasClass('active')){
				timeControl = $(this).attr('time-control');
			}
		})
		var OBJECT_ID = $(this).attr('OBJECT_ID');
		var bT = queryParams.BEGIN_TIME;
		var eT = queryParams.END_TIME;
		var THRESHOLD = queryParams.THRESHOLD;
		var DEVICE_IDS = queryParams.DEVICE_IDS;
		var KEYWORDS = queryParams.KEYWORDS;
		var SORT = queryParams.SORT;
		var IS_ESCAPE_HIT = queryParams.IS_ESCAPE_HIT;
		var ALARM_TYPE = queryParams.ALARM_TYPE;
		var url = '/efacecloud/page/alarm/alarmAllCardList.html?OBJECT_ID='+OBJECT_ID+'&BEGIN_TIME='+bT+'&END_TIME='+eT+'&timeControl='+timeControl+'&THRESHOLD='+THRESHOLD+'&DEVICE_IDS='+DEVICE_IDS+'&KEYWORDS='+KEYWORDS+'&SORT='+SORT+'&IS_ESCAPE_HIT='+IS_ESCAPE_HIT+'&ALARM_TYPE='+ALARM_TYPE;
		UI.util.showCommonIframe('.frame-form-full', url);
	});
	//返回
	$('#backBtn').click(function() {
		parent.UI.util.hideCommonIframe('.frame-form-full');
	})
	
	//删除已选设备
	$("body").on("click", ".removeDeviceBtn", function(e) {
		var $this = $(this);
		var i = $this.parents("ul").attr("index");
		var deviceId = $this.attr("deviceid");
		var deviceIdArr = $('#orgCode_' + i).val().split(",");
		var deviceNameArr = $('#deviceNames_' + i).html().split(",");
		var index = deviceIdArr.indexOf(deviceId),
			orgCode = $('#deviceNames_' + i).attr("orgcode"),
			orgCodeArr = orgCode.split(",");

		$this.parents("li").remove();
		deviceIdArr.splice(index, 1);
		deviceNameArr.splice(index, 1);
		orgCodeArr.splice(index,1);
		$('#orgCode_' + i).val(deviceIdArr.join(","));
		$('#deviceNames_' + i).html(deviceNameArr.join(","));
		$('#deviceNames_' + i).attr("title", deviceNameArr.join(","));
		$('#deviceNames_' + i).attr("orgcode",orgCodeArr.join(","));
		if($("#deviceNameList_" + i + " li").length == 0) {
			$("#deviceNames_" + i).parent().attr("data-toggle", "");
			$("#deviceNames_" + i).parent().find(".dropdown").addClass("hide");
			$("#deviceNames_" + i).parent().parent().removeClass("open");
		}
		
		doSearchList();

		e.stopPropagation();
	});
	
	//处置状态
	$("#alarmHandle .tagItem").click(function(){
		var $this = $(this);
		var val = $this.attr('value');
		$this.addClass('active').siblings().removeClass('active');
		queryParamsList.ALARM_HANDLE = val;
		doSearchList();
	});
	
	
	//是否已抓捕
	$("#captureFilter .tagItem").click(function(){
		var $this = $(this);
		var val = $this.attr('value');
		$this.addClass('active').siblings().removeClass('active');
		queryParams.IS_CATCH = val;
		doSearchList();
	});

	//告警等级
	$("#colorTags li").click(function(){
		var $this = $(this);
		var curVal = $this.parent().attr("curval");
		if(curVal){
			var valArr = curVal.split(",");
		}else{
			var valArr = [];
		}
		if($this.hasClass("tag-item")){
			$this.addClass('active').siblings().removeClass('active');
			valArr = [];
		}else{
			$this.parent().find(".tag-item").removeClass("active");
			var val = $this.attr("val");
			if($this.hasClass("active")){
				$this.removeClass("active");
				var index = valArr.indexOf(val);
				if(index >=0){
					valArr.splice(index,1);
				}
			}else{
				$this.addClass("active");
				valArr.push(val);
			}
		}
		queryParamsList.ALARM_LEVEL = valArr.join(",");
		$this.parent().attr("curval",valArr.join(","));
		doSearchList();
	});
	
	/*************************人员告警列表start*************************************/
	
	//时间相似度排序
	$("#sortList li").click(function() {
		var $this = $(this),
			type = $this.attr("type");
		
		if(type == 'timeSort'){
			var $filterIcon = $this.find(".filter-icon");
			if($filterIcon.hasClass("icon-arrow-up4")){
				$filterIcon.addClass("icon-arrow-down5").removeClass("icon-arrow-up4");
			}else{
				$filterIcon.addClass("icon-arrow-up4").removeClass("icon-arrow-down5");
			}
		}
		
		$this.addClass("active").siblings().removeClass("active");
	});
	
	//频次分析
	$("#freqAnalysisBtn").click(function(){
		var listData = UI.control.getDataById('tabList'),
			checkData = UI.control.getControlById('tabList').getListviewCheckData();
		if(listData.count <=0 ){
			UI.util.alert("暂无数据，请重新查询！", "warn");
			return;
		}
		if(checkData.length == 0){
			UI.util.alert("请勾选一个数据！", "warn");
			return;
		}
		if(checkData.length >1){
			UI.util.alert("只能勾选一个数据！", "warn");
			return;
		}
		UI.util.showCommonWindow("/efacecloud/page/alarm/freqAnalysis.html", "频次分析", 550, 400,function(data){
			var beginTime = data.beginTime,
				endTime = data.endTime,
				threshold = data.threshold,
				objectId = $(".list-node-wrap.active").attr("obj_id");
			UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/alarm/alarmAnalysisList.html?BEGIN_TIME='+beginTime + '&END_TIME='+endTime+
					'&THRESHOLD='+ threshold + '&OBJECT_ID='+objectId);
		});
	});
	
	//轨迹分析
	$("body").on("click", ".trajectory-search", function() {
		var time = {
	        	bT: queryParams.BEGIN_TIME,
	        	eT: queryParams.END_TIME
	        };
		openWindowPopup('track', $(this).attr("url"),time);
	});
	
	//身份核查
	$("body").on("click", ".verification-search", function() {
		// openWindowPopup('identity', $(this).attr("url"));
		var $this = $(this);
		var faceID = $this.attr('face-id'),
		 	deviceID = $this.attr('device-id'),
		 	captureTime = $this.attr('capture-time'),
		 	identityId = $this.attr('identity-id'),
		 	algoList = '[{-ALGO_TYPE-:-' + $this.attr('algo-id') + '-,-THRESHOLD-:-60-}]',
			imgUrl = $this.attr('url');
		var title = '身份核查',
			src = matcher('/efacecloud/page/technicalStation/verification.html/' + top.projectID).url,
			query = '?imgUrl=' + imgUrl + '&faceID=' + faceID + '&deviceID=' + deviceID + '&captureTime=' + captureTime + '&identityId=' + identityId + '&algoList=' + algoList

		if(UI.control.hasPermission('EFACE_faceVerificationArchive')){
			src =  '/efacestore/page/library/personnelFileMagList.html';
			query = '?imgUrL=' + imgUrl;
		}
		
		var params = { 
			src: src + query,
			title: title,
			width: $(top.window).width()*.95,
			height: $(top.window).height()*.9,
			callback: function(obj){

			}
        };
		UI.util.openCommonWindow(params);
	});
	
	//通过卡口树加载设备--告警列表页面
	$('#deviceNames_1').click(function(e) {
		//回填数据
		checkDrowDownDeviceList({
			deviceNames:$('#deviceNames_1').html(),
			deviceId:$('#orgCode_1').val(),
			deviceIdInt:$('#orgCodeInt').val(),
			orgCode:$("#deviceNames_1").attr("orgcode")
		});
		UI.util.showCommonWindow('/connectplus/page/device/deviceList.html?deviceType=194', '感知设备', 1000, 600, function(resp) {
			$('#deviceNames_1').html(resp.deviceName);
			$('#deviceNames_1').attr('title', resp.deviceName);
			$('#deviceNames_1').attr('orgcode',resp.orgCode);
			$('#orgCode_1').val(resp.deviceId);
			addDrowdownDeviceList({
				deviceId: resp.deviceId,
				deviceName: resp.deviceName,
				deviceNameList: $("#deviceNameList_1"),
				dropdownListText: $("#deviceNameList_1").parent().prev()
			});
			
			doSearchList();
		});
		e.stopPropagation();
	});
	
	//点击进入卡口选择地图--告警列表页面
	$('#locate_1').click(function() {
		UI.util.showCommonWindow('/connectplus/page/device/deviceMap.html?deviceType=194', '感知设备', 1000, 600, function(resp) {
			$('#deviceNames_1').html(resp.deviceName);
			$('#deviceNames_1').attr('title', resp.deviceName);
			$('#deviceNames_1').attr('orgcode',resp.orgCode);
			$('#orgCode_1').val(resp.deviceId);

			addDrowdownDeviceList({
				deviceId: resp.deviceId,
				deviceName: resp.deviceName,
				deviceNameList: $("#deviceNameList_1"),
				dropdownListText: $("#deviceNameList_1").parent().prev()
			});
			
			doSearchList();
		});
	});
	
	//搜索姓名，身份证查询条点击事件
	$('.searchBarBtn').click(doSearchList);
	//搜索姓名，身份证查询条回车事件
	$('.searchCon').keypress(function(e) {
		if(((e.keyCode || e.which) == 13)) {
			doSearchList();
		}
	});
	
	//刷新按钮
	$("body").on("click", "#freshBtn", function() {
		doSearchList();
	});
	
	//搜索相似度回车事件
	$('.searchSimilarCon').keypress(function(e) {
		if(((e.keyCode || e.which) == 13)) {
			var value = $('.searchSimilarCon').val()
			if(value || value != "") {
				queryParams.THRESHOLD = parseInt(value);
			}else{
				queryParams.THRESHOLD = value;
			}
			doSearchList();
		}
	});
	
	//时间相似度排序
	$("#sortList .tag-item").click(function() {
		var $this = $(this),
			type = $this.attr("type");
		
		if(type == 'timeSort'){
			queryParams.SORT = 0;
		}else{
			queryParams.SORT = 1;
		}
		
		$this.addClass("active").siblings().removeClass("active");
		doSearchList();
	});
	
	//点击搜索事件
	$('body').on('click', '.searchBtn', function() {
		var imgurl = $(this).attr('fileUrl');
		var curSrc = matcher('/efacecloud/page/library/faceCaptureList.html/' + top.projectID).url;
		curSrc += "?imgSrc=" + imgurl + "&pageType=record";
		UI.util.showCommonWindow(curSrc, "路人检索", 1250, 650, function() {});
	});
	
	//点击详情事件
	$('body').on('click', '.detailBtn', function() {
		var $this = $(this),
			ALARM_ID = $this.attr('ALARM_ID'),
			level = $this.attr("alarm-level"),
			OBJECT_ID = $this.attr("objid"),
			isfs = $this.attr("isfs"),
			alarmTime = $this.attr("alarmtime"),
			curTime = $this.attr("curtime");
		
		if(isfs == '1'){
			var name = $this.attr("name"),
			idCard = $this.attr("idcard"),
			time = $this.attr("time");
			
			UI.util.showCommonWindow('/efacecloud/page/library/alarmDetails.html?OBJECT_ID='+OBJECT_ID+'&curTime='+curTime+'&isFly=1&ALARM_ID=' + ALARM_ID + '&level=' + level
					+ '&name=' + name+ '&idCard=' + idCard+ '&time=' + time +'&alarmTime='+alarmTime, "告警详情",
				1080, 640,
				function(obj) {});
		}else{
			UI.util.showCommonWindow('/efacecloud/page/library/alarmDetails.html?OBJECT_ID='+OBJECT_ID+'&curTime='+curTime+'&ALARM_ID=' + ALARM_ID + '&level=' + level +'&alarmTime='+alarmTime, "告警详情",
					880, 553,
					function(obj) {});
		}
	});
	
	//导出
	$('#export').click(function() {
		var exportParams = {};
		var url = UI.control.getRemoteCallUrl("face/dispatchedAlarm/grouping/exportAlarm");
		var exportData = UI.control.getControlById('tabList').getListviewCheckData();
		if(exportData.length > 0) {
			exportParams.EXPORT_DATA = JSON.stringify(exportData);
			bigDataToDownload(url, "exportFrame", exportParams);
		} else {
			UI.util.alert('请选择导出数据', 'warn');
		}
	});
	
	//更多历史告警
	$('#toHisBtn').click(function() {
		window.open('/efacecloud/page/alarm/personAlarmHistoryList.html?isHistory=1');
	});
	/*************************人员告警列表end*************************************/
}

//人员告警列表查询
var personListTimer = null;
function doSearchList() {
	if(UI.util.validateForm($('#thresholdValidate'))) {
		queryParams.THRESHOLD = $('.searchSimilarCon').val();
		queryParams.pageNo = 1;
		queryParams.KEYWORDS = $('.searchCon').val();
		queryParams.DEVICE_IDS = $("#orgCode_1").val();
		queryParams.BEGIN_TIME = $('#beginTime').val();
		queryParams.END_TIME = $('#endTime').val();
		queryParams.isHistory = isHistory;
		if(queryParams) {
			UI.control.getControlById("tabList").reloadData(null, queryParams);
			if(personListTimer){
				clearInterval(personListTimer);
			}
			personListTimer = setInterval(function(){
				$("#alarmTotal").html(UI.control.getDataById('tabList').TOTAL);
			},500)
		}
	}

}

function renderTagColor(text){
	var tagClass = '';
	switch(text){
	case '已签收':
		tagClass = 'sign-color';
		break;
	case '已反馈':
		tagClass = 'feedback-color';
		break;
	case '已下发':
		tagClass = 'issued-color';
		break;
	}
	return tagClass;
}