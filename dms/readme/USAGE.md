The best way to manage the documents is to switch to the Documents view.
Existing documents can be managed there and new documents can be
created.

## Portal functionality

You can add any portal user to DMS access groups, and then allow that
group in directories, so they will see in the portal such directories
and their files. Another possibility is to click on "Share" button
inside a directory or a file for obtaining a tokenized link for single
access to that resource, no matter if logged or not.

## UI

The 19.0 release ships a refreshed visual layer across every DMS
surface. The vocabulary is consistent everywhere so a directory or a
file looks like the same component whether you are looking at it on the
backend kanban, the form view hero, or the portal card grid.

- **Accent system** — every card carries a `--dms-accent` color driven
  by data attributes on the markup. File cards key off the file
  extension (`data-ext`); directory cards key off the first letter of
  the directory name (`data-initial`). The same palette colors the
  card spine, the accent tile, and the metadata chips, so each
  identity reads as one visual unit.
- **Card chrome (kanban)** — every kanban card gets a 3px accent spine
  on the left edge and a soft hover lift. A 56px tile on the left
  holds the folder icon (for directories) or the mimetype icon (for
  files), tinted with the card's accent. Image-mimetype files swap the
  tile for the actual thumbnail so photos read as photos.
- **Metadata chips** — directory cards expose subdirectory count, file
  count, human size, and the last-writer initials chip. File cards
  expose human size, an uppercase extension chip (monospaced, tinted
  by extension), a lock status chip when applicable, and the creator
  initials chip.
- **Form-view hero** — directory and file forms get a condensed hero
  block: a tinted square hero icon, the record name, a pill row of
  metadata (size, extension, lock state, root state), and a path
  breadcrumb. No notebook tab clicking required to see the basics.
- **Portal grid** — `/my/dms` renders directories and files as a
  responsive card grid. Each card has a mimetype-tinted left stripe,
  a soft top-edge gradient, and a lift-on-hover. The extension shows
  as a monospaced badge so users can scan a long file list quickly.
- **Searchpanel** — section headers use the system monospace at 11px
  with letter-spacing, and counters get tabular numerals so columns of
  counts line up.
- **Drop zone** — dropping a file onto the file kanban lights up an
  animated marching-dashed overlay with a bobbing cloud-upload glyph,
  so the drop target is unambiguous.

The accent palette + bucket-hash helpers live in
`dms/static/src/scss/_dms_tokens.scss` — the same partial is consumed
by both the backend (`web.assets_backend` → `kanban.scss`) and the
portal (`web.assets_frontend` → `portal.scss`), so adding a new
mimetype only requires touching one map.

### Alignment with Odoo 19 tokens

Every `--dms-*` variable falls back to an Odoo 19 default via
`var(--o-foo-…, #literal)`, so the module stays themable — when a host
project overrides Odoo's `$o-gray-*` palette, our chips and tiles
inherit the new colors automatically. Specifically:

| Surface | Our value | Odoo 19 token | Notes |
| --- | --- | --- | --- |
| Card neutral background | `var(--o-gray-100, #f1f3f5)` | `$o-gray-100: #f8f9fa` | Tile preview state |
| Chip neutral background | `var(--o-gray-200, #e9ecef)` | `$o-gray-200: #e9ecef` | Exact |
| Chip neutral text | `var(--o-gray-800, #495057)` | `$o-gray-800: #343a40` | We go one step lighter for chip contrast against the light bg |
| Subtitle muted text | `var(--o-gray-600, #6c757d)` | `$o-gray-600: #6c757d` | Exact |
| Title text | `var(--o-gray-900, #212529)` | `$o-gray-900: #212529` | Exact |
| Spine width | `3px` | `$o-kanban-color-border-width: 3px` | Exact match — same width Odoo uses for the user-set `highlight_color` border, so the two stack predictably |
| Card tile size | `56×56px` | `$o-kanban-image-width: 64px` | We're 12 % smaller for chip-row density; the kanban grid still aligns since both fit inside the 320px card |
| Chip font family | `var(--bs-font-monospace, monospace)` | `$o-font-family-monospace: SFMono-Regular, Menlo, Monaco, Consolas, ...` | Bootstrap variable that Odoo populates |
| Chip font size | `11px` | `$o-font-size-base-smaller: 12px` | We go one tier smaller for footer-chip density |
| Lock chip warning | `var(--o-warning-100, #fff3cd)` / `--o-warning-800` | `$o-warning: #ffac00` | Odoo's warning palette tints |
| Lock chip success (is_mine) | `var(--o-success-100, #d1e7dd)` / `--o-success-800` | `$o-success: #28a745` | Odoo's success palette tints |
| Brand accent fallback | `var(--o-primary-500, #5b3bd6)` | `$o-community-color: #71639e` | Used only when no `--dms-accent` is set (e.g. unknown file extension) |
| Hover lift | `translateY(-1px)` + `box-shadow: 0 4px 18px rgba(0,0,0,.08)` | none in Odoo core | Added by us; Odoo 19's kanban cards have no hover-lift convention, so this is a deliberate enhancement |

The only token we introduce that has no Odoo counterpart is
`--dms-accent` itself — the per-record hashed tint. By design it's
opt-in (only applied to elements that carry the `o_dms_*` class
ancestry), so it doesn't bleed into Odoo core widgets.

Odoo doesn't publish a formal design-system document for 19.0 — the
authoritative source is `addons/web/static/src/scss/primary_variables.scss`
in `odoo/odoo@19.0`. The rationale for these specific tokens (e.g.
hashing into eight buckets rather than per-extension hard-coding for
directories, dropping the 64→56px tile size, monospace 11px chips) is
documented inline in `dms/static/src/scss/_dms_tokens.scss` and
`kanban.scss`.
