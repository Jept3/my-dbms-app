// Assignments Page JavaScript
let cycles = [];

async function loadAssignments() {
    try {
        const response = await fetch(`${API_URL}/cycles`);
        if (!response.ok) throw new Error('Failed to load cycles');
        cycles = await response.json();
        displayCycles();
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load assignments');
    }
}

function displayCycles() {
    const container = document.getElementById('assignments-list');
    
    if (cycles.length === 0) {
        container.innerHTML = '<div class="empty-state">No cycles yet. Create one in Midweek.</div>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Cycle</th>
                    <th>Range</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${cycles.map(c => `
                    <tr>
                        <td><strong>${h(c.title)}</strong></td>
                        <td>${h(c.start_date)} → ${h(c.end_date)}</td>
                        <td>
                            <a href="view-cycle.html?id=${c.id}" class="btn btn-primary">View Assignments</a>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Initialize
loadAssignments();
