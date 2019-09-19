var logParam = {};
var beginTime = $('#beginTime'),
    endTime = $('#endTime');
var BEGIN_TIME =  UI.util.getUrlParam("BEGIN_TIME");
var END_TIME = UI.util.getUrlParam("END_TIME");
var timeControl = UI.util.getUrlParam("timeControl") || '';

//var pageType = UI.util.getUrlParam('page');
var pageType = 'subPage'

var cameraFirst = false;
var zeroFist = false;
var cameraName = UI.util.getUrlParam('cameraName') || '';

var queryParams={
        BEGIN_TIME :BEGIN_TIME || UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").bT,//页面默认选中今天
        END_TIME : END_TIME || UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").eT,
		pageSize:20
}

var queryStatus = "1";  //1人员档案查询 2图片检索查询
var searchPage = false; //是否是搜索页面

var timeOption = {
		'elem':$('#timeTagList'),
		'beginTime' :beginTime,
		'endTime' :endTime,
		'callback':getSearchTime
};

$(function () {
	UI.control.init();
    initEvent();
    initDateTimeControl(timeOption);
    initFilterEvent();
    topUploadPic();
    // topSpecialUploadPic();
    initFilterAgeGroup();
    selectedTag();
    window.getAlgoList = slideFn('face/common/getFaceAlgoList');
    initPage();
    // 水印
    initWaterMark();
})


function initPage(){
	if(pageType=="subPage"){
		$(".page-title span").html('旅客人脸库检索');
		searchPage = true;
	}else{
		$(".searchPage").removeClass("hide");
	}
	
	if(cameraName){
		// 详情页隐藏设备分组按钮
		$("#cameraSearchBtn").addClass("hide");
		// 时间 默认选中项
		$("[time-control='"+timeControl+"']").addClass('active').siblings().removeClass('active');
		if(timeControl=="zdy"){
			$("#beginTime").parents(".opera-group").addClass("active");
		}
		$('#beginTime').val(BEGIN_TIME);
		$('#endTime').val(END_TIME);
		$(".search-input").val(cameraName);
		doSearch();
	}
}

