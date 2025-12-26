/**
 * ADIF Parser - Parser plików ADIF (Amateur Data Interchange Format)
 * Parsuje standardowy format logów krótkofalarskich
 * Obsługuje również pola specyficzne dla N1MM Logger
 */

class ADIFParser {
    constructor() {
        this.qsos = [];
    }

    /**
     * Parsuje zawartość pliku ADIF
     * @param {string} content - Zawartość pliku ADIF
     * @returns {Array} - Tablica obiektów QSO
     */
    parse(content) {
        this.qsos = [];

        // Usuń nagłówek ADIF (wszystko przed <EOH> lub pierwszym rekordem)
        let dataSection = content;
        const eohMatch = content.match(/<EOH>/i);
        if (eohMatch) {
            dataSection = content.substring(eohMatch.index + 5);
        }

        // Podziel na rekordy po <EOR> - prostsza i bardziej niezawodna metoda
        const records = dataSection.split(/<EOR>/i);

        console.log(`Znaleziono ${records.length} potencjalnych rekordów`);

        for (const recordContent of records) {
            // Pomiń puste rekordy
            if (!recordContent.trim() || !recordContent.includes('<')) {
                continue;
            }

            const qso = this.parseRecord(recordContent);
            if (qso && qso.call) {
                // Uzupełnij brakujące dane z callsign lookup
                this.enrichQSOData(qso);
                this.qsos.push(qso);
            }
        }

        console.log(`Parsed ${this.qsos.length} QSOs total`);
        if (this.qsos.length > 0) {
            console.log('Sample QSO:', this.qsos[0]);
            console.log('Last QSO:', this.qsos[this.qsos.length - 1]);
        }

        // Check and log QSOs from other years
        this.checkNon2025QSOs();

        // Filter to keep only 2025 QSOs
        this.filterTo2025();

        return this.qsos;
    }

    /**
     * Filters QSOs to keep only those from 2025
     */
    filterTo2025() {
        const totalBefore = this.qsos.length;

        this.qsos = this.qsos.filter(qso => {
            // Use dateRaw (original string YYYYMMDD) or date object
            if (qso.dateRaw) {
                return qso.dateRaw.startsWith('2025');
            }
            if (qso.date && qso.date.year) {
                return qso.date.year === 2025;
            }
            return false;
        });

        const filtered = totalBefore - this.qsos.length;
        if (filtered > 0) {
            console.log(`📅 Filtered out ${filtered} QSOs from years other than 2025`);
        }
        console.log(`📊 Using ${this.qsos.length} QSOs from 2025 for Wrapped`);
    }

    /**
     * Checks and logs QSOs from years other than 2025
     */
    checkNon2025QSOs() {
        const qsosByYear = {};

        this.qsos.forEach(qso => {
            let year = null;

            // Get year from dateRaw (original YYYYMMDD string) or date object
            if (qso.dateRaw) {
                year = qso.dateRaw.substring(0, 4);
            } else if (qso.date && qso.date.year) {
                year = String(qso.date.year);
            }

            if (year) {
                if (!qsosByYear[year]) {
                    qsosByYear[year] = [];
                }
                qsosByYear[year].push(qso);
            }
        });

        const years = Object.keys(qsosByYear).sort();
        console.log('=== YEAR ANALYSIS IN LOG ===');
        console.log(`Years found: ${years.join(', ')}`);

        years.forEach(year => {
            const count = qsosByYear[year].length;
            const percentage = ((count / this.qsos.length) * 100).toFixed(1);
            const marker = year !== '2025' ? ' ⚠️ NOT 2025!' : ' ✓';
            console.log(`  ${year}: ${count} QSO (${percentage}%)${marker}`);
        });

        const non2025Years = years.filter(y => y !== '2025');
        if (non2025Years.length > 0) {
            console.warn('⚠️ WARNING: Log contains QSOs from years other than 2025:');
            non2025Years.forEach(year => {
                const qsos = qsosByYear[year];
                console.warn(`  Year ${year}: ${qsos.length} QSO`);
                // Show first 5 example QSOs from this year
                const examples = qsos.slice(0, 5);
                examples.forEach(qso => {
                    const dateStr = qso.dateRaw || `${qso.date.year}-${qso.date.month}-${qso.date.day}`;
                    console.warn(`    - ${dateStr} ${qso.call} ${qso.band || ''} ${qso.mode || ''}`);
                });
                if (qsos.length > 5) {
                    console.warn(`    ... and ${qsos.length - 5} more`);
                }
            });
        } else {
            console.log('✓ All QSOs are from 2025');
        }
        console.log('=== END OF YEAR ANALYSIS ===');
    }

