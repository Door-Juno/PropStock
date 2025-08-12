import React, { useState, useEffect } from 'react';
import ProductModal from './components/ProductModal';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/products/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // 품목 코드(item_code)를 기준으로 자연어 정렬 (숫자 순서대로)
      const sortedData = data.sort((a, b) => a.item_code.localeCompare(b.item_code, undefined, { numeric: true }));
      setProducts(sortedData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
    setMessage('');
    setError('');
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setMessage('');
    setError('');
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('정말로 이 품목을 삭제하시겠습니까?')) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/products/${productId}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setMessage('품목이 성공적으로 삭제되었습니다.');
        fetchProducts(); // 목록 새로고침
      } catch (err) {
        setError(`품목 삭제 실패: ${err.message}`);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSaveProduct = async (productData) => {
    try {
      const token = localStorage.getItem('accessToken');
      let response;
      if (productData.id) { // 수정
        response = await fetch(`/api/products/${productData.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        });
      } else { // 추가
        response = await fetch('/api/products/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      setMessage('품목이 성공적으로 저장되었습니다.');
      handleCloseModal();
      fetchProducts(); // 목록 새로고침

    } catch (err) {
      setError(`품목 저장 실패: ${err.message}`);
    }
  };

  return (
    <div className="product-management">
      <div className="page-header">
        <h2>품목 관리</h2>
        <button onClick={handleAddProduct} className="add-btn">+ 새 품목 추가</button>
      </div>
      {message && <p className="form-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <table className="product-table">
        <thead>
          <tr>
            <th>품목코드</th>
            <th>품목명</th>
            <th>단위</th>
            <th>현재고</th>
            <th>판매가</th>
            <th>원가</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="7">등록된 품목이 없습니다.</td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id}>
                <td>{product.item_code}</td>
                <td>{product.name}</td>
                <td>{product.unit}</td>
                <td>{product.current_stock}</td>
                <td>{product.selling_price}</td>
                <td>{product.cost_price}</td>
                <td>
                  <button onClick={() => handleEditProduct(product)} className="edit-btn">수정</button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn">삭제</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {isModalOpen && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};

export default ProductManagement;