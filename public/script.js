let currentAttacks = [];

// Update form based on selected method
function updateForm() {
    const method = document.getElementById('method').value;
    const durationGroup = document.getElementById('durationGroup');
    const timeGroup = document.getElementById('timeGroup');
    const rateGroup = document.getElementById('rateGroup');
    const threadsGroup = document.getElementById('threadsGroup');

    // Hide all groups first
    durationGroup.style.display = 'none';
    timeGroup.style.display = 'none';
    rateGroup.style.display = 'none';
    threadsGroup.style.display = 'none';

    // Show relevant groups based on method
    if (method === 'flood' || method === 'flood1') {
        durationGroup.style.display = 'block';
    } else {
        timeGroup.style.display = 'block';
        rateGroup.style.display = 'block';
        threadsGroup.style.display = 'block';
    }
}

// Launch attack
async function launchAttack() {
    const method = document.getElementById('method').value;
    const target = document.getElementById('target').value;
    
    if (!target) {
        showResult('Please enter target URL', 'error');
        return;
    }

    let url = `/api/${method}?target=${encodeURIComponent(target)}`;
    
    if (method === 'flood' || method === 'flood1') {
        const duration = document.getElementById('duration').value;
        url += `&duration=${duration}`;
    } else {
        const time = document.getElementById('time').value;
        const rate = document.getElementById('rate').value;
        const threads = document.getElementById('threads').value;
        url += `&time=${time}&rate=${rate}&threads=${threads}`;
    }

    showResult('Launching attack...', 'info');

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            showResult(`Attack launched successfully! ID: ${data.attackId}`, 'success');
            if (data.attackId) {
                currentAttacks.push({
                    id: data.attackId,
                    method: method,
                    target: target,
                    startTime: new Date(),
                    status: 'running'
                });
                updateActiveAttacks();
            }
        } else {
            showResult(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showResult(`Network error: ${error.message}`, 'error');
    }
}

// Show result message
function showResult(message, type) {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = message;
    resultDiv.className = `result ${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        resultDiv.textContent = '';
        resultDiv.className = 'result';
    }, 5000);
}

// Load server stats
async function refreshStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success) {
            const statsHtml = `
                <p><strong>Active Attacks:</strong> ${data.stats.activeAttacks}/${data.stats.maxConcurrent}</p>
                <p><strong>Available:</strong> ${data.stats.available ? 'Yes' : 'No'}</p>
                <p><strong>Uptime:</strong> ${Math.floor(data.stats.uptime)}s</p>
                <p><strong>Memory:</strong> ${Math.round(data.stats.memory.heapUsed / 1024 / 1024)}MB</p>
            `;
            document.getElementById('serverStats').innerHTML = statsHtml;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load attack stats
async function loadAttackStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success) {
            const attackHtml = `
                <p><strong>Current:</strong> ${data.stats.activeAttacks}</p>
                <p><strong>Maximum:</strong> ${data.stats.maxConcurrent}</p>
                <p><strong>Status:</strong> ${data.stats.available ? 'Ready' : 'Busy'}</p>
            `;
            document.getElementById('attackStats').innerHTML = attackHtml;
        }
    } catch (error) {
        console.error('Error loading attack stats:', error);
    }
}

// Load available methods
async function loadMethods() {
    try {
        const response = await fetch('/api/methods');
        const data = await response.json();
        
        if (data.success) {
            let methodsHtml = '';
            data.methods.forEach(method => {
                methodsHtml += `
                    <div class="method-item">
                        <h4>${method.name}</h4>
                        <p>${method.description}</p>
                        <p><strong>Parameters:</strong> ${method.parameters.join(', ')}</p>
                        <p><strong>Endpoint:</strong> ${method.endpoint}</p>
                    </div>
                `;
            });
            document.getElementById('methodsList').innerHTML = methodsHtml;
        }
    } catch (error) {
        console.error('Error loading methods:', error);
    }
}

// Update active attacks display
function updateActiveAttacks() {
    const attacksList = document.getElementById('activeAttacksList');
    
    if (currentAttacks.length === 0) {
        attacksList.innerHTML = '<p class="loading">No active attacks</p>';
        return;
    }

    let attacksHtml = '';
    currentAttacks.forEach(attack => {
        attacksHtml += `
            <div class="attack-item ${attack.status}">
                <div>
                    <strong>${attack.method}</strong><br>
                    <small>${attack.target}</small><br>
                    <small>Started: ${attack.startTime.toLocaleTimeString()}</small>
                </div>
                <button onclick="stopAttack('${attack.id}')" class="btn-stop">
                    <i class="fas fa-stop"></i> Stop
                </button>
            </div>
        `;
    });
    
    attacksList.innerHTML = attacksHtml;
}

// Stop attack
async function stopAttack(attackId) {
    try {
        const response = await fetch('/api/stop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ attackId: attackId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentAttacks = currentAttacks.filter(attack => attack.id !== attackId);
            updateActiveAttacks();
            showResult(data.message, 'success');
        } else {
            showResult(data.error, 'error');
        }
    } catch (error) {
        showResult(`Error: ${error.message}`, 'error');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateForm();
    refreshStats();
    loadAttackStats();
    loadMethods();
    
    // Auto-refresh every 10 seconds
    setInterval(() => {
        refreshStats();
        loadAttackStats();
    }, 10000);
});