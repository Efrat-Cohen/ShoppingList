import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { AppHeader } from '../components/AppHeader';
import { CartSlip } from '../components/CartSlip';
import { OrderConfirmation } from '../components/OrderConfirmation';
import { clearCart } from '../features/cart/cartSlice';
import { resetOrder, submitOrder } from '../features/order/orderSlice';
import { strings } from '../i18n/strings';
import type { Customer } from '../types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_CUSTOMER: Customer = { fullName: '', address: '', email: '' };

function validate(customer: Customer): Partial<Record<keyof Customer, string>> {
  const errors: Partial<Record<keyof Customer, string>> = {};

  if (!customer.fullName.trim()) {
    errors.fullName = strings.errors.required;
  }

  if (!customer.address.trim()) {
    errors.address = strings.errors.required;
  }

  if (!customer.email.trim()) {
    errors.email = strings.errors.required;
  } else if (!EMAIL_PATTERN.test(customer.email)) {
    errors.email = strings.errors.invalid_email;
  }

  return errors;
}

export function OrderSummaryPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const items = useAppSelector((state) => state.cart.items);
  const { status, orderId, errors: serverErrors } = useAppSelector((state) => state.order);

  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [localErrors, setLocalErrors] = useState<Partial<Record<keyof Customer, string>>>({});

  if (items.length === 0 && status !== 'succeeded') {
    return <Navigate to="/" replace />;
  }

  if (status === 'succeeded') {
    return (
      <div className="shell">
        <AppHeader step={2} />
        <OrderConfirmation
          orderId={orderId}
          onRestart={() => {
            dispatch(clearCart());
            dispatch(resetOrder());
            navigate('/');
          }}
        />
      </div>
    );
  }

  // Field errors come from two places: the checks above, and whatever the API rejected.
  const fieldErrors = { ...localErrors };
  const generalErrors: string[] = [];

  for (const error of serverErrors) {
    const key = error.field.replace(/^customer\./, '') as keyof Customer;
    const message = strings.errors[error.code] ?? strings.errors.fallback;

    if (key in EMPTY_CUSTOMER) {
      fieldErrors[key] = message;
    } else {
      generalErrors.push(message);
    }
  }

  function handleFieldChange(name: keyof Customer, value: string) {
    setCustomer((current) => ({ ...current, [name]: value }));
    setLocalErrors((current) => ({ ...current, [name]: undefined }));

    // Whatever the API rejected is stale the moment the form changes.
    if (serverErrors.length > 0) {
      dispatch(resetOrder());
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const found = validate(customer);
    setLocalErrors(found);

    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    dispatch(submitOrder({ customer, items }));
  }

  function field(name: keyof Customer, label: string, type = 'text', hint?: string) {
    const error = fieldErrors[name];

    return (
      <div className={error ? 'field invalid' : 'field'}>
        <label htmlFor={name}>
          {label} <span className="req">*</span>
        </label>
        <input
          id={name}
          className="control"
          type={type}
          value={customer[name]}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          onChange={(event) => handleFieldChange(name, event.target.value)}
        />
        {hint && !error && <span className="hint">{hint}</span>}
        {error && (
          <span className="error" id={`${name}-error`} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="shell">
      <AppHeader step={2} />

      <div className="layout">
        {/* noValidate so the browser's own messages don't compete with the Hebrew ones. */}
        <form className="card" onSubmit={handleSubmit} noValidate>
          <div className="card-head">
            <h2>{strings.summary.title}</h2>
            <p>{strings.summary.subtitle}</p>
          </div>

          {field('fullName', strings.summary.fullName)}
          {field('address', strings.summary.address, 'text', strings.summary.addressHint)}
          {field('email', strings.summary.email, 'email')}

          {generalErrors.map((message) => (
            <p className="banner" role="alert" key={message}>
              {message}
            </p>
          ))}

          <div className="form-foot">
            <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>
              {status === 'submitting' ? strings.summary.submitting : strings.summary.submit}
            </button>
            <button type="button" className="link" onClick={() => navigate('/')}>
              {strings.summary.back}
            </button>
          </div>
        </form>

        <CartSlip title={strings.cart.orderItems} items={items} />
      </div>
    </div>
  );
}
