import pandas as pd
from prophet import Prophet
import os
import glob
import mlflow
import mlflow.prophet
from prophet.diagnostics import cross_validation, performance_metrics

# 데이터 경로 설정
DATA_DIR = '/app/ai/data'

# MLflow 실험 설정 (없으면 자동으로 생성됨)
mlflow.set_experiment("propstock-training-by-product")

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

        # 품목별 학습 및 MLflow에 기록
        unique_products = df['item_code'].unique()
        
        print(f"총 {len(unique_products)}개의 품목에 대해 학습 시작...")
        for product_code in unique_products:
            # --- MLflow Run 시작 ---
            with mlflow.start_run(run_name=f"store_{store_id}_product_{product_code}"):
                product_df = df[df['item_code'] == product_code].copy()

                # 교차 검증을 위해 최소 10개 이상의 데이터가 필요
                if len(product_df) < 10:
                    print(f"Warning: '{product_code}' 품목은 데이터가 부족하여 (10개 미만) 학습을 건너뜁니다.")
                    continue

                print(f"\nProcessing product: {product_code}")
                
                # MLflow에 파라미터 로깅
                mlflow.log_param("store_id", store_id)
                mlflow.log_param("product_code", product_code)
                mlflow.log_param("data_points", len(product_df))
                
                seasonality_mode = 'additive'
                has_holidays = not holidays_df.empty
                
                mlflow.log_param("seasonality_mode", seasonality_mode)
                mlflow.log_param("has_holidays", has_holidays)

                m = Prophet(
                    yearly_seasonality=True,
                    weekly_seasonality=True,
                    daily_seasonality=False,
                    seasonality_mode=seasonality_mode,
                    holidays=holidays_df if has_holidays else None
                )
                m.add_regressor('day_of_week')
                m.fit(product_df)
                
                print(f"'{product_code}' 품목 모델 학습 완료.")

                # 교차 검증 및 성능 평가
                try:
                    # 데이터 양에 따라 initial, period, horizon 값 조정이 필요할 수 있습니다.
                    df_cv = cross_validation(m, initial='30 days', period='15 days', horizon='7 days', parallel="processes")
                    df_p = performance_metrics(df_cv, rolling_window=1)
                    
                    # 성능 지표 로깅 (가장 최근 horizon의 평균값)
                    performance_dict = df_p.mean().to_dict()
                    performance_dict['horizon_days'] = performance_dict['horizon'].days
                    del performance_dict['horizon']
                    
                    mlflow.log_metrics(performance_dict)
                    print(f"'{product_code}' 품목 성능 평가 완료.")

                except Exception as cv_e:
                    print(f"Could not perform cross-validation for product {product_code}: {cv_e}")
                    mlflow.log_param("cross_validation_error", str(cv_e))

                # MLflow에 모델 로깅
                # 이 함수는 모델, 예측 그래프, 구성요소 그래프를 자동으로 저장합니다.
                mlflow.prophet.log_model(m, artifact_path=f"prophet-model-{product_code}")
                print(f"'{product_code}' 품목 모델이 MLflow에 저장되었습니다.")

    except Exception as e:
        print(f"오류 발생 (파일: {file_path}): {e}")

print("\n모든 가게에 대한 모델 학습이 완료되었습니다.")
print("MLflow UI를 실행하여 결과를 확인하세요: mlflow ui")
