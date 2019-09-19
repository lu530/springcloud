var map =null;
var areaData = {};
var choroplethLayer = null;
$(function(){
	initMap();
});

//今日人员抓拍
function initFaceCaptureDraw(faceCaptureData){
	
	var data = faceCaptureData.faceCaptureArr;
	$('#todayFaceNum').html(data[data.length-1]);
	var colorArr = [];
	for(var i = 0;i<data.length;i++){
		if(i%2){
			colorArr.push('#4881f2');
		}else{
			colorArr.push('#21c1a9');
		}
	}
	
	var barDrawSeriesDatas = {
			seriesDatas:[{
							data:data,
			                barWidth:5,
			                colorList:colorArr
						}],
			yTitle:'人脸张数/千',
			xDatas:faceCaptureData.faceCaptureDate,
			color:'transparent',
			barWidth:8,
			axisColor:'#9db4d4',
			titleColor:'#9db4d4',
			xsplitLineColor:'transparent',
			ysplitLineColor:'#9db4d4',
			isAxisTick:false,
			barMinHeight:0
	}
	var dayBarDraw = getBarDrawOption(barDrawSeriesDatas);
	drawCharts('todayFaceCaptureReport', dayBarDraw);

}

//区域人脸统计
function initAreaFaceDraw(areaFaceData){
	var xData = areaFaceData.areaFaceCityArr || [];
	var colorArr = [];
	for(var i = 0;i<xData.length;i++){
		if(i%2){
			colorArr.push('#1578cb');
		}else{
			colorArr.push('#4881f2');
		}
	}
	
	var barDrawSeriesDatas = {
			seriesDatas:[{
				data:areaFaceData.areaFaceNumArr,
				colorList:colorArr
			}],
			xDatas:xData,
			yTitle:'人次/千',
			changeAxis:true,
			color:'transparent',
			barWidth:8,
			axisColor:'#9db4d4',
			titleColor:'#9db4d4',
			xsplitLineColor:'rgba(157,180,212,0.3)',
			ysplitLineColor:'transparent',
			isAxisTick:false,
			isshowXAxis:false,
			rightPadding:"20%",
			topPadding:"0%",
			barMinHeight:0
	}
	var dayBarDraw = getBarDrawOption(barDrawSeriesDatas);
	var areaFaceReport = drawCharts('areaFaceReport', dayBarDraw);
	
	areaFaceReport.on('click',  function (param) {
		UI.util.showLoadingPanel('','currentPage');
		var orgCode = '';
		if( areaData ){
			for(var i = 0; i < areaData.length; i++ ){
				if( areaData[i].ORG_NAME == param.name ){
					orgCode = areaData[i].ORG_CODE;
					break;
				}
			}
		}
		UI.control.remoteCall("face/statistic/areaFace",{ ORG_CODE:orgCode}, function(reply){
			drawAreaChoropletLayer(reply.data);
			UI.util.hideLoadingPanel('currentPage');
		}, null, {async: true }, true);
	});
}


//人脸检索服务
function faceSearchDraw(faceSearchMonthData){
	$("#monthFaceNum").html(addArrNum(faceSearchMonthData.faceSearchMonthNumArr));
	//案件月份统计
	var seriesDatas = [{
		data:faceSearchMonthData.faceSearchMonthNumArr||[],
		bgcolor:'transparent'
	}];
	//横坐标
	var xDesc = faceSearchMonthData.faceMonthArr || [];
	var options = {
			splitLineColor:'rgba(157,180,212,0.3)',
			axisTickColor:'transparent',
			axisLabelColor:'#9db4d4',
			yTitle:'人次/千',
			titleColor:'#9db4d4',
	}
	var monthlyOption = getLineDrawOption(xDesc, seriesDatas, options);
	drawCharts('flowPersonReport', monthlyOption);
}

//人员总资源
function initFaceResource(faceByIndiceData){
	$("#libraryFaceNum").html(addArrNum(faceByIndiceData.facefaceByIndiceValueArr)/1000);
	//案件类型统计
	var faceByIndiceArr = [];
	for(var i = 0;i<faceByIndiceData.facefaceByIndiceNameArr.length;i++){
		faceByIndiceArr[i] = {};
		if(i<4){
			faceByIndiceArr[i].color = faceByIndiceData.facefaceByIndiceColorArr[i];
			faceByIndiceArr[i].name = faceByIndiceData.facefaceByIndiceNameArr[i];
			faceByIndiceArr[i].value = faceByIndiceData.facefaceByIndiceValueArr[i];
		}else{
			faceByIndiceArr[i].name = faceByIndiceData.facefaceByIndiceNameArr[i];
			faceByIndiceArr[i].value = faceByIndiceData.facefaceByIndiceValueArr[i];
		}
		
	}
	var typePIEOptions = {
			seriesDatas:faceByIndiceArr,
             isLableData:true,
             legendX:'5%',
             legendY:'5%',
             center:['60%','50%'],
             pieRadius:['50%', '55%'],
             isshowYAxis:false,
             legendColor:'#9db4d4',
             orient:'vertical'
	}
	var typeOption = getPIEDrawOption(typePIEOptions);
	drawCharts('totalResourcesReport', typeOption);
}

