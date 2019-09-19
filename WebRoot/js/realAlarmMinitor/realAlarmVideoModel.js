var treeService = UI.util.getUrlParam("treeService")||'user/structure/num/getTree';//获取树服务
var listService = UI.util.getUrlParam("listService")||'cp/device/getDeviceList';//获取列表服务
var deviceType = UI.util.getUrlParam("deviceType")||'194';//获取列表服务
var queryParams = {};
/*var videoType = 1;//实时视频*/
var subscibeDeviceIdArr = [];//现在订阅的设备
var videoPlayer = null;
var firstClickVideo = true;//第一次点击摄像机
//设备树初始化参数
var orgTreeOpts = {
	multiple: false,
	service:treeService,
	leafService: function(treeNode){//延迟加载
		var orgCode = treeNode.ORG_CODE;
		return listService+'?id=result&CASCADE=0&ORG_CODE='+orgCode+'&DEVICE_TYPE='+deviceType+'&KEYWORDS=';
	}, 
	leafNodeRender: treeNodeRender
};
var structureTreeParam={
	deviceType : deviceType,
	isShowNum:true
}
var orgCode = '';

var orgTree = null;//设备树


$(function() {
	UI.control.init();			
	initPage();
	compatibleIndexOf();//兼容ie8indexOf
	UI.util.tabs();//tab切换
	initEvent();
	
	initSearch();//设备检索
	
	initTree();//设备树注册事件
	

});
/*离开页面时，取消订阅*/
$(window).unload(function(){
  if(subscibeDeviceIdArr.length>0){
  		for(var i=0;i<subscibeDeviceIdArr.length;i++){
  			top.window.datacollectCancelSubscribe(subscibeDeviceIdArr[i]);
  		}
		subscibeDeviceIdArr = [];
	}
});
function initPage(){
	$("#videoPlayer").load("/VMOCX/ocx.jsp", function(){
		initVideoPlayer();
	});
	setAlarmBoxWidth();
	$(".scroll-box").mCustomScrollbar({horizontalScroll:true});
	if($("#liveVideoBox").hasClass("hide")){
		$("#liveVideoBox").removeClass("hide");
	}
}


