# Test Strategy — Mobile Phone Shopping Web App

## 1. Document Control

| Field | Value |
|---|---|
| Strategy ID | TS-MOBILE-MVP-001 |
| Project | Mobile Phone Shopping Web App |
| Owner | Senior Test Engineer |
| Status | Draft for stakeholder review |
| Version | 1.0 |
| Date | 2026-08-28 |
| Products / systems | React/Vite client, Express REST API, Prisma/SQLite database |
| Related requirements | `working-artifacts/requirements/mobile-phone-shopping/requirements.md` |
| Related user stories | `working-artifacts/user-stories/mobile-phone-shopping/user-stories.md` |

## 2. Purpose and Quality Objectives

### Purpose

Define the risk-based test approach for MVP 1.0 and provide a common quality gate for the anonymous guest-shopping journey from product discovery through order confirmation.

### Quality objectives

- Verify the complete guest happy path: browse/search -> details -> cart -> checkout -> COD -> order -> confirmation.
- Prove server-side enforcement of stock, quantity, price, total, payment method, session, and order-state rules.
- Prevent overselling, duplicate orders, duplicate cart lines, and unauthorized order-data exposure.
- Ensure cart and order tests are deterministic, isolated, and repeatable.
- Verify the MVP UI is keyboard accessible and usable at mobile and desktop viewport sizes.
- Verify p95 latency <= 2 seconds for named API journeys at 5 concurrent users and error rate < 1% in the local workshop environment.

## 3. Project Scope and System Landscape

### In scope

- Product list and active-product filtering.
- Case-insensitive, trimmed, partial search by product name OR brand.
- Product details, stock visibility, quantity boundaries, and unavailable state.
- Anonymous session cart, duplicate-add behavior, quantity updates, removal, totals, and stale-cart handling.
- Guest checkout fields, validation, COD-only payment, and order review.
- Order validation, server-side totals, transaction behavior, idempotency, unique opaque order identifier, Pending status, inventory reduction, cart clearing, and confirmation access.
- Functional API, UI/E2E, integration, security/privacy, accessibility, performance, compatibility, and regression testing.

### Out of scope

- Registration, login, account management, social login.
- Online payment, card, debit, e-wallet, or payment authorization.
- Order cancellation/tracking, reviews, ratings, wishlist, comparison, discounts, promotions, recommendations.
- Admin, product-management, order-management, returns, refunds, shipping provider integration, email/SMS notifications, loyalty features.
- Production-scale load testing; the MVP performance gate is limited to the defined workshop workload.

### Products, systems, and delivery stages

| Area | Responsibility / owner | Criticality | Releases or stages |
|---|---|---|---|
| React/Vite client | Developer Agent | High | MVP functional, accessibility, responsive, E2E |
| Express REST API | Developer Agent | Critical | MVP API, validation, security, integration |
| Prisma/SQLite | Developer Agent | Critical | MVP data integrity, transaction, test reset |
| Test assets and execution | Test Agent | High | Test design, review, automation, evidence |

## 4. Product and Risk Context

### Project-critical journeys and business rules

| ID | Journey or rule | Business impact |
|---|---|---|
| J-001 | Guest discovers a product through browse/search and opens details. | High |
| J-002 | Guest adds a product and manages cart quantity/items. | High |
| J-003 | Guest completes checkout with valid COD data. | Critical |
| J-004 | Order submission validates current stock and creates one consistent transaction. | Critical |
| J-005 | Confirmation is accessible only to the creating guest session. | Critical |
| J-006 | Repeated order submission does not create a duplicate order or inventory reduction. | Critical |

### Risk register

| Risk ID | Risk | Impact | Likelihood | Priority | Treatment / coverage | Owner |
|---|---|---|---|---|---|---|
| RISK-001 | Stock changes between cart and submission cause overselling or incorrect checkout. | Critical | Medium | Critical | API transaction, boundary, stale-cart, and concurrent tests. | Developer / Test |
| RISK-002 | Repeated Place Order creates duplicate orders or reduces inventory twice. | Critical | Medium | Critical | Idempotency API and E2E retry/double-submit tests. | Developer / Test |
| RISK-003 | Guest order retrieval exposes another session's personal data. | Critical | Medium | Critical | Cross-session and missing-session security tests. | Developer / Test |
| RISK-004 | Client manipulates prices, totals, stock, status, or payment method. | High | High | Critical | API tampering and server-source-of-truth tests. | Developer / Test |
| RISK-005 | Duplicate cart line or total calculation is wrong. | High | Medium | High | Cart API/UI tests, decision table, arithmetic assertions. | Developer / Test |
| RISK-006 | Validation differs between UI and API. | High | Medium | High | Equivalence partition and boundary tests at both layers. | Developer / Test |
| RISK-007 | Shared mutable SQLite data makes tests order-dependent. | High | High | High | Dedicated test DB, deterministic reset/seed, unique sessions. | Test |
| RISK-008 | Search or responsive/accessibility behavior is inconsistent. | Medium | Medium | Medium | Search partitions, keyboard checks, viewport/browser matrix. | Test |

