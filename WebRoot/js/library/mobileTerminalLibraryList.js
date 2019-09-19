var timeOption = {
		'elem':$('#birthdayTagsWrap'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'format':'yyyy-MM-dd'/*,
		'callback':doSearch*/
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
var queryParams = {};
$(function(){
	UI.control.init();
	initEvent();
	initAreaTree(addressOption);
	initDateTimeControl(timeOption);
	//上传头部
    topSpecialUploadPic();
    initFilterAgeGroup();
    initPersonTab();
    selectedTag();
    initUnfoldTag();
	initWaterMark();
    window.getAlgoList = slideFn('face/common/getFaceAlgoList');
});

function initPersonTab(){
	UI.control.remoteCall("face/personTag/list",{},function(resp){
		$('#personTab').append(tmpl("tagTemplate", resp.data));
	});
}

function initEvent(){

    //轨迹分析
    $("body").on("click",".trajectory-search",function(){
        openWindowPopup('track',$(this).attr("url"));
    });
    //身份核查
    $("body").on("click",".verification-search",function(){
        openWindowPopup('identity',$(this).attr("url"));
    });

	//查询按钮
	$("#confirmSearch").click(function(){
		doSearch();
	});
	
	//查询条
	$('#searchCon').keypress(function(e){
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});
	
	$("#searchBarBtn").click(function(){
		doSearch();
	});
	
	//删除(多个）
	$('#deleteCheckBtn').click(function (){
		var params={};
		
		var selectData = UI.control.getControlById('mobileList').getListviewCheckData();
		if(selectData.length <= 0){
			UI.util.alert("请选择至少一个文件", "warn");
			return;
		}
		var infoids = [];
		for(var i=0;i<selectData.length; i++){
			infoids.push(selectData[i].INFO_ID);
		}
		params.INFO_ID = infoids.join(',');
		if(!params.INFO_ID){
			UI.util.alert("请选择至少一个文件", "warn");
			return;
		}
		doDelFavorite(params);
		
	});
	
	//删除按钮
	$("body").on("click",".deleteBtn",function(){
		var $this = $(this);
		var infoId = $this.parent().attr("infoid");
		var params = {INFO_ID:infoId};
		doDelFavorite(params);
	});
	
	//刷新按钮
	$("body").on("click","#freshBtn",function(){
		doSearch();
	});
	
	//新增表单
	$("#addBtn").click(function(){
		UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/mobileTerminalLibraryForm.html');
	});
	
	//卡片搜索
	$("body").on("click",".searchBtn",function(){
		var $this = $(this);
		var filterUrl = $this.attr("filterurl");
		
		$("#filterImg").attr("src",filterUrl);
        global.fileid = getFileid(filterUrl,true);
        if($(".arithmetic-tools.on").length==0){ //如果没有选中的算法，默认选择第一种；
            $(".arithmetic-tools:eq(0) i").trigger('click');
        }
		 $('.bottom-pic-bar').removeClass('hide');
		doSearch();
	});
	
	//收藏
	$("body").on("click",".collectionBtn",function(){
		var ref = $(this).attr("ref");
		UI.util.showCommonWindow(ref, "收藏文件夹", 
				600, 450, function(obj){
		});
	});
	
	//卡片编辑
	$("body").on("click",".editBtn",function(){
		var infoId = $(this).parent().attr("infoid");
		UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/mobileTerminalLibraryForm.html?pageType=edit&infoId='+infoId);
	});
	
	//批量导入
    $("#batchImportBtn").click(function(){
    	UI.util.showCommonWindow("/efacecloud/page/library/importPersonalLibrary.html?libType=mobileLib", "批量导入", 802, 400,function(data){
    		uploadSuccess(data); 
		});
    });
    
  //导出
	$('#export').click(function(){
		var exportParams = {};
		var url = UI.control.getRemoteCallUrl("face/terminal/exportFaceSearch");
		var exportData = "";
		if ($('#filterImg')[0].src.slice(-12) != "noPhoto2.png") {
			exportData = UI.control.getControlById('mobileList').getListviewCheckData();
			if (exportData.length <= 0) {
				UI.util.alert("请勾选导出的数据","warn");
				return;
			}
			exportParams.SEARCH_IMG_URL = $('#filterImg')[0].src;
			exportParams.EXPORT_DATA = JSON.stringify(exportData);
		} else {
			exportData = UI.control.getControlById('mobileList').getListviewCheckData();
			if (exportData.length > 0) {
				exportParams.EXPORT_DATA = JSON.stringify(exportData);
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
				exportParams.KEYWORDS = $("#searchCon").val() || "";
			}
		}
		bigDataToDownload(url,"exportFrame",exportParams);
	});
	
	//阈值回车事件
    $('#threshold').keypress(function(e){
        if(((e.keyCode || e.which) == 13)) {
            doSearch();
        }
    });
}

//删除文件
function doDelFavorite(params){
	UI.util.confirm("确定删除选中的文件?",function() {
		UI.util.showLoadingPanel();
		UI.control.remoteCall("face/terminal/delete",params,function(resp){

			setTimeout(function(){
				if(resp.CODE==0){
					UI.util.alert(resp.MESSAGE);
					UI.control.getControlById("mobileList").reloadData(null,null);
					UI.util.hideLoadingPanel();
				}else{
					UI.util.alert(resp.MESSAGE, "warn");
					UI.util.hideLoadingPanel();
				}
			}, 1000);
		}, function(){
			UI.util.hideLoadingPanel();
		} , 
		{async : true}, true);
	});
}

//移动终端库批量导入成功回调
function uploadSuccess(data){
	
	if(data.CODE == 0){
		
		var fileID = data.ERROR_FILE_ID;
		var url = "face/terminal/exportErrorMsg?ERROR_FILE_ID=" + data.ERROR_FILE_ID ;
		importingData( data.SUCCESS_COUNT, data.FAIL_COUNT , url , function(){
			doSearch();
		});
		
	}else if(data.CODE == 1){
		
		UI.util.alert(data.MESSAGE,'wran');
	}
	
}

function doSearch(){
	if (UI.util.validateForm($('#thresholdValidate'))) {
		queryParams.pageNo=1;
		queryParams.AGE = $('#birthdayTagsList').attr('birthdaytagslist') || "-1";
		queryParams.BEGIN_TIME = $("#beginTime").val();
		queryParams.END_TIME = $("#endTime").val();
		queryParams.PERMANENT_ADDRESS = $("input[name='PERMANENT_ADDRESS']").val();
		queryParams.PRESENT_ADDRESS = $("input[name='PRESENT_ADDRESS']").val();
		queryParams.PERSON_TAG = $("#personTab").attr("personTab")||'';
		queryParams.SEX = $("#SEX").attr("SEX")||'';
		queryParams.ALGO_LIST =  JSON.stringify( getAlgoList() );
		queryParams.isAsync = true;
		if(queryParams.AGE == 5){
			queryParams.AGE = '';
		}
		
		if (queryParams.AGE == '-1') {
			queryParams.BEGIN_TIME = '';
			queryParams.END_TIME = '';
		}
		
		queryParams.KEYWORDS=$('#searchCon').val();
		queryParams.THRESHOLD = $("#threshold").val();
		if($('#filterImg')[0].src.slice(-12)!="noPhoto2.png"){
            queryParams.FILE_ID = global.fileid;
	    }else{
            queryParams.FILE_ID = "";
	    }
		UI.control.getControlById("mobileList").reloadData(null,queryParams);
		//重新加载后显示百分比
		/*if($('#filterImg')[0].src.slice(-12)!="noPhoto2.png"){
			$(".similarData").removeClass("hide");
		}*/
	}
}