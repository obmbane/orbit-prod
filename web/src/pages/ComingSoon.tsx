import { useOutletContext } from 'react-router-dom';
import { ProductContext } from './ProductLayout';

/** Temporary tab body, replaced as each epic is built. */
export default function ComingSoon({ title }: { title: string }) {
  const { product } = useOutletContext<ProductContext>();
  return (
    <div className="card empty">
      <strong>{title}</strong>
      <p>This section of {product.name} is not built yet.</p>
    </div>
  );
}
