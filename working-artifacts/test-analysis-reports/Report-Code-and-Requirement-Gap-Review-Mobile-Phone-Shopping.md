# Code and Requirement Gap Review — Mobile Phone Shopping MVP

**Review date:** 2026-08-28  
**Scope:** Product Brief, requirements baseline, technical design, implemented client/server/shared code, Vitest, and Playwright automation  
**Verdict:** **Improved, but not release-ready; implementation still needs a corrective sprint**

## Findings

### Resolved — Server order total uses a stale client-controlled cart price

**Evidence:** `server/src/services/order.service.ts` calculates `total` and order-item snapshots from `cart.items[].unitPrice`. `CartItem.unitPrice` is written when the item is added and is not refreshed when `Product.price` changes.

**Requirement impact:** BR-08, FR-ORDER-05, FR-ORDER-08, NFR-05, Technical Design sections 5 and 9.

**Risk:** A price change after add-to-cart can produce an order total and snapshot that do not reflect the current server-owned Product price. This violates the explicit server-authoritative pricing contract and can cause financial inconsistency.

**Resolution:** The transaction now loads current Product rows and calculates order totals/snapshots from current Product.price. A dedicated price-mutation regression test is still recommended.

### Partially resolved — Inventory decrement is not concurrency-safe

**Evidence:** `OrderService.create` checks `current.stockQuantity < item.quantity`, then later performs `product.update({ data: { stockQuantity: { decrement } } })`. The check and decrement are separate operations and the update has no `stockQuantity >= requested` predicate.

**Requirement impact:** BR-05, BR-06, BR-07, FR-ORDER-02, FR-ORDER-03, NFR-05, Technical Design section 9.

**Risk:** Concurrent orders can both pass the read check and decrement stock below zero or oversell inventory. The stated transaction alone does not prevent this race.

**Resolution:** Decrement now uses an atomic `updateMany` predicate and checks affected-row count, preventing negative stock for the decrement itself. A concurrent same-cart order test and transaction retry/serialization strategy are still required.

### Partially resolved — Checkout validation does not implement DEC-03

**Evidence:** `server/src/validators/schemas.ts` only uses `min(1)` for required strings. It does not trim, reject whitespace-only input, enforce 200-character text limits, enforce phone 7–20 digits, validate postal code, or enforce email max length 254.

**Requirement impact:** DEC-03, FR-CHECKOUT-01 through FR-CHECKOUT-05, TC_MOBILE_014, TC_MOBILE_015, TC_MOBILE_016, NFR-03.

**Risk:** Invalid or oversized customer data reaches order creation; the server contract differs from the requirements and UI native validation.

**Resolution:** The API schema now trims and bounds text, validates phone/postal/email formats, and normalizes optional blank values. Field-level API regression tests for every boundary are still missing.

### High — Session and idempotency headers are not format-validated

**Evidence:** `server/src/middleware/session.ts` returns raw header strings. `OrderController` and `CartController` only check presence.

**Requirement impact:** Technical Design sections 2, 7, 8 and 11; DEC-05, DEC-06, DEC-07; NFR-04.

**Risk:** Arbitrary or oversized values can be used as session identity or idempotency keys. This contradicts the UUID contract and weakens isolation/replay assumptions.

**Required action:** Validate both headers with bounded UUID schemas and return the standard 400 envelope for malformed values. Add missing, malformed, and valid-header cases.

### Resolved — Product detail endpoint exposes inactive products and returns the wrong error envelope

**Evidence:** `ProductRepository.findById` queries by ID only, without `isActive: true`. `ProductController.get` returns `{ error: 'Product not found' }` instead of `{ error: { code, message, fields? } }`.

**Requirement impact:** FR-PROD-05, FR-PROD-06, FR-DETAIL-01, FR-DETAIL-05, DEC-07, TC_MOBILE_004, TC_MOBILE_031.

**Risk:** Hidden products can be opened directly, and consumers cannot safely parse detail not-found errors consistently.

**Resolution:** Detail lookup now filters active products, validates IDs, and returns the common error envelope. Dedicated API assertions for inactive and unknown IDs are still recommended.

### High — Cart update maps multiple error classes to stock conflict

