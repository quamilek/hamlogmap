var map = L.map('map', {
    minZoom: 1,
    maxZoom: 18,
    worldCopyJump: true,
    maxBounds: [
        [-90, -180],
        [90, 180]
    ],
    maxBoundsViscosity: 1.0,
    crs: L.CRS.EPSG3857,
    touchZoom: true,
    bounceAtZoomLimits: false
}).setView([window.mapData.my_latitude, window.mapData.my_longitude], 2);

var dayLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    noWrap: false,
    continuousWorld: true,
    tileSize: 256,
    zoomOffset: 0,
    maxZoom: 19,
    maxNativeZoom: 19,
    bounds: [[-90, -180], [90, 180]],
    tms: false
}).addTo(map);

var nightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors',
    noWrap: false,
    continuousWorld: true,
    tileSize: 256,
    zoomOffset: 0,
    maxZoom: 19,
    maxNativeZoom: 19,
    bounds: [[-90, -180], [90, 180]],
    tms: false
});

var qsos = window.mapData.qsos;

// ==================== TIMELINE FUNCTIONALITY ====================

// Timeline state variables
let timelineSortedQsos = [];
let timelineLayer = L.layerGroup();
let isTimelineActive = false;
let animationInterval = null;
let timelineMinDate = null;
let timelineMaxDate = null;

// Parse ADIF date and time to JavaScript Date object
function parseQsoDateTime(dateStr, timeStr) {
    if (!dateStr) return null;
    
    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(4, 6)) - 1; // JS months are 0-indexed
    const day = parseInt(dateStr.slice(6, 8));
    
    let hour = 0, min = 0, sec = 0;
    if (timeStr) {
        hour = parseInt(timeStr.slice(0, 2)) || 0;
        min = parseInt(timeStr.slice(2, 4)) || 0;
        sec = parseInt(timeStr.slice(4, 6)) || 0;
    }
    
    return new Date(year, month, day, hour, min, sec);
}

