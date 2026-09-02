import type { ReactNode } from 'react';
import { strings } from '../i18n/strings';
import type { CartItem } from '../types';

type Props = {
  title: string;
  items: CartItem[];
  children?: ReactNode;
};

export function CartSlip({ title, items, children }: Props) {
  const count = items.length;

  return (
    <aside className="slip">
      <div className="slip-head">
        <h2>{title}</h2>
        <span className="slip-count">
          {count === 1 ? strings.cart.countOne : strings.cart.countMany(count)}
        </span>
      </div>

      {count === 0 ? (
        <p className="slip-empty">{strings.cart.empty}</p>
      ) : (
        <ul className="slip-lines">
          {items.map((item) => (
            <li className="line" key={item.productId}>
              <span className="line-name">{item.productName}</span>
              <span className="line-qty">
                {item.quantity} {item.unit}
              </span>
            </li>
          ))}
        </ul>
      )}

      {children && <div className="slip-foot">{children}</div>}
    </aside>
  );
}
