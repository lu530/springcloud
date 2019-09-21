var trackCallbackIds = {};//记录每条轨迹
var routeControl = null;//记录每条轨迹
var mapObj = {};
function initMap(callback){
	callback = callback || function() {};
    var options = {
        closePopupOnClick: false,//点击地图其它地方是否关闭Popup框
        //center: [23.1140683806, 113.3189400854],//地图中心点位
        //baseMapUrl: 'http://172.16.56.4:6080/arcgis/rest/services/gd/MapServer',
        //baseMapUrl: 'http://172.16.56.4:6080/arcgis/rest/services/newMap2/MapServer',
        //zoom: 15//缩放等级
    };
    
    if(isBlack()){
    	options.zoom = 10
    }

    UI.map.init(options, function(){
		callback();
		showLayer("L_CAMERA_FACE");
		showMapToolbar();
	});
}
function showMapToolbar(){
	var map = UI.map.getMap();
	var layerMap={}
	map.eachLayer(function(layer){
		if(layer.options.layers=="L_CAMERA_FACE"){
			layerMap.VIDEO=layer;
			layer.remove()
		}
	})
	var mapToolbar = L.control.mapToolbar(
		[
			{
				text: '图层',				
						iconClass:"map-layer",	
						subMenus:[
								  {text:"摄像机", iconClass:"mba11", layerName:"VIDEO",callback:toggleLayer,selected:false}
						]
			}
		]		
	).addTo(map);
	function toggleLayer(item){
		item.selected = !item.selected;
		mapToolbar.updateMenus();
		var this_layer = layerMap[item.layerName];
		if(typeof this_layer == "function"){
			this_layer(item.selected);
			
		}else{
			if(item.selected){			
				// this_layer.addTo(map);
				showLayer("L_CAMERA_FACE");
			}else{
				// this_layer.remove();
				map.eachLayer(function(layer){
					if(layer.options.layers=="L_CAMERA_FACE"){
						layerMap.VIDEO=layer;
						layer.remove()
					}
				})
			}
		}		
	}
}
function showLayer(type){
	UI.map.initDrawQuery(type,"NAME","geom");
}

function clearMap(){
    UI.map.clearDraw();
}

//地图显示轨迹
function showTracksOnMap(opts){
	var routL = UI.map.routeLine(opts.routeLineInfo,{
		nodeRadius:18,
		getTooltip:function(layer){//返回气泡 
            return layer.options.properties.name; 
         },
        nodeColor:opts.nodeColor?opts.nodeColor:'#00f',
        lineColor: opts.lineColor?opts.lineColor:'red',
        lineOpacity:opts.lineOpacity==0?0:(opts.lineOpacity?opts.lineOpacity:1),
		getPopup:function(layer){//返回弹窗
			var info = layer.options.properties;//轨迹点位
	        var popupHtml = tmpl(opts.routePopup,info);
	        return popupHtml;
		}
	});
	
//	UI.map.clearMap();
	return routL;
}

//播放轨迹
function loadRoute(opts){
	if(routeControl){
		routeControl.remove();
	}
	routeControl = UI.L.trackControl().addTo(UI.map.getMap());
	var iconUrl = opts.iconType == "person"?'/efacecloud/images/map/person.png':'/efacecloud/images/map/car.png';
	if(opts.iconType == "person"){
		opts.vehicle ="foot";
	}
	else if(opts.iconType == "car"){
		opts.vehicle ="car";
	}
	else{
		opts.vehicle ="car";
	}
	routeControl.loadRouteInfo(opts.routeInfo,
	{
		vehicle:opts.vehicle,
		markerUrl:iconUrl,
		markerSize:[32,32],
		getPopup:function(layer){
			var info = layer.options.properties;//轨迹点位
	        var popupHtml = tmpl(opts.routePopup,info);
	        return popupHtml;
		}
	});
	UI.map.getMap().eachLayer(function(layer){
		if(layer.options.layers=="L_CAMERA_FACE"){
			layer.remove()
		}
	})
}

// 绘制气泡
function drawRelativeMap(obj, tmplID) {
	if(obj.X && obj.Y) {
		// obj.X = '113.383749';
		// obj.Y = '23.045322';
		var latlng = [obj.Y, obj.X];
		var data = {
			DEVICE_TYPE: obj.DEVICE_TYPE,
			DEVICE_ID: obj.DEVICE_ID,
			JGSK: obj.JGSK
		};
		mapObj.openPopup(tmpl(tmplID, data), latlng, {autoClose: false});
	}
}