// Format date for display
function formatDateTime(date) {
    if (!date) return '--';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${min}`;
}

// Format date for label (short version)
function formatDateShort(date) {
    if (!date) return '--';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance); // Return distance in km, rounded to nearest integer
}

// Initialize timeline data
function initTimelineData() {
    // Create sorted copy of QSOs with parsed dates
    timelineSortedQsos = qsos
        .map(qso => ({
            ...qso,
            dateTime: parseQsoDateTime(qso.date, qso.time)
        }))
        .filter(qso => qso.dateTime !== null) // Filter out QSOs without valid dates
        .sort((a, b) => a.dateTime - b.dateTime);
    
    if (timelineSortedQsos.length === 0) {
        alert('No QSOs with valid dates found!');
        return false;
    }
    
    timelineMinDate = timelineSortedQsos[0].dateTime;
    timelineMaxDate = timelineSortedQsos[timelineSortedQsos.length - 1].dateTime;
    
    // Update labels
    document.getElementById('timeline-start-label').textContent = formatDateShort(timelineMinDate);
    document.getElementById('timeline-end-label').textContent = formatDateShort(timelineMaxDate);
    
    // Generate activity bar visualization
    generateActivityBar();
    
    return true;
}

// Generate activity bar showing on-air/off-air periods
function generateActivityBar() {
    const activityBar = document.getElementById('timeline-activity-bar');
    activityBar.innerHTML = ''; // Clear existing segments
    
    if (timelineSortedQsos.length === 0) return;
    
    const totalRange = timelineMaxDate.getTime() - timelineMinDate.getTime();
    if (totalRange === 0) {
        // If all QSOs at same time, show full bar as on-air
        const segmentEl = document.createElement('div');
        segmentEl.className = 'activity-segment on-air';
        segmentEl.style.left = '0%';
        segmentEl.style.width = '100%';
        activityBar.appendChild(segmentEl);
        return;
    }
    
    // Threshold for considering "off-air" - 10 minutes without QSO
    const offAirThreshold = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    // Build activity segments - only track on-air periods
    const segments = [];
    let currentSegmentStart = timelineSortedQsos[0].dateTime.getTime();
    let lastQsoTime = currentSegmentStart;
    
    for (let i = 1; i < timelineSortedQsos.length; i++) {
        const qsoTime = timelineSortedQsos[i].dateTime.getTime();
        const gap = qsoTime - lastQsoTime;
        
        if (gap > offAirThreshold) {
            // End current on-air segment (extend it slightly past last QSO)
            segments.push({
                start: currentSegmentStart,
                end: lastQsoTime + (offAirThreshold / 2), // Extend segment slightly
                type: 'on-air'
            });
            
            // Start new on-air segment (start slightly before this QSO)
            currentSegmentStart = qsoTime - (offAirThreshold / 2);
        }
        
        lastQsoTime = qsoTime;
    }
    
    // Add final on-air segment
    segments.push({
        start: currentSegmentStart,
        end: lastQsoTime,
        type: 'on-air'
    });
    
    // Create DOM elements for on-air segments only
    segments.forEach(segment => {
        let startPercent = ((segment.start - timelineMinDate.getTime()) / totalRange) * 100;
        let endPercent = ((segment.end - timelineMinDate.getTime()) / totalRange) * 100;
        
        // Clamp to valid range
        startPercent = Math.max(0, startPercent);
        endPercent = Math.min(100, endPercent);
        
        const width = endPercent - startPercent;
        
        // Render segment with minimum width of 0.3%
        if (width >= 0.1) {
            const segmentEl = document.createElement('div');
            segmentEl.className = 'activity-segment on-air';
            segmentEl.style.left = `${startPercent}%`;
            segmentEl.style.width = `${Math.max(width, 0.3)}%`;
            activityBar.appendChild(segmentEl);
        }
    });
    
    console.log('Activity segments generated:', segments.length);
}

// Find the sliding window with maximum QSO count
function findSlidingWindowPeak(intervalMinutes) {
    if (timelineSortedQsos.length === 0) {
        return { count: 0, startTime: null, endTime: null };
    }
    
    const windowMs = intervalMinutes * 60 * 1000;
    let maxCount = 0;
    let bestStartTime = timelineSortedQsos[0].dateTime;
    let bestEndTime = new Date(bestStartTime.getTime() + windowMs);
    
    // Sliding window using two pointers
    let left = 0;
    let right = 0;
    const n = timelineSortedQsos.length;
    
    while (left < n) {
        const windowStart = timelineSortedQsos[left].dateTime.getTime();
        const windowEnd = windowStart + windowMs;
        
        // Expand right pointer to include all QSOs within window
        while (right < n && timelineSortedQsos[right].dateTime.getTime() <= windowEnd) {
            right++;
        }
        
        const count = right - left;
        
        if (count > maxCount) {
            maxCount = count;
            bestStartTime = timelineSortedQsos[left].dateTime;
            bestEndTime = new Date(windowEnd);
        }
        
        left++;
    }
    
    return {
        count: maxCount,
        startTime: bestStartTime,
        endTime: bestEndTime
    };
}

// Generate QSO rate chart
function generateRateChart(intervalMinutes = 60) {
    const rateChart = document.getElementById('rate-chart');
    const yAxis = document.getElementById('rate-y-axis');
    rateChart.innerHTML = '';
    yAxis.innerHTML = '';
    
    if (timelineSortedQsos.length === 0) return;
    
    const totalRange = timelineMaxDate.getTime() - timelineMinDate.getTime();
    if (totalRange === 0) return;
    
    const intervalMs = intervalMinutes * 60 * 1000;
    const numBuckets = Math.ceil(totalRange / intervalMs) + 1;
    
    // Count QSOs in each time bucket
    const buckets = new Array(numBuckets).fill(0);
    const bucketTimes = [];
    
    for (let i = 0; i < numBuckets; i++) {
        bucketTimes.push(new Date(timelineMinDate.getTime() + i * intervalMs));
    }
    
    timelineSortedQsos.forEach(qso => {
        const bucketIndex = Math.floor((qso.dateTime.getTime() - timelineMinDate.getTime()) / intervalMs);
        if (bucketIndex >= 0 && bucketIndex < numBuckets) {
            buckets[bucketIndex]++;
        }
    });
    
    // Find max for scaling
    const maxCount = Math.max(...buckets, 1);
    const peakIndex = buckets.indexOf(maxCount);
    const peakTime = bucketTimes[peakIndex];
    
    // Calculate sliding window maximum (true peak rate)
    const slidingWindowPeak = findSlidingWindowPeak(intervalMinutes);
    
    // Update peak info with both bucket peak and sliding window peak
    const peakInfo = document.getElementById('rate-peak-info');
    peakInfo.innerHTML = `Best ${intervalMinutes}min: <strong>${slidingWindowPeak.count} QSO</strong> @ ${formatDateTime(slidingWindowPeak.startTime).slice(11)}`;
    
    // Generate Y-axis labels
    const yLabels = [maxCount, Math.round(maxCount / 2), 0];
    yLabels.forEach(value => {
        const label = document.createElement('span');
        label.textContent = value;
        yAxis.appendChild(label);
    });
    
    // Create bars
    buckets.forEach((count, index) => {
        const bar = document.createElement('div');
        bar.className = 'rate-bar';
        
        const heightPercent = (count / maxCount) * 100;
        bar.style.height = count > 0 ? `${Math.max(heightPercent, 5)}%` : '2px';
        
        if (count === 0) {
            bar.style.opacity = '0.2';
        }
        
        // Highlight peak
        if (index === peakIndex && count > 0) {
            bar.classList.add('highlighted');
        }
        
        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'rate-bar-tooltip';
        const timeStr = formatDateTime(bucketTimes[index]).slice(11);
        tooltip.textContent = `${timeStr}: ${count} QSO`;
        bar.appendChild(tooltip);
        
        // Click to jump to this time
        bar.addEventListener('click', () => {
            const sliderValue = getSliderValueFromDate(bucketTimes[index]);
            document.getElementById('timeline-slider').value = sliderValue;
            updateTimelineDisplay(sliderValue);
        });
        
        rateChart.appendChild(bar);
    });
}

// Get date from slider value (0-1000)
function getDateFromSliderValue(value) {
    const range = timelineMaxDate.getTime() - timelineMinDate.getTime();
    const timestamp = timelineMinDate.getTime() + (range * value / 1000);
    return new Date(timestamp);
}

// Get slider value from date
function getSliderValueFromDate(date) {
    const range = timelineMaxDate.getTime() - timelineMinDate.getTime();
    if (range === 0) return 1000;
    return Math.round(((date.getTime() - timelineMinDate.getTime()) / range) * 1000);
}

// Add single QSO to timeline layer
function addQsoToTimelineLayer(qso) {
    const centerLng = window.mapData.my_longitude;
    const adjustedLng = adjustLongitude(qso.longitude, centerLng);
    const hideLines = document.getElementById('hide-lines-checkbox')?.checked || false;
    const useColorByBand = document.getElementById('uniform-color-checkbox')?.checked || true;
    
    // Create marker
    const marker = L.circleMarker([qso.latitude, adjustedLng], {
        radius: 4,
        fillColor: useColorByBand ? getBandColor(qso.band) : '#FF0000',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
    });
    
    const distance = calculateDistance(
        window.mapData.my_latitude,
        window.mapData.my_longitude,
        qso.latitude,
        qso.longitude
    );
    
    marker.bindPopup(`
        <strong>${qso.call}</strong><br>
        Date: ${qso.date}<br>
        Time: ${qso.time}<br>
        Mode: ${qso.mode}<br>
        Band: ${qso.band}<br>
        Grid: ${qso.grid}<br>
        DXCC: ${qso.dxcc}<br>
        Distance: ${distance} km
    `);
    
    timelineLayer.addLayer(marker);
    
    // Draw arc if lines are not hidden
    if (!hideLines) {
        try {
            const arc = drawArc(
                [window.mapData.my_latitude, window.mapData.my_longitude],
                [qso.latitude, adjustedLng]
            );
            timelineLayer.addLayer(arc);
        } catch (e) {
            console.log('Arc error:', e);
        }
    }
}

// Update timeline display based on slider position
function updateTimelineDisplay(sliderValue) {
    const currentDate = getDateFromSliderValue(sliderValue);
    
    // Get selected filters
    const selectedModes = Array.from(document.querySelectorAll('.mode-checkbox:checked')).map(cb => cb.value);
    const selectedBands = Array.from(document.querySelectorAll('.band-checkbox:checked')).map(cb => cb.value);
    
    // Clear current timeline layer
    timelineLayer.clearLayers();
    
    // Filter and add QSOs up to current date
    const visibleQsos = timelineSortedQsos.filter(qso => {
        if (qso.dateTime > currentDate) return false;
        if (selectedModes.length > 0 && !selectedModes.includes(qso.mode)) return false;
        if (selectedBands.length > 0 && !selectedBands.includes(qso.band)) return false;
        return true;
    });
    
    visibleQsos.forEach(qso => addQsoToTimelineLayer(qso));
    
    // Update UI
    document.getElementById('timeline-current-date').textContent = formatDateTime(currentDate);
    document.getElementById('timeline-qso-count').textContent = `${visibleQsos.length} / ${timelineSortedQsos.length} QSOs`;
}

// Start timeline mode
function startTimeline() {
    if (!initTimelineData()) return;
    
    isTimelineActive = true;
    document.body.classList.add('timeline-active');
    document.getElementById('timeline-container').classList.add('active');
    document.getElementById('timeline-button').classList.add('active');
    
    // Hide all regular markers
    map.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker || layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });
    
    // Add timeline layer to map
    timelineLayer.addTo(map);
    
    // Generate rate chart
    const interval = parseInt(document.getElementById('rate-interval').value);
    generateRateChart(interval);
    
    // Reset slider
    document.getElementById('timeline-slider').value = 0;
    updateTimelineDisplay(0);
    
    // Invalidate map size for proper display
    setTimeout(() => map.invalidateSize(), 100);
}

// Stop timeline mode
function stopTimeline() {
    isTimelineActive = false;
    pauseTimeline();
    
    document.body.classList.remove('timeline-active');
    document.getElementById('timeline-container').classList.remove('active');
    document.getElementById('timeline-button').classList.remove('active');
    
    // Remove timeline layer
    map.removeLayer(timelineLayer);
    timelineLayer.clearLayers();
    
    // Restore regular markers
    updateMarkers();
    
    // Invalidate map size
    setTimeout(() => map.invalidateSize(), 100);
}

// Play timeline animation
function playTimeline() {
    const playBtn = document.getElementById('timeline-play-btn');
    const slider = document.getElementById('timeline-slider');
    const speed = parseInt(document.getElementById('timeline-speed').value);
    
    if (animationInterval) {
        pauseTimeline();
        return;
    }
    
    playBtn.textContent = '⏸ Pause';
    playBtn.classList.add('playing');
    
    animationInterval = setInterval(() => {
        let currentValue = parseInt(slider.value);
        
        if (currentValue >= 1000) {
            pauseTimeline();
            return;
        }
        
        // Increment by small steps for smooth animation
        currentValue = Math.min(currentValue + 5, 1000);
        slider.value = currentValue;
        updateTimelineDisplay(currentValue);
    }, speed);
}

// Pause timeline animation
function pauseTimeline() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    
    const playBtn = document.getElementById('timeline-play-btn');
    playBtn.textContent = '▶ Play';
    playBtn.classList.remove('playing');
}

// Reset timeline to beginning
function resetTimeline() {
    pauseTimeline();
    document.getElementById('timeline-slider').value = 0;
    updateTimelineDisplay(0);
}

// Initialize timeline event listeners
function initTimelineEventListeners() {
    // Timeline button in top bar
    document.getElementById('timeline-button').addEventListener('click', function() {
        if (isTimelineActive) {
            stopTimeline();
        } else {
            startTimeline();
        }
    });
    
    // Close button
    document.getElementById('timeline-close-btn').addEventListener('click', stopTimeline);
    
    // Play/Pause button
    document.getElementById('timeline-play-btn').addEventListener('click', playTimeline);
    
    // Reset button
    document.getElementById('timeline-reset-btn').addEventListener('click', resetTimeline);
    
    // Slider input
    document.getElementById('timeline-slider').addEventListener('input', function() {
        pauseTimeline(); // Stop animation when user interacts with slider
        updateTimelineDisplay(parseInt(this.value));
    });
    
    // Speed change (no need to restart if already playing)
    document.getElementById('timeline-speed').addEventListener('change', function() {
        if (animationInterval) {
            pauseTimeline();
            playTimeline();
        }
    });
    
    // Rate interval change
    document.getElementById('rate-interval').addEventListener('change', function() {
        if (isTimelineActive) {
            generateRateChart(parseInt(this.value));
        }
    });
    
    // Update timeline when filters change (if timeline is active)
    document.querySelectorAll('.mode-checkbox, .band-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (isTimelineActive) {
                updateTimelineDisplay(parseInt(document.getElementById('timeline-slider').value));
            }
        });
    });
}

// ==================== END TIMELINE FUNCTIONALITY ====================

// Set total QSO count
document.getElementById('total-qso-count').textContent = qsos.length;
document.getElementById('stats-total-qso-count').textContent = qsos.length;

// Calculate DXCC statistics
const dxccCount = new Set(qsos.map(qso => qso.dxcc)).size;
document.getElementById('dxcc-count').textContent = dxccCount;

// Add markers to the map
addMarkers();

// Set Color Pins Band checkbox as checked by default
document.getElementById('uniform-color-checkbox').checked = true;


// Create DXCC list with mode breakdown
const dxccList = qsos.reduce((acc, qso) => {
    if (!acc[qso.dxcc]) {
        acc[qso.dxcc] = {
            total: 0,
            modes: {}
        };
    }
    acc[qso.dxcc].total++;
    if (!acc[qso.dxcc].modes[qso.mode]) {
        acc[qso.dxcc].modes[qso.mode] = 0;
    }
    acc[qso.dxcc].modes[qso.mode]++;
    return acc;
}, {});

const dxccListElement = document.getElementById('dxcc-list');
Object.entries(dxccList)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([dxcc, data]) => {
        const modeBreakdown = Object.entries(data.modes)
            .sort((a, b) => {
                // Custom sorting order
                const order = {
                    'CW': 1,
                    'SSB': 2,
                    'FT8': 3,
                    'FT4': 4
                };
                const orderA = order[a[0]] || 999;  // Default high number for other modes
                const orderB = order[b[0]] || 999;

                if (orderA !== orderB) {
                    return orderA - orderB;
                }
                // If both are in the same category, sort alphabetically
                return a[0].localeCompare(b[0]);
            })
            .map(([mode, count]) => {
                const modeColor = getModeColor(mode);
                return `<div style="background-color: ${modeColor}; color: white; padding: 2px 5px; border-radius: 3px; margin: 2px; display: inline-block;">${mode}: ${count}</div>`;
            })
            .join('');

        dxccListElement.innerHTML += `
            <tr>
                <td>${dxcc}</td>
                <td>${data.total}</td>
                <td><div style="display: flex; flex-wrap: wrap; gap: 5px;">${modeBreakdown}</div></td>
            </tr>`;
    });

// Calculate Band statistics
const bandCount = new Set(qsos.map(qso => qso.band)).size;
document.getElementById('band-count').textContent = bandCount;

// Create Band list
const bandList = qsos.reduce((acc, qso) => {
    if (!acc[qso.band]) {
        acc[qso.band] = 0;
    }
    acc[qso.band]++;
    return acc;
}, {});

const bandListElement = document.getElementById('band-list');
Object.entries(bandList)
    .sort((a, b) => b[1] - a[1])
    .forEach(([band, count]) => {
        const color = getBandColor(band);
        bandListElement.innerHTML += `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 20px; height: 20px; border-radius: 50%; background-color: ${color}; border: 1px solid #ccc;"></div>
                        ${band}
                    </div>
                </td>
                <td>${count}</td>
                <td>${((count / qsos.length) * 100).toFixed(1)}%</td>
            </tr>`;
    });

// Create Longest Distance QSOs list
const longestDistanceListElement = document.getElementById('longest-distance-list');
const qsosWithDistance = qsos
    .filter(qso => qso.distance !== null && qso.distance !== undefined)
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 20);

qsosWithDistance.forEach((qso, index) => {
    const modeColor = getModeColor(qso.mode);
    const bandColor = getBandColor(qso.band);
    longestDistanceListElement.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${qso.call}</strong></td>
            <td><strong>${qso.distance}</strong></td>
            <td>${qso.grid}</td>
            <td>${qso.dxcc}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 15px; height: 15px; border-radius: 50%; background-color: ${bandColor}; border: 1px solid #ccc;"></div>
                    ${qso.band}
                </div>
            </td>
            <td>
                <div style="background-color: ${modeColor}; color: white; padding: 2px 5px; border-radius: 3px; display: inline-block;">${qso.mode}</div>
            </td>
            <td>${qso.date}</td>
        </tr>`;
});

function getBandColor(band) {
    const bandColors = {
        '2200m': '#ff4500',  // Orange Red
        '600m': '#1e90ff',   // Dodger Blue
        '160m': '#7cfc00',   // Lawn Green
        '80m': '#e550e5',    // Purple
        '60m': '#00008b',    // Dark Blue
        '40m': '#5959ff',    // Blue
        '30m': '#62d962',    // Light Green
        '20m': '#f2c40c',    // Yellow
        '17m': '#f2f261',    // Light Yellow
        '15m': '#cca166',    // Tan
        '12m': '#b22222',    // Firebrick
        '10m': '#ff69b4',    // Hot Pink
        '6m': '#FF0000',     // Red
        '4m': '#cc0044',     // Deep Red
        '2m': '#FF1493',     // Deep Pink
        '70cm': '#999900',   // Olive
        '23cm': '#5AB8C7',   // Turquoise
        '13cm': '#A52A2A',   // Brown
        '3cm': '#808080',    // Gray
        '1.25cm': '#000000', // Black
        '2.4ghz': '#FF7F50', // Coral
        '10ghz': '#696969',  // Dim Gray
        'invalid': '#808080' // Gray
    };
    return bandColors[band] || '#808080';  // Default to gray if band not found
}

function getModeColor(mode) {
    const modeColors = {
        'SSB': '#FF6B6B',    // Coral Red
        'CW': '#4ECDC4',     // Turquoise
        'FT8': '#45B7D1',    // Sky Blue
        'FT4': '#96CEB4',    // Sage Green
        'RTTY': '#FFEEAD',   // Cream
        'PSK': '#D4A5A5',    // Dusty Rose
        'DIGI': '#9B59B6',   // Purple
        'FM': '#3498DB',     // Blue
        'AM': '#E67E22',     // Orange
        'DIG': '#2ECC71',    // Emerald
        'DATA': '#F1C40F',   // Yellow
        'MFSK': '#1ABC9C',   // Green Sea
        'JT65': '#34495E',   // Dark Blue
        'JT9': '#16A085',    // Dark Cyan
        'MSK144': '#8E44AD', // Purple
        'OLIVIA': '#27AE60', // Green
        'DOMINO': '#D35400', // Dark Orange
        'HELL': '#2980B9',   // Blue
        'MT63': '#C0392B',   // Red
        'SSTV': '#7F8C8D'    // Gray
    };
    return modeColors[mode] || '#95A5A6';  // Default to light gray if mode not found
}

