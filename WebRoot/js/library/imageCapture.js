var imgSrc = UI.util.getUrlParam('imgSrc')

var imageCropper = new ImageCropper();

$(function() {
    initTaging();
    initEvent();
})

/**
 * 初始化画图 
 */
function initTaging(){

	var img = new Image();
	
	img.onload = function() {
		img.onload = null;
		
		imageCropper.init({
			id: 'videoMapping',
			imgsrc: imgSrc,
			width: $(".image-content").width(),
			height: $(".image-content").height(),
			imgList:{
				id: 'imgListCon',
				height:250,  
                width:300,
                drawCallBack: function() {
                    $(".imgListCon-tip").addClass("hide");
                }
			}
		}, function() {});

	}

	img.src = imgSrc;
}

function initEvent() {
    $("#confirmBtn").click(function() {
		var cutData = imageCropper.getData().imgs;
		if(cutData.length == 0) {
			UI.util.alert('请先框选人形', 'warn');
			return;
		}
		UI.util.showLoadingPanel();
		var params = {
			PIC: imgSrc,
			X: cutData[0].x,
			Y: cutData[0].y,
			WIDTH: cutData[0].width,
			HEIGHT: cutData[0].height
		}
		UI.control.remoteCall('mx/image/cut/getface', params, function(resp) {
			UI.util.hideLoadingPanel();
			if(resp.code == 0) {
				parent.UI.util.returnCommonWindow(resp.newUrl);
			}else {
				UI.util.alert('图片裁剪失败', 'warn')
			}
		})
    })
    $("#cancelBtn").click(function() {
        parent.UI.util.closeCommonWindow();
    })
}