// View Cycle Page JavaScript
let currentCycleId = null;
let meetings = [];

async function loadCycleDetails() {
    const params = new URLSearchParams(window.location.search);
    currentCycleId = parseInt(params.get('id'));
    
    if (!currentCycleId) {
        window.location.href = 'midweek.html';
        return;
    }
    
    try {
        // Load cycle info
        const cyclesResponse = await fetch(`${API_URL}/cycles`);
        const cycles = await cyclesResponse.json();
        const cycle = cycles.find(c => c.id === currentCycleId);
        
        if (!cycle) {
            window.location.href = 'midweek.html';
            return;
        }
        
        // Display cycle info
        document.getElementById('cycle-info').innerHTML = `
            <div class="page-header">
                <h2>${h(cycle.title)}</h2>
                <p>${h(cycle.start_date)} → ${h(cycle.end_date)}</p>
            </div>
        `;
        
        // Load meetings
        const meetingsResponse = await fetch(`${API_URL}/cycles/${currentCycleId}/meetings`);
        meetings = await meetingsResponse.json();
        displayMeetings();
        
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load cycle details');
    }
}

function displayMeetings() {
    const container = document.getElementById('thursdays-list');
    
    if (meetings.length === 0) {
        container.innerHTML = '<div class="empty-state">No meetings found.</div>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${meetings.map(m => `
                    <tr>
                        <td>${m.sequence_no || '-'}</td>
                        <td><strong>${formatDate(m.meeting_date)}</strong></td>
                        <td>
                            <a href="edit-thursday.html?id=${m.id}" class="btn btn-primary">Assign Parts</a>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Initialize
loadCycleDetails();
