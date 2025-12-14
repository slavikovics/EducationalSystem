FROM node:25-alpine AS development

WORKDIR /app

COPY package*.json ./
COPY package-lock.json* ./

RUN npm ci
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]