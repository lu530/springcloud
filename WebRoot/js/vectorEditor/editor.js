var mobilesafari = /AppleWebKit.*Mobile/.test(navigator.userAgent);
function VectorEditor(elem, width, height, imgWidth, imgHeight){
  if (typeof(Raphael) != "function") { //check for the renderer
      return alert("Error! Renderer is Missing!"); //if renderer isn't there, return false;
  }
 // alert(Raphael.type);
  this.container = elem
  this.draw = Raphael(elem, width, height);
  this.draw.editor = this;
  
  this.onHitXY = [0,0]
  this.offsetXY = [0,0]
  this.tmpXY = [0,0]

  //cant think of any better way to do it
  this.prop = {
    "src": "http://upload.wikimedia.org/wikipedia/commons/a/a5/ComplexSinInATimeAxe.gif",
    "stroke-width": 1,
    "stroke": "#000000",
    "fill": "#ff0000",
    "stroke-opacity": 1,
    "fill-opacity": 1,
    "text": "Text"
  }
     
  this.mode = "select";
  this.selectbox = null;
  this.selected = []
  
  this.finalFlag = "";
  this.action = "";
  
  this.selectadd = false;
  
  this.shapes = []
  this.trackers = []
  
  this.listeners = {};
  
  
  var draw = this.draw;
  
  
  //event bind zwl
  this.events = {};
  
  this.trigger = function(w) {
		var y = this.events[w.toLowerCase()], x, v;
		if (y) {
			v = Array.prototype.slice.call(arguments);
			v[0] = this;
			for (x = 0; x < y.length; x++) {
				if (y[x].func.apply(y[x].scope, v) === false) {
					return false
				}
			}
		}
		return true
	};
	this.bindEvent = function(v, x, w) {
		var y;
		v = v.toLowerCase();
		y = this.events[v] || [];
		y.push({
			func : x,
			scope : w || this
		});
		this.events[v] = y
	};
  
  //event bind end
  
  
  //THE FOLLOWING LINES ARE MOSTLY POINTLESS!
  
  function offset(){
    //technically, vX.pos works too and I should probably use whatever I built here, but I have jQuery instead.
    if(window.Ext)return Ext.get(elem).getXY();
    if(window.jQuery){
      var pos = jQuery(elem).offset();
      return [pos.left, pos.top];
    }
    if(window.vx){ //vx support
      var pos = vx.pos(elem);
      return [pos.l, pos.t]
    }
    return [0,0]
  }
  
  function bind(fn, scope){
    return function(){return fn.apply(scope, array(arguments))}
  }

  function array(a){
    for(var b=a.length,c=[];b--;)c.push(a[b]);
    return c;
  }
  //目前只支持 line path polygon rect
  this.getPointsListByMode = function(mode, $select){
	 var points = {};
	 if(mode == "rect"){
		 if(Raphael.type == "SVG"){//IE10 chrome
			 var $rect = $(elem).find($('rect')[$(elem).find('rect').size()-1]);
			 points = getRectPoints($rect.attr("x"), $rect.attr("y"), $rect.attr("width"), $rect.attr("height"));
		 }else{
			 var $svgElem =  $(this.draw.toSVG().replace(/svg/g,"div"));//暂时没想法其他办法，只能使用此土方式 zwl
			 var $rect = $svgElem.find('rect').last();
			 points = getRectPoints($rect.attr("x"), $rect.attr("y"), $rect.attr("width"), $rect.attr("height"));
		 }
		
	 }
	 if(mode == "path" || mode=="line" || mode=="line+" || mode=="polygon"){
		 if(Raphael.type == "SVG"){
			 var $path = $(elem).find($('path')[$(elem).find('path').size()-1]);
			 var d = $path.attr("d").replace("M","").replace(/\ L /g,"L").replace(/\s/g,",");
			 points = getPathPoints(d, mode);
			 
		 }else{
			 var $svgElem =  $(this.draw.toSVG().replace(/svg/g,"div"));
			 var $path = $svgElem.find('path').last();
			 var d = $path.attr("d").replace("M","").replace(/\ L /g,"L").replace(/\s/g,",");
			 points = getPathPoints(d, mode);
		 }
	 }
	 return points;
  }
  
  function getRectPoints(x, y, w, h){
		var x1 = Math.round(parseInt(x)) + Math.round(parseInt(w));
		var y1 = Math.round(parseInt(y)) + Math.round(parseInt(h));
		var divPoints = [{ x:x, y:y },{ x:x, y:y1 },{ x:x1, y:y1 },{ x:x1, y:y }];
		var points = { divPoints:divPoints };
		if(imgWidth && imgHeight){
			x = getScaleVal(imgWidth, width, x);
			y = getScaleVal(imgHeight, height, y);
			x1 = getScaleVal(imgWidth, width, x1);
			y1 = getScaleVal(imgHeight, height, y1);
			var imgPoints = [{x:x, y:y},{x:x, y:y1},{x:x1, y:y1},{x:x1, y:y}];
			points.imgPoints = imgPoints;
			var pointXml =  "<Point X=\""+x+"\" Y=\""+y+"\"/>" +
			"<Point X=\""+x+"\" Y=\""+y1+"\"/>" +
			"<Point X=\""+x1+"\" Y=\""+y1+"\"/>" +
			"<Point X=\""+x1+"\" Y=\""+y+"\"/>";
			points.pointXml = pointXml;
		}
		return points;
	}
  
  	function getPathPoints(d, mode){
  		var pointArr = d.split("L");
  		var divPoints = [];
  		var imgPoints = [];
  		var pointXml = "";
  		var tempX = -1;
  		var tempY = -1;
  		for(var i =0 ;i<pointArr.length; i++){
  			var point = pointArr[i];
  			var xy =  point.split(",");
  			var x = xy.length==2?xy[0]:xy[1];
  			var y = xy.length==2?xy[1]:xy[2];
  			
  			if(tempX == x && tempY == y){//去除重复点坐标
  				continue;
  			}
  			tempX = x;
  			tempY = y;
  			divPoints.push({ x:x, y:y });
  			if(imgWidth && imgHeight){
  				x = getScaleVal(imgWidth, width, x);
  				y = getScaleVal(imgHeight, height, y);
  				imgPoints.push({ x:x, y:y });
  				pointXml +="<Point X=\""+x+"\" Y=\""+y+"\"/>";
  			}
  		}
  		var points = {divPoints:divPoints};
  		if(imgWidth && imgHeight){
  			points.imgPoints = imgPoints;
  			points.pointXml = pointXml;
  		}
		return points;
	}

	function getScaleVal(o, f, r) {
		var val = Math.round((o/f)*r);
		val = val < 0 ? -val : val;
		return val;
	}
  if(window.Ext){
    Ext.get(elem).on("mousedown",function(event){
      event.preventDefault()
      
      if(event.button == 2){
        //this.lastmode = this.mode;
        this.setMode("select") //tempselect
      }
      if(event.button == 1){
        return;
      }
      this.onMouseDown(event.getPageX() - offset()[0], event.getPageY() - offset()[1], event.getTarget())
      return false;
    }, this);
    Ext.get(elem).on("mousemove",function(event){
      event.preventDefault()
      this.onMouseMove(event.getPageX()  - offset()[0], event.getPageY()- offset()[1], event.getTarget())
      return false;
    }, this)
    Ext.get(elem).on("mouseup",function(event){
      event.preventDefault();
      this.onMouseUp(event.getPageX() - offset()[0], event.getPageY() - offset()[1], event.getTarget())
      return false;
    }, this)
    Ext.get(elem).on("dblclick",function(event){
      event.preventDefault();
      this.onDblClick(event.getPageX() - offset()[0], event.getPageY()- offset()[1], event.getTarget())
      return false;
    }, this)
  }else if(window.jQuery){
    $(elem).mousedown(bind(function(event){
      event.preventDefault()
      
      if(event.button == 2){
        //this.lastmode = this.mode;
        this.setMode("select") //tempselect
      }
      this.onMouseDown(event.clientX - offset()[0], event.clientY - offset()[1], event.target)
    }, this));
    $(elem).mousemove(bind(function(event){
      event.preventDefault()
      this.onMouseMove(event.clientX - offset()[0], event.clientY - offset()[1], event.target)
    }, this));
    $(elem).mouseup(bind(function(event){
      event.preventDefault()
      this.onMouseUp(event.clientX - offset()[0], event.clientY - offset()[1], event.target)
    }, this));
    $(elem).dblclick(bind(function(event){
      event.preventDefault()
      this.onDblClick(event.clientX - offset()[0], event.clientY - offset()[1], event.target)
    }, this));
    if(mobilesafari){
    elem.addEventListener("touchstart", bind(function(event){
      event.preventDefault()
      this.onMouseDown(event.touches[0].pageX - offset()[0], event.touches[0].pageY - offset()[1], event.target)
    }, this) ,false)
    
    elem.addEventListener("touchmove", bind(function(event){
      event.preventDefault()
      this.onMouseMove(event.touches[0].pageX - offset()[0], event.touches[0].pageY - offset()[1], event.target)
    }, this), false);
    elem.addEventListener("touchend", bind(function(event){
      event.preventDefault()
      this.onMouseUp(0, 0, event.target)
    }, this), false);
	elem.addEventListener("selectstart", function(event){
      event.preventDefault()
	  return false
    }, false);
   }
  }
}

