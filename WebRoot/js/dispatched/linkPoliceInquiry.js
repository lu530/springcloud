var org_code = UI.util.getUrlParam("org_code") || '';
var policeNum = UI.util.getUrlParam("policeNum") || '';
var alarmImg=UI.util.getUrlParam("alarmImg") || '';
var tempImg=UI.util.getUrlParam("tempImg") || '';
var personName=UI.util.getUrlParam("personName") || '';
var identityId =UI.util.getUrlParam("identityId") || '';
var age =UI.util.getUrlParam("age") || '';
var nation =UI.util.getUrlParam("nation") || '';
var describe = UI.util.getUrlParam("describe")|| '';
var type = UI.util.getUrlParam("type")|| '';
var orgTreeOpts = {
	isShowFolder: false,
	multiple: false,
	dropdownWidth: '250px',
	dropdownDefault: '区域选择',
	autocomplete:true,
	search: {
		enable: true,              //是否启用搜索
		searchTreeNode: true,				//搜索参数 key|value为文本框的ID
		searchTextId: 'deviceNames',
		ignoreEmptySearchText: true,
		searchBtnId: 'searchs'
	}
};

var queryParams ={
		orgCode:org_code,
		policeNum:policeNum
}
$(function(){
	//var $params=window.parent.frames[window.parent.frames.length-3].getParams();
	//console.log($params);
	if(type == "linkPolicePush"){
		$("#confirmBtn").addClass('hide');
		$(".operate").addClass('hide');
	}else{
		$("#sendBtn").addClass("hide");
	}
	UI.control.init();
	initEvent();
	initTreeEvent();
});


function initEvent(){
	
	$('.search-input').bind('keypress',function(event){
        if(event.keyCode == "13")    
        {
        	doSearch();
        }
    });
	
	$("#sendBtn").click(function(){
		var datas=UI.control.getControlById("policeTerminalList").getListviewCheckData();
		var policeNumArray=[];
		for(var i=0;i<datas.length;i++){
			datas[i]["STYLE"]="1";
			policeNumArray[i]=datas[i].ZRRJH;
		}
		//console.log(datas[0].ZRRJH);
		//console.log(policeNumArray);
		var params = {PERSON_NAME:personName,
				PERSON_AGE:age,
				NATION:nation,
				IDENTITY_ID:identityId,
				DESCRIBE:describe,
				ALARM_IMG:alarmImg,
				TEMPLET_IMG:tempImg
		}
		if(policeNumArray.length<0){
			UI.util.alert("请关联警务通",'warn');
			return;
		}else if(policeNumArray.length==1){
			params.ZRRJH=policeNumArray[0];
		}else{
			params.ZRRJH= policeNumArray.join(',');
		}
		UI.util.showLoadingPanel();
		UI.control.remoteCall('cs/customAlarm/send', params, function (resp){
			if(resp.message){
				UI.util.hideLoadingPanel();
				UI.util.alert(resp.message);
				return;
			}
		});
		parent.UI.util.closeCommonWindow();
		
	});
	$("body").on('click','.link',function(event){
		var currentId=$(this).attr("obj-id");
		var data=[];
		var listData=UI.control.getControlById("policeTerminalList").data();
		var listDatas=listData["policeTerminalList"].records;
		for(var i=0;i<listDatas.length;i++){
			if(listDatas[i]["OBJ_ID"]==currentId){
				listDatas[i]["STYLE"]="1";
				data.push(listDatas[i]);
				break;
			}
		}
		parent.UI.util.returnCommonWindow (data);
		parent.UI.util.closeCommonWindow();
	});
	   
	$("#confirmBtn").click(function(){
		var datas=UI.control.getControlById("policeTerminalList").getListviewCheckData();
		for(var i=0;i<datas.length;i++){
			datas[i]["STYLE"]="1";
		}
		parent.UI.util.returnCommonWindow (datas);
		parent.UI.util.closeCommonWindow();
	});
	
	$("#cancelBtn").click(function(){
		parent.UI.util.closeCommonWindow();
	});
	$("#searchSpan").on("click",function(){
		doSearch();
	});
};

function initTreeEvent(){
	var orgTree = UI.control.getControlById("orgTree");
	orgTree.bindEvent("onDropdownSelect", function(node){
		UI.util.debug(node);
		var orgCode = node.id;
		$("#orgCode").val(orgCode);
		doSearch();
	});
	
	//默认选中父节点
	var id = orgTree.getNodes()[0].id;
	orgTree.setDropdownSelectNode(id);
}

function doSearch(){
	queryParams.orgCode = $("#orgCode").val();
	queryParams.currentPoliceNum=$("#condition").val();
	queryParams.pageNo =1 ;
	//UI.control.getControlById("localCommunityTerminalList").reloadData('', queryTerminalParam);
	UI.control.getControlById("policeTerminalList").reloadData(null, queryParams);
}