// components/RecentSalesTrendChart.jsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import './RecentSalesTrendChart.css'; // 별도 CSS 파일 (나중에 생성)

// Chart.js에 필요한 컴포넌트 등록
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function RecentSalesTrendChart() {
    const [salesData, setSalesData] = useState({ labels: [], datasets: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 최근 30일

                // 실제 API 엔드포인트: /api/reports/sales-trend/?period=daily&start_date=...&end_date=...
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`/api/reports/sales-trend/?period=daily&start_date=${startDate}&end_date=${endDate}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                // 차트 데이터 형식에 맞게 변환
                const labels = data.map(item => item.date); // '2025-06-01'
                const salesCounts = data.map(item => item.total_sales); // 해당 날짜의 판매량

                setSalesData({
                    labels: labels,
                    datasets: [
                        {
                            label: '일별 판매량',
                            data: salesCounts,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            tension: 0.1,
                        },
                    ],
                });
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSalesData();
    }, []);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: '최근 30일 판매량 추이',
            },
        },
    };

    if (loading) return <div className="recent-sales-trend-chart">판매량 추이 로딩 중...</div>;
    if (error) return <div className="recent-sales-trend-chart error">판매량 데이터 로드 실패: {error.message}</div>;

    return (
        <div className="recent-sales-trend-chart">
            <h2>판매량 추이</h2>
            <div className="chart-container">
                <Line options={options} data={salesData} />
            </div>
        </div>
    );
}

export default RecentSalesTrendChart;