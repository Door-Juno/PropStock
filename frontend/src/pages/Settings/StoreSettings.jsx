import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SettingsSection.css'; // 공통 스타일

function StoreSettings() {
    const [storeInfo, setStoreInfo] = useState({
        name: '',
        industry: '',
        region: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchStoreInfo = async () => {
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
                if (response.data.store) {
                    setStoreInfo({
                        name: response.data.store.name || '',
                        industry: response.data.store.industry || '',
                        region: response.data.store.region || '',
                    });
                }
            } catch (err) {
                console.error('매장 정보 로드 실패:', err);
                setError('매장 정보를 불러오는 데 실패했습니다.');
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
            const token = localStorage.getItem('accessToken');
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/store/`, storeInfo, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
            });
            setStoreInfo(response.data); // 업데이트된 정보로 상태 갱신
            setMessage('매장 정보가 성공적으로 업데이트되었습니다!');
        } catch (err) {
            console.error('매장 정보 업데이트 실패:', err);
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
                <button type="submit" className="settings-submit-button">정보 저장</button>
            </form>
        </div>
    );
}

export default StoreSettings;