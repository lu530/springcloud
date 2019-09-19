
$(function() {

	UI.control.init();
	
	initTab();
	
	initFrame();
	
	
});

//左边栏 绑定点击事件
function initTab(){
	$("#menuTab li").click(function(){
		$(this).addClass('active').siblings().removeClass('active');
		var liHref=$(this).find('a').attr("url");
		$("#mainFrameContent").attr("src",liHref);
	});
}


function initFrame(){
	$('#mainFrameContent').attr('src','/efacecloud/page/dispatched/controlManage.html');
}


