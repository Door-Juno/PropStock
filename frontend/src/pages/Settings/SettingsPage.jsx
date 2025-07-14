// src/pages/Settings/SettingsPage.jsx
import React from 'react';
import { Routes, Route, NavLink, Outlet } from 'react-router-dom';
import AccountSettings from './AccountSettings';
import StoreSettings from './StoreSettings';
import NotificationSettings from './NotificationSettings';
import './SettingsPage.css'; // 설정 페이지 전체 CSS

function SettingsPage() {
    return (
        <div className="settings-page-container">
            <h1 className="settings-page-title">설정</h1>

            <div className="settings-content-wrapper">
                <nav className="settings-sidebar">
                    <ul>
                        <li>
                            <NavLink
                                to="/settings/account"
                                className={({ isActive }) => (isActive ? 'active-link' : undefined)}
                            >
                                계정 설정
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/settings/store-info"
                                className={({ isActive }) => (isActive ? 'active-link' : undefined)}
                            >
                                매장 설정
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/settings/notifications"
                                className={({ isActive }) => (isActive ? 'active-link' : undefined)}
                            >
                                알림 설정
                            </NavLink>
                        </li>
                    </ul>
                    <div className="logout-button-container">
                        <button className="logout-button" onClick={() => alert('로그아웃 처리 로직')}>
                            로그아웃
                        </button>
                    </div>
                </nav>

                <div className="settings-main-area">
                    {/* 중첩 라우트의 내용을 표시할 곳 */}
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;