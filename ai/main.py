from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib
import os
from datetime import date, timedelta
from typing import List, Dict, Optional

# schemas 폴더에서 Pydantic 모델 가져오기
from schemas.prediction import PredictRequest, ProductPrediction, PredictResponse

# utils 폴더에서 전처리 함수 임포트
from utils.data_preprocessing import prepare_data_for_prediction

# FastAPI 초기화
app = FastAPI(
    title = "Propstock AI Prediction",
    desciption = "재고 관리를 위한 판매량 예측 API",
    version = "0.0.1"
)

# CORS 설정
origins = [
    "http://localhost:3000", # React 개발 주소
]
app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 학습된 모델 로드
MODEL_PATH = "models/prophet_model.pkl"

models_by_product = {} # 품목별 Prophet 모델을 저장할 딕셔너리

try : 
    if os.path.exists(MODEL_PATH):
        models_by_product = joblib.load(MODEL_PATH)
        print(f"AI모델 '{MODEL_PATH}'이(가) 정상적으로 로드되었습니다.({len(models_by_product)}개 품목)")
    
    else:
        print(f"WARNING: 모델 파일이 존재하지 않습니다: {MODEL_PATH}. 'train_model.py'를 먼저 실행하여 모델을 학습하고 저장해주세요.")

except Exception as e:
    print(f"ERROR: AI 모델 로드 실패: {e}")
    models_by_product = {} # 모델 로드 실패 시 빈 딕셔너리로 설정하여 API 요청 시 에러 발생 유도

# 체크 엔드포인트
@app.get("/")
async def read_root():
    return {"message":"AI API가 실행중입니다."}

@app.get("/health")
async def health_check():
    # API 서버의 상태 체크
    status = "Healthy" if models_by_product else "Unhealthy (model not loaded)"
    return {"statusL":status, "model_loaded":bool(models_by_product)}

# AI 에측 엔드포인트
@app.post("/predict_sales/", response_model=PredictResponse, summary="품목별 판매량 예측")
async def predict_sales(request: PredictRequest) :
    # 주어진 날짜에 대한 특정 품목들의 판매량을 예측
    if not models_by_product:
        raise HTTPException(status_code = 500, detail ="예측 모델이 로드되지 않았거나 학습되지 않았습니다.")
    
    predictions_list = []

    for product_code in request.product_codes:
        model = models_by_product.get(product_code)
        if not model :
            # 특정 품목에 대한 모델이 없는 경우
            predictions_list.append(ProductPrediction(
                product_code = product_code,
                predicted_quantity = 0.0 # 모델이 없다면 에측량 0으로 반환한다.
            ))
            print(f"WARNING : '{product_code}'에 대한 학습된 모델을 찾을 수 없습니다.")
            continue

        try :
            # utils/data_preprocessing.py의 함수를 사용하여 예측에 필요한 데이터 프레임 생성
            # 이 함수는 예측 날짜와 필요한 외부 요인(공휴일, 날씨 등)을 포함한 피처를 생성해야 합니다.
            # prepare_data_for_prediction 함수는 날짜만 받지만, 실제로는 추가적인 인자가 필요할 수 있습니다.
            # 여기서는 예시로 predict_date만 전달
            future_df = prepare_data_for_prediction(request.predict_date, request.is_event_day)

            # Prophet 예측 수행
            forecast = model.predict(future_df)

            # 예측 결과를 가져오고 처리
            # 예측값이 소수일 수 있음
            predicted_quantity = max(0.0, round(forecast['yhat'].iloc[0],1)) #소숫점 첫째 자리까지
            
            predictions_list.append(ProductPrediction(
                product_code = product_code,
                predicted_quantity = predicted_quantity
            ))

        except Exception as e :
            print(f"ERROR: '{product_code}' 예측 중 오류 발생: {e}")
            predictions_list.append(ProductPrediction(
                product_code=product_code,
                predicted_quantity =0.0
            ))
    return PredictResponse(predictions = predictions_list)