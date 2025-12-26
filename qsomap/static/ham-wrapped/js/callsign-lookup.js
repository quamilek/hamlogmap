/**
 * Callsign Lookup - Parser pliku CTY.DAT
 * Źródło danych: https://www.country-files.com/ (Big CTY by Jim Reisert AD1C)
 * Format pliku: CTY.DAT v9
 */

// Globalna baza DXCC załadowana z CTY.DAT
let CTY_DATABASE = [];
let PREFIX_INDEX = {};
let EXACT_CALLSIGN_INDEX = {};
let SORTED_PREFIXES = [];
let CTY_LOADED = false;

/**
 * Parsuje plik CTY.DAT i buduje bazę danych
 * @param {string} ctyContent - Zawartość pliku CTY.DAT
 */
function parseCtyDat(ctyContent) {
    CTY_DATABASE = [];
    PREFIX_INDEX = {};
    EXACT_CALLSIGN_INDEX = {};

    const lines = ctyContent.split('\n');
    let currentEntity = null;
    let aliasBuffer = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Linia nagłówka encji (zaczyna się od nazwy kraju, nie od spacji)
        if (line.length > 0 && line[0] !== ' ' && line.includes(':')) {
            // Zapisz poprzednią encję jeśli istnieje
            if (currentEntity && aliasBuffer) {
                parseAliases(currentEntity, aliasBuffer);
            }

            // Parsuj nową encję
            currentEntity = parseEntityHeader(line);
            if (currentEntity) {
                CTY_DATABASE.push(currentEntity);
            }
            aliasBuffer = '';
        } else if (currentEntity && line.trim()) {
            // Linia z aliasami (prefiksy i callsigny)
            aliasBuffer += line.trim();
        }
    }

    // Zapisz ostatnią encję
    if (currentEntity && aliasBuffer) {
        parseAliases(currentEntity, aliasBuffer);
    }

    // Buduj posortowany indeks prefiksów
    buildSortedPrefixIndex();

    CTY_LOADED = true;
    console.log(`Załadowano CTY.DAT: ${CTY_DATABASE.length} encji DXCC, ${SORTED_PREFIXES.length} prefiksów, ${Object.keys(EXACT_CALLSIGN_INDEX).length} dokładnych callsignów`);
}

/**
 * Parsuje linię nagłówka encji DXCC
 * Format: Country Name:   CQ:  ITU:  Cont:    Lat:      Lon:     TZ:  Prefix:
 */
function parseEntityHeader(line) {
    // Podziel po dwukropkach
    const parts = line.split(':');
    if (parts.length < 8) return null;

    const name = parts[0].trim();
    const cqZone = parseInt(parts[1].trim(), 10);
    const ituZone = parseInt(parts[2].trim(), 10);
    const continent = parts[3].trim();
    const lat = parseFloat(parts[4].trim());
    const lon = parseFloat(parts[5].trim()) * -1; // CTY używa West jako +, my chcemy East jako +
    const tz = parseFloat(parts[6].trim());
    let primaryPrefix = parts[7].trim();

    // Usuń gwiazdkę z prefiksu (oznacza WAEDC)
    const isWaedc = primaryPrefix.startsWith('*');
    if (isWaedc) {
        primaryPrefix = primaryPrefix.substring(1);
    }

    return {
        name,
        cqZone,
        ituZone,
        continent,
        lat,
        lon,
        tz,
        primaryPrefix,
        isWaedc,
        prefixes: [],
        exactCalls: []
    };
}

/**
 * Parsuje aliasy (prefiksy i dokładne callsigny) dla encji
 */
