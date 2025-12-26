/**
 * URL Share - Kodowanie i dekodowanie statystyk w URL
 * Używa kompresji LZString dla krótkich URLi
 */

// LZString - biblioteka kompresji (MIT License)
// https://github.com/pieroxy/lz-string
var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},e={compressToEncodedURIComponent:function(o){return null==o?"":e._compress(o,6,function(o){return n.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),e._decompress(r.length,32,function(t){return o(n,r.charAt(t))}))},_compress:function(o,n,t){if(null==o)return"";var e,i,s,u={},c={},a="",p="",h="",l=2,f=3,d=2,m=[],v=0,g=0;for(s=0;s<o.length;s+=1)if(a=o.charAt(s),Object.prototype.hasOwnProperty.call(u,a)||(u[a]=f++,c[a]=!0),p=h+a,Object.prototype.hasOwnProperty.call(u,p))h=p;else{if(Object.prototype.hasOwnProperty.call(c,h)){if(h.charCodeAt(0)<256){for(e=0;e<d;e++)v<<=1,g==n-1?(g=0,m.push(t(v)),v=0):g++;for(i=h.charCodeAt(0),e=0;e<8;e++)v=v<<1|1&i,g==n-1?(g=0,m.push(t(v)),v=0):g++,i>>=1}else{for(i=1,e=0;e<d;e++)v=v<<1|i,g==n-1?(g=0,m.push(t(v)),v=0):g++,i=0;for(i=h.charCodeAt(0),e=0;e<16;e++)v=v<<1|1&i,g==n-1?(g=0,m.push(t(v)),v=0):g++,i>>=1}0==--l&&(l=Math.pow(2,d),d++),delete c[h]}else for(i=u[h],e=0;e<d;e++)v=v<<1|1&i,g==n-1?(g=0,m.push(t(v)),v=0):g++,i>>=1;0==--l&&(l=Math.pow(2,d),d++),u[p]=f++,h=String(a)}if(""!==h){if(Object.prototype.hasOwnProperty.call(c,h)){if(h.charCodeAt(0)<256){for(e=0;e<d;e++)v<<=1,g==n-1?(g=0,m.push(t(v)),v=0):g++;for(i=h.charCodeAt(0),e=0;e<8;e++)v=v<<1|1&i,g==n-1?(g=0,m.push(t(v)),v=0):g++,i>>=1}else{for(i=1,e=0;e<d;e++)v=v<<1|i,g==n-1?(g=0,m.push(t(v)),v=0):g++,i=0;for(i=h.charCodeAt(0),e=0;e<16;e++)v=v<<1|1&i,g==n-1?(g=0,m.push(t(v)),v=0):g++,i>>=1}0==--l&&(l=Math.pow(2,d),d++),delete c[h]}else for(i=u[h],e=0;e<d;e++)v=v<<1|1&i,g==n-1?(g=0,m.push(t(v)),v=0):g++,i>>=1;0==--l&&(l=Math.pow(2,d),d++)}for(i=2,e=0;e<d;e++)v=v<<1|1&i,g==n-1?(g=0,m.push(t(v)),v=0):g++,i>>=1;for(;;){if(v<<=1,g==n-1){m.push(t(v));break}g++}return m.join("")},_decompress:function(o,n,t){var e,i,s,u,c,a,p,h=[],l=4,f=4,d=3,m="",v=[],g={val:t(0),position:n,index:1};for(e=0;e<3;e+=1)h[e]=e;for(s=0,c=Math.pow(2,2),a=1;a!=c;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=t(g.index++)),s|=(u>0?1:0)*a,a<<=1;switch(s){case 0:for(s=0,c=Math.pow(2,8),a=1;a!=c;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=t(g.index++)),s|=(u>0?1:0)*a,a<<=1;p=r(s);break;case 1:for(s=0,c=Math.pow(2,16),a=1;a!=c;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=t(g.index++)),s|=(u>0?1:0)*a,a<<=1;p=r(s);break;case 2:return""}for(h[3]=p,i=p,v.push(p);;){if(g.index>o)return"";for(s=0,c=Math.pow(2,d),a=1;a!=c;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=t(g.index++)),s|=(u>0?1:0)*a,a<<=1;switch(p=s){case 0:for(s=0,c=Math.pow(2,8),a=1;a!=c;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=t(g.index++)),s|=(u>0?1:0)*a,a<<=1;h[f++]=r(s),p=f-1,l--;break;case 1:for(s=0,c=Math.pow(2,16),a=1;a!=c;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=t(g.index++)),s|=(u>0?1:0)*a,a<<=1;h[f++]=r(s),p=f-1,l--;break;case 2:return v.join("")}if(0==l&&(l=Math.pow(2,d),d++),h[p])m=h[p];else{if(p!==f)return null;m=i+i.charAt(0)}v.push(m),h[f++]=i+m.charAt(0),i=m,0==--l&&(l=Math.pow(2,d),d++)}}};return e}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module?module.exports=LZString:"undefined"!=typeof angular&&null!=angular&&angular.module("LZString",[]).factory("LZString",function(){return LZString});

