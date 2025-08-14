import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Header.css'; // 헤더 스타일을 위한 CSS 파일 (3단계에서 생성)

function Header() {
    const navigate = useNavigate();

    // 로그아웃 로직
    const handle_Logout = async () => {
        if (!window.confirm("로그아웃 하시겠습니까?")) {
            return;
        }

        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout/`, {
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
    <header className="app-header">
      <div className="header-content">
        <h1>Propstock - AI 매장 통계 시스템</h1>
        {/* 여기에 사용자 정보나 알림 아이콘 등을 추가할 수 있습니다. */}
      </div>
      <nav className='header-nav'>
        <ul className='nav-menu'>
            <li>
                <Link to='/settings'className='nav-link'> 설정 </Link>
            </li>
            <li>
                <button onClick={handle_Logout} className='logout-button'>
                    로그아웃
                </button>
            </li>
        </ul>

      </nav>
    </header>
  );
}

export default Header;