function parseAliases(entity, aliasString) {
    // Usuń średnik końcowy i podziel po przecinkach
    aliasString = aliasString.replace(/;$/, '').trim();
    const aliases = aliasString.split(',').map(a => a.trim()).filter(a => a);

    for (const alias of aliases) {
        if (!alias) continue;

        let prefix = alias;
        let overrides = {};

        // Wyciągnij override'y: (#) CQ zone, [#] ITU zone, {aa} continent, <lat/lon>, ~tz~

        // Override CQ zone: (nn)
        const cqMatch = prefix.match(/\((\d+)\)/);
        if (cqMatch) {
            overrides.cqZone = parseInt(cqMatch[1], 10);
            prefix = prefix.replace(/\(\d+\)/, '');
        }

        // Override ITU zone: [nn]
        const ituMatch = prefix.match(/\[(\d+)\]/);
        if (ituMatch) {
            overrides.ituZone = parseInt(ituMatch[1], 10);
            prefix = prefix.replace(/\[\d+\]/, '');
        }

        // Override continent: {aa}
        const contMatch = prefix.match(/\{([A-Z]{2})\}/);
        if (contMatch) {
            overrides.continent = contMatch[1];
            prefix = prefix.replace(/\{[A-Z]{2}\}/, '');
        }

        // Override lat/lon: <lat/lon>
        const latLonMatch = prefix.match(/<([^>]+)>/);
        if (latLonMatch) {
            const coords = latLonMatch[1].split('/');
            if (coords.length === 2) {
                overrides.lat = parseFloat(coords[0]);
                overrides.lon = parseFloat(coords[1]) * -1;
            }
            prefix = prefix.replace(/<[^>]+>/, '');
        }

        // Override timezone: ~tz~
        const tzMatch = prefix.match(/~([^~]+)~/);
        if (tzMatch) {
            overrides.tz = parseFloat(tzMatch[1]);
            prefix = prefix.replace(/~[^~]+~/, '');
        }

        // Czy to dokładny callsign (zaczyna się od =)?
        const isExactCall = prefix.startsWith('=');
        if (isExactCall) {
            prefix = prefix.substring(1);
        }

        prefix = prefix.toUpperCase();

        if (isExactCall) {
            entity.exactCalls.push(prefix);
            EXACT_CALLSIGN_INDEX[prefix] = {
                entity,
                overrides
            };
        } else {
            entity.prefixes.push(prefix);
            if (!PREFIX_INDEX[prefix]) {
                PREFIX_INDEX[prefix] = {
                    entity,
                    overrides
                };
            }
        }
    }
}

/**
 * Buduje posortowany indeks prefiksów (od najdłuższych do najkrótszych)
 */
function buildSortedPrefixIndex() {
    SORTED_PREFIXES = Object.keys(PREFIX_INDEX).sort((a, b) => b.length - a.length);
}

/**
 * Znajdź DXCC na podstawie callsigna
 * @param {string} callsign - Znak wywoławczy
 * @returns {Object|null} - Obiekt z informacjami DXCC
 */
function lookupCallsign(callsign) {
    if (!callsign || !CTY_LOADED) return null;

    callsign = callsign.toUpperCase().trim();

    // 1. Sprawdź dokładne dopasowanie callsigna
    if (EXACT_CALLSIGN_INDEX[callsign]) {
        return buildResult(EXACT_CALLSIGN_INDEX[callsign]);
    }

    // 2. Obsłuż callsigny z ukośnikiem (np. EA8/SP3WKW, SP3WKW/P)
    let searchCall = callsign;
    if (callsign.includes('/')) {
        searchCall = resolvePortableCallsign(callsign);
    }

    // 3. Sprawdź dokładne dopasowanie po rozwiązaniu portable
    if (searchCall !== callsign && EXACT_CALLSIGN_INDEX[searchCall]) {
        return buildResult(EXACT_CALLSIGN_INDEX[searchCall]);
    }

    // 4. Szukaj najdłuższego pasującego prefiksu
    for (const prefix of SORTED_PREFIXES) {
        if (searchCall.startsWith(prefix)) {
            return buildResult(PREFIX_INDEX[prefix]);
        }
    }

    // 5. Jeśli nie znaleziono, spróbuj z oryginalnym callsign
    if (searchCall !== callsign) {
        for (const prefix of SORTED_PREFIXES) {
            if (callsign.startsWith(prefix)) {
                return buildResult(PREFIX_INDEX[prefix]);
            }
        }
    }

    return null;
}

