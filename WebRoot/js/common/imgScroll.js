var imgUrl = UI.util.getUrlParam("imgUrl");

$(function(){
	var imgWraper = $('.img-wraper'),
	    scrollWraper = $('.scroll-wraper'),
	    // imgList = scrollWraper.find('.img-list'),
	    imgitem = scrollWraper.find('.img-item'),
	    btnNext = $('.slider-btn-next'),
	    btnPrev = $('.slider-btn-prev');
	var pageWidth;
	var pageNo;
	var imgitemLen;
	var left;
	var imgListWidth;
	var scrollLeft=0;
	initData()
    if(!imgUrl) {
        imgList.css('width',imgListWidth);
    }
	$('body').on('click','.img-item',function(){
		$(this).addClass('active').siblings('li').removeClass('active');
		return false;
	});
	$('body').on('click','.slider-btn-next',function(){
		initData();
        scrollLeft+=155;
        if(scrollLeft>(scrollWraper.find('.img-list').width()-scrollWraper.width())) {
            scrollLeft=(scrollWraper.find('.img-list').width()-scrollWraper.width());
            scrollWraper.animate({ scrollLeft: scrollLeft }, 500);
            return;
        }
        scrollWraper.animate({ scrollLeft: scrollLeft }, 500);
		// if(left >= -pageWidth * pageNo){
		// 	left = left - pageWidth;
         //    scrollWraper.animate({ scrollLeft: left+"px" }, 3000);
         //    // scrollWraper.scrollLeft(left);
		// }
	});
	$('body').on('click','.slider-btn-prev',function(){
		initData();
        scrollLeft-=155;
        if(scrollLeft<=0) {
            scrollLeft=0;
            scrollWraper.animate({ scrollLeft: scrollLeft }, 500);
            return;
        }
        scrollWraper.animate({ scrollLeft: scrollLeft }, 500);
		// if(left < 0){
		// 	left = left + pageWidth;
         //    scrollWraper.animate({ scrollLeft: left+"px" }, 3000);
         //    // scrollWraper.scrollLeft(left);
		// }
	});
	function initData(){
        imgList = scrollWraper.find('.img-list'),
		left = parseInt(imgList.css('left'));
		pageWidth = scrollWraper.width();
		imgitem = $('.img-item');
		imgitemLen = imgitem.length;
		imgListWidth = imgitemLen * imgitem.eq(0).outerWidth(true);
		pageNo = Math.floor(imgListWidth/pageWidth) - 1;
	}

});