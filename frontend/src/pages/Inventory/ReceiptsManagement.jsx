// src/pages/Inventory/ReceiptsManagement.jsx
import React, { useState, useEffect } from 'react';
import './ReceiptsManagement.css'; // CSS 파일 임포트

function ReceiptsManagement() {
    const [products, setProducts] = useState([]); // 품목 목록 상태
    const [receiptRecord, setReceiptRecord] = useState({
        product: '', // 품목 ID
        quantity: 1,
        notes: '',
    });
    const [recentReceipts, setRecentReceipts] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // 컴포넌트 마운트 시 품목 목록을 가져옵니다.
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // TODO: 실제 API 엔드포인트로 수정해야 합니다.
                const token = localStorage.getItem('accessToken');
                const response = await fetch('/api/products/', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) {
                    throw new Error('품목 목록을 불러오는 데 실패했습니다.');
                }
                const data = await response.json();
                setProducts(data);
                // 기본 선택값 설정
                if (data.length > 0) {
                    setReceiptRecord(prev => ({ ...prev, product: data[0].id }));
                }
            } catch (err) {
                setError(err.message);
            }
        };
        fetchProducts();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setReceiptRecord(prevRecord => ({
            ...prevRecord,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!receiptRecord.product || receiptRecord.quantity <= 0) {
            setError('품목을 선택하고, 수량은 1 이상 입력해주세요.');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken'); // 예시: 로컬 스토리지에서 토큰 가져오기
            const response = await fetch('/api/inventory/transactions/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...receiptRecord,
                    type: 'in', // 입고 유형
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const newReceipt = await response.json();
            setMessage('입고 기록이 성공적으로 추가되었습니다!');
            setRecentReceipts(prevReceipts => [newReceipt, ...prevReceipts.slice(0, 4)]);
            
            // 폼 초기화
            setReceiptRecord({
                product: products.length > 0 ? products[0].id : '',
                quantity: 1,
                notes: '',
            });

        } catch (err) {
            setError(`입고 기록 추가 실패: ${err.message}`);
        }
    };

    return (
        <div className="receipts-management">
            <h2>입고 처리</h2>
            {message && <p className="form-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit} className="receipt-form">
                <div className="form-group">
                    <label htmlFor="product">품목 선택:</label>
                    <select
                        id="product"
                        name="product"
                        value={receiptRecord.product}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>품목을 선택하세요</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} ({p.item_code})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="quantity">입고 수량:</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={receiptRecord.quantity}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="notes">비고 (입고처 등):</label>
                    <input
                        type="text"
                        id="notes"
                        name="notes"
                        value={receiptRecord.notes}
                        onChange={handleChange}
                        placeholder="예: ABC 유통"
                    />
                </div>
                <button type="submit" className="receipt-submit-button">입고 처리</button>
            </form>

            <div className="data-table-container">
                <h3>최근 입고 내역</h3>
                {recentReceipts.length === 0 ? (
                    <p>최근 입고 내역이 없습니다.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>처리 시간</th>
                                <th>품목명</th>
                                <th>수량</th>
                                <th>비고</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentReceipts.map((receipt) => (
                                <tr key={receipt.id}>
                                    <td>{new Date(receipt.created_at).toLocaleString()}</td>
                                    <td>{receipt.product_name}</td>
                                    <td>{receipt.quantity}</td>
                                    <td>{receipt.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default ReceiptsManagement;