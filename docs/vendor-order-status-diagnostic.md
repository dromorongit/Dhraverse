# Dhream Market — Vendor Order Status Update Diagnostic

**Phase:** 1 — diagnostic only  
**Date:** 2026-09-09  
**Constraint:** READ-ONLY. No application code was changed while producing this report.  
**Scope:** Vendor order details page, order-status APIs, Prisma schema, related vendor controls, and status-change side effects.

## Executive conclusion

The matching vendor order details page is:

- Route wrapper: `app/dashboard/vendor/orders/[id]/page.tsx`
- Client UI: `app/dashboard/vendor/orders/[id]/page.client.tsx`
- Route validation: `app/dashboard/vendor/orders/[id]/validation.tsx`

The page displays order status, vendor acceptance status, and progress, but it has **no control for advancing the order lifecycle status** (`Processing → Shipped → Delivered → Completed`). The only order-mutation controls on the page are **Accept Order** and **Reject Order**.

A vendor API capable of updating `Order.status` already exists, but it currently allows direct jumps among its accepted values rather than enforcing the five-step sequence. The separate fulfillment-status workflow is sequential, but its intended final `COMPLETED` value is missing from the Prisma enum. A scoping decision is therefore required between:

1. **UI-only:** wire the detail page to the existing vendor order PATCH route.
2. **API plus UI:** add transition guards and resolve the fulfillment-status/schema inconsistencies before exposing the control.
3. **Broader workflow change:** define separate behavior for normal orders and pre-order/backorder fulfillment.

## 1. Vendor order details page

### Exact files

| Purpose | File |
|---|---|
| Route wrapper | `app/dashboard/vendor/orders/[id]/page.tsx:1-10` |
| Main client page | `app/dashboard/vendor/orders/[id]/page.client.tsx:1-854` |
| Vendor/session validation | `app/dashboard/vendor/orders/[id]/validation.tsx:1-43` |

The client fetches the order from:

```text
GET /api/vendor/orders/[orderId]
```

See `app/dashboard/vendor/orders/[id]/page.client.tsx:136-155`.

The API only returns paid orders containing products from the authenticated vendor's store (`app/api/vendor/orders/[orderId]/route.ts:61-104`). Unpaid/pending-payment orders are therefore not available through this details endpoint.

### Current UI inventory

| UI area | Location | Current behavior |
|---|---|---|
| Payment badge | `page.client.tsx:589-596` | Read-only display |
| Order status badge | `page.client.tsx:597-604` | Read-only display |
| Vendor acceptance badge | `page.client.tsx:605-612` | Read-only display |
| Normal-order progress | `page.client.tsx:357-420` | Read-only five-step progress based on `order.status` |
| Pre-order/backorder progress | `page.client.tsx:264-353` | Read-only progress based on `order.fulfillmentStatus` |
| Accept/Reject actions | `page.client.tsx:615-687` | Active mutation controls |
| Rejection reason dialog | `page.client.tsx:655-687` | Active rejection form |
| Refund response dialog | `page.client.tsx:797-834` | Message/refund-response controls |
| Lifecycle status update control | None | No button, dropdown, form, or hidden control |

The page has no lifecycle-status handler such as `handleStatusUpdate`, no status dropdown, and no “Mark as Shipped/Delivered/Completed” control. The `updatingStatus` state at `page.client.tsx:122` is used only by the Accept/Reject flow.

The only PATCH request sent by this page is:

```ts
body: JSON.stringify({
  action,
  rejectionReason: reason,
})
```

See `app/dashboard/vendor/orders/[id]/page.client.tsx:185-226`.

A full read of the client file and targeted searches found no hidden, disabled, conditional, commented-out, or dead lifecycle-status update control. The progress bars and status configuration are display-only.

## 2. Existing order-status APIs

### Primary vendor route

**Route:** `PATCH /api/vendor/orders/[orderId]`  
**File:** `app/api/vendor/orders/[orderId]/route.ts:137-445`

The handler accepts:

```ts
const { status, fulfillmentStatus, action, rejectionReason } = body
```

