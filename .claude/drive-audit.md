# gstreet-ledger: Google Drive Taxes Folder Audit
_Audited: 2026-03-06_

---

## Drive Structure Overview

There are **two "Taxes" root folders** in Drive:

### Folder A — Organized Hub (Primary)
**URL:** https://drive.google.com/drive/folders/1NNC9bBKke5lKtjokRxIZBPxX5wTr8CXs
**Created:** 2026-01-20 (reorganized recently)
**Contains:** Year subfolders 2017–2025, each with consistent structure

### Folder B — 2024 Taxes (Secondary/Alt)
**URL:** https://drive.google.com/drive/folders/11p3sc8m_ptuDC7mW5OlgbDvcWFWCISTU
**Created:** 2026-01-24
**Contains:** W-9 subfolder only

### Old Standalone Year Folders (pre-reorganization)
- `2021 Taxes` (empty) — https://drive.google.com/drive/folders/1O9oQfnjpErqEb4nVLnZjiXbJRv43Jdes
- `2020 TAxes` — https://drive.google.com/drive/folders/1UuCvNQh7FzabP48-eK2rGvfLAbMXfZpY
- `2019 Taxes` — https://drive.google.com/drive/folders/1Ka0DdUSl5_8iZZ2mM2GGDjeNDTHEddU-
- `2018 Taxes` — https://drive.google.com/drive/folders/1DCp3LlexsD2xlgVcZdZawhYreS0RIV3f
- `2017 Taxes` — https://drive.google.com/drive/folders/10NhxBakEjPsW89a1sPunZlfzCTMZEThN
- `Taxes` (old 2021, empty) — https://drive.google.com/drive/folders/10JRH2LeV7haC7m_eu0k3snyESkq0tWI-
- `GA Taxes` — https://drive.google.com/drive/folders/0BwhS2Akymt8jcW82WXU1T1AzX3M

---

## Year-by-Year Inventory (Folder A: 2017–2025)

All year folders share a **standard subfolder structure:**
`Income / Deductions / Investments / Property / Filed-Returns`
Some years add `Amex-Statements/`.

| Year | Folder ID | Subfolders | Statement Files | Status |
|------|-----------|-----------|----------------|--------|
| 2017 | 1ieJEAmjSjd0zM1pb2X-AzBTNwhitJE0X | Inc, Ded, Inv, Prop, Filed | None found | ⚠️ Empty |
| 2018 | 1pStpxckoKHnLLvsRiCd2xq4TxoBlU4JD | Inc, Ded, Inv, Prop, Filed | None found | ⚠️ Empty |
| 2019 | 1asHogK1gEwHFGUPy-UKLZ_pSqnntjfyo | Inc, Ded, Inv, Prop, Filed | None found | ⚠️ Empty |
| 2020 | 1wVjESD-e0XdwxkLv5qRiuWUFgVdu4EEs | Inc, Ded, Inv, Prop, Filed | None found | ⚠️ Empty |
| 2021 | 1EOqJZslyVAigV7k8wT4srfRTTZlDU637 | Inc, Ded, Inv, Prop, Filed | None found | ⚠️ Empty |
| 2022 | 1X4WLo5R2Dtz94moFlAiLJtneeA6HGsdx | Inc, Ded, Inv, Prop, Filed, Amex-Stmts | None found | ⚠️ Empty |
| 2023 | 1bFVux-oBxb3T5DDa2yjTK-U51MF6SD6y | Inc, Ded, Inv, Prop, Filed, Amex-Stmts | None found | 🔴 PRIORITY |
| 2024 | 1f6FUdg6AokieiRid1mgx-cYgfYTbDWLI | Inc, Ded, Inv, Prop, Filed | None found | 🔴 PRIORITY |
| 2025 | 1a_Xy1GBYNHso0f3jSwKyeheVwkBNAx10 | Inc, Ded, Inv, Prop, Filed | None found | 📋 In progress |

**Key finding:** The entire folder tree is an empty scaffold. No PDFs or XLSXs were
found via the Drive API. Files must be uploaded before gstreet-ledger can import them.


---

## Card-Level Deduction Subfolders

Card folders created 2026-02-06 (very recently). All empty.

### 2023 Deductions (1vlQeiWMKp6nox4kGAoaZgkPURIF9Fhgo)
| Card | Folder ID |
|------|-----------|
| Delta_Platinum_Business | 1dpUBdR4cEoIGZDsGXmExJmjf4YlzQ-Hr |
| Amex_Green_Card | 1PX8b3K9kZ4Eb84gTTjpm421rn22OAw8i |
| AmEx_EveryDay | 1PE1ZgioPSMacsFe2-nHwCOHYlAmZUK27 |

