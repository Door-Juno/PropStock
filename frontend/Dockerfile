# frontend/Dockerfile

# Node.js 공식 이미지를 기반으로 사용 (React 버전에 맞는 Node 버전 선택)
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json 및 package-lock.json 복사 (캐싱 활용을 위해 먼저 복사)
COPY package*.json ./

# Node.js 종속성 설치
RUN npm install

# 프로젝트 파일 복사
COPY . .

# React 개발 서버가 3000번 포트를 사용한다고 선언
EXPOSE 3000

# React 개발 서버 실행
CMD ["npm", "start"]