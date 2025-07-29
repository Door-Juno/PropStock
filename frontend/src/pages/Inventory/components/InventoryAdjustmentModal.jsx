import React, { useState } from 'react';
import './ProductModal.css'; // 기존 모달 CSS 재활용

const InventoryAdjustmentModal = ({ product, onClose, onSave }) => {
    const [adjustment, setAdjustment] = useState({
        quantity: 1,
        notes: '',
    });

    if (!product) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdjustment(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (adjustment.quantity <= 0) {
            alert('수량은 1 이상이어야 합니다.');
            return;
        }
        if (adjustment.quantity > product.current_stock) {
            alert(`현재 재고(${product.current_stock})보다 많은 수량을 조정할 수 없습니다.`);
            return;
        }
        onSave(product.id, {
            ...adjustment,
            quantity: parseInt(adjustment.quantity, 10),
        });
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>재고 조정: {product.name}</h2>
                <p>현재 재고: {product.current_stock}</p>
                
                <div className="form-group">
                    <label htmlFor="quantity">조정 수량 (감소):</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={adjustment.quantity}
                        onChange={handleChange}
                        min="1"
                        max={product.current_stock}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="notes">사유 (폐기, 손실 등):</label>
                    <input
                        type="text"
                        id="notes"
                        name="notes"
                        value={adjustment.notes}
                        onChange={handleChange}
                        placeholder="예: 유통기한 만료로 폐기"
                        required
                    />
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="button-cancel">취소</button>
                    <button onClick={handleSave} className="button-save">저장</button>
                </div>
            </div>
        </div>
    );
};

export default InventoryAdjustmentModal;
