/**
 * @Author lzh
 * @version 2017-08-09
 * @description 人脸专题库左侧页；
 */
var queryParams = {};
var logParam = {};
var pageType = UI.util.getUrlParam('type');

$(function () {
    sequence('.list-node',UI.control.init);
    initEvent();
    //initFrame();
    searchStore();
	initWaterMark();
});

function initEvent(){

    //如果是专题库检索页面，就把批量导入几个按钮删掉；
	if(pageType=="subPage"){
		$(".frame-title").html('人员专题库检索');
		$(".edit-bar, #createdStore").hide();
		$(".menu-search-box").css("width",'370');
	}

	
	
    $('body').on('click','.list-node',function (ev) {
        var event=(ev)?ev:window.event;
        var target= event.target;
        var id =target.className=='list-node'? $(this).attr('task_id'):$(this).closest('.list-node').attr('task_id');
        if($(target).hasClass('del-btn')){
            UI.util.confirm("是否删除",function(){
                //删除库
                ExtendRemoteCall("face/special/delete",{DB_ID:id},function () {
                    UI.control.getControlById("dispatchedLibList").reloadData();
                    return true;
                },"删除成功");
            },function(){
                return true;
            });
        }else
        if($(target).hasClass('edit-btn')){
            var task_name = $(target).attr("task_name");
            editName(task_name,id);
            return;
        }else {
            initFrame(id);
        }
        event.stopPropagation();
    })


    //创建库
    $('#createdStore').click(function () {
        var opts = {
            title :'人脸专题库管理 ',
            renderHtml:"<input type='text' class='created-form' maxlength='50' name='creatStore' ui-validate='{pattern:\"required\",maxlength:50}' ui-vtext='专题库名称' placeholder='请输入专题库名称' style='width: 100%;margin-bottom: 15px;'>",
            okcallback:function(data){
            	if (UI.util.validateForm($('.created-form'))) {
	                 ExtendRemoteCall("face/special/add",{DB_NAME:data.creatStore,DB_ID:""},function () {
	                     sequence('.list-node',UI.control.getControlById("dispatchedLibList").reloadData(''))
	                 },"创建成功");
	                 return true;
            	}
            }
        }
        UI.util.prompt(opts);
    })
}

/*
 * 修改 自定义库名字
 * @param {str} name : 布控库要修改为的名字
 * @param {str} id : 布控库的id
 */
function editName(name,id) {
    var opts = {
        title :'修改库名 ',
        renderHtml:"<input type='text' class='created-form' maxlength='50' ui-validate='{pattern:\"required\",maxlength:50}' ui-vtext='专题库名称' name='libraryName' placeholder='请输入专题库名称' style='width: 100%' value='"+name+"'>",
        okcallback : function(data){
        	if (UI.util.validateForm($('.created-form'))) {
        		ExtendRemoteCall("face/special/add",{DB_NAME:data.libraryName,DB_ID:id},function () {
        			sequence('.list-node',UI.control.getControlById("dispatchedLibList").reloadData(''))
        		},"修改成功")
        		return true;
        	}
        }
    }
    UI.util.prompt(opts);
}


function initFrame(id){
	if (!id) {
		var records = UI.control.getDataById('dispatchedLibList').records;
		if (records.length > 0) {
			id = records[0].DB_ID;
		}
	}
	
    $('#mainFrameContent').attr('src','/efacecloud/page/library/faceTopicList.html?type='+pageType+"&DB_ID="+id);
}


//专题库检索
function searchStore() {
    $("#settingSearch").click(function () {
        get();
    })
    $("#orgName").keyup(function (event) {
        var event = event || window.event;
        if(event.keyCode  == 13){
            get();
        }
    })
    function get() {
        var keyWords = $("#orgName").val()||"" ;
        UI.control.getControlById("dispatchedLibList").reloadData('',{KEYWORDS:keyWords,pageNo:1,pageSize: 7});
    }
}


function doRefresh(){
	var dbId = $(".list-node.active").attr("task_id");
	
	UI.control.remoteCall("face/special/refresh",{DB_ID: dbId}, function(resp){
		var result = resp.result;
		$(".list-node.active").find(".personNum").html(result.PERSON_NUM);
		$(".list-node.active").find(".faceNum").html(result.FACE_NUM);
	})
}

