var type = UI.util.getUrlParam("pageType");//判断页面的类型
var data = null;
$(document).ready(function(){
	UI.control.init();
	renderDetailInfo();
	initEvents();
	pageTopFixed();
})

function initEvents(){
	// 轨迹查看
	$('#gjSearch').click(function(){
		var trackData = [];
		if(!$(this).hasClass("disabled")){
			var param = {};
			var inputCheck = $('.gangs-checkbox:checked'),
				objArr = [];
	
			if (inputCheck.length < 1) {
				UI.util.alert('请勾选需要分析的数据！', 'warn');
				return '';
			}
			
			for (var i = 0; i < inputCheck.length; i++) {
				var index = $(inputCheck[i]).attr("index");
				var _data = data[index];
				trackData.push(_data);
			}
			
			if (inputCheck.length < 2) {
				UI.util.alert('至少勾选两条记录！', 'warn');
				return false;
			}
			// 数据处理: 按照时间正序排列
			trackData = trackData.sort(function(item1, item2){
				return new Date(item1.TIME).getTime() - new Date(item2.TIME).getTime();
			})
			var curData = [];
			console.log(trackData)
			$.each(trackData,function(i,n){
				var obj = {};
				obj = n;
				obj.X = n.X;
				obj.Y = n.Y;
				obj.TIME = n.TIME;
				obj.jgsj = n.TIME;
				obj.DEVICE_NAME = n.ADDR;
				curData.push(obj);
			});
			parent.parent.showLeftResult('/efacecloud/page/technicalStation/persontogetherResultList.html');
			parent.parent.rightMainFrameOut('hide');
			parent.trackArr = curData;
		}
		
	})
	$("body").on('click','.list-node .checkInput',function(event){
		var $this = $(this);
		var $listNodeWrap = $this.parents("list-node-wrap");
		if($this.is(":checked")){
			$listNodeWrap.addClass("active");
		}else{
			$listNodeWrap.removeClass("active");
		}
		if($(".gangs-checkbox:checked").length>1){
        	$("#gjSearch").removeClass("disabled");
        }else{
        	$("#gjSearch").addClass("disabled");
        }
		
		if($("#faceDetail .gangs-checkbox").length == $(".gangs-checkbox:checked").length){
        	$("#checkAll").prop("checked",true);
        }else{
        	$("#checkAll").prop("checked",false);
        }
		event.stopPropagation();
	});

	$("body").on('click','.list-node',function(event){
		var $this = $(this);
		var $input = $this.find(".checkInput");
		var $parent = $this.parent();
		if($input.length){
			if($input.is(":checked")){
				$parent.removeClass("active");
				$input.attr("checked",false);
			}else{
				$parent.addClass("active");
				$input.attr("checked","checked");
			}
			if($(".gangs-checkbox:checked").length>1){
	        	$("#gjSearch").removeClass("disabled");
	        }else{
	        	$("#gjSearch").addClass("disabled");
	        }
			
			if($("#faceDetail .gangs-checkbox").length == $(".gangs-checkbox:checked").length){
            	$("#checkAll").prop("checked",true);
            }else{
            	$("#checkAll").prop("checked",false);
            }
		}
//		return false;
	});
	
	// 全选
	$("#checkAll").click(function(){
		var checked = $(this).prop("checked");
		
		$('#faceDetail .gangs-checkbox').prop("checked",checked);
		
		if(checked){
			$("#gjSearch").removeClass("disabled");
			$("#faceDetail .list-node-wrap").addClass("active");
		}else{
			$("#gjSearch").addClass("disabled");
			$("#faceDetail .list-node-wrap").removeClass("active");
		}
	});

    //轨迹分析
    $("body").on("click",".trajectory-search",function(e){
        openWindowPopup('track',$(this).attr("url"));
        e.stopPropagation();
    });

    //身份核查
    $("body").on("click",".verification-search",function(e){
        openWindowPopup('identity',$(this).attr("url"));
        e.stopPropagation()
    });


	
	if( type == 'frequent' ){
		$('.import').removeClass("hide");
	}
	UI.util.debug('type');
	UI.util.debug(type);  
	
	//关闭
	$('#backBtn').click(function(){
			parent.hideForm();
	});
	
	$('body').on('click','.video-btn',function (){
		var time = $(this).attr("time");
		var deviceId = $(this).attr("deviceId");
		var beginTime = getLimitSec(time, -30);
		var endTime = getLimitSec(time, 30);
		var openUrl = "http://"+window.location.host+"/connectplus/page/common/videoRecordWindowCache.html?" +
				"videoIds="+deviceId+"&beginTime="+beginTime+"&endTime="+endTime+"&btnType=1";
		UI.util.showCommonWindow(openUrl, "抓拍历史视频", 960, 650, function(){});
		
		/*UI.control.remoteCall("cs/portraitTracking/getPlayUrl", {
			deviceId: deviceId,
			deviceType: 'camera'
		}, function (resp){
			var result = resp.result;
			var beginTime = getLimitTime(time, -1);
			var endTime = getLimitTime(time, 1);
			var videoFlag = result.DEVICE_CODE;
			var videoName = result.DEVICE_NAME;
			var openUrl = "http://"+window.location.host+"/videoexplorer/page/servies/videoRecordWindow.html?videoFlag="+videoFlag
				+"&videoName="+videoName+"&beginTime="+beginTime+"&endTime="+endTime;
			UI.util.showCommonWindow(openUrl, "抓拍历史视频", 960, 650, function(){
				
			});
		});*/
	});
	
	$("#btnExport").click(function(){
		var url=UI.control.getRemoteCallUrl("personFrequentAccess/detailReport/download?xxbhs="+parent.xxbhs);
		$("#logExport").attr("src",url);
		UI.util.debug('url');
		UI.util.debug(url);
	});
	
}

function renderDetailInfo(){
	var idList = parent.xxbhs;
	UI.control.remoteCall('technicalTactics/frequencyAccess/getMsgByIds', {IDS:idList}, function(resp){
		/*if(resp.status=="ok"){*/
			resp =data= resp.DATA;
			$("#faceDetail").html(tmpl("faceDetailTmpl", resp));
			$('[attrimg="zoom"]').lazyload({effect: "fadeIn",container:$("#faceDetail")});
		
	});
}