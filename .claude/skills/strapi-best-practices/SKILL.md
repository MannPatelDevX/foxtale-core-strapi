---
name: strapi-best-practices
description: >
  Enforces Foxtale's Strapi CMS schema design rules, naming conventions, and API best practices.
  Use when: (1) Creating or modifying Strapi content types, components, or relations,
  (2) Reviewing Strapi schema PRs, (3) Designing new collection types, single types, or components,
  (4) Writing Strapi API queries or custom controllers, (5) Deciding between collection types vs
  components vs dynamic zones, (6) Handling platform-specific content (web vs app),
  (7) Any question about Strapi schema patterns for the Foxtale e-commerce project.
  Triggers: "strapi", "content type", "schema", "component", "collection type", "single type",
  "dynamic zone", "populate", "relation", "Shopify handle", "platform toggle".
---

# Strapi Best Practices — Foxtale

## Golden Rules (Non-Negotiable)

1. **Flat Over Deep** — Max 2 levels of component nesting. Redesign if deeper.
2. **Reference Over Duplication** — Use relations to link shared data. Never duplicate entries.
3. **Shopify = Product Truth** — Strapi stores content only (descriptions, how-to-use, ingredients). Never store price, inventory, or variants in Strapi.
4. **One Strapi, One Schema** — One instance serves web and app. Platform differences via fields, not separate instances.
5. **Name It Clearly** — If you can't explain a content type in one sentence, split it.
6. **Delete Must Cascade Cleanly** — Before creating any relation, answer: "What happens on delete?" If the answer is broken UI or orphaned data, redesign.
7. **Schema Changes Need Review** — No schema changes without PR review from schema owner.

## Naming Conventions

| Element          | Format                             | Examples                                       | Bad Examples                 |
| ---------------- | ---------------------------------- | ---------------------------------------------- | ---------------------------- |
| Collection Types | `PascalCase`, singular             | `Product`, `BlogPost`, `Freebie`               | `Cards`, `product_page_data` |
| Single Types     | `PascalCase`, descriptive          | `Homepage`, `GlobalSeo`, `FooterConfig`        | `home`, `SEO`, `nav`         |
| Components       | `PascalCase` in lowercase category | `product/ExpectedResults`, `layout/HeroBanner` | `comp1`, `card-v2`           |
| Fields           | `snake_case`                       | `hero_title`, `shopify_handle`                 | `img`, `data`, `field1`      |
| Booleans         | `is`/`has` prefix                  | `isVisible`, `hasFreebies`                     | `active`, `visible`          |
| Media fields     | Suffix with type                   | `heroImage`, `thumbnailIcon`                   | `img`, `pic`                 |
| Relations        | Named after related type           | `freebies`, `author`, `tags`                   | `rel1`, `data`               |
| Date fields      | `At`/`Date` suffix                 | `publishedAt`, `expiryDate`                    | `date1`                      |

**Never version in names.** No `BannerV2`, `ProductCardNew`, `old_hero`.

## Content Type Decision

```
Does it need its own API endpoint?
├── YES → Collection Type or Single Type
│   ├── Multiple entries? → Collection Type
│   └── Only one? → Single Type
└── NO
    ├── Reused inside multiple content types? → Component
    ├── Used only once inside one type? → Inline fields
    └── Varies per section on a page? → Component inside Dynamic Zone
```

**Critical:** Don't make a component when you need a collection. If data needs to be independently queried, reused across types, or have its own lifecycle — it's a Collection Type.

## Component Design Rules

- **Single Responsibility** — One component, one job. Split at 8-10 fields.
- **Categorize** — Every component belongs to a category:

| Category     | Purpose                | Examples                                        |
| ------------ | ---------------------- | ----------------------------------------------- |
| `shared`     | Cross-type reusables   | `SeoMeta`, `CtaButton`, `PlatformToggle`        |
| `product`    | Product content blocks | `ExpectedResults`, `HowToUse`, `IngredientList` |
| `layout`     | Page structure blocks  | `HeroBanner`, `SectionHeader`, `TwoColumnBlock` |
| `marketing`  | Campaign/promo blocks  | `OfferBanner`, `CountdownTimer`, `PromoStrip`   |
| `blog`       | Blog content blocks    | `AuthorBio`, `ReadingTime`                      |
| `navigation` | Nav/menu blocks        | `MenuItem`, `MegaMenuSection`                   |

