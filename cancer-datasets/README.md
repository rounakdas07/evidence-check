# Cancer Dataset Finder

[Open the working tool](https://rounakdas07.github.io/evidence-check/cancer-datasets/)

Find oncology datasets by cancer, treatment, data type, measured outcome and access route. Built by **Rounak Das** as an independent prototype for Big Picture Bio.

## Why it is useful

Research data are spread across repositories, papers and institutional portals. This directory puts the key selection questions in one place: what was measured, in what material, with which outcomes, and how can it be accessed?

The initial catalogue contains **22 curated resources**: individual patient cohorts, tumour atlas collections and cell-line screens. These are resource entries, not 22 independent cohorts. It includes named treatment-response cohorts such as Gide, Riaz and IMvigor210; single-cell/spatial resources; and preclinical screens such as NCI ALMANAC and DrugComb.

## Working features

- Search names, accessions, treatments, cancer types and keywords.
- Combine cancer, data-type, outcome, study-material and access filters.
- Start with treatment-linked patient outcomes, single-cell resources or measured combination screens.
- Open a record to inspect access requirements, source links, practical uses and limitations.
- Save a private browser-local shortlist and research notes.
- Export the visible results or complete shortlist as a UTF-8 CSV with sources and notes, suitable for Excel.
- Copy a URL that reproduces the search. It does not contain saved resources or notes.
- Use responsive phone and desktop layouts, keyboard controls and labelled inputs. Press `/` to focus search.

No account, backend, model, API key, analytics or third-party runtime dependency is required. The app fetches its small local metadata file once; searches and exports run in the browser.

## Data interpretation

See [SOURCES.md](SOURCES.md) for the source register and verification limits. Metadata was reviewed on **20 November 2026**. Original repositories and publications remain authoritative. Some official metadata was verified through indexed source records where direct page retrieval was blocked. Raw files were not downloaded or validated. The tool hosts only discovery metadata and original source links.

- **Patient response and cell-line viability are separate outcomes.** Cell-line measurements do not establish clinical efficacy.
- **Open / Mixed / Controlled** describe the indexed access route. Registration, data-use terms, application eligibility and commercial-use permissions must still be checked.
- Some entries aggregate or reprocess other listed resources. Do not sum entries as independent validation datasets.
- A cancer filter also includes entries marked **Pan-cancer**. This is broad coverage, not a guarantee that a chosen cancer is present in every collection.
- **Bulk RNA** includes microarray expression where the record states this. It does not always mean RNA sequencing.
- An empty outcome/treatment field means it is not established in this directory, not that it is absent from every underlying file.
- Publication year refers to the supporting study or resource. Undated ongoing collections appear last in date sorting.

Search terms are matched with AND across indexed text, with punctuation normalised. All selected filters and the active quick-search preset apply together. The Shortlist view ignores directory filters; it always shows all saved resources. Saved data remain in the same browser and origin. Clearing browser storage removes them. If storage is blocked, the UI warns that the list lasts only for the session. Export before leaving.

The CSV includes all visible resources and source links. It quotes multiline text and neutralises leading spreadsheet-formula characters in text fields, including private notes. It is a CSV, not an `.xlsx` workbook.

## Run and verify

Serve this directory over HTTP with any static server. GitHub Pages serves this subdirectory directly. There is no build step or package install.

```sh
npm test
npm run verify
```

Verification checks source metadata, unique IDs, access classifications and primary links, plus cross-filter behaviour, patient-versus-cell-line separation, combination collections, saved-state recovery, shared URLs and safe CSV escaping. Browser QA covers live interactions and responsive layouts. The data are a fixed curated snapshot, not an automated feed.

## Maintenance

Edit `data.json` and its matching `SOURCES.md` entry together. Preserve stable record IDs. Update the checked date only after reviewing the underlying sources, then run the verification commands. Local preview output and configuration are ignored and are not part of the public app.

Application code and original metadata summaries: MIT. Original datasets remain subject to their respective terms. This project is not affiliated with or endorsed by Big Picture Bio or any dataset owner.