See `route.ts:157-160`.

#### Authorization and access

The caller must:

- Be authenticated with a token (`route.ts:142-145`)
- Have role `VENDOR` (`route.ts:147-150`)
- Be onboarded (`route.ts:152-155`)
- Own a store containing products in the order (`route.ts:161-190`)
- Be updating a paid order (`paymentStatus: 'PAID'`) (`route.ts:179-190`)

#### Accept/Reject actions

Allowed actions are defined at `route.ts:16-17`:

```ts
['accept', 'reject']
```

**Accept** sets:

- `vendorAccepted = true`
- `vendorRejected = false`
- `vendorRejectionReason = null`

See `route.ts:210-220`.

Accept does not advance `status` or `fulfillmentStatus`.

**Reject** requires a non-empty reason and sets:

- `vendorAccepted = false`
- `vendorRejected = true`
- `vendorRejectionReason = <reason>`
- `status = CANCELLED`
- `fulfillmentStatus = CANCELLED`
- `paymentStatus = REFUNDED` when the order was paid

See `route.ts:220-256`.

For normal orders, rejection also releases reserved stock through `releaseStock` (`route.ts:243-251`).

#### Direct `status` updates

The vendor route defines these accepted values at `route.ts:13-14`:

```ts
const VENDOR_VALID_STATUSES = [
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED'
]
```

Validation occurs at `route.ts:297-312`.

Important: the route validates only the target value. It does **not** compare the target with the current `existingOrder.status`.

Consequently, a vendor can currently request any allowed target directly, including:

- `PROCESSING → SHIPPED`
- `PROCESSING → COMPLETED`
- `SHIPPED → PROCESSING`
- `SHIPPED → COMPLETED`
- `DELIVERED → PROCESSING`

The only explicit guard is that a rejected order cannot be updated (`route.ts:304-310`).

`PENDING` and `CANCELLED` are not accepted as direct `status` values. `CANCELLED` is reached through rejection, customer cancellation, payment failure, or an admin update.

#### `fulfillmentStatus` updates through the same route

The route declares this transition map at `route.ts:327-334`:

```text
AWAITING_STOCK    -> READY_TO_FULFILL
AWAITING_RESTOCK  -> READY_TO_FULFILL
READY_TO_FULFILL  -> PROCESSING
PROCESSING        -> SHIPPED
SHIPPED           -> DELIVERED
DELIVERED         -> COMPLETED
```

The transition is enforced at `route.ts:336-341`.

However, `OrderFulfillmentStatus` in `prisma/schema.prisma:1383-1392` does **not** contain `COMPLETED`. The final API transition therefore targets a value that the current Prisma enum cannot store.

The route also does not synchronize `status` and `fulfillmentStatus`; they can be updated independently and can diverge.

### Vendor fulfillment route

**Route:** `PATCH /api/vendor/fulfillment`  
**File:** `app/api/vendor/fulfillment/route.ts:172-285`

This route:

- Requires a vendor and onboarding (`route.ts:174-190`)
- Accepts `{ orderId, fulfillmentStatus }` (`route.ts:192-200`)
- Only matches paid `PREORDER` or `BACKORDER` orders (`route.ts:215-233`)
- Enforces the sequential transition map (`route.ts:242-248`)
- Updates only `fulfillmentStatus` (`route.ts:250-253`)
- Records a fulfillment event (`route.ts:255-271`)

It does not update `Order.status`.

### Other relevant mutation routes

| Route | Actor | Current behavior |
|---|---|---|
| `PATCH /api/admin/orders/[id]` | Admin/Super Admin | Directly accepts any `OrderStatus` and `PaymentStatus`; no transition guards (`app/api/admin/orders/[id]/route.ts:137-248`) |
| `PATCH /api/orders/[orderId]/cancel` | Customer | Allows cancellation from `PENDING` or `PROCESSING`; sets status and fulfillment status to `CANCELLED`, optionally refunds (`app/api/orders/[orderId]/cancel/route.ts:14-155`) |
| `POST /api/payment/verify` | Authenticated payment verification | Payment success changes `PENDING → PROCESSING`; failure/abandon/cancel changes the order to `CANCELLED` (`app/api/payment/verify/route.ts:74-155`) |
| Paystack webhook | Payment webhook | Same payment-success and payment-failure transitions (`lib/webhooks/order-webhook-handler.ts:54-148`) |