VectorEditor.prototype.setMode = function(mode){
  this.fire("setmode",mode)
  if(mode == "select+"){
    this.mode = "select";
    this.selectadd = true;
    this.unselect()
  }else if(mode == "select"){
    this.mode = mode;
    this.unselect()
    this.selectadd = false;
  }else if(mode == "delete"){
    this.deleteSelection();
    this.mode = mode;
  }else{
    this.unselect()
    this.mode = mode;
  }
}

VectorEditor.prototype.on = function(event, callback){
  if(!this.listeners[event]){
    this.listeners[event] = []
  }
  
  if(this.in_array(callback,this.listeners[event])  ==  -1){
    this.listeners[event].push(callback);
  }
}


VectorEditor.prototype.returnRotatedPoint = function(x,y,cx,cy,a){
    // http://mathforum.org/library/drmath/view/63184.html
    
    // radius using distance formula
    var r = Math.sqrt((x-cx)*(x-cx) + (y-cy)*(y-cy));
    // initial angle in relation to center
    var iA = Math.atan2((y-cy),(x-cx)) * (180/Math.PI);

    var nx = r * Math.cos((a + iA)/(180/Math.PI));
    var ny = r * Math.sin((a + iA)/(180/Math.PI));

    return [cx+nx,cy+ny];
}

