import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SettingsSection.css'; // 공통 스타일

function AccountSettings() {
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setError('로그인이 필요합니다.');
                    setLoading(false);
                    return;
                }
                                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me/`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUsername(response.data.username);
                setEmail(response.data.email);
            } catch (err) {
                console.error('사용자 정보 로드 실패:', err);
                setError('사용자 정보를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

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

    const handleEmailChange = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/email-change/`, {
                new_email: email,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage(response.data.message || '이메일 주소가 성공적으로 변경되었습니다!');
        } catch (err) {
            console.error('이메일 변경 실패:', err.response ? err.response.data : err);
            setError(err.response && err.response.data && (err.response.data.new_email || err.response.data.detail) || '이메일 변경에 실패했습니다.');
        }
    };

    if (loading) {
        return <div className="settings-section">로딩 중...</div>;
    }

    if (error) {
        return <div className="settings-section error-message">{error}</div>;
    }

    return (
        <div className="settings-section">
            <h2>계정 설정</h2>
            {message && <p className="form-message">{message}</p>}

            <div className="user-info-display">
                <p><strong>아이디:</strong> {username}</p>
                <p><strong>이메일:</strong> {email}</p>
            </div>

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