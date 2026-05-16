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