**Evidence:** `CartService.updateItem` returns `undefined` for missing item, quantity above stock, and a quantity below one is rejected by Zod before service. `CartController.updateItem` maps undefined to 409 `STOCK_CONFLICT`.

**Requirement impact:** FR-CART-05, FR-CART-06, FR-CART-11, DEC-07, TC_MOBILE_009, TC_MOBILE_032.

**Risk:** Non-existent cart item should be generic 404; invalid quantity should be 400; only stock conflict should be 409. Client behavior and API tests cannot distinguish recovery actions.

**Required action:** Return typed service outcomes or domain errors for not-found, validation, and stock conflict, then map each explicitly. Add update/delete unknown-item tests.

### High — Successful order response is not mapped to the shared OrderResponse contract

**Evidence:** `OrderService` returns Prisma order records with `items` containing database fields, but `OrderResponse` expects item snapshots and product-facing fields; `OrderController` serializes the result directly. The frontend uses a cast in `App.tsx`.

**Requirement impact:** FR-ORDER-10, shared contracts, Technical Design sections 5, 6, and 10.

**Risk:** The API shape is coupled to Prisma and can break confirmation rendering or expose persistence details. The frontend cast hides this boundary mismatch.

**Required action:** Add a dedicated order response mapper in the service/controller boundary and remove the frontend cast. Test confirmation response shape explicitly.

### Partially resolved — Frontend does not implement the required product/detail/checkout journey

**Evidence:** `client/src/App.tsx` uses a local `view` state rather than a detail route, has no quantity selector, does not render product short descriptions in the list, does not disable/reject zero-stock products in the UI, has no order-review step, and has no explicit stale-cart or field-error UI.

**Requirement impact:** FR-PROD-02, FR-PROD-06, FR-PROD-07, FR-DETAIL-01 through FR-DETAIL-05, FR-CHECKOUT-04 through FR-CHECKOUT-07, FR-CHECKOUT-09, FR-ORDER-10; TC_MOBILE_005, 006, 010, 014, 016, 018, 031.

**Risk:** The main happy path can reach checkout, but several Must requirements are absent. Current Playwright coverage passes without exercising those missing states.

**Resolution:** The client now renders descriptions, detail quantity boundaries, availability state, review content, field errors, deep-linked unknown-detail state, and stale-cart blocking. Full confirmation and negative-state E2E coverage remains pending.

### Resolved in client flow — Confirmation does not re-fetch the order by session-bound API

**Evidence:** `App.tsx` stores the POST response directly in local React state and renders it. It does not call `GET /api/orders/:orderNumber` after navigation or provide an unknown/unauthorized/retry state.

**Requirement impact:** FR-ORDER-10, FR-ORDER-11, DEC-05, TC_MOBILE_013, TC_MOBILE_023, TC_MOBILE_024.

**Risk:** The required confirmation retrieval capability is not exercised by the UI; refresh/navigation cannot reliably reconstruct confirmation state.

**Resolution:** Successful checkout now re-fetches the order using its order number and the session-bound API wrapper. Refresh/deep-link confirmation behavior and negative-state E2E coverage remain pending.

### Medium — Search behavior relies on provider case sensitivity

**Evidence:** `ProductRepository.findActive` uses Prisma `contains` without an explicit case-insensitive mode or normalization. The UI trims before request, but database matching behavior is provider-dependent.

**Requirement impact:** DEC-02, FR-PROD-03, FR-PROD-04, TC_MOBILE_002.

**Risk:** `APPLE`/`iphone` behavior may differ across SQLite/database configurations despite the E2E test passing against one local setup.

**Required action:** Normalize search consistently or use an explicit supported collation/mode and add brand/name case tests at API level.

### Medium — Error handling does not protect async route handlers uniformly

**Evidence:** `createApp` mounts async controller methods directly. Express 5 generally forwards rejected promises, but repository/database failures are not consistently classified at the controller boundary; order catches all errors and maps them to 409.

**Requirement impact:** DEC-07, NFR-03, NFR-04, TC_MOBILE_029.

**Risk:** Unexpected database failures can be reported as stock/idempotency conflicts, while malformed path values can become internal errors instead of deterministic 400 responses.

**Required action:** Introduce typed domain errors plus one consistent async/error mapping policy; test malformed JSON, invalid IDs, unexpected persistence errors, and safe 500 responses.

