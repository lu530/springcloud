/**
 * @Author lyy
 * @version 2017-08-11
 * @description 告警记录查询;
 */
var titleType = UI.util.getUrlParam("titleType") || 'false';
var queryDate = UI.util.getUrlParam("queryDate") || '';
var queryParams = {};
var allqueryParams = {};
var currentRef = '';
var beforeRef = '';
var today = UI.util.getDateTime("today", "yyyy-MM-dd");
var todayTime = UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss");
var dateDesc = today;
var algoID = '';
var confirmStatus = UI.util.getUrlParam("confirmStatus") || '';
var isBlack =  (top.projectID == "foreigners");
var childrenFrameData = {
	pic: '',
	personName: '',
	personTagCode: '',
	personTagName: '',
	birthday: '',
	sex: '',
	identityId: '',
	presentAddress: ''
}
//父页面调用按设备查询，回填
var device_s = UI.util.getUrlParam("DEVICE_S") || '';
// var deviceNameStr = UI.util.getUrlParam("DEVICE_NAME") || '';
// var orgCodeStr = UI.util.getUrlParam("ORG_CODE") || '';

// var deviceIdStr = UI.util.getUrlParam("DEVICE_ID") || '';
// var deviceIdIntStr = UI.util.getUrlParam("DEVICE_IDINT") || '';
var deviceIdStr = top.deviceIdsStr;
var deviceNameStr = top.deviceNameStr;
var orgCodeStr = top.orgCodes;
var deviceIdIntStr = top.deviceIdInts;
var selTime = UI.util.getUrlParam("selTime") || '0';

$('#flyBeginTime').val(todayTime.bT);
$('#flyEndTime').val(todayTime.eT);

var isHistory = UI.util.getUrlParam("isHistory") || '0';
var SCENE_ID = UI.util.getUrlParam("SCENE_ID") || '';  //场景类型
var DEVICE_IDSTR = UI.util.getUrlParam("DEVICE_ID") || '';
if (DEVICE_IDSTR.length > 0) {
	$("#orgCode_1").val(DEVICE_IDSTR);
	//	var testVal = $("#orgCode_1").val();
	//	console.log(testVal);
}

/*************************飞识告警列表start*************************************/
var flyTimeOption = {
	'elem': $('#flyTimeList'),
	'beginTime': $('#flyBeginTime'),
	'endTime': $('#flyEndTime'),
	'callback': doSearchFlyList
};
//告警列表
var flyParams = {
	KEYWORDS: '',
	BEGIN_TIME: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").bT,
	END_TIME: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").eT,
	DEVICE_IDS: $("#orgCode_3").val(),
	pageNo: 1,
	AlGORITHM_ID: 90002,
	DB_ID: '',
	SORT: 0,
	IS_ESCAPE_HIT: '',
	THRESHOLD: '',
	ALARM_LEVEL: '',
	ALARM_HANDLE: '',
	IS_CATCH: '',
	isAsync: true
};

/*************************飞识告警列表end*************************************/
/*************************告警统计start*************************************/
var addressOption = { //初始化布控库
	'elem': ['flyLibrary'], //地址HTML容器
	'addressId': ['registerDbList', 'flyDbList'], //初始化布控库内容
	'service': 'face/dispatchedAlarm/dbList', //请求服务
	'tmpl': 'childNodeListTemplate', //初始化模板
	'callback': doSearchByDb //回调函数
};


//告警统计
var queryParamsChart = {
	'BEGIN_TIME': UI.util.getDateTime("nearWeek", 'yyyy-MM-dd HH:mm:ss').bT,
	'END_TIME': UI.util.getDateTime("nearWeek", 'yyyy-MM-dd HH:mm:ss').eT,
	// 'DB_IDS': '',
	// 'DEVICE_IDS': $("#orgCode_2").val(),
	// 'STATISTIC_TYPE': "1",
	// "ALARM_TYPE": ''
};

var timeOptionDraw = {
	'elem': $('#timeTagDraw'),
	'beginTime': $('#beginTimeDraw'),
	'bT': UI.util.getDateTime("nearWeek", 'yyyy-MM-dd HH:mm:ss').bT,
	'endTime': $('#endTimeDraw'),
	'eT': UI.util.getDateTime("nearWeek", 'yyyy-MM-dd HH:mm:ss').eT,
	'format': 'yyyy-MM-dd  HH:mm:ss',
	'bTmaxDate': '%y-%M-#{%d-6} 23:59:59',
	'onBtPicked': function () {
		var sevenDay = stringToDate($('#beginTimeDraw').val());
		sevenDay = formatTime(new Date(sevenDay.setDate(sevenDay.getDate() + 6)));
		$('#endTimeDraw').val(sevenDay);
	},
	'callback': function (dateTime) {
		// var date = new Date();
		// if($('#timeTagDraw [time-control="nW"]').hasClass('active')){
		// 	dateTime.desc = [];
		// 	for(var i=6; i>=0;i--){
		// 		dateTime.desc.push(getDay(-i)+'号')
		// 	}
		// }else if($('#timeTagDraw [time-control="nM"]').hasClass('active')){
		// 	dateTime.desc = [];
		// 	for(var i=29; i>=0;i--){
		// 		dateTime.desc.push(getDay(-i)+'号');
		// 	}
		// }
		// dateDesc = dateTime;
		doSearchChart();
	}
};

/*************************告警统计end*************************************/

/*************************所有告警start*************************************/

var addressAllOption = { //初始化所有告警列表布控库
	'elem': ['domicileAll'], //地址HTML容器
	'addressId': ['registerDbListAll'], //初始化布控库内容
	'service': 'face/dispatchedAlarm/dbList', //请求服务
	'tmpl': 'childNodeListTemplateAll', //初始化模板
	'callback': doAllSearchByDb //回调函数
};


var queryParamsList = { //初始化所有告警列表请求参数
	SCENE_ID: SCENE_ID,
	// SCENE_ID: "",
	KEYWORDS: '',
	BEGIN_TIME: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").bT,
	END_TIME: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").eT,
	DEVICE_IDS: $("#orgCode_1").val(),
	THRESHOLD: '',
	SORT: 0,
	isHistory: isHistory,
	IS_ESCAPE_HIT: '',
	ALARM_TYPE: '',
	DB_ID: '',
	ALARM_LEVEL: '',
	ALARM_HANDLE: '',
	IS_CATCH: '',
	isAsync: true
};

var timeOption = {//所有告警列表时间控件
	'elem': $('#timeTagList'),
	'beginTime': $('#beginTime'),
	'endTime': $('#endTime'),
	'callback': doSearchList
};
if (confirmStatus == 3) {
	$('.confirmzdy').addClass('active').siblings().removeClass('active');
	queryParamsList.CONFIRM_STATUS = 3;
}
if (selTime == 1) {
	queryParamsList.BEGIN_TIME = selTime == 1 ? UI.util.getDateTime("nearMonth", "yyyy-MM-dd HH:mm:ss").bT : UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").bT;
	queryParamsList.END_TIME = selTime == 1 ? UI.util.getDateTime("nearMonth", "yyyy-MM-dd HH:mm:ss").eT : UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").eT;
	$(".byzdy").addClass('active').siblings().removeClass('active');
	$(".byzdy").click();
}
/*************************所有告警end*************************************/


