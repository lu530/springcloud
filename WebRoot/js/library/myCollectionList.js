var favoriteId = UI.util.getUrlParam('favoriteId');
var fileName = UI.util.getUrlParam('fileName')||'';
var fileType = UI.util.getUrlParam('fileType')||'';
var queryParams = {
		FAVORITE_ID:favoriteId,
		pageNo:1,
		pageSize:20
};
var params={};
var collectionOptions={
	parameters:queryParams,
	template:fileType==2?'collectionTemplate':'captureTemplate'
}
var timeOption = {
		'elem':$('#birthdayTagsWrap'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'format':'yyyy-MM-dd'
};
var captureTimeOption = {
		'elem':$('#captureTimeList'),
		'beginTime' :$('#captureBeginTime'),
		'endTime' :$('#captureEndTime'),
		'callback':searchCaputerList
};
var addressOption = {
		'elem':['domicile','nowAddress'],//地址HTML容器
		'addressId':['registerAreaList','addressArea'],//初始化省级内容
		'service':'face/address/getTree',//请求服务
		'tmpl':'childNodeListTemplate',//初始化模板
		'selectArr':['PERMANENT_ADDRESS','PRESENT_ADDRESS']
		/*'data':['150623','440111'],//回填值*/
		/*'callback':setParams*///回调函数
}

$(function(){
	initPage();
	UI.control.init();
	$("#collectionName").html(fileName);
	initEvent();
	initAreaTree(addressOption);
	initDateTimeControl(captureTimeOption);
	initDateTimeControl(timeOption);
	initFilterAgeGroup();
    //initPersonTab();
	initWaterMark();
    selectedTag();
});

function initPage(){
	if (fileType==2) {  //人脸资源
		$("#captureFilter").addClass("hide");
	} else {
		$("#collectionFilter,#batchImportBtn,#addBtn").addClass("hide");
	}
}

function initPersonTab(){
	UI.control.remoteCall("face/personTag/list",{},function(resp){
		$('#personTab').append(tmpl("tagTemplate", resp.data));
	});
}

function searchCaputerList(time){
	params.FAVORITE_ID = favoriteId;
	params.CAPTURE_TIME_START = $("#captureBeginTime").val();
	params.CAPTURE_TIME_END = $("#captureEndTime").val();
	params.DEVICE_KEYWORDS = $("#searchDevice").val();
	UI.control.getControlById("myCollectionList").reloadData(null,params);
}

function doPersonSearch(){
	UI.util.showLoadingPanel();
	queryParams.pageSize = 20;
	queryParams.pageNo = 1;
	queryParams.AGE = $('#birthdayTagsList').attr('birthdaytagslist') || "-1";
	queryParams.BEGIN_TIME = $("#beginTime").val();
	queryParams.END_TIME = $("#endTime").val();
	queryParams.PERMANENT_ADDRESS = $("input[name='PERMANENT_ADDRESS']").val();
	queryParams.PRESENT_ADDRESS = $("input[name='PRESENT_ADDRESS']").val();
	queryParams.PERSON_TAG = $("#personTab").attr("personTab")||'';
	queryParams.SEX = $("#SEX").attr("SEX")||-1;
	if (queryParams.AGE == 5) {
		queryParams.AGE = '';
	}
	if (queryParams.AGE == '-1') {
		queryParams.BEGIN_TIME = '';
		queryParams.END_TIME = '';
	}
	queryParams.PERSON_KEYWORDS = $("#searchPerson").val();
	UI.control.getControlById("myCollectionList").reloadData(null,queryParams);
	UI.util.hideLoadingPanel();
}

function initEvent(){

    //轨迹分析
    $("body").on("click",".trajectory-search",function(){
    	var time = {
	        	bT: queryParams.BEGIN_TIME?queryParams.BEGIN_TIME:params.CAPTURE_TIME_START,
	        	eT: queryParams.END_TIME?queryParams.END_TIME:params.CAPTURE_TIME_END
	        };
        openWindowPopup('track',$(this).attr("url"),time);
    });
    //身份核查
    $("body").on("click",".verification-search",function(){
        openWindowPopup('identity',$(this).attr("url"));
    });

	$("#searchDevice").keyup(function(event){
		if(event.which==13){ 
			searchCaputerList();
		}
	});
	$('#searchDeviceBtn').click(function(){
		searchCaputerList();
	});
	$("#searchPerson").keyup(function(event){
		if(event.which==13){ 
			doPersonSearch();
		}
	});
	$('#searchPersonBtn').click(function(){
		doPersonSearch();
	});
	
	//查询按钮
	$("#confirmSearch").click(function(){
		doPersonSearch();
	})
	
	//新增表单
	$("#addBtn").click(function(){
		UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/addPersonCollectionForm.html?favoriteId='+favoriteId);
	});
	
	//卡片编辑
	$("body").on("click",".editBtn",function(){
		var fileId = $(this).parent().attr("fileId");
		UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/addPersonCollectionForm.html?pageType=edit&favoriteId='+favoriteId+'&fileId='+fileId);
	});
	
	//删除按钮
	$("body").on("click",".deleteBtn",function(){
		var $this = $(this);
		var fileId = $this.parent().attr("fileId");
		var params = {FAVORITE_ID:favoriteId,FILE_ID:fileId};
		doDelFavorite(params);
	});
	
	//删除文件夹(多个）
	$('#deleteCheckBtn').click(function (){
		var curParams={};
		
		var selectData = UI.control.getControlById('myCollectionList').getListviewCheckData();
		if(selectData.length <= 0){
			UI.util.alert("请选择至少一个文件", "warn");
			return;
		}
		var fileids = [],favoriteIds = [];
		for(var i=0;i<selectData.length; i++){
			fileids.push(selectData[i].FILE_ID);
		}
		curParams.FILE_ID = fileids.join(',');
		curParams.FAVORITE_ID = favoriteId;
		if(!curParams.FAVORITE_ID){
			UI.util.alert("请选择至少一个文件", "warn");
			return;
		}
		doDelFavorite(curParams);
		
	});
	
	//返回
	$('#backBtn').click(function(){
		parent.UI.util.hideCommonIframe('.frame-form-full');
		parent.doSearch();
	});
	
	//批量导入
    $("#batchImportBtn").click(function(){
    	UI.util.showCommonWindow("/efacecloud/page/library/importPersonalLibrary.html?libType=favoriteLib&libID="+favoriteId, "批量导入", 802, 400,function(data){
    		uploadSuccess(data); 
		});
    });
    
  //导出
	$('#export').click(function(){
		var exportParams = {
			FILE_TYPE : fileType,
			FAVORITE_ID : favoriteId
		};
		var url = UI.control.getRemoteCallUrl("face/favoriteFile/exportFaceSearch");
		var exportData = UI.control.getControlById('myCollectionList').getListviewCheckData();
		if (exportData.length > 0) {
			exportParams.EXPORT_DATA = JSON.stringify(exportData);
		} else {
			if (fileType == 1) {
				exportParams.CAPTURE_TIME_START = $('#captureBeginTime').val() || "";
				exportParams.CAPTURE_TIME_END = $('#captureEndTime').val() || "";
				exportParams.DEVICE_KEYWORDS = $("#searchDevice").val();
			} else {
				exportParams.BEGIN_TIME = $('#beginTime').val() || "";
				exportParams.END_TIME = $('#endTime').val() || "";
				exportParams.PERMANENT_ADDRESS=$('[name=PERMANENT_ADDRESS]').val() || "";
				exportParams.PRESENT_ADDRESS=$('[name=PRESENT_ADDRESS]').val() || "";
				exportParams.PERSON_TAG = $('#personTab').attr('persontab') || "";
				exportParams.SEX = $('#SEX').attr('sex') || "";
				exportParams.AGE = $('#birthdayTagsList').attr('birthdaytagslist') || "-1";
				if (exportParams.AGE == 5) {
					exportParams.AGE = '';
				}
				if (exportParams.AGE == '-1') {
					exportParams.BEGIN_TIME = '';
					exportParams.END_TIME = '';
				}
				exportParams.PERSON_KEYWORDS = $("#searchPerson").val();
			}
		}
		bigDataToDownload(url,"exportFrame",exportParams);
	});
}

//删除人脸
function doDelFavorite(params){
	UI.util.confirm("确定删除选中的文件?",function() {
		UI.util.showLoadingPanel();
		UI.control.remoteCall("face/favoriteFile/delete",params,function(resp){
			if(resp.CODE==0){
				UI.util.alert(resp.MESSAGE);
				UI.control.getControlById("myCollectionList").reloadData(null,null);
				UI.util.hideLoadingPanel();
			}else{
				UI.util.alert(resp.MESSAGE, "warn");
				UI.util.hideLoadingPanel();
			}
		}, function(){
			UI.util.hideLoadingPanel();
		} , 
		{async : true}, true);
	});
}

function doSearch(){
	UI.control.getControlById("myCollectionList").reloadData(null,null);
}

//批量导入成功回调
function uploadSuccess(data){
	
	if(data.CODE == 0){
		
		var fileID = data.ERROR_FILE_ID;
		var url = "face/favoriteFile/exportErrorMsg?ERROR_FILE_ID=" + data.ERROR_FILE_ID ;
		importingData( data.SUCCESS_COUNT, data.FAIL_COUNT , url , function(){
			doSearch();
		});
		
	}else if(data.CODE == 1){
		
		UI.util.alert(data.MESSAGE,'wran');
	}
	
}
