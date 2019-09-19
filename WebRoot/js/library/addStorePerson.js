var queryParams = {};
var logParam = {};
var beginTime = $('#beginTime');
var endTime = $('#endTime');

$(function () {
    UI.control.init();

    initTime();

    // 初始化地址树
    UI.control.remoteCall('dataCity/rest/area', {}, function(resp){
        $("#registerAreaList").html(tmpl('childNodeListTemplate', resp.records.provinceArea));
    });

    UI.control.remoteCall('dataCity/rest/area', {}, function(resp){
        $("#areaList").html(tmpl('childNodeListTemplate', resp.records.provinceArea));
    });

    initAreaTree();
	topUploadPic();

    //保存
    $("#submitBtn").click(function(){
        doSave();
    });

    //关闭
    $(".btn-close").click(function(){
        parent.UI.util.hideCommonIframe('.frame-form-full');
    });

})

function initTime(){
    var    now = new Date();
    endTime.val(now.format("yyyy-MM-dd"));
//    now.setDate(now.getDate() - 31);
    beginTime.val(now.format("yyyy-MM-dd"));
    beginTime.focus(function(){
        WdatePicker({
            startDate:'%y-#{%M}-%d',
            dateFmt:'yyyy-MM-dd',
            alwaysUseStartDate:true,
            maxDate:'#F{$dp.$D(\'endTime\')}'
        });
    });
    endTime.focus(function(){
        WdatePicker({
            startDate:'%y-#{%M}-%d',
            dateFmt:'yyyy-MM-dd',
            alwaysUseStartDate:true,
            minDate:'#F{$dp.$D(\'beginTime\')}'
        });
    });
}

function doSave(){
    if (UI.util.validateForm($('#mobileForm'))){
        var formData = UI.util.formToBean($('#mobileForm'));
        /*		UI.control.remoteCall('viid/important/person/addOnePerson', formData, function(resp){
         if (resp.code == "1") {*/
        UI.util.alert("新增成功");
        parent.UI.util.hideCommonIframe('.frame-form-full');
        /*				parent.doSearch();*/
        /*			}else{
         UI.util.alert(resp.result||resp.msg,"warn");
         }

         });*/
    }
}
