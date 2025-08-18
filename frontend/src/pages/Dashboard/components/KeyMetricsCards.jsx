// components/KeyMetricsCards.jsx
import React, { useState, useEffect } from 'react';
import './KeyMetricsCards.css';

function KeyMetricsCards() {
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummaryData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reports/summary/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
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
            <h2>최근 30일 요약</h2>
            <div className="metrics-grid">
                <div className="metric-card">
                    <h3>총 매출</h3>
                    <p>{summaryData.total_revenue ? `${summaryData.total_revenue.toLocaleString()}원` : '0원'}</p>
                </div>
                <div className="metric-card">
                    <h3>총 순이익</h3>
                    <p>{summaryData.total_profit ? `${summaryData.total_profit.toLocaleString()}원` : '0원'}</p>
                </div>
                <div className="metric-card">
                    <h3>총 판매량</h3>
                    <p>{summaryData.total_quantity ? `${summaryData.total_quantity.toLocaleString()}개` : '0개'}</p>
                </div>
            </div>
        </div>
    );
}

export default KeyMetricsCards;