/**
 * @Author lzh
 * @version 2017-08-09
 * @description 添加布控库人脸；
 */
var beginTime = $('#BIRTHDAY');
var db_id = UI.util.getUrlParam("db_id");
var type = UI.util.getUrlParam("type");
var person_id = UI.util.getUrlParam("personid");
var addressOption = {
    'elem':['domicile','nowAddress'],//地址HTML容器
    'addressId':['registerAreaList','addressArea'],//初始化省级内容
    'service':'face/address/getTree',//请求服务
    'tmpl':'childNodeListTemplate',//初始化模板
    'selectArr':["PERMANENT_ADDRESS","PRESENT_ADDRESS"],
    /*'data':['150623','440111'],//回填值*/
    'callback':null//回调函数
};
$(function(){
    // UI.control.init();
    initTime();
    initEvent();
    initAreaTree(addressOption);
    topUploadPic();
    passport();
    fixation();//保存按钮定位判断
});

function initEvent(){

    //编辑信息
    if(type=="eidt"){
        $('.form-head-title span').text('编辑布控人员信息');
        UI.control.remoteCall("face/hw/dispatchedPerson/detail",{PERSON_ID:person_id},function (resp) {
            var faceData = resp.DATA;
            addressOption.data = [faceData.PERMANENT_ADDRESS||'',faceData.PRESENT_ADDRESS||''];
            UI.util.bindForm($("#mobileForm"),faceData);
            $("#filterImg").attr("src",faceData.PIC);
            $("#submitBtn").click(function(){
                if (UI.util.validateForm($('#mobileForm'))){
                    editSave();
                }
            });
        })
    }else {
        $("#submitBtn").click(function(){
            if (UI.util.validateForm($('#mobileForm'))){
                addSave();
            }
        });
    }



    //上传人脸
    $('#filterImg').change(function(){
        ajaxFileUpload($(this).attr('id'),picSuccFunction);
    });


    //返回父层列表
    $(".btn-close").click(function(){
        parent.UI.util.hideCommonIframe('.frame-form-full');
    });

    $(".tag-item").click(function(){
        var $this = $(this);
        if($this.hasClass("active")){
            $this.removeClass("active");
        }else{
            $this.addClass("active");
        }
    });
}

//编辑保存
function editSave() {
        var formData = UI.util.formToBean($('#mobileForm'));
        formData.DB_ID = db_id;
        formData.PERSON_ID = person_id;
        ExtendRemoteCall('face/hw/dispatchedPerson/update', formData,function () {
            parent.UI.util.hideCommonIframe('.frame-form-full');
            parent.doSearch();
        },"编辑成功")
}


//新增保存
function addSave(){
    var formData = UI.util.formToBean($('#mobileForm'));
    formData.DB_ID = db_id;
    ExtendRemoteCall('face/hw/dispatchedPerson/add', formData,function () {
        parent.UI.util.hideCommonIframe('.frame-form-full',function () {
            parent.parent.valueAddOne('add');//如果新增成功，让入库数量加一
        });
        parent.doSearch();
    },"新增成功")
}

function initTime(){
    var now = new Date();
    beginTime.val(now.format("yyyy-MM-dd"));
    beginTime.focus(function(){
        WdatePicker({
        	isShowClear:false,
        	readOnly:true,
            startDate:'%y-#{%M}-%d',
            dateFmt:'yyyy-MM-dd',
            alwaysUseStartDate:true,
            maxDate:now.format("yyyy-MM-dd")
        });
    });
}


/**
 * 通过选择证件类型  改变 证件号码的 验证  1身份证2护照3驾驶证4港澳通行证，默认身份证
 * 回填的时候，通过主动获取回填数据，设置input的验证；
 * @param {str} identity_type : 证件类型select标签 id  默认 IDENTITY_TYPE;
 * @param {str} identity_id : 证件号码 input标签 id  默认 IDENTITY_ID
 * @param {bool} bool : 正则配置 默认{pattern:"required,idCard"}，false为{pattern:"idCard"}；
 * @author：lzh
 */
function passport(identity_type,identity_id,bool) {
    var identity_type = identity_type|| "IDENTITY_TYPE";
    var identity_id = identity_id|| "IDENTITY_ID";
    var value = parseInt($("#"+identity_type).val());
    var initObj = switchPatten(value,bool);
    $("#"+identity_id).attr("ui-validate",initObj.patten).attr("ui-vtext",initObj.text);
    $("#"+identity_type).change(function (){
        var int = parseInt($(this).val());
        var obj = switchPatten(int,bool);
        $("#"+identity_id).attr("ui-validate",obj.patten).attr("ui-vtext",obj.text);
    });
    $("#"+identity_type).trigger('change');//模拟事件 以回填
    function switchPatten(value,bool) {
        var obj = {patten:'',text:""};
        if(bool == false){
            bool = false
        }else {
            bool = true
        }
        switch (value){
            case 0:obj.patten= bool?"{pattern:'required,idCard'}":"{pattern:'idCard'}",obj.text='身份证号码';break;
            case 1:obj.patten= bool?"{pattern:'required,passport'}":"{pattern:'passport'}",obj.text='护照号码';break;
            case 4:obj.patten= bool?"{pattern:'required,driving'}":"{pattern:'driving'}",obj.text='驾照号码';break;
            case 2:obj.patten= bool?"{pattern:'required'}":"{pattern:'required'}",obj.text='学生证';break;
            case 3:obj.patten= bool?"{pattern:'required'}":"{pattern:'required'}",obj.text='军官证';break;
            case 5:obj.patten= bool?"{pattern:'required'}":"{pattern:'required'}",obj.text='其他证号码';break;
            // case 4:obj.patten= bool?"{pattern:'required,hk-passport'}":"{pattern:'hk-passport'}",obj.text='港澳通行证号码';break;
        }
        return obj;
    }
}