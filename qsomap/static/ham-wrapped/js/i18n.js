/**
 * Internationalization (i18n) - System tłumaczeń
 */

const translations = {
    pl: {
        // Strona główna
        appTitle: 'Ham Wrapped',
        appSubtitle: 'Twoje krótkofalarskie podsumowanie roku',
        yourCallsign: 'Twój znak wywoławczy:',
        callsignPlaceholder: 'np. SP1ABC',
        yourLocator: 'Twój lokator:',
        locatorPlaceholder: 'np. KO02MC',
        locatorHint: 'Potrzebny do obliczenia odległości QSO',
        uploadTitle: 'Wrzuć swój log ADIF',
        uploadDragDrop: 'Przeciągnij plik .adi lub .adif tutaj',
        uploadOr: 'lub',
        uploadButton: 'Wybierz plik',
        processing: 'Przetwarzanie...',
        restart: 'Od nowa',
        shareLink: 'Kopiuj link',
        linkCopied: 'Skopiowano!',

        // Slajdy - intro
        introTitle: 'Twój rok {year}',
        introTitleWithCall: '{callsign} - rok {year}',
        introValue: 'HAM WRAPPED',
        introDescription: 'Odkryj swoje krótkofalarskie podsumowanie roku!',
        introSubtitle: 'Przesuń, aby zobaczyć statystyki →',

        // Slajdy - QSO
        totalQSOsTitle: 'Łączności w tym roku',
        totalQSOsDescription: 'Nawiązałeś {count} QSO!',
        qsoComment1: 'Dobry początek!',
        qsoComment2: 'Świetna robota!',
        qsoComment3: 'Bardzo aktywny rok!',
        qsoComment4: 'Jesteś prawdziwym DX-erem!',
        qsoComment5: 'Niesamowite osiągnięcie!',
        qsoComment6: 'Legenda pasm!',

        // Slajdy - unikalne stacje
        uniqueCallsignsTitle: 'Unikalne stacje',
        uniqueCallsignsDescription: 'Rozmawiałeś z tyloma różnymi stacjami!',
        uniqueCallsignsSubtitle: 'To średnio {avg} QSO na stację',

        // Slajdy - top callsigns
        topCallsignsTitle: 'Top 5 stacji',
        topCallsignsSubtitle: 'Stacje z którymi miałeś najwięcej QSO',
        favoriteStationTitle: 'Ulubiona stacja',

        // Slajdy - miesiąc
        bestMonthTitle: 'Twój najlepszy miesiąc',
        bestMonthDescription: '{count} QSO w tym miesiącu!',
        bestMonthSubtitle: 'To był Twój najbardziej aktywny miesiąc',

        // Slajdy - dzień
        bestDayTitle: 'Rekordowy dzień',
        bestDaySubtitle: 'Twój najbardziej aktywny dzień w roku!',

        // Slajdy - mody
        favoriteModeTitle: 'Twój ulubiony mod',
        favoriteModeDescription: '{percentage}% wszystkich łączności',
        favoriteModeSubtitle: '{count} QSO w tym modzie',
        allModesTitle: 'Rozkład modów',

        // Slajdy - pasmo
        favoriteBandTitle: 'Ulubione pasmo',
        favoriteBandDescription: '{percentage}% łączności',
        favoriteBandSubtitle: 'Pracowałeś na {count} różnych pasmach',
        bandDistributionTitle: 'Rozkład pasm',
        bandDistributionSubtitle: 'Pracowałeś na {count} pasmach',

        // Slajdy - kontynenty
        continentsTitle: 'Kontynenty',
        continentsNoData: 'Brak danych o kontynentach',
        continentsNoDataHint: 'Sprawdź czy plik ADIF zawiera dane o kontynentach',
        continentsSubtitle: 'Dotarłeś do {count} kontynentów!',

        // Slajdy - DXCC
        topDXCCTitle: 'Top 5 DXCC',
        dxccNoData: 'Brak danych o krajach DXCC',
        dxccNoDataHint: 'Sprawdź czy plik ADIF zawiera poprawne callsigns',
        dxccSubtitle: 'Pracowałeś z {count} krajami DXCC!',

        // Slajdy - Band Slots
        bandSlotsTitle: 'Band Slots',
        bandSlotsDescription: 'Unikalne kombinacje DXCC + pasmo',
        bandSlotsSubtitle: '{dxcc} DXCC na {bands} pasmach',
        bandSlotsTopTitle: 'Top kraje wg slotów',

        // Slajdy - ODX
        odxTitle: 'Twój ODX',
        odxStation: 'Stacja: {call}',
        odxBand: 'Pasmo: {band}',
        odxMode: 'Emisja: {mode}',

        // Slajdy - najbliższe QSO
        closestQSOTitle: 'Najbliższe QSO',
        unknownCountry: 'Nieznany kraj',

        // Slajdy - QSO Rate
        qsoRateTitle: 'Najwyższy QSO Rate',
        qsoRateUnit: 'QSO/h',
        qsoRateDescription: 'Twój rekord prędkości!',
        qsoRateSubtitle: 'Osiągnięty: {date}',

        // Slajdy - aktywność
        activityTitle: 'Twoja aktywność',
        activeDays: 'Aktywne dni',
        avgQSOPerDay: 'Średnio QSO/dzień',
        favoriteDay: 'Ulubiony dzień',

        // Slajdy - szczyt aktywności
        peakHourTitle: 'Szczyt aktywności',
        peakHourDescription: 'O tej godzinie najczęściej nadajesz',
        peakHourSubtitle: '{count} QSO w tej godzinie',

        // Slajdy - serie
        streaksTitle: 'Najdłuższa seria',
        streaksUnit: 'dni z rzędu',
        streaksDescription: 'Tyle dni z rzędu nawiązywałeś łączności!',
        streaksSubtitle: 'Od {start} do {end}',

        // Slajdy - strefy CQ
        cqZonesTitle: 'Strefy CQ',
        cqZonesDescription: 'Tyle stref CQ udało Ci się przepracować!',
        cqZonesSubtitle: 'Na świecie jest 40 stref CQ',

        // Slajdy - kontesty
        contestsTitle: 'Kontesty',
        contestsDescription: 'Brałeś udział w {count} kontestach!',
        contestsSubtitle: 'Top 5 kontestów z największą liczbą QSO',
        contestsQSO: 'QSO',

        // Slajdy - podsumowanie
        summaryTitle: '{year} wrapped',
        summaryTitleWithCall: '{callsign} {year} wrapped',
        summaryQSO: 'QSO',
        summaryDXCC: 'DXCC',
        summaryContinents: 'Kontynentów',
        summaryModes: 'Modów',
        summaryBands: 'Pasm',
        summaryCQZones: 'Stref CQ',
        summaryODX: 'ODX',
        summaryActiveDays: 'Aktywnych dni',

        // Miesiące
        months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
                 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],

        // Dni tygodnia
        days: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],

        // Kontynenty
        continentNames: {
            'EU': 'Europa',
            'NA': 'Ameryka Płn.',
            'SA': 'Ameryka Płd.',
            'AF': 'Afryka',
            'AS': 'Azja',
            'OC': 'Oceania',
            'AN': 'Antarktyda'
        }
    },

    en: {
        // Main page
        appTitle: 'Ham Wrapped',
        appSubtitle: 'Your amateur radio year in review',
        yourCallsign: 'Your callsign:',
        callsignPlaceholder: 'e.g. W1AW',
        yourLocator: 'Your locator:',
        locatorPlaceholder: 'e.g. FN31pr',
        locatorHint: 'Required to calculate QSO distances',
        uploadTitle: 'Upload your ADIF log',
        uploadDragDrop: 'Drag and drop .adi or .adif file here',
        uploadOr: 'or',
        uploadButton: 'Choose file',
        processing: 'Processing...',
        restart: 'Start over',
        shareLink: 'Copy share link',
        linkCopied: 'Copied!',

        // Slides - intro
        introTitle: 'Your year {year}',
        introTitleWithCall: '{callsign} - year {year}',
        introValue: 'HAM WRAPPED',
        introDescription: 'Discover your amateur radio year in review!',
        introSubtitle: 'Swipe to see your stats →',

        // Slides - QSO
        totalQSOsTitle: 'Contacts this year',
        totalQSOsDescription: 'You made {count} QSOs!',
        qsoComment1: 'Good start!',
        qsoComment2: 'Great job!',
        qsoComment3: 'Very active year!',
        qsoComment4: 'You are a true DX-er!',
        qsoComment5: 'Incredible achievement!',
        qsoComment6: 'Legend of the bands!',

        // Slides - unique stations
        uniqueCallsignsTitle: 'Unique stations',
        uniqueCallsignsDescription: 'You talked to this many different stations!',
        uniqueCallsignsSubtitle: 'That\'s an average of {avg} QSOs per station',

        // Slides - top callsigns
        topCallsignsTitle: 'Top 5 stations',
        topCallsignsSubtitle: 'Stations you had the most QSOs with',
        favoriteStationTitle: 'Favorite station',

        // Slides - month
        bestMonthTitle: 'Your best month',
        bestMonthDescription: '{count} QSOs this month!',
        bestMonthSubtitle: 'This was your most active month',

        // Slides - day
        bestDayTitle: 'Record day',
        bestDaySubtitle: 'Your most active day of the year!',

        // Slides - modes
        favoriteModeTitle: 'Your favorite mode',
        favoriteModeDescription: '{percentage}% of all contacts',
        favoriteModeSubtitle: '{count} QSOs in this mode',
        allModesTitle: 'Mode distribution',

        // Slides - band
        favoriteBandTitle: 'Favorite band',
        favoriteBandDescription: '{percentage}% of contacts',
        favoriteBandSubtitle: 'You worked on {count} different bands',
        bandDistributionTitle: 'Band distribution',
        bandDistributionSubtitle: 'You worked on {count} bands',

        // Slides - continents
        continentsTitle: 'Continents',
        continentsNoData: 'No continent data',
        continentsNoDataHint: 'Check if ADIF file contains continent data',
        continentsSubtitle: 'You reached {count} continents!',

        // Slides - DXCC
        topDXCCTitle: 'Top 5 DXCC',
        dxccNoData: 'No DXCC country data',
        dxccNoDataHint: 'Check if ADIF file contains valid callsigns',
        dxccSubtitle: 'You worked {count} DXCC entities!',

        // Slides - Band Slots
        bandSlotsTitle: 'Band Slots',
        bandSlotsDescription: 'Unique DXCC + band combinations',
        bandSlotsSubtitle: '{dxcc} DXCC across {bands} bands',
        bandSlotsTopTitle: 'Top countries by slots',

        // Slides - ODX
        odxTitle: 'Your ODX',
        odxStation: 'Station: {call}',
        odxBand: 'Band: {band}',
        odxMode: 'Mode: {mode}',

        // Slides - closest QSO
        closestQSOTitle: 'Closest QSO',
        unknownCountry: 'Unknown country',

        // Slides - QSO Rate
        qsoRateTitle: 'Highest QSO Rate',
        qsoRateUnit: 'QSO/h',
        qsoRateDescription: 'Your speed record!',
        qsoRateSubtitle: 'Achieved: {date}',

        // Slides - activity
        activityTitle: 'Your activity',
        activeDays: 'Active days',
        avgQSOPerDay: 'Avg QSO/day',
        favoriteDay: 'Favorite day',

        // Slides - peak hour
        peakHourTitle: 'Peak activity',
        peakHourDescription: 'This is when you transmit most often',
        peakHourSubtitle: '{count} QSOs at this hour',

        // Slides - streaks
        streaksTitle: 'Longest streak',
        streaksUnit: 'days in a row',
        streaksDescription: 'This many consecutive days you made contacts!',
        streaksSubtitle: 'From {start} to {end}',

        // Slides - CQ zones
        cqZonesTitle: 'CQ Zones',
        cqZonesDescription: 'You worked this many CQ zones!',
        cqZonesSubtitle: 'There are 40 CQ zones in the world',

        // Slides - contests
        contestsTitle: 'Contests',
        contestsDescription: 'You participated in {count} contests!',
        contestsSubtitle: 'Top 5 contests with most QSOs',
        contestsQSO: 'QSO',

        // Slides - summary
        summaryTitle: '{year} wrapped',
        summaryTitleWithCall: '{callsign} {year} wrapped',
        summaryQSO: 'QSO',
        summaryDXCC: 'DXCC',
        summaryContinents: 'Continents',
        summaryModes: 'Modes',
        summaryBands: 'Bands',
        summaryCQZones: 'CQ Zones',
        summaryODX: 'ODX',
        summaryActiveDays: 'Active days',

        // Months
        months: ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'],

        // Days of week
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

        // Continents
        continentNames: {
            'EU': 'Europe',
            'NA': 'North America',
            'SA': 'South America',
            'AF': 'Africa',
            'AS': 'Asia',
            'OC': 'Oceania',
            'AN': 'Antarctica'
        }
    }
};

