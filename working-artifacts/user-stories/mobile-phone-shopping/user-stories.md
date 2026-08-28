# User Stories — Mobile Phone Shopping Web App

**Project:** Mobile Phone Shopping Web App  
**Release:** MVP 1.0  
**Artifact:** Guest-shopping MVP backlog  
**Audience:** Product Owner, BA, Developer, Test Engineer  
**Source:** [Requirements](../../requirements/mobile-phone-shopping/requirements.md) and [Product Brief](../../../Docs/Product_brief.md)  
**Date:** 2026-08-28  
**Status:** Draft for refinement

## 1. Backlog Context

### Business outcome

Enable an anonymous guest shopper to purchase an in-stock mobile phone using Cash on Delivery in one complete, reliable journey.

### Persona

**Guest Shopper:** an anonymous customer who does not register or log in, wants to find a mobile phone, and expects to complete a COD purchase with clear confirmation.

### Scope boundary

These stories cover only product discovery, product details, cart management, guest COD checkout, order processing, inventory reduction, cart clearing, and order confirmation. Account features, online payments, promotions, reviews, administration, shipping integration, and notifications are excluded from MVP 1.0.

## 2. Story Map and Delivery Order

| Order | ID | Story | Priority | Dependencies | Suggested slice |
| --- | --- | --- | --- | --- | --- |
| 1 | US-001 | Browse and search mobile phones | Must | Seeded active products | Product discovery |
| 2 | US-002 | View mobile phone details | Must | US-001 | Product evaluation |
| 3 | US-003 | Add an in-stock phone to cart | Must | US-002 | Cart entry |
| 4 | US-004 | Manage shopping cart quantities and items | Must | US-003 | Cart management |
| 5 | US-005 | Enter guest checkout information | Must | US-004 | Checkout data |
| 6 | US-006 | Review order and select COD | Must | US-005 | Pre-submission review |
| 7 | US-007 | Place order with inventory validation | Must | US-006 | Order transaction |
| 8 | US-008 | View order confirmation | Must | US-007 | Completion |

## 3. Detailed User Stories

### US-001 — Browse and Search Mobile Phones

**Epic:** Product Discovery  
**Priority:** Must  
**Actor:** Guest Shopper  
**Status:** Ready for refinement  
**Source:** FR-PROD-01 to FR-PROD-05; AC-01, AC-02, AC-03; BR-01

**User story**

> As a guest shopper, I want to browse and search active mobile phones by name or brand so that I can quickly find a phone I may want to buy.

**Preconditions**

- The application is available.
- Active product data exists in the system.

**Acceptance criteria**

1. **Display active products**
   - Given active mobile products exist
   - When the guest shopper opens the product-list page
   - Then the system displays each active product with name, brand, price, image, short description, and stock availability.

2. **Search by product name**
   - Given multiple active products exist
   - When the guest shopper enters a product-name search term
   - Then the system displays matching active products.

3. **Search by brand**
   - Given products from multiple brands exist
   - When the guest shopper enters a brand search term
   - Then the system displays products belonging to that brand.

4. **No matching result**
   - Given the search term does not match an active product name or brand
   - When the guest shopper submits the search
   - Then the system displays an empty-result state and does not display unrelated products.

5. **Unavailable product indication**
   - Given an active product has stock quantity zero
   - When the product appears in the list
   - Then the UI clearly marks it unavailable and does not present it as purchasable.

**Out of scope**

Advanced filters, sorting requirements, recommendations, promotions, and product comparison.

**NFR/test notes**

- Search and initial product display should meet the approximately 2-second normal-workshop response target.
- Verify the layout on desktop and mobile-sized screens.

**Dependencies and decisions**

- Depends on seeded product data.
- DEC-02 defines search semantics; ASM-02 defines currency formatting.
- ASM-03 defines the image URL or placeholder strategy.

### US-002 — View Mobile Phone Details

**Epic:** Product Discovery  
**Priority:** Must  
**Actor:** Guest Shopper  
**Status:** Ready for refinement  
**Source:** FR-PROD-06; FR-DETAIL-01 to FR-DETAIL-05; AC-04, AC-08; BR-01, BR-02

**User story**

> As a guest shopper, I want to view complete details for a selected phone so that I can decide whether it meets my needs before adding it to my cart.

**Preconditions**

- The selected product exists and is active.
- The product may be in stock or out of stock.

**Acceptance criteria**