function getDescByWeek(){
	var myDate = new Date();
	myDate.setDate(myDate.getDate() - 6);
	var weekDateArray = []; 
	var dateTemp; 
	var flag = 1; 
	for (var i = 0; i < 7; i++) {
	    dateTemp = (myDate.getMonth()+1)+"."+myDate.getDate();
	    weekDateArray.push(dateTemp);
	    myDate.setDate(myDate.getDate() + flag);
	}
	return weekDateArray;
}

function initMap(){
	/*require(["suntek"],function(SuntekMap){
		var labelTextCollision = new L.LabelTextCollision({
			  collisionFlg : true
			});
		map = new SuntekMap("map",{
			center:[23.11,113.33],
			zoom:17,
			renderer:labelTextCollision,
			zoomControl:false 
			});	
		var baseLayerURL = "http://172.16.56.4:6080/arcgis/rest/services/bigdata4/MapServer";//testBigData
		L.ags.baseLayer({url:baseLayerURL}).addTo(map);	
		map.fitBounds([
		               [23.134,113.30],
		               [23.138,113.365]
		           ]);//初始化地图范围
		map.on("click",function(e){
		});
	});*/
	var options = {
			zoomControl:false,
	        closePopupOnClick: true,//点击地图其它地方是否关闭Popup框
	        baseMapIndex: 2//统计底图
	    };
	UI.map.init(options, function(_map){
		initData();
	});
}
function initData(){
	var nowDate = new Date(); 
	var beginDate= new Date();
	var beginMonth = new Date();
	var monthDate = new Date();
	beginDate.setDate(beginDate.getDate() - 6);
	beginMonth.setMonth(beginMonth.getMonth() - 5);
	beginMonth.setHours(0);
	beginMonth.setMinutes(0);
	beginMonth.setSeconds(0);
	
	monthDate.setMonth(monthDate.getMonth() - 6);
	var beginDateString = beginDate.format("yyyy-MM-dd HH:mm:ss");
	var nowDateString = nowDate.format("yyyy-MM-dd HH:mm:ss");
	var beginMonthString = beginMonth.format("yyyy-MM-dd HH:mm:ss");
	var commonParam={
			BEGIN_TIME:beginDateString,
			END_TIME:nowDateString,
	}
	var monthParam = {
			BEGIN_TIME:beginMonthString,			
			END_TIME:nowDateString,
	}
	paraAreaFaceService();
	captureDataService({END_TIME:nowDateString});
	libraryDataService({});
	monthDataService(monthParam);
	deviceDataService();
}

//画出区域热力图
function drawAreaChoropletLayer(data){
	var options = {
			closePopupOnClick: true,
			showPopup: false,
			getColor:function(d){
				return d > 10000 ? '#800026' :
					   d > 5000  ? '#BD0026' :
					   d > 2000  ? '#E31A1C' :
					   d > 1000  ? '#FC4E2A' :
					   d > 500   ? '#FD8D3C' :
					   d > 200   ? '#FEB24C' :
					   d > 100   ? '#FED976' :
								  '#FFEDA0' ;
			},
			style:function(properties){
				return {fillColor: this.getColor(properties.NUM),
						weight: 2,
						opacity: 1,
						color: 'white',
						dashArray: '3',
						fillOpacity: 1
				};
			},
			highlightFeature:function(e) {
				var layer = e.target;

				layer.setStyle({
					weight: 5,
					color: '#666',
					dashArray: '',
					fillOpacity: 1
				});

				if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
					layer.bringToFront();
				}
			}
		/* popupHtmlFun: function(obj){
			return '<div style="width: 200px;height: 100px">' + obj.ORG_NAME + '</div>';
		}	 */
	};
	if(choroplethLayer != null){
		choroplethLayer.clearLayers();
	}
	choroplethLayer = UI.map.choroplethLayer(options,data, "SHAPE");
	
}

//按区域人脸统计请求服务
function paraAreaFaceService(){

	UI.util.showLoadingPanel('','currentPage');
	UI.control.remoteCall("face/statistic/areaFace", {}, function(reply){
		
		if(reply){
			var areaFaceData = {};
			areaFaceData.areaFaceCityArr = [];
			areaFaceData.areaFaceNumArr = [];
			if(reply.data.length==0){
				areaFaceData.areaFaceCityArr.push("");
				areaFaceData.areaFaceNumArr.push(0);
			}else{
				for(var i = 0 ; i<reply.data.length;i++ ){
					areaFaceData.areaFaceCityArr.push(reply.data[i].ORG_NAME);
					areaFaceData.areaFaceNumArr.push(reply.data[i].NUM/1000);
				}
			} 
			initAreaFaceDraw(areaFaceData);
		
			drawAreaChoropletLayer(reply.data);
			areaData = reply.data;
			UI.util.hideLoadingPanel('currentPage');
			
		}else{
			UI.util.alert('暂无区域人脸采集统计数据','wran');
		}
		
	}, null, {async: true }, true);
	
}



