// 告警阈值
var alarm_Num = UI.util.getUrlParam("alarmNum")||'70';
var db_id = UI.util.getUrlParam("dbId")||'2bded9bb3d2440708d7a5c080741c51a';
$(function () {
    UI.control.init();
    initEvents();
    initData();
    $('#THRESHOLD').attr('ui-validate','{ pattern:\'required,integer\', max:99,min:'+alarm_Num+'}');
})

function initData(){
	UI.control.remoteCall('face/dispatchedLib/getMessagePush', {
		DB_ID : db_id
	}, function(resp){
		if (resp && resp["DATA"]) {
			var data = resp["DATA"];
			var phoneArr = [], sendThreshold = 0;
			for (var i = 0; i < data.length; i++) {
				phoneArr.push(data[i].PUSH_PHONE);
				sendThreshold = data[i].PUSH_THRESHOLD;
			}
			
			if (phoneArr.length > 0) {
				sliderT.slider( "value", sendThreshold );
				$("#THRESHOLD").val(sendThreshold);
				$("#PHONE").val(phoneArr.join(','));
			}
		}
	})
}

var sliderT;
function initEvents() {
    //初始化滑块事件
    sliderT = $( "#sliderThreshold" ).slider({
        range: "max",
        min: 0,
        max: 100,
        value: alarm_Num,
        slide: function( event, ui ) {
            $( "#THRESHOLD" ).val( ui.value );
        }
    });

    $('#THRESHOLD').keyup(function() {
        //数值范围为99以内
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

    // 点击确定
    $("#saveBtn").on("click",function () {
        if (UI.util.validateForm($('#validateForm'))) {
            var phone=$("#PHONE").val().replaceAll("，",",");
            if(phone.replaceAll(",")!='') {
                var phoneArray = phone.split(",");
                for (var i = 0; i < phoneArray.length; i++) {
                    if(!(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/.test(phoneArray[i]))){
                        UI.util.alert("手机号"+phoneArray[i]+"非法","warn");
                        return;
                    }
                }
            }
            // 推送阈值
            var sendThreshold = sliderT.slider( "value");
            UI.control.remoteCall('face/dispatchedLib/messagePush', {
        		DB_ID : db_id,
        		THRESHOLD : sendThreshold,
        		PHONE : phone
        	}, function(resp){
        		UI.util.alert(resp.MESSAGE);
        		parent.UI.util.closeCommonWindow();
        	})
        }
    })
    
    $(".btn-close").on("click", function(){
    	parent.UI.util.closeCommonWindow();
    })
}