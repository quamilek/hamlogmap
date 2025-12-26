/**
 * Statistics Calculator - Oblicza wszystkie statystyki z logu QSO
 */

class StatisticsCalculator {
    constructor(qsos, userLocator = null) {
        this.qsos = qsos;
        this.userLocator = userLocator;
        this.stats = {};
    }

    /**
     * Oblicza wszystkie statystyki
     */
    calculateAll() {
        this.stats = {
            totalQSOs: this.calculateTotalQSOs(),
            uniqueCallsigns: this.calculateUniqueCallsigns(),
            topCallsigns: this.calculateTopCallsigns(),
            byMonth: this.calculateByMonth(),
            byDay: this.calculateByDay(),
            byDayOfWeek: this.calculateByDayOfWeek(),
            byHour: this.calculateByHour(),
            byMode: this.calculateByMode(),
            byBand: this.calculateByBand(),
            byContinent: this.calculateByContinent(),
            byDXCC: this.calculateByDXCC(),
            byCQZone: this.calculateByCQZone(),
            odx: this.calculateODX(),
            closestQSO: this.calculateClosestQSO(),
            qsoRate: this.calculateQSORate(),
            longestDay: this.calculateLongestDay(),
            firstQSO: this.getFirstQSO(),
            lastQSO: this.getLastQSO(),
            contestActivity: this.calculateContestActivity(),
            specialModes: this.calculateSpecialModes(),
            averageQSOsPerDay: this.calculateAverageQSOsPerDay(),
            activeDays: this.calculateActiveDays(),
            streaks: this.calculateStreaks(),
            bandSlots: this.calculateBandSlots()
        };

        return this.stats;
    }

    /**
     * Całkowita liczba QSO
     */
    calculateTotalQSOs() {
        return this.qsos.length;
    }

    /**
     * Unikalne znaki wywoławcze
     */
    calculateUniqueCallsigns() {
        const callsigns = new Set(this.qsos.map(qso => qso.call));
        return {
            count: callsigns.size,
            list: Array.from(callsigns)
        };
    }

    /**
     * Top callsigns - stacje z największą liczbą QSO
     */
    calculateTopCallsigns() {
        const callsignCounts = {};

        this.qsos.forEach(qso => {
            if (qso.call) {
                callsignCounts[qso.call] = (callsignCounts[qso.call] || 0) + 1;
            }
        });

        // Sortuj według liczby QSO malejąco
        const sorted = Object.entries(callsignCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([call, count]) => ({
                call,
                count,
                percentage: ((count / this.qsos.length) * 100).toFixed(1)
            }));

        return {
            top5: sorted.slice(0, 5),
            top10: sorted.slice(0, 10),
            favorite: sorted[0] || null
        };
    }

    /**
     * QSO według miesięcy
     */
    calculateByMonth() {
        const months = {};

        this.qsos.forEach(qso => {
            if (qso.date) {
                const monthKey = qso.date.month;
                months[monthKey] = (months[monthKey] || 0) + 1;
            }
        });

        // Znajdź miesiąc z największą liczbą QSO
        let bestMonth = null;
        let maxQSOs = 0;

        for (const [month, count] of Object.entries(months)) {
            if (count > maxQSOs) {
                maxQSOs = count;
                bestMonth = parseInt(month);
            }
        }

        return {
            distribution: months,
            best: {
                month: bestMonth,
                count: maxQSOs
            }
        };
    }

    /**
     * QSO według dni (znajdź dzień z największą aktywnością)
     */
    calculateByDay() {
        const days = {};

        this.qsos.forEach(qso => {
            if (qso.date) {
                const dayKey = `${qso.date.year}-${String(qso.date.month).padStart(2, '0')}-${String(qso.date.day).padStart(2, '0')}`;
                days[dayKey] = (days[dayKey] || 0) + 1;
            }
        });

        // Znajdź dzień z największą liczbą QSO
        let bestDay = null;
        let maxQSOs = 0;

        for (const [day, count] of Object.entries(days)) {
            if (count > maxQSOs) {
                maxQSOs = count;
                bestDay = day;
            }
        }

        return {
            distribution: days,
            best: {
                date: bestDay,
                count: maxQSOs
            }
        };
    }

