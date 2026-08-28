# Requirements — Mobile Phone Shopping Web App

**Product:** Mobile Phone Shopping Web App  
**Release:** MVP 1.0  
**Status:** Baseline for development  
**Source:** [Product Brief](../../../Docs/Product_brief.md)  
**Date:** 2026-08-28

## 1. Purpose

This document defines the functional and non-functional requirements for the MVP mobile phone shopping application. It is the baseline for user-story refinement, solution design, implementation, and test planning.

The MVP must support the complete anonymous guest-shopping journey:

> Browse/search products -> view details -> add to cart -> manage cart -> checkout with COD -> place order -> view confirmation

## 2. Scope and Users

### 2.1 Primary actor

**Guest Shopper:** an anonymous customer who can browse products, manage a cart, complete checkout, and place a Cash on Delivery order without registration or login.

### 2.2 In scope

- Browse active mobile phone products.
- Search products by name or brand.
- View product details and availability.
- Add products to a session cart.
- Increase, decrease, and remove cart items.
- Complete guest checkout using Cash on Delivery.
- Validate stock at order submission.
- Create an order and order items.
- Generate a unique order number.
- Reduce inventory after successful order creation.
- Clear the cart after successful order creation.
- Display order confirmation with order and shipping details.

### 2.3 Out of scope

Registration, login, social login, account management, online payments, order cancellation/tracking, reviews, ratings, wishlist, comparison, discounts, promotions, advanced filtering, recommendations, admin/product/order management UI, returns, refunds, shipping integrations, email/SMS notifications, and loyalty features are excluded from MVP 1.0.

## 3. Business Rules

| ID | Rule |
| --- | --- |
| BR-01 | Only products with stock greater than zero can be purchased. |
| BR-02 | Each cart item quantity must be between 1 and the product's current available stock. |
| BR-03 | Adding a product already in the cart increases its existing quantity and does not create a duplicate cart line. |
| BR-04 | Cart totals are recalculated after adding, changing, or removing an item. |
| BR-05 | Stock availability must be checked again when an order is submitted. |
| BR-06 | The system must not create an order when requested quantity exceeds current inventory. |
| BR-07 | Inventory is reduced only after the order is successfully created. |
| BR-08 | Order total equals the sum of `unit price * quantity` for all order items. |
| BR-09 | Authentication is not required for guest checkout. |
| BR-10 | The only supported payment method is Cash on Delivery (`COD`). |
| BR-11 | Full name, phone number, shipping address, and city are required checkout fields. |
| BR-12 | Email address and postal code are optional checkout fields. |
| BR-13 | Every successfully created order must have a unique order number. |
| BR-14 | The cart must be empty after successful order creation. |
| BR-15 | A newly created order must have status `Pending`. |

## 4. Functional Requirements

### 4.1 Product browsing and search

| ID | Requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-PROD-01 | The system shall display active mobile products on the home/product-list page. | Must | Product Brief 4.1, AC-01 |
| FR-PROD-02 | Each product-list item shall display product name, brand, price, image, short description, and stock availability. | Must | Product Brief 4.1 |
| FR-PROD-03 | A guest shopper shall be able to search products by product name. | Must | Product Brief 4.1, AC-02 |
| FR-PROD-04 | A guest shopper shall be able to search products by brand. | Must | Product Brief 4.1, AC-03 |
| FR-PROD-05 | The system shall return only active products in browse and search results. | Must | Product model, BR-01 |
| FR-PROD-06 | The system shall provide a way to select a product and open its detail view. | Must | Product Brief 4.1, AC-04 |
| FR-PROD-07 | The system shall clearly identify an unavailable product when stock is zero. | Must | Product Brief 4.3, BR-01 |

### 4.2 Product details and availability

| ID | Requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-DETAIL-01 | The product-detail view shall display product name, brand, price, image, description, specifications, and available stock. | Must | Product Brief 4.2, AC-04 |
| FR-DETAIL-02 | The product-detail view shall provide a quantity selector. | Must | Product Brief 4.2 |
| FR-DETAIL-03 | The quantity selector shall not allow a value below 1. | Must | BR-CART-01, BR-02 |
| FR-DETAIL-04 | The quantity selector shall not allow a value above current available stock. | Must | BR-CART-02, AC-08 |
| FR-DETAIL-05 | The Add to Cart action shall be disabled or rejected when stock is zero. | Must | BR-CART-05, AC-05 |

### 4.3 Shopping cart

