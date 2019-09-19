var type = UI.util.getUrlParam("type")||'';
var trackData = null;

$(document).ready(function(){
	initEvents();
	initData();
})

function initData(){
	if(top.isShowTrajectory){
		var data = top.getTrajectoryData();
		showTracksOnMap(data);
	}else{
		var data = parent.parent.trackArr;
	}
	$("#faceList").html(tmpl('faceListTmpl',data));
}

function initEvents(){
	if(type == 'faceTrack'){
		$(".button-group").addClass("hide");
		$(".livtview-list-wrap").css("top","46px");
	}
	
	//返回
	$('#backBtn').click(function(){
		parent.parent.UI.util.hideCommonIframe('.frame-form-full');
		/*if(top.isShowTrajectory){
			parent.parent.UI.util.hideCommonIframe('.frame-form-full');
			top.isShowTrajectory = false;
		}else{
			parent.clearMapTracks();
			parent.hideLeftResult();
			parent.rightMainFrameIn('','show');
		}*/
	});
	
	///列表点击事件
	$('body').on('click','#faceList li',function(){
		$(this).addClass('active').siblings().removeClass('active');
		var x = $(this).attr("x");
		var y = $(this).attr("y");
		var url = $(this).attr("obj_pic");
		var title = $(this).attr("name");
		var time = $(this).attr("time");
		//parent.showDetailOnMap(title,url,x,y,time);
		if(x && y){
			if(parent.routeControl){
				parent.routeControl.showNodePopup($(this).index());//根据ID显示气泡
			}
		}
		else{
			UI.util.alert("缺失坐标,无法定位","warn");
		}
	});

	$('body').on('click','#relationList li',function(){
		$('#relationList li').removeClass('active');
		$(this).addClass('active');
		var data = {};
		data.title = $(this).find('.childen-select').attr(selType);
		data.time = $(this).find('.childen-select').attr("time");
		data.x = 0;
		data.y = 0;
		data.name = "";
		data.url = "";
		var deviceId = $(this).find('.childen-select').attr("deviceId");
		if(deviceInfo[deviceId]){
			data.x = deviceInfo[deviceId].LONGITUDE;
			data.y = deviceInfo[deviceId].LATITUDE;
			data.name = deviceInfo[deviceId].DEVICE_ADDR;
		}
		showTarcksDialog(data);
	});
	
	$('#relativeMACbtn').click(function(){
		var checkQuery = top.window.frames['mainContent'].getOptionIdsParam('wifideviceids');
		if(checkQuery!=''){
			queryParam(checkQuery, 'MAC');
		}
		$('#relatListWrap').show();
	});
	
	$('#relativeDOORbtn').click(function(){
		var checkQuery = top.window.frames['mainContent'].getOptionIdsParam('doordeviceids');
		if(checkQuery!=''){
			queryParam(checkQuery, 'DOOR');
		}
		$('#relatListWrap').show();
	});
	
	$('#relativeIMEIbtn').click(function(){
		var checkQuery = top.window.frames['mainContent'].getOptionIdsParam('efencedeviceids');
		if(checkQuery!=''){
			queryParam(checkQuery, 'IMEI');
		}
		$('#relatListWrap').show();
	});
	
	$('#relativeIMSIbtn').click(function(){
		var checkQuery = top.window.frames['mainContent'].getOptionIdsParam('efencedeviceids');
		if(checkQuery!=''){
			queryParam(checkQuery, 'IMSI');
		}
		$('#relatListWrap').show();
	});
	
	//关联关系-返回
	$('#collisionBackBtn').click(function(){
		$('#relatListWrap').hide();
	});
}

function showTarcksDialog(data){
	var map = parent.parent.SuntekMap.getMap();
	map.openInfoWindow(
		{ x:data.x, y:data.y },	// 点线面的esriJSON格式
		{ txmc1:data.url, name:data.name, jgsj:data.time },	// 气泡属性，如摄像机名称,ID等，也可以传null
		{
			frameTitle:data.title, // 气泡标题
			frameSrc:"/efacecloud/page/technicalStation/macInfo.html" // 气泡内容URL地址，可以是html,jpg,png,gif			 
		}
	);
}

