Read CLAUDE.md for system goals and .claude/context.md for where we left off. Today we're building the categorization engine (Phase 1C):

1. Create src/lib/services/categorization.ts — Rule engine:
   - Check import_rows against categorization_rules table (ILIKE pattern match on merchant_name and name fields)
   - Rules have priority — highest matching priority wins
   - Returns { account_id, tax_category_id } or null if no match
   - Function: applyRules(importRows) that batch-processes unmatched rows
   - Function: matchRule(merchantName, description) that returns best matching rule

2. Create src/lib/ai/suggest.ts — Anthropic API integration:
   - Given an import_row (merchant, description, amount, Plaid category), ask Claude Sonnet to suggest account_id + tax_category_id + confidence (0-1) + reasoning
   - System prompt includes the full chart of accounts and tax categories as context (query from DB)
   - Store suggestion as JSONB on import_row.ai_suggestion field
   - Function: suggestCategory(importRow) for single row
   - Function: suggestCategoriesBatch(importRows) for up to 10 rows per API call
   - Use ANTHROPIC_API_KEY from env (if not set, skip AI suggestions gracefully)

3. Create src/app/transactions/review/actions.ts — Server actions for the review flow:
   - acceptSuggestion(importRowId, accountId, taxCategoryId): creates transaction + transaction_lines (double-entry: debit expense, credit bank account), marks import_row as matched
   - editAndAccept(importRowId, accountId, taxCategoryId): same as accept but with user-modified values
   - skipRow(importRowId): marks import_row as ignored
   - createRuleFromAcceptance(importRowId, pattern, accountId, priority): saves a new categorization_rule based on accepted suggestion
   - bulkAccept(importRowIds): accept multiple rows with their current suggestions

4. Update src/app/transactions/review/page.tsx — Add categorization UI:
   - Show rule match or AI suggestion with confidence badge (high/medium/low) and reasoning tooltip
   - Accept button: creates transaction + lines, marks as matched
   - Edit button: dropdown to change account/category before accepting
   - Skip button: marks as ignored
   - "Create Rule" button: when accepting, option to save pattern as new categorization_rule
   - Bulk select: checkbox per row, "Accept Selected" button for batch operations
   - Run categorization: button that triggers rules + AI suggestions on all pending rows

5. Create src/lib/services/posting.ts — Double-entry posting service:
   - createPosting(importRow, accountId, bankAccountId): creates transaction + 2 transaction_lines
   - Validates SUM(debit) = SUM(credit) before saving
   - Determines debit vs credit based on amount sign and account types
   - Returns created transaction with lines

6. Update src/lib/db/queries.ts with:
   - getRules: fetch active categorization_rules ordered by priority desc
   - createRule: insert new categorization_rule
   - getAccountsWithTaxCategories: fetch accounts joined with tax_categories for the suggestion prompt

Commit after each logical step with descriptive messages. Update .claude/context.md when done. Push to origin/main.
