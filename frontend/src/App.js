// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import './App.css'; // 전체 레이아웃 스타일을 위한 CSS 파일 (아래에서 생성)

// 각 페이지 컴포넌트
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import SettingsPage from './pages/Settings/SettingsPage';
import AccountSettings from './pages/Settings/AccountSettings'; // 자식 라우트를 직접 연결하는 경우
import StoreSettings from './pages/Settings/StoreSettings';
import NotificationSettings from './pages/Settings/NotificationSettings';
import DataManagementPage from './pages/DataManagement/DataManagementPage';
import DailySalesInput from './pages/DataManagement/DailySalesInput';
import SalesDataUpload from './pages/DataManagement/SalesDataUpload';
import SalesHistory from './pages/DataManagement/SalesHistory';
import Signup from './pages/auth/Signup'

import InventoryPage from './pages/Inventory/InventoryPage';
import ProductManagement from './pages/Inventory/ProductManagement';
import InventoryStatus from './pages/Inventory/InventoryStatus';
import ReceiptsManagement from './pages/Inventory/ReceiptsManagement';
import OrderPredictionPage from './pages/OrderPrediction/OrderPredictionPage';
import SalesForecast from './pages/OrderPrediction/SalesForecast';
import OrderRecommendation from './pages/OrderPrediction/OrderRecommendation';
import ReportsPage from './pages/Reports/ReportsPage';
import SalesTrendReport from './pages/Reports/SalesTrendReport';
import InventoryEfficiencyReport from './pages/Reports/InventoryEfficiencyReport';
import CostSavingsReport from './pages/Reports/CostSavingsReport';

const NotFound = () => <div className="page-content"><h2>404 - 페이지를 찾을 수 없습니다</h2></div>;

// 앱의 레이아웃을 관리하는 메인 컴포넌트
function AppLayout() {
  const location = useLocation();
  const hideHeaderAndSidebar = location.pathname==='/login' || location.pathname==='/' || location.pathname === '/signup';
  
  return (
    <div className="app-container">
        {!hideHeaderAndSidebar && <Header />}
        {!hideHeaderAndSidebar && <Sidebar />}
        <main className={!hideHeaderAndSidebar ? "app-main-content" : "full-screen-content"}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} /> 
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/data-management" element={<DataManagementPage />} >
              <Route index element={<Navigate to="daily-sales" replace />} />
              <Route path="daily-sales" element={<DailySalesInput />} />
              <Route path="upload" element={<SalesDataUpload />} />
              <Route path="history" element={<SalesHistory />} />
            </Route>
            <Route path="/inventory" element={<InventoryPage />}>
              <Route index element={<Navigate to="status" replace />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="status" element={<InventoryStatus />} />
              <Route path="receipts" element={<ReceiptsManagement />} />
            </Route>
            <Route path="/order-prediction" element={<OrderPredictionPage />}>
              <Route index element={<Navigate to="recommendation" replace />} />
              <Route path="sales-forecast" element={<SalesForecast />} />
              <Route path="recommendation" element={<OrderRecommendation />} />
            </Route>
            <Route path="/reports" element={<ReportsPage />}>
              <Route index element={<Navigate to="sales-trend" replace />} />
              <Route path="sales-trend" element={<SalesTrendReport />} />
              <Route path="inventory-efficiency" element={<InventoryEfficiencyReport />} />
              <Route path="cost-savings" element={<CostSavingsReport />} />
            </Route>

            <Route path="/settings" element={<SettingsPage />}>
              <Route index element = {<Navigate to = "account" replace/>}/>
                <Route path="account" element={<AccountSettings />} />
                <Route path="store-info" element={<StoreSettings />} />
                <Route path="notifications" element={<NotificationSettings />} />
              </Route>
          </Routes>
        </main>
      </div>
  );
}

function App () {
  return (
    <Router>
      <AppLayout/>
    </Router>
  );
}

export default App;