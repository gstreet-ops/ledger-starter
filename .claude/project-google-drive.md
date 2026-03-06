> **START OF SESSION:** Read this file fully before doing anything else.
> Path: `C:\Users\brian\projects\gstreet-ledger\.claude\project-google-drive.md`
> **LAST UPDATED:** 2026-03-06 (Session complete — Chase, Schwab, PayPal addressed; ledger-starter planning done)

# Google Drive Maintenance
_Project for auditing, organizing, and maintaining G:\My Drive\ (brianmorse@gmail.com)._

## Purpose
Google Drive is the primary cloud storage for all personal, business, financial,
and archived files. This project tracks the ongoing audit and cleanup of Drive
structure, identifies duplicates and gaps, and maintains conventions.

## TAXES FOLDER — Current State (as of 2026-03-06)

### Folder Structure (COMPLETED — 265 files moved)
`G:\My Drive\Finance\Taxes\{year}\` for years 2017–2026, each containing:
```
{year}/
  Credit_Cards/
    AmEx_EveryDay/
    AmEx_Green_Card/
    AmEx_Delta_Platinum_Business/
    Citi/
    Chase_Slate_6397/
  Checking/
    Truist/
    USAA/
  Investments/Schwab/   <- next target
  Income/               <- preserved
  Filed-Returns/        <- preserved
