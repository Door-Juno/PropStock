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
    const [transactions, setTransactions] = useState([]); // 입출고 내역 상태 (recentReceipts 대신)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [searchFilters, setSearchFilters] = useState({
        startDate: '',
        endDate: '',
        type: '', // 'in', 'out' 또는 '' (전체)
    });

    // 컴포넌트 마운트 시 품목 목록 및 입출고 내역을 가져옵니다.
    useEffect(() => {
        fetchProducts();
        fetchTransactions();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/products/', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('품목 목록을 불러오는 데 실패했습니다.');
            }
            const data = await response.json();
            setProducts(data);
            if (data.length > 0) {
                setReceiptRecord(prev => ({ ...prev, product: data[0].id }));
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchTransactions = async (filters = searchFilters) => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const queryParams = new URLSearchParams();
            if (filters.startDate) queryParams.append('start_date', filters.startDate);
            if (filters.endDate) queryParams.append('end_date', filters.endDate);
            if (filters.type) queryParams.append('type', filters.type);

            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/inventory/transactions/?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setTransactions(data);
            setMessage('입출고 내역을 불러왔습니다.');
        } catch (err) {
            setError(`입출고 내역 로드 실패: ${err.message}`);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setReceiptRecord(prevRecord => ({
            ...prevRecord,
            [name]: value
        }));
    };

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchTransactions(searchFilters);
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
            const token = localStorage.getItem('accessToken');
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

            setMessage('입고 기록이 성공적으로 추가되었습니다!');
            // 입고 후 내역 새로고침
            fetchTransactions();
            
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
                <h3>입출고 내역</h3>
                <form onSubmit={handleSearchSubmit} className="search-filter-form">
                    <div className="form-group">
                        <label htmlFor="startDate">시작 날짜:</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={searchFilters.startDate}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="endDate">종료 날짜:</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={searchFilters.endDate}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="type">유형:</label>
                        <select
                            id="type"
                            name="type"
                            value={searchFilters.type}
                            onChange={handleSearchChange}
                        >
                            <option value="">전체</option>
                            <option value="in">입고</option>
                            <option value="out">출고</option>
                        </select>
                    </div>
                    <button type="submit" className="data-management-submit-button">검색</button>
                </form>

                {loading ? (
                    <p>입출고 내역 로딩 중...</p>
                ) : transactions.length === 0 ? (
                    <p>조회된 입출고 내역이 없습니다.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>날짜</th>
                                <th>유형</th>
                                <th>품목명</th>
                                <th>수량</th>
                                <th>비고</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>{transaction.date}</td>
                                    <td>{transaction.type === 'in' ? '입고' : '출고'}</td>
                                    <td>{transaction.item_name}</td>
                                    <td>{transaction.quantity}</td>
                                    <td>{transaction.notes}</td>
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