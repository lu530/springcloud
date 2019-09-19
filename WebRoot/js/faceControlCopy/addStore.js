/**
 * @Author lzh
 * @version 2017-08-09
 * @description 添加布控库；
 */
var type = UI.util.getUrlParam('type');


$(function () {
    initEvent()
})

function initEvent() {
    //关闭
    $(".btn-close").click(function(){
        parent.UI.util.closeCommonWindow()
    });
    //编辑
    if(type=="edit"){
        $("#name").val(UI.util.getUrlParam('name'));
        $("#level").val(UI.util.getUrlParam('level'));
        $("#vpt").val(UI.util.getUrlParam('vpt'));
        //编辑保存
        $("#submitBtn").unbind('click').click(function(){
            editSave();
        });
    }else {
        //新增保存
        $("#submitBtn").unbind('click').click(function(){
            doSave();
        });
    }
}

//新增保存
function doSave(){
    var formData = UI.util.formToBean($('#mobileForm'));
    if (UI.util.validateForm($("#mobileForm"))){
        UI.control.remoteCall("face/hw/dispatchedLib/add",formData,function (resp) {
            if(resp.CODE==0){
                UI.util.alert("新增成功");
                parent.UI.util.returnCommonWindow(resp);//触发parent层回调
                parent.UI.util.closeCommonWindow();
            }else {
                UI.util.alert(resp.MESSAGE,'warn');
            }
        })
    }
}

//编辑保存
function editSave(){
    var db_id = UI.util.getUrlParam('id');
    var db_name = $("#name").val();
    var vpt = $("#vpt").val();
    var level = $("#level").val();
    if (UI.util.validateForm($("#mobileForm"))){
        UI.control.remoteCall("face/hw/dispatchedLib/edit",{
			DB_ID : db_id,
			DB_NAME : db_name,
			THRESHOLD : vpt,
			ALARM_LEVEL : level
        }, function (resp) {
            if(resp.CODE==0){
                UI.util.alert("编辑成功");
                parent.UI.util.returnCommonWindow(resp);//触发parent层回调
                parent.UI.util.closeCommonWindow()
            }else {
                UI.util.alert(resp.MESSAGE,'warn');
            }
        })
    }
}