```

### AmEx EveryDay — Coverage
- 2017: 6/12 PDFs (missing Feb,Mar,Jun,Jul,Aug,Nov)
- 2018: 7/12 PDFs (missing Jan,Feb,Jun,Oct,Nov)
- 2019: 8/12 PDFs (missing Apr,Jul,Aug,Dec; delete dup Jan)
- 2020: 11/12 PDFs (missing Feb)
- 2021-2023: COMPLETE (12/12 each)
- 2024: COMPLETE — Jan PDF (2024-01-07) + CSV Feb-Dec
- 2025: COMPLETE — CSV full year

### AmEx Green Card — Coverage
- 2017: 6/12 (missing Apr,May,Jul,Aug,Nov,Dec)
- 2018: 8/12 (missing Jan,Feb,Mar,Jun)
- 2019: 11/12 (missing Nov)
- 2020: COMPLETE (12/12)
- 2021-2022: 11/12 each (missing Dec)
- 2023: COMPLETE (12/12)
- 2024: COMPLETE — Jan PDFs (2024-01-07 + 2024-01-28) + CSV Mar-Dec
- 2025: COMPLETE — CSV full year

### AmEx Delta Platinum Business — Coverage
- 2019: 11/12 (missing Jan)
- 2020-2023: COMPLETE (12/12 each)
- 2024: COMPLETE — Jan PDF (2024-01-12) + CSV Feb-Dec
- 2025: Multiple overlapping XLSX — needs consolidation (TODO)

### Citi (ThankYou Preferred - 4830 / ThankYou Preferred - 4219) — Coverage
- 2019-2021: MISSING — need to request via citi.com "Request Older Statements" (goes back to 03/06/2016, max 12 at a time, 24-48hr processing)
- 2022: REQUESTED 2026-03-06 — all 12 months in processing (24-48hrs), download when ready
- 2023: COMPLETE (12/12) — filed and renamed with closing dates
- 2024: 11/12 — missing January (to download); all (1) dupes cleaned up; April closes on 12th (not 14th)
- 2025: COMPLETE (12/12)
- 2026: Jan 14 filed (Citi_January 14.pdf)
- NOTE: April 2024 = Citi_April 12.pdf; April 2023 = Citi_April 14.pdf — different years, not dupes

### Truist (Simple Business Checking - 1110028698783, Globe Street Tech LLC) — Coverage
- 2019-2023: MISSING entirely — unknown availability, needs research
- 2024: COMPLETE Aug-Dec (5 PDFs) — Jan-Jul unknown/likely predates account or unavailable
- 2025: COMPLETE Jan-Nov + Aug (12 PDFs) — December missing (will appear as "January 2026" in portal)
- NOTE: All files were off by one month due to Truist's labeling; corrected 2026-03-06
- NOTE: _acct2 suffix was download artifact, NOT a second account (same acct 1110028698783)

### USAA (Classic Checking - 6193) — Coverage
- 2019-2023: MISSING — waiting on USAA phone support to determine availability
- 2024: 4 PDFs (Aug-Dec only, last 4 months available online) — Jan-Jul MISSING
- 2025: COMPLETE — full year CSV (USAA_Checking_2025-01-03_to_2025-12-31.csv)
- 2026: Partial CSV filed (Feb 13 - Mar 1)

### Chase Slate (6397) — Coverage ✅ COMPLETE 2019-2025
- Naming convention: Chase_Slate_{Month} {DD}.pdf (closing date always 10th)
- Download format from chase.com: YYYYMMDD-statements-6397-.pdf
- Filing script: write chase_file.ps1, run with powershell -ExecutionPolicy Bypass -File
- 2019: COMPLETE (12/12) — filed 2026-03-06
- 2020: COMPLETE (12/12) — filed 2026-03-06
- 2021: COMPLETE (12/12) — filed 2026-03-06
- 2022: COMPLETE (12/12) — filed 2026-03-06
- 2023: COMPLETE (12/12) — filed 2026-03-06
- 2024: COMPLETE (12/12) — filed 2026-03-06
- 2025: COMPLETE (12/12) — filed 2026-03-06
- 2026: Jan + Feb filed; rest of year not yet issued

### Schwab (IRA Rollover - 2457-8275) — Coverage
- Naming: Schwab_IRA_2457-8275_YYYY-MM.pdf (monthly statements); Schwab_1099R_YYYY.pdf, Schwab_5498_YYYY.pdf, Schwab_YearEndGainLoss_YYYY.pdf (tax docs)
- Statements only generated in months with activity (2019-2022 sparse)
- 2019: 5 statements (Mar, Jun, Aug, Sep, Dec)
- 2020: 8 statements | YearEndGainLoss ✅
- 2021: 6 statements (Mar, Jun, Jul, Sep, Oct, Dec)
- 2022: 7 statements | YearEndGainLoss ✅
- 2023: 12/12 COMPLETE ✅
- 2024: 12/12 COMPLETE ✅ | 1099-R (PDF+CSV), 5498 ✅
- 2025: 12/12 COMPLETE ✅
- 2026: Jan + Feb filed
- NOTE: May have additional tax docs (1099s) for 2019-2023 — check Tax Documents section on schwab.com

### PayPal (Broad Reach LLC account — continuing forward) — Coverage
- Folder: G:\My Drive\Finance\Taxes\{year}\Checking\PayPal\
- Folders created: 2018-2026
- Downloads blocked on 2026-03-06 — possibly locked by QuickBooks integration
- Most transactions already captured in other accounts (AmEx, Chase, etc.)
- Goes back 7 years per PayPal UI; max 12-month range per report; CSV format
- Status: DEFERRED — revisit if QuickBooks sync can be paused or disconnected

### Legacy AmEx-Statements Folders
2018-2023 contain Amex-Statements\ subfolders with PDFs named by date only (e.g. 2021-08-06.pdf).
Dates match EveryDay billing cycle. Disposition TBD — may be EveryDay duplicates.

### Delta Platinum Business XLSX Cleanup (TODO)
2024 has 4 overlapping files + 10 bimonthly XLSXs. Same issue for 2025.
Need to identify canonical and remove dupes.

## Next Session — Recommended Priority Order
1. Citi Jan 2024 — download from citi.com → Citi_January 14.pdf → 2024\Credit_Cards\Citi\
2. Citi 2022 — check if 24-48hr processing complete (requested 2026-03-06), download and file all 12 months
3. Citi 2019-2021 — request from citi.com (12 at a time)
4. USAA 2024 Jan-Jul + 2019-2023 — pending USAA support call outcome
5. Truist Dec 2025 — download from portal (will be labeled "January 2026")
6. Truist 2019-2023 — research availability
7. Schwab tax docs 2019-2023 — check Tax Documents section on schwab.com for any 1099s
8. PayPal — revisit when QuickBooks sync issue resolved
9. Delta Platinum Business XLSX consolidation (2024 + 2025)
10. AmEx historical gaps (2017-2019 spot PDFs)

## Other Known Issues
- Resume duplication: Admin\Resume\ (canonical) vs Work\Resumes\ (merge and delete)
- Work\Clients-Archive vs root Clients-Archive (reconcile)

## Conventions
- Statements: Taxes/{year}/Credit_Cards/{CardName}/ or Taxes/{year}/Checking/{BankName}/
- AmEx format: CSV (activity page) + Jan PDF separately
- PDFs for Citi, Chase, Truist
- Naming: {CardName}_{Month} {DD}.pdf using statement closing date (e.g. Chase_Slate_March 10.pdf)
- Never delete originals — source of truth for gstreet-ledger
- Use DC write_file to write .ps1 scripts, then run with: powershell -ExecutionPolicy Bypass -File
- Inline -Command with variables/hashtables fails — always write to .ps1 file first

## Completed Work Log
- 2026-03-06: Full restructure of Taxes folder (Deductions -> Credit_Cards/Checking)
- 2026-03-06: Moved 265 files across 9 years
- 2026-03-06: Truist 2025 deduplicated (18->12 files)
- 2026-03-06: AmEx CSVs downloaded and filed for 2024-2025 (all 3 cards)
- 2026-03-06: Filed AmEx EveryDay Jan 2024 PDF
- 2026-03-06: Filed AmEx Green Card Jan 2024 PDFs (01-07 + 01-28)
- 2026-03-06: Confirmed AmEx Delta Platinum Business Jan 2024 already filed
- 2026-03-06: Citi 2023 — all 12 months filed and renamed with closing dates
- 2026-03-06: Citi 2024 — stripped (1) from 6 files; confirmed Apr closes on 12th; Jan still missing
- 2026-03-06: Citi 2025 — confirmed complete 12/12
- 2026-03-06: Citi 2026 — created folder, filed January 14.pdf
- 2026-03-06: Citi 2022 — all 12 months requested via citi.com (processing 24-48hrs)
- 2026-03-06: USAA 2024 — filed 4 PDFs (Aug-Dec), renamed to period-range format
- 2026-03-06: USAA 2026 — filed Since-Feb-14 CSV as USAA_Checking_2026-02-13_to_2026-03-01.csv
- 2026-03-06: Truist 2024 — corrected all filenames (were off by 1 month); Aug-Dec 5 files
- 2026-03-06: Truist 2025 — corrected all filenames; _acct2 artifacts resolved; Jan-Nov + Aug = 12 files
- 2026-03-06: Chase Slate 6397 — 2019-2025 all COMPLETE (12/12 each), 84 statements filed and renamed
- 2026-03-06: Chase 2026 — Jan + Feb filed
- 2026-03-06: Schwab IRA 2457-8275 — 2019-2025 filed (activity-only months for 2019-2022, 12/12 for 2023-2025); 2026 Jan+Feb filed
- 2026-03-06: Schwab tax docs — 1099-R + 5498 (2024), YearEndGainLoss (2020, 2022) filed
- 2026-03-06: PayPal (Broad Reach LLC acct, continuing forward) — folders created 2018-2026; downloads blocked possibly due to QuickBooks integration; most transactions captured in other accounts; revisit later
