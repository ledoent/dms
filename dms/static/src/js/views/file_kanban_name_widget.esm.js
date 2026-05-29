// /** ********************************************************************************
//     Copyright 2026 ledoent — Don Kendall
//     License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
//
//     Inline quick-rename for DMS file kanban cards (F3). Double-click the
//     name → editable input → Enter commits, Esc cancels, blur commits-or-
//     cancels based on whether the draft changed. macOS Finder / GNOME Files
//     convention.
//
//     Implemented as a *view widget* rather than inline kanban-arch markup:
//     Odoo 19 forbids every owl event/ref directive (t-on-*, t-ref) inside an
//     ir.ui.view arch because the arch is DB-editable. Widget templates are
//     static assets, so the event wiring is allowed here.
//  **********************************************************************************/
import {registry} from "@web/core/registry";
import {standardWidgetProps} from "@web/views/widgets/standard_widget_props";
import {useService} from "@web/core/utils/hooks";
import {Component, useEffect, useRef, useState} from "@odoo/owl";

export class DmsFileNameWidget extends Component {
    static template = "dms.FileNameWidget";
    static props = {...standardWidgetProps};

    setup() {
        this.renameState = useState({active: false});
        this.input = useRef("input");
        this.notification = useService("notification");
        // Focus + select the input the moment it mounts so the user types
        // over the existing name immediately.
        useEffect(
            (el) => {
                if (el) {
                    el.focus();
                    el.select?.();
                }
            },
            () => [this.input.el]
        );
    }

    get name() {
        return this.props.record.data.name || "";
    }

    startRename(ev) {
        // Swallow the dblclick so it doesn't bubble to the card's global
        // click handler (which would open the side-pane preview on top).
        ev?.stopPropagation?.();
        ev?.preventDefault?.();
        this.renameState.active = true;
    }

    cancelRename() {
        this.renameState.active = false;
    }

    async commitRename() {
        const next = (this.input.el?.value ?? "").trim();
        const current = this.name;
        if (!next || next === current) {
            this.cancelRename();
            return;
        }
        try {
            await this.props.record.update({name: next});
            await this.props.record.save({noReload: true, savePoint: false});
            // The preview pane reads via its own ORM call keyed on recordId;
            // a rename leaves recordId unchanged, so nudge it to re-fetch if
            // this record is the one on screen.
            this.env.dmsKanbanPreview?.notifyChanged?.(this.props.record.resId);
        } catch (e) {
            this.notification.add(e.message || "Rename failed", {type: "danger"});
        }
        this.cancelRename();
    }

    onKeydown(ev) {
        if (ev.key === "Enter") {
            ev.preventDefault();
            this.commitRename();
        } else if (ev.key === "Escape") {
            ev.preventDefault();
            this.cancelRename();
        }
        // Don't let the renderer-level Escape (which closes the preview pane)
        // also fire from inside the rename input.
        ev.stopPropagation();
    }

    stopEvent(ev) {
        ev.stopPropagation();
    }
}

export const dmsFileNameWidget = {
    component: DmsFileNameWidget,
    extractProps: () => ({}),
};

registry.category("view_widgets").add("dms_file_name", dmsFileNameWidget);
