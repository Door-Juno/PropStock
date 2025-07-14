import pandas as pd
from prophet import Prophet
import joblib
import os
from datetime import date, timedelta

# 데이터 로드 및 전처리
DATA_PATH = 'data/sales_data.csv'
MODEL_DIR = 'models'
MODEL_NAME = 'prophet_model.pkl'

os.makedirs(MODEL_DIR, exist_ok=True)

print(f"'{DATA_PATH}'에서 데이터 로드 중 ...")
df = pd.read_csv(DATA_PATH)

# Prophet 모델을 위한 컬럼명 변경
df['ds'] = pd.to_datetime(df['날짜'])
df['y'] = df['판매량']

# 요일을 위한 준비
df['공휴일'] = df['공휴일'].astype(int)
df['행사여부'] = df['행사여부'].astype(int)

# 요일 피쳐 생성
day_mapping = {'월':0 , '화':1, '수': 2, '목': 3, '금': 4, '토': 5, '일': 6}
df['요일_숫자'] = df['요일'].map(day_mapping)

# Prophet에 공휴일 추가
kr_holidays = pd.DataFrame({
    'holiday' : 'korean_holiday',
    'ds': df[df['공휴일'] == 1]['ds'].unique(),
    'lower_window':0,
    'upper_window':0,
})

# 품목별 학습 및 저장
unique_products = df['품목코드'].unique()
models_by_product = {}

print(f"\n총 {len(unique_products)}개의 품목에 대해 학습 시작 ...")

for product_code in unique_products :
    print(f"'{product_code}'품목 모델 학습 중...")
    product_df = df[df['품목코드'] == product_code].copy() # 해당 품목 데이터만 선택

    m = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False , #일별 판매 데이터에 따라 적절히 설정
        seasonality_mode='additive', #또는 multiplicative
        holidays = kr_holidays
    )

    m.add_regressor('공휴일')
    m.add_regressor('행사여부')
    m.add_regressor('요일_숫자')

    m.fit(product_df) # 학습 시작
    models_by_product[product_code] = m
    print(f"'{product_code}' 품목 모델 학습 완료.")

# 모든 모델을 하나의 딕셔너리로
model_path_full = os.path.join(MODEL_DIR,MODEL_NAME)
joblib.dump(models_by_product, model_path_full)
print(f"\n모든 학습된 Prophet 모델이 '{model_path_full}'에 저장되었습니다.")