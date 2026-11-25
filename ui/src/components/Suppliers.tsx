import React, { useEffect, useState } from 'react';
import { fetchSuppliers, createSupplier, deleteSupplier } from '../api/apiClient';
import type { Supplier } from '../api/apiClient';
import { Plus, Trash2, Mail, Phone } from 'lucide-react';
import './Suppliers.css';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Supplier>({ name: '', contactEmail: '', phoneNumber: '' });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const res = await fetchSuppliers();
      setSuppliers(res.data);
    } catch (error) {
      console.error("Failed to load suppliers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSupplier(newSupplier);
      setIsModalOpen(false);
      setNewSupplier({ name: '', contactEmail: '', phoneNumber: '' });
      loadSuppliers();
    } catch (error) {
      console.error("Failed to create supplier", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSupplier(id);
      loadSuppliers();
    } catch (error) {
      console.error("Failed to delete supplier", error);
    }
  };

  if (loading) return <div className="loading">Loading suppliers...</div>;

  return (
    <div className="suppliers-page">
      <div className="suppliers-content animate-fade-in">
        <header className="page-header flex-between">
          <div>
            <h1>Suppliers</h1>
            <p className="subtitle">Manage your supply chain partners.</p>
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add Supplier
          </button>
        </header>

        <div className="suppliers-grid">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="supplier-card glass-panel">
              <div className="card-header">
                <h3>{supplier.name}</h3>
                <button className="icon-btn danger" onClick={() => handleDelete(supplier.id!)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <Mail size={16} className="text-muted" />
                  <span>{supplier.contactEmail}</span>
                </div>
                {supplier.phoneNumber && (
                  <div className="info-row">
                    <Phone size={16} className="text-muted" />
                    <span>{supplier.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <h2>Add New Supplier</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Name</label>
                <input required className="input-field" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" className="input-field" value={newSupplier.contactEmail} onChange={e => setNewSupplier({...newSupplier, contactEmail: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="input-field" value={newSupplier.phoneNumber} onChange={e => setNewSupplier({...newSupplier, phoneNumber: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