function drawArc(start, end) {
    // Convert to radians
    const startLat = start[0] * Math.PI / 180;
    const startLng = start[1] * Math.PI / 180;
    const endLat = end[0] * Math.PI / 180;
    const endLng = end[1] * Math.PI / 180;

    // Calculate great circle distance
    const d = 2 * Math.asin(Math.sqrt(
        Math.pow(Math.sin((endLat - startLat) / 2), 2) +
        Math.cos(startLat) * Math.cos(endLat) * Math.pow(Math.sin((endLng - startLng) / 2), 2)
    ));

    // Calculate points along the great circle
    const points = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;

        // Calculate intermediate point using great circle formula
        const A = Math.sin((1 - t) * d) / Math.sin(d);
        const B = Math.sin(t * d) / Math.sin(d);
        const x = A * Math.cos(startLat) * Math.cos(startLng) + B * Math.cos(endLat) * Math.cos(endLng);
        const y = A * Math.cos(startLat) * Math.sin(startLng) + B * Math.cos(endLat) * Math.sin(endLng);
        const z = A * Math.sin(startLat) + B * Math.sin(endLat);

        let lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI;
        let lng = Math.atan2(y, x) * 180 / Math.PI;

        // Adjust longitude to ensure we take the shortest path
        const centerLng = window.mapData.my_longitude;
        while (lng - centerLng > 180) lng -= 360;
        while (lng - centerLng < -180) lng += 360;

        points.push([lat, lng]);
    }

    // Create the polyline
    return L.polyline(points, {
        color: 'red',
        weight: 2,
        opacity: 0.5
    });
}

