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

var switchBtn = UI.util.getUrlParam('switchBtn') || '';
var personId = null;
var queryParams = {
	'ALARM_ID':UI.util.getUrlParam("ALARM_ID")||""
};

$(function(){
	UI.control.init();
	showSwitchBtn();
	initEvent();
	initData();
});

function initEvent(){
	
	//获取确认抓捕功能配置
	var configParam ={"applicationName":"efacesurveillance"};
	UI.control.remoteCall('platform/webapp/config/get', configParam, function(resp) {
		var jsonObj = resp.attrList;
		for(var i=0;i<jsonObj.length;i++){
			if(jsonObj[i].key=="IS_CONFIRMARREST"&&jsonObj[i].value=="1"){
				confirmArrest = true;
			}
		}
	}); 
	
	if(level == '0'||level == '1'||level == '2'){
		$("#feedbackBtn").removeClass("hide");
		if(parent.$curAlarmCard){
			if(parent.$curAlarmCard.attr("isReceived")){
				$("#feedbackBtn").removeClass("disabled");
			}
		}
		if(isReceived){
			$("#feedbackBtn").removeClass("disabled");
		}
	}else if(level=='3'){
		$("#receivedBtn").addClass("hide");
	}
	
	if((level == '0' || level == '1') && confirmArrest == true){
		$("#hasCatchBtn").removeClass("hide");
	}
	
	/*//过滤名单
	$("#filterBtn").click(function(){
		
	});*/
	
	//签收
	$("#receivedBtn").click(function(){
		UI.util.showLoadingPanel();
		var $this = $(this);
		var curParams = {
				ALARM_ID: queryParams.ALARM_ID,
				ALARM_TIME: curTime,
				HANDLE_RESULT: JSON.stringify({SIGN:1}),
				OP_TYPE:1,
				TASK_LEVEL:level
		}
		UI.control.remoteCall('defence/alarmHandleRecord/add', curParams, function(resp){
			if(resp.CODE == 0){
				UI.util.alert("确认签收");
				$this.addClass('hide');
				isReceived = true;
				$("#feedbackBtn").removeClass("disabled");
			}else{
				UI.util.alert("签收失败","warn");
			} 
			UI.util.hideLoadingPanel();
		}, function(){}, {async: false }, true);
	});
	
	//反馈
	$("#feedbackBtn").click(function(){
		var $this = $(this);
		if($this.hasClass("disabled")||!isReceived){
			return false;
		}
		var opts = {
				src: '/efacecloud/page/alarm/realTimeAlarm/feedbackForm.html?ALARM_ID='+queryParams.ALARM_ID+'&ALARM_TIME='+curTime+'&level='+level+'&personId='+personId,
				title: '反馈',
				width:'450px',
				height:'430px',
				callback:function(data){
					if(data){
						$this.addClass('hide');
					}
				}
		}
		parent.UI.util.openCommonWindow(opts);
	});
	
	//处置记录
	$("#recordBtn").click(function(){
		var opts = {
				src: '/efacecloud/page/alarm/realTimeAlarm/receivedList.html?ALARM_ID='+queryParams.ALARM_ID+'&ALARM_TIME='+curTime+'&level='+level,
				title: '处置记录',
				width:'550px',
				height:'500px'
		}
		parent.UI.util.openCommonWindow(opts);
	});
	//最近7天告警频次
	$("body").on("click","#frequentlyAlarm",function(){
		var options = {
				src: '/datadefence/page/multiDimensional/alarmFrequencyNew.html?OBJ_ID='+OBJECT_ID+'&beginTime='+queryParams.BEGIN_TIME+'&endTime='+queryParams.END_TIME,
	            width: 450,
	            title: '7天告警频次',
	            windowType: 'right',
	            parentFrame: 'currentPage'
	        };
			parent.UI.util.openCommonWindow(options);
	});
	
	// 警情下发
	$("#issuedBtn").click(function(){
		var identityID = $('#identityID').text();
		var type = 1;
		var url = '/datadefence/page/mobileControl/emitAlarmForm.html?type=personAlarm&ALARM_ID=' + queryParams.ALARM_ID + '&IDENTITY_ID=' + identityID + '&TYPE=' + type;
		UI.util.showCommonWindow(url, "警情下发", 850, 690, function(data){
		});
	});
	
	//布控详情
	$('body').on('click', '.controlDetailBtn', function() {
		var objId = $(this).attr("objectid");
		var opts = {
				src: '/efacesurveillance/page/faceControl/dispatchedApproval/controlApplyForm.html?pageTitle=布控详情&pageType=detail&funcType=6&objectId='+objId+'&noFooter='+true,
				title: '布控详情',
				width:$(top.window).width()*.95,
				height: $(top.window).height()*.9
		}
		parent.UI.util.openCommonWindow(opts);
	});
	
	//检索
	$('body').on('click', '.searchBtnAll', function() {
		var imgurl = $(this).attr('fileUrl');
		var curSrc = matcher('/efacecloud/page/library/faceCaptureList.html/' + top.projectID).url;
		curSrc += "?imgSrc=" + imgurl + "&pageType=record";
		UI.util.showCommonWindow(curSrc, "路人检索", 1250, 650, function() {});
	});
	
	//轨迹分析
	$("body").on("click", ".trajectory-searchAll", function() {
		var time = {
	        	bT: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").bT,
	        	eT: UI.util.getDateTime("today", "yyyy-MM-dd HH:mm:ss").eT
	        };
		openWindowPopup('track', $(this).attr("url"),time);
	});

	//身份核查
	$("body").on("click", ".verification-search", function() {
		openWindowPopup('identity', $(this).attr("url"));
	});
	
	//结构化检索
	$("body").on("click",".structuredSearch",function(){
		var imgSrc = $(this).attr("imgUrl");
		UI.util.showCommonWindow("/datadefence/page/retrieval/structuredSearch.html?imgSrc="+imgSrc,"结构化检索", 1200, 700,
	      		function(resp){
	      	});
	})

	//确认抓捕
	$("#hasCatchBtn").on("click", function () {
		var $this = $(this);
		if ($this.hasClass("active")) {
			return;
		}
		var opts = {
			src: '/efacecloud/page/alarm/realTimeAlarm/hasCatchForm.html?ALARM_ID='+queryParams.ALARM_ID+'&ALARM_TIME='+alarmTime+'&level='+level+'&personId='+personId,
			title: '确认抓捕',
			width:'450px',
			height:'430px',
			callback:function(data){
				if(data){
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
							'<label class="radio-inline p0 ml5"><input type="radio" name="IS_CORRECT" value="0">否</label>'+
							'<br/><label class="radio-inline p0 ml5"><input type="checkbox" name="TYPE_ADD" value="1"></label><label>添加多脸维护</label>'+
						'</div>';

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

function initData(){
	var time = renderNearWeek(curTime);
	queryParams.BEGIN_TIME = time.bT;
	queryParams.END_TIME = time.eT;
	queryParams.OBJECT_ID = OBJECT_ID;
	UI.control.remoteCall('face/dispatchedAlarm/detail',queryParams, function(resp){
		var data = resp.DATA;
		personId = data.PERSON_ID||'';
		data.FS_NAME = name;
		data.FS_IDENTITY_ID = idCard;
		data.FS_HIT_TIME = fstime;
		if(JSON.parse(data.OBJECT_EXTEND_INFO).MUTIL_ALGO_CHECK && JSON.parse(data.OBJECT_EXTEND_INFO).MUTIL_ALGO_CHECK['00001'] && JSON.parse(data.OBJECT_EXTEND_INFO).MUTIL_ALGO_CHECK['00001'].FS_COMPARELIST){
			data.FS_ALGO_LIST = JSON.parse(data.OBJECT_EXTEND_INFO).MUTIL_ALGO_CHECK['00001'].FS_COMPARELIST;
		}else{
			data.FS_ALGO_LIST = [];
		}
		if(isFly == 1){
			data.isFly = isFly;
		}
		data.LEVEL = level;
		$("#alarmDetailsList").append(tmpl("alarmDetailsTemplate", data));
		if(data.IS_SIGN_IN){
			$("#receivedBtn").addClass("hide");
			$("#feedbackBtn").removeClass("disabled");
			isReceived = true;
		}
		/*if(data.IS_CALLBACK){
			$("#feedbackBtn").addClass("hide");
		}else{*/
		if(!data.IS_CALLBACK){
			if(isReceived){
				$("#feedbackBtn").removeClass("disabled");
			}else{
				$("#feedbackBtn").addClass("disabled");
			}
		}else{
			$("#feedbackBtn").addClass("hide");
			$("#hasCatchBtn").addClass("hide");
		}

		if(!data.CONFIRM_STATUS){
            $("#alarmConfirmBtn").removeClass("hide");
		}
	});
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
	$('.switch-detail').on('click', function() {
		// 从top.globalCache获取当前的告警详情索引及各个详情的query参数
		var switchAlarmDetail = top.globalCache.switchAlarmDetail || {},
			curIndex = switchAlarmDetail.showIndex || 0,
			series = switchAlarmDetail.series || [];
		var query = '';

		if($(this).hasClass('prev-detail')) { // 前一个详情
			query = series[curIndex - 1];
			// 重置详情索引
			top.globalCache.switchAlarmDetail.showIndex = curIndex - 1;
			if(series.length != 1) {
				if(curIndex - 1 == 0) {
					query += '&switchBtn=next';
				} else {
					query += '&switchBtn=both';
				}
			}
		} else { // 后一个详情
			query = series[curIndex + 1];
			// 重置详情索引
			top.globalCache.switchAlarmDetail.showIndex = curIndex + 1;
			if(curIndex + 1 == series.length - 1) {
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
function renderPersonSex(sexCode){
	if(sexCode == 1){
		return "男";
	}else if(sexCode == 2){
		return "女";
	}else{
		return "未知";
	}
}

/**
 * 最近7天(从当天开始)
 * @author：fenghuixia
 */
function renderNearWeek(time){
	if(time){
		time = new Date(Date.parse(time.replace(/-/g,  "/")));
		var curTime = new Date(time);
	}else{
		var curTime = new Date();
	}
	var curTimeBT = '', curTimeBT = '';
	
	curTimeET = dateFormat(curTime,'yyyy-MM-dd 23:59:59');
	curTimeBT = curTime.setDate(curTime.getDate() - 6);
	curTimeBT = dateFormat(curTimeBT,'yyyy-MM-dd 00:00:00');
	return {
		eT : curTimeET, bT : curTimeBT
	};
}

/**
 * 渲染确认状态
 */
function renderConfirmStatus(status){
	if(status == '1'){
		return "准确"
	}
    if(status == '0'){
        return "不准确"
    }
	return ''
}
