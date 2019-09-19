var data = {};
data.ALARM_IMG = UI.util.getUrlParam("ALARM_IMG") || "";
data.OBJECT_PICTURE = UI.util.getUrlParam("OBJECT_PICTURE") || "";
data.ORIGINAL_DEVICE_ID = UI.util.getUrlParam("ORIGINAL_DEVICE_ID") || "";
data.ALARM_TIME = UI.util.getUrlParam("ALARM_TIME") || "";
data.SCORE = UI.util.getUrlParam("SCORE")+"%" || "--%";
data.PERSON_NAME = UI.util.getUrlParam("PERSON_NAME") || "";
data.PERSON_SEX = UI.util.getUrlParam("PERSON_SEX") || "";
data.IDENTITY_ID = UI.util.getUrlParam("IDENTITY_ID") || "";
data.DB_NAME = UI.util.getUrlParam("DB_NAME") || "";
data.DEVICE_NAME = UI.util.getUrlParam("DEVICE_NAME") || "";

$(function(){
	initData();
})
function initData(){
	for(var key in data){
		$("."+key).attr("src",data[key]);
		$("[name='"+key+"']").html(data[key]).attr("title",data[key]);
	}
}
