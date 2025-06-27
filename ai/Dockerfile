# ai/Dockerfile (ai 폴더 바로 아래에 생성)

# 파이썬 3.9 버전의 공식 slim 이미지를 사용 (alpine은 더 가볍지만 호환성 문제 가능성 있음)
FROM python:3.9-slim-buster

# 작업 디렉토리 설정
WORKDIR /app

# 시스템에 필요한 패키지 설치 (필요하다면)
# 예: apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

# 파이썬 의존성 파일 복사
# 먼저 requirements.txt를 복사하여 캐싱을 활용 (dependencies 변경 시에만 다시 설치)
COPY requirements.txt .

# 파이썬 의존성 설치
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY ./app .

# FastAPI 애플리케이션 실행 명령어
# 8001 포트에서 Uvicorn으로 main.py의 app 객체를 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]

# 8001 포트 노출 (선택 사항이지만 도커 외부에서 접근하려면 필요)
EXPOSE 8001