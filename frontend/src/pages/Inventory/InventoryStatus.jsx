import React, { useState, useEffect } from 'react';
import './InventoryStatus.css'; // CSS 파일 임포트

const InventoryStatus = () => {
  const [inventory, setInventory] = useState([]);

  // TODO: API 연동하여 재고 현황 데이터 가져오기 (useEffect 사용)
  useEffect(() => {
    // 임시 데이터
    const mockInventory = [
      { id: 1, item_code: 'P001', name: '바나나우유', current_stock: 30, min_stock: 10, safety_stock: 5, status: '부족' },
      { id: 2, item_code: 'P002', name: '초코파이', current_stock: 30, min_stock: 5, safety_stock: 3, status: '정상' },
      { id: 3, item_code: 'P003', name: '콜라', current_stock: 100, min_stock: 20, safety_stock: 10, status: '과잉' },
    ];
    setInventory(mockInventory);
  }, []);

  const getStatusClassName = (status) => {
    switch (status) {
      case '부족':
        return 'status-low';
      case '과잉':
        return 'status-high';
      default:
        return 'status-normal';
    }
  };

  return (
    <div className="inventory-status">
      <h2>재고 현황</h2>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>품목코드</th>
            <th>품목명</th>
            <th>현재고</th>
            <th>최소재고</th>
            <th>안전재고</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id} className={getStatusClassName(item.status)}>
              <td>{item.item_code}</td>
              <td>{item.name}</td>
              <td>{item.current_stock}</td>
              <td>{item.min_stock}</td>
              <td>{item.safety_stock}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryStatus;
