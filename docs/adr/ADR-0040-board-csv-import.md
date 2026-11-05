<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0040 — Cold-start the internship directory with an operator-run job-board CSV import

- **Date:** 2026-11-04
- **Status:** Accepted
- **Owner:** The cold-start board import; Audit.md SEC-07, REG-14, REG-33, REG-34, REG-35, and the
  product-owner decisions of 2026-11-04.
- **Builds on:** [ADR-0006](ADR-0006-store-no-applications.md) (apply on the company's own site),
  [ADR-0010](ADR-0010-mvp-cut-to-17-features.md) (no employer module; admin owns listings),
  [ADR-0017](ADR-0017-jia-ingestion-pull-and-store.md) (the Jia feed is the other ingestion path).

## Context

1. The directory launches empty. Jia is the only automated source and its real feed does not exist
   yet. To have listings on day one, public posts were scraped from the LinkedIn guest API, JobStreet
   PH and Kalibrr into `internship-data/ph-internships-2026-11-04.csv` (1191 rows).
2. LinkedIn's terms of service forbid scraping, and JobStreet's and Kalibrr's may as well. That risk
   is accepted as a known, recorded exposure; this ADR does not make it go away.
3. The scraper output must not reach the database unvalidated: it is third-party text, its links
   leave the platform, and it was produced outside the app. A row that fails a rule is skipped, not
   partially written.
4. The import runs by hand against a database an operator names, including production, so it must be
   safe to re-run and must never modify a row it did not create.

## Decision

1. **Operator-run CSV import.** `cmd/csvimport -file <path>` is a dry run: parse and validate only,
   print one JSON summary (rows, valid, invalid, counts by source, invalid rows by rule) and up to
   50 rejected-row lines, and open no database connection at all. `-apply` writes the valid rows.
   A file with any invalid row is refused in both modes; there is no partial import.
2. **Sources.** Imported rows carry `internship.source` `linkedin`, `jobstreet` or `kalibrr`
   (`internships.SourceLinkedIn`, `SourceJobStreet`, `SourceKalibrr`, `IsBoardSource`). A board CSV
   can never claim `manual` or `jia`.
3. **Rows go live as `open`.** By explicit product-owner decision on 2026-11-04, imported rows are
   written `status='open'`, not `pending`. This deliberately departs from the "JIA rows pending"
   half of Audit.md SEC-07, which was written before the cold-start problem was known; the visibility
   risk is accepted and recorded here rather than silently changed in code. `published_at` comes from
   the post, not the import time.
4. **Pay not stated.** `internships.PayNotStatedNote` (`"Pay not stated in the original post"`) is the
   `compensation_details` value for a post that did not state pay. A public card of an unpaid listing
   whose details carry exactly this note sets `pay_not_stated: true`, so the web can say "Pay not
   stated" instead of "Unpaid / For Credit". The flag is computed on the server; no SQL literal of
   the note exists in a query.
5. **Upsert, never adopt.** The write path (`(*internships.PGRepository).UpsertBoardListing`) is one
   transaction per row and keys on `(source, external_id)`. On conflict it updates only content
   fields plus `last_synced_at`/`updated_at`; it never changes `status`, `published_at`, `slug`,
   `company_id` or `created_at`. The update only applies while
   `updated_at <= last_synced_at` — true after an import, false once an admin edit or withdrawal
   bumped `updated_at` — so a re-import refreshes only the rows nobody edited since the last import
   and reports the rest as `skipped` in the summary. A second run over an untouched file inserts
   nothing and overwrites no listing state, so an operator can re-run it safely.
6. **Companies.** An existing company is matched by normalised name (case, surrounding and repeated
   whitespace ignored) and reused; a missing one is inserted with the CSV's spelling and a
   `slugify(name)` slug, falling back to a hash suffix on slug collision. A name with no ASCII
   letters or digits gets `company-<hash>` rather than an empty slug. An existing company row is
   never updated.
7. **Text and links are plain text.** Imported text rejects `<`, `>` and control characters other
   than newline and tab (REG-35), and both URLs must be absolute `https` with a host (SEC-07). All
   SQL values are bound parameters (REG-14). `DATABASE_URL` is read from the environment only and is
   never logged, not even on a connect failure (REG-33). The binary is not added to the `Dockerfile`
   (REG-34); an operator runs it with `go run ./cmd/csvimport`.

## Consequences

- The directory has listings before Jia or any employer posting exists, at the cost of a manual,
  repeatable operator step in [`ops.md`](https://github.com/iskolar-web3/vocation-server/blob/14d7d2db2d250323067e18f056216b9686b3ba04/docs/ops.md).
- **No automatic withdrawal.** A stale or deleted post stays public until an operator withdraws it
  through the admin API (`POST /admin/internships/:id/withdraw`) or, for a whole source, runs the
  documented `UPDATE internship SET status='withdrawn' WHERE source IN (...)` by hand. Withdrawal is
  never automated by the importer.
- LinkedIn scraping remains a known compliance risk; the product-owner decision covers its use for
  cold-start data, not a permanent ingestion strategy.
- Scraped descriptions and requirements may contain recruiter names, e-mail addresses and phone
  numbers (third-party personal data on public posts). Under RA 10173 they are stored as published;
  stripping them at import is a follow-up, not a current behaviour.
- The CSV contract is exact and versioned by its header: a scraper column change is a loud
  file-level error, not a shifted import.