    /**
     * QSO według dnia tygodnia
     */
    calculateByDayOfWeek() {
        const days = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

        this.qsos.forEach(qso => {
            if (qso.datetime) {
                const dayOfWeek = qso.datetime.getDay();
                days[dayOfWeek]++;
            }
        });

        // Znajdź najpopularniejszy dzień
        let bestDay = 0;
        let maxQSOs = 0;

        for (const [day, count] of Object.entries(days)) {
            if (count > maxQSOs) {
                maxQSOs = count;
                bestDay = parseInt(day);
            }
        }

        return {
            distribution: days,
            best: {
                day: bestDay,
                dayIndex: bestDay,
                count: maxQSOs
            }
        };
    }

    /**
     * QSO według godziny (UTC)
     */
    calculateByHour() {
        const hours = {};
        for (let i = 0; i < 24; i++) hours[i] = 0;

        this.qsos.forEach(qso => {
            if (qso.timeOn) {
                hours[qso.timeOn.hours]++;
            }
        });

        // Znajdź najpopularniejszą godzinę
        let peakHour = 0;
        let maxQSOs = 0;

        for (const [hour, count] of Object.entries(hours)) {
            if (count > maxQSOs) {
                maxQSOs = count;
                peakHour = parseInt(hour);
            }
        }

        return {
            distribution: hours,
            peak: {
                hour: peakHour,
                count: maxQSOs
            }
        };
    }

    /**
     * QSO według modu (SSB, CW, FT8 itp.)
     */
    calculateByMode() {
        const modes = {};

        this.qsos.forEach(qso => {
            const mode = qso.submode || qso.mode || 'UNKNOWN';
            modes[mode] = (modes[mode] || 0) + 1;
        });

        // Sortuj według popularności
        const sorted = Object.entries(modes)
            .sort((a, b) => b[1] - a[1])
            .map(([mode, count]) => ({
                mode,
                count,
                percentage: ((count / this.qsos.length) * 100).toFixed(1)
            }));

        return {
            distribution: modes,
            sorted,
            favorite: sorted[0]
        };
    }

    /**
     * QSO według pasma
     */
    calculateByBand() {
        const bands = {};

        this.qsos.forEach(qso => {
            const band = qso.band || 'UNKNOWN';
            bands[band] = (bands[band] || 0) + 1;
        });

        // Sortuj według popularności
        const sorted = Object.entries(bands)
            .sort((a, b) => b[1] - a[1])
            .map(([band, count]) => ({
                band,
                count,
                percentage: ((count / this.qsos.length) * 100).toFixed(1)
            }));

        return {
            distribution: bands,
            sorted,
            favorite: sorted[0],
            count: Object.keys(bands).length
        };
    }

    /**
     * QSO według kontynentu
     */
    calculateByContinent() {
        const continents = {};

        this.qsos.forEach(qso => {
            let continent = qso.continent;

            // Jeśli brak kontynentu w QSO, spróbuj pobrać z DXCC lub nazwy kraju
            if (!continent) {
                if (qso.dxcc && DXCC_DATA[qso.dxcc]) {
                    continent = DXCC_DATA[qso.dxcc].continent;
                } else if (qso.country && window.findDxccByName) {
                    const dxccInfo = window.findDxccByName(qso.country);
                    if (dxccInfo) {
                        continent = dxccInfo.continent;
                    }
                }
            }

            if (continent) {
                continents[continent] = (continents[continent] || 0) + 1;
            }
        });

        // Oblicz procenty i sortuj
        const sorted = Object.entries(continents)
            .sort((a, b) => b[1] - a[1])
            .map(([cont, count]) => ({
                continent: cont,
                count,
                percentage: ((count / this.qsos.length) * 100).toFixed(1)
            }));

        return {
            distribution: continents,
            sorted,
            count: Object.keys(continents).length
        };
    }

