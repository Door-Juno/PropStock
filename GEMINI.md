# 증요
모든 코드를 제안만 해줘 수정은 직접 하도록 할게 !

## 소상공인 AI 재고/수요 예측 솔루션: 기능 명세 예시

소상공인을 위한 AI 기반 재고 관리 및 수요 예측 솔루션의 핵심 기능을 중심으로 기능 명세 예시를 작성해 보았습니다. 실제 개발 시에는 각 기능별로 더 세부적인 명세(화면 설계, 데이터 흐름, 예외 처리 등)가 필요합니다.

---

### 1. 사용자 관리

- **FEA-UM-001: 회원가입**
    - **설명:** 이메일 주소 및 비밀번호를 사용하여 계정을 생성한다.
    - **입력:** 이메일, 비밀번호, 비밀번호 확인
    - **출력:** 성공 시 로그인 페이지로 이동, 실패 시 오류 메시지 표시
    - **예외:** 중복 이메일, 유효하지 않은 이메일 형식, 비밀번호 조건 불충족
- **FEA-UM-002: 로그인**
    - **설명:** 등록된 계정으로 로그인한다.
    - **입력:** 이메일, 비밀번호
    - **출력:** 성공 시 대시보드 페이지로 이동, 실패 시 오류 메시지 표시
    - **예외:** 유효하지 않은 자격 증명 (이메일/비밀번호 불일치)
- **FEA-UM-003: 비밀번호 재설정**
    - **설명:** 등록된 이메일 주소를 통해 비밀번호를 재설정한다.
    - **입력:** 이메일 주소
    - **출력:** 비밀번호 재설정 링크가 포함된 이메일 발송, 성공 메시지 표시
    - **예외:** 등록되지 않은 이메일 주소
- **FEA-UM-004: 매장 정보 설정**
    - **설명:** 매장 이름, 업종, 주소, 영업시간 등 기본 정보를 등록하고 수정한다.
    - **입력:** 매장 이름, 업종(드롭다운 선택), 주소, 영업 시작/종료 시간
    - **출력:** 저장된 매장 정보

---

### 2. 판매 데이터 관리

- **FEA-SD-001: 판매 데이터 수동 입력**
    - **설명:** 사용자가 날짜별, 품목별 판매 수량 및 매출액을 직접 입력한다.
    - **입력:** 날짜, 품목명, 판매 수량, 매출액
    - **출력:** 입력된 판매 데이터 저장 및 목록 업데이트
    - **예외:** 필수 항목 누락, 유효하지 않은 숫자 입력
    

- **FEA-SD-003: 판매 내역 조회 및 수정/삭제**
    - **설명:** 입력된 판매 데이터를 날짜, 품목별로 조회하고, 필요에 따라 수정하거나 삭제한다.
    - **입력:** 조회 필터(날짜 범위, 품목), 수정/삭제 대상 데이터 선택
    - **출력:** 필터링된 판매 데이터 목록

---

### 3. 재고 관리

- **FEA-IM-001: 품목 등록/수정/삭제**
    - **설명:** 판매할 품목의 이름, 단위, 초기 재고 수량, 유통기한 유무 등을 등록하고 관리한다.
    - **입력:** 품목명, 단위(개, kg 등), 현재 재고 수량, 유통기한 여부, 최소/안전 재고 수량
    - **출력:** 등록/수정/삭제된 품목 정보
- **FEA-IM-002: 재고 입/출고 기록**
    - **설명:** 품목별 입고(발주) 및 출고(판매 외 손실 등) 내역을 기록하여 실시간 재고를 업데이트한다.
    - **입력:** 품목명, 입/출고 구분, 수량, 날짜, 비고
    - **출력:** 업데이트된 재고 수량
- **FEA-IM-003: 재고 현황 조회**
    - **설명:** 현재 품목별 재고 수량 및 상태(정상, 부족, 과잉)를 조회한다.
    - **입력:** 없음 (전체 또는 필터링)
    - **출력:** 품목별 현재 재고 수량, 최소 재고 대비 상태
