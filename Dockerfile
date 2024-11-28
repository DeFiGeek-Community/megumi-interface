FROM node:18.17.0-alpine

# RUN apk add g++ make py3-pip

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

COPY . .

CMD ["pnpm", "dev"]
