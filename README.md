# mobilemarket

Anonymous mobile phone shopping MVP based on `Docs/Product_brief.md`.

## Setup

```powershell
npm install
npm run db:push --workspace=mobilemarket-server
npm run db:seed --workspace=mobilemarket-server
```

## Run locally

Start the API:

```powershell
npm start --workspace=mobilemarket-server
```

In another terminal, start the client:

```powershell
npm run dev --workspace=client -- --port 5174
```

Open `http://localhost:5174`. The client uses the Express API at `http://localhost:3000/api` by default. Set `VITE_API_URL` to override it.

## Validation

```powershell
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Backend integration tests use `server/prisma/test.db` and reset their fixtures. The test database is separate from the development database and is ignored by Git.

E2E automation is organized under `working-artifacts/e2e/`: executable specs are in `working-artifacts/e2e/specs/`, reusable Playwright page objects are in `working-artifacts/e2e/pages/`, and the coverage mapping is in `working-artifacts/e2e/AUTOMATION-TRACEABILITY.md`. Test-case design documents remain under `working-artifacts/test-cases/`.