- **FEA-IM-004: 재고 부족 알림**
    - **설명:** 특정 품목의 재고가 설정된 최소 재고 수량 미만으로 떨어지면 사용자에게 알림을 제공한다.
    - **입력:** 없음 (시스템 자동 감지)
    - **출력:** 앱 내 알림, (선택적으로) 푸시 알림 또는 이메일 알림

---

### 4. 수요 예측 및 발주 추천

- **FEA-DP-001: AI 기반 수요 예측**
    - **설명:** 과거 판매 데이터, 요일, 날씨, 공휴일, 지역 행사 등을 기반으로 미래 (예: 내일, 다음 주) 품목별 예상 판매량을 AI가 예측한다.
    - **입력:** 학습된 판매 데이터, 외부 변수 데이터 (내부 처리)
    - **출력:** 품목별 예상 판매량 (숫자 및 신뢰도 표시)
    - **비고:** 백엔드에서 머신러닝 모델을 활용하여 처리
- **FEA-DP-002: 최적 발주량 추천**
    - **설명:** 예측된 수요량과 현재 재고량, 최소/안전 재고 기준을 고려하여 각 품목의 최적 발주량을 추천한다.
    - **입력:** 예측된 수요량, 현재 재고량, 품목별 최소/안전 재고 설정
    - **출력:** 품목별 추천 발주량
- **FEA-DP-003: 예측 결과 시각화**
    - **설명:** 과거 실제 판매량과 AI 예측량을 비교한 그래프를 제공하여 예측 정확도를 시각적으로 보여준다.
    - **입력:** 실제 판매 데이터, 예측 데이터
    - **출력:** 비교 그래프 (꺾은선, 막대 등)

---

### 5. 통계 및 리포트

- **FEA-RP-001: 판매 트렌드 분석**
    - **설명:** 일별, 주간별, 월별 매출액 및 품목별 판매량 추이를 그래프로 제공한다.
    - **입력:** 날짜 범위 선택
    - **출력:** 시계열 판매량/매출액 그래프
- **FEA-RP-002: 재고 회전율 분석**
    - **설명:** 품목별 재고 회전율을 계산하여 재고의 효율성을 분석하고 비효율적인 품목을 식별한다.
    - **입력:** 날짜 범위 선택
    - **출력:** 품목별 재고 회전율 (수치 및 순위)
- **FEA-RP-003: 비용 절감 효과 보고서**
    - **설명:** 솔루션 도입 전후의 폐기율 변화 및 이를 통한 예상 비용 절감액을 수치와 그래프로 제시한다.
    - **입력:** 기간 선택
    - **출력:** 절감액 요약, 폐기율 변화 그래프

---

### 6. 시스템 설정 및 기타

- **FEA-SE-001: 알림 설정**
    - **설명:** 재고 부족, 유통기한 임박 알림 등의 수신 여부 및 방식을 설정한다.
    - **입력:** 알림 종류 선택, 알림 방식(앱 내, 푸시, 이메일) 선택
- **FEA-SE-002: 데이터 백업 및 복원 (향후 확장)**
    - **설명:** 중요한 판매 및 재고 데이터를 백업하고 필요시 복원한다

## 3. API 명세서 (API Specifications)

**기본 정보**

- **API Base URL:** `https://your-domain.com/api/` (예시)
- **인증:** JWT (JSON Web Token) 기반 인증. 대부분의 엔드포인트는 인증 필요.
- **데이터 형식:** JSON

---

# https:// [localhost:8000/](http://localhost:8000/)api/auth/register

### 1. 사용자 관리 (`/auth/`, `/store/`)

### 1.1. 회원가입 - 금문섭

- **POST** `/auth/register/`
    - **요청 바디:**JSON
        
        `{
            "email": "user@example.com",`
        
        `"username": "username",
            "password": "your_password",
            "password_confirm": "your_password"`
        
        `}`
        
    - **응답 (201 Created):** `{"message": "User registered successfully."}`

### 1.2. 로그인 - 금문섭