function adjustLongitude(lng, centerLng) {
    while (lng - centerLng > 180) lng -= 360;
    while (lng - centerLng < -180) lng += 360;
    return lng;
}

function addMarkers() {
    const centerLng = window.mapData.my_longitude;
    // Check if lines should be hidden
    const hideLinesCheckbox = document.getElementById('hide-lines-checkbox');
    const hideLines = hideLinesCheckbox && hideLinesCheckbox.checked;

    qsos.forEach(qso => {
        // Adjust longitude of the marker to match the arc
        const adjustedLng = adjustLongitude(qso.longitude, centerLng);

        const marker = L.circleMarker([qso.latitude, adjustedLng], {
            radius: 3,
            fillColor: document.getElementById('uniform-color-checkbox').checked ? getBandColor(qso.band) : '#FF0000',
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });

        const distance = calculateDistance(
            window.mapData.my_latitude,
            window.mapData.my_longitude,
            qso.latitude,
            qso.longitude
        );
        
        marker.bindPopup(`
            <strong>${qso.call}</strong><br>
            Date: ${qso.date}<br>
            Time: ${qso.time}<br>
            Mode: ${qso.mode}<br>
            Band: ${qso.band}<br>
            Grid: ${qso.grid}<br>
            DXCC: ${qso.dxcc}<br>
            Distance: ${distance} km
        `);

        marker.addTo(map);

        // Draw arc only if lines are not hidden
        if (!hideLines) {
            try {
                const arc = drawArc(
                    [window.mapData.my_latitude, window.mapData.my_longitude],
                    [qso.latitude, adjustedLng]
                );
                arc.addTo(map);
            } catch (e) {
                console.log(e);
            }
        }
    });
}

