# Product Brief — Mobile Phone Shopping Web App

**Product Name:** Mobile Phone Shopping Web App
**Version:** MVP 1.0
**Status:** Agreed MVP Scope
**Date:** 2026-08-28
**Audience:** BA, Developers, Test Engineers, AI Agents, AI Harness

---

# 1. Product Vision

Build a simple web-based shopping application that allows customers to browse and purchase brand-new, high-demand mobile phones.

The MVP focuses on a complete **anonymous guest-shopping happy path**:

> Find a phone → View product details → Add to cart → Manage cart → Checkout → Place COD order → View order confirmation

The application is designed for an AI-powered software development workshop. A Harness will orchestrate specialized AI agents to transform this Product Brief into requirements, application design, source code, and automated tests.

The MVP should remain intentionally small so that the complete application can be generated, validated, and demonstrated efficiently.

---

# 2. Target User

## 2.1 Guest Shopper

The primary user is an anonymous customer who wants to purchase a brand-new mobile phone.

The customer:

* Does not need to register.
* Does not need to log in.
* Can browse available products.
* Can add products to a shopping cart.
* Can modify the shopping cart.
* Can complete checkout.
* Can pay using Cash on Delivery (COD).
* Can receive an order confirmation.

---

# 3. MVP Scope

The MVP consists of three core capabilities:

1. Browse and find mobile phones.
2. Manage the shopping cart.
3. Complete guest checkout using Cash on Delivery.

The application must support the complete happy path from product discovery to successful order confirmation.

---

# 4. Feature 1 — Browse and Find Mobile Phones

Customers can browse available mobile phones and find a product they are interested in purchasing.

## 4.1 Product List

The product list should display:

* Product name
* Brand
* Price
* Product image
* Short description
* Stock availability

Customers should be able to:

* View available products.
* Search products by product name.
* Search products by brand.
* Select a product to view its details.

## 4.2 Product Detail

The product detail page should display:

* Product name
* Brand
* Price
* Product image
* Product description
* Key specifications
* Available stock
* Quantity selector
* Add to Cart button

## 4.3 Product Availability

Customers must not be able to purchase a product when its available stock is zero.

The UI should clearly indicate when a product is unavailable.

---

# 5. Feature 2 — Shopping Cart

Customers can add mobile phones to their shopping cart.

The cart should display:

* Product name
* Product image
* Unit price
* Quantity
* Subtotal
* Total order amount

Customers can:

* Increase quantity.
* Decrease quantity.
* Remove an item.
* Continue shopping.
* Proceed to checkout.

## 5.1 Cart Business Rules

### BR-CART-01 — Minimum Quantity

The quantity of each cart item must be at least 1.

### BR-CART-02 — Maximum Quantity

The quantity of a cart item must not exceed the available product stock.

### BR-CART-03 — Duplicate Product

If a customer adds a product that already exists in the cart, the system should increase the existing quantity rather than create a duplicate cart line.

### BR-CART-04 — Cart Total

The cart total must be recalculated whenever:

* An item is added.
* Quantity is changed.
* An item is removed.

### BR-CART-05 — Out-of-Stock Product

A product with zero available stock cannot be added to the cart.

---

# 6. Feature 3 — Guest Checkout

Customers can complete an order without creating an account or logging in.

## 6.1 Checkout Information

The checkout form should collect:

### Required

* Full name
* Phone number
* Shipping address
* City

### Optional

* Email address
* Postal code

## 6.2 Payment Method

The MVP supports only:

> Cash on Delivery (COD)

No online payment is required.

## 6.3 Order Review

Before placing the order, the customer should be able to review:

* Products
* Quantity
* Unit price
* Subtotal
* Total amount
* Customer information
* Shipping address
* Payment method

The customer can then select:

> Place Order

---

# 7. Order Processing

When the customer successfully places an order, the system must:

1. Validate the checkout information.
2. Validate product availability.
3. Create the order.
4. Generate a unique order number.
5. Create order items.
6. Calculate the final order total.
7. Reduce product inventory.
8. Clear the customer's cart.
9. Display the order confirmation page.

