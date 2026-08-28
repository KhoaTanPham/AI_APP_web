---
name: testing-review-test-case

description: 'Use when reviewing test-case artifacts for traceability, coverage, quality, duplication, and automation readiness before finalization or handoff. Do not use to generate replacement cases unless requested; route creation and other testing work to sibling testing skills.'
---

# Testing Review Test Case

## Purpose
Review test-case artifacts against the canonical design template and testing standards, producing evidence-based findings and a supported verdict.

## Context First
Read artifacts, requirements, scope, risk context, and local references. Ask when artifact, requirements, scope, or expected behavior is missing; record assumptions and questions without inferring behavior.

## Workflow
1. **Baseline.** Input: artifacts, requirements, scope, and risk. Action: load design references and define the boundary. Output: inventory and assumptions.
2. **Assess.** Input: baseline and cases. Action: evaluate structure, traceability, criteria coverage, fields, techniques, priorities, data, steps, results, duplication, and non-functional concerns. Output: categorized findings.
3. **Determine readiness.** Input: findings and clarification responses. Action: classify severity, blockers, coverage, and automation candidates without rewriting cases. Output: prioritized recommendations.
4. **Report.** Input: findings. Action: populate the review template and record gate and verdict. Output: report under `working-artifacts/test-case-reviews/`.
5. **Route.** Input: verdict. Action: send major revisions to design and approved automation preparation to page-object generation. Output: explicit next action.

## Output Contract
Save `Report-Review-Test-Case-<artifact-name>.md` under `working-artifacts/test-case-reviews/`. Include summary, scope, assumptions, questions, evidence-based findings, traceability, coverage, gate results, and one verdict: `Approved`, `Minor Revision Required`, `Major Revision Required`, or `Blocked`. Do not generate replacement cases unless requested.

## Decision Rules
1. Missing requirements make traceability partial, not silently complete.
2. Ambiguity affecting correctness blocks the verdict and requires clarification.
3. Critical coverage, security, or authorization gaps are `Major Revision Required` unless accepted.
4. Non-blocking findings are `Minor Revision Required`; approve only when gates pass.
5. Route major revisions to `testing-design-test-case` and automation preparation to `testing-generate-page-object`.

## Quality Gate
Confirm the canonical template, standards, and checklist were applied; every applicable check has a status or N/A reason; findings are evidence-based; traceability and coverage are visible; and the verdict follows from findings.

## Knowledge Sources
- Canonical skill: `../testing-design-test-case/SKILL.md`
- Standards and template: `../testing-design-test-case/references/standards/`, `../testing-design-test-case/references/templates/test-case.template.md`
- Review checklist and report: `references/checklists/test-case-review-checklist.md`, `references/templates/test-case-review.template.md`
- Clarification: `references/checklists/clarification-questions.md`, `clarification-rules.md`

## Related Skills
- `testing-design-test-case`
- `testing-generate-page-object`
- `testing-analyze-requirements`
