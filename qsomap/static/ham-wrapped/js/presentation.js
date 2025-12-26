/**
 * Presentation - Generator i kontroler prezentacji Wrapped
 */

class Presentation {
    constructor(stats, year, userCallsign = null) {
        this.stats = stats;
        this.year = year;
        this.userCallsign = userCallsign;
        this.slides = [];
        this.currentSlide = 0;
        this.container = document.getElementById('slides-container');
        this.dotsContainer = document.getElementById('progress-dots');
    }

    /**
     * Generuj wszystkie slajdy
     */
    generateSlides() {
        this.slides = [];

        // Slajd 1: Intro
        this.addIntroSlide();

        // Slajd 2: Całkowita liczba QSO
        this.addTotalQSOsSlide();

        // Slajd 3: Unikalne callsigns
        this.addUniqueCallsignsSlide();

        // Slajd 4: Top callsigns
        this.addTopCallsignsSlide();

        // Slajd 5: Najlepszy miesiąc
        this.addBestMonthSlide();

        // Slajd 5: Najlepszy dzień
        this.addBestDaySlide();

        // Slajd 6: Ulubiony mod
        this.addFavoriteModeSlide();

        // Slajd 7: Wszystkie mody
        this.addAllModesSlide();

        // Slajd 8: Ulubione pasmo
        this.addFavoriteBandSlide();

        // Slajd 9: Dystrybucja pasm
        this.addBandDistributionSlide();

        // Slajd 10: Kontynenty
        this.addContinentsSlide();

        // Slajd 10: Top DXCC
        this.addTopDXCCSlide();

        // Slajd 10b: Band Slots
        if (this.stats.bandSlots && this.stats.bandSlots.totalSlots > 0) {
            this.addBandSlotsSlide();
        }

        // Slajd 11: ODX
        if (this.stats.odx) {
            this.addODXSlide();
        }

        // Slajd 12: Najbliższe QSO
        if (this.stats.closestQSO) {
            this.addClosestQSOSlide();
        }

        // Slajd 13: QSO Rate
        if (this.stats.qsoRate && this.stats.qsoRate.maxRate > 0) {
            this.addQSORateSlide();
        }

        // Slajd 14: Aktywność
        this.addActivitySlide();

        // Slajd 15: Szczyt aktywności (godzina)
        this.addPeakHourSlide();

        // Slajd 16: Serie (streaks)
        if (this.stats.streaks && this.stats.streaks.maxStreak > 1) {
            this.addStreaksSlide();
        }

        // Slajd 17: Strefy CQ
        this.addCQZonesSlide();

        // Slajd 18: Kontesty (jeśli są)
        if (this.stats.contestActivity && this.stats.contestActivity.contests && this.stats.contestActivity.contests.length > 0) {
            this.addContestsSlide();
        }

        // Slajd 19: Podsumowanie końcowe
        this.addSummarySlide();

        this.renderSlides();
        this.renderDots();
    }

    /**
     * Dodaj slajd intro
     */
    addIntroSlide() {
        const title = this.userCallsign
            ? t('introTitleWithCall', { callsign: this.userCallsign, year: this.year })
            : t('introTitle', { year: this.year });

        this.slides.push({
            theme: 'theme-1',
            icon: '📻',
            title: title,
            value: t('introValue'),
            description: t('introDescription'),
            subtitle: t('introSubtitle')
        });
    }

    /**
     * Slajd z całkowitą liczbą QSO
     */
    addTotalQSOsSlide() {
        this.slides.push({
            theme: 'theme-2',
            icon: '🎯',
            title: t('totalQSOsTitle'),
            value: this.formatNumber(this.stats.totalQSOs),
            description: t('totalQSOsDescription', { count: this.formatNumber(this.stats.totalQSOs) }),
            subtitle: this.getQSOComment(this.stats.totalQSOs)
        });
    }

