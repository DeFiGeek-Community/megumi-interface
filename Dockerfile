FROM node:20.18.1

RUN apt update && apt install -y openssl g++ make python3 pipx zip less

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm i --frozen-lockfile

# Setting up LocalStack for local AWS environment
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws
RUN pipx ensurepath
RUN pipx install awscli-local

COPY . .

RUN npx prisma generate

RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["pnpm", "dev"]
