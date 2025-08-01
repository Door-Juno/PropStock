import React, { useState } from 'react';
import './SalesForecast.css'; // CSS 파일 임포트

function SalesForecast() {
    const [forecastData, setForecastData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFetchForecast = async () => {
        setIsLoading(true);
        setError(null);
        setForecastData([]);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/predictions/sales-forecast/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || '수요 예측 데이터를 불러오는 데 실패했습니다.');
            }

            const data = await response.json();
            setForecastData(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="sales-forecast">
            <h2>AI 기반 판매량 예측</h2>
            <p>내일의 품목별 예상 판매량을 예측합니다. 버튼을 클릭하여 AI 예측을 실행하세요.</p>
            
            <div className="forecast-actions">
                <button onClick={handleFetchForecast} disabled={isLoading}>
                    {isLoading ? '예측 중...' : '내일 판매량 예측 실행'}
                </button>
            </div>

            {error && <p className="error-message">오류: {error}</p>}

            {isLoading && <div className="loading-spinner"></div>}

            {forecastData.length > 0 && (
                <div className="forecast-results">
                    <h3>예측 결과 (내일)</h3>
                    <table className="forecast-table">
                        <thead>
                            <tr>
                                <th>품목명</th>
                                <th>현재고</th>
                                <th>예상 판매량</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forecastData.map((item) => (
                                <tr key={item.product_id}>
                                    <td>{item.name}</td>
                                    <td>{item.current_stock}</td>
                                    <td>{item.predicted_quantity.toFixed(1)} 개</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default SalesForecast;