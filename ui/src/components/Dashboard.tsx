import React, { useEffect, useState } from 'react';
import { fetchDashboardOverview, fetchSalesTrends, fetchLowStockAlerts, fetchStockMovements } from '../api/apiClient';
import type { DashboardOverview, SalesTrend, LowStockAlert, StockMovement } from '../api/apiClient';
import { AlertTriangle, TrendingUp, Package, ShoppingCart, ArrowRightLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';
import './Workflow.css';

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [salesTrends, setSalesTrends] = useState<SalesTrend[]>([]);
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [overviewRes, salesRes, alertsRes, movementsRes] = await Promise.all([
          fetchDashboardOverview(),
          fetchSalesTrends(),
          fetchLowStockAlerts(),
          fetchStockMovements(),
        ]);
        setOverview(overviewRes.data);
        setSalesTrends(salesRes.data);
        setAlerts(alertsRes.data);
        setMovements(movementsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading || !overview) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard workflow-page animate-fade-in">
      <header className="page-header">
        <h1>Office Stock Workflow</h1>
        <p className="subtitle">Setup, purchases, stock movements, alerts, and reports in one office-ready flow.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-primary-soft"><TrendingUp className="text-primary" /></div>
          <div className="stat-info">
            <span className="stat-label">Stock Value</span>
            <span className="stat-value">Rs {overview.totalStockValue.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-success-soft"><Package className="text-success" /></div>
          <div className="stat-info">
            <span className="stat-label">Active Items</span>
            <span className="stat-value">{overview.activeItems}</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-warning-soft"><ShoppingCart className="text-warning" /></div>
          <div className="stat-info">
            <span className="stat-label">Pending POs</span>
            <span className="stat-value">{overview.pendingPurchaseOrders}</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-danger-soft"><AlertTriangle className="text-danger" /></div>
          <div className="stat-info">
            <span className="stat-label">Low Stock Alerts</span>
            <span className="stat-value">{overview.lowStockAlerts}</span>
          </div>
        </div>
      </div>

      <div className="mini-grid">
        <div className="mini-stat glass-panel">
          <span className="mini-stat-label">Sales Today</span>
          <span className="mini-stat-value">{overview.salesToday}</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-label">Stock In Today</span>
          <span className="mini-stat-value">{overview.stockInToday}</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-label">Stock Out Today</span>
          <span className="mini-stat-value">{overview.stockOutToday}</span>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="chart-section glass-panel">
          <h2>Sales Trends</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="saleDate" stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-text-primary)' }}
                />
                <Area type="monotone" dataKey="totalQuantitySold" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="alerts-section glass-panel">
          <h2>Low Stock Alerts</h2>
          <div className="alerts-list">
            {alerts.length === 0 ? (
              <div className="no-alerts">All stock levels are optimal.</div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.stockLevelId} className="alert-item">
                  <div className="alert-icon"><AlertTriangle size={18} /></div>
                  <div className="alert-details">
                    <span className="alert-product">{alert.productName}</span>
                    <span className="alert-qty">
                      {alert.sku} · {alert.warehouseName} · Current: {alert.currentQuantity} / Min: {alert.threshold}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="page-band two-col">
        <section className="panel glass-panel">
          <div className="panel-header">
            <div className="panel-header-copy">
              <span className="eyebrow">Workflow</span>
              <h2>Simple Flow</h2>
            </div>
          </div>
          <div className="list-stack">
            {['Setup', 'Purchase', 'Stock In', 'Stock Out', 'Adjustment', 'Reports'].map((step, index, steps) => (
              <div key={step} className="list-row">
                <div>
                  <div className="list-row-title">{step}</div>
                  <div className="list-row-subtitle">
                    {step === 'Setup' && 'Maintain items, suppliers, warehouses, and user roles.'}
                    {step === 'Purchase' && 'Create purchase orders and keep receipts pending until goods arrive.'}
                    {step === 'Stock In' && 'Receive goods and add them into available stock.'}
                    {step === 'Stock Out' && 'Issue or sell items and reduce balances automatically.'}
                    {step === 'Adjustment' && 'Correct damage, loss, or manual count differences.'}
                    {step === 'Reports' && 'Track summaries, low stock, movement history, and stock value.'}
                  </div>
                </div>
                {index < steps.length - 1 ? <ArrowRightLeft size={16} className="text-muted" /> : <span className="pill success">Live</span>}
              </div>
            ))}
          </div>
        </section>

        <section className="panel glass-panel">
          <div className="panel-header">
            <div className="panel-header-copy">
              <span className="eyebrow">Recent Activity</span>
              <h2>Latest Movements</h2>
            </div>
          </div>
          <div className="list-stack">
            {movements.length === 0 ? (
              <div className="empty-state">No movement history yet.</div>
            ) : (
              movements.map((movement) => (
                <div key={movement.id} className="list-row">
                  <div>
                    <div className="list-row-title">{movement.productName}</div>
                    <div className="list-row-subtitle">
                      {movement.movementType} · {movement.warehouseName} · Qty {movement.quantity}
                    </div>
                  </div>
                  <span className="pill">{movement.movementDate}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
