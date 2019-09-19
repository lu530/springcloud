
var importLibId = UI.util.getUrlParam("IMPORT_LIB_ID");
var libSize = UI.util.getUrlParam("LIBRARY_SIZE") || 0;//最大数目

var queryParams={pageSize:25, LIBRARY_SIZE: libSize, IMPORT_LIB_ID: importLibId }; 
$(function(){
	UI.control.init();
	initEvent();
	doSearch();
});

function initEvent(){
	
	$("body").on("click",".library-list .file-node",function(){
		var $this = $(this);
		$this.addClass("active").siblings().removeClass("active");
	});
	
	$("#confirmBtn").click(function(){
		var libName = $('.file-node.active').find('.filename').html();
		var libId = $('.file-node.active').find('.fileid').html();
		var obj = {};
		obj.libName = libName;
		obj.libId = libId;
		if(!libId || !libName){
			UI.util.alert("请选择一个库！", "warn");
			return;
		}
		UI.util.showLoadingPanel();
		parent.UI.util.returnCommonWindow(obj);
        parent.UI.util.closeCommonWindow();
    });
	
	$("#cancelBtn").click(function(){
        parent.UI.util.closeCommonWindow();
    });
	
	$("body").on("click","#filePlus", function() {
		//新建个人库
		UI.util.showCommonWindow("/efacecloud/page/personal/addPersonalLibrary.html", "新建个人库", 600, 250,function(data){
			setTimeout(function(){
				doSearch();
			},1000);
		});
		//addFoleder();
	});
}
function doSearch(){
	UI.control.remoteCall("efacecloud/mine/libinfo/getMineLibList",queryParams, function(reply){
		if(reply && reply.data){
			var plus = '<div class="file-node plus-wrap">\
				 <div class="file-plus" id="filePlus">\
					<i class="icon-plus2"></i>\
				</div>\
			   </div>';
			$(".library-list").html(tmpl("exportTemplate", reply.data)).append(plus);
		}
	});
}
function addFoleder() {
	var item = '<div class="file-node">\
					<div class="fileicon person">\
						<span type="checkbox" class="checkbox"></span>\
					</div>\
					<div class="file-name">\
						<input class="filename" value="新建个人库" />\
					</div>\
				</div>'
	$("#filePlus").parent(".file-node").before(item);
}