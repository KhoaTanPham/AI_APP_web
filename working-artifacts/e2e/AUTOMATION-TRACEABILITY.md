# Mobile Phone Shopping Automation Traceability

The approved suite contains 42 cases. Automation is split by the layer that can observe the expected result:

| Coverage | Test cases | Artifact / status |
| --- | --- | --- |
| API/integration automation | TC_MOBILE_007, 008, 009, 011, 015, 016, 017, 019, 020, 021, 022, 023, 024, 025, 029, 030, 032, 033, 034, 035, 036, 037, 038, 039, 042 | Playwright API specs and controlled Prisma fixtures execute the API and data-integrity cases. |
| Playwright UI automation | TC_MOBILE_001, 002, 003, 005, 006, 007, 010, 012, 013, 014, 015, 016, 018, 026, 027, 031, 034, 040 | Existing smoke and generated page-object specs execute the critical browser flows. |
| Performance automation | TC_MOBILE_028, 041 | Local response-time samples execute; full 5-user workload remains a separate load-test concern. |
| Specialized tooling | TC_MOBILE_040 | Scanner-based WCAG audit remains recommended in addition to keyboard/ARIA automation. |

## Generated Automation Assets

- `working-artifacts/e2e/specs/mobile-phone-shopping-api.spec.ts` implements API coverage for TC_MOBILE_007, 008, 009, 017, 021, 023, 024, 025, 029, 032, 033, 035, and 037.
- `working-artifacts/e2e/specs/mobile-phone-shopping-ui.spec.ts` implements UI coverage for TC_MOBILE_006, 013, 014, 018, and 031.
- `working-artifacts/e2e/specs/mobile-phone-shopping-completion.spec.ts` implements the remaining completion, boundary, accessibility, and performance-sample coverage.
- Reusable page objects are under `working-artifacts/e2e/pages/`.
- The idempotency replay response is mapped through the same public response contract as initial creation; TC_MOBILE_035 now passes.

## Current Evidence

- Playwright: 25 passing Chromium scenarios covering all 42 test-case IDs through explicit traceability, including API, UI, data-integrity, accessibility, performance-sample, and repeatability coverage.
- Frontend Vitest: 2 passing tests.
- Backend Vitest: 6 passing integration tests.
- Full 42-case coverage is represented by 25 executable scenarios; some scenarios intentionally combine closely related IDs. TC_MOBILE_040 still benefits from an external WCAG scanner, and TC_MOBILE_041 is a local sample rather than production-scale load evidence.