import React, { useState, useEffect } from 'react';
import './CostSavingsReport.css'; // CSS 파일 임포트

const CostSavingsReport = () => {
  // TODO: API 연동하여 비용 절감 데이터 가져오기 (useEffect 사용)

  return (
    <div className="cost-savings-report">
      <h2>비용 절감 효과 보고서</h2>
      <div className="report-grid">
        <div className="report-item summary-card">
          <h3>총 예상 절감액</h3>
          <p className="amount">₩ 1,234,567</p>
        </div>
        <div className="report-item chart-container">
          <h3>폐기 비용 감소 추이</h3>
          {/* 여기에 차트 라이브러리를 사용한 그래프가 렌더링됩니다. */}
          <p>폐기 비용 감소 그래프</p>
        </div>
        <div className="report-item chart-container">
          <h3>품절 기회비용 감소 추이</h3>
          {/* 여기에 차트 라이브러리를 사용한 그래프가 렌더링됩니다. */}
          <p>품절 기회비용 감소 그래프</p>
        </div>
      </div>
    </div>
  );
};

export default CostSavingsReport;
