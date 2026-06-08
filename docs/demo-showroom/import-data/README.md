# SunScale Demo Import Data

Last updated: 2026-06-02

Use these files after the `SunScale Geckos - Demo` HighLevel subaccount exists.

## Files

- `contacts.csv`: demo contacts with tags and custom field values.
- `opportunities.csv`: demo lead/sales/shipping opportunities.
- `products.csv`: demo products/offers to create in HighLevel.
- `animals.csv`: demo animal inventory for pages/store sections.
- `custom-values.csv`: account-level values to set after page URLs and location ID exist.
- `smart-lists.csv`: smart-list names, filter summaries, and expected demo records.
- `contact-activity.csv`: pinned contact notes and follow-up tasks for the breeder/admin CRM proof.

## Import Notes

HighLevel may not support direct CSV import for every object type.

If direct import is unavailable:

- use these files as manual build sheets
- create products manually
- create opportunities manually
- use `npm run setup:showroom` only after the new location/config is ready and API scope allows it

The demo contacts use fake addresses and emails. Do not replace them with real customer data.
