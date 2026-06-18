import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Eye, X, AlertTriangle, RefreshCw, CheckCircle, ShoppingBag, PlusCircle, MinusCircle } from 'lucide-react';

export default function Orders({ apiUrl }) {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([
    { product_id: '', quantity: 1 }
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch Orders
      const ordRes = await fetch(`${apiUrl}/orders`);
      if (!ordRes.ok) throw new Error('Failed to load orders.');
      const ordData = await ordRes.json();
      setOrders(ordData);

      // Fetch Customers (for order creation dropdown)
      const custRes = await fetch(`${apiUrl}/customers`);
      if (custRes.ok) {
        const custData = await custRes.json();
        setCustomers(custData);
      }

      // Fetch Products (for order creation picker & stock checking)
      const prodRes = await fetch(`${apiUrl}/products`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

    } catch (err) {
      setError(err.message || 'Error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleOpenCreateModal = () => {
    setCustomerId('');
    setOrderItems([{ product_id: '', quantity: 1 }]);
    setError('');
    setIsCreateModalOpen(true);
  };

  const handleOpenDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleAddRow = () => {
    setOrderItems(prev => [...prev, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveRow = (index) => {
    if (orderItems.length === 1) return;
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, value) => {
    setOrderItems(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Real-time Order Total calculation in UI
  const calculateUiTotal = () => {
    let sum = 0;
    for (const item of orderItems) {
      if (!item.product_id) continue;
      const product = products.find(p => p.id === parseInt(item.product_id));
      if (product) {
        sum += product.price * (parseInt(item.quantity) || 0);
      }
    }
    return sum;
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerId) {
      setError('Please select a customer for the order.');
      return;
    }

    // Validate and format items
    const formattedItems = [];
    for (const item of orderItems) {
      if (!item.product_id) {
        setError('All added items must have a product selected.');
        return;
      }
      
      const qty = parseInt(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        setError('Quantity must be greater than 0.');
        return;
      }

      const product = products.find(p => p.id === parseInt(item.product_id));
      if (!product) {
        setError('Invalid product selected.');
        return;
      }

      if (product.quantity_in_stock < qty) {
        setError(`Insufficient stock for "${product.name}". Available: ${product.quantity_in_stock}, requested: ${qty}.`);
        return;
      }

      formattedItems.push({
        product_id: parseInt(item.product_id),
        quantity: qty
      });
    }

    try {
      const payload = {
        customer_id: parseInt(customerId),
        items: formattedItems
      };

      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || 'Failed to place the order.');
      }

      setIsCreateModalOpen(false);
      showSuccess('Order created and inventory updated successfully!');
      fetchData(); // Refresh orders and products catalog stock levels
    } catch (err) {
      setError(err.message || 'Error occurred while creating order.');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this order? This will restore stock values.')) {
      return;
    }

    try {
      setError('');
      const response = await fetch(`${apiUrl}/orders/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to delete order.');
      }

      showSuccess(`Order ID ${id} cancelled and deleted.`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Error occurred while canceling order.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Processing</h1>
          <p className="page-subtitle">Track orders, check totals, and manage client transactions.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <ShoppingBag size={16} /> Place Order
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="alert alert-success">
          <CheckCircle />
          <span>{success}</span>
        </div>
      )}

      {error && !isCreateModalOpen && (
        <div className="alert alert-danger">
          <AlertTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="empty-state">
          <RefreshCw className="empty-state-icon animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
          <p className="empty-state-text">Loading orders registry...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="section-card empty-state">
          <div className="empty-state-icon"><ShoppingBag /></div>
          <p className="empty-state-text">No orders recorded yet.</p>
          <button className="btn btn-primary" onClick={handleOpenCreateModal} style={{ marginTop: '1rem' }}>
            Place Your First Order
          </button>
        </div>
      ) : (
        <div className="section-card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Customer Name</th>
                  <th>Order Date</th>
                  <th>Total Items</th>
                  <th>Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const dateString = new Date(order.created_at).toLocaleString();
                  const totalItemsCount = order.items.reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id}</strong>
                      </td>
                      <td style={{ fontWeight: 500 }}>{order.customer_name}</td>
                      <td>{dateString}</td>
                      <td>{totalItemsCount} items</td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-light)' }}>
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td>
                        <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-icon-only"
                            onClick={() => handleOpenDetailModal(order)}
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="btn btn-danger btn-icon-only"
                            onClick={() => handleDeleteOrder(order.id)}
                            title="Cancel / Delete Order"
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

      {/* Place Order Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Place New Order</h3>
              <button className="modal-close" onClick={() => setIsCreateModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrder}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger" style={{ padding: '0.75rem', marginBottom: '1rem' }}>
                    <AlertTriangle size={18} />
                    <span style={{ fontSize: '0.85rem' }}>{error}</span>
                  </div>
                )}

                {/* Customer Selector */}
                <div className="form-group">
                  <label className="form-label">Select Customer</label>
                  {customers.length === 0 ? (
                    <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>
                      No customers available. Please add a customer first.
                    </p>
                  ) : (
                    <select
                      className="form-input"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Customer --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Multi-Item Selector */}
                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Order Items</label>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAddRow}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      <PlusCircle size={14} /> Add Product
                    </button>
                  </div>

                  {products.length === 0 ? (
                    <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>
                      No products available. Please add a product to stock first.
                    </p>
                  ) : (
                    <div className="order-items-builder">
                      {orderItems.map((item, index) => {
                        const selectedProduct = products.find(p => p.id === parseInt(item.product_id));
                        const availableStock = selectedProduct ? selectedProduct.quantity_in_stock : 0;

                        return (
                          <div key={index} className="order-item-row">
                            <div>
                              <select
                                className="form-input"
                                value={item.product_id}
                                onChange={(e) => handleRowChange(index, 'product_id', e.target.value)}
                                required
                              >
                                <option value="">-- Select Product --</option>
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} (${p.price.toFixed(2)}) [Stock: {p.quantity_in_stock}]
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <input
                                type="number"
                                className="form-input"
                                min="1"
                                max={availableStock || undefined}
                                value={item.quantity}
                                onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                                placeholder="Qty"
                                required
                              />
                            </div>

                            <div>
                              <button
                                type="button"
                                className="btn btn-danger btn-icon-only"
                                onClick={() => handleRemoveRow(index)}
                                disabled={orderItems.length === 1}
                              >
                                <MinusCircle size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Display calculations */}
                      <div className="order-total-preview">
                        <span>Calculated Total:</span>
                        <span className="order-total-value">${calculateUiTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={customers.length === 0 || products.length === 0}
                >
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Order Details: #{selectedOrder.id}</h3>
              <button className="modal-close" onClick={() => setIsDetailModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Customer Name</span>
                  <strong>{selectedOrder.customer_name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Order Date</span>
                  <strong>{new Date(selectedOrder.created_at).toLocaleString()}</strong>
                </div>
              </div>

              {/* Items Table */}
              <div className="table-container" style={{ marginBottom: '1.5rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                        <td>{item.quantity} units</td>
                        <td>${item.product_price.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          ${(item.quantity * item.product_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Grand Total */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600 }}>Grand Total:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-light)' }}>
                  ${selectedOrder.total_amount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
