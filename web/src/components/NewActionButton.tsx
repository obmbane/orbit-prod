import { FormEvent, useState } from 'react';
import { Plus } from 'lucide-react';
import { addDaysIso } from '../lib/dates';
import { usePortfolio, usePortfolioActions } from '../portfolio-context';
import { Priority } from '../types';
import Modal from './Modal';

export default function NewActionButton() {
  const { products } = usePortfolio();
  const { createAction } = usePortfolioActions();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [title, setTitle] = useState('');
  const [due, setDue] = useState(addDaysIso(7));
  const [priority, setPriority] = useState<Priority>('Medium');

  const valid = productId !== '' && title.trim().length > 0;
  const close = () => {
    setOpen(false);
    setProductId('');
    setTitle('');
    setDue(addDaysIso(7));
    setPriority('Medium');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    createAction({ productId, title: title.trim(), priority, due, source: 'Added by me', link: `/products/${productId}` });
    close();
  };

  return (
    <>
      <button className="btn primary" onClick={() => setOpen(true)}>
        <Plus size={16} /> New action
      </button>
      <Modal open={open} onClose={close} title="New action">
        <form onSubmit={submit} className="form">
          <label className="field">
            Product
            <select value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Choose a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            What needs doing?
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Review pricing with Sales" autoFocus />
          </label>
          <div className="two-fields">
            <label className="field">
              Due
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </label>
            <label className="field">
              Priority
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
          </div>
          <div className="foot">
            <button type="button" className="btn" onClick={close}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={!valid}>
              Add action
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