1. **Display product details**
   - Given an active product exists
   - When the guest shopper selects the product
   - Then the detail view displays name, brand, price, image, description, key specifications, and available stock.

2. **Select a valid quantity**
   - Given the product has stock greater than zero
   - When the guest shopper selects a quantity from 1 through available stock
   - Then the system accepts the selected quantity.

3. **Minimum quantity boundary**
   - Given the guest shopper is viewing an in-stock product
   - When the shopper attempts to set quantity below 1
   - Then the system prevents the value and retains a quantity of at least 1.

4. **Maximum quantity boundary**
   - Given the product has stock quantity `N`
   - When the shopper attempts to set quantity greater than `N`
   - Then the system prevents the value from exceeding `N` and shows the current stock limit.

5. **Out-of-stock product**
   - Given the product has stock quantity zero
   - When the guest shopper opens its details
   - Then the system marks it unavailable and disables or rejects Add to Cart.

6. **Unknown product**
   - Given the selected product does not exist
   - When the guest shopper opens its detail URL
   - Then the system shows a not-found state and does not expose editable purchase controls.

**Out of scope**

Product reviews, ratings, comparison, wishlist, and variant selection.

**NFR/test notes**

- Product details must not expose protected server-side data.
- Verify quantity controls are usable with keyboard and on mobile screens.

**Dependencies and decisions**

- Depends on US-001 product selection and product-detail API.
- ASM-03 defines image fallback behavior.

### US-003 — Add an In-Stock Phone to Cart

**Epic:** Shopping Cart  
**Priority:** Must  
**Actor:** Guest Shopper  
**Status:** Ready for refinement  
**Source:** FR-CART-01, FR-CART-03, FR-CART-04; FR-DETAIL-05; AC-05, AC-06; BR-01, BR-03

**User story**

> As a guest shopper, I want to add an in-stock phone to my anonymous cart so that I can purchase it later during checkout.

**Preconditions**

- The shopper has a valid anonymous session.
- The selected product is active and has stock greater than zero.
- The requested quantity is at least 1 and does not exceed current stock.

**Acceptance criteria**

1. **Add product with default quantity**
   - Given an in-stock product is selected with quantity 1
   - When the shopper selects Add to Cart
   - Then the product is added to the current guest cart with quantity 1 and its current unit price.

2. **Add product with selected quantity**
   - Given an in-stock product is selected with a valid quantity
   - When the shopper selects Add to Cart
   - Then one cart line is created with the selected quantity.

3. **Duplicate product within stock**
   - Given the product already exists in the cart with quantity `Q`
   - When the shopper adds the same product with quantity `N`
   - And `Q + N` does not exceed current stock
   - Then the system increases the existing line to `Q + N` and does not create a duplicate line.

4. **Out-of-stock rejection**
   - Given a product has stock quantity zero
   - When the shopper attempts to add it to the cart
   - Then the system rejects the action and the cart remains unchanged.

5. **Duplicate or new quantity above stock rejection**
   - Given a product has current stock quantity `N`
   - When the shopper attempts to add a quantity that would make the cart quantity exceed `N`
   - Then the system rejects the entire request, keeps the cart unchanged, and returns a stock-conflict message.

6. **Cart total update**
   - Given a product is successfully added or its existing quantity is increased
   - When the cart is displayed
   - Then the item subtotal and cart total reflect unit price multiplied by quantity.

**Out of scope**

Coupons, discounts, reservations, wishlists, and authenticated or cross-device carts.

**NFR/test notes**

- Server-side validation is mandatory even when the UI constrains the quantity.
- Verify the cart is isolated by anonymous session ID.

**Dependencies and open questions**

- Depends on product stock and anonymous session handling.
- DEC-01 defines duplicate-add overflow behavior.
- DEC-07 defines the cart API error contract.

### US-004 — Manage Shopping Cart Quantities and Items

**Epic:** Shopping Cart  
**Priority:** Must  
**Actor:** Guest Shopper  
**Status:** Ready for refinement  
**Source:** FR-CART-02, FR-CART-05 to FR-CART-11; AC-07, AC-08, AC-09; BR-02, BR-04

**User story**

> As a guest shopper, I want to adjust or remove cart items so that my order contains the products and quantities I intend to buy.

**Preconditions**

- The anonymous cart can be retrieved.
- The cart contains zero or more valid cart items.

**Acceptance criteria**

