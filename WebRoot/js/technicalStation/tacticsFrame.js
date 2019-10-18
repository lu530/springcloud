/**
 * 技战法框架
 * @author fenghuixia
 * 2018-06-13
 */
var pageUrl = UI.util.getUrlParam("pageUrl") || '';
//页面类型
var pageType = UI.util.getUrlParam("pageType")||'track';
//获取页面数据类型
var getDataType = UI.util.getUrlParam("getDataType")||"track";
// 设置无图片
var noPic = UI.util.getUrlParam('noPic') || '';
// 证件号码
var zjhm = UI.util.getUrlParam('zjhm') || '';
//缓存数据
var cachedData = {};
cachedData.beginTime = UI.util.getUrlParam("beginTime")||'';
cachedData.endTime = UI.util.getUrlParam("endTime")||'';
cachedData.noBackBtn = UI.util.getUrlParam("noBackBtn")||false;
cachedData.imgUrl = UI.util.getUrlParam("imgUrl")||"";

var pageUrlObj = {
	"track": "/efacecloud/page/technicalStation/trackFaceForm.html?beginTime="+cachedData.beginTime+
				"&endTime="+cachedData.endTime+"&imgUrl="+cachedData.imgUrl+"&noBackBtn="+cachedData.noBackBtn , //轨迹分析
	'trackResult':'/efacecloud/page/technicalStation/persontogetherResultList.html' + (noPic ? '?noPic=true' : ''),//轨迹结果
	"partner":'/efacecloud/page/technicalStation/persontogethercarForm.html',//同伙分析
	"frequently":'/efacecloud/page/technicalStation/personfrequentAccessForm.html',//频繁出现
	'region':'/efacecloud/page/technicalStation/faceCollisionForm.html',//区域碰撞
	'library':'/dbcollision/page/technicalStation/libraryCollisionForm.html'//库碰撞
}
$(function(){
	initEvent();
	if(isBlack()) {
		initMap(initPage_Black);
	} else {
		initPage();
		//初始化地图
		initMap();
	}
});

function initEvent(){
	/** 对于人脸区域碰撞，弹窗有按钮  start **/
	//身份核查
	$("body").on("click",".verification-search",function(){
    	openWindowPopup('identity',$(this).attr("url"));
    });
	//轨迹分析
	$("body").on("click",".trajectory-search",function(){
        var url = $(this).attr("url");
        var time = {
        	/*bT: queryParams.BEGIN_TIME,
        	eT: queryParams.END_TIME*/
        }
		openWindowPopup('track',url, time,'faceCaptureList');
	});
	//收藏
	$("body").on("click",".collectionBtn",function(){
		var ref = $(this).attr("ref");
		UI.util.showCommonWindow(ref, "收藏文件夹", 
				600, 450, function(obj){
		});
	});
	/** 对于人脸区域碰撞，弹窗有按钮  end **/

	// if(pageType === "library"){
	// 	showTask();
	// }
}

//技战法返回菜单
function showMenu(){
	if(top.projectID === 'longli' && top.$('.header-nav dd.longliMenu>a[href=#facehome]').length > 0) {
		top.$('.header-nav dd.longliMenu>a[href=#facehome]').trigger('click');
		return;
	}
	parent.showMenu();
}

//初始化页面
function initPage(){
	if(pageUrl) {
		initLeftForm(pageUrl);
	}else{
		initLeftForm(pageUrlObj[pageType]);
	}
}

