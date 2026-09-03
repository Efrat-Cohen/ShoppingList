import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { AppHeader } from '../components/AppHeader';
import { CartSlip } from '../components/CartSlip';
import { QuantityInput } from '../components/QuantityInput';
import { addItem, removeItem } from '../features/cart/cartSlice';
import { fetchCatalog } from '../features/catalog/catalogSlice';
import { strings } from '../i18n/strings';

export function ShoppingListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { categories, products, status } = useAppSelector((state) => state.catalog);
  const items = useAppSelector((state) => state.cart.items);

  const [categoryId, setCategoryId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // The whole catalog - both lists, categories and products - arrives in a single request
  // when the screen first mounts.
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCatalog());
    }
  }, [status, dispatch]);

  const selectedCategory = categories.find((category) => String(category.id) === categoryId);
  const categoryProducts = products.filter((product) => product.categoryId === selectedCategory?.id);
  const selectedProduct = categoryProducts.find((product) => String(product.id) === productId);

  function handleCategoryChange(nextCategoryId: string) {
    setCategoryId(nextCategoryId);
    setProductId('');
  }

  function handleAdd() {
    if (!selectedCategory || !selectedProduct) {
      return;
    }

    dispatch(addItem({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      unit: selectedProduct.unit,
      quantity,
    }));

    // Keep the category so several products from it can be added in a row.
    setProductId('');
    setQuantity(1);
  }

  return (
    <div className="shell">
      <AppHeader step={1} />

      <div className="layout">
        <main className="card">
          <div className="card-head">
            <h2>{strings.picker.title}</h2>
            <p>{strings.picker.subtitle}</p>
          </div>

          {status === 'loading' && <p className="state">{strings.catalog.loading}</p>}

          {status === 'failed' && (
            <p className="state state-error">
              {strings.catalog.failed}{' '}
              <button type="button" className="link" onClick={() => dispatch(fetchCatalog())}>
                {strings.catalog.retry}
              </button>
            </p>
          )}

          {status === 'succeeded' && (
            <>
              <div className="picker">
                <div className="field">
                  <label htmlFor="category">{strings.picker.category}</label>
                  <select
                    id="category"
                    className="control"
                    value={categoryId}
                    onChange={(event) => handleCategoryChange(event.target.value)}
                  >
                    <option value="">{strings.picker.categoryPlaceholder}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="product">{strings.picker.product}</label>
                  <select
                    id="product"
                    className="control"
                    value={productId}
                    disabled={!selectedCategory}
                    onChange={(event) => setProductId(event.target.value)}
                  >
                    <option value="">
                      {selectedCategory ? strings.picker.productPlaceholder : strings.picker.productWaiting}
                    </option>
                    {categoryProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="quantity">{strings.picker.quantity}</label>
                  <QuantityInput id="quantity" value={quantity} onChange={setQuantity} />
                </div>
              </div>

              <div className="picker-foot">
                <button type="button" className="btn btn-primary" disabled={!selectedProduct} onClick={handleAdd}>
                  {strings.picker.add}
                </button>
              </div>
            </>
          )}
        </main>

        <CartSlip
          title={strings.cart.title}
          items={items}
          onRemove={(id) => dispatch(removeItem(id))}
        >
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={items.length === 0}
            onClick={() => navigate('/summary')}
          >
            {strings.cart.continue}
          </button>
        </CartSlip>
      </div>
    </div>
  );
}