    /**
     * QSO według kraju DXCC
     */
    calculateByDXCC() {
        const countries = {};

        this.qsos.forEach(qso => {
            // Użyj DXCC z qso lub spróbuj znaleźć na podstawie kraju
            let dxccKey = qso.dxcc;
            let countryName = qso.country;

            if (dxccKey) {
                const dxccInfo = DXCC_DATA[dxccKey];
                if (dxccInfo) {
                    countryName = dxccInfo.name;
                }
            } else if (countryName) {
                // Użyj nazwy kraju jako klucza jeśli brak DXCC
                dxccKey = countryName;
            }

            if (dxccKey) {
                if (!countries[dxccKey]) {
                    countries[dxccKey] = {
                        dxcc: qso.dxcc || null,
                        name: countryName || `DXCC ${dxccKey}`,
                        count: 0
                    };
                }
                countries[dxccKey].count++;
            }
        });

        // Sortuj według liczby QSO
        const sorted = Object.values(countries)
            .sort((a, b) => b.count - a.count);

        return {
            distribution: countries,
            sorted,
            count: Object.keys(countries).length,
            top: sorted[0],
            top5: sorted.slice(0, 5),
            top10: sorted.slice(0, 10)
        };
    }

    /**
     * QSO według strefy CQ
     */
    calculateByCQZone() {
        const zones = {};

        this.qsos.forEach(qso => {
            let zone = qso.cqZone;

            // Jeśli brak strefy w QSO, spróbuj pobrać z DXCC lub nazwy kraju
            if (!zone) {
                if (qso.dxcc && DXCC_DATA[qso.dxcc]) {
                    zone = DXCC_DATA[qso.dxcc].cqZone;
                } else if (qso.country && window.findDxccByName) {
                    const dxccInfo = window.findDxccByName(qso.country);
                    if (dxccInfo) {
                        zone = dxccInfo.cqZone;
                    }
                }
            }

            // Walidacja: strefa CQ musi być liczbą od 1 do 40
            if (zone) {
                const zoneNum = parseInt(zone, 10);
                if (!isNaN(zoneNum) && zoneNum >= 1 && zoneNum <= 40) {
                    zones[zoneNum] = (zones[zoneNum] || 0) + 1;
                }
            }
        });

        return {
            distribution: zones,
            count: Object.keys(zones).length
        };
    }

    /**
     * Oblicz ODX (najdalszą łączność)
     */
    calculateODX() {
        if (!this.userLocator) {
            return this.calculateODXFromLog();
        }

        const userCoords = this.locatorToCoords(this.userLocator);
        if (!userCoords) return null;

        let maxDistance = 0;
        let odxQSO = null;

        this.qsos.forEach(qso => {
            let targetCoords = null;

            // Próbuj użyć gridsquare z QSO
            if (qso.gridsquare) {
                targetCoords = this.locatorToCoords(qso.gridsquare);
            }

            // Jeśli brak, użyj współrzędnych DXCC (najpierw po ID, potem po nazwie)
            if (!targetCoords) {
                let dxccInfo = null;
                if (qso.dxcc && DXCC_DATA[qso.dxcc]) {
                    dxccInfo = DXCC_DATA[qso.dxcc];
                } else if (qso.country && window.findDxccByName) {
                    dxccInfo = window.findDxccByName(qso.country);
                }
                if (dxccInfo && dxccInfo.lat && dxccInfo.lon) {
                    targetCoords = { lat: dxccInfo.lat, lon: dxccInfo.lon };
                }
            }

            if (targetCoords) {
                const distance = this.calculateDistance(userCoords, targetCoords);
                if (distance > maxDistance) {
                    maxDistance = distance;
                    // Priorytet: qso.country (z callsign lookup), potem DXCC_DATA
                    let countryName = qso.country;
                    if (!countryName && qso.dxcc && DXCC_DATA[qso.dxcc]) {
                        countryName = DXCC_DATA[qso.dxcc].name;
                    }
                    odxQSO = {
                        ...qso,
                        distance,
                        dxccName: countryName
                    };
                }
            }
        });

        return odxQSO;
    }

