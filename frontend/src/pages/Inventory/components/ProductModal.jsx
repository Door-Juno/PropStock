import React from 'react';
import './ProductModal.css';

const ProductModal = ({ product, onClose, onSave }) => {
  // TODO: Implement form state and submission logic
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{product ? '품목 수정' : '새 품목 추가'}</h2>
        {/* TODO: Add form fields for product details */}
        <div className="modal-actions">
          <button onClick={onClose}>취소</button>
          <button onClick={onSave}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
