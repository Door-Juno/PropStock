// src/pages/DataManagement/DailySalesInput.jsx
import React, { useState } from 'react';
import './DataManagementSection.css'; // 공통 스타일

function DailySalesInput() {
    const [salesRecord, setSalesRecord] = useState({
        date: new Date().toISOString().split('T')[0], // 오늘 날짜 기본값
        itemCode: '',
        itemName: '',
        quantity: 1,
        price: 0,
        cost: 0,
        isPromotion: false,
    });
    const [recentSales, setRecentSales] = useState([]); // 최근 입력된 판매 내역
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSalesRecord(prevRecord => ({
            ...prevRecord,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // 간단한 유효성 검사
        if (!salesRecord.itemCode || !salesRecord.itemName || salesRecord.quantity <= 0 || salesRecord.price < 0 || salesRecord.cost < 0) {
            setError('모든 필수 필드를 올바르게 입력해주세요 (수량, 가격, 원가는 0 이상).');
            return;
        }

        try {
            // 데이터 전송: POST /api/sales/records/
            const response = await fetch('/api/sales/records/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // 인증 토큰
                },
                body: JSON.stringify(salesRecord),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const newRecord = await response.json();
            setMessage('판매 기록이 성공적으로 추가되었습니다!');
            setRecentSales(prevSales => [newRecord, ...prevSales.slice(0, 4)]); // 최대 5개 유지
            
            // 폼 초기화 (날짜는 오늘 날짜로 유지)
            setSalesRecord({
                date: new Date().toISOString().split('T')[0],
                itemCode: '',
                itemName: '',
                quantity: 1,
                price: 0,
                cost: 0,
                isPromotion: false,
            });

        } catch (err) {
            setError(`판매 기록 추가 실패: ${err.message}`);
        }
    };

    // TODO: 품목코드/품목명 자동 완성 기능 구현 (백엔드 API 필요)
    // 예: 품목코드 입력 시 품목명 자동 채우기, 품목명 입력 시 품목코드 제안

    return (
        <div className="data-management-section">
            <h2>일일 판매 기록 입력</h2>
            {message && <p className="form-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit} className="data-management-form">
                <div className="form-group">
                    <label htmlFor="date">날짜:</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={salesRecord.date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="itemCode">품목 코드:</label>
                    <input
                        type="text"
                        id="itemCode"
                        name="itemCode"
                        value={salesRecord.itemCode}
                        onChange={handleChange}
                        required
                        placeholder="예: ABC001"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="itemName">품목명:</label>
                    <input
                        type="text"
                        id="itemName"
                        name="itemName"
                        value={salesRecord.itemName}
                        onChange={handleChange}
                        required
                        placeholder="예: 사과 (부사)"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="quantity">판매량:</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={salesRecord.quantity}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="price">판매가 (단가):</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={salesRecord.price}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="cost">원가 (단가):</label>
                    <input
                        type="number"
                        id="cost"
                        name="cost"
                        value={salesRecord.cost}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="checkbox"
                        id="isPromotion"
                        name="isPromotion"
                        checked={salesRecord.isPromotion}
                        onChange={handleChange}
                    />
                    <label htmlFor="isPromotion">행사 여부</label>
                </div>
                <button type="submit" className="data-management-submit-button">판매 기록 추가</button>
            </form>

            <div className="data-table-container">
                <h3>오늘/최근 판매 내역 요약</h3>
                {recentSales.length === 0 ? (
                    <p>최근 입력된 판매 내역이 없습니다.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>날짜</th>
                                <th>품목명</th>
                                <th>수량</th>
                                <th>판매가</th>
                                <th>원가</th>
                                <th>행사</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSales.map((record, index) => (
                                <tr key={index}> {/* 실제로는 record.id 사용 권장 */}
                                    <td>{record.date}</td>
                                    <td>{record.itemName}</td>
                                    <td>{record.quantity}</td>
                                    <td>{record.price.toLocaleString()}</td>
                                    <td>{record.cost.toLocaleString()}</td>
                                    <td>{record.isPromotion ? 'O' : 'X'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default DailySalesInput;