class I18n {
    constructor() {
        this.currentLang = this.detectLanguage();
    }

    /**
     * Wykryj język przeglądarki
     */
    detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const lang = browserLang.split('-')[0].toLowerCase();

        // Sprawdź czy mamy tłumaczenie dla tego języka
        if (translations[lang]) {
            return lang;
        }

        // Domyślnie angielski
        return 'en';
    }

    /**
     * Ustaw język
     */
    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLang = lang;
            this.updatePageTexts();
        }
    }

    /**
     * Pobierz tłumaczenie
     */
    t(key, params = {}) {
        const keys = key.split('.');
        let value = translations[this.currentLang];

        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                // Fallback do angielskiego
                value = translations['en'];
                for (const k2 of keys) {
                    if (value && value[k2] !== undefined) {
                        value = value[k2];
                    } else {
                        return key; // Zwróć klucz jeśli nie znaleziono
                    }
                }
                break;
            }
        }

        // Podstaw parametry
        if (typeof value === 'string') {
            for (const [param, val] of Object.entries(params)) {
                value = value.replace(new RegExp(`\\{${param}\\}`, 'g'), val);
            }
        }

        return value;
    }

    /**
     * Pobierz nazwę miesiąca
     */
    getMonthName(monthIndex) {
        return translations[this.currentLang].months[monthIndex] || translations['en'].months[monthIndex];
    }

    /**
     * Pobierz nazwę dnia tygodnia
     */
    getDayName(dayIndex) {
        return translations[this.currentLang].days[dayIndex] || translations['en'].days[dayIndex];
    }

    /**
     * Pobierz nazwę kontynentu
     */
    getContinentName(code) {
        return translations[this.currentLang].continentNames[code] ||
               translations['en'].continentNames[code] ||
               code;
    }

    /**
     * Pobierz locale do formatowania dat
     */
    getLocale() {
        return this.currentLang === 'pl' ? 'pl-PL' : 'en-US';
    }

    /**
     * Aktualizuj teksty na stronie
     */
    updatePageTexts() {
        // Aktualizuj elementy z atrybutem data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        // Aktualizuj placeholdery
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
    }
}

// Globalna instancja
const i18n = new I18n();

// Export
window.i18n = i18n;
window.t = (key, params) => i18n.t(key, params);