The order should initially have the status:

> Pending

---

# 8. Order Confirmation

After a successful order, the customer should be redirected to an order confirmation page.

The confirmation page should display:

* Confirmation message
* Order number
* Customer name
* Ordered products
* Quantity
* Unit price
* Total amount
* Shipping address
* Payment method
* Order status

Example:

```text
Order Confirmed

Thank you for your order!

Order Number: ORD-20260828-0001
Customer: John Smith

Items:
iPhone 16       x1     $799
Galaxy S25      x1     $799

Total: $1,598

Payment Method: Cash on Delivery
Status: Pending

Shipping Address:
123 Main Street
Ho Chi Minh City
```

---

# 9. Business Rules

## BR-01 — Product Availability

Only products with stock greater than zero can be purchased.

## BR-02 — Cart Quantity

A cart item quantity must be between 1 and the currently available stock.

## BR-03 — Duplicate Cart Item

Adding an existing product to the cart increases its quantity instead of creating a duplicate cart item.

## BR-04 — Inventory Validation

The system must validate stock availability when an order is submitted.

The system must not create an order if the requested quantity exceeds available inventory.

## BR-05 — Inventory Reduction

Inventory is reduced only after a successful order is created.

## BR-06 — Order Total

The order total is calculated as:

> Sum of Unit Price × Quantity for all order items

## BR-07 — Guest Checkout

Authentication is not required to place an order.

## BR-08 — Payment Method

The only supported payment method is Cash on Delivery.

## BR-09 — Required Customer Information

Full name, phone number, shipping address, and city are required.

## BR-10 — Order Number

Every successfully created order must have a unique order number.

## BR-11 — Cart Clearing

After a successful order, the customer's cart must be empty.

## BR-12 — Order Status

Newly created orders must have the status:

> Pending

---

# 10. Out of Scope

The following capabilities are explicitly excluded from the MVP:

* Customer registration
* Customer login
* Social login
* Customer account management
* Online payment
* Credit card payment
* Debit card payment
* E-wallet payment
* Order cancellation
* Order tracking
* Product reviews
* Product ratings
* Wishlist
* Product comparison
* Discount codes
* Coupons
* Promotions
* Advanced filtering
* Product recommendations
* Admin dashboard
* Product management UI
* Order management UI
* Returns
* Refunds
* Shipping provider integration
* Email notifications
* SMS notifications
* Customer loyalty program

AI agents must not implement these features unless an explicit change request is provided.

---

# 11. Sample Product Data

The system should contain seed data so the application can be demonstrated immediately after installation.

The following sample products may be used:

| Product    | Brand   |  Price | Stock |
| ---------- | ------- | -----: | ----: |
| iPhone 16  | Apple   | 799.00 |    10 |
| Galaxy S25 | Samsung | 799.00 |    10 |
| Pixel 9    | Google  | 699.00 |    10 |
| Xiaomi 15  | Xiaomi  | 599.00 |    10 |
| OnePlus 13 | OnePlus | 699.00 |    10 |

The implementation may add reasonable product descriptions, specifications, and image URLs.

The sample data should be sufficient to demonstrate:

* Product browsing
* Product search
* Product details
* Add to cart
* Quantity management
* Checkout
* Order creation
* Inventory reduction

---

# 12. Main User Journey

The primary happy path is:

```text
Home / Product List
        |
        v
Search / Browse Products
        |
        v
Product Details
        |
        v
Add to Cart
        |
        v
Shopping Cart
        |
        +----> Update Quantity
        |
        +----> Remove Item
        |
        v
Checkout
        |
        +----> Enter Customer Information
        |
        +----> Enter Shipping Address
        |
        +----> Select COD
        |
        v
Review Order
        |
        v
Place Order
        |
        v
Validate Stock
        |
        v
Create Order
        |
        +----> Reduce Inventory
        |
        +----> Clear Cart
        |
        v
Order Confirmation
```

---

# 13. Acceptance Criteria

## AC-01 — Display Products