No vendor `PUT` order-status route was identified; the relevant vendor mutation method is `PATCH`.

## 3. Prisma schema and transition model

### `Order` fields

File: `prisma/schema.prisma:463-513`

| Field | Type | Default | Meaning |
|---|---|---:|---|
| `status` | `OrderStatus` | `PENDING` | Main order lifecycle |
| `paymentStatus` | `PaymentStatus` | `PENDING` | Payment lifecycle |
| `vendorAccepted` | `Boolean` | `false` | Vendor acceptance flag |
| `vendorRejected` | `Boolean` | `false` | Vendor rejection flag |
| `vendorRejectionReason` | `String?` | — | Rejection reason |
| `orderType` | `OrderType` | `NORMAL` | Normal, preorder, or backorder |
| `fulfillmentStatus` | `OrderFulfillmentStatus` | `PENDING` | Fulfillment-specific lifecycle |
| `inventoryConsumedAt` | `DateTime?` | — | Inventory-consumption idempotency marker |

### `OrderStatus`

File: `prisma/schema.prisma:1202-1209`

```text
PENDING
PROCESSING
SHIPPED
DELIVERED
COMPLETED
CANCELLED
```

### `OrderFulfillmentStatus`

File: `prisma/schema.prisma:1383-1392`

```text
PENDING
AWAITING_STOCK
AWAITING_RESTOCK
READY_TO_FULFILL
PROCESSING
SHIPPED
DELIVERED
CANCELLED
```

`COMPLETED` is absent.

### `OrderType`

File: `prisma/schema.prisma:1371-1374`

```text
NORMAL
PREORDER
BACKORDER
```

### Effective transition rules

The schema has no database-level transition constraints. Rules exist in application code.

| Field/route | Effective rule |
|---|---|
| Vendor `status` | Any of `PROCESSING`, `SHIPPED`, `DELIVERED`, `COMPLETED`; no sequential guard |
| Vendor `fulfillmentStatus` | Sequential map, but final `COMPLETED` target is not schema-valid |
| Admin `status` | Any enum value; no guard |
| Customer cancellation | `PENDING`/`PROCESSING` → `CANCELLED` |
| Payment success | `PENDING` → `PROCESSING` |
| Payment failure | `PENDING` → `CANCELLED` |

### Schema/UI/API inconsistencies

The following files include or target `COMPLETED` for fulfillment even though the Prisma enum does not:

- `app/dashboard/vendor/orders/[id]/page.client.tsx:96-112`
- `app/dashboard/vendor/fulfillment/page.client.tsx:37-46`
- `app/api/vendor/orders/[orderId]/route.ts:327-334`
- `app/api/vendor/fulfillment/route.ts:9-17`

The fulfillment list UI's `FULFILLMENT_TRANSITIONS` stops at `SHIPPED → DELIVERED` (`app/dashboard/vendor/fulfillment/page.client.tsx:48-54`), while the API maps include `DELIVERED → COMPLETED`. This indicates that completion is represented inconsistently between the normal-order `status` field and the fulfillment-status field.

## 4. Equivalent controls elsewhere in the vendor dashboard

### Vendor orders list

File: `app/dashboard/vendor/orders/page.client.tsx`

The list page has:

- Search
- Pagination
- A status filter at `page.client.tsx:205-219`

The filter includes `PROCESSING`, `SHIPPED`, `DELIVERED`, `COMPLETED`, and `CANCELLED`, but it only changes the fetch query. It does not update an order.

There is no lifecycle status-update control on the vendor orders list.

### Pre-order/backorder fulfillment page

File: `app/dashboard/vendor/fulfillment/page.client.tsx`

This is the only active order-status-like control found elsewhere in the vendor dashboard.

