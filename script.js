// JW Schedule Meetings - Frontend JavaScript
const API_URL = '/api';

// State management
let members = [];
let meetings = [];
let assignments = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    loadAllData();
    setupEventListeners();
    setDefaultReportMonth();
});

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = link.dataset.page;
            showPage(pageName);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function showPage(pageName) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// Event Listeners
function setupEventListeners() {
    // Member form
    document.getElementById('addMemberForm').addEventListener('submit', handleAddMember);
    document.getElementById('editMemberForm').addEventListener('submit', handleEditMember);
    
    // Meeting form
    document.getElementById('addMeetingForm').addEventListener('submit', handleAddMeeting);
    
    // Assignment form
    document.getElementById('addAssignmentForm').addEventListener('submit', handleAddAssignment);
    
    // Filters
    document.getElementById('filterMeeting')?.addEventListener('change', filterAssignments);
    document.getElementById('filterMember')?.addEventListener('change', filterAssignments);
}

// Load all data
async function loadAllData() {
    await Promise.all([
        loadMembers(),
        loadMeetings(),
        loadAssignments()
    ]);
    
    updateDashboard();
    populateDropdowns();
}

// ============= MEMBERS =============

async function loadMembers() {
    try {
        const response = await fetch(`${API_URL}/members`);
        if (!response.ok) throw new Error('Failed to load members');
        
        members = await response.json();
        displayMembers();
    } catch (error) {
        console.error('Error loading members:', error);
        showError('members', 'Failed to load members');
    }
}

function displayMembers() {
    const container = document.getElementById('membersList');
    
    if (members.length === 0) {
        container.innerHTML = '<div class="empty-state">No members added yet. Add your first member above!</div>';
        return;
    }
    
    container.innerHTML = members.map(member => {
        const roles = member.roles ? JSON.parse(member.roles) : [];
        return `
            <div class="member-item">
                <div class="member-header">
                    <div>
                        <div class="member-name">${escapeHtml(member.name)}</div>
                        <span class="member-gender">${escapeHtml(member.gender)}</span>
                    </div>
                </div>
                <div class="member-roles">
                    ${roles.map(role => `<span class="role-badge">${escapeHtml(role)}</span>`).join('')}
                </div>
                <div class="member-actions">
                    <button class="btn btn-edit" onclick="openEditMemberModal(${member.id})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteMember(${member.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

async function handleAddMember(e) {
    e.preventDefault();
    
    const name = document.getElementById('memberName').value;
    const gender = document.getElementById('memberGender').value;
    const roleCheckboxes = document.querySelectorAll('input[name="roles"]:checked');
    const roles = Array.from(roleCheckboxes).map(cb => cb.value);
    
    try {
        const response = await fetch(`${API_URL}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, gender, roles: JSON.stringify(roles) })
        });
        
        if (!response.ok) throw new Error('Failed to add member');
        
        showSuccess('Member added successfully!');
        document.getElementById('addMemberForm').reset();
        await loadAllData();
    } catch (error) {
        console.error('Error adding member:', error);
        showError('form', 'Failed to add member');
    }
}

function openEditMemberModal(id) {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    document.getElementById('editMemberId').value = member.id;
    document.getElementById('editMemberName').value = member.name;
    document.getElementById('editMemberGender').value = member.gender;
    
    // Populate roles checkboxes
    const roles = member.roles ? JSON.parse(member.roles) : [];
    const rolesContainer = document.getElementById('editRolesContainer');
    const allRoles = [
        'Elder', 'MS', 'Bible Reading', 'Student Talk', 'Paragraph Reader',
        'Bible Text Reader', 'Prayer Opening', 'Prayer Closing', 'Microphone Servant',
        'Podium Servant', 'Gate Keeper', 'Audio Servant', 'Video Servant'
    ];
    
    rolesContainer.innerHTML = allRoles.map(role => `
        <label class="checkbox-label">
            <input type="checkbox" name="editRoles" value="${role}" ${roles.includes(role) ? 'checked' : ''}>
            ${role}
        </label>
    `).join('');
    
    document.getElementById('editMemberModal').style.display = 'block';
}

function closeEditMemberModal() {
    document.getElementById('editMemberModal').style.display = 'none';
}

