import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import './SalesTrendReport.css';

// Chart.js는 이미 Dashboard 컴포넌트에서 전역으로 등록되었으므로 여기서는 생략 가능합니다.

const SalesTrendReport = () => {
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [aggUnit, setAggUnit] = useState('day');
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTrendData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reports/sales-trend/?start_date=${startDate}&end_date=${endDate}&aggregation_unit=${aggUnit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const labels = data.map(item => item.date);
            const salesQuantityData = data.map(item => item.total_sales_quantity);
            const revenueData = data.map(item => item.total_revenue);

            setChartData({
                labels,
                datasets: [
                    {
                        label: '총 판매량',
                        data: salesQuantityData,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        yAxisID: 'y',
                    },
                    {
                        label: '총 매출액',
                        data: revenueData,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        yAxisID: 'y1',
                    },
                ],
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 기본 데이터 로드
    useEffect(() => {
        fetchTrendData();
    }, []);

    const handleSearch = () => {
        fetchTrendData();
    };

    const options = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
                display: true,
                text: `판매 트렌드 (${startDate} ~ ${endDate})`,
            },
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: '판매량 (개)'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: '매출액 (원)'
                },
                grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            },
        },
    };

    return (
        <div className="sales-trend-report">
            <h2>판매 트렌드 분석</h2>
            <div className="filters">
                <label>기간:</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <span>~</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                <label>단위:</label>
                <select value={aggUnit} onChange={e => setAggUnit(e.target.value)}>
                    <option value="day">일별</option>
                    <option value="week">주별</option>
                    <option value="month">월별</option>
                </select>
                <button onClick={handleSearch} disabled={loading} className="search-button">
                    {loading ? '조회 중...' : '조회'}
                </button>
            </div>
            <div className="chart-container">
                {error && <p className="error-message">데이터 로드 실패: {error}</p>}
                {chartData ? (
                    <Line options={options} data={chartData} />
                ) : (
                    !loading && <p>표시할 데이터가 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default SalesTrendReport;
