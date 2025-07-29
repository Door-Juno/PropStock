
// components/DailyOrderRecommendationSummary.jsx
import React, { useState, useEffect } from 'react';
import './DailyOrderRecommendationSummary.css'; // 별도 CSS 파일 (나중에 생성)

function DailyOrderRecommendationSummary() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const today = new Date().toISOString().split('T')[0]; // 오늘 날짜
                // 실제 API 엔드포인트: /api/predictions/orders/recommendations/?date=today
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`/api/predictions/orders/recommendations/?date=${today}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setRecommendations(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    if (loading) return <div className="daily-order-recommendation-summary">발주 추천 로딩 중...</div>;
    if (error) return <div className="daily-order-recommendation-summary error">발주 추천 로드 실패: {error.message}</div>;

    return (
        <div className="daily-order-recommendation-summary">
            <h2>오늘의 발주 추천 요약</h2>
            {recommendations.length === 0 ? (
                <p>오늘 추천할 발주 품목이 없습니다.</p>
            ) : (
                <ul>
                    {recommendations.slice(0, 5).map((item) => ( // 상위 5개만 표시
                        <li key={item.item_id}>
                            <strong>{item.item_name}</strong>: {item.recommended_quantity}개
                        </li>
                    ))}
                    {recommendations.length > 5 && (
                        <li className="more-items">...더 많은 품목 보기</li>
                    )}
                </ul>
            )}
            <button className="view-details-button">전체 추천 보러가기</button>
        </div>
    );
}

export default DailyOrderRecommendationSummary;