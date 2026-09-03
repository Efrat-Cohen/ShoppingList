# frontend

Both screens. React 19, Redux Toolkit, Vite, plain CSS.

## Running it

```bash
docker compose up --build   # from the repository root
```

Standalone, against a BFF already running on port 4100: `npm install && npm run dev`. Vite
proxies `/api` to the BFF, and nginx does the same job in docker - see
[`nginx.conf`](nginx.conf). One origin either way, so CORS never comes up in the browser.

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

Three slices. `catalog` and `order` use `createAsyncThunk`, `cart` is synchronous reducers.
Not RTK Query: one backend with two endpoints, so it would be setup without a return.

The cart keeps product names and units for display, but the order request sends only ids and
quantities - the BFF resolves the rest from the catalog. No component holds a Hebrew literal,
and neither does `index.html`; the tab title is set from `strings.brand`.

## Screens

`/` is the shopping list. The catalog loads once when the page mounts. The product dropdown is
disabled until a category is chosen and then lists only that category's products. Adding a
product that is already in the cart tops up its quantity.

`/summary` is the order summary. Landing there with an empty cart redirects back. The form
validates the three fields in the browser first, plus an email format check, and merges in
whatever the BFF rejects. It uses `noValidate` so the browser's own messages, which follow the
browser's locale, do not compete with the Hebrew ones.

## Tests

```bash
npm test
npm run lint
```

Nine, over `cartSlice` and `orderSlice` - the two places the screens keep rules rather than
plumbing: the top-up on a product already in the cart and its ceiling, the error codes a
rejected submit keeps, and the reset that stops a finished order outliving a cart change. The
reducers are called directly with plain actions - no store, no `fetch`, nothing mocked.