    /**
     * Slajd z unikalnymi callsigns
     */
    addUniqueCallsignsSlide() {
        const avg = (this.stats.totalQSOs / this.stats.uniqueCallsigns.count).toFixed(1);
        this.slides.push({
            theme: 'theme-3',
            icon: '👥',
            title: t('uniqueCallsignsTitle'),
            value: this.formatNumber(this.stats.uniqueCallsigns.count),
            description: t('uniqueCallsignsDescription'),
            subtitle: t('uniqueCallsignsSubtitle', { avg: avg })
        });
    }

    /**
     * Slajd z top callsigns
     */
    addTopCallsignsSlide() {
        const topCalls = this.stats.topCallsigns?.top5 || [];

        if (topCalls.length === 0) return;

        this.slides.push({
            theme: 'theme-4',
            icon: '🏅',
            title: t('topCallsignsTitle'),
            type: 'list',
            subtitle: t('topCallsignsSubtitle'),
            items: topCalls.map((item, index) => ({
                rank: index + 1,
                label: item.call,
                value: `${item.count} QSO`
            }))
        });
    }

    /**
     * Slajd z najlepszym miesiącem
     */
    addBestMonthSlide() {
        const best = this.stats.byMonth.best;
        const monthName = i18n.getMonthName(parseInt(best.month) - 1);
        this.slides.push({
            theme: 'theme-4',
            icon: '📅',
            title: t('bestMonthTitle'),
            value: monthName,
            description: t('bestMonthDescription', { count: this.formatNumber(best.count) }),
            subtitle: t('bestMonthSubtitle')
        });
    }

