# Annotation guide · v1.0.0

Task: judge a constructed claim using only its supplied evidence paraphrase. The paper link gives provenance and a review route; outside knowledge must not change the answer to this particular task.

| Label | Rule |
|---|---|
| supported | Every material part follows from the supplied summary. |
| contradicted | At least one material part explicitly conflicts with the summary. |
| not_established | The summary is insufficient to establish the claim. This does not mean the claim is false. |

If explicit contradiction and insufficiency coexist, prefer `contradicted`. Lack of evidence alone is never contradiction. For example, a report confined to one population may not establish the rate in a different subgroup; that is not automatically proof the subgroup has a different rate.

The six source groups each have three claims: a supported observation, an explicit contradiction and an unsupported extrapolation. The repeated source structure is visible; the task is a small demonstration pack, not a concealed benchmark.

## Review process before a serious evaluation

1. Have two qualified reviewers read the original abstract and independently assess whether the paraphrase preserves it.
2. Have them independently label each claim from the paraphrase and record their reasoning.
3. Resolve disagreements, retaining both initial labels, adjudicated label and reasons for changes.
4. Bump the suite version when claim wording, summary wording or a label changes. Do not compare scores across different versions as if they were identical.

That independent process has **not yet been completed** for this release. Current annotations were prepared with AI assistance and checked against the linked abstracts, without independent expert adjudication.

When extending the pack, add realistic boundary cases, new source groups and blind annotation; avoid only obvious absolutes. Keep dataset construction separate from model evaluation. Report model/version, prompt, run date, inference settings, coverage, per-class metrics and case-level errors. Do not train on the answer key and then report evaluation on these same cases.