VectorEditor.prototype.fire = function(event){
  if(this.listeners[event]){
    for(var i = 0; i < this.listeners[event].length; i++){
      if(this.listeners[event][i].apply(this, arguments)===false){
        return false;
      }
    }
  }
}

VectorEditor.prototype.un = function(event, callback){
  if(!this.listeners[event])return;
  var index = 0;
  while((index = this.in_array(callback,this.listeners[event])) != -1){
    this.listeners[event].splice(index,1);
  }
}

//from the vXJS JS Library
VectorEditor.prototype.in_array = function(v,a){
  for(var i=a.length;i--&&a[i]!=v;);
  return i
}

//from vX JS, is it at all strange that I'm using my own work?
VectorEditor.prototype.array_remove = function(e, o){
  var x=this.in_array(e,o);
  x!=-1?o.splice(x,1):0
}


VectorEditor.prototype.is_selected = function(shape){
  return this.in_array(shape, this.selected) != -1;
}

VectorEditor.prototype.set_attr = function(){
  for(var i = 0; i < this.selected.length; i++){
    this.selected[i].attr.apply(this.selected[i], arguments)
  }
}

VectorEditor.prototype.set = function(name, value){
  this.prop[name] = value;
  this.set_attr(name, value);
}

VectorEditor.prototype.onMouseDown = function(x, y, target){
  this.fire("mousedown")
  this.tmpXY = this.onHitXY = [x,y]
  
  if(this.mode == "select" && !this.selectbox){

    var shape_object = null
    if(target.shape_object){
      shape_object = target.shape_object
    }else if(target.parentNode.shape_object){
      shape_object = target.parentNode.shape_object
    }else if(!target.is_tracker){
      if(!this.selectadd) this.unselect();
      this.selectbox = this.draw.rect(x, y, 0, 0)
        .attr({"fill-opacity": 0.15, 
              "stroke-opacity": 0.5, 
              "fill": "#007fff", //mah fav kolur!
              "stroke": "#007fff"});
      return; 
    }else{
      return; //die trackers die!
    }
    
    
    if(this.selectadd){
      this.selectAdd(shape_object);
      this.action = "move";
    }else if(!this.is_selected(shape_object)){
      this.select(shape_object);
      this.action = "move";
    }else{
      this.action = "move";
    }
    this.offsetXY = [shape_object.attr("x") - x,shape_object.attr("y") - y]
    
  }else if(this.mode == "delete" && !this.selectbox){
    var shape_object = null
    if(target.shape_object){
      shape_object = target.shape_object
    }else if(target.parentNode.shape_object){
      shape_object = target.parentNode.shape_object
    }else if(!target.is_tracker){
      this.selectbox = this.draw.rect(x, y, 0, 0)
        .attr({"fill-opacity": 0.15, 
              "stroke-opacity": 0.5, 
              "fill": "#ff0000", //oh noes! its red and gonna asplodes!
              "stroke": "#ff0000"});
      return;
    }else{
      return; //likely tracker
    }
    this.deleteShape(shape_object)
    this.offsetXY = [shape_object.attr("x") - x,shape_object.attr("y") - y]
  }else if(this.selected.length == 0){
    var shape = null;
    if(this.mode == "rect"){
      shape = this.draw.rect(x, y, 0, 0);
    }else if(this.mode == "ellipse"){
      shape = this.draw.ellipse(x, y, 0, 0);
    }else if(this.mode == "path"){
      shape = this.draw.path("M{0},{1}",x,y);
    }else if(this.mode == "line" || this.mode == "line+"){
      shape = this.draw.path("M{0},{1}",x,y);
      shape.subtype = "line";
    }else if(this.mode == "polygon"){
      shape = this.draw.path("M{0},{1}",x,y);
      shape.polypoints = [[x,y]];
      shape.subtype = "polygon";
    }else if(this.mode == "image"){
      shape = this.draw.image(this.prop.src, x, y, 0, 0);
      
      //WARNING NEXT IS A HACK!!!!!!
      //shape.attr("src",this.prop.src); //raphael won't return src correctly otherwise
    }else if(this.mode == "text"){
      shape = this.draw.text(x, y, this.prop['text']).attr('font-size',0)
      shape.text = this.prop['text'];
      //WARNING NEXT IS A HACK!!!!!!
      //shape.attr("text",this.prop.text); //raphael won't return src correctly otherwise
    }
    if(shape){
      shape.id = this.generateUUID();
      shape.attr({
          "fill": this.prop.fill, 
          "stroke": this.prop.stroke,
          "stroke-width": this.prop["stroke-width"],
          "fill-opacity": this.prop['fill-opacity'],
          "stroke-opacity": this.prop["stroke-opacity"]
      })
      this.addShape(shape)
    }
  }else{
    
  }
  return false;
}