var myMarker = L.marker([window.mapData.my_latitude, window.mapData.my_longitude], {
    icon: L.divIcon({
        className: 'my-marker',
        iconSize: [5, 5]
    })
}).addTo(map);
myMarker.bindPopup('<strong>My Location</strong>');

document.getElementById('night-mode-button').addEventListener('click', function() {
    if (map.hasLayer(dayLayer)) {
        map.removeLayer(dayLayer);
        map.addLayer(nightLayer);
    } else {
        map.removeLayer(nightLayer);
        map.addLayer(dayLayer);
    }
});

// Add stats toggle functionality
const contentContainer = document.querySelector('.content-container');
const showStatsButton = document.getElementById('show-stats-button');
showStatsButton.addEventListener('click', function() {
    if (contentContainer.style.display === 'none') {
        contentContainer.style.display = 'block';
        showStatsButton.textContent = 'Hide Statistics';
    } else {
        contentContainer.style.display = 'none';
        showStatsButton.textContent = 'Show Statistics';
    }
});

// Add uniform color toggle functionality
document.getElementById('uniform-color-checkbox').addEventListener('change', function() {
    // Remove all existing markers
    map.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });
    // Add markers again with new color setting
    addMarkers();
});

// Add mode filter functionality
function initializeModeFilter() {
    const modeFilter = document.getElementById('mode-checkboxes');
    const modes = [...new Set(qsos.map(qso => qso.mode))];

    // Sort modes with custom order
    const modeOrder = {
        'CW': 1,
        'SSB': 2,
        'FT8': 3,
        'FT4': 4
    };

    modes.sort((a, b) => {
        const orderA = modeOrder[a] || 999;
        const orderB = modeOrder[b] || 999;
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        return a.localeCompare(b);
    });

    modes.forEach(mode => {
        const modeColor = getModeColor(mode);
        const div = document.createElement('div');
        div.className = 'mode-checkbox-item';
        div.innerHTML = `
            <label>
                <input type="checkbox" class="mode-checkbox" value="${mode}" checked>
                <span class="mode-color-dot" style="background-color: ${modeColor}"></span>
                ${mode}
            </label>
        `;
        modeFilter.appendChild(div);
    });

    // Add event listeners for checkboxes
    document.querySelectorAll('.mode-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateMarkers);

// Function to calculate contrast text color based on background
function getContrastColor(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black or white based on luminance
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// Apply mode colors to table cells
function applyModeColors() {
    const modeCells = document.querySelectorAll('.mode-cell');
    modeCells.forEach(cell => {
        const mode = cell.getAttribute('data-mode');
        const color = getModeColor(mode);
        cell.style.backgroundColor = color;
        cell.style.color = '#FFFFFF'; // Always set text color to white
    });
}

// Apply mode colors to table cells
applyModeColors();
    });

    // Add event listener for toggle button
    const toggleButton = document.getElementById('toggle-all-modes');
    let allSelected = true; // Initial state since all checkboxes are checked by default

    toggleButton.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.mode-checkbox');
        allSelected = !allSelected;

        checkboxes.forEach(cb => cb.checked = allSelected);
        toggleButton.textContent = allSelected ? 'Deselect All' : 'Select All';
        updateMarkers();
    });
}

