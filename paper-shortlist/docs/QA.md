# Verification — 19 November 2026

- Dependency-free core suite: 11 passing tests covering negative findings, mixed human/animal wording, reviews, missing abstracts, manual sentence selection, NBIB/CSV parsing, deduplication, spreadsheet-safe exports, source URLs and example attribution.
- Browser: example loads, Keep/Maybe decisions, Undo, notes and decisions survive a refresh, pasted abstracts are processed, PubMed ID import loads original records, and the downloaded CSV contains the expected decision, original sentence, source link and note.
- The corrected label editor was verified on the deployed GitHub Pages app: typed text immediately replaces the displayed label.
- The final title/abstract query returned 20 of 116 matches in the preview browser. The public site's initial search timed out; the app displays a readable retry/import message. A smaller 10-paper search then succeeded on the deployed public site, loading 10 of 116 matches. The default batch size is 10. Live retrieval depends on Europe PMC availability.
- Responsive layout inspected at a 390 px viewport. Paper details open in a focused view with Keep, Maybe and Skip controls.
- JSON session export was inspected. Browser file-chooser restoration testing was interrupted by an automation stall; session-file upload is not recorded as an end-to-end pass.
- GitHub Pages deployment for commit e9f123b4875e9cd130744dbe899282284b84deee succeeded. The public app and all eight example records loaded successfully.

These checks verify software behaviour, not scientific validity or measured screening accuracy.
