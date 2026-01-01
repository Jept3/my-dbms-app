// JW Schedule Meetings - Complete JavaScript
const API_URL = '/api';

// Global state
let currentCycleId = null;
let currentMeetingId = null;
let currentCategory = null;
let people = [];
let cycles = [];
let meetings = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    loadInitialData();
    setupEventListeners();
});

// Navigation
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            showPage(page);
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(`${pageName}-page`);
    if (page) {
        page.classList.add('active');
        
        // Load data for specific pages
        if (pageName === 'people') loadPeoplePage();
        if (pageName === 'midweek') loadMidweekPage();
        if (pageName === 'assignments') loadAssignmentsPage();
    }
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('create-cycle-form')?.addEventListener('submit', handleCreateCycle);
    document.getElementById('add-person-form')?.addEventListener('submit', handleAddPerson);
}

// Load initial data
async function loadInitialData() {
    await Promise.all([
        loadPeople(),
        loadCycles()
    ]);
    loadMidweekPage();
}

// ============= PEOPLE =============

async function loadPeople() {
    try {
        const response = await fetch(`${API_URL}/people`);
        if (!response.ok) throw new Error('Failed to load people');
        people = await response.json();
        updatePeopleCounts();
    } catch (error) {
        console.error('Error:', error);
    }
}

