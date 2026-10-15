import { useOutletContext } from 'react-router-dom';
import { fmtDate, timeAgo } from '../lib/dates';
import { ProductContext } from './ProductLayout';

export default function ProductActivity() {
  const { product } = useOutletContext<ProductContext>();
  return (
    <section className="card" aria-labelledby="history">
      <h2 id="history" className="card-title">
        History
      </h2>
      <div className="timeline">
        {product.activity.map((entry) => (
          <div key={entry.id} className="tl">
            <i />
            <div>
              <div>{entry.title}</div>
              {entry.detail && <div className="muted small">{entry.detail}</div>}
              <div className="faint small" title={fmtDate(entry.at)}>
                {entry.actor} · {timeAgo(entry.at)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
