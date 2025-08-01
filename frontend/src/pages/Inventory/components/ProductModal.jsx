import React, { useState, useEffect } from 'react';
import './ProductModal.css';

const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    item_code: '',
    name: '',
    unit: '',
    current_stock: 0,
    min_stock: 0,
    safety_stock: 0,
    selling_price: 0,
    cost_price: 0,
    lead_time: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        item_code: '',
        name: '',
        unit: '',
        current_stock: 0,
        min_stock: 0,
        safety_stock: 0,
        selling_price: 0,
        cost_price: 0,
        lead_time: 0,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{product ? '품목 수정' : '새 품목 추가'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>품목 코드:</label>
            <input type="text" name="item_code" value={formData.item_code} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>품목명:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>단위:</label>
            <input type="text" name="unit" value={formData.unit} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>현재 재고:</label>
            <input type="number" name="current_stock" value={formData.current_stock} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>최소 재고:</label>
            <input type="number" name="min_stock" value={formData.min_stock} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>안전 재고:</label>
            <input type="number" name="safety_stock" value={formData.safety_stock} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>판매가:</label>
            <input type="number" name="selling_price" value={formData.selling_price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>원가:</label>
            <input type="number" name="cost_price" value={formData.cost_price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>리드 타임 (일):</label>
            <input type="number" name="lead_time" value={formData.lead_time} onChange={handleChange} required />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="button-cancel">취소</button>
            <button type="submit" className="button-save">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