var selType = "";
function queryParam(checkQuery, type){
	selType = type;
	var param = {};
	param.checkQuery = checkQuery;
	if(type == 'MAC'){
		param.db = 'wifi_detect_indice';
		param.table = 'WIFI_DETECT_INFO';
		param.idField = 'DEVICE_ID';
		param.groupField = 'MAC';
		relateDesc = "MAC地址";
		//param.checkQuery = "{list:[{capture_time:'2016-02-29 11:53:00',capture_device_id:'44010000001310000008'}]}";
	} else if (type == 'DOOR') {
		param.db = 'door_access_indice';
		param.table = 'DOOR_ACCESS_INFO';
		param.idField = 'DEVICE_ID';
		param.groupField = 'ORIGINAL_CARD_ID';
		relateDesc = "门禁刷卡ID";
		//param.checkQuery = "{list:[{capture_time:'2016-02-22 20:10:00',capture_device_id:'102'}]}";
	} else if (type == 'CAR') {
		param.db = 'car_detect_indice';
		param.table = 'CAR_DETECT_INFO';
		param.idField = 'KKBH';
		param.groupField = 'HPHM';
		relateDesc = "车牌号码";
		//param.checkQuery = "{list:[{capture_time:'2016-02-20 16:13:00',capture_device_id:'00000000001310020833,00000000001310020428'}]}";
	} else if (type == 'IMEI') {
		/*param.table = 'V_EQU';
		param.groupField = 'IMEI';
		relateDesc = "手机串号";*/
		param.db = 'efence_detect_indice';
		param.table = 'EFENCE_DETECT_INFO';
		param.idField = 'DEVICE_ID';
		param.groupField = 'IMEI';
		relateDesc = "手机串号";
		//param.checkQuery = "{list:[{capture_time:'2016-02-24 09:15:10',capture_device_id:'1'}]}";
	} else if (type == 'IMSI') {
/*		param.table = 'V_EQU';
		param.groupField = 'IMSI';
		relateDesc = "手机卡串号";*/
		param.db = 'efence_detect_indice';
		param.table = 'EFENCE_DETECT_INFO';
		param.idField = 'DEVICE_ID';
		param.groupField = 'IMSI';
		relateDesc = "手机卡串号";
		//param.checkQuery = "{list:[{capture_time:'2016-02-24 09:15:10',capture_device_id:'1'}]}";
	}
	
	UI.util.debug(param);
	
	UI.util.showLoadingPanel('');
	
	doQuery(param); 
}

var deviceInfo = {};

function doQuery(param) 
{
	UI.control.remoteCall('efacecloud/collision/query', param, function(resp) {
		deviceInfo = resp.deviceInfo;
		$("#relationList").html(tmpl('resultTmpl',coincideSort(resp.ret)));
		UI.util.hideLoadingPanel();
	}, function(data, status, e) {
		UI.util.hideLoadingPanel();
		parent.parent.rightMainFrameOut();
	}, {
		async : true
	});
}

function coincideSort(ret){
	for (var i=0; i<ret.length; i++) {
		var o = ret[i].lists;
		var m = new Map();
		for (var j=0; j<o.length; j++) {
			if(o[j].ORIGINAL_DEVICE_ID) {
				m.put(o[j].ORIGINAL_DEVICE_ID, 1);
			} else if(o[j].KKBH) {
				m.put(o[j].KKBH, 1);
			}
		}
		ret[i].coincide = m.size();
		o.TRACKS.sort(function(a,b) {
			return parseInt(a.JGSJ)-parseInt(b.JGSJ);
		});
	}
	
	return ret.sort(function(a,b) {
		return parseInt(b.followTimes)-parseInt(a.followTimes);
	});;
}

function renderJgrq(jgrq)
{
	jgrq = "" + jgrq;
	return '20' + jgrq.substring(0,2) + '-' + jgrq.substring(2,4) + '-' + jgrq.substring(4)
}

function renderJgsj(jgsj)
{
	jgsj = "" + jgsj;
	while(jgsj.length<6) {
		jgsj = "0" + jgsj;
	}
	return jgsj.substring(0,2)+':'+jgsj.substring(2,4)+':'+jgsj.substring(4)
}