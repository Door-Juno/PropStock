// src/pages/Settings/StoreSettings.jsx
import React, { useState, useEffect } from 'react';
import './SettingsSection.css'; // 공통 스타일

function StoreSettings() {
    const [storeInfo, setStoreInfo] = useState({
        name: '',
        industry: '',
        region: '',
        openingHours: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchStoreInfo = async () => {
            try {
                // 데이터 소스: GET /api/store/
                const response = await fetch('/api/store/');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setStoreInfo(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStoreInfo();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStoreInfo(prevInfo => ({
            ...prevInfo,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            // 데이터 전송: PUT /api/store/
            const response = await fetch('/api/store/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // 인증 토큰이 필요할 수 있습니다.
                },
                body: JSON.stringify(storeInfo),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setStoreInfo(data); // 업데이트된 정보로 상태 갱신
            setMessage('매장 정보가 성공적으로 업데이트되었습니다!');
        } catch (err) {
            setError(err);
            setMessage(`매장 정보 업데이트 실패: ${err.message}`);
        }
    };

    if (loading) return <div className="settings-section">매장 정보 로딩 중...</div>;
    if (error) return <div className="settings-section error">매장 정보 로드 실패: {error.message}</div>;

    return (
        <div className="settings-section">
            <h2>매장 설정</h2>
            {message && <p className="form-message">{message}</p>}

            <form onSubmit={handleSubmit} className="settings-form">
                <div className="form-group">
                    <label htmlFor="store-name">매장 이름:</label>
                    <input
                        type="text"
                        id="store-name"
                        name="name"
                        value={storeInfo.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="store-industry">업종:</label>
                    <input
                        type="text"
                        id="store-industry"
                        name="industry"
                        value={storeInfo.industry}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="store-region">지역:</label>
                    <input
                        type="text"
                        id="store-region"
                        name="region"
                        value={storeInfo.region}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="store-opening-hours">영업 시간:</label>
                    <input
                        type="text"
                        id="store-opening-hours"
                        name="openingHours"
                        value={storeInfo.openingHours}
                        onChange={handleChange}
                        placeholder="예: 09:00 - 22:00"
                    />
                </div>
                <button type="submit" className="settings-submit-button">정보 저장</button>
            </form>
        </div>
    );
}

export default StoreSettings;