/**
 * 新增车辆品牌回填表单
 * 	initCarDataByValue('品牌ID','子系列ID');
 * 新增三位数补齐0
 * makeUpZero
 * 
 */

$(function(){
	$('body').append(carHtmlTmpl);
	initCarEvents();
	initCarData('ABCD');
});
//三位数零位补齐方法
function makeUpZero(str){
    str ='000'+str;
    return str.substring(str.length-3,str.length);
}
function initCarEvents(){
	
	//车辆品牌的点击事件
	$('body').on('click','.carPlate label',function(){
		var $this = $(this),
			plateCode = $this.attr('platecode'),
			plateName = $this.html(),
			carPlateAttr = $this.parents('.carWrap').attr('carPlateAttr'),
			$carPlateInput = $this.parents('.carWrap').find('.carPlateInput'),
			plateCodeAttr = $carPlateInput.find('span').attr('platecode'),
			$carSeriesInput = $('[seriesAtrr="'+carPlateAttr+'"]').find('.carSeriesInput'),
			$carSeriesList = $('[seriesAtrr="'+carPlateAttr+'"]').find('.carSeriesList'),
			$ppdm = $this.parents('.carWrap').find('.ppdm');
			
		var seriesData = getZppDataByName(plateName);
		if( plateCodeAttr != plateCode){
			$carSeriesInput.html('请选择子系列车型').attr('disabled','disabled');
			if(seriesData && seriesData.length>0) {
				$carSeriesList.html(tmpl("carSeriesListTmpl",seriesData));
				$carSeriesInput.removeAttr('disabled');
			} else {
				$carSeriesInput.html("暂无子系列车型").attr('disabled','disabled');
			}
		}
		$('.carPlate label').removeClass('active');
		$this.addClass('active');
		$carPlateInput.find('span').html(plateName).attr('plateCode',plateCode);
		$ppdm.val(plateCode);
		$(".car-nav").attr("curCode",plateCode);
		$this.parents('.carWrap').removeClass('open');
		if( $carPlateInput.find('span').attr('platecode')){
			$('.carPlateInputBtn').removeClass('icon-car001').addClass('icon-cross2');
		}
	});
	
	//阻止下拉事件
	$('body').on('click','.car-dropdown-menu',function(){
		return false;
	});
	
	//子系列选择
	$('.carSeriesInput').click(function(){
		if( $(this).attr('disabled') == 'disabled'){
			return false;
		}
	});
	
	//车品牌子系列的点击事件
	$('body').on('click','.carSeriesList li',function(){
		var $this = $(this);
		var	carSeriesHtml = $this.find('a').html();
		if(!$this.hasClass('active')){
			$this.addClass('active');
		}else{
			$this.removeClass('active');
		}
		
	});
	
		
	//品牌字母切换展示
	$(".carPlateLetter").click(function(){
		$(this).addClass('active').siblings().removeClass('active');
		initCarData($(this).html());
		var curCode = $(".car-nav").attr("curcode");
		$("[platecode='"+curCode+"']").addClass("active");
	});
	
	//子系列选择 的确定按钮点击事件
	$('.carSeriesListBtn').click(function(){
		var arrCarS=[],zpps=[];
		var $this = $(this),
			$carSeriesList = $this.parents('.carWrap').find('.carSeriesList'),
			$carSeriesInput = $this.parents('.carWrap').find('.carSeriesInput'),
			$zppdm = $this.parents('.carWrap').find('.zppdm');
		if( $this.attr('disabled') == 'disabled'){
			return ;
		}
		$carSeriesList.find('li.active').each(function(){
			arrCarS.push($(this).find('a').html());
			zpps.push($(this).find('a').attr("carplatecode"));
		});
		
		var carString = arrCarS.join(",");
		
		$carSeriesInput.html(carString).attr('title',carString);
		$zppdm.val(zpps.join(","));
		$this.parents('.form-group-block').removeClass('open');
		$this.parents('.carWrap').removeClass('open');

	});
	
	//清除按钮
	$('.carPlateInputBtn').click(function(e){
		var $this = $(this);
		var carPlateAttr = $this.parents('.carWrap').attr('carPlateAttr'),
		$carPlateInput = $this.parents('.carWrap').find('.carPlateInput'),
		$carSeriesInput = $('[seriesAtrr="'+carPlateAttr+'"]').find('.carSeriesInput');
		if( $this.hasClass('icon-car001')){
			$carPlateInput.click();
		}else{
			$carPlateInput.find('span').html('请选择车辆品牌').removeAttr('platecode');
			initCarData('ABCD');
			$(".car-nav li:first").addClass("active").siblings().removeClass("active");
			$carSeriesInput.html('请选择子系列车型').attr('disabled','disabled');
			$this.addClass('icon-car001').removeClass('icon-cross2');
			$this.parents('.ccrWrap').removeClass('open');
			$this.parents('.carWrap').find('.ppdm').val("");
			$('[seriesAtrr="'+carPlateAttr+'"]').find('.zppdm').val("");
			$('.carPlate label').removeClass('active');
			$(".car-nav").attr("curcode", "");
			
		}
		event.stopPropagation();
	});
	
}

