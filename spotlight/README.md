# NHS Rollout — Spotlight Lymphoma

[Open the tool](https://rounakdas07.github.io/evidence-check/spotlight/)

A practical account research tool for Spotlight Pathology's NHS expansion. Start with a shortlist, compare up to three trusts, inspect the source records and export an account brief or spreadsheet. No login, API key or installation is needed to use it.

## The business problem

Spotlight's [March 2026 seed announcement](https://ukinnovationscienceseedfund.co.uk/spotlight-pathology-secures-1-4m-seed-funding-to-advance-ai-powered-blood-cancer-diagnostics/) describes moving its AI diagnostics towards clinical deployment. Its first product, [Spotlight Lymphoma](https://spotlightpathology.com/spotlight-lymphoma), works with digitised lymphoid histology. A useful prospect needs more than poor cancer waiting times: relevant service activity, digital infrastructure, a route into the organisation and a check for existing relationships.

This tool does the initial joining and qualification work across NHS England provider data. It does not establish purchasing intent or recommend clinical care.

## What appears first

The opening shortlist contains **34 NHS trusts**, using the six-month rules below. **North Midlands (RJE)** is the featured account because its [official July 2026 announcement](https://www.uhnm.nhs.uk/latest-uhnm-news/uhnm-first-in-the-midlands-to-achieve-100-per-cent-digital-histopathology-reporting/) describes both fully digital histopathology and a next phase exploring AI. The April–September NHS data reports:

- 83 of 202 completed suspected haematological pathways exceeding 28 days; 58.9% within the standard.
- 89 lymphoma first treatments in a separate treatment cohort.
- An official public research enquiry route, a documented platform and a suggested question to establish whether a lymphoma deployment is relevant.

Each metric opens monthly evidence linked to the original releases. This is a reason to qualify an account, not evidence that pathology caused the delay or that Spotlight could remove it.

## Work saved

- Screens **155,669 raw rows** from three official release files.
- Keeps **2,125 relevant provider metric rows**, including 18 national rows used for reconciliation.
- Joins by ODS code across six months and three separately defined measures.
- Displays **129 NHS trusts** with at least one relevant record. Missing data stays visible.
- Adds dated infrastructure, public enquiry routes and specific qualification questions to selected accounts.
- Separates operational, network-only, implementation and unverified digital evidence.
- Flags Southampton, Newcastle, Leeds and Manchester as published Spotlight relationships; does not infer that every NPIC member is a customer.
- Exports the filtered shortlist, comparisons and plain-text account briefs with source links.

**Existing alternatives:** [NHS England already provides waiting-time data and a dashboard](https://www.england.nhs.uk/statistics/statistical-work-areas/cancer-waiting-times/). A generic ranking is not the contribution. The additional work here is the product-specific join with service activity, deployment context, relationship checks and prepared account research. This is not an exhaustive market scan of commercial sales-intelligence products.

## Dataset and definitions

The snapshot was retrieved **21 November 2026** and covers **April–September 2026**. It is not a live feed. Releases are provisional and come from different revision vintages. The [manifest](data/manifest.json) preserves original URLs, row counts, hashes, per-file retrieval dates and build time.

| Measure | Exact selection |
| --- | --- |
| Blood pathway outcomes | Provider / FDS / Suspected haematological malignancies (excluding acute leukaemia) / ALL ROUTES |
| Lymphoma service activity | Provider / 31D / Haematological - Lymphoma / First Treatment / ALL MODALITIES |
| Lymphoma treatment context, CSV only | Provider / 62D / Haematological - Lymphoma / ALL ROUTES / ALL MODALITIES |

The [selected-records CSV](data/selected-records.csv) preserves each source file, logical record number (header is record 1), ODS code, month, metric and counts. It includes non-NHS providers and national totals for audit; the UI does not list them as prospects. Trusts are classified as NHS using the published provider name containing “NHS”.

FDS ends when cancer is diagnosed **or ruled out**. It measures the whole referral-to-outcome pathway, not slide-to-report turnaround, lymphoma-only diagnosis, current backlog or biopsy demand. Lymphoma first treatments are a separate cohort; they are not a conversion funnel from FDS. Counts are pathway or treatment events, not unique people. The 62-day data may contain fractional shared-care attribution and is preserved without rounding to whole cases.

### Transparent selection rules

The default six-month shortlist requires:

1. NHS provider, no published Spotlight relationship recorded here.
2. Complete FDS and lymphoma first-treatment monthly series.
3. At least 60 completed blood pathways and 50 lymphoma first treatments.
4. Aggregate FDS performance below 80%, with at least four of six months below 80%.

The three-month view uses at least 30 blood pathways, 25 lymphoma first treatments and two of three months below 80%. These are editable prospecting choices, not validated clinical cutoffs. Aggregate percentages use summed numerators and denominators, never the mean of monthly percentages.

Default order: explicit published AI exploration signal, then operational digital evidence, network evidence, implementation evidence and unverified sites. Within a group, more late outcomes sort first. There is no claimed buying-probability score. Alternate sorts use late outcomes or lymphoma activity.

### Research coverage

Infrastructure and route research is selective, not a complete directory. See [research-notes.json](data/research-notes.json) and [additional-research.json](data/additional-research.json) for the evidence. “Not verified” means not established in this research. Network membership does not establish local go-live; a procurement award does not establish operational use. Historical vendor reports retain their dates. Platform names do not prove integration compatibility.

Public research/innovation routes can help find the right team. Inbox operation and purchasing authority have not been confirmed. A missing relationship flag does not prove the absence of an existing Spotlight relationship. Supplier/partner relationships should be checked with Spotlight before outreach.

## Run and validate

Requires Node.js 20+ and Python 3.10+, standard libraries only.

```sh
npm test
npm run build
```

Serve `dist/` using your static development host. The published GitHub Pages folder is also directly buildless: `index.html` loads `app.mjs`, `core.mjs` and the local JSON snapshot.

Tests cover weighted rates, missing data, known-account exclusions, default and three-month filters, CSV safety, provenance, exact source selection, balanced counts and reconciliation of all selected provider totals against the national totals. If the raw releases are present, tests also verify their hashes and every saved record pointer. The browser checks cover filters, comparisons, source dialogs, exports, copy and mobile layout.

### Reproduce or update the snapshot

```sh
python scripts/fetch_data.py
python scripts/prepare_data.py
npm test
npm run build
```

The fetch script downloads only the three explicitly listed official CSVs. Raw downloads are excluded from Git; their sources and checksums are tracked. Re-running it can fetch revised official files. To advance the observation period, update `SOURCES` and `MONTHS` in `scripts/prepare_data.py`, refresh the infrastructure evidence, and review the snapshot-specific tests and featured account before publishing. Merely rebuilding the app does not refresh the data.

## Privacy and credits

No patient-level data, tracking, backend or automatic outreach. Selected ODS codes are stored only in this browser and can be cleared in the comparison view. Exports run locally. External source links open only when clicked.

Independent project by **Rounak Das**, prepared for an outreach conversation with Spotlight Pathology. Not commissioned or endorsed by Spotlight or NHS England. NHS statistics are public aggregate data; see NHS England's [website terms](https://www.england.nhs.uk/contact-us/privacy-notice/terms-and-conditions/) and original publication pages for reuse conditions. All source organisations retain their rights.
