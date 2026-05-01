/**
 * OLAP System - Optimal Load Allocation for Packages
 * Core Logic and UI Controller
 */

// --- State Management ---
let packages = [];
let packageIdCounter = 1;
let dpTable = [];
let selectedPackages = [];

// --- Data Models ---
class Package {
    constructor(id, weight, profit) {
        this.id = id;
        this.weight = weight;
        this.profit = profit;
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
function addPackageForm() {
    const idInput = document.getElementById('newPackageId');
    const weightInput = document.getElementById('newPackageWeight');
    const profitInput = document.getElementById('newPackageProfit');
    
    const packageId = idInput.value.trim();
    const weight = parseFloat(weightInput.value);
    const profit = parseFloat(profitInput.value);
    
    if (!validatePackageInput(packageId, weight, profit)) return;
    
    const newPackage = new Package(packageId, weight, profit);
    packages.push(newPackage);
    
    updatePackageTable();
    clearInputs([weightInput, profitInput]);
    updateNextPackageId();
    
    showNotification(`Package "${packageId}" added successfully!`, 'success');
}

function validatePackageInput(id, weight, profit) {
    if (!id) {
        showNotification('Please enter a Package ID.', 'error');
        return false;
    }
    if (isNaN(weight) || isNaN(profit) || weight <= 0 || profit <= 0) {
        showNotification('Enter valid positive numbers for weight and profit.', 'error');
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
                <td class="font-bold text-indigo-400">${pkg.id}</td>
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
    hideSections(['resultsSection', 'dpTableSection', 'comparisonSection']);
    showNotification('Inventory cleared.', 'success');
}

function loadSampleData() {
    packages = [
        new Package('PKG-001', 10, 60),
        new Package('PKG-002', 20, 100),
        new Package('PKG-003', 30, 120),
        new Package('PKG-004', 15, 80),
        new Package('PKG-005', 25, 110),
        new Package('PKG-006', 12, 70),
        new Package('PKG-007', 18, 90),
        new Package('PKG-008', 8, 45)
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

function optimizeLoad() {
    const capacity = parseInt(document.getElementById('truckCapacity').value);
    
    if (packages.length === 0) return showNotification('Add packages first.', 'error');
    if (isNaN(capacity) || capacity <= 0) return showNotification('Invalid capacity.', 'error');
    
    const result = solveKnapsack(packages, capacity);
    dpTable = result.table;
    selectedPackages = result.selected;
    
    const totalWeight = selectedPackages.reduce((sum, p) => sum + p.weight, 0);
    const efficiency = ((totalWeight / capacity) * 100).toFixed(1);
    
    renderResults(result.maxProfit, totalWeight, efficiency);
    renderDPTable(capacity);
    
    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('dpTableSection').classList.remove('hidden');
    
    showNotification('Optimization complete!', 'success');
    window.scrollTo({ top: document.getElementById('resultsSection').offsetTop - 100, behavior: 'smooth' });
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

function loadData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            packages = data.packages.map(p => new Package(p.id, p.weight, p.profit));
            document.getElementById('truckCapacity').value = data.capacity;
            updatePackageTable();
            updateNextPackageId();
            showNotification('Data loaded successfully.', 'success');
        } catch (err) {
            showNotification('Invalid file format.', 'error');
        }
    };
    reader.readAsText(file);
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
