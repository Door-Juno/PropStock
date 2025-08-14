# frontend/Dockerfile (Multi-stage build for Production)

# --- 1단계: React 앱 빌드 ---
FROM node:18-alpine AS builder

WORKDIR /app

# package.json과 lock 파일을 먼저 복사하여 의존성 캐싱을 활용합니다.
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm install

# 나머지 소스 코드 복사
COPY . .

# 프로덕션용으로 앱을 빌드합니다. /app/build 폴더에 결과물이 생성됩니다.
RUN npm run build

# --- 2단계: Nginx로 정적 파일 서빙 --- 
FROM nginx:1.21-alpine

# Nginx의 기본 설정을 삭제합니다.
RUN rm /etc/nginx/conf.d/default.conf

# 우리가 만든 커스텀 Nginx 설정을 복사합니다.
COPY nginx.conf /etc/nginx/conf.d/

# builder 단계에서 생성된 빌드 결과물을 Nginx의 웹 루트 디렉토리로 복사합니다.
COPY --from=builder /app/build /usr/share/nginx/html

# 80번 포트를 외부에 노출합니다.
EXPOSE 80

# 컨테이너가 시작될 때 Nginx를 실행합니다.
CMD ["nginx", "-g", "daemon off;"]
