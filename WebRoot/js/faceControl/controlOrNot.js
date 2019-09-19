/**
 * @Author lzh
 * @version 2017-08-09
 * @description 布控撤控左侧页；
 */


//初始化树基本配置
var orgTreeOpts = {
    isShowFolder: true,
    multiple: false,
    dropdownWidth: '100%',
    search: {
        enable: true,              //是否启用搜索
        searchTreeNode: true,				//搜索参数 key|value为文本框的ID
        ignoreEmptySearchText: true,
        searchTextId: 'orgName',
        searchBtnId: 'search'
    },
    parentNodeRender:function(treeNode){  //设置最后一层的图标为摄像机
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
    sequence(".list-node",UI.control.init);
    UI.util.tabs();
    initEvent();
})


function initEvent() {

    //选项切换
    $(".view-type li").click(function () {
        var index = $(this).index();
        if(index==1){
            initFrame('','/efacecloud/page/faceControl/controlOrNotList.html');
        }else {
            sequence(".list-node",UI.control.init);
        }
    });
    dbEvent();
    initTree();
    // controlType();
}

//布控库点击事件
function dbEvent() {
    $('body').on('click','.list-node',function (ev) {
        var event=(ev)?ev:window.event;
        var target= event.target;
        if($(target).hasClass('del-btn')){
            UI.util.confirm("是否删除",function(){
                $(target).closest('.list-node').remove();
                UI.util.alert("删除成功");
            },function(){
                return true;
            });
            return;
        }else
        if($(target).hasClass('edit-btn')){
            return;
        }else {
            var id =target.className=='list-node'? $(this).attr('task_id'):$(this).closest('.list-node').attr('task_id');
            initFrame(id);
        }
        event.stopPropagation();
    })
}

//点击树的事件
function initTree(){
    var orgTree = UI.control.getControlById('structureTree');
    orgTree.bindEvent('onClick', function(event, treeId, treeNode) {
        var id = parseInt(treeNode.id);
        if( /^\d{20}$/.test(id)){
            var title = $(treeNode.text).text();
            $('#mainFrameContent').attr('src',"/efacecloud/page/faceControl/controlOrNotList.html"+"?id="+id+"&title="+title);
        }else {
            return;
        }
    });
}

//右边显示处理
function initFrame(id,src){
    var src = src || '/efacecloud/page/faceControl/vidiconTrees.html?id=';
    $('#mainFrameContent').attr('src',src+id);
}