$(function () {
	getAlgoID();
	UI.control.init();
	compatibleIndexOf();
	initEvent();
	initWaterMark();
	initDateTimeControl(timeOptionDraw);
	initDbTree(addressOption);
	fatherSearchDevice();
	initData();
	initDateTimeControl(timeOption);
	initDbTree(addressAllOption);
	ElectronicArchivesSwitch();
	tabConfigSwitch();
	showFlyKnowledge();
	if(needInitData){
		getinitdata();
	}
	$('.flyName').text(global.flyName);
});
//是否按照设备查询，回填。是否父页面调用
function fatherSearchDevice() {
        $('#deviceNames_1').html(deviceNameStr);
        $('#deviceNames_1').attr('title', deviceNameStr);
        $('#deviceNames_1').attr('orgcode', orgCodeStr);
        $('#orgCode_1').val(deviceIdStr);
        $('#orgCodeInt_1').val(deviceIdIntStr);

        addDrowdownDeviceList({
            deviceId: deviceIdStr,
            deviceName: deviceNameStr,
            deviceNameList: $("#deviceNameList"),
            dropdownListText: $(".dropdown-list-text")
        });
        // doSearch();
}
function getinitdata() {
	if (selTime == 1 || queryDate) {
		$('#timeTagList [time-control="nM"]').trigger('click');
	}
	if (selTime == 0) {
		$('#timeTagList [time-control="jt"]').trigger('click');
	}
	if(isBlack){
		$('#tabTitle .actives').attr('is_first',false);
		doSearchList(true);
	}
}
// 获取算法id，用于身份核查
function getAlgoID() {
	window.getAlgoList = slideFn('face/common/getFaceAlgoType', { MENUID: 'EFACE_faceCapture' },function(data){
		if (data && data.length) {
			algoID = data[0].ALGORITHM_ID;
		}
		if(isBlack){
			for(var i=0;i<data.length;i++){
				$("#tabListArithmetic").append(tmpl('ALGTemplate',data[i]));
			}
			global.algoNumSnList = data;
			$('#tabListArithmetic,#arithmetic,[ref="sanfeiView"],#confirmAllSearch,#confirmSearch').removeClass('hide');
			$('.zdyTimeBtn').addClass('hide');
			$('#tabDraw .zdyTimeBtn').removeClass('hide');
		}
	});
}

//情报接口显隐开关。
function ElectronicArchivesSwitch() {
	var map = { "applicationName": "portal" };
	UI.control.remoteCall('platform/webapp/config/get', map, function (resp) {
		var jsonObj = resp.attrList;
		for (var i = 0; i < jsonObj.length; i++) {
			if (jsonObj[i].key == "MENU_COMPATIBLE_SEQUENCE" && jsonObj[i].value != "默认") {
				$("[window-control='person']").removeClass("hide");
			}
		}
	});
};
//所有告警,二次告警 等默认选中配置项。
var needInitData = true;
function tabConfigSwitch() {
	var map = { "applicationName": "efacecloud" };
	UI.control.remoteCall('platform/webapp/config/get', map, function (resp) {
		var jsonObj = resp.attrList;
		for (var i = 0; i < jsonObj.length; i++) {
			if (jsonObj[i].key == "SECOND_ALARM_PAGE" && jsonObj[i].value != "1") {
				$("[ref='flyKnowledge']").addClass("hide");
				$("[ref='flyKnowledge']").prev().removeClass("hide");
			}
		}
		for (var i = 0; i < jsonObj.length; i++) {
			if (jsonObj[i].key == "HISTORY_ALARM_DEFAULT_TAB" && jsonObj[i].value == "2") {
				needInitData = false;
				$("[ref='flyKnowledge']").hasClass("hide") ? $("[ref='flyKnowledge']").prev().trigger("click") : $("[ref='flyKnowledge']").trigger("click");
			}
		}
	});
};

// 二次告警是否隐藏
function showFlyKnowledge() {
	var map={"applicationName":"efacesurveillance"};
	UI.control.remoteCall('platform/webapp/config/get', map, function(resp) {
		var data = resp.attrList;
		for(var i=0; i<data.length; i++) {
			if(data[i].key == "OPEN_SECOND_ALARM"){
				data[i].value == "0" ? $(".flyKnowledge").addClass("hide") : '';
				break;
			}
		}
	});
}


function eightBtnSwitch(){
	var map={"applicationName":"efacecloud"};
	UI.control.remoteCall('platform/webapp/config/get', map, function(resp) {
		var jsonObj = resp.attrList;
		for (var i = 0; i < jsonObj.length; i++) {
			if (jsonObj[i].key == "FACEALARM_CARD_OPERATION") {
				var $btns = $('[config-control]');
				var arr = jsonObj[i].value.split(",");
				for (var a = 0; a < arr.length; a++) {
					if (JSON.parse(arr[a])){
						var $noShowConfig = $('[config-control="' + (a + 1) + '"][no-show]');
						if($noShowConfig.length){
							$.each($noShowConfig,function(key,n){
								var $n = $(n);
								if(!$n.attr('no-show')){
									$n.removeClass("hide").addClass("hadRender");
								}
							})
						}else{
							$('[config-control="' + (a + 1) + '"]').removeClass("hide").addClass("hadRender");
						}
					}
				}
			}
		}
	});
};




