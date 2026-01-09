// Auto-detect API URL based on environment
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api/data'
    : '/api/data';

let autoRefreshInterval = null;
let colorChart = null;

// Get authentication token
function getAuthToken() {
    return localStorage.getItem('dashboardToken');
}

// Check if authenticated
function checkAuthentication() {
    const token = getAuthToken();
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('dashboardToken');
    window.location.href = 'login.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (!checkAuthentication()) {
        return;
    }

    // Display API endpoint
    const apiEndpointEl = document.getElementById('apiEndpoint');
    if (apiEndpointEl) {
        apiEndpointEl.textContent = window.location.origin + '/api/data';
    }
    
    initChart();
    loadData();
    setupEventListeners();
    startAutoRefresh();
});

function setupEventListeners() {
    document.getElementById('refreshBtn').addEventListener('click', loadData);
    document.getElementById('clearBtn').addEventListener('click', clearData);
    document.getElementById('autoRefresh').addEventListener('change', (e) => {
        if (e.target.checked) {
            startAutoRefresh();
        } else {
            stopAutoRefresh();
        }
    });
}

function startAutoRefresh() {
    stopAutoRefresh();
    autoRefreshInterval = setInterval(loadData, 5000);
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

async function loadData() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (response.status === 401) {
            logout();
            return;
        }
        
        const data = await response.json();
        
        updateStats(data);
        updateChart(data);
        updateTable(data);
    } catch (error) {
        console.error('Erreur de chargement des données:', error);
        showError('Échec du chargement des données. Assurez-vous que le serveur fonctionne.');
    }
}

function updateStats(data) {
    // Total users
    document.getElementById('totalUsers').textContent = data.length;
    
    // Average design time
    if (data.length > 0) {
        const avgTime = data.reduce((sum, item) => sum + item.designTime, 0) / data.length;
        document.getElementById('avgTime').textContent = formatTime(avgTime);
    } else {
        document.getElementById('avgTime').textContent = '0m';
    }
    
    // Most popular color
    if (data.length > 0) {
        const colorCounts = {};
        data.forEach(item => {
            colorCounts[item.mostUsedColor] = (colorCounts[item.mostUsedColor] || 0) + 1;
        });
        
        const topColor = Object.keys(colorCounts).reduce((a, b) => 
            colorCounts[a] > colorCounts[b] ? a : b
        );
        
        const colorEl = document.getElementById('topColor');
        colorEl.textContent = topColor;
        colorEl.style.color = topColor;
        colorEl.style.textShadow = '1px 1px 2px rgba(0,0,0,0.1)';
    } else {
        document.getElementById('topColor').textContent = '-';
        document.getElementById('topColor').style.color = '#667eea';
    }
}

function initChart() {
    const ctx = document.getElementById('colorChart');
    if (!ctx) return;
    
    colorChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    return {
                                        text: `${label} (${value} utilisations)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateChart(data) {
    const noChartData = document.getElementById('noChartData');
    const chartCanvas = document.getElementById('colorChart');
    
    if (data.length === 0) {
        if (chartCanvas) chartCanvas.style.display = 'none';
        if (noChartData) noChartData.style.display = 'block';
        return;
    }
    
    if (chartCanvas) chartCanvas.style.display = 'block';
    if (noChartData) noChartData.style.display = 'none';
    
    // Count color usage
    const colorCounts = {};
    data.forEach(item => {
        colorCounts[item.mostUsedColor] = (colorCounts[item.mostUsedColor] || 0) + 1;
    });
    
    // Sort by count
    const sortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10 colors
    
    // Update chart
    if (colorChart) {
        colorChart.data.labels = sortedColors.map(([color]) => color);
        colorChart.data.datasets[0].data = sortedColors.map(([, count]) => count);
        // Use colorCode from data if available, otherwise fall back to getColorHex
        colorChart.data.datasets[0].backgroundColor = sortedColors.map(([colorName]) => {
            const dataItem = data.find(d => d.mostUsedColor === colorName);
            return dataItem?.colorCode || getColorHex(colorName);
        });
        colorChart.update();
    }
}

function updateTable(data) {
    const tbody = document.getElementById('tableBody');
    
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr class="no-data">
                <td colspan="4">Aucune donnée pour le moment. En attente des données de Unity...</td>
            </tr>
        `;
        return;
    }
    
    // Sort by timestamp, most recent first
    const sortedData = [...data].reverse();
    
    tbody.innerHTML = sortedData.map(item => {
        // Use colorCode if available, otherwise fall back to getColorHex
        const color = item.colorCode || getColorHex(item.mostUsedColor);
        return `
        <tr class="new-row">
            <td>${formatDate(item.timestamp)}</td>
            <td><strong>${escapeHtml(item.name)}</strong></td>
            <td>
                <span class="color-badge" style="background-color: ${color}; border-color: ${color};">
                    <span class="color-badge-text">${escapeHtml(item.mostUsedColor)}</span>
                </span>
            </td>
            <td>
                <span class="time-badge">${formatTime(item.designTime)}</span>
            </td>
        </tr>
        `;
    }).join('');
}

