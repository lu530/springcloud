var appToken = 0x31001;//上传图片永久存储
var curOrgCode = "";
var fileUrl = "";
var keyWords = "";
var searchTime;
var trackData ='';  // 轨迹分析数据
var beginTime  = UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").bT,  //页面默认选中今天
	endTime = UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").eT;

$('#beginTime').val(beginTime);
$('#endTime').val(endTime);
var playOpts;

var pageLoadType = UI.util.getUrlParam("pageLoadType")|| 'false';
var pageType = UI.util.getUrlParam("pageType")||"";
var imgSrc = UI.util.getUrlParam("imgSrc")||"";
var isUpload =  UI.util.getUrlParam("isUpload") ||UPLOAD_RETRIEW_FALSE;   //0表示不是通过上传图片检索(不需要入排查库)；1表示上传图片检索(需要入排查库)
var imgUrl = UI.util.getUrlParam("imgUrl")|| '';

var scanData = [];  //缓存人脸扫描结果
var queryParams={
		ALGO_LIST:imgSrc?'[{"ALGO_TYPE":"-1","THRESHOLD":"60"}]':"",
		FILE_ID:imgSrc?getFileid(imgSrc,true):"",
		pageSize:20,
		THRESHOLD:60,
		DEVICE_IDS:"",
		KEYWORDS:"",
		PIC:imgSrc,
		BEGIN_TIME:beginTime,
		END_TIME:endTime,
		SORT_FIELD: 'JGSK',
		TOPN:60,
		TIME_SORT_TYPE: 'DESC',
		isAsync: true
	};

var uiOptions = {
	isMedia:false,
	unload: imgSrc !=''? true: false
}

