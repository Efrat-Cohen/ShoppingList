# client

Both screens. React 19, Redux Toolkit, Vite, plain CSS.

## Running it

```bash
docker compose up --build   # from the repository root, this is the easy path
```

Standalone, against APIs already running on ports 5080 and 4000:

```bash
npm install
npm run dev
```

Vite proxies `/api/catalog` to the catalog API and `/api/orders` to the orders API, so the
browser only ever talks to one origin and CORS never comes up. In docker, nginx does the same
job - see [`nginx.conf`](nginx.conf).

## Layout

```
src/
├─ i18n/strings.ts    every Hebrew string in the app
├─ app/               store and typed hooks
├─ features/
│  ├─ catalog/        fetches the catalog once, on mount
│  ├─ cart/           add, remove, clear
│  └─ order/          submits the order
├─ components/        header, cart slip, quantity input
└─ pages/             ShoppingListPage, OrderSummaryPage
```

Three slices. `catalog` and `order` use `createAsyncThunk`; `cart` is synchronous reducers.
Not RTK Query: two backends, one endpoint each, so it would be setup without a return.

No component holds a Hebrew literal. They all read from `strings.ts`, which also maps the
error codes the orders API returns onto Hebrew messages.

## Screens

`/` is the shopping list. The catalog loads once when the page mounts. The product dropdown
is disabled until a category is chosen and then lists only that category's products. Adding a
product that is already in the cart tops up its quantity.

`/summary` is the order summary. Landing there with an empty cart redirects back. The form
validates in the browser first - the three fields, plus an email format check - and merges in
whatever the API rejects. It uses `noValidate` so the browser's own messages, which follow
the browser's locale, do not compete with the Hebrew ones.