- **Size limits:**

| Type                     | Max Fields | Max Nested |
| ------------------------ | ---------- | ---------- |
| Simple (CtaButton)       | 3-4        | 0          |
| Medium (HeroBanner)      | 5-8        | 1          |
| Complex (ProductSection) | 8-10       | 2          |
| Dynamic Zone item        | 6-8        | 1          |

- **Use repeatable components** when item count is variable and items share the same structure.

## Nesting Rules

**Maximum depth: 2 levels.**

```
OK  (depth 1): Collection Type → Component
OK  (depth 2): Collection Type → Component → Simple Component
BAD (depth 3+): Collection Type → Component → Component → Component
```

To flatten deep nesting, extract the inner component as a Collection Type and use a relation instead.

## Relationship Design

| Type              | Use When                       | Example                               |
| ----------------- | ------------------------------ | ------------------------------------- |
| One-to-One        | Exactly one of each            | `Product` <> `ProductSeo`             |
| One-to-Many       | Parent has many children       | `BlogPost` → many `Comments`          |
| Many-to-Many      | Both sides have multiple       | `Product` <> many `Tags`              |
| One-Way (morphTo) | Component refs different types | `CtaButton` → `BlogPost` or `Product` |

**Rules:**

- Always define both sides of the relation (inverse).
- Define cascade behavior BEFORE creating: cascade delete, set null, or restrict.
- Test deletion: no orphaned data allowed.
- Reference Shopify products by `shopifyHandle` — never duplicate Shopify data.
- Avoid polymorphic (`morphTo`) relations unless absolutely necessary.

## Dynamic Zones

**Use when:** Page content varies significantly between entries, marketing needs A/B testing of sections.
**Don't use when:** Structure is fixed, only 1-2 component types, or single repeating type (use repeatable component).

- Max 8-10 components per zone
- Name zones by purpose: `contentSections`, `heroArea` (not `dynamicZone`, `zone1`)
- Each component in a zone must be self-contained
- Document available components for each zone

## Media & Assets

- Content images go through Strapi Media Library
- **Product images come from Shopify** — never upload to Strapi
- Add dimension hints in field descriptions (e.g., "Upload at 1920x600px")
- Use separate `desktopImage`/`mobileImage` fields when ratios differ

## Platform-Specific Content (Web vs App)

**Shared by default, split only when necessary.**

**Pattern 1: PlatformToggle** (for visibility)

```
Component: shared/PlatformToggle
├── showOnWeb: Boolean (default: true)
└── showOnApp: Boolean (default: true)
```

Filter via: `?filters[platformVisibility][showOnWeb]=true`

**Pattern 2: Platform-Specific Fields** (for different content)
Use `desktopImage`/`mobileImage`, `webCtaLink`/`appCtaLink`.

**Pattern 3: Platform Enum** (rare, <10% of cases)
Add `platform: Enum ["web", "app", "both"]` when content is radically different.

**Never create separate content types for web vs app** (no `WebBanner`/`AppBanner`).

## API & Performance

1. **Never `populate=*` in production.** Always specify exact fields and relations.
2. **Use `fields` parameter** to limit response size.
3. **Paginate all list endpoints:** `?pagination[page]=1&pagination[pageSize]=10`
4. **Index frequently queried fields:** `shopifyHandle`, `slug`, `platform`, `publishedAt`.
5. **Cache strategy:**

| Content Type         | Cache TTL |
| -------------------- | --------- |
| Banners, Hero        | 5-15 min  |
| Blog posts           | 30-60 min |
| Product descriptions | 15-30 min |
| Navigation, Footer   | 1-4 hours |

6. **Custom controllers** for complex multi-type queries — don't make 5 separate API calls from frontend.

