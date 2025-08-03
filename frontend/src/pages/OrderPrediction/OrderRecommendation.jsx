import React, { useState, useEffect } from 'react';
import './OrderRecommendation.css'; // CSS 파일 임포트

const OrderRecommendation = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/predictions/orders/recommendations/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || '발주 추천 데이터를 불러오는 데 실패했습니다.');
      }

      const data = await response.json();
      // 품목 코드(item_code)를 기준으로 자연어 정렬 (숫자 순서대로)
      const sortedData = data.sort((a, b) => a.item_code.localeCompare(b.item_code, undefined, { numeric: true }));
      setRecommendations(sortedData);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleOrderPlaced = (recommendationId) => {
    // TODO: API 연동하여 발주 완료 처리 (현재는 콘솔 로그만 출력)
    console.log('Order placed for:', recommendationId);
    alert(`발주 완료 처리: ${recommendationId}`);
  };

  return (
    <div className="order-recommendation">
      <h2>최적 발주량 추천</h2>
      <button onClick={fetchRecommendations} disabled={isLoading} className="refresh-btn">
        {isLoading ? '추천 로딩 중...' : '발주 추천 새로고침'}
      </button>

      {error && <p className="error-message">오류: {error}</p>}

      {isLoading && <div className="loading-spinner"></div>}

      {recommendations.length === 0 && !isLoading && !error ? (
        <p>현재 추천할 발주 품목이 없습니다.</p>
      ) : (
        <table className="recommendation-table">
          <thead>
            <tr>
              <th>품목코드</th>
              <th>품목명</th>
              <th>현재고</th>
              <th>예상 소진일</th>
              <th>추천 발주량</th>
              <th>권장 발주 시점</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((rec) => (
              <tr key={rec.item_code}>
                <td>{rec.item_code}</td>
                <td>{rec.item_name}</td>
                <td>{rec.current_stock}</td>
                <td>{rec.stock_out_estimate_date || 'N/A'}</td>
                <td>{rec.recommended_order_quantity}</td>
                <td>{rec.order_by_date || 'N/A'}</td>
                <td>
                  <button onClick={() => handleOrderPlaced(rec.item_code)} className="order-btn">발주 완료</button>
                </td>
              </tr>
            ))
            }
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderRecommendation;