<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JW Schedule Meetings</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-brand">
                <h1>📅 JW Schedule Meetings</h1>
            </div>
            <ul class="nav-menu">
                <li><a href="#" class="nav-link active" data-page="dashboard">Dashboard</a></li>
                <li><a href="#" class="nav-link" data-page="members">Members</a></li>
                <li><a href="#" class="nav-link" data-page="meetings">Meetings</a></li>
                <li><a href="#" class="nav-link" data-page="assignments">Assignments</a></li>
                <li><a href="#" class="nav-link" data-page="reports">Monthly Report</a></li>
            </ul>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="container">
        <!-- Page 1: Dashboard -->
        <div id="dashboard-page" class="page active">
            <div class="page-header">
                <h2>Dashboard</h2>
                <p>Overview of recent assignments (Past 3 weeks)</p>
            </div>

            <div class="dashboard-grid">
                <div class="stats-card">
                    <div class="stats-icon">👥</div>
                    <div class="stats-info">
                        <h3 id="totalMembers">0</h3>
                        <p>Total Members</p>
                    </div>
                </div>
                <div class="stats-card">
                    <div class="stats-icon">📋</div>
                    <div class="stats-info">
                        <h3 id="totalAssignments">0</h3>
                        <p>Total Assignments</p>
                    </div>
                </div>
                <div class="stats-card">
                    <div class="stats-icon">📅</div>
                    <div class="stats-info">
                        <h3 id="upcomingMeetings">0</h3>
                        <p>Upcoming Meetings</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3>Recent Assignments (Past 3 Weeks)</h3>
                <div id="recentAssignments" class="assignments-timeline">
                    <div class="loading">Loading recent assignments...</div>
                </div>
            </div>
        </div>

        <!-- Page 2: Members -->
        <div id="members-page" class="page">
            <div class="page-header">
                <h2>Members Management</h2>
                <p>Add and manage congregation members and their qualifications</p>
            </div>

            <div class="card">
                <h3>➕ Add New Member</h3>
                <form id="addMemberForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="memberName">Full Name *</label>
                            <input type="text" id="memberName" required placeholder="Enter full name">
                        </div>
                        <div class="form-group">
                            <label for="memberGender">Gender *</label>
                            <select id="memberGender" required>
                                <option value="">Select Gender</option>
                                <option value="Brother">Brother</option>
                                <option value="Sister">Sister</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Qualifications / Roles</label>
                        <div class="checkbox-grid">
                            <label class="checkbox-label">
                                <input type="checkbox" name="roles" value="Elder"> Elder
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="roles" value="MS"> Ministerial Servant (MS)
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="roles" value="Bible Reading"> Bible Reading
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="roles" value="Student Talk"> Student Talk
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="roles" value="Paragraph Reader"> Paragraph Reader
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="roles" value="Bible Text Reader"> Bible Text Reader
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="roles" value="Prayer Opening"> Prayer (Opening)
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="roles" value="Prayer Closing"> Prayer (Closing)
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="roles" value="Microphone Servant"> Microphone Servant
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="roles" value="Podium Servant"> Podium Servant
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="roles" value="Gate Keeper"> Gate Keeper
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="roles" value="Audio Servant"> Audio Servant
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="roles" value="Video Servant"> Video Servant
                            </label>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary">Add Member</button>
                </form>
            </div>

            <div class="card">
                <h3>👥 All Members</h3>
                <div id="membersList">
                    <div class="loading">Loading members...</div>
                </div>
            </div>
        </div>

        <!-- Page 3: Meetings -->
        <div id="meetings-page" class="page">
            <div class="page-header">
                <h2>Meeting Schedules</h2>
                <p>Create and manage meeting schedules based on jw.org</p>
            </div>

            <div class="card">
                <h3>➕ Create New Meeting Schedule</h3>
                <form id="addMeetingForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="meetingDate">Meeting Date *</label>
                            <input type="date" id="meetingDate" required>
                        </div>
                        <div class="form-group">
                            <label for="meetingType">Meeting Type *</label>
                            <select id="meetingType" required>
                                <option value="">Select Type</option>
                                <option value="Midweek">Midweek Meeting</option>
                                <option value="Weekend">Weekend Meeting</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="meetingTheme">Meeting Theme / Title</label>
                        <input type="text" id="meetingTheme" placeholder="e.g., 'Be Peaceable With Everyone'">
                    </div>

                    <div class="form-group">
                        <label for="meetingNotes">Notes / Special Instructions</label>
                        <textarea id="meetingNotes" rows="3" placeholder="Any special notes for this meeting"></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary">Create Meeting</button>
                </form>
            </div>

            <div class="card">
                <h3>📅 Scheduled Meetings</h3>
                <div id="meetingsList">
                    <div class="loading">Loading meetings...</div>
                </div>
            </div>
        </div>

        <!-- Page 4: Assignments -->
        <div id="assignments-page" class="page">
            <div class="page-header">
                <h2>Assignment Management</h2>
                <p>Assign members to specific meeting parts</p>
            </div>

            <div class="card">
                <h3>➕ Create Assignment</h3>
                <form id="addAssignmentForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="assignmentMeeting">Select Meeting *</label>
                            <select id="assignmentMeeting" required>
                                <option value="">Choose a meeting</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="assignmentMember">Assign Member *</label>
                            <select id="assignmentMember" required>
                                <option value="">Choose a member</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="assignmentPart">Meeting Part *</label>
                        <select id="assignmentPart" required>
                            <option value="">Select Part</option>
                            <option value="Chairman">Chairman</option>
                            <option value="Prayer Opening">Prayer (Opening)</option>
                            <option value="Prayer Closing">Prayer (Closing)</option>
                            <option value="Bible Reading">Bible Reading</option>
                            <option value="Student Talk 1">Student Talk #1</option>
                            <option value="Student Talk 2">Student Talk #2</option>
                            <option value="Student Talk 3">Student Talk #3</option>
                            <option value="Initial Call">Initial Call</option>
                            <option value="Return Visit">Return Visit</option>
                            <option value="Bible Study">Bible Study</option>
                            <option value="Talk">Talk</option>
                            <option value="Paragraph Reader">Paragraph Reader</option>
                            <option value="Bible Text Reader">Bible Text Reader</option>
                            <option value="Microphone">Microphone Servant</option>
                            <option value="Podium">Podium Servant</option>
                            <option value="Gate">Gate Keeper</option>
                            <option value="Audio">Audio Servant</option>
                            <option value="Video">Video Servant</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="assignmentDetails">Assignment Details</label>
                        <textarea id="assignmentDetails" rows="2" placeholder="Additional details (optional)"></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary">Create Assignment</button>
                </form>
            </div>

            <div class="card">
                <h3>📋 All Assignments</h3>
                <div class="filter-group">
                    <select id="filterMeeting">
                        <option value="">All Meetings</option>
                    </select>
                    <select id="filterMember">
                        <option value="">All Members</option>
                    </select>
                </div>
                <div id="assignmentsList">
                    <div class="loading">Loading assignments...</div>
                </div>
            </div>
        </div>

        <!-- Page 5: Monthly Report -->
        <div id="reports-page" class="page">
            <div class="page-header">
                <h2>Monthly Report</h2>
                <p>Overview and statistics (Class card to be developed)</p>
            </div>

            <div class="card">
                <h3>Select Month</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="reportMonth">Month</label>
                        <input type="month" id="reportMonth">
                    </div>
                    <button onclick="generateReport()" class="btn btn-primary">Generate Report</button>
                </div>
            </div>

            <div id="reportContent">
                <div class="card">
                    <h3>📊 Monthly Statistics</h3>
                    <div class="report-grid" id="monthlyStats">
                        <p class="text-muted">Select a month and click "Generate Report"</p>
                    </div>
                </div>

                <div class="card">
                    <h3>📋 Member Participation</h3>
                    <div id="memberParticipation">
                        <p class="text-muted">Report data will appear here</p>
                    </div>
                </div>

                <div class="card">
                    <h3>📝 Class Card (To Be Developed)</h3>
                    <p class="text-muted">Class card functionality will be added in future updates</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Member Modal -->
    <div id="editMemberModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeEditMemberModal()">&times;</span>
            <h2>✏️ Edit Member</h2>
            <form id="editMemberForm">
                <input type="hidden" id="editMemberId">
                <div class="form-row">
                    <div class="form-group">
                        <label for="editMemberName">Full Name *</label>
                        <input type="text" id="editMemberName" required>
                    </div>
                    <div class="form-group">
                        <label for="editMemberGender">Gender *</label>
                        <select id="editMemberGender" required>
                            <option value="Brother">Brother</option>
                            <option value="Sister">Sister</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Qualifications / Roles</label>
                    <div class="checkbox-grid" id="editRolesContainer">
                        <!-- Checkboxes will be populated dynamically -->
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Update Member</button>
            </form>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
