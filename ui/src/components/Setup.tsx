import React, { useEffect, useState } from 'react';
import { Boxes, Users, Warehouse, Shield } from 'lucide-react';
import {
  createItem,
  createUser,
  createWarehouse,
  fetchItems,
  fetchSuppliers,
  fetchUsers,
  fetchWarehouses,
  type Item,
  type Supplier,
  type UserAccount,
  type Warehouse as WarehouseType,
} from '../api/apiClient';
import { getErrorMessage } from '../utils/apiError';
import './Dashboard.css';
import './Workflow.css';

const Setup: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [itemForm, setItemForm] = useState<Item>({
    sku: '',
    name: '',
    unit: 'pcs',
    minStockLevel: 0,
    category: '',
    price: 0,
    supplierId: undefined,
    active: true,
  });
  const [warehouseForm, setWarehouseForm] = useState<WarehouseType>({ name: '', location: '' });
  const [userForm, setUserForm] = useState<UserAccount>({ name: '', email: '', role: 'Store Keeper' });

  const loadData = async () => {
    try {
      const [itemsRes, suppliersRes, warehousesRes, usersRes] = await Promise.all([
        fetchItems(),
        fetchSuppliers(),
        fetchWarehouses(),
        fetchUsers(),
      ]);
      setItems(itemsRes.data);
      setSuppliers(suppliersRes.data);
      setWarehouses(warehousesRes.data);
      setUsers(usersRes.data);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Failed to load setup data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetStatus = () => {
    setMessage('');
    setError('');
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();
    try {
      await createItem(itemForm);
      setItemForm({ sku: '', name: '', unit: 'pcs', minStockLevel: 0, category: '', price: 0, supplierId: undefined, active: true });
      setMessage('Item master added successfully.');
      loadData();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Failed to create item.'));
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();
    try {
      await createWarehouse(warehouseForm);
      setWarehouseForm({ name: '', location: '' });
      setMessage('Warehouse added successfully.');
      loadData();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Failed to create warehouse.'));
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();
    try {
      await createUser(userForm);
      setUserForm({ name: '', email: '', role: 'Store Keeper' });
      setMessage('User role added successfully.');
      loadData();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Failed to create user.'));
    }
  };

  if (loading) {
    return <div className="loading">Loading setup...</div>;
  }

  return (
    <div className="workflow-page animate-fade-in">
      <header className="page-header">
        <h1>Setup</h1>
        <p className="subtitle">Configure items, suppliers, warehouses, and user roles before stock starts moving.</p>
      </header>

      {message && <div className="status-banner success">{message}</div>}
      {error && <div className="status-banner error">{error}</div>}

      <div className="mini-grid">
        <div className="mini-stat glass-panel">
          <span className="mini-stat-label">Items</span>
          <span className="mini-stat-value">{items.length}</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-label">Suppliers</span>
          <span className="mini-stat-value">{suppliers.length}</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-label">Warehouses</span>
          <span className="mini-stat-value">{warehouses.length}</span>
        </div>
        <div className="mini-stat glass-panel">
          <span className="mini-stat-label">User Roles</span>
          <span className="mini-stat-value">{users.length}</span>
        </div>
      </div>

      <div className="page-band two-col">
        <section className="panel glass-panel">
          <div className="panel-header">
            <div className="panel-header-copy">
              <span className="eyebrow">Item Master</span>
              <h2>Add Item</h2>
            </div>
            <Boxes className="text-primary" />
          </div>
          <form onSubmit={handleCreateItem}>
            <div className="form-grid">
              <div className="form-group">
                <label>SKU</label>
                <input className="input-field" value={itemForm.sku} onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Item Name</label>
                <input className="input-field" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <input className="input-field" value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Min Stock</label>
                <input type="number" className="input-field" value={itemForm.minStockLevel} onChange={(e) => setItemForm({ ...itemForm, minStockLevel: Number(e.target.value) })} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input className="input-field" value={itemForm.category || ''} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Unit Price</label>
                <input type="number" step="0.01" className="input-field" value={itemForm.price || 0} onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Supplier</label>
                <select className="select-field" value={itemForm.supplierId || ''} onChange={(e) => setItemForm({ ...itemForm, supplierId: e.target.value ? Number(e.target.value) : undefined })}>
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save Item</button>
            </div>
          </form>
        </section>

        <section className="panel glass-panel">
          <div className="panel-header">
            <div className="panel-header-copy">
              <span className="eyebrow">Supplier Master</span>
              <h2>Active Suppliers</h2>
            </div>
            <Users className="text-primary" />
          </div>
          <div className="list-stack">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="list-row">
                <div>
                  <div className="list-row-title">{supplier.name}</div>
                  <div className="list-row-subtitle">{supplier.contactEmail} · {supplier.phoneNumber || 'No phone'}</div>
                </div>
                <span className="pill">Supplier</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="page-band two-col">
        <section className="panel glass-panel">
          <div className="panel-header">
            <div className="panel-header-copy">
              <span className="eyebrow">Storage</span>
              <h2>Add Warehouse</h2>
            </div>
            <Warehouse className="text-primary" />
          </div>
          <form onSubmit={handleCreateWarehouse}>
            <div className="form-grid">
              <div className="form-group">
                <label>Warehouse Name</label>
                <input className="input-field" value={warehouseForm.name} onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input className="input-field" value={warehouseForm.location || ''} onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save Warehouse</button>
            </div>
          </form>
          <div className="list-stack">
            {warehouses.map((warehouse) => (
              <div key={warehouse.id} className="list-row">
                <div>
                  <div className="list-row-title">{warehouse.name}</div>
                  <div className="list-row-subtitle">{warehouse.location || 'Location pending'}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel glass-panel">
          <div className="panel-header">
            <div className="panel-header-copy">
              <span className="eyebrow">Access</span>
              <h2>Create User Role</h2>
            </div>
            <Shield className="text-primary" />
          </div>
          <form onSubmit={handleCreateUser}>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input className="input-field" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="input-field" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select className="select-field" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                  <option>System Administrator</option>
                  <option>Store Keeper</option>
                  <option>Purchase Officer</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save Role</button>
            </div>
          </form>
          <div className="list-stack">
            {users.map((user) => (
              <div key={user.id} className="list-row">
                <div>
                  <div className="list-row-title">{user.name}</div>
                  <div className="list-row-subtitle">{user.email}</div>
                </div>
                <span className="pill">{user.role}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Setup;
