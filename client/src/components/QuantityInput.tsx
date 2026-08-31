import { MAX_QUANTITY } from '../features/cart/cartSlice';
import { strings } from '../i18n/strings';

type Props = {
  id: string;
  value: number;
  onChange: (value: number) => void;
};

export function QuantityInput({ id, value, onChange }: Props) {
  const clamp = (next: number) => Math.min(MAX_QUANTITY, Math.max(1, next));

  return (
    <div className="qty">
      <button
        type="button"
        aria-label={strings.picker.decrease}
        disabled={value <= 1}
        onClick={() => onChange(clamp(value - 1))}
      >
        &minus;
      </button>

      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_QUANTITY}
        value={value}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          onChange(Number.isNaN(parsed) ? 1 : clamp(parsed));
        }}
      />

      <button
        type="button"
        aria-label={strings.picker.increase}
        disabled={value >= MAX_QUANTITY}
        onClick={() => onChange(clamp(value + 1))}
      >
        +
      </button>
    </div>
  );
}