## 5. Project Test Operating Model

### Test levels

| Level | In scope? | Objective | Ownership |
|---|---|---|---|
| Unit | Yes | Validate pure calculations, input normalization, quantity rules, order-number/idempotency helpers. | Developer |
| Component | Yes | Validate product/card/cart/form state and accessible UI behavior in isolation. | Developer / Test |
| Integration | Yes | Validate Express + Prisma + SQLite persistence, transactions, session binding, and reset strategy. | Developer / Test |
| API | Yes | Validate REST contracts, validation, business rules, security, and error responses. | Test |
| UI / End to end | Yes | Validate the critical guest journey and key UI errors/responsive behavior. | Test |
| Performance | Yes, bounded | Validate the defined 5-user workshop target, not production capacity. | Test / Developer |

### Test types and techniques

- **Functional:** Equivalence Partitioning for search/form inputs; Boundary Value Analysis for quantity and field lengths; Decision Table Testing for stock/payment/cart/order conditions; State Transition Testing for cart and order states; Use Case Testing for the purchase journey.
- **Regression:** Run smoke tests on every build; run full API/UI regression after changes to cart, checkout, order, schema, session, or shared UI components.
- **Accessibility:** Keyboard-only flow, visible focus, semantic names/labels, form-error association, logical focus order, responsive viewport checks, and automated axe-style scan where tooling is available.
- **Security:** Session-bound order access, IDOR/privacy negative cases, payload tampering, unsupported payment, protected fields, malformed input, safe errors, and no sensitive data in responses/logs.
- **Performance:** p95 API latency <= 2 seconds at 5 concurrent users; error rate < 1% for product list/detail, cart read, and order submission.
- **Compatibility:** Latest supported Chrome and Edge on Windows; Firefox smoke where available; desktop 1280x720 and mobile 390x844 viewports.
- **Exploratory:** Stock mutation during checkout, refresh/back during submission, network interruption after successful POST, empty states, invalid direct URLs, and image fallback.

### Automation approach

Automate deterministic API and integration cases first because they provide fast coverage for inventory, totals, sessions, transactions, idempotency, and error contracts. Automate the critical browser journey and stable UI acceptance cases with Playwright. Keep exploratory UX, visual nuance, and accessibility inspection as complementary manual checks. Do not automate features outside MVP scope.

## 6. Environment, Data, and Dependencies

- **Environment:** Local client at Vite dev server and local Express API with Prisma SQLite. A separate test API/database configuration is required for automation.
- **Platforms:** Windows development environment; Chrome and Edge primary, Firefox smoke; desktop and mobile viewport profiles.
- **Test data:** Deterministic seed products including stock 0, 1, and N fixtures; dedicated test SQLite database; reset/seed before each suite; unique anonymous session ID per test; unique idempotency key per new checkout attempt.
- **Privacy:** Use synthetic names, phone numbers, email addresses, and addresses only. Do not use real customer data.
- **Tools:** Playwright for E2E/API browser checks, Node/npm scripts for setup, Prisma commands for database reset/seed, API client or Playwright request for REST tests, and CI test reports when configured.
- **Dependencies:** Stable API error envelope, session header/identifier contract, idempotency-key persistence, transaction support, product fixtures, and documented client/API base URLs.

## 7. Roles and Reporting

| Role | Responsibility |
|---|---|
| Product Owner / BA | Approve DEC-01 to DEC-11 and scope changes; accept residual business risk. |
| Developer | Implement validation, transaction, session, idempotency, accessibility, and test hooks; fix defects. |
| Test Engineer | Design/review cases, execute planned tests, report evidence, assess quality gate and residual risk. |
| Security / Operations | Review privacy, error exposure, environment, and performance evidence when available. |

