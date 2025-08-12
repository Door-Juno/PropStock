import pandas as pd
from datetime import date

# 공휴일 목록 (Prophet의 holidays 인자로 사용)
HOLIDAYS_DATA = pd.DataFrame({
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
def prepare_data_for_prediction(predict_date : date, is_event_day: int = 0) -> pd.DataFrame:
    future_df = pd.DataFrame({'ds' : [predict_date]})

    # 요일 정보 추가 (Prophet 모델의 regressor 이름과 일치)
    future_df['day_of_week'] = pd.to_datetime(future_df['ds']).dt.dayofweek

    # is_event_day는 Prophet의 holidays 인자를 통해 처리되므로, future_df에 별도로 추가하지 않음
    # 공휴일 여부도 Prophet의 holidays 인자를 통해 처리되므로, future_df에 별도로 추가하지 않음

    return future_df