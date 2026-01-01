# JW Schedule Meetings - Complete System

A comprehensive meeting scheduling system for Jehovah's Witnesses congregations, matching the functionality of the PHP system.

## 🎯 Features

### 📁 People Management
- **6 Categories**:
  - Congregation Elders
  - Ministerial Servants
  - Publishers
  - Student Brothers
  - Student Sisters
  - Attendant Brothers
- Add, view, and delete people
- Category-based organization

### 📅 3-Month Cycles
- Create schedule cycles with start and end dates
- **Automatically generates all Thursday meetings** within the date range
- View all Thursdays in a cycle
- Delete cycles (cascades to all meetings and assignments)

### ✏️ Full Meeting Editor
Each Thursday meeting includes:

**Basic Info:**
- Week title (e.g., "Be Peaceable With Everyone")
- Week reading (e.g., "SALMO 1-6")
- 3 Songs (opening, middle, closing) with numbers and titles

**Basic Assignments:**
- Chairman
- Opening Prayer
- Closing Prayer

**💎 KAYAMANAN Section** (Treasures from God's Word):
1. Custom part (with title and speaker)
2. Espirituwal na Hiyas (fixed title, assign speaker)
3. Pagbabasa ng Bibliya (Bible Reading)

**📚 MAGING MAHUSAY Section** (Be Better Ministers):
- Dynamic rows (add/edit/delete)
- Each row has:
  - Part number (e.g., "4")
  - Part title (e.g., "Pagdalaw-Muli")
  - Publisher assignment
  - Householder assignment

**❤️ PAMUMUHAY Section** (Living as Christians):
- Dynamic rows (add/edit/delete)
- Each row has:
  - Part number
  - Part title
  - Speaker assignment
- CBS Readers (Paragraph and Bible)

### 🖨️ Print Features
- **Print Schedule**: Full meeting schedule in A4 format
- **Print Assignment Slips**: 6 slips per page (2 columns × 3 rows) including:
  - Bible Reading slip
  - MM slips (2 copies per row for Publisher and Householder)

### 📊 Assignments Overview
- View all cycles and their assignments
- Navigate to any Thursday to assign parts

## 🗄️ Database Structure

### Tables Created:
1. **persons** - All congregation members with categories
2. **schedule_cycles** - 3-month cycles
3. **schedule_meetings** - Individual Thursday meetings
4. **slot_definitions** - Assignment slot types (Chairman, Prayers, etc.)
5. **meeting_slot_assignments** - Basic assignments
6. **meeting_ministry_rows** - MM section parts
7. **meeting_pbk_rows** - PBK section parts

## 🚀 Setup Instructions

### Prerequisites
- GitHub account
- Cloudflare account
- Turso account with database

### Step 1: Upload to GitHub

1. Create repository: `jw-schedule-meetings`
2. Upload ALL files:
   - index.html
   - styles.css
   - script.js
   - wrangler.toml
   - functions/api/_middleware.js (IMPORTANT!)

### Step 2: Deploy to Cloudflare Pages

1. Go to Cloudflare Dashboard
2. Workers & Pages > Create application > Pages
3. Connect to Git > Select your repository
4. Build settings:
   - Framework: None
   - Build command: (leave empty)
   - Build output directory: /
5. Save and Deploy

### Step 3: Add Environment Variables

In Cloudflare project settings:
1. Settings > Environment variables
2. Add for **Production**:
   - `TURSO_DATABASE_URL`: `libsql://rollinghills-jepnte.aws-ap-northeast-1.turso.io`
   - `TURSO_AUTH_TOKEN`: (your Turso token)
3. Save
4. Redeploy

### Step 4: Start Using

1. **Add People**: Go to People page, click categories, add members
2. **Create Cycle**: Go to Midweek, create 3-month cycle (auto-generates Thursdays)
3. **Assign Parts**: Click on any Thursday to open editor
4. **Print**: Use Print Schedule or Print Assignment Slips buttons

## 📖 Usage Guide

### Creating a 3-Month Cycle
1. Title: e.g., "Jan-Mar 2026"
2. Start Date: **Monday** of first week
3. End Date: **Sunday** of last week
4. System automatically finds all Thursdays and creates meetings

### Editing a Thursday Meeting
1. Fill in week info and songs
2. Assign basic parts (Chairman, Prayers)
3. Fill in Kayamanan section
4. Add MM rows (click ➕ Add Ministry Part)
5. Add PBK rows (click ➕ Add PBK Part)
6. Assign CBS readers
7. Everything auto-saves on change!

### Print Features
- **Print Schedule**: Opens printable view with all assignments
- **Print Assignment Slips**: Generates 6 slips per page
  - Bible Reading gets 1 slip
  - Each MM row gets 2 slips (duplicate for Publisher and Householder)
  - A4/Letter compatible

## 🎨 Design Features

- Blue gradient navigation matching congregation theme
- Color-coded sections:
  - Kayamanan: Blue (#0b4a77)
  - Maging Mahusay: Gold (#8a5b00)
  - Pamumuhay: Red (#7a121b)
- Responsive design (works on mobile)
- Auto-save on all changes
- Clean, professional interface

## 🔧 Technical Stack

- **Frontend**: Vanilla JavaScript (no frameworks needed)
- **Backend**: Cloudflare Functions (serverless)
- **Database**: Turso (SQLite)
- **Hosting**: Cloudflare Pages (free tier)

## 🐛 Troubleshooting

**People not loading:**
- Check browser console (F12)
- Verify environment variables are set
- Check Turso token is valid

**Meetings not auto-generating:**
- Make sure start date is a Monday
- Make sure end date is after start date
- Check Cloudflare logs

**Assignments not saving:**
- Check network tab in browser
- Verify API endpoints are working
- Check database connection

**Print not working:**
- Make sure you have data entered
- Check that meetings have assignments
- Try opening in new tab

## 📝 Future Enhancements

- [ ] Duplicate cycle feature
- [ ] Export to Excel/PDF
- [ ] Email assignment slips
- [ ] Assignment history tracking
- [ ] Conflict detection (same person multiple times)
- [ ] Mobile app version
- [ ] Weekend meeting support

## 🙏 Credits

Built for Rolling Hills Congregation with love and care for efficient meeting scheduling.

---

**System matches the functionality of the original PHP system**
