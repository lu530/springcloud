$(function(){
	UI.control.setPermissionClass('hide');
	UI.control.init();
	UI.control.initPermission(); //初始化权限
	initEvents();
	//removeLine();
	scrollLi();
	initSubMenu();
	$("li[scroll-control]:not('.hide'):first").click();
});
function initEvents(){
	//跳转
	$("#mainContent a").click(function(){
		top.showHomeMenu($(this));
	});
	
	//点击左边导航，右边滚动
	$("li[scroll-control]").click(function(){
		var $this = $(this);
		var $mainContent = $("#mainContent");
		var scrollControl = $this.attr("scroll-control");
		var $scrollControl = $("#"+scrollControl);
		var index = $this.index();
		var top = 0;
		
		if(!$this.hasClass("active")){
			$this.addClass("active").siblings().removeClass("active");
			$scrollControl.addClass("active").siblings().removeClass("active");
			
			$.each($("#mainContent li"),function(i,n){
				if(i<index){
					top+=$(n).height();
				}else{
					return false;
				}
			});
			
			$mainContent.animate({ 
				top: -top ,
			}, 300);
		}
	});
}

function removeLine(){
	$.each($(".face-tabs li"),function(i,n){
		if($(n).hasClass("hide")){
			$(n).remove();
			$(".face-info").eq(i).remove();
		}
	});
	$(".face-tabs li:last").find(".line").addClass("hide");
}

function scrollLi(){
	var $faceMain = $("#faceMain");
	var $scrollLi = $faceMain.find("li");
	var faceMainTop = $faceMain.offset().top;
	
	var time = 200, //200毫秒的间隔  函数节流阀值
	timer = null;
	$(document).on('mousewheel', function(event, delta) {  
		if( typeof timer != "number"){
			
			timer = setTimeout(function(){
				
				var direction = delta > 0 ? -1 : 1;
				scrollPosition(direction);
				
				timer = null;
				
			},time);
		}
		return false;  
	});
}

var cacheHeight = 0;
var flag = false;
var nextFlag = false;
function scrollPosition(direction){
	var visualHeight = $("body").height()-20;
	var $mainContent = $("#mainContent");
	var $curConLi = $("#mainContent li.active");
	var $curNavLi = $("li[scroll-control].active");
	var curConLiHeight = $curConLi.height();
	var $curConPrevLi = $curConLi.prev();
	
	if( direction == 1 ){
		//当前块级大于可视窗口
		if(visualHeight < curConLiHeight){
			//滚动一下后，依然剩余块级大于可视窗口
			if(cacheHeight > 0){
				if(cacheHeight > visualHeight){
					cacheHeight = visualHeight - cacheHeight;
				}else{
					//剩余块级小于可视窗口
					$curNavLi.next().click();
					nextFlag = true;
					cacheHeight = 0;
					return false;
				}
			}else{
				if(!nextFlag){
					//初次块级大于可视窗口的计算被隐藏的高度
					cacheHeight = curConLiHeight - visualHeight;
				}
			}
		}
		//块级在可视窗口内可以展示完
		if(cacheHeight<=0){
			$curNavLi.next().click();
		}else{
			//滚动显示被隐藏的块级内容
			$mainContent.animate({ 
				top: $mainContent.position().top-cacheHeight ,
			}, 300);
		}
	}else{
		//当前块级大于可视窗口
		if(visualHeight < curConLiHeight){
			//滚动一下后，依然剩余块级大于可视窗口
			if(cacheHeight > 0){
				if(cacheHeight > visualHeight){
					cacheHeight = visualHeight - cacheHeight;
				}else{
					if(flag){
						//剩余块级小于可视窗口
						$curNavLi.prev().click();
						cacheHeight = 0;
						flag = false;
						nextFlag = false;
						return false;
					}
				}
			}else{
				//初次块级大于可视窗口的计算被隐藏的高度
				cacheHeight = curConLiHeight - visualHeight;
			}
		}
		//块级在可视窗口内可以展示完
		if(cacheHeight<=0){
			$curNavLi.prev().click();
		}else{
			//滚动显示被隐藏的块级内容
			$mainContent.animate({ 
				top: $mainContent.position().top+cacheHeight ,
			}, 300);
			flag = true;
		}
	}
}

function initSubMenu(){
	$("body").on("click",".content-box",function(){
		top.showHeaderMenu();
		var $this = $(this);
		var href = $this.attr("href");
		var url = '/portal/page/efacecloudMenu.html'+href;
		
		top.window.location.href = url;
	});
	
	$.each($("#mainContent li"),function(i,n){
		var curALen = $(n).find("a").length;
		var hideALen = $(n).find("a.hide").length;
		if(curALen == hideALen){
			var id = $(n).attr("id");
			$("[scroll-control='"+id+"']").addClass("hide");
		}
	});
}