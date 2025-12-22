// Auto-detect API URL based on environment
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api/data'
    : '/api/data';

let autoRefreshInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Display API endpoint
    const apiEndpointEl = document.getElementById('apiEndpoint');
    if (apiEndpointEl) {
        apiEndpointEl.textContent = window.location.origin + '/api/data';
    }
    
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
        const response = await fetch(API_URL);
        const data = await response.json();
        
        updateStats(data);
        updateTable(data);
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Make sure the server is running.');
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

function updateTable(data) {
    const tbody = document.getElementById('tableBody');
    
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr class="no-data">
                <td colspan="4">No data yet. Waiting for Unity to send data...</td>
            </tr>
        `;
        return;
    }
    
    // Sort by timestamp, most recent first
    const sortedData = [...data].reverse();
    
    tbody.innerHTML = sortedData.map(item => `
        <tr class="new-row">
            <td>${formatDate(item.timestamp)}</td>
            <td><strong>${escapeHtml(item.name)}</strong></td>
            <td>
                <span class="color-badge">
                    <span class="color-swatch" style="background-color: ${escapeHtml(item.mostUsedColor)}"></span>
                    ${escapeHtml(item.mostUsedColor)}
                </span>
            </td>
            <td>
                <span class="time-badge">${formatTime(item.designTime)}</span>
            </td>
        </tr>
    `).join('');
}

async function clearData() {
    if (!confirm('Are you sure you want to clear all data?')) {
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadData();
            showSuccess('All data cleared successfully!');
        }
    } catch (error) {
        console.error('Error clearing data:', error);
        showError('Failed to clear data.');
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
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    // Simple alert for now - you can make this fancier
    console.error(message);
}

function showSuccess(message) {
    // Simple alert for now - you can make this fancier
    console.log(message);
}
