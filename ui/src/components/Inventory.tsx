import React, { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, ClipboardPenLine } from 'lucide-react';
import {
  fetchItems,
  fetchStockMovements,
  fetchStockOverview,
  fetchWarehouses,
  recordAdjustment,
  recordStockOut,
  type Item,
  type StockMovement,
  type StockMovementRequest,
  type StockOverview,
  type Warehouse,
} from '../api/apiClient';
import { getErrorMessage } from '../utils/apiError';
import './Dashboard.css';
import './Workflow.css';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockOverview, setStockOverview] = useState<StockOverview[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [stockOutForm, setStockOutForm] = useState<StockMovementRequest>({
    productId: 1,
    warehouseId: 1,
    quantity: 1,
    movementType: 'ISSUE',
    notes: '',
  });
  const [adjustmentForm, setAdjustmentForm] = useState<StockMovementRequest>({
    productId: 1,
    warehouseId: 1,
    quantity: 1,
    movementType: 'ADJUSTMENT_OUT',
    notes: '',
  });

  const loadData = async () => {
    try {
      const [itemsRes, warehousesRes, stockRes, movementRes] = await Promise.all([
        fetchItems(),
        fetchWarehouses(),
        fetchStockOverview(),
        fetchStockMovements(),
      ]);
      setItems(itemsRes.data);
      setWarehouses(warehousesRes.data);
      setStockOverview(stockRes.data);
      setMovements(movementRes.data.slice(0, 8));
      if (itemsRes.data[0] && warehousesRes.data[0]) {
        setStockOutForm((current) => ({ ...current, productId: current.productId || itemsRes.data[0].id || 0, warehouseId: current.warehouseId || warehousesRes.data[0].id || 0 }));
        setAdjustmentForm((current) => ({ ...current, productId: current.productId || itemsRes.data[0].id || 0, warehouseId: current.warehouseId || warehousesRes.data[0].id || 0 }));
      }
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Failed to load inventory workflow.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitStockOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await recordStockOut(stockOutForm);
      setMessage('Stock out entry posted.');
      setStockOutForm({ ...stockOutForm, quantity: 1, notes: '' });
      loadData();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Failed to post stock out.'));
    }
  };

  const submitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await recordAdjustment(adjustmentForm);
      setMessage('Adjustment applied successfully.');
      setAdjustmentForm({ ...adjustmentForm, quantity: 1, notes: '' });
      loadData();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Failed to apply adjustment.'));
    }
  };

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  return (
    <div className="workflow-page animate-fade-in">
      <header className="page-header">
        <h1>Stock Out and Adjustment</h1>
        <p className="subtitle">Issue or sell items, adjust damage or loss, and track current stock in real time.</p>
      </header>

      {message && <div className="status-banner success">{message}</div>}
      {error && <div className="status-banner error">{error}</div>}

      <div className="page-band two-col">
        <section className="panel glass-panel">
          <div className="panel-header">
            <div className="panel-header-copy">
              <span className="eyebrow">Stock Out</span>
              <h2>Issue or Sell</h2>
            </div>
            <ArrowUpFromLine className="text-primary" />
          </div>
          <form onSubmit={submitStockOut}>
            <div className="form-grid">
              <div className="form-group">
                <label>Item</label>
                <select className="select-field" value={stockOutForm.productId} onChange={(e) => setStockOutForm({ ...stockOutForm, productId: Number(e.target.value) })}>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>{item.sku} · {item.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Warehouse</label>
                <select className="select-field" value={stockOutForm.warehouseId} onChange={(e) => setStockOutForm({ ...stockOutForm, warehouseId: Number(e.target.value) })}>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Movement</label>
                <select className="select-field" value={stockOutForm.movementType} onChange={(e) => setStockOutForm({ ...stockOutForm, movementType: e.target.value })}>
                  <option value="ISSUE">Issue</option>
                  <option value="SALE">Sale</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" className="input-field" value={stockOutForm.quantity} onChange={(e) => setStockOutForm({ ...stockOutForm, quantity: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="textarea-field" value={stockOutForm.notes || ''} onChange={(e) => setStockOutForm({ ...stockOutForm, notes: e.target.value })} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Post Stock Out</button>
            </div>
          </form>
        </section>

        <section className="panel glass-panel">
          <div className="panel-header">
            <div className="panel-header-copy">
              <span className="eyebrow">Adjustment</span>
              <h2>Add or Deduct</h2>
            </div>
            <ClipboardPenLine className="text-primary" />
          </div>
          <form onSubmit={submitAdjustment}>
            <div className="form-grid">
              <div className="form-group">
                <label>Item</label>
                <select className="select-field" value={adjustmentForm.productId} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, productId: Number(e.target.value) })}>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>{item.sku} · {item.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Warehouse</label>
                <select className="select-field" value={adjustmentForm.warehouseId} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, warehouseId: Number(e.target.value) })}>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Adjustment Type</label>
                <select className="select-field" value={adjustmentForm.movementType} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, movementType: e.target.value })}>
                  <option value="ADJUSTMENT_OUT">Deduct</option>
                  <option value="ADJUSTMENT_IN">Add</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" className="input-field" value={adjustmentForm.quantity} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, quantity: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea className="textarea-field" value={adjustmentForm.notes || ''} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Apply Adjustment</button>
            </div>
          </form>
        </section>
      </div>

      <div className="page-band two-col">
        <section className="panel glass-panel">
          <div className="panel-header">
            <div className="panel-header-copy">
              <span className="eyebrow">Current Stock</span>
              <h2>Opening + In - Out = Current</h2>
            </div>
            <ArrowDownToLine className="text-primary" />
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Item</th>
                  <th>Warehouse</th>
                  <th>In</th>
                  <th>Out</th>
                  <th>Current</th>
                  <th>Min</th>
                </tr>
              </thead>
              <tbody>
                {stockOverview.map((row) => (
                  <tr key={row.stockLevelId}>
                    <td>{row.sku}</td>
                    <td>{row.productName}</td>
                    <td>{row.warehouseName}</td>
                    <td>{row.stockIn}</td>
                    <td>{row.stockOut}</td>
                    <td>{row.currentQuantity}</td>
                    <td>{row.minStockLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel glass-panel">
          <div className="panel-header">
            <div className="panel-header-copy">
              <span className="eyebrow">History</span>
              <h2>Recent Stock Moves</h2>
            </div>
          </div>
          <div className="list-stack">
            {movements.map((movement) => (
              <div key={movement.id} className="list-row">
                <div>
                  <div className="list-row-title">{movement.productName}</div>
                  <div className="list-row-subtitle">
                    {movement.movementType} · Qty {movement.quantity} · Balance {movement.balanceAfter}
                  </div>
                </div>
                <span className="pill">{movement.movementDate}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Inventory;
