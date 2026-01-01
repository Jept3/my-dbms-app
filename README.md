# My DBMS - Task Manager

A simple Database Management System (DBMS) built with Cloudflare Pages and Turso Database.

## Features
- ✅ View all tasks
- ✅ Add new tasks
- ✅ Edit existing tasks
- ✅ Delete tasks
- ✅ Different status tracking (Pending, In Progress, Completed)

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Cloudflare Workers (Serverless Functions)
- **Database**: Turso (LibSQL/SQLite)
- **Hosting**: Cloudflare Pages (Free)

## Setup Instructions

### Step 1: Upload to GitHub

1. Go to https://github.com and sign in
2. Click the "+" icon in top right > "New repository"
3. Name it: `my-dbms-app`
4. Make it Public
5. Click "Create repository"
6. Follow the instructions to upload your files (you can use GitHub's web interface to upload files directly)

### Step 2: Connect to Cloudflare Pages

1. Go to https://dash.cloudflare.com
2. Click "Workers & Pages" in the left sidebar
3. Click "Create application" > "Pages" tab
4. Click "Connect to Git"
5. Authorize GitHub and select your `my-dbms-app` repository
6. Click "Begin setup"
7. Build settings:
   - Framework preset: None
   - Build command: (leave empty)
   - Build output directory: /
8. Click "Save and Deploy"

### Step 3: Add Environment Variables

1. After deployment, go to your project settings
2. Click "Settings" > "Environment variables"
3. Add these two variables:
   - Variable name: `TURSO_DATABASE_URL`
     Value: Your Turso database URL (e.g., `libsql://rollinghills-jepnte.aws-ap-northeast-1.turso.io`)
   - Variable name: `TURSO_AUTH_TOKEN`
     Value: Your Turso auth token
4. Click "Save"
5. Go back to "Deployments" and click "Retry deployment" or make a new deployment

### Step 4: Access Your App

Your app will be live at: `https://my-dbms-app.pages.dev` (or your custom URL)

## File Structure

```
my-dbms-app/
├── index.html              # Main HTML page
├── styles.css              # Styling
├── script.js               # Frontend JavaScript
├── functions/
│   └── api/
│       └── [[path]].js     # Backend API (Cloudflare Worker)
├── package.json            # Dependencies
├── wrangler.toml          # Cloudflare configuration
└── README.md              # This file
```

## How It Works

1. **Frontend**: The HTML/CSS/JS files create the user interface
2. **Backend**: Cloudflare Functions handle API requests
3. **Database**: Turso stores your data in a SQLite database
4. **Hosting**: Cloudflare Pages hosts everything for free

## Troubleshooting

**Tasks not loading?**
- Check if environment variables are set correctly in Cloudflare
- Verify your Turso database URL and token are correct

**Deploy failed?**
- Make sure all files are uploaded to GitHub
- Check Cloudflare deployment logs for errors

## Next Steps

You can customize this app by:
- Changing the task fields (add priority, due dates, etc.)
- Updating the design/colors in `styles.css`
- Adding user authentication
- Creating different database tables

Enjoy your DBMS! 🎉