function initEvent(){
	//左侧边栏隐藏与展示
	$(".leftHide").on("click",function(){
		$("body").toggleClass("left-part-hide");
	})
	//下侧边栏隐藏与展示
	$(".bottom-hide").on("click",function(){
		$("body").toggleClass("bottom-part-hide");
	})
	
	//收藏
	$("body").on("click",".collectionBtn",function(){
		var ref = $(this).attr("ref");
		UI.util.showCommonWindow(ref, "收藏文件夹", 
				600, 450, function(obj){
		});
	});
	// 播放 
	$("#playVideoRecord").click(function(){
		if(subscibeDeviceIdArr.length>0){
			var winIndex = videoPlayer.getFocusWinIndex();
			videoPlayer.reViewDvrHistory(winIndex);
		}
	});
	
	// 停止
	$("#suspendRecord").click(function(){
		if(subscibeDeviceIdArr.length>0){
			var winIndex = videoPlayer.getFocusWinIndex();
			videoPlayer.stopWin(winIndex);
		}
	});
	//多屏
	$("body").on("click",".multiScreen",function(){
		var $this = $(this);
		var activeIcon = $this.find(".icon-real-alarm");
		var screenNumInt = $this.attr("screenNum");
		activeIcon.addClass("active");
		$this.siblings().find(".icon-real-alarm").removeClass("active");
		videoPlayer.setWindowNumber(screenNumInt);
	})
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
	
    //详情
    $("body").on("click",".detailFace",function(){
    	var $this = $(this);
    	var objPic = $this.attr("objPic")||"";
    	var LATITUDE = $this.attr("LATITUDE")||"";
    	var LONGITUDE = $this.attr("LONGITUDE")||"";
    	var jgsk = $this.attr("jgsk")||"";
    	var deviceAddr = $this.attr("deviceAddr")||"";
    	var faceImg = $this.attr("faceImg")||"";
    	var deviceId = $this.attr("deviceId")||"";
    	var deviceName = $this.attr("deviceName")||"";
    	var infoId = $this.attr("infoId")||"";
    	var pic = $this.attr("pic")||"";
    	var captureTime = $this.attr("captureTime")||"";
    	var frameImg = $this.attr("frameImg")||"";
    	var url = "/efacecloud/page/realAlarmMinitor/facePhotoDetail.html?objPic="+objPic+"&LATITUDE="+LATITUDE+"&LONGITUDE="+LONGITUDE+"&jgsk="+jgsk+"&deviceAddr="
    	+deviceAddr+"&faceImg="+faceImg+"&deviceId="+deviceId+"&deviceName="+deviceName+"&infoId="+infoId+"&pic="+pic+"&captureTime="+captureTime+"&frameImg="+frameImg;
    		UI.util.showCommonWindow(url, "抓拍详情", 
					1004,751, function(obj){
			});
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
	/*搜索树点击事件*/
    $("#searchList").on("click","li",function(){
    	var deviceID = $(this).attr("deviceid");
    	var node = {
    		DEVICE_ID:deviceID
    	}
   		playVideo(node);
   		subscribeDevicePhoto(node);
    })
}




//初始化下拉选择框
function initTree(opts){
	var defaults = {
			structureTree:"structureTree"
		}
	var opts = $.extend(true, defaults, opts);
	
	//移除设备CheckBox
	$('#'+opts.structureTree+" [deviceid]").parent().siblings('[treenode_check]').css("visibility","hidden");
	
	var curOrgTree = UI.control.getControlById(opts.structureTree);
	
	curOrgTree.bindEvent('onClick', function(event, treeId, treeNode) {
    	if(treeNode && treeNode.DEVICE_ID){
    		playVideo(treeNode);
    		subscribeDevicePhoto(treeNode);
    	}
    });
    
	
	if(opts.structureTree == 'structureTree'){
    	orgTree = curOrgTree;
    }else{
    	groupOrgTree = curOrgTree;
    }
    
}

//搜索查询
function initSearch(opts){
	var defaults = {
		search:"#search",
		searchCon:"#searchCon",
		clearSearchTextBtn:"#clearSearchTextBtn",
		structureTreeWrap:"#structureTreeWrap"
	}
	var opts = $.extend(true, defaults, opts);
	$(opts.search).click(function(){
		if($(opts.searchCon).val()!=''){ 
			doTreeSearch(opts);
		}
	});        	
	$(opts.searchCon).keyup(function(event){
		$(opts.clearSearchTextBtn)[$(this).val()!=""?"removeClass":"addClass"]('hide');
		if(event.which==13 && $(this).val()!=''){ 
			doTreeSearch(opts);
		}
		if(event.which==8 && $(this).val()==''){ 
			$(opts.structureTreeWrap).addClass("active").siblings().removeClass("active");
		}
	});
	$(opts.clearSearchTextBtn).click(function(){
		$(opts.searchCon).val('');
		$(this).addClass('hide');
		doTreeSearch(opts,'clear');
	});
}

function doTreeSearch(opts,param){
	
	if(param == "clear"){
		$(opts.structureTreeWrap).addClass("active").siblings().removeClass("active");
		return ;
	}
	var searchCon = $(opts.searchCon).val()	
	var queryParams = {
		KEYWORDS:searchCon,
		DEVICE_TYPE:deviceType,
		ORG_CODE:orgCode,
		CASCADE:1
	}
	UI.control.remoteCall(listService,queryParams,function(resp){
		$("#searchList").html(tmpl("cameraListTemplate", resp.data));
		$("#deviceListWrap").addClass("active").siblings().removeClass("active");
	});
}
//插入设备到列表
function treeNodeRender(node){
	return $.extend({
		text: '<span class="tree-con" deviceid="'+node.DEVICE_ID+'" title="'+node.DEVICE_NAME+'" ><span class="camera-icon mr10"></span><span class="text-overflow" style="max-width: 350px;">' + node.DEVICE_NAME + '</span></span>',
		id: node.DEVICE_ID
	}, node);
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

//选中设备，播放视频
function playVideo(node){
	var currentVideoNode = {ISVALID:1, DEVICE_ID:node.DEVICE_ID};
	playVideoAtWin(currentVideoNode);
}
//根据设备订阅显示抓拍信息
function showDevicePhotoData(data){
	if(data.DATA_TYPE && data.DATA_TYPE=='FACE_CAPTURE'){
		var contentStr = tmpl("devicePhotoData",data);
		$(".alarmBox").prepend(contentStr);
		if($(".alarmBox").find(".vertical").length>100){
			$(".alarmBox").find(".vertical").last().remove();
		}
		setAlarmBoxWidth();
	}
}
//播放视频
function initVideoPlayer(){
	
	videoPlayer = $("#videoPlayerCenter").suntekplayer().data("suntekplayer");
	videoPlayer.bind("onInit", function(s){
		
		//设置TCP流协议
		var realConf = UI.control.getDataById("realConf");
		if(realConf && realConf.GB_TCP_STREAM_PROTOCOL){
			videoPlayer.setGbTcpStreamProtocol(realConf.GB_TCP_STREAM_PROTOCOL);
		}
		
		//设置控件右键
		initOcxMenuPriv();
		var isSip  = videoPlayer.getWinParam(0,"SIP");
		UI.util.debug("获取是否sip参数返回："+isSip);
		if(isSip == "-1"){
			var serverInfo = getCgServerInfo();
			videoPlayer.sipRegisterNew(serverInfo);
		}
	});		
	
	videoPlayer.bind("onSipInit", function(s){
		UI.util.debug('sip初始化成功，开始播放视频');
		/*initPlayInfo();*/
	});
	
	
	videoPlayer.bind("onVideoReOpenEvent", function(s, modeId, playUrl, videoId, winId){
		var playModel = videoPlayer.getPlayInfo(winId);
		if(playModel){
			videoPlayer.playVideoAtWin(playModel.playUrl, winId, playModel);
		}
	});
}

/*var isInitPlay = false;
function initPlayInfo(){
	
	if(!isInitPlay){
		UI.util.debug("初始化播放视频");
		isInitPlay = true;
		var videoInfo = {DEVICE_ID:"", ISVALID:1,};
		playVideoAtWin(videoInfo, 0);
	}
}
*/


/**
 * 在指定窗口播放视频
 * @param videoInfo
 * @param wnd 窗口index
 */
function playVideoAtWin(videoInfo, wnd){
	videoPlayer.stopFocus();
	if(videoInfo.ISVALID!="1"){
		UI.util.alert("摄像机未启用，无法播放","warn");
		return;
	}
	if(!wnd && wnd!=0){
		wnd = videoPlayer.getFocusWinIndex();
	}
	var videoModel = {};
	var tranMode = videoPlayer.getTranMode();
	var conncectType = top.conncectType ==undefined?1:top.conncectType;
	var params = {DEVICE_ID: videoInfo.DEVICE_ID,
			videoType:1,
			tranMode:tranMode, 
			conncectType:conncectType
			};
	UI.control.remoteCall('video/getReal', params, function(resp){
		videoModel = resp.playVideo;
		copyTo(videoInfo, videoModel);		
		videoModel.positionList = cloneArray(resp.positionList);
		UI.util.debug("云台状态："+videoModel.PTZCTRLTYPE);
		var playModel = new RealModel(videoModel);
		UI.util.debug("预置位："+playModel.presetIndex);
		if(playModel && playModel.playUrl){
			UI.util.debug("视频链接："+playModel.playUrl);
			videoPlayer.playVideoAtWin(playModel.playUrl, wnd, playModel);
		}
	});
}

function getCgServerInfo(){
	var serverInfo = UI.control.getDataById("videoPlayer");
	
	if(serverInfo == null){
		return null;
	}
	
	return {
		cgServerCode: serverInfo.SERVER_FLAG,
		cgServrIP: serverInfo.HOST_ADDR,
		cgServerPort: serverInfo.SIP_SIPPORT,
		cgServerPwd: serverInfo.CLIENT_PWD,
		clientID: serverInfo.clientCode,
		userIp: serverInfo.userIp
	}
}

//控件右键菜单设置
function initOcxMenuPriv(){
	var realPlayCharacter = "0";//暂时没有字符叠加
	var realPlayCapPic = "0";
	var realPlayRecord = "0";
	var fullMenuSet = "0010"+realPlayCapPic+"000000000000000";
	var allMenuSet = realPlayCapPic +"0000"+ realPlayRecord +"001000000"+realPlayCharacter+"00001";
	try{
		videoPlayer.ctrlPopMenu(1, 0, allMenuSet);
		videoPlayer.ctrlPopMenu(1, 1, fullMenuSet);
	}catch(e){
		UI.util.debug("加载控件右键菜单失败");
	}
}
/*设置人脸抓拍宽度*/
function setAlarmBoxWidth(){
	var alarmBoxWidthInt = $(".alarmBox").find(".tilelist").length*175+40;
	$(".alarmBox").width(alarmBoxWidthInt+"px");
}
/*订阅设备抓拍*/
function subscribeDevicePhoto(node){
	var playInfoMap = videoPlayer.getAllPlayInfo();
	var newSubscibeDeviceIdArr = [];
	for(var key in playInfoMap){
		newSubscibeDeviceIdArr.push(playInfoMap[key].videoID);
	}
	for(var i=0;i<subscibeDeviceIdArr.length;i++){
		//注销已经不在的设备
		if(newSubscibeDeviceIdArr.indexOf(subscibeDeviceIdArr[i])=="-1"){
			top.window.datacollectCancelSubscribe(subscibeDeviceIdArr[i]);
		}
	}
	if(subscibeDeviceIdArr.indexOf(node.DEVICE_ID)=="-1"){
		//订阅
		subscibeDeviceIdArr=newSubscibeDeviceIdArr;
		top.window.datacollectSubscribe(node.DEVICE_ID,showDevicePhotoData);	
	}
}
/**
 * @Author linzewei
 * @version 2018-07-31
 * @description 点击菜单时用于隐藏菜单
 */
function hideVideoBox(){
	$("#liveVideoBox").addClass("hide");
}