1. **Display cart summary**
   - Given the cart contains items
   - When the shopper opens the cart
   - Then the system displays product name, image, unit price, quantity, subtotal, and total order amount.

2. **Increase quantity**
   - Given a cart item has quantity less than current product stock
   - When the shopper increases its quantity
   - Then the quantity, subtotal, and total are recalculated.

3. **Decrease quantity**
   - Given a cart item has quantity greater than 1
   - When the shopper decreases its quantity
   - Then the quantity, subtotal, and total are recalculated using the new quantity.

4. **Minimum quantity boundary**
   - Given a cart item has quantity 1
   - When the shopper attempts to decrease it
   - Then the system prevents a quantity below 1; removing the item is a separate action.

5. **Maximum quantity boundary**
   - Given a cart item's product has current stock quantity `N`
   - When the shopper attempts to set quantity greater than `N`
   - Then the system prevents the update and keeps the quantity at or below `N`.

6. **Stale cart inventory**
   - Given a cart item quantity is greater than the product's current stock
   - When the shopper attempts to proceed to checkout
   - Then checkout is blocked, the cart is not automatically changed, and the affected product and current stock are identified.

7. **Remove item**
   - Given a cart item exists
   - When the shopper selects Remove
   - Then the item is removed and the cart total is recalculated.

8. **Empty cart**
   - Given all cart items have been removed
   - When the shopper views the cart
   - Then the system displays an empty-cart state and does not allow proceeding to checkout.

9. **Continue shopping**
   - Given the shopper is viewing the cart
   - When the shopper selects Continue Shopping
   - Then the system returns to product browsing without losing the cart.

10. **Proceed to checkout**
   - Given the cart contains at least one valid item
   - When the shopper selects Proceed to Checkout
   - Then the system opens guest checkout with the current cart.

**Out of scope**

Cart sharing, saved carts, stock reservation, and multi-currency totals.

**NFR/test notes**

- All cart mutations must be validated on the server.
- Verify stale stock is handled safely when inventory changes after the cart was created.

**Dependencies and decisions**

- Depends on US-003 and current product inventory.
- DEC-04 defines stale-cart behavior.

### US-005 — Enter Guest Checkout Information

**Epic:** Guest Checkout  
**Priority:** Must  
**Actor:** Guest Shopper  
**Status:** Ready for refinement  
**Source:** FR-CHECKOUT-01 to FR-CHECKOUT-05; AC-10; BR-09, BR-11, BR-12

**User story**

> As a guest shopper, I want to enter my contact and shipping information without creating an account so that my order can be delivered.

**Preconditions**

- The cart contains at least one item.
- The shopper is not required to authenticate.

**Acceptance criteria**

1. **Guest access**
   - Given the cart contains items
   - When the shopper opens checkout
   - Then the shopper can access the checkout form without registration or login.

2. **Required fields**
   - Given the checkout form is displayed
   - When the shopper reviews the form
   - Then Full Name, Phone Number, Shipping Address, and City are marked as required.

3. **Optional fields**
   - Given the checkout form is displayed
   - When the shopper reviews the form
   - Then Email Address and Postal Code are available but not required.

4. **Missing or whitespace-only required data**
   - Given one or more required fields are empty
   - When the shopper attempts to continue or place the order
   - Then submission is prevented and an appropriate validation message identifies the missing data.

5. **Invalid optional email**
   - Given the shopper enters an email value
   - When the value is not a valid email format
   - Then submission is prevented and the email field shows a validation message.

6. **Invalid field boundaries**
   - Given a text field exceeds 200 characters, an email exceeds 254 characters, a phone is outside 7-20 digits, or a postal code is outside the defined format
   - When the shopper attempts to continue
   - Then submission is prevented and the affected field displays a validation message.

7. **Valid form data**
   - Given all required fields are valid and optional fields are empty or valid
   - When the shopper continues
   - Then the entered data is retained for the review step.

8. **Empty cart protection**
   - Given the cart becomes empty before checkout submission
   - When the shopper attempts to continue
   - Then the system prevents checkout progression and indicates that at least one item is required.

**Out of scope**

Address book, address autocomplete, account creation, login, phone verification, email notification, and SMS notification.

**NFR/test notes**

- Server-side validation must repeat all mandatory validation.
- Do not expose or log unnecessary personal data.
- DEC-03 defines the MVP phone validation contract.

**Dependencies and decisions**

