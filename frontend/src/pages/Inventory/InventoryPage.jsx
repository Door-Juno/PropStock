import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './InventoryPage.css';

const InventoryPage = () => {
  const location = useLocation();

  return (
    <div className="inventory-page">
      <h1>재고 관리</h1>
      <nav className="tab-nav">
        <Link to="/inventory/products" className={location.pathname.includes('/inventory/products') ? 'active' : ''}>품목 관리</Link>
        <Link to="/inventory/status" className={location.pathname.includes('/inventory/status') ? 'active' : ''}>재고 현황</Link>
        <Link to="/inventory/receipts" className={location.pathname.includes('/inventory/receipts') ? 'active' : ''}>입고 관리</Link>
      </nav>
      <div className="tab-content">
        <Outlet />
      </div>
    </div>
  );
};

export default InventoryPage;
