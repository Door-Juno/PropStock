import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './ReportsPage.css';

const ReportsPage = () => {
  const location = useLocation();

  return (
    <div className="reports-page">
      <h1>리포트 & 분석</h1>
      <nav className="tab-nav">
        <Link to="/reports/sales-trend" className={location.pathname.includes('/reports/sales-trend') ? 'active' : ''}>판매 트렌드</Link>
        <Link to="/reports/inventory-efficiency" className={location.pathname.includes('/reports/inventory-efficiency') ? 'active' : ''}>재고 효율성</Link>
        <Link to="/reports/cost-savings" className={location.pathname.includes('/reports/cost-savings') ? 'active' : ''}>비용 절감 효과</Link>
      </nav>
      <div className="tab-content">
        <Outlet />
      </div>
    </div>
  );
};

export default ReportsPage;