var timeOption = {
		'elem':$('#timeTagList'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'callback':getSearchTime
};

$(function() {
	UI.control.init();
    window.getAlgoList = slideFn('face/common/getFaceAlgoList');
	initEvent();
	compatibleIndexOf();
	/*initTime();*/
	initDateTimeControl(timeOption);
	initData();
    topSpecialUploadPic();

});

function initData(){
	//初始化图片
	if(imgSrc != ""){
		queryParams.SORT_FIELD = 'SCORE';
		queryParams.TIME_SORT_TYPE = '';
		$('[type="scoreSort"]').addClass('active').siblings().removeClass('active');
		$('#filterImg').attr('src', imgSrc);
		$('.bottom-pic-bar').removeClass('hide');//阈值框出现
//		bigImg = global.fileid;
        global.fileid = getFileid(imgSrc,true);
        
        if($(".arithmetic-tools.on").length==0){ //如果没有选中的算法，默认选择第一种；
			$(".arithmetic-tools:eq(0) i").trigger('click');
		}
        doSearch();
		/*$('#searchBtn').click();*/
		
	}
	
	$("#searchText").val("");
	$('[clearsearchkey="true"]').trigger('keyup');
	
	if (keyWords != "") {
		$('#searchText').val(keyWords);	
	}	
	if(pageLoadType == "true"){
		 $('#searchText').val(UI.util.getUrlParam("keyword"));
	}
	//doSearch();
	
}

//空字符串或者null转变为“未知”
function renderNullToNotKnow(str) {
	if (str == null || str == "" || typeof(str) == "undefined" || str == "PLATE") {
		return "未知";
	} else {
		return str;
	}
}

/**
 * 提供给父页面调用
 */
function searchAll(searchText){
	if(searchText){
		$('#searchText').val(searchText);	
		$('[clearsearchkey="true"]').trigger('keyup');
	}
	doSearch();
}


function initEvent() {

	// 打开人脸扫描页面
	$('#editImgBtn').on('click',function(){
//		var imgUrl = $('#filterImg').attr('src');
		var imgUrl = global.fileid;
		if (imgUrl.slice(-12) != "noPhoto2.png") {  // 已上传图片
			UI.util.showCommonWindow("/efacecloud/page/scan/scan.html?imgUrl="+imgUrl, "扫描", 1200, 700,function(data){
				if(data.faceImg !=''){
					if(!data.isCancel){
						$('#filterImg').attr('src',data.faceImg);
					}
					top.scanData = data.scanData;
//					global.fileid = data.faceImg;
				}
			},null,null,null,null,null,'false');
		}else{  // 未上传图片
			UI.util.alert("请先上传图片,再编辑", "warn");
		}
	})
	
	// 暂时隐掉 "海康算法"
	$('.arithmetic-item').each(function(item, index){
		if($(this).find('input').attr('algo_type')  == '40001'){
			$(this).addClass('hide');
		}
	})
	// 列表卡片展示方式
	$('.module').on('click', function(){
		$(this).addClass('active').siblings().removeClass('active');
		var type = $(this).attr('attr-type');
		if(type == 'card'){	//卡片展示
			UI.control.getControlById("faceCollectionList").changeTemplate('faceTemplate');
			$('body').find('#cardBox').removeClass('hide');
			$('body').find('#tableBox').addClass('hide');
			$('body').find('.tableCheck').each(function(i,item){
				$(this).removeAttr('listview-check');
			});
			$('body').find('.nodeCheck').each(function(i,item){
				$(this).attr('listview-check','');
			});
		}else{  // 列表展示
			UI.control.getControlById("faceCollectionList").changeTemplate('faceTableTemplate');
			$('body').find('#cardBox').addClass('hide');
			$('body').find('#tableBox').removeClass('hide');
			$('body').find('.nodeCheck').each(function(i,item){
				$(this).removeAttr('listview-check');
			});
			$('body').find('.tableCheck').each(function(i,item){
				$(this).attr('listview-check','');
			});
		}
		// 若列表初始化无数据,则显示暂未图片
		if($('.pageData').hasClass('hide')){
			$('.listBox').each(function(i,item){
				var parentDom = $(this).parent();
				if(parentDom.find('.nodata').length<1){
					$(this).after('<div class="nodata"></div>');
				}
			})
		}
	});
	
	
	$('.barItem').click(function(){
		var type = $(this).attr('attr-type');
		$('.px-icon').each(function(i,item){
			$(this).removeClass('active');
		})
		switch(type){
			case 'similar':  //相似度
				queryParams.SORT_FIELD = 'SCORE';
				queryParams.TIME_SORT_TYPE = '';
				break;
			case 'time':
				var timepx = $(this).attr('attr-arc');
				if(timepx == 'timeArc'){
					$(this).attr('attr-arc','timeDesc');
					queryParams.SORT_FIELD = 'JGSK';
					queryParams.TIME_SORT_TYPE = 'DESC';
					$('.descIcon').removeClass('hide').siblings().addClass('hide');
				}else{
					$(this).attr('attr-arc','timeArc');
					queryParams.SORT_FIELD = 'JGSK';
					queryParams.TIME_SORT_TYPE ='ASC';
					$('.arcIcon').removeClass('hide').siblings().addClass('hide');
				}
				break;
		}
		doSearch();
	})
	
	//通过卡口树加载设备
	$('#deviceNames').click(function(e){
		//回填数据
		checkDrowDownDeviceList({
			deviceNames:$('#deviceNames').html(),
			deviceId:$('#orgCode').val(),
			deviceIdInt:$('#orgCodeInt').val(),
			orgCode:$("#deviceNames").attr("orgcode")
		});
		
		UI.util.showCommonWindow('/connectplus/page/device/deviceList.html?deviceType=194', '设备选择', 1000, 600,function(resp){
			$('#deviceNames').html(resp.deviceName);
			$('#deviceNames').attr('title',resp.deviceName);
			$('#deviceNames').attr('orgcode',resp.orgCode);
			$('#orgCode').val(resp.deviceId);
			$('#orgCodeInt').val(resp.deviceIdInt);
			
			addDrowdownDeviceList({
				deviceId:resp.deviceId,
				deviceName:resp.deviceName,
				deviceNameList:$("#deviceNameList"),
				dropdownListText:$(".dropdown-list-text")
			});
		});
		e.stopPropagation();
	});
	
	//删除已选设备
	$("body").on("click",".removeDeviceBtn",function(e){
		var $this = $(this);
		var deviceId = $this.attr("deviceid");
		var deviceIdArr = $('#orgCode').val().split(",");
		var deviceIdIntArr = $('#orgCodeInt').val().split(",");
		var deviceNameArr = $('#deviceNames').html().split(",");
		var index = deviceIdArr.indexOf(deviceId),
			orgCode = $("#deviceNames").attr("orgcode"),
			orgCodeArr = orgCode.split(",");
		
		$this.parents("li").remove();
		deviceIdArr.splice(index,1);
		deviceIdIntArr.splice(index,1);
		deviceNameArr.splice(index,1);
		orgCodeArr.splice(index,1);
		$('#orgCode').val(deviceIdArr.join(","));
		$('#orgCodeInt').val(deviceIdIntArr.join(","));
		$('#deviceNames').html(deviceNameArr.join(","));
		$('#deviceNames').attr("title",deviceNameArr.join(","));
		$('#deviceNames').attr("orgcode",orgCodeArr.join(","));
		if($("#deviceNameList li").length == 0){
			$(".dropdown-list-text").attr("data-toggle","");
			$(".dropdown-list-text .dropdown").addClass("hide");
			$(".dropdown-list").removeClass("open");
		}
		
		e.stopPropagation();
	});
	
	//点击进入卡口选择地图
	$('#locate').click(function(){
		UI.util.showCommonWindow('/connectplus/page/device/deviceMap.html?deviceType=194', '感知设备', 1000, 600,function(resp){
			$('#deviceNames').html(resp.deviceName);
			$('#deviceNames').attr('title',resp.deviceName);
			$('#deviceNames').attr('orgcode',resp.orgCode);
			$('#orgCode').val(resp.deviceId);
			$('#orgCodeInt').val(resp.deviceIdInt);
			
			addDrowdownDeviceList({
				deviceId:resp.deviceId,
				deviceName:resp.deviceName,
				deviceNameList:$("#deviceNameList"),
				dropdownListText:$(".dropdown-list-text")
			});
		});
	})
	
	//点击进入详细页面
	$('.library-info').on('click','.similar-name a,.btn-more',function(event){
		var id = $(this).closest('.list-node').find('.w100 span').text();
		showForm('/efacecloud/page/library/personnelFileMagDetail.html?id'+id);
		event.stopPropagation();
	});
	
	$(".tagslist .tag-item").click(function(){
		$(this).addClass("active").siblings().removeClass("active");
	})
	
	//展开搜索条件
	$('#fiflerState').click(function(){
		var $hideFilterBar = $('.filter-bar-hide'),
			icon           = $(this).find('.icon'),
			$fiflerText    = $(this).find('.fifler-text');
		
		if(icon.hasClass('icon-arrow-down9')){
			icon.addClass('icon-arrow-up8').removeClass('icon-arrow-down9');
			$hideFilterBar.removeClass('hide');
			$fiflerText.html('收起');
		}else{
			icon.addClass('icon-arrow-down9').removeClass('icon-arrow-up8');
			$hideFilterBar.addClass('hide');
			$fiflerText.html('更多');
		}
	});
	
	//确认检索按钮
	$('#confirmSearch').click(function(){
		doSearch();
	})
	
	//关闭侧边图片
	/*$("body").on("click",".close-img-btn",function(){
		$(this).parents(".library-info").removeClass("result");
	});*/
	
	//搜索
	$("#searchBtn").click(function(){
		doSearch();
	});
	
	//回车事件
	$('#searchText').keypress(function(e){
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});

	//收藏
	$("body").on("click",".collectionBtn",function(){
		var ref = $(this).attr("ref");
		UI.util.showCommonWindow(ref, "收藏文件夹", 
				600, 450, function(obj){
		});
	});
	
	//图片定位
	$("body").on("click",".locationBtn",function(){
		var ref = $(this).attr("ref"),
			time = $(this).attr('attr-time'),
			addr = $(this).attr('attr-addr'),
			imgUrl = $(this).attr('fileUrl'),
			longitude = parseFloat($(this).attr('LONGITUDE')),
			latitude = parseFloat($(this).attr('LATITUDE'));
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
        	bT: queryParams.BEGIN_TIME,
        	eT: queryParams.END_TIME
        }
		openWindowPopup('track',url, time,'faceCaptureList');
		/*UI.util.showCommonWindow("/portal/page/tacticsFrame.html?pageUrl=/efacecloud/page/technicalStation/trackFaceForm.html?imgUrl=" + $(this).attr("url"), "轨迹预判", 
				$(top.window).width()*.95, $(top.window).height()*.9, function(obj){
		});*/
		//top.animateLeftFrameIn("/efacecloud/page/technicalStation/trackFaceForm.html?imgUrl=" + $(this).attr("url")+'&backPageType=faceCaptureList');
	});
	
	
    //身份核查
    $("body").on("click",".verification-search",function(){
    	openWindowPopup('identity',$(this).attr("url"));
    });
    
	//列表中的搜索链接
	$("body").on("click",".search-btn",function(){
		similayDec(); //默认是相似度排序
		fileUrl = $(this).attr("fileUrl");
		var bigImg = $(this).attr('bigImg');
		isUpload = UPLOAD_RETRIEW_FALSE;
//		$("#filterImg").attr("src",bigImg)
		$("#filterImg").attr("src",fileUrl);
        global.fileid = bigImg;
        if($(".arithmetic-tools.on").length==0){ //如果没有选中的算法，默认选择第一种；
            $(".arithmetic-tools:eq(0) i").trigger('click');
        }
		//$(".library-info").addClass("result");
		$("#filterImg").attr("hasImg","1"); //1:存在图片 0：不存在 
		$('.bottom-pic-bar').removeClass('hide');//阈值框出现
		//$('#exportPersonalBtn').addClass("hide");
		
		// 将搜索框的hidden input
		$('#uploadImg').val('');
		doSearch();
	});
	
	$("#freqAnalysisBtn").click(function(){
		var listData = UI.control.getDataById('faceCollectionList');
		beginTime = $('#beginTime').val();
		endTime	= $('#endTime').val();
		if(listData.count <=0 ){
			UI.util.alert("暂无数据，请重新查询！", "warn");
			return;
		}
		if(!beginTime || !endTime){
			UI.util.alert("请先选择一个时间或时间段", "warn");
			return;
		}
		UI.util.showCommonWindow("/efacecloud/page/perception/freqAnalysis.html", "频次分析", 451, 300,function(data){
			var params = {};
			params.DEVICE_IDS = $("#orgCode").val();
			params.BEGIN_TIME = beginTime;
			params.END_TIME = endTime;
			/*params.similarity=77;*/
			var freqNum = data.freqNum;
			var THRESHOLD = data.THRESHOLD;
			var FACESCORE = data.FACESCORE;
			params.FREQ_NUM=freqNum;
			var pageSize=$("[listview-counts]").text() || 10000;//resp.pageSize || 
			var orgName=$('#deviceNames').html();
			searchTime = searchTime || "today";
			UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/perception/faceCaptureN2N.html?pageSize='+ pageSize+ '&freqNum='+ freqNum + 
					'&searchTime='+searchTime + '&beginTime='+beginTime + '&endTime='+endTime+'&treeNodeId='+ $("#orgCode").val() +
					'&orgName='+orgName+'&threshold='+THRESHOLD+'&facescore='+FACESCORE);
		});
	});
	
	//阈值回车事件
	$('#threshold').keypress(function(e){
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});
	
	//导出
	$('#exportPersonalBtn').click(function(){
		var exportParams = {};
		var url = UI.control.getRemoteCallUrl("face/capture/exportFace");
		var exportData = "";
		if ($('#filterImg')[0].src.slice(-12) != "noPhoto2.png") {
			exportData = UI.control.getControlById('faceCollectionList').getListviewCheckData();
			if (exportData.length <= 0) {
				UI.util.alert("请勾选导出的数据","warn");
				return;
			}
			exportParams.SEARCH_IMG_URL = $('#filterImg')[0].src;
			exportParams.EXPORT_DATA = JSON.stringify(exportData);
		} else {
			exportData = UI.control.getControlById('faceCollectionList').getListviewCheckData();
			if (exportData.length > 0) {
				exportParams.EXPORT_DATA = JSON.stringify(exportData);
			} else {
				exportParams.DEVICE_IDS = $("#orgCode").val();    
				exportParams.THRESHOLD = $('#threshold').val();   
				exportParams.KEYWORDS = $("#searchText").val() || "";
				exportParams.BEGIN_TIME = $('#beginTime').val() || "";
				exportParams.END_TIME = $('#endTime').val() || "";
			}
		}
		bigDataToDownload(url,"exportFrame",exportParams);
	});

	// 轨迹查看
	$('#gjSearch').click(function(){
		if(getFaceTrackInfoList()){
			
			trackArr.sort(function(a,b){   //按时间排序
				return a.TIME - b.TIME;
			})
		
			/*parent.window.frames['leftFrameCon'].trackData = trackArr;
			parent.window.frames['leftFrameCon'].showForm('/efacecloud/page/technicalStation/persontogetherResultList.html?type=faceTrack');*/
			var routePopup = '<div class="maplayer-wrap">'+
				'<div class="layer camera">'+
				'<div class="layer-caption">'+
				'<div class="title">详情</div>'+
				'</div>'+
				'<div class="layer-content con2">'+
				'<div class="main-msg left-msg">'+
				'<p>抓拍时间：<span class="iB-span">{%=o.jgsj%}</span></p>'+
				'<p>抓拍地点：<span class="iB-span">{%=o.name%}</span></p>'+
				'</div>'+
				'</div>'+
				'</div>'+
				'</div>';
			//var mapObjArr = [],
			var	palyArr = [],
				diffFlag = false;
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
//				parent.rightMainFrameOut('hide');
				UI.util.alert('经纬度一样，无法生成轨迹！', 'warn');
				return false;
			}
			
			var pageUrl = '/efacecloud/page/largeScreen/persontogetherResultList.html?type=faceTrack';
			var url = '/portal/page/tacticsFrameJsScreen.html?pageUrl='+pageUrl;
			UI.util.showCommonIframe('.frame-form-full',url);
			
			$.each(trackArr,function(i,n){
				var playObj = {};
/*				mapObj.id = i;
				mapObj.title = i;
				mapObj.name = n.DEVICE_NAME;
				mapObj.time = n.jgsj;
				mapObj.jgsj = n.jgsj;
				mapObj.latlng = [parseFloat(n.Y),parseFloat(n.X)];
				mapObjArr.push(mapObj);*/
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
				playOpts = {
					routeInfo:palyArr,
					routePopup:routePopup,
					iconType:"person"
				};
				//parent.personLine = parent.showTracksOnMap(opts,1);
//				parent.loadRoute(playOpts);
//				parent.rightMainFrameOut('hide');
				
			}
			else{
				UI.util.alert("坐标缺失,无法生成轨迹","warn");
			}
/*			var opts = {
					routeLineInfo:mapObjArr,
					routePopup:routePopup,
					nodeColor:'#E51E3B',
					lineColor:'#017338'
			},*/
		}
	})
	
	
};

