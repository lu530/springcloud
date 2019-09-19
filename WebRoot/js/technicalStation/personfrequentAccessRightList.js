var type = UI.util.getUrlParam("type");//判断页面的类型
type = 'frequent'; //测试功能，后面删掉
var queryParams = JSON.parse(UI.util.getUrlParam("param")); //查询参数
queryParams.DEVICE_IDS = parent.cachedData.deviceIds||'';
var xxbhs, pics, devids, addrs, times;
var savedData;
var showData;
var trackArr = null;
$(document).ready(function(){
	//UI.control.init();
	initPage();
	doSearch();
	initEvents();
	pageTopFixed();
	initWaterMark();
})

//初始化页面
function initPage(){
	if(type == 'frequent'){
		$('.form-title').html('频繁出入记录');
	}else if( type == 'dayAndNight' ){
		$('.form-title').html('昼伏夜出记录');
	}
}

function initEvents(){
	$('body').on('click','.list-node', function(){
		var index = parseInt($(this).attr("index"));
		index =	pageSize * (currentPage - 1) + index;
		xxbhs = savedData[index].IDS;
		showForm('/efacecloud/page/technicalStation/personfrequentAccessRightDetail.html?pageType='+type);
	});
	
	//关闭
	$('body').on('click','#closeBtn',function(){
		parent.rightMainFrameOut();
	});
	
	$("[listview-next-btn]").click(function(){
		if(!$(this).hasClass("disable")){
			var end = (currentPage+1)*pageSize > totalNum ? totalNum : (currentPage+1)*pageSize;
			var curShowData = showData.slice(currentPage*pageSize, end);
			$("#faceTable").html(tmpl("faceTmpl", curShowData));
			$(".list-node").removeClass("hide");
			return false;
		}
	});

	$("[listview-prev-btn]").click(function(){
		if(!$(this).hasClass("disable")){
			var curShowData = showData.slice((currentPage-2)*pageSize, (currentPage-1)*pageSize);
			$("#faceTable").html(tmpl("faceTmpl", curShowData));
			$(".list-node").removeClass("hide");
			return false;
		}
	});
}

//查询数据
function doSearch() {

	UI.util.showLoadingPanel('','currentPage');
	if(type == 'frequent'){
		initFrequentAccessList();
	}else if( type == 'dayAndNight' ){
		initDaylurkNightoutList();
	}
}

//初始化频繁出入列表
function initFrequentAccessList(){
	
	UI.control.remoteCall('technicalTactics/frequencyAccess/query', queryParams, function(resp){
		if(resp.DATA.length > 0){
			initTechnicalPage(resp.DATA.length,true);//技战法分页
			savedData = resp.DATA;
			
			showData = resp.DATA;
			showData.sort(function(a, b) {
				return parseInt(a.REPEATS) > parseInt(b.REPEATS) ? -1 : 1;
			});
	        
			var curShowData = showData.slice(0,pageSize);

			$("#faceTable").html(tmpl("faceTmpl", curShowData));
			
		}else{
			UI.util.alert("查询结果为空","warn");
		}
		UI.util.hideLoadingPanel('currentPage');
		
	},function(){
		UI.util.hideLoadingPanel('currentPage');
	},{async:true});
}

//初始化昼伏夜出列表
/*function initDaylurkNightoutList(){

	UI.control.remoteCall('person/dayLurkNightOut/query', queryParams, function(resp){
		if(resp.status=="ok"){
			initTechnicalPage(resp.list.length);//技战法分页
			var result = resp.list;
			result.sort(function(a, b) {
				return parseInt(a.REPEATS) > parseInt(b.REPEATS) ? -1 : 1;
			});
			$("#faceTable").html(tmpl("faceTmpl", result));
			
		}else{
			UI.util.alert("查询结果为空","warn");
		}
		UI.util.hideLoadingPanel('currentPage');
		
	},function(){
		UI.util.hideLoadingPanel('currentPage');
	},{async:true});
}*/

function showForm(url) {
	$("#frameFormFull").attr("src", url);
	$(".frame-form-full").show();
	
}
function hideForm() {
	$("#frameFormFull").attr("src", "");
	$(".frame-form-full").hide();
}
function pageTopFixed(){
	var h = $('.list-wrap').offset().top + parseInt($('.list-wrap').css('height'));
	$('body').scroll(function(){
		var sh = $('.form-header').offset().top;
	    if(sh<-40){
	        $(".list-wrap").addClass('fixed-top');
	    }else{
	    	$(".list-wrap").removeClass('fixed-top');
	    }
	});
}

function searchData(){
	
}