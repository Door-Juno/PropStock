import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './OrderPredictionPage.css';

const OrderPredictionPage = () => {
  const location = useLocation();

  return (
    <div className="order-prediction-page">
      <h1>발주 & 예측</h1>
      <nav className="tab-nav">
        <Link to="/order-prediction/sales-forecast" className={location.pathname.includes('/order-prediction/sales-forecast') ? 'active' : ''}>수요 예측 결과</Link>
        <Link to="/order-prediction/recommendation" className={location.pathname.includes('/order-prediction/recommendation') ? 'active' : ''}>발주 추천</Link>
      </nav>
      <div className="tab-content">
        <Outlet />
      </div>
    </div>
  );
};

export default OrderPredictionPage;
