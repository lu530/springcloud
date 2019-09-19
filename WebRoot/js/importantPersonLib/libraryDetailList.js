var timeOption = {
		'elem':$('#timeTagList'),
		'beginTime' :$('#beginTime'),
		'endTime' :$('#endTime'),
		'callback':doSearch
};
$(function(){
	UI.control.init();
	initEvent();
	initDateTimeControl(timeOption);
})
function initEvent(){
	$("body").on("click",".detailBtn",function(){
		var imgUrl = $(this).attr("imgsrc");
		var personName = $(this).find('span').text();
		var opts = {
				url:'/efacecloud/page/importantPersonLib/detailIframe.html?imgsrc='+imgUrl,
				title:  '人员档案 - '+ personName,
				width: '85%'
			}
			showWindow(opts);
	})
	//返回
	$("#backBtn").click(function(){
		parent.UI.util.hideCommonIframe(".frame-form-full");
	});
	$('.tags-list').not('#timeTagList,#timeTagListDraw').on('click','.tag-item',function(){
		$(this).addClass('active').siblings('.tag-item').removeClass('active');
			if(typeof callback=='function'){
				callback();
		}
	})

	//编辑按钮
	$("body").on("click",".editBtn",function( event){
		var opts = {
			url:'/efacecloud/page/importantPersonLib/casePersonInfo.html',
			title: '详细信息',
			width: '1000px'
		}
		showWindow(opts);
	});
	

	//作案手段页面切换展示
	$(".meansTitle").click(function(event){
		var $this = $(this);
		var ref = $this.attr("ref");
		
		$this.addClass('active').siblings().removeClass('active');
		$(ref).addClass('active').siblings().removeClass('active');
		
		if($(ref).is(":empty")){
			initCriminalMeans(ref,$(this).attr("liattr"));
		}
		event.stopPropagation();
	});
}


function showWindow(opts){
	top.UI.util.openCommonWindow({
		src: opts.url,
		title: opts.title,
		windowType: 'right',
		parentFrame: 'currentPage',
		width: opts.width,
        callback: function(resp){}
	});

}
function doSearch(){
	
}
