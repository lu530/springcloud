var queryParam = {
	StoreOwnerType: 2,
	FilterType: 1  //待审核（与后台对应）
};

$(function() {
	
	UI.control.init();
	initEvent();
	
});
function initEvent(){
	
	$('body').on('click','.editBtn',function(){
		var PortraitID = $(this).attr('PortraitID');
		var StoreID = $(this).attr('StoreID');
		showForm('.frame-form-view','/efacecloud/page/dispatched/addPersonDispatched.html?pageType=approval'
				+'&PortraitID='+PortraitID+'&type=edit' + "&StoreID=" + StoreID + '&isLocal=2');
	});
	
	$('body').on('click','[attrimg="zoom"]',function(){
		var $this = $(this);
		var src = $this.attr('src');
		top.showPictureZoom( src,true);
	});	
	$("#xxSearch").on("click",function(){
		var keywords=$("#xxName").val();
		queryParam.KeyWords=keywords;
		doSearch();
	});
	
	$('#xxName').keypress(function(e){
		if(((e.keyCode || e.which) == 13)) {
			e.preventDefault();
			var keywords=$(this).val();
			queryParam.KeyWords=keywords;
			doSearch();
		}
	});
}

function doSearch(){
	UI.control.getControlById("dispatchedApprovalList").reloadData('', queryParam);
}


