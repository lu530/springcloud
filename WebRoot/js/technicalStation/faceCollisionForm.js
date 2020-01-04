var taskStatus = UI.util.getUrlParam("taskStatus") || '';
var endTime = dateFormat(new Date(),'yyyy-MM-dd 23:59:59');
var beginTime = dateFormat(new Date(),'yyyy-MM-dd 00:00:00');
//查询参数
var queryParams = {};
var L = parent.UI.L;
var data = { i:0 };

//红名单搜索条件
var searchParam = {};

//区域颜色
var colorBorderList = ["rgb(244,60,60)", "rgb(250,128,38)", "rgb(155,171,16)", "rgb(13,200,145)"];
var colorBgList = ["url(/efacecloud/images/regionBg/1.png)", "url(/efacecloud/images/regionBg/2.png)", "url(/efacecloud/images/regionBg/3.png)", "url(/efacecloud/images/regionBg/4.png)"];

//区域设备列表
regionDeviceList = {
	curRegion:"",
	callback: getRegionDeviceList,
	getCurrentShape:function(){
		return this["regionShape"+this.curRegion];
	},
	getLocations:function(){
		return this["locations"+this.curRegion];
	},
	selectDevicesById:function(ids){
		if(typeof ids == "string"){
			ids = ids.split(",");
		}
		var mapObj = parent.UI.map.getMap(), 
			wms = null,  
			currentShape = this.getCurrentShape(),
			locations = this.getLocations();
		for(var p in mapObj._layers){
			if("wmsParams" in mapObj._layers[p]){
				wms = mapObj._layers[p];
				break;
			}
		}
		if(wms){
			if(ids.length > 0){
				wms.setCQL("DEVICE_ID IN ('"+ids.join("','")+"')");
				if(currentShape){
					var latlngs = [];
					for(var i=0;i<ids.length;i++){
						var latlng = locations[ids[i]];
						if(latlng){
							latlngs.push(latlng);
						}
					}
					currentShape.remove();
					this["regionShape"+this.curRegion] = L.vectors.regionLabel(latlngs,currentShape.options).addTo(mapObj);
				}		
			}else{
				wms.remove();				
				currentShape && currentShape.remove();
			}
		}
	}
};

$(document).ready(function(){
//	UI.control.init(["userInfo"]);
	UI.control.init();
	getDeviceModule();  //定义在common中
	/*judgePermission();*/
	compatibleIndexOf();
	initEvents();
	initDateTimePicker();
});

function judgePermission(){
	UI.control.initPermission();
	if(!UI.control.permissionDefaultHandle($("body").attr("menuId"))){
		return;
	}
}

