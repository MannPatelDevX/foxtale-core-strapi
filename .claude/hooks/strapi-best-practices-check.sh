#!/usr/bin/env bash
# =============================================================================
# Strapi Best Practices Pre-Commit Hook
# =============================================================================
# Validates all staged changes against Foxtale's Strapi best practices.
# If ANY violation is found, the commit is BLOCKED and a detailed report
# is printed showing exactly what is wrong, in which file, and why.
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

VIOLATIONS=0
REPORT=""

# ─── Helper: add a violation to the report ───────────────────────────────────
add_violation() {
  local file="$1"
  local rule="$2"
  local detail="$3"
  VIOLATIONS=$((VIOLATIONS + 1))
  REPORT+="${RED}  ✖ [${rule}]${NC} ${CYAN}${file}${NC}\n"
  REPORT+="    ${detail}\n\n"
}

# ─── Get list of staged files ────────────────────────────────────────────────
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || true)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

# =============================================================================
# SECTION 1: SCHEMA FILE CHECKS (content-types & components JSON schemas)
# =============================================================================

# Gather staged Strapi schema JSON files
SCHEMA_FILES=""
COMPONENT_SCHEMA_FILES=""
CONTENT_TYPE_SCHEMA_FILES=""

for f in $STAGED_FILES; do
  if echo "$f" | grep -qE 'src/api/.*/content-types/.*/schema\.json$'; then
    SCHEMA_FILES="$SCHEMA_FILES $f"
    CONTENT_TYPE_SCHEMA_FILES="$CONTENT_TYPE_SCHEMA_FILES $f"
  fi
  if echo "$f" | grep -qE 'src/components/.*/.*\.json$'; then
    SCHEMA_FILES="$SCHEMA_FILES $f"
    COMPONENT_SCHEMA_FILES="$COMPONENT_SCHEMA_FILES $f"
  fi
done

