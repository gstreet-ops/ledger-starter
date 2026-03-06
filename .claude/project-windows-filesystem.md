> **START OF SESSION:** Read this file fully before doing anything else.
> Path: `C:\Users\brian\projects\gstreet-ledger\.claude\project-windows-filesystem.md`

# File System — HP EliteBook 840 G5
_Project for keeping C:\Users\brian\ and local directories clean and organized._

## Purpose
Recurring cleanup of Downloads, Desktop, and local project folders on this machine.
Goal: nothing lives in Downloads or Desktop that belongs elsewhere.
Everything important goes to Google Drive (G:) or C:\Users\brian\projects\.

## Machine Specs
- **Model:** HP EliteBook 840 G5
- **Device name:** DESKTOP-GSDB5IV
- **OS:** Windows 11 Pro (Build 26200.7840, installed 1/21/2025)
- **Processor:** Intel Core i5-8350U @ 1.70GHz
- **RAM:** 16.0 GB
- **Storage:** 477 GB (160 GB used)
- **User:** C:\Users\brian\
- **Google Drive:** Mounted at G:\My Drive\
- **Projects:** C:\Users\brian\projects\
- **Desktop Commander MCP:** Active (use for all file ops)

## Google Drive Folder Conventions
```
G:\My Drive\
  Admin\
    Resume\
      Resume {YYYY}\     ← year-based resume folders (2007–2026 exist)
  Work\
    Resumes\             ← consolidated resume storage (prefer this over Admin)
    Globe Street Tech\   ← GStreet project work
    Clients-Archive\     ← old client work by client name
      Archive-Diagrams\  ← old work diagrams (SVGs, flowcharts)
  Finance\               ← financial docs
  Personal\              ← personal files
  Clients-Archive\       ← archived client folders (Terrapin, EmergingMoney, etc.)
```

## Completed Cleanup Sessions

### 2026-03-06 — Downloads Cleanup (this chat)
**Deleted (~75 files):**
- Duplicate HTMLs (gstreet-portfolio _1–8, jupiter-golf-week variants, reading-fc variants)
- Installers (Git, Node, Android Studio, Claude Setup)
- Temp JS/CSS/JSX scratch files
- Duplicate MDs and ZIPs
- Stale project files (CLAUDE.md copies, DATABASE_SCHEMA, EMBED_ARCHITECTURE, etc.)
- Ellie Hallaron client files (Bio for Website.docx, Vengeful Vows cover, Blurb.docx)

**Moved to Google Drive:**
- 3 resumes → G:\My Drive\Work\Resumes\ (Brian_MORSE_Resume_Trace3_WithDev.docx)
  Note: Brian_MORSE_Resume_1-26.docx and Brian_Morse_Resume_Inhabit_Principal_PM.docx
  were already in G:\My Drive\Admin\Resume\Resume 2026\ — deleted from Downloads
- 12 work diagrams (DI workflows, Apttus, Service Cloud, ERD, RAG SVGs)
  → G:\My Drive\Clients-Archive\Archive-Diagrams\

**Moved to projects:**
- ario-demo-tool\ (git repo) → C:\Users\brian\projects\ario-demo-tool\
  (ario-landing.html and ario-synthetic-data.json merged into repo first)

**Still needs manual action:**
- Brian_MORSE_Resume_Trace3_WithDev.docx in Downloads — file was open in Word,
  could not delete. Close Word and delete manually.

### Downloads state after 2026-03-06 cleanup
**45 items remaining. Exact current file list:**

