import React, { useEffect, useState } from 'react';
import { ClipboardPlus, PackageCheck } from 'lucide-react';
import {
  createPurchaseOrder,
  fetchItems,
  fetchPurchaseOrders,
  fetchSuppliers,
  fetchWarehouses,
  receivePurchaseOrder,
  type Item,
  type PurchaseOrder,
  type Supplier,
  type Warehouse,
} from '../api/apiClient';
import { getErrorMessage } from '../utils/apiError';
import './Dashboard.css';
import './Workflow.css';

const Purchases: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState<PurchaseOrder>({
    supplierId: 0,
    expectedDate: '',
    notes: '',
    lines: [{ productId: 0, warehouseId: 0, orderedQuantity: 1, unitCost: 0 }],
  });

  const loadData = async () => {
    try {
      const [suppliersRes, itemsRes, warehousesRes, ordersRes] = await Promise.all([
        fetchSuppliers(),
        fetchItems(),
        fetchWarehouses(),
        fetchPurchaseOrders(),
      ]);
      setSuppliers(suppliersRes.data);
      setItems(itemsRes.data);
      setWarehouses(warehousesRes.data);
      setOrders(ordersRes.data);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Failed to load purchase workflow.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateLine = (key: keyof PurchaseOrder['lines'][0], value: number) => {
    setForm({
      ...form,
      lines: [{ ...form.lines[0], [key]: value }],
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await createPurchaseOrder(form);
      setForm({
        supplierId: suppliers[0]?.id || 0,
        expectedDate: '',
        notes: '',
        lines: [{ productId: items[0]?.id || 0, warehouseId: warehouses[0]?.id || 0, orderedQuantity: 1, unitCost: 0 }],
      });
      setMessage('Purchase order created.');
      loadData();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Failed to create purchase order.'));
    }
  };

  const handleReceive = async (id?: number) => {
    if (!id) return;
    setMessage('');
    setError('');
    try {
      await receivePurchaseOrder(id);
      setMessage('Goods received and stock updated.');
      loadData();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Failed to receive purchase order.'));
    }
  };

  if (loading) {
    return <div className="loading">Loading purchases...</div>;
  }

  return (
    <div className="workflow-page animate-fade-in">
      <header className="page-header">
        <h1>Purchase and Stock In</h1>
        <p className="subtitle">Create purchase orders, receive goods, and increase stock against the selected warehouse.</p>
      </header>

      {message && <div className="status-banner success">{message}</div>}
      {error && <div className="status-banner error">{error}</div>}

      <div className="page-band two-col">
        <section className="panel glass-panel">
          <div className="panel-header">
            <div className="panel-header-copy">
              <span className="eyebrow">Purchase Order</span>
              <h2>Create PO</h2>
            </div>
            <ClipboardPlus className="text-primary" />
          </div>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="form-group">
                <label>Supplier</label>
                <select className="select-field" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: Number(e.target.value) })} required>
                  <option value={0}>Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Expected Date</label>
                <input type="date" className="input-field" value={form.expectedDate || ''} onChange={(e) => setForm({ ...form, expectedDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Item</label>
                <select className="select-field" value={form.lines[0].productId} onChange={(e) => updateLine('productId', Number(e.target.value))} required>
                  <option value={0}>Select item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>{item.sku} · {item.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Warehouse</label>
                <select className="select-field" value={form.lines[0].warehouseId} onChange={(e) => updateLine('warehouseId', Number(e.target.value))} required>
                  <option value={0}>Select warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ordered Quantity</label>
                <input type="number" className="input-field" value={form.lines[0].orderedQuantity} onChange={(e) => updateLine('orderedQuantity', Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label>Unit Cost</label>
                <input type="number" step="0.01" className="input-field" value={form.lines[0].unitCost} onChange={(e) => updateLine('unitCost', Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="textarea-field" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Create PO</button>
            </div>
          </form>
        </section>

        <section className="panel glass-panel">
          <div className="panel-header">
            <div className="panel-header-copy">
              <span className="eyebrow">Receiving</span>
              <h2>Pending Goods</h2>
            </div>
            <PackageCheck className="text-primary" />
          </div>
          <div className="list-stack">
            {orders.length === 0 ? (
              <div className="empty-state">No purchase orders yet.</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="list-row">
                  <div>
                    <div className="list-row-title">{order.poNumber} · {order.supplierName}</div>
                    <div className="list-row-subtitle">
                      {order.lines[0]?.productName || 'Item'} · Qty {order.lines[0]?.orderedQuantity} · Status {order.status}
                    </div>
                  </div>
                  <div className="split-actions">
                    <span className={`pill ${order.status === 'RECEIVED' ? 'success' : 'warning'}`}>{order.status}</span>
                    {order.status !== 'RECEIVED' && (
                      <button className="btn-secondary" type="button" onClick={() => handleReceive(order.id)}>Receive</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Purchases;
