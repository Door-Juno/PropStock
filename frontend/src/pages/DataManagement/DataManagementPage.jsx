// src/pages/DataManagement/DataManagementPage.jsx
import React from 'react';
import { Routes, Route, NavLink, Outlet } from 'react-router-dom';
import DailySalesInput from './DailySalesInput';
import SalesDataUpload from './SalesDataUpload'; 
import SalesHistory from './SalesHistory';     
import './DataManagementPage.css';

function DataManagementPage() {
    return (
        <div className="data-management-page-container">
            <h1 className="data-management-page-title">데이터 관리</h1>
            <p className="data-management-page-description">판매 데이터를 입력, 업로드, 조회하고 수정할 수 있습니다.</p>

            <div className="data-management-content-wrapper">
                <nav className="data-management-sidebar">
                    <ul>
                        <li>
                            <NavLink
                                to="/data-management/daily-sales"
                                className={({ isActive }) => (isActive ? 'active-link' : undefined)}
                            >
                                일일 판매 기록
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/data-management/upload"
                                className={({ isActive }) => (isActive ? 'active-link' : undefined)}
                            >
                                과거 판매 데이터 업로드
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/data-management/history"
                                className={({ isActive }) => (isActive ? 'active-link' : undefined)}
                            >
                                판매 내역 조회
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="data-management-main-area">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default DataManagementPage;