- Depends on US-004.
- DEC-03 defines field validation rules.

### US-006 — Review Order and Select Cash on Delivery

**Epic:** Guest Checkout  
**Priority:** Must  
**Actor:** Guest Shopper  
**Status:** Ready for refinement  
**Source:** FR-CHECKOUT-06 to FR-CHECKOUT-08; AC-11; BR-08, BR-10

**User story**

> As a guest shopper, I want to review my order and choose Cash on Delivery so that I can confirm the purchase details before placing the order.

**Preconditions**

- The cart contains at least one item.
- Required checkout information has passed validation.

**Acceptance criteria**

1. **Review products and amounts**
   - Given valid checkout data and a non-empty cart
   - When the shopper opens the review step
   - Then the system displays each product, quantity, unit price, subtotal, and total amount.

2. **Review customer and shipping data**
   - Given the shopper has entered checkout data
   - When the review step is displayed
   - Then the system displays customer information and shipping address for confirmation.

3. **COD selection**
   - Given the MVP supports Cash on Delivery only
   - When the shopper reviews payment methods
   - Then COD is available and selected as the supported payment method.

4. **Prevent unsupported payment**
   - Given no online payment methods are in MVP scope
   - When the shopper reviews payment methods
   - Then the system does not offer credit card, debit card, e-wallet, or other unsupported payment methods.

5. **Place order action**
   - Given the review contains valid customer, cart, total, and COD information
   - When the shopper selects Place Order
   - Then the system submits the order for server-side validation and processing.

6. **Review reflects cart changes**
   - Given the shopper changes a cart item before placing the order
   - When the shopper returns to review
   - Then the review displays the updated quantity and recalculated amounts.

**Out of scope**

Online payment processing, payment authorization, saved payment methods, discounts, and tax calculation unless separately added by change request.

**NFR/test notes**

- Prices and totals shown for final submission must be revalidated server-side.
- Verify no unsupported payment method can be submitted through request manipulation.

**Dependencies and decisions**

- Depends on US-005 and US-004.
- DEC-02 defines search behavior; DEC-03 defines checkout validation; DEC-07 defines API errors.

### US-007 — Place Order with Inventory Validation

**Epic:** Order Processing  
**Priority:** Must  
**Actor:** Guest Shopper / System  
**Status:** Ready for refinement  
**Source:** FR-ORDER-01 to FR-ORDER-09; AC-11, AC-12, AC-13, AC-14; BR-05 to BR-08, BR-13 to BR-15

**User story**

> As a guest shopper, I want the system to validate and place my COD order atomically so that I am not charged for an unavailable product and inventory remains accurate.

**Preconditions**

- The cart contains at least one item.
- Required customer and shipping information is valid.
- Payment method is COD.
- The guest session identifies the cart.

**Acceptance criteria**

1. **Successful order creation**
   - Given the cart and checkout information are valid
   - And every requested quantity is within current inventory
   - When the shopper places the order
   - Then the system creates one order and one order item per cart line.

2. **Server-side total calculation**
   - Given the client submits cart and checkout data
   - When the system creates the order
   - Then the final total is calculated from trusted server-side unit prices and quantities as the sum of `unit price * quantity`.

3. **Unique order number**
   - Given an order is successfully created
   - When the system returns the order result
   - Then the order has a persisted unique order number.

4. **Initial pending status**
   - Given an order is successfully created
   - When the order is returned
   - Then its status is `Pending`.

5. **Inventory reduction**
   - Given an order is successfully created for quantity `Q`
   - When processing completes
   - Then the corresponding product inventory is reduced by `Q`.

6. **Cart clearing**
   - Given an order is successfully created
   - When processing completes
   - Then all items from the submitted guest cart are removed.

7. **Insufficient inventory**
   - Given at least one product has current stock below the requested quantity
   - When the shopper places the order
   - Then the system rejects the order, does not create any order or order items, does not reduce inventory, and does not clear the cart.

8. **Concurrent inventory safety**
   - Given inventory changes after the cart was created but before order submission
   - When the shopper places the order
   - Then the system validates current inventory and applies all order changes atomically or rejects the complete order.

9. **Invalid payment method**
   - Given a client submits a payment method other than COD
   - When the order request is processed
   - Then the system rejects the request and does not create an order.

10. **Empty cart**
    - Given the guest cart is empty
    - When the shopper submits an order
    - Then the system rejects the request and does not create an order.

