/**
 * @Author lzh
 * @version 2017-08-09
 * @description 撤控布控-卡口树；
 */

var DB_ID = UI.util.getUrlParam("id");

var treeNode = null;

//用于关联的对象；
var obj ={
    DB_IDS:DB_ID,
    DEVICE_IDS:"",
    PAGE_TYPE:1
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
    getDeviceId(DB_ID);
})

/*
 * 通过设备id 回填表单；
 * @param {str} DB_ID : 布控库的id
 */
function getDeviceId(DB_ID) {
    UI.control.remoteCall("face/distaptchedTask/getTaskDeviceId",{DB_ID:DB_ID},function (resp) {
        var arr = treeNode.transformToArray(treeNode.getNodes());
        var idArr = resp.DATA;
        for(var i=0;i<arr.length;i++){
            for(var j=0;j<idArr.length;j++){
                if(idArr[j].DEVICE_ID==arr[i].id){
                    treeNode.checkNode(arr[i], true, false);
                }
            }
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
        $.each(arr,function (i,o) {
            obj.DEVICE_IDS+=o.id+",";
        })
        UI.util.showLoadingPanel()
        UI.control.remoteCall("face/distaptchedTask/add",obj,function (resp) {
            if (resp.CODE == 0) {
                UI.util.alert(resp.MESSAGE);
                UI.util.hideLoadingPanel();
                parent.UI.util.closeCommonWindow();
            }
        });
    });
    
    //返回
    $(".btn-close").click(function () {
        parent.UI.util.closeCommonWindow();
    })

}
