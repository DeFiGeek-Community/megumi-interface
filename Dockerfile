FROM node:20.18.1

RUN apt update && apt install -y openssl g++ make python3

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

COPY . .

CMD ["pnpm", "dev"]
