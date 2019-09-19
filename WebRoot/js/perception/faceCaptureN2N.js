var pageSizeParams=UI.util.getUrlParam("pageSize") || 10000;
var orgName=UI.util.getUrlParam("orgName") || "";
var treeNodeId=UI.util.getUrlParam("treeNodeId") || "";
var beginTime=UI.util.getUrlParam("beginTime") || "";
var endTime=UI.util.getUrlParam("endTime") || "";
var freqNum=UI.util.getUrlParam("freqNum") || "";
var threshold=UI.util.getUrlParam("threshold") || "";
var facescore = UI.util.getUrlParam("facescore") || "";

var data = null;//总数据
var timeData = null;//时光轴数据
var timeNum = 1;//时光轴索引
var timeTotal = 0;//时光轴总数
var timeTotalNum = 0;//时光轴总数
		
$(function(){
	UI.control.init();
	initEvent();
	initTmplData();
});
function initPage(){
	$("#beginTime").val(beginTime);
	$("#endTime").val(endTime);
	$("#orgName").text(orgName).attr("title", orgName);
	$("#freqNum").text(freqNum);
	$("#threshold").text(threshold);
	$("#faceScore").text(facescore);
}

function initEvent(){
	//点击图片，显示时间轴
	$("body").on("click",".capture-data .list-node",function(){
		var $this = $(this),
			infoId = $this.attr("infoId"),
			ids = $this.attr("ids");
		
		UI.control.remoteCall("technicalTactics/frequencyAccess/getMsgByIds", {IDS:ids}, function(resp){
			timeData = resp.DATA;
			timeTotal = timeData.length;
			timeNum = 1;
			timeTotalNum = Math.ceil(timeTotal / pageSize);
		});
		
		var curShowData = timeData.slice(0,pageSize);
		$("#dataList .list-view").empty().append('<span class="list-close close-bg"></span>').append(tmpl('testChildTmpl', curShowData)).scrollTop(0);;
		
		$this.parents(".pager-content").addClass("show");
	});
	
	$(".list-view").scroll(function() {
		var $this = $(this);
		
		if(timeNum < timeTotalNum){
			var end = (timeNum+1)*pageSize > timeTotal ? timeTotal : (timeNum+1)*pageSize;
			var curShowData = timeData.slice(timeNum*pageSize, end);
			$("#dataList .list-view").append(tmpl('testChildTmpl', curShowData));
			timeNum++;
		}
		
	});
	
	//点击关闭时间轴
	$("body").on("click",".list-close",function(){
		$(this).parents(".pager-content").removeClass("show");
	});
	
	//返回
	$('#backBtn').click(function(){
		parent.UI.util.hideCommonIframe('.frame-form-full');
	});
	
	$("[listview-next-btn]").click(function(){
		if(!$(this).hasClass("disable")){
			var end = (currentPage+1)*pageSize > totalNum ? totalNum : (currentPage+1)*pageSize;
			var curShowData = data.slice(currentPage*pageSize, end);
			$("#dataList .page-con").html(tmpl("testTmpl", curShowData));
			$(".tilelist").removeClass("hide");
			return false;
		}
	});

	$("[listview-prev-btn]").click(function(){
		if(!$(this).hasClass("disable")){
			var curShowData = data.slice((currentPage-2)*pageSize, (currentPage-1)*pageSize);
			$("#dataList .page-con").html(tmpl("testTmpl", curShowData));
			$(".tilelist").removeClass("hide");
			return false;
		}
	});
}


function initTmplData() {
	
	UI.util.showLoadingPanel('','currentPage');
	//var url = "face/capture/freqAnalysis";
	var url = "face/capture/optimization/freqAnalysis";
	var queryParams={/*similarity: 77,*/ 
			pageSize:pageSizeParams, 
			NUMS: freqNum, 
			DEVICE_IDS: treeNodeId,
			BEGIN_TIME: beginTime,
			END_TIME:endTime/*, sort: "JGSK"*/,
			THRESHOLD:threshold,
			FACE_SCORE: facescore
		};
	
	UI.control.remoteCall(url, queryParams, function(resp){
		var flag = resp.CODE;
		data = resp.DATA;
		
		initTechnicalPage(data.length,true);//分页
		var curShowData = data.slice(0,pageSize);
		$("#dataList .page-con").html(tmpl("testTmpl", curShowData));
		initPage();
		if (flag==1) {
			UI.util.alert("分析失败," + resp.MESSAGE, "error");
		}
		UI.util.hideLoadingPanel('currentPage');
	}, function(data, status, e) {
		UI.util.hideLoadingPanel('currentPage');
		initPage();
	}, {
		async : true
	});
}