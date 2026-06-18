import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, AlertTriangle, RefreshCw, CheckCircle, UserPlus } from 'lucide-react';

export default function Customers({ apiUrl }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: ''
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${apiUrl}/customers`);
      if (!response.ok) {
        throw new Error('Failed to load customers list.');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message || 'Error occurred while loading customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [apiUrl]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleOpenAddModal = () => {
    setFormData({ full_name: '', email: '', phone_number: '' });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Simple email validation pattern check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || 'Failed to save customer details.');
      }

      setIsModalOpen(false);
      showSuccess('Customer registered successfully!');
      fetchCustomers();
    } catch (err) {
      setError(err.message || 'Error occurred while saving customer details.');
    }
  };

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      const response = await fetch(`${apiUrl}/customers/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to delete customer.');
      }

      showSuccess(`Customer "${name}" removed successfully.`);
      fetchCustomers();
    } catch (err) {
      setError(err.message || 'Error occurred while deleting customer.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Relations</h1>
          <p className="page-subtitle">Manage business contacts, details, and order associations.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <UserPlus size={16} /> Add Customer
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="alert alert-success">
          <CheckCircle />
          <span>{success}</span>
        </div>
      )}

      {error && !isModalOpen && (
        <div className="alert alert-danger">
          <AlertTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* Customers List */}
      {loading ? (
        <div className="empty-state">
          <RefreshCw className="empty-state-icon animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
          <p className="empty-state-text">Loading client accounts...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="section-card empty-state">
          <div className="empty-state-icon"><UserPlus /></div>
          <p className="empty-state-text">No registered customers yet.</p>
          <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ marginTop: '1rem' }}>
            Register Your First Customer
          </button>
        </div>
      ) : (
        <div className="section-card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td style={{ fontWeight: 600, fontSize: '1rem' }}>{customer.full_name}</td>
                    <td><a href={`mailto:${customer.email}`} style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>{customer.email}</a></td>
                    <td>{customer.phone_number}</td>
                    <td>
                      <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-danger btn-icon-only"
                          onClick={() => handleDeleteCustomer(customer.id, customer.full_name)}
                          title="Delete Customer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Customer Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Register Customer</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger" style={{ padding: '0.75rem', marginBottom: '1rem' }}>
                    <AlertTriangle size={18} />
                    <span style={{ fontSize: '0.85rem' }}>{error}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Unique)</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="e.g. john.doe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    className="form-input"
                    placeholder="e.g. +1 (555) 019-2834"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