function initPhotoZoom(){
	//双图图片放大
	$("body").on("click","[attrimg='doublezoom']",function(){
		var $this = $(this);
		var $img = $this.find("img");
		var parentBox = $this.parents('.listviewImgBox');
		var baseImg,seriesImg,_series,showIndex = 0;
		var isListView = false;
		// 列表展示图片
		if(parentBox.length > 0){
			isListView = true;
			baseImg = [];   seriesImg= [];
			
			// 计算当前图片所在 索引
			/*if($(this).parents('[listview-item]').length>0){  //listview形式
				showIndex = parseInt($(this).parents('[listview-item]').attr('listview-item'));
			}else */if(parentBox.find('[pic-order]').length >0){ //已经自定义序号
				showIndex = parseInt($this.attr('pic-order'));
			}else{
				// 为每个列表添加 listview-item 属性
				parentBox.find("[attrimg='doublezoom']").each(function(index,item){
					$(this).attr('pic-order',index);
				});
				showIndex = parseInt($this.attr('pic-order'));
			}
			
			// 图片展示列表数组
			parentBox.find('[attrimg="doublezoom"]').each(function(index,item){
					baseImg.push($(this).find('img').eq(0).attr('src'));
					seriesImg.push($(this).find('img').eq(1).attr('src'));
			})
			_series = seriesImg;
			
		// 普通方式展示图片
		}else{
			baseImg = $img.eq(0).attr("src");
			seriesImg = $img.eq(1).attr("src");
			if ($img.eq(0).attr("zoom-url") != undefined ) {
				baseImg = $img.eq(0).attr("zoom-url");
			}
			
			if ($img.eq(1).attr("zoom-url") != undefined ) {
				seriesImg = $img.eq(1).attr("zoom-url");
			}
			_series = [{'src':seriesImg,'show':true}];
		}
		
		var options = {
			isCompare: true,
			isMessage: false,
			isSlide: false,
			isListView: isListView,
			series: _series,
			baseImg: baseImg,
			showIndex: showIndex
	    }
		$.photoZoom(options);
		return false;
	});
	
	//图片放大
	$("body").on("click","[attrimg='zoom']",function(){
		var $this = $(this);
		var url = $this.attr("src");
		var showIndex = 0;
		var _series = []
		var parentBox = $this.parents('.listviewImgBox');
		if ( $this.attr("zoom-url") != undefined ) {
			url = $this.attr("zoom-url");
		}
		if(parentBox.length > 0){
			// 计算当前图片所在 索引
			/*if($(this).parents('[listview-item]').length > 0){  //listview形式数据
				showIndex = parseInt($(this).parents('[listview-item]').attr('listview-item'));
			}else */if(parentBox.find('[pic-order]').length >0){ //已经自定义序号
				showIndex = parseInt($this.attr('pic-order'));
			}else{
				// 为每个列表添加 listview-item 属性
				parentBox.find("[attrimg='zoom']").each(function(index,item){
					$(this).attr('pic-order',index);
				});
				showIndex = parseInt($this.attr('pic-order'));
			}
			
			// 图片展示列表数组
			parentBox.find('[attrimg="zoom"]').each(function(index,item){
				_series.push($(this).attr('src'));
			})
		}
		var options = {
				isSlide: false,
				series: _series.length>0 ? _series : [url],
				showIndex: showIndex
		}
		$.photoZoom(options);
		return false;
	});
}