async function handleEditMember(e) {
    e.preventDefault();
    
    const id = document.getElementById('editMemberId').value;
    const name = document.getElementById('editMemberName').value;
    const gender = document.getElementById('editMemberGender').value;
    const roleCheckboxes = document.querySelectorAll('input[name="editRoles"]:checked');
    const roles = Array.from(roleCheckboxes).map(cb => cb.value);
    
    try {
        const response = await fetch(`${API_URL}/members/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, gender, roles: JSON.stringify(roles) })
        });
        
        if (!response.ok) throw new Error('Failed to update member');
        
        closeEditMemberModal();
        showSuccess('Member updated successfully!');
        await loadAllData();
    } catch (error) {
        console.error('Error updating member:', error);
        showError('modal', 'Failed to update member');
    }
}

async function deleteMember(id) {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    try {
        const response = await fetch(`${API_URL}/members/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete member');
        
        showSuccess('Member deleted successfully!');
        await loadAllData();
    } catch (error) {
        console.error('Error deleting member:', error);
        showError('list', 'Failed to delete member');
    }
}

// ============= MEETINGS =============

async function loadMeetings() {
    try {
        const response = await fetch(`${API_URL}/meetings`);
        if (!response.ok) throw new Error('Failed to load meetings');
        
        meetings = await response.json();
        displayMeetings();
    } catch (error) {
        console.error('Error loading meetings:', error);
        showError('meetings', 'Failed to load meetings');
    }
}

function displayMeetings() {
    const container = document.getElementById('meetingsList');
    
    if (meetings.length === 0) {
        container.innerHTML = '<div class="empty-state">No meetings scheduled yet. Create your first meeting above!</div>';
        return;
    }
    
    // Sort meetings by date (newest first)
    const sortedMeetings = [...meetings].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedMeetings.map(meeting => `
        <div class="meeting-item">
            <div class="meeting-date">${formatDate(meeting.date)}</div>
            <span class="meeting-type">${escapeHtml(meeting.type)}</span>
            ${meeting.theme ? `<div style="margin: 10px 0; font-weight: 600;">${escapeHtml(meeting.theme)}</div>` : ''}
            ${meeting.notes ? `<div style="color: #666; font-size: 0.95rem;">${escapeHtml(meeting.notes)}</div>` : ''}
            <div class="member-actions" style="margin-top: 15px;">
                <button class="btn btn-delete" onclick="deleteMeeting(${meeting.id})">Delete Meeting</button>
            </div>
        </div>
    `).join('');
}

async function handleAddMeeting(e) {
    e.preventDefault();
    
    const date = document.getElementById('meetingDate').value;
    const type = document.getElementById('meetingType').value;
    const theme = document.getElementById('meetingTheme').value;
    const notes = document.getElementById('meetingNotes').value;
    
    try {
        const response = await fetch(`${API_URL}/meetings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, type, theme, notes })
        });
        
        if (!response.ok) throw new Error('Failed to create meeting');
        
        showSuccess('Meeting created successfully!');
        document.getElementById('addMeetingForm').reset();
        await loadAllData();
    } catch (error) {
        console.error('Error creating meeting:', error);
        showError('form', 'Failed to create meeting');
    }
}

async function deleteMeeting(id) {
    if (!confirm('Are you sure you want to delete this meeting? All assignments for this meeting will also be deleted.')) return;
    
    try {
        const response = await fetch(`${API_URL}/meetings/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete meeting');
        
        showSuccess('Meeting deleted successfully!');
        await loadAllData();
    } catch (error) {
        console.error('Error deleting meeting:', error);
        showError('list', 'Failed to delete meeting');
    }
}

// ============= ASSIGNMENTS =============

async function loadAssignments() {
    try {
        const response = await fetch(`${API_URL}/assignments`);
        if (!response.ok) throw new Error('Failed to load assignments');
        
        assignments = await response.json();
        displayAssignments();
    } catch (error) {
        console.error('Error loading assignments:', error);
        showError('assignments', 'Failed to load assignments');
    }
}

function displayAssignments() {
    const container = document.getElementById('assignmentsList');
    
    if (assignments.length === 0) {
        container.innerHTML = '<div class="empty-state">No assignments created yet. Create your first assignment above!</div>';
        return;
    }
    
    container.innerHTML = assignments.map(assignment => {
        const meeting = meetings.find(m => m.id === assignment.meeting_id);
        const member = members.find(m => m.id === assignment.member_id);
        
        return `
            <div class="assignment-item">
                <div class="assignment-header">
                    <div>
                        <div class="assignment-part">${escapeHtml(assignment.part)}</div>
                        <div class="assignment-member">👤 ${member ? escapeHtml(member.name) : 'Unknown Member'}</div>
                        <div class="assignment-date">📅 ${meeting ? formatDate(meeting.date) + ' - ' + meeting.type : 'Unknown Meeting'}</div>
                    </div>
                </div>
                ${assignment.details ? `<div style="margin-top: 10px; color: #666;">${escapeHtml(assignment.details)}</div>` : ''}
                <div class="member-actions" style="margin-top: 15px;">
                    <button class="btn btn-delete" onclick="deleteAssignment(${assignment.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

async function handleAddAssignment(e) {
    e.preventDefault();
    
    const meeting_id = document.getElementById('assignmentMeeting').value;
    const member_id = document.getElementById('assignmentMember').value;
    const part = document.getElementById('assignmentPart').value;
    const details = document.getElementById('assignmentDetails').value;
    
    try {
        const response = await fetch(`${API_URL}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meeting_id, member_id, part, details })
        });
        
        if (!response.ok) throw new Error('Failed to create assignment');
        
        showSuccess('Assignment created successfully!');
        document.getElementById('addAssignmentForm').reset();
        await loadAllData();
    } catch (error) {
        console.error('Error creating assignment:', error);
        showError('form', 'Failed to create assignment');
    }
}