function initEvent(){
	$(".tag-item").click(function(){
		$(this).addClass("active").siblings().removeClass("active");
	})	
	$('#timeSearchBtn').click(function() {

		
		$(this).addClass("active").siblings().removeClass("active");
		$("#exportGroupBtn").addClass("hide");
		$("#pageWrap,.photo-tools,.group-hide-bar").removeClass("hide");
		$(".page-con").removeClass('hide');
		$("#cameraContent").addClass('hide');
	})
	
	// 按相机查询
	$('#cameraSearchBtn').click(function() {
		//hideZDYTime();
		var time = $("#timeTagList .tag-item.active").attr("time-control");
		if(time=="jt"||time=="zt"){
			
			$("#exportGroupBtn").removeClass("hide");
		}else{
			
			$("#exportGroupBtn").addClass("hide");
		}
		$(this).addClass("active").siblings().removeClass("active");
		/*$("#exportGroupBtn").removeClass("hide");*/
		$("#pageWrap,.photo-tools,.group-hide-bar").addClass("hide");
		$(".page-con").addClass('hide');
		$("#cameraContent").removeClass('hide');
		var id = $(this).attr("id");
		if(id=="cameraSearchBtn"){
			if(!cameraFirst) {
				cameraFirst = true;
				cameraAdminSearch();
			}
		}else if(id=="zeroSearchBtn"){
			if(!zeroFist) {
				zeroFist = true;
				cameraAdminSearch();
			}			
		}
		
	});
	
	//导出分组
	$("#exportGroupBtn").on("click",function(){
		var $this = $(this);
		if($this.hasClass("disable")){
			UI.util.alert("请勿重复点击","warn");
			return;
		}
		$this.addClass("disable");
		var type = $("[groupType].active").attr("groupType");
		var curParams = {
				BEGIN_TIME: $('#beginTime').val(),
				END_TIME: $('#endTime').val(),
				HOTEL_NAME: $(".search-input").val(),
				EXPORT_TYPE :1,
				ZERO_CAPTURE:""
   		};
    	var url = UI.control.getRemoteCallUrl("face/traveler/statisticsExport");
    	bigDataToDownload(url,"exportFrame",curParams);
    	setTimeout(function(){
    		$this.removeClass("disable");
    	},5000);
	});
	
	//按摄像机分组弹窗
	$("body").on("click", ".cameraItem", function(){
		var $this = $(this);
		$this.addClass("active").siblings().removeClass("active");
		var cameraName = $this.find(".cameraName").attr("title");
		// 当前检索时间
		var timeControl = 'jt';
		$('#timeTagList .tagsTime').each(function(index,item){
			if($(this).hasClass('active')){
				timeControl = $(this).attr('time-control');
			}
		})
		var params = {
			src: '/efacecloud/page/library/passengersFaceList.html?page=subPage&cameraName='+cameraName+'&BEGIN_TIME='+$('#beginTime').val()+'&END_TIME='+$('#endTime').val()+'&timeControl='+timeControl,
			title: $this.find(".h-name").attr("title"),
			width: $(top.window).width()*.95,
			height: $(top.window).height()*.9,
			callback: function(){

			}
		}
		UI.util.openCommonWindow(params);
	})

	//选取收藏图片进行路人检索
	$("#fastImgBtn").click(function(){
		var params = {
				src: '/efacecloud/page/library/personalLibraryList.html?isChosePic=true',
				title: '选取收藏图片检索',
				width: $(top.window).width()*.95,
				height: $(top.window).height()*.9,
				callback: function(data){
					$("#filterImg").attr("src",data);
				}
		}
		UI.util.openCommonWindow(params);
	});


	//批量导入按钮
    $("#batchImportBtn").click(function(){
    	UI.util.showCommonWindow("/efacecloud/page/library/importPersonalLibrary.html?libType=passengersFaceLib", "批量导入旅客人脸档案", 802, 400,function(data){
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
	
	
	//输入框的搜索按钮
	$('#inputSearch').click(function(){
		doSearch();
	})
	$('.search-input').keydown(function(e){
		if(e.keyCode==13){
			doSearch();
		}
	})

	
	//点击进入详细页面
	$('.library-info').on('click','.similar-name a,.btn-more',function(event){
		var personId = $(this).closest('.list-node-wrap').attr('personid');
		var sourceId = $(this).closest('.list-node-wrap').attr('sourceId');
		if(sourceId=='1') {
            UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/passengersFaceDetailGAT.html?personId='+personId+'&sourceId='+sourceId);
        } else if (sourceId=="2") {
            UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/passengersFaceDetailDomestic.html?personId='+personId+'&sourceId='+sourceId);
        } else if (sourceId=='3') {
            UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/library/passengersFaceDetail.html?personId='+personId+'&sourceId='+sourceId);
        }

	});

    //列表项的搜索按钮
    $('body').on('click','.btn-search',function(){
        $('#filterImg')[0].src = $(this).closest('.list-node').find('img')[0].src;
        // global.fileid = getFileid($('#filterImg')[0].src,true);
        if($(".arithmetic-tools.on").length==0){ //如果没有选中的算法，默认选择第一种；
            $(".arithmetic-tools:eq(0) i").trigger('click');
        }
        $('.bottom-pic-bar').removeClass('hide');
        doSearch();
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

	/*
	* xlg 2018-06-13
	* 身份核查、轨迹分析、收藏
	*/ 
	//轨迹分析
	$("body").on("click",".trajectory-search",function(){
		openWindowPopup('track',$(this).attr("url"));
		/*UI.util.showCommonWindow("/portal/page/tacticsFrame.html?pageUrl=/efacecloud/page/technicalStation/trackFaceForm.html?imgUrl=" + $(this).attr("url"), "轨迹预判", 
				$(top.window).width()*.95, $(top.window).height()*.9, function(obj){
		});*/
		//top.animateLeftFrameIn("/efacecloud/page/technicalStation/trackFaceForm.html?imgUrl=" + $(this).attr("url")+'&backPageType=faceCaptureList');
	});
	
    //身份核查
    $("body").on("click",".verification-search",function(){
    	openWindowPopup('identity',$(this).attr("url"));
    });
	//收藏
	$("body").on("click",".collectionBtn",function(){
		var ref = $(this).attr("ref");
		UI.util.showCommonWindow(ref, "收藏文件夹", 
				600, 450, function(obj){
		});
	});

}

//旅客人脸库导入成功回调
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
	if($("#cameraSearchBtn").hasClass("active")||$("#zeroSearchBtn").hasClass("active")){
		cameraAdminSearch();
		return;
	}
	if (UI.util.validateForm($('#thresholdValidate'))) {
	
		queryParams.pageNo = 1; 
		queryParams.pageSize = 30;
	    queryParams.BEGIN_TIME = $('#beginTime').val();
	    queryParams.END_TIME = $('#endTime').val();
	    queryParams.SEX = $('#SEX').attr('sex');
	    queryParams.SOURCE = $('#certificate').attr('certificate');
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

		if($('#filterImg')[0].src.slice(-12)!="noPhoto2.png"){
                queryParams.IMG = $("#filterImg").attr("src");
                queryParams.id = 'dispatchedApprovalList';
                if(datedifference(beginTime,endTime) >30){
                	UI.util.alert("时间查询不能超过30天", "warn");
                	return ;
                }
                UI.util.showLoadingPanel()
                UI.control.remoteCall('face/traveler/query',queryParams,function (resp) {
                	if(resp.dispatchedApprovalList.CODE == 0){
                		var list = resp.dispatchedApprovalList.LIST;
                		$("#ALGTemplateDiv").html(tmpl('ALGfaceTemplate',list));
						$("#dataList").addClass('hide');
						$("#pageWrap").addClass('hide');
						if(resp.dispatchedApprovalList.LIST.length==0){
							UI.util.alert('查询结果为空', "warn");
						}
                	}else{
                		UI.util.alert(resp.MESSAGE, "warn");
                	}
                    UI.util.hideLoadingPanel();
                },function(){
                    UI.util.hideLoadingPanel();
                },{},true);
            }else{
            // queryParams.FILE_ID = "";
            queryParams.IMG = "";

            $("#dataList").removeClass('hide');
            $("#pageWrap").removeClass('hide');
            $("#ALGTemplateDiv").empty();

			UI.control.getControlById("dispatchedApprovalList").reloadData('face/traveler/query',queryParams);
			queryStatus = "1";
		}
	}
}

function getSearchTime(dateTime){
	queryParams.beginTime = dateTime.bT;
	queryParams.endTime = dateTime.eT;
}



//两个时间相差天数 兼容firefox chrome
function datedifference(sDate1, sDate2) {    //sDate1和sDate2是2006-12-18格式  
    var dateSpan,
        tempDate,
        iDays;
    sDate1 = Date.parse(sDate1);
    sDate2 = Date.parse(sDate2);
    dateSpan = sDate2 - sDate1;
    dateSpan = Math.abs(dateSpan);
    iDays = Math.ceil(dateSpan / (24 * 3600 * 1000));
    return iDays
};


function cameraAdminSearch() {
	var serverUrl = "face/traveler/statistics";
	var cameraAdminParams = {
			BEGIN_TIME: $('#beginTime').val(),
			END_TIME: $('#endTime').val(),
			HOTEL_NAME: $(".search-input").val(),
			ZERO_CAPTURE:""
	};


	UI.util.showLoadingPanel()
	UI.control.remoteCall(serverUrl, cameraAdminParams, function(resp){
		UI.util.hideLoadingPanel();
		$("#cameraResult").html(tmpl("cameraTmpl", resp.STATISTICS_RESULT));	
	}, function(){
		UI.util.hideLoadingPanel();
	},{async:true});

}