//初始化下拉选择框
function initTreeEvent(){
	var orgTree = UI.control.getControlById("orgTree");
    orgTree.bindEvent("onDropdownSelect", function(node){
    	var orgCode="";
    	if(node){
    		for(var i=0;i<node.length;i++){
    			if(!node[i].isParent){
    				if(orgCode===""){
    					orgCode=node[i].id;
    				}else{
    					orgCode=orgCode+","+node[i].id;
    				}
    			}
    		}
    	}
        $("#orgCode").val(orgCode);
        curOrgCode = orgCode;
    });
    var allNodeIds = orgTree.getDropdownSelectIds();
    curOrgCode = allNodeIds;
	
}

function doSearch(){
        if (UI.util.validateForm($('#thresholdValidate'))) {
            queryParams.isAsync = true;
            queryParams.pageNo = 1;
            queryParams.DEVICE_IDS = $("#orgCode").val();
            queryParams.DEVICE_IDS_INT = $("#orgCodeInt").val();
            queryParams.THRESHOLD = $('#threshold').val();
            queryParams.KEYWORDS = $("#searchText").val();
            beginTime = $('#beginTime').val();
            endTime	= $('#endTime').val();
            queryParams.BEGIN_TIME = beginTime;
            queryParams.END_TIME = endTime;
            queryParams.ALGO_LIST =  JSON.stringify( getAlgoList() );
            if($('#filterImg')[0].src.slice(-12)!="noPhoto2.png"){
                $("#freqAnalysisBtn").addClass("hide");
//                queryParams.FILE_ID = global.fileid;
                queryParams.FILE_ID = $('#filterImg').attr('src');
                UI.control.getControlById("faceCollectionList").reloadData(null,queryParams);
            }
            else{
                queryParams.FILE_ID = "";
                $("#freqAnalysisBtn").removeClass("hide");
                UI.control.getControlById("faceCollectionList").reloadData(null,queryParams);
            }
        }
}


