# Senior Tester Review — Requirements and User Stories

**Project:** Mobile Phone Shopping Web App  
**Release:** MVP 1.0  
**Review scope:** Requirements baseline and guest-shopping user stories  
**Reviewer role:** Senior Test Engineer  
**Review date:** 2026-08-28  
**Status:** Review completed  
**Verdict:** Ready for Test-Case Design (pending stakeholder sign-off)

## 1. Reviewed Artifacts

| Artifact | Location | Review purpose |
| --- | --- | --- |
| Product Brief | `Docs/Product_brief.md` | Source of truth and agreed MVP scope |
| Requirements | `working-artifacts/requirements/mobile-phone-shopping/requirements.md` | Functional, business, data, API, and NFR baseline |
| User Stories | `working-artifacts/user-stories/mobile-phone-shopping/user-stories.md` | Story readiness, acceptance criteria, and traceability |

## 2. Executive Summary

The requirements and user stories provide good coverage of the main guest-shopping happy path. The eight stories are logically ordered from product discovery through confirmation, contain positive, negative, and boundary scenarios, and include traceability to functional requirements, business rules, and Product Brief acceptance criteria.

The initial review identified several unresolved decisions that affected expected results and security/testability. The BA has now resolved those findings through the controlled MVP decision register `DEC-01` to `DEC-11` in the requirements and user stories. The backlog is ready for test-case design, subject to Product Owner/Developer/Test Lead sign-off on those decisions; it is not yet evidence of implementation or release quality.

The resolved decisions cover:

- Duplicate-product add behavior is inconsistent between clamping the quantity and rejecting the request.
- Guest order-confirmation retrieval has no defined ownership/access rule, creating a potential order-data exposure risk.
- Input validation, API error responses, search semantics, and stale-cart behavior are not specific enough for deterministic tests.
- Performance and accessibility requirements are present but not measurable enough for a quality gate.

These are now defined by `DEC-01` to `DEC-11` and must be treated as the current baseline.

## 3. Completeness Assessment

### Covered well

- Product list, search by name and brand, product details, stock visibility.
- Add-to-cart, duplicate cart item, quantity increase/decrease, remove, totals.
- Guest checkout with required and optional fields.
- COD-only payment behavior.
- Server-side stock validation and server-derived order totals.
- Order creation, order number, Pending status, inventory reduction, cart clearing.
- Confirmation details and unknown-order negative case.
- MVP out-of-scope boundary.
- Traceability from Product Brief acceptance criteria to requirements and stories.

### Missing or insufficiently defined

- Search matching semantics and empty-search behavior.
- Exact validation rules for name, phone, city, address, email, and postal code.
- Consistent behavior when duplicate-add quantity exceeds stock.
- Behavior when stock changes and an existing cart quantity becomes invalid.
- API response schemas, status codes, error codes, and safe error-message contract.
- Access control/privacy behavior for `GET /api/orders/:orderNumber` in an anonymous system.
- Idempotency or duplicate-submit behavior for Place Order.
- Measurable performance workload and accessibility acceptance criteria.
- Explicit test data reset/isolation requirements for inventory-changing tests.

## 4. Quality Assessment

| Dimension | Assessment | Evidence |
| --- | --- | --- |
| Clarity | Partially satisfactory | Story goals and main journey are clear, but terms such as “matching”, “valid”, “appropriate validation message”, and “quickly” are not fully defined. |
| Consistency | Needs revision | US-003 says duplicate add uses `min(Q + N, current stock)`, while another criterion says the request may be rejected or constrained. |
| Testability | Partially satisfactory | Most business outcomes are observable, but exact input rules, API contracts, response behavior, and privacy rules are incomplete. |
| Traceability | Good | Requirements map to Product Brief ACs and stories map to FR/BR/AC identifiers. |
| Scope control | Good | Out-of-scope capabilities are explicitly repeated and bounded. |
| Risk readiness | Needs clarification | Inventory concurrency, guest order access, and duplicate submission need decisions before approval. |

## 5. Findings

### F-001 — Duplicate add behavior is inconsistent

**Severity:** High  
**Category:** Business rule consistency / testability  
**Status:** Open  
**Evidence:** Requirements `BR-03` and `FR-CART-04` state that adding an existing product increases its quantity. `US-003` acceptance criterion 3 specifies clamping to `min(Q + N, current stock)`, while acceptance criterion 5 allows the request to be rejected or constrained when above stock.

