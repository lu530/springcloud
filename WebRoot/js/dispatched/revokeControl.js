var PortraitID = UI.util.getUrlParam("personId")||"-1";
var IDCard = UI.util.getUrlParam("IDCard")||"-1";
var surveilId = UI.util.getUrlParam("surveilId")||"0";
$(function(){
	initEvents();
})

function initEvents(){
	$("#confirmBtn").click(function(){
		var url = "person/control/removePerson";
		var data = {};	
		//data.PURI = "localstoreportmodifystatus";
		data.PortraitID = PortraitID;
		data.Status = 3;
		data.Comment = $("#ControlReason").val();
		//data.requestFrom = "web";
		data.surveilId = surveilId;
		UI.control.remoteCall(url, data, function(resp){
			if (resp.status ==true){
				UI.util.alert("撤控成功");
				parent.UI.util.returnCommonWindow(null);
				closeWindow();
				
			} else {
				UI.util.alert(resp.message, "warn");
			}
			
		});
	});
	
	$("#cancelBtn").click(function(){
		closeWindow();
	});
}

function closeWindow(){
	parent.UI.util.closeCommonWindow();
}