- **POST** `/auth/login/`
    - **요청 바디:**JSON
        
        `{
            "id": "user@example.com",
            "password": "your_password"
        }`
        
    - **응답 (200 OK):**JSON
        
        `{
            "access": "jwt_access_token_here",
            "refresh": "jwt_refresh_token_here"
        }`
        
- **GET** `/store/`
    - **인증:** 필요
    
    ### 1.3. 매장 정보 설정/조회 - 금문섭
    
    - **응답 (200 OK):**JSON
        
        `{
            "store_id": 1,
            "name": "우리동네 편의점",
            "industry": "편의점",
            "region": "대구광역시 수성구",
            "open_time": "08:00:00",
            "close_time": "23:00:00"
        }`
        
    - +updated_at
- **PUT/PATCH** `/store/`
    - **인증:** 필요
    - **요청 바디:** (부분 업데이트 가능)JSON
        
        `{
            "store_id": 1,
            "name": "우리동네 편의점",
            "industry": "편의점",
            "region": "대구광역시 수성구",
            "open_time": "08:00:00",
            "close_time": "23:00:00"
        }`
        
    - **응답 (200 OK):** 업데이트된 매장 정보

---

### 2. 품목 관리 (`/products/`) - 김도윤

### 2.1. 품목 목록 조회 및 등록

- **GET** `/products/`
    - **인증:** 필요
    - **쿼리 파라미터:** `search`, `category`
    - **응답 (200 OK):**JSON
        
        `[
            {
                "id": 101,
                "item_code": "P001",
                "name": "바나나우유",
                "unit": "개",
                "current_stock": 50,
                "min_stock": 10,
                "safety_stock": 5,
                "selling_price": 1500,
                "cost_price": 800,
                "lead_time": 2,
                "last_updated": "2025-06-29T10:00:00Z"
            }
        ]`
        
- **POST** `/products/`
    - **인증:** 필요
    - **요청 바디:**JSON
        
        `{
            "item_code": "P001",
            "name": "바나나우유",
            "unit": "개",
            "current_stock": 50,
            "min_stock": 10,
            "safety_stock": 5,
            "selling_price": 1500,
            "cost_price": 800,
            "avg_lead_time_days": 2
        }`
        
    - **응답 (201 Created):** 등록된 품목 정보

### 2.2. 품목 상세 조회, 수정 및 삭제

- **GET** `/products/{id}/`
- **PUT/PATCH** `/products/{id}/`
- **DELETE** `/products/{id}/`
    - **인증:** 모두 필요
    - **응답 (DELETE 시 204 No Content):**

---

### 3. 판매 데이터 관리 (`/sales/`)

### 3.1. 판매 기록 수동 입력 - 금문섭

- **POST** `/sales/records/`
    - **인증:** 필요
    - **요청 바디:**JSON
        
        `{
            "date": "2025-06-28",
            "item_code": "P001",
            "sales_quantity": 15,
            "selling_price": 1500,
            "cost_price": 800,
            "is_event_day": true
        }`
        
    - **응답 (201 Created):** 등록된 판매 기록 정보 (요일, 공휴일 자동 추가된 형태)JSON
        
        `{
            "id": 1,
            "date": "2025-06-28",
            "item_code": "P001",
            "item_name": "바나나우유",
            "sales_quantity": 15,
            "selling_price": 1500,
            "cost_price": 800,
            "is_event_day": true,
            "day_of_week": "토요일",
            "is_public_holiday": false
        }`
        

### 3.2. 판매 데이터 일괄 업로드 - 김도윤

- **POST** `/sales/bulk-upload/`
    - **인증:** 필요
    - **요청 바디:** `multipart/form-data` (파일 첨부)
        - `file`: CSV/Excel 파일
    - **응답 (200 OK):**JSON
        
        `{
            "message": "Sales data uploaded successfully.",
            "total_rows": 100,
            "processed_rows": 98,
            "failed_rows": 2,
            "errors": [
                {"row": 5, "message": "Invalid date format"},
                {"row": 12, "message": "Item code 'P999' not found"}
            ]
        }`
        

### 3.3. 판매 내역 조회, 수정 및 삭제 - 금문섭

