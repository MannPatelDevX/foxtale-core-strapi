---
name: strapi-schema-from-ui
description: >
  Designs Strapi content types and components from product briefs, user queries, Figma MCP links, or Figma UI screenshots, strictly following Foxtale Strapi best practices. Use when translating UI/UX or feature requirements into Strapi schemas, optimizing component reuse, nesting, and structure.
---

# Strapi Schema from UI / Figma

This skill converts UI/UX context (queries, Figma MCP links, screenshots) into Strapi schemas for the Foxtale project.
It **must** follow `.claude/skills/strapi-best-practices/SKILL.md`.

Always assume Strapi is the Foxtale CMS instance described there.

## Inputs & Sources

The schema generator accepts **three types of input** (often combined):

- **Natural language query / brief**
  - Feature description, page description, or product requirement given as text.
- **Figma MCP link**
  - Structured access to Figma file(s), pages, and components.
  - Use it to inspect:
    - Screen names, component names
    - Text layers (titles, subtitles, body copy placeholders)
    - Repeated patterns (cards, lists, sections)
- **Figma UI screenshot**
  - Visual-only hint; infer structure from:
    - Section layout (hero, grid, carousel, FAQ, etc.)
    - Repeated cards or list items
    - CTAs, badges, tags, icons, image vs copy areas

When multiple inputs are provided, **treat the natural language query as the source of truth**, using Figma only to refine structure and spot reusable patterns.

## Mandatory Behavior

When using this skill, the agent **must**:

1. **Consult Strapi best practices**

   - Read and respect `.claude/skills/strapi-best-practices/SKILL.md`.
   - Enforce:
     - Max 2 levels of component nesting.
     - Clear naming (PascalCase for types/components, `snake_case` fields).
     - No Shopify data in Strapi (only `shopifyHandle` for product references).
     - Use relations instead of components when data should be independently queryable.

2. **Ask clarification questions when uncertain**

   - If any of these are unclear, **ask the user before finalizing schema**:
     - Is this a reusable section across multiple pages or specific to one page?
     - Does this data need its own API endpoint, or is it only embedded in a page?
     - Is this content global (e.g. nav, footer) or page-local?
     - Are differences needed between web and app for this block?
     - How many items are expected (fixed small list vs variable repeatable items)?
   - Questions should be **specific and minimal**, focusing on decisions that affect:
     - Collection Type vs Single Type vs Component vs Dynamic Zone.
     - Nesting depth and component boundaries.

3. **Reuse existing Strapi components and types when possible**

   - Before proposing a new component, **check for an existing equivalent** in the Foxtale schema.
   - Procedure:
     1. Look at `types/generated/contentTypes.d.ts` and `types/generated/components.d.ts`.
     2. Search for related names and shapes (e.g., `HeroBanner`, `SectionHeader`, `CtaButton`, `ExpectedResults`, `HowToUse`, `FaqSection`, `SeoMeta`).
     3. If an existing component fits the same purpose with minor acceptable variation, **reuse it** and, if needed, extend via:
        - Optional extra fields, or
        - Additional small, flat components referenced by relation or nesting (respecting depth limits).
     4. Only introduce a **new component** when:
        - No existing component matches the responsibility, AND
        - It is not better modeled as a collection type or inline fields.

4. **Optimize schema by reducing component count while respecting nesting rules**
   - Favor:
     - Inline scalar fields when a section is unique and simple.
     - Repeatable components when there is a variable-length list.
     - Shared components (`shared/*`) if pattern is cross-page.
   - Avoid:
     - God components (20+ fields).
     - Deep nesting (never exceed 2 levels).
   - When in doubt:
     - Prefer **fewer, well-scoped components** over many micro-components, as long as:
       - Each component has a single responsibility.
       - Field count stays within recommended ranges.

5. **Standard delivery channel field on all components**

   - Every Strapi **component** (existing or new) must include a standard enum field named `delivery_channels` with values:
     - `APP`
     - `WEB`
     - `BOTH`
     - `NONE`
   - This field:
     - Is used for platform-specific visibility/targeting decisions.
     - Must be documented in the component’s field list in the output.
   - When proposing updates to existing components, explicitly call out adding `delivery_channels` if it is missing.

## Workflow: From UI to Strapi Schema

Follow this workflow whenever the user asks for a schema from UI/UX:

### 1. Understand the feature and page(s)

- Summarize, in 2–4 bullet points:
  - **What** the user wants (e.g., Product detail page, Homepage hero, Campaign landing).
  - **Where** it lives (single page, multiple pages, global).
  - **What content changes most often** (copy vs layout vs products).

If this is ambiguous, ask 1–3 clarification questions before continuing.

### 2. Identify logical blocks / sections

- From the query + Figma:
  - List **visual/functional sections**, e.g.:
    - Hero with title, subtitle, image, CTA.
    - Product card grid.
    - Testimonials slider.
    - FAQ accordion.
    - Offer strip / promo banner.
- For each block, answer:
  - Is this **reusable** on other pages?
  - Is it **global** (nav, footer, global banner)?
  - Does it require **independent querying** (e.g. blog posts, products, offers)?

### 3. Decide schema building blocks

Apply the decision tree (see `Content Type Decision` in best-practices):

- **Needs own endpoint?**
  - YES → Collection Type or Single Type.
  - NO → Component or inline fields.
