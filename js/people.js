// People Page JavaScript
let people = [];
let currentCategory = null;

const categoryNames = {
    'elders': 'Congregation Elders',
    'ms': 'Ministerial Servants',
    'publishers': 'Publishers',
    'student-brothers': 'Student Brothers',
    'student-sisters': 'Student Sisters',
    'attendants': 'Attendant Brothers'
};

const categoryMap = {
    'elders': 'elder',
    'ms': 'ms',
    'publishers': 'publisher',
    'student-brothers': 'student-brother',
    'student-sisters': 'student-sister',
    'attendants': 'attendant'
};

async function loadPeople() {
    try {
        const response = await fetch(`${API_URL}/people`);
        if (!response.ok) throw new Error('Failed to load people');
        people = await response.json();
        updateCounts();
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load people');
    }
}

function updateCounts() {
    const counts = {
        elders: people.filter(p => p.category === 'elder').length,
        ms: people.filter(p => p.category === 'ms').length,
        publishers: people.filter(p => p.category === 'publisher').length,
        'student-brothers': people.filter(p => p.category === 'student-brother').length,
        'student-sisters': people.filter(p => p.category === 'student-sister').length,
        attendants: people.filter(p => p.category === 'attendant').length
    };
    
    Object.keys(counts).forEach(key => {
        const el = document.getElementById(`count-${key}`);
        if (el) el.textContent = counts[key];
    });
}

function showCategory(category) {
    currentCategory = category;
    document.getElementById('category-title').textContent = categoryNames[category];
    document.getElementById('category-detail').style.display = 'block';
    
    const filtered = people.filter(p => p.category === categoryMap[category]);
    const container = document.getElementById('people-list');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No people in this category yet.</div>';
        return;
    }
    
    container.innerHTML = filtered.map(person => `
        <div class="person-item">
            <div class="item-header">
                <div class="item-title">${h(person.full_name)}</div>
                <span class="badge badge-primary">${h(person.category)}</span>
            </div>
            <div class="item-actions">
                <button class="btn btn-danger" onclick="deletePerson(${person.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function showAddModal() {
    document.getElementById('add-person-modal').style.display = 'block';
}

function closeAddModal() {
    document.getElementById('add-person-modal').style.display = 'none';
    document.getElementById('add-person-form').reset();
}

async function handleAddPerson(e) {
    e.preventDefault();
    const name = document.getElementById('person-name').value;
    const category = document.getElementById('person-category').value;
    
    try {
        const response = await fetch(`${API_URL}/people`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name: name, category })
        });
        
        if (!response.ok) throw new Error('Failed to add person');
        
        closeAddModal();
        await loadPeople();
        if (currentCategory) showCategory(currentCategory);
        showSuccess('Person added successfully!');
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to add person');
    }
}

async function deletePerson(id) {
    if (!confirm('Are you sure you want to delete this person?')) return;
    
    try {
        const response = await fetch(`${API_URL}/people/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete person');
        
        await loadPeople();
        if (currentCategory) showCategory(currentCategory);
        showSuccess('Person deleted successfully!');
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to delete person');
    }
}

// Make functions global
window.showCategory = showCategory;
window.showAddModal = showAddModal;
window.closeAddModal = closeAddModal;
window.deletePerson = deletePerson;

// Initialize
document.getElementById('add-person-form').addEventListener('submit', handleAddPerson);
loadPeople();
