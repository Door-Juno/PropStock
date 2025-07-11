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
                // 실제 API 엔드포인트: /api/inventory/status/?alert_type=low_stock,expired_soon
                const response = await fetch('/api/inventory/status/?alert_type=low_stock,expired_soon');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setAlerts(data);
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
            <h2>재고/유통기한 임박 알림</h2>
            {alerts.length === 0 ? (
                <p>현재 특별한 알림이 없습니다.</p>
            ) : (
                <ul>
                    {alerts.map((item) => (
                        <li key={item.id} className={`alert-item ${item.alert_type === 'low_stock' ? 'low-stock' : 'expired-soon'}`}>
                            <strong>{item.name}</strong> -
                            {item.alert_type === 'low_stock' ? ` 재고 부족 (현재: ${item.current_stock}개)` : ` 유통기한 임박 (${item.expiry_date}까지)`}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CriticalStockAlertList;