//全部告警列表查询
function doSearchList(flag) {
	if (UI.util.validateForm($('#thresholdValidateAll'))) {
		allqueryParams.THRESHOLD = $('.searchSimilarConAll').val();
		allqueryParams.pageNo = 1;
		allqueryParams.KEYWORDS = $('.searchCon').val();
		allqueryParams.DEVICE_IDS = $("#orgCode_1").val();
		allqueryParams.BEGIN_TIME = $('#beginTime').val();
		allqueryParams.END_TIME = $('#endTime').val();
		allqueryParams.isHistory = isHistory;
		if ((allqueryParams && !isBlack)||flag == true) {
			if(isBlack){
				$('.arithmetic-tools.on:visible').removeClass('on').find('span').click();
				var queryAlgoListArr = getAlgoList();
				var curAlgoListArr = [];
				for(var i=0;i<queryAlgoListArr.length;i++){
					curAlgoListArr.push(queryAlgoListArr[i].ALGO_TYPE);
				}
				allqueryParams.MULIT_ALGO_TYPE = curAlgoListArr.join(',');
			}
			UI.control.getControlById("tabList").reloadData(null, allqueryParams);
		}
	}

}
function getdatatosync() {
	var data = UI.control.getDataById("dispatchedApprovalList")
	var shuju = data.records[0];
	if (!shuju) return
	var personId = shuju.PERSON_ID;
	var identitynum = shuju.IDENTITY_ID;
	var tagCode = shuju.PERSON_TAG;
	var rpID = shuju.RPID;
	var pic = shuju.PIC;
	var name = shuju.NAME;
	childrenFrameData.pic = shuju.PIC;
	childrenFrameData.personName = shuju.NAME
	childrenFrameData.personTagCode = shuju.PERSON_TAG
	childrenFrameData.personTagName = shuju.PERSON_TAG_NAME
	childrenFrameData.birthday = shuju.BIRTHDAY;
	childrenFrameData.sex = renderSex(shuju.SEX)
	childrenFrameData.identityId = shuju.IDENTITY_ID
	childrenFrameData.presentAddress = shuju.PRESENT_ADDRESS
	childrenFrameData.telephone = shuju.TELEPHONE
	if (isForeigner(tagCode)) {
		UI.util.showCommonIframe('.frame-form-full', '/efacestore/page/personLibrary/foreigners/foreignersPersonalDetail.html?personId=' + personId + "&identityNum=" + identitynum + "&rpID=" + rpID + "&pic=" + pic + "&name=" + name);
	}
	else {
		UI.util.showCommonIframe('.frame-form-full', '/efacestore/page/library/personFileDetail.html?personId=' + personId + "&identityNum=" + identitynum);
	}
}
function initEvent() {

	//告警确认
	$('body').on('click','.alarmConfirmBtn',function(){
		var	curHtml =	'<div class="form-group mb5">'+
						'<label>告警是否准确：</label>'+
						'<label class="radio-inline p0 ml5"><input type="radio" name="IS_CORRECT" value="1" checked="checked">是</label>'+
						'<label class="radio-inline p0 ml5"><input type="radio" name="IS_CORRECT" value="0">否</label></div>';

		var $this = $(this),
			ALARM_ID = $this.attr('ALARM_ID'),
			DB_ID = $this.attr('DB_ID'),
			ALARM_IMG = $this.attr('ALARM_IMG'),
			objectid = $this.attr('objectid');

		var opts = {
			title : '告警确认',
			renderHtml: curHtml,
			okcallback: function(data){
				var params = {
					ALARM_ID: ALARM_ID,
					CONFIRM_STATUS: data.IS_CORRECT,
					TYPE_ADD: data.TYPE_ADD,
					PERSON_ID: objectid,
					DB_ID: DB_ID,
					PIC: ALARM_IMG,
					IS_COVER: data.IS_CORRECT,
					SOURCE_TYPE: 2
				};
				UI.control.remoteCall('face/dispatchedAlarm/alarmConfirm', params, function(resp){
					if (resp.CODE == '0') {
						UI.util.alert(resp.MESSAGE);
						$this.addClass("hide");
					}else{
						UI.util.alert(resp.MESSAGE,"warn");
					}
				}, null, null,true);
				return true;
			}
		}
		UI.util.prompt(opts);
	});
	
	//下载统计准确度
    $('.sureAlarmBtn').click(function(){
        top.globalCache.faceCaptureParams = {
			BEGIN_TIME:$('#beginTime').val(),
			END_TIME:$('#endTime').val()
		};
		$('.arithmetic-tools.on:visible').removeClass('on').find('span').click();
		var queryAlgoListArr = getAlgoList();
		var curAlgoListArr = [];
		for(var i=0;i<queryAlgoListArr.length;i++){
			curAlgoListArr.push(queryAlgoListArr[i].ALGO_TYPE);
		}
		top.globalCache.faceCaptureParams.MULIT_ALGO_TYPE = curAlgoListArr.join(',');
    	UI.util.showCommonWindow('/efacecloud/page/library/faceCaptureBlackAlgoList.html?pageType=alarm', '准确度统计', $(top.window).width()*.95, $(top.window).height()*.9, function(data) {});
    });
	
	//所有告警确定按钮
	$('#confirmAllSearch').click(function(){
		doSearchList(true);
	});
	
	//二次告警
	$('#confirmSearch').click(function(){
		doSearchFlyList(true);
	});
	
	$('.tmplbox').on('click', '.btn-more', function (event) {
		var queryParams = {
			ALGO_LIST: '[{"ALGO_TYPE":"80003","THRESHOLD":"60"},{"ALGO_TYPE":"10003","THRESHOLD":"60"}]',
			KEYWORDS: '',
			PERSON_TAG: '',
			SEX: '',
			pageNo: 1,
			pageSize: 30,
			IMG: '',
			THRESHOLD: 60,
			isAsync: true,
			ARCHIVE_STATUS: 1,//档案状态
		}
		queryParams.THRESHOLD = $('.searchSimilarConAll').val();
		queryParams.KEYWORDS = $(this).data('flag');
		// queryParams.ALGO_LIST =getAlgoList();
		UI.control.getControlById("dispatchedApprovalList").reloadData('facestore/archivesPerson/getData', queryParams);
	})

	$('.tmplbox').on('click', "#identi", function () {
		var zjhm = $(this).data('zjhm');
		var name = $(this).data('name');
		UI.util.openCommonWindow({
			src: 'http://' + JSON.parse(UI.control.getPermissionMenus().DEFENCE_WGSBSS.URL).URL + '/newui/autoLogin.html?account=' + JSON.parse(UI.control.getPermissionMenus().DEFENCE_WGSBSS.URL).USER_NAME + '&toURL=newui/newpc/dist/index.html^/population?zjhm=' + zjhm,
			width: $(top.window).width() * .85,
			height: $(top.window).height() * .9,
			title: name,
			parentFrame: 'currentPage'
		});
	})
	//点击图片展开详情
	$("body").off("click", ".compare-img").on("click", ".compare-img", function (e) {
		// debugger
		$(this).parent().find(".detailBtnAll").trigger('click');
		e.stopPropagation();
	});

	//展开搜索条件
	$('.fiflerStateBtn').click(function () {
		var $this = $(this),
			$hideFilterBar = $this.parent().parent().find('.filterBar'),
			icon = $this.find('.icon'),
			$fiflerText = $this.find('.fifler-text');

		if (icon.hasClass('icon-more')) {
			icon.addClass('icon-hide').removeClass('icon-more');
			$hideFilterBar.removeClass('hide');
			if (!allqueryParams.ORG_CODE) {
				$("#allControlPerson").parent().addClass('hide');
			}
			if (!flyParams.ORG_CODE) {
				$("#secondControlPerson").parent().addClass('hide');
			}
			$fiflerText.html('收起列表');
		} else {
			icon.addClass('icon-more').removeClass('icon-hide');
			$hideFilterBar.addClass('hide');
			$fiflerText.html('查看更多');
		}
	});

	//搜索相似度键盘抬起事件
	$('.searchSimilarCon').keyup(function (e) {
		var value = $('.searchSimilarCon').val();
		if (value || value != "") {
			flyParams.THRESHOLD = parseInt(value);
		} else {
			flyParams.THRESHOLD = value;
		}
		doSearchFlyList();

	});
	//刷新按钮
	$("body").on("click", "#freshBtn", function () {
		doSearchFlyList(true);
	});
	//导出
	$('#export').click(function () {
		var exportParams = {};
		var url = UI.control.getRemoteCallUrl("face/dispatchedAlarm/grouping/exportAlarm");
		var exportData = UI.control.getControlById('flyKnowledge').getListviewCheckData();
		if (exportData.length > 0) {
			exportParams.EXPORT_DATA = JSON.stringify(exportData);
			exportParams.ALARM_TYPE = 1;
			bigDataToDownload(url, "exportFrame", exportParams);
		} else {
			UI.util.alert('请选择导出数据', 'warn');
		}
	});

	// 与全国在逃人员库比中
	$('#ztFilter .tagItem').on('click', function () {
		var val = $(this).attr('value');
		$(this).addClass('active').siblings().removeClass('active');
		if (val == '') {
			flyParams.IS_ESCAPE_HIT = val;
		} else {
			flyParams.IS_ESCAPE_HIT = parseInt(val);
		}
		doSearchFlyList();
	});


	// 打开卡片重复的页面
	$('body').on('click', '.openRepeat', function () {
		// 当前检索时间
		var timeControl = 'jt';
		$('#flyTimeList .tagsTime').each(function (index, item) {
			if ($(this).hasClass('active')) {
				timeControl = $(this).attr('time-control');
			}
		})
		var OBJECT_ID = $(this).attr('OBJECT_ID');
		var bT = flyParams.BEGIN_TIME;
		var eT = flyParams.END_TIME;
		var KEYWORDS = flyParams.KEYWORDS;
		var DEVICE_IDS = flyParams.DEVICE_IDS;
		var AlGORITHM_ID = flyParams.AlGORITHM_ID;
		var DB_ID = flyParams.DB_ID;
		var SORT = flyParams.SORT;
		var IS_ESCAPE_HIT = flyParams.IS_ESCAPE_HIT;
		var THRESHOLD = flyParams.THRESHOLD;
		var alarmLevel = flyParams.ALARM_LEVEL;
		var alarmHandle = flyParams.ALARM_HANDLE;
		var isCatch = flyParams.IS_CATCH;
		var url = '/efacecloud/page/alarm/alarmFSCardList.html?OBJECT_ID=' + OBJECT_ID + '&BEGIN_TIME=' + bT + '&END_TIME=' + eT + '&timeControl=' + timeControl + '&KEYWORDS=' + KEYWORDS + '&DEVICE_IDS=' + DEVICE_IDS + '&AlGORITHM_ID=' + AlGORITHM_ID + '&DB_ID=' + DB_ID + '&SORT=' + SORT + '&IS_ESCAPE_HIT=' + IS_ESCAPE_HIT + '&THRESHOLD=' + THRESHOLD
			+ '&alarmLevel=' + alarmLevel + '&alarmHandle=' + alarmHandle + '&isCatch=' + isCatch;
		UI.util.showCommonIframe('.frame-form-full', url);
	});

	$('#statistical .tabItem').on('click', function () {
		var type = $(this).attr('attr-type');
		$(this).addClass('active').siblings().removeClass('active');
		if (type == 'total') {  //全部告警
			queryParams.ALARM_TYPE = '';
		} else {  //飞识告警
			queryParams.ALARM_TYPE = 1;
		}
		doSearchChart();
	})
	//	//查看所有告警
	//	$('.look-task').on('click', function(event) {
	//		UI.util.showCommonIframe('.frame-form-full', '/efacecloud/page/alarm/personAlarmAllList.html');
	//	});

	//tab切换
	$('#tabTitle .tab-btn').click(function () {
		if (beforeRef || currentRef) {
			beforeRef = currentRef;
		}
		var $this = $(this),
			isFirst = $this.attr('is_first');
		currentRef = $this.attr('ref');
		thirdImpl = $this.attr('thirdImpl');

		$this.addClass('actives').siblings('.tab-btn').removeClass('actives');
		$('#' + currentRef).addClass('active').siblings('.tab-pane').removeClass('active');
		
		switch(currentRef){
			case 'tabDraw':
				if(isFirst != 'false'){
					queryParams = queryParamsChart;
					$('#timeTagDraw .zdyTimeBtn').trigger('click');
				}
			case 'flyKnowledge':
				if(isFirst != 'false'){
					initDateTimeControl(flyTimeOption);
					if(isBlack){
						doSearchFlyList(true);
					}else{
						doSearchFlyList();
					}
				}
				break;
			case 'tabList':

				if($('[thirdimpl="true"]:visible').length){
					if(thirdImpl == 'true'){
						allqueryParams.ALARM_TYPE = '2';
					}else{
						allqueryParams.ALARM_TYPE = '';
					}
					doSearchList();
				}else{
					if(isFirst != 'false'){
						allqueryParams.ALARM_TYPE = '';
						if(isBlack){
							doSearchList(true)
						}else{
							doSearchList();
						}
					}
				}
				break;
			case 'sanfeiView':
				if(isFirst != 'false'){
					var url = $this.attr('url');
					var $curIframe = $('#'+currentRef+' iframe');
					var curSrc = $curIframe.attr('src');
					if(!curSrc){
						$curIframe.attr('src',url);
					}
				}
				break;
		}

		$this.attr('is_first',false);
		$(".page-info-metro").removeClass("fixed");
	});

	//删除已选设备
	$("body").on("click", ".removeDeviceBtn", function (e) {
		var $this = $(this);
		var i = $this.parents("ul").attr("index");
		var deviceId = $this.attr("deviceid");
		var deviceIdArr = $('#orgCode_' + i).val().split(",");
		var deviceNameArr = $('#deviceNames_' + i).html().split(",");
		var index = deviceIdArr.indexOf(deviceId),
			orgCode = $("#deviceNames_" + i).attr("orgcode"),
			orgCodeArr = orgCode.split(",");

		$this.parents("li").remove();
		deviceIdArr.splice(index, 1);
		deviceNameArr.splice(index, 1);
		orgCodeArr.splice(index, 1);
		$('#orgCode_' + i).val(deviceIdArr.join(","));
		$('#deviceNames_' + i).html(deviceNameArr.join(","));
		$('#deviceNames_' + i).attr("title", deviceNameArr.join(","));
		$('#deviceNames_' + i).attr("orgcode", orgCodeArr.join(","));
		if ($("#deviceNameList_" + i + " li").length == 0) {
			$("#deviceNames_" + i).parent().attr("data-toggle", "");
			$("#deviceNames_" + i).parent().find(".dropdown").addClass("hide");
			$("#deviceNames_" + i).parent().parent().removeClass("open");
		}

		if (i == 2) {//告警统计图
			doSearchChart();
		} else if (i == 3) {//飞识告警
			doSearchFlyList();
		} else {//全部告警
			doSearchList();
		}

		e.stopPropagation();
	});


	//感知设备通过卡口树加载设备
	$("[id^=deviceNames_]").click(function (e) {
		var index = $(this).attr("id").split("_")[1];
		//回填数据
		checkDrowDownDeviceList({
			deviceNames: $('#deviceNames_' + index).html(),
			deviceId: $('#orgCode_' + index).val(),
			deviceIdInt: $('#orgCodeInt_' + index).val(),
			orgCode: $("#deviceNames_" + index).attr("orgcode")
		});

		UI.util.showCommonWindow('/connectplus/page/device/deviceList.html?deviceType=194', '感知设备', 1000, 600, function (resp) {
			$('#deviceNames_' + index).html(resp.deviceName);
			$('#deviceNames_' + index).attr('title', resp.deviceName);
			$('#deviceNames_' + index).attr('orgcode', resp.orgCode);
			$('#orgCode_' + index).val(resp.deviceId);
			addDrowdownDeviceList({
				deviceId: resp.deviceId,
				deviceName: resp.deviceName,
				deviceNameList: $("#deviceNameList_" + index),
				dropdownListText: $("#deviceNameList_" + index).parent().prev()
			});
			switch (index) {
				case 1://所有告警列表
				case "1":
					doSearchList();
					break;
				case 2://告警统计
				case "2":
					doSearchChart();
					break;
				case 3://二次告警列表
				case "3":
					doSearchFlyList();
					break;
			}
		});
		e.stopPropagation();
	});

	//点击进入卡口选择地图
	$('[id^=locate_]').click(function () {
		var index = $(this).attr("id").split("_")[1];
		UI.util.showCommonWindow('/connectplus/page/device/deviceMap.html?deviceType=194', '感知设备', 1000, 600, function (resp) {
			$('#deviceNames_' + index).html(resp.deviceName);
			$('#deviceNames_' + index).attr('title', resp.deviceName);
			$('#deviceNames_' + index).attr('orgcode', resp.orgCode);
			$('#orgCode_' + index).val(resp.deviceId);
			addDrowdownDeviceList({
				deviceId: resp.deviceId,
				deviceName: resp.deviceName,
				deviceNameList: $("#deviceNameList_" + index),
				dropdownListText: $("#deviceNameList_" + index).parent().prev()
			});
			switch (index) {
				case 1://所有告警列表
				case "1":
					doSearchList();
					break;
				case 2://告警统计
				case "2":
					doSearchChart();
					break;
				case 3://二次告警列表
				case "3":
					doSearchFlyList();
					break;
			}
		});
	});

	/*************************飞识告警列表start*************************************/
	//点击搜索事件
	$('body').on('click', '.searchBtn', function () {
		var imgurl = $(this).attr('fileUrl');
		var curSrc = matcher('/efacecloud/page/library/faceCaptureList.html/' + top.projectID).url;
		curSrc += "?imgSrc=" + imgurl + "&pageType=record";
		UI.util.showCommonWindow(curSrc, "路人检索", $(top.window).width() * .95, $(top.window).height() * .9, function (obj) { });
	});

	//点击详情事件
	$('body').on('click', '.detailBtn', function () {
		var $this = $(this),
			ALARM_ID = $this.attr('ALARM_ID'),
			level = $this.attr("alarm-level"),
			name = $this.attr("name"),
			idCard = $this.attr("idcard"),
			time = $this.attr("time"),
			objectId = $this.attr("objectid"),
			curTime = $this.attr("curtime"),
			alarmTime = $this.attr("alarmtime"),
			alarmImg = $this.attr('alarm-img');
		UI.util.showCommonWindow('/efacecloud/page/library/alarmDetails.html?OBJECT_ID=' + objectId + '&curTime=' + curTime + '&isFly=1&ALARM_ID=' + ALARM_ID + '&level=' + level
			+ '&name=' + name + '&idCard=' + idCard + '&time=' + time + '&alarmTime=' + alarmTime + '&alarmImg=' + alarmImg, "告警详情",
			1080, (isBlack?690:670), function (obj) { });
	});

	//布控详情
	$('body').on('click', '.controlDetailBtn', function () {
		var objId = $(this).attr("objectid");
		var opts = {
			src: '/efacesurveillance/page/faceControl/dispatchedApproval/controlApplyForm.html?pageTitle=布控详情&pageType=detail&funcType=6&objectId=' + objId + '&noFooter=' + true,
			title: '布控详情',
			width: $(top.window).width() * .95,
			height: $(top.window).height() * .9
		}
		parent.UI.util.openCommonWindow(opts);
	});


	//轨迹分析
	$("body").on("click", ".trajectory-search", function () {
		var time = {
			bT: flyParams.BEGIN_TIME,
			eT: flyParams.END_TIME
		};
		openWindowPopup('track', $(this).attr("url"), time);
	});

	//时间相似度排序
	$("#sortList .tag-item").click(function () {
		var $this = $(this),
			type = $this.attr("type");

		if (type == 'timeSort') {
			flyParams.SORT = 0;
		} else {
			flyParams.SORT = 1;
		}

		$this.addClass("active").siblings().removeClass("active");
		doSearchFlyList();
	});

	//搜索姓名，身份证查询条点击事件
	$('.searchFlyBarBtn').click(function () {
		doSearchFlyList();
	});
	//搜索姓名，身份证查询条回车事件
	$('.searchFlyCon').keypress(function (e) {
		if (((e.keyCode || e.which) == 13)) {
			doSearchFlyList(true);
		}
	});


	//图片放大
	$("body").on("click", "[compareimg]", function () {
		var $this = $(this),
			curImg = $this.attr("compareimg"),
			url = $this.attr("src");

		var parentBox = $this.parents('.listviewImgBox');
		var _baseImgArr = [],
			baseImgSeries = [],
			controlZoomSeries = [],
			flyZoomSeries = [],
			showIndex = 0;
		var $baseImg = $('body').find('[compareimg="captureZoom"]'),
			$controlImg = $('body').find('[compareimg="controlZoom"]'),
			$flyImg = $('body').find('[compareimg="flyZoom"]');

		// 给每个卡片加索引
		if (parentBox.find('[pic-order]').length > 0) { //已经自定义序号
			showIndex = parseInt($this.parents('.imgOrder').attr('pic-order'));
		} else {
			// 为每个列表添加 listview-item 属性
			parentBox.find(".imgOrder").each(function (index, item) {
				$(this).attr('pic-order', index);
			});
			showIndex = parseInt($this.parents('.imgOrder').attr('pic-order'));
		}

		$baseImg.each(function (index, item) {
			baseImgSeries.push({
				'src': $(this).attr("src"),
				'mess': renderPicMsg(parentBox, index)
			});
			_baseImgArr.push($(this).attr("src"));
		})


		switch (curImg) {
			case 'captureZoom':
				/*var options = {
					isSlide: false,
					series:[url]
				}*/
				var options = {
					isSlide: false,
					series: baseImgSeries,
					showIndex: showIndex,
					isMessage: true,
					isListView: true
				}
				break;
			case 'controlZoom':
				var src = $this.parent().parent().find('[compareimg="captureZoom"]').attr("src");
				//双图
				/*var options = {
					isCompare: true,
					baseImg: src,//左边的图片
					isMessage: false,
					isSlide: false,
					series: [{'src':url,'show':true}]
			    }*/
				$controlImg.each(function (index, item) {
					controlZoomSeries.push({
						'src': $(this).attr("src"),
						'mess': renderPicMsg(parentBox, index)
					})
				})
				var options = {
					isCompare: true,
					isMessage: false,
					isSlide: false,
					isListView: true,
					series: controlZoomSeries,
					baseImg: _baseImgArr,
					showIndex: showIndex,
					isMessage: true
				}
				break;
			case 'flyZoom':
				var src = $this.parent().parent().find('[compareimg="captureZoom"]').attr("src");
				//双图
				/*var options = {
					isCompare: true,
					baseImg: src,//左边的图片
					isMessage: false,
					isSlide: false,
					series: [{'src':url,'show':true}]
			    }*/
				$flyImg.each(function (index, item) {
					flyZoomSeries.push({
						'src': $(this).attr("src"),
						'mess': renderPicMsg(parentBox, index)
					})
				})
				var options = {
					isCompare: true,
					isMessage: false,
					isSlide: false,
					isListView: true,
					series: flyZoomSeries,
					baseImg: _baseImgArr,
					showIndex: showIndex,
					isMessage: true
				}
				break;
		}

		top.$.photoZoom(options);

	});

	//处置状态
	$("#alarmHandle .tagItem").click(function () {
		var $this = $(this);
		var val = $this.attr('value');
		$this.addClass('active').siblings().removeClass('active');
		flyParams.ALARM_HANDLE = val;
		doSearchFlyList();
	});

	//是否已抓捕
	$("#captureFilter .tagItem").click(function () {
		var $this = $(this);
		var val = $this.attr('value');
		$this.addClass('active').siblings().removeClass('active');
		flyParams.IS_CATCH = val;
		doSearchFlyList();
	});

	//告警等级
	$("#colorTags li").click(function () {
		var $this = $(this);
		var curVal = $this.parent().attr("curval");
		if (curVal) {
			var valArr = curVal.split(",");
		} else {
			var valArr = [];
		}
		if ($this.hasClass("tag-item")) {
			$this.addClass('active').siblings().removeClass('active');
			valArr = [];
		} else {
			$this.parent().find(".tag-item").removeClass("active");
			var val = $this.attr("val");
			if ($this.hasClass("active")) {
				$this.removeClass("active");
				var index = valArr.indexOf(val);
				if (index >= 0) {
					valArr.splice(index, 1);
				}
			} else {
				$this.addClass("active");
				valArr.push(val);
			}
		}
		flyParams.ALARM_LEVEL = valArr.join(",");
		$this.parent().attr("curval", valArr.join(","));
		doSearchFlyList();
	});

	/*************************飞识告警列表end*************************************/


	/*************************全部告警列表start*************************************/
	// 是否飞识比中
	$('#zfFilter .tagItem').on('click', function () {
		var val = $(this).attr('value');
		$(this).addClass('active').siblings().removeClass('active');
		if (val == '') {
			queryParamsList.ALARM_TYPE = val;
		} else {
			queryParamsList.ALARM_TYPE = parseInt(val);
		}
		doSearchList();
	});

	// 与全国在逃人员库比中
	$('#ztFilterAll .tagItem').on('click', function () {
		var val = $(this).attr('value');
		$(this).addClass('active').siblings().removeClass('active');
		if (val == '') {
			queryParamsList.IS_ESCAPE_HIT = val;
		} else {
			queryParamsList.IS_ESCAPE_HIT = parseInt(val);
		}
		doSearchList();
	});

	// 打开卡片重复的页面
	$('body').on('click', '.openRepeatAll', function () {
		// 当前检索时间
		var timeControl = 'jt';
		$('#timeTagList .tagsTime').each(function (index, item) {
			if ($(this).hasClass('active')) {
				timeControl = $(this).attr('time-control');
			}
		})
		var OBJECT_ID = $(this).attr('OBJECT_ID');
		var bT = queryParamsList.BEGIN_TIME;
		var eT = queryParamsList.END_TIME;
		var THRESHOLD = queryParamsList.THRESHOLD;
		var DEVICE_IDS = queryParamsList.DEVICE_IDS;
		var KEYWORDS = queryParamsList.KEYWORDS;
		var SORT = queryParamsList.SORT;
		var IS_ESCAPE_HIT = queryParamsList.IS_ESCAPE_HIT;
		var ALARM_TYPE = queryParamsList.ALARM_TYPE;
		var alarmLevel = queryParamsList.ALARM_LEVEL;
		var alarmHandle = queryParamsList.ALARM_HANDLE;
		var isCatch = queryParamsList.IS_CATCH;
		var url = '/efacecloud/page/alarm/alarmAllCardList.html?OBJECT_ID=' + OBJECT_ID + '&BEGIN_TIME=' + bT + '&END_TIME=' + eT + '&timeControl=' + timeControl + '&THRESHOLD=' + THRESHOLD + '&DEVICE_IDS=' + DEVICE_IDS + '&KEYWORDS=' + KEYWORDS + '&SORT=' + SORT + '&IS_ESCAPE_HIT=' + IS_ESCAPE_HIT + '&ALARM_TYPE=' + ALARM_TYPE
			+ '&alarmLevel=' + alarmLevel + '&alarmHandle=' + alarmHandle + '&isCatch=' + isCatch + '&MULIT_ALGO_TYPE=' + allqueryParams.MULIT_ALGO_TYPE;
		UI.util.showCommonIframe('.frame-form-full', url);
	});

	//处置状态
	$("#alarmHandleAll .tagItem").click(function () {
		var $this = $(this);
		var val = $this.attr('value');
		$this.addClass('active').siblings().removeClass('active');
		queryParamsList.ALARM_HANDLE = val;
		doSearchList();
	});

	// 比中类型
	$('#matchType .tagItem').on('click', function () {
		var $this = $(this);
		$this.addClass('active').siblings().removeClass('active');
		queryParamsList.CHECK_IDENTITY_MSG = $this.attr('value');
		doSearchList();
	});

	//告警确认状态
	$("#confirmStatus .tagItem").click(function () {
		var $this = $(this);
		var val = $this.attr('value');
		if (val == 1) {
			confirmStatus = 1;
		}
		$this.addClass('active').siblings().removeClass('active');
		queryParamsList.CONFIRM_STATUS = val;
		doSearchList();
	});

	// 是否使用【布控状态】
	ifConfigProperty("opengw","LOGICAL_DELETE_DISPATCHE_FLAG","1", function () {
		$("#personStatusGroup").removeClass("hidden");
		
		$("#personStatus .tagItem").click(function () {
			var $this = $(this);
			var val = $this.attr('value');
			$this.addClass('active').siblings().removeClass('active');
			queryParamsList.isDelete = val;
			doSearchList();
		});
	});
	

	//是否已抓捕
	$("#captureFilterAll .tagItem").click(function () {
		var $this = $(this);
		var val = $this.attr('value');
		$this.addClass('active').siblings().removeClass('active');
		queryParamsList.IS_CATCH = val;
		doSearchList();
	});

	//告警等级
	$("#colorTagsAll li").click(function () {
		var $this = $(this);
		var curVal = $this.parent().attr("curval");
		if (curVal) {
			var valArr = curVal.split(",");
		} else {
			var valArr = [];
		}
		if ($this.hasClass("tag-item")) {
			$this.addClass('active').siblings().removeClass('active');
			valArr = [];
		} else {
			$this.parent().find(".tag-item").removeClass("active");
			var val = $this.attr("val");
			if ($this.hasClass("active")) {
				$this.removeClass("active");
				var index = valArr.indexOf(val);
				if (index >= 0) {
					valArr.splice(index, 1);
				}
			} else {
				$this.addClass("active");
				valArr.push(val);
			}
		}
		queryParamsList.ALARM_LEVEL = valArr.join(",");
		$this.parent().attr("curval", valArr.join(","));
		doSearchList();
	});

	//频次分析
	$("#freqAnalysisBtn").click(function () {
		var listData = UI.control.getDataById('tabList'),
			checkData = UI.control.getControlById('tabList').getListviewCheckData();
		if (listData.count <= 0) {
			UI.util.alert("暂无数据，请重新查询！", "warn");
			return;
		}
		if (checkData.length == 0) {
			UI.util.alert("请勾选一个数据！", "warn");
			return;
		}
		if (checkData.length > 1) {
			UI.util.alert("只能勾选一个数据！", "warn");
			return;
		}
		UI.util.showCommonWindow("/efacecloud/page/alarm/freqAnalysis.html", "频次分析", 550, 400, function (data) {
			var beginTime = data.beginTime,
				endTime = data.endTime,
				threshold = data.threshold,
				objectId = $(".list-node-wrap.active").attr("obj_id");
			UI.util.showCommonIframe('.frame-form-full', '/efacecloud/page/alarm/alarmAnalysisList.html?BEGIN_TIME=' + beginTime + '&END_TIME=' + endTime +
				'&THRESHOLD=' + threshold + '&OBJECT_ID=' + objectId);
		});
	});

	//轨迹分析
	$("body").on("click", ".trajectory-searchAll", function () {
		if (isBlack) {
			var time = {
				bT: allqueryParams.BEGIN_TIME,
				eT: allqueryParams.END_TIME
			};
			var params = {
				src: "/efacecloud/page/technicalStation/tacticsFrame.html?pageType=track" + '&beginTime=' + time.bT + '&endTime=' + time.eT + '&noBackBtn=true&zjhm=' + $(this).attr('zjhm'),
				title: '轨迹分析',
				width: $(top.window).width() * .95,
				height: $(top.window).height() * .9,
				callback: function (obj) { }
			};
			UI.util.openCommonWindow(params);
		} else {
			var time = {
				bT: queryParamsList.BEGIN_TIME,
				eT: queryParamsList.END_TIME
			};
			openWindowPopup('track', $(this).attr("url"), time);
		}
	});

	//身份核查
	$("body").on("click", ".verification-search", function () {
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

		if (UI.control.hasPermission('EFACE_faceVerificationArchive')) {
			src = '/efacestore/page/library/personnelFileMagList.html';
			query = '?imgUrL=' + imgUrl;
		}

		var params = {
			src: src + query,
			title: title,
			width: $(top.window).width() * .95,
			height: $(top.window).height() * .9,
			callback: function (obj) {

			}
		};
		UI.util.openCommonWindow(params);
	});

	// 人脸1：1比对
	$('body').on('click', '.compareBtn', function () {
		var $compareImg = $(this).parents('.list-node-wrap').find('.compare-img');
		var img1 = $compareImg.find('img').eq(0).attr('src'),
			img2 = $compareImg.find('img').eq(1).attr('src');
		var params = {
			src: '/efacecloud/page/technicalStation/oneToOneCheck.html?tabSel=oneToOne&img1=' + img1 + '&img2=' + img2,
			title: '人脸1：1比对',
			width: $(top.window).width() * .95,
			height: $(top.window).height() * .9,
			callback: function (obj) { }
		};
		UI.util.openCommonWindow(params);
	});

	//搜索姓名，身份证查询条点击事件
	$('.searchBarBtn').click(function () {
		doSearchList(true);
	});
	//搜索姓名，身份证查询条回车事件
	$('.searchCon').keypress(function (e) {
		if (((e.keyCode || e.which) == 13)) {
			doSearchList(true);
		}
	});

	//刷新按钮
	$("body").on("click", "#freshBtnAll", function () {
		doSearchList(true);
	});

	//全部告警中搜索相似度抬起事件
	$('.searchSimilarConAll').keyup(function (e) {
		var value = $('.searchSimilarConAll').val()
		if (value || value != "") {
			queryParamsList.THRESHOLD = parseInt(value);
		} else {
			queryParamsList.THRESHOLD = value;
		}
		doSearchList();
	});

	//时间相似度排序
	$("#sortListAll .tag-item").click(function () {
		var $this = $(this),
			type = $this.attr("type");

		if (type == 'timeSort') {
			queryParamsList.SORT = 0;
		} else {
			queryParamsList.SORT = 1;
		}

		$this.addClass("active").siblings().removeClass("active");
		doSearchList();
	});

	//点击搜索事件
	$('body').on('click', '.searchBtnAll', function () {
		var imgurl = $(this).attr('fileUrl');
		var curSrc = matcher('/efacecloud/page/library/faceCaptureList.html/' + top.projectID).url;
		curSrc += "?imgSrc=" + imgurl + "&pageType=record";
		UI.util.showCommonWindow(curSrc, "路人检索", 1250, 650, function () { });
	});

	//点击详情事件
	$('body').on('click', '.detailBtnAll', function () {
		var $this = $(this),
			isfs = $this.attr("isfs");

		var showIndex = 0;
		var _series = [];
		var parentBox = $this.parents('.tilelist');

		if (parentBox.length > 0) {
			// 计算当前按钮所在索引
			if (parentBox.find('[btn-order]').length > 0 && ($this.attr('btn-order') || $this.parent('.btn-order').attr('btn-order'))) { //已经自定义序号
				showIndex = parseInt($this.attr('btn-order') || $this.parent('.btn-order').attr('btn-order'));
			} else {
				// 为每个按钮添加 btn-order 属性
				parentBox.find('.detailBtnAll').each(function (index, item) {
					$(item).attr('btn-order', index);
				});

				showIndex = parseInt($this.attr('btn-order') || $this.parent('.btn-order').attr('btn-order'));
			}

			// 详情的query参数数组
			parentBox.find('.detailBtnAll').each(function (index, item) {
				_series.push(getAlarmDetailQuery($(item)));
			});
		}
		// 存到top.globalCache中
		top.globalCache.switchAlarmDetail = {
			series: _series.length > 0 ? _series : [url],
			showIndex: showIndex
		};
		// 当前的query参数
		var query = getAlarmDetailQuery($this);
		// query = '?OBJECT_ID=' + OBJECT_ID + '&curTime=' + curTime + '&ALARM_ID=' + ALARM_ID + '&level=' + level
		// 		+ '&alarmTime=' + alarmTime + '&alarmImg=' + alarmImg;
		if (_series.length != 1) {
			if (showIndex == 0) {
				query += '&switchBtn=next';
			} else if (showIndex == _series.length - 1) {
				query += '&switchBtn=prev';
			} else {
				query += '&switchBtn=both';
			}
		}
		// debugger

		if (isfs == '1') {
			UI.util.showCommonWindow('/efacecloud/page/library/alarmDetails.html' + query, "告警详情", 1080, 700, function (obj) { });
		} else {
			UI.util.showCommonWindow('/efacecloud/page/library/alarmDetails.html' + query, "告警详情", 880, 670, function (obj) { });
		}
	});

	// 刷新
	$('body').on('click', '.refreshBtn', function (e) {
		e.stopPropagation();
		var $this = $(this);
		var param = {
			IDEN_ID: $this.attr('IDENTITY_ID'),
			ALARM_ID: $this.attr('ALARM_ID'),
		};
		UI.util.showLoadingPanel();
		UI.control.remoteCall('face/dispatchedAlarm/checkEscapeeStatus', param, function (resp) {
			if (resp.ESCAPEE_FLAG == 0) {
				UI.util.alert($this.attr('IDENTITY_ID') + "	检测结果 [撤逃]");
			} else if (resp.ESCAPEE_FLAG == 1) {
				UI.util.alert($this.attr('IDENTITY_ID') + "	检测结果 [在逃]");
			} else {
				UI.util.alert($this.attr('IDENTITY_ID') + "	检测结果 [异常]");
			}
			UI.util.hideLoadingPanel();
		}, function () {
			UI.util.hideLoadingPanel();
		});
	});

	//导出
	$('#exportAll').click(function () {
		var exportParams = {};
		var url = UI.control.getRemoteCallUrl("face/dispatchedAlarm/grouping/exportAlarm");
		var exportData = UI.control.getControlById('tabList').getListviewCheckData();
		if (exportData.length > 0) {
			exportParams.EXPORT_DATA = JSON.stringify(exportData);
			bigDataToDownload(url, "exportFrame", exportParams);
		} else {
			UI.util.alert('请选择导出数据', 'warn');
		}
	});
	//结构化检索
	$("body").on("click", ".structuredSearch", function () {
		var imgSrc = $(this).attr("imgUrl");
		UI.util.showCommonWindow("/datadefence/page/retrieval/structuredSearch.html?imgSrc=" + imgSrc, "结构化检索", 1200, 700,
			function (resp) {
			});

	})
	/*//更多历史告警//用户体验不太好取消这个按钮
	$('#toHisBtn').click(function() {
		window.open('/efacecloud/page/alarm/personAlarmHistoryList.html?isHistory=1');
	});*/

	/*************************全部告警列表end*************************************/

	/*************************告警统计start*************************************/

	//选择时间
	// $('#timeTagDraw .tag-item').click(function() {
	// 	queryParams.STATISTIC_TYPE = $(this).attr('val');
	// });

	/*************************告警统计end*************************************/

	UI.control.getControlById("tabList").bind("load", function () {
		ElectronicArchivesSwitch();

		//UI.control.getDataById('tabList').TOTAL &&
		if (!$('[config-control]').hasClass("hadRender")) {
			$("#alarmTotalAll").html(UI.control.getDataById('tabList').TOTAL);
			eightBtnSwitch();
		}
	});
	
	
	UI.control.getControlById("flyKnowledge").bind("load", function () {
		if (UI.control.getDataById('flyKnowledge').TOTAL) {
			$("#alarmTotal").html(UI.control.getDataById('flyKnowledge').TOTAL);
		}
	})
}