    /**
     * Oblicz ODX z danych w logu (jeśli zawierają distance)
     */
    calculateODXFromLog() {
        let maxDistance = 0;
        let odxQSO = null;

        this.qsos.forEach(qso => {
            if (qso.distance && qso.distance > maxDistance) {
                maxDistance = qso.distance;
                // Priorytet: qso.country (z callsign lookup), potem DXCC_DATA
                let countryName = qso.country;
                if (!countryName && qso.dxcc && DXCC_DATA[qso.dxcc]) {
                    countryName = DXCC_DATA[qso.dxcc].name;
                }
                odxQSO = {
                    ...qso,
                    dxccName: countryName
                };
            }
        });

        // Jeśli brak distance w logu, oszacuj na podstawie DXCC
        if (!odxQSO) {
            // Załóż że użytkownik jest z Polski (domyślnie)
            const defaultUserCoords = { lat: 52.0, lon: 20.0 };

            this.qsos.forEach(qso => {
                let dxccInfo = null;
                if (qso.dxcc && DXCC_DATA[qso.dxcc]) {
                    dxccInfo = DXCC_DATA[qso.dxcc];
                } else if (qso.country && window.findDxccByName) {
                    dxccInfo = window.findDxccByName(qso.country);
                }

                if (dxccInfo && dxccInfo.lat && dxccInfo.lon) {
                    const targetCoords = { lat: dxccInfo.lat, lon: dxccInfo.lon };
                    const distance = this.calculateDistance(defaultUserCoords, targetCoords);

                    if (distance > maxDistance) {
                        maxDistance = distance;
                        // Priorytet: qso.country (z callsign lookup), potem DXCC_DATA
                        let countryName = qso.country || dxccInfo.name;
                        odxQSO = {
                            ...qso,
                            distance,
                            dxccName: countryName
                        };
                    }
                }
            });
        }

        return odxQSO;
    }

    /**
     * Oblicz najbliższą łączność
     */
    calculateClosestQSO() {
        if (!this.userLocator) {
            return this.calculateClosestFromLog();
        }

        const userCoords = this.locatorToCoords(this.userLocator);
        if (!userCoords) return null;

        let minDistance = Infinity;
        let closestQSO = null;

        this.qsos.forEach(qso => {
            let targetCoords = null;

            if (qso.gridsquare) {
                targetCoords = this.locatorToCoords(qso.gridsquare);
            }

            // Jeśli brak gridsquare, użyj współrzędnych DXCC
            if (!targetCoords) {
                let dxccInfo = null;
                if (qso.dxcc && DXCC_DATA[qso.dxcc]) {
                    dxccInfo = DXCC_DATA[qso.dxcc];
                } else if (qso.country && window.findDxccByName) {
                    dxccInfo = window.findDxccByName(qso.country);
                }
                if (dxccInfo && dxccInfo.lat && dxccInfo.lon) {
                    targetCoords = { lat: dxccInfo.lat, lon: dxccInfo.lon };
                }
            }

            if (targetCoords) {
                const distance = this.calculateDistance(userCoords, targetCoords);
                if (distance > 0 && distance < minDistance) {
                    minDistance = distance;
                    // Priorytet: qso.country (z callsign lookup), potem DXCC_DATA
                    let countryName = qso.country;
                    if (!countryName && qso.dxcc && DXCC_DATA[qso.dxcc]) {
                        countryName = DXCC_DATA[qso.dxcc].name;
                    }
                    closestQSO = {
                        ...qso,
                        distance,
                        dxccName: countryName
                    };
                }
            }
        });

        return closestQSO;
    }

