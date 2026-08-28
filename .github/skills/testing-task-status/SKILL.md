---
name: testing-task-status

description: 'Generates a traceable Markdown testing task report by collecting testing artifacts and Playwright run results from the working-artifacts output folders. Use when summarizing requirements, user stories, test cases, scripts, manual results, automated results, test runs, dates, times, durations, or per-run status. Do not use to design test cases, execute tests, debug failures, or implement automation; route those activities to the appropriate testing skills.'
---

# Testing Task Status

## Purpose

Generate an evidence-based portfolio testing task report by collecting all relevant testing artifacts and Playwright run results. The report shows requirements, user stories, test cases, scripts, what was tested across many user stories, manual and automated results, every discovered test run with its detailed status, execution timing, and linked evidence without duplicating every case in the summary.

## Context First

Start with the supplied result file/folder or the repository testing-artifact root. By default, inspect `working-artifacts/requirements/`, `working-artifacts/test-cases/`, `working-artifacts/test-results/`, `working-artifacts/e2e/`, `working-artifacts/accessibility-test-reports/`, `working-artifacts/test-analysis-reports/`, `working-artifacts/test-reviews/`, `working-artifacts/page-object-reviews-report/`, and `working-artifacts/skill-evaluator-reports/` when they exist. Read every supported file recursively and inspect content rather than relying on filenames alone. Exclude the report output folder to avoid re-ingesting generated reports. Ask only when the source input is missing or unreadable; mark unavailable metadata and traceability instead of inventing them.

## Workflow

1. **Inventory testing artifacts.** Input: supplied paths or the default testing-artifact roots. Action: enumerate every file recursively, classify requirements, user stories, test cases, scripts, result files, reports, and Playwright artifacts, and read each file's detailed content. Output: a complete artifact inventory with unreadable or unsupported files flagged.
2. **Extract evidence and runs.** Input: the artifact inventory. Action: collect requirement IDs, user-story IDs, test-case IDs, script paths, manual outcomes, automated outcomes, run IDs, runner status, per-test status, dates, start/end times, durations, environments, commands, and evidence links. Output: normalized records and one detailed record for each discovered test run.
3. **Build portfolio traceability.** Input: normalized records and linked requirements, user stories, and test cases. Action: group results by requirement, user story, feature, acceptance criterion, script, and run; link detailed case evidence instead of duplicating large tables. Output: scalable roll-up matrices.
4. **Calculate totals.** Input: grouped records and run scope. Action: calculate distinct user-story, test-case, script, manual/automated, result, run, and duration totals without double-counting. Output: portfolio summary metrics.
5. **Generate and validate.** Input: metrics, roll-ups, and evidence links. Action: populate [`test-tracking-template.md`](references/test-tracking-template.md), apply the quality gate, and expose assumptions or missing evidence. Output: a finalized report or clearly marked draft.

## Output Contract

Use [`test-tracking-template.md`](references/test-tracking-template.md). Save the default report under `working-artifacts/testing-status/` as `Test-Status-<YYYYMMDD-HHmmss>.md`.

The required input is one result file or a folder containing result files. Supported formats include Markdown, JSON, XML, JUnit-style XML, Playwright result metadata, Playwright console output, Playwright HTML-report data, and plain-text runner output when their contents expose test outcomes.

For Playwright results, inspect `.last-run.json`, `test-results/`, HTML or JUnit reporter output, and captured console output when supplied. Report runner metadata separately from case-level outcomes: a runner status of `passed` does not make skipped, blocked, or not-run tests passed.

The report must contain:

- **Portfolio Summary section:** reporting scope, user-story count, feature count, total test cases, automated/manual counts, result totals, script count, test-run count, execution window, total duration, and overall status.
- **Requirement Summary section:** one row per requirement, user story, or use case source with its identifier, acceptance-criteria count, linked test cases, and coverage status.
- **User-Story Summary section:** one row per user story with case counts, manual/automated results, coverage, and evidence links.
- **Script and Run Summary sections:** one row per automation script and one row per test run.
- **Detail Evidence section:** result-file inventory, traceability roll-up, failure/blocker summary, and links to source files or partitioned detail reports. Do not inline thousands of case rows.
- **Result vocabulary:** `Passed`, `Failed`, `Blocked`, `Skipped`, `Not Run`, or `Not Available`.
- **Evidence rule:** distinguish observed execution results from planned or unavailable results; do not convert skipped or not-run cases into passes.

## Decision Rules

1. If no result file or folder is supplied, request it before generating a report.
2. If a file cannot be parsed, record it as unreadable with the path and continue with other files.
3. If user-story or test-case context is missing, report traceability as `Not Available`; do not invent requirements.
4. Record every discovered test run separately, including run ID, source artifact, runner status, case-level status counts, scope, command, date, start/end time, duration, environment, and evidence. Use `Not Available` for fields absent from the source.
5. For Playwright, use per-test reporter results when available; use console output or `.last-run.json` only for the totals and statuses they actually expose.
6. If a Playwright runner status is `passed` but cases are skipped or unavailable, report the run as completed with incomplete execution and preserve the case statuses.
7. If a case ran manually and automatically, count it once in portfolio total cases and show both outcomes in the roll-up or linked detail.
8. If multiple test runs exist, show each run separately and state whether portfolio totals are latest-run, selected-run, or all-run totals.
9. If the result set contains more than 100 cases or 20 user stories, summarize by user story, script, and run and link partitioned case-level details.
10. If a result file reports skipped, not-run, or unavailable cases, preserve that status; never convert it to pass.
11. If a failure is unexplained, link the evidence and route investigation to `testing-analyze-bug` rather than diagnosing it here.

## Quality Gate

- [ ] Every applicable acceptance criterion maps to one or more test cases or is explicitly uncovered.
- [ ] Every supplied result file was inspected, or unreadable/unsupported files are listed.
- [ ] Requirements, user stories, test cases, scripts, reports, and Playwright artifacts are collected from all applicable output folders.
- [ ] Playwright runner status is separated from per-test outcomes when Playwright evidence is supplied.
- [ ] Every discovered test run has a separate detailed status record with timing and evidence fields.
- [ ] Portfolio totals reconcile with user-story, script, run, and result roll-ups.
- [ ] Large case-level datasets are linked or partitioned rather than duplicated in the summary.
- [ ] Total, automated, manual, and result counts are internally consistent.
- [ ] Manual results include execution evidence or `Not Available`.
- [ ] Automation scripts and test-run records include paths or explicit unavailable markers.
- [ ] Dates, times, duration, environment, and run scope are recorded.
- [ ] Assumptions, gaps, failures, and open questions are visible.
- [ ] Overall status is supported by the reported evidence.

## Knowledge Sources

- Template: [`test-tracking-template.md`](references/test-tracking-template.md)
- Result source: the supplied result file or folder
- Optional traceability source: supplied user story and test cases
- Shared testing policy: `../testing-design-test-case/references/standards/testing-standard.md`

## Related Skills

- Upstream: `testing-design-test-case`, `testing-review-test-case`
- Downstream: `testing-review-automation`
- Adjacent: `testing-analyze-bug`, `testing-implement-automation`
