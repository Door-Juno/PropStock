# backend/Dockerfile

# Python 공식 이미지를 기반으로 사용 (지원되는 'bookworm' 버전으로 변경)
FROM python:3.10-slim-bookworm

# 환경 변수 설정
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 종속성 설치 (PostgreSQL 클라이언트 라이브러리 등)
# psycopg2-binary가 설치 과정에서 필요로 할 수 있습니다.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev postgresql-client \
    && rm -rf /var/lib/apt/lists/*


# 요구사항 파일 복사 (캐싱 활용을 위해 먼저 복사)
COPY requirements.txt /app/

# Python 종속성 설치
RUN pip install --no-cache-dir -r requirements.txt

# 프로젝트 파일 복사
COPY . /app/

# Django 애플리케이션이 8000번 포트를 사용한다고 선언 (Docker 내부에서)
EXPOSE 8000

# 개발 서버 실행 명령어 (docker-compose에서 오버라이드될 수 있음)
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
