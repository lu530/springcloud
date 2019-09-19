var pageType = UI.util.getUrlParam("pageType") || '-1';
var StoreID = UI.util.getUrlParam("StoreID") || '-1';
var StoreOwnerType = UI.util.getUrlParam("StoreOwnerType") || '-1';
var StoreName = UI.util.getUrlParam("StoreName");

var searchParam = {
	StoreID: StoreID,
	StoreOwnerType: StoreOwnerType,
	FilterType: 5
};

$(function() {
	initHtml();
	UI.control.init();
	initEvent();
});

function initHtml(){
	if(StoreOwnerType == 1){
		$('#addBtn').remove();
		$('.controlBtn').remove();
	}
	$("#StoreName").html(StoreName);
}

function initEvent(){
	
	//导入
	$("#importBtn").click(function(){
		UI.util.showCommonWindow("/efacecloud/page/dispatched/importLibrary.html?StoreID="+StoreID, "批量导入", 802, 400,function(data){
		},'currentPage');
	});
	
	/**下载模板**/
	$("#downloadTemplate").click(function(){
		/*var url = UI.control.getRemoteCallUrl("download/jxls");
		window.location.href = url+"?time="+ (new Date().getTime())+"&file=surveil_person_template.xlsx&expData=personImportTemplate";
	*/});
	
	
	if(pageType=='synchronizaed'){
		$('.list-node .btn,.btn-group-link').addClass('hide');
	}
	
	$(".btn-close").click(function(){
		parent.hideForm('.frame-form-view');
	});
	
	$('body').on('click','.editBtn',function(){
		var PortraitID = $(this).attr('personId');
		showForm('.frame-form-view','/efacecloud/page/dispatched/addPersonDispatched.html?pageType=synchronized'
				+'&StoreID='+StoreID+'&PortraitID='+PortraitID+'&type=edit&isLocal='+StoreOwnerType);
	});
	
	$('body').on('click','.revokeControl',function(){
		var personId = $(this).attr("personId");
		var IDCard = $(this).attr("IDcard");
		var surveilId = $(this).attr("surveilId");
		UI.util.showCommonWindow("/efacecloud/page/dispatched/revokeControl.html?personId="+personId+"&IDCard="+IDCard+"&surveilId="+surveilId, "撤控原因", 
				600, 220, function(obj){ doSearch(); });
	});
	
	$('#addBtn').click(function(){
		showForm('.frame-form-view','/efacecloud/page/dispatched/addPersonDispatched.html?pageType=synchronized'
				+'&StoreID='+StoreID+'&isLocal='+StoreOwnerType);
	});
	
	$("#keyWordSearch").click(function(){
		searchParam.KeyWords = $("#keyWord").val();
		doSearch();
	});
	
	$(window).keydown(function(event){
		switch(event.keyCode) {
			case 13:
				$("#keyWordSearch").trigger("click");
				break;
		}
	});
	
	//common.js 
	/*$('body').on('click','[attrimg="zoom"]',function(){
		var $this = $(this);
		var src = $this.attr('src');
		top.showPictureZoom( src,true);
	});*/
	
	$("body").on("click", ".reStationing", function(){
		var personId = $(this).attr("personId");
		var IDCard=$(this).attr('IDCard');
		

		UI.control.remoteCall("case/stationing/reStationingPerson", {personId:personId}, function(resp){
			if (resp.StatusCode == "0") {
				UI.util.showLoadingPanel('');
				setTimeout(function(){
					doSearch();
					UI.util.hideLoadingPanel();
					UI.util.alert("重发成功");
				}, 5000);
			}
		});
	});
}

function doSearch(){
	UI.control.getControlById('dispatchedApprovalList').reloadData(null, searchParam);
	parent.doSearch();
}

function doSearchApprove(){
	UI.control.getControlById('dispatchedApprovalList').reloadData(null, searchParam);
	parent.doSearch();
}

function hideStatus(code, sync, status){
	if (parseInt(status) == 0 || parseInt(status) == 2) {
		return "hide";
	}
	
	if (parseInt(sync) == 0) {
		return "hide";
	} else {
		if (parseInt(code) == 0) {
			return "hide";
		}
		return "";
	}
}