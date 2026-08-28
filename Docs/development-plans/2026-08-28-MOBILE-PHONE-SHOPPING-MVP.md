# Development Plan: MOBILE-PHONE-SHOPPING-MVP — TypeScript Full-Stack MVP

**Date:** 2026-08-28  
**Author:** Senior Development Planner  
**Status:** Draft

---

## 1. Background & Context

The Mobile Phone Shopping Web App is an anonymous guest-shopping MVP. A guest must be able to browse and search active phones, open product details, add and manage cart items, complete checkout with Cash on Delivery, place an order, and view a session-protected confirmation.

The current repository contains a React/Vite client with local mock products and a localStorage cart, plus an Express/Prisma/SQLite server with the core REST endpoints. The current implementation is not yet the approved MVP contract: the client is not using the API as its source of truth, server behavior has gaps around session binding and idempotency, validation/error responses are inconsistent, and the code is JavaScript-heavy and concentrated in a few files.

This plan converts the project to a TypeScript npm-workspace monorepo, introduces shared API/domain contracts, completes the server-owned business rules, connects the client to the real API, and establishes automated quality gates. It covers the complete MVP from `US-001` through `US-008`.

Approved design baseline:

- Full MVP scope: `US-001` to `US-008`.
- Vitest, React Testing Library, and Playwright.
- Remove JavaScript source/config files; retain JSON metadata/config files required by npm and tooling.
- Feature-first client and layered server architecture.
- REST API is the frontend data source and server is the source of truth for stock, price, totals, order status, and order identifiers.
- Reset and seed the demo SQLite database during schema migration.
- Client-generated UUID session stored in `sessionStorage`, sent as `x-session-id`; no fixed fallback session.
- Client-generated UUID idempotency key sent through `Idempotency-Key`, persisted per session.
- Shared TypeScript contracts in `shared/`.
- npm workspace monorepo containing `client/`, `server/`, and `shared/`.
- GitHub Actions quality pipeline.
- Local development and CI only; no staging or production deployment in this plan.

## 2. Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Product scope | Implement `US-001` through `US-008` as one MVP plan | The approved requirements and test assets describe one complete guest-shopping journey. |
| Language | TypeScript across client, server, config, seed, and tests | Removes JavaScript source and improves API/domain type safety. |
| Test stack | Vitest + React Testing Library + Playwright | Fits Vite, covers unit/component/API/integration/E2E layers, and supports the approved test pyramid. |
| Repository structure | npm workspace monorepo: `client/`, `server/`, `shared/` | Allows one command surface and one source of truth for shared contracts. |
| Client architecture | Feature-first modules | Separates product discovery, cart, checkout, and order flows without creating unrelated abstractions. |
| Server architecture | Routes/controllers, services, repositories/data access, validators, and config | Prevents business rules from remaining in the current monolithic entry file. |
| API source of truth | Client consumes REST API for products, cart, checkout, and orders | Prevents client-side stock, price, total, and status from becoming authoritative. |
| Guest session | UUID in `sessionStorage`, sent via `x-session-id`; valid header required | Isolates carts/orders between guests and remains easy to control in browser/API tests. |
| Idempotency | UUID per checkout attempt in `Idempotency-Key`; stored with session scope | Makes retries safe without allowing one session to reuse another session's result. |
| Database change | Reset and reseed demo SQLite data | No production data exists; deterministic fixtures are required for tests. |
| Order protection | Persist `sessionId`, idempotency key, unique opaque order number, snapshots, and `Pending` status | Supports transaction integrity, privacy, replay protection, and stable confirmation data. |
| Error contract | `{ error: { code, message, fields? } }` with 400/404/409/500 semantics | Gives client and tests a deterministic contract and avoids internal-detail leakage. |
| CI | GitHub Actions at `.github/workflows/ci.yml` | Runs the agreed type, lint, test, E2E smoke, and build gates on changes. |
| Deployment | Local and CI only | No hosting, domain, cloud provider, or deployment requirements are defined. |

## 3. Architecture / Approach

### Target structure