### 2024 Deductions (1SN8JCkHfHLAB2tFhBQ8FqokuV0owT9K9)
| Card | Folder ID |
|------|-----------|
| Delta_Platinum_Business | 1MIz58IcipxKmEDny_KZzV_8UjwLJp_fo |
(Amex_Green_Card and AmEx_EveryDay folders not yet created for 2024)

### 2022 Deductions (1CGvPMStA28Oiwi9uU8HJ3n5oKGE4HSZj)
Card subfolders exist but not inventoried yet.

---

## Parser Inventory vs. Gaps

| Source | Format | Parser | Notes |
|--------|--------|--------|-------|
| AmEx (all cards) | XLSX | ✅ amex-parser.ts | Business XLSX exports |
| AmEx (all cards) | PDF | ❌ MISSING | 2023 PDFs need new parser |
| Citi | PDF | ✅ citi-parser.ts | |
| Truist | PDF | ✅ truist-parser.ts | |
| Wells Fargo | Unknown | ❌ MISSING | Confirm if WF account active 2023-24 |

---

## Action Items

### Before Next Dev Session (manual Drive work)
1. Download AmEx statements for 2023 and 2024 (all 3 cards, all months)
   - XLSX preferred (amex-parser.ts already handles this)
   - PDFs if XLSX unavailable → triggers need for AmEx PDF parser
2. Download Citi 2023 + 2024 statements (PDF)
3. Download Truist 2023 + 2024 statements (PDF)
4. Upload to appropriate card subfolders in Drive
5. Confirm whether Wells Fargo account was active; if so, download statements

### Dev Session (in order)
1. **AmEx PDF parser** — build if downloading PDFs instead of XLSX
2. **Multi-file upload** — batch upload UI (72 files = 12 mo × 3 cards × 2 years)
3. **Review → Post pipeline** — promote import_rows → transactions + journal entries
4. **Wells Fargo parser** — if WF account confirmed

### Later
- 2017–2022 historical statement upload (lower priority)
- Verify Filed-Returns folders for 1040/GA500 PDFs
- Check Income folders for 1099s

---

## Drive Folder ID Quick Reference

```
Taxes (main hub):     1NNC9bBKke5lKtjokRxIZBPxX5wTr8CXs
  2017:               1ieJEAmjSjd0zM1pb2X-AzBTNwhitJE0X
  2018:               1pStpxckoKHnLLvsRiCd2xq4TxoBlU4JD
  2019:               1asHogK1gEwHFGUPy-UKLZ_pSqnntjfyo
  2020:               1wVjESD-e0XdwxkLv5qRiuWUFgVdu4EEs
  2021:               1EOqJZslyVAigV7k8wT4srfRTTZlDU637
  2022:               1X4WLo5R2Dtz94moFlAiLJtneeA6HGsdx
    Deductions:       1CGvPMStA28Oiwi9uU8HJ3n5oKGE4HSZj
  2023:               1bFVux-oBxb3T5DDa2yjTK-U51MF6SD6y
    Deductions:       1vlQeiWMKp6nox4kGAoaZgkPURIF9Fhgo
      Delta_Plat_Bus: 1dpUBdR4cEoIGZDsGXmExJmjf4YlzQ-Hr
      Amex_Green:     1PX8b3K9kZ4Eb84gTTjpm421rn22OAw8i
      AmEx_EveryDay:  1PE1ZgioPSMacsFe2-nHwCOHYlAmZUK27
    Income:           1qnNcOxHNuF4BKcP4hp0J2YzNoWhaFqZs
    Amex-Stmts:       1e04kR9eUuXH6yowkLGSibaQ7KPJS9Vqi
  2024:               1f6FUdg6AokieiRid1mgx-cYgfYTbDWLI
    Deductions:       1SN8JCkHfHLAB2tFhBQ8FqokuV0owT9K9
      Delta_Plat_Bus: 1MIz58IcipxKmEDny_KZzV_8UjwLJp_fo
    Income:           1ngO6V0-IfPGnCo6cdzDVsX3q9F2akphN
    Filed-Returns:    18xBuo1Df7DMGtq67qvV3nFnfLlQDYKAr
  2025:               1a_Xy1GBYNHso0f3jSwKyeheVwkBNAx10

Taxes 2024 (alt):     11p3sc8m_ptuDC7mW5OlgbDvcWFWCISTU
  W-9:                1PLscRBMO8kXSkQJYqN77KgE6r59R0g0t
```
