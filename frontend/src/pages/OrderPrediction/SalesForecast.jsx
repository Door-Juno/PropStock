import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SalesForecast.css'; 

function SalesForecast() {
    const [forecastData, setForecastData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [storeId, setStoreId] = useState(null);
    const [allProductCodes, setAllProductCodes] = useState([]); 
    const [productDetailsMap, setProductDetailsMap] = useState({}); 
    const [predictDate, setPredictDate] = useState(new Date().toISOString().slice(0, 10)); 
    useEffect(() => {
        const fetchUserDataAndProducts = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('로그인이 필요합니다.');
                return;
            }

            try {
                // 1. 사용자 정보 (store_id) 가져오기
                const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me/`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                setStoreId(userResponse.data.store.id); 

                // 2. 모든 품목 코드 및 상세 정보 가져오기
                const productResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const codes = [];
                const detailsMap = {};
                productResponse.data.forEach(p => {
                    codes.push(p.id);
                    detailsMap[p.id] = { item_code: p.item_code, name: p.name };
                });
                setAllProductCodes(codes);
                setProductDetailsMap(detailsMap);

            } catch (err) {
                setError('사용자 정보 또는 품목 정보를 불러오는 데 실패했습니다.');
                console.error('Error fetching user data or products:', err);
            }
        };

        fetchUserDataAndProducts();
    }, []);

    const handleFetchForecast = async () => {
        setIsLoading(true);
        setError(null);
        setForecastData([]);

        if (!storeId) {
            setError('가게 ID를 불러오지 못했습니다. 로그인을 확인해주세요.');
            setIsLoading(false);
            return;
        }
        if (allProductCodes.length === 0) {
            setError('예측할 품목이 없습니다. 품목을 등록해주세요.');
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const requestBody = {
                store_id: storeId,
                product_codes: allProductCodes,
                predict_date: predictDate,
                is_event_day: 0, 
            };

            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/predictions/sales-forecast/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                params: requestBody, 
            });

            const data = response.data.map(p => {
                return {
                    product_id: p.product_id,
                    item_code: p.item_code,  
                    name: p.name,             
                    predicted_quantity: Math.round(p.predicted_quantity),
                };
            });
            const sortedData = data.sort((a, b) => a.item_code.localeCompare(b.item_code, undefined, { numeric: true }));
            setForecastData(sortedData);

        } catch (err) {
            setError(`AI 예측 서버 연결에 실패했습니다: ${err.response ? err.response.statusText : err.message}`);
            console.error('AI 예측 오류:', err.response ? err.response.data : err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="sales-forecast">
            <h2>AI 기반 판매량 예측</h2>
            <p>내일의 품목별 예상 판매량을 예측합니다. 버튼을 클릭하여 AI 예측을 실행하세요.</p>
            
            <div className="forecast-actions">
                <div className="form-group">
                    <label htmlFor="predictDate">예측 날짜:</label>
                    <input 
                        type="date" 
                        id="predictDate" 
                        value={predictDate} 
                        onChange={(e) => setPredictDate(e.target.value)} 
                        className="date-input"
                    />
                </div>
                <button onClick={handleFetchForecast} disabled={isLoading || !storeId || allProductCodes.length === 0} className="action-button">
                    {isLoading ? '예측 중...' : '판매량 예측 실행'}
                </button>
            </div>

            {error && <p className="error-message">오류: {error}</p>}

            {isLoading && <div className="loading-spinner"></div>}

            {forecastData.length > 0 && (
                <div className="forecast-results">
                    <h3>예측 결과 ({predictDate})</h3>
                    <table className="forecast-table">
                        <thead>
                            <tr>
                                <th>품목코드</th>
                                <th>상품명</th>
                                <th>예상 판매량</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forecastData.map((item) => (
                                <tr key={item.product_id}>
                                    <td>{item.item_code}</td>
                                    <td>{item.name}</td>
                                    <td>{item.predicted_quantity} 개</td>
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