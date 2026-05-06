/**
 * OLAP System - Optimal Load Allocation for Packages
 * Core Logic and UI Controller
 */

// --- State Management ---
let packages = [];
let packageIdCounter = 1;
let dpTable = [];
let selectedPackages = [];

// --- Global Config ---
let warehouseLocation = { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, Delhi' };

// --- Data Models ---
class Package {
    constructor(id, weight, profit, lat, lng, address) {
        this.id = id;
        this.weight = weight;
        this.profit = profit;
        this.lat = parseFloat(lat);
        this.lng = parseFloat(lng);
        this.address = address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        this.ratio = profit / weight;
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadSampleData();
    setupEventListeners();
}

/**
 * Geocodes an address string to coordinates
 */
async function geocodeAddress(address) {
    if (!address) return null;
    // Check if it's already coordinates
    const coordMatch = address.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (coordMatch) return { lat: parseFloat(coordMatch[1]), lon: parseFloat(coordMatch[2]) };

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
        const data = await response.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), name: data[0].display_name };
        }
    } catch (error) {
        console.error("Geocoding error:", error);
    }
    return null;
}

function setupEventListeners() {
    // Enter key support for inputs
    const inputs = ['newPackageWeight', 'newPackageProfit'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (id === 'newPackageWeight') document.getElementById('newPackageProfit').focus();
                else addPackageForm();
            }
        });
    });
}

// --- UI Controllers ---

/**
 * Adds a new package from the form inputs
 */
async function addPackageForm() {
    const idInput = document.getElementById('newPackageId');
    const weightInput = document.getElementById('newPackageWeight');
    const profitInput = document.getElementById('newPackageProfit');
    const addressInput = document.getElementById('newPackageAddress');
    const btn = document.getElementById('addPackageBtn');
    const indicator = document.getElementById('geocodingIndicator');
    
    const packageId = idInput.value.trim();
    const weight = parseFloat(weightInput.value);
    const profit = parseFloat(profitInput.value);
    const address = addressInput.value.trim();
    
    if (!validatePackageInput(packageId, weight, profit, address)) return;

    // Show loading state
    btn.disabled = true;
    indicator.classList.remove('hidden');
    
    const coords = await geocodeAddress(address);
    
    btn.disabled = false;
    indicator.classList.add('hidden');

    if (!coords) {
        showNotification("Could not find location. Please be more specific.", "error");
        return;
    }
    
    const newPackage = new Package(packageId, weight, profit, coords.lat, coords.lon, coords.name || address);
    packages.push(newPackage);
    
    updatePackageTable();
    clearInputs([weightInput, profitInput, addressInput]);
    updateNextPackageId();
    
    showNotification(`Package "${packageId}" added successfully!`, 'success');
}

function validatePackageInput(id, weight, profit, address) {
    if (!id) {
        showNotification('Please enter a Package ID.', 'error');
        return false;
    }
    if (isNaN(weight) || isNaN(profit) || weight <= 0 || profit <= 0) {
        showNotification('Enter valid positive numbers for weight and profit.', 'error');
        return false;
    }
    if (!address) {
        showNotification('Please enter a delivery address.', 'error');
        return false;
    }
    if (packages.some(pkg => pkg.id === id)) {
        showNotification(`ID "${id}" already exists.`, 'error');
        return false;
    }
    return true;
}

function clearInputs(inputs) {
    inputs.forEach(input => input.value = '');
}

/**
 * Updates the sequential package ID suggestion
 */
function updateNextPackageId() {
    const idInput = document.getElementById('newPackageId');
    // Find highest numeric ID if they follow the PKG-X pattern
    const numericIds = packages
        .map(p => {
            const match = p.id.match(/PKG-(\d+)/);
            return match ? parseInt(match[1]) : 0;
        });
    
    const maxId = Math.max(0, ...numericIds, packageIdCounter - 1);
    packageIdCounter = maxId + 1;
    idInput.value = `PKG-${String(packageIdCounter).padStart(3, '0')}`;
}

/**
 * Updates the inventory table display
 */
