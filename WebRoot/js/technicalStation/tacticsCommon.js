var regionDeviceList = null;
$(function(){
	initMapEvent();
});

function initMapEvent(){
	//点击地图框选
	$('.form-con').on('click','[map="mapBtn"],.device-select',function(e){
		var $this = $(this),
		name = $this.attr("name"),
		$parent = $this.parent(),
		layerName = $parent.parent().attr("layername"),		
		curIndex = $this.closest("fieldset").index() + 1;
		
		if(regionDeviceList){
			regionDeviceList.curRegion=curIndex;
		}
		
		if($parent.hasClass("active") && name != 'showKKTree'){
			$parent.removeClass("active");
			/*selectKkbhForMap('delete');*/
		}else{
			$parent.siblings().removeClass("active");
			if( $this.attr('name')!='delete' ){ //删除按钮不给active状态
				$this.parent().addClass('active');
			}
			
			if($parent.parent().attr("isShowLayer") == 'true'){
				$parent.parent().attr("isShowLayer",false);
				selectKkbhForMap(name,layerName,false,curIndex);
			}else{
				$parent.parent().attr("isShowLayer",true);
				selectKkbhForMap(name,layerName,true,curIndex);
			}
		}
	});
	
	//卡口列表项移除按钮
	$('.form-con').on('click','.delete-bayonet-item',function(){
		var $this = $(this),
			curIndex = $this.parents("table").attr("index")||'',
			selectedStr = $("#selectedBayonet"+curIndex).val(),
			selectedArr = selectedStr.split(","),
			curDeviceId = $this.parents("tr").attr("deviceid"),
			index = selectedArr.indexOf(curDeviceId),
			deviceName = $("#bayonetList"+curIndex).attr("devicename")||'',
			deviceNameArr = deviceName.split(","),
			orgCode = $("#bayonetList"+curIndex).attr("orgcode")||'',
			orgCodeArr = orgCode.split(",");
		
		if(regionDeviceList){
			regionDeviceList.curRegion=curIndex;
			
			if($this.closest('tbody').find('tr').length<=1){
				$("fieldset").eq(curIndex-1).removeAttr("hasarea");
			}
		}
		
		selectedArr.splice(index,1);
		deviceNameArr.splice(index,1);
		orgCodeArr.splice(index,1);
		$('#selectedBayonet'+curIndex).val(selectedArr.join(','));
		$('#bayonetList'+curIndex).attr("devicename",deviceNameArr.join(','));
		$('#bayonetList'+curIndex).attr("orgcode",orgCodeArr.join(','));
		
		checkFieldList($this);
		$this.closest('tr').remove();
		
		if(regionDeviceList && regionDeviceList["region"+curIndex]){
			var mapIndex = regionDeviceList["region"+curIndex].indexOf(curDeviceId);
			regionDeviceList["regionMapData"+curIndex].splice(mapIndex,1);
			regionDeviceList["regionShape"+curIndex].remove();//移除区域
			if(mapIndex > 0){
				getRegionDeviceList(regionDeviceList["regionMapData"+curIndex]);
			}
		}
	});
	
}

//地图卡口选择
function selectKkbhForMap(type,layerName,isShowLayer,curIndex){
	if(isShowLayer){
		parent.showLayer(parent.UI.map.layerNameMap[layerName]);
	}
	
	if(type == 'showKKTree'){
		return false;
	}
	if(type == 'delete'){
		var index = curIndex?curIndex:'';
		$("#deviceNames"+index).html('').attr('title','').attr("orgcode",'');
		$("#deviceIds"+index).val('');
		$("#faceDetect"+index).val('');
		$("#deviceIdInt"+index).val("");
		
		$("#bayonetList"+index).empty();
		$("#selectedBayonet"+index).val('');
		$("#bayonetList"+index).attr("orgcode","");
		$("#bayonetList"+index).attr("devicename","");
		if(curIndex && regionDeviceList && regionDeviceList["regionShape"+curIndex]){
			regionDeviceList["regionShape"+curIndex].remove();
			
			delete regionDeviceList["region"+curIndex];
			delete regionDeviceList["regionMapData"+curIndex];
			delete regionDeviceList["regionShape"+curIndex];
			regionDeviceList.regionLen--;
			$("fieldset").eq(curIndex-1).removeAttr("hasarea");
		}
		addDrowdownDeviceList({
			deviceId:'',
			deviceName:'',
			deviceNameList:$("#deviceNameList"+index),
			dropdownListText:$(".dropdown-list-text"+index)
		});
	}
	parent.UI.map.drawQuery(type, function(resp){
		if(resp.length>0){
			var deviceNameArr = [],deviceIdArr = [],deviceIdIntArr = [],orgCodeArr = [];
			var deviceInfo={};
			
			$.each(resp,function(i,n){
				deviceNameArr.push(n.properties.DEVICE_NAME);
				deviceIdArr.push(n.properties.DEVICE_ID);
				deviceIdIntArr.push(n.properties.DEVICE_ID_INT);
				orgCodeArr.push(n.properties.ORG_CODE);
			});
			deviceInfo.deviceName = deviceNameArr.join(",");
			deviceInfo.deviceId = deviceIdArr.join(",");
			deviceInfo.deviceIdInt = deviceIdIntArr.join(",");
			deviceInfo.orgCode = orgCodeArr.join(",");
			
			initDeviceListData(deviceInfo,curIndex);
			
			if(curIndex){
				parent.UI.map.drawQuery("delete");//清除地图框选
				$("fieldset").eq(curIndex-1).attr("hasarea",true);
			}
			if(regionDeviceList){
				regionDeviceList.callback(resp);
			}
		}
	});
}

