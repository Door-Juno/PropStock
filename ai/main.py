from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib
import os
from datetime import date
from typing import List, Dict

# Pydantic 모델 임포트
from schemas.prediction import PredictRequest, ProductPrediction, PredictResponse

# 유틸리티 함수 임포트
from utils.data_preprocessing import prepare_data_for_prediction

# FastAPI 앱 초기화
app = FastAPI(
    title="PropStock AI Prediction API",
    description="가게별 재고 관리를 위한 판매량 예측 API",
    version="1.0.0"
)

# CORS 미들웨어 설정
origins = [
    "http://localhost:3000",  # React 개발 서버
    "http://54.180.30.61", # 프로덕션 프론트엔드 서버
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모델 파일이 저장된 디렉토리
MODEL_DIR = "models"

# 로드된 모델을 캐싱하기 위한 딕셔너리
# key: store_id, value: loaded_model
loaded_models_cache: Dict[int, Dict] = {}

def get_model_for_store(store_id: int):
    """지정된 가게 ID의 모델을 로드하고 캐시합니다."""
    # 1. 캐시 확인
    if store_id in loaded_models_cache:
        print(f"Cache hit for store_id: {store_id}")
        return loaded_models_cache[store_id]

    # 2. 캐시에 없으면 파일에서 로드
    model_path = os.path.join(MODEL_DIR, f"prophet_model_store_{store_id}.pkl")
    if not os.path.exists(model_path):
        print(f"WARNING: Model file not found for store_id: {store_id} at {model_path}")
        return None
    
    try:
        print(f"Loading model from file for store_id: {store_id}")
        model = joblib.load(model_path)
        # 3. 캐시에 저장
        loaded_models_cache[store_id] = model
        return model
    except Exception as e:
        print(f"ERROR: Failed to load model for store_id: {store_id}. Error: {e}")
        return None

@app.get("/")
async def read_root():
    return {"message": "PropStock AI API is running."}

@app.post("/predict_sales/", response_model=PredictResponse, summary="가게별 품목 판매량 예측")
async def predict_sales(request: PredictRequest):
    """요청된 가게(store_id)의 여러 품목(product_codes)에 대한 미래 판매량을 예측합니다."""
    
    store_model = get_model_for_store(request.store_id)

    if not store_model:
        raise HTTPException(
            status_code=404,
            detail=f"Store ID {request.store_id}에 대한 예측 모델을 찾을 수 없습니다. 먼저 모델을 학습시켜 주세요."
        )

    predictions_list = []

    for product_code in request.product_codes:
        item_model = store_model.get(product_code)
        
        if not item_model:
            predictions_list.append(ProductPrediction(
                product_code=product_code,
                predicted_quantity=0.0
            ))
            print(f"WARNING: Product code '{product_code}' not found in model for store '{request.store_id}'.")
            continue

        try:
            future_df = prepare_data_for_prediction(request.predict_date, request.is_event_day)
            forecast = item_model.predict(future_df)
            predicted_quantity = max(0.0, round(forecast['yhat'].iloc[0], 1))
            
            predictions_list.append(ProductPrediction(
                product_code=product_code,
                predicted_quantity=predicted_quantity
            ))

        except Exception as e:
            print(f"ERROR: Prediction failed for product '{product_code}' in store '{request.store_id}'. Error: {e}")
            predictions_list.append(ProductPrediction(
                product_code=product_code,
                predicted_quantity=0.0
            ))
            
    return PredictResponse(predictions=predictions_list)
