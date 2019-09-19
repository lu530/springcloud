
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
	 var sliderS = $("#sliderScore").slider({
	      range: "max",
	      min: 0,
	      max: 100,
	      value: 65,
	      slide: function( event, ui ) {
	        $( "#FACESCORE" ).val( ui.value );
	      }
	 })
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
    //$("#cancelBtn").on('click', function(){
		windowClose();
	});
	$('body').keypress(function(e){
		if(((e.keyCode || e.which) == 13)) {
			$("#confirmBtn").trigger('click');
		}
	});
	//确定
	$("#confirmBtn").click(function(){
		if(UI.util.validateForm($('#personalForm'))){
			var freqNum = $("#freqNum").val();
			var THRESHOLD = $("#THRESHOLD").val();
			var FACESCORE = $("#FACESCORE").val();
			parent.UI.util.returnCommonWindow({
				freqNum:freqNum,
				THRESHOLD:THRESHOLD,
				FACESCORE: FACESCORE
			});
			windowClose();
			/*UI.util.showLoadingPanel();
			var formData = UI.util.formToBean($('#personalForm'));
			UI.control.remoteCall('viid/mine/libinfo/addOrEditLib', formData, function(resp){
				UI.util.hideLoadingPanel();
				var flag = resp.status;
				if (flag == "true" || flag) {
					parent.UI.util.returnCommonWindow({
						msg:"success"
					});
					UI.util.alert("添加库成功");
				} else {
					UI.util.alert("添加库失败,失败原因："+ resp.msg, "error");
				}
				windowClose();
			});*/
		}
	});
    
    
}

function windowClose(){
	parent.UI.util.closeCommonWindow();
}