| ID | Requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-CART-01 | The system shall maintain a cart for the anonymous shopper session. | Must | Product Brief 5, data model |
| FR-CART-02 | The cart shall display product name, image, unit price, quantity, subtotal, and total order amount. | Must | Product Brief 5 |
| FR-CART-03 | A guest shopper shall be able to add an in-stock product to the cart. | Must | AC-05 |
| FR-CART-04 | Adding the same product again shall increase the existing cart-item quantity rather than create a duplicate line. | Must | BR-03, AC-06 |
| FR-CART-05 | A guest shopper shall be able to increase a cart-item quantity up to available stock. | Must | BR-02, AC-07, AC-08 |
| FR-CART-06 | A guest shopper shall be able to decrease a cart-item quantity, but not below 1. | Must | BR-02, AC-07 |
| FR-CART-07 | A guest shopper shall be able to remove a cart item. | Must | AC-09 |
| FR-CART-08 | The system shall recalculate item subtotals and cart total after every cart mutation. | Must | BR-04, AC-07, AC-09 |
| FR-CART-09 | The cart shall provide a Continue Shopping action. | Must | Product Brief 5 |
| FR-CART-10 | The cart shall provide a Proceed to Checkout action when it contains at least one item. | Must | Product Brief 5 |
| FR-CART-11 | The system shall prevent adding or updating a cart item when the requested quantity exceeds current stock. | Must | BR-02, BR-05 |

### 4.4 Guest checkout and order review

| ID | Requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-CHECKOUT-01 | A guest shopper shall be able to open checkout without registering or logging in. | Must | BR-09 |
| FR-CHECKOUT-02 | Checkout shall collect full name, phone number, shipping address, and city as required fields. | Must | Product Brief 6.1, BR-11 |
| FR-CHECKOUT-03 | Checkout shall collect email address and postal code as optional fields. | Must | Product Brief 6.1, BR-12 |
| FR-CHECKOUT-04 | The system shall validate required checkout fields before order submission. | Must | AC-10, NFR-03 |
| FR-CHECKOUT-05 | The system shall display an appropriate validation message when a required field is missing or invalid. | Must | AC-10 |
| FR-CHECKOUT-06 | Checkout shall support Cash on Delivery as the payment method. | Must | Product Brief 6.2, BR-10 |
| FR-CHECKOUT-07 | The order-review step shall display products, quantities, unit prices, subtotals, total, customer information, shipping address, and payment method before submission. | Must | Product Brief 6.3 |
| FR-CHECKOUT-08 | The shopper shall be able to place the order from the review step. | Must | Product Brief 6.3, AC-11 |
| FR-CHECKOUT-09 | The system shall reject an order submission when the cart is empty. | Must | Order processing behavior |

### 4.5 Order processing and confirmation

| ID | Requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-ORDER-01 | On Place Order, the system shall validate checkout information server-side. | Must | Product Brief 7, NFR-03 |
| FR-ORDER-02 | On Place Order, the system shall validate current stock for every cart item. | Must | BR-05, BR-06, AC-11 |
| FR-ORDER-03 | The system shall not create an order if any requested quantity exceeds current inventory. | Must | BR-06, NFR-05 |
| FR-ORDER-04 | The system shall create one order record and one order item record for each cart line after successful validation. | Must | Product Brief 7, data model |
| FR-ORDER-05 | The system shall calculate the final order total from server-side product prices and quantities. | Must | BR-08 |
| FR-ORDER-06 | The system shall generate and persist a unique order number for each successful order. | Must | BR-13, AC-12 |
| FR-ORDER-07 | The system shall set the new order status to `Pending`. | Must | BR-15, AC-15 |
| FR-ORDER-08 | The system shall reduce product inventory only after successful order creation. | Must | BR-07, AC-13 |
| FR-ORDER-09 | The system shall clear all items from the guest cart after successful order creation. | Must | BR-14, AC-14 |
| FR-ORDER-10 | The confirmation view shall display confirmation message, order number, customer name, ordered items, quantities, unit prices, total, shipping address, payment method, and status. | Must | Product Brief 8, AC-15 |
| FR-ORDER-11 | The system shall allow retrieval of an order using its order number for the confirmation view only when the request uses the creating guest session identifier. A different or missing session receives a generic not-found response. | Must | Expected API capabilities, DEC-05 |

## 5. Data Requirements

The implementation shall support at least these data entities:

- **Product:** id, name, brand, description, price, stock quantity, image URL, specifications, active flag, timestamps.
- **Cart:** id, anonymous session ID, timestamps.
- **CartItem:** id, cart ID, product ID, quantity, unit price.
- **Order:** id, unique opaque order number/token, creating guest session identifier, idempotency key, customer details, shipping details, payment method, status, total amount, timestamps.
- **OrderItem:** id, order ID, product ID, product name snapshot, unit price snapshot, quantity, subtotal.

