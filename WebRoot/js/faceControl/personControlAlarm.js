/**
 * @Author lzh
 * @version 2017-08-09
 * @description 实时布控告警；
 */
var int = null;  //保存定时器对象
var records = [];//用户缓存data数组；
var recordsTemp = null; //定时取数据定时器；
var firstTime = true; //判断是否第一次加载定时器

var queryParams = {
    BEGIN_TIME:"",
    DB_ID:'',
    DEVICE_IDS:'',
    END_TIME:'',
    KEYWORDS:'',
    THRESHOLD:'',
    pageNo:1,
    pageSize:5
};

$(function () {
    UI.control.init();
    initEvent();
    initDate();
    initWaterMark();
});

function initEvent(){
    //设置 3 秒更新一下 内容数组
    int = setInterval(initDate,3000);

    //每秒 渲染一个告警 进页面
    recordsTemp = setInterval(function () {
        if(records.length>0){
            var first = records.pop();
            $("#controlStoreList").prepend(tmpl("tableTemplate",first));
        };
        var node =  $("#controlStoreList .item-box");
        for(var i=0;i<node.length;i++){
            if(i>9){
                $(node[i]).remove();
            }
        }
        //如果没有告警 设置页面提示出 “暂无数据”
        if(node.length==0){
            $("#controlStoreList").addClass("nodata");
        }else {
            $("#controlStoreList").removeClass("nodata");
        }
    },1000);

    //点击详情
    $('body').on('click','.pic-detail',function () {
    	var $this = $(this),
    		id = $this.attr("alarm-id"),
    		level = $this.attr("alarm-level"),
    		objectId = $this.attr("objectid"),
    		curTime = $this.attr("curtime");
        UI.util.showCommonWindow("/efacecloud/page/library/alarmDetails.html?OBJECT_ID="+objectId+"&curTime="+curTime+"&ALARM_ID="+id+"&level="+level, '实时布控告警详情',
        		880, 553, function(obj){
            });
    });

    //点击告警 在地图中显示 照片
    $('body').on("click",".item-box",function () {
        var longitude = $(this).attr("longitude");
        var latitude = $(this).attr("latitude");
        var time = $(this).attr("time");
        var pic_src = $(this).attr("pic_src");
        showDialogOnMap("人脸布控实时告警",pic_src,longitude,latitude,time);
    });

}

/*
 * 更新records
 * @val {arr} records : 缓存队列数组
 */
function initDate() {
    UI.control.remoteCall('face/dispatchedAlarm/getData',queryParams,function (resp) {
        var data = resp.data.records;
        if(data.length>0){
            queryParams.BEGIN_TIME = data[0].ALARM_TIME;
            records = data.concat(records);
        };
        if(firstTime){ //第一次申请之后就改为每次申请一个
            firstTime = false;
            queryParams.pageSize = 1;
        };
    })
}


/**
 * 判断背景颜色,返回颜色类名
 * @param {String} level : 告警等级
 * @return {str} 颜色类
 */
function renderColor(level) {
    switch (level){
        case 1:return "color-red"; break;
        case 2:return "color-yellow" ;break;
        case 3:return "color-gray" ;break;
    }
}

/**
 * 地图展示气泡图片
 * @param {String} title : 气泡的title
 * @param {String} url : 图片的src
 * @param {int} x : 纬度
 * @param {int} y : 经度
 * @param {String} jgsj : 气泡显示的时间
 */
function showDialogOnMap(title,url,x,y,jgsj){
    var map = parent.SuntekMap.getMap();
    map.openInfoWindow(
        {x:x,y:y},						    // 点线面的esriJSON格式
        {txmc1:url,jgsj:jgsj},					// 气泡属性，如摄像机名称,ID等，也可以传null
        {
            frameTitle:title,					// 气泡标题
            frameSrc:"/gis/page/infowin/ecarsPicInfo.html"	                    // 气泡内容URL地址，可以是html,jpg,png,gif
        });

}