---
name: testing-test-strategy

description: 'Use when creating a project-wide, risk-based test strategy across products, systems, releases, and testing approaches. Do not use for requirement analysis, individual test cases, automation, execution, or defect investigation; route those requests to sibling testing skills.'
---

# Testing Test Strategy

## Purpose
Create a project-wide, risk-based strategy defining quality objectives, scope, test approach, responsibilities, environments, data, tooling, risks, and quality gates.

## Context First
Read project, business, requirements, architecture, delivery, risk, and existing test assets. Ask when project scope or business context is missing; label risk-model assumptions, constraints, open questions, and residual risk.

## Workflow
1. **Baseline.** Input: project and business context. Action: load standards, rules, checklist, template, and example. Output: strategy evidence inventory.
2. **Scope and risk.** Input: requirements, architecture, and dependencies. Action: map products, systems, journeys, releases, exclusions, and prioritized risks. Output: scope and risk model.
3. **Operating model.** Input: risks and delivery context. Action: define test levels, types, techniques, traceability, environments, data, tools, ownership, and dependencies. Output: test operating model.
4. **Governance.** Input: operating model and constraints. Action: define entry, exit, suspension, resumption, escalation, and release gates. Output: measurable governance model.
5. **Generate and validate.** Input: completed model. Action: populate templates and apply the quality gate. Output: strategy and findings log under `working-artifacts/`.

## Output Contract
Create `Test-Strategy-<Project-Name>.md` and, when findings exist, `Findings-Test-Strategy-<Project-Name>.md` under `working-artifacts/`. Include scope and exclusions, objectives, risks and mitigations, operating model, ownership, dependencies, measurable gates, assumptions, constraints, open questions, and residual risks.

## Decision Rules
1. Missing scope or objective blocks finalization; request clarification.
2. Incomplete or contradictory requirements are recorded and linked to `testing-analyze-requirements`; one story cannot redefine the project strategy.
3. Missing risk context requires an explicit qualitative model with labeled assumptions.
4. Excluded test types require a reason.
5. Constraints require risk-based prioritization and residual-risk documentation.
6. Unmeasurable entry or exit criteria keep the strategy `Draft` and create clarification findings.
7. Multiple products, systems, teams, or releases share one strategy with documented exceptions and local gates.

## Quality Gate
- [ ] Scope, exclusions, objectives, critical journeys, and risks are explicit.
- [ ] Test model, traceability, environments, data, tools, ownership, and dependencies are defined.
- [ ] Entry, exit, suspension, and resumption criteria are measurable.
- [ ] Assumptions, constraints, questions, residual risks, and mitigation owners are recorded.
- [ ] Required names, location, template, and review checklist are satisfied.

## Knowledge Sources
- Standard: `references/standards/test-strategy-standard.md`
- Rules: `references/rules/test-strategy-rules.md`
- Checklist: `references/checklists/test-strategy-review-checklist.md`
- Template: `references/templates/test-strategy.template.md`
- Example: `references/examples/test-strategy-example.md`
- Also apply repository testing instructions and project-specific standards.

## Related Skills
- `testing-analyze-requirements`
- `testing-design-test-case`
- `testing-review-test-case`
- `testing-implement-automation`
- `testing-analyze-bug`