VectorEditor.prototype.onMouseMove = function(x, y, target){

  this.fire("mousemove")
  if(this.mode == "select" || this.mode == "delete"){
    if(this.selectbox){
      this.resize(this.selectbox, x - this.onHitXY[0], y - this.onHitXY[1], this.onHitXY[0], this.onHitXY[1])
    }else if(this.mode == "select"){
      if(this.action == "move"){
        for(var i = 0; i < this.selected.length; i++){
          this.move(this.selected[i], x - this.tmpXY[0], y - this.tmpXY[1])
        }
        //this.moveTracker(x - this.tmpXY[0], y - this.tmpXY[1])
        this.updateTracker();
        this.tmpXY = [x, y];
        
      }else if(this.action == "rotate"){
        //no multi-rotate
        var box = this.selected[0].getBBox()
        var rad = Math.atan2(y - (box.y + box.height/2), x - (box.x + box.width/2))
        var deg = ((((rad * (180/Math.PI))+90) % 360)+360) % 360;
        this.selected[0].rotate(deg, true); //absolute!
        //this.rotateTracker(deg, (box.x + box.width/2), (box.y + box.height/2))
        this.updateTracker();
      }else if(this.action.substr(0,4) == "path"){
        var num = parseInt(this.action.substr(4))
        var pathsplit = Raphael.parsePathString(this.selected[0].attr("path"))
        if(pathsplit[num]){
          pathsplit[num][1] = x
          pathsplit[num][2] = y
          this.selected[0].attr("path", pathsplit)
          this.updateTracker()
        }
      }else if(this.action == "resize"){
        if(!this.onGrabXY){ //technically a misnomer
          if(this.selected[0].type == "ellipse"){
          this.onGrabXY = [
            this.selected[0].attr("cx"),
            this.selected[0].attr("cy")
          ]
          }else if(this.selected[0].type == "path"){
            this.onGrabXY = [
              this.selected[0].getBBox().x,
              this.selected[0].getBBox().y,
              this.selected[0].getBBox().width,
              this.selected[0].getBBox().height
            ]
          }else{
            this.onGrabXY = [
              this.selected[0].attr("x"),
              this.selected[0].attr("y")
            ]
          }
          //this.onGrabBox = this.selected[0].getBBox()
        }
        var box = this.selected[0].getBBox()
        var nxy = this.returnRotatedPoint(x, y, box.x + box.width/2, box.y + box.height/2, -this.selected[0].attr("rotation"))
        x = nxy[0] - 5
        y = nxy[1] - 5
        if(this.selected[0].type == "rect"){
          this.resize(this.selected[0], x - this.onGrabXY[0], y - this.onGrabXY[1], this.onGrabXY[0], this.onGrabXY[1])
        }else if(this.selected[0].type == "image"){
          this.resize(this.selected[0], x - this.onGrabXY[0], y - this.onGrabXY[1], this.onGrabXY[0], this.onGrabXY[1])
        }else if(this.selected[0].type == "ellipse"){
          this.resize(this.selected[0], x - this.onGrabXY[0], y - this.onGrabXY[1], this.onGrabXY[0], this.onGrabXY[1])
        }else if(this.selected[0].type == "text"){
          this.resize(this.selected[0], x - this.onGrabXY[0], y - this.onGrabXY[1], this.onGrabXY[0], this.onGrabXY[1])
        }else if(this.selected[0].type == "path"){
          this.selected[0].scale((x - this.onGrabXY[0])/this.onGrabXY[2], (y - this.onGrabXY[1])/this.onGrabXY[3], this.onGrabXY[0], this.onGrabXY[1])
        }
        this.newTracker(this.selected[0])
      }
    }
  }else if(this.selected.length == 1){
    if(this.mode == "rect"){
      this.resize(this.selected[0], x - this.onHitXY[0], y - this.onHitXY[1], this.onHitXY[0], this.onHitXY[1])
    }else if(this.mode == "image"){
      this.resize(this.selected[0], x - this.onHitXY[0], y - this.onHitXY[1], this.onHitXY[0], this.onHitXY[1])
    }else if(this.mode == "ellipse"){
      this.resize(this.selected[0], x - this.onHitXY[0], y - this.onHitXY[1], this.onHitXY[0], this.onHitXY[1])
    }else if(this.mode == "text"){
      this.resize(this.selected[0], x - this.onHitXY[0], y - this.onHitXY[1], this.onHitXY[0], this.onHitXY[1])
    }else if(this.mode == "path"){
      //this.selected[0].lineTo(x, y);
      this.selected[0].attr("path", this.selected[0].attrs.path + 'L'+x+' '+y)
    }else if(this.mode == "polygon" || this.mode == "line" || this.mode == "line+"){
      //this.selected[0].path[this.selected[0].path.length - 1].arg[0] = x
      //this.selected[0].path[this.selected[0].path.length - 1].arg[1] = y
      //this.selected[0].redraw();
      //var pathsplit = this.selected[0].attr("path").split(" ");
      
      //theres a few freaky bugs that happen due to this new IE capable way that is probably better
      var pathsplit = Raphael.parsePathString(this.selected[0].attr("path"));
      if(pathsplit.length > 1){
    	//  UI.util.debug(pathsplit.length+"---");
        //var hack = pathsplit.reverse().slice(3).reverse().join(" ")+' ';
        
        //console.log(pathsplit)
        if(this.mode == "line" || this.mode == "line+"){
          //safety measure, the next should work, but in practice, no
          pathsplit.splice(1,1);
          this.selected[0].attr("path", pathsplit.toString() + 'L'+x+' '+y)
        }else{
          var firstX = pathsplit[0][1];
          var firstY = pathsplit[0][2];
          if(this.selected[0].polypoints && this.selected[0].polypoints.length < pathsplit.length){
        	  if(pathsplit.length > this.selected[0].polypoints.length+1){
        		  pathsplit.splice(pathsplit.length - 2, 2);
        	  }else{
        		  pathsplit.splice(pathsplit.length - 1, 1);
        	  }
        	//  this.selected[0].attr("path", this.selected[0].attrs.path + 'L'+pathsplit[0][1]+' '+pathsplit[0][2])
          }
          var path = pathsplit.toString() + 'L'+x+' '+y+'L'+firstX+' '+firstY;
          this.selected[0].attr("path", path);
        }
        
      }else{
        //console.debug(pathsplit)
        //normally when this executes there's somethign strange that happened
        this.selected[0].attr("path", this.selected[0].attrs.path + 'L'+x+' '+y)
      }
      //this.selected[0].lineTo(x, y)
    }
  }
  
  return false;
}


