import React from 'react';
import { Routes, Route, NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AccountSettings from './AccountSettings';
import StoreSettings from './StoreSettings';
// Removed NotificationSettings import
import './SettingsPage.css'; // 설정 페이지 전체 CSS

function SettingsPage() {
    const navigate = useNavigate();

    const handle_Logout = async () => {
        if (!window.confirm("로그아웃 하시겠습니까?")) {
            return;
        }

        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                await axios.post('http://localhost:8000/api/auth/logout/', {
                    refresh: refreshToken
                });
            } catch (error) {
                console.error('로그아웃 실패:', error);
                // 백엔드에서 오류가 발생해도 클라이언트 측 토큰은 삭제
            }
        }
        // 로컬 스토리지에서 토큰 제거
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // 로그인 페이지로 리디렉션
        navigate('/login');
    };

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
                        {/* Removed Notification Settings NavLink */}
                    </ul>
                    <div className="logout-button-container">
                        <button className="logout-button" onClick={handle_Logout}>
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