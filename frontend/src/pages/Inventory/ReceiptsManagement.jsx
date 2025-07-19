import React, { useState, useEffect } from 'react';
import './ReceiptsManagement.css'; // CSS 파일 임포트

const ReceiptsManagement = () => {
  const [receipts, setReceipts] = useState([]);
  // TODO: Add state for form inputs

  // TODO: API 연동하여 입고 내역 데이터 가져오기 (useEffect 사용)
  useEffect(() => {
    // 임시 데이터
    const mockReceipts = [
      { id: 1, date: '2025-07-18', item_code: 'P001', quantity: 100, source: 'ABC 유통사' },
      { id: 2, date: '2025-07-17', item_code: 'P002', quantity: 50, source: 'XYZ 마트' },
    ];
    setReceipts(mockReceipts);
  }, []);

  const handleAddReceipt = (e) => {
    e.preventDefault();
    // TODO: API 연동하여 입고 기록 추가
    console.log('Add receipt:', e.target.elements);
  };

  return (
    <div className="receipts-management">
      <h2>입고 기록</h2>
      <form onSubmit={handleAddReceipt} className="receipt-form">
        {/* TODO: Add form fields for date, item, quantity, source */}
        <input type="date" name="date" required />
        <input type="text" name="item_code" placeholder="품목코드" required />
        <input type="number" name="quantity" placeholder="수량" required />
        <input type="text" name="source" placeholder="입고처" />
        <button type="submit">기록 추가</button>
      </form>

      <h2>입고 내역</h2>
      <table className="receipts-table">
        <thead>
          <tr>
            <th>날짜</th>
            <th>품목코드</th>
            <th>수량</th>
            <th>입고처</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((receipt) => (
            <tr key={receipt.id}>
              <td>{receipt.date}</td>
              <td>{receipt.item_code}</td>
              <td>{receipt.quantity}</td>
              <td>{receipt.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReceiptsManagement;
