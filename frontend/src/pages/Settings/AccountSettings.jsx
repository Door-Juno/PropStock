// src/pages/Settings/AccountSettings.jsx
import React, { useState } from 'react';
import './SettingsSection.css'; // 공통 스타일

function AccountSettings() {
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handlePasswordChange = (e) => {
        e.preventDefault();
        setMessage('');
        if (newPassword !== confirmPassword) {
            setMessage('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        // 실제 API 호출 로직 (예: PUT /api/user/password-reset/)
        console.log('비밀번호 변경 요청:', { password, newPassword });
        // 성공/실패 응답에 따라 메시지 설정
        setMessage('비밀번호가 성공적으로 변경되었습니다!');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleEmailChange = (e) => {
        e.preventDefault();
        setMessage('');
        // 실제 API 호출 로직 (예: PUT /api/user/email-change/)
        console.log('이메일 변경 요청:', { email });
        // 성공/실패 응답에 따라 메시지 설정
        setMessage('이메일 주소가 성공적으로 변경되었습니다!');
    };

    return (
        <div className="settings-section">
            <h2>계정 설정</h2>
            {message && <p className="form-message">{message}</p>}

            <form onSubmit={handlePasswordChange} className="settings-form">
                <h3>비밀번호 재설정</h3>
                <div className="form-group">
                    <label htmlFor="current-password">현재 비밀번호:</label>
                    <input
                        type="password"
                        id="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="new-password">새 비밀번호:</label>
                    <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirm-password">새 비밀번호 확인:</label>
                    <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="settings-submit-button">비밀번호 변경</button>
            </form>

            <form onSubmit={handleEmailChange} className="settings-form">
                <h3>이메일 변경</h3>
                <div className="form-group">
                    <label htmlFor="email">새 이메일:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="settings-submit-button">이메일 변경</button>
            </form>
        </div>
    );
}

export default AccountSettings;