# ============================================================
# Smart Mall Frontend - Vue3 + Vite + Nginx
# ============================================================

# ===== Stage 1: Node 编译 =====
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com

COPY . .
RUN npm run build

# ===== Stage 2: Nginx 部署 =====
FROM nginx:alpine

# 复制编译产物
COPY --from=build /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
