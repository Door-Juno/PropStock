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
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrendData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                // 최근 7일 데이터 요청
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - 7);
                
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reports/sales-trend/?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                // Chart.js가 요구하는 형식으로 데이터 가공
                const labels = data.map(item => item.date);
                const salesData = data.map(item => item.total_sales_quantity);

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: '일일 판매량',
                            data: salesData,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        },
                    ],
                });

            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendData();
    }, []);

    if (loading) return <div>차트 로딩 중...</div>;
    if (error) return <div>차트 로드 실패: {error.message}</div>;
    if (!chartData) return <div>표시할 데이터가 없습니다.</div>;

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: '최근 7일 판매량 추이',
            },
        },
    };

    return <Line options={options} data={chartData} />;
}

export default RecentSalesTrendChart;
