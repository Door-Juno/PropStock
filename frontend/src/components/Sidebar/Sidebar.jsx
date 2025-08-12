// frontend/src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // 사이드바 스타일을 위한 CSS 파일 (3단계에서 생성)

function Sidebar() {
  return (
    <nav className="app-sidebar">
      <ul className="sidebar-menu">
        <li>
          <Link to="/dashboard">대시보드</Link>
        </li>
        <li>
          <Link to="/data-management">데이터 관리</Link>
        </li>
        <li>
          <Link to="/inventory">재고 관리</Link>
        </li>
        <li>
          <Link to="/order-prediction">발주 & 예측</Link>
        </li>
        <li>
          <Link to="/reports">리포트 & 분석</Link>
        </li>
        {/* 필요에 따라 더 많은 메뉴 항목을 추가하세요. */}
      </ul>
    </nav>
  );
}

export default Sidebar;