async function clearData() {
    if (!confirm('Êtes-vous sûr de vouloir effacer toutes les données?')) {
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadData();
            showSuccess('Toutes les données ont été effacées avec succès!');
        }
    } catch (error) {
        console.error('Erreur lors de l\'effacement des données:', error);
        showError('Échec de l\'effacement des données.');
    }
}

function formatTime(seconds) {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function getColorHex(colorName) {
    // Convert French color names to hex codes
    const colorMap = {
        // Basic colors from Unity (exact matches)
        'Rouge': '#FF0000',
        'Orange': '#FF8000',
        'Jaune': '#FFFF00',
        'Jaune-Vert': '#80FF00',
        'Vert': '#00FF00',
        'Vert-Cyan': '#00FF80',
        'Cyan': '#00FFFF',
        'Cyan-Bleu': '#0080FF',
        'Bleu': '#0000FF',
        'Violet': '#8000FF',
        'Magenta': '#FF00FF',
        'Rose': '#FF0080',
        'Blanc': '#FFFFFF',
        'Noir': '#000000',
        'Gris': '#808080',
        
        // Lowercase versions
        'rouge': '#FF0000',
        'orange': '#FF8000',
        'jaune': '#FFFF00',
        'jaune-vert': '#80FF00',
        'vert': '#00FF00',
        'vert-cyan': '#00FF80',
        'cyan': '#00FFFF',
        'cyan-bleu': '#0080FF',
        'bleu': '#0000FF',
        'violet': '#8000FF',
        'magenta': '#FF00FF',
        'rose': '#FF0080',
        'blanc': '#FFFFFF',
        'noir': '#000000',
        'gris': '#808080',
        
        // English versions
        'red': '#FF0000',
        'yellow': '#FFFF00',
        'green': '#00FF00',
        'blue': '#0000FF',
        'purple': '#8000FF',
        'pink': '#FFC0CB',
        'white': '#FFFFFF',
        'black': '#000000',
        'gray': '#808080',
        'grey': '#808080',
        
        // Additional shades
        'rouge foncé': '#8B0000',
        'rouge clair': '#FF6B6B',
        'bleu foncé': '#00008B',
        'bleu clair': '#87CEEB',
        'vert foncé': '#006400',
        'vert clair': '#90EE90',
        'orange foncé': '#FF8C00',
        'gris foncé': '#404040',
        'gris clair': '#D3D3D3',
        'or': '#FFD700',
        'gold': '#FFD700',
        'marron': '#8B4513',
        'brown': '#8B4513',
        'turquoise': '#40E0D0',
        'beige': '#F5F5DC'
    };
    
    // Check if it's already a hex code
    if (colorName && colorName.startsWith('#')) {
        return colorName;
    }
    
    // Try exact match first
    if (colorMap[colorName]) {
        return colorMap[colorName];
    }
    
    // Try lowercase
    const normalizedName = colorName ? colorName.toLowerCase().trim() : '';
    return colorMap[normalizedName] || colorName || '#808080';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    console.error(message);
}

function showSuccess(message) {
    console.log(message);
}