function initEvents(){
	//初始化滑块事件
	 var sliderT = $( "#sliderThreshold" ).slider({
	      range: "max",
	      min: 0,
	      max: 100,
	      value: 70,
	      slide: function( event, ui ) {
	        $( "#THRESHOLD" ).val( ui.value );
	      }
	    });
	 var sliderS = $( "#sliderScore" ).slider({
	      range: "max",
	      min: 0,
	      max: 100,
	      value: 65,
	      slide: function( event, ui ) {
	        $( "#FACESCORE" ).val( ui.value );
	      }
	    });
	 
	 $('#THRESHOLD').keyup(function() {  
		//数值范围为100以内
		$(this).val($(this).val().replace(/[^0-9]+/,''));
		if($(this).val() > 100){
			$(this).val(100);
		}
		$('.ui-slider-horizontal .ui-slider-handle').css('transition','0.5s');
		sliderT.slider( "value", $(this).val() );
		setTimeout(function(){
			$('.ui-slider-horizontal .ui-slider-handle').css('transition','0s');
		},500)
	})
	
	$('#FACESCORE').keyup(function() {  
		//数值范围为100以内
		$(this).val($(this).val().replace(/[^0-9]+/,''));
		if($(this).val() > 100){
			$(this).val(100);
		}
		$('.ui-slider-horizontal .ui-slider-handle').css('transition','0.5s');
		sliderS.slider( "value", $(this).val() );
		setTimeout(function(){
			$('.ui-slider-horizontal .ui-slider-handle').css('transition','0s');
		},500)
	});

	if(taskStatus && taskStatus != 2){
		$("#searchBtn").addClass("hide");
	}

	//从任务列表查看
	if(top.GET_TASK_LIST_DATA){
		//条件回填
		var search = top.GET_TASK_LIST_DATA.search;
		//1
		$(".beginTime:eq(0)").val(search.TIME_REGION_LIST[0].BEGIN_TIME);
		$(".endTime:eq(0)").val(search.TIME_REGION_LIST[0].END_TIME);
		fillBackDeviceIds({
			datas: search.TIME_REGION_LIST[0].DEVICE_IDS,
			deviceNames: "deviceNames1",
			faceDetect: "faceDetect1",
			deviceIdInt: "deviceIdInt1",
			deviceNameList: "deviceNameList1",
			dropdownListText: "dropdown-list-text1"
		});
		//2
		$(".beginTime:eq(1)").val(search.TIME_REGION_LIST[1].BEGIN_TIME);
		$(".endTime:eq(1)").val(search.TIME_REGION_LIST[1].END_TIME);
		fillBackDeviceIds({
			datas: search.TIME_REGION_LIST[1].DEVICE_IDS,
			deviceNames: "deviceNames2",
			faceDetect: "faceDetect2",
			deviceIdInt: "deviceIdInt2",
			deviceNameList: "deviceNameList2",
			dropdownListText: "dropdown-list-text2"
		});
		$("#arithmeticSelect").val(search.ALGORITHM_CODE);
		sliderT.slider( "value", search.THRESHOLD || 60);
		$( "#THRESHOLD" ).val( search.THRESHOLD || 60);
		//执行检索
		if(taskStatus == 2)$('#searchBtn').trigger("click");
	}
		

	 
	//返回菜单
	$('body').on('click','#backBtn',function(){
		if(taskStatus) {
			parent.parent.hideFrame();
		}else {
			parent.showMenu();
		}
	});
	
	//查询
	$('#searchBtn').click(function(){
		if(initQueryParams()){
			
			searchParam = {
					BEGIN_TIMES: queryParams.BEGIN_TIMES,
					END_TIMES:queryParams.END_TIMES,
					DEVICE_IDS:queryParams.DEVICE_IDS,
					THRESHOLD:queryParams.THRESHOLD,
					FACE_SCORE:queryParams.FACE_SCORE,
					searchType:5
			};
			
			/*if(isOpenSearchCause()){*/
				searchBeforeLogged(function(){
					showForm('/efacecloud/page/technicalStation/faceTrajectory.html');
					UI.util.showLoadingPanel();
					parent.UI.map.drawQuery("delete");//清除地图框选
				},searchParam,true);
			/*}else{
				showForm('/efacecloud/page/technicalStation/faceTrajectory.html');
				parent.UI.map.drawQuery("delete");//清除地图框选
			}*/
		}
	});
	
	//列表项移除按钮
	$('body').on('click','.delete-item',function(){
		checkFieldList($(this))
		$(this).closest('tr').remove();
	})
	
	//点击添加区域按钮
	$('.addRegion').click(function(){
		addAreaPoint();
		$(".operationBtn").addClass("hide");
	});
	//点击删除区域按钮
	$('.deleRegion').click(function(){
		var $operationBtn = $(".operationBtn");
		if($operationBtn.hasClass("hide")){
			$operationBtn.removeClass("hide");
		}else{
			$operationBtn.addClass("hide");
		}
	});
	$("body").on("click",".operationBtn",function(){
		var $this = $(this),
			$parentUl = $this.parent().parent().find(".map-icon-list"),
			index = $parentUl.attr("index");
		
		deleteAreaPoint($this,index);
	});
	
	//统一的通过卡口树加载设备事件
//	$('body').on('click','[togglebtn="kktree"]',function(){
//		var indexId = $(this).parents(".map-icon-list").attr('index');
//		
//		regionDeviceList.curRegion=indexId;
//		
//		//回填数据
//		checkDrowDownDeviceList({
//			deviceNames:$('#bayonetList'+indexId).attr("devicename"),
//			deviceId:$('#selectedBayonet'+indexId).val(),
//			deviceIdInt:$('#selectedDeviceIdInt'+indexId).val(),
//			orgCode:$("#bayonetList"+indexId).attr("orgcode")
//		});
//		
//        UI.util.showCommonWindow('/connectplus/page/device/deviceList.html?deviceType=194', '设备选择', 1000, 600,function(resp){
//        	if(resp.deviceId.split(",").length>150){
//        		UI.util.alert("区域"+indexId+"设备数据不要超过150个","warn");
//        		return false;
//        	}
//            initListData(resp,indexId);
//            var curDevideArr = [];
//            $.each(resp.deviceId.split(","),function(i,n){
//            	curDevideArr.push("'"+n+"'");
//            });
//            parent.UI.map.shearchLayer("L_CAMERA_FACE",curDevideArr.join(","),function(data){
//            	$("fieldset").eq(indexId-1).attr("hasarea",true);
//            	getRegionDeviceList(data.features);
//			});
//        });
//    });
	
	//删除已选设备
	$("body").on("click",".removeDeviceBtn",function(e){
		var $this = $(this);
		var id = $this.parents("ul").attr("id");
		var i = id.substr(id.length-1,1);
		var deviceId = $this.attr("deviceid");
		var deviceIdArr = $('#faceDetect'+i).val().split(",");
		var deviceIdIntArr = $('#deviceIdInt'+i).val().split(",");
		var deviceNameArr = $('#deviceNames'+i).html().split(",");
		var index = deviceIdArr.indexOf(deviceId),
			orgCode = $("#deviceNames"+i).attr("orgcode"),
			orgCodeArr = orgCode.split(",");
		
		$this.parents("li").remove();
		deviceIdArr.splice(index,1);
		deviceIdIntArr.splice(index,1);
		deviceNameArr.splice(index,1);
		orgCodeArr.splice(index,1);
		$('#faceDetect'+i).val(deviceIdArr.join(","));
		$('#deviceIdInt'+i).val(deviceIdIntArr.join(","));
		$('#deviceNames'+i).html(deviceNameArr.join(","));
		$('#deviceNames'+i).attr("title",deviceNameArr.join(","));
		$('#deviceNames'+i).attr("orgcode",orgCodeArr.join(","));
		if($("#deviceNameList"+i+" li").length == 0){
			$(".dropdown-list-text"+i).attr("data-toggle","");
			$(".dropdown-list-text"+i+" .dropdown").addClass("hide");
			$(".dropdown-list"+i).removeClass("open");
		}
		regionDeviceList.selectDevicesById(deviceIdArr);
		e.stopPropagation();
	});
	
	//通过卡口树加载设备
	$('body').on('click','.list-title[id^=deviceNames]',function(e){
		var id = $(this).attr("id");
		var index = id.substr(id.length-1,1);
		//回填数据
		checkDrowDownDeviceList({
			deviceNames:$('#deviceNames'+index).html(),
			deviceId:$('#faceDetect'+index).val(),
			deviceIdInt:$('#deviceIdInt'+index).val(),
			orgCode:$('#deviceNames'+index).attr("orgcode")
		});
		var layerName = $(this).closest("dl").find(".map-icon-list").attr("layername");
		parent.showLayer(parent.UI.map.layerNameMap[layerName]);
		parent.UI.map.getMap().drawHandler.disable();
		
		UI.util.showCommonWindow(deviceModule + '/page/device/deviceList.html?deviceType=194', '设备选择', 1000, 600,function(resp){
			var mapObj = parent.UI.map.getMap(), wms = null;
			for(var p in mapObj._layers){
				if("wmsParams" in mapObj._layers[p]){
					wms = mapObj._layers[p];
					break;
				}
			}
			
			if(resp.deviceId){
				if(resp.deviceId.split(",").length>150){
					UI.util.alert("区域"+indexId+"设备数据不要超过150个","warn");
	        		return false;
				}
				var curDevideArr = [];
				$.each(resp.deviceId.split(","),function(i,n){
					curDevideArr.push("'"+n+"'");
				});									
				
				parent.UI.map.shearchLayer(layerName,curDevideArr.join(","),function(data){
					$("fieldset").eq(index-1).attr("hasarea",true);
					getRegionDeviceList(data.features);
				});
        	}
			regionDeviceList.selectDevicesById(resp.deviceId);
			$('#deviceNames'+index).text(resp.deviceName)
									.attr('title',resp.deviceName)
									.attr('orgcode',resp.orgCode);
			$('#faceDetect'+index).val(resp.deviceId);
			$('#deviceIdInt'+index).val(resp.deviceIdInt);
				addDrowdownDeviceList({
				deviceId:resp.deviceId,
				deviceName:resp.deviceName,
				deviceNameList:$("#deviceNameList"+index),
				dropdownListText:$(".dropdown-list-text"+index)
			});

		});
		e.stopPropagation();
	})
}


