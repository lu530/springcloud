var imgUrl = UI.util.getUrlParam("imgUrl")||'';
$(function(){
	//UI.control.init();
	UI.util.tabs();
	initEvent();
});


function initEvent(){
	
	var imgsrc = 'http://172.16.56.222:9080/staticRes/image/person/photo/6.jpg';
	
	if( parent.imgsrc != '' ){
		imgsrc = parent.imgsrc; 
	}
	
	if(imgUrl != ''){
		imgsrc = imgUrl;
	}
	
	$('#personImg').attr('src',imgsrc);
	
}