```text
client/
  src/
    app/
    components/
    features/
      products/
      cart/
      checkout/
      orders/
    services/
    types/
    main.tsx
  vite.config.ts
server/
  src/
    config/
    middleware/
    routes/
    controllers/
    services/
    repositories/
    validators/
    app.ts
    server.ts
  prisma/
    schema.prisma
    seed.ts
shared/
  src/
    domain/
    api/
    errors/
    index.ts
```

The exact file names may be adjusted during implementation, but the ownership boundaries must remain explicit. The server entry point should only configure the application and start listening. Product, cart, checkout, order, session, and idempotency rules belong in services/validators and are covered by focused tests. Prisma access belongs behind repository/data-access functions or a clearly isolated persistence module.

The request flow for a successful order is:

1. Client creates or reuses the current guest session ID and sends it with the cart/order request.
2. Client creates an idempotency key for the checkout attempt and sends it in `Idempotency-Key`.
3. API validates headers, checkout input, payment method, cart ownership, and current stock.
4. Order service executes one database transaction: resolve current products, calculate server-side totals, create order and item snapshots, decrement inventory, persist status `Pending`, persist replay identity, and clear the session cart.
5. A retry with the same session and idempotency key returns the original order without repeating inventory/cart effects.
6. Confirmation lookup requires both the opaque order number and the creating session ID.

No new third-party business integration is required. Existing React, Vite, Express, Prisma, SQLite, Zod, Vitest, React Testing Library, and Playwright dependencies should be used where compatible; dependency additions are limited to TypeScript, test tooling, workspace support, and required adapters/configuration.

## 4. Task Breakdown

### Task 1: Establish the TypeScript npm workspace

**Files to change:**

- Root `package.json` — define workspaces and root-level scripts for install, type-check, lint, test, E2E smoke, and build.
- Root TypeScript/tooling configuration files as needed — define shared compiler defaults without reintroducing JavaScript source.
- `client/package.json`, `server/package.json` — move package scripts/dependencies into the workspace model and remove JavaScript-oriented entry points.
- `client/vite.config.js` -> `client/vite.config.ts` — migrate Vite configuration.
- `client/src/main.jsx` -> `client/src/main.tsx` — migrate the client entry point.
- `server/src/index.js` -> TypeScript server/app entry modules — establish typed startup and application wiring.
- `server/prisma/seed.js` -> `server/prisma/seed.ts` — migrate the seed entry point.
- New workspace configuration files such as `tsconfig.json` files and test configuration files — keep client, server, shared, and tests type-checkable.

**What to do:**

- Configure npm workspaces for `client`, `server`, and `shared`.
- Add TypeScript compilation/type-checking without emitting unnecessary build artifacts into source folders.
- Ensure all application/config/seed/test files are `.ts` or `.tsx`; retain `package.json`, Prisma schema, JSON, CSS, HTML, and Markdown files as appropriate.
- Make local commands work from the repository root and from each workspace.
- Keep environment variables typed at the configuration boundary and document required values.

**Tests to write/update:**

- Verify the root install and workspace scripts resolve all packages.
- Verify client and server type-check independently and from the root.
- Verify the client production build and server startup after migration.

### Task 2: Create shared domain and API contracts

**Files to change:**

- New `shared/src/domain/*` — define Product, Cart, CartItem, Order, OrderItem, session, payment, and status types.
- New `shared/src/api/*` — define request/response contracts for product, cart, order, and confirmation endpoints.
- New `shared/src/errors/*` — define error codes, error envelope, and field-error shapes.
- New `shared/package.json`, `shared/tsconfig.json`, `shared/src/index.ts` — expose the shared package to client and server.
- Server validators and client API services — consume the shared contracts rather than duplicating response shapes.

**What to do:**

- Model server-owned fields separately from client-submittable fields so protected price, stock, total, status, and order-number fields cannot be treated as writable input.
- Define the `x-session-id` and `Idempotency-Key` requirements at the API boundary.
- Define consistent 400, 404, 409, and safe 500 response shapes.
- Keep shared contracts dependency-light and independent of Prisma implementation types.

**Tests to write/update:**

- Verify representative valid and invalid request payloads satisfy the intended schemas.
- Verify API response mapping preserves required fields and snapshots.
- Verify client and server compile against the same contract definitions.

### Task 3: Migrate and extend the Prisma data model

**Files to change:**