/**
 * 获取某项告警记录打开详情时url的query参数
 * @author yangzonghong
 * @version 2019-05-07
 * @param {Object} $dom 该项记录详情按钮的jquery dom对象
 * @returns 详情按钮对应的query参数
 */
function getAlarmDetailQuery($dom) {
	var ALARM_ID = $dom.attr('ALARM_ID'),
		level = $dom.attr("alarm-level"),
		OBJECT_ID = $dom.attr("objid"),
		isfs = $dom.attr("isfs"),
		alarmTime = $dom.attr("alarmtime"),
		curTime = $dom.attr("curtime"),
		alarmImg = $dom.attr('alarm-img');
	var query = '';
	if (isfs == '1') {
		var name = $dom.attr("name"),
			idCard = $dom.attr("idcard"),
			time = $dom.attr("time");
		query = '?OBJECT_ID=' + OBJECT_ID + '&curTime=' + curTime + '&isFly=1&ALARM_ID=' + ALARM_ID + '&level=' + level
			+ '&name=' + name + '&idCard=' + idCard + '&time=' + time + '&alarmTime=' + alarmTime + '&alarmImg=' + alarmImg;
	} else {
		query = '?OBJECT_ID=' + OBJECT_ID + '&curTime=' + curTime + '&ALARM_ID=' + ALARM_ID + '&level=' + level
			+ '&alarmTime=' + alarmTime + '&alarmImg=' + alarmImg;
	}
	if (confirmStatus) {
		query += '&confirmStatus=1';
	}
	return query;
}

//飞识告警查询
function doSearchFlyList(flag) {
	if (UI.util.validateForm($('#thresholdValidate'))) {
		flyParams.pageNo = 1;
		flyParams.KEYWORDS = $('.searchFlyCon').val();
		flyParams.DEVICE_IDS = $("#orgCode_3").val();
		flyParams.BEGIN_TIME = $('#flyBeginTime').val();
		flyParams.END_TIME = $('#flyEndTime').val();
		if ((flyParams && !isBlack)||flag == true) {
			if(isBlack){
				$('.arithmetic-tools.on:visible').removeClass('on').find('span').click();
				var queryAlgoListArr = getAlgoList();
				var curAlgoListArr = [];
				for(var i=0;i<queryAlgoListArr.length;i++){
					curAlgoListArr.push(queryAlgoListArr[i].ALGO_TYPE);
				}
				flyParams.MULIT_ALGO_TYPE = curAlgoListArr.join(',');
			}
			UI.control.getControlById("flyKnowledge").reloadData(null, flyParams);
		}
	}
}

//告警统计查询
function doSearchChart() {
	UI.util.showLoadingPanel();
	// queryParams.DEVICE_IDS = $("#orgCode_2").val();
	queryParams.BEGIN_TIME = $('#beginTimeDraw').val();
	queryParams.END_TIME = $('#endTimeDraw').val();
	if (queryParams) {
		initChart();
		UI.util.hideLoadingPanel();
	}
}

