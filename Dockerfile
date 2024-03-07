FROM node:20.11-alpine AS builder

RUN npm install -g npm@9.5.1
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

RUN npm install -g @angular/cli
RUN ng build --configuration production

FROM nginx:1.23-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /usr/src/app/dist/siscap-web /usr/share/nginx/html#