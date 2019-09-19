var dateTime = renderNearWeek();
var getDataByParent = UI.util.getUrlParam("getDataByParent");
var faceRect = "";
var params = {
	ALARM_ID:   UI.util.getUrlParam("ALARM_ID"),
	TASK_TYPE:  UI.util.getUrlParam("TASK_TYPE"),
	OBJECT_ID:  UI.util.getUrlParam("OBJ_ID"),
	BEGIN_TIME: dateTime.bT,
	END_TIME:   dateTime.eT
}
$(function(){
	UI.control.init();
	initData();
	initEvent();
});
function initData(){
	if(getDataByParent){
		var data =  {
			ALARM_IMG:   UI.util.getUrlParam("ALARM_IMG"),
			TEMPLET_IMG:  UI.util.getUrlParam("OBJECT_PICTURE"),
			FRAME_IMG:  UI.util.getUrlParam("FRAME_IMG"),
			
			DEVICE_ID:   UI.util.getUrlParam("DEVICE_ID"),
			ALARM_TIME:  UI.util.getUrlParam("ALARM_TIME"),
			DEVICE_ADDR:  UI.util.getUrlParam("DEVICE_NAME"),
						
			NAME:   UI.util.getUrlParam("PERSON_NAME"),
			SEX:  UI.util.getUrlParam("PERSON_SEX"),
			IDENTITY_ID:  UI.util.getUrlParam("IDENTITY_ID"),
						
			DB_NAME:   UI.util.getUrlParam("DB_NAME"),
			DEVICE_NAME:  UI.util.getUrlParam("DEVICE_NAME"),
			ALARM_FACE_RECT: UI.util.getUrlParam("FACE_RECT")

		};	
		faceRect = UI.util.getUrlParam("FACE_RECT");
	}else{
		var data = {};
		UI.control.remoteCall("face/dispatchedAlarm/detail",params,function(resp){
			if(resp.CODE==0){
				data = resp.DATA;	
				faceRect = data.ALARM_FACE_RECT;			
			}			
		})
	}

	$("#tempData").append(tmpl("sceneTemplate", data)); 
}
function initEvent(){
	$(".zoomFramePic").click(function(){
		var framePic = $(this).attr("zoomPic");
		top.UI.util.openWindow('/efacecloud/page/realAlarmMinitor/showImg.html?imgSrc=' + framePic + "&ALARM_FACE_RECT=" + faceRect, '查看全景', $(top.window).width()*.95, $(top.window).height()*.9);
		
	})
	$("body").on("click",".playVideo",function(){
		var alarmTime = $(this).attr('attr-time');
		var time = getDate(alarmTime).getTime();//获取当前时间戳
		var beginTime = getLocalTime(time-15*1000);
		var endTime = getLocalTime(time+15*1000);
		var deviceId = $(this).attr("deviceid");
		
		top.UI.util.openWindow('/datadefence/page/multiDimensional/historyCamera.html?beginTime='+beginTime+'&endTime='+endTime+'&DEVICE_ID='+deviceId, '查看视频', 958, 500);
		
	});
}

//字符串转时间
function getDate(strDate){
	var date = eval('new Date(' + strDate.replace(/\d+(?=-[^-]+$)/, 
   function (a) { return parseInt(a, 10) - 1; }).match(/\d+/g) + ')');
	return date;
}

//时间戳转时间
function addZero(m){return m<10?'0'+m:m }
function getLocalTime(nS)
{
	//nS是整数，否则要parseInt转换
	var time = new Date(nS);
	var y = time.getFullYear();
	var m = time.getMonth()+1;
	var d = time.getDate();
	var h = time.getHours();
	var mm = time.getMinutes();
	var s = time.getSeconds();
	return y+'-'+addZero(m)+'-'+addZero(d)+' '+addZero(h)+':'+addZero(mm)+':'+addZero(s);
}   
//最近7天(从当天开始)
function renderNearWeek(){
	var curTime = new Date(), curTimeBT = '', curTimeBT = '';
	
	curTimeET = dateFormat(curTime,'yyyy-MM-dd 23:59:59');
	curTimeBT = curTime.setDate(curTime.getDate() - 6);
	curTimeBT = dateFormat(curTimeBT,'yyyy-MM-dd 00:00:00');
	return {
		eT : curTimeET, bT : curTimeBT
	};
}
/*render性别*/
function renderSex(sexCode){
	if(isNaN(parseInt(sexCode))){
		return sexCode;
	}
	if(sexCode == 1) {
		return "男";
	} else if(sexCode == 2) {
		return "女";
	} else {
		return "未知";
	}	
}

