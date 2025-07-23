import React, { useState, useEffect } from 'react';
import './SalesForecast.css'; // CSS 파일 임포트

const SalesForecast = () => {
  const [forecastData, setForecastData] = useState([]);

  // TODO: API 연동하여 수요 예측 데이터 가져오기 (useEffect 사용)
  useEffect(() => {
    // 임시 데이터
    const mockForecast = [
      { id: 1, item_code: 'P001', name: '바나나우유', predicted_sales: 150, confidence: '높음' },
      { id: 2, item_code: 'P002', name: '초코파이', predicted_sales: 90, confidence: '중간' },
      { id: 3, item_code: 'P003', name: '콜라', predicted_sales: 200, confidence: '높음' },
    ];
    setForecastData(mockForecast);
  }, []);

  return (
    <div className="sales-forecast">
      <h2>수요 예측 결과</h2>
      <div className="chart-container">
        {/* 여기에 차트 라이브러리를 사용한 그래프가 렌더링됩니다. */}
        <p>예측 판매량 그래프 (Chart.js, Recharts 등 사용)</p>
      </div>
      <table className="forecast-table">
        <thead>
          <tr>
            <th>품목코드</th>
            <th>품목명</th>
            <th>예측 판매량 (다음 7일)</th>
            <th>예측 신뢰도</th>
          </tr>
        </thead>
        <tbody>
          {forecastData.map((item) => (
            <tr key={item.id}>
              <td>{item.item_code}</td>
              <td>{item.name}</td>
              <td>{item.predicted_sales}</td>
              <td>{item.confidence}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesForecast;
