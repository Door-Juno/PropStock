// Dashboard.jsx
import React from 'react';
import KeyMetricsCards from './components/KeyMetricsCards';
import CriticalStockAlertList from './components/CriticalStockAlertList';
import RecentSalesTrendChart from './components/RecentSalesTrendChart';
import DailyOrderRecommendationSummary from './components/DailyOrderRecommendationSummary';
import './Dashboard.css'; 

function Dashboard() {
    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>매장 운영 대시보드</h1>
                <p>현재 매장 운영의 핵심 요약 정보를 한눈에 확인하세요.</p>
            </header>

            <main className="dashboard-main-content">
                <section className="dashboard-section key-metrics-section">
                    <KeyMetricsCards />
                </section>

                <div className="dashboard-alerts-recommendations-grid">
                    <section className="dashboard-section alert-list-section">
                        <CriticalStockAlertList />
                    </section>
                    <section className="dashboard-section recommendation-summary-section">
                        <DailyOrderRecommendationSummary />
                    </section>
                </div>

                <section className="dashboard-section sales-chart-section">
                    <RecentSalesTrendChart />
                </section>

            </main>
        </div>
    );
}

export default Dashboard;