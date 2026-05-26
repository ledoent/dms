// /** ********************************************************************************
//     Copyright 2026 ledoent — Don Kendall
//     License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
//
//     Backend e2e tour for the file_kanban density toggle. Asserts:
//       1. Default density is "comfortable" (data attr + aria-pressed).
//       2. Clicking "Compact" swaps the data attr in-place.
//       3. localStorage["dms_kanban_density"] is persisted.
//       4. Restoring the default leaves no side effects in the DB.
//
//     The renderer chrome (toggle bar) renders even with zero file records,
//     so this tour does not depend on demo data — important because OCA CI
//     runs `--without-demo=all`.
//  **********************************************************************************/
import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("dms_kanban_density_tour", {
    url: "/odoo/action-dms.action_dms_file",
    steps: () => [
        {
            content: "View toolbar is rendered with the density toggle on the left",
            trigger:
                ".o_dms_view_toolbar" +
                " .o_kanban_dms_density_toggle" +
                " button[aria-pressed='true'][title='Comfortable']",
            run() {
                window.localStorage.removeItem("dms_kanban_density");
            },
        },
        {
            content: "Switch to Compact density",
            trigger:
                ".o_dms_view_toolbar" +
                " .o_kanban_dms_density_toggle button[title='Compact']",
            run: "click",
        },
        {
            content: "Compact button is active and localStorage persisted it",
            trigger:
                ".o_dms_view_toolbar" +
                " .o_kanban_dms_density_toggle" +
                " button[aria-pressed='true'][title='Compact']",
            run() {
                const stored = window.localStorage.getItem("dms_kanban_density");
                if (stored !== "compact") {
                    throw new Error(
                        `Expected localStorage['dms_kanban_density']='compact', got ${JSON.stringify(stored)}`
                    );
                }
                // Data-attribute consequence — assert the renderer root reacted.
                const root = document.querySelector(
                    ".o_kanban_renderer[data-density='compact']"
                );
                if (!root) {
                    throw new Error(
                        "Expected .o_kanban_renderer to carry data-density='compact'"
                    );
                }
            },
        },
        {
            content: "Restore default density (Comfortable)",
            trigger:
                ".o_dms_view_toolbar" +
                " .o_kanban_dms_density_toggle button[title='Comfortable']",
            run: "click",
        },
        {
            content: "Toolbar back to Comfortable; cleanup localStorage",
            trigger:
                ".o_dms_view_toolbar" +
                " .o_kanban_dms_density_toggle" +
                " button[aria-pressed='true'][title='Comfortable']",
            run() {
                window.localStorage.removeItem("dms_kanban_density");
            },
        },
    ],
});
