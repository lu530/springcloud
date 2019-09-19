$(function(){
	UI.control.init();
	selectedTag();
	initEvent();
});

function initEvent(){
	//收藏夹查询
	$("#fileType .tag-item").click(function(){
		var val = $(this).attr("val");
		UI.util.showLoadingPanel();
		UI.control.getControlById("favoriteList").reloadData(null,{FAVORITE_TYPE:val});
		UI.util.hideLoadingPanel();
	});
	
	//点击文件夹查看详情
	$("body").on("click",".collectionListBtn",function(){
		var url = $(this).attr("ref");
		UI.util.showCommonIframe('.frame-form-full',url);
	});
	
	//详情按钮
	$("body").on("click",".detailBtn",function(){
		var url = $(this).attr("ref");
		UI.util.showCommonIframe('.frame-form-full',url);
	});
	
	//删除按钮
	$("body").on("click",".deleteBtn",function(){
		var $this = $(this);
		var favoriteId = $this.attr("favoriteId");
		var params = {FAVORITE_ID:favoriteId};
		doDelFavorite(params);
	});
	
	//删除文件夹(多个）
	$('#deleteCheckBtn').click(function (){
		var params={};
		
		var selectData = UI.control.getControlById('favoriteList').getListviewCheckData();
		if(selectData.length <= 0){
			UI.util.alert("请选择至少一个收藏夹", "warn");
			return;
		}
		var libids = [];
		for(var i=0;i<selectData.length; i++){
			libids.push(selectData[i].FAVORITE_ID);
		}
		params.FAVORITE_ID = libids.join(',');
		if(!params.FAVORITE_ID){
			UI.util.alert("请选择至少一个收藏夹", "warn");
			return;
		}
		doDelFavorite(params);
		
	});
	
	//新增按钮
	$('#addBtn').click(function () {
        var opts = {
            title :'我的收藏夹',
            renderHtml:'<dl>'+
    					'<dd class="form-inline mb10">'+
						'<label class="control-label w20 tr">名称：</label>'+
						'<input class="form-control ml5 w70" name="FAVORITE_NAME" id="FAVORITE_NAME" type="text" ui-vtext="库名称" ui-validate="required" placeholder="请输入收藏夹名称" maxlength="50">'+
					'</dd>'+
					'<dd class="form-inline">'+
						'<label class="control-label w20 tr">类型：</label>'+
						'<label class="radio-inline ml5 pl0"><input type="radio" name="FAVORITE_TYPE" value="1" checked="checked"><span>路人人脸收藏夹</span></label>'+
						'<label class="radio-inline ml45"><input type="radio" name="FAVORITE_TYPE" value="2"><span>人脸资源收藏夹</span></label>'+
						'<label class="radio-inline ml45"><input type="radio" name="FAVORITE_TYPE" value="3"><span>汽车驾驶人员收藏夹</span></label>'+
						'<label class="radio-inline ml45"><input type="radio" name="FAVORITE_TYPE" value="4"><span>非汽车驾驶人员收藏夹</span></label>'+
					'</dd>'+
				'</dl>',
            okcallback : function(data){
            	UI.util.showLoadingPanel();
            	var queryParams = data;
            		queryParams.LEVEL=1,
            		queryParams.PARENT_ID='';
            	UI.control.remoteCall('face/favorite/add', queryParams, function(resp){
            		if(resp.CODE == 0){
            			UI.util.alert(resp.MESSAGE);
            			UI.control.getControlById("favoriteList").reloadData(null,null);
            		}else{
            			UI.util.alert(resp.MESSAGE,'error');
            		}
            		UI.util.hideLoadingPanel();
            	});
            	return true;
            }
        }
        UI.util.prompt(opts);
    });
	
	//编辑按钮
    $('body').on("click",".editBtn",function () {
    	var $nodeTitel = $(this).parent().parent().find(".node-title span");
    	var text = $nodeTitel.html();
    	var favoriteId = $(this).attr("favoriteid");
    	var opts = {
    			title :'我的收藏夹',
                renderHtml: '<div class="form-group default">'+
				'<input class="form-control ml5" name="PROMPT_NAME" id="PROMPT_NAME" type="text" maxlength="100" ui-validate="required" value="'+text+'">'+
				'</div>',
		    	okcallback : function(data){
		    		UI.util.showLoadingPanel();
		    		var queryParams={
    						FAVORITE_ID:favoriteId,
    						FAVORITE_NAME:data.PROMPT_NAME
    				};
		        	UI.control.remoteCall('face/favorite/update', queryParams, function(resp){
		        		if(resp.CODE == 0){
		        			UI.util.alert(resp.MESSAGE);
		        			UI.control.getControlById("favoriteList").reloadData(null,null);
		        		}else{
		        			UI.util.alert(resp.MESSAGE,'error');
		        		}
		        		UI.util.hideLoadingPanel();
		        	});
		        	return true;
		        }
    	}
    	UI.util.prompt(opts);
    });
    
}

//删除收藏夹
function doDelFavorite(params){
	UI.util.confirm("确定删除选中的收藏夹?",function() {
		UI.util.showLoadingPanel();
		UI.control.remoteCall("face/favorite/delete",params,function(resp){
			if(resp.CODE==0){
				UI.util.alert(resp.MESSAGE);
				UI.control.getControlById("favoriteList").reloadData(null,null);
				UI.util.hideLoadingPanel();
			}else{
				UI.util.alert(resp.MESSAGE, "warn");
				UI.util.hideLoadingPanel();
			}
		}, function(){
			UI.util.hideLoadingPanel();
		} , 
		{async : true}, true);
	});
}

//空字符串或者null转变为“”
function renderNullToNotKnow(str) {
	if (str == null || str == "" || typeof(str) == "undefined" || str == "PLATE") {
		return "";
	} else {
		return str;
	}
}

function doSearch(){
	UI.control.getControlById("favoriteList").reloadData(null,null);
}