/**
 * @Author lzh
 * @version 2017-08-09
 * @description 布控库列表；
 */
var queryParams = {};
var logParam = {};

$(function () {
    sequence(".list-node",UI.control.init);
    initEvent();
});

function initEvent() {

    //布控库查询
    searchStore()

    //点击布控库列表的处理
    $('body').on('click','.list-node',function (ev) {
        var event=(ev)?ev:window.event;
        var target= event.target;
        var $this = $(this);
        var id =target.className=='list-node'? $this.attr('task_id'):$this.closest('.list-node').attr('task_id');
        var url_id =target.className=='list-node'? $this.attr('url-id'):$this.closest('.list-node').attr('url-id');//用于判断不同的关联接口
        var V_TASK_ID =target.className=='list-node'? $this.attr('v_task_id'):$this.closest('.list-node').attr('v_task_id');//用于判断不同的关联接口
        var P_TASK_ID =target.className=='list-node'? $this.attr('p_task_id'):$this.closest('.list-node').attr('p_task_id');//用于判断不同的关联接口
        //点击删除按钮
        if($(target).hasClass('del-btn')){
            UI.util.confirm("是否删除",function(){
                var param = {
                    V_TASK_ID:V_TASK_ID,
                    TASK_ID:url_id,
                    P_TASK_ID:P_TASK_ID,
                    DB_ID:id
                };
                ExtendRemoteCall("face/hw/dispatchedLib/delete",param,function () {
                    UI.control.getControlById("dispatchedLibList").reloadData();
                    sequence(".list-node");
                },"删除成功");
            },function(){
                return true;
            });
        }else if($(target).hasClass('edit-btn')){   //点击编辑按钮
            eidtStore(target);
        }else if($(target).hasClass('videoBtn')){   //点击关联摄像机
            UI.util.showCommonWindow('/efacecloud/page/faceControlCopy/vidiconTrees.html?id='+id+'&task_id='+url_id,'关联摄像机',
                500,600,function(){
                    extendReload();
                });
        }
        //点击布控库
        initFrame(id);
        // event.stopPropagation();
    })

    //创建库
    $('#createdStore').click(function () {
        UI.util.showCommonWindow("/efacecloud/page/faceControlCopy/addStore.html?type=add", "创建布控库",
            500, 300, function(obj){
                sequence('.list-node',UI.control.getControlById("dispatchedLibList").reloadData())
        });
    })


}

/*
 * 编辑布控库的处理方法，获取布控库的参数，回填到弹出页面的表单中
 * @param {String} target : 元素类名
 */
function eidtStore(target) {
    var id= $(target).attr('task_id');
    var name = $(target).attr('name');
    var vpt = $(target).attr('vpt').slice(0,2);
    var level = $(target).attr('level');
    UI.util.showCommonWindow("/efacecloud/page/faceControlCopy/addStore.html?type=edit&id="+id+"&name="+name+"&vpt="+vpt+"&level="+level, "创建布控库",
        450, 300, function(obj){
            UI.control.getControlById("dispatchedLibList").reloadData();
        });
}


//布控库查询
function searchStore() {
    $("#settingSearch").click(function () {
        get();
    })
    $("#orgName").keyup(function (event) {
        var event = event || window.event;
        if(event.keyCode  == 13){
            get();
        }
    })
    function get() {
        var keyWords = $("#orgName").val();
        UI.control.getControlById("dispatchedLibList").reloadData(null,{KEYWORDS:keyWords,pageSize:7,pageNo:1});
    }
}


/*
 * 初始化 右边内容
 * @param {String} id : 布控库id
 * @param {String} src : 右边链接页面地址
 */
function initFrame(id,src){
    var id = id ||  $(".list-node").eq(0).attr('task_id');
    var src = src || '/efacecloud/page/faceControlCopy/faceStroePersonList.html?id=';
    $('#mainFrameContent').attr('src',src+id);
};


/**
 * 功能：同步当前选择库 入库数量
 * @param {int} value 改变后的数量||"add"||"minus"
 * @Author lzh
 */
function valueAddOne(value) {
    var $theOne = $('[class="list-node active"]').find(".storeCnt");
    if(value=="add"){
        $theOne.text(parseInt($theOne.text())+1);
    };
    if(value=='minus'){
        $theOne.text(parseInt($theOne.text())-1);
    };
    if(value&&value!=="add"&&value!=='minus'){
        $theOne.text(parseInt($theOne.text())-value);
    }
};



/**
 * 功能：获取当前页码和 选中库，reload 以后重选
 * @param {array}
 * @Author lzh
 */
function extendReload() {
    var num = $('[class="list-node active"]').index()-1;
    UI.control.getControlById("dispatchedLibList").reloadData(null,null,null,false);
    // sequence(".list-node",null,null,num);
    setTimeout(function () {
        $('[class="list-node"]').eq(num).click();
    },1000);
}

