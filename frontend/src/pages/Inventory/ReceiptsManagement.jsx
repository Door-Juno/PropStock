// src/pages/Inventory/ReceiptsManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReceiptsManagement.css';

const ReceiptsManagement = () => {
    const [receipts, setReceipts] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        product: '',
        quantity: '',
        transaction_date: new Date().toISOString().slice(0, 10), // 오늘 날짜로 초기화
        notes: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch products for dropdown
        axios.get(`${process.env.REACT_APP_API_URL}/api/products/`, { headers })
            .then(response => {
                // 품목 코드(item_code)를 기준으로 자연어 정렬 (숫자 순서대로)
                const sortedData = response.data.sort((a, b) => a.item_code.localeCompare(b.item_code, undefined, { numeric: true }));
                setProducts(sortedData);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });

        // Fetch receipt history
        axios.get(`${process.env.REACT_APP_API_URL}/api/inventory/transactions/?type=in`, { headers })
            .then(response => {
                setReceipts(response.data);
            })
            .catch(error => {
                console.error('Error fetching receipts:', error);
            });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleReceiptSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        axios.post(`${process.env.REACT_APP_API_URL}/api/inventory/transactions/`, { ...formData, type: 'in' }, { headers })
            .then(response => {
                setReceipts([response.data, ...receipts]);
                // Reset form
                setFormData({
                    product: '',
                    quantity: '',
                    transaction_date: new Date().toISOString().slice(0, 10),
                    notes: ''
                });
            })
            .catch(error => {
                console.error('Error adding receipt:', error.response ? error.response.data : error);
            });
    };

    return (
        <div className="receipts-management">
            <h2>입고 관리</h2>

            <div className="receiving-form">
                <h3>입고 기록</h3>
                <form onSubmit={handleReceiptSubmit}>
                    <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleInputChange} required />
                    <select name="product" value={formData.product} onChange={handleInputChange} required>
                        <option value="">품목 선택</option>
                        {products.map(product => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                    </select>
                    <input type="number" name="quantity" placeholder="수량" value={formData.quantity} onChange={handleInputChange} required />
                    <input type="text" name="notes" placeholder="비고" value={formData.notes} onChange={handleInputChange} />
                    <button type="submit">입고 기록</button>
                </form>
            </div>

            <div className="receipt-history">
                <h3>입고 내역</h3>
                <table>
                    <thead>
                        <tr>
                            <th>입고일</th>
                            <th>품목</th>
                            <th>수량</th>
                            <th>비고</th>
                        </tr>
                    </thead>
                    <tbody>
                        {receipts.map(receipt => (
                            <tr key={receipt.id}>
                                <td>{new Date(receipt.transaction_date).toLocaleDateString()}</td>
                                <td>{receipt.product_name}</td>
                                <td>{receipt.quantity}</td>
                                <td>{receipt.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReceiptsManagement;