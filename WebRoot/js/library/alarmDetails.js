/**
 * @Author lyy
 * @version 2017-08-11
 * @description 报警详情;
 */

var level = UI.util.getUrlParam("level") || '';
var name = UI.util.getUrlParam("name") || '';
var idCard = UI.util.getUrlParam("idCard") || '';
var fstime = UI.util.getUrlParam("time") || '';
var isFly = UI.util.getUrlParam("isFly") || 0;
var OBJECT_ID = UI.util.getUrlParam("OBJECT_ID") || 0;
var curTime = UI.util.getUrlParam("curTime") || '';
var alarmTime = UI.util.getUrlParam("alarmTime") || '';
var isReceived = UI.util.getUrlParam("isReceived") || '';
var confirmArrest = false;
var IDENTITY_ID ="";
var switchBtn = UI.util.getUrlParam('switchBtn') || '';
var personId = null;
var picz= UI.util.getUrlParam("picz") || "";
var picb= UI.util.getUrlParam("picb") || "";
var score= UI.util.getUrlParam("score") || 0;
var queryParams = {
	'ALARM_ID': UI.util.getUrlParam("ALARM_ID") || ""
};
var confirmStatus = UI.util.getUrlParam('confirmStatus');
var pageType = UI.util.getUrlParam('pageType')||'';

var facesMaintain = true;

var curIsBlack = (top.projectID == "foreigners");

if(top.isBigScreen){
	$('head').append('<link rel="stylesheet" type="text/css" href="/efacecloud/css/library/alarmDetailsBigScreen.css" />')
}
var deviceId = UI.util.getUrlParam("deviceId") || '';
$(function () {
	UI.control.init();
	showSwitchBtn();
	initEvent();
	if(curIsBlack){
		 getAlgoID();
	}
	initData();
	setVideoTime();
});