function initPage_Black(params) {
	var params = {
		startTime: cachedData.beginTime,//	开始时间	string	yyyy-MM-dd HH:mm:ss
		endTime: cachedData.endTime, //	结束时间	string	yyyy-MM-dd HH:mm:ss
		objectType: '6', //	查询类型	number	0:全部,1:wifi,2:电围,6:人脸
		pageNo: 1, //	页索引	number
		pageSize: 10, //	页大小	number
		zjhm: zjhm//	人员id	string
	};
	UI.control.remoteCall('', params, function(resp) {
		var data = resp.data || {};
		// data.records = [
		// 	{
		// 		"LOC": "113.26890563964844,23.1412715911866523", 
		// 		"X": "113.26890563964844", 
		// 		"Y": "23.1412715911866523", 
		// 		"BSID": "823900011", 
		// 		"CATM": "2019-03-24 10:03:23", 
		// 		"ID": 123916987, 
		// 		"ADDR": "天秀大厦", 
		// 		"MOBILE": "13760827061",
		// 		DEVICE_TYPE: '摄像机',
		// 		DEVICE_ID: '51234511',
		// 		"JGSK": "2019-03-24 10:03:23",
		// 	},
		// 	{
		// 		"LOC": "113.26858520507812,23.150671005249023", 
		// 		"X": "113.26858520507812", 
		// 		"Y": "23.150671005249023", 
		// 		"BSID": "823900011", 
		// 		"CATM": "2019-03-24 10:03:23", 
		// 		"ID": 123916987, 
		// 		"ADDR": "金鹭山庄", 
		// 		"MOBILE": "13760827061",
		// 		DEVICE_TYPE: '摄像机',
		// 		DEVICE_ID: '51234511',
		// 		"JGSK": "2019-03-24 10:03:23", 
		// 	},
		// 	{
		// 		"LOC": "113.25479888916016,23.147254943847656", 
		// 		"X": "113.25479888916016", 
		// 		"Y": "23.147254943847656", 
		// 		"BSID": "823900011", 
		// 		"CATM": "2019-03-24 10:03:23", 
		// 		"ID": 123916987, 
		// 		"ADDR": "先贤古墓", 
		// 		"MOBILE": "13760827061",
		// 		DEVICE_TYPE: '摄像机',
		// 		DEVICE_ID: '51234511',
		// 		"JGSK": "2019-03-24 10:03:23", 

		// 	}
		// ];
		if(data &&data.records&& data.records.length > 0) {
			// 隐藏左侧
			$('#leftMainDiv').addClass('hide');
			$('.map-con').css('left', '0');
			// 绘制轨迹
			mapObj = UI.map.getMap();
			$.each(data.records, function(i, obj) {
				drawRelativeMap(obj, 'faceTmpl');
			});
		} else {
			// 原本的逻辑
			if(pageUrl) {
				initLeftForm(pageUrl);
			}else{
				initLeftForm(pageUrlObj[pageType]);
			}		
		}
	}, null, {
		url: '/efacestore/rest/v6/facestore/archives/personTrajectory',
		data: params
	});	
}

//初始化左侧页面
function initLeftForm(url){
	$("#leftMainDiv iframe").attr("src",url);
}

//显示同级iframe
function showLeftResult(url){
	$("#leftFrameCon").addClass("hide");
	$("#leftFrameListCon").attr("src",url).removeClass("hide");
}

//隐藏同级iframe
function hideLeftResult(){
	$("#leftFrameListCon").addClass("hide");
	$("#leftFrameCon").removeClass("hide");
}

//展示右侧页面
function rightMainFrameIn(url,type){
	var $rightMainDiv = $('#rightMainDiv'),
		$rightMainFrame = $('#rightMainFrame');
	$rightMainDiv.removeClass("hide");
	if(type!='show'){
		$rightMainFrame.attr('src',url);
	}
}

//隐藏右侧页面
function rightMainFrameOut(type){
	var $rightMainDiv = $('#rightMainDiv'),
	$rightMainFrame = $('#rightMainFrame');
	$rightMainDiv.addClass("hide");
	if(type!='hide'){
		$rightMainFrame.attr('src','');
	}
}

//显示红名单任务
function showRedListTask(opts){
	UI.control.remoteCall("face/redTask/getUnReadCount",{SEARCH_TYPE:opts.searchType},function(resp){
		var num = resp.COUNT,className = '';
		if(num == 0){
			className = 'hide';
		}
		var html = '<div class="look-task-wrap" id="checkTaskBtn">'+
		'<span class="icon-wrap">'+
		'<b class="icon-look-task"></b>'+
		'</span>'+
		'<span class="txt-wrap">任务</span>'+
		'<span class="txt-tips '+className+'">'+num+'</span>'+
		'</div>';
	
		$(opts.elem).find("#checkTaskBtn").remove();
		$(opts.elem).addClass("pr").append(html);
		
		$("#checkTaskBtn").unbind("click");
		$("#checkTaskBtn").click(function(){
			
			UI.control.remoteCall("face/redTask/updateReadStatus",{SEARCH_TYPE:opts.searchType},function(resp){
				if(resp.CODE == 0){
					$("#checkTaskBtn .txt-tips").addClass("hide");
				}
			},function(){},{},true);
			
			UI.util.showCommonWindow('/efacecloud/page/library/taskList.html?searchType='+opts.searchType,"检索管理", $(top.window).width()*.95, $(top.window).height()*.9,
	      		function(data){
				if(opts && $.isFunction(opts.callback)){
					opts.callback(data);
				}
	      	});
		});
	},function(){},{},true);
}


function showList () {
	$(".float-window").hasClass("hide") ? $(".float-window").removeClass("hide") : $(".float-window").addClass("hide");
}

//	任务球列表点击查看库碰撞碰撞结果列表
function showCollisionListClick () {

	$("#completeList").off("click").on("click", "li a", function () {
		leftFrameCon.window.showCollisionList($(this).attr("task-id"),$(this).attr("task-name"));
	})
}
