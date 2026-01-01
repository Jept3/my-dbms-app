# JW Schedule Meetings

A comprehensive meeting scheduling and assignment management system for Jehovah's Witnesses congregations.

## Features

### 📊 Dashboard
- View statistics (total members, assignments, upcoming meetings)
- See recent assignments from the past 3 weeks
- Quick overview of congregation activity

### 👥 Members Management
- Add congregation members with full details
- Specify gender (Brother/Sister)
- Assign multiple qualifications/roles:
  - Elder
  - Ministerial Servant (MS)
  - Bible Reading
  - Student Talk
  - Paragraph Reader
  - Bible Text Reader
  - Prayer (Opening/Closing)
  - Microphone Servant
  - Podium Servant
  - Gate Keeper
  - Audio Servant
  - Video Servant
- Edit and delete members

### 📅 Meetings
- Create meeting schedules based on jw.org
- Schedule Midweek and Weekend meetings
- Add meeting themes and notes
- Automatic date sorting

### 📋 Assignments
- Assign members to specific meeting parts
- Track all assignments with dates
- Filter by meeting or member
- Comprehensive part options:
  - Chairman, Prayers, Bible Reading
  - Student Talks, Initial Calls, Return Visits
  - Bible Studies, Talks
  - Technical assignments (Audio, Video, Microphones, etc.)

### 📊 Monthly Reports
- Generate reports for specific months
- View meeting and assignment statistics
- See member participation counts
- Class card functionality (to be developed)

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Cloudflare Workers (Serverless Functions)
- **Database**: Turso (LibSQL/SQLite)
- **Hosting**: Cloudflare Pages (Free)

## Setup Instructions

### Prerequisites
- GitHub account
- Cloudflare account
- Turso account with database created

### Step 1: Upload to GitHub

1. Go to https://github.com and sign in
2. Create a new repository named `jw-schedule-meetings`
3. Make it Public
4. Upload all project files:
   - index.html
   - styles.css
   - script.js
   - wrangler.toml
   - functions/api/_middleware.js

### Step 2: Deploy to Cloudflare Pages

1. Go to https://dash.cloudflare.com
2. Navigate to "Workers & Pages"
3. Click "Create application" > "Pages" tab
4. Connect to Git and select your repository
5. Build settings:
   - Framework preset: None
   - Build command: (leave empty)
   - Build output directory: /
6. Click "Save and Deploy"

### Step 3: Add Environment Variables

1. In your Cloudflare project, go to "Settings" > "Environment variables"
2. Add these two variables for **Production**:
   - `TURSO_DATABASE_URL`: Your Turso database URL (e.g., `libsql://your-db.turso.io`)
   - `TURSO_AUTH_TOKEN`: Your Turso auth token
3. Click "Save"
4. Redeploy your application

### Step 4: Access Your App

Your app will be live at: `https://jw-schedule-meetings.pages.dev`

## Usage Guide

### Adding Members
1. Go to the "Members" page
2. Fill in the member's name and gender
3. Select all applicable qualifications/roles
4. Click "Add Member"

### Creating Meetings
1. Go to the "Meetings" page
2. Select the meeting date
3. Choose meeting type (Midweek/Weekend)
4. Optionally add theme and notes
5. Click "Create Meeting"

### Making Assignments
1. Go to the "Assignments" page
2. Select a meeting from the dropdown
3. Select a member
4. Choose the meeting part
5. Add any additional details
6. Click "Create Assignment"

### Viewing Dashboard
- The dashboard automatically updates with current statistics
- Recent assignments from the past 3 weeks are displayed
- Grouped by week for easy reference

### Generating Reports
1. Go to the "Monthly Report" page
2. Select the desired month
3. Click "Generate Report"
4. View statistics and member participation

## Database Structure

### Members Table
- id (Primary Key)
- name (Text)
- gender (Text: Brother/Sister)
- roles (JSON array of qualifications)
- created_at (Timestamp)

### Meetings Table
- id (Primary Key)
- date (Date)
- type (Text: Midweek/Weekend)
- theme (Text, optional)
- notes (Text, optional)
- created_at (Timestamp)

### Assignments Table
- id (Primary Key)
- meeting_id (Foreign Key)
- member_id (Foreign Key)
- part (Text)
- details (Text, optional)
- created_at (Timestamp)

## Future Enhancements

- [ ] Class card development
- [ ] PDF export for assignments
- [ ] Email notifications
- [ ] Calendar view
- [ ] Automatic assignment suggestions
- [ ] Assignment history tracking
- [ ] Multi-language support
- [ ] Mobile app version

## Troubleshooting

**Issue: Data not loading**
- Check that environment variables are set correctly in Cloudflare
- Verify Turso database URL and token
- Check browser console for errors

**Issue: Cannot create assignments**
- Make sure you have created at least one member and one meeting first
- Check that all required fields are filled

**Issue: Deployment failed**
- Ensure all files are uploaded to GitHub
- Check Cloudflare deployment logs
- Verify functions folder structure is correct

## Support

For issues or questions:
1. Check the browser console (F12) for errors
2. Review Cloudflare deployment logs
3. Verify database connectivity

## License

This project is created for use by Jehovah's Witnesses congregations. Feel free to modify and adapt for your congregation's needs.

---

**Made with ❤️ for efficient congregation scheduling**
