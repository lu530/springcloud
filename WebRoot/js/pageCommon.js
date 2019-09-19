//技战法页面加载显示前20条
function renderTwenty(index){
	if(index>21){
		return "hide";
	}
}

//技战法分页大小
var pageSize = 20, currentPage = 1, totalPage = 1, totalNum = 0;
function renderPages(size,pageSize){
	if(size>pageSize){
		$("#totalSize").html(size);
		$("#pageSize").html(pageSize);
	}else{
		$("#moreDiv").hide();
	}
}
//技战法分页功能
function initTechnicalPage(sums, notShow){
	totalNum = sums;
	totalPage = Math.ceil(totalNum / pageSize);
	
	
	
	var $pager = $("body").find("[listview-page]");
	$pager.find("[listview-prev-btn]").each(function(){
		$(this).click(function(){
				if(!$(this).hasClass("disable")){
					currentPage--;
					onPageChangeBtn(notShow);
				}
				return false;
			});
  	});
	
	$pager.find("[listview-next-btn]").each(function(){
		
		$(this).click(function(){
				if(!$(this).hasClass("disable")){
					currentPage++;
					onPageChangeBtn(notShow);
				}
				return false;
			});
	});	
	
	onPageChangeBtn(notShow);
}

function onPageChangeBtn(notShow){
	var element = $('body');
	
	if(!notShow){
		element.find('[page]').addClass('hide');
		element.find('[page="'+currentPage+'"]').removeClass('hide');
	}
	
	if(currentPage > 1) {
		element.find('[listview-prev-btn]').removeClass("disable");
	} else {
		element.find('[listview-prev-btn]').addClass("disable");
	}
	if(currentPage == totalPage) {
		element.find('[listview-next-btn]').addClass("disable");
	} else {
		element.find('[listview-next-btn]').removeClass("disable");
	}
	element.find("[listview-total]").html("" + totalPage);
	element.find("[listview-current]").html("" + currentPage);
	element.find("[listview-counts]").html("" + totalNum);
}

function renderPageIndex(index){
	return index % pageSize + 1;
}

function renderCurrentPage(index){
	return parseInt((index-1)/pageSize)+1;
}