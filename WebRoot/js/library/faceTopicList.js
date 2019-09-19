/**
 * @Author lzh
 * @version 2017-08-09
 * @description 人脸专题库右侧列表页；
 */

var DB_ID = UI.util.getUrlParam("DB_ID")
var SEARCH_STATUS = 0; //0表示当前状态是普通查询，1表示当前状态是上传图片进行检索

var queryParams = {
    DB_ID:DB_ID,
    AGE:'',
    BEGIN_TIME:'',
    END_TIME:'',
    KEYWORDS:'',
    PERMANENT_ADDRESS:'',
    PIC:'',
    PRESENT_ADDRESS:'',
    SEX:'',
    THRESHOLD:'',
    pageSize:20,
    isAsync:true
};
//用于存储卡片删除id
var params={};
var $beginTime = $('#beginTime');
var $endTime = $('#endTime');
var url_type = UI.util.getUrlParam("type");

var timeOption = {
    'elem':$('#birthdayTagsWrap'),
    'beginTime' :$('#beginTime'),
    'endTime' :$('#endTime'),
    'format':'yyyy-MM-dd',
    'callback':doSearch
};

var addressOption = {
    'elem':['domicile','nowAddress'],//地址HTML容器
    'addressId':['registerAreaList','addressArea'],//初始化省级内容
    'service':'face/address/getTree',//请求服务
    'tmpl':'childNodeListTemplate',//初始化模板
    'selectArr':["PERMANENT_ADDRESS","PRESENT_ADDRESS"],
    /*'data':['150623','440111'],//回填值*/
    'callback':null//回调函数
}

$(function () {
    UI.control.init();
    initEvent();
    initFilterAgeGroup();
    topSpecialUploadPic();
    initAreaTree(addressOption);
    initFilterEvent(doSearch);    
    initDateTimeControl(timeOption);
    selectedTag();
	initWaterMark();
    window.getAlgoList = slideFn('face/common/getFaceAlgoList');
});




