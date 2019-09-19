/**
 * @Author linzewei
 * @version 2018-10-30
 * @description 用来显示图片，主要是框框头像
 */
var imgSrc = UI.util.getUrlParam("imgSrc");
var ALARM_FACE_RECT = UI.util.getUrlParam("ALARM_FACE_RECT");
$(function(){
	initPage();

})
function initPage(){
	$img = $("#frameImg");
	$img.attr("src",imgSrc);
	$img.load(function() {
		var ALARM_FACE_RECT_OBJ = JSON.parse(ALARM_FACE_RECT);
		renderRect(ALARM_FACE_RECT_OBJ.x,ALARM_FACE_RECT_OBJ.y,ALARM_FACE_RECT_OBJ.w,ALARM_FACE_RECT_OBJ.h,imgSrc);  
	})
		
}

/**
 * @Author linzewei
 * @version 2018-08-29
 * @description 根据坐标，动态生成圈人脸的框框
 */
function renderRect(x, y, w, h, faceImg) {
	//var $imgBox = $('.alarm-right');
	//var $img = $('.alarm-right img');
	//var imgBoxLeft = parseInt($('.alarm-right').css("padding-left"));
	var $imgBox = $('body');
	var $img = $('#frameImg');
	var imgBoxLeft = parseInt($('#frameImg').css("margin-left"));
	var originalImg = $img[0];
	var imgInfo = getNaturalInfo(originalImg);
	var bodyMarginLeft = parseInt($('body').css("margin-left"));
	var options = {
		maxWidth: $imgBox.width(),
		maxHeight: $imgBox.height(),
		imgWidth: 0,
		imgHeight: 0,
		scale: 1, //默认是不进行缩放
		flag: 1 //默认是情况:1
	}
	options.imgWidth = imgInfo.width;
	options.imgHeight = imgInfo.height;
	// 重新获取图片宽度，来计算出scale
	options.scaleX = $img.outerWidth() / options.imgWidth;
	options.scaleY = $img.outerHeight() / options.imgHeight;
	var html = '<div class="rect" style="left:' + (x * options.scaleX+imgBoxLeft+bodyMarginLeft) + 'px;top:' + y * options.scaleY + 'px;width:' + w* options.scaleX  + 'px;height:' + h* options.scaleY  + 'px;position: absolute;border:2px solid red;" faceImg="' + faceImg + '"></div>';
	$imgBox.append(html);
}
function getNaturalInfo(img) {
    var image = new Image();
    var	result = {};
    image.src = img.src;
    result.width = image.width;
    result.height = image.height;
    return result;
}