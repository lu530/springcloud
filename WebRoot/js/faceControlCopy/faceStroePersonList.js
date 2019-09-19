/**
 * @Author lzh
 * @version 2017-08-09
 * @description 布控库人员列表；
 */

//搜索参数初始化
var searchParams = {
    DB_ID:UI.util.getUrlParam("id"),
    KEYWORDS:"",
    SEX:""
};
$(function () {
    UI.control.init();
    initEvent();
    //选择性别
    reloadDate("#sex")
    //上传图片
    topUploadPic();

})

function initEvent() {

    
    //轨迹分析
    $("body").on("click",".trajectory-search",function(){
        openWindowPopup('track',$(this).attr("url"));
    });
    //身份核查
    $("body").on("click",".verification-search",function(){
        openWindowPopup('identity',$(this).attr("url"));
    });


    //搜索
    $("#searchBtn").click(function () {
    	 searchParams.KEYWORDS = $("#searchText").val();
    	 doSearch(searchParams);
    })
    
    $("#searchText").keyup(function (event) {
        var event = event || window.event;
        if(event.keyCode  == 13){
        	 searchParams.KEYWORDS = $("#searchText").val();
        	 doSearch(searchParams);
        }
    })

    //点击进入详细页面
    $('body').on('click','.edit-icon',function(event){
        var id = $(this).attr("person-id");
        UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/faceControlCopy/addFaceStoreForm.html?type=eidt&personid='+id+'&db_id='+searchParams.DB_ID);
    });

    //新增表单
    $("#addBtn").click(function(){
        UI.util.showCommonIframe('.frame-form-full','/efacecloud/page/faceControlCopy/addFaceStoreForm.html?db_id='+searchParams.DB_ID);
    });

    //批量导入
    $("#batchImportBtn").click(function(){
        UI.util.showCommonWindow("/efacecloud/page/library/importPersonalLibrary.html?libType=dispatchedLib&libID="+searchParams.DB_ID+"&copy=1", "批量导入", 802, 400,function(data){
        	uploadSuccess(data);
        });
    });


    //收藏
	$("body").on("click",".collectionBtn",function(){
		var ref = $(this).attr("ref");
		UI.util.showCommonWindow(ref, "收藏文件夹", 
				600, 450, function(obj){
		});
	});

    //批量人脸库删除
    $("#delBtn").click(function () {
        var nodeId = getCheckList();
        if(nodeId){
            UI.util.confirm("是否确定删除",function(){
                    ExtendRemoteCall('face/hw/dispatchedPerson/delete',{PERSON_ID:nodeId},function () {
                        UI.control.getControlById("dispatchedApprovalList").reloadData();
                        var arr = nodeId.split(',');
                        parent.valueAddOne(arr.length);
                    },"删除成功")
            },function(){
                return true;
            });
        }else {
            UI.util.alert("请先选择人脸！","warn");
            return;
        }
    });

    // 单独删除
    $('body').on('click','.deleteBtn',function () {
        var $this = $(this);
        var parent = $this.closest('.list-node-wrap');
        UI.util.confirm("是否删除",function(){
            var id = $this.attr('person-id');
            ExtendRemoteCall('face/hw/dispatchedPerson/delete',{PERSON_ID:id},function () {
                UI.control.getControlById("dispatchedApprovalList").reloadData();
                parent.valueAddOne('minus');
            },"删除成功")
        },function(){
            return true;
        });
    })

    //导出
    $("#export").click(function(){
    	var exportParams = {};
		// var url = UI.control.getRemoteCallUrl("face/dispatchedPerson/export");
		var url = UI.control.getRemoteCallUrl("face/hw/dispatchedPerson/export");
		var exportData = UI.control.getControlById('dispatchedApprovalList').getListviewCheckData();
		if (exportData.length > 0) {
			exportParams.EXPORT_DATA = JSON.stringify(exportData);
		} else {
			exportParams.KEYWORDS =  $("#searchText").val() || "";
			exportParams.SEX = $("#sex .active").attr("value") || "";
			exportParams.DB_ID = searchParams.DB_ID || "";
		}
		bigDataToDownload(url,"exportFrame",exportParams);
    });
}


//布控库批量导入成功回调
function uploadSuccess(data){
	
	if(data.CODE == 0){
		var fileID = data.ERROR_FILE_ID;
		var url = "face/hw/dispatchedPerson/exportErrorMsg?ERROR_FILE_ID=" + data.ERROR_FILE_ID ;
		importingData( data.SUCCESS_COUNT, data.FAIL_COUNT , url ,function(){
			doSearch();
		});
		
	}else if(data.CODE == 1){
		UI.util.alert(data.MESSAGE,'wran');
	}
	
}

//重新加载 #dispatchedApprovalList
function reloadDate(id) {
    $(id).on('click',".tag-item",function () {
        searchParams.SEX = $(this).attr("value");
        $(this).addClass('active').siblings().removeClass("active");
        doSearch(searchParams)
    })
}

/*
 * 搜索函数
 * @param {String} Params : 搜索参数对象
 */
function doSearch(Params){
    Params = Params || searchParams;
    UI.util.showLoadingPanel();
    Params.pageNo=1;
    Params.pageSize=18;
    UI.control.getControlById("dispatchedApprovalList").reloadData(null,Params);
    UI.util.hideLoadingPanel();
}

//检测搜索输入是否为空
function checkWord() {
    searchParams.KEYWORDS = $("#searchText").val();
    if(searchParams.KEYWORDS!==''){
        doSearch(searchParams);
    }else {
        UI.util.alert("请输入关键字","warn");
    }
}

//获取被选中的人脸
function getCheckList(){
    var checkList=[];
    $('.list-node-wrap.active').each(function (i,o) {
        checkList.push($(o).attr('person-id'))
    });
    return checkList.join(',');
}