- Update handler: `page.client.tsx:111-138`
- Status buttons: `page.client.tsx:304-312`
- API call: `PATCH /api/vendor/fulfillment`
- Payload: `{ orderId, fulfillmentStatus: newStatus }`

It applies only to pre-orders and backorders. It is not an equivalent control for normal orders.

## 5. Downstream effects of status changes

### Vendor order PATCH route

File: `app/api/vendor/orders/[orderId]/route.ts`

#### Order persistence

The route updates `Order.status` and/or `Order.fulfillmentStatus` in Prisma (`route.ts:345-348`).

#### Inventory consumption

When either target field is `DELIVERED` or `COMPLETED` and the order is `NORMAL`, the route calls `consumeInventory` (`route.ts:324-362`).

`consumeInventory`:

- Decrements product stock and reserved quantity
- Handles product variants
- Sets `Order.inventoryConsumedAt`
- Is idempotent when `inventoryConsumedAt` is already set

See `lib/stock-reservation.ts:368-514`.

It also creates `INVENTORY_CONSUMED` audit logs (`lib/stock-reservation.ts:492-504`). The vendor route additionally records `INVENTORY_CONSUMED` fulfillment events for consumed items (`route.ts:350-360`).

#### Fulfillment events

The route records a fulfillment event for the requested status (`route.ts:364-389`).

Mappings include:

```text
PROCESSING -> PROCESSING
SHIPPED    -> SHIPPED
DELIVERED  -> DELIVERED
COMPLETED  -> DELIVERED
```

`COMPLETED` is therefore logged as a `DELIVERED` event, not as a distinct `COMPLETED` event.

`recordFulfillmentEvent` creates a `FulfillmentEvent` row and invokes customer notification/email helpers (`lib/fulfillment-events.ts:134-213`).

The `FulfillmentEvent` model is defined at `prisma/schema.prisma:1125-1138`.

#### Customer notifications and email

Normal status updates trigger customer in-app notifications indirectly through `recordFulfillmentEvent`. The event notification map includes `PROCESSING`, `SHIPPED`, `DELIVERED`, and `INVENTORY_CONSUMED` (`lib/fulfillment-events.ts:220-267`).

The vendor route also explicitly calls `sendOrderStatusUpdateEmail` (`route.ts:400-408`). Because `recordFulfillmentEvent` can also send an event email, some updates can produce duplicate customer emails.

Existing email behavior has two notable inconsistencies:

- The `PROCESSING` event template says the order has been shipped (`lib/fulfillment-events.ts:106-109`).
- A `COMPLETED` status update is mapped to a `DELIVERED` fulfillment event, while the explicit status email says the order is complete.

These are existing behavior details a new UI action would inherit unless the API is changed.

#### Audit logging

The vendor route does not create a general audit log for every status change. Audit logging is created by inventory consumption for delivered/completed normal orders. Rejection and cancellation have separate paths and effects described below.

#### Loyalty points

No order-status route calls the loyalty purchase-reward engine. `processPurchaseReward` exists at `lib/loyalty/loyalty-engine.ts:56-102`, but its only identified caller is the explicit customer endpoint:

```text
POST /api/loyalty/earn/purchase
```

See `app/api/loyalty/earn/purchase/route.ts:6-27`.

There is no confirmed cron job, worker, or status-change hook that automatically awards loyalty points on delivery or completion.

### Accept action

The accept branch changes only the vendor acceptance flags. It does not:

- Advance order status
- Record a fulfillment event
- Create an audit log
- Change inventory
- Award loyalty points

However, because the handler continues into the generic response block after accept, it can send the generic order-status update email using the order's current status (`route.ts:400-408`). This is an existing side effect even though acceptance itself is only a flag change.

### Reject action

The reject branch:

- Sets rejection flags and reason
- Sets `status` and `fulfillmentStatus` to `CANCELLED`
- Refunds paid orders
- Releases stock for normal orders
- Creates a customer in-app notification
- Sends a cancellation email

See `route.ts:220-293`.