    /**
     * Uzupełnia brakujące dane QSO na podstawie callsign lookup
     * @param {Object} qso - Obiekt QSO do uzupełnienia
     */
    enrichQSOData(qso) {
        // Jeśli brak DXCC lub kontynentu, spróbuj znaleźć na podstawie callsigna
        if (!qso.dxcc || !qso.continent || !qso.country) {
            const lookup = window.lookupCallsign ? window.lookupCallsign(qso.call) : null;

            if (lookup) {
                if (!qso.dxcc) {
                    qso.dxcc = lookup.dxcc;
                }
                if (!qso.continent) {
                    qso.continent = lookup.continent;
                }
                if (!qso.country) {
                    qso.country = lookup.country;
                }
            }
        }
    }

    /**
     * Parsuje pojedynczy rekord QSO
     * @param {string} record - Zawartość rekordu
     * @returns {Object} - Obiekt QSO
     */
    parseRecord(record) {
        const qso = {};

        // Regex do wyciągania pól ADIF: <FIELD_NAME:LENGTH>VALUE lub <FIELD_NAME:LENGTH:TYPE>VALUE
        // Obsługuje nazwy z podkreśleniami (np. APP_N1MM_CONTINENT)
        const fieldRegex = /<([A-Za-z0-9_]+):(\d+)(?::[A-Za-z])?>/gi;
        let fieldMatch;

        while ((fieldMatch = fieldRegex.exec(record)) !== null) {
            const fieldName = fieldMatch[1].toUpperCase();
            const fieldLength = parseInt(fieldMatch[2], 10);
            const valueStart = fieldMatch.index + fieldMatch[0].length;
            const value = record.substring(valueStart, valueStart + fieldLength).trim();

            // Mapuj pola ADIF na właściwości obiektu
            switch (fieldName) {
                case 'CALL':
                    qso.call = value.toUpperCase();
                    break;
                case 'QSO_DATE':
                    qso.date = this.parseDate(value);
                    qso.dateRaw = value;
                    break;
                case 'TIME_ON':
                    qso.timeOn = this.parseTime(value);
                    qso.timeOnRaw = value;
                    break;
                case 'TIME_OFF':
                    qso.timeOff = this.parseTime(value);
                    break;
                case 'BAND':
                    qso.band = value.toUpperCase();
                    break;
                case 'FREQ':
                    qso.freq = parseFloat(value);
                    break;
                case 'MODE':
                    qso.mode = value.toUpperCase();
                    break;
                case 'SUBMODE':
                    qso.submode = value.toUpperCase();
                    break;
                case 'RST_SENT':
                    qso.rstSent = value;
                    break;
                case 'RST_RCVD':
                    qso.rstRcvd = value;
                    break;
                case 'DXCC':
                    qso.dxcc = parseInt(value, 10);
                    break;
                case 'COUNTRY':
                    qso.country = value;
                    break;
                case 'CONT':
                    qso.continent = value.toUpperCase();
                    break;
                // Pola N1MM Logger
                case 'APP_N1MM_CONTINENT':
                    if (!qso.continent) {
                        qso.continent = value.toUpperCase();
                    }
                    break;
                case 'PFX':
                    qso.prefix = value.toUpperCase();
                    break;
                case 'CQZ':
                    qso.cqZone = parseInt(value, 10);
                    break;
                case 'ITUZ':
                    qso.ituZone = parseInt(value, 10);
                    break;
                case 'GRIDSQUARE':
                    qso.gridsquare = value.toUpperCase();
                    break;
                case 'MY_GRIDSQUARE':
                    qso.myGridsquare = value.toUpperCase();
                    break;
                case 'NAME':
                    qso.name = value;
                    break;
                case 'QTH':
                    qso.qth = value;
                    break;
                case 'COMMENT':
                case 'COMMENTS':
                    qso.comment = value;
                    break;
                case 'TX_PWR':
                    qso.txPower = parseFloat(value);
                    break;
                case 'CONTEST_ID':
                    qso.contestId = value;
                    break;
                case 'SRX':
                case 'SRX_STRING':
                    qso.serialReceived = value;
                    break;
                case 'STX':
                case 'STX_STRING':
                    qso.serialSent = value;
                    break;
                case 'OPERATOR':
                    qso.operator = value.toUpperCase();
                    break;
                case 'STATION_CALLSIGN':
                    qso.stationCallsign = value.toUpperCase();
                    break;
                case 'MY_DXCC':
                    qso.myDxcc = parseInt(value, 10);
                    break;
                case 'MY_COUNTRY':
                    qso.myCountry = value;
                    break;
                case 'DISTANCE':
                    qso.distance = parseFloat(value);
                    break;
                case 'PROP_MODE':
                    qso.propMode = value.toUpperCase();
                    break;
                case 'SAT_NAME':
                    qso.satName = value.toUpperCase();
                    break;
                case 'LOTW_QSL_RCVD':
                    qso.lotwQslRcvd = value.toUpperCase();
                    break;
                case 'EQSL_QSL_RCVD':
                    qso.eqslQslRcvd = value.toUpperCase();
                    break;
                case 'QSL_RCVD':
                    qso.qslRcvd = value.toUpperCase();
                    break;
                case 'QSL_SENT':
                    qso.qslSent = value.toUpperCase();
                    break;
                case 'IOTA':
                    qso.iota = value.toUpperCase();
                    break;
                case 'SOTA_REF':
                    qso.sotaRef = value.toUpperCase();
                    break;
                case 'POTA_REF':
                    qso.potaRef = value.toUpperCase();
                    break;
                case 'WWFF_REF':
                    qso.wwffRef = value.toUpperCase();
                    break;
            }
        }

        // Utwórz pełny timestamp
        if (qso.date && qso.timeOn) {
            qso.datetime = new Date(
                qso.date.year,
                qso.date.month - 1,
                qso.date.day,
                qso.timeOn.hours,
                qso.timeOn.minutes,
                qso.timeOn.seconds || 0
            );
        }

        return qso;
    }

