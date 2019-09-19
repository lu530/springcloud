/**
 * @Author wenyujian
 * @version 2018-03-07
 * @description 网吧人脸检索页面
 */
var beginTime  = UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").bT,  //页面默认选中今天
	endTime = UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").eT;

var timeOption = {
		'elem':$('#timeTagList'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'callback':getSearchTime
};

var cameraFirst = false;
var cameraCode = UI.util.getUrlParam('cameraCode') || '';
var BEGIN_TIME =  UI.util.getUrlParam("BEGIN_TIME");
var END_TIME = UI.util.getUrlParam("END_TIME");
var timeControl = UI.util.getUrlParam("timeControl") || '';

// 查询参数
var queryParams ={
		ALGO_LIST: '',
		BEGIN_TIME: BEGIN_TIME || beginTime,
		END_TIME: END_TIME || endTime,
		KEYWORDS: '',
		DEVICE_IDS: '',
		PIC: '',
		THRESHOLD: '',
		pageSize:20,
		pageNo:1,
		TAGS: '',
		isAsync: true
}

$(function(){
	UI.control.init();
	initEvent();
	initDateTimeControl(timeOption);
	topUploadPic();
	// 水印
    initWaterMark();
    if(cameraCode){
    	// 详情页隐藏设备分组按钮
		$("#cameraSearchBtn").addClass("hide");
    	// 时间 默认选中项
    	$("[time-control='"+timeControl+"']").addClass('active').siblings().removeClass('active');
    	if(timeControl=="zdy"){
    		$("#beginTime").parents(".opera-group").addClass("active");
    	}
    	$('#beginTime').val(BEGIN_TIME);
		$('#endTime').val(END_TIME);
		$("#KEYWORDS").val(cameraCode);
		doSearch();
	}
})


function initEvent(){
	
	$('#timeSearchBtn').click(function() {
		$(this).addClass("active").siblings().removeClass("active");
		$("#exportGroupBtn").addClass("hide");
		$("#pageWrap,.photo-tools,#carPlate").removeClass("hide");
		$(".page-con").removeClass('hide');
		$("#cameraContent").addClass('hide');
		$("#KEYWORDS").attr("placeholder","请输入证件号码或网吧编号");
	})
	
	// 按相机查询
	$('#cameraSearchBtn').click(function() {
		$(this).addClass("active").siblings().removeClass("active");
		$("#pageWrap,.photo-tools,#carPlate").addClass("hide");
		$(".page-con").addClass('hide');
		$("#cameraContent").removeClass('hide');
		$("#KEYWORDS").attr("placeholder","请输入网吧编号");
		if(!cameraFirst) {
			cameraFirst = true;
			cameraAdminSearch();
		}
	});
	
	//导出分组
	$("#exportGroupBtn").on("click",function(){
		var $this = $(this);
		if($this.hasClass("disable")){
			UI.util.alert("请勿重复点击","warn");
			return;
		}
		$this.addClass("disable");
		var type = $("[groupType].active").attr("groupType");
		var curParams = {
				BEGIN_TIME: $('#beginTime').val(),
				END_TIME: $('#endTime').val(),
				PUBCODE: $("#KEYWORDS").val()
    	};
    	var url = UI.control.getRemoteCallUrl("face/internetCafes/statisticsExport");
    	bigDataToDownload(url,"exportFrame",curParams);
    	setTimeout(function(){
    		$this.removeClass("disable");
    	},5000);
	});
	
	//按摄像机分组弹窗
	$("body").on("click", ".cameraItem", function(){
		var $this = $(this);
		$this.addClass("active").siblings().removeClass("active");
		var cameraCode = $this.find(".cameraCode").attr("title");
		// 当前检索时间
		var timeControl = 'jt';
		$('#timeTagList .tagsTime').each(function(index,item){
			if($(this).hasClass('active')){
				timeControl = $(this).attr('time-control');
			}
		})
		var params = {
			src: '/efacecloud/page/library/internetBarCapture.html?cameraCode='+cameraCode+'&BEGIN_TIME='+$('#beginTime').val()+'&END_TIME='+$('#endTime').val()+'&timeControl='+timeControl,
			title: cameraCode,
			width: $(top.window).width()*.95,
			height: $(top.window).height()*.9,
			callback: function(){

			}
		}
		UI.util.openCommonWindow(params);
	})
	
	$("#inputSearch").on("click",function(){
		doSearch();
	});
	
	$("#KEYWORDS").keypress(function(e){
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});
	
    //轨迹分析
	$("body").on("click",".trajectory-search",function(){
		openWindowPopup('track',$(this).attr("url"));
		/*UI.util.showCommonWindow("/portal/page/tacticsFrame.html?pageUrl=/efacecloud/page/technicalStation/trackFaceForm.html?imgUrl=" + $(this).attr("url"), "轨迹预判", 
				$(top.window).width()*.95, $(top.window).height()*.9, function(obj){
		});*/
		//top.animateLeftFrameIn("/efacecloud/page/technicalStation/trackFaceForm.html?imgUrl=" + $(this).attr("url")+'&backPageType=faceCaptureList');
	});
    
    //收藏
	$("body").on("click",".collectionBtn",function(){
		var ref = $(this).attr("ref");
		UI.util.showCommonWindow(ref, "收藏文件夹", 
				600, 450, function(obj){
		});
	});
	
	 //身份核查
    $("body").on("click",".verification-search",function(){
    	openWindowPopup('identity',$(this).attr("url"));
    });
	
	//列表中的搜索链接
	$("body").on("click",".search-btn",function(){
		fileUrl = $(this).attr("fileUrl");
		isUpload = UPLOAD_RETRIEW_FALSE;
		$("#filterImg").attr("src",fileUrl);
		$("#filterImg").attr("hasImg","1"); //1:存在图片 0：不存在 
		$('.bottom-pic-bar').removeClass('hide');//阈值框出现
		doSearch();
	});
    
	//阈值回车事件
	$('#threshold').keypress(function(e){
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});
	
	// 确认检索按钮
	$('#confirmSearch').click(function(){
		doSearch();
	});
	
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
			$('#orgCode').val(resp.deviceId);
			$('#orgCodeInt').val(resp.deviceIdInt);
			$("#deviceNames").attr("orgcode",resp.orgCode);
			
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
		var index = deviceIdArr.indexOf(deviceId);
		
		$this.parents("li").remove();
		deviceIdArr.splice(index,1);
		deviceIdIntArr.splice(index,1);
		deviceNameArr.splice(index,1);
		$('#orgCode').val(deviceIdArr.join(","));
		$('#orgCodeInt').val(deviceIdIntArr.join(","));
		$('#deviceNames').html(deviceNameArr.join(","));
		$('#deviceNames').attr("title",deviceNameArr.join(","));
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
	
	//导出
	$('#exportPersonalBtn').click(function(){
		var exportParams = {};
		var url = UI.control.getRemoteCallUrl("face/capture/exportFace");
		var exportData = "";
		if ($('#filterImg')[0].src.slice(-12) != "noPhoto2.png" && $('#commonList').hasClass('hide')) {
			var list = $('#faceAlgorithmBox .list-node-wrap.active'),
				len = list.length,
				dataSource = [];
			if (len <= 0) {
				UI.util.alert("请勾选导出的数据","warn");
				return false;
			}
			for(var i = 0;i < len;i++){
				dataSource.push(JSON.parse($(list[i]).attr('data-ds')));
			}
			exportData = dataSource;
			exportParams.SEARCH_IMG_URL = $('#filterImg')[0].src;
			exportParams.EXPORT_DATA = JSON.stringify(exportData);
		} else {
			exportData = UI.control.getControlById('faceList').getListviewCheckData();
			if (exportData.length > 0) {
				exportParams.EXPORT_DATA = JSON.stringify(exportData);
			} else {
				UI.util.alert("请勾选导出的数据","warn");
				return false;
/*				exportParams.DEVICE_IDS = $("#orgCode").val();    
				exportParams.THRESHOLD = $('#threshold').val();   
				exportParams.KEYWORDS = $("#searchText").val() || "";
				exportParams.BEGIN_TIME = $('#beginTime').val() || "";
				exportParams.END_TIME = $('#endTime').val() || "";*/
			}
		}
		bigDataToDownload(url,"exportFrame",exportParams);
	});
	
	// 设备分组
	$('#deviceGroup').on('click', function(){
		UI.util.showCommonWindow("/connectplus/page/device/deviceGroup.html","设备分组", 400, 400,
      		function(resp){
			console.log(resp)
			queryParams.TAGS =resp.GROUP_CODE;
			var name = resp.GROUP_NAME ?  resp.GROUP_NAME: '请选择'
			$('#deviceGroupName').html(name);
      	});
        
	})

	$("#faceAlgorithmBox").on('click','.list-node-wrap',function(){
	    $(this).toggleClass('active');
	});

	$('#checkAll').on('click',function(){
		if ($('#filterImg')[0].src.slice(-12) != "noPhoto2.png" && $('#commonList').hasClass('hide')) {
			$('#faceAlgorithmBox .list-node-wrap').toggleClass('active');
		}
	});


	//选取收藏图片进行路人检索
	$("#fastImgBtn").click(function(){
		var params = {
				src: '/efacecloud/page/library/personalLibraryList.html?isChosePic=true',
				title: '选取收藏图片检索',
				width: $(top.window).width()*.95,
				height: $(top.window).height()*.9,
				callback: function(data){
					$("#filterImg").attr("src",data);
				}
		}
		UI.util.openCommonWindow(params);
	});

	
}

// 页面检索
function doSearch(){
	if($("#cameraSearchBtn").hasClass("active")){
		cameraAdminSearch();
		return;
	}
	if (UI.util.validateForm($('#thresholdValidate'))) {
		queryParams.BEGIN_TIME = $('#beginTime').val();
		queryParams.END_TIME = $('#endTime').val();
		queryParams.KEYWORDS = $("#KEYWORDS").val();
		queryParams.THRESHOLD = $('#threshold').val();
		queryParams.DEVICE_IDS = $("#orgCode").val();
//		queryParams.DEVICE_IDS_INT = $("#orgCodeInt").val();
//		queryParams.ALGO_LIST =  JSON.stringify( getAlgoList() );
		if($('#filterImg')[0].src.slice(-12)!="noPhoto2.png"){  // 以图搜图
            $("#freqAnalysisBtn").addClass("hide");
            queryParams.PIC = $("#filterImg").attr("src");
            queryParams.pageNo = 1;
            if(datedifference(beginTime,endTime) >30){
            	UI.util.alert("时间查询不能超过30天", "warn");
            	return ;
            }
            
            $('#pageWrap').addClass('hide');
            
            $('#commonList').addClass('hide');
            UI.util.showLoadingPanel();
            UI.control.remoteCall('internetCafes/face/capture/query',queryParams,function (resp) {
				if((resp.data && resp.data.CODE == 0) || (resp.faceList && resp.faceList.CODE == 0)){
					var listData = resp.faceList ? resp.faceList.LIST : resp.data.LIST;
					$("#faceAlgorithmBox").removeClass('hide');
					if(listData.length >0){
						$("#faceAlgorithmBox").html(tmpl("faceAlgorithmTemplate", listData));
					}else{
						$("#faceAlgorithmBox").html('<div class="nodata"></div>');
					}
				}
                UI.util.hideLoadingPanel();
            },function(){
                UI.util.hideLoadingPanel();
                
            },{},true);
        }
        else{  // 无图片检索
            // queryParams.FILE_ID = "";
        	 $('#pageWrap').removeClass('hide');
            queryParams.PIC = "";
            $("#freqAnalysisBtn").removeClass("hide");
            $("#faceAlgorithmBox").addClass('hide');
            $('#commonList').removeClass('hide');
            UI.control.getControlById("faceList").reloadData(null,queryParams);
        }
	}
}

// 时间选择回调
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

function cameraAdminSearch() {
	var cameraAdminParams = {
			BEGIN_TIME: $('#beginTime').val(),
			END_TIME: $('#endTime').val(),
			PUBCODE: $("#KEYWORDS").val()
	};
	UI.util.showLoadingPanel()
	UI.control.remoteCall('face/internetCafes/statistics', cameraAdminParams, function(resp){
		UI.util.hideLoadingPanel();
		$("#cameraResult").html(tmpl("cameraTmpl", resp.STATISTICS_RESULT));
	}, function(){
		UI.util.hideLoadingPanel();
	},{async:true});

}
