import React, { useState, useEffect } from 'react';
import './OrderRecommendation.css'; // CSS 파일 임포트

const OrderRecommendation = () => {
  const [recommendations, setRecommendations] = useState([]);

  // TODO: API 연동하여 발주 추천 데이터 가져오기 (useEffect 사용)
  useEffect(() => {
    // 임시 데이터
    const mockRecommendations = [
      { id: 1, item_code: 'P001', name: '바나나우유', current_stock: 30, predicted_sales: 150, stock_out_date: '2025-07-22', recommended_quantity: 120, order_date: '2025-07-20' },
      { id: 2, item_code: 'P004', name: '감자칩', current_stock: 15, predicted_sales: 50, stock_out_date: '2025-07-21', recommended_quantity: 40, order_date: '2025-07-19' },
    ];
    setRecommendations(mockRecommendations);
  }, []);

  const handleOrderPlaced = (recommendationId) => {
    // TODO: API 연동하여 발주 완료 처리
    console.log('Order placed for:', recommendationId);
  };

  return (
    <div className="order-recommendation">
      <h2>최적 발주량 추천</h2>
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
            <tr key={rec.id}>
              <td>{rec.item_code}</td>
              <td>{rec.name}</td>
              <td>{rec.current_stock}</td>
              <td>{rec.stock_out_date}</td>
              <td>{rec.recommended_quantity}</td>
              <td>{rec.order_date}</td>
              <td>
                <button onClick={() => handleOrderPlaced(rec.id)} className="order-btn">발주 완료</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderRecommendation;
