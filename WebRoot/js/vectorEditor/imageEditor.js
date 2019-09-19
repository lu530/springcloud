var defaultWidth = 1015;
var defaultHeight = 500;

var imgWidth = 352; //cif坐标系
var imgHeight = 288;//cif坐标系
var curPoints = null;

var tempColor = '';  //颜色
var curMode = '';     //mode
var editor = null;         //编辑对象
var editorWidth =  parseInt($("#videoPlayer").css("width"));
var editorHeight = parseInt($("#videoPlayer").css("height"));

function clearEditor(){
	editor = null;
	$("#videoMapping").find("svg").remove();
}

//清空截图
function cleanEditorData(){
	if(!editor){
		return;
	}
	editor.deleteAll();
	
	if(sceShotParms && sceShotParms.length != 0){
		sceShotParms.length = 0;
	}
}
//rect
function initEditor(){
	if(editor){
		return;
	}
	
	//var capPicHW = getImgSize("capPicImg");
	editorWidth = parseInt($("#drawMapping").css("width"));
	editorHeight = parseInt($("#drawMapping").css("height"));
	
//	imgWidth = capPicHW[0];
//	imgHeight = capPicHW[1];
	editor = new VectorEditor(document.getElementById("drawMapping"), editorWidth, editorHeight, imgWidth, imgHeight);

    editor.set("stroke-width", 3);
    editor.set("fill-rule", "nonzero");
	editor.set("stroke", "#000");
	editor.set("fill", "#CFC");
    tempColor="red";
    editor.bindEvent("onDrawFinal",function(s, mode, points){
    	
    	if (mode == 'line+') {
    		var $path = $("#drawMapping svg").find($('path')[pathNum++]);
			$path.removeAttr("style");
    		$path.attr("marker-end", "url(#markerArrow)");
    	}
    	
    	setMode("");
    	if(points.length>0){
    		curPoints = points;
    		handleDrawResult(curPoints);
    	}
    	
    	$(".operation-control li").removeClass('active');
    });
}

function handleDrawResult(points){
	sceShotParms.length = 0;
	var imgPoints = points.imgPoints;
	var x = Number(imgPoints[0].x);
	var y = Number(imgPoints[0].y);
	var width = Number(imgPoints[2].x - x);
	var height = Number(imgPoints[2].y - y);
	sceShotParms.push([x,y,width,height]);
	
//	editor.deleteAll();
}

var isInitArrow = false, pathNum = 1;
function setMode(mode){
	editor.set("fill", "none");
	editor.set("stroke", tempColor);
	
	if (mode == 'line+') {
		if (!isInitArrow) {
    		var marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    		marker.setAttribute("id", "markerArrow");
    		marker.setAttribute("markerWidth", 8);
    		marker.setAttribute("markerHeight",  8);
    		marker.setAttribute("refx", 2);
    		marker.setAttribute("refy", 5);
    		marker.setAttribute("orient", "auto");
    	    
    	    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    	    path.setAttribute("d", "M2,2 L2,8 L8,5 L2,2");
    	    path.setAttribute("fill", "#F00");
    	    marker.appendChild(path);
    	    
    	    $("svg defs")[0].appendChild(marker);
    	    
    	    var html = $('#drawMapping svg defs').html();
  	      	$('#drawMapping svg defs').empty();
  	      	$('#drawMapping svg defs').html(html);
    	    
			isInitArrow = true;
		}
	}
	
    if (mode == "text") {
        editor.set("fill", tempColor);
        editor.set("stroke", "none");
        editor.prop.text = prompt("Text:", editor.prop.text);
    }

    editor.setMode(mode == 'selectp' ? 'select+' : mode);
}
/**
 * 获取图片的分辨率（实际大小）
 * @param objId
 * @returns {Array}
 */
function getImgSize(objId) {
	
	var imageEl = document.getElementById(objId);
	
	if (imageEl.naturalWidth) {//支持HTML5
		nWidth = imageEl.naturalWidth;
		nHeight = imageEl.naturalHeight;
		return new Array(nWidth, nHeight);
	} else {
		var i = new Image(); //新建一个图片对象
		if(imageEl.src.indexOf('?')>=0){
			i.src = imageEl.src.split('?')[0];
		}else{
			i.src = imageEl.src; //将图片的src属性赋值给新建图片对象的src 
		}
		return new Array(i.width, i.height); //返回图片的长宽像素 
	}
}

function setImgPath(fileName){
	fileName = fileName.replace(new RegExp("\\\\","g"),"/");
	fileName = fileName.replace(new RegExp("//","g"),"/");
	$("#videoMapping").css("background-image", "url('file:///" + fileName+"')");
	$("#videoMapping").css('filter','progid:DXImageTransform.Microsoft.AlphaImageLoader(src="file:///' + fileName+ '",sizingMethod="scale")');
	$("#capPicImg").attr("src", "file:///" + fileName);
	
	$("#videoPlayer").addClass("hide");
	$("#videoMapping").removeClass("hide");
	
}

function getScaleVal(o, f, r) {
	var val = Math.round((o/f)*r);
	val = val < 0 ? -val : val;
	return val;
}

function setRectVector(x,y,w,h){
	var shape = editor.draw.rect(x, y, w, h);
	shape.id = editor.generateUUID();
    shape.attr({
      "fill": "none", 
      "stroke": "#ff0000",
      "stroke-width": "3",
      "fill-opacity": "1",
      "stroke-opacity": "1"
    })
    editor.addShape(shape,true,true);
    editor.setMode("unselect");
}

//目标框选框回填
function drawSvg(x,y,w,h) {
	
	var rect;
	if($("#drawMapping").find("svg").size()>0) {
		setRectVector(x,y,w,h);
	}
}

//获取原图比例
function getOriginalImg(obj){
	var img = new Image();
	img.src = obj.fileUrl;
	
	var original = {};
	var imgHeigth = img.height;
	var imgWidth = img.width;
	
	/*var ratio = imgHeigth/obj.imgHeight;*/
	if ((imgWidth/imgHeigth) > (obj.imgwidth/obj.imgHeight)) {
		var ratio = imgHeigth/obj.imgHeight;
	}else{
		var ratio = imgWidth/obj.imgwidth;
	}
	
	original.x = obj.x * ratio;
	original.y = obj.y * ratio;
	original.pointWidth = obj.width * ratio;
	original.pointHeight = obj.height * ratio;
	original.imgUrl = obj.fileUrl;
	
	return original;
}