Order items must retain product name and unit price snapshots so that the confirmation and historical order total remain stable after future product changes.

## 6. API Capability Requirements

The REST API shall provide capabilities equivalent to:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/products` | Browse and search active products. |
| GET | `/api/products/:id` | Retrieve product details. |
| GET | `/api/cart` | Retrieve the current guest cart. |
| POST | `/api/cart/items` | Add a product or increase an existing cart line. |
| PUT | `/api/cart/items/:id` | Update cart-item quantity. |
| DELETE | `/api/cart/items/:id` | Remove a cart item. |
| POST | `/api/orders` | Validate checkout, create order, reduce inventory, and clear cart. |
| GET | `/api/orders/:orderNumber` | Retrieve order confirmation data for the creating guest session. |

The exact endpoint design may vary only if it preserves the capabilities and business rules above. Cart and order requests must carry the anonymous session identifier. Place Order must carry an idempotency key. Errors use `{ error: { code, message, fields? } }` with 400 for malformed/validation requests, 404 for generic not-found, 409 for stock conflict or repeated-key conflict, and 500 for unexpected failures without internal details.

## 7. Non-Functional Requirements

| ID | Requirement | Priority | Verification focus | Source |
| --- | --- | --- | --- | --- |
| NFR-01 | The application shall provide a simple and intuitive journey that a new guest can complete without additional instructions. | Must | Usability walkthrough and E2E happy path | Product Brief 14 |
| NFR-02 | For the seeded MVP dataset and local workshop environment, p95 response time for product list, product detail, cart read, and order submission API requests shall be <= 2 seconds at 5 concurrent users, with an error rate below 1%. | Should | Timed API checks at defined concurrency | Product Brief 14, DEC-09 |
| NFR-03 | All user input shall be validated before processing, including mandatory server-side validation. | Must | Negative API and UI tests | Product Brief 14 |
| NFR-04 | The system shall use safe database access mechanisms and shall not expose sensitive server-side information. | Must | Code review and security checks | Product Brief 14 |
| NFR-05 | The server shall validate product and inventory information and prevent clients from modifying protected order data. | Must | API tampering and concurrency/boundary tests | Product Brief 14 |
| NFR-06 | The UI shall support keyboard navigation, visible focus, associated labels and field errors, logical focus order, accessible control names, and responsive use at mobile and desktop viewport sizes. | Must | Accessibility and responsive browser checks | Product Brief 14, DEC-10 |
| NFR-07 | The codebase shall maintain clear separation between UI, API, business logic, and database access. | Must | Architecture/code review | Product Brief 14 |
| NFR-08 | The application shall be runnable locally with standard npm commands and documented database initialization/seed commands. | Must | Fresh setup verification | Product Brief 15 |

## 8. Constraints and Dependencies

### Constraints

- Frontend: React, Vite, JavaScript or TypeScript, HTML, CSS.
- Backend: Node.js and Express.js.
- Database: SQLite.
- ORM: Prisma.
- API style: REST and JSON.
- Testing: Playwright for end-to-end testing and API-level tests where appropriate.

### Dependencies

- Node.js and npm available in the development environment.
- Prisma can create or update the local SQLite database.
- Seed data is available before demonstration or automated testing.
- Frontend and backend URLs/configuration are available for local development.

## 9. Acceptance Coverage

| Brief criterion | Covered by |
| --- | --- |
| AC-01 Display products | FR-PROD-01, FR-PROD-02 |
| AC-02 Search by product name | FR-PROD-03 |
| AC-03 Search by brand | FR-PROD-04 |
| AC-04 View product details | FR-PROD-06, FR-DETAIL-01 |
| AC-05 Add product to cart | FR-DETAIL-05, FR-CART-03 |
| AC-06 Add existing product | FR-CART-04 |
| AC-07 Update quantity | FR-CART-05, FR-CART-06, FR-CART-08 |
| AC-08 Prevent quantity above stock | FR-DETAIL-04, FR-CART-11 |
| AC-09 Remove cart item | FR-CART-07, FR-CART-08 |
| AC-10 Checkout validation | FR-CHECKOUT-02, FR-CHECKOUT-04, FR-CHECKOUT-05 |
| AC-11 Successful COD checkout | FR-CHECKOUT-06, FR-CHECKOUT-08, FR-ORDER-01 to FR-ORDER-05 |
| AC-12 Generate order number | FR-ORDER-06, FR-ORDER-11 |
| AC-13 Reduce inventory | FR-ORDER-08 |
| AC-14 Clear cart | FR-ORDER-09 |
| AC-15 Order confirmation | FR-ORDER-07, FR-ORDER-10 |

## 10. Open Questions and Assumptions

The following decisions are adopted for the MVP baseline so development and test design have deterministic behavior. They remain change-controlled decisions rather than unapproved product expansion.

### 10.1 Resolved MVP Decisions

| ID | Decision | MVP contract | Impact |
| --- | --- | --- | --- |
| DEC-01 | Duplicate add over stock | Reject the entire add request when existing quantity plus requested quantity exceeds current stock. Keep the cart unchanged and return a stock conflict. | Resolves F-001; applies to BR-02, BR-03, FR-CART-04, FR-CART-11. |
| DEC-02 | Search behavior | Trim leading/trailing whitespace; use case-insensitive partial matching against product name OR brand. An empty search returns all active products. | Resolves F-003; applies to FR-PROD-03 and FR-PROD-04. |
| DEC-03 | Checkout validation | Trim text fields; reject whitespace-only values. Full name, phone, address, and city are required; each text field has a maximum length of 200 characters. Email, when supplied, must be valid and no more than 254 characters. Postal code, when supplied, must be 3-20 alphanumeric characters plus spaces or hyphens. Phone must contain 7-20 digits, allowing a leading `+`, spaces, hyphens, or parentheses. | Resolves F-004; applies to FR-CHECKOUT-02 to FR-CHECKOUT-05. |
| DEC-04 | Stale cart | Do not automatically mutate the cart. Block checkout/order submission when any cart quantity exceeds current stock, identify affected product(s) and current stock, and require the shopper to adjust or remove the item. | Resolves F-005; applies to BR-02, FR-CART-11, FR-CHECKOUT-09, FR-ORDER-02 and FR-ORDER-03. |
| DEC-05 | Order confirmation access | Bind an order to the creating guest session. A confirmation request must include the same session identifier; a different or missing session receives a generic not-found response and no order data. | Resolves F-002; applies to FR-ORDER-11 and privacy testing. |
| DEC-06 | Duplicate order submission | Place Order requires a client-generated idempotency key per checkout attempt. Repeating the same key returns the original order and does not create another order or reduce inventory again. | Resolves F-006; applies to FR-ORDER-04 to FR-ORDER-09. |
| DEC-07 | API error contract | Errors use JSON `{ error: { code, message, fields? } }`. Use 400 for malformed/validation requests, 404 for generic not-found, 409 for stock conflict or idempotency conflict, and 500 for unexpected failures without internal details. | Resolves F-007; applies to all API capabilities. |
| DEC-08 | Order identifier | Use a unique opaque public order number/token; it must not be sequential or the sole authorization control. Collision must be retried server-side. | Resolves F-008 and supports DEC-05. |
| DEC-09 | Performance gate | For the seeded MVP dataset and local workshop environment, p95 response time for product list, product detail, cart read, and order submission API requests must be <= 2 seconds at 5 concurrent users, with an error rate below 1%. | Resolves F-009; applies to NFR-02. |
| DEC-10 | Accessibility gate | MVP UI must support keyboard navigation, visible focus, associated labels and field errors, logical focus order, accessible names for controls, and responsive use at mobile and desktop viewport sizes. | Resolves F-010; applies to NFR-01 and NFR-06. |
| DEC-11 | Test isolation | Automated tests use a dedicated test SQLite database, deterministic seed/reset before each suite, and a unique session ID per test. Inventory fixtures support stock 0, 1, and N. | Resolves F-011; applies to NFR-08 and test execution. |

### 10.2 Remaining Assumptions

The following assumptions are accepted for MVP unless a change request supersedes them:

| ID | Topic | Current assumption | Impact |
| --- | --- | --- | --- |
| ASM-01 | Guest cart identity | A server-issued or client-generated anonymous session identifier is sent consistently with every cart/order request. | Cart persistence and API contract |
| ASM-02 | Currency | Product Brief examples use `$`; MVP uses one consistent currency and locale format across UI and API. | Display and order review |
| ASM-03 | Product image source | Seed data uses valid image URLs or a deterministic documented fallback placeholder. | Product-list/detail presentation |

No blocking open questions remain for MVP test design. Any change to DEC-01 through DEC-11 must update the affected requirements, user stories, acceptance criteria, API contract, and tests.

## 11. Traceability and Handoff

- **Source:** `Docs/Product_brief.md`
- **Requirements:** this document
- **Next BA artifact:** user stories and refined acceptance criteria
- **Developer input:** functional requirements, business rules, API capabilities, data requirements, constraints
- **Test input:** acceptance coverage, negative/boundary rules, and non-functional verification focus

Any requirement change must update this document and the affected user stories, acceptance criteria, implementation, and tests.
