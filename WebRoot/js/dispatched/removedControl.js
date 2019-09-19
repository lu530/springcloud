var searchParam = {
	StoreOwnerType: 2,
	FilterType: 4
};

$(function() {

	UI.control.init();
	initEvent();
	
});
function initEvent(){

	$('body').on('click','.reStationingBtn',function(){
		var PortraitID = $(this).attr("portraitid");
		var IDCard = $(this).attr("IDCard");
		var url = "person/control/reStationing";
		var param = { PortraitID : PortraitID };

		UI.control.remoteCall(url, param, function(resp){
			if (resp.status == true){
				UI.util.alert("续控成功");
				doSearch();
			} else {
				UI.util.alert("续控失败", "error");
			}
		});
	});
	
	$(".btn-close").click(function(){
		parent.hideForm('.frame-form-full');
	})
	
	$('body').on('click','[attrimg="zoom"]',function(){
		var $this = $(this);
		var src = $this.attr('src');
		top.showPictureZoom( src,true);
	});
	
	$("#keyWordSearch").click(function(){
		searchParam.KeyWords = $("#keyWord").val();
		doSearch();
	});
	
	$(window).keydown(function(event){
		switch(event.keyCode) {
			case 13:
				$("#keyWordSearch").trigger("click");
				break;
		}
	});
}

function doSearch(){
	UI.control.getControlById("dispatchedApprovalList").reloadData(null, searchParam);
}