- `server/prisma/schema.prisma` — add order session binding, idempotency persistence/constraints, and any required indexes or relation changes.
- `server/prisma/seed.ts` — provide deterministic products with active, inactive, stock-zero, stock-one, and stock-N fixtures as required by tests.
- `server/.env` or test environment configuration — separate development and test database URLs.
- Root/server database scripts — add reset, push/migration, seed, and test reset commands.

**What to do:**

- Add a required creating guest session identifier to orders.
- Persist the idempotency key with a uniqueness strategy that supports session-scoped replay and rejects conflicting reuse.
- Preserve order item product-name and unit-price snapshots.
- Keep the public order number unique and opaque; do not use it as the session authorization control.
- Reset the demo SQLite database and reseed it; do not design compatibility handling for nonexistent production orders.
- Ensure test setup can reset data deterministically before suites and fixtures do not leak across sessions.

**Tests to write/update:**

- Integration tests for schema constraints, order snapshots, unique order numbers, session binding, and idempotency records.
- Verify seed/reset produces the same known fixture set each time.
- Verify database transaction rollback leaves product stock, cart, and order records unchanged after a failed order.

### Task 4: Refactor server API into typed layers

**Files to change:**

- Existing `server/src/index.js` -> typed `server/src/app.ts`, `server/src/server.ts`, and route/controller modules.
- New `server/src/config/*` — environment and port configuration.
- New `server/src/middleware/*` — request parsing, session/header validation, error handling, and safe error serialization.
- New `server/src/routes/*` and `server/src/controllers/*` — products, cart, and order endpoints.
- New `server/src/services/*` — product search, cart mutation, checkout validation, order transaction, session access, and idempotency logic.
- New `server/src/repositories/*` or equivalent data-access modules — Prisma queries and transaction boundaries.
- New `server/src/validators/*` — Zod schemas for query, path, headers, cart, checkout, and order inputs.

**What to do:**

- Preserve the approved REST capabilities: products list/detail, cart read/add/update/remove, order creation, and session-bound confirmation.
- Normalize search by trimming and applying case-insensitive partial matching on name or brand, returning active products only.
- Enforce quantity rules server-side, including duplicate-add overflow rejection without clamping or partial mutation.
- Enforce valid non-empty sessions and reject missing/invalid session headers rather than falling back to `demo-session`.
- Validate checkout fields, optional fields, COD-only payment, and all boundaries from `DEC-03`.
- Return the standard error envelope and avoid stack traces, SQL, or sensitive fields in responses.
- Make cart item update/remove operations verify both item identity and owning session.

**Tests to write/update:**

- API tests for all product, cart, checkout, and order endpoints.
- Negative tests for malformed JSON, invalid types, missing headers, unknown resources, unsupported payment, invalid fields, and unsafe path values.
- Security tests for cross-session cart/order access, client price/total/status/stock tampering, and error-detail leakage.

### Task 5: Implement atomic order processing and replay protection

**Files to change:**

- `server/src/services/order*` — implement the transaction-owned order flow.
- `server/src/repositories/*` — provide transaction-compatible reads/writes and idempotency lookup.
- `server/prisma/schema.prisma` — finalize indexes/constraints needed by replay-safe order creation.
- Shared order/error contracts — expose only the approved response fields.

**What to do:**

- Resolve the cart by the authenticated-by-header guest session convention.
- Check current inventory for every cart line inside the transaction boundary.
- Calculate totals from current server product prices and quantities, while persisting item snapshots.
- Create exactly one order with a unique opaque number and `Pending` status.
- Decrement stock and clear the session cart only as part of the successful transaction.
- For a repeated key, return the original order when the session and request identity match; define and test the conflict behavior for same key with materially different payload.
- Ensure unknown or cross-session order lookup returns generic 404 with no personal data.

**Tests to write/update:**

- Integration tests for successful order, insufficient stock rollback, stale cart, multi-line total, inventory decrement, cart clearing, and order snapshots.
- Idempotency tests for same-key retries, same-key conflicting payload, concurrent/repeated submissions, and unique order creation.
- Session privacy tests for creating session, different session, missing session, and unknown order number.

### Task 6: Rebuild the client as typed feature modules using the REST API

