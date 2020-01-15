// 设置无图片
var noPic = UI.util.getUrlParam('noPic') || '';
var entrance= UI.util.getUrlParam('entrance') || '';

$(function(){
	initEvents();
	initData();
	initWaterMark();
});

function initEvents(){
	//返回
	$('#backBtn').click(function(){
		switch(parent.getDataType){
			//技战法轨迹分析表单页面进入
			case 'track':
				parent.hideLeftResult();
				parent.rightMainFrameIn('','show');
				if(parent.routeControl){
					parent.routeControl.remove();
				}
				break;
			case 'trackResult':
				//直接进入轨迹结果页面
				parent.parent.UI.util.hideCommonIframe('.frame-form-full');
				break;
		}
		

	});
	
	//列表点击事件
	$('body').on('click','#faceList li',function(){
		$(this).addClass('active').siblings().removeClass('active');
		var x = $(this).attr("x");
		var y = $(this).attr("y");
		var url = $(this).attr("obj_pic");
		var zoom_url = $(this).attr("pic");
		var title = $(this).attr("name");
		var time = $(this).attr("time");
		//showDetailOnMap(title,url,zoom_url,x,y,time);
		if(x && y){
			if(parent.routeControl){
				parent.routeControl.showNodePopup($(this).index());//根据ID显示气泡
			}
		}
		else{
			UI.util.alert("缺失坐标,无法定位","warn");
		}
	});
	

}

//初始化数据
function initData(){
	UI.util.showLoadingPanel();
	var data = getTrackArr();
	$("#faceList").html(tmpl('faceListTmpl',data));
	$('[attrimg="zoom"]').lazyload({effect: "fadeIn",container:$("#faceList")});
	showTrackData(data);
	UI.util.hideLoadingPanel();
}

//根据不同层级获取数据
function getTrackArr(){
	var data = null;
	//轨迹分析技战法页面数据
	if(parent.frames["rightMainFrame"].trackArr){
		data = parent.frames["rightMainFrame"].trackArr;
	}else if(parent.parent.trackData){
		//其他地方直接展示轨迹结果
		data = parent.parent.trackData;
		curFrameType = 'firstResult';
	}else if(parent.parent.frames["rightMainFrame"].trackArr){
		//技战法上盖页面技战法
		data = parent.parent.frames["rightMainFrame"].trackArr;
		curFrameType = 'thirdResult';
	}
	return data;
}

//展示轨迹播放
function showTrackData(trackArr){
	//气泡模板
	var routePopup = '<div class="maplayer-wrap">'+
	'<div class="layer camera">'+
	'<div class="layer-caption">'+
	'<div class="title">详情</div>'+
	'</div>'+
	'<div class="layer-content con2">'+
	'<div class="main-msg left-msg">'+
	(noPic ? '' : '<img src="{%=o.image%}"/>')+
	'<p>抓拍时间：<span class="iB-span">{%=o.jgsj%}</span></p>'+
	'<p>抓拍地点：<span class="iB-span">{%=o.name%}</span></p>'+
	'</div>'+
	'</div>'+
	'</div>'+
	'</div>';
	var	palyArr = [],//播放数据
	diffFlag = false;//用于判断是否同一个经纬度点
	
	for(var i = 0,len = trackArr.length;i < len;i++){
		for(var j = i+1;j < len;j++){
			if(trackArr[i].X != trackArr[j].X || trackArr[i].Y != trackArr[j].Y){
				diffFlag = true;
				break;
			}
		}
		if(diffFlag){
			break;
		}
	}
	
	if(!diffFlag){
		UI.util.alert('经纬度一样，无法生成轨迹！', 'warn');
		return false;
	}
	
	$.each(trackArr,function(i,n){
		var playObj = {};
		if(n.X && n.Y){
			playObj.id = i;
			playObj.title = i+1;
			playObj.name = n.DEVICE_NAME;
			playObj.image = n.OBJ_PIC;
			playObj.txmc1 = n.OBJ_PIC;
			playObj.time = n.TIME;
			playObj.x = n.X;
			playObj.y = n.Y;
			playObj.jgsj = n.jgsj;
			palyArr.push(playObj);
		}
	});
	if(palyArr.length > 0){
		if(palyArr.length < trackArr.length){
			UI.util.alert((trackArr.length-palyArr.length)+"条数据的坐标缺失","warn");
		}
		if(entrance=='wifiSearch') {
			for(var ii=0;ii<palyArr.length;ii++) {
				palyArr[ii].image='/efacecloud/images/wifi.png'
			}
		}
		var playOpts = {
			routeInfo:palyArr,
			routePopup:routePopup,
			iconType:"person"
		};
		showRouteControl && showRouteControl();
		parent.loadRoute(playOpts);
		parent.rightMainFrameOut('hide');
	}
	else{
		UI.util.alert("坐标缺失,无法生成轨迹","warn");
	}
}

function showRouteControl () {

	parent.$('.routeControlSwitch').addClass('active');

	if(parent.$('.routeControlSwitch').hasClass('on')) return;

	parent.$('.routeControlSwitch').trigger('click');
}