//技战法页面加载显示前20条
function renderTwenty(index){
	if(index>20){
		return "hide";
	}
}

//技战法分页大小
var pageSize = 20, currentPage = 1, totalPage = 1;
function renderPages(size,pageSize){
	if(size>pageSize){
		$("#totalSize").html(size);
		$("#pageSize").html(pageSize);
	}else{
		$("#moreDiv").hide();
	}
}
//技战法分页功能
function initTechnicalPage(sums,$pagerWrap){
	totalPage = Math.ceil(sums / pageSize);
	var opts = {
		$pagerWrap:$pagerWrap,
		currentPage:currentPage,
		totalPage:totalPage,
		totalNum:sums,
	}
	
	var $pager = $pagerWrap.find("[listview-page]");
	$pager.find("[listview-prev-btn]").each(function(){
		var $this = $(this);
		$this.attr("totalNum",sums);
		$this.click(function(){
				if(!$this.hasClass("disable")){
					opts.totalNum = $this.attr("totalNum");
					opts.currentPage = $pagerWrap.find("li:not('.hide')").attr("page");
					opts.currentPage--;
					onPageChangeBtn(opts);
					var $checkAll = $(this).parents("dl").find(".check-all");
					if($checkAll.prop("checked")){
						var $checkAll = $(this).parents("dl").find(".check-all");
						pageTracksOnMap($checkAll,$checkAll.attr("name"));
					}
				}
				return false;
			});
  	});
	
	$pager.find("[listview-next-btn]").each(function(){
		var $this = $(this);
		$this.attr("totalNum",sums);
		$this.click(function(){
				if(!$this.hasClass("disable")){
					opts.totalNum = $this.attr("totalNum");
					opts.currentPage = $pagerWrap.find("li:not('.hide')").attr("page");
					opts.currentPage++;
					onPageChangeBtn(opts);
					var $checkAll = $(this).parents("dl").find(".check-all");
					if($checkAll.prop("checked")){
						var $checkAll = $(this).parents("dl").find(".check-all");
						pageTracksOnMap($checkAll,$checkAll.attr("name"));
					}
				}
				return false;
			});
	});	
	
	onPageChangeBtn(opts);
}

function onPageChangeBtn(opts){
	var element = opts.$pagerWrap,
		currentPage = opts.currentPage,
		totalPage = opts.totalPage,
		totalNum = opts.totalNum;
	
	element.find('[page]').addClass('hide');
	element.find('[page="'+currentPage+'"]').removeClass('hide');
	
	if(currentPage > 1) {
		element.find('[listview-prev-btn]').removeClass("disable");
	} else {
		element.find('[listview-prev-btn]').addClass("disable");
	}
	if(currentPage == totalPage) {
		element.find('[listview-next-btn]').addClass("disable");
	} else {
		element.find('[listview-next-btn]').removeClass("disable");
	}
	element.find("[listview-total]").html("" + totalPage);
	element.find("[listview-current]").html("" + currentPage);
	element.find("[listview-counts]").html("" + totalNum);
}

function renderPageIndex(index){
	return index % pageSize + 1;
}

function renderCurrentPage(index){
	return parseInt((index-1)/pageSize)+1;
}

/****************vehicleConstant.js代码*************************/
function getLimitDate(dateStr, dates){
	var date = newDateAndTime(dateStr);
	date.setDate(date.getDate() + dates);
	return date.format('yyyy-MM-dd HH:mm:ss');
}
//解决IE下new Date()不能传参数问题
function newDateAndTime(dateStr){
	var ds = dateStr.split(" ")[0].split("-");
	var ts = dateStr.split(" ")[1].split(":");
	var date = new Date();
	date.setFullYear(ds[0],ds[1] - 1, ds[2]);
	date.setHours(ts[0], ts[1], ts[2], 0);
	return date;
}