- **Reusable inside multiple types?**
  - YES → Component (likely in `shared` or `layout`).
  - NO → Inline fields on a page type.
- **Highly variable page layout?**
  - Use a Dynamic Zone with whitelisted components.

**Special rule for `page` types**

- When the query or brief describes an item whose type is **`page`** (e.g. “create a page for X”, “landing page for Y”), you must:
  - Model it as an entry in the existing **`page` collection type** (do **not** create a new collection/single type for each page).
  - Put all visual/content sections as items inside the **`blocks` dynamic zone** on `page`.
  - Order the `blocks` items to match the **section order in Figma** or, if only text is provided, the **order in the user’s query** (top‑to‑bottom reading order).
  - For each **visible section** in the Figma screenshot (or described section in the query), ensure there is a corresponding `blocks` entry:
    - If the section requires structured content, use an appropriate existing component or define a new one (respecting reuse and nesting rules).
    - If the section is **pure layout/positioning** with no content to manage in Strapi, use the shared “empty layout” component described below so that the section still has a positional placeholder in `blocks`.

Document for each block:

- Chosen structure (Collection Type, Single Type, Component, Dynamic Zone item).
- Rationale (1 short line).

### 4. Check existing components before creating new ones

For each candidate component/block:

- Inspect `types/generated/components.d.ts`:
  - Look for similar-purpose components by name and field shape.
  - If an existing component can cover 80–100% of the need:
    - **Reuse it**.
    - Note any minor gaps; handle them via:
      - Additional optional fields (if consistent with responsibility), or
      - Companion simple components.
- Only define a new component when:
  - No close match exists, and
  - Creating a new component is better than:
    - Inline fields, or
    - A collection type with relation.

### 5. Enforce nesting & size limits

For each component and dynamic zone:

- Ensure:
  - Nesting depth ≤ 2.
  - Component field counts fall within the recommended ranges:
    - Simple: 3–4 fields.
    - Medium: 5–8 fields.
    - Complex: 8–10 fields.
- If a block is becoming too large or deeply nested:
  - Split it into:
    - A main layout component, plus
    - One or more repeatable child components **at depth 2**.
  - Or convert deeply nested data into a collection type with relations.

### 6. Design for platform differences (web vs app)

When the UI implies platform-specific behavior:

- Prefer **shared content with toggles**:
  - Use or reference `shared/PlatformToggle` where relevant.
- For divergent assets or links:
  - Use specific fields (e.g., `desktopImage` / `mobileImage`, `web_cta_link` / `app_cta_link`).
- Never create separate `Web*` and `App*` content types.

If platform behavior is unclear from the UI, ask the user **one direct question**:

- “Should this block be shared for web & app, or do you expect different content/visibility?”

### 7. Common empty layout component

- To represent pure layout/positioning where Strapi does **not** need to store additional data:
  - Use a single shared layout component (for example, `layout/EmptySection`).
  - This component should:
    - Contain only one field: `title` (string), used just to label the section for editors.
    - Still include the standard `delivery_channels` enum field as defined above.
  - Use this component in `blocks` when:
    - The UI shows a section that is layout-only or fully derived from other systems, and
    - A placeholder is required so the section’s position/order is preserved in the page.

## Output Format

When responding with a proposed schema, use this structure:

- **1. Overview**

  - Short explanation of:
    - New or updated collection types / single types.
    - New or reused components.
    - Any dynamic zones and their allowed components.

- **2. Types & Components**

  - For each **Collection Type** or **Single Type**:
    - Name, description, and whether it is new or existing.
    - Fields with types and brief descriptions.
    - Relations with direction and cascade expectations.
    - Dynamic zones (if any) and allowed components.
  - For each **Component**:
    - Category and name (e.g., `layout/HeroBanner`).
    - Field list (name, type, purpose, optional/required).
    - Nesting (which simple components it contains, if any).
    - Whether it is **reused** or **new**.

- **3. Best-Practices Checklist**
  - Explicitly verify:
    - Nesting depth ≤ 2.
    - No Shopify data duplicated (only handles).
    - Components under 10 fields and single-responsibility.
    - Relation cascade behavior is at least described at a high level.

## Examples (High-Level)

### Example A: Homepage hero from Figma

- Input: Figma screen showing:
  - Large hero with title, subtitle, background image, primary & secondary CTA.
  - Section appears on multiple marketing pages.
- Result:
  - Reuse `layout/HeroBanner` if present; otherwise, design a `layout/HeroBanner` component with:
    - `hero_title`, `hero_subtitle`, `desktopImage`, `mobileImage`, `primary_cta`, `secondary_cta`, optional `platform_visibility`.
  - Attach to `Homepage` single type as a field or inside a `contentSections` dynamic zone.

### Example B: Product detail sections

- Input: Query + Figma showing:
  - Product details page with “Expected Results”, “How to Use”, “Ingredients”, and FAQ.
- Result:
  - Reuse product components (`product/ExpectedResults`, `product/HowToUse`, `product/IngredientList`, `shared/FaqSection`) if they already exist.
  - Ensure `Product` collection type references them via fields or dynamic zone, without duplicating Shopify product data.

---

Use this skill whenever translating UI mockups, Figma links, or feature briefs into Strapi schema for Foxtale, ensuring close adherence to `.claude/skills/strapi-best-practices/SKILL.md` and aggressive reuse of existing components.
