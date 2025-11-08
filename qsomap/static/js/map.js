var map = L.map('map', {
    minZoom: 2,
    maxZoom: 18,
    worldCopyJump: true,
    maxBounds: [
        [-90, -180],
        [90, 180]
    ],
    maxBoundsViscosity: 1.0,
    crs: L.CRS.EPSG3857
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
        
        marker.bindPopup(`
            <strong>${qso.call}</strong><br>
            Date: ${qso.date}<br>
            Time: ${qso.time}<br>
            Mode: ${qso.mode}<br>
            Band: ${qso.band}<br>
            Grid: ${qso.grid}<br>
            DXCC: ${qso.dxcc}
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
            
            marker.bindPopup(`
                <strong>${qso.call}</strong><br>
                Date: ${qso.date}<br>
                Time: ${qso.time}<br>
                Mode: ${qso.mode}<br>
                Band: ${qso.band}<br>
                Grid: ${qso.grid}<br>
                DXCC: ${qso.dxcc}
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
