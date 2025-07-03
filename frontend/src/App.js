// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import './App.css'; // 전체 레이아웃 스타일을 위한 CSS 파일 (아래에서 생성)

// 각 페이지 컴포넌트
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';

// 더미 페이지 컴포넌트
const Signup = () => <div className="page-content"><h2>회원가입 페이지</h2><p>여기에 회원가입 내용이 들어갑니다..</p></div>;
const DataManagement = () => <div className="page-content"><h2>데이터 관리 페이지</h2><p>여기에 데이터 관리 내용이 들어갑니다.</p></div>;
const Inventory = () => <div className="page-content"><h2>재고 관리 페이지</h2><p>여기에 재고 관리 내용이 들어갑니다.</p></div>;
const Orders = () => <div className="page-content"><h2>발주 관리 페이지</h2><p>여기에 발주 관리 내용이 들어갑니다.</p></div>;
const Prediction = () => <div className="page-content"><h2>수요 예측 페이지</h2><p>여기에 수요 예측 내용이 들어갑니다.</p></div>;
const Reports = () => <div className="page-content"><h2>리포트 페이지</h2><p>여기에 리포트 내용이 들어갑니다.</p></div>;
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
            <Route path="/data-management" element={<DataManagement />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<NotFound />} /> {/* 일치하는 경로가 없을 때 */}
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