**Given** products are available in the system
**When** the customer opens the application
**Then** the system displays the available mobile phones with their basic information.

---

## AC-02 — Search by Product Name

**Given** multiple products exist
**When** the customer searches using a product name
**Then** the system displays products matching the search criteria.

---

## AC-03 — Search by Brand

**Given** products from multiple brands exist
**When** the customer searches using a brand name
**Then** the system displays products belonging to that brand.

---

## AC-04 — View Product Details

**Given** a product exists
**When** the customer selects the product
**Then** the system displays the product details, price, specifications, and stock availability.

---

## AC-05 — Add Product to Cart

**Given** a product is in stock
**When** the customer selects Add to Cart
**Then** the product is added to the shopping cart with quantity 1.

---

## AC-06 — Add Existing Product

**Given** a product already exists in the cart
**When** the customer adds the same product again
**Then** the system increases the existing quantity instead of creating a duplicate cart line.

---

## AC-07 — Update Quantity

**Given** a product exists in the cart
**When** the customer changes its quantity
**Then** the system updates the quantity and recalculates the subtotal and total amount.

---

## AC-08 — Prevent Quantity Above Stock

**Given** a product has limited stock
**When** the customer attempts to set a quantity greater than available stock
**Then** the system prevents the quantity from exceeding available stock.

---

## AC-09 — Remove Cart Item

**Given** a product exists in the cart
**When** the customer removes the product
**Then** the product is removed and the cart total is recalculated.

---

## AC-10 — Checkout Validation

**Given** the customer has items in the cart
**When** required checkout information is missing
**Then** the system prevents order submission and displays appropriate validation messages.

---

## AC-11 — Successful COD Checkout

**Given** the cart contains valid products
**And** the required checkout information is valid
**And** Cash on Delivery is selected
**When** the customer places the order
**Then** the system creates the order successfully.

---

## AC-12 — Generate Order Number

**Given** an order is successfully created
**When** the customer reaches the confirmation page
**Then** the system displays a unique order number.

---

## AC-13 — Reduce Inventory

**Given** an order is successfully created
**When** the order is completed
**Then** the purchased quantity is deducted from product inventory.

---

## AC-14 — Clear Cart

**Given** an order is successfully created
**When** the customer returns to the shopping cart
**Then** the cart contains no items from the completed order.

---

## AC-15 — Order Confirmation

**Given** an order has been successfully created
**When** the customer is redirected to the confirmation page
**Then** the page displays:

* Order number
* Customer information
* Ordered products
* Quantity
* Total amount
* Shipping information
* COD payment method
* Pending order status

---

# 14. Non-Functional Requirements

## NFR-01 — Usability

The application should provide a simple and intuitive shopping experience.

A new user should be able to complete the main purchase journey without additional instructions.

## NFR-02 — Performance

Under normal workshop conditions, typical API and page requests should respond within approximately 2 seconds.

## NFR-03 — Validation

User input must be validated before processing.

Server-side validation is mandatory.

## NFR-04 — Security

The application should:

* Validate all user input.
* Avoid exposing sensitive server-side information.
* Use safe database access mechanisms.
* Validate product and inventory information on the server.
* Prevent clients from directly modifying protected order data.

## NFR-05 — Reliability

The application must not create an order when the requested product quantity is greater than available stock.

## NFR-06 — Responsive UI

The application should be usable on desktop and mobile-sized screens.

## NFR-07 — Maintainability

The codebase should have a clear separation between:

* UI
* API
* Business logic
* Database access

---

# 15. Technical Constraints

The MVP should use the following technology stack.

## Frontend

* React
* Vite
* JavaScript or TypeScript
* HTML
* CSS

## Backend

* Node.js
* Express.js

## Database

* SQLite

## ORM

* Prisma

## API

* REST API
* JSON

## Testing

* Playwright for end-to-end UI testing
* API-level testing where appropriate

## Development Environment

The application should be runnable locally using standard npm commands.

The project should provide clear setup instructions including:

```text
npm install
npm run dev
```