# ─── 1.1 Content Type Naming: Must be PascalCase, singular ──────────────────
for f in $CONTENT_TYPE_SCHEMA_FILES; do
  if [ ! -f "$f" ]; then continue; fi

  # Extract the info.singularName and info.displayName from schema
  singular_name=$(python3 -c "
import json, sys
try:
    d = json.load(open('$f'))
    print(d.get('info', {}).get('singularName', ''))
except: pass
" 2>/dev/null || true)

  display_name=$(python3 -c "
import json, sys
try:
    d = json.load(open('$f'))
    print(d.get('info', {}).get('displayName', ''))
except: pass
" 2>/dev/null || true)

  # Check displayName is PascalCase (starts with uppercase, no underscores/hyphens)
  if [ -n "$display_name" ]; then
    if ! echo "$display_name" | grep -qE '^[A-Z][a-zA-Z0-9]*( [A-Z][a-zA-Z0-9]*)*$'; then
      # Allow PascalCase with spaces between words (Strapi display names) or strict PascalCase
      if ! echo "$display_name" | grep -qE '^[A-Z][a-zA-Z0-9]+$'; then
        add_violation "$f" "NAMING: Content Type DisplayName" \
          "displayName '${display_name}' must be PascalCase (e.g., 'BlogPost', 'Product'). No underscores, hyphens, or lowercase start."
      fi
    fi
  fi

  # Check singularName is lowercase with hyphens (Strapi convention for API id)
  # but must NOT contain version suffixes
  if [ -n "$singular_name" ]; then
    if echo "$singular_name" | grep -qiE '(v[0-9]+|new|old|final|latest|draft[0-9])'; then
      add_violation "$f" "NAMING: No Version Suffixes" \
        "singularName '${singular_name}' contains a version suffix. Never use V2, New, Old, Final in names."
    fi
  fi

  # Check displayName for version suffixes
  if [ -n "$display_name" ]; then
    if echo "$display_name" | grep -qiE '(V[0-9]+|New$|Old$|Final$|Latest$|Draft[0-9])'; then
      add_violation "$f" "NAMING: No Version Suffixes" \
        "displayName '${display_name}' contains a version suffix (V2, New, Old, Final). Use one type and deprecate old fields via migration."
    fi
  fi
done

# ─── 1.2 Component Naming: PascalCase in lowercase category ─────────────────
for f in $COMPONENT_SCHEMA_FILES; do
  if [ ! -f "$f" ]; then continue; fi

  # Extract category from path: src/components/<category>/<ComponentName>.json
  category=$(echo "$f" | sed -n 's|src/components/\([^/]*\)/.*|\1|p')
  comp_filename=$(basename "$f" .json)

  # Category must be lowercase
  if [ -n "$category" ]; then
    if echo "$category" | grep -qE '[A-Z]'; then
      add_violation "$f" "NAMING: Component Category" \
        "Component category '${category}' must be lowercase. Valid categories: shared, product, layout, marketing, blog, navigation."
    fi

    # Validate category is one of the allowed ones
    if ! echo "$category" | grep -qE '^(shared|product|layout|marketing|blog|navigation)$'; then
      add_violation "$f" "NAMING: Component Category" \
        "Component category '${category}' is not in the allowed list: shared, product, layout, marketing, blog, navigation."
    fi
  fi

  # Component filename should be PascalCase
  if [ -n "$comp_filename" ]; then
    if ! echo "$comp_filename" | grep -qE '^[A-Z][a-zA-Z0-9]+$'; then
      add_violation "$f" "NAMING: Component Name" \
        "Component name '${comp_filename}' must be PascalCase (e.g., 'HeroBanner', 'CtaButton'). No underscores, hyphens, or lowercase start."
    fi

    # Check for version suffixes in component names
    if echo "$comp_filename" | grep -qiE '(V[0-9]+|New$|Old$|Final$|Latest$)'; then
      add_violation "$f" "NAMING: No Version Suffixes" \
        "Component name '${comp_filename}' contains a version suffix. Never use V2, New, Old, Final in names."
    fi
  fi
done

# ─── 1.3 Field Naming Checks (all schema files) ─────────────────────────────
for f in $SCHEMA_FILES; do
  if [ ! -f "$f" ]; then continue; fi

  # Extract field names and their types using Python
  python3 -c "
import json, sys

try:
    d = json.load(open('$f'))
except:
    sys.exit(0)

attrs = d.get('attributes', {})
for field_name, field_def in attrs.items():
    ftype = ''
    if isinstance(field_def, dict):
        ftype = field_def.get('type', '')

    # Print field_name and type for bash to process
    print(f'{field_name}||{ftype}')
" 2>/dev/null | while IFS='||' read -r field_name field_type; do
    if [ -z "$field_name" ]; then continue; fi

    # Skip Strapi internal fields
    if echo "$field_name" | grep -qE '^(createdAt|updatedAt|publishedAt|createdBy|updatedBy|localizations|locale)$'; then
      continue
    fi

    # Fields should be camelCase or snake_case (Strapi uses camelCase by default)
    # They must NOT be PascalCase and must not start with uppercase
    if echo "$field_name" | grep -qE '^[A-Z]'; then
      add_violation "$f" "NAMING: Field Name" \
        "Field '${field_name}' starts with uppercase. Fields must be camelCase (e.g., 'heroTitle', 'shopifyHandle')."
    fi

    # Check for meaningless field names
    if echo "$field_name" | grep -qE '^(img|pic|data|field[0-9]+|rel[0-9]+|comp[0-9]+|val|tmp|temp|x|y|z|a|b|c)$'; then
      add_violation "$f" "NAMING: Descriptive Field Name" \
        "Field '${field_name}' is not descriptive. Use meaningful names (e.g., 'heroImage' not 'img', 'productData' not 'data')."
    fi

    # Boolean fields must have is/has prefix
    if [ "$field_type" = "boolean" ]; then
      if ! echo "$field_name" | grep -qE '^(is|has)[A-Z]'; then
        add_violation "$f" "NAMING: Boolean Prefix" \
          "Boolean field '${field_name}' must start with 'is' or 'has' (e.g., 'isVisible', 'hasFreebies'). Current name violates the convention."
      fi
    fi

    # Date fields should have At/Date suffix
    if [ "$field_type" = "date" ] || [ "$field_type" = "datetime" ]; then
      if ! echo "$field_name" | grep -qiE '(At|Date|Time)$'; then
        add_violation "$f" "NAMING: Date Field Suffix" \
          "Date field '${field_name}' should have an 'At' or 'Date' suffix (e.g., 'publishedAt', 'expiryDate')."
      fi
    fi
  done
done

# ─── 1.4 Component Field Count (max 10 fields) ─────────────────────────────
for f in $COMPONENT_SCHEMA_FILES; do
  if [ ! -f "$f" ]; then continue; fi

  field_count=$(python3 -c "
import json
try:
    d = json.load(open('$f'))
    attrs = d.get('attributes', {})
    print(len(attrs))
except:
    print(0)
" 2>/dev/null || echo "0")

  if [ "$field_count" -gt 10 ]; then
    add_violation "$f" "STRUCTURE: Component Max Fields" \
      "Component has ${field_count} fields (max allowed: 10). Split into focused components. God components (20+ fields) are an anti-pattern."
  fi
done

# ─── 1.5 Nesting Depth Check (max 2 levels) ─────────────────────────────────
for f in $SCHEMA_FILES; do
  if [ ! -f "$f" ]; then continue; fi

  # Check if any field is a component and if that component itself contains components
  python3 -c "
import json, os, sys, glob

try:
    d = json.load(open('$f'))
except:
    sys.exit(0)

attrs = d.get('attributes', {})

def get_component_depth(comp_uid, visited=None, depth=0):
    if visited is None:
        visited = set()
    if comp_uid in visited:
        return depth
    visited.add(comp_uid)

    # Convert uid like 'shared.cta-button' to path 'src/components/shared/CtaButton.json'
    # This is approximate — we check for json files matching the pattern
    parts = comp_uid.split('.')
    if len(parts) != 2:
        return depth

    category = parts[0]
    # Try to find the component file
    pattern = f'src/components/{category}/*.json'
    for comp_file in glob.glob(pattern):
        try:
            comp_data = json.load(open(comp_file))
            comp_attrs = comp_data.get('attributes', {})
            for fname, fdef in comp_attrs.items():
                if isinstance(fdef, dict):
                    if fdef.get('type') in ('component', 'dynamiczone'):
                        child_comp = fdef.get('component', '')
                        if child_comp:
                            child_depth = get_component_depth(child_comp, visited.copy(), depth + 1)
                            if child_depth > depth:
                                return child_depth
        except:
            pass
    return depth

for field_name, field_def in attrs.items():
    if not isinstance(field_def, dict):
        continue
    if field_def.get('type') == 'component':
        comp_uid = field_def.get('component', '')
        if comp_uid:
            depth = get_component_depth(comp_uid, set(), 1)
            if depth > 2:
                print(f'{field_name}:{comp_uid}:{depth}')
" 2>/dev/null | while IFS=':' read -r field_name comp_uid depth; do
    if [ -n "$field_name" ]; then
      add_violation "$f" "STRUCTURE: Nesting Depth" \
        "Field '${field_name}' (component: ${comp_uid}) has nesting depth ${depth} (max: 2). Flatten by extracting inner components as Collection Types with relations."
    fi
  done
done

# ─── 1.6 Dynamic Zone Checks ────────────────────────────────────────────────
for f in $SCHEMA_FILES; do
  if [ ! -f "$f" ]; then continue; fi

  python3 -c "
import json, sys

try:
    d = json.load(open('$f'))
except:
    sys.exit(0)

attrs = d.get('attributes', {})
for field_name, field_def in attrs.items():
    if not isinstance(field_def, dict):
        continue
    if field_def.get('type') == 'dynamiczone':
        components = field_def.get('components', [])
        count = len(components)

        # Check zone naming
        if field_name in ('dynamicZone', 'zone1', 'zone2', 'dz', 'blocks1'):
            print(f'NAME:{field_name}:{count}')

        # Check max 10 components per zone
        if count > 10:
            print(f'COUNT:{field_name}:{count}')
" 2>/dev/null | while IFS=':' read -r check_type field_name count; do
    if [ "$check_type" = "NAME" ]; then
      add_violation "$f" "STRUCTURE: Dynamic Zone Naming" \
        "Dynamic Zone '${field_name}' has a non-descriptive name. Name zones by purpose: 'contentSections', 'heroArea' (not 'dynamicZone', 'zone1')."
    fi
    if [ "$check_type" = "COUNT" ]; then
      add_violation "$f" "STRUCTURE: Dynamic Zone Max Components" \
        "Dynamic Zone '${field_name}' has ${count} components (max: 10). Reduce the number of allowed component types."
    fi
  done
done

# ─── 1.7 Shopify Data Duplication Check ─────────────────────────────────────
for f in $SCHEMA_FILES; do
  if [ ! -f "$f" ]; then continue; fi

  python3 -c "
import json, sys

try:
    d = json.load(open('$f'))
except:
    sys.exit(0)

attrs = d.get('attributes', {})
shopify_forbidden = ['price', 'inventory', 'stock', 'variant', 'variants', 'sku',
                     'compareAtPrice', 'compare_at_price', 'inventoryQuantity',
                     'inventory_quantity', 'barcode', 'weight', 'productType',
                     'product_type', 'vendor']

for field_name, field_def in attrs.items():
    lower_name = field_name.lower()
    for forbidden in shopify_forbidden:
        if forbidden.lower() == lower_name or forbidden.lower() in lower_name:
            print(f'{field_name}:{forbidden}')
            break
" 2>/dev/null | while IFS=':' read -r field_name forbidden; do
    if [ -n "$field_name" ]; then
      add_violation "$f" "SHOPIFY: No Data Duplication" \
        "Field '${field_name}' appears to store Shopify product data ('${forbidden}'). Strapi must NOT store price, inventory, variants, SKU, or other Shopify-managed data. Use 'shopifyHandle' to reference products."
    fi
  done
done

# ─── 1.8 Relation Checks ────────────────────────────────────────────────────
for f in $SCHEMA_FILES; do
  if [ ! -f "$f" ]; then continue; fi

  python3 -c "
import json, sys

try:
    d = json.load(open('$f'))
except:
    sys.exit(0)

attrs = d.get('attributes', {})
for field_name, field_def in attrs.items():
    if not isinstance(field_def, dict):
        continue
    if field_def.get('type') == 'relation':
        relation = field_def.get('relation', '')
        target = field_def.get('target', '')
        inversedBy = field_def.get('inversedBy', '')
        mappedBy = field_def.get('mappedBy', '')

        # Check: relation should have inversedBy or mappedBy (both sides defined)
        if not inversedBy and not mappedBy:
            # One-way relations (oneToOne without inverse) are allowed but should be flagged
            if relation in ('oneToOne', 'oneToMany', 'manyToMany'):
                print(f'INVERSE:{field_name}:{relation}:{target}')

        # Check for meaningless relation names
        if field_name in ('rel1', 'rel2', 'data', 'ref', 'link', 'relation'):
            print(f'RELNAME:{field_name}:{target}')

        # Check for morphTo (should be rare)
        if 'morph' in relation.lower():
            print(f'MORPH:{field_name}:{relation}:{target}')
" 2>/dev/null | while IFS=':' read -r check_type field_name relation target; do
    if [ "$check_type" = "INVERSE" ]; then
      add_violation "$f" "RELATION: Define Both Sides" \
        "Relation '${field_name}' (${relation} → ${target}) has no inversedBy/mappedBy. Always define both sides of the relation to ensure data integrity."
    fi
    if [ "$check_type" = "RELNAME" ]; then
      add_violation "$f" "RELATION: Descriptive Name" \
        "Relation '${field_name}' is not descriptive. Name relations after the related type (e.g., 'author', 'tags', 'freebies')."
    fi
    if [ "$check_type" = "MORPH" ]; then
      add_violation "$f" "RELATION: Avoid Polymorphic" \
        "Relation '${field_name}' uses polymorphic relation '${relation}'. Avoid morphTo relations unless absolutely necessary."
    fi
  done
done

# =============================================================================
# SECTION 2: SOURCE CODE CHECKS (JS/TS files)
# =============================================================================

# Gather staged JS/TS files
CODE_FILES=""
for f in $STAGED_FILES; do
  if echo "$f" | grep -qE '\.(js|ts|jsx|tsx)$'; then
    CODE_FILES="$CODE_FILES $f"
  fi
done

# ─── 2.1 No populate=* in production code ───────────────────────────────────
for f in $CODE_FILES; do
  if [ ! -f "$f" ]; then continue; fi

  # Check for populate: '*' or populate=* patterns
  line_nums=$(grep -nE "(populate\s*[:=]\s*['\"][*]['\"]|populate\s*[:=]\s*['\"]\\*['\"]|\bpopulate:\s*['\*]|populate=\*)" "$f" 2>/dev/null | head -20 || true)

  if [ -n "$line_nums" ]; then
    while IFS= read -r line; do
      line_no=$(echo "$line" | cut -d: -f1)
      line_content=$(echo "$line" | cut -d: -f2-)
      add_violation "$f:${line_no}" "API: No populate=*" \
        "Found 'populate=*' or 'populate: \"*\"'. Never use populate=* in production. Always specify exact fields and relations to populate. Line: ${line_content}"
    done <<< "$line_nums"
  fi
done

# ─── 2.2 Check for missing pagination in API calls ──────────────────────────
for f in $CODE_FILES; do
  if [ ! -f "$f" ]; then continue; fi

  # Look for findMany calls without pagination
  python3 -c "
import re, sys

try:
    content = open('$f').read()
except:
    sys.exit(0)

# Find findMany calls
matches = list(re.finditer(r'\.findMany\s*\(', content))
for m in matches:
    # Get surrounding context (next 500 chars)
    start = m.start()
    end = min(start + 500, len(content))
    context = content[start:end]

    # Check if pagination is specified
    if 'pagination' not in context and 'page' not in context and 'pageSize' not in context and 'limit' not in context:
        line_no = content[:start].count('\n') + 1
        print(f'{line_no}')
" 2>/dev/null | while read -r line_no; do
    if [ -n "$line_no" ]; then
      add_violation "$f:${line_no}" "API: Pagination Required" \
        "findMany() call without pagination. All list endpoints must use pagination: { page: 1, pageSize: 25 }. Default max is 100."
    fi
  done
done

# ─── 2.3 Check for missing fields parameter in API calls ────────────────────
for f in $CODE_FILES; do
  if [ ! -f "$f" ]; then continue; fi

  python3 -c "
import re, sys

try:
    content = open('$f').read()
except:
    sys.exit(0)

# Find entityService.findMany or entityService.findOne calls
patterns = [r'entityService\.(findMany|findOne)\s*\(']
for pat in patterns:
    for m in re.finditer(pat, content):
        start = m.start()
        end = min(start + 500, len(content))
        context = content[start:end]

        # Check if 'fields' parameter is specified
        if 'fields' not in context:
            line_no = content[:start].count('\n') + 1
            print(f'{line_no}:{m.group(1)}')
" 2>/dev/null | while IFS=':' read -r line_no call_type; do
    if [ -n "$line_no" ]; then
      add_violation "$f:${line_no}" "API: Specify Fields" \
        "entityService.${call_type}() without 'fields' parameter. Use the 'fields' parameter to limit response size and avoid over-fetching."
    fi
  done
done

# ─── 2.4 Check for separate Web/App content type patterns ───────────────────
for f in $SCHEMA_FILES $CODE_FILES; do
  if [ ! -f "$f" ]; then continue; fi

  # Check for Web*/App* duplicate pattern
  if grep -qiE '(WebBanner|AppBanner|WebHero|AppHero|WebCard|AppCard|WebPage|AppPage|web_banner|app_banner)' "$f" 2>/dev/null; then
    add_violation "$f" "PLATFORM: No Separate Web/App Types" \
      "Found separate Web/App content type pattern. Never create separate types for web vs app (no 'WebBanner'/'AppBanner'). Use PlatformToggle component for visibility."
  fi
done

# ─── 2.5 Check for boolean fields without defaults ──────────────────────────
for f in $SCHEMA_FILES; do
  if [ ! -f "$f" ]; then continue; fi

  python3 -c "
import json, sys

try:
    d = json.load(open('$f'))
except:
    sys.exit(0)

attrs = d.get('attributes', {})
for field_name, field_def in attrs.items():
    if not isinstance(field_def, dict):
        continue
    if field_def.get('type') == 'boolean':
        has_default = 'default' in field_def
        if not has_default:
            print(field_name)
" 2>/dev/null | while read -r field_name; do
    if [ -n "$field_name" ]; then
      add_violation "$f" "ANTI-PATTERN: Boolean Without Default" \
        "Boolean field '${field_name}' has no default value. Always set default values for boolean fields (e.g., \"default\": true or \"default\": false)."
    fi
  done
done

# ─── 2.6 Check for RichText used for structured data ────────────────────────
for f in $SCHEMA_FILES; do
  if [ ! -f "$f" ]; then continue; fi

  python3 -c "
import json, sys

try:
    d = json.load(open('$f'))
except:
    sys.exit(0)

attrs = d.get('attributes', {})
richtext_fields = []
for field_name, field_def in attrs.items():
    if not isinstance(field_def, dict):
        continue
    if field_def.get('type') == 'richtext':
        richtext_fields.append(field_name)

# Warn if more than 2 richtext fields — likely misuse
if len(richtext_fields) > 2:
    for fn in richtext_fields:
        print(fn)
" 2>/dev/null | while read -r field_name; do
    if [ -n "$field_name" ]; then
      add_violation "$f" "ANTI-PATTERN: RichText Overuse" \
        "Multiple RichText fields found (including '${field_name}'). If data is structured (FAQs, steps, lists), use repeatable components with structured fields instead of RichText."
    fi
  done
done

# =============================================================================
# SECTION 3: CONTENT TYPE FILE STRUCTURE CHECKS
# =============================================================================

# ─── 3.1 Check for missing delivery_channels in components ──────────────────
for f in $COMPONENT_SCHEMA_FILES; do
  if [ ! -f "$f" ]; then continue; fi

  has_delivery_channels=$(python3 -c "
import json
try:
    d = json.load(open('$f'))
    attrs = d.get('attributes', {})
    print('yes' if 'delivery_channels' in attrs else 'no')
except:
    print('no')
" 2>/dev/null || echo "no")

  if [ "$has_delivery_channels" = "no" ]; then
    add_violation "$f" "COMPONENT: Missing delivery_channels" \
      "Component is missing the mandatory 'delivery_channels' enum field (values: APP, WEB, BOTH, NONE). Every component must include this field for platform-specific visibility."
  fi
done

# =============================================================================
# FINAL REPORT
# =============================================================================

REPO_ROOT=$(git rev-parse --show-toplevel)
REPORT_DIR="${REPO_ROOT}/.claude/hooks/reports"
mkdir -p "$REPORT_DIR"
REPORT_FILE="${REPORT_DIR}/violation-report-$(date '+%Y-%m-%d_%H-%M-%S').md"

echo ""

if [ "$VIOLATIONS" -gt 0 ]; then

  # ─── Save report to file ──────────────────────────────────────────────────
  {
    echo "# Strapi Best Practices — Violation Report"
    echo ""
    echo "**Date:** $(date '+%Y-%m-%d %H:%M:%S')"
    echo "**Branch:** $(git branch --show-current)"
    echo "**Attempted commit by:** $(git config user.name) <$(git config user.email)>"
    echo "**Result: COMMIT BLOCKED**"
    echo ""
    echo "---"
    echo ""
    echo "## Summary"
    echo ""
    echo "| Metric | Value |"
    echo "|--------|-------|"
    echo "| Total violations | **${VIOLATIONS}** |"
    echo "| Staged files checked | $(echo $SCHEMA_FILES $CODE_FILES | wc -w | tr -d ' ') |"
    echo ""
    echo "---"
    echo ""
    echo "## Violations"
    echo ""
    # Strip ANSI color codes for the file report
    echo -e "$REPORT" | sed 's/\x1b\[[0-9;]*m//g' | while IFS= read -r line; do
      if echo "$line" | grep -q '✖'; then
        # Extract rule and file
        rule=$(echo "$line" | sed 's/.*\[\(.*\)\].*/\1/')
        file=$(echo "$line" | sed 's/.*\] *//')
        echo "### ${rule}"
        echo "**File:** \`${file}\`"
      elif [ -n "$line" ]; then
        echo "- ${line}"
        echo ""
      fi
    done
    echo "---"
    echo ""
    echo "## How to Fix"
    echo ""
    echo "1. Review each violation listed above"
    echo "2. Fix the issues in the listed files"
    echo "3. Stage the fixes: \`git add <files>\`"
    echo "4. Try committing again: \`git commit\`"
    echo ""
    echo "## Reference"
    echo ""
    echo "- Best practices: \`.claude/skills/strapi-best-practices/SKILL.md\`"
    echo "- PR checklist: \`.claude/skills/strapi-best-practices/references/checklists.md\`"
  } > "$REPORT_FILE"

  # ─── Print to terminal ────────────────────────────────────────────────────
  echo -e "${RED}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${RED}${BOLD}  COMMIT BLOCKED — Strapi Best Practices Violations Found${NC}"
  echo -e "${RED}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
  echo ""
  echo -e "${YELLOW}${BOLD}  Total violations: ${VIOLATIONS}${NC}"
  echo ""
  echo -e "${BOLD}  Detailed Report:${NC}"
  echo -e "  ─────────────────────────────────────────────────────────────"
  echo ""
  echo -e "$REPORT"
  echo -e "  ─────────────────────────────────────────────────────────────"
  echo ""
  echo -e "${YELLOW}${BOLD}  How to fix:${NC}"
  echo -e "  1. Review each violation above"
  echo -e "  2. Fix the issues in the listed files"
  echo -e "  3. Stage the fixes: ${CYAN}git add <files>${NC}"
  echo -e "  4. Try committing again"
  echo ""
  echo -e "${GREEN}${BOLD}  Report saved to: ${REPORT_FILE}${NC}"
  echo ""
  echo -e "${YELLOW}  Reference: .claude/skills/strapi-best-practices/SKILL.md${NC}"
  echo -e "${RED}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
  echo ""
  exit 1
else
  echo -e "${GREEN}${BOLD}  ✔ All Strapi best practices checks passed!${NC}"
  echo ""
  exit 0
fi
