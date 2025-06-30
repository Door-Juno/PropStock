// frontend/src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // 헤더 스타일을 위한 CSS 파일 (3단계에서 생성)

function Header() {
    // 로그아웃 로직
    const handle_Logout = () => {
        alert('로그아웃 기능 개발 예정!')
    }


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