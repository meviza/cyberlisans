# Payment Infrastructure Todo

This file keeps payment-provider and money-movement fixes separate from the current dealer/dashboard cleanup scope.

## Out of Scope For Current Pass

- Checkout payment initiation contract and provider orchestration.
- Payment webhook accounting, wallet deposit split, retry and refund provider logic.
- Wallet payment execution internals beyond read-only dashboard display.
- Provider idempotency keys, external provider references and settlement callbacks.
- Admin payment refund/retry operational flows.

## Known Critical Items To Handle Later

1. Validate order ownership, order status, amount and currency before creating a payment.
2. Split order payments from wallet top-ups so order payments do not also credit wallet balance.
3. Make provider idempotency key order/request scoped, not user scoped.
4. Record dealer sales for wallet-paid orders after payment succeeds.
5. Reverse dealer commission and balance effects during refunds.
6. Set `refundedAt` and complete payment audit metadata consistently.
