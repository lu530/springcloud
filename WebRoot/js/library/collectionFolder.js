var fileType = UI.util.getUrlParam("fileType")||"";
var queryParams={pageSize:100,FAVORITE_TYPE:fileType};

var birthday = UI.util.getUrlParam("birthday")||"";
var objPci = UI.util.getUrlParam("objPci")||"";
var jgsj = UI.util.getUrlParam("jgsj")||"";
var deviceId = UI.util.getUrlParam("deviceId")||"";
var deviceName = UI.util.getUrlParam("deviceName")||"";
var dispatchedDbId = UI.util.getUrlParam("dispatchedDbId")||"";
var dispatchedDbName = UI.util.getUrlParam("dispatchedDbName")||"";
var identityId = UI.util.getUrlParam("identityId")||"";
var identityType = UI.util.getUrlParam("identityType")||"-1";
var infoId = UI.util.getUrlParam("infoId")||"";
var name = UI.util.getUrlParam("name")||"";
var permanentAddrCode = UI.util.getUrlParam("permanentAddrCode")||"";
var personTag = UI.util.getUrlParam("personTag")||"";
var pic = UI.util.getUrlParam("pic")||"";
var presentAddrCode = UI.util.getUrlParam("presentAddrCode")||"";
var sex = UI.util.getUrlParam("sex")||"0";
var sourceDbId = UI.util.getUrlParam("sourceDbId")||"";
var sourceDbName = UI.util.getUrlParam("sourceDbName")||"";

$(function() {
	UI.control.init();
	initEvent();
	reload();
});

function initEvent() {
	$("body").on("click",".library-list .file-node",function(){
		var $this = $(this);
		$this.addClass("active").siblings().removeClass("active");
	});
	
	//确定按钮
	$("#confirmBtn").click(function(){
		var favoriteId = $('.file-node.active').find('.filename').attr('favoriteId');
		if(favoriteId == undefined){
			UI.util.alert("请选择收藏夹","warn");
			return;
		}
		var params = {};
		params.BIRTHDAY = birthday;
		params.CAPTURE_PIC = objPci;
		params.CAPTURE_TIME = jgsj;
		params.DEVICE_ID = deviceId;
		params.DEVICE_NAME = deviceName;
		params.DISPATCHED_DB_ID = dispatchedDbId;
		params.DISPATCHED_DB_NAME = dispatchedDbName;
		params.FAVORITE_ID = favoriteId;
		params.FILE_SOURCE = fileType;
		params.IDENTITY_ID = identityId;
		params.IDENTITY_TYPE = identityType;
		params.INFO_ID = infoId;
		params.NAME = name;
		params.PERMANENT_ADDRESS = permanentAddrCode;
		params.PERSON_TAG = personTag;
		params.PIC = pic;
		params.PRESENT_ADDRESS = presentAddrCode;
		params.SEX = sex;
		params.SOURCE_DB_ID = sourceDbId;
		params.SOURCE_DB_NAME = sourceDbName;
		
		//收藏文件
		var resp = addFavoriteFile(params);
		if (resp == '') {
			UI.util.alert("收藏失败", 'warn');
		} else {
			if (resp.CODE == 0) {
				UI.util.alert(resp.MESSAGE);
			} else {
				UI.util.alert(resp.MESSAGE, 'warn');
			}
			parent.UI.util.closeCommonWindow();
		}
    });
	
	//关闭窗口
	$("#cancelBtn").click(function(){
        parent.UI.util.closeCommonWindow();
    });
	
	//新增按钮
	$("body").on("click","#filePlus",function() {
		var opts = {
	            title :'我的收藏夹',
	            renderHtml:"<div class='form-group default collectionForm'>"+
				"<input class='form-control ml5' name='PROMPT_NAME' id='PROMPT_NAME' type='text' maxlength='50' ui-validate='{pattern:\"required\",maxlength:50}' placeholder='请输入收藏夹名称' ui-vtext='收藏夹名称'>"+
				"</div>",
	            okcallback : function(data){
	            	if (UI.util.validateForm($('.collectionForm'))) {
	            		var queryParams = {
		            			FAVORITE_NAME:data.PROMPT_NAME,
		            			FAVORITE_TYPE:fileType,
		            			LEVEL:1,
		            			PARENT_ID:''
		            	}
		            	UI.control.remoteCall('face/favorite/add', queryParams, function(resp){
		            		if(resp.CODE == 0){
		            			UI.util.alert(resp.MESSAGE);
		            			reload();
		            		}else{
		            			UI.util.alert(resp.MESSAGE,'error');
		            		}
		            	});
		            	return true;
	    			}
	            	
	            }
	        }
	        UI.util.prompt(opts);
	})
	
}

function addFoleder(name) {
	var item = '<div class="file-node">\
					<div class="fileicon dir-large">\
						<span type="checkbox" class="checkbox"></span>\
					</div>\
					<div class="file-name">\
						<input class="filename" value="'+name+'" disabled/>\
					</div>\
				</div>'
	$("#filePlus").parent(".file-node").before(item);
}

function renderFavoriteLogo(fileNum){
	if(fileNum>0){
		return "has";
	}
}

function reload(){
	UI.control.getControlById("folderList").reloadData(null,queryParams);
	$(".library-list div").first().removeClass("nodata");  /**处理页面暂无内容样式**/
	initAddButton();
}

function initAddButton(){
	var addButtonHtml = '<div class="file-node plus-wrap">\
				<div class="file-plus" id="filePlus">\
					<i class="icon-plus2"></i>\
				</div>\
			</div>';
	$(".library-list").last().append(addButtonHtml);
	
}

function add(name){
	var url = "efacecloud/favorite/add";
	var params = {};
	params.FAVORITE_NAME = name;
	params.PARENT_ID = "";
	params.LEVEL = 1;
	var flag = false;
	UI.control.remoteCall(url,params,function(resp){
			if(resp.status == true){
				UI.util.alert("新建收藏夹成功");
				addFoleder(name);
				UI.util.alert("新建成功");
				flag = true;
				reload();
			}else{
				UI.util.alert("新建失败","warn");
				flag = false;
			}
	
	});
	return flag;
}