**Impact:** Two conforming implementations can produce different results for the same input. Tests cannot determine whether the expected result is a capped cart quantity, a rejected request with no mutation, or a partial update.

**Recommendation:** Choose one contract and state it identically in requirements, story, API behavior, and tests. Recommended MVP contract: reject the entire add request when `existing quantity + requested quantity` exceeds current stock; keep the cart unchanged and return a deterministic validation error. If capping is preferred, define the resulting quantity, user message, and response status explicitly.

### F-002 — Anonymous order retrieval may expose another customer's data

**Severity:** High / Security  
**Category:** Authorization and privacy  
**Status:** Blocking clarification  
**Evidence:** `FR-ORDER-11` and `US-008` require retrieving an order using only its order number in an anonymous guest flow. The requirements do not define whether the order number is treated as a secret capability, whether it must be bound to the guest session, or whether any additional verification is required.

**Impact:** A guessed, leaked, or enumerated order number could expose customer name, phone number, address, and order details. The current unknown-order test does not cover access to a valid order belonging to another session.

**Recommendation:** Define an explicit access model. For an MVP without authentication, bind confirmation retrieval to the creating guest session and/or use a high-entropy non-sequential public confirmation token. Add a negative test for a different session requesting a valid order and define the expected response without leaking order existence or personal data.

### F-003 — Search semantics are not deterministic

**Severity:** Medium  
**Category:** Functional testability  
**Status:** Open  
**Evidence:** `FR-PROD-03`, `FR-PROD-04`, and `US-001` say products “matching” a search term but do not define partial versus exact matching, case sensitivity, whitespace trimming, combined name-and-brand behavior, or empty search behavior.

**Impact:** Search tests may disagree about results such as `apple`, `Apple`, `  Apple  `, `iPhone`, or an empty query. Database/provider behavior can also vary.

**Recommendation:** Define search as case-insensitive partial matching after trimming whitespace, with an empty query returning all active products, unless the Product Owner chooses another rule. Define whether name and brand are OR-matched or separately selected.

### F-004 — Checkout field validation lacks constraints

**Severity:** High  
**Category:** Data validation / testability  
**Status:** Open  
**Evidence:** Requirements define required versus optional fields and an optional email format check, but do not define whitespace-only handling, minimum/maximum lengths, allowed characters, phone format, postal-code format, or maximum payload size. `OQ-03` leaves phone rules open.

**Impact:** Boundary, invalid-input, security, and accessibility tests cannot be designed consistently. Unbounded fields can also create storage, UI, and abuse risks.

**Recommendation:** Define field contracts before test-case approval: trim policy, min/max lengths, accepted character sets, phone format/locale, postal-code format, email length, and whether optional blank values are normalized to null. Apply the same contract in UI and server validation.

### F-005 — Stale cart behavior is unresolved

**Severity:** High  
**Category:** Inventory reliability / state transition  
**Status:** Blocking clarification  
**Evidence:** `BR-02` requires quantity to be within current stock. `US-004` mentions stale stock but only says to “handle” it safely, and its open question asks what happens when a cart item becomes out of stock before checkout.

**Impact:** A cart may contain quantity greater than current stock. The expected user-visible behavior, whether the item is automatically adjusted or checkout is blocked, and whether the cart is mutated are not defined.

**Recommendation:** Define the state transition. Recommended contract: retain the cart unchanged, block checkout/order submission, identify the affected product and current stock, and require the shopper to adjust or remove it. Add UI and API tests for stock changed to zero and stock changed below requested quantity.

### F-006 — Order submission idempotency is not defined

**Severity:** High  
**Category:** Reliability / duplicate order risk  
**Status:** Open  
**Evidence:** `US-007` covers successful submission and inventory transaction but does not define behavior for double-click, browser retry, network timeout after server success, or repeated identical POST requests.

**Impact:** A guest may create duplicate orders and reduce inventory twice when the client retries or submits more than once.

**Recommendation:** Define whether Place Order is protected by a client-generated idempotency key, session/order-in-progress lock, or another MVP mechanism. Add tests for rapid duplicate submission and retry after an ambiguous response.

