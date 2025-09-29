# Translation Status

Updated: 2025-09-29T13:06:35.157Z

Field: location_text

| Lang | Entries With Key | Missing/Identical to EN | Percent Pending |
|------|------------------|-------------------------|-----------------|
| fr | 121 | 121 | 100.0% |
| de | 121 | 121 | 100.0% |
| it | 121 | 121 | 100.0% |
| ru | 121 | 121 | 100.0% |

Items needing at least one language: 121 / 124

## How to Proceed
1. Provide official translations for each language listed in `translationTodo.location_text` arrays.
2. After filling a translation, remove that language code from the array.
3. When an item has no remaining pending languages, remove the whole `translationTodo` field if empty.
4. Re-run this script to refresh counts.

## Automation Notes
- Identical-to-English strings are treated as pending (assumed placeholder).
- Null/absent keys are also pending.
- dataVersion was bumped to 12.