/**
 * Rozwiązuje callsign z ukośnikiem do głównego prefiksu
 */
function resolvePortableCallsign(callsign) {
    const parts = callsign.split('/');

    // Typowe sufiksy do ignorowania
    const suffixes = ['P', 'M', 'MM', 'AM', 'QRP', 'A', 'B', 'LH', 'LGT', 'J', 'T', 'G', 'E',
                      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    if (parts.length === 2) {
        // Format: PREFIX/CALL lub CALL/SUFFIX
        const first = parts[0];
        const second = parts[1];

        // Jeśli druga część to typowy sufiks, użyj pierwszej
        if (suffixes.includes(second) || second.length === 1) {
            return first;
        }

        // Jeśli pierwsza część jest krótka (1-4 znaki) i nie wygląda jak callsign, to prefix
        if (first.length <= 4 && !first.match(/\d[A-Z]{2,}$/)) {
            // Format: EA8/SP3WKW - użyj prefiksu EA8
            return first;
        }

        // Jeśli druga część jest krótka i nie jest sufiksem, może być prefiksem
        if (second.length <= 4 && !suffixes.includes(second) && !second.match(/\d[A-Z]{2,}$/)) {
            // Format: SP3WKW/EA8 - użyj prefiksu EA8
            // Ale szukaj najpierw w indeksie
            for (const prefix of SORTED_PREFIXES) {
                if (second.startsWith(prefix) || second === prefix) {
                    return second;
                }
            }
        }

        // Domyślnie użyj pierwszej części
        return first;
    }

    // Więcej niż 2 części - użyj pierwszej która pasuje do prefiksu
    for (const part of parts) {
        for (const prefix of SORTED_PREFIXES) {
            if (part.startsWith(prefix)) {
                return part;
            }
        }
    }

    return parts[0];
}

/**
 * Buduje wynikowy obiekt z informacjami DXCC
 */
function buildResult(match) {
    const entity = match.entity;
    const overrides = match.overrides || {};

    return {
        country: entity.name,
        continent: overrides.continent || entity.continent,
        cqZone: overrides.cqZone || entity.cqZone,
        ituZone: overrides.ituZone || entity.ituZone,
        lat: overrides.lat || entity.lat,
        lon: overrides.lon || entity.lon,
        tz: overrides.tz || entity.tz,
        primaryPrefix: entity.primaryPrefix,
        dxcc: getDxccCode(entity.primaryPrefix)
    };
}

/**
 * Mapowanie głównych prefiksów CTY na kody DXCC ARRL
 * Ta mapa jest potrzebna bo CTY.DAT nie zawiera bezpośrednio kodów DXCC
 */
const PREFIX_TO_DXCC = {
    "1A": 246, "1S": 247, "3A": 260, "3B6": 4, "3B8": 165, "3B9": 207,
    "3C": 49, "3C0": 195, "3D2": 176, "3D2/c": 489, "3D2/r": 460,
    "3DA": 468, "3V": 474, "3W": 293, "3X": 107, "3Y/b": 24, "3Y/p": 199,
    "4J": 18, "4L": 75, "4O": 514, "4S": 315, "4U1I": 117, "4U1U": 289,
    "4U1V": 117, "4W": 511, "4X": 336, "5A": 436, "5B": 215, "5H": 470,
    "5N": 450, "5R": 438, "5T": 444, "5U": 187, "5V": 483, "5W": 190,
    "5X": 286, "5Z": 430, "6W": 456, "6Y": 82, "7O": 492, "7P": 432,
    "7Q": 440, "7X": 400, "8P": 62, "8Q": 159, "8R": 129, "9A": 497,
    "9G": 424, "9H": 257, "9J": 482, "9K": 348, "9L": 458, "9M2": 299,
    "9M6": 46, "9N": 369, "9Q": 414, "9U": 404, "9V": 381, "9X": 454,
    "9Y": 90, "A2": 402, "A3": 160, "A4": 370, "A5": 306, "A6": 391,
    "A7": 376, "A9": 304, "AP": 372, "BS7": 506, "BV": 386, "BV9P": 505,
    "BY": 318, "C2": 157, "C3": 203, "C5": 422, "C6": 60, "C9": 181,
    "CE": 112, "CE0X": 217, "CE0Y": 47, "CE0Z": 125, "CE9": 13,
    "CM": 70, "CN": 446, "CP": 104, "CT": 272, "CT3": 256, "CU": 149,
    "CX": 144, "CY0": 252, "CY9": 211, "D2": 401, "D4": 409, "D6": 39,
    "DL": 81, "DU": 375, "E3": 51, "E4": 510, "E5/n": 191, "E5/s": 234,
    "E6": 188, "E7": 501, "EA": 281, "EA6": 21, "EA8": 29, "EA9": 32,
    "EI": 245, "EK": 14, "EL": 434, "EP": 330, "ER": 179, "ES": 52,
    "ET": 53, "EU": 27, "EX": 135, "EY": 262, "EZ": 280, "F": 227,
    "FG": 79, "FH": 169, "FJ": 516, "FK": 162, "FK/c": 512, "FM": 84,
    "FO": 175, "FO/a": 508, "FO/c": 36, "FO/m": 509, "FP": 277,
    "FR": 453, "FR/g": 99, "FR/j": 124, "FR/t": 276, "FS": 213,
    "FT5W": 41, "FT5X": 131, "FT5Z": 10, "FW": 298, "FY": 63,
    "G": 223, "GD": 114, "GI": 265, "GJ": 122, "GM": 279, "GU": 106,
    "GW": 294, "H4": 185, "H40": 507, "HA": 239, "HB": 287, "HB0": 251,
    "HC": 120, "HC8": 71, "HH": 78, "HI": 72, "HK": 116, "HK0/a": 216,
    "HK0/m": 161, "HL": 137, "HP": 88, "HR": 80, "HS": 387, "HV": 295,
    "HZ": 378, "I": 248, "IS": 225, "IS0": 225, "IT9": 248, "J2": 382,
    "J3": 77, "J5": 109, "J6": 97, "J7": 95, "J8": 98, "JA": 339,
    "JD/m": 177, "JD/o": 192, "JT": 363, "JW": 259, "JX": 118, "JY": 342,
    "K": 291, "KG4": 105, "KH0": 166, "KH1": 20, "KH2": 103, "KH3": 123,
    "KH4": 174, "KH5": 197, "KH5K": 134, "KH6": 110, "KH7K": 138,
    "KH8": 9, "KH8/s": 515, "KH9": 297, "KL": 6, "KP1": 182, "KP2": 285,
    "KP4": 202, "KP5": 43, "LA": 266, "LU": 100, "LX": 254, "LY": 146,
    "LZ": 212, "OA": 136, "OD": 354, "OE": 206, "OH": 224, "OH0": 5,
    "OJ0": 167, "OK": 503, "OM": 504, "ON": 209, "OX": 237, "OY": 222,
    "OZ": 221, "P2": 163, "P4": 91, "P5": 344, "PA": 263, "PJ2": 517,
    "PJ4": 520, "PJ5": 519, "PJ7": 518, "PY": 108, "PY0F": 56,
    "PY0S": 253, "PY0T": 273, "PZ": 140, "R1FJ": 61, "R1MV": 151,
    "S0": 302, "S2": 305, "S5": 499, "S7": 379, "S9": 219, "SM": 284,
    "SP": 269, "ST": 466, "ST0": 244, "SU": 478, "SV": 236, "SV/a": 180,
    "SV5": 45, "SV9": 40, "T2": 282, "T30": 301, "T31": 31, "T32": 48,
    "T33": 490, "T5": 232, "T7": 278, "T8": 22, "TA": 390, "TF": 242,
    "TG": 76, "TI": 308, "TI9": 37, "TJ": 406, "TK": 214, "TL": 408,
    "TN": 412, "TR": 420, "TT": 410, "TU": 428, "TY": 416, "TZ": 442,
    "UA": 54, "UA2": 126, "UA9": 15, "UK": 292, "UN": 130, "UR": 288,
    "V2": 94, "V3": 66, "V4": 249, "V5": 464, "V6": 173, "V7": 168,
    "V8": 345, "VE": 1, "VK": 150, "VK0H": 111, "VK0M": 153,
    "VK9C": 38, "VK9L": 147, "VK9M": 171, "VK9N": 189, "VK9W": 303,
    "VK9X": 35, "VP2E": 12, "VP2M": 96, "VP2V": 65, "VP5": 89,
    "VP6": 172, "VP6/d": 513, "VP8": 141, "VP8/g": 235, "VP8/h": 238,
    "VP8/o": 238, "VP8/s": 240, "VP9": 64, "VQ9": 33, "VR": 321,
    "VU": 324, "VU4": 11, "VU7": 142, "XE": 50, "XF4": 204, "XT": 480,
    "XU": 312, "XW": 143, "XX9": 152, "XZ": 309, "YA": 3, "YB": 327,
    "YI": 333, "YJ": 158, "YK": 384, "YL": 145, "YN": 86, "YO": 275,
    "YS": 74, "YU": 296, "YV": 148, "YV0": 17, "Z2": 452, "Z3": 502,
    "Z6": 522, "Z8": 521, "ZA": 7, "ZB": 233, "ZC4": 283, "ZD7": 250,
    "ZD8": 205, "ZD9": 274, "ZF": 69, "ZK1/n": 191, "ZK1/s": 234,
    "ZK2": 188, "ZK3": 270, "ZL": 170, "ZL7": 34, "ZL8": 133, "ZL9": 16,
    "ZP": 132, "ZS": 462, "ZS8": 201
};

/**
 * Pobierz kod DXCC ARRL na podstawie głównego prefiksu
 */
function getDxccCode(prefix) {
    // Normalizuj prefix
    prefix = prefix.replace(/^\*/, '');

    // Sprawdź dokładne dopasowanie
    if (PREFIX_TO_DXCC[prefix]) {
        return PREFIX_TO_DXCC[prefix];
    }

    // Sprawdź bez wariantów (np. "CE" zamiast "CE0X")
    const basePrefix = prefix.replace(/\/.*$/, '').replace(/[0-9]+$/, '');
    if (PREFIX_TO_DXCC[basePrefix]) {
        return PREFIX_TO_DXCC[basePrefix];
    }

    return null;
}

/**
 * Załaduj plik CTY.DAT z URL lub lokalnego pliku
 */
async function loadCtyDat(url = '/static/ham-wrapped/data/cty.dat') {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const content = await response.text();
        parseCtyDat(content);
        return true;
    } catch (error) {
        console.error('Błąd ładowania CTY.DAT:', error);
        return false;
    }
}

/**
 * Pobierz wszystkie encje DXCC
 */
function getAllDxccEntities() {
    return CTY_DATABASE.map(entity => ({
        name: entity.name,
        continent: entity.continent,
        cqZone: entity.cqZone,
        primaryPrefix: entity.primaryPrefix,
        dxcc: getDxccCode(entity.primaryPrefix)
    }));
}

/**
 * Sprawdź czy baza jest załadowana
 */
function isCtyLoaded() {
    return CTY_LOADED;
}

// Eksport do globalnego scope
window.loadCtyDat = loadCtyDat;
window.lookupCallsign = lookupCallsign;
window.getAllDxccEntities = getAllDxccEntities;
window.isCtyLoaded = isCtyLoaded;
window.PREFIX_TO_DXCC = PREFIX_TO_DXCC;

// Automatyczne ładowanie CTY.DAT przy starcie strony
document.addEventListener('DOMContentLoaded', () => {
    loadCtyDat().then(success => {
        if (success) {
            console.log('CTY.DAT załadowany pomyślnie');
        } else {
            console.warn('Nie udało się załadować CTY.DAT');
        }
    });
});