//预准备查询参数
function prepareQueryParams(){	
	if (UI.util.validateForm($('#thresholdValidate'))) {
		queryParams.KEYWORDS = $('#searchCon').val();
		queryParams.pageNo = 1;
	    queryParams.AGE = $("#birthdayTagsList").attr("birthdaytagslist")|| -1;
	    queryParams.BEGIN_TIME = $("#beginTime").val();
	    queryParams.END_TIME = $("#endTime").val();
	    queryParams.PERMANENT_ADDRESS = $("input[name='PERMANENT_ADDRESS']").val();
	    queryParams.PRESENT_ADDRESS = $("input[name='PRESENT_ADDRESS']").val();
	    queryParams.SEX = $("#SEX").attr("SEX")||'';
	    queryParams.THRESHOLD = $("#threshold").val();
        queryParams.ALGO_LIST =  JSON.stringify( getAlgoList() );
	    if(queryParams.AGE == 5){
			queryParams.AGE = "";
		}else if(queryParams.AGE == -1){
			 queryParams.BEGIN_TIME = "";
			 queryParams.END_TIME = "";
		}
	    if($('#filterImg').attr("src").indexOf("http://") != -1){
            queryParams.FILE_ID = global.fileid;
            queryParams.PIC = global.fileid;
	        SEARCH_STATUS = 1;
	    }else {
            queryParams.FILE_ID = "";
            queryParams.PIC = "";
	        SEARCH_STATUS = 0;
	    }
	    return true;
	}
	else{
		return false;
	}
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
            doSearch()
		}
	});
	$("#searchBarBtn").click(function () {
        doSearch();
	})
	
		//导出按钮
	$("#export").click(function(){
		if (SEARCH_STATUS == 0) { //普通查询
			var url = UI.control.getRemoteCallUrl("face/specialPic/exportProvider");
			var exportData = UI.control.getControlById("dispatchedApprovalList").getListviewCheckData();
			if (exportData.length>0) {
				queryParams.EXPORT_DATA = JSON.stringify(exportData);
			} else {
				queryParams.EXPORT_DATA = "";
				prepareQueryParams();
			}
		} else if (SEARCH_STATUS == 1) {//上传图片检索
			var url = UI.control.getRemoteCallUrl("face/specialPic/export");
			var exportData = UI.control.getControlById("dispatchedApprovalList").getListviewCheckData();;
			if (exportData.length == 0) {
				exportData = UI.control.getDataById("dispatchedApprovalList").records;
			}
			queryParams.EXPORT_DATA = JSON.stringify(exportData);
		}

		bigDataToDownload(url,"exportFrame",queryParams);
	})


	//隐藏菜单按钮
    if(url_type=='subPage'){
        //$("#subPageMenu").remove();
    	$('.mainPage').removeClass("hide");
        $(".btn-edit").remove();
    }else{
    	$(".searchPage").removeClass("hide");
    	$('.mainPage').removeClass("hide");
    };

    //新增人员
    $("#addItem").click(function(){
        UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/addFaceTopicList.html?SOURCE_DB='+DB_ID);
    });

    //编辑
    $("body").on("click",".btn-edit",function () {
        var info_id = $(this).attr("info_id");
        UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/addFaceTopicList.html?pageType=edit&SOURCE_DB='+DB_ID+'&info_id='+info_id);
    });


    //编辑
    $("body").on("click",".btn-more",function () {
        var info_id = $(this).attr("info_id");
        UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/addFaceTopicList.html?pageType=detail&SOURCE_DB='+DB_ID+'&info_id='+info_id);
    });

    //收藏
	$("body").on("click",".collectionBtn",function(){
		var ref = $(this).attr("ref");
		UI.util.showCommonWindow(ref, "收藏文件夹", 
				600, 450, function(obj){
		});
	});

    //批量导入
    $("#batchImportBtn").click(function(){
        UI.util.showCommonWindow("/efacecloud/page/library/importPersonalLibrary.html?libType=themeLib&libID="+DB_ID, "批量导入", 802, 400,function(data){
        	uploadSuccess(data);
        });
    });


    //刷新按钮
    $("body").on("click","#freshBtn",function(){
        doSearch();
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


	/*//上传图片处理
    $('#filterImg').change(function(){
    	ajaxFileUpload($(this).attr('id'),picSuccFunction);
    });*/
    
    
  //卡片删除@lyy
	$("body").on("click",".deleteBtn",function(){
        var $this = $(this);
        UI.util.confirm("是否确定删除？",function(){
            params.SOURCE_DB = DB_ID;
            params.INFO_ID = $this.attr("info_id");
            ExtendRemoteCall('face/specialPic/delete',params,function () {
            	setTimeout(function(){
            		 $this.closest('.list-node-wrap').remove();
            		 parent.doRefresh();
            	},1000)
               
            })
		});
	});	
	//卡片批量删除(多个)
	$('#deleteItem').click(function(){
		var nodeId = getCheckList();
		if(nodeId){
			UI.util.confirm("是否确定删除？",function(){
				params.INFO_ID = nodeId;
				params.SOURCE_DB = DB_ID;
	            UI.control.remoteCall('face/specialPic/delete',params,function (resp) {
	            	setTimeout(function(){
						if(resp.CODE==0){
							UI.util.alert(resp.MESSAGE);
							UI.control.getControlById("dispatchedApprovalList").reloadData(null,queryParams);
							parent.doRefresh();
						}else{
							UI.util.alert(resp.MESSAGE, "warn");
						}
					}, 1000);
	            })
			});
		}else{
			UI.util.alert("请至少选择一条记录", 'warn');
		}
	});
	
	//阈值回车事件
	$('#threshold').keypress(function(e){
		if(((e.keyCode || e.which) == 13)) {
			doSearch();
		}
	});
         
}

//查询
function doSearch(){
	if(prepareQueryParams()){
		UI.control.getControlById("dispatchedApprovalList").reloadData(null,queryParams);
	}
}

//专题库批量导入成功回调
function uploadSuccess(data){
	
	if(data.CODE == 0){
		
		var fileID = data.ERROR_FILE_ID;
		var url = "face/specialPic/exportErrorMsg?ERROR_FILE_ID=" + data.ERROR_FILE_ID ;
		importingData( data.SUCCESS_COUNT, data.FAIL_COUNT , url , function(){
		   
			setTimeout(function(){
				$("#confirmSearch").trigger('click');
				parent.doRefresh();
			},1000)
			
		});
		
	}else if(data.CODE == 1){
		
		UI.util.alert(data.MESSAGE,'wran');
	}
	
}

//获取被选中的人脸
function getCheckList(){
	var checkList;
	$('.active.list-node-wrap').each(function(index){
		if(index == 0)checkList=$(this).attr('info_id');
		else{
			checkList += ',' + $(this).attr('info_id');
		}
	});
	return checkList;
}

