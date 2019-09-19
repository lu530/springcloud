/**
 * @Author lzh
 * @version 2017-08-09
 * @description 布控撤控列表；
 */

var DEVICE_ID = UI.util.getUrlParam("id");
var title = UI.util.getUrlParam("title");

//布控库数据
var queryParams = {
    DEVICE_ID:DEVICE_ID,
    pageSize:500
};

//关联数据
var params = {
    DB_IDS:"",
    DEVICE_IDS:DEVICE_ID,
    PAGE_TYPE:2
}


$(function () {
    UI.control.init();
    initEvent();
})

function initEvent() {
    //当前设备
    if(title){
        $("#rightTitle span").text(title);
    }else {
        $("#rightTitle span").text("（没有被选中的设备）");
    }

    //模拟选中库
    triggerClick();
    //搜索
    $("#searchBtn").click(function () {
        doSearch();
    })
    $("#searchText").keyup(function (event) {
        var event = event || window.event;
        if(event.keyCode  == 13){
            doSearch();
        }
    })
    
    //保存
    $("#saveBtn").click(function () {
        if(!DEVICE_ID){
            UI.util.alert("请在左边选择设备！",'warn');
            return;
        }
        getChecked();
    })
}


//搜索布控库
function doSearch(){
    var name = $("#searchText").val();
    if(name==""){
        UI.util.alert("请输入库名！","warn")
        return;
    }
    var patt = new RegExp(name);
    $(".store-title").each(function (i,o) {
        var this_name = $(this).text();
        var span = $(this).find("span")
        if(patt.test(this_name)){
            span.addClass("test-true");
        }else {
            span.removeClass("test-true");
        }
    })
    var score = $(".test-true");
    if(score.length>0){
        var height = parseInt(score.eq(0).offset().top)-135;
        $(".pager-content").animate({scrollTop:height},100)
    }else {
        UI.util.alert("没有匹配的库","warn")
    }
}

//确定关联
function getChecked() {
    params.DB_IDS="";
    $("[listview-item]").each(function (i,o) {
        if($(this).hasClass("active")){
            params.DB_IDS+=$(this).find(".list-node").attr("task_id")+",";
        }
    })
    ExtendRemoteCall("face/distaptchedTask/add",params,'',"设备关联成功！")
}

//选中事件
function triggerClick() {
    $(".list-node").each(function () {
        var checked = $(this).attr("hasCheck");
        if(checked=="true"){
            $(this).trigger("click");
        }
    })
}