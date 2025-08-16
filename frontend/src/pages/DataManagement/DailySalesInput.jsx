import React, { useState, useEffect } from 'react';
import './DataManagementSection.css'; // 공통 스타일

function DailySalesInput() {
    const [products, setProducts] = useState([]); // 품목 목록 상태
    const [salesDate, setSalesDate] = useState(new Date().toISOString().split('T')[0]); // 판매 날짜
    const [salesQuantities, setSalesQuantities] = useState({}); // 품목별 판매량
    const [salesEventDays, setSalesEventDays] = useState({}); // 품목별 행사 여부
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // 품목 목록을 불러옵니다.
    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // 품목 코드(item_code)를 기준으로 자연어 정렬 (숫자 순서대로)
            const sortedData = data.sort((a, b) => a.item_code.localeCompare(b.item_code, undefined, { numeric: true }));
            setProducts(sortedData);
            // 초기 판매량 상태 설정
            const initialQuantities = {};
            const initialEventDays = {};
            sortedData.forEach(p => {
                initialQuantities[p.id] = 0; // 기본 판매량 0
                initialEventDays[p.id] = false; // 기본 행사 여부 false
            });
            setSalesQuantities(initialQuantities);
            setSalesEventDays(initialEventDays);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleQuantityChange = (productId, value) => {
        setSalesQuantities(prev => ({
            ...prev,
            [productId]: Math.max(0, Number(value)) // 음수 방지
        }));
    };

    const handleEventDayChange = (productId, checked) => {
        setSalesEventDays(prev => ({
            ...prev,
            [productId]: checked
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const salesRecordsToSave = [];
        products.forEach(p => {
            const quantity = salesQuantities[p.id];
            if (quantity > 0) { // 판매량이 0보다 큰 품목만 저장
                salesRecordsToSave.push({
                    item: p.id, // 품목 ID
                    date: salesDate,
                    quantity: quantity,
                    selling_price: p.selling_price, // 품목의 판매가 사용
                    cost_price: p.cost_price,     // 품목의 원가 사용
                    is_event_day: salesEventDays[p.id], // 품목별 행사 여부 사용
                });
            }
        });

        if (salesRecordsToSave.length === 0) {
            setError('저장할 판매 기록이 없습니다. 판매량을 입력해주세요.');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sales/records/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(salesRecordsToSave), // 배열 형태로 전송
            });

            if (!response.ok) {
                const errorData = await response.json();
                // 백엔드에서 오는 다양한 에러 메시지를 처리
                const errorMessage = Object.values(errorData).flat().join(' ');
                throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
            }

            setMessage('판매 기록이 성공적으로 저장되었습니다!');
            // 저장 후 판매량 및 행사 여부 초기화, 품목 목록 새로고침
            const resetQuantities = {};
            const resetEventDays = {};
            products.forEach(p => { 
                resetQuantities[p.id] = 0; 
                resetEventDays[p.id] = false;
            });
            setSalesQuantities(resetQuantities);
            setSalesEventDays(resetEventDays);
            fetchProducts(); // 재고가 업데이트되었으므로 품목 목록을 다시 불러옵니다.

        } catch (err) {
            setError(`판매 기록 저장 실패: ${err.message}`);
        }
    };

    return (
        <div className="data-management-section">
            <h2>일일 판매 기록 입력</h2>
            {message && <p className="form-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit} className="data-management-form">
                <div className="form-group">
                    <label htmlFor="salesDate">날짜:</label>
                    <input
                        type="date"
                        id="salesDate"
                        name="salesDate"
                        value={salesDate}
                        onChange={(e) => setSalesDate(e.target.value)}
                        required
                    />
                </div>
                
                <div className="data-table-container">
                    <h3>품목별 판매량 입력</h3>
                    {products.length === 0 ? (
                        <p>등록된 품목이 없습니다. 품목 관리에서 품목을 추가해주세요.</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>품목코드</th>
                                    <th>품목명</th>
                                    <th>현재고</th>
                                    <th>판매가</th>
                                    <th>원가</th>
                                    <th>판매량</th>
                                    <th>행사 여부</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.item_code}</td>
                                        <td>{p.name}</td>
                                        <td>{p.current_stock}</td>
                                        <td>{p.selling_price.toLocaleString()}</td>
                                        <td>{p.cost_price.toLocaleString()}</td>
                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                value={salesQuantities[p.id] || 0}
                                                onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                                                style={{ width: '80px' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={salesEventDays[p.id] || false}
                                                onChange={(e) => handleEventDayChange(p.id, e.target.checked)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <button type="submit" className="data-management-submit-button">판매 기록 저장</button>
            </form>

            {/* 최근 판매 내역은 SalesHistory 컴포넌트에서 관리하는 것이 더 적절합니다. */}
            {/* <div className="data-table-container">
                <h3>오늘/최근 판매 내역 요약</h3>
                <p>최근 입력된 판매 내역이 없습니다.</p>
            </div> */}
        </div>
    );
}

export default DailySalesInput;
