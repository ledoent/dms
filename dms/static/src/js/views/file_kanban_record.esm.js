// /** ********************************************************************************
//     Copyright 2024 Subteno - Timothée Vannier (https://www.subteno.com).
//     Copyright 2026 ledoent — Don Kendall
//     License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
//  **********************************************************************************/
import {KanbanRecord} from "@web/views/kanban/kanban_record";

export class FileKanbanRecord extends KanbanRecord {
    /**
     * @override
     *
     * Every kanban click — including the file icon — routes through the
     * renderer's side-pane preview state. Previously the icon had its own
     * branch that opened Odoo's built-in modal `fileViewer`; that detour
     * was inconsistent with the rest of the card (which already selected
     * for the side-pane) and meant the registered handler chain in
     * `dms.preview_handlers` never saw the click.
     */
    onGlobalClick(ev) {
        if (this.env.dmsKanbanPreview && this.props.record.resId) {
            // Transfer the --previewing ring to this card. Clear any existing
            // selection first so only one card ever carries the ring at a time.
            this.el
                ?.closest(".o_kanban_renderer")
                ?.querySelectorAll(".o_kanban_dms_card--previewing")
                .forEach((el) => el.classList.remove("o_kanban_dms_card--previewing"));
            this.el
                ?.querySelector(".o_kanban_dms_card")
                ?.classList.add("o_kanban_dms_card--previewing");

            this.env.dmsKanbanPreview.select(this.props.record.resId);
            ev.preventDefault?.();
            ev.stopPropagation?.();
            return;
        }
        return super.onGlobalClick(ev);
    }
}
