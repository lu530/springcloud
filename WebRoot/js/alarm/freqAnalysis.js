/**
 * 告警频次分析
 * @author fenghuixia
 * 2018-02-08
 */
$(function(){
	initEvent();
	initTime();
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
			var THRESHOLD = $("#THRESHOLD").val();
			parent.UI.util.returnCommonWindow({
				beginTime:$("#beginTime").val()+' 00:00:00',
				endTime:$("#endTime").val()+' 23:59:59',
				threshold:THRESHOLD
			});
			windowClose();
		}
	});
    
    
}

function windowClose(){
	parent.UI.util.closeCommonWindow();
}

//初始化日期选择框
function initTime(){
	
	var	now = new Date(),
		beginTime = $("#beginTime"),
		endTime = $("#endTime"),
		nearTime = renderNearWeek(),
		today = now.format("yyyy-MM-dd"),
		maxTime = now.format("yyyy-MM-dd");
		beginTime.val(nearTime.bT);
		endTime.val(nearTime.eT);
	
	$('#beginTime').focus(function(){
		WdatePicker({
			startDate:'%y-#{%M}-%d',
			dateFmt:'yyyy-MM-dd',
			maxDate:today
		});
	});
	$('#endTime').focus(function(){
		WdatePicker({
			startDate:'%y-#{%M}-%d',
			dateFmt:'yyyy-MM-dd',
			minDate:'#F{$dp.$D(\'beginTime\')}',
			maxDate:maxTime
		});
		
	});
}

//最近7天(从当天开始)
function renderNearWeek(){
	var curTime = new Date(), curTimeBT = '', curTimeBT = '';
	
	curTimeET = dateFormat(curTime,'yyyy-MM-dd');
	curTimeBT = curTime.setDate(curTime.getDate() - 6);
	curTimeBT = dateFormat(curTimeBT,'yyyy-MM-dd');
	return {
		eT : curTimeET, bT : curTimeBT
	};
}