**Files to change:**

- `client/src/App.jsx` -> typed application shell and route/view composition.
- `client/src/App.css`, `client/src/index.css` — preserve the existing visual direction while adapting loading, error, empty, and unavailable states.
- New `client/src/features/products/*` — list, search, product detail, product API service, and product state.
- New `client/src/features/cart/*` — cart view, mutation controls, cart API service, and server-backed totals.
- New `client/src/features/checkout/*` — typed form state, client-friendly validation presentation, review, COD selection, and submit handling.
- New `client/src/features/orders/*` — confirmation view and session-bound order retrieval.
- New `client/src/services/*` — typed HTTP client, API base URL, session ID creation/storage, and idempotency key generation.
- New shared/common components as needed for layout, loading, error, form, and accessible controls.

**What to do:**

- Remove mock product data and localStorage cart as sources of truth.
- Create a UUID session ID once per browser session using `sessionStorage`; send it on every cart/order request.
- Fetch product list/detail from the API and render server-provided stock, price, image, and product metadata.
- Use API responses for cart quantities, item subtotals, and totals; handle 409 stock conflicts without silently clamping values.
- Keep checkout validation aligned with server rules and display field-level errors from the shared error contract.
- Show COD as the only payment method and submit a fresh idempotency key per checkout attempt.
- Handle loading, empty, invalid/not-found, unavailable, stale-cart, API error, retry, and confirmation states.
- Keep controls keyboard accessible, labeled, focusable, and usable at mobile and desktop widths.

**Tests to write/update:**

- Component tests for product search/results, product detail boundaries, cart mutation states, empty cart, checkout validation, COD-only display, API errors, and confirmation rendering.
- Browser tests for the critical guest path from browse/search through confirmation.
- Responsive and keyboard checks at the approved desktop and mobile viewports.

### Task 7: Add the approved automated test pyramid

**Files to change:**

- Root/workspace test configuration files — configure Vitest, React Testing Library, and Playwright in TypeScript.
- New `client/src/**/*.test.tsx` — component and client utility tests.
- New `server/src/**/*.test.ts` — service, validator, repository/integration, and API tests.
- New `tests/e2e/*` or approved Playwright workspace — critical E2E tests and fixtures.
- New test fixtures/helpers — dedicated test DB reset/seed, unique sessions, deterministic products, and request helpers.
- `working-artifacts/test-cases/TC-FEATURE-Mobile-Phone-Shopping.md` — preserve traceability when implementation IDs or test automation references are finalized.

**What to do:**

- Implement the 32 approved cases at the appropriate test level instead of duplicating every case as an E2E test.
- Prioritize the critical regression pack: product browse/search, duplicate cart overflow, cart totals, valid COD order, checkout validation, unsupported payment, stock rollback, atomic success, idempotency, session privacy, tampering, unknown product, and unknown cart item.
- Keep tests independent using reset/seed and unique session/idempotency data.
- Capture status codes, error envelopes, database effects, and browser evidence where relevant.
- Keep performance check bounded to five concurrent users and the approved p95/error-rate gate.

**Tests to write/update:**

- Unit: calculations, normalization, validation, order number, and idempotency helpers.
- Component: accessible UI states and form behavior.
- Integration/API: Prisma transactions, stock, session scope, errors, and replay protection.
- Playwright E2E: one critical happy path plus high-risk negative/browser cases.
- Performance: product list/detail, cart read, and order submission at five concurrent users.

### Task 8: Add GitHub Actions quality pipeline

**Files to change:**

- New `.github/workflows/ci.yml` — define the quality pipeline.
- Root `package.json` and workspace package files — expose stable commands used by CI.
- Playwright configuration and CI test setup — install browsers and use an isolated test database.
- README and setup documentation — document local and CI-relevant commands.

**What to do:**

- Run dependency install, TypeScript type-check, lint, unit/component tests, server integration/API tests, Playwright smoke tests, and client/server builds.
- Reset and seed a CI-specific SQLite database before database-backed tests.
- Start the API and client for browser tests with deterministic ports or process orchestration.
- Publish test reports/artifacts when a test fails.
- Keep production/staging deployment out of this workflow; this pipeline is a quality gate only.

