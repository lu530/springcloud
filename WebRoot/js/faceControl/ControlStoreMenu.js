/**
 * @Author lzh
 * @version 2017-08-09
 * @description 布控左侧边栏；
 */

$(function() {
	UI.control.init();
	initTab();
	initFrame();
});

//左边栏绑定点击事件
function initTab(){
	$("#menuTab li").click(function(){
		$(this).addClass('active').siblings().removeClass('active');
		var liHref=$(this).find('a').attr("url");
		$("#mainFrameContent").attr("src",liHref);
	});
}

//初始化右边 内容
function initFrame(){
	$('#mainFrameContent').attr('src','/efacecloud/page/faceControl/faceStoreManage.html');
}