function getSearchTime(dateTime){
	beginTime = dateTime.bT;
	endTime = dateTime.eT;
	queryParams.BEGIN_TIME = beginTime;
	queryParams.END_TIME = endTime;
}

//两个时间相差天数 兼容firefox chrome
function datedifference(sDate1, sDate2) {    //sDate1和sDate2是2006-12-18格式  
    var dateSpan,
        tempDate,
        iDays;
    sDate1 = Date.parse(sDate1);
    sDate2 = Date.parse(sDate2);
    dateSpan = sDate2 - sDate1;
    dateSpan = Math.abs(dateSpan);
    iDays = Math.ceil(dateSpan / (24 * 3600 * 1000));
    return iDays
};

//上传图片后,将查询方式改为按照相似度查询
function similayDec(){
	$('#sortList [attr-type="similar"]').addClass('active').siblings().removeClass('active');
	queryParams.SORT_FIELD ='SCORE';
}
// 普通检索，按照时间倒序排列
function timeDecFun(){
	$('#sortList [attr-type="time"]').addClass('active')
	                                  .attr('attr-arc','timeDesc')
									 .siblings().removeClass('active');
	queryParams.SORT_FIELD ='JGSK';
	queryParams.TIME_SORT_TYPE ='DESC';
}

// 获取所要生成的轨迹数据
function getFaceTrackInfoList(){
	trackData = UI.control.getControlById('faceCollectionList').getListviewCheckData();
	if (trackData.length < 2) {
		UI.util.alert('生成轨迹至少勾选两条记录！', 'warn');
		return false;
	}
	trackArr = [];
	for (var i = 0; i < trackData.length; i++) {
    	var obj = {};
    	obj.ORIGINAL_DEVICE_ID = trackData[i].ORIGINAL_DEVICE_ID;
    	obj.DEVICE_NAME = trackData[i].DEVICE_NAME;
    	obj.OBJ_PIC = trackData[i].OBJ_PIC;
    	obj.X = trackData[i].LATITUDE;
    	obj.Y = trackData[i].LONGITUDE;
/*    	obj.X = locations[i].X;
    	obj.Y = locations[i].Y;*/
    	
    	//obj.TIME = $(inputCheck[i]).attr("time");
    	//obj.jgsj = formatTimestamp(obj.TIME);
    	obj.jgsj = trackData[i].JGSK;
    	obj.TIME = standardTimeToStamp(obj.jgsj); //地图使用,毫秒时间戳
    	trackArr.push(obj);
	}
	
	return true;
}