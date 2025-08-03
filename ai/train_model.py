import pandas as pd
from prophet import Prophet
import joblib
import os
import glob

# 데이터 및 모델 경로 설정
DATA_DIR = '/app/ai/data'
MODEL_DIR = 'models'
os.makedirs(MODEL_DIR, exist_ok=True)

# data 폴더에 있는 모든 가게별 CSV 파일 목록을 가져옵니다.
store_csv_files = glob.glob(os.path.join(DATA_DIR, 'sales_data_store_*.csv'))

if not store_csv_files:
    print(f"Error: 데이터 폴더 '{DATA_DIR}'에서 'sales_data_store_*.csv' 형식의 파일을 찾을 수 없습니다.")
    print("먼저 백엔드에서 `export_sales_data` 명령을 실행하여 데이터를 추출해주세요.")
    exit()

print(f"총 {len(store_csv_files)}개의 가게에 대한 학습을 시작합니다.")

# 각 가게별로 모델 학습을 진행합니다.
for file_path in store_csv_files:
    try:
        # 파일명에서 store_id 추출
        store_id = os.path.basename(file_path).split('_')[-1].split('.')[0]
        print(f"\n--- 가게 ID: {store_id} 모델 학습 시작 ---")
        print(f"데이터 로드 중: {file_path}")
        df = pd.read_csv(file_path)

        # ds 컬럼을 datetime 객체로 변환
        df['ds'] = pd.to_datetime(df['ds'])

        # 요일 피쳐 생성 (0=월, 6=일)
        df['day_of_week'] = df['ds'].dt.dayofweek

        # 공휴일 설정
        holidays_df = df[df['is_event_day'] == True][['ds']].copy()
        holidays_df.rename(columns={'ds': 'ds'}, inplace=True)
        holidays_df['holiday'] = 'event_day'
        holidays_df = holidays_df.drop_duplicates()

        # 품목별 학습 및 저장
        unique_products = df['item_code'].unique()
        models_by_product = {}

        print(f"총 {len(unique_products)}개의 품목에 대해 학습 시작...")
        for product_code in unique_products:
            product_df = df[df['item_code'] == product_code].copy()

            if len(product_df) < 2:
                print(f"Warning: '{product_code}' 품목은 데이터가 부족하여 학습을 건너뜁니다.")
                continue

            m = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=True,
                daily_seasonality=False,
                seasonality_mode='additive',
                holidays=holidays_df if not holidays_df.empty else None
            )
            m.add_regressor('day_of_week')
            m.fit(product_df)
            models_by_product[product_code] = m
            print(f"'{product_code}' 품목 모델 학습 완료.")

        # 가게별로 별도의 모델 파일 저장
        if models_by_product:
            model_path_full = os.path.join(MODEL_DIR, f'prophet_model_store_{store_id}.pkl')
            joblib.dump(models_by_product, model_path_full)
            print(f"가게 ID {store_id}의 모든 학습된 모델이 '{model_path_full}'에 저장되었습니다.")
        else:
            print(f"가게 ID {store_id}에 대해 학습된 모델이 없습니다.")

    except Exception as e:
        print(f"오류 발생 (파일: {file_path}): {e}")

print("\n모든 가게에 대한 모델 학습이 완료되었습니다.")