Database initialization and seed commands should also be documented.

---

# 16. Initial Data Model

The application should support at least the following entities.

## 16.1 Product

```text
Product
-------
id
name
brand
description
price
stockQuantity
imageUrl
specifications
isActive
createdAt
updatedAt
```

## 16.2 Cart

```text
Cart
----
id
sessionId
createdAt
updatedAt
```

## 16.3 CartItem

```text
CartItem
--------
id
cartId
productId
quantity
unitPrice
```

## 16.4 Order

```text
Order
-----
id
orderNumber
customerName
phoneNumber
email
shippingAddress
city
postalCode
paymentMethod
status
totalAmount
createdAt
updatedAt
```

## 16.5 OrderItem

```text
OrderItem
---------
id
orderId
productId
productName
unitPrice
quantity
subtotal
```

The final database design may be refined by the Developer Agent while preserving all business requirements defined in this Product Brief.

---

# 17. Expected API Capabilities

The backend should provide APIs supporting the MVP functionality.

The exact endpoint design is the responsibility of the Developer Agent, but the application should support capabilities equivalent to:

```text
GET    /api/products
GET    /api/products/:id

GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/:id
DELETE /api/cart/items/:id

POST   /api/orders
GET    /api/orders/:orderNumber
```

The Developer Agent may adjust endpoint names or structure if the resulting design remains consistent with the Product Brief.

---

# 18. Expected UI Pages

The application should contain at least:

## Home / Product List

Purpose:

* Display products
* Search products
* Navigate to product details
* Navigate to cart

## Product Details

Purpose:

* Display complete product information
* Display stock
* Select quantity
* Add product to cart

## Shopping Cart

Purpose:

* Display cart items
* Change quantity
* Remove items
* Display total
* Continue shopping
* Proceed to checkout

## Checkout

Purpose:

* Collect customer information
* Collect shipping information
* Select COD
* Review order
* Place order

## Order Confirmation

Purpose:

* Confirm successful order
* Display order number
* Display order summary
* Display shipping information
* Display payment method
* Display order status

---

# 19. Definition of Done

The MVP is considered complete when all of the following are satisfied:

### Functional

* Product browsing works.
* Product search works.
* Product details work.
* Add to Cart works.
* Duplicate products are handled correctly.
* Cart quantity management works.
* Remove from Cart works.
* Cart totals are calculated correctly.
* Checkout validation works.
* COD checkout works.
* Order creation works.
* Order number generation works.
* Inventory is reduced after successful order creation.
* Cart is cleared after successful checkout.
* Order confirmation is displayed.

### Technical

* React application runs successfully.
* Node.js/Express API runs successfully.
* SQLite database works successfully.
* Prisma migrations work.
* Seed data is available.
* Frontend communicates with backend through APIs.
* No critical console or server errors remain.

### Testing

* Critical happy-path scenarios have automated tests.
* Playwright can execute the main shopping journey.
* Tests cover at least:

  * Product browsing
  * Product search
  * Add to cart
  * Cart update
  * Checkout
  * Successful order creation
  * Order confirmation

### Demonstration

The complete happy path should be demonstrable in approximately 5 minutes:

> Search phone → View details → Add to Cart → Checkout → COD → Place Order → Order Confirmation

---

# 20. AI Harness Requirements

This Product Brief is the **initial source of truth** for an AI-powered software development Harness.

The Harness should orchestrate specialized AI agents rather than relying on one agent to perform the entire software development process.

The expected workflow is:

```text
Product Brief
      |
      v
+----------------+
|    BA Agent    |
+-------+--------+
        |
        v
Requirements
User Stories
Acceptance Criteria
Open Questions
        |
        v
+---------------------+
|  Developer Agent    |
+----------+----------+
           |
           v
Architecture
Database Design
API Design
React UI
Backend Implementation
        |
        v
+---------------------+
|     Test Agent      |
+----------+----------+
           |
           v
Test Strategy
Test Scenarios
Test Cases
        |
        v
+--------------------------+
| Test Automation Agent   |
+------------+-------------+
             |
             v
Playwright Tests
             |
             v
+--------------------------+
| Validation / Feedback   |
+------------+-------------+
             |
       Tests / Build
        /          \
      Fail         Pass
       |             |
       v             v
Developer Agent     DONE
       |
       v
Fix Implementation
       |
       +--------------------> Test Again
```

