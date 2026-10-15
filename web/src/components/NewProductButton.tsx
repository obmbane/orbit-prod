import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { usePortfolio, usePortfolioActions } from '../portfolio-context';
import Modal from './Modal';

export default function NewProductButton() {
  const { products } = usePortfolio();
  const { addProduct } = usePortfolioActions();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');

  const categories = [...new Set(products.map((p) => p.category))].sort();
  const valid = name.trim().length > 0 && summary.trim().length > 0 && category.trim().length > 0;

  const close = () => {
    setOpen(false);
    setName('');
    setSummary('');
    setCategory('');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const id = addProduct({ name: name.trim(), summary: summary.trim(), category: category.trim() });
    close();
    navigate(`/products/${id}`);
  };

  return (
    <>
      <button className="btn primary" onClick={() => setOpen(true)}>
        <Plus size={16} /> New product
      </button>
      <Modal open={open} onClose={close} title="New product">
        <form onSubmit={submit} className="form">
          <label className="field">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Edge Observability" autoFocus />
          </label>
          <label className="field">
            What is it, in a sentence?
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="The problem it solves and for whom" rows={3} />
          </label>
          <label className="field">
            Category
            <input value={category} onChange={(e) => setCategory(e.target.value)} list="categories" placeholder="Choose or type a category" />
            <datalist id="categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <p className="muted small">The product starts at Idea, with the standard stage-gate requirements and a first action.</p>
          <div className="foot">
            <button type="button" className="btn" onClick={close}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={!valid}>
              Create product
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