11. **Repeated submission**
   - Given a checkout attempt has idempotency key `K` and the first request has already created an order
   - When the shopper repeats the request with the same key `K`
   - Then the system returns the original order and does not create another order or reduce inventory again.

**Out of scope**

Payment capture, shipping fulfillment, cancellation, refunds, notifications, and order-management workflows.

**NFR/test notes**

- Order creation, inventory reduction, and cart clearing must be one database transaction.
- Server must ignore client-supplied protected totals, prices, stock, status, and order number.
- API error responses must be safe and must not expose sensitive server details.

**Dependencies and decisions**

- Depends on US-006, product inventory, database transaction support, and idempotency-key persistence.
- DEC-05 defines session-bound confirmation access.
- DEC-06 defines repeated-submission behavior.
- DEC-08 defines the opaque order identifier.

### US-008 — View Order Confirmation

**Epic:** Order Completion  
**Priority:** Must  
**Actor:** Guest Shopper  
**Status:** Ready for refinement  
**Source:** FR-ORDER-06, FR-ORDER-07, FR-ORDER-10, FR-ORDER-11; AC-12, AC-15; BR-10, BR-12

**User story**

> As a guest shopper, I want to see a clear order confirmation after successful checkout so that I know my COD order was recorded and what will be delivered.

**Preconditions**

- The order was successfully created.
- The system has returned or can retrieve the unique order number.

**Acceptance criteria**

1. **Confirmation access**
   - Given an order is successfully created
   - When checkout processing completes
   - Then the shopper is directed to the order confirmation view.

2. **Confirmation details**
   - Given the confirmation view is displayed
   - Then it shows a confirmation message, order number, customer name, ordered products, quantities, unit prices, total amount, shipping address, payment method, and order status.

3. **COD and pending status**
   - Given the order was created under MVP rules
   - When the shopper views confirmation
   - Then payment method is shown as Cash on Delivery and status is shown as `Pending`.

4. **Order retrieval**
   - Given a valid order number exists
   - When the confirmation data is requested by order number
   - Then the system returns the corresponding order and order items.

5. **Unknown order number**
   - Given the requested order number does not exist
   - When confirmation data is requested
   - Then the system returns a not-found result and does not display another customer's order.

6. **Stable order values**
   - Given the order has been created
   - When the confirmation is viewed
   - Then the displayed item names, unit prices, quantities, and total match the persisted order snapshot.

7. **Cross-session protection**
   - Given an order was created under guest session `S1`
   - When a different session `S2` requests the order confirmation
   - Then the system returns a generic not-found result and does not reveal order data.

**Out of scope**

Order tracking, cancellation, customer order history, email/SMS confirmation, and returns/refunds.

**NFR/test notes**

- Confirmation should be usable on desktop and mobile-sized screens.
- Access to an unknown order number must not reveal order information.

**Dependencies and decisions**

- Depends on US-007 and session-bound order retrieval capability.
- DEC-05 defines cross-session protection and DEC-08 defines the opaque public identifier.

## 4. Cross-Story Rules

These rules apply across the backlog:

- Product availability and cart quantity must be validated both in the UI and on the server.
- The server is the source of truth for product price, stock, order total, status, and order number.
- A successful order must reduce inventory and clear the submitted cart as one consistent outcome.
- Cart and order requests must carry the anonymous session identifier; confirmation is available only to the creating session.
- Place Order must carry an idempotency key; repeating the same key returns the original order without duplicate inventory reduction.
- API errors use the standard JSON error envelope and status-code contract defined by DEC-07.
- No authentication is required anywhere in the MVP journey.
- Only COD is supported.
- The UI must meet the MVP keyboard, focus, label/error, responsive, performance, and test-isolation decisions.
- No story authorizes implementation of an out-of-scope capability.

## 5. Definition of Ready

A story is ready for sprint planning when:

- The actor, value, scope, and expected outcome are understood.
- Acceptance criteria cover the happy path and relevant negative/boundary behavior.
- Dependencies and decisions are resolved or explicitly accepted as assumptions.
- Required API, data, and screen impacts are identified.
- Test data and verification approach are available.
- The story can be completed as a vertical slice within one sprint.

## 6. Definition of Done

A story is done when:

- The acceptance criteria pass through appropriate UI/API tests.
- Server-side validation and business rules are implemented where applicable.
- Responsive behavior is verified for the affected UI.
- No critical console or server errors remain for the affected flow.
- Traceability from requirement to implementation and test is recorded.
- No out-of-scope functionality is introduced.

