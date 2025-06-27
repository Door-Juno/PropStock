# ai/app/main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os

# 현재 파일의 디렉토리를 기준으로 모델 파일 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'inventory_model.pkl') # 모델 경로

# FastAPI 애플리케이션 인스턴스 생성
app = FastAPI(
    title="재고 예측 AI 서비스",
    description="과거 데이터를 기반으로 미래 재고 및 판매량을 예측하는 API",
    version="1.0.0"
)

# 1. AI 모델 로드 (애플리케이션 시작 시 한 번만 로드)
# 모델 로딩은 시간이 걸릴 수 있으므로, 서버 시작 시 메모리에 올려두는 것이 효율적입니다.
ai_model = None
try:
    ai_model = joblib.load(MODEL_PATH)
    print(f"AI 모델이 성공적으로 로드되었습니다: {MODEL_PATH}")
except FileNotFoundError:
    print(f"오류: 모델 파일을 찾을 수 없습니다 - {MODEL_PATH}")
    print("FastAPI 서버가 시작되었지만 예측 기능을 사용할 수 없습니다.")
    # 실제 운영에서는 서버 시작을 중단하거나 적절한 오류 처리가 필요
except Exception as e:
    print(f"모델 로드 중 오류 발생: {e}")
    ai_model = None # 모델 로드 실패 시 None으로 설정

# 2. 요청 바디를 위한 Pydantic 모델 정의
# Django에서 보낼 예측에 필요한 데이터의 구조를 정의합니다.
class PredictionRequest(BaseModel):
    product_id: str
    date: str # 예측을 원하는 날짜 (YYYY-MM-DD 형식)
    past_sales_data: list[float] # 과거 N일간의 판매량 데이터 (예: [100, 120, 90, ...])
    # 여기에 요일, 월, 행사 유무 등 AI 모델이 필요로 하는 특징들을 추가합니다.
    day_of_week: int
    month: int
    day_of_year: int
    # sales_lag_1: float # 이전 1일 판매량
    # sales_2: float # 이전 2일 판매량
    # ... 등 모델이 요구하는 모든 특징을 정의

class PredictionResponse(BaseModel):
    product_id: str
    predicted_quantity: float
    message: str = "예측 성공"

# 3. AI 예측 API 엔드포인트 정의
@app.post("/predict_inventory/", response_model=PredictionResponse)
async def predict_inventory(request: PredictionRequest):
    if ai_model is None:
        raise HTTPException(status_code=500, detail="AI 모델이 로드되지 않았습니다.")

    try:
        # Pydantic 모델로부터 특징 데이터 추출
        # 여기서는 LinearRegression 예시를 따름
        features = pd.DataFrame([{
            'day_of_week': request.day_of_week,
            'month': request.month,
            'day_of_year': request.day_of_year,
            # 'sales_lag_1': request.past_sales_data[-1] if len(request.past_sales_data) > 0 else 0,
            # 'sales_lag_2': request.past_sales_data[-2] if len(request.past_sales_data) > 1 else 0,
            # 실제 모델의 입력 특징에 맞춰 과거 판매량 데이터를 가공해야 합니다.
            # 예시: LinearRegression 학습 시 사용했던 sales_lag_1, sales_lag_2 등 생성
            **{f'sales_lag_{i+1}': request.past_sales_data[-(i+1)] for i in range(len(request.past_sales_data))}
        }])
        
        # 특징 데이터가 모델 입력 형태와 일치하는지 확인 및 조정 필요
        # 실제 모델은 학습 시 사용했던 피처의 순서와 개수를 엄격히 따릅니다.
        # 예시:
        # expected_features = ['day_of_week', 'month', 'day_of_year', 'sales_lag_1', 'sales_lag_2', ...]
        # features = features[expected_features] # 순서 맞추기

        predicted_quantity = ai_model.predict(features)[0] # 모델 예측 수행
        
        # 예측 결과가 음수라면 0으로 처리 (재고는 음수가 될 수 없음)
        predicted_quantity = max(0, predicted_quantity)

        return PredictionResponse(
            product_id=request.product_id,
            predicted_quantity=round(predicted_quantity, 2), # 소수점 둘째 자리까지 반올림
            message="성공적으로 재고 예측을 수행했습니다."
        )
    except Exception as e:
        print(f"예측 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"예측 오류 발생: {str(e)}")

# 건강 체크 (Health Check) 엔드포인트
@app.get("/health/")
async def health_check():
    return {"status": "ok", "message": "AI 서비스가 정상 작동 중입니다."}

# FastAPI 개발 서버 실행 명령어: uvicorn main:app --reload --port 8001
# `main:app`은 `main.py` 파일의 `app` 객체를 의미합니다.
# `--reload`는 코드 변경 시 자동 재시작.
# `--port 8001`은 8001번 포트에서 실행 (Django와 충돌 방지)