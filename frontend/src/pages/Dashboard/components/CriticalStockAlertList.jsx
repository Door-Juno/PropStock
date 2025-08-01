// components/CriticalStockAlertList.jsx
import React, { useState, useEffect } from 'react';
import './CriticalStockAlertList.css'; // 별도 CSS 파일 (나중에 생성)

function CriticalStockAlertList() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                // 실제 API 엔드포인트: /api/inventory/status/?alert_type=low_stock
                const token = localStorage.getItem('accessToken');
                const response = await fetch('/api/inventory/status/?alert_type=low_stock', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                // 유통기한 알림을 제외하고 재고 부족 알림만 필터링
                setAlerts(data.filter(item => item.status === '부족'));
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    if (loading) return <div className="critical-stock-alert-list">알림 목록 로딩 중...</div>;
    if (error) return <div className="critical-stock-alert-list error">알림 로드 실패: {error.message}</div>;

    return (
        <div className="critical-stock-alert-list">
            <h2>재고 부족 알림</h2>
            {alerts.length === 0 ? (
                <p>현재 재고 부족 알림이 없습니다.</p>
            ) : (
                <ul>
                    {alerts.map((item) => (
                        <li key={item.id} className="alert-item low-stock">
                            <strong>{item.name}</strong>: 재고 부족 (현재: {item.current_stock}개)
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CriticalStockAlertList;