//获取区域设备列表
function getRegionDeviceList(dataList){
	var latlngs = [],deviceList=[],deviceLocations = {}, curRegion = regionDeviceList.curRegion;
	if(dataList && dataList.length>0){
		for(var i =0;i<dataList.length;i++){
			var lat = dataList[i].geometry.coordinates[1];
			var long = dataList[i].geometry.coordinates[0];
			if(lat>20 && long>100){
				var latlng = L.latLng(lat,long), deviceId = dataList[i].properties.DEVICE_ID;
				deviceLocations[deviceId] = latlng;
				latlngs.push(latlng);
				deviceList.push(deviceId);
			}else{
				UI.util.alert("所选设备经纬度不合法！","warn");
				return false;
			}
		}		
		if(latlngs.length>0){
			if(regionDeviceList["regionShape"+curRegion]){
				regionDeviceList["regionShape"+curRegion].remove();
			}			
			var regionShape = L.vectors.regionLabel(latlngs,{text:"区域"+curRegion,attr:{
				"stroke": curRegion>4?colorBorderList[curRegion-4]:colorBorderList[curRegion-1],
				"fill": latlngs.length==2?'none':(curRegion>4?colorBgList[curRegion-4]:colorBgList[curRegion-1]),
				"stroke-width": 2,
				"stroke-linecap":"round",
				"stroke-linejoin":"round"},
				fontAttr:{
					"fill":curRegion>4?colorBorderList[curRegion-4]:colorBorderList[curRegion-1],
					"font-size":"16px",
					"text-anchor":"start"
				}}).addTo(parent.UI.map.getMap());
			regionDeviceList["locations"+curRegion] = deviceLocations;
			regionDeviceList["latLngs"+curRegion] = latlngs;
			regionDeviceList["regionShape"+curRegion] = regionShape; 
			regionDeviceList["region"+curRegion] = deviceList;
			regionDeviceList["regionMapData"+curRegion] = dataList;
			regionDeviceList.regionLen = $('fieldset[hasarea]').length;
			
			//定位
			regionDeviceList["regionShape"+curRegion].zoomTo();
			//parent.UI.map.getMap().fitBounds(L.latLngBounds(latlngs));
		}else{
			return false;
		}
	}else{
		UI.util.alert("所选设备经纬度不合法！","warn");
	}
};

