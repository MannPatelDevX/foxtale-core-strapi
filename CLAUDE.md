# CLAUDE.md — Strapi-clude Project

## Project Overview

Foxtale e-commerce CMS built with **Strapi v5.36.1** (TypeScript). Serves content to both web and app frontends. Shopify is the product data source — Strapi handles content only.

## Tech Stack

- **Strapi**: v5.36.1
- **Language**: TypeScript
- **Node**: >=20.0.0 <=24.x.x
- **Database**: SQLite (dev), PostgreSQL/MySQL (prod)
- **Admin**: React 18 + Styled Components

## Commands

```bash
npm run dev          # Start dev server (localhost:1337)
npm run build        # Build for production
npm start            # Start production server
npm run console      # Strapi interactive console
```

## Project Structure

```
config/              # Server, DB, middleware, plugin configs
src/
  admin/             # Admin panel customization
  api/               # Custom API controllers & routes
  extensions/        # Plugin extensions
  index.ts           # Register/bootstrap hooks
database/migrations/ # DB migrations
public/uploads/      # Media uploads
```

## Key Conventions

- **Naming**: PascalCase for types/components, camelCase for fields, `is`/`has` prefix for booleans
- **Nesting**: Max 2 levels deep (Type → Component → Simple Component)
- **Components**: Max 10 fields, categorized (`shared/`, `product/`, `layout/`, `marketing/`, `blog/`, `navigation/`)
- **Relations**: Always define both sides, document cascade behavior, test deletion
- **Shopify data**: Reference by `shopifyHandle` only — never store price/inventory/variants
- **Platform**: One schema for web + app, use `PlatformToggle` component for visibility
- **API calls**: Never use `populate=*`, always specify exact fields, paginate lists

## Environment Variables

Secrets in `.env` — never commit. See `.env.example` for required keys:
`APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`

## Database

- Dev: SQLite at `.tmp/data.db`
- Prod: Configure via `DATABASE_CLIENT`, `DATABASE_HOST`, etc.
- Index: `shopifyHandle`, `slug`, `platform`, `publishedAt`

## API Defaults

- Pagination: 25 per page (max 100)
- `withCount: true` on all responses

## Schema Rules

Follow the strapi-best-practices skill. Key rules:
1. Flat over deep — redesign if nesting > 2 levels
2. Reference over duplication — use relations for shared data
3. Shopify = product truth — Strapi is content-only
4. Delete must cascade cleanly — no orphaned data
5. No version suffixes — no `BannerV2`, `CardNew`
6. Schema changes require PR review from schema owner
