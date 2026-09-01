import { strings } from '../i18n/strings';

type Props = {
  orderId: string | null;
  onRestart: () => void;
};

export function OrderConfirmation({ orderId, onRestart }: Props) {
  return (
    <div className="card done">
      <h2>{strings.done.title}</h2>
      <p>{strings.done.body}</p>
      <p className="done-id">
        <span>{strings.done.orderNumber}</span>
        <code>{orderId}</code>
      </p>
      <button type="button" className="btn btn-primary" onClick={onRestart}>
        {strings.done.again}
      </button>
    </div>
  );
}
