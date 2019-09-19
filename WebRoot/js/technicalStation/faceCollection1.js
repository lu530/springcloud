//当前上传图片集合
var picMap = new Map();
//图片对应的检索结果集
var listMap = new Map();
//图片对应的INFO_ID
var infoIdMap = new Map();
//集合开关，默认并集
var isAllResult = true;
//并集
var andSetArr = [];
//交集
var intersetArr = [];
//轨迹参数
var trackData = [];
//用于判断生成轨迹页面
var isShowTrack=1;
//记录选中的索引
var checkedIndexArr = [];
//查询参数
var queryParams={
	ALGO_LIST:'[{"ALGO_TYPE":"10003","THRESHOLD":"60"}]',
	pageSize:20,
    pageNo:1,
	THRESHOLD:60,
	DEVICE_IDS:"",
	KEYWORDS:"",
	PIC:"",
	BEGIN_TIME:UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").bT,//页面默认选中今天
	END_TIME:UI.util.getDateTime("today","yyyy-MM-dd HH:mm:ss").eT
};
//时间控件初始化
var timeOption = {
		'elem':$('#timeTagList'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'callback':getSearchTime
};
$(function() {
	UI.control.init();
	compatibleIndexOf();
	initEvent();
	initDateTimeControl(timeOption);
	topUploadPicFace();
	$(".face").mCustomScrollbar({horizontalScroll:true});
	initWaterMark();
	if (isRedList()) {
		showRedListTask({searchType:8,callback:backfillForm,elem:"#redListWrap"});
	}
});

function initEvent(){
	//返回菜单
    $('body').on('click','#backBtn',function(){
        parent.showMenu();
    });
    
	//通过卡口树加载设备
	$('#deviceNames').click(function(e){
		//回填数据
		checkDrowDownDeviceList({
			deviceNames:$('#deviceNames').html(),
			deviceId:$('#orgCode').val(),
			deviceIdInt:$('#orgCodeInt').val(),
			orgCode:$("#deviceNames").attr("orgcode")
		});
		
		UI.util.showCommonWindow('/connectplus/page/device/deviceList.html?deviceType=194', '设备选择', 1000, 600,function(resp){
			$('#deviceNames').html(resp.deviceName);
			$('#deviceNames').attr('title',resp.deviceName);
			$('#deviceNames').attr('orgcode',resp.orgCode);
			$('#orgCode').val(resp.deviceId);
			$('#orgCodeInt').val(resp.deviceIdInt);
			
			addDrowdownDeviceList({
				deviceId:resp.deviceId,
				deviceName:resp.deviceName,
				deviceNameList:$("#deviceNameList"),
				dropdownListText:$(".dropdown-list-text")
			});
		});
		e.stopPropagation();
	});
	
	//删除已选设备
	$("body").on("click",".removeDeviceBtn",function(e){
		var $this = $(this);
		var deviceId = $this.attr("deviceid");
		var deviceIdArr = $('#orgCode').val().split(",");
		var deviceIdIntArr = $('#orgCodeInt').val().split(",");
		var deviceNameArr = $('#deviceNames').html().split(",");
		var index = deviceIdArr.indexOf(deviceId),
			orgCode = $("#deviceNames").attr("orgcode"),
			orgCodeArr = orgCode.split(",");
		
		$this.parents("li").remove();
		deviceIdArr.splice(index,1);
		deviceIdIntArr.splice(index,1);
		deviceNameArr.splice(index,1);
		orgCodeArr.splice(index,1);
		$('#orgCode').val(deviceIdArr.join(","));
		$('#orgCodeInt').val(deviceIdIntArr.join(","));
		$('#deviceNames').html(deviceNameArr.join(","));
		$('#deviceNames').attr("title",deviceNameArr.join(","));
		$('#deviceNames').attr("orgcode",orgCodeArr.join(","));
		if($("#deviceNameList li").length == 0){
			$(".dropdown-list-text").attr("data-toggle","");
			$(".dropdown-list-text .dropdown").addClass("hide");
			$(".dropdown-list").removeClass("open");
		}
		
		e.stopPropagation();
	});
	
	//点击进入卡口选择地图
	$('#locate').click(function(){
		UI.util.showCommonWindow('/connectplus/page/device/deviceMap.html?deviceType=194', '感知设备', 1000, 600,function(resp){
			$('#deviceNames').html(resp.deviceName);
			$('#deviceNames').attr('title',resp.deviceName);
			$('#deviceNames').attr('orgcode',resp.orgCode);
			$('#orgCode').val(resp.deviceId);
			$('#orgCodeInt').val(resp.deviceIdInt);
			
			addDrowdownDeviceList({
				deviceId:resp.deviceId,
				deviceName:resp.deviceName,
				deviceNameList:$("#deviceNameList"),
				dropdownListText:$(".dropdown-list-text")
			});
		});
	});
	
	//移除集合的当前图片
	$("body").on("click",".removeFaceBtn",function(){
		var $this = $(this),
			$parent = $this.parent(),
			curUuid = $parent.attr("uuid"),
			picVal = picMap.get(curUuid),
			isRemove = picMap.remove(curUuid);
		
		if(isRemove){
			var listMapVal = listMap.get(curUuid),
				isListRemove = listMap.remove(curUuid),
				infoIdVal = infoIdMap.get(curUuid),
				isInfoRemove = infoIdMap.remove(curUuid);
			if(isListRemove && isInfoRemove){
				//展示结果集
				$this.parent().remove();
				toggleImg();
				showResultList();
				searchData();
			}else{
				if(listMapVal && infoIdVal){
					picMap.put(curUuid,picVal);
					listMap.put(curUuid,listMapVal);
					infoIdMap.put(curUuid,infoIdVal);
					searchData();
				}else{
					$this.parent().remove();
					toggleImg();
				}
			}
		}
	});
	
	//确认检索按钮
	$('#confirmSearch').click(function(){
		doSearch();
		$("#checkAll").prop("checked",false);
		$("#exportPersonalBtn").addClass("disabled");
	});
	
	//并集
	$("#andSet").click(function(){
		if($(this).hasClass("disabled")){
			return false;
		}
		$(this).addClass("active").siblings().removeClass("active");
		$("#checkAll").prop("checked",false);
		if(andSetArr.length == 0){
			$('.tilelist').html("<div class='nodata'></div>")
		}else{
			$('.tilelist').html(tmpl("faceListTmpl", andSetArr));
		}
	});
	
	//交集
	$("#intersection").click(function(){
		if($(this).hasClass("disabled")){
			return false;
		}
		$(this).addClass("active").siblings().removeClass("active");
		$("#checkAll").prop("checked",false);
		if(intersetArr.length == 0){
			$('.tilelist').html("<div class='nodata'></div>")
		}else{
			$('.tilelist').html(tmpl("faceListTmpl", intersetArr));
		}
	});
	
	//集合新增时CheckBox事件
	$("body").on('click','.list-node-wrap-face',function(event){
		var $this = $(this),
			$checkbox = $this.find(".checkbox-opacity"),
			curIndex = $this.attr("index");
        if($checkbox.prop("checked")){
        	$checkbox.prop("checked",false)
        	$this.removeClass("active");
        	var removeIndex = checkedIndexArr.indexOf(curIndex);
        	checkedIndexArr.splice(removeIndex, 1);
        } else {
        	$checkbox.prop("checked",true)
        	$this.addClass("active");
        	checkedIndexArr.push(curIndex);
        }
        event.stopPropagation();
    });
	
	$("body").on("click",".list-node-wrap",function(){
		var len = $(".list-node-wrap.active").length;
		if(len == 0){
			$("#exportPersonalBtn").addClass("disabled");
		}else{
			$("#exportPersonalBtn").removeClass("disabled");
		}
	});
	
	//全选
	$('body').on('click','#checkAll',function(){
		var $this = $(this),
			$listNodeFace = $this.parents(".pager-content").find(".tilelist .list-node-face"),
			$listNodeWrapFace = $this.parents(".pager-content").find(".tilelist .list-node-wrap-face"),
			$checkbox = $this.parents(".pager-content").find(".list-node-face .node-text input"),
			$listNode = $this.parents(".pager-content").find(".tilelist .list-node-wrap"),
			$nodeInput = $this.parents(".pager-content").find(".list-node .node-text input");
        if($this.is(":checked")){
            if(!$listNodeFace) {
            	$listNodeWrapFace.addClass("active");
            	$checkbox.attr("checked",true);
            }else {
            	$listNode.addClass("active");
                $nodeInput.attr("checked",true);
            }
            $("#exportPersonalBtn").removeClass("disabled");
        }
        else {
            if(!$listNodeFace) {
            	$listNodeWrapFace.removeClass("active");
            	$checkbox.attr("checked", false);
            } else {
            	$listNode.removeClass("active");
            	$nodeInput.attr("checked",false);
            }
            $("#exportPersonalBtn").addClass("disabled");
        }
    });
	
	//导出
	$('#exportPersonalBtn').click(function(){
		if($(this).hasClass("disabled")){
			return false;
		}
		var exportParams = {};
		var url = UI.control.getRemoteCallUrl("face/capture/exportFace");
		var exportData = "";
		if ($('.photo-scroll li').length == 0) {
			exportData = UI.control.getControlById('faceCollectionList').getListviewCheckData();
			if (exportData.length <= 0) {
				UI.util.alert("请勾选导出的数据","warn");
				return;
			}
			exportParams.SEARCH_IMG_URL = $('#filterImg')[0].src;
			exportParams.EXPORT_DATA = JSON.stringify(exportData);
		} else {
			//exportData = UI.control.getControlById('faceCollectionList').getListviewCheckData();
			//记录选中数据
			var checkedDataArr = [],
				isCheckedAll = $("#checkAll").prop("checked");
			if($("#intersection").hasClass("active")){
				if(isCheckedAll){
					checkedDataArr = intersetArr;
				}else{
					$.each(checkedIndexArr,function(i,n){
						checkedDataArr.push(intersetArr[n]);
					});
				}
				exportData = checkedDataArr;
			}else {
				if(isCheckedAll){
					checkedDataArr = andSetArr;
				}else{
					$.each(checkedIndexArr,function(i,n){
						checkedDataArr.push(andSetArr[n]);
					});
				}
				exportData = checkedDataArr;
			}
			if (exportData.length > 0) {
				exportParams.EXPORT_DATA = JSON.stringify(exportData);
			} else {
				exportParams.DEVICE_IDS = $("#orgCode").val();    
				exportParams.THRESHOLD = $('#threshold').val();   
				exportParams.KEYWORDS = $("#searchText").val() || "";
				exportParams.BEGIN_TIME = $('#beginTime').val() || "";
				exportParams.END_TIME = $('#endTime').val() || "";
			}
		}
		bigDataToDownload(url,"exportFrame",exportParams);
	});
	
	//身份核查
    $("body").on("click",".verification-search",function(){
        openWindowPopup('identity',$(this).attr("url"));
    });
    
    //列表中的搜索链接
	$("body").on("click",".search-btn",function(event){
		var url = $(this).attr("fileurl");
		addImg(url);
		doSearch();
		event.stopPropagation();
	});
	
	//轨迹分析
	$("body").on("click",".trajectory-search",function(){
		var url = $(this).attr("url");
		openWindowPopup('track',url);
	});
	
	$('#trajectoryGeneBtn').click(function(){
        if(getFaceTrackInfoList()){
        	trackData.sort(
                function(a,b){
                    return a.TIME - b.TIME;
                }
            );
        	
        	var pageUrl = '/efacecloud/page/technicalStation/tacticsFrame.html?pageType=trackResult&getDataType=trackResult';
			UI.util.showCommonIframe('.frame-form-full',pageUrl);
        }
    });
}

function getFaceTrackInfoList(){

    var inputCheck = $('.list-node-wrap.active');

    if (inputCheck.length < 2) {
        UI.util.alert('生成轨迹至少勾选两条记录！', 'warn');
        return false;
    }
    trackData = [];
    for (var i = 0; i < inputCheck.length; i++) {
        var obj = {};
        obj.ORIGINAL_DEVICE_ID = $(inputCheck[i]).attr("device_id");
        obj.DEVICE_NAME = $(inputCheck[i]).attr("device_name");
        obj.OBJ_PIC = $(inputCheck[i]).attr("obj_pic");
        obj.PIC = $(inputCheck[i]).attr("pic");
        obj.X = $(inputCheck[i]).attr("x");
        obj.Y = $(inputCheck[i]).attr("y");

        obj.jgsj = $(inputCheck[i]).attr("jgsk");
        obj.TIME = standardTimeToStamp(obj.jgsj); //地图使用,毫秒时间戳
        trackData.push(obj);

    }

    return true;
}

//表单回填
function backfillForm(data){
	//清空图片
	picMap.clear();
	listMap.clear();
	infoIdMap.clear();
	$(".photo-scroll").empty();
	$('[time-control="zdy"]').click();
	
	var params = JSON.parse(data);
	$("#orgCode").val(params.DEVICE_IDS);
	$("#orgCodeInt").val(params.DEVICE_IDS_INT);
	$("#deviceNames").html(params.deviceName);
	$('#threshold').val(params.THRESHOLD);
	
	$('#beginTime').val(params.BEGIN_TIME);
	$('#endTime').val(params.END_TIME);
	
	var curImg = params.PIC.split(",");
	var curImgUuid = params.IMGUUID.split(",");
	
	$.each(curImg,function(i,n){
		addImg(n,curImgUuid[i]);
	});
	
	searchData();
}

function doSearch(){
	if(UI.util.validateForm($('.filter-view'))){

		queryParams.DEVICE_IDS = $("#orgCode").val();
		queryParams.DEVICE_IDS_INT = $("#orgCodeInt").val();
		queryParams.THRESHOLD = $("#threshold").val();
		
		//检索案件录入
		if(isRedList()){
			var searchParams = queryParams,
				imgArr = picMap.values(),
				imgUuidArr = picMap.keys();
			searchParams.searchType = 8;
			searchParams.PIC = imgArr.join(",");
			searchParams.IMGUUID = imgUuidArr.join(",");
			searchParams.deviceName = $("#deviceNames").html();
			searchBeforeLogged(searchData,searchParams);
		}else{
			searchData();
		}
			
	}
}

function searchData(){
	var curLiLen = $(".photo-scroll >li").length;
	if(curLiLen>0){
		$(".page-data").addClass("hide");
		if(curLiLen>1){
			$("#andSet,#intersection").removeClass("disabled");
		}
		var imgArr = picMap.values(),
		imgUuidArr = picMap.keys(),
		obj = {
			imgArr:imgArr,
			imgUuidArr:imgUuidArr,
			index:0,
			len:imgArr.length
		}
		
		picSearch(obj)
	}else{
		queryParams.PIC = "";
		UI.control.getControlById("faceCollectionList").reloadData(null,queryParams);
	}
}

//通过图片检索返回当前结果集
function picSearch(obj){
	UI.util.showLoadingPanel();
	
	queryParams.PIC = obj.imgArr[obj.index];
	
	var curKey = obj.imgUuidArr[obj.index],
		hasResult = listMap.containsKey(curKey);
	
	if(!hasResult){
		queryParams.id="faceCollectionList";

		var curParams = JSON.parse(queryParams.ALGO_LIST);
		curParams[0].THRESHOLD = queryParams.THRESHOLD;
		queryParams.ALGO_LIST = JSON.stringify(curParams);
		
		UI.control.remoteCall("face/capture/query", queryParams, function (resp){
			if(resp.faceCollectionList.LIST.length>0){
				var data = resp.faceCollectionList.LIST[0].ALGORITHM_LIST;
			}else{
				var data = [];
			}
			
			var curInfoIdArr = [];
			//记录infoId
			$.each(data,function(j,con){
				var infoId = con.INFO_ID;
				var index = curInfoIdArr.indexOf(infoId);
				if(index < 0){
					curInfoIdArr.push(infoId);
				}
			});
			infoIdMap.put(curKey,JSON.stringify(curInfoIdArr));
			listMap.put(curKey, JSON.stringify(data));
			
			obj.index = obj.index+1;
			
			if(obj.index < obj.len){
				picSearch(obj);
			}else{
				//展示结果集
				showResultList();
				
				listMap.remove(curKey),
				infoIdMap.remove(curKey);
				
				UI.util.hideLoadingPanel();
			}
			
		},function(data, status, e) {
			UI.util.hideLoadingPanel();
		}, {
			async : true
		});
	}else{
		obj.index = obj.index+1;
		
		if(obj.index < obj.len){
			picSearch(obj);
		}else{
			showResultList();
			UI.util.hideLoadingPanel();
		}
	}
}

//分数排序
function sortNumber(a, b){
    return b.SCORE-a.SCORE;
}

//展示结果
function showResultList(){
	var resultListArr = [],
		keysArr = listMap.keys();
	
	$.each(keysArr,function(i,n){
		var curValArr = JSON.parse(listMap.get(n));
		resultListArr = resultListArr.concat(curValArr);
	});
	
	resultListArr.sort(sortNumber);
	
	var curLiLen = $(".photo-scroll >li").length;
	if(curLiLen == 1){
		if(resultListArr.length == 0){
			$('.tilelist').html("<div class='nodata'></div>")
		}else{
			$('.tilelist').html(tmpl("faceListTmpl", resultListArr));
		}
		$("#andSet,#intersection").removeClass("active").addClass("disabled");
		andSetArr = resultListArr;
	}else{
		//并集去重
		var curResultMap = new Map();
		$.each(resultListArr,function(i,n){
			var infoId = n.INFO_ID;
			var isHasInfoId = curResultMap.containsKey(infoId);
			if(!isHasInfoId){
				curResultMap.put(infoId, n);
			}else{
				var curInfoVal = curResultMap.get(infoId);
				if(curInfoVal.SCORE<n.SCORE){
					curResultMap.remove(infoId);
					curResultMap.put(infoId, n);
				}
			}
		});
		andSetArr = curResultMap.values();
		
		//交集
		var infoKeysArr = infoIdMap.keys(),
		infoArr = [],
		resultArr = [];
		
		$.each(infoKeysArr,function(i,n){
			infoArr[i] = JSON.parse(infoIdMap.get(n));
		});
		
		for(var i = 0;i<infoArr.length;i++){
			if(i == 0){
				resultArr = intersectArr(infoArr[i],infoArr[i+1]);
			}else{
				if(i+1 <= infoArr.length-1){
					resultArr = intersectArr(resultArr,infoArr[i+1]);
				}
			}
		}
		
		var curIntersetArr = [],curInfoId=[];
		$.each(resultListArr,function(i,n){
			var curIndex = resultArr.indexOf(n.INFO_ID);
			if(curIndex>=0){
				var index = curInfoId.indexOf(n.INFO_ID);
				if(index<0){
					curIntersetArr.push(n);
					curInfoId.push(n.INFO_ID);
				}else if(curIntersetArr[index].SCORE<n.SCORE){
					curIntersetArr.splice(index, 1, n);
				}
			}
		});
		
		intersetArr = curIntersetArr;
		$("#andSet").click();
	}
	
}

//获取交集
function intersectArr(prevArr,arr){
	var result = new Array(),
		prevArrLen = prevArr.length,
		arrLen = arr.length,
		minArr = [],
		maxArr = [];
	
	if(prevArrLen<=arrLen){
		minArr = prevArr;
		maxArr = arr;
	}else{
		minArr = arr;
		maxArr = prevArr;
	}
	for(var i=0;i<minArr.length;i++){
		var index = maxArr.indexOf(minArr[i]);
		if(index >= 0){
			result.push(minArr[i]);
		}
	}
	return result;
}

//头部图片上传组件
function topUploadPicFace() {
    //上传图片
    $("body").on('change','.searchImgButton',function(){
    	var $this = $(this),
    		upImgId = $this.attr('id'),
    		val = $this.val();
    	if(val == ''){
    		return false;
    	}
        ajaxFileUpload(upImgId,picSuccFunction1);
    });
}

/**
 * 图片上传成功的回调处理
 * @param {object} data : 图片上传成功返回对象
 * @param {String} status : 图片上传状态
 * @author：lwb
 */
function picSuccFunction1(data, status) {
    var fileElementId =  this.fileElementId;
    data = eval("(" + data + ")");
    var fastDfs = null;
    var server = "", port = "", url = "";

    if (data && !data.error) {

        if(data.fastDfsParam){
            fastDfs = data.fastDfsParam;
            server = fastDfs.server;
            port = fastDfs.port;
            url = "http://";
        }
        var fileId = data.id;
        url += server+":"+port+"/"+fileId;

        if (data.fastDfsParam && data.fastDfsParam.fullUrl) {
            url = data.fastDfsParam.fullUrl;
        }
        
        $(fileElementId).val('');

        addImg(url);

        //doSearch(1)
        UI.util.alert("上传成功！请点击按钮进行检索查询");
        UI.util.hideLoadingPanel();
        return true;
    } else {
        UI.util.alert("上传失败！",'warn');
    }

    UI.util.hideLoadingPanel();
    return false;
}

//增加图片
function addImg(url,uuid){
	//显示阈值
    $('.bottom-pic-bar').removeClass('hide');
    
    if(!uuid){
    	uuid=UI.util.guid();
    }

    if(($(".photo-scroll >li").length>9)) {
        UI.util.alert("搜索图片不能大于10张图片！", "warn");
        UI.util.hideLoadingPanel();
        return;
    }
    
    $(".face").removeClass("hide");
    //加入图片
    var appendHtml = '<li rltz="" imgurl="'+url+'" uuid="'+uuid+'"><img src="'+url+'" ><span class="close-btn removeFaceBtn">×</span></li>';
    $(".photo-scroll").append(appendHtml);
    
    //记录图片
    picMap.put(uuid, url);
    
    //显示上传图片集合
    toggleImg();
}

//显示上传图片集合
function toggleImg(){
	//设置图片集合长度
    var curLiWidth = $(".photo-scroll >li").eq(0).width();
    var curLiLen = $(".photo-scroll >li").length;
    var allLiWidth = curLiWidth*curLiLen+5;//+5图片右边距+20距离条件右边距
    
    if(curLiLen == 0){
    	$(".data-wrap").removeClass("has-data");
    	$(".face").addClass("hide");
    	$("#andSet,#intersection").addClass("disabled");
    	return false;
    }
    if(curLiLen >0){
    	$(".data-wrap").addClass("has-data");
    }
    
    //最多显示图片数量
    var parentWidth = $(".data-wrap").width();
    var photoToolsWidth = $(".photo-tools").width();
    var otherWidth = parentWidth - photoToolsWidth -(30+30+30+30);//两个包裹层30padding
    var allLen = Math.round(otherWidth/curLiWidth);
    if(curLiLen < allLen-2){
    	$(".face").width(allLiWidth);
    }else{
    	$(".face").width(otherWidth);
    }
    $(".photo-scroll").width(curLiWidth*curLiLen);
}

//时间控件回调
function getSearchTime(dateTime){
	queryParams.BEGIN_TIME = dateTime.bT;
	queryParams.END_TIME = dateTime.eT;
}