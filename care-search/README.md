# Care Search

[Open the working tool](https://rounakdas07.github.io/evidence-check/care-search/)

Find CQC-registered care providers, inspect their locations and build a shortlist for commercial research. Built by **Rounak Das** as an independent prototype for Sona.

## What works

- Real directory: **18,145 providers and 30,628 registered care locations** from CQC's **19 November 2026** file.
- Search provider names, CQC brands, location names, towns and postcodes. Postcodes work with or without spaces.
- Filter by provider size, region, local authority and any of six care service types. The initial view shows 672 providers with 5–50 care registrations.
- Open a provider to see its registered locations, source links, recorded website, company numbers and per-location care-home beds where available.
- Save providers and notes locally, then export a genuine **.xlsx** workbook with Providers, Locations and Sources sheets. Headers are frozen, columns are filterable and numeric counts remain numbers.
- Responsive layout, keyboard controls, visible focus, labelled controls, native detail dialogs and an empty state. Press `/` to focus search.

No account, AI model, API key, paid service or backend is required. All searching and exporting run in the browser. Saved lists and notes use local storage on the same browser and origin; they are not sent to a server. Export before clearing browser data. Requires a modern browser with `DecompressionStream` (current Chrome, Safari, Firefox or Edge).

## Data and interpretation

Sources:

- [CQC care directory, 19 November 2026](https://www.cqc.org.uk/system/files/2026-11/19_November_2026_CQC_directory.csv)
- [CQC directory with filters, 2 November 2026](https://www.cqc.org.uk/system/files/2026-11/2_November_2026_HSCA_Active_Locations.ods)
- [CQC guidance and known data delays](https://www.cqc.org.uk/about-us/transparency/using-cqc-data)

A provider is **one CQC provider ID**, not an ultimate corporate group. Brands and shared websites do not cause legal entities to be merged. Counts are distinct CQC location IDs, which can represent branch offices and dual registrations rather than distinct physical premises. They do not estimate employees, residents, occupancy, demand, sales intent or Sona customer status.

The dataset includes locations with at least one of: nursing homes, residential homes, homecare agencies, supported living, supported housing and shared lives. All other service types are excluded. CQC regulates services in England; the region filter retains registered address labels as published, including a few outside England or with missing region data.

Provider size filters use the provider's total included care locations. Region, authority and service conditions must match **the same location**. Selected service types are combined with OR. The table shows the matching count and the provider's total when different. Opening a provider shows **all** its included locations. The Excel Locations sheet includes only the current search's matching locations; its Providers sheet also includes total counts. Saved view ignores directory filters and can be searched separately.

Provider websites, company numbers, CQC brands, care-home beds and dual-registration information come from the 2 November ODS file. Location-level enrichment is joined only when both location and provider IDs agree. Missing or non-applicable bed counts stay blank. Beds are shown per registration, never aggregated; dual-registration primary IDs are preserved in Excel. Phone numbers, postcodes and company numbers remain text in Excel. All strings are written as OOXML inline strings, never formulas.

CQC reports publication delays, including registration cancellations. **This is a fixed snapshot, not a live feed.** Verify source records before action. No ratings are inferred or combined across services.

Contains Care Quality Commission information licensed under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). This project is not affiliated with or endorsed by CQC or Sona.

## Rebuild and verify

Buildless HTML/CSS/JavaScript. The compressed data shards total approximately 2 MB. A manifest records the schema, snapshot dates, counts, original URLs and SHA-256 digests of the downloaded inputs.

```sh
python scripts/build_data.py /path/to/cqc-directory.csv /path/to/cqc-filters.ods
node scripts/verify.mjs
```

The data builder uses Python's standard library, streams the large ODS XML and deduplicates by official IDs. Its source-date guard requires an explicit metadata update before rebuilding from a newer snapshot.

For a local web server, serve this directory over HTTP. For managed preview, copy the static files and data into `dist/`, matching `.openai/hosting.json`. `dist/` is an ignored local preview artifact; GitHub Pages serves this folder's root files.

Verification covers source counts and unique IDs, range and cross-filter correctness, provider and postcode lookup, empty results, saved-list independence, safe website protocols and Excel structure. The generated workbook is also opened with openpyxl to check types, headers, filters and formula-safe text. Browser checks cover directory use, persistence, downloads and mobile layout.

## Code

- `app.js`: interface, local shortlist and export orchestration
- `core.js`: data preparation and search/filter logic
- `xlsx.js`: dependency-free OOXML ZIP workbook writer
- `scripts/build_data.py`: reproducible dataset transformation
- `scripts/verify.mjs`: data and behaviour checks

Application code: MIT (see LICENSE). CQC data: OGL v3.0.
