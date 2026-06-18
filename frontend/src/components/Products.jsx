import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';

export default function Products({ apiUrl }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentProductId, setCurrentProductId] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    quantity_in_stock: ''
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${apiUrl}/products`);
      if (!response.ok) {
        throw new Error('Failed to load products list.');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Error occurred while loading products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [apiUrl]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({ name: '', sku: '', price: '', quantity_in_stock: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setModalMode('edit');
    setCurrentProductId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      quantity_in_stock: product.quantity_in_stock.toString()
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Local validation
    const priceNum = parseFloat(formData.price);
    const qtyNum = parseInt(formData.quantity_in_stock);

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be a number greater than 0.');
      return;
    }
    if (isNaN(qtyNum) || qtyNum < 0) {
      setError('Quantity in stock cannot be negative.');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        price: priceNum,
        quantity_in_stock: qtyNum
      };

      let response;
      if (modalMode === 'add') {
        response = await fetch(`${apiUrl}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${apiUrl}/products/${currentProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || 'Failed to save product details.');
      }

      setIsModalOpen(false);
      showSuccess(modalMode === 'add' ? 'Product created successfully!' : 'Product updated successfully!');
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Error occurred while saving product details.');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      return;
    }

    try {
      setError('');
      const response = await fetch(`${apiUrl}/products/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to delete product.');
      }

      showSuccess(`Product "${name}" deleted successfully.`);
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Error occurred while deleting product.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-subtitle">Add, modify, and monitor inventory items and pricing.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} /> Add Product
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

      {/* Main product list table */}
      {loading ? (
        <div className="empty-state">
          <RefreshCw className="empty-state-icon animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
          <p className="empty-state-text">Loading catalog items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="section-card empty-state">
          <div className="empty-state-icon"><Plus /></div>
          <p className="empty-state-text">No products in the catalog yet.</p>
          <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ marginTop: '1rem' }}>
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="section-card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>SKU / Code</th>
                  <th>Unit Price</th>
                  <th>Quantity in Stock</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  let statusBadge = <span className="badge badge-success">In Stock</span>;
                  if (product.quantity_in_stock === 0) {
                    statusBadge = <span className="badge badge-danger">Out of Stock</span>;
                  } else if (product.quantity_in_stock < 10) {
                    statusBadge = <span className="badge badge-warning">Low Stock</span>;
                  }

                  return (
                    <tr key={product.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{product.name}</div>
                      </td>
                      <td><code>{product.sku}</code></td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>{product.quantity_in_stock} units</td>
                      <td>{statusBadge}</td>
                      <td>
                        <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-icon-only"
                            onClick={() => handleOpenEditModal(product)}
                            title="Edit Product"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="btn btn-danger btn-icon-only"
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal Overlay */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {modalMode === 'add' ? 'Create New Product' : 'Modify Product Details'}
              </h3>
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
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g. Ergonomic Office Chair"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SKU / Code (Unique)</label>
                  <input
                    type="text"
                    name="sku"
                    className="form-input"
                    placeholder="e.g. CHR-ERG-01"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      className="form-input"
                      placeholder="99.99"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quantity in Stock</label>
                    <input
                      type="number"
                      name="quantity_in_stock"
                      step="1"
                      className="form-input"
                      placeholder="50"
                      value={formData.quantity_in_stock}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