function initEvent() {
	
	//初始多脸维护配置
	initConfigFaceMaintain();

	$('#historyVideo').attr({
		'deviceid': deviceId,
		'attr-time': alarmTime
	})
	domPermission();
	if (level == 100) {
		$('.btn-wrap').addClass('hide');
	} else {
		$('.btn-wrap').removeClass('hide');
	}
	//获取确认抓捕功能配置
	var configParam = { "applicationName": "efacesurveillance" };
	UI.control.remoteCall('platform/webapp/config/get', configParam, function (resp) {
		var jsonObj = resp.attrList;
		for (var i = 0; i < jsonObj.length; i++) {
			if (jsonObj[i].key == "IS_CONFIRMARREST" && jsonObj[i].value == "1") {
				confirmArrest = true;
			}
		}
	});
	if (level == '0' || level == '1' || level == '2') {
		$("#feedbackBtn").removeClass("hide");
		if (parent.$curAlarmCard) {
			if (parent.$curAlarmCard.attr("isReceived")) {
				$("#feedbackBtn").removeClass("disabled");
			}
		}
		if (isReceived) {
			$("#feedbackBtn").removeClass("disabled");
		}
	} else if (level == '3') {
		$("#receivedBtn").addClass("hide");
	}
	if ((level == '0' || level == '1') && confirmArrest == true) {
		$("#hasCatchBtn").removeClass("hide");
	}
	/*//过滤名单
	$("#filterBtn").click(function(){
		
	});*/

	//签收
	$("#receivedBtn").click(function () {
		UI.util.showLoadingPanel();
		var $this = $(this);

		var curParams = {
			ALARM_ID: queryParams.ALARM_ID,
			ALARM_TIME: curTime,
			HANDLE_RESULT: JSON.stringify({ SIGN: 1 }),
			OP_TYPE: 1,
			TASK_LEVEL: level
		}
		UI.control.remoteCall('defence/alarmHandleRecord/add?score='+score+'&picb='+picb+'&picz='+picz, curParams, function (resp) {
			if (resp.CODE == 0) {
				UI.util.alert("确认签收");
				$this.addClass('hide');
				$(".had-sign,#cancelControlBtn").removeClass('hide');
				isReceived = true;
				$("#feedbackBtn").removeClass("disabled");
			} else {
				UI.util.alert("签收失败", "warn");
			}
			UI.util.hideLoadingPanel();
		}, function () { }, { async: false }, true);
	});

	//反馈
	$("#feedbackBtn").click(function () {
		var $this = $(this);
		if ($this.hasClass("disabled") || !isReceived) {
			return false;
		}
		var opts = {
			src: '/efacecloud/page/alarm/realTimeAlarm/feedbackForm.html?score='+score+'&picb='+picb+'&picz='+picz+'&ALARM_ID=' + queryParams.ALARM_ID + '&ALARM_TIME=' + curTime + '&level=' + level + '&personId=' + personId ,
			title: '反馈',
			width: '450px',
			height: '430px',
			callback: function (data) {
				if (data) {
					$this.addClass('hide');
					$("#hasCatchBtn").addClass('hide');
				}
			}
		}
		parent.UI.util.openCommonWindow(opts);
	});
	
	//撤销
	$('#cancelControlBtn').click(function(){
		prompt();
	});
	
	//处置记录
	$("#recordBtn").click(function () {
		submitDispatchId(function (data) {
			top.LIST_DATA = data;
			var opts = {
				src: '/efacecloud/page/alarm/realTimeAlarm/receivedList.html?ALARM_ID=' + queryParams.ALARM_ID + '&ALARM_TIME=' + curTime + '&level=' + level,
				title: '处置记录',
				width: '550px',
				height: '500px'
			}
			parent.UI.util.openCommonWindow(opts);
		});
	});
	//最近7天告警频次
	$("body").on("click", "#frequentlyAlarm", function () {
		var options = {
			src: '/datadefence/page/multiDimensional/alarmFrequencyNew.html?OBJ_ID=' + UI.util.getUrlParam("OBJECT_ID") + '&beginTime=' + queryParams.BEGIN_TIME + '&endTime=' + queryParams.END_TIME,
			width: 450,
			title: '7天告警频次',
			windowType: 'right',
			parentFrame: 'currentPage'
		};
		parent.UI.util.openCommonWindow(options);
	});

	// 警情下发
	$("#issuedBtn").click(function () {
		var identityID = $('#identityID').text();
		var type = 1;
		var url = '/datadefence/page/mobileControl/emitAlarmForm.html?type=personAlarm&ALARM_ID=' + queryParams.ALARM_ID + '&LEVEL=' + level + '&IDENTITY_ID=' + identityID + '&TYPE=' + type +'&score='+score+"&picb="+picb+"&picz="+picz;
		UI.util.showCommonWindow(url, "警情下发", 850, 690, function (data) {
		});
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

	//检索
	$('body').on('click', '.searchBtnAll', function () {
		var imgurl = $(this).attr('fileUrl');
		var curSrc = matcher('/efacecloud/page/library/faceCaptureList.html/' + top.projectID).url;
		curSrc += "?imgSrc=" + imgurl + "&pageType=record";
		UI.util.showCommonWindow(curSrc, "路人检索", 1250, 650, function () { });
	});

	//轨迹分析
	$("body").on("click", ".trajectory-searchAll", function () {
		var time = {
			bT: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").bT,
			eT: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").eT
		};
		openWindowPopup('track', $(this).attr("url"), time);
	});

	//身份核查
	$("body").on("click", ".verification-search", function () {
		openWindowPopup('identity', $(this).attr("url"),"",$(this).attr("checkName"));
	});

	//结构化检索
	$("body").on("click", ".structuredSearch", function () {
		var imgSrc = $(this).attr("imgUrl");
		UI.util.showCommonWindow("/datadefence/page/retrieval/structuredSearch.html?imgSrc=" + imgSrc, "结构化检索", 1200, 700,
			function (resp) {
			});

	});
	//
	$("body").on("click", ".detailinfo", function () {
		UI.util.showCommonWindow("/efacecloud/page/detaildata.html?", "活动详情", 300, 200,
			function (resp) {
			});
	});

	//确认抓捕
	$("#hasCatchBtn").on("click", function () {
		var $this = $(this);
		if ($this.hasClass("active")) {
			return;
		}
		var opts = {
			src: '/efacecloud/page/alarm/realTimeAlarm/hasCatchForm.html?ALARM_ID=' + queryParams.ALARM_ID + '&ALARM_TIME=' + alarmTime + '&level=' + level + '&personId=' + personId,
			title: '确认抓捕',
			width: '450px',
			height: '430px',
			callback: function (data) {
				if (data) {
					$this.addClass('hide');
				}
			}
		}
		parent.UI.util.openCommonWindow(opts);
	});
	// 告警是否准确
	$('#alarmConfirmBtn').on('click', function() {
		var	curHtml =	'<div class="form-group mb5">'+
							'<label>告警是否准确：</label>'+
							'<label class="radio-inline p0 ml5"><input type="radio" name="IS_CORRECT" value="1" checked="checked">是</label>'+
							'<label class="radio-inline p0 ml5"><input type="radio" name="IS_CORRECT" value="0">否</label>';
			if(facesMaintain){
				curHtml += '<br/><label class="radio-inline p0 ml5"><input type="checkbox" name="TYPE_ADD" value="1"></label><label>添加多脸维护</label>';
			}
			curHtml += '</div>';

			var opts = {
				title : '告警确认',
				renderHtml: curHtml,
				okcallback: function(data){
					var params = {
                        ALARM_ID: UI.util.getUrlParam("ALARM_ID"),
                        CONFIRM_STATUS: data.IS_CORRECT,
                        TYPE_ADD: data.TYPE_ADD,
                        PERSON_ID: OBJECT_ID,
                        DB_ID: $('.alarm-wrag').attr('db-id'),
                        PIC: $('#detail_alarm_img').attr('src'),
                        IS_COVER: data.IS_CORRECT,
                        SOURCE_TYPE: 2
					};
					UI.control.remoteCall('face/dispatchedAlarm/alarmConfirm', params, function(resp){
						if (resp.CODE == '0') {
							UI.util.alert(resp.MESSAGE);
                            $("#alarmConfirmBtn").addClass("hide");
                            $("#confirm_status_line").removeClass("hide");
                            $("#confirm_status_label").html(renderConfirmStatus(data.IS_CORRECT));
						}else{
							UI.util.alert(resp.MESSAGE,"warn");
						}
					}, null, null,true);
					return true;
				},
				cancelcallback:function(){
				}
			}
			UI.util.prompt(opts);
			// top.$(".confirm-wrapper").css({"min-width":"500px","margin-left":"-250px"});		
	});
	switchAlarmDetail();
}

function initData() {
	var time = renderNearWeek(curTime);
	queryParams.BEGIN_TIME = time.bT;
	queryParams.END_TIME = time.eT;
	queryParams.OBJECT_ID = OBJECT_ID;
	if(confirmStatus) {
		queryParams.CONFIRM_STATUS = 1;
	}
	UI.control.remoteCall('face/dispatchedAlarm/detail', queryParams, function (resp) {
		var data = resp.DATA;
		//var data = alarmData.DATA;
		personId = data.PERSON_ID || '';
		IDENTITY_ID = data.IDENTITY_ID || '';
		data.FS_NAME = name;
		data.FS_IDENTITY_ID = idCard;
		data.FS_HIT_TIME = fstime;
		if (JSON.parse(data.OBJECT_EXTEND_INFO).MUTIL_ALGO_CHECK && JSON.parse(data.OBJECT_EXTEND_INFO).MUTIL_ALGO_CHECK['00001'] && JSON.parse(data.OBJECT_EXTEND_INFO).MUTIL_ALGO_CHECK['00001'].FS_COMPARELIST) {
			data.FS_ALGO_LIST = JSON.parse(data.OBJECT_EXTEND_INFO).MUTIL_ALGO_CHECK['00001'].FS_COMPARELIST;
		} else {
			data.FS_ALGO_LIST = [];
		}
		if (isFly == 1) {
			data.isFly = isFly;
		}
		data.LEVEL = level;
		OBJECT_ID=data.IDENTITY_ID;
		$("#alarmDetailsList").append(tmpl("alarmDetailsTemplate", data));
		if (data.IS_SIGN_IN) {
			$("#receivedBtn").addClass("hide");
			$(".had-sign").removeClass('hide');
			$("#feedbackBtn").removeClass("disabled");
			if(curIsBlack && (data.APPROVE_STATUS==4||data.APPROVE_STATUS==7||data.APPROVE_STATUS==8)){
				$("#cancelControlBtn").removeClass("hide");
			}
			isReceived = true;
		}
		/*if(data.IS_CALLBACK){
			$("#feedbackBtn").addClass("hide");
		}else{*/
		if (!data.IS_CALLBACK) {
			if (isReceived) {
				$("#feedbackBtn").removeClass("disabled");
			} else {
				$("#feedbackBtn").addClass("disabled");
			}
		} else {
			$("#feedbackBtn").addClass("hide");
			$("#hasCatchBtn").addClass("hide");
		}
		if (!data.CONFIRM_STATUS) {
			$("#alarmConfirmBtn").removeClass("hide");
		}
	});
	if(curIsBlack){
		UI.control.remoteCall('facestore/getBorderExitAndEntryTime', {PERSON_ID:personId,IDENTITY_ID:IDENTITY_ID}, function (resp) {
			if(resp.CODE == 0){
				$('#effectiveDate').html(resp.DATA.STAY_TIME_TO);
			}
		});
	}
	setBtnState();
}

/**
 * @author yangzonghong
 * @version 2019-05-07
 * 显示前一个、后一个或两个切换告警详情按钮
 */
function showSwitchBtn() {
	switch (switchBtn) {
		case 'prev':
			$('.switch-detail.prev-detail').removeClass('hide');
			break;
		case 'next':
			$('.switch-detail.next-detail').removeClass('hide');
			break;
		case 'both':
			$('.switch-detail.prev-detail').removeClass('hide');
			$('.switch-detail.next-detail').removeClass('hide');
			break;
	}
}

/**
 * @author yangzonghong
 * @version 2019-05-07
 * 切换告警详情的方法
 */
function switchAlarmDetail() {
	$('.switch-detail').on('click', function () {
		// 从top.globalCache获取当前的告警详情索引及各个详情的query参数
		var switchAlarmDetail = top.globalCache.switchAlarmDetail || {},
			curIndex = switchAlarmDetail.showIndex || 0,
			series = switchAlarmDetail.series || [];
		var query = '';

		if ($(this).hasClass('prev-detail')) { // 前一个详情
			query = series[curIndex - 1];
			// 重置详情索引
			top.globalCache.switchAlarmDetail.showIndex = curIndex - 1;
			if (series.length != 1) {
				if (curIndex - 1 == 0) {
					query += '&switchBtn=next';
				} else {
					query += '&switchBtn=both';
				}
			}
		} else { // 后一个详情
			query = series[curIndex + 1];
			// 重置详情索引
			top.globalCache.switchAlarmDetail.showIndex = curIndex + 1;
			if (curIndex + 1 == series.length - 1) {
				query += '&switchBtn=prev';
			} else {
				query += '&switchBtn=both';
			}
		}
		window.location.href = '/efacecloud/page/library/alarmDetails.html' + query;
	});
}

/**
 * 渲染性别
 * @param {String} sexCode : 性别编码
 * @author：lyy
 */
function renderPersonSex(sexCode) {
	if (sexCode == 1) {
		return "男";
	} else if (sexCode == 2) {
		return "女";
	} else {
		return "未知";
	}
}

/**
 * 最近7天(从当天开始)
 * @author：fenghuixia
 */
function renderNearWeek(time) {
	if (time) {
		time = new Date(Date.parse(time.replace(/-/g, "/")));
		var curTime = new Date(time);
	} else {
		var curTime = new Date();
	}
	var curTimeBT = '', curTimeBT = '';

	curTimeET = dateFormat(curTime, 'yyyy-MM-dd 23:59:59');
	curTimeBT = curTime.setDate(curTime.getDate() - 6);
	curTimeBT = dateFormat(curTimeBT, 'yyyy-MM-dd 00:00:00');
	return {
		eT: curTimeET, bT: curTimeBT
	};
}

function submitDispatchId(callback) {
	var params = {};
	params.TASK_ID = $('#alarmDetailsList .alarm-wrag').attr('dispatch-id');
	UI.control.remoteCall('face/faceScheduling/getDetailsAndRecordLists', params, function (resp) {
		if (resp.CODE == 0) {
			callback ? callback(resp.DATA.RECORD) : function () { };
		}
	});
}

/**
 * 渲染确认状态
 */
function renderConfirmStatus(status) {
	if (status == '1') {
		return "准确"
	}
	if (status == '0') {
		return "不准确"
	}
	return ''
}

//配置视频播放时长
function setVideoTime() {
	var map={"applicationName":"efacesurveillance"};
	UI.control.remoteCall('platform/webapp/config/get', map, function(resp) {
		var viewHistoryVideo = new ViewHistoryVideo();
		var data = resp.attrList,
			time = 10; //默认十秒
		for(var i=0; i<data.length; i++) {
			if(data[i].key == "VIDEO_INFO"){
				time = parseInt(data[i].value);
				break;
			}
		}
		viewHistoryVideo.init(time*1000);
	});
}

//查看视频
function ViewHistoryVideo () {};
ViewHistoryVideo.prototype = {
	init: function (timeCount) {
		var _self = this;
		$("body").on("click", ".historyVideo", function (e) {
			var e = e || window.event;
			var alarmTime = $(this).attr('attr-time');
			var time = _self.getDate(alarmTime).getTime();//获取当前时间戳
			var timeC = timeCount?timeCount:3*60*1000;
			var beginTime = _self.getLocalTime(time-timeC);
			var endTime = _self.getLocalTime(time+timeC);
			var deviceId = $(this).attr("deviceid");
			UI.util.showCommonWindow('/datadefence/page/multiDimensional/historyCamera.html?beginTime='+beginTime+'&endTime='+endTime+'&DEVICE_ID='+deviceId+ '&score='+score+'&picb='+picb+'&picz='+picz, '查看视频', 958, 590,function(){});
			if(e) e.stopPropagation();
		});
	},
	//字符串转时间
	getDate: function (strDate){
		var date = eval('new Date(' + strDate.replace(/\d+(?=-[^-]+$)/, 
		function (a) { return parseInt(a, 10) - 1; }).match(/\d+/g) + ')');
		return date;
	},
	//时间戳转时间
	addZero: function(m){return m<10?'0'+m:m },
	getLocalTime: function (nS){
		//nS是整数，否则要parseInt转换
		var time = new Date(nS);
		var y = time.getFullYear();
		var m = time.getMonth()+1;
		var d = time.getDate();
		var h = time.getHours();
		var mm = time.getMinutes();
		var s = time.getSeconds();
		return y+'-'+this.addZero(m)+'-'+this.addZero(d)+' '+this.addZero(h)+':'+this.addZero(mm)+':'+this.addZero(s);
	}
}

function initConfigFaceMaintain(){
	var map = {"applicationName": "efacecloud"};
	UI.control.remoteCall('platform/webapp/config/get', map, function (resp) {
		var jsonObj = resp.attrList;
		for (var i = 0; i < jsonObj.length; i++) {
			if (jsonObj[i].key == "FACE_MAINTAIN" && jsonObj[i].value == '0') {
				facesMaintain = false;
			}
		}
	});
}

//撤控
function prompt(){
	var curHtml = '<div class="form-group">'+
					'<label style="vertical-align:top;">审批人：</label>'+
					'<div class="form-control w80 withdrawalApprover" style="margin-left:13px;" type="5"></div>'+
					'<input type="hidden" name="APPROVE_USER" ui-validate="required" ui-vtext="撤控审批人">'+
					'<span class="red ml10">*</span>'+
				'</div>';
	curHtml += '<div class="form-group">'+
					'<label class="tr" style="width:70px;vertical-align:top;display:inline-block;">备注：</label>'+
					'<textarea class="form-control w80" style="height:70px;vertical-align:top;" name="PROCESS_REMARK" ui-validate="{pattern:&quot;required&quot;,maxlength:500}" placeholder="备注" ui-vtext="备注"></textarea>'+
					'<span class="red ml10">*</span>'+
					'</div>';
	
	var opts = {
            title :'撤控信息 ',
            renderHtml:curHtml,
            okcallback:function(data){
            	var serviceUrl = 'face/dispatchedApprove/withdrawThenAddFaceSchedulingTask';
				var formData = {
						'DB_ID': $('.alarm-wrag').attr('db-id'),
						'APPROVE_USER':data.APPROVE_USER,
						'PERSON_ID':personId,
						'REMARK':data.PROCESS_REMARK,
						'IDENTITY_ID':IDENTITY_ID,
						'ALARM_ID':queryParams.ALARM_ID
				}
				
				UI.util.showLoadingPanel();
				UI.control.remoteCall(serviceUrl, formData, function(resp){
					if (resp.CODE == 0) {
						UI.util.alert(resp.MESSAGE);
						$('#cancelControlBtn').addClass('hide');
					}else{
						UI.util.alert(resp.MESSAGE,"warn");
					}
					UI.util.hideLoadingPanel();
				},function(){},{},true);
				return true;
            },
            cancelcallback:function(){
            	
            }
        }
    UI.util.prompt(opts);
	top.$(".confirm-wrapper").css({"min-width":"550px","margin-left":"-275px"});
	
	//添加布控审核人
	//添加布控审核人
	top.$(".confirm-wrapper").find(".withdrawalAudit,.withdrawalApprover").click(function(){
		var $this = $(this);
		if($this.attr("disabled")){
			return false;
		}
		openCommonWindow($this);
		top.$('.notify-wrapper').next(".window-overlay").css({"z-index":"10000"});
	});
}

function openCommonWindow($this){
	var userCode = $this.next().val();
	var userName = $this.attr("username");
	var phone = $this.attr("phone");
	var deptCode = $this.attr("deptcode");
	if(userCode!=''){
		var obj = {
				userCodeArr:userCode.split(","),
				userNameArr:userName.split(","),
				deptCodeArr:deptCode.split(","),
				phoneArr:phone.split(",")
		}
	}else{
		var obj = '';
	}
	var params = {
			src:"/efacesurveillance/page/faceControl/dispatchedApproval/auditorList.html?approveType="+$this.attr("type")+"&dataObj="+JSON.stringify(obj),
			width:800,
			height:500,
			title:$this.prev().html(),
			callback:function(data){
				var str = '';
				var userNameArr = data.userName.split(",");
				var userCodeArr = data.userCode.split(",");
				var phoneArr = data.phone.split(",");
				$.each(userNameArr,function(i,n){
					str += n+'('+userCodeArr[i]+')-'+phoneArr[i];
					if(i < userNameArr.length-1 ){
						str += ",";
					}
				});
				$this.text(str);
				$this.attr("title",str);
				$this.attr("username",data.userName);
				$this.attr("phone",data.phone);
				$this.attr("deptcode",data.deptCode);
				$this.next().val(data.userCode);
			}
	};
	UI.util.openCommonWindow(params);
}

function renderItemToggle(){
	if(pageType == 'sanfei'){
		return 'hide';
	}
}

function renderMark(data,type){
	if(data.THIRDIMPL_HIT == 1 && data.THIRDIMPL_1vN == 1 && isBlack){
		if(type=='mark'){
			return 'fly-bg-wjr';
		}
		if(type=='mark-layer'){
			return 'alarm-img-three';
		}
		if(type == 'similar'){
			return 'similar-compare';
		}
		if(type == 'attrimg'){
			return 'threezoom';
		}
	}else{
		if(type == 'similar'){
			return 'hide';
		}
		if(type == 'attrimg'){
			return 'doublezoom';
		}
	}
}

//获取算法
function getAlgoID() {
	window.getAlgoList = slideFn('face/common/getFaceAlgoType', { MENUID: 'EFACE_faceCapture' },function(data){
		global.algoNumSnList = data;
	});
}

function renderAlgo(algoId){
	if(algoId){
		var	algoList = global.algoNumSnList;
		
		for(var i=0;i<algoList.length;i++){
			var curAlgoId = algoList[i].ALGORITHM_ID;
			if(curAlgoId == algoId){
				return algoList[i].ALGORITHM_NAME;
			}
		}
	}
}
//根据配置项设置按钮状态
function setBtnState(){
	var btnStateConfig = getConfigValue({model:"efacecloud",keys:["ALARM_DETAILS_BUTTON_CONFIG"]})["ALARM_DETAILS_BUTTON_CONFIG"].split(",");
	for(var i=0;i<btnStateConfig.length;i++){
		if(btnStateConfig[i]==0){
			$(".alarmBtn"+i).addClass("hide");
		}
	}
}
//var alarmData = {"MESSAGE":"查询成功","CODE":0,"DATA":{"DEPT_NAME":"组织架构","SCORE":96,"RECENT_COUNT":1,"SEX":"1","DB_NAME":"三非人员","ALGO_LIST":[{"SCORE":"96%","ALGORITHM_NAME":"华云","ALGORITHM_TYPE":"0","ALGORITHM_DESC":"华云特征提取算法","ENABLED":1,"ALGORITHM_KIND":0,"CREATE_TIME":"2019-04-10 18:42:37.0","ALGORITHM_ID":"80003","SCORE_RATE":"1.00"}],"ALARM_IMG":"http://68.32.176.14:8088/g2/M00/00012001/20190830/RCCwDl1ouMeIEc7EAADUWYrviQcAHGTEgPNyDYAANRx553.jpg","IDENTITY_ID":"15AH27107","OBJECT_ID":"416255239537656576","CASE_ID":"","FRAME_IMG":"http://68.32.176.14:8088/g2/M00/00013001/20190830/RCCwDl1ouMeID2XJAAI9qk5QKeQAHGTngAyxqMAAj3C505.jpg","OBJECT_EXTEND_INFO":"{\"FEISHI_TYPE\":\"0\",\"IS_TEMP\":0,\"MULIT_ALGO_ALARM_RESULT\":{\"80003\":\"96\",\"113001\":\"98\"},\"SEX\":\"1\",\"THRESHOLD_DB\":80,\"IS_FEISHI\":0,\"IS_ARCHIVE\":0,\"FACE_QUALITY_LIST\":[],\"DEVICE_NAME\":\"金麓山庄东1门人行道上\",\"POLICE_STATION_INFO\":{\"IS_SHOW\":\"0\"},\"INFO_ID\":\"484721166230047168\",\"ALARM_FILTER_FLAG\":\"1\",\"IS_COVER\":1,\"NAME\":\"CISSE ABDALLAH\",\"IDENTITY_ID\":\"15AH27107\",\"DEVICE_ADDRESS\":\"金麓山庄东1门人行道上\",\"CAPTURE_TIME\":\"2019-08-30 13:45:10\",\"IS_THIRDIMPL\":1}","ALARM_LEVEL":0,"DB_ID":"1d36989c16f64a97a0c2d64ef928cf11","ALGO_TYPE":"80003","POLICE_TASK_ID":[],"ORG_NAME":"越秀区分局登峰派出所","TEMPLET_IMG":"http://68.26.12.12:8088/g1/M01/0000000A/00000013/RBoMDFxvpLCAfMP5AACHpxsdiuY187.png","IS_SIGN_IN":false,"USER_NAME":"系统管理员","CHECK_ALGO_LIST":[],"DEVICE_ADDR":"金麓山庄东1门人行道上","NAME":"CISSE ABDALLAH","ALARM_TIME":"2019-08-30 13:48:58.0","PERSON_ID":"416255239537656577","ORG_CODE":"44010474","IS_CALLBACK":false,"DEVICE_ID":"44010474001320000004","CONFIRM_STATUS":""}}