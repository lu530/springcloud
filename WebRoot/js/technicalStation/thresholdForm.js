$(function(){
	initEvent();
});

function initEvent(){
	//初始化滑块事件
	 var sliderT = $( "#sliderThreshold" ).slider({
	      range: "max",
	      min: 0,
	      max: 100,
	      value: 80,
	      slide: function( event, ui ) {
	        $( "#THRESHOLD" ).val( ui.value );
	      }
	    });
	 var sliderS = $( "#sliderScore" ).slider({
	      range: "max",
	      min: 0,
	      max: 100,
	      value: 65,
	      slide: function( event, ui ) {
	        $( "#FACESCORE" ).val( ui.value );
	      }
	    });
	 
	 $('#THRESHOLD').keyup(function() {  
	        //数值范围为100以内
	    	$(this).val($(this).val().replace(/[^0-9]+/,''));
	    	if($(this).val() > 100){
	    		$(this).val(100);
	    	}
	     	$('.ui-slider-horizontal .ui-slider-handle').css('transition','0.5s');
	    	sliderT.slider( "value", $(this).val() );
	     	setTimeout(function(){
	     		$('.ui-slider-horizontal .ui-slider-handle').css('transition','0s');
	     	},500)
	    })
	    
	    $('#FACESCORE').keyup(function() {  
	        //数值范围为100以内
	    	$(this).val($(this).val().replace(/[^0-9]+/,''));
	    	if($(this).val() > 100){
	    		$(this).val(100);
	    	}
	     	$('.ui-slider-horizontal .ui-slider-handle').css('transition','0.5s');
	     	sliderS.slider( "value", $(this).val() );
	     	setTimeout(function(){
	     		$('.ui-slider-horizontal .ui-slider-handle').css('transition','0s');
	     	},500)
	    })
	 
	//取消
	$('body').on('click','#cancelBtn',function (){
		windowClose();
	});
	 
	//确定
	$("#confirmBtn").click(function(){
		if(UI.util.validateForm($('#personalForm'))){
			var THRESHOLD = $("#THRESHOLD").val();
			var FACESCORE = $("#FACESCORE").val();
			parent.UI.util.returnCommonWindow({
				THRESHOLD:THRESHOLD,
				FACESCORE: FACESCORE
			});
			windowClose();
		}
	});
    
}

function windowClose(){
	parent.UI.util.closeCommonWindow();
}
