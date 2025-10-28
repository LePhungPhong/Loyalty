# Giai đoạn build frontend
FROM node:22-bookworm AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Nhận biến môi trường từ docker-compose
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build FE (Vite sẽ nhúng giá trị API vào code)
RUN npm run build

# Giai đoạn serve bằng Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
