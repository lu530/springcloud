 var data = {
	objPic : UI.util.getUrlParam("objPic")||"",
	LATITUDE : UI.util.getUrlParam("LATITUDE")||"",
	LONGITUDE : UI.util.getUrlParam("LONGITUDE")||"",
	jgsk : UI.util.getUrlParam("jgsk")||"",
	deviceAddr : UI.util.getUrlParam("deviceAddr")||"",
	faceImg : UI.util.getUrlParam("faceImg"),
	deviceId : UI.util.getUrlParam("deviceId")||"",
	deviceName : UI.util.getUrlParam("deviceName")||"",
	pic : UI.util.getUrlParam("pic")||"",
	infoId : UI.util.getUrlParam("infoId")||"",
	captureTime : UI.util.getUrlParam("captureTime")||"",
	frameImg : UI.util.getUrlParam("frameImg")||""
}
$(function(){
	initPage();
	initEvent();
})

function initPage(){
	$("#photoContent").html(tmpl("photoTemplate",data));
}
function initEvent(){
	//收藏
	$("body").on("click",".collectionBtn",function(){
		var ref = $(this).attr("ref");
		UI.util.showCommonWindow(ref, "收藏文件夹", 
				600, 450, function(obj){
		});
	});
	
	//图片定位
	$("body").on("click",".locationBtn",function(){
		var $this = $(this);
		var ref = $this.attr("ref"),
			time = $this.attr('attr-time'),
			addr = $this.attr('attr-addr'),
			imgUrl = $this.attr('fileUrl'),
			longitude = parseFloat($this.attr('LONGITUDE')),
			latitude = parseFloat($this.attr('LATITUDE'));
		if(longitude && longitude && longitude != 0 && longitude !=0){
			var url = ref+'?time='+time+'&addr='+addr+'&imgUrl='+imgUrl+'&longitude='+longitude+'&latitude='+latitude;
			UI.util.showCommonWindow(url, "定位", 
					$(top.window).width()*.95, $(top.window).height()*.9, function(obj){
			});
		}else{
			UI.util.alert("经纬度不合法！", "warn");
		}
	});
	
	//轨迹分析
	$("body").on("click",".trajectory-search",function(){
        var url = $(this).attr("url");
        var time = {
        	bT: UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").bT,
        	eT: UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").eT
        }
		openWindowPopup('track',url, time,'faceCaptureList');
	});
	//搜索
	$("body").on("click",".searchBtn",function(){
		var imgSrc = $(this).attr("imgSrc");
		var curSrc = matcher('/efacecloud/page/library/faceCaptureList.html/' + top.projectID).url;
		curSrc += "?imgSrc="+imgSrc;
		UI.util.showCommonWindow(curSrc,"路人库检索", 1200, 700,
	      		function(resp){
	      	});
        
	})
	//以人搜人
	$("body").on("click",".searchPeoson",function(){
		var imgSrc = $(this).attr("imgSrc");
		UI.util.showCommonWindow("/datadefence/page/retrieval/structuredSearch.html?imgSrc="+imgSrc,"以人搜人", 1200, 700,
	      		function(resp){
	      	});
        
	})
}