- **GET** `/sales/records/`
    - **인증:** 필요
    - **쿼리 파라미터:** `start_date`, `end_date`, `item_code`
    - **응답 (200 OK):** (3.1의 응답 형식과 동일한 배열)
- **PUT/PATCH** `/sales/records/{id}/`
- **DELETE** `/sales/records/{id}/`
    - **인증:** 모두 필요

---

### 4. 재고 입/출고 기록 (`/inventory/`) - 김도윤

### 4.1. 재고 입/출고 기록

- **POST** `/inventory/transactions/`
    - **인증:** 필요
    - **요청 바디:**JSON
        
        `{
            "date": "2025-06-29",
            "item_code": "P001",
            "type": "in", // "in" (입고) 또는 "out" (판매 외 출고)
            "quantity": 100,
            "notes": "주문 입고 완료",
            "source_destination": "ABC 유통사"
        }`
        
    - **응답 (201 Created):** 기록된 거래 내역 및 업데이트된 재고 현황

### 4.2. 현재 재고 현황 조회

- **GET** `/inventory/status/`
    - **인증:** 필요
    - **쿼리 파라미터:** `alert_type` (e.g., `low_stock`, `expired_soon`)
    - **응답 (200 OK):**JSON
        
        `[
            {
                "item_code": "P001",
                "item_name": "바나나우유",
                "current_stock": 30,
                "min_stock": 10,
                "safety_stock": 5,
                "status": "부족", // "정상", "부족", "과잉"
                "expiration_date": "2025-07-05",
                "days_until_expiration": 6
            }
        ]`
        

---

### 5. 수요 예측 및 발주 추천 (`/predictions/`) - 문준호

### 5.1. AI 기반 판매량 예측 결과 조회

### 5.2. 최적 발주량 추천

- **GET** `/predictions/orders/recommendations/`
    - **인증:** 필요
    - **쿼리 파라미터:** `item_code`
    - **응답 (200 OK):**JSON
        
        `[
            {
                "item_code": "P001",
                "item_name": "바나나우유",
                "current_stock": 30,
                "predicted_sales_next_7days": 150,
                "stock_out_estimate_date": "2025-07-05",
                "recommended_order_quantity": 120,
                "order_by_date": "2025-07-03",
                "reason": "재고 소진 임박 및 예측 수요 증가"
            }
        ]`
        

---

### 6. 통계 및 리포트 (`/reports/`) - 문준호

### 6.1. 판매 트렌드 분석

- **GET** `/reports/sales-trend/`
    - **인증:** 필요
    - **쿼리 파라미터:** `start_date`, `end_date`, `aggregation_unit` (`day`, `week`, `month`), `item_code`
    - **응답 (200 OK):**JSON
        
        `[
            {
                "date": "2025-06-20",
                "total_sales_quantity": 150,
                "total_revenue": 200000
            },
            // ... (집계 단위에 따라)
        ]`
        

### 6.2. 재고 회전율 분석

- **GET** `/reports/inventory-turnover/`
    - **인증:** 필요
    - **쿼리 파라미터:** `period` (예: `quarterly`, `yearly`)
    - **응답 (200 OK):**JSON
        
        `[
            {
                "item_code": "P001",
                "item_name": "바나나우유",
                "turnover_rate": 8.5,
                "average_days_in_stock": 42
            }
        ]`
        

---

### 7. 시스템 설정 (`/settings/`) - 금문섭

→ 할수도 있고 안할수도 ..

### 7.1. 알림 설정

- **PUT/PATCH** `/settings/notifications/`
    - **인증:** 필요
    - **요청 바디:**JSON
        
        
    - **응답 (200 OK):** 업데이트된 알림 설정

### 1. 홈 대시보드