---

# 21. Agent Responsibilities

## BA Agent

The BA Agent should:

* Analyze the Product Brief.
* Identify business requirements.
* Create user stories.
* Refine acceptance criteria.
* Identify ambiguities.
* Identify open questions.
* Avoid introducing features outside MVP scope.

Expected outputs:

```text
requirements.md
user-stories.md
acceptance-criteria.md
open-questions.md
```

---

## Developer Agent

The Developer Agent should:

* Read the BA outputs.
* Design the application architecture.
* Design the database schema.
* Implement the backend.
* Implement the REST APIs.
* Implement the React frontend.
* Implement validation.
* Implement business rules.
* Seed the database.
* Run/build the application.
* Fix implementation issues identified during validation.

Expected outputs include:

```text
architecture.md
database schema
backend source code
frontend source code
API implementation
database migrations
seed data
```

---

## Test Agent

The Test Agent should:

* Analyze the Product Brief.
* Analyze the requirements.
* Identify functional risks.
* Design test scenarios.
* Design test cases.
* Identify negative and boundary scenarios.
* Prioritize critical tests.

Expected outputs:

```text
test-strategy.md
test-scenarios.md
test-cases.md
```

---

## Test Automation Agent

The Test Automation Agent should:

* Read approved test cases.
* Implement Playwright tests.
* Execute the tests.
* Report failures.
* Avoid creating tests for out-of-scope functionality.

Expected outputs:

```text
Playwright test scripts
test execution results
test failure reports
```

---

# 22. Harness Rules

The Harness must enforce the following rules.

## Rule 1 — Product Brief Is the Source of Truth

All agents must use this Product Brief as the initial business source of truth.

## Rule 2 — Respect MVP Scope

Agents must not implement features listed in the Out of Scope section unless an explicit change request is provided.

## Rule 3 — Do Not Guess Critical Requirements

If an important requirement is ambiguous and affects architecture, business behavior, security, or testing, the appropriate agent should record it as an Open Question instead of silently inventing a requirement.

## Rule 4 — Preserve Traceability

Requirements should be traceable through:

```text
Product Brief
      ↓
Requirement
      ↓
User Story
      ↓
Acceptance Criteria
      ↓
Implementation
      ↓
Test Case
      ↓
Automated Test
```

## Rule 5 — Validate Before Completion

The Harness must not consider the application complete merely because source code has been generated.

The application should be:

1. Built.
2. Started.
3. Tested.
4. Validated against acceptance criteria.
5. Fixed when critical failures are found.

## Rule 6 — Avoid Unnecessary Complexity

The implementation should remain appropriate for an MVP workshop.

Agents should prefer simple, maintainable solutions over unnecessary enterprise-level architecture.

---

# 23. Success Criteria

The workshop is successful when the Harness can take this Product Brief as its initial input and coordinate the AI agents to produce a working Shopping Web App MVP with minimal manual coding.

The generated application must support the complete happy path:

```text
Browse
  ↓
Search
  ↓
Product Details
  ↓
Add to Cart
  ↓
Manage Cart
  ↓
Checkout
  ↓
Cash on Delivery
  ↓
Place Order
  ↓
Inventory Updated
  ↓
Cart Cleared
  ↓
Order Confirmation
```

The final application should be runnable locally and demonstrable in approximately 5 minutes.

---

# 24. Future Enhancements

The following capabilities may be considered after the MVP:

* Customer registration and login
* Admin portal
* Product management
* Order management
* Online payment
* Order tracking
* Product reviews
* Ratings
* Wishlist
* Promotions
* Discount codes
* Inventory management
* Email notifications
* Shipping integration
* Customer order history

These features are intentionally excluded from MVP 1.0.
