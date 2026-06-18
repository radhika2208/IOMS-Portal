import React, { useEffect, useState } from 'react';
import { Package, Users, ShoppingCart, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Dashboard({ apiUrl, setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${apiUrl}/dashboard/summary`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard summary data.');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Error loading dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="empty-state">
        <RefreshCw className="empty-state-icon animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
        <p className="empty-state-text">Loading dashboard analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <AlertTriangle />
        <span>{error}</span>
        <button className="btn btn-secondary btn-sm" onClick={fetchSummary} style={{ marginLeft: 'auto' }}>Retry</button>
      </div>
    );
  }

  const lowStockCount = stats?.low_stock_products?.length || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Overview of inventory operations and customer orders.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchSummary}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="card-grid">
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('products')}>
          <div className="stat-icon blue">
            <Package />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Products</span>
            <span className="stat-value">{stats?.total_products ?? 0}</span>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('customers')}>
          <div className="stat-icon green">
            <Users />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Customers</span>
            <span className="stat-value">{stats?.total_customers ?? 0}</span>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('orders')}>
          <div className="stat-icon blue">
            <ShoppingCart />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{stats?.total_orders ?? 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className={`stat-icon ${lowStockCount > 0 ? 'red' : 'green'}`}>
            <AlertTriangle />
          </div>
          <div className="stat-details">
            <span className="stat-label">Low Stock items</span>
            <span className="stat-value">{lowStockCount}</span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="content-layout">
        {/* Low Stock Panel */}
        <div className="section-card" style={{ gridColumn: '1 / -1' }}>
          <div className="section-title">
            <span>Critical Low Stock Alerts</span>
            <span className="badge badge-danger">Threshold &lt; 10 units</span>
          </div>
          {lowStockCount === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <Package size={32} style={{ color: 'var(--success)', marginBottom: '0.5rem' }} />
              <p className="empty-state-text" style={{ color: 'var(--success)' }}>All products are sufficiently stocked!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU/Code</th>
                    <th>Price</th>
                    <th>Stock Level</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.low_stock_products.map((product) => (
                    <tr key={product.id}>
                      <td style={{ fontWeight: 600 }}>{product.name}</td>
                      <td><code>{product.sku}</code></td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${product.quantity_in_stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                          {product.quantity_in_stock} remaining
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('products')}>
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