//布控库查询
function doSearchByDb(dbIdList) {
	// if(currentRef == 'tabDraw') {
	// 	queryParams.DB_IDS = dbIdList.join(",");
	// 	doSearchChart();
	// } else {
	flyParams.DB_ID = dbIdList.join(",");
	doSearchFlyList();
	// }
}

//全部告警布控库查询
function doAllSearchByDb(dbIdList) {
	queryParamsList.DB_ID = dbIdList.join(",");
	doSearchList();
}

function initData() {
	if(isBlack){
		$('.sureAlarmBtn').removeClass('hide');
	}
	if (titleType == 'hide') {
		$('.page-title').addClass('hide');
		$('.freq-view').removeClass('title-sib');
	}
	allqueryParams = queryParamsList;
	//全部告警页面滚动
	if ($("[container='scroll']").length) {

		var $pageInfoElm = $('.page-info-metro-all');

		var uploadImgType = $("[container='scroll']").attr('uploadImgType');

		var time = 60, //60毫秒的间隔  函数节流阀值
			timer = null,
			offsetTop = '';

		$("[container='scroll']").scroll(function () {

			offsetTop = $pageInfoElm.next().offset().top - 62;

			if (typeof timer != "number") {

				timer = setTimeout(function () {

					if (offsetTop < 0) {
						$pageInfoElm.addClass('fixed');
						$('.compare-picture').addClass('fixed');
						$('.result').addClass('fixed');
					}
					else {
						$pageInfoElm.removeClass('fixed');
						$('.compare-picture').removeClass('fixed');
						$('.result').removeClass('fixed');
					}


					timer = null;

				}, time);

			}

		});
	}
}


