var imgsrc = UI.util.getUrlParam("imgsrc") || '';

$(function(){
	initEvent();
});

function initEvent(){
	$("#tabMenu li").click(function(){
		var $this = $(this);
		var liHref=$this.find('a').attr('url');
		$this.addClass("active").siblings().removeClass("active");
		$('#mainFrame').attr("src",liHref);
	});
}