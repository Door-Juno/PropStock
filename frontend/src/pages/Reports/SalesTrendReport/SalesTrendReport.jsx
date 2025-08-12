
import React, { useState, useEffect } from 'react';
import './SalesTrendReport.css';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesTrendReport = () => {
  const [salesTrendData, setSalesTrendData] = useState({});
  const [salesByDayData, setSalesByDayData] = useState({});
  const [filters, setFilters] = useState({
    aggregationUnit: 'day', // day, week, month
    startDate: '2025-07-01',
    endDate: '2025-07-31',
  });

  // Mock data - API 연동 후 삭제
  const mockSalesTrend = {
    labels: ['7/1', '7/2', '7/3', '7/4', '7/5', '7/6', '7/7'],
    datasets: [
      {
        label: '총 판매량',
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: '총 매출액 (만원)',
        data: [28, 48, 40, 19, 86, 27, 90],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const mockSalesByDay = {
    labels: ['월', '화', '수', '목', '금', '토', '일'],
    datasets: [
      {
        label: '요일별 평균 판매량',
        data: [120, 150, 180, 90, 200, 250, 210],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  useEffect(() => {
    // TODO: API call to fetch data based on filters
    // For now, we use mock data
    setSalesTrendData(mockSalesTrend);
    setSalesByDayData(mockSalesByDay);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className="sales-trend-report-container">
      <h2>판매 트렌드 분석</h2>
      <div className="filters-container">
        <div className="filter-item">
          <label>기간 단위:</label>
          <select name="aggregationUnit" value={filters.aggregationUnit} onChange={handleFilterChange}>
            <option value="day">일별</option>
            <option value="week">주별</option>
            <option value="month">월별</option>
          </select>
        </div>
        <div className="filter-item">
          <label>시작일:</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
        </div>
        <div className="filter-item">
          <label>종료일:</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
        </div>
      </div>

      <div className="chart-section">
        <h3>기간별 매출 및 판매량 추이</h3>
        {salesTrendData.labels && <Line data={salesTrendData} />}
      </div>

      <div className="chart-section">
        <h3>요일별 판매량 분석</h3>
        {salesByDayData.labels && <Bar data={salesByDayData} />}
      </div>
    </div>
  );
};

export default SalesTrendReport;