//按天数人脸统计请求服务  
function captureDataService(param){
	UI.control.remoteCall("face/statistic/captureDataByDay", param, function(reply){
		var faceCaptureData={};
		faceCaptureData.faceCaptureArr=[];
		faceCaptureData.faceCaptureDate = [];
		if(JSON.stringify(reply.data) == "{}"){
			for(var i = 0 ; i<7;i++){
				faceCaptureData.faceCaptureArr.push(0); 
			}
			faceCaptureData.faceCaptureDate=getDescByWeek();
		}else{
			for(var i = 0;i<reply.data.length;i++){
				faceCaptureData.faceCaptureArr.push(reply.data[i].NUM/1000);
				faceCaptureData.faceCaptureDate.push(parseInt(reply.data[i].DATE.slice(2,4))+"月"+parseInt(reply.data[i].DATE.slice(4,6))+"日");
			}
			
		}
		initFaceCaptureDraw(faceCaptureData);
		
	}, null, {async: true }, true);
}
//按库人脸统计请求服务
function libraryDataService(param){
	var faceByIndiceData = {};
	faceByIndiceData.facefaceByIndiceNameArr = [];
	faceByIndiceData.facefaceByIndiceValueArr = [];
	faceByIndiceData.facefaceByIndiceColorArr = ["#4981f0","#21c1a9","#f39847","#f25254"];
	UI.control.remoteCall("face/statistic/dataByDb", param, function(reply){
		if(JSON.stringify(reply.data) == "{}"){
			faceByIndiceData.facefaceByIndiceNameArr.push("其他");
			faceByIndiceData.facefaceByIndiceValueArr.push(0);
		}else{
			for(var i = 0; i < reply.data.length; i++ ){
				faceByIndiceData.facefaceByIndiceNameArr.push(reply.data[i].NAME);
				faceByIndiceData.facefaceByIndiceValueArr.push(reply.data[i].NUM);
			}
		}
		initFaceResource(faceByIndiceData)
	}, null, {async: true }, true);
}
//按月人脸统计请求服务
function monthDataService(param){
	UI.control.remoteCall("face/statistic/captureDataByMonth", param, function(reply){
		var faceSearchMonthData = {};
		faceSearchMonthData.faceSearchMonthNumArr = [];
		faceSearchMonthData.faceMonthArr = [];
		var monthDate = new Date();
		var monthArr = [];
		var month = "";
		if(reply.data.length == 0){
			faceSearchMonthData.faceMonthArr = nearMonth(6);
			faceSearchMonthData.faceSearchMonthNumArr=noData(faceSearchMonthData.faceMonthArr);
		}else{
			for(var i = 0; i < reply.data.length; i++){
				faceSearchMonthData.faceMonthArr.push(parseInt(reply.data[i].DATE.slice(0,2))+"年"+parseInt(reply.data[i].DATE.slice(2,4))+"月");
				faceSearchMonthData.faceSearchMonthNumArr.push(reply.data[i].NUM/1000);
			}
			monthDate.setFullYear(parseInt("20"+reply.data[0].DATE.slice(0,2)));
			monthDate.setMonth(parseInt(reply.data[0].DATE.slice(2,4))-1);
			for(var j = 0; j < 6-i; j++){
				faceSearchMonthData.faceMonthArr.unshift(parseInt(monthDate.getFullYear().toString().slice(2,4))+"年"+parseInt(monthDate.getMonth().toString())+"月");
				faceSearchMonthData.faceSearchMonthNumArr.unshift(0);
				monthDate.setMonth(monthDate.getMonth()-1);
			}
			
		}
	
		faceSearchDraw(faceSearchMonthData);
	}, null, {async: true }, true);
}
//获取设备数量的服务
function deviceDataService(){
	UI.control.remoteCall("face/statistic/cameraDevice", {}, function(reply){
		if(reply.data.NUM){
			$("#deviceNum").html(reply.data.NUM);
		}else{
			$("#deviceNum").html(0);
		}
		
	}, null, {async: true }, true);
}
//将数组的数字加起来
function addArrNum(numArr){
	var numArr = numArr || [];
	var resultNum = 0;
	for(var i =0;i<numArr.length;i++){
		resultNum+=parseInt(numArr[i]);
	}
	return resultNum;
}
//返回数据为空时的处理
function noData(oldData){
	var num = [];
	if(oldData.length == 0){
		return [0];
	}else{
		for(var i = 0;i<oldData.length;i++){
			num.push(0);
		}
	}
	return num;
}
//获取最近6个月
function nearMonth(num){
	var monthArr = [];
	var monthDate = new Date();
	monthDate.setMonth(monthDate.getMonth()-num);
	for(var i = 0; i<=num; i++){
		monthDate.setMonth(monthDate.getMonth()+1);
		monthArr.push(monthDate.format("yy年MM月"));
	}
	return monthArr;
}