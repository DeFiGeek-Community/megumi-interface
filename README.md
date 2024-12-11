# Megumi interface

## Getting Started

```bash
pnpm i
```

```bash
npx prisma generate
```

### Prepare .env

```bash
cp .env.sample .env
```

Then, set each values in .env file. You can create NEXTAUTH_SECRET by running the command below.

```bash
openssl rand -base64 32
```

## Run development server

```bash
pnpm dev
```

## Test

### Create test env file

```bash
cp .env.sample .env.test
```

### Run test

```bash
pnpm test:backend
```

## Docker

```bash
docker compose build
docker compose up
```

```bash
docker compose exec -it app bash
docker compose exec -it db bash
```
