## Local development database

Prisma expects a PostgreSQL instance to be available at `127.0.0.1:5432` with the credentials that are already shipped in `.env.local`.  
You can start the database via Docker by running:

```bash
docker compose up -d postgres
```

The first start downloads the Postgres image and creates a named volume (`postgres-data`) so data survives restarts.

Once the container is healthy, push the Prisma schema so the tables exist:

```bash
npm run db:push:local
```

After that you can run `npm run dev` and the Prisma client will be able to connect.
