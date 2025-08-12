import React, { useState, useEffect } from 'react';
import './CostSavingsReport.css';

const CostSavingsReport = () => {
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCostData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/reports/cost-savings/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCostData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCostData();
  }, []);

  if (loading) return <div className="cost-savings-report">데이터 로딩 중...</div>;
  if (error) return <div className="cost-savings-report error">데이터 로드 실패: {error}</div>;
  if (!costData) return <div className="cost-savings-report">표시할 데이터가 없습니다.</div>;

  return (
    <div className="cost-savings-report">
      <h2>비용 절감 효과 보고서</h2>
      <div className="summary-card">
        <h3>총 폐기 비용 (손실액)</h3>
        <p className="amount">{costData.total_waste_cost ? `${costData.total_waste_cost.toLocaleString()}원` : '0원'}</p>
        <p className="message">{costData.message}</p>
      </div>
    </div>
  );
};

export default CostSavingsReport;
