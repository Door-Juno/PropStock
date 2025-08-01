import pandas as pd
from prophet import Prophet
import joblib
import os

# 데이터 로드 경로를 새로운 CSV 파일로 변경
DATA_PATH = 'data/all_sales_data.csv'
MODEL_DIR = 'models'
MODEL_NAME = 'prophet_model.pkl'

os.makedirs(MODEL_DIR, exist_ok=True)

# 파일 존재 여부 확인
if not os.path.exists(DATA_PATH):
    print(f"Error: 데이터 파일 '{DATA_PATH}'를 찾을 수 없습니다.")
    print("먼저 백엔드에서 `export_sales_data` 명령을 실행하여 데이터를 추출해주세요.")
    exit()

print(f"'{DATA_PATH}'에서 데이터 로드 중 ...")
df = pd.read_csv(DATA_PATH)

# ds 컬럼을 datetime 객체로 변환
df['ds'] = pd.to_datetime(df['ds'])

# 요일 피쳐 생성 (0=월, 6=일)
df['day_of_week'] = df['ds'].dt.dayofweek

# Prophet에 공휴일 추가 (is_event_day를 공휴일처럼 활용)
# 실제 공휴일 데이터가 있다면 별도로 추가하는 것이 더 정확합니다.
holidays_df = df[df['is_event_day'] == True][['ds']].copy()
holidays_df.rename(columns={'ds': 'ds'}, inplace=True)
holidays_df['holiday'] = 'event_day'
holidays_df = holidays_df.drop_duplicates()

# 품목별 학습 및 저장
unique_products = df['item_code'].unique()
models_by_product = {}

print(f"\n총 {len(unique_products)}개의 품목에 대해 학습 시작 ...")

for product_code in unique_products:
    print(f"'{product_code}' 품목 모델 학습 중...")
    product_df = df[df['item_code'] == product_code].copy()

    if len(product_df) < 2:
        print(f"Warning: '{product_code}' 품목은 데이터가 부족하여 학습을 건너뜁니다.")
        continue

    m = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False, # 일별 데이터이므로 daily는 False가 적합
        seasonality_mode='additive',
        holidays=holidays_df if not holidays_df.empty else None
    )

    # 요일 정보를 추가 회귀 변수(regressor)로 추가
    m.add_regressor('day_of_week')

    m.fit(product_df) # 학습 시작
    models_by_product[product_code] = m
    print(f"'{product_code}' 품목 모델 학습 완료.")

# 모든 모델을 하나의 딕셔너리로 저장
model_path_full = os.path.join(MODEL_DIR, MODEL_NAME)
joblib.dump(models_by_product, model_path_full)
print(f"\n모든 학습된 Prophet 모델이 '{model_path_full}'에 저장되었습니다.")