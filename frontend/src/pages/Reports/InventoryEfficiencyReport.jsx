import React, { useState, useEffect } from 'react';
import './InventoryEfficiencyReport.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios'; // Added axios import

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InventoryEfficiencyReport = () => {
  const [inventoryTurnoverData, setInventoryTurnoverData] = useState({});
  const [wasteAnalysisData, setWasteAnalysisData] = useState({});
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch Inventory Turnover Data
        const turnoverResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/inventory-turnover/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        const turnoverLabels = turnoverResponse.data.map(item => item.item_name);
        const turnoverRates = turnoverResponse.data.map(item => item.turnover_rate);

        setInventoryTurnoverData({
          labels: turnoverLabels,
          datasets: [
            {
              label: '재고 회전율',
              data: turnoverRates,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
          ],
        });

        // Fetch Cost Savings Data (Waste Analysis)
        const costSavingsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/cost-savings/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        // The backend currently returns total_waste_cost, not per item. Adjusting frontend to display total.
        setWasteAnalysisData({
          labels: ['총 폐기 비용'], // Label for total waste cost
          datasets: [
            {
              label: '폐기 비용 (원)',
              data: [costSavingsResponse.data.total_waste_cost],
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
          ],
        });

      } catch (err) {
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error('Error fetching inventory efficiency report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return <div className="inventory-efficiency-report-container">로딩 중...</div>;
  }

  if (error) {
    return <div className="inventory-efficiency-report-container" style={{ color: 'red' }}>오류: {error}</div>;
  }

  return (
    <div className="inventory-efficiency-report-container">
      <h2>재고 효율성 분석</h2>

      <div className="chart-section">
        <h3>품목별 재고 회전율</h3>
        {inventoryTurnoverData.labels && <Bar data={inventoryTurnoverData} />}
      </div>

      <div className="chart-section">
        <h3>총 폐기 비용</h3>
        {wasteAnalysisData.labels && <Bar data={wasteAnalysisData} />}
        <p>{wasteAnalysisData.datasets && wasteAnalysisData.datasets[0] && wasteAnalysisData.datasets[0].data ? `총 폐기 비용: ${wasteAnalysisData.datasets[0].data[0].toLocaleString()}원` : ''}</p>
      </div>
    </div>
  );
};

export default InventoryEfficiencyReport;