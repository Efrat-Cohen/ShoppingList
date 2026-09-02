# frontend

Both screens. React 19, Redux Toolkit, Vite, plain CSS.

## Running it

```bash
docker compose up --build   # from the repository root, this is the easy path
```

Standalone, against a BFF already running on port 4100:

```bash
npm install
npm run dev
```

Vite proxies `/api` to the BFF, which is the only backend the frontend knows about, so the
browser only ever talks to one origin and CORS never comes up. In docker, nginx does the same
job - see [`nginx.conf`](nginx.conf).

## Layout

```
src/
├─ i18n/strings.ts    every Hebrew string in the app
├─ app/               store and typed hooks
├─ features/
│  ├─ catalog/        fetches the catalog once, on mount
│  ├─ cart/           add, clear
│  └─ order/          submits the order
├─ components/        header, cart slip, quantity input, confirmation
└─ pages/             ShoppingListPage, OrderSummaryPage
```

Three slices. `catalog` and `order` use `createAsyncThunk`; `cart` is synchronous reducers.
Not RTK Query: one backend with two endpoints, so it would be setup without a return.

The cart keeps product names and units for display, but the order request sends only ids and
quantities - the BFF resolves the rest from the catalog.

No component holds a Hebrew literal, and neither does `index.html` - the tab title is set
from `strings.brand`. Everything reads from `strings.ts`, which also maps the error codes the
BFF returns onto Hebrew messages.

## Screens

`/` is the shopping list. The catalog loads once when the page mounts. The product dropdown
is disabled until a category is chosen and then lists only that category's products. Adding a
product that is already in the cart tops up its quantity.

`/summary` is the order summary. Landing there with an empty cart redirects back. The form
validates in the browser first - the three fields, plus an email format check - and merges in
whatever the BFF rejects. It uses `noValidate` so the browser's own messages, which follow
the browser's locale, do not compete with the Hebrew ones.