    /**
     * Parsuje datę z formatu ADIF (YYYYMMDD)
     */
    parseDate(dateStr) {
        if (!dateStr || dateStr.length < 8) return null;

        return {
            year: parseInt(dateStr.substring(0, 4), 10),
            month: parseInt(dateStr.substring(4, 6), 10),
            day: parseInt(dateStr.substring(6, 8), 10)
        };
    }

    /**
     * Parsuje czas z formatu ADIF (HHMM lub HHMMSS)
     */
    parseTime(timeStr) {
        if (!timeStr || timeStr.length < 4) return null;

        return {
            hours: parseInt(timeStr.substring(0, 2), 10),
            minutes: parseInt(timeStr.substring(2, 4), 10),
            seconds: timeStr.length >= 6 ? parseInt(timeStr.substring(4, 6), 10) : 0
        };
    }

    /**
     * Filtruje QSO po roku
     * @param {number} year - Rok do filtrowania
     * @returns {Array} - Przefiltrowana tablica QSO
     */
    filterByYear(year) {
        return this.qsos.filter(qso => qso.date && qso.date.year === year);
    }

    /**
     * Pobiera dostępne lata w logu
     * @returns {Array} - Tablica dostępnych lat
     */
    getAvailableYears() {
        const years = new Set();
        this.qsos.forEach(qso => {
            if (qso.date && qso.date.year) {
                years.add(qso.date.year);
            }
        });
        return Array.from(years).sort((a, b) => b - a);
    }

    /**
     * Pobiera zakres dat w logu
     */
    getDateRange() {
        if (this.qsos.length === 0) return null;

        const sortedQsos = this.qsos
            .filter(qso => qso.datetime)
            .sort((a, b) => a.datetime - b.datetime);

        if (sortedQsos.length === 0) return null;

        return {
            start: sortedQsos[0].datetime,
            end: sortedQsos[sortedQsos.length - 1].datetime
        };
    }
}

// Export dla użycia w innych modułach
window.ADIFParser = ADIFParser;