### F-007 — API error contract is missing

**Severity:** Medium  
**Category:** Integration / testability  
**Status:** Open  
**Evidence:** API capabilities list endpoints, but requirements do not define response schemas, HTTP status codes, error codes, validation error field mapping, malformed JSON behavior, missing session behavior, or server-error behavior.

**Impact:** API tests and frontend error handling cannot assert stable outcomes. Different endpoint implementations may return incompatible contracts.

**Recommendation:** Define a minimal API contract for success and failure responses, including status codes for not found, validation failure, stock conflict, empty cart, unsupported payment, and unexpected server errors. Define a stable machine-readable error code and field-level validation structure.

### F-008 — Order number uniqueness and format are insufficient for deterministic tests

**Severity:** Medium  
**Category:** Data integrity / testability  
**Status:** Open  
**Evidence:** `BR-13` requires uniqueness, while `OQ-04` leaves the exact format open. `US-007` verifies persistence and uniqueness but does not define collision handling or whether the number is sequential, date-based, or opaque.

**Impact:** Tests can verify non-empty and uniqueness, but cannot validate format, collision recovery, or safe public exposure. Sequential identifiers also increase enumeration risk for anonymous confirmation retrieval.

**Recommendation:** Define a public order-number/token contract and collision behavior. Coordinate this decision with F-002 so the public identifier is not both predictable and the sole access control.

### F-009 — Performance requirement is not an executable quality gate

**Severity:** Medium  
**Category:** Non-functional testability  
**Status:** Open  
**Evidence:** `NFR-02` specifies approximately 2 seconds under “normal workshop conditions” but does not define endpoint/page scope, percentile, concurrency, payload size, environment, or allowed error rate.

**Impact:** A performance test cannot produce an objective pass/fail result.

**Recommendation:** Define a measurable baseline, for example p95 response time <= 2 seconds for named API/page journeys at a stated concurrency and error-rate threshold, with the test environment documented. Treat the current statement as an indicative target until refined.

### F-010 — Accessibility acceptance criteria are absent

**Severity:** Medium  
**Category:** Accessibility / usability  
**Status:** Open  
**Evidence:** The requirements mention responsive UI and the stories mention keyboard use in notes, but there are no explicit criteria for semantic labels, keyboard navigation, focus visibility, error association, contrast, or mobile touch targets.

**Impact:** Accessibility cannot be objectively assessed, and critical checkout errors may be unusable with assistive technology.

**Recommendation:** Add applicable WCAG 2.2 AA-oriented acceptance criteria for product navigation, quantity controls, form labels/errors, focus order, focus visibility, status announcements, and responsive behavior.

### F-011 — Test data reset and inventory isolation are not defined

**Severity:** Medium  
**Category:** Test environment / repeatability  
**Status:** Open  
**Evidence:** The Product Brief requires seed data and inventory reduction, but the requirements and stories do not define how tests reset the SQLite database, isolate guest sessions, or restore stock after order tests.

**Impact:** Tests that place orders mutate shared inventory and may fail depending on execution order, violating independent and repeatable test expectations.

**Recommendation:** Define a test-data strategy: deterministic database reset/seed per suite or test, unique session IDs per test, and a dedicated test database. Include known product IDs, stock values, and a way to prepare zero-stock and boundary-stock cases.

## 6. Traceability Review

| Area | Result | Evidence |
| --- | --- | --- |
| Product Brief to requirements | Pass | Requirements include source references and an AC-01 to AC-15 coverage table. |
| Requirements to user stories | Pass with risk | All functional requirement groups map to one or more stories in the story traceability matrix. |
| User stories to acceptance criteria | Pass | Each story has explicit acceptance criteria, including negative/boundary cases. |
| Acceptance criteria to future test cases | Partial | Scenarios can be derived, but deterministic expected results are blocked by F-001, F-002, F-004, F-005, F-007, and F-011. |
| NFR to executable tests | Partial | Security, performance, and accessibility themes are present but need measurable contracts. |

## 7. Quality Gate

