import pandas as pd
from datetime import date

# 공휴일 목록
HOLIDATS_DATA = pd.DataFrame({
    'holiday' : 'korean_holiday',
    'ds' : pd.to_datetime([
        '2024-04-10', # 제22대 국회의원 선거
        '2024-05-05', # 어린이날
        '2024-05-06', # 어린이날 대체공휴일
        '2024-05-15', # 부처님 오신 날
        '2024-06-06', # 현충일
        '2024-08-15', # 광복절
        '2024-09-16', '2024-09-17', '2024-09-18', # 추석 연휴
        '2024-10-03', # 개천절
        '2024-10-09', # 한글날
        '2024-12-25',  # 성탄절
        '2025-01-01', '2025-01-28', '2025-01-29', '2025-01-30', # 설날 연휴 대체휴일 포함
        '2025-03-01', # 3.1절
        '2025-05-05', # 어린이날
        '2025-05-06', # 어린이날 대체공휴일
        '2025-06-06', # 현충일
        '2025-08-15', # 광복절
        '2025-09-17', '2025-09-18', '2025-09-19', # 추석 연휴
        '2025-10-03', # 개천절
        '2025-10-09', # 한글날
        '2025-12-25'  # 성탄절
    ]),
    'lower_window' : 0,
    'upper_window' : 0,
})


# Prophet 모델의 DataFrame을 생성
def prepare_data_for_prediction(predict_date : date) -> pd.DataFrame:
    future_df = pd.DataFrame({'ds' : [predict_date]})

    # 학습 시 추가했던 피처들을 추가
    # 1. 공휴일
    is_hoilday = predict_date in HOLIDATS_DATA['ds'].dt.date.tolist()
    future_df['공휴일'] = int(is_hoilday) 

    # 2. 행사여부
    future_df['행사여부'] = 0

    # 3. 요일
    future_df['요일_숫자'] = pd.to_datetime(future_df['ds']).dt.dayofweek

    return future_df
