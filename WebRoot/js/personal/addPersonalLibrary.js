
$(function(){
	
	initEvent();
});

function initEvent(){
	
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
			UI.util.showLoadingPanel();
			var formData = UI.util.formToBean($('#personalForm'));
			UI.control.remoteCall('efacecloud/mine/libinfo/addOrEditLib', formData, function(resp){
				UI.util.hideLoadingPanel();
				var flag = resp.status;
				if (flag == "true" || flag == true) {
					parent.UI.util.returnCommonWindow({
						msg:"success"
					});
					UI.util.alert(resp.msg);
				} else {
					UI.util.alert(resp.msg, "error");
				}
				windowClose();
			});
		}
	});
    
    
}

function windowClose(){
	parent.UI.util.closeCommonWindow();
}