| Gate | Status | Notes |
| --- | --- | --- |
| Requirements and stories are in scope | Pass | MVP boundaries are clear and repeated. |
| Functional coverage is complete for happy path | Pass | Browse through confirmation is covered. |
| Positive scenarios are represented | Pass | Every major flow has positive acceptance criteria. |
| Negative scenarios are represented | Partial | Important negative cases exist, but stale-cart and cross-session order access are unresolved. |
| Boundary conditions are represented | Partial | Quantity boundaries are covered; field and search boundaries are not defined. |
| Business rules are consistent | Fail | F-001 creates conflicting duplicate-add outcomes. |
| Security/privacy expectations are testable | Fail | F-002 leaves valid-order access control undefined. |
| API contract is testable | Partial | Endpoints are named, but response/error contract is absent. |
| NFRs are measurable | Fail | Performance and accessibility gates are not objective enough. |
| Test data is repeatable | Fail | Inventory reset and session isolation are unspecified. |
| Traceability is explicit | Pass | Requirement, story, and Product Brief mappings are present. |

## 8. Clarification Questions

### Product Owner decisions

1. When adding an existing product would make total quantity exceed current stock, should the system reject the whole request or cap the quantity? What message should the shopper see?
2. Is product search exact or partial? Is it case-insensitive? Should whitespace be trimmed? What should an empty search return?
3. What are the exact validation rules and length limits for full name, phone, address, city, email, and postal code?
4. When stock drops below a cart quantity, should checkout be blocked with an actionable message, or should the cart be automatically adjusted?
5. What is the public order-number format, and is it intended to be a secret capability or only a display identifier?
6. What accessibility target and browser/device support matrix should be used for MVP acceptance?

### Developer and Test Lead decisions

7. How will a guest order confirmation be protected from access by another session?
8. What response status, error code, and error payload will each API validation/conflict/not-found case return?
9. How will duplicate Place Order requests and retry-after-timeout behavior be handled?
10. What performance workload, percentile, error threshold, and environment define the 2-second target?
11. How will tests reset the database and restore inventory so that tests remain independent?

## 9. Assumptions Used During Review

- The Product Brief is the authoritative business source.
- MVP remains anonymous and supports COD only.
- Server-side validation is mandatory and server-side product price/stock are trusted.
- SQLite/Prisma transaction support is available.
- No production deployment or external payment/shipping integration is in scope.

These assumptions do not resolve the blocking findings and must not be treated as approved product decisions.

## 10. Testing Risks

### High

- Unauthorized order-data exposure through order-number retrieval.
- Duplicate orders or double inventory reduction after retries/double submission.
- Overselling or inconsistent cart behavior when inventory changes.
- Inconsistent implementation of duplicate-add overflow behavior.
- Non-repeatable tests caused by shared mutable inventory.

### Medium

- Inconsistent search results across case/whitespace/partial-match inputs.
- Inconsistent validation and frontend error handling because API error payloads are undefined.
- Unverifiable performance target.
- Checkout accessibility defects.

### Low

- Product image fallback and currency display decisions affect presentation tests but do not block core order integrity once defined.

## 11. Readiness Decision

**Status: Ready for Test-Case Design (pending stakeholder sign-off)**

The requirements and user stories are now sufficiently deterministic for risk-based test-case design because F-001 through F-011 have been resolved by DEC-01 through DEC-11. The Product Owner, Developer, and Test Lead should sign off the decision register before implementation and automation baselines are finalized.

Release approval still requires implementation evidence, passing tests, security checks, performance evidence, accessibility checks, and repeatable test-data setup. No quality gate should be marked passed solely because the happy path is described.

## 12. Recommended Next Actions

### Completed BA resolution

- F-001 through F-011 are resolved through DEC-01 to DEC-11.
- Requirements, user stories, data implications, API implications, and acceptance criteria were synchronized.

### Immediate next steps

1. Obtain stakeholder sign-off for DEC-01 to DEC-11.
2. Create risk-based functional, security, performance, accessibility, and API test cases.
3. Implement the session binding, idempotency key, API error envelope, transaction behavior, and dedicated test database strategy.
4. Review test cases before Playwright automation.

## 13. Suggested Routing

- Route clarified requirements back to BA/Product Owner for baseline update.
- Route API, transaction, session, and order-access decisions to Developer Agent.
- Route security, repeatability, performance, accessibility, and negative scenarios to Test Agent.
- Do not begin automation handoff for order confirmation or order submission until F-002, F-005, F-006, and F-011 have accepted decisions.