function updatePackageTable() {
    const tbody = document.getElementById('packageTableBody');
    const emptyState = document.getElementById('emptyStateMessage');
    const table = document.getElementById('packageTable');
    
    tbody.innerHTML = '';
    
    if (packages.length === 0) {
        table.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } else {
        table.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        packages.forEach(pkg => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="font-bold text-indigo-400">${pkg.id}</div>
                    <div class="text-[10px] text-slate-500 truncate max-w-[200px]" title="${pkg.address}">${pkg.address}</div>
                </td>
                <td>${pkg.weight} kg</td>
                <td class="text-emerald-400 font-bold">₹${pkg.profit}</td>
                <td>
                    <span class="badge ${getRatioBadgeClass(pkg.ratio)}">
                        ${pkg.ratio.toFixed(2)}
                    </span>
                </td>
                <td class="text-right">
                    <button onclick="removePackage('${pkg.id}')" class="text-slate-500 hover:text-red-400 transition p-2">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

function updatePackageTable() {
    const tbody = document.getElementById('packageTableBody');
    const emptyState = document.getElementById('emptyStateMessage');
    const table = document.getElementById('packageTable');
    
    tbody.innerHTML = '';
    
    if (packages.length === 0) {
        table.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } else {
        table.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        packages.forEach(pkg => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="font-bold text-indigo-400">${pkg.id}</div>
                    <div class="text-[10px] text-slate-500 truncate max-w-[200px]" title="${pkg.address}">${pkg.address}</div>
                </td>
                <td>${pkg.weight} kg</td>
                <td class="text-emerald-400 font-bold">₹${pkg.profit}</td>
                <td>
                    <span class="badge ${getRatioBadgeClass(pkg.ratio)}">
                        ${pkg.ratio.toFixed(2)}
                    </span>
                </td>
                <td class="text-right">
                    <button onclick="removePackage('${pkg.id}')" class="text-slate-500 hover:text-red-400 transition p-2">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

function getRatioBadgeClass(ratio) {
    if (ratio > 5) return 'badge-success';
    if (ratio > 3) return 'badge-primary';
    return 'badge-danger';
}

function removePackage(id) {
    packages = packages.filter(p => p.id !== id);
    updatePackageTable();
    showNotification(`Package "${id}" removed.`, 'success');
}

function clearPackages() {
    packages = [];
    packageIdCounter = 1;
    updatePackageTable();
    updateNextPackageId();
    localStorage.removeItem('olap_active_route');
    hideSections(['resultsSection', 'dpTableSection', 'comparisonSection']);
    showNotification('Inventory cleared.', 'success');
}

function loadSampleData() {
    // Sample data with real addresses in NCR
    packages = [
        new Package('PKG-001', 10, 60, 28.625, 77.210, 'Connaught Place, Delhi'),
        new Package('PKG-002', 20, 100, 28.610, 77.230, 'India Gate, Delhi'),
        new Package('PKG-003', 30, 120, 28.590, 77.215, 'Lodhi Garden, Delhi'),
        new Package('PKG-004', 15, 80, 28.635, 77.190, 'Karol Bagh, Delhi'),
        new Package('PKG-005', 25, 110, 28.600, 77.180, 'Chanakyapuri, Delhi'),
        new Package('PKG-006', 12, 70, 28.650, 77.225, 'Old Delhi Railway Station'),
        new Package('PKG-007', 18, 90, 28.580, 77.250, 'Humayun\'s Tomb, Delhi'),
        new Package('PKG-008', 8, 45, 28.615, 77.200, 'Palika Bazaar, Delhi')
    ];
    updatePackageTable();
    updateNextPackageId();
    showNotification('Sample dataset loaded.', 'success');
}

function sortPackages(criteria) {
    switch(criteria) {
        case 'profit': packages.sort((a, b) => b.profit - a.profit); break;
        case 'weight': packages.sort((a, b) => a.weight - b.weight); break;
        case 'ratio': packages.sort((a, b) => b.ratio - a.ratio); break;
    }
    updatePackageTable();
    showNotification(`Sorted by ${criteria}`, 'success');
}

// --- Algorithm Implementations ---

/**
 * 0/1 Knapsack Algorithm using Dynamic Programming
 */
function solveKnapsack(items, capacity) {
    const n = items.length;
    const K = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= capacity; w++) {
            const { weight, profit } = items[i - 1];
            if (weight <= w) {
                K[i][w] = Math.max(profit + K[i - 1][w - weight], K[i - 1][w]);
            } else {
                K[i][w] = K[i - 1][w];
            }
        }
    }
    
    // Backtrack
    const selected = [];
    let res = K[n][capacity];
    let w = capacity;
    for (let i = n; i > 0 && res > 0; i--) {
        if (res !== K[i - 1][w]) {
            selected.push(items[i - 1]);
            res -= items[i - 1].profit;
            w -= items[i - 1].weight;
        }
    }
    
    return { table: K, selected: selected, maxProfit: K[n][capacity] };
}

function greedyKnapsack(items, capacity) {
    const sorted = [...items].sort((a, b) => b.ratio - a.ratio);
    let totalProfit = 0;
    let totalWeight = 0;
    const selected = [];
    
    for (const item of sorted) {
        if (totalWeight + item.weight <= capacity) {
            selected.push(item);
            totalProfit += item.profit;
            totalWeight += item.weight;
        }
    }
    return { profit: totalProfit, weight: totalWeight };
}

// --- Action Handlers ---

async function optimizeLoad() {
    const capacity = parseInt(document.getElementById('truckCapacity').value);
    const warehouseAddr = document.getElementById('warehouseAddress').value;
    
    if (packages.length === 0) return showNotification('Add packages first.', 'error');
    if (isNaN(capacity) || capacity <= 0) return showNotification('Invalid capacity.', 'error');
    
    // Geocode Warehouse first
    const whCoords = await geocodeAddress(warehouseAddr);
    if (whCoords) {
        warehouseLocation = { lat: whCoords.lat, lng: whCoords.lon, address: whCoords.name || warehouseAddr };
    }

    const result = solveKnapsack(packages, capacity);
    dpTable = result.table;
    selectedPackages = result.selected;
    
    const totalWeight = selectedPackages.reduce((sum, p) => sum + p.weight, 0);
    const efficiency = ((totalWeight / capacity) * 100).toFixed(1);
    
    renderResults(result.maxProfit, totalWeight, efficiency);
    renderDPTable(capacity);
    
    // TSP Optimization for the selected items
    if (selectedPackages.length > 0) {
        const route = solveTSP(selectedPackages);
        localStorage.setItem('olap_active_route', JSON.stringify(route));
    }

    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('dpTableSection').classList.remove('hidden');
    
    showNotification('Dispatch optimization complete!', 'success');
    window.scrollTo({ top: document.getElementById('resultsSection').offsetTop - 100, behavior: 'smooth' });
}

/**
 * Traveling Salesperson Algorithm using Nearest Neighbor for Real-time responsiveness
 */
function solveTSP(items) {
    const points = [{ lat: warehouseLocation.lat, lng: warehouseLocation.lng }, ...items];
    const n = points.length;
    const visited = new Array(n).fill(false);
    const path = [0]; // Start at warehouse
    visited[0] = true;
    
    let current = 0;
    while (path.length < n) {
        let next = -1;
        let minDist = Infinity;
        
        for (let i = 0; i < n; i++) {
            if (!visited[i]) {
                const d = getDistance([points[current].lat, points[current].lng], [points[i].lat, points[i].lng]);
                if (d < minDist) {
                    minDist = d;
                    next = i;
                }
            }
        }
        
        visited[next] = true;
        path.push(next);
        current = next;
    }
    
    path.push(0); // Return to warehouse
    
    // Map indices back to objects
    return path.map(idx => {
        if (idx === 0) return { id: 'WAREHOUSE', address: warehouseLocation.address, lat: warehouseLocation.lat, lng: warehouseLocation.lng };
        return items[idx - 1];
    });
}

function getDistance(p1, p2) {
    // Haversine formula for real-world distance
    const R = 6371; // Earth radius in km
    const dLat = (p2[0] - p1[0]) * Math.PI / 180;
    const dLon = (p2[1] - p1[1]) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function renderRoute(route) {
    if (routeLine) map.removeLayer(routeLine);
    
    const coords = route.map(p => [p.lat, p.lng]);
    
    routeLine = L.polyline(coords, {
        color: '#6366f1',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10',
        lineCap: 'round'
    }).addTo(map);
    
    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
    
    // Render Itinerary
    const itineraryContainer = document.getElementById('deliveryItinerary');
    itineraryContainer.innerHTML = '';
    
    route.forEach((stop, index) => {
        const isWarehouse = stop.id === 'WAREHOUSE';
        const card = document.createElement('div');
        card.className = `p-4 rounded-xl border flex items-center gap-4 transition-all hover:scale-[1.02] ${
            isWarehouse ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-800/40 border-slate-700/50'
        }`;
        
        card.innerHTML = `
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                isWarehouse ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'
            }">
                ${index + 1}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center">
                    <span class="font-bold text-sm ${isWarehouse ? 'text-indigo-400' : 'text-slate-300'}">${stop.id}</span>
                    ${index === 1 ? '<span class="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-bold">NEXT STOP</span>' : ''}
                </div>
                <div class="text-[10px] text-slate-500 truncate" title="${stop.address}">${stop.address}</div>
            </div>
            ${index < route.length - 1 ? '<i class="fas fa-arrow-right text-slate-700 text-xs"></i>' : ''}
        `;
        itineraryContainer.appendChild(card);
    });

    // Add distance info to results
    let totalDist = 0;
    for (let i = 0; i < route.length - 1; i++) {
        totalDist += getDistance([route[i].lat, route[i].lng], [route[i+1].lat, route[i+1].lng]);
    }
    
    // Remove existing distance card if any
    const existingDist = document.getElementById('totalDistCard');
    if (existingDist) existingDist.remove();

    const distCard = document.createElement('div');
    distCard.id = 'totalDistCard';
    distCard.className = 'stat-card mt-4 border-indigo-500/30';
    distCard.innerHTML = `
        <div class="stat-label">Total Delivery Distance</div>
        <div class="stat-value text-indigo-400">${totalDist.toFixed(2)} km</div>
        <div class="text-xs text-slate-500 italic">Optimized sequence starting from Warehouse</div>
    `;
    document.getElementById('totalProfit').parentElement.parentElement.appendChild(distCard);
}

function compareAlgorithms() {
    const capacity = parseInt(document.getElementById('truckCapacity').value);
    if (packages.length === 0) return showNotification('Add packages first.', 'error');
    
    const dpRes = solveKnapsack(packages, capacity);
    const greedyRes = greedyKnapsack(packages, capacity);
    const randomRes = runRandomTrials(packages, capacity, 1)[0];
    
    renderComparison(dpRes.maxProfit, greedyRes.profit, randomRes.profit);
    document.getElementById('comparisonSection').classList.remove('hidden');
    
    window.scrollTo({ top: document.getElementById('comparisonSection').offsetTop - 100, behavior: 'smooth' });
}

function runRandomTrials(items, capacity, trials) {
    const results = [];
    for(let t=0; t<trials; t++) {
        const shuffled = [...items].sort(() => Math.random() - 0.5);
        let p = 0, w = 0;
        shuffled.forEach(item => {
            if(w + item.weight <= capacity) { p += item.profit; w += item.weight; }
        });
        results.push({ profit: p, weight: w });
    }
    return results;
}

// --- Rendering Helpers ---

function renderResults(profit, weight, efficiency) {
    document.getElementById('totalProfit').textContent = `₹${profit}`;
    document.getElementById('totalWeight').textContent = `${weight} kg`;
    document.getElementById('efficiency').textContent = `${efficiency}%`;
    
    const container = document.getElementById('selectedPackages');
    container.innerHTML = '';
    
    selectedPackages.forEach(pkg => {
        const card = document.createElement('div');
        card.className = 'stat-card bg-slate-800/40 border-slate-700/50';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <span class="text-indigo-400 font-bold">${pkg.id}</span>
                <span class="badge badge-primary text-[10px] px-2 py-0.5">SELECTED</span>
            </div>
            <div class="space-y-1">
                <div class="flex justify-between text-xs">
                    <span class="text-slate-500">Weight</span>
                    <span class="text-slate-300 font-medium">${pkg.weight} kg</span>
                </div>
                <div class="flex justify-between text-xs">
                    <span class="text-slate-500">Profit</span>
                    <span class="text-emerald-400 font-bold">₹${pkg.profit}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderDPTable(capacity) {
    const container = document.getElementById('dpTableContainer');
    const n = packages.length;
    
    let html = '<table class="w-full text-[10px] border-collapse">';
    html += '<thead><tr class="bg-slate-800"><th class="p-1 border border-slate-700">Item \\ Cap</th>';
    
    // Only show step of 1 if capacity is small, else group for readability
    const step = capacity > 20 ? Math.ceil(capacity / 20) : 1;
    
    for (let w = 0; w <= capacity; w += step) {
        html += `<th class="p-1 border border-slate-700 text-center">${w}</th>`;
    }
    html += '</tr></thead><tbody>';
    
    for (let i = 0; i <= n; i++) {
        html += `<tr><td class="p-1 border border-slate-700 font-bold bg-slate-800/50">${i === 0 ? 'Start' : packages[i - 1].id}</td>`;
        for (let w = 0; w <= capacity; w += step) {
            const val = dpTable[i][w];
            const isSelected = i > 0 && selectedPackages.includes(packages[i-1]) && w >= packages[i-1].weight;
            const cellClass = isSelected ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-500';
            html += `<td class="p-1 border border-slate-700 text-center ${cellClass}">${val}</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderComparison(dp, greedy, random) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (window.myChart) window.myChart.destroy();
    
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Dynamic Prog.', 'Greedy (Ratio)', 'Random'],
            datasets: [{
                label: 'Total Profit (₹)',
                data: [dp, greedy, random],
                backgroundColor: ['#6366f1', '#10b981', '#64748b'],
                borderRadius: 8,
                barThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { display: false } }
        }
    });
    
    const details = document.getElementById('comparisonDetails');
    const diff = dp - greedy;
    const perc = ((diff / (greedy || 1)) * 100).toFixed(1);
    
    details.innerHTML = `
        <div class="stat-card">
            <h4 class="text-sm font-bold text-slate-500 uppercase mb-4">Performance Gap</h4>
            <div class="flex items-center justify-between">
                <div>
                    <div class="text-3xl font-bold text-emerald-400">+₹${diff}</div>
                    <div class="text-sm text-slate-400">Profit improvement over Greedy</div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-indigo-400">${perc}%</div>
                    <div class="text-xs text-slate-500">Efficiency Boost</div>
                </div>
            </div>
        </div>
        <div class="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <p class="text-xs text-indigo-300 leading-relaxed">
                <i class="fas fa-info-circle mr-2"></i>
                The Dynamic Programming algorithm guaranteed the mathematical optimum (₹${dp}), 
                outperforming the heuristic Greedy approach by ₹${diff}.
            </p>
        </div>
    `;
}

// --- Persistence ---

function saveData() {
    const data = JSON.stringify({ packages, capacity: document.getElementById('truckCapacity').value });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'olap_optimization_data.json';
    a.click();
}

/**
 * Simple CSV Parser for Package Data
 */
function parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim() !== '');
    const header = lines[0].toLowerCase().split(',');
    
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const p = {};
        header.forEach((h, i) => {
            const key = h.trim();
            const val = values[i]?.trim();
            if (key.includes('id')) p.id = val;
            else if (key.includes('weight')) p.weight = parseFloat(val);
            else if (key.includes('profit')) p.profit = parseFloat(val);
            else if (key.includes('location') || key.includes('address')) p.location = val;
        });
        return p;
    });
}

/**
 * Loads and merges package data from one or more JSON/CSV files
 */
async function loadData(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let totalPackagesAdded = 0;
    let duplicateCount = 0;
    let filesProcessed = 0;

    const readFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                if (file.name.endsWith('.json')) {
                    try { resolve(JSON.parse(text)); } 
                    catch (err) { reject(new Error(`Invalid JSON: ${file.name}`)); }
                } else {
                    resolve(text); // Return raw text for CSV
                }
            };
            reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
            reader.readAsText(file);
        });
    };

    try {
        for (let i = 0; i < files.length; i++) {
            const data = await readFile(files[i]);
            
            // Check if it's CSV (it will return an array of packages)
            if (files[i].name.endsWith('.csv')) {
                const csvPackages = parseCSV(data);
                for (const p of csvPackages) {
                    if (!packages.some(pkg => pkg.id === p.id)) {
                        let coords = await geocodeAddress(p.location);
                        packages.push(new Package(p.id, p.weight, p.profit, coords?.lat, coords?.lon, p.location));
                        totalPackagesAdded++;
                    } else duplicateCount++;
                }
            } else {
                // Handle JSON
                if (i === 0 && data.capacity) {
                    document.getElementById('truckCapacity').value = data.capacity;
                }
                if (data.packages && Array.isArray(data.packages)) {
                    for (const p of data.packages) {
                        if (!packages.some(pkg => pkg.id === p.id)) {
                            let lat = p.lat, lng = p.lng, address = p.address || p.location;
                            if ((isNaN(lat) || isNaN(lng)) && address) {
                                const coords = await geocodeAddress(address);
                                if (coords) { lat = coords.lat; lng = coords.lon; address = coords.name || address; }
                            }
                            lat = lat || warehouseLocation.lat;
                            lng = lng || warehouseLocation.lng;
                            packages.push(new Package(p.id, p.weight, p.profit, lat, lng, address));
                            totalPackagesAdded++;
                        } else duplicateCount++;
                    }
                }
            }
            filesProcessed++;
        }

        updatePackageTable();
        updateNextPackageId();
        
        let msg = `${filesProcessed} file(s) loaded. ${totalPackagesAdded} new packages added.`;
        if (duplicateCount > 0) msg += ` (${duplicateCount} duplicates skipped)`;
        
        showNotification(msg, 'success');
        
    } catch (err) {
        showNotification(err.message, 'error');
    } finally {
        // Reset input so the same files can be re-selected if needed
        event.target.value = '';
    }
}

// --- Utilities ---

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function hideSections(ids) {
    ids.forEach(id => document.getElementById(id).classList.add('hidden'));
}
