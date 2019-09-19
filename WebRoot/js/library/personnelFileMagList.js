var queryParams = {};
var logParam = {};
var beginTime = $('#beginTime'),
    endTime = $('#endTime');

var pageType = UI.util.getUrlParam('page');

var queryParams={
		pageSize:30
}

var queryStatus = "1";  //1人员档案查询 2图片检索查询
var searchPage = false; //是否是搜索页面

var timeOption = {
		'elem':$('#birthdayTagsWrap'),
		'beginTime' :beginTime,
		'endTime' :endTime,
		'format':'yyyy-MM-dd',
		'callback':getSearchTime
};

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
	initAreaTree(addressOption);
    initDateTimeControl(timeOption);
	initFilterEvent();
    topSpecialUploadPic();
    initFilterAgeGroup();
    initPersonTab();
    selectedTag();
    initPage();
	initWaterMark();
    window.getAlgoList = slideFn('face/common/getFaceAlgoList');
})

function initPersonTab(){
	
	UI.control.remoteCall("face/personTag/list",{},function(resp){
		$('#personTab').append(tmpl("tagTemplate", resp.data));
	});
	
	initUnfoldTag();
}

function initPage(){
	if(pageType=="subPage"){
		$(".page-title span").html('人员档案库检索');
		searchPage = true;
	}else{
		$(".searchPage").removeClass("hide");
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

	//批量导入按钮
    $("#batchImportBtn").click(function(){
    	UI.util.showCommonWindow("/efacecloud/page/library/importPersonalLibrary.html?libType=personalLib", "批量导入人员档案", 802, 400,function(data){
    		uploadSuccess(data); 
		});
    });
	
	//删除按钮
	$('#deleteItem').click(function(){
		var deleteIdList=[];
		var deleteFaceList=[];
		$('.list-node-wrap.active').each(function(){
			deleteIdList.push($(this).attr('personId'));
			deleteFaceList.push($(this).attr('infoId'));
		})
		if(deleteFaceList[0]==""||typeof deleteFaceList[0] == "undefined"){
			if(deleteIdList.length>0){
				var id = deleteIdList.join(',');
			       UI.util.confirm('确认删除选中的档案?',function (){
			    	   UI.util.showLoadingPanel();
			    	   UI.control.remoteCall('face/archives/deletePerson',{PERSON_ID:id},function (resp){
			    		   if (resp.CODE == 0){
				    			UI.util.alert(resp.MESSAGE);
				    			doSearch();
			    		   }
			    		   else{
			    			   UI.util.alert(resp.MESSAGE,"warn");
			    		   }
			    		   UI.util.hideLoadingPanel();
			    		},function(){},{},true);
			       });
			}
			else{
				UI.util.alert('请选中需要删除的档案','warn');
			}
		}
		else{
			if(deleteFaceList.length>0){
				var infoId = deleteFaceList.join(',');
			       UI.util.confirm('确认删除选中的人脸档案?',function (){
			    	   UI.util.showLoadingPanel();
			    	   UI.control.remoteCall('face/archives/picDelete',{INFO_ID:infoId},function (resp){
			    		   if (resp.CODE == 0){
				    			UI.util.alert(resp.MESSAGE);
				    			doSearch();
			    		   }
			    		   else{
			    			   UI.util.alert(resp.MESSAGE,"warn");
			    		   }
			    		   UI.util.hideLoadingPanel();
			    		},function(){},{},true);
			       });
			}
			else{
				UI.util.alert('请选中需要删除的人脸档案','warn');
			}
		}
	})
	
	//收藏
	$("body").on("click",".collectionBtn",function(){
		var ref = $(this).attr("ref");
		UI.util.showCommonWindow(ref, "收藏文件夹", 
				600, 450, function(obj){
		});
	});
	
	//删除按钮
	$('body').on('click','.btn-delete',function(){
		var infoId = $(this).closest('.list-node-wrap').attr('infoId');
		if(infoId == ""||typeof infoId == "undefined"){
			var personId = $(this).closest('.list-node-wrap').attr('personid');
			UI.util.confirm('确认删除当前档案?',function (){
				   UI.util.showLoadingPanel();
		    	   UI.control.remoteCall('face/archives/deletePerson',{PERSON_ID:personId},function (resp){
		    		   if (resp.CODE == 0){
			    			UI.util.alert(resp.MESSAGE);
			    			doSearch();
		    		   }
		    		   else{
		    			   UI.util.alert(resp.MESSAGE,"warn");
		    		   }
		    		   UI.util.hideLoadingPanel();
		    		},function(){},{},true);
		     });
		}
		else{
			UI.util.confirm('确认删除当前人脸档案?',function (){
		    	   UI.control.remoteCall('face/archives/picDelete',{INFO_ID:infoId},function (resp){
		    		   if (resp.CODE == 0){
			    			UI.util.alert(resp.MESSAGE);
			    			doSearch();
		    		   }
		    		   else{
		    			   UI.util.alert(resp.MESSAGE,"warn");
		    		   }
		    		   UI.util.hideLoadingPanel();
		    		},function(){},{},true);
		    });
		}
	});
	
	//刷新按钮
	$("body").on("click","#freshBtn",function(){
		doSearch();
	});
	
	//编辑按钮
	$('body').on('click','.btn-edit',function(){
		var personId = $(this).closest('.list-node-wrap').attr('personid');
		UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/personnelFileMagAdd.html?pageType=edit&personId='+personId);
	});
	
	//输入框的搜索按钮
	$('#inputSearch').click(function(){
		doSearch();
	})
	$('.search-input').keydown(function(e){
		if(e.keyCode==13){
			doSearch();
		}
	})
	
	//列表项的搜索按钮
	$('body').on('click','.btn-search',function(){
		$('#filterImg')[0].src = $(this).closest('.list-node').find('img')[0].src;
        global.fileid = getFileid($('#filterImg')[0].src,true);
        if($(".arithmetic-tools.on").length==0){ //如果没有选中的算法，默认选择第一种；
            $(".arithmetic-tools:eq(0) i").trigger('click');
        }
		$('.bottom-pic-bar').removeClass('hide');
		doSearch();
	});
	
	//点击进入详细页面
	$('.library-info').on('click','.similar-name a,.btn-more',function(event){
		var personId = $(this).closest('.list-node-wrap').attr('personid');
		UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/personnelFileMagDetail.html?personId='+personId);
	});
	
	//添加按钮
	$('#addItem').click(function(){
		UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/personnelFileMagAdd.html');
	});
	
	$('#confirmSearch').click(function(){
		doSearch();
	});
	
	//导出
	$('#export').click(function(){
		
		var exportParams = {};
		var url = "";
		var exportData = "";
		if(queryStatus == "2"){
			url = UI.control.getRemoteCallUrl("face/archivesPic/exportFacePic");
			exportData = UI.control.getControlById("dispatchedApprovalList").getListviewCheckData();
			if(exportData.length <= 0){
				exportData = UI.control.getControlById("dispatchedApprovalList").data().dispatchedApprovalList.records;
			}
			exportParams.EXPORT_DATA = JSON.stringify(exportData);
			exportParams.SEARCH_IMG_URL = $('#filterImg')[0].src || "";
		}
		else{
			url = UI.control.getRemoteCallUrl("face/archivesPerson/exportPerson");
			exportData = UI.control.getControlById("dispatchedApprovalList").getListviewCheckData();
			if(exportData.length > 0){
				exportParams.EXPORT_DATA = JSON.stringify(exportData);
			}else{
				
				exportParams.BEGIN_TIME = $('#beginTime').val() || "";
				exportParams.END_TIME = $('#endTime').val() || "";
				exportParams.PERMANENT_ADDRESS=$('[name=PERMANENT_ADDRESS]').val() || "";
				exportParams.PRESENT_ADDRESS=$('[name=PRESENT_ADDRESS]').val() || "";
				exportParams.PERSON_TAG = $('#personTab').attr('persontab') || "";
				exportParams.SEX = $('#SEX').attr('sex') || "";
				exportParams.AGE = $('#birthdayTagsList').attr('birthdaytagslist') || -1;
				exportParams.KEYWORDS = $(".search-input").val() || "";
				if(exportParams.AGE == 5){
					exportParams.AGE = "";
				}else if(exportParams.AGE == -1){
					exportParams.BEGIN_TIME = "";
					exportParams.END_TIME = "";
				}
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

//个人档案库导入成功回调
function uploadSuccess(data){
	if(data.CODE == 0){
		
		var fileID = data.ERROR_FILE_ID;
		var url = "face/archives/exportErrorMsg?ERROR_FILE_ID=" + data.ERROR_FILE_ID ;
		importingData( data.SUCCESS_COUNT, data.FAIL_COUNT , url, function(){
			doSearch();
		});
		
	}else if(data.CODE == 1){
		UI.util.alert(data.MESSAGE,'wran');
	}
	
}

function doSearch(){
	if (UI.util.validateForm($('#thresholdValidate'))) {
	
		queryParams.pageNo = 1; 
		queryParams.pageSize = 30;
	    queryParams.BEGIN_TIME = $('#beginTime').val();
	    queryParams.END_TIME = $('#endTime').val();
	    queryParams.PERMANENT_ADDRESS=$('[name=PERMANENT_ADDRESS]').val();
	    queryParams.PRESENT_ADDRESS=$('[name=PRESENT_ADDRESS]').val();
	    queryParams.PERSON_TAG = $('#personTab').attr('persontab');
	    queryParams.SEX = $('#SEX').attr('sex');
	    queryParams.AGE = $('#birthdayTagsList').attr('birthdaytagslist') || -1;
	    queryParams.KEYWORDS = $(".search-input").val();
        queryParams.ALGO_LIST =  JSON.stringify( getAlgoList() );
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
			var PicQueryParams = queryParams;
			PicQueryParams.THRESHOLD = $('#threshold').val();
			// PicQueryParams.IMG = $('#filterImg')[0].src;
            PicQueryParams.FILE_ID = global.fileid;
			UI.control.getControlById("dispatchedApprovalList").reloadData('face/archivesPic/query',PicQueryParams);
			queryStatus = "2";
		}
		else{
            queryParams.FILE_ID = "";
			UI.control.getControlById("dispatchedApprovalList").reloadData('face/archivesPerson/getData',queryParams);
			queryStatus = "1";
		}
	}
}

function getSearchTime(dateTime){
	queryParams.beginTime = dateTime.bT;
	queryParams.endTime = dateTime.eT;
}
