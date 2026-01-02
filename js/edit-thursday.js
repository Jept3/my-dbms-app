// Edit Thursday Page JavaScript
let currentMeetingId = null;
let people = [];
let mmRowsData = [];
let pbkRowsData = [];

async function loadMeetingEditor() {
    const params = new URLSearchParams(window.location.search);
    currentMeetingId = parseInt(params.get('id'));
    
    if (!currentMeetingId) {
        history.back();
        return;
    }
    
    try {
        // Load people first
        const peopleResponse = await fetch(`${API_URL}/people`);
        people = await peopleResponse.json();
        
        // Load meeting details
        const response = await fetch(`${API_URL}/meetings/${currentMeetingId}`);
        if (!response.ok) throw new Error('Failed to load meeting');
        
        const data = await response.json();
        renderEditor(data);
        
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load meeting');
    }
}

function renderEditor(data) {
    const meeting = data.meeting;
    const assignments = data.assignments;
    mmRowsData = data.mm_rows || [];
    pbkRowsData = data.pbk_rows || [];
    
    const peopleOptions = people.map(p => `<option value="${p.id}">${h(p.full_name)}</option>`).join('');
    
    document.getElementById('meeting-editor').innerHTML = `
        <div class="page-header">
            <h2>Edit Thursday Meeting</h2>
            <p>${formatDate(meeting.meeting_date)}</p>
        </div>

        <div class="toolbar-actions">
            <button class="btn btn-secondary" onclick="printSchedule()">🖨️ Print Schedule</button>
            <button class="btn btn-secondary" onclick="printSlips()">📄 Print Assignment Slips</button>
        </div>

        <!-- Week Info -->
        <div class="card">
            <h3>Week Information</h3>
            <div class="form-row">
                <div class="form-group">
                    <label>Week Title</label>
                    <input type="text" id="week-title" value="${h(meeting.week_title || '')}" onblur="saveField('week_title', this.value)">
                </div>
                <div class="form-group">
                    <label>Week Reading</label>
                    <input type="text" id="week-reading" value="${h(meeting.week_reading || '')}" onblur="saveField('week_reading', this.value)">
                </div>
            </div>
        </div>

        <!-- Songs -->
        <div class="card">
            <h3>Songs</h3>
            <div class="form-row">
                <div class="form-group">
                    <label>Opening Song No.</label>
                    <input type="text" id="opening-song-no" value="${h(meeting.opening_song_no || '')}" onblur="saveField('opening_song_no', this.value)">
                </div>
                <div class="form-group">
                    <label>Opening Song Title</label>
                    <input type="text" id="opening-song-title" value="${h(meeting.opening_song_title || '')}" onblur="saveField('opening_song_title', this.value)">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Middle Song No.</label>
                    <input type="text" id="middle-song-no" value="${h(meeting.middle_song_no || '')}" onblur="saveField('middle_song_no', this.value)">
                </div>
                <div class="form-group">
                    <label>Middle Song Title</label>
                    <input type="text" id="middle-song-title" value="${h(meeting.middle_song_title || '')}" onblur="saveField('middle_song_title', this.value)">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Closing Song No.</label>
                    <input type="text" id="closing-song-no" value="${h(meeting.closing_song_no || '')}" onblur="saveField('closing_song_no', this.value)">
                </div>
                <div class="form-group">
                    <label>Closing Song Title</label>
                    <input type="text" id="closing-song-title" value="${h(meeting.closing_song_title || '')}" onblur="saveField('closing_song_title', this.value)">
                </div>
            </div>
        </div>

        <!-- Basic Assignments -->
        <div class="card">
            <h3>Basic Assignments</h3>
            <div class="assignment-row">
                <label>Chairman</label>
                <select onchange="saveAssignment('chairman', this.value)">
                    <option value="">Select...</option>
                    ${peopleOptions}
                </select>
            </div>
            <div class="assignment-row">
                <label>Opening Prayer</label>
                <select onchange="saveAssignment('opening_prayer', this.value)">
                    <option value="">Select...</option>
                    ${peopleOptions}
                </select>
            </div>
            <div class="assignment-row">
                <label>Closing Prayer</label>
                <select onchange="saveAssignment('closing_prayer', this.value)">
                    <option value="">Select...</option>
                    ${peopleOptions}
                </select>
            </div>
        </div>

        <!-- KAYAMANAN -->
        <div class="card section-kg">
            <h3>💎 KAYAMANAN MULA SA SALITA NG DIYOS</h3>
            <div class="assignment-row">
                <label>1. <input type="text" id="kg1-title" value="${h(assignments.kayamanan_title || '')}" style="width:300px" onblur="saveKayamananTitle()"></label>
                <select id="kg1-speaker" onchange="saveAssignment('kayamanan', this.value)">
                    <option value="">Select...</option>
                    ${peopleOptions}
                </select>
            </div>
            <div class="assignment-row">
                <label>2. Espirituwal na Hiyas</label>
                <select onchange="saveAssignment('hiyas', this.value)">
                    <option value="">Select...</option>
                    ${peopleOptions}
                </select>
            </div>
            <div class="assignment-row">
                <label>3. Pagbabasa ng Bibliya</label>
                <select onchange="saveAssignment('bible_reading', this.value)">
                    <option value="">Select...</option>
                    ${peopleOptions}
                </select>
            </div>
        </div>

        <!-- MAGING MAHUSAY -->
        <div class="card section-mm">
            <h3>📚 MAGING MAHUSAY SA MINISTERYO</h3>
            <div id="mm-rows-container"></div>
            <button class="btn btn-secondary" onclick="addMMRow()">➕ Add Ministry Part</button>
        </div>

        <!-- PAMUMUHAY -->
        <div class="card section-pbk">
            <h3>❤️ PAMUMUHAY BILANG KRISTIYANO</h3>
            <div id="pbk-rows-container"></div>
            <button class="btn btn-secondary" onclick="addPBKRow()">➕ Add PBK Part</button>
            
            <div style="margin-top:20px; padding-top:20px; border-top:1px solid #ddd;">
                <div class="assignment-row">
                    <label>CBS Reader (Paragraph)</label>
                    <select onchange="saveAssignment('cbs_reader_phar', this.value)">
                        <option value="">Select...</option>
                        ${peopleOptions}
                    </select>
                </div>
                <div class="assignment-row">
                    <label>CBS Reader (Bible)</label>
                    <select onchange="saveAssignment('cbs_reader_bible', this.value)">
                        <option value="">Select...</option>
                        ${peopleOptions}
                    </select>
                </div>
            </div>
        </div>
    `;
    
    // Set values
    setSelectValues(assignments);
    displayMMRows();
    displayPBKRows();
}

function setSelectValues(assignments) {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        const onchange = select.getAttribute('onchange');
        if (onchange && onchange.includes('chairman')) select.value = assignments.chairman || '';
        if (onchange && onchange.includes('opening_prayer')) select.value = assignments.opening_prayer || '';
        if (onchange && onchange.includes('closing_prayer')) select.value = assignments.closing_prayer || '';
        if (onchange && onchange.includes('kayamanan') && select.id === 'kg1-speaker') select.value = assignments.kayamanan || '';
        if (onchange && onchange.includes('hiyas')) select.value = assignments.hiyas || '';
        if (onchange && onchange.includes('bible_reading')) select.value = assignments.bible_reading || '';
        if (onchange && onchange.includes('cbs_reader_phar')) select.value = assignments.cbs_reader_phar || '';
        if (onchange && onchange.includes('cbs_reader_bible')) select.value = assignments.cbs_reader_bible || '';
    });
}

async function saveField(field, value) {
    try {
        await fetch(`${API_URL}/meetings/${currentMeetingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: value })
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function saveKayamananTitle() {
    const title = document.getElementById('kg1-title').value;
    await saveField('kayamanan_title', title);
}

async function saveAssignment(slotKey, personId) {
    try {
        await fetch(`${API_URL}/meetings/${currentMeetingId}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slot_key: slotKey, person_id: personId || null })
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayMMRows() {
    const container = document.getElementById('mm-rows-container');
    const peopleOptions = people.map(p => `<option value="${p.id}">${h(p.full_name)}</option>`).join('');
    
    container.innerHTML = mmRowsData.map((row, idx) => `
        <div class="mm-row">
            <div class="row-header">
                <strong>Part ${idx + 1}</strong>
                <button class="btn btn-danger" onclick="deleteMMRow(${row.id})">Delete</button>
            </div>
            <div class="row-inputs">
                <input type="text" placeholder="No." value="${h(row.part_no || '')}" onblur="updateMMRow(${row.id}, 'part_no', this.value)">
                <input type="text" placeholder="Title" value="${h(row.part_title || '')}" onblur="updateMMRow(${row.id}, 'part_title', this.value)">
            </div>
            <div class="row-selects">
                <select onchange="updateMMRow(${row.id}, 'publisher_id', this.value)">
                    <option value="">Publisher...</option>
                    ${peopleOptions}
                </select>
                <select onchange="updateMMRow(${row.id}, 'householder_id', this.value)">
                    <option value="">Householder...</option>
                    ${peopleOptions}
                </select>
            </div>
        </div>
    `).join('');
    
    // Set select values
    mmRowsData.forEach((row, idx) => {
        const selects = document.querySelectorAll('.mm-row')[idx]?.querySelectorAll('select');
        if (selects && selects[0]) selects[0].value = row.publisher_id || '';
        if (selects && selects[1]) selects[1].value = row.householder_id || '';
    });
}

function displayPBKRows() {
    const container = document.getElementById('pbk-rows-container');
    const peopleOptions = people.map(p => `<option value="${p.id}">${h(p.full_name)}</option>`).join('');
    
    container.innerHTML = pbkRowsData.map((row, idx) => `
        <div class="pbk-row">
            <div class="row-header">
                <strong>Part ${idx + 1}</strong>
                <button class="btn btn-danger" onclick="deletePBKRow(${row.id})">Delete</button>
            </div>
            <div class="row-inputs">
                <input type="text" placeholder="No." value="${h(row.part_no || '')}" onblur="updatePBKRow(${row.id}, 'part_no', this.value)">
                <input type="text" placeholder="Title" value="${h(row.part_title || '')}" onblur="updatePBKRow(${row.id}, 'part_title', this.value)">
            </div>
            <div class="row-selects single">
                <select onchange="updatePBKRow(${row.id}, 'speaker_id', this.value)">
                    <option value="">Speaker...</option>
                    ${peopleOptions}
                </select>
            </div>
        </div>
    `).join('');
    
    // Set select values
    pbkRowsData.forEach((row, idx) => {
        const select = document.querySelectorAll('.pbk-row')[idx]?.querySelector('select');
        if (select) select.value = row.speaker_id || '';
    });
}

async function addMMRow() {
    try {
        await fetch(`${API_URL}/meetings/${currentMeetingId}/mm-rows`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ part_no: '', part_title: '', publisher_id: null, householder_id: null })
        });
        location.reload();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updateMMRow(rowId, field, value) {
    const row = mmRowsData.find(r => r.id === rowId);
    if (!row) return;
    
    row[field] = value;
    
    try {
        await fetch(`${API_URL}/mm-rows/${rowId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(row)
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteMMRow(rowId) {
    try {
        await fetch(`${API_URL}/mm-rows/${rowId}`, { method: 'DELETE' });
        location.reload();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function addPBKRow() {
    try {
        await fetch(`${API_URL}/meetings/${currentMeetingId}/pbk-rows`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ part_no: '', part_title: '', speaker_id: null })
        });
        location.reload();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updatePBKRow(rowId, field, value) {
    const row = pbkRowsData.find(r => r.id === rowId);
    if (!row) return;
    
    row[field] = value;
    
    try {
        await fetch(`${API_URL}/pbk-rows/${rowId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(row)
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deletePBKRow(rowId) {
    try {
        await fetch(`${API_URL}/pbk-rows/${rowId}`, { method: 'DELETE' });
        location.reload();
    } catch (error) {
        console.error('Error:', error);
    }
}

function printSchedule() {
    window.open(`print.html?meeting_id=${currentMeetingId}`, '_blank');
}

function printSlips() {
    window.open(`assignment-slips.html?meeting_id=${currentMeetingId}`, '_blank');
}

// Make functions global
window.saveField = saveField;
window.saveKayamananTitle = saveKayamananTitle;
window.saveAssignment = saveAssignment;
window.addMMRow = addMMRow;
window.updateMMRow = updateMMRow;
window.deleteMMRow = deleteMMRow;
window.addPBKRow = addPBKRow;
window.updatePBKRow = updatePBKRow;
window.deletePBKRow = deletePBKRow;
window.printSchedule = printSchedule;
window.printSlips = printSlips;

// Initialize
loadMeetingEditor();