- **메뉴명:** `홈` 또는 `대시보드` (사용자가 시스템에 로그인했을 때 가장 먼저 보게 될 페이지)
- **주요 내용:**
    - **매장 정보 요약:** 간략한 매장명, 업종 등
    - **핵심 통계 요약:** 월/주간 총 수입, 가장 많이 팔린 품목, 평균 판매량 등 핵심 지표들을 시각적인 카드 형태로 표시
    - **재고 소진/유통기한 임박 품목 요약:** **즉각적인 조치가 필요한 품목**들을 리스트나 강조된 형태로 보여줍니다. (예: "바나나우유 2일 후 소진 예상", "딸기 잼 유통기한 3일 남음")
    - **최근 활동 피드:** 최근 판매 기록, 입고/출고 내역 등 사용자의 활동을 타임라인 형태로 표시하여 현재 상황을 빠르게 파악할 수 있도록 돕습니다.

### 2. 데이터 관리

- **메뉴명:** `데이터 관리` (이전에 논의했던 판매 데이터 등록과 과거 데이터 업로드를 통합)
- **주요 내용:**
    - **판매 데이터 입력:** 일일 판매량 및 매출액을 수동으로 기록하는 UI. 품목 선택은 마스터 데이터 연동 (자동 완성)
    - **판매 데이터 일괄 업로드:** 과거 판매 데이터를 CSV/Excel 파일로 업로드하는 기능과 템플릿 다운로드 제공
    - **판매 내역 조회/수정/삭제:** 입력된 판매 데이터를 기간/품목별로 조회하고 수정, 삭제할 수 있는 테이블

### 3. 재고 관리

- **메뉴명:** `재고 관리`
- **주요 내용:**
    - **품목 등록/수정/삭제:** 가게에서 판매하는 모든 품목의 마스터 데이터(품목코드, 품목명, 단가, 최소/안전 재고, 리드 타임, 유통기한 여부 등)를 관리하는 페이지
    - **재고 입/출고 기록:** 판매 외적인 재고 변동(입고, 폐기, 손실, 증정 등)을 기록하여 현재고를 최신화하는 기능
    - **현 재고 조회:** 모든 품목의 **현재 재고 수량, 재고 상태(정상/부족/과잉)**를 한눈에 볼 수 있는 테이블. **재고 소진 임박 품목은 테이블 내에서 배경색 변경이나 아이콘 등으로 시각적으로 강조**하여 사용자가 쉽게 인지하도록 합니다.
    - **유통기한 임박 품목 목록:** 유통기한이 설정된 품목 중 임박한 상품들을 따로 모아 보여주는 섹션 (재고 조회 페이지 내 서브 섹션 또는 별도 탭)

### 4. 발주 & 예측

- **메뉴명:** `발주 & 예측` (AI의 핵심 기능을 통합)
- **주요 내용:**
    - **AI 기반 수요 예측 결과:** AI가 예측한 품목별 미래 예상 판매량을 그래프와 수치로 보여줍니다. (실제 판매량과의 비교 그래프 포함)
    - **최적 발주량 추천:** 예측된 수요와 현재 재고, 리드 타임을 고려하여 **AI가 추천하는 발주 품목, 추천 수량, 권장 발주 시점**을 목록 형태로 제시합니다.
    - **재고 소진 예상일:** 각 품목별로 현재 재고와 예측 판매량을 기반으로 **재고가 소진될 것으로 예상되는 날짜**를 보여줍니다.

### 5. 리포트 & 분석

- **메뉴명:** `리포트 & 분석` (데이터 기반 의사결정을 돕는 심층 분석 자료 제공)
- **주요 내용:**
    - **판매 트렌드 분석:** 일별, 주간별, 월별 매출 및 판매량 추이 그래프, 요일별/시간대별 판매량 분포 등을 시각적으로 제공
    - **재고 효율성 분석:** 품목별 재고 회전율, 장기 재고 품목, 폐기율 등을 분석하여 재고 관리의 비효율적인 부분을 파악하도록 돕습니다.
    - **비용 절감 효과 보고서:** 솔루션 도입 전후의 폐기율 변화 및 이를 통한 예상 비용 절감액을 수치와 그래프로 명확하게 제시하여 솔루션의 가치를 증명합니다.

### 6. 설정