## 7. Traceability Matrix

| Story | Functional requirements | Business rules | Acceptance criteria |
| --- | --- | --- | --- |
| US-001 | FR-PROD-01 to FR-PROD-05 | BR-01 | AC-01 to AC-03 |
| US-002 | FR-PROD-06, FR-DETAIL-01 to FR-DETAIL-05 | BR-01, BR-02 | AC-04, AC-08 |
| US-003 | FR-CART-01, FR-CART-03, FR-CART-04; FR-DETAIL-05 | BR-01, BR-03 | AC-05, AC-06 |
| US-004 | FR-CART-02, FR-CART-05 to FR-CART-11 | BR-02, BR-04 | AC-07 to AC-09 |
| US-005 | FR-CHECKOUT-01 to FR-CHECKOUT-05 | BR-09, BR-11, BR-12 | AC-10 |
| US-006 | FR-CHECKOUT-06 to FR-CHECKOUT-08 | BR-08, BR-10 | AC-11 |
| US-007 | FR-ORDER-01 to FR-ORDER-09 | BR-05 to BR-08, BR-13 to BR-15 | AC-11 to AC-14 |
| US-008 | FR-ORDER-06, FR-ORDER-07, FR-ORDER-10, FR-ORDER-11 | BR-10, BR-12 | AC-12, AC-15 |

## 8. Open Questions and Assumptions

All tester findings have been resolved into the MVP decisions below. These are baseline decisions and require change control if stakeholders later select different behavior.

| ID | Decision | MVP treatment | Impacted stories |
| --- | --- | --- | --- | --- |
| DEC-01 | Duplicate add overflow | Reject the whole request and keep cart unchanged when total would exceed stock. | US-003, US-004 |
| DEC-02 | Search semantics | Trimmed, case-insensitive, partial name OR brand match; empty query returns active products. | US-001 |
| DEC-03 | Checkout validation | Explicit field lengths and formats defined in requirements. | US-005 |
| DEC-04 | Stale cart | Block checkout; do not auto-adjust cart; identify affected product and stock. | US-004, US-007 |
| DEC-05 | Order access | Bind confirmation to creating guest session; generic not-found for another session. | US-007, US-008 |
| DEC-06 | Duplicate submission | Same idempotency key returns original order without duplicate inventory reduction. | US-007 |
| DEC-07 | API errors | Standard JSON envelope and status-code contract. | US-003 to US-008 |
| DEC-08 | Public order identifier | Unique opaque identifier with server-side collision retry. | US-007, US-008 |
| DEC-09 | Performance | p95 <= 2 seconds at 5 concurrent users and <1% errors in local workshop environment. | US-001, US-002, US-004, US-007 |
| DEC-10 | Accessibility | Keyboard, focus, labels/errors, accessible names, logical order, responsive view. | US-001 to US-008 |
| DEC-11 | Test isolation | Dedicated DB, deterministic reset/seed, unique session per test, stock boundary fixtures. | US-003, US-004, US-007 |

## 9. Delivery Risks

| ID | Risk | Impact | Mitigation |
| --- | --- | --- | --- |
| R-01 | Inventory changes between cart update and order submission. | Overselling or failed checkout. | Revalidate stock during order transaction and test boundary/concurrent cases. |
| R-02 | Client submits manipulated prices, totals, status, or payment method. | Incorrect or unauthorized order data. | Calculate protected values server-side and reject unsupported fields/values. |
| R-03 | Guest session is not stable across requests. | Cart cannot be retrieved or cleared consistently. | Agree session contract early and cover it with API tests. |
| R-04 | Product image URLs are unavailable. | Product discovery/detail experience is degraded. | Provide seed images or a deterministic fallback. |

## 10. Next Actions

| Action | Owner | Expected output |
| --- | --- | --- |
| Review DEC-01 to DEC-11 with stakeholders | Product Owner / BA / Developer | Approved decisions or controlled change requests |
| Refine story estimates and sprint allocation | Product Owner / Scrum Team | Sprint-ready backlog |
| Create solution architecture and API/data design | Developer Agent | Architecture and design artifacts |
| Create prioritized functional and negative test cases | Test Agent | Test strategy and test cases |
| Validate MVP journey end to end | Developer / Test Agents | Passing build, API checks, and Playwright happy path |