//添加区域
function addAreaPoint( ){
	var areaLen = $('fieldset').length;
	if( areaLen < 4){
		data.i = areaLen + 1;
		$('#fieldsetList').append(tmpl('filedTmpl', data));
		$('fieldset').last().find(".beginTime").val(beginTime);
		$('fieldset').last().find(".endTime").val(endTime);
	}else{
		UI.util.alert('至多4个区域','warn');
	}
}

//删除区域
function deleteAreaPoint( $this,index){
	var $fieldset = $('fieldset');
		areaLen = $fieldset.length,
		curIndex = parseInt(index);
		
	if( areaLen > 2){
		if(regionDeviceList["regionShape"+index]){
			regionDeviceList["regionShape"+index].remove();//移除区域
			regionDeviceList.regionLen--;
		}
		$this.parent().parent().remove();
		var changeLen = areaLen - index;
		if(changeLen>0){
			for(var i = 0;i<changeLen;i++){
				var $curFieldset = $("fieldset").eq(curIndex-1);
				$curFieldset.find(".field-index").html(curIndex);
				$curFieldset.find(".map-icon-list").attr("index",curIndex);
				$curFieldset.find(".table").attr("index",curIndex);
				
				//是否选择了区域，地图区域排序，对应表单
				if($curFieldset.attr("hasarea")){
					regionDeviceList["region"+curIndex] = regionDeviceList["region"+(curIndex+1)];
					regionDeviceList["regionMapData"+curIndex] = regionDeviceList["regionMapData"+(curIndex+1)];
					regionDeviceList["regionShape"+curIndex] = regionDeviceList["regionShape"+(curIndex+1)];
					regionDeviceList["latLngs"+curIndex] = regionDeviceList["latLngs"+(curIndex+1)];
					
					delete regionDeviceList["region"+(curIndex+1)];
					delete regionDeviceList["regionMapData"+(curIndex+1)];
					delete regionDeviceList["regionShape"+(curIndex+1)];
					delete regionDeviceList["latLngs"+(curIndex+1)];
					regionDeviceList["regionShape"+curIndex].remove();
					var regionShape = L.vectors.regionLabel(regionDeviceList["latLngs"+curIndex],{text:"区域"+curIndex,attr:{
						"stroke": curIndex>4?colorBorderList[curIndex-4]:colorBorderList[curIndex-1],
						"fill": curIndex>4?colorBgList[curIndex-4]:colorBgList[curIndex-1],
						"stroke-width": 2,
						"stroke-linecap":"round",
						"stroke-linejoin":"round"},
						fontAttr:{
							"fill":curIndex>4?colorBorderList[curIndex-4]:colorBorderList[curIndex-1],
							"font-size":"16px",
							"text-anchor":"start"
						}}).addTo(parent.UI.map.getMap());
					
					regionDeviceList["regionShape"+curIndex] =regionShape;
				}
				curIndex++;
			}
		}
	}else{
		UI.util.alert('至少2个区域','warn');
	}
}