**Tests to write/update:**

- Validate the workflow on pull request and main branch events.
- Verify a clean checkout can run all required gates without relying on a developer's local database or session state.

### Task 9: Update documentation and implementation traceability

**Files to change:**

- `README.md` — document TypeScript workspace setup, database reset/seed, local start commands, test commands, API/session headers, and CI expectations.
- `client/README.md` and `server/README.md` — update workspace-specific instructions if they remain useful.
- `working-artifacts/requirements/mobile-phone-shopping/requirements.md` — update only if implementation decisions change the approved contract.
- `working-artifacts/test-strategy/Test-Strategy-Mobile-Phone-Shopping.md` — synchronize tooling, test IDs, and execution gates after implementation.
- `working-artifacts/test-cases/TC-FEATURE-Mobile-Phone-Shopping.md` — synchronize automation references and any approved contract changes.
- `working-artifacts/test-case-reviews/Report-Review-Test-Case-TC-FEATURE-Mobile-Phone-Shopping.md` — preserve the approved design review and record execution separately.

**What to do:**

- Document confirmed decisions without claiming test execution or release approval.
- Record any deviation from `DEC-01` through `DEC-11` as a change requiring requirements/story/test updates.
- Keep local setup usable from a clean checkout.

**Tests to write/update:**

- Fresh-checkout setup verification using only documented commands.
- Verify documentation commands match actual root/workspace scripts.

## 5. Files & References

Existing files the engineer should read before starting:

| File | Why it's relevant |
|------|--------------------|
| `Docs/Product_brief.md` | Product vision, MVP boundary, business flow, and acceptance expectations. |
| `working-artifacts/requirements/mobile-phone-shopping/requirements.md` | Functional requirements, NFRs, BRs, API capabilities, AC-01 to AC-15, and DEC-01 to DEC-11. |
| `working-artifacts/user-stories/mobile-phone-shopping/user-stories.md` | US-001 to US-008, dependencies, acceptance criteria, and story-level behavior. |
| `working-artifacts/test-strategy/Test-Strategy-Mobile-Phone-Shopping.md` | Risk-based test levels, gates, environment, data, ownership, and performance target. |
| `working-artifacts/test-cases/TC-FEATURE-Mobile-Phone-Shopping.md` | 32 reviewed test cases and traceability matrix. |
| `working-artifacts/test-case-reviews/Report-Review-Test-Case-TC-FEATURE-Mobile-Phone-Shopping.md` | Review findings and approved test-case design verdict. |
| `client/src/App.jsx` | Current local-state UI flow to replace with typed feature modules and API calls. |
| `client/src/App.css` | Existing client visual conventions and responsive layout styles. |
| `client/package.json` | Current Vite/React scripts and dependencies to migrate into the workspace. |
| `server/src/index.js` | Current API behavior and the starting point for layered TypeScript refactoring. |
| `server/prisma/schema.prisma` | Current persistence model and required order/session/idempotency changes. |
| `server/prisma/seed.js` | Current seed data to migrate and extend for deterministic tests. |
| `server/package.json` | Current Express/Prisma/Zod scripts and dependencies. |
| `README.md` | Current local setup instructions that must be updated after workspace migration. |
| `instructions/react/react.instructions.md` | React implementation and architecture guidance. |
| `instructions/react/react-archiecture.instructions.md` | Feature-first client organization guidance. |
| `instructions/react/react-testing-security.instructions.md` | Testing and security recommendations. |
| `instructions/testing/copilot-instructions.md` | Playwright and testing conventions. |
| `instructions/ProjectSetup/GithubCopilot/StandardInstructions/api-design.md` | REST/API naming, status codes, and validation conventions. |
| `instructions/ProjectSetup/GithubCopilot/StandardInstructions/implementation-core.md` | Layering, responsibility, error handling, and implementation conventions. |
| `instructions/ProjectSetup/GithubCopilot/StandardInstructions/security.md` | Security expectations for input, sessions, and protected data. |