    /**
     * Slajd z najlepszym dniem
     */
    addBestDaySlide() {
        const best = this.stats.byDay.best;
        const date = new Date(best.date);
        const formattedDate = date.toLocaleDateString(i18n.getLocale(), {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        this.slides.push({
            theme: 'theme-5',
            icon: '🔥',
            title: t('bestDayTitle'),
            value: this.formatNumber(best.count),
            valueUnit: 'QSO',
            description: formattedDate,
            subtitle: t('bestDaySubtitle')
        });
    }

    /**
     * Slajd z ulubionym modem
     */
    addFavoriteModeSlide() {
        const fav = this.stats.byMode.favorite;
        this.slides.push({
            theme: 'theme-6',
            icon: '📡',
            title: t('favoriteModeTitle'),
            value: fav.mode,
            description: t('favoriteModeDescription', { percentage: fav.percentage }),
            subtitle: t('favoriteModeSubtitle', { count: this.formatNumber(fav.count) })
        });
    }

    /**
     * Slajd ze wszystkimi modami
     */
    addAllModesSlide() {
        const modes = this.stats.byMode.sorted.slice(0, 5);

        this.slides.push({
            theme: 'theme-7',
            icon: '📊',
            title: t('allModesTitle'),
            type: 'progress',
            items: modes.map(m => ({
                label: m.mode,
                value: `${m.percentage}%`,
                percentage: parseFloat(m.percentage)
            }))
        });
    }

    /**
     * Slajd z ulubionym pasmem
     */
    addFavoriteBandSlide() {
        const fav = this.stats.byBand.favorite;
        this.slides.push({
            theme: 'theme-8',
            icon: '🌊',
            title: t('favoriteBandTitle'),
            value: fav.band,
            description: t('favoriteBandDescription', { percentage: fav.percentage }),
            subtitle: t('favoriteBandSubtitle', { count: this.stats.byBand.count })
        });
    }

    /**
     * Slajd z dystrybucją pasm
     */
    addBandDistributionSlide() {
        const bands = this.stats.byBand?.sorted || [];

        if (bands.length === 0) return;

        // Pokaż wszystkie pasma
        const topBands = bands;

        this.slides.push({
            theme: 'theme-9',
            icon: '📊',
            title: t('bandDistributionTitle'),
            type: 'progress',
            subtitle: t('bandDistributionSubtitle', { count: this.stats.byBand.count }),
            items: topBands.map(b => ({
                label: b.band,
                value: `${b.percentage}%`,
                percentage: parseFloat(b.percentage)
            }))
        });
    }

    /**
     * Slajd z kontynentami
     */
    addContinentsSlide() {
        const continents = this.stats.byContinent?.sorted || [];

        if (continents.length === 0) {
            this.slides.push({
                theme: 'theme-1',
                icon: '🌍',
                title: t('continentsTitle'),
                value: '?',
                description: t('continentsNoData'),
                subtitle: t('continentsNoDataHint')
            });
            return;
        }

        this.slides.push({
            theme: 'theme-1',
            icon: '🌍',
            title: t('continentsTitle'),
            type: 'progress',
            subtitle: t('continentsSubtitle', { count: this.stats.byContinent.count }),
            items: continents.map(c => ({
                label: i18n.getContinentName(c.continent),
                value: `${c.percentage}%`,
                percentage: parseFloat(c.percentage)
            }))
        });
    }

    /**
     * Slajd z top DXCC
     */
    addTopDXCCSlide() {
        const top = this.stats.byDXCC?.top5 || [];
        const count = this.stats.byDXCC?.count || 0;

        if (top.length === 0) {
            this.slides.push({
                theme: 'theme-2',
                icon: '🏆',
                title: t('topDXCCTitle'),
                value: '?',
                description: t('dxccNoData'),
                subtitle: t('dxccNoDataHint')
            });
            return;
        }

        this.slides.push({
            theme: 'theme-2',
            icon: '🏆',
            title: t('topDXCCTitle'),
            type: 'list',
            subtitle: t('dxccSubtitle', { count: count }),
            items: top.map((c, i) => ({
                rank: i + 1,
                label: c.name,
                value: `${this.formatNumber(c.count)} QSO`
            }))
        });
    }

    /**
     * Slajd Band Slots
     */
    addBandSlotsSlide() {
        const bandSlots = this.stats.bandSlots;

        this.slides.push({
            theme: 'theme-3',
            icon: '🎰',
            title: t('bandSlotsTitle'),
            value: this.formatNumber(bandSlots.totalSlots),
            description: t('bandSlotsDescription'),
            subtitle: t('bandSlotsSubtitle', { 
                dxcc: bandSlots.dxccCount, 
                bands: bandSlots.bandCount 
            })
        });
    }

    /**
     * Slajd ODX
     */
    addODXSlide() {
        const odx = this.stats.odx;
        let extraInfo = [];
        if (odx.band) extraInfo.push(t('odxBand', { band: odx.band }));
        if (odx.mode) extraInfo.push(t('odxMode', { mode: odx.mode }));

        this.slides.push({
            theme: 'theme-3',
            icon: '🚀',
            title: t('odxTitle'),
            value: odx.distance ? `${this.formatNumber(odx.distance)} km` : odx.dxccName,
            valueClass: 'smaller',
            description: odx.distance ? odx.dxccName : '',
            subtitle: t('odxStation', { call: odx.call }),
            extra: extraInfo.join(' • ')
        });
    }

    /**
     * Slajd najbliższe QSO
     */
    addClosestQSOSlide() {
        const closest = this.stats.closestQSO;
        if (!closest || !closest.distance) return;

        // Pobierz nazwę kraju - priorytet: dxccName z lookup, potem country z QSO
        let countryName = closest.dxccName || closest.country || t('unknownCountry');

        let extraInfo = [];
        if (closest.band) extraInfo.push(t('odxBand', { band: closest.band }));
        if (closest.mode) extraInfo.push(t('odxMode', { mode: closest.mode }));

        this.slides.push({
            theme: 'theme-4',
            icon: '📍',
            title: t('closestQSOTitle'),
            value: `${this.formatNumber(closest.distance)} km`,
            valueClass: 'smaller',
            description: countryName,
            subtitle: t('odxStation', { call: closest.call }),
            extra: extraInfo.join(' • ')
        });
    }

    /**
     * Slajd QSO Rate
     */
    addQSORateSlide() {
        const rate = this.stats.qsoRate;
        let dateStr = '';

        if (rate.peakDate && !isNaN(rate.peakDate.getTime())) {
            try {
                dateStr = rate.peakDate.toLocaleDateString(i18n.getLocale(), {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
                const timeStr = rate.peakDate.toLocaleTimeString(i18n.getLocale(), {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                dateStr = `${dateStr}, ${timeStr} UTC`;
            } catch (e) {
                dateStr = '';
            }
        } else if (rate.peakHour) {
            dateStr = rate.peakHour;
        }

        this.slides.push({
            theme: 'theme-5',
            icon: '⚡',
            title: t('qsoRateTitle'),
            value: rate.maxRate,
            valueUnit: t('qsoRateUnit'),
            description: t('qsoRateDescription'),
            subtitle: dateStr ? t('qsoRateSubtitle', { date: dateStr }) : ''
        });
    }

    /**
     * Slajd aktywności
     */
    addActivitySlide() {
        this.slides.push({
            theme: 'theme-6',
            icon: '📈',
            title: t('activityTitle'),
            type: 'stats',
            items: [
                { label: t('activeDays'), value: this.stats.activeDays },
                { label: t('avgQSOPerDay'), value: this.stats.averageQSOsPerDay.average },
                { label: t('favoriteDay'), value: i18n.getDayName(this.stats.byDayOfWeek.best.dayIndex) }
            ]
        });
    }

    /**
     * Slajd ze szczytem aktywności
     */
    addPeakHourSlide() {
        const peak = this.stats.byHour.peak;
        this.slides.push({
            theme: 'theme-7',
            icon: '⏰',
            title: t('peakHourTitle'),
            value: `${String(peak.hour).padStart(2, '0')}:00`,
            valueUnit: 'UTC',
            description: t('peakHourDescription'),
            subtitle: t('peakHourSubtitle', { count: this.formatNumber(peak.count) })
        });
    }

    /**
     * Slajd z seriami
     */
    addStreaksSlide() {
        const streaks = this.stats.streaks;
        this.slides.push({
            theme: 'theme-8',
            icon: '🔥',
            title: t('streaksTitle'),
            value: streaks.maxStreak,
            valueUnit: t('streaksUnit'),
            description: t('streaksDescription'),
            subtitle: streaks.maxStreakStart && streaks.maxStreakEnd ?
                t('streaksSubtitle', { start: streaks.maxStreakStart, end: streaks.maxStreakEnd }) : ''
        });
    }

    /**
     * Slajd ze strefami CQ
     */
    addCQZonesSlide() {
        this.slides.push({
            theme: 'theme-1',
            icon: '🗺️',
            title: t('cqZonesTitle'),
            value: this.stats.byCQZone.count,
            description: t('cqZonesDescription'),
            subtitle: t('cqZonesSubtitle')
        });
    }

    /**
     * Slajd z kontestami
     */
    addContestsSlide() {
        const contests = this.stats.contestActivity.contests;
        const top5 = contests.slice(0, 5);

        this.slides.push({
            theme: 'theme-4',
            icon: '🏅',
            title: t('contestsTitle'),
            value: contests.length,
            description: t('contestsDescription', { count: contests.length }),
            type: 'list',
            items: top5.map(c => ({
                label: c.contest,
                value: `${this.formatNumber(c.count)} ${t('contestsQSO')}`
            })),
            subtitle: t('contestsSubtitle')
        });
    }

    /**
     * Slajd podsumowujący - zbiera dane ze wszystkich slajdów
     */
    addSummarySlide() {
        const title = this.userCallsign
            ? t('summaryTitleWithCall', { callsign: this.userCallsign, year: this.year })
            : t('summaryTitle', { year: this.year });

        // Zbierz wszystkie statystyki
        const items = [];

        // 1. Total QSOs
        items.push({
            icon: '📻',
            value: this.formatNumber(this.stats.totalQSOs),
            label: t('summaryQSO'),
            subtitle: this.getQSOComment(this.stats.totalQSOs)
        });

        // 2. Unique callsigns
        const avgPerStation = (this.stats.totalQSOs / this.stats.uniqueCallsigns.count).toFixed(1);
        items.push({
            icon: '👥',
            value: this.formatNumber(this.stats.uniqueCallsigns.count),
            label: t('uniqueCallsignsTitle'),
            subtitle: `${avgPerStation} QSO/${i18n.currentLang === 'pl' ? 'stację' : 'station'}`
        });

        // 2b. Favorite station (most QSOs)
        const favStation = this.stats.topCallsigns?.favorite;
        if (favStation) {
            items.push({
                icon: '🏅',
                value: favStation.call,
                label: t('favoriteStationTitle'),
                subtitle: `${favStation.count} QSO`
            });
        }

        // 3. Best month
        const bestMonth = this.stats.byMonth.best;
        const monthName = i18n.getMonthName(parseInt(bestMonth.month) - 1);
        items.push({
            icon: '📅',
            value: monthName,
            label: t('bestMonthTitle'),
            subtitle: `${this.formatNumber(bestMonth.count)} QSO`
        });

        // 4. Best day
        const bestDay = this.stats.byDay.best;
        const bestDayDate = new Date(bestDay.date);
        const formattedBestDay = bestDayDate.toLocaleDateString(i18n.getLocale(), { day: 'numeric', month: 'short' });
        items.push({
            icon: '🔥',
            value: this.formatNumber(bestDay.count),
            label: t('bestDayTitle'),
            subtitle: formattedBestDay
        });

        // 5. Favorite mode
        const favMode = this.stats.byMode.favorite;
        items.push({
            icon: '📡',
            value: favMode.mode,
            label: t('favoriteModeTitle'),
            subtitle: `${favMode.percentage}%`
        });

        // 6. Favorite band
        const favBand = this.stats.byBand.favorite;
        items.push({
            icon: '🌊',
            value: favBand.band,
            label: t('favoriteBandTitle'),
            subtitle: `${this.stats.byBand.count} ${i18n.currentLang === 'pl' ? 'pasm' : 'bands'}`
        });

        // 6b. Band distribution (top 3)
        const topBands = this.stats.byBand.sorted?.slice(0, 3) || [];
        if (topBands.length > 0) {
            const bandList = topBands.map(b => `${b.band}: ${b.percentage}%`).join(', ');
            items.push({
                icon: '📊',
                value: this.stats.byBand.count,
                label: t('bandDistributionTitle'),
                subtitle: bandList
            });
        }

        // 7. Continents
        const continents = this.stats.byContinent ? this.stats.byContinent.count : 0;
        items.push({
            icon: '🌍',
            value: continents,
            label: t('continentsTitle'),
            subtitle: ''
        });

        // 8. DXCC
        const dxccCount = this.stats.byDXCC?.count || 0;
        items.push({
            icon: '🏆',
            value: dxccCount,
            label: 'DXCC',
            subtitle: i18n.currentLang === 'pl' ? 'krajów' : 'countries'
        });

        // 8b. Band Slots
        if (this.stats.bandSlots && this.stats.bandSlots.totalSlots > 0) {
            items.push({
                icon: '🎰',
                value: this.formatNumber(this.stats.bandSlots.totalSlots),
                label: t('bandSlotsTitle'),
                subtitle: ''
            });
        }

        // 9. CQ Zones
        const cqZones = this.stats.byCQZone ? this.stats.byCQZone.count : 0;
        items.push({
            icon: '🗺️',
            value: `${cqZones}/40`,
            label: t('cqZonesTitle'),
            subtitle: ''
        });

        // 9. ODX
        if (this.stats.odx && this.stats.odx.distance) {
            items.push({
                icon: '🚀',
                value: `${this.formatNumber(this.stats.odx.distance)} km`,
                label: t('odxTitle'),
                subtitle: this.stats.odx.dxccName || this.stats.odx.call
            });
        }

        // 10. Closest QSO
        if (this.stats.closestQSO && this.stats.closestQSO.distance) {
            items.push({
                icon: '📍',
                value: `${this.formatNumber(this.stats.closestQSO.distance)} km`,
                label: t('closestQSOTitle'),
                subtitle: this.stats.closestQSO.call
            });
        }

        // 11. QSO Rate
        if (this.stats.qsoRate && this.stats.qsoRate.maxRate > 0) {
            items.push({
                icon: '⚡',
                value: this.stats.qsoRate.maxRate,
                label: t('qsoRateTitle'),
                subtitle: t('qsoRateUnit')
            });
        }

        // 12. Active days
        items.push({
            icon: '📈',
            value: this.stats.activeDays || 0,
            label: t('activeDays'),
            subtitle: `${this.stats.averageQSOsPerDay?.average || 0} QSO/${i18n.currentLang === 'pl' ? 'dzień' : 'day'}`
        });

        // 13. Peak hour
        const peakHour = this.stats.byHour.peak;
        items.push({
            icon: '⏰',
            value: `${String(peakHour.hour).padStart(2, '0')}:00`,
            label: t('peakHourTitle'),
            subtitle: 'UTC'
        });

        // 14. Streak
        if (this.stats.streaks && this.stats.streaks.maxStreak > 1) {
            items.push({
                icon: '🔥',
                value: this.stats.streaks.maxStreak,
                label: t('streaksTitle'),
                subtitle: t('streaksUnit')
            });
        }

        // 15. Contests
        if (this.stats.contestActivity && this.stats.contestActivity.contests && this.stats.contestActivity.contests.length > 0) {
            items.push({
                icon: '🏅',
                value: this.stats.contestActivity.contests.length,
                label: t('contestsTitle'),
                subtitle: ''
            });
        }

        this.slides.push({
            theme: 'theme-2',
            icon: '🎉',
            title: title,
            titleClass: 'title-large',
            type: 'summary',
            scrollable: true,
            items: items
        });
    }

    /**
     * Renderuj slajdy do HTML
     */
    renderSlides() {
        this.container.innerHTML = '';

        this.slides.forEach((slide, index) => {
            const slideEl = document.createElement('div');
            const scrollableClass = slide.scrollable ? 'slide-scrollable' : '';
            slideEl.className = `slide ${slide.theme} ${scrollableClass} ${index === 0 ? 'active' : ''}`.replace(/\s+/g, ' ').trim();
            slideEl.innerHTML = this.renderSlideContent(slide);
            this.container.appendChild(slideEl);
        });
    }

    /**
     * Renderuj zawartość slajdu
     */
    renderSlideContent(slide) {
        const titleClass = slide.titleClass ? `slide-title ${slide.titleClass}` : 'slide-title';
        let content = `
            <div class="slide-icon">${slide.icon}</div>
            <div class="${titleClass}">${slide.title}</div>
        `;

        if (slide.type === 'progress') {
            content += this.renderProgressSlide(slide);
        } else if (slide.type === 'list') {
            content += this.renderListSlide(slide);
        } else if (slide.type === 'stats') {
            content += this.renderStatsSlide(slide);
        } else if (slide.type === 'summary') {
            content += this.renderSummarySlide(slide);
        } else {
            content += this.renderDefaultSlide(slide);
        }

        if (slide.subtitle) {
            content += `<div class="slide-subtitle">${slide.subtitle}</div>`;
        }

        if (slide.extra) {
            content += `<div class="slide-subtitle">${slide.extra}</div>`;
        }

        return content;
    }

    /**
     * Renderuj domyślny slajd
     */
    renderDefaultSlide(slide) {
        let valueClass = 'slide-value';
        if (slide.valueClass) valueClass += ` ${slide.valueClass}`;

        let content = `<div class="${valueClass}">${slide.value}`;
        if (slide.valueUnit) {
            content += `<span style="font-size: 0.4em; display: block;">${slide.valueUnit}</span>`;
        }
        content += '</div>';

        if (slide.description) {
            content += `<div class="slide-description">${slide.description}</div>`;
        }

        return content;
    }

    /**
     * Renderuj slajd z paskami postępu
     */
    renderProgressSlide(slide) {
        let content = '<div class="progress-container">';

        slide.items.forEach(item => {
            content += `
                <div class="progress-item">
                    <div class="progress-label">
                        <span>${item.label}</span>
                        <span>${item.value}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${item.percentage}%"></div>
                    </div>
                </div>
            `;
        });

        content += '</div>';
        return content;
    }

    /**
     * Renderuj slajd z listą
     */
    renderListSlide(slide) {
        let content = '<ul class="stat-list">';

        slide.items.forEach(item => {
            content += `
                <li>
                    <span class="label">${item.rank ? `${item.rank}. ` : ''}${item.label}</span>
                    <span class="value">${item.value}</span>
                </li>
            `;
        });

        content += '</ul>';
        return content;
    }

    /**
     * Renderuj slajd ze statystykami
     */
    renderStatsSlide(slide) {
        let content = '<ul class="stat-list">';

        slide.items.forEach(item => {
            content += `
                <li>
                    <span class="label">${item.label}</span>
                    <span class="value">${item.value}</span>
                </li>
            `;
        });

        content += '</ul>';
        return content;
    }

    /**
     * Renderuj slajd podsumowania
     */
    renderSummarySlide(slide) {
        let content = '<div class="summary-scroll-container">';
        content += '<div class="summary-grid">';

        slide.items.forEach(item => {
            content += `
                <div class="summary-item">
                    <div class="summary-item-icon">${item.icon}</div>
                    <div class="summary-item-content">
                        <div class="summary-item-value">${item.value}</div>
                        <div class="summary-item-label">${item.label}</div>
                        ${item.subtitle ? `<div class="summary-item-subtitle">${item.subtitle}</div>` : ''}
                    </div>
                </div>
            `;
        });

        content += '</div></div>';
        return content;
    }

    /**
     * Renderuj kropki nawigacji
     */
    renderDots() {
        this.dotsContainer.innerHTML = '';

        this.slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
    }

    /**
     * Przejdź do następnego slajdu
     */
    nextSlide() {
        if (this.currentSlide < this.slides.length - 1) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    /**
     * Przejdź do poprzedniego slajdu
     */
    prevSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    /**
     * Przejdź do konkretnego slajdu
     */
    goToSlide(index) {
        const slides = this.container.querySelectorAll('.slide');
        const dots = this.dotsContainer.querySelectorAll('.dot');

        // Usuń klasy ze wszystkich slajdów
        slides.forEach((slide, i) => {
            slide.classList.remove('active', 'prev');
            if (i < index) {
                slide.classList.add('prev');
            }
        });

        // Aktywuj wybrany slajd
        slides[index].classList.add('active');

        // Aktualizuj kropki
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        this.currentSlide = index;

        // Aktualizuj przyciski nawigacji
        this.updateNavButtons();

        // Animuj paski postępu na aktywnym slajdzie
        this.animateProgressBars(slides[index]);
    }

    /**
     * Aktualizuj stan przycisków nawigacji
     */
    updateNavButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        prevBtn.disabled = this.currentSlide === 0;
        nextBtn.disabled = this.currentSlide === this.slides.length - 1;
    }

    /**
     * Animuj paski postępu
     */
    animateProgressBars(slideEl) {
        const bars = slideEl.querySelectorAll('.progress-fill');
        bars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }

    /**
     * Formatuj liczbę z separatorami tysięcy
     */
    formatNumber(num) {
        if (num === undefined || num === null) return '0';
        return num.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ' ');
    }

    /**
     * Zwróć komentarz do liczby QSO
     */
    getQSOComment(count) {
        if (count < 100) return t('qsoComment1');
        if (count < 500) return t('qsoComment2');
        if (count < 1000) return t('qsoComment3');
        if (count < 5000) return t('qsoComment4');
        if (count < 10000) return t('qsoComment5');
        return t('qsoComment6');
    }
}

// Export
window.Presentation = Presentation;