| File | Destination | Action |
|------|------------|--------|
| Brian_MORSE_Resume_Trace3_WithDev.docx | G:\My Drive\Work\Resumes\ | Already copied — delete once Word releases it |
| Citi_April 14.pdf | gstreet-ledger / Drive Taxes\2024\Deductions\Citi\ | Handle in Google Drive project |
| Globe Street Invoice 109.xlsx | G:\My Drive\Work\Globe Street Tech\ | Move |
| nemo-claude-code-brief.md | C:\Users\brian\projects\nemo (or Drive) | Move |
| nemo-demo-script.md | C:\Users\brian\projects\nemo (or Drive) | Move |
| nemo-security\ (dir) | C:\Users\brian\projects\nemo (or Drive) | Move |
| Nemo_vs_Census_Competitive_Analysis.docx | C:\Users\brian\projects\nemo (or Drive) | Move |
| reading-fc-ticket-site.html | C:\Users\brian\projects\trivia-app | Move |
| reading-fc-trivia-project.md | C:\Users\brian\projects\trivia-app | Move |
| difficulty-voting.md | C:\Users\brian\projects\trivia-app | Move |
| ROADMAP.md | C:\Users\brian\projects\trivia-app | Move |
| Tech Trivia Champions_questions_2026-02-17.csv | C:\Users\brian\projects\trivia-app | Move |
| Tech Trivia Champions_questions_2026-02-25.csv | C:\Users\brian\projects\trivia-app | Move |
| question_template.csv | C:\Users\brian\projects\trivia-app | Move |
| trivia-app\ (dir) | Confirm if duplicate of projects\trivia-app | Check then move/delete |
| jupiter-golf-week-supabase-v1.html | C:\Users\brian\projects\trivia-app or separate | Confirm project |
| jupiter-golf-week.html | C:\Users\brian\projects\trivia-app or separate | Confirm project |
| marketplace-seed-data.sql | C:\Users\brian\projects\ario-demo-tool | Move (Ario project) |
| marketplace-users-seed.sql | C:\Users\brian\projects\ario-demo-tool | Move (Ario project) |
| User Data Stories PDFs (7 files) | C:\Users\brian\projects\ario-demo-tool | Move (confirmed Ario) |
| Copy of User Data Stories.pdf | C:\Users\brian\projects\ario-demo-tool | Move (confirmed Ario) |
| ellie-theme-showcase.jsx | G:\My Drive\Clients-Archive\ellie-hallaron | Move |
| property-maintenance-setup-v2.docx | G:\My Drive\Properties | Move |
| property-maintenance-setup.docx | G:\My Drive\Properties | Move |
| property-owner-info-request.docx | G:\My Drive\Properties | Move |
| gstreet-portfolio.html | C:\Users\brian\globestreet (already in repo?) | Check then move/delete |
| supabase-setup-guide.md | C:\Users\brian\projects\gstreet-ledger\.claude | Move or delete |
| vercel-setup-guide.md | C:\Users\brian\projects\gstreet-ledger\.claude | Move or delete |
| ok I think i.am less.concermwd... .md | Already in gstreet-ledger project | Delete |
| us, georgia,.single member llc.md | Already in gstreet-ledger project | Delete |
| yes please provided suggested architecture.md | Already in gstreet-ledger project | Delete |
| dashboard-v3-final.patch | C:\Users\brian\projects\trivia-app | Confirm then move/delete |
| BIA-Report-Acme-Manufacturing.pdf | Unknown — confirm project | Ask |
| files.zip | Unknown contents | Inspect then decide |
| Depositphotos_14083733_XL.jpg | G:\My Drive\Images | Move |
| Depositphotos_666139340_XL.jpg | G:\My Drive\Images | Move |
| Releases.psd | Unknown — confirm project | Ask |
| desktop.ini | System file | Leave alone |

## Next Session Agenda
1. Finish Downloads: move Citi PDF to gstreet-ledger, trivia files to trivia project,
   nemo files to nemo project, ario/marketplace files to ario project
2. Desktop cleanup (see Google Drive Maintenance project for Drive side)
3. Resume folder consolidation: Admin\Resume\ vs Work\Resumes\ — pick one hierarchy

## Known Issues / Notes
- Two resume hierarchies exist: G:\My Drive\Admin\Resume\{year}\ AND G:\My Drive\Work\Resumes\
  Should consolidate — recommendation is to keep Work\Resumes\ and deprecate Admin\Resume\
- ario-demo-tool has a diverged ario-synthetic-data.json — the Downloads version
  (newer) was moved into the repo, overwriting the older copy
- trivia-app\ dir in Downloads — unknown if duplicate of main project, left alone