## 6. Risks & Unknowns

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Full TypeScript migration breaks Vite, Prisma seed, or test tooling. | Medium | Migrate workspace by workspace; type-check and build after each boundary. |
| npm workspace dependency/configuration drift. | Medium | Keep root scripts canonical and run clean-checkout CI early. |
| Existing UI behavior changes during API integration. | High | Preserve approved UX states; add component and critical-path tests before removing mock state. |
| SQLite concurrency does not model all production database behavior. | Medium | Keep the approved five-user gate bounded and document its local-environment limitation. |
| Idempotency key semantics are incomplete for conflicting payload reuse. | Medium | Add an explicit conflict test and finalize response behavior before automation handoff. |
| Session ID in sessionStorage is cleared when the browser session ends. | Low | Treat this as intentional anonymous-session scope and avoid promising cross-device persistence. |
| API/client shared contract accidentally exposes writable protected fields. | Medium | Separate input/output types and add payload-tampering tests. |
| Existing seed image URLs or external images are unavailable. | Medium | Use deterministic fallback rendering and test the fallback state. |
| Refactoring the monolithic server introduces behavior regressions. | High | Preserve endpoint smoke coverage and migrate one resource boundary at a time. |
| Accessibility and performance tooling is not currently installed. | Medium | Add the required tooling during test setup; keep manual checks visible when automation is unavailable. |
| Requirements decisions change after implementation begins. | Medium | Treat DEC-01 to DEC-11 as change-controlled; update requirements, stories, strategy, cases, and plan together. |

## 7. How to Test Locally

The exact commands will be finalized in the root workspace scripts, but the implementation must support this sequence:

1. Install all workspace dependencies from the repository root with `npm install`.
2. Create/reset the development or test SQLite database using the documented root database command.
3. Seed deterministic product fixtures using the documented seed command.
4. Run root type-check and lint commands.
5. Run unit, component, server integration/API, and Playwright tests through the root scripts.
6. Start the typed server with the documented development command.
7. Start the typed Vite client with the documented development command.
8. Open the local client URL and complete the guest flow: browse/search, detail, add to cart, update/remove, checkout, COD, place order, and confirmation.
9. Verify browser requests include a stable `x-session-id` for the browser session and a fresh `Idempotency-Key` for each checkout attempt.
10. Repeat the same order request with the same session and idempotency key; verify one order, one inventory reduction, one cart clear, and the same returned order.
11. Use a second session to request the first order confirmation; verify a generic not-found response with no order data.
12. Run the bounded performance command with five concurrent users and verify p95 <= 2 seconds and error rate < 1% for the named API journeys.

The local verification must use synthetic customer data and an isolated test database. Passing local checks does not constitute production readiness because this plan has no production deployment scope.

## 8. Definition of Done

- [ ] Client, server, config, seed, and test source files have been migrated to TypeScript; no JavaScript source/config files remain in the approved migration scope.
- [ ] npm workspace monorepo includes working `client/`, `server/`, and `shared/` packages.
- [ ] Shared API/domain/error contracts are consumed by both client and server.
- [ ] Prisma schema supports order session binding, session-scoped idempotency, unique opaque order numbers, order snapshots, and required constraints.
- [ ] Demo/test SQLite reset and deterministic seed commands work from a clean checkout.
- [ ] Server is layered and enforces all approved stock, quantity, validation, COD, session, total, order, error, and transaction rules.
- [ ] Client uses REST API data for products, cart, checkout, orders, stock, price, totals, and confirmation; mock products and localStorage cart are removed as sources of truth.
- [ ] Successful order creation is atomic; failed stock validation leaves order, inventory, and cart unchanged.
- [ ] Repeated submission with the same session and idempotency key returns the original order without duplicate side effects.
- [ ] Cross-session and missing-session order confirmation cannot expose order data.
- [ ] Unit, component, integration/API, E2E, accessibility, responsive, and bounded performance tests cover the approved 32-case design.
- [ ] GitHub Actions runs type-check, lint, tests, E2E smoke, and client/server builds with isolated data.
- [ ] README and workspace documentation reflect actual commands and environment requirements.
- [ ] All Critical/High tests pass or have an explicitly approved risk acceptance; no execution result is claimed by this plan alone.
- [ ] Requirements, user stories, test strategy, test cases, and review artifacts remain synchronized with any approved change.
- [ ] At least one peer reviews the implementation and the plan is linked from the pull request.
