# Shop Project

This project is a NestJS backend with a static Bootstrap frontend for a local business visibility and ordering system.

## Backend structure

The backend is split into Nest modules under `src/`:

- `users/` handles registration, login, sessions, admin user listing, and notifications.
- `business/` handles business profiles, product stock, images, and admin business moderation.
- `orders/` handles order placement and order listing.
- `customers/` handles customer CRUD, reservations, and customer notifications.

Each module contains its own `dto/` and `entities/` folders.

## Database

The application uses TypeORM.

- Normal runtime defaults to MySQL.
- Tests use in-memory SQLite automatically so `npm run test` and `npm run test:e2e` work without a running MySQL server.

Default MySQL configuration:

```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=shop_project
PORT=3001
```

The app uses `synchronize: true`, so tables are created automatically during development.

## Sample seeded accounts

On first startup, the database is seeded with:

- `admin@local.test` / `admin123`
- `client@local.test` / `client123`
- `customer@local.test` / `customer123`

## Install

```bash
npm install
```

## Run

```bash
npm run start:dev
```

Open the frontend at:

```text
http://localhost:3001/
```

The API base path is:

```text
http://localhost:3001/api/v1
```

## Test

```bash
npm run build
npm run test
npm run test:e2e
```

## Frontend

The frontend is served from `frontend/` and uses:

- Bootstrap for UI
- Axios for API calls
- in-app toast and drawer notifications

## Notes

- Authentication is token-based using a sessions table.
- Notifications are stored in the database and exposed per role.
- Business, products, orders, and users are persisted in MySQL rather than in-memory arrays.