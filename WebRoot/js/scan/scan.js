/**
 * @Author wenyujian
 * @version 2018-03-30
 * @description 人脸扫描
 */
var PIC = UI.util.getUrlParam("imgUrl") || '';  //人脸识别的图片
var options = {
	maxWidth: $('#curBox').width(),
	maxHeight: $('#curBox').height(),
	imgWidth: 0,
	imgHeight: 0,
	scale: 1,  //默认是不进行缩放
	flag: 1  //默认是情况:1
}
var faceImg = '';
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
		// 重置扫描图片容器的大小和位置
		$('#curBox').css({
			width: $('#targetImg').outerWidth(),
			height: $('#targetImg').outerHeight()
		});
		$('.decorate').each(function(index,item){
			$(this).removeClass('hide');
		});
		// 人脸扫描开始
		$('#distinguish').removeClass('hide');
		UI.control.remoteCall('face/discover/getResult',{PIC: PIC}, function (resp) {
			if(resp.CODE == 0){
				// 处理返回数据的人脸位置和大小数据
				var result = resp.RESULT;
				$('#saveBtn').removeClass('disabled');
				$('#cancelBtn').removeClass('disabled');
				if(! result|| result.length <1){
					$('#distinguish').addClass('hide');
					UI.util.alert('无法识别人脸', 'warn');
					return ;
				}
				var locations = []; 
				$.each(result,function(index,item){
					if(index == 0){
						faceImg = item.data.face_img;
					}
					locations.push({
						x: item.data.face_rect.x,
						y: item.data.face_rect.y,
						w: item.data.face_rect.width,
						h: item.data.face_rect.height,
						faceImg: item.data.face_img
					})
				})
				
				// 人脸扫描完毕
				$('#distinguish').addClass('hide');
				switch(options.flag){
					case 1: 
						$.each(locations,function(index,item){
							renderRect(item.x,item.y,item.w,item.h,item.faceImg);
						})
						break;
					case 2: 
						$.each(locations,function(index,item){
							renderRect(item.x,item.y,item.w,item.h,item.faceImg);
						})
						break;
					case 3: 
						// 重新获取图片宽度，来计算出scale
						options.scale = $('#targetImg').outerWidth()/options.imgWidth;
						$.each(locations,function(index,item){
							renderRect(Math.round(item.x*options.scale),Math.round(item.y*options.scale),Math.round(item.w*options.scale),Math.round(item.h*options.scale),item.faceImg);
						});
						$('.rect').eq(0).addClass('active');
						break;
				}
			}
		},function(){
			$('#distinguish').addClass('hide');
			UI.util.alert('人脸识别失败', 'warn');
			$('#saveBtn').removeClass('disabled');
			$('#cancelBtn').removeClass('disabled');
		}, {}, true);
	})
	
	
	
	
}

// 根据坐标，动态生成圈人脸的框框
function renderRect(x,y,w,h,faceImg){
	var html = '<div class="rect" style="left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;" faceImg="'+faceImg+'"></div>';
	$('#curBox').append(html);
}

function initEvent(){
	$("#saveBtn").click(function(){
		if($(this).hasClass('disabled')){
			return;
		}
		var data = {
			'faceImg': faceImg	
		}
		parent.UI.util.returnCommonWindow(data);
		parent.UI.util.closeCommonWindow();
	});
	$("#cancelBtn").click(function(){
		if($(this).hasClass('disabled')){
			return;
		}
		parent.UI.util.closeCommonWindow();
	});
	
	// 选择人脸框框
	$('body').on('click', '.rect',function(){
		$(this).addClass('active').siblings().removeClass('active');
		faceImg = $(this).attr('faceImg');
	});
}