- **메뉴명:** `설정`
- **주요 내용:**
    - **계정 관리:** 비밀번호 재설정, 이메일 변경 등 사용자 계정 관련 설정
    - **매장 정보 설정:** `매장 정보 설정 (FEA-UM-004)`에서 입력한 매장 이름, 업종, 지역, 영업시간 등의 정보를 수정하는 기능
    - **알림 설정:** 재고 부족, 유통기한 임박, 발주 추천 등 **각 알림의 수신 여부, 알림 방식(앱 내/푸시/이메일)**을 사용자가 직접 설정
    - **로그아웃:** 시스템에서 로그아웃

### 1. 홈 대시보드 페이지 (`/dashboard`)

- **목적:** 사용자가 로그인 시 가장 먼저 접하며, 매장 운영의 핵심 요약 정보를 한눈에 파악할 수 있는 랜딩 페이지.
- **주요 컴포넌트:**
    - **핵심 지표 카드 (`KeyMetricsCards`):** 월/주간 총 수입, 판매량, 재고 가치 등 주요 통계를 요약하여 표시.
        - **데이터 소스:** `/api/reports/summary/` (Django API)
    - **재고 소진 임박/유통기한 임박 품목 목록 (`CriticalStockAlertList`):** AI 예측 또는 설정된 기준에 따라 재고 소진이 임박했거나 유통기한이 가까운 품목을 우선순위로 나열.
        - **데이터 소스:** `/api/inventory/status/?alert_type=low_stock,expired_soon` (Django API)
    - **최근 판매량 추이 그래프 (`RecentSalesTrendChart`):** 최근 7일 또는 30일간의 판매량 추이를 꺾은선 그래프로 시각화.
        - **데이터 소스:** `/api/reports/sales-trend/?period=daily&start_date=...&end_date=...` (Django API)
    - **오늘의 발주 추천 요약 (`DailyOrderRecommendationSummary`):** AI가 오늘 발주를 추천하는 품목 및 수량을 간략하게 요약 표시.
        - **데이터 소스:** `/api/predictions/orders/recommendations/?date=today` (Django API)
- **사용자 인터랙션:** 각 요약 정보 클릭 시 해당 상세 페이지로 이동.

---

### 2. 데이터 관리 페이지 (`/data-management`)

- **목적:** 판매 데이터를 입력, 업로드, 조회, 수정하는 모든 기능을 통합 관리.
- **탭 또는 서브 메뉴:**
    - **2.1. 일일 판매 기록 (`/data-management/daily-sales`)**
        - **주요 컴포넌트:**
            - **판매 데이터 수동 입력 폼 (`DailySalesInputForm`):** 날짜 선택기, 품목코드/품목명 자동 완성 기능, 판매량/판매가/원가/행사 여부 입력 필드.
                - **데이터 전송:** `POST /api/sales/records/` (Django API)
            - **오늘/최근 판매 내역 요약 테이블 (`RecentDailySalesTable`):** 입력된 판매 데이터 즉시 확인.
    - **2.2. 과거 판매 데이터 업로드 (`/data-management/upload`)**
        - **주요 컴포넌트:**
            - **파일 업로드 영역 (`SalesFileUpload`):** CSV/Excel 파일 선택 및 드래그앤드롭 기능. **템플릿 다운로드 버튼** 제공.
                - **데이터 전송:** `POST /api/sales/bulk-upload/` (Django API)
            - **업로드 결과/오류 메시지 표시 영역:** 업로드 성공률, 실패한 행 및 오류 내용 표시.
    - **2.3. 판매 내역 조회 (`/data-management/history`)**
        - **주요 컴포넌트:**
            - **판매 데이터 검색/필터링 컴포넌트 (`SalesSearchFilter`):** 날짜 범위, 품목 검색 필드.
            - **판매 내역 테이블 (`SalesHistoryTable`):** 검색된 판매 데이터를 목록으로 표시하고, 각 항목의 **수정/삭제 버튼** 제공.
                - **데이터 조회:** `GET /api/sales/records/` (Django API)
                - **데이터 수정/삭제:** `PUT/PATCH/DELETE /api/sales/records/{id}/` (Django API)

---

### 3. 재고 관리 페이지 (`/inventory`)

