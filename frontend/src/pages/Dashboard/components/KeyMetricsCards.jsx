// components/KeyMetricsCards.jsx
import React, { useState, useEffect } from 'react';
import './KeyMetricsCards.css'; // 별도 CSS 파일 (나중에 생성)

function KeyMetricsCards() {
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummaryData = async () => {
            try {
                // 실제 API 엔드포인트: /api/reports/summary/
                // 개발 시에는 mock 데이터를 사용하거나 프록시 설정을 고려해야 합니다.
                const response = await fetch('/api/reports/summary/');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setSummaryData(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSummaryData();
    }, []);

    if (loading) return <div className="key-metrics-cards">데이터 로딩 중...</div>;
    if (error) return <div className="key-metrics-cards error">데이터 로드 실패: {error.message}</div>;
    if (!summaryData) return <div className="key-metrics-cards">요약 데이터가 없습니다.</div>;

    return (
        <div className="key-metrics-cards">
            <h2>핵심 지표</h2>
            <div className="metrics-grid">
                <div className="metric-card">
                    <h3>월간 총 수입</h3>
                    <p>{summaryData.monthlyRevenue ? `${summaryData.monthlyRevenue.toLocaleString()}원` : 'N/A'}</p>
                </div>
                <div className="metric-card">
                    <h3>주간 판매량</h3>
                    <p>{summaryData.weeklySalesCount ? `${summaryData.weeklySalesCount.toLocaleString()}개` : 'N/A'}</p>
                </div>
                <div className="metric-card">
                    <h3>현재 재고 가치</h3>
                    <p>{summaryData.currentStockValue ? `${summaryData.currentStockValue.toLocaleString()}원` : 'N/A'}</p>
                </div>
                {/* 필요에 따라 다른 지표 추가 */}
            </div>
        </div>
    );
}

export default KeyMetricsCards;