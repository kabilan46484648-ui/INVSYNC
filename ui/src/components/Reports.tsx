import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import {
  fetchReportLowStock,
  fetchReportMovements,
  fetchReportSummary,
  fetchStockValueReport,
  type LowStockAlert,
  type ReportSummary,
  type StockMovement,
  type StockValueRow,
} from '../api/apiClient';
import { getErrorMessage } from '../utils/apiError';
import './Dashboard.css';
import './Workflow.css';

const Reports: React.FC = () => {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [lowStock, setLowStock] = useState<LowStockAlert[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stockValue, setStockValue] = useState<StockValueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryRes, lowStockRes, movementsRes, stockValueRes] = await Promise.all([
          fetchReportSummary(),
          fetchReportLowStock(),
          fetchReportMovements(),
          fetchStockValueReport(),
        ]);
        setSummary(summaryRes.data);
        setLowStock(lowStockRes.data);
        setMovements(movementsRes.data);
        setStockValue(stockValueRes.data);
      } catch (caughtError) {
        setError(getErrorMessage(caughtError, 'Failed to load reports.'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading || !summary) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="workflow-page animate-fade-in">
      <header className="page-header">
        <h1>Reports</h1>
        <p className="subtitle">Review stock summary, low stock, movement history, and stock value.</p>
      </header>

      {error && <div className="status-banner error">{error}</div>}

      <div className="mini-grid">
        <div className="mini-stat glass-panel">
          <span className="mini-stat-label">Opening Stock</span>
          <span className="mini-stat-value">{summary.openingStock}</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-label">Stock In</span>
          <span className="mini-stat-value">{summary.stockIn}</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-label">Stock Out</span>
          <span className="mini-stat-value">{summary.stockOut}</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-label">Current Stock</span>
          <span className="mini-stat-value">{summary.currentStock}</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-label">Stock Value</span>
          <span className="mini-stat-value">Rs {summary.stockValue.toLocaleString()}</span>
        </div>
      </div>

      <div className="page-band two-col">
        <section className="panel glass-panel">
          <div className="panel-header">
            <div className="panel-header-copy">
              <span className="eyebrow">Low Stock</span>
              <h2>Reorder Alerts</h2>
            </div>
            <BarChart3 className="text-primary" />
          </div>
          <div className="list-stack">
            {lowStock.length === 0 ? (
              <div className="empty-state">No low stock alerts right now.</div>
            ) : (
              lowStock.map((alert) => (
                <div key={alert.stockLevelId} className="list-row">
                  <div>
                    <div className="list-row-title">{alert.sku} · {alert.productName}</div>
                    <div className="list-row-subtitle">{alert.warehouseName} · Current {alert.currentQuantity} / Min {alert.threshold}</div>
                  </div>
                  <span className="pill danger">Reorder</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel glass-panel">
          <div className="panel-header">
            <div className="panel-header-copy">
              <span className="eyebrow">Stock Value</span>
              <h2>Inventory Value</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {stockValue.map((row) => (
                  <tr key={row.productId}>
                    <td>{row.sku}</td>
                    <td>{row.productName}</td>
                    <td>{row.quantity}</td>
                    <td>Rs {row.unitPrice.toLocaleString()}</td>
                    <td>Rs {row.totalValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="panel glass-panel">
        <div className="panel-header">
          <div className="panel-header-copy">
            <span className="eyebrow">History</span>
            <h2>In / Out / Adjustment Log</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>SKU</th>
                <th>Item</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Warehouse</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id}>
                  <td>{movement.movementDate}</td>
                  <td>{movement.sku}</td>
                  <td>{movement.productName}</td>
                  <td>{movement.movementType}</td>
                  <td>{movement.quantity}</td>
                  <td>{movement.warehouseName}</td>
                  <td>{movement.balanceAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Reports;