    /**
     * Oblicz najbliższe QSO z danych w logu
     */
    calculateClosestFromLog() {
        let minDistance = Infinity;
        let closestQSO = null;

        this.qsos.forEach(qso => {
            if (qso.distance && qso.distance > 0 && qso.distance < minDistance) {
                minDistance = qso.distance;
                // Priorytet: qso.country (z callsign lookup), potem DXCC_DATA
                let countryName = qso.country;
                if (!countryName && qso.dxcc && DXCC_DATA[qso.dxcc]) {
                    countryName = DXCC_DATA[qso.dxcc].name;
                }
                closestQSO = {
                    ...qso,
                    dxccName: countryName
                };
            }
        });

        return closestQSO;
    }

    /**
     * Oblicz najwyższy QSO rate (QSO na godzinę)
     */
    calculateQSORate() {
        const hourlyBuckets = {};

        this.qsos.forEach(qso => {
            if (qso.datetime && !isNaN(qso.datetime.getTime())) {
                // Klucz: data + godzina w formacie ISO z :00:00
                const hourKey = qso.datetime.toISOString().substring(0, 13) + ':00:00.000Z';
                hourlyBuckets[hourKey] = (hourlyBuckets[hourKey] || 0) + 1;
            } else if (qso.date && qso.timeOn) {
                // Fallback - utwórz klucz z date i timeOn
                const hourKey = `${qso.date.year}-${String(qso.date.month).padStart(2, '0')}-${String(qso.date.day).padStart(2, '0')}T${String(qso.timeOn.hours).padStart(2, '0')}:00:00.000Z`;
                hourlyBuckets[hourKey] = (hourlyBuckets[hourKey] || 0) + 1;
            }
        });

        // Znajdź maksymalny rate
        let maxRate = 0;
        let peakHour = null;

        for (const [hour, count] of Object.entries(hourlyBuckets)) {
            if (count > maxRate) {
                maxRate = count;
                peakHour = hour;
            }
        }

        // Utwórz datę z peakHour
        let peakDate = null;
        if (peakHour) {
            peakDate = new Date(peakHour);
            // Sprawdź czy data jest poprawna
            if (isNaN(peakDate.getTime())) {
                peakDate = null;
            }
        }

        return {
            maxRate,
            peakHour,
            peakDate
        };
    }

    /**
     * Znajdź dzień z najdłuższą aktywnością
     */
    calculateLongestDay() {
        const dayActivity = {};

        this.qsos.forEach(qso => {
            if (qso.datetime && qso.date) {
                const dayKey = `${qso.date.year}-${String(qso.date.month).padStart(2, '0')}-${String(qso.date.day).padStart(2, '0')}`;

                if (!dayActivity[dayKey]) {
                    dayActivity[dayKey] = {
                        firstQSO: qso.datetime,
                        lastQSO: qso.datetime,
                        count: 0
                    };
                }

                if (qso.datetime < dayActivity[dayKey].firstQSO) {
                    dayActivity[dayKey].firstQSO = qso.datetime;
                }
                if (qso.datetime > dayActivity[dayKey].lastQSO) {
                    dayActivity[dayKey].lastQSO = qso.datetime;
                }
                dayActivity[dayKey].count++;
            }
        });

        // Oblicz czas trwania dla każdego dnia
        let longestDay = null;
        let maxDuration = 0;

        for (const [day, activity] of Object.entries(dayActivity)) {
            const duration = (activity.lastQSO - activity.firstQSO) / (1000 * 60 * 60); // godziny
            if (duration > maxDuration) {
                maxDuration = duration;
                longestDay = {
                    date: day,
                    duration: duration.toFixed(1),
                    count: activity.count,
                    firstQSO: activity.firstQSO,
                    lastQSO: activity.lastQSO
                };
            }
        }

        return longestDay;
    }

    /**
     * Pierwsze QSO w roku
     */
    getFirstQSO() {
        const sorted = this.qsos
            .filter(qso => qso.datetime)
            .sort((a, b) => a.datetime - b.datetime);

        return sorted[0] || null;
    }