function updateMarkers() {
    // Skip if timeline is active - timeline handles its own markers
    if (isTimelineActive) {
        updateTimelineDisplay(parseInt(document.getElementById('timeline-slider').value));
        return;
    }
    
    // Remove all existing markers and arcs
    map.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker || layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });

    // Get selected modes
    const selectedModes = Array.from(document.querySelectorAll('.mode-checkbox:checked'))
        .map(cb => cb.value);

    // Get selected bands
    const selectedBands = Array.from(document.querySelectorAll('.band-checkbox:checked'))
        .map(cb => cb.value);

    // Check if lines should be hidden
    const hideLinesCheckbox = document.getElementById('hide-lines-checkbox');
    const hideLines = hideLinesCheckbox && hideLinesCheckbox.checked;

    const centerLng = window.mapData.my_longitude;
    // Add markers and arcs only for selected modes and bands
    qsos.forEach(qso => {
        if (selectedModes.includes(qso.mode) && selectedBands.includes(qso.band)) {
            // Adjust longitude of the marker to match the arc
            const adjustedLng = adjustLongitude(qso.longitude, centerLng);

            // Add marker
            const marker = L.circleMarker([qso.latitude, adjustedLng], {
                radius: 3,
                fillColor: document.getElementById('uniform-color-checkbox').checked ? getBandColor(qso.band) : '#FF0000',
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });

            const distance = calculateDistance(
                window.mapData.my_latitude,
                window.mapData.my_longitude,
                qso.latitude,
                qso.longitude
            );
            
            marker.bindPopup(`
                <strong>${qso.call}</strong><br>
                Date: ${qso.date}<br>
                Time: ${qso.time}<br>
                Mode: ${qso.mode}<br>
                Band: ${qso.band}<br>
                Grid: ${qso.grid}<br>
                DXCC: ${qso.dxcc}<br>
                Distance: ${distance} km
            `);

            marker.addTo(map);

            // Draw arc only if lines are not hidden
            if (!hideLines) {
                try {
                    const arc = drawArc(
                        [window.mapData.my_latitude, window.mapData.my_longitude],
                        [qso.latitude, adjustedLng]
                    );
                    arc.addTo(map);
                } catch (e) {
                    console.log(e);
                }
            }
        }
    });
}

