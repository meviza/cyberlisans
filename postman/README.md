# Cyberlisans API — Postman + Newman

End-to-end integration tests for the Cyberlisans backend API. Built on Postman v2.1 collection schema and runnable from the CLI via [Newman](https://github.com/postmanlabs/newman) and in CI through GitHub Actions.

## Layout

```
postman/
├── cyberlisans.postman_collection.json         # 31 requests across 9 folders
├── environments/
│   ├── local.postman_environment.json          # http://localhost:3000
│   └── production.postman_environment.json     # https://cyberlisans.vercel.app
├── reports/                                    # Newman HTML report output
└── README.md
scripts/
└── test-api.sh                                 # Newman runner (CLI + HTML report)
.github/workflows/
└── api-tests.yml                               # CI: runs ./scripts/test-api.sh on push/PR
```

## Importing the Collection (Postman UI)

1. Open Postman → **Import** → **File** → select `postman/cyberlisans.postman_collection.json`.
2. Repeat for each file under `postman/environments/`.
3. Pick an environment from the top-right dropdown (Local or Production).
4. Run the **Auth** folder first — it logs in three test users and writes `admin_token`, `alice_token`, `bob_token` into the environment. Subsequent requests reuse those tokens automatically.

> Tokens are stored as `secret` type variables and never printed by test scripts.
>
> **Test seed credentials:** the local environment ships with default seed passwords (`Alice!2026Safe`, `Admin!2026Safe`, etc.) so the collection can run unattended against a freshly seeded stack. The production environment deliberately ships with **empty** `seller_email` / `admin_email` / `*_password` values — fill them in locally before running against prod, or override via `--env-var` in Newman. Never commit a populated production environment JSON.

## Endpoints Covered

| #   | Folder          | Method | Path                                     | Auth   |
| --- | --------------- | ------ | ---------------------------------------- | ------ |
| 1   | Auth            | POST   | `/api/auth/login` (admin)                | public |
| 2   | Auth            | POST   | `/api/auth/login` (alice)                | public |
| 3   | Auth            | POST   | `/api/auth/login` (bob)                  | public |
| 4   | Auth            | GET    | `/api/profile/me`                        | Bearer |
| 5   | Sellers         | POST   | `/api/sellers/apply`                     | Bearer |
| 6   | Sellers         | GET    | `/api/sellers/me`                        | Bearer |
| 7   | Sellers         | GET    | `/api/sellers/alice-gaming-keys/public`  | public |
| 8   | Sellers         | GET    | `/api/admin/sellers/pending`             | Admin  |
| 9   | Escrow          | POST   | `/api/escrow`                            | Bearer |
| 10  | Escrow          | GET    | `/api/escrow/:id`                        | Bearer |
| 11  | Escrow          | POST   | `/api/escrow/:id/release`                | Bearer |
| 12  | Disputes        | POST   | `/api/disputes`                          | Bearer |
| 13  | Disputes        | GET    | `/api/disputes/me`                       | Bearer |
| 14  | Payouts         | POST   | `/api/payouts`                           | Bearer |
| 15  | Payouts         | GET    | `/api/payouts/me`                        | Bearer |
| 16  | Payouts         | GET    | `/api/payouts/:id`                       | Bearer |
| 17  | Admin           | GET    | `/api/admin/escrow/escrow`               | Admin  |
| 18  | Admin           | POST   | `/api/admin/escrow/escrow/auto-release`  | Admin  |
| 19  | Admin           | GET    | `/api/admin/escrow/payouts`              | Admin  |
| 20  | Admin           | GET    | `/api/debug/db`                          | public |
| 21  | Health          | GET    | `/api/health`                            | public |
| 22  | Seller Products | POST   | `/api/auth/login` (seller, ensure token) | public |
| 23  | Seller Products | POST   | `/api/seller/products` (create)          | Bearer |
| 24  | Seller Products | GET    | `/api/seller/products?status=PENDING`    | Bearer |
| 25  | Seller Products | PATCH  | `/api/seller/products/:id` (update)      | Bearer |
| 26  | Seller Products | GET    | `/api/seller/products/:id` (detail)      | Bearer |
| 27  | Seller Products | DELETE | `/api/seller/products/:id` (soft del)    | Bearer |
| 28  | Admin Products  | POST   | `/api/auth/login` (admin, ensure token)  | public |
| 29  | Admin Products  | GET    | `/api/admin/products/pending`            | Admin  |
| 30  | Admin Products  | POST   | `/api/admin/products/:id/approve`        | Admin  |
| 31  | Admin Products  | POST   | `/api/admin/products/:id/reject`         | Admin  |

Every request carries a test script with five automated assertions (status code, response time, JSON validity, expected keys, no `error` envelope) and writes captured IDs back into environment variables for chained calls.

## Running Locally with Newman

```bash
# install once
npm install -g newman newman-reporter-html

# run against production (default)
./scripts/test-api.sh

# or explicitly
./scripts/test-api.sh postman/environments/production.postman_environment.json
./scripts/test-api.sh postman/environments/local.postman_environment.json
```

The script writes the HTML report to `postman/reports/newman-report.html` and exits non-zero on any failed assertion.

## CI

`.github/workflows/api-tests.yml` triggers on push/PR to `main` or `develop` whenever files under `apps/api/**`, `packages/auth/**`, `postman/**`, `scripts/test-api.sh`, or the workflow itself change. It installs Newman, runs the collection against the **production** environment, and uploads:

- `newman-report` — HTML report artifact (14 days)
- `newman-cli-log` — raw CLI output (7 days)

Both artifacts are uploaded on success and failure (`if: always()`) so failed runs can still be inspected.

## Environment Variables

| Key                   | Description                                                   | Type   |
| --------------------- | ------------------------------------------------------------- | ------ |
| `base_url`            | API origin                                                    | string |
| `admin_token`         | JWT for admin@cyberlisans.com                                 | secret |
| `alice_token`         | JWT for alice@cyberlisans.com                                 | secret |
| `bob_token`           | JWT for bob@cyberlisans.com                                   | secret |
| `test_order_id`       | Order UUID used by escrow create                              | string |
| `test_seller_id`      | Seller UUID captured after `/sellers/apply`                   | string |
| `test_escrow_id`      | Escrow UUID captured after `/escrow`                          | string |
| `test_dispute_id`     | Dispute UUID captured after `/disputes`                       | string |
| `test_payout_id`      | Payout UUID captured after `/payouts`                         | string |
| `seller_token`        | JWT for the seller test account (alias of `alice_token`)      | secret |
| `seller_email`        | Login email for seller flow (default `alice@cyberlisans.com`) | string |
| `seller_password`     | Login password for seller flow (default `Alice!2026Safe`)     | secret |
| `admin_email`         | Login email for admin flow                                    | string |
| `admin_password`      | Login password for admin flow                                 | secret |
| `test_product_id`     | Product UUID captured after create                            | string |
| `rejected_product_id` | Pending product UUID captured for reject                      | string |
| `category_id`         | Test category UUID                                            | string |
| `brand_id`            | Test brand UUID                                               | string |

Sensitive values stay in the Postman environment or in CI secrets — they are never logged.

## Notes

- The Postman collection uses Hono routes registered under `/auth`, `/profile`, `/sellers`, `/escrow`, `/disputes`, `/payouts`, `/admin/*`, `/health`, `/debug/db`. Vercel mounts them under the `/api/*` prefix, so collection paths always include `/api`.
- Authorization header is `Bearer <token>` (no cookies). Tokens are JWT access tokens issued by `/api/auth/login`.
- The Admin login requires 2FA setup on the account; the endpoint still returns an `accessToken`, which is what the collection uses. If your admin account blocks token issuance pending 2FA, run `/auth/2fa/setup` + `/auth/2fa/verify` outside the collection first.