    /**
     * Ostatnie QSO w roku
     */
    getLastQSO() {
        const sorted = this.qsos
            .filter(qso => qso.datetime)
            .sort((a, b) => b.datetime - a.datetime);

        return sorted[0] || null;
    }

    /**
     * Aktywność w zawodach
     */
    calculateContestActivity() {
        const contests = {};

        this.qsos.forEach(qso => {
            if (qso.contestId) {
                contests[qso.contestId] = (contests[qso.contestId] || 0) + 1;
            }
        });

        const sorted = Object.entries(contests)
            .sort((a, b) => b[1] - a[1])
            .map(([contest, count]) => ({ contest, count }));

        return {
            total: Object.keys(contests).length,
            contests: sorted,
            qsosInContests: Object.values(contests).reduce((a, b) => a + b, 0)
        };
    }

    /**
     * Specjalne mody (satelity, SOTA, POTA, IOTA)
     */
    calculateSpecialModes() {
        let satellite = 0;
        let sota = 0;
        let pota = 0;
        let iota = 0;
        let wwff = 0;

        this.qsos.forEach(qso => {
            if (qso.satName || qso.propMode === 'SAT') satellite++;
            if (qso.sotaRef) sota++;
            if (qso.potaRef) pota++;
            if (qso.iota) iota++;
            if (qso.wwffRef) wwff++;
        });

        return {
            satellite: { count: satellite, label: 'Satelitarne' },
            sota: { count: sota, label: 'SOTA' },
            pota: { count: pota, label: 'POTA' },
            iota: { count: iota, label: 'IOTA' },
            wwff: { count: wwff, label: 'WWFF' }
        };
    }

    /**
     * Średnia liczba QSO na dzień
     */
    calculateAverageQSOsPerDay() {
        const days = new Set();

        this.qsos.forEach(qso => {
            if (qso.date) {
                const dayKey = `${qso.date.year}-${qso.date.month}-${qso.date.day}`;
                days.add(dayKey);
            }
        });

        const activeDays = days.size;
        return {
            average: activeDays > 0 ? (this.qsos.length / activeDays).toFixed(1) : 0,
            activeDays
        };
    }

    /**
     * Liczba aktywnych dni
     */
    calculateActiveDays() {
        const days = new Set();

        this.qsos.forEach(qso => {
            if (qso.date) {
                const dayKey = `${qso.date.year}-${qso.date.month}-${qso.date.day}`;
                days.add(dayKey);
            }
        });

        return days.size;
    }

    /**
     * Oblicz serie (streaks) - dni z rzędu z QSO
     */
    calculateStreaks() {
        const days = new Set();

        this.qsos.forEach(qso => {
            if (qso.date) {
                const dayKey = `${qso.date.year}-${String(qso.date.month).padStart(2, '0')}-${String(qso.date.day).padStart(2, '0')}`;
                days.add(dayKey);
            }
        });

        const sortedDays = Array.from(days).sort();

        let maxStreak = 0;
        let currentStreak = 1;
        let maxStreakStart = null;
        let maxStreakEnd = null;
        let currentStreakStart = sortedDays[0];

        for (let i = 1; i < sortedDays.length; i++) {
            const prevDate = new Date(sortedDays[i - 1]);
            const currDate = new Date(sortedDays[i]);
            const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                currentStreak++;
            } else {
                if (currentStreak > maxStreak) {
                    maxStreak = currentStreak;
                    maxStreakStart = currentStreakStart;
                    maxStreakEnd = sortedDays[i - 1];
                }
                currentStreak = 1;
                currentStreakStart = sortedDays[i];
            }
        }

