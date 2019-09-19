$(function(){
	//初始化地图
	UI.control.init();
	initMap();
	initEvent();	
})

function initEvent(){
	//卡口列表删除按钮
	$('#placeList').on('click','.delete-item',function(){		
		var i = $("#placeList .delete-item").index(this);
		filterHandler.removeFeature(i);		
		$(this).closest('tr').remove();
		invalidatePlaceList();
	});
	
	$("#placeList").on("click","tr",function(){
		var i = $("#placeList tr").index(this);
		filterHandler.selectFeature(i);
	});
	
	//确认按钮
	$("#confirmBtn").on("click",function(){
		var features = filterHandler.features,
			deviceIds = [],
			deviceNames = [];
		if(typeof features!="undefined"&&features!=null){
			$.each(features,function(index,item){
				deviceIds.push(item.properties.ORIGINAL_DEVICE_ID);
				deviceNames.push(item.properties.NAME);
			})
		}
		parent.UI.util.returnCommonWindow({deviceId:deviceIds.join(','),deviceName:deviceNames.join(',')});
		parent.UI.util.closeCommonWindow();
	});
	
	//取消按钮
	$('#cancelBtn').click(function(){
		parent.UI.util.closeCommonWindow();
	})
	
	//清空按钮
	$('.icon-clear').click(function(){
		$('#placeList').find('tr').remove();
		$('.table-wrap').removeClass('silde-left');
	});	
	
	$(".map-icon-list li").on("click",function(){
		var name = $(this).find(".map-icon").attr("name");
		filterHandler.update(null);
		if(name != "delete"){					
			filterHandler.draw(name);
		}
		
	});		
}

function invalidatePlaceList(forceInvalidate){
	if(forceInvalidate || $('#placeList').find('tr').length<=0){
		$('.table-wrap').removeClass('silde-left');
	}
}

//初始化地图
function initMap() {
    require(["suntek","/gis/mapinfo.jsp"], function (SuntekMap) {
        map = new SuntekMap("map", {
            closePopupOnClick: false,
            center: [23.1140683806, 113.3189400854],
			server: mapconfig.geoserver.url,
            zoom: 15
        });		
        L.ags.baseLayer({url:mapconfig.geoserver.layers[0].url}).addTo(map);
		var layerName = "CAMERA",
			labelField = "NAME",
			geometryField = "geom";
		var wms = L.suntek.wmsLayer(map.options.server+"/wms", {
			layers:layerName,			
			getTooltip:function(feature){
				return feature.properties[labelField];
			},
			getPopup:function(layer){
				return layer.feature.properties[labelField];
			}
		}).addTo(map);
		var wfs = L.wfsClient(map.options.server+"/wfs",{
			geometryField:geometryField
		}).setLayer(layerName);		
		
		var filterHandler = {
			lastLayer:null,			
			draw:function(type){
				var drawHandler = map.drawHandler.draw(type,{drawOnce:true}),
					self = this;
				drawHandler.on("drawEnd",function(e){					
					self.update(e.target.layer);
				});
			},
			remove:function(){
				if(this.lastLayer){
					wms.setFeatureId(null,true).setGeometry(null);
					this.lastLayer.remove();
					this.lastLayer = null;
				}
				this.features = null;
				invalidatePlaceList(true)
			},
			removeFeature:function(i){
				var ftr = this.features.splice(i,1)[0];
				var fids = this.getFeatureIds();
				if(fids.length>0){
					wms.setFeatureId(fids);
				}else{					
					this.remove();
				}
				map.closePopup();
			},
			selectFeature:function(i){
				var ftr = this.features[i];
				if(ftr){
					var layer = L.GeoJSON.geometryToLayer(ftr);
					L.popup()
					 .setLatLng(layer.getLatLng())
					 .setContent(ftr.properties[labelField])
					 .openOn(map);
				}
			},
			getFeatures:function(){
				return this.features;
			},
			getFeatureIds:function(){
				return $.map(this.features, function(ftr,i){
					return ftr.id.replace(/^\w+\./,"");
				});
			},
			_handleWFSResult:function(){
				var self = this;
				return function(geojson){
					self.features = geojson.features;
					var result = self.getFeatures();
					if(result.length>0){
						showList(result);
					}					
				}				
			},
			update:function(layer){				
				if(layer == null){
					this.remove();
				}else{
					var self = this;
					// 如果是画线，则缓冲为面
					if(!(layer instanceof L.Polygon) && layer instanceof L.Polyline){
						var reader = new jsts.io.GeoJSONReader();
						var writer = new jsts.io.GeoJSONWriter();
						var geojson = layer.toGeoJSON();
						var buffered = reader.read(geojson.geometry).buffer(0.001);
						var bufferedLayer = L.GeoJSON.geometryToLayer(writer.write(buffered)).addTo(map);
						layer.remove();
						this.update(bufferedLayer);
						return;
					}
					wms.setGeometry(layer);
					wfs.setGeometry(layer).run(this._handleWFSResult());				
					
					// 画完图以后可以编辑
					/* var timer = null;
					function delayedUpdate(){
						clearTimeout(timer);
						timer = setTimeout(function(){							
							self.update(layer);
						},500);
					}
					layer.on("click",function(e){
						L.DomEvent.stopPropagation(e);
						var editHandler = map.editHandler.edit(layer);						
						editHandler.on("editUpdate",function(){
							delayedUpdate();	
						});
						map.once("click",function(){							
							map.editHandler.disable();
						});
					}); */
				}				
				this.lastLayer = layer;
			}
		};		
		
		window.filterHandler = filterHandler;
    })
}

function showList(result){
	$("#placeList").html(tmpl("placeListTmpl", result));
	$('.table-wrap').addClass('silde-left');
}