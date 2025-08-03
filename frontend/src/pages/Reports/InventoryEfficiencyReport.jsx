import React, { useState, useEffect } from 'react';
import './InventoryEfficiencyReport.css';

const InventoryEfficiencyReport = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/reports/inventory-turnover/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // 품목 코드(item_code)를 기준으로 자연어 정렬 (숫자 순서대로)
        const sortedData = data.sort((a, b) => a.item_code.localeCompare(b.item_code, undefined, { numeric: true }));
        setInventoryData(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  if (loading) return <div className="inventory-efficiency-report">데이터 로딩 중...</div>;
  if (error) return <div className="inventory-efficiency-report error">데이터 로드 실패: {error}</div>;

  return (
    <div className="inventory-efficiency-report">
      <h2>재고 효율성 분석</h2>
      <h3>품목별 재고 회전율</h3>
      {inventoryData.length === 0 ? (
        <p>표시할 재고 회전율 데이터가 없습니다.</p>
      ) : (
        <table className="report-table">
          <thead>
            <tr>
              <th>품목코드</th>
              <th>품목명</th>
              <th>재고 회전율</th>
              <th>평균 재고 보유일</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((item) => (
              <tr key={item.item_code}>
                <td>{item.item_code}</td>
                <td>{item.item_name}</td>
                <td>{item.turnover_rate}</td>
                <td>{item.average_days_in_stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InventoryEfficiencyReport;