**Reporting cadence:** Report test progress, failed cases, open defects, blockers, and residual risks at each validation cycle and before MVP sign-off. Critical defects are escalated immediately.

## 8. Project Quality Governance and Readiness Criteria

### Entry criteria

- [ ] Requirements and user stories are approved, including DEC-01 to DEC-11.
- [ ] Build starts successfully and client/API base URLs are known.
- [ ] Test database can be reset and seeded deterministically.
- [ ] Test product fixtures support stock 0, 1, and N.
- [ ] API error, session, and idempotency contracts are implemented or explicitly mocked.
- [ ] Test cases are reviewed and traceable to requirements/stories.

### Exit criteria

- [ ] All Critical and High test cases pass, or each failure has an approved risk acceptance.
- [ ] Critical happy-path E2E passes from browse/search to confirmation.
- [ ] No open Critical/High defects for order integrity, inventory, payment-method enforcement, session privacy, or duplicate submission.
- [ ] API and UI validation covers required, optional, malformed, boundary, and tampered inputs.
- [ ] Inventory reduction and cart clearing are proven atomic and repeatable.
- [ ] Performance target meets p95 <= 2 seconds and error rate < 1% under defined workload.
- [ ] Accessibility checks pass for keyboard navigation, focus, labels/errors, and responsive viewports.
- [ ] Test report, traceability, environment, and residual risks are recorded.

### Suspension and resumption criteria

- **Suspend when:** test environment is unavailable; database cannot reset; a Critical defect corrupts order/inventory data; or the API contract is unstable enough to invalidate results.
- **Resume when:** environment/data reset is restored, the Critical defect is fixed and regression-tested, and affected test cases are re-baselined.

## 9. Defect and Risk Escalation

- **Critical:** Security/privacy exposure, duplicate order/inventory corruption, overselling, inability to place valid orders, or data loss. Blocks release.
- **High:** Broken major MVP function, incorrect totals/validation, unavailable confirmation, or repeated failures in critical browsers. Blocks release unless formally accepted.
- **Medium:** Significant non-critical usability, compatibility, or recoverable error behavior. Release decision depends on impact.
- **Low:** Cosmetic or minor wording/layout issue with no material functional/accessibility impact.

Escalate Critical/High defects to Developer and Product Owner immediately. The Product Owner owns release decisions; residual security/data-integrity risk requires explicit written acceptance.

## 10. Assumptions, Constraints, and Open Questions

| Type | Description | Owner | Resolution / due date |
|---|---|---|---|
| Assumption | DEC-01 to DEC-11 are accepted as the current MVP decision baseline. | Product Owner | Sign off before test-case approval |
| Constraint | SQLite/local workshop environment limits performance conclusions to the defined 5-user target. | Developer / Test | Record environment with results |
| Assumption | Synthetic test data is sufficient; no production data is needed. | Test | Apply to all test runs |
| Question | Exact browser support beyond Chrome/Edge and Firefox smoke. | Product Owner / Test | Confirm before release |
| Question | Whether automated accessibility scanner is available in CI. | Developer / Test | Confirm before automation |

## 11. Project Traceability and Handoff

| Project objective or risk | Product / system / release coverage | Test case reference |
|---|---|---|
| Guest purchase happy path | Product discovery, cart, checkout, COD, order, confirmation | TC_MOBILE_001, TC_MOBILE_006, TC_MOBILE_013, TC_MOBILE_022 |
| Inventory integrity | Cart boundaries, stale cart, order transaction, concurrency | TC_MOBILE_009, TC_MOBILE_010, TC_MOBILE_019, TC_MOBILE_020 |
| Privacy and protected data | Session-bound order confirmation and tampering | TC_MOBILE_023, TC_MOBILE_024, TC_MOBILE_025 |
| Duplicate prevention | Duplicate cart product and idempotent order submission | TC_MOBILE_007, TC_MOBILE_021 |
| Validation quality | Checkout input partitions and API/UI consistency | TC_MOBILE_014 to TC_MOBILE_018 |
| NFR quality | Accessibility, responsive, performance, repeatability | TC_MOBILE_026 to TC_MOBILE_030 |

**Handoff:** Use this strategy with `working-artifacts/test-cases/TC-FEATURE-Mobile-Phone-Shopping.md`; review test cases before Playwright implementation and execution.