- **목적:** 품목 마스터 데이터를 관리하고, 실시간 재고 현황을 파악하며, 입/출고 내역을 기록.
- **탭 또는 서브 메뉴:**
    - **3.1. 품목 관리 (`/inventory/products`)**
        - **주요 컴포넌트:**
            - **품목 목록 테이블 (`ProductMasterTable`):** 모든 등록 품목을 보여주고, **인라인 편집 또는 팝업 모달을 통해 수정/삭제** 가능. `새 품목 추가` 버튼.
                - **데이터 소스:** `GET /api/products/` (Django API)
                - **데이터 관리:** `POST/PUT/DELETE /api/products/` 또는 `{id}/` (Django API)
    - **3.2. 재고 현황 (`/inventory/status`)**
        - **주요 컴포넌트:**
            - **실시간 재고 테이블 (`CurrentStockTable`):** 품목별 **현재 재고 수량, 최소 재고 대비 상태(`정상`, `부족`, `과잉`)**를 명확히 표시. **재고 부족 또는 유통기한 임박 품목은 다른 색상(예: 빨간색, 노란색)으로 강조**하여 시각적 알림 제공.
                - **데이터 소스:** `GET /api/inventory/status/` (Django API)
            - **재고 조정/폐기 기록 폼 (`StockAdjustmentForm`):** 판매 외적인 재고 변동(예: 폐기, 손실, 재고조정)을 기록하여 현재고를 정확히 반영.
                - **데이터 전송:** `POST /api/inventory/transactions/` (Django API, type: "out")
    - **3.3. 입고 관리 (`/inventory/receipts`)**
        - **주요 컴포넌트:**
            - **입고 기록 폼 (`ReceivingForm`):** 발주한 품목의 실제 입고 수량 및 날짜를 기록.
                - **데이터 전송:** `POST /api/inventory/transactions/` (Django API, type: "in")
            - **입고 내역 조회 테이블 (`ReceiptHistoryTable`):** 과거 입고 기록 조회.

---

### 4. 발주 & 예측 페이지 (`/order-prediction`)

- **목적:** AI 기반의 수요 예측 결과를 확인하고, 최적 발주량을 추천받는 핵심 페이지.
- **탭 또는 서브 메뉴:**
    - **4.1. 수요 예측 결과 (`/order-prediction/sales-forecast`)**
        - **주요 컴포넌트:**
            - **예측 판매량 그래프 (`PredictedSalesChart`):** 품목별 과거 실제 판매량과 AI가 예측한 미래 판매량을 비교하는 꺾은선/막대 그래프. 예측 정확도 수치 표시.
                - **데이터 소스:** `GET /api/predictions/sales/results/` (Django API)
            
            - **예측 상세 테이블 (`PredictionDetailTable`):** 품목별 예측 수치, 예측 신뢰도 등 상세 정보 나열.
    - **4.2. 발주 추천 (`/order-prediction/recommendation`)**
        - **주요 컴포넌트:**
            - **발주 추천 목록 테이블 (`OrderRecommendationTable`):** AI가 현재 재고와 예측 수요를 기반으로 **발주를 추천하는 품목, 추천 수량, 권장 발주 시점, 예상 재고 소진일**을 명확히 표시.
                - **데이터 소스:** `GET /api/predictions/orders/recommendations/` (Django API)
            - **발주 완료 처리 버튼:** 추천된 발주에 대해 사용자가 실제로 발주를 했을 경우, 이를 시스템에 기록하여 재고 입고 관리에 연동.
                - **데이터 전송:** `POST /api/inventory/transactions/` (Django API, type: "out" for order, then "in" for receiving)

---

### 5. 리포트 & 분석 페이지 (`/reports`)