VectorEditor.prototype.getMarkup = function(){
    return this.draw.canvas.parentNode.innerHTML;
}


VectorEditor.prototype.onDblClick = function(x, y, target){
  this.fire("dblclick")
  if(this.selected.length == 1){
    if(Raphael.type == "SVG" && this.selected[0].getBBox().height == 0 && this.selected[0].getBBox().width == 0){
    	this.deleteShape(this.selected[0])
    }
    if(this.mode == "polygon"){
    	var pathsplit = Raphael.parsePathString(this.selected[0].attr("path"));
    	if(this.selected[0].polypoints.length < pathsplit.length){
	        pathsplit.splice(pathsplit.length - 2, 1);
	        this.selected[0].attr("path", pathsplit.toString());
    	}
    	var points = this.getPointsListByMode(this.mode, this.selected[0]);
    	this.trigger("onDrawFinal", this.mode, points);
    	this.finalFlag = "polygon";
      //this.selected[0].andClose()
      this.unselect()
    }
  }
  return false;
}



VectorEditor.prototype.onMouseUp = function(x, y, target){

  this.fire("mouseup")
  this.onGrabXY = null;
  
  if(this.mode == "select" || this.mode == "delete"){
    if(this.selectbox){
      var sbox = this.selectbox.getBBox()
      var new_selected = [];
      for(var i = 0; i < this.shapes.length; i++){
        if(this.rectsIntersect(this.shapes[i].getBBox(), sbox)){
          new_selected.push(this.shapes[i])
        }
      }
      
      if(new_selected.length == 0 || this.selectadd == false){
        this.unselect()
      }
      
      if(new_selected.length == 1 && this.selectadd == false){
        this.select(new_selected[0])
      }else{
        for(var i = 0; i < new_selected.length; i++){
          this.selectAdd(new_selected[i])
        }
      }
      if(this.selectbox.node.parentNode){
        this.selectbox.remove()
      }
      this.selectbox = null;
      
      if(this.mode == "delete"){
        this.deleteSelection();
      }
      
    }else{
      this.action = "";
    }
  }else if(this.selected.length == 1){
    if(this.selected[0].getBBox().height == 0 && this.selected[0].getBBox().width == 0){
      if(this.selected[0].subtype != "polygon"){
        this.deleteShape(this.selected[0])
      }
    }
    if(this.mode == "rect" || this.mode == "ellipse" || this.mode == "path" || this.mode == "line" || this.mode == "line+"
    		|| this.mode == "image" || this.mode == "text"){
      this.unselect();
      var points = this.getPointsListByMode(this.mode, target);
      this.trigger("onDrawFinal", this.mode, points);
      this.finalFlag = "rect";
    }else if(this.mode == "polygon"){
        //this.selected[0].lineTo(x, y)
    //  this.selected[0].attr("path", this.selected[0].attrs.path + 'L'+x+' '+y)
    	if(!this.selected[0].polypoints){
    		this.selected[0].polypoints = [];
    	}
    	this.selected[0].polypoints.push([x,y]);  
    }
  }
  if(this.lastmode){
    this.setMode(this.lastmode);
    //this.mode = this.lastmode //not selectmode becasue that unselects
    delete this.lastmode;
  }
  return false;
}

