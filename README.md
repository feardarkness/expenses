# Simple Expenses Backend

REST API with JWT auth.

## Requirements

Node 14 or higher.

Postgresql

## Before you start

1. Create a .env file (You can copy from .env.sample) with you system configurations.

2. Create a new database with the name configured on the .env file.

## Create migrations

```bash
./node_modules/.bin/ts-node ./node_modules/typeorm/cli.js migration:generate -n createUserTable
```

or

```bash
npm run typeorm migration:generate -- -n createUserTable
```