function updatePeopleCounts() {
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

function loadPeoplePage() {
    updatePeopleCounts();
}

function showPeopleCategory(category) {
    currentCategory = category;
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

function showAddPersonModal() {
    document.getElementById('add-person-modal').style.display = 'block';
}

function closeAddPersonModal() {
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
        
        closeAddPersonModal();
        await loadPeople();
        if (currentCategory) showPeopleCategory(currentCategory);
        showSuccess('Person added successfully!');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add person');
    }
}

async function deletePerson(id) {
    if (!confirm('Are you sure you want to delete this person?')) return;
    
    try {
        const response = await fetch(`${API_URL}/people/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete person');
        
        await loadPeople();
        if (currentCategory) showPeopleCategory(currentCategory);
        showSuccess('Person deleted successfully!');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete person');
    }
}

// ============= CYCLES =============

async function loadCycles() {
    try {
        const response = await fetch(`${API_URL}/cycles`);
        if (!response.ok) throw new Error('Failed to load cycles');
        cycles = await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}

function loadMidweekPage() {
    displayCycles();
}

function loadAssignmentsPage() {
    displayCycles('assignments-cycles-list');
}

function displayCycles(containerId = 'cycles-list') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
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
                <button class="btn btn-primary" onclick="viewCycle(${cycle.id})">View Thursdays</button>
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
        displayCycles();
        showSuccess('Cycle created successfully with all Thursdays!');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create cycle');
    }
}

async function viewCycle(cycleId) {
    currentCycleId = cycleId;
    const cycle = cycles.find(c => c.id === cycleId);
    if (!cycle) return;
    
    document.getElementById('cycle-detail-title').textContent = cycle.title;
    document.getElementById('cycle-detail-dates').textContent = `${cycle.start_date} → ${cycle.end_date}`;
    
    // Load meetings for this cycle
    try {
        const response = await fetch(`${API_URL}/cycles/${cycleId}/meetings`);
        if (!response.ok) throw new Error('Failed to load meetings');
        
        meetings = await response.json();
        displayThursdays();
        showPage('view-cycle');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load meetings');
    }
}

function displayThursdays() {
    const container = document.getElementById('thursdays-list');
    
    if (meetings.length === 0) {
        container.innerHTML = '<div class="empty-state">No meetings found.</div>';
        return;
    }
    
    container.innerHTML = `<table>
        <thead><tr><th>#</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>${meetings.map(m => `
            <tr>
                <td>${m.sequence_no || '-'}</td>
                <td><strong>${formatDate(m.meeting_date)}</strong></td>
                <td><button class="btn btn-primary" onclick="editThursday(${m.id})">Assign Parts</button></td>
            </tr>
        `).join('')}</tbody>
    </table>`;
}

async function deleteCycle(id) {
    if (!confirm('Delete this cycle and all its meetings?')) return;
    
    try {
        const response = await fetch(`${API_URL}/cycles/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete cycle');
        
        await loadCycles();
        displayCycles();
        showSuccess('Cycle deleted successfully!');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete cycle');
    }
}

// ============= EDIT THURSDAY =============

async function editThursday(meetingId) {
    currentMeetingId = meetingId;
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    document.getElementById('thursday-title').textContent = 'Edit Thursday Meeting';
    document.getElementById('thursday-date').textContent = formatDate(meeting.meeting_date);
    
    // Load meeting details
    await loadMeetingDetails(meetingId);
    
    showPage('edit-thursday');
}

async function loadMeetingDetails(meetingId) {
    try {
        const response = await fetch(`${API_URL}/meetings/${meetingId}`);
        if (!response.ok) throw new Error('Failed to load meeting details');
        
        const data = await response.json();
        
        // Populate form fields
        document.getElementById('week-title').value = data.meeting.week_title || '';
        document.getElementById('week-reading').value = data.meeting.week_reading || '';
        document.getElementById('opening-song-no').value = data.meeting.opening_song_no || '';
        document.getElementById('opening-song-title').value = data.meeting.opening_song_title || '';
        document.getElementById('middle-song-no').value = data.meeting.middle_song_no || '';
        document.getElementById('middle-song-title').value = data.meeting.middle_song_title || '';
        document.getElementById('closing-song-no').value = data.meeting.closing_song_no || '';
        document.getElementById('closing-song-title').value = data.meeting.closing_song_title || '';
        
        // Populate people dropdowns
        populatePersonDropdowns();
        
        // Set assignments
        setAssignmentValue('chairman-select', data.assignments.chairman);
        setAssignmentValue('opening-prayer-select', data.assignments.opening_prayer);
        setAssignmentValue('closing-prayer-select', data.assignments.closing_prayer);
        setAssignmentValue('kg1-speaker', data.assignments.kayamanan);
        setAssignmentValue('kg2-speaker', data.assignments.hiyas);
        setAssignmentValue('kg3-reader', data.assignments.bible_reading);
        setAssignmentValue('cbs-reader-phar', data.assignments.cbs_reader_phar);
        setAssignmentValue('cbs-reader-bible', data.assignments.cbs_reader_bible);
        
        document.getElementById('kg1-title').value = data.assignments.kayamanan_title || '';
        
        // Load MM and PBK rows
        displayMMRows(data.mm_rows || []);
        displayPBKRows(data.pbk_rows || []);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load meeting details');
    }
}

function populatePersonDropdowns() {
    const selects = [
        'chairman-select', 'opening-prayer-select', 'closing-prayer-select',
        'kg1-speaker', 'kg2-speaker', 'kg3-reader',
        'cbs-reader-phar', 'cbs-reader-bible'
    ];
    
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select person...</option>' +
            people.map(p => `<option value="${p.id}">${h(p.full_name)}</option>`).join('');
        
        if (currentValue) select.value = currentValue;
    });
}

function setAssignmentValue(selectId, personId) {
    const select = document.getElementById(selectId);
    if (select && personId) {
        select.value = personId;
    }
}

async function saveWeekInfo() {
    const data = {
        week_title: document.getElementById('week-title').value,
        week_reading: document.getElementById('week-reading').value
    };
    
    await saveMeetingField(data);
    showSuccess('Week info saved!');
}

async function saveSongs() {
    const data = {
        opening_song_no: document.getElementById('opening-song-no').value,
        opening_song_title: document.getElementById('opening-song-title').value,
        middle_song_no: document.getElementById('middle-song-no').value,
        middle_song_title: document.getElementById('middle-song-title').value,
        closing_song_no: document.getElementById('closing-song-no').value,
        closing_song_title: document.getElementById('closing-song-title').value
    };
    
    await saveMeetingField(data);
    showSuccess('Songs saved!');
}

async function saveMeetingField(data) {
    try {
        const response = await fetch(`${API_URL}/meetings/${currentMeetingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Failed to save');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to save');
    }
}

async function saveBasicAssignment(slotKey, personId) {
    try {
        const response = await fetch(`${API_URL}/meetings/${currentMeetingId}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slot_key: slotKey, person_id: personId || null })
        });
        
        if (!response.ok) throw new Error('Failed to save assignment');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to save assignment');
    }
}

async function saveKgPart(partNo) {
    const title = document.getElementById('kg1-title').value;
    const speaker = document.getElementById('kg1-speaker').value;
    
    await saveMeetingField({ kayamanan_title: title });
    await saveBasicAssignment('kayamanan', speaker);
}

// ============= MM ROWS =============

let mmRowsData = [];

function displayMMRows(rows) {
    mmRowsData = rows;
    const container = document.getElementById('mm-rows-container');
    
    container.innerHTML = rows.map((row, idx) => `
        <div class="mm-row" data-row-id="${row.id || 0}">
            <div class="row-header">
                <strong>Part ${idx + 1}</strong>
                <button class="btn btn-danger" onclick="deleteMMRow(${row.id || 0}, ${idx})">Delete</button>
            </div>
            <div class="row-inputs">
                <input type="text" placeholder="No." value="${h(row.part_no || '')}" onblur="updateMMRow(${idx})">
                <input type="text" placeholder="Part title" value="${h(row.part_title || '')}" onblur="updateMMRow(${idx})">
            </div>
            <div class="row-selects">
                <select onchange="updateMMRow(${idx})">
                    <option value="">Publisher...</option>
                    ${people.map(p => `<option value="${p.id}" ${p.id == row.publisher_id ? 'selected' : ''}>${h(p.full_name)}</option>`).join('')}
                </select>
                <select onchange="updateMMRow(${idx})">
                    <option value="">Householder...</option>
                    ${people.map(p => `<option value="${p.id}" ${p.id == row.householder_id ? 'selected' : ''}>${h(p.full_name)}</option>`).join('')}
                </select>
            </div>
        </div>
    `).join('');
}

async function addMMRow() {
    try {
        const response = await fetch(`${API_URL}/meetings/${currentMeetingId}/mm-rows`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ part_no: '', part_title: '', publisher_id: null, householder_id: null })
        });
        
        if (!response.ok) throw new Error('Failed to add row');
        
        await loadMeetingDetails(currentMeetingId);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updateMMRow(idx) {
    const row = document.querySelectorAll('.mm-row')[idx];
    if (!row) return;
    
    const inputs = row.querySelectorAll('input');
    const selects = row.querySelectorAll('select');
    const rowId = mmRowsData[idx]?.id;
    
    if (!rowId) return;
    
    const data = {
        part_no: inputs[0].value,
        part_title: inputs[1].value,
        publisher_id: selects[0].value || null,
        householder_id: selects[1].value || null
    };
    
    try {
        await fetch(`${API_URL}/mm-rows/${rowId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteMMRow(rowId, idx) {
    if (!rowId) {
        mmRowsData.splice(idx, 1);
        displayMMRows(mmRowsData);
        return;
    }
    
    try {
        await fetch(`${API_URL}/mm-rows/${rowId}`, { method: 'DELETE' });
        await loadMeetingDetails(currentMeetingId);
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============= PBK ROWS =============

let pbkRowsData = [];

function displayPBKRows(rows) {
    pbkRowsData = rows;
    const container = document.getElementById('pbk-rows-container');
    
    container.innerHTML = rows.map((row, idx) => `
        <div class="pbk-row" data-row-id="${row.id || 0}">
            <div class="row-header">
                <strong>Part ${idx + 1}</strong>
                <button class="btn btn-danger" onclick="deletePBKRow(${row.id || 0}, ${idx})">Delete</button>
            </div>
            <div class="row-inputs">
                <input type="text" placeholder="No." value="${h(row.part_no || '')}" onblur="updatePBKRow(${idx})">
                <input type="text" placeholder="Part title" value="${h(row.part_title || '')}" onblur="updatePBKRow(${idx})">
            </div>
            <div class="row-selects single">
                <select onchange="updatePBKRow(${idx})">
                    <option value="">Speaker...</option>
                    ${people.map(p => `<option value="${p.id}" ${p.id == row.speaker_id ? 'selected' : ''}>${h(p.full_name)}</option>`).join('')}
                </select>
            </div>
        </div>
    `).join('');
}

async function addPBKRow() {
    try {
        const response = await fetch(`${API_URL}/meetings/${currentMeetingId}/pbk-rows`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ part_no: '', part_title: '', speaker_id: null })
        });
        
        if (!response.ok) throw new Error('Failed to add row');
        
        await loadMeetingDetails(currentMeetingId);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updatePBKRow(idx) {
    const row = document.querySelectorAll('.pbk-row')[idx];
    if (!row) return;
    
    const inputs = row.querySelectorAll('input');
    const select = row.querySelector('select');
    const rowId = pbkRowsData[idx]?.id;
    
    if (!rowId) return;
    
    const data = {
        part_no: inputs[0].value,
        part_title: inputs[1].value,
        speaker_id: select.value || null
    };
    
    try {
        await fetch(`${API_URL}/pbk-rows/${rowId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deletePBKRow(rowId, idx) {
    if (!rowId) {
        pbkRowsData.splice(idx, 1);
        displayPBKRows(pbkRowsData);
        return;
    }
    
    try {
        await fetch(`${API_URL}/pbk-rows/${rowId}`, { method: 'DELETE' });
        await loadMeetingDetails(currentMeetingId);
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============= PRINT =============

function printThursday() {
    window.open(`/print?meeting_id=${currentMeetingId}`, '_blank');
}

function printAssignmentSlips() {
    window.open(`/assignment-slips?meeting_id=${currentMeetingId}`, '_blank');
}

function backFromThursday() {
    if (currentCycleId) {
        viewCycle(currentCycleId);
    } else {
        showPage('midweek');
    }
}

// ============= UTILITIES =============

function h(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'short'
    });
}

function showSuccess(msg) {
    const div = document.createElement('div');
    div.className = 'success-message';
    div.textContent = msg;
    div.style.position = 'fixed';
    div.style.top = '80px';
    div.style.right = '20px';
    div.style.zIndex = '1001';
    div.style.minWidth = '300px';
    
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Make functions global
window.showPeopleCategory = showPeopleCategory;
window.showAddPersonModal = showAddPersonModal;
window.closeAddPersonModal = closeAddPersonModal;
window.deletePerson = deletePerson;
window.viewCycle = viewCycle;
window.deleteCycle = deleteCycle;
window.editThursday = editThursday;
window.saveWeekInfo = saveWeekInfo;
window.saveSongs = saveSongs;
window.saveBasicAssignment = saveBasicAssignment;
window.saveKgPart = saveKgPart;
window.addMMRow = addMMRow;
window.updateMMRow = updateMMRow;
window.deleteMMRow = deleteMMRow;
window.addPBKRow = addPBKRow;
window.updatePBKRow = updatePBKRow;
window.deletePBKRow = deletePBKRow;
window.printThursday = printThursday;
window.printAssignmentSlips = printAssignmentSlips;
window.backFromThursday = backFromThursday;