function initChart() {
	var _xData = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
		seriesDatas = [],
		color = ['#c23531', '#2f4554', '#e062ae', '#61a0a8', '#d48265', '#ffdb5c', '#91c7ae'];

	UI.control.remoteCall('face/dispatchedAlarm/alarmStatisticWeek', queryParams, function (resp) {
		resp = resp.DATA;

		var _length = resp.length;
		if (resp && _length) {
			var obj = {},
				formatter = '{b}时:<br>',
				data = [];
			for (var i = 0; i < _length; i++) {
				for (var key in resp[i]) {
					// switch (i) {
					// 	case 0:
					// 		resp[i][key] = ["2","2","2","2","2","3","4","4","4","5","6","7","7","7","7","8","8","10","10","12","20","20","20","20"];
					// 		break;
					// 	case 1:
					// 		resp[i][key] = ["1","4","3","4","4","4","4","4","4","5","6","7","7","7","7","8","8","10","10","20","22","20","20","20"];
					// 		break;
					// 	case 2:
					// 		resp[i][key] = ["5","6","3","4","4","4","4","4","4","5","6","7","10","7","7","8","8","10","10","20","20","20","20","24"];
					// 		break;
					// 	case 3:
					// 		resp[i][key] = ["2","3","3","4","4","3","4","4","4","5","6","7","7","7","17","8","8","10","10","20","27","20","20","20"];
					// 		break;
					// 	case 4:
					// 		resp[i][key] = ["8","5","3","9","4","4","4","4","4","5","6","7","7","7","7","28","8","10","10","20","20","20","20","20"];
					// 		break;
					// 	case 5:
					// 		resp[i][key] = ["6","7","3","4","4","4","4","4","4","5","16","7","7","7","7","28","8","10","10","20","21","20","20","20"];
					// 		break;
					// 	case 6:
					// 		resp[i][key] = ["0","1","3","4","4","4","4","7","4","5","6","7","7","7","7","8","8","10","10","20","20","20","20","20"];
					// 		break;
					// }
					obj = {
						name: key,
						type: 'line',
						data: resp[i][key],
						color: color[i],
						bgcolor: 'rgba(0,0,0,0)'
					};
				}
				seriesDatas.push(obj);
				data.push(key);

				formatter += '{a' + i + '}：{c' + i + '}次<br>';
			}

			var options = {
				yTitle: "次数",
				xTitle: "时间",
				axisLabelColor: '#999',
				titleColor: "#000",
				gridRight: '3%',
				formatter: formatter,
				rotate: 0
			}
			var lineOptions = getLineDrawOption(_xData, seriesDatas, options);
			lineOptions.yAxis.minInterval = '1';
			lineOptions.legend = {
				data: data,
				bottom: '0%',
				right: '0%'
			};

			drawCharts('drawView', lineOptions);
		} else {
			UI.util.alert("查询失败", "error");
		}
	});
}




