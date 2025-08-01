from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional

class PredictRequest(BaseModel):
    product_codes: List[int] = Field(...,description="예측 요청할 품목 코드 리스트")
    predict_date: date=Field(...,description="에측을 수행할 날짜 (YYYY-MM-DD)")
    is_event_day: Optional[int] = Field(0, description="예측 날짜의 행사 여부 (0: 없음, 1: 있음)")

class ProductPrediction(BaseModel):
    product_code : int
    predicted_quantity : float = Field(... , ge=0,description="예측 판매량 (음수 불가)")

class PredictResponse(BaseModel) :
    predictions: List[ProductPrediction]
    message : str = "에측이 성공적으로 완료되었습니다."