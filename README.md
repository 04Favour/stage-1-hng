# Profile Intelligence Service

A RESTful API built with NestJS that enriches names using three external APIs, persists the results in a PostgreSQL database, and exposes clean endpoints for profile management.

---

## Live Demo

**Base URL:** `https://coming`

```
POST   /api/profiles
GET    /api/profiles
GET    /api/profiles/:id
DELETE /api/profiles/:id
```

---

## Tech Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL (via TypeORM)
- **Validation:** class-validator + class-transformer
- **External APIs:** Genderize.io · Agify.io · Nationalize.io
- **Deployment:** Vercel

---

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (or npm/yarn)
- A PostgreSQL database

### Installation

```bash
git clone https://github.com/your-username/stage-1-task.git
cd stage-1-task
pnpm install
```

### Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=3009
```

### Running Locally

```bash
# development
pnpm run start:dev

# production
pnpm run build
pnpm run start:prod
```

Server starts on `http://localhost:3009` by default.

---

## API Reference

### `POST /api/profiles`

Accepts a name, calls all three external APIs in parallel, and stores the enriched result. Idempotent — submitting the same name twice returns the existing record without creating a duplicate.

**Request body:**
```json
{ "name": "ella" }
```

**Success `201`:**
```json
{
  "status": "success",
  "data": {
    "id": "019d96e7-b568-722a-bb80-5a6fc6b6add6",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "DK",
    "country_probability": 0.85,
    "created_at": "2026-04-14T10:32:00.000Z"
  }
}
```

**Already exists `200`:**
```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": { "...existing profile..." }
}
```

---

### `GET /api/profiles`

Returns all stored profiles. Supports optional case-insensitive query filters.

| Query param | Example |
|-------------|---------|
| `gender` | `?gender=male` |
| `country_id` | `?country_id=NG` |
| `age_group` | `?age_group=adult` |

**Success `200`:**
```json
{
  "status": "success",
  "count": 6,
  "data": [
    {
      "id": "019d96e7-b568-722a-bb80-5a6fc6b6add6",
      "name": "ubong",
      "gender": "male",
      "age": 54,
      "age_group": "adult",
      "country_id": "NG"
    }
  ]
}
```

---

### `GET /api/profiles/:id`

Retrieves a single profile by UUID.

**Success `200`:**
```json
{
  "status": "success",
  "data": {
    "id": "019d96e7-b568-722a-bb80-5a6fc6b6add6",
    "name": "emmanuel",
    "gender": "male",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 25,
    "age_group": "adult",
    "country_id": "NG",
    "country_probability": 0.85,
    "created_at": "2026-04-14T10:32:00.000Z"
  }
}
```

**Not found `404`:**
```json
{ "status": "error", "message": "Profile not found" }
```

---

### `DELETE /api/profiles/:id`

Deletes a profile by UUID. Returns `204 No Content` on success.

---

## Data Processing Rules

| Field | Source | Logic |
|-------|--------|-------|
| `gender`, `gender_probability` | Genderize | Extracted directly |
| `sample_size` | Genderize | Renamed from `count` |
| `age` | Agify | Extracted directly |
| `age_group` | Agify | 0–12 → child · 13–19 → teenager · 20–59 → adult · 60+ → senior |
| `country_id`, `country_probability` | Nationalize | Country with the highest probability |
| `id` | Generated | UUID v7 (time-sortable) |
| `created_at` | Generated | UTC ISO 8601 timestamp |

---

## Error Handling

All errors follow a consistent shape:

```json
{ "status": "error", "message": "<description>" }
```

| Status | Scenario |
|--------|----------|
| `400` | Missing or empty `name` |
| `422` | `name` is not a string |
| `404` | Profile not found |
| `502` | Any external API returns null or empty data |

502 messages identify the failing service explicitly: `Genderize returned an invalid response`, `Agify returned an invalid response`, or `Nationalize returned an invalid response`.

---

## Project Structure

```
src/
├── main.ts                    # Bootstrap, CORS, global pipes & filters
├── app.module.ts              # TypeORM config, module imports
├── http-exception.filter.ts   # Unified { status, message } error shape
└── profile/
    ├── profile.module.ts      # Feature module
    ├── profile.controller.ts  # Route handlers
    ├── profile.service.ts     # Business logic & external API integration
    ├── profile.entity.ts      # TypeORM entity (profiles table)
    └── profile.dto.ts         # Input validation DTOs
```

---

## CORS

All responses include:

```
Access-Control-Allow-Origin: *
```

---

## License

MIT