// Initialize mode filter after map is loaded
initializeModeFilter();


// Add filter tab switching functionality
document.getElementById('mode-tab-btn').addEventListener('click', function() {
    document.getElementById('mode-filter-tab').classList.add('active');
    document.getElementById('band-filter-tab').classList.remove('active');
    document.getElementById('mode-tab-btn').classList.add('active');
    document.getElementById('band-tab-btn').classList.remove('active');
});

document.getElementById('band-tab-btn').addEventListener('click', function() {
    document.getElementById('band-filter-tab').classList.add('active');
    document.getElementById('mode-filter-tab').classList.remove('active');
    document.getElementById('band-tab-btn').classList.add('active');
    document.getElementById('mode-tab-btn').classList.remove('active');
});

// Add band filter functionality
function initializeBandFilter() {
    const bandFilter = document.getElementById('band-checkboxes');
    const bands = [...new Set(qsos.map(qso => qso.band))];

    // Sort bands in order
    const bandOrder = ['160m', '80m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m', '4m', '2m', '70cm', '23cm', '13cm', '3cm', '1.25cm', '2.4ghz', '10ghz'];

    bands.sort((a, b) => {
        const indexA = bandOrder.indexOf(a);
        const indexB = bandOrder.indexOf(b);
        const orderA = indexA === -1 ? 999 : indexA;
        const orderB = indexB === -1 ? 999 : indexB;
        return orderA - orderB;
    });

    bands.forEach(band => {
        const bandColor = getBandColor(band);
        const div = document.createElement('div');
        div.className = 'band-checkbox-item';
        div.innerHTML = `
            <label>
                <input type="checkbox" class="band-checkbox" value="${band}" checked>
                <span class="band-color-dot" style="background-color: ${bandColor}"></span>
                ${band}
            </label>
        `;
        bandFilter.appendChild(div);
    });

    // Add event listeners for checkboxes
    document.querySelectorAll('.band-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateMarkers);
    });

    // Add event listener for toggle button
    const toggleButton = document.getElementById('toggle-all-bands');
    let allSelected = true;

    toggleButton.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.band-checkbox');
        allSelected = !allSelected;

        checkboxes.forEach(cb => cb.checked = allSelected);
        toggleButton.textContent = allSelected ? 'Deselect All' : 'Select All';
        updateMarkers();
    });
}

// Initialize band filter after map is loaded
initializeBandFilter();

// Update markers when uniform color checkbox changes
document.getElementById('uniform-color-checkbox').addEventListener('change', updateMarkers);

// Add event listener for hide lines checkbox
document.getElementById('hide-lines-checkbox').addEventListener('change', updateMarkers);

// Handle window resize to adjust map for mobile devices
window.addEventListener('resize', function() {
    map.invalidateSize();
});

// Adjust map size on load to ensure it fits properly on mobile
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        map.invalidateSize();
    }, 100);
});

// Initialize timeline event listeners
initTimelineEventListeners();

// ==================== FILTER PANEL MINIMIZE FUNCTIONALITY ====================

// Filter panel minimize toggle
document.getElementById('filter-minimize-btn').addEventListener('click', function() {
    const panel = document.querySelector('.combined-filter-panel');
    const btn = this;
    
    panel.classList.toggle('minimized');
    
    if (panel.classList.contains('minimized')) {
        btn.textContent = '+';
        btn.title = 'Expand';
    } else {
        btn.textContent = '−';
        btn.title = 'Minimize';
    }
});
