// /** ********************************************************************************
//     Copyright 2020 Creu Blanca
//     Copyright 2026 ledoent — Don Kendall
//     License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
//  **********************************************************************************/
import {onMounted, onWillUnmount, useState, useSubEnv} from "@odoo/owl";
import {FileKanbanRecord} from "./file_kanban_record.esm";
import {FilePreviewPane} from "../components/preview/file_preview_pane.esm";
import {KanbanRenderer} from "@web/views/kanban/kanban_renderer";

// Density tiers: "comfortable" (default), "compact", "list".
// Selected value is persisted per-browser via localStorage so it survives
// kanban→form→kanban navigation; sharing across browsers / users is out of
// scope for this iteration.
export const DMS_KANBAN_DEFAULT_DENSITY = "comfortable";
const DMS_KANBAN_DENSITY_KEY = "dms_kanban_density";
const DMS_KANBAN_PREVIEW_KEY = "dms_kanban_preview_pane";
const DMS_KANBAN_DENSITY_OPTIONS = [
    {value: "comfortable", label: "Comfortable", icon: "fa-th-large"},
    {value: "compact", label: "Compact", icon: "fa-th"},
    {value: "list", label: "List", icon: "fa-bars"},
];

function _readStoredDensity() {
    try {
        const stored = window.localStorage.getItem(DMS_KANBAN_DENSITY_KEY);
        if (DMS_KANBAN_DENSITY_OPTIONS.some((o) => o.value === stored)) {
            return stored;
        }
    } catch {
        // LocalStorage may be unavailable (privacy mode, sandboxed iframe).
    }
    return DMS_KANBAN_DEFAULT_DENSITY;
}

function _readStoredPreview() {
    try {
        return window.localStorage.getItem(DMS_KANBAN_PREVIEW_KEY) !== "0";
    } catch {
        return true;
    }
}

export class FileKanbanRenderer extends KanbanRenderer {
    setup() {
        super.setup();
        this.densityState = useState({density: _readStoredDensity()});
        this.previewState = useState({
            open: _readStoredPreview(),
            recordId: null,
        });
        // Expose select callback to descendant FileKanbanRecord instances via
        // env so card clicks route into the renderer's preview state without
        // the records needing a direct reference up the tree.
        useSubEnv({
            dmsKanbanPreview: {
                select: (resId) => this.selectForPreview(resId),
                isOpen: () => this.previewState.open,
            },
        });
        this._onKeyDown = (ev) => {
            if (ev.key === "Escape" && this.previewState.open) {
                if (this.previewState.recordId) {
                    this.closePreview();
                } else {
                    this.togglePreview();
                }
            }
        };
        onMounted(() => window.addEventListener("keydown", this._onKeyDown));
        onWillUnmount(() => window.removeEventListener("keydown", this._onKeyDown));
    }

    get density() {
        return this.densityState.density;
    }

    get densityOptions() {
        return DMS_KANBAN_DENSITY_OPTIONS;
    }

    setDensity(value) {
        this.densityState.density = value;
        try {
            window.localStorage.setItem(DMS_KANBAN_DENSITY_KEY, value);
        } catch {
            // Persistence is best-effort; the in-memory state still applies.
        }
    }

    get previewOpen() {
        return this.previewState.open;
    }

    get previewRecordId() {
        return this.previewState.recordId;
    }

    togglePreview() {
        this.previewState.open = !this.previewState.open;
        try {
            window.localStorage.setItem(
                DMS_KANBAN_PREVIEW_KEY,
                this.previewState.open ? "1" : "0"
            );
        } catch {
            // Persistence is best-effort.
        }
        if (!this.previewState.open) {
            this.previewState.recordId = null;
        }
    }

    closePreview() {
        // The pane header's X button + Escape key both route here. Users
        // expect a full dismissal (pane goes away), not just a deselect
        // — clearing recordId only would leave the pane mounted in its
        // empty "Click any row to preview" state, which reads as "the
        // close button is broken." Persist the closed state so the pane
        // stays hidden after navigation, mirroring `togglePreview()`.
        this.previewState.recordId = null;
        this.previewState.open = false;
        try {
            window.localStorage.setItem(DMS_KANBAN_PREVIEW_KEY, "0");
        } catch {
            // Persistence is best-effort.
        }
    }

    selectForPreview(resId) {
        if (!resId) {
            return;
        }
        this.previewState.open = true;
        this.previewState.recordId = resId;
        try {
            window.localStorage.setItem(DMS_KANBAN_PREVIEW_KEY, "1");
        } catch {
            // Persistence is best-effort.
        }
    }
}

FileKanbanRenderer.components = {
    ...KanbanRenderer.components,
    KanbanRecord: FileKanbanRecord,
    FilePreviewPane,
};
