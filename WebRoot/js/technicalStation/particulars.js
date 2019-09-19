var data = top.window.frames["mainContent"].trackData;
$(function () {
    $("#new").attr("src",data[0].imgurl2);
    $("#old").attr("src",data[0].imgurl);
    $("#name").html(data[0].name);
    $("#idCard").html(data[0].personId);
    $("#ku").html(data[0].rlk);
    $("#similar").html(data[0].similar+"%");
    initEvent();
})
function initEvent() {
    // // 存至档案库
    // $("body").on("click","#toArchive",function () {
    //         var params={};
    //         params.IDENTITY_ID=personId;
    //         params.NAME=name;
    //         params.PIC=imgurl2;
    //         params.IDENTITY_TYPE=1;
    //         params.SEX=0;
    //         params.PERMANENT_ADDRESS='';
    //         params.PRESENT_ADDRESS='';
    //         params.QQ='';
    //         params.TELEPHONE='';
    //         params.WECHAT='';
    //         params.WORK_ADDRESS='';
    //         params.BIRTHDAY='';
    //         params.PERSON_ID='';
    //         UI.util.showLoadingPanel();
    //         UI.control.remoteCall('face/archives/addPerson',params,function(resp){
    //             if(resp.CODE==0) {
    //                 UI.util.alert(resp.MESSAGE);
    //             } else {
    //                 UI.util.alert(resp.MESSAGE,'warn');
    //             }
    //             parent.UI.util.returnCommonWindow(resp);//触发parent层回调
    //             parent.UI.util.closeCommonWindow();
    //         },function(){},{},true)
    // })
}