        // Sprawdź ostatnią serię
        if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
            maxStreakStart = currentStreakStart;
            maxStreakEnd = sortedDays[sortedDays.length - 1];
        }

        return {
            maxStreak,
            maxStreakStart,
            maxStreakEnd
        };
    }

    /**
     * Konwertuj lokator Maidenhead na współrzędne
     */
    locatorToCoords(locator) {
        if (!locator || locator.length < 4) return null;

        locator = locator.toUpperCase();

        // Pierwsza para (field) - AA do RR
        const lon1 = (locator.charCodeAt(0) - 65) * 20 - 180;
        const lat1 = (locator.charCodeAt(1) - 65) * 10 - 90;

        // Druga para (square) - 00 do 99
        const lon2 = parseInt(locator[2]) * 2;
        const lat2 = parseInt(locator[3]) * 1;

        let lon = lon1 + lon2 + 1;
        let lat = lat1 + lat2 + 0.5;

        // Trzecia para (subsquare) - jeśli istnieje
        if (locator.length >= 6) {
            const lon3 = (locator.charCodeAt(4) - 65) * (2/24);
            const lat3 = (locator.charCodeAt(5) - 65) * (1/24);
            lon = lon1 + lon2 + lon3 + (1/24);
            lat = lat1 + lat2 + lat3 + (1/48);
        }

        return { lat, lon };
    }

    /**
     * Oblicz band slots (unikalne kombinacje DXCC + pasmo)
     */
    calculateBandSlots() {
        const slots = new Set();
        const slotsByDxcc = {};
        const slotsByBand = {};

        this.qsos.forEach(qso => {
            // Pobierz DXCC - z qso.dxcc lub z nazwy kraju
            let dxccKey = qso.dxcc;
            let dxccName = qso.country;

            if (dxccKey && DXCC_DATA[dxccKey]) {
                dxccName = DXCC_DATA[dxccKey].name;
            } else if (dxccName && window.findDxccByName) {
                const dxccInfo = window.findDxccByName(dxccName);
                if (dxccInfo) {
                    dxccKey = dxccInfo.dxcc || dxccName;
                }
            }

            const band = qso.band;

            // Potrzebujemy zarówno DXCC jak i pasma
            if ((dxccKey || dxccName) && band) {
                const entityKey = dxccKey || dxccName;
                const slotKey = `${entityKey}::${band}`;
                
                if (!slots.has(slotKey)) {
                    slots.add(slotKey);

                    // Zlicz sloty per DXCC
                    if (!slotsByDxcc[entityKey]) {
                        slotsByDxcc[entityKey] = {
                            name: dxccName || `DXCC ${entityKey}`,
                            bands: new Set(),
                            count: 0
                        };
                    }
                    slotsByDxcc[entityKey].bands.add(band);
                    slotsByDxcc[entityKey].count++;

                    // Zlicz sloty per Band
                    if (!slotsByBand[band]) {
                        slotsByBand[band] = new Set();
                    }
                    slotsByBand[band].add(entityKey);
                }
            }
        });

        // Sortuj DXCC według liczby slotów
        const topDxcc = Object.entries(slotsByDxcc)
            .map(([key, data]) => ({
                dxcc: key,
                name: data.name,
                slots: data.count,
                bands: Array.from(data.bands)
            }))
            .sort((a, b) => b.slots - a.slots);

        return {
            totalSlots: slots.size,
            dxccCount: Object.keys(slotsByDxcc).length,
            bandCount: Object.keys(slotsByBand).length,
            topDxcc: topDxcc.slice(0, 5),
            allDxcc: topDxcc
        };
    }

    /**
     * Oblicz odległość między dwoma punktami (formuła Haversine)
     */
    calculateDistance(coords1, coords2) {
        const R = 6371; // Promień Ziemi w km

        const lat1 = coords1.lat * Math.PI / 180;
        const lat2 = coords2.lat * Math.PI / 180;
        const deltaLat = (coords2.lat - coords1.lat) * Math.PI / 180;
        const deltaLon = (coords2.lon - coords1.lon) * Math.PI / 180;

        const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLon/2) * Math.sin(deltaLon/2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return Math.round(R * c);
    }
}

// Export
window.StatisticsCalculator = StatisticsCalculator;
