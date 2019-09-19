/**
 * @Author lzh
 * @version 2017-08-09
 * @description 撤控布控-卡口树；
 */

var DB_ID = UI.util.getUrlParam("id");
var task_id = UI.util.getUrlParam("task_id");
var hasChecked = [];//记录已经布控的device-ID;

var treeNode = null;

//用于没有task_id的参数；
var fastParam ={
    DB_ID:DB_ID,
    DEVICE_INFO:[]
};

//用于有task_id的参数；
var editParam ={
    TASK_ID:task_id,
    DEVICE_INFO:[]
};

//初始化树基本配置
var orgTreeOpts = {
    isShowFolder: true,
    multiple: true,
    dropdownWidth: '100%',
    search: {
        enable: true,              //是否启用搜索
        searchTreeNode: true,				//搜索参数 key|value为文本框的ID
        ignoreEmptySearchText: true,
        searchTextId: 'orgName',
        searchBtnId: 'search'
    },
    parentNodeRender:function(treeNode){
        if(treeNode.IS_ROLE == 'false'){
            treeNode.chkDisabled = true;
        }
        if(!treeNode.hasChildren){
            treeNode =  $.extend(treeNode, {
                text:'<span class="ico-passport-name">'+ treeNode.text+'</span>',
                isParent:false,
            });
        }
        return treeNode;
    }
};

$(function () {
    UI.control.init();
    initEvent();
    treeNode = UI.control.getControlById("structureTree");
    getDeviceId(task_id);
});

/*
 * 通过设备id 回填表单；
 * @param {str} task_id : 布控库的task_id
 */
function getDeviceId(task_id) {
    UI.control.remoteCall("face/hw/distaptchedTask/getDeviceIdByTaskId",{TASK_ID:task_id},function (resp) {
        var arr = treeNode.transformToArray(treeNode.getNodes());
        var idArr = resp.DATA;
        if(idArr.length>0){
            for(var i=0;i<arr.length;i++){
                for(var j=0;j<idArr.length;j++){
                    if(idArr[j].DEVICE_ID==arr[i].id){
                        hasChecked.push(idArr[j].DEVICE_ID);
                        treeNode.checkNode(arr[i], true, false);
                    }
                }
            }

            /*idArr.forEach(function (Aitem) {
                arr.forEach(function (Bitem) {
                    if(Aitem.DEVICE_ID==Bitem.id){
                        hasChecked.push(Aitem.DEVICE_ID);
                        treeNode.checkNode(Bitem, true, false);
                    }
                });
            });*/

        }
    })
}


function initEvent() {
    //卡口树全选
    $('#checkAll').click(function () {
        if($(this).is(":checked")&&!$('#structureTree_1_check').hasClass('checkbox_true_full')){
            $('#structureTree_1_check').trigger('click');
        };
        if(!$(this).is(":checked")&&$('#structureTree_1_check').hasClass('checkbox_true_full')){
            $('#structureTree_1_check').trigger('click');
        };
    });

    //保存
    $("#saveBtn").click(function () {
        var arr = treeNode.getCheckedSelectNodes(true);
        var isControl = false;
        var thisChecked = [];
        $.each(arr,function (i,o) {

            if(o.hasChildren){ //跳过非设备
                return true;
            };

            if(o.isHasSurveil&&$.inArray(o.id,hasChecked)==-1){//如果有布控并且不是该布控库的摄像机
                UI.util.alert(o.message,"warn");
                isControl = true;
                return false;
            };
            fastParam.DEVICE_INFO.push({
                DEVICE_ID:o.id,
                ACCESS_NETWORK:o.ACCESS_NETWORK
            });
            editParam.DEVICE_INFO.push({
                DEVICE_ID:o.id,
                ACCESS_NETWORK:o.ACCESS_NETWORK
            });
            thisChecked.push(o.id);
        });
        if(isControl){ //如果已经布控，就不处理；
            return;
        }
        if(thisChecked.length==0){
            UI.util.alert("没有被选中的设备");
            parent.UI.util.closeCommonWindow();
            return;
        }
        if(thisChecked.toString()==hasChecked.toString()){ //如果没有做修改就不去ajax
            UI.util.alert("任务没有修改");
            parent.UI.util.closeCommonWindow();
            return;
        };
        fastParam.DEVICE_INFO = JSON.stringify(fastParam.DEVICE_INFO);
        editParam.DEVICE_INFO = JSON.stringify(editParam.DEVICE_INFO);
        var param = task_id ?editParam:fastParam;
        var url = task_id ?"face/hw/distaptchedTask/edit":"face/hw/distaptchedTask/add";
        ExtendRemoteCall(url,param,function (resp) {
            UI.util.alert(resp.MESSAGE);
            UI.util.hideLoadingPanel();
            parent.UI.util.returnCommonWindow(resp);
            parent.UI.util.closeCommonWindow();
        });
    });

    //返回
    $(".btn-close").click(function () {
        parent.UI.util.closeCommonWindow();
    })

}