/**
 * Serializuje statystyki do krótkiego formatu
 * Używa jednoliterowych kluczy dla minimalnego rozmiaru
 */
function serializeStats(stats, userCallsign, year) {
    const data = {
        v: 1, // wersja formatu
        c: userCallsign || '', // callsign
        y: year || 2025, // rok
        // Podstawowe statystyki
        t: stats.totalQSOs, // total QSOs
        u: stats.uniqueCallsigns?.count || 0, // unique callsigns
        // Top callsign
        tc: stats.topCallsigns?.favorite ? {
            c: stats.topCallsigns.favorite.call,
            n: stats.topCallsigns.favorite.count
        } : null,
        // Top 5 callsigns
        t5: stats.topCallsigns?.top5?.map(s => [s.call, s.count]) || [],
        // Best month
        bm: stats.byMonth?.best ? {
            m: stats.byMonth.best.month,
            n: stats.byMonth.best.count
        } : null,
        // Best day
        bd: stats.byDay?.best ? {
            d: stats.byDay.best.date,
            n: stats.byDay.best.count
        } : null,
        // Favorite mode
        fm: stats.byMode?.favorite ? {
            m: stats.byMode.favorite.mode,
            p: parseFloat(stats.byMode.favorite.percentage),
            n: stats.byMode.favorite.count || 0
        } : null,
        // Mode distribution (top 5)
        md: stats.byMode?.sorted?.slice(0, 5).map(m => [m.mode, parseFloat(m.percentage), m.count || 0]) || [],
        // Favorite band
        fb: stats.byBand?.favorite ? {
            b: stats.byBand.favorite.band,
            p: parseFloat(stats.byBand.favorite.percentage),
            n: stats.byBand.favorite.count || 0
        } : null,
        // Band count
        bc: stats.byBand?.count || 0,
        // Band distribution
        bd2: stats.byBand?.sorted?.map(b => [b.band, parseFloat(b.percentage)]) || [],
        // Continents
        co: stats.byContinent?.sorted?.map(c => [c.continent, parseFloat(c.percentage)]) || [],
        cc: stats.byContinent?.count || 0,
        // DXCC
        dx: stats.byDXCC?.sorted?.slice(0, 5).map(d => [d.dxccName || d.dxcc, d.count]) || [],
        dc: stats.byDXCC?.count || 0,
        // CQ Zones
        cq: stats.byCQZone?.count || 0,
        // ODX
        ox: stats.odx ? {
            c: stats.odx.call,
            d: stats.odx.distance,
            n: stats.odx.dxccName
        } : null,
        // Closest QSO
        cl: stats.closestQSO ? {
            c: stats.closestQSO.call,
            d: stats.closestQSO.distance
        } : null,
        // QSO Rate
        qr: stats.qsoRate?.maxRate || 0,
        // Active days
        ad: stats.activeDays || 0,
        // Average QSO per day
        av: stats.averageQSOsPerDay?.average || 0,
        // Peak hour
        ph: stats.byHour?.peak ? {
            h: stats.byHour.peak.hour,
            n: stats.byHour.peak.count
        } : null,
        // Best day of week
        dw: stats.byDayOfWeek?.best ? {
            d: stats.byDayOfWeek.best.dayIndex,
            n: stats.byDayOfWeek.best.count
        } : null,
        // Streaks
        st: stats.streaks?.maxStreak || 0
    };

    return data;
}

/**
 * Deserializuje statystyki z krótkiego formatu
 */
