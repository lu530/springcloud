$(function(){
	initEvent();
	initData();
})

var deviceInfo = {};
function initData(){
	var data = top.window.frames['rightMainFrame'].window.frames['frameFormFull'].timesGroupData;
	deviceInfo = top.window.frames['rightMainFrame'].window.frames['frameFormFull'].deviceInfo;
	$("#frequencyList").html(tmpl('frequencyTmpl',data));
}

function initEvent(){
	//关闭
	$('#closeBtn').click(function(){
		parent.hideForm();
		top.rightMainFrameIn('','show');
	});
	
	//列表点击事件
	$('body').on('click','.people-list dl',function(){
		$('.people-list dl').removeClass('active');
		$(this).addClass('active');
//		var data = {};
//		data.title = "";
//		data.x = 0;
//		data.y = 0;
//		data.url = $(this).attr("pic");
//		var deviceId = $(this).attr("deviceId");
//		if(deviceInfo[deviceId]){
//			data.x = deviceInfo[deviceId].LONGITUDE;
//			data.y = deviceInfo[deviceId].LATITUDE;
//		}
//		showMapTarckDialog(data);
		var title = $(this).attr("name");
		var url = $(this).attr("pic");
		var x = $(this).attr("x");
		var y = $(this).attr("y");
		var time = $(this).attr("time");
		
		showDetailOnMap(title,url,x,y,time)
	});
}

function showMapTarckDialog(data){
	var map = top.SuntekMap.getMap();
	map.openInfoWindow(
		{ x:data.x, y:data.y },	// 点线面的esriJSON格式
		{ txmc1:data.url },	// 气泡属性，如摄像机名称,ID等，也可以传null
		{
			frameTitle:data.title, // 气泡标题
			frameSrc:"/gis/page/infowin/ecarsPicInfo.html" // 气泡内容URL地址，可以是html,jpg,png,gif			 
		}
	);
}