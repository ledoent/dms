// Copyright 2026 ledoent — Don Kendall
// License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

// ===========================================================================
//  Extension point for DMS file preview pane actions
// ===========================================================================
//
// The `dms` module ships three built-in actions (Download, Share, Open form).
// Downstream modules register additional actions here — e.g.
// `dms_auto_classification` adds "Re-classify", `dms_libreoffice_preview`
// adds "Open in LibreOffice".
//
// ---------------------------------------------------------------------------
//  Contract
// ---------------------------------------------------------------------------
//
// An action entry is a plain object:
//
//     {
//         label: "Re-classify",           // button label (short)
//         icon:  "fa-magic",              // Font Awesome icon class (no "fa ")
//         match: (file) => bool,          // OPTIONAL — show only for matching
//                                         //   files; default: always show
//         score: 10,                      // OPTIONAL — higher = leftmost;
//                                         //   built-ins use 0
//         onClick: (file, services) => {}, // called with the file record and
//                                         //   an {action, orm, notification}
//                                         //   services object
//         primary: false,                 // OPTIONAL — render as btn-primary
//     }
//
// Registering from an external module:
//
//     import {registry} from "@web/core/registry";
//
//     registry.category("dms.preview_actions").add("reclassify", {
//         label: "Re-classify",
//         icon: "fa-magic",
//         match: (file) => Boolean(file.classification_template_id),
//         score: 5,
//         onClick: async (file, {action}) => {
//             await action.doAction("dms_auto_classification.wizard_action", {
//                 additionalContext: {active_ids: [file.id]},
//             });
//         },
//     });
//
// ---------------------------------------------------------------------------
//  Lookup semantics
// ---------------------------------------------------------------------------
//
// `getPreviewActions(file)` returns all matching actions sorted descending
// by score. Built-in Download/Share/Open actions are NOT in this registry —
// they remain as hardcoded buttons in FilePreviewPane so their exact DOM
// position and styling stays stable. This registry is for *extra* actions
// that modules slot in after the three core buttons.

import {registry} from "@web/core/registry";

const CATEGORY = "dms.preview_actions";

export function getPreviewActions(file) {
    if (!file) {
        return [];
    }
    const entries = registry.category(CATEGORY).getEntries();
    const matches = entries
        .map(([key, a]) => ({key, ...a}))
        .filter((a) => (a.match ? a.match(file) : true));
    matches.sort((a, b) => (b.score || 0) - (a.score || 0));
    return matches;
}

export function previewActionRegistry() {
    return registry.category(CATEGORY);
}
