/**
 * 布控库切换
 */
$(function(){
	initEvent();
})

function initEvent(){
	$('#mainFrameContent').attr('src','/efacecloud/page/executeControl/controlList.html')
	// 切换
	$('.tagItem').on('click', function(){
		var targetUrl = $(this).attr('ref');
		$(this).addClass('active').siblings().removeClass('active');
		$('#mainFrameContent').attr('src',targetUrl)
	})
}