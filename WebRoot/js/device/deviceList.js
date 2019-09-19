var treeService = UI.util.getUrlParam("treeService")||'user/resourceRoleTree/queryResourceData';//获取树服务
var listService = UI.util.getUrlParam("listService")||'cp/device/query';//获取列表服务
var deviceType = UI.util.getUrlParam("deviceType")||'131';//获取列表服务
var orgTreeOpts = {
	multiple: false,
	service:treeService
};
var listOpts = {
	service:listService
};
var deviceIdArr = [];
var deviceNameArr = [];
var orgCode = '';

$(function() {
	UI.control.init();
	initEvent();
	initSearch();
	initTree();
});

function initEvent(){
	//选择设备列表
	$("body").on("click","#searchList li",function(){
		var $this = $(this);
		var deviceId = $this.attr("deviceid");
		var deviceName = $this.attr("devicename");
		var index = deviceIdArr.indexOf(deviceId);
		
		if(index<0){
			deviceIdArr.push(deviceId);
			deviceNameArr.push(deviceName);
		}else{
			deviceIdArr.splice(index, 1);
			deviceNameArr.splice(index, 1);
			if($this.hasClass("active")){
				$this.removeClass("active");
			}else{
				$this.addClass("active");
			}
		}
		
	});
	
	//保存
	$("#saveBtn").click(function(){
		var deviceData = {
				deviceId:deviceIdArr.join(","),
				deviceName:deviceNameArr.join(",")
		}
		parent.UI.util.returnCommonWindow(deviceData);
		parent.UI.util.closeCommonWindow();
	});
	
	//取消
	$("#cancelBtn").click(function(){
		parent.UI.util.closeCommonWindow();
	});
	
	//上下翻页
	$(".page-prev,.page-next").click(function(){
		reloadCheck();
	});
}

//初始化下拉选择框
function initTree(){
    var orgTree = UI.control.getControlById('structureTree');
    orgTree.bindEvent('onClick', function(event, treeId, treeNode) {
    	var queryParams = {
			DEVICE_TYPE:deviceType,
    	}
    	if(treeNode.TYPE == 'STRUCTURE'){
    		queryParams.ORG_CODE=treeNode.id;
    	}else if(treeNode.TYPE == 'COMMUNITY'){
    		queryParams.SCENE_ID=treeNode.NODE_ID;
    	}
    	UI.control.getControlById("searchList").reloadData(null,queryParams);
    	reloadCheck();
    	$('#clearSearchTextBtn').click();
	});
}

//搜索查询
function initSearch(){
	$("#search").click(function(){
		doTreeSearch();
	});        	
	$("#searchCon").keyup(function(event){
		$('#clearSearchTextBtn')[$(this).val()!=""?"removeClass":"addClass"]('hide');
		if(event.which==13){ 
			doTreeSearch();
		}
	});
	$('#clearSearchTextBtn').click(function(){
		$("#searchCon").val('');
		$(this).addClass('hide');
		doTreeSearch('clear');
	});
}

function doTreeSearch(param){
	
	if(param == "clear"){
		return ;
	}
	var searchCon = $("#searchCon").val()
	
	if(searchCon.length == 0){
		UI.util.alert("请输入查询关键字","warn");
	} else {
		var queryParams = {
			KEYWORDS:searchCon,
			DEVICE_TYPE:deviceType,
			ORG_CODE:orgCode
    	}
    	UI.control.getControlById("searchList").reloadData(null,queryParams);
		reloadCheck();
	}
}

function reloadCheck(){
	$.each(deviceIdArr,function(i,n){
		$("#searchList li[deviceid='"+n+"']").addClass("active");
	});
}