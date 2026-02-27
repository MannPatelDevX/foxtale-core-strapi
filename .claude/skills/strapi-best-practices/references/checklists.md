---

## Schema Change Workflow

### Adding a New Content Type

1. **Propose:** Open a schema proposal describing:
   - What it is and why it's needed
   - Which category (collection, single, component)
   - Fields, relations, and types
   - Cascade behavior for relations
   - Cache TTL
   - Expected API usage
2. **Review:** Schema owner reviews against best practices
3. **Implement:** Create in Strapi, run through PR checklist
4. **Test:** Verify in staging environment
5. **Document:** Add to schema documentation
6. **Deploy:** Merge and deploy

### Modifying an Existing Content Type

1. **Assess impact:** Which frontends (web, app) use this?
2. **Backward compatibility:** Can the change avoid breaking existing consumers?
3. **Migration plan:**
   - Adding a field: Safe, add with default value
   - Renaming a field: Create new → migrate data → update consumers → remove old
   - Removing a field: Verify no consumers → remove from consumers first → then remove
   - Changing a relation: Most dangerous — plan data migration carefully
4. **Coordinate deploy:** Schema and frontend changes must deploy together or be backward-compatible

### Deprecating a Field or Component

1. Add `@deprecated` in the field description in Strapi
2. Add to `DEPRECATED.md` with deprecation date and removal target
3. Update all consumers to stop using the field
4. After 2 sprint cycles with no usage, remove the field

---

## Governance & Maintenance

### Schema Owner Responsibilities

- Review all schema change PRs
- Maintain best practices doc
- Run quarterly schema audits
- Resolve schema design disputes

### Quarterly Schema Audit

1. **Unused content types:** Collection types with 0 entries? Remove them.
2. **Orphaned relations:** Run DB queries to find broken foreign keys.
3. **Component sprawl:** Components used in only one place? Consider inlining.
4. **Naming violations:** Scan for fields/components that don't follow conventions.
5. **Performance check:** Review slowest API endpoints, check for missing indexes.
6. **Cache hit rates:** Are Redis cache TTLs appropriate?

### Onboarding Checklist for New Developers

1. Read the best practices doc
2. Complete a small schema design exercise (reviewed by schema owner)
3. Shadow the schema owner on one PR review
4. Never push schema changes without PR approval
