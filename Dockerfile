FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# 어느 도메인/IP로 접속하든 같은 origin의 /api/v1로 호출 (nginx가 백엔드로 프록시) — CORS 회피
ENV VITE_API_BASE_URL=/api/v1

# OAuth 등 빌드타임 주입값. Jenkins `build-client` 잡이 호스트 시크릿
# (/home/wlsdms/rekit/secrets/rekit_client.env)에서 읽어 --build-arg 로 넘긴다.
# client_id / redirect_uri 는 브라우저(authorize URL·번들)에 노출되는 공개값이라 비밀 아님.
# 값이 비면 빈 문자열로 빌드되고, 해당 provider 버튼은 런타임에 에러 → 소셜 로그인만 비활성.
ARG VITE_KAKAO_CLIENT_ID=
ARG VITE_KAKAO_REDIRECT_URI=
ARG VITE_NAVER_CLIENT_ID=
ARG VITE_NAVER_REDIRECT_URI=
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_GOOGLE_REDIRECT_URI=
ENV VITE_KAKAO_CLIENT_ID=$VITE_KAKAO_CLIENT_ID \
    VITE_KAKAO_REDIRECT_URI=$VITE_KAKAO_REDIRECT_URI \
    VITE_NAVER_CLIENT_ID=$VITE_NAVER_CLIENT_ID \
    VITE_NAVER_REDIRECT_URI=$VITE_NAVER_REDIRECT_URI \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_GOOGLE_REDIRECT_URI=$VITE_GOOGLE_REDIRECT_URI

RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
