// 轨迹查看页面
var trackData = parent.trackData; //轨迹查看的相关数据
var tracksLine =null;

$(function(){
	UI.control.init();
	initData();
	initEvent();
})

function initEvent(){
	//显示当前气泡
    $("body").on("click",".searchLi",function(){
    	var $this = $(this);
    	var id = $this.attr("id");
    	$this.addClass("active").siblings().removeClass("active");
		tracksLine.showPopup(id);//根据ID显示气泡
    });
	//返回
	$('#backBtn').click(function(){
		parent.parent.UI.util.hideCommonIframe('.frame-form-full');
	});
	var routeLineInfo = [];
	for(var i=0; i<trackData.length; i++){
		routeLineInfo.push({
			address: trackData[i].DEVICE_ADDR,
			id: i+1,
			latlng:[trackData[i].LATITUDE, trackData[i].LONGITUDE],
            name: trackData[i].DEVICE_NAME,
            time: trackData[i].JGSK,
            title:  i+1
		})
	}
	var popupHtml = '<div class="maplayer-wrap">'+
	'<div class="layer camera">'+
	'<div class="layer-caption">'+
	'<div class="title">{%=o.name%}</div>'+
	'</div>'+
	'<div class="layer-content con2">'+
	'<div class="main-msg left-msg">'+
	'<p>抓拍时间：<span class="iB-span">{%=o.time%}</span></p>'+
	'<p>设备地址：<span class="iB-span">{%=o.address%}</span></p>'+
	'</div>'+
	'</div>'+
	'</div>'+
	'</div>';
	var options  = {
		lineColor: "#017338",
		nodeColor: "#E51E3B",
		routeLineInfo: routeLineInfo,
		routePopup: popupHtml
	}
	if(tracksLine){
		tracksLine.remove();
	}
	tracksLine = parent.showTracksOnMap(options);
	
	
}

function initData(){
	$("#listTmplBox").append(tmpl("listTmpl", trackData));
}

