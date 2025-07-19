import React, { useState, useEffect } from 'react';
import ProductModal from './components/ProductModal';
import './ProductManagement.css'; // CSS 파일 임포트

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // TODO: API 연동하여 품목 목록 가져오기 (useEffect 사용)
  useEffect(() => {
    // 임시 데이터
    const mockProducts = [
      { id: 1, item_code: 'P001', name: '바나나우유', unit: '개', current_stock: 50, min_stock: 10, safety_stock: 5, selling_price: 1500, cost_price: 800 },
      { id: 2, item_code: 'P002', name: '초코파이', unit: '상자', current_stock: 30, min_stock: 5, safety_stock: 3, selling_price: 4800, cost_price: 3000 },
    ];
    setProducts(mockProducts);
  }, []);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId) => {
    // TODO: API 연동하여 품목 삭제
    console.log('Delete product:', productId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveProduct = (productData) => {
    // TODO: API 연동하여 품목 추가/수정
    console.log('Save product:', productData);
    setIsModalOpen(false);
  };

  return (
    <div className="product-management">
      <div className="page-header">
        <h2>품목 관리</h2>
        <button onClick={handleAddProduct} className="add-btn">+ 새 품목 추가</button>
      </div>
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
          {products.map((product) => (
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
          ))}
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
