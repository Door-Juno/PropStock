// src/pages/Settings/NotificationSettings.jsx
import React, { useState, useEffect } from 'react';
import './SettingsSection.css'; // 공통 스타일

function NotificationSettings() {
    const [notificationSettings, setNotificationSettings] = useState({
        lowStock: { enabled: true, channel: ['app'] },
        expiredSoon: { enabled: true, channel: ['app'] },
        orderRecommendation: { enabled: true, channel: ['app'] },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchNotificationSettings = async () => {
            try {
                // 데이터 소스: GET /api/settings/notifications/
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/notifications/`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setNotificationSettings(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotificationSettings();
    }, []);

    const handleToggleChange = (alertType) => {
        setNotificationSettings(prevSettings => ({
            ...prevSettings,
            [alertType]: {
                ...prevSettings[alertType],
                enabled: !prevSettings[alertType].enabled
            }
        }));
    };

    const handleChannelChange = (alertType, channel) => {
        setNotificationSettings(prevSettings => {
            const currentChannels = prevSettings[alertType].channel;
            const newChannels = currentChannels.includes(channel)
                ? currentChannels.filter(c => c !== channel)
                : [...currentChannels, channel];
            return {
                ...prevSettings,
                [alertType]: {
                    ...prevSettings[alertType],
                    channel: newChannels
                }
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            // 데이터 전송: PUT /api/settings/notifications/
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/notifications/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // 인증 토큰이 필요할 수 있습니다.
                },
                body: JSON.stringify(notificationSettings),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setNotificationSettings(data); // 업데이트된 정보로 상태 갱신
            setMessage('알림 설정이 성공적으로 저장되었습니다!');
        } catch (err) {
            setError(err);
            setMessage(`알림 설정 저장 실패: ${err.message}`);
        }
    };

    if (loading) return <div className="settings-section">알림 설정 로딩 중...</div>;
    if (error) return <div className="settings-section error">알림 설정 로드 실패: {error.message}</div>;

    return (
        <div className="settings-section">
            <h2>알림 설정</h2>
            {message && <p className="form-message">{message}</p>}

            <form onSubmit={handleSubmit} className="settings-form">
                {Object.keys(notificationSettings).map(type => (
                    <div key={type} className="notification-item">
                        <h3>
                            {type === 'lowStock' ? '재고 부족 알림' :
                             type === 'expiredSoon' ? '유통기한 임박 알림' :
                             '발주 추천 알림'}
                        </h3>
                        <div className="toggle-switch">
                            <input
                                type="checkbox"
                                id={`${type}-toggle`}
                                checked={notificationSettings[type].enabled}
                                onChange={() => handleToggleChange(type)}
                            />
                            <label htmlFor={`${type}-toggle`}>
                                <span className="slider round"></span>
                            </label>
                            <span>{notificationSettings[type].enabled ? '활성화' : '비활성화'}</span>
                        </div>
                        <div className="channel-options">
                            <label>채널:</label>
                            <input
                                type="checkbox"
                                id={`${type}-app`}
                                checked={notificationSettings[type].channel.includes('app')}
                                onChange={() => handleChannelChange(type, 'app')}
                            />
                            <label htmlFor={`${type}-app`}>앱 내</label>
                            <input
                                type="checkbox"
                                id={`${type}-push`}
                                checked={notificationSettings[type].channel.includes('push')}
                                onChange={() => handleChannelChange(type, 'push')}
                            />
                            <label htmlFor={`${type}-push`}>푸시</label>
                            <input
                                type="checkbox"
                                id={`${type}-email`}
                                checked={notificationSettings[type].channel.includes('email')}
                                onChange={() => handleChannelChange(type, 'email')}
                            />
                            <label htmlFor={`${type}-email`}>이메일</label>
                        </div>
                    </div>
                ))}
                <button type="submit" className="settings-submit-button">설정 저장</button>
            </form>
        </div>
    );
}

export default NotificationSettings;