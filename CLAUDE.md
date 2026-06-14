# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FEIRS — Fingerprint-based Emergency Identity Retrieval System. Captures fingerprints via a Mantra MFS100 USB scanner, enrolls identities, and performs 1:N identification against enrolled records. Built as a testing/demo UI.

## Architecture

```
MFS100 Scanner (USB)
    ↕
MFS100ClientService (Windows service, port 8004)
    ↕ HTTP (localhost:8004/mfs100/*)
Spring Boot Backend (Java 21, port 8080) ←→ PostgreSQL (FEIRS database)
    ↕ REST (localhost:8080/api/fingerprint/*)
React Frontend (Vite, port 5173 dev)
```

The backend proxies capture/verify calls to MFS100ClientService to avoid browser CORS issues — the React app never calls port 8004 directly. The backend also handles enrollment persistence and identification logic.

## Development Commands

### Frontend (React + Vite)
```bash
cd frontend
npm install         # Install dependencies
npm run dev         # Start dev server (http://localhost:5173)
npm run build       # Production build to frontend/dist/
npm run preview     # Preview production build
npm run lint        # ESLint
```

### Backend (Spring Boot + Maven)
```bash
cd backend
./mvnw spring-boot:run          # Start backend (port 8080)
./mvnw test                     # Run tests
./mvnw clean package            # Build JAR
```

### Prerequisites
- **Java 21** and Maven (or use `mvnw`)
- **PostgreSQL** running on `localhost:5432` with a database named `FEIRS`
- **MFS100ClientService** running on `localhost:8004` (Windows service — start via `services.msc` if not running)
- **Node.js** for the frontend

## Key Backend Files

| File | Purpose |
|------|---------|
| `FingerprintController.java` | REST endpoints: `/ping`, `/device-status`, `/capture`, `/count`, `/enroll`, `/identify` |
| `FingerprintService.java` | Core logic — proxies MFS100 capture/verify via HTTP, manages Person entities, saves BMP files |
| `Person.java` | JPA entity (table: `persons`) — `id`, `name`, `isoTemplate` (base64 ISO FMR), `bmpBase64`, `enrolledAt` |
| `PersonRepository.java` | Spring Data JPA repository — `findAll()`, `save()`, `count()` |
| `SecurityConfig.java` | CSRF disabled, CORS allows `localhost:5173`/`localhost:3000`, all `/api/**` permitted (testing phase) |
| `application.properties` | DB connection (`jdbc:postgresql://localhost:5432/FEIRS`), JPA settings, BMP save path, server port |

## MFS100 Integration Gotchas

The MFS100ClientService returns inconsistent types that will break if cast naively:

- **`ErrorCode`** can be string `"0"` or integer `0` — always parse via `Integer.parseInt(errObj.toString().trim())`, never direct cast to `int`
- **`Status`** can be string `"True"`/`"False"` or boolean — check with `instanceof Boolean` then fall back to `Boolean.parseBoolean()` or `equalsIgnoreCase`
- **Capture success** is best determined by the presence of `BitmapData` (the base64 BMP image), not just `ErrorCode == 0`
- The `/capture` endpoint needs generous timeouts (15s read timeout) — the user has to place their finger

## Frontend Component

`FingerprintTest.jsx` is the single-page testing UI with a 3-step workflow:
1. Check device status (GET `/device-status`, GET `/count`)
2. Capture fingerprint (POST `/capture`) — displays the BMP preview
3. Enroll (POST `/enroll` with name + isoTemplate + bmpBase64) or Identify (POST `/identify` with isoTemplate)

State management is local React state — no routing, no global store. Styling uses inline JS objects (see `S` object at bottom of component), with Tailwind CSS 4 available via `@tailwindcss/vite` plugin.

## Database

PostgreSQL with Hibernate `ddl-auto=update` — tables are auto-created/updated on backend startup. The `persons` table schema is driven by the `Person.java` entity. JPA `show-sql=true` logs all SQL to the backend console. No manual SQL or migration files exist.