- **목적:** 다양한 데이터를 시각적으로 분석하여 매장 운영에 대한 심층적인 인사이트 제공.
- **탭 또는 서브 메뉴:**
    - **5.1. 판매 트렌드 리포트 (`/reports/sales-trend`)**
        - **주요 컴포넌트:**
            - **매출/판매량 추이 그래프 (`SalesTrendChart`):** 기간별(일/주/월) 매출액 및 총 판매량 변화를 보여주는 그래프.
            - **요일/시간대별 판매량 분석 (`DailyHourlySalesAnalysis`):** 특정 품목 또는 전체 품목의 요일별, 시간대별 판매 패턴을 히트맵 또는 바 차트로 시각화.
                - **데이터 소스:** `GET /api/reports/sales-trend/` (Django API)
    - **5.2. 재고 효율성 리포트 (`/reports/inventory-efficiency`)**
        - **주요 컴포넌트:**
            - **재고 회전율 분석 (`InventoryTurnoverChart`):** 품목별 재고 회전율을 그래프와 수치로 표시. 비효율적인 재고(낮은 회전율)를 가진 품목 강조.
            - **폐기율 분석 (`WasteAnalysisChart`):** 폐기된 수량, 비용 추이, 품목별 폐기 비중 등.
                - **데이터 소스:** `GET /api/reports/inventory-turnover/`, `GET /api/reports/cost-savings/` (Django API)
    - **5.3. 비용 절감 효과 보고서 (`/reports/cost-savings`)**
        - **주요 컴포넌트:**
            - **절감액 요약 및 그래프 (`CostSavingsSummary`):** 솔루션 도입 전후의 폐기 비용 감소, 품절로 인한 기회비용 절감 등을 수치와 그래프로 제시.
                - **데이터 소스:** `GET /api/reports/cost-savings/` (Django API)

---

### 6. 설정 페이지 (`/settings`)

- **목적:** 사용자 계정, 매장 정보, 알림 등 시스템 전반에 대한 설정을 관리.
- **탭 또는 서브 메뉴:**
    - **6.1. 계정 설정 (`/settings/account`)**
        - **주요 컴포넌트:** `비밀번호 재설정 폼`, 이메일 변경 등.
    - **6.2. 매장 설정 (`/settings/store-info`)**
        - **주요 컴포넌트:** 매장 이름, 업종, 지역, 영업시간 등을 수정하는 폼.
            - **데이터 소스/전송:** `GET/PUT /api/store/` (Django API)
    - **6.3. 알림 설정 (`/settings/notifications`)**
        - **주요 컴포넌트:** 각 알림(재고 부족, 유통기한 임박, 발주 추천)의 **활성화 여부, 알림 채널(앱 내, 푸시, 이메일)**을 체크박스/토글 스위치로 설정.
            - **데이터 소스/전송:** `GET/PUT /api/settings/notifications/` (Django API)
    - **6.4. 로그아웃 버튼:** 별도 페이지가 아닌 헤더나 사이드바에 위치할 수도 있지만, 설정 페이지 내에 명확히 포함.

회원가입 → 로그인 → 대쉬보드페이지로 들어올건데 → 판매목록 쓰도록 할수있게

1. 회원가입때 매장 정보를 입력 → 판매목록으로 가는 버튼 활성화

# DB

- User
    - id (pk)
    - email ==
    - password
    - username
    - store

- Store
    - id
    - name
    - industry : 업종 (편의점, 카페)
    - region : 지역
    - updated_at : 마지막 수정 시간

- Product
    - id
    - store 과 매핑
    - item_code
    - name
    - unit : 판매 단위 (개 , 묶음)
    - current_stock : 현재 재고 수량
    - min_stock : 최소 재고 수량
    - safety_stock : 발주 추천 기준
    - selling_price : 판매가
    - cost_price : 원가
    - lead_time : 평균 리드타임 ( 발주후 입고까지 걸리는 일수)
    - updated_at : 업데이트 일시

- sales_inventory : AI 학습 데이터 셋
    - id

- ProdictionResult : AI 예측 결과 데이터 셋
    - id
    - store
    - product
    - prediction_date
    - predicted_sales_quantity
    - confidence_score : 예측 신뢰도
    - created_at

- InventoryTransaction : 재고 입출고 기록
    - id
    - store
    - product
    - date
    - type : 거래 유형 in / out
    - quantity
    - notes : 비고 ( 주문 입고, 폐기, 도난 )
    - created_at

- NotificationSettings : 알림 → 보류
    - id
    - store
    - low_stock