function renderTagColor(text) {
	var tagClass = '';
	switch (text) {
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

function getDay(day) {
	var today = new Date();

	var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;

	today.setTime(targetday_milliseconds); //注意，这行是关键代码  

	var tYear = today.getFullYear();
	var tMonth = today.getMonth();
	var tDate = today.getDate();
	tMonth = doHandleMonth(tMonth + 1);
	tDate = doHandleMonth(tDate);
	return tDate;
}
function doHandleMonth(month) {
	var m = month;
	if (month.toString().length == 1) {
		m = "0" + month;
	}
	return m;
}

//显示使用算法和全部算法
function renderAlgo(algoObj){
	//var algoObj = {"80003":"60","10003":"80"};
	if(algoObj){
		var	algoList = global.algoNumSnList,
		html = '';
		
		for(var i=0;i<algoList.length;i++){
			var curAlgoId = algoList[i].ALGORITHM_ID;
			if(algoObj[curAlgoId]){
				html += '<span class="alg-tag-item active"><span>'+algoList[i].ALGORITHM_NAME+'</span><span class="alg-tag-score">'+algoObj[curAlgoId]+'</span></span>';
			}else{
				html += '<span class="alg-tag-item"><span>'+algoList[i].ALGORITHM_NAME+'</span></span>';
			}
		}
		return html;
	}
}
/*'yyyy-MM-dd HH:mm:ss'格式的字符串转日期*/

function stringToDate(str){

    var tempStrs = str.split("  ");

    var dateStrs = tempStrs[0].split("-");

    var year = parseInt(dateStrs[0], 10);

    var month = parseInt(dateStrs[1], 10) - 1;

    var day = parseInt(dateStrs[2], 10);

    var timeStrs = tempStrs[1].split(":");

    var hour = parseInt(timeStrs [0], 10);

    var minute = parseInt(timeStrs[1], 10);

    var second = parseInt(timeStrs[2], 10);

    var date = new Date(year, month, day, hour, minute, second);

    return date;

}