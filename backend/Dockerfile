# backend/Dockerfile

# Python 공식 이미지를 기반으로 사용
FROM python:3.10-slim-bookworm

# 환경 변수 설정
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 종속성 설치 (PostgreSQL 클라이언트 라이브러리 등)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# 요구사항 파일 복사 (캐싱 활용을 위해 먼저 복사)
COPY requirements.txt /app/

# Python 종속성 설치
RUN pip install --no-cache-dir -r requirements.txt

# 프로젝트 파일 복사
COPY . /app/

# --- 프로덕션 설정 추가 ---
# 1. 정적 파일 수집
# 이 명령은 settings.py의 STATIC_ROOT에 정의된 폴더로 모든 정적 파일을 복사합니다.
RUN python manage.py collectstatic --no-input

# Django 애플리케이션이 8000번 포트를 사용한다고 선언
EXPOSE 8000

# 2. Gunicorn으로 서버 실행
# 프로덕션 환경에서는 runserver 대신 Gunicorn을 사용합니다.
CMD ["gunicorn", "propstock.wsgi:application", "--bind", "0.0.0.0:8000"]