function initCarData(letter){
	var carData = brands;
	var initdata = {};
    for( var i = 0; i < letter.length;i++){
	   if(carData[letter[i]]){
		   initdata[letter[i]] = carData[letter[i]];
	   }
   }
	$(".carPlateList").html(tmpl("carPlateListTmpl",initdata));
}
function initCarDataByValue(brandId,seriesId){
	//补充0位
	brandId=makeUpZero(brandId);
	//遍历品牌
	var _carData = brands;
	var _group = ['ABCD','FGHJ','KLMN','OPQRST','WXYZ'];
	var _prop;
	var _tempStr="ABCD";
	var _tempIndex=0;
	var plateName;
	for(var prop in _carData){
		for(var i=0;i<_carData[prop].length;i++){
			if(brandId==_carData[prop][i].id){
				_prop=prop;
				plateName=_carData[prop][i].title;
				break;
			}
		}
	}
	for(var j=0;j<_group.length;j++){
		var _str=_group[j];
		if(_str.indexOf(_prop)>=0){
			_tempIndex=j;
			_tempStr=_str;
			break;
		}
	}
	initCarData(_tempStr);
	//设置品牌
	$.each($('.carPlateList label'),function(){
		if($(this).attr('platecode')==brandId){
			$('.carPlateInput').siblings('input').val(brandId);
			$('.carPlateInput').find('span').html(plateName);
			$('.carPlateList label').removeClass('active');
			$(this).addClass('active');
		}
	})
	$('.carPlateLetter').removeClass('active').eq(_tempIndex).addClass('active');
	$('.carPlateInputBtn').removeClass('icon-car001').addClass('icon-cross2');
	//获取子系列
		var seriesData = getZppDataByName(plateName);
		if(seriesData && seriesData.length>0) {
			$('.carSeriesList').html(tmpl("carSeriesListTmpl",seriesData));
			$('.car-series-input').removeAttr('disabled');
			if(!seriesId||seriesId=='') return;
			$.each($('.carSeriesList li a'),function(){
				if($(this).attr('carplatecode')==seriesId){
					$('.carSeriesList li').removeClass('active');
					$(this).parent('li').addClass('active');
					$('.car-series-input').html($(this).html());
					$('.car-series-input').siblings('input').val(seriesId);
				}
			})
		} else {
			$('.car-series-input').html("暂无子系列车型").attr('disabled','disabled');
		}
}

function sortCarFirstLetterFun(){
	var firstLetter ;
	var sortCarList = {'A':[],'B':[],'C':[],'D':[],'E':[],'F':[],'G':[],'H':[],
			'I':[],'J':[], 'K':[],'L':[],'M':[],'N':[],'O':[],'P':[],'Q':[],
			'R':[],'S':[],'T':[], 'U':[],'V':[],'W':[],'X':[],'Y':[],'Z':[]};
	for(var i in carPlate){ //遍历json对象的每个key/value对,p为key
		if(isChn(carPlate[i])){
			firstLetter = ConvertPinyin(carPlate[i]).substring(0,1);
		} else {
			firstLetter = carPlate[i].substring(0,1).toUpperCase();
		}
		var obj = {};
		obj[i] = carPlate[i];
		sortCarList[firstLetter].push(obj);
	}
	for(var L in sortCarList){
		if (!sortCarList[L].length){
			delete sortCarList[L];
		}
	}
	return sortCarList;
}

function getZppDataByName(name){
	var ret = {};
	UI.control.remoteCall('vehicle/common/getZppByName',{'name':name},function(resp){
		if(resp.ret) {
			ret = resp.ret;
		}
	});
	return ret;
}

var carHtmlTmpl = '<script type="text/x-tmpl" id="carPlateListTmpl">'+
				  '{% for(var i in o) { %}'+
				  '<dl class="attr-list">'+
				  '<dt class="attr-list-head" >{%= i %}</dt>'+
				  '<dd class="attr-list-body">'+
				  '{% for ( var j = 0; j < o[i].length; j++) { %}'+
//				  '{% for(var index in o[i][j]){ %}'+
//				  '<label plateCode="{%=index %}">{%= o[i][j][index] %}</label>'+
//				  '{% } %}'+
				  '<label plateCode="{%=o[i][j].id %}">{%= o[i][j].title %}</label>'+
				  '{% } %}'+
				  '</dd>'+
				  '</dl>'+
				  '{% } %}'+
				  '</script> '+
				  '<script type="text/x-tmpl" id="carSeriesListTmpl">'+
//				  '{% for ( var i = 0; i < o.length; i++) { %}'+
//				  '{% for(var j in o[i]){ %}'+
//				  '<li><a carplatecode = {%=j %}>{%= o[i][j] %}</a></li>'+
//				  '{% } %}'+
//				  '{% } %}'+
				  '{% for ( var i = 0; i < o.length; i++) { %}'+
				  '<li><a carplatecode = {%=o[i].ZPPDM %}>{%= o[i].CLPP %}</a></li>'+
				  '{% } %}'+
				  '</script>';
