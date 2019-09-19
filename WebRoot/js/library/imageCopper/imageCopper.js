window.ImageCropper = (function($, window, undefined){
    var _list = {}; // 用于暂时存储paper对象
    var IS_IE8 = navigator.userAgent.indexOf("MSIE 8.0") > -1 ? true : false;

    var ImageCropper = function(){

        this.graph = {type:'rect', tagType:'face'}; // 记录鼠标在图片上画图的类型
        this.paper = {};
        this.bgImage = undefined; // 底层图片
        this.connections = []; // 记录有连线信息的图形
        this._initFlag = false; // 标记是否已经初始化
        this.fillColor = '#fff'; // 获取填充色
        this.editTextObj = undefined; // 当前编辑的文字对象
        this.originalParam = {};   // 当前图片相对于画布的图片信息
        this.style = {
            stroke:'red',
            "fill-opacity": 0,
            "stroke-width": 2,
            cursor: "move",
            "font-size": 13,
            "font-weight": 'normal'
        };
        this.paperId = 0; // 记录画布id，ID是Math.random()自动生成，方便获取当前对象this
        
        this.options = {
            id : 'graph', // 画图html节点 id
            imgsrc : '',
            width : 200,
            height : 200,
            imgList : {   
                id: 'imgListCon',  //截图列表id
                height:80,   //截图节点高度
                width:100,    //截图节点宽度
                render:'<div></div>',
                deleteCallBack: null,
                editCallBack: null,
                drawCallBack: null
                
            },
            tagging : false,
            drawEnable: true,
            drawOnlyOne: true,
            filling: false
        };

        
    };

    ImageCropper.prototype = {
        constructor: ImageCropper, // 修改构造器的指向

        init: function(options, callback){    
            $.extend(true, this.options, options);
            var self = this;
            var o = self.options;
            
            resizeimage(o.imgsrc, {
                width:o.width,
                height:o.height
            }, function(img){
                //xc test 7-3
                self.changeCon(img);
                self._paintCanvas(img, callback);
            });
            
            return this;
        },
        _paintCanvas: function(img, callback){
            var o = this.options;
            this.paper = Raphael(o.id, img.sw, img.sh); //创建画布
            this.bgImage = this.paper.image(o.imgsrc, 0, 0, img.sw, img.sh);
            this.originalParam = img;
            this.fillColor = Raphael.getColor();
            this._initFlag = true;
            imageBindAddNewBlock.call(this);
            this.paperId = Math.random();
            typeof callback == 'function' && callback();
            _list[this.paperId] = this;
        },
        //xc test 7-3
        //resize imgContainer and imageCropper instance's options
        changeCon: function(imgOpt) {
            console.log("changeCon......")
            console.log(imgOpt);
            this.options.width = imgOpt.sw;
            this.options.height = imgOpt.sh;
            this.options.imgCanvasScale = imgOpt.scale;
            var $con = $("#"+this.options.id);

            $con.width(imgOpt.sw).height(imgOpt.sh).css({"marginTop": imgOpt.mt, "marginLeft": imgOpt.ml});

        },
        
        autoStructuring: function(data){
        	var originalX = data.X,
        		originalY = data.Y,
        		originalW = data.WIDTH,
        		originalH = data.HEIGHT;
        	
        	var graph = this.graph.type,
        		scale = this.options.imgCanvasScale,
        		curObj = null,
        		self = this;
        	
            if(graph == 'ellipse'){
            	var x = (originalX+originalW/2) * scale,
            		y = (originalY+originalH/2) * scale,
            		rx = originalW/2 * scale,
            		ry = originalH/2 * scale;
            	
            	curObj = this.initEllipse(x, y, rx, ry);
            }else if(graph == 'circle'){
            	var x = (originalX+originalW/2) * scale,
	        		y = (originalY+originalH/2) * scale,
	        		r = originalW/2 * scale;
            	
            	curObj = this.initCircle(x, y, r);
            }else{
            	var x = originalX * scale,
        			y = originalY * scale,
        			w = originalW * scale,
            		h = originalH * scale;
            	
            	curObj = this.initRect(x, y, w, h);
            }
            
            curObj.data = data;
            curObj.tagType = this.graph.tagType;
            curObj.selected = imgDrawArea(curObj, self.originalParam.scale);
            curObj.uuid = Date.now();//xc test: 增加uuid
            drawImageShot.call(self,curObj);
            addResizeBlock.call(self,curObj);
            
            // 标注框添加拖动事件
            // curObj.drag(function(dx, dy){
            //     if(!!this.disabled){
            //         return;
            //     }

            //     //让dx, dx 在合理范围
            //     var dxdy = getBorderdxdy.call(self, this, dx, dy);
            //     dx = dxdy.dx;
            //     dy = dxdy.dy;

            //     moveWidthLine.call(this, dx, dy, self);
            //     redrawImageShot.call(self, this);
            //     refreshHandsPosition(this);
                
            // }, dragger, up);
            
            // 绑定操作手柄显示隐藏事件
            var st = self.paper.set();
            st.push(curObj);
            st.push(curObj.hands);
            st.mouseover(function(){
                setHandsShowAndHide(curObj, 1);
            });
            st.mouseout(function(){
                setHandsShowAndHide(curObj, 0);
            });
            //统一先隐藏
            setHandsShowAndHide(curObj, 0);

            // 标注初始化
            if(this.options.tagging){
                var textX, textY = y-30 <= 30 ? 30 : y-30;
                if((x + 120 + 40) > self.originalParam.sw) {
                    textX = x-120;
                } else {
                    textX = x+120;
                }
                var tagsSt = self.initTextWidthRect(textX, textY).drag(function(dx, dy){
                    moveWithGroupAndLine.call(this, dx, dy, self);
                }, dragger, up);
                tagsSt.lineTo = curObj; 
                tagsSt.textObj.lineTo = curObj.id; // 标识当前的文字标注所属截图区域
                tagsSt.rectObj.lineTo = curObj.id; // 标识当前的文字标注外框所属截图区域
                self.connections.push(self.paper.connection(tagsSt.lineTo, tagsSt, self.style.stroke));
            }
        },


        getBoundingRect: function(){
            var t = document.getElementById(this.options.id);
            
            var offset = $('#'+this.options.id).offset();
            return {
                x: offset.left,
                y: offset.top
            };
        },
        
        // 初始化一个椭圆
        initEllipse: function(x, y, rx, ry) {
            var self = this;
            if (self.options.filling) {
            	self.style.fill = self.style.stroke;
            }
            //return this.paper.ellipse(x, y, 20, 40).attr(this.style);
            return this.paper.ellipse(x, y, rx||0, ry||0).attr(this.style);
        },
        // 初始化一个圆 
        initCircle: function(x, y, r,attr){
            var self = this;
            if (self.options.filling) {
            	self.style.fill = self.style.stroke;
            }
            var attrs = $.extend(true,{}, this.style,attr);
            return this.paper.circle(x, y, r || 20).attr(attrs);
        },
        // 初始化一个矩形
        initRect: function(x, y, w, h){
            var self = this;
            if (self.options.filling) {
            	self.style.fill = self.style.stroke;
            }
            return this.paper.rect(x, y, w||20, h||20, 0).attr(this.style);
        },
        // 初始化一个文字块
        initText: function(x, y){
            var text = this.paper.text(x, y, "请添加标注").attr($.extend({}, this.style, {"stroke-width": 1}));
            this.initEditText(text);
            return text;
        },
        // 初始化一个文字块+外框
        initTextWidthRect: function(x, y){
            var self = this;
            var st = this.paper.set();
            var rect = this.initRect(x, y);
            var text = this.initText(x, y);
            rect.parentObj = st;
            text.parentObj = st;

            st.push(rect, text);
            st.textObj = text;
            st.rectObj = rect;
            text.sibling = rect.id;
            rect.sibling = text.id;
            
            var box = text.getBBox();
            var attrs = {
                x:box.x-5, 
                y:box.y-5, 
                width:box.width+10, 
                height:box.height+10, 
                r:5
            }
            $.extend(true, attrs, this.style);
            rect.attr(attrs);
            
            return st;
        },
        // 编辑文字
        initEditText: function(textObj) {
            var self = this;
            textObj.dblclick(function(){
                console.log("进来了...dblclick")
                self.editTextObj = this;
                var id = Math.random();
                _list[id] = self; 
                addHtml.call(self,this.attr('text'), id);
            });
        },
        _lineTo: function(){
            var connections = this.connections;
            var paper = this.paper;
            for (var i = connections.length; i--;) {
                paper.connection(connections[i]); // 重新连线
            }
            paper.safari();
        },
        // 修改文字
        changeText: function(text){
            var self = this;
            var editTextObj = self.editTextObj; // 当前编辑的文字
            var connections = this.connections;
            var att = {x: editTextObj.attr('x'), y: editTextObj.attr('y')};
            var lineToObj = editTextObj.parentObj.lineTo;
            var rect = editTextObj.parentObj.rectObj;
            
            editTextObj.attr('text', text);
            refreshRectOfText(editTextObj, rect);
            this._lineTo();
        },
        //将画布信息转换成json格式存储,获取序列信息
        getData: function(){
            var paper = this.paper;
            var json = paper.serialize(paper).json();
            var objs = JSON.parse(json);
            var array = [];
            for(var i = 0; i < objs.length; i++){
                var simg = objs[i].selected;
                if(simg){ array.push(simg); }
            }
            return { json: json, imgs:array };
        },
        //将制定截图区域转换成json格式存储,获取序列信息
        getItemData: function(id){
            var paper = this.paper;
            var nodelists = this.getNodeById(id);
            nodelists.push(paper.bottom);
            var json = paper.serialize(paper,nodelists).json();
            var nodes = JSON.parse(json), simg = {};
            var stext = "请添加标注";
            for(var i = nodes.length; i--;){
                if(nodes[i].selected){ 
                    simg = nodes[i].selected; 
                    stext = nodes[i+2] && nodes[i+2].text;
                }
            }
            return { json: json, img:simg , text: stext}; //xc 增加 text
        },
        // 根据json转换成画布
        setData: function(json){
            //有可能 上次保存 getData时的画布和 现在不一样大小，需要进行转换
            json = suitJson.call(this, json);
            setData.call(this,json);
        },
        // 切换标记图形
        changeType: function(param, attrs){
            this.graph = param;
            $.extend(true, this.style, attrs);
        },  
        // 根据截图区域的id，删除截图区域
        removeNodeById: function(id){
            removeNodeById.call(this,id);
        },
        //根据矩形id获取图形组
        getNodeById: function(id){
            var nodelists = [];
            var paper = this.paper;
            //取出框选的关联的所有节点
            for(var node = paper.bottom; node != null; node = node.next) {
                if (node && node.type) {
                    if(node.lineTo == id || node.id == id || node.blongId == id){
                        nodelists.push(node);
                    }
                }
            }
            return nodelists;
        },
        // 改变节点的可编辑状态
        changeNodeEditAbility:function(id, enable){
            var nodes = this.getNodeById(id);
            for(var i = nodes.length; i--;){
                nodes[i].disabled = !enable;
            } 
        }
         
    };

    /**
     * 获取 attr 后进行边界计算，如果超出最大值则按最大值显示
     */
    function getBorderAttr(obj, attr, init) {
        var self = this,
            paperW = self.originalParam.sw - 1,
            paperH = self.originalParam.sh - 1,
            initX = init.initX,
            initY = init.initY;

        if(obj.type === 'rect') {
            var w = attr.width;
            var h = attr.height;
            var maxW = paperW - initX;
            var maxH = paperH - initY; 
            
            if(initX + w >= paperW) {
                attr.width = maxW;
            } 
            if(initY + h >= paperH) {
                attr.height = maxH;
            }
        } else if(obj.type === 'circle') {
            var r = attr.r;
            var maxR;
            if(initX + r >= paperW) {
                maxR = paperW - initX;
                attr.r = maxR;
            } 
            if(initY + r >= paperH) {
                maxR = paperH - initY;
                attr.r = maxR;
            }
            if(initX - r <= 1) {
                maxR = initX - 1;
                attr.r = maxR;
            }
            if(initY - r <= 1) {
                maxR = initY - 1;
                attr.r = maxR;
            }
            
        } /* else if(obj.type === 'ellipse') {
            var rx = attr.rx;
            var ry = attr.ry;
            var maxRx,maxRy;
            if(initX + 2*rx > paperW) {
                maxRx = (paperW - initX)/2 - 1;
                attr.rx = maxRx;
            }
            if(initY + 2*ry > paperH) {
                maxRy = (paperH - initY)/2 - 1;
                attr.ry = maxRy;
            }
            if(initX - 2*rx <= 1) {
                maxRx = intX - 1;
                attr.rx = maxRx;
            }
            if(initY - 2*ry <= 1) {
                maxRy = initY - 1;
                attr.ry = maxRy;
            }
            
        } */

        return attr;
    }

    function getBorderdxdy(obj, dx, dy) {
        var self = this,
            oldDx = dx,
            oldDy = dy,
            paperW = self.originalParam.sw - 1,
            paperH = self.originalParam.sh - 1,
            initX = obj.ox,//obj.attrs.cx,
            initY = obj.oy;//obj.attrs.cy;

        if(obj.type === 'rect') {
            var w = obj.attrs.width,
                h = obj.attrs.height;
            if(initX + w + dx >= paperW) {
                dx = paperW - (initX + w) - 1;
            }
            if(initX + dx <= 1) {
                dx = -(initX - 1);
            }
            if(initY + h + dy >= paperH) {
                dy = paperH - (initY + h) - 1;
            }
            if(initY + dy <= 1) {
                dy = -(initY - 1);
            }
        } else if(obj.type === 'circle') {
            var r = obj.attrs.r;
            if(initX + r + dx >= paperW) {
                dx = paperW - (initX + r) - 1;
            }
            if(initX - r + dx <= 1) {
                dx = -(initX - r - 1);
            }
            if(initY + r + dy >= paperH) {
                dy = paperH - (initY + r) - 1;
            }
            if(initY - r + dy <= 1) {
                dy = -(initY - r - 1);
            }
        } else if(obj.type === 'ellipse') {
            var rx = obj.attrs.rx,
                ry = obj.attrs.ry;
               
            if(initX + rx + dx >= paperW) {
                dx = paperW - (initX + rx) - 1;
            }
            if(initX - rx + dx <= 1) {
                dx = -(initX - rx - 1);
            }
            if(initY + ry + dy >= paperH) {
                dy = paperH - (initY + ry) - 1;
            }
            if(initY - ry + dy <= 1) {
                dy = -(initY - ry - 1);
            }
        }
        
        return {
            dx: dx,
            dy: dy
        }
    }

    /**
     * 是否超出画布
     * @return {Boolean}
     * @param {Object} 画图事件 this.obj对象
     * @param {attr} 装着宽高或者半径的对象
     */
    function isOutOfPaper(obj, attr) {
        if(!obj || !attr || !obj.type) {
            return false;
        }
        var self = this,
            paperW = self.originalParam.sw,
            paperH = self.originalParam.sh,
            initX = attr.initX,
            initY = attr.initY,
            result = false;
        
        if(obj.type === 'rect') {
            var w = attr.width;
            var h = attr.height;
            if(initX + w >= paperW - 2 || initY + h >= paperH - 2) {
                result = true;
            } else {
                result = false;
            }
        } else if(obj.type === 'circle') {
            var r = attr.r;
            if(initX + r >= paperW - 2 || initY + r >= paperH - 2) {
                result = true;
            } else {
                result = false;
            }
        } else if(obj.type === 'ellipse') {
            
        }

        return result;
    }

    /**
     * @param {number} id 截图区域id 
     * @description 删除指定id对应的截图区域（包括标注和箭头）
     */
    function removeNodeById(id){
        var nodelists = this.getNodeById(id);
        // 删除节点
        for(var i = nodelists.length; i--;){
            nodelists[i].remove();
        }
    }

    /**
     * @param {obj} self 当前画布对象 
     * @description 绑定操作手柄显示隐藏事件
     */
    function bindEventOfHands(self, node){
        var handSt = self.paper.set();
        handSt.push(node);
        handSt.push(node.hands);
        handSt.mouseover(function(){
            setHandsShowAndHide(node, 1);
        });
        handSt.mouseout(function(){
            setHandsShowAndHide(node, 0);
        });

        setHandsShowAndHide(node, 0); // 默认情况下隐藏
    }


    // 控制操作手柄显示隐藏
    function setHandsShowAndHide(obj, showFlag){
        if(!!obj.disabled){
            showFlag = 0;
        }

        var hands = obj.hands;
        var hand;
        var handsName = ['leftTop', 'rightTop', 'leftBottom', 'rightBottom'];
        for(var i = hands.length; i--;){
            hand = hands[i];
            if(handsName.indexOf(hand.pname) != -1){
                // 四个顶角
                if(obj.type == 'circle' || obj.type == 'ellipse'){
                    hand.hide();
                }else{
                    showFlag == 1 ? hand.show() : hand.hide();
                }
            }else{
                showFlag == 1 ? hand.show() : hand.hide();
            }
        }
    }

    /**
     * @description 绑定底图鼠标点按事件, 自动添加标注元素组(元素组= 框选图形+连线+文字)
     */
    function imageBindAddNewBlock(){
        var self = this;
        var o = this.options;
        if(!self._initFlag){
            alert('画布未初始化');
            return;
        }

        this.bgImage.drag(function(dx, dy, x, y){
            if(!this.obj || (o.drawOnlyOne && $(".img-item").length > 0)) return;

            x = x - self.getBoundingRect().x;
            y = y - self.getBoundingRect().y;

            // 移动事件move
            var newDx;
            var newDy;
            var attr;

            var paperW = self.originalParam.sw - 1;
            var paperH = self.originalParam.sh - 1;

            if(this.obj.type == 'ellipse'){
                //newDx = (this.obj.attr('rx')+dx)/2;
                //newDy = (this.obj.attr('rx')+dy);
                // attr = {
                //     'rx': newDx > 0 ? newDx : 10,
                //     'ry': newDy > 0 ? newDy : 10
                // };

                // xc mark: 修改为起点为左上角（之前起点为圆心）
                
                //不能画出画布
                if(x >= paperW) {x = paperW - 1; dx=this.obj.attr("rx")*2}
                if(y >= paperH) {y = paperH - 1; dy=this.obj.attr("ry")*2}
                

                newDx = dx/2;
                newDy = dy/2;
                attr = {
                    'rx': newDx > 0 ? newDx : 0,
                    'ry': newDy > 0 ? newDy : 0,
                    'cx': x - newDx,
                    'cy': y- newDy
                };
            }else if(this.obj.type == 'circle'){
                newDx = ((this.obj.attr('r')/2)+dx);
                attr = {
                    'r': newDx > 0 ? newDx : 10
                };
            }else{
                newDx = (this.obj.attr('width')+dx) / 2;
                newDy = (this.obj.attr('height')+dy) / 2;
                attr = {
                    'width': newDx > 0 ? newDx : 10,
                    'height': newDy > 0 ? newDy : 10
                };
            }

            //让attr的值不超出图片
            attr = getBorderAttr.call(self, this.obj, attr, {initX:this.initX, initY:this.initY});

            this.obj.animate(attr);
        }, function(x, y){
            if(o.drawOnlyOne && !o.drawEnable) return;
            if(!o.drawEnable) return;
            o.drawEnable = false;//要鼠标弹起才能让 drawEnable变为 true
            
            x = x - self.getBoundingRect().x;
            y = y - self.getBoundingRect().y;
            // 鼠标点按开始事件 drag
            // 根据鼠标按下的点，初始化一个图形
            var graph = self.graph.type;
            if(graph == 'ellipse'){
                this.obj = self.initEllipse(x, y);
            }else if(graph == 'circle'){
                this.obj = self.initCircle(x, y);
            }else{
                this.obj = self.initRect(x, y);
            }
            this.initX = x;
            this.initY = y;
        }, function(){
            // 鼠标弹起事件
            if(!this.obj || (o.drawOnlyOne && $(".img-item").length > 0)) return;
            if(o.drawEnable) return;

            if(o.drawOnlyOne) {
                o.drawEnable = false;
            } else {
                o.drawEnable = true;
            }

            this.obj.selected = imgDrawArea(this.obj, self.originalParam.scale);
            this.obj.tagType = self.graph.tagType;
            this.obj.uuid = Date.now();//xc test: 增加uuid


            drawImageShot.call(self,this.obj);

            addResizeBlock.call(self,this.obj);

            // 标注框添加拖动事件
            this.obj.drag(function(dx, dy){
                if(!!this.disabled){
                    return;
                }

                //让dx, dx 在合理范围
                var dxdy = getBorderdxdy.call(self, this, dx, dy);
                dx = dxdy.dx;
                dy = dxdy.dy;

                moveWidthLine.call(this, dx, dy, self);
                redrawImageShot.call(self, this);
                refreshHandsPosition(this);
                
            }, dragger, up);
            
            // 绑定操作手柄显示隐藏事件
            var st = self.paper.set();
            st.push(this.obj);
            st.push(this.obj.hands);
            var thisObj = this.obj;
            st.mouseover(function(){
                setHandsShowAndHide(thisObj, 1);
            });
            st.mouseout(function(){
                setHandsShowAndHide(thisObj, 0);
            });
            //统一先隐藏
            setHandsShowAndHide(thisObj, 0);

            // 标注初始化
            if(o.tagging){
                var textX, textY = this.initY-30 <= 30 ? 30 : this.initY-30;
                if((this.initX + 120 + 40) > self.originalParam.sw) {
                    textX = this.initX-120;
                } else {
                    textX = this.initX+120;
                }
                var tagsSt = self.initTextWidthRect(textX, textY).drag(function(dx, dy){
                    moveWithGroupAndLine.call(this, dx, dy, self);
                }, dragger, up);
                tagsSt.lineTo = this.obj; 
                tagsSt.textObj.lineTo = this.obj.id; // 标识当前的文字标注所属截图区域
                tagsSt.rectObj.lineTo = this.obj.id; // 标识当前的文字标注外框所属截图区域
                self.connections.push(self.paper.connection(tagsSt.lineTo, tagsSt, self.style.stroke));
            }

        });
    }

    //xc
    function suitJson(json) {
        var self = this;
        if(!json) return;
        json = JSON.parse(json);

        var curImgW = IS_IE8 ? $("#"+self.options.id).find("image").width() : self.paper.width, //self.options.width
            curImgH = IS_IE8 ? $("#"+self.options.id).find("image").height() : self.paper.height,//self.options.height
            jsonImgW, jsonImgH, ratio = 1;

        for(var i=0,len=json.length; i<len; i++) {
            var item = json[i];
            if(item.type === 'image') {
                jsonImgW = item.width;
                jsonImgH = item.height;

                if(jsonImgW/jsonImgH > curImgW/curImgH) {
                    if(curImgW/jsonImgW > 1.1 || curImgW/jsonImgW < 0.9) {
                        ratio = curImgW/jsonImgW;
                    }
                } else {
                    if(curImgH/jsonImgH > 1.1 || curImgH/jsonImgH < 0.9) {
                        ratio = curImgH/jsonImgH;
                    }
                }
            }
            if(ratio === 1) break;
            if(item.type === 'ellipse') {
                item.rx = item.rx*ratio;
                item.ry = item.ry*ratio;
                item.cx = item.cx*ratio;
                item.cy = item.cy*ratio;
            }
            if(item.type === 'rect') {
                item.x = item.x*ratio;
                item.y = item.y*ratio;
                if(item.uuid) {
                    item.width = item.width*ratio;
                    item.height = item.height*ratio;
                }
            }
            if(item.type === 'text') {
                
                // item.x = item.x*ratio;
                // item.y = item.y*ratio;
                item.x = json[i-1].x + json[i-1].width/2;
                item.y = json[i-1].y + json[i-1].height/2;
            }
        }

        return JSON.stringify(json);
    }
    
    /**
     * @description 根据序列绘制图形
     */
    function setData(json){
        var self = this;
        var paper = this.paper;
        var o = this.options;
        paper.serialize(paper).loadJson(json);
        var tmpList = {};
        for(var node = paper.bottom; node != null; node = node.next) {
            if (node && node.type) {
                switch(node.type) {
                    case 'rect':
                    case 'circle':
                    case 'ellipse':
                        if(node.selected){
                        	node.listData = JSON.parse(json);
                        	node.listData = node.listData.pop();
                            drawImageShot.call(self,node);

                            addResizeBlock.call(self,node); // 添加操作手柄
                            
                            // 标注框添加拖动事件
                            node.drag(function(dx, dy){
                                if(!!this.disabled){
                                    return;
                                }
                                moveWidthLine.call(this, dx, dy, self);
                                    redrawImageShot.call(self,this);
                                refreshHandsPosition(this);
                            }, dragger, up);

                            
                            bindEventOfHands(self, node); // 绑定操作手柄显示隐藏事件

                            if(o.tagging){
                                tmpList[node.key] = {
                                    node: node
                                };
                            }
                            
                        }else if( o.tagging && node.lineTo > 0){
                            if(typeof tmpList[node.lineTo] == 'undefined'){
                                tmpList[node.lineTo] = {}
                            }
                            tmpList[node.lineTo]['rect'] = node;
                        }
                        break;
                    case 'text':
                        if( o.tagging && node.lineTo > 0){
                            if(typeof tmpList[node.lineTo] == 'undefined'){
                                tmpList[node.lineTo] = {}
                            }
                            tmpList[node.lineTo]['text'] = node;
                        }
                        break;
                }
            }
        }
        // 将需要连线的元素，进行遍历
        var tmp;
        var paperSt;
        for(var key in tmpList){
            if(!tmpList.hasOwnProperty(key)){
                continue;
            }
            tmp = tmpList[key];
            paperSt = paper.set(); 
            paperSt.push(tmp.text, tmp.rect);
            // 标注初始化
            paperSt.drag(function(dx, dy){
                moveWithGroupAndLine.call(this, dx, dy, self);
            }, dragger, up);
            paperSt.textObj = tmp.text;
            paperSt.rectObj = tmp.rect;

            paperSt.lineTo = tmp.node; 
            tmp.text.parentObj = paperSt;
            tmp.rect.parentObj = paperSt;
            tmp.text.lineTo = tmp.node.id; // 标识当前文字标注属于哪个截图区域
            tmp.rect.lineTo = tmp.node.id; // 标识当前文字标注外框属于哪个截图区域
            //tmp.text.sibling = tmp.rect;  //xc mark: 这里会循环引用 JSON.stringify会报错
            //tmp.rect.sibling = tmp.text;

            self.initEditText(tmp.text);
            self.connections.push(self.paper.connection(paperSt.lineTo, paperSt, tmp.node.pathColor));
        }
    }

    /**
     * @description 操作手柄绑定事件
     * @param {*} option { width, height,x, y } 
     */
    function bindEventOfHandler(handler, self, option){
        handler.drag(function(dx, dy, x, y){

            // 根据鼠标位置，移动当前操作手柄位置
            var paperW = self.originalParam.sw;
            var paperH = self.originalParam.sh;
            var owner = handler.owner;
            
            //console.log("x:"+x+" ,y:"+y+", dx:"+dx+" ,dy:"+dy);
            //边界控制
            if(handler.type === 'lc') {
                if(x<=1) return;
            } else if(handler.type === 'rc') {
                if(x>=(paperW-2)) return;
            } else if(handler.type === 'tc') {
                if((y-37)<=0) return;
            } else if(handler.type === 'bc') {
                if((y-37)>=paperH) return;
            }
            //如果 owner 是 ellipse（椭圆）还需要进行特殊处理
            // if(owner.type === 'ellipse') {
            //     if(handler.type === 'lc') {
            //         if(x+owner.attrs.rx*2>=paperW) return;//if(x+椭圆宽>=paperW) return;
            //     } else if(handler.type === 'rc') {
            //         if(x-owner.attrs.rx*2<=0) return;     // if(x-椭圆宽<=0) return;
            //     } else if(handler.type === 'tc') {
            //         if(y+owner.attrs.ry*2>paperH) return; //if(y+椭圆高>paperH) return;
            //     } else if(handler.type === 'bc') {
            //         if(y-owner.attrs.ry*2<=0) return;     //if(y-椭圆高<=0) return;
            //     }
            // }

            var changeOption = {
                obj: this
            };
            if(handler.type != 'tc' && handler.type != 'bc'){
                changeOption.dx = dx;
            }
            if(handler.type != 'lc' && handler.type != 'rc'){
                changeOption.dy = dy;
            }
            changeHandlerCenterPosition(changeOption); 
            var option = getHandlerOption(handler);

            changeSize.call(self, this.owner, option.x, option.y, option.width, option.height); // 操作手柄位置写入当前作用的图形
            refreshHandsPosition(this.owner);
            self._lineTo(); // 刷新标注与截图区域的箭头
            redrawImageShot.call(self, this.owner);
        }, function(x, y){
            cacheHandlerPosition(this);
        });
    }

    //添加操作手柄
    function addResizeBlock(obj){
        var self = this;
        var paper = self.paper;

        var circleWidth = 5; // 圆形半径
        var circleColor = 'red'; // 圆形颜色
        var handsPosition = getHandsPosition(obj);
        // 生成操作手柄
        var leftTopCircle = self.initCircle(handsPosition.leftTop.x, handsPosition.leftTop.y, 5,{cursor: "nw-resize",fill:'#fff',"fill-opacity": 100, stroke: obj.attr('stroke')});
        var rightTopCircle = self.initCircle(handsPosition.rightTop.x, handsPosition.rightTop.y, 5,{cursor: "ne-resize",fill:'#fff',"fill-opacity": 100, stroke: obj.attr('stroke')});
        var topCenterCircle = self.initCircle(handsPosition.topCenter.x, handsPosition.topCenter.y, 5,{cursor: "n-resize",fill:'#fff',"fill-opacity": 100, stroke: obj.attr('stroke')});

        var leftBottomCircle = self.initCircle(handsPosition.leftBottom.x, handsPosition.leftBottom.y, 5,{cursor: "sw-resize",fill:'#fff',"fill-opacity": 100, stroke: obj.attr('stroke')});
        var rightBottomCircle = self.initCircle(handsPosition.rightBottom.x, handsPosition.rightBottom.y, 5,{cursor: "se-resize",fill:'#fff',"fill-opacity": 100, stroke: obj.attr('stroke')});
        var bottomCenterCircle = self.initCircle(handsPosition.bottomCenter.x, handsPosition.bottomCenter.y, 5,{cursor: "s-resize",fill:'#fff',"fill-opacity": 100, stroke: obj.attr('stroke')});

        var leftCenterCircle = self.initCircle(handsPosition.leftCenter.x, handsPosition.leftCenter.y, 5,{cursor: "w-resize",fill:'#fff',"fill-opacity": 100, stroke: obj.attr('stroke')});
        var rightCenterCircle = self.initCircle(handsPosition.rightCenter.x, handsPosition.rightCenter.y, 5,{cursor: "e-resize",fill:'#fff',"fill-opacity": 100, stroke: obj.attr('stroke')});
        

        // 操作手柄加入type
        leftTopCircle.type = 'lt';
        rightTopCircle.type = 'rt';
        leftBottomCircle.type = 'lb';
        rightBottomCircle.type = 'rb';
        topCenterCircle.type = 'tc';
        bottomCenterCircle.type = 'bc';
        leftCenterCircle.type = 'lc';
        rightCenterCircle.type = 'rc';

        // 加入别名，方便获取最新的手柄位置信息
        leftTopCircle.pname = 'leftTop';
        rightTopCircle.pname = 'rightTop';
        topCenterCircle.pname = 'topCenter';
        leftBottomCircle.pname = 'leftBottom';
        rightBottomCircle.pname = 'rightBottom';
        bottomCenterCircle.pname = 'bottomCenter';
        leftCenterCircle.pname = 'leftCenter';
        rightCenterCircle.pname = 'rightCenter';

        var handlers = [
            leftTopCircle,
            rightTopCircle,
            topCenterCircle,
            leftBottomCircle,
            rightBottomCircle,
            bottomCenterCircle,
            leftCenterCircle,
            rightCenterCircle
        ];

        // 缓存8个操作手柄
        var hs = paper.set();

        for(var i = handlers.length; i--;){
            handlers[i].owner = obj;
            handlers[i].blongId = obj.id;
            handlers[i].save = false;
            hs.push(handlers[i]);
        }

        obj.hands = hs;
        
        // 圆形和椭圆，不需要四个顶角的操作手柄
        if(obj.type == 'circle' || obj.type == 'ellipse'){
            leftTopCircle.hide();
            rightTopCircle.hide();
            leftBottomCircle.hide();
            rightBottomCircle.hide();
        }

        // 遍历所有手柄，绑定事件
        for(var i = handlers.length; i--;){
            handler = handlers[i];
            bindEventOfHandler(handler, self);
        }
        
    }
 
    // 获取最新的位置信息
    function getHandlerOption(handler){
        var option,
            box,
            box2,
            x, 
            y, 
            handsPosition, 
            leftBottom,
            rightBottom,
            rightTop, 
            leftTop, 
            bottomCenter,
            topCenter,
            rightCenter,
            leftCenter;
            option = {};
            box = handler.owner.getBBox();
            box2 = handler.getBBox(); // 获取操作手柄最新位置
            x = box2.x + 5;
            y = box2.y + 5;
            handsPosition = getHandsPosition(handler.owner);
            leftBottom = handsPosition.leftBottom;
            rightBottom = handsPosition.rightBottom;
            rightTop = handsPosition.rightTop;
            leftTop = handsPosition.leftTop;
            bottomCenter = handsPosition.bottomCenter;
            topCenter = handsPosition.topCenter;
            rightCenter = handsPosition.rightCenter;
            leftCenter = handsPosition.leftCenter;
            switch(handler.type){
                case 'lt':
                    option.x = x;
                    option.y = y;
                    option.width = box.width+(box.x - x);
                    option.height = box.height+(box.y - y);
                    break;
                case 'lb':
                    option.x = x;
                    option.y = box.y;
                    option.width = (rightTop.x - x);
                    option.height = (y - rightTop.y);
                    break;
                case 'rt':
                    option.x = box.x;
                    option.y = y;
                    option.width = (x - box.x);
                    option.height = (leftBottom.y - y);
                    break;
                case 'rb':
                    option.x = box.x;
                    option.y = box.y;
                    option.width = (x - leftTop.x);
                    option.height = (y - leftTop.y);
                    break;
                case 'tc':
                    if(handler.owner.type == 'circle'){
                        option.x = handler.owner.cx;
                        option.y = handler.owner.cy;
                        option.width = (bottomCenter.y - y);
                        option.height = (bottomCenter.y - y);
                    }else if(handler.owner.type == 'ellipse'){
                        option.x = handler.owner.cx;
                        option.y = handler.owner.cy;
                        option.width = box.width;
                        option.height = (bottomCenter.y - y);
                    }else{
                        option.x = box.x;
                        option.y = y;
                        option.width = box.width;
                        option.height = (leftBottom.y - y);
                    }
                    break;
                case 'bc':
                    if(handler.owner.type == 'circle'){
                        option.x = handler.owner.cx;
                        option.y = handler.owner.cy;
                        option.width = (y - topCenter.y);
                        option.height = (y - topCenter.y);
                    }else if(handler.owner.type == 'ellipse'){
                        option.x = handler.owner.cx;
                        option.y = handler.owner.cy;
                        option.width = box.width;
                        option.height = (y - topCenter.y);
                    }else{
                        option.x = box.x;
                        option.y = box.y;
                        option.width = box.width;
                        option.height = (y - leftTop.y);
                    }
                    break;
                case 'lc':
                    if(handler.owner.type == 'circle'){
                        option.x = handler.owner.cx;
                        option.y = handler.owner.cy;
                        option.width = (rightCenter.x - x);
                        option.height = (rightCenter.x - x);
                    }else if(handler.owner.type == 'ellipse'){
                        option.x = handler.owner.cx;
                        option.y = handler.owner.cy;
                        option.width = (rightCenter.x - x);
                        option.height = box.height;
                    }else{
                        option.x = x;
                        option.y = box.y;
                        option.width = (rightBottom.x - x);
                        option.height = box.height;
                    }
                    break;
                case 'rc':
                    if(handler.owner.type == 'circle'){
                        option.x = handler.owner.cx;
                        option.y = handler.owner.cy;
                        option.width = (x - leftCenter.x);
                        option.height = (x - leftCenter.x);
                    }else if(handler.owner.type == 'ellipse'){
                        option.x = handler.owner.cx;
                        option.y = handler.owner.cy;
                        option.width = (x - leftCenter.x);
                        option.height = box.height;
                    }else{
                        option.x = box.x;
                        option.y = box.y;
                        option.width = (x - leftBottom.x);
                        option.height = box.height;
                    }
                    break;
            }
            option.width = option.width > 10 ? option.width : 10;
            option.height = option.height > 10 ? option.height : 10;

            return option;
    }

    // 刷新八个手柄的方位信息
    function refreshHandsPosition(obj){
        var hands = obj.hands;
        var hand;
        var handsPosition = getHandsPosition(obj);

        for(var i = hands.length; i--;){
            hand = hands[i];
            hand.attr({
                cx: handsPosition[hand.pname].x,
                cy: handsPosition[hand.pname].y
            });
        }
    }
    // 获取八个操作手柄的方位信息
    function getHandsPosition(obj){
        var box = obj.getBBox();
        var x = box.x;
        var y = box.y;
        var width = box.width;
        var height = box.height;
        var halfWidth = width/2;
        var halfHeight = height/2;

        return {
            'leftTop' : {x: x, y: y},
            'rightTop': {x: x + width, y: y},
            'topCenter' : {x: x + halfWidth, y: y},
            'leftBottom' : {x: x, y: y + height},
            'rightBottom' : {x: x + width, y: y + height},
            'bottomCenter' : {x: x + halfWidth, y: y + height},
            'leftCenter' : {x: x, y: y + halfHeight},
            'rightCenter' : {x: x + width, y: y + halfHeight}
        };
    }
    function changeSize(obj, x, y, width, height){
        var attr;
        var self = this;
        var paperW = self.originalParam.sw;
        var paperH = self.originalParam.sh;
        if(obj.type == "rect" || obj.type == "text"){
            attr = {x: x, y: y, width: width, height: height};
        }else if(obj.type == "ellipse"){
            //椭圆的边界处理
            if(obj.attrs.cy+height/2 >= paperH) return;
            if(obj.attrs.cy-height/2 <= 0) return;
            if(obj.attrs.cx+width/2 >= paperW) return;
            if(obj.attrs.cx-width/2 <= 0) return;
            attr = {rx: width/2, ry: height/2};
        }else if(obj.type == "circle"){
            attr = {r: width/2 };
        }
        obj.animate(attr);
        return attr;
    }

    // 缓存手柄中心坐标
    function cacheHandlerPosition(obj){
        if(obj.type == "rect" || obj.type == "text"){
            obj.mx = obj.attr("x");
            obj.my = obj.attr("y");
        }else{
            obj.mx = obj.attr("cx");
            obj.my = obj.attr("cy");
        }
    }
    // 修改图形位置
    function changeHandlerCenterPosition(options){
        var obj = options.obj;
        var dx = options.dx;
        var dy = options.dy;

        var attr = {};
        if(obj.type == "rect" || obj.type == "text"){
            if(typeof dx != 'undefined'){
                attr.x = obj.mx + dx
            }
            if(typeof dy != 'undefined'){
                attr.y = obj.my + dy;
            }
        }else{
            if(typeof dx != 'undefined'){
                attr.cx = obj.mx + dx;
            }
            if(typeof dy != 'undefined'){
                attr.cy = obj.my + dy;
            }
        }
        obj.animate(attr);
        return attr;
    }

    // drag事件
    function dragger() {
        this.ox = this.type == "rect" || this.type == "text" ? this.attr("x") : this.attr("cx");
        this.oy = this.type == "rect" || this.type == "text" ? this.attr("y") : this.attr("cy");
        if(this.type != "text"){
            this.animate({"fill-opacity": .2}, 500);
        }
    }
    // 移动事件（元素块）
    function moveWithGroup(dx, dy) {
        var st = this.parentObj;
        var att = this.type == "rect" || this.type == "text" ? {x: this.ox + dx, y: this.oy + dy} : {cx: this.ox + dx, cy: this.oy + dy};
        for (var i = st.length; i--;) {
            st[i].attr(att)
        }
    }
    // 移动事件（元素块包含连线）
    function moveWithGroupAndLine(dx, dy, pen) {
        var st = this.parentObj;
        var text = st.textObj;
        var rect = st.rectObj;
        var att =  {x: this.ox + dx , y: this.oy + dy};
        
        text.attr(att);

        refreshRectOfText(text, rect);
        
        pen._lineTo();
    }
    // 刷新标注外框
    function refreshRectOfText(textObj, rectObj){
        var box = textObj.getBBox();

        rectObj.attr({
            x:box.x-5, 
            y:box.y-5,
            width:box.width+10, 
            height:box.height+10
        });
    }
    // 移动事件(有连线事件)
    function moveWidthLine(dx, dy, pen) {
        var att = this.type == "rect" || this.type == "text" ? {x: this.ox + dx, y: this.oy + dy} : {cx: this.ox + dx, cy: this.oy + dy};
        this.attr(att);
        pen._lineTo();
    }
    // 移动事件(单个移动)
    function moveSigle(dx, dy) {
        var att = this.type == "rect" || this.type == "text" ? {x: this.ox + dx, y: this.oy + dy} : {cx: this.ox + dx, cy: this.oy + dy};
        this.attr(att);
    }
    // mouseup事件
    function up() {
        if(this.type != "text"){
            this.animate({"fill-opacity": 0}, 500);
        }
    }

    /**
     * @param {obj} obj 框选对象 
     * @param {number} scale 缩放比例 
     * @description 根据圈选区域返回截图对象
     */
    function imgDrawArea(obj, scale){
        var attrs = obj.attrs ;
        var x = '', y = '', w = '', h = '';
        if(obj.type == 'rect'){

            x = attrs.x / scale;
            y = attrs.y / scale;
            w = attrs.width / scale;
            h = attrs.height / scale;

        }else if(obj.type == 'circle'){

            x = (attrs.cx - attrs.r) / scale;
            y = (attrs.cy - attrs.r) / scale;
            w = 2*attrs.r / scale;
            h = 2*attrs.r / scale;

        }else if(obj.type == 'ellipse'){

            x = (attrs.cx - attrs.rx) / scale;
            y = (attrs.cy - attrs.ry) / scale;
            w = 2*attrs.rx / scale;
            h = 2*attrs.ry / scale;

        }

        return originalImage = {
            x: x,
            y :y,
            width : w,
            height : h
        }

    }

    /**
     * @param {string} url image对象的地址
     * @param {obj} container 容器{ width, height}
     * @param {function} callback image加载换算完成的回调
     * @description 按图片容器比例缩放图片
    */
    function resizeimage(url, container, callback) { 
        var img = new Image(); //创建一个Image对象，实现图片的预下载   
        var scale = 1;  //图片的缩放比例  
        
        img.onload = function(){
            img.onload = null;

            var canvas = {
                width: container.width,
                height: container.height
            };

            var imgage = {
                width:img.width,
                height:img.height
            };

            scale = countScale(imgage,canvas);

            imgW = img.width * scale;
            imgH = img.height * scale;
        
            ml = (canvas.width - imgW)/2 ;
            mt = (canvas.height - imgH)/2 ;
            imgW = imgW ;
            imgH = imgH ;


            setTimeout(function(){
            
                callback({
                    img: img,
                    sw: imgW,
                    sh: imgH,
                    ml: ml,
                    mt:mt,
                    width: img.width,
                    height:img.height,
                    scale:scale
                });
            
            },20);
            
        }
        
        img.src = url;
    };

    /**
     * @param {obj} target image对象{ width, height }
     * @param {number} container 容器{ width, height } 
     * @description 内容相对于容器大小进行换算
     */
    function countScale(target,container){

            //画布与图片的比例
            var scale, scaleParam = {
                x: 1,
                y: 1
            };

        //获取画布宽与图片宽比例
        if(target.width < container.width){
            scaleParam.x = 1;
        }else{
            scaleParam.x = (container.width)/target.width;
        }
        //获取画布高与图片高比例
        if(target.height < container.height){
            scaleParam.y = 1;
        }else{
            scaleParam.y = (container.height)/target.height;
        }

        if(scaleParam.x < scaleParam.y){
            
            scale = scaleParam.x;
        }else if(scaleParam.x > scaleParam.y){
        
            scale = scaleParam.y;
        }else{
            
            scale = scaleParam.x; //xc mark:1
        }
        return scale;
    }


    /**
     * 兼容ie8的indexOf方法
     */
    function compatibleIndexOf(){
        if (!Array.prototype.indexOf){
            Array.prototype.indexOf = function(elt /*, from*/){
                var len = this.length >>> 0;
                var from = Number(arguments[1]) || 0;
                from = (from < 0)
                    ? Math.ceil(from)
                    : Math.floor(from);
                if (from < 0)
                from += len;
                for (; from < len; from++)
                {
                if (from in this &&
                    this[from] === elt)
                    return from;
                }
                return -1;
            };
        }
    }

    /**
     * @description 弹窗确定事件
     */
    function confirm(){
        var newtext = document.getElementById('raphaelEditText').value;
        newtext = newtext ? newtext : '请添加标注';
        this.changeText(newtext);
    }

    // 原生js方法appendHtml
    function appendHtml(el, str) {
        var div = document.createElement('div');
        div.innerHTML = str;
        while (div.children.length > 0) {
          el.appendChild(div.children[0]);
        }
      }

    // 生成弹窗结构，并加入到body下
    function addHtml(text, id) {
        var self = this;
        var html = '<div class="raphael-confirm-layer"></div>'+
                        '<div class="raphael-confirm" id="raphaelPopwindow">'+
                            '<div class="confirm-con">'+
                                '<textarea id="raphaelEditText" rows="3" cols="20">'+ text +'</textarea>'+
                            '</div>'+
                        '<div class="confirm-btns">'+
                            '<button class="raphael-btn confirmBtn">确定</button>'+
                            '<button class="raphael-btn cancelBtn">取消</button>'+
                        '</div>'+
                    '</div>';

        $confirm = $(html);

        $confirm.appendTo( $(document.body)).find('.confirmBtn').click(function(){
            confirm.call(self);
            $confirm.remove();
        });
        $confirm.find('.cancelBtn').click(function(){
            $confirm.remove();
        });

    }
    // 删除弹窗
    function removeHtml(){
        document.body.removeChild(document.getElementById('raphaelPopwindow'));
    }

    //生成截图列表
    function drawImageShot(obj){
        var o = this.options;
        console.log(o)
        var original = this.originalParam;
        var imgList = o.imgList;
        var self = this;
        var $imgList = $('#'+imgList.id); 
        var scale = countScale({width:obj.selected.width,height:obj.selected.height},{width:imgList.width,height:imgList.height});
        var style = 'background-image:url('+ o.imgsrc +');'+
                    'width:'+ original.width*scale +'px;height:'+ original.height*scale+'px;'+
                    'left:'+-obj.selected.x*scale+'px;top:'+-obj.selected.y*scale+'px ;';

        var imgConStyle = 'height: '+obj.selected.height*scale+'px;width: '+obj.selected.width*scale+'px; margin-left:'+ (o.imgList.width - obj.selected.width*scale)/2 +'px;margin-top:'+ (o.imgList.height - obj.selected.height*scale)/2 +'px';
        var curIndex = obj.data?obj.data.index:'';
        var curData = obj.data?JSON.stringify(obj.data):'';
        var listData = (obj.listData&&obj.listData.data)?obj.listData.data:[];
        
        if(listData.length >0){
        	
        	var formDataMap = {};

        	for(var i=0,len=listData.length; i<len; i++) {
        		if(listData[i].ATTR_SET && listData[i].ATTR_SET.UUID) {
        			var uuid = listData[i].ATTR_SET.UUID;
        			formDataMap[uuid] = listData[i].ATTR_SET;
        			formDataMap[uuid].FILE_ID = listData[i].FILE_ID;
        			formDataMap[uuid].CONFIRM_STATUS = listData[i].CONFIRM_STATUS;
        		}
        	}
        }
    
        if(!$imgList.find('.raphael-img-list').length){
            $imgList.append('<dl class="raphael-img-list"/>');
        }
        
        var html  = '<dd class="img-item" item-index="'+curIndex+'" id="id'+ obj.id +'" nodeid="'+ obj.id +'" tagType="'+obj.tagType+'" uuid="'+obj.uuid+'" data='+curData+'>'+
				        '<i class="img-icon"></i>'+
				        '<span class="img-view" style="height:'+ imgList.height +'px;width:'+ imgList.width +'px">'+
				            '<span class="img-shot" style="'+imgConStyle+'"><img class="img-bg" src="'+ o.imgsrc +'" style="'+style+'"/></span>'
				  //       '</span>'+
				  //       '<div class="img-tags img-tags-edit editBtn" title="点击编辑当前截图">'+
				  //           '<i class="edit-btn"></i>'+
				  //       '</div>'+
				  //       '<div class="img-tags img-tags-del delBtn" title="点击删除当前截图">'+
				  //           '<i class="del-btn"></i>'+
				  //       '</div>'+
				  //       '<div class="img-cover"></div>';
      //   if(listData.length >0){
      //   	html += '<div class="node-text">'+
				  //       '<p><span>'+rendMarkType(obj.tagType)+'</span></p>'+
				  //       '<p>'+renderMarkInfo(formDataMap[obj.uuid])+'</p>'+
				  //   '</div>'+
			   //  '</dd>';
      //   }else{
      //   	html += '<div class="node-text">'+
			   //      '<p><span>未标注信息</span></p>'+
			   //  '</div>'+
		    // '</dd>';
      //   }
				        
        $(html).appendTo($imgList.find('.raphael-img-list'));
        
        var editFn = o.imgList.editCallBack || function(){};
        var delFn = function(thisObj) {
            var cbReturn = false;
            if( typeof o.imgList.deleteCallBack == 'function'){
                cbReturn = o.imgList.deleteCallBack.call(thisObj);
                if(cbReturn) {
                	var $imgItem = $(thisObj).parents('.img-item'),
                		checkIndex = $imgItem.attr('item-index');
                	if(autoCheckArr.indexOf(checkIndex)>-1){
                		autoCheckArr.splice(checkIndex,1);
                	}
                    self.removeNodeById($imgItem.attr('nodeid'));
                    $imgItem.remove();
                    if(o.drawOnlyOne) o.drawEnable = true;
                }
            } else {
            	var $imgItem = $(thisObj).parents('.img-item'),
	        		checkIndex = $imgItem.attr('item-index');
	        	if(autoCheckArr.indexOf(checkIndex)>-1){
	        		autoCheckArr.splice(checkIndex,1);
	        	}
                self.removeNodeById($imgItem.attr('nodeid'));
                $imgItem.remove();
                if(o.drawOnlyOne) o.drawEnable = true;
            }

        }

        //截图容器下的 “删除”按钮
        $imgList.find(".delBtn").off("click").on("click", function(){
            var thisObj = this;
            UI.util.confirm("是否删除此图片", function(){
                delFn(thisObj);
            });
        });
        //截图容器下的 “编辑”按钮
        $imgList.find(".editBtn").off("click", editFn).on("click", editFn);

        if( typeof o.imgList.drawCallBack == 'function') {
            o.imgList.drawCallBack();
        }

    }
    
    //重绘截图
    function redrawImageShot(obj){
        var o = this.options;
        var original = this.originalParam;
        obj.selected = imgDrawArea(obj, original.scale);
        var scale = countScale({width:obj.selected.width,height:obj.selected.height},{width:o.imgList.width,height:o.imgList.height});
        var style = 'background-image:url('+o.imgsrc+');'+
                    'width:'+ original.width*scale +'px;height:'+ original.height*scale+'px;'+
                    'left:'+-obj.selected.x*scale+'px;top:'+-obj.selected.y*scale+'px ;';

        var imgConStyle = 'height: '+obj.selected.height*scale+'px;width: '+obj.selected.width*scale+'px; margin-left:'+ (o.imgList.width - obj.selected.width*scale)/2 +'px;margin-top:'+ (o.imgList.height - obj.selected.height*scale)/2 +'px';
                    
        $('#id'+obj.id).find('.img-shot').attr('style',imgConStyle).find('.img-bg').attr('style',style);

    }

    compatibleIndexOf(); // 兼容IE8 indexOf
    return ImageCropper;
})(jQuery, window);


