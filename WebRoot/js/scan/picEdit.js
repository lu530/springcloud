/**
 * @Author wenyujian
 * @version 2018-03-30
 * @description 人脸扫描
 */
var sceShotParms = [];
var PIC = UI.util.getUrlParam("imgUrl") || '';  //人脸识别的图片
var screenshotDatas =  top.screenshotDatas || {};
var scanData = {};
var options = {
	maxWidth: $('#curBox').width(),
	maxHeight: $('#curBox').height(),
	imgWidth: 0,
	imgHeight: 0,
	scale: 1,  //默认是不进行缩放
	flag: 1  //默认是情况:1
}
var faceImg = '';
var isLoadSuccess = false;
$(function(){	
	UI.control.init();
	initImg();
	initEvent();
});
/**
* 情况：
* 1、图片刚好和容器一样大，scale:1
* 2、图片比容器小,scale:1
* 3、图片比容器大,scale需要计算
*/
function initImg(){
	//获取人员图片结构化，自动框选人脸
	$('#targetImg').attr('src',PIC);
	
	$('#targetImg').load(function(){
		isLoadSuccess = true;
		options.imgWidth = $('#targetImg').outerWidth();
		options.imgHeight = $('#targetImg').outerHeight();
		//1、图片刚好和容器一样大，scale:1
		if(options.maxWidth == options.imgWidth && options.maxHeight == options.imgHeight){
			options.flag = 1;
		}else if(options.maxWidth >= options.imgWidth && options.maxHeight >= options.imgHeight){ //2、图片比容器小,scale:1
			options.flag = 2;
		}else if(options.maxWidth < options.imgWidth || options.maxHeight < options.imgHeight){ // 3、图片比容器大,scale需要计算
			options.flag = 3;
			$('#targetImg').addClass('self-adaption');
		}
		
		// 重新获取图片宽度，来计算出scale
		options.scale = $('#targetImg').outerWidth()/options.imgWidth;
		
		// 重置扫描图片容器的大小和位置
		$('#curBox').css({
			width: $('#targetImg').outerWidth(),
			height: $('#targetImg').outerHeight()
		});
		$('.decorate').each(function(index,item){
			$(this).removeClass('hide');
		});
		// 若是搜索同一张那个全景图,则直接用缓存结果搜索,不走服务
		if(screenshotDatas && screenshotDatas.PIC == PIC){
			renderRect(screenshotDatas);
		}
		
		//绘图
		initEditor();
		setMode("rect");		
		
	});
	setTimeout(function(){
		$('#targetImg').error(function(){
			isLoadSuccess = false;
		　	UI.util.alert('图片加载失败','warn');
		　	$('#saveBtn').removeClass('disabled');
			$('#cancelBtn').removeClass('disabled');
		});
	},10)

}


/*scanData = {
		X: editor.shapes[0].attrs.x,
		Y: editor.shapes[0].attrs.y,
		WIDTH: editor.shapes[0].attrs.width,
		HEIGHT: editor.shapes[0].attrs.height,
		PIC: PIC,	
		scanPic: scanPic
}*/
function renderRect(result){
	$('#rectSelect').removeClass('hide');
	$('#rectSelect').css({
		left: result.X,
		top: result.Y,
		width: result.WIDTH,
		height: result.HEIGHT
	})
}

function clearRect(){
	$('#rectSelect').addClass('hide');
}

function initEvent(){
	$("#saveBtn").click(function(){
		if($(this).hasClass('disabled')){
			return;
		}
		if(isLoadSuccess){
			var shapeLen = editor.shapes.length;
			var params;
			if(shapeLen == 0 && $('#rectSelect').hasClass('hide')){
				UI.util.alert('请选择人脸!','warn');
				return;
			}else if( !$('#rectSelect').hasClass('hide')){
				params = {
					X: parseInt(screenshotDatas.X/options.scale),
					Y: parseInt(screenshotDatas.Y/options.scale),
					WIDTH: parseInt(screenshotDatas.WIDTH/options.scale),
					HEIGHT: parseInt(screenshotDatas.HEIGHT/options.scale),
					PIC: screenshotDatas.PIC
				};
			}else{
				params = {
					X: parseInt(editor.shapes[0].attrs.x/options.scale),
					Y: parseInt(editor.shapes[0].attrs.y/options.scale),
					WIDTH: parseInt(editor.shapes[0].attrs.width/options.scale),
					HEIGHT: parseInt(editor.shapes[0].attrs.height/options.scale),
					PIC: PIC
				};
			}
			// 对接后台服务,进行人脸截图 
			UI.util.showLoadingPanel();
			UI.control.remoteCall('image/cut/getface',params, function (resp) {
				UI.util.hideLoadingPanel();
				UI.util.alert(resp.message);
				if(resp.code == 0){
					if($('#rectSelect').hasClass('hide')){
						scanData = {
							X: editor.shapes[0].attrs.x,
							Y: editor.shapes[0].attrs.y,
							WIDTH: editor.shapes[0].attrs.width,
							HEIGHT: editor.shapes[0].attrs.height,
							PIC: PIC,
							scanPic: resp.newUrl,
							isCancel: false
						};
					}else{
						scanData = {
							X: screenshotDatas.X,
							Y: screenshotDatas.Y,
							WIDTH: screenshotDatas.WIDTH,
							HEIGHT: screenshotDatas.HEIGHT,
							PIC: screenshotDatas.PIC,
							scanPic: resp.newUrl,
							isCancel: false
						};
					}
					parent.UI.util.returnCommonWindow(scanData);
					parent.UI.util.closeCommonWindow();
				}
			},function(){
				UI.util.alert(resp.message);
				$('#saveBtn').removeClass('disabled');
				$('#cancelBtn').removeClass('disabled');
				UI.util.hideLoadingPanel();
			}, {}, true);
			
		}
	
	});
	$("#cancelBtn").click(function(){
		if($(this).hasClass('disabled')){
			return;
		}
		if(isLoadSuccess){
			if(!scanData.PIC){
				scanData = screenshotDatas;
			}
			scanData.isCancel = true;
			parent.UI.util.returnCommonWindow(scanData);
		}
		parent.UI.util.closeCommonWindow();
	});
	
	$('#drawMapping').mousedown(function(){
		
		var target = $(this);
		function mousemoveHandler(){
			var shapes = editor.shapes;
			if(shapes.length > 1){
				editor.deleteShape(shapes[0]);
			}else if(!$('#rectSelect').addClass('hide')  && shapes.length ==1){
				clearRect();
			}			
		}
		target.on("mousemove",mousemoveHandler);
		target.on("mouseup",function(){			
			target.off("mousemove",mousemoveHandler);
			target.off("mouseup",arguments.callee);
			setMode("rect");
		});
	});

}