```javascript
// src/api/product-page/controllers/product-page.js
module.exports = {
  async findByHandle(ctx) {
    const { handle } = ctx.params;
    const product = await strapi.entityService.findMany(
      "api::product.product",
      {
        filters: { shopifyHandle: handle },
        populate: {
          expectedResults: true,
          howToUse: true,
          faqSection: { populate: { items: true } },
          seoMeta: true,
        },
      },
    );
    return product;
  },
};
```

## Anti-Patterns

| Anti-Pattern                    | Fix                                              |
| ------------------------------- | ------------------------------------------------ |
| God Component (20+ fields)      | Split into focused components + Dynamic Zones    |
| Duplicating Shopify data        | Store only `shopifyHandle`, resolve at runtime   |
| Version suffixes (`BannerV2`)   | One type, deprecate old fields via migration     |
| Deep nesting (3+ levels)        | Flatten with relations to Collection Types       |
| Separate types for web/app      | One type with `PlatformToggle`                   |
| Components for independent data | Use Collection Type + relation                   |
| `populate=*` in production      | Specify exact fields and populations             |
| Booleans without defaults       | Always set default values                        |
| RichText for structured data    | Use repeatable components with structured fields |
| Relations without cascade plan  | Document cascade behavior before implementation  |

## Reference Files

<!-- - **[references/schemas.md](references/schemas.md)** — Complete Foxtale schema patterns: Product, Homepage, Banner, Offers, Blog, and Shared Components Library. Read when creating new content types or checking existing schema patterns. -->

- **[references/checklists.md](references/checklists.md)** — PR review checklist, schema change workflow, deprecation process, governance rules, and quarterly audit guide. Read when reviewing PRs or planning schema changes.
  [12:13 PM]# PR Checklist & Workflows

## Table of Contents

1. [PR Checklist](#pr-checklist)
2. [Schema Change Workflow](#schema-change-workflow)
3. [Governance & Maintenance](#governance--maintenance)

---

## PR Checklist

Every PR that modifies Strapi schema must satisfy ALL of the following:

### Naming

- [ ] Collection/Single types are `PascalCase`, singular
- [ ] Components are `PascalCase`, in a named category
- [ ] Fields are `snake_case`
- [ ] Boolean fields prefixed with `is` or `has`
- [ ] No version suffixes (`V2`, `New`, `Final`)
- [ ] Names are descriptive and self-explanatory

### Structure

- [ ] Nesting depth <= 2 levels
- [ ] Components have <= 10 fields
- [ ] No Shopify data duplicated in Strapi (price, inventory, variants)
- [ ] Uses relation instead of embedded component for independently queryable data
- [ ] Dynamic Zones have <= 10 component options
- [ ] Dynamic Zone components are self-contained

### Relations

- [ ] Both sides of the relation are defined
- [ ] Cascade behavior is documented (delete, set null, or restrict)
- [ ] Deletion tested: "What happens if I delete this entry?"
- [ ] No orphaned data possible after deletion
- [ ] `shopifyHandle` used for product references (not duplicated data)

### Platform

- [ ] Uses `PlatformToggle` for web/app visibility (not separate content types)
- [ ] Platform-specific fields are clearly named (`desktopImage`, `mobileImage`)
- [ ] Content is shared by default, split only when necessary

### API Performance

- [ ] No `populate=*` in any frontend code
- [ ] Fields limited with `fields` parameter in API calls
- [ ] Frequently queried fields are indexed (`slug`, `shopifyHandle`, `platform`)
- [ ] Cache TTL defined for new content types
- [ ] Pagination used for list endpoints

### Documentation

- [ ] New content type or component has a one-line description in the schema docs
- [ ] Relation cascade behavior documented
- [ ] If Dynamic Zone, available components are listed
- [ ] Image dimension requirements noted in field descriptions

### Testing

- [ ] Created a test entry in Strapi admin, verified all fields work
- [ ] Tested deletion of related entries — no orphaned data
- [ ] API response verified — correct data shape, no over-fetching
- [ ] Both web and app API calls tested (platform filtering works)
