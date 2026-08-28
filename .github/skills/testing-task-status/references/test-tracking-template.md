---
name: test-report-template
description: 'Defines a scalable portfolio Markdown test-report structure for many user stories, test cases, scripts, runs, and result files.'
---

# Test Report: <Release, Product, Project, or Result Set>

## Report Metadata

| Item | Value |
| --- | --- |
| Report scope | <release/product/project/result folder> |
| Scope type | <functional, non-functional, or both> |
| Report status | <Draft or Final> |
| Report generated date/time | <YYYY-MM-DD HH:mm timezone> |
| Result input | <file or folder path> |
| Result files inspected | <count> |
| Requirements/use cases in scope | <count> |
| User stories in scope | <count> |
| Summary basis | <latest-run, selected-runs, or all-runs> |
| Detailed evidence location | <path, index, or Not Available> |

## Portfolio Summary

| Metric | Total |
| --- | ---: |
| User stories | <count> |
| Features/modules | <count> |
| Acceptance criteria/requirements | <count> |
| Total distinct test cases | <count> |
| Automated test cases | <count> |
| Manual test cases | <count> |
| Test scripts | <count> |
| Test runs | <count> |
| Passed | <count> |
| Failed | <count> |
| Blocked | <count> |
| Skipped | <count> |
| Not Run | <count> |
| Not Available | <count> |
| Execution start | <YYYY-MM-DD HH:mm:ss timezone or Not Available> |
| Execution end | <YYYY-MM-DD HH:mm:ss timezone or Not Available> |
| Total execution duration | <HH:mm:ss or Not Available> |
| Overall status | <Passed, Failed, Blocked, Incomplete, or Draft> |

Counting rules: count each distinct test case once in the portfolio total. Count a case executed manually and automatically once, with both outcomes represented in the roll-up or linked detail. Do not sum the same case across repeated runs unless the metric is explicitly labeled run-execution count.

## Requirement Summary

Use one row per requirement, user story, or use case source. Link to detailed traceability when a source contains many acceptance criteria.

| Requirement ID | Requirement/User Story/Use Case | Source Artifact | Acceptance Criteria/Rules | Linked Test Cases | Scripts | Latest Run | Coverage | Status | Evidence/Detail Link |
| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- | --- |
| <ID> | <name> | <path> | <count> | <count> | <count> | <run ID or Not Run> | <Covered/Partial/Uncovered> | <status> | <path or URL> |

## User-Story Summary

Use one row per user story. Link to case-level detail when a story contains more cases than can be reviewed in this report.

| User Story ID | User Story/Feature | Requirements or ACs | Test Cases | Automated | Manual | Passed | Failed | Blocked | Skipped | Not Run | Coverage | Latest Run | Execution Window | Duration | Status | Evidence/Detail Link |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- |
| <US-ID> | <name> | <count> | <count> | <count> | <count> | <count> | <count> | <count> | <count> | <count> | <Covered/Partial/Uncovered> | <run ID> | <start to end> | <duration> | <status> | <path or URL> |

## Result Files Inspected

| File | Format | Read Status | User Stories Found | Test Cases Found | Runs Found | Notes |
| --- | --- | --- | ---: | ---: | ---: | --- |
| <path> | <JSON/XML/Markdown/Text/HTML> | <Read/Unreadable/Unsupported> | <count or N/A> | <count or N/A> | <count or N/A> | <summary or reason> |

## Playwright Run Summary

Complete when Playwright evidence is present. Keep runner status separate from case-level outcomes.

| Run ID | Evidence Source | Command/Reporter | Runner Status | Case-Level Statuses | Discovered | Passed | Failed | Skipped | Duration | Date/Time | Environment | Evidence |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| <run ID> | <console/.last-run.json/HTML/JUnit/test-results> | <command or reporter> | <status> | <Yes/No/Partial> | <count> | <count> | <count> | <count> | <duration> | <date/time> | <environment> | <path> |

Playwright rule: treat runner status and case-level status as separate fields. A runner status of `passed` means the runner completed without a recorded failure; it does not mean every discovered test passed.

## Automation Script Summary

Use one row per script, suite, or generated automation artifact. Link the full script-to-case mapping when large.

| Script ID/Path | Framework | User Stories | Test Cases | Latest Run | Passed | Failed | Skipped | Not Run | Duration | Status | Detail Link |
| --- | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| <path> | <Playwright/JMeter/etc.> | <IDs or count> | <count> | <run ID> | <count> | <count> | <count> | <count> | <duration> | <status> | <path or URL> |

## Manual Execution Summary

Use one row per user story, test cycle, or result batch; link case-level evidence when needed.

| Batch/Cycle | Tester or Team | User Stories | Test Cases | Passed | Failed | Blocked | Skipped | Not Run | Execution Window | Duration | Environment | Evidence |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| <cycle> | <name/team> | <IDs or count> | <count> | <count> | <count> | <count> | <count> | <count> | <start to end> | <duration> | <environment> | <path or URL> |

## Test Run Summary

Use one row per run, not one row per test case.

| Run ID | Run Type | Scope | User Stories | Scripts | Cases Executed | Result | Start | End | Duration | Environment | Command/Trigger | Evidence |
| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| <run ID> | <Manual/Automated/Mixed> | <suite or release> | <count> | <count> | <count> | <status> | <date/time> | <date/time> | <duration> | <environment> | <command or trigger> | <path or URL> |

## Traceability Roll-up

Use one row per requirement or acceptance-criterion group. For very large matrices, save the full matrix separately and link it here.

| User Story | Requirement/AC Range | Test Cases | Covered | Passed | Failed | Blocked/Skipped | Coverage Status | Evidence/Detail Link |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| <US-ID> | <AC-1 to AC-n> | <count> | <count> | <count> | <count> | <count> | <Covered/Partial/Uncovered> | <path or URL> |

## Failure, Blocker, and Risk Summary

| ID | Severity | User Story/Run | Test Case or Script | Result | Summary | Evidence | Owner/Next Action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <finding ID> | <Critical/High/Medium/Low> | <scope> | <ID or path> | <Failed/Blocked> | <fact-based summary> | <path or URL> | <action or owner> |

## Detailed Evidence Index

| Detail Artifact | Covers | Format | Source Result Files | Purpose |
| --- | --- | --- | --- | --- |
| <path or URL> | <stories, scripts, or case range> | <Markdown/JSON/XML/HTML> | <paths> | <case-level results, full traceability, screenshots, or logs> |

## Assumptions, Risks, and Open Questions

- <Assumption, limitation, unreadable file, missing metadata, or owner action>

## Quality Gate

- [ ] Every supplied result file is listed with read status and extracted counts.
- [ ] Every requirement, user story, or use case source is summarized or explicitly marked unavailable.
- [ ] Portfolio totals reconcile with user-story, script, manual-batch, and run summaries.
- [ ] Distinct-case and run-execution counting rules are stated and applied consistently.
- [ ] Playwright runner status is separated from per-test outcomes.
- [ ] Large case-level datasets are linked or partitioned rather than duplicated in the summary.
- [ ] Manual and automated results have evidence or are marked `Not Available`.
- [ ] Dates, times, durations, environments, scripts, runs, and evidence links are recorded.
- [ ] Failures, blockers, assumptions, risks, and open questions are visible.
- [ ] Overall status is supported by the reported evidence.