function deserializeStats(data) {
    if (!data || data.v !== 1) return null;

    // Pełna rekonstrukcja obiektu statystyk
    const stats = {
        totalQSOs: data.t || 0,
        uniqueCallsigns: { 
            count: data.u || 0,
            list: []
        },
        topCallsigns: {
            favorite: data.tc ? { call: data.tc.c, count: data.tc.n, percentage: '0' } : null,
            top5: data.t5?.map(([call, count]) => ({ call, count, percentage: '0' })) || [],
            top10: []
        },
        byMonth: {
            best: data.bm ? { month: data.bm.m, count: data.bm.n } : { month: 1, count: 0 },
            distribution: {}
        },
        byDay: {
            best: data.bd ? { date: data.bd.d, count: data.bd.n } : { date: '', count: 0 },
            distribution: {}
        },
        byMode: {
            favorite: data.fm ? { mode: data.fm.m, percentage: String(data.fm.p), count: data.fm.n || 0 } : { mode: 'SSB', percentage: '0', count: 0 },
            sorted: data.md?.map(([mode, percentage, count]) => ({ mode, percentage: String(percentage), count: count || 0 })) || [],
            count: data.md?.length || 0,
            distribution: {}
        },
        byBand: {
            favorite: data.fb ? { band: data.fb.b, percentage: String(data.fb.p), count: data.fb.n || 0 } : { band: '20M', percentage: '0', count: 0 },
            sorted: data.bd2?.map(([band, percentage]) => ({ band, percentage: String(percentage), count: 0 })) || [],
            count: data.bc || 0,
            distribution: {}
        },
        byContinent: {
            sorted: data.co?.map(([continent, percentage]) => ({ continent, percentage: String(percentage), count: 0 })) || [],
            count: data.cc || 0,
            distribution: {}
        },
        byDXCC: {
            sorted: data.dx?.map(([name, count]) => ({ dxccName: name, dxcc: name, count })) || [],
            count: data.dc || 0,
            distribution: {}
        },
        byCQZone: { 
            count: data.cq || 0,
            distribution: {},
            sorted: []
        },
        odx: data.ox ? {
            call: data.ox.c,
            distance: data.ox.d,
            dxccName: data.ox.n
        } : null,
        closestQSO: data.cl ? {
            call: data.cl.c,
            distance: data.cl.d
        } : null,
        qsoRate: { 
            maxRate: data.qr || 0,
            date: ''
        },
        activeDays: data.ad || 0,
        averageQSOsPerDay: { 
            average: data.av || 0,
            total: data.t || 0
        },
        byHour: {
            peak: data.ph ? { hour: data.ph.h, count: data.ph.n } : { hour: 12, count: 0 },
            distribution: {}
        },
        streaks: { 
            maxStreak: data.st || 0,
            currentStreak: 0
        },
        byDayOfWeek: {
            distribution: {},
            best: { 
                day: data.dw?.d || 0, 
                dayIndex: data.dw?.d || 0, 
                count: data.dw?.n || 0 
            }
        },
        // Flaga że to dane z URL
        fromUrl: true
    };

    return stats;
}

/**
 * Koduje statystyki do parametru URL
 */
function encodeStatsToUrl(stats, userCallsign, year) {
    try {
        const serialized = serializeStats(stats, userCallsign, year);
        const json = JSON.stringify(serialized);
        const compressed = LZString.compressToEncodedURIComponent(json);
        return compressed;
    } catch (e) {
        console.error('Error encoding stats:', e);
        return null;
    }
}

/**
 * Dekoduje statystyki z parametru URL
 */
function decodeStatsFromUrl(encoded) {
    try {
        const json = LZString.decompressFromEncodedURIComponent(encoded);
        if (!json) return null;
        const data = JSON.parse(json);
        return {
            stats: deserializeStats(data),
            userCallsign: data.c || null,
            year: data.y || 2025
        };
    } catch (e) {
        console.error('Error decoding stats:', e);
        return null;
    }
}

/**
 * Aktualizuje URL z zakodowanymi statystykami
 */
function updateUrlWithStats(stats, userCallsign, year) {
    const encoded = encodeStatsToUrl(stats, userCallsign, year);
    if (encoded) {
        const url = new URL(window.location.href);
        url.searchParams.set('d', encoded);
        // Nie przeładowuj strony, tylko zmień URL
        window.history.replaceState({}, '', url.toString());
        return url.toString();
    }
    return null;
}

/**
 * Sprawdza czy URL zawiera zakodowane statystyki
 */
function getStatsFromUrl() {
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get('d');
    if (encoded) {
        return decodeStatsFromUrl(encoded);
    }
    return null;
}

/**
 * Czyści parametr ze statystykami z URL
 */
function clearStatsFromUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete('d');
    window.history.replaceState({}, '', url.toString());
}

/**
 * Kopiuje link do schowka
 */
async function copyShareLink() {
    try {
        await navigator.clipboard.writeText(window.location.href);
        return true;
    } catch (e) {
        // Fallback dla starszych przeglądarek
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
    }
}

// Eksport do globalnego scope
window.encodeStatsToUrl = encodeStatsToUrl;
window.decodeStatsFromUrl = decodeStatsFromUrl;
window.updateUrlWithStats = updateUrlWithStats;
window.getStatsFromUrl = getStatsFromUrl;
window.clearStatsFromUrl = clearStatsFromUrl;
window.copyShareLink = copyShareLink;
