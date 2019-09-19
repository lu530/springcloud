//初始化列表查询参数
var queryParams={
    pageNo:1,
    pageSize:30
}
/*var queryStatus = "1";*/  //1红名单库查询 2图片检索查询
//年龄段初始化参数
var timeOption = {
		'elem':$('#birthdayTagsWrap'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'format':'yyyy-MM-dd',
		'callback':getSearchTime
};
//居住地树初始化参数
var addressOption = {
		'elem':['domicile','nowAddress'],
		'addressId':['registerAreaList','addressArea'],
		'service':'face/address/getTree',
		'tmpl':'childNodeListTemplate',
		'selectArr':['PERMANENT_ADDRESS','PRESENT_ADDRESS']
}

$(function () {
	UI.control.init();
	initEvent();
	//初始化地址树
	initAreaTree(addressOption);
	//初始化时间控件
    initDateTimeControl(timeOption);
    //头部图片上传组件
	topUploadPic();
	//年龄段筛选
    initFilterAgeGroup();
    //标签单选与多选
    selectedTag();
    //初始化水印
    initWaterMark();
})

function initEvent(){
	//批量导入按钮
    $("#batchImportBtn").click(function(){
    	UI.util.showCommonWindow("/efacecloud/page/library/importRedLibrary.html", "批量导入红名单", 700, 300,function(data){
    		uploadSuccess(data); 
		});
    });
	
	//卡片搜索
    /*$("body").on("click",".searchBtn",function(){
        var $this = $(this);
        var filterUrl = $this.attr("filterurl");
        $("#filterImg").attr("src",filterUrl);
        $('.bottom-pic-bar').removeClass('hide');
        doSearch();
    });*/
    
    //多选删除
	$('#deleteItem').click(function(){
		var selectData = UI.control.getControlById('dispatchedApprovalList').getListviewCheckData();
		if(selectData.length <= 0){
			UI.util.alert("请选择至少一个文件", "warn");
			return;
		}
		var infoids = [];
		for(var i=0;i<selectData.length; i++){
			infoids.push(selectData[i].INFO_ID);
		}
		
		var infoId = infoids.join(',');
		delRedListLib({INFO_ID:infoId});
	});
	
	//删除按钮
	$('body').on('click','.deleteBtn',function(){
		var infoId = $(this).attr("info_id");
		delRedListLib({INFO_ID:infoId});
	});

	//输入框的搜索按钮
	$('#inputSearch').click(function(){
		doSearch();
	})
	$('.search-input').keyup(function(e){
		if(e.keyCode==13){
			doSearch();
		}
	});

	//编辑按钮
	$('body').on('click','.btn-edit',function(){
		var info_id = $(this).attr("info_id");
        UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/redListLibraryAdd.html?pageType=edit&infoId='+info_id);
	});

	//点击进入详细页面
	$('.library-info').on('click','.btn-more,.detailBtn',function(event){
		var info_id = $(this).attr("info_id");
        UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/redListLibraryAdd.html?pageType=detail&infoId='+info_id);
	});
	
	//添加按钮
	$('#addItem').click(function(){
		UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/redListLibraryAdd.html');
	});
	
	//确认检索
	$('#confirmSearch').click(function(){
		doSearch();
	});
	
	//导出
	$('#export').click(function(){
		var exportParams = {};
		var url = UI.control.getRemoteCallUrl("face/redlist/exportFaceSearch");
		var exportData = "";
		if ($('#filterImg')[0].src.slice(-12) != "noPhoto2.png") {
			exportData = UI.control.getControlById('dispatchedApprovalList').getListviewCheckData();
			if (exportData.length <= 0) {
				UI.util.alert("请勾选导出的数据","warn");
				return;
			}
			exportParams.SEARCH_IMG_URL = $('#filterImg')[0].src;
			exportParams.EXPORT_DATA = JSON.stringify(exportData);
		} else {
			exportData = UI.control.getControlById('dispatchedApprovalList').getListviewCheckData();
			if (exportData.length > 0) {
				exportParams.EXPORT_DATA = JSON.stringify(exportData);
			} else {
				exportParams.BEGIN_TIME = $('#beginTime').val() || "";
				exportParams.END_TIME = $('#endTime').val() || "";
				exportParams.PERMANENT_ADDRESS=$('[name=PERMANENT_ADDRESS]').val() || "";
				exportParams.PRESENT_ADDRESS=$('[name=PRESENT_ADDRESS]').val() || "";
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
	$('#threshold').keyup(function(e){
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});

    //查看待审核任务
    $('#checkTaskBtn').on('click', function(event) {
        UI.util.showCommonWindow('/efacecloud/page/library/lookTask.html',"审批任务管理", $(top.window).width()*.95, $(top.window).height()*.9,
      		function(data){
      	});
    });
}

//红名单库导入成功回调
function uploadSuccess(data){
	if(data.CODE == 0){
		var fileID = data.ERROR_FILE_ID;
		var url = "face/redlist/exportErrorMsg?ERROR_FILE_ID=" + data.ERROR_FILE_ID ;
		importingData( data.SUCCESS_COUNT, data.FAIL_COUNT , url, function(){
			doSearch();
		});
	}else if(data.CODE == 1){
		UI.util.alert(data.MESSAGE,'wran');
	}
}

function doSearch(){
	if (prepareQueryParams()) {
	    UI.control.getControlById("dispatchedApprovalList").reloadData('face/redlist/query',queryParams);
	}
}

//预准备查询参数
function prepareQueryParams(){
	if (UI.util.validateForm($('#thresholdValidate'))) {
		queryParams.pageNo = 1; 
		queryParams.AGE = $('#birthdayTagsList').attr('birthdaytagslist') || -1;
	    queryParams.BEGIN_TIME = $('#beginTime').val();
	    queryParams.END_TIME = $('#endTime').val();
	    queryParams.KEYWORDS = $(".search-input").val();
	    queryParams.PERMANENT_ADDRESS=$('[name=PERMANENT_ADDRESS]').val();
	    queryParams.PRESENT_ADDRESS=$('[name=PRESENT_ADDRESS]').val();
	    queryParams.SEX = $('#SEX').attr('sex');
	    queryParams.THRESHOLD = $('#threshold').val(); 
	    queryParams.isAsync = true;
	    $.each(queryParams, function(i, val) {  
	        if(typeof val=="undefined"){
	        	queryParams[i]="";
	        }
	    });
	    if(queryParams.AGE == 5){
			queryParams.AGE = "";
		}else if(queryParams.AGE == -1){
			 queryParams.BEGIN_TIME = "";
			 queryParams.END_TIME = "";
		}
	    if($('#filterImg').attr("src").indexOf("http://") != -1){
	    	queryParams.PIC = $('#filterImg')[0].src;
		}else{
			queryParams.PIC = '';
		}
	    return true;
	}else{
		return false;
	}
}

//删除红名单
function delRedListLib(params) {
	UI.util.confirm("确认删除当前红名单?",function() {
		UI.util.showLoadingPanel();
		UI.control.remoteCall("face/redlist/delete",params,function(resp){
			setTimeout(function(){
				if(resp.CODE==0){
					UI.util.alert(resp.MESSAGE);
					UI.control.getControlById("dispatchedApprovalList").reloadData(null,null);
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

//自定义年龄段设置
function getSearchTime(dateTime){
	queryParams.beginTime = dateTime.bT;
	queryParams.endTime = dateTime.eT;
}
