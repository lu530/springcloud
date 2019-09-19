var imgUrl = UI.util.getUrlParam("imgUrl") || '';
var time = UI.util.getUrlParam("time") || '';
var addr = UI.util.getUrlParam("addr") || '';
var lng = UI.util.getUrlParam("longitude")||113.36277;
var lat = UI.util.getUrlParam("latitude")||23.12608;

var option = {center: [lat,lng],noExtent:true};
var selectOption = {
		lng : lng,
	    lat: lat,
}
	    
$(function(){
	UI.control.init();
	initEvent();
	UI.map.init(option,function(){
		mapObj = UI.map.getMap();
		initMap(selectOption);
	});
})

function initMap(){
	var iconOptions ={icon:L.icon({
	    iconUrl:'/efacecloud/images/L_CAMERA_KK.png',
	    iconSize: [30, 30],
	    iconAnchor: [16, 31],
	    className:'maplayer-wrap'
	})};
	mapObj.setView([selectOption.lat,selectOption.lng],mapObj.getMaxZoom()-2).on('click',function(e){
		var popupHtml = renderHtml();
		var latlng = { lat : selectOption.lat , lng : selectOption.lng };
		L.popup({offset:L.point(0,-25)}).setLatLng(latlng).setContent(popupHtml).openOn(mapObj);
	});
	var marker = L.marker(L.latLng(selectOption.lat,selectOption.lng),iconOptions).addTo(mapObj);
//	marker.bounce();
}

/*mapMarkers.addLayer(L.marker(latlng,{icon:icon}).on('click',function(e){
	var popupHtml = renderImportHtml(alarmId);
	L.popup({offset:L.point(0,-25)}).setLatLng(latlng).setContent(popupHtml).openOn(mapObj);
}));*/
function initEvent(){
	
}

function renderHtml(){
	var html ='<div class="popup-wrap">'+
				'<img src="'+imgUrl+'">'+
				'<p><span>时间:</span>'+time+'</p>'+
				'<p><span>地点:</span>'+addr+'</p>'+
			   '</div>';
	return html;
}