### Medium — Setup and documentation are stale

**Evidence:** `README.md` still says the frontend uses a local demo cart and that the API is ready for wiring, while the implementation is API-backed. It documents `5173`, whereas E2E uses `5174`; it does not document root workspace commands, test commands, or test database isolation. Technical Design still labels the implementation as proposed.

**Requirement impact:** NFR-08, Technical Design section 13, developer/test handoff.

**Risk:** A fresh developer can start the wrong architecture or run tests against the development database.

**Required action:** Update README with root install/typecheck/test/build/E2E commands, Prisma initialization, API/client URLs, and test DB behavior. Update Technical Design status after implementation stabilizes.

### Resolved — CI is missing

**Evidence:** No `.github/workflows/ci.yml` exists, although the technical design explicitly requires CI for typecheck, lint, tests, E2E smoke, and build.

**Requirement impact:** Technical Design sections 2 and 13; project quality gate.

**Risk:** The passing local checks are not enforced on changes and Playwright browser installation is not reproducible in automation.

**Resolution:** `.github/workflows/ci.yml` now runs install, typecheck, tests, Playwright Chromium setup, E2E, and build. Lint and an explicit Prisma schema/test database setup should still be added to the workflow.

## Requirement Coverage Summary

| Area | Status | Notes |
| --- | --- | --- |
| Browse active products | Partial | List works, but description is absent and detail endpoint does not enforce active-only. |
| Search name/brand | Partial | UI flow works locally; case-insensitivity is not explicit at repository level. |
| Product detail/availability | Missing | Detail is a local view, no quantity selector, no zero-stock state, no unknown-detail state. |
| Cart management | Partial | Add/read/update/delete exist; error classification and atomic stock semantics are incomplete. |
| Checkout fields | Partial | Native required markers exist; server DEC-03 validation and field errors are missing. |
| Review/payment | Missing | COD display exists, but no distinct review step and no editable review state. |
| Order transaction | Partial | Transaction exists, but stale cart, current-price authority, concurrency, and response mapping are incomplete. |
| Confirmation/privacy | Partial | Session-bound API exists, but UI does not re-fetch; identifier is predictable `Date.now()`. |
| Accessibility/responsive | Partial | Labels and mobile width smoke exist; keyboard/focus/error association audit is absent. |
| Performance | Not tested | No load test or p95/error-rate evidence. |
| Repeatability/isolation | Partial | Vitest reset is repeatable; E2E uses dev DB and can mutate shared inventory. |
| CI/setup | Missing | No workflow; README is stale. |

## Test Coverage Gaps

- Existing evidence: 2 frontend Vitest tests, 6 backend Vitest tests, 4 Playwright tests.
- The 4 Playwright tests cover only browse/add/checkout semantics, search, empty cart, and mobile width.
- Missing or insufficient regression coverage includes price mutation, concurrent same-cart order behavior, UUID header validation, inactive/unknown product detail, quantity error classification, DEC-03 field boundaries, empty-cart order API, response schema, order-number uniqueness/opacity, confirmation re-fetch/privacy, malformed JSON, and safe unexpected errors.
- TC_MOBILE_026 requires an accessibility scanner and keyboard/focus evidence.
- TC_MOBILE_028 requires a performance workload and report.
- The current automation traceability artifact should remain marked partial until these cases are implemented and executed.

## Recommended Fix Order

1. Correct server authority and integrity: DEC-03 validation, current Product pricing, atomic stock decrement, UUID headers, typed error mapping, active-only detail.
2. Complete frontend required states: detail/quantity/availability, review, validation/error rendering, stale-cart handling, confirmation re-fetch.
3. Add API regression tests for every high-risk contract and update Playwright specs through the confirmation journey.
4. Add accessibility/performance evidence and CI.
5. Refresh README and change Technical Design status from proposed to implemented/known gaps.

## Verification Baseline

At review time, the existing local checks pass:

- Root typecheck: pass.
- Frontend Vitest: 2 passed.
- Backend Vitest: 6 passed.
- Playwright: 4 passed.

Passing checks do not clear the findings above because the current tests do not exercise the missing requirements and several assertions validate only UI presence rather than server-authoritative behavior.
