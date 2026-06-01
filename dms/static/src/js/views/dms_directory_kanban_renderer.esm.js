// Copyright 2026 ledoent — Don Kendall
// License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

import {onWillStart, useState} from "@odoo/owl";
import {DmsStatBar} from "../components/dms_stat_bar.esm";
import {KanbanRenderer} from "@web/views/kanban/kanban_renderer";
import {_t} from "@web/core/l10n/translation";
import {serializeDateTime} from "@web/core/l10n/dates";
import {useService} from "@web/core/utils/hooks";

const {DateTime} = luxon;

export class DmsDirectoryKanbanRenderer extends KanbanRenderer {
    static template = "dms.DirectoryKanbanRenderer";
    static components = {
        ...KanbanRenderer.components,
        DmsStatBar,
    };

    setup() {
        super.setup();
        this.orm = useService("orm");
        this.action = useService("action");
        this.statsState = useState({stats: null});
        onWillStart(async () => {
            this.statsState.stats = await this.orm.call(
                "dms.directory",
                "get_dashboard_stats",
                []
            );
        });
    }

    get stats() {
        return this.statsState.stats;
    }

    // Drill-down from a dashboard tile into the matching file list — the
    // native Odoo-dashboard interaction. "Files" opens all files; "New
    // today" opens files created since local midnight.
    onTileClick(tile) {
        if (tile.action === "files") {
            this.action.doAction("dms.action_dms_file");
        } else if (tile.action === "today") {
            const since = serializeDateTime(DateTime.local().startOf("day"));
            this.action.doAction({
                type: "ir.actions.act_window",
                name: _t("Files added today"),
                res_model: "dms.file",
                views: [
                    [false, "kanban"],
                    [false, "list"],
                ],
                domain: [["create_date", ">=", since]],
                target: "current",
            });
        }
    }
}
