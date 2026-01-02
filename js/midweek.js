// Midweek Page JavaScript
let cycles = [];

async function loadCycles() {
    try {
        const response = await fetch(`${API_URL}/cycles`);
        if (!response.ok) throw new Error('Failed to load cycles');
        cycles = await response.json();
        displayCycles();
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load cycles');
    }
}

function displayCycles() {
    const container = document.getElementById('cycles-list');
    
    if (cycles.length === 0) {
        container.innerHTML = '<div class="empty-state">No cycles created yet. Create your first 3-month cycle above.</div>';
        return;
    }
    
    container.innerHTML = cycles.map(cycle => `
        <div class="cycle-item">
            <div class="item-header">
                <div class="item-title">${h(cycle.title)}</div>
            </div>
            <div class="item-meta">${h(cycle.start_date)} → ${h(cycle.end_date)}</div>
            <div class="item-actions">
                <a href="view-cycle.html?id=${cycle.id}" class="btn btn-primary">View Thursdays</a>
                <button class="btn btn-danger" onclick="deleteCycle(${cycle.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

async function handleCreateCycle(e) {
    e.preventDefault();
    
    const title = document.getElementById('cycle-title').value;
    const startDate = document.getElementById('cycle-start').value;
    const endDate = document.getElementById('cycle-end').value;
    
    try {
        const response = await fetch(`${API_URL}/cycles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, start_date: startDate, end_date: endDate })
        });
        
        if (!response.ok) throw new Error('Failed to create cycle');
        
        document.getElementById('create-cycle-form').reset();
        await loadCycles();
        showSuccess('Cycle created successfully with all Thursdays!');
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to create cycle');
    }
}

async function deleteCycle(id) {
    if (!confirm('Delete this cycle and all its meetings?')) return;
    
    try {
        const response = await fetch(`${API_URL}/cycles/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete cycle');
        
        await loadCycles();
        showSuccess('Cycle deleted successfully!');
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to delete cycle');
    }
}

// Make functions global
window.deleteCycle = deleteCycle;

// Initialize
document.getElementById('create-cycle-form').addEventListener('submit', handleCreateCycle);
loadCycles();
