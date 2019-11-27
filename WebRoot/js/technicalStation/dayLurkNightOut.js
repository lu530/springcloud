var result=null;
var personLine = null;//轨迹线
var type = UI.util.getUrlParam('type') || '';

$(function() {
	UI.control.init();
	initPage();
	initEvent();
	doSearch();
	initWaterMark();
});

function initPage () {

	if(type === 'lateNight') {
		$('.pageTitle').html('深夜出入分析结果');			//	深夜出入
	}
}

function initEvent(){
	
	//返回总次数
	$("#timesBtn").click(function(){
		$(this).parents(".tab-pane").removeClass("active").prev().addClass("active");
		if(personLine){
			personLine.remove();
		}
	});
	
	//次数详情
	$("body").on("click",".list-wrap .showDetailBtn",function(){
		var $this = $(this).parents(".list-node");
		$this.parents(".tab-pane").removeClass("active").next().addClass("active");
		var order=parseInt($this.attr("order"));
		order = order+ pageSize * (currentPage - 1);
		$("#detailList").html(tmpl("detailTempl",result[order]));
		parent.parent.UI.map.drawQuery("delete");		//清除地图框选
		//显示轨迹在地图上
		showTracks(result[order]);
	});
	
	//显示区域次数
	$("body").on("click",".list-wrap .list-node",function(){
		if(parent.regionDeviceList){
			var $this = $(this),
				order=parseInt($this.attr("order")),
				regionLen = parent.regionDeviceList.regionLen;
				
			order = order+ pageSize * (currentPage - 1);
			var data = result[order];
		
			for(var j=1;j<=regionLen;j++){
				parent.regionDeviceList["regionNum"+j] = 0;
			}
		
			$.each(data,function(i,n){
				for(var j=1;j<=regionLen;j++){
					var dataArr = parent.regionDeviceList["region"+j];
					var index = dataArr.indexOf(n.ORIGINAL_DEVICE_ID);
					if(index>-1){
						parent.regionDeviceList["regionNum"+j]++;
					}
				}
			});
			
			for(var j=1;j<=regionLen;j++){
				var txt = "区域"+j+"(";
				var curTimes = parent.regionDeviceList["regionNum"+j];
				parent.regionDeviceList["regionShape"+j].updateText(txt+curTimes+"次)");
				if(j == 1){
					var latlngs = parent.regionDeviceList["latLngs"+j];
					
					//定位
					parent.regionDeviceList["regionShape"+j].zoomTo();
					//parent.parent.UI.map.getMap().fitBounds(parent.L.latLngBounds(latlngs));
				}
			}
		}
	});
	
	//详情中每条记录
	//显示当前气泡
	$("body").on("click",".list-node.detail",function(){
		var id = $(this).attr("index");
		if(personLine){
			personLine.showPopup(id);//根据ID显示气泡
		}
	});
	
	//图片放大
	/*$("body").on("click","[attrimg='zoom']",function(){
		var $this = $(this);
		var url = $this.attr("src");
		var options = {
				isSlide: false,
				series:[url]
		}
		top.$.photoZoom(options);
	});*/
	
	//返回
	$('body').on('click','#backBtn',function(){
		parent.hideForm();
		parent.parent.UI.map.drawQuery("delete");//清除地图框选
	});
	
	$("[listview-next-btn]").click(function(){
		if(!$(this).hasClass("disable")){
			var end = (currentPage+1)*pageSize > totalNum ? totalNum : (currentPage+1)*pageSize;
			var curShowData = result.slice(currentPage*pageSize, end);
			$("#collisionList").html(tmpl("listTempl", curShowData));
			$(".tilelist").removeClass("hide");
			return false;
		}
	});

	$("[listview-prev-btn]").click(function(){
		if(!$(this).hasClass("disable")){
			var curShowData = result.slice((currentPage-2)*pageSize, (currentPage-1)*pageSize);
			$("#collisionList").html(tmpl("listTempl", curShowData));
			$(".tilelist").removeClass("hide");
			return false;
		}
	});
}

//展示地图轨迹
function showTracks(mapData){
	var mapObjArr = [];
	
	$.each(mapData,function(i,n){
		var mapObj = {};
		mapObj.id = i;
		mapObj.title = i+1;
		/*mapObj.addr = n.DEVICE_ADDR;*/
		mapObj.url = n.OBJ_PIC;
		mapObj.time = n.TIME;
		mapObj.latlng = [parseFloat(n.Y),parseFloat(n.X)];
		mapObj.name = n.DEVICE_NAME || "";
		mapObjArr.push(mapObj);
	});
	
	var isSame = true;
	$.each(mapObjArr,function(i,n){
		if(i<mapObjArr.length&&(i+1)<mapObjArr.length){
			if(mapObjArr[i].latlng[0] != mapObjArr[i+1].latlng[0] ){
				if(mapObjArr[i].latlng[1] != mapObjArr[i+1].latlng[1] ){
					isSame = false;
				}
			}
		}
	});
	
	if(!isSame){
    	var routePopup = '<div class="maplayer-wrap">'+
							'<div class="layer camera">'+
								'<div class="layer-caption">'+
									'<div class="title">{%=o.name%}</div>'+
								'</div>'+
								'<div class="layer-content con2">'+
									'<div class="main-msg left-msg">'+
										'<img src="{%=o.url%}" attrimg="zoom">'+
										'<p>抓拍时间：<span class="iB-span">{%=o.time%}</span></p>'+
										/*'<p>抓拍地点：<span class="iB-span">{%=o.addr%}</span></p>'+*/
									'</div>'+
								'</div>'+
							'</div>'+
						'</div>';
		if(personLine){
			personLine.remove();
		}
		
		var opts = {
    			routeLineInfo:mapObjArr,
    			routePopup:routePopup,
    			lineOpacity:0
    	};
		personLine = parent.parent.showTracksOnMap(opts);
	}else{
		UI.util.alert("经纬度相同，不能绘画轨迹！",'warn');
	}
}

//显示信息
function doSearch(){

	UI.util.showLoadingPanel();

	var url = "technicalTactics/dayHideNightActive/query";	//	默认为昼伏夜出

	if(type === 'lateNight') {
		url = 'technicalTactics/NightActive/query'			//	深夜出入
	}

    UI.control.remoteCall(url, parent.queryParams,function(resp){

    	if(resp.DATA.length>0){
			result = resp.DATA;
			initTechnicalPage(result.length,true);//技战法分页
			var curShowData = result.slice(0,pageSize);
			$("#collisionList").html(tmpl("listTempl", curShowData));
	    	UI.util.hideLoadingPanel();
		}else{
			UI.util.alert("查询结果为空","warn");
			$("#collisionList").html('<div class="nodata"></div>');
	    	UI.util.hideLoadingPanel();
		}
	},function(){},{},true);
}


