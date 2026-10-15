import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Product } from '../types';
import StagePill from './StagePill';

/** Rows of products, shared by Home and My Products so they cannot drift apart. */
export default function ProductList({ products }: { products: Product[] }) {
  return (
    <div className="plist">
      <div className="prow head" aria-hidden>
        <span>Product</span>
        <span>Stage</span>
        <span>Category</span>
        <span>Summary</span>
        <span />
      </div>
      {products.map((product) => (
        <Link key={product.id} to={`/products/${product.id}`} className="prow">
          <span className="pname">{product.name}</span>
          <span>
            <StagePill product={product} />
          </span>
          <span className="muted">{product.category}</span>
          <span className="muted">{product.summary}</span>
          <ChevronRight size={16} className="chev" aria-hidden />
        </Link>
      ))}
    </div>
  );
}
