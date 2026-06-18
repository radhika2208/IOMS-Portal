import React, { useState } from 'react';
import { LayoutDashboard, Package, Users, ShoppingBag } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Customers from './components/Customers';
import Orders from './components/Orders';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dynamically resolve backend endpoint. Defaults to localhost for Docker Compose/local runs.
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard apiUrl={API_BASE_URL} setActiveTab={setActiveTab} />;
      case 'products':
        return <Products apiUrl={API_BASE_URL} />;
      case 'customers':
        return <Customers apiUrl={API_BASE_URL} />;
      case 'orders':
        return <Orders apiUrl={API_BASE_URL} />;
      default:
        return <Dashboard apiUrl={API_BASE_URL} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">
            <Package size={22} color="#fff" />
          </div>
          <span className="logo-text">IOMS Admin</span>
        </div>

        <nav style={{ flex: 1 }}>
          <ul className="nav-links">
            <li className="nav-item">
              <div
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </div>
            </li>
            <li className="nav-item">
              <div
                className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <Package />
                <span>Products</span>
              </div>
            </li>
            <li className="nav-item">
              <div
                className={`nav-link ${activeTab === 'customers' ? 'active' : ''}`}
                onClick={() => setActiveTab('customers')}
              >
                <Users />
                <span>Customers</span>
              </div>
            </li>
            <li className="nav-item">
              <div
                className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <ShoppingBag />
                <span>Orders</span>
              </div>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="main-content">
        {renderActiveTab()}
      </main>
    </div>
  );
}