/**
 * 根据两点生成一个90度 箭头形状图，返回图形坐标点
 */
function getArrowsPoints(ptStart, ptEnd, arrowTailLen, arrowHeadLen, theta){
	if(!arrowTailLen){
		arrowTailLen = 20;
	}
	if(!arrowHeadLen){
		arrowHeadLen = 56;
	}
	if(!theta){
		theta= 20;
	}
	 var x1, x2, y11, y2;
     var k1, k2, k3, k4, a, b, c;   //计算中垂线的中间变量
     var pt1x = 0, pt1y = 0, pt2x = 0, pt2y = 0;	 //中垂线上的点
     x1 = eval(ptStart.x);
     y11 = eval(ptStart.y);
     x2 = eval(ptEnd.x);
     y2 = eval(ptEnd.y);
     if (x1 - x2 == 0)
     {
         //给定向量竖直向上
         if (y11 > y2)
         {
             pt1x = x1 + arrowTailLen;
             pt1y = (y11 + y2) / 2;
             pt2x = x1 - arrowTailLen;
             pt2y = (y11 + y2) / 2;
         }

         else
         {
             pt1x = x1 - arrowTailLen;
             pt1y = (y11 + y2) / 2;
             pt2x = x1 + arrowTailLen;
             pt2y = (y11 + y2) / 2;
         }
     }
     if (y11 - y2 == 0)
     {	//给定向量水平向右
         if (x1 > x2)
         {
             pt1x = (x1 + x2) / 2;
             pt1y = y11 - arrowTailLen;
             pt2x = (x1 + x2) / 2;
             pt2y = y11 + arrowTailLen;

         }
         else
         {
             pt1x = (x1 + x2) / 2;
             pt1y = y11 + arrowTailLen;
             pt2x = (x1 + x2) / 2;
             pt2y = y11 - arrowTailLen;
         }
     }
     if (x1 - x2 != 0 && y11 - y2 != 0)
     {
         k1 = -(x2 - x1) / (y2 - y11);
         k2 = (y11 + y2) / 2 + (x2 - x1) * (x1 + x2) / (2 * (y2 - y11));
         k3 = -(x1 + x2) / 2;
         k4 = -(y11 + y2) / 2;
         a = 1 + k1 * k1;
         b = 2 * (k3 + k1 * k2 + k1 * k4);
         c = k3 * k3 + (k2 + k4) * (k2 + k4) - arrowTailLen * arrowTailLen;
         //给定向量在一三象限
         if (x1 < x2)
         {
             pt1x = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
             pt1y = k1 * pt1x + k2;
             pt2x = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
             pt2y = k1 * pt2x + k2;
             if (pt2y < pt1y)
             { }
             else
             {
                 pt1x = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
                 pt1y = k1 * pt1x + k2;
                 pt2x = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
                 pt2y = k1 * pt2x + k2;
             }
         }
         else
         {
             pt1x = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
             pt1y = k1 * pt1x + k2;
             pt2x = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
             pt2y = k1 * pt2x + k2;

             if (pt2y > pt1y)
             { }
             else
             {
                 pt1x = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
                 pt1y = k1 * pt1x + k2;
                 pt2x = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
                 pt2y = k1 * pt2x + k2;
             }
         }
     }
     //画箭头
     var Xx, Xy, X1x, X1y, X2x, X2y;
     var P1x, P1y, P2x, P2y;
     P1x = Math.round(pt1x);
     P1y = Math.round(pt1y);
     P2x = Math.round(pt2x);
     P2y = Math.round(pt2y);
     Xx = P1x - P2x;
     Xy = P1y - P2y;
     theta = 3.1415926 * theta / 180;
     X1x = Xx * Math.cos(theta) - Xy * Math.sin(theta);
     X1y = Xx * Math.sin(theta) + Xy * Math.cos(theta);
     X2x = Xx * Math.cos(theta) + Xy * Math.sin(theta);
     X2y = Xx * Math.sin(-theta) + Xy * Math.cos(theta);
     var d1, d2;
     d1 = Math.sqrt(X1x * X1x + X1y * X1y);
     d2 = Math.sqrt(X2x * X2x + X2y * X2y);
     X1x = X1x * arrowHeadLen / d1;
     X1y = X1y * arrowHeadLen / d1;
     X2x = X2x * arrowHeadLen / d2;
     X2y = X2y * arrowHeadLen / d2;
     X1x = Math.round(X1x + P2x);
     X1y = Math.round(X1y + P2y);
     X2x = Math.round(X2x + P2x);
     X2y = Math.round(X2y + P2y);
     
     return [{x:X1x, y:X1y},{x:P2x, y:P2y},{x:X2x, y:X2y},{x:P1x, y:P1y},{x:X1x, y:X1y}];
     
}