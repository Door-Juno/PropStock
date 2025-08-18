// src/pages/Inventory/InventoryStatus.jsx
import React, { useState, useEffect } from 'react';
import InventoryAdjustmentModal from './components/InventoryAdjustmentModal'; 
import './InventoryStatus.css';

function InventoryStatus() {
    const [inventory, setInventory] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchInventory = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/inventory/status/`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('재고 현황을 불러오는 데 실패했습니다.');
            }
            const data = await response.json();
            const sortedData = data.sort((a, b) => a.item_code.localeCompare(b.item_code, undefined, { numeric: true }));
            setInventory(sortedData);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
        setMessage('');
        setError('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const handleSaveAdjustment = async (productId, adjustmentData) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/inventory/transactions/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    product: productId,
                    quantity: adjustmentData.quantity,
                    notes: adjustmentData.notes,
                    type: 'out', // 재고 조정은 '출고' 처리
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '재고 조정 실패');
            }

            setMessage('재고가 성공적으로 조정되었습니다.');
            handleCloseModal();
            fetchInventory(); // 재고 목록 새로고침

        } catch (err) {
            setError(`오류: ${err.message}`);
        }
    };

    const getStatus = (item) => {
        if (item.current_stock < item.min_stock) {
            return { text: '부족', className: 'status-low' };
        }
        if (item.current_stock < item.safety_stock) {
            return { text: '주의', className: 'status-warning' };
        }
        return { text: '정상', className: 'status-normal' };
    };

    return (
        <div className="inventory-status">
            <h2>실시간 재고 현황</h2>
            {message && <p className="form-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
            <table className="inventory-table">
                <thead>
                    <tr>
                        <th>품목명</th>
                        <th>현재고</th>
                        <th>최소/안전 재고</th>
                        <th>상태</th>
                        <th>조정</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.map((item) => {
                        const status = getStatus(item);
                        return (
                            <tr key={item.item_code} className={status.className}>
                                <td>{item.name}</td>
                                <td>{item.current_stock}</td>
                                <td>{`${item.min_stock} / ${item.safety_stock}`}</td>
                                <td>{status.text}</td>
                                <td>
                                    <button onClick={() => handleOpenModal(item)} className="button-adjust">
                                        재고 조정
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {isModalOpen && (
                <InventoryAdjustmentModal
                    product={selectedProduct}
                    onClose={handleCloseModal}
                    onSave={handleSaveAdjustment}
                />
            )}
        </div>
    );
}

export default InventoryStatus;