async function deleteAssignment(id) {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
        const response = await fetch(`${API_URL}/assignments/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete assignment');
        
        showSuccess('Assignment deleted successfully!');
        await loadAllData();
    } catch (error) {
        console.error('Error deleting assignment:', error);
        showError('list', 'Failed to delete assignment');
    }
}

function filterAssignments() {
    const meetingFilter = document.getElementById('filterMeeting').value;
    const memberFilter = document.getElementById('filterMember').value;
    
    let filtered = [...assignments];
    
    if (meetingFilter) {
        filtered = filtered.filter(a => a.meeting_id == meetingFilter);
    }
    
    if (memberFilter) {
        filtered = filtered.filter(a => a.member_id == memberFilter);
    }
    
    // Display filtered assignments (similar to displayAssignments but with filtered data)
    const container = document.getElementById('assignmentsList');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No assignments match the selected filters.</div>';
        return;
    }
    
    container.innerHTML = filtered.map(assignment => {
        const meeting = meetings.find(m => m.id === assignment.meeting_id);
        const member = members.find(m => m.id === assignment.member_id);
        
        return `
            <div class="assignment-item">
                <div class="assignment-header">
                    <div>
                        <div class="assignment-part">${escapeHtml(assignment.part)}</div>
                        <div class="assignment-member">👤 ${member ? escapeHtml(member.name) : 'Unknown Member'}</div>
                        <div class="assignment-date">📅 ${meeting ? formatDate(meeting.date) + ' - ' + meeting.type : 'Unknown Meeting'}</div>
                    </div>
                </div>
                ${assignment.details ? `<div style="margin-top: 10px; color: #666;">${escapeHtml(assignment.details)}</div>` : ''}
                <div class="member-actions" style="margin-top: 15px;">
                    <button class="btn btn-delete" onclick="deleteAssignment(${assignment.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// ============= DASHBOARD =============

function updateDashboard() {
    // Update stats
    document.getElementById('totalMembers').textContent = members.length;
    document.getElementById('totalAssignments').textContent = assignments.length;
    
    // Count upcoming meetings (future dates)
    const today = new Date();
    const upcomingCount = meetings.filter(m => new Date(m.date) >= today).length;
    document.getElementById('upcomingMeetings').textContent = upcomingCount;
    
    // Display recent assignments (past 3 weeks)
    displayRecentAssignments();
}

function displayRecentAssignments() {
    const container = document.getElementById('recentAssignments');
    
    // Calculate date 3 weeks ago
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    
    // Filter assignments from past 3 weeks
    const recentAssignments = assignments.filter(assignment => {
        const meeting = meetings.find(m => m.id === assignment.meeting_id);
        if (!meeting) return false;
        const meetingDate = new Date(meeting.date);
        return meetingDate >= threeWeeksAgo && meetingDate <= new Date();
    });
    
    if (recentAssignments.length === 0) {
        container.innerHTML = '<div class="empty-state">No assignments in the past 3 weeks.</div>';
        return;
    }
    
    // Group by week
    const weeks = {};
    recentAssignments.forEach(assignment => {
        const meeting = meetings.find(m => m.id === assignment.meeting_id);
        if (!meeting) return;
        
        const weekKey = getWeekKey(new Date(meeting.date));
        if (!weeks[weekKey]) {
            weeks[weekKey] = [];
        }
        weeks[weekKey].push({ assignment, meeting });
    });
    
    container.innerHTML = Object.keys(weeks).sort().reverse().map(weekKey => {
        const weekAssignments = weeks[weekKey];
        return `
            <div class="timeline-week">
                <h4>${weekKey}</h4>
                ${weekAssignments.map(({ assignment, meeting }) => {
                    const member = members.find(m => m.id === assignment.member_id);
                    return `
                        <div class="assignment-item">
                            <div class="assignment-part">${escapeHtml(assignment.part)}</div>
                            <div class="assignment-member">👤 ${member ? escapeHtml(member.name) : 'Unknown'}</div>
                            <div class="assignment-date">📅 ${formatDate(meeting.date)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }).join('');
}

function getWeekKey(date) {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    return `Week of ${formatDate(weekStart.toISOString().split('T')[0])}`;
}

// ============= REPORTS =============

function setDefaultReportMonth() {
    const today = new Date();
    const monthString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('reportMonth').value = monthString;
}

function generateReport() {
    const monthInput = document.getElementById('reportMonth').value;
    if (!monthInput) {
        alert('Please select a month');
        return;
    }
    
    const [year, month] = monthInput.split('-');
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Filter meetings and assignments for selected month
    const monthMeetings = meetings.filter(m => {
        const meetingDate = new Date(m.date);
        return meetingDate >= startDate && meetingDate <= endDate;
    });
    
    const monthAssignments = assignments.filter(a => {
        const meeting = meetings.find(m => m.id === a.meeting_id);
        if (!meeting) return false;
        const meetingDate = new Date(meeting.date);
        return meetingDate >= startDate && meetingDate <= endDate;
    });
    
    // Display statistics
    const statsContainer = document.getElementById('monthlyStats');
    statsContainer.innerHTML = `
        <div class="report-item">
            <h4>${monthMeetings.length}</h4>
            <p>Meetings</p>
        </div>
        <div class="report-item">
            <h4>${monthAssignments.length}</h4>
            <p>Assignments</p>
        </div>
        <div class="report-item">
            <h4>${new Set(monthAssignments.map(a => a.member_id)).size}</h4>
            <p>Members Participated</p>
        </div>
    `;
    
    // Display member participation
    const participationContainer = document.getElementById('memberParticipation');
    const memberCounts = {};
    
    monthAssignments.forEach(assignment => {
        const memberId = assignment.member_id;
        memberCounts[memberId] = (memberCounts[memberId] || 0) + 1;
    });
    
    participationContainer.innerHTML = Object.keys(memberCounts).map(memberId => {
        const member = members.find(m => m.id == memberId);
        const count = memberCounts[memberId];
        return `
            <div class="assignment-item">
                <div class="assignment-member">${member ? escapeHtml(member.name) : 'Unknown'}</div>
                <div style="font-size: 1.2rem; font-weight: 600; color: #2c5aa0;">${count} assignment${count > 1 ? 's' : ''}</div>
            </div>
        `;
    }).join('');
}

// ============= DROPDOWNS =============

function populateDropdowns() {
    // Populate meeting dropdowns
    const meetingSelects = [
        document.getElementById('assignmentMeeting'),
        document.getElementById('filterMeeting')
    ];
    
    meetingSelects.forEach(select => {
        if (!select) return;
        const isFilter = select.id === 'filterMeeting';
        const currentValue = select.value;
        
        select.innerHTML = isFilter ? '<option value="">All Meetings</option>' : '<option value="">Choose a meeting</option>';
        
        meetings.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(meeting => {
            const option = document.createElement('option');
            option.value = meeting.id;
            option.textContent = `${formatDate(meeting.date)} - ${meeting.type}`;
            select.appendChild(option);
        });
        
        if (currentValue) select.value = currentValue;
    });
    
    // Populate member dropdowns
    const memberSelects = [
        document.getElementById('assignmentMember'),
        document.getElementById('filterMember')
    ];
    
    memberSelects.forEach(select => {
        if (!select) return;
        const isFilter = select.id === 'filterMember';
        const currentValue = select.value;
        
        select.innerHTML = isFilter ? '<option value="">All Members</option>' : '<option value="">Choose a member</option>';
        
        members.sort((a, b) => a.name.localeCompare(b.name)).forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            select.appendChild(option);
        });
        
        if (currentValue) select.value = currentValue;
    });
}

// ============= UTILITIES =============

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function showSuccess(message) {
    const div = document.createElement('div');
    div.className = 'success-message';
    div.textContent = message;
    div.style.position = 'fixed';
    div.style.top = '80px';
    div.style.right = '20px';
    div.style.zIndex = '1001';
    div.style.minWidth = '300px';
    
    document.body.appendChild(div);
    
    setTimeout(() => div.remove(), 3000);
}

function showError(context, message) {
    console.error(`${context}: ${message}`);
}
