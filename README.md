# MC HRIS — User Guide

> **For:** HR Staff & System Administrators
>
> **System:** MC Human Resource Information System
>
> **Last Updated:** May 26, 2026

---

## Table of Contents

1. [Requirements](#requirements)
2. [How to Start the System](#how-to-start-the-system)
3. [How to Stop the System](#how-to-stop-the-system)
4. [How to Log In](#how-to-log-in)
5. [How to Backup Your Data](#how-to-backup-your-data)
6. [How to Reset the Database](#how-to-reset-the-database)
7. [How to Export Employee Data](#how-to-export-employee-data)
8. [Understanding Your Backup Files](#understanding-your-backup-files)
9. [Recommended Daily Routine](#recommended-daily-routine)
10. [Troubleshooting](#troubleshooting)
11. [Quick Reference](#quick-reference)

---

## Requirements

- **Windows 10 or 11**
- **Docker Desktop** must be installed and running
  - Download: https://www.docker.com/products/docker-desktop
  - Look for the whale icon (🐳) in your system tray to confirm it's running

---

## How to Start the System

1. Open the project folder
2. Double-click **`start.bat`**
3. Wait about **30–60 seconds** on first run (the database is being set up automatically)
4. Your browser will open automatically to: **http://localhost:3002**

> If the browser does not open, manually type `http://localhost:3002` in your browser address bar.

---

## How to Stop the System

1. Double-click **`stop.bat`**
2. Wait for the "MC HRIS has been stopped" message

> **Note:** You don't need to stop the system before shutting down your PC — it stops automatically. However, using `stop.bat` is the clean way to do it.

---

## How to Log In

Open the system in your browser and use the default admin account:

| Field    | Value                          |
|----------|--------------------------------|
| Email    | `admin@mabinicolleges.edu`     |
| Password | `Admin@2026`                   |

> **⚠️ IMPORTANT:** Change your password after your first login. Go to **Settings → Change Password**.

---

## How to Backup Your Data

### Create a Manual Backup

1. Make sure the system is running (use `start.bat` if not)
2. Double-click **`backup.bat`**
3. Wait for the **"Backup completed successfully!"** message
4. Your backup file is saved in the **`backups`** folder

### What Gets Backed Up?

| ✅ Included                        | ❌ Not Included              |
|------------------------------------|------------------------------|
| All employee information           | System code/programs         |
| Salary and benefits data           | Configuration files          |
| Attendance and leave records       | Uploaded documents           |
| User accounts and permissions      |                              |
| All other system data              |                              |

### Automatic Cleanup

- The system automatically keeps the **last 15 backups** and deletes older ones
- You **don't need to** manually delete old backup files

---

## How to Reset the Database

> **⚠️ WARNING:** This will erase ALL current data and replace it with demo/sample data. A backup is automatically created before the reset.

1. Make sure the system is running
2. Double-click **`reset-db.bat`**
3. Wait for completion
4. The system will:
   - Create a backup of your current data first
   - Clear all data
   - Load fresh demo data
5. Your pre-reset backup is saved in the **`backups`** folder

---

## How to Export Employee Data

The system can export employee records (including full Personal Data Sheet) to an Excel file.

### Export All Employees

1. Go to the **Employee List** page
2. Click the **"Export"** button
3. An Excel file will download with all employees' PDS data

### Export Selected Employees

1. Go to the **Employee List** page
2. Select the employees you want using the checkboxes
3. Click the **"Export Selected"** button
4. An Excel file will download with only the selected employees

### What's in the Export?

The Excel file contains 50+ columns including:
- Basic info (name, employee number)
- Personal data (birthdate, address, contact)
- Employment info (position, designation, salary, date hired)
- Government IDs (SSS, PhilHealth, PAG-IBIG, TIN, PERAA)
- Family background (spouse, children)
- Education, trainings, exams
- Employment history, references, and more

> **📌 Tip:** If one cell contains multiple items (e.g., multiple children), they are separated by " | " (pipe symbol).

### Data Privacy Reminder

The export contains sensitive personal information. Handle exported files according to your data privacy policies and share only with authorized personnel.

---

## Understanding Your Backup Files

### Where Are My Backups?

All backups are in **one folder**:

```
backups\
```

### File Naming Format

```
hris_backup_[DATE]_[TIME]_[DAY].sql
```

**Example:** `hris_backup_2026-05-25_143015_Monday.sql`

| Part         | Meaning               | Example         |
|--------------|-----------------------|-----------------|
| `2026-05-25` | Date (Year-Month-Day) | May 25, 2026    |
| `143015`     | Time (24-hour format) | 2:30:15 PM      |
| `Monday`     | Day of the week       | Monday          |

### Reading 24-Hour Time

| Time Code | Actual Time   |
|-----------|---------------|
| `080000`  | 8:00 AM       |
| `120000`  | 12:00 PM      |
| `130000`  | 1:00 PM       |
| `170000`  | 5:00 PM       |
| `235959`  | 11:59:59 PM   |

### Metadata Files

Each backup has a companion `.meta.json` file with details like size, time, and status. You can ignore these — they are for the system's internal use.

---

## Recommended Daily Routine

| Time     | Action                                              |
|----------|-----------------------------------------------------|
| 8:00 AM  | Start the system (`start.bat`) — check that it loads |
| 12:00 PM | Create a manual backup (`backup.bat`)                |
| Before any big change | Create a manual backup (`backup.bat`)   |
| 5:00 PM  | Create a manual backup before leaving (`backup.bat`) |

> **💡 Tip:** You can never backup too much. When in doubt, just run `backup.bat`.

---

## Troubleshooting

### "Docker is not installed or not in PATH"

1. Install Docker Desktop from https://www.docker.com/products/docker-desktop
2. Restart your computer
3. Try running `start.bat` again

### System does not load after 60 seconds

1. Make sure Docker Desktop is running (look for the whale icon 🐳 in your system tray)
2. Double-click `stop.bat`, then `start.bat` again
3. If still not working, open Command Prompt and type:
   ```
   docker compose logs
   ```
   Check for error messages

### "Container hris_postgres is not running"

1. Run `start.bat` first to start the system
2. Wait 30 seconds for the database to initialize
3. Try your backup again

### Backup file is 0 bytes or very small

1. Make sure the system is running (`start.bat`)
2. Try backing up again
3. If it still fails, contact IT support

### Can't find my backup files

Look in this folder:
```
[Project Folder]\backups\
```
All backups are stored in this **single location**. Do not look in other folders.

### "start.bat gives an error about Docker"

1. Open Docker Desktop manually and wait for it to fully start (it may take 1–2 minutes)
2. Then double-click `start.bat` again

### Export file won't download

1. Make sure you're logged in as Admin or HR
2. Try refreshing the page and exporting again
3. Check if your browser is blocking the download

---

## Quick Reference

| Task                     | What to Do                          |
|--------------------------|-------------------------------------|
| **Start the system**     | Double-click `start.bat`            |
| **Stop the system**      | Double-click `stop.bat`             |
| **Backup your data**     | Double-click `backup.bat`           |
| **Reset to demo data**   | Double-click `reset-db.bat`         |
| **Open the system**      | Go to http://localhost:3002         |
| **Find backup files**    | Open the `backups\` folder          |
| **Export employee data**  | Employee List → Export button       |

### System URLs

| Service   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:3002       |
| Backend   | http://localhost:5001       |

---

## For Technical Help

Contact your IT support team with:
- What you were doing when the problem happened
- Any error messages you saw
- The backup filename (if it's a backup issue)

---

*MC HRIS v2.0 — Mabini Colleges Human Resource Information System*