The rejection branch returns before the generic status-update block. It does not explicitly record a `CANCELLED` fulfillment event; stock release records `STOCK_RELEASED` events through `releaseStock`.

### Pre-order/backorder fulfillment updates

`PATCH /api/vendor/fulfillment` records fulfillment events through `recordFulfillmentEvent` (`app/api/vendor/fulfillment/route.ts:255-271`). The helper can create customer notifications and emails according to its event map and templates. It does not consume inventory or award loyalty points.

### Other lifecycle paths

- Payment success reserves stock for normal orders, records `PAYMENT_CONFIRMED`, creates an audit log, sends payment confirmation, notifies the customer, and notifies vendors (`app/api/payment/verify/route.ts:148-322`; `lib/webhooks/order-webhook-handler.ts:133-255`).
- Customer cancellation records a cancellation event and audit log, releases normal-order stock, and notifies vendors (`app/api/orders/[orderId]/cancel/route.ts:80-139`).
- Admin updates can record cancellation/refund events and audit logs and can consume/release inventory, but the admin route does not send customer or vendor notifications (`app/api/admin/orders/[id]/route.ts:161-235`).

## 6. Relationship between “Order” and “Vendor Status”

The screenshot fields map to separate fields on the same `Order` record:

| Screenshot label | Schema field | Type |
|---|---|---|
| `Order: Processing` | `Order.status` | `OrderStatus` enum |
| `Vendor Status: Accepted` | `Order.vendorAccepted` | Boolean |

The UI derives the vendor label as follows:

```ts
if (order.vendorAccepted) return 'ACCEPTED'
if (order.vendorRejected) return 'REJECTED'
return 'PENDING'
```

See `app/dashboard/vendor/orders/[id]/page.client.tsx:228-233`.

These are independent concepts:

- `Order.status` tracks the customer-facing/main lifecycle.
- `Order.fulfillmentStatus` tracks fulfillment-specific progress, especially for pre-orders/backorders.
- `vendorAccepted` is only a vendor acknowledgment flag.
- Acceptance does not automatically change `status`.
- Payment confirmation changes `status` to `PROCESSING` but does not set `vendorAccepted`.
- Rejection sets the order to `CANCELLED` and sets the rejection flag.

For normal orders, the five-step UI uses `Order.status`. For pre-orders/backorders, the separate fulfillment UI uses `Order.fulfillmentStatus`. The screenshot's `Order: Processing` and `Vendor Status: Accepted` can therefore legitimately appear together.

## 7. Diagnosis and scoping boundary

### Confirmed missing item

The vendor order details page is missing a lifecycle status-update action for the order progress shown on the page.

The missing UI is not caused by a missing vendor API route: `PATCH /api/vendor/orders/[orderId]` already accepts `status`. The missing piece is the client-side control and request wiring.

### Required scoping decisions

Before implementation, decide:

1. **Normal-order workflow:** Should the detail page expose one next-step action based on `Order.status`, or a dropdown allowing all four vendor-accepted values?
2. **Transition enforcement:** Should the API be hardened to enforce `PROCESSING → SHIPPED → DELIVERED → COMPLETED`, or is direct vendor selection intentional?
3. **Pre-order/backorder completion:** Should `fulfillmentStatus` gain a `COMPLETED` enum value, or should completion be represented only by `Order.status`?
4. **Field synchronization:** Should updating one of `status` or `fulfillmentStatus` update or validate the other?
5. **Side-effect compatibility:** Should the new action preserve the existing fulfillment-event, email, notification, inventory, and audit behavior, including the current duplicate-email and `COMPLETED`-to-`DELIVERED` mappings?
6. **Loyalty integration:** If points should be awarded on delivery/completion, that is a separate integration currently absent from the order lifecycle.

### Recommended diagnostic conclusion

- **UI-only is technically possible** if the product accepts the API's current direct-status behavior and only normal-order `status` updates are needed.
- **API changes are advisable** if the five-step progress is intended to be a strict workflow or if pre-order/backorder completion must be supported consistently.
- No source-code changes were made in this diagnostic phase; this Markdown file is the requested report artifact.
