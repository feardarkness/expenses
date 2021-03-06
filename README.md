# Simple Ledger Backend

REST API with JWT auth.

[![Build Status](https://www.travis-ci.com/feardarkness/expenses.svg?branch=main)](https://www.travis-ci.com/feardarkness/expenses)

## Requirements

Node 14 or higher.

Postgresql

## Before you start

1. Create a .env file (You can copy from .env.sample) with you system configurations.

2. Create a new database with the name configured on the .env file.

3. Create the extension to generate UUID.

```psql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Create migrations

```bash
./node_modules/.bin/ts-node ./node_modules/typeorm/cli.js migration:generate -n createUserTable
```

or

```bash
npm run typeorm migration:generate -- -n createUserTable
```