//初始化日期选择框
function initDateTimePicker(){
	var	now = new Date(),
		maxTime = today = now.format("yyyy-MM-dd 23:59:59"),
		beginTime = $(".beginTime"),
		endTime = $(".endTime");
	beginTime.val(now.format("yyyy-MM-dd 00:00:00"));
	endTime.val(today);
	
	$('body').on('focus','.beginTime',function(){
		WdatePicker({
			/*isShowClear:false,*/
			readOnly:true,
			maxDate: today,
			startDate:'%y-#{%M}-%d 00:00:00',
			dateFmt:'yyyy-MM-dd HH:mm:ss',
			alwaysUseStartDate:true
		});
	});
	$('body').on('focus','.endTime',function(){
		var nextBeginTime = $(this).parents('.time-wrap').find('.beginTime');
		WdatePicker({
			/*isShowClear:false,*/
			readOnly:true,
			minDate:nextBeginTime.val(),
			maxDate: maxTime,
			startDate:'%y-#{%M}-%d 23:59:59',
			dateFmt:'yyyy-MM-dd HH:mm:ss',
			alwaysUseStartDate:true
		});
	});
}

function showForm(url) {
	$("#frameFormFull").attr("src", url);
	$(".frame-form-full").show();
	
}
function hideForm() {
	$("#frameFormFull").attr("src", "");
	$(".frame-form-full").hide();
}

function initQueryParams() {
    if (UI.util.validateForm($('.form-inline'), true)){
        var kkbhs = [];
        var beginTimes = [];
        var endTimes = [];
        var kkbhFlag = true;
        $('.beginTime').each(function() {
            beginTimes.push($(this).val());
        });
        $('.endTime').each(function() {
            endTimes.push($(this).val());
        });

        /*$('.table-wrap').each(function(){
         var deviceList=[];
         $(this).find('tbody').find('tr').each(function(){
         deviceList.push($(this).attr('deviceId'));
         })
         $(this).find('input[name="faceDetect"]').val(deviceList.join(','));
         })*/

        /*$('input[name="CAMERA_IDS"]').each(function() {
            if($(this).val()=="" || $(this).val()==undefined){
                kkbhFlag = false;
            }else{
                kkbhs.push($(this).val());
            }
        });*/
        $('input[id^=faceDetect]').each(function(){
        	if($(this).val()=="" || $(this).val()==undefined){
        		UI.util.alert("区域的感知设备不能为空，请选择感知设备","warn");
        		kkbhFlag = false;
                return false;
        	}else{
        		kkbhs.push($(this).val());
        	}
        });

        queryParams.BEGIN_TIMES = beginTimes.join("_");
        queryParams.END_TIMES = endTimes.join("_");
        queryParams.DEVICE_IDS = kkbhs.join("_");
        queryParams.THRESHOLD = $("#THRESHOLD").val();
        queryParams.FACE_SCORE = $("#FACESCORE").val();
        if(!kkbhFlag){
            UI.util.alert("区域的感知设备不能为空，请选择感知设备","warn");
            return;
        }
        return kkbhFlag;
    }

}

//检测卡口列表是否为空，为空则移除
function checkFieldList($this){
	if($this.closest('tbody').find('tr').length<=1){
		$this.closest('.table-wrap').addClass('hide');
	}
}

/**
 * 兼容ie8的indexOf方法
 */
function compatibleIndexOf(){
	if (!Array.prototype.indexOf)
	{
	  Array.prototype.indexOf = function(elt /*, from*/)
	  {
	    var len = this.length >>> 0;
	    var from = Number(arguments[1]) || 0;
	    from = (from < 0)
	         ? Math.ceil(from)
	         : Math.floor(from);
	    if (from < 0)
	      from += len;
	    for (; from < len; from++)
	    {
	      if (from in this &&
	          this[from] === elt)
	